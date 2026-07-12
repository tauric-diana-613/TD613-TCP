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
assert.doesNotMatch(html, /touchmove[^;\n]*preventDefault/);
assert.match(html, /pointerdown[^\n]+liveState\.input\.active=true/);
assert.match(html, /\.formline input,\s*\.formline select,\s*\.formline button \{\s*flex: none;/);
assert.match(html, /\.kpis,\s*\.rooms \{\s*grid-template-columns: repeat\(2,minmax\(0,1fr\)\)/);
assert.match(html, /padding-bottom: calc\(156px \+ env\(safe-area-inset-bottom\)\)/);
assert.match(html, /\.panel\.rel > \.legend \{\s*position:relative;/);

assert.match(html, /const DomeArt=\(\(\)=>\{/);
assert.match(html, /const frameInterval=1000\/\(renderer\.hz\|\|30\)/);
assert.match(html, /const frameTolerance=1\.5/);
assert.match(html, /elapsed>=frameInterval-frameTolerance/);
assert.match(html, /const overshoot=Math\.min\(frameInterval,Math\.max\(0,elapsed-frameInterval\)\)/);
assert.match(html, /renderer\.draw\(timestamp\/1000,elapsed\)/);
assert.match(html, /live:\{id:'live-lattice-tendency-probes',canvas:'liveCanvas',draw:drawLiveLattice,hz:60/);
assert.match(html, /Math\.min\(96, Math\.max\(54, Math\.floor\(rect\.width\*rect\.height\/7600\)\)\)/);
assert.match(html, /liveState\.frame%4===n\.sampleSlot/);
assert.match(html, /liveState\.input\.active=true/);
assert.doesNotMatch(html, /mode:e\.pointerType==='touch'\?'pending':'field'/);
assert.match(html, /homeX:x,homeY:y/);
assert.match(html, /const gradientMagnitude=Math\.hypot\(node\.gx,node\.gy\)/);
assert.match(html, /node\.gx\/gradientMagnitude/);
assert.match(html, /\(targetX-node\.x\)\*\.0018/);
assert.match(html, /node\.homeX\*=sx;node\.homeY\*=sy/);
assert.match(html, /function fitLiveLatticeToCanvas\(w,h\)/);
assert.match(html, /deltaMs\/LIVE_FRAME_MS/);
assert.match(html, /function liveSubstrateLayer\(w,h,dpr\)/);
assert.match(html, /liveState\.substrate&&liveState\.substrateKey===key/);
assert.match(html, /canvasObserver\.observe\(activeCanvas\)/);
assert.doesNotMatch(html, /observe\(main\)/);
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
