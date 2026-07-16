import { canonicalDigest } from '../dome-world/ash/canonical-json.js';
import { clone, freeze, randomId } from './aperture-v31-core.js';
import { verifyAuthorityContext } from './ash-constitutional-convergence.js';
import { verifyChoirCalibrationBinding } from './ash-keep-choir-calibration-binding.js';

export const HIGHER_ORDER_INTERFERENCE_SCHEMA = 'td613.aperture.higher-order-interference/v0.1';
export const HIGHER_ORDER_INTERFERENCE_REPLAY_SCHEMA = 'td613.aperture.higher-order-interference-replay/v0.1';
const DOMAIN = 'TD613:ASH-KEEP:HIGHER-ORDER-INTERFERENCE:v1';
const REPLAY_DOMAIN = 'TD613:ASH-KEEP:HIGHER-ORDER-INTERFERENCE-REPLAY:v1';
const SHA256 = /^sha256:[0-9a-f]{64}$/;
const MAX_DIMENSIONS = 6;
const MAX_SUBSETS = 64;

function without(value, field) {
  const output = clone(value);
  delete output[field];
  return output;
}

function uniqueSorted(values = []) {
  return [...new Set(values.map(value => String(value).trim()).filter(Boolean))].sort();
}

function subsetKey(values = []) {
  const ordered = uniqueSorted(values);
  return ordered.length ? ordered.join('+') : '∅';
}

function powerset(dimensions) {
  const output = [];
  for (let mask = 0; mask < 2 ** dimensions.length; mask += 1) {
    output.push(dimensions.filter((_, index) => mask & (1 << index)));
  }
  return output;
}

function normalizeComponents(value = {}) {
  return Object.fromEntries(Object.entries(value)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, item]) => {
      if (!Number.isSafeInteger(item)) throw new Error(`Interference component ${key} must be a safe integer.`);
      return [key, item];
    }));
}

function receiptState(failures) {
  if (failures.includes('cancelled')) return 'CANCELLED_HOLD';
  if (failures.some(value => value.includes('tamper'))) return 'TAMPER_HOLD';
  if (failures.some(value => value.includes('authority') || value.includes('case'))) return 'STALE_CASE_HOLD';
  if (failures.some(value => value.includes('calibration'))) return 'CALIBRATION_HOLD';
  if (failures.some(value => value.includes('cap'))) return 'COMBINATORIAL_CAP_HOLD';
  if (failures.some(value => value.includes('missing') || value.includes('component'))) return 'NOT_ENOUGH_TEST_DATA';
  return 'INTERFERENCE_ELIGIBLE';
}

