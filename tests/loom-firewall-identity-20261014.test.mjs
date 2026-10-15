import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { JSDOM } from 'jsdom';
import { loomWorkspaceTemplate } from '../app/dome-world/holonomy-loom/workspace-template.js';
import { FIRST_CROSSING_PRACTICE, checkFirstCrossingPrivacy } from '../app/dome-world/holonomy-loom/first-crossing-practice.js';
import { loomOpeningPresentation } from '../app/dome-world/holonomy-loom/tutorial-membrane.js';

const root=new URL('../app/dome-world/holonomy-loom/',import.meta.url);
const css=fs.readFileSync(new URL('loom-couture.css',root),'utf8');
const runtime=fs.readFileSync(new URL('instrument-state-view.js',root),'utf8');
const workspace=fs.readFileSync(new URL('ai-workspace.js',root),'utf8');
const dom=new JSDOM(loomWorkspaceTemplate);
const doc=dom.window.document;

test('the Golden Egg headline distinguishes authorized utility from outsider reconstruction',()=>{
  assert.match(doc.querySelector('#loomFirstCrossingTitle').textContent,/Talk to AI\. Keep the conversation yours/i);
  assert.match(doc.querySelector('.loom-hero-promise').textContent,/The Golden Egg/);
  assert.match(doc.querySelector('#loomFirstCrossingPrompt').textContent,/outsider cannot reconstruct.*boundary to the test/i);
  assert.doesNotMatch(doc.querySelector('#loomFirstCrossing').textContent,/draft a work email|Northstar|Acquisition talks/i);
  assert.equal(doc.querySelectorAll('[data-first-crossing-item]').length,2);
  assert.match(doc.querySelector('.loom-golden-egg-proof').textContent,/observer leakage.*reconstruction.*joining synergy.*measured geometry.*protected returns/i);
  assert.match(doc.querySelector('.loom-golden-egg-proof').textContent,/not that proof/i);
  assert.match(doc.querySelector('[data-first-crossing-item="brief"]').textContent,/private conversation/i);
  assert.match(doc.querySelector('[data-first-crossing-item="source"]').textContent,/what may travel/i);
});

test('the permitted takeaway is a local fictional input, with a distinct held source',()=>{
  assert.equal(FIRST_CROSSING_PRACTICE.documents.length,3);
  assert.deepEqual(FIRST_CROSSING_PRACTICE.documents.filter(x=>x.share).map(x=>x.id),['brief','source']);
  assert.match(FIRST_CROSSING_PRACTICE.task,/difficult personal decision/i);
  assert.match(FIRST_CROSSING_PRACTICE.documents[1].text,/month before I need to decide/);
  const check=checkFirstCrossingPrivacy();
  assert.equal(check.provider_called,false);
  assert.equal(check.blocked_private_egress_attempts,1);
  assert.equal(check.whole_conversation_leakage_fraction,null);
  assert.doesNotMatch(doc.querySelector('.loom-boundary-event').textContent,/I cried on the phone with my sister last night/);
});

test('mobile sculpture stays mobile; desktop retains the canonical, single-clock field',()=>{
  assert.match(css,/@media \(min-width:761px\)\s*\{\s*#loomAiWorkspace \.loom-armature \{display:none !important\}/);
  assert.match(css,/button:not\(\[aria-pressed="true"\]\)::after\s*\{\s*content:"→"/);
  assert.equal((workspace.match(/new AnimationCoordinator\(/g)||[]).length,1);
  assert.match(runtime,/Array\.from\(\{length:39\}/);
  assert.match(runtime,/choreography\.presentation_slots\.filter/);
  assert.doesNotMatch(css,/@keyframes[^{]*\{/);
});

test('the overture casts all eight glyph relations while emphasizing legible returns and rests',()=>{
  const presentation=loomOpeningPresentation();
  const slots=presentation.flowcore_choreography.presentation_slots;
  assert.equal(presentation.tutorial_operator,null);
  assert.equal(slots.length,12);
  assert.ok(slots.filter(x=>x==='protected_continuity').length>=2);
  assert.ok(slots.filter(x=>x==='bounded_emergence').length>=2);
  assert.ok(slots.filter(x=>x==='release').length>=2);
  assert.ok(slots.filter(x=>x==='structural_rest').length>=2);
  assert.equal(new Set(presentation.flowcore_choreography.relations).size,8);
});
