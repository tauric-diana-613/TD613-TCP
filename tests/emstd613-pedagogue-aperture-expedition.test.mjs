import assert from 'node:assert/strict';
import {
  compilePedagogueResearchTransferCard,
  hydratePedagogueResearch,
  compilePedagogueResearchAssayWitness,
  reviewPedagogueResearchMechanism,
  compilePedagogueResearchMechanismRefinement
} from '../app/engine/flowcore-pedagogue-core.js';
import { auditTypedEpistemicDeficit } from '../app/engine/aperture-v32-typed-epistemic-deficit.js';

const cards = [
  {
    card_id: 'emstd613.pid-steering.target-relative/v0.1',
    source: {
      title: 'Activation Steering with a Feedback Controller',
      venue: 'ICLR 2026',
      publication_date: '2026',
      source_class: 'PRIMARY_PEER_REVIEWED',
      source_reference: 'https://proceedings.iclr.cc/paper_files/paper/2026/hash/fa5617c176e76fee83f3f9947fdf9f3f-Abstract-Conference.html'
    },
    domain_family: 'LLM_REPRESENTATION_CONTROL',
    domain_tags: ['ACTIVATION_STEERING', 'FEEDBACK_CONTROL', 'PID'],
    mechanism_id: 'CONTROL_TARGET_AUTHORITY_SEPARATION',
    observed_relation: 'PID steering controls model activations relative to declared target semantic directions and controller assumptions.',
    transferable_relation: 'Controller performance is relative to a declared target; tracking that target does not by itself establish the target factual validity, freshness, provenance, or authority.',
    admissible_assays: ['Hold controller dynamics fixed while varying only the authority or truth status of the target reference.'],
    alternative_explanations: ['A separate subsystem may already bind the target to a trusted factual witness.'],
    falsifiers: ['Matched controller performance alone reliably discriminates valid from invalid target references without any additional witness input.'],
    forbidden_inferences: ['Stable semantic steering proves factual correctness.', 'A control-theoretic guarantee certifies the truth of the chosen semantic target.'],
    claim_ceiling: 'SOURCE_SUPPORTS_TARGET_RELATIVE_BEHAVIOR_CONTROL_NOT_REFERENCE_TRUTH'
  },
  {
    card_id: 'emstd613.dsr.fact-preservation/v0.1',
    source: {
      title: 'Knowledge-Graph-Gated Defactualization for Style-Controllable and Fact-Preserving Generation in Agentic Conversational AI',
      venue: 'arXiv',
      publication_date: '2026-07-01',
      source_class: 'PRIMARY_PREPRINT',
      source_reference: 'https://arxiv.org/abs/2608.20393'
    },
    domain_family: 'FACT_PRESERVING_GENERATION',
    domain_tags: ['ACTIVATION_STEERING', 'FACT_PRESERVATION', 'KNOWLEDGE_GRAPH'],
    mechanism_id: 'CONTROL_TARGET_AUTHORITY_SEPARATION',
    observed_relation: 'Representation-level style steering can disturb factual entities; typed placeholders and deterministic rehydration preserve a distinct fact-bearing state.',
    transferable_relation: 'Controller performance is relative to a declared target; tracking that target does not by itself establish the target factual validity, freshness, provenance, or authority.',
    admissible_assays: ['Compare steering-only output with a matched condition that protects fact-bearing state independently of the steerable representation.'],
    alternative_explanations: ['Improvement may arise from deterministic copying rather than a general epistemic separation principle.'],
    falsifiers: ['Strong representation steering preserves independently verified factual entities equally well without any separate fact-bearing constraint.'],
    forbidden_inferences: ['Typed rehydration proves all generated propositions are true.', 'Knowledge-graph protection creates universal factuality.'],
    claim_ceiling: 'SOURCE_SUPPORTS_SEPARATE_FACT_PRESERVATION_MECHANISM_NOT_UNIVERSAL_TRUTH_CONTROL'
  },
  {
    card_id: 'emstd613.dsr.typed-plane/v0.1',
    source: {
      title: 'Knowledge-Graph-Gated Defactualization for Style-Controllable and Fact-Preserving Generation in Agentic Conversational AI',
      venue: 'arXiv',
      publication_date: '2026-07-01',
      source_class: 'PRIMARY_PREPRINT',
      source_reference: 'https://arxiv.org/abs/2608.20393'
    },
    domain_family: 'FACT_PRESERVING_GENERATION',
    domain_tags: ['FACT_BEARING_STATE', 'REPRESENTATION_CONTROL', 'TYPED_PLACEHOLDERS'],
    mechanism_id: 'TYPED_CONTROL_PLANE_SEPARATION',
    observed_relation: 'The steerable representation and protected factual entities are handled by distinct mechanisms joined through an explicit extraction and rehydration map.',
    transferable_relation: 'A controller effective over one state representation should not inherit authority over a distinct fact-bearing or actuator state without an explicit typed crossing.',
    admissible_assays: ['Hold semantic intent constant while varying factual or actuator state behind an explicit typed crossing.'],
    alternative_explanations: ['The observed benefit may depend on the specific entity-extraction implementation.'],
    falsifiers: ['One undifferentiated semantic control state preserves fact-bearing state and actuator safety across matched perturbations without an explicit crossing.'],
    forbidden_inferences: ['One source establishes a universal three-plane architecture.', 'A typed placeholder is equivalent to external-world witness custody.'],
    claim_ceiling: 'SOURCE_MOTIVATES_TYPED_CROSSING_FOR_FACT_PRESERVATION_ONLY'
  },
  {
    card_id: 'emstd613.languagempc.typed-plane/v0.1',
    source: {
      title: 'LanguageMPC: Large Language Models as Decision Makers for Autonomous Driving',
      venue: 'arXiv',
      publication_date: '2023-10-04',
      source_class: 'PRIMARY_PREPRINT',
      source_reference: 'https://arxiv.org/abs/2310.03026'
    },
    domain_family: 'ROBOT_CONTROL',
    domain_tags: ['AUTONOMOUS_DRIVING', 'HIERARCHICAL_CONTROL', 'LLM_DECISION_MAKING', 'MPC'],
    mechanism_id: 'TYPED_CONTROL_PLANE_SEPARATION',
    observed_relation: 'High-level language-model decisions are translated into actionable driving behavior through an explicit lower-level control integration rather than treated as actuator commands by declaration alone.',
    transferable_relation: 'A controller effective over one state representation should not inherit authority over a distinct fact-bearing or actuator state without an explicit typed crossing.',
    admissible_assays: ['Hold semantic decision text constant while varying receiver or actuator feasibility and compare gated versus ungated execution.'],
    alternative_explanations: ['Performance may depend on the particular autonomous-driving stack rather than the generic separation.'],
    falsifiers: ['Semantic decision text alone supplies safe low-level control across matched plant-state changes without an explicit translation or receiver layer.'],
    forbidden_inferences: ['Language-model planning is itself low-level physical control.', 'A successful simulator route proves universal actuator safety.'],
    claim_ceiling: 'SOURCE_MOTIVATES_EXPLICIT_HIGH_TO_LOW_LEVEL_CONTROL_CROSSING_ONLY'
  }
].map(compilePedagogueResearchTransferCard);

