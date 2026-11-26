import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  BIAS_DRAFT_CONTRACT,
  encounterPhase,
  composeBiasDraft,
  renderBiasDraftSVG
} from '../app/encyclopedia/vixen-estate/vixen-bias-draft.mjs';

test('Bias Draft contract preserves non-owning clock, signed seam operator, carrier accounting, and formal epistemic ceiling', () => {
  assert.equal(BIAS_DRAFT_CONTRACT.clock_owner, 'NONE_RENDER_ON_CHANGE');
  assert.equal(BIAS_DRAFT_CONTRACT.computational_carriers_per_panel, 39);
  assert.equal(BIAS_DRAFT_CONTRACT.guaranteed_rendered_carriers_per_panel, 39);
  assert.equal(BIAS_DRAFT_CONTRACT.carrier_conservation_mode, 'EXACT_ROSTER_AND_RENDERED_PATHS_WITH_EXPLICIT_FALLBACK_ACCOUNTING');
  assert.equal(BIAS_DRAFT_CONTRACT.seam_operator, 'SIGNED_FIELD_DIFFERENCE_x0_PLUS_1.15a_(T_MINUS_Q)');
  assert.equal(BIAS_DRAFT_CONTRACT.epistemic, 'FORMAL_GEOMETRY_NOT_TEXTUAL_SEMANTICS');
  assert.equal(BIAS_DRAFT_CONTRACT.empirical_credit, 0);
});

test('Bias Draft renders all 39/39 carriers, separates public Podium labels from backstage tokens, and emits mode-specific accessible descriptions', () => {
  for (const [label, width, height, mode, podiumRole] of [
    ['desktop-1200', 1200, 430, 'salon', ''],
    ['compact-salon-1200', 1200, 210, 'salon', ''],
    ['threshold-1180', 1180, 210, 'threshold', ''],
    ['podium-maestro-1180', 1180, 192, 'podium', 'MAESTRO'],
    ['podium-composer-1180', 1180, 192, 'podium', 'COMPOSER'],
    ['mobile-390', 390, 156, 'salon', '']
  ]) {
    const fwd = composeBiasDraft({
      width, height, indexA: 2, indexB: 3,
      workIdA: 'emwork_085223e721130117f5510975',
      workIdB: 'emwork_0885af7e4851a2e81618b37a',
      lag: 36, mode, podiumRole
    });
    const rev = composeBiasDraft({
      width, height, indexA: 2, indexB: 3,
      workIdA: 'emwork_085223e721130117f5510975',
      workIdB: 'emwork_0885af7e4851a2e81618b37a',
      lag: 36, mode, podiumRole, reversed: true
    });
    assert.equal(fwd.rendered_carriers.left, 39, `${label} left rendered carriers`);
    assert.equal(fwd.rendered_carriers.right, 39, `${label} right rendered carriers`);
    assert.equal(
      fwd.carrier_conservation.field_deformed_paths_left + fwd.carrier_conservation.fallback_chord_count_left,
      39,
      `${label} left conservation accounting`
    );
    assert.equal(
      fwd.carrier_conservation.field_deformed_paths_right + fwd.carrier_conservation.fallback_chord_count_right,
      39,
      `${label} right conservation accounting`
    );
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
      assert.ok(svg.includes('SEPARATE ARCHIVE') && svg.includes('THIS COLLECTION') && svg.includes('SOURCE WORK'), 'Threshold mode must show natural visitor-facing role lockstitches');
      assert.doesNotMatch(svg, /\b(?:OPERAHOUSE|PERFORMER|model_connected|empirical_credit)\b/, 'Threshold public SVG must not leak backstage custody or machine-state tokens');
      assert.ok(!svg.includes('>G8<'), 'Threshold mode must omit scholarly manuscript gate G8');
      assert.match(svg, /Dual-door threshold seam/i);
    } else if (mode === 'podium') {
      assert.doesNotMatch(svg, /\b(?:OPERAHOUSE|PERFORMER|model_connected|empirical_credit)\b/, 'Podium public SVG must not leak backstage custody or machine-state tokens');
      assert.match(svg, /Human Podium role-conditioned seam/i);
      assert.doesNotMatch(svg, /Eight unadjudicated human/i, 'Podium mode must not claim eight scholarly gate stitches');
    } else if (mode === 'salon') {
      assert.ok(svg.includes('>G1<') && svg.includes('>G8<'), 'Salon mode must baste all 8 human gates');
      assert.match(svg, /Eight unadjudicated human identity brackets/i);
    }
  }
});

