import { PUBLIC_DEFAULT_ROOT, buildClaimLimits, findForbiddenPublicStrings, containsZwnjSensitiveFlattening } from './safe-harbor-policy-constants.js';
import { EXPORT_SURFACES, classifyExportSurface, buildExportPayload, verifyExportPayload, buildExportReceipt } from './safe-harbor-export-policy.js';
import { inspectRawTextExposure } from './safe-harbor-raw-text-policy.js';

export const CLIPBOARD_CLASSES = Object.freeze({
  PUBLIC_SAFE: 'public-safe clipboard',
  VERIFICATION_READY: 'verification-ready clipboard',
  OPERATOR_ONLY: 'operator-only clipboard',
  SEALED_PACKET: 'sealed packet clipboard',
  FORENSIC_SCHEMA: 'forensic schema clipboard',
  FOOTER: 'footer clipboard',
  PROBE: 'probe clipboard',
  BLOCKED: 'blocked clipboard'
});

function getPath(value, path) { return String(path || '').split('.').reduce((node, key) => (node && Object.prototype.hasOwnProperty.call(node, key) ? node[key] : undefined), value); }
function releaseClass(packet) { return getPath(packet, 'phase9_release_discipline.release_class') || 'operator-only'; }
function publicDisplay(packet) { return getPath(packet, 'phase8_public_default_gate.public_default_after') || getPath(packet, 'public_default_policy.public_default_mode') || 'v2-only'; }
function clipboardClass(surfaceId, packet) {
  const exportClass = classifyExportSurface(surfaceId, packet);
  if (exportClass === 'blocked') return CLIPBOARD_CLASSES.BLOCKED;
  if (surfaceId === EXPORT_SURFACES.CANONICAL_FOOTER_COPY) return CLIPBOARD_CLASSES.FOOTER;
  if (surfaceId === EXPORT_SURFACES.PROBE_OUTPUT_COPY) return CLIPBOARD_CLASSES.PROBE;
  if (surfaceId === EXPORT_SURFACES.FORENSIC_SCHEMA_COPY) return CLIPBOARD_CLASSES.FORENSIC_SCHEMA;
  if (surfaceId === EXPORT_SURFACES.PACKET_PREVIEW_COPY) return CLIPBOARD_CLASSES.SEALED_PACKET;
  if (exportClass === 'public-readable') return CLIPBOARD_CLASSES.PUBLIC_SAFE;
  if (exportClass === 'verification-ready') return CLIPBOARD_CLASSES.VERIFICATION_READY;
  return CLIPBOARD_CLASSES.OPERATOR_ONLY;
}

export function buildClipboardHeader(surfaceId, packet) {
  const cls = clipboardClass(surfaceId, packet);
  if (cls === CLIPBOARD_CLASSES.BLOCKED) return ['TD613 Safe Harbor Clipboard Export Refused', 'Reason: release discipline, public gate, or raw-text policy blocks this copy.', 'Raw text exported: false'].join('\n');
  return [
    'TD613 Safe Harbor Clipboard Export',
    `Class: ${cls}`,
    `Public root: ${PUBLIC_DEFAULT_ROOT}`,
    `Public display: ${publicDisplay(packet)}`,
    `Release class: ${releaseClass(packet)}`,
    'Claim limit: custody/replay instrument; not civil identity, legal identity, public law approval, or authorship ownership.',
    'Raw text exported: false'
  ].join('\n');
}

export function buildClipboardPayload(surfaceId, packet, options = {}) {
  const payload = buildExportPayload(surfaceId, packet, options);
  const header = buildClipboardHeader(surfaceId, packet);
  const body = typeof payload === 'string' ? payload : JSON.stringify(payload, null, 2);
  return `${header}\n\n${body}\n`;
}

export function verifyClipboardPayload(surfaceId, clipboardText, packet) {
  const refusal_reasons = [];
  const hits = findForbiddenPublicStrings(clipboardText);
  const flattened = containsZwnjSensitiveFlattening(clipboardText);
  const raw = inspectRawTextExposure({ clipboardText });
  if (!String(clipboardText || '').includes('TD613 Safe Harbor Clipboard Export')) refusal_reasons.push('clipboard class header missing');
  if (!String(clipboardText || '').includes(`Public root: ${PUBLIC_DEFAULT_ROOT}`)) refusal_reasons.push('public root header missing');
  if (!String(clipboardText || '').includes('Claim limit:')) refusal_reasons.push('claim limit header missing');
  if (hits.length) refusal_reasons.push(...hits.map((hit) => `forbidden public string: ${hit}`));
  if (flattened.length) refusal_reasons.push(...flattened.map((hit) => `ZWNJ-sensitive term flattened: ${hit}`));
  if (raw.status === 'fail') refusal_reasons.push(...raw.refusal_reasons);
  const exportCheck = verifyExportPayload(surfaceId, buildExportPayload(surfaceId, packet), packet);
  if (exportCheck.status === 'blocked') refusal_reasons.push(...exportCheck.refusal_reasons);
  return Object.freeze({ schema_version: 'td613.safe-harbor.clipboard-verification/v1', status: refusal_reasons.length ? 'blocked' : 'pass', surface_id: surfaceId, clipboard_class: clipboardClass(surfaceId, packet), refusal_reasons: [...new Set(refusal_reasons)] });
}

export function buildClipboardReceipt(surfaceId, packet, clipboardText) {
  const exportReceipt = buildExportReceipt(surfaceId, packet, clipboardText, { clipboard: true });
  return Object.freeze({ ...exportReceipt, schema_version: 'td613.safe-harbor.clipboard-receipt/v1', clipboard_class: clipboardClass(surfaceId, packet), claim_limits: buildClaimLimits() });
}

if (typeof window !== 'undefined') window.TD613_SAFE_HARBOR_CLIPBOARD_POLICY = Object.freeze({ CLIPBOARD_CLASSES, buildClipboardHeader, buildClipboardPayload, verifyClipboardPayload, buildClipboardReceipt });
