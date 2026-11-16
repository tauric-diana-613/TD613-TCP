/**
 * RGI23 · Exact Native Visual Review enclosure.
 * Small standalone HTML shell; before and after iframes reference separate
 * source-bound, verified NATIVE renderer captures, never generated storyboards.
 * No HTML is emitted where those captures are missing; visual change held.
 * No source, renderer, corpus, review, or release authority follows from view.
 */
export const NATIVE_DIFF_SCHEMA='td613.vixen.composer.native-visual-diff/v1';
const SHA=/^[a-f0-9]{64}$/;
const is=o=>o!==null&&typeof o==='object'&&!Array.isArray(o);
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const deny=(reason)=>Object.freeze({schema:NATIVE_DIFF_SCHEMA,status:'HELD',reason,
  html:null,release_authority:false,canonical_writes:0});
/** Paths must reference audited same-origin files, not arbitrary remote URLs. */
function nativeAsset(x,digest){
 if(!is(x)||x.capture_kind!=='NATIVE_SAME_BUILD_INTERACTIVE_SCENE'||
  x.source_revision!==digest.source_revision||
  !SHA.test(x.renderer_sha256||'')||!SHA.test(x.styles_sha256||'')||
  !SHA.test(x.capture_receipt_sha256||'')||
  x.runtime_interactive!==true||x.displayed_pixels_verified!==true||
  typeof x.href!=='string'||
  !/^\.\/review-renders\/[a-zA-Z0-9_-]{1,80}\/[a-zA-Z0-9_-]{1,80}\.html$/.test(x.href))
  return null;
 return {href:x.href,renderer_sha256:x.renderer_sha256,
   styles_sha256:x.styles_sha256,capture_receipt_sha256:x.capture_receipt_sha256};
}
export function buildNativeVisualDiff(packet,captures=[]){
 if(packet?.schema!=='td613.vixen.podium.redpen-review/v1'||!SHA.test(packet.score_sha256||''))
  return deny('HELD_SCORE_REDPEN_PACKET_REQUIRED');
 if(packet.visual_review_required!==true)
  return Object.freeze({schema:NATIVE_DIFF_SCHEMA,status:'NOT_REQUIRED',html:null,
   reason:'NO_PROPOSED_VISUAL_SUBSTITUTIONS',release_authority:false});
 if(!Array.isArray(captures)||!captures.length||captures.length>24)
  return deny('HELD_NATIVE_BEFORE_AND_AFTER_CAPTURES_REQUIRED');
 const seen=new Set(),rows=[];
 for(const pair of captures){
  const d=packet.decisions.find(x=>x.decision_id===pair?.change_id);
  if(!d||seen.has(pair.change_id)||!is(pair.before)||!is(pair.after)||
   !/^(OBSERVATORY|SALON|VISUAL_ARTIFACT_CHANGE|ALTERNATIVE_VISUAL_FORM|SALON_COUTURE)$/.test(d.area))
   return deny('HELD_MISSING_OR_MISLABELED_VISUAL_CHANGE');
  seen.add(pair.change_id);
  const baseline=nativeAsset(pair.before,packet),candidate=nativeAsset(pair.after,packet);
  if(!baseline||!candidate)
   return deny('HELD_NATIVE_RENDERER_OR_CSS_PIXEL_FIDELITY_UNVERIFIED');
  if(!pair.previous_form_id||!pair.proposed_form_id||
   pair.previous_form_id===pair.proposed_form_id||!pair.target_lab_id)
   return deny('HELD_PREDECESSOR_AND_REPLACEMENT_IDENTITIES_REQUIRED');
  rows.push({...pair,baseline,candidate});
 }
 // The review cannot silently omit a visual edit, or sneak in an unscored edit.
 const required=packet.decisions.filter(x=>x.area==='VISUAL_ARTIFACT_CHANGE').map(x=>x.decision_id);
 if(required.some(id=>!seen.has(id)))return deny('HELD_UNDISPLAYED_VISUAL_CHANGE');
 // Current computational Score selects one open-form candidate (if any).
 if(!rows.some(x=>x.proposed_form_id===packet.scoring?.visual_selected?.id))
  return deny('HELD_SELECTED_RENDERER_NOT_REPRESENTED');
 const cards=rows.map((x,i)=>'<section class="pair"><header><strong>'+esc(x.change_id)+
  ' · '+esc(x.target_lab_id)+'</strong><small>Exact native captures · scene '+(i+1)+'/'+rows.length+
  '</small></header><div class="scenes"><article><h2>Outgoing · demoted / displaced</h2>'+
  '<p>'+esc(x.previous_form_id)+'</p><iframe loading="lazy" sandbox="allow-scripts allow-same-origin" title="Outgoing native exhibit" src="'+
  esc(x.baseline.href)+'"></iframe><small>Renderer SHA-256 '+esc(x.baseline.renderer_sha256)+'</small></article>'+
  '<article><h2>Incoming · proposed replacement</h2><p>'+esc(x.proposed_form_id)+'</p>'+
  '<iframe loading="lazy" sandbox="allow-scripts allow-same-origin" title="Proposed native exhibit" src="'+
  esc(x.candidate.href)+'"></iframe><small>Renderer SHA-256 '+esc(x.candidate.renderer_sha256)+'</small></article></div>'+
  '<label>Composer annotations<textarea data-change-id="'+esc(x.change_id)+
  '" placeholder="Keep the original, amend the replacement, request another form, or approve. This is a review note, not an authorization."></textarea></label></section>').join('');
 const html='<!doctype html><html lang="en"><head><meta charset="utf-8">'+
 '<meta name="viewport" content="width=device-width,initial-scale=1">'+
 '<meta http-equiv="Content-Security-Policy" content="default-src &#39;none&#39;; frame-src &#39;self&#39;; style-src &#39;unsafe-inline&#39;; base-uri &#39;none&#39;; form-action &#39;none&#39;">'+
 '<title>Vixen Composer · exact-native demotion and replacement review</title>'+
 '<style>*{box-sizing:border-box}body{margin:0;background:#10151b;color:#f9f3ed;font:14px/1.48 system-ui,sans-serif}main{max-width:1160px;margin:auto;padding:clamp(12px,3vw,28px)}'+
 'h1{font:400 clamp(22px,4vw,38px)/1.1 Georgia,serif}h2{font-size:14px}small{color:#c2cdd7}p{color:#ced3dc}.pair{border-top:1px solid #42505c;padding:16px 0 23px}'+
 'header{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap}.scenes{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,380px),1fr));gap:16px}'+
 'article{border:1px solid #465461;border-radius:9px;padding:10px;min-width:0}iframe{display:block;width:100%;height:380px;border:0;background:#111d27}'+
 'textarea{margin-top:6px;width:100%;min-height:72px;background:#1c2732;color:#fff2d6;border:1px solid #798694;border-radius:5px;padding:9px;font:inherit}label{display:block;margin-top:12px}'+
 'footer{border-top:1px solid #465461;margin-top:16px;padding:16px 0}</style></head><body><main>'+
 '<p>𝌋 VIXEN · COMPOSER SCORE · SOURCE-BOUND REVIEW ⟐</p>'+
 '<h1>What leaves the Observatory · what enters</h1>'+
 '<p>Exact score '+esc(packet.score_sha256)+' · native source '+esc(packet.source_revision)+
 '. The outgoing exhibits remain reviewable. Approvals, denials, amendments and alternatives return through the separately authenticated Score process. This review page executes no release or corpus change.</p>'+
 cards+'<footer>Human closure RESERVED · HTML viewer only · No automatic Compose · ⟐</footer>'+
 '</main></body></html>';
 return Object.freeze({schema:NATIVE_DIFF_SCHEMA,status:'READY_FOR_OPERATOR_VISUAL_REVIEW',
  html,bytes:new TextEncoder().encode(html).length,
  exact_native_captures:rows.length,original_exhibits_preserved:true,
  no_schematic_substitution:true,release_authority:false,canonical_writes:0,
  note:'Referenced native snapshots must ship beside this small HTML file; standalone from the bundle, not a single self-contained file.'});
}
