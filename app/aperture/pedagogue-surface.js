export const APERTURE_PEDAGOGUE_SURFACE_VERSION = 'v1.0.0';
export const APERTURE_PEDAGOGUE_SURFACE_SCHEMA = 'td613.aperture.pedagogue-surface/v1';

export const APERTURE_COUNTER_TOOL_ROUTE_GUIDE = Object.freeze({
  schema: 'td613.aperture.counter-tool-route-guide/v1',
  surface: 'Counter-Tool Field',
  pedagogue_posture: 'consequence_before_ontology',
  use_when: Object.freeze([
    'a supplied trace or account needs counter-reading',
    'provenance, occlusion, or registration gaps matter',
    'two observations need comparison without forced equivalence',
    'temporal order from sensing through public registration matters',
    'residue mapping needs a human-inspectable route'
  ]),
  routes: Object.freeze([
    Object.freeze({ id: 'current-field', label: 'Use current field', consequence: "Read the instrument's present state without supplying a trace." }),
    Object.freeze({ id: 'trace', label: 'Enter a trace', consequence: 'Supply an observed account or sequence for counter-reading.' }),
    Object.freeze({ id: 'parallel', label: 'Compare traces', consequence: 'Compare observations without collapsing them into equivalence.' })
  ]),
  temporal_lab: Object.freeze({
    purpose: 'Mark when an event moved from sensing to modeling to action to institutional registration to public visibility.',
    pilot_is_optional: true,
    pilot_is_editable: true,
    pilot_is_not_evidence: true
  }),
  reciprocal_receipt_bridge: Object.freeze({
    law: 'receipts may travel; authority does not',
    status_nodes_are_controls: false,
    human_gate_remains_explicit: true,
    automatic_authority_transfer: false
  })
});

const TEMPORAL_STEPS = Object.freeze([
  Object.freeze({ id: 'inputTSense', name: 'Sensed', variable: 't_sense', cue: 'signal first enters observation' }),
  Object.freeze({ id: 'inputTModel', name: 'Modeled', variable: 't_model', cue: 'a model or interpretation takes form' }),
  Object.freeze({ id: 'inputTOp', name: 'Operator action', variable: 't_op', cue: 'an operator acts on the modeled state' }),
  Object.freeze({ id: 'inputTInst', name: 'Institutional registration', variable: 't_inst', cue: 'the institution records or formalizes the event' }),
  Object.freeze({ id: 'inputTPub', name: 'Public visibility', variable: 't_pub', cue: 'the event becomes publicly legible' })
]);

const RECEIPT_STAGES = Object.freeze([
  Object.freeze({ id: 'rrbStepDiagnostic', help: 'Aperture forms the diagnostic receipt. This stage reports state; it grants no authority.' }),
  Object.freeze({ id: 'rrbStepContext', help: 'Flow-Core returns bounded context. Returned context cannot transfer authority.' }),
  Object.freeze({ id: 'rrbStepAudit', help: 'Aperture audits source status, uncertainty, and missingness in the returned receipt.' }),
  Object.freeze({ id: 'rrbStepRelation', help: 'A relation may be proposed locally. A relation candidate is not truth, custody, or execution.' }),
  Object.freeze({ id: 'rrbStepHuman', help: 'Human confirmation becomes available only after the prior route exists. The node itself is not a control.' })
]);

