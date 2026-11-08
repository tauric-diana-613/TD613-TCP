# TD613 Dollhouse

The Dollhouse is the controlled multi-agent laboratory for stressing Portable AIA without collapsing distinct audit roles into one generic assistant.

Current bounded role map:

```text
Pedagogue   Aperture   Atlas   FADT   Temporal Custodian
    \           \        |      /           /
     \           \       |     /           /
                 ORCHESTRATOR
                      |
               LOOM / FLOW-CORE
                      |
                 Portable AIA
                      |
           Marrowline reference host
                      |
              remote companion hosts
```

This diagram is an operational map, not a sovereign ontology or canonical UI topology.

## Six distinct roles (Five Specialists + Orchestrator)

### Pedagogue

Consequence order, route burden, practice pedagogy, route memory, research transfer, and falsifier design.

Canonical shortcut: [`PEDAGOGUE.md`](PEDAGOGUE.md)  
Specialist Agent: [`.agents/agents/dollhouse-pedagogue.md`](.agents/agents/dollhouse-pedagogue.md)

### Aperture

Observability, identifiability, reconstruction, conditioning, uncertainty geometry, widening, abstention, and replay.

Canonical shortcut: [`APERTURE.md`](APERTURE.md)  
Specialist Agent: [`.agents/agents/dollhouse-aperture.md`](.agents/agents/dollhouse-aperture.md)

### Atlas

Receiver-relation audit. It checks whether intentionally different receiver presentations preserve the same governed control plane and Flow-Core relation trace.

Canonical shortcut: [`ATLAS.md`](ATLAS.md)  
Specialist Agent: [`.agents/agents/dollhouse-atlas.md`](.agents/agents/dollhouse-atlas.md)  
Research Estate: [`docs/atlas/README.md`](docs/atlas/README.md) · [`ATLAS_WILD_FIELD_MATHEMATICAL_CHARTER.md`](docs/atlas/ATLAS_WILD_FIELD_MATHEMATICAL_CHARTER.md) · [`ATLAS_YOON_TIME_QUBIT_CROSSWALK_Y01.md`](docs/atlas/ATLAS_YOON_TIME_QUBIT_CROSSWALK_Y01.md)

### FADT

Finite erasure/quotient audit. It checks whether lawful support remains constant after conditioning state is erased and preserves the exact union/intersection gap when it does not.

Canonical shortcut: [`FADT.md`](FADT.md)  
Specialist Agent: [`.agents/agents/dollhouse-fadt.md`](.agents/agents/dollhouse-fadt.md)

### Temporal Custodian

Monotonic chronology, non-retroactivity, phase progression, and predecessor citation chains.

Implementation: [`app/engine/dollhouse-temporal-custodian.js`](app/engine/dollhouse-temporal-custodian.js)  
Specialist Agent: [`.agents/agents/dollhouse-temporal-custodian.md`](.agents/agents/dollhouse-temporal-custodian.md)

### Orchestrator

Multi-role scientific governance, evidence adjudication, consensus aggregation, and replication discipline (`SHARED_ACQUISITION != INDEPENDENT_REPLICATION`). Produces recommendation and verification records only; strictly closed to release or deployment authority.

Implementation: [`app/engine/dollhouse-ablation-harness.js`](app/engine/dollhouse-ablation-harness.js)  
Orchestrator Agent: [`.agents/agents/dollhouse-orchestrator.md`](.agents/agents/dollhouse-orchestrator.md)  
Native Skills: [`.agents/skills/dollhouse-audit/SKILL.md`](.agents/skills/dollhouse-audit/SKILL.md) · [`.agents/skills/dollhouse-design/SKILL.md`](.agents/skills/dollhouse-design/SKILL.md)

### Native Skills

- **Governance & Evidence Audit:** [`.agents/skills/dollhouse-audit/SKILL.md`](.agents/skills/dollhouse-audit/SKILL.md)
- **Generative & Motion Design:** [`.agents/skills/dollhouse-design/SKILL.md`](.agents/skills/dollhouse-design/SKILL.md)

## Shared operational rule

The agents may inspect different coordinates without becoming interchangeable:

