import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PODIUM_ROUTES} from '../app/encyclopedia/reference/vixen-podium.mjs';
import {meshScrollCoherencePolicy} from '../app/encyclopedia/vixen-estate/vixen-live-mesh-rgi13.mjs';

const root='app/encyclopedia/';
const html=readFileSync(root+'vix-cyb.html','utf8');
const ai=readFileSync(root+'vix-cyb/llms.txt','utf8');
const manifest=JSON.parse(readFileSync(root+'reference/podium/manifest.json','utf8'));
const developerGuide=readFileSync('VIXEN_START_HERE.md','utf8');
const generated=readFileSync('scripts/package-vixen-preview.py','utf8');
const exported=readFileSync(root+'vixen-estate/session-zip.mjs','utf8');
const salonEngine=readFileSync(root+'vixen-estate/synthesis-salon-engine.mjs','utf8');

test('AI guide, machine runtime and manifest agree on all 27 typed routes',()=>{
 assert.equal(PODIUM_ROUTES.length,27);
 assert.deepEqual(manifest.routes.map(x=>x.id),PODIUM_ROUTES);
 for(const route of PODIUM_ROUTES)assert(ai.includes(route),'Missing AI route '+route);
 assert.match(ai,/OPERAHOUSE ≠ OPERA ≠ PERFORMER/);
 assert.match(ai,/MAESTRO/);
 assert.match(ai,/COMPOSER/);
 assert.match(ai,/separate Program Notes/i);
 assert.match(ai,/seven missing PDFs plus one|seven previously identified missing PDFs and one/i);
 assert.doesNotMatch(ai,/Podium 12.route|12 declared routes|16 ROUTES/i);
});
test('human Podium is an informative research companion, not a native-host CLI deck',()=>{
 assert.match(html,/id="vixOperatorPodium"/);
 assert.match(html,/THE PODIUM · RESEARCH WITH AN AI COLLABORATOR/);
 assert.match(html,/Copy selected question/);
 assert.match(html,/data-vixen-podium-prompt/);
 assert.doesNotMatch(html,/TD613_PODIUM_OPERATOR_DIRECT=1/);
 assert.doesNotMatch(html,/CLI commit:/);
 assert.doesNotMatch(html,/WILD FIELD REPERTOIRE \(8 INTERACTIVE COMMISSIONS/);
 assert.doesNotMatch(html,/TYPED MACHINE PODIUM CONTRACT \(td613\.vixen\.podium\.task\/v1/);
 assert.match(html,/OPERAHOUSE ≠ OPERA ≠ PERFORMER/);
});
test('developer commands remain in Git while portable public docs omit them',()=>{
 assert.match(developerGuide,/GitHub Actions|CI|qualification/i);
 assert.doesNotMatch(ai,/TD613_PODIUM_OPERATOR_DIRECT/);
 assert.doesNotMatch(generated,/TD613_PODIUM_OPERATOR_DIRECT/);
 assert.doesNotMatch(generated,/VIXEN_START_HERE\.md/);
 assert.doesNotMatch(exported,/Podium 12-route/);
 assert.match(exported,/27 typed routes/);
});
test('conservative mobile optical clock choice retains all other room fields',()=>{
 assert.equal(meshScrollCoherencePolicy({view:'collection',viewportWidth:390}),'LOCAL_STAGE_ONLY');
 assert.equal(meshScrollCoherencePolicy({view:'collection',viewportWidth:740}),'LOCAL_STAGE_ONLY');
 assert.equal(meshScrollCoherencePolicy({view:'collection',viewportWidth:1024}),'SHARED_VIEWPORT_FIELD');
 assert.equal(meshScrollCoherencePolicy({view:'works',viewportWidth:390}),'SHARED_VIEWPORT_FIELD');
 assert.equal(meshScrollCoherencePolicy({view:'observatory',viewportWidth:390}),'SHARED_VIEWPORT_FIELD');
});
test('public Salon research limits describe real review boundaries without exposing private host/release machinery',()=>{
 assert.doesNotMatch(salonEngine,/Em volunteer-client inspection|operator secret \(like TD613 Giving\)/);
 assert.match(salonEngine,/Future publication, source acquisition, and release require separate human review/);
});
