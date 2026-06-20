import { PUBLIC_DEFAULT_ROOT, RELEASE_CLASSES, buildClaimLimits } from './safe-harbor-policy-constants.js';
import { inspectRawTextExposure, releaseFacingArtifactsFromPacket } from './safe-harbor-raw-text-policy.js';

export const REOPEN_VALIDATOR_VERSION = 'safe-harbor-reopen-validator/v1-phase9-1c';
export const LEGACY_HANDSHAKE_PREFIX = 'TD613-SH-SEAL-HANDSHAKE/v1:';

function clone(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }
function normalizeShiNumber(value) { return String(value || '').trim().toUpperCase(); }
function nowIso() { return new Date().toISOString(); }
function getPath(value, path) { return String(path || '').split('.').reduce((node, key) => (node && Object.prototype.hasOwnProperty.call(node, key) ? node[key] : undefined), value); }
function isObject(value) { return Boolean(value && typeof value === 'object' && !Array.isArray(value)); }

export function isShiNumber(value, bindingFragment = '9B07D8B') {
  const normalized = normalizeShiNumber(value);
  const fragment = String(bindingFragment || '9B07D8B').replace(/^#/, '').toUpperCase();
  return new RegExp('^TD613-SH-' + fragment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '-[A-F0-9]{8}$', 'u').test(normalized);
}

export function parseReopenJson(input) {
  if (typeof input !== 'string') return isObject(input) ? input : null;
  const trimmed = input.trim();
  if (!trimmed) return null;
  return JSON.parse(trimmed);
}

export function unwrapSafeHarborPacket(parsed) {
  const root = parsed && typeof parsed === 'object' ? parsed : null;
  if (!root) return { packet: null, wrapper: null, source: 'invalid' };
  if (root.issuance && root.issuance.badge_number) return { packet: root, wrapper: null, source: 'root-packet' };
  if (root.packet && root.packet.issuance && root.packet.issuance.badge_number) return { packet: root.packet, wrapper: root, source: 'packet-wrapper' };
  if (root.safe_harbor && root.safe_harbor.staged_snapshot && root.safe_harbor.staged_snapshot.issuance && root.safe_harbor.staged_snapshot.issuance.badge_number) {
    return { packet: root.safe_harbor.staged_snapshot, wrapper: root, source: 'safe-harbor-staged-snapshot' };
  }
  if (root.safe_harbor && root.safe_harbor.issuance && root.safe_harbor.issuance.badge_number) {
    return { packet: Object.assign({}, root, root.safe_harbor), wrapper: root, source: 'safe-harbor-merged-wrapper' };
  }
  return { packet: root, wrapper: null, source: 'unwrapped-fallback' };
}

function legacyHandshakeFrom(parsed, packet) {
  return String((parsed && parsed.seal_handshake) || (packet && packet.seal_handshake) || '');
}

export function classifyReopenPacket(parsed, packet) {
  const families = [];
  const handshake = legacyHandshakeFrom(parsed, packet);
  if (handshake.indexOf(LEGACY_HANDSHAKE_PREFIX) === 0) families.push('legacy-v1-sealed');
  if (getPath(packet, 'native_spine_purification.status')) families.push('phase6-native-spine');
  if (getPath(packet, 'hash_topology.final_packet_hash_sha256') || getPath(packet, 'packet_hash_sha256')) families.push('hash-bearing-packet');
  if (getPath(packet, 'phase8_public_default_gate.status')) families.push('phase8-public-gate');
  if (getPath(packet, 'phase9_release_discipline.release_class')) families.push('phase9-release-discipline');
  if (getPath(packet, 'pipeline_state.pipeline_version')) families.push('phase9-1-pipeline-state');
  if (getPath(packet, 'signature.status') === 'sealed' || getPath(packet, 'bridge.covenant_gate.confirmed')) families.push('sealed-or-covenant-confirmed');
  return [...new Set(families)];
}

function extractSegments(packet) {
  const ingress = packet && packet.ingress && typeof packet.ingress === 'object' ? packet.ingress : {};
  const out = { future_self: '', past_self: '', higher_self: '' };
  for (const key of Object.keys(out)) {
    const value = ingress[key];
    out[key] = typeof value === 'string' ? value : (value && typeof value.raw_text === 'string' ? value.raw_text : '');
  }
  return out;
}

export function validateReopenPacket(input, options = {}) {
  const bindingFragment = options.bindingFragment || '9B07D8B';
  const refusal_reasons = [];
  const warnings = [];
  let parsed = null;
  try {
    parsed = parseReopenJson(input && Object.prototype.hasOwnProperty.call(input, 'text') ? input.text : input);
  } catch (error) {
    return Object.freeze({ schema_version: 'td613.safe-harbor.reopen-validation/v1', status: 'blocked', validator_version: REOPEN_VALIDATOR_VERSION, refusal_reasons: ['uploaded packet JSON is malformed'], error: String(error && error.message ? error.message : error) });
  }
  const token = normalizeShiNumber(input && input.shi ? input.shi : options.shi);
  if (!token) refusal_reasons.push('SHI # is required');
  else if (!isShiNumber(token, bindingFragment)) refusal_reasons.push('SHI # format does not match TD613-SH-<binding>-<8_hex>');

  const unwrapped = unwrapSafeHarborPacket(parsed);
  const packet = unwrapped.packet;
  if (!packet || !isObject(packet)) refusal_reasons.push('uploaded JSON does not contain a Safe Harbor packet object');
  const packetShi = normalizeShiNumber(getPath(packet, 'issuance.badge_number'));
  if (!packetShi) refusal_reasons.push('packet is missing issuance.badge_number');
  else if (token && packetShi !== token) refusal_reasons.push('SHI # does not match packet issuance.badge_number');

  const families = packet ? classifyReopenPacket(parsed, packet) : [];
  if (!families.length) refusal_reasons.push('packet lacks legacy seal marker or current Safe Harbor authority surfaces');

  const phase5 = getPath(packet, 'phase5_replay_hardening.status');
  if (phase5 === 'fail' || phase5 === 'quarantine') refusal_reasons.push('Phase 5 blocks reopen: ' + phase5);
  const phase8 = getPath(packet, 'phase8_public_default_gate.status');
  if (phase8 === 'blocked' && options.allowBlockedPublicGate !== true) refusal_reasons.push('Phase 8 public gate blocks public reopen');
  const releaseClass = getPath(packet, 'phase9_release_discipline.release_class');
  if (releaseClass === RELEASE_CLASSES.BLOCKED && options.allowBlockedRelease !== true) refusal_reasons.push('Phase 9 release discipline blocks public reopen');
  const raw = inspectRawTextExposure(releaseFacingArtifactsFromPacket(packet || {}));
  if (raw.status === 'fail') refusal_reasons.push(...raw.refusal_reasons);

  if (families.includes('legacy-v1-sealed') && !families.some((f) => f.indexOf('phase') === 0 || f === 'hash-bearing-packet')) warnings.push('legacy v1 seal marker accepted as compatibility path; current pipeline should refresh Phase 8/9 surfaces after reopen');
  if (!getPath(packet, 'phase8_public_default_gate.status')) warnings.push('Phase 8 gate missing; current pipeline should refresh after reopen');
  if (!getPath(packet, 'phase9_release_discipline.release_class')) warnings.push('Phase 9 release discipline missing; current pipeline should refresh after reopen');

  const status = refusal_reasons.length ? 'blocked' : 'pass';
  return Object.freeze({
    schema_version: 'td613.safe-harbor.reopen-validation/v1',
    validator_version: REOPEN_VALIDATOR_VERSION,
    status,
    typed_shi: token,
    packet_shi: packetShi || null,
    packet,
    wrapper_source: unwrapped.source,
    authority_families: families,
    public_root: PUBLIC_DEFAULT_ROOT,
    claim_limits: buildClaimLimits(),
    raw_text_exported: false,
    warnings: [...new Set(warnings)],
    refusal_reasons: [...new Set(refusal_reasons)]
  });
}

export function buildReopenSession(validation, existing = {}) {
  if (!validation || validation.status !== 'pass') throw new Error('Cannot build reopen session from blocked validation');
  const packet = clone(validation.packet);
  const openedAt = getPath(packet, 'created_at') || getPath(packet, 'receipt.minted_at') || nowIso();
  const receiptId = getPath(packet, 'receipt.receipt_id') || null;
  const packetId = getPath(packet, 'packet_id') || null;
  const badgeNumber = getPath(packet, 'issuance.badge_number') || validation.typed_shi;
  return Object.freeze({
    helper: existing.helper || null,
    hooks: existing.hooks || { tcp: null, eo: null, signature: null },
    packet,
    sealed: null,
    lastProbe: existing.lastProbe || '',
    audit: [
      { ts_utc: nowIso(), type: 'shi-recall-reopened-current-validator', detail: { shi_number: validation.typed_shi, packet_id: packetId, authority_families: validation.authority_families, validator_version: REOPEN_VALIDATOR_VERSION } },
      ...Array.isArray(existing.audit) ? existing.audit.slice(0, 23) : []
    ],
    renderer: existing.renderer || { detected: false, meta: null },
    ingress: {
      segments: extractSegments(packet),
      stepIndex: 0,
      vaultOpen: true,
      operatorShellOpen: false,
      openedAt,
      receiptId,
      packetId,
      bypass: false,
      recovered: true,
      reopen_validator: { version: REOPEN_VALIDATOR_VERSION, authority_families: validation.authority_families, public_root: PUBLIC_DEFAULT_ROOT }
    },
    covenant: {
      confirmed: Boolean(getPath(packet, 'bridge.covenant_gate.confirmed')) || Boolean(badgeNumber),
      confirmedAt: getPath(packet, 'bridge.covenant_gate.confirmed_at') || null,
      badgeNumber
    },
    operatorSignature: existing.operatorSignature || null,
    selectedBatchId: existing.selectedBatchId || null,
    dynamicLaneInjected: Boolean(existing.dynamicLaneInjected),
    forms: existing.forms || { footerMode: 'legacy-compat', payloadIndex: '', attestationDate: '', operatorId: 'safe-harbor.operator', sourceClass: 'reopened safe harbor packet', witnessChannel: 'reopen validator', operatorNotes: 'Reopened through SHI + packet validator.' }
  });
}

if (typeof window !== 'undefined') {
  window.TD613_SAFE_HARBOR_REOPEN_VALIDATOR = Object.freeze({
    REOPEN_VALIDATOR_VERSION,
    LEGACY_HANDSHAKE_PREFIX,
    normalizeShiNumber,
    isShiNumber,
    parseReopenJson,
    unwrapSafeHarborPacket,
    classifyReopenPacket,
    validateReopenPacket,
    buildReopenSession
  });
  window.dispatchEvent(new CustomEvent('td613:safe-harbor:reopen-validator-ready', { detail: { version: REOPEN_VALIDATOR_VERSION } }));
}
