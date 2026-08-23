import { canonicalJson } from '../dome-world/ash/canonical-json.js';
import { freeze, noForbidden, object, strings, text } from './flowcore-pedagogue-utils.js';
import {
  PEDAGOGUE_LINEAGE_LENSES
} from './pedagogue-lineage-spine-v02.js';
import {
  PEDAGOGUE_INTERFACE_DIAGNOSIS_SCHEMA
} from './pedagogue-interface-diagnosis.js';
import {
  PEDAGOGUE_INSTITUTIONAL_TIME_AUDIT_SCHEMA,
  PEDAGOGUE_DROMOLOGICAL_SEQUENCE_AUDIT_SCHEMA
} from './pedagogue-institutional-time.js';

export const PEDAGOGUE_LINEAGE_SECOND_PASS_SCHEMA = 'td613.flowcore.pedagogue-lineage-second-pass/v0.1';

export const PEDAGOGUE_LINEAGE_SECOND_PASS_SIGNALS = Object.freeze([
  'ENVIRONMENT_REQUIRES_EXTRA_COMMAND_FOR_LEGIBLE_ACTION',
  'PROCESS_WITNESS_MISSING',
  'TRANSFER_ROUTE_FRAGMENTED',
  'CONTEXT_UNRESOLVED_BEFORE_PERSON_ATTRIBUTION',
  'COMMUNITY_ROUTE_SEGREGATED',
  'RELATIONAL_SAFETY_REDUCED_TO_CONTAINMENT',
  'STATIC_CATEGORY_BLOCKS_RELEASE',
  'ACCESS_INTERPRETATION_AUTHORITY_COLLAPSED',
  'CONTAMINATED_SOURCE_ROUTE_REQUIRES_QUARANTINE'
]);

const INTERFACE_TO_LENSES = Object.freeze({
  CONTROL_ROLE_COLLAPSE: ['PREPARED_ENVIRONMENT', 'LEGIBILITY_WITHOUT_EXPERT_MONOPOLY'],
  TYPOGRAPHIC_ROLE_UNDECLARED: ['PREPARED_ENVIRONMENT'],
  TEXTAREA_VISUAL_MASS: ['PREPARED_ENVIRONMENT'],
  NUMERIC_SIGNAL_LOSS: ['PREPARED_ENVIRONMENT'],
  NATIVE_CONTROL_SEAM: ['PREPARED_ENVIRONMENT'],
  PLACEHOLDER_DOMINANCE: ['PREPARED_ENVIRONMENT', 'LEGIBILITY_WITHOUT_EXPERT_MONOPOLY'],
  STATUS_ONTOLOGY_OVERCLAIM: ['EPISTEMIC_REFRACTION', 'THIRD_TEACHER_DOCUMENTATION'],
  LANE_ROLE_PRECEDES_ENTITY: ['EPISTEMIC_REFRACTION', 'EXPERIENCE_CONTINUITY'],
  NEGATIVE_RESULT_NEEDS_SCOPE: ['EPISTEMIC_REFRACTION', 'THIRD_TEACHER_DOCUMENTATION'],
  ADVISORY_WITHOUT_ROUTE: ['PREPARED_ENVIRONMENT', 'LEGIBILITY_WITHOUT_EXPERT_MONOPOLY'],
  DORMANT_CONTEXT_WITHOUT_CONSEQUENCE: ['PREPARED_ENVIRONMENT', 'EXPERIENCE_CONTINUITY'],
  RESPONSIVE_ROLE_DRIFT: ['PREPARED_ENVIRONMENT']
});

const CADENCE_TO_LENSES = Object.freeze({
  ACTION_BEFORE_NOTICE: ['RHYTHM_AND_CADENCE', 'EXPERIENCE_CONTINUITY'],
  PREMATURE_NAMING: ['RHYTHM_AND_CADENCE', 'EPISTEMIC_REFRACTION', 'THIRD_TEACHER_DOCUMENTATION'],
  ASSESSMENT_BEFORE_CONSEQUENCE: ['RHYTHM_AND_CADENCE', 'THIRD_TEACHER_DOCUMENTATION'],
  CADENCE_COMPRESSION: ['RHYTHM_AND_CADENCE', 'TEMPORAL_SOVEREIGNTY'],
  REST_WITHHELD: ['TEMPORAL_SOVEREIGNTY', 'RELATIONAL_SAFETY'],
  EXIT_WITHHELD: ['TEMPORAL_SOVEREIGNTY', 'RELATIONAL_SAFETY'],
  CONTEXT_REGISTRATION_LAG: ['INSTITUTIONAL_TIME', 'EPISTEMIC_REFRACTION']
});

