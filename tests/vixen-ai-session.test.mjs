import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {createVixenAiSession,formatVixenChatCard} from '../app/encyclopedia/vixen-estate/vixen-ai-session.mjs';
import {conductVixenNarrativeTurn} from '../app/encyclopedia/vixen-estate/vixen-ai-conductor.mjs';
import {createVixenPodium,PODIUM_SCHEMA,PODIUM_ROUTES} from '../app/encyclopedia/reference/vixen-podium.mjs';
const html=readFileSync(fileURLToPath(new URL('../app/encyclopedia/vix-cyb.html',import.meta.url)),'utf8');
const m=html.match(/<script[^>]*id="vixen-corpus-bundle"[^>]*>([\s\S]*?)<\/script>/);
assert(m,'Vixen real corpus must be available for AI journey tests');
const corpus=JSON.parse(m[1]),ids=corpus.works.map(x=>x.work_id);
const task=(intent,params={})=>({schema:PODIUM_SCHEMA,intent,params});
test('Maestro and Composer are exclusive session ontologies and cannot silently change',async()=>{
 const session=createVixenAiSession({corpus});
 assert.equal(session.status().status,'HELD');
 assert.equal((await session.start({role:'UNDECLARED'})).status,'HELD');
 const first=await session.start({role:'MAESTRO',goal:'control and memory'});
 assert.equal(first.status,'SUPPORTED');
 assert.equal(first.result.role,'MAESTRO');
 assert.equal(first.result.opening_turn.schema,'vixen.ai.narrative-conductor/v1');
 assert.equal((await session.start({role:'COMPOSER'})).status,'HELD');
 assert.equal(session.status().result.role,'MAESTRO');
 const ended=session.finish();
 assert.equal(ended.status,'SUPPORTED');
 const switched=await session.start({role:'COMPOSER',goal:'find a falsifier'});
 assert.equal(switched.status,'SUPPORTED');
 assert.equal(session.status().result.role,'COMPOSER');
});
test('Source-anchored journey does actual bounded read routing without confounding source and connection',async()=>{
 let calls=[];
 const session=createVixenAiSession({corpus,
  readCart:()=>[ids[0],ids[0],'FABRICATED_WORK'],
  hostRead:async({intent,params})=>{
   calls.push({intent,params});
   return {status:'SUPPORTED',result:{work_id:params.work_id,linked_sources:[],identity_status:'UNRESOLVED'}};
  }
 });
 const started=await session.start({role:'MAESTRO',goal:'drone coordination and wearable systems'});
 assert.equal(started.status,'SUPPORTED');
 assert.equal(started.result.opening_turn.role,'MAESTRO');
 assert.equal(started.result.opening_turn.provenance.no_admitted_crosswalk,true);
 assert(calls.length>0&&calls.length<=2);
 assert(calls.every(x=>['vixen.work.inspect','vixen.fusion.search'].includes(x.intent)));
 assert(started.result.opening_turn.source_candidates.every(x=>ids.includes(x.work_id)));
 const recommended=started.result.opening_turn.research_cart_recommendation;
 assert.equal(recommended.action,'SUGGEST_ONLY_NOT_MUTATION');
 const stage=session.status().result;
 assert.deepEqual(stage.cart_ids,[ids[0]]);
 assert.equal(stage.program_notes_permission,'NOT_REQUESTED');
 assert.equal(stage.note_count,0);
 const branch=await session.choose({choice_id:'compare',source_work_id:recommended.work_id});
 assert.equal(branch.status,'SUPPORTED');
 assert(branch.result.narrative.quests.some(x=>x.actor==='AI'));
 assert(branch.result.narrative.quests.some(x=>x.actor==='HUMAN'));
 assert(branch.result.narrative.quests.some(x=>x.actor==='COLLABORATIVE'));
 assert.equal(session.notes().status,'HELD');
 assert.match(formatVixenChatCard(branch.result.chat_card),/Field missions/);
 assert.equal(session.archive().result.original_corpus_modified,false);
});
test('Human mission reports are optional user testimony and prompt bounded counterexample follow-ups',async()=>{
 const session=createVixenAiSession({corpus});
 const opening=await session.start({role:'MAESTRO'});
 const mission=opening.result.opening_turn.quests.find(q=>q.actor==='HUMAN');
 assert(mission);
 const missing=await session.report({quest_id:mission.quest_id});
 assert.equal(missing.status,'HELD');
 const done=await session.report({quest_id:mission.quest_id,
  observation:'The selected instrument describes a different order of operations than I expected.'});
 assert.equal(done.status,'SUPPORTED');
 assert.equal(done.result.report.evidence_class,'USER_REPORT_UNVERIFIED');
 assert.equal(done.result.report.crosswalk_proven,false);
 assert(done.result.research_turn?.narrative);
 assert.equal(session.archive().result.visitor_reports.length,1);
 assert.equal((await session.report({quest_id:mission.quest_id,skip:true})).status,'HELD');
});
test('Program Notes cannot be silently authored, pre-consent backfilled, or granted via a task boolean',async()=>{
 const session=createVixenAiSession({corpus});
 await session.start({role:'COMPOSER'});
 await session.choose({choice_id:'question'});
 assert.equal(session.notes().status,'HELD');
 assert.equal(session.archive().result.program_notes,undefined);
 assert.equal((await session.permission({phase:'grant',proof:true})).status,'HELD');
 assert.equal((await session.permission({phase:'request'})).status,'HELD');
 assert.equal((await session.permission({phase:'grant',proof:true})).status,'HELD',
  'no independent host-provided verifier means no note authoring');
 assert.equal(session.status().result.note_count,0);
 const secret=Symbol('gesture');
 const authorized=createVixenAiSession({corpus,
  verifyProgramNotesConsent:({proof})=>proof===secret});
 await authorized.start({role:'MAESTRO'});
 await authorized.choose({choice_id:'source'});
 await authorized.permission({phase:'request'});
 assert.equal((await authorized.permission({phase:'grant',proof:secret})).status,'SUPPORTED');
 assert.equal(authorized.status().result.note_count,0,
  'permission cannot retroactively author previous narrative');
 const future=await authorized.choose({choice_id:'compare'});
 assert.equal(future.status,'SUPPORTED');
 assert.equal(authorized.status().result.note_count,1);
 assert.equal(authorized.notes().status,'SUPPORTED');
 await authorized.permission({phase:'revoke'});
 await authorized.choose({choice_id:'source'});
 assert.equal(authorized.status().result.note_count,1,'revoke prevents new authoring');
});
test('Podium routes let an AI conductor branch, report and export while remaining read-only',async()=>{
 const membrane={status:()=>({state:'UNOPENED'}),open:async()=>({state:'HELD'}),
  search:()=>[],getRecord:async()=>null,related:()=>[]};
 const podium=createVixenPodium({corpus,membrane});
 const declared=['vixen.ai.start','vixen.ai.choose','vixen.ai.report','vixen.ai.status',
  'vixen.ai.notes','vixen.ai.handoff','vixen.ai.archive','vixen.ai.finish'];
 assert(declared.every(x=>PODIUM_ROUTES.includes(x)));
 const a=await podium.dispatch(task('vixen.ai.start',{role:'MAESTRO',goal:'archival memory'}));
 assert.equal(a.status,'SUPPORTED');
 const roleBlock=await podium.dispatch(task('vixen.ai.start',{role:'COMPOSER'}));
 assert.equal(roleBlock.status,'HELD');
 const next=await podium.dispatch(task('vixen.ai.choose',{choice_id:'compare'}));
 assert.equal(next.status,'SUPPORTED');
 assert.equal(next.result.narrative.provenance.no_admitted_crosswalk,true);
 const h=await podium.dispatch(task('vixen.ai.handoff'));
 assert.equal(h.status,'SUPPORTED');
 assert.equal(h.result.role,'MAESTRO');
 assert.equal(h.result.program_notes_permission,'NOT_REQUESTED');
 const consent=await podium.dispatch(task('vixen.ai.notes',{phase:'request'}));
 assert.equal(consent.status,'HELD');
 assert.equal((await podium.dispatch(task('vixen.ai.notes',{phase:'grant',proof:true}))).status,'HELD');
 assert.equal((await podium.dispatch(task('vixen.ai.archive'))).result.release_authority,false);
});
test('The site mounts actual role controls and a source-only browser guide',()=>{
 assert.match(html,/id="vixenAiJourney"/);
 assert.match(html,/data-vma-role="MAESTRO"/);
 assert.match(html,/data-vma-role="COMPOSER"/);
 assert.match(html,/vixen-ai-journey\.mjs/);
 assert.match(html,/vixen-ai-journey\.css/);
 const js=readFileSync(fileURLToPath(new URL('../app/encyclopedia/vixen-estate/vixen-ai-journey.mjs',import.meta.url)),'utf8');
 assert.match(js,/model_connected:false/);
 assert.match(js,/window\.VIXEN_STUDY_TRAY/);
 assert.match(js,/verifyProgramNotesConsent/);
 assert.doesNotMatch(js,/fetch\(['"]https?:\/\//);
});

test('Full semantic-semiotic source-index results, when qualified, inform a bounded Maestro recommendation',async()=>{
 const target=corpus.works[13],source=target.linked_sources[0];
 let searches=0;
 const sess=createVixenAiSession({corpus,hostRead:async({intent,params})=>{
  if(intent==='vixen.fusion.search'){
   searches++;
   return {status:'SUPPORTED',result:{search:{fusion_state:'FULL_INDEX_FUSION',
    hits:[{id:'source-bound-synthetic-test',source_file_id:source.source_file_id,
      citation:'Test citation only',score_total:0.92}]}}};
  }
  return {status:'SUPPORTED',result:{work_id:params.work_id,
   linked_sources:[],identity_status:'UNRESOLVED'}};
 }});
 const opening=await sess.start({role:'MAESTRO',goal:'Investigate an unexpected connection'});
 assert.equal(opening.status,'SUPPORTED');
 assert.equal(searches,1,'Opening must attempt information-bearing full-index retrieval');
 assert.equal(opening.result.opening_turn.provenance.full_index_fusion_used,true);
 assert.equal(opening.result.opening_turn.featured_work.work_id,target.work_id);
 assert(opening.result.opening_turn.featured_work.provenance_reason
  .some(x=>/semantic-semiotic/.test(x)));
 assert.equal(opening.result.opening_turn.provenance.no_admitted_crosswalk,true);
});

test('A connected model can narrate only when its citations are present in the actual source candidates',async()=>{
 let called=0;
 const valid=createVixenAiSession({corpus,hostNarrate:async request=>{
  called++;
  return {opening:'A source-backed scene unfolded with a competing interpretation.',
   cliffhanger:'Should we test the other source?',
   cited_source_ids:[request.source_candidates[0].work_id]};
 }});
 const entry=await valid.start({role:'MAESTRO',goal:'feedback'});
 assert.equal(entry.status,'SUPPORTED');
 assert.equal(called,1);
 assert.equal(entry.result.opening_turn.narration_origin,'GROUNDED_CONNECTED_MODEL');
 assert.equal(entry.result.opening_turn.model_citations.length,1);
 const fake=createVixenAiSession({corpus,hostNarrate:async()=>
  ({opening:'The impossible record is established.',cited_source_ids:['UNKNOWN_SOURCE']})});
 const denied=await fake.start({role:'MAESTRO',goal:'feedback'});
 assert.equal(denied.status,'SUPPORTED');
 assert.equal(denied.result.opening_turn.narration_origin,undefined,
  'Unsourced model narration must not replace the source-grounded baseline');
});
