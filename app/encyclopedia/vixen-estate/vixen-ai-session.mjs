/**
 * Vixen Cybernetics | Two-role human/AI research session.
 *
 * MAESTRO guides source-preserving, rabbit-hole exploration.
 * COMPOSER helps frame and compare provisional interpretations.
 * Role selection is exclusive, explicit and immutable for a session.
 *
 * No imported research body, source identity, crosswalk, corpus membership,
 * authorship, grant of execution, external action or deployed state is mutated.
 * Program Notes remain OFF until an independent human permission verifier grants.
 */
import {conductVixenNarrativeTurn} from './vixen-ai-conductor.mjs';
export const VIXEN_AI_SESSION_SCHEMA='vixen.ai.session/v1';
export const VIXEN_AI_ROLES=Object.freeze(['MAESTRO','COMPOSER']);
const LIMIT=128;
const safe=(s,n=500)=>typeof s==='string'?s.trim().slice(0,n):'';
const stateError=(code)=>Object.freeze({ok:false,status:'HELD',reason:code,read_only:true});
const node=(id,title,description,view,choices,question,evidence)=>{
 return Object.freeze({id,title,description,view,choices:Object.freeze(choices),question,evidence});
};
const shared=Object.freeze({
 source:node('source','Follow the original source',
  'Inspect the recorded work, its separate manifestations, and any unresolved identity questions.',
  'works',['compare','context','cart','return'],'Which passage or manifestation grounds this interpretation?',
  'A title or conceptual resemblance does not establish a relationship.'),
 compare:node('compare','Compare without collapsing',
  'Put two works or two versions in view. Preserve source identities and check what each comparison leaves unresolved.',
  'reference',['source','context','countertest','cart'],'What changes when the encounter order is reversed?',
  'A proposed crosswalk requires independent evidence and human review.'),
 context:node('context','Open the wider reference field',
  'Explore independently recorded references. Treat search hits as invitations to inspect, not proof of linkage.',
  'reference',['source','compare','countertest','cart'],'Which cited connection is genuinely witnessed?',
  'Search similarity and adjacency never admit a source relationship.'),
 countertest:node('countertest','Try a rival explanation',
  'Find a counterexample, an alternate route, or a missing witness that could disprove the attractive hypothesis.',
  'holds',['source','observatory','question','cart'],'What would make your favorite explanation fail?',
  'A model output is a question, not independent empirical verification.'),
 observatory:node('observatory','Try the interactive laboratory',
  'Explore clock behavior, stability, and thought experiments; keep modeled output separate from external observations.',
  'observatory',['countertest','question','source','cart'],'Which measurable difference would distinguish the models?',
  'Interactive demonstrations do not confer experimental or replication credit.'),
 methods:node('methods','Find a method worth trying',
  'Inspect documentary protocols, their assumptions, and the evidence conditions they require.',
  'protocols',['source','countertest','question','cart'],'Which method is appropriate for the available evidence?',
  'A declared method does not prove it has been executed.'),
 question:node('question','Shape the next question',
  'Collect what the sources support, what remains uncertain, and what would constitute an informative next test.',
  'collection',['source','compare','countertest','cart'],'What is the narrowest falsifiable question?',
  'All proposed interpretations remain unratified.'),
 cart:node('cart','Curate your research cart',
  'Review saved works and methods, then choose what to read or compare next. Only the visitor can add/remove items.',
  'collection',['source','methods','question','return'],'Which selection deserves a closer reading?',
  'The cart is a local study tray, never an order or source-admission queue.'),
 return:node('return','Return to the entrance',
  'Reconsider the route from another starting point without erasing previous choices.',
  'overview',['source','methods','observatory','question','cart'],'What would you like to approach differently?',
  'Prior steps remain a route history, not a demonstration of truth.')
});
const starting=Object.freeze({
 MAESTRO:Object.freeze(['source','context','observatory','methods','cart']),
 COMPOSER:Object.freeze(['question','compare','countertest','source','cart'])
});
const displayOptions=(role,here)=>here?shared[here].choices.map(id=>shared[id]):starting[role].map(id=>shared[id]);
const publicCard=(session,here=null)=>{
 const options=session.latestTurn?.choices?.map(x=>({...shared[x.choice_id],id:x.choice_id,
    description:x.why||shared[x.choice_id].description,
    suggested_work_id:x.suggested_work_id||null,
    question:x.question}))||displayOptions(session.role,here);
 const label=session.role==='MAESTRO'?'Explore with Maestro':'Develop with Composer';
 return Object.freeze({
  schema:'vixen.ai.chat-card/v1',role:session.role,heading:here?shared[here].title:label,
  introduction:here?shared[here].description:
   (session.role==='MAESTRO'?'Choose a trail. I will keep evidence and source identities distinct while you explore.':
    'Choose a question to develop. I will keep hypotheses provisional and seek disconfirming evidence.'),
  next_question:here?shared[here].question:'Where would you like to begin?',
  source_boundary:here?shared[here].evidence:'Read-only exploration; no changes to the original collection.',
  choices:options.map(({id,title,description,view,suggested_work_id=null,question=''})=>({id,title,description,view,question,suggested_work_id,choice_prompt:'Choose '+id})),
  cart_count:session.cartSnapshot.length,
  active_narrative:session.latestTurn?.narrative||null,
  featured_work:session.latestTurn?.featured_work||null,
  machine_reads:session.latestTurn?.observed_reads||[],
  quests:session.latestTurn?.quests||[],
  report_count:session.questReports.length,
  program_notes:session.notesAllowed?'ON · permission granted':'OFF · human opt-in required',
  human_closure_required:true
 });
};
export function formatVixenChatCard(card){
 if(!card||card.schema!=='vixen.ai.chat-card/v1')throw TypeError('INVALID_VIXEN_CHAT_CARD');
 const lines=['**'+card.heading+'**','',card.introduction,'',
  '**A question to carry:** '+card.next_question,'',
  '**Choose your next trail:**'];
 for(const x of card.choices)lines.push('- **'+x.title+'** — '+x.description+' (choice: '+x.id+')');
 if(card.active_narrative){
  lines.push('','**The story so far:** '+card.active_narrative.opening,
   '','**The next discovery:** '+card.active_narrative.cliffhanger);
 }
 if(Array.isArray(card.quests)&&card.quests.length){
  lines.push('','**Field missions · optional**');
  for(const q of card.quests)lines.push('- **'+q.actor+' · '+q.title+'** — '+q.description+' [mission '+q.quest_id+']');
 }
 lines.push('','**Evidence boundary:** '+card.source_boundary,
  '**Program Notes:** '+card.program_notes);
 return lines.join('\n');
}
export function createVixenAiSession({corpus,readCart=()=>[],verifyProgramNotesConsent=null,
 hostRead=null,hostNarrate=null,authorProgramNote=null}={}){
 if(!corpus||!Array.isArray(corpus.works)||corpus.works.length!==32 ||
    !Array.isArray(corpus.instruments)||corpus.instruments.length!==21)
  throw TypeError('VIXEN_AI_SESSION_CORPUS_REQUIRED');
 const works=new Set(corpus.works.map(x=>x.work_id));
 const methods=new Set(corpus.instruments.map(x=>x.instrument_id));
 const allowedIds=new Set([...works,...methods,...(corpus.giveback_tracks||[]).map(x=>x.id)]);
 let current=null,sequence=0;
 const receipt=(status,result)=>Object.freeze({schema:VIXEN_AI_SESSION_SCHEMA,status,
   result,read_only:true,changes_to_corpus:0,authorship_claim:false,
   independent_external_witness:false,release_authority:false});
 const getCart=()=>{
  let values=[];
  try{values=readCart()}catch(_){}
  return Array.isArray(values)?[...new Set(values.filter(x=>allowedIds.has(x)))].slice(0,100):[];
 };
 const enrichWithVerifiedHost=async(turn)=>{
  if(!turn||typeof hostNarrate!=='function')return turn;
  const eligible=new Set((turn.source_candidates||[]).flatMap(x=>
   [x.work_id,...(x.manifestations||[]).map(y=>y.source_file_id)]));
  let generated;
  try{generated=await hostNarrate({
   schema:'vixen.ai.host-narration-request/v1',role:current?.role,
   visitor_goal:current?.goal,source_candidates:turn.source_candidates,
   observed_reads:turn.observed_reads,visitor_reports:current?.questReports||[],
   route_history:current?.path||[],quests:turn.quests,
   claim_ceiling:'NARRATIVE_NOT_SCIENTIFIC_PROOF'
  })}catch(_){generated=null;}
  const citations=generated?.cited_source_ids;
  if(!generated||!Array.isArray(citations)||!citations.length||
   !citations.every(x=>typeof x==='string'&&eligible.has(x))||
   typeof generated.opening!=='string'||!generated.opening.trim())return turn;
  return Object.freeze({...turn,narrative:Object.freeze({...turn.narrative,
   opening:safe(generated.opening,2200),cliffhanger:
    typeof generated.cliffhanger==='string'?safe(generated.cliffhanger,600):turn.narrative.cliffhanger}),
   model_citations:citations.slice(0,12),narration_origin:'GROUNDED_CONNECTED_MODEL',
   no_admitted_crosswalk:true});
 };
 const currentStatus=()=>!current?receipt('HELD',stateError('SESSION_ROLE_SELECTION_REQUIRED')):
  receipt('SUPPORTED',{session_id:current.id,role:current.role,active:current.active,
   path:current.path.map(({node_id,sequence})=>({node_id,sequence})),
   current:current.current,chat_card:current.active?publicCard(current,current.current):null,
   cart_ids:getCart(),program_notes_permission:current.notesPermission,
   note_count:current.notes.length,history_length:current.path.length,
   quests:current.latestTurn?.quests||[],quest_reports:current.questReports.slice(),
   narrative:current.latestTurn?.narrative||null,possible_next_moves:current.latestTurn?.choices||[]});
 const start=async({role,goal=''}={})=>{
  if(!VIXEN_AI_ROLES.includes(role))return receipt('HELD',stateError('EXPLICIT_MAESTRO_OR_COMPOSER_SELECTION_REQUIRED'));
  if(current?.active)return receipt('HELD',stateError('ROLE_IMMUTABLE_END_SESSION_BEFORE_STARTING_ANOTHER'));
  sequence++;
  current={id:'vixen-ai-session-'+String(sequence).padStart(4,'0'),role,goal:safe(goal,300),
   active:true,current:null,path:[],cartSnapshot:getCart(),latestTurn:null,turns:[],
   questReports:[],notesAllowed:false,notesEverAllowed:false,
   notesPermission:'NOT_REQUESTED',notes:[],notesRequest:false};
  try{
   current.latestTurn=await conductVixenNarrativeTurn({corpus,role,
    goal:current.goal,choice_id:role==='MAESTRO'?'source':'question',
    trail:[],cart:getCart(),hostRead,
    max_read_calls:typeof hostRead==='function'?2:0,step_number:0});
   current.latestTurn=await enrichWithVerifiedHost(current.latestTurn);
   if(current.latestTurn)current.turns.push({kind:'OPENING_RESEARCH_ROUTE',narrative:current.latestTurn});
  }catch(_){current.latestTurn=null;}
  return receipt('SUPPORTED',{role,session_id:current.id,
   chat_card:publicCard(current),opening_turn:current.latestTurn,
   notes_permission:'NOT_REQUESTED',read_only:true});
 };
 const choose=async({choice_id,source_work_id=null,question=''}={})=>{
  if(!current?.active)return receipt('HELD',stateError('SESSION_NOT_STARTED'));
  if(current.path.length>=LIMIT)return receipt('HELD',stateError('SESSION_ROUTE_HISTORY_LIMIT_EXPORT_AND_RESTART'));
  const id=safe(choice_id,60);
  const valid=new Set([...displayOptions(current.role,current.current).map(x=>x.id),
   ...(current.latestTurn?.choices||[]).map(x=>x.choice_id)]);
  if(!valid.has(id))return receipt('HELD',stateError('CHOICE_NOT_AVAILABLE_ON_CURRENT_TRAIL'));
  if(source_work_id!==null&&!works.has(source_work_id))
   return receipt('HELD',stateError('UNKNOWN_SOURCE_WORK'));
  const step={sequence:current.path.length+1,node_id:id,
   source_work_id:source_work_id||current.latestTurn?.featured_work?.work_id||null,
   role:current.role,visitor_question:safe(question,300),
   evidence_class:'USER_CHOSEN_ROUTE_NOT_INDEPENDENT_OBSERVATION'};
  let narrative=null;
  try{narrative=await conductVixenNarrativeTurn({corpus,role:current.role,goal:current.goal,
   choice_id:id,question:step.visitor_question,source_work_id:step.source_work_id,
   trail:current.path,cart:getCart(),hostRead,
   max_read_calls:typeof hostRead==='function'?2:0,step_number:step.sequence});}
  catch(_){return receipt('HELD',stateError('NARRATIVE_CONDUCTOR_UNAVAILABLE'));}
  narrative=await enrichWithVerifiedHost(narrative);
  current.path.push(step);current.current=id;current.cartSnapshot=getCart();
  current.latestTurn=narrative;current.turns.push({step,narrative});
  if(current.notesAllowed){
   let drafted=null;
   if(typeof authorProgramNote==='function'){
    try{drafted=await authorProgramNote({role:current.role,step,narrative,
     route_history:current.path.slice(),visitor_reports:current.questReports.slice()});}
    catch(_){drafted=null;}
   }
   current.notes.push({
    note_number:current.notes.length+1,linked_step:step.sequence,
    title:shared[id].title,draft:typeof drafted==='string'?safe(drafted,3500):null,
    authoring_status:typeof drafted==='string'?'HOST_AI_DRAFT':'LOCAL_STRUCTURED_OUTLINE',
    highlighted_work:narrative.featured_work?.title||null,
    alternative_work:narrative.alternative_work?.title||null,
    next_tests:narrative.choices.slice(0,3).map(x=>x.title),
    route_reason:narrative.featured_work?.provenance_reason||[],
    source_work_ids:narrative.provenance.corpus_work_ids,
    claim_ceiling:'PROVISIONAL_ROUTE_REFLECTION_NOT_SOURCE_TESTIMONY'
   });
  }
  return receipt('SUPPORTED',{step,chat_card:publicCard(current,id),narrative,
   route_hint:{view:shared[id].view,requires_human_navigation:true},
   optional_quests:narrative.quests,
   suggested_cart_action:id==='cart'?'Review selections; add items only via the visitor-controlled cart.':null});
 };
 const report=async({quest_id,outcome='',observation='',skip=false}={})=>{
  if(!current?.active||!current.latestTurn)return receipt('HELD',stateError('SESSION_NOT_STARTED'));
  const id=safe(quest_id,100),quest=current.latestTurn.quests?.find(x=>x.quest_id===id);
  if(!quest)return receipt('HELD',stateError('MISSION_NOT_OFFERED_ON_CURRENT_STEP'));
  if(quest.actor==='AI')return receipt('HELD',stateError('AI_READ_RECEIPT_CANNOT_BE_SELF_REPORTED'));
  if(current.questReports.some(x=>x.quest_id===id))return receipt('HELD',stateError('MISSION_ALREADY_REPORTED'));
  const entry={quest_id:id,actor:quest.actor,status:skip?'VOLUNTARILY_SKIPPED':'VISITOR_REPORTED',
   outcome:skip?'':safe(outcome,400),observation:skip?'':safe(observation,1200),
   source_work_id:quest.target_work_id||null,
   evidence_class:'USER_REPORT_UNVERIFIED',independent_witness:false,crosswalk_proven:false};
  if(!skip&&!entry.observation)return receipt('HELD',stateError('VISITOR_REPORT_OR_SKIP_REQUIRED'));
  current.questReports.push(entry);
  let followup=null;
  if(!skip){
   try{
    followup=await conductVixenNarrativeTurn({corpus,role:current.role,
     goal:current.goal,choice_id:'countertest',question:entry.observation,
     source_work_id:entry.source_work_id,trail:current.path,cart:getCart(),
     hostRead,max_read_calls:typeof hostRead==='function'?2:0,
     step_number:current.path.length+1});
    followup=await enrichWithVerifiedHost(followup);
    current.latestTurn=followup;
    current.turns.push({type:'FOLLOW_UP_TO_VOLUNTARY_VISITOR_REPORT',
     report_id:entry.quest_id,narrative:followup});
   }catch(_){followup=null;}
  }
  if(current.notesAllowed&&!skip){
   let drafted=null;
   if(typeof authorProgramNote==='function'){
    try{drafted=await authorProgramNote({role:current.role,
      report:entry,narrative:followup,route_history:current.path.slice()});}
    catch(_){drafted=null;}
   }
   current.notes.push({
    note_number:current.notes.length+1,linked_report:entry.quest_id,
    title:'A visitor clue and its countertest',draft:typeof drafted==='string'?safe(drafted,3500):null,
    authoring_status:typeof drafted==='string'?'HOST_AI_DRAFT':'LOCAL_STRUCTURED_OUTLINE',
    visitor_observation:entry.observation,
    alternative_work:followup?.alternative_work?.title||null,
    claim_ceiling:'VISITOR_REPORT_UNVERIFIED_NOT_SCIENTIFIC_TEST'
   });
  }
  return receipt('SUPPORTED',{report:entry,
   narrative_followup:skip?'This optional quest can be skipped without closing your research path.':
    'A new counterexample-oriented research branch was prepared from your visitor report; it remains an unverified observation.',
   research_turn:followup,
   next_choices:current.latestTurn?.choices||[],
   notes_written:current.notesAllowed&&!skip});
 };
 const handoff=()=>{
  if(!current?.active)return receipt('HELD',stateError('SESSION_NOT_STARTED'));
  const selected=current.latestTurn;
  return receipt('SUPPORTED',{schema:'vixen.ai.host-handoff/v1',role:current.role,
   session_id:current.id,visitor_goal:current.goal,current_step:current.path.at(-1)||null,
   route_history:current.path.slice(),visitor_reports:current.questReports.slice(),
   saved_cart_ids:getCart(),
   prior_research_chapters:current.turns.slice(-20).map(t=>({
    kind:t.kind||t.type||'CHOSEN_ROUTE',
    step:t.step||null,report_id:t.report_id||null,
    source_candidates:t.narrative?.source_candidates?.map(x=>({
      work_id:x.work_id,manifestations:x.manifestations?.map(z=>z.source_file_id)||[]
    }))||[],
    read_receipts:t.narrative?.observed_reads||[],
    narration_origin:t.narrative?.narration_origin||'LOCAL_SOURCE_GROUNDED',
    evidence_class:'ROUTE_MEMORY_NOT_INDEPENDENT_PROOF'
   })),
   source_candidates:selected?.source_candidates||[],
   observed_reads:selected?.observed_reads||[],narrative:selected?.narrative||null,
   quests:selected?.quests||[],next_choices:selected?.choices||[],
   ai_instructions:selected?.ai_narration_brief||null,
   program_notes_permission:current.notesPermission,
   can_author_program_notes:current.notesAllowed,
   human_approval_for_corpus_mutation:false,
   allowed_actions:'BOUNDED_READ_ONLY_AND_OPTIONAL_HUMAN_TASKS',
   no_automatic_crosswalk:true,no_invented_full_text:true});
 };
 const permission=async({phase,proof=null}={})=>{
  if(!current?.active)return receipt('HELD',stateError('SESSION_NOT_STARTED'));
  if(phase==='request'){
   current.notesRequest=true;current.notesPermission='AWAITING_HUMAN_PERMISSION';
   return receipt('HELD',{reason:'HUMAN_OPT_IN_REQUIRED_BEFORE_AUTHORING',
    request:'May I begin drafting Program Notes for future route selections? No earlier steps will be retroactively narrated.',
    notes_generated:0});
  }
  if(phase==='revoke'){
   current.notesAllowed=false;current.notesRequest=false;current.notesPermission='REVOKED';
   return receipt('SUPPORTED',{program_notes:'OFF',existing_drafts:current.notes.length,
    message:'No new notes will be authored. You may discard the session archive.'});
  }
  if(phase!=='grant'||!current.notesRequest)return receipt('HELD',stateError('NOTES_PERMISSION_REQUEST_REQUIRED'));
  if(typeof verifyProgramNotesConsent!=='function')
   return receipt('HELD',stateError('INDEPENDENT_HUMAN_CONSENT_VERIFIER_NOT_ATTACHED'));
  let verified=false;
  try{verified=await verifyProgramNotesConsent({proof,session_id:current.id,role:current.role})===true}catch(_){}
  if(!verified)return receipt('HELD',stateError('HUMAN_PERMISSION_NOT_VERIFIED'));
  current.notesAllowed=true;current.notesEverAllowed=true;current.notesRequest=false;current.notesPermission='GRANTED';
  return receipt('SUPPORTED',{program_notes:'ON',retroactive_authoring:false,
   message:'Only subsequent steps will receive draft Program Notes.'});
 };
 const notes=()=>{
  if(!current?.active)return receipt('HELD',stateError('SESSION_NOT_STARTED'));
  if(!current.notesEverAllowed)return receipt('HELD',stateError('PROGRAM_NOTES_HUMAN_PERMISSION_REQUIRED'));
  return receipt('SUPPORTED',{title:'Program Notes',role:current.role,
   status:'PROVISIONAL_EDITORIAL_DRAFT',entries:current.notes.slice(),
   underlying_path:current.path.slice(),no_automatic_crosswalk:true});
 };
 const archive=()=>{
  if(!current)return receipt('HELD',stateError('SESSION_ROLE_SELECTION_REQUIRED'));
  const archive={
   schema:'vixen.ai.session-archive/v1',id:current.id,role:current.role,goal:current.goal,
   active:current.active,route_history:current.path.map(x=>({...x})),
   storyline:current.turns.map(t=>({kind:t.kind||t.type||'CHOSEN_ROUTE',
    step:t.step||null,report_id:t.report_id||null,
    narrative:t.narrative,epistemic_claim:'PROVISIONAL_ROUTE_RECORD'})),
   saved_cart_ids:getCart(),notes_permission:current.notesPermission,
   visitor_reports:current.questReports.slice(),
   ...(current.notesEverAllowed?{program_notes:current.notes.map(x=>({...x}))}:{}),
   original_corpus_modified:false,portable_local_export_only:true,
   empirical_replication_credit:0,release_authority:false
  };
  return receipt('SUPPORTED',archive);
 };
 const finish=()=>{
  if(!current?.active)return receipt('HELD',stateError('SESSION_NOT_STARTED'));
  current.active=false;const saved=archive();
  return receipt('SUPPORTED',{archive:saved.result,message:'Session ended. Choose a new role to begin a separate session.'});
 };
 return Object.freeze({start,choose,report,handoff,permission,notes,archive,finish,status:currentStatus,
  availableRoles:()=>VIXEN_AI_ROLES.slice()});
}
