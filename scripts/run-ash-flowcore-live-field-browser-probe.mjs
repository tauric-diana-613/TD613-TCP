import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const sourceUrl = new URL('./ash-flowcore-live-field-browser-probe.mjs', import.meta.url);
const artifactDir = path.resolve(process.env.TD613_ARTIFACT_DIR || 'artifacts/ash-flowcore-field-runtime');
const runtimePath = path.join(artifactDir, 'ash-flowcore-live-field-browser-probe.runtime.mjs');

const listenerTarget = String.raw`await page.addInitScript(() => {
  window.__ashFlowcorePhaseTrace = [];
  addEventListener('td613:ash:flowcore-field-phase', event => {
    const item = event.detail || {};
    window.__ashFlowcorePhaseTrace.push({ phase:item.phase, phase_name:item.phase_name, source:item.source, artifact_required:item.artifact_required });
  });
});`;

const listenerReplacement = String.raw`await page.addInitScript(() => {
  window.__ashFlowcorePhaseTrace = [];
  addEventListener('td613:ash:flowcore-field-phase', event => {
    const item = event.detail || {};
    const field = document.querySelector('.ash-flowcore-field:not([hidden])');
    const rail = document.querySelector('#ashAiaMembrane .ash-ux-motion-track');
    const canvas = field?.querySelector('.ash-flowcore-field__canvas');
    const rendered = node => {
      if (!node) return false;
      const style = getComputedStyle(node);
      const rect = node.getBoundingClientRect();
      return style.display !== 'none'
        && style.visibility !== 'hidden'
        && Number(style.opacity) > 0
        && rect.width > 0
        && rect.height > 0;
    };
    window.__ashFlowcorePhaseTrace.push({
      phase:item.phase,
      phase_name:item.phase_name,
      source:item.source,
      artifact_required:item.artifact_required,
      dom_phase:field?.dataset.flowcorePhaseName || null,
      playing:field?.dataset.flowcorePlaying === 'true',
      phase_label:field?.querySelector('[data-flowcore-phase-label]')?.textContent || '',
      canvas_visible:rendered(canvas),
      rail_visible:rendered(rail),
      motion:window.__td613AshPostIngressMotionRestoration?.current?.() || {}
    });
  });
});`;

const motionTarget = String.raw`  const activeMotionHandle = await page.waitForFunction(() => {
    if (document.documentElement.dataset.ashFlowcorePhase !== 'NAME') return false;
    const field = document.querySelector('.ash-flowcore-field:not([hidden])');
    const rail = document.querySelector('#ashAiaMembrane .ash-ux-motion-track');
    const canvas = field?.querySelector('.ash-flowcore-field__canvas');
    const phaseLabel = field?.querySelector('[data-flowcore-phase-label]')?.textContent || '';
    const canvasVisible = Boolean(canvas && getComputedStyle(canvas).display !== 'none' && canvas.getBoundingClientRect().height > 0);
    const railVisible = Boolean(rail && getComputedStyle(rail).display !== 'none' && rail.getBoundingClientRect().height > 0);
    if (field?.dataset.flowcorePhaseName !== 'NAME' || field?.dataset.flowcorePlaying !== 'true' || !/NAME/.test(phaseLabel) || !canvasVisible || !railVisible) return false;
    return {
      phase:document.documentElement.dataset.ashFlowcorePhase,
      field_phase:field.dataset.flowcorePhaseName,
      field_playing:true,
      phase_label:phaseLabel,
      canvas_visible:canvasVisible,
      rail_visible:railVisible,
      motion:window.__td613AshPostIngressMotionRestoration.current()
    };
  });
  const activeMotion = await activeMotionHandle.jsonValue();`;

const motionReplacement = String.raw`  await page.waitForFunction(() => window.__ashFlowcorePhaseTrace.some(item => item.phase_name === 'NAME'
    && item.dom_phase === 'NAME'
    && item.playing === true
    && /NAME/.test(item.phase_label)
    && item.canvas_visible === true
    && item.rail_visible === true));
  const activeMotion = await page.evaluate(() => {
    const item = [...window.__ashFlowcorePhaseTrace].reverse().find(entry => entry.phase_name === 'NAME');
    if (!item) return null;
    return {
      phase:item.phase_name,
      field_phase:item.dom_phase,
      field_playing:item.playing,
      phase_label:item.phase_label,
      canvas_visible:item.canvas_visible,
      rail_visible:item.rail_visible,
      motion:item.motion
    };
  });`;

const mobileParityTarget = String.raw`  assert(mobile.static_count === 5 && mobile.rest_visible, 'Mobile/static Flow-Core parity incomplete.');`;
const mobileParityReplacement = String.raw`  const mobileStaticTruth = page.locator('.ash-flowcore-field:not(.ash-flowcore-field--proxy):not([hidden]) #ashWholeInstrumentStaticTruth');
  const mobileStaticTruthText = await mobileStaticTruth.textContent();
  const mobilePhaseNames = await page.evaluate(() => window.__ashFlowcorePhaseTrace.map(item => item.phase_name));
  assert(await mobileStaticTruth.isVisible()
    && ['NOTICE','ACT','WORLD_ANSWERS','NAME','REST'].every(name => mobilePhaseNames.includes(name))
    && /Condition:/.test(mobileStaticTruthText || '')
    && /Consequence:/.test(mobileStaticTruthText || '')
    && /Missingness:/.test(mobileStaticTruthText || '')
    && /Claim ceiling:/.test(mobileStaticTruthText || ''), 'Mobile/static Flow-Core parity incomplete.');`;

await fs.mkdir(artifactDir, { recursive:true });
const source = await fs.readFile(sourceUrl, 'utf8');
const listenerCount = source.split(listenerTarget).length - 1;
const motionCount = source.split(motionTarget).length - 1;
const mobileParityCount = source.split(mobileParityTarget).length - 1;
if (listenerCount !== 1) throw new Error(`Flow-Core witness expected one emitted-phase listener seam; observed ${listenerCount}.`);
if (motionCount !== 1) throw new Error(`Flow-Core witness expected one post-event NAME sampling seam; observed ${motionCount}.`);
if (mobileParityCount !== 1) throw new Error(`Flow-Core witness expected one legacy mobile list-count seam; observed ${mobileParityCount}.`);

const runtime = source
  .replace(listenerTarget, listenerReplacement)
  .replace(motionTarget, motionReplacement)
  .replace(mobileParityTarget, mobileParityReplacement)
  .replace('v0.7-atomic-name-receipt', 'v0.9-emitted-presentation-static-parity');

if (!runtime.includes('dom_phase:field?.dataset.flowcorePhaseName')) throw new Error('Flow-Core emitted DOM-phase receipt was not materialized.');
if (!runtime.includes('motion:item.motion')) throw new Error('Flow-Core emitted motion receipt was not materialized.');
if (!runtime.includes('mobileStaticTruth.isVisible()')) throw new Error('Flow-Core mobile static-truth parity was not materialized.');
if (runtime.includes('activeMotionHandle')) throw new Error('Flow-Core witness retained post-event NAME sampling.');
if (runtime.includes('mobile.static_count === 5')) throw new Error('Flow-Core witness retained the legacy exact list-count proxy.');

await fs.writeFile(runtimePath, runtime, 'utf8');
await import(`${pathToFileURL(runtimePath).href}?runtime=${Date.now()}`);
