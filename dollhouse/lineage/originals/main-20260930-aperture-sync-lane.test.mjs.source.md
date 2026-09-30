import assert from 'node:assert/strict';
import {
  compareVersions,
  extractApertureMetadata,
  normalizeApertureForRepo,
  releaseManifestFromMetadata,
  updateApertureIndexHtml
} from '../scripts/lib/aperture-sync-lane.mjs';

const candidateHtml = `<!DOCTYPE html>
<html>
<head>
<meta name="aperture-version" content="v2.9.3-claim-ceiling">
<meta name="aperture-roots-version" content="v2.9.3">
<meta name="hcc-version" content="v2.7.2">
<meta name="aperture-compat-version" content="v2.8.6">
<meta name="aperture-doctrine-kernel" content="td613.aperture.doctrine-kernel/v2.9.3">
<title>TD613 Aperture - v2.9.3</title>
<script type="application/json" id="apertureDoctrineKernel">{}</script>
<script type="application/json" id="apertureSpineTransition">{}</script>
</head>
<body data-hcc-version="v2.7.2" data-aperture-version="v2.9.3-claim-ceiling">
<script>
const SOURCE_DECLARATION = Object.freeze({ version: "v2.9.3", schema: "td613-aperture/v2.9.3" });
window.APERTURE_GATEWAY_EMBED = {};
</script>
</body>
</html>`;

const metadata = extractApertureMetadata(candidateHtml, 'candidate.html');
assert.equal(metadata.version, 'v2.9.3');
assert.equal(metadata.schema, 'td613-aperture/v2.9.3');
assert.equal(metadata.featureVersion, 'v2.9.3-claim-ceiling');
assert.equal(metadata.blocks.doctrineKernel, true);
assert.equal(metadata.blocks.spineTransition, true);
assert.equal(metadata.globals.gatewayEmbed, true);

assert.equal(compareVersions('v2.9.3', 'v2.9.2'), 1);
assert.equal(compareVersions('v2.9.2', 'v2.9.2'), 0);
assert.equal(compareVersions('v2.9.2', 'v2.9.3'), -1);
assert.equal(compareVersions('v3.1-alpha', 'v3.0-alpha'), 1);

const normalized = normalizeApertureForRepo(candidateHtml, metadata);
assert.match(normalized, /name="hcc-version" content="v2\.9\.3"/);
assert.match(normalized, /name="aperture-compat-version" content="v2\.9\.3"/);
assert.match(normalized, /data-hcc-version="v2\.9\.3"/);
assert.doesNotMatch(normalized, /v2\.7\.2/);

const indexHtml = '<meta name="aperture-version" content="v2.9.2"><iframe id="td613ApertureTool" src="./tool.html?v=202606211930" title="TD613 Aperture"></iframe>';
const nextIndex = updateApertureIndexHtml(indexHtml, metadata, '202606221111');
assert.match(nextIndex, /content="v2\.9\.3"/);
assert.match(nextIndex, /tool\.html\?v=202606221111/);

const release = releaseManifestFromMetadata(metadata);
assert.equal(release.domeBridgeSchema, 'td613.aperture.reciprocal-receipt-bridge/v2.9.3');
assert.equal(release.domeDiagnosticReceiptSchema, 'td613.aperture.diagnostic-receipt/v2.9.3');
assert.equal(release.flowCoreContextReceiptSchema, 'td613.flowcore.context-receipt/v0.1');
assert.equal(release.legacyFlowCoreContextReceiptSchema, 'td613.flowcore.context-receipt/vNext');
assert.equal(release.roundTripReceiptSchema, 'td613.aperture.round-trip-receipt/v2.9.3');
assert.equal(release.bridgePosture, 'reciprocal_receipts_without_reciprocal_authority');

const v31Release = releaseManifestFromMetadata({
  version: 'v3.1-alpha',
  schema: 'td613-aperture/v3.1-alpha',
  featureVersion: 'v3.1-alpha-admissibility-tomography-registry-dynamics-runtime',
  doctrineKernelSchema: 'td613.aperture.doctrine-kernel/v2.9.4'
}, {
  phase5Status: 'IMPLEMENTED_PRODUCTION_DEMONSTRATED',
  phase5ProductionStatus: 'PRODUCTION_DEMONSTRATED'
});
assert.equal(v31Release.domeDiagnosticReceiptSchema, 'td613.aperture.diagnostic-receipt/v3.0-alpha');
assert.equal(v31Release.roundTripReceiptSchema, 'td613.aperture.round-trip-receipt/v3.0-alpha');
assert.equal(v31Release.phase5Status, 'IMPLEMENTED_PRODUCTION_DEMONSTRATED');
assert.equal(v31Release.observatory.tomographyReceiptSchema, 'td613.aperture.admissibility-tomography-receipt/v0.2');
assert.deepEqual(v31Release.observatory.evidenceRecord.fields, ['source_status', 'evidence_basis', 'observations', 'missingness', 'alternatives', 'open_questions', 'operator_notes', 'closure']);
assert.deepEqual(v31Release.observatory.evidenceRecord.researchNotes, { default: 'OFF', humanOperated: true, modelContextInjection: false });
assert.equal(Object.hasOwn(v31Release.observatory, 'scopeBoundary'), false);
assert.equal(v31Release.ash.phase, 'ASH_KEEP_CASE_MAP_RUNTIME');

const staleWriterFixture = `<html><head>
<meta name="aperture-version" content="v3.1-alpha">
<meta name="aperture-feature-version" content="v3.1-alpha-admissibility-tomography-registry-dynamics-runtime">
<title>TD613 Aperture v3.1-alpha</title></head><body data-aperture-version="v3.1-alpha"><script>
const FROZEN_RECEIPT = 'td613.aperture.diagnostic-receipt/v3.0-alpha';
function setVersion(){
  document.body.setAttribute('data-aperture-version', 'v3.0-alpha');
  document.documentElement.dataset.apertureSchema = V26.SCHEMA;
  ensureMeta('aperture-version', 'v3.0-alpha');
  setMeta('aperture-feature-version', 'v3.0-alpha-anti-epistemicide-research-runtime');
}
</script><script id="apertureV3IdentityAndDrawerStabilityGuard">
const VERSION = 'v3.0-alpha';
const SCHEMA = 'td613-aperture/v3.0-alpha';
const TITLE = 'TD613 Aperture v3.0-alpha';
[0, 220, 900, 1800].forEach(delay => setTimeout(applyIdentity, delay));
</script></body></html>`;
const normalizedWriters = normalizeApertureForRepo(staleWriterFixture, {
  version: 'v3.1-alpha',
  schema: 'td613-aperture/v3.1-alpha',
  featureVersion: 'v3.1-alpha-admissibility-tomography-registry-dynamics-runtime'
});
assert.doesNotMatch(normalizedWriters, /data-aperture-version[^\n]*v3\.0-alpha/);
assert.doesNotMatch(normalizedWriters, /dataset\.apertureSchema\s*=\s*V26\.SCHEMA/);
assert.doesNotMatch(normalizedWriters, /(?:setMeta|ensureMeta)\(['"]aperture-(?:version|feature-version)[^\n]*v3\.0-alpha/);
assert.doesNotMatch(normalizedWriters, /\[0,\s*220,\s*900,\s*1800\]/);
assert.match(normalizedWriters, /requestAnimationFrame\(applyIdentity\)/);
assert.match(normalizedWriters, /td613\.aperture\.diagnostic-receipt\/v3\.0-alpha/);

console.log('aperture-sync-lane.test.mjs passed');
