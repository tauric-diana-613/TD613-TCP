#!/usr/bin/env node
import assert from 'node:assert/strict';
import {
  APERTURE_INDEX_PATH,
  APERTURE_RELEASE_PATH,
  APERTURE_TOOL_PATH,
  ASSET_VERSIONS_PATH,
  readHtmlArtifact,
  readText
} from './lib/aperture-sync-lane.mjs';

const tool = await readHtmlArtifact(APERTURE_TOOL_PATH);
const index = await readHtmlArtifact(APERTURE_INDEX_PATH);
const assetVersions = await readText(ASSET_VERSIONS_PATH);
const release = JSON.parse(await readText(APERTURE_RELEASE_PATH));

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
if (/^v3\.1(?:-|$)/.test(tool.metadata.version)) {
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
  mojibakeSignals: tool.metadata.mojibakeSignals
}, null, 2));
