const cache=new Map();
const allowed=/^\/(?:networks\/avax\/pools(?:\/0x[0-9a-f]{40}\/(?:trades|ohlcv\/(?:minute|hour|day)))?|search\/pools)$/i;
export function marketMiddleware(req,res,next){
  const incoming=new URL(req.url,'http://localhost');if(!incoming.pathname.startsWith('/api/market/'))return next();
  const path=incoming.pathname.slice('/api/market'.length);
  if(req.method!=='GET'||!allowed.test(path)){res.writeHead(400,{'Content-Type':'application/json'});res.end(JSON.stringify({errors:['Unsupported market request.']}));return;}
  const permitted=new Set(['include','page','query','network','aggregate','limit','currency','token']);
  for(const key of incoming.searchParams.keys())if(!permitted.has(key)){res.writeHead(400);res.end();return;}
  if(path==='/search/pools')incoming.searchParams.set('network','avax');
  const url='https://api.geckoterminal.com/api/v2'+path+incoming.search;
  const entry=cache.get(url);if(entry&&entry.expiry>Date.now()){res.writeHead(entry.status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(entry.body);return;}
  fetch(url,{headers:{accept:'application/json'},signal:AbortSignal.timeout(15000)}).then(async response=>{const body=await response.text();if(response.ok){if(cache.size>100)cache.clear();cache.set(url,{status:response.status,body,expiry:Date.now()+30000});}res.writeHead(response.status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(body);}).catch(()=>{res.writeHead(502,{'Content-Type':'application/json'});res.end(JSON.stringify({errors:['Market data upstream unavailable.']}));});
}
