import { compileCaseMap, compileRoomRules, compileRouteMemory } from '../engine/ash-keep-core.js';

export const ASH_LEGAL_DEMO_VERSION = 'td613.ash.legal-demo/v0.1-matter-workspace';
const DB_NAME = 'td613-ash-keep';
const POINTER_KEY = 'td613.ash-keep.current-case';
const PROFILE = 'legal';
const MARKER = 'demo_profile:legal';
const $ = id => document.getElementById(id);
const digest = value => `sha256:${String(value).repeat(64).slice(0,64)}`;

const LEGAL_DEMO = Object.freeze({
  profile: PROFILE,
  label: 'Legal matter',
  demo_id: 'demo_legal_cedar_house_v1',
  title: 'Cedar House Housing Matter · 14-day response window',
  summary: 'A synthetic legal matter that separates deadlines, parties, filings, evidence, privilege, witnesses, competing explanations, routes, and next actions without implying liability, merits, or outcome.',
  rooms: Object.freeze([
    {id:'room_deadlines',label:'Deadlines & Mandate',color:'#76ead4'},
    {id:'room_parties',label:'Parties & Roles',color:'#e4c66c'},
    {id:'room_filings',label:'Filings & Orders',color:'#d9a1ff'},
    {id:'room_evidence',label:'Evidence & Sources',color:'#7dd3fc'},
    {id:'room_privilege',label:'Privilege & Confidentiality',color:'#f0abfc'},
    {id:'room_alternatives',label:'Competing Explanations',color:'#fb923c'},
    {id:'room_routes',label:'Routes & Receipts',color:'#ff8b9d'},
    {id:'room_next',label:'Next Actions',color:'#86efac'}
  ]),
  nodes: Object.freeze([
    {id:'node_deadline',type:'event',label:'Fourteen-day response deadline',room_id:'room_deadlines',source_status:'SUPPLIED',confidence_posture:'HELD'},
    {id:'node_service_gap',type:'evidence-gap',label:'Service method requires verification',room_id:'room_deadlines',source_status:'OBSERVED',confidence_posture:'OPEN'},
    {id:'node_client_role',type:'entity',label:'Tenant client role',room_id:'room_parties',source_status:'SUPPLIED',sensitivity:'RESTRICTED',confidence_posture:'HELD'},
    {id:'node_owner_role',type:'entity',label:'Property owner role',room_id:'room_parties',source_status:'SUPPLIED',sensitivity:'PRIVATE',confidence_posture:'HELD'},
    {id:'node_notice',type:'artifact',label:'Synthetic termination notice',room_id:'room_filings',source_status:'SUPPLIED',confidence_posture:'HELD'},
    {id:'node_response',type:'artifact',label:'Draft responsive filing',room_id:'room_filings',source_status:'SUPPLIED',confidence_posture:'OPEN'},
    {id:'node_ledger',type:'artifact',label:'Synthetic payment ledger',room_id:'room_evidence',source_status:'SUPPLIED',sensitivity:'RESTRICTED',confidence_posture:'HELD'},
    {id:'node_original_gap',type:'evidence-gap',label:'Certified ledger not yet preserved',room_id:'room_evidence',source_status:'OBSERVED',confidence_posture:'OPEN'},
    {id:'node_client_message',type:'artifact',label:'Confidential client communication',room_id:'room_privilege',source_status:'SUPPLIED',sensitivity:'RESTRICTED',confidence_posture:'HELD'},
    {id:'node_privilege_rule',type:'claim',label:'Legal strategy remains local',room_id:'room_privilege',source_status:'DERIVED',confidence_posture:'HELD'},
    {id:'node_alt_posting',type:'hypothesis',label:'Ledger difference may reflect posting delay',room_id:'room_alternatives',source_status:'INFERRED',confidence_posture:'OPEN'},
    {id:'node_alt_service',type:'hypothesis',label:'Service defect may explain the response dispute',room_id:'room_alternatives',source_status:'INFERRED',confidence_posture:'OPEN'},
    {id:'node_route_client',type:'artifact',label:'Client update route receipt',room_id:'room_routes',source_status:'OBSERVED',disclosure_state:'DISCLOSED',confidence_posture:'HELD'},
    {id:'node_route_court',type:'artifact',label:'Court filing route receipt',room_id:'room_routes',source_status:'OBSERVED',disclosure_state:'DISCLOSED',confidence_posture:'HELD'},
    {id:'node_action_preserve',type:'intended-action',label:'Preserve original ledger and service record',room_id:'room_next',source_status:'SUPPLIED',confidence_posture:'OPEN'},
    {id:'node_action_review',type:'intended-action',label:'Human-review the responsive filing',room_id:'room_next',source_status:'SUPPLIED',confidence_posture:'OPEN'}
  ]),
  relationships: Object.freeze([
    {id:'edge_notice_deadline',from:'node_notice',to:'node_deadline',type:'starts-clock-for',source_status:'SUPPLIED'},
    {id:'edge_service_deadline',from:'node_service_gap',to:'node_deadline',type:'qualifies',source_status:'OBSERVED'},
    {id:'edge_owner_notice',from:'node_owner_role',to:'node_notice',type:'issues',source_status:'SUPPLIED'},
    {id:'edge_client_message',from:'node_client_role',to:'node_client_message',type:'communicates-through',source_status:'SUPPLIED'},
    {id:'edge_ledger_response',from:'node_ledger',to:'node_response',type:'may-support',source_status:'SUPPLIED'},
    {id:'edge_gap_preserve',from:'node_original_gap',to:'node_action_preserve',type:'requires',source_status:'OBSERVED'},
    {id:'edge_message_privilege',from:'node_client_message',to:'node_privilege_rule',type:'governed-by',source_status:'DERIVED'},
    {id:'edge_ledger_posting',from:'node_ledger',to:'node_alt_posting',type:'admits-alternative',source_status:'INFERRED'},
    {id:'edge_service_alt',from:'node_service_gap',to:'node_alt_service',type:'supports-review-of',source_status:'INFERRED'},
    {id:'edge_notice_court',from:'node_notice',to:'node_route_court',type:'bounded-fragment-left-through',source_status:'OBSERVED'},
    {id:'edge_client_route',from:'node_client_message',to:'node_route_client',type:'produced-bounded-update',source_status:'OBSERVED'},
    {id:'edge_response_review',from:'node_response',to:'node_action_review',type:'requires',source_status:'SUPPLIED'}
  ]),
  rules: Object.freeze([
    {route_id:'route_client_update',allowed_room_ids:['room_deadlines','room_filings','room_next'],local_link_keys:['edge_message_privilege'],allowed_node_types:['event','artifact','intended-action']},
    {route_id:'route_court_filing',allowed_room_ids:['room_deadlines','room_filings','room_evidence'],local_link_keys:['edge_client_message'],allowed_node_types:['event','artifact','claim']},
    {route_id:'route_opposing_counsel',allowed_room_ids:['room_filings','room_alternatives','room_routes'],local_link_keys:['edge_message_privilege'],allowed_node_types:['artifact','hypothesis']}
  ]),
  routes: Object.freeze([
    {entry_id:'route_legal_client_01',draft_digest:digest('a'),route_id:'route_client_update',purpose:'update-client-without-privileged-strategy',recipient_class:'client-role',recorded_at:'2026-07-21T12:00:00Z',disclosed_opaque_references:['node_deadline','node_notice','node_action_preserve'],recall_state:'NOT_RECALLED'},
    {entry_id:'route_legal_court_01',draft_digest:digest('b'),route_id:'route_court_filing',purpose:'file-bounded-response',recipient_class:'court-clerk',recorded_at:'2026-07-21T12:10:00Z',disclosed_opaque_references:['node_notice','node_response','node_ledger'],recall_state:'NOT_RECALLED'},
    {entry_id:'route_legal_opposing_01',draft_digest:digest('c'),route_id:'route_opposing_counsel',purpose:'request-record-preservation',recipient_class:'opposing-counsel',recorded_at:'2026-07-21T12:20:00Z',disclosed_opaque_references:['node_original_gap','node_action_preserve'],recall_state:'NOT_RECALLED'}
  ]),
  defaults: Object.freeze({
    reader_class:'deterministic-baseline',
    test_refs:['node_notice','node_deadline','node_response','node_ledger','node_original_gap'],
    route:{id:'route_court_filing',recipient_class:'court-clerk',purpose:'file-bounded-response',digest:digest('d'),refs:['node_notice','node_response','node_ledger']},
    draft:{route:'route_court_filing',recipient_class:'court-clerk',purpose:'file-bounded-response',version:'1',refs:['node_notice','node_response','node_ledger'],body:'Synthetic training draft: preserve the response deadline, identify the disputed ledger entry, and keep privileged strategy, client communications, witness contacts, and unsupported merits conclusions local.'},
    provider_task:'Review the synthetic filing packet for unsupported legal conclusions while preserving deadlines, provenance gaps, competing explanations, and the human-review ceiling.',
    protected_literals:['confidential client communication','privileged strategy note','witness contact channel','complete chronology'],
    save_questions:['Was service independently verified?','Was the original ledger preserved?','Which privileged joins remain local?'],
    save_next:['Verify deadlines with a qualified human.','Preserve originals and provenance.','Human-review every filing and disclosure.'],
    research_notes:'Synthetic Legal matter training specimen. No legal advice, guilt, liability, merits, privilege waiver, or outcome prediction is provided.',
    tradeoff:{utility:7,rebuild:4,link:7,work:9}
  })
});

