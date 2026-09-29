import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { JSDOM } from 'jsdom';
import { compilePedagogueDesignReview } from '../app/engine/pedagogue-design-gate.js';
import {
  MARROWLINE_GATE_ASSAY_CLAIM_CEILING,
  MARROWLINE_GATE_MODES,
  buildMarrowlineGateAssayReceipt,
  classifyMarrowlineGateReceipt
} from '../app/dome-world/marrowline-gate-assay.js';
import { installMarrowlineGatePedagogue } from '../app/dome-world/marrowline-gate-pedagogue.js';

const fixtureUrl = new URL('./fixtures/pedagogue/marrowline-fire-gate-design.json', import.meta.url);
const pedagogueCssUrl = new URL('../app/dome-world/marrowline-gate-pedagogue.css', import.meta.url);
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

test('Pedagogue design gate admits the consequence-first Fire Gate route without widening authority', async () => {
  const fixture = JSON.parse(await readFile(fixtureUrl, 'utf8'));
  const review = await compilePedagogueDesignReview(fixture);
  assert.equal(review.surface_reference, 'Dome-World/Marrowline/Fire-Gate');
  assert.deepEqual(review.phases, ['NOTICE', 'ACT', 'WORLD_ANSWERS', 'NAME', 'REST']);
  assert.equal(review.design_gate.consequence_before_ontology, true);
  assert.equal(review.design_gate.rest_and_exit_preserved, true);
  assert.equal(review.design_gate.aia_invariants_preserved, true);
  assert.equal(review.design_gate.aia_surface_bound, true);
  assert.equal(review.design_gate.route_history_explicit, true);
  assert.equal(review.design_gate.route_burden_non_worsening, true);
  assert.equal(review.design_gate.user_level_score_forbidden, true);
  assert.equal(review.design_gate.automatic_redesign_forbidden, true);
  assert.equal(review.design_gate.human_closure_required, true);
  assert.equal(review.aia_surface_family_report.authority_transferred, false);
});

test('Fire Gate receipt classifier preserves all four observed outcomes plus unobserved', () => {
  const local = classifyMarrowlineGateReceipt({ status: 'LOCAL_FALLBACK', networkResponseObserved: false });
  assert.equal(local.mode, MARROWLINE_GATE_MODES.LOCAL_CONTROL);
  assert.equal(local.networkObserved, false);

  const publicFire = classifyMarrowlineGateReceipt({
    status: 'LIVE_ABSORBING',
    sourceStatus: 'SERVER_RESPONSE_OBSERVED',
    networkResponseObserved: true,
    http: { routeHeader: 'live-marrowline-ingress' },
    canonicalPayload: { aperture_egress: { status: 'exact' } }
  });
  assert.equal(publicFire.mode, MARROWLINE_GATE_MODES.PUBLIC_ABSORPTION);
  assert.equal(publicFire.networkObserved, true);
  assert.equal(publicFire.apertureEgress, 'exact');

  const admitted = classifyMarrowlineGateReceipt({
    status: 'OPERATOR_AUTHORIZED',
    sourceStatus: 'SERVER_RESPONSE_OBSERVED',
    operator: { requested: true, authorized: true, tokenPersisted: false },
    http: { routeHeader: 'operator-bypass' }
  });
  assert.equal(admitted.mode, MARROWLINE_GATE_MODES.OPERATOR_BYPASS_CONTROL);
  assert.equal(admitted.routeHeader, 'operator-bypass');

  const rejected = classifyMarrowlineGateReceipt({
    status: 'OPERATOR_TOKEN_REJECTED',
    sourceStatus: 'SERVER_RESPONSE_OBSERVED',
    operator: { requested: true, authorized: false, tokenPersisted: false },
    http: { routeHeader: 'live-marrowline-ingress' }
  });
  assert.equal(rejected.mode, MARROWLINE_GATE_MODES.OPERATOR_REJECTED_PUBLIC_ABSORPTION);
  assert.match(rejected.plainLanguage, /did not admit the operator bypass/i);

  const unobserved = classifyMarrowlineGateReceipt({});
  assert.equal(unobserved.mode, MARROWLINE_GATE_MODES.UNOBSERVED);
  assert.equal(unobserved.claimCeiling, MARROWLINE_GATE_ASSAY_CLAIM_CEILING);
});

test('adversarial receipt keeps the comparison and falsifiers explicit', () => {
  const assay = buildMarrowlineGateAssayReceipt({ status: 'LOCAL_FALLBACK', networkResponseObserved: false });
  assert.equal(assay.adversarialUse.publicTreatment, 'live-http-200-marrowline-absorption');
  assert.equal(assay.adversarialUse.operatorControl, 'same-endpoint-server-token-bypass-when-admitted');
  assert.ok(assay.falsifiers.includes('operator-token-persists-in-receipt'));
  assert.match(assay.claimCeiling, /human-operated-adversarial-boundary-assay/);
});

