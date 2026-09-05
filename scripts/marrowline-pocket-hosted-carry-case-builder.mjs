import {
  LOCAL_POCKET_EXPORT_SCHEMA
} from '../app/dome-world/holonomy-loom-local-pocket-policy.js';
import {
  buildMarrowlinePocketHostedCarryCase,
  buildMarrowlineReturnEnvelope,
  revalidateMarrowlineReturn
} from '../app/dome-world/marrowline-pocket-hosted-carry-case.js';
import {
  compilePortableAiaLocalBinding,
  compilePortableAiaProjection
} from '../app/dome-world/portable-aia-three-route-invariance.js';

export const MARROWLINE_CARRY_CASE_ARTIFACT_SCHEMA = 'td613.marrowline.pocket-hosted-carry-case-artifact/v0.1';

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function escapeScriptJson(value) {
  return JSON.stringify(value).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
}

function buildSyntheticCarryCaseManifest() {
  const sourceProjection = compilePortableAiaProjection({ ruleId: 'EMAIL_IDENTIFIER', routeMode: 'LOCAL_POCKET' });
  const packet = Object.freeze({
    schema: LOCAL_POCKET_EXPORT_SCHEMA,
    portable_findings: Object.freeze([clone(sourceProjection.portable_payload)]),
    release_authority: false,
    human_closure_required: true
  });
  const carryCase = buildMarrowlinePocketHostedCarryCase(packet);
  const localBinding = compilePortableAiaLocalBinding(sourceProjection, {
    policyDigest: `sha256:${'a'.repeat(64)}`,
    sourceStateDigest: `sha256:${'b'.repeat(64)}`
  });
  const matchingEnvelope = buildMarrowlineReturnEnvelope(carryCase, {
    ruleId: 'EMAIL_IDENTIFIER',
    claimedActionClass: 'CHANGE'
  });
  const mismatchEnvelope = buildMarrowlineReturnEnvelope(carryCase, {
    ruleId: 'EMAIL_IDENTIFIER',
    claimedActionClass: 'REMOVE'
  });

  return Object.freeze({
    schema: MARROWLINE_CARRY_CASE_ARTIFACT_SCHEMA,
    source_packet: packet,
    carry_case: carryCase,
    matching_return: Object.freeze({
      envelope: matchingEnvelope,
      result: revalidateMarrowlineReturn(carryCase, localBinding, matchingEnvelope)
    }),
    mismatching_return: Object.freeze({
      envelope: mismatchEnvelope,
      result: revalidateMarrowlineReturn(carryCase, localBinding, mismatchEnvelope)
    }),
    authority: Object.freeze({
      release_authority: false,
      human_closure_required: true,
      provider_call_performed: false,
      production_mutation: false,
      deployment_authority: false
    })
  });
}

