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
    witness.push({device,geom,errors});
    await context.close();
  }
} finally {await browser.close()}
await writeFile(path.join(output,'witness.json'),JSON.stringify({
 schema:'td613.vixen.mobile-first-screen.rgi20/v1',source_sha:head,
 human_artistic_closure:'RESERVED',witness
},null,2)+'\n');
console.log('VIXEN RGI20 MOBILE WITNESS',head,witness.map(x=>x.device.width+'x'+x.device.height).join(', '));