const STYLE_TEXT = `
#humanRoutePanel[data-td613-pedagogue="true"] .td613-counter-guide { margin:6px 0 7px;padding:7px;border:1px solid rgba(139,233,253,.12);border-radius:8px;background:linear-gradient(135deg,rgba(139,233,253,.035),rgba(189,147,249,.025)); }
#humanRoutePanel .td613-counter-guide-kicker { color:rgba(139,233,253,.78);font-size:6.2px;font-weight:700;letter-spacing:.11em;text-transform:uppercase; }
#humanRoutePanel .td613-counter-guide-copy { margin-top:3px;color:rgba(210,221,239,.7);font-size:6.7px;line-height:1.42; }
#humanRoutePanel #inputModeSwitch.td613-route-chooser { display:grid!important;grid-template-columns:minmax(0,1fr)!important;gap:5px!important;margin-top:6px; }
#humanRoutePanel #inputModeSwitch.td613-route-chooser button { display:grid!important;grid-template-columns:minmax(0,1fr)!important;gap:2px;min-width:0;min-height:37px;padding:6px 8px!important;text-align:left!important;border-radius:7px!important; }
#humanRoutePanel .td613-route-name { color:rgba(232,239,249,.92);font-size:7.1px;font-weight:800;letter-spacing:.04em; }
#humanRoutePanel .td613-route-copy { color:rgba(176,191,214,.58);font-size:5.7px;line-height:1.25;font-weight:500;letter-spacing:0;text-transform:none; }
#humanRoutePanel #inputModeSwitch button.active .td613-route-copy { color:rgba(207,228,240,.76); }
#humanRoutePanel .td613-current-field-note { display:none;margin-top:7px;padding:7px;border-left:2px solid rgba(139,233,253,.38);background:rgba(8,13,21,.5);color:rgba(190,205,224,.65);font-size:6.2px;line-height:1.4; }
#humanRoutePanel[data-td613-route="field"] .td613-current-field-note { display:block; }
#humanRoutePanel[data-td613-route="field"] .td613-counter-supplied,#humanRoutePanel[data-td613-route="field"] #apertureV22TraceBlock,#humanRoutePanel[data-td613-route="field"] .route-actions { display:none!important; }

#apertureV22TraceBlock[data-td613-temporal-layout="chronology-v3"] .td613-temporal-intro { margin:5px 0 7px;padding:6px 7px;border:1px solid rgba(139,233,253,.10);border-radius:6px;background:linear-gradient(90deg,rgba(139,233,253,.035),rgba(189,147,249,.03));color:rgba(196,210,231,.68);font-size:6.4px;line-height:1.45; }
#apertureV22TraceBlock .td613-temporal-chronology { position:relative;display:grid;grid-template-columns:minmax(0,1fr);gap:7px;min-width:0; }
#apertureV22TraceBlock .td613-temporal-chronology::before { content:'';position:absolute;left:5px;top:13px;bottom:13px;width:1px;background:linear-gradient(180deg,rgba(139,233,253,.32),rgba(189,147,249,.16));pointer-events:none; }
#apertureV22TraceBlock .td613-temporal-event { position:relative;display:grid!important;grid-template-columns:minmax(0,1fr);gap:3px!important;min-width:0!important;padding:6px 7px 7px 17px;border:1px solid rgba(90,120,170,.11);border-radius:7px;background:linear-gradient(135deg,rgba(11,15,25,.82),rgba(6,9,17,.56)); }
#apertureV22TraceBlock .td613-temporal-event::before { content:attr(data-temporal-step);position:absolute;left:1px;top:9px;z-index:1;width:9px;height:9px;display:grid;place-items:center;border:1px solid rgba(139,233,253,.40);border-radius:50%;background:#080c14;color:rgba(139,233,253,.78);font-size:3.8px;line-height:1;box-shadow:0 0 8px rgba(139,233,253,.08); }
#apertureV22TraceBlock .td613-temporal-label { display:flex;justify-content:space-between;align-items:baseline;gap:8px;min-width:0;text-transform:none!important;letter-spacing:0!important; }
#apertureV22TraceBlock .td613-temporal-name { color:rgba(230,237,249,.94);font-size:7.4px;font-weight:700; }
#apertureV22TraceBlock .td613-temporal-variable { color:rgba(139,233,253,.58);font-size:5.7px;font-weight:650;white-space:nowrap; }
#apertureV22TraceBlock .td613-temporal-cue { color:rgba(173,188,214,.52);font-size:5.5px;line-height:1.25; }
#apertureV22TraceBlock input[type="datetime-local"] { box-sizing:border-box!important;inline-size:100%!important;width:100%!important;min-inline-size:0!important;min-width:0!important;max-inline-size:100%!important;max-width:100%!important;min-height:30px!important;padding:5px 8px!important;border-radius:6px!important;border-color:rgba(139,233,253,.19)!important;background:linear-gradient(180deg,rgba(12,16,28,.98),rgba(6,9,17,.98))!important;color-scheme:dark;box-shadow:inset 0 1px 0 rgba(255,255,255,.018); }
#apertureV22TraceBlock input[type="datetime-local"]:focus { border-color:rgba(139,233,253,.44)!important;box-shadow:0 0 0 1px rgba(139,233,253,.08),0 0 10px rgba(139,233,253,.05)!important; }
#apertureV22TraceBlock input[type="datetime-local"]::-webkit-calendar-picker-indicator { opacity:.74;cursor:pointer; }
#apertureV22TraceBlock .td613-temporal-pilot-card { margin-top:8px;padding:7px;border:1px solid rgba(189,147,249,.15);border-radius:7px;background:linear-gradient(135deg,rgba(189,147,249,.05),rgba(80,250,123,.018)); }
#apertureV22TraceBlock .td613-temporal-pilot-heading { color:rgba(226,215,250,.9);font-size:6.7px;font-weight:700; }
#apertureV22TraceBlock .td613-temporal-pilot-copy { margin-top:2px;color:rgba(176,188,210,.56);font-size:5.5px;line-height:1.3; }
#apertureV22TraceBlock .td613-temporal-pilot-row { display:grid;grid-template-columns:minmax(0,1fr) auto;gap:6px;align-items:end;min-width:0;margin-top:6px; }
#apertureV22TraceBlock .td613-temporal-pilot-row .input-shell { min-width:0!important; }
#apertureV22TraceBlock .td613-temporal-pilot-row #inputPilotDomain { width:100%!important;min-width:0!important;min-height:28px;border-radius:6px; }
#apertureV22TraceBlock .td613-temporal-pilot-row #btnPilotSchool { width:auto!important;min-height:28px;margin:0!important;padding-inline:9px!important;white-space:nowrap; }
#apertureV22TraceBlock .td613-pilot-status { margin-top:5px; }

#reciprocalReceiptBridgePanel[data-td613-pedagogue="true"] .rrb-head { align-items:flex-start; }
#reciprocalReceiptBridgePanel .td613-rrb-explainer { position:relative;z-index:2;margin-top:5px;color:rgba(184,202,214,.64);font-size:6.2px;line-height:1.4; }
#reciprocalReceiptBridgePanel .rrb-route.td613-rrb-conduit { position:relative;overflow:visible;isolation:isolate; }
#reciprocalReceiptBridgePanel .td613-rrb-rail { position:absolute;z-index:0;left:10%;top:50%;width:80%;height:1px;transform:translateY(-50%);background:rgba(115,223,255,.10);pointer-events:none; }
#reciprocalReceiptBridgePanel .td613-rrb-current { position:absolute;inset:0 auto 0 0;width:0;overflow:hidden;background:linear-gradient(90deg,rgba(115,223,255,.08),rgba(115,223,255,.75),rgba(189,147,249,.34),rgba(115,223,255,.08));background-size:220% 100%;animation:td613PedagogueReceiptCurrent 2.7s linear infinite;animation-play-state:paused;transition:width .32s ease; }
#reciprocalReceiptBridgePanel.td613-pedagogue-visible .td613-rrb-current { animation-play-state:running; }
#reciprocalReceiptBridgePanel .rrb-step { position:relative;z-index:1;cursor:help!important;border-color:rgba(255,255,255,.055)!important;background:rgba(4,8,13,.88)!important;box-shadow:none!important;transition:border-color .18s ease,color .18s ease,background .18s ease,box-shadow .18s ease;outline-offset:2px; }
#reciprocalReceiptBridgePanel .rrb-step[data-td613-reached="true"] { border-color:rgba(115,223,255,.28)!important;color:rgba(214,245,251,.88)!important;background:rgba(38,118,139,.07)!important; }
#reciprocalReceiptBridgePanel .rrb-step.human[data-td613-reached="true"] { border-color:rgba(255,198,95,.38)!important;color:#ffe2a5!important;background:rgba(255,198,95,.055)!important; }
#reciprocalReceiptBridgePanel .td613-rrb-status-dot { position:absolute;left:50%;bottom:-3px;width:4px;height:4px;transform:translateX(-50%);border-radius:50%;background:rgba(96,116,126,.52);box-shadow:0 0 0 transparent;pointer-events:none; }
#reciprocalReceiptBridgePanel .rrb-step[data-td613-reached="true"] .td613-rrb-status-dot { background:rgba(115,223,255,.92);box-shadow:0 0 7px rgba(115,223,255,.34);animation:td613PedagogueStagePulse 2.5s ease-in-out infinite;animation-play-state:paused; }
#reciprocalReceiptBridgePanel.td613-pedagogue-visible .rrb-step[data-td613-reached="true"] .td613-rrb-status-dot { animation-play-state:running; }
#reciprocalReceiptBridgePanel .rrb-step.human[data-td613-reached="true"] .td613-rrb-status-dot { background:rgba(255,198,95,.96);box-shadow:0 0 8px rgba(255,198,95,.30); }
#reciprocalReceiptBridgePanel .td613-rrb-help-badge { position:absolute;top:2px;right:2px;width:9px;height:9px;display:grid;place-items:center;border:1px solid rgba(153,231,255,.28);border-radius:50%;color:rgba(208,244,251,.8);background:rgba(5,10,16,.94);font-size:5px;line-height:1;opacity:0;transform:scale(.82);transition:opacity .14s ease,transform .14s ease;pointer-events:none; }
#reciprocalReceiptBridgePanel .rrb-step:hover .td613-rrb-help-badge,#reciprocalReceiptBridgePanel .rrb-step:focus-visible .td613-rrb-help-badge { opacity:1;transform:scale(1); }
#reciprocalReceiptBridgePanel .td613-rrb-tooltip { position:absolute;z-index:30;left:50%;bottom:calc(100% + 7px);width:min(155px,72vw);padding:6px 7px;transform:translate(-50%,3px);border:1px solid rgba(139,233,253,.18);border-radius:6px;color:rgba(225,238,247,.92);background:rgba(4,8,14,.98);box-shadow:0 8px 24px rgba(0,0,0,.38);font-size:6px;line-height:1.35;text-align:left;text-transform:none;letter-spacing:0;opacity:0;visibility:hidden;pointer-events:none;transition:opacity .14s ease,transform .14s ease,visibility .14s ease; }
#reciprocalReceiptBridgePanel .rrb-step[data-td613-stage-index="0"] .td613-rrb-tooltip { left:0;transform:translate(0,3px); }
#reciprocalReceiptBridgePanel .rrb-step[data-td613-stage-index="4"] .td613-rrb-tooltip { left:auto;right:0;transform:translate(0,3px); }
#reciprocalReceiptBridgePanel .rrb-step:hover .td613-rrb-tooltip,#reciprocalReceiptBridgePanel .rrb-step:focus-visible .td613-rrb-tooltip { opacity:1;visibility:visible;transform:translate(-50%,0); }
#reciprocalReceiptBridgePanel .rrb-step[data-td613-stage-index="0"]:hover .td613-rrb-tooltip,#reciprocalReceiptBridgePanel .rrb-step[data-td613-stage-index="0"]:focus-visible .td613-rrb-tooltip,#reciprocalReceiptBridgePanel .rrb-step[data-td613-stage-index="4"]:hover .td613-rrb-tooltip,#reciprocalReceiptBridgePanel .rrb-step[data-td613-stage-index="4"]:focus-visible .td613-rrb-tooltip { transform:translate(0,0); }
#reciprocalReceiptBridgePanel .td613-operator-actions-label { margin-top:9px;color:rgba(255,226,165,.72);font-size:6px;font-weight:750;letter-spacing:.11em;text-transform:uppercase; }
@keyframes td613PedagogueReceiptCurrent { from { background-position:100% 0; } to { background-position:-120% 0; } }
@keyframes td613PedagogueStagePulse { 0%,100% { transform:translateX(-50%) scale(.88);opacity:.62; } 50% { transform:translateX(-50%) scale(1.22);opacity:1; } }
@media (max-width:600px) { #reciprocalReceiptBridgePanel .td613-rrb-rail { display:none; } #reciprocalReceiptBridgePanel .td613-rrb-tooltip { width:min(145px,76vw); } }
@media (max-width:420px) { #apertureV22TraceBlock .td613-temporal-pilot-row { grid-template-columns:minmax(0,1fr); } #apertureV22TraceBlock .td613-temporal-pilot-row #btnPilotSchool { width:100%!important; } }
@media (prefers-reduced-motion: reduce) { #reciprocalReceiptBridgePanel .td613-rrb-current,#reciprocalReceiptBridgePanel .td613-rrb-status-dot { animation:none!important;transition-duration:.01ms!important; } }
`;

