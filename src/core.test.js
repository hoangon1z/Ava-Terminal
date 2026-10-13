import test from 'node:test';
import assert from 'node:assert/strict';
import {discoverCore,CORE_RDNS} from './core.js';
function announce(target,rdns,provider){const event=new Event('eip6963:announceProvider');event.detail={info:{rdns},provider};target.dispatchEvent(event);}
test('Core discovery ignores MetaMask and Phantom, without requesting wallet accounts',()=>{
  const target=new EventTarget(),selected=[];let requests=0;const core={request:()=>{requests++;}};
  target.ethereum={request:()=>{throw new Error('Must never use generic provider');}};
  target.addEventListener('eip6963:requestProvider',()=>{announce(target,'io.metamask',target.ethereum);announce(target,'app.phantom',{request(){}});announce(target,CORE_RDNS,core);});
  const cleanup=discoverCore(target,p=>selected.push(p));assert.deepEqual(selected,[core]);assert.equal(requests,0);
  cleanup();announce(target,CORE_RDNS,core);assert.equal(selected.length,1);
});
test('Core legacy handle works and missing Core does not select other wallets',()=>{
  const target=new EventTarget(),core={request(){}};target.avalanche=core;let result;discoverCore(target,p=>result=p)();assert.equal(result,core);
  const other=new EventTarget();other.ethereum={request(){}};let called=false;discoverCore(other,()=>called=true)();assert.equal(called,false);
});
