import {
  HOLONOMY_LOOM_ADVISORY_RULES,
  HOLONOMY_LOOM_PROVIDER_ADVISORY_SCHEMA
} from '../app/dome-world/holonomy-loom-advisory-policy.js';
import {
  auditPortablePayloadVocabulary,
  compilePortableAiaProjection
} from '../app/dome-world/portable-aia-three-route-invariance.js';

export const LOCAL_POCKET_ARTIFACT_SCHEMA = 'td613.holonomy-loom.local-pocket-artifact/v0.2';
export const LOCAL_POCKET_EXPORT_SCHEMA = 'td613.holonomy-loom.local-pocket-export/v0.2-born-minimized';

const DETECTORS = Object.freeze([
  Object.freeze({ rule_id: 'PRIVATE_KEY_BLOCK', source: '-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----', flags: 'g' }),
  Object.freeze({ rule_id: 'BEARER_TOKEN_BLOCK', source: '\\bBearer\\s+[A-Za-z0-9._~+\\/-]{16,}={0,2}\\b', flags: 'gi' }),
  Object.freeze({ rule_id: 'COMMON_API_KEY_BLOCK', source: '\\bAIza[0-9A-Za-z_-]{30,}\\b', flags: 'g' }),
  Object.freeze({ rule_id: 'COMMON_API_KEY_BLOCK', source: '\\bgh(?:p|o|u|s|r)_[A-Za-z0-9_]{20,}\\b', flags: 'g' }),
  Object.freeze({ rule_id: 'COMMON_API_KEY_BLOCK', source: '\\beyJ[A-Za-z0-9_-]+\\.[A-Za-z0-9_-]+\\.[A-Za-z0-9_-]+\\b', flags: 'g' }),
  Object.freeze({ rule_id: 'EMAIL_IDENTIFIER', source: '\\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}\\b', flags: 'gi' }),
  Object.freeze({ rule_id: 'PHONE_IDENTIFIER', source: '(?:\\+?1[\\s.-]?)?(?:\\(?\\d{3}\\)?[\\s.-]?)\\d{3}[\\s.-]?\\d{4}\\b', flags: 'g' }),
  Object.freeze({ rule_id: 'EXACT_TIMESTAMP', source: '\\b\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}(?::\\d{2}(?:\\.\\d{1,6})?)?(?:Z|[+-]\\d{2}:\\d{2})\\b', flags: 'g' })
]);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function buildLocalPocketManifest() {
  const rules = {};
  const payloadTemplates = {};
  for (const [ruleId, rule] of Object.entries(HOLONOMY_LOOM_ADVISORY_RULES)) {
    const projection = compilePortableAiaProjection({ ruleId, routeMode: 'LOCAL_POCKET' });
    const audit = auditPortablePayloadVocabulary(projection);
    if (!audit.ok) throw new Error(`portable payload vocabulary failed for ${ruleId}`);
    rules[ruleId] = clone(rule);
    payloadTemplates[ruleId] = clone(projection.portable_payload);
  }
  const boundaryProjection = compilePortableAiaProjection({ ruleId: 'EMAIL_IDENTIFIER', routeMode: 'LOCAL_POCKET' });
  return Object.freeze({
    schema: LOCAL_POCKET_ARTIFACT_SCHEMA,
    canonical_policy_schema: HOLONOMY_LOOM_PROVIDER_ADVISORY_SCHEMA,
    route_mode: 'LOCAL_POCKET',
    route_boundary: clone(boundaryProjection.portable_payload.route_boundary),
    rules: Object.freeze(rules),
    payload_templates: Object.freeze(payloadTemplates),
    detectors: DETECTORS,
    authority: Object.freeze({
      release_authority: false,
      human_closure_required: true,
      network_required: false,
      remote_model_required: false,
      automatic_persistence: false
    })
  });
}

function escapeScriptJson(value) {
  return JSON.stringify(value).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
}

