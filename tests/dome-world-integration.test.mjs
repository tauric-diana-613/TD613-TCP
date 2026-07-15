import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync('app/dome-world/index.html', 'utf8');
const ashV08 = fs.readFileSync('app/dome-world/ash-custody-v08.html', 'utf8');
const ashAlias = fs.readFileSync('app/dome-world/ash-custody.html', 'utf8');
const domeShell = fs.readFileSync('api/dome-world-shell.js', 'utf8');
const api = fs.readFileSync('api/dome-world-engine.py', 'utf8');
const apiGuard = fs.readFileSync('api/dome-world-engine-guard.py', 'utf8');
const apiCommitment = fs.readFileSync('api/ash-local-commitment.py', 'utf8');
const commitmentGuard = fs.readFileSync('api/ash-local-commitment-guard.py', 'utf8');
const commitmentRuntime = fs.readFileSync('packages/dome_world_exact/ash_commitment_v08.py', 'utf8');
const receiptRuntime = fs.readFileSync('packages/dome_world_exact/ash_receipt_v08.py', 'utf8');
const phase2Runtime = apiCommitment + '\n' + commitmentRuntime + '\n' + receiptRuntime;
const localCommitment = fs.readFileSync('app/dome-world/ash/local-commitment.js', 'utf8');
const canonicalJson = fs.readFileSync('app/dome-world/ash/canonical-json.js', 'utf8');

for (const preservedSurface of [
  /\.weather-card/,
  /id="weatherCanvas"/,
  /\.weather-copy/,
  /\.lab-shell/,
  /\.lab-constellation/,
  /\.lab-node::before/,
  /\.lab-node::after/,
  /\.tab::before/,
  /\.tab::after/,
]) assert.match(html, preservedSurface);

assert.match(html, /class="dome-internal-stepper"/);
assert.match(html, /function stepDome\(delta\)/);
assert.doesNotMatch(html, /sleepToggle|>Sleep</);
const vercel = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
const vercelIgnore = fs.readFileSync('.vercelignore', 'utf8');
const gateway = fs.readFileSync('app/index.html', 'utf8');
const title = html.match(/<title>([^<]+)<\/title>/i)?.[1];
const nav = html.match(/<nav class="nav"[\s\S]*?<\/nav>/i)?.[0] || '';
const tabLabels = [...nav.matchAll(/<button class="tab(?: active)?" data-view="[^"]+"[^>]*>[\s\S]*?<span>([^<]+)<\/span><\/button>/g)].map((match) => match[1]);
const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);