export function renderMarrowlineCarryCaseHtml() {
  const manifest = buildSyntheticCarryCaseManifest();
  const manifestJson = escapeScriptJson(manifest);
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light dark">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; connect-src 'none'; img-src data:; style-src 'unsafe-inline'; script-src 'unsafe-inline'; font-src 'none'; media-src 'none'; object-src 'none'; frame-src 'none'; worker-src 'none'; form-action 'none'; base-uri 'none'">
<title>Marrowline Carry Case · Pocket → TD613</title>
<style>
:root{font-family:ui-rounded,"SF Pro Rounded",Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#30283a;background:#fbf8ff;font-synthesis:none}*{box-sizing:border-box}body{margin:0;min-height:100vh;background:radial-gradient(circle at 12% 4%,#ffe4f3 0,transparent 27rem),radial-gradient(circle at 88% 8%,#dff1ff 0,transparent 26rem),linear-gradient(180deg,#fffaff,#f8fbff 58%,#fffaf2)}button{font:inherit}.case{width:min(64rem,calc(100% - 1rem));margin:auto;padding:1rem 0 2rem}.hero,.panel,.route,.controls{border:2px solid rgba(62,48,76,.16);box-shadow:0 12px 28px rgba(78,58,98,.08);background:rgba(255,255,255,.9)}.hero{display:grid;grid-template-columns:1fr auto;gap:1rem;padding:1.2rem;border-radius:1.6rem}.eyebrow{margin:0 0 .35rem;font-size:.74rem;font-weight:900;letter-spacing:.1em;text-transform:uppercase;color:#72578d}h1,h2,p{margin-top:0}h1{margin-bottom:.45rem;font-size:clamp(2rem,6vw,3.8rem);line-height:1;letter-spacing:-.04em}.lede{margin:0;max-width:45rem;font-size:1.08rem;line-height:1.5}.suitcase{align-self:center;width:5.4rem;height:5.4rem;border-radius:1.1rem;display:grid;place-items:center;background:linear-gradient(145deg,#fff0b8,#ffdbea 55%,#dbeaff);border:3px solid rgba(57,43,73,.2);font-size:2.5rem}.route{margin-top:1rem;padding:.9rem;border-radius:1.25rem;display:grid;grid-template-columns:repeat(4,1fr);gap:.55rem}.beat{min-height:5rem;padding:.7rem;border-radius:1rem;background:#f0eaf5;display:grid;place-items:center;text-align:center;font-weight:900}.beat[data-active="true"]{outline:3px solid #4b3a5c;background:#fff}.panel{margin-top:1rem;padding:1rem;border-radius:1.25rem}.plain{font-size:1.04rem;line-height:1.55}.machine{padding:.75rem;border-radius:1rem;background:#31283d;color:#fff;overflow-wrap:anywhere}.machine strong{display:block;margin-bottom:.35rem}.actions,.controls{display:flex;gap:.65rem;flex-wrap:wrap;margin-top:1rem}.actions button,.controls button{appearance:none;border:2px solid rgba(62,48,76,.2);border-radius:999px;padding:.72rem 1rem;background:#fff;color:inherit;font-weight:900;cursor:pointer}.actions .primary{background:#4b3a5c;color:#fff}.actions button[disabled],.controls button[disabled]{opacity:.42;cursor:not-allowed}.verdict{font-size:1.25rem;font-weight:950}.quiet{color:#6b6270;line-height:1.45}.controls{padding:.8rem;border-radius:1.2rem}[data-resting="true"] .panel,[data-resting="true"] .route{opacity:.72}@media(max-width:680px){.hero{grid-template-columns:1fr}.route{grid-template-columns:1fr}.beat{min-height:3.4rem}.actions,.controls{display:grid}.actions button,.controls button{width:100%}}@media(prefers-reduced-motion:reduce){*{scroll-behavior:auto!important;transition:none!important}}
</style>
</head>
<body>
<main class="case" data-carry-case data-resting="false">
<header class="hero"><div><p class="eyebrow">U+10D613 · Marrowline</p><h1>Carry Case</h1><p class="lede">This suitcase carries the governance packet, not your message. The message can move only through the separate human-controlled checked-text door.</p></div><div class="suitcase" aria-label="Marrowline Carry Case">🧳</div></header>
<section class="route" aria-label="Carry Case route">
<div class="beat" data-beat="PACKED" data-active="true">🧳 PACKED IN POCKET</div>
<div class="beat" data-beat="CHECKED" data-active="false">🚪 CHECKED AT MARROWLINE</div>
<div class="beat" data-beat="OPENED" data-active="false">🏠 OPENED IN TD613</div>
<div class="beat" data-beat="RETURN" data-active="false">𝄐 REST / RETURN</div>
</section>
<section class="panel"><h2>Two rooms, one policy</h2><p class="plain">Pocket and TD613 Hosted are different rooms. The same canonical finding keeps its policy meaning while its boundary changes. Coming home never trusts a return automatically; Pocket checks it against the local binding that never entered the suitcase. The human keeps the final key.</p><div class="machine" id="machine"><strong>PACKED</strong><span id="machineText">Canonical Pocket packet ready. No raw message is carried.</span></div></section>
<div class="actions"><button class="primary" id="checkCase">CHECK AT MARROWLINE</button><button id="openHosted" disabled>OPEN IN TD613</button><button id="returnMatch" disabled>RETURN MATCHING ACTION</button><button id="returnMismatch" disabled>TRY DIFFERENT ACTION</button></div>
<section class="panel"><h2>Return gate</h2><p class="verdict" id="verdict">No return yet.</p><p class="quiet" id="returnWhy">A return must come back through the local revalidation gate before it may be shown to a human.</p></section>
<div class="controls"><button id="rest">𝄐 NAP NOOK</button><button id="comeBack">COME BACK</button><button id="exit">FRONT DOOR · EXIT</button></div>
</main>
<script id="carryCaseManifest" type="application/json">${manifestJson}</script>
<script>
(() => {
'use strict';
const manifest=JSON.parse(document.querySelector('#carryCaseManifest').textContent);
const root=document.querySelector('[data-carry-case]');
const machine=document.querySelector('#machineText');
const verdict=document.querySelector('#verdict');
const returnWhy=document.querySelector('#returnWhy');
const checkCase=document.querySelector('#checkCase');
const openHosted=document.querySelector('#openHosted');
const returnMatch=document.querySelector('#returnMatch');
const returnMismatch=document.querySelector('#returnMismatch');
const rest=document.querySelector('#rest');
const comeBack=document.querySelector('#comeBack');
const exit=document.querySelector('#exit');
const networkAudit={attempts:0};
function blockedNetwork(){networkAudit.attempts+=1;throw new Error('TD613_MARROWLINE_CARRY_CASE_NETWORK_BLOCK')}
try{window.fetch=blockedNetwork}catch{}
try{XMLHttpRequest.prototype.open=blockedNetwork}catch{}
try{window.WebSocket=function(){return blockedNetwork()}}catch{}
try{window.EventSource=function(){return blockedNetwork()}}catch{}
try{navigator.sendBeacon=blockedNetwork}catch{}
let stage='PACKED';let returnStatus=null;let resting=false;let exited=false;
function activate(name){for(const beat of document.querySelectorAll('[data-beat]'))beat.dataset.active=String(beat.dataset.beat===name)}
function setStage(next){stage=next;activate(next)}
function setControls(){const closed=resting||exited;checkCase.disabled=closed||stage!=='PACKED';openHosted.disabled=closed||stage!=='CHECKED';returnMatch.disabled=closed||stage!=='OPENED';returnMismatch.disabled=closed||stage!=='OPENED'}
checkCase.addEventListener('click',()=>{if(resting||exited)return;setStage('CHECKED');machine.textContent=manifest.carry_case.receipt.source_boundary_token+' → '+manifest.carry_case.receipt.transport_action_token;openHosted.disabled=false;setControls()});
openHosted.addEventListener('click',()=>{if(resting||exited)return;setStage('OPENED');machine.textContent=manifest.carry_case.receipt.arrival_boundary_token+' · policy equivalent: '+manifest.carry_case.atlas.policy_equivalent+' · boundary distinguishable: '+manifest.carry_case.atlas.boundary_distinguishable;setControls()});
returnMatch.addEventListener('click',()=>{if(resting||exited)return;setStage('RETURN');returnStatus=manifest.matching_return.result.status;verdict.textContent=returnStatus;returnWhy.textContent='Canonical action matched. It remains advisory and is presented to the human rather than released automatically.';setControls()});
returnMismatch.addEventListener('click',()=>{if(resting||exited)return;setStage('RETURN');returnStatus=manifest.mismatching_return.result.status;verdict.textContent=returnStatus;returnWhy.textContent='The returned action differs from canonical Pocket policy, so the local gate holds it.';setControls()});
rest.addEventListener('click',()=>{if(exited)return;resting=true;root.dataset.resting='true';setControls()});
comeBack.addEventListener('click',()=>{if(exited)return;resting=false;root.dataset.resting='false';setControls()});
exit.addEventListener('click',()=>{exited=true;resting=false;root.dataset.resting='false';stage='EXITED';returnStatus=null;for(const beat of document.querySelectorAll('[data-beat]'))beat.dataset.active='false';machine.textContent='Carry Case closed. No provider call or production mutation occurred.';verdict.textContent='Exited.';returnWhy.textContent='The local demonstration is closed.';setControls()});
window.__TD613_MARROWLINE_CARRY_CASE__=Object.freeze({schema:manifest.schema,manifest,networkAudit,getState:()=>({stage,return_status:returnStatus,resting,exited,release_authority:false,human_closure_required:true,provider_call_performed:false,production_mutation:false,deployment_authority:false})});
setControls();
})();
</script>
</body>
</html>`;
}

if (import.meta.url === `file://${process.argv[1]}`) process.stdout.write(renderMarrowlineCarryCaseHtml());
