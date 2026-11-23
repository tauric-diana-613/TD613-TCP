import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {translatePublicCopy} from '../app/encyclopedia/vixen-estate/vixen-opera-public-copy.mjs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const html=read('app/encyclopedia/vix-cyb.html');
const phone=read('app/encyclopedia/vixen-estate/vixen-mobile-manuscript-opera-rgi27.css');
const legacy=read('app/encyclopedia/vixen-estate/vixen-mobile-reading-rgi17.css');
const boundary=read('app/encyclopedia/vixen-estate/vixen-opera-public-copy.mjs');

test('Opera templates remove authorization badges and lab claims, retain source custody',()=>{
 for(const token of ['<span class="tag gold">EXPERIMENT_A_PREVIEW_AUTHORIZED</span>',
   'EXPERIMENT-A COMPANION PREVIEW', 'Experiment-A Preview Status:',
   'FULL COMPANION MANUSCRIPT AVAILABLE', 'PRODUCTION REQUIRES OPERATOR SECRET',
   'EMPIRICAL_REPLICATION_CREDIT: 0 · EXPERIMENT A: READABLE']) {
   assert.ok(!html.includes(token),'Visitor token reintroduced: '+token);
 }
 assert.ok(html.includes('id="globalSearchObservabilityBar" hidden aria-hidden="true"'));
 assert.ok(html.includes('id="globalFusionTaskTray" hidden aria-hidden="true"'));
 assert.ok(html.includes('id="vixen-corpus-bundle"'));
 assert.ok(html.includes('mountVixenManuscript(coutureReader,'));
 assert.ok(html.includes('worksExperimentAReaderMount'));
});

test('boundary removes backstage furniture and never rewrites original manuscripts',()=>{
 assert.ok(boundary.includes('REMOVABLE_PUBLIC_FURNITURE'));
 assert.ok(boundary.includes('el.remove()'));
 assert.ok(boundary.includes('.vix-manuscript, .vix-reader-code'));
 assert.ok(!boundary.includes('.vix-manuscript, .expa-body-pre'));
 // Protocols display editorial projections; exact protocol source resides
 // exclusively in the immutable source corpus, separate from visitor labels.
 assert.equal(translatePublicCopy('EXPERIMENT_A_PREVIEW_AUTHORIZED'),'');
 assert.equal(translatePublicCopy('Codex'),'');
 assert.equal(translatePublicCopy('Gemini'),'');
});

test('mobile full-width article replaces legacy reader and forced any-word breaking',()=>{
 assert.ok(!legacy.includes('#worksExperimentAReaderMount'));
 assert.ok(!legacy.includes('#worksReaderPanel'));
 for(const token of ['display:flow-root!important','max-height:none!important',
   'overflow:visible!important','font:400 15.5px/1.53',
   'overflow-wrap:normal!important','.vix-reader-paragraph'])assert.ok(phone.includes(token),token);
 assert.ok(phone.includes('body[data-view="works"] #vixenLivingMesh.vixen-living-mesh'));
 assert.ok(phone.includes('display:none!important;visibility:hidden!important'));
 assert.ok(phone.includes('.vix-reader-heading.vix-pdf-source-title'));
 assert.ok(phone.includes('font:500 18.5px/1.27'));
  assert.ok(html.indexOf('vixen-mobile-manuscript-opera-rgi27.css')>html.indexOf('vixen-proscenium-seam.css'));
});

test('witness captures baseline and repaired source with geometry and screenshots',()=>{
 const witness=read('tests/vixen-opera-surface-browser.test.mjs');
 for(const token of ['chromium.launch','7500e294003e8a5effa52921c8d4b7eba673be9d',
 'before-after.json','words_per_line','article_width','visible_leaks'])assert.ok(witness.includes(token),token);
});
