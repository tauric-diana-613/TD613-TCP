import assert from 'node:assert/strict';
import fs from 'node:fs';
import { JSDOM } from 'jsdom';

const html = fs.readFileSync('app/dome-world/index.html', 'utf8');
const release = JSON.parse(fs.readFileSync('app/aperture/release.json', 'utf8'));
const dom = new JSDOM(html);
const { document } = dom.window;

assert.equal(document.title, 'Dome-World / Flow-Core v0.5.0');
assert.equal(document.querySelector('meta[name="td613-dome-world-version"]')?.content, 'v0.5.0');
assert.equal(release.domeWorld.version, 'v0.5.0');
assert.equal(release.domeWorld.schema, 'td613.dome-world/v0.5.0');
assert.equal(release.domeWorld.exactReceiptSchema, 'td613.dome-world.exact-receipt/v0.4.3');

for (const id of [
  'weatherCanvas',
  'roomsCanvas',
  'labCanvas',
  'substrateCanvas',
  'phasonCanvas',
  'apertureCanvas',
  'receiptsCanvas',
]) {
  assert.ok(document.getElementById(id), `missing sovereign perspective canvas #${id}`);
}

assert.equal(document.querySelectorAll('.lab-node').length, 10);
assert.match(html, /const LAB_STATIONS=\['math','tomography','live','loom','stewardship','patterns','repo','lore','accident','api'\]/);
assert.match(html, /className='lab-route-rail'/);
assert.match(html, /data-lab-step="-1"/);
assert.match(html, /data-open-view="lab"/);
assert.match(html, /data-lab-step="1"/);
assert.match(html, /touch-action:pan-y/);
assert.match(html, /Math\.abs\(dy\)>Math\.abs\(dx\)\+6/);
assert.doesNotMatch(html, /touchmove[^;\n]*preventDefault/);
assert.match(html, /\.formline input,\s*\.formline select,\s*\.formline button \{\s*flex: none;/);
assert.match(html, /\.kpis,\s*\.rooms \{\s*grid-template-columns: repeat\(2,minmax\(0,1fr\)\)/);
assert.match(html, /padding-bottom: calc\(156px \+ env\(safe-area-inset-bottom\)\)/);
assert.match(html, /\.panel\.rel > \.legend \{\s*position:relative;/);

assert.match(html, /const DomeArt=\(\(\)=>\{/);
assert.match(html, /const frameInterval=1000\/\(renderer\.hz\|\|30\)/);
assert.match(html, /live:\{id:'live-lattice-tendency-probes',canvas:'liveCanvas',draw:drawLiveLattice,hz:30/);
assert.match(html, /Math\.min\(56, Math\.max\(28, Math\.floor\(rect\.width\*rect\.height\/11000\)\)\)/);
assert.match(html, /liveState\.frame%8===n\.sampleSlot/);
assert.match(html, /function liveSubstrateLayer\(w,h,dpr\)/);
assert.match(html, /liveState\.substrate&&liveState\.substrateKey===key/);
assert.doesNotMatch(html.slice(html.indexOf('function drawLiveLattice'), html.indexOf('function renderLiveReadout')), /computeHeterostratigraphicPotential/);
assert.match(html, /DomeArt\?\.activate\(null\)/);
assert.match(html, /window\.DOME_WORLD_ART=DomeArt/);
assert.match(html, /td613\.dome-world\.art-receipt\/v0\.5\.0/);
assert.match(html, /dome-stable-hash-v1/);
assert.match(html, /if\(canvas\.width!==width\|\|canvas\.height!==height\)/);
assert.doesNotMatch(html, /liveState\.raf|startLiveLattice|stopLiveLattice/);

const artStart = html.indexOf("const DOME_ART_VERSION='v0.5.0'");
const artEnd = html.indexOf('window.DOME_WORLD_ART=DomeArt');
assert.ok(artStart > 0 && artEnd > artStart);
assert.doesNotMatch(html.slice(artStart, artEnd), /Math\.random/);

for (const preservedSurface of [
  '.weather-card',
  '#weatherCanvas',
  '.weather-copy',
  '.lab-shell',
  '.lab-constellation',
  '.lab-node',
]) {
  assert.ok(document.querySelector(preservedSurface), `preservation surface missing: ${preservedSurface}`);
}

console.log('dome-world-art.test.mjs passed');
