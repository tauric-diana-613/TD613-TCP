/**
 * 𝌋 VIXEN CYBERNETICS — A native research Opera, not a generic Encyclopedia query.
 * OPERAHOUSE ≠ OPERA ≠ PERFORMER.
 * Each comparative encounter is confined to actual manifestations of one EMSTD613 Work.
 * The shared Universal/reference transport is backstage: no cross-Opera work is admitted.
 */
import {castVixenPerformer,stageVixenOperaEvent,assertStageRoleSeparation} from './role-boundary.mjs';
import {ADMITTED_VIXEN_CROSSWALKS,inspectVixenCrossOperaWarrant} from './cross-opera-warrant.mjs';

const PHASES=Object.freeze(['NOTICE','ACT','WORLD_ANSWERS','NAME','REST']);
const $=id=>document.getElementById(id);
const el=(tag,cl='',content)=>{const n=document.createElement(tag);if(cl)n.className=cl;if(content!==undefined)n.textContent=String(content);return n};
const add=(parent,...nodes)=>{for(const n of nodes)if(n)parent.append(n);return parent};
const text=(str,cl='vxe-copy')=>el('p',cl,str);
const muted=str=>el('span','vxe-small',str);
const action=(label,fn,cl='')=>{const b=el('button','vxe-control '+cl,label);b.type='button';b.addEventListener('click',fn);return b};
const sourceName=src=>String(src?.original_filename||src?.source_file_id||'Unidentified manifestation');
const fmt=n=>Number.isFinite(n)?new Intl.NumberFormat('en-US').format(n):'NOT_RECORDED';
const isDigest=x=>typeof x==='string'&&/^[a-f0-9]{64}$/.test(x);

function sourceFolio(src,position){
 const p=el('article','vxe-document vxe-source-folio');
 if(!src){return add(p,el('p','vxe-eyebrow','SOURCE '+position),text('There is no second recorded manifestation for this Work.'),muted('HELD · additional primary source required'));}
 add(p,el('p','vxe-eyebrow','SOURCE '+position+' · VIXEN HISTORICAL MANIFESTATION'),
   el('h3','',sourceName(src)),
   text('Recorded file identity: '+String(src.source_file_id||'UNRECORDED'),'vxe-source-note'),
   text('Declared medium: '+String(src.media_type||'UNRECORDED'),'vxe-source-note'),
   text('Recorded byte length: '+fmt(src.byte_length),'vxe-source-note'),
   el('div','vxe-digest','DECLARED SHA-256\n'+String(src.sha256||'UNRECORDED')));
 add(p,muted('SOURCE BODY UNAVAILABLE IN PUBLIC SURFACE · CATALOGUE METADATA ONLY'));
 return p;
}
function compare(a,b){
 if(!a||!b)return Object.freeze({state:'HELD_SINGLE_MANIFESTATION',meaning:'One recorded manifestation cannot furnish a pairwise comparison.',observations:[]});
 if(a.source_file_id===b.source_file_id)return Object.freeze({state:'HELD_SAME_MANIFESTATION',meaning:'A single manifestation compared with itself cannot establish an independent second source.',observations:[]});
 const observations=[
   ['File representation',a.media_type===b.media_type?'Same declared media type':'Different declared media types'],
   ['Recorded size',a.byte_length===b.byte_length?'Same recorded length':'Different recorded lengths'],
   ['Declared digest',isDigest(a.sha256)&&isDigest(b.sha256)?a.sha256===b.sha256?'Matching declared SHA-256':'Different declared SHA-256':'One or both digests missing']
 ].map(([dimension,observation])=>({dimension,observation}));
 return Object.freeze({state:'METADATA_COMPARISON_ONLY',meaning:'The catalogue establishes these file-level observations. It cannot establish conceptual equivalence, difference, shared authorship, or actual source-body identity.',observations});
}
export function compareVixenManifestations(a,b){return compare(a,b)}

