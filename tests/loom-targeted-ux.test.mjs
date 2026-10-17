import test from 'node:test';
// Keep firewall-identity regressions in the mandatory targeted validation shard.
import './loom-firewall-identity-20261014.test.mjs';
import './portable-loom-tomography-export.test.mjs';
import './loom-privacy-science-20261014.test.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { webcrypto } from 'node:crypto';
import { JSDOM } from 'jsdom';
import { loomWorkspaceTemplate } from '../app/dome-world/holonomy-loom/workspace-template.js';
import { mountLoomAiWorkspace } from '../app/dome-world/holonomy-loom/ai-workspace.js';
import { createLoomAiGovernance } from '../app/dome-world/holonomy-loom/ai-handoff.js';
import {
  createLoomDemoActivation, bindLoomDemoRequest, exportLoomDemoCurrent,
  loomDemoDigest, loomDemoReceiptDigest, LOOM_DEMO_REQUEST_SCHEMA, LOOM_DEMO_STAGE_RECEIPT_SCHEMA
} from '../app/dome-world/holonomy-loom/demo-contract.js';
import { LOOM_RETURN_REVIEW_STORAGE_KEY } from '../app/dome-world/holonomy-loom/returned-session-review.js';

const html = fs.readFileSync(new URL('../app/dome-world/holonomy-loom.html', import.meta.url), 'utf8');
const product = fs.readFileSync(new URL('../app/dome-world/holonomy-loom/loom-couture.css', import.meta.url), 'utf8');
const runway = fs.readFileSync(new URL('../app/dome-world/holonomy-loom/loom-couture.css', import.meta.url), 'utf8');
const workspaceSource = fs.readFileSync(new URL('../app/dome-world/holonomy-loom/ai-workspace.js', import.meta.url), 'utf8');
const runtimeStateSource = fs.readFileSync(new URL('../app/dome-world/holonomy-loom/runtime-state-view.js', import.meta.url), 'utf8');
const instrumentSource = fs.readFileSync(new URL('../app/dome-world/holonomy-loom/instrument-state-view.js', import.meta.url), 'utf8');
const templateSource = fs.readFileSync(new URL('../app/dome-world/holonomy-loom/workspace-template.js', import.meta.url), 'utf8');
const runtimeModuleSource = fs.readFileSync(new URL('../app/dome-world/holonomy-loom/runtime-state-view.js', import.meta.url), 'utf8');

