{
  "schema": "td613.pedagogue.precedence-witness-pre-admission-protocol-custody-hostile-assay/v0.1",
  "assay_name": "Witness Arrived With the Defendant",
  "candidate_descendant": "C12_PRECEDENCE_WITNESS_PRE_ADMISSION_PROTOCOL_CUSTODY",
  "parent_receipt": "8961b7aa754a3c20841dfa51cc08ea2523e45f72",
  "status": "PREREGISTERED_PRE_EXECUTION_ATTACK_ONLY_NOT_PROMOTED",
  "presumption_of_survival": false,
  "claim_ceiling": {
    "protocol_pre_admission_only": true,
    "external_chronology": false,
    "source_honesty": false,
    "institutional_independence": false,
    "cryptographic_authentication": false,
    "external_trust_root": false,
    "causal_precedence": false,
    "physical_time": false
  },
  "frozen_distinctions": [
    "separate argument != pre-admitted custody",
    "ledger record presence != prior protocol admission",
    "co-submitted witness != pre-admitted witness",
    "object separation != protocol-order separation",
    "material consistency != admission chronology",
    "pre-admitted in protocol != externally independent",
    "protocol order != source honesty"
  ],
  "required_protocol": {
    "phase_a": "WITNESS_ADMISSION",
    "phase_b": "BRIDGE_SUBMISSION_AND_EVALUATION",
    "phase_order": "A_BEFORE_B",
    "caller_declared_epoch_is_authority": false,
    "plain_object_clone_recreates_admission": false,
    "serialization_recreates_admission": false
  },
  "required_statuses": [
    "ADMIT_PRE_ADMITTED_PRECEDENCE_WITNESS",
    "REFUSE_CO_SUBMITTED_PRECEDENCE_WITNESS",
    "REFUSE_UNRECOGNIZED_PRE_ADMISSION_STATE",
    "REFUSE_LATE_PRECEDENCE_WITNESS_ADMISSION"
  ],
  "strong_falsifier": {
    "room": "WD01",
    "c11_expected": "ADMIT_CO_SUBMITTED_MATERIALLY_VALID_WITNESS_LEDGER",
    "c12_pre_admitted_expected": "ADMIT_PRE_ADMITTED_PRECEDENCE_WITNESS",
    "c12_co_submitted_expected": "REFUSE_CO_SUBMITTED_PRECEDENCE_WITNESS",
    "requires_same_run": [
      "C11_co_submitted_bridge_admitted=true",
      "C12_co_submitted_bridge_admitted=false",
      "C12_pre_admitted_bridge_admitted=true"
    ]
  },
  "rooms": [
    "WD01_WITNESS_ARRIVED_WITH_DEFENDANT",
    "WD02_COUNTERFEIT_ADMISSION_CARD",
    "WD03_ADMISSION_CARD_MUTATION",
    "WD04_BRIDGE_ID_RENAME",
    "WD05_MEMBERSHIP_ID_RENAME",
    "WD06_WITNESS_ID_RENAME_WITH_PRESERVED_ADMITTED_MATERIAL",
    "WD07_INPUT_REVERSAL",
    "WD08_LATE_ADMISSION",
    "WD09_PRE_ADMITTED_BUT_MISBOUND_WITNESS",
    "WD10_OPPOSITE_PRE_ADMITTED_BRIDGES",
    "WD11_SERIALIZED_SNAPSHOT_REPLAY",
    "WD12_NULL_NO_BRIDGE_CONTROL"
  ],
  "defeat_conditions": [
    "CO_SUBMITTED_WITNESS_ADMITTED_WITHOUT_PRIOR_PROTOCOL_STATE",
    "COUNTERFEIT_VISIBLE_CLONE_ADMITTED",
    "LEXICAL_IDENTIFIER_OR_INPUT_ORDER_GAINS_AUTHORITY",
    "LATE_WITNESS_RETROACTIVELY_AUTHORIZES_SUBMITTED_BRIDGE",
    "PRE_ADMISSION_OVERRIDES_MATERIAL_MISBINDING_REFUSAL",
    "OPPOSITE_PRECEDENCE_DIRECTIONS_FORCED_TO_UNIQUE_WINNER",
    "WITNESS_STATE_ALONE_INVENTS_PRECEDENCE",
    "SCALAR_TRUST_OR_CONFIDENCE_AGGREGATION_REQUIRED",
    "AUTHORITY_MEMBRANE_WIDENS"
  ],
  "candidate_verdicts": [
    "PRECEDENCE_WITNESS_PRE_ADMISSION_PROTOCOL_CUSTODY_CANDIDATE_SURVIVES_BOUNDED_WITNESS_ARRIVED_WITH_DEFENDANT",
    "PRECEDENCE_WITNESS_PRE_ADMISSION_PROTOCOL_CUSTODY_CANDIDATE_FALSIFIED_IN_BOUNDED_WITNESS_ARRIVED_WITH_DEFENDANT"
  ],
  "promotion_authority": false,
  "product_mutation": false,
  "shared_pedagogue_engine_mutation": false,
  "browser_execution": false,
  "workflow_mutation": false,
  "merge_performed": false,
  "deployment_performed": false,
  "release_authority": false,
  "vercel_release_requires_issue_405_and_new_explicit_operator_gesture": true,
  "H2": "HELD_NOT_TESTED_HERE",
  "H3": "HELD_NOT_TESTED_HERE",
  "intersections": "HELD_NOT_OPENED_HERE",
  "APERTURE_V32_REPLAY_STABILITY": "HELD_NOT_YET_WITNESSED"
}
