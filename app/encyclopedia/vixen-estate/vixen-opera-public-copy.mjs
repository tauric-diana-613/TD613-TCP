/**
 * Vixen Opera public-language boundary.
 * Publicly rendered text and accessible labels are interpretive presentations.
 * Source files, manuscript bytes, identities, machine receipts, model inputs,
 * search indices, task payloads, scientific scores, and authorship stay unchanged.
 * The internal names in THIS FILE are deliberately confined to machine code.
 */
const GOVERNANCE_RIBBON=/\b(?:EXPERIMENT[_ -]?[ABC](?:[_ -]?(?:PREVIEW|AUTHORIZED))?|PREVIEW[_ -]?AUTHORIZED|FULL[_ -]?COMPANION[_ -]?MANUSCRIPT[_ -]?AVAILABLE|PRODUCTION[_ -]?REQUIRES[_ -]?OPERATOR[_ -]?SECRET|OPERATOR[_ -]?SECRET|OPERATOR[_ -]?ONLY|EMERGENCE\s+HQ|LAB[_ -]?NOTES?|DEBUG[_ -]?(?:STATE|MODE)|ADJUDICATION[_ -]?RIBBON)\b/i;
const PRIVATE_BRANDING=/\b(?:ChatGPT|Gemini|Antigravity|Codex|Amari|Paul)\b/i;
const REMOVABLE_PUBLIC_FURNITURE='.tag,.badge,.eyebrow,.expa-aperture-bar,.stage-watermark,[class*="watermark"],[class*="release-state"],[class*="lab-ribbon"]';
const PUBLIC_TERMS=Object.freeze([
  // Public stage and screen-reader copy never expose internal experiment,
  // operator-host, or historical engineering aliases. Machine and original
  // manuscript bytes are protected below, including original citations.
  [/\bEXPERIMENT_A_PREVIEW_AUTHORIZED\b/gi,''],
  [/\bEXPERIMENT_A_METADATA_ONLY_BINARY_PENDING_UPLOAD\b/gi,''],
  [/\bExperiment[- ]A\b/gi,'research preview'],
  [/\bExperiment[- ]B\b/gi,'prospective comparison'],
  [/\bExperiment[- ]C\b/gi,'future publication review'],
  [/\bEmergence\s+HQ\b/gi,'internal research office'],
  [/\bPaul['’]s\b/gi,"the outside researcher's"],
  [/\bPaul\b/g,'outside researcher'],
  [/\bAIX\b/gi,'AI research conductor'],
  [/\b(?:LAB_RC-\d{2}|LAB_TCC-\d{2})\b/g,'source-scoped instrument'],
  [/\bEMSTD613\s+Atelier\b/gi,'Vixen manuscript research'],
  [/\bSRC\s+Atelier\b/gi,'documentary evidence research'],
  [/\bWendbine\s+Atelier\b/gi,'external-source research'],
  [/\bCross[- ]Atelier\b/gi,'cross-study'],
  [/\bResearch\s+Atelier\b/gi,'research workspace'],
  [/\bSignalRupture\b/gi,'documentary evidence study'],
  [/\bWendbine\b/gi,'external-source research'],
  [/\bEMSTD613\b/gi,'Vixen manuscript collection'],
  [/\bSRC\b/g,'documentary source-route analysis'],
  [/\bFADT\b/gi,'finite evidence classification'],
  [/\bAteliers\b/gi,'research workspaces'],
  [/\bAtelier\b/gi,'research workspace'],
  [/\bTD613-TCP\b/g,'the hosting archive'],
  [/\bTD613\b/g,'the research host'],
  [/\b(?:ChatGPT|Gemini|Antigravity|Codex|Amari)\b/gi,''],
  // The constitutional roles are public terms of art. Never erase their identity.
]);
const NONPRESENTATION=new Set(['SCRIPT','STYLE','TEMPLATE','NOSCRIPT','TEXTAREA','INPUT']);
export const PUBLIC_COPY_VERSION='vixen-public-copy/v1';
export function translatePublicCopy(value){
  if(typeof value!=='string')return value;
  let output=value;
  for(const [rx,translation] of PUBLIC_TERMS)output=output.replace(rx,translation);
  return output;
}
function protectedSource(node){
  const parent=node?.nodeType===1?node:node?.parentElement;
  if(!parent||parent.closest('script,style,template,noscript,textarea,input'))return true;
  // Exact source, transfer and machine receipts continue to be retrievable
  // without rewriting provenance or falsifying the underlying source bytes.
  return Boolean(parent.closest(
    '[data-vixen-machine-only], [data-machine-receipt], [data-vixen-source-provenance], .vs-work-title, .vxe-document, .vix-reader-raw, .vix-fusion-machine-preview, .vix-manuscript, .expa-body-pre, .vix-reader-code'
  ));
}
function rewriteNode(node){
  if(!node||protectedSource(node))return;
  if(node.nodeType===3){
    if(!node.nodeValue)return;
    const next=translatePublicCopy(node.nodeValue);
    if(next!==node.nodeValue)node.nodeValue=next;
    return;
  }
  if(node.nodeType!==1)return;
  const el=node;
  if(NONPRESENTATION.has(el.tagName))return;
  // A release ribbon, watermark or control-plane badge has no legitimate
  // visitor-facing editorial role. Remove the element, rather than relabel it.
  if(el.matches(REMOVABLE_PUBLIC_FURNITURE) &&
    (GOVERNANCE_RIBBON.test(el.textContent||'') || PRIVATE_BRANDING.test(el.textContent||''))) {
    el.remove();
    return;
  }
  // Metadata code tokens used as standalone screen furniture are likewise
  // absent from the Opera; source manuscript and machine receipts are protected.
  if(el.matches('code') && GOVERNANCE_RIBBON.test(el.textContent||'')) {
    el.remove();
    return;
  }
  // Attributes used by screen readers and human hints count as public copy.
  for(const key of ['aria-label','aria-description','title','alt','placeholder']){
    if(!el.hasAttribute(key))continue;
    const prior=el.getAttribute(key);
    const next=translatePublicCopy(prior);
    if(prior!==next)el.setAttribute(key,next);
  }
  for(let child=el.firstChild;child;){
    const next=child.nextSibling;
    rewriteNode(child);
    child=next;
  }
}
export function installVixenPublicCopy(root=document.body){
  if(!root)throw Error('VIXEN_PUBLIC_COPY_ROOT_REQUIRED');
  rewriteNode(root);
  const pending=new Set();
  let queued=false;
  const flush=()=>{
    queued=false;
    const batch=[...pending];pending.clear();
    for(const item of batch)rewriteNode(item);
  };
  const DOMObserver=root.ownerDocument?.defaultView?.MutationObserver || globalThis.MutationObserver;
  if(typeof DOMObserver!=='function')throw Error('VIXEN_PUBLIC_COPY_OBSERVER_REQUIRED');
  const observer=new DOMObserver(records=>{
    for(const r of records){
      if(r.type==='characterData')pending.add(r.target);
      if(r.type==='attributes')pending.add(r.target);
      if(r.type==='childList')for(const item of r.addedNodes)pending.add(item);
    }
    if(!queued&&pending.size){queued=true;queueMicrotask(flush)}
  });
  observer.observe(root,{subtree:true,childList:true,characterData:true,attributes:true,
    attributeFilter:['aria-label','aria-description','title','alt','placeholder']});
  return Object.freeze({version:PUBLIC_COPY_VERSION,refresh:()=>rewriteNode(root),
    disconnect:()=>observer.disconnect()});
}
if(typeof document!=='undefined'){
  const boot=()=>{const root=document.body;
    if(root&&!root.dataset.vixenPublicCopyMounted){
      root.dataset.vixenPublicCopyMounted='true';
      installVixenPublicCopy(root);
    }
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
}
