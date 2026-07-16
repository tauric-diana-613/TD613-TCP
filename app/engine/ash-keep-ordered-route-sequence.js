import { canonicalDigest } from '../dome-world/ash/canonical-json.js';
import { clone, freeze, randomId } from './aperture-v31-core.js';
import { verifyAuthorityContext } from './ash-constitutional-convergence.js';
import { verifyChoirCalibrationBinding } from './ash-keep-choir-calibration-binding.js';

export const ORDERED_ROUTE_SEQUENCE_SCHEMA = 'td613.aperture.ordered-route-sequence/v0.1';
export const ORDERED_ROUTE_SEQUENCE_REPLAY_SCHEMA = 'td613.aperture.ordered-route-sequence-replay/v0.1';
const DOMAIN = 'TD613:ASH-KEEP:ORDERED-ROUTE-SEQUENCE:v1';
const REPLAY_DOMAIN = 'TD613:ASH-KEEP:ORDERED-ROUTE-SEQUENCE-REPLAY:v1';
const SEQUENCE_DOMAIN = 'TD613:ASH-KEEP:ORDERED-ROUTE-SEQUENCE:DECLARED:v1';
const SHA256 = /^sha256:[0-9a-f]{64}$/;
const MAX_STEPS = 16;
const MAX_CONTROLS = 8;

function without(value, field) {
  const output = clone(value);
  delete output[field];
  return output;
}

function uniqueSorted(values = []) {
  return [...new Set(values.map(value => String(value).trim()).filter(Boolean))].sort();
}

function direction(value) {
  return value > 0 ? 'POSITIVE' : value < 0 ? 'NEGATIVE' : 'ZERO';
}

function normalizeComponents(value = {}, label, failures) {
  const entries = Object.entries(value).sort(([left], [right]) => left.localeCompare(right));
  if (!entries.length) failures.push(`missing-components:${label}`);
  return Object.fromEntries(entries.map(([key, item]) => {
    if (!Number.isSafeInteger(item)) failures.push(`unsafe-component:${label}:${key}`);
    return [key, Number.isSafeInteger(item) ? item : 0];
  }));
}

function normalizeSequence(value = {}, label, failures, maxSteps) {
  const rawSteps = Array.isArray(value.steps) ? value.steps : [];
  if (rawSteps.length < 2) failures.push(`missing-steps:${label}`);
  if (rawSteps.length > maxSteps) failures.push(`step-cap-exceeded:${label}`);

  const seenStepIds = new Set();
  const seenTransitionIds = new Set();
  const steps = rawSteps.map((step = {}, index) => {
    const stepId = String(step.step_id || '').trim();
    if (!stepId) failures.push(`missing-step-id:${label}:${index}`);
    if (stepId && seenStepIds.has(stepId)) failures.push(`duplicate-step:${label}:${stepId}`);
    if (stepId) seenStepIds.add(stepId);

    const stepReceiptDigest = String(step.step_receipt_digest || '');
    if (!SHA256.test(stepReceiptDigest)) failures.push(`tamper-step-receipt:${label}:${stepId || index}`);

    let transitionId = null;
    let transitionReceiptDigest = null;
    let fromStepId = null;
    let toStepId = stepId || null;
    if (index > 0) {
      const previousStepId = String(rawSteps[index - 1]?.step_id || '').trim();
      transitionId = String(step.transition_id || '').trim() || null;
      transitionReceiptDigest = String(step.transition_receipt_digest || '') || null;
      fromStepId = String(step.from_step_id || previousStepId).trim() || null;
      toStepId = String(step.to_step_id || stepId).trim() || null;
      if (!transitionId) failures.push(`missing-transition-id:${label}:${index}`);
      if (transitionId && seenTransitionIds.has(transitionId)) failures.push(`duplicate-transition:${label}:${transitionId}`);
      if (transitionId) seenTransitionIds.add(transitionId);
      if (!SHA256.test(String(transitionReceiptDigest || ''))) failures.push(`tamper-transition-receipt:${label}:${transitionId || index}`);
      if (fromStepId !== previousStepId || toStepId !== stepId) failures.push(`transition-chain-mismatch:${label}:${index}`);
    }

    return {
      position: index,
      step_id: stepId || null,
      step_receipt_digest: stepReceiptDigest || null,
      transition_id: transitionId,
      transition_receipt_digest: transitionReceiptDigest,
      from_step_id: fromStepId,
      to_step_id: toStepId
    };
  });

  const state = String(value.state || 'OBSERVED').toUpperCase();
  const resultComponents = state === 'OBSERVED'
    ? normalizeComponents(value.result_components || {}, label, failures)
    : {};

  return {
    sequence_id: String(value.sequence_id || label).trim(),
    control_kind: value.control_kind ? String(value.control_kind).toUpperCase() : null,
    state,
    steps,
    result_components: resultComponents,
    source_status: String(value.source_status || 'DERIVED').toUpperCase(),
    sequence_digest: null
  };
}

