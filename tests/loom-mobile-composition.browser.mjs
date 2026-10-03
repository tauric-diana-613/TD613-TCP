/** Actual local Chromium composition witness; no provider fixtures or calls.
 * Run: TD613_LOOM_MOBILE_ARTIFACT_DIR=/tmp/loom-witness node tests/loom-mobile-composition.browser.mjs
 * Viewport/height changes are responsive browser observations, never physical
 * Safari chrome or human-comprehension evidence. Served bytes are hash-bound.
 */
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile, access } from 'node:fs/promises';
import { resolve, extname, join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { chromium } from 'playwright';

const artifactDir = process.env.TD613_LOOM_MOBILE_ARTIFACT_DIR ? resolve(process.env.TD613_LOOM_MOBILE_ARTIFACT_DIR) : null;
if (artifactDir) await mkdir(artifactDir, { recursive: true });
const sha256 = value => createHash('sha256').update(value).digest('hex');
const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trim();
const report = {
  schema: 'td613.loom.mobile-composition-browser-witness/v0.1', status: 'HELD',
  harness_sha256: sha256(await readFile(new URL(import.meta.url))),
  source_head: git('rev-parse', 'HEAD'), working_tree: git('status', '--short').split('\n').filter(Boolean),
  source_class: 'HASH_BOUND_LOCAL_WORKING_TREE_CANDIDATE', observed_at: new Date().toISOString(),
  browser: 'Chromium', observation_class: 'ACTUAL_LOCAL_RENDERED_PRODUCT_NO_PROVIDER_REQUEST',
  live_provider_calls: 0, fixture_provider_calls: 0, human_comprehension_measured: false,
  physical_device_observed: false, safari_chrome_observed: false, empirical_credit: 0,
  served_source_bytes: {}, changed_served_files: [], requests: [], page_errors: [], checks: [], failures: [], screenshots: [], baseline: null
};

async function staticServer(root, manifest) {
  const appRoot = resolve(root), files = new Map();
  const server = createServer(async (request, response) => {
    try {
      const pathname = new URL(request.url, 'http://localhost').pathname;
      const file = resolve(appRoot, '.' + pathname);
      if (!file.startsWith(appRoot + '/')) throw new Error('Static path escape');
      if (request.method !== 'GET') throw new Error('Static witness allows GET only');
      if (!files.has(file)) files.set(file, await readFile(file));
      manifest[`app${pathname}`] = sha256(files.get(file));
      response.setHeader('Content-Type', ({ '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png' })[extname(file)] || 'application/octet-stream');
      response.end(files.get(file));
    } catch { response.statusCode = 404; response.end(); }
  });
  await new Promise(resolveReady => server.listen(0, '127.0.0.1', resolveReady));
  return { server, files, base: `http://127.0.0.1:${server.address().port}` };
}

const served = await staticServer('app', report.served_source_bytes);
let browser;
const record = (name, passed, evidence) => {
  report.checks.push({ name, status: passed ? 'PASS' : 'FAIL', evidence });
  if (!passed) report.failures.push({ name, evidence });
};
const screenshot = async (page, name) => {
  if (!artifactDir) return;
  const path = join(artifactDir, `${name}.png`);
  await page.screenshot({ path });
  report.screenshots.push({ name, path });
};
const nextPaint = page => page.evaluate(() => new Promise(done => requestAnimationFrame(() => requestAnimationFrame(done))));
async function geometry(page, ids) {
  return page.evaluate(names => {
    const viewport = { width: innerWidth, height: innerHeight };
    const controls = Object.fromEntries(names.map(id => {
      const node = document.getElementById(id), r = node?.getBoundingClientRect(), style = node ? getComputedStyle(node) : null;
      return [id, node && r ? { x: r.x, y: r.y, width: r.width, height: r.height, bottom: r.bottom, right: r.right,
        visible: !!r.width && !!r.height && style.visibility !== 'hidden' && style.display !== 'none',
        fully_in_view: r.x >= -1 && r.right <= viewport.width + 1 && r.y >= -1 && r.bottom <= viewport.height + 1,
        font_size: Number.parseFloat(style.fontSize), disabled: !!node.disabled } : null];
    }));
    return { viewport, scroll_y: scrollY, document_width: document.documentElement.scrollWidth, controls };
  }, ids);
}
async function spill(page) {
  return page.evaluate(() => {
    const outside = [];
    for (const node of document.querySelectorAll('body *')) {
      // Cinematic near-plane glyphs may leave their clipped SVG frame; this is
      // intentional field motion, not escaped application chrome or controls.
      if (node.closest('.loom-glyph-field') && !node.matches('.loom-glyph-field')) continue;
      const style = getComputedStyle(node), r = node.getBoundingClientRect();
      if (!r.width || !r.height || style.visibility === 'hidden' || style.display === 'none' || Number(style.opacity) === 0 || style.clipPath !== 'none') continue;
      if (r.left < -1 || r.right > innerWidth + 1) outside.push({ tag: node.tagName, id: node.id, class_name: String(node.className?.baseVal ?? node.className).slice(0, 100), left: r.left, right: r.right });
    }
    return { viewport_width: innerWidth, document_width: document.documentElement.scrollWidth, outside };
  });
}
async function tapTargets(page) {
  return page.evaluate(() => [...(document.querySelector('dialog:modal')||document).querySelectorAll('button:not(:disabled),summary,.ai-upload')].flatMap(node => {
    const r=node.getBoundingClientRect(),style=getComputedStyle(node);
    if(!r.width||!r.height||style.display==='none'||style.visibility==='hidden')return [];
    return [{id:node.id||null,label:node.textContent.trim().slice(0,70),width:r.width,height:r.height}];
  }));
}
async function fieldObservation(page) {
  return page.evaluate(() => {
    const root=document.querySelector('#aiRuntimeState'),svg=root?.querySelector('.loom-glyph-field');
    const field=svg?.getBoundingClientRect();
    const planeNames=['flight-near','flight-mid','flight-far'];
    const carriers=[...root.querySelectorAll('.loom-field-flight text')].map((node,index)=>{
      const rect=node.getBoundingClientRect(),style=getComputedStyle(node);
      let opacity=Number(style.opacity),ancestor=node.parentElement;
      while(ancestor){opacity*=Number(getComputedStyle(ancestor).opacity);ancestor=ancestor.parentElement;}
      const rendered=style.display!=='none'&&style.visibility!=='hidden'&&opacity>0&&rect.width>0&&rect.height>0;
      return {index,plane:planeNames.find(plane=>node.classList.contains(plane)),relation:node.dataset.flightRelation,
        glyph:node.textContent,x:Number(node.getAttribute('x')),y:Number(node.getAttribute('y')),opacity,
        rendered,screen_overlap:rendered&&rect.right>Math.max(0,field.left)&&rect.left<Math.min(innerWidth,field.right)&&
          rect.bottom>Math.max(0,field.top)&&rect.top<Math.min(innerHeight,field.bottom),
        screen_x:rect.x+rect.width/2,screen_y:rect.y+rect.height/2};
    });
    return {observed_ms:performance.now(),projection:root.dataset.projectionState,relation:root.dataset.activeRelation,
      field:{x:field.x,y:field.y,width:field.width,height:field.height},pending_frames:document.querySelector('#loomAiWorkspace').dataset.pendingFrames,
      title:document.querySelector('#loomFirstCrossingTitle')?.textContent,prompt:document.querySelector('#loomFirstCrossingPrompt')?.textContent,
      carriers,planes:Object.fromEntries(planeNames.map(plane=>[plane,{rendered:carriers.filter(node=>node.plane===plane&&node.rendered).length,
        overlapping:carriers.filter(node=>node.plane===plane&&node.screen_overlap).length}])),
      sources:[...root.querySelectorAll('.loom-field-sources [data-source-id]')].map(node=>({id:node.dataset.sourceId,
        local:node.dataset.sourceLocal,transform:node.getAttribute('transform'),text:node.textContent}))};
  });
}
async function observeFiniteConsequence(page,relation,name) {
  await page.waitForFunction(expected=>document.querySelector('#aiRuntimeState')?.dataset.projectionState==='CURRENT'&&
    document.querySelector('#aiRuntimeState')?.dataset.activeRelation===expected,relation);
  const observations=[await fieldObservation(page)];
  await screenshot(page,`${name}-t0`);
  for(const target of [1000,2000]){
    const elapsed=await page.evaluate(initial=>performance.now()-initial,observations[0].observed_ms);
    await page.waitForTimeout(Math.max(0,target-elapsed));
    observations.push(await fieldObservation(page));
    await screenshot(page,`${name}-t${target/1000}`);
  }
  const before=observations[0],after=observations.at(-1);
  const displacements=after.carriers.map((node,index)=>({...node,coordinate_distance:Math.hypot(node.x-before.carriers[index].x,node.y-before.carriers[index].y),
    screen_distance:Math.hypot(node.screen_x-before.carriers[index].screen_x,node.screen_y-before.carriers[index].screen_y),
    visible_endpoint:node.screen_overlap||before.carriers[index].screen_overlap,y_change:node.y-before.carriers[index].y}));
  record(`${name}: all 39 current-evidence carriers retain every depth plane`,observations.every(observation=>observation.projection==='CURRENT'&&
    observation.relation===relation&&observation.carriers.length===39&&observation.carriers.every(node=>node.rendered&&node.relation===relation)&&
    Object.values(observation.planes).every(plane=>plane.rendered>0&&plane.overlapping>0)),{observations,evidence_ceiling:'SCOPED_RENDERED_VISIBILITY_AND_CLIPPED_SCREEN_OVERLAP'});
  const observedMovement=displacements.filter(node=>node.coordinate_distance>40&&node.screen_distance>15&&node.visible_endpoint);
  record(`${name}: finite canonical consequence produces screen-observable displacement in every plane`,
    displacements.every(node=>node.coordinate_distance>40)&&observedMovement.length>=12&&
    ['flight-near','flight-mid','flight-far'].every(plane=>observedMovement.filter(node=>node.plane===plane).length>=2)&&
    (relation!=='created_potential'||displacements.every(node=>node.y_change<-200)),
    {sample_elapsed_ms:after.observed_ms-before.observed_ms,observable_displacement_count:observedMovement.length,displacements,
      evidence_ceiling:'SCOPED_MOTION_ONLY_UX_AND_COMPREHENSION_REMAIN_SEPARATE'});
  const privateBefore=before.sources.find(source=>source.id==='private'),privateAfter=after.sources.find(source=>source.id==='private');
  record(`${name}: private source remains protected outside selected transport`,privateBefore?.local==='true'&&privateAfter?.local==='true'&&
    privateBefore.transform===privateAfter.transform&&/cōl/.test(privateAfter.text),{before:privateBefore,after:privateAfter});
  return observations;
}
async function bindPage(context, posture, base = served.base, { firstCrossingComplete = true } = {}) {
  const page = await context.newPage();
  page.setDefaultTimeout(12000);
  page.on('pageerror', error => report.page_errors.push({ posture, message: error.message }));
  await page.route('**/*', route => {
    const request = route.request(), admitted = request.method() === 'GET' && request.url().startsWith(base + '/');
    report.requests.push({ posture, method: request.method(), url: request.url(), admitted });
    return admitted ? route.continue() : route.abort();
  });
  // Observe scroll API invocations while delegating to the original native
  // operation. This records application motion without changing app state,
  // suppressing movement, fabricating events or substituting a runtime packet.
  await page.addInitScript(completed => {
    if (completed) {
      try { localStorage.setItem('td613.loom.first-crossing.v1', 'complete'); } catch {}
    } else {
      try { localStorage.removeItem('td613.loom.first-crossing.v1'); } catch {}
    }
    window.__LOOM_WITNESS_SCROLL_CALLS = [];
    for (const [owner, method] of [[Element.prototype, 'scrollIntoView'], [window, 'scrollTo'], [window, 'scrollBy']]) {
      const original = owner[method];
      owner[method] = function(...args) { window.__LOOM_WITNESS_SCROLL_CALLS.push({ method, id: this.id || null, at: performance.now() }); return original.apply(this, args); };
    }
  }, firstCrossingComplete);
  await page.goto(`${base}/dome-world/holonomy-loom.html`);
  await page.locator(firstCrossingComplete ? '#loomBegin' : '#loomFirstCrossing').waitFor({ state: 'visible' });
  await page.waitForFunction(() => document.documentElement.dataset.loomBoot !== 'loading');
  return page;
}

try {
  browser = await chromium.launch({ headless: true });

  // First-use witness is separate from the returning-operator composition
  // loop. It proves the tutorial gate uses local Loom event grammar, makes no
  // provider request, persists completion, and only then exposes Open Loom.
  {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'no-preference' });
    const page = await bindPage(context, 'first-crossing-mobile', served.base, { firstCrossingComplete: false });
    try {
      record('first crossing: builder is withheld before practice completion',
        await page.locator('.loom-builder-shell').isHidden() && await page.locator('#loomFirstCrossing').isVisible(),
        { first_crossing_visible: await page.locator('#loomFirstCrossing').isVisible() });
      const firstCrossingVisual = await page.locator('#loomFirstCrossing').evaluate(node => {
        const style=getComputedStyle(node);
        const rect=node.getBoundingClientRect();
        const visibleChrome=['.loom-field-caption','.loom-instrument-state-mode','.loom-instrument-state-relation','.loom-instrument-state-boundary','.ai-room-replay','.loom-hero-route']
          .filter(selector => {
            const el=document.querySelector(selector); if(!el)return false;
            const s=getComputedStyle(el); const r=el.getBoundingClientRect();
            return s.display!=='none'&&s.visibility!=='hidden'&&r.width>0&&r.height>0;
          });
        const objectStyles=[...node.querySelectorAll('[data-first-crossing-item],#loomFirstCrossingPrivate')].map(button=>{
          const s=getComputedStyle(button),r=button.getBoundingClientRect();
          return {id:button.dataset.firstCrossingItem||button.id,width:r.width,height:r.height,visible:s.display!=='none'&&s.visibility!=='hidden'};
        });
        return {
          background:style.backgroundColor,border_top:style.borderTopWidth,box_shadow:style.boxShadow,
          width:rect.width,height:rect.height,visible_chrome:visibleChrome,objects:objectStyles
        };
      });
      record('first crossing: no tutorial card or ordinary Loom chrome overlays the field',
        firstCrossingVisual.background === 'rgba(0, 0, 0, 0)' &&
        firstCrossingVisual.border_top === '0px' &&
        firstCrossingVisual.visible_chrome.length === 0 &&
        firstCrossingVisual.objects.length===3&&firstCrossingVisual.objects.every(object=>object.visible&&object.width>=44&&object.height>=44),
        firstCrossingVisual);
      await screenshot(page, 'first-crossing-mobile-notice');
      await page.locator('#loomFirstCrossingPrivate').click();
      record('first crossing: local practice material can be inspected without selecting or sending it',
        await page.locator('#loomFirstCrossingPrivateText').isVisible()&&
        await page.locator('#loomFirstCrossingPrivate').getAttribute('aria-expanded')==='true'&&
        await page.locator('[data-first-crossing-item][aria-pressed="true"]').count()===0,
        {private_text:await page.locator('#loomFirstCrossingPrivateText').textContent()});
      await page.locator('#loomFirstCrossingPrivate').click();
      await page.locator('[data-first-crossing-item="brief"]').click();
      await page.locator('[data-first-crossing-item="source"]').click();
      record('first crossing: consequence begins before terminology is named',
        /Watch the field gather them\./.test(await page.locator('#loomFirstCrossingTitle').textContent()) &&
        !/That relation is à/.test(await page.locator('#loomFirstCrossingPrompt').textContent()),
        { title: await page.locator('#loomFirstCrossingTitle').textContent(), prompt: await page.locator('#loomFirstCrossingPrompt').textContent() });
      await observeFiniteConsequence(page,'gathering','first-crossing-mobile-gathering');
      await page.locator('#loomFirstCrossingPause').click();
      const pausedA=await fieldObservation(page);
      await page.waitForTimeout(240);
      const pausedB=await fieldObservation(page);
      record('first crossing: Pause freezes existing frame and retains current relation',
        pausedB.pending_frames==='0'&&pausedB.relation==='gathering'&&
        pausedB.carriers.every((node,index)=>node.x===pausedA.carriers[index].x&&node.y===pausedA.carriers[index].y),
        {before:pausedA,after:pausedB});
      await screenshot(page,'first-crossing-mobile-paused');
      await page.locator('#loomFirstCrossingPause').click();
      await page.locator('#loomFirstCrossingAction').waitFor({state:'visible'});
      await page.locator('#loomFirstCrossingAction').click();
      await page.waitForFunction(()=>document.querySelector('#aiRuntimeState')?.dataset?.projectionState==='CURRENT'&&
        document.querySelector('#aiRuntimeState')?.dataset?.activeRelation==='created_potential');
      record('first crossing: readiness consequence begins before 上 is named',
        /Watch readiness form\./.test(await page.locator('#loomFirstCrossingTitle').textContent()) &&
        !/created-potential relation is 上/.test(await page.locator('#loomFirstCrossingPrompt').textContent()),
        { title: await page.locator('#loomFirstCrossingTitle').textContent(), prompt: await page.locator('#loomFirstCrossingPrompt').textContent() });
      await observeFiniteConsequence(page,'created_potential','first-crossing-mobile-readiness');
      await page.locator('#loomFirstCrossingStop').waitFor({state:'visible'});
      await page.locator('#loomFirstCrossingStop').click();
      await page.waitForFunction(()=>document.querySelector('#aiRuntimeState')?.dataset?.projectionState==='CURRENT');
      const restedA=await fieldObservation(page);await page.waitForTimeout(240);const restedB=await fieldObservation(page);
      record('first crossing: completion holds a stable prepared state without inventing transmission',
        restedB.pending_frames==='0'&&restedB.relation==='created_potential'&&restedB.carriers.every((node,index)=>node.x===restedA.carriers[index].x&&node.y===restedA.carriers[index].y),
        {before:restedA,after:restedB});
      record('first crossing: completion unlocks Open Loom without inventing a crossing',
        await page.locator('#loomBegin').isVisible() &&
        await page.evaluate(() => localStorage.getItem('td613.loom.first-crossing.v1')) === 'complete' &&
        /Nothing crossed/.test(await page.locator('#loomFirstCrossingAnswer').textContent()),
        { open_visible: await page.locator('#loomBegin').isVisible() });
      record('first crossing: tutorial made zero provider or non-GET requests',
        !report.requests.some(request => request.posture === 'first-crossing-mobile' && request.method !== 'GET'),
        { requests: report.requests.filter(request => request.posture === 'first-crossing-mobile') });
      await screenshot(page, 'first-crossing-mobile-complete');
      await page.locator('#loomBegin').click();
      await page.locator('.loom-builder-shell').waitFor({ state: 'visible' });
      record('first crossing: cinematic Threshold opens the real Loom builder after completion',
        await page.locator('.loom-builder-shell').isVisible() && await page.locator('.loom-stage').isHidden(),
        { threshold_state: await page.locator('#loomAiWorkspace').getAttribute('data-threshold-state') });
      await screenshot(page, 'first-crossing-mobile-open');
    } catch (error) {
      record('first crossing: traversal completed', false, { error: error.message });
      await screenshot(page, 'first-crossing-mobile-failure');
    } finally { await context.close(); }
  }

  for(const motion of ['no-preference','reduce']){
    const posture=motion==='reduce'?'first-crossing-reduced':'first-crossing-exit';
    const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:motion});
    const page=await bindPage(context,posture,served.base,{firstCrossingComplete:false});
    try{
      if(motion==='reduce'){
        await page.locator('[data-first-crossing-item="brief"]').click();
        await page.locator('[data-first-crossing-item="source"]').click();
        await page.locator('#loomFirstCrossingAction').waitFor({state:'visible'});
        const gathering=await fieldObservation(page);
        await page.locator('#loomFirstCrossingAction').click();
        await page.locator('#loomFirstCrossingStop').waitFor({state:'visible'});
        const before=await fieldObservation(page);await page.waitForTimeout(240);const after=await fieldObservation(page);
        record('first crossing reduced: complete static equivalents preserve canonical distinctions',
          gathering.relation==='gathering'&&after.relation==='created_potential'&&after.pending_frames==='0'&&after.carriers.length===39&&
          after.carriers.every((node,index)=>node.rendered&&node.relation==='created_potential'&&node.x===before.carriers[index].x&&node.y===before.carriers[index].y)&&
          after.sources.find(source=>source.id==='private')?.local==='true',
          {gathering,before,after,evidence_ceiling:'STATIC_BROWSER_EQUIVALENT_NO_MEASURED_COMPREHENSION'});
        await screenshot(page,'first-crossing-mobile-reduced-readiness');
      }
      await page.locator('#loomFirstCrossingLeave').click();
      await page.locator('.loom-builder-shell').waitFor({state:'visible'});
      record(`${posture}: optional practice exits directly into the real builder without completion credit`,
        await page.locator('#loomFirstCrossing').isHidden()&&
        await page.evaluate(()=>localStorage.getItem('td613.loom.first-crossing.v1'))!=='complete'&&
        Number(await page.locator('#loomAiWorkspace').getAttribute('data-pending-frames'))<=1,
        {practice_visible:await page.locator('#loomFirstCrossing').isVisible(),completion:await page.evaluate(()=>localStorage.getItem('td613.loom.first-crossing.v1'))});
      await screenshot(page,`${posture}-builder`);
    }catch(error){record(`${posture}: traversal completed`,false,{error:error.message});await screenshot(page,`${posture}-failure`);}
    finally{await context.close();}
  }

  for (const posture of [
    { name: 'mobile', viewport: { width: 390, height: 844 }, motion: 'no-preference' },
    { name: 'desktop', viewport: { width: 1280, height: 900 }, motion: 'no-preference' },
    { name: 'mobile-reduced-motion', viewport: { width: 390, height: 844 }, motion: 'reduce' }
  ]) {
    const context = await browser.newContext({ viewport: posture.viewport, reducedMotion: posture.motion });
    const page = await bindPage(context, posture.name);
    try {
      const arrival = await geometry(page, ['loomBegin', 'aiTask', 'aiPreparePortable', 'loomRulesOpen', 'loomBoundaryOpen', 'aiPortableMode', 'aiDemoMode', 'loomToolsOpen']);
      const fieldGeometry = await page.locator('.loom-glyph-field').evaluate(node => {
        const r = node.getBoundingClientRect();
        return { x: r.x, y: r.y, width: r.width, height: r.height, bottom: r.bottom, right: r.right };
      });
      const stageGeometry = await page.locator('.loom-stage').evaluate(node => {
        const r = node.getBoundingClientRect();
        return { x: r.x, y: r.y, width: r.width, height: r.height, bottom: r.bottom, right: r.right };
      });
      record(`${posture.name}: Flow-Core owns the cinematic arrival scene`,
        fieldGeometry.width >= posture.viewport.width - 2 && stageGeometry.height >= posture.viewport.height - 60 && arrival.controls.loomBegin.fully_in_view,
        { viewport: posture.viewport, field: fieldGeometry, stage: stageGeometry, begin: arrival.controls.loomBegin });
      const bounds = await spill(page);
      record(`${posture.name}: no root or visible horizontal spill`, bounds.document_width <= posture.viewport.width && bounds.outside.length === 0, bounds);
      const targets=await tapTargets(page),small=targets.filter(target=>target.width<43.5||target.height<43.5);
      record(`${posture.name}: visible action targets at least 44px`, small.length === 0, { targets, too_small: small });
      record(`${posture.name}: task input font prevents focus zoom`, arrival.controls.aiTask.font_size >= 16, { font_size: arrival.controls.aiTask.font_size });
      const chooser = await page.locator('#aiProjectChoices').evaluate(node => ({ hidden: node.hidden, display: getComputedStyle(node).display, rect_count: node.getClientRects().length }));
      record(`${posture.name}: My work withholds Practice chooser`, chooser.hidden && chooser.display === 'none' && chooser.rect_count === 0, chooser);
      await screenshot(page, `${posture.name}-arrival`);

      await page.locator('#loomBegin').click();
      await page.waitForTimeout(posture.motion === 'reduce' ? 60 : 680);
      const builderArrival = await geometry(page, ['aiTask', 'aiPreparePortable', 'loomToolsOpen']);
      record(`${posture.name}: builder follows the cinematic scene without collapsing into it`,
        builderArrival.controls.aiTask.y < builderArrival.viewport.height &&
        builderArrival.controls.aiPreparePortable.y < builderArrival.viewport.height * 2,
        builderArrival);
      await screenshot(page, `${posture.name}-builder-arrival`);

      await page.locator('#loomToolsOpen').focus(); await page.keyboard.press('Enter');
      await page.locator('#loomTools').waitFor({ state: 'visible' });
      const dialogBounds = await spill(page);
      record(`${posture.name}: Tools has no horizontal spill`, dialogBounds.outside.length === 0, dialogBounds);
      const toolTargets=await tapTargets(page),smallTools=toolTargets.filter(target=>target.width<43.5||target.height<43.5);
      record(`${posture.name}: Tools targets at least 44px`,smallTools.length===0,{targets:toolTargets,too_small:smallTools});
      await page.keyboard.press('Escape');
      record(`${posture.name}: keyboard Escape restores Tools opener`, !(await page.locator('#loomTools').evaluate(node => node.open)) && await page.evaluate(() => document.activeElement?.id) === 'loomToolsOpen', { active_element: await page.evaluate(() => document.activeElement?.id) });
      await page.locator('#loomBoundaryOpen').focus(); await page.keyboard.press('Enter');
      const boundary = await page.locator('[data-tool-panel="boundary"]').textContent();
      record(`${posture.name}: boundary accessible before crossing`, await page.locator('[data-tool-panel="boundary"]').isVisible() && /remain unobserved/.test(boundary) && /no model request/.test(boundary), { text: boundary });
      await page.keyboard.press('Escape');
      await page.locator('#loomRulesOpen').focus(); await page.keyboard.press('Enter');
      const ruleFont = await page.locator('#aiRules').evaluate(node => Number.parseFloat(getComputedStyle(node).fontSize));
      record(`${posture.name}: rules accessible with protected input font`, await page.locator('#aiRules').isVisible() && ruleFont >= 16, { font_size: ruleFont });
      await page.keyboard.press('Escape');

      // Deliberately use raw mouse events immediately after task entry. Locator
      // click's stability wait could mask a blur/pending-field layout defect.
      await page.locator('#aiTask').fill('Compare the fictional selected evidence and preserve every missing source.');
      await page.locator('#aiPreparePortable').scrollIntoViewIfNeeded();
      await nextPaint(page);
      const beforeClick = await geometry(page, ['aiTask', 'aiPreparePortable']);
      const point = beforeClick.controls.aiPreparePortable;
      await page.mouse.click(point.x + point.width / 2, point.y + point.height / 2);
      let prepared = false;
      try { await page.waitForFunction(() => document.querySelector('#loomAiWorkspace').dataset.workspace === 'crossing' && !document.querySelector('#aiResult').hidden, null, { timeout: 5000 }); prepared = true; }
      catch { /* A direct-click miss is a failure; no workaround retry. */ }
      record(`${posture.name}: one direct Prepare click succeeds from focused task`, prepared, { before_click: beforeClick, clicked: { x: point.x + point.width / 2, y: point.y + point.height / 2 }, status: await page.locator('#aiStatus').textContent(), active_element: await page.evaluate(() => document.activeElement?.id) });
      await screenshot(page, `${posture.name}-after-direct-prepare`);
      if (prepared) {
        const crossing = await geometry(page, ['aiResult', 'aiMarrowline']);
        record(`${posture.name}: crossing CTA visible and result focused`, crossing.controls.aiMarrowline.fully_in_view && crossing.controls.aiMarrowline.width>=44 && crossing.controls.aiMarrowline.height>=44 && !crossing.controls.aiMarrowline.disabled && await page.evaluate(() => document.activeElement?.id) === 'aiResult', crossing);
        record(`${posture.name}: preparation has no field scroll detour`, !(await page.evaluate(() => window.__LOOM_WITNESS_SCROLL_CALLS.some(call => call.id === 'aiRuntime'))), await page.evaluate(() => window.__LOOM_WITNESS_SCROLL_CALLS));
        record(`${posture.name}: one coordinator frame remains bounded`, Number(await page.locator('#loomAiWorkspace').getAttribute('data-pending-frames')) <= 1, { pending_frames: await page.locator('#loomAiWorkspace').getAttribute('data-pending-frames') });
        // When an inline inspection is actually available, exercise it. A
        // deliberately demoted hidden disclosure must not become a required
        // gesture. Scroll the actual route; never insert filler or an app packet.
        const inspection = page.locator('.loom-instrument-state-inspection > summary');
        if (await inspection.isVisible()) await inspection.click();
        const scriptedStart = await page.evaluate(() => window.__LOOM_WITNESS_SCROLL_CALLS.length);
        const wheelPositions=[];
        for (const amount of [80, 90, -70, -100, 620, -700, 900, -1000]) {
          await page.mouse.wheel(0, amount);
          await page.waitForTimeout(Math.abs(amount) > 200 ? 45 : 110);
          wheelPositions.push({amount,scroll_y:await page.evaluate(()=>scrollY)});
        }
        await page.waitForTimeout(160);
        const stop = await page.evaluate(() => ({ y: scrollY, calls: window.__LOOM_WITNESS_SCROLL_CALLS.length }));
        await page.waitForTimeout(240);
        const later = await page.evaluate(() => ({ y: scrollY, calls: window.__LOOM_WITNESS_SCROLL_CALLS.length, width: document.documentElement.scrollWidth }));
        record(`${posture.name}: repeated wheel scroll respects manual stop`, Math.abs(later.y - stop.y) <= 1 && stop.calls === scriptedStart && later.calls === scriptedStart, { stopped: stop, later, scripted_start: scriptedStart,wheel_positions:wheelPositions });
        const afterScroll = await spill(page);
        record(`${posture.name}: scrolled route has no horizontal spill`, afterScroll.document_width <= posture.viewport.width && afterScroll.outside.length === 0, afterScroll);
        if (posture.viewport.width === 390) {
          for (const height of [700, 844]) {
            await page.setViewportSize({ width: 390, height }); await nextPaint(page);
            const resized = await spill(page);
            record(`${posture.name}: responsive height ${height} preserves composition`, resized.document_width <= 390 && resized.outside.length === 0 && await page.locator('#aiMarrowline').isVisible(), { ...resized, physical_safari_chrome: false });
          }
        }
      }

      // A fresh route avoids any implicit root replacement after preparation.
      const practice = await bindPage(context, `${posture.name}-practice`);
      await practice.locator('#loomBegin').click();
      await practice.locator('.loom-builder-shell').waitFor({ state: 'visible' });
      await practice.locator('#aiDemoMode').click(); await practice.locator('#aiDemoInvitation').click();
      await practice.locator('[data-project="participant-research"]').click();
      record(`${posture.name}: Practice keeps Prepare primary`, await practice.locator('#aiPreparePortable').evaluate(node => node.classList.contains('ai-primary')) && !(await practice.locator('#aiRun').evaluate(node => node.classList.contains('ai-primary'))), { fictional_case: 'participant-research' });
      await practice.locator('#aiPreparePortable').click();
      await practice.waitForFunction(() => document.querySelector('#loomAiWorkspace').dataset.workspace === 'crossing');
      record(`${posture.name}: Practice preparation makes no POST`, !report.requests.some(request => request.method !== 'GET'), { non_get_requests: report.requests.filter(request => request.method !== 'GET') });
      await screenshot(practice, `${posture.name}-practice-prepared`);
      await practice.close();
    } catch (error) {
      record(`${posture.name}: traversal completed`, false, { error: error.message });
      await screenshot(page, `${posture.name}-failure`);
    } finally { await context.close(); }
  }

  // Optional baseline captures belong to a separate artifact directory and
  // observation class. They do not impersonate cloud production traversal.
  if (artifactDir) {
    const baselineRoot = resolve(process.env.TD613_LOOM_BASELINE_ROOT || '/tmp/loom-baseline');
    try {
      await access(join(baselineRoot, 'app/dome-world/holonomy-loom.html'));
      const manifest = {}, baseline = await staticServer(join(baselineRoot, 'app'), manifest);
      const baselineDir = join(artifactDir, 'baseline-local'); await mkdir(baselineDir, { recursive: true });
      const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
      try {
        const page = await bindPage(context, 'baseline-local-mobile', baseline.base);
        await page.screenshot({ path: join(baselineDir, 'mobile-arrival.png') });
        report.baseline = { observation_class: 'SEPARATE_LOCAL_BASELINE_RESPONSIVE_RENDER', source_class: 'HASH_BOUND_LOCAL_BASELINE_FILES', physical_device_observed: false, cloud_production_observed: false,
          root: baselineRoot, served_source_bytes: manifest, geometry: await geometry(page, ['aiTask', 'aiPreparePortable']), screenshot: join(baselineDir, 'mobile-arrival.png'),
          requests: report.requests.filter(request=>request.posture==='baseline-local-mobile'), page_errors: report.page_errors.filter(error=>error.posture==='baseline-local-mobile') };
      } finally { await context.close(); await new Promise(done => baseline.server.close(done)); }
    } catch (error) { report.baseline = { status: 'UNAVAILABLE', reason: error.message }; }
  }

  for (const [file, body] of served.files) {
    try { if (sha256(await readFile(file)) !== sha256(body)) report.changed_served_files.push(file); }
    catch { report.changed_served_files.push(file); }
  }
  record('rendered source bytes remained stable during witness', report.changed_served_files.length === 0, { changed_served_files: report.changed_served_files });
  const candidateRequests=report.requests.filter(request=>!request.posture.startsWith('baseline-local'));
  const providerAttempts=candidateRequests.filter(request=>new URL(request.url).pathname==='/api/khonapolit');
  report.live_provider_calls=providerAttempts.length;
  record('candidate route made zero provider or unauthorized requests', candidateRequests.every(request=>request.admitted)&&providerAttempts.length===0, { rejected_requests:candidateRequests.filter(request=>!request.admitted),provider_attempts:providerAttempts });
  const candidateErrors=report.page_errors.filter(error=>!error.posture.startsWith('baseline-local'));
  record('candidate route has zero page errors', candidateErrors.length===0,candidateErrors);
  report.status = report.failures.length === 0 ? 'PASS' : 'FAIL';
} catch (error) { record('browser witness available', false, { error: error.message }); report.status = 'FAIL'; }
finally {
  await browser?.close(); await new Promise(done => served.server.close(done));
  if (artifactDir) await writeFile(join(artifactDir, 'report.json'), JSON.stringify(report, null, 2) + '\n');
}
console.log(`Loom local mobile composition: ${report.status} (${report.checks.length - report.failures.length}/${report.checks.length} checks).`);
for (const failure of report.failures) console.error(`${failure.name}: ${JSON.stringify(failure.evidence)}`);
if (artifactDir) console.log(`Artifacts: ${artifactDir}`);
assert.equal(report.status, 'PASS', 'Actual local composition acceptance failed; inspect the bounded report.');