function openDb(){return new Promise((resolve,reject)=>{const request=indexedDB.open(DB_NAME);request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});}
function setValue(id,value){const node=$(id);if(!node||value==null)return;node.value=String(value);node.dispatchEvent(new Event('input',{bubbles:true}));node.dispatchEvent(new Event('change',{bubbles:true}));}
async function waitForAsh(){for(let i=0;i<600;i+=1){if(window.__td613AshKeep?.refresh)return;await new Promise(resolve=>setTimeout(resolve,50));}throw new Error('Ash Keep did not reach Legal matter demo readiness.');}
async function writeRecords(caseMap,roomRules,routeMemory){const db=await openDb();await new Promise((resolve,reject)=>{const tx=db.transaction(['cases','roomRules','routeMemory'],'readwrite');tx.objectStore('cases').put(caseMap);tx.objectStore('roomRules').put({id:caseMap.case_id,value:roomRules});tx.objectStore('routeMemory').put({id:caseMap.case_id,value:routeMemory});tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);});db.close();}
function ensureStatus(){let node=$('demoProfileStatus');if(node)return node;const actions=$('startDemo')?.closest('.actions');if(!actions)return null;node=document.createElement('p');node.id='demoProfileStatus';node.className='demo-profile-status';node.setAttribute('aria-live','polite');actions.insertAdjacentElement('afterend',node);return node;}
function updateControls(){const select=$('newProfile'),button=$('startDemo');if(!select||!button||select.value!==PROFILE)return false;button.disabled=false;button.setAttribute('aria-disabled','false');button.setAttribute('aria-busy','false');button.classList.add('demo-available');button.classList.remove('demo-unavailable');button.textContent='Start Legal matter qualification demo';button.title='Hydrate a synthetic Legal matter workspace locally.';button.dataset.ashMethodDemoState='READY';if($('newCase'))$('newCase').disabled=false;const status=ensureStatus();if(status)status.innerHTML='<strong>Legal matter demo available.</strong> Synthetic deadlines, filings, evidence, privilege boundaries, routes, and next actions; no real client data.';return true;}
function applyDefaults(){const d=LEGAL_DEMO.defaults;setValue('readerClass',d.reader_class);setValue('testRefs',d.test_refs.join(', '));setValue('routeId',d.route.id);setValue('routeRecipient',d.route.recipient_class);setValue('routePurpose',d.route.purpose);setValue('routeDigest',d.route.digest);setValue('routeRefs',d.route.refs.join(', '));setValue('draftBody',d.draft.body);setValue('draftRoute',d.draft.route);setValue('draftRecipient',d.draft.recipient_class);setValue('draftPurpose',d.draft.purpose);setValue('draftVersion',d.draft.version);setValue('draftRefs',d.draft.refs.join(', '));setValue('providerTask',d.provider_task);setValue('protectedLiterals',d.protected_literals.join(', '));setValue('saveQuestions',d.save_questions.join('\n'));setValue('saveNext',d.save_next.join('\n'));setValue('researchNotes',d.research_notes);for(const [key,value] of Object.entries(d.tradeoff)){setValue(`${key}Value`,value);if($(`${key}Readout`))$(`${key}Readout`).textContent=String(value);}document.documentElement.dataset.ashDemoProfile=PROFILE;document.documentElement.dataset.ashDemoId=LEGAL_DEMO.demo_id;}
function renderDocket(){document.getElementById('apeqPaiaMethodDocket')?.remove();const layout=document.querySelector('#workspace-map .map-layout');if(!layout)return;const section=document.createElement('section');section.id='apeqPaiaMethodDocket';section.className='apeq-paia-method-docket legal-matter-docket';section.dataset.profile=PROFILE;section.innerHTML=`<h3>Legal Matter Qualification Demo<small>synthetic local matter · human review required</small></h3><p>${LEGAL_DEMO.summary}</p><div class="apeq-paia-docket-metrics"><b>rooms · ${LEGAL_DEMO.rooms.length}</b><b>objects · ${LEGAL_DEMO.nodes.length}</b><b>relations · ${LEGAL_DEMO.relationships.length}</b><b>routes · ${LEGAL_DEMO.routes.length}</b></div><p><strong>Task spine:</strong> verify deadline → preserve originals → separate privilege → test a bounded filing → human review → seal continuity.</p><details><summary>What remains local</summary><ul><li>Privileged strategy and confidential client communications</li><li>Witness contacts and complete source records</li><li>Joining keys, full chronology, and full route order</li></ul></details><p class="apeq-paia-ceiling">Claim ceiling · synthetic training only · no legal advice, guilt, liability, merits, privilege waiver, or outcome prediction</p>`;layout.before(section);}
async function currentCase(){const id=localStorage.getItem(POINTER_KEY);if(!id)return null;const db=await openDb();const record=await new Promise((resolve,reject)=>{const request=db.transaction('cases').objectStore('cases').get(id);request.onsuccess=()=>resolve(request.result||null);request.onerror=()=>reject(request.error);});db.close();return record;}

