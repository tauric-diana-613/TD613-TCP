import fs from 'node:fs';
import crypto from 'node:crypto';
import {
  A16_SINGLE_SPLICE_INSTRUMENT_FIDELITY_PREFLIGHT_CERTIFICATE as PREFLIGHT
} from './a16-single-splice-instrument-fidelity-preflight.js';
import {
  WESTERN_HORIZON_EMPIRICAL_SHORE_REST_CERTIFICATE as EMPIRICAL_SHORE
} from './western-horizon-empirical-shore-rest.js';

export const A16_OPERATOR_WITNESS_EXTERIORITY_SCHEMA = 'td613.dome-world.a16-operator-witness-exteriority/v0.1';
export const A16_OPERATOR_WITNESS_EXTERIORITY_PARENT = '5cfcec23343a9550c314b6a933dd565ce183ea02';

const freeze = value => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
};
const digest = value => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
const read = path => fs.readFileSync(path, 'utf8');

const REVIEW_RECORD_FIELDS = freeze([
  'production URL and observation date',
  'desktop and mobile device/browser posture',
  'which profile and journey were entered',
  'whether Home, Map, Work, Choir, and Capsule feel materially distinct',
  'whether the canonical Flow-Core field and Play control remain visible and finite',
  'whether child-legible relation precedes technical terminology',
  'whether holds explain missingness and recovery',
  'whether profile and AIA-route changes produce meaningful—not cosmetic—differences',
  'any flicker, stale copy, dead control, cheap-looking component, density problem, navigation displacement, or authority confusion',
  'whether the operator can Rest, Return, and exit without penalty'
]);

