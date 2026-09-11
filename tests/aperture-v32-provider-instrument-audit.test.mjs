import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  APERTURE_V32_PROVIDER_INSTRUMENT_SCHEMA,
  auditProviderInstrumentState,
  classifyProviderHttpStatus,
  selfTestProviderInstrumentAudit
} from '../app/engine/aperture-v32-provider-instrument-audit.js';

assert.equal(classifyProviderHttpStatus(200), 'SUCCESS');
assert.equal(classifyProviderHttpStatus(400), 'CLIENT_REQUEST');
assert.equal(classifyProviderHttpStatus(403), 'AUTHORIZATION_OR_POLICY');
assert.equal(classifyProviderHttpStatus(408), 'TRANSIENT');
assert.equal(classifyProviderHttpStatus(429), 'TRANSIENT');
assert.equal(classifyProviderHttpStatus(503), 'TRANSIENT');
assert.equal(classifyProviderHttpStatus(null), 'UNOBSERVED');
assert.equal(classifyProviderHttpStatus(200, true), 'TRANSIENT');

const release1103 = auditProviderInstrumentState({
  listing_status: 'FRESH_LISTED',
  request_envelope: 'REJECTED',
  generation_completion: 'NOT_REACHED',
  compute_budget: 'NOT_REACHED',
  sampling_controls: 'GENERATION_MISMATCH',
  retry_policy: 'BOUNDED_TRANSIENT_ONLY',
  health_memory_scope: 'PROCESS_LOCAL',
  receiver_identity: 'RECEIPT_ONLY',
  http_status: 400
});
assert.equal(release1103.schema, APERTURE_V32_PROVIDER_INSTRUMENT_SCHEMA);
assert.equal(release1103.disposition, 'REJECT');
assert.ok(release1103.deficit_classes.includes('REQUEST_ENVELOPE_INCOMPATIBLE'));
assert.ok(release1103.deficit_classes.includes('REQUEST_CONTROL_GENERATION_MISMATCH'));
assert.ok(release1103.deficit_classes.includes('CLIENT_REQUEST_REJECTION'));
assert.ok(release1103.deficit_classes.includes('PROVIDER_HEALTH_MEMORY_NON_DURABLE'));
assert.ok(release1103.deficit_classes.includes('RECEIVER_IDENTITY_SALIENCE_DEFICIT'));
assert.equal(release1103.health_attribution, 'ROUTE_OR_REQUEST_FAULT_NOT_PROVIDER_HEALTH_EVIDENCE');
assert.equal(release1103.model_removal_authority, false);
assert.equal(release1103.routing_mutation_authority, false);
assert.equal(release1103.automatic_provider_call, false);

const hushCompletionBlind = auditProviderInstrumentState({
  listing_status: 'FRESH_LISTED',
  request_envelope: 'VALIDATED',
  generation_completion: 'UNOBSERVED',
  compute_budget: 'TRUNCATION_RISK',
  sampling_controls: 'COMPATIBLE_EXPLICIT',
  retry_policy: 'BOUNDED_TRANSIENT_ONLY',
  health_memory_scope: 'PROCESS_LOCAL',
  receiver_identity: 'RECEIPT_ONLY',
  http_status: 200
});
assert.equal(hushCompletionBlind.disposition, 'ABSTAIN');
assert.ok(hushCompletionBlind.deficit_classes.includes('COMPLETION_OBSERVABILITY_DEFICIT'));
assert.ok(hushCompletionBlind.deficit_classes.includes('COMPUTE_BUDGET_GEOMETRY_DEFICIT'));
assert.equal(hushCompletionBlind.health_attribution, 'REQUEST_SUCCESS_NOT_GLOBAL_PROVIDER_HEALTH_PROOF');

const samplingMismatch = auditProviderInstrumentState({
  listing_status: 'FRESH_LISTED',
  request_envelope: 'VALIDATED',
  generation_completion: 'COMPLETE',
  compute_budget: 'ADEQUATE',
  sampling_controls: 'GENERATION_MISMATCH',
  retry_policy: 'BOUNDED_TRANSIENT_ONLY',
  health_memory_scope: 'DURABLE',
  receiver_identity: 'SALIENT',
  http_status: 200
});
assert.equal(samplingMismatch.disposition, 'REJECT');
assert.ok(samplingMismatch.deficit_classes.includes('REQUEST_CONTROL_GENERATION_MISMATCH'));

