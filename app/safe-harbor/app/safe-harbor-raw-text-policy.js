import {
  RAW_TEXT_FIELD_KEYS,
  RAW_TEXT_PHRASE_GUARDS
} from './safe-harbor-policy-constants.js';

const PUBLIC_ARTIFACT_FIELD_ALLOWLIST = Object.freeze([
  'schema_version',
  'status',
  'release_class',
  'operator_next_action',
  'public_summary',
  'summary',
  'claim_limit',
  'claim_limits',
  'reason',
  'release_notes',
  'refusal_reasons',
  'failure_modes',
  'raw_text_exported',
  'raw_text_included',
  'public_default',
  'public_display_mode',
  'packet_hash_sha256',
  'hash_topology_final'
]);

export const RELEASE_FACING_ARTIFACT_KEYS = Object.freeze([
  'step1_countersignature',
  'countersignatory_intake',
  'renderer_authority_metadata',
  'svg_authority_metadata',
  'signature_overlay_authority',
  'tcp_hook_authority',
  'eo_hook_authority',
  'outside_witness_receipt',
  'phase8_public_default_gate',
  'phase8_receipt_policy',
  'phase9_release_discipline',
  'release_checklist',
  'phase9_release_receipt',
  'operator_receipt'
]);

export { PUBLIC_ARTIFACT_FIELD_ALLOWLIST };

function isObject(value) { return value && typeof value === 'object'; }
function pathJoin(base, key) { return base ? `${base}.${key}` : String(key); }

function visit(value, visitor, path = '') {
  if (Array.isArray(value)) {
    value.forEach((item, index) => visit(item, visitor, `${path}[${index}]`));
    return;
  }
  if (isObject(value)) {
    for (const [key, child] of Object.entries(value)) {
      const nextPath = pathJoin(path, key);
      visitor(key, child, nextPath);
      visit(child, visitor, nextPath);
    }
  }
}

export function containsRawTextKey(value) {
  const hits = [];
  visit(value, (key, child, path) => {
    if (RAW_TEXT_FIELD_KEYS.includes(key) || key === 'raw_text') hits.push({ path, key, sample: typeof child === 'string' ? child.slice(0, 80) : null });
  });
  return hits;
}

export function containsKnownRawLanePhrase(value) {
  const body = JSON.stringify(value || {});
  return RAW_TEXT_PHRASE_GUARDS.filter((phrase) => body.includes(phrase));
}

export function inspectRawTextExposure(value, options = {}) {
  const keyHits = containsRawTextKey(value);
  const phraseHits = containsKnownRawLanePhrase(value);
  const oversized = [];
  const maxPublicStringLength = options.maxPublicStringLength || 2600;
  if (options.inspectOversizedText !== false) {
    visit(value, (key, child, path) => {
      if (typeof child !== 'string') return;
      if (PUBLIC_ARTIFACT_FIELD_ALLOWLIST.includes(key)) return;
      if (child.length > maxPublicStringLength) oversized.push({ path, length: child.length });
    });
  }
  const refusal_reasons = [];
  if (keyHits.length) refusal_reasons.push('raw_text key appeared in release-facing artifact');
  if (phraseHits.length) refusal_reasons.push('known raw lane phrase appeared in release-facing artifact');
  if (oversized.length && options.blockOversizedText) refusal_reasons.push('oversized public text appeared outside allowlist');
  const status = refusal_reasons.length ? 'fail' : oversized.length ? 'review' : 'pass';
  return Object.freeze({
    schema_version: 'td613.safe-harbor.raw-text-exposure/v1',
    status,
    raw_text_key_paths: keyHits,
    phrase_guard_hits: phraseHits,
    oversized_public_text_paths: oversized,
    refusal_reasons: [...new Set(refusal_reasons)]
  });
}

export function assertPublicArtifactHasNoRawText(value, label = 'public artifact') {
  const inspection = inspectRawTextExposure(value);
  if (inspection.status === 'fail') {
    const error = new Error(`${label} contains release-facing raw text exposure`);
    error.inspection = inspection;
    throw error;
  }
  return inspection;
}

export function releaseFacingArtifactsFromPacket(packet) {
  const out = {};
  for (const key of RELEASE_FACING_ARTIFACT_KEYS) if (packet && Object.prototype.hasOwnProperty.call(packet, key)) out[key] = packet[key];
  return Object.freeze(out);
}

if (typeof window !== 'undefined') {
  window.TD613_SAFE_HARBOR_RAW_TEXT_POLICY = Object.freeze({
    PUBLIC_ARTIFACT_FIELD_ALLOWLIST,
    RELEASE_FACING_ARTIFACT_KEYS,
    containsRawTextKey,
    containsKnownRawLanePhrase,
    inspectRawTextExposure,
    assertPublicArtifactHasNoRawText,
    releaseFacingArtifactsFromPacket
  });
}
