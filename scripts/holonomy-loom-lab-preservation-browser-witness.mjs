import {chromium, firefox, webkit} from 'playwright';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import path from 'node:path';
import http from 'node:http';
import {execFileSync} from 'node:child_process';
// Source-only browser witness. An isolated, read-only loopback server carries exact app bytes.
const appRoot=path.resolve('app');
const server=http.createServer(async (req,res)=>{
 try{
  const route=new URL(req.url,'http://localhost');
  const file=path.resolve(appRoot,'.'+decodeURIComponent(route.pathname));
  if(!file.startsWith(appRoot+path.sep)||req.method!=='GET'){res.writeHead(403);return res.end();}
  const data=await fs.readFile(file);
  const mime=({'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.json':'application/json'})[path.extname(file)]||'application/octet-stream';
  res.writeHead(200,{'content-type':mime});res.end(data);
 }catch{res.writeHead(404);res.end()}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base='http://127.0.0.1:'+server.address().port;
const artifactDir=path.resolve(process.env.TD613_LAB_PRESERVATION_DIR||'artifacts/loom-lab-preservation');
const output={schema:'td613.loom.phase06.lab-original-tab-preservation/v0.1',source:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),working_tree_dirty:Boolean(execFileSync('git',['status','--porcelain','--untracked-files=no'],{encoding:'utf8'}).trim()),scope:'LOCAL_SERVE_REAL_CHROMIUM_SYNTHETIC_INPUT',viewports:[],provider_requests:0,page_errors:[],status:'HELD'};
await fs.mkdir(artifactDir,{recursive:true});
const engine=process.env.TD613_BROWSER||'chromium';
const browserType={chromium,firefox,webkit}[engine];
if(!browserType)throw new Error('Unknown browser witness engine.');
output.engine=engine;
output.scope='LOCAL_SERVE_REAL_'+engine.toUpperCase()+'_SYNTHETIC_INPUT';
const browser=await browserType.launch({headless:true});
try{
for(const [name,size] of [['320-touch',{width:320,height:844}],['390-touch',{width:390,height:844}],['desktop1280',{width:1280,height:900}]]){
 const context=await browser.newContext({viewport:size,hasTouch:size.width<500,isMobile:size.width<500,acceptDownloads:true,reducedMotion:'reduce'});
 const errs=[];
 context.on('page',page=>page.on('pageerror',e=>{errs.push(e.message);output.page_errors.push(e.message)}));
 await context.route('**/*',route=>{const r=route.request(); const u=new URL(r.url());if(!['GET','HEAD'].includes(r.method())){output.provider_requests++;return route.abort()}if(u.origin!==base)return route.abort();return route.continue()});
 const origin=await context.newPage();
 const startup=await origin.goto(base+'/dome-world/holonomy-loom.html',{waitUntil:'networkidle'});
 assert.equal(startup.status(),200);
 await origin.locator('#loomFirstCrossingLeave').click();
 await origin.locator('.loom-builder-shell').waitFor({state:'visible'});
 const task='FICTIONAL PHASE-06 WORK PRESERVATION '+name;
 await origin.locator('#aiTask').fill(task);
 await origin.locator('#aiUpload').setInputFiles([
 {name:'fictional-evidence.md',mimeType:'text/markdown',buffer:Buffer.from('Synthetic claim: the garden opens at nine.')},
 {name:'fictional-private.md',mimeType:'text/markdown',buffer:Buffer.from('LOCAL_ONLY_CANARY_06')}
 ]);
 const share=origin.getByRole('checkbox',{name:'Share fictional-evidence.md with the AI'});
 const local=origin.getByRole('checkbox',{name:'Share fictional-private.md with the AI'});
 await share.check();assert.equal(await local.isChecked(),false);
 const preSelection={selected:await share.isChecked(),local:await local.isChecked()};
 await origin.locator('#aiPreparePortable').click();
 await origin.waitForFunction(()=>!document.querySelector('#aiExportSession').disabled,{timeout:17000});
 const receipt=await origin.locator('#aiSessionReceipt').textContent();
 assert.ok(receipt.length>0);
 const before={task:await origin.locator('#aiTask').inputValue(),source:preSelection.selected,private:preSelection.local,receipt};
 assert.ok(receipt.includes('fictional-evidence.md'));
 assert.equal(receipt.includes('LOCAL_ONLY_CANARY_06'),false);
 const [lab]=await Promise.all([context.waitForEvent('page'),origin.locator('header a[href="/dome-world/loom-instrument-lab.html"]').click()]);
 await lab.waitForLoadState('networkidle');
 assert.equal(new URL(lab.url()).pathname,'/dome-world/loom-instrument-lab.html');
 assert.equal(await lab.evaluate(()=>window.opener===null),true);
 assert.equal(new URL(origin.url()).pathname,'/dome-world/holonomy-loom.html');
 assert.equal(await origin.locator('#aiTask').inputValue(),before.task);
 assert.equal(before.source,true);
 assert.equal(before.private,false);
 assert.equal(await origin.locator('#aiSessionReceipt').textContent(),before.receipt);
 assert.equal(await origin.locator('#aiExportSession').isDisabled(),false);
 assert.match(await lab.locator('#ilOriginalTabNote').textContent(),/original browser tab/);
 const note=await lab.locator('#ilOriginalTabNote').textContent();
 await lab.locator('#ilReturn').click();
 await lab.waitForURL(u=>u.pathname==='/dome-world/holonomy-loom.html');
 const newLoom=await lab.locator('#aiTask').inputValue();
 assert.equal(newLoom,'');
 assert.equal(await origin.locator('#aiTask').inputValue(),before.task);
 const docs=1; // One explicit selected source, confirmed in the prepared receipt.
 const [lab2]=await Promise.all([
    context.waitForEvent('page'),
    (async()=>{await origin.locator('#loomToolsOpen').click();await origin.locator('.loom-lab-link a').focus();await origin.keyboard.press('Enter')})()
 ]);
 await lab2.waitForLoadState('networkidle');
 assert.equal(await lab2.evaluate(()=>window.opener===null),true);
 assert.equal(await origin.locator('#aiTask').inputValue(),task);
 assert.equal(await origin.locator('#aiSessionReceipt').textContent(),receipt);
 await origin.screenshot({path:path.join(artifactDir,name+'-preserved-origin.png')});
 await lab2.screenshot({path:path.join(artifactDir,name+'-independent-lab.png')});
 output.viewports.push({name,viewport:size,state_preserved:true,prepared_export_still_available:true,selected_source_preserved:true,private_source_withheld:true,lab_opened_in_new_tab:true,lab_no_opener:true,lab_clear_fresh_session_label:true,lab_note:note,new_lab_link_with_tools:true,restored_authority:false,source_count:docs,client_errors:errs,request_count:output.provider_requests,source_receipt_bytes:receipt.length});
 await context.close();
}
assert.deepEqual(output.page_errors,[]);
assert.equal(output.provider_requests,0);
output.status='PASS_BOUNDED_'+engine.toUpperCase()+'_INDEPENDENT_LAB';
}catch(e){output.error=String(e.stack||e);process.exitCode=1}
finally{output.date_finished=new Date().toISOString();await browser.close();await new Promise(resolve=>server.close(resolve));await fs.writeFile(path.join(artifactDir,'lab-preservation.json'),JSON.stringify(output,null,2)+'\n');console.log(JSON.stringify(output,null,2))}

