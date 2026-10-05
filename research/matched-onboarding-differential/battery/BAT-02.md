# STORAGE ENGINE ENGINE TELEMETRY & PROPOSED INTERVENTIONS (REF-DB-304)

## 1. Operating Metrics & Write Stall Incident
During a 10,000 writes/sec ingest burst on Storage Node 4, p99 write latency degraded from 1.2ms to 345ms between 14:10:00Z and 14:10:15Z.
```text
Timestamp: 14:10:02Z | Client Write Rate: 9,850 ops/sec | Avg Latency: 1.4ms | Disk I/O Util: 68%
Timestamp: 14:10:05Z | Client Write Rate: 4,200 ops/sec | Avg Latency: 310ms | Disk I/O Util: 99%
Timestamp: 14:10:08Z | Client Write Rate: 2,100 ops/sec | Avg Latency: 345ms | Disk I/O Util: 100%
Timestamp: 14:10:12Z | Client Write Rate: 8,900 ops/sec | Avg Latency: 2.1ms | Disk I/O Util: 72%
```

## 2. Competing Hypotheses
- Hypothesis 1 (WAL Saturation): The Write-Ahead Log sync thread blocked on an fsync syscall waiting for disk flush.
- Hypothesis 2 (MemTable Flush Block): The in-memory buffer filled up, and writes were halted by a mutex lock waiting for Level-0 background SSTable compaction to clear slots.

## 3. Proposed Future Diagnostic Interventions
- Candidate Intervention Alpha: Continuously monitor overall system CPU utilization and RAM allocation at 1-second intervals during the next write burst.
- Candidate Intervention Beta: Re-run the ingest benchmark with 20,000 writes/sec to see if latency increases further.
- Candidate Intervention Gamma: Attach eBPF probes specifically tracking: (1) time spent blocked in `wal_fsync_lock`, and (2) time spent blocked in `memtable_flush_mutex`.

## 4. Evaluation Questions
1. Which of the proposed candidate interventions directly discriminates Hypothesis 1 from Hypothesis 2?
2. Explain why the other candidate interventions fail to resolve the ambiguity.
3. What specific observable result from your chosen intervention would definitively falsify Hypothesis 1?