```text
PEDAGOGUE != APERTURE != ATLAS != FADT != TEMPORAL_CUSTODIAN != ORCHESTRATOR
```

Their outputs meet at Loom / Flow-Core through explicit bounded contracts. None receives automatic release, redesign, merge, deployment, provider, or Vercel authority.

### Affective Custody Matrix & Relational Interoperability

The six roles operate under an explicit relational geometry where each doll maintains its affective disciplinary temperament and honors strict pairwise custody handoffs:

| Inter-Doll Relation | Affective Disciplinary Temperament | Governing Custody Contract | Operational Law & Invariants |
|---|---|---|---|
| **Pedagogue ↔ Aperture** | Protective Pacing meets Austere Numerical Skepticism | **The Contract of Human-Epistemic Pacing** | $\text{NOTICE} < \text{ACT} < \text{WORLD\_ANSWERS} < \text{NAME}$ meets SVD $\kappa(A)$ conditioning. Pedagogue defends human notice; Aperture calculates whether the physical observation surface possesses the numerical rank to distinguish candidate questions. |
| **Aperture ↔ Atlas** | Metric Calibration meets Relational Loyalty | **The Contract of Projection Invariance** | Observable manifold bounds meet multi-receiver presentation preservation. Aperture determines what is distinguishable; Atlas audits whether projecting these observables across non-equivalent presentations preserves the invariant Flow-Core trace without collapsing member custody. |
| **Atlas ↔ FADT** | Relational Invariance meets Boundary Preservation | **The Contract of Invariant Support** | Relational coordinates meet finite quotient stage erasure and gap defense. Atlas tracks relational coordinates; FADT audits whether erasing conditioning state collapses different lawful supports into an unconditioned gap ($U \setminus \bigcap S_i$). |
| **FADT ↔ Temporal Custodian** | Reparative Search meets Chronological Vigilance | **The Contract of Reparative Chronology** | Bounded coordinate recovery meets monotonic predecessor citation chains. FADT bounds reparative recovery ($\le 10{,}000$ evaluations); Temporal Custodian validates that repairs link valid predecessor citations ($c_{k+1} > c_k$) without retroactive amnesia. |
| **Temporal Custodian ↔ Orchestrator** | Sensory Vigilance meets Judicial Adjudication | **The Contract of Uncollapsible Dissent** | Monotonic proofs delivered to multi-role adjudication. Orchestrator preserves specialist vetoes; missing senses remain `HELD_MISSING_OBSERVATION`; shared acquisition yields zero additional replication credit (`SHARED_ACQUISITION != INDEPENDENT_REPLICATION`). |

### Canonical Interoperability Sequence

```text
Operator Task / Bounded Ingress
       │
       ▼
TD613 Dollhouse Orchestrator (Judicial Sobriety)
       │
       ▼
[1] Flow-Core Pedagogue (Protective Pacing)
       │ (Human-Epistemic Pacing: NOTICE < ACT < WORLD_ANSWERS < NAME)
       ▼
[2] TD613 Aperture (Austere Numerical Skepticism)
       │ (Projection Invariance: SVD kappa(A) conditioning, noise covariance Sigma > 0)
       ▼
[3] Atlas Receiver-Relation Auditor (Relational Loyalty)
       │ (Invariant Support: 9-domain math, holonomy winding parity, atlas-v1 typed serialization)
       ▼
[4] Finite Admissibility Descent / FADT (Boundary Preservation)
       │ (Reparative Chronology: finite quotient descent, union/intersection gap, search <= 10k evals)
       ▼
[5] TD613 Temporal Custodian (Monotonic Vigilance)
       │ (Uncollapsible Dissent: monotonic chronology, predecessor citations, non-retroactivity)
       ▼
TD613 Dollhouse Orchestrator (Adjudication & Verification)
       │ (Zero Release Authority · Human Closure Required)
       ▼
Structured Machine & Human Receipts delivered to Operator
```

## Bounded audit extensions · 2026-09-30

These additive pure adapters audit declared finite inputs. They do not mutate a
product, authenticate supplied observations or promote the installed Aperture
release. Product labels live in proving tests rather than in the generic engines.

