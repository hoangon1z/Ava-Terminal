import React,{useEffect,useState} from 'react';
import TradingChart from './TradingChart.jsx';
const pool='0x4224f6f4c9280509724db2dbac314621e4465c29';
const short=s=>s.slice(0,8)+'…'+s.slice(-6);
export default function LiveMarket(){
  const[historyBusy,setHistoryBusy]=useState(false),[revision,setRevision]=useState(0);
  async function older(){setHistoryBusy(true);try{const res=await fetch('/api/live/history');if(!res.ok)throw Error('Unable to load older history; retry later.');setRevision(v=>v+1);}catch(e){setError(e.message);}finally{setHistoryBusy(false);}}
  const[now,setNow]=useState(Date.now());
  useEffect(()=>{const timer=setInterval(()=>setNow(Date.now()),5000);return()=>clearInterval(timer);},[]);
  const[interval,setIntervalValue]=useState(60),[bars,setBars]=useState([]),[trades,setTrades]=useState([]),[status,setStatus]=useState(null),[error,setError]=useState(''),[transport,setTransport]=useState(false);
  useEffect(()=>{
    let active=true,request=0;
    const ctrl=new AbortController();
    async function read(){const version=++request;try{const responses=await Promise.all([fetch(`/api/live/candles?interval=${interval}`,{signal:ctrl.signal}),fetch('/api/live/trades',{signal:ctrl.signal})]);if(responses.some(r=>!r.ok))throw Error('Live backend unavailable. Start npm run live.');const[c,t]=await Promise.all(responses.map(r=>r.json()));if(active&&version===request){setBars(c.candles);setTrades(t.trades);setStatus(c.status);setError('');}}catch(e){if(active&&e.name!=='AbortError')setError(e.message);}}
    void read();
    const stream=new EventSource('/api/live/events');
    stream.onopen=()=>{if(active)setTransport(true);};
    stream.onerror=()=>{if(active){setTransport(false);setError('Live connection interrupted; reconnecting. Last data may be stale.');}};
    stream.addEventListener('status',e=>{if(active)setStatus(JSON.parse(e.data));});
    stream.addEventListener('update',()=>void read());
    return()=>{active=false;ctrl.abort();stream.close();};
  },[interval,revision]);
  const fresh=status?.lastSynced&&now-new Date(status.lastSynced).getTime()<45000;
  return <div className="trade-layout"><section className="chart-panel"><div className="token-header"><div><h2>BTC.b <span>/ USDC</span></h2><p>LFJ V2.1 · Avalanche mainnet · <span className={transport&&status?.connected&&fresh&&!status?.error?'positive':'negative'}>{transport&&status?.connected&&fresh&&!status?.error?'LIVE FEED':'DISCONNECTED / SYNCING'}</span></p></div><div className="token-price"><strong>{trades[0]?.price.toLocaleString(undefined,{maximumFractionDigits:2})??'—'}</strong><small>USDC per BTC.b · last captured swap</small></div></div><div className="chart-toolbar"><div>{[[60,'1m'],[300,'5m'],[900,'15m'],[3600,'1H']].map(([n,label])=><button key={n} className={interval===n?'active':''} onClick={()=>setIntervalValue(n)}>{label}</button>)}</div><span>Volume in USDC</span></div>{(error||status?.error)&&<div role="status" className="fuji-error">{error||status.error}</div>}<TradingChart candles={bars} identity={`${pool}:${interval}`} currency="USDC" onLoadHistory={older} historyBusy={historyBusy}/><p className="integration-note">Recent locally captured history only. Empty intervals are not fabricated. Last sync: {status?.lastSynced?new Date(status.lastSynced).toLocaleTimeString():'awaiting backend'}. <a href={`https://build.avax.network/explorer/mainnet/c-chain/address/${pool}`} target="_blank" rel="noreferrer">Pool contract ↗</a></p><div className="recent-title"><h3>Live on-chain trades</h3><span>USDC is not assumed equal to USD</span></div><div className="table-scroll live-trade-list"><table><thead><tr><th>TIME</th><th>SIDE</th><th>BTC.b AMOUNT</th><th>USDC AMOUNT</th><th>TRANSACTION</th></tr></thead><tbody>{trades.slice(0,30).map(t=><tr key={t.id}><td>{new Date(t.timestamp*1000).toLocaleTimeString()}</td><td className={t.side==='buy'?'positive':'negative'}>{t.side.toUpperCase()}</td><td>{(Number(t.rawX)/1e8).toFixed(8)}</td><td>{t.volume.toLocaleString(undefined,{maximumFractionDigits:6})}</td><td><a href={`https://build.avax.network/explorer/mainnet/c-chain/tx/${t.transaction}`} target="_blank" rel="noreferrer">{short(t.transaction)} ↗</a></td></tr>)}</tbody></table></div></section><aside className="order-panel"><div className="order-title"><h2>Trade</h2><span className="chain-chip">MAINNET</span></div><p className="integration-note">BTC.b / USDC · LFJ V2.1</p><div className="preview-notice">Swap routing is not connected yet. The chart price is not an execution quote.</div><button className="secondary full" disabled>Swap unavailable</button><div className="pool-identity"><small>POOL CONTRACT</small><code>{pool}</code><small>BASE TOKEN · BTC.b</small><code>0x152b9d0fdc40c096757f570a51e494bd4b943e50</code><small>QUOTE TOKEN · USDC</small><code>0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e</code></div></aside></div>;
}
