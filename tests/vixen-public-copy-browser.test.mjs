/**
 * Vixen public-language Playwright witness: user-visible routes, not raw JSON,
 * machine receipts, source archives, or research-engine identifiers.
 * Operates against the existing CI HTTP server at port 6130.
 */
import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const site='http://127.0.0.1:6130/encyclopedia/vix-cyb.html';
const routes=['overview','works','observatory','collection','reference','protocols','gates','holds'];
const browser=await chromium.launch({headless:true});
const checkSurfaceLeakage=async(page,label,width)=>{
 const leakage=await page.evaluate(()=>{
  const banned=/\b(?:The Empty Operahouse\b|The Seam Allowance\b|Wendbine\b|SignalRupture\b|EMSTD613\b|SRC\b|Atelier\b|FADT\b|TD613\b(?!\s+Encyclopedia\b))/g; // Preserve RP-46 TD613 Encyclopedia link and public constitutional role names.
  const visibleText=[];
  const sourceBoundary='script,style,template,noscript,[hidden],[data-vixen-machine-only],[data-machine-receipt],[data-vixen-source-provenance],.vs-work-title,.vxe-document,.vix-reader-raw,.vix-fusion-machine-preview,.vix-manuscript,.expa-body-pre,.vix-reader-code';
  const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
  while(walker.nextNode() && visibleText.length<18){
    const node=walker.currentNode,el=node.parentElement;
    if(!el||el.closest(sourceBoundary)||!el.getClientRects().length)continue;
    const css=getComputedStyle(el);
    if(css.display==='none'||css.visibility==='hidden')continue;
    const text=node.nodeValue||'';
    banned.lastIndex=0;
    for(const m of text.matchAll(banned)){
      visibleText.push({term:m[0],excerpt:text.slice(Math.max(0,m.index-50),m.index+70)});
      if(visibleText.length>=18)break;
    }
  }
  const attrs=[];
  for(const el of document.querySelectorAll('[aria-label],[aria-description],[title],[placeholder],[alt]')){
    if(el.closest(sourceBoundary))continue;
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
 assert.deepEqual(leakage.visibleText,[],
   'Vixen visible text exposes private research nomenclature in '+label+' '+width+': '+JSON.stringify(leakage));
 assert.deepEqual(leakage.attrs,[],
   'Vixen accessible labels expose private nomenclature in '+label+' '+width+': '+JSON.stringify(leakage));
};
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
   assert.match(await page.locator('#view-overview').innerText(),/OPERAHOUSE|OPERA|PERFORMER/,
     'Canonical role terminology remains legible in the source-labelled Opera');
   await checkSurfaceLeakage(page,route,viewport.width);
  }
  const original=await page.evaluate(()=>document.getElementById('vixen-corpus-bundle')?.textContent||'');
  assert.match(original,/"atelier_id":"EMSTD613"/,
    'machine source identity must remain unchanged even though UI is normalized');
  for(const subUrl of ['http://127.0.0.1:6130/encyclopedia/vix-cyb/podium.html','http://127.0.0.1:6130/encyclopedia/vix-cyb/human-podium.html']){
   const r=await page.goto(subUrl,{waitUntil:'domcontentloaded',timeout:30000});
   assert.equal(r.status(),200);
   if(subUrl.endsWith('human-podium.html')){
    await page.waitForFunction(()=>window.VixenAIModes?.mounted===true&&document.body.dataset.vixenPublicCopyMounted==='true',null,{timeout:20000});
   }else{
    await page.waitForTimeout(120);
   }
   await checkSurfaceLeakage(page,subUrl,viewport.width);
  }
  assert.equal(errors.length,0,'Browser should not error while normalizing public terminology: '+errors.join(' | '));
  await context.close();
 }
}finally{await browser.close()}
console.log('Public Vixen language boundary browser witness passed on all eight routes plus standalone Podium destinations at 1440px and 390px.');
