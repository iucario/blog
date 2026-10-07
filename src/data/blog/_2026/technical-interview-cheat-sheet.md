---
title: Technical Interview Cheat Sheet
slug: technical-interview-cheat-sheet
description: Say it out lout, even if it's obvious. And overcome your ADHD that makes you skip steps in your head.
pubDatetime: 2026-10-06
modDatetime: 2026-10-06
tags:
  - interview
---

## General Interview Principles

>[!IMPORTANT] Self-reflection:
> Never stay quiet assuming, "Isn't this common sense?". Say it out loud, even if it's **obvious**.

Drill this response framework into pure **muscle memory** to counter _ADHD_.
When presented with a failing or slow system, never jump straight into code or architecture. Clarify and scope first:

1. "Are we discussing an immediate production hotfix or a medium to long-term architectural scaling plan?"
2. Before guessing, inspect the metrics dashboard. Including metrics such as CPU, memory, disk, and network, LB etc.

Reminders to myself:

- **Step by step**. Always adhere to this sequence: Observability -> Immediate Mitigation -> Single-node/Code Optimization -> Distributed Architectural Evolution.
- **Use jargon**. Speaking in plain language puts you at a serious disadvantage. An interview is a scenario where there is **absolutely no** basis for trust, so you must use professional and hardcore terminology.

## Over-Engineering the Interview

### High-Traffic Spikes & Slow OLTP

Scenario: PostgreSQL. You have a sudden traffic burst and queries are grinding to a halt.

1. Hardware metrics I just mentioned above. Plus transactions and locks. Concurrent connections.
2. If the traffic is temporary. Rate limit. Kill long transactions.
3. Connection pool. EXPLAIN. Add index. Most of the cases are caused by `Seq Scan`
4. Long term: Vertical scaling. Read Write Separation. Cache. Declarative Partitioning. Finally physical Sharding.

### PostgreSQL Data Volume Growth

Scenario: This time the queries are slow because of too much data volume.