export function runA16OperatorWitnessExteriority() {
  if (PREFLIGHT.status !== 'A16_SINGLE_SPLICE_INSTRUMENT_FIDELITY_PREFLIGHT_EARNED') {
    return freeze({ status: 'INADMISSIBLE', errors: ['A16_SINGLE_SPLICE_PREFLIGHT_PARENT_REQUIRED'] });
  }

  const handoff = read('app/dome-world/docs/ash/closure/ASH_KEEP_A16_A19_ENTRY_HANDOFF_V0_1.md');
  const release = read('app/dome-world/docs/ash/closure/ASH_KEEP_A15_PRODUCTION_RELEASE_RELOCK_RECEIPT_V0_1.md');

  const reviewMandatory = /The operator must review the production instrument before A16 product changes begin\./i.test(handoff);
  const reviewRecordedRequired = /operator review recorded = required/i.test(handoff);
  const a16BeforeReviewForbidden = /A16 start before review = forbidden/i.test(handoff);
  const greenPacketNotA16Validation = /A15 green browser packet ≠ A16 empirical validation/i.test(handoff);
  const deployedBodyNotOperatorAcceptance = /A15 deployed body ≠ operator acceptance/i.test(handoff);
  const browserEvidenceNotOperatorReview = /browser evidence ≠ operator visual review/i.test(release);
  const noReviewFindingRecorded = /No operator review finding is recorded by this receipt\./i.test(release);
  const reviewOpen = /operator visual review\s*=\s*OPEN/i.test(release);
  const a16AuthorityHeld = /A16 implementation authority\s*=\s*HELD/i.test(release);
  const humanClosureRequired = /human closure required\s*=\s*true/i.test(release);
  const reviewFieldContractPresent = REVIEW_RECORD_FIELDS.every(field => handoff.includes(field));

  const codeSideSufficiencyEarned = Boolean(
    PREFLIGHT.a16_preflight_architectural_sufficiency_earned === true &&
    PREFLIGHT.minimum_new_cross_subsystem_coupling_edges_under_current_api === 1 &&
    PREFLIGHT.authority_conserved_across_candidate_splice === true
  );

  const empiricalShoreNonbootstrapAvailable = Boolean(
    EMPIRICAL_SHORE.rest_official === true &&
    EMPIRICAL_SHORE.closed_system_successor_authority === false &&
    EMPIRICAL_SHORE.materially_new_evidentiary_substrate_required === true
  );

  const operatorWitnessExterior = Boolean(
    codeSideSufficiencyEarned &&
    reviewMandatory &&
    reviewRecordedRequired &&
    a16BeforeReviewForbidden &&
    greenPacketNotA16Validation &&
    deployedBodyNotOperatorAcceptance &&
    browserEvidenceNotOperatorReview &&
    noReviewFindingRecorded &&
    reviewOpen &&
    a16AuthorityHeld &&
    humanClosureRequired &&
    reviewFieldContractPresent
  );

  const subject = {
    exact_parent: A16_OPERATOR_WITNESS_EXTERIORITY_PARENT,
    parent_preflight_digest: PREFLIGHT.preflight_digest,
    code_side_sufficiency_earned: codeSideSufficiencyEarned,
    operator_review_open: reviewOpen,
    browser_evidence_not_operator_review: browserEvidenceNotOperatorReview,
    required_review_record_fields: REVIEW_RECORD_FIELDS,
    empirical_shore_nonbootstrap_structure_available: empiricalShoreNonbootstrapAvailable
  };

  return freeze({
    schema: A16_OPERATOR_WITNESS_EXTERIORITY_SCHEMA,
    exact_parent: A16_OPERATOR_WITNESS_EXTERIORITY_PARENT,
    status: operatorWitnessExterior ? 'A16_OPERATOR_WITNESS_EXTERIORITY_EARNED' : 'INADMISSIBLE',
    errors: operatorWitnessExterior ? [] : ['A16_OPERATOR_WITNESS_EXTERIORITY_NOT_ESTABLISHED'],
    rest_symbol: operatorWitnessExterior ? '𝄐' : null,
    exteriority_digest: digest(subject),
    source_class: 'CROSS_LINEAGE_A16_GOVERNANCE_NONBOOTSTRAP_COROLLARY',
    code_side_architectural_sufficiency_earned: codeSideSufficiencyEarned,
    operator_review_mandatory_before_a16: reviewMandatory,
    operator_review_recorded_required: reviewRecordedRequired,
    a16_start_before_review_forbidden: a16BeforeReviewForbidden,
    green_browser_packet_substitutes_for_operator_review: false,
    deployed_body_substitutes_for_operator_acceptance: false,
    browser_evidence_substitutes_for_operator_visual_review: false,
    operator_review_finding_recorded: !noReviewFindingRecorded,
    operator_review_gate_state: reviewOpen ? 'OPEN' : 'NOT_OPEN',
    a16_implementation_authority_state: a16AuthorityHeld ? 'HELD' : 'UNKNOWN',
    human_closure_required: humanClosureRequired,
    required_operator_review_record_fields: [...REVIEW_RECORD_FIELDS],
    required_operator_review_record_field_count: REVIEW_RECORD_FIELDS.length,
    current_repository_ci_evidence_class: 'INTERNAL_CODE_STATIC_AND_BROWSER_WITNESS',
    required_missing_gate_evidence_class: 'HUMAN_OPERATOR_PRODUCTION_OBSERVATION_RECORD',
    evidence_class_mismatch_established: operatorWitnessExterior,
    closed_system_repository_transform_can_satisfy_operator_review_gate: false,
    additional_ci_green_can_satisfy_operator_review_gate: false,
    synthetic_preflight_can_satisfy_operator_review_gate: false,
    self_authored_review_receipt_without_observation_admissible: false,
    minimum_new_evidence_classes_for_this_gate: operatorWitnessExterior ? 1 : null,
    required_new_evidence_class_for_this_gate: operatorWitnessExterior ? 'HUMAN_OPERATOR_PRODUCTION_OBSERVATION_RECORD' : null,
    a16_operator_witness_exteriority_earned: operatorWitnessExterior,
    structural_convergence_with_western_horizon_exteriority_nonbootstrap: operatorWitnessExterior && empiricalShoreNonbootstrapAvailable,
    western_horizon_empirical_shore_rest_preserved: EMPIRICAL_SHORE.rest_official === true,
    western_horizon_sequence_authority: false,
    western_horizon_successor_stage_claimed: false,
    a16_product_mutation_performed: false,
    a16_readmission_earned: false,
    a16_implementation_authority: false,
    a16_product_mutation_authority: false,
    a19_whole_program_closure_earned: false,
    empirical_interaction_evidence_acquired: false,
    exact_golden_egg_surfaces_added: freeze([]),
    empirical_credit_to_golden_egg: 0,
    golden_egg_earned: false,
    sequence_authority: false,
    merge_authority: false,
    production_authority: false,
    deployment_authority: false,
    publication_authority: false,
    laws: freeze({
      code_sufficiency_not_governance_admission: true,
      browser_evidence_not_operator_visual_review: true,
      green_ci_not_operator_acceptance: true,
      deployed_body_not_operator_acceptance: true,
      self_attestation_not_observation: true,
      internal_transformation_not_new_human_witness: true,
      structural_convergence_not_lineage_merge: true,
      a16_governance_corollary_not_western_horizon_successor: true,
      operator_review_not_learner_study: true,
      operator_review_not_golden_egg_measurement: true
    }),
    theorem: 'A16_CODE_SIDE_ARCHITECTURAL_SUFFICIENCY_CAN_BE_EARNED_WHILE_A16_ADMISSION_REMAINS_HELD_BECAUSE_THE_GOVERNANCE_CONTRACT_REQUIRES_A_HUMAN_OPERATOR_PRODUCTION_OBSERVATION_RECORD_AND_EXPLICITLY_FORBIDS_SUBSTITUTING_GREEN_BROWSER_CI_DEPLOYMENT_OR_SELF_ATTESTATION_FOR_THAT_REVIEW; THEREFORE_THE_OPERATOR_REVIEW_GATE_IS_NONBOOTSTRAPPABLE_FROM_FURTHER_CLOSED_REPOSITORY_TRANSFORMATIONS_AND_STRUCTURALLY_CONVERGES_WITH_WESTERN_HORIZON_EXTERIORITY_WITHOUT_BECOMING_A_WESTERN_HORIZON_SUCCESSOR_STAGE',
    child_message: 'THE CODE CAN PROVE THE PLUG FITS. ONLY A HUMAN LOOKING AT THE LIVE INSTRUMENT CAN SIGN THE DOOR OPEN.'
  });
}

export const A16_OPERATOR_WITNESS_EXTERIORITY_CERTIFICATE = runA16OperatorWitnessExteriority();
