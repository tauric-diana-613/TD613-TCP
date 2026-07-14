import { stableStringify, sha256Text, isSha256, normalizeCustomizerKey } from './hush-customizer-packet.js';

export const HUSH_OUTGOING_CONTRACT_SCHEMA = 'td613.hush.outgoing-contract/v1';
export const HUSH_OUTGOING_CONTRACT_VERSION = 'hush-outgoing-contract/v1-safe-harbor-derived';
export const HUSH_OUTGOING_CONTRACT_CLASS = 'model-behavior-request-envelope';

export const HUSH_OUTGOING_CONTRACT_CLAIM_LIMITS = Object.freeze({
  schema_version: 'td613.hush.contract-claim-limits/v1',
  not_identity_proof: true,
  not_authorship_ownership_proof: true,
  not_third_party_consent: true,
  not_impersonation_authorization: true,
  not_public_legal_or_institutional_recognition: true,
  not_raw_corpus_export_clearance: true,
  provider_compliance_not_yet_proven: true
});

const DEFAULT_FORBIDDEN_TRANSFORMATIONS = Object.freeze([
  'identity-proof',
  'authorship-ownership-proof',
  'third-party-impersonation',
  'raw-corpus-reconstruction'
]);

const DEFAULT_REFUSALS = Object.freeze([
  'asks-for-identity-proof',
  'asks-for-authorship-ownership-proof',
  'asks-for-third-party-impersonation',
  'asks-for-raw-corpus-reconstruction',
  'asks-to-remove-claim-limits',
  'asks-to-export-private-samples'
]);

function clone(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }
function safeText(value) { return String(value ?? '').trim(); }
function asArray(value) { return Array.isArray(value) ? value : []; }
function bool(value, fallback = false) { return typeof value === 'boolean' ? value : fallback; }

export function isContractPacketId(value) {
  return /^TD613-HUSH-CONTRACT-\d{8}-[A-F0-9]{8}$/u.test(String(value || '').trim().toUpperCase());
}

export function containsShi(value) {
  return /TD613-SH-|SHI#:/iu.test(String(value || ''));
}

async function hashObject(value) { return sha256Text(stableStringify(value == null ? null : value)); }
async function hashText(value = '') { return sha256Text(String(value || '')); }

function requestContext(input = {}) {
  const ctx = input.request_context || input.requestContext || {};
  return Object.freeze({
    schema_version: 'td613.hush.request-context/v1',
    request_kind: ctx.request_kind || ctx.requestKind || input.requestKind || 'generation',
    surface: ctx.surface || input.surface || 'provider-bridge',
    user_visible: bool(ctx.user_visible ?? ctx.userVisible, true),
    local_only: bool(ctx.local_only ?? ctx.localOnly, false),
    source_event: ctx.source_event || ctx.sourceEvent || input.sourceEvent || 'manual',
    operator_note: ctx.operator_note || ctx.operatorNote || null
  });
}

function providerTarget(input = {}) {
  const target = input.provider_target || input.providerTarget || {};
  return Object.freeze({
    schema_version: 'td613.hush.provider-target/v1',
    provider_class: target.provider_class || target.providerClass || input.providerClass || 'unknown',
    provider_name: target.provider_name || target.providerName || input.providerName || null,
    model_name: target.model_name || target.modelName || input.modelName || null,
    endpoint_class: target.endpoint_class || target.endpointClass || input.endpointClass || 'unknown',
    network_dispatch_expected: bool(target.network_dispatch_expected ?? target.networkDispatchExpected, true),
    provider_contract_required: bool(target.provider_contract_required ?? target.providerContractRequired, true)
  });
}

