export const APERTURE_PEDAGOGUE_SURFACE_VERSION = 'v1.1.0';
export const APERTURE_PEDAGOGUE_SURFACE_SCHEMA = 'td613.aperture.pedagogue-surface/v1';

export const APERTURE_COUNTER_TOOL_ROUTE_GUIDE = Object.freeze({
  schema: 'td613.aperture.counter-tool-route-guide/v1',
  surface: 'Counter-Tool Field',
  canonical_public_route: 'https://td613.com/aperture/',
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
#humanRoutePanel[data-td613-pedagogue="true"] .td613-counter-guide { margin:5px 0 4px;padding:0;border:0;background:none; }
#humanRoutePanel .td613-counter-guide-kicker { color:rgba(139,233,253,.72);font-size:5.9px;font-weight:750;letter-spacing:.1em;text-transform:uppercase; }
#humanRoutePanel #inputModeSwitch.td613-route-chooser { display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:3px!important;margin:0!important; }
#humanRoutePanel #inputModeSwitch.td613-route-chooser button { display:grid!important;place-items:center;min-width:0!important;width:100%!important;min-height:25px!important;padding:4px 2px!important;border-radius:5px!important;font-size:0!important;line-height:1!important;text-align:center!important;white-space:nowrap!important; }
#humanRoutePanel #inputModeSwitch.td613-route-chooser button::before { content:attr(data-td613-route-short);color:rgba(215,226,241,.78);font-size:6.1px;font-weight:780;letter-spacing:.065em; }
#humanRoutePanel #inputModeSwitch.td613-route-chooser button.active::before { color:rgba(246,242,255,.98); }
#humanRoutePanel .td613-route-consequence { min-height:14px;margin-top:3px;padding:3px 5px;border-left:1px solid rgba(139,233,253,.32);color:rgba(190,207,227,.67);background:linear-gradient(90deg,rgba(139,233,253,.025),transparent);font-size:5.9px;line-height:1.35; }
#humanRoutePanel[data-td613-route="field"] .td613-counter-supplied,#humanRoutePanel[data-td613-route="field"] #apertureV22TraceBlock,#humanRoutePanel[data-td613-route="field"] .route-actions { display:none!important; }
#humanRoutePanel[data-td613-route="field"] > .route-status-block { display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:3px!important;margin-top:5px!important; }
#humanRoutePanel[data-td613-route="field"] > .route-status-block .route-status-line { display:grid!important;grid-template-columns:minmax(0,1fr)!important;gap:2px!important;min-width:0;padding:4px 5px!important;border:1px solid rgba(139,233,253,.055);border-radius:4px;background:rgba(7,12,19,.4); }
#humanRoutePanel[data-td613-route="field"] > .route-status-block .route-status-line:last-child { grid-column:1/-1; }
#humanRoutePanel[data-td613-route="field"] > .route-status-block .value { overflow-wrap:anywhere;text-align:left!important; }
#humanRoutePanel[data-td613-route="field"] #comparisonPreview { display:none!important; }

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

#reciprocalReceiptBridgePanel[data-td613-pedagogue="true"] { --td613-demo-left:10%;--td613-reached-progress:0%;padding:7px!important; }
#reciprocalReceiptBridgePanel[data-td613-pedagogue="true"] .rrb-head { align-items:center!important;gap:6px; }
#reciprocalReceiptBridgePanel[data-td613-pedagogue="true"] .rrb-state { padding:3px 6px!important;white-space:nowrap; }
#reciprocalReceiptBridgePanel .td613-rrb-explainer { position:relative;z-index:2;margin:3px 0 4px;color:rgba(187,204,218,.62);font-size:5.9px;line-height:1.35; }
#reciprocalReceiptBridgePanel .rrb-route.td613-rrb-conduit { position:relative;display:grid!important;grid-template-columns:repeat(5,minmax(0,1fr))!important;gap:3px!important;margin:3px 0!important;padding:9px 0 3px!important;overflow:visible;isolation:isolate; }
#reciprocalReceiptBridgePanel .td613-rrb-rail { position:absolute;z-index:0;left:10%;top:6px;width:80%;height:1px;background:rgba(115,223,255,.12);pointer-events:none; }
#reciprocalReceiptBridgePanel .td613-rrb-current { position:absolute;inset:0 auto 0 0;width:var(--td613-reached-progress);background:linear-gradient(90deg,rgba(115,223,255,.22),rgba(115,223,255,.72));transition:width .28s ease; }
#reciprocalReceiptBridgePanel .td613-rrb-receipt { position:absolute;z-index:4;left:var(--td613-demo-left);top:3px;width:6px;height:6px;transform:translateX(-50%);border:1px solid rgba(204,247,255,.85);border-radius:50%;background:#72e4ff;box-shadow:0 0 8px rgba(115,223,255,.42);transition:left .3s cubic-bezier(.2,.8,.2,1);pointer-events:none; }
#reciprocalReceiptBridgePanel[data-td613-playing="true"] .td613-rrb-receipt { animation:td613PedagogueReceiptCurrent .8s ease-in-out infinite; }
#reciprocalReceiptBridgePanel .rrb-step { position:relative;z-index:1;display:grid!important;place-items:center;min-width:0!important;min-height:28px!important;padding:4px 2px!important;cursor:help!important;border:0!important;border-block:1px solid rgba(255,255,255,.055)!important;border-radius:0!important;background:transparent!important;box-shadow:none!important;color:rgba(165,181,199,.58)!important;font-size:5.15px!important;line-height:1.18!important;text-align:center!important;transition:border-color .16s ease,color .16s ease,background .16s ease;outline-offset:2px; }
#reciprocalReceiptBridgePanel .rrb-step[data-td613-reached="true"] { border-color:rgba(115,223,255,.24)!important;color:rgba(214,245,251,.88)!important;background:linear-gradient(180deg,rgba(38,118,139,.05),transparent)!important; }
#reciprocalReceiptBridgePanel .rrb-step[data-td613-demo-current="true"] { border-color:rgba(138,229,250,.55)!important;background:linear-gradient(180deg,rgba(58,154,177,.1),rgba(58,154,177,.025))!important; }
#reciprocalReceiptBridgePanel .rrb-step.human { grid-column:auto!important; }
#reciprocalReceiptBridgePanel .rrb-step.human[data-td613-reached="true"] { border-color:rgba(255,198,95,.32)!important;color:#ffe2a5!important;background:linear-gradient(180deg,rgba(255,198,95,.04),transparent)!important; }
#reciprocalReceiptBridgePanel .td613-rrb-status-dot { position:absolute;left:50%;bottom:-2px;width:3px;height:3px;transform:translateX(-50%);border-radius:50%;background:rgba(96,116,126,.48);pointer-events:none; }
#reciprocalReceiptBridgePanel .rrb-step[data-td613-reached="true"] .td613-rrb-status-dot { background:rgba(115,223,255,.92);box-shadow:0 0 5px rgba(115,223,255,.3); }
#reciprocalReceiptBridgePanel .rrb-step.human[data-td613-reached="true"] .td613-rrb-status-dot { background:rgba(255,198,95,.96);box-shadow:0 0 6px rgba(255,198,95,.28); }
#reciprocalReceiptBridgePanel .td613-rrb-help-badge { display:none!important; }
#reciprocalReceiptBridgePanel .td613-rrb-tooltip { position:absolute;z-index:30;left:50%;bottom:calc(100% + 5px);width:min(164px,72vw);padding:6px 7px;transform:translate(-50%,2px);border:1px solid rgba(139,233,253,.2);border-radius:5px;color:rgba(232,241,248,.95);background:rgba(4,8,14,.985);box-shadow:0 8px 24px rgba(0,0,0,.42);font:500 7.2px/1.38 ui-sans-serif,system-ui,sans-serif;text-align:left;text-transform:none;letter-spacing:0;opacity:0;visibility:hidden;pointer-events:none;transition:opacity .12s ease,transform .12s ease,visibility .12s ease; }
#reciprocalReceiptBridgePanel .rrb-step[data-td613-stage-index="0"] .td613-rrb-tooltip { left:0;transform:translate(0,3px); }
#reciprocalReceiptBridgePanel .rrb-step[data-td613-stage-index="4"] .td613-rrb-tooltip { left:auto;right:0;transform:translate(0,3px); }
#reciprocalReceiptBridgePanel .rrb-step:hover .td613-rrb-tooltip,#reciprocalReceiptBridgePanel .rrb-step:focus .td613-rrb-tooltip,#reciprocalReceiptBridgePanel .rrb-step:focus-visible .td613-rrb-tooltip { opacity:1;visibility:visible;transform:translate(-50%,0); }
#reciprocalReceiptBridgePanel .rrb-step[data-td613-stage-index="0"]:hover .td613-rrb-tooltip,#reciprocalReceiptBridgePanel .rrb-step[data-td613-stage-index="0"]:focus .td613-rrb-tooltip,#reciprocalReceiptBridgePanel .rrb-step[data-td613-stage-index="0"]:focus-visible .td613-rrb-tooltip,#reciprocalReceiptBridgePanel .rrb-step[data-td613-stage-index="4"]:hover .td613-rrb-tooltip,#reciprocalReceiptBridgePanel .rrb-step[data-td613-stage-index="4"]:focus .td613-rrb-tooltip,#reciprocalReceiptBridgePanel .rrb-step[data-td613-stage-index="4"]:focus-visible .td613-rrb-tooltip { transform:translate(0,0); }
#reciprocalReceiptBridgePanel .td613-rrb-transport { display:flex;align-items:center;justify-content:space-between;gap:5px;margin:3px 0 5px;padding:3px 4px;border-block:1px solid rgba(115,223,255,.07);background:rgba(6,11,17,.42); }
#reciprocalReceiptBridgePanel .td613-rrb-playback { display:grid;grid-auto-flow:column;grid-auto-columns:20px;gap:2px; }
#reciprocalReceiptBridgePanel .td613-rrb-playback button { display:grid;place-items:center;width:20px!important;min-width:20px!important;height:19px!important;min-height:19px!important;padding:0!important;border:1px solid rgba(139,233,253,.12)!important;border-radius:4px!important;color:rgba(217,236,244,.78)!important;background:rgba(9,15,23,.88)!important;font:700 7px/1 ui-monospace,SFMono-Regular,Consolas,monospace!important;cursor:pointer; }
#reciprocalReceiptBridgePanel .td613-rrb-playback button:hover,#reciprocalReceiptBridgePanel .td613-rrb-playback button:focus-visible { border-color:rgba(139,233,253,.38)!important;color:#effcff!important;background:rgba(34,105,123,.13)!important; }
#reciprocalReceiptBridgePanel .td613-rrb-playback button:disabled { opacity:.28;cursor:default; }
#reciprocalReceiptBridgePanel .td613-rrb-playback-status { color:rgba(166,188,204,.6);font-size:5.6px;letter-spacing:.07em;text-align:right;text-transform:uppercase;white-space:nowrap; }
#reciprocalReceiptBridgePanel .rrb-membrane { margin-top:4px!important;padding:5px!important; }
#reciprocalReceiptBridgePanel .rrb-membrane-copy { display:flex!important;align-items:center!important;justify-content:space-between;gap:7px; }
#reciprocalReceiptBridgePanel .rrb-membrane-copy strong { max-width:58%;font-size:5.7px!important;text-align:right; }
#reciprocalReceiptBridgePanel .rrb-postures { display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:3px!important;margin-top:4px!important; }
#reciprocalReceiptBridgePanel .rrb-posture-btn { min-width:0!important;min-height:24px!important;padding:3px 2px!important;font-size:4.55px!important;line-height:1.16!important; }
#reciprocalReceiptBridgePanel .rrb-grid { display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:4px!important;margin-top:5px!important; }
#reciprocalReceiptBridgePanel .rrb-card { min-width:0!important;min-height:35px!important;padding:5px 6px!important;border-radius:5px!important; }
#reciprocalReceiptBridgePanel .rrb-card span { font-size:5px!important; }
#reciprocalReceiptBridgePanel .rrb-card strong { margin-top:3px!important;font-size:5.8px!important;line-height:1.25!important;overflow-wrap:anywhere; }
#reciprocalReceiptBridgePanel .td613-operator-actions-label { margin-top:6px;color:rgba(255,226,165,.7);font-size:5.6px;font-weight:750;letter-spacing:.1em;text-transform:uppercase; }
#reciprocalReceiptBridgePanel .rrb-actions { display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:3px!important;margin-top:3px!important; }
#reciprocalReceiptBridgePanel .rrb-actions .rrb-btn { min-width:0!important;min-height:25px!important;padding:4px 5px!important;font-size:5.15px!important;line-height:1.18!important;white-space:normal!important; }
#reciprocalReceiptBridgePanel .rrb-actions #rrbReset { grid-column:1/-1;width:auto!important;min-height:20px!important;justify-self:end;padding-inline:8px!important; }
#reciprocalReceiptBridgePanel .rrb-details { margin-top:5px!important; }
#reciprocalReceiptBridgePanel .rrb-preview { max-height:74px!important;margin-top:5px!important;padding:5px!important;overflow:auto!important;font-size:5.2px!important;line-height:1.28!important; }
#reciprocalReceiptBridgePanel .rrb-law { margin-top:5px!important;padding:5px 6px!important;font-size:5.45px!important;line-height:1.35!important; }
@keyframes td613PedagogueReceiptCurrent { 0%,100% { transform:translateX(-50%) scale(.82);opacity:.68; } 50% { transform:translateX(-50%) scale(1.18);opacity:1; } }
@media (max-width:600px) { #reciprocalReceiptBridgePanel .td613-rrb-tooltip { width:min(158px,76vw); } }
@media (max-width:420px) { #apertureV22TraceBlock .td613-temporal-pilot-row { grid-template-columns:minmax(0,1fr); } #apertureV22TraceBlock .td613-temporal-pilot-row #btnPilotSchool { width:100%!important; } }
@media (prefers-reduced-motion: reduce) { #reciprocalReceiptBridgePanel .td613-rrb-current,#reciprocalReceiptBridgePanel .td613-rrb-receipt,#reciprocalReceiptBridgePanel .td613-rrb-status-dot { animation:none!important;transition-duration:.01ms!important; } }
`;

function ensureStyle(documentImpl) {
  if (documentImpl.getElementById('td613AperturePedagogueSurfaceStyle')) return;
  const style = documentImpl.createElement('style');
  style.id = 'td613AperturePedagogueSurfaceStyle';
  style.textContent = STYLE_TEXT;
  documentImpl.head.appendChild(style);
}

function routeButton(button, name, shortName, consequence) {
  if (!button) return;
  button.dataset.td613RouteName = name;
  button.dataset.td613RouteShort = shortName;
  button.dataset.td613RouteConsequence = consequence;
  button.setAttribute('aria-label', `${name}. ${consequence}`);
  button.title = `${name} · ${consequence}`;
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
  guide.innerHTML = '<div class="td613-counter-guide-kicker">Choose what you want to inspect</div>';
  switcher.insertAdjacentElement('beforebegin', guide);
  switcher.classList.add('td613-route-chooser');
  const field = documentImpl.getElementById('modeInstrument');
  const trace = documentImpl.getElementById('modeHuman');
  const parallel = documentImpl.getElementById('modeCompare');
  routeButton(field, 'USE CURRENT FIELD', 'CURRENT', "Read Aperture's live instrument state.");
  routeButton(trace, 'ENTER A TRACE', 'TRACE', 'Bring in one observed account for counter-reading.');
  routeButton(parallel, 'COMPARE TRACES', 'COMPARE', 'Hold two observations apart without forcing equivalence.');
  const consequence = documentImpl.createElement('div');
  consequence.className = 'td613-route-consequence';
  consequence.setAttribute('aria-live', 'polite');
  switcher.insertAdjacentElement('afterend', consequence);
  for (const child of [...panel.children]) if (child.classList?.contains('input-grid')) child.classList.add('td613-counter-supplied');
  const update = () => {
    const sourceType = documentImpl.getElementById('inputSourceType')?.value || '';
    const fieldActive = field?.classList.contains('active') === true;
    const parallelActive = parallel?.classList.contains('active') === true || sourceType === 'comparison';
    panel.dataset.td613Route = fieldActive ? 'field' : parallelActive ? 'parallel' : 'trace';
    const active = fieldActive ? field : parallelActive ? parallel : trace;
    consequence.textContent = active?.dataset.td613RouteConsequence || '';
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
  const explainer = documentImpl.createElement('div'); explainer.className = 'td613-rrb-explainer'; explainer.textContent = 'Bounded context may return for audit. It cannot grant custody, authority, or action.';
  panel.querySelector('.rrb-head')?.insertAdjacentElement('afterend', explainer);
  route.classList.add('td613-rrb-conduit');
  route.setAttribute('aria-label', 'Reciprocal receipt status route. Hover or focus a stage for an explanation. Stages are not controls.');
  const rail = documentImpl.createElement('div'); rail.className = 'td613-rrb-rail'; rail.setAttribute('aria-hidden', 'true');
  const current = documentImpl.createElement('div'); current.className = 'td613-rrb-current'; rail.append(current); route.prepend(rail);
  const receipt = documentImpl.createElement('span'); receipt.className = 'td613-rrb-receipt'; receipt.setAttribute('aria-hidden', 'true'); route.append(receipt);
  const nodes = RECEIPT_STAGES.map((stage, index) => {
    const node = documentImpl.getElementById(stage.id); if (!node) return null;
    node.tabIndex = 0; node.dataset.td613StageIndex = String(index);
    node.setAttribute('aria-label', `${node.textContent.replace(/\s+/g, ' ').trim()}. ${stage.help}`);
    const dot = documentImpl.createElement('span'); dot.className = 'td613-rrb-status-dot'; dot.setAttribute('aria-hidden', 'true');
    const tooltip = documentImpl.createElement('span'); tooltip.className = 'td613-rrb-tooltip'; tooltip.textContent = stage.help; tooltip.setAttribute('aria-hidden', 'true');
    node.append(dot, tooltip); return node;
  }).filter(Boolean);
  const transport = documentImpl.createElement('div');
  transport.className = 'td613-rrb-transport';
  transport.setAttribute('aria-label', 'Educational receipt playback. These controls do not advance the bridge runtime.');
  const playback = documentImpl.createElement('div'); playback.className = 'td613-rrb-playback';
  const playbackStatus = documentImpl.createElement('span'); playbackStatus.className = 'td613-rrb-playback-status';
  const makeTransportButton = (label, glyph) => {
    const button = documentImpl.createElement('button');
    button.type = 'button';
    button.textContent = glyph;
    button.setAttribute('aria-label', label);
    button.title = label;
    playback.append(button);
    return button;
  };
  const firstButton = makeTransportButton('Show first genuinely reached receipt stage', '≪');
  const previousButton = makeTransportButton('Show previous genuinely reached receipt stage', '◀');
  const playButton = makeTransportButton('Play observed receipt stages', '▶');
  const nextButton = makeTransportButton('Show next genuinely reached receipt stage', '▶');
  const lastButton = makeTransportButton('Show furthest genuinely reached receipt stage', '≫');
  transport.append(playback, playbackStatus);
  route.insertAdjacentElement('afterend', transport);
  const reducedMotion = root.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches === true;
  let furthest = 0;
  let demoIndex = 0;
  let playbackTimer = null;
  const stopPlayback = () => {
    if (playbackTimer !== null) root.clearInterval(playbackTimer);
    playbackTimer = null;
    panel.dataset.td613Playing = 'false';
    playButton.textContent = '▶';
    playButton.setAttribute('aria-label', reducedMotion ? 'Playback is static because reduced motion is preferred' : 'Play observed receipt stages');
    playButton.title = playButton.getAttribute('aria-label');
  };
  const setDemoIndex = (nextIndex) => {
    demoIndex = Math.max(0, Math.min(furthest, Number(nextIndex) || 0));
    const denominator = Math.max(1, nodes.length - 1);
    const progress = demoIndex / denominator;
    panel.style.setProperty('--td613-demo-left', `${10 + (progress * 80)}%`);
    nodes.forEach((node, index) => { node.dataset.td613DemoCurrent = String(index === demoIndex); });
    playbackStatus.textContent = `observed ${demoIndex + 1}/${furthest + 1}`;
    firstButton.disabled = previousButton.disabled = demoIndex <= 0;
    nextButton.disabled = lastButton.disabled = demoIndex >= furthest;
    playButton.disabled = reducedMotion || furthest <= 0;
  };
  const update = () => {
    let nextFurthest = 0;
    nodes.forEach((node, index) => { const reached = node.classList.contains('active'); node.dataset.td613Reached = String(reached); if (reached) nextFurthest = Math.max(nextFurthest, index); });
    const denominator = Math.max(1, nodes.length - 1);
    furthest = nextFurthest;
    panel.style.setProperty('--td613-reached-progress', `${(furthest / denominator) * 100}%`);
    if (demoIndex > furthest) stopPlayback();
    setDemoIndex(Math.min(demoIndex, furthest));
  };
  update();
  // Observe with the document's own realm. The standalone artifact installs this
  // surface into its embedded instrument document from the outer shell; a parent-
  // realm observer cannot accept child-realm Nodes in every browser.
  const DocumentMutationObserver = documentImpl.defaultView?.MutationObserver || root.MutationObserver;
  const observer = new DocumentMutationObserver(update);
  nodes.forEach(node => observer.observe(node, { attributes:true, attributeFilter:['class'] }));
  firstButton.addEventListener('click', () => { stopPlayback(); setDemoIndex(0); });
  previousButton.addEventListener('click', () => { stopPlayback(); setDemoIndex(demoIndex - 1); });
  nextButton.addEventListener('click', () => { stopPlayback(); setDemoIndex(demoIndex + 1); });
  lastButton.addEventListener('click', () => { stopPlayback(); setDemoIndex(furthest); });
  playButton.addEventListener('click', () => {
    if (reducedMotion || furthest <= 0) return;
    if (playbackTimer !== null) { stopPlayback(); return; }
    if (demoIndex >= furthest) setDemoIndex(0);
    panel.dataset.td613Playing = 'true';
    playButton.textContent = 'Ⅱ';
    playButton.setAttribute('aria-label', 'Pause observed receipt playback');
    playButton.title = 'Pause observed receipt playback';
    playbackTimer = root.setInterval(() => {
      if (demoIndex >= furthest) { stopPlayback(); return; }
      const nextIndex = demoIndex + 1;
      setDemoIndex(nextIndex);
      if (nextIndex >= furthest) stopPlayback();
    }, 1050);
  });
  if (reducedMotion) {
    playButton.disabled = true;
    playButton.setAttribute('aria-label', 'Playback is static because reduced motion is preferred');
    playButton.title = 'Playback is static because reduced motion is preferred';
  }
  const membraneLabel = panel.querySelector('.rrb-membrane-copy span'); if (membraneLabel) membraneLabel.textContent = 'OPERATOR-DECLARED ROUTE POSTURE';
  const actions = panel.querySelector('.rrb-actions');
  if (actions && !panel.querySelector('.td613-operator-actions-label')) { const label = documentImpl.createElement('div'); label.className = 'td613-operator-actions-label'; label.textContent = 'Operator actions'; actions.insertAdjacentElement('beforebegin', label); }
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
