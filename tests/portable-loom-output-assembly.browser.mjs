// Actual local Loom route with a synthetic rebound capture; zero provider calls.
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { chromium } from 'playwright';
const output = process.env.TD613_OUTPUT_ASSEMBLY_ARTIFACT_DIR || 'artifacts/loom-output-assembly';
await mkdir(output,{recursive:true});
const app = resolve('app'), report = {schema:'td613.loom.output-assembly-browser-witness/v0.1',source_sha:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),observed_at:new Date().toISOString(),basis:'LOCAL_RENDERED_ROUTE_SYNTHETIC_REBOUND_CAPTURE',physical_device_witness:false,provider_requests:0,status:'HOLD',checks:[],source_bytes:{}};
for (const file of ['app/dome-world/holonomy-loom/ai-workspace.js','app/dome-world/holonomy-loom/workspace-template.js','app/engine/portable-loom-core.js','app/engine/portable-loom-session.js','app/engine/portable-loom-output.js','app/engine/portable-loom-receiver-output-contract.js','app/engine/portable-loom-receiver-conformance.js']) report.source_bytes[file]=createHash('sha256').update(await readFile(file)).digest('hex');
report.application_matches_commit=Object.entries(report.source_bytes).every(([file,hash])=>{try{return createHash('sha256').update(execFileSync('git',['show',`HEAD:${file}`],{stdio:['ignore','pipe','ignore']})).digest('hex')===hash;}catch{return false;}});
const retained = JSON.parse(await readFile('tests/fixtures/portable-loom-source-registration-n02.json','utf8')).input.answer;
const server=createServer(async(req,res)=>{try{const file=resolve(app,'.'+new URL(req.url,'http://localhost').pathname);if(!file.startsWith(app+'/'))throw new Error('outside app');res.setHeader('Content-Type',({'.js':'text/javascript','.html':'text/html','.css':'text/css','.json':'application/json','.svg':'image/svg+xml'})[extname(file)]||'application/octet-stream');res.end(await readFile(file));}catch{res.statusCode=404;res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base=`http://127.0.0.1:${server.address().port}`;
let browser;
try {
  browser=await chromium.launch({headless:true});
  for(const [name,viewport] of [['desktop',{width:1280,height:900}],['390px',{width:390,height:844}]]) {
    const page=await browser.newPage({viewport,reducedMotion:'reduce'}),errors=[],blocked=[];
    page.setDefaultTimeout(15000);page.on('pageerror',e=>errors.push(e.message));
    await page.route('**/*',route=>{if(route.request().method()!=='GET'||!route.request().url().startsWith(base)){blocked.push(route.request().url());return route.abort();}return route.continue();});
    const open = async()=>{
      await page.goto(`${base}/dome-world/holonomy-loom.html`);
      await page.locator('#loomFirstCrossingLeave').click();
      await page.locator('.loom-builder-shell').waitFor({state:'visible'});
    };
    await open();
    assert.equal(await page.locator('#aiInspectTurnAnswer').isDisabled(),true);
    await page.locator('#aiTask').fill('State the public fee.');await page.locator('#aiPreparePortable').click();
    await page.waitForFunction(()=>!document.querySelector('#aiCopySession').disabled);
    await page.locator('#loomPreparedInspect').click();
    await page.locator('#aiTurnVerify > summary').click();
    const original=await page.locator('#aiSessionReceipt').textContent();
    const contract=JSON.parse(original).receiver_turn_contract;
    const answer=retained.replace(/```json\n([\s\S]*?)\n```/,(_,json)=>{
      const receipt=JSON.parse(json);Object.assign(receipt,{session_root_ref:contract.session_root_ref,policy_commitment:contract.effective_policy_commitment,anchor_work_unit_ref:contract.current_work_unit_ref,operator_task:'State the public fee.',receiver_declaration:'I described the selected source; registration remains missing.'});
      return '```json\n'+JSON.stringify(receipt,null,2)+'\n```';
    });
    await page.locator('#aiTurnExpectedTask').fill('State the public fee.');
    assert.equal(await page.locator('#aiTurnAllowedIds').inputValue(),'');
    await page.locator('#aiTurnSourceInventory').fill(JSON.stringify([{label:'Visible inline source',selected:true,outbound_visible:true,registered_id:null}],null,2));
    await page.locator('#aiTurnAnswerInput').fill(answer);
    await page.locator('#aiInspectTurnAnswer').focus();await page.keyboard.press('Enter');
    await page.locator('#aiTurnAnswerResult').waitFor({state:'visible'});
    assert.equal(await page.evaluate(()=>document.activeElement.id),'aiTurnAnswerResult');
    const result=JSON.parse(await page.locator('#aiTurnAnswerTechnical').textContent());
    assert.deepEqual(result.inspection.findings,['SOURCE_IDENTIFIER_UNREGISTERED']);
    assert.equal(result.source_context.unidentified_source_count,1);
    assert.equal(result.inspection.admission_authority,false);
    assert.equal(await page.locator('#aiSessionReceipt').textContent(),original);
    await page.locator('#aiTurnAnswerResult').scrollIntoViewIfNeeded();
    await page.screenshot({path:`${output}/${name}-source-hold.png`});
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1));
    await page.locator('#aiTurnAnswerInput').fill('{');assert.equal(await page.locator('#aiTurnAnswerResult').isVisible(),false);
    await page.locator('#aiInspectTurnAnswer').click();assert.match(await page.locator('#aiTurnAnswerVerdict').textContent(),/HOLD/);
    await page.locator('#aiTurnAnswerInput').fill(answer.replace(contract.session_root_ref,'0'.repeat(64)));
    await page.locator('#aiInspectTurnAnswer').click();
    assert.ok(JSON.parse(await page.locator('#aiTurnAnswerTechnical').textContent()).inspection.findings.includes('RECEIPT_ORIGIN_REFERENCE_MISMATCH'));
    await page.locator('#loomToolsClose').click();
    await page.reload();await page.locator('#loomFirstCrossingLeave').click();
    assert.equal(await page.locator('#aiInspectTurnAnswer').isDisabled(),true);
    assert.equal(await page.locator('#aiTurnAnswerResult').isVisible(),false);
    assert.equal(await page.locator('#aiTurnAnswerInput').inputValue(),'');
    assert.equal(await page.locator('#aiTurnSourceInventory').inputValue(),'');
    assert.equal(blocked.length,0);assert.deepEqual(errors,[]);
    report.checks.push({viewport:name,ordinary_entry:true,source_missingness_preserved:true,keyboard_focus:true,scroll:true,malformed_hold:true,stale_root_hold:true,reload_does_not_restore_authority:true,custody_unchanged:true});
    await page.close();
  }
  report.status='PASS';
}catch(error){report.failure=String(error.stack||error);process.exitCode=1;}
finally{await browser?.close();await new Promise(r=>server.close(r));await writeFile(`${output}/report.json`,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({status:report.status,checks:report.checks.length,failure:report.failure}));}