const SIGNAL_TO_LENSES = Object.freeze({
  ENVIRONMENT_REQUIRES_EXTRA_COMMAND_FOR_LEGIBLE_ACTION: ['PREPARED_ENVIRONMENT', 'LEGIBILITY_WITHOUT_EXPERT_MONOPOLY'],
  PROCESS_WITNESS_MISSING: ['THIRD_TEACHER_DOCUMENTATION'],
  TRANSFER_ROUTE_FRAGMENTED: ['EXPERIENCE_CONTINUITY'],
  CONTEXT_UNRESOLVED_BEFORE_PERSON_ATTRIBUTION: ['ANTI_PATHOLOGIZATION', 'EPISTEMIC_REFRACTION'],
  COMMUNITY_ROUTE_SEGREGATED: ['COMMUNITY_EMBEDDEDNESS'],
  RELATIONAL_SAFETY_REDUCED_TO_CONTAINMENT: ['RELATIONAL_SAFETY'],
  STATIC_CATEGORY_BLOCKS_RELEASE: ['DROMOLOGICAL_COMPRESSION'],
  ACCESS_INTERPRETATION_AUTHORITY_COLLAPSED: ['EPISTEMIC_REFRACTION'],
  CONTAMINATED_SOURCE_ROUTE_REQUIRES_QUARANTINE: ['RACIAL_HIERARCHY_QUARANTINE']
});

function lensById(id) {
  return PEDAGOGUE_LINEAGE_LENSES.find((lens) => lens.lens_id === id);
}

function activationMap() {
  return new Map();
}

function activate(map, lensIds, source, code) {
  for (const lensId of lensIds || []) {
    if (!lensById(lensId)) throw new Error(`Second pass references unknown lineage lens: ${lensId}`);
    if (!map.has(lensId)) map.set(lensId, []);
    const basis = map.get(lensId);
    if (!basis.some((item) => item.source === source && item.code === code)) basis.push(freeze({ source, code }));
  }
}

function ingestInterface(map, diagnosis) {
  if (!diagnosis) return false;
  if (diagnosis.schema !== PEDAGOGUE_INTERFACE_DIAGNOSIS_SCHEMA) throw new Error(`Expected ${PEDAGOGUE_INTERFACE_DIAGNOSIS_SCHEMA}.`);
  for (const finding of diagnosis.findings || []) activate(map, INTERFACE_TO_LENSES[String(finding.code || '').toUpperCase()], 'INTERFACE_DIAGNOSIS', String(finding.code || '').toUpperCase());
  return true;
}

function ingestCadence(map, audit) {
  if (!audit) return false;
  if (audit.schema !== PEDAGOGUE_DROMOLOGICAL_SEQUENCE_AUDIT_SCHEMA) throw new Error(`Expected ${PEDAGOGUE_DROMOLOGICAL_SEQUENCE_AUDIT_SCHEMA}.`);
  for (const violation of audit.violations || []) activate(map, CADENCE_TO_LENSES[String(violation).toUpperCase()], 'DROMOLOGICAL_AUDIT', String(violation).toUpperCase());
  if (audit.compression?.many_to_one_declared === true) activate(map, ['DROMOLOGICAL_COMPRESSION'], 'DROMOLOGICAL_AUDIT', 'MANY_TO_ONE_DECLARED');
  if ((audit.compression?.explicitly_lost_distinctions || []).length > 0) activate(map, ['DROMOLOGICAL_COMPRESSION', 'THIRD_TEACHER_DOCUMENTATION'], 'DROMOLOGICAL_AUDIT', 'EXPLICIT_RELATIONAL_LOSS_DECLARED');
  return true;
}

