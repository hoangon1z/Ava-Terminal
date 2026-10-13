import {DatabaseSync} from 'node:sqlite';

export const POOL = '0x4224f6f4c9280509724db2dbac314621e4465c29';
export const SWAP_TOPIC = '0xad7d6f97abf51ce18e17a38f4d70e975be9c0708474987bb3e26ad21bd93ca70';
export function decodeSwap(log, timestamp) {
  if (log.address.toLowerCase() !== POOL || log.topics[0] !== SWAP_TOPIC || !/^0x[0-9a-f]{384}$/i.test(log.data)) throw Error('Invalid supported pool swap');
  const words = log.data.slice(2).match(/.{64}/g);
  const unpack = i => {const n = BigInt('0x' + words[i]); return [n & ((1n << 128n) - 1n), n >> 128n];};
  const input = unpack(1), output = unpack(2);
  const x = input[0] || output[0], y = input[1] || output[1];
  if (!x || !y) throw Error('Swap has no measurable exchange');
  return {id:`${log.transactionHash}:${log.logIndex}`,block:Number(BigInt(log.blockNumber)),blockHash:log.blockHash,logIndex:Number(BigInt(log.logIndex)),transaction:log.transactionHash,timestamp,side:input[0]?'sell':'buy',rawX:x.toString(),rawY:y.toString(),price:(Number(y)/1e6)/(Number(x)/1e8),volume:Number(y)/1e6};
}
export function candles(trades, interval) {
  const bars = new Map();
  for (const t of trades) {
    const time = Math.floor(t.timestamp / interval) * interval;
    let bar = bars.get(time);
    if (!bar) {bar={time,open:t.price,high:t.price,low:t.price,close:t.price,volume:0};bars.set(time,bar);}
    bar.high=Math.max(bar.high,t.price);bar.low=Math.min(bar.low,t.price);bar.close=t.price;bar.volume+=t.volume;
  }
  return [...bars.values()];
}
export class LiveStore {
  constructor(path) {
    this.db=new DatabaseSync(path);
    this.db.exec('PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS trades (id TEXT PRIMARY KEY, block INTEGER, log_index INTEGER, timestamp INTEGER, payload TEXT); CREATE INDEX IF NOT EXISTS trades_order ON trades(block,log_index); CREATE TABLE IF NOT EXISTS state (id INTEGER PRIMARY KEY CHECK(id=1), checkpoint INTEGER);');
  }
  checkpoint(){return this.db.prepare('SELECT checkpoint FROM state WHERE id=1').get()?.checkpoint;}
  replaceRange(from,to,trades,advance=true){
    this.db.exec('BEGIN IMMEDIATE');
    try {
      this.db.prepare('DELETE FROM trades WHERE block>=? AND block<=?').run(from,to);
      const insert=this.db.prepare('INSERT OR REPLACE INTO trades VALUES(?,?,?,?,?)');
      for(const t of trades)insert.run(t.id,t.block,t.logIndex,t.timestamp,JSON.stringify(t));
      if(advance)this.db.prepare('INSERT OR REPLACE INTO state VALUES(1,?)').run(to);
      this.db.exec('COMMIT');
    }catch(error){this.db.exec('ROLLBACK');throw error;}
  }
  trades(limit=100){return this.db.prepare('SELECT payload FROM trades ORDER BY block DESC,log_index DESC LIMIT ?').all(limit).map(r=>JSON.parse(r.payload));}
  bars(interval){const rows=this.db.prepare('SELECT payload FROM trades ORDER BY block,log_index').all().map(r=>JSON.parse(r.payload));return candles(rows,interval).slice(-1000);}
  close(){this.db.close();}
}
