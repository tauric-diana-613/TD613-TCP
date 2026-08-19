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
      operational_definition: 'For a declared finite route family R, initial state x0, route-indexed forward maps F_r, and admitted observation map O, define S(r)=O(F_r(x0)). Exact route-order identifiability over R requires the admitted route-signature map S to be injective on R. Failure can occur because the forward dynamics collapse routes before observation or because the observation aperture collapses distinct surviving terminal states.',
      scope_conditions: [
        'finite declared candidate route family',
        'declared initial condition',
        'declared route-indexed forward process',
        'declared observation aperture',
        'decoder receives no hidden route labels, timestamps, or inadmissible intermediate states',
        'identifiability claim scoped only to the declared candidate family and admitted observation'
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
        'recover distinct route order after the complete terminal states have already collapsed and no history/intermediate measurement is admitted',
        'recover distinct route order after the admitted observation map assigns identical signatures to surviving distinct terminal states and no extra information enters the decoder',
        'controlled forward/observation conditions fail to predict the location of aliasing',
        'apparent recovery requires route labels, timestamps, hidden intermediate states, or candidate identity leakage'
      ],
      alternative_explanations_remaining: [
        'Both current internal contexts are authored within TD613 and are not statistically independent replications.',
        'The finite route families may be too small or clean relative to future operational systems.',
        'Terminal-state reconstruction may be insufficient for systems whose relevant history is only observable through intermediate measurements.',
        'The dynamic-versus-observational decomposition may need extension when stochastic forward processes or many-to-many measurement models are introduced.'
      ],
      claim_ceiling: 'FINITE_ROUTE_SIGNATURE_IDENTIFIABILITY_REFINEMENT_CANDIDATE_ONLY; does not establish a universal law of temporal order, causality, information, physical dynamics, quantum process tomography, connection, curvature, holonomy, Berry structure, phasons, D3 geometry, or production authority.'
    }
  });
}
