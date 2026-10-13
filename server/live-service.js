import {mkdirSync} from 'node:fs';
import {createServer} from 'node:http';
import {fileURLToPath} from 'node:url';
import {LiveStore,POOL,SWAP_TOPIC,decodeSwap} from './live-store.js';

mkdirSync(new URL('../data/',import.meta.url),{recursive:true});
const store=new LiveStore(fileURLToPath(new URL('../data/live.sqlite',import.meta.url)));
const rpcUrl=process.env.AVA_RPC_HTTP ?? 'https://api.avax.network/ext/bc/C/rpc';
const wsUrl=process.env.AVA_RPC_WS ?? 'wss://api.avax.network/ext/bc/C/ws';
const clients=new Set();
const status={pool:POOL,network:43114,pair:'BTC.b/USDC',priceCurrency:'USDC',volumeCurrency:'USDC',connected:false,syncing:false,checkpoint:store.checkpoint()??null,lastSynced:null,error:null};
let stopped=false,ws,reconnectTimer,attempt=0;
let historyBusy=false,historyFloor=null;
async function loadHistory(){
  if(historyBusy)return;historyBusy=true;
  try{
    const earliest=store.db.prepare('SELECT MIN(block) AS block FROM trades').get().block;
    const end=(historyFloor??earliest??store.checkpoint())-1;
    if(!Number.isFinite(end)||end<0)throw Error('Wait for initial sync');
    const from=Math.max(0,end-999),logs=await rpc('eth_getLogs',[{address:POOL,topics:[SWAP_TOPIC],fromBlock:hex(from),toBlock:hex(end)}]);
    const blocks=new Map(),trades=[];
    for(const log of logs){if(!blocks.has(log.blockNumber))blocks.set(log.blockNumber,await rpc('eth_getBlockByNumber',[log.blockNumber,false]));const block=blocks.get(log.blockNumber);if(!block||block.hash!==log.blockHash)throw Error('History changed; retry');trades.push(decodeSwap(log,Number(BigInt(block.timestamp))));}
    store.replaceRange(from,end,trades,false);historyFloor=from;publish('update',{status});
    return {from,to:end,swaps:trades.length};
  }finally{historyBusy=false;}
}
const hex=n=>'0x'+n.toString(16);
async function rpc(method,params){
  const response=await fetch(rpcUrl,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:1,method,params}),signal:AbortSignal.timeout(15000)});
  const json=await response.json();if(!response.ok||json.error)throw Error(json.error?.message??`RPC HTTP ${response.status}`);return json.result;
}
function publish(event='status',payload=status){for(const res of clients){if(res.writableLength>262144){res.destroy();clients.delete(res);}else res.write(`event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`);}}
async function sync(){
  if(stopped||status.syncing)return;
  status.syncing=true;
  try {
    const head=Number(BigInt(await rpc('eth_blockNumber',[])));
    let from=Math.max(0,(store.checkpoint()??(head-500))-32);
    if(from>head)throw Error('RPC head behind checkpoint');
    for(;from<=head&&!stopped;from+=100){
      const to=Math.min(head,from+99);
      const logs=await rpc('eth_getLogs',[{address:POOL,topics:[SWAP_TOPIC],fromBlock:hex(from),toBlock:hex(to)}]);
      const blocks=new Map(),trades=[];
      for(const log of logs){
        if(log.removed)continue;
        if(!blocks.has(log.blockNumber))blocks.set(log.blockNumber,await rpc('eth_getBlockByNumber',[log.blockNumber,false]));
        const block=blocks.get(log.blockNumber);
        if(!block||block.hash!==log.blockHash)throw Error('Chain changed during backfill; retrying');
        trades.push(decodeSwap(log,Number(BigInt(block.timestamp))));
      }
      store.replaceRange(from,to,trades);status.checkpoint=to;
    }
    status.lastSynced=new Date().toISOString();status.error=null;
    publish('update',{status,trades:store.trades(30),candles:store.bars(60)});
  }catch(error){status.error=error.message;}
  finally{status.syncing=false;publish();}
}
function connect(){
  if(stopped)return;
  ws=new WebSocket(wsUrl);
  ws.onopen=()=>{ws.send(JSON.stringify({jsonrpc:'2.0',id:1,method:'eth_subscribe',params:['logs',{address:POOL,topics:[SWAP_TOPIC]}]}));};
  ws.onmessage=e=>{try{const message=JSON.parse(e.data);if(message.error){status.error=message.error.message;ws.close();}else if(message.id===1&&message.result){status.connected=true;attempt=0;publish();void sync();}else if(message.params?.result)void sync();}catch(error){status.error=error.message;publish();}};
  ws.onerror=()=>{status.error='WebSocket transport error';publish();};
  ws.onclose=()=>{status.connected=false;publish();if(!stopped)reconnectTimer=setTimeout(connect,Math.min(30000,1000*2**Math.min(attempt++,5)));};
}
const server=createServer((req,res)=>{
  const url=new URL(req.url,'http://localhost');
  if(req.method!=='GET'){res.writeHead(405);res.end();return;}
  const json=data=>{res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(data));};
  if(url.pathname==='/api/live/status')return json(status);
  if(url.pathname==='/api/live/history'){
    if(historyBusy){res.writeHead(409);res.end();return;}
    loadHistory().then(json).catch(error=>{res.writeHead(502,{'Content-Type':'application/json'});res.end(JSON.stringify({error:error.message}));});return;
  }
  if(url.pathname==='/api/live/trades')return json({status,trades:store.trades()});
  if(url.pathname==='/api/live/candles'){
    const interval=Number(url.searchParams.get('interval')??60);
    if(![60,300,900,3600,86400].includes(interval)){res.writeHead(400);res.end();return;}
    return json({status,interval,candles:store.bars(interval)});
  }
  if(url.pathname==='/api/live/events'){
    if(clients.size>=50){res.writeHead(503);res.end();return;}
    res.writeHead(200,{'Content-Type':'text/event-stream','Cache-Control':'no-cache','Connection':'keep-alive'});
    res.write(`event: status\ndata: ${JSON.stringify(status)}\n\n`);clients.add(res);req.on('close',()=>clients.delete(res));return;
  }
  res.writeHead(404);res.end();
});
const poll=setInterval(()=>void sync(),15000);
const heartbeat=setInterval(()=>{for(const res of clients)res.write(': heartbeat\n\n');},20000);
server.listen(Number(process.env.AVA_LIVE_PORT??5174),'127.0.0.1',()=>{console.log('Ava live API: http://127.0.0.1:5174/api/live/status');connect();void sync();});
function shutdown(){stopped=true;clearInterval(poll);clearInterval(heartbeat);clearTimeout(reconnectTimer);ws?.close();for(const res of clients)res.end();server.close(()=>{store.close();process.exit(0);});}
process.on('SIGINT',shutdown);process.on('SIGTERM',shutdown);