function ensureStyle(documentImpl) {
  if (documentImpl.getElementById('td613AperturePedagogueSurfaceStyle')) return;
  const style = documentImpl.createElement('style');
  style.id = 'td613AperturePedagogueSurfaceStyle';
  style.textContent = STYLE_TEXT;
  documentImpl.head.appendChild(style);
}

function routeButton(documentImpl, button, name, copy) {
  if (!button || button.dataset.td613PedagogueRoute === 'true') return;
  const nameSpan = documentImpl.createElement('span');
  nameSpan.className = 'td613-route-name';
  nameSpan.textContent = name;
  const copySpan = documentImpl.createElement('span');
  copySpan.className = 'td613-route-copy';
  copySpan.textContent = copy;
  button.replaceChildren(nameSpan, copySpan);
  button.dataset.td613PedagogueRoute = 'true';
}

function installCounterTool(documentImpl) {
  const panel = documentImpl.getElementById('humanRoutePanel');
  const switcher = documentImpl.getElementById('inputModeSwitch');
  if (!panel || !switcher) return false;
  if (panel.dataset.td613Pedagogue === 'true') return true;
  panel.dataset.td613Pedagogue = 'true';
  const title = panel.querySelector('.hook-title');
  if (title) title.textContent = 'Counter-Tool Field';
  const guide = documentImpl.createElement('div');
  guide.className = 'td613-counter-guide';
  guide.innerHTML = '<div class="td613-counter-guide-kicker">Choose what you want to inspect</div><div class="td613-counter-guide-copy">Start with consequence. Advanced provenance, occlusion, and reconstruction controls appear only when a supplied trace needs them.</div>';
  switcher.insertAdjacentElement('beforebegin', guide);
  switcher.classList.add('td613-route-chooser');
  const field = documentImpl.getElementById('modeInstrument');
  const trace = documentImpl.getElementById('modeHuman');
  const parallel = documentImpl.getElementById('modeCompare');
  routeButton(documentImpl, field, 'USE CURRENT FIELD', "Read Aperture's present instrument state.");
  routeButton(documentImpl, trace, 'ENTER A TRACE', 'Bring in an observed account or sequence for counter-reading.');
  routeButton(documentImpl, parallel, 'COMPARE TRACES', 'Compare observations without forcing them into equivalence.');
  const note = documentImpl.createElement('div');
  note.className = 'td613-current-field-note';
  note.textContent = 'Current Field uses the live instrument state. No supplied trace, recognition mark, or provenance form is required.';
  switcher.insertAdjacentElement('afterend', note);
  for (const child of [...panel.children]) if (child.classList?.contains('input-grid')) child.classList.add('td613-counter-supplied');
  const update = () => {
    const sourceType = documentImpl.getElementById('inputSourceType')?.value || '';
    const fieldActive = field?.classList.contains('active') === true;
    const parallelActive = parallel?.classList.contains('active') === true || sourceType === 'comparison';
    panel.dataset.td613Route = fieldActive ? 'field' : parallelActive ? 'parallel' : 'trace';
  };
  [field, trace, parallel].forEach(button => button?.addEventListener('click', () => globalThis.queueMicrotask(update), { passive:true }));
  documentImpl.getElementById('inputSourceType')?.addEventListener('change', update, { passive:true });
  update();
  return true;
}

