# Archive Ledger

This layer is append-only custody memory. It will record:

- discovery snapshots;
- acquisition attempts and outcomes;
- capture hashes and byte lengths;
- normalization/derivative lineage;
- availability observations and transitions;
- manifest corrections as new events rather than rewritten history.

A later observation may supersede an earlier interpretation, but it must not erase the earlier receipt. Publication chronology belongs to the source record; ledger chronology belongs to the archive.

## Availability event contract

```json
{
  "event_id": "archive-assigned UUID",
  "manifestation_id": "stable platform-scoped ID",
  "observed_at": "RFC 3339 timestamp",
  "state": "AVAILABLE | PARTIAL | AUTH_REQUIRED | RATE_LIMITED | UNAVAILABLE | UNKNOWN",
  "canonical_url": "https://…",
  "result": {"http_status": null, "platform_signal": null},
  "last_preserved_sha256": null,
  "evidence_receipt": "relative receipt path",
  "causal_claim": null
}
```

`causal_claim` stays null unless separately evidenced. In particular, `UNAVAILABLE` does not imply deletion, suppression, or censorship.
