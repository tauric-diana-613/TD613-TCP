import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync('app/dome-world/index.html', 'utf8');
const ashV07 = fs.readFileSync('app/dome-world/ash-custody-v07.html', 'utf8');
const api = fs.readFileSync('api/dome-world-engine.py', 'utf8');
const apiV07 = fs.readFileSync('api/dome-world-engine-v07.py', 'utf8');

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
]) {
  assert.match(html, preservedSurface);
}
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

assert.equal(title, 'Dome-World / Flow-Core v0.5.0');
assert.equal(tabLabels.length, 8);
assert.deepEqual(
  tabLabels,
  ['Weather', 'Rooms', 'Lab', 'Ash', 'Substrate', 'Phason', 'Aperture', 'Receipts']
);
assert.equal((html.match(/class="view(?: active)? primary-view"/g) || []).length, 7);
assert.equal((html.match(/class="view-intro"/g) || []).length, 7);
assert.match(html, /data-sigil="米"/);
assert.match(html, /data-glyph="hõt"/);
assert.equal(new Set(ids).size, ids.length);
assert.ok(ids.includes('liveCanvas'));
assert.ok(ids.includes('tomoCanvas'));
assert.ok(ids.includes('exactCoords'));
assert.ok(ids.includes('trainerOperatorToken'));
assert.ok(ids.includes('trainerGateStatus'));
assert.ok(ids.includes('substrateApiStatus'));
assert.ok(ids.includes('substrateExactStatus'));
assert.ok(ids.includes('trainerRuntimeStatus'));
assert.ok(!ids.includes('ashText'), 'public Ash route must not expose raw sensitive-text intake');
assert.match(html, /function renderActiveView\(/);
assert.doesNotMatch(html, /function renderAll\(/);
assert.ok(
  html.includes('generateWitnessReceipt,computeGradientMisfit,computeHeterostratigraphicPotential,computeRepoWeather,generateLiveLatticeSeed'),
  'DomeCore exports every active heterostratigraphic and repository-weather function'
);
assert.match(html, /canvas\.width!==width\|\|canvas\.height!==height/);
assert.match(html, /if\(activeView!==\'live\' \|\| document\.hidden\) return/);
assert.match(html, /if\(!renderer\|\|!canvas\|\|document\.hidden\|\|!viewportVisible\)return/);
assert.match(html, /rawExactCoordinatesExported:false|raw_exact_coordinates_allowed:\s*false/);
assert.match(api, /MAX_BODY_BYTES = 131_072/);
assert.match(api, /DOME_WORLD_TRAINER_ENABLED/);
assert.match(api, /DOME_WORLD_CHECKPOINT_SECRET/);
assert.match(html, /trainerOperatorToken/);
assert.match(html, /authorization/);
assert.match(html, /Bearer /);
assert.match(html, /sessionStorage\.setItem\(TRAINER_TOKEN_SESSION_KEY,token\)/);
assert.match(html, /fetch\('\/api\/dome-world\/readiness'/);
assert.match(html, /body\.trainerEnabled\?'Trainer live':'Trainer dark'/);
assert.doesNotMatch(html, /localStorage\.setItem\(TRAINER_TOKEN_SESSION_KEY/);
assert.doesNotMatch(html, /payload\.operatorToken|operatorToken:trainerOperatorToken/);
assert.match(api, /Ash custody accepts metadata\/manifests only; raw content fields are prohibited/);
assert.match(apiV07, /metadataDigestFallback": False/);
assert.match(apiV07, /L1_BROWSER_LOCAL_ARTIFACT_DIGEST/);
assert.doesNotMatch(ashV07, /sha256:manual-placeholder/);
assert.match(ashV07, /generateLocalCommitment/);
assert.ok(vercel.rewrites.some((entry) => entry.source === '/dome-world' && entry.destination === '/app/dome-world/index.html'));
assert.ok(vercel.rewrites.some((entry) => entry.source === '/dome-world/ash-custody.html' && entry.destination === '/app/dome-world/ash-custody-v07.html'));
assert.ok(vercel.rewrites.some((entry) => entry.source === '/api/dome-world/(.*)' && entry.destination.includes('/api/dome-world-engine-v07')));
assert.match(vercelIgnore, /packages\/dome_world_exact\/verification\//);
assert.match(vercelIgnore, /packages\/dome_world_exact\/tests\//);
assert.ok(!gateway.includes('href="./dome-world'), 'Dome-World remains outside public navigation');

console.log('dome-world-integration.test.mjs passed');
