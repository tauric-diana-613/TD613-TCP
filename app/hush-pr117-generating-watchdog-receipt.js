(function(){'use strict';
var V='pr117-loader-safe-no-legacy-pr118';
function boot(){
  if(!document.body||document.body.dataset.pageKind!=='adversarial-bench')return;
  document.body.dataset.pr117GeneratingWatchdogReceipt=V;
  window.__TD613_HUSH_NO_FALLBACK_ACTIVE=false;
  window.__TD613_HUSH_PR118_DISABLED_BY_PR117=true;
  window.TD613_HUSH_PR117={version:V,disabled:true,legacyPr118Disabled:true,receipt:function(){return window.__TD613_HUSH_NO_FALLBACK_RECEIPT||null},force:function(){return null},arm:function(){return null},pulse:function(){return null}};
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();setTimeout(boot,500)}());