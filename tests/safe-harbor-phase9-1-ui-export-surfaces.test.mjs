import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { buildClaimLimits } from '../app/safe-harbor/app/safe-harbor-policy-constants.js';
import { EXPORT_SURFACES, classifyExportSurface, buildExportPayload, verifyExportPayload, buildExportReceipt } from '../app/safe-harbor/app/safe-harbor-export-policy.js';
import { buildClipboardPayload, verifyClipboardPayload } from '../app/safe-harbor/app/safe-harbor-clipboard-policy.js';
import { packetExportReadyAfterPipeline } from '../app/safe-harbor/app/safe-harbor-packet-pipeline.js';
import { SAFE_HARBOR_SURFACES, COPY_EXPORT_CONTROL_MAP, getSurfaceByControl } from '../app/safe-harbor/app/safe-harbor-surface-registry.js';

const packet = {
  packet_hash_sha256: 'sha256:' + 'a'.repeat(64),
  bridge: { export_gate: { ready: true } },
  public_default_policy: { default_public_credential: 'v2', public_default_mode: 'v2-only' },
  phase5_replay_hardening: { status: 'pass' },
  phase8_public_default_gate: { status: 'review', public_default_after: 'v2-only' },
  phase9_release_discipline: { release_class: 'verification-ready', claim_limits: buildClaimLimits(), public_summary: 'This packet is verification-ready under the v2 public root. It is a custody and replay artifact.' },
  phase9_release_receipt: { claim_limits_attached: true, raw_text_exported: false },
  renderer_authority_metadata: { public_default_credential: 'v2', raw_text_included: false },
  svg_authority_metadata: { 'data-td613-public-default': 'v2', 'data-td613-raw-text-included': 'false' }
};

assert.equal(classifyExportSurface(EXPORT_SURFACES.PACKET_JSON, packet), 'verification-ready');
assert.equal(classifyExportSurface(EXPORT_SURFACES.PUBLIC_SUMMARY_COPY, packet), 'verification-ready');
assert.equal(packetExportReadyAfterPipeline(packet), true);

for (const missingStage of ['phase5_replay_hardening', 'phase8_public_default_gate', 'phase9_release_discipline']) {
  const incomplete = JSON.parse(JSON.stringify(packet));
  delete incomplete[missingStage];
  assert.equal(packetExportReadyAfterPipeline(incomplete), false, `${missingStage} must fail closed`);
}

const summaryPayload = buildExportPayload(EXPORT_SURFACES.PUBLIC_SUMMARY_COPY, packet);
assert.equal(summaryPayload.public_root, 'v2');
assert.equal(summaryPayload.raw_text_exported, false);
assert.equal(verifyExportPayload(EXPORT_SURFACES.PUBLIC_SUMMARY_COPY, summaryPayload, packet).status, 'pass');

const receipt = buildExportReceipt(EXPORT_SURFACES.PACKET_JSON, packet, packet);
assert.equal(receipt.public_default, 'v2');
assert.equal(receipt.aperture_context.apertureVersion, 'v3.1-alpha');
assert.equal(receipt.aperture_context.apertureSchema, 'td613-aperture/v3.1-alpha');
assert.equal(receipt.raw_text_exported, false);
assert.equal(receipt.claim_limits_attached, true);

const clipboard = buildClipboardPayload(EXPORT_SURFACES.PUBLIC_SUMMARY_COPY, packet);
assert.ok(clipboard.includes('TD613 Safe Harbor Clipboard Export'));
assert.ok(clipboard.includes('Public root: v2'));
assert.ok(clipboard.includes('Claim limit:'));
assert.equal(verifyClipboardPayload(EXPORT_SURFACES.PUBLIC_SUMMARY_COPY, clipboard, packet).status, 'pass');

const blockedPacket = JSON.parse(JSON.stringify(packet));
blockedPacket.phase9_release_discipline.release_class = 'blocked';
const blockedPayload = buildExportPayload(EXPORT_SURFACES.PACKET_JSON, blockedPacket);
assert.equal(blockedPayload.status, 'blocked');

for (const control of ['exportPacketPreview', 'copyPacketPreview', 'copyForensicSchemaPreview', 'openPacketTxtPreview', 'copyProbeOutput', 'copyCanonicalFooter']) {
  assert.ok(COPY_EXPORT_CONTROL_MAP[control], `${control} should map to an export surface`);
  assert.ok(getSurfaceByControl(control), `${control} should belong to a registered surface`);
}
assert.ok(SAFE_HARBOR_SURFACES.packetVault.claimLimit);
assert.equal(SAFE_HARBOR_SURFACES.packetVault.copyPolicy, 'release-gated');

const verifyPolicy = readFileSync(new URL('../docs/safe-harbor/verify-room-policy.md', import.meta.url), 'utf8');
const capsulePolicy = readFileSync(new URL('../docs/safe-harbor/offline-capsule-policy.md', import.meta.url), 'utf8');
const eoNote = readFileSync(new URL('../docs/safe-harbor/eo-rfd-glossary-note.md', import.meta.url), 'utf8');
assert.ok(verifyPolicy.includes('Phase 9 release class'));
assert.ok(capsulePolicy.includes('release class'));
assert.ok(eoNote.includes('EO-RFD route conscience'));
assert.ok(eoNote.includes('interface_context'));
assert.ok(eoNote.includes('design_signal'));

console.log('safe-harbor-phase9-1-ui-export-surfaces: ok');
