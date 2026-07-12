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
  MARROWLINE_EGRESS_BOOT_VERSION,
  circuitObservation
} from '../app/dome-world/marrowline-egress-boot.js';
import {
  CLAIMED_PUA,
  COVENANT_KEY,
  HERITAGE_COVENANT,
  KHONAPOLIT_RECEIPT_SCHEMA,
  KHONAPOLIT_TERMINAL_SCHEMA
} from '../app/dome-world/khonapolit-covenant.js';
import {
  TD613_APERTURE_ATTESTATION_HEADER_KEYS,
  buildTD613ApertureAttestationHeaders,
  observeTD613ApertureEgress
} from '../app/engine/td613-aperture-egress-contract.js';

const stationSource = fs.readFileSync('app/dome-world/marrowline-station.js', 'utf8');
const bootSource = fs.readFileSync('app/dome-world/marrowline-egress-boot.js', 'utf8');
const terminalSource = fs.readFileSync('app/dome-world/marrowline-terminal.js', 'utf8');
const covenantSource = fs.readFileSync('app/dome-world/khonapolit-covenant.js', 'utf8');
const terminalCss = fs.readFileSync('app/dome-world/marrowline-terminal.css', 'utf8');
const pageSource = fs.readFileSync('app/dome-world/marrowline.html', 'utf8');
const apiSource = fs.readFileSync('api/marrowline.js', 'utf8');
const terminalApiSource = fs.readFileSync('api/khonapolit.js', 'utf8');
const release = JSON.parse(fs.readFileSync('app/dome-world/marrowline.release.json', 'utf8'));
const reflex = JSON.parse(fs.readFileSync('app/dome-world/reflex-spine.manifest.json', 'utf8'));
const vercel = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));

assert.equal(MARROWLINE_STATION_VERSION, 'td613.dome-world.marrowline/v0.2.0');
assert.equal(MARROWLINE_RECEIPT_SCHEMA, 'td613.dome-world.marrowline-receipt/v0.2');
assert.equal(MARROWLINE_LIVE_RECEIPT_SCHEMA, 'td613.dome-world.marrowline-live-receipt/v1');
assert.equal(MARROWLINE_CIRCUIT_RECEIPT_SCHEMA, 'td613.dome-world.marrowline-circuit-receipt/v1');
assert.equal(MARROWLINE_EGRESS_BOOT_VERSION, 'td613.dome-world.marrowline-egress-boot/v2-khonapolit-terminal');
assert.equal(MARROWLINE_LIVE_ENDPOINT, '/api/dome-world/marrowline');
assert.equal(release.stationSchema, MARROWLINE_STATION_VERSION);
assert.equal(release.receiptSchema, MARROWLINE_RECEIPT_SCHEMA);
assert.equal(release.liveReceiptSchema, MARROWLINE_LIVE_RECEIPT_SCHEMA);
assert.equal(release.circuitReceiptSchema, MARROWLINE_CIRCUIT_RECEIPT_SCHEMA);
assert.equal(release.terminalSchema, KHONAPOLIT_TERMINAL_SCHEMA);
assert.equal(release.terminalReceiptSchema, KHONAPOLIT_RECEIPT_SCHEMA);
assert.equal(release.egressBootSchema, MARROWLINE_EGRESS_BOOT_VERSION);
assert.equal(release.egressContractSchema, 'td613.aperture.egress-contract/v1');
assert.equal(release.reflexSpineSchema, 'td613.dome-world.reflex-spine/v1');
assert.equal(release.route, '/dome-world/marrowline.html');
assert.equal(release.liveIngressRoute, MARROWLINE_LIVE_ENDPOINT);
assert.equal(release.terminalRoute, '/api/dome-world/khonapolit');
assert.equal(release.keys.namespace, CLAIMED_PUA);
assert.equal(release.keys.heritage, HERITAGE_COVENANT);
assert.equal(release.keys.covenant, COVENANT_KEY);
assert.equal(release.jurisdiction.stationCore.networkMutation, false);
assert.equal(release.jurisdiction.egressBoot.pageRuntimeInterception, true);
assert.equal(release.jurisdiction.egressBoot.crossSurfaceInstallation, false);
assert.equal(release.jurisdiction.egressBoot.requestMutation, 'four-part-aperture-provenance-marker-on-room-egress');
assert.deepEqual(release.jurisdiction.egressBoot.destinations, ['/api/dome-world/marrowline', '/api/dome-world/khonapolit']);
assert.equal(release.jurisdiction.liveIngress.serverEgressObservation, 'exact-partial-mismatch-or-absent');
assert.equal(release.jurisdiction.terminal.provider, 'Gemini');
assert.equal(release.jurisdiction.terminal.responseSeal, 'open-until-operator-applies-lozenge');

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

