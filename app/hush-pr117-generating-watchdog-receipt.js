(function(){'use strict';
var V='pr117-diagnostic-receipt-popup/v2-display-only';
function $(id){return document.getElementById(id)}
function esc(value){return String(value==null?'':value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;')}
function preview(value,limit){var raw=typeof value==='string'?value:JSON.stringify(value||{},null,2);if(!raw)return 'unavailable';return raw.length>(limit||360)?raw.slice(0,limit||360)+'…':raw}
function installStyle(){
  if($('hushPr117ReceiptStyle'))return;
  var style=document.createElement('style');
  style.id='hushPr117ReceiptStyle';
  style.textContent='body[data-page-kind="adversarial-bench"] .hush-pr117-receipt-backdrop{position:fixed;inset:0;z-index:99999;display:grid;place-items:center;padding:1rem;background:rgba(0,0,0,.54);backdrop-filter:blur(10px)}body[data-page-kind="adversarial-bench"] .hush-pr117-receipt-card{width:min(42rem,94vw);max-height:min(82dvh,44rem);overflow:auto;-webkit-overflow-scrolling:touch;border:1px solid rgba(255,184,107,.42);border-left:3px solid rgba(255,184,107,.92);border-radius:16px;background:linear-gradient(145deg,rgba(5,9,20,.96),rgba(18,8,28,.94));box-shadow:0 22px 70px rgba(0,0,0,.48),0 0 28px rgba(255,184,107,.12);color:#f1fff6;padding:1rem}body[data-page-kind="adversarial-bench"] .hush-pr117-receipt-head{display:flex;justify-content:space-between;gap:.8rem;align-items:flex-start;margin-bottom:.7rem}body[data-page-kind="adversarial-bench"] .hush-pr117-receipt-head span{display:block;color:#ffcb8a;font-size:.56rem;letter-spacing:.18em;text-transform:uppercase}body[data-page-kind="adversarial-bench"] .hush-pr117-receipt-head strong{display:block;margin-top:.14rem;font-size:.86rem;letter-spacing:.11em;text-transform:uppercase}body[data-page-kind="adversarial-bench"] .hush-pr117-close{border:1px solid rgba(137,255,240,.24);border-radius:999px;background:rgba(5,9,20,.74);color:#f1fff6;padding:.36rem .7rem;font-size:.58rem;font-weight:900;letter-spacing:.12em;text-transform:uppercase}body[data-page-kind="adversarial-bench"] .hush-pr117-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.42rem;margin:.7rem 0}body[data-page-kind="adversarial-bench"] .hush-pr117-cell{border:1px solid rgba(137,255,240,.16);border-radius:12px;background:rgba(0,0,0,.26);padding:.48rem .52rem}body[data-page-kind="adversarial-bench"] .hush-pr117-cell span{display:block;color:rgba(202,255,223,.58);font-size:.48rem;letter-spacing:.12em;text-transform:uppercase}body[data-page-kind="adversarial-bench"] .hush-pr117-cell strong{display:block;margin-top:.16rem;font-size:.64rem;line-height:1.2;overflow-wrap:anywhere}body[data-page-kind="adversarial-bench"] .hush-pr117-pre{margin:.62rem 0 0;white-space:pre-wrap;overflow-wrap:anywhere;border:1px solid rgba(137,255,240,.14);border-radius:12px;background:rgba(0,0,0,.30);padding:.62rem;color:rgba(226,255,236,.82);font:600 .58rem/1.35 ui-monospace,SFMono-Regular,Menlo,monospace}body[data-page-kind="adversarial-bench"] .hush-pr117-actions{display:flex;gap:.5rem;flex-wrap:wrap;margin-top:.72rem}body[data-page-kind="adversarial-bench"] .hush-pr117-actions button{border:1px solid rgba(137,255,240,.22);border-radius:999px;background:rgba(5,9,20,.78);color:#f1fff6;padding:.46rem .72rem;font-size:.56rem;font-weight:900;letter-spacing:.12em;text-transform:uppercase}@media(max-width:760px){body[data-page-kind="adversarial-bench"] .hush-pr117-grid{grid-template-columns:1fr}body[data-page-kind="adversarial-bench"] .hush-pr117-receipt-card{max-height:78dvh;padding:.86rem}}';
  document.head.appendChild(style);
}
function receipt(){return window.__TD613_HUSH_NO_FALLBACK_RECEIPT||window.__TD613_HUSH_PR123_LAST||null}
function normalize(data){
  var payload=data&&data.payload?data.payload:data||{};
  var meta=data&&data.meta?data.meta:{};
  return {
    status:data&&data.status||payload.status||payload.ok===false?'held':'diagnostic',
    reason:data&&data.reason||payload.reason||payload.error||payload.message||meta.reason||'provider diagnostic receipt',
    endpoint:data&&data.endpoint||payload.endpoint||meta.endpoint||data&&data.endpoint||'unknown',
    httpStatus:data&&data.httpStatus||payload.httpStatus||meta.httpStatus||'n/a',
    fallbackReleased:data&&data.fallbackReleased===true?'yes':'no',
    raw:data
  };
}
function render(data){
  installStyle();
  var normalized=normalize(data||receipt()||{});
  var existing=$('hushPr117ReceiptBackdrop');
  if(existing)existing.remove();
  var backdrop=document.createElement('div');
  backdrop.id='hushPr117ReceiptBackdrop';
  backdrop.className='hush-pr117-receipt-backdrop';
  backdrop.innerHTML='<section class="hush-pr117-receipt-card" role="dialog" aria-modal="true" aria-label="Hush diagnostic receipt"><div class="hush-pr117-receipt-head"><div><span>No-Fallback Receipt</span><strong>Provider diagnostic hold</strong></div><button type="button" class="hush-pr117-close" data-hush-pr117-close>Close</button></div><div class="hush-pr117-grid"><article class="hush-pr117-cell"><span>Status</span><strong>'+esc(normalized.status)+'</strong></article><article class="hush-pr117-cell"><span>HTTP</span><strong>'+esc(normalized.httpStatus)+'</strong></article><article class="hush-pr117-cell"><span>Endpoint</span><strong>'+esc(normalized.endpoint)+'</strong></article><article class="hush-pr117-cell"><span>Fallback released</span><strong>'+esc(normalized.fallbackReleased)+'</strong></article></div><div class="hush-pr117-cell"><span>Reason</span><strong>'+esc(normalized.reason)+'</strong></div><pre class="hush-pr117-pre">'+esc(preview(normalized.raw,1800))+'</pre><div class="hush-pr117-actions"><button type="button" data-hush-pr117-copy>Copy receipt JSON</button><button type="button" data-hush-pr117-close>Close</button></div></section>';
  document.body.appendChild(backdrop);
  backdrop.addEventListener('click',function(event){
    if(event.target===backdrop||event.target.closest('[data-hush-pr117-close]'))backdrop.remove();
    if(event.target.closest('[data-hush-pr117-copy]')){
      try{navigator.clipboard.writeText(JSON.stringify(normalized.raw||{},null,2));event.target.textContent='Copied';}catch(_){event.target.textContent='Copy failed'}
    }
  });
  return normalized;
}
function force(data){return render(data||receipt()||{status:'diagnostic',reason:'No receipt object found yet.'})}
function boot(){
  if(!document.body||document.body.dataset.pageKind!=='adversarial-bench')return;
  document.body.dataset.pr117GeneratingWatchdogReceipt=V;
  installStyle();
  window.TD613_HUSH_PR117={version:V,disabled:false,receipt:receipt,force:force,arm:function(){return receipt()},pulse:function(){return receipt()}};
  window.addEventListener('td613:hush:no-fallback-receipt',function(event){force(event.detail&&event.detail.receipt?event.detail.receipt:event.detail)});
  window.addEventListener('td613:hush:provider-held',function(event){force(event.detail&&event.detail.receipt?event.detail.receipt:event.detail)});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();setTimeout(boot,500);setTimeout(boot,1500);
}());