function installTemporalLab(documentImpl) {
  const block = documentImpl.getElementById('apertureV22TraceBlock');
  if (!block) return false;
  if (block.dataset.td613TemporalLayout === 'chronology-v3') return true;
  const title = block.querySelector('.hook-title');
  if (title) title.textContent = 'Temporal Lab · Π / κ / C / H';
  if (!block.querySelector('.td613-temporal-intro')) {
    const intro = documentImpl.createElement('div');
    intro.className = 'td613-temporal-intro';
    intro.textContent = 'Mark when the event moved from sensing → modeling → action → registration → public visibility.';
    title?.insertAdjacentElement('afterend', intro);
  }
  const firstGrid = block.querySelector('#inputTSense')?.closest('.input-grid');
  if (firstGrid && !block.querySelector('.td613-temporal-chronology')) {
    const chronology = documentImpl.createElement('div');
    chronology.className = 'td613-temporal-chronology';
    chronology.setAttribute('role', 'group');
    chronology.setAttribute('aria-label', 'Temporal trace chronology');
    firstGrid.parentNode.insertBefore(chronology, firstGrid);
    TEMPORAL_STEPS.forEach((step, index) => {
      const input = block.querySelector(`#${step.id}`);
      const shell = input?.closest('.input-shell');
      if (!input || !shell) return;
      shell.classList.add('td613-temporal-event');
      shell.dataset.temporalStep = String(index + 1).padStart(2, '0');
      const label = shell.querySelector(`label[for="${step.id}"]`);
      if (label) {
        label.classList.add('td613-temporal-label');
        label.replaceChildren();
        const name = documentImpl.createElement('span'); name.className = 'td613-temporal-name'; name.textContent = step.name;
        const variable = documentImpl.createElement('span'); variable.className = 'td613-temporal-variable'; variable.textContent = step.variable;
        label.append(name, variable);
      }
      if (!shell.querySelector('.td613-temporal-cue')) {
        const cue = documentImpl.createElement('span'); cue.className = 'td613-temporal-cue'; cue.textContent = step.cue; input.insertAdjacentElement('beforebegin', cue);
      }
      chronology.appendChild(shell);
    });
  }
  const pilotSelect = block.querySelector('#inputPilotDomain');
  const pilotShell = pilotSelect?.closest('.input-shell');
  const pilotButton = block.querySelector('#btnPilotSchool');
  const pilotActions = pilotButton?.closest('.bridge-actions');
  if (pilotShell && pilotButton && pilotActions && !block.querySelector('.td613-temporal-pilot-card')) {
    const pilotLabel = pilotShell.querySelector('label[for="inputPilotDomain"]');
    if (pilotLabel) pilotLabel.textContent = 'Pilot preset';
    pilotButton.textContent = 'LOAD PILOT';
    pilotButton.setAttribute('aria-label', 'Load selected Temporal Lab pilot preset');
    const card = documentImpl.createElement('div'); card.className = 'td613-temporal-pilot-card';
    const heading = documentImpl.createElement('div'); heading.className = 'td613-temporal-pilot-heading'; heading.textContent = 'Optional guided starting point';
    const copy = documentImpl.createElement('div'); copy.className = 'td613-temporal-pilot-copy'; copy.textContent = 'Load a preset timeline, then inspect or change every field yourself. A preset is a teaching scaffold, not evidence.';
    const row = documentImpl.createElement('div'); row.className = 'td613-temporal-pilot-row'; row.append(pilotShell, pilotButton);
    const status = block.querySelector('#pilotPresetStatus'); if (status) status.classList.add('td613-pilot-status');
    card.append(heading, copy, row); if (status) card.append(status); pilotActions.replaceWith(card);
  }
  for (const grid of [...block.querySelectorAll('.input-grid')]) if (!grid.children.length) grid.remove();
  block.dataset.td613TemporalLayout = 'chronology-v3';
  return true;
}

