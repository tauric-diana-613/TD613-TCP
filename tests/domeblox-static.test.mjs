import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const station = path.resolve(here, '../app/dome-world/domeblox');
const read = relative => fs.readFileSync(path.join(station, relative), 'utf8');

for (const file of ['domeblox-hooks.js', 'domeblox-core.js']) {
  new vm.Script(read(file), { filename: file });
}

const html = read('index.html');
for (const id of [
  'sourceNucleus','buildFamily','runAssay','runMoire','compileConsequence',
  'gameList','ledgerView','assayPosture','registryPosture','handoffStatus'
]) {
  if (!html.includes(`id="${id}"`)) throw new Error(`missing ${id}`);
}
if (!html.includes('Content-Security-Policy')) throw new Error('CSP missing');
if (!html.includes(String.fromCodePoint(0x10D613))) throw new Error('exact U+10D613 scalar missing');
if (html.includes('𐌀')) throw new Error('wrong placeholder glyph restored');

for (const match of html.matchAll(/(?:src|href)="(\.\/[^"#?]+)"/g)) {
  const relative = match[1].replace(/^\.\//, '');
  if (!fs.existsSync(path.join(station, relative))) throw new Error(`broken local reference: ${relative}`);
}

const core = read('domeblox-core.js');
if (!core.includes('source_nucleus: source')) throw new Error('invariant source field absent');
if (!core.includes('packet_text: packetText')) throw new Error('packet text separation absent');
if (core.includes('list.innerHTML=DB.getGames')) throw new Error('manifest XSS seam restored');
if (!core.includes('ABSTAIN_INSUFFICIENT_COVERAGE')) throw new Error('coverage abstention missing');
if (!core.includes('sessionStorage')) throw new Error('tab-local recovery missing');

const gameIndex = JSON.parse(read('games/index.json'));
if (gameIndex.schema !== 'td613.domeblox.game-index/v1') throw new Error('bad game index schema');
for (const relative of gameIndex.manifests) {
  const manifest = JSON.parse(read(relative.replace(/^\.\//, '')));
  if (manifest.schema !== 'td613.domeblox.game-manifest/v1') throw new Error(`bad manifest ${relative}`);
}

const events = [];
const context = {
  console,
  CustomEvent: class { constructor(type, options) { this.type = type; this.detail = options?.detail; } },
  window: {
    dispatchEvent(event) { events.push(event); },
  },
};
vm.createContext(context);
vm.runInContext(read('domeblox-hooks.js'), context);
const DB = context.window.TD613_DOME_BLOX;
const manifest = JSON.parse(read('games/forward-battery.json'));
DB.registerGame(manifest);
let duplicateRejected = false;
try { DB.registerGame(manifest); } catch { duplicateRejected = true; }
if (!duplicateRejected) throw new Error('duplicate game registration was not rejected');
DB.registerAssay('test.assay', input => input);
let assayDuplicateRejected = false;
try { DB.registerAssay('test.assay', input => input); } catch { assayDuplicateRejected = true; }
if (!assayDuplicateRejected) throw new Error('duplicate assay registration was not rejected');

const handoff = JSON.parse(read('handoff-manifest.json'));
if (handoff.distribution !== 'separate operator handoff; browser station stores metadata only') throw new Error('handoff distribution drift');
if (!(handoff.sha256 === 'SEE_SIBLING_ZIP_SHA256_SIDECAR' || /^[a-f0-9]{64}$/.test(handoff.sha256))) throw new Error('handoff digest must be external marker or final SHA-256');

console.log('DomeBlox static contract PASS');

// Temporary production observation lane. This branch is never merged.
const LIVE_BASE = 'https://td613.com/dome-world/domeblox/';
const exactScalar = String.fromCodePoint(0x10D613);

async function liveFetch(relative = '') {
  const url = new URL(relative, LIVE_BASE);
  const response = await fetch(url, {
    redirect: 'follow',
    headers: {
      'user-agent': 'TD613-DomeBlox-Deployed-Observation/1.1',
      'cache-control': 'no-cache',
    },
    signal: AbortSignal.timeout(20_000),
  });
  const body = await response.text();
  if (response.status !== 200) {
    throw new Error(`live fetch failed ${response.status}: ${url}`);
  }
  if (!body.trim()) throw new Error(`live response empty: ${url}`);
  return { response, body, url: response.url };
}

const liveIndex = await liveFetch('');
if (!liveIndex.url.includes('/dome-world/domeblox')) throw new Error(`unexpected final route: ${liveIndex.url}`);
if (!liveIndex.body.includes('<title>DomeBlox · Counter-Adversarial Bastion</title>')) throw new Error('live title missing');
if (!liveIndex.body.includes('Content-Security-Policy')) throw new Error('live CSP missing');
if (!liveIndex.body.includes(exactScalar)) throw new Error('live exact U+10D613 scalar missing');
if (liveIndex.body.includes('𐌀')) throw new Error('live wrong placeholder glyph present');
for (const id of ['sourceNucleus','runAssay','runMoire','compileConsequence','gameList','ledgerView']) {
  if (!liveIndex.body.includes(`id="${id}"`)) throw new Error(`live DOM missing ${id}`);
}

const liveAssets = {
  'domeblox.css': 'text/css',
  'domeblox-hooks.js': 'javascript',
  'domeblox-core.js': 'javascript',
  'games/index.json': 'json',
  'games/domeworld-roblox.json': 'json',
  'games/forward-battery.json': 'json',
  'games/GAME_TEMPLATE.json': 'json',
  'handoff-manifest.json': 'json',
  'ROUTE_READINESS.json': 'json',
  'CLAIM_CEILING.md': '',
  'CONTRIBUTORS.md': '',
};

const fetched = new Map();
for (const [relative, typeHint] of Object.entries(liveAssets)) {
  const asset = await liveFetch(relative);
  const contentType = asset.response.headers.get('content-type') || '';
  if (typeHint && !contentType.toLowerCase().includes(typeHint)) {
    throw new Error(`unexpected content type for ${relative}: ${contentType}`);
  }
  fetched.set(relative, asset.body);
}

for (const script of ['domeblox-hooks.js', 'domeblox-core.js']) {
  new vm.Script(fetched.get(script), { filename: `live:${script}` });
}

const liveGameIndex = JSON.parse(fetched.get('games/index.json'));
if (liveGameIndex.schema !== 'td613.domeblox.game-index/v1') throw new Error('live game index schema drift');
if (!Array.isArray(liveGameIndex.manifests) || liveGameIndex.manifests.length < 2) throw new Error('live game index incomplete');
for (const relative of liveGameIndex.manifests) {
  const key = relative.replace(/^\.\//, 'games/');
  const loaded = fetched.get(key) || (await liveFetch(key)).body;
  const game = JSON.parse(loaded);
  if (game.schema !== 'td613.domeblox.game-manifest/v1') throw new Error(`live game manifest drift: ${key}`);
}

const liveHandoff = JSON.parse(fetched.get('handoff-manifest.json'));
if (liveHandoff.distribution !== 'separate operator handoff; browser station stores metadata only') {
  throw new Error('live handoff distribution drift');
}
const liveReadiness = JSON.parse(fetched.get('ROUTE_READINESS.json'));
if (!String(liveReadiness.status || '').includes('PATCHED_READY_FOR_OPERATOR_REVIEW')) {
  throw new Error(`unexpected live readiness: ${liveReadiness.status}`);
}
if (!fetched.get('CLAIM_CEILING.md').includes('ABSTAIN_INSUFFICIENT_COVERAGE')) {
  throw new Error('live claim-ceiling coverage abstention missing');
}
if (!fetched.get('CONTRIBUTORS.md').includes('Erin / Pally / Potato')) {
  throw new Error('live contributor provenance missing');
}

console.log(JSON.stringify({
  schema: 'td613.domeblox.deployed-browser-surface-observation/v1',
  url: LIVE_BASE,
  status: 'PASS',
  final_url: liveIndex.url,
  title: 'DomeBlox · Counter-Adversarial Bastion',
  exact_u10d613_present: true,
  dependent_assets_verified: Object.keys(liveAssets).length,
  game_manifests_verified: liveGameIndex.manifests.length,
  javascript_parse: 'PASS',
  authority: 'external GitHub runner observation; no user data submitted',
}, null, 2));
