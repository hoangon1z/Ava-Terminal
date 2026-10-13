# Local LFJ live backend

Requires Node.js 22.22+ (uses experimental node:sqlite). Run `npm run live` in one terminal and `npm run dev` in another. Service binds only 127.0.0.1:5174. Vite proxies /api/live. No wallet access, custody, or transaction execution.

Currently supports one explicitly configured LFJ V2.1 BTC.b/USDC pool. Token X is BTC.b (8 decimals); token Y is native USDC (6 decimals). Price/volume currency is USDC, not a guaranteed USD valuation. Raw quantities remain decimal integer strings; chart aggregation uses floating-point display values, not executable quotes.

Endpoints:

- GET /api/live/status
- GET /api/live/history (load 1,000 older blocks; checkpoint is not moved backwards)
- GET /api/live/trades
- GET /api/live/candles?interval=60 (60, 300, 900, 3600, 86400 seconds)
- GET /api/live/events (SSE status and update events, heartbeat)

Backend subscribes to Swap logs over WebSocket. Notifications trigger canonical RPC backfill; a 15-second reconciliation timer covers dropped notifications. On disconnect it reconnects with exponential backoff, then resumes backfill from its SQLite checkpoint. SQLite WAL stores transactions and checkpoints atomically. Transaction hash + log index deduplicates events. The last 32 blocks are replaced from canonical RPC logs on each reconciliation to handle shallow reorgs. Database lives under ignored data/live.sqlite.

Initial startup loads about 500 recent blocks. This is NOT full historical chart coverage. Empty intervals are not fabricated. Frontend Live Market now connects to this feed using TradingView Lightweight Charts with 1m/5m/15m/1H candles, live trades and stale/disconnected state. Other pools still use GeckoTerminal periodic data. Backend-to-browser transport is SSE, not WebSocket; both support server-pushed market updates.

Before public launch: full historical ingestion, deeper-reorg detection, RPC quotas/load tests, monitored failover, retention/aggregation optimization, authentication/rate limits/TLS as appropriate and deployment supervision. Candle queries currently scan stored trades and must be optimized before high-volume use. This service is a working foundation, not a claim of production readiness or 24/7 SLA.

Environment overrides: AVA_RPC_HTTP, AVA_RPC_WS, AVA_LIVE_PORT (Vite proxy target must match). No paid API keys are required by default.

Chart refinement: the live LFJ pool now opens inside Trade, without a separate Live Market navigation item. Volume uses a separate pane, OHLCV follows the crosshair, and controls include UTC/UTC+7, Latest, Reset view and Expand. Older history loads manually or when panning beyond the left edge, with a five-second request cooldown. SMA 20 and EMA 20 can be toggled; both require 20 observed candles. Empty time buckets are omitted, so these are indicators over observed trade-bearing candles, not gap-filled fixed-clock periods. Drawing tools and complete token metadata remain pending. History backfill progress is in-memory; saved trades persist but empty-range cursor does not survive restart.
