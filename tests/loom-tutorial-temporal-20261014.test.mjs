import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { JSDOM } from 'jsdom';
import { loomWorkspaceTemplate } from '../app/dome-world/holonomy-loom/workspace-template.js';
import { LOOM_TUTORIAL_OPERATORS, loomTutorialPresentation } from '../app/dome-world/holonomy-loom/tutorial-membrane.js';

const folder = new URL('../app/dome-world/holonomy-loom/',import.meta.url);
const workspace=fs.readFileSync(new URL('ai-workspace.js',folder),'utf8');
const couture=fs.readFileSync(new URL('loom-couture.css',folder),'utf8');
const html=fs.readFileSync(new URL('../app/dome-world/holonomy-loom.html',import.meta.url),'utf8');
const doc=new JSDOM(loomWorkspaceTemplate).window.document;
function cueCopy(name){
  const pattern=new RegExp("setFirstCrossingCue\\('"+name+"'\\s*,\\s*\\{\\s*title:'([^']+)',\\s*prompt:'([^']+)'",'g');
  return [...workspace.matchAll(pattern)].map(x=>({title:x[1],prompt:x[2]}));
}
test('readable tutorial phase is stable when its exact animation clock publishes readiness',()=>{
  const gathering=cueCopy('gathering-motion');
  const readyGather=cueCopy('gathering-named');
  assert.equal(gathering.length,2);
  assert.equal(readyGather.length,1);
  for(const pending of gathering) assert.deepEqual(pending,readyGather[0]);
  const potential=cueCopy('potential-motion');
  const readyPotential=cueCopy('potential-named');
  const binding=cueCopy('binding');
  assert.equal(potential.length,2);
  assert.equal(readyPotential.length,1);
  assert.equal(binding.length,1);
  for(const pending of [...potential,...binding]) assert.deepEqual(pending,readyPotential[0]);
  assert.match(workspace,/snapshot\.progress>=\.9/,'same finite-time readiness gate survives');
  assert.match(workspace,/if\(!firstCrossingGatheringPublished\)return/,'binding remains consequence-gated');
  assert.match(workspace,/if\(\(firstCrossingStep===2&&!firstCrossingReadinessPublished\)/,'return step remains readiness-gated');
});
test('all seven Flow-Core tutorial glyphs have a visibly named, fictional state',()=>{
  const glyph=doc.querySelector('#loomTutorialOperatorGlyph');
  const label=doc.querySelector('#loomTutorialOperatorLabel');
  assert.ok(glyph&&label,'glyph and plain-language operation are separately addressable');
  assert.deepEqual(LOOM_TUTORIAL_OPERATORS.map(x=>x.glyph),['à','hõt','上','出','米','下','𝄐']);
  assert.match(workspace,/LOOM_TUTORIAL_OPERATORS\[firstCrossingStep\]/);
  assert.match(workspace,/Keep your rules with the work/);
  for(let step=0;step<7;step++){
    const presentation=loomTutorialPresentation(step);
    assert.equal(presentation.tutorial_operator.glyph,LOOM_TUTORIAL_OPERATORS[step].glyph);
    assert.equal(presentation.tutorial_operator.evidence_class,'TUTORIAL_ILLUSTRATION_ONLY');
    assert.equal(presentation.flowcore_choreography.family,LOOM_TUTORIAL_OPERATORS[step].family);
  }
  assert.match(workspace,/new AnimationCoordinator\(\{ durationMs: 6000/);
  assert.doesNotMatch(couture,/@keyframes[^{]*\{/);
});
test('mobile request reads vertically; raw machine output and research math are opt-in',()=>{
  const selection=doc.querySelector('#loomTutorialSelection');
  assert.equal(selection.querySelectorAll('dt').length,3);
  assert.match(couture,/@media\(max-width:600px\)[\s\S]*\.loom-tutorial-selection dl>div\{\s*display:block/);
  const outer=doc.querySelector('#loomTutorialProof');
  const technical=outer.querySelector('.loom-tutorial-technical');
  const record=doc.querySelector('#loomTutorialProofRecord');
  assert.ok(technical.contains(record));
  assert.equal(outer.open,false);
  assert.equal(technical.open,false);
  assert.match(outer.querySelector('.loom-tutorial-check-summary').textContent,/entirely in your browser.*unselected conversation.*outsider could reconstruct/is);
  const research=doc.querySelector('.loom-research-proof');
  assert.ok(research.querySelector('.loom-research-technical'));
  assert.equal(research.querySelector('.loom-research-technical').open,false);
  assert.match(research.querySelector('.loom-research-technical').textContent,/L ≤ 0.5 bits.*R ≤ 0.2.*J ≤ 0.1/);
  assert.match(html,/couture79-v1/);
});


test('the first screen explains the AI firewall and three actual evidence boundaries',()=>{
  const title=doc.querySelector('#loomFirstCrossingTitle')?.textContent;
  const pitch=doc.querySelector('#loomFirstCrossingPrompt')?.textContent;
  const route=doc.querySelector('.loom-value-route')?.textContent;
  assert.match(title,/Make AI behave. Keep your private life yours/);
  assert.match(pitch,/ChatGPT, Gemini, and other AI models/);
  assert.match(pitch,/what someone else could infer/);
  assert.match(route,/Set your AI rules/);
  assert.match(route,/Control what it sees/);
  assert.match(route,/Test what comes back/);
  assert.match(workspace,/Give AI a job, not your life story/);
  assert.match(workspace,/Check AI Request/);
});
test('the actual renderer retains tutorial glyphs after finite motion instead of fading away',()=>{
  const renderer=fs.readFileSync(new URL('instrument-state-view.js',folder),'utf8');
  assert.match(renderer,/if\(illustration && finiteTraversal\)/);
  assert.match(renderer,/frame\.progress-\.76/);
  assert.match(renderer,/opacity=Math\.max\(opacity,nearPlane/);
  assert.match(renderer,/length:39/);
  assert.match(workspace,/durationMs: 6000/);
  assert.match(workspace,/snapshot\.progress>=\.9/);
  assert.match(couture,/loom-value-route/);
});