test('Loom loading veil replaces inherited visibility gate that strands WebKit tutorial', () => {
  assert.doesNotMatch(html, /html\[data-loom-boot=["']loading["']\]\s+main\s*\{\s*visibility\s*:\s*hidden/i);
  const doc = new JSDOM(html).window.document;
  assert.ok(doc.querySelector('#loomBootVeil'), 'visible opaque veil guards initial paint');
  assert.match(html, /#loomBootVeil\{[^}]*position:fixed;inset:0;z-index:1000/);
  assert.match(html, /html:not\(\[data-loom-boot=["']loading["']\]\) #loomBootVeil\{display:none\}/);
});

test('Loom boot binds fresh couture assets and contains a catchable module failure', () => {
  const doc = new JSDOM(html).window.document;
  const css = doc.querySelector('link[href*="loom-couture.css"]');
  const module = [...doc.querySelectorAll('script[type="module"]')].find(node => node.textContent.includes('ai-workspace.js'));
  assert.match(css.href, /20261017-79-couture-v1/);
  assert.ok(module, 'the entrypoint must be an observable dynamic module import');
  assert.match(module.textContent, /import\('\.\/holonomy-loom\/ai-workspace\.js\?v=20261017-tutorial-artifact-v1'\)/);
  assert.match(module.textContent, /\.catch\(\(\) => window\.td613LoomBootFailure/);
  assert.equal(doc.querySelectorAll('script[type="module"][src*="20261003"]').length, 0);
});

function bootFixture() {
  let watchdog;
  const dom = new JSDOM(html, {
    url: 'https://td613.com/dome-world/holonomy-loom.html',
    runScripts: 'dangerously',
    beforeParse(window) {
      window.setTimeout = callback => { watchdog = callback; return 1; };
    }
  });
  assert.equal(typeof watchdog, 'function', 'bounded startup watchdog must exist before module import');
  return { dom, watchdog };
}

test('Loom boot timeout replaces the stranded Opening Loom placeholder with a recoverable screen', () => {
  const { dom, watchdog } = bootFixture();
  const { document } = dom.window;
  assert.equal(document.documentElement.dataset.loomBoot, 'loading');
  watchdog();
  assert.equal(document.documentElement.dataset.loomBoot, 'failed');
  assert.equal(document.documentElement.dataset.loomBootReason, 'START_TIMEOUT');
  assert.equal(document.querySelector('#loomBootFailure')?.getAttribute('role'), 'alert');
  assert.match(document.querySelector('#loomBootFailure').textContent, /Reload Loom/);
  assert.doesNotMatch(document.querySelector('#loomAiWorkspace').textContent, /^Opening Loom…$/);
  dom.window.close();
});

test('Loom module failure exposes a local retry without granting execution or clearing storage', () => {
  const { dom } = bootFixture();
  const { document, localStorage } = dom.window;
  localStorage.setItem('td613.loom.first-crossing.v1', 'complete');
  dom.window.td613LoomBootFailure('MODULE_LOAD_FAILED');
  assert.equal(document.documentElement.dataset.loomBootReason, 'MODULE_LOAD_FAILED');
  assert.ok(document.querySelector('#loomBootRetry'));
  assert.equal(localStorage.getItem('td613.loom.first-crossing.v1'), 'complete');
  assert.equal(document.querySelector('[data-first-crossing-item]'), null);
  dom.window.close();
});

test('Loom watchdog leaves successfully mounted application untouched', () => {
  const { dom, watchdog } = bootFixture();
  const { document } = dom.window;
  document.documentElement.dataset.loomBoot = 'ready';
  watchdog();
  dom.window.td613LoomBootFailure('MODULE_LOAD_FAILED');
  assert.equal(document.documentElement.dataset.loomBoot, 'ready');
  assert.equal(document.querySelector('#loomBootFailure'), null);
  dom.window.close();
});

// These are source/DOM witnesses. Physical-device behavior, viewport geometry,
// provider execution and measured human comprehension require separate evidence.

test('primary Loom is one product route, not a nested laboratory archive', () => {
  const doc = new JSDOM(html).window.document;
  assert.equal(doc.querySelectorAll('#loomLegacy').length, 0);
  assert.equal(doc.querySelectorAll('.hero,.wrap').length, 0);
  assert.equal(doc.querySelector('a[href="/dome-world/loom-instrument-lab.html"]')?.textContent, 'Lab');
  assert.equal(doc.querySelector('#ashKeepReturn')?.getAttribute('href'), '/dome-world/');
  assert.equal(doc.querySelector('#ashKeepReturn')?.textContent, 'Home');
  assert.equal(doc.querySelector('#ashKeepReturn')?.getAttribute('aria-label'), 'Dome-World home');
  assert.ok(doc.querySelector('a[href*="loom-instrument-lab"]').getAttribute('target')==='_blank');
  assert.equal(doc.querySelectorAll('link[href*="ai-workspace.css"],link[href*="reentry-workspace.css"],link[href*="loom-product-v3.css"],link[href*="ux-repair.css"],link[href*="cinematic-rescue.css"],link[href*="dromological-regime.css"]').length,0);
});

test('cinematic route field and builder are separate scenes while advanced tools stay secondary', () => {
  const doc = new JSDOM(loomWorkspaceTemplate).window.document;
  const stage = doc.querySelector('.loom-stage');
  const builderShell = doc.querySelector('.loom-builder-shell');
  const surface = doc.querySelector('.loom-working-surface');
  assert.ok(stage.contains(doc.querySelector('#aiRuntimeState')));
  assert.ok(!stage.contains(doc.querySelector('#aiTask')));
  assert.ok(surface.contains(doc.querySelector('#aiTask')));
  assert.ok(stage.compareDocumentPosition(builderShell) & doc.defaultView.Node.DOCUMENT_POSITION_FOLLOWING);
  assert.ok(doc.querySelector('#loomBegin'));
  assert.deepEqual([...doc.querySelectorAll('.loom-journey-step strong')].map(node => node.textContent), ['Loom', 'Marrowline', 'Return']);
  assert.equal(builderShell.hidden, true, 'Threshold withholds the builder until the crossing gesture');
  assert.equal(doc.querySelector('#loomBuilder').hidden, false, 'the builder content itself remains intact behind the Threshold');
  assert.equal(doc.querySelector('#aiResult').hidden, true);
  assert.equal(doc.querySelector('#loomReturnWorkspace').hidden, true);
  assert.equal(doc.querySelectorAll('#loomBuilder > details,#aiResult > details').length, 0);
  for (const id of ['aiRules','aiPrivate','aiRuntimeProfile','aiRun','aiChallengeDrawer','aiExport','aiCopy','aiSessionReceipt']) {
    assert.ok(doc.querySelector('#loomTools').contains(doc.querySelector(`#${id}`)), `${id} remains accessible in secondary tooling`);
  }
  assert.match(workspaceSource, /root\.innerHTML\s*=\s*loomWorkspaceTemplate/);
  assert.match(product, /#loomAiWorkspace \.loom-stage\{[\s\S]*?height:calc\(100svh - 76px\)/);
});

test('Flow-Core remains a single accessible header guide with eight text-only glyph copy controls', () => {
  const doc = new JSDOM(html).window.document;
  assert.ok(doc.querySelector('.loom-topbar nav'), 'persistent header must exist');
  const template = new JSDOM(loomWorkspaceTemplate).window.document;
  const help=template.querySelector('.loom-flowcore-help');
  assert.ok(help);
  const glyphs=[...help.querySelectorAll('[data-flowcore-copy]')];
  assert.deepEqual(glyphs.map(node=>node.dataset.flowcoreCopy),['à','米','出','hõt','cōl','上','下','𝄐']);
  assert.ok(glyphs.every(node=>node.tagName==='BUTTON'&&node.textContent===node.dataset.flowcoreCopy));
  assert.match(help.textContent,/Tap a glyph to copy it/i);
  assert.match(workspaceSource, /\.loom-topbar nav'\)\?\.prepend\(flowcoreHelp\)/);
  assert.match(workspaceSource, /navigator\?\.clipboard\?\.writeText/);
  assert.match(product, /\.loom-topbar \.loom-flowcore-help\[open\] \.loom-flowcore-panel\{display:block\}/);
});


test('the firewall framing introduces governed continuity and the reconstruction test',()=>{
 const doc=new JSDOM(loomWorkspaceTemplate).window.document;
 assert.match(doc.querySelector('#loomFirstCrossingTitle').textContent,/Firewall your online life from AI/);
 assert.match(doc.querySelector('#loomFirstCrossingPrompt').textContent,/binds each return.*exchange reveals/);
 assert.match(doc.querySelector('.loom-intro p').textContent,/Set the task, choose its references/);
 assert.match(doc.querySelector('[data-tool-panel="boundary"]').textContent,/external AI provider determines its own retention/i);
});


test('the seven scenes expose exact request, artifact, observer and returned-work objects',()=>{
 const doc=new JSDOM(loomWorkspaceTemplate).window.document;
 for(const id of ['loomTutorialSelection','loomTutorialRequestRecord','loomTutorialArtifactRecord','loomTutorialObserver','loomTutorialSampleAnswer','loomTutorialProofRecord'])assert.ok(doc.querySelector('#'+id));
 assert.equal(doc.querySelector('.loom-firewall-theater'),null);
 assert.doesNotMatch(runway,/@keyframes|setInterval|requestAnimationFrame|new AnimationCoordinator/);
});


test('first use opens the seven-scene tutorial with direct project exploration',()=>{
 const doc=new JSDOM(loomWorkspaceTemplate).window.document;
 assert.equal(doc.querySelector('#loomFirstCrossingAction').textContent,'Explore this project →');
 assert.equal(doc.querySelector('#loomFirstCrossingAction').disabled,false);
 assert.match(doc.querySelector('#loomTutorialProgress').textContent,/1 \/ 7/);
 assert.equal(doc.querySelectorAll('[data-first-crossing-item]').length,2);
 assert.match(runway,/background:transparent/);
});


test('inspection access and publication consequences remain independent of motion progress',()=>{
 assert.doesNotMatch(workspaceSource,/snapshot\.progress>=\.9|gathered\?\.glyph/);
 assert.match(workspaceSource,/firstCrossingBindingState==='PENDING'/);
 assert.match(workspaceSource,/token!==firstCrossingGeneration/);
});


test('How Loom works retains replay, back, skip, remix and the real builder',()=>{
 const doc=new JSDOM(loomWorkspaceTemplate).window.document;
 for(const id of ['loomBegin','loomReturnThreshold','loomFirstCrossingBack','loomFirstCrossingPause','loomFirstCrossingLeave'])assert.ok(doc.querySelector('#'+id));
 assert.equal(doc.querySelector('#loomTutorialMotion'),null);
 assert.equal(doc.querySelector('#loomFirstCrossingPause').textContent,'𝌋');
 assert.equal(doc.querySelector('.loom-builder-shell').hidden,true);
 assert.match(workspaceSource,/nextFlowcoreChoreography/);
 assert.match(workspaceSource,/startFirstCrossing\(\{replay:true\}\)/);
});


test('The handoff preview leaves spatial consequence to the one canonical renderer', () => {
  const doc = new JSDOM(loomWorkspaceTemplate).window.document;
  const crossing=doc.querySelector('#loomFirstCrossing');
  assert.ok(crossing);
  assert.equal(crossing.querySelectorAll('[data-first-crossing-item]').length,2);
  assert.match(product,/#loomAiWorkspace \.ai-runtime,#loomAiWorkspace \.loom-workspace-field\{position:fixed;inset:0/);
  assert.doesNotMatch(product, /--fc-x|--fc-y/, 'source controls must not own a second CSS trajectory');
  assert.doesNotMatch(runtimeStateSource, /coordinator\.seek\(0\);[\s\S]*?coordinator\.play\(\)/, 'async publication must preserve operator pause and scrub');
  assert.doesNotMatch(product, /\.loom-first-crossing\{[^}]*background:rgba\(5,8,12,.67\)/);
});

test('Phase 3 return bypasses the entrance Threshold without completing onboarding', () => {
  assert.match(workspaceSource, /\['OPENER_RETURN','RELOADED_REVIEW'\]\.includes\(review\?\.source\)\|\|environment\.location\.hash==='#return-review'/);
  assert.match(workspaceSource, /root\.dataset\.thresholdState='open'/);
  assert.match(workspaceSource, /thresholdStage\.hidden=true;[\s\S]{0,120}builderShell\.hidden=false/);
  assert.match(workspaceSource, /openWorkspace\('return',\{focus:bypassThreshold\}\)/);
  assert.doesNotMatch(workspaceSource, /openReturnedReviewScene[\s\S]{0,700}storageWrite\(FIRST_CROSSING_KEY/);
});

test('mobile keeps consequential boundaries and source-defined focus protection', () => {
  assert.match(product, /@media\(max-width:760px\)/);
  assert.match(product, /@media\(min-width:761px\)/);
  assert.match(product, /\.ai-composer>textarea\{[^}]*font-size:16px/);
  assert.match(product, /\.loom-tools textarea,\.loom-tools select\{[^}]*font-size:16px/);
  assert.match(product, /\.loom-reentry textarea,\.loom-reentry input:not\(\[type=checkbox\]\)\{[^}]*font-size:16px/);
  assert.match(product, /:focus-visible\{/);
  assert.match(product, /@media\(prefers-reduced-motion:reduce\)/);
  assert.doesNotMatch(product, /grid-template-columns:116px\s+minmax\(0,1fr\)/);
  assert.match(product, /#loomAiWorkspace \.loom-stage\{[\s\S]*?height:calc\(100svh - 76px\)/);
  assert.match(product, /@media\(max-width:760px\)[\s\S]*?#loomAiWorkspace \.loom-stage\{[\s\S]*?height:calc\(100svh - 76px\)/);
  assert.match(product,/\.loom-instrument-state-boundary[\s\S]*?display:none/);
  assert.match(product,/\.loom-tools \[data-tool-panel="session"\] :is\([\s\S]*?position:static/);
  assert.doesNotMatch(product, /text-transform:uppercase[^}]*loom-field-glyph/);
});

test('hidden state actually withholds the Practice chooser despite component display rules', () => {
  const dom = new JSDOM(`<style>${product}</style><section id="loomAiWorkspace">${loomWorkspaceTemplate}</section>`);
  const chooser = dom.window.document.querySelector('#aiProjectChoices');
  assert.equal(chooser.hidden, true);
  assert.equal(dom.window.getComputedStyle(chooser).display, 'none');
  chooser.hidden = false;
  assert.notEqual(dom.window.getComputedStyle(chooser).display, 'none');
  chooser.hidden = true;
  assert.equal(dom.window.getComputedStyle(chooser).display, 'none');
  dom.window.close();
});

test('canonical relation caption preserves Flow-Core case through the product CSS cascade', () => {
  const dom = new JSDOM(`<style>${product}</style><section id="loomAiWorkspace"><p class="loom-instrument-state-relation">à · gathering · hõt · cōl</p></section>`);
  const relation = dom.window.document.querySelector('.loom-instrument-state-relation');
  assert.equal(dom.window.getComputedStyle(relation).textTransform, 'none', 'presentation must preserve canonical lowercase glyphs and relation names');
  dom.window.close();
});

test('local preparation selects foreground crossing focus rather than a field detour', () => {
  assert.match(workspaceSource, /function revealResult\(\)\{\s*openWorkspace\('crossing',\{focus:true\}\)/);
  assert.match(workspaceSource, /name==='crossing'\?\$\('aiResult'\)/);
  assert.match(workspaceSource, /target\.focus\?\.\(\{preventScroll:true\}\)/);
  assert.doesNotMatch(workspaceSource, /\$\('aiRuntime'\)\.scrollIntoView/);
  assert.match(workspaceSource, /\$\('aiPreparePortable'\)\.classList\.add\('ai-primary'\)/);
  assert.match(workspaceSource, /\$\('aiRun'\)\.classList\.remove\('ai-primary'\)/);
});

test('cinematic route labels remain on the field while deep inspection stays inside Tools flow', () => {
  const doc = new JSDOM(loomWorkspaceTemplate).window.document;
  assert.ok(doc.querySelector('.loom-stage').contains(doc.querySelector('#aiRuntimeState')));
  assert.match(workspaceSource, /for\(const selector of \['\.loom-instrument-state-next','\.loom-instrument-state-inspection','\.ai-room-replay'\]\)/);
  assert.match(workspaceSource, /stateTools[\s\S]{0,260}\.ai-room-replay/);
  assert.doesNotMatch(workspaceSource, /stateTools[\s\S]{0,220}loom-instrument-state-endpoints/);
  assert.doesNotMatch(workspaceSource, /stateTools[\s\S]{0,180}loom-instrument-state-relation/);
  assert.match(product,/\.loom-tools \[data-tool-panel="session"\] :is\([\s\S]*?position:static/);
});

test('product shell owns no second animation clock or network authority', () => {
  for (const forbidden of [/requestAnimationFrame/,/setInterval\s*\(/,/fetch\s*\(/,/XMLHttpRequest/,/WebSocket/,/@keyframes|animation\s*:/]) assert.doesNotMatch(product,forbidden);
  for (const forbidden of [/requestAnimationFrame/,/setInterval\s*\(/,/fetch\s*\(/,/XMLHttpRequest/,/WebSocket/]) assert.doesNotMatch(templateSource,forbidden);
  assert.equal((workspaceSource.match(/new AnimationCoordinator\(/g)||[]).length,1);
});

test('return admission remains absent from the default journey until a Loom session exists', () => {
  const doc = new JSDOM(loomWorkspaceTemplate).window.document;
  assert.equal(doc.querySelector('#aiReentryWorkspace').hidden,true);
  assert.ok(doc.querySelector('#loomReturnWorkspace').contains(doc.querySelector('#aiReentryWorkspace')));
  assert.match(workspaceSource, /\$\('aiReentryWorkspace'\)\.hidden=false;[\s\S]*await reentry\.setSession/);
});

test('cinematic Flow-Core traffic remains evidence-bound and single-clock', () => {
  assert.match(instrumentSource, /event_relation_history: eventRelationHistory/);
  assert.match(instrumentSource, /view\.event_relation_history/);
  assert.match(instrumentSource, /owns_animation_loop: false/);
  assert.match(instrumentSource, /const filamentCount = compact \? 10 : filaments\.length/);
  assert.doesNotMatch(instrumentSource, /flightCount\s*=\s*compact\s*\?\s*12/, 'portrait retains the field depth strata rather than slicing off their carrier population');
});

test('Loom product chrome does not reintroduce SHI or speculative release authority', () => {
  assert.doesNotMatch(workspaceSource+templateSource, /id="aiShi"|Safe Harbor issuance|validateShi|issuanceHold/);
  assert.match(workspaceSource, /const awake = \(Boolean\(acceptedTask\) \|\| locallyAdmitted\) && !busy/);
});

const until = async (predicate, label) => {
  const deadline = Date.now() + 3000;
  while (!predicate()) {
    if (Date.now() > deadline) throw new Error(`Timed out awaiting ${label}`);
    await new Promise(resolve => setTimeout(resolve, 5));
  }
};

function practiceHarness(t, { savedReview = null } = {}) {
  const dom = new JSDOM('<section id="fixture"></section>', { url: 'https://td613.com/dome-world/holonomy-loom.html', pretendToBeVisual: true });
  const environment = dom.window, root = environment.document.querySelector('#fixture');
  const frames = new Map(), requests = [];
  let nextFrame = 0;
  const priorFrame = globalThis.requestAnimationFrame, priorCancel = globalThis.cancelAnimationFrame;
  globalThis.requestAnimationFrame = callback => { const id = ++nextFrame; frames.set(id, callback); return id; };
  globalThis.cancelAnimationFrame = id => frames.delete(id);
  Object.defineProperty(environment, 'crypto', { configurable: true, value: webcrypto });
  environment.matchMedia = () => ({ matches: true, addEventListener() {}, removeEventListener() {} });
  environment.fetch = (...args) => { requests.push(args); throw new Error('Practice attempted an unauthorized provider request'); };
  if (savedReview) environment.sessionStorage.setItem(LOOM_RETURN_REVIEW_STORAGE_KEY, JSON.stringify(savedReview));
  const ui = mountLoomAiWorkspace(root, environment);
  t.after(() => {
    ui.dispose(); environment.close();
    if (priorFrame === undefined) delete globalThis.requestAnimationFrame; else globalThis.requestAnimationFrame = priorFrame;
    if (priorCancel === undefined) delete globalThis.cancelAnimationFrame; else globalThis.cancelAnimationFrame = priorCancel;
  });
  return { root, environment, ui, requests, $: selector => root.querySelector(selector) };
}

async function exportedReviewPacket() {
  const environment = { crypto: webcrypto };
  const origin = { task: 'Compare the fictional workstreams.', documents: [{ id: 'a', name: 'workstreams.md', text: 'State A has three workstreams.' }], rules: ['Use only selected sources.'] };
  origin.governance = await createLoomAiGovernance(origin, { withheldDocumentCount: 1 }, environment);
  const result = (id, answer, activation = false) => ({ schema: 'td613.loom.ai-task-result/v0.1', request_id: id, status: 'completed', answer,
    missing_information: activation ? [] : ['Independent effect remains unobserved.'], used_document_ids: activation ? [] : ['a'], suggested_next_step: 'Review the returned work.' });
  origin.continuation = { prior_result: result('origin', 'State A has three workstreams.') };
  const activation = await createLoomDemoActivation(origin, environment), stages = [];
  let previous = null, binder = null;
  try {
    for (let index = 0; index < 2; index++) {
      const phase = index ? 'CONTINUE' : 'ACTIVATE';
      const request = { schema: LOOM_DEMO_REQUEST_SCHEMA, request_id: `reload-request-${index}`, phase, activation, documents: index ? origin.documents : [],
        operator_request: index ? 'Continue from the latest work.' : 'Receive the handoff.', prior_result: index ? origin.continuation.prior_result : null, predecessor: previous };
      binder?.governor.close();
      binder = await bindLoomDemoRequest(request, environment);
      const answer = result(request.request_id, index ? 'State B has four workstreams.' : 'Rules received; selected files are pending.', !index);
      assert.equal(binder.admit(answer).allowed, true);
      const receipt = { schema: LOOM_DEMO_STAGE_RECEIPT_SCHEMA, activation_digest: activation.activation_digest, phase, request_id: request.request_id,
        request_digest: await loomDemoDigest(request, environment), current_input_digest: binder.governance.input_digest,
        prior_result_digest: binder.receipt.prior_result_digest, result_digest: await loomDemoDigest(answer, environment),
        predecessor_receipt_digest: previous ? await loomDemoReceiptDigest(previous, environment) : null, expires_at: activation.expires_at,
        admission_state: 'ADMITTED', stage_policy: index ? 'SELECTED_FILES_BOUND' : 'AIA_ONLY', authority_transferred: false,
        // Synthetic receipt declarations support consistency review, never signature authenticity.
        auth: { scheme: 'hmac-sha256', key_id: 'td613-loom-demo-stage-v1', tag: 'A'.repeat(43) } };
      stages.push({ receipt, binding: JSON.parse(JSON.stringify(binder.receipt)), result: answer, receiver: 'MARROWLINE', observed_at: new Date().toISOString(),
        predecessor_request_id: previous?.request_id ?? null, content_predecessor_request_id: index ? origin.continuation.prior_result.request_id : null });
      previous = receipt;
    }
    return exportLoomDemoCurrent(binder, undefined, { origin, activation, stages });
  } finally { binder?.governor.close(); }
}

test('saved review bypasses fresh practice on reload without completion or local admission', async t => {
  const packet = await exportedReviewPacket();
  const h = practiceHarness(t, { savedReview: packet });
  assert.equal(h.environment.localStorage.getItem('td613.loom.first-crossing.v1'), null);
  await until(() => !h.$('[data-return-review=result]').hidden && !h.$('#loomReturnWorkspace').hidden && h.$('.loom-stage').hidden, 'visible saved Return review');
  assert.equal(h.$('.loom-builder-shell').hidden, false);
  assert.equal(h.$('#loomFirstCrossing').hidden, true);
  assert.equal(h.root.dataset.thresholdState, 'open');
  assert.equal(h.root.dataset.firstCrossing, 'idle');
  assert.match(h.$('[data-return-review=history] > article').textContent, /State B has four workstreams/);
  assert.match(h.$('[data-return-review=boundary]').textContent, /Receipt signatures remain unverified/);
  assert.match(h.$('[data-return-review=boundary]').textContent, /This review record grants no admission authority/);
  assert.match(h.$('[data-return-review=boundary]').textContent, /original local record is unavailable/);
  assert.equal(h.$('#aiReentryWorkspace').hidden, true, 'review does not expose a live admission lane');
  assert.equal(h.ui.inspect().session, null, 'saved review restores no local session or custody');
  assert.equal(h.ui.inspect().events.some(event => event.route_event === 'RETURN_ADMITTED'), false);
  assert.equal(h.environment.localStorage.getItem('td613.loom.first-crossing.v1'), null, 'review grants no practice completion');
  assert.deepEqual(JSON.parse(h.environment.sessionStorage.getItem(LOOM_RETURN_REVIEW_STORAGE_KEY)), packet, 'review reload preserves the saved packet');
  assert.equal(h.requests.length, 0);
});


test('first use remixes and skips without granting completion or custody',async t=>{
 const h=practiceHarness(t),before=h.$('#loomFlowcoreMessage').textContent;
 h.$('#loomFirstCrossingPause').click();assert.notEqual(h.$('#loomFlowcoreMessage').textContent,before);
 assert.equal(h.$('#loomFirstCrossingPrivate').tagName,'DETAILS');
 h.$('#loomFirstCrossingLeave').click();
 assert.equal(h.$('.loom-builder-shell').hidden,false);assert.equal(h.ui.inspect().session,null);
 assert.equal(h.environment.localStorage.getItem('td613.loom.first-crossing.v1'),null);assert.equal(h.requests.length,0);
});


test('local checking and explicit navigation preserve the real unsent evidence boundary',async t=>{
 const h=practiceHarness(t);h.$('#loomFirstCrossingAction').click();
 assert.equal(h.root.dataset.firstCrossingStep,'1');h.$('#loomFirstCrossingAction').click();
 await until(()=>h.root.dataset.firstCrossingStep==='2','actual local binding');
 await until(()=>h.ui.inspect().runtime.view?.event.binding_verified===true,'readiness projection');
 const event=h.ui.inspect().runtime.view.event;
 assert.deepEqual(event.selected_document_ids,['brief','source']);assert.equal(event.local,1);
 assert.equal(event.outbound_submitted,false);assert.equal(event.response_received,false);
 for(let step=3;step<=6;step++){h.$('#loomFirstCrossingStop').click();await until(()=>h.root.dataset.firstCrossingStep===String(step),'step '+step)}
 const proof=JSON.parse(h.$('#loomTutorialProofRecord').textContent);
 assert.equal(proof.receipt.provider_called,false);assert.equal(proof.receipt.custody_admitted,false);
 assert.equal(h.environment.localStorage.getItem('td613.loom.first-crossing.v1'),'complete');
 assert.equal(h.ui.inspect().session,null);assert.equal(h.requests.length,0);
});


test('leaving during an async practice binding prevents late completion or scene takeover', async t => {
  const h = practiceHarness(t);
  h.$('#loomFirstCrossingAction').click();
  let release, entered;
  const blocked = new Promise(resolve => { release = resolve; });
  const started = new Promise(resolve => { entered = resolve; });
  let first = true;
  Object.defineProperty(h.environment, 'crypto', { configurable: true, value: {
    randomUUID: () => webcrypto.randomUUID(),
    getRandomValues: array => webcrypto.getRandomValues(array),
    subtle: { async digest(...args) { if (first) { first = false; entered(); await blocked; } return webcrypto.subtle.digest(...args); } }
  } });
  h.$('#loomFirstCrossingAction').click();
  await started;
  h.$('#loomFirstCrossingLeave').click();
  release();
  await until(() => !h.$('.loom-builder-shell').hidden, 'leave during local binding');
  await new Promise(resolve => setTimeout(resolve, 30));
  assert.equal(h.root.dataset.firstCrossing, 'idle');
  assert.equal(h.$('#loomFirstCrossing').hidden, true);
  assert.equal(h.environment.localStorage.getItem('td613.loom.first-crossing.v1'), null);
  assert.equal(h.ui.inspect().session, null);
  assert.equal(h.requests.length, 0);
});


test('How it works replay preserves an existing real Loom root and prepared export', async t => {
  const h = practiceHarness(t);
  h.$('#loomFirstCrossingLeave').click();
  await until(() => !h.$('.loom-builder-shell').hidden, 'real builder');
  const task = h.$('#aiTask');
  task.value = 'Prepare the existing real work without replacing it during practice.';
  task.dispatchEvent(new h.environment.Event('input', { bubbles: true }));
  h.$('#aiPreparePortable').click();
  await until(() => h.ui.inspect().session !== null && h.root.getAttribute('aria-busy') !== 'true', 'existing real session');
  const originalSession = h.ui.inspect().session;
  const originalExport = h.$('#aiSessionReceipt').textContent;
  h.$('#loomReturnThreshold').click();
  assert.equal(h.root.dataset.firstCrossing,'active','How it works enters the replay directly');
  h.$('#loomFirstCrossingAction').click();
  h.$('#loomFirstCrossingAction').click();
  await until(() => !h.$('#loomFirstCrossingStop').disabled, 'replayed actual local binding');
  assert.deepEqual(h.ui.inspect().session, originalSession, 'practice creates no replacement root or admitted descendant');
  assert.equal(h.$('#aiSessionReceipt').textContent, originalExport, 'real prepared export remains bound to its original work');
  h.$('#loomFirstCrossingLeave').click();
  await until(() => !h.$('.loom-builder-shell').hidden, 'return to existing real work');
  assert.equal(h.$('#aiTask').value, task.value);
  assert.equal(h.environment.localStorage.getItem('td613.loom.first-crossing.v1'), null);
  assert.equal(h.requests.length, 0);
});


test('completed handoff preview reopens from How it works in one deliberate gesture', async t => {
  const h = practiceHarness(t);
  async function finishPractice(){
    h.$('#loomFirstCrossingAction').click();h.$('#loomFirstCrossingAction').click();
    await until(()=>h.root.dataset.firstCrossingStep==='2','local readiness');
    for(let step=3;step<=6;step++){h.$('#loomFirstCrossingStop').click();await until(()=>h.root.dataset.firstCrossingStep===String(step),'step '+step)}
  }

  await finishPractice();
  assert.equal(h.$('#loomBegin').hidden,false,'completion exposes the live Loom CTA');
  assert.equal(h.$('#loomReplayFirstCrossing').hidden,true,'replay no longer floats over the completed membrane');
  h.$('#loomBegin').click();
  await until(() => !h.$('.loom-builder-shell').hidden,'live builder');
  h.$('#loomReturnThreshold').click();
  assert.equal(h.root.dataset.firstCrossing, 'active', 'How it works starts replay immediately');
  assert.equal(h.root.dataset.firstCrossingStep, '0');
  assert.equal(h.root.dataset.firstCrossingCue, 'step-0');
  assert.equal(h.$('#loomFirstCrossing').hidden, false);
  assert.equal(h.$('#loomThresholdGate').hidden, true);
  for (const item of h.root.querySelectorAll('[data-first-crossing-item]')) {
    assert.equal(item.getAttribute('aria-expanded'), 'false', 'a fresh replay closes prior inspections');
    assert.equal(item.disabled, true, 'opening restores the editorial action before material inspection');
  }
  assert.equal(h.environment.localStorage.getItem('td613.loom.first-crossing.v1'), 'complete', 'actual prior completion remains recorded');
  assert.equal(h.ui.inspect().session, null, 'replay creates no real custody root');
  assert.equal(h.requests.length, 0);
});

test('own-work exit restores the editable task after a previously opened prepared Threshold', async t => {
  const h = practiceHarness(t);
  h.$('#loomFirstCrossingLeave').click();
  await until(() => !h.$('.loom-builder-shell').hidden, 'first own-work entry');
  const originalTask = 'Keep the original task and prepared work while I revisit practice.';
  h.$('#aiTask').value = originalTask;
  h.$('#aiTask').dispatchEvent(new h.environment.Event('input', { bubbles: true }));
  h.$('#aiPreparePortable').click();
  await until(() => h.ui.inspect().session !== null && h.root.getAttribute('aria-busy') !== 'true', 'existing prepared session');
  const originalSession = h.ui.inspect().session;
  const originalExport = h.$('#aiSessionReceipt').textContent;
  assert.equal(h.root.dataset.workspace, 'crossing');
  h.$('#loomReturnThreshold').click();
  h.$('#loomReplayFirstCrossing').click();
  h.$('#loomFirstCrossingLeave').click();
  await until(() => !h.$('.loom-builder-shell').hidden, 'return to previously opened own work');
  assert.equal(h.$('#loomBuilder').hidden, false, 'own-work exit restores the editable task surface');
  assert.equal(h.root.dataset.workspace, 'build');
  assert.equal(h.environment.document.activeElement, h.$('#aiTask'), 'focus returns to the visible editable task');
  assert.equal(h.$('.loom-stage').hidden, true);
  assert.equal(h.$('#loomFirstCrossing').hidden, true);
  assert.equal(h.root.dataset.firstCrossing, 'idle');
  assert.equal(h.$('#aiTask').value, originalTask);
  assert.deepEqual(h.ui.inspect().session, originalSession, 'exiting practice preserves the real prepared root');
  assert.equal(h.$('#aiSessionReceipt').textContent, originalExport);
  assert.equal(h.environment.localStorage.getItem('td613.loom.first-crossing.v1'), null, 'exit grants no unearned practice completion');
  assert.equal(h.requests.length, 0);
});


test('opening overture contains all eight relations without borrowing the à illustration or a second clock', async () => {
  const { loomOpeningPresentation } = await import('../app/dome-world/holonomy-loom/tutorial-membrane.js');
  const { FLOWCORE_CHOREOGRAPHIES } = await import('../app/dome-world/holonomy-loom/flowcore-choreography.js');
  const score = FLOWCORE_CHOREOGRAPHIES[0];
  const opening = loomOpeningPresentation(score);
  assert.equal(opening.tutorial_operator, null);
  assert.equal(opening.flowcore_choreography.relations.length, 8);
  assert.equal(new Set(opening.flowcore_choreography.relations).size, 8);
  assert.match(opening.flowcore_choreography.id,/^ingress-overture-/);
  assert.equal(opening.flowcore_choreography.evidence_class,'TUTORIAL_ILLUSTRATION_ONLY');
  assert.match(workspaceSource,/loomOpeningPresentation\(firstCrossingChoreography\)/);
  assert.match(workspaceSource,/firstCrossingStep===0\?loomOpeningPresentation/);
  assert.doesNotMatch(workspaceSource,/packet\.presentation=\{\.\.\.packet\.presentation,\.\.\.loomTutorialPresentation\(0\)\}/);
});
test('tutorial request and return evidence remain optional in document flow',()=>{
 const doc=new JSDOM(loomWorkspaceTemplate).window.document;
 assert.equal(doc.querySelectorAll('[data-first-crossing-item]').length,2);
 assert.match(doc.querySelector('[data-first-crossing-item=source]').textContent,/References/);
 assert.ok(doc.querySelector('#loomTutorialProofRecord').closest('details'));
 assert.match(product,/position:static/);assert.equal(doc.querySelector('#loomBegin').textContent.trim(),'Try Loom →');
});


test('request review shows literal selected content without rendering markup or leaking unselected files', async t => {
  const h=practiceHarness(t);
  h.$('#loomFirstCrossingLeave').click();
  const selected='<img src=x onerror=alert(1)> Selected reference text';
  const privateBody='PRIVATE_REVIEW_BODY_MUST_STAY_LOCAL';
  const file=(name,body)=>{const data=new TextEncoder().encode(body);return {name,type:'text/plain',size:data.byteLength,arrayBuffer:async()=>data.buffer};};
  Object.defineProperty(h.$('#aiUpload'),'files',{configurable:true,value:[file('selected.txt',selected),file('private.txt',privateBody)]});
  h.$('#aiUpload').dispatchEvent(new h.environment.Event('change',{bubbles:true}));
  await until(()=>h.$('#aiDocuments').querySelectorAll('input[type=checkbox]').length===2,'local files');
  const choices=h.$('#aiDocuments').querySelectorAll('input[type=checkbox]');
  assert.equal(choices[0].checked,false);assert.equal(choices[1].checked,false);
  choices[0].click();
  h.$('#aiTask').value='Summarize the selected source. <b>Keep this literal.</b>';
  h.$('#aiTask').dispatchEvent(new h.environment.Event('input',{bubbles:true}));
  h.$('#aiPreparePortable').click();
  await until(()=>!h.$('#aiResult').hidden&&h.root.getAttribute('aria-busy')!=='true','request review');
  const review=h.$('#aiAnswer');
  assert.ok(review.textContent.includes(selected));
  assert.ok(review.textContent.includes(h.$('#aiTask').value));
  assert.ok(review.textContent.includes('AI instructions'));
  assert.equal(review.querySelector('img,b'),null,'source bytes are text, never executable markup');
  assert.ok(!review.textContent.includes(privateBody));
  assert.ok(!review.textContent.includes('private.txt'));
  assert.equal(h.requests.length,0,'review cannot send to an AI provider');
});

test('independent Lab links preserve unsent Loom work by opening another tab without an opener', () => {
  const doc = new JSDOM(html).window.document;
  const topLink = doc.querySelector('nav[aria-label="Loom utilities"] a[href="/dome-world/loom-instrument-lab.html"]');
  const workspace = new JSDOM(loomWorkspaceTemplate).window.document;
  const innerLink = workspace.querySelector('a[href="/dome-world/loom-instrument-lab.html"]');
  for (const link of [topLink, innerLink]) {
    assert.ok(link, 'independent Lab entrance is present');
    assert.equal(link.target, '_blank', 'Lab must not navigate the current Loom document');
    assert.ok(link.relList.contains('noopener'), 'new Lab tab must not acquire live opener');
    assert.ok(link.relList.contains('noreferrer'), 'new Lab tab must not receive referrer information');
    assert.match(link.title, /tab/);
  }
});


test('Loom versioned entry loads the actual rewritten template and nested instrument renderer',()=>{
  assert.match(workspaceSource,/workspace-template\.js\?v=20261015-restoration-v5/);
  assert.match(workspaceSource,/runtime-state-view\.js\?v=20261015-restoration-v5/);
  assert.match(runtimeModuleSource,/instrument-state-view\.js\?v=20261015-restoration-v5/);
  assert.match(templateSource,/loomScienceTools/);
  assert.match(instrumentSource,/Keep all 39 illustrated carriers/);
});


test('queued Tools close cannot steal a newer focus choice or a reopened dialog', async t=>{
  const h=practiceHarness(t);
  h.$('#loomFirstCrossingLeave').click();
  await until(()=>!h.$('.loom-builder-shell').hidden,'editable builder');
  const boundary=h.$('#loomBoundaryOpen'),rules=h.$('#loomRulesOpen'),dialog=h.$('#loomTools'),input=h.$('#aiRules');
  boundary.focus();boundary.click();dialog.removeAttribute('open');
  rules.focus();dialog.dispatchEvent(new h.environment.Event('close'));
  assert.equal(h.environment.document.activeElement,rules,'late close preserves a newer outside focus choice');
  rules.click();input.focus();dialog.dispatchEvent(new h.environment.Event('close'));
  assert.equal(h.environment.document.activeElement,input,'late close preserves focus in a reopened dialog');
  dialog.removeAttribute('open');dialog.dispatchEvent(new h.environment.Event('close'));
  assert.equal(h.environment.document.activeElement,rules,'closed dialog restores opener when focus is stranded inside');
});


test('79%-era Loom couture is restored as a visual skin without resetting functional controller', () => {
  const i = product.indexOf('/* Operator-rated 79% couture recovery (2026-10-17).');
  assert.ok(i > 0, 'reviewable historical visual-source boundary');
  const skin = product.slice(i);
  assert.match(skin, /:not\(\[data-first-crossing-step="0"\]\) \.loom-first-crossing\{/);
  assert.match(skin, /background:var\(--glass\)/);
  assert.match(skin, /border-radius:52px 6px 52px 6px/);
  assert.match(skin, /linear-gradient\(112deg,#efecf4/);
  assert.match(skin, /@media\(prefers-reduced-transparency:reduce\)/);
  assert.match(html, /loom-couture\.css\?v=20261017-79-couture-v1/);
  // Step 0 retains the independently restored opening and its lavender serif ending.
  assert.match(product.slice(0, i), /loom-headline-line em/);
});
