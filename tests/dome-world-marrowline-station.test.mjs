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
  MARROWLINE_ROOM_BOOT_SCHEMA,
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
  APERTURE_V3_DIAGNOSTIC_SCHEMA,
  APERTURE_V3_SCHEMA,
  APERTURE_V3_TASK_ROUTE_SCHEMA,
  APERTURE_V3_VERSION
} from '../app/engine/aperture-v3-task-intent.js';
import {
  HIGH_ZALGO_VERSION,
  KHONAPOLIT_RELAY_SCHEMA
} from '../app/dome-world/khonapolit-relay.js';
import {
  TD613_APERTURE_ATTESTATION_HEADER_KEYS,
  buildTD613ApertureAttestationHeaders,
  observeTD613ApertureEgress
} from '../app/engine/td613-aperture-egress-contract.js';

const stationSource = fs.readFileSync('app/dome-world/marrowline-station.js', 'utf8');
const bootSource = fs.readFileSync('app/dome-world/marrowline-egress-boot.js', 'utf8');
const terminalSource = fs.readFileSync('app/dome-world/marrowline-terminal.js', 'utf8');
const mobileShellSource = fs.readFileSync('app/dome-world/marrowline-mobile-shell.js', 'utf8');
const mobileShellCss = fs.readFileSync('app/dome-world/marrowline-mobile-shell.css', 'utf8');
const covenantSource = fs.readFileSync('app/dome-world/khonapolit-covenant.js', 'utf8');
const relaySource = fs.readFileSync('app/dome-world/khonapolit-relay.js', 'utf8');
const apertureTaskSource = fs.readFileSync('app/engine/aperture-v3-task-intent.js', 'utf8');
const terminalCss = fs.readFileSync('app/dome-world/marrowline-terminal.css', 'utf8');
const pageSource = fs.readFileSync('app/dome-world/marrowline.html', 'utf8');
const apiSource = fs.readFileSync('api/marrowline.js', 'utf8');
const terminalApiSource = fs.readFileSync('api/khonapolit-quality.js', 'utf8');
const release = JSON.parse(fs.readFileSync('app/dome-world/marrowline.release.json', 'utf8'));
const reflex = JSON.parse(fs.readFileSync('app/dome-world/reflex-spine.manifest.json', 'utf8'));
const vercel = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));

