import test from 'node:test';
import assert from 'node:assert/strict';
import {LiveStore,candles} from './live-store.js';
test('range replacement deduplicates, persists checkpoint and removes orphan trades',()=>{
  const store=new LiveStore(':memory:');
  const t={id:'tx:0',block:10,logIndex:0,timestamp:60,price:10,volume:2};
  store.replaceRange(10,10,[t,t]);assert.equal(store.trades().length,1);assert.equal(store.checkpoint(),10);
  store.replaceRange(10,11,[]);assert.equal(store.trades().length,0);assert.equal(store.checkpoint(),11);store.close();
});
test('candles aggregate actual trades without inventing empty candles',()=>{
  assert.deepEqual(candles([{timestamp:60,price:10,volume:2},{timestamp:65,price:12,volume:3},{timestamp:180,price:9,volume:1}],60),[{time:60,open:10,high:12,low:10,close:12,volume:5},{time:180,open:9,high:9,low:9,close:9,volume:1}]);
});
test('older history does not move live checkpoint backwards',()=>{
  const store=new LiveStore(':memory:');store.replaceRange(100,101,[]);
  store.replaceRange(50,60,[{id:'old',block:55,logIndex:0,timestamp:60,price:10,volume:2}],false);
  assert.equal(store.checkpoint(),101);assert.equal(store.trades().length,1);store.close();
});
