import test from 'node:test';
import assert from 'node:assert/strict';
import {number,normalizePools,fetchCandles,safeImageUrl} from './market.js';
test('token avatars only accept credential-free HTTPS metadata',()=>{assert.equal(safeImageUrl('https://coin-images.coingecko.com/a.png'),'https://coin-images.coingecko.com/a.png');for(const url of ['javascript:alert(1)','http://example.com/a.png','https://user:password@example.com/a.png',undefined])assert.equal(safeImageUrl(url),null);});
test('missing metrics stay unknown rather than becoming zero',()=>{for(const v of [null,undefined,'','NaN'])assert.equal(number(v),null);assert.equal(number('0'),0);assert.equal(number('12.34'),12.34);});
test('market adapter keeps pool identity and excludes other networks',()=>{
  const addr='0x'+'a'.repeat(40);const pool={id:'avax_'+addr,attributes:{address:addr,name:'AAA / USDC',base_token_price_usd:'1.2',market_cap_usd:null,fdv_usd:'999999',reserve_in_usd:'100',volume_usd:{h24:'0'}},relationships:{base_token:{data:{id:'avax_token'}},dex:{data:{id:'real-dex'}}}};
  const data=normalizePools({data:[pool,{...pool,id:'eth_'+addr}],included:[{id:'avax_token',attributes:{symbol:'AAA',address:'0x'+'b'.repeat(40)}}]});
  assert.equal(data.length,1);assert.equal(data[0].address,addr);assert.equal(data[0].symbol,'AAA');assert.equal(data[0].cap,null);assert.equal(data[0].volume,0);assert.equal(data[0].change,null);assert.equal(data[0].price,1.2);
});
test('invalid pool is rejected before requesting candle data',async()=>{await assert.rejects(fetchCandles('bad','1H'),/Invalid/);});
