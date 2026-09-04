import assert from 'node:assert/strict';
import {
  analyzeA16ResidualGateFrontier,
  currentResidualState,
  gateDefinition,
  validateResidualGateState
} from '../app/dome-world/previews/a15-r0/a16-residual-gate-persistence.js';

const report = analyzeA16ResidualGateFrontier();

assert.equal(report.schema, 'td613.ash.a16-residual-gate-persistence/v0.1');
assert.equal(report.result, 'A16_RESIDUAL_GATE_PERSISTENCE_CANDIDATE');
assert.equal(report.entry_gate_count, 7, 'The terminal A16 entry constitution has seven admission coordinates; Golden Egg separation is a preserved boundary invariant, not an eighth entry coordinate.');
assert.equal(report.satisfied_gate_count, 3, 'G1, G2, and G7 are the admitted satisfied entry coordinates.');
assert.equal(report.residual_gate_count, 4, 'G3-G6 remain residual after current machine-side progress.');
assert.deepEqual(report.residual_gate_ids, ['G3','G4','G5','G6']);
assert.equal(report.immediately_machine_reducible_residual_gate_count, 0, 'No residual entry coordinate can lawfully be closed now by another repository-only transformation.');
assert.equal(report.exogenous_operator_governance_event_lower_bound, 1, 'At least one exogenous operator-governance act is required before the residual frontier can move.');
assert.equal(report.exact_minimum_distinct_operator_event_count, 'UNIDENTIFIABLE_FROM_CURRENT_CONTRACT', 'Gate count may not be silently reinterpreted as human-event count.');
assert.equal(report.candidate_registration_admissible_now, false, 'An A16 implementation candidate may not be selected before readmission gates close.');
assert.equal(report.a16_readmission_state, 'HELD');
assert.equal(report.a16_implementation_state, 'NOT_STARTED');
assert.equal(report.a16_mutation_authority, false);
assert.equal(report.golden_egg_boundary.entry_gate, false);
assert.equal(report.golden_egg_boundary.disposition, 'PRESERVED_AND_HARDENED');

assert.equal(report.historical_audit_witness.pr, 996);
assert.equal(report.historical_audit_witness.exact_head, '4bc66171d96675a28a455ee9a052b7b205b0328f');
assert.equal(report.historical_audit_witness.validation_run, '2477 / 33618602907');
assert.equal(report.historical_audit_witness.validation_conclusion, 'SUCCESS');
assert.equal(report.historical_audit_witness.source_ancestor_of_current_head, false, 'The closed/draft/unmerged #996 audit must remain a historical witness rather than being laundered into current source ancestry.');

assert.equal(report.current_scientific_parent.pr, 1023);
assert.equal(report.current_scientific_parent.exact_head, '1dfea64cc4609fa89d23f07f9e17a848385b8401');
assert.equal(report.current_scientific_parent.exact_tree, '989a4e3843f1fc0c69ce5d9d1dda13cd51fcda8a');
assert.equal(report.current_scientific_parent.validation_run, '2550 / 33724517020');
assert.equal(report.current_scientific_parent.validation_conclusion, 'SUCCESS');

const state = currentResidualState();
assert.deepEqual(state, { G1:true, G2:true, G3:false, G4:false, G5:false, G6:false, G7:true });

assert.equal(gateDefinition('G3').disposition, 'OPEN_EXOGENOUS_OPERATOR_GOVERNANCE');
assert.equal(gateDefinition('G4').disposition, 'BLOCKED_BY_G3');
assert.equal(gateDefinition('G5').disposition, 'OPEN_EXOGENOUS_OPERATOR_ADMISSION');
assert.equal(gateDefinition('G6').disposition, 'FORBIDDEN_BEFORE_G3_G4_G5_CLOSE');

assert.throws(
  () => validateResidualGateState({ G1:true, G2:true, G3:false, G4:true, G5:false, G6:false, G7:true }),
  /cannot precede the governing review-or-waiver coordinate/,
  'Visual-errata disposition may not be fabricated upstream of the governing review/waiver coordinate.'
);
assert.throws(
  () => validateResidualGateState({ G1:true, G2:true, G3:true, G4:false, G5:true, G6:true, G7:true }),
  /inadmissible before G3, G4, and G5 close/,
  'Candidate registration may not route around an unresolved errata coordinate.'
);
assert.throws(
  () => validateResidualGateState({ G1:true, G2:true, G3:true, G4:true, G5:false, G6:true, G7:true }),
  /inadmissible before G3, G4, and G5 close/,
  'Candidate registration may not route around missing A16-0 scope acceptance.'
);
assert.deepEqual(
  validateResidualGateState({ G1:true, G2:true, G3:true, G4:true, G5:true, G6:true, G7:true }),
  { G1:true, G2:true, G3:true, G4:true, G5:true, G6:true, G7:true },
  'The finite dependency validator may recognize a hypothetically fully admitted state without creating or authorizing that state.'
);

for (const law of [
  'RESIDUAL_GATE_COORDINATE_COUNT != DISTINCT_HUMAN_EVENT_COUNT',
  'MACHINE_SIDE_PROGRESS != HUMAN_GATE_SATISFACTION',
  'HISTORICAL_AUDIT_WITNESS != CURRENT_SOURCE_ANCESTRY',
  'LOWER_BOUND_ONE_EXOGENOUS_GOVERNANCE_EVENT != EXACT_EVENT_COUNT_ONE',
  'A16_RESIDUAL_GATE_PERSISTENCE != WESTERN_HORIZON_SUCCESSOR'
]) assert.ok(report.laws.includes(law), `Missing anti-equivalence law: ${law}`);

console.log('A16 residual gate persistence tests passed.');
