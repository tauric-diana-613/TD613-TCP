import assert from 'node:assert/strict';
import fs from 'node:fs';

const path = 'app/dome-world/previews/a16-r0/holonomy-loom-local-pocket.html';
const source = fs.readFileSync(path, 'utf8');

assert.match(source, /Holonomy Loom/, 'Pocket surface must expose the Holonomy Loom name.');
assert.match(source, /Before you send it, check what this message carries\./, 'Child-legible purpose must precede technical vocabulary.');
assert.match(source, /connect-src 'none'/, 'Layer 0 must deny outbound network connections by CSP.');
assert.match(source, /default-src 'none'/, 'Layer 0 must deny undeclared external resources by default.');
assert.doesNotMatch(source, /<script\s+[^>]*src=/i, 'Pocket Loom may not load external scripts.');
assert.doesNotMatch(source, /<link\s+[^>]*href=/i, 'Pocket Loom may not load external styles or resources.');
assert.doesNotMatch(source, /https?:\/\//i, 'Pocket Loom v0.1 may not embed remote URLs.');
assert.doesNotMatch(source, /\/api\//i, 'Pocket Loom v0.1 may not depend on a server API route.');
assert.doesNotMatch(source, /GEMINI_API_KEY|generativelanguage\.googleapis\.com/i, 'Layer 0 may not require or call Gemini.');
assert.doesNotMatch(source, /localStorage|sessionStorage|indexedDB/i, 'Pocket Loom v0.1 may not silently persist the draft.');

for (const marker of [
  'PRIVATE_KEY',
  'GOOGLE_API_KEY',
  'GITHUB_TOKEN',
  'BEARER_TOKEN',
  'JWT',
  'EMAIL',
  'PHONE',
  'USER_PROTECTED_EXACT',
  'MANUAL_ROUTE_CONTEXT'
]) {
  assert.match(source, new RegExp(marker), `Local protection marker ${marker} must remain present.`);
}

assert.match(source, /currentReleaseAllowed = !findings\.some\(f => f\.severity === 'RED'\)/, 'A RED finding must close the Loom-controlled copy door.');
assert.match(source, /if \(!currentReleaseAllowed\)/, 'Copy path must re-check release authority.');
assert.match(source, /draftEl\.value !== lastCheckedText/, 'Changed text must invalidate a prior check before copy.');
assert.match(source, /copyButton\.disabled = true/, 'Draft/rule changes must relock the copy door.');
assert.match(source, /window\.fetch = blockedNetwork/, 'Fetch attempts must fail locally.');
assert.match(source, /XMLHttpRequest\.prototype\.open = blockedNetwork/, 'XHR attempts must fail locally.');
assert.match(source, /navigator\.sendBeacon = blockedNetwork/, 'Beacon attempts must fail locally.');
assert.match(source, /network_required:false/, 'Runtime receipt must declare network independence.');
assert.match(source, /remote_model_required:false/, 'Runtime receipt must declare model independence.');
assert.match(source, /automatic_persistence:false/, 'Runtime receipt must declare persistence closed.');
assert.match(source, /hard_release_gate:true/, 'Runtime receipt must expose the bounded hard release gate.');
assert.match(source, /route_context_source:'human-declared-only'/, 'Route context must remain human-declared rather than resemblance-inferred.');

assert.match(source, /Green means:[\s\S]*none of the protection rules currently turned on matched this draft/i, 'GREEN must remain rule-bounded rather than universal safety language.');
assert.match(source, /It does not mean zero privacy risk\./, 'GREEN must explicitly refuse a zero-risk claim.');
assert.match(source, /The Loom can control what it lets leave its own door\. It cannot control every room the message enters afterward\./, 'Downstream-system claim ceiling must remain child-legible.');
assert.match(source, /Gemini can be offered later as an explicit, optional helper/, 'Gemini must remain an optional later layer, not a hidden Layer-0 dependency.');
assert.match(source, /The Loom will not guess provenance from resemblance\./, 'Holonomy route-memory UI must refuse resemblance-to-provenance promotion.');

const forbiddenWorkflow = '.github/workflows/holonomy-loom-local-pocket.yml';
assert.equal(fs.existsSync(forbiddenWorkflow), false, 'Local-pocket evidence may not create a fifth durable workflow.');
const wrapper = fs.readFileSync('scripts/ash-a15-r0-preview-probe.mjs', 'utf8');
const inheritedCore = fs.readFileSync('scripts/ash-a15-r0-preview-probe-core.mjs', 'utf8');
const consolidated = fs.readFileSync('.github/workflows/td613-ci.yml', 'utf8');
assert.match(wrapper, /await import\('\.\/ash-a15-r0-preview-probe-core\.mjs'\)/, 'Lawful wrapper must run the inherited A15-R0 preview witness first.');
assert.match(wrapper, /await import\('\.\/holonomy-loom-local-pocket-browser-probe\.mjs'\)/, 'Lawful wrapper must run the pocket probe inside the inherited per-engine calibration path.');
assert.match(wrapper, /holonomy-loom-local-pocket/, 'Pocket artifact must be nested beneath the existing calibration artifact root.');
assert.match(inheritedCore, /td613\.ash\.a15-r0\.browser-preview-evidence\/v0\.3-semantic-action-settlement/, 'Inherited A15-R0 browser witness must remain materialized as a separate byte-preserving core.');
assert.match(consolidated, /TD613_ARTIFACT_DIR="artifacts\/\$browser\/calibration\/a15-r0"[\s\S]*node scripts\/ash-a15-r0-preview-probe\.mjs/, 'Existing consolidated three-engine calibration must remain the pocket witness carrier.');

console.log('A16-R0 Holonomy Loom local-pocket hostile contract passed.');
