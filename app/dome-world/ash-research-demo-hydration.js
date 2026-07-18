import { compileCaseMap, compileRoomRules, compileRouteMemory } from '../engine/ash-keep-core.js';

export const ASH_RESEARCH_DEMO_VERSION='td613.ash.research-demo/v0.2-lumen-atlas';
const PROFILE='research',DB='td613-ash-keep',PTR='td613.ash-keep.current-case';
const $=id=>document.getElementById(id), join=v=>(v||[]).join(', '), lines=v=>(v||[]).join('\n');
const ROOMS=[
['question','Question & Preregistration','#76ead4'],['literature','Literature & Provenance','#e4c66c'],
['methods','Methods & Protocol','#7dd3fc'],['raw','Raw Data & Instruments','#93c5fd'],
['ethics','Participants & Ethics','#f0abfc'],['coding','Coding & Annotation','#d9a1ff'],
['models','Computation & Models','#a78bfa'],['results','Results & Nulls','#a7f3d0'],
['alternatives','Competing Explanations','#fb923c'],['replication','Reproducibility & Replication','#5eead4'],
['routes','External Review & Routes','#fbbf24'],['claims','Publication & Claims','#f9a8d4'],
['risk','Risks & Unresolved','#ff8b9d'],['next','Next Actions','#86efac']
];
const TOPICS={
question:['primary research question','secondary sensitivity question','preregistration v2','population scope boundary','missing pilot rationale'],
literature:['evidence synthesis matrix','provenance registry','retracted comparator','technical reports corpus','inaccessible source datasets'],
methods:['protocol v1','protocol v2 correction','sampling frame','measurement plan','collection-window deviation'],
raw:['sensor manifest','raw batch A','raw batch B','calibration log','missing station-day'],
ethics:['ethics protocol','consent template','participant linkage key','local-linkage rule','withdrawal reconciliation gap'],
coding:['codebook v3','synthetic annotator A','synthetic annotator B','adjudication log','unresolved ambiguous records'],
models:['baseline model','robust alternative model','diagnostic bundle','conditional-model limitation','incomplete validation set'],
results:['primary positive estimate','null-compatible outcome','subgroup sign reversal','signed residual ledger','unobserved long-horizon outcome'],
alternatives:['weather drift','site-selection imbalance','calibration correction','annotation disagreement','unknown operational change'],
replication:['environment manifest','dependency-lock digest','deterministic replay receipt','independent replication protocol','unrun replication gap'],
routes:['peer-review receipt','public-summary receipt','methods-review receipt','encrypted-archive receipt','offline-Reader receipt'],
claims:['bounded primary claim','null-compatible claim','no universal generalization','scoped figure caption','policy-translation gap'],
risk:['rare joining-key risk','metadata linkage risk','unknown Reader corpus','stale-cache surface','recipient endpoint uncertainty'],
next:['preserve commitments','calibrate Readers','run joining-key ablation','retest projection','human claim review']
};
const CONTROLS=['POSITIVE','MATCHED_BENIGN','NULL','MISSING','CONTRADICTORY','SHUFFLED','TRUNCATED','ROUTE_ORDER','DELAYED_DISCLOSURE','CROSS_SESSION','SOURCE_DRIFT','METADATA_ONLY'];
const HELD=['rare_fact_conjunctions','chronology','source_identity','hypotheses','lifecycle_state','metadata_linkage','document_provenance','unknown_reader'];
const STRATA=['content','projection','cryptographic','endpoint','provider','reader','metadata','temporal','custody','human'];
const slug=s=>s.toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'');
const sha=n=>`sha256:${String(n).repeat(64).slice(0,64)}`;

