import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
const corePath = path.join(scriptsDir, 'ash-a15-transition-trace-browser-probe-core.mjs');
const tempPath = path.join(scriptsDir, `.ash-a15-transition-trace-hardened-${process.pid}.mjs`);
const marrowlineLoomWitnessPath = path.join(scriptsDir, 'marrowline-loom-advisory-exact-source-witness.mjs');

const REQUIRED_TRANSITION_STATIC_MARKERS = Object.freeze([
  'observation_window_is_quiescence_proof:false',
  'universal_settlement_claim:false',
  'timing_patch_authorized:false',
  'route_state_settled_equals_workspace_state_settled:false',
  'ROOT_ATTRIBUTE_MUTATION',
  'td613:ash:navigation-receipt',
  'td613:ash:ux-workspace-opened',
  'td613:ash:demo-registry-hydrated',
  'profile_hydration_completion_required:true',
  'route_side_effects_bounded_after_before_route_marker:true',
  'record.sequence > (beforeRoute?.sequence || 0)',
  'route_control_owner_observed_at_click:true',
  'route_click_capture_and_bubble_instrumented:true',
  'function observedClickPhases(cell)',
  "records.some(record => record.kind === 'ROUTE_CLICK_CAPTURE')",
  "records.some(record => record.kind === 'ROUTE_CLICK_BUBBLE')",
  'routeClickCaptureAndBubbleObserved = cells.length > 0 && cells.every(observedClickPhases)',
  'route_click_capture_and_bubble_observed:routeClickCaptureAndBubbleObserved',
  "live_aia_direct_onclick:typeof node.onclick === 'function'",
  'ROUTE_CONTROL_BEFORE_CLICK',
  'ROUTE_CLICK_${phase}',
  "routeClick('CAPTURE')",
  "routeClick('BUBBLE')",
  'AFTER_ROUTE_CLICK_DISPATCH',
  'lacks the Live-AIA direct owner',
  'POINTER_DELIVERY_UNREGISTERED',
  'classifyObserverFailure',
  'beforeClick?.detail?.connected === true',
  'beforeClick?.detail?.live_aia_direct_onclick === true',
  'afterDispatch',
  '!capture',
  '!bubble',
  'pointer_delivery_holds_are_promotion_veto:false',
  'measurement_complete:cells.length + pointerDeliveryHolds.length + failures.length === expectedCellCount',
  'promotion_authority:false',
  'if (failures.length > 0) process.exitCode = 1',
  'LATE_WORKSPACE_SIDE_EFFECT_WITHIN_BOUNDED_HORIZON',
  'COUPLED_WORKSPACE_SIDE_EFFECT_WITHIN_BOUNDED_HORIZON',
  'workspace_normalization_applied:false',
  'observed_pre_route_workspace',
  'td613Diagnostic',
  'trace_records'
]);

function replaceExactly(source, marker, replacement, label) {
  const count = source.split(marker).length - 1;
  if (count !== 1) throw new Error(`${label} expected exactly one marker; observed ${count}`);
  return source.replace(marker, replacement);
}

let source = await fs.readFile(corePath, 'utf8');
source = replaceExactly(
  source,
  `    return witness?.observed === true
      && witness?.detail?.profile === selected
      && witness?.detail?.status === 'HYDRATED';`,
  `    return witness?.observed === true
      && witness?.detail?.profile === selected
      && witness?.detail?.status === 'HYDRATED'
      && witness?.detail?.automatic_ash_action === false;`,
  'A15 transition hydration authority closure'
);
source = replaceExactly(
  source,
  `  await page.waitForFunction(selected => {
    const current = window.__td613AshKeep?.current?.() || null;`,
  `  if (!hydrationReceipt || hydrationReceipt.profile !== profile || hydrationReceipt.status !== 'HYDRATED' || hydrationReceipt.automatic_ash_action !== false) {
    throw new Error(\`A15 transition hydration authority widened for \${profile}: \${JSON.stringify(hydrationReceipt)}\`);
  }

  await page.waitForFunction(selected => {
    const current = window.__td613AshKeep?.current?.() || null;`,
  'A15 transition hydration receipt validation'
);
for (const marker of REQUIRED_TRANSITION_STATIC_MARKERS) {
  if (!source.includes(marker)) throw new Error(`A15 transition historical witness law missing after release hardening: ${marker}`);
}
if (!source.includes("witness?.detail?.automatic_ash_action === false")
    || !source.includes('hydrationReceipt.automatic_ash_action !== false')) {
  throw new Error('A15 transition hydration hardening did not compile into the generated probe.');
}
await fs.writeFile(tempPath, source, 'utf8');
try {
  await import(`${pathToFileURL(tempPath).href}?td613_a15_transition_hardened=${Date.now()}`);
} finally {
  await fs.unlink(tempPath).catch(() => {});
}

// Descendant observation only: after the inherited A15 transition witness closes,
// prove the checked-out PR tree is byte-identical to the raw event head tree before
// running the independent Marrowline Loom advisory browser assay in the same engine.
// A custody mismatch or browser failure leaves the enclosing calibration command nonzero.
await import(`${pathToFileURL(marrowlineLoomWitnessPath).href}?td613_marrowline_loom_exact_source=${Date.now()}`);
