import test from 'node:test';
import assert from 'node:assert/strict';
import {sma,ema} from './indicators.js';
const candles=[1,2,3,4].map((close,time)=>({close,time}));
test('SMA warms up and averages actual closes',()=>{assert.deepEqual(sma(candles,3),[{time:2,value:2},{time:3,value:3}]);assert.deepEqual(sma(candles,20),[]);});
test('EMA starts from SMA seed and updates deterministically',()=>{assert.deepEqual(ema(candles,3),[{time:2,value:2},{time:3,value:3}]);assert.deepEqual(ema(candles,20),[]);});
