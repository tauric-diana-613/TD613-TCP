/**
 * Vixen public-language Playwright witness: user-visible routes, not raw JSON,
 * machine receipts, source archives, or research-engine identifiers.
 * Operates against the existing CI HTTP server at port 6130.
 */
import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const site='http://127.0.0.1:6130/encyclopedia/vix-cyb.html';
const routes=['overview','works','observatory','collection','reference','protocols','gates','holds','operator'];
const browser=await chromium.launch({headless:true});
try{
 for(const viewport of [{width:1440,height:900},{width:390,height:844}]){
  const context=await browser.newContext({viewport,reducedMotion:'reduce'});
  const page=await context.newPage();
  const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  const response=await page.goto(site,{waitUntil:'domcontentloaded',timeout:30000});
  assert.equal(response.status(),200);
  await page.waitForFunction(()=>document.body.dataset.vixenPublicCopyMounted==='true',null,{timeout:15000});
  await page.waitForFunction(()=>!!window.VIXEN_FOX_HOUSE?.mounted,null,{timeout:15000});
  for(const route of routes){
   await page.locator('#vixenRoomRail button[data-view="'+route+'"]').click({timeout:10000});
   await page.waitForFunction(key=>document.body.dataset.view===key,route,{timeout:10000});
   await page.waitForTimeout(110);
   const leakage=await page.evaluate(()=>{
    const banned=/\b(?:Wendbine|SignalRupture|EMSTD613|SRC|Atelier|FADT|TD613|Emergence\s+HQ|Experiment\s+[ABC])\b/g; // Preserve the public constitutional role names.
    const text=document.body.innerText;
    const visibleText=[...text.matchAll(banned)].slice(0,18).map(m=>({
      term:m[0],excerpt:text.slice(Math.max(0,m.index-50),m.index+70)
    }));
    const attrs=[];
    for(const el of document.querySelectorAll('[aria-label],[aria-description],[title],[placeholder],[alt]')){
      if(el.closest('[data-vixen-machine-only], [data-machine-receipt], [data-vixen-source-provenance], .vs-work-title, .vxe-document, .vix-reader-raw, .vix-fusion-machine-preview'))continue;
      if(el.closest('[hidden]'))continue;
      if(!el.getClientRects().length)continue;
      for(const name of ['aria-label','aria-description','title','placeholder','alt']){
       const value=el.getAttribute(name)||'';
       if(banned.test(value))attrs.push({tag:el.tagName,attribute:name,value:value.slice(0,200)});
       banned.lastIndex=0;
      }
    }
    return {visibleText,attrs,mounted:document.body.dataset.vixenPublicCopyMounted};
   });
   assert.match(await page.locator('#view-overview').innerText(),/OPERAHOUSE|OPERA|PERFORMER/,
     'Canonical role terminology remains legible in the source-labelled Opera');
   assert.deepEqual(leakage.visibleText,[],
     'Vixen visible text exposes private research nomenclature in '+route+' '+viewport.width+': '+JSON.stringify(leakage));
   assert.deepEqual(leakage.attrs,[],
     'Vixen accessible labels expose private nomenclature in '+route+' '+viewport.width+': '+JSON.stringify(leakage));
  }
  assert.equal(errors.length,0,'Browser should not error while normalizing public terminology: '+errors.join(' | '));
  const original=await page.evaluate(()=>document.getElementById('vixen-corpus-bundle')?.textContent||'');
  assert.match(original,/"atelier_id":"EMSTD613"/,
    'machine source identity must remain unchanged even though UI is normalized');
  await context.close();
 }
}finally{await browser.close()}
console.log('Public Vixen language boundary browser witness passed on all nine routes at 1440px and 390px.');
