import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import { JSDOM } from 'jsdom';

const html = fs.readFileSync('app/aperture/tool.html', 'utf8');
const dom = new JSDOM(html, {
  runScripts: 'outside-only',
  url: 'https://td613.test/aperture/'
});
const { window } = dom;
const { document } = window;

// The Patch Bay is machine-only. Removing scripts must leave the complete
// rendered HTML/CSS/copy/focus surface byte-identical to the pre-patch file.
const surfaceOnly = html
  .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
  .replace(/\r\n?/g, '\n')
  .replace(/>\s+</g, '><')
  .trim();
const surfaceDigest = crypto.createHash('sha256').update(surfaceOnly).digest('hex');
assert.equal(Buffer.byteLength(surfaceOnly), 191907);
assert.equal(surfaceDigest, 'ef60e94ba3e2c8847fa8bb60741fdd79e578b33a6b99aa5e26e9fbd12a4fdd95');
assert.equal((html.match(/<button\b/gi) || []).length, 63);
assert.equal((html.match(/class=["'][^"']*\bsection-label\b/gi) || []).length, 43);
assert.equal((html.match(/<details\b/gi) || []).length, 7);
assert.equal(document.querySelectorAll('#td613AperturePatchBayContract').length, 1);
assert.equal(document.querySelectorAll('#td613AperturePatchBayContract:not(script)').length, 0);

for (const id of [
  'apertureV3TaskIntentRuntime',
  'apertureV28WitnessLabScript',
  'apertureV31TomographyDrawerRuntime',
  'td613AperturePatchBayRuntime'
]) {
  const script = document.getElementById(id);
  assert.ok(script, `missing ${id}`);
  window.eval(script.textContent);
}
document.dispatchEvent(new window.Event('DOMContentLoaded'));

const bay = window.TD613_APERTURE_PATCH_BAY;
assert.ok(bay);
assert.deepEqual(Object.keys(bay).sort(), ['describe', 'play', 'resolve', 'selfTest']);

const described = bay.describe();
assert.equal(described.families.length, 37);
assert.equal(described.lanes.length, 25);
assert.equal(described.canonicalRoutingExamples.length, 51);
assert.ok(described.availablePorts.every((port) =>
  ['PURE', 'STATEFUL', 'CONTRACT_ONLY', 'DEMO_BOUND'].includes(port.state)));
assert.ok(described.collisions.some((item) =>
  item.qualifiedAddresses.includes('family:phason') &&
  item.qualifiedAddresses.includes('lane:phason')));

const phason = bay.resolve({ requested: ['phason'] });
assert.ok(phason.suggested.includes('family:phason'));
assert.ok(phason.suggested.includes('lane:phason'));
assert.notEqual(phason.suggested.indexOf('family:phason'), phason.suggested.indexOf('lane:phason'));

const giving = bay.resolve({ task: 'Search public donor contribution giving history' });
assert.deepEqual(Array.from(giving.suggested), [
  'port:task-intent',
  'port:witness',
  'port:anti-equivalence',
  'family:phason',
  'port:sigma-receipt'
]);

const plainSelected = window.routeWitnessArtifact({
  artifactName: 'source row',
  artifactType: 'dataset',
  claim: 'selected record for operator comparison',
  selected: ['candidate identity'],
  materials: ['source row']
});
assert.equal(plainSelected.grade.grade, 'SELECTED');
assert.equal(plainSelected.exportStatus, 'conditional');

for (const forcedClaim of [
  'selected record definitively proves identity',
  'selected record will eliminate review',
  'selected record is forced'
]) {
  const forcedSelected = window.routeWitnessArtifact({
    artifactName: 'source row',
    artifactType: 'dataset',
    claim: forcedClaim,
    selected: ['candidate identity'],
    materials: ['source row']
  });
  assert.equal(forcedSelected.exportStatus, 'withheld');
  assert.equal(forcedSelected.grade.selectedProofRisk, true);
}

const played = bay.play({
  task: 'Search public donor contribution giving history',
  dryRun: true,
  input: {
    witness: {
      artifactName: 'source row',
      artifactType: 'dataset',
      claim: 'record observed in the named source',
      materials: ['source row'],
      selected: ['operator candidate'],
      surfaceMatch: 'name and address resemble the candidate',
      governingInvariant: 'human-confirmed identity membership',
      open: ['identity remains under review']
    }
  }
});
assert.equal(played.dryRun, true);
assert.ok(played.receipts.some((item) => item.address === 'port:witness' && item.status === 'INVOKED'));
assert.ok(played.receipts.some((item) => item.address === 'family:phason' && item.status === 'WITHHELD'));
assert.ok(!played.receipts.some((item) => ['STATEFUL', 'DEMO_BOUND'].includes(item.state) && item.status === 'INVOKED'));
assert.equal(played.tomographyResponsiveness.demoBound.phasonSusceptibility, 1.45);

const refused = bay.play({ task: 'Giving history', dryRun: false });
assert.equal(refused.receipts.length, 0);
assert.match(refused.hardStops.join(' '), /dry-run only/i);

const selfTest = bay.selfTest();
assert.equal(selfTest.status, 'pass');
assert.equal(selfTest.counts.families, '37/37');
assert.equal(selfTest.counts.lanes, '25/25');
assert.equal(selfTest.counts.examples, '51/51');
assert.equal(selfTest.counts.witness, '5/5');

const tomography = window.APERTURE_V31_TOMOGRAPHY;
assert.deepEqual(Array.from(tomography.inputResponsiveness.responsive), ['temporal_marginals', 'declared_missingness']);
assert.equal(tomography.inputResponsiveness.demoBound.state, 'AT3/TOMOGRAPHY_READY');
assert.match(tomography.inputResponsiveness.law, /not an empirical finding/i);

console.log('aperture-patch-bay.test.mjs passed: 37/37 families, 25/25 lanes, 51/51 examples, Witness 5/5, zero visible-surface drift');
