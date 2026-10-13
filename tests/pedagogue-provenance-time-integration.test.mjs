import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { compilePedagogueDesignReview } from '../app/engine/pedagogue-design-gate.js';

async function fixture(name) {
  return JSON.parse(await readFile(new URL(`./fixtures/pedagogue/${name}`, import.meta.url), 'utf8'));
}

test('Design Gate may carry lineage, Institutional Time, cadence, and provenance second-pass diagnostics without widening authority', async () => {
  const input = await fixture('cistern-boundary-design.json');
  input.lineage_review = {
    review_id: 'cistern-provenance-review',
    selected_lenses: [
      'PREPARED_ENVIRONMENT',
      'RHYTHM_AND_CADENCE',
      'INTERPRETIVE_LABOR',
      'LEGIBILITY_WITHOUT_EXPERT_MONOPOLY'
    ],
    findings: [
      {
        lens_id: 'PREPARED_ENVIRONMENT',
        posture: 'DERIVATIONAL_CLAIM',
        note: 'The proposed route places a legible action in the environment rather than adding another explanatory command.'
      },
      {
        lens_id: 'RHYTHM_AND_CADENCE',
        posture: 'NORMATIVE_ASSUMPTION',
        note: 'The fixture declares that world consequence must remain available before technical naming.'
      },
      {
        lens_id: 'INTERPRETIVE_LABOR',
        posture: 'CONVERGENCE',
        note: 'The proposed route reduces explanatory work without granting automatic redesign authority.'
      },
      {
        lens_id: 'LEGIBILITY_WITHOUT_EXPERT_MONOPOLY',
        posture: 'CONVERGENCE',
        note: 'The participant can inspect the governed route without receiving station authority.'
      }
    ]
  };
  input.institutional_time_case = {
    case_id: 'cistern-temporal-synthetic',
    clocks: { t_sense: 0, t_model: 1, t_op: 3, t_inst: 5, t_pub: 6, t_context: 5 },
    closure: { closure_class: 'drift', score: 0.75 },
    compression: {
      source_distinctions: ['condition', 'route burden', 'operator action', 'registered state'],
      registered_distinctions: ['registered state'],
      explicitly_lost_distinctions: ['condition', 'route burden', 'operator action']
    }
  };
  input.cadence_case = {
    audit_id: 'cistern-cadence-synthetic',
    events: [
      { phase: 'NOTICE', at: 0 },
      { phase: 'ACT', at: 1 },
      { phase: 'WORLD_ANSWERS', at: 3 },
      { phase: 'NAME', at: 6 },
      { phase: 'REST', at: 7 },
      { phase: 'EXIT', at: 8 }
    ],
    cadence_constraints: { minimum_world_answer_dwell: 2, rest_required: true, exit_required: true }
  };

  const review = await compilePedagogueDesignReview(input);

  assert.ok(review.lineage_review);
  assert.ok(review.institutional_time_audit);
  assert.ok(review.cadence_audit);
  assert.ok(review.lineage_second_pass);
  assert.equal(review.lineage_review.selected_lenses.length, 4);
  assert.equal(review.lineage_review.convergence_creates_authority, false);
  assert.equal(review.institutional_time_audit.preemption.preemption_gap, 2);
  assert.equal(review.institutional_time_audit.classification, 'INSTITUTIONAL_PREEMPTION_PRESENT');
  assert.equal(review.cadence_audit.classification, 'NO_DECLARED_SEQUENCE_OR_CADENCE_DEFICIT');

  const secondPassIds = new Set(review.lineage_second_pass.activated_lenses.map((lens) => lens.lens_id));
  for (const lensId of [
    'INSTITUTIONAL_TIME',
    'TEMPORAL_SOVEREIGNTY',
    'INTERPRETIVE_LABOR',
    'EPISTEMIC_REFRACTION',
    'EXPERIENCE_CONTINUITY',
    'DROMOLOGICAL_COMPRESSION',
    'THIRD_TEACHER_DOCUMENTATION'
  ]) assert.ok(secondPassIds.has(lensId), `${lensId} should be activated by the compiled receipt.`);
  assert.equal(review.lineage_second_pass.human_profile_inference, false);
  assert.equal(review.lineage_second_pass.activation_count_is_not_score, true);

  assert.equal(review.design_gate.lineage_review_non_authoritative, true);
  assert.equal(review.design_gate.institutional_time_audit_non_authoritative, true);
  assert.equal(review.design_gate.cadence_audit_non_authoritative, true);
  assert.equal(review.design_gate.lineage_second_pass_non_authoritative, true);
  assert.equal(review.design_gate.automatic_redesign_forbidden, true);
  assert.equal(review.design_gate.human_closure_required, true);
  assert.equal(review.scene.authority.station_mutation_authorized, false);
});

test('Old design fixtures remain compatible and receive an inert second pass when no provenance or temporal case is supplied', async () => {
  const input = await fixture('cistern-boundary-design.json');
  const review = await compilePedagogueDesignReview(input);
  assert.equal(review.lineage_review, null);
  assert.equal(review.institutional_time_audit, null);
  assert.equal(review.cadence_audit, null);
  assert.ok(review.lineage_second_pass);
  assert.equal(review.lineage_second_pass.activation_count, 0);
  assert.deepEqual(review.lineage_second_pass.activated_lenses, []);
  assert.equal(review.design_gate.lineage_review_non_authoritative, true);
  assert.equal(review.design_gate.institutional_time_audit_non_authoritative, true);
  assert.equal(review.design_gate.cadence_audit_non_authoritative, true);
  assert.equal(review.design_gate.lineage_second_pass_non_authoritative, true);
});