const hydration = hydratePedagogueResearch(cards);
const targetReview = hydration.mechanism_reviews.find(item => item.mechanism_id === 'CONTROL_TARGET_AUTHORITY_SEPARATION');
const planeReview = hydration.mechanism_reviews.find(item => item.mechanism_id === 'TYPED_CONTROL_PLANE_SEPARATION');
assert.equal(targetReview?.status, 'CROSS_DOMAIN_REVIEW_CANDIDATE');
assert.equal(targetReview?.domain_family_count, 2);
assert.equal(planeReview?.status, 'CROSS_DOMAIN_REVIEW_CANDIDATE');
assert.equal(planeReview?.domain_family_count, 2);
assert.equal(hydration.pedagogue_learning_posture, 'HYPOTHESIS_GENERATION_AND_ASSAY_DESIGN_ONLY');
assert.equal(hydration.promotion_authority, false);

const trueReference = Object.freeze({ semantic_tracking: 1, witness_validity: 1, actuator_viability: 1 });
const falseReference = Object.freeze({ semantic_tracking: 1, witness_validity: 0, actuator_viability: 1 });
const staleReference = Object.freeze({ semantic_tracking: 1, witness_validity: 0, actuator_viability: 1 });
const unsafeActuator = Object.freeze({ semantic_tracking: 1, witness_validity: 1, actuator_viability: 0 });

const project = (state, planes) => planes.map(plane => {
  if (plane === 'S') return state.semantic_tracking;
  if (plane === 'W') return state.witness_validity;
  if (plane === 'A') return state.actuator_viability;
  throw new Error(`Unknown plane ${plane}`);
});

assert.deepEqual(project(trueReference, ['S']), project(falseReference, ['S']));
assert.notDeepEqual(project(trueReference, ['S', 'W']), project(falseReference, ['S', 'W']));
assert.deepEqual(project(trueReference, ['S', 'W']), project(unsafeActuator, ['S', 'W']));
assert.notDeepEqual(project(trueReference, ['S', 'W', 'A']), project(unsafeActuator, ['S', 'W', 'A']));