export function renderLocalPocketHtml() {
  const manifest = buildLocalPocketManifest();
  const manifestJson = escapeScriptJson(manifest);
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light dark">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; connect-src 'none'; img-src data:; style-src 'unsafe-inline'; script-src 'unsafe-inline'; font-src 'none'; media-src 'none'; object-src 'none'; frame-src 'none'; worker-src 'none'; form-action 'none'; base-uri 'none'">
<title>Holonomy Loom · Local Pocket v0.2</title>
<style>
:root{font-family:ui-rounded,"SF Pro Rounded",Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#342842;background:#fff9ff;font-synthesis:none}
*{box-sizing:border-box}body{margin:0;min-height:100vh;background:radial-gradient(circle at 14% 6%,#ffe0f3 0,transparent 28rem),radial-gradient(circle at 86% 10%,#dcefff 0,transparent 27rem),linear-gradient(180deg,#fff8ff,#f8fbff 55%,#fffaf0)}button,textarea{font:inherit}.pocket{width:min(58rem,calc(100% - 1rem));margin:auto;padding:1rem 0 2rem}.shell,.card,.answer,.controls{border:2px solid rgba(74,54,93,.16);box-shadow:0 12px 28px rgba(95,72,120,.09)}.shell{display:grid;grid-template-columns:1fr auto;gap:1rem;padding:1.2rem;border-radius:1.6rem;background:rgba(255,255,255,.9)}.eyebrow{margin:0 0 .35rem;font-size:.74rem;font-weight:900;letter-spacing:.11em;text-transform:uppercase;color:#73558f}h1,h2,h3,p{margin-top:0}h1{margin-bottom:.45rem;font-size:clamp(2rem,7vw,4rem);line-height:.98;letter-spacing:-.04em}.lede{margin:0;max-width:42rem;font-size:1.1rem;line-height:1.5}.loomling{align-self:center;width:5.4rem;height:5.4rem;border-radius:48% 52% 46% 54%;display:grid;place-items:center;background:linear-gradient(145deg,#fff2b8,#ffd8ef 55%,#dce8ff);border:3px solid rgba(57,43,73,.2);font-size:2.4rem}.steps{display:flex;gap:.45rem;flex-wrap:wrap;margin-top:1rem}.step{padding:.35rem .65rem;border-radius:999px;background:#f0e9f5;font-size:.78rem;font-weight:850}.card,.answer{margin-top:1rem;padding:1rem;border-radius:1.35rem;background:rgba(255,255,255,.88)}label{display:block;font-weight:900;margin-bottom:.45rem}.quiet{color:#6a6070;line-height:1.45}.draft{width:100%;min-height:11rem;padding:.85rem;border:2px solid rgba(74,54,93,.22);border-radius:1rem;background:rgba(255,255,255,.7);resize:vertical}.protected{min-height:6.5rem}.actions,.controls{display:flex;gap:.65rem;flex-wrap:wrap;margin-top:1rem}.actions button,.controls button{appearance:none;border:2px solid rgba(74,54,93,.2);border-radius:999px;padding:.7rem 1rem;background:#fff;color:inherit;font-weight:850;cursor:pointer}.actions button[disabled],.controls button[disabled]{opacity:.42;cursor:not-allowed}.primary{background:#49385b!important;color:#fff!important}.answer{background:linear-gradient(135deg,#342844,#59456f 68%,#4c6488);color:#fff}.answer .quiet{color:rgba(255,255,255,.78)}.traffic{font-size:1.45rem;font-weight:950;letter-spacing:.02em}.finding{margin-top:.65rem;padding:.75rem;border-radius:1rem;background:rgba(255,255,255,.1)}.finding strong{display:block;margin-bottom:.15rem}.pill{display:inline-block;margin-bottom:.35rem;padding:.18rem .5rem;border:1px solid currentColor;border-radius:999px;font-size:.72rem;font-weight:900}details{margin-top:1rem;padding-top:.8rem;border-top:1px dashed rgba(255,255,255,.3)}summary{cursor:pointer;font-weight:900}.answer pre{white-space:pre-wrap;overflow-wrap:anywhere;font-size:.76rem}.controls{padding:.8rem;border-radius:1.2rem;background:rgba(255,255,255,.9)}.fine{margin:.8rem 0 0;text-align:center;color:#6d6473;font-size:.76rem}[data-resting="true"] .card,[data-resting="true"] .answer{opacity:.7}@media(max-width:520px){.shell{grid-template-columns:1fr}.loomling{width:4.7rem;height:4.7rem}.actions,.controls{display:grid}.actions button,.controls button{width:100%}}@media(prefers-reduced-motion:reduce){*{scroll-behavior:auto!important;transition:none!important}}
</style>
</head>
<body>
<main class="pocket" data-local-pocket aria-busy="false">
<header class="shell">
<div><p class="eyebrow">U+10D613 · Local Pocket</p><h1>Holonomy Loom</h1><p class="lede">Before you send it, check what this message carries. The first check stays in this page.</p><div class="steps" aria-label="Pocket route"><span class="step">SEE</span><span class="step">CHECK</span><span class="step">UNDERSTAND</span><span class="step">𝄐 REST</span></div></div>
<div class="loomling" aria-label="Pocket Loomling">🧶</div>
</header>
<section class="card"><label for="draft">SEE · What are you thinking about sending?</label><textarea class="draft" id="draft" autocomplete="off" spellcheck="false" placeholder="Paste a draft here. The local check does not send it anywhere."></textarea></section>
<section class="card"><label for="protected">Anything that must stay private?</label><p class="quiet">One exact word, name, code, or phrase per line. A match becomes a hard local REMOVE rule. These terms never enter the Pocket packet.</p><textarea class="draft protected" id="protected" autocomplete="off" spellcheck="false" placeholder="private project name&#10;case number&#10;family nickname"></textarea></section>
<div class="actions"><button class="primary" id="check">CHECK THIS MESSAGE</button><button id="safer" disabled>MAKE A SAFER COPY</button><button id="copyText" disabled>COPY CHECKED TEXT</button><button id="copyPacket" disabled>COPY POCKET PACKET</button></div>
<section class="answer" id="answer" aria-live="polite"><div class="traffic">NOT CHECKED YET</div><p>Run the local Loom before using either Loom-controlled copy door.</p><p class="quiet">Green only means no enabled canonical detector currently requires REMOVE or CHANGE. It never means zero privacy risk.</p><details><summary>Open the grown-up drawer</summary><pre id="exact">No packet yet.</pre></details></section>
<section class="card"><h2>What the two doors do</h2><p><strong>Copy checked text</strong> moves the draft you deliberately checked. <strong>Copy Pocket packet</strong> moves only the canonical finding/boundary tokens. The packet never contains the draft, matched values, protected terms, spans, digests, receipts, or route-history prose.</p><p class="quiet">The Loom can control its own buttons. It cannot prevent manual copying, operating-system access, browser behavior outside this artifact, or what another room does after you deliberately carry something there.</p></section>
<div class="controls"><button id="rest">𝄐 NAP NOOK</button><button id="return">COME BACK</button><button id="clear">FRONT DOOR · CLEAR & EXIT</button></div>
<p class="fine">No server · no model · no persistence · no hidden provider · no release authority · human closure required.</p>
</main>
<script id="manifest" type="application/json">${manifestJson}</script>
<script>
(() => {
'use strict';
const manifest = JSON.parse(document.querySelector('#manifest').textContent);
const root = document.querySelector('[data-local-pocket]');
const draftEl = document.querySelector('#draft');
const protectedEl = document.querySelector('#protected');
const answerEl = document.querySelector('#answer');
const exactEl = document.querySelector('#exact');
const checkButton = document.querySelector('#check');
const saferButton = document.querySelector('#safer');
const copyTextButton = document.querySelector('#copyText');
const copyPacketButton = document.querySelector('#copyPacket');
const restButton = document.querySelector('#rest');
const returnButton = document.querySelector('#return');
const clearButton = document.querySelector('#clear');
const networkAudit = { attempts: 0 };
function blockedNetwork(){ networkAudit.attempts += 1; throw new Error('TD613_LOCAL_POCKET_NETWORK_BLOCK'); }
try{window.fetch=blockedNetwork}catch{}
try{XMLHttpRequest.prototype.open=blockedNetwork}catch{}
try{window.WebSocket=function(){return blockedNetwork()}}catch{}
try{window.EventSource=function(){return blockedNetwork()}}catch{}
try{navigator.sendBeacon=blockedNetwork}catch{}
let checkedSnapshot = null;
let findings = [];
let packet = null;
let resting = false;
function protectedTerms(){return protectedEl.value.split(/\\r?\\n/).map(v=>v.trim()).filter(Boolean)}
function invalidate(){checkedSnapshot=null;findings=[];packet=null;copyTextButton.disabled=true;copyPacketButton.disabled=true;saferButton.disabled=true;exactEl.textContent='No packet yet.'}
function addFinding(into,ruleId,start,end){const rule=manifest.rules[ruleId];into.push({rule_id:rule.rule_id,evidence_class:rule.evidence_class,action_class:rule.action_class,finding_category:rule.finding_category,why_class:rule.why_class,start,end})}
function inspect(text){const out=[];for(const detector of manifest.detectors){const re=new RegExp(detector.source,detector.flags);for(const match of text.matchAll(re))addFinding(out,detector.rule_id,match.index,match.index+match[0].length)}for(const term of protectedTerms()){let cursor=0;while(term&&(cursor=text.indexOf(term,cursor))!==-1){addFinding(out,'USER_DECLARED_PROTECTED_TERM',cursor,cursor+term.length);cursor+=term.length}}return out.sort((a,b)=>(a.start??Number.MAX_SAFE_INTEGER)-(b.start??Number.MAX_SAFE_INTEGER))}
function posture(){if(findings.some(f=>f.action_class==='REMOVE'))return'RED';if(findings.some(f=>f.action_class==='CHANGE'))return'YELLOW';return'GREEN'}
function uniqueRuleIds(){return [...new Set(findings.map(f=>f.rule_id))]}
function makePacket(){return {schema:'${LOCAL_POCKET_EXPORT_SCHEMA}',portable_findings:uniqueRuleIds().map(id=>manifest.payload_templates[id]),release_authority:false,human_closure_required:true}}
function esc(value){return String(value).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[ch]))}
function childWhy(f){const label=manifest.rules[f.rule_id].label;if(f.action_class==='REMOVE')return 'The local Loom says this '+label+' must come out before its controlled copy door opens.';return 'The local Loom found a '+label+' you may want to generalize before carrying the message onward.'}
function render(){const status=posture();const cards=findings.map(f=>'<div class="finding"><span class="pill">'+esc(f.action_class)+'</span><strong>'+esc(manifest.rules[f.rule_id].label)+'</strong>'+esc(childWhy(f))+'</div>').join('');const message=status==='GREEN'?'No enabled canonical detector fired.':status==='YELLOW'?'The message carries something worth changing before you move it.':'Stop at this door. A canonical REMOVE rule still fires.';answerEl.querySelector('.traffic').textContent=status;const firstP=answerEl.querySelector('p');firstP.textContent=message;for(const old of [...answerEl.querySelectorAll('.finding')])old.remove();const details=answerEl.querySelector('details');details.insertAdjacentHTML('beforebegin',cards);packet=makePacket();exactEl.textContent=JSON.stringify({packet,network_attempts:networkAudit.attempts,checked_locally:true},null,2);const hardBlock=findings.some(f=>f.action_class==='REMOVE');copyTextButton.disabled=hardBlock;copyPacketButton.disabled=hardBlock;saferButton.disabled=findings.length===0}
function runCheck(){checkedSnapshot={draft:draftEl.value,protected:protectedEl.value};findings=inspect(draftEl.value);render()}
function stillChecked(){return Boolean(checkedSnapshot&&checkedSnapshot.draft===draftEl.value&&checkedSnapshot.protected===protectedEl.value)}
function ensureCurrent(){if(!stillChecked())runCheck();return !findings.some(f=>f.action_class==='REMOVE')}
function saferCopy(){if(!stillChecked())runCheck();let next=draftEl.value;for(const f of [...findings].filter(f=>Number.isInteger(f.start)&&Number.isInteger(f.end)).sort((a,b)=>b.start-a.start)){const tag=f.action_class==='REMOVE'?'[PROTECTED]':'[GENERALIZED]';next=next.slice(0,f.start)+tag+next.slice(f.end)}draftEl.value=next;invalidate();answerEl.querySelector('.traffic').textContent='CHECK AGAIN';answerEl.querySelector('p').textContent='The safer copy changed the draft. Run CHECK again before either controlled copy door reopens.'}
async function copyValue(value,kind){try{await navigator.clipboard.writeText(value);answerEl.insertAdjacentHTML('beforeend','<p class="finding"><strong>'+kind+' copied.</strong> This was an explicit local operator action.</p>')}catch{answerEl.insertAdjacentHTML('beforeend','<p class="finding"><strong>Clipboard unavailable.</strong> Nothing was sent by the Pocket.</p>')}}
checkButton.addEventListener('click',()=>{if(resting)return;runCheck()});
saferButton.addEventListener('click',()=>{if(resting)return;saferCopy()});
copyTextButton.addEventListener('click',async()=>{if(resting)return;if(!ensureCurrent())return;await copyValue(draftEl.value,'Checked text')});
copyPacketButton.addEventListener('click',async()=>{if(resting)return;if(!ensureCurrent())return;packet=makePacket();await copyValue(JSON.stringify(packet),'Pocket packet')});
for(const el of [draftEl,protectedEl])el.addEventListener('input',()=>{invalidate();answerEl.querySelector('.traffic').textContent='CHANGED';answerEl.querySelector('p').textContent='Something changed. Run CHECK again.'});
restButton.addEventListener('click',()=>{resting=true;root.dataset.resting='true';checkButton.disabled=true;saferButton.disabled=true;copyTextButton.disabled=true;copyPacketButton.disabled=true;answerEl.querySelector('.traffic').textContent='RESTING';answerEl.querySelector('p').textContent='Nap nook is holding the last result. No new check or copy action runs while resting.'});
returnButton.addEventListener('click',()=>{resting=false;root.dataset.resting='false';checkButton.disabled=false;if(stillChecked())render();else invalidate()});
clearButton.addEventListener('click',()=>{draftEl.value='';protectedEl.value='';resting=false;root.dataset.resting='false';checkButton.disabled=false;invalidate();answerEl.querySelector('.traffic').textContent='POCKET CLEARED';answerEl.querySelector('p').textContent='Local draft and protection fields are clear.'});
window.__TD613_LOCAL_POCKET_V0_2__=Object.freeze({schema:manifest.schema,route_mode:manifest.route_mode,networkAudit,getState:()=>({checked:stillChecked(),posture:posture(),finding_rule_ids:uniqueRuleIds(),packet:packet?JSON.parse(JSON.stringify(packet)):null,resting,release_authority:false,human_closure_required:true})});
})();
</script>
</body>
</html>`;
}

if (import.meta.url === `file://${process.argv[1]}`) process.stdout.write(renderLocalPocketHtml());
