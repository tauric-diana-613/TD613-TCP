import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const station = path.resolve(here, '../app/dome-world/domeblox');
const read = relative => fs.readFileSync(path.join(station, relative), 'utf8');
const exists = relative => fs.existsSync(path.join(station, relative));
const canonical = String.fromCodePoint(0x10D613);

// Principal route must be the playable game, not the Forward Battery dashboard.
const gameHtml = read('index.html');
if (!gameHtml.includes('<title>DomeBlox · Play Dome-World</title>')) throw new Error('playable title missing');
if (!gameHtml.includes('type="module" src="./game/main.js"')) throw new Error('playable module entry missing');
for (const id of [
  'gameCanvas','bootPanel','enterGame','hud','interactionCard','mapPanel',
  'springaldPanel','touchControls','worldClock','inventory','objectiveText'
]) {
  if (!gameHtml.includes(`id="${id}"`)) throw new Error(`playable DOM missing ${id}`);
}
if (!gameHtml.includes('Content-Security-Policy')) throw new Error('playable CSP missing');
if (gameHtml.includes("frame-ancestors 'self'")) throw new Error('unsupported meta frame-ancestors directive restored');
if (!gameHtml.includes(canonical)) throw new Error('exact U+10D613 scalar missing from playable route');
if (gameHtml.includes('𐌀')) throw new Error('wrong placeholder glyph restored');
for (const match of gameHtml.matchAll(/(?:src|href)="(\.\/[^"#?]+)"/g)) {
  const relative = match[1].replace(/^\.\//, '');
  if (!exists(relative)) throw new Error(`broken playable reference: ${relative}`);
}

for (const file of ['game/core.js','game/state-resilience.js','game/render.js','game/sim.js','game/main.js']) {
  if (!exists(file)) throw new Error(`missing playable module ${file}`);
}

const gameCore = read('game/core.js');
const stateResilience = read('game/state-resilience.js');
const gameRender = read('game/render.js');
const gameSim = read('game/sim.js');
const gameMain = read('game/main.js');

for (const token of [
  'td613.domeblox.browser-world/v1',
  'for (let index = 0; index < 12; index += 1)',
  "add('fountain'",
  "add('care'",
  "add('rest'",
  "add('bamboo'",
  "add('loom'",
  "add('keep'",
  "add('battery'",
  'readStoredState',
  'writeStoredState',
  'clearStoredState'
]) {
  if (!gameCore.includes(token)) throw new Error(`playable world contract missing: ${token}`);
}
for (const token of ['hydrateState', 'readStoredState', 'writeStoredState', 'clearStoredState']) {
  if (!stateResilience.includes(token)) throw new Error(`save resilience contract missing: ${token}`);
}
if (!gameRender.includes('drawDomeGrid')) throw new Error('Dome renderer missing');
if (!gameRender.includes('drawAnimal')) throw new Error('animal renderer missing');
if (!gameSim.includes('springald.armedUntil = Date.now() + 15000')) throw new Error('two-stage Springald timer missing');
if (!gameSim.includes("window.open('./forward-battery/'")) throw new Error('Forward Battery route missing from village');
if (!gameSim.includes('The browser port records a local replay receipt') && !gameHtml.includes('The browser port records a local replay receipt')) throw new Error('local-only Springald boundary missing');
if (!gameMain.includes('TD613_DOME_BLOX_GAME')) throw new Error('playable inspection API missing');
if (!gameMain.includes('touchPad')) throw new Error('touch controls missing');
if (!gameMain.includes("version:'1.2.1'")) throw new Error('playable runtime version drift');

// The old instrument must remain reachable at its subordinate route.
const batteryHtml = read('forward-battery/index.html');
const batteryCss = read('domeblox.css');
if (!batteryHtml.includes('<base href="../"')) throw new Error('Forward Battery base route missing');
if (!batteryHtml.includes('<title>DomeBlox · Forward Battery</title>')) throw new Error('Forward Battery title missing');
for (const id of [
  'sourceNucleus','buildFamily','runAssay','runMoire','compileConsequence',
  'gameList','ledgerView','assayPosture','registryPosture','handoffStatus'
]) {
  if (!batteryHtml.includes(`id="${id}"`)) throw new Error(`Forward Battery DOM missing ${id}`);
}
if (!batteryHtml.includes(canonical)) throw new Error('exact U+10D613 scalar missing from Forward Battery');
if (/\sstyle=/.test(batteryHtml)) throw new Error('CSP-blocked inline style restored');
if (!batteryHtml.includes('class="return-link"')) throw new Error('Battery return link class missing');
if (!batteryCss.includes('.return-link{color:inherit}')) throw new Error('Battery return link stylesheet rule missing');

// Existing Forward Battery engines remain syntactically valid and bounded.
for (const file of ['domeblox-hooks.js', 'domeblox-core.js']) {
  new vm.Script(read(file), { filename: file });
}
const batteryCore = read('domeblox-core.js');
if (!batteryCore.includes('source_nucleus: source')) throw new Error('invariant source field absent');
if (!batteryCore.includes('packet_text: packetText')) throw new Error('packet text separation absent');
if (batteryCore.includes('list.innerHTML=DB.getGames')) throw new Error('manifest XSS seam restored');
if (!batteryCore.includes('ABSTAIN_INSUFFICIENT_COVERAGE')) throw new Error('coverage abstention missing');
if (!batteryCore.includes('sessionStorage')) throw new Error('tab-local recovery missing');

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
  window: { dispatchEvent(event) { events.push(event); } },
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

console.log('DomeBlox playable browser contract PASS');
