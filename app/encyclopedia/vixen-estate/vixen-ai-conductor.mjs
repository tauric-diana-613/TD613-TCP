/**
 * Active, source-grounded Vixen narrative research conductor.
 *
 * Produces a bounded route proposal from ACTUAL catalogue identities,
 * recorded protocol overlap and chosen research intent. If a host supplies
 * read-only Podium dispatch, executes only declared read intents. Never sends
 * cross-estate results to corpus writes or treats similarity as provenance.
 *
 * Model-facing prompt packet is deliberately specific: the connected AI
 * must narrate the evidence and drive the next choice instead of repeating
 * passive generic "what next?" menus.
 */
import {translatePublicCopy} from './vixen-opera-public-copy.mjs';
export const MAESTRO_CONDUCTOR_SCHEMA='vixen.ai.narrative-conductor/v1';
const STOPWORDS=new Set('and or the a an to of from with via under over on in is are be by for as that this its into which where what how why would work works system research source data method methods model models using between across through without about their then ever more than after before study studies'.split(' '));
const tok=s=>new Set(String(s??'').toLowerCase().match(/[\p{L}\p{N}]+/gu)?.filter(x=>x.length>=3&&!STOPWORDS.has(x))||[]);
const intersection=(a,b)=>[...a].filter(x=>b.has(x)).length;
const named=x=>translatePublicCopy(String(x??''));
const recent=(trail,n=4)=>trail.slice(-n).map(x=>x.source_work_id).filter(Boolean);
const unique=xs=>[...new Set(xs)];
const caption=(work)=>named(work.display_title||work.declared_title||'Untitled recorded work');
const boundString=(s,n=400)=>typeof s==='string'?s.trim().slice(0,n):'';
function findWorks(corpus,request){
 const {goal='',trail=[],cart=[],source_work_id=null,question='',path='source',retrieval_work_ids=[]}=request;
 const query=tok([goal,question].filter(Boolean).join(' '));
 const prior=new Set(recent(trail));
 const tray=new Set(cart);
 const fused=new Set(retrieval_work_ids);
 const focus=corpus.works.find(w=>w.work_id===source_work_id)
   ||corpus.works.find(w=>w.work_id===recent(trail,1)[0])||null;
 const focusTerms=focus?tok([focus.display_title,focus.cluster_short].join(' ')):new Set();
 const ranked=corpus.works.map(w=>{
  const title=tok(w.display_title||w.declared_title),cluster=tok(w.cluster_short||w.cluster||'');
  const rationale=[];
  let score=intersection(query,title)*5+intersection(query,cluster)*2;
  if(tray.has(w.work_id)){score+=4;rationale.push('In your research cart');}
  if(fused.has(w.work_id)){score+=18;rationale.push('Retrieved by the full semantic-semiotic source index; ranking alone cannot prove a relationship');}
  if(focus&&w.work_id!==focus.work_id&&w.cluster!==focus.cluster){score+=path==='countertest'?3:1;rationale.push('Contrasting research area');}
  if(focus&&w.work_id!==focus.work_id&&intersection(focusTerms,title)>0){score+=3;rationale.push('A related vocabulary worth checking');}
  if(focus&&w.work_id!==focus.work_id&&Array.isArray(w.protocols)&&w.protocols.some(p=>(focus.protocols||[]).includes(p))){score+=3;rationale.push('Shares a recorded research method');}
  if(w.human_gate_required){score+=1;rationale.push('Source/version identity still requires human judgment');}
  if(prior.has(w.work_id))score-=3;
  if(w.work_id===focus?.work_id)score+=path==='source'?8:0;
  if(!rationale.length)rationale.push(query.size?'Question-to-title vocabulary match is unverified':'A different entry point into the catalogue');
  return {w,score,rationale};
 });
 ranked.sort((a,b)=>b.score-a.score || (a.w.order_num||999)-(b.w.order_num||999));
 let selected=[];
 if(focus&&['source','compare','cart'].includes(path))selected.push(ranked.find(r=>r.w.work_id===focus.work_id));
 for(const item of ranked){
  if(selected.length>=4)break;
  if(selected.some(x=>x?.w.work_id===item.w.work_id))continue;
  if(selected.length<3 && selected.some(x=>x.w.cluster===item.w.cluster) &&
     ranked.some(y=>!selected.some(t=>t.w.cluster===y.w.cluster)&&y.score>=item.score-5))continue;
  selected.push(item);
 }
 return {focus,ranked:selected.filter(Boolean).map(({w,score,rationale})=>({
  work_id:w.work_id,title:caption(w),cluster:named(w.cluster_short||w.cluster||''),
  cluster_id:w.cluster,manifestations:(w.linked_sources||[]).map(s=>({
   source_file_id:s.source_file_id,media_type:s.media_type,
   filename:s.original_filename,sha256:s.sha256||null,
   recorded_access:s.public_body_status||null
  })),
  recorded_methods:(w.protocols||[]).slice(0,5),
  identity_status:w.identity_status||'UNRESOLVED',
  open_questions:(w.unresolved_questions||[]).slice(0,2).map(named),
  provenance_reason:rationale,
  // Ranking is a navigation heuristic; not epistemic confidence.
  navigation_relevance:score
 }))};
}
function routeOptions(path,role,suggestions,history){
 const all={
  source:['compare','context','countertest','cart'],
  compare:['countertest','source','observatory','cart'],
  context:['source','compare','countertest','methods'],
  countertest:['source','methods','question','observatory'],
  observatory:['countertest','source','methods','question'],
  methods:['source','question','observatory','cart'],
  question:['compare','countertest','cart','source'],
  cart:['source','compare','methods','question'],
  return:['source','observatory','methods','cart']
 };
 let items=all[path]||['source','compare','question','cart'];
 if(role==='COMPOSER'&&path!=='question')items=['question',...items.filter(x=>x!=='question')];
 const variants={
  source:['Read one original work','Anchor the next question to its recorded source', 'What exists in the collection?'],
  compare:['Place two works side-by-side','Compare without presuming influence or authorship','What changes between the two routes?'],
  context:['Follow independent citations','Investigate surrounding source records','Which connections are actually recorded?'],
  countertest:['Challenge the appealing explanation','Search for a rival mechanism','What could make the theory fail?'],
  observatory:['Test a model in the Observatory','Try a bounded interactive demonstration','What could be measured?'],
  methods:['Visit the documentary methods','Select a rigorous analysis technique','What does the method demand?'],
  question:['Develop a new research question','Turn the route into a falsifiable proposal','What remains unresolved?'],
  cart:['Review the research cart','Use saved material to plan the next stop','What deserves your attention?'],
  return:['Return to the entrance','Start a new branch without erasing the trail','What would you approach differently?']
 };
 const chosen=items.slice(0,4);
 return chosen.map((id,i)=>{
  const w=suggestions[(i+history.length)%Math.max(1,suggestions.length)]||null;
  return {choice_id:id,title:variants[id][0],why:variants[id][1],
   question:variants[id][2],suggested_work_id:['source','compare','context','countertest'].includes(id)?w?.work_id||null:null,
   related_title:w?.title||null};
 });
}

