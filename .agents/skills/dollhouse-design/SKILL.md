---
name: dollhouse-design
description: >-
  Generates consequential artistic, motion, scholarly, and theoretical compositions from intellectual seeds using instrument-led authorship, selectable formal grammars (Phasonic Counterpoint, Caro Institutional Reconstruction, Butlerian Performativity, Sedgwickian Reparative Texture), and refractive counterfactual mutation. Use for creative synthesis, visual installations, transmedia adaptation, and essays.
---

# 𝌋 TD613 Dollhouse Design Skill (DD-02)

The **TD613 Dollhouse Design** skill is a repository-native generative authoring instrument operating under `OPEN_FIELD_CREATIVE_SYNTHESIS`. It discovers and constructs consequential forms across visual, motion, scholarly, theoretical, and hybrid media.

Rather than imposing a standard template (cards, introduction/methods/conclusion, predictable grids), Dollhouse Design insists that:
> **Form must emerge from the consequential relations of the work being made.**

---

## Native Antigravity Activation & Invocation

In the Antigravity pairing environment, `/dollhouse-design` is invoked natively through:
1. **Direct User Prompt / Slash Command:** The operator specifies `/dollhouse-design` or requests a creative/scholarly composition from an intellectual seed.
2. **Skill Discovery:** Antigravity matches the request against this skill declaration (`.agents/skills/dollhouse-design/SKILL.md`).
3. **Instruction Loading:** The agent loads `SKILL.md` and relevant references (`authoring-cycle.md`, `selectable-instruments.md`).
4. **Conductor Dispatch:** The agent executes the deterministic conductor via programmatic API (`runDollhouseDesignCycle`) or CLI runner (`scripts/run-dollhouse-design.mjs`).
5. **Receipt Ingress:** The conductor emits a frozen, validated return receipt (`td613.dollhouse-design.return-receipt/v0.2`).
6. **Creative Materialization:** The generative author uses the internal candidate/refraction analysis to materialize exactly the number of final artifacts the operator commissioned (one by default). A second candidate never authorizes a second deliverable.

---

## The 8-Stage Authoring Cycle

```text
COMMISSION 
  ⟶ SELECT INSTRUMENTS 
  ⟶ GENERATE ALTERNATIVES 
  ⟶ COMPOSE 
  ⟶ MATERIALIZE 
  ⟶ REFRACT 
  ⟶ COMPARE 
  ⟶ RETURN
```

1. **Commission:** Enter via a typed semantic seed, Human Coordinate Coupling ($\mathcal{H}_q = (\text{WHAT}, \text{WHO}, \text{WHERE}, \text{HOW}, \text{WHEN}, \text{WHY})$), and optional historical references.
2. **Select Instruments:** Choose from the library of available formal traditions (D₃/φ Counterpoint is selectable, never compulsory). If omitted, inferred contextually via `THEMATIC_CLUSTERS`.
3. **Generate Alternatives:** Propagate the problem into at least two structurally non-equivalent formal candidates before committing to layout.
4. **Compose:** Apply the five generative verbs (Propagation, Compression, Coupling, Transition, Stabilization).
5. **Materialize:** Generate the commissioned number of real, executable artifacts (HTML, CSS, manuscripts, mathematical models), rather than descriptive outlines. Default: exactly one.
6. **Refract:** Explore a competing counterfactual internally to challenge the design. Do not export this study as another artifact unless the operator explicitly requests a separate variant.
7. **Compare:** Evaluate internally what changed or survived in the refraction; use that comparison to improve the commissioned work.
8. **Return:** Deliver exactly the requested number of finished artifacts. A refraction, alternative, receipt, or bonus visual mode must not become an extra deliverable without explicit operator instruction. Human selection and closure remain sovereign.

---

## Operator-Defined Deliverable Cardinality — Binding Output Contract

- **Default: one finished deliverable per commission.** A commission may specify `deliverable_count` as a positive integer; only the operator's explicit request may increase that count.
- `Candidate A`, `Candidate B`, refractive counterfactuals, comparison notes, and conductor receipts are **internal design scaffolding, not final artifacts**. Their presence in the JSON receipt must never be interpreted as a file-production obligation.
- The conductor emits `output_contract.requested_deliverables`; the creative author MUST honor that value. If one artifact was requested, return one coherent finished work, **not** two files, two bundled variants, or an unsolicited primary/refraction toggle.
- Refraction may inform revisions and falsification. Do not add a second mode to the finished artifact merely to preserve the refraction. Multiple versions or modes are allowed only when the commission explicitly asks for them.
- **Historical blind A/B evaluation exception:** An experimental protocol may explicitly require matching paired outputs from both arms. That obligation is confined to that experiment and must never become the reusable skill default.
- Receipts, logs, and test results may be retained internally for inspection without being counted or delivered as extra creative products.

---

## Historical Reference Ingestion (Pre-M6 Standard)

To support rich historical design briefs without reducing complex repository records to shallow keywords, commissions support structured `historical_references`:

