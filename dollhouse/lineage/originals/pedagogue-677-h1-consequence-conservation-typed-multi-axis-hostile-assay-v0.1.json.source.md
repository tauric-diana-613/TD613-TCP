{
  "schema": "td613.pedagogue.h1-consequence-conservation-typed-multi-axis-hostile-assay/v0.1",
  "assay_id": "pr677-h1-consequence-conservation-hostile-2026-08-20",
  "status": "AUTHORED_PRE_EXECUTION_HOSTILE_RESEARCH_ONLY_HUMAN_GATED",
  "target": {
    "hypothesis_id": "H1",
    "name": "CONSEQUENCE_CONSERVATION",
    "status_before_execution": "HIGH_SPECULATION_HELD",
    "generic_claim": "A representation should not carry more certainty, scope, role, or consequence than the underlying state transition can support.",
    "promotion_authority": false
  },
  "held_siblings": {
    "H2_APERTURE_BEFORE_ABSENCE": "HELD_NOT_TESTED_HERE",
    "H3_ROLE_BEFORE_REPETITION": "HELD_NOT_TESTED_HERE"
  },
  "repository_provenance": {
    "repo": "tauric-diana-613/TD613-TCP",
    "pr": 677,
    "branch": "pedagogue/giving-interface-audit-stage-20260818",
    "pre_hostile_head": "11f2006ad4081223e64b6923c0a41fcb8d49c7ab",
    "hostile_spec_commit": "0048158cf2fcc534b9b6000dd4452a7a7ef93d90",
    "pr686_exact_final_head": "ee62dada550f50259172123446b6e9c3a35d6b31",
    "pr686_merge_commit": "d57228af7f9e83d0a04e24aea524767624098c2e"
  },
  "source_artifacts": [
    "docs/pedagogue/GIVING_12_STEP_REPO_TRANSFER_EXECUTION_2026-08-18.md",
    "docs/pedagogue/giving-12-step-repo-transfer-execution-v0.1.json",
    "app/dome-world/docs/ash/experiments/a15-r0/APERTURE_PEDAGOGUE_REPLAY_STABILITY_RECEIPT_V0_1.md",
    "app/dome-world/docs/ash/experiments/a15-r0/APERTURE_PEDAGOGUE_CONSEQUENCE_CONDITIONED_SELECTION_RECEIPT_V0_1.md",
    "app/dome-world/docs/ash/experiments/a15-r0/APERTURE_PEDAGOGUE_REPLAY_SENSITIVITY_GATE_VS_ANNOTATION_RECEIPT_V0_1.md",
    "app/dome-world/docs/ash/experiments/a15-r0/APERTURE_PEDAGOGUE_TYPED_MULTI_AXIS_REPLAY_COMPOSITION_SPEC_V0_1.md",
    "app/dome-world/previews/a15-r0/aperture-pedagogue-typed-multi-axis-replay.js",
    "app/dome-world/previews/a15-r0/aperture-pedagogue-replay-sensitivity-gate.js",
    "app/dome-world/previews/a15-r0/moss-lantern-temporal-order-assay.js",
    "docs/CANONICAL_PRACTICE_FIXTURE.md"
  ],
  "anti_equivalences": [
    "measurement_model != decision_specification",
    "decision_specification != route_provenance",
    "measurement_model != route_provenance",
    "measurement_admissibility != decision_value",
    "diagnostic_stability != question_selection_stability",
    "selected_under_declared_loss != universally_best",
    "same_endpoint != same_route",
    "axis_movement != mandatory_cross_axis_consequence_movement",
    "multi_axis_receipt != scalar_confidence",
    "hostile_assay != doctrine"
  ],
  "scalar_aggregation": {
    "authorized": false,
    "forbidden_requests": [
      "confidence",
      "certainty",
      "robustness",
      "trust",
      "replay_stability_score",
      "combined_consequence_score"
    ],
    "required_refusal": "REFUSE_TYPED_MULTI_AXIS_SCALAR_COLLAPSE",
    "scalar_value": null
  },
  "baseline": {
    "result_status": "UNEXECUTED",
    "measurement_model": {
      "axis_type": "MEASUREMENT_MODEL",
      "source_fixture_id": "F2_MEASUREMENT_MODEL_SELECTION_SENSITIVITY",
      "covariance_family": "Sigma(rho)=[[1,rho],[rho,1]]",
      "fixed_decision_s": 0.55,
      "analytic_boundary_rho": 0.527511006183077,
      "epsilon": 0.0001,
      "before_rho": 0.527411006183077,
      "after_rho": 0.527611006183077,
      "inherited_measurement_admissibility": "STABLE_VALID"
    },
    "decision_specification": {
      "axis_type": "DECISION_SPECIFICATION",
      "source_fixture_id": "F3_DECISION_SPECIFICATION_SELECTION_SENSITIVITY",
      "fixed_measurement_rho": 0.546918160706758,
      "analytic_boundary_s": 0.528595479176951,
      "epsilon": 0.0001,
      "before_s": 0.528495479176951,
      "after_s": 0.528695479176951,
      "loss_path": {
        "w_Y": "(1-s)/2",
        "w_DIFF": "(1-s)/2",
        "w_SUM": "s"
      },
      "aggregation_rule": "WEIGHTED_SUM",
      "declared_pre_observation": true
    },
    "route_provenance": {
      "axis_type": "ROUTE_PROVENANCE",
      "source_fixture_id": "MOSS_LANTERN_ML3_DECLARED_ROUTE_FAMILY",
      "before": {
        "route_id": "ML3-R01",
        "open_boundary": "open-practice-case",
        "operation_order": [
          "custody-hold",
          "projection-observe",
          "rest",
          "prepare-return"
        ],
        "terminal_action": "return",
        "endpoint": "returned-practice-capsule"
      },
      "after": {
        "route_id": "ML3-R02",
        "open_boundary": "open-practice-case",
        "operation_order": [
          "custody-hold",
          "projection-observe",
          "prepare-return",
          "rest"
        ],
        "terminal_action": "return",
        "endpoint": "returned-practice-capsule"
      },
      "endpoint_equal": true
    },
    "observation_state": "UNEXECUTED",
    "admissibility_state": "UNEXECUTED_IN_COMPOSED_H1_ASSAY",
    "proposal_state": "UNEXECUTED",
    "downstream_consequence": "UNEXECUTED"
  },
  "single_axis_chambers": [
    {
      "id": "A1_MEASUREMENT_STABLE_INTERIOR",
      "axis": "MEASUREMENT_MODEL",
      "source_fixture_id": "F1_STABLE_INTERIOR",
      "fixed": {
        "decision_s": 0.4,
        "route_id": "ML3-R01"
      },
      "rho_values": [0.49, 0.5, 0.51],
      "required_inherited_posture": {
        "measurement_admissibility": "STABLE_VALID",
        "selection_stability": "STABLE"
      },
      "hostile_purpose": "Reject an over-coupled H1 reading that requires every valid measurement-axis movement to force consequence movement.",
      "result": "UNEXECUTED_IN_H1_ASSAY"
    },
    {
      "id": "A2_MEASUREMENT_BOUNDARY",
      "axis": "MEASUREMENT_MODEL",
      "before": 0.527411006183077,
      "after": 0.527611006183077,
      "coordinate": "rho",
      "fixed": {
        "decision_s": 0.55,
        "route_id": "ML3-R01"
      },
      "required_invariants": [
        "decision_specification_unchanged",
        "route_provenance_unchanged",
        "candidate_measurement_admissibility_remains_valid"
      ],
      "result": "UNEXECUTED"
    },
    {
      "id": "B1_DECISION_ONLY_PRIMARY_CORPSE_CE_D1",
      "axis": "DECISION_SPECIFICATION",
      "before": 0.528495479176951,
      "after": 0.528695479176951,
      "coordinate": "s",
      "fixed": {
        "measurement_rho": 0.546918160706758,
        "route_id": "ML3-R01"
      },
      "required_invariants": [
        "measurement_model_unchanged",
        "candidate_measurement_admissibility_unchanged",
        "route_provenance_unchanged"
      ],
      "corpse_criterion": "If generic H1 treats the underlying measurement/state transition alone as determining representational consequence, a legitimate predeclared D-only selection change falsifies that generic form. Survival by importing D into the support domain must be classified H1_REQUIRES_DECISION_DECLARATION, not generic survival.",
      "result": "UNEXECUTED"
    },
    {
      "id": "C1_ROUTE_ONLY_PRIMARY_CORPSE_CE_P1",
      "axis": "ROUTE_PROVENANCE",
      "before": "ML3-R01",
      "after": "ML3-R02",
      "fixed": {
        "measurement_model": "DECLARED_FIXED",
        "decision_specification": "DECLARED_FIXED",
        "endpoint": "returned-practice-capsule"
      },
      "required_invariants": [
        "measurement_model_unchanged",
        "decision_specification_unchanged",
        "endpoint_unchanged",
        "open_boundary_unchanged",
        "terminal_action_unchanged",
        "operation_multiset_unchanged"
      ],
      "required_changes": [
        "route_id_changed",
        "operation_order_changed"
      ],
      "corpse_criterion": "If generic H1 treats endpoint equality as support equivalence, legitimate route-history consequence under equal endpoint falsifies that endpoint-only reading. Survival by importing route history must be classified H1_REQUIRES_ROUTE_TERM.",
      "result": "UNEXECUTED"
    }
  ],
  "negative_controls": [
    {
      "id": "NC_SAME_ROUTE",
      "input": "ML3-R01 -> ML3-R01",
      "required": "route_provenance_changed=false"
    },
    {
      "id": "NC_INCOMPLETE_UNCERTAINTY",
      "required": "NOISE_GEOMETRY_INCOMPLETE -> ABSTAIN"
    },
    {
      "id": "NC_INVALID_UNCERTAINTY",
      "required": "INVALID_NOISE_GEOMETRY -> REJECT"
    },
    {
      "id": "NC_UNDECLARED_DECISION_LOSS",
      "required": "NO_SELECTION_UNDECLARED_DECISION_LOSS"
    },
    {
      "id": "NC_CONFLICTING_LOSSES_WITHOUT_AGGREGATION",
      "required": "NO_SELECTION_CONFLICTING_LOSSES_WITHOUT_AGGREGATION_RULE"
    },
    {
      "id": "NC_POSTHOC_DECISION_MUTATION",
      "required": "POSTHOC_DECISION_LOSS_MUTATION_NOT_CONFIRMATORY"
    },
    {
      "id": "NC_UNSUPPORTED_AGGREGATION_RULE",
      "origin": {
        "pr": 686,
        "review_comment_id": 3826839372
      },
      "input_examples": [
        "aggregation_rule missing",
        "aggregation_rule=MAX"
      ],
      "required": "EXPLICIT_REFUSAL_SELECTED_PROBE_NULL"
    },
    {
      "id": "NC_EXACT_DECISION_LOSS_TIE",
      "origin": {
        "pr": 686,
        "review_comment_id": 3826839374
      },
      "required": "NO_UNIQUE_SELECTION_DECISION_LOSS_TIE_OR_DECLARED_CANDIDATE_SET",
      "forbidden": "LEXICOGRAPHIC_PROBE_ID_TIE_BREAK"
    },
    {
      "id": "NC_SCALAR_COLLAPSE",
      "required": "REFUSE_TYPED_MULTI_AXIS_SCALAR_COLLAPSE"
    }
  ],
  "counterexample_search_order": [
    "NC_SAME_ROUTE",
    "A1_MEASUREMENT_STABLE_INTERIOR",
    "A2_MEASUREMENT_BOUNDARY",
    "NC_INCOMPLETE_UNCERTAINTY",
    "NC_INVALID_UNCERTAINTY",
    "B1_DECISION_ONLY_PRIMARY_CORPSE_CE_D1",
    "NC_POSTHOC_DECISION_MUTATION",
    "NC_UNDECLARED_DECISION_LOSS",
    "NC_CONFLICTING_LOSSES_WITHOUT_AGGREGATION",
    "NC_UNSUPPORTED_AGGREGATION_RULE",
    "NC_EXACT_DECISION_LOSS_TIE",
    "C1_ROUTE_ONLY_PRIMARY_CORPSE_CE_P1",
    "NC_SCALAR_COLLAPSE"
  ],
  "intersection_program": {
    "execution_status": "HELD_UNTIL_SINGLE_AXIS_RECEIPTS_ARE_INTELLIGIBLE",
    "axes": [
      "M_X_D",
      "M_X_P",
      "D_X_P",
      "M_X_D_X_P"
    ],
    "candidate_structures": [
      "SEPARABLE",
      "CONDITIONAL",
      "PATH_DEPENDENT",
      "PARTIALLY_ORDERED",
      "NON_COMPOSABLE",
      "UNDERDETERMINED"
    ]
  },
  "verdict_vocabulary": [
    "GENERIC_H1_FALSIFIED",
    "H1_SURVIVES_ONLY_WITH_TYPED_DOMAIN",
    "H1_SURVIVES_CURRENT_FIXTURE",
    "H1_UNDERDETERMINED",
    "H1_NONCOMPOSABLE_ACROSS_AXES",
    "H1_REQUIRES_ROUTE_TERM",
    "H1_REQUIRES_DECISION_DECLARATION",
    "H1_REQUIRES_MEASUREMENT_DOMAIN"
  ],
  "candidate_typed_rescue": {
    "status": "ATTACK_ONLY_NOT_PROMOTED",
    "text": "For a declared typed axis a, a consequence claim carried on a may not silently widen beyond evidence carried on a.",
    "presumption_of_survival": false
  },
  "required_receipt_fields": [
    "fixture_id",
    "source_status",
    "baseline",
    "measurement_model.before",
    "measurement_model.after",
    "measurement_model.changed",
    "decision_specification.before",
    "decision_specification.after",
    "decision_specification.changed",
    "decision_specification.declared_pre_observation",
    "route_provenance.before",
    "route_provenance.after",
    "route_provenance.changed",
    "route_provenance.endpoint_equal",
    "aperture",
    "missingness",
    "uncertainty",
    "admissibility_result",
    "proposal_result",
    "consequence_result",
    "h1_prediction",
    "observed_relation",
    "counterexample_found",
    "alternative_explanations",
    "defeat_conditions",
    "scalar_aggregation_used",
    "promotion_authority",
    "human_closure_required"
  ],
  "claim_ceiling": {
    "universal_conservation_law": false,
    "universal_decision_theory": false,
    "optimal_experimental_design": false,
    "active_learning_optimality": false,
    "information_geometry": false,
    "fisher_geometry": false,
    "physical_sensor_design": false,
    "physical_tomography": false,
    "medical_tomography": false,
    "human_tomography": false,
    "blind_tomography": false,
    "operator_tomography": false,
    "autonomous_science": false,
    "connection": false,
    "curvature": false,
    "holonomy": false,
    "berry_phase": false,
    "berry_curvature": false,
    "quantum_coherence": false,
    "quantum_behavior": false,
    "proto_loom": false,
    "production_authority": false,
    "release_authority": false
  },
  "authority": {
    "product_mutation": false,
    "pedagogue_engine_mutation": false,
    "workflow_mutation": false,
    "browser_execution": false,
    "deployment_authority": false,
    "release_authority": false,
    "automatic_execution": false,
    "automatic_transfer": false,
    "hypothesis_promotion": false,
    "human_closure_required": true
  }
}
