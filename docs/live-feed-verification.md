# LFJ live feed verification

Read-only probe performed 2026-10-13. No wallet access or transactions sent.

Pool: `0x4224f6f4c9280509724db2dbac314621e4465c29` (LFJ V2.1 BTC.b/USDC).
Transport: public Avalanche C-Chain WebSocket and HTTP RPC.

## Observed results

- 19 historical Swap logs in the initial 500-block range.
- 2 live Swap logs during the subscription windows.
- Intentional WebSocket disconnect for 30 seconds, then successful resubscription.
- Backfill across the full observation range returned 3 swaps, including both live events.
- 1 additional event absent from the captured live stream was recovered by backfill.
- Live and recovered sample log payloads matched transaction receipts.

Live sample: `0x8c6d84ed38a901f59eaf77348195642ee555d209b49aac14875c20de4799986b`.
Recovered sample: `0x583e78163d0d2e515ff87f338f4d5afc7d9a5ac2202e80f1c75b17b20919c55f`.

Independent decoding of the live sample used pool getTokenX/getTokenY and token decimals from RPC:

- BTC.b (8 decimals): 0.21623613 input.
- USDC (6 decimals): 17979.029825 output.
- Receipt status: successful.

## Limits

This proves a short live-subscription and backfill path, not 24/7 reliability or measured latency. Recovery-only events may include the reconnect boundary; the probe does not precisely timestamp the disconnected interval. Production still needs persistent checkpoints, deduplication, removed-log/reorg handling, retries/backoff, gap detection, historical candle backfill and monitoring.

Run `node scripts/probe-live.mjs`. Optional PROBE_POOL selects another compatible LBPair. The script is diagnostic, not the production data service.