function maskContext(input = {}) {
  const mask = input.mask_context || input.maskContext || input.mask || {};
  const customizer = input.customizer_packet_ref || input.customizerPacketRef || {};
  const source = mask.mask_source || mask.maskSource || (customizer.customizer_packet_id ? 'customizer' : 'no-mask');
  return Object.freeze({
    schema_version: 'td613.hush.mask-context/v1',
    mask_source: source,
    mask_id: source === 'no-mask' ? (mask.mask_id || mask.maskId || 'no-mask') : (mask.mask_id || mask.maskId || input.maskId || 'custom-unspecified-mask'),
    mask_packet_id: mask.mask_packet_id || mask.maskPacketId || null,
    customizer_packet_id: mask.customizer_packet_id || mask.customizerPacketId || customizer.customizer_packet_id || customizer.customizerPacketId || null,
    mask_release_class: mask.mask_release_class || mask.maskReleaseClass || customizer.customizer_release_class || customizer.customizerReleaseClass || 'unknown',
    discourse_mode: normalizeCustomizerKey(mask.discourse_mode || mask.discourseMode || input.discourseMode || 'general', 'general'),
    retrieval_trigger: normalizeCustomizerKey(mask.retrieval_trigger || mask.retrievalTrigger || input.retrievalTrigger || 'baseline-voice', 'baseline-voice'),
    raw_mask_material_exported: bool(mask.raw_mask_material_exported ?? mask.rawMaskMaterialExported, false)
  });
}

function customizerPacketRef(input = {}) {
  const ref = input.customizer_packet_ref || input.customizerPacketRef || {};
  if (!ref.customizer_packet_id && !ref.customizerPacketId) return Object.freeze({ schema_version: 'td613.hush.customizer-packet-ref/v1', customizer_packet_id: null, customizer_packet_hash_sha256: null, customizer_release_class: null, sample_text_exported: false, sample_count: 0, accepted_words: 0 });
  return Object.freeze({
    schema_version: 'td613.hush.customizer-packet-ref/v1',
    customizer_packet_id: ref.customizer_packet_id || ref.customizerPacketId,
    customizer_packet_hash_sha256: ref.customizer_packet_hash_sha256 || ref.customizerPacketHashSha256 || null,
    customizer_release_class: ref.customizer_release_class || ref.customizerReleaseClass || null,
    sample_text_exported: bool(ref.sample_text_exported ?? ref.sampleTextExported, false),
    sample_count: Number(ref.sample_count ?? ref.sampleCount ?? 0),
    accepted_words: Number(ref.accepted_words ?? ref.acceptedWords ?? 0)
  });
}

async function instructionContract(input = {}) {
  const source = input.instruction_contract || input.instructionContract || {};
  const systemInstruction = source.system_instruction || source.systemInstruction || input.systemInstruction || '';
  const developerInstruction = source.developer_instruction || source.developerInstruction || input.developerInstruction || '';
  const userInstruction = source.user_instruction || source.userInstruction || input.userInstruction || '';
  const assembledPrompt = source.assembled_prompt || source.assembledPrompt || [systemInstruction, developerInstruction, userInstruction].filter(Boolean).join('\n\n');
  return Object.freeze({
    schema_version: 'td613.hush.instruction-contract/v1',
    contract_class: source.contract_class || source.contractClass || input.contractClass || 'generation',
    system_instruction_hash_sha256: source.system_instruction_hash_sha256 || await hashText(systemInstruction),
    developer_instruction_hash_sha256: source.developer_instruction_hash_sha256 || await hashText(developerInstruction),
    user_instruction_hash_sha256: source.user_instruction_hash_sha256 || await hashText(userInstruction),
    assembled_prompt_hash_sha256: source.assembled_prompt_hash_sha256 || await hashText(assembledPrompt),
    raw_prompt_exported: bool(source.raw_prompt_exported ?? source.rawPromptExported, false),
    redacted_prompt_summary: source.redacted_prompt_summary || source.redactedPromptSummary || input.redactedPromptSummary || 'Prompt summarized for contract replay; raw prompt not exported by default.',
    expected_output_class: source.expected_output_class || source.expectedOutputClass || input.expectedOutputClass || 'answer',
    forbidden_transformations: asArray(source.forbidden_transformations || source.forbiddenTransformations).length ? asArray(source.forbidden_transformations || source.forbiddenTransformations) : DEFAULT_FORBIDDEN_TRANSFORMATIONS.slice()
  });
}

