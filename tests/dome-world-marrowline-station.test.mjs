import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  MARROWLINE_JURISDICTION,
  MARROWLINE_RECEIPT_SCHEMA,
  MARROWLINE_STATION_VERSION,
  buildMarrowlineMatrix,
  buildMarrowlineReceipt
} from '../app/dome-world/marrowline-station.js';

const stationSource = fs.readFileSync('app/dome-world/marrowline-station.js', 'utf8');
const pageSource = fs.readFileSync('app/dome-world/marrowline.html', 'utf8');
const release = JSON.parse(fs.readFileSync('app/dome-world/marrowline.release.json', 'utf8'));

assert.equal(MARROWLINE_STATION_VERSION, 'td613.dome-world.marrowline/v0.1.0');
assert.equal(MARROWLINE_RECEIPT_SCHEMA, 'td613.dome-world.marrowline-receipt/v0.1');
assert.equal(release.stationSchema, MARROWLINE_STATION_VERSION);
assert.equal(release.receiptSchema, MARROWLINE_RECEIPT_SCHEMA);
assert.equal(release.route, '/dome-world/marrowline.html');

const first = buildMarrowlineMatrix({ seedInput: 'Kʰonapolit / local assay', depth: 4, breadth: 6 });
const second = buildMarrowlineMatrix({ seedInput: 'Kʰonapolit / local assay', depth: 4, breadth: 6 });
assert.deepEqual(first, second, 'same declared seed must produce the same local matrix');
assert.equal(first.layers.length, 4);
assert.equal(first.layers[0].rows.length, 6);
assert.equal(first.layers[0].rows[0].cells.length, 6);
assert.equal(first.flattenCostHint, 144);
assert.equal(typeof first.layers[0].rows[0].cells[0].cadence, 'string');

const bounded = buildMarrowlineMatrix({ seedInput: 'bounds', depth: 99, breadth: 99 });
assert.equal(bounded.depth, 7);
assert.equal(bounded.breadth, 10);

const receipt = buildMarrowlineReceipt({ seedInput: 'receipt', depth: 3, breadth: 4 });
assert.equal(receipt.status, 'CONSTRUCTION_PROPOSED');
assert.equal(receipt.route, 'dome-world/lab/marrowline');
assert.equal(receipt.attestationPreview.mode, 'preview-only');
assert.equal(receipt.attestationPreview.payloadInstalled, false);
assert.equal(receipt.attestationPreview.networkMutationPerformed, false);
assert.equal(receipt.jurisdiction.networkInterception, false);
assert.equal(receipt.jurisdiction.requestMutation, false);
assert.equal(receipt.jurisdiction.authorizationAuthority, false);
assert.equal(receipt.jurisdiction.cryptographicClaim, false);
assert.equal(MARROWLINE_JURISDICTION.claimCeiling, 'literary-ingestion-assay-not-authentication-or-network-defense');

assert.doesNotMatch(stationSource, /window\.fetch\s*=/, 'station must not monkey-patch fetch');
assert.doesNotMatch(stationSource, /XMLHttpRequest\.prototype/, 'station must not monkey-patch XHR');
assert.doesNotMatch(stationSource, /setRequestHeader\(/, 'station must not attach network headers');
assert.match(pageSource, /Jurisdiction before spectacle/);
assert.match(pageSource, /no network mutation/i);
assert.match(pageSource, /Kʰonapolit dream preserved/);

console.log('dome-world-marrowline-station: ok');
