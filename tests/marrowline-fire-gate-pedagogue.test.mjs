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

test('human-facing Gate guide translates changing receipts while leaving technical receipt intact', async () => {
  const dom = new JSDOM(`<!doctype html><html><head></head><body>
    <details id="gatePanel"><div class="gate-controls">
      <p class="panel-note">existing note</p>
      <form id="marrowlineForm"></form>
    </div></details>
    <pre id="marrowlineReceipt"></pre>
  </body></html>`, { url: 'https://td613.com/dome-world/marrowline.html' });
  const { window } = dom;
  const before = Object.getOwnPropertyDescriptor(globalThis, 'CustomEvent');
  Object.defineProperty(globalThis, 'CustomEvent', { configurable: true, writable: true, value: window.CustomEvent });
  try {
    const installed = installMarrowlineGatePedagogue(window.document, window);
    assert.equal(installed.consequenceBeforeOntology, true);
    assert.equal(installed.sameEndpointNotSameRoute, true);
    assert.ok(window.document.getElementById('marrowlineGatePedagogue'));
    assert.match(window.document.getElementById('marrowlineGatePedagogue').textContent, /Three ways to challenge one Gate/);

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
