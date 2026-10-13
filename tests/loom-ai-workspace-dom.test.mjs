Warning: truncated output (original token count: 11498)
Total output lines: 646

/** Synthetic DOM workflow witness: real workspace/intake with an explicitly stubbed HTTP response.
 * These checks exercise client behavior; they provide no live Gemini or visual-browser evidence.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { JSDOM } from 'jsdom';
import { File } from 'node:buffer';
import { webcrypto } from 'node:crypto';
// Import before supplying any browser globals: auto-mount must not run in the harness.
import { mountLoomAiWorkspace } from '../app/dome-world/holonomy-loom/ai-workspace.js';
import { LOOM_AI_PROJECTS } from '../app/dome-world/holonomy-loom/ai-projects.js';
test('Holonomy Loom browser wait extends beyond the retired 55-second ceiling', () => {
  const source = fs.readFileSync('app/dome-world/holonomy-loom/ai-workspace.js', 'utf8');
  assert.match(source, /LOOM_AI_CLIENT_TIMEOUT_MS = 225000/);
  assert.match(source, /setTimeout\(\(\)=>\{clientDeadlineExceeded=true;controller\?\.abort\(\);\},LOOM_AI_CLIENT_TIMEOUT_MS\)/);
  assert.doesNotMatch(source, /\},55000\);const started=/);
});

const deferred = () => { let resolve, reject; const promise = new Promise((a,b)=>{resolve=a;reject=b;}); return {promise,resolve,reject}; };
const until = async (predicate, description='workflow completion') => {
  const deadline = Date.now() + 3000;
  while (!predicate()) { if (Date.now() > deadline) throw new Error(`Timed out awaiting ${description}`); await new Promise(resolve=>setTimeout(resolve,5)); }
};
function chooseNewRoot(h){
  assert.equal(h.$('#aiNewRootNotice').hidden,false,'active custody replacement has a consequence notice');
  h.$('#aiNewRootConfirm').checked=true;
  h.$('#aiNewRootConfirm').dispatchEvent(new h.window.Event('change',{bubbles:true}));
}
function admitted(request, extra = {}) {
  return {schema:'td613.loom.ai-task-result/v0.1',status:'completed',request_id:request.request_id,
    answer:'SYNTHETIC HTTP FIXTURE: the records conflict on retention. Resolve t…10498 tokens truncated…s closed',async t=>{
  const h=harness(t,request=>response(admitted(request,{answer:'We conclude a fast retry triggered duplicate writes.'})));
  h.load(2);h.$('#aiRun').click();await h.settled();
  assert.match(h.$('#aiResultEyebrow').textContent,/NEEDS REVIEW/);
  assert.match(h.$('#aiAnswer').textContent,/fast retry triggered duplicate writes/);
  for(const id of ['aiMarrowline','aiExport','aiCopy'])assert.equal(h.$('#'+id).disabled,true);
  assert.equal(h.$('#aiPortableDrawer').hasAttribute('open'),true);
  h.$('#aiPreparePortable').click();await h.settled();
  assert.equal(h.calls.length,1,'task-only recovery makes no extra model call');
  assert.equal(h.$('#aiCopy').disabled,false);
  assert.doesNotMatch(h.$('#aiAnswer').textContent,/triggered duplicate writes/);
});

test('successful incident places evidence before the collapsed exact instruction',async t=>{
  const h=harness(t,request=>response(admitted(request,{answer:'Actual duplicated effects remain uncertain.'})));
  h.load(2);h.$('#aiRun').click();await h.settled();
  const task=h.$('#aiSubmittedTask'),answer=h.$('#aiAnswer');
  assert.equal(task.tagName,'DETAILS');assert.equal(task.open,false);
  assert.equal(h.$('#aiSubmittedTaskText').textContent,LOOM_AI_PROJECTS[2].task);
  assert.ok(answer.querySelector('.ai-result-takeaway'));
  assert.ok(answer.compareDocumentPosition(task)&4,'orientation and answer precede exact-instruction inspection');
});

test('an accepted model response without optional telemetry reaches completed state without inventing diagnostics',async t=>{
  const h=harness(t,request=>{const result=admitted(request);delete result.observations;return response(result);});
  h.load(0);h.$('#aiRun').click();await h.settled();
  assert.equal(h.ui.inspect().events.at(-1).phase,'completed');
  assert.equal(Object.hasOwn(h.ui.inspect().events.at(-1),'observations'),false);
  assert.equal(h.$('#aiExport').disabled,false);
  assert.doesNotMatch(h.$('#aiStatus').textContent,/acyclic|held/i);
});
