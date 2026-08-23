import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PEDAGOGUE_LINEAGE_LENSES,
  PEDAGOGUE_LINEAGE_SECOND_PASS_SCHEMA,
  PEDAGOGUE_LINEAGE_SECOND_PASS_SIGNALS,
  PEDAGOGUE_INTERFACE_DIAGNOSIS_SCHEMA,
  PEDAGOGUE_INSTITUTIONAL_TIME_AUDIT_SCHEMA,
  PEDAGOGUE_DROMOLOGICAL_SEQUENCE_AUDIT_SCHEMA,
  compilePedagogueLineageSecondPass
} from '../app/engine/flowcore-pedagogue-core.js';

test('second pass routes declared machine deficits through the full provenance lens family without creating authority', () => {
  const receipt = compilePedagogueLineageSecondPass({
    pass_id: 'full-lineage-second-pass',
    interface_diagnosis: {
      schema: PEDAGOGUE_INTERFACE_DIAGNOSIS_SCHEMA,
      findings: [
        { code: 'STATUS_ONTOLOGY_OVERCLAIM' },
        { code: 'ADVISORY_WITHOUT_ROUTE' }
      ]
    },
    institutional_time_audit: {
      schema: PEDAGOGUE_INSTITUTIONAL_TIME_AUDIT_SCHEMA,
      preemption: {
        acts_before_counts: true,
        institution_never_registered: false,
        context_lags_action: true
      },
      rupture: { failed_faithful_closure: true },
      compression: {
        many_to_one_declared: true,
        explicitly_lost_distinctions: ['route context']
      }
    },
    cadence_audit: {
      schema: PEDAGOGUE_DROMOLOGICAL_SEQUENCE_AUDIT_SCHEMA,
      violations: ['PREMATURE_NAMING', 'REST_WITHHELD'],
      compression: null
    },
    burden_comparison: { all_models_non_worsening: false },
    declared_system_signals: [
      'CONTEXT_UNRESOLVED_BEFORE_PERSON_ATTRIBUTION',
      'COMMUNITY_ROUTE_SEGREGATED',
      'CONTAMINATED_SOURCE_ROUTE_REQUIRES_QUARANTINE'
    ]
  });

  assert.equal(receipt.schema, PEDAGOGUE_LINEAGE_SECOND_PASS_SCHEMA);
  assert.equal(receipt.diagnostic_input_posture, 'SUPPLIED_OR_COMPILED_SYSTEM_DIAGNOSTICS_FOR_QUESTION_ROUTING_ONLY');
  assert.equal(receipt.input_receipt_authenticity_independently_verified, false);
  assert.equal(receipt.activation_count_is_not_score, true);
  assert.equal(receipt.activation_establishes_source_claim, false);
  assert.equal(receipt.activation_establishes_design_defect, false);
  assert.equal(receipt.thinker_vote_forbidden, true);
  assert.equal(receipt.convergence_not_computed, true);
  assert.equal(receipt.human_profile_inference, false);
  assert.equal(receipt.recommendation_only, true);

  const expected = new Set(PEDAGOGUE_LINEAGE_LENSES.map((lens) => lens.lens_id));
  const activated = new Set(receipt.activated_lenses.map((lens) => lens.lens_id));
  assert.deepEqual(activated, expected);
  assert.equal(receipt.dormant_lenses.length, 0);
  for (const lens of receipt.activated_lenses) {
    assert.ok(lens.question.length > 0);
    assert.ok(lens.provenance_nodes.length > 0);
    assert.ok(lens.activation_basis.length > 0);
  }

  assert.equal(receipt.authority.product_mutation_authorized, false);
  assert.equal(receipt.authority.production_mutation_authorized, false);
  assert.equal(receipt.authority.automatic_redesign, false);
  assert.equal(receipt.authority.automatic_intervention, false);
  assert.equal(receipt.authority.automatic_release, false);
  assert.equal(receipt.authority.human_closure_required, true);
});

test('clean machine receipts do not manufacture lineage activations', () => {
  const receipt = compilePedagogueLineageSecondPass({
    pass_id: 'clean-second-pass',
    interface_diagnosis: { schema: PEDAGOGUE_INTERFACE_DIAGNOSIS_SCHEMA, findings: [] },
    institutional_time_audit: {
      schema: PEDAGOGUE_INSTITUTIONAL_TIME_AUDIT_SCHEMA,
      preemption: {
        acts_before_counts: false,
        institution_never_registered: false,
        context_lags_action: false
      },
      rupture: { failed_faithful_closure: false },
      compression: null
    },
    cadence_audit: {
      schema: PEDAGOGUE_DROMOLOGICAL_SEQUENCE_AUDIT_SCHEMA,
      violations: [],
      compression: null
    },
    burden_comparison: { all_models_non_worsening: true }
  });

  assert.equal(receipt.activation_count, 0);
  assert.deepEqual(receipt.activated_lenses, []);
  assert.equal(receipt.dormant_lenses.length, PEDAGOGUE_LINEAGE_LENSES.length);
  assert.deepEqual(receipt.declared_system_signals, []);
});

test('second pass rejects undeclared signal vocabulary instead of inventing a new pedagogue route', () => {
  assert.ok(PEDAGOGUE_LINEAGE_SECOND_PASS_SIGNALS.includes('COMMUNITY_ROUTE_SEGREGATED'));
  assert.throws(() => compilePedagogueLineageSecondPass({
    pass_id: 'bad-signal',
    declared_system_signals: ['THE_VIBES_ARE_OFF']
  }), /Unsupported Pedagogue lineage second-pass signal/i);
});