test('Pedagogue Gate is a single-column condition → action → outcome sequence', async () => {
  const css = await readFile(pedagogueCssUrl, 'utf8');
  assert.match(css, /Gate single-sequence UX v3/);
  assert.match(css, /\.gate-mode-choices\{[\s\S]*grid-template-columns:1fr/);
  assert.match(css, /#gatePanel \.panel-body\.gate-grid\{[\s\S]*grid-template-columns:minmax\(0,1fr\)!important/);
  assert.match(css, /#gatePanel #marrowlineForm \.marrowline-operator-field\[hidden\][\s\S]*display:none!important/);
  assert.match(css, /#gatePanel \.gate-technical-evidence/);
  assert.match(css, /\.gate-technical-evidence-glyph\{[\s\S]*color:#72f2ef[\s\S]*font:400 1rem\/1/);
  assert.match(css, /\.gate-technical-evidence\[open\] \.gate-technical-evidence-glyph\{[\s\S]*rotate\(180deg\)/);
  assert.match(css, /body\[data-mobile-view="gate"\] #gatePanel \.ritual-actions\{[\s\S]*grid-template-columns:minmax\(0,1fr\) auto!important/);
});

test('human-facing Gate guide selects one condition at a time and keeps technical evidence optional', async () => {
  const dom = new JSDOM(`<!doctype html><html><head></head><body>
    <details id="gatePanel"><div class="panel-body gate-grid"><section class="gate-controls">
      <p class="panel-note">existing note</p>
      <form id="marrowlineForm">
        <label class="field-label" for="marrowlineSeed">Seed<input id="marrowlineSeed"></label>
        <label class="field-label marrowline-operator-field" for="marrowlineOperatorToken">Token<input id="marrowlineOperatorToken"></label>
        <div class="row"><select id="marrowlineDepth"><option>4</option></select><select id="marrowlineBreadth"><option>6</option></select></div>
        <div class="ritual-actions"><button type="submit">Fire live Marrowline</button><button id="buildLocalMarrowline" type="button">Build local fallback</button><button id="copyMarrowlineReceipt" type="button">Copy gate receipt</button></div>
      </form>
      <div id="marrowlineStatus"></div>
    </section><section class="gate-output"><canvas id="marrowlineCanvas"></canvas><div id="marrowlineRail"></div><pre id="marrowlineReceipt"></pre></section></div></details>
  </body></html>`, { url: 'https://td613.com/dome-world/marrowline.html' });
  const { window } = dom;
  const before = Object.getOwnPropertyDescriptor(globalThis, 'CustomEvent');
  Object.defineProperty(globalThis, 'CustomEvent', { configurable: true, writable: true, value: window.CustomEvent });
  try {
    const installed = installMarrowlineGatePedagogue(window.document, window);
    assert.equal(installed.consequenceBeforeOntology, true);
    assert.equal(installed.sameEndpointNotSameRoute, true);
    assert.equal(installed.singleColumnSequence, true);
    assert.equal(installed.technicalEvidenceCollapsedByDefault, true);
    const guide = window.document.getElementById('marrowlineGatePedagogue');
    assert.match(guide.textContent, /Choose the Gate condition/);
    assert.equal(guide.querySelectorAll('.gate-mode-choice').length, 3);

    const submit = window.document.querySelector('#marrowlineForm button[type="submit"]');
    const local = window.document.getElementById('buildLocalMarrowline');
    const tokenField = window.document.getElementById('marrowlineOperatorToken').closest('label');
    const seedField = window.document.getElementById('marrowlineSeed').closest('label');
    assert.equal(window.document.getElementById('gatePanel').dataset.selectedGateMode, MARROWLINE_GATE_MODES.PUBLIC_ABSORPTION);
    assert.equal(submit.textContent, 'Fire public boundary');
    assert.equal(submit.hidden, false);
    assert.equal(local.hidden, true);
    assert.equal(tokenField.hidden, true);
    assert.equal(seedField.hidden, true);

    guide.querySelector(`[data-gate-mode="${MARROWLINE_GATE_MODES.LOCAL_CONTROL}"]`).click();
    assert.equal(local.hidden, false);
    assert.equal(submit.hidden, true);
    assert.equal(seedField.hidden, false);

    guide.querySelector(`[data-gate-mode="${MARROWLINE_GATE_MODES.OPERATOR_BYPASS_CONTROL}"]`).click();
    assert.equal(submit.hidden, false);
    assert.equal(submit.textContent, 'Fire operator control');
    assert.equal(tokenField.hidden, false);
    assert.equal(seedField.hidden, true);

    const technical = window.document.querySelector('.gate-technical-evidence');
    assert.ok(technical);
    assert.equal(technical.open, false);
    const technicalGlyph = technical.querySelector('.gate-technical-evidence-glyph');
    assert.equal(technicalGlyph?.textContent, '▽');
    assert.equal(technicalGlyph?.getAttribute('aria-hidden'), 'true');
    assert.ok(technical.querySelector('.gate-output'));
    assert.ok(technical.querySelector('#marrowlineReceipt'));

    const receiptNode = window.document.getElementById('marrowlineReceipt');
    const publicReceipt = {
      status: 'LIVE_ABSORBING',
      sourceStatus: 'SERVER_RESPONSE_OBSERVED',
      networkResponseObserved: true,
      http: { routeHeader: 'live-marrowline-ingress' },
      canonicalPayload: { aperture_egress: { status: 'exact' } }
    };
    receiptNode.textContent = JSON.stringify(publicReceipt);
    await flush();
    const result = window.document.getElementById('marrowlineGatePlainResult');
    assert.equal(result.dataset.mode, MARROWLINE_GATE_MODES.PUBLIC_ABSORPTION);
    assert.match(result.textContent, /Public fire observed/);
    assert.deepEqual(JSON.parse(receiptNode.textContent), publicReceipt, 'Pedagogue rendering must not rewrite the technical receipt');
  } finally {
    dom.window.close();
    if (before) Object.defineProperty(globalThis, 'CustomEvent', before);
    else delete globalThis.CustomEvent;
  }
});
