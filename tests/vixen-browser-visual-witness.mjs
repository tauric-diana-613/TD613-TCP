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
    assert.equal(await page.evaluate(()=>document.body.dataset.view),'works');
    assert.equal(await foxRail.locator('button[data-view="works"]').getAttribute('aria-current'),'page');
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
        renderedFilter:rendered?getComputedStyle(rendered).filter:null
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
      assert.match(artRoute.current,/frontispiece-(mobile|desktop)\.png/);
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
    await page.screenshot({
      path:path.join(output,'vixen-'+width+'x'+height+'-mugler-chromepunk-frontispiece.png'),
      fullPage:false
    });
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
    assert.equal(await wardrobe.locator('.formula-card').count(),22,
      'All twenty-two mathematical Folios must remain materially present in the original source archive');
    assert.equal(await wardrobe.getAttribute('data-expanded'),'false');
    assert.equal(await wardrobe.locator('.formula-card:visible').count(),4,
      'Source-first couture gallery must not dump all twenty-two cards on initial encounter');
    assert.deepEqual(await wardrobe.locator('.formula-card:visible').evaluateAll(nodes=>nodes.map(n=>n.dataset.folioId)),
      ['TCC-01','TCC-04','RC-03','RC-10'],
      'Featured edit must span original Cybernetics and Refractive Couture families, not blindly show first four metadata rows');
    const galleryReveal=page.locator('#formulaGalleryReveal');
    assert.equal(await galleryReveal.isVisible(),true);
    await page.evaluate(()=>{
      const node=document.querySelector('.formula-gallery-intro');
      window.scrollTo({top:Math.max(0,window.scrollY+node.getBoundingClientRect().top-110),behavior:'instant'});
    });
    await page.waitForFunction(()=>!document.querySelector('#vixenToast')?.classList.contains('visible'),null,{timeout:15000,polling:250});
    // Chromium screen capture can starve during simultaneous WebGL/Canvas
    // frame production. Preserve the real human Still switch, capture one
    // stable frame, then restore its prior state. Active animation receives
    // its own frame-progress witness later in this same test.
    const wasStill=await page.locator('#motionBtn').getAttribute('aria-pressed');
    if(wasStill!=='true')await page.evaluate(()=>document.getElementById('motionBtn').click());
    try {
      await page.screenshot({
        path:path.join(output,stem+'-math-wardrobe-featured.png'),
        fullPage:false,animations:'disabled',timeout:60000
      });
    } finally {
      if(wasStill!=='true')await page.evaluate(()=>document.getElementById('motionBtn').click());
    }
    await galleryReveal.click();
    assert.equal(await wardrobe.locator('.formula-card:visible').count(),22,
      'Explicit gallery opening must reveal every original mathematical Folio');
    assert.equal(await galleryReveal.getAttribute('aria-expanded'),'true');
    await galleryReveal.click();
    assert.equal(await wardrobe.locator('.formula-card:visible').count(),4,
      'Curated gallery should close without deleting or modifying original source nodes');
    await page.locator('#formulaSearchInput').fill('RC-07');
    assert.equal(await wardrobe.getAttribute('data-expanded'),'true',
      'An explicit search must not hide matching source Folios behind curation');
    assert.equal(await wardrobe.locator('.formula-card:visible').count(),1);
    await page.locator('#formulaSearchInput').fill('');
    assert.equal(await wardrobe.locator('.formula-card:visible').count(),4);
    const foundry=page.locator('#vixenElectricFoundry');
    assert.equal(await foundry.locator('.ef-hero-tab').count(),6,
      'Six art-directed flagship experiences rather than twenty-eight nominal visual demos');
    assert.equal(await foundry.locator('.ef-proscenium .ef-aria-score .ef-hero-tab').count(),6,
      'Six original mathematical works must be scored beside the computed stage, not dumped as a dashboard grid');
    assert.equal(await foundry.locator('.ef-readout').isHidden(),true,
      'The technical evidence inspector must not permanently compete with the artwork');
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
    await foundry.locator('.ef-hero-tab[data-lab-id="LAB_RC-07"]').click();
    const rankProbe=await page.evaluate(()=>window.VIXEN_ELECTRIC_FOUNDRY.getResearchProbe());
    assert.equal(rankProbe.corpus_coordinates.source_folio,'RC-07');
    assert(rankProbe.metrics.some(x=>x.name==='singular_values'));
    const rankScene=await page.evaluate(()=>document.querySelector('#vixenElectricFoundry .ef-notation').toDataURL('image/png'));
    assert.notEqual(rankScene,secondScore,'Rank lab must draw a genuinely distinct scene from Control Planes');
    await foundry.locator('.ef-hero-tab[data-lab-id="LAB_RC-10"]').click();
    const xorProbe=await page.evaluate(()=>window.VIXEN_ELECTRIC_FOUNDRY.getResearchProbe());
    assert(xorProbe.metrics.some(x=>x.name==='joint_I_XY_Z'&&x.value===1));
    const xorScene=await page.evaluate(()=>document.querySelector('#vixenElectricFoundry .ef-notation').toDataURL('image/png'));
    assert.notEqual(xorScene,rankScene,'XOR must project its own information-flow geometry');
    if(width===1440){
      for(const lab of ['LAB_TCC-04','LAB_TCC-05','LAB_RC-03','LAB_RC-07','LAB_RC-10']){
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
      {name:/Enter Operahouse reading room/}).click();
    assert.equal(await page.locator('#vixenReferenceChamber').isHidden(),true,
      'The Vixen Opera must leave the visible stage before a Universal record is inspected');
    assert.equal(await house.isVisible(),true);
    assert.equal(await page.locator('body').getAttribute('data-active-research-stage'),'OPERAHOUSE');
    assert.equal(await page.locator('#operahouseStageReturn').isVisible(),true);
    assert.equal(await page.locator('.site-header .brand').isHidden(),true);
    assert.equal(await page.locator('footer.footer').isHidden(),true,
      'The Vixen research footer cannot remain visible on the Operahouse stage');
    assert.match(await page.title(),/Operahouse/);
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
    await house.locator('.oh-disposition .oh-payload summary').click();
    const summaryColor=await house.locator('.oh-disposition .oh-payload summary')
      .evaluate(n=>getComputedStyle(n).color);
    assert.equal(summaryColor,'rgb(51, 35, 52)',
      'The manuscript-paper receipt disclosure must render with legible dark ink');
    const receipt=JSON.parse(await house.locator('.oh-disposition .oh-payload pre').innerText());
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
    await house.getByRole('button',{name:/Return to Vixen Opera/}).click();
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
    await page.waitForFunction(()=>
      window.VixenLivingMesh?.status()?.rendered_frames>=1
      &&document.getElementById('vixenLivingMesh')?.width>100,
      null,{timeout:15000,polling:250});
    const meshWitness=await page.evaluate(()=>{
      const c=document.getElementById('vixenLivingMesh');
      const state=window.VixenLivingMesh.status();
      const d=c.getContext('2d').getImageData(
       Math.floor(c.width*.43),0,Math.max(1,Math.floor(c.width*.55)),
       Math.max(1,Math.floor(c.height*.65))
      ).data;
      let colored=0;
      for(let i=3;i<d.length;i+=16)if(d[i]>10)colored++;
      return {
       connected:c.isConnected,role:c.dataset.role,
       route:state.route,frames:state.rendered_frames,
       meshCarriers:state.model_carriers,px:colored,
       pointer:getComputedStyle(c).pointerEvents,
       moduleLoaded:[...document.scripts].some(x=>x.src?.includes('vixen-live-mesh-rgi13.mjs')),
       styleLoaded:[...document.styleSheets].some(x=>x.href?.includes('vixen-electrical-breath-rgi13.css'))
      };
    });
    assert(meshWitness.connected,'Live visual mesh must be attached');
    assert.equal(meshWitness.role,'VIXEN_OPERA_VISUAL_ONLY');
    assert.equal(meshWitness.route,'collection');
    assert.equal(await page.evaluate(()=>window.VixenLivingMesh.status().motion),
      motion==='reduce'?'STILL':'AMBIENT_PARKED',
      'Salon-specific live couture takes precedence over redundant ambient paints');
    assert.equal(meshWitness.meshCarriers,39);
    assert.equal(meshWitness.pointer,'none','The electric mesh cannot steal source controls');
    assert.equal(meshWitness.moduleLoaded,true);
    assert.equal(meshWitness.styleLoaded,true);
    assert(meshWitness.px>200,'The canvas must visibly paint model-derived electrical light');
    // RGI14 source-governed OPAL / NO-PLUM commission. This must be a
    // second, physically painted couture layer inside the actual Salon head,
    // with the original outer mesh subordinated to the frontispiece.
    await page.waitForFunction(()=>
      window.VIXEN_OPAL_COUTURE?.status()?.mounted===true,
      null,{timeout:15000,polling:250});
    const opalWitness=await page.evaluate(()=>{
      const canvas=document.querySelector('#vixenSynthesisSalon .vs-head > canvas.vixen-opaline-couture');
      const stage=document.querySelector('#vixenSynthesisSalon .vs-head');
      const rect=canvas?.getBoundingClientRect();
      const data=canvas?.getContext('2d')?.getImageData(
        Math.floor(canvas.width*.56),Math.floor(canvas.height*.12),
        Math.max(1,Math.floor(canvas.width*.34)),Math.max(1,Math.floor(canvas.height*.76))
      )?.data;
      let luminous=0;
      if(data)for(let i=3;i<data.length;i+=16)if(data[i]>8)luminous++;
      return {
        canvas:!!canvas?.isConnected,computed:window.VIXEN_OPAL_COUTURE?.status?.(),
        luminous,stageColor:getComputedStyle(stage).backgroundImage,
        artZ:getComputedStyle(canvas).zIndex,
        cssLoaded:[...document.styleSheets].some(x=>x.href?.includes('vixen-opaline-couture-rgi14.css')),
        moduleLoaded:[...document.scripts].some(x=>x.src?.includes('vixen-opaline-couture-rgi14.mjs'))
      };
    });
    assert.equal(opalWitness.canvas,true,'The true Salon must own its computational couture canvas');
    assert.equal(opalWitness.computed.model_carriers,39);
    assert(opalWitness.computed.beat?.measured_samples>=120,
      'RGI15 must precompute a separately measured beat field before painting');
    assert(opalWitness.computed.beat?.beat_wavelengths_css_px?.every(x=>x>0),
      'The browser must expose finite nonzero beat wavelengths');
    assert(opalWitness.computed.beat?.alias_ratio<=.45,
      'Viewport-aware Nyquist alias bound must hold in Chromium');
    assert(opalWitness.computed.beat?.bloom_visual_budget<=2.40001,
      'The emitted visual glow must honor its declared finite budget');
    assert(opalWitness.computed.beat?.bloom_css_px_limit===18,
      'The bloom kernel cannot silently exceed its declared radius');
    assert.equal(opalWitness.cssLoaded,true);
    assert.equal(opalWitness.moduleLoaded,true);
    assert(opalWitness.luminous>180,
      'Operator-visible opaline corset must contain genuinely computed, luminous pixels, not a stylesheet receipt');
    assert(/linear-gradient/.test(opalWitness.stageColor),
      'An explicit porcelain/chrome optical stage is required');

    // Existing Still button must pause our new animation as well as the
    // historical Observatory; never add a redundant motion authority control.
    await page.evaluate(()=>document.getElementById('motionBtn').click());
    await page.waitForFunction(()=>
      window.VixenLivingMesh?.status()?.motion==='STILL',null,{timeout:5000});
    assert.equal(await page.evaluate(()=>window.VIXEN_OPAL_COUTURE?.status()?.still),true,
      'Operator Still must freeze both the global ambient and local opaline optical dress');
    const stillFrame=await page.evaluate(()=>window.VixenLivingMesh.status().rendered_frames);
    await page.waitForTimeout(125);
    assert.equal(await page.evaluate(()=>window.VixenLivingMesh.status().rendered_frames),stillFrame,
      'Still mode must prevent all new mesh animation frames');
    await page.evaluate(()=>document.getElementById('motionBtn').click());
    // OS-reduced-motion remains STILL after the operator releases the
    // in-page Still switch; only a motion-capable browser may go LIVE.
    const resumedMotion=motion==='reduce'?'STILL':'AMBIENT_PARKED';
    await page.waitForFunction(expected=>
      window.VixenLivingMesh?.status()?.motion===expected,resumedMotion,{timeout:5000});


    // RGI12 operator rejection regression: source-declared plum/pink values
    // never constitute proof of a visible pearl proscenium. The browser must
    // actually load the downstream stylesheet and compute a luminous header.
    const glindaStage=await page.evaluate(()=>{
      const stage=document.querySelector('#vixenSynthesisSalon .vs-head');
      const title=document.querySelector('#vixenSynthesisSalon .vs-title');
      const source=document.querySelector('#vixenSynthesisSalon .vs-source-card');
      const bg=stage?getComputedStyle(stage).backgroundImage:'';
      return {
       loaded:[...document.styleSheets].some(x=>x.href?.includes('glinda-luminous-proscenium-rgi12.css')),
       background:bg,
       titleColor:title?getComputedStyle(title).color:'',
       sourcePosition:source?.getBoundingClientRect().top??null,
       stageBottom:stage?.getBoundingClientRect().bottom??null
      };
    });
    assert.equal(glindaStage.loaded,true,
      'The RGI12 visual architecture must ship to and load in Chromium');
    assert(/linear-gradient/i.test(glindaStage.background),
      'Rejected flat plum stage is forbidden: luminous multistop Glinda gradient must be rendered; actual: '+glindaStage.background);
    // Chromium's serialization of CSS Color 4 gradients is browser-version
    // dependent. Avoid comparing its RGB punctuation with a CSS source literal.
    // The next title-color assertion tests the actual rendered ink on pearl,
    // while the screenshot artifact witnesses the color and optical geometry.
    assert.equal(glindaStage.titleColor,'rgb(23, 26, 28)',
      'The headlining text must be neutral dark chrome on luminous pearl, never the rejected purple-black');
    assert(glindaStage.stageBottom>0,'Operator must encounter the computational optical stage');

    const overture=page.locator('#view-collection .vs-overture-notes');
    assert.equal(await overture.count(),1,'The original research briefing must remain available');
    assert.equal(await overture.getAttribute('open'),null,'The duplicate introduction begins folded');
    await overture.locator('summary').click();
    assert.equal(await overture.locator('p.intro').isVisible(),true,'The full historical brief remains available on request');
    await overture.locator('summary').click();
    assert.equal(await overture.getAttribute('open'),null,'Original source-first composition can be restored');

    // RGI11: a rendered mathematical costume, not an emoji label or a CSS
    // adjective. Pixel alpha must come from actual source-driven Canvas2D.
    assert.equal(await salon.getAttribute('data-optical-contract'),
      'emstd613.vixen.glinda-electric-veil/v1');
    const veil=salon.locator('canvas.vs-luminous-canvas');
    assert.equal(await veil.count(),1,'One source-conditioned computed optical garment');
    assert.equal(await veil.getAttribute('data-computation'),'D3_PHI_LOOM_39_COUTURE_111');
    await page.waitForFunction(()=>{
      const c=document.querySelector('#vixenSynthesisSalon .vs-luminous-canvas');
      if(!c||c.width<200||c.height<200)return false;
      const d=c.getContext('2d')?.getImageData(
       Math.floor(c.width*.48),Math.floor(c.height*.20),
       Math.max(1,Math.floor(c.width*.2)),Math.max(1,Math.floor(c.height*.56))
      ).data;
      if(!d)return false;
      let px=0;
      for(let i=3;i<d.length;i+=4)if(d[i]>10)px++;
      return px>200;
    },null,{timeout:10000});
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
    assert.match(await salon.locator('.vs-result').innerText(),/Experiment B/);
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
    assert.match(await salon.innerText(),/REST · Your source/);
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

    witness.push({ width, height, motion, head, result: 'GEOMETRY_AND_ROUTE_PASS', before, errors });
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