function receiptState(failures) {
  if (failures.includes('cancelled')) return 'CANCELLED_HOLD';
  if (failures.some(value => value.includes('tamper'))) return 'TAMPER_HOLD';
  if (failures.some(value => value.includes('authority') || value.includes('case'))) return 'STALE_CASE_HOLD';
  if (failures.some(value => value.includes('calibration'))) return 'CALIBRATION_HOLD';
  if (failures.some(value => value.includes('duplicate') || value.includes('transition') || value.includes('reordered') || value.includes('truncated') || value.includes('unknown-step'))) return 'SEQUENCE_INTEGRITY_HOLD';
  if (failures.some(value => value.includes('missing') || value.includes('component') || value.includes('control') || value.includes('cap') || value.includes('unsafe'))) return 'NOT_ENOUGH_TEST_DATA';
  return 'ORDERED_SEQUENCE_ELIGIBLE';
}

export async function compileOrderedRouteSequence(input = {}, options = {}) {
  const failures = [];
  const maxSteps = input.maxSteps || MAX_STEPS;
  const maxControls = input.maxControls || MAX_CONTROLS;
  if (input.cancelled === true) failures.push('cancelled');
  if (maxSteps > MAX_STEPS || maxControls > MAX_CONTROLS) failures.push('declared-cap-exceeded');

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

  const target = normalizeSequence(input.target || {}, 'target', failures, maxSteps);
  target.sequence_digest = await canonicalDigest(SEQUENCE_DOMAIN, without(target, 'sequence_digest'), options);

  const rawControls = Array.isArray(input.controls) ? input.controls : [];
  if (rawControls.length < 2) failures.push('missing-controls');
  if (rawControls.length > maxControls) failures.push('control-cap-exceeded');

  const seenControlIds = new Set();
  const controls = [];
  for (const rawControl of rawControls) {
    const control = normalizeSequence(rawControl || {}, `control:${rawControl?.sequence_id || controls.length}`, failures, maxSteps);
    if (!['REORDERED', 'TRUNCATED'].includes(control.control_kind)) failures.push(`unknown-control-kind:${control.sequence_id}`);
    if (seenControlIds.has(control.sequence_id)) failures.push(`duplicate-control:${control.sequence_id}`);
    seenControlIds.add(control.sequence_id);
    control.sequence_digest = await canonicalDigest(SEQUENCE_DOMAIN, without(control, 'sequence_digest'), options);
    controls.push(control);
  }
  controls.sort((left, right) => left.sequence_id.localeCompare(right.sequence_id));

  const targetStepIds = target.steps.map(step => step.step_id);
  const targetStepSet = new Set(targetStepIds);
  const targetReceiptMap = new Map(target.steps.map(step => [step.step_id, step.step_receipt_digest]));
  const reorderedControls = controls.filter(control => control.control_kind === 'REORDERED' && control.state === 'OBSERVED');
  const truncatedControls = controls.filter(control => control.control_kind === 'TRUNCATED' && control.state === 'OBSERVED');
  if (!reorderedControls.length) failures.push('missing-reordered-control');
  if (!truncatedControls.length) failures.push('missing-truncated-control');

  for (const control of controls) {
    const controlIds = control.steps.map(step => step.step_id);
    for (const step of control.steps) {
      if (!targetStepSet.has(step.step_id)) failures.push(`unknown-step:${control.sequence_id}:${step.step_id}`);
      if (targetReceiptMap.get(step.step_id) !== step.step_receipt_digest) failures.push(`tamper-step-receipt-mismatch:${control.sequence_id}:${step.step_id}`);
    }
    if (control.control_kind === 'REORDERED') {
      const sameMembers = controlIds.length === targetStepIds.length
        && [...controlIds].sort().join('\u0000') === [...targetStepIds].sort().join('\u0000');
      if (!sameMembers || controlIds.join('\u0000') === targetStepIds.join('\u0000')) failures.push(`reordered-control-invalid:${control.sequence_id}`);
    }
    if (control.control_kind === 'TRUNCATED') {
      const properPrefix = controlIds.length < targetStepIds.length
        && controlIds.every((stepId, index) => stepId === targetStepIds[index]);
      if (!properPrefix) failures.push(`truncated-control-invalid:${control.sequence_id}`);
    }
  }

  const componentNames = uniqueSorted(Object.keys(target.result_components));
  for (const control of controls.filter(value => value.state === 'OBSERVED')) {
    for (const component of componentNames) {
      if (!Object.hasOwn(control.result_components, component)) failures.push(`missing-component:${control.sequence_id}:${component}`);
    }
  }

  const failedChecks = uniqueSorted(failures);
  const state = receiptState(failedChecks);
  const deltas = {};
  if (state === 'ORDERED_SEQUENCE_ELIGIBLE') {
    for (const component of componentNames) {
      deltas[component] = controls.map(control => {
        const numerator = target.result_components[component] - control.result_components[component];
        return {
          control_id: control.sequence_id,
          control_kind: control.control_kind,
          numerator,
          denominator: 1,
          direction: direction(numerator)
        };
      });
    }
  }

  const record = {
    schema: ORDERED_ROUTE_SEQUENCE_SCHEMA,
    version: 'v0.1',
    recovery_id: input.recoveryId || randomId('orderedroute_', options.cryptoImpl || globalThis.crypto),
    created_at: input.createdAt || new Date().toISOString(),
    mode: 'BOUNDED_ORDERED_ROUTE_SEQUENCE_RECOVERY',
    declared_caps: { max_steps: maxSteps, max_controls: maxControls },
    case_id: input.caseMap?.case_id || null,
    case_map_digest: input.caseMap?.case_map_digest || null,
    route_memory_digest: input.routeMemory?.route_memory_digest || null,
    authority_context_reference: input.authorityContext?.receipt_id || null,
    authority_context_digest: input.authorityContext?.authority_context_digest || null,
    calibration_binding_id: input.calibrationBinding?.binding_id || null,
    calibration_binding_digest: input.calibrationBinding?.binding_digest || null,
    target,
    controls,
    componentwise_sequence_deltas: deltas,
    checks: {
      authority_context_verified: authorityVerified,
      calibration_binding_verified: calibrationVerified,
      current_case_binding: !failedChecks.includes('calibration-case-binding-stale'),
      target_receipt_continuity: !failedChecks.some(value => value.includes('target') && (value.includes('step') || value.includes('transition') || value.includes('tamper'))),
      reordered_control_observed: reorderedControls.length > 0 && !failedChecks.some(value => value.includes('reordered-control-invalid')),
      truncated_control_observed: truncatedControls.length > 0 && !failedChecks.some(value => value.includes('truncated-control-invalid')),
      components_complete: !failedChecks.some(value => value.includes('component') || value.includes('unsafe')),
      declared_caps_held: !failedChecks.some(value => value.includes('cap')),
      cancellation_clear: !failedChecks.includes('cancelled')
    },
    state,
    sequence_recovery_eligible: state === 'ORDERED_SEQUENCE_ELIGIBLE',
    failed_checks: failedChecks,
    source_status: String(input.sourceStatus || 'DERIVED').toUpperCase(),
    missingness: uniqueSorted(input.missingness || []),
    alternatives: uniqueSorted(input.alternatives || ['repair stepwise receipt continuity', 'supply matched reordered and truncated controls', 'rebind current Authority Context and calibration receipts']),
    open_questions: uniqueSorted(input.openQuestions || []),
    operator_notes: uniqueSorted(input.operatorNotes || []),
    closure: { required: true, status: String(input.closureStatus || 'OPEN') },
    ordered_sequence_effect_is_causation: false,
    surveillance_probability: null,
    prediction_authorized: false,
    identity_or_intent_inference_authorized: false,
    release_authorized: false,
    transport_authorized: false,
    suppression_authorized: false,
    cinder_action_authorized: false,
    readers_reexecuted: false,
    provider_called: false,
    network_called: false,
    storage_mutated: false,
    recommendation_not_command: true,
    recovery_digest: null
  };
  record.recovery_digest = await canonicalDigest(DOMAIN, without(record, 'recovery_digest'), options);
  return freeze(record);
}