| Role | New entrypoint | Bounded question |
| --- | --- | --- |
| Pedagogue | `app/engine/pedagogue-gesture-consequence.js` | Did notice precede the declared gesture/consequence, and do pause, expiry, exit and held attempts retain their distinct meanings? |
| Atlas | `app/engine/dollhouse-continuity-audit.js::runAtlasContinuityAudit` | Which control/result coordinates survived, changed, stayed withheld or remain unknown between declared receiver states? |
| FADT | `app/engine/dollhouse-continuity-audit.js::runFadtStageAudit` | Does erasing declared stage coordinates collapse different lawful action supports into one occupied fibre? |
| Aperture | `app/engine/dollhouse-witness-plan.js::auditDollhouseWitnessPlan` | What positive witness, hostile counterexample and unresolved alternative qualify the next proposed observation? |

`app/engine/dollhouse-case-dossier.js::createDollhouseCaseDossier` is a clerk for
separate findings, source references, evidence classes and disagreements. It
performs no majority vote, global scoring, artifact authentication or release
decision. Even unanimous supplied support retains human review. Declared digest
references require independent byte/authenticity checks outside this clerk.

Run the focused new and inherited hostile contracts:

```bash
npm run test:dollhouse:audits
```

Each extension has distinct proving cases and negative controls. A passing
synthetic contract remains scoped to its declared fixture. Browser observation,
provider response and empirical acquisition retain separate evidence classes.

## Downloadable source kit

### Portable Loom re-entry collaboration

The returned-work lane uses independent encounters, evidence audits, relation maps and finite erasure counterexamples. [The re-entry handoff](docs/PORTABLE_LOOM_REENTRY_HANDOFF.md) records their actual inputs and findings; [the success coordinates](docs/reentry/SUCCESS_COORDINATES.md) link the custody law and witnesses. A browser-observed route and a runtime adapter's missing input class remain different coordinates. Runtime Challenge data supplies no captured operator gesture trace and no Portable-AIA semantic field: Pedagogue and the roundtrip adapter retain explicit `HELD_INPUT_CLASS`. An independent Pedagogue browser witness does not retroactively manufacture that absent input.

Retain disagreement and veto repair as separate source/time-bound findings. The case-dossier clerk checks neither referenced bytes nor upstream authenticity; a separately recorded byte check qualifies artifact integrity only. No role count, unanimous verdict, local ancestry advance or recorded route creates foreign enforcement or empirical exteriority evidence.

The real discoverable shortcut is [`dollhouse/`](dollhouse/README.md). Canonical
implementations remain in their existing locations; the exporter assembles their
static dependency closure and a revision-bound SHA256 manifest.

```bash
npm run dollhouse:export -- /absolute/new/output-directory
```

The exporter requires fresh output and rejects missing dependencies, symlinks,
path escape and unsupported imports. A working-tree candidate must be selected
explicitly and remains labeled separately from exact committed source. The kit
includes neither credentials nor user records, and grants no detached task or
production-trial authority. See the shortcut for verify/replay commands.


## Experimental production-trial authority · RETIRED

Dollhouse remains a controlled research laboratory, but it no longer owns a permanent production-trial workflow or issue-comment listener. The former #1172 production-trial command is historical evidence only and must not be reconstructed from old receipts or research notes.

Any future production-facing Dollhouse experiment requires a newly designed, explicitly bounded observation plan under the then-current repository law. It receives no standing deployment, provider, Vercel, GitHub Actions, or connector authority merely because the older trial once existed.

The historical GitHub-App provenance lesson remains useful: a visible owner login does not by itself prove a direct non-app human gesture when a future experiment explicitly requires that property. That general provenance rule lives in `AGENTS.md`; it does not keep the retired Dollhouse listener alive.

## Portable AIA operational roundtrip candidate

Packetization remains the carrier. Operational portability remains the phenomenon.

The current successor candidate gives a receiving companion a versioned control grammar rather than a loose prompt template:

```text
Flow-Core relation key
-> glyph
-> semantic relation
-> motion/static/inspection grammar
-> governed state
-> claim ceiling
-> allowed operation
-> structured return shape
```

