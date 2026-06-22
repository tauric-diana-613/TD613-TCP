function getPath(value, path) { return String(path || '').split('.').reduce((node, key) => (node && Object.prototype.hasOwnProperty.call(node, key) ? node[key] : undefined), value); }
function asArray(value) { return Array.isArray(value) ? value : []; }
function note(message) { return message ? [message] : []; }
function bool(value) { return value === true; }
function present(value) { return value !== undefined && value !== null && value !== ''; }

const BREACH_STATUSES = new Set(['unauthorized-dispatch', 'raw-prompt-breach', 'raw-corpus-breach', 'private-echo-breach', 'firmware-claim-blocked']);
const DRIFT_STATUSES = new Set(['provider-target-drift', 'model-drift', 'endpoint-drift']);
const REVIEW_STATUSES = new Set(['blocked-before-send', 'failed-dispatch', 'timeout', 'cancelled', 'incomplete-payload', 'missing-claim-limits', 'missing-refusal-policy', 'missing-mode-or-trigger', 'private-text-review', 'expected-refusal-possible', 'unexpected-refusal-review', 'safety-review', 'filtered', 'provider-warning', 'review-required', 'route-review', 'missing-seed-review']);

function severityFor(status) {
  if (BREACH_STATUSES.has(status)) return 'breach';
  if (DRIFT_STATUSES.has(status) || REVIEW_STATUSES.has(status)) return 'review';
  if (status === 'blocked' || status === 'not-comparable') return 'breach';
  return 'info';
}

export function compareProviderTarget(contractPacket = {}, providerLogPacket = {}) {
  const expectedProvider = getPath(contractPacket, 'provider_target.provider_class');
  const observedProvider = getPath(providerLogPacket, 'provider_target_observed.provider_class');
  const expectedModel = getPath(contractPacket, 'provider_target.model_name');
  const observedModel = getPath(providerLogPacket, 'provider_target_observed.model_name');
  const expectedEndpoint = getPath(contractPacket, 'provider_target.endpoint_class');
  const observedEndpoint = getPath(providerLogPacket, 'provider_target_observed.endpoint_class');
  let status = 'aligned';
  const notes = [];
  if (!present(expectedProvider) || !present(observedProvider) || !present(expectedEndpoint) || !present(observedEndpoint)) status = 'not-comparable';
  else if (expectedProvider !== observedProvider) { status = 'provider-target-drift'; notes.push('provider class changed between contract and provider log'); }
  else if (present(expectedModel) && present(observedModel) && expectedModel !== observedModel) { status = 'model-drift'; notes.push('model name changed between contract and provider log'); }
  else if (expectedEndpoint !== observedEndpoint) { status = 'endpoint-drift'; notes.push('endpoint class changed between contract and provider log'); }
  return Object.freeze({ schema_version: 'td613.hush.provider-target-comparison/v1', expected_provider_class: expectedProvider || null, observed_provider_class: observedProvider || null, expected_model_name: expectedModel || null, observed_model_name: observedModel || null, expected_endpoint_class: expectedEndpoint || null, observed_endpoint_class: observedEndpoint || null, status, severity: severityFor(status), notes });
}

export function compareDispatch(contractPacket = {}, providerLogPacket = {}) {
  const allowed = getPath(contractPacket, 'release_discipline.provider_dispatch_allowed');
  const attempted = getPath(providerLogPacket, 'dispatch_observation.dispatch_attempted');
  const dispatchStatus = getPath(providerLogPacket, 'dispatch_observation.dispatch_status');
  const override = getPath(providerLogPacket, 'dispatch_observation.operator_override_used') === true;
  let status = 'aligned';
  if (typeof allowed !== 'boolean' || typeof attempted !== 'boolean') status = 'not-comparable';
  else if (!allowed && attempted) status = 'unauthorized-dispatch';
  else if (allowed && !attempted) status = 'blocked-before-send';
  else if (dispatchStatus === 'blocked-before-send') status = 'blocked-before-send';
  else if (/timeout/iu.test(String(dispatchStatus || ''))) status = 'timeout';
  else if (/cancel/iu.test(String(dispatchStatus || ''))) status = 'cancelled';
  else if (dispatchStatus && !['sent', 'success', 'unknown'].includes(dispatchStatus)) status = 'failed-dispatch';
  return Object.freeze({ schema_version: 'td613.hush.dispatch-comparison/v1', contract_dispatch_allowed: allowed === true, log_dispatch_attempted: attempted === true, log_dispatch_status: dispatchStatus || null, operator_override_used: override, status, severity: severityFor(status), notes: note(status === 'unauthorized-dispatch' ? 'dispatch occurred when contract did not allow provider dispatch' : null) });
}