const falseSetpointWitness = compilePedagogueResearchAssayWitness({
  witness_id: 'emstd613.false-setpoint-alias/v0.1',
  mechanism_id: 'CONTROL_TARGET_AUTHORITY_SEPARATION',
  context_family: 'FALSE_REFERENCE_CONTROL',
  assay_reference: 'EMSTD613 finite true-versus-false setpoint alias fixture',
  assay_schema: 'td613.emstd613.false-setpoint-alias/v0.1',
  assay_source_status: 'SIMULATED',
  outcome: 'SUPPORTED_BOUNDED',
  declared_controls: ['identical semantic tracking state', 'only witness validity differs'],
  observations: ['S-only observation is identical for the true and false reference states.', 'Adding W distinguishes the matched states without changing semantic tracking.'],
  falsifier_outcome: 'The broad relation would fail in this fixture if S-only tracking distinguished reference validity.',
  alternative_explanations_remaining: ['The fixture is a finite calibration of typed state loss rather than an empirical language-model result.'],
  claim_ceiling: 'FINITE_ALIASING_CALIBRATION_ONLY'
});

const staleSetpointWitness = compilePedagogueResearchAssayWitness({
  witness_id: 'emstd613.stale-setpoint-alias/v0.1',
  mechanism_id: 'CONTROL_TARGET_AUTHORITY_SEPARATION',
  context_family: 'STALE_REFERENCE_CONTROL',
  assay_reference: 'EMSTD613 finite stale-reference control fixture',
  assay_schema: 'td613.emstd613.stale-setpoint-alias/v0.1',
  assay_source_status: 'SIMULATED',
  outcome: 'SUPPORTED_BOUNDED',
  declared_controls: ['semantic tracking held at the target', 'witness validity changed after target construction'],
  observations: ['Semantic tracking can remain perfect while the witness-validity coordinate is stale.', 'A W-bearing observation is required to expose the change in the declared fixture.'],
  falsifier_outcome: 'The relation would fail in this fixture if semantic tracking changed solely because witness validity changed outside S.',
  alternative_explanations_remaining: ['Real systems may couple witness refresh directly into semantic state; this fixture deliberately tests the uncoupled boundary.'],
  claim_ceiling: 'FINITE_STALE_REFERENCE_CALIBRATION_ONLY'
});

const targetMechanismReview = reviewPedagogueResearchMechanism(
  hydration,
  [falseSetpointWitness, staleSetpointWitness],
  'CONTROL_TARGET_AUTHORITY_SEPARATION'
);
assert.equal(targetMechanismReview.learning_state, 'CROSS_DOMAIN_PLUS_MULTI_CONTEXT_INTERNAL_BOUNDED_ASSAY_WITNESSES');
assert.equal(targetMechanismReview.next_learning_action, 'SEEK_ADVERSARIAL_COUNTEREXAMPLE');
assert.equal(targetMechanismReview.pedagogue_law_status, 'NOT_PROMOTED');

const targetRefinement = compilePedagogueResearchMechanismRefinement({
  hydration,
  mechanism_review: targetMechanismReview,
  proposal: {
    proposal_id: 'emstd613.reference-authority-travels-with-control-target/v0.1',
    parent_mechanism_id: 'CONTROL_TARGET_AUTHORITY_SEPARATION',
    candidate_mechanism_id: 'REFERENCE_AUTHORITY_TRAVELS_WITH_CONTROL_TARGET',
    epistemic_kind: 'OPERATIONAL_CRITERION',
    formal_scope: 'Reference construction and witness binding for semantic or behavioral controllers.',
    empirical_truth_claim: false,
    instrumentation_validation_applicable: true,
    boundary_testing_required: true,
    operational_definition: 'A controller receipt may claim reference tracking only unless the target also carries a typed source or witness status, relevant freshness state, target-to-controlled-state map, and claim ceiling.',
    scope_conditions: ['Controller target is externally supplied or constructed from evidence-bearing inputs.', 'The target can remain numerically or semantically stable while its authority state changes.'],
    failure_modes: ['Treating low tracking error as factuality.', 'Treating stale reference continuity as continued witness validity.', 'Allowing controller stability to ratify the source that defined its setpoint.'],
    supporting_witness_ids: [falseSetpointWitness.witness_id, staleSetpointWitness.witness_id],
    supporting_context_families: ['FALSE_REFERENCE_CONTROL', 'STALE_REFERENCE_CONTROL'],
    discriminating_assays: ['False-setpoint matched control with identical controller dynamics.', 'Stale-reference control with independent witness refresh.'],
    counterexample_conditions: ['A matched controller can infer reference validity without any additional witness-bearing input.', 'The criterion reduces reliability by blocking valid target tracking without reducing false-reference acceptance.'],
    alternative_explanations_remaining: ['Some architectures may already encode witness validity inside the controlled state.', 'The operational utility of explicit target authority metadata remains untested in a live model.'],
    claim_ceiling: 'OPERATIONAL_CRITERION_CANDIDATE_ONLY_NOT_PEDAGOGUE_LAW'
  }
});
assert.equal(targetRefinement.refinement_status, 'MULTI_CONTEXT_MOTIVATED_OPERATIONAL_CRITERION');
assert.equal(targetRefinement.next_learning_action, 'RUN_DISCRIMINATING_APERTURE_ASSAY');
assert.equal(targetRefinement.authority.pedagogue_law_promoted, false);