export function buildLegalMatterDemoFixture(){return LEGAL_DEMO;}
export async function rehydrateLegalMatterDemo(){try{const record=await currentCase();if(!record||(record.operator_notes||[]).includes(MARKER)===false)return null;applyDefaults();renderDocket();return LEGAL_DEMO;}catch(error){console.error(error);return null;}}
export async function hydrateLegalMatterDemo(){const button=$('startDemo'),status=ensureStatus();if(!button)return null;button.disabled=true;button.setAttribute('aria-busy','true');button.textContent='Hydrating Legal matter…';try{await waitForAsh();const caseMap=await compileCaseMap({profile:PROFILE,title:LEGAL_DEMO.title,rooms:LEGAL_DEMO.rooms,nodes:LEGAL_DEMO.nodes,relationships:LEGAL_DEMO.relationships,privateChronology:['matter scope and deadline frozen','synthetic notice indexed','original-record gaps declared','privilege boundary declared','competing explanations preserved','bounded filing human-gated'],intendedActions:LEGAL_DEMO.nodes.filter(node=>node.type==='intended-action').map(node=>node.label),sourceStatus:'SIMULATED',evidenceBasis:['synthetic Legal matter qualification fixture'],observations:['No real client, lawyer, court, landlord, witness, address, or matter is represented.'],missingness:['No original filing, certified ledger, service affidavit, or witness interview is present.'],alternatives:['posting delay','service defect','incomplete provenance'],openQuestions:['Which original record should become the custody root?','Which deadline requires qualified human verification?'],operatorNotes:[MARKER,`demo_id:${LEGAL_DEMO.demo_id}`,'claim_ceiling:no_legal_advice_liability_guilt_merits_privilege_waiver_or_outcome_prediction']});const roomRules=await compileRoomRules({caseId:caseMap.case_id,rules:LEGAL_DEMO.rules,sourceStatus:'SIMULATED'});const routeMemory=await compileRouteMemory({caseId:caseMap.case_id,entries:LEGAL_DEMO.routes,operatorDeclaredAssumptions:['The court clerk does not need privileged strategy.','Opposing counsel does not need client communications.'],unknown:['Whether service was legally sufficient.','Whether external records restore omitted context.'],sourceStatus:'SIMULATED'});await writeRecords(caseMap,roomRules,routeMemory);localStorage.setItem(POINTER_KEY,caseMap.case_id);await window.__td613AshKeep.refresh();applyDefaults();renderDocket();window.dispatchEvent(new CustomEvent('td613:ash:profile-demo-hydrated',{detail:{profile:PROFILE,case_id:caseMap.case_id,case_map_digest:caseMap.case_map_digest,route_memory_digest:routeMemory.route_memory_digest,source_status:'CONSTRUCTED',legal_advice_provided:false,child_study_authorized:false}}));setTimeout(()=>(window.__td613AshPremiumUI?.open||window.__td613OpenAshWorkspace)?.('home'),0);if(status)status.innerHTML='<strong>Legal matter demo hydrated.</strong> Synthetic training only; deadlines, filings, and disclosures remain human-reviewed.';return{caseMap,roomRules,routeMemory,fixture:LEGAL_DEMO};}catch(error){console.error(error);if(status)status.innerHTML=`<strong>Legal matter demo held.</strong> ${error.message}`;return null;}finally{setTimeout(updateControls,0);}}
export function installLegalMatterDemo(doc=document,host=window){if(!doc?.documentElement||!host||host.__td613AshLegalDemo)return false;const select=$('newProfile'),button=$('startDemo');if(!select||!button)return false;select.addEventListener('change',()=>setTimeout(updateControls,0));host.addEventListener('click',event=>{const target=event.target?.closest?.('#startDemo');if(!target||select.value!==PROFILE)return;event.preventDefault();event.stopImmediatePropagation();hydrateLegalMatterDemo();},true);host.addEventListener('td613:ash:case-opened',()=>setTimeout(rehydrateLegalMatterDemo,0));host.__td613AshLegalDemo=Object.freeze({version:ASH_LEGAL_DEMO_VERSION,profile:PROFILE,label:LEGAL_DEMO.label,hydrate:hydrateLegalMatterDemo,rehydrate:rehydrateLegalMatterDemo,fixture:buildLegalMatterDemoFixture,counts:Object.freeze({rooms:LEGAL_DEMO.rooms.length,nodes:LEGAL_DEMO.nodes.length,relationships:LEGAL_DEMO.relationships.length,rules:LEGAL_DEMO.rules.length,routes:LEGAL_DEMO.routes.length}),authority:Object.freeze({legal_advice_provided:false,human_review_required:true,child_study_authorized:false,transport_authorized:false})});doc.documentElement.dataset.ashLegalDemo=ASH_LEGAL_DEMO_VERSION;setTimeout(updateControls,0);return true;}
if(typeof document!=='undefined'&&typeof window!=='undefined')installLegalMatterDemo(document,window);