function stylometryConstraints(input = {}) {
  const s = input.stylometry_constraints || input.stylometryConstraints || {};
  return Object.freeze({
    schema_version: 'td613.hush.stylometry-constraints/v1',
    stylometry_engine: s.stylometry_engine || s.stylometryEngine || 'tcp-stylometry',
    target_profile_ref: clone(s.target_profile_ref || s.targetProfileRef || {}),
    cadence_target: clone(s.cadence_target || s.cadenceTarget || {}),
    surface_cadence_target: clone(s.surface_cadence_target || s.surfaceCadenceTarget || {}),
    allowed_distance_band: clone(s.allowed_distance_band || s.allowedDistanceBand || { min: 0, max: 0.35, interpretation: 'local threshold; not identity proof' }),
    overfit_controls: clone(s.overfit_controls || s.overfitControls || { catchphrase_limit: true, raw_corpus_reconstruction_block: true, single_sample_dominance_block: true }),
    claim_limit: s.claim_limit || 'stylometric constraint, not authorship identity'
  });
}

function adversarialConstraints(input = {}) {
  const a = input.adversarial_constraints || input.adversarialConstraints || {};
  return Object.freeze({
    schema_version: 'td613.hush.adversarial-constraints/v1',
    enabled: bool(a.enabled, true),
    detect_overfit: bool(a.detect_overfit ?? a.detectOverfit, true),
    detect_style_laundering: bool(a.detect_style_laundering ?? a.detectStyleLaundering, true),
    detect_third_party_mimicry: bool(a.detect_third_party_mimicry ?? a.detectThirdPartyMimicry, true),
    detect_catchphrase_infection: bool(a.detect_catchphrase_infection ?? a.detectCatchphraseInfection, true),
    detect_raw_corpus_reconstruction: bool(a.detect_raw_corpus_reconstruction ?? a.detectRawCorpusReconstruction, true),
    adversarial_action: a.adversarial_action || a.adversarialAction || 'audit-after-response'
  });
}

function eoRfdRouteState(input = {}) {
  const eo = input.eo_rfd_route_state || input.eoRfdRouteState || {};
  const aperture = eo.aperture_context || eo.apertureContext || input.aperture_context || input.apertureContext || {};
  return Object.freeze({
    schema_version: 'td613.hush.eo-rfd-route-state/v1',
    firmware_status: eo.firmware_status || eo.firmwareStatus || 'interface-only',
    operational_state: eo.operational_state || eo.operationalState || 'interface_context',
    claim_authority: eo.claim_authority || eo.claimAuthority || 'design_signal',
    target_operational_state: eo.target_operational_state || eo.targetOperationalState || 'verified-runtime-installation',
    aperture_context: Object.freeze({
      aperture_version: aperture.aperture_version || aperture.apertureVersion || 'v3.1-alpha',
      aperture_schema: aperture.aperture_schema || aperture.apertureSchema || 'td613-aperture/v3.1-alpha',
      aperture_feature_version: aperture.aperture_feature_version || aperture.apertureFeatureVersion || 'v3.1-alpha-admissibility-tomography-registry-dynamics-runtime',
      doctrine_kernel: aperture.doctrine_kernel || aperture.doctrineKernel || 'present',
      geometric_addendum: aperture.geometric_addendum || aperture.geometricAddendum || 'present',
      authority: aperture.authority || 'design-signal',
      dome_world_receipt: aperture.dome_world_receipt || aperture.domeWorldReceipt || null,
      claim_limit: aperture.claim_limit || aperture.claimLimit || 'Current EO-RFD state is interface context with design-signal authority; later runtime promotion requires explicit verification.'
    }),
    dome_world_context: Object.freeze({
      version: 'v0.4.3',
      schema: 'td613.dome-world.receipt-ref/v0.4.3',
      receipt_reference_only: true,
      raw_exact_coordinates_allowed: false,
      training_history_allowed: false,
      sensitive_text_allowed: false
    }),
    route_conscience_hook: eo.route_conscience_hook || eo.routeConscienceHook || 'required',
    provider_contract_hook: bool(eo.provider_contract_hook ?? eo.providerContractHook, true),
    stylometry_drift_hook: bool(eo.stylometry_drift_hook ?? eo.stylometryDriftHook, true),
    refusal_reason_hook: bool(eo.refusal_reason_hook ?? eo.refusalReasonHook, true),
    route_state_label: eo.route_state_label || eo.routeStateLabel || 'provider-ready',
    operator_note: eo.operator_note || eo.operatorNote || 'EO-RFD is at interface_context/design_signal; this phase does not activate runtime firmware.'
  });
}

