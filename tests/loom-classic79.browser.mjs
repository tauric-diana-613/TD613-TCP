/* Real local browser validation for recovered 79%-era UI. No provider calls. */
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve, sep, extname, join } from 'node:path';
import { chromium, webkit } from 'playwright';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const dir = resolve(process.env.TD613_CLASSIC79_ARTIFACT_DIR || 'artifacts/loom-classic79-browser');
await mkdir(dir,{recursive:true});
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const root = resolve('app'), served = {}, errors = [], checks = [];
const server = createServer(async(req,res)=>{
  const pathname = new URL(req.url,'http://localhost').pathname;
  try {
    const file = resolve(root,'.'+pathname);
    if(req.method!=='GET'||!file.startsWith(root+sep)) throw Error('not an app file');
    const data = await readFile(file);
    served[pathname] = hash(data);
    res.setHeader('Content-Type',({
      '.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json',
      '.svg':'image/svg+xml','.woff':'font/woff','.woff2':'font/woff2'
    })[extname(file)]||'application/octet-stream');
    res.end(data);
  }catch{res.statusCode=404;res.end('Not found');}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin='http://127.0.0.1:'+server.address().port;
const browsers=[['chromium',chromium],['webkit',webkit]];
let report={schema:'td613.loom.classic79-browser/v0.1',status:'HELD',source_head:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),
 observation:'LOCAL_REAL_BROWSER_CANDIDATE',physical_device_observed:false,provider_calls:0,
 empirical_qualification:0,served,checks,errors};
try{
 for(const [engine,engineType] of browsers){
  const browser=await engineType.launch({headless:true});
  try{
   for(const [name,width,height] of [['desktop',1280,800],['mobile',390,844]]){
    const context=await browser.newContext({viewport:{width,height},reducedMotion:'reduce'});
    const page=await context.newPage();
    page.on('pageerror',e=>errors.push({engine,name,message:e.message}));
    page.on('request',req=>{if(/\/api\//.test(new URL(req.url()).pathname))errors.push({engine,name,message:'Unrequested provider/API call: '+req.url()})});
    await page.goto(origin+'/dome-world/holonomy-loom-classic79.html',{waitUntil:'domcontentloaded'});
    try{await page.waitForFunction(()=>document.documentElement.dataset.loomBoot!=='loading',{timeout:15000})}
    catch{errors.push({engine,name,message:'Boot never settled'})}
    const state=await page.evaluate(()=>{
      const root=document.querySelector('#loomAiWorkspace');
      const panel=document.querySelector('#loomFirstCrossing');
      const title=document.querySelector('#loomFirstCrossingTitle');
      const css=panel?getComputedStyle(panel):null;
      return {boot:document.documentElement.dataset.loomBoot,bootReason:document.documentElement.dataset.loomBootReason||null,
        heading:title?.textContent?.trim()||null,panelExists:!!panel,panelWidth:panel?.getBoundingClientRect().width||0,
        panelBackground:css?.backgroundColor,borderRadius:css?.borderRadius,overflow:document.documentElement.scrollWidth>innerWidth+1,
        html:root?.innerHTML.length||0,exportAvailable:!!document.querySelector('#aiExportSession')};
    });
    const pass=state.boot==='ready'&&state.panelExists&&state.panelWidth>0&&state.exportAvailable&&!state.overflow&&!errors.some(e=>e.engine===engine&&e.name===name);
    checks.push({engine,name,pass,state});
    await page.screenshot({path:join(dir,engine+'-'+name+'-opening.png'),fullPage:true});
    await context.close();
   }
  }finally{await browser.close()}
 }
}finally{server.close()}
report.status=checks.length===4&&checks.every(x=>x.pass)?'PASS':'FAILED';
await writeFile(join(dir,'report.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify({status:report.status,checks:checks.map(x=>({engine:x.engine,name:x.name,pass:x.pass,reason:x.state.bootReason})),errors}));
assert.equal(report.status,'PASS','Original 79%-era interface must boot without overflow in both browser engines');
