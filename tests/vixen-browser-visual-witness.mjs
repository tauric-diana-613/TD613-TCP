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
    // User-supplied Claude Candidates 1/2/3 genre restoration:
    // editorial interface must be navigable and stateful, not a static
    // screenshot with inoperative buttons.
    await page.waitForFunction(()=>window.VIXEN_EDITORIAL_GENRE?.mounted===true,null,{timeout:15000});
    const foyer=page.locator('.vixen-editorial-foyer');
    assert.equal(await foyer.locator('button[data-view]').count(),4,
      'Four callable research-doorway entrances missing');
    assert.equal(await foyer.isVisible(),true);
    const genre=await page.evaluate(()=>{
      const f=document.querySelector('.vixen-editorial-foyer');
      return {
        display:getComputedStyle(document.querySelector('.vixen-doorways')).display,
        overflow:document.documentElement.scrollWidth-innerWidth,
        active:window.VIXEN_EDITORIAL_GENRE?.getState?.(),
        label:f.querySelector('h2')?.textContent,
        inheritedRuntime:!!window.VIXEN_STUDY_TRAY
      };
    });
    assert.equal(genre.display,'grid','Candidate invitation must be spatial and interactive');
    assert(genre.overflow<=1,'Editorial foyer must not cause horizontal overflow');
    assert.equal(genre.active?.source_estate,'EMSTD613');
    assert.equal(genre.active?.doorways?.length,4);
    assert.equal(genre.inheritedRuntime,true,'Source study tray must remain native owner');
    await foyer.scrollIntoViewIfNeeded();
    await page.waitForTimeout(100);
    await page.screenshot({
      path:path.join(output,'vixen-'+width+'x'+height+'-claude-editorial-foyer.png'),
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
      return window.VIXEN_EDITORIAL_GENRE?.getState?.().carried_items===1;
    },null,{timeout:4000});
    assert.equal(await page.locator('#vixenCarryCount').textContent(),'1');
    await page.evaluate(id=>window.VIXEN_STUDY_TRAY.remove(id),carry);
    await page.waitForFunction(()=>{
      return window.VIXEN_EDITORIAL_GENRE?.getState?.().carried_items===0;
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
    const foundry=page.locator('#vixenElectricFoundry');
    assert.equal(await foundry.locator('.ef-hero-tab').count(),6,
      'Six art-directed flagship experiences rather than twenty-eight nominal visual demos');
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

    const stem = 'vixen-' + width + 'x' + height + (motion === 'reduce' ? '-reduced' : '');
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
    const salonGeom=await page.evaluate(()=>{
      const root=document.querySelector('#vixenSynthesisSalon');
      const original=root.querySelector('.vs-source-card');
      const header=document.querySelector('.site-header').getBoundingClientRect();
      const r=original.getBoundingClientRect();
      return {top:r.top,headerBottom:header.bottom,
        documentWidth:document.documentElement.scrollWidth,viewport:innerWidth}
    });
    assert(salonGeom.documentWidth <= width+1,'Salon horizontal overflow at '+width);
    assert(salonGeom.top<height-55,'Original Vixen source must be visible in first Salon viewport: '+width);
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
    await page.waitForFunction(()=>!document.querySelector('#vixenToast')?.classList.contains('visible'),null,{timeout:6000});
    await page.waitForTimeout(90);
    await page.screenshot({path:path.join(output,stem+'-salon-theorem.png'),fullPage:false});
    assert.equal(errors.length,0,'Uncaught errors across source-bound Salon: '+errors.join(' | '));

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
