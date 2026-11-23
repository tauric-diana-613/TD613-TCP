/** Exact-revision baseline-versus-repair browser witness for Vixen Opera.
 * One immutable before SHA, one exact current HEAD; same browser viewport,
 * same Work and original PDF-derived manuscript. No synthetic examples.
 */
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {execFileSync,spawn} from 'node:child_process';
import {mkdtemp,mkdir,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
const BASE='7500e294003e8a5effa52921c8d4b7eba673be9d';
const HEAD=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
const OUT=path.resolve('artifacts/vixen-opera-redpen/before-after');
await mkdir(OUT,{recursive:true});
const oldTree=await mkdtemp(path.join(tmpdir(),'vixen-opera-before-'));
let oldServer;
let browser;
const report={schema:'td613.vixen.opera-before-after/v1',baseline_head:BASE,repair_head:HEAD,
  source:'two actual git checkouts of the same repository; local Chromium; source PDF derivative',
  physical_device:false,human_aesthetic_approval:'RESERVED',samples:[],errors:[]};
async function openReader(page,origin){
  const response=await page.goto(origin,{waitUntil:'domcontentloaded',timeout:40000});
  assert.equal(response?.status(),200,'Exact checkout must serve HTML');
  await page.waitForFunction(()=>window.VIXEN_FOX_HOUSE?.mounted===true,null,{timeout:35000});
  await page.locator('#vixenRoomRail button[data-view="works"]').click({force:true,timeout:15000});
  await page.waitForTimeout(120);
  const entrance=await page.locator('#view-works').evaluate(el=>el.innerText.slice(0,6000));
  await page.locator('#worksListContainer button[data-select-work]')
    .filter({hasText:/The Architecture of Control/i}).first().click({force:true,timeout:15000});
  const mount=page.locator('#worksExperimentAReaderMount');
  const pdf=mount.locator('[data-select-manifestation]').filter({hasText:/Algedonic Systems Deep Research\.pdf/i}).first();
  await pdf.waitFor({state:'visible',timeout:30000});
  await pdf.click({force:true,timeout:20000});
  await page.waitForFunction(()=>{
    const el=document.getElementById('expaCompanionBodyPre');
    return el?.dataset.lineation==='pdf-source-wordflow-reconstructed'&&el.querySelectorAll('.vix-reader-paragraph').length>20;
  },null,{timeout:45000,polling:300});
  const geometry=await page.locator('#expaCompanionBodyPre').evaluate(el=>{
    const r=el.getBoundingClientRect(),style=getComputedStyle(el);
    const paras=[...el.querySelectorAll('.vix-reader-paragraph')];
    const averages=[];
    for(const para of paras.slice(0,12)){
      const node=[...para.childNodes].find(x=>x.nodeType===3&&x.textContent.length>=60);
      if(!node)continue;
      const rows=new Map(),range=document.createRange();
      const words=[...node.textContent.matchAll(/\S+/g)].slice(0,100);
      for(const word of words){
        range.setStart(node,word.index);range.setEnd(node,word.index+word[0].length);
        const box=range.getBoundingClientRect(),row=Math.round(box.top/2)*2;
        rows.set(row,(rows.get(row)||0)+1);
      }
      if(rows.size)averages.push(words.length/rows.size);
    }
    return {width:r.width,viewport:innerWidth,bodyFont:style.fontFamily,fontSize:style.fontSize,
      background:style.backgroundColor,overflowWrap:style.overflowWrap,wordBreak:style.wordBreak,
      columnCount:style.columnCount,paragraphs:paras.length,
      avgParagraphWords:paras.reduce((n,p)=>n+p.textContent.trim().split(/\s+/).length,0)/paras.length,
      sampledLineWords:averages,meanLineWords:averages.reduce((a,b)=>a+b,0)/Math.max(1,averages.length),
      documentHeight:document.documentElement.scrollHeight,rawSourceChars:el.querySelector('.vix-reader-raw pre')?.textContent.length||0};
  });
  await page.locator('#expaCompanionBodyPre').evaluate(el=>el.scrollIntoView({block:'start',behavior:'instant'}));
  await page.waitForTimeout(100);
  return {entrance,geometry};
}
try{
  execFileSync('git',['worktree','add','--detach',oldTree,BASE],{stdio:'pipe',timeout:110000});
  oldServer=spawn('python3',['-m','http.server','6131','--bind','127.0.0.1','--directory',path.join(oldTree,'app')],{stdio:'ignore'});
  let ready=false;
  for(let attempt=0;attempt<80;attempt++){
    try{const res=await fetch('http://127.0.0.1:6131/encyclopedia/vix-cyb.html');if(res.ok){ready=true;break;}}catch{}
    await new Promise(r=>setTimeout(r,125));
  }
  assert(ready,'BASELINE_WORKTREE_HTTP_UNAVAILABLE');
  browser=await chromium.launch({headless:true});
  for(const [name,w,h] of [['iphone-390',390,844],['iphone-428',428,926],['desktop-1440',1440,900]]){
    const result={name,viewport:{width:w,height:h}};
    for(const [label,url] of [['before','http://127.0.0.1:6131/encyclopedia/vix-cyb.html'],['after','http://127.0.0.1:6130/encyclopedia/vix-cyb.html']]){
      const context=await browser.newContext({viewport:{width:w,height:h},deviceScaleFactor:w<680?3:1,isMobile:w<680,reducedMotion:'reduce'});
      const page=await context.newPage();
      const error=[];
      page.on('pageerror',e=>error.push(String(e.message)));
      const witness=await openReader(page,url);
      const screenshot=path.join(OUT,name+'-'+label+'.png');
      await page.screenshot({path:screenshot,animations:'disabled'});
      result[label]={...witness,screenshot:path.basename(screenshot),pageErrors:error};
      await context.close();
    }
    assert(result.before.geometry.rawSourceChars>35000&&result.after.geometry.rawSourceChars>35000,
      'Baseline and repair must use complete real PDF derivatives: '+JSON.stringify(result));
    if(w<680){
      assert(result.after.geometry.meanLineWords>3.8,
        'New phone edition still breaks prose into narrow, short lines: '+JSON.stringify(result));
      assert(result.after.geometry.width>=w*.7,
        'New phone edition failed full-width measure: '+JSON.stringify(result));
    }
    report.samples.push(result);
  }
} catch(error){
  report.errors.push(String(error.stack||error));
  throw error;
}finally{
  await browser?.close();
  oldServer?.kill();
  try{execFileSync('git',['worktree','remove','--force',oldTree],{timeout:15000});}catch{}
  await rm(oldTree,{recursive:true,force:true}).catch(()=>{});
  await writeFile(path.join(OUT,'BEFORE_AFTER_METRICS.json'),JSON.stringify(report,null,2)+'\n');
}
console.log('VIXEN_OPERA_EXACT_SHA_BEFORE_AFTER_WITNESS',JSON.stringify({baseline:BASE,head:HEAD,screens:report.samples.length}));
