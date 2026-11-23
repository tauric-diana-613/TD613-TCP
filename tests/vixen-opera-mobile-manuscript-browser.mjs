/**
 * Vixen Opera RGI27: browser-recorded before/after for actual Works rendering.
 * Before is Git worktree at PR #1730 source SHA; after is the repair checkout.
 * Human/physical-device acceptance remains reserved.
 */
import {chromium} from 'playwright';
import {spawn, execFileSync} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';

const baselineRoot=process.env.VIXEN_BASELINE_ROOT;
if(!baselineRoot)throw Error('BASELINE_ROOT_REQUIRED_FOR_SAME_LINEAGE_COMPARISON');
const beforeSha=execFileSync('git',['-C',baselineRoot,'rev-parse','HEAD'],{encoding:'utf8'}).trim();
const afterSha=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
if(beforeSha===afterSha)throw Error('BASELINE_SAME_AS_REPAIR');
const root=path.resolve('artifacts/vixen-browser-witness/opera-mobile-redpen');
await mkdir(root,{recursive:true});
const profiles=[{name:'iphone-390',width:390,height:844},{name:'iphone-428',width:428,height:926},
                {name:'desktop-1440',width:1440,height:900}];
const server=spawn('python3',['-m','http.server','6131','--bind','127.0.0.1','--directory',path.join(baselineRoot,'app')],{stdio:'ignore'});
const beforeOrigin='http://127.0.0.1:6131/encyclopedia/vix-cyb.html';
const afterOrigin=process.env.VIXEN_WITNESS_ORIGIN||'http://127.0.0.1:6130/encyclopedia/vix-cyb.html';
const rows=[],failures=[];
try{
 let ready=false;
 for(let i=0;i<100;i++){
   if(server.exitCode!==null)break;
   try{const r=await fetch(beforeOrigin);if(r.status===200){ready=true;break;}}catch{}
   await new Promise(resolve=>setTimeout(resolve,200));
 }
 if(!ready)throw Error('BASELINE_HTTP_UNAVAILABLE '+beforeSha);
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try{
   for(const profile of profiles){
     const variants=[];
     for(const [version,url] of [['before',beforeOrigin],['after',afterOrigin]]){
       const context=await browser.newContext({viewport:{width:profile.width,height:profile.height},
         deviceScaleFactor:profile.width<500?3:1,isMobile:profile.width<500,
         reducedMotion:'reduce'});
       const page=await context.newPage();
       try{
         const response=await page.goto(url,{waitUntil:'domcontentloaded',timeout:45000});
         if(response?.status()!==200)throw Error('HTTP_'+response?.status());
         // The route rail mounts asynchronously. Clicking before stage boot
         // silently leaves the Works index in a hidden view on every width.
         // Wait for the *application* navigation listeners and typed read-only
         // wayfinding API, not merely the image/curtain Fox House mount.
         await page.waitForFunction(()=>Boolean(window.VIXEN_BOOT_HYDRATION && window.VixenReference?.openWork),null,{timeout:30000});
         const original=page.locator('#worksListContainer button[data-select-work]').filter({hasText:/The Architecture of Control/i}).first();
         await original.waitFor({state:'attached',timeout:25000});
         const workId=await original.getAttribute('data-select-work');
         const opened=await page.evaluate(id=>window.VixenReference.openWork(id),workId);
         if(opened?.opened!==true)throw Error('ORIGINAL_WORK_OPEN_FAILED '+JSON.stringify(opened));
         await page.locator('#view-works').waitFor({state:'visible',timeout:25000});
         const pdf=page.locator('#worksExperimentAReaderMount [data-select-manifestation]').filter({hasText:/Algedonic Systems Deep Research\.pdf/i}).first();
         await pdf.waitFor({state:'attached',timeout:25000});
         // Tabs can be visually folded in the phone's focused reader. DOM click
         // invokes the existing registered handler and earns no UI-click credit.
         await pdf.evaluate(el=>el.click());
         await page.waitForFunction(()=>{
           const el=document.getElementById('expaCompanionBodyPre');
           return el?.dataset.lineation==='pdf-source-wordflow-reconstructed' &&
                  el.querySelectorAll('.vix-reader-paragraph').length>20 &&
                  (el.querySelector('.vix-reader-raw pre')?.textContent.length||0)>35000;
         },null,{timeout:45000,polling:250});
         await page.waitForTimeout(250);
         const measurement=await page.evaluate(()=>{
           const article=document.querySelector('#expaCompanionBodyPre');
           const paragraphs=[...article.querySelectorAll('.vix-reader-paragraph')];
           const selected=paragraphs.find(p=>(p.textContent||'').trim().split(/\s+/u).length>=25)||paragraphs[0];
           const rect=article.getBoundingClientRect();
           const pRect=selected?.getBoundingClientRect();
           const rects=[];
           if(selected){
             const walker=document.createTreeWalker(selected,NodeFilter.SHOW_TEXT);
             let node;
             while((node=walker.nextNode())&&rects.length<160){
               const rx=/\S+/gu;let match;
               while((match=rx.exec(node.data))&&rects.length<160){
                 const range=document.createRange();range.setStart(node,match.index);
                 range.setEnd(node,match.index+match[0].length);
                 const box=range.getBoundingClientRect();
                 if(box.width>0)rects.push({top:Math.round(box.top/2)*2,word:match[0]});
               }
             }
           }
           const counts=new Map();
           for(const w of rects)counts.set(w.top,(counts.get(w.top)||0)+1);
           const ordered=[...counts.values()].sort((a,b)=>a-b);
           const median=ordered.length?ordered[Math.floor(ordered.length/2)]:0;
           const tokens=[...document.querySelectorAll('#view-works .view-heading, #worksReaderPanel .badge-row, #worksExperimentAReaderMount>div:first-child')].filter(e=>e.getClientRects().length).map(e=>e.innerText||'').join(' ');
           const leaked=(tokens.match(/EXPERIMENT[_ -]?A(?:[_ -]?PREVIEW)?[_ -]?AUTHORIZED|EXPERIMENT-A COMPANION READER|VOLUNTEER\s*\/\s*DEV AUTHORIZED|PRODUCTION REQUIRES OPERATOR SECRET|FULL COMPANION MANUSCRIPT AVAILABLE/gi)||[]);
           const css=getComputedStyle(article);
           const mesh=document.getElementById('vixenLivingMesh');
           const pdfTitle=article.querySelector('.vix-pdf-source-title');
           const titleStyle=pdfTitle?getComputedStyle(pdfTitle):null;
           return {mesh_display:mesh?getComputedStyle(mesh).display:'absent',
             pdf_title_font_px:titleStyle?parseFloat(titleStyle.fontSize):null,
             pdf_title_color:titleStyle?.color||null,
             document_scroll_width:document.documentElement.scrollWidth,
             article_width_px:+rect.width.toFixed(2),paragraph_width_px:+(pRect?.width||0).toFixed(2),
             body_font_px:css.fontSize,body_font_family:css.fontFamily,body_line_height:css.lineHeight,
             max_height:css.maxHeight,columns:css.columnCount,overflow_x:css.overflowX,overflow_y:css.overflowY,
             paragraph_count:paragraphs.length,word_samples:rects.length,measured_lines:ordered.length,
             median_words_per_line:median,min_words_per_line:ordered[0]||0,
             max_words_per_line:ordered.at(-1)||0,leaks:[...new Set(leaked)],visible_controls:tokens.slice(0,700)};
         });
         await page.locator('#worksReaderPanel').evaluate(el=>el.scrollIntoView({block:'start',behavior:'instant'}));
         await page.waitForTimeout(200);
         await page.screenshot({path:path.join(root,profile.name+'-'+version+'-chrome.jpg'),type:'jpeg',quality:78});
         await page.locator('#expaCompanionBodyPre').evaluate(el=>el.scrollIntoView({block:'start',behavior:'instant'}));
         await page.waitForTimeout(200);
         await page.screenshot({path:path.join(root,profile.name+'-'+version+'-manuscript.jpg'),type:'jpeg',quality:85});
         variants.push({version,source_sha:version==='before'?beforeSha:afterSha,url_origin:new URL(url).origin,...measurement});
         if(version==='after'){
           if(measurement.leaks.length)failures.push({profile:profile.name,problem:'VISIBLE_BACKSTAGE_COPY',leaks:measurement.leaks});
           if(measurement.article_width_px<profile.width*(profile.width<500?.67:.36))failures.push({profile:profile.name,problem:'COLLAPSED_MANUSCRIPT_MEASURE',width:measurement.article_width_px});
           if(measurement.word_samples<15||measurement.median_words_per_line<4)
             failures.push({profile:profile.name,problem:'ONE_WORD_PER_LINE_OR_UNREADABLE_FLOW',median:measurement.median_words_per_line,words:measurement.word_samples});
           if(profile.width<500&&measurement.max_height!=='none')
             failures.push({profile:profile.name,problem:'FIXED_HEIGHT_MOBILE_MANUSCRIPT',value:measurement.max_height});
           if(profile.width<500&&measurement.mesh_display!=='none')
             failures.push({profile:profile.name,problem:'LIVING_MESH_OVERLAY_OVER_READING',value:measurement.mesh_display});
           if(profile.width<500&&measurement.pdf_title_font_px>21)
             failures.push({profile:profile.name,problem:'OVERSIZED_PDF_POSTER_TITLE',value:measurement.pdf_title_font_px});
           if(profile.width>=681&&(!(measurement.pdf_title_font_px>=22&&measurement.pdf_title_font_px<=33)))
             failures.push({profile:profile.name,problem:'DESKTOP_TITLE_DISPLAY_SCALE',value:measurement.pdf_title_font_px});
           if(profile.width>=681&&parseFloat(measurement.body_font_px)<15.4)
             failures.push({profile:profile.name,problem:'DESKTOP_MANUSCRIPT_TOO_SMALL',value:measurement.body_font_px});
           if(profile.width>=681&&measurement.paragraph_width_px>profile.width*.7)
             failures.push({profile:profile.name,problem:'DESKTOP_PROSE_MEASURE_TOO_WIDE',value:measurement.paragraph_width_px});
           if(measurement.document_scroll_width>profile.width+3)
             failures.push({profile:profile.name,problem:'DOCUMENT_HORIZONTAL_OVERFLOW',value:measurement.document_scroll_width});
         }
       }catch(e){failures.push({profile:profile.name,version,error:String(e)});}
       finally{await context.close();}
     }
     rows.push({profile,...{before:variants.find(v=>v.version==='before')||null,after:variants.find(v=>v.version==='after')||null}});
   }
 }finally{await browser.close();}
}finally{server.kill('SIGTERM');}
const report={schema:'td613.vixen.opera-mobile-redpen/v1',before_source_sha:beforeSha,
 after_source_sha:afterSha,profiles:rows,errors:failures,
 limits:['Chromium device emulation, not physical iPhone','Original Work body selection tested, not every manuscript',
         'Capture is UI/line-length geometry; no inference of source authorship from rendering']};
