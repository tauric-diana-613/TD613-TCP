#!/usr/bin/env node
import assert from 'node:assert/strict';
import path from 'node:path';
import {
  APERTURE_DIR,
  APERTURE_INDEX_PATH,
  APERTURE_RELEASE_PATH,
  APERTURE_TOOL_PATH,
  ASSET_VERSIONS_PATH,
  readHtmlArtifact,
  readText
} from './lib/aperture-sync-lane.mjs';
import { composeShareableApertureHtml } from './lib/aperture-pedagogue-package.mjs';

const tool = await readHtmlArtifact(APERTURE_TOOL_PATH);
const index = await readHtmlArtifact(APERTURE_INDEX_PATH);
const assetVersions = await readText(ASSET_VERSIONS_PATH);
const release = JSON.parse(await readText(APERTURE_RELEASE_PATH));
const bootstrap = await readText(path.join(APERTURE_DIR, 'bootstrap.js'));
const pedagogueSurface = await readText(path.join(APERTURE_DIR, 'pedagogue-surface.js'));
const counterToolDiscovery = JSON.parse(await readText(path.join(APERTURE_DIR, 'counter-tool-discovery.json')));

const indexVersion = index.metadata.version;
const iframeToken = index.metadata.cacheToken;
const assetToken = assetVersions.match(/\baperture:\s*['"]([^'"]+)['"]/)?.[1] || null;

