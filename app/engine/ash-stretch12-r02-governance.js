import {
  digestRecord,
  nowIso,
  uniqueStrings,
  withoutKeys
} from './ash-stretch12-r02-common.js';

export const GOVERNANCE_EVENT_SCHEMA = 'td613.ash.qualification-event/v0.1';
export const QUALIFICATION_RECEIPT_SCHEMA = 'td613.ash.portable-environment-qualification-receipt/v0.1';
export const CLAIM_PROPOSAL_SCHEMA = 'td613.ash.claim-promotion-proposal/v0.1';
export const CLAIM_RECEIPT_SCHEMA = 'td613.ash.claim-promotion-receipt/v0.1';
export const CLOSURE_RECEIPT_SCHEMA = 'td613.ash.stretch12-closure-receipt/v0.1';

export const EVENT_TYPES = Object.freeze([
  'STRETCH12_SPEC_AUTHORED','ENVIRONMENT_DECLARED','ENVIRONMENT_OBSERVATION_STARTED',
  'SENSOR_OBSERVED','SENSOR_VERIFIED','SENSOR_MISSING','SENSOR_STALE','SENSOR_CONTRADICTORY',
  'ENVIRONMENT_PROFILE_COMPILED','ORIGIN_MANIFEST_VERIFIED','ORIGIN_MANIFEST_HELD',
  'CUSTODY_ROOT_VERIFIED','KEY_TOPOLOGY_COMPILED','KEY_TOPOLOGY_HELD',
  'PROJECTION_PURPOSE_DECLARED','PROJECTION_COMPILED','PROJECTION_CHANGED',
  'CAPSULE_ENCRYPTED','CAPSULE_VERIFIED','CAPSULE_HELD',
  'READER_ENSEMBLE_COMPILED','READER_CALIBRATED','RECONSTRUCTION_ASSAY_RUN',
  'CONTROL_ASSAY_RUN','JOINING_KEY_ASSAY_RUN','PHASON_RESPONSE_OBSERVED',
  'HETEROSTRATIGRAPHIC_TOMOGRAPHY_COMPILED','FLOWCORE_WEATHER_COMPILED',
  'FLOWCORE_COOL_ORDERED','FLOWCORE_REST_ORDERED','FLOWCORE_WARMING_REVIEWED',
  'ASH_COURT_HARD_HOLD','ASH_COURT_REVIEW_ELIGIBLE','OPERATOR_APPROVAL_APPLIED',
  'RELEASE_RECEIPT_COMPILED','EXTERNAL_CROSSING_OBSERVED','RETURN_RECEIVED',
  'RETURN_QUARANTINED','RETURN_REASSAYED','RECALL_ISSUED','REVOCATION_ISSUED',
  'CLAIM_PROMOTION_PROPOSED','CLAIM_PROMOTION_APPROVED','QUALIFICATION_CLOSED'
]);

const FORBIDDEN_CLAIMS = Object.freeze([
  'unleakable','anonymous','impossible to reconstruct','safe everywhere','zero risk',
  'military-grade','provider-proof','administrator-proof','tamper-proof','future-proof',
  'endpoint-secure','deleted forever','unknown readers defeated','ai cannot identify this',
  'no one can recover the source'
]);

const ALLOWED_CLAIM_PATTERNS = Object.freeze([
  /^Origin Manifest verified for the exact tested asset set\.$/,
  /^The encrypted envelope rejected the tested wrong-passphrase and tamper conditions\.$/,
  /^No tested Reader exceeded the declared recovery threshold for the named dimensions under the declared environment\.$/,
  /^The managed route remains held\.$/,
  /^The environment profile has partial coverage\.$/,
  /^Unknown Readers remain unmeasured\.$/,
  /^The candidate projection is eligible for human review\.$/,
  /^The exact release object differs from the complete local case\.$/,
  /^The Return remains untrusted until reassay\.$/
]);

function subject(value) {
  return withoutKeys(value, ['record_digest','event_digest']);
}

export function lintClaimLanguage(claim) {
  const normalized = String(claim || '').trim();
  const lower = normalized.toLowerCase();
  const violations = FORBIDDEN_CLAIMS.filter(token => lower.includes(token));
  const allowed = ALLOWED_CLAIM_PATTERNS.some(pattern => pattern.test(normalized));
  return Object.freeze({
    claim:normalized,
    allowed:allowed && violations.length === 0,
    violations,
    claim_ceiling:'EVIDENCE_BOUNDED_ENVIRONMENT_SPECIFIC_LANGUAGE_ONLY'
  });
}

