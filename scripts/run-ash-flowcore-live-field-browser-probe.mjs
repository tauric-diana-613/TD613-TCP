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
  window.__ashFlowcoreExplanationTrace = [];
  window.__ashFlowcoreRecoveredPlayTrace = [];
  addEventListener('td613:ash:explanation-frame', event => {
    const item = event.detail || {};
    window.__ashFlowcoreExplanationTrace.push({
      step:item.step,
      trace:Array.isArray(item.trace) ? [...item.trace] : [],
      performance_ms:Number(performance.now().toFixed(3))
    });
  });
  addEventListener('td613:ash:flowcore-recovered-play-motion', event => {
    const item = event.detail || {};
    window.__ashFlowcoreRecoveredPlayTrace.push({ ...item, performance_ms:Number(performance.now().toFixed(3)) });
  });
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
      performance_ms:Number(performance.now().toFixed(3)),
      motion:window.__td613AshPostIngressMotionRestoration?.current?.() || {}
    });
  });
});`;

const ingressReadinessStart = String.raw`  await page.waitForFunction(() => {
    const portal = window.__td613AshFlowcoreIngressPortal?.current?.();
    const visible = document.querySelector('.ash-flowcore-field:not([hidden])');
    return window.__td613AshFlowcoreField?.current?.().artifact_required === false`;
const ingressReadinessEnd = String.raw`  });

  const ingressDesktop =`;
const ingressReadinessReplacement = String.raw`  await page.waitForFunction(() => {
    const registry = window.__td613AshDemoRegistry?.snapshot?.();
    const visible = document.querySelector('.ash-flowcore-field:not([hidden])');
    return window.__td613AshFlowcoreField?.current?.().artifact_required === false
      && window.__td613AshPostIngressMotionRestoration?.version
      && window.__td613AshDemoRegistry?.version === 'td613.ash.demo-registry/v0.3-a15'
      && registry?.empirical_matrix_cells === 120
      && window.__td613AshA15EmpiricalJourneys?.version === 'td613.ash.a15-empirical-profile-journeys/v0.1'
      && document.documentElement.dataset.ashCompositionStable
      && document.getElementById('launch')
      && visible?.parentElement?.id === 'guidedLaunchPromise'
      && visible.getBoundingClientRect().height > 260;
  });
  await page.evaluate(() => {
    window.__td613AshDemoRegistry?.reconcile?.();
    window.__td613AshPostIngressMotionRestoration?.refresh?.();
    window.__td613AshIngressCopySpacing?.refresh?.();
    window.__td613AshFlowcoreIngressPortal?.refresh?.();
  });
  await page.waitForFunction(() => {
    const registry = window.__td613AshDemoRegistry?.snapshot?.();
    const visible = document.querySelector('.ash-flowcore-field:not([hidden])');
    // Canonical ownership and visible Play settle first; portal and spacing are asserted directly below.
    return registry?.control_owner === 'ASH_DEMO_REGISTRY'
      && registry?.empirical_matrix_cells === 120
      && document.documentElement.dataset.ashDemoControlOwner === 'ASH_DEMO_REGISTRY'
      && document.documentElement.dataset.ashDemoRegistry === 'td613.ash.demo-registry/v0.3-a15'
      && visible?.querySelectorAll('[data-aia-play]').length === 1
      && !visible.querySelector('[data-flowcore-ingress-play]');
  });

  const ingressDesktop =`;

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

const motionReplacement = String.raw`  const atomicNameReceipt = item => item.phase_name === 'NAME'
    && item.dom_phase === 'NAME'
    && item.playing === true
    && /NAME/.test(item.phase_label)
    && item.canvas_visible === true
    && item.rail_visible === true;
  try {
    await page.waitForFunction(() => window.__ashFlowcorePhaseTrace.some(item => item.phase_name === 'NAME'
      && item.dom_phase === 'NAME'
      && item.playing === true
      && /NAME/.test(item.phase_label)
      && item.canvas_visible === true
      && item.rail_visible === true));
  } catch (error) {
    const diagnostic = await page.evaluate(() => {
      const field = document.querySelector('.ash-flowcore-field:not(.ash-flowcore-field--proxy):not([hidden])');
      const rail = document.querySelector('#ashAiaMembrane .ash-ux-motion-track');
      const canvas = field?.querySelector('.ash-flowcore-field__canvas');
      const play = field?.querySelector('[data-aia-play]');
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
      const ui = window.__td613AshUiUxRescue?.current?.() || null;
      let explanationTrace = [];
      try { explanationTrace = JSON.parse(ui?.explanation_trace || document.documentElement.dataset.ashExplanationTrace || '[]'); } catch {}
      const phaseTrace = structuredClone(window.__ashFlowcorePhaseTrace || []);
      const explanationEvents = structuredClone(window.__ashFlowcoreExplanationTrace || []);
      const recoveredPlayEvents = structuredClone(window.__ashFlowcoreRecoveredPlayTrace || []);
      const remountPlay = window.__td613AshFlowcoreWorkspaceRemount?.currentPlay?.() || null;
      const nameFrameEmitted = explanationEvents.some(item => Number(item.step) === 3) || explanationTrace.includes(3);
      const namePhaseEmitted = phaseTrace.some(item => item.phase_name === 'NAME');
      const atomicNameObserved = phaseTrace.some(item => item.phase_name === 'NAME'
        && item.dom_phase === 'NAME'
        && item.playing === true
        && /NAME/.test(item.phase_label || '')
        && item.canvas_visible === true
        && item.rail_visible === true);
      const motionStarted = ['PLAYING','COMPLETE','STATIC_COMPLETE'].includes(ui?.explanation_motion)
        || explanationTrace.length > 0
        || explanationEvents.length > 0
        || remountPlay?.motion_started === true;
      return {
        play:play ? {
          connected:play.isConnected,
          visible:rendered(play),
          owner:play.dataset.aiaPlayOwner || null,
          recovery:play.dataset.aiaPlayRecovery || null,
          direct_onclick:typeof play.onclick === 'function',
          text:play.textContent?.trim() || ''
        } : null,
        remount_play:remountPlay,
        ui_motion:ui,
        motion_started:motionStarted,
        explanation_trace:explanationTrace,
        explanation_events:explanationEvents,
        recovered_play_events:recoveredPlayEvents,
        phase_trace:phaseTrace,
        name_frame_emitted:nameFrameEmitted,
        name_phase_emitted:namePhaseEmitted,
        atomic_name_observed:atomicNameObserved,
        field:field ? {
          phase_name:field.dataset.flowcorePhaseName || null,
          playing:field.dataset.flowcorePlaying === 'true',
          phase_label:field.querySelector('[data-flowcore-phase-label]')?.textContent || '',
          canvas_visible:rendered(canvas),
          rail_visible:rendered(rail)
        } : null,
        document_state:{
          flowcore_phase:document.documentElement.dataset.ashFlowcorePhase || null,
          explanation_motion:document.documentElement.dataset.ashExplanationMotion || null,
          explanation_frame:document.documentElement.dataset.ashExplanationFrame || null,
          explanation_trace:document.documentElement.dataset.ashExplanationTrace || null,
          consequence_motion_posture:document.documentElement.dataset.ashConsequenceMotionPosture || null
        }
      };
    });
    let classification = 'LIVE_FIELD_NAME_SETTLEMENT_TIMEOUT_UNCLASSIFIED';
    if (diagnostic.play?.recovery === 'LIVE_AIA_REPLAY_DELEGATE' && diagnostic.remount_play?.motion_started !== true) {
      classification = 'RECOVERED_DUAL_OWNER_NOT_INVOKED';
    } else if (diagnostic.motion_started !== true) {
      classification = 'MOTION_OWNER_NOT_STARTED';
    } else if (diagnostic.name_frame_emitted !== true) {
      classification = 'MOTION_STARTED_NAME_FRAME_NOT_EMITTED';
    } else if (diagnostic.name_phase_emitted !== true) {
      classification = 'NAME_FRAME_EMITTED_FLOWCORE_NAME_EVENT_MISSING';
    } else if (diagnostic.atomic_name_observed !== true) {
      classification = 'FLOWCORE_NAME_EVENT_ATOMIC_DOM_CONJUNCT_MISMATCH';
    }
    const held = new Error('Flow-Core atomic NAME settlement held [' + classification + ']: ' + JSON.stringify(diagnostic), { cause:error });
    held.td613FlowcoreLiveFieldDiagnostic = { classification, diagnostic };
    throw held;
  }
  const activeMotion = await page.evaluate(() => {
    const item = [...window.__ashFlowcorePhaseTrace].reverse().find(entry => entry.phase_name === 'NAME'
      && entry.dom_phase === 'NAME'
      && entry.playing === true
      && /NAME/.test(entry.phase_label)
      && entry.canvas_visible === true
      && entry.rail_visible === true);
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

function replaceBoundedExactlyOnce(source, start, end, replacement, label) {
  const startIndex = source.indexOf(start);
  if (startIndex < 0 || source.indexOf(start, startIndex + start.length) >= 0) {
    throw new Error(`Flow-Core witness expected one ${label} start seam.`);
  }
  const endIndex = source.indexOf(end, startIndex + start.length);
  if (endIndex < 0 || source.indexOf(end, endIndex + end.length) >= 0) {
    throw new Error(`Flow-Core witness expected one ${label} end seam.`);
  }
  return source.slice(0, startIndex) + replacement + source.slice(endIndex + end.length);
}

await fs.mkdir(artifactDir, { recursive:true });
const source = await fs.readFile(sourceUrl, 'utf8');
const listenerCount = source.split(listenerTarget).length - 1;
const motionCount = source.split(motionTarget).length - 1;
const mobileParityCount = source.split(mobileParityTarget).length - 1;
if (listenerCount !== 1) throw new Error(`Flow-Core witness expected one emitted-phase listener seam; observed ${listenerCount}.`);
if (motionCount !== 1) throw new Error(`Flow-Core witness expected one post-event NAME sampling seam; observed ${motionCount}.`);
if (mobileParityCount !== 1) throw new Error(`Flow-Core witness expected one legacy mobile list-count seam; observed ${mobileParityCount}.`);

let runtime = source.replace(listenerTarget, listenerReplacement);
runtime = replaceBoundedExactlyOnce(runtime, ingressReadinessStart, ingressReadinessEnd, ingressReadinessReplacement, 'A15 registry-owned DOM readiness with direct receipt assertions');
runtime = runtime
  .replace(motionTarget, motionReplacement)
  .replace(mobileParityTarget, mobileParityReplacement)
  .replace('v0.7-atomic-name-receipt', 'v0.17-live-field-name-settlement-diagnostics');

if (!runtime.includes('dom_phase:field?.dataset.flowcorePhaseName')) throw new Error('Flow-Core emitted DOM-phase receipt was not materialized.');
if (!runtime.includes('window.__ashFlowcoreExplanationTrace = []')) throw new Error('Flow-Core explanation-frame diagnostic trace was not materialized.');
if (!runtime.includes('window.__ashFlowcoreRecoveredPlayTrace = []')) throw new Error('Flow-Core recovered-play diagnostic trace was not materialized.');
if (!runtime.includes('RECOVERED_DUAL_OWNER_NOT_INVOKED')) throw new Error('Flow-Core recovered dual-owner hold classification was not materialized.');
if (!runtime.includes('MOTION_STARTED_NAME_FRAME_NOT_EMITTED')) throw new Error('Flow-Core NAME-frame hold classification was not materialized.');
if (!runtime.includes('NAME_FRAME_EMITTED_FLOWCORE_NAME_EVENT_MISSING')) throw new Error('Flow-Core NAME-event hold classification was not materialized.');
if (!runtime.includes('FLOWCORE_NAME_EVENT_ATOMIC_DOM_CONJUNCT_MISMATCH')) throw new Error('Flow-Core atomic DOM-conjunct hold classification was not materialized.');
if (!runtime.includes('Canonical ownership and visible Play settle first; portal and spacing are asserted directly below.')) throw new Error('Flow-Core registry-owned DOM readiness was not materialized.');
if (!runtime.includes("window.__td613AshDemoRegistry?.version === 'td613.ash.demo-registry/v0.3-a15'")) throw new Error('Flow-Core A15 registry version gate was not materialized.');
if (!runtime.includes('registry?.empirical_matrix_cells === 120')) throw new Error('Flow-Core A15 empirical matrix gate was not materialized.');
if (!runtime.includes("window.__td613AshA15EmpiricalJourneys?.version === 'td613.ash.a15-empirical-profile-journeys/v0.1'")) throw new Error('Flow-Core A15 empirical interpreter gate was not materialized.');
if (!runtime.includes("registry?.control_owner === 'ASH_DEMO_REGISTRY'")) throw new Error('Flow-Core registry owner gate was not materialized.');
if (!runtime.includes("document.documentElement.dataset.ashDemoControlOwner === 'ASH_DEMO_REGISTRY'")) throw new Error('Flow-Core DOM registry owner gate was not materialized.');
if (!runtime.includes('window.__td613AshDemoRegistry?.reconcile?.()')) throw new Error('Flow-Core registry reconciliation was not materialized.');
if (!runtime.includes('window.__td613AshIngressCopySpacing?.refresh?.()')) throw new Error('Flow-Core ingress spacing receipt refresh was not materialized.');
if (!runtime.includes('window.__td613AshFlowcoreIngressPortal?.refresh?.()')) throw new Error('Flow-Core ingress portal receipt refresh was not materialized.');
if (!runtime.includes("entry.dom_phase === 'NAME'")) throw new Error('Flow-Core atomic NAME receipt selection was not materialized.');
if (!runtime.includes('motion:item.motion')) throw new Error('Flow-Core emitted motion receipt was not materialized.');
if (!runtime.includes('mobileStaticTruth.isVisible()')) throw new Error('Flow-Core mobile static-truth parity was not materialized.');
if (runtime.includes('activeMotionHandle')) throw new Error('Flow-Core witness retained post-event NAME sampling.');
if (runtime.includes('mobile.static_count === 5')) throw new Error('Flow-Core witness retained the legacy exact list-count proxy.');
for (const retired of ['td613.ash.demo-registry/v0.1-a13','td613.ash.demo-registry/v0.2-a14']) {
  if (runtime.includes(retired)) throw new Error(`Flow-Core witness retained retired registry gate ${retired}.`);
}

await fs.writeFile(runtimePath, runtime, 'utf8');
await import(`${pathToFileURL(runtimePath).href}?runtime=${Date.now()}`);