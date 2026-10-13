import React,{useEffect,useRef,useState} from 'react';
import {createChart,CandlestickSeries,HistogramSeries,LineSeries} from 'lightweight-charts';
import {sma,ema} from './indicators.js';
export default function TradingChart({candles,identity,currency='USD',onLoadHistory,historyBusy=false}){
 const host=useRef(),api=useRef(),history=useRef(),[legend,setLegend]=useState(null),[zone,setZone]=useState('UTC'),[expanded,setExpanded]=useState(false),[showSma,setShowSma]=useState(false),[showEma,setShowEma]=useState(false);
 history.current={load:onLoadHistory,busy:historyBusy};
 useEffect(()=>{
 const chart=createChart(host.current,{autoSize:true,height:450,layout:{background:{color:'#0b1016'},textColor:'#8291a6',attributionLogo:true,fontSize:11},grid:{vertLines:{color:'#131c26'},horzLines:{color:'#18222d'}},timeScale:{timeVisible:true,barSpacing:8,rightOffset:5},rightPriceScale:{borderColor:'#24303d',scaleMargins:{top:.12,bottom:.12}}});
 const price=chart.addSeries(CandlestickSeries,{upColor:'#43d8aa',downColor:'#ee6977',wickUpColor:'#43d8aa',wickDownColor:'#ee6977',borderVisible:false});
 const volume=chart.addSeries(HistogramSeries,{priceFormat:{type:'volume'},lastValueVisible:false,priceLineVisible:false},1);
 chart.panes()[1].setHeight(90);volume.priceScale().applyOptions({scaleMargins:{top:.15,bottom:0}});
 chart.subscribeCrosshairMove(e=>{const bar=e.seriesData.get(price),vol=e.seriesData.get(volume);setLegend(bar?{...bar,volume:vol?.value}:null);});
 const average=chart.addSeries(LineSeries,{color:'#e7be67',lineWidth:1,priceLineVisible:false,lastValueVisible:false,visible:false});
 const exponential=chart.addSeries(LineSeries,{color:'#8395ff',lineWidth:1,priceLineVisible:false,lastValueVisible:false,visible:false});
 let lastFrom=null,lastRequest=0;
 chart.timeScale().subscribeVisibleLogicalRangeChange(range=>{
  if(!range)return;
  const left=lastFrom;lastFrom=range.from;
  if(api.current?.updating||!api.current?.fitted)return;
  if(range.from<0&&left!==null&&range.from<left-1&&history.current?.load&&!history.current.busy&&Date.now()-lastRequest>5000){lastRequest=Date.now();void history.current.load();}
 });
 api.current={chart,price,volume,average,exponential,fitted:false};return()=>{api.current=null;chart.remove();};
 },[identity]);
 useEffect(()=>{api.current?.chart.applyOptions({height:expanded?640:450,localization:{timeFormatter:time=>new Date(Number(time)*1000).toLocaleString('en-GB',{timeZone:zone})}});},[expanded,zone,identity]);
 useEffect(()=>{
 if(!api.current)return;api.current.updating=true;const range=api.current.chart.timeScale().getVisibleLogicalRange();
 const added=api.current.firstTime?candles.filter(c=>c.time<api.current.firstTime).length:0;
 api.current.price.setData(candles.map(({time,open,high,low,close})=>({time,open,high,low,close})));
 api.current.volume.setData(candles.map(c=>({time:c.time,value:c.volume,color:c.close>=c.open?'#43d8aa80':'#ee697780'})));
 api.current.average.setData(sma(candles));api.current.exponential.setData(ema(candles));
 if(candles.length&&!api.current.fitted){api.current.chart.timeScale().setVisibleLogicalRange({from:Math.max(-5,candles.length-90),to:candles.length+5});api.current.fitted=true;}
 else if(range&&candles.length)api.current.chart.timeScale().setVisibleLogicalRange({from:range.from+added,to:range.to+added});
 api.current.firstTime=candles[0]?.time;
 api.current.updating=false;
 },[candles,identity]);
 useEffect(()=>{api.current?.average.applyOptions({visible:showSma});api.current?.exponential.applyOptions({visible:showEma});},[showSma,showEma,identity]);
 const bar=legend??candles.at(-1),fmt=n=>n==null?'—':n.toLocaleString('en-US',{maximumFractionDigits:4});
 return <div className={'terminal-chart '+(expanded?'chart-expanded':'')}><div className="terminal-chart-tools"><span>CANDLES / {currency}</span><div>{onLoadHistory&&<button disabled={historyBusy} onClick={onLoadHistory}>{historyBusy?'Loading…':'Load older candles'}</button>}<button aria-pressed={showSma} onClick={()=>setShowSma(v=>!v)}>SMA 20</button><button aria-pressed={showEma} onClick={()=>setShowEma(v=>!v)}>EMA 20</button><select aria-label="Chart timezone" value={zone} onChange={e=>setZone(e.target.value)}><option value="UTC">UTC</option><option value="Asia/Ho_Chi_Minh">UTC+7</option></select><button onClick={()=>api.current?.chart.timeScale().scrollToRealTime()}>Latest</button><button onClick={()=>api.current?.chart.timeScale().setVisibleLogicalRange({from:Math.max(-5,candles.length-90),to:candles.length+5})}>Reset view</button><button onClick={()=>setExpanded(v=>!v)}>{expanded?'Close expanded':'Expand'}</button></div></div><div className="ohlcv-legend">{['open','high','low','close'].map(k=><span key={k}>{k[0].toUpperCase()} <b>{fmt(bar?.[k])}</b></span>)}<span>VOL <b>{fmt(bar?.volume)}</b></span></div><div ref={host} role="img" aria-label={`TradingView candlestick chart in ${currency}`} style={{height:expanded?640:450,width:'100%'}}/><div className="chart-caption">Charting by <a href="https://www.tradingview.com/" target="_blank" rel="noreferrer">TradingView Lightweight Charts™</a> · Volume / {currency}{(showSma||showEma)&&candles.length<20&&<span> · Indicators need 20 observed candles</span>}</div></div>;
}
