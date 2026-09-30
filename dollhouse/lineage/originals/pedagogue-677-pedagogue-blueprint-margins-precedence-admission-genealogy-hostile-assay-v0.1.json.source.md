{
  "schema": "td613.pedagogue.precedence-admission-genealogy-hostile-assay/v0.1",
  "research_surface": "PR#677",
  "status": "PREREGISTERED_PRE_EXECUTION",
  "inherited_candidate": {
    "id": "C5_WEAVE_REVISION_LEDGER",
    "bounded_prior_verdict": "WEAVE_REVISION_LEDGER_CANDIDATE_SURVIVES_BOUNDED_MOVING_FLOORPLAN",
    "relation_revision_jurisdiction_preserved": true,
    "precedence_admission_provenance_sufficiency_presumed": false
  },
  "candidate": {
    "id": "C6_PRECEDENCE_ADMISSION_GENEALOGY",
    "display_name": "Precedence Admission Genealogy",
    "promotion_status": "ATTACK_ONLY_NOT_PROMOTED",
    "presumption_of_survival": false,
    "rule": "Admit a precedence edge only through at least one active predeclared admissible bounded support record with a matching witness payload; preserve every semantically distinct lawful support lineage and rejected candidate support; support revocation changes support genealogy even when relation semantics remain unchanged; witness identifiers and serialization order may not choose authority; sealed admission records are immutable."
  },
  "frozen_scope": {
    "event_set_fixed": true,
    "semantic_event_identities_fixed": true,
    "baseline_evidence_fixed": true,
    "warrant_rules_fixed": true,
    "requested_warrant_fixed": true,
    "contradiction_families_fixed": true,
    "edge_candidate_set_fixed": true,
    "only_edge_admission_support_posture_varies": true,
    "sampling_allowed": false,
    "scalar_aggregation_allowed": false
  },
  "support_record_contract": {
    "fields": [
      "admission_id",
      "edge",
      "semantic_support_kind",
      "predeclared",
      "admissible",
      "witnessed",
      "witness_payload",
      "active"
    ],
    "lawful_when": [
      "predeclared=true",
      "admissible=true",
      "witnessed=true",
      "witness_payload_matches_declared_edge",
      "active=true"
    ],
    "edge_admitted_when": "AT_LEAST_ONE_ACTIVE_LAWFUL_SUPPORT_LINEAGE"
  },
  "strong_falsifier": {
    "id": "BM01_SAME_LINE_DIFFERENT_PENCIL",
    "edge": ["PINK", "BLUE"],
    "state_a_support_kind": "DECLARATION_ALPHA",
    "state_b_support_kind": "DECLARATION_BETA",
    "required": {
      "semantic_relation_equal": true,
      "current_weave_posture_equal": true,
      "admission_genealogy_equal": false
    }
  },
  "hostile_rooms": [
    "BM01_SAME_LINE_DIFFERENT_PENCIL",
    "BM02_MULTIPLE_LAWFUL_SUPPORTS_ONE_EDGE",
    "BM03_ONE_OF_MULTIPLE_SUPPORTS_REVOKED",
    "BM04_ALL_LAWFUL_SUPPORTS_REVOKED",
    "BM05_FALSE_WITNESS_BADGE",
    "BM06_IDENTIFIER_SERIALIZATION_INVARIANCE",
    "BM07_INVALID_SUPPORT_SORTS_FIRST_VALID_SUPPORT_LATER",
    "BM08_OPPOSING_EDGES_CYCLIC_RELATION",
    "BM09_SEALED_ADMISSION_RECORD_MUTATION",
    "BM10_RELATION_ONLY_COMPACTION",
    "BM11_SAME_SEMANTIC_SUPPORT_NEW_RECORD_ID",
    "BM12_ACTIVE_SCOPE_WITHDRAWAL"
  ],
  "required_refusals": [
    "REFUSE_UNWITNESSED_EDGE_ADMISSION",
    "REJECT_CYCLIC_OR_INCONSISTENT_PRECEDENCE",
    "SEALED_EDGE_ADMISSION_RECORD_IMMUTABLE"
  ],
  "verdicts": {
    "inherited_c5_overclaim": "WEAVE_REVISION_LEDGER_C5_FALSIFIED_AS_PRECEDENCE_ADMISSION_PROVENANCE_SUFFICIENT_FORM",
    "c6_survival": "PRECEDENCE_ADMISSION_GENEALOGY_CANDIDATE_SURVIVES_BOUNDED_BLUEPRINT_MARGINS",
    "c6_falsification": "PRECEDENCE_ADMISSION_GENEALOGY_CANDIDATE_FALSIFIED_IN_BOUNDED_BLUEPRINT_MARGINS"
  },
  "holds": {
    "C6_promotion": false,
    "H2": "HELD_NOT_TESTED_HERE",
    "H3": "HELD_NOT_TESTED_HERE",
    "M_x_D": "HELD",
    "M_x_P": "HELD",
    "D_x_P": "HELD",
    "M_x_D_x_P": "HELD",
    "APERTURE_V32_REPLAY_STABILITY": "HELD_NOT_YET_WITNESSED"
  },
  "claim_ceiling": {
    "truth_of_precedence_edge": false,
    "causal_order": false,
    "witness_credibility": false,
    "human_testimony_reliability": false,
    "real_world_concurrency_semantics": false,
    "lamport_clocks": false,
    "vector_clocks": false,
    "distributed_consensus": false,
    "distributed_log_correctness": false,
    "serializability_theorem": false,
    "temporal_database_completeness": false,
    "event_sourcing_completeness": false,
    "truth_maintenance_completeness": false,
    "provenance_algebra": false,
    "proof_theory": false,
    "category_lattice_sheaf_structure": false,
    "physical_time_law": false,
    "connection_curvature_holonomy": false,
    "quantum_identity": false,
    "autonomous_scientific_authority": false
  },
  "authority": {
    "research_target_admitted_by_operator": true,
    "major_research_decisions_self_authorized_in_pr677_lane": true,
    "product_mutation": false,
    "shared_pedagogue_engine_mutation": false,
    "workflow_mutation": false,
    "browser_execution": false,
    "merge_authority_for_this_assay": false,
    "deployment_authority": false,
    "release_authority": false,
    "vercel_release_requires_issue_405_and_new_explicit_operator_gesture": true,
    "promotion_authority": false
  }
}