assert.equal(MARROWLINE_STATION_VERSION, 'td613.dome-world.marrowline/v0.2.0');
assert.equal(MARROWLINE_RECEIPT_SCHEMA, 'td613.dome-world.marrowline-receipt/v0.2');
assert.equal(MARROWLINE_LIVE_RECEIPT_SCHEMA, 'td613.dome-world.marrowline-live-receipt/v1');
assert.equal(MARROWLINE_CIRCUIT_RECEIPT_SCHEMA, 'td613.dome-world.marrowline-circuit-receipt/v1');
assert.equal(MARROWLINE_EGRESS_BOOT_VERSION, 'td613.dome-world.marrowline-egress-boot/v4-scroll-custody');
assert.equal(MARROWLINE_ROOM_BOOT_SCHEMA, 'td613.dome-world.marrowline-room-boot/v3-mobile-scroll-custody');
assert.equal(MARROWLINE_LIVE_ENDPOINT, '/api/dome-world/marrowline');
assert.equal(release.schema, 'td613.dome-world.marrowline.release/v6');
assert.equal(release.version, 'v0.4.1-mobile-scroll-custody');
assert.equal(release.mobileShellSchema, 'td613.dome-world.marrowline-mobile-shell/v1-scroll-custody');
assert.equal(release.stationSchema, MARROWLINE_STATION_VERSION);
assert.equal(release.receiptSchema, MARROWLINE_RECEIPT_SCHEMA);
assert.equal(release.liveReceiptSchema, MARROWLINE_LIVE_RECEIPT_SCHEMA);
assert.equal(release.circuitReceiptSchema, MARROWLINE_CIRCUIT_RECEIPT_SCHEMA);
assert.equal(release.roomBootSchema, MARROWLINE_ROOM_BOOT_SCHEMA);
assert.equal(release.terminalSchema, KHONAPOLIT_TERMINAL_SCHEMA);
assert.equal(release.terminalReceiptSchema, KHONAPOLIT_RECEIPT_SCHEMA);
assert.equal(release.relaySchema, KHONAPOLIT_RELAY_SCHEMA);
assert.equal(release.highZalgoSchema, HIGH_ZALGO_VERSION);
assert.equal(release.apertureVersion, 'v3.1-alpha');
assert.equal(release.apertureFirmwareSchema, 'td613-aperture/v3.1-alpha');
assert.equal(release.apertureTaskRouteSchema, APERTURE_V3_TASK_ROUTE_SCHEMA);
assert.equal(release.apertureDiagnosticSchema, APERTURE_V3_DIAGNOSTIC_SCHEMA);
assert.equal(APERTURE_V3_VERSION, 'v3.0-alpha');
assert.equal(APERTURE_V3_SCHEMA, 'td613-aperture/v3.0-alpha');
assert.equal(release.egressBootSchema, MARROWLINE_EGRESS_BOOT_VERSION);
assert.equal(release.route, '/dome-world/marrowline.html');
assert.equal(release.liveIngressRoute, MARROWLINE_LIVE_ENDPOINT);
assert.equal(release.terminalRoute, '/api/dome-world/khonapolit');
assert.equal(release.keys.namespace, CLAIMED_PUA);
assert.equal(release.keys.heritage, HERITAGE_COVENANT);
assert.equal(release.keys.covenant, COVENANT_KEY);
assert.equal(release.aperture.primaryRoute, 'OPEN_FIELD_SPECULATIVE_SYNTHESIS');
assert.equal(release.aperture.runtimeMateriality, 'BACKGROUND');
assert.equal(release.aperture.surfaceRuntime, false);
assert.equal(release.aperture.proseAuthority, false);
assert.deepEqual(release.relay.order, [
  'gemini-instrument',
  'khonapolit-relay-if-admitted',
  'tauric-diana-bots-high-zalgo-if-locked-and-ushered'
]);
assert.equal(release.mobile.posture, 'bounded-conversation-shell');
assert.equal(release.mobile.documentScroll, false);
assert.equal(release.mobile.transcriptScrollOwner, '#khonapolitMessages');
assert.equal(release.mobile.transcriptOverflowY, 'auto');
assert.equal(release.mobile.composerOcclusion, false);
assert.equal(release.mobile.dockOcclusion, false);
assert.equal(release.mobile.dockHiddenDuringKeyboardComposition, true);
assert.equal(release.mobile.horizontalOverflow, false);
assert.equal(release.mobile.minimumInputFontPx, 16);
assert.equal(release.jurisdiction.stationCore.networkMutation, false);
assert.equal(release.jurisdiction.egressBoot.pageRuntimeInterception, true);
assert.equal(release.jurisdiction.egressBoot.crossSurfaceInstallation, false);
assert.equal(release.jurisdiction.liveIngress.serverEgressObservation, 'exact-partial-mismatch-or-absent');
assert.equal(release.jurisdiction.terminal.provider, 'Gemini');
assert.equal(release.jurisdiction.terminal.providerRole, 'instrument-and-carrier');
assert.equal(release.jurisdiction.terminal.apertureRole, 'route-and-diagnostic-receipt-not-prose-generator');
assert.equal(release.jurisdiction.terminal.responseSeal, 'open-until-operator-applies-lozenge');

const first = buildMarrowlineMatrix({ seedInput: 'Kʰonapolit / local fallback', depth: 4, breadth: 6 });
const second = buildMarrowlineMatrix({ seedInput: 'Kʰonapolit / local fallback', depth: 4, breadth: 6 });
assert.deepEqual(first, second, 'same declared seed must produce the same local fallback matrix');
assert.equal(first.layers.length, 4);
assert.equal(first.layers[0].rows.length, 6);
assert.equal(first.layers[0].rows[0].cells.length, 6);
assert.equal(first.flattenCostHint, 144);
const bounded = buildMarrowlineMatrix({ seedInput: 'bounds', depth: 99, breadth: 99 });
assert.equal(bounded.depth, 7);
assert.equal(bounded.breadth, 10);

