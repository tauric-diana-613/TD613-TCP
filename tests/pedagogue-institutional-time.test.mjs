import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PEDAGOGUE_INSTITUTIONAL_TIME_AUDIT_SCHEMA,
  PEDAGOGUE_DROMOLOGICAL_SEQUENCE_AUDIT_SCHEMA,
  compileInstitutionalTimeAudit,
  compileDromologicalSequenceAudit
} from '../app/engine/flowcore-pedagogue-core.js';

test('Institutional Time audit reproduces the preemption gap and closure boundary', () => {
  const receipt = compileInstitutionalTimeAudit({
    case_id: 'school-pilot-synthetic-1',
    clocks: {
      t_sense: 0,
      t_model: 2,
      t_op: 5,
      t_inst: 9,
      t_pub: 14,
      t_context: 12
    },
    closure: { closure_class: 'drift', score: 0.5 },
    influence: { integral: 8, threshold: 6 },
    compression: {
      source_distinctions: ['unsafe condition', 'felt response', 'avoidance', 'absence'],
      registered_distinctions: ['absence flag'],
      explicitly_lost_distinctions: ['unsafe condition', 'felt response', 'avoidance']
    }
  });

  assert.equal(receipt.schema, PEDAGOGUE_INSTITUTIONAL_TIME_AUDIT_SCHEMA);
  assert.equal(receipt.preemption.preemption_gap, 4);
  assert.equal(receipt.preemption.acts_before_counts, true);
  assert.equal(receipt.preemption.context_preemption_gap, 7);
  assert.equal(receipt.preemption.context_lags_action, true);
  assert.equal(receipt.preemption.public_visibility_lag, 5);
  assert.equal(receipt.closure.closure_class, 'drift');
  assert.equal(receipt.closure.faithful, false);
  assert.equal(receipt.rupture.rupture, true);
  assert.equal(receipt.beacon.beacon_candidate, true);
  assert.equal(receipt.compression.many_to_one_declared, true);
  assert.equal(receipt.compression.semantic_loss_inferred_from_count, false);
  assert.equal(receipt.classification, 'INSTITUTIONAL_PREEMPTION_PRESENT');
  assert.equal(receipt.scope.institutional_time_only, true);
  assert.equal(receipt.scope.physical_time_travel_claim, false);
  assert.equal(receipt.scope.quantum_mechanism_claim, false);
  assert.equal(receipt.scope.malicious_intent_inferred, false);
  assert.equal(receipt.authority.automatic_intervention, false);
  assert.equal(receipt.authority.human_closure_required, true);
});

test('Institutional Time audit preserves non-registration without inventing a timestamp', () => {
  const receipt = compileInstitutionalTimeAudit({
    case_id: 'nonregistration-synthetic',
    clocks: { t_sense: 0, t_model: 1, t_op: 3, t_inst: null, t_pub: null, t_context: null },
    closure: { closure_class: 'inexpressible', score: 0 }
  });
  assert.equal(receipt.preemption.preemption_gap, null);
  assert.equal(receipt.preemption.institution_never_registered, true);
  assert.equal(receipt.preemption.acts_before_counts, true);
  assert.equal(receipt.rupture.rupture, true);
});

test('Dromological audit detects premature naming, assessment, cadence compression, withheld rest, and context lag', () => {
  const receipt = compileDromologicalSequenceAudit({
    audit_id: 'dromo-hostile-1',
    events: [
      { phase: 'NOTICE', at: 0 },
      { phase: 'ACT', at: 1 },
      { phase: 'NAME', at: 2 },
      { phase: 'ASSESSMENT', at: 2.5 },
      { phase: 'WORLD_ANSWERS', at: 3 },
      { phase: 'EXIT', at: 8 }
    ],
    cadence_constraints: {
      minimum_world_answer_dwell: 2,
      rest_required: true,
      exit_required: true
    },
    context_registration: { action_at: 1, context_registered_at: 6 },
    compression: {
      source_distinctions: ['condition', 'response', 'route', 'outcome'],
      registered_distinctions: ['outcome token'],
      explicitly_lost_distinctions: ['condition', 'response', 'route']
    }
  });

  const violations = new Set(receipt.violations);
  for (const expected of ['PREMATURE_NAMING', 'ASSESSMENT_BEFORE_CONSEQUENCE', 'CADENCE_COMPRESSION', 'REST_WITHHELD', 'CONTEXT_REGISTRATION_LAG']) {
    assert.equal(violations.has(expected), true, `${expected} must be retained as a separate typed violation.`);
  }
  assert.equal(receipt.schema, PEDAGOGUE_DROMOLOGICAL_SEQUENCE_AUDIT_SCHEMA);
  assert.equal(receipt.classification, 'DROMOLOGICAL_SEQUENCE_OR_CADENCE_DEFICIT');
  assert.equal(receipt.cadence.minimum_world_answer_dwell, 2);
  assert.equal(receipt.cadence.observed_world_answer_dwell, -1);
  assert.equal(receipt.cadence.age_inference_forbidden, true);
  assert.equal(receipt.cadence.developmental_rank_forbidden, true);
  assert.equal(receipt.scope.route_audit_not_person_diagnosis, true);
  assert.equal(receipt.scope.psychological_state_inferred, false);
  assert.equal(receipt.authority.automatic_redesign, false);
});

test('Dromological audit preserves a clean declared cadence without forcing hidden thresholds', () => {
  const receipt = compileDromologicalSequenceAudit({
    audit_id: 'dromo-clean-1',
    events: [
      { phase: 'NOTICE', at: 0 },
      { phase: 'ACT', at: 1 },
      { phase: 'WORLD_ANSWERS', at: 3 },
      { phase: 'NAME', at: 6 },
      { phase: 'REST', at: 7 },
      { phase: 'EXIT', at: 8 }
    ],
    cadence_constraints: {
      minimum_world_answer_dwell: 2,
      rest_required: true,
      exit_required: true
    }
  });
  assert.deepEqual(receipt.violations, []);
  assert.equal(receipt.classification, 'NO_DECLARED_SEQUENCE_OR_CADENCE_DEFICIT');
  assert.equal(receipt.cadence.timing_requirements_are_fixture_declared, true);
});

test('Temporal audits fail closed on prohibited learner-profile fields', () => {
  assert.throws(() => compileInstitutionalTimeAudit({
    case_id: 'bad-profile',
    age: 9,
    clocks: { t_op: 1, t_inst: 2 },
    closure: { closure_class: 'closed', score: 1 }
  }), /prohibited/i);

  assert.throws(() => compileDromologicalSequenceAudit({
    audit_id: 'bad-profile-2',
    developmental_rank: 'stage-1',
    events: [{ phase: 'NOTICE', at: 0 }]
  }), /prohibited/i);
});
