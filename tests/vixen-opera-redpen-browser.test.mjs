/** Exact-head Opera-surface redpen witness. Actual Work and PDF derivative only.
 * No synthetic manuscript may substitute for verified original content.
 * Browser screenshots/metrics demonstrate rendered pixels; human approval reserved.
 */
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
const out=path.resolve('artifacts/vixen-opera-redpen');
const head=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
const url='http://127.0.0.1:6130/encyclopedia/vix-cyb.html';
const samples=[];
await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true});
try{
 for(const {name,width,height,isMobile} of [
   {name:'iphone-390',width:390,height:844,isMobile:true},
   {name:'iphone-428',width:428,height:926,isMobile:true},
   {name:'desktop-1440',width:1440,height:900,isMobile:false}
 ]){
   const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:isMobile?3:1,isMobile,reducedMotion:'reduce'});
   const page=await context.newPage();
   const errors=[];page.on('pageerror',e=>errors.push(String(e.message)));
   const response=await page.goto(url,{waitUntil:'domcontentloaded',timeout:30000});
   assert.equal(response?.status(),200,name+' source unavailable');
   await page.waitForFunction(()=>window.VIXEN_FOX_HOUSE?.mounted===true,null,{timeout:25000});
   await page.locator('#vixenRoomRail button[data-view="works"]').click({force:true});
   await page.waitForTimeout(200);
   const entrance=await page.evaluate(()=>{
     const root=document.getElementById('view-works');
     const body=root?.innerText||'';
     const backstage=/(?:EXPERIMENT[-_ ]A|PREVIEW[_ -]AUTHORIZED|PRODUCTION REQUIRES OPERATOR SECRET|VOLUNTEER\s*\/\s*DEV AUTHORIZED|Empirical_REPLICATION_CREDIT)/i;
     return {visibleText:body.slice(0,1200),backstageFound:backstage.test(body)};
   });
   assert.equal(entrance.backstageFound,false,name+' Works entrance exposed internal release copy: '+entrance.visibleText);
   await page.screenshot({path:path.join(out,name+'-works-catalogue-after.png'),animations:'disabled'});
   const target=page.locator('#worksListContainer button[data-select-work]').filter({hasText:/The Architecture of Control/i}).first();
   await target.click({force:true,timeout:20000});
   const mount=page.locator('#worksExperimentAReaderMount');
   const pdf=mount.locator('[data-select-manifestation]').filter({hasText:/Algedonic Systems Deep Research\.pdf/i}).first();
   await pdf.waitFor({state:'visible',timeout:20000});
   await pdf.click({force:true,timeout:20000});
   await page.waitForFunction(()=>{
     const reader=document.getElementById('expaCompanionBodyPre');
     return reader?.dataset.lineation==='pdf-source-wordflow-reconstructed'&&reader.querySelectorAll('.vix-reader-paragraph').length>20;
   },null,{timeout:35000,polling:250});
   const metric=await page.evaluate(()=>{
      const el=document.getElementById('expaCompanionBodyPre');
      const paragraphs=[...el.querySelectorAll('.vix-reader-paragraph')];
      const rootRect=el.getBoundingClientRect(),css=getComputedStyle(el),first=paragraphs[0];
      const p=first&&getComputedStyle(first);
      const avgWords=paragraphs.reduce((sum,x)=>sum+x.textContent.trim().split(/\s+/).length,0)/paragraphs.length;
      const firstTen=paragraphs.slice(0,10).map(n=>{
        const range=document.createRange(),node=[...n.childNodes].find(x=>x.nodeType===3&&x.textContent.length>40);
        if(!node)return {lines:0,wordsPerLine:null};
        const words=[...node.textContent.matchAll(/\S+/g)].slice(0,100),rows=new Map();
        for(const m of words){
           range.setStart(node,m.index);range.setEnd(node,m.index+m[0].length);
           const rect=range.getBoundingClientRect();
           if(!rect.height)continue;
           const key=Math.round(rect.top/2)*2;
           rows.set(key,(rows.get(key)||0)+1);
        }
        const values=[...rows.values()];
        return {lines:values.length,wordsPerLine:values.length?values.reduce((a,b)=>a+b,0)/values.length:null};
      });
      const readerChrome=document.getElementById('worksReaderPanel');
      const surface=[...readerChrome.querySelectorAll('.tag,.badge,.eyebrow,.ci-kicker,.vixen-manuscript-kicker,.vix-reading-atelier-eyebrow,.expa-aperture-bar')].map(n=>n.textContent||'');
      return {sourceCharacters:el.querySelector('.vix-reader-raw pre')?.textContent.length||0,
        paragraphCount:paragraphs.length,averageParagraphWords:avgWords,
        width:rootRect.width,viewportWidth:innerWidth,letterSpacing:css.letterSpacing,
        fontFamily:css.fontFamily,fontSize:parseFloat(css.fontSize),lineHeight:parseFloat(css.lineHeight),
        columnCount:css.columnCount,overflowWrap:css.overflowWrap,wordBreak:css.wordBreak,
        paper:css.backgroundColor,paragraphMargin:p?.marginBottom,
        firstTen,chromeText:surface,windowScrollHeight:document.documentElement.scrollHeight,
        clientWidth:el.clientWidth,scrollWidth:el.scrollWidth,outerScrollWidth:document.documentElement.scrollWidth};
   });
   assert(metric.sourceCharacters>35000,'Verified complete original derivative source required');
   assert(metric.averageParagraphWords>30,'Word-per-paragraph relapse: '+JSON.stringify(metric));
   assert(metric.width>=width*(isMobile?.71:.36),'Narrow mobile measure: '+JSON.stringify(metric));
   assert(metric.outerScrollWidth<=width+3,'Unexpected document horizontal overflow: '+JSON.stringify(metric));
   assert(metric.columnCount==='auto','New reader must use ordinary page flow: '+JSON.stringify(metric));
   if(isMobile){
     assert(metric.width>=width*.72,'Phone needs actual readable text measure: '+JSON.stringify(metric));
     assert(metric.fontSize>=14.8&&metric.fontSize<=17,'Compact editorial body text: '+JSON.stringify(metric));
     assert(metric.firstTen.filter(p=>p.wordsPerLine!==null).length>=6,'Insufficient real paragraphs for line-density witness: '+JSON.stringify(metric.firstTen));
     assert(metric.firstTen.filter(p=>p.wordsPerLine!==null).every(p=>p.wordsPerLine>3),
      'One-word-per-line behavior persists: '+JSON.stringify(metric.firstTen));
     assert(metric.overflowWrap==='normal'&&metric.wordBreak==='normal',
      'Aggressive wrapping persists in phone manuscript: '+JSON.stringify(metric));
   }
   assert(!metric.chromeText.some(x=>/(EXPERIMENT[-_ ]A|PREVIEW[_ -]AUTHORIZED|PRODUCTION REQUIRES|Emergence HQ|EMSTD613|Wendbine|SignalRupture)/i.test(x)),
     'Backstage chrome leaked into public reading: '+metric.chromeText.join(' | '));
   await page.evaluate(()=>document.getElementById('expaCompanionBodyPre')?.scrollIntoView({block:'start',behavior:'instant'}));
   await page.waitForTimeout(160);
   const screenshot=path.join(out,name+'-verified-pdf-manuscript-after.png');
   await page.screenshot({path:screenshot,animations:'disabled',fullPage:false});
   if(isMobile){
     const before=await page.evaluate(()=>window.scrollY);
     await mount.locator('#vixFolioNext').click({force:true});
     await page.waitForTimeout(440);
     const after=await page.evaluate(()=>window.scrollY);
     assert(after>before+15,'Natural mobile reading pagination must scroll the page: '+JSON.stringify({before,after,name}));
   }
   assert.equal(errors.length,0,'Browser JavaScript exceptions: '+JSON.stringify(errors));
   samples.push({name,head,metrics:metric,entrance,errors,screenshot:path.basename(screenshot)});
   await context.close();
 }
}finally{await browser.close();}
const report=JSON.stringify({schema:'td613.vixen.opera-redpen-browser/v1',head,baseline:'PR1730_BEFORE_HEAD_7500e294003e8a5effa52921c8d4b7eba673be9d',comparison:'After screenshots only; baseline provided by earlier qualified run, not falsely recreated here',physical_device:false,human_aesthetic_approval:'RESERVED',samples},null,2)+'\n';
await writeFile(path.join(out,'METRICS.json'),report);
console.log('VIXEN_OPERA_REDPEN_SCREENSHOTS_AND_MEASURE_PASS',head,samples.map(x=>x.name).join(','));