function installReceiptBridge(documentImpl, root) {
  const panel = documentImpl.getElementById('reciprocalReceiptBridgePanel');
  const route = panel?.querySelector('.rrb-route');
  if (!panel || !route) return false;
  if (panel.dataset.td613Pedagogue === 'true') return true;
  panel.dataset.td613Pedagogue = 'true';
  const kicker = panel.querySelector('.rrb-kicker'); if (kicker) kicker.textContent = 'Receipt bridge status';
  const mini = panel.querySelector('.rrb-head .mini'); if (mini) mini.textContent = 'Receipts may travel · authority does not';
  const explainer = documentImpl.createElement('div'); explainer.className = 'td613-rrb-explainer'; explainer.textContent = 'Aperture can receive bounded context back for audit. Returned context cannot grant custody, authority, or automatic action.';
  panel.querySelector('.rrb-head')?.insertAdjacentElement('afterend', explainer);
  route.classList.add('td613-rrb-conduit');
  route.setAttribute('aria-label', 'Reciprocal receipt status route. Hover or focus a stage for an explanation. Stages are not controls.');
  const rail = documentImpl.createElement('div'); rail.className = 'td613-rrb-rail'; rail.setAttribute('aria-hidden', 'true');
  const current = documentImpl.createElement('div'); current.className = 'td613-rrb-current'; rail.append(current); route.prepend(rail);
  const nodes = RECEIPT_STAGES.map((stage, index) => {
    const node = documentImpl.getElementById(stage.id); if (!node) return null;
    node.tabIndex = 0; node.dataset.td613StageIndex = String(index);
    node.setAttribute('aria-label', `${node.textContent.replace(/\s+/g, ' ').trim()}. ${stage.help}`);
    const dot = documentImpl.createElement('span'); dot.className = 'td613-rrb-status-dot'; dot.setAttribute('aria-hidden', 'true');
    const badge = documentImpl.createElement('span'); badge.className = 'td613-rrb-help-badge'; badge.textContent = '?'; badge.setAttribute('aria-hidden', 'true');
    const tooltip = documentImpl.createElement('span'); tooltip.className = 'td613-rrb-tooltip'; tooltip.textContent = stage.help; tooltip.setAttribute('aria-hidden', 'true');
    node.append(dot, badge, tooltip); return node;
  }).filter(Boolean);
  const update = () => {
    let furthest = 0;
    nodes.forEach((node, index) => { const reached = node.classList.contains('active'); node.dataset.td613Reached = String(reached); if (reached) furthest = Math.max(furthest, index); });
    const denominator = Math.max(1, nodes.length - 1);
    current.style.width = `${(furthest / denominator) * 100}%`;
  };
  update();
  const observer = new root.MutationObserver(update);
  nodes.forEach(node => observer.observe(node, { attributes:true, attributeFilter:['class'] }));
  const membraneLabel = panel.querySelector('.rrb-membrane-copy span'); if (membraneLabel) membraneLabel.textContent = 'OPERATOR-DECLARED ROUTE POSTURE';
  const actions = panel.querySelector('.rrb-actions');
  if (actions && !panel.querySelector('.td613-operator-actions-label')) { const label = documentImpl.createElement('div'); label.className = 'td613-operator-actions-label'; label.textContent = 'Operator actions'; actions.insertAdjacentElement('beforebegin', label); }
  if ('IntersectionObserver' in root) {
    const visibility = new root.IntersectionObserver(entries => panel.classList.toggle('td613-pedagogue-visible', entries.some(entry => entry.isIntersecting)), { threshold:.02 });
    visibility.observe(panel);
  } else panel.classList.add('td613-pedagogue-visible');
  return true;
}

