/** Bounded renderer comparison, not a physical-device smoothness claim.
 * TD613_BROWSER_EXECUTABLE=/path/to/chromium TD613_PROFILE_ARTIFACT_DIR=/tmp/loom-profile node tests/loom-pagewide-profile.browser.mjs
 * Baseline defaults to HEAD; override TD613_PROFILE_BASE for a later replay.
 */
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { chromium } from 'playwright';

const baseRef=process.env.TD613_PROFILE_BASE||'HEAD';
const baseSha=execFileSync('git',['rev-parse',baseRef],{encoding:'utf8'}).trim();
const root=resolve('app'),artifacts=process.env.TD613_PROFILE_ARTIFACT_DIR;
const bytes={},cache=new Map();
const server=createServer(async(req,res)=>{
  try{
    const pathname=new URL(req.url,'http://localhost').pathname;
    const match=pathname.match(/^\/(before|after)\/(.*)$/);
    if(req.method!=='GET'||!match)throw Error('Read-only witness');
    const [,kind,relative]=match;
    if(relative==='witness.html'){
      res.setHeader('Content-Type','text/html');
      return res.end('<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;background:#080b12}#field,svg{position:fixed;inset:0;width:100%;height:100%}svg{overflow:hidden}svg text{font-family:system-ui,sans-serif}.loom-field-flight text{opacity:.3}</style><div id="field"></div>');
    }
    const file=resolve(root,relative);
    if(!file.startsWith(root+sep))throw Error('Path escape');
    const key=kind+'/'+relative;
    if(!cache.has(key))cache.set(key,kind==='before'?execFileSync('git',['show',`${baseSha}:app/${relative}`]):await readFile(file));
    const data=cache.get(key);bytes[key]=createHash('sha256').update(data).digest('hex');
    res.setHeader('Content-Type',extname(file)==='.js'?'text/javascript':'application/octet-stream');res.end(data);
  }catch{res.statusCode=404;res.end();}
});
await new Promise(done=>server.listen(0,'127.0.0.1',done));
const browser=await chromium.launch({headless:true,...(process.env.TD613_BROWSER_EXECUTABLE?{executablePath:process.env.TD613_BROWSER_EXECUTABLE,args:['--no-sandbox']}: {})});
const report={baseline:baseSha,source_head:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),
  scope:'Same local Chromium, renderer-only CPU and attribute writes. Three alternating trials, 120 warmup + 360 samples. Frame delivery, physical iPhone, human comprehension and full-page raster cost unmeasured.',
  browser:browser.version(),provider_calls:0,served_sha256:bytes,trials:[]};
try{
  if(artifacts)await mkdir(artifacts,{recursive:true});
  for(const width of [390,1280])for(let trial=0;trial<3;trial++)for(const kind of trial%2?['after','before']:['before','after']){
    const context=await browser.newContext({viewport:{width,height:844}}),page=await context.newPage();
    await page.goto(`http://127.0.0.1:${server.address().port}/${kind}/witness.html`);
    const result=await page.evaluate(async({kind,width})=>{
      const {mountLoomInstrumentStateView,compileLoomInstrumentStateView}=await import(`/${kind}/dome-world/holonomy-loom/instrument-state-view.js`);
      const {loomOpeningPresentation}=await import(`/${kind}/dome-world/holonomy-loom/tutorial-membrane.js`);
      const {selectFlowcoreChoreography}=await import(`/${kind}/dome-world/holonomy-loom/flowcore-choreography.js`);
      const packet={phase:'prepared',scene:{id:'first-crossing-paired-profile'},geometry:{rest:false},task_present:false,
        selected_document_ids:[],shared:0,local:0,outbound_submitted:false,response_received:false,binding_verified:false,
        presentation:loomOpeningPresentation(selectFlowcoreChoreography(0))};
      const view=await compileLoomInstrumentStateView(packet,{events:[],cryptoImpl:crypto});
      const renderer=mountLoomInstrumentStateView(document.getElementById('field'),{fullPage:kind==='after'});
      const frame=(n,reducedMotion=false)=>({packet,progress:1,timeMs:2600,motionTimeMs:n*1000/60,reducedMotion,viewport:{width,height:844,dpr:1}});
      for(let n=0;n<120;n++)renderer.update(view,frame(n));
      let writes=0,redundant=0;const setAttribute=Element.prototype.setAttribute,times=[];
      Element.prototype.setAttribute=function(name,value){writes++;if(this.getAttribute(name)===String(value))redundant++;return setAttribute.call(this,name,value);};
      try{for(let n=120;n<480;n++){const start=performance.now();renderer.update(view,frame(n));times.push(performance.now()-start);}}
      finally{Element.prototype.setAttribute=setAttribute;}
      const sample=()=>[...document.querySelectorAll('.loom-field-flight text')].map(n=>({glyph:n.textContent,relation:n.dataset.flightRelation,transform:n.getAttribute('transform')}));
      renderer.update(view,frame(60));const first=sample();renderer.update(view,frame(120));const second=sample();
      renderer.update(view,frame(180,true));const still=sample();renderer.update(view,frame(300,true));const reducedStable=JSON.stringify(still)===JSON.stringify(sample());
      renderer.update(view,frame(120));times.sort((a,b)=>a-b);
      const result={p50_ms:times[180],p95_ms:times[342],total_ms:times.reduce((a,b)=>a+b,0),writes,redundant,
        carrier_count:second.length,glyphs:[...new Set(second.map(n=>n.glyph))],moved:second.filter((n,i)=>n.transform!==first[i].transform).length,
        reducedStable,viewBox:document.querySelector('svg').getAttribute('viewBox')};
      return result;
    },{kind,width});
    assert.equal(result.carrier_count,39);assert.equal(result.moved,39);assert.equal(result.glyphs.length,8);assert.equal(result.reducedStable,true);assert.equal(result.redundant,0);
    report.trials.push({width,trial,kind,...result});
    if(artifacts&&trial===0)await page.screenshot({path:resolve(artifacts,`${kind}-${width}.png`)});
    await context.close();
  }
}finally{await browser.close();server.close();}
if(artifacts)await writeFile(resolve(artifacts,'report.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
