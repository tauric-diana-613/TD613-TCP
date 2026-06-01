(function(){'use strict';
var V='pr119-safe-noop';
function boot(){
  if(!document.body||document.body.dataset.pageKind!=='adversarial-bench')return;
  document.body.dataset.pr119UserFacingUiPolish=V;
  var old=document.getElementById('hushPr119Style');
  if(old)old.remove();
  var s=document.createElement('style');
  s.id='hushPr119Style';
  s.textContent='.hush-output-chamber .hush-kicker,#protectedOutputHeading,.hush-output-card .hush-kicker,.hush-output-card .hush-card-kicker{margin-left:clamp(2rem,6vw,4.75rem)!important}.hush-output-chamber .hush-card-head,.hush-output-card .hush-card-head{padding-left:clamp(1rem,3vw,2.5rem)!important}';
  document.head.appendChild(s);
  window.TD613_HUSH_PR119={version:V,disabled:true,tick:function(){},copyReceipt:function(){return null}};
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
setTimeout(boot,500);
}());