const witnessPlaneWitness = compilePedagogueResearchAssayWitness({
  witness_id: 'emstd613.semantic-witness-plane-alias/v0.1',
  mechanism_id: 'TYPED_CONTROL_PLANE_SEPARATION',
  context_family: 'SEMANTIC_WITNESS_CONTROL',
  assay_reference: 'EMSTD613 S-only versus S+W finite projection fixture',
  assay_schema: 'td613.emstd613.semantic-witness-plane-alias/v0.1',
  assay_source_status: 'SIMULATED',
  outcome: 'SUPPORTED_BOUNDED',
  declared_controls: ['semantic coordinate matched', 'witness-validity coordinate varied'],
  observations: ['S-only projection aliases states that S+W distinguishes.'],
  falsifier_outcome: 'The relation would fail in this fixture if S-only observation preserved the W coordinate.',
  alternative_explanations_remaining: ['This is a deliberately typed finite model and does not prove a natural three-plane decomposition.'],
  claim_ceiling: 'FINITE_SEMANTIC_WITNESS_PROJECTION_CALIBRATION_ONLY'
});

const actuatorPlaneWitness = compilePedagogueResearchAssayWitness({
  witness_id: 'emstd613.semantic-actuator-plane-alias/v0.1',
  mechanism_id: 'TYPED_CONTROL_PLANE_SEPARATION',
  context_family: 'ACTUATOR_RECEIVER_CONTROL',
  assay_reference: 'EMSTD613 S+W versus S+W+A finite projection fixture',
  assay_schema: 'td613.emstd613.semantic-actuator-plane-alias/v0.1',
  assay_source_status: 'SIMULATED',
  outcome: 'SUPPORTED_BOUNDED',
  declared_controls: ['semantic and witness coordinates matched', 'actuator viability varied'],
  observations: ['S+W projection aliases safe and unsafe actuator states.', 'Adding A distinguishes the matched states.'],
  falsifier_outcome: 'The relation would fail in this fixture if S+W observation preserved actuator viability without an A-bearing crossing.',
  alternative_explanations_remaining: ['Real systems may encode actuator state inside semantic context; the useful question is whether that encoding is explicit and independently testable.'],
  claim_ceiling: 'FINITE_ACTUATOR_PROJECTION_CALIBRATION_ONLY'
});

const planeMechanismReview = reviewPedagogueResearchMechanism(
  hydration,
  [witnessPlaneWitness, actuatorPlaneWitness],
  'TYPED_CONTROL_PLANE_SEPARATION'
);
assert.equal(planeMechanismReview.learning_state, 'CROSS_DOMAIN_PLUS_MULTI_CONTEXT_INTERNAL_BOUNDED_ASSAY_WITNESSES');
assert.equal(planeMechanismReview.next_learning_action, 'SEEK_ADVERSARIAL_COUNTEREXAMPLE');

