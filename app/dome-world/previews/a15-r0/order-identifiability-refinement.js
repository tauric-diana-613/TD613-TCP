import { compilePedagogueResearchMechanismRefinement } from '../../../engine/flowcore-pedagogue-core.js';

export const ORDER_IDENTIFIABILITY_REFINEMENT_ID = 'pedagogue.order-identifiability-separation/v0.1';
export const ORDER_IDENTIFIABILITY_CANDIDATE_MECHANISM = 'ROUTE_ORDER_IDENTIFIABILITY_REQUIRES_SEPARATING_DYNAMICS_AND_OBSERVATION';

export function buildOrderIdentifiabilityRefinement({ hydration, mechanism_review } = {}) {
  if (!mechanism_review || mechanism_review.mechanism_id !== 'ORDER_IS_PART_OF_PROCESS_STATE') {
    throw new Error('Order-identifiability refinement requires the governed ORDER_IS_PART_OF_PROCESS_STATE mechanism review.');
  }
  const contexts = new Set(mechanism_review.internal_context_families || []);
  if (!contexts.has('ASH_CALIBRATION') || !contexts.has('GIVING_PRACTICE')) {
    throw new Error('Order-identifiability refinement requires both ASH_CALIBRATION and GIVING_PRACTICE bounded contexts.');
  }

  return compilePedagogueResearchMechanismRefinement({
    hydration,
    mechanism_review,
    proposal: {
      proposal_id: ORDER_IDENTIFIABILITY_REFINEMENT_ID,
      parent_mechanism_id: 'ORDER_IS_PART_OF_PROCESS_STATE',
      candidate_mechanism_id: ORDER_IDENTIFIABILITY_CANDIDATE_MECHANISM,
      epistemic_kind: 'OPERATIONAL_CRITERION',
      formal_scope: 'FINITE_DETERMINISTIC_TERMINAL_SIGNATURE_MODEL',
      empirical_truth_claim: false,
      instrumentation_validation_applicable: true,
      boundary_testing_required: true,
      operational_definition: 'For a declared finite route family R, initial state x0, route-indexed forward maps F_r, and admitted observation map O, define S(r)=O(F_r(x0)). Exact route-order identifiability over R requires the admitted route-signature map S to be injective on R. Failure can occur because the forward dynamics collapse routes before observation or because the observation aperture collapses distinct surviving terminal states.',
      scope_conditions: [
        'finite declared candidate route family',
        'deterministic route-indexed forward maps to one terminal state per route',
        'declared initial condition',
        'declared observation aperture',
        'decoder receives no hidden route labels, timestamps, or inadmissible intermediate states',
        'identifiability claim scoped only to the declared candidate family and admitted terminal observation'
      ],
      failure_modes: [
        'DYNAMIC_ALIASING: distinct routes r and s satisfy F_r(x0)=F_s(x0), so terminal-state observation cannot recover the lost route distinction',
        'OBSERVATIONAL_ALIASING: distinct terminal states survive but O(F_r(x0))=O(F_s(x0)), so the admitted aperture discards the surviving route distinction'
      ],
      supporting_witness_ids: mechanism_review.internal_assay_witnesses.map(witness => witness.witness_id),
      supporting_context_families: [...mechanism_review.internal_context_families],
      discriminating_assays: [
        '2x2 forward-dynamics-by-observation-aperture assay: order-separating versus order-erasing dynamics crossed with rich versus deliberately lossy observation',
        'report forward terminal-state count separately from admitted observed-signature count so dynamic and observational aliasing cannot be conflated'
      ],
      counterexample_conditions: [
        'implementation reports exact route recovery when the admitted finite signature map is non-injective without any additional history or intermediate observation',
        'controlled forward/observation conditions fail to localize the stage at which candidate collisions are introduced',
        'apparent recovery requires route labels, timestamps, hidden intermediate states, or candidate identity leakage'
      ],
      alternative_explanations_remaining: [
        'Both current internal contexts are authored within TD613 and are not statistically independent replications.',
        'The finite deterministic route families may be too small or clean relative to stochastic or operational systems.',
        'Terminal-state reconstruction may be insufficient for systems whose relevant history is admitted through intermediate measurements.',
        'The dynamic-versus-observational decomposition may need extension for stochastic forward maps, probabilistic observations, or overlapping route-conditioned distributions.'
      ],
      claim_ceiling: 'FINITE_DETERMINISTIC_TERMINAL_SIGNATURE_OPERATIONAL_CRITERION_ONLY; the injectivity statement is a criterion for exact distinguishability inside the declared model, not an empirically discovered law. No universal theory of temporal order, causality, quantum process tomography, physical noncommutativity, connection, curvature, holonomy, Berry structure, phasons, D3 geometry, or production authority follows.'
    }
  });
}
