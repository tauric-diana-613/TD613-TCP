/**
 * Vixen source-first browser witness · PR #1730 · exact local HTTP assets.
 *
 * This is an engineering geometry and route witness, NOT a certificate
 * of scientific success or the operator's visual/artistic qualification.
 * No Universal reference is performed by the Vixen Opera.
 */
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const site = 'http://127.0.0.1:6130/encyclopedia/vix-cyb.html';
const output = path.resolve('artifacts/vixen-browser-witness');
const head = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const screens = [
  { width: 1440, height: 900, motion: 'no-preference' },
  { width: 1024, height: 768, motion: 'no-preference' },
  { width: 390, height: 844, motion: 'reduce' }
];
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const witness = [];
try {
  for (const { width, height, motion } of screens) {
    const stem = 'vixen-' + width + 'x' + height + (motion === 'reduce' ? '-reduced' : '');
    const context = await browser.newContext({
      viewport: { width, height },
      reducedMotion: motion,
      deviceScaleFactor: 1
    });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    const response = await page.goto(site, { waitUntil: 'domcontentloaded', timeout: 30000 });
    assert.equal(response?.status(), 200, 'Exact HTTP source must load');
    // User-supplied Vixen source-owned research encounter:
    // editorial interface must be navigable and stateful, not a static
    // screenshot with inoperative buttons.
    try{
      await page.waitForFunction(()=>window.VIXEN_FOYER?.mounted===true,null,{timeout:15000,polling:250});
    }catch(e){
      const diag=await page.evaluate(()=>({
        ready:document.readyState,
        foyer:!!document.querySelector('.vixen-editorial-foyer'),
        carry:!!document.getElementById('vixenCarryRail'),
        count:!!document.getElementById('vixenCarryCount'),
        native:!!document.getElementById('collectionCount'),
        vixenFoyer:window.VIXEN_FOYER?.mounted??null,
        mesh:window.VixenLivingMesh?.status?.()??null
      }));
      throw new Error('VIXEN_FOYER_STARTUP_WITNESS '+JSON.stringify(diag)+
       ' errors='+JSON.stringify(errors)+' original='+String(e));
    }
    // Vixen's signature Fox House room rail is now a true Vixen
    // route surface, not a second set of dummy links or a second router.
    const foxRail=page.locator('#vixenRoomRail');
    assert.equal(await foxRail.locator('button[data-view]').count(),8);
    assert.equal(await foxRail.isVisible(),true,
      'Every viewport must have one visible Fox House research path (left rail or mobile dock)');
    const navOrientation=await foxRail.evaluate(node=>{
      const r=node.getBoundingClientRect(),s=getComputedStyle(node);
      return {position:s.position,direction:s.flexDirection,left:r.left,bottom:innerHeight-r.bottom};
    });
    await page.waitForFunction(()=>window.VIXEN_FOX_HOUSE?.mounted===true,null,{timeout:15000});
    const declaredDock=await page.evaluate(()=>window.VIXEN_FOX_HOUSE.getState());
    assert.equal(declaredDock.source_estate,undefined,
      'An interface state receipt cannot claim source-custody ownership');
    assert.equal(navOrientation.position,'fixed');
    assert.equal(navOrientation.direction,width>=960?'column':'row',
      'Fox House navigation must reflow responsively instead of vanishing at 1280 CSS pixels');
    if(width<960)assert(navOrientation.bottom<4,'Mobile/tablet dock must sit at screen bottom');
    else assert(navOrientation.left<4,'Desktop rail must anchor left');
    assert.equal(await foxRail.locator('button[aria-current="page"]').count(),1);
    await foxRail.locator('button[data-view="works"]').click();
    const firstFrameOpacity=await page.evaluate(()=>{
      const node=document.getElementById('view-works'),style=getComputedStyle(node);
      return {opacity:style.opacity,animationName:style.animationName,hidden:node.hidden};
    });
    assert.deepEqual(firstFrameOpacity,{opacity:'1',animationName:'none',hidden:false},
      'Works must enter fully opaque on the same frame as navigation; no canvas bleed-through');
    assert.equal(await page.evaluate(()=>document.body.dataset.view),'works');
    assert.equal(await foxRail.locator('button[data-view="works"]').getAttribute('aria-current'),'page');
    // RGI24 operator screenshot regression: the SECOND Work is the real
    // title-case Algedonic PDF derivative (thousands of artificial word
    // breaks). Inspect its actual browser-rendered manuscript, not an
    // invented fixture or a decorative splash screen.
    const architectureWork=page.locator('#worksListContainer button[data-select-work]')
      .filter({hasText:/The Architecture of Control/i}).first();
    await architectureWork.click({timeout:20000});
    const workMount=page.locator('#worksExperimentAReaderMount');
    const pdfManifest=workMount.locator('[data-select-manifestation]')
      .filter({hasText:/Algedonic Systems Deep Research\.pdf/i}).first();
    await pdfManifest.waitFor({state:'visible',timeout:25000});
    await pdfManifest.click({timeout:20000});
    await page.waitForFunction(()=>{
      const doc=document.querySelector('#expaCompanionBodyPre');
      return doc?.dataset.lineation==='pdf-source-wordflow-reconstructed' &&
        doc.querySelectorAll('.vix-reader-paragraph').length>20;
    },null,{timeout:30000,polling:250});
    const manuscript=page.locator('#expaCompanionBodyPre');
    const reading=await manuscript.evaluate(el=>{
      const paragraphs=[...el.querySelectorAll('.vix-reader-paragraph')];
      const paragraphWords=paragraphs.map(p=>p.textContent.trim().split(/\s+/).length);
      const title=el.querySelector('.vix-pdf-source-title')?.textContent||'';
      const raw=el.querySelector('.vix-reader-raw pre')?.textContent||'';
      const bounds=el.getBoundingClientRect();
      const projection=el.dataset.lineation;
      return {projection,title,paragraphs:paragraphs.length,
        averageWords:paragraphWords.reduce((a,b)=>a+b,0)/Math.max(1,paragraphs.length),
        shortParagraphs:paragraphWords.filter(n=>n<=3).length,
        titleWords:title.trim().split(/\s+/).length,
        sourceCharacters:raw.length,
        manuscriptWidth:Math.round(bounds.width),
        horizontalOverflow:el.scrollWidth-el.clientWidth,
        custodyLabel:document.querySelector('#worksExperimentAReaderMount .expa-custody-disclosure summary')?.textContent||''};
    });
    assert.match(reading.title,/The Architecture of Control/i,
      'The actual PDF source title must return to a single editorial heading');
    assert(reading.paragraphs>=18&&reading.averageWords>30&&reading.shortParagraphs<=1,
      'Never render word-per-line PDF fragments: '+JSON.stringify(reading));
    assert(reading.manuscriptWidth>Math.min(width*.6,320),
      'The manuscript must own a substantial readable paper width: '+JSON.stringify(reading));
    if(reading.horizontalOverflow>2){
      const overflowEvidence=await manuscript.evaluate(root=>{
        const outer=root.getBoundingClientRect();
        const s=getComputedStyle(root);
        console.error('VIXEN_MANUSCRIPT_COLUMN_STATE',JSON.stringify({columnCount:s.columnCount,columnWidth:s.columnWidth,columnFill:s.columnFill,columns:s.columns,display:s.display,overflowX:s.overflowX,overflowY:s.overflowY}));
        return [...root.querySelectorAll('*')].map(el=>{
          const box=el.getBoundingClientRect();
          const style=getComputedStyle(el);
          return {
            tag:el.tagName, cls:String(el.className?.baseVal||el.className||'').slice(0,100),
            left:Math.round(box.left),right:Math.round(box.right),width:Math.round(box.width),
            scrollWidth:el.scrollWidth,clientWidth:el.clientWidth,
            overflowX:style.overflowX,whiteSpace:style.whiteSpace,
            sample:(el.childNodes.length===1&&el.firstChild.nodeType===3?el.textContent:'').slice(0,100)
          };
        }).filter(e=>e.right>outer.right+3 || e.width>outer.width+3 ||
            e.scrollWidth>e.clientWidth+outer.width).sort((a,b)=>(b.right-b.left)-(a.right-a.left)).slice(0,15);
      });
      console.error('VIXEN_MANUSCRIPT_OVERFLOW_DIAGNOSTIC',JSON.stringify({reading,overflowEvidence}));
    }
    assert(reading.horizontalOverflow<=2,
      'The manuscript must not create a nested horizontal scrollbar: '+JSON.stringify(reading));
    assert(reading.sourceCharacters>35000&&reading.custodyLabel.includes('Source integrity'),
      'Complete exact original derivative must remain available in its disclosure');
    // RGI26: test actual computed pixels; source and presentation stay separate.
    // Inspect visible reader and density/page controls, not unused historical CSS.
    const noirWitness=await manuscript.evaluate(el=>{
      const style=getComputedStyle(el);
      const first=el.querySelector('.vix-reader-paragraph');
      const ps=first?getComputedStyle(first):null;
      const paint=el.getBoundingClientRect();
      return {background:style.backgroundImage,backgroundColor:style.backgroundColor,textColor:style.color,columnCount:style.columnCount,columnWidth:style.columnWidth,
        fontSize:parseFloat(style.fontSize),lineHeight:parseFloat(style.lineHeight),
        firstLineHeight:ps?parseFloat(ps.lineHeight):0,
        paragraphMargin:ps?parseFloat(ps.marginBottom):0,
        width:paint.width,padding:parseFloat(style.paddingLeft),
        density:el.dataset.folioDensity,
        pageControls:!!document.getElementById('vixFolioNext'),
        footer:!!document.querySelector('.vix-folio-footer')};
    });
    assert(['auto','1'].includes(noirWitness.columnCount),'Manuscripts must not fragment into horizontal CSS columns');
    const readerChannels=(noirWitness.backgroundColor.match(/\d+/g)||[]).slice(0,3).map(Number);
    assert.equal(readerChannels.length,3,'Reader background RGB must be observable');
    assert(readerChannels.every(channel=>channel>=235),
      'New Opera literary manuscript must own warm opaque paper: '+JSON.stringify(noirWitness));
    assert(noirWitness.fontSize>=14.8&&noirWitness.fontSize<=18,
      'Compact editorial manuscript font must be legible: '+JSON.stringify(noirWitness));
    assert(noirWitness.paragraphMargin<=18&&noirWitness.padding<=48&&noirWitness.pageControls&&noirWitness.footer,
      'Opera reader must use restrained spacing and retain actual controls: '+JSON.stringify(noirWitness));
    await workMount.locator('button[data-folio-density="comfort"]').click();
    assert.equal(await manuscript.getAttribute('data-folio-density'),'comfort');
    assert.equal(await workMount.locator('button[data-folio-density="comfort"]').getAttribute('aria-pressed'),'true');
    await workMount.locator('button[data-folio-density="compact"]').click();
    assert.equal(await manuscript.getAttribute('data-folio-density'),'compact');
    // RGI27/28 are natural document-flow readers: page the browser window,
    // preserving original source and real PREVIOUS/NEXT handler behavior.
    await manuscript.evaluate(el=>window.scrollTo({
      top:Math.max(0,window.scrollY+el.getBoundingClientRect().top-116),behavior:'instant'
    }));
    const beforeScroll=await page.evaluate(()=>window.scrollY);
    await workMount.locator('#vixFolioNext').evaluate(el=>el.click());
    await page.waitForTimeout(320);
    const afterScroll=await page.evaluate(()=>window.scrollY);
    assert(afterScroll>beforeScroll+20,'NEXT must advance the visible page through the manuscript');
    await workMount.locator('#vixFolioPrevious').evaluate(el=>el.click());
    await page.waitForTimeout(320);
    assert((await page.evaluate(()=>window.scrollY))<afterScroll,
      'PREVIOUS must return toward the manuscript start');
    await page.evaluate(()=>{
      const n=document.querySelector('#expaCompanionBodyPre');
      n.scrollTop=0;
      window.scrollTo({top:Math.max(0,window.scrollY+n.getBoundingClientRect().top-125),behavior:'instant'});
    });
    await page.waitForTimeout(125);
    await page.screenshot({
      path:path.join(output,stem+'-rgi24-architecture-pdf-manuscript.png'),
      fullPage:false,animations:'disabled',timeout:60000
    });
    if(width>800){
      const focus=workMount.locator('#expaReaderFocusButton');
      await focus.click();
      assert.equal(await page.locator('#worksLexiconLayout').getAttribute('data-reading-focus'),'true',
        'Full-width reading atelier must remain user-operable and source-preserving');
      await page.evaluate(()=>{
        const n=document.querySelector('#expaCompanionBodyPre');
        n.scrollTop=0;
        window.scrollTo({top:Math.max(0,window.scrollY+n.getBoundingClientRect().top-126),behavior:'instant'});
      });
      await page.screenshot({
        path:path.join(output,stem+'-rgi24-architecture-focus-atelier.png'),
        fullPage:false,animations:'disabled',timeout:60000
      });
      await focus.click();
      assert.equal(await page.locator('#worksLexiconLayout').getAttribute('data-reading-focus'),'false');
    }
    // RGI23 three-room editorial self-review: actual buttons and disclosure
    // affordances, not merely static CSS/HTML snapshots.
    for(const room of ['works','gates','holds']){
      if(room!=='works')await foxRail.locator('button[data-view="'+room+'"]').click();
      const view=page.locator('#view-'+room);
      await view.locator('.vix-couture-route-guide h2').waitFor({state:'visible',timeout:10000});
      assert.equal(await view.locator('.vix-route-stage').count(),3,
        room+' route must present exactly three readable evidentiary operations');
      const disclosure=view.locator('.vix-couture-route-guide .vix-route-custody').first();
      await disclosure.locator('summary').click();
      assert.notEqual(await disclosure.getAttribute('open'),null,
        room+' custody disclosure must work with real input');
      await disclosure.locator('summary').click();
      const surface=await view.evaluate(el=>{
        const guide=el.querySelector('.vix-couture-route-guide');
        const heading=el.querySelector('.view-heading');
        const r=guide.getBoundingClientRect();
        return {guideWidth:r.width,documentWidth:document.documentElement.scrollWidth,
          guideZ:Number(getComputedStyle(guide).zIndex),
          meshZ:Number(getComputedStyle(document.querySelector('#vixenLivingMesh')).zIndex),
          headingBackground:getComputedStyle(heading).backgroundImage};
      });
      assert(surface.guideWidth>250&&surface.documentWidth<=width+1,
        room+' couture surface must not overflow: '+JSON.stringify(surface));
      assert(surface.guideZ>surface.meshZ,
        room+' source-reading guide must paint ABOVE the ambient optical field: '+JSON.stringify(surface));
      assert(!/rgb\(60,\s*20,\s*60\)/.test(surface.headingBackground),
        room+' heading should not regress to plum');
      if(room==='holds'){
        const ink=await view.locator('.holds-grid>.hold-panel:first-child>p').evaluate(el=>getComputedStyle(el).color);
        assert.equal(ink,'rgb(245, 238, 225)',
          'Refusals bounded-tie explanation must have legible light ink on dark couture panel');
      }
      await view.locator('.vix-couture-route-guide').scrollIntoViewIfNeeded();
      await page.screenshot({
        path:path.join(output,stem+'-rgi23-'+room+'-couture.png'),
        fullPage:false,animations:'disabled',timeout:60000
      });
    }
        await foxRail.locator('button[data-view="overview"]').click();
    assert.equal(await page.evaluate(()=>document.body.dataset.view),'overview');
    assert.equal(await foxRail.locator('button[data-view="works"]').getAttribute('aria-current'),null);
    if(width<960){
      await page.locator('#menuToggle').click();
      await page.locator('#mobileNav button[data-view="holds"]').click();
      await page.waitForFunction(()=>{
        const dock=document.querySelector('#vixenRoomRail');
        return dock.scrollLeft>20&&dock.querySelector('button[data-view="holds"]')?.getAttribute('aria-current')==='page';
      },null,{timeout:6000});
      await foxRail.locator('button[data-view="overview"]').click();
      assert.equal(await page.evaluate(()=>document.body.dataset.view),'overview');
    }
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,
      'The independent Fox House room rail must not add horizontal overflow');
    const foyer=page.locator('.vixen-editorial-foyer');
    assert.equal(await foyer.locator('button[data-view]').count(),4,
      'Four callable research-doorway entrances missing');
    assert.equal(await foyer.isVisible(),true);
    const genre=await page.evaluate(()=>{
      const f=document.querySelector('.vixen-editorial-foyer');
      return {
        display:getComputedStyle(document.querySelector('.vixen-doorways')).display,
        overflow:document.documentElement.scrollWidth-innerWidth,
        active:window.VIXEN_FOYER?.getState?.(),
        label:f.querySelector('h2')?.textContent,
        inheritedRuntime:!!window.VIXEN_STUDY_TRAY
      };
    });
    assert.equal(genre.display,'grid','Vixen invitation must be spatial and interactive');
    assert(genre.overflow<=1,'Editorial foyer must not cause horizontal overflow');
    assert.equal(genre.active?.source_estate,'EMSTD613');
    assert.equal(genre.active?.doorways?.length,4);
    assert.equal(genre.inheritedRuntime,true,'Source study tray must remain native owner');
    assert.equal(await page.locator('#vixenCarryRail').isHidden(),true,
      'The empty research-cart panel must not obscure editorial invitations');
    // Visual qualification begins with the operator's ORIGINAL image.
    // A screenshot scrolled to the secondary foyer cannot be called a
    // frontispiece/entrance witness or substitute for the Mugler artwork.
    const hero=page.locator('#view-overview > #cover');
    const originalArt=hero.locator('.hero-art img');
    await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
    await page.waitForTimeout(200);
    assert.equal(await hero.isVisible(),true,'Original Mugler frontispiece missing');
    const img=await originalArt.evaluate(node=>({
      complete:node.complete,width:node.naturalWidth,height:node.naturalHeight,
      alt:node.alt,visible:node.getBoundingClientRect().height>100,
      source:node.currentSrc.slice(0,35)
    }));
    assert(img.complete&&img.width>=300&&img.height>=300&&img.visible,
      'Original embedded Mugler sculpture must render in the first viewport: '+JSON.stringify(img));
    assert(img.alt.includes('Mugler-unchained chromepunk'));
    const artRoute=await page.evaluate(()=>{
      const stage=document.body.dataset.vixenFrontispieceSource;
      const rendered=document.querySelector('.hero-art img[data-vixen-asset-role="desktop"]');
      const mobile=document.querySelector('.hero-art source[data-vixen-asset-role="mobile"]');
      return {
        stage,mobileRoute:mobile?.getAttribute('srcset')||'',
        desktopRoute:rendered?.getAttribute('src')||'',
        current:rendered?.currentSrc||'',
        renderedFilter:rendered?getComputedStyle(rendered).filter:null,
        objectFit:rendered?getComputedStyle(rendered).objectFit:null
      };
    });
    assert(artRoute.mobileRoute&&artRoute.desktopRoute,'Two independent frontispiece routes required');
    if(artRoute.stage==='embedded-historical'){
      assert(artRoute.mobileRoute.startsWith('data:image/webp;base64,'));
      assert(artRoute.desktopRoute.startsWith('data:image/webp;base64,'));
    }else{
      assert.equal(artRoute.stage,'external-selected','Unknown frontispiece custody stage');
      assert(artRoute.desktopRoute.endsWith('/assets/vixen/frontispiece-desktop.png'));
      assert(artRoute.mobileRoute.endsWith('/assets/vixen/frontispiece-mobile.png'));
      const selected=width<=680?'mobile':'desktop';
      assert(new URL(artRoute.current).pathname.endsWith(`/assets/vixen/frontispiece-${selected}.png`),
        `Expected the ${selected} frontispiece at ${width} CSS pixels`);
      assert.equal(artRoute.objectFit,'contain','The frontispiece must fit without cropping');
      assert.equal(artRoute.renderedFilter,'none',
        'Operator-selected pink/champagne backglow must not be desaturated by couture CSS');
    }
    // The logo is genuinely one external SVG in both mastheads. Check rendered
    // color on the actual pink and graphite backgrounds at native header scale.
    const foxChromatic=await page.evaluate(async()=>{
      const x=document.querySelector(innerWidth<=680
        ?'.brand-mobile-logo .vixen-fox-emblem'
        :'.brand-desktop-lockup .vixen-fox-emblem');
      if(!x)return {ready:false};
      if(!x.complete)await new Promise(resolve=>{x.addEventListener('load',resolve,{once:true});x.addEventListener('error',resolve,{once:true})});
      const size=innerWidth<=680?38:42;
      const c=document.createElement('canvas');c.width=size;c.height=size;
      const ctx=c.getContext('2d',{willReadFrequently:true});
      ctx.fillStyle='#FF91AF';ctx.fillRect(0,0,size,size);
      ctx.drawImage(x,0,0,size,size);
      const rgba=ctx.getImageData(0,0,size,size).data;
      let yellow=0;
      for(let j=0;j<rgba.length;j+=4)
        if(rgba[j]>175&&rgba[j+1]>174&&rgba[j+2]<200&&
           rgba[j]>=rgba[j+1]*.95&&rgba[j+1]>rgba[j+2]*1.24)yellow++;
      return {ready:x.complete&&x.naturalWidth>0,source:x.getAttribute('src'),
        yellowPixels:yellow,filter:getComputedStyle(x).filter};
    });
    assert(foxChromatic.ready,'Standalone SVG logo failed to render');
    assert.equal(foxChromatic.source,'./assets/vixen/fox-arcflash.svg');
    assert(foxChromatic.yellowPixels>4,
      'Fox eye pixels must render Arc Flash yellow on pink at actual masthead size: '+JSON.stringify(foxChromatic));
    const topHero=await hero.boundingBox();
    assert(topHero&&topHero.y<160&&topHero.height>=600,
      'The real frontispiece must own the initial viewport');
    // Verify frontispiece clearance, Didone thesis framing, non-boilerplate subtitle,
    // and scroll-locked DOM stacking (cards strictly above #vixenLivingMesh).
    const coverGeometry=await page.evaluate(()=>{
      const w1=document.querySelector('#cover .cover-word-one');
      const w2=document.querySelector('#cover .cover-word-two');
      const cover=document.querySelector('#cover');
      const sub=document.querySelector('#synthPatternSubtitle');
      const heroDesc=document.querySelector('#synthHeroStatement');
      const enter=document.querySelector('#cover .cover-enter');
      const orbit=document.querySelector('#cover .enter-orbit');
      const rW1=w1?.getBoundingClientRect();
      const rW2=w2?.getBoundingClientRect();
      const rCover=cover?.getBoundingClientRect();
      const rSub=sub?.getBoundingClientRect();
      const rDesc=heroDesc?.getBoundingClientRect();
      const rEnter=enter?.getBoundingClientRect();
      const rOrbit=orbit?.getBoundingClientRect();
      const descStyle=heroDesc?getComputedStyle(heroDesc):null;
      const enterTargetBottom=rOrbit?rOrbit.top:rEnter?.top;
      return {
        subtitleText:sub?.textContent?.trim()||'',
        heroFont:descStyle?.fontFamily||'',
        heroFontSize:parseFloat(descStyle?.fontSize||'0'),
        heroLineHeight:parseFloat(descStyle?.lineHeight||'0'),
        word2ToEnterGap:rW2&&enterTargetBottom!==undefined?Math.round(enterTargetBottom-rW2.bottom):null,
        subToEnterGap:rSub&&rEnter?Math.round(rEnter.top-rSub.bottom):null,
        titleFirstFraction:rCover&&rW1?(rW1.top-rCover.top)/rCover.height:null,
        titleSecondFraction:rCover&&rW2?(rW2.bottom-rCover.top)/rCover.height:null,
        word2ToThesisGap:rW2&&rDesc?Math.round(rDesc.top-rW2.bottom):null,
        titleAlignment:rW2?getComputedStyle(w2.parentElement).justifyContent:null,
        descFloorGap:rDesc?Math.round(innerHeight-rDesc.bottom):null,
        descToEnterHorizGap:rDesc&&rEnter?Math.round(rEnter.left-rDesc.right):null
      };
    });
    assert.equal(/\bTHE\s+ARCHITECTURE\s+OF\b/i.test(coverGeometry.subtitleText),false,
      'Rendered cover subtitle must come from computational synthesis without generic boilerplate: '+coverGeometry.subtitleText);
    assert(coverGeometry.word2ToEnterGap>=22&&coverGeometry.subToEnterGap>=20,
      'Cover CYBERNETICS / subtitle block must stay cleanly clear above Enter the Opera: '+JSON.stringify(coverGeometry));
    if(width<=680){
      assert.equal(coverGeometry.titleAlignment,'space-between',
        'Mobile VIXEN and CYBERNETICS must occupy separate cover ends: '+JSON.stringify(coverGeometry));
      assert(coverGeometry.titleFirstFraction<.22&&coverGeometry.titleSecondFraction>.66&&coverGeometry.titleSecondFraction<.86,
        'Mobile CYBERNETICS must return to the lower cover, with VIXEN near masthead: '+JSON.stringify(coverGeometry));
      assert(coverGeometry.word2ToThesisGap>=12,
        'Mobile subtitle must clear the thesis, not cover it: '+JSON.stringify(coverGeometry));
    }
    if(width>680){
      assert(coverGeometry.descFloorGap>=18,
        'Desktop editorial thesis must lift cleanly off bottom viewport floor: '+JSON.stringify(coverGeometry));
      assert(coverGeometry.heroFontSize>=16,
        'Desktop couture Didone thesis typography expected >=16px, got '+coverGeometry.heroFontSize);
    }
    await page.screenshot({
      path:path.join(output,'vixen-'+width+'x'+height+'-mugler-chromepunk-frontispiece.png'),
      fullPage:false
    });
    // The public Entrance now invites inquiry; the candidate cards live in
    // the source-first Salon, never behind a rollback panel on the frontispiece.
    assert.equal(await page.locator('#view-overview #ciSynthesisLogList').count(),0);
    assert.equal(await page.locator('#view-overview #ciCandidateGrid').count(),0);
    assert.equal(await page.locator('#view-overview #ciMetricVernier').count(),0);
    await page.locator('#vixenRoomRail button[data-view="collection"]').click();
    assert.equal(await page.evaluate(()=>document.body.dataset.view),'collection');
    // Exercise #constitutiveInquiry ranked candidate scoring inside Salon and
    // verify the active wheel-scroll lock on its instrument cards.
    const scrollAudit=await page.evaluate(async()=>{
      const iq=document.getElementById('constitutiveInquiry');
      const mesh=document.getElementById('vixenLivingMesh');
      const card=document.querySelector('#constitutiveInquiry .ci-card');
      const cardsCount=document.querySelectorAll('#ciCandidateGrid .ci-candidate-card').length;
      const startTop=card.getBoundingClientRect().top;
      const startScroll=window.scrollY;
      window.scrollTo({top:startScroll+520,behavior:'instant'});
      await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
      const endTop=card.getBoundingClientRect().top;
      const actualDelta=window.scrollY-startScroll;
      const measuredShift=startTop-endTop;
      return {
        iqPresent:!!iq,
        cardsCount,
        meshZ:mesh?Number(getComputedStyle(mesh).zIndex||0):null,
        cardZ:iq?Number(getComputedStyle(iq).zIndex||getComputedStyle(card).zIndex||0):null,
        actualDelta,
        driftPx:Math.abs(measuredShift-actualDelta)
      };
    });
    assert(scrollAudit.cardsCount>=4,'Ranked computational candidates must populate #ciCandidateGrid');
    assert(scrollAudit.driftPx<2,'DOM cards must track scroll delta accurately without background drift: '+JSON.stringify(scrollAudit));
    if(scrollAudit.meshZ!==null&&Number.isFinite(scrollAudit.cardZ)){
      assert(scrollAudit.cardZ>scrollAudit.meshZ,'Cards must composite above #vixenLivingMesh: '+JSON.stringify(scrollAudit));
    }
    // RGI25: browser must show distinct Vixen/TD613 source analysis without
    // copying a podium event or exposing operator-only method acronyms.
    const cardAudit=await page.locator('#ciCandidateGrid').evaluate(el=>{
      const cards=[...el.querySelectorAll('.ci-candidate-card')];
      const data=cards.map(card=>({
        id:card.dataset.candidateId,
        title:card.querySelector('.ci-conj-title')?.textContent||'',
        subtitle:card.querySelector('.ci-candidate-subtitle')?.textContent||'',
        prose:card.querySelector('.ci-conj-body')?.textContent||'',
        score:card.querySelector('.ci-cand-score')?.textContent||'',
        axes:card.querySelectorAll('.ci-axis').length,
        details:card.querySelectorAll('details.ci-candidate-explanation').length
      }));
      return {cards:data,publicText:el.innerText,
        keyCount:document.querySelectorAll('.ci-candidate-key span').length};
    });
    assert(cardAudit.cards.length>=8,'Multi-axis Vixen candidate ranking must render');
    assert.equal(cardAudit.keyCount,5,'A visible scoring legend must explain the reading order');
    assert(cardAudit.cards.every(c=>c.axes===8&&c.details===1),
      'Every candidate must expose all eight weighted axes and a test question');
    assert(cardAudit.cards.some(c=>c.id==='cand-vixen-documentary-route'),
      'TD613 documentary route analysis must be a native candidate, not an SRC attribution');
    assert(cardAudit.cards.every(c=>!/\bSRC\b|\bFADT\b|SignalRupture/i.test(c.title+' '+c.subtitle+' '+c.prose)),
      'Public candidate descriptions must define concepts without leaking internal agent acronyms');
    const texts=cardAudit.cards.map(c=>c.subtitle+'|'+c.prose);
    assert.equal(new Set(texts).size,texts.length,
      'Distinct scored hypotheses must never be identical boilerplate');
    assert(cardAudit.cards.every(c=>/\d+\.\d%/.test(c.score)),
      'Weighted numeric rankings must be retained as rubric scores');
    await page.locator('#ciCandidateGrid details.ci-candidate-explanation summary').first().click();
    assert.equal(await page.locator('#ciCandidateGrid details.ci-candidate-explanation').first().getAttribute('open'),'',
      'Scientific rationale must be accessible through an interactive disclosure');
    await page.screenshot({
      path:path.join(output,stem+'-rgi25-ranked-proposals-no-boilerplate.png'),
      fullPage:false,animations:'disabled',timeout:60000
    });
    await page.locator('#ciCandidateGrid details.ci-candidate-explanation summary').first().click();
    await page.locator('#vixenRoomRail button[data-view="overview"]').click();
    await foyer.scrollIntoViewIfNeeded();
    await page.waitForTimeout(100);
    await page.screenshot({
      path:path.join(output,'vixen-'+width+'x'+height+'-fox-house-research-console.png'),
      fullPage:false
    });
    await foyer.locator('button[data-view="works"]').click();
    assert.equal(await page.evaluate(()=>document.body.dataset.view),'works',
      'Meet the research must enter the original Work catalogue');
    const carry=await page.evaluate(()=>{
      const corpus=JSON.parse(document.querySelector('#vixen-corpus-bundle').textContent);
      const id=corpus.works[0].work_id;
      window.VIXEN_STUDY_TRAY.add(id);
      return id;
    });
    await page.waitForFunction(()=>{
      return window.VIXEN_FOYER?.getState?.().carried_items===1;
    },null,{timeout:4000});
    assert.equal(await page.locator('#vixenCarryCount').textContent(),'1');
    if(width>680){
      assert.equal(await page.locator('#vixenCarryRail').isVisible(),true,
        'A newly carried source Work should make the research cart discoverable');
    }else{
      assert.equal(await page.locator('#vixenCarryRail').isHidden(),true,
        'The mobile navigation owns the cart route; avoid a content-obscuring overlay');
    }
    await page.evaluate(id=>window.VIXEN_STUDY_TRAY.remove(id),carry);
    await page.waitForFunction(()=>{
      return window.VIXEN_FOYER?.getState?.().carried_items===0;
    },null,{timeout:4000});
    await page.locator('#menuToggle').click();
    await page.locator('#mobileNav button[data-view="overview"]').click();
    assert.equal(await page.evaluate(()=>document.body.dataset.view),'overview');
    // RGI09 · Live mathematical Observatory is the principal performance,
    // not an artist's mockup, a package manifest or a copied foreign Opera.
    await page.locator('#menuToggle').click();
    await page.locator('#mobileNav button[data-view="observatory"]').click();
    await page.waitForFunction(()=>{
      const api=window.VIXEN_ELECTRIC_FOUNDRY;
      return api&&api.status().backend!=='PENDING';
    },null,{timeout:25000});
    const wardrobe=page.locator('#formulaFolioGrid');
    const archiveCensus=await page.evaluate(()=>{
      const records=JSON.parse(document.querySelector('#vixen-corpus-bundle').textContent).formula_folios;
      return {total:records.length,technical:records.filter(x=>x.group==='couture').length};
    });
    assert.deepEqual(archiveCensus,{total:22,technical:14},
      'Technical formula archive remains intact but cannot be substituted as original mathematics');
    await page.waitForFunction(()=>{
      const label=document.querySelector('#formulaCountLabel')?.textContent||'';
      return /Works with verified mathematical passages|SOURCE VERIFICATION HELD/.test(label);
    },null,{timeout:60000});
    const sourceCountText=await page.locator('#formulaCountLabel').innerText();
    assert.doesNotMatch(sourceCountText,/SOURCE VERIFICATION HELD/,
      'Manuscript source reader must load verified original Work bodies without fallback');
    const allVerified=wardrobe.locator('.formula-card[data-work-math-id]');
    const verifiedCount=await allVerified.count();
    assert(verifiedCount>0,'Original Work math wardrobe must show independently verified source passages');
    const provenance=await allVerified.evaluateAll(nodes=>nodes.map(node=>({
      id:node.getAttribute('data-work-math-id'),
      passage:node.querySelector('[data-original-math-passage]')?.textContent||'',
      links:[...node.querySelectorAll('[data-open-ref]')].map(n=>n.getAttribute('data-open-ref')),
      source:node.textContent
    })));
    const recordedIds=await page.evaluate(()=>JSON.parse(
      document.querySelector('#vixen-corpus-bundle').textContent
    ).works.map(w=>w.work_id));
    for(const item of provenance){
      assert(recordedIds.includes(item.id),'Wardrobe Work ID must exist in original corpus: '+item.id);
      assert.match(item.id,/^emwork_[0-9a-f]{24}$/);
      assert(item.passage.trim().length>2,'Verified original source passage must be visible');
      assert(item.links.includes(item.id),'Original manuscript reader must be directly reachable');
      assert.match(item.source,/derivative SHA-256:/);
      assert.doesNotMatch(item.source,/HOST_ENGINEERING_AS_AUTHORSHIP/);
    }
    assert.equal(await wardrobe.locator('[data-folio-id]').count(),0,
      'No TCC/RC technical formula may masquerade as an original Work card');
    assert.equal(await wardrobe.locator('.formula-card:visible').count(),Math.min(4,verifiedCount),
      'Original manuscript gallery opens with at most four verified entries');
    const galleryReveal=page.locator('#formulaGalleryReveal');
    await page.evaluate(()=>{
      const node=document.querySelector('.formula-gallery-intro');
      window.scrollTo({top:Math.max(0,window.scrollY+node.getBoundingClientRect().top-110),behavior:'instant'});
    });
    await page.waitForFunction(()=>!document.querySelector('#vixenToast')?.classList.contains('visible'),null,{timeout:15000,polling:250});
    const wasStill=await page.locator('#motionBtn').getAttribute('aria-pressed');
    if(wasStill!=='true')await page.evaluate(()=>document.getElementById('motionBtn').click());
    try{
      await page.screenshot({path:path.join(output,stem+'-math-wardrobe-featured.png'),
        fullPage:false,animations:'disabled',timeout:60000});
    }finally{
      if(wasStill!=='true')await page.evaluate(()=>document.getElementById('motionBtn').click());
    }
    if(verifiedCount>4){
      assert.equal(await galleryReveal.isVisible(),true);
      await galleryReveal.click();
      assert.equal(await wardrobe.locator('.formula-card:visible').count(),verifiedCount);
      assert.equal(await galleryReveal.getAttribute('aria-expanded'),'true');
      await galleryReveal.click();
    }else{
      assert.equal(await galleryReveal.isHidden(),true);
    }
    assert.equal(await wardrobe.locator('.formula-card:visible').count(),Math.min(4,verifiedCount));
    const firstMathWorkId=provenance[0].id;
    await page.locator('#formulaSearchInput').fill('RC-07');
    assert.equal(await wardrobe.locator('.formula-card:visible').count(),0,
      'Host engineering catalogue IDs cannot produce fabricated original math entries');
    await page.locator('#formulaSearchInput').fill('TCC-08');
    assert.equal(await wardrobe.locator('.formula-card:visible').count(),0,
      'Title-locus ornament cannot impersonate an original Work');
    await page.locator('#formulaSearchInput').fill(firstMathWorkId);
    assert.equal(await wardrobe.locator('.formula-card:visible').count(),1,
      'Filtering by exact original Work coordinate must be deterministic');
    const selected=wardrobe.locator('.formula-card[data-work-math-id="'+firstMathWorkId+'"]');
    await selected.locator('[data-compute-original-work]').click();
    await page.waitForFunction(id=>{
      const p=document.querySelector('[data-work-math-id="'+id+'"] [data-vixen-computation]');
      return p&&!p.hidden&&/ORIGINAL WORK · SOURCE-CONDITIONED SYNTHESIS|COMPUTATION HELD/.test(p.textContent);
    },firstMathWorkId,{timeout:30000});
    const scoredText=await selected.locator('[data-vixen-computation]').innerText();
    assert.match(scoredText,/ORIGINAL WORK · SOURCE-CONDITIONED SYNTHESIS/,
      'A verified original passage must actually trigger source-conditioned candidate ranking');
    assert.match(scoredText,/Scientific credit 0/);
    assert.match(scoredText,/not source-specific proof, an executed native-host engine/);
    await page.locator('#formulaSearchInput').fill('');
    assert.equal(await wardrobe.locator('.formula-card:visible').count(),Math.min(4,verifiedCount));
    // The Foundry remains an optically real but separate host-level stage.
    assert.equal(await page.evaluate(()=>window.VIXEN_ELECTRIC_FOUNDRY.selectLab('LAB_TCC-08')),true,
      'Retain bounded historical title-locus visualization without granting primary authorship');
    const foundry=page.locator('#vixenElectricFoundry');
    assert.equal(await foundry.locator('.ef-gallery-tab').count(),2,'Technical RC archive cannot be public Foundry tab');
    assert.equal(await foundry.locator('.ef-hero-tab[data-lab-id^="LAB_RC-"]').count(),0,'No RC apparatus headlines Opera');
    const rcRefusal=await page.evaluate(()=>window.VIXEN_ELECTRIC_FOUNDRY.selectLab('LAB_RC-07'));
    assert.equal(rcRefusal,false,'Public stage API must reject exact RC technical instrument');
    assert.match(await foundry.locator('.ef-sourcebadge').first().innerText(),/NOT A PRIMARY WORK|PROSPECTIVE TRACK|VIXEN TITLE-LOCUS PROBE · NO THEOREM/,
      'A staged eighth folio must retain its source title-locus ceiling without being excluded');
    assert.equal(await foundry.locator('.ef-hero-tab').count(),6,
      'Six art-directed flagship experiences rather than twenty-eight nominal visual demos');
    assert.equal(await foundry.locator('.ef-proscenium .ef-aria-score .ef-hero-tab').count(),6,
      'Six curated research presentations occupy the editorial rail; the full source catalogue stays independently accessible');
    assert.equal(await foundry.locator('.ef-hero-tab[aria-pressed="true"]').count(),0,
      'An unfeatured source remains staged without impersonating a curated aria');
    assert.match(await foundry.locator('.ef-gallery-item[aria-pressed="true"]').innerText(),/TCC-08/,
      'The source catalogue must preserve the exact active eighth record');
    assert.equal(await page.evaluate(()=>window.VIXEN_ELECTRIC_FOUNDRY.selectLab('LAB_TCC-01')),true,
      'Explicitly return to the original featured control-plane aria before measuring its curated rail');
    assert.equal(await foundry.locator('.ef-readout').isHidden(),true,
      'The technical evidence inspector must not permanently compete with the artwork');
    const opticalCouture=await foundry.evaluate(el=>{
      const r=e=>e.getBoundingClientRect();
      const tabs=[...el.querySelectorAll('.ef-hero-tab')];
      const badges=[...el.querySelectorAll('.ef-scene-badge')];
      const stage=el.querySelector('.ef-stage');
      const railText=el.querySelector('.ef-rail-display-headline');
      const buttons=[...el.querySelectorAll('.ef-toolbar button')];
      return {
        tabCount:tabs.length,
        active:tabs.filter(x=>x.getAttribute('aria-pressed')==='true').length,
        markers:tabs.filter(x=>getComputedStyle(x,'::after').content.includes('◀')).length,
        selectedBorder:getComputedStyle(tabs.find(x=>x.getAttribute('aria-pressed')==='true')).borderTopColor,
        railTitle:railText?.textContent||'',
        railTitleVisible:!!railText&&r(railText).width>60&&r(railText).height>40,
        pseudoTitle:getComputedStyle(el.querySelector('.ef-aria-score>.ef-kicker'),'::before').content,
        toolbarHeights:buttons.map(x=>Math.round(r(x).height)),
        toolbarColors:buttons.map(x=>getComputedStyle(x).backgroundImage),
        badgeBelowStage:badges.length===1&&r(badges[0]).top>=r(stage).bottom-2,
        composerHidden:el.querySelector('.ef-composer-review')?.hidden===true
      };
    });
    assert.equal(opticalCouture.active,1,'Exactly one aria must be selected');
    assert.equal(opticalCouture.markers,1,'Exactly one magenta selection arrow permitted');
    assert.equal(opticalCouture.railTitleVisible,true,'Engine-fed headline must be readable as text');
    assert.match(opticalCouture.railTitle,/Crossed probes|source-recorded arias|Vixen inquiry arias/i);
    assert.equal(opticalCouture.pseudoTitle,'none','CSS-generated engine title must be suppressed');
    assert.equal(opticalCouture.badgeBelowStage,true,
      'Live simulation label must be below, never overlay, the computed visual field');
    assert.equal(opticalCouture.composerHidden,true,'A dormant Composer bar must not consume stage space');
    assert(opticalCouture.toolbarHeights.length===5,'Five native dashboard controls remain');
    assert(Math.max(...opticalCouture.toolbarHeights)-Math.min(...opticalCouture.toolbarHeights)<=4,
      'Proof control must share a uniform button height: '+JSON.stringify(opticalCouture));
    assert.equal(new Set(opticalCouture.toolbarColors).size,1,
      'Proof must share the same button material rather than a pale special control');
    assert.notEqual(opticalCouture.selectedBorder,'rgb(250, 255, 255)',
      "Selected aria border may not remain pale silver");
        assert.equal(await foundry.locator('.ef-inspector-switch').getAttribute('aria-expanded'),'false');
    const stageTopology=await foundry.locator('.ef-proscenium').evaluate(n=>({
      columns:getComputedStyle(n).gridTemplateColumns.split(' ').length,
      stage:n.querySelector('.ef-stage').getBoundingClientRect().width,
      score:n.querySelector('.ef-aria-score').getBoundingClientRect().width
    }));
    assert(stageTopology.stage>0&&stageTopology.score>0,'Art and score must share one intentional stage geometry');
    if(width>=741)assert.equal(stageTopology.columns,2,'Desktop receives an asymmetric, composed mathematical stage');
    await foundry.locator('.ef-inspector-switch').click();
    assert.equal(await foundry.locator('.ef-readout').isVisible(),true,'Intentional proof reveal must work');
    assert.equal(await foundry.locator('.ef-inspector-switch').getAttribute('aria-expanded'),'true');
    await foundry.locator('.ef-inspector-switch').click();
    assert.equal(await foundry.locator('.ef-readout').isHidden(),true,'The evidence curtain must close safely');
    const dials=foundry.locator('.ef-dial-cabinet');
    assert.equal(await dials.getAttribute('open'),null,'The synthetic control cabinet begins gracefully folded');
    await dials.locator('summary').click();
    assert.notEqual(await dials.getAttribute('open'),null,'Operator can unfold and manipulate the original model controls');
    assert.equal(await dials.locator('[data-foundry-dial]').count(),4);
    await dials.locator('summary').click();
    assert.equal(await dials.getAttribute('open'),null,'Research instrument controls return to a folded state');

    assert.equal(await foundry.locator('.ef-carrier').count(),39);
    assert.equal(await foundry.locator('[data-foundry-dial]').count(),4);
    assert.equal(await page.locator('#view-observatory').getAttribute('data-foundry-mounted'),'true');
    assert.equal(await foundry.locator('.ef-canvas').isVisible(),true);
    assert.equal(await foundry.locator('.ef-notation').count(),1,
      'A distinct source-native computed mathematical score must be mounted');
    const roomMesh=foundry.getByRole('button',{name:'ROOM MESH'});
    await page.waitForFunction(()=>window.VixenLivingMesh?.status()?.route==='observatory');
    assert.equal(await roomMesh.getAttribute('aria-pressed'),'true');
    await roomMesh.click();
    assert.equal(await roomMesh.getAttribute('aria-pressed'),'false');
    await page.locator('#vixenLivingMesh').waitFor({state:'hidden'});
    await roomMesh.click();
    assert.equal(await roomMesh.getAttribute('aria-pressed'),'true');
    await page.locator('#vixenLivingMesh').waitFor({state:'visible'});
    const firstScore=await page.evaluate(()=>{
      const node=document.querySelector('#vixenElectricFoundry .ef-notation');
      const ctx=node.getContext('2d');
      const data=ctx.getImageData(0,0,node.width,node.height).data;
      let lit=0;
      for(let i=3;i<data.length;i+=404)if(data[i]>20)lit++;
      return {width:node.width,height:node.height,lit,signature:node.toDataURL('image/png')};
    });
    assert(firstScore.width>100&&firstScore.height>100&&firstScore.lit>6,
      'Not enough real vector pixels were drawn to qualify a computational score');
    assert.equal(await page.locator('#view-observatory .instrument-stage').isHidden(),true,
      'Legacy four-tab presentation must yield to new Observatory');
    assert(!/Eclipse[–-]Omega/.test(await foundry.innerText()));
    const visualBefore=await page.evaluate(()=>{
      const o=window.VIXEN_ELECTRIC_FOUNDRY;
      const stage=document.querySelector('#vixenElectricFoundry .ef-stage').getBoundingClientRect();
      return {
       status:o.status(),sceneTop:stage.top,
       pageWidth:document.documentElement.scrollWidth,
       source:document.querySelector('#vixenElectricFoundry .ef-sourcebadge').textContent,
       sample:o.getResearchProbe()
      };
    });
    assert(visualBefore.pageWidth<=width+1,'Chrome Observatory horizontal overflow');
    assert(visualBefore.sceneTop<height-45,
      'The actual mathematical visualization belongs in the initial Observatory viewport: '+visualBefore.sceneTop);
    assert.equal(visualBefore.status.source_folios,22);
    assert.equal(visualBefore.status.source_giveback_tracks,6);
    assert.equal(visualBefore.status.experiment_b_flight,'HELD');
    assert.match(visualBefore.source,/TCC-01/);
    // Cross-room optical gate: the operator's one Still switch must stop the
    // Observatory's own GPU/CPU host RAF, not just the ambient Salon/mesh.
    if(motion!=='reduce'){
      const beforeHold=await page.locator('#motionBtn').getAttribute('aria-pressed');
      assert.equal(beforeHold,'false','Ordinary Foundry encounter begins LIVE');
      await page.evaluate(()=>document.getElementById('motionBtn').click());
      try{
        await page.waitForTimeout(130);
        const frozen=await page.evaluate(()=>({
          frame:window.VIXEN_ELECTRIC_FOUNDRY.status().frames,
          held:window.VIXEN_ELECTRIC_FOUNDRY.status().global_still,
          motion:window.VIXEN_MOTION_GRAPH?.status()?.held
        }));
        assert.equal(frozen.held,true,'Still must reach the Observatory engine');
        assert.equal(frozen.motion,true,'Global motion graph must report held');
        await page.waitForTimeout(170);
        assert.equal(await page.evaluate(()=>window.VIXEN_ELECTRIC_FOUNDRY.status().frames),
          frozen.frame,'Global Still must stop Foundry frames across CPU and GPU');
      }finally{
        await page.evaluate(()=>{
          if(document.getElementById('motionBtn').getAttribute('aria-pressed')==='true')
            document.getElementById('motionBtn').click();
        });
      }
    }
    await page.evaluate(()=>{
      const n=document.querySelector('#vixenElectricFoundry .ef-stage');
      scrollTo({top:Math.max(0,scrollY+n.getBoundingClientRect().top-118),behavior:'instant'});
    });
    await page.waitForTimeout(160);
    await page.screenshot({path:path.join(output,'vixen-'+width+'x'+height+'-electric-foundry.png'),fullPage:false});
    await foundry.locator('[data-foundry-dial="gain"]').evaluate(el=>{
      el.value='12';el.dispatchEvent(new Event('input',{bubbles:true}));
    });
    const afterDial=await page.evaluate(()=>window.VIXEN_ELECTRIC_FOUNDRY.getResearchProbe());
    const secondScore=await page.evaluate(()=>{
      return document.querySelector('#vixenElectricFoundry .ef-notation').toDataURL('image/png');
    });
    assert.notEqual(secondScore,firstScore.signature,
      'Changed Vixen research parameters must transform the actual rendered score');
    assert.notDeepEqual(visualBefore.sample.metrics,afterDial.metrics,
      'A source-model dial must change computed diagnostics rather than decorative animation');
    assert.equal(afterDial.corpus_coordinates.source_folio,'TCC-01');
    if(width<=920){
      const railGeometry=await foundry.locator('.ef-hero-rail').evaluate(el=>{
        const scroller=getComputedStyle(el);
        return {width:el.clientWidth,scrollWidth:el.scrollWidth,
          overflowX:scroller.overflowX,direction:scroller.flexDirection,
          fifthX:el.querySelector('[data-lab-id="LAB_TCC-03"]')?.getBoundingClientRect().x,
          viewportWidth:innerWidth};
      });
      assert(railGeometry.scrollWidth>railGeometry.width+100&&railGeometry.overflowX==='auto',
        'All six arias must inhabit a bounded, scrollable horizontal rail: '+JSON.stringify(railGeometry));
    }
    await foundry.locator('.ef-hero-tab[data-lab-id="LAB_TCC-03"]').click();
    const selectionMove=await foundry.evaluate(el=>{
      const active=[...el.querySelectorAll('.ef-hero-tab')].filter(x=>x.getAttribute('aria-pressed')==='true');
      const arrows=[...el.querySelectorAll('.ef-hero-tab')].filter(x=>getComputedStyle(x,'::after').content.includes('◀'));
      return {selected:active.map(x=>x.dataset.labId),arrows:arrows.map(x=>x.dataset.labId)};
    });
    assert.deepEqual(selectionMove,{selected:['LAB_TCC-03'],arrows:['LAB_TCC-03']},
      'The arrow must move on selection and leave the previous aria');
        const rankProbe=await page.evaluate(()=>window.VIXEN_ELECTRIC_FOUNDRY.getResearchProbe());
    assert.equal(rankProbe.corpus_coordinates.source_folio,'TCC-03');
    assert(rankProbe.metrics.some(x=>x.name==='independent_witness_content'));
    const rankScene=await page.evaluate(()=>document.querySelector('#vixenElectricFoundry .ef-notation').toDataURL('image/png'));
    assert.notEqual(rankScene,secondScore,'Rank lab must draw a genuinely distinct scene from Control Planes');
    await foundry.locator('.ef-hero-tab[data-lab-id="LAB_TCC-07"]').click();
    const xorProbe=await page.evaluate(()=>window.VIXEN_ELECTRIC_FOUNDRY.getResearchProbe());
    assert(xorProbe.metrics.some(x=>x.name==='L3_FALSIFIABLE'&&x.value==='UNEXECUTED'));
    const xorScene=await page.evaluate(()=>document.querySelector('#vixenElectricFoundry .ef-notation').toDataURL('image/png'));
    assert.notEqual(xorScene,rankScene,'XOR must project its own information-flow geometry');
    if(width===1440){
      for(const lab of ['LAB_TCC-04','LAB_TCC-05','LAB_TCC-06','LAB_TCC-03','LAB_TCC-07']){
        await foundry.locator('.ef-hero-tab[data-lab-id="'+lab+'"]').click();
        await page.waitForTimeout(115);
        await page.evaluate(()=>{
          const n=document.querySelector('#vixenElectricFoundry .ef-stage');
          scrollTo({top:Math.max(0,scrollY+n.getBoundingClientRect().top-118),behavior:'instant'});
        });
        await page.screenshot({path:path.join(output,'vixen-1440x900-'+lab.toLowerCase()+'.png'),fullPage:false});
      }
    }
    await foundry.getByRole('button',{name:/HOLD FIELD/}).click();
    assert.equal((await page.evaluate(()=>window.VIXEN_ELECTRIC_FOUNDRY.status())).stage!=='NONE',true);
    // The Candidate 3-source "Investigate Source" behavior must actually
    // navigate to an original Em Work, not merely display a decorative link.
    await foundry.locator('.ef-hero-tab[data-lab-id="LAB_TCC-01"]').click();
    const firstWork=foundry.locator('.ef-investigation-doors a[data-source-work]').first();
    const sourceHref=await firstWork.getAttribute('href');
    assert.match(sourceHref,/^#works\/emwork_[0-9a-f]+$/);
    await firstWork.click();
    await page.waitForFunction(()=>document.body.dataset.view==='works',null,{timeout:6000});
    assert.equal(await page.evaluate(()=>document.body.dataset.view),'works');
    assert.match(await page.evaluate(()=>location.hash),/^#works\/emwork_/);
    // Operator iPhone REDPEN: the earlier frontispiece-only GREEN missed the
    // Unicode selection glyph, the original-title boundary, and the giant
    // displaced encounter-order control. Inspect the REAL mobile DOM geometry
    // at every browser-witness viewport before proceeding to Folios.
    await page.locator('#menuToggle').click();
    await page.locator('#mobileNav button[data-view="collection"]').click();
    await page.waitForFunction(()=>document.body.dataset.view==='collection' &&
      !!document.querySelector('#vixenSynthesisSalon button.vs-seam'),null,{timeout:16000});
    const salonRedpen=page.locator('#vixenSynthesisSalon');
    const sourceCard=salonRedpen.locator('.vs-source-card').first();
    assert.match(await sourceCard.locator('.vs-work-title').innerText(),/^The Architecture of Control:/);
    assert.match(await sourceCard.locator('.vs-title-provenance').innerText(),
      /NOT A GENERATED SYNTHESIS CANDIDATE/);
    const seam=salonRedpen.locator('button.vs-seam');
    await seam.scrollIntoViewIfNeeded();
    const seamWitness=await seam.evaluate(el=>{
      const r=el.getBoundingClientRect(),style=getComputedStyle(el);
      const parent=el.parentElement?.getBoundingClientRect();
      return {x:r.x,y:r.y,right:r.right,width:r.width,height:r.height,
       fontSize:style.fontSize,position:style.position,transform:style.transform,
       parentLeft:parent?.left,parentRight:parent?.right,
       pageWidth:document.documentElement.scrollWidth,viewport:innerWidth,
       label:el.innerText};
    });
    assert(seamWitness.width>=96&&seamWitness.width<=240&&seamWitness.height<=85,
      'Salon route switch must be a bounded control, not a giant ornament: '+JSON.stringify(seamWitness));
    assert(seamWitness.x>=0&&seamWitness.right<=width+1,
      'Salon route control escapes the phone viewport: '+JSON.stringify(seamWitness));
    assert(seamWitness.x>=seamWitness.parentLeft-2&&seamWitness.right<=seamWitness.parentRight+2,
      'Salon route control detached from its research stage: '+JSON.stringify(seamWitness));
    assert.equal(seamWitness.position,'relative');
    assert.equal(seamWitness.transform,'none');
    assert(seamWitness.pageWidth<=width+1,'Salon creates horizontal document overflow: '+JSON.stringify(seamWitness));
    if(width<=680){
      await page.screenshot({path:path.join(output,stem+'-salon-order-redpen.png'),fullPage:false});
      await sourceCard.locator('.vs-work-title').scrollIntoViewIfNeeded();
      await page.screenshot({path:path.join(output,stem+'-salon-source-title-redpen.png'),fullPage:false});
    }
    const firstOrder=await seam.locator('.vs-seam-op').innerText();
    await seam.click();
    const secondOrder=await seam.locator('.vs-seam-op').innerText();
    assert.notEqual(firstOrder,secondOrder,'Route flip remains functional after layout repair');
    // 𝄐 PROSCENIUM SEAM: browser witness the actual routed human operator
    // workspace and a non-mutating review/cancel of local rollback.
    await page.locator('.footer [data-view="operator"]').click();
    assert.equal(await page.evaluate(()=>document.body.dataset.view),'operator');
    const op=page.locator('#view-operator');
    assert.equal(await op.isVisible(),true);
    assert.equal(await page.locator('#view-overview #ciSynthesisLogList').count(),0);
    assert.equal(await op.locator('#ciSynthesisLogList').count(),1);
    assert.equal(await op.locator('#ciMetricVernier').count(),1);
    assert.equal(await op.locator('#ciResetBtn').count(),1);
    await op.locator('.ci-log-row').first().waitFor({state:'visible',timeout:10000});
    const beforeLogCount=await op.locator('.ci-log-row').count();
    const candidateRestore=op.locator('button[data-rollback-entry]').first();
    await candidateRestore.waitFor({state:'visible',timeout:12000});
    await candidateRestore.click();
    const review=page.locator('#vixenRestoreReviewDialog');
    assert.equal(await review.isVisible(),true,'Restore must open comparative review');
    assert.equal(await review.locator('#vixRestoreReviewConfirm').isDisabled(),true,
      'Local restore requires positive scope acknowledgement');
    assert.match(await review.locator('#vixRestoreComparison').innerText(),
      /REVIEWING .* CURRENT PRESENTATION .* LATEST SESSION EVENT/);
    assert.match(await review.innerText(),/persisted composition remains held|persistent Compose approval/i);
    if(width<=680){
      await page.screenshot({path:path.join(output,stem+'-operator-restore-review.png'),fullPage:false});
    }
    await review.locator('#vixRestoreReviewCancel').click();
    assert.equal(await review.isVisible(),false);
    assert.equal(await op.locator('.ci-log-row').count(),beforeLogCount,
      'Cancel must never append a rollback or mutate the loaded ledger');
    assert((await page.evaluate(()=>document.documentElement.scrollWidth))<=width+2,
      'Podium Settings must not create horizontal document overflow');
    await op.locator('#ciLogCount').scrollIntoViewIfNeeded();
    await page.screenshot({path:path.join(output,stem+'-proscenium-operator-ledger.png'),fullPage:false});
    await page.locator('#vixenRoomRail button[data-view="collection"]').click();
    await page.locator('#menuToggle').click();
    await page.locator('#mobileNav button[data-view="reference"]').click();
    await page.locator('#vixenReferenceChamber .vxe-source-folio').first().waitFor();
    await page.waitForTimeout(650); // settle the original 450ms view-enter transition

    const before = await page.evaluate(() => {
      const bounds = (selector) => {
        const node = document.querySelector(selector);
        assertNode(node, selector);
        const rect = node.getBoundingClientRect();
        return {
          x: rect.x, top: rect.top, right: rect.right, bottom: rect.bottom,
          width: rect.width, height: rect.height
        };
      };
      function assertNode(node, label) {
        if (!node) throw new Error('Missing rendered node: ' + label);
      }
      return {
        page: document.body.dataset.view,
        viewport: { width: innerWidth, height: innerHeight },
        documentWidth: document.documentElement.scrollWidth,
        header: bounds('.site-header'),
        menu: bounds('#menuToggle'),
        brand: bounds(innerWidth <= 680 ? '.brand-mobile-logo .vixen-fox-emblem' : '.brand-desktop-lockup .vixen-fox-emblem'),
        source: bounds('.vxe-vixen-pair .vxe-source-folio'),
        firstEstate: bounds('.vxe-vixen-pair .vxe-estate-vixen'),
        secondEstate: bounds('.vxe-vixen-pair .vxe-estate-companion'),
        workTitleDisclosurePresent: !!document.querySelector('.vxe-title-disclosure'),
        stageRole: document.querySelector('#vixenReferenceChamber')?.getAttribute('data-stage-role'),
        performerRoles: [...document.querySelectorAll('.vxe-vixen-pair .vxe-estate')].map(x => x.getAttribute('data-stage-role')),
        excludesUnrelatedOpera: !/Eclipse[–-]Omega|G-001/.test(document.querySelector('#vixenReferenceChamber')?.textContent || '')
      };
    });

    assert.equal(before.page, 'reference');
    assert.equal(before.stageRole, 'OPERA');
    assert.deepEqual(before.performerRoles, ['PERFORMER', 'PERFORMER']);
    assert.equal(before.excludesUnrelatedOpera, true);
    assert.equal(before.workTitleDisclosurePresent, true);
    assert(before.documentWidth <= width + 1, 'Horizontal overflow at ' + width);
    assert(before.source.top < height - 80,
      'Original source remains below the initial viewport at ' + width + ': y=' + before.source.top);
    assert(before.brand.width > 0 && before.brand.height > 0, 'Vixen fox identity must remain visible');
    assert(before.menu.width > 0 && before.menu.height > 0, 'Compact menu must remain visible');
    assert(before.brand.right + 8 < before.menu.x, 'Masthead fox/utility control collision');
    assert(before.header.bottom <= before.source.top, 'Fixed header overlays source card');
    assert.equal(errors.length, 0, 'Uncaught runtime errors before inquiry: ' + errors.join(' | '));

    await page.screenshot({ path: path.join(output, stem + '-notice.png'), fullPage: false });
    await page.locator('#vixenReferenceChamber').getByRole('button', { name: /Begin this Work.s comparison/ }).click();
    await page.locator('#vixenReferenceChamber').getByRole('button', { name: /Observe the recorded differences/ }).click();
    assert.match(await page.locator('.vxe-result').innerText(), /METADATA_COMPARISON_ONLY|HELD_/);
    await page.locator('#vixenReferenceChamber').getByRole('button', { name: /Name an unresolved question/ }).click();
    await page.locator('.vxe-name').fill('Leave cross-Opera authorship unasserted.');
    await page.locator('#vixenReferenceChamber').getByRole('button', { name: /Rest without penalty/ }).click();
    await page.locator('#vixenReferenceChamber').getByRole('button', { name: /Return to the Opera/ }).click();
    assert.equal(await page.locator('.vxe-name').inputValue(), 'Leave cross-Opera authorship unasserted.');
    assert.equal(errors.length, 0, 'Uncaught runtime errors during inquiry: ' + errors.join(' | '));
    await page.screenshot({ path: path.join(output, stem + '-resumed.png'), fullPage: false });

    // The reader is a separately typed Operahouse stage, not the Vixen Opera.
    const house=page.locator('#operahouseEncounter');
    assert.equal(await house.isHidden(),true,'The other Opera must be offstage by default');
    await page.locator('#vixenReferenceChamber').getByRole('button',
      {name:/Open independent reference reading room/}).click();
    assert.equal(await page.locator('#vixenReferenceChamber').isHidden(),true,
      'The Vixen Opera must leave the visible stage before a Universal record is inspected');
    assert.equal(await house.isVisible(),true);
    assert.equal(await page.locator('body').getAttribute('data-active-research-stage'),'OPERAHOUSE');
    assert.equal(await page.locator('#operahouseStageReturn').isVisible(),true);
    assert.equal(await page.locator('.site-header .brand').isHidden(),true);
    assert.equal(await page.locator('footer.footer').isHidden(),true,
      'The Vixen research footer cannot remain visible on the Operahouse stage');
    assert.match(await page.title(),/Independent Source Reading Room/);
    assert.equal(await house.getAttribute('data-stage-role'),'OPERAHOUSE');
    assert.equal(await house.locator('[data-stage-role="INDEPENDENT_REFERENCE"]').count(),1);
    assert.equal(await house.locator('[data-stage-role="SOURCE_LOCUS"]').count(),1);
    assert(!/G-101|Eclipse[–-]Omega/.test(await house.innerText()),
      'Independent Universal records cannot be auto-presented before operator inquiry');
    // Capture the actual room entrance separately from downstream Playwright scrolling.
    await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
    await page.waitForTimeout(90);
    const roomTitle=await house.locator('.oh-title').boundingBox();
    const fixedHeader=await page.locator('.site-header').boundingBox();
    assert(roomTitle&&fixedHeader&&roomTitle.y>=fixedHeader.y+fixedHeader.height-1,
      'The room heading must not be hidden behind the fixed header on entry');
    await page.screenshot({path:path.join(output,stem+'-operahouse-entry.png'),fullPage:false});
    await house.getByRole('button',{name:'Open independent read-only estate'}).click();
    await house.getByRole('button',{name:'Search Universal separately'}).waitFor({timeout:15000});
    await house.getByRole('searchbox',{name:'Search independent Universal index'}).fill('G-101');
    await house.getByRole('button',{name:'Search Universal separately'}).click();
    await house.getByRole('button',{name:/G-101/}).first().click();
    await house.locator('.oh-payload').first().waitFor({timeout:15000});
    assert.match(await house.innerText(),/VERIFIED INDEPENDENT REFERENCE · G-101/);
    assert(!/G-101/.test(await page.locator('#vixenReferenceChamber').innerText()),
      'A separately witnessed Universal record must not become a Vixen Performer');
    await house.getByRole('textbox',{name:'Operator-authored unratified research question'}).fill(
      'What separately acquired evidence could warrant this relationship?');
    await house.getByRole('button',{name:'Observe separately — do not ratify a relationship'}).click();
    assert.equal(await house.locator('.oh-disposition').getAttribute('data-encounter-state'),
      'WITNESSED_UNLINKED_PAIR');
    assert.match(await house.locator('.oh-disposition').innerText(),/Relationship: UNESTABLISHED/);
    await house.locator('.oh-disposition .oh-payload:not(.oh-podium-export) summary').click();
    const summaryColor=await house.locator('.oh-disposition .oh-payload:not(.oh-podium-export) summary')
      .evaluate(n=>getComputedStyle(n).color);
    const ink=summaryColor.match(/\d+/g)?.map(Number)||[];
    assert.equal(ink.length,3,'Receipt disclosure must expose RGB ink');
    assert(Math.max(...ink)<100 && ink[1]>=ink[0]-5,
      'Receipt disclosure requires legible graphite ink without legacy plum');
    const receipt=JSON.parse(await house.locator('.oh-disposition .oh-payload:not(.oh-podium-export) pre').innerText());
    assert.equal(receipt.schema,'ua:contract:cross_atelier_witness');
    assert.equal(receipt.admissibility.human_ratified_crosswalk,false);
    assert.equal(receipt.admissibility.publication_eligible,false);
    assert.equal(receipt.universal.record_id,'G-101');
    assert.match(receipt.operator_proposal.text,/separately acquired evidence/);
    await house.getByRole('button',{name:'Rest without penalty'}).click();
    await house.getByRole('button',{name:'Resume without penalty'}).click();
    assert.equal(errors.length,0,'Uncaught errors across distinct Operahouse encounter');
    // The evidence receipt is intentionally framed as a separate observation.
    // Never send a cropped mid-scroll screenshot as an approved visual witness.
    await page.evaluate(()=>{
      const result=document.querySelector('#operahouseEncounter .oh-disposition');
      if(result)window.scrollTo({top:Math.max(0,window.scrollY+result.getBoundingClientRect().top-96),behavior:'instant'});
    });
    await page.waitForTimeout(90);
    await page.screenshot({path:path.join(output,stem+'-operahouse-receipt.png'),fullPage:false});
    await house.getByRole('button',{name:/Return to Vixen/}).click();
    assert.equal(await house.isHidden(),true,'Reference Opera must leave before Vixen returns');
    assert.equal(await page.locator('#vixenReferenceChamber').isVisible(),true);
    assert.equal(await page.locator('body').getAttribute('data-active-research-stage'),'VIXEN');
    assert.equal(await page.locator('#operahouseStageReturn').isHidden(),true);
    assert.equal(await page.locator('.site-header .brand').isVisible(),true);
    assert.equal(await page.locator('footer.footer').isVisible(),true);
    assert.match(await page.title(),/Vixen Cybernetics/i);
    assert(!/G-101/.test(await page.locator('#vixenReferenceChamber').innerText()),
      'No independent Universal record may ride the return route into Vixen');


    // RGI08 · Materialized human-facing Vixen Synthesis Salon.
    // It must display genuine Work loci, not a foreign Universal performer.
    await page.locator('#menuToggle').click();
    await page.locator('#mobileNav button[data-view="collection"]').click();
    const salon=page.locator('#vixenSynthesisSalon');
    await salon.locator('.vs-source-card').first().waitFor({timeout:15000});
    await page.waitForTimeout(510);
    assert.equal(await salon.locator('.vs-source-card').count(),2);
    assert.equal(await salon.locator('.vs-clock-row').count(),5);
    assert.match(await salon.locator('.vs-rail').innerText(),/32/);
    assert(!/Eclipse[–-]Omega/.test(await salon.innerText()),
      'Foreign research Opera may never appear in Vixen’s authored Salon');
    assert.equal(await salon.getAttribute('data-stage-role'),'VIXEN_OPERA');

    // RGI13 acceptance: verify an actually painted, responsive, route-aware
    // electrical mesh. An image or declared CSS color cannot satisfy this.
    const scrollCompositedMobile=width<=740;
    await page.waitForFunction(mobile=>{
      const mesh=window.VixenLivingMesh?.status();
      const local=document.querySelector('#vixenSynthesisSalon canvas.vs-cuirass-motion-canvas');
      return mesh?.route==='collection'&&document.getElementById('vixenLivingMesh')?.width>100
        &&(mobile?(mesh.motion==='PARKED'&&local?.width>100)
          :mesh.host_driven_frames>=1);
    },scrollCompositedMobile,{timeout:15000,polling:250});
    const meshWitness=await page.evaluate(()=>{
      const c=document.getElementById('vixenLivingMesh');
      const state=window.VixenLivingMesh.status();
      // The shared page canvas deliberately excludes the Salon stage and
      // reading surfaces. Measure its actual painted complement, rather
      // than sampling the portion that now belongs to the garment canvas.
      const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;
      let colored=0;
      for(let i=3;i<d.length;i+=4)if(d[i]>10)colored++;
      return {
       connected:c.isConnected,role:c.dataset.role,
       route:state.route,frames:state.rendered_frames,
       meshCarriers:state.model_carriers,px:colored,hostDriven:state.host_driven_frames,
       pointer:getComputedStyle(c).pointerEvents,
       localCanvasWidth:document.querySelector('#vixenSynthesisSalon canvas.vs-cuirass-motion-canvas')?.width||0,
       localCanvasDisplay:getComputedStyle(document.querySelector('#vixenSynthesisSalon canvas.vs-cuirass-motion-canvas')).display,
       moduleLoaded:[...document.scripts].some(x=>x.src?.includes('vixen-live-mesh-rgi13.mjs')),
       styleLoaded:[...document.styleSheets].some(x=>x.href?.includes('vixen-electrical-breath-rgi13.css'))
      };
    });
    assert(meshWitness.connected,'Live visual mesh must be attached');
    assert.equal(meshWitness.role,'VIXEN_OPERA_VISUAL_ONLY');
    assert.equal(meshWitness.route,'collection');
    assert.equal(await page.evaluate(()=>window.VixenLivingMesh.status().motion),
      scrollCompositedMobile?'PARKED':motion==='reduce'?'STILL':'HOST_FRAME',
      'Mobile fixed layer must park; desktop inherits the Salon host clock');
    if(!scrollCompositedMobile){
      assert.equal(meshWitness.meshCarriers,39);
      if(motion!=='reduce')assert(meshWitness.hostDriven>0,
        'Desktop Salon field must be painted by the primary clock');
    }else{
      assert(meshWitness.localCanvasWidth>100&&meshWitness.localCanvasDisplay!=='none',
        'A live Salon local light canvas must replace the fixed mobile field');
    }
    assert.equal(meshWitness.pointer,'none','The electric mesh cannot steal source controls');
    assert.equal(meshWitness.moduleLoaded,true);
    assert.equal(meshWitness.styleLoaded,true);
    if(!scrollCompositedMobile)
      assert(meshWitness.px>200,'Desktop page complement must visibly paint model-derived light: '+JSON.stringify(meshWitness));
    else assert.equal(meshWitness.px,0,
      'The fixed viewport mesh must be cleared and parked during mobile Salon scrolling');
    // DD-02 source-bound folded chrome supersedes the old RGI14 canvas.
    // Qualify real Canvas2D pixels and prepaint geometry without weakening the
    // legacy renderer's separately retained rollback tests.
    await page.waitForFunction(()=>{
      const c=document.querySelector('#vixenSynthesisSalon canvas.vs-cuirass-canvas');
      if(!c||c.width<200||c.height<160)return false;
      const d=c.getContext('2d')?.getImageData(0,0,c.width,c.height).data;
      if(!d)return false;
      let bright=0,dark=0;
      for(let i=0;i<d.length;i+=64){
        const y=.2126*d[i]+.7152*d[i+1]+.0722*d[i+2];
        if(y>170)bright++;if(y<55)dark++;
      }
      return bright>25&&dark>25;
    },null,{timeout:15000,polling:250});
    const cuirassWitness=await page.evaluate(async()=>{
      const canvas=document.querySelector('#vixenSynthesisSalon canvas.vs-cuirass-canvas');
      const ids=[...document.querySelectorAll('#vixenSynthesisSalon .vs-source-card')]
        .slice(0,2).map(card=>card.querySelector('select')?.value);
      const {buildFoldedCuirass,CUIRASS_CONTRACT,CUIRASS_POLICY}=
        await import('./vixen-estate/vixen-folded-cuirass.mjs');
      const rect=canvas.getBoundingClientRect();
      const args={width:rect.width,height:rect.height,time:0,sourceIds:ids};
      const on=buildFoldedCuirass({...args,beatToGeometryGain:1});
      const off=buildFoldedCuirass({...args,beatToGeometryGain:0});
      let maxDisplacement=0;
      for(let i=0;i<on.grid.length;i+=3)
        for(let j=0;j<on.grid[i].length;j+=3){
          const a=on.grid[i][j].screen,b=off.grid[i][j].screen;
          maxDisplacement=Math.max(maxDisplacement,Math.hypot(a[0]-b[0],a[1]-b[1]));
        }
      return {
        connected:canvas.isConnected,
        rendered:canvas.width>200&&canvas.height>160,
        compositor:canvas.dataset.computation,
        contract:document.getElementById('vixenSynthesisSalon').dataset.opticalContract,
        sourceCount:ids.length,sourceIdsValid:ids.length===2&&ids[0]!==ids[1]&&ids.every(id=>/^emwork_/.test(id)),carriers:on.filaments.length,
        onGain:on.gain,offGain:off.gain,maxDisplacement,
        glintsUnchanged:JSON.stringify(on.glints)===JSON.stringify(off.glints),
        emission:on.emissionAllocated,emissionLimit:CUIRASS_POLICY.total_emission_alpha,
        role:CUIRASS_CONTRACT.role,empiricalCredit:CUIRASS_CONTRACT.empirical_credit,
        legacyCoutureLoaded:[...document.scripts].some(x=>x.src?.includes('vixen-opaline-couture-rgi14.mjs')),
        geometryModuleLoaded:true
      };
    });
    assert.equal(cuirassWitness.connected,true,'One genuine source-bound garment canvas must be attached');
    assert.equal(cuirassWitness.rendered,true,'DD-02 must physically paint in Chromium');
    assert.equal(cuirassWitness.compositor,'D3_PHI_OPEN_FOLDS_SHARED_CLOTH');
    assert.equal(cuirassWitness.contract,'td613.vixen.folded-cuirass/v1');
    assert.equal(cuirassWitness.sourceCount,2);
    assert.equal(cuirassWitness.sourceIdsValid,true,
      'The two optical inputs must be distinct Work IDs, not a manifestation source');
    assert.equal(cuirassWitness.carriers,39);
    assert(cuirassWitness.maxDisplacement>1,
      'Measured D3/phi beats must deform actual prepaint vertices, not merely modify glints');
    assert.equal(cuirassWitness.glintsUnchanged,true,
      'Gain-zero intervention must preserve the same optical glints');
    assert(cuirassWitness.emission<=cuirassWitness.emissionLimit+.001,
      'The design must retain the bounded emission budget');
    assert.equal(cuirassWitness.empiricalCredit,0);
    assert.equal(cuirassWitness.role,'OPERA_VISUAL_ONLY');
    assert.equal(cuirassWitness.legacyCoutureLoaded,true,
      'Archived RGI14 remains available as the source-retained rollback implementation');

    // DD-02 controlled, source/pixel-bound falsifier. Three matched local
    // Canvas2D repaints keep Work pair, phase, viewport and camera fixed.
    // This tests causal visual consequence, not aesthetics or backend parity.
    const opticalAssay=await page.evaluate(async()=>{
      const canvas=document.querySelector('#vixenSynthesisSalon canvas.vs-cuirass-canvas');
      const sourceIds=[...document.querySelectorAll('#vixenSynthesisSalon .vs-source-card')]
        .slice(0,2).map(card=>card.querySelector('select')?.value);
      const {buildFoldedCuirass,paintFoldedCuirass,coutureBackingSize}=
        await import('./vixen-estate/vixen-folded-cuirass.mjs');
      const bounds=canvas.getBoundingClientRect();
      const width=Math.max(1,Math.round(bounds.width)),height=Math.max(1,Math.round(bounds.height));
      const time=2.125,base={width,height,time,sourceIds};
      const measured=coutureBackingSize(width,height,window.devicePixelRatio);
      const on=buildFoldedCuirass({...base,beatToGeometryGain:1});
      const zero=buildFoldedCuirass({...base,beatToGeometryGain:0});
      const redraw=(model,options)=>{
        const surface=document.createElement('canvas');
        surface.width=width;surface.height=height;
        const context=surface.getContext('2d',{willReadFrequently:true});
        paintFoldedCuirass(context,model,options);
        return context.getImageData(0,0,width,height).data;
      };
      const onPixels=redraw(on),repeatPixels=redraw(on);
      const zeroPixels=redraw(zero),darkPixels=redraw(on,{optics:false});
      const luma=(d,i)=>.2126*d[i]+.7152*d[i+1]+.0722*d[i+2];
      let repeatDrift=0,beatChanged=0,allOpticsChanged=0,samples=0;
      const lumas=[],left=Math.max(0,Math.floor(on.bounds.left));
      const right=Math.min(width,Math.ceil(on.bounds.right));
      const top=Math.max(0,Math.floor(on.bounds.top));
      const bottom=Math.min(height,Math.ceil(on.bounds.bottom));
      for(let y=top;y<bottom;y+=2)for(let x=left;x<right;x+=2){
        const i=(y*width+x)*4;
        const live=luma(onPixels,i),rep=luma(repeatPixels,i);
        const gainOff=luma(zeroPixels,i),unlit=luma(darkPixels,i);
        if(Math.abs(live-rep)>12)repeatDrift++;
        if(Math.abs(live-gainOff)>12)beatChanged++;
        if(Math.abs(live-unlit)>12)allOpticsChanged++;
        lumas.push(live);samples++;
      }
      lumas.sort((a,b)=>a-b);
      const quantile=q=>lumas[Math.min(lumas.length-1,Math.floor((lumas.length-1)*q))]??0;
      // Five actual build+Canvas paint samples on the same browser machine.
      const costs=[],buildCosts=[],canvasCosts=[];
      for(let i=0;i<5;i++){
        const start=performance.now();
        const model=buildFoldedCuirass({...base,time:time+.025*i});
        const built=performance.now();
        redraw(model);
        const painted=performance.now();
        buildCosts.push(built-start);canvasCosts.push(painted-built);
        costs.push(painted-start);
      }
      const sorted=[...costs].sort((a,b)=>a-b);
      const buildSorted=[...buildCosts].sort((a,b)=>a-b);
      const canvasSorted=[...canvasCosts].sort((a,b)=>a-b);
      return {
        claimClass:'VISUAL_MODEL_ASSAY_NOT_SCIENTIFIC_VERIFICATION',
        scene:'SALON_CANVAS2D',clockTime:time,sourceIds,width,height,
        viewportDpr:devicePixelRatio,backing:measured,glintsMatched:JSON.stringify(on.glints)===JSON.stringify(zero.glints),
        samples,repeatDrift,beatChanged,allOpticsChanged,
        beatChangedFraction:beatChanged/Math.max(1,samples),
        repeatDriftFraction:repeatDrift/Math.max(1,samples),
        allOpticsChangedFraction:allOpticsChanged/Math.max(1,samples),
        displayLumaP10:quantile(.10),displayLumaP90:quantile(.90),
        displaySpanP90P10:quantile(.90)-quantile(.10),
        displayLumaP99:quantile(.99),
        displayHighlightsOver200:lumas.filter(x=>x>200).length/Math.max(1,samples),
        paintBuildP95Ms:sorted[4],paintBuildMedianMs:sorted[2],
        modelBuildP95Ms:buildSorted[4],canvasPaintP95Ms:canvasSorted[4],
        modelBuildMedianMs:buildSorted[2],canvasPaintMedianMs:canvasSorted[2],
        proposedP95CeilingMs:20,passesProposedP95:sorted[4]<=20
      };
    });
    assert(opticalAssay.sourceIds.length===2&&opticalAssay.sourceIds[0]!==opticalAssay.sourceIds[1]
      &&opticalAssay.sourceIds.every(id=>/^emwork_/.test(id)),
      'Matched browser assay must compare the two selected Works');
    assert.equal(opticalAssay.glintsMatched,true,
      'Beat-to-geometry refraction must preserve selected glints');
    assert.equal(opticalAssay.repeatDrift,0,
      'Fixed source/phase/viewport must repeat at byte-equal luma sampling');
    assert(opticalAssay.beatChanged>opticalAssay.repeatDrift+25,
      'Beat intervention must cause displayed pixel change beyond repeated-paint drift');
    assert(opticalAssay.allOpticsChanged>opticalAssay.beatChanged,
      'All-optics-off must be visually distinguishable from beat-only intervention');
    assert(opticalAssay.displaySpanP90P10>50,
      'Displayed garment region must have bright/dark contrast beyond a flat wash');
    assert(Number.isFinite(opticalAssay.paintBuildP95Ms)&&
      Number.isFinite(opticalAssay.modelBuildP95Ms)&&
      Number.isFinite(opticalAssay.canvasPaintP95Ms),
      'Browser p95 build and Canvas paint must be measured separately, not inferred from FPS caps');
    // Existing Still button must pause our new animation as well as the
    // historical Observatory; never add a redundant motion authority control.
    await page.evaluate(()=>document.getElementById('motionBtn').click());
    await page.waitForFunction(mobile=>
      window.VixenLivingMesh?.status()?.motion===(mobile?'PARKED':'STILL'),
      scrollCompositedMobile,{timeout:5000});
    assert.equal(await salon.getAttribute('data-optical-contract'),
      'td613.vixen.folded-cuirass/v1',
      'Still must preserve the active folded compositor without reverting to the old canvas');
    const stillFrame=await page.evaluate(()=>window.VixenLivingMesh.status().rendered_frames);
    await page.waitForTimeout(125);
    assert.equal(await page.evaluate(()=>window.VixenLivingMesh.status().rendered_frames),stillFrame,
      'Still mode must prevent all new mesh animation frames');
    await page.evaluate(()=>document.getElementById('motionBtn').click());
    // OS-reduced-motion remains STILL after the operator releases the
    // in-page Still switch; only a motion-capable browser may go LIVE.
    const resumedMotion=scrollCompositedMobile?'PARKED':motion==='reduce'?'STILL':'HOST_FRAME';
    await page.waitForFunction(expected=>
      window.VixenLivingMesh?.status()?.motion===expected,resumedMotion,{timeout:5000});


    // RGI12 operator rejection regression: source-declared plum/pink values
    // never constitute proof of a visible pearl proscenium. The browser must
    // actually load the downstream stylesheet and compute a luminous header.
    const glindaStage=await page.evaluate(()=>{
      const stage=document.querySelector('#vixenSynthesisSalon .vs-head');
      const editorial=stage?.querySelector('.vs-hero-copy');
      const optical=stage?.querySelector('.vs-optical-stage');
      const title=stage?.querySelector('.vs-title');
      const source=document.querySelector('#vixenSynthesisSalon .vs-source-card');
      return {
       loaded:[...document.styleSheets].some(x=>x.href?.includes('glinda-luminous-proscenium-rgi12.css')),
       editorialGradient:editorial?getComputedStyle(editorial).backgroundImage:'',
       opticalBackdrop:optical?getComputedStyle(optical).backgroundColor:'',
       titleColor:title?getComputedStyle(title).color:'',
       sourcePosition:source?.getBoundingClientRect().top??null,
       stageBottom:stage?.getBoundingClientRect().bottom??null
      };
    });
    assert.equal(glindaStage.loaded,true,
      'The Glinda visual architecture must ship to and load in Chromium');
    assert(/linear-gradient/i.test(glindaStage.editorialGradient),
      'Folded editorial panel must retain visible pearl-pink gradients, rather than the rejected plum composite');
    assert.equal(glindaStage.opticalBackdrop,'rgb(16, 24, 30)',
      'The separate dimensional garment stage requires a neutral graphite backdrop');
    const titleRGB=(glindaStage.titleColor.match(/\d+/g)||[]).map(Number);
    assert(titleRGB.length>=3&&Math.max(...titleRGB.slice(0,3))<75
      &&Math.max(...titleRGB.slice(0,3))-Math.min(...titleRGB.slice(0,3))<25,
      'Headline ink must remain neutral dark chrome on luminous pearl: '+glindaStage.titleColor);
    assert(glindaStage.stageBottom>0,'Operator must encounter the computational optical stage');

    const overture=page.locator('#view-collection .vs-overture-notes');
    assert.equal(await overture.count(),1,'The original research briefing must remain available');
    assert.equal(await overture.getAttribute('open'),null,'The duplicate introduction begins folded');
    await overture.locator('summary').click();
    assert.equal(await overture.locator('p.intro').isVisible(),true,'The full historical brief remains available on request');
    await overture.locator('summary').click();
    assert.equal(await overture.getAttribute('open'),null,'Original source-first composition can be restored');

    // The folded garment's browser witness above establishes source-conditioned
    // prepaint geometry and observed light/dark pixels. The legacy RGI11
    // compositor remains available to the internal rollback route only.
    const visualPalette=await page.evaluate(()=>({
      arc:getComputedStyle(document.body).getPropertyValue('--arc-flash').trim().toUpperCase(),
      sourceText:document.querySelector('#vixenSynthesisSalon').innerText
    }));
    assert.equal(visualPalette.arc,'#FFF2A9','Active Arc Flash must be blonde electric light');
    assert(!/🩰|🚬/.test(visualPalette.sourceText),
      'Literal ballet/shoe/cigarette emoji substitutes cannot pass the couture witness');

    // A disclosure click scrolls Chromium to its summary. Reset to the
    // canonical *Salon entrance* before testing the first-viewport source
    // position, rather than attributing test-induced scroll to the layout.
    await page.evaluate(()=>{
      const entrance=document.querySelector('#view-collection .view-heading');
      const fixed=document.querySelector('.site-header')?.getBoundingClientRect().height||0;
      if(entrance)window.scrollTo({
        top:Math.max(0,window.scrollY+entrance.getBoundingClientRect().top-fixed-6),
        behavior:'instant'
      });
    });
    const salonGeom=await page.evaluate(()=>{
      const root=document.querySelector('#vixenSynthesisSalon');
      const original=root.querySelector('.vs-source-card');
      const header=document.querySelector('.site-header').getBoundingClientRect();
      const r=original.getBoundingClientRect();
      return {top:r.top,headerBottom:header.bottom,
        documentWidth:document.documentElement.scrollWidth,viewport:innerWidth,
         scrollY:window.scrollY,stageTop:root.querySelector('.vs-head')?.getBoundingClientRect().top}
    });
    assert(salonGeom.documentWidth <= width+1,'Salon horizontal overflow at '+width);
    assert(salonGeom.top<height-55,
      'Original Vixen source must be visible in first Salon viewport: width='+width+
      ', top='+salonGeom.top+', stageTop='+salonGeom.stageTop+
      ', scrollY='+salonGeom.scrollY+', viewportHeight='+height);
    const readability=await page.evaluate(()=>{
      const salon=document.getElementById('vixenSynthesisSalon');
      const intro=salon.querySelector('.vs-intro').getBoundingClientRect();
      const cards=[...salon.querySelectorAll('.vs-source-card')];
      const first=cards[0].getBoundingClientRect();
      const workTitles=cards.map(c=>getComputedStyle(c.querySelector('.vs-work-title')).color);
      const bodyText=getComputedStyle(salon.querySelector('.vs-intro')).color;
      const noObstruction=first.top>=intro.bottom-1;
      return {introBottom:intro.bottom,firstTop:first.top,
        noObstruction,workTitles,bodyText};
    });
    assert(readability.noObstruction,
      'The source card cannot cover the Salon introduction: firstTop='+
      readability.firstTop+', introBottom='+readability.introBottom);
    assert.equal(readability.workTitles[0],'rgb(24, 35, 44)',
      'Work I title must render dark ink against pearl and may not vanish into blush');
    assert.equal(readability.workTitles[1],'rgb(255, 248, 250)',
      'Work II title must render pale ink against neutral black chrome');
    // Visual acquisition must not include transient test-automation toasts.
    // Source and control interactions are independently tested below.
    await page.waitForFunction(()=>!document.querySelector('#vixenToast')?.classList.contains('visible'),
      null,{timeout:12000,polling:200});
    await page.screenshot({path:path.join(output,stem+'-salon-entry.png'),fullPage:false});
    const beforeClock=await salon.locator('.vs-clock-row strong').allInnerTexts();
    await salon.getByRole('slider',{name:'Synthetic arrival lag in dimensionless ticks'}).evaluate(n=>{
      n.value='105';n.dispatchEvent(new Event('input',{bubbles:true}));
      n.dispatchEvent(new Event('change',{bubbles:true}));
    });
    const afterClock=await salon.locator('.vs-clock-row strong').allInnerTexts();
    assert.notDeepEqual(beforeClock,afterClock,'The instrument dial must causally change rendered clock geometry');
    await salon.getByRole('button',{name:/Place both Works in the research cart/}).click();
    assert.equal(await page.locator('#collectionCount').innerText(),'2');
    await salon.getByRole('textbox',{name:'Compose an original research question'}).fill(
      'Which independently witnessed observation could falsify this proposed relation?');
    await salon.getByRole('button',{name:/Compose an unratified theory/}).click();
    await salon.locator('.vs-result').waitFor();
    assert.equal(await salon.locator('.vs-result').getAttribute('data-claim-class'),'OPEN_FIELD_UNRATIFIED_QUESTION');
    const proposalCopy=await salon.locator('.vs-result').innerText();
    assert.match(proposalCopy,/prospective comparison/i);
    assert.doesNotMatch(proposalCopy,/\bExperiment B\b/i,
      'Historical experiment token must not leak through the visitor rendering');
    assert.match(await salon.locator('.vs-result').innerText(),/HELD/);
    const theoremContrast=await salon.locator('.vs-result .vs-note').first().evaluate(node=>{
      const styles=getComputedStyle(node);
      const paper=getComputedStyle(node.closest('.vs-result'));
      const rgb=c=>(c.match(/[\d.]+/g)||[]).slice(0,3).map(v=>Number(v)/255);
      const luminance=c=>rgb(c).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4)
        .reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
      const fg=luminance(styles.color),bg=luminance(paper.backgroundColor);
      return (Math.max(fg,bg)+.05)/(Math.min(fg,bg)+.05);
    });
    assert(theoremContrast>=4.5,
      'Result explanations must have WCAG AA contrast on dark couture paper, received '+theoremContrast);
    await salon.getByRole('button',{name:'Refract the encounter order'}).click();
    assert.match(await salon.innerText(),/Internal refraction/);
    await salon.getByRole('button',{name:'Rest without penalty'}).click();
    assert.match(await salon.innerText(),/REST · Temporal suspension honored without penalty/);
    await salon.getByRole('button',{name:/Resume this unfinished inquiry/}).click();
    assert.match(await salon.getByRole('textbox',{name:'Compose an original research question'}).inputValue(),
      /independently witnessed observation/);
    // Capture the theory cabinet as a separate, source-local observation.
    await page.evaluate(()=>{
      const n=document.querySelector('#vixenSynthesisSalon .vs-result');
      if(n)window.scrollTo({top:Math.max(0,scrollY+n.getBoundingClientRect().top-96),behavior:'instant'})
    });
    // A legacy research-cart toast is intentionally short-lived. The
    // recorded theorem witness must not capture its unrelated overlay.
    await page.waitForFunction(()=>!document.querySelector('#vixenToast')?.classList.contains('visible'),null,{timeout:15000,polling:250});
    await page.waitForTimeout(90);
    await page.screenshot({path:path.join(output,stem+'-salon-theorem.png'),fullPage:false});
    assert.equal(errors.length,0,'Uncaught errors across source-bound Salon: '+errors.join(' | '));

    // RGI10-B · The former administrative registry views are now genuine
    // unequal manuscript / bilateral / tribunal compositions. Preserve their
    // complete native data and controls; capture one source-first frame each.
    const editorialViews=[
      {id:'gates',container:'#gatesStackContainer',entry:'.gate-pair-card',expected:8,
       file:'bilateral-gates'},
      {id:'protocols',container:'#protocolsLexiconLayout',entry:'.lexicon-reader',expected:1,
       file:'protocol-atlas'},
      {id:'holds',container:'#view-holds .holds-grid',entry:'.hold-panel',expected:1,
       file:'beautiful-refusal'}
    ];
    for(const v of editorialViews){
      await page.locator('#menuToggle').click();
      await page.locator('#mobileNav button[data-view="'+v.id+'"]').click();
      await page.waitForFunction(id=>document.body.dataset.view===id,v.id,{timeout:6000});
      await page.waitForTimeout(530);
      const container=page.locator(v.container);
      assert(await container.locator(v.entry).count()>=v.expected,
        'Original source registry must survive architecture: '+v.id);
      if(v.id==='protocols'){
        const indexOverflow=await page.locator('#view-protocols .lexicon-index').evaluate(root=>{
          const nodes=[...root.querySelectorAll('.lexicon-item button')].filter(n=>n.getClientRects().length);
          return nodes.map(n=>({scroll:n.scrollWidth,client:n.clientWidth,
            text:n.textContent.trim().slice(0,44)})).filter(n=>n.scroll>n.client+2);
        });
        assert.deepEqual(indexOverflow,[],
          'Long, authentic protocol identifiers must wrap within the index instead of visually clipping');
      }
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,
        'Editorial '+v.id+' may not introduce horizontal viewport overflow');
      await page.evaluate(css=>{
        const n=document.querySelector(css);
        if(n)window.scrollTo({top:Math.max(0,scrollY+n.getBoundingClientRect().top-105),behavior:'instant'});
      },v.container);
      await page.waitForTimeout(85);
      await page.screenshot({path:path.join(output,stem+'-'+v.file+'.png'),fullPage:false});
    }
    assert.equal(errors.length,0,'Styling must not produce runtime errors '+errors.join(' | '));

    // Scroll through each authored room in overlapping viewport-sized frames.
    // Keep the earlier interaction-specific captures as separate evidence.
    await mkdir(path.join(output,'route-audit'),{recursive:true});
    for(const route of ['overview','works','observatory','collection','reference','protocols','gates','holds']){
      await page.goto(site+'#'+route,{waitUntil:'domcontentloaded'});
      await page.waitForFunction(id=>document.body.dataset.view===id&&
        !document.getElementById('view-'+id)?.hidden,route);
      const entered=await page.evaluate(id=>{
        const sec=document.getElementById('view-'+id),st=getComputedStyle(sec);
        return {animation:st.animationName,opacity:st.opacity};
      },route);
      assert.equal(entered.animation,'none','No route may reintroduce opacity-fade compositing');
      assert.equal(entered.opacity,'1','A room must remain solid through route entry');
      if(route==='collection'&&motion==='no-preference'){
        // The route-audit intentionally sets global Still after each prior
        // screenshot. Hash navigation keeps the SAME document and that toggle.
        // Explicitly resume for this live-motion witness, then the usual
        // route-audit code returns to Still before snapshot walking.
        await page.evaluate(()=>{
          const btn=document.getElementById('motionBtn');
          if(btn?.getAttribute('aria-pressed')==='true')btn.click();
        });
        await page.waitForFunction(()=>document.body.dataset.vixenMotion==='live');
        const stage=page.locator('#vixenSynthesisSalon .vs-optical-stage');
        await stage.scrollIntoViewIfNeeded();
        await page.waitForFunction(()=>{
          const st=window.VIXEN_SALON_PRESENTATION?.status?.();
          return st?.visible&&st?.motion_frames>=2&&st?.target_fps===60;
        },null,{timeout:15000,polling:100});
        const first=await page.evaluate(()=>window.VIXEN_SALON_PRESENTATION.status());
        await page.waitForTimeout(620);
        const later=await page.evaluate(()=>window.VIXEN_SALON_PRESENTATION.status());
        assert(later.motion_frames>first.motion_frames+4,
          'Desktop Salon light must continue between garment geometry frames: '+JSON.stringify({first,later}));
        assert(later.motion_frames>later.geometry_frames,
          '60Hz optical presentation must outrun costly model generation');
        assert.equal(later.clock_count,1,'Salon must retain one host RAF clock');
        await page.screenshot({path:path.join(output,'route-audit',stem+'-salon-optical-presentation.jpg'),
          type:'jpeg',quality:88,fullPage:false});
      }
      await page.waitForFunction(()=>!!window.VixenLivingMesh?.status()?.route);
      await page.evaluate(()=>{
        if(document.getElementById('motionBtn').getAttribute('aria-pressed')!=='true')
          document.getElementById('motionBtn').click();
      });
      await page.waitForTimeout(250);
      const bottom=await page.evaluate(()=>document.documentElement.scrollHeight-innerHeight);
      for(let offset=0,n=0;;offset+=Math.floor(height*.83),n++){
        await page.evaluate(y=>window.scrollTo({top:y,behavior:'instant'}),Math.min(offset,bottom));
        await page.waitForTimeout(90);
        await page.screenshot({path:path.join(output,'route-audit',stem+'-'+route+'-'+String(n).padStart(2,'0')+'.jpg'),
          type:'jpeg',quality:82,fullPage:false});
        if(offset>=bottom)break;
      }
    }

    witness.push({ width, height, motion, head, result: 'GEOMETRY_AND_ROUTE_PASS', before, opticalAssay, errors });
    await context.close();
  }
} finally {
  await browser.close();
}
await writeFile(path.join(output, 'witness.json'), JSON.stringify({
  schema: 'td613.vixen.exact-head-browser-geometry/v1',
  scope: 'source-first layout, same-Work role boundary, accessible route, local Rest',
  creative_scientific_qualification: 'HUMAN_RESERVED',
  hosted_verification: 'NOT_PERFORMED',
  head, witness
}, null, 2) + '\n');
console.log('Vixen exact-head browser geometry passed:', head, witness.map(x => x.width + '×' + x.height).join(', '));