```json
{
  "reference_id": "REF-LAW-ENTRY-01",
  "source_path": "AGENTS.md",
  "source_revision": "e0a7ba5f3b76f545da11037833c269abd7623a04",
  "classification": "BINDING_CUSTODY_LAW",
  "provenance_class": "CONTEMPORANEOUS_ORIGINAL",
  "summary": "TD613 Agent Entry Contract: Cistern law, consequence before ontology, child-legible NOW / WHY / EXACT, and human closure."
}
```

- **Epistemic Classifications (`classification`):**
  - `BINDING_CUSTODY_LAW` / `BINDING_CONSTRAINT`: Invariants that the creative author must rigorously uphold. Fails closed (`ReferenceError` or `TypeError`) if the file cannot be retrieved or verified at the declared revision. Full source is completely ingested.
  - `NEGOTIABLE_AESTHETIC_DIRECTION`: Historical visual cues or UX patterns that the author is free to reinterpret.
  - `CONDUCTOR_HEURISTICS`: Deterministic scoring rules, candidate suggestions, and syntactic triggers.
  - `AGENT_AUTHORED_DECISIONS`: Final concrete HTML, CSS, and layout selections created by the generative author.
- **Three Provenance Classes (`provenance_class`):**
  - `CONTEMPORANEOUS_ORIGINAL`: Contemporaneously captured source records bound to immutable commit revisions.
  - `RECONSTRUCTED_RECORD`: Historical artifacts or structures reconstructed from subsequent analysis.
  - `ANNOTATED_RECORD`: Historical records supplemented with interpretive or procedural metadata.
- **Fail-Closed Resolution & Full-Source Ingestion Protocol:**
  The conductor verifies and retrieves reference bytes via `git show <revision>:<path>` (or local filesystem), recording byte counts, SHA-256 digests, and complete source text under `full_content` with `inspection_protocol: 'FULL_SOURCE_INGESTION'`. Downstream creative authors access the full text via `getReferenceFullContent(ref)`, ensuring governing instructions located deep in large contracts (e.g. at byte offset > 20,000) are fully accessible without excerpt starvation.

---

## Selectable Creative Instruments

A single geometric framework must never be imposed across all inquiries. The authoring system selects from five canonical instruments based on the commission's needs:

| Instrument ID | Lineage / Foundation | Primary Generative Capability | Recommended Media |
|---|---|---|---|
| **`PHASONIC_COUNTERPOINT`** | Aperture v3.2-alpha Triple Overlay | Periodic scaffold ($T_\Delta$) + quasiperiodic counterlayer ($Q_\varphi$) + interference field ($H$); transmedia invariance | Visual, Motion, Hybrid, Theoretical |
| **`CARO_INSTITUTIONAL_RECONSTRUCTION`** | Robert Caro (Thinkers Bin 2) | Procedural clearance latency ($T_{\text{clearance}} = \mu \times 400\text{ms}$), discrete petition redaction ($4 \times \text{chamber}$), and archival resistance | Scholarly, Visual, Product, Hybrid |
| **`BUTLER_PERFORMATIVE_ITERATION`** | Judith Butler (Thinkers Bin 2) | Citational reiteration, ritualized normative convention, and subversive slippage across repetitions | Scholarly, Theoretical, Visual |
| **`SEDGWICK_REPARATIVE_TEXTURE`** | Eve Kosofsky Sedgwick (Thinkers Bin 2) | Textural parataxis (beside-ness), affective survival, and resisting paranoid hermeneutic closure | Scholarly, Visual, Product |
| **`DIALECTICAL_TENSION`** | Polyphonic Contrapuntalism | Irreducible antithesis, competing perspectives, and non-synthesized juxtaposition | Scholarly, Theoretical, Motion |

---

## The Five Generative Verbs

- **PROPAGATION:** Let the problem produce its own structural alternatives with different governing premises.
- **COMPRESSION:** Find the minimum form that preserves the essential relation set ($R(s) \subseteq R(c)$) without conceptual impoverishment.
- **COUPLING:** Make distinct disciplines or media change each other structurally (e.g. typography changes motion; motion alters argument).
- **TRANSITION:** Shift the projection into another medium ($\Pi_{m, w}(s)$) while holding the intellectual seed invariant.
- **STABILIZATION:** Allow the competing tensions to settle into a definite, inspectable artifact whose remaining openness has a declared reason.

---

## CLI Execution & Programmatic Dispatch

### 1. Deterministic CLI Runner
Backed by `scripts/run-dollhouse-design.mjs`:

```bash
# Author via CLI flags
node scripts/run-dollhouse-design.mjs -s "Two processes arrive at an identical endpoint, but their histories differ" -m VISUAL -i PHASONIC_COUNTERPOINT

# Author via JSON commission file
node scripts/run-dollhouse-design.mjs --input commission.json --output receipt.json --format both

# Author via Standard Input Stream (Piped)
cat commission.json | node scripts/run-dollhouse-design.mjs --stdin --format json
```

### 2. Programmatic Dispatcher API
In ESM JavaScript:

