// Read-only connectivity probe. Never requests wallet access or sends transactions.
const address = process.env.PROBE_POOL ?? '0x4224f6f4c9280509724db2dbac314621e4465c29';
const rpcUrl = 'https://api.avax.network/ext/bc/C/rpc';
async function rpc(method, params) {
  const response = await fetch(rpcUrl, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:1,method,params}),signal:AbortSignal.timeout(15000)});
  const data = await response.json();
  if (!response.ok || data.error) throw Error(JSON.stringify(data.error ?? response.status));
  return data.result;
}
const signature = 'Swap(address,address,uint24,bytes32,bytes32,uint24,bytes32,bytes32)';
const topic = await rpc('web3_sha3', ['0x'+Buffer.from(signature).toString('hex')]);
const start = await rpc('eth_blockNumber', []);
const filter = {address,topics:[topic]};
const recent = await rpc('eth_getLogs',[{...filter,fromBlock:'0x'+(BigInt(start)-500n).toString(16),toBlock:start}]);
console.log(JSON.stringify({phase:'history',address,start,swapTopic:topic,swaps:recent.length}));
const received = [];
async function listen(duration) { return new Promise((resolve,reject)=>{
  const ws = new WebSocket('wss://api.avax.network/ext/bc/C/ws');
  const timer = setTimeout(()=>{ws.close();resolve();},duration);
  ws.onopen=()=>ws.send(JSON.stringify({jsonrpc:'2.0',id:1,method:'eth_subscribe',params:['logs',filter]}));
  ws.onmessage=e=>{
    const message=JSON.parse(e.data);
    if(message.error){clearTimeout(timer);ws.close();reject(Error(JSON.stringify(message.error)));}
    else if(message.result) console.log(JSON.stringify({phase:'subscribed',id:message.result}));
    else if(message.params?.result){received.push(message.params.result);console.log(JSON.stringify({phase:'live',log:message.params.result}));}
  };
  ws.onerror=()=>{clearTimeout(timer);ws.close();reject(Error('WebSocket failed'));};
}); }
await listen(45000);
const disconnectedAt = await rpc('eth_blockNumber', []);
console.log(JSON.stringify({phase:'intentional-disconnect',block:disconnectedAt}));
await new Promise(resolve=>setTimeout(resolve,30000));
await listen(45000);
const end = await rpc('eth_blockNumber', []);
const backfill = await rpc('eth_getLogs',[{...filter,fromBlock:start,toBlock:end}]);
const key=l=>`${l.transactionHash}:${l.logIndex}`;
async function call(target,signature){const hash=await rpc('web3_sha3',['0x'+Buffer.from(signature).toString('hex')]);return rpc('eth_call',[{to:target,data:hash.slice(0,10)},'latest']);}
const tokenX='0x'+(await call(address,'getTokenX()')).slice(-40);
const tokenY='0x'+(await call(address,'getTokenY()')).slice(-40);
const decimalsX=Number(BigInt(await call(tokenX,'decimals()')));
const decimalsY=Number(BigInt(await call(tokenY,'decimals()')));
function units(n,d){const scale=10n**BigInt(d);return `${n/scale}.${(n%scale).toString().padStart(d,'0')}`;}
function decode(log){const words=log.data.slice(2).match(/.{64}/g);const packed=i=>{const n=BigInt('0x'+words[i]);return [n&((1n<<128n)-1n),n>>128n];};const input=packed(1),output=packed(2);return {tokenX,tokenY,amountXIn:units(input[0],decimalsX),amountYIn:units(input[1],decimalsY),amountXOut:units(output[0],decimalsX),amountYOut:units(output[1],decimalsY)};}
const keys=new Set(backfill.map(key));
const gapEnd = '0x'+(BigInt(disconnectedAt)+1n).toString(16);
const recoveredOnly = backfill.filter(l=>BigInt(l.blockNumber)>=BigInt(gapEnd)&&!received.some(r=>key(r)===key(l)));
const sample=received[0] ?? recent.at(-1);
let receiptVerified=false;
if(sample){const receipt=await rpc('eth_getTransactionReceipt',[sample.transactionHash]);receiptVerified=receipt.logs.some(l=>key(l)===key(sample)&&l.data===sample.data&&l.address===address);}
if(sample)console.log(JSON.stringify({phase:'decoded-swap',transaction:sample.transactionHash,...decode(sample)}));
const sampleRecovered = recoveredOnly[0];
let recoveryReceiptVerified = false;
if(sampleRecovered){const receipt=await rpc('eth_getTransactionReceipt',[sampleRecovered.transactionHash]);recoveryReceiptVerified=receipt.logs.some(l=>key(l)===key(sampleRecovered)&&l.data===sampleRecovered.data);}
console.log(JSON.stringify({phase:'summary',address,liveSwaps:received.length,backfillSwaps:backfill.length,recoveredOnly:recoveredOnly.length,liveFoundInBackfill:received.length>0&&received.every(l=>keys.has(key(l))),receiptVerified,recoveryReceiptVerified,transaction:sample?.transactionHash,recoveryTransaction:sampleRecovered?.transactionHash, note:'Short probe only; not an uptime or latency guarantee. Reconnected and backfilled block range; production persistence/reorg handling not implemented.'}));
