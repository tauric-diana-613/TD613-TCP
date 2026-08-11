import { A15_R0_OPEN_FIELD_SCHEMA, runOpenResearchField } from './open-research-field.js';

export const BOUNDED_TRANSFORMATION_ENVELOPE_SCHEMA = 'td613.ash.a15-r0.bounded-transformation-envelope/v0.1';

const round = value => Number(value.toFixed(6));
const measured = (value, threshold, comparator = '<=') => Object.freeze({
  value: round(value),
  threshold: round(threshold),
  comparator,
  pass: comparator === '<=' ? value <= threshold : value >= threshold
});

export function runBoundedTransformationEnvelope(options = {}) {
  const field = options.field || runOpenResearchField();
  if (field.schema !== A15_R0_OPEN_FIELD_SCHEMA) throw new TypeError('A15-R0 open research field v0.2 required.');

  const thresholds = Object.freeze({
    observer_family_leakage_bits: Number(options.observer_family_leakage_bits ?? 0.5),
    reconstruction_distance: Number(options.reconstruction_distance ?? 0.2),
    joining_synergy_bits: Number(options.joining_synergy_bits ?? 0.1)
  });
  if (Object.values(thresholds).some(value => !Number.isFinite(value) || value < 0)) {
    throw new TypeError('Envelope thresholds must be finite non-negative numbers.');
  }

  const worstObserverLeakage = field.observability.null_policy_worst_case_information_bits;
  const worstReconstructionDistance = 1 - field.reconstruction.anisotropic_reconstruction_floor;
  const joiningSynergy = field.joining_key_synergy.joining_synergy_proxy_bits;

  const metricGates = Object.freeze([
    Object.freeze({
      gate_id: 'OBSERVER_FAMILY_LEAKAGE',
      ...measured(worstObserverLeakage, thresholds.observer_family_leakage_bits),
      quantity: 'sup over declared finite null-policy observer family'
    }),
    Object.freeze({
      gate_id: 'RECONSTRUCTION_FLOOR_DISTANCE',
      ...measured(worstReconstructionDistance, thresholds.reconstruction_distance),
      quantity: 'maximum reconstruction distance induced by declared non-identity transform family'
    }),
    Object.freeze({
      gate_id: 'JOINING_KEY_SYNERGY',
      ...measured(joiningSynergy, thresholds.joining_synergy_bits),
      quantity: 'synthetic excess joint-information proxy'
    })
  ]);

  const evidenceGate = Object.freeze({
    gate_id: 'EVIDENCE_CLASS',
    observed_source_status: field.source_status,
    required_posture: 'NON_SIMULATED_EMPIRICAL_EVIDENCE',
    pass: field.source_status !== 'SIMULATED'
  });
  const humanGate = Object.freeze({
    gate_id: 'HUMAN_CLOSURE',
    required: true,
    pass: false
  });
  const metricPass = metricGates.every(gate => gate.pass);
  const failedMetricGates = metricGates.filter(gate => !gate.pass).map(gate => gate.gate_id);
  const promotionPass = metricPass && evidenceGate.pass && humanGate.pass;
  const finding = metricPass
    ? 'The current synthetic candidate passes every declared metric gate, but lacks empirical evidence class and human closure, and therefore remains HELD without Golden Egg authority.'
    : `The current synthetic candidate fails ${failedMetricGates.length} of ${metricGates.length} declared metric gates (${failedMetricGates.join(', ')}), also lacks empirical evidence class and human closure, and therefore remains HELD without Golden Egg authority.`;

  return Object.freeze({
    schema: BOUNDED_TRANSFORMATION_ENVELOPE_SCHEMA,
    source_field_schema: field.schema,
    source_status: 'DERIVED_FROM_SIMULATED_FIELD',
    authority_class: 'A2_DERIVATIONAL',
    thresholds,
    metric_gates: metricGates,
    evidence_gate: evidenceGate,
    human_gate: humanGate,
    all_declared_metric_gates_pass: metricPass,
    failed_metric_gate_ids: Object.freeze(failedMetricGates),
    all_promotion_gates_pass: promotionPass,
    status: promotionPass ? 'ELIGIBLE_FOR_HUMAN_REVIEW' : 'HELD',
    golden_egg_earned: false,
    promotion_authority: false,
    observer_family_scope: 'DECLARED_FINITE_FAMILY_ONLY',
    transform_family_scope: 'DECLARED_SYNTHETIC_FAMILY_ONLY',
    joining_family_scope: 'BALANCED_XOR_FIXTURE_ONLY',
    unknown_observers: 'UNMEASURED',
    unknown_transforms: 'UNMEASURED',
    claim_ceiling: 'BOUNDED_SYNTHETIC_FEASIBILITY_ENVELOPE_ONLY',
    finding
  });
}