assert.ok(tool.metadata.version, 'app/aperture/tool.html has no detected Aperture version');
assert.equal(indexVersion, tool.metadata.version, 'app/aperture/index.html aperture-version does not match tool.html');
assert.ok(iframeToken, 'app/aperture/index.html iframe cache token missing');
assert.equal(assetToken, iframeToken, 'app/asset-versions.js aperture token does not match index iframe token');
assert.equal(release.version, tool.metadata.version, 'app/aperture/release.json version does not match tool.html');
assert.equal(release.apertureSchema, tool.metadata.schema, 'app/aperture/release.json schema does not match tool.html');
assert.equal(release.featureVersion, tool.metadata.featureVersion, 'app/aperture/release.json feature version does not match tool.html');
assert.equal(release.domeBridgeSchema, `td613.aperture.reciprocal-receipt-bridge/${tool.metadata.version}`, 'reciprocal receipt bridge schema drifted');
const compatibilityReceiptVersion = release.compatibility?.phase4ReceiptSchemaVersion || tool.metadata.version;
assert.equal(release.domeDiagnosticReceiptSchema, `td613.aperture.diagnostic-receipt/${compatibilityReceiptVersion}`, 'diagnostic receipt schema drifted');
assert.equal(release.flowCoreContextReceiptSchema, 'td613.flowcore.context-receipt/v0.1', 'Flow-Core context receipt schema drifted');
assert.equal(release.legacyFlowCoreContextReceiptSchema, 'td613.flowcore.context-receipt/vNext', 'legacy Flow-Core context receipt schema drifted');
assert.equal(release.roundTripReceiptSchema, `td613.aperture.round-trip-receipt/${compatibilityReceiptVersion}`, 'round-trip receipt schema drifted');
assert.equal(release.bridgePosture, 'reciprocal_receipts_without_reciprocal_authority', 'reciprocal bridge authority posture drifted');
assert.ok(tool.metadata.blocks.doctrineKernel, 'Doctrine kernel block missing from tool.html');
assert.ok(tool.metadata.globals.gatewayEmbed, 'Gateway embed global missing from tool.html');
assert.match(tool.html, /function\s+auditFlowCoreContextReceipt\s*\(/, 'returned Flow-Core receipt audit missing from tool.html');
assert.match(tool.html, /reciprocalReceipts:true[\s\S]*reciprocalAuthority:false/, 'reciprocal receipt authority boundary missing from tool.html');

assert.equal(counterToolDiscovery.schema, 'td613.aperture.counter-tool-route-guide/v1', 'Counter-Tool machine discovery schema drifted');
assert.equal(counterToolDiscovery.reciprocal_receipt_bridge.status_nodes_are_controls, false, 'receipt status nodes must remain non-controls');
assert.equal(counterToolDiscovery.reciprocal_receipt_bridge.automatic_authority_transfer, false, 'receipt bridge must not acquire automatic authority');
assert.match(bootstrap, /installAperturePedagogueSurface/, 'web wrapper no longer installs the canonical Pedagogue surface');
assert.match(pedagogueSurface, /consequence_before_ontology/, 'Pedagogue consequence-first route contract missing');
assert.match(pedagogueSurface, /td613PedagogueReceiptCurrent/, 'Pedagogue receipt-current animation missing');
assert.match(pedagogueSurface, /cursor:\s*help/, 'receipt stages must advertise explanation rather than click agency');
assert.match(pedagogueSurface, /prefers-reduced-motion:\s*reduce/, 'Pedagogue motion must preserve reduced-motion containment');
assert.doesNotMatch(pedagogueSurface, /fetch\s*\(|XMLHttpRequest|WebSocket/, 'Pedagogue presentation surface must remain network-silent');

const shareable = composeShareableApertureHtml({
  coreHtml: tool.html,
  surfaceModuleSource: pedagogueSurface,
  discovery: counterToolDiscovery
});
assert.match(shareable, /id="apertureCounterToolDiscovery"\s+type="application\/json"/, 'shareable standalone missing machine discovery card');
assert.match(shareable, /id="td613AperturePedagogueSurfaceInline"\s+type="module"/, 'shareable standalone missing inlined Pedagogue surface');
assert.match(shareable, /installAperturePedagogueSurface\(document, window\)/, 'shareable standalone does not install the inlined Pedagogue surface');
assert.ok(shareable.indexOf('apertureCounterToolDiscovery') < shareable.indexOf('</head>'), 'machine discovery card must be in the standalone head');
assert.ok(shareable.indexOf('td613AperturePedagogueSurfaceInline') < shareable.indexOf('</body>'), 'Pedagogue surface must be packaged inside the standalone body');
assert.doesNotMatch(shareable, /<script[^>]+src=["'][^"']*pedagogue-surface\.js/i, 'shareable standalone must not depend on an external Pedagogue runtime');

if (/^v3\.(?:[1-9]\d*)(?:-|$)/.test(tool.metadata.version)) {
  assert.equal(release.observatory?.tomographyReceiptSchema, 'td613.aperture.admissibility-tomography-receipt/v0.2', 'tomography receipt schema drifted');
  assert.deepEqual(release.observatory?.evidenceRecord?.fields, ['source_status', 'evidence_basis', 'observations', 'missingness', 'alternatives', 'open_questions', 'operator_notes', 'closure'], 'v3.1 evidence record drifted');
  assert.deepEqual(release.observatory?.evidenceRecord?.researchNotes, { default: 'OFF', humanOperated: true, modelContextInjection: false }, 'Research Notes posture drifted');
  assert.equal(Object.hasOwn(release.observatory || {}, 'scopeBoundary'), false, 'retired claim-ceiling metadata must not return');
  assert.equal(release.ash?.phase, 'ASH_KEEP_CASE_MAP_RUNTIME', 'Ash Keep release posture drifted');
  assert.doesNotMatch(tool.html, /cannotEstablish|cannot_establish|claimCeiling|claim_ceiling|Claim Ceiling|promotion_conditions/i, 'retired limiting vocabulary must not be emitted by the current Aperture tool');
}

console.log(JSON.stringify({
  status: 'pass',
  version: tool.metadata.version,
  schema: tool.metadata.schema,
  featureVersion: tool.metadata.featureVersion,
  cacheToken: iframeToken,
  duplicateIdWarnings: tool.metadata.duplicateIds.length,
  mojibakeSignals: tool.metadata.mojibakeSignals,
  pedagogueSurface: 'packaged-single-file',
  counterToolDiscovery: counterToolDiscovery.schema
}, null, 2));
