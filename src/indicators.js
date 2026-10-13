export function sma(candles,period=20){
  const result=[];let sum=0;
  for(let i=0;i<candles.length;i++){sum+=candles[i].close;if(i>=period)sum-=candles[i-period].close;if(i>=period-1)result.push({time:candles[i].time,value:sum/period});}
  return result;
}
export function ema(candles,period=20){
  if(candles.length<period)return [];
  let value=candles.slice(0,period).reduce((s,c)=>s+c.close,0)/period;
  const result=[{time:candles[period-1].time,value}],alpha=2/(period+1);
  for(let i=period;i<candles.length;i++){value+=alpha*(candles[i].close-value);result.push({time:candles[i].time,value});}
  return result;
}
