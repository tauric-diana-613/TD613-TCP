# 𝌋 Typed Rulefield Ontology — ROD-0002 Repair

**Engine:** `type_system.mjs` · **Review status:** PROPOSED_TYPED_PROJECTION · **Authorization:** HUMAN REVIEW PENDING

### Five non-equivalent research object types

1. **RULEFIELD** — question-space containing potentially incompatible theories and many child rules.
2. **RULE** — defined, typed transition / guard / invariant, with state, observer and falsifier.
3. **ASSAY** — experimental allocation, controls, comparison and observation protocol.
4. **MODEL / THEOREM / CLAIM** — defined mathematical construction or proposition, with evidence status independent of implementation.
5. **SOURCE / HISTORICAL_RECORD** — retained statement and provenance, not necessarily an executable rule.

All legacy 596 entries remain in the original historical `rules` container, with **unchanged bytes and IDs**. The running projection now exposes the scientifically relevant type without falsely claiming the 596 entries all qualify as executable rules.

The [source-reviewed crosswalk](type_assessment/TYPE_ASSESSMENT_ROD0002.md) proposes:
- **26** retypings of existing records as an assay, model, theorem, source, research program, evidence boundary or unresolved.
- **31** candidate child rules/assays derivable from new fields, with a separate scientific evidence ceiling for each.
- **11** specifically protected existing operational rules.
- **14** protected broad research fields that must never be deleted merely because a child rule was developed.
- **559** remaining legacy records retain `HISTORICAL_RECORD` typing **until** adequately examined. That does not claim they are non-rules.

These subsets overlap and are not 82 additional findings. No source corpus was renamed in place; this is a versioned materialized projection. Operators may inspect and revise the proposed assignments in the successor in-chat docket.

### Run in a normal Rulefield checkout

```bash
node scripts/rulefield-types.mjs validate
node scripts/rulefield-types.mjs summary
node scripts/rulefield-types.mjs rule INF-01
node scripts/rulefield-types.mjs field RF-060
node scripts/rulefield-types.mjs children RF-079
node scripts/rulefield-types.mjs export dist/RULEFIELD_TYPED_PROJECTION_ROD0002.json
node --test tests/rulefield-types.test.mjs
```

### Receiver integration

If any candidate is submitted with `kind:'PROPOSE_RULE'` (with or without a source field ID), the amendment receiver must see `formal_rule.state_space`, `formal_rule.guard`, `formal_rule.local_transition` and `formal_rule.observer`. Passing that shape check yields **CANDIDATE_RULE_ONLY_NOT_ADOPTED**, never scientific acceptance. A field declared with `object_type:'RULEFIELD'` under `PROPOSE_RULE` fails **HELD_RULEFIELD_RULE_TYPE_COLLAPSE**, even if an agent claims to have given it a formal rule.

The receiver retains the earlier falsifier, competent-null, duplicate-HOLD, source and separate human authorization checks.

### Scientific boundaries

- `RF-059` and `RF-060` can retain their research fields while formal rules specify Conway's Life and Wolfram Rule 30.
- `RF-014` can yield a zero-registered-events identifiability guard without verifying any physical launch.
- `RF-079` remains a speculative partial thermodynamic/social-field mapping requiring typed observables, units, preserved relations and independent test.
- A synthetic model of human–AI interaction can demonstrate conditional mathematical feedback; its outputs are not clinical diagnoses or prevalence statistics.
- **OD-02 remains HELD**: academic working labels require operator ratification.

### Human review

The operator reviews the typed crosswalk and decides on the projection. This change alone does **not** authorize actual canonical registry reorganization, deletion of historical statements, scientific promotion, protected Flight, merge or deployment.

𝄐 Khona‌lit-po · Type safety does not erase source history.

## Role multiplicity — nonidentity without a partition

**Rulefield ≠ Rule** denotes nonequivalent *role semantics*; a historical entity can simultaneously be a **Rule** in an execution context and a **Rulefield** in a research context. See [the source-preserving addendum](type_assessment/ROLE_MULTIPLICITY_ROD0002.md). The same principle extends to models, assays, theorems and research programs: a rule can be studied as a field, and a field can contain itself as an object of inquiry, without automatically licensing reflexive execution.

We use **qualified views**, for example `legacy_rule:I-001#role:rule` and `legacy_rule:I-001#role:rulefield`, under one historical identity. No duplicate canonical rule ID is minted. Ten reviewed exemplar objects are equipped with nonexclusive roles; `node scripts/rulefield-types.mjs roles I-001` and `roles Q18-R01` print these role bindings.

In the amendment receiver, `PROPOSE_RULE` always requires a formal local contract. For an explicit `roles: ['RULE','RULEFIELD']` proposal, supply separate `role_contexts.execution` and `role_contexts.inquiry`, `cross_role_authority_transfer: false`, and optionally `source_rule_id` or `source_rulefield_id`. The same entity may be the subject of both roles. A field-only object that lacks an execution role remains held. Correct dual roles are candidate views, not new scientific laws, permissions or canonical adoption.

The [frozen v1 compatibility addendum](../operator/contracts/NOMENCLATURE_V1_ROLE_MULTIPLICITY_ADDENDUM.md) does not change the original nomenclature contract or the operator's OD-02 HOLD.
