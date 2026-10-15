// The Loom privacy laboratory executes the retained quantitative kernels.
// Synthetic models are a teaching surface; local request observations are
// separate from externally witnessed five-surface empirical measurements.
import { OBSERVER_CASES, getObserverCase } from './observer-cases.js';
import { evaluatePortableLoomGoldenEggEvidence, createPortableLoomGoldenEggKernel } from '../../engine/portable-loom-golden-egg-kernel.js';
import { buildPortableLoomResearchMathContract } from '../../engine/portable-loom-research-math.js';

export const LOOM_PRIVACY_SCIENCE_VIEW_SCHEMA = 'td613.loom.privacy-science-view/v0.1';

export function calculateLoomPrivacyScience(caseId='parity', selectedChannels=null) {
  const chosen=getObserverCase(caseId);
  const channels=selectedChannels ?? chosen.channels.map(item=>item.id);
  const evaluation=evaluatePortableLoomGoldenEggEvidence({
    finite_channel_model:chosen, selected_channels:channels
  });
  const contract=createPortableLoomGoldenEggKernel();
  const math=buildPortableLoomResearchMathContract();
  return Object.freeze({
    schema:LOOM_PRIVACY_SCIENCE_VIEW_SCHEMA,
    case_id:chosen.id,
    selected_channels:[...channels],
    model_label:chosen.title,
    model_question:chosen.question,
    model_lesson:chosen.lesson,
    evaluation,
    thresholds:math.thresholds,
    equations:math.equations,
    requirements:contract.mathematical_target,
    // Real observations are absent. A mathematical model's successful
    // finite enumeration never fills one of these five empirical surfaces.
    measured_surfaces:Object.freeze({...contract.observation}),
    empirical_credit:0,
    golden_egg_earned:false
  });
}

const rounded=value=>typeof value==='number'&&Number.isFinite(value)?value.toFixed(3):'unmeasured';
function appendText(doc,container,tag,text,className=''){
  const node=doc.createElement(tag);node.textContent=text;
  if(className)node.className=className;
  container.append(node);
  return node;
}