await writeFile(path.join(root,'BEFORE_AFTER.json'),JSON.stringify(report,null,2)+'\n');
const cards=profiles.map(p=>'<section><h2>'+p.name+'</h2><div class="pair"><figure><img src="'+p.name+'-before-manuscript.jpg"><figcaption>Before · '+beforeSha.slice(0,12)+'</figcaption></figure><figure><img src="'+p.name+'-after-manuscript.jpg"><figcaption>After · '+afterSha.slice(0,12)+'</figcaption></figure></div><div class="pair"><figure><img src="'+p.name+'-before-chrome.jpg"><figcaption>Before · onstage copy</figcaption></figure><figure><img src="'+p.name+'-after-chrome.jpg"><figcaption>After · onstage copy</figcaption></figure></div></section>').join('\n');
await writeFile(path.join(root,'INDEX.html'),'<!doctype html><html lang="en"><meta charset="utf-8"><title>Vixen Opera redpen · matched before/after</title><style>body{font:14px system-ui;background:#151a1d;color:#f6e4dc;margin:24px}.pair{display:grid;grid-template-columns:1fr 1fr;gap:12px;align-items:start}figure{margin:0}img{width:100%;height:auto}figcaption{padding:8px;color:#e3b79e}section{margin:24px 0}</style><h1>Vixen Opera · mobile manuscript and surface scrub</h1><p>Exact before and after lineage. Read BEFORE_AFTER.json for measured line width, tokens and limitations.</p>'+cards+'</html>');
console.log(JSON.stringify({before:beforeSha,after:afterSha,profiles:rows.map(r=>({name:r.profile.name,before:r.before?.median_words_per_line,after:r.after?.median_words_per_line,width:r.after?.article_width_px,leaks:r.after?.leaks})),errors:failures}));
if(failures.length)process.exitCode=1;
