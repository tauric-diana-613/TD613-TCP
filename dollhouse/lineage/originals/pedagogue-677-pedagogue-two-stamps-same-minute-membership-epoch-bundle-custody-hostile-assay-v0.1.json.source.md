{
  "schema": "td613.pedagogue.membership-epoch-bundle-custody-hostile-assay/v0.1",
  "assay_name": "Two Stamps Same Minute",
  "status": "PREREGISTERED_PRE_EXECUTION_ATTACK_ONLY_HUMAN_GATED",
  "candidate_under_attack": "C8_EVENT_MEMBERSHIP_REVISION_CUSTODY",
  "candidate_descendant": "C9_MEMBERSHIP_EPOCH_BUNDLE_CUSTODY",
  "presumption_of_survival": false,
  "strong_falsifier": {
    "case_id": "TSMM01_TWO_STAMPS_ALPHABET_WINS",
    "semantic_event_key": "ADD_REPLACEMENT_LINEAGE",
    "epoch": 1,
    "records": [
      {
        "membership_id": "AAA_WITHDRAW",
        "active": false,
        "revision_kind": "WITHDRAW"
      },
      {
        "membership_id": "ZZZ_ADMIT",
        "active": true,
        "revision_kind": "ADMIT"
      }
    ],
    "required_c8_overclaim": "MEMBERSHIP_ID_LEXICAL_ORDER_SELECTS_SAME_EPOCH_DISPOSITION",
    "required_c9_posture": "ABSTAIN_CONFLICTING_SAME_EPOCH_EVENT_MEMBERSHIP"
  },
  "hostile_cases": [
    "TSMM01_TWO_STAMPS_ALPHABET_WINS",
    "TSMM02_RENAME_THE_STAMPS",
    "TSMM03_REVERSE_THE_FOLDER",
    "TSMM04_TWO_YES_STAMPS",
    "TSMM05_TWO_NO_STAMPS",
    "TSMM06_EPISODE_HALLUCINATION_CONTROL",
    "TSMM07_DISTINCT_EPOCH_CONTROL",
    "TSMM08_INHERITED_RAW_BINDING_CONFLICT",
    "TSMM09_BAD_RECORD_SORTS_LAST",
    "TSMM10_DUPLICATE_ID_CONTROL",
    "TSMM11_BUNDLE_COMPACTION",
    "TSMM12_SEALED_BUNDLE_MUTATION"
  ],
  "candidate_statuses": [
    "UNIFORM_ACTIVE_MEMBERSHIP_EPOCH_BUNDLE",
    "UNIFORM_INACTIVE_MEMBERSHIP_EPOCH_BUNDLE",
    "ABSTAIN_CONFLICTING_SAME_EPOCH_EVENT_MEMBERSHIP"
  ],
  "possible_verdicts": [
    "MEMBERSHIP_EPOCH_BUNDLE_CUSTODY_CANDIDATE_SURVIVES_BOUNDED_TWO_STAMPS_SAME_MINUTE",
    "MEMBERSHIP_EPOCH_BUNDLE_CUSTODY_CANDIDATE_FALSIFIED_IN_BOUNDED_TWO_STAMPS_SAME_MINUTE"
  ],
  "possible_inherited_verdicts": [
    "EVENT_MEMBERSHIP_REVISION_CUSTODY_C8_FALSIFIED_AS_SAME_EPOCH_ARBITRATION_SUFFICIENT_FORM",
    "C8_SAME_EPOCH_ARBITRATION_OVERCLAIM_NOT_ESTABLISHED_IN_THIS_RUN"
  ],
  "frozen_scope": {
    "c8_witness_replay_semantics": true,
    "c8_distinct_epoch_membership_semantics": true,
    "same_semantic_event_inside_primary_rooms": true,
    "same_epoch_inside_primary_rooms": true,
    "sampling_forbidden": true,
    "scalar_aggregation_forbidden": true,
    "product_mutation": false,
    "shared_pedagogue_engine_mutation": false,
    "workflow_mutation": false,
    "browser_execution": false,
    "merge": false,
    "deployment": false,
    "release": false
  },
  "holds": {
    "H2": "HELD_NOT_TESTED_HERE",
    "H3": "HELD_NOT_TESTED_HERE",
    "intersections": "HELD_NOT_OPENED_HERE",
    "APERTURE_V32_REPLAY_STABILITY": "HELD_NOT_YET_WITNESSED"
  },
  "promotion_authority": false
}
