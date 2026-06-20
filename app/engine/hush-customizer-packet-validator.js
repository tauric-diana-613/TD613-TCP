import {
  HUSH_CUSTOMIZER_PACKET_SCHEMA,
  HUSH_CUSTOMIZER_PACKET_VERSION,
  HUSH_CUSTOMIZER_PACKET_CLASS,
  HUSH_CUSTOMIZER_CLAIM_LIMITS,
  isSha256
} from './hush-customizer-packet.js';

const allowedReleaseClasses = Object.freeze([
  'empty',
  'corpus-building',
  'preview-only',
  'operational-local',
  'rigorous-local',
  'exportable-redacted',
  'operator-private',
  'blocked'
]);

function isObject(value) { return Boolean(value && typeof value === 'object' && !Array.isArray(value)); }
function getPath(value, path) { return String(path || '').split('.').reduce((node, key) => (node && Object.prototype.hasOwnProperty.call(node, key) ? node[key] : undefined), value); }
function asArray(value) { return Array.isArray(value) ? value : []; }

export function isCustomizerPacket(value) {
  return Boolean(value && value.schema_version === HUSH_CUSTOMIZER_PACKET_SCHEMA && value.packet_class === HUSH_CUSTOMIZER_PACKET_CLASS);
}

export function classifyCustomizerPacket(packet = {}) {
  const families = [];
  if (isCustomizerPacket(packet)) families.push('customizer-packet-v1');
  if (isSha256(packet.packet_hash_sha256)) families.push('packet-hash-bearing');
  if (isSha256(getPath(packet, 'sample_hash_topology.sample_ledger_hash_sha256'))) families.push('sample-ledger-hash-bearing');
  if (packet.corpus_readiness && packet.sample_ledger) families.push('corpus-readiness-bearing');
  if (packet.composite_profile || packet.surface_cadence || packet.distribution) families.push('profile-bearing');
  if (packet.routing_profile) families.push('routing-bearing');
  if (packet.private_text_policy) families.push('private-text-policy-bearing');
  if (packet.customizer_release_discipline) families.push('release-discipline-bearing');
  return [...new Set(families)];
}

function inspectSampleLedger(packet = {}, options = {}) {
  const refusal_reasons = [];
  const warnings = [];
  const ledger = asArray(packet.sample_ledger);
  if (!ledger.length) warnings.push('sample-ledger-empty');
  ledger.forEach((sample, index) => {
    if (!isObject(sample)) {
      refusal_reasons.push(`sample_ledger[${index}] is not an object`);
      return;
    }
    if (!sample.id) refusal_reasons.push(`sample_ledger[${index}] missing id`);
    if (!isSha256(sample.text_hash_sha256)) refusal_reasons.push(`sample_ledger[${index}] text_hash_sha256 is not sha256:<64_hex>`);
    if (!sample.discourse_mode) refusal_reasons.push(`sample_ledger[${index}] missing discourse_mode`);
    if (!sample.retrieval_trigger) refusal_reasons.push(`sample_ledger[${index}] missing retrieval_trigger`);
    if (sample.raw_text_exported && options.allowPrivateText !== true) refusal_reasons.push(`sample_ledger[${index}] raw text appears in redacted path`);
    if (sample.text && options.allowPrivateText !== true) refusal_reasons.push(`sample_ledger[${index}] text is present in redacted path`);
  });
  return { refusal_reasons, warnings };
}

function inspectHashes(packet = {}) {
  const refusal_reasons = [];
  const hashTopology = packet.sample_hash_topology || {};
  if (!isSha256(packet.packet_hash_sha256)) refusal_reasons.push('packet_hash_sha256 is not sha256:<64_hex>');
  ['sample_ledger_hash_sha256', 'profile_hash_sha256', 'routing_hash_sha256', 'policy_hash_sha256', 'packet_hash_sha256'].forEach((key) => {
    if (hashTopology[key] && !isSha256(hashTopology[key])) refusal_reasons.push(`sample_hash_topology.${key} is not sha256:<64_hex>`);
  });
  return refusal_reasons;
}

