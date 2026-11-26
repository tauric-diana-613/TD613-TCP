import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  BIAS_DRAFT_CONTRACT,
  encounterPhase,
  composeBiasDraft,
  renderBiasDraftSVG
} from '../app/encyclopedia/vixen-estate/vixen-bias-draft.mjs';

test('Bias Draft contract preserves non-owning clock, signed seam operator, and formal epistemic ceiling', () => {
  assert.equal(BIAS_DRAFT_CONTRACT.clock_owner, 'NONE_RENDER_ON_CHANGE');
  assert.equal(BIAS_DRAFT_CONTRACT.computational_carriers_per_panel, 39);
  assert.equal(BIAS_DRAFT_CONTRACT.guaranteed_rendered_carriers_per_panel, 39);
  assert.equal(BIAS_DRAFT_CONTRACT.seam_operator, 'SIGNED_FIELD_DIFFERENCE_x0_PLUS_1.15a_(T_MINUS_Q)');
  assert.equal(BIAS_DRAFT_CONTRACT.empirical_credit, 0);
});

test('Bias Draft renders all 39/39 carriers and order-dependent seam displacement across desktop, threshold, and mobile', () => {
  for (const [label, width, height, mode] of [
    ['desktop-1200', 1200, 430, 'salon'],
    ['compact-salon-1200', 1200, 210, 'salon'],
    ['threshold-1180', 1180, 210, 'threshold'],
    ['podium-1180', 1180, 192, 'podium'],
    ['mobile-390', 390, 156, 'salon']
  ]) {
    const fwd = composeBiasDraft({
      width, height, indexA: 2, indexB: 3,
      workIdA: 'emwork_085223e721130117f5510975',
      workIdB: 'emwork_0885af7e4851a2e81618b37a',
      lag: 36, mode
    });
    const rev = composeBiasDraft({
      width, height, indexA: 2, indexB: 3,
      workIdA: 'emwork_085223e721130117f5510975',
      workIdB: 'emwork_0885af7e4851a2e81618b37a',
      lag: 36, mode, reversed: true
    });
    assert.equal(fwd.rendered_carriers.left, 39, `${label} left rendered carriers`);
    assert.equal(fwd.rendered_carriers.right, 39, `${label} right rendered carriers`);
    assert.equal(fwd.optics.nyquistGuarded, true, `${label} Nyquist guard`);

    let maxDisplacement = 0;
    for (let i = 0; i <= fwd.seam.n; i++) {
      maxDisplacement = Math.max(maxDisplacement, Math.abs(fwd.seam.xs[i] - rev.seam.xs[i]));
    }
    assert.ok(maxDisplacement > 10, `${label} reversing encounter order must displace seam (got ${maxDisplacement})`);

    const svg = renderBiasDraftSVG(fwd, { title: `Witness ${label}` });
    assert.ok(svg.includes('<clipPath'), `${label} must clip bias panels`);
    assert.ok(/SYNTHETIC/i.test(svg), `${label} must label synthetic optical conditioning honestly`);
    if (mode === 'threshold') {
      assert.ok(svg.includes('OPERAHOUSE') && svg.includes('PERFORMER'), 'Threshold mode must show custody lockstitches');
      assert.ok(!svg.includes('>G8<'), 'Threshold mode must omit scholarly manuscript gate G8');
    } else if (mode === 'salon') {
      assert.ok(svg.includes('>G1<') && svg.includes('>G8<'), 'Salon mode must baste all 8 human gates');
    }
  }
  assert.notEqual(encounterPhase(2, 3), encounterPhase(3, 2));
});
