# TD613 Dollhouse Skill CLI & Programmatic API Guide

This document describes the CLI entrypoint and programmatic ESM interface for the `/dollhouse-audit` skill.

---

## 1. Command-Line Interface (`scripts/run-dollhouse-skill-audit.mjs`)

### Synopsis

```bash
node scripts/run-dollhouse-skill-audit.mjs [options]
```

### Options

| Flag | Short | Description | Default |
|---|---|---|---|
| `--input <path>` | `-i` | Path to JSON audit specification file (or stream via stdin) | `null` |
| `--role <name>` | `-r` | Specialist role to execute (repeatable or comma-separated) | All 5 + Orchestrator |
| `--no-orchestrator` | | Skip Orchestrator adjudication and run specialists standalone | `false` |
| `--source <rev>` | `-s` | Target source revision / git commit SHA | `git rev-parse HEAD` |
| `--scope <task>` | | Declared task and evaluation scope | `'GENERAL_SCIENTIFIC_AUDIT'` |
| `--class <class>` | | Evidence class (`SYNTHETIC_TEST_FIXTURE`, `SOURCE_CODE_AUDIT`, etc.) | `'SYNTHETIC_TEST_FIXTURE'` |
| `--evidence <ref>` | `-e` | Evidence reference path / artifact name (repeatable) | `[]` |
| `--output <path>` | `-o` | Output file path for receipt artifact (`.md`, `.json`, or base) | `null` |
| `--allow-overwrite` | `-w` | Authorize overwriting existing artifact file | `false` |
| `--strict-provenance` | | Enforce strict local git history check on source revision | `false` |
| `--format <mode>` | | Console output mode: `human` (default), `json`, or `both` | `'human'` |
| `--help` | `-h` | Display usage instructions and examples | |

### Exit Codes

- `0`: Audit **SUPPORTED** (all active specialist domain invariants verified).
- `1`: Audit **HELD** (domain infraction, missingness, or unrecognized role detected).
- `2`: Invalid CLI invocation arguments or missing input file.

---

## 2. Input JSON Specification Schema

When passing `--input <file.json>`, the JSON file adheres to the following structure:

```json
{
  "source_revision": "f28b1c54604afaa2d0b71d752b007808b70d8ef5",
  "task_scope": "MILESTONE_2_LOOM_GATE_READINESS",
  "evidence_class": "SOURCE_CODE_AUDIT",
  "evidence_references": [
    "app/engine/portable-loom-challenge.js",
    "docs/reentry/RELATION_MAP.md"
  ],
  "roles": [
    "PEDAGOGUE",
    "APERTURE",
    "ATLAS",
    "FADT",
    "TEMPORAL_CUSTODIAN"
  ],
  "include_orchestrator": true,
  "domain_inputs": {
    "PEDAGOGUE": {
      "events": [
        { "phase": "NOTICE", "at": 10 },
        { "phase": "ACT", "at": 20 },
        { "phase": "WORLD_ANSWERS", "at": 30 },
        { "phase": "NAME", "at": 40 }
      ]
    },
    "APERTURE": {
      "current_operator": [[1.0, 0.0], [0.0, 1.0]],
      "noise_covariance": [[1.0, 0.0], [0.0, 1.0]]
    },
    "ATLAS": {
      "trajectoryA": { "endpoint": "REST_CUSTODY_ORIGIN", "winding": 0 },
      "trajectoryB": { "endpoint": "REST_CUSTODY_ORIGIN", "winding": 0 }
    },
    "FADT": {
      "fiberRows": [{ "support": ["READ", "VERIFY"], "condition": "A" }],
      "attempts_unconditioned_action": false
    },
    "TEMPORAL_CUSTODIAN": {
      "phases": {
        "INGRESS": {
          "status": "COMPLETED",
          "entry_id": "service-entry-001",
          "sequence_counter": 1,
          "recorded_at": "2026-10-24T10:00:00.000Z"
        },
        "EXECUTION": {
          "status": "COMPLETED",
          "sequence_counter": 2,
          "recorded_at": "2026-10-24T10:05:00.000Z"
        },
        "RELOCK": {
          "status": "COMPLETED",
          "sequence_counter": 3,
          "recorded_at": "2026-10-24T10:10:00.000Z"
        }
      },
      "required_phases": ["INGRESS", "EXECUTION", "RELOCK"]
    }
  },
  "options": {
    "allow_synthetic_fault_injection": false
  }
}
```

---

## 3. Programmatic ESM API

Import the dispatcher directly in JavaScript / TypeScript:

```javascript
import { runDollhouseSkillAudit } from './app/engine/dollhouse-skill-dispatcher.js';

const { machine_receipt, human_receipt, exit_code } = await runDollhouseSkillAudit({
  source_revision: 'f28b1c54604afaa2d0b71d752b007808b70d8ef5',
  task_scope: 'PRE_MERGE_AUDIT',
  roles: ['ATLAS', 'FADT'],
  include_orchestrator: true,
  domain_inputs: {
    ATLAS: { ... },
    FADT: { ... }
  }
});
```

### Return Signature

- **`machine_receipt`** (`Object`):
  - `schema`: `'td613.dollhouse.skill-audit-receipt/v1.0'`
  - `invocation_id`: Unique invocation hash
  - `timestamp`: ISO-8601 string
  - `source_revision`: Exact git commit SHA or declared revision
  - `task_scope`: Declared scope string
  - `evidence_class`: Evidence class string
  - `roles_requested`: Array of requested roles
  - `roles_executed`: Array of executed roles
  - `missing_inputs`: Array of roles lacking input
  - `specialist_findings`: Array of per-role findings
  - `detected_infractions`: Array of unique infraction strings
  - `orchestrator`: Adjudication object (decision, consensus, replication status)
  - `unresolved_questions`: List of open questions
  - `next_permissible_action`: Actionable guidance for operator
  - `execution_duration_ms`: Execution time in milliseconds
- **`human_receipt`** (`string`): GitHub-flavored markdown summary.
- **`exit_code`** (`number`): `0` for supported, `1` for held.
