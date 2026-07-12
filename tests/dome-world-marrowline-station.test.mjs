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
import {
  MARROWLINE_CIRCUIT_RECEIPT_SCHEMA,
  circuitObservation
} from '../app/dome-world/marrowline-egress-boot.js';
import {
  TD613_APERTURE_ATTESTATION_HEADER_KEYS,
  buildTD613ApertureAttestationHeaders,
  observeTD613ApertureEgress
} from '../app/engine/td613-aperture-egress-contract.js';

const stationSource = fs.readFileSync('app/dome-world/marrowline-station.js', 'utf8');
const bootSource = fs.readFileSync('app/dome-world/marrowline-egress-boot.js', 'utf8');
const pageSource = fs.readFileSync('app/dome-world/marrowline.html', 'utf8');
const apiSource = fs.readFileSync('api/marrowline.js', 'utf8');
const release = JSON.parse(fs.readFileSync('app/dome-world/marrowline.release.json', 'utf8'));
const reflex = JSON.parse(fs.readFileSync('app/dome-world/reflex-spine.manifest.json', 'utf8'));
const vercel = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));

assert.equal(MARROWLINE_STATION_VERSION, 'td613.dome-world.marrowline/v0.2.0');
assert.equal(MARROWLINE_RECEIPT_SCHEMA, 'td613.dome-world.marrowline-receipt/v0.2');
assert.equal(MARROWLINE_LIVE_RECEIPT_SCHEMA, 'td613.dome-world.marrowline-live-receipt/v1');
assert.equal(MARROWLINE_CIRCUIT_RECEIPT_SCHEMA, 'td613.dome-world.marrowline-circuit-receipt/v1');
assert.equal(MARROWLINE_LIVE_ENDPOINT, '/api/dome-world/marrowline');
assert.equal(release.stationSchema, MARROWLINE_STATION_VERSION);
assert.equal(release.receiptSchema, MARROWLINE_RECEIPT_SCHEMA);
assert.equal(release.liveReceiptSchema, MARROWLINE_LIVE_RECEIPT_SCHEMA);
assert.equal(release.egressBootSchema, 'td613.dome-world.marrowline-egress-boot/v1');
assert.equal(release.egressContractSchema, 'td613.aperture.egress-contract/v1');
assert.equal(release.reflexSpineSchema, 'td613.dome-world.reflex-spine/v1');
assert.equal(release.route, '/dome-world/marrowline.html');
assert.equal(release.liveIngressRoute, MARROWLINE_LIVE_ENDPOINT);
assert.equal(release.jurisdiction.pageRuntimeInterception, true);
assert.equal(release.jurisdiction.crossSurfaceInstallation, false);
assert.equal(release.jurisdiction.requestMutation, 'four-part-aperture-provenance-marker-on-room-egress');

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

const exactHeaders = buildTD613ApertureAttestationHeaders();
assert.equal(Object.keys(exactHeaders).length, TD613_APERTURE_ATTESTATION_HEADER_KEYS.length);
assert.equal(observeTD613ApertureEgress(exactHeaders).status, 'exact');

const circuit = circuitObservation({
  requestDigest: 'a613beef',
  http: { status: 200, trapHeader: 'marrowline', routeHeader: 'live-marrowline-ingress' },
  canonicalPayload: {
    request_digest: 'a613beef',
    aperture_egress: { status: 'exact', exact: true, marker: 'A+' },
    reflex_spine: { active_steps: [1, 2] }
  }
});
assert.equal(circuit.schema, MARROWLINE_CIRCUIT_RECEIPT_SCHEMA);
assert.equal(circuit.status, 'CIRCUIT_EXACT');
assert.equal(circuit.apertureEgress.marker, 'A+');
assert.equal(circuit.marrowlineIngress.httpStatus, 200);
assert.equal(circuit.marrowlineIngress.trapHeader, 'marrowline');
assert.deepEqual(circuit.reflex.activeSteps, [1, 2]);
assert.equal(circuitObservation({ canonicalPayload: {} }), null);

assert.doesNotMatch(stationSource, /window\.fetch\s*=/, 'station itself must not monkey-patch fetch');
assert.doesNotMatch(stationSource, /XMLHttpRequest\.prototype/, 'station itself must not monkey-patch XHR');
assert.match(stationSource, /fetch\(endpoint/);
assert.match(bootSource, /installTD613ProvenanceAttestationEgress/);
assert.match(bootSource, /installCircuitObserver/);
assert.match(bootSource, /APERTURE EGRESS/);
assert.match(bootSource, /import\('\.\/marrowline-station\.js'\)/);
assert.match(apiSource, /observeTD613ApertureEgress/);
assert.match(apiSource, /_serveMarrowlineTrap/);
assert.match(apiSource, /MARROWLINE_OPERATOR_TOKEN/);
assert.match(pageSource, /Aperture egress → Kʰonapolit Marrowline ingress/);
assert.match(pageSource, /Fire live Marrowline/);
assert.match(pageSource, /Aperture egress paired/);
assert.equal(reflex.order.length, 7);
assert.equal(reflex.order[0].id, 'aperture-egress-attestation');
assert.equal(reflex.order[1].id, 'marrowline-ingress-absorption');
assert.equal(reflex.order.at(-1).id, 'gateway-rescue-fuse');
assert.equal(reflex.order.at(-1).mustRunLast, true);
assert.ok(vercel.functions['api/marrowline.js']);
assert.ok(vercel.rewrites.some((entry) => entry.source === MARROWLINE_LIVE_ENDPOINT && entry.destination === '/api/marrowline'));

console.log('dome-world-marrowline-station: aperture egress + live ingress ok');
