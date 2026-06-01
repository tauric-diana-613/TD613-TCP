(function(){'use strict';
var V='pr119-safe-noop-2';
function boot(){
  if(!document.body||document.body.dataset.pageKind!=='adversarial-bench')return;
  document.body.dataset.pr119UserFacingUiPolish=V;
  var old=document.getElementById('hushPr119Style');
  if(old)old.remove();
  var s=document.createElement('style');
  s.id='hushPr119Style';
  s.textContent='.hush-output-chamber .hush-kicker,#protectedOutputHeading,.hush-output-card .hush-kicker,.hush-output-card .hush-card-kicker{margin-left:clamp(.75rem,2.5vw,2rem)!important}.hush-output-chamber .hush-card-head,.hush-output-card .hush-card-head{padding-left:clamp(.5rem,1.5vw,1.25rem)!important}';
  document.head.appendChild(s);
  window.TD613_HUSH_PR119={version:V,disabled:true,tick:function(){},copyReceipt:function(){return null}};
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
setTimeout(boot,500);
}());
