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
assert.equal(release.flowCoreContextReceiptSchema, 'td613.flowcore.context-receipt/vNext');
assert.equal(release.roundTripReceiptSchema, 'td613.aperture.round-trip-receipt/v2.9.3');
assert.equal(release.bridgePosture, 'reciprocal_receipts_without_reciprocal_authority');

console.log('aperture-sync-lane.test.mjs passed');