export function installAperturePedagogueSurface(documentImpl = globalThis.document, root = globalThis.window) {
  if (!documentImpl || !root) return Object.freeze({ schema:APERTURE_PEDAGOGUE_SURFACE_SCHEMA, status:'HELD_NO_DOCUMENT' });
  root.TD613_APERTURE_COUNTER_TOOL_ROUTE_GUIDE = APERTURE_COUNTER_TOOL_ROUTE_GUIDE;
  ensureStyle(documentImpl);
  const run = () => {
    let attempts = 0;
    const tick = () => {
      const counter = installCounterTool(documentImpl);
      const temporal = installTemporalLab(documentImpl);
      const bridge = installReceiptBridge(documentImpl, root);
      if (counter && temporal && bridge) {
        documentImpl.documentElement.dataset.td613PedagogueSurface = APERTURE_PEDAGOGUE_SURFACE_VERSION;
        root.TD613_APERTURE_PEDAGOGUE_SURFACE = Object.freeze({ schema:APERTURE_PEDAGOGUE_SURFACE_SCHEMA,version:APERTURE_PEDAGOGUE_SURFACE_VERSION,status:'INSTALLED',counter_tool:true,temporal_lab:true,receipt_bridge:true,scientific_semantics_mutated:false,authority_transfer:false,automatic_action:false,demo_contained_motion:true,human_closure_required:true });
        return;
      }
      attempts += 1;
      if (attempts < 180) root.requestAnimationFrame(tick);
    };
    tick();
  };
  if (documentImpl.readyState === 'loading') documentImpl.addEventListener('DOMContentLoaded', () => root.requestAnimationFrame(run), { once:true });
  else root.requestAnimationFrame(run);
  return Object.freeze({ schema:APERTURE_PEDAGOGUE_SURFACE_SCHEMA,version:APERTURE_PEDAGOGUE_SURFACE_VERSION,status:'SCHEDULED',authority_transfer:false,automatic_action:false });
}
