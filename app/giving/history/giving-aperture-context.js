import {
  APERTURE_DIAGNOSTIC_SCHEMA,
  validateApertureDiagnosticReceipt
} from '../../engine/aperture-v3-reciprocal-bridge.js';

export const GIVING_APERTURE_CONTEXT_SCHEMA = 'td613.giving.aperture-context/v0.1';
export const GIVING_APERTURE_HANDOFF_KEY = 'td613.gateway.aperture-handoff';

const RUNTIME_LEVELS = new Set(['NONE', 'BACKGROUND', 'MATERIAL', 'DISPOSITIVE']);

function boundedText(value, fallback = '', max = 160) {
  const text = String(value ?? fallback).trim();
  return text.slice(0, max);
}

function countList(value) {
  return Array.isArray(value) ? value.length : 0;
}

export function projectGivingApertureContext(receipt) {
  validateApertureDiagnosticReceipt(receipt);
  const task = receipt.taskIntent || receipt.task_intent || {};
  const primaryRoute = boundedText(task.primary_route || task.primaryRoute, 'REQUESTED_SYNTHESIS', 96);
  const runtimeMateriality = boundedText(task.runtime_materiality || task.runtimeMateriality, 'BACKGROUND', 24).toUpperCase();
  if (!RUNTIME_LEVELS.has(runtimeMateriality)) throw new Error('Unsupported Aperture runtime materiality for Giving.');

  return Object.freeze({
    schema: GIVING_APERTURE_CONTEXT_SCHEMA,
    source: 'TD613 Aperture',
    direction: 'APERTURE_TO_GIVING',
    aperture_receipt_schema: APERTURE_DIAGNOSTIC_SCHEMA,
    aperture_receipt_reference: boundedText(receipt.receipt_id || receipt.receiptId, '', 160),
    source_status: boundedText(receipt.source_status || receipt.sourceStatus, 'DERIVED', 32).toUpperCase(),
    task_intent: Object.freeze({
      primary_route: primaryRoute,
      runtime_materiality: runtimeMateriality,
      automatic_redirect: false
    }),
    missingness_count: countList(receipt.missingness),
    contradiction_count: countList(receipt.contradictions),
    authority: Object.freeze({
      recommendation_not_command: true,
      reciprocal_authority: false,
      giving_authority: false,
      mutation_authority: false,
      automatic_ash_action: false,
      operator_closure_required: true
    })
  });
}

export function readGivingApertureContext(storage = globalThis.localStorage) {
  if (!storage || typeof storage.getItem !== 'function') return null;
  let raw = null;
  try {
    raw = storage.getItem(GIVING_APERTURE_HANDOFF_KEY);
  } catch {
    return null;
  }
  if (!raw) return null;
  let receipt;
  try {
    receipt = JSON.parse(raw);
  } catch {
    return null;
  }
  try {
    return projectGivingApertureContext(receipt);
  } catch {
    return null;
  }
}

export function installGivingApertureContext(runtime = globalThis, storage = runtime?.localStorage) {
  const context = readGivingApertureContext(storage);
  try {
    Object.defineProperty(runtime, '__TD613_GIVING_APERTURE_CONTEXT', {
      value: context,
      configurable: true,
      enumerable: false,
      writable: true
    });
  } catch {
    runtime.__TD613_GIVING_APERTURE_CONTEXT = context;
  }

  const root = runtime?.document?.documentElement;
  if (root?.dataset) root.dataset.givingApertureContext = context ? 'observed' : 'absent';
  if (context && typeof runtime?.dispatchEvent === 'function' && typeof runtime?.CustomEvent === 'function') {
    runtime.dispatchEvent(new runtime.CustomEvent('td613:giving:aperture-context-observed', {
      detail: { context }
    }));
  }
  return context;
}

export function currentGivingApertureContext(runtime = globalThis) {
  const context = runtime?.__TD613_GIVING_APERTURE_CONTEXT;
  return context?.schema === GIVING_APERTURE_CONTEXT_SCHEMA ? context : null;
}
