export const CORE_RDNS='app.core.extension';
export const CORE_INSTALL='https://join.core.app/';
// Explicit Core identity: never fall back to the shared window.ethereum slot.
export function discoverCore(target,onProvider){
  const announce=event=>{const detail=event.detail;if(detail?.info?.rdns===CORE_RDNS&&typeof detail.provider?.request==='function')onProvider(detail.provider);};
  target.addEventListener('eip6963:announceProvider',announce);
  target.dispatchEvent(new Event('eip6963:requestProvider'));
  if(typeof target.avalanche?.request==='function')onProvider(target.avalanche);
  return ()=>target.removeEventListener('eip6963:announceProvider',announce);
}
