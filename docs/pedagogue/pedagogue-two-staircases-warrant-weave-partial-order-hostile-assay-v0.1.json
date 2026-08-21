{
  "schema": "td613.pedagogue.warrant-weave-partial-order-hostile-assay/v0.1",
  "status": "PREREGISTERED_PRE_EXECUTION",
  "candidate": {
    "id": "C4_WARRANT_WEAVE",
    "display_name": "Warrant Weave",
    "promotion_status": "ATTACK_ONLY_NOT_PROMOTED",
    "presumption_of_survival": false
  },
  "inherited_candidate": {
    "id": "C3_WARRANT_EPISODE_LEDGER",
    "bounded_result": "WARRANT_EPISODE_LEDGER_CANDIDATE_SURVIVES_BOUNDED_AFTER_MIDNIGHT",
    "serial_history_scope_preserved": true,
    "partial_order_custody_sufficiency_under_attack": true
  },
  "enumeration": {
    "max_events": 8,
    "sampling_allowed": false,
    "approximation_allowed": false,
    "lexical_tiebreak_allowed": false,
    "input_order_tiebreak_allowed": false
  },
  "central_fixture": {
    "requested_warrant": "IDENTIFIABILITY:W",
    "baseline_evidence": [
      {"evidence_id": "A", "warrants": ["MEASUREMENT:A"]},
      {"evidence_id": "B", "warrants": ["MEASUREMENT:B"]}
    ],
    "rules": [
      {"rule_id": "AB", "requires": ["MEASUREMENT:A", "MEASUREMENT:B"], "produces": "IDENTIFIABILITY:W", "predeclared": true, "admissible": true, "replayable": true},
      {"rule_id": "CD", "requires": ["MEASUREMENT:C", "MEASUREMENT:D"], "produces": "IDENTIFIABILITY:W", "predeclared": true, "admissible": true, "replayable": true}
    ],
    "events": [
      {"event_id": "PINK", "kind": "REMOVE_EVIDENCE", "remove_evidence_ids": ["A"]},
      {"event_id": "BLUE", "kind": "ADD_EVIDENCE", "add_evidence": [
        {"evidence_id": "C", "warrants": ["MEASUREMENT:C"]},
        {"evidence_id": "D", "warrants": ["MEASUREMENT:D"]}
      ]}
    ],
    "precedence_edges": [],
    "required_admissible_serializations": [["PINK", "BLUE"], ["BLUE", "PINK"]],
    "required_final_presence": "IDENTIFIED_PRESENT",
    "required_transient_support_disposition": "ABSTAIN_TRANSIENT_HISTORY_NOT_IDENTIFIED_BY_PARTIAL_ORDER"
  },
  "hostile_rooms": [
    "TS01_TWO_STAIRCASES",
    "TS02_IDENTIFIER_RENAMING_INVARIANCE",
    "TS03_PRECEDENCE_WITHDRAW_THEN_ADD",
    "TS04_PRECEDENCE_ADD_THEN_WITHDRAW",
    "TS05_CYCLIC_PRECEDENCE",
    "TS06_UNRELATED_CONCURRENT_EVENT",
    "TS07_CONTRADICTION_HISTORY_AMBIGUITY",
    "TS08_REPLAY_SUPPORT_HANDOFF",
    "TS09_SEMANTIC_NOOP",
    "TS10_FINAL_STATE_COMPACTION_ATTACK"
  ],
  "verdicts": {
    "c3_partial_order_overclaim": "WARRANT_EPISODE_LEDGER_C3_FALSIFIED_AS_PARTIAL_ORDER_CUSTODY_SUFFICIENT_FORM",
    "c4_survival": "WARRANT_WEAVE_CANDIDATE_SURVIVES_BOUNDED_TWO_STAIRCASES",
    "c4_falsification": "WARRANT_WEAVE_CANDIDATE_FALSIFIED_IN_BOUNDED_TWO_STAIRCASES",
    "ambiguity": "ABSTAIN_TRANSIENT_HISTORY_NOT_IDENTIFIED_BY_PARTIAL_ORDER",
    "cycle": "REJECT_CYCLIC_OR_INCONSISTENT_PRECEDENCE"
  },
  "holds": {
    "C4_promotion": false,
    "H2": "HELD_NOT_TESTED_HERE",
    "H3": "HELD_NOT_TESTED_HERE",
    "MxD": "HELD",
    "MxP": "HELD",
    "DxP": "HELD",
    "MxDxP": "HELD",
    "APERTURE_V32_REPLAY_STABILITY": "HELD_NOT_YET_WITNESSED"
  },
  "authority": {
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
