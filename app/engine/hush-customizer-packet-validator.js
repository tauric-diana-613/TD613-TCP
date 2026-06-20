import {
  HUSH_CUSTOMIZER_PACKET_SCHEMA,
  HUSH_CUSTOMIZER_PACKET_VERSION,
  HUSH_CUSTOMIZER_RELEASE_CLASSES,
  HUSH_CUSTOMIZER_CLAIM_LIMITS
} from './hush-customizer-packet.js';

export const HUSH_CUSTOMIZER_PACKET_VALIDATOR_VERSION = 'hush-customizer-packet-validator/v1-safe-harbor-derived';

const safeText = (value) => String(value ?? '').trim();
const asArray = (value) => Array.isArray(value) ? value : [];

export function isSha256(value) {
  return /^sha256:[a-f0-9]{64}$/iu.test(safeText(value));
}

function getPath(value, path) {
  return String(path || '').split('.').reduce((node, key) => (node && Object.prototype.hasOwnProperty.call(node, key) ? node[key] : undefined), value);
}

function isObject(value) { return Boolean(value && typeof value === 'object' && !Array.isArray(value)); }

export function isCustomizerPacket(value) {
  return Boolean(value && value.schema_version === HUSH_CUSTOMIZER_PACKET_SCHEMA);
}

export function classifyCustomizerPacket(packet = {}) {
  const families = [];
  if (isCustomizerPacket(packet)) families.push('customizer-packet-v1');
  if (packet.customizer_packet_id) families.push('customizer-packet-id');
  if (Array.isArray(packet.sample_ledger) && packet.sample_ledger.length) families.push('sample-ledger');
  if (packet.corpus_readiness && packet.corpus_readiness.status) families.push('corpus-readiness');
  if (packet.routing_profile && packet.routing_profile.schema_version) families.push('routing-profile');
  if (packet.ontology_profile && packet.ontology_profile.schema_version) families.push('ontology-profile');
  if (packet.private_text_policy && packet.private_text_policy.schema_version) families.push('private-text-policy');
  if (packet.customizer_release_discipline && packet.customizer_release_discipline.release_class) families.push('customizer-release-discipline');
  if (packet.hash_topology && packet.hash_topology.schema_version) families.push('hash-topology');
  if (isSha256(packet.packet_hash_sha256)) families.push('packet-hash');
  return [...new Set(families)];
}

function rawSampleLeak(packet = {}) {
  const leaks = [];
  for (const sample of asArray(packet.sample_ledger)) {
    if (sample && (sample.text || sample.raw_text || sample.sample_text)) leaks.push(sample.id || 'unknown-sample');
  }
  return leaks;
}

function validateHashTopology(packet = {}, refusal_reasons = []) {
  const topology = packet.hash_topology || {};
  const hashFields = [
    ['packet_hash_sha256', packet.packet_hash_sha256],
    ['hash_topology.packet_hash_sha256', topology.packet_hash_sha256],
    ['hash_topology.sample_ledger_hash_sha256', topology.sample_ledger_hash_sha256],
    ['hash_topology.profile_hash_sha256', topology.profile_hash_sha256],
    ['hash_topology.routing_hash_sha256', topology.routing_hash_sha256],
    ['hash_topology.policy_hash_sha256', topology.policy_hash_sha256]
  ];
  for (const [label, value] of hashFields) {
    if (!isSha256(value)) refusal_reasons.push(`${label} is not sha256:<64_hex>`);
  }
  if (isSha256(packet.packet_hash_sha256) && isSha256(topology.packet_hash_sha256) && packet.packet_hash_sha256 !== topology.packet_hash_sha256) refusal_reasons.push('packet_hash_sha256 does not match hash_topology.packet_hash_sha256');
}