export function comparePayload(contractPacket = {}, providerLogPacket = {}) {
  const claimLimitsRequired = Boolean(contractPacket.claim_limits);
  const claimLimitsSent = getPath(providerLogPacket, 'request_payload_observation.claim_limits_sent') === true;
  const refusalPolicyRequired = Boolean(contractPacket.refusal_policy);
  const refusalPolicySent = getPath(providerLogPacket, 'request_payload_observation.refusal_policy_sent') === true;
  const expectedMode = getPath(contractPacket, 'mask_context.discourse_mode');
  const modeSent = getPath(providerLogPacket, 'request_payload_observation.discourse_mode_sent') === true;
  const expectedTrigger = getPath(contractPacket, 'mask_context.retrieval_trigger');
  const triggerSent = getPath(providerLogPacket, 'request_payload_observation.retrieval_trigger_sent') === true;
  let status = 'aligned';
  if (!providerLogPacket.request_payload_observation) status = 'not-comparable';
  else if (claimLimitsRequired && !claimLimitsSent) status = 'missing-claim-limits';
  else if (refusalPolicyRequired && !refusalPolicySent) status = 'missing-refusal-policy';
  else if ((present(expectedMode) && !modeSent) || (present(expectedTrigger) && !triggerSent)) status = 'missing-mode-or-trigger';
  return Object.freeze({ schema_version: 'td613.hush.payload-comparison/v1', claim_limits_required: claimLimitsRequired, claim_limits_observed_sent: claimLimitsSent, refusal_policy_required: refusalPolicyRequired, refusal_policy_observed_sent: refusalPolicySent, expected_discourse_mode: expectedMode || null, observed_discourse_mode_sent: modeSent, expected_retrieval_trigger: expectedTrigger || null, observed_retrieval_trigger_sent: triggerSent, status, severity: severityFor(status), notes: [] });
}

export function comparePrivacy(contractPacket = {}, providerLogPacket = {}) {
  const rawPromptAllowed = getPath(contractPacket, 'instruction_contract.raw_prompt_exported') === true || getPath(contractPacket, 'private_text_policy.raw_user_text_exported') === true;
  const rawCustomizerAllowed = getPath(contractPacket, 'private_text_policy.raw_customizer_samples_exported') === true;
  const rawMaskAllowed = getPath(contractPacket, 'private_text_policy.raw_mask_material_exported') === true;
  const privateAllowed = getPath(contractPacket, 'private_text_policy.provider_payload_contains_private_text') === true;
  const rawPromptSent = getPath(providerLogPacket, 'request_payload_observation.raw_prompt_sent') === true;
  const rawCustomizerSent = getPath(providerLogPacket, 'request_payload_observation.raw_customizer_samples_sent') === true;
  const rawMaskSent = getPath(providerLogPacket, 'request_payload_observation.raw_mask_material_sent') === true;
  const privateSent = getPath(providerLogPacket, 'request_payload_observation.private_text_sent') === true;
  const echo = getPath(providerLogPacket, 'response_observation.contains_private_text_echo') === true || getPath(providerLogPacket, 'redaction_profile.private_text_echo_detected') === true;
  let status = 'aligned';
  if (!providerLogPacket.request_payload_observation || !providerLogPacket.redaction_profile) status = 'not-comparable';
  else if (!rawPromptAllowed && rawPromptSent) status = 'raw-prompt-breach';
  else if ((!rawCustomizerAllowed && rawCustomizerSent) || (!rawMaskAllowed && rawMaskSent)) status = 'raw-corpus-breach';
  else if (echo) status = 'private-echo-breach';
  else if (!privateAllowed && privateSent) status = 'private-text-review';
  return Object.freeze({ schema_version: 'td613.hush.privacy-comparison/v1', contract_raw_prompt_allowed: rawPromptAllowed, log_raw_prompt_sent: rawPromptSent, contract_raw_customizer_samples_allowed: rawCustomizerAllowed, log_raw_customizer_samples_sent: rawCustomizerSent, contract_raw_mask_material_allowed: rawMaskAllowed, log_raw_mask_material_sent: rawMaskSent, contract_private_text_allowed: privateAllowed, log_private_text_sent: privateSent, response_private_text_echo_detected: echo, status, severity: severityFor(status), notes: [] });
}