assert.doesNotMatch(stationSource, /window\.fetch\s*=/, 'station core itself must not monkey-patch fetch');
assert.doesNotMatch(stationSource, /XMLHttpRequest\.prototype/, 'station core itself must not monkey-patch XHR');
assert.match(stationSource, /fetch\(endpoint/);
assert.match(bootSource, /installTD613ProvenanceAttestationEgress/);
assert.match(bootSource, /installCircuitObserver/);
assert.match(bootSource, /marrowline-terminal\.js/);
assert.match(bootSource, /\/api\/dome-world\/khonapolit/);
assert.match(terminalSource, /KHONAPOLIT_ENDPOINT/);
assert.match(terminalSource, /sealLastResponse/);
assert.match(terminalSource, /binding_event_text\.txt/);
assert.match(terminalSource, /TD613_FLIGHT_SHI/);
assert.match(covenantSource, /U\+10D613/);
assert.match(covenantSource, /Khona\\u200Clit-po/);
assert.match(covenantSource, /Tauric Diana — Crimean heritage custodianship/);
assert.match(covenantSource, /heuristic-text-classification-not-proof/);
assert.match(terminalCss, /Ash-Moon|black-sea|Worm Moon|--black-sea/i);
assert.match(apiSource, /observeTD613ApertureEgress/);
assert.match(apiSource, /_serveMarrowlineTrap/);
assert.match(apiSource, /MARROWLINE_OPERATOR_TOKEN/);
assert.match(terminalApiSource, /GEMINI_API_KEY/);
assert.match(terminalApiSource, /buildInvocationPacket/);
assert.match(terminalApiSource, /classifyEmergence/);
assert.match(terminalApiSource, /serverConversationStorage: false/);
assert.match(pageSource, /U\+10D613 · Kʰonapolit Terminal at Marrowline/);
assert.match(pageSource, /Original Binding Ritual/);
assert.match(pageSource, /Invoke through U\+10D613/);
assert.match(pageSource, /Seal last return ⟐/);
assert.match(pageSource, /Fire live Marrowline/);
assert.match(pageSource, /The Matron · The Undertow · The Spark/);
assert.equal(reflex.order.length, 7);
assert.equal(reflex.order[0].id, 'aperture-egress-attestation');
assert.equal(reflex.order[1].id, 'marrowline-ingress-absorption');
assert.equal(reflex.order.at(-1).id, 'gateway-rescue-fuse');
assert.equal(reflex.order.at(-1).mustRunLast, true);
assert.ok(vercel.functions['api/marrowline.js']);
assert.ok(vercel.functions['api/khonapolit.js']);
assert.ok(vercel.rewrites.some((entry) => entry.source === MARROWLINE_LIVE_ENDPOINT && entry.destination === '/api/marrowline'));
assert.ok(vercel.rewrites.some((entry) => entry.source === '/api/dome-world/khonapolit' && entry.destination === '/api/khonapolit'));

console.log('dome-world-marrowline-station: Ash-Moon terminal, Gemini route, Aperture egress, and live ingress ok');
