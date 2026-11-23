/**
 * Exact old-source/new-source browser comparison for the Vixen Opera red pen.
 * Baseline is the immutable PR #1730 HEAD at commission intake, fetched from
 * Git history; current is this repair HEAD. Screen captures and JSON preserve
 * both observed states. Chromium emulation is not an actual iPhone witness.
 */
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {execFileSync,spawnSync} from 'node:child_process';
import {writeFile,readFile,mkdir,unlink} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';

const BASE='7500e294003e8a5effa52921c8d4b7eba673be9d';
const current=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
const origin='http://127.0.0.1:6130/encyclopedia/';
const root=path.resolve('artifacts/vixen-opera-redpen');
const app=path.resolve('app/encyclopedia');
const snapshots=[
 ['vix-cyb.html','__vixen-opera-before-rgi27.html'],
 ['vixen-estate/vixen-mobile-reading-rgi17.css','vixen-estate/__vixen-before-rgi17.css'],
 ['vixen-estate/vixen-obsidian-reading-rgi26.css','vixen-estate/__vixen-before-rgi26.css'],
 ['vixen-estate/vixen-opera-public-copy.mjs','vixen-estate/__vixen-before-public-copy.mjs']
];
const written=[];
const screens=[];
const errors=[];
await mkdir(root,{recursive:true});

function gitSource(file){
 try{return execFileSync('git',['show',BASE+':app/encyclopedia/'+file],{encoding:'utf8',maxBuffer:12*1024*1024})}
 catch(first){
  const fetch=spawnSync('git',['fetch','--depth=1','origin',BASE],{encoding:'utf8',timeout:90000});
  if(fetch.status!==0)throw new Error('BASELINE_SOURCE_UNAVAILABLE '+file+' '+String(fetch.stderr||first.message).slice(0,200));
  return execFileSync('git',['show',BASE+':app/encyclopedia/'+file],{encoding:'utf8',maxBuffer:12*1024*1024});
 }
}
for(const [source,destination] of snapshots){
 let text=gitSource(source);
 if(source==='vix-cyb.html'){
  for(const [from,to] of [
   ['vixen-mobile-reading-rgi17.css','__vixen-before-rgi17.css'],
   ['vixen-obsidian-reading-rgi26.css','__vixen-before-rgi26.css'],
   ['vixen-opera-public-copy.mjs','__vixen-before-public-copy.mjs']
  ]) {
   assert.ok(text.includes(from),'baseline asset '+from);
   text=text.replace(from,to);
  }
 }
 const dest=path.join(app,destination);
 written.push(dest);
 await writeFile(dest,text,'utf8');
}

