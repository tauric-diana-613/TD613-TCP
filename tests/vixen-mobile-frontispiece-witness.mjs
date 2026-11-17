/**
 * RGI20 · Operator-mobile first-view, EARLY independent Chromium witness.
 * Screenshot and pixel-supported geometry are artifacts, not artistic closure.
 * Mobile CSS only; SVG, image assets, title anchors, data, and custody intact.
 * RGI21: reject typography/chrome collisions; capture 3x retina-size screenshots.
 */
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const site = process.env.VIXEN_BASE_URL || 'http://127.0.0.1:6130/encyclopedia/vix-cyb.html';
const output = path.resolve('artifacts/vixen-mobile-redpen');
const head = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const devices = [{width:390,height:844},{width:428,height:926}];
const witness = [];
await mkdir(output, {recursive:true});
const browser = await chromium.launch({headless:true});
try {
  for (const device of devices) {
    const context = await browser.newContext({
      viewport: device, deviceScaleFactor: 3, isMobile:true, hasTouch:true,
      reducedMotion:'reduce'
    });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(String(e.message)));
    const response = await page.goto(site, {waitUntil:'domcontentloaded',timeout:30000});
    assert.equal(response?.status(),200,'Mobile Opera must load');
    await page.waitForFunction(() => document.body.dataset.vixenArrival==='ready' ||
      !document.getElementById('vixEntryVeil'), {timeout:12000}).catch(()=>{});
    const img = page.locator('#view-overview #cover .hero-art img');
    await img.evaluate(el => el.decode());
    await page.evaluate(() => window.scrollTo({top:0,behavior:'instant'}));
    await page.waitForTimeout(130);
    const geom = await page.evaluate(() => {
      const cover = document.querySelector('#cover');
      const picture = cover.querySelector('.hero-art img');
      const art = cover.querySelector('.hero-art');
      const one = cover.querySelector('.cover-word-one');
      const two = cover.querySelector('.cover-word-two');
      const measure = el => {
        const b=el.getBoundingClientRect();
        return {top:b.top,left:b.left,bottom:b.bottom,right:b.right,
          width:b.width,height:b.height};
      };
      const hero=measure(cover), frame=measure(picture);
      const canvas=document.createElement('canvas');
      canvas.width=256;
      canvas.height=Math.round(256*picture.naturalHeight/picture.naturalWidth);
      const ctx=canvas.getContext('2d',{willReadFrequently:true});
      ctx.drawImage(picture,0,0,canvas.width,canvas.height);
      const pixels=ctx.getImageData(0,0,canvas.width,canvas.height).data;
      let yFirst=canvas.height,yLast=-1,xFirst=canvas.width,xLast=-1,count=0;
      const rowCounts=new Array(10).fill(0);
      for(let y=0;y<canvas.height;y++){
        for(let x=0;x<canvas.width;x++){
          const i=(y*canvas.width+x)*4,R=pixels[i],G=pixels[i+1],
            B=pixels[i+2],A=pixels[i+3];
          const hi=Math.max(R,G,B),lo=Math.min(R,G,B);
          if(A>210&&hi>110&&hi-lo<65){
            count++;yFirst=Math.min(yFirst,y);yLast=Math.max(yLast,y);
            xFirst=Math.min(xFirst,x);xLast=Math.max(xLast,x);
            rowCounts[Math.min(9,Math.floor(y/canvas.height*10))]++;
          }
        }
      }
      const fit=Math.min(frame.width/picture.naturalWidth,frame.height/picture.naturalHeight);
      const drawnHeight=fit*picture.naturalHeight;
      const drawnTop=frame.top+(frame.height-drawnHeight)/2;
      const chromatic={
        sampledBrightNeutralPixelCount:count,
        top:drawnTop+yFirst/canvas.height*drawnHeight,
        bottom:drawnTop+yLast/canvas.height*drawnHeight,
        paintedTop:drawnTop,paintedBottom:drawnTop+drawnHeight,
        rowCounts,sourceSupport:{xFirst,xLast,yFirst,yLast}
      };
      return {viewport:{width:innerWidth,height:innerHeight},hero,
        stage:measure(art),frame,one:measure(one),two:measure(two),
        labelOne:one.textContent.trim(),labelTwo:two.textContent.trim(),
        asset:picture.currentSrc,objectFit:getComputedStyle(picture).objectFit,
        titleJustification:getComputedStyle(one.parentElement).justifyContent,
        chromatic,
        approvedSource:document.body.dataset.vixenFrontispieceSource};
    });
    const name='vixen-mobile-rgi20-'+device.width+'x'+device.height;
    await page.screenshot({path:path.join(output,name+'-first-screen.png'),fullPage:false});
    await writeFile(path.join(output,name+'-geometry.json'),
      JSON.stringify({head,geom,errors},null,2)+'\n');
    assert.match(geom.labelOne,/VIXEN/);
    assert.match(geom.labelTwo,/CYBERNETICS/);
    assert.equal(geom.objectFit,'contain');
    assert.equal(geom.approvedSource,'external-selected');
    assert(geom.asset.endsWith('/assets/vixen/frontispiece-mobile.png'));
    assert.equal(geom.titleJustification,'space-between');
    assert(geom.one.top-geom.hero.top<180,'VIXEN top anchor moved from masthead');
    assert(geom.two.bottom-geom.hero.top>geom.hero.height*.60,
      'CYBERNETICS lower anchor moved upward');
    assert(geom.chromatic.sampledBrightNeutralPixelCount>600,
      'Approved chrome art not measurably present');
    // RGI21: A present chrome sculpture can still obscure a protected title.
    // Test the actual BRIGHT-CHROME support, not merely CSS bounds, against
    // both immutable operator-padlocked typographic anchor positions.
    const expectedLowerTop=device.width===390 ? 611.5625 : 646.359375;
    assert(Math.abs(geom.one.top-80)<3,
      'Operator-locked VIXEN position was displaced');
    assert(Math.abs(geom.two.top-expectedLowerTop)<5,
      'Operator-locked CYBERNETICS position was displaced');
    assert(Math.abs(geom.frame.height-(geom.hero.height-172-206))<2,
      'Mobile sculpture frame was scaled by stage-padding changes');
    assert(geom.chromatic.top>=geom.one.bottom+6,
      'Raised sculpture intrudes on the upper locked VIXEN heading');
    assert(geom.chromatic.bottom+10<=geom.two.top,
      'Chrome sculpture still clashes with locked CYBERNETICS text');
    assert(geom.chromatic.paintedTop>=geom.hero.top,
      'Approved image was cropped past the frontispiece top');
    assert(geom.chromatic.paintedBottom<=geom.hero.bottom,
      'Approved image was cropped past the frontispiece bottom');
    // The 2026-11-17 iPhone REDPEN screenshot showed 39-carrier optical
    // threads crossing an unregistered Entrance panel and hard-edged black
    // mask rectangles popping in/out across the archive threshold.
    // Reproduce on BOTH native-scale phone viewports after first-frame checks.
    await page.waitForFunction(() => window.VixenLivingMesh?.status?.()?.rendered_frames>0,
      {timeout:12000}).catch(()=>{});
    const invitation=page.locator('#view-overview .vix-entrance-research-door');
    assert.equal(await invitation.count(),1,'New invitation must be present once');
    await invitation.scrollIntoViewIfNeeded();
    await page.evaluate(()=>document.fonts.ready);
    const baselineScrollY=await page.evaluate(()=>window.scrollY);
    const initialPanel=await invitation.screenshot({animations:'disabled'});
    await writeFile(path.join(output,name+'-invitation-before.png'),initialPanel);
    const compositor=await page.evaluate(()=>{
      const panel=document.querySelector('#view-overview .vix-entrance-research-door');
      const cloth=document.querySelector('#vixenLivingMesh');
      const mesh=window.VixenLivingMesh?.status?.()||null;
      return {
        panelZ:Number(getComputedStyle(panel).zIndex),
        clothZ:Number(getComputedStyle(cloth).zIndex),
        panelOpacity:getComputedStyle(panel).opacity,
        panelBackground:getComputedStyle(panel).backgroundImage,
        clothPosition:getComputedStyle(cloth).position,
        clothHidden:getComputedStyle(cloth).display==='none',
        clothFrameSize:[cloth.width,cloth.height],
        mesh
      };
    });
    assert(compositor.panelZ>=2&&compositor.clothZ===1,
      'New foreground card must composite ABOVE the moving canvas: '+JSON.stringify(compositor));
    assert.equal(compositor.panelOpacity,'1');
    assert.match(compositor.panelBackground,/gradient/);
    assert.equal(compositor.clothPosition,'fixed');
    assert.equal(compositor.clothHidden,false,'Keep electrical artwork alive on mobile');
    assert(compositor.clothFrameSize.every(n=>n>0),'Keep real canvas frames');
    assert.equal(compositor.mesh?.occlusion_mode,'STACKING_ONLY_NO_SCROLL_RECT_MASKS');
    assert.equal(compositor.mesh?.exclusion_count,0);
    const target=await invitation.evaluate(el=>
      Math.round(el.getBoundingClientRect().top+window.scrollY+el.offsetHeight*.4));
    const positions=[Math.max(0,target-400),target-120,target+120,target+330,target-120];
    const samples=[];
    for(let i=0;i<positions.length;i++){
      await page.evaluate(y=>window.scrollTo({top:y,behavior:'instant'}),positions[i]);
      await page.waitForTimeout(140);
      const sample=await page.evaluate(()=>{
        const el=document.querySelector('#view-overview .vix-entrance-research-door');
        const r=el.getBoundingClientRect(),s=getComputedStyle(el);
        return {
          scrollY:window.scrollY,top:r.top,bottom:r.bottom,
          opacity:s.opacity,zIndex:s.zIndex,
          mask:window.VixenLivingMesh?.status?.()?.occlusion_mode||null,
          excluded:window.VixenLivingMesh?.status?.()?.exclusion_count??null,
          route:document.body.dataset.view,
          width:document.documentElement.scrollWidth
        };
      });
      assert.equal(sample.route,'overview','Scrolling must not remount or change research rooms');
      assert.equal(sample.opacity,'1','Entrance panel must never blink away mid-scroll');
      assert.equal(sample.zIndex,'2','Foreground stack is invariant across scrolling');
      assert.equal(sample.mask,'STACKING_ONLY_NO_SCROLL_RECT_MASKS');
      assert.equal(sample.excluded,0,'No scroll-epoch canvas mask rectangle may reappear');
      assert(sample.width<=device.width+2,'No mobile horizontal overflow from field or panel');
      samples.push(sample);
      if(i===2){
        await page.screenshot({path:path.join(output,name+'-scroll-seam.png'),
          fullPage:false,animations:'disabled'});
      }
    }
    // Return to the EXACT initial scroll coordinate. Playwright's automatic
    // scrollIntoViewIfNeeded() may choose a different viewport alignment, and
    // encoded PNG buffers are not a valid stable-UI oracle across that shift.
    await page.evaluate(y=>window.scrollTo({top:y,behavior:'instant'}),baselineScrollY);
    await page.waitForTimeout(120);
    const repeatPanel=await invitation.screenshot({animations:'disabled'});
    await writeFile(path.join(output,name+'-invitation-after.png'),repeatPanel);
    const pixelDiff=await page.evaluate(async(images)=>{
      const load=b64=>new Promise((resolve,reject)=>{
        const img=new Image();img.onload=()=>resolve(img);img.onerror=reject;
        img.src='data:image/png;base64,'+b64;
      });
      const [a,b]=await Promise.all(images.map(load));
      if(a.width!==b.width||a.height!==b.height)return {changed_fraction:1,dimensions_match:false};
      const canvas=document.createElement('canvas');
      canvas.width=a.width;canvas.height=a.height;
      const ctx=canvas.getContext('2d',{willReadFrequently:true});
      ctx.drawImage(a,0,0);
      const before=ctx.getImageData(0,0,a.width,a.height).data;
      ctx.clearRect(0,0,a.width,a.height);ctx.drawImage(b,0,0);
      const after=ctx.getImageData(0,0,a.width,a.height).data;
      // Compare only the opaque INTERIOR. Border alpha and translucent
      // drop-shadows legitimately expose the time-varying field behind it.
      let changed=0,total=0;
      for(let y=Math.floor(a.height*.12);y<Math.ceil(a.height*.88);y++){
        for(let x=Math.floor(a.width*.12);x<Math.ceil(a.width*.88);x++){
          const p=(y*a.width+x)*4;
          const diff=Math.abs(before[p]-after[p])+
            Math.abs(before[p+1]-after[p+1])+Math.abs(before[p+2]-after[p+2]);
          if(diff>50)changed++;
          total++;
        }
      }
      return {changed_fraction:changed/Math.max(1,total),changed_pixels:changed,
        sampled_pixels:total,dimensions_match:true};
    },[initialPanel.toString('base64'),repeatPanel.toString('base64')]);
    assert(pixelDiff.dimensions_match&&pixelDiff.changed_fraction<=.08,
      'Opaque Entrance panel interior flickered on reduced-motion reverse scroll: '+JSON.stringify(pixelDiff));
    // The user reported the defect with NORMAL motion enabled. Re-run the
    // reversal while the actual 39-carrier field is animating; reduced-motion
    // pixel equality alone would miss a live repaint/occlusion regression.
    const liveContext=await browser.newContext({
      viewport:device,deviceScaleFactor:3,isMobile:true,hasTouch:true,
      reducedMotion:'no-preference'
    });
    const runningSamples=[];
    try{
      const livePage=await liveContext.newPage();
      const liveResponse=await livePage.goto(site,{waitUntil:'domcontentloaded',timeout:30000});
      assert.equal(liveResponse?.status(),200);
      await livePage.waitForFunction(()=>{
        const st=window.VixenLivingMesh?.status?.();
        return st?.motion==='LIVE'&&st.rendered_frames>=2 &&
          document.body.dataset.vixenMotion==='live';
      },null,{timeout:15000,polling:100});
      const startFrames=await livePage.evaluate(()=>window.VixenLivingMesh.status().rendered_frames);
      for(const y of [target+250,target-180,target+300,target-130]){
        await livePage.evaluate(y0=>window.scrollTo({top:y0,behavior:'instant'}),y);
        await livePage.waitForTimeout(160);
        const live=await livePage.evaluate(()=>({
          ...window.VixenLivingMesh.status(),
          panelZ:getComputedStyle(document.querySelector('#view-overview .vix-entrance-research-door')).zIndex
        }));
        assert.equal(live.occlusion_mode,'STACKING_ONLY_NO_SCROLL_RECT_MASKS');
        assert.equal(live.exclusion_count,0);
        assert.equal(live.panelZ,'2');
        runningSamples.push({scrollY:y,frames:live.rendered_frames,mask:live.occlusion_mode});
      }
      assert(runningSamples.at(-1).frames>startFrames,
        'Animated mobile optical cloth must keep painting during reverse scroll');
      await livePage.screenshot({path:path.join(output,name+'-animated-reverse-scroll.png'),
        fullPage:false});
    }finally{await liveContext.close()}
    witness.push({device,geom,compositor,scrollSamples:samples,animatedScrollSamples:runningSamples,errors});
    await context.close();
  }
} finally {await browser.close()}
await writeFile(path.join(output,'witness.json'),JSON.stringify({
 schema:'td613.vixen.mobile-first-screen.rgi20/v1',source_sha:head,
 human_artistic_closure:'RESERVED',witness
},null,2)+'\n');
console.log('VIXEN RGI20 MOBILE WITNESS',head,witness.map(x=>x.device.width+'x'+x.device.height).join(', '));