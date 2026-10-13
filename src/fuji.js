export const FUJI = Object.freeze({chainId:'0xa869',chainName:'Avalanche Fuji C-Chain',nativeCurrency:{name:'AVAX',symbol:'AVAX',decimals:18},rpcUrls:['https://api.avax-test.network/ext/bc/C/rpc'],blockExplorerUrls:['https://build.avax.network/explorer/fuji/c-chain']});
export const TEAM1_FAUCET='https://team1vn.xyz/faucet.html';
export function formatAvax(hex){
  if(!/^0x[0-9a-f]+$/i.test(hex))throw new Error('Invalid AVAX balance response.');
  const wei=BigInt(hex),whole=wei/10n**18n,fractional=(wei%10n**18n).toString().padStart(18,'0').slice(0,6).replace(/0+$/,'');
  return `${whole}${fractional?'.'+fractional:''}`;
}
export async function readFujiBalance(address,{fetcher=fetch,signal,rpc=FUJI.rpcUrls[0]}={}){
  if(!/^0x[0-9a-f]{40}$/i.test(address))throw new Error('Invalid wallet address.');
  const response=await fetcher(rpc,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:1,method:'eth_getBalance',params:[address,'latest']}),signal});
  if(!response.ok)throw new Error('Fuji RPC unavailable. Try refreshing.');
  const data=await response.json();if(data.error)throw new Error(data.error.message||'Fuji RPC returned an error.');
  return formatAvax(data.result);
}
export async function switchToFuji(provider){
  try{await provider.request({method:'wallet_switchEthereumChain',params:[{chainId:FUJI.chainId}]});}
  catch(e){if(Number(e.code)!==4902)throw e;await provider.request({method:'wallet_addEthereumChain',params:[FUJI]});}
  const chain=await provider.request({method:'eth_chainId'});
  if(chain.toLowerCase()!==FUJI.chainId)throw new Error('Fuji was not selected. Switch your wallet to Fuji and retry.');
  return chain;
}