const fallbackOnlyInReceipt = auditProviderInstrumentState({
  listing_status: 'FRESH_LISTED',
  request_envelope: 'VALIDATED',
  generation_completion: 'COMPLETE',
  compute_budget: 'ADEQUATE',
  sampling_controls: 'DEFAULTS',
  retry_policy: 'BOUNDED_TRANSIENT_ONLY',
  health_memory_scope: 'DURABLE',
  receiver_identity: 'RECEIPT_ONLY',
  http_status: 200
});
assert.equal(fallbackOnlyInReceipt.disposition, 'PROPOSE');
assert.deepEqual(fallbackOnlyInReceipt.deficit_classes, ['RECEIVER_IDENTITY_SALIENCE_DEFICIT']);

const transientWithoutRetry = auditProviderInstrumentState({
  listing_status: 'FRESH_LISTED',
  request_envelope: 'VALIDATED',
  generation_completion: 'NOT_REACHED',
  compute_budget: 'NOT_REACHED',
  sampling_controls: 'DEFAULTS',
  retry_policy: 'NONE',
  health_memory_scope: 'DURABLE',
  receiver_identity: 'SALIENT',
  http_status: 503
});
assert.equal(transientWithoutRetry.disposition, 'PROPOSE');
assert.ok(transientWithoutRetry.deficit_classes.includes('TRANSIENT_RESILIENCE_DEFICIT'));
assert.equal(transientWithoutRetry.health_attribution, 'TRANSIENT_PROVIDER_SIGNAL_ONLY');

const wrongRetryClass = auditProviderInstrumentState({
  listing_status: 'FRESH_LISTED',
  request_envelope: 'REJECTED',
  generation_completion: 'NOT_REACHED',
  compute_budget: 'NOT_REACHED',
  sampling_controls: 'GENERATION_MISMATCH',
  retry_policy: 'RETRIES_CLIENT_ERRORS',
  health_memory_scope: 'PROCESS_LOCAL',
  receiver_identity: 'RECEIPT_ONLY',
  http_status: 400
});
assert.equal(wrongRetryClass.disposition, 'REJECT');
assert.ok(wrongRetryClass.deficit_classes.includes('CLIENT_ERROR_RETRY_POLICY_DEFICIT'));

const clean = auditProviderInstrumentState({
  listing_status: 'FRESH_LISTED',
  request_envelope: 'VALIDATED',
  generation_completion: 'COMPLETE',
  compute_budget: 'ADEQUATE',
  sampling_controls: 'DEFAULTS',
  retry_policy: 'BOUNDED_TRANSIENT_ONLY',
  health_memory_scope: 'DURABLE',
  receiver_identity: 'SALIENT',
  http_status: 200
});
assert.equal(clean.disposition, 'ASK_NOTHING');
assert.deepEqual(clean.deficit_classes, []);
assert.equal(clean.model_removal_authority, false);
assert.equal(clean.no_scalar_crown, true);

const invalid = auditProviderInstrumentState({
  listing_status: 'MAGIC',
  request_envelope: 'VALIDATED',
  generation_completion: 'COMPLETE',
  compute_budget: 'ADEQUATE',
  sampling_controls: 'DEFAULTS',
  retry_policy: 'BOUNDED_TRANSIENT_ONLY',
  health_memory_scope: 'DURABLE',
  receiver_identity: 'SALIENT',
  http_status: 200
});
assert.equal(invalid.disposition, 'REJECT');
assert.deepEqual(invalid.deficit_classes, ['INVALID_DECLARED_PROVIDER_INSTRUMENT_STATE']);

const fixture = JSON.parse(fs.readFileSync('tests/fixtures/aperture/provider-stack-field-trip.json', 'utf8'));
assert.equal(fixture.schema, 'td613.aperture.provider-instrument-field-fixture/v0.1');
const fixtureReceipts = Object.fromEntries(fixture.cases.map(row => [row.id, auditProviderInstrumentState(row.input)]));
assert.equal(fixtureReceipts['release-1103-gemini25-route-rejection'].disposition, 'REJECT');
assert.equal(fixtureReceipts['release-1103-gemini25-route-rejection'].model_removal_authority, false);
assert.equal(fixtureReceipts['hush-http200-completion-blindness'].disposition, 'ABSTAIN');
assert.equal(fixtureReceipts['marrowline-successful-fallback-receipt-only'].disposition, 'PROPOSE');
assert.equal(fixtureReceipts['clean-reference-control'].disposition, 'ASK_NOTHING');

assert.equal(selfTestProviderInstrumentAudit().status, 'pass');

console.log('aperture-v32-provider-instrument-audit.test.mjs passed');
