import React,{useState} from 'react';
export default function TokenAvatar({pool}){
  const[failed,setFailed]=useState(null);
  const src=pool.imageUrl;
  return <span className="coin token-avatar" title={pool.baseName??pool.symbol}>
    {src&&failed!==src?<img src={src} alt={`${pool.symbol} logo`} loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={()=>setFailed(src)}/>:<span aria-label={`${pool.symbol} logo unavailable`}>{pool.symbol?.slice(0,2)??'?'}</span>}
  </span>;
}
