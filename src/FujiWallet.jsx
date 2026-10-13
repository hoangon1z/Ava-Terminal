import React,{useState,useEffect,useCallback,useRef} from 'react';
import {Wallet,ExternalLink,RefreshCw,Copy,Check,Unplug,Info} from 'lucide-react';
import {FUJI,TEAM1_FAUCET,readFujiBalance,switchToFuji} from './fuji.js';
import {discoverCore,CORE_INSTALL} from './core.js';
import {NETWORKS} from './market.js';
export default function FujiWallet({network='fuji',onWallet}){
  const config=NETWORKS[network];
  const [balanceNetwork,setBalanceNetwork]=useState(null);
  const [account,setAccount]=useState(null),[chain,setChain]=useState(null),[balance,setBalance]=useState(null),[busy,setBusy]=useState(false),[error,setError]=useState(''),[copied,setCopied]=useState(false);
  const controller=useRef(null),revision=useRef(0),providerRef=useRef(null);
  const [provider,setProvider]=useState(null);
  useEffect(()=>discoverCore(window,value=>{providerRef.current=value;setProvider(value);}),[]);
  const clearBalance=useCallback(()=>{controller.current?.abort();revision.current++;setBalance(null);setCopied(false);},[]);
  const refresh=useCallback(async(address)=>{controller.current?.abort();const request=new AbortController();controller.current=request;const version=++revision.current;setBalance(null);setError('');try{const value=await readFujiBalance(address,{signal:request.signal,rpc:config.rpc});if(version===revision.current){setBalance(value);setBalanceNetwork(network);}}catch(e){if(e.name!=='AbortError'&&version===revision.current)setError(e.message);}},[config.rpc,network]);
  useEffect(()=>{onWallet?.({account,chain,balance:balanceNetwork===network?balance:null,target:network});},[account,chain,balance,balanceNetwork,network,onWallet]);
  useEffect(()=>{if(account)refresh(account);else clearBalance();return()=>{controller.current?.abort();};},[account,refresh,clearBalance]);
  useEffect(()=>{
    if(!provider?.on)return;
    const accountsChanged=accounts=>{clearBalance();setAccount(accounts[0]??null);setError('');};
    const chainChanged=value=>setChain(value);
    const disconnect=()=>{clearBalance();setAccount(null);setChain(null);};
    provider.on('accountsChanged',accountsChanged);provider.on('chainChanged',chainChanged);provider.on('disconnect',disconnect);
    return()=>{provider.removeListener?.('accountsChanged',accountsChanged);provider.removeListener?.('chainChanged',chainChanged);provider.removeListener?.('disconnect',disconnect);};
  },[clearBalance,provider]);
  async function connect(){window.dispatchEvent(new Event('eip6963:requestProvider'));const core=providerRef.current??window.avalanche;if(typeof core?.request!=='function'){setError('Core Extension not detected. Install Core in Chrome, unlock it, then refresh this page. Opening core.app alone does not inject a wallet.');return;}providerRef.current=core;setProvider(core);setBusy(true);setError('');try{const accounts=await core.request({method:'eth_requestAccounts'});if(!accounts[0])throw new Error('No account selected.');const network=await core.request({method:'eth_chainId'});setAccount(accounts[0]);setChain(network);}catch(e){setError(e.code===4001?'Core connection cancelled.':e.message||'Core connection failed.');}finally{setBusy(false);}}
  async function switchNetwork(){setBusy(true);setError('');try{setChain(await switchToFuji(providerRef.current));if(account)refresh(account);}catch(e){setError(e.code===4001?'Network change cancelled.':e.message||'Network change failed.');}finally{setBusy(false);}}
  async function copy(){try{await navigator.clipboard.writeText(account);setCopied(true);}catch{setError('Could not copy. Select the address shown below instead.');}}
  const isFuji=chain?.toLowerCase()===config.chainId;
  return <section className="fuji-panel" aria-label="Fuji testnet wallet"><div className="fuji-intro"><span className="fuji-icon"><Wallet size={19}/></span><div><h2>{network==='fuji'?'Fuji testnet':'Avalanche mainnet'} <span>{network==='fuji'?'43113':'43114'}</span></h2><p>{network==='fuji'?'Use Team1VN’s faucet AVAX for testnet gas.':'Read your real AVAX balance. Mainnet trading is not enabled.'}</p></div></div><div className="fuji-actions">{!account?<button className="secondary" disabled={busy} onClick={connect}>{busy?'Connecting…':'Connect Core'}</button>:<><div className="fuji-balance"><small>{network==='fuji'?'ON FUJI':'ON MAINNET'} · LIVE RPC</small><strong>{balanceNetwork!==network||balance===null?'—':balance} <span>{network==='fuji'?'test AVAX':'AVAX'}</span></strong></div>{!isFuji&&network==='fuji'&&<button className="secondary" disabled={busy} onClick={switchNetwork}>{busy?'Switching…':'Switch to Fuji'}</button>}<button aria-label="Refresh Fuji balance" className="fuji-action" onClick={()=>refresh(account)}><RefreshCw size={15}/></button><button aria-label="Disconnect local wallet session" className="fuji-action" onClick={()=>{clearBalance();setAccount(null);setChain(null);setError('');}}><Unplug size={15}/></button></>}<a className="faucet-link" href={CORE_INSTALL} target="_blank" rel="noreferrer">Get Core<ExternalLink size={13}/></a>{network==='fuji'&&<a className="faucet-link" href={TEAM1_FAUCET} target="_blank" rel="noreferrer">Team1VN faucet<ExternalLink size={13}/></a>}</div>{account&&<div className="fuji-account"><span className={isFuji?'positive':'network-warning'}>{isFuji?'Wallet on selected network':'Wallet on another network'}</span><code>{account}</code><button aria-label="Copy wallet address" onClick={copy}>{copied?<Check size={13}/>:<Copy size={13}/>}</button><a href={`${config.explorer}/address/${account}`} target="_blank" rel="noreferrer">Explorer<ExternalLink size={12}/></a></div>}{error&&<div className="fuji-error" role="status"><Info size={14}/>{error}</div>}<div className="fuji-note">Balance comes from the selected network’s RPC, independent of your wallet’s active chain. On-chain swaps are not enabled.</div></section>;
}