/** One turn offers human, machine and collaborative quests. Every quest is
 * optional, grounded in a specific live room and source, and separately
 * marked reported vs independently verified. A human report never proves science. */
function questsForTurn({role,path,featured,alternative,reads,step=1}){
 const title=featured?.title||'the selected manuscript';
 const other=alternative?.title||'a contrasting work';
 const noun=path==='observatory'?'the clock-and-stability demonstration':
  path==='methods'?'the documentary-method catalogue':
  path==='cart'?'your saved research cart':
  path==='countertest'?'the limits and counterexamples exhibit':
  path==='question'?'the Synthesis Salon':
  path==='context'?'the independent reference room':'the manuscript reading room';
 const room=path==='observatory'?'observatory':path==='methods'?'protocols':
  path==='cart'||path==='question'?'collection':
  path==='countertest'?'holds':path==='context'?'reference':'works';
 const readOK=reads.some(x=>x.status==='OBSERVED_READ_ONLY');
 return [
  {quest_id:'turn-'+step+'-ai',actor:'AI',title:'Follow the documentary clue',
   description:'Inspect the recorded sources and seek a conflicting or corroborating reading.',
   target_work_id:featured?.work_id||null,
   expected_result:'A citation-aware account of what was inspected, what was inferred and what remains unknown',
   execution_status:readOK?'READ_ONLY_INSPECTION_RECEIPTED':'PROPOSED_NOT_EXECUTED',
   optional:true,requires_new_consent:false,claim_ceiling:'READ_RECEIPT_NOT_ESTABLISHED_RELATION'},
  {quest_id:'turn-'+step+'-human',actor:'HUMAN',title:'Field excursion: '+noun,
   description:'Open '+noun+'. Find one concrete detail in “'+title+'” that surprises or challenges your first impression.',
   suggested_view:room,target_work_id:featured?.work_id||null,
   expected_result:'Describe the feature, phrase or observation you encountered in your own words',
   execution_status:'AWAITING_VOLUNTARY_VISITOR_REPORT',
   optional:true,report_source:'SELF_REPORT_NOT_VERIFIED',never_requires_upload:true},
  {quest_id:'turn-'+step+'-collab',actor:'COLLABORATIVE',title:'The counterexample duet',
   description:'You select a passage from “'+title+'”; the AI compares it cautiously against “'+other+'” and proposes a testable rival interpretation.',
   suggested_view:'reference',target_work_id:featured?.work_id||null,
   alternative_work_id:alternative?.work_id||null,
   expected_result:'A source-identified comparison, competing hypotheses and an explicit limit on the claimed connection',
   execution_status:'NEEDS_VISITOR_SOURCE_SELECTION',
   optional:true,report_source:'SELF_REPORT_NOT_VERIFIED',claim_ceiling:'UNRATIFIED_PROPOSAL_ONLY'}
 ];
}
const readIntentByPath=Object.freeze({
 source:'vixen.work.inspect',compare:'vixen.work.inspect',
 context:'universal.search',countertest:'vixen.fusion.search'
});
async function inspectWithHost(path,work,question,hostRead){
 const intent=readIntentByPath[path];
 if(!intent||typeof hostRead!=='function')return {status:'NOT_CONNECTED',reason:'Use the documented catalogue metadata; no external record was inspected'};
 if(path==='countertest'&&!boundString(question,200))return {status:'NOT_REQUESTED',reason:'No search term supplied'};
 const params=intent==='vixen.work.inspect'?{work_id:work?.work_id}:
  intent==='universal.search'?{query:boundString(question,200),limit:6,auto_open:true,operator_directive:true}:
  {query:boundString(question,200),limit:6,mode:'hybrid'};
 if(intent==='vixen.work.inspect'&&!params.work_id)return {status:'NOT_REQUESTED',reason:'No work selected'};
 if(intent==='universal.search'&&!params.query)return {status:'NOT_REQUESTED',reason:'No research query supplied'};
 try{
  const result=await hostRead({intent,params});
  if(result?.status!=='SUPPORTED')return {status:'HELD',reason:result?.result?.reason||result?.result?.state||'Source read not qualified'};
  // Return only a bounded, explicitly classified extract. Never automatically
  // interpret a lexical hit as same-author, derivation or causal influence.
  const value=result.result||{};
  const hits=Array.isArray(value.hits)?value.hits:Array.isArray(value.search?.hits)?value.search.hits:[];
  return {status:'OBSERVED_READ_ONLY',intent,
    linked_work_id:params.work_id||null,query:params.query||null,
    record:value.work_id?{work_id:value.work_id,linked_sources:value.linked_sources||[],
      identity_status:value.identity_status,authorship:value.authorship}:null,
    qualified_semantic_semiotic_fusion:intent==='vixen.fusion.search'&&value.search?.fusion_state==='FULL_INDEX_FUSION',
    hits:hits.slice(0,6).map(h=>({id:h.id,source_file_id:h.source_file_id||null,
      label:named(h.label||h.title||h.id),citation:h.citation||null,
      work_id:h.work_id||null,sha256:h.sha256||null})),
    claim_ceiling:'RETRIEVAL_OR_CATALOGUE_OBSERVATION_NOT_LINEAGE_PROOF'};
 }catch(_){return {status:'HELD',reason:'READ_ADAPTER_FAILED_CLOSED'};}
}
export async function conductVixenNarrativeTurn({
 corpus,role,goal='',choice_id='source',question='',source_work_id=null,
 trail=[],cart=[],hostRead=null,max_read_calls=2,step_number=1
}={}){
 if(!['MAESTRO','COMPOSER'].includes(role))throw TypeError('EXPLICIT_SESSION_ROLE_REQUIRED');
 if(!corpus||!Array.isArray(corpus.works))throw TypeError('CORPUS_REQUIRED');
 if(!Number.isInteger(max_read_calls)||max_read_calls<0||max_read_calls>3)
  throw RangeError('BOUNDED_READ_CALLS_REQUIRED');
 const path=choice_id,query=boundString(question||goal,200);
 const reads=[];
 let callsLeft=max_read_calls;
 let retrievalWorkIds=[];
 if(callsLeft>0 && query.length>=2 && ['source','compare','countertest','question','methods'].includes(path)){
  // Full-index fusion is the information-bearing lane. A held/unattached
  // index receives no score credit and cannot be represented as retrieval.
  const retrieval=await inspectWithHost('countertest',null,query,hostRead);
  reads.push(retrieval);callsLeft--;
  if(retrieval.qualified_semantic_semiotic_fusion===true){
   const lookup=new Map();
   for(const work of corpus.works){
    lookup.set(work.work_id,work.work_id);
    for(const src of work.linked_sources||[])lookup.set(src.source_file_id,work.work_id);
   }
   retrievalWorkIds=[...new Set((retrieval.hits||[]).map(h=>
    lookup.get(h.work_id)||lookup.get(h.source_file_id)).filter(Boolean))];
  }
 }
 const {focus,ranked}=findWorks(corpus,{goal,trail,cart,source_work_id,
  question,path,retrieval_work_ids:retrievalWorkIds});
 const featured=ranked[0]||null,contrasting=ranked.find(x=>featured&&x.cluster_id!==featured.cluster_id)||ranked[1]||null;
 if(callsLeft>0){
  const first=await inspectWithHost(path==='countertest'?'compare':path,featured,query,hostRead);
  reads.push(first);callsLeft--;
  if(callsLeft>0&&['compare','source'].includes(path)&&contrasting?.work_id){
   reads.push(await inspectWithHost('compare',contrasting,query,hostRead));
  }
 }
 const lead=featured?('The strongest starting point in this catalogue is “'+featured.title+'.”'):'The catalogue needs a more specific starting question.';
 const contrast=contrasting?('A useful rival route is “'+contrasting.title+'” in a different research area. Their juxtaposition is an investigative choice, not proof of connection.'):'';
 const reason=featured?featured.provenance_reason.join('; '):'No source selected';
 const specific=featured?('The archive records '+featured.manifestations.length+' distinct manifestation(s), with identity status '+featured.identity_status+'.'):'';
 const questions=featured?.open_questions?.length?featured.open_questions[0]:'Which independent observation would separate the plausible explanations?';
 const body=[
  role==='MAESTRO'?'I have prepared a route through the recorded works.':'I have prepared a source-grounded outline for a provisional interpretation.',
  lead,specific,contrast,
  'Why this trail: '+reason+'.',
  'What remains open: '+questions
 ].filter(Boolean);
 const options=routeOptions(path,role,ranked,trail);
 const quests=questsForTurn({role,path,featured,alternative:contrasting,reads,step:step_number});
 const narrative=Object.freeze({
  voice:role==='MAESTRO'?'GUIDED_DOCUMENTARY_EXPLORATION':'CRITICAL_INTERPRETIVE_DEVELOPMENT',
  opening:body.join(' '),
  cliffhanger:role==='MAESTRO'?
   'The next branch could deepen this source, challenge the connection, or take us into an interactive experiment.' :
   'The next branch can sharpen this thesis, construct a countermodel, or return to the source evidence.',
  evidence_boundary:'Titles, recorded manifests, and permitted read receipts guide navigation. Connections, authorship, mechanism, and scientific claims require independent demonstration.'
 });
 return Object.freeze({schema:MAESTRO_CONDUCTOR_SCHEMA,role,choice_id:path,
  narrative,featured_work:featured,alternative_work:contrasting,
  source_candidates:ranked,observed_reads:reads,
  choices:options,quests,cart_ids:unique(cart).slice(0,100),
  research_cart_recommendation:featured?.work_id?{
    work_id:featured.work_id,title:featured.title,reason:'Review or add this source through the visitor-controlled research cart',
    action:'SUGGEST_ONLY_NOT_MUTATION'
  }:null,
  ai_narration_brief:{
   request:'Lead an engaging, informed, multi-stage research adventure. Show the visitor what you inspected, why the next connection is intriguing, and what could falsify it. Make 2–4 specific next-move proposals and recommend an overlooked interactive feature when relevant. Do the information work; never ask visitors to master engine names.',
   use_only_recorded_source_ids:true,do_not_invent_full_text:true,
   distinguish_ranking_from_proof:true,claim_external_witness:false,
   never_autosave_cart:true,requires_user_choice_for_navigation:true,
   program_notes_require_separate_consent:true,
   do_not_print_internal_instrument_names:true,
   operator_tasks_are_optional:true,human_reports_are_not_verified_observations:true,
   narrative_gameplay:'Choose a different branch based on a clue or report; treat uncertainty as productive, not as failure.'
  },
  provenance:{source:'VIXEN_LOCAL_SOURCE_CATALOGUE_AND_EXPLICIT_BOUNDED_READ_RESULTS',
   evidence_count:reads.filter(r=>r.status==='OBSERVED_READ_ONLY').length,
   corpus_work_ids:ranked.map(x=>x.work_id),
   no_admitted_crosswalk:true,empirical_replication_credit:0,
   research_ranking_is_heuristic:true,
   full_index_fusion_used:reads.some(r=>r.qualified_semantic_semiotic_fusion===true),
   fallback_only:!reads.some(r=>r.qualified_semantic_semiotic_fusion===true)}
 });
}