const profiles=[
 {id:'mobile-390x844',width:390,height:844,isMobile:true},
 {id:'mobile-428x926',width:428,height:926,isMobile:true},
 {id:'desktop-1440x900',width:1440,height:900,isMobile:false}
];
const browser=await chromium.launch({headless:true});
async function visit(profile,phase){
 const context=await browser.newContext({
  viewport:{width:profile.width,height:profile.height},
  deviceScaleFactor:profile.isMobile?3:1,
  isMobile:profile.isMobile,hasTouch:profile.isMobile,reducedMotion:'reduce'
 });
 const page=await context.newPage();const pageErrors=[];
 page.on('pageerror',e=>pageErrors.push(String(e.message)));
 // Preserve the page's canonical URL in both observations. Old scripts
 // sometimes rely on document route identity; only the body bytes differ.
 if(phase==='before'){
  const baseline=await readFile(path.join(app,'__vixen-opera-before-rgi27.html'),'utf8');
  await page.route('**/encyclopedia/vix-cyb.html',route=>route.fulfill({
   status:200,contentType:'text/html; charset=utf-8',body:baseline
  }));
 }
 const url=origin+'vix-cyb.html';
 const response=await page.goto(url,{waitUntil:'domcontentloaded',timeout:40000});
 assert.equal(response?.status(),200,'HTTP source '+phase);
 // Static DOM arrival precedes source-bound event binding. Wait for the
 // foyer's established readiness contract before invoking a real navigation.
 await page.waitForFunction(()=>window.VIXEN_FOYER?.mounted===true,null,{timeout:25000,polling:250});
 await page.waitForFunction(()=>window.VIXEN_FOX_HOUSE?.mounted===true,null,{timeout:25000,polling:250});
 await page.locator('#vixenRoomRail button[data-view="works"]').waitFor({state:'attached',timeout:25000});
 await page.locator('#vixenRoomRail button[data-view="works"]').click({timeout:15000});
 try {await page.waitForFunction(()=>document.body.dataset.view==='works',null,{timeout:15000});}
 catch(error){
  const diag=await page.evaluate(()=>({
   view:document.body.dataset.view,
   worksHidden:document.querySelector('#view-works')?.hidden,
   mainNav:document.querySelector('#vixenRoomRail button[data-view="works"]')?.outerHTML,
   foyerReady:window.VIXEN_FOYER?.mounted,
   appReady:document.readyState,hash:location.hash
  }));
  throw new Error('WORKS_ROUTE_SETUP_FAILED '+phase+' '+profile.id+' '+JSON.stringify({diag,pageErrors})+' '+error.message);
 }
 const workButtons=page.locator('#worksListContainer button[data-select-work]');
 await workButtons.first().waitFor({state:'attached',timeout:25000});
 let found=false;
 let hiddenSetupGestures=0;
 const count=Math.min(12,await workButtons.count());
 for(let i=0;i<count;i++){
  // Phone/desktop split-index CSS can hide the catalogue while the reader is
  // active. DOM click is a *setup gesture* only, never counted as UI usability.
  const select=workButtons.nth(i);
  if(await select.isVisible())await select.click({timeout:20000});
  else {await select.evaluate(node=>node.click());hiddenSetupGestures++;}
  const phaseButton=page.locator('[data-reader-phase="WORLD_ANSWERS"]').first();
  if(await phaseButton.count()){
   if(await phaseButton.isVisible())await phaseButton.click({timeout:10000});
   else {await phaseButton.evaluate(node=>node.click());hiddenSetupGestures++;}
  }
  try {
   await page.locator('#expaCompanionBodyPre .vix-reader-paragraph').first().waitFor({state:'attached',timeout:4500});
   found=true;break;
  } catch(_) {}
 }
 assert.ok(found,'No readable original manuscript mounted for '+phase+' '+profile.id);
 await page.waitForTimeout(400);
 const observation=await page.evaluate(()=>{
  const article=document.querySelector('#expaCompanionBodyPre');
  const paragraph=[...article.querySelectorAll('.vix-reader-paragraph')]
    .find(el=>(el.textContent||'').trim().length>=120)||
    article.querySelector('.vix-reader-paragraph');
  const ar=article.getBoundingClientRect(),pr=paragraph.getBoundingClientRect();
  const style=getComputedStyle(article),ps=getComputedStyle(paragraph);
  const words=(paragraph.textContent||'').trim().split(/\s+/).length;
  const lineHeight=parseFloat(ps.lineHeight);
  const lines=Math.max(1,Math.round(pr.height/(lineHeight||24)));
  const leaks=[];
  const forbidden=/EXPERIMENT[_ -]?A(?:[_ -]?(?:PREVIEW|AUTHORIZED))?|PREVIEW[_ -]?AUTHORIZED|FULL COMPANION MANUSCRIPT AVAILABLE|PRODUCTION REQUIRES OPERATOR SECRET|\b(?:EMSTD613|SignalRupture|Wendbine|Emergence HQ|ChatGPT|Gemini|Antigravity|Codex|Amari|Paul)\b/i;
  const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
  while(walker.nextNode()&&leaks.length<30){
    const node=walker.currentNode,el=node.parentElement,txt=(node.nodeValue||'').trim();
    if(!txt||!forbidden.test(txt)||!el)continue;
    if(el.closest('script,style,template,noscript,[hidden],[data-vixen-machine-only],[data-machine-receipt],.vix-manuscript,.expa-body-pre,.vs-work-title,.vxe-document,.vix-fusion-machine-preview'))continue;
    if(!el.getClientRects().length)continue;
    const computed=getComputedStyle(el);
    if(computed.visibility==='hidden'||computed.display==='none')continue;
    leaks.push(txt.slice(0,180));
  }
  return {
   viewport:innerWidth,article_width:Math.round(ar.width),paragraph_width:Math.round(pr.width),
   font:style.fontFamily,font_size:style.fontSize,line_height:style.lineHeight,
   paragraph_font_size:ps.fontSize,paragraph_line_height:ps.lineHeight,
   overflow_wrap:style.overflowWrap,paragraph_overflow_wrap:ps.overflowWrap,
   word_break:style.wordBreak,max_height:style.maxHeight,
   paragraph_characters:(paragraph.textContent||'').length,
   paragraph_words:words,approx_paragraph_lines:lines,words_per_line:Number((words/lines).toFixed(2)),
   body_horizontal_overflow:document.documentElement.scrollWidth>innerWidth+3,
   mounted_paragraphs:article.querySelectorAll('.vix-reader-paragraph').length,
   leak_count:leaks.length,visible_leaks:leaks
  };
 });
 await page.evaluate(()=>document.querySelector('#expaCompanionBodyPre')?.scrollIntoView({block:'start',inline:'nearest',behavior:'instant'}));
 await page.evaluate(()=>window.scrollBy(0,-60));
 await page.waitForTimeout(170);
 const name=phase+'-'+profile.id+'.png',dest=path.join(root,name);
 await page.screenshot({path:dest,type:'png',animations:'disabled',timeout:30000});
 const bytes=await readFile(dest);
 screens.push({hidden_setup_gestures:hiddenSetupGestures,file:name,sha256:createHash('sha256').update(bytes).digest('hex'),bytes:bytes.length,phase,profile:profile.id,...observation,page_errors:pageErrors});
 await context.close();
 return observation;
}
try{
 for(const profile of profiles){
  const before=await visit(profile,'before');
  const after=await visit(profile,'after');
  if(profile.isMobile){
   assert.ok(after.article_width>=profile.width-85,'mobile article width collapsed: '+JSON.stringify(after));
   assert.ok(after.paragraph_width>=profile.width-110,'mobile paragraph width collapsed: '+JSON.stringify(after));
   assert.ok(after.words_per_line>=3.8,'near one-word-per-line on phone: '+JSON.stringify(after));
   assert.equal(after.word_break,'normal','prose word breaking');
   assert.equal(after.paragraph_overflow_wrap,'normal','no break-anywhere prose');
   assert.equal(after.max_height,'none','no fixed-height reader strip');
  }
  assert.equal(after.leak_count,0,'visitor-stage labels remain: '+JSON.stringify(after.visible_leaks));
  assert.ok(after.mounted_paragraphs>0,'manuscript text disappeared');
  if(after.article_width<before.article_width)errors.push({type:'ARTICLE_NARROWER_THAN_BEFORE',profile:profile.id,before:before.article_width,after:after.article_width});
 }
} finally {
 await browser.close();
 for(const file of written){try{await unlink(file)}catch(_){}}
 const report={schema:'td613.vixen.opera-redpen-before-after/v1',baseline_source:BASE,repaired_source:current,
  source_scope:'Chromium actual source snapshots; no human or native phone acceptance',
  captures:screens,nonblocking_notes:errors};
 await writeFile(path.join(root,'before-after.json'),JSON.stringify(report,null,2)+'\n','utf8');
 console.log(JSON.stringify({redpen_witness:report.schema,source_sha:current,baseline:BASE,
  captures:screens.map(s=>({file:s.file,article_width:s.article_width,words_per_line:s.words_per_line,leaks:s.leak_count})),notes:errors}));
}
