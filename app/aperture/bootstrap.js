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
import {
  APERTURE_V32_SCHEMA,
  APERTURE_V32_TYPED_DEFICIT_RECEIPT_SCHEMA,
  APERTURE_V32_VERSION,
  auditTypedEpistemicDeficit,
  classifyTypedEpistemicDeficit,
  selfTestTypedEpistemicDeficit
} from '../engine/aperture-v32-typed-epistemic-deficit.js';
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

export const TD613_APERTURE_V32_EXPERIMENT_DESIGN = Object.freeze({
  version: APERTURE_V32_VERSION,
  schema: APERTURE_V32_SCHEMA,
  receiptSchema: APERTURE_V32_TYPED_DEFICIT_RECEIPT_SCHEMA,
  audit: auditTypedEpistemicDeficit,
  classify: classifyTypedEpistemicDeficit,
  selfTest: selfTestTypedEpistemicDeficit
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
        experimentDesign: TD613_APERTURE_V32_EXPERIMENT_DESIGN,
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

function installTemporalTraceLayout(frameDocument) {
  const block = frameDocument?.getElementById?.('apertureV22TraceBlock');
  if (!block || block.dataset.td613TemporalLayout === 'single-column-v1') return Boolean(block);

  const datetimeInputs = [...block.querySelectorAll('input[type="datetime-local"]')];
  for (const input of datetimeInputs) {
    input.closest('.input-grid')?.classList.add('td613-temporal-time-grid');
  }

  const pilotSelect = block.querySelector('#inputPilotDomain');
  const pilotShell = pilotSelect?.closest('.input-shell');
  const pilotButton = block.querySelector('#btnPilotSchool');
  const pilotActions = pilotButton?.closest('.bridge-actions');
  if (pilotShell && pilotButton && pilotActions) {
    const pilotRow = frameDocument.createElement('div');
    pilotRow.className = 'td613-temporal-pilot-row';
    pilotRow.setAttribute('aria-label', 'Temporal Trace pilot controls');
    pilotRow.append(pilotShell, pilotButton);
    pilotActions.replaceWith(pilotRow);
  }

  block.dataset.td613TemporalLayout = 'single-column-v1';
  return true;
}

function installFrameControlContainment(frame) {
  const frameDocument = frame?.contentDocument;
  if (!frameDocument?.head) return false;

  const styleId = 'td613-aperture-native-datetime-containment';
  if (!frameDocument.getElementById(styleId)) {
    const style = frameDocument.createElement('style');
    style.id = styleId;
    style.textContent = `
      #apertureV22TraceBlock .td613-temporal-time-grid {
        grid-template-columns: minmax(0, 1fr) !important;
        gap: 7px !important;
        min-width: 0 !important;
      }

      #apertureV22TraceBlock .td613-temporal-time-grid .input-shell,
      #apertureV22TraceBlock .td613-temporal-pilot-row .input-shell {
        min-width: 0 !important;
      }

      #apertureV22TraceBlock input[type="datetime-local"] {
        box-sizing: border-box !important;
        inline-size: 100% !important;
        width: 100% !important;
        min-inline-size: 0 !important;
        min-width: 0 !important;
        max-inline-size: 100% !important;
        max-width: 100% !important;
        min-height: 28px !important;
        padding: 5px 8px !important;
        border-radius: 6px !important;
        border-color: rgba(139, 233, 253, 0.18) !important;
        background: linear-gradient(180deg, rgba(12, 16, 28, 0.96), rgba(6, 9, 17, 0.96)) !important;
        color-scheme: dark;
      }

      #apertureV22TraceBlock input[type="datetime-local"]::-webkit-calendar-picker-indicator {
        opacity: 0.7;
        cursor: pointer;
      }

      #apertureV22TraceBlock .td613-temporal-pilot-row {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        gap: 6px;
        align-items: end;
        min-width: 0;
        margin-top: 6px;
      }

      #apertureV22TraceBlock .td613-temporal-pilot-row #inputPilotDomain {
        width: 100% !important;
        min-width: 0 !important;
      }

      #apertureV22TraceBlock .td613-temporal-pilot-row #btnPilotSchool {
        width: auto !important;
        min-height: 28px;
        margin: 0 !important;
        white-space: nowrap;
      }
    `;
    frameDocument.head.appendChild(style);
  }

  installTemporalTraceLayout(frameDocument);
  return true;
}

function scheduleBrowserBoot() {
  const frame = document.getElementById('td613ApertureTool');
  if (!frame) return;
  const run = () => {
    installFrameControlContainment(frame);
    return bootApertureComposition({ root: window, documentImpl: document, frame })
      .catch(error => console.warn('TD613 Aperture composition held:', error));
  };
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