export async function compileGovernanceEvent(input, options = {}) {
  const eventType = String(input.event_type || '').toUpperCase();
  if (!EVENT_TYPES.includes(eventType)) throw new TypeError(`Unknown qualification event: ${eventType}`);
  if (eventType === 'OPERATOR_APPROVAL_APPLIED' && !input.operator_gesture) throw new Error('Operator approval requires an explicit human gesture.');
  if (eventType === 'QUALIFICATION_CLOSED' && input.operator_closure !== 'CLOSED') throw new Error('Qualification closure requires exact human closure.');
  const event = {
    schema:GOVERNANCE_EVENT_SCHEMA,
    schema_version:'0.1',
    event_id:input.event_id || `event:${input.case_id}:${input.monotonic_local_index}`,
    event_type:eventType,
    case_id:String(input.case_id || ''),
    environment_id:String(input.environment_id || ''),
    source_status:String(input.source_status || 'DERIVED'),
    actor_class:String(input.actor_class || 'SYSTEM_COMPILER'),
    created_at:input.created_at || nowIso(options.now),
    monotonic_local_index:Number(input.monotonic_local_index),
    external_time_status:String(input.external_time_status || 'UNVERIFIED'),
    prior_event_digest:input.prior_event_digest || null,
    input_references:uniqueStrings(input.input_references),
    output_references:uniqueStrings(input.output_references),
    missingness:uniqueStrings(input.missingness),
    uncertainty:uniqueStrings(input.uncertainty),
    claim_ceiling:String(input.claim_ceiling || 'EVENT_REGISTRATION_ONLY'),
    operator_closure:String(input.operator_closure || 'OPEN'),
    operator_gesture:input.operator_gesture ? String(input.operator_gesture) : null,
    automatic_release:false,
    automatic_case_mutation:false,
    cinder_authority:false
  };
  if (!Number.isInteger(event.monotonic_local_index) || event.monotonic_local_index < 0) throw new TypeError('monotonic_local_index must be a nonnegative integer.');
  event.event_digest = await digestRecord(GOVERNANCE_EVENT_SCHEMA, subject(event), options.cryptoImpl);
  return Object.freeze(event);
}

export async function verifyEventChain(events, options = {}) {
  for (let index = 0; index < events.length; index += 1) {
    const event = events[index];
    if (event.monotonic_local_index !== index) return false;
    const expectedPrior = index === 0 ? null : events[index - 1].event_digest;
    if (event.prior_event_digest !== expectedPrior) return false;
    if (event.event_digest !== await digestRecord(GOVERNANCE_EVENT_SCHEMA, subject(event), options.cryptoImpl)) return false;
    if (event.automatic_release !== false || event.cinder_authority !== false) return false;
  }
  return true;
}

export function deriveQualificationState(events) {
  const types = new Set(events.map(event => event.event_type));
  const held = events.filter(event => /HELD|HARD_HOLD|REST_ORDERED/.test(event.event_type)).at(-1) || null;
  const returned = types.has('RETURN_RECEIVED');
  const reassayed = types.has('RETURN_REASSAYED');
  return Object.freeze({
    specification_authored:types.has('STRETCH12_SPEC_AUTHORED'),
    environment_profile:types.has('ENVIRONMENT_PROFILE_COMPILED'),
    origin_verified:types.has('ORIGIN_MANIFEST_VERIFIED'),
    custody_verified:types.has('CUSTODY_ROOT_VERIFIED'),
    key_topology:types.has('KEY_TOPOLOGY_COMPILED') && !types.has('KEY_TOPOLOGY_HELD'),
    projection_compiled:types.has('PROJECTION_COMPILED') && !types.has('PROJECTION_CHANGED'),
    reader_calibrated:types.has('READER_CALIBRATED'),
    controls_run:types.has('CONTROL_ASSAY_RUN'),
    reconstruction_run:types.has('RECONSTRUCTION_ASSAY_RUN'),
    joining_key_run:types.has('JOINING_KEY_ASSAY_RUN'),
    tomography:types.has('HETEROSTRATIGRAPHIC_TOMOGRAPHY_COMPILED'),
    flowcore_weather:types.has('FLOWCORE_WEATHER_COMPILED'),
    court_review:types.has('ASH_COURT_REVIEW_ELIGIBLE'),
    human_approval:types.has('OPERATOR_APPROVAL_APPLIED'),
    release_receipt:types.has('RELEASE_RECEIPT_COMPILED'),
    return_quarantined:!returned || types.has('RETURN_QUARANTINED'),
    return_reassayed:!returned || reassayed,
    recall_state:types.has('RECALL_ISSUED') ? 'RECALLED' : 'NOT_RECALLED',
    last_hold:held?.event_type || null,
    qualification_closed:types.has('QUALIFICATION_CLOSED'),
    automatic_release:false,
    cinder_authority:false
  });
}

