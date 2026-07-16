import { APERTURE_RELEASE } from './release.js';
import {
  APERTURE_V3_DIAGNOSTIC_SCHEMA,
  APERTURE_V3_SCHEMA,
  APERTURE_V3_TASK_ROUTE_SCHEMA,
  APERTURE_V3_VERSION,
  apertureV3DisplayHeader,
  buildApertureV3InvocationReceipt,
  routeApertureTaskIntent
} from '../engine/aperture-v3-task-intent.js';
import {
  APERTURE_V31_COMPATIBILITY_PROFILE,
  APERTURE_V31_PRODUCER_SCHEMA,
  APERTURE_V31_PRODUCER_VERSION,
  assertStrictV30RoundTripShape,
  compileV31CompatibleRoundTrip,
  compileV31DiagnosticForV30Bridge
} from '../engine/aperture-v31-compatibility.js';
import { TD613_PHASE4_RECIPROCAL_BRIDGE } from '../engine/aperture-v3-reciprocal-bridge.js';
import { APERTURE_COMPOSITION_MANIFEST } from '../engine/aperture-composition.js';
import { installApertureCompositionForFrame } from '../engine/aperture-composition-frame.js';

export const TD613_APERTURE_TASK_INTENT = Object.freeze({
  version: APERTURE_V3_VERSION,
  schema: APERTURE_V3_SCHEMA,
  routeSchema: APERTURE_V3_TASK_ROUTE_SCHEMA,
  diagnosticSchema: APERTURE_V3_DIAGNOSTIC_SCHEMA,
  routeApertureTaskIntent,
  buildApertureV3InvocationReceipt,
  apertureV3DisplayHeader
});

export const TD613_APERTURE_V31_COMPATIBILITY = Object.freeze({
  version: APERTURE_V31_PRODUCER_VERSION,
  schema: APERTURE_V31_PRODUCER_SCHEMA,
  compatibilityProfile: APERTURE_V31_COMPATIBILITY_PROFILE,
  compileV31DiagnosticForV30Bridge,
  compileV31CompatibleRoundTrip,
  assertStrictV30RoundTripShape
});

function dispatchHeld(root, frame, error) {
  const CustomEventImpl = root?.CustomEvent || globalThis.CustomEvent;
  if (typeof CustomEventImpl !== 'function') return;
  const detail = Object.freeze({
    schema: APERTURE_COMPOSITION_MANIFEST.schema,
    version: APERTURE_COMPOSITION_MANIFEST.version,
    status: 'COMPOSITION_HELD_FOR_REPAIR',
    reason: String(error?.message || error || 'unknown composition error'),
    authority_transfer: false,
    automatic_ash_action: false
  });
  frame?.contentWindow?.dispatchEvent?.(new CustomEventImpl(APERTURE_COMPOSITION_MANIFEST.held_event, { detail }));
  root?.dispatchEvent?.(new CustomEventImpl(APERTURE_COMPOSITION_MANIFEST.held_event, { detail }));
}

export async function bootApertureComposition({
  root = globalThis.window,
  documentImpl = globalThis.document,
  frame = documentImpl?.getElementById?.('td613ApertureTool'),
  created_at = null
} = {}) {
  if (!root || !documentImpl || !frame) throw new Error('Aperture composition bootstrap requires the stable public shim and canonical iframe.');
  try {
    const receipt = await installApertureCompositionForFrame({
      root,
      frame,
      manifest: APERTURE_COMPOSITION_MANIFEST,
      modules: {
        release: APERTURE_RELEASE,
        taskIntent: TD613_APERTURE_TASK_INTENT,
        compatibility: TD613_APERTURE_V31_COMPATIBILITY,
        reciprocalBridge: TD613_PHASE4_RECIPROCAL_BRIDGE
      },
      created_at
    });
    root.TD613_APERTURE_COMPOSITION_RECEIPT = receipt;
    return receipt;
  } catch (error) {
    dispatchHeld(root, frame, error);
    throw error;
  }
}

function scheduleBrowserBoot() {
  const frame = document.getElementById('td613ApertureTool');
  if (!frame) return;
  const run = () => bootApertureComposition({ root: window, documentImpl: document, frame })
    .catch(error => console.warn('TD613 Aperture composition held:', error));
  frame.addEventListener('load', run, { once: false, passive: true });
  if (frame.contentDocument?.readyState === 'complete') queueMicrotask(run);
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scheduleBrowserBoot, { once: true });
  } else {
    scheduleBrowserBoot();
  }
}
