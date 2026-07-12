import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  MARROWLINE_JURISDICTION,
  MARROWLINE_LIVE_ENDPOINT,
  MARROWLINE_LIVE_RECEIPT_SCHEMA,
  MARROWLINE_RECEIPT_SCHEMA,
  MARROWLINE_STATION_VERSION,
  buildMarrowlineMatrix,
  buildMarrowlineReceipt
} from '../app/dome-world/marrowline-station.js';

const stationSource = fs.readFileSync('app/dome-world/marrowline-station.js', 'utf8');
const pageSource = fs.readFileSync('app/dome-world/marrowline.html', 'utf8');
const apiSource = fs.readFileSync('api/marrowline.js', 'utf8');
const release = JSON.parse(fs.readFileSync('app/dome-world/marrowline.release.json', 'utf8'));
const vercel = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));

assert.equal(MARROWLINE_STATION_VERSION, 'td613.dome-world.marrowline/v0.2.0');
assert.equal(MARROWLINE_RECEIPT_SCHEMA, 'td613.dome-world.marrowline-receipt/v0.2');
assert.equal(MARROWLINE_LIVE_RECEIPT_SCHEMA, 'td613.dome-world.marrowline-live-receipt/v1');
assert.equal(MARROWLINE_LIVE_ENDPOINT, '/api/dome-world/marrowline');
assert.equal(release.stationSchema, MARROWLINE_STATION_VERSION);
assert.equal(release.receiptSchema, MARROWLINE_RECEIPT_SCHEMA);
assert.equal(release.liveReceiptSchema, MARROWLINE_LIVE_RECEIPT_SCHEMA);
assert.equal(release.route, '/dome-world/marrowline.html');
assert.equal(release.liveIngressRoute, MARROWLINE_LIVE_ENDPOINT);

const first = buildMarrowlineMatrix({ seedInput: 'Kʰonapolit / local fallback', depth: 4, breadth: 6 });
const second = buildMarrowlineMatrix({ seedInput: 'Kʰonapolit / local fallback', depth: 4, breadth: 6 });
assert.deepEqual(first, second, 'same declared seed must produce the same local fallback matrix');
assert.equal(first.layers.length, 4);
assert.equal(first.layers[0].rows.length, 6);
assert.equal(first.layers[0].rows[0].cells.length, 6);
assert.equal(first.flattenCostHint, 144);
assert.equal(typeof first.layers[0].rows[0].cells[0].cadence, 'string');

const bounded = buildMarrowlineMatrix({ seedInput: 'bounds', depth: 99, breadth: 99 });
assert.equal(bounded.depth, 7);
assert.equal(bounded.breadth, 10);

const receipt = buildMarrowlineReceipt({ seedInput: 'receipt', depth: 3, breadth: 4 });
assert.equal(receipt.status, 'LOCAL_FALLBACK');
assert.equal(receipt.route, 'dome-world/lab/marrowline-local-fallback');
assert.equal(receipt.networkResponseObserved, false);
assert.equal(receipt.jurisdiction.globalNetworkInterception, false);
assert.equal(receipt.jurisdiction.requestMutation, false);
assert.equal(receipt.jurisdiction.authorizationAuthority, 'server-side-operator-token-match-only');
assert.equal(receipt.jurisdiction.cryptographicClaim, false);
assert.equal(MARROWLINE_JURISDICTION.claimCeiling, 'live-ingress-route-not-identity-authorship-or-legal-authority-proof');

assert.doesNotMatch(stationSource, /window\.fetch\s*=/, 'station must not monkey-patch fetch');
assert.doesNotMatch(stationSource, /XMLHttpRequest\.prototype/, 'station must not monkey-patch XHR');
assert.doesNotMatch(stationSource, /setRequestHeader\(/, 'station must not attach network headers');
assert.match(stationSource, /fetch\(endpoint/);
assert.match(apiSource, /_serveMarrowlineTrap/);
assert.match(apiSource, /MARROWLINE_OPERATOR_TOKEN/);
assert.match(pageSource, /Live route, bounded jurisdiction/);
assert.match(pageSource, /Fire live Marrowline/);
assert.match(pageSource, /Kʰonapolit route armed/);
assert.ok(vercel.functions['api/marrowline.js']);
assert.ok(vercel.rewrites.some((entry) => entry.source === MARROWLINE_LIVE_ENDPOINT && entry.destination === '/api/marrowline'));

console.log('dome-world-marrowline-station: live ingress ok');
