const ENTRY_GATES = Object.freeze([
  Object.freeze({ id:'G1', name:'A12_A15_DOSSIER_MERGED', disposition:'SATISFIED_HISTORICALLY', residual:false, machine_reducible_now:false }),
  Object.freeze({ id:'G2', name:'A16_A19_HANDOFF_MERGED', disposition:'SATISFIED_HISTORICALLY', residual:false, machine_reducible_now:false }),
  Object.freeze({ id:'G3', name:'OPERATOR_VISUAL_REVIEW_RECORDED_OR_EXPLICITLY_WAIVED', disposition:'OPEN_EXOGENOUS_OPERATOR_GOVERNANCE', residual:true, machine_reducible_now:false }),
  Object.freeze({ id:'G4', name:'A15_VISUAL_ERRATA_REPAIRED_OR_EXPLICITLY_HELD', disposition:'BLOCKED_BY_G3', residual:true, machine_reducible_now:false, depends_on:Object.freeze(['G3']) }),
  Object.freeze({ id:'G5', name:'A16_0_SCOPE_ACCEPTED', disposition:'OPEN_EXOGENOUS_OPERATOR_ADMISSION', residual:true, machine_reducible_now:false }),
  Object.freeze({ id:'G6', name:'SINGLE_ACTIVE_A16_BRANCH_OR_CANDIDATE', disposition:'FORBIDDEN_BEFORE_G3_G4_G5_CLOSE', residual:true, machine_reducible_now:false, depends_on:Object.freeze(['G3','G4','G5']) }),
  Object.freeze({ id:'G7', name:'CI_CONFIRMATION_ARCHITECTURE_ADOPTED', disposition:'SATISFIED_BY_LATER_EVIDENCE', residual:false, machine_reducible_now:false })
]);

const GOLDEN_EGG_BOUNDARY = Object.freeze({
  name:'GOLDEN_EGG_REMAINS_OUTSIDE_A16_A19',
  disposition:'PRESERVED_AND_HARDENED',
  entry_gate:false
});

function gateById(id) {
  return ENTRY_GATES.find(gate => gate.id === id) || null;
}

export function validateResidualGateState(state = {}) {
  const values = Object.fromEntries(ENTRY_GATES.map(gate => [gate.id, Boolean(state[gate.id])]));
  if (values.G4 && !values.G3) {
    throw new Error('G4 visual-errata disposition cannot precede the governing review-or-waiver coordinate.');
  }
  if (values.G6 && !(values.G3 && values.G4 && values.G5)) {
    throw new Error('G6 A16 candidate registration is inadmissible before G3, G4, and G5 close.');
  }
  return Object.freeze(values);
}

export function analyzeA16ResidualGateFrontier() {
  const residual = ENTRY_GATES.filter(gate => gate.residual);
  const satisfied = ENTRY_GATES.filter(gate => !gate.residual);
  const immediateMachineReducible = residual.filter(gate => gate.machine_reducible_now);

  return Object.freeze({
    schema:'td613.ash.a16-residual-gate-persistence/v0.1',
    result:'A16_RESIDUAL_GATE_PERSISTENCE_CANDIDATE',
    historical_audit_witness:Object.freeze({
      pr:996,
      exact_head:'4bc66171d96675a28a455ee9a052b7b205b0328f',
      validation_run:'2477 / 33618602907',
      validation_conclusion:'SUCCESS',
      source_ancestor_of_current_head:false
    }),
    current_scientific_parent:Object.freeze({
      pr:1023,
      exact_head:'1dfea64cc4609fa89d23f07f9e17a848385b8401',
      exact_tree:'989a4e3843f1fc0c69ce5d9d1dda13cd51fcda8a',
      validation_run:'2550 / 33724517020',
      validation_conclusion:'SUCCESS'
    }),
    entry_gate_count:ENTRY_GATES.length,
    satisfied_gate_count:satisfied.length,
    residual_gate_count:residual.length,
    residual_gate_ids:Object.freeze(residual.map(gate => gate.id)),
    immediately_machine_reducible_residual_gate_count:immediateMachineReducible.length,
    exogenous_operator_governance_event_lower_bound:1,
    exact_minimum_distinct_operator_event_count:'UNIDENTIFIABLE_FROM_CURRENT_CONTRACT',
    candidate_registration_admissible_now:false,
    a16_readmission_state:'HELD',
    a16_implementation_state:'NOT_STARTED',
    a16_mutation_authority:false,
    golden_egg_boundary:GOLDEN_EGG_BOUNDARY,
    gates:ENTRY_GATES,
    dependency_edges:Object.freeze([
      Object.freeze(['G3','G4']),
      Object.freeze(['G3','G6']),
      Object.freeze(['G4','G6']),
      Object.freeze(['G5','G6'])
    ]),
    laws:Object.freeze([
      'RESIDUAL_GATE_COORDINATE_COUNT != DISTINCT_HUMAN_EVENT_COUNT',
      'MACHINE_SIDE_PROGRESS != HUMAN_GATE SATISFACTION'.replace('GATE SATISFACTION','GATE_SATISFACTION'),
      'HISTORICAL_AUDIT_WITNESS != CURRENT_SOURCE_ANCESTRY',
      'VISUAL_ERRATA_DISPOSITION != PRE_REVIEW_SELF_ATTESTATION',
      'A16_SCOPE_PROPOSAL != A16_SCOPE_ACCEPTANCE',
      'RESEARCH_BRANCH != A16_IMPLEMENTATION_CANDIDATE',
      'CANDIDATE_REGISTRATION != PRE_READMISSION_ESCAPE_HATCH',
      'LOWER_BOUND_ONE_EXOGENOUS_GOVERNANCE_EVENT != EXACT_EVENT_COUNT_ONE',
      'A16_RESIDUAL_GATE_PERSISTENCE != WESTERN_HORIZON_SUCCESSOR'
    ])
  });
}

export function currentResidualState() {
  return validateResidualGateState({ G1:true, G2:true, G3:false, G4:false, G5:false, G6:false, G7:true });
}

export function gateDefinition(id) {
  return gateById(id);
}
