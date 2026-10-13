import { LOOM_GATE_EXPLANATION } from '../engine/portable-loom-gate-explanation.js';
import { PORTABLE_LOOM_MECHANISMS } from '../engine/portable-loom-mechanisms.js';
import { portableLoomFooterText } from '../engine/portable-loom-output.js';

const el=(doc,tag,text='')=>{const node=doc.createElement(tag);node.textContent=text;return node;};
export function createLoomGateDisclosure(doc,{id='loomGateHow',onGate=()=>{}}={}){
  if(!doc.querySelector('link[data-loom-gate-disclosure]')){const style=doc.createElement('link');style.rel='stylesheet';style.href=new URL('./loom-gate-disclosure.css',import.meta.url).href;style.dataset.loomGateDisclosure='v0.1';doc.head.append(style);}
  const section=el(doc,'section');section.className='loom-gate-disclosure';
  const footer=el(doc,'footer');footer.className='loom-gate-output-footer';
  const status=el(doc,'p'),gate=el(doc,'button','米 Check Loom Gate');gate.type='button';gate.addEventListener('click',onGate);
  const help=el(doc,'button','How it works 下');help.type='button';help.setAttribute('aria-controls',id);help.setAttribute('aria-expanded','false');
  const drawer=el(doc,'section');drawer.id=id;drawer.className='loom-gate-how-drawer';drawer.hidden=true;drawer.tabIndex=-1;drawer.setAttribute('aria-label','Loom Gate methods and expert nomenclature');
  const close=el(doc,'button','Close explanation');close.type='button';
  const receipt=el(doc,'pre');receipt.className='loom-gate-exact-report';
  drawer.append(el(doc,'h4','How do I know? · Loom Gate methods'),close,receipt);
  for(const item of LOOM_GATE_EXPLANATION)drawer.append(el(doc,'h5',item.term),el(doc,'p',item.explanation));
  drawer.append(el(doc,'h5','Antigravity mechanism registry · conventional and TD613 names'),el(doc,'p','Registry presence identifies jurisdiction. Execution scope and evidence class remain separate; listing a mechanism does not claim that it ran.'));
  const scroll=el(doc,'div');scroll.className='loom-gate-registry-scroll';
  const table=el(doc,'table'),head=el(doc,'tr');
  for(const label of ['ID','Conventional nomenclature','TD613 historical name','Evidence class','Portable scope']){const th=el(doc,'th',label);th.scope='col';head.append(th);}
  const thead=el(doc,'thead');thead.append(head);table.append(thead);
  const body=el(doc,'tbody');
  for(const mechanism of PORTABLE_LOOM_MECHANISMS){const row=el(doc,'tr');for(const key of ['id','conventional_name','td613_historical_name','evidence_class','implementation_scope'])row.append(el(doc,'td',mechanism[key]));body.append(row);}
  table.append(body);scroll.append(table);drawer.append(scroll);
  let reports=[],phase='ACTIVE';
  const update=(nextReports=[],nextPhase='ACTIVE')=>{
    reports=nextReports;phase=nextPhase;
    const exposures=reports.filter(report=>report.status==='OBSERVED_EXPOSURE'||report.coverage?.disclosed_targets>0||report.coverage?.successful_reconstruction_attempts>0).length;
    const scope=reports.length?`${reports.length} carried declared capture${reports.length===1?'':'s'}; new output unchecked`:'no captured result';
    status.textContent=portableLoomFooterText({phase,gateStatus:exposures?'EXPOSURE_RETAINED':reports.length?'SEE_SCOPED_REPORTS':'NOT_RUN',checkedScope:scope}).replace(/ ⟐$/u,' · How do I know? 下 ⟐');
    receipt.textContent=JSON.stringify({basis:reports.length?'CARRIED_SCOPED_SUMMARIES_REQUIRE_LOCAL_PRIVATE_RECOMPUTATION':'NOT_RUN',reports},null,2);
  };
  const open=report=>{if(report)receipt.textContent=JSON.stringify(report,null,2);else update(reports,phase);drawer.hidden=false;help.setAttribute('aria-expanded','true');drawer.focus?.({preventScroll:false});drawer.scrollIntoView?.({block:'nearest'});};
  const hide=()=>{drawer.hidden=true;help.setAttribute('aria-expanded','false');help.focus?.();};
  help.addEventListener('click',()=>drawer.hidden?open():hide());close.addEventListener('click',hide);
  drawer.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();hide();}});
  footer.append(status,gate,help);section.append(footer,drawer);update();
  return Object.freeze({section,drawer,help,open,update});
}