export async function compileQualificationReceipt(input, options = {}) {
  if (!(await verifyEventChain(input.events || [], options))) throw new Error('Verified event chain required.');
  const state = deriveQualificationState(input.events);
  const required = [
    state.specification_authored,state.environment_profile,state.origin_verified,state.custody_verified,
    state.key_topology,state.projection_compiled,state.reader_calibrated,state.controls_run,
    state.reconstruction_run,state.joining_key_run,state.tomography,state.flowcore_weather,
    state.court_review,state.return_quarantined,state.return_reassayed
  ];
  const receipt = {
    schema:QUALIFICATION_RECEIPT_SCHEMA,
    schema_version:'0.1',
    record_id:input.record_id || `apeq:${input.case_id}:${Date.now()}`,
    case_id:String(input.case_id || ''),
    created_at:input.created_at || nowIso(options.now),
    source_status:'DERIVED',
    exact_commit:String(input.exact_commit || ''),
    environment_profile_reference:String(input.environment_profile_reference || ''),
    environment_profile_digest:String(input.environment_profile_digest || ''),
    projection_reference:String(input.projection_reference || ''),
    projection_digest:String(input.projection_digest || ''),
    origin_reference:String(input.origin_reference || ''),
    custody_reference:String(input.custody_reference || ''),
    key_topology_reference:String(input.key_topology_reference || ''),
    reader_calibration_reference:String(input.reader_calibration_reference || ''),
    assay_references:uniqueStrings(input.assay_references),
    tomography_reference:String(input.tomography_reference || ''),
    flowcore_weather_reference:String(input.flowcore_weather_reference || ''),
    event_chain_tail:input.events.at(-1)?.event_digest || null,
    state,
    method_requirements_satisfied:required.every(Boolean),
    eligible_for_human_claim_review:required.every(Boolean) && !state.last_hold,
    human_closure_present:state.human_approval,
    automatic_release:false,
    universal_transport:false,
    universal_secrecy:false,
    unknown_readers:'UNMEASURED',
    cinder_authority:false,
    missingness:uniqueStrings(input.missingness),
    uncertainty:uniqueStrings(input.uncertainty),
    claim_ceiling:'APEQ_EXACT_EVIDENCE_BUNDLE_ONLY',
    operator_closure:String(input.operator_closure || 'OPEN')
  };
  receipt.record_digest = await digestRecord(QUALIFICATION_RECEIPT_SCHEMA, subject(receipt), options.cryptoImpl);
  return Object.freeze(receipt);
}

export async function compileClaimPromotionProposal(input, options = {}) {
  const qualification = input.qualification_receipt;
  const assurance = input.assurance_state;
  const claimLint = lintClaimLanguage(input.proposed_claim);
  const holds = [];
  if (!qualification?.eligible_for_human_claim_review) holds.push('QUALIFICATION_NOT_ELIGIBLE');
  if (!['PA4_ENVIRONMENT_SPECIFICALLY_DEMONSTRATED','PA5_BOUNDED_ASSURANCE'].includes(assurance?.assurance_class)) holds.push('ASSURANCE_CLASS_BELOW_PA4');
  if (!claimLint.allowed) holds.push('CLAIM_LANGUAGE_HELD');
  if (assurance?.unknown_readers !== 'UNMEASURED') holds.push('UNKNOWN_READER_STATE_INVALID');
  if (assurance?.universal_secrecy !== false) holds.push('UNIVERSAL_SECRECY_FORBIDDEN');
  const proposal = {
    schema:CLAIM_PROPOSAL_SCHEMA,
    schema_version:'0.1',
    record_id:input.record_id || `claim-proposal:${qualification?.case_id || ''}:${Date.now()}`,
    case_id:qualification?.case_id || '',
    created_at:input.created_at || nowIso(options.now),
    source_status:'DERIVED',
    qualification_reference:qualification?.record_id || null,
    qualification_digest:qualification?.record_digest || null,
    assurance_reference:assurance?.record_id || null,
    assurance_digest:assurance?.record_digest || null,
    proposed_claim:String(input.proposed_claim || ''),
    claim_lint:claimLint,
    status:holds.length ? 'HELD' : 'ELIGIBLE_FOR_HUMAN_APPROVAL',
    holds,
    automatic_approval:false,
    automatic_release:false,
    cinder_authority:false,
    missingness:uniqueStrings(input.missingness),
    uncertainty:uniqueStrings(input.uncertainty),
    claim_ceiling:'HUMAN_REVIEW_PROPOSAL_ONLY',
    operator_closure:'OPEN'
  };
  proposal.record_digest = await digestRecord(CLAIM_PROPOSAL_SCHEMA, subject(proposal), options.cryptoImpl);
  return Object.freeze(proposal);
}

