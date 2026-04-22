import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const harborMainSource = fs.readFileSync(path.join(repoRoot, 'app', 'safe-harbor', 'app', 'main.js'), 'utf8');
const harborHtmlSource = fs.readFileSync(path.join(repoRoot, 'app', 'safe-harbor', 'index.html'), 'utf8');

assert.ok(
  harborMainSource.includes('function shiNumberPattern()'),
  'Safe Harbor derives SHI validation from the declared format instead of a hardcoded fragment'
);
assert.ok(
  !harborMainSource.includes('/^TD613-SH-9B07D8B-[A-F0-9]{8}$/u'),
  'Safe Harbor no longer hardcodes a single SHI binding fragment into the validator'
);
assert.ok(
  harborMainSource.includes('const available = issued || recoverable || null;'),
  'Safe Harbor treats a recoverable issued SHI as a live surface value'
);
assert.ok(
  harborMainSource.includes('dom.copyShiNumber.disabled = !available;'),
  'SHI copy controls stay usable whenever an issued SHI is still recoverable in session'
);
assert.ok(
  harborMainSource.includes('dom.bypassIngress.disabled = surfaceIsOpen || !typedShiValid;'),
  'Reopen with SHI stays disabled until a real SHI value is entered'
);
assert.ok(
  !harborMainSource.includes('recallReady || isShiNumber'),
  'SHI reopen readiness no longer advertises a live path without an entered code'
);
assert.ok(
  harborMainSource.includes("state.ingress.operatorShellOpen = true;") &&
    harborMainSource.includes("state.ingress.bypass = true;") &&
    harborMainSource.includes("logEvent('bypass-opened'"),
  'A recognized SHI can now actually open the packetless operator shell instead of leaving Harbor trapped behind the membrane'
);
assert.ok(
  harborMainSource.includes("reason: 'valid-shi-blind-recall'"),
  'A valid SHI can now open the operator shell even when no retained packet or stored recall hash is present'
);
assert.ok(
  harborMainSource.includes('function buildOperatorSignatureFromInputs()'),
  'Safe Harbor stages raw signature text through one shared input-to-artifact path'
);
assert.ok(
  harborMainSource.includes('state.operatorSignature = buildOperatorSignatureFromInputs();'),
  'Mint / Seal Payload reuses the raw signature text directly from the current input fields'
);
assert.ok(
  !harborMainSource.includes('signature-seal-required'),
  'Safe Harbor no longer blocks export readiness on a browser-side signature gate'
);
assert.ok(
  harborMainSource.includes('packet.bridge.export_gate.ready = Boolean(packet.bridge.covenant_gate.confirmed && scrub.passed);'),
  'Export readiness now depends on covenant plus scrub only, not detached-signature presence'
);
assert.ok(
  harborHtmlSource.includes('id="kleopatra-void"') &&
    harborHtmlSource.includes('Paste detached PGP signature block here') &&
    !harborHtmlSource.includes('inputSigKid') &&
    !harborHtmlSource.includes('inputSigType') &&
    !harborHtmlSource.includes('inputSigDetachedRef'),
  'Safe Harbor reduces the signature lane to a single detached-signature void without key-id or type inputs'
);
assert.ok(
  harborHtmlSource.includes('Mint / Seal Payload'),
  'Safe Harbor labels the final action as Mint / Seal Payload'
);
assert.ok(
  harborMainSource.includes('function isLocalhostOperator()') &&
    harborMainSource.includes('if (isLocalhostOperator()) {'),
  'Safe Harbor auto-opens the vault when it is served from localhost through the dedicated host check'
);
assert.ok(
  harborMainSource.includes('function localhostTriadPreviewOpen()') &&
    harborMainSource.includes('const membraneSuppressed = surfaceIsOpen && !operatorPreview;') &&
    harborMainSource.includes("dom.body.classList.toggle('localhost-operator', isLocalhostOperator());"),
  'Safe Harbor keeps localhost operator convenience while restoring the triad membrane as a live public-facing surface'
);
assert.ok(
  harborMainSource.includes('if (!isLocalhostOperator()) return;'),
  'Safe Harbor keeps stored auto-bypass behavior limited to localhost instead of public hosts'
);
assert.ok(
  harborHtmlSource.includes('<div id="ingressMembrane" class="ingress-membrane" data-td613-skip="true">') &&
    !harborHtmlSource.includes('<div id="ingressMembrane" class="ingress-membrane" data-td613-skip="true" hidden>'),
  'Safe Harbor restores the ingress membrane in the live markup instead of fossilizing it behind a hardcoded hidden attribute'
);
assert.ok(
  harborHtmlSource.includes('Tauric Diana Intake') &&
    harborHtmlSource.includes('Stage Vanguard Batch') &&
    harborHtmlSource.includes('Reset Staged Batch') &&
    harborHtmlSource.includes('batch-001a') &&
    harborHtmlSource.includes('batch-002a') &&
    harborHtmlSource.includes('batch-003a') &&
    harborHtmlSource.includes('batch-004a') &&
    !harborHtmlSource.includes('batch-001d') &&
    !harborHtmlSource.includes('batch-004c'),
  'Safe Harbor exposes the vanguard A-line intake plus a reset path in the center chamber'
);
assert.ok(
  harborHtmlSource.includes('id="kleopatra-void"') &&
    harborHtmlSource.includes('id="attachSignature"') &&
    harborHtmlSource.includes('Wake Secret Lane') &&
    harborHtmlSource.includes('Clear Seal Lane'),
  'Safe Harbor moves the detached Kleopatra seal lane into the Tauric Diana intake card and gives it explicit wake/clear controls'
);
assert.ok(
  harborMainSource.includes('selected_batch_id: state.selectedBatchId || null'),
  'Safe Harbor carries the selected batch id into the staged packet metadata'
);
assert.ok(
  harborMainSource.includes("if (dom.resetStagedBatch) dom.resetStagedBatch.addEventListener('click', clearStagedBatch);") &&
    harborMainSource.includes("logEvent('batch-unstaged'"),
  'Safe Harbor lets operator mode clear a staged batch and reopen the intake lane without resetting the whole session'
);
assert.ok(
  harborMainSource.includes('if (!fingerprint) return null;') &&
    harborMainSource.includes('Number(signatures[key].word_count || 0) >= MIN_LANE_WORDS') &&
    !harborMainSource.includes(": [packet || '', receipt || '', bindingFragment(), payloadIndex == null ? '' : String(payloadIndex), attestationDate || '', principal || '', requestId || ''].join('|');"),
  'Safe Harbor mints SHI only from a real triad stylometric fingerprint and no longer falls back to packet or receipt metadata'
);
assert.ok(
  !harborMainSource.includes("state.ingress.segments.future_self = 'Batch ") &&
    !harborMainSource.includes("state.ingress.segments.past_self = 'Batch ") &&
    !harborMainSource.includes("state.ingress.segments.higher_self = 'Batch "),
  'Stage Vanguard Batch no longer fabricates the Future/Past/Higher triad with canned batch text'
);
assert.ok(
  harborMainSource.includes("if (state.ingress.packetId) void rebuild('ingress');") &&
    harborMainSource.includes("logEvent('covenant-blocked', { reason: 'triad-fingerprint-missing' });"),
  'Safe Harbor refreshes staged packets when the triad changes and blocks SHI minting when the triad fingerprint is still missing'
);
assert.ok(
  harborMainSource.includes("await fetch('/__td613/seal-batch'") &&
    harborMainSource.includes("logEvent('batch-sealed-to-disk'"),
  'Safe Harbor can pass a localhost-minted batch into the operator seal endpoint and log the disk-write event'
);

console.log('safe-harbor-shi.test.mjs passed');