export function validateCustomizerPacket(packet = {}, options = {}) {
  const refusal_reasons = [];
  const warnings = [];
  const families = classifyCustomizerPacket(packet);

  if (!isObject(packet)) refusal_reasons.push('packet must be an object');
  if (packet.schema_version !== HUSH_CUSTOMIZER_PACKET_SCHEMA) refusal_reasons.push(`schema_version must be ${HUSH_CUSTOMIZER_PACKET_SCHEMA}`);
  if (!safeText(packet.customizer_packet_id)) refusal_reasons.push('customizer_packet_id is required');
  if (!Array.isArray(packet.sample_ledger)) refusal_reasons.push('sample_ledger is required');
  if (Array.isArray(packet.sample_ledger) && !packet.sample_ledger.length) warnings.push('sample_ledger is empty');
  if (!packet.corpus_readiness || !packet.corpus_readiness.status) refusal_reasons.push('corpus_readiness is required');
  if (!packet.private_text_policy || !packet.private_text_policy.schema_version) refusal_reasons.push('private_text_policy is required');
  if (!packet.customizer_release_discipline || !packet.customizer_release_discipline.release_class) refusal_reasons.push('customizer_release_discipline is required');
  if (!packet.hash_topology || !packet.hash_topology.schema_version) refusal_reasons.push('hash_topology is required');

  validateHashTopology(packet, refusal_reasons);

  for (const sample of asArray(packet.sample_ledger)) {
    if (!isSha256(sample?.text_hash)) refusal_reasons.push(`sample ${sample?.id || 'unknown'} text_hash is not sha256:<64_hex>`);
    if (sample?.textIncluded || sample?.text_included) warnings.push(`sample ${sample?.id || 'unknown'} indicates text inclusion`);
    if (!sample?.discourse_mode) refusal_reasons.push(`sample ${sample?.id || 'unknown'} missing discourse_mode`);
    if (!sample?.retrieval_trigger) refusal_reasons.push(`sample ${sample?.id || 'unknown'} missing retrieval_trigger`);
  }

  const releaseClass = getPath(packet, 'customizer_release_discipline.release_class');
  if (releaseClass === HUSH_CUSTOMIZER_RELEASE_CLASSES.BLOCKED && options.allowBlocked !== true) refusal_reasons.push('customizer release discipline blocks packet');

  const leaks = rawSampleLeak(packet);
  const privatePolicy = packet.private_text_policy || {};
  const redactedImport = privatePolicy.sample_text_exported !== true && releaseClass !== HUSH_CUSTOMIZER_RELEASE_CLASSES.OPERATOR_PRIVATE;
  if (redactedImport && leaks.length) refusal_reasons.push(`raw sample text present in redacted packet: ${leaks.join(', ')}`);
  if (privatePolicy.sample_text_exported && options.allowPrivateText !== true) refusal_reasons.push('private sample text export requires explicit operator confirmation');

  const strongFamilies = families.filter((family) => family !== 'packet-hash');
  if (families.includes('packet-hash') && strongFamilies.length <= 1) refusal_reasons.push('hash-only Customizer packet is not enough to restore or import');
  if (!families.includes('sample-ledger') || !families.includes('corpus-readiness') || !families.includes('customizer-release-discipline')) refusal_reasons.push('packet lacks required corpus/profile authority families');

  if (packet.claim_limits && JSON.stringify(packet.claim_limits) !== JSON.stringify(HUSH_CUSTOMIZER_CLAIM_LIMITS)) warnings.push('claim limits differ from Hush Customizer default');

  return Object.freeze({
    schema_version: 'td613.hush.customizer-packet-validation/v1',
    validator_version: HUSH_CUSTOMIZER_PACKET_VALIDATOR_VERSION,
    packet_version: packet.packet_version || HUSH_CUSTOMIZER_PACKET_VERSION,
    status: refusal_reasons.length ? 'blocked' : 'pass',
    authority_families: families,
    release_class: releaseClass || null,
    raw_sample_leaks: leaks,
    warnings: [...new Set(warnings)],
    refusal_reasons: [...new Set(refusal_reasons)]
  });
}

export function buildCustomizerSession(packet = {}, options = {}) {
  const validation = validateCustomizerPacket(packet, options);
  if (validation.status !== 'pass') {
    const error = new Error('Cannot build Hush Customizer session from blocked packet');
    error.validation = validation;
    throw error;
  }
  return Object.freeze({
    schema_version: 'td613.hush.customizer-session/v1',
    restored_at: new Date().toISOString(),
    customizer_packet_id: packet.customizer_packet_id,
    activeMask: {
      id: packet.mask_id,
      label: packet.mask_label,
      name: packet.mask_label,
      source: 'customizer-packet-redacted',
      profileStatus: packet.corpus_readiness?.status || 'unknown',
      corpusReadiness: packet.corpus_readiness,
      samples: packet.sample_ledger.map((sample) => ({ ...sample, text: null, textIncluded: false })),
      compositeProfile: packet.composite_profile || {},
      profile: packet.composite_profile || {},
      surfaceCadence: packet.surface_cadence || {},
      layoutCadence: packet.surface_cadence || {},
      distribution: packet.distribution || {},
      holdoutValidation: packet.holdout_validation || {},
      warnings: packet.customizer_release_discipline?.warnings || []
    },
    release_class: validation.release_class,
    private_text_policy: packet.private_text_policy
  });
}
