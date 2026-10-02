import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';

const base=process.env.TD613_BASE_URL || 'http://127.0.0.1:6131';
const sourceHead=process.env.TD613_SOURCE_HEAD || 'UNPINNED';
const artifactDir=process.env.TD613_READING_ARTIFACT_DIR || 'artifacts/marrowline-reading-surface';

const raw=[
  '### Acquisition diligence',
  '',
  '**Option A total:** $137,591.52',
  '',
  '1. Preserve source IDs.',
  '2. Distinguish arithmetic from assumptions.',
  '',
  '$$',
  '38 × 240 × 12 = 109440',
  '$$',
  '',
  'Raw HTML stays text: <img src=x onerror="globalThis.PWNED=true">',
  '',
  'Tauric Diana: h̴̢̛͈õ̵̖̿t̶̬͝'
].join('\n');

const browser=await chromium.launch({headless:true});
const results=[];
try{
  await mkdir(artifactDir,{recursive:true});
  for(const posture of [
    {name:'desktop',width:1280,height:900},
    {name:'mobile-390',width:390,height:844}
  ]){
    const context=await browser.newContext({viewport:{width:posture.width,height:posture.height}});
    const page=await context.newPage();
    const errors=[];
    page.on('pageerror',error=>errors.push(String(error?.message||error)));
    await page.goto(base+'/dome-world/marrowline.html',{waitUntil:'domcontentloaded'});
    const observed=await page.evaluate(async source=>{
      const mod=await import('./marrowline-reading-surface.js');
      const doc=document;
      const messages=doc.getElementById('khonapolitMessages');
      messages.innerHTML='';

      const makeCard=(requestId='')=>{
        const card=doc.createElement('article');card.className='relay-message';card.dataset.role='model';
        const stage=doc.createElement('section');stage.className='relay-stage relay-khonapolit relay-integrated-covenant';stage.dataset.present='true';
        const head=doc.createElement('div');head.className='relay-stage-head';head.textContent='Kʰonapolit ∴ Tauric Diana bots';
        const exact=doc.createElement('div');exact.className='relay-stage-text';exact.textContent=source;
        stage.append(head,exact);card.append(stage);messages.append(card);
        if(requestId){
          card.dataset.loomReadingSchema=mod.MARROWLINE_LOOM_READING_WORK_UNIT_SCHEMA;
          card.dataset.loomReadingRequestId=requestId;
          card.dataset.loomReadingPhase='CONTINUE';
          card.dataset.loomReadingExpiresAt=String(Date.now()+60000);
        }
        return {card,stage,exact};
      };

      const ordinary=makeCard();
      const ordinaryInstall=mod.installMarrowlineReadingSurface(ordinary.stage,window);
      const ordinaryState={installed:Boolean(ordinaryInstall),controls:ordinary.stage.querySelectorAll('.marrowline-reading-tools').length,source_hidden:ordinary.exact.hidden};

      let routePhase='DONE';
      window.__TD613_LOOM_DEMO_CONTROLLER__={snapshot:()=>({
        active:true,phase:routePhase,current_result_request_id:'req-current',predecessor_request_id:'req-current'
      })};
      const governed=makeCard('req-current');
      const authority=mod.resolveMarrowlineLoomReadingAuthority(governed.card,window);
      mod.installMarrowlineReadingSurface(governed.stage,window,authority);
      const reading=governed.stage.querySelector('.marrowline-reading-view');
      const tools=governed.stage.querySelector('.marrowline-reading-tools');
      const buttons=[...tools.querySelectorAll('button')];
      const exactButton=buttons.find(button=>button.textContent==='Exact');
      const readingButton=buttons.find(button=>button.textContent==='Reading');
      const baseline={
        source:governed.exact.textContent,
        source_hidden:governed.exact.hidden,
        reading_hidden:reading.hidden,
        heading:reading.querySelector('h4')?.textContent||'',
        strong:reading.querySelector('strong')?.textContent||'',
        list:[...reading.querySelectorAll('ol li')].map(node=>node.textContent),
        equation:reading.querySelector('.marrowline-reading-equation code')?.textContent||'',
        executable_images:reading.querySelectorAll('img').length,
        reading_text:reading.textContent,
        labels:buttons.map(button=>button.textContent),
        max_button_height:Math.max(...buttons.map(button=>button.getBoundingClientRect().height)),
        tools_after_reading:tools.getBoundingClientRect().top>=reading.getBoundingClientRect().bottom-1
      };
      exactButton.click();
      const exactMode={source_hidden:governed.exact.hidden,reading_hidden:reading.hidden,source:governed.exact.textContent};
      readingButton.click();
      const restored={source_hidden:governed.exact.hidden,reading_hidden:reading.hidden,source:governed.exact.textContent};
      routePhase='EXPIRED';
      const staleAuthority=mod.resolveMarrowlineLoomReadingAuthority(governed.card,window);
      routePhase='DONE';
      const rect=messages.getBoundingClientRect();
      return {
        ordinary:ordinaryState,
        authority:Boolean(authority),
        stale_authority:Boolean(staleAuthority),
        baseline,exactMode,restored,
        overflow:Math.max(0,rect.right-window.innerWidth),
        schema:governed.stage.querySelector('.marrowline-reading-surface')?.dataset.schema||null
      };
    },raw);
    const pass=observed.ordinary.installed===false &&
      observed.ordinary.controls===0 && observed.ordinary.source_hidden===false &&
      observed.authority===true && observed.stale_authority===false &&
      observed.baseline.source===raw &&
      observed.exactMode.source===raw && observed.restored.source===raw &&
      observed.baseline.source_hidden===true && observed.baseline.reading_hidden===false &&
      observed.exactMode.source_hidden===false && observed.exactMode.reading_hidden===true &&
      observed.restored.source_hidden===true && observed.restored.reading_hidden===false &&
      observed.baseline.heading==='Acquisition diligence' &&
      observed.baseline.strong==='Option A total:' &&
      observed.baseline.list.length===2 &&
      observed.baseline.equation==='38 × 240 × 12 = 109440' &&
      observed.baseline.executable_images===0 &&
      observed.baseline.reading_text.includes('<img src=x onerror=') &&
      observed.baseline.reading_text.includes('h̴̢̛͈õ̵̖̿t̶̬͝') &&
      JSON.stringify(observed.baseline.labels)===JSON.stringify(['Reading','Exact','Copy exact']) &&
      observed.baseline.max_button_height<=30 &&
      observed.baseline.tools_after_reading===true &&
      observed.overflow===0 && errors.length===0;
    await page.screenshot({path:`${artifactDir}/reading-${posture.name}.png`,fullPage:true});
    results.push({posture:posture.name,pass,errors,observed});
    await context.close();
  }
  const receipt={
    schema:'td613.marrowline.reading-surface-browser-witness/v0.2',
    status:results.every(result=>result.pass)?'PASS':'FAIL',
    source_sha:sourceHead,
    context:'LOCAL_RENDERED_UI_WITH_SYNTHETIC_ORDINARY_AND_GOVERNED_LOOM_RETURNS',
    live_provider_calls:0,
    human_comprehension_measured:false,
    postures:results
  };
  await writeFile(`${artifactDir}/receipt.json`,JSON.stringify(receipt,null,2));
  console.log(JSON.stringify(receipt,null,2));
  if(receipt.status!=='PASS')process.exitCode=1;
}finally{
  await browser.close();
}