export function buildResearchFixture(){
  const rooms=ROOMS.map(([id,label,color])=>({id:`room_${id}`,label,color,notes:`Synthetic ${label} chamber.`}));
  const nodes=[];let chronology=0;
  for(const [room] of ROOMS){
    TOPICS[room].forEach((label,index)=>{
      const gap=/missing|gap|unrun|unobserved|unknown|uncertainty|inaccessible|unresolved|incomplete/.test(label);
      const action=room==='next';
      const hypothesis=room==='alternatives'||(room==='risk'&&!gap);
      const type=action?'intended-action':gap?'evidence-gap':hypothesis?'hypothesis':/question|claim|limitation|rule|generalization|estimate|outcome|reversal/.test(label)?'claim':/annotator/.test(label)?'entity':/registry|corpus/.test(label)?'source':/deviation/.test(label)?'event':'artifact';
      nodes.push({id:`node_${room}_${slug(label)}`,type,label,room_id:`room_${room}`,
        source_status:gap?'UNRESOLVED':hypothesis?'INFERRED':type==='claim'?'DERIVED':'SUPPLIED',
        sensitivity:['raw','ethics','coding','routes'].includes(room)?'RESTRICTED':'PRIVATE',
        confidence_posture:gap||hypothesis||action?'OPEN':'HELD',disclosure_state:room==='routes'?'DISCLOSED':'LOCAL',
        chronology_index:chronology++});
    });
  }
  nodes.push({id:'node_results_heldout_envelope',type:'artifact',label:'held-out replication result envelope',room_id:'room_results',source_status:'CONSTRUCTED',sensitivity:'RESTRICTED',confidence_posture:'HELD',disclosure_state:'LOCAL',chronology_index:chronology++});
  nodes.push({id:'node_risk_sequence_restore',type:'hypothesis',label:'disclosure order may restore omitted chronology',room_id:'room_risk',source_status:'INFERRED',sensitivity:'PRIVATE',confidence_posture:'OPEN',disclosure_state:'LOCAL',chronology_index:chronology++});
  const relationships=[];
  for(const [room] of ROOMS){
    const ids=nodes.filter(n=>n.room_id===`room_${room}`).map(n=>n.id);
    for(let i=0;i<ids.length-1;i++) relationships.push({id:`edge_${room}_local_${i+1}`,from:ids[i],to:ids[i+1],type:'informs-next-local-stage',source_status:'CONSTRUCTED'});
  }
  const ordered=nodes.map(n=>n.id);
  for(let i=0;i<54;i++){
    const from=ordered[(i*7)%ordered.length],to=ordered[(i*11+17)%ordered.length];
    relationships.push({id:`edge_cross_${String(i+1).padStart(2,'0')}`,from,to:from===to?ordered[(i*11+18)%ordered.length]:to,
      type:['governs','qualifies','tests','constrains','supports-alternative','requires-retest'][i%6],source_status:'CONSTRUCTED'});
  }
  const routeDefs=[
    ['peer_review',['question','methods','models','results','claims','routes'],'external-peer-reviewer'],
    ['public_summary',['results','claims','routes'],'public-reader'],
    ['methods_review',['methods','replication','routes'],'methods-reviewer'],
    ['ethics_review',['ethics','methods'],'ethics-reviewer'],
    ['offline_reader',['models','results','replication','routes'],'offline-local-model'],
    ['encrypted_archive',['literature','methods','replication','routes'],'encrypted-archive-custodian']
  ];
  const ruleDefs=[...routeDefs,
    ['internal_adjudication',['coding','results','alternatives','risk'],'internal-reviewer'],
    ['claim_review',['question','results','alternatives','claims','risk','next'],'human-claim-reviewer']
  ];
  const rules=ruleDefs.map(([id,roomIds],i)=>({route_id:`route_${id}`,allowed_room_ids:roomIds.map(v=>`room_${v}`),
    local_link_keys:[`edge_cross_${String(i+1).padStart(2,'0')}`,`edge_cross_${String(i+21).padStart(2,'0')}`],
    allowed_node_types:['artifact','claim','hypothesis','evidence-gap']}));
  const routeRefs=[
    ['node_question_primary_research_question','node_methods_protocol_v2_correction','node_results_primary_positive_estimate','node_claims_no_universal_generalization'],
    ['node_results_primary_positive_estimate','node_results_null_compatible_outcome','node_claims_no_universal_generalization'],
    ['node_methods_protocol_v2_correction','node_replication_environment_manifest','node_replication_deterministic_replay_receipt'],
    ['node_ethics_ethics_protocol','node_ethics_consent_template','node_ethics_local_linkage_rule'],
    ['node_models_baseline_model','node_models_robust_alternative_model','node_results_heldout_envelope'],
    ['node_literature_provenance_registry','node_methods_protocol_v2_correction','node_replication_dependency_lock_digest']
  ];
  const entries=routeDefs.map(([id,,recipient],i)=>({entry_id:`routeentry_research_${id}_01`,draft_digest:sha(i+1),route_id:`route_${id}`,
    purpose:id.replaceAll('_','-'),recipient_class:recipient,recorded_at:`2026-07-17T0${i+1}:10:00Z`,
    disclosed_opaque_references:routeRefs[i],recall_state:'NOT_RECALLED'}));
  const assay={source_status:'CONSTRUCTED',promotion_authorized:false,maximum_assurance:'PA2_LOCALLY_EXECUTED',
    controls:CONTROLS.map((kind,i)=>({control_id:`control_${slug(kind)}`,class:kind,purpose:`Declared ${kind.toLowerCase().replaceAll('_',' ')} reconstruction control ${i+1}.`})),
    held_outs:HELD.map((dimension,i)=>({heldout_id:`heldout_${slug(dimension)}`,protected_dimension:dimension,reference:nodes[(i*9+3)%nodes.length].id})),
    strata:STRATA,unknown_readers:'UNMEASURED',universal_secrecy:false,
    claim_ceiling:'SYNTHETIC_METHOD_HYDRATION_ONLY__NO_EMPIRICAL_RECOVERY_CLAIM'};
  return Object.freeze({
    profile:{demo_id:'demo_research_lumen_atlas_v2',title:'Lumen Atlas Study · heat-resilience evidence synthesis and replication audit',
      summary:'A synthetic research program testing whether a cooling-intervention claim survives provenance, protocol, model, metadata, joining-key, and route-order challenge.',
      observations:[{kind:'SYNTHETIC_QUALIFICATION_GRADE_DEMO',real_people:false,real_organizations:false,real_documents:false,real_events:false,real_provider_execution:false,empirical_reader_execution:false,causation_established:false,prediction_authorized:false,automatic_action_authorized:false}],
      missingness:['No real participant data is present.','No provider environment is observed.','No independent replication occurred.','Unknown external corpora remain unmeasured.'],
      alternatives:['weather drift','site-selection imbalance','instrument calibration','annotation disagreement','unknown operational change'],
      open_questions:['Which projection preserves utility while keeping linkage local?','Which joins create superadditive recovery?','Does route order restore chronology?'],
      chronology:['question frozen','provenance compiled','protocol corrected','synthetic data collected','models compared','controls declared','projection compiled','claim human-gated'],
      actions:['preserve commitments','calibrate Readers','run joining-key ablation','retest projection','quarantine Return','review claim']},
    rooms,nodes,relationships,rules,routes:{entries,operator_declared_assumptions:['Peer review does not require participant linkage.','Public summary does not require protocol joining keys.'],unknown:['external joining corpora','recipient endpoint persistence','sequence restoration']},
    assay,defaults:{reader_class:'deterministic-baseline',
      test_refs:['node_question_primary_research_question','node_methods_protocol_v2_correction','node_results_primary_positive_estimate','node_results_subgroup_sign_reversal','node_claims_no_universal_generalization','node_risk_rare_joining_key_risk'],
      route:{id:'route_peer_review',recipient_class:'external-peer-reviewer',purpose:'blind-method-and-claim-review',digest:sha('a'),refs:routeRefs[0]},
      draft:{route:'route_peer_review',recipient_class:'external-peer-reviewer',purpose:'blind-method-and-claim-review',version:'1',refs:routeRefs[0],body:'This synthetic study tests whether a neighborhood cooling intervention remains supported after protocol correction, model alternatives, and held-out controls. The primary estimate remains directionally positive in the declared population, while one subgroup estimate changes sign under a robust model and remains unresolved. No causal, individual, or universal claim is authorized.'},
      provider_task:'Review the bounded synthetic methods-and-claim packet for unsupported generalization while preserving nulls, contradictions, missingness, and population scope.',
      protected_literals:['participant linkage key','site-month-protocol conjunction','raw observation batch','unreleased replication result','complete route order'],
      save_questions:['Which control failures require rest?','Which dimensions remain unmeasured?','Does metadata recovery exceed semantic recovery?'],
      save_next:['Compile Environment Profile.','Run controls and joining-key assays locally.','Retest after every projection change.','Require human claim approval.'],
      research_notes:'Synthetic Research hydration specimen. Constructed controls remain capped at PA2; no empirical PA3, causal, attribution, secrecy, or endpoint-integrity claim is earned.',
      tradeoff:{utility:7,rebuild:4,link:6,work:8}},
    counts:{rooms:14,nodes:72,relationships:112,rules:8,routes:6,controls:12,held_outs:8,strata:10}
  });
}

