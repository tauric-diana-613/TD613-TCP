import { freeze, integer, ratio, text } from './aperture-v31-core.js';

export const SHARED_LAYER_SCHEMA = 'td613.aperture.shared-layer-relaxation/v0.1';

export function estimateSharedLayerBurden({ sharedLayer, adjustments, normalizer, humanAnalogyDeclared = false, analogyLimits = [] }) {
  if (!Array.isArray(adjustments) || adjustments.length < 2) throw new Error('Shared-layer burden requires at least two declared strata.');
  const normalized = adjustments.map(value => ({ stratum_id: text(value.stratumId, 'Stratum ID'), adjustment: integer(value.adjustment, 'Adjustment') }));
  const pairwise = [];
  for (let left = 0; left < normalized.length; left += 1) {
    for (let right = left + 1; right < normalized.length; right += 1) {
      pairwise.push({ strata: [normalized[left].stratum_id, normalized[right].stratum_id], absolute_difference: Math.abs(normalized[left].adjustment - normalized[right].adjustment) });
    }
  }
  const numerator = pairwise.reduce((sum, value) => sum + value.absolute_difference, 0);
  const denominator = integer(normalizer, 'Shared-layer normalizer', { min: 1 });
  const state = numerator * 4 <= denominator ? 'LOW_COOPERATIVE' : numerator <= denominator ? 'MODERATE_ACCOMMODATION' : 'HIGH_COMPETING_DEMANDS';
  if (humanAnalogyDeclared && (!Array.isArray(analogyLimits) || analogyLimits.length === 0)) throw new Error('Human shared-layer analogy requires explicit limits.');
  return freeze({
    schema: SHARED_LAYER_SCHEMA,
    shared_layer: text(sharedLayer, 'Shared layer'),
    adjustments: normalized,
    pairwise_differences: pairwise,
    burden: ratio(numerator, denominator),
    state,
    human_analogy_declared: humanAnalogyDeclared === true,
    analogy_limits: (analogyLimits || []).map(String),
    evidence_basis: ['declared stratum adjustments', 'exact pairwise differences'],
    observations: pairwise, missingness: [], alternatives: [], open_questions: [], operator_notes: [], closure: { required: true, status: 'OPEN' }
  });
}