export function validateCustomizerPacket(packet = {}, options = {}) {
  const refusal_reasons = [];
  const warnings = [];
  if (!isObject(packet)) refusal_reasons.push('packet is not an object');
  if (packet.schema_version !== HUSH_CUSTOMIZER_PACKET_SCHEMA) refusal_reasons.push(`schema_version must be ${HUSH_CUSTOMIZER_PACKET_SCHEMA}`);
  if (packet.packet_version !== HUSH_CUSTOMIZER_PACKET_VERSION) warnings.push('packet_version differs from current Customizer packet version');
  if (packet.packet_class !== HUSH_CUSTOMIZER_PACKET_CLASS) refusal_reasons.push(`packet_class must be ${HUSH_CUSTOMIZER_PACKET_CLASS}`);
  if (!packet.customizer_packet_id) refusal_reasons.push('customizer_packet_id is required');
  if (/TD613-SH-/i.test(String(packet.customizer_packet_id || ''))) refusal_reasons.push('Customizer packet must not use SHI as mask identifier');
  refusal_reasons.push(...inspectHashes(packet));
  const families = classifyCustomizerPacket(packet);
  if (families.includes('packet-hash-bearing') && families.length === 1) refusal_reasons.push('hash-only Customizer packet is not enough to import or restore');
  const ledger = inspectSampleLedger(packet, options);
  refusal_reasons.push(...ledger.refusal_reasons);
  warnings.push(...ledger.warnings);
  if (!packet.corpus_readiness) refusal_reasons.push('corpus_readiness is required');
  if (!packet.private_text_policy) refusal_reasons.push('private_text_policy is required');
  if (!packet.customizer_release_discipline) refusal_reasons.push('customizer_release_discipline is required');
  const releaseClass = getPath(packet, 'customizer_release_discipline.release_class');
  if (!allowedReleaseClasses.includes(releaseClass)) refusal_reasons.push('customizer_release_discipline.release_class is invalid');
  if (releaseClass === 'blocked' && options.allowBlocked !== true) refusal_reasons.push('blocked Customizer packet cannot be imported through normal restore');
  const sampleTextExported = Boolean(getPath(packet, 'private_text_policy.sample_text_exported'));
  if (sampleTextExported && options.allowPrivateText !== true) refusal_reasons.push('redacted import cannot contain exported sample text');
  if (!packet.routing_profile) warnings.push('routing_profile missing; legacy packet should be migrated before use');
  if (packet.routing_profile) {
    const modes = Object.keys(packet.routing_profile.discourse_modes || {});
    const triggers = Object.keys(packet.routing_profile.retrieval_triggers || {});
    if (modes.length && !triggers.length) refusal_reasons.push('retrieval triggers collapsed or missing');
    if (triggers.length && !modes.length) refusal_reasons.push('discourse modes collapsed or missing');
  }
  return Object.freeze({
    schema_version: 'td613.hush.customizer-packet-validation/v1',
    status: refusal_reasons.length ? 'blocked' : 'pass',
    packet_schema: HUSH_CUSTOMIZER_PACKET_SCHEMA,
    customizer_packet_id: packet.customizer_packet_id || null,
    release_class: releaseClass || 'unknown',
    authority_families: families,
    claim_limits: HUSH_CUSTOMIZER_CLAIM_LIMITS,
    refusal_reasons: [...new Set(refusal_reasons)],
    warnings: [...new Set(warnings)]
  });
}

export function buildCustomizerRestoreSession(packet = {}, options = {}) {
  const validation = validateCustomizerPacket(packet, options);
  if (validation.status !== 'pass') {
    const error = new Error('Cannot restore blocked Hush Customizer packet');
    error.validation = validation;
    throw error;
  }
  return Object.freeze({
    schema_version: 'td613.hush.customizer-restore-session/v1',
    customizer_packet_id: packet.customizer_packet_id,
    restored_at: new Date().toISOString(),
    activeMask: {
      id: packet.mask_id,
      label: packet.mask_label,
      source: 'customizer-packet-restore',
      samples: packet.sample_ledger,
      sampleCount: packet.sample_ledger.length,
      acceptedSampleCount: packet.corpus_readiness.acceptedSampleCount || 0,
      acceptedWords: packet.corpus_readiness.acceptedWords || 0,
      profileStatus: packet.corpus_readiness.status,
      corpusReadiness: packet.corpus_readiness,
      compositeProfile: packet.composite_profile,
      profile: packet.composite_profile,
      surfaceCadence: packet.surface_cadence,
      layoutCadence: packet.surface_cadence,
      distribution: packet.distribution,
      profileTargets: packet.distribution,
      holdoutValidation: packet.holdout_validation,
      promptCategorySummary: packet.routing_profile.discourse_modes || {},
      warnings: [
        'restored-from-customizer-packet',
        ...asArray(getPath(packet, 'customizer_release_discipline.warnings'))
      ]
    },
    validation
  });
}

if (typeof window !== 'undefined') {
  window.TD613_HUSH_CUSTOMIZER_PACKET_VALIDATOR = Object.freeze({ isSha256, isCustomizerPacket, classifyCustomizerPacket, validateCustomizerPacket, buildCustomizerRestoreSession });
}
