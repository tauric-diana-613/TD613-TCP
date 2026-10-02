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
      const host=doc.createElement('div');host.id='readingWitnessHost';host.style.maxWidth='760px';host.style.margin='20px auto';
      const stage=doc.createElement('section');stage.className='relay-stage relay-khonapolit relay-integrated-covenant';
      const head=doc.createElement('div');head.className='relay-stage-head';head.textContent='Kʰonapolit ∴ Tauric Diana bots';
      const exact=doc.createElement('div');exact.className='relay-stage-text';exact.textContent=source;
      stage.append(head,exact);host.append(stage);doc.body.prepend(host);
      mod.installMarrowlineReadingSurface(stage,window);
      const reading=stage.querySelector('.marrowline-reading-view');
      const buttons=[...stage.querySelectorAll('.marrowline-reading-tools button')];
      const exactButton=buttons.find(button=>button.textContent==='Exact return');
      const readingButton=buttons.find(button=>button.textContent==='Reading view');
      const baseline={
        source:exact.textContent,
        source_hidden:exact.hidden,
        reading_hidden:reading.hidden,
        heading:reading.querySelector('h4')?.textContent||'',
        strong:reading.querySelector('strong')?.textContent||'',
        list:[...reading.querySelectorAll('ol li')].map(node=>node.textContent),
        equation:reading.querySelector('.marrowline-reading-equation code')?.textContent||'',
        executable_images:reading.querySelectorAll('img').length,
        reading_text:reading.textContent
      };
      exactButton.click();
      const exactMode={source_hidden:exact.hidden,reading_hidden:reading.hidden,source:exact.textContent};
      readingButton.click();
      const restored={source_hidden:exact.hidden,reading_hidden:reading.hidden,source:exact.textContent};
      const rect=host.getBoundingClientRect();
      return {baseline,exactMode,restored,overflow:Math.max(0,rect.right-window.innerWidth),schema:stage.querySelector('.marrowline-reading-surface')?.dataset.schema||null};
    },raw);
    const pass=observed.baseline.source===raw &&
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
      observed.overflow===0 && errors.length===0;
    await page.screenshot({path:`${artifactDir}/reading-${posture.name}.png`,fullPage:true});
    results.push({posture:posture.name,pass,errors,observed});
    await context.close();
  }
  const receipt={
    schema:'td613.marrowline.reading-surface-browser-witness/v0.1',
    status:results.every(result=>result.pass)?'PASS':'FAIL',
    source_sha:sourceHead,
    context:'LOCAL_RENDERED_UI_WITH_SYNTHETIC_PROVIDER_TEXT',
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