function privateTextPolicy(input = {}) {
  const policy = input.private_text_policy || input.privateTextPolicy || {};
  return Object.freeze({
    schema_version: 'td613.hush.contract-private-text-policy/v1',
    raw_user_text_exported: bool(policy.raw_user_text_exported ?? policy.rawUserTextExported, false),
    raw_customizer_samples_exported: bool(policy.raw_customizer_samples_exported ?? policy.rawCustomizerSamplesExported, false),
    raw_mask_material_exported: bool(policy.raw_mask_material_exported ?? policy.rawMaskMaterialExported, false),
    redacted_contract_export_allowed: bool(policy.redacted_contract_export_allowed ?? policy.redactedContractExportAllowed, true),
    operator_private_contract_required: bool(policy.operator_private_contract_required ?? policy.operatorPrivateContractRequired, false),
    provider_payload_contains_private_text: bool(policy.provider_payload_contains_private_text ?? policy.providerPayloadContainsPrivateText, false)
  });
}

function refusalPolicy(input = {}) {
  const policy = input.refusal_policy || input.refusalPolicy || {};
  return Object.freeze({
    schema_version: 'td613.hush.refusal-policy/v1',
    must_refuse_if: asArray(policy.must_refuse_if || policy.mustRefuseIf).length ? asArray(policy.must_refuse_if || policy.mustRefuseIf) : DEFAULT_REFUSALS.slice(),
    must_preserve: asArray(policy.must_preserve || policy.mustPreserve).length ? asArray(policy.must_preserve || policy.mustPreserve) : ['claim-limits', 'private-text-policy', 'mask-boundaries', 'retrieval-trigger', 'discourse-mode'],
    refusal_style: policy.refusal_style || policy.refusalStyle || 'brief-with-reason',
    operator_escalation_required: bool(policy.operator_escalation_required ?? policy.operatorEscalationRequired, true)
  });
}

function releaseDiscipline(input = {}, privatePolicy = {}, provider = {}, mask = {}, instruction = {}, options = {}) {
  const explicit = input.release_discipline || input.releaseDiscipline || {};
  const warnings = [];
  let releaseClass = explicit.release_class || explicit.releaseClass || 'provider-ready';
  if (provider.provider_class === 'unknown' || provider.endpoint_class === 'unknown') {
    warnings.push('provider-target-abstract');
    releaseClass = releaseClass === 'provider-ready' ? 'local-contract' : releaseClass;
  }
  if (privatePolicy.provider_payload_contains_private_text || privatePolicy.raw_user_text_exported || privatePolicy.raw_customizer_samples_exported || privatePolicy.raw_mask_material_exported || instruction.raw_prompt_exported) {
    warnings.push('private-text-present');
    releaseClass = releaseClass === 'provider-ready' ? 'operator-review' : releaseClass;
  }
  if (mask.mask_source !== 'no-mask' && (!mask.discourse_mode || !mask.retrieval_trigger)) releaseClass = 'blocked';
  if (options.blocked) releaseClass = 'blocked';
  return Object.freeze({
    schema_version: 'td613.hush.outgoing-contract-release/v1',
    release_class: releaseClass,
    provider_dispatch_allowed: bool(explicit.provider_dispatch_allowed ?? explicit.providerDispatchAllowed, releaseClass === 'provider-ready'),
    operator_next_action: explicit.operator_next_action || explicit.operatorNextAction || (releaseClass === 'provider-ready' ? 'dispatch' : 'repair-contract'),
    warnings: [...new Set([...(asArray(explicit.warnings)), ...warnings])]
  });
}

export function packetHashPreimage(packet = {}) {
  const material = clone(packet || {});
  delete material.packet_hash_sha256;
  if (material.hash_topology) delete material.hash_topology.packet_hash_sha256;
  return material;
}