export function mountLoomPrivacyScienceView(host,{environment=globalThis,getLocalFacts=()=>({})}={}){
  if(!host)throw new TypeError('Privacy mathematics needs a visible host.');
  const doc=environment.document;
  const headline=appendText(doc,host,'h3','Privacy mathematics · calculated, not assumed');
  headline.className='loom-science-title';
  appendText(doc,host,'p','Explore how an observer can reconstruct a secret from several clues. These are fully specified mathematical examples. Your real AI exchange needs independently captured evidence.','loom-science-explanation');
  const options=doc.createElement('label');
  options.textContent='Declared mathematical example';
  const select=doc.createElement('select');
  select.setAttribute('aria-label','Choose a finite observer-channel example');
  for(const item of OBSERVER_CASES){
    const option=doc.createElement('option');option.value=item.id;option.textContent=item.title;
    if(item.id==='parity')option.selected=true;
    select.append(option);
  }
  options.append(select);host.append(options);
  const channels=doc.createElement('fieldset');channels.className='loom-science-channels';
  appendText(doc,channels,'legend','Observer channels included in the calculation');host.append(channels);
  const local=appendText(doc,host,'p','','loom-science-local');
  const results=doc.createElement('section');results.className='loom-science-results';results.setAttribute('aria-live','polite');host.append(results);
  const receipt=doc.createElement('details');
  appendText(doc,receipt,'summary','Inspect the calculations and measurement contract');
  const machine=appendText(doc,receipt,'pre','','loom-science-receipt');
  host.append(receipt);
  const checkedChannels=()=>[...channels.querySelectorAll('input:checked')].map(node=>node.value);
  let latest=null;
  const render=()=>{
    latest=calculateLoomPrivacyScience(select.value,checkedChannels());
    const out=latest.evaluation.finite_synthetic_calculation;
    results.replaceChildren();
    appendText(doc,results,'p',latest.model_question,'loom-science-question');
    if(out?.status==='INADMISSIBLE'){
      appendText(doc,results,'p',out.errors.join('; '));return;
    }
    const control=out.routes.control,protectedRoute=out.routes.protected;
    const table=doc.createElement('table');table.className='loom-science-table';
    const header=doc.createElement('tr');
    for(const heading of ['Finite model','Leakage I(H;baseline, channels)','New leakage after baseline','Optimal secret recovery','Signed clue overlap / excess','Authorized answer accuracy']){
      appendText(doc,header,'th',heading);
    }
    table.append(header);
    for(const [label,row] of [['Without protection',control],['With protection',protectedRoute]]){
      const tr=doc.createElement('tr');
      const view=row.selected_view;
      for(const [index,value] of [label,rounded(view?.total_bits),rounded(view?.additional_bits),rounded(view?.total_recovery),rounded(row.signed_excess_bits),rounded(row.authorized_accuracy)].entries()){
        const cell=appendText(doc,tr,'td',value);
        cell.dataset.label=['Finite model','Observed total information','New leakage after baseline','Optimal secret recovery','Signed clue excess','Authorized answer accuracy'][index];
      }
      table.append(tr);
      if(row.missing_channels.length)appendText(doc,results,'p',label+': missing '+row.missing_channels.join(', ')+'. Full-channel calculation HELD; missing evidence is never treated as zero.');
    }
    results.append(table);
    appendText(doc,results,'p',latest.model_lesson,'loom-science-lesson');
    appendText(doc,results,'p','These values come from enumerating the declared finite probability law. The signed excess is a diagnostic—not the historical joining-synergy J. Answer accuracy is not the authorized-work reconstruction distance R. Conditional leakage is not the historical observer leakage L.','loom-science-scope');
    appendText(doc,results,'p','Empirical five-surface measurement: L unmeasured · R unmeasured · J unmeasured · G unmeasured · C unobserved. A valid comparison requires one immutable episode, continuous custody, a common comparison frame, independently grounded geometry, and actual matched control/protected returns.','loom-science-unmeasured');
    // Consumer receipt retains every finite numeric result and evidentiary
    // qualifier without exposing the internal experiment nickname as UI copy.
    // Canonical internal research/export schemas remain unchanged.
    const { golden_egg: _internalResearchName, ...finiteCeiling }=out.ceiling;
    machine.textContent=JSON.stringify({
      schema:latest.schema,
      synthetic_model:{...out,ceiling:{...finiteCeiling,five_surface_qualification:_internalResearchName}},
      five_surface_target:{...latest.requirements,
        J:latest.requirements.J.replaceAll('Golden Egg','five-surface')},
      equations:latest.equations,
      thresholds:latest.thresholds,
      empirical_surfaces:latest.measured_surfaces,
      empirical_credit:latest.empirical_credit,
      five_surface_qualified:latest.golden_egg_earned
    },null,2);
  };
  const renderChannels=()=>{
    channels.querySelectorAll('label').forEach(node=>node.remove());
    for(const c of getObserverCase(select.value).channels){
      const label=doc.createElement('label'),checkbox=doc.createElement('input');
      checkbox.type='checkbox';checkbox.value=c.id;checkbox.checked=true;
      checkbox.addEventListener('change',render);
      label.append(checkbox,doc.createTextNode(' '+c.label));channels.append(label);
    }
    render();
  };
  const refresh=()=>{
    const facts=getLocalFacts();
    const selected=Number.isInteger(facts.selected_files)?facts.selected_files:0;
    const withheld=Number.isInteger(facts.withheld_files)?facts.withheld_files:0;
    local.textContent='Current Loom session · '+selected+' selected file(s), '+withheld+' withheld file(s); '+
      (facts.session_prepared?'local request prepared':'request not yet prepared')+'; '+
      (facts.local_return_admitted?'return admitted locally':'no locally admitted return')+'; '+
      (facts.gate_report_count??0)+' bounded gate report(s). These are local workflow facts, not measured L/R/J/G/C.';
  };
  select.addEventListener('change',renderChannels);
  renderChannels();refresh();
  return Object.freeze({refresh,inspect:()=>latest});
}