test('Directional geometry qualification across all 496 distinct pairs of 32 recorded Works and identical-input degeneracy', () => {
  const html = readFileSync(new URL('../app/encyclopedia/vix-cyb.html', import.meta.url), 'utf8');
  const corpus = JSON.parse(html.match(/<script[^>]*id="vixen-corpus-bundle"[^>]*>([\s\S]*?)<\/script>/)[1]);
  assert.equal(corpus.works.length, 32);

  // Identical-input degeneracy: (A, A) must yield 0 directional seam displacement
  const w0 = corpus.works[0];
  const selfA = composeBiasDraft({ width: 1200, height: 420, indexA: 0, indexB: 0, workIdA: w0.work_id, workIdB: w0.work_id, lag: 36, reversed: false });
  const selfB = composeBiasDraft({ width: 1200, height: 420, indexA: 0, indexB: 0, workIdA: w0.work_id, workIdB: w0.work_id, lag: 36, reversed: true });
  let selfDiff = 0;
  for (let i = 0; i <= selfA.seam.n; i++) selfDiff = Math.max(selfDiff, Math.abs(selfA.seam.xs[i] - selfB.seam.xs[i]));
  assert.equal(selfDiff, 0, 'Identical-input self-encounter must have zero directional seam displacement');
  assert.equal(encounterPhase(0, 0, { workIdA: w0.work_id, workIdB: w0.work_id }), encounterPhase(0, 0, { workIdA: w0.work_id, workIdB: w0.work_id }));

  // Exhaustive 496 distinct unordered pairs (i < j)
  let totalPairs = 0;
  let phaseDistinctPairs = 0;
  let seamDisplacedPairs = 0;
  let minMaxDisplacement = Infinity;
  for (let i = 0; i < corpus.works.length; i++) {
    for (let j = i + 1; j < corpus.works.length; j++) {
      totalPairs += 1;
      const a = corpus.works[i];
      const b = corpus.works[j];
      const pAB = encounterPhase(i, j, { workIdA: a.work_id, workIdB: b.work_id });
      const pBA = encounterPhase(j, i, { workIdA: b.work_id, workIdB: a.work_id });
      if (Math.abs(pAB - pBA) > 1e-6) phaseDistinctPairs += 1;
      const dAB = composeBiasDraft({ width: 1200, height: 420, indexA: i, indexB: j, workIdA: a.work_id, workIdB: b.work_id, lag: 36, reversed: false });
      const dBA = composeBiasDraft({ width: 1200, height: 420, indexA: i, indexB: j, workIdA: a.work_id, workIdB: b.work_id, lag: 36, reversed: true });
      let maxD = 0;
      for (let k = 0; k <= dAB.seam.n; k++) maxD = Math.max(maxD, Math.abs(dAB.seam.xs[k] - dBA.seam.xs[k]));
      if (maxD > 0.5) seamDisplacedPairs += 1;
      if (maxD < minMaxDisplacement) minMaxDisplacement = maxD;
    }
  }
  assert.equal(totalPairs, 496);
  assert.equal(phaseDistinctPairs, 496, `Expected 496/496 phase-distinct pairs, got ${phaseDistinctPairs}`);
  assert.equal(seamDisplacedPairs, 496, `Expected 496/496 seam-displaced pairs, got ${seamDisplacedPairs} (minMaxDisplacement=${minMaxDisplacement})`);
});

test('RP-F07: recutting keeps entrance/role identities fixed; reversed Salon hit targets follow displayed Works', () => {
  for (const width of [390, 1180]) {
    for (const mode of ['threshold', 'podium', 'salon']) {
      const input = { mode, width, height: 210, indexA: 6, indexB: 13,
        labelA: 'HUMAN EXPEDITION', labelB: 'AI / LLM BRIEF',
        fileA: 'Guided workspace', fileB: 'Plain-text guide',
        workIdA: 'test_a', workIdB: 'test_b', podiumRole: 'COMPOSER' };
      const a = composeBiasDraft(input);
      const b = composeBiasDraft({ ...input, reversed: true });
      assert.ok(a.seam.xs.some((x, i) => Math.abs(x - b.seam.xs[i]) > 0.5), 'Reversal still changes the optical seam');
      const svg = renderBiasDraftSVG(b);
      if (mode === 'salon') {
        assert.equal(b.labels.A, input.labelB);
        assert.equal(b.labels.B, input.labelA);
        assert.deepEqual([...svg.matchAll(/data-bc-panel="(I{1,2})"/g)].map(m => m[1]), ['II', 'I']);
      } else {
        assert.equal(b.labels.A, input.labelA);
        assert.equal(b.labels.B, input.labelB);
        assert.equal(b.labels.fA, input.fileA);
        assert.equal(b.labels.fB, input.fileB);
        if (mode === 'threshold') {
          assert.deepEqual([...svg.matchAll(/data-bc-door="(human|ai)"/g)].map(m => m[1]), ['human', 'ai']);
          assert.match(svg, /Left bias panel \(HUMAN EXPEDITION\) and right counter-bias panel \(AI \/ LLM BRIEF\)/);
        }
      }
    }
  }
});
