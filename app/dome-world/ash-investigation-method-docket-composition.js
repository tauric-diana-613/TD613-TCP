export const ASH_INVESTIGATION_METHOD_DOCKET_COMPOSITION_VERSION='td613.ash.investigation-method-docket-composition/v0.1';

function compose(doc=document){
  const docket=doc.getElementById('apeqPaiaMethodDocket');
  const spine=doc.getElementById('investigationTaskSpine');
  if(!docket||docket.dataset.profile!=='investigation'||!spine?.parentElement)return false;
  if(docket.previousElementSibling===spine&&docket.parentElement===spine.parentElement)return true;
  spine.insertAdjacentElement('afterend',docket);
  docket.dataset.investigationComposition='guided-home';
  return true;
}

export function installInvestigationMethodDocketComposition(doc=document,host=window){
  if(!doc?.documentElement||!host)return false;
  if(doc.documentElement.dataset.ashInvestigationMethodDocketComposition===ASH_INVESTIGATION_METHOD_DOCKET_COMPOSITION_VERSION)return false;
  doc.documentElement.dataset.ashInvestigationMethodDocketComposition=ASH_INVESTIGATION_METHOD_DOCKET_COMPOSITION_VERSION;
  let queued=false;
  const defer=()=>{
    if(queued)return;
    queued=true;
    host.setTimeout(()=>{queued=false;compose(doc);},0);
  };
  host.addEventListener('td613:ash:profile-demo-hydrated',event=>{if(event.detail?.profile==='investigation')defer();});
  host.addEventListener('td613:ash:case-opened',defer);
  const observer=new MutationObserver(defer);
  observer.observe(doc.body,{childList:true,subtree:true});
  host.__td613AshInvestigationMethodDocket=Object.freeze({version:ASH_INVESTIGATION_METHOD_DOCKET_COMPOSITION_VERSION,compose:()=>compose(doc)});
  defer();
  return true;
}

if(typeof window!=='undefined'&&typeof document!=='undefined')installInvestigationMethodDocketComposition();