export function mountVixenResearchChamber({container=$('vixenReferenceChamber')}={}){
 if(!container)return Object.freeze({mounted:false,reason:'CHAMBER_ROOT_MISSING'});
 const script=$('vixen-corpus-bundle');
 if(!script){container.textContent='HELD · Vixen historical source catalogue unavailable.';return Object.freeze({mounted:false,reason:'MISSING_VIXEN_CORPUS'})}
 let corpus;
 try{corpus=JSON.parse(script.textContent)}catch(_){container.textContent='HELD · Vixen source catalogue invalid.';return Object.freeze({mounted:false,reason:'INVALID_VIXEN_CORPUS'})}
 if(!Array.isArray(corpus.works)||corpus.works.length!==32||!Array.isArray(corpus.human_gates)||corpus.human_gates.length!==8||!Array.isArray(corpus.instruments)||corpus.instruments.length!==21||!assertStageRoleSeparation()){
  container.textContent='HELD · historical corpus census or role separation failed.';return Object.freeze({mounted:false,reason:'VIXEN_SOURCE_CONTRACT_FAILED'})
 }
 const state={phase:'NOTICE',workIndex:0,first:0,second:1,result:null,annotation:'',restReturn:'NOTICE',events:[],seq:0};
 const work=()=>corpus.works[state.workIndex];
 const sources=()=>(work().linked_sources||[]);
 const track=(verb,details={})=>state.events.push(Object.freeze({seq:++state.seq,...stageVixenOperaEvent(verb,castVixenPerformer(work()),details)}));
 function chooseWork(i){if(!Number.isInteger(i)||i<0||i>=corpus.works.length)return;state.workIndex=i;state.first=0;state.second=1;state.result=null;state.annotation='';state.phase='NOTICE';track('VIXEN_WORK_SELECTED',{work_id:work().work_id});render()}
 function begin(){if(state.phase!=='NOTICE')return;state.phase='ACT';track('MANIFESTATION_COMPARISON_OPENED',{work_id:work().work_id});render()}
 function observe(){
  if(state.phase!=='ACT')return;
  const ss=sources(),a=ss[state.first],b=ss[state.second];state.result=compare(a,b);
  state.phase='WORLD_ANSWERS';
  track('VIXEN_METADATA_OBSERVED',{first_source_id:a?.source_file_id||null,second_source_id:b?.source_file_id||null,classification:state.result.state});
  render();
 }
 function name(){if(state.phase!=='WORLD_ANSWERS')return;state.phase='NAME';track('HUMAN_QUESTION_OPENED',{classification:state.result?.state||'UNOBSERVED'});render()}
 function rest(){if(state.phase==='REST')return;state.restReturn=state.phase;state.phase='REST';track('UNPENALIZED_REST');render()}
 function resume(){if(state.phase!=='REST')return;state.phase=state.restReturn;track('OPERATOR_RESUMED');render()}
 function reset(){state.phase='NOTICE';state.result=null;track('OPERA_RETURNED_TO_NOTICE');render()}
 function selector(items,value,onChange,label){
  const sel=el('select','vxe-work-select');sel.setAttribute('aria-label',label);
  items.forEach(({value:v,label:l})=>{const op=el('option','',l);op.value=String(v);sel.append(op)});
  sel.value=String(value);sel.addEventListener('change',()=>onChange(Number(sel.value)));
  return sel;
 }
 function render(){
  container.replaceChildren();
  container.setAttribute('data-stage-role','OPERA');
  const h=el('header','vxe-heading');
  add(h,el('p','vxe-eyebrow','VIXEN CYBERNETICS · HISTORICAL WORKS AND MANIFESTATIONS'),
    el('h1','','The Documentary Score'),
    text('One Work. Its recorded manifestations. Differences that can be observed—and questions that must remain open.','vxe-lede'));
  container.append(h);
  const phases=el('ol','vxe-steps');
  PHASES.forEach((p,i)=>{const li=el('li','vxe-step'+(state.phase===p?' vxe-step-current':''));li.setAttribute('aria-current',state.phase===p?'step':'false');add(li,el('span','vxe-phase-num',String(i+1).padStart(2,'0')),el('span','',p.replaceAll('_',' ')));phases.append(li)});
  container.append(phases);
  const w=work(),ss=sources();
  const stateMessage=state.phase==='NOTICE'?'NOTICE · Inspect the historical Work before naming a relationship.'
    :state.phase==='ACT'?'ACT · Choose two manifestations of this same Work.'
    :state.phase==='REST'?'REST · Local session retained; no automatic adjudication.'
    :state.phase==='WORLD_ANSWERS'?'WORLD ANSWERS · File-level catalogue observations only; original bodies withheld.'
    :'NAME · Your interpretation remains local and cannot alter historical authorship.';
  const status=el('p','vxe-status',stateMessage);status.setAttribute('role','status');container.append(status);
  const selection=el('div','vxe-work-selector');
  add(selection,el('label','vxe-eyebrow','THE PERFORMER · SELECT ONE HISTORICAL WORK'),
    selector(corpus.works.map((x,i)=>({value:i,label:String(i+1).padStart(2,'0')+' · '+(x.display_title||x.declared_title||x.work_id)})),state.workIndex,chooseWork,'Choose Vixen Work'));
  const identity=el('h2','vxe-work-identity',w.display_title||w.declared_title||w.work_id);
  add(selection,identity,text('Work ID: '+w.work_id+' · Recorded manifestations: '+ss.length+' · Identity: '+(w.identity_status||'UNRESOLVED'),'vxe-source-note'));
  container.append(selection);
  const grid=el('div','vxe-spatial vxe-vixen-pair');
  const first=el('section','vxe-estate vxe-estate-vixen');
  const hinge=el('div','vxe-membrane');
  const second=el('section','vxe-estate vxe-estate-companion');
  first.setAttribute('data-stage-role','PERFORMER');second.setAttribute('data-stage-role','PERFORMER');
  add(first,el('p','vxe-eyebrow','01 / RECORDED MANIFESTATION'),el('h2','','The First Folio'));
  add(second,el('p','vxe-eyebrow','02 / RECORDED MANIFESTATION'),el('h2','','The Counter-Folio'));
  if(ss.length){first.append(selector(ss.map((src,i)=>({value:i,label:sourceName(src)})),state.first,i=>{state.first=i;state.result=null;if(state.phase==='WORLD_ANSWERS'||state.phase==='NAME')state.phase='ACT';render()},'Select first Vixen manifestation'))}
  first.append(sourceFolio(ss[state.first], 'A'));
  if(ss.length>1){
    second.append(selector(ss.map((src,i)=>({value:i,label:sourceName(src)})),state.second,i=>{state.second=i;state.result=null;if(state.phase==='WORLD_ANSWERS'||state.phase==='NAME')state.phase='ACT';render()},'Select counterpart manifestation'));
  }
  second.append(sourceFolio(ss[state.second], 'B'));
  add(hinge,el('span','','S ≠ W ≠ A'),el('strong','','ONE WORK · TWO SOURCE LOCI'),el('span','','AUTHORSHIP UNRESOLVED'));
  grid.append(first,hinge,second);container.append(grid);
  const controls=el('section','vxe-tail');
  const commands=el('div','vxe-actions');
  if(state.phase==='NOTICE')commands.append(action('Begin this Work’s comparison',begin,'vxe-primary'));
  if(state.phase==='ACT')commands.append(action('Observe the recorded differences',observe,'vxe-primary'));
  if(state.phase==='WORLD_ANSWERS')commands.append(action('Name an unresolved question',name,'vxe-primary'));
  if(state.phase==='NAME'||state.phase==='WORLD_ANSWERS')commands.append(action('Return to the Work',reset));
  if(state.phase!=='REST')commands.append(action('Rest without penalty',rest,'vxe-rest'));
  else commands.append(action('Return to the Opera',resume,'vxe-primary'));
  const exit=el('a','vxe-control vxe-exit','Return to TD613 Encyclopedia ↗');exit.href=new URL('../',import.meta.url).href;commands.append(exit);
  controls.append(commands);
  const lineage=el('details','vxe-native-questions');
  lineage.append(el('summary','','Historical Vixen questions and declared lineage limits'));
  const challengeList=el('ul','vxe-native-question-list');
  (Array.isArray(w.unresolved_questions)?w.unresolved_questions:[]).forEach(q=>challengeList.append(el('li','',String(q))));
  (Array.isArray(w.substantive_differences_if_any)?w.substantive_differences_if_any:[]).forEach(q=>challengeList.append(el('li','',String(q))));
  if(!challengeList.children.length)challengeList.append(el('li','','No additional lineage question is public for this Work.'));
  lineage.append(challengeList);
  lineage.append(text('These questions are recorded Vixen source metadata, not freshly verified manuscript claims.','vxe-source-note'));
  controls.append(lineage);
  if(state.result&&['WORLD_ANSWERS','NAME'].includes(state.phase)){
    const evidence=el('article','vxe-result');
    add(evidence,el('p','vxe-eyebrow','CATALOGUE OBSERVATION · '+state.result.state),text(state.result.meaning));
    const list=el('dl','vxe-observations');
    state.result.observations.forEach(o=>{list.append(el('dt','',o.dimension),el('dd','',o.observation))});
    evidence.append(list);
    evidence.append(muted('DECLARED SHA-256 VALUES ARE NOT IN-BROWSER CONTENT VERIFICATIONS · SOURCE BODIES WITHHELD'));
    controls.append(evidence);
  }
  if(state.phase==='NAME'){
    const note=el('textarea','vxe-name');note.rows=3;note.value=state.annotation;note.placeholder='Name a question about these Vixen manifestations, without concluding authorship…';
    note.setAttribute('aria-label','Local unresolved Vixen question');
    note.addEventListener('input',()=>{state.annotation=note.value.slice(0,1000)});controls.append(note);
    controls.append(text('This note remains in browser memory; the eight human gates remain UNADJUDICATED_PAIR.','vxe-source-note'))
  }
  const policy=inspectVixenCrossOperaWarrant({work:w,source:ss[state.first]});
  const backstage=el('details','vxe-trace');backstage.append(el('summary','','Operahouse custody status / separate Encyclopedia'));
  backstage.append(text('Cross-Opera source passage: '+policy.state+' · '+policy.reason+'. No mapping is currently human-ratified. This Opera displays its own Works only.','vxe-source-note'));
  backstage.append(text('Public Universal reference index remains available through the separate TD613 Encyclopedia. Its records cannot become Vixen performers through lexical search or proximity.','vxe-source-note'));
  controls.append(backstage);
  const history=el('details','vxe-trace');history.append(el('summary','','This Opera’s local route history ('+state.events.length+')'));
  const list=el('ol','vxe-route-history');state.events.forEach(e=>list.append(el('li','',String(e.seq).padStart(2,'0')+' · '+e.action)));history.append(list);controls.append(history);
  container.append(controls);
 }
 track('VIXEN_WORK_SELECTED',{work_id:work().work_id});render();
 return Object.freeze({mounted:true,phase:()=>state.phase,status:()=>state.result?.state||'VIXEN_NOTICE',history:()=>state.events.slice(),
   crossOperaWarrants:()=>ADMITTED_VIXEN_CROSSWALKS.length,rest});
}
if(typeof document!=='undefined')mountVixenResearchChamber();