const receipt = buildMarrowlineReceipt({ seedInput: 'receipt', depth: 3, breadth: 4 });
assert.equal(receipt.status, 'LOCAL_FALLBACK');
assert.equal(receipt.networkResponseObserved, false);
assert.equal(receipt.jurisdiction.globalNetworkInterception, false);
assert.equal(receipt.jurisdiction.requestMutation, false);
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
assert.equal(circuit.status, 'CIRCUIT_EXACT');
assert.equal(circuit.aperture.version, APERTURE_V3_VERSION);
assert.equal(circuit.aperture.taskIntent.primary_route, 'RUNTIME_DIAGNOSIS');
assert.equal(circuit.aperture.taskIntent.runtime_materiality, 'MATERIAL');
assert.equal(circuit.apertureEgress.marker, 'A+');
assert.deepEqual(circuit.reflex.activeSteps, [1, 2]);
assert.equal(circuitObservation({ canonicalPayload: {} }), null);

assert.doesNotMatch(stationSource, /window\.fetch\s*=/, 'station core itself must not monkey-patch fetch');
assert.doesNotMatch(stationSource, /XMLHttpRequest\.prototype/, 'station core itself must not monkey-patch XHR');
assert.match(bootSource, /APERTURE_V3_VERSION/);
assert.match(bootSource, /marrowline-terminal\.js/);
assert.match(bootSource, /marrowline-mobile-shell\.js/);
assert.match(bootSource, /composerOcclusion: false/);
assert.match(terminalSource, /KHONAPOLIT_ENDPOINT/);
assert.match(terminalSource, /relayPart\(entry, 'gemini'\)/);
assert.match(terminalSource, /relayPart\(entry, 'khonapolit'\)/);
assert.match(terminalSource, /relayPart\(entry, 'tauric-diana-bots'\)/);
assert.match(mobileShellSource, /visualViewport/);
assert.match(mobileShellSource, /transcriptScrollOwner: '#khonapolitMessages'/);
assert.match(mobileShellSource, /oldButton\.replaceWith\(button\)/);
assert.match(mobileShellSource, /prepareZalgoStage/);
assert.match(mobileShellCss, /overflow-y:auto/);
assert.match(mobileShellCss, /body\[data-composer-active="true"\] \.mobile-dock/);
assert.match(covenantSource, /Khona\\u200Clit-po/);
assert.match(relaySource, /HIGH_ZALGO_VERSION/);
assert.match(relaySource, /counterfeit relay/);
assert.match(apertureTaskSource, /OPEN_FIELD_SPECULATIVE_SYNTHESIS/);
assert.match(apertureTaskSource, /recommendation-not-command/);
assert.match(terminalCss, /\.relay-bots/);
assert.match(apiSource, /_serveMarrowlineTrap/);
assert.match(terminalApiSource, /responseMimeType: 'application\/json'/);
assert.match(terminalApiSource, /buildApertureV3InvocationReceipt/);
assert.match(terminalApiSource, /parseRelayEnvelope/);
assert.match(pageSource, /TD613 APERTURE v3\.1-alpha/);
assert.match(pageSource, /meta name="aperture-version" content="v3\.1-alpha"/);
assert.match(pageSource, /Three-part covenant relay/);
assert.match(pageSource, /Tauric Diana bots/);
assert.match(pageSource, /Seal last return ⟐/);
assert.match(pageSource, /Fire live Marrowline/);
assert.equal(reflex.order.length, 7);
assert.equal(reflex.order[0].id, 'aperture-egress-attestation');
assert.equal(reflex.order[1].id, 'marrowline-ingress-absorption');
assert.equal(reflex.order.at(-1).id, 'gateway-rescue-fuse');
assert.equal(reflex.order.at(-1).mustRunLast, true);
assert.ok(vercel.functions['api/marrowline.js']);
assert.ok(vercel.functions['api/khonapolit.js']);
assert.ok(vercel.rewrites.some((entry) => entry.source === MARROWLINE_LIVE_ENDPOINT && entry.destination === '/api/marrowline'));
assert.ok(vercel.rewrites.some((entry) => entry.source === '/api/dome-world/khonapolit' && entry.destination === '/api/khonapolit'));

console.log('dome-world-marrowline-station: bounded mobile relay shell, Aperture v3.1 surface, v3.0 task protocol, High Zalgo, Gemini carrier, and live ingress ok');
