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
