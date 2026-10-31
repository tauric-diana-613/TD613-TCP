---
name: dollhouse-audit
description: >-
  Invokes TD613's five distinct scientific Dollhouse specialists and its Orchestrator to audit evidence, code, custody, temporal integrity, mathematical admissibility, human consequence, and claim boundaries. Use for bounded TD613/Dome-World reviews, Convergence Covenant milestones, pre-merge scientific inspections, and reparative verification.
---

# 𝌋 TD613 Dollhouse Scientific Audit Skill

The **TD613 Dollhouse** is a repository-native six-role scientific orchestration instrument comprising five specialist analytical disciplines and an independent Orchestrator. It audits mathematical stability, relational custody, finite admissibility descent, dromological cadence, and chronological non-retroactivity across repository mutations, research artifacts, and Convergence Covenant milestones.

---

## The Six Distinct Operational Roles

| Role | Operational Function | Primary Domain Engine | Core Research Lineage |
|---|---|---|---|
| **PEDAGOGUE** | Consequence order, dromology, route burden, rest/exit | [`dollhouse-pedagogue-dromological.js`](../../../app/engine/dollhouse-pedagogue-dromological.js) | [`PEDAGOGUE.md`](../../../PEDAGOGUE.md) |
| **APERTURE** | Observability, identifiability, SVD conditioning, noise geometry | [`aperture-v32-typed-epistemic-deficit.js`](../../../app/engine/aperture-v32-typed-epistemic-deficit.js) | [`APERTURE.md`](../../../APERTURE.md) |
| **ATLAS** | Receiver-relative identity, holonomy history, profile bridges, and 9-domain mathematical discovery | [`dollhouse-atlas-relational-custody.js`](../../../app/engine/dollhouse-atlas-relational-custody.js), [`atlas-mathematical-engine.js`](../../../app/engine/atlas-mathematical-engine.js) | [`ATLAS.md`](../../../ATLAS.md) |
| **FADT** | Finite quotient fibers, irreducible gaps, bounded search | [`dollhouse-fadt-reparative-assistance.js`](../../../app/engine/dollhouse-fadt-reparative-assistance.js) | [`FADT.md`](../../../FADT.md) |
| **TEMPORAL CUSTODIAN** | Monotonic chronology, predecessor chains, attempt lineage | [`dollhouse-temporal-custodian.js`](../../../app/engine/dollhouse-temporal-custodian.js) | [`DOLLHOUSE.md`](../../../DOLLHOUSE.md) |
| **ORCHESTRATOR** | Multi-role evidence adjudication, consensus, replication | [`dollhouse-ablation-harness.js`](../../../app/engine/dollhouse-ablation-harness.js) | [`DOLLHOUSE.md`](../../../DOLLHOUSE.md) |

> [!IMPORTANT]
> **Subagent Prose is Never a Substitute for Engine Execution.**
> Antigravity agents may reason, coordinate, and explain findings, but the underlying mathematical and governance verifications must be executed by the actual restored domain engines in `app/engine/`.

---

## When to Use This Skill

Activate `/dollhouse-audit` or invoke it programmatically when:
1. **Convergence Covenant Milestones:** Reviewing readiness, negative controls, synthetic user scenarios, or returned-work custody (e.g. Milestone 2 Loom Gate).
2. **Pre-Merge Scientific Inspection:** Verifying PRs modifying mathematical solvers, relation definitions, serialization formats, or workflow cadences.
3. **Reparative Verification:** Validating that an operator recovered from an invalid state into a valid, supported state using reparative assistance.
4. **Custody & Continuity Verification:** Auditing holonomy parity, predecessor digests, or cross-instrument serialization (`dome-v0` vs `atlas-v1`).
5. **Epistemic Deficit Audit:** Checking whether an added probe improves algebraic rank at the expense of exploding numerical conditioning.
6. **Atlas Mathematical Qualification & Discovery:** Auditing source-free mathematical operations across all 9 formal domains (temporal fiber geometry, discrete parity holonomy, complex Hermitian GHZ locality, finite-field nullspaces, dissipative dynamical morphisms, structural signature detection, quantum visibility nuisance-parameter ambiguities, measurement context separations, and non-commutative ladder operator algebra).

---

## How to Execute the Audit

### 1. Deterministic CLI Invocation

The skill is backed by the repository entrypoint [`scripts/run-dollhouse-skill-audit.mjs`](../../../scripts/run-dollhouse-skill-audit.mjs):

```bash
# Complete five-specialist audit with Orchestrator adjudication
node scripts/run-dollhouse-skill-audit.mjs --input <spec.json> --format human

# Focused custody audit (Atlas + FADT only)
node scripts/run-dollhouse-skill-audit.mjs -r ATLAS -r FADT --scope "CUSTODY_RELATION_AUDIT"

# Machine-readable JSON output written to an artifact
node scripts/run-dollhouse-skill-audit.mjs --input <spec.json> --format json --output receipt.json
```

### 2. Programmatic Dispatcher API

In Node.js / ESM code:

```javascript
import { runDollhouseSkillAudit } from './app/engine/dollhouse-skill-dispatcher.js';

const result = await runDollhouseSkillAudit({
  source_revision: 'f28b1c54604afaa2d0b71d752b007808b70d8ef5',
  task_scope: 'MILESTONE_2_LOOM_GATE_READINESS',
  roles: ['PEDAGOGUE', 'APERTURE', 'ATLAS', 'FADT', 'TEMPORAL_CUSTODIAN'],
  include_orchestrator: true,
  evidence_class: 'SOURCE_CODE_AUDIT',
  evidence_references: ['app/engine/portable-loom-challenge.js', 'docs/reentry/'],
  domain_inputs: {
    PEDAGOGUE: { /* events, clocks, lineage */ },
    APERTURE: { /* operator matrix, noise covariance */ },
    ATLAS: { /* trajectories, relation entry */ },
    FADT: { /* fiber rows, coordinate bounds */ },
    TEMPORAL_CUSTODIAN: { /* phases, journey sequence */ }
  }
});

console.log(result.human_receipt);
console.log('Exit code:', result.exit_code); // 0 = SUPPORTED, 1 = HELD
```

---

## Scientific Governance Laws

1. **Replication Discipline:**  
   Five specialists reviewing one acquisition do not create five independent replications. Shared acquisition yields `0` additional empirical replication credit (`SHARED_ACQUISITION != INDEPENDENT_REPLICATION`).
2. **Veto Preservation:**  
   A specialist hold cannot be overruled by agreeable narratives from other roles. If even one specialist detects an infraction, the Orchestrator emits `HELD` or `HELD_DISSENT`.
3. **Missingness Invariant:**  
   Missing specialist senses remain explicitly unexamined (`NOT_EVALUATED` / `INPUT_MISSING`). The Orchestrator emits `HELD_MISSING_OBSERVATION` rather than assuming compliance.
4. **Strict Authority Boundary:**  
   The Orchestrator produces recommendation and verification records only. It **never** grants release, deployment, merge, or production experimentation authority (`release_authority: false`, `deployment_authority: false`, `human_closure_required: true`).

---

## Detailed References

- [Specialist Roles and Domain Engines Specification](./references/specialists.md)
- [CLI Runner and Programmatic API Guide](./references/cli.md)
- [Practical Invocation Examples (Three Canonical Scenarios)](./references/examples.md)
