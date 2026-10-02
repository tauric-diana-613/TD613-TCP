import { HOLONOMY_LOOM_ADVISORY_RULES, canonicalLoomAdvisoryFinding } from '../holonomy-loom-advisory-policy.js';
import { validateShi } from '../khonapolit-covenant.js';

/** Canonical choices only. No composer, assay JSON, source text or chat history. */
export function mountLoomInstrumentAdvisory(root,{environment=root?.ownerDocument?.defaultView}={}) {
  if(!root)return null;
  const doc=root.ownerDocument;
  root.innerHTML=`<details><summary>Ask Kʰonapolit to explain a warning</summary><p>This model request sends a canonical warning type and its fixed policy labels. Source text, matched values, Lab input and conversation history stay outside this packet. The returned explanation carries advisory authority only.</p><label for="ilRule">Warning type</label><select id="ilRule"></select><p id="ilAdvisoryTokens" class="il-note"></p><p id="ilAdvisoryIssuance" class="il-note"></p><button type="button" id="ilExplain">Ask Kʰonapolit why ↗</button><button type="button" id="ilExplainStop" hidden>Stop waiting</button><p id="ilAdvisoryStatus" role="status" aria-live="polite">Nothing sent. A valid-format minted SHI in the workspace is required for this optional model route.</p><div id="ilAdvisoryAnswer"></div></details>`;
  const $=id=>root.querySelector(`#${id}`);
  for(const [id,rule] of Object.entries(HOLONOMY_LOOM_ADVISORY_RULES)){const option=doc.createElement('option');option.value=id;option.textContent=rule.label;$('ilRule').append(option);}
  let controller=null,version=0,disposed=false,timer=null;
  function refresh(){const packet=canonicalLoomAdvisoryFinding($('ilRule').value,'TD613_HOSTED');$('ilAdvisoryTokens').textContent=`Will travel: ${packet.rule_id} · ${packet.evidence_class} · ${packet.action_class} · ${packet.minimized_context.why_class} · TD613_HOSTED`;}
  function changed(){version++;controller?.abort();$('ilAdvisoryAnswer').replaceChildren();$('ilAdvisoryStatus').textContent='Warning changed. Earlier advice no longer applies.';refresh();}
  async function explain(){
    if(controller||disposed)return;
    const shi=doc.querySelector('#aiShi')?.value||'';
    if(!validateShi(shi).valid){$('ilAdvisoryStatus').textContent='Model request held. Enter a minted SHI in the workspace; local Lab instruments remain available.';return;}
    const token=++version;
    const advisory=canonicalLoomAdvisoryFinding($('ilRule').value,'TD613_HOSTED');
    const activeController=new environment.AbortController();controller=activeController;$('ilExplain').disabled=true;$('ilExplainStop').hidden=false;$('ilAdvisoryAnswer').replaceChildren();
    $('ilAdvisoryStatus').textContent='Sending the displayed canonical labels to the model route. Custody admission remains separate.';
    const activeTimer=environment.setTimeout(()=>activeController.abort(),225000);timer=activeTimer;
    try{
      const response=await environment.fetch('/api/khonapolit?operation=loom-advisory',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({schema:'td613.holonomy-loom.khonapolit-advisory-request/v0.1',advisory,issuance:{shi}}),signal:activeController.signal});
      const raw=await response.text();if(raw.length>131072)throw new Error('The advisory return exceeded the bounded size.');const body=JSON.parse(raw);
      if(disposed||token!==version)return;
      if(!response.ok||body.ok!==true||typeof body.text!=='string')throw new Error(body.error||'The model returned no admissible explanation.');
      const paragraph=doc.createElement('p');paragraph.textContent=body.text;$('ilAdvisoryAnswer').replaceChildren(paragraph);$('ilAdvisoryStatus').textContent='Model explanation received. Its advice grants no release, admission or empirical authority.';
    }catch(error){if(!disposed&&token===version)$('ilAdvisoryStatus').textContent=error.name==='AbortError'?'Waiting stopped. A provider may already have received the canonical packet.':`Advisory held · ${error.message}`;}
    finally{environment.clearTimeout(activeTimer);if(controller===activeController){timer=null;controller=null;if(!disposed){$('ilExplain').disabled=false;$('ilExplainStop').hidden=true;}}}
  }
  function stop(){controller?.abort();}
  $('ilRule').addEventListener('change',changed);$('ilExplain').addEventListener('click',explain);$('ilExplainStop').addEventListener('click',stop);refresh();$('ilAdvisoryIssuance').textContent='Your entered SHI value also travels to the existing Kʰonapolit route. A format check does not authenticate minting or identity. Advice grants no gate authority.';
  return {dispose(){disposed=true;version++;controller?.abort();if(timer!==null)environment.clearTimeout(timer);$('ilRule').removeEventListener('change',changed);$('ilExplain').removeEventListener('click',explain);$('ilExplainStop').removeEventListener('click',stop);root.replaceChildren();}};
}
