/**
 * TD613 Loom startup witness — local source, no live provider and no human
 * acceptance credit. Exercises both Chromium and WebKit, including a
 * deliberate module-loading failure matching the operator's blank shell.
 */
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { chromium, webkit } from 'playwright';

const root = resolve('app');
const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml'
};
const server = createServer(async (request, response) => {
  try {
    const path = new URL(request.url, 'http://127.0.0.1').pathname;
    const file = resolve(root, '.' + path);
    if (request.method !== 'GET' || !file.startsWith(root + sep)) throw new Error('inadmissible');
    const bytes = await readFile(file);
    response.statusCode = 200;
    response.setHeader('Content-Type', contentTypes[extname(file)] || 'application/octet-stream');
    response.setHeader('Cache-Control', 'no-store');
    response.end(bytes);
  } catch {
    response.statusCode = 404;
    response.end('Not found');
  }
});
await new Promise(done => server.listen(0, '127.0.0.1', done));
const base = `http://127.0.0.1:${server.address().port}`;
const records = [];
let failed = false;
try {
  for (const [name, engine] of [['chromium', chromium], ['webkit', webkit]]) {
    let browser;
    try {
      browser = await engine.launch({ headless: true });
      for (const blocked of [false, true]) {
        const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
        const page = await context.newPage();
        const pageErrors = [];
        const externalRequests = [];
        page.on('pageerror', error => pageErrors.push(error.message));
        await page.route('**/*', route => {
          const request = route.request();
          const url = request.url();
          const valid = request.method() === 'GET' && url.startsWith(base + '/');
          if (!valid) { externalRequests.push(url); return route.abort(); }
          if (blocked && new URL(url).pathname === '/dome-world/holonomy-loom/ai-workspace.js') return route.abort();
          return route.continue();
        });
        try {
          await page.goto(`${base}/dome-world/holonomy-loom.html`, { waitUntil: 'domcontentloaded' });
          await page.waitForFunction(() =>
            ['ready', 'failed'].includes(document.documentElement.dataset.loomBoot), null, { timeout: 16000 });
          // WebKit can publish an observable DOM state before committing the
          // first layout. Never credit an unpainted or zero-rect first sample.
          await page.evaluate(() => new Promise(resolve =>
            requestAnimationFrame(() => requestAnimationFrame(resolve))));
          await page.waitForTimeout(100);
          const evidence = await page.evaluate(() => {
            const html = document.documentElement;
            const tutorial = document.querySelector('#loomFirstCrossing');
            const failure = document.querySelector('#loomBootFailure');
            const retry = document.querySelector('#loomBootRetry');
            const stylesheet = [...document.styleSheets].some(sheet => sheet.href?.includes('loom-product-v6.css'));
            const shown = node => {
              if (!node) return false;
              const rect = node.getBoundingClientRect(), style = getComputedStyle(node);
              return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
            };
            const geometry = node => {
              if (!node) return null;
              const box = node.getBoundingClientRect(), style = getComputedStyle(node);
              return { x: box.x, y: box.y, width: box.width, height: box.height,
                display: style.display, visibility: style.visibility, opacity: style.opacity };
            };
            return { boot: html.dataset.loomBoot, reason: html.dataset.loomBootReason || null,
              tutorial_present: !!tutorial, tutorial_visible: shown(tutorial),
              failure_visible: shown(failure), retry_visible: shown(retry),
              stylesheet, placeholder_stranded: document.querySelector('#loomAiWorkspace')?.textContent.trim() === 'Opening Loom…',
              main_geometry: geometry(document.querySelector('main')),
              tutorial_geometry: geometry(tutorial), failure_geometry: geometry(failure) };
          });
          const pass = blocked
            ? evidence.boot === 'failed' && evidence.reason === 'MODULE_LOAD_FAILED' &&
              evidence.failure_visible && evidence.retry_visible && !evidence.placeholder_stranded
            : evidence.boot === 'ready' && evidence.tutorial_present &&
              evidence.tutorial_visible && evidence.stylesheet && !evidence.placeholder_stranded && pageErrors.length === 0;
          records.push({ engine: name, mode: blocked ? 'BLOCKED_MODULE' : 'HEALTHY', status: pass ? 'PASS' : 'FAIL',
            evidence, page_errors: pageErrors, external_requests: externalRequests });
          if (!pass || externalRequests.length) failed = true;
          if(!blocked && pass){
            // A controlled local clipboard witness checks the same text glyph
            // interaction in WebKit and Chromium, before and after entering Loom.
            await page.evaluate(() => {
              window.__td613CopiedGlyphs=[];
              Object.defineProperty(navigator,'clipboard',{configurable:true,value:{
                writeText: glyph => {window.__td613CopiedGlyphs.push(glyph);return Promise.resolve();}
              }});
            });
            const guide=page.locator('.loom-topbar nav > .loom-flowcore-help');
            const glyphs=['à','米','出','hõt','cōl','上','下','𝄐'];
            await guide.locator('summary').click();
            for(const glyph of glyphs){
              await guide.locator('[data-flowcore-copy="'+glyph+'"]').click();
              await page.waitForFunction(value=>document.querySelector('#loomFlowcoreCopyNotice')?.textContent===value+' Copied!',glyph);
            }
            await guide.locator('#loomFlowcoreHelpClose').click();
            await page.locator('#loomFirstCrossingLeave').click();
            await page.locator('.loom-builder-shell').waitFor({state:'visible'});
            const copyEvidence={
              copied:await page.evaluate(()=>window.__td613CopiedGlyphs),
              persisted:await guide.count()===1 && await guide.isVisible(),
              header_order:await page.locator('.loom-topbar nav').evaluate(node=>[...node.children].map(el=>el.className||el.id)),
              page_errors:pageErrors,external_requests:externalRequests
            };
            const copyPass=JSON.stringify(copyEvidence.copied)===JSON.stringify(glyphs) &&
              copyEvidence.persisted && copyEvidence.header_order[0].includes('loom-flowcore-help') &&
              pageErrors.length===0 && externalRequests.length===0;
            records.push({engine:name,mode:'PERSISTENT_FLOWCORE_GLYPH_COPY',status:copyPass?'PASS':'FAIL',evidence:copyEvidence});
            if(!copyPass)failed=true;
          }
        } catch (error) {
          failed = true;
          records.push({ engine: name, mode: blocked ? 'BLOCKED_MODULE' : 'HEALTHY',
            status: 'FAIL', error: error.message, page_errors: pageErrors, external_requests: externalRequests });
        } finally {
          await context.close();
        }
      }
      // 1536px operator desktop regression: the couture typography may not
      // retain the legacy left:50% after the centering transform is retired.
      {
        const context = await browser.newContext({ viewport: { width: 1536, height: 960 }, reducedMotion: 'reduce' });
        const page = await context.newPage();
        const errors = [];
        const externalRequests = [];
        page.on('pageerror', error => errors.push(error.message));
        await page.route('**/*', route => {
          const request = route.request(), url = request.url();
          if (request.method() !== 'GET' || !url.startsWith(base + '/')) {
            externalRequests.push(url);
            return route.abort();
          }
          return route.continue();
        });
        try {
          await page.goto(`${base}/dome-world/holonomy-loom.html`, { waitUntil: 'domcontentloaded' });
          await page.waitForFunction(() => document.documentElement.dataset.loomBoot === 'ready', null, {timeout:16000});
          await page.evaluate(() => new Promise(done => requestAnimationFrame(() => requestAnimationFrame(done))));
          const geometry = await page.evaluate(() => {
            const root = document.querySelector('#loomAiWorkspace');
            const copy = document.querySelector('.loom-first-crossing-copy');
            const title = document.querySelector('#loomFirstCrossingTitle');
            const prompt = document.querySelector('#loomFirstCrossingPrompt');
            const cards = document.querySelector('#loomFirstCrossingObjects');
            const rect = node => { const r=node.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height}; };
            const visible = node => { const x=getComputedStyle(node);return x.display!=='none'&&x.visibility==='visible'; };
            const c=rect(copy), t=rect(title), p=rect(prompt), o=rect(cards);
            return {viewport:innerWidth,boot:document.documentElement.dataset.loomBoot,
              active:root.dataset.firstCrossing,copy:c,title:t,prompt:p,cards:o,
              copy_visible:visible(copy),title_visible:visible(title),prompt_visible:visible(prompt),
              copy_left:getComputedStyle(copy).left,copy_transform:getComputedStyle(copy).transform,
              center_error:Math.abs(c.left+c.width/2-innerWidth/2),
              horizontal_overflow:document.documentElement.scrollWidth-innerWidth};
          });
          const pass = geometry.active==='active'&&geometry.copy_visible&&geometry.title_visible&&geometry.prompt_visible&&
            geometry.copy.left>=0&&geometry.copy.right<=geometry.viewport&&
            geometry.title.left>=0&&geometry.title.right<=geometry.viewport&&
            geometry.prompt.left>=0&&geometry.prompt.right<=geometry.viewport&&
            geometry.center_error<16&&geometry.horizontal_overflow<=1&&
            errors.length===0&&externalRequests.length===0;
          records.push({engine:name,mode:'DESKTOP_TUTORIAL_GEOMETRY',status:pass?'PASS':'FAIL',
            geometry,page_errors:errors,external_requests:externalRequests});
          if(!pass)failed=true;
        } catch(error) {
          failed=true;
          records.push({engine:name,mode:'DESKTOP_TUTORIAL_GEOMETRY',status:'FAIL',
            error:error.message,page_errors:errors,external_requests:externalRequests});
        } finally { await context.close(); }
      }
      // Operator screenshot: at a realistic short desktop window the tutorial
      // must keep both choice cards and the skip gesture above the fold.
      // This is a viewport/paint witness, not a claim about aesthetic approval.
      {
        const context=await browser.newContext({viewport:{width:1536,height:768},reducedMotion:'reduce'});
        const page=await context.newPage();
        const errors=[];
        page.on('pageerror', e=>errors.push(e.message));
        try{
          await page.goto(`${base}/dome-world/holonomy-loom.html`,{waitUntil:'domcontentloaded'});
          await page.waitForFunction(()=>document.documentElement.dataset.loomBoot==='ready',null,{timeout:16000});
          await page.evaluate(()=>new Promise(done=>requestAnimationFrame(()=>requestAnimationFrame(done))));
          const box=await page.evaluate(()=>{
            const rect=selector=>{
              const element=document.querySelector(selector),r=element.getBoundingClientRect();
              return {top:r.top,bottom:r.bottom,left:r.left,right:r.right,height:r.height,
                visible:getComputedStyle(element).visibility==='visible'};
            };
            return {width:innerWidth,height:innerHeight,
              stage:rect('#loomAiWorkspace .loom-stage'),
              copy:rect('.loom-first-crossing-copy'),
              cards:rect('#loomFirstCrossingObjects'),
              skip:rect('#loomFirstCrossingLeave'),
              rootScrollHeight:document.documentElement.scrollHeight,
              stageBorder:getComputedStyle(document.querySelector('#loomAiWorkspace .loom-stage')).borderBottomWidth};
          });
          const pass=box.copy.top>=52&&box.cards.top>box.copy.bottom&&
            box.cards.bottom<box.height-12&&box.skip.bottom<box.height-6&&
            box.cards.left>=0&&box.cards.right<=box.width&&
            box.stageBorder==='0px'&&errors.length===0;
          records.push({engine:name,mode:'SHORT_DESKTOP_FIRST_FOLD',status:pass?'PASS':'FAIL',geometry:box,page_errors:errors});
          if(!pass)failed=true;
        }catch(error){
          failed=true;
          records.push({engine:name,mode:'SHORT_DESKTOP_FIRST_FOLD',status:'FAIL',error:error.message,page_errors:errors});
        }finally{await context.close();}
      }
    } catch (error) {
      failed = true;
      records.push({ engine: name, status: 'UNAVAILABLE', error: error.message });
    } finally {
      await browser?.close();
    }
  }
} finally {
  await new Promise(done => server.close(done));
}
console.log(JSON.stringify({ schema: 'td613.loom.boot-cross-engine-witness/v0.1',
  observation_class: 'LOCAL_SOURCE_CHROMIUM_WEBKIT', production_observed: false,
  physical_safari_observed: false, provider_calls: 0, status: failed ? 'FAIL' : 'PASS', records }, null, 2));
assert.equal(failed, false, 'Local Loom startup or recovery failed on Chromium/WebKit; no physical acceptance claimed.');
