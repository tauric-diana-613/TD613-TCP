# Phase 6 Test Matrix

The Phase 6 test matrix checks the court-record layer without creating release authority.

Covered by `tests/hush-phase6-unified-audit-packet.test.mjs`:

1. clean packet with no Phase 5 signal
2. clean packet with valid Phase 5 signal
3. blocked Phase 5 signal recorded without becoming route authority
4. contract/log mismatch routes repair
5. raw private text posture routes quarantine
6. hash fields are present and agree on build
7. hash-only packet remains blocked by replay policy field
8. old-v2 compatibility mode is preserved through hash replay metadata
9. Safe Harbor handoff carries custody facts only
10. Phase 7 summary excludes raw Phase 5 authority
11. public release remains false by default
12. no silent packet mutation through summary builders

Future PRs may expand direct UI display tests after the Hush release/default gate exists.

⟐SAC[X6ZNK5NO51]
