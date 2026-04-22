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
  harborMainSource.includes('dom.bypassIngress.disabled = surfaceIsOpen;') &&
    harborMainSource.includes("dom.ingressNote.textContent = 'Safe Harbor recall requires a minted SHI # in the form ' + shiFormatTemplate() + '.';"),
  'Reopen with SHI now stays clickable on the membrane and explains what is missing instead of feeling dead'
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
  harborMainSource.includes("reason: 'missing-recall-hash'") &&
    !harborMainSource.includes("reason: 'valid-shi-blind-recall'"),
  'Safe Harbor no longer accepts a format-valid SHI as blind recall when no live recall hash or recoverable packet exists'
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
    harborMainSource.includes('return host === \'localhost\' || host === \'127.0.0.1\';'),
  'Safe Harbor still has a dedicated localhost operator host check'
);
assert.ok(
  !harborMainSource.includes('function localhostTriadPreviewOpen()') &&
    harborMainSource.includes('const membraneSuppressed = surfaceIsOpen;') &&
    !harborMainSource.includes("dom.body.classList.toggle('localhost-operator', isLocalhostOperator());"),
  'Safe Harbor restores the membrane as a full overlay on localhost instead of leaving the chamber half-open underneath it'
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
  harborMainSource.includes('function evaluateTriadIssuance(signatures = null)') &&
    harborMainSource.includes('blockingReason') &&
    harborMainSource.includes('wordCounts') &&
    harborMainSource.includes('shortfalls') &&
    harborMainSource.includes('thresholdSatisfied'),
  'Safe Harbor centralizes SHI minting into one triad issuance evaluator with explicit blocking data'
);
assert.ok(
  harborMainSource.includes("badge_state: badgeAssignment ? 'assigned' : (triadIssuance.thresholdSatisfied ? 'not-assigned' : 'blocked-triad-threshold')") &&
    harborMainSource.includes('blocking_reason: badgeAssignment ? null : triadIssuance.blockingReason') &&
    harborMainSource.includes('triad_word_counts: triadIssuance.wordCounts') &&
    harborMainSource.includes('triad_shortfalls: triadIssuance.shortfalls'),
  'Safe Harbor packets expose SHI badge state, blocking reason, and triad threshold diagnostics explicitly'
);
assert.ok(
  harborMainSource.includes("dom.shiMintState.textContent = issued") &&
    harborMainSource.includes("'not minted / triad blocked'") &&
    harborMainSource.includes('SHI issuance is blocked.') &&
    harborMainSource.includes('issuance.blocking_reason'),
  'Safe Harbor surfaces blocked SHI mint state and the exact triad reason instead of pretending the template is issued'
);
assert.ok(
  harborMainSource.includes('dom.setBypassToken.disabled = surfaceIsOpen;') &&
    harborMainSource.includes('Only the currently minted SHI # can be rebound to this session.'),
  'Safe Harbor only allows explicit SHI recall rebinding from the actually minted SHI value'
);
assert.ok(
  harborMainSource.includes("That page is still below the stylometric threshold. Add ' + shortfall + ' more words to continue.") &&
    harborMainSource.includes("The triad is incomplete. Resolve Future, Past, and Higher before minting the staged packet.") &&
    harborMainSource.includes("Walk through to the seal step before minting the staged packet."),
  'Ingress buttons now explain their gating conditions when clicked instead of failing silently behind disabled states'
);
assert.ok(
  !harborMainSource.includes("state.ingress.segments.future_self = 'Batch ") &&
    !harborMainSource.includes("state.ingress.segments.past_self = 'Batch ") &&
    !harborMainSource.includes("state.ingress.segments.higher_self = 'Batch "),
  'Stage Vanguard Batch no longer fabricates the Future/Past/Higher triad with canned batch text'
);
assert.ok(
  harborMainSource.includes("if (state.ingress.packetId) void rebuild('ingress');") &&
    harborMainSource.includes("logEvent('covenant-blocked', {") &&
    harborMainSource.includes("reason: 'triad-fingerprint-missing'"),
  'Safe Harbor refreshes staged packets when the triad changes and blocks SHI minting when the triad fingerprint is still missing'
);
assert.ok(
  harborMainSource.includes("await fetch('/__td613/seal-batch'") &&
    harborMainSource.includes("logEvent('batch-sealed-to-disk'"),
  'Safe Harbor can pass a localhost-minted batch into the operator seal endpoint and log the disk-write event'
);

console.log('safe-harbor-shi.test.mjs passed');
