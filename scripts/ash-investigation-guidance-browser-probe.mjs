import assert from 'node:assert/strict';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const base=String(process.env.TD613_BASE_URL||'http://127.0.0.1:6130').replace(/\/$/,'');
const artifactDir=path.resolve(process.env.TD613_ARTIFACT_DIR||'artifacts/ash-investigation-guidance');
const keepUrl=`${base}/dome-world/ash-keep.html`;
const VERSION='td613.ash.investigation-demo/v0.2-apeq-paia';
const EXPECTED={rooms:14,nodes:72,relationships:112,routes:6,controls:12,held_outs:8,strata:10,joining_keys:8};

function browserExecutable(){const requested=process.env.TD613_BROWSER_EXECUTABLE;if(requested&&fs.existsSync(requested))return requested;return ['/usr/bin/google-chrome','/usr/bin/chromium','/usr/bin/chromium-browser'].find(candidate=>fs.existsSync(candidate))||null;}
function railIsVisuallyHidden(rail){return rail.display==='none'||(rail.width<=1.1&&rail.height<=1.1);}
async function clearCaseData(page){await page.evaluate(async()=>{for(const key of ['td613.ash-keep.current-case','td613.ash-keep.preferences'])localStorage.removeItem(key);sessionStorage.clear();await new Promise(resolve=>{const request=indexedDB.deleteDatabase('td613-ash-keep');request.onsuccess=request.onerror=request.onblocked=()=>resolve();});});}
async function currentCase(page){return page.evaluate(()=>new Promise((resolve,reject)=>{const caseId=localStorage.getItem('td613.ash-keep.current-case');const request=indexedDB.open('td613-ash-keep');request.onsuccess=()=>{const db=request.result;const tx=db.transaction(['cases','routeMemory']);const c=tx.objectStore('cases').get(caseId),r=tx.objectStore('routeMemory').get(caseId);tx.oncomplete=()=>{db.close();resolve({caseMap:c.result||null,routeMemory:r.result?.value||null});};tx.onerror=()=>{db.close();reject(tx.error);};};request.onerror=()=>reject(request.error);}));}
async function legacyRailReceipt(page){return page.evaluate(()=>[...document.querySelectorAll('.workspace-rail,.ash-lifecycle-rail')].map(node=>{const rect=node.getBoundingClientRect(),style=getComputedStyle(node);return{class_name:node.className,width:rect.width,height:rect.height,display:style.display,overflow:style.overflow,clip_path:style.clipPath,position:style.position};}));}
async function layoutReceipt(page){return page.evaluate(()=>{const visible=[...document.querySelectorAll('button,a,input,select,textarea,[role="tab"]')].filter(node=>{const style=getComputedStyle(node),rect=node.getBoundingClientRect();return style.display!=='none'&&style.visibility!=='hidden'&&rect.width>0&&rect.height>0;});const inScrollLane=node=>{let parent=node.parentElement;while(parent&&parent!==document.body){const style=getComputedStyle(parent);if(/(auto|scroll)/.test(style.overflowX)&&parent.scrollWidth>parent.clientWidth+1)return true;parent=parent.parentElement;}return false;};const clipped=visible.filter(node=>{const rect=node.getBoundingClientRect();return!inScrollLane(node)&&(rect.left< -1||rect.right>innerWidth+1);}).map(node=>node.id||node.textContent?.trim().slice(0,36)||node.tagName);const hero=document.querySelector('#premiumHomeBody .premium-hero h3');return{viewport:{width:innerWidth,height:innerHeight},horizontal_overflow:Math.max(0,document.documentElement.scrollWidth-innerWidth),clipped_controls:clipped,dock_targets:[...document.querySelectorAll('#premiumPrimaryDock button')].map(node=>Math.round(node.getBoundingClientRect().height)),hero_title_font_px:hero?Number.parseFloat(getComputedStyle(hero).fontSize):null,hero_title_lines:hero?Math.round(hero.getBoundingClientRect().height/Number.parseFloat(getComputedStyle(hero).lineHeight)):null};});}

await fsp.mkdir(artifactDir,{recursive:true});
const executablePath=browserExecutable();
const browser=await chromium.launch({headless:true,...(executablePath?{executablePath}:{})});
const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce',acceptDownloads:true});
const page=await context.newPage();page.setDefaultTimeout(60000);
const errors=[],badResponses=[];
page.on('pageerror',error=>errors.push(error.message));
page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
page.on('response',response=>{if(response.status()>=400&&!/favicon\.ico/.test(response.url()))badResponses.push(`${response.status()} ${response.url()}`);});
const report={schema:'td613.ash.investigation-guided-flight/v0.4-apeq-paia',status:'RUNNING',base_url:base,production_promotion_authorized:false,prediction_authorized:false,automatic_action_authorized:false,observations:{},errors,http_errors:badResponses,hold:null};

