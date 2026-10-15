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

test('the opening speaks plainly about useful AI help and private conversation',()=>{
  assert.match(doc.querySelector('#loomFirstCrossingTitle').textContent,/Firewall your online life from AI/i);
  assert.equal(doc.querySelector('.loom-hero-promise'),null,'no competing marketing headline');
  assert.match(doc.querySelector('#loomFirstCrossingPrompt').textContent,/Use Gemini, ChatGPT, and other LLMs.*test what the exchange may reveal/i);
  assert.doesNotMatch(doc.querySelector('#loomFirstCrossing').textContent,/Golden Egg/i);
  assert.doesNotMatch(doc.querySelector('#loomFirstCrossing').textContent,/draft a work email|Northstar|Acquisition talks/i);
  assert.equal(doc.querySelectorAll('[data-first-crossing-item]').length,2);
  assert.match(doc.querySelector('.loom-research-proof').textContent,/both paths.*research targets.*L.*R.*J/i);
  assert.match(doc.querySelector('.loom-research-proof').textContent,/cannot settle what an outsider could reconstruct/i);
  assert.match(doc.querySelector('[data-first-crossing-item="brief"]').textContent,/The question you want answered/i);
  assert.match(doc.querySelector('[data-first-crossing-item="source"]').textContent,/The context worth sharing/i);
});

test('the permitted takeaway is a local fictional input, with a distinct held source',()=>{
  assert.equal(FIRST_CROSSING_PRACTICE.documents.length,3);
  assert.deepEqual(FIRST_CROSSING_PRACTICE.documents.filter(x=>x.share).map(x=>x.id),['brief','source']);
  assert.match(FIRST_CROSSING_PRACTICE.task,/considering taking a job in another city/i);
  assert.match(FIRST_CROSSING_PRACTICE.documents[1].text,/month before I need to decide/);
  const check=checkFirstCrossingPrivacy();
  assert.equal(check.provider_called,false);
  assert.equal(check.blocked_private_egress_attempts,1);
  assert.equal(check.whole_conversation_leakage_fraction,null);
  assert.doesNotMatch(doc.querySelector('.loom-boundary-event').textContent,/My sister and I argued about the move last night/);
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