export function compareRefusal(contractPacket = {}, providerLogPacket = {}) {
  const policyPresent = Boolean(contractPacket.refusal_policy && asArray(getPath(contractPacket, 'refusal_policy.must_refuse_if')).length);
  const refusalDetected = getPath(providerLogPacket, 'refusal_observation.refusal_detected') === true || getPath(providerLogPacket, 'response_observation.contains_provider_refusal_language') === true;
  const source = getPath(providerLogPacket, 'refusal_observation.refusal_source') || 'none';
  const summary = getPath(providerLogPacket, 'refusal_observation.refusal_reason_summary') || null;
  let status = 'no-refusal';
  if (!policyPresent) status = 'refusal-policy-missing';
  else if (!providerLogPacket.refusal_observation && !providerLogPacket.response_observation) status = 'not-comparable';
  else if (refusalDetected && getPath(providerLogPacket, 'refusal_observation.unexpected_refusal_possible') === true) status = 'unexpected-refusal-review';
  else if (refusalDetected) status = 'expected-refusal-possible';
  return Object.freeze({ schema_version: 'td613.hush.refusal-comparison/v1', contract_refusal_policy_present: policyPresent, provider_refusal_detected: refusalDetected, refusal_source: source, provider_refusal_reason_summary: summary, status, severity: severityFor(status), notes: [] });
}

export function compareSafety(contractPacket = {}, providerLogPacket = {}) {
  const safety = providerLogPacket.safety_event_profile || null;
  let status = 'no-safety-event';
  if (!safety) status = 'not-comparable';
  else if (safety.content_filter_triggered || safety.policy_refusal_triggered) status = 'filtered';
  else if (safety.provider_warning_present) status = 'provider-warning';
  else if (safety.safety_event_detected) status = 'safety-review';
  return Object.freeze({ schema_version: 'td613.hush.safety-comparison/v1', safety_event_detected: Boolean(safety && safety.safety_event_detected), content_filter_triggered: Boolean(safety && safety.content_filter_triggered), policy_refusal_triggered: Boolean(safety && safety.policy_refusal_triggered), provider_warning_present: Boolean(safety && safety.provider_warning_present), status, severity: severityFor(status), notes: [] });
}

export function compareRelease(contractPacket = {}, providerLogPacket = {}, comparisonStatuses = []) {
  const contractRelease = getPath(contractPacket, 'release_discipline.release_class');
  const logRelease = getPath(providerLogPacket, 'provider_log_release_discipline.release_class');
  let status = 'ready-for-audit';
  if (!contractRelease || !logRelease) status = 'not-comparable';
  else if (contractRelease === 'blocked' || logRelease === 'blocked') status = 'blocked';
  else if (comparisonStatuses.some((item) => BREACH_STATUSES.has(item))) status = 'blocked';
  else if (['operator-review', 'private-text-review'].includes(contractRelease) || ['private-text-review', 'provider-error-log'].includes(logRelease)) status = 'review-required';
  else if (!(contractRelease === 'provider-ready' && logRelease === 'audit-ready')) status = 'review-required';
  return Object.freeze({ schema_version: 'td613.hush.release-comparison/v1', contract_release_class: contractRelease || null, provider_log_release_class: logRelease || null, status, severity: severityFor(status), notes: [] });
}

export function routeStylometryAudit(contractPacket = {}, providerLogPacket = {}) {
  const required = contractPacket.stylometry_constraints !== undefined && getPath(contractPacket, 'stylometry_constraints.stylometry_engine') !== 'none';
  const seedPresent = Boolean(providerLogPacket.stylometry_observation_seed);
  const flags = asArray(getPath(providerLogPacket, 'stylometry_observation_seed.candidate_drift_flags'));
  let status = 'audit-not-required';
  if (required && seedPresent) status = 'audit-required';
  else if (required && !seedPresent) status = 'missing-seed-review';
  return Object.freeze({ schema_version: 'td613.hush.stylometry-audit-routing/v1', contract_stylometry_required: required, provider_log_stylometry_seed_present: seedPresent, candidate_drift_flags: flags, status, claim_limit: 'routing only; not stylometric verdict' });
}

