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

const TEMPORAL_TRACE_STEPS = Object.freeze([
  Object.freeze({ id: 'inputTSense', name: 'Sensed', variable: 't_sense', cue: 'signal first enters observation' }),
  Object.freeze({ id: 'inputTModel', name: 'Modeled', variable: 't_model', cue: 'a model or interpretation takes form' }),
  Object.freeze({ id: 'inputTOp', name: 'Operator action', variable: 't_op', cue: 'an operator acts on the modeled state' }),
  Object.freeze({ id: 'inputTInst', name: 'Institutional registration', variable: 't_inst', cue: 'the institution records or formalizes the event' }),
  Object.freeze({ id: 'inputTPub', name: 'Public visibility', variable: 't_pub', cue: 'the event becomes publicly legible' })
]);

function installTemporalTraceLayout(frameDocument) {
  const block = frameDocument?.getElementById?.('apertureV22TraceBlock');
  if (!block || block.dataset.td613TemporalLayout === 'chronology-v2') return Boolean(block);

  const title = block.querySelector('.hook-title');
  if (title && !block.querySelector('.td613-temporal-intro')) {
    const intro = frameDocument.createElement('div');
    intro.className = 'td613-temporal-intro';
    intro.textContent = 'Mark when the event moved from sensing → modeling → action → registration → public visibility.';
    title.insertAdjacentElement('afterend', intro);
  }

  const firstInput = block.querySelector('#inputTSense');
  const firstGrid = firstInput?.closest('.input-grid');
  if (firstGrid) {
    const chronology = frameDocument.createElement('div');
    chronology.className = 'td613-temporal-chronology';
    chronology.setAttribute('role', 'group');
    chronology.setAttribute('aria-label', 'Temporal trace chronology');
    firstGrid.parentNode.insertBefore(chronology, firstGrid);

    TEMPORAL_TRACE_STEPS.forEach((step, index) => {
      const input = block.querySelector(`#${step.id}`);
      const shell = input?.closest('.input-shell');
      if (!input || !shell) return;

      shell.classList.add('td613-temporal-event');
      shell.dataset.temporalStep = String(index + 1).padStart(2, '0');

      const label = shell.querySelector(`label[for="${step.id}"]`);
      if (label) {
        label.classList.add('td613-temporal-label');
        label.textContent = '';
        const name = frameDocument.createElement('span');
        name.className = 'td613-temporal-name';
        name.textContent = step.name;
        const variable = frameDocument.createElement('span');
        variable.className = 'td613-temporal-variable';
        variable.textContent = step.variable;
        label.append(name, variable);
      }

      if (!shell.querySelector('.td613-temporal-cue')) {
        const cue = frameDocument.createElement('span');
        cue.className = 'td613-temporal-cue';
        cue.textContent = step.cue;
        input.insertAdjacentElement('beforebegin', cue);
      }

      chronology.appendChild(shell);
    });
  }

  for (const grid of [...block.querySelectorAll('.input-grid')]) {
    if (!grid.children.length) grid.remove();
  }

  const pilotSelect = block.querySelector('#inputPilotDomain');
  const pilotShell = pilotSelect?.closest('.input-shell');
  const pilotButton = block.querySelector('#btnPilotSchool');
  const pilotActions = pilotButton?.closest('.bridge-actions');
  if (pilotShell && pilotButton && pilotActions) {
    const pilotLabel = pilotShell.querySelector('label[for="inputPilotDomain"]');
    if (pilotLabel) pilotLabel.textContent = 'Pilot preset';

    pilotButton.textContent = 'LOAD PILOT';
    pilotButton.setAttribute('aria-label', 'Load selected Temporal Trace pilot preset');

    const pilotCard = frameDocument.createElement('div');
    pilotCard.className = 'td613-temporal-pilot-card';
    const pilotHeading = frameDocument.createElement('div');
    pilotHeading.className = 'td613-temporal-pilot-heading';
    pilotHeading.textContent = 'Optional guided starting point';
    const pilotCopy = frameDocument.createElement('div');
    pilotCopy.className = 'td613-temporal-pilot-copy';
    pilotCopy.textContent = 'Load a preset timeline, then inspect or change every field yourself.';
    const pilotRow = frameDocument.createElement('div');
    pilotRow.className = 'td613-temporal-pilot-row';
    pilotRow.setAttribute('aria-label', 'Temporal Trace pilot controls');
    pilotRow.append(pilotShell, pilotButton);
    pilotCard.append(pilotHeading, pilotCopy, pilotRow);
    pilotActions.replaceWith(pilotCard);
  }

  for (const grid of [...block.querySelectorAll('.input-grid')]) {
    if (!grid.children.length) grid.remove();
  }

  block.dataset.td613TemporalLayout = 'chronology-v2';
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
      #apertureV22TraceBlock .td613-temporal-intro {
        margin-top: 5px;
        padding: 6px 7px;
        border: 1px solid rgba(139, 233, 253, 0.10);
        border-radius: 6px;
        background: linear-gradient(90deg, rgba(139, 233, 253, 0.035), rgba(189, 147, 249, 0.03));
        color: rgba(196, 210, 231, 0.68);
        font-size: 6.7px;
        line-height: 1.45;
      }

      #apertureV22TraceBlock .td613-temporal-chronology {
        position: relative;
        display: grid;
        grid-template-columns: minmax(0, 1fr);
        gap: 7px;
        margin-top: 7px;
        min-width: 0;
      }

      #apertureV22TraceBlock .td613-temporal-chronology::before {
        content: '';
        position: absolute;
        left: 5px;
        top: 12px;
        bottom: 12px;
        width: 1px;
        background: linear-gradient(180deg, rgba(139, 233, 253, 0.30), rgba(189, 147, 249, 0.16));
        pointer-events: none;
      }

      #apertureV22TraceBlock .td613-temporal-event {
        position: relative;
        display: grid !important;
        grid-template-columns: minmax(0, 1fr);
        gap: 3px !important;
        min-width: 0 !important;
        padding: 6px 7px 7px 17px;
        border: 1px solid rgba(90, 120, 170, 0.10);
        border-radius: 7px;
        background: linear-gradient(135deg, rgba(11, 15, 25, 0.80), rgba(6, 9, 17, 0.52));
      }

      #apertureV22TraceBlock .td613-temporal-event::before {
        content: attr(data-temporal-step);
        position: absolute;
        left: 1px;
        top: 9px;
        z-index: 1;
        width: 9px;
        height: 9px;
        display: grid;
        place-items: center;
        border: 1px solid rgba(139, 233, 253, 0.38);
        border-radius: 50%;
        background: #080c14;
        color: rgba(139, 233, 253, 0.76);
        font-size: 3.9px;
        line-height: 1;
        box-shadow: 0 0 8px rgba(139, 233, 253, 0.08);
      }

      #apertureV22TraceBlock .td613-temporal-label {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 8px;
        min-width: 0;
        text-transform: none !important;
        letter-spacing: 0 !important;
      }

      #apertureV22TraceBlock .td613-temporal-name {
        color: rgba(230, 237, 249, 0.92);
        font-size: 7.5px;
        font-weight: 700;
        letter-spacing: 0.15px;
      }

      #apertureV22TraceBlock .td613-temporal-variable {
        color: rgba(139, 233, 253, 0.58);
        font-size: 5.8px;
        font-weight: 600;
        letter-spacing: 0.25px;
        white-space: nowrap;
      }

      #apertureV22TraceBlock .td613-temporal-cue {
        color: rgba(173, 188, 214, 0.52);
        font-size: 5.6px;
        line-height: 1.25;
      }

      #apertureV22TraceBlock input[type="datetime-local"] {
        box-sizing: border-box !important;
        inline-size: 100% !important;
        width: 100% !important;
        min-inline-size: 0 !important;
        min-width: 0 !important;
        max-inline-size: 100% !important;
        max-width: 100% !important;
        min-height: 30px !important;
        padding: 5px 8px !important;
        border-radius: 6px !important;
        border-color: rgba(139, 233, 253, 0.18) !important;
        background: linear-gradient(180deg, rgba(12, 16, 28, 0.98), rgba(6, 9, 17, 0.98)) !important;
        color-scheme: dark;
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.018);
      }

      #apertureV22TraceBlock input[type="datetime-local"]:focus {
        border-color: rgba(139, 233, 253, 0.42) !important;
        box-shadow: 0 0 0 1px rgba(139, 233, 253, 0.08), 0 0 10px rgba(139, 233, 253, 0.05) !important;
      }

      #apertureV22TraceBlock input[type="datetime-local"]::-webkit-calendar-picker-indicator {
        opacity: 0.72;
        cursor: pointer;
      }

      #apertureV22TraceBlock .td613-temporal-pilot-card {
        margin-top: 8px;
        padding: 7px;
        border: 1px solid rgba(189, 147, 249, 0.14);
        border-radius: 7px;
        background: linear-gradient(135deg, rgba(189, 147, 249, 0.045), rgba(80, 250, 123, 0.018));
      }

      #apertureV22TraceBlock .td613-temporal-pilot-heading {
        color: rgba(226, 215, 250, 0.88);
        font-size: 6.7px;
        font-weight: 700;
        letter-spacing: 0.18px;
      }

      #apertureV22TraceBlock .td613-temporal-pilot-copy {
        margin-top: 2px;
        color: rgba(176, 188, 210, 0.54);
        font-size: 5.5px;
        line-height: 1.3;
      }

      #apertureV22TraceBlock .td613-temporal-pilot-row {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        gap: 6px;
        align-items: end;
        min-width: 0;
        margin-top: 6px;
      }

      #apertureV22TraceBlock .td613-temporal-pilot-row .input-shell {
        min-width: 0 !important;
      }

      #apertureV22TraceBlock .td613-temporal-pilot-row #inputPilotDomain {
        width: 100% !important;
        min-width: 0 !important;
        min-height: 28px;
        border-color: rgba(189, 147, 249, 0.18);
        border-radius: 6px;
        background: rgba(10, 12, 22, 0.94);
      }

      #apertureV22TraceBlock .td613-temporal-pilot-row #btnPilotSchool {
        width: auto !important;
        min-height: 28px;
        margin: 0 !important;
        padding-inline: 9px !important;
        white-space: nowrap;
        border-color: rgba(189, 147, 249, 0.24);
        background: linear-gradient(180deg, rgba(189, 147, 249, 0.11), rgba(8, 10, 18, 0.78));
      }

      @media (max-width: 420px) {
        #apertureV22TraceBlock .td613-temporal-pilot-row {
          grid-template-columns: minmax(0, 1fr);
        }
        #apertureV22TraceBlock .td613-temporal-pilot-row #btnPilotSchool {
          width: 100% !important;
        }
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
