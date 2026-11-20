import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {mkdir} from 'node:fs/promises';

const base='http://127.0.0.1:6130/encyclopedia/vix-cyb.html';
const output='artifacts/vixen-browser-witness';
await mkdir(output,{recursive:true});
const browser=await chromium.launch({headless:true});
async function openSalon(page){
 await page.goto(base,{waitUntil:'domcontentloaded',timeout:30000});
 await page.waitForFunction(()=>window.VixenAIModes?.mounted===true,null,{timeout:20000});
 await page.evaluate(()=>{
  const b=document.querySelector('#vixenRoomRail [data-view="collection"]')||
   document.querySelector('button[data-view="collection"]');
  if(!b)throw Error('NO_COLLECTION_NAVIGATION');
  b.click();
 });
 await page.locator('#view-collection:not([hidden])').waitFor({timeout:12000});
}
try{
 const desktop=await browser.newContext({viewport:{width:1440,height:900},
  reducedMotion:'reduce',acceptDownloads:true});
 const page=await desktop.newPage();
 let errorMessages=[];page.on('pageerror',err=>errorMessages.push(err.message));
 await openSalon(page);
 assert.equal(await page.locator('#vmaStart').isDisabled(),true);
 assert.equal(await page.locator('#vmaNotesView').innerText(),'');
 assert.equal(await page.evaluate(()=>window.VixenAIModes.model_connected),false,
  'A local preview must never impersonate an attached remote LLM');
 await page.locator('[data-vma-role="MAESTRO"]').click();
 assert.equal(await page.locator('#vmaStart').isDisabled(),false);
 await page.locator('#vmaGoal').fill('Why do clock synchronization, feedback, and human oversight intersect?');
 await page.locator('#vmaStart').click();
 await page.waitForFunction(()=>document.getElementById('vmaPlayPanel').hidden===false,null,{timeout:30000});
 assert.match(await page.locator('#vmaCurrentRole').innerText(),/MAESTRO/);
 assert.match(await page.locator('#vmaStory').innerText(),/recorded|source|research/i);
 assert.equal(await page.locator('#vmaMissions article.vma-quest').count(),3);
 assert.equal(await page.locator('#vmaNotesRequest').isVisible(),true);
 assert.equal(await page.locator('#vmaNotesApprove').isVisible(),false);
 assert.equal(await page.locator('#vmaSources article.vma-source').count(),4);
 assert.equal(await page.evaluate(()=>window.VixenAIModes.status().result.note_count),0);
 // A user-requested work excursion must open the correct recorded manuscript.
 const sourceId=await page.evaluate(()=>
  window.VixenAIModes.session.handoff().result.source_candidates[0].work_id);
 await page.locator('#vmaSources .vma-source .vma-small').first().click();
 await page.locator('#view-works:not([hidden])').waitFor({timeout:15000});
 assert.equal(await page.locator('#worksExperimentAReaderMount').getAttribute('data-work-id'),sourceId);
 await page.locator('#vmaJourneyDock').click();
 await page.locator('#view-collection:not([hidden])').waitFor({timeout:10000});
 // A role cannot change underfoot. The role picker is hidden while active.
 assert.equal(await page.locator('[data-vma-role="COMPOSER"]').isVisible(),false);
 await page.locator('#vmaMoves .vma-choice').first().click();
 await page.waitForFunction(()=>document.getElementById('vmaChapter').textContent.includes('01'),null,{timeout:25000});
 assert.equal(await page.evaluate(()=>window.VixenAIModes.status().result.role),'MAESTRO');
 // A visitor can supply a clue, which must be labeled USER_REPORT_UNVERIFIED.
 await page.locator('#vmaMissions .vma-quest').filter({hasText:'YOUR MOVE'})
  .getByRole('button',{name:'Report a clue'}).click();
 assert.equal(await page.locator('#vmaReportPanel').isVisible(),true);
 await page.locator('#vmaReportText').fill('On the clock display I observed a phase shift that does not establish a cause.');
 await page.locator('#vmaReportSubmit').click();
 await page.waitForFunction(()=>window.VixenAIModes.status().result.quest_reports.length===1,null,{timeout:25000});
 const report=await page.evaluate(()=>window.VixenAIModes.status().result.quest_reports[0]);
 assert.equal(report.evidence_class,'USER_REPORT_UNVERIFIED');
 assert.equal(report.crosswalk_proven,false);
 assert.equal(await page.evaluate(()=>window.VixenAIModes.status().result.note_count),0);
 // Nothing can write Program Notes until a direct, visible visitor approval.
 await page.locator('#vmaNotesRequest').click();
 await page.locator('#vmaNotesApprove').waitFor({state:'visible',timeout:10000});
 assert.equal(await page.evaluate(()=>window.VixenAIModes.status().result.note_count),0);
 await page.locator('#vmaNotesApprove').click();
 assert.equal(await page.evaluate(()=>window.VixenAIModes.status().result.note_count),0,
  'Permission must not retroactively author a prior route');
 await page.locator('#vmaMoves .vma-choice').first().click();
 await page.waitForFunction(()=>window.VixenAIModes.status().result.note_count>=1,null,{timeout:25000});
 assert.equal(await page.locator('#vmaNotesView .vma-note').count()>0,true);
 const notesCount=await page.evaluate(()=>window.VixenAIModes.status().result.note_count);
 await page.locator('#vmaNotesRevoke').click();
 await page.locator('#vmaMoves .vma-choice').first().click();
 await page.waitForFunction(()=>document.getElementById('vmaChapter').textContent.includes('03'),null,{timeout:25000});
 assert.equal(await page.evaluate(()=>window.VixenAIModes.status().result.note_count),notesCount,
  'Revoked notes permission must prevent further drafting');
 await page.screenshot({path:output+'/vixen-maestro-desktop-1440.png',
  animations:'disabled',fullPage:false});
 await page.locator('#vmaEnd').click();
 assert.equal(await page.locator('#vmaEndSummary').isVisible(),true);
 assert.equal(await page.locator('#vmaSaveFinal').isVisible(),true);
 assert.equal(await page.locator('#vmaDownloadFinalNotes').isVisible(),true);
 await page.locator('[data-vma-role="COMPOSER"]').click();
 await page.locator('#vmaStart').click();
 await page.waitForFunction(()=>document.getElementById('vmaCurrentRole').textContent.includes('COMPOSER'),null,{timeout:25000});
 assert.equal(await page.evaluate(()=>window.VixenAIModes.status().result.role),'COMPOSER');
 await desktop.close();

 const mobile=await browser.newContext({viewport:{width:390,height:844},
  isMobile:true,hasTouch:true,reducedMotion:'reduce'});
 const phone=await mobile.newPage();
 await openSalon(phone);
 await phone.locator('[data-vma-role="COMPOSER"]').click();
 await phone.locator('#vmaStart').click();
 await phone.waitForFunction(()=>document.getElementById('vmaPlayPanel').hidden===false,null,{timeout:30000});
 const overflow=await phone.locator('#vixenAiJourney').evaluate(el=>({
  width:el.getBoundingClientRect().width,
  viewport:innerWidth,scrollWidth:el.scrollWidth,clientWidth:el.clientWidth
 }));
 assert(overflow.scrollWidth<=overflow.clientWidth+2,
  'AI journey must not introduce horizontal mobile scrolling: '+JSON.stringify(overflow));
 await phone.screenshot({path:output+'/vixen-composer-mobile-390.png',
  animations:'disabled',fullPage:false});
 await mobile.close();
 assert.deepEqual(errorMessages,[],'Uncaught JavaScript errors break the journey');
 console.log('Vixen AI session browser journeys: Maestro desktop and Composer mobile PASS');
}finally{
 await browser.close();
}