```javascript
import { runDollhouseDesignCycle } from './app/engine/dollhouse-design-conductor.js';

const result = await runDollhouseDesignCycle({
  seed: 'An instrument that measures the weight of what is deleted',
  medium: 'SCHOLARLY',
  instruments: ['CARO_INSTITUTIONAL_RECONSTRUCTION', 'SEDGWICK_REPARATIVE_TEXTURE'],
  human_coordinates: {
    what: 'Scholarly critique of administrative redaction',
    who: 'The archivist vs. the erased subject',
    where: 'The historical inscription ledger',
    how: 'Measuring the displaced volume of omitted text',
    when: 'At the moment of deletion vs. the moment of recovery',
    why: 'To determine whether deletion destroys or preserves'
  },
  historical_references: [
    {
      reference_id: "REF-01",
      source_path: "docs/reentry/RELATION_MAP.md",
      source_revision: "e0a7ba5f3b76f545da11037833c269abd7623a04",
      classification: "BINDING_CUSTODY_LAW",
      provenance_class: "CONTEMPORANEOUS_ORIGINAL",
      summary: "Custody boundary map."
    }
  ],
  scientific_audit_requested: false
});

console.log(result.output_contract); // binding requested output count
console.log(result.primary_materialization); // planned composition; not yet a created file
// result.refractive_variant is internal analysis, not an additional commissioned file
```

---

## Commission-Neutral Native Invocation Contract (Pre-M6 Readiness)

The `/dollhouse-design` skill maintains strict **commission neutrality**. It does not pre-bake carrier selections, multi-phase layout structures, or specific instrument pairings. All substantive design constraints, historical visual baselines, carrier ontologies (e.g. 39-carrier vocabulary), and custody laws remain fully uncommitted, awaiting explicit direction from the human operator's forthcoming M6 prompt.

### Abstract Commission Input Template

When invoking `/dollhouse-design` natively in Antigravity or via CLI runner, the operator supplies an abstract commission:

```json
{
  "commission_id": "COMM-OPERATOR-ASSIGNED",
  "seed": "<abstract-intellectual-seed>",
  "medium": "VISUAL | MOTION | SCHOLARLY | THEORETICAL | PRODUCT | HYBRID",
  "instruments": [
    "<SELECTABLE_INSTRUMENT>"
  ],
  "human_coordinates": {
    "what": "<primary-material-subject>",
    "who": "<participant-roles-and-tensions>",
    "where": "<spatial-or-topological-arena>",
    "how": "<governing-transformative-mechanisms>",
    "when": "<temporal-cadence-or-stages>",
    "why": "<consequential-purpose-and-human-stakes>"
  },
  "historical_references": [
    {
      "reference_id": "REF-01",
      "source_path": "<repo-relative-source-path>",
      "source_revision": "<40-hex-commit-sha | symbolic-ref | WORKING_TREE>",
      "classification": "BINDING_CUSTODY_LAW | BINDING_CONSTRAINT | NEGOTIABLE_AESTHETIC_DIRECTION | CONDUCTOR_HEURISTICS | AGENT_AUTHORED_DECISIONS",
      "provenance_class": "CONTEMPORANEOUS_ORIGINAL | RECONSTRUCTED_RECORD | ANNOTATED_RECORD",
      "summary": "<concise-summary-of-reference>"
    }
  ],
  "deliverable_count": 1,
  "scientific_audit_requested": false
}
```

- If `instruments` is omitted, the conductor infers instruments contextually from seed semantics.
- If `historical_references` are supplied, all binding references are retrieved and fully ingested. If any binding reference cannot be resolved at the declared revision, the cycle fails closed (`ReferenceError`).
- Downstream creative materialization consumes the receipt and produces **exactly `output_contract.requested_deliverables` finished artifacts** (one by default) under `OPEN_FIELD_CREATIVE_SYNTHESIS`. Candidate A/B and the refractive study are design reasoning, never mandatory additional files.

---

## Scientific Firebreak & Authority Law

1. **Firebreak of Authority:**  
   The Design Conductor operates under `OPEN_FIELD_CREATIVE_SYNTHESIS`. It **never** possesses scientific admission, merge, release, deployment, or production mutation authority (`scientific_proof: false`, `release_authority: false`).
2. **Advisory Companion:**  
   The design engine may call `/dollhouse-audit` to perform an advisory check on mathematical consistency or timeline non-retroactivity, but creative synthesis never generates empirical replication credit (`EMPIRICAL_CREDIT_0`).
3. **The Unborn Specialist:**  
   `Palate` remains unborn. Aesthetic judgment is exercised through comparative refraction, not an autonomous algorithmic quality-score.
4. **Preserved Thinkers Bin:**  
   The canonical 28-member Thinkers Bin remains intact. Thinkers inform generative questions without becoming decorative labels.

---

## Detailed References

- [Authoring Cycle Specification](./references/authoring-cycle.md)
- [Selectable Creative Instruments](./references/selectable-instruments.md)
- [Scientific Firebreak & Provenance](./references/firebreak-and-provenance.md)