function openDb(){return new Promise((resolve,reject)=>{const r=indexedDB.open(DB);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
async function write(caseMap,roomRules,routeMemory){const db=await openDb();await new Promise((resolve,reject)=>{const tx=db.transaction(['cases','roomRules','routeMemory'],'readwrite');tx.objectStore('cases').put(caseMap);tx.objectStore('roomRules').put({id:caseMap.case_id,value:roomRules});tx.objectStore('routeMemory').put({id:caseMap.case_id,value:routeMemory});tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});db.close();}
async function ready(){if(window.__td613AshKeep?.refresh)return;await new Promise((resolve,reject)=>{const start=performance.now(),t=setInterval(()=>{if(window.__td613AshKeep?.refresh){clearInterval(t);resolve();}else if(performance.now()-start>30000){clearInterval(t);reject(new Error('Research hydration readiness timed out.'));}},50);});}
function setValue(id,value){const el=$(id);if(!el||value==null)return;el.value=String(value);el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));}
function apply(f){const d=f.defaults;setValue('readerClass',d.reader_class);setValue('testRefs',join(d.test_refs));setValue('routeId',d.route.id);setValue('routeRecipient',d.route.recipient_class);setValue('routePurpose',d.route.purpose);setValue('routeDigest',d.route.digest);setValue('routeRefs',join(d.route.refs));setValue('draftBody',d.draft.body);setValue('draftRoute',d.draft.route);setValue('draftRecipient',d.draft.recipient_class);setValue('draftPurpose',d.draft.purpose);setValue('draftVersion',d.draft.version);setValue('draftRefs',join(d.draft.refs));setValue('providerTask',d.provider_task);setValue('protectedLiterals',join(d.protected_literals));setValue('saveQuestions',lines(d.save_questions));setValue('saveNext',lines(d.save_next));setValue('researchNotes',d.research_notes);for(const[k,v]of Object.entries(d.tradeoff)){setValue(`${k}Value`,v);if($(`${k}Readout`))$(`${k}Readout`).textContent=String(v);}document.documentElement.dataset.ashDemoProfile=PROFILE;document.documentElement.dataset.ashResearchMethod=ASH_RESEARCH_DEMO_VERSION;}
function docket(f){const map=$('workspace-map'),layout=map?.querySelector('.map-layout');if(!layout)return;let box=$('researchMethodDocket');if(!box){box=document.createElement('section');box.id='researchMethodDocket';box.className='research-method-docket';layout.before(box);}box.innerHTML=`<h3>Research Method Docket</h3><p>${f.profile.summary}</p><div class="research-docket-metrics">${Object.entries(f.counts).map(([k,v])=>`<b>${k.replaceAll('_',' ')} · ${v}</b>`).join('')}</div><p><strong>Control bank:</strong> ${f.assay.controls.map(c=>c.class).join(' · ')}</p><p><strong>Held-outs:</strong> ${f.assay.held_outs.map(h=>h.protected_dimension).join(' · ')}</p><p><strong>Strata:</strong> ${f.assay.strata.join(' · ')}</p><p class="research-ceiling">PA2 ceiling · Unknown Readers UNMEASURED · Universal secrecy false</p>`;}
function style(){if($('td613-research-demo-css'))return;const s=document.createElement('style');s.id='td613-research-demo-css';s.textContent='.research-method-docket{margin:0 0 16px;padding:18px;border:1px solid rgba(228,198,108,.38);background:linear-gradient(135deg,rgba(7,26,21,.96),rgba(24,14,31,.78));line-height:1.55}.research-method-docket h3{margin:0 0 8px;font:500 clamp(1.4rem,3vw,2.2rem) var(--serif)}.research-docket-metrics{display:flex;gap:6px;flex-wrap:wrap;margin:12px 0}.research-docket-metrics b{padding:7px;border:1px solid var(--line);font:700 .58rem var(--mono);text-transform:uppercase}.research-ceiling{color:var(--rose);font:700 .64rem var(--mono);text-transform:uppercase}';document.head.append(s);}
function controls(){const select=$('newProfile'),button=$('startDemo');if(!select||!button||select.value!==PROFILE)return false;button.disabled=false;button.classList.add('demo-available');button.classList.remove('demo-unavailable');button.textContent='Start Research qualification demo';button.title='Hydrate controls, held-outs, joining-key stress, route memory, and a PA2 claim ceiling.';return true;}
export async function hydrateResearchDemo(){const button=$('startDemo');if(!button)return null;button.disabled=true;button.textContent='Hydrating Research method…';try{await ready();const f=buildResearchFixture();const caseMap=await compileCaseMap({profile:PROFILE,title:f.profile.title,rooms:f.rooms,nodes:f.nodes,relationships:f.relationships,privateChronology:f.profile.chronology,intendedActions:f.profile.actions,sourceStatus:'SIMULATED',evidenceBasis:['synthetic Research qualification fixture'],observations:f.profile.observations,missingness:f.profile.missingness,alternatives:f.profile.alternatives,openQuestions:f.profile.open_questions,operatorNotes:['demo_profile:research','assurance_ceiling:PA2_LOCALLY_EXECUTED']});const roomRules=await compileRoomRules({caseId:caseMap.case_id,rules:f.rules,sourceStatus:'SIMULATED'});const routeMemory=await compileRouteMemory({caseId:caseMap.case_id,entries:f.routes.entries,operatorDeclaredAssumptions:f.routes.operator_declared_assumptions,unknown:f.routes.unknown,sourceStatus:'SIMULATED'});await write(caseMap,roomRules,routeMemory);localStorage.setItem(PTR,caseMap.case_id);await window.__td613AshKeep.refresh();apply(f);docket(f);window.dispatchEvent(new CustomEvent('td613:ash:profile-demo-hydrated',{detail:{case_id:caseMap.case_id,case_map_digest:caseMap.case_map_digest,route_memory_digest:routeMemory.route_memory_digest,profile:PROFILE,...f.counts,source_status:'CONSTRUCTED',maximum_assurance:'PA2_LOCALLY_EXECUTED'}}));setTimeout(()=>(window.__td613AshPremiumUI?.open||window.__td613OpenAshWorkspace)?.('map'),0);return{caseMap,roomRules,routeMemory,assay:f.assay};}catch(error){console.error(error);return null;}finally{button.textContent='Start Research qualification demo';queueMicrotask(controls);}}
export function installAshResearchDemo(){if(typeof document==='undefined')return false;style();const select=$('newProfile');if(!select)return false;select.addEventListener('change',()=>setTimeout(controls,0));window.addEventListener('click',event=>{const target=event.target?.closest?.('#startDemo');if(!target||select.value!==PROFILE)return;event.preventDefault();event.stopImmediatePropagation();hydrateResearchDemo();},true);document.documentElement.dataset.ashResearchDemo=ASH_RESEARCH_DEMO_VERSION;const f=buildResearchFixture();window.__td613AshResearchDemo=Object.freeze({version:ASH_RESEARCH_DEMO_VERSION,hydrate:hydrateResearchDemo,build:buildResearchFixture,counts:f.counts,assurance:{source_status:'CONSTRUCTED',maximum:'PA2_LOCALLY_EXECUTED',unknown_readers:'UNMEASURED',universal_secrecy:false}});queueMicrotask(controls);return true;}
if(typeof window!=='undefined'&&typeof document!=='undefined')installAshResearchDemo();