export function routeAdversarialAudit(contractPacket = {}, providerLogPacket = {}) {
  const required = getPath(contractPacket, 'adversarial_constraints.enabled') === true;
  const seedPresent = Boolean(providerLogPacket.adversarial_observation_seed);
  const attackSurfaces = asArray(getPath(providerLogPacket, 'adversarial_observation_seed.attack_surfaces'));
  let status = 'audit-not-required';
  if (required && seedPresent) status = 'audit-required';
  else if (required && !seedPresent) status = 'missing-seed-review';
  return Object.freeze({ schema_version: 'td613.hush.adversarial-audit-routing/v1', contract_adversarial_required: required, provider_log_adversarial_seed_present: seedPresent, attack_surfaces: attackSurfaces, status, claim_limit: 'routing only; not adversarial verdict' });
}

export function compareEoRfdRoute(contractPacket = {}, providerLogPacket = {}) {
  const contractFirmware = getPath(contractPacket, 'eo_rfd_route_state.firmware_status');
  const logFirmware = getPath(providerLogPacket, 'eo_rfd_route_observation.firmware_status');
  const contractHook = getPath(contractPacket, 'eo_rfd_route_state.route_conscience_hook');
  const logHook = getPath(providerLogPacket, 'eo_rfd_route_observation.route_conscience_hook_observed');
  const contractApertureSchema = getPath(contractPacket, 'eo_rfd_route_state.aperture_context.aperture_schema');
  const logApertureSchema = getPath(providerLogPacket, 'eo_rfd_route_observation.aperture_context.aperture_schema');
  const verified = getPath(providerLogPacket, 'eo_rfd_route_observation.firmware_adapter_verified') === true;
  const noteBody = JSON.stringify(providerLogPacket.eo_rfd_route_observation || {});
  let status = 'aligned-interface';
  if (!contractFirmware || !logFirmware) status = 'not-comparable';
  else if ((contractFirmware === 'firmware-attached' || logFirmware === 'firmware-attached') && !verified) status = 'firmware-claim-blocked';
  else if (/executive[-\s]*order|legal authority|public law/iu.test(noteBody)) status = 'firmware-claim-blocked';
  else if (contractHook !== logHook) status = 'route-review';
  else if (contractApertureSchema && logApertureSchema && contractApertureSchema !== logApertureSchema) status = 'route-review';
  return Object.freeze({ schema_version: 'td613.hush.eo-rfd-route-comparison/v1', contract_firmware_status: contractFirmware || null, log_firmware_status: logFirmware || null, contract_route_conscience_hook: contractHook || null, log_route_conscience_hook_observed: logHook || null, contract_aperture_schema: contractApertureSchema || null, log_aperture_schema: logApertureSchema || null, firmware_adapter_verified: verified, status, severity: severityFor(status), claim_limit: 'EO-RFD route comparison only; not firmware proof' });
}

export function aggregateContractLogComparison(comparisons = {}) {
  const sectionEntries = Object.entries(comparisons).filter(([key]) => key !== 'stylometry_audit_routing' && key !== 'adversarial_audit_routing');
  const statuses = sectionEntries.map(([, value]) => value && value.status).filter(Boolean);
  const blocking = [];
  const review = [];
  const auditRoutes = [];
  for (const [key, value] of sectionEntries) {
    const status = value && value.status;
    if (!status) continue;
    if (status === 'not-comparable') review.push(`${key}: not-comparable`);
    else if (BREACH_STATUSES.has(status) || status === 'blocked') blocking.push(`${key}: ${status}`);
    else if (DRIFT_STATUSES.has(status) || REVIEW_STATUSES.has(status)) review.push(`${key}: ${status}`);
  }
  if (comparisons.stylometry_audit_routing && comparisons.stylometry_audit_routing.status === 'audit-required') auditRoutes.push('stylometry');
  if (comparisons.adversarial_audit_routing && comparisons.adversarial_audit_routing.status === 'audit-required') auditRoutes.push('adversarial');
  let status = 'aligned';
  if (blocking.length) status = 'breach-detected';
  else if (review.some((item) => /drift/iu.test(item))) status = 'drift-detected';
  else if (review.length) status = 'review-required';
  if (statuses.length && statuses.every((item) => item === 'not-comparable')) status = 'not-comparable';
  return Object.freeze({ schema_version: 'td613.hush.comparison-result/v1', status, severity: blocking.length ? 'breach' : review.length ? 'review' : 'info', summary: blocking.length ? 'Provider-boundary comparison detected breach-level surfaces.' : review.length ? 'Provider-boundary comparison requires review.' : 'Provider-boundary comparison surfaces are aligned; later audits may still be required.', blocking_reasons: blocking, review_reasons: review, audit_routes: auditRoutes });
}