try{
  await page.goto(keepUrl,{waitUntil:'networkidle'});
  await page.waitForFunction(version=>Boolean(window.__td613AshKeep?.version)&&Boolean(window.__td613AshPremiumUI?.version)&&Boolean(window.__td613AshGuidedOperatorUI?.version)&&window.__td613AshInvestigationDemo?.version===version,VERSION);
  await clearCaseData(page);
  await page.reload({waitUntil:'networkidle'});
  await page.waitForFunction(version=>Boolean(window.__td613AshGuidedOperatorUI?.version)&&window.__td613AshInvestigationDemo?.version===version,VERSION);
  assert.equal(await page.locator('html').getAttribute('data-ash-guided-ui'),'td613.ash.guided-operator-ui/v0.1-investigation-flight');
  assert.equal(await page.locator('html').getAttribute('data-ash-guided-u-i'),null);
  assert(await page.locator('#launch').isVisible(),'Investigation flight did not begin at explicit launch.');
  assert(await page.locator('#guidedLaunchPromise').isVisible(),'Custodial AI-access product promise is absent.');
  assert.match(await page.locator('#guidedLaunchPromise').textContent(),/Protect the case before AI sees the case/);

  await page.locator('#newProfile').selectOption('investigation');
  await page.waitForFunction(()=>{const button=document.getElementById('startDemo');return button&&!button.disabled&&button.dataset.ashMethodDemoState==='READY'&&/Investigation qualification/.test(button.textContent||'');});
  const started=Date.now();await page.locator('#startDemo').click();
  await page.waitForFunction(()=>document.documentElement.dataset.ashDemoProfile==='investigation');
  await page.waitForFunction(()=>document.documentElement.dataset.ashPremiumWorkspace==='home');
  await page.locator('#investigationTaskSpine').waitFor({state:'visible'});
  const orientationMs=Date.now()-started;assert(orientationMs<10000,'Investigation exceeded the ten-second useful-state measure.');

  const current=await currentCase(page);
  assert.equal(current.caseMap?.profile,'investigation');
  assert.equal(current.caseMap?.rooms?.length,EXPECTED.rooms);
  assert.equal(current.caseMap?.nodes?.length,EXPECTED.nodes);
  assert.equal(current.caseMap?.relationships?.length,EXPECTED.relationships);
  assert.equal(current.routeMemory?.entries?.length,EXPECTED.routes);
  const method=await page.evaluate(()=>({counts:window.__td613AshInvestigationDemo.counts,assurance:window.__td613AshInvestigationDemo.assurance}));
  assert.deepEqual(method.counts,{rooms:14,nodes:72,relationships:112,rules:8,routes:6,controls:12,held_outs:8,strata:10,joining_keys:8});
  assert.equal(method.assurance.maximum,'PA2_LOCALLY_EXECUTED');assert.equal(method.assurance.unknown_readers,'UNMEASURED');assert.equal(method.assurance.universal_secrecy,false);
  await page.locator('#apeqPaiaMethodDocket').waitFor({state:'visible'});
  const docket=await page.locator('#apeqPaiaMethodDocket').textContent();
  for(const token of ['APEQ environment qualification','PAIA anisotropic projection field','joining keys · 8','controls · 12','held outs · 8','strata · 10','Unknown Readers UNMEASURED'])assert(docket.includes(token),`Investigation Method Docket omitted ${token}.`);
  await page.screenshot({path:path.join(artifactDir,'investigation-method-docket.png'),fullPage:true});

  assert.equal(await page.locator('#investigationTaskSpine .guided-spine-steps button').count(),5);
  assert.match(await page.locator('#investigationTaskSpine').textContent(),/Protect → Map → Test → Share → Seal/);
  assert.match(await page.locator('#premiumNextAction').textContent(),/Preserve|Compare|Prepare|Run|Seal/i);
  const desktopRails=await legacyRailReceipt(page);assert(desktopRails.length>=2,'Legacy rail receipts were unavailable.');assert(desktopRails.every(railIsVisuallyHidden),`A legacy rail retained visible layout beneath the guided command surface: ${JSON.stringify(desktopRails)}`);

  await page.locator('#premiumPrimaryDock [data-premium-workspace="work"]').click();
  await page.locator('#investigationAiShareGuide').waitFor({state:'visible'});
  assert.equal(await page.locator('#investigationAiShareGuide ol li').count(),6);
  assert.match(await page.locator('#investigationAiShareGuide').textContent(),/Send the question, not the whole investigation/);
  assert.match(await page.locator('#investigationAiShareGuide').textContent(),/cannot establish guilt, intent, identity, authorship, truth, surveillance probability/i);
  assert.equal(await page.locator('#routeId').inputValue(),'route_llm_analysis');
  assert.match(await page.locator('#draftBody').inputValue(),/observable differences and unresolved provenance gaps/i);
  assert.match(await page.locator('#providerTask').inputValue(),/bounded comparison/i);
  assert.match(await page.locator('#protectedLiterals').inputValue(),/protected source alias/i);

  await page.locator('#premiumPrimaryDock [data-premium-workspace="map"]').click();
  const normalHeight=await page.locator('#mapStage').evaluate(node=>Math.round(node.getBoundingClientRect().height));
  await page.locator('#guidedMapFocus').click();assert(await page.locator('#workspace-map').evaluate(node=>node.classList.contains('guided-map-focus')));
  await page.waitForFunction(()=>{const dock=document.getElementById('premiumPrimaryDock'),heading=document.querySelector('#workspace-map > .workspace-head');return dock&&heading&&getComputedStyle(dock).pointerEvents==='none'&&Number.parseFloat(getComputedStyle(dock).opacity)<=0.01&&getComputedStyle(heading).display==='none';});
  const focusedHeight=await page.locator('#mapStage').evaluate(node=>Math.round(node.getBoundingClientRect().height));assert(focusedHeight>=normalHeight,'Focused map became smaller.');
  const focusVisual=await page.evaluate(()=>{const dock=document.getElementById('premiumPrimaryDock'),heading=document.querySelector('#workspace-map > .workspace-head');return{dock_pointer_events:getComputedStyle(dock).pointerEvents,dock_opacity:Number.parseFloat(getComputedStyle(dock).opacity),workspace_heading_display:getComputedStyle(heading).display};});
  assert.equal(focusVisual.dock_pointer_events,'none');assert(focusVisual.dock_opacity<=0.01,'Primary dock remained visible over focused tomography.');assert.equal(focusVisual.workspace_heading_display,'none');
  await page.locator('#guidedMapZoomIn').click();await page.locator('#guidedMapZoomOut').click();await page.screenshot({path:path.join(artifactDir,'investigation-desktop-map-focus.png'),fullPage:true});await page.locator('#guidedMapFocus').click();

  await page.locator('#premiumPrimaryDock [data-premium-workspace="choir"]').click();assert.equal(await page.locator('[data-choir-projection]').count(),4);await page.locator('#runPremiumChoir').click();await page.waitForFunction(()=>/"mode": "PAIRWISE_MOIRE_REBUILD"/.test(document.getElementById('premiumChoirReceipt')?.textContent||''));const choirReceipt=JSON.parse(await page.locator('#premiumChoirReceipt').textContent());assert.equal(choirReceipt.real_surveillance_probability,null);assert.equal(choirReceipt.automatic_ash_action,false);assert.equal(choirReceipt.prediction_authorized,false);assert(!(await page.locator('#premiumChoirReceipt').evaluate(node=>node.closest('details')?.open)),'Exact Choir receipt opened by default.');

  await page.locator('#premiumPrimaryDock [data-premium-workspace="capsule"]').click();assert(await page.locator('#premiumCapsulePassphrase').isVisible());assert(await page.locator('#premiumImportCapsule').isEnabled());await page.waitForFunction(()=>document.querySelectorAll('details.guided-receipt').length>=3);assert((await page.locator('details.guided-receipt').count())>=3,'Exact receipts were not compressed behind disclosure controls.');

  await page.setViewportSize({width:390,height:844});await page.locator('#premiumPrimaryDock [data-premium-workspace="home"]').click();await page.waitForTimeout(250);const mobile=await layoutReceipt(page),mobileRails=await legacyRailReceipt(page);assert.equal(mobile.horizontal_overflow,0,'Investigation mobile document overflowed.');assert.deepEqual(mobile.clipped_controls,[],'Investigation mobile controls clipped.');assert(mobile.dock_targets.every(value=>value>=48),'A primary dock target fell below 48 px.');assert(mobile.hero_title_font_px!=null&&mobile.hero_title_font_px<=20,`Mobile hero title remained oversized at ${mobile.hero_title_font_px}px.`);assert(mobileRails.every(railIsVisuallyHidden),`A legacy rail retained mobile layout: ${JSON.stringify(mobileRails)}`);await page.screenshot({path:path.join(artifactDir,'investigation-mobile-command-deck.png'),fullPage:true});

  assert.deepEqual(errors,[],`Investigation browser errors: ${errors.join(' | ')}`);assert.deepEqual(badResponses,[],`Investigation HTTP errors: ${badResponses.join(' | ')}`);
  report.status='PASS';report.observations={orientation_ms:orientationMs,room_count:current.caseMap.rooms.length,node_count:current.caseMap.nodes.length,relationship_count:current.caseMap.relationships.length,route_count:current.routeMemory.entries.length,controls:method.counts.controls,held_outs:method.counts.held_outs,strata:method.counts.strata,joining_keys:method.counts.joining_keys,method_docket_visible:true,task_spine_steps:5,ai_share_steps:6,map_height_normal:normalHeight,map_height_focused:focusedHeight,map_focus_visual:focusVisual,legacy_rails_hidden:true,exact_receipts_folded:true,choir_pair_count:choirReceipt.pairwise_residue.length,choir_claim_ceiling_preserved:true,mobile};
}catch(error){report.status='HOLD_FOR_REPAIR';report.hold={message:error.message,stack:error.stack};try{await page.screenshot({path:path.join(artifactDir,'investigation-held.png'),fullPage:true});}catch{}throw error;}
finally{await fsp.writeFile(path.join(artifactDir,'ash-investigation-guidance-flight.json'),`${JSON.stringify(report,null,2)}\n`);await context.close();await browser.close();}
console.log('ash-investigation-guidance-browser-probe.mjs passed');
