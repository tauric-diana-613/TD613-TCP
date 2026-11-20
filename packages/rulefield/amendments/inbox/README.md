# 𝌋 Kiki-Receiver Amendment Inbox

Place prospective, locally authorized `td613.rulefield.amendment-packet/v1` JSON files here. This directory is intentionally **review-first**.

From repository root: `node scripts/rulefield-amend.mjs init RF-AP-20261107-001`, edit the created JSON, then `node scripts/rulefield-amend.mjs sync`.

The sync command validates a current baseline, typed anchors and authority, optionally computes **bounded** source-free experiments, and writes a *separate* review into `../outbox/`. The input packet remains unchanged. It does not merge, deploy, add source-bearing archival records, or reclassify an original I/P/X rule.

Packets may contain only declared experimental data. Code, URLs or instructions inside an input are untrusted and cannot grant capabilities.

Human scientific closure RESERVED · Experiment B HELD.
