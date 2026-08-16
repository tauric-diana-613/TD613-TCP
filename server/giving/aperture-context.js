import { GivingError, sha256 } from './util.js';

export const GIVING_APERTURE_CONTEXT_SCHEMA = 'td613.giving.aperture-context/v0.1';
const APERTURE_DIAGNOSTIC_SCHEMA = 'td613.aperture.diagnostic-receipt/v3.0-alpha';
const RUNTIME_LEVELS = new Set(['NONE', 'BACKGROUND', 'MATERIAL', 'DISPOSITIVE']);
const SOURCE_STATUSES = new Set(['OBSERVED', 'SUPPLIED', 'DERIVED', 'SIMULATED', 'INFERRED', 'ATTESTED', 'UNRESOLVED']);

function plainObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : null;
}

function boundedString(value, label, { max = 160, pattern = null } = {}) {
  const text = String(value || '').trim();
  if (!text || text.length > max || (pattern && !pattern.test(text))) {
    throw new GivingError('aperture-context-withheld', `Aperture context ${label} is missing or malformed`, 400);
  }
  return text;
}

function boundedCount(value, label) {
  const count = Number(value);
  if (!Number.isSafeInteger(count) || count < 0 || count > 10000) {
    throw new GivingError('aperture-context-withheld', `Aperture context ${label} is malformed`, 400);
  }
  return count;
}

function assertExactKeys(value, allowed, label) {
  const unknown = Object.keys(value).filter((key) => !allowed.has(key));
  if (unknown.length) {
    throw new GivingError('aperture-context-withheld', `Aperture context ${label} contains unrecognized fields`, 400, { fields: unknown });
  }
}

export function observeGivingApertureContext(value) {
  if (value == null) return null;
  const context = plainObject(value);
  if (!context) throw new GivingError('aperture-context-withheld', 'Aperture context must be an object', 400);
  assertExactKeys(context, new Set([
    'schema', 'source', 'direction', 'aperture_receipt_schema', 'aperture_receipt_reference',
    'source_status', 'task_intent', 'missingness_count', 'contradiction_count', 'authority'
  ]), 'envelope');
  if (context.schema !== GIVING_APERTURE_CONTEXT_SCHEMA || context.source !== 'TD613 Aperture' || context.direction !== 'APERTURE_TO_GIVING') {
    throw new GivingError('aperture-context-withheld', 'Aperture context identity or direction is not admitted', 400);
  }
  if (context.aperture_receipt_schema !== APERTURE_DIAGNOSTIC_SCHEMA) {
    throw new GivingError('aperture-context-withheld', 'Aperture diagnostic schema is not admitted for Giving', 400);
  }
  const receiptReference = boundedString(context.aperture_receipt_reference, 'receipt reference', {
    pattern: /^apdiag_[A-Za-z0-9_-]{6,128}$/
  });
  const sourceStatus = boundedString(context.source_status, 'source status', { max: 32 }).toUpperCase();
  if (!SOURCE_STATUSES.has(sourceStatus)) throw new GivingError('aperture-context-withheld', 'Aperture source status is not admitted', 400);

  const task = plainObject(context.task_intent);
  if (!task) throw new GivingError('aperture-context-withheld', 'Aperture task intent is required', 400);
  assertExactKeys(task, new Set(['primary_route', 'runtime_materiality', 'automatic_redirect']), 'task intent');
  const primaryRoute = boundedString(task.primary_route, 'primary route', { max: 96, pattern: /^[A-Z0-9_.:-]+$/ });
  const runtimeMateriality = boundedString(task.runtime_materiality, 'runtime materiality', { max: 24 }).toUpperCase();
  if (!RUNTIME_LEVELS.has(runtimeMateriality) || task.automatic_redirect !== false) {
    throw new GivingError('aperture-context-withheld', 'Aperture task intent may not redirect or exceed declared runtime materiality', 400);
  }

  const authority = plainObject(context.authority);
  if (!authority) throw new GivingError('aperture-context-withheld', 'Aperture authority boundary is required', 400);
  assertExactKeys(authority, new Set([
    'recommendation_not_command', 'reciprocal_authority', 'giving_authority', 'mutation_authority',
    'automatic_ash_action', 'operator_closure_required'
  ]), 'authority');
  if (
    authority.recommendation_not_command !== true ||
    authority.reciprocal_authority !== false ||
    authority.giving_authority !== false ||
    authority.mutation_authority !== false ||
    authority.automatic_ash_action !== false ||
    authority.operator_closure_required !== true
  ) {
    throw new GivingError('aperture-context-withheld', 'Aperture context attempted an authority-bearing posture', 400);
  }

  return Object.freeze({
    schema: GIVING_APERTURE_CONTEXT_SCHEMA,
    source: 'TD613 Aperture',
    direction: 'APERTURE_TO_GIVING',
    aperture_receipt_schema: APERTURE_DIAGNOSTIC_SCHEMA,
    aperture_receipt_reference: receiptReference,
    source_status: sourceStatus,
    task_intent: Object.freeze({
      primary_route: primaryRoute,
      runtime_materiality: runtimeMateriality,
      automatic_redirect: false
    }),
    missingness_count: boundedCount(context.missingness_count, 'missingness count'),
    contradiction_count: boundedCount(context.contradiction_count, 'contradiction count'),
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

export function publicGivingApertureContextReceipt(context) {
  if (!context) return null;
  return Object.freeze({
    status: 'OBSERVED_NON_AUTHORITATIVE',
    direction: context.direction,
    aperture_receipt_reference: context.aperture_receipt_reference,
    task_intent_route: context.task_intent.primary_route,
    runtime_materiality: context.task_intent.runtime_materiality,
    missingness_count: context.missingness_count,
    contradiction_count: context.contradiction_count,
    context_digest: sha256(context),
    authority_effect: 'NONE'
  });
}
