import {test,after} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';

// Source-bound guard: no UI relocation may mutate the research corpus or
// promote a local presentation operation to a machine-authorized write.
const source=readFileSync(new URL('../app/encyclopedia/vix-cyb.html',import.meta.url),'utf8');
const dom=new JSDOM(source,{url:'https://vixen.example/encyclopedia/vix-cyb.html'});
const doc=dom.window.document;
const one=(s)=>doc.querySelector(s);

test('Entrance is an encounter, not a rollback or synthesis control plane',()=>{
 const entry=one('#view-overview');
 assert(entry,'Frontispiece route must exist');
 assert(entry.querySelector('#cover'),'Approved frontispiece still owns the Entrance');
 assert(entry.querySelector('.vix-entrance-research-door'),'Entrance offers a research doorway');
 assert(!entry.querySelector('#ciSynthesisLogList,#ciResetBtn,#ciQuestionInput,#ciMetricVernier,#ciCandidateGrid,#ciConjectureGrid'));
 assert(entry.querySelector('button[data-view="collection"]'),'Research doorway must reach the Salon');
});

test('Source-first Salon owns the research question, candidate scoring and conjectures',()=>{
 const salon=one('#view-collection');
 assert(salon,'Source-first Salon must remain');
 const studio=salon.querySelector('#constitutiveInquiry');
 assert(studio,'Original studio controller must be mounted in Salon, not duplicated');
 for(const id of ['ciQuestionInput','ciMethodInput','ciApplyBtn','ciCandidateGrid','ciConjectureGrid','ciLagInput']){
  assert(studio.querySelector('#'+id),'Salon must retain '+id);
  assert.equal(doc.querySelectorAll('#'+id).length,1,'No duplicate controller '+id);
 }
 assert(salon.querySelector('#vixenAiJourney'));
 assert(salon.querySelector('#vixenSynthesisSalon'));
 assert(salon.querySelector('button[data-view="operator"]'),'Salon must link to operator review');
});

test('Human operator route owns presentation history, diagnostics and machine-boundary explanation',()=>{
 const op=one('#view-operator');
 assert(op?.hidden,'Operator route must begin closed');
 assert.equal(op.dataset.page,'operator');
 for(const id of ['ciSynthesisLogList','ciLogCount','ciResetBtn','ciMetricVernier','ciMetricFadtXor','ciActiveEntryBadge']){
  assert(op.querySelector('#'+id),'Operator route must retain '+id);
  assert.equal(doc.querySelectorAll('#'+id).length,1);
 }
 assert(op.querySelector('#vixOperatorPodium'));
 assert(op.querySelector('a[href="./vix-cyb/llms.txt"]'),'Human operator route must point at the source-first research guide, not privileged machine routes');
 assert(op.querySelector('button[data-action="inspector"]'));
 assert.doesNotMatch(op.textContent,/EXPERIMENT[_ -]?A|PREVIEW[_ -]?AUTHORIZED|PRODUCTION REQUIRES OPERATOR SECRET|human approval|human authorization/i,
  'Podium public copy must omit backstage release-gate notes; approval remains enforced by machine contracts');
 assert(source.includes("'reference', 'operator'"),'Operator hash must be included in routing whitelist');
 assert(one('.footer [data-view="operator"]'));
 assert(one('#mobileNav [data-view="operator"]'));
 assert.equal(doc.querySelectorAll('.vixen-room-rail .vixen-room').length,8,
  'Podium Settings is a control route, not an invented ninth Opera room');
});

test('Local rollback requires an acknowledged comparative review, never raw one-click mutation',()=>{
 const dialog=one('#vixenRestoreReviewDialog');
 assert(dialog,'Diff review dialog required');
 assert(dialog.querySelector('#vixRestoreComparison'));
 assert(dialog.querySelector('#vixRestoreScopeAcknowledge'));
 assert(dialog.querySelector('#vixRestoreReviewConfirm').disabled);
 assert.match(source,/btn\.addEventListener\('click', \(\) => requestRestoreSnapshot\(entry\.entry_id\)\)/);
 assert.doesNotMatch(source,/btn\.addEventListener\('click', \(\) => restoreSnapshot\(entry\.entry_id\)\)/);
 assert.match(source,/function requestRestoreSnapshot\(targetEntryId\)/);
 assert.match(source,/restoreSnapshot: requestRestoreSnapshot/);
 assert.match(source,/if \(!pendingLocalRestore \|\| !document\.getElementById\('vixRestoreScopeAcknowledge'\)\?\.checked\) return/);
 assert.match(source,/recordInSessionEntry\(/);
 assert.match(source,/session-local rollback|local rollback event/i);
});

test('Advanced hypothetical reset and search ablation are contextual, not first-view obstacles',()=>{
 const hypothetical=one('#view-gates .vix-gate-advanced-reset');
 assert(hypothetical);
 assert(hypothetical.querySelector('#resetGatesBtn'));
 assert(!hypothetical.open);
 const search=one('#vixenFusionConsole');
 assert(search);
 assert(!search.open);
 assert(search.querySelectorAll('[data-fusion-channel]').length>=4,
  'Advanced search must keep independent lexical, semantic, semiotic and documentary channels');
});

test('Research data and immutable performer boundaries remain intact',()=>{
 const corpusScript=one('#vixen-corpus-bundle');
 assert(corpusScript);
 const corpus=JSON.parse(corpusScript.textContent);
 assert.equal(corpus.works.length,32);
 assert.equal(corpus.instruments.length,21);
 assert.equal(corpus.human_gates.length,8);
 assert.equal(corpus.giveback_tracks.length,6);
 assert.equal(corpus.works.every(w=>w.authorship==='UNRESOLVED'),true);
 assert.equal(one('#vixenSynthesisSalon').getAttribute('data-stage-role'),'VIXEN_OPERA');
 assert.equal(one('#view-operator').querySelectorAll('[data-stage-role="PERFORMER"]').length,0);
});

after(()=>dom.window.close());