1. Diagnose. Run `EXPLAIN (ANALYZE, BUFFERS)` on the slowest queries identified via `pg_stat_statements`([doc](https://www.postgresql.org/docs/current/pgstatstatements.html)). Identify disk IO, missing index, stale stats.
	1. Check Buffers & Cache Hit Ratio
	2. Check Access Methods (Seq Scan vs. Index Scan)
	3. Check Sorting Spills
2. Update Statistics `ANALYZE` [sql-analyze](https://www.postgresql.org/docs/current/sql-analyze.html). Sudden bulk inserts make the planner's statistics stale. Running `ANALYZE table_name` ensures the cost-based optimizer chooses the right index paths.
3. Check for Table/Index Bloat. Run `VACUUM ANALYZE` or rebuild bloated indexes using `REINDEX CONCURRENTLY`
4. Long-term: Declarative Table Partitioning (Postgres native). Read Replicas. Cold Data Archival

### Hotspot Writes & Row-level Lock Contention

Scenario: High-Concurrency Flash Sale & Inventory Deduction.
100,000 concurrent users attempting to purchase 100 inventory units simultaneously, causing the database to crash under heavy write load.

1. Before diving in, clarify whether it's a Flash Sale or a loose counter like Likes/Upvotes?\
		If confirmed Flash Sale. Then the challenge here is extreme write contention on a single row under strong consistency constraints.
2. Explain the bottleneck. If 100k requests hit Postgres directly, Every purchase requires an `UPDATE inventory SET stock = stock - 1 WHERE id = ?` This triggers an exclusive row-level lock. Only one transaction can hold it at a time.\
	  Because transactions are waiting, connection hold times spike. The connection pool will be exhausted in milliseconds.
3. We can pre-load the inventory (`stock = 100`) into Redis. Atomic decrement with Lua script.
4. Decouple the write path. Push the purchases to a message queue. A worker will pull and persist into DB in small batches maybe.\
	   This act as a buffer, keeping the database load flat. Use optimistic locking at the SQL level.
5. Edge cases and rollbacks. In real world, what if a user never pays? A worker cancels the order and adds the inventory back to DB and Redis.

### Enforce Data Consistency

Problem: Do you update the database first, or delete the cache first? How do you prevent inconsistent data?

1. Unless you need strict ACID (like banking balances, don't use cache), target **eventual consistency**. Always set a TTL as a fallback.
2. Standard pattern is updating DB first, then deleting(invalidate) the cache. Updating cache in-place causes race conditions where concurrent writes overwrite each other with stale data.
3. Production standard: CDC (Change Data Capture) Decouple cache invalidation.\
	   Tails the DB transaction log (Postgres WAL / MySQL Binlog) -> pushes events to Kafka -> a worker evicts the Redis keys with automatic retries.

### Large-Scale Deep Pagination & Memory-Safe Bulk Exports

A website needs to paginate through or export millions of rows.

1. Avoid OFFSET Pagination. Use cursor based on a indexed column.\
		`WHERE id > :last_id ORDER BY id ASC LIMIT 50`
2. Stream Data in batches.
3. For exportation. Backend transforms rows into CSV chunks on the fly. Pipe them directly into the HTTP response stream. Memory overhead stays constant.\
	Frontend uses the Streams API [MDN Using_readable_streams](https://developer.mozilla.org/en-US/docs/Web/API/Streams_API/Using_readable_streams)
4. Async Worker Architecture for Multi-Million Exports.\
		Long-running exports tie up HTTP connections and risk gateway timeouts. Return a task ID immediately. Notify user when the file is uploaded to the bucket.

### SAGA

Multi-service or cross-boundary workflows (e.g., wallet deduction + bank transfer) where Two-Phase Commit is not viable.

1. Break a global transaction into a series of local transactions. Each step has an accompanying **compensating transaction** (rollback mechanism) executed in reverse order on failure.
2. Prefer an **Orchestrator** (state-machine-driven) for complex financial flows to keep execution and failure handling observable in one place.
3. Handle carefully:\
	    **Idempotency**: Network retries will happen; compensations must use an idempotency key to prevent double-purchases.

### Cascading Failure & Rate Limiting

1. Timeouts, always.
2. Circuit breaker. Fast fail the successive requests.
3. Graceful Degradation. Returning "queueing" status or static error page

## Frontend Defense Kit

Context: I am not a dedicated frontend specialist. Just in case the interviewers probe frontend.
It's good to know we have so many great technologies on browsers these days!

### Async Timing & Race Conditions

Rapid typing triggers multiple requests. A slow earlier request can arrive after a faster later request, overwriting the UI with stale data.

1. Never trust network arrival order.
2. Modern API: Use `AbortController` ([MDN](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)) to cancel in-flight requests before firing a new one `controller.abort()`.
3. Fallback: Increment a local `requestId` and discard responses `if responseId !== currentRequestId`.

### Rendering Pipeline & Frame Rate

Streaming tokens (like ChatGPT SSE) or high-frequency scroll events trigger hundreds of re-renders per second, locking the main thread.

1. Batching: Push incoming chunks into a memory buffer; flush to state every frame using `requestAnimationFrame` (or throttle at 50–100ms). [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame)
2. Offload heavy Markdown parsing, KaTeX math, or syntax highlighting to a Web Worker so the main UI thread never drops below 60 FPS.(144hz or higher is even better)

### Memory & DOM Bloat

Massive Lists / Infinite Feeds. Rendering thousands of DOM nodes causes heavy layout thrashing, scrolling lag, and high RAM usage.

1. Virtualized Lists.
		Only mount the 15–20 DOM nodes visible in the current viewport
2. Decouples dataset size from DOM count: whether rendering 100 or 1,000,000 items, DOM operations remain O(1).

And more interview questions to be updated.
