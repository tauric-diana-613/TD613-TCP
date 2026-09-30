{
  "schema": "td613.pedagogue.event-membership-revision-custody-hostile-assay/v0.1",
  "assay_name": "Cut-and-Paste",
  "status": "PREREGISTERED_PRE_EXECUTION",
  "research_surface": "PR_677",
  "inherited_candidate": {
    "id": "C7_ADMISSION_WITNESS_REPLAY_CUSTODY",
    "bounded_result_preserved": true,
    "fixed_event_set_jurisdiction_preserved": true,
    "candidate_survival_verdict": "ADMISSION_WITNESS_REPLAY_CUSTODY_CANDIDATE_SURVIVES_BOUNDED_CARBON_PAPER"
  },
  "candidate": {
    "id": "C8_EVENT_MEMBERSHIP_REVISION_CUSTODY",
    "display_name": "Event Membership Revision Custody",
    "promotion_status": "ATTACK_ONLY_NOT_PROMOTED",
    "presumption_of_survival": false
  },
  "frozen_scope": {
    "base_witness_replay_derivation_grammar_fixed": true,
    "c7_replay_validation_semantics_fixed": true,
    "precedence_relation_construction_inherited": true,
    "event_membership_state_variable": true,
    "event_membership_history_variable": true,
    "sampling_allowed": false,
    "scalar_aggregation_allowed": false
  },
  "strong_falsifier": {
    "case_id": "CPX01_MISSING_SHEET",
    "prior_event_universe": ["PINK", "BLUE"],
    "current_event_universe": ["PINK"],
    "witness_provenance_unchanged": true,
    "required_c7_control": "WITNESS_REPLAY_STILL_INTERNALLY_VALID",
    "required_c8_status": "REFUSE_CURRENT_EDGE_EVENT_MEMBERSHIP_INCOMPLETE",
    "required_historical_witness_custody_preserved": true,
    "required_current_edge_admitted": false
  },
  "hostile_rooms": [
    {"id":"CPX01","name":"Missing Sheet"},
    {"id":"CPX02","name":"Same Label, New Paper"},
    {"id":"CPX03","name":"New Label, Same Paper"},
    {"id":"CPX04","name":"Gone and Back"},
    {"id":"CPX05","name":"Same Current Set, Different Past"},
    {"id":"CPX06","name":"Split Sheet"},
    {"id":"CPX07","name":"Pasted Sheets"},
    {"id":"CPX08","name":"Bad Revision Sorts First"},
    {"id":"CPX09","name":"Conflicting Current Membership"},
    {"id":"CPX10","name":"Current-Set Compaction"},
    {"id":"CPX11","name":"Post-Hoc Scissors"},
    {"id":"CPX12","name":"Old-Universe Replay"}
  ],
  "candidate_verdicts": [
    "EVENT_MEMBERSHIP_REVISION_CUSTODY_CANDIDATE_SURVIVES_BOUNDED_CUT_AND_PASTE",
    "EVENT_MEMBERSHIP_REVISION_CUSTODY_CANDIDATE_FALSIFIED_IN_BOUNDED_CUT_AND_PASTE"
  ],
  "inherited_overclaim_verdicts": [
    "ADMISSION_WITNESS_REPLAY_CUSTODY_C7_FALSIFIED_AS_EVENT_MEMBERSHIP_REVISION_SUFFICIENT_FORM",
    "C7_EVENT_MEMBERSHIP_REVISION_OVERCLAIM_NOT_ESTABLISHED_IN_THIS_RUN"
  ],
  "defeat_conditions": [
    "INACTIVE_EVENT_RETAINS_CURRENT_EDGE_AUTHORITY",
    "RAW_EVENT_ID_REUSE_LAUNDERS_SEMANTIC_CONTINUITY",
    "SEMANTIC_RENAME_BREAKS_DECLARED_CONTINUITY",
    "REINTRODUCTION_ERASES_MEMBERSHIP_GAP",
    "CURRENT_SET_EQUALITY_ERASES_REVISION_HISTORY",
    "SPLIT_DESCENDANT_INHERITS_WITNESS_WITHOUT_BRIDGE",
    "MERGED_DESCENDANT_INHERITS_WITNESS_WITHOUT_BRIDGE",
    "EVENT_AUTHORITY_SELECTED_BY_IDENTIFIER_OR_SERIALIZATION",
    "CONFLICTING_EVENT_MEMBERSHIP_FORCED_TO_UNIQUE_SEMANTICS",
    "CURRENT_SET_COMPACTION_OVERCLAIMS_HISTORY",
    "SEALED_EVENT_MEMBERSHIP_LEDGER_MUTATED",
    "HISTORICAL_WITNESS_ERASED_ON_EVENT_WITHDRAWAL"
  ],
  "holds": {
    "H2": "HELD_NOT_TESTED_HERE",
    "H3": "HELD_NOT_TESTED_HERE",
    "intersections": "HELD_NOT_OPENED_HERE",
    "APERTURE_V32_REPLAY_STABILITY": "HELD_NOT_YET_WITNESSED"
  },
  "authority": {
    "product_mutation": false,
    "shared_pedagogue_engine_mutation": false,
    "workflow_mutation": false,
    "browser_execution": false,
    "merge_performed": false,
    "deployment_authority": false,
    "release_authority": false,
    "vercel_release_requires_issue_405_and_new_explicit_operator_gesture": true,
    "promotion_authority": false
  }
}
