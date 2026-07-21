# Ash Keep AIA3 Release Reconciliation Receipt v0.1

𝌋‌ U+10D613

## Status

```text
packet: ASH_KEEP_AIA3_RELEASE_RECONCILIATION
status: IMPLEMENTED / PRE-MERGE / CI-GATED
application source changed: false
Ash lifecycle changed: false
canonical digest law changed: false
Case Map computation changed: false
persistence changed: false
serverless allocation changed: false
human closure required: true
closure: OPEN
```

## Observed seam

The completed AIA3 application packet at `7c455b656a158887ea97d626ffd1483577af54e0` reached Vercel through one bounded Git-fallback release. Exact-source observation and the Flow-Core production matrix passed. The terminal workflow held because permanent production infrastructure still invoked the retired AIA2 witness:

```text
scripts/ash-keep-aia2-task-journey-v5.mjs
```

The deployed application generation and the production witness generation were non-identical.

```text
AIA3 application ≠ AIA2 production witness
release deployment success ≠ generation-correct terminal receipt
```

The Vercel lock was restored by `8112ff144d0c5423de1308baff1e5969c99cfd9d`.

## Reconciliation

This packet:

1. replaces the Ash task matrix in `.github/workflows/vercel-operator-release.yml` with `scripts/ash-keep-aia3-task-journey-v3.mjs`;
2. changes production artifacts and receipt verification from `ash-aia2-production` to `ash-aia3-production`;
3. replaces `ash_keep_aia2_task_matrix` with `ash_keep_aia3_task_matrix`;
4. creates the read-only `/td613-ash-aia3-observe` conduit;
5. retires `.github/workflows/ash-keep-aia2-production-observation.yml`;
6. adds executable assertions forbidding retired AIA2 witness names from release infrastructure;
7. updates the strategic deployment law to require current-generation Ash evidence.

## Required merge evidence

Before merge, the exact branch head must pass:

- Vercel deployment-law contracts;
- Ash Keep AIA3 mass-eviction contracts;
- Ash Keep live surface contracts;
- Flow-Core P0–P10 closure;
- TCP Smoke and static application checks;
- YAML and JavaScript syntax checks.

## Required release evidence

After merge and one explicit authorized release, the terminal receipt must report:

```text
source_packet_commit = exact merged main SHA
exact_source_content = PASS
flowcore_browser_matrix = PASS
ash_keep_aia3_task_matrix = PASS
ash_keep_fresh_client = PASS
ash_keep_retired_aia2_eviction = PASS
ash_keep_case_preservation = PASS
application_tree_drift = none
git_auto_deploy = disabled
```

The release witness remains non-promotional and cannot count as human evidence, authorize a child study, or close the program.

Sealed ⟐