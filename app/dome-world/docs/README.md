𝌋‌

# Dome-World Documentation Index

**Namespace:** U+10D613 — Tauric Diana 613  
**Organization version:** `td613.dome-world.docs-layout/v0.1`  
**Migration baseline:** `e2369059caf42c754a3d296ea80415ff1ea8400a`  
**Runtime mutation:** none  
**Deployment authority:** none

The former flat `app/dome-world/docs/` directory mixed specifications, plans, phase ledgers, implementation receipts, postclosure repairs, and production dossiers. The corpus is now organized by station and document function.

## Start here

### Current strategic work

- [`ash/experiments/a15-r0/ASH_KEEP_A15_R0_PROJECTION_SELECTION_IMPLEMENTATION_PLAN_V0_1.md`](ash/experiments/a15-r0/ASH_KEEP_A15_R0_PROJECTION_SELECTION_IMPLEMENTATION_PLAN_V0_1.md)
- [`ash/experiments/a15-r0/ASH_KEEP_A15_R0_PROJECTION_SELECTION_SPEC_V0_1.md`](ash/experiments/a15-r0/ASH_KEEP_A15_R0_PROJECTION_SELECTION_SPEC_V0_1.md)

### Ash closure and handoff

- [`ash/closure/ASH_KEEP_A12_A15_PRODUCTION_CLOSURE_DOSSIER_V0_1.md`](ash/closure/ASH_KEEP_A12_A15_PRODUCTION_CLOSURE_DOSSIER_V0_1.md)
- [`ash/closure/ASH_KEEP_A16_A19_ENTRY_HANDOFF_V0_1.md`](ash/closure/ASH_KEEP_A16_A19_ENTRY_HANDOFF_V0_1.md)
- [`ash/closure/ASH_KEEP_A12_A15_OPERATOR_AMENDMENT_V0_1.md`](ash/closure/ASH_KEEP_A12_A15_OPERATOR_AMENDMENT_V0_1.md)

### Flow-Core

- [`flowcore/specifications/FLOWCORE_AIA_PEDAGOGUE_IMPLEMENTATION_SPEC_V0_1.md`](flowcore/specifications/FLOWCORE_AIA_PEDAGOGUE_IMPLEMENTATION_SPEC_V0_1.md)
- [`flowcore/program/FLOWCORE_PEDAGOGUE_PROGRAM_INDEX_V0_1.md`](flowcore/program/FLOWCORE_PEDAGOGUE_PROGRAM_INDEX_V0_1.md)
- [`flowcore/ledgers/FLOWCORE_P0_P10_IMPLEMENTATION_COMPLETION_LEDGER_V0_1.md`](flowcore/ledgers/FLOWCORE_P0_P10_IMPLEMENTATION_COMPLETION_LEDGER_V0_1.md)

### Information Dome

- [`information-dome/INFORMATION_DOME_IMPLEMENTATION_CONCORDANCE_V0_1.md`](information-dome/INFORMATION_DOME_IMPLEMENTATION_CONCORDANCE_V0_1.md)
- [`information-dome/phases/PHASE_2_DOME_ART_PROGRAM.md`](information-dome/phases/PHASE_2_DOME_ART_PROGRAM.md)
- [`information-dome/phases/PHASE_3_FLOWCORE_CONTEXT.md`](information-dome/phases/PHASE_3_FLOWCORE_CONTEXT.md)

## Folder law

```text
foundations/
  cross-station formats and jurisdiction

roadmaps/
  program roadmaps and implementation status

information-dome/
  phases/
  receipts/
  ledgers/
  bridges/

flowcore/
  specifications/
  plans/
  program/
  procedures/
  ledgers/
  receipts/

ash/
  foundations/
  specifications/
  plans/
  ledgers/
  closure/
  experiments/
  receipts/
    stages/
    postclosure/
```

## Migration discipline

- All 81 legacy documents moved by existing Git blob SHA.
- Legacy document bytes were not rewritten during migration.
- Exact old paths consumed by executable tests or scripts remain as temporary Git symlinks.
- Compatibility symlinks are not canonical document locations.
- New references must use the organized paths.
- `DOCS_MIGRATION_MAP_V0_1.json` records every old path, new path, preserved blob SHA, and compatibility posture.

## Authority boundary

This organization commit:

```text
changes runtime code = false
changes Ash custody = false
changes lifecycle state = false
changes serverless functions = false
authorizes A16 = false
authorizes deployment = false
authorizes production cutover = false
```

Filed ⟐