export async function compileClaimPromotionReceipt(input, options = {}) {
  if (input.proposal?.status !== 'ELIGIBLE_FOR_HUMAN_APPROVAL') throw new Error('Eligible claim proposal required.');
  if (typeof input.operator_gesture !== 'string' || input.operator_gesture.trim().length < 8) throw new Error('Exact human operator gesture required.');
  const receipt = {
    schema:CLAIM_RECEIPT_SCHEMA,
    schema_version:'0.1',
    record_id:input.record_id || `claim-receipt:${input.proposal.case_id}:${Date.now()}`,
    case_id:input.proposal.case_id,
    created_at:input.created_at || nowIso(options.now),
    source_status:'DERIVED',
    proposal_reference:input.proposal.record_id,
    proposal_digest:input.proposal.record_digest,
    approved_claim:input.proposal.proposed_claim,
    operator_gesture_digest:await digestRecord('td613.ash.operator-gesture/v0.1', { gesture:input.operator_gesture }, options.cryptoImpl),
    approved_by_human:true,
    automatic_approval:false,
    automatic_release:false,
    external_deletion_verified:false,
    universal_secrecy:false,
    cinder_authority:false,
    missingness:[],
    uncertainty:['unknown Readers remain unmeasured','external recipient behavior remains outside custody'],
    claim_ceiling:'EXACT_APPROVED_ENVIRONMENT_SPECIFIC_CLAIM_ONLY',
    operator_closure:'CLOSED_FOR_CLAIM_ONLY'
  };
  receipt.record_digest = await digestRecord(CLAIM_RECEIPT_SCHEMA, subject(receipt), options.cryptoImpl);
  return Object.freeze(receipt);
}

export async function compileStretch12ClosureReceipt(input, options = {}) {
  const missing = [];
  for (const [name,value] of Object.entries(input.completion_criteria || {})) if (value !== true) missing.push(name);
  const exactHumanClosure = input.operator_closure === 'CLOSED' && typeof input.operator_gesture === 'string' && input.operator_gesture.trim().length >= 8;
  if (!exactHumanClosure) missing.push('human_closure');
  const receipt = {
    schema:CLOSURE_RECEIPT_SCHEMA,
    schema_version:'0.1',
    record_id:input.record_id || 'stretch12-closure:r02',
    case_id:String(input.case_id || 'program:stretch12'),
    created_at:input.created_at || nowIso(options.now),
    source_status:'DERIVED',
    exact_commit:String(input.exact_commit || ''),
    completion_criteria:input.completion_criteria || {},
    missing_criteria:uniqueStrings(missing),
    status:missing.length ? 'STRETCH12_OPEN' : 'CLOSED_PENDING_EXTERNAL_SEAL',
    no_stretch13_constituted:true,
    serverless_covenant:'11_ACTIVE_PLUS_1_RESERVED',
    automatic_release:false,
    universal_transport:false,
    universal_secrecy:false,
    cinder_authority:false,
    operator_closure:exactHumanClosure ? 'CLOSED' : 'OPEN',
    claim_ceiling:'PROGRAM_CLOSURE_RECEIPT_ONLY',
    missingness:uniqueStrings(input.missingness),
    uncertainty:uniqueStrings(input.uncertainty)
  };
  receipt.record_digest = await digestRecord(CLOSURE_RECEIPT_SCHEMA, subject(receipt), options.cryptoImpl);
  return Object.freeze(receipt);
}
