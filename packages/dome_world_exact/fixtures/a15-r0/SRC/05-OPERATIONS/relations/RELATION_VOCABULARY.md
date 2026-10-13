# Relation Vocabulary

A SignalRupture work graph must distinguish author-declared relationships from archive-inferred relationships. Every edge stores its origin, source span, manifestation/capture, reviewer, confidence, and adjudication status.

## Bibliographic and version edges

- `REVISES`
- `SUPERSEDES`
- `RETITLES`
- `ABRIDGES`
- `COMPILES`
- `SERIALIZES`
- `MANIFESTS_AS`
- `HAS_CAPTURE`

## Canon-declared intellectual edges

- `EXTENDS`
- `FORMALIZES`
- `TRANSLATES`
- `ANCHORS`
- `OPERATIONALIZES`
- `ROUTES_TO`
- `RENAMES`
- `PREREQUISITE_FOR`
- `COMPANION_TO`
- `PREQUEL_TO`
- `FUTURE_EXTENSION_OF`
- `PART_OF_DECLARED_SERIES`
- `CONCEPTUALLY_PRECEDES`
- `HAS_DECLARED_COMPONENT`
- `HAS_DECLARED_ORDINAL`
- `UNIFIES`
- `COMPLETES_LINEAGE`
- `FORMS_SPINE_OF`
- `SERVES_AS_INTERFACE_TO`
- `COMPLEMENTS`
- `CONSOLIDATES`
- `RESOLVES_CONFLICT_BETWEEN`
- `APPLIED_COUNTERPART_TO`
- `PROOF_LAYER_FOR`

## Research edges

- `POSSIBLE_ALIAS_OF`
- `POSSIBLE_TRANSLATION_OF`
- `POSSIBLE_NESTED_MECHANISM_OF`
- `COMPETING_FORMULATION_WITH`
- `STRUCTURALLY_RECURS_IN`
- `LEXICALLY_RECURS_IN`
- `UNRESOLVED_NUMERIC_CORRESPONDENCE`
- `POSSIBLE_SAME_NAMESPACE_AS`
- `POSSIBLE_REPRESENTATION_LIFT_OF`
- `POSSIBLE_ROUTE_CONDITIONED_VARIANT_OF`

Research edges are questions, not canon facts. They cannot be upgraded to canon-declared edges without an exact source span or other direct evidence.

## Authority and recompilation edges

- `LEGACY_RETAINS`
- `CURRENT_CONTROLS`
- `SUPERSEDES_SCOPE`
- `DEMOTES_AUTHORITY`
- `REHABILITATES`
- `SOURCE_DECLARED_ROLE`
- `RETROSPECTIVELY_TYPES_AS`
- `COMPILES_INTO_FIELD`
- `ASSIGNS_OPERATOR_ROLE`
- `MAPS_TO_STAGE`

`CONSOLIDATES` and `RESOLVES_CONFLICT_BETWEEN` remain the existing normalized terms; do not create synonyms merely because a later instrument also uses them. `REHABILITATES` requires a witnessed later authority restoration; eligibility for regeneration is not rehabilitation.

## Representation and route edges

- `NARRATIVE_PRECURSOR_TO`
- `FORMAL_REPRESENTATION_OF`
- `EMPIRICAL_COMPANION_TO`
- `ADDS_MEASUREMENT_TO`
- `ADDS_FALSIFIER_TO`
- `NARROWS_SCOPE_OF`
- `INFLATES_CLAIM_OF`
- `READ_NEXT`
- `START_ROUTE_TO`
- `NAVIGATES_TO`

Surface translation changes platform-facing expression. Epistemic lift changes representational register. They remain separate even when the same pair participates in both. A future commutation test is an assay result, not a relation type.

## Graph and temporal provenance

Every v2 edge identifies one graph kind:

- `HISTORICAL` — publication or declared genealogy;
- `CONCEPTUAL` — intellectual dependence or complementarity;
- `OPERATIONAL` — formalization, measurement, compilation, or application;
- `NAVIGATIONAL` — a reader-facing traversal route;
- `MANIFESTATION` — edition/platform/capture identity;
- `AUTHORITY` — canon, legacy, control, or scope status.

Every v2 edge also identifies one temporal provenance mode:

- `CONTEMPORANEOUS`;
- `FORWARD_DECLARED`;
- `RETROSPECTIVE`;
- `INFERRED`;
- `UNRESOLVED`.

Typed cycles are allowed. For example, one work may provide intuition for another while the second supplies the first's method. The conceptual or operational cycle must not be projected into a false historical cycle.

Normalized vocabulary never replaces the source predicate. For example, `companion`, `methodological foundation`, `complements`, `proof layer`, `spine`, `interface`, and `umbrella synthesis` remain separately retrievable even when the graph also offers a broader relation family.

## Minimal edge record

```json
{
  "schema_version": "relation-assertion/v2",
  "edge_id": "archive-assigned ID",
  "from_id": "work/edition/concept/formulation ID",
  "relation": "ROUTES_TO",
  "to_id": "work/edition/concept/formulation ID",
  "graph_kind": "CONCEPTUAL",
  "declared_by_id": "manifestation ID or null",
  "compiled_into_id": null,
  "source_predicate_raw": "exact source wording or null",
  "origin": "explicit-source | archive-inferred | researcher-proposed",
  "relation_provenance_mode": "CONTEMPORANEOUS | FORWARD_DECLARED | RETROSPECTIVE | INFERRED | UNRESOLVED",
  "source_time": null,
  "subject_time": null,
  "scope": {},
  "derived_from_edge_ids": [],
  "route_context": null,
  "ordinal": null,
  "evidence_ids": ["sr-evidence:..."],
  "adjudication_status": "WITNESSED | CANDIDATE | DISPUTED | REJECTED | UNRESOLVED",
  "interpretive_limit": "What this edge does not establish."
}
```

Absence of an expected edge is preserved as a search result, not silently repaired. Contradictions and cycles are allowed to remain visible.
