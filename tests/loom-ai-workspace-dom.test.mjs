/** Synthetic DOM workflow witness: real workspace/intake with an explicitly stubbed HTTP response.
 * These checks exercise client behavior; they provide no live Gemini or visual-browser evidence.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { File } from 'node:buffer';
import { webcrypto } from 'node:crypto';
// Import before supplying any browser globals: auto-mount must not run in the harness.
import { mountLoomAiWorkspace } from '../app/dome-world/holonomy-loom/ai-workspace.js';
import { LOOM_AI_PROJECTS } from '../app/dome-world/holonomy-loom/ai-projects.js';

const deferred = () => { let resolve, reject; const promise = new Promise((a,b)=>{resolve=a;reject=b;}); return {promise,resolve,reject}; };
const until = async (predicate, description='workflow completion') => {
  const deadline = Date.now() + 3000;
  while (!predicate()) { if (Date.now() > deadline) throw new Error(`Timed out awaiting ${description}`); await new Promise(resolve=>setTimeout(resolve,5)); }
};
function admitted(request, extra = {}) {
  return {schema:'td613.loom.ai-task-result/v0.1',status:'completed',request_id:request.request_id,
    answer:'SYNTHETIC HTTP FIXTURE: the records conflict on retention. Resolve the requirement before authorizing migration.',
    missing_information:['The signed retention amendment remains missing.'],used_document_ids:request.documents.map(d=>d.id),
    suggested_next_step:'Ask for the signed retention schedule.',observations:{provider_calls:1,elapsed_ms:75,source_claims:'model-reported-unverified'},...extra};
}
function response(body, status=200) { return {ok:status>=200&&status<300,status,text:async()=>JSON.stringify(body)}; }
function harness(t, responder=(request)=>response(admitted(request)), reduced=false) {
  const dom=new JSDOM('<section id="fixture"></section>',{url:'https://td613.com/dome-world/holonomy-loom.html'});
  const window=dom.window,root=window.document.querySelector('#fixture');
  const calls=[],frames=new Map();let sequence=0;
  const beforeRaf=globalThis.requestAnimationFrame,beforeCancel=globalThis.cancelAnimationFrame;
  globalThis.requestAnimationFrame=callback=>{const id=++sequence;frames.set(id,callback);return id;};
  globalThis.cancelAnimationFrame=id=>frames.delete(id);
  Object.defineProperty(window,'crypto',{configurable:true,value:webcrypto});
  window.matchMedia=()=>({matches:reduced,addEventListener(){},removeEventListener(){}});
  window.fetch=(url,options)=>{const request=JSON.parse(options.body);calls.push({url,options,request});return Promise.resolve(responder(request,options));};
  const ui=mountLoomAiWorkspace(root,window);
  let disposed=false;
  const dispose=()=>{if(!disposed){disposed=true;ui.dispose();}};
  t.after(()=>{dispose();window.close();if(beforeRaf===undefined)delete globalThis.requestAnimationFrame;else globalThis.requestAnimationFrame=beforeRaf;if(beforeCancel===undefined)delete globalThis.cancelAnimationFrame;else globalThis.cancelAnimationFrame=beforeCancel;});
  const $=selector=>root.querySelector(selector);
  const change=(selector,value)=>{const element=$(selector);element.value=value;element.dispatchEvent(new window.Event('input',{bubbles:true}));};
  const load=(index=0)=>$(`[data-project="${LOOM_AI_PROJECTS[index].id}"]`).click();
  const upload=file=>{const input=$('#aiUpload');Object.defineProperty(input,'files',{configurable:true,value:[file]});Object.defineProperty(input,'value',{configurable:true,writable:true,value:'fixture-file-selected'});input.dispatchEvent(new window.Event('change',{bubbles:true}));};
  const settled=()=>until(()=>root.getAttribute('aria-busy')!=='true',`request completion: ${$('#aiStatus').textContent}`);
  const submitted=()=>until(()=>calls.length>0||root.getAttribute('aria-busy')!=='true','request dispatch');
  return {window,root,ui,$,calls,frames,change,load,upload,dispose,settled,submitted};
}

test('loading each real practice project sends nothing; a click submits one selected packet',async t=>{
  const h=harness(t);
  for(let i=0;i<LOOM_AI_PROJECTS.length;i++){h.load(i);assert.equal(h.calls.length,0);assert.equal(h.$('#aiTask').value,LOOM_AI_PROJECTS[i].task);}
  h.load(0);const project=LOOM_AI_PROJECTS[0];h.$('#aiRun').click();await h.settled();
  assert.equal(h.calls.length,1);const call=h.calls[0];
  assert.equal(call.url,'/api/khonapolit?operation=loom-task');assert.equal(call.options.method,'POST');
  assert.deepEqual(call.request.documents,project.documents.filter(d=>d.share===true).map(({share,...document})=>document));
  for(const term of project.protectedTerms)assert.equal(call.options.body.includes(term),false);
  for(const document of project.documents.filter(d=>d.share!==true)){assert.equal(call.options.body.includes(document.text),false);assert.equal(call.request.documents.some(d=>d.id===document.id),false);}
  assert.equal(Object.hasOwn(call.request,'protectedTerms'),false);
  assert.equal(h.$('#aiResult').hidden,false);assert.match(h.$('#aiAnswer').textContent,/SYNTHETIC HTTP FIXTURE/);
  assert.equal(h.$('#aiMarrowline').disabled,false);assert.equal(h.$('#aiExport').disabled,false);
  assert.equal(h.ui.inspect().clock.pendingFrames,0);
  const completion=h.ui.inspect().events.find(event=>event.phase==='completed');
  assert.match(completion.aia.input_digest,/^[a-f0-9]{64}$/);
  assert.equal(completion.aia.fadt_admission,true);
  assert.ok(completion.aia.projection_family_verified);
});
test('private phrase admission fails before HTTP and clears prior accepted answer',async t=>{
  const h=harness(t);h.load();h.$('#aiRun').click();await h.settled();assert.equal(h.$('#aiResult').hidden,false);
  h.change('#aiTask',h.$('#aiTask').value+' '+LOOM_AI_PROJECTS[0].protectedTerms[0]);h.$('#aiRun').click();await h.settled();
  assert.equal(h.calls.length,1);assert.equal(h.$('#aiResult').hidden,true);assert.equal(h.$('#aiAnswer').textContent,'');
  assert.equal(h.$('#aiExport').disabled,true);assert.match(h.$('#aiStatus').textContent,/private phrase/);
});
test('a model reply echoing a local canary stays withheld and never renders markup',async t=>{
  const term=LOOM_AI_PROJECTS[0].protectedTerms[0];
  const h=harness(t,request=>response(admitted(request,{answer:`<img src=x onerror=alert(1)> ${term}`})));
  h.load();h.$('#aiRun').click();await h.settled();
  assert.equal(h.calls.length,1);assert.equal(h.$('#aiResult').hidden,true);assert.equal(h.$('#aiAnswer').textContent,'');
  assert.equal(h.root.querySelector('img'),null);assert.match(h.$('#aiStatus').textContent,/PROTECTED_RESPONSE/);
  assert.equal(h.$('#aiCopy').disabled,true);
});
test('HTTP errors remove prior result and never disclose an untrusted error body',async t=>{
  let fail=false;const sensitive='UNTRUSTED_ERROR_SECRET_219';
  const h=harness(t,request=>fail?response({message:sensitive,error:sensitive},503):response(admitted(request)));
  h.load();h.$('#aiRun').click();await h.settled();fail=true;h.$('#aiRun').click();await h.settled();
  assert.equal(h.calls.length,2);assert.equal(h.$('#aiAnswer').textContent,'');assert.equal(h.$('#aiResult').hidden,true);
  assert.equal(h.$('#aiStatus').textContent.includes(sensitive),false);assert.match(h.$('#aiStatus').textContent,/503/);
  assert.equal(h.$('#aiMarrowline').disabled,true);
});
test('malformed response text gets a bounded error without parser excerpts',async t=>{
  const h=harness(t,()=>({ok:true,status:200,text:async()=>'{SECRET_FROM_INVALID_JSON_33'}));h.load();h.$('#aiRun').click();await h.settled();
  assert.equal(h.$('#aiStatus').textContent.includes('SECRET_FROM_INVALID_JSON_33'),false);
  assert.match(h.$('#aiStatus').textContent,/unreadable/);assert.equal(h.$('#aiResult').hidden,true);
});
test('a slow local upload cannot land in a subsequently selected project',async t=>{
  const h=harness(t),read=deferred();h.load(0);
  const file={name:'old-project.txt',type:'text/plain',size:8,arrayBuffer:()=>read.promise};h.upload(file);h.load(1);
  read.resolve(new TextEncoder().encode('OLD_FILE').buffer);await until(()=>h.$('#aiStatus').textContent.includes('Workspace changed'),'stale upload rejection');
  assert.equal(h.$('#aiDocuments').textContent.includes('old-project.txt'),false);
  assert.equal(h.$('#aiTask').value,LOOM_AI_PROJECTS[1].task);assert.equal(h.calls.length,0);
});
test('a slow upload finishing during a request never changes its selected packet',async t=>{
  const read=deferred(),requestReturn=deferred();const h=harness(t,()=>requestReturn.promise);h.load();
  h.upload({name:'late.txt',type:'text/plain',size:8,arrayBuffer:()=>read.promise});h.$('#aiRun').click();
  read.resolve(new TextEncoder().encode('LATE_DOC').buffer);await h.submitted();await until(()=>h.$('#aiUpload').value==='','pending upload handler completion');
  assert.equal(h.calls.length,1);assert.equal(h.$('#aiDocuments').textContent.includes('late.txt'),false);
  assert.equal(h.calls[0].options.body.includes('LATE_DOC'),false);
  requestReturn.resolve(response(admitted(h.calls[0].request)));await h.settled();
  assert.equal(h.$('#aiResult').hidden,false);
});
test('fresh imports remain local until an explicit document selection',async t=>{
  const h=harness(t);h.change('#aiTask','Summarize the supplied measurements.');
  h.upload(new File(['temperature,day\n12,1'],'measurements.csv',{type:'text/csv'}));await until(()=>Boolean(h.$('#aiDocuments input')),'document import');
  const checkbox=h.$('#aiDocuments input');assert.equal(checkbox.checked,false);assert.equal(h.calls.length,0);
  checkbox.checked=true;checkbox.dispatchEvent(new h.window.Event('change',{bubbles:true}));h.$('#aiRun').click();await h.settled();
  assert.equal(h.calls[0].request.documents.length,1);assert.equal(h.calls[0].request.documents[0].text,'temperature,day\n12,1');
});
test('editing the accepted task invalidates every receiver transfer action',async t=>{
  const h=harness(t);h.load();h.$('#aiRun').click();await h.settled();
  assert.equal(h.$('#aiExport').disabled,false);h.change('#aiRules',h.$('#aiRules').value+'\nRequire line references.');
  for(const id of ['aiExport','aiCopy','aiMarrowline'])assert.equal(h.$('#'+id).disabled,true);
  assert.equal(h.$('#aiResult').hidden,true);assert.equal(h.$('#aiAnswer').textContent,'');assert.equal(h.calls.length,1);
});
test('reduced motion keeps the same request consequences with zero pending frames',async t=>{
  const pending=deferred(),h=harness(t,()=>pending.promise,true);h.load();h.$('#aiRun').click();await h.submitted();
  assert.equal(h.ui.inspect().clock.pendingFrames,0);assert.equal(h.$('#aiGlyph').textContent,'à');
  assert.equal(h.ui.inspect().events.find(e=>e.phase==='pending').provider_call_observed,false);
  pending.resolve(response(admitted(h.calls[0].request)));await h.settled();
  assert.equal(h.$('#aiResult').hidden,false);assert.equal(h.$('#aiGlyph').textContent,'𝄐');assert.equal(h.ui.inspect().clock.pendingFrames,0);
});
test('stop waiting aborts the client request and leaves all output routes closed',async t=>{
  const h=harness(t,(_request,options)=>new Promise((_resolve,reject)=>options.signal.addEventListener('abort',()=>reject(new DOMException('aborted','AbortError')),{once:true})));
  h.load();h.$('#aiRun').click();await h.submitted();assert.equal(h.$('#aiStop').hidden,false);
  h.$('#aiStop').click();await h.settled();
  assert.equal(h.calls.length,1);assert.equal(h.calls[0].options.signal.aborted,true);
  assert.equal(h.$('#aiResult').hidden,true);assert.equal(h.$('#aiExport').disabled,true);
  assert.match(h.$('#aiStatus').textContent,/already submitted cannot be recalled/);
  assert.equal(h.ui.inspect().clock.pendingFrames,0);
});