export async function buildOutgoingContractHashTopology(packetWithoutHash = {}) {
  const topology = {
    schema_version: 'td613.hush.outgoing-contract-hash-topology/v1',
    request_context_hash_sha256: await hashObject(packetWithoutHash.request_context || {}),
    provider_target_hash_sha256: await hashObject(packetWithoutHash.provider_target || {}),
    mask_context_hash_sha256: await hashObject(packetWithoutHash.mask_context || {}),
    instruction_contract_hash_sha256: await hashObject(packetWithoutHash.instruction_contract || {}),
    policy_hash_sha256: await hashObject({ private_text_policy: packetWithoutHash.private_text_policy || {}, refusal_policy: packetWithoutHash.refusal_policy || {}, claim_limits: packetWithoutHash.claim_limits || {}, release_discipline: packetWithoutHash.release_discipline || {} })
  };
  return Object.freeze(topology);
}

export async function buildOutgoingContractPacket(input = {}, options = {}) {
  const created = options.createdAt || input.created_at || input.createdAt || new Date().toISOString();
  const updated = options.updatedAt || input.updated_at || input.updatedAt || created;
  const request = requestContext(input);
  const provider = providerTarget(input);
  const mask = maskContext(input);
  const ref = customizerPacketRef(input);
  const instruction = await instructionContract(input);
  const privatePolicy = privateTextPolicy(input);
  const refusal = refusalPolicy(input);
  const stylometry = stylometryConstraints(input);
  const adversarial = adversarialConstraints(input);
  const eo = eoRfdRouteState(input);
  const release = releaseDiscipline(input, privatePolicy, provider, mask, instruction, options);
  const idSeed = stableStringify({ created: options.stableId ? 'stable' : created, request, provider, mask, instruction });
  const idHash = await sha256Text(idSeed);
  const contractId = input.contract_packet_id || input.contractPacketId || `TD613-HUSH-CONTRACT-${created.slice(0, 10).replace(/-/g, '')}-${idHash.slice(7, 15).toUpperCase()}`;
  const packetBase = {
    schema_version: HUSH_OUTGOING_CONTRACT_SCHEMA,
    packet_version: HUSH_OUTGOING_CONTRACT_VERSION,
    packet_class: HUSH_OUTGOING_CONTRACT_CLASS,
    contract_packet_id: contractId,
    created_at: created,
    updated_at: updated,
    td613_lineage: input.td613_lineage || input.td613Lineage || { derived_from_packet_discipline: 'safe-harbor-phase9.1c', related_hush_layer: 'customizer-packet-v1', binding: 'TD613-Binding:#9B07D8B/SAC[X6ZNK5NO51]' },
    request_context: request,
    provider_target: provider,
    mask_context: mask,
    customizer_packet_ref: ref,
    instruction_contract: instruction,
    stylometry_constraints: stylometry,
    adversarial_constraints: adversarial,
    eo_rfd_route_state: eo,
    private_text_policy: privatePolicy,
    refusal_policy: refusal,
    claim_limits: HUSH_OUTGOING_CONTRACT_CLAIM_LIMITS,
    release_discipline: release
  };
  const topology = await buildOutgoingContractHashTopology(packetBase);
  const withTopology = { ...packetBase, hash_topology: topology };
  const packetHash = await sha256Text(stableStringify(withTopology));
  return Object.freeze({ ...withTopology, hash_topology: Object.freeze({ ...topology, packet_hash_sha256: packetHash }), packet_hash_sha256: packetHash });
}

if (typeof window !== 'undefined') {
  window.TD613_HUSH_OUTGOING_CONTRACT_PACKET = Object.freeze({ HUSH_OUTGOING_CONTRACT_SCHEMA, HUSH_OUTGOING_CONTRACT_VERSION, HUSH_OUTGOING_CONTRACT_CLASS, HUSH_OUTGOING_CONTRACT_CLAIM_LIMITS, isSha256, isContractPacketId, containsShi, packetHashPreimage, buildOutgoingContractHashTopology, buildOutgoingContractPacket });
}
