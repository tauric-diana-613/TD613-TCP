/**
 * RGI27 — browser proof of one scrolling optical ownership domain on iPhone.
 * This explicitly distinguishes local animated stage from viewport-fixed cloth.
 * It is an automated browser witness, NOT physical-iPhone approval.
 */
import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const browser=await chromium.launch({headless:true});
try {
 const context=await browser.newContext({
   viewport:{width:390,height:844},deviceScaleFactor:3,isMobile:true,hasTouch:true,
   reducedMotion:'no-preference'
 });
 const page=await context.newPage();
 const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 assert.equal((await page.goto('http://127.0.0.1:6130/encyclopedia/vix-cyb.html',{
   waitUntil:'domcontentloaded',timeout:45000
 })).status(),200);
 await page.waitForFunction(()=>!!window.VixenLivingMesh?.status && !!window.VIXEN_FOX_HOUSE?.mounted,null,{timeout:20000});
 await page.locator('#vixenRoomRail button[data-view="collection"]').evaluate(el=>el.click());
 await page.waitForFunction(()=>document.body.dataset.view==='collection',null,{timeout:15000});
 await page.waitForSelector('#vixenSynthesisSalon[data-couture="folded-chrome"] .vs-cuirass-canvas',{timeout:20000});
 await page.waitForTimeout(500);
 const initial=await page.evaluate(()=>{
   const wall=document.getElementById('vixenLivingMesh');
   const garment=document.querySelector('#vixenSynthesisSalon .vs-cuirass-canvas');
   const light=document.querySelector('#vixenSynthesisSalon .vs-cuirass-motion-canvas');
   return {
     view:document.body.dataset.view,
     wallpaperDisplay:getComputedStyle(wall).display,
     wallpaperStatus:window.VixenLivingMesh.status(),
     garmentVisible:!!garment&&getComputedStyle(garment).display!=='none'&&garment.width>0&&garment.height>0,
     motionVisible:!!light&&getComputedStyle(light).display!=='none'&&light.width>0&&light.height>0,
     scrollHeight:document.documentElement.scrollHeight
   };
 });
 assert.equal(initial.wallpaperDisplay,'none','mobile Salon must park the viewport-fixed canvas');
 assert.equal(initial.wallpaperStatus.scroll_coherence,'LOCAL_STAGE_ONLY');
 assert(initial.garmentVisible,'local corset canvas must continue to be drawn');
 assert(initial.motionVisible,'local motion canvas must remain visibly present');
 const before=initial.wallpaperStatus.host_driven_frames;
 // Multiple consecutive scroll deltas emulate the compositor change that
 // previously caused phase jitter; assert there is no competing fixed field.
 for(const y of [210,390,560,720]){
   await page.evaluate(y=>window.scrollTo(0,y),y);
   await page.waitForTimeout(90);
   const state=await page.evaluate(()=>({
     scroll:window.scrollY,
     wallpaper:getComputedStyle(document.getElementById('vixenLivingMesh')).display,
     host:window.VixenLivingMesh.status().scroll_coherence,
     cardHeight:document.querySelector('#vixenSynthesisSalon .vs-cuirass-canvas').height
   }));
   assert.equal(state.wallpaper,'none');
   assert.equal(state.host,'LOCAL_STAGE_ONLY');
   assert(state.cardHeight>0);
 }
 assert.equal(errors.length,0,'Browser exceptions: '+errors.join(' | '));
 // A room transition restores the global field without changing its source.
 await page.locator('#vixenRoomRail button[data-view="works"]').evaluate(el=>el.click());
 await page.waitForFunction(()=>document.body.dataset.view==='works',null,{timeout:12000});
 assert.equal(await page.evaluate(()=>getComputedStyle(document.getElementById('vixenLivingMesh')).display),'block');
 assert.equal(await page.evaluate(()=>window.VixenLivingMesh.status().scroll_coherence),'SHARED_VIEWPORT_FIELD');
 await context.close();
}finally{await browser.close();}
console.log('RGI27 mobile compositor ownership/scroll witness: local garment retained, fixed cloth parked only in Salon');