export async function verifyOrderedRouteSequence(value, options = {}) {
  return Boolean(value && value.schema === ORDERED_ROUTE_SEQUENCE_SCHEMA
    && SHA256.test(String(value.recovery_digest || ''))
    && value.recovery_digest === await canonicalDigest(DOMAIN, without(value, 'recovery_digest'), options));
}

export async function replayOrderedRouteSequence(value, input = {}, options = {}) {
  const rebuilt = await compileOrderedRouteSequence({
    ...input,
    recoveryId: value?.recovery_id,
    createdAt: value?.created_at
  }, options);
  const sourceVerified = await verifyOrderedRouteSequence(value, options);
  const exact = sourceVerified && rebuilt.recovery_digest === value?.recovery_digest;
  const record = {
    schema: ORDERED_ROUTE_SEQUENCE_REPLAY_SCHEMA,
    version: 'v0.1',
    replay_id: input.replayId || randomId('orderedreplay_', options.cryptoImpl || globalThis.crypto),
    created_at: input.replayCreatedAt || new Date().toISOString(),
    source_recovery_id: value?.recovery_id || null,
    source_recovery_digest: value?.recovery_digest || null,
    status: exact ? 'ORDERED_ROUTE_REPLAY_VERIFIED' : 'ORDERED_ROUTE_REPLAY_HELD',
    source_digest_verified: sourceVerified,
    exact_recomputation_verified: exact,
    readers_reexecuted: false,
    provider_called: false,
    network_called: false,
    storage_mutated: false,
    release_authorized: false,
    transport_authorized: false,
    suppression_authorized: false,
    cinder_action_authorized: false,
    replay_digest: null
  };
  record.replay_digest = await canonicalDigest(REPLAY_DOMAIN, without(record, 'replay_digest'), options);
  return freeze(record);
}

export async function verifyOrderedRouteSequenceReplay(value, options = {}) {
  return Boolean(value && value.schema === ORDERED_ROUTE_SEQUENCE_REPLAY_SCHEMA
    && SHA256.test(String(value.replay_digest || ''))
    && value.replay_digest === await canonicalDigest(REPLAY_DOMAIN, without(value, 'replay_digest'), options));
}