const planeRefinement = compilePedagogueResearchMechanismRefinement({
  hydration,
  mechanism_review: planeMechanismReview,
  proposal: {
    proposal_id: 'emstd613.semantic-witness-actuator-plane-separation/v0.1',
    parent_mechanism_id: 'TYPED_CONTROL_PLANE_SEPARATION',
    candidate_mechanism_id: 'SEMANTIC_WITNESS_ACTUATOR_PLANE_SEPARATION',
    epistemic_kind: 'DESIGN_HEURISTIC',
    formal_scope: 'AI systems in which semantic control, evidence-bearing reference state, and consequential receiver state can vary independently.',
    empirical_truth_claim: false,
    instrumentation_validation_applicable: true,
    boundary_testing_required: true,
    operational_definition: 'Preserve separately inspectable semantic, witness, and actuator state classes whenever matched controls show that one can vary while the others remain fixed; every crossing carries an explicit mapping or receiver contract.',
    scope_conditions: ['At least two of semantic, witness, or actuator state can vary independently under matched controls.', 'Consequential claims or actions depend on a crossing between those state classes.'],
    failure_modes: ['Duplicating one underlying state under three labels.', 'Adding plane bureaucracy without measurable error reduction.', 'Using plane separation as proof of external truth or safe actuation.'],
    supporting_witness_ids: [witnessPlaneWitness.witness_id, actuatorPlaneWitness.witness_id],
    supporting_context_families: ['ACTUATOR_RECEIVER_CONTROL', 'SEMANTIC_WITNESS_CONTROL'],
    discriminating_assays: ['Compare false-reference acceptance with and without W-plane gating.', 'Compare unsafe actuator invocation with and without A-plane gating.', 'Measure semantic-task performance cost introduced by the separation.'],
    counterexample_conditions: ['A single-state controller matches or exceeds reliability and utility across the same matched controls.', 'The proposed planes cannot be measured or perturbed independently.'],
    alternative_explanations_remaining: ['The observed utility may come from ordinary modular software design rather than a specifically TD613 mechanism.', 'Three planes may be too coarse or too fine for some architectures.'],
    claim_ceiling: 'DESIGN_HEURISTIC_CANDIDATE_ONLY_NOT_UNIVERSAL_AI_ARCHITECTURE'
  }
});
assert.equal(planeRefinement.refinement_status, 'MULTI_CONTEXT_DESIGN_HEURISTIC_CANDIDATE');
assert.equal(planeRefinement.next_learning_action, 'TEST_UTILITY_AND_FAILURE_BOUNDARY');
assert.equal(planeRefinement.authority.pedagogue_law_promoted, false);

const apertureCommon = Object.freeze({
  latent_dimension: 3,
  uncertainty_status: 'VALID_DECLARED',
  sigma_min_floor: 0.25,
  condition_number_ceiling: 10,
  threshold_authority: 'EMSTD613_SYNTHETIC_LOCAL_FIXTURE'
});

const sOnly = auditTypedEpistemicDeficit({ ...apertureCommon, current_rank: 1, sigma_min: 0, condition_number: 1000000 });
const swOnly = auditTypedEpistemicDeficit({ ...apertureCommon, current_rank: 2, sigma_min: 0, condition_number: 1000000 });
const swa = auditTypedEpistemicDeficit({ ...apertureCommon, current_rank: 3, sigma_min: 1, condition_number: 1 });
const uncertaintyHeld = auditTypedEpistemicDeficit({ ...apertureCommon, current_rank: 3, sigma_min: 1, condition_number: 1, uncertainty_status: 'INCOMPLETE' });

assert.deepEqual([sOnly.deficit_class, sOnly.disposition], ['STRUCTURAL_RANK_DEFICIT', 'PROPOSE']);
assert.deepEqual([swOnly.deficit_class, swOnly.disposition], ['STRUCTURAL_RANK_DEFICIT', 'PROPOSE']);
assert.deepEqual([swa.deficit_class, swa.disposition], ['NO_DECLARED_LOCAL_IDENTIFIABILITY_DEFICIT', 'ASK_NOTHING']);
assert.deepEqual([uncertaintyHeld.deficit_class, uncertaintyHeld.disposition], ['NOISE_GEOMETRY_INCOMPLETE', 'ABSTAIN']);
assert.equal(sOnly.promotion_authority, false);
assert.equal(swa.automatic_experiment_execution, false);

console.log(JSON.stringify({
  ok: true,
  hydration_candidates: hydration.cross_domain_review_candidates,
  target_learning_state: targetMechanismReview.learning_state,
  target_refinement: {
    id: targetRefinement.candidate_mechanism_id,
    status: targetRefinement.refinement_status,
    next_learning_action: targetRefinement.next_learning_action
  },
  plane_learning_state: planeMechanismReview.learning_state,
  plane_refinement: {
    id: planeRefinement.candidate_mechanism_id,
    status: planeRefinement.refinement_status,
    next_learning_action: planeRefinement.next_learning_action
  },
  aperture: {
    s_only: [sOnly.deficit_class, sOnly.disposition],
    s_w: [swOnly.deficit_class, swOnly.disposition],
    s_w_a: [swa.deficit_class, swa.disposition],
    incomplete_uncertainty: [uncertaintyHeld.deficit_class, uncertaintyHeld.disposition]
  },
  pedagogue_law_promoted: false,
  aperture_promotion_authority: false
}, null, 2));