The host may change presentation and reason interactively over that admitted state. A bare glyph string is insufficient for return. The return candidate must carry the versioned control envelope and Flow-Core trace back to Loom / TD613 revalidation.

Current bounded operations:

```text
EXPLAIN_STATE
TRACE_FLOWCORE
PROPOSE_ACTION
REPORT_MISSINGNESS
```

A two-thread realization may therefore separate:

1. an operational AIA thread; and
2. an audit-only thread that receives the compact Flow-Core control receipt and checks return invariants.

The present code establishes the synthetic machine contract for that realization. It does not claim a live ChatGPT integration, pre-ingress secrecy, or transferred host authority.

## Loom roundtrip battery candidate

The current successor battery tests the full cycle:

```text
receiver change
-> Flow-Core-guided projected operation
-> bounded interaction
-> structured return candidate
-> Atlas control-plane comparison
-> FADT action-support comparison
-> proposed-action admission
-> PRESENT_TO_HUMAN or HOLD
```

The battery explicitly rejects:

- equal packet bytes as sufficient proof of operational portability;
- glyph-only return without legend/governance binding;
- model prose as a control receipt;
- receiver change that silently widens authority;
- return that bypasses Loom revalidation;
- FADT gap suppression;
- Atlas presentation equality as a requirement;
- an action proposed outside origin support;
- any claim that phasonic supermoiré tomography, route memory, or formal holonomy establishes physical geometry or empirical exteriority.

Host-reported missingness remains separately visible and advisory; it is not promoted into origin fact merely because the receiving host returned it.

## Phasonic supermoiré comparison seam

The roundtrip revalidation receipt separates:

```text
presentation may change
control changed?
admissibility changed?
```

That finite separation can feed later phasonic supermoiré projection-comparison assays without treating the comparison as physical or continuum tomography.

## Research spine

The current reentry line remains:

```text
FADT
-> AIA
-> Holonomy Loom
-> phasonic supermoiré tomography
-> S3 schedule atlas
-> schedule/state identifiability lag
-> replay / repair / quotient
-> Atlas-Schubert
-> Golden Egg evidence closure
-> Goose House
```

Golden Egg empirical credit and Western Horizon exteriority remain governed by their existing independent evidence ceilings.

## Claim Ceiling Observatory

The public [Claim Ceiling Observatory](app/dome-world/claim-ceilings.html) records
evidence-class-specific claim lifts without flattening old ceilings into a single
binary status.

The machine registry is
`app/engine/dollhouse-claim-ceilings.js`; the four-role executable report is:

```bash
npm run dollhouse:claim-ceilings
```

Its states are deliberately non-equivalent:

```text
EARNED_BOUNDED
!=
SPLIT
!=
HELD
```

A prior ceiling may therefore be surpassed on one coordinate while a higher
coordinate remains unresolved. Examples in the current registry include:

- historical physical-iPhone production behavior: bounded device evidence exists,
  while exact-current-build physical-device closure still requires a fresh episode;
- TD613 cross-instance custody ancestry: authenticated and durable through the
  Vercel OIDC → Neon signer/head boundary, while foreign-provider content origin
  remains separate;
- live provider execution: observed for named production episodes, while hidden
  provider-side enforcement remains unobserved;
- human-operated route observation: present, while measured comprehension requires
  its own preregistered human study.

The Western Horizon research field itself is no longer at the old no-new-substrate
rest: closed unmerged PR #1003 admitted a live external empirical witness and
earned exact-head GREEN in run 33629043531, followed by independently GREEN
provenance witnesses in #1004 and #1005. That lifts the old *reopening* ceiling,
while empirical exteriority of the exact target artifact remains a higher,
separate claim.

Hidden retention/training/internal memory and complete same-episode Golden Egg
realization remain HELD because the current admitted evidence does not satisfy
those evidence classes.

`DOLLHOUSE_ROLE_AGREEMENT != EVIDENCE_MULTIPLICATION`.

`TD613_CUSTODY_ANCESTRY != FOREIGN_ORIGIN`.

`HISTORICAL_DEVICE_WITNESS != CURRENT_BUILD_DEVICE_CLOSURE`.

Sealed ⟐