assert.equal(title, 'Dome-World');
assert.deepEqual(tabLabels, ['Weather', 'Rooms', 'Lab', 'Ash', 'Substrate', 'Phason', 'Aperture', 'Receipts']);
assert.equal((html.match(/class="view(?: active)? primary-view"/g) || []).length, 7);
assert.equal((html.match(/class="view-intro"/g) || []).length, 7);
assert.match(html, /data-sigil="米"/);
assert.match(html, /data-glyph="hõt"/);
assert.equal(new Set(ids).size, ids.length);
for (const id of ['liveCanvas', 'tomoCanvas', 'exactCoords', 'trainerOperatorToken', 'trainerGateStatus', 'substrateApiStatus', 'substrateExactStatus', 'trainerRuntimeStatus']) assert.ok(ids.includes(id));
for (const id of ['compileBridge', 'readApertureHandoff', 'copyBridge', 'bridgePre']) assert.ok(ids.includes(id));
assert.match(html, /reciprocal receipt membrane/);
assert.match(html, /td613\.flowcore\.context-receipt\/vNext/);
assert.match(html, /reciprocal-receipt-not-reciprocal-authority-or-aperture-execution/);
assert.match(api, /context-receipt-returned-for-aperture-audit/);
assert.match(api, /recommendation_not_command/);
assert.match(api, /artifact_reference": None/);
assert.ok(!ids.includes('ashText'), 'public Ash route must not expose raw sensitive-text intake');
assert.match(html, /function renderActiveView\(/);
assert.doesNotMatch(html, /function renderAll\(/);
assert.ok(html.includes('generateWitnessReceipt,computeGradientMisfit,computeHeterostratigraphicPotential,computeRepoWeather,generateLiveLatticeSeed'));
assert.match(html, /canvas\.width!==width\|\|canvas\.height!==height/);
assert.match(html, /if\(activeView!==\'live\' \|\| document\.hidden\) return/);
assert.match(html, /if\(!renderer\|\|!canvas\|\|document\.hidden\|\|!viewportVisible\)return/);
assert.match(html, /rawExactCoordinatesExported:false|raw_exact_coordinates_allowed:\s*false/);

assert.match(api, /MAX_BODY_BYTES = 131_072/);
assert.match(api, /DOME_WORLD_TRAINER_ENABLED/);
assert.match(api, /DOME_WORLD_CHECKPOINT_SECRET/);
assert.match(apiGuard, /DELEGATED_CUSTODY_OPERATIONS/);
assert.match(apiGuard, /ash-custody-migrate/);
assert.match(apiGuard, /owned exclusively by/);
assert.match(html, /sessionStorage\.setItem\(TRAINER_TOKEN_SESSION_KEY,token\)/);
assert.doesNotMatch(html, /localStorage\.setItem\(TRAINER_TOKEN_SESSION_KEY/);
assert.doesNotMatch(html, /payload\.operatorToken|operatorToken:trainerOperatorToken/);

assert.match(phase2Runtime, /td613\.ash\.canonical-digest-readiness\/v0\.8/);
assert.match(phase2Runtime, /ash-custody-migrate/);
assert.match(phase2Runtime, /compute_manifest_digest/);
assert.match(phase2Runtime, /compute_receipt_digest/);
assert.match(phase2Runtime, /metadataDigestFallback": False/);
assert.match(commitmentGuard, /v0\.8-guarded/);
assert.match(commitmentGuard, /network_operation_performed_by_module=false/);
assert.match(commitmentGuard, /raw_bytes_persisted_by_module=false/);
assert.doesNotMatch(ashV08, /sha256:manual-placeholder/);
assert.match(ashV08, /verifyReceiptDigests/);
assert.match(ashV08, /Cinder plaintext transport remains disabled until Phase 6/);
assert.doesNotMatch(ashV08, /domeRequest\("ash-cinder"/);
assert.doesNotMatch(ashV08, /innerHTML\s*=/);
assert.doesNotMatch(ashV08, /claimCeiling|claim_ceiling/);
assert.match(ashAlias, /ash-custody-v08\.html/);
assert.match(localCommitment, /createLatestCommitmentCoordinator/);
assert.doesNotMatch(localCommitment, /fetch\(|XMLHttpRequest|WebSocket/);
assert.match(canonicalJson, /td613\.ash\.canonical-json\/v0\.1/);
assert.doesNotMatch(canonicalJson, /fetch\(|XMLHttpRequest|WebSocket/);

const rewrite = (source, destination) => assert.ok(vercel.rewrites.some((entry) => entry.source === source && entry.destination === destination), `${source} -> ${destination}`);
rewrite('/dome-world', '/api/dome-world-shell');
rewrite('/dome-world/', '/api/dome-world-shell');
rewrite('/app/dome-world/index.html', '/api/dome-world-shell');
rewrite('/dome-world/ash-custody.html', '/app/dome-world/ash-custody-v08.html');
rewrite('/api/dome-world/ash-custody-register', '/api/ash-local-commitment-guard');
rewrite('/api/dome-world/ash-custody-replay', '/api/ash-local-commitment-guard');
rewrite('/api/dome-world/ash-custody-migrate', '/api/ash-local-commitment-guard');
rewrite('/api/dome-world-engine', '/api/dome-world-engine-guard');
rewrite('/api/ash-local-commitment', '/api/ash-local-commitment-guard');
assert.ok(vercel.rewrites.some((entry) => entry.source === '/api/dome-world/(.*)' && entry.destination.includes('/api/dome-world-engine-guard')));
assert.ok(!vercel.rewrites.some((entry) => String(entry.destination).includes('local-commitment-v071.js')));
const domeShellIncludes = String(vercel.functions['api/dome-world-shell.js'].includeFiles || '');
assert.match(domeShellIncludes, /^\{?app\/dome-world\//);
for (const requiredFile of ['index.html', 'ash-keep.html', 'ash-keep.js']) {
  assert.ok(domeShellIncludes.includes(requiredFile), `Dome shell must package ${requiredFile}`);
}
assert.match(domeShell, /data-glyph="∴"/);
assert.match(domeShell, /\/dome-world\/marrowline\.html/);
assert.match(domeShell, /<span><b>11<\/b>stations<\/span>/);
assert.match(vercel.functions['api/ash-local-commitment.py'].includeFiles, /ash_\*\.py/);
assert.match(vercel.functions['api/ash-local-commitment-guard.py'].includeFiles, /ash_\*\.py/);
assert.match(vercelIgnore, /packages\/dome_world_exact\/verification\//);
assert.match(vercelIgnore, /packages\/dome_world_exact\/tests\//);
assert.ok(!gateway.includes('href="./dome-world'), 'Dome-World remains outside public navigation');

console.log('dome-world-integration.test.mjs passed');