function ingestInstitutionalTime(map, audit) {
  if (!audit) return false;
  if (audit.schema !== PEDAGOGUE_INSTITUTIONAL_TIME_AUDIT_SCHEMA) throw new Error(`Expected ${PEDAGOGUE_INSTITUTIONAL_TIME_AUDIT_SCHEMA}.`);
  if (audit.preemption?.acts_before_counts === true) activate(map, ['INSTITUTIONAL_TIME', 'TEMPORAL_SOVEREIGNTY', 'INTERPRETIVE_LABOR'], 'INSTITUTIONAL_TIME_AUDIT', 'ACTS_BEFORE_COUNTS');
  if (audit.preemption?.institution_never_registered === true) activate(map, ['INSTITUTIONAL_TIME', 'LEGIBILITY_WITHOUT_EXPERT_MONOPOLY'], 'INSTITUTIONAL_TIME_AUDIT', 'INSTITUTION_NEVER_REGISTERED');
  if (audit.preemption?.context_lags_action === true) activate(map, ['INSTITUTIONAL_TIME', 'EPISTEMIC_REFRACTION'], 'INSTITUTIONAL_TIME_AUDIT', 'CONTEXT_LAGS_ACTION');
  if (audit.rupture?.failed_faithful_closure === true) activate(map, ['EXPERIENCE_CONTINUITY'], 'INSTITUTIONAL_TIME_AUDIT', 'FAILED_FAITHFUL_CLOSURE');
  if (audit.compression?.many_to_one_declared === true) activate(map, ['DROMOLOGICAL_COMPRESSION'], 'INSTITUTIONAL_TIME_AUDIT', 'MANY_TO_ONE_DECLARED');
  if ((audit.compression?.explicitly_lost_distinctions || []).length > 0) activate(map, ['DROMOLOGICAL_COMPRESSION', 'THIRD_TEACHER_DOCUMENTATION'], 'INSTITUTIONAL_TIME_AUDIT', 'EXPLICIT_RELATIONAL_LOSS_DECLARED');
  return true;
}

function ingestBurden(map, burden) {
  if (!burden) return false;
  if (burden.all_models_non_worsening === false) activate(map, ['INTERPRETIVE_LABOR', 'LEGIBILITY_WITHOUT_EXPERT_MONOPOLY'], 'ROUTE_BURDEN_COMPARISON', 'ONE_OR_MORE_MODELS_WORSENED');
  return true;
}

function normalizeSignals(value) {
  if (value === undefined || value === null) return [];
  const signals = strings(value, 'declared_system_signals', 0).map((item) => item.toUpperCase());
  for (const signal of signals) if (!PEDAGOGUE_LINEAGE_SECOND_PASS_SIGNALS.includes(signal)) throw new Error(`Unsupported Pedagogue lineage second-pass signal: ${signal}`);
  return [...new Set(signals)];
}

export function compilePedagogueLineageSecondPass(input = {}) {
  noForbidden(input);
  const value = object(input, 'input');
  const passId = text(value.pass_id, 'pass_id');
  const map = activationMap();
  const declaredSignals = normalizeSignals(value.declared_system_signals);

  const observed = freeze({
    interface_diagnosis: ingestInterface(map, value.interface_diagnosis),
    institutional_time_audit: ingestInstitutionalTime(map, value.institutional_time_audit),
    cadence_audit: ingestCadence(map, value.cadence_audit),
    route_burden_comparison: ingestBurden(map, value.burden_comparison)
  });

  for (const signal of declaredSignals) activate(map, SIGNAL_TO_LENSES[signal], 'DECLARED_SYSTEM_SIGNAL', signal);

  const activated = PEDAGOGUE_LINEAGE_LENSES
    .filter((lens) => map.has(lens.lens_id))
    .map((lens) => freeze({
      lens_id: lens.lens_id,
      question: lens.question,
      provenance_nodes: lens.provenance_nodes,
      activation_basis: freeze(map.get(lens.lens_id))
    }));

  const dormant = PEDAGOGUE_LINEAGE_LENSES
    .filter((lens) => !map.has(lens.lens_id))
    .map((lens) => lens.lens_id);

  const receipt = {
    schema: PEDAGOGUE_LINEAGE_SECOND_PASS_SCHEMA,
    pass_id: passId,
    diagnostic_input_posture: 'SUPPLIED_OR_COMPILED_SYSTEM_DIAGNOSTICS_FOR_QUESTION_ROUTING_ONLY',
    input_receipt_authenticity_independently_verified: false,
    observed_receipts: observed,
    declared_system_signals: freeze(declaredSignals),
    activated_lenses: freeze(activated),
    dormant_lenses: freeze(dormant),
    activation_count: activated.length,
    activation_count_is_not_score: true,
    activation_establishes_source_claim: false,
    activation_establishes_design_defect: false,
    thinker_vote_forbidden: true,
    convergence_not_computed: true,
    human_profile_inference: false,
    recommendation_only: true,
    authority: freeze({
      product_mutation_authorized: false,
      production_mutation_authorized: false,
      automatic_redesign: false,
      automatic_intervention: false,
      automatic_release: false,
      human_closure_required: true
    })
  };
  canonicalJson(receipt);
  return freeze(receipt);
}