export async function compileHigherOrderInterference(input = {}, options = {}) {
  const dimensions = uniqueSorted(input.dimensions || []);
  if (dimensions.length < 3) throw new Error('Higher-order interference requires at least three declared dimensions.');
  const requiredSubsets = powerset(dimensions);
  const failures = [];
  if (dimensions.length > (input.maxDimensions || MAX_DIMENSIONS)) failures.push('dimension-cap-exceeded');
  if (requiredSubsets.length > (input.maxSubsets || MAX_SUBSETS)) failures.push('subset-cap-exceeded');
  if (input.cancelled === true) failures.push('cancelled');

  const authorityVerified = Boolean(input.authorityContext && await verifyAuthorityContext(input.authorityContext, {
    caseId: input.caseMap?.case_id,
    caseMapDigest: input.caseMap?.case_map_digest,
    routeMemoryDigest: input.routeMemory?.route_memory_digest
  }, options));
  const calibrationVerified = Boolean(input.calibrationBinding && await verifyChoirCalibrationBinding(input.calibrationBinding, options));
  if (!authorityVerified) failures.push('authority-context-stale-or-unverified');
  if (!calibrationVerified || input.calibrationBinding?.calibration_eligible !== true) failures.push('calibration-binding-ineligible');
  if (input.calibrationBinding?.case_id !== input.caseMap?.case_id
    || input.calibrationBinding?.case_map_digest !== input.caseMap?.case_map_digest
    || input.calibrationBinding?.route_memory_digest !== input.routeMemory?.route_memory_digest) failures.push('calibration-case-binding-stale');

  const observationMap = new Map();
  for (const observation of input.observations || []) {
    const key = subsetKey(observation?.subset || []);
    if (observationMap.has(key)) failures.push(`duplicate-subset:${key}`);
    const subset = uniqueSorted(observation?.subset || []);
    if (subset.some(value => !dimensions.includes(value))) failures.push(`unknown-dimension:${key}`);
    const state = String(observation?.state || 'OBSERVED').toUpperCase();
    const components = state === 'OBSERVED' ? normalizeComponents(observation?.components || {}) : {};
    observationMap.set(key, { subset, subset_key: key, state, components, source_status: String(observation?.source_status || 'DERIVED').toUpperCase() });
  }

  const componentNames = uniqueSorted([...observationMap.values()].flatMap(value => Object.keys(value.components)));
  for (const subset of requiredSubsets) {
    const key = subsetKey(subset);
    const observation = observationMap.get(key);
    if (!observation || observation.state !== 'OBSERVED') failures.push(`missing-required-subset:${key}`);
    for (const component of componentNames) {
      if (observation?.state === 'OBSERVED' && !Object.hasOwn(observation.components, component)) failures.push(`missing-component:${key}:${component}`);
    }
  }
  if (!componentNames.length) failures.push('missing-components');

  const residues = {};
  if (!failures.some(value => value.startsWith('missing-') || value.includes('cap') || value === 'cancelled')) {
    for (const component of componentNames) {
      let value = 0;
      const terms = [];
      for (const subset of requiredSubsets) {
        const key = subsetKey(subset);
        const sign = ((dimensions.length - subset.length) % 2 === 0) ? 1 : -1;
        const observed = observationMap.get(key).components[component];
        value += sign * observed;
        terms.push({ subset_key: key, sign, observed });
      }
      residues[component] = { numerator: value, denominator: 1, direction: value > 0 ? 'POSITIVE' : value < 0 ? 'NEGATIVE' : 'ZERO', terms };
    }
  }

  const failedChecks = uniqueSorted(failures);
  const state = receiptState(failedChecks);
  const record = {
    schema: HIGHER_ORDER_INTERFERENCE_SCHEMA,
    version: 'v0.1',
    assay_id: input.assayId || randomId('higherorder_', options.cryptoImpl || globalThis.crypto),
    created_at: input.createdAt || new Date().toISOString(),
    mode: 'BOUNDED_K_ORDER_INTERFERENCE',
    order_k: dimensions.length,
    dimensions,
    declared_caps: { max_dimensions: input.maxDimensions || MAX_DIMENSIONS, max_subsets: input.maxSubsets || MAX_SUBSETS },
    required_subset_count: requiredSubsets.length,
    observed_subset_count: [...observationMap.values()].filter(value => value.state === 'OBSERVED').length,
    case_id: input.caseMap?.case_id || null,
    case_map_digest: input.caseMap?.case_map_digest || null,
    route_memory_digest: input.routeMemory?.route_memory_digest || null,
    authority_context_reference: input.authorityContext?.receipt_id || null,
    authority_context_digest: input.authorityContext?.authority_context_digest || null,
    calibration_binding_id: input.calibrationBinding?.binding_id || null,
    calibration_binding_digest: input.calibrationBinding?.binding_digest || null,
    control_bank_digest: input.calibrationBinding?.receipt_references?.matched_control_bank_digest || null,
    observations: [...observationMap.values()].sort((left, right) => left.subset_key.localeCompare(right.subset_key)),
    componentwise_residue: residues,
    checks: {
      authority_context_verified: authorityVerified,
      calibration_binding_verified: calibrationVerified,
      current_case_binding: !failedChecks.includes('calibration-case-binding-stale'),
      all_required_subsets_observed: !failedChecks.some(value => value.startsWith('missing-required-subset')),
      components_complete: !failedChecks.some(value => value.startsWith('missing-component') || value === 'missing-components'),
      combinatorial_cap_held: !failedChecks.some(value => value.includes('cap')),
      cancellation_clear: !failedChecks.includes('cancelled')
    },
    state,
    interference_eligible: state === 'INTERFERENCE_ELIGIBLE',
    failed_checks: failedChecks,
    source_status: String(input.sourceStatus || 'DERIVED').toUpperCase(),
    missingness: uniqueSorted(input.missingness || []),
    alternatives: uniqueSorted(input.alternatives || ['reduce declared order', 'repair missing subset observations', 'rebind current Authority Context and calibration receipts']),
    open_questions: uniqueSorted(input.openQuestions || []),
    operator_notes: uniqueSorted(input.operatorNotes || []),
    closure: { required: true, status: String(input.closureStatus || 'OPEN') },
    emergent_residue_is_causation: false,
    surveillance_probability: null,
    identity_or_intent_inference_authorized: false,
    release_authorized: false,
    transport_authorized: false,
    suppression_authorized: false,
    cinder_action_authorized: false,
    recommendation_not_command: true,
    assay_digest: null
  };
  record.assay_digest = await canonicalDigest(DOMAIN, without(record, 'assay_digest'), options);
  return freeze(record);
}

export async function verifyHigherOrderInterference(value, options = {}) {
  return Boolean(value && value.schema === HIGHER_ORDER_INTERFERENCE_SCHEMA
    && SHA256.test(String(value.assay_digest || ''))
    && value.assay_digest === await canonicalDigest(DOMAIN, without(value, 'assay_digest'), options));
}

export async function replayHigherOrderInterference(value, input = {}, options = {}) {
  const rebuilt = await compileHigherOrderInterference({ ...input, assayId: value?.assay_id, createdAt: value?.created_at }, options);
  const sourceVerified = await verifyHigherOrderInterference(value, options);
  const exact = sourceVerified && rebuilt.assay_digest === value?.assay_digest;
  const record = {
    schema: HIGHER_ORDER_INTERFERENCE_REPLAY_SCHEMA,
    version: 'v0.1',
    replay_id: input.replayId || randomId('higherreplay_', options.cryptoImpl || globalThis.crypto),
    created_at: input.replayCreatedAt || new Date().toISOString(),
    source_assay_id: value?.assay_id || null,
    source_assay_digest: value?.assay_digest || null,
    status: exact ? 'HIGHER_ORDER_REPLAY_VERIFIED' : 'HIGHER_ORDER_REPLAY_HELD',
    source_digest_verified: sourceVerified,
    exact_recomputation_verified: exact,
    readers_reexecuted: false,
    provider_called: false,
    network_called: false,
    storage_mutated: false,
    release_authorized: false,
    transport_authorized: false,
    cinder_action_authorized: false,
    replay_digest: null
  };
  record.replay_digest = await canonicalDigest(REPLAY_DOMAIN, without(record, 'replay_digest'), options);
  return freeze(record);
}

export async function verifyHigherOrderInterferenceReplay(value, options = {}) {
  return Boolean(value && value.schema === HIGHER_ORDER_INTERFERENCE_REPLAY_SCHEMA
    && SHA256.test(String(value.replay_digest || ''))
    && value.replay_digest === await canonicalDigest(REPLAY_DOMAIN, without(value, 'replay_digest'), options));
}
