import { runBooleanSynergyCensus } from './boolean-synergy-census.js';
import { deepFreeze } from './a15-r0-contracts.js';

export const BOOLEAN_MOBIUS_INTERACTION_SCHEMA = 'td613.ash.a15-r0.boolean-mobius-interaction/v0.1';

const round = value => Number(value.toFixed(6));

export function secondMixedBooleanDifference(truthTable) {
  if (!Array.isArray(truthTable) || truthTable.length !== 4) {
    throw new TypeError('Second mixed Boolean difference requires [f00,f01,f10,f11].');
  }
  const values = truthTable.map(Number);
  if (values.some(value => !Number.isFinite(value))) {
    throw new TypeError('Second mixed Boolean difference requires finite values.');
  }
  const [f00, f01, f10, f11] = values;
  return f11 - f10 - f01 + f00;
}

function groupByMagnitude(functions) {
  const groups = new Map();
  for (const item of functions) {
    const magnitude = Math.abs(item.mobius_interaction_coefficient);
    const current = groups.get(magnitude) || [];
    current.push(item);
    groups.set(magnitude, current);
  }
  return [...groups.entries()]
    .sort(([left], [right]) => left - right)
    .map(([magnitude, members]) => {
      const synergyLevels = [...new Set(members.map(item => item.joining_synergy_proxy_bits))].sort((a, b) => a - b);
      return deepFreeze({
        absolute_mobius_interaction: magnitude,
        function_count: members.length,
        function_ids: members.map(item => item.function_id),
        joining_synergy_levels_bits: synergyLevels,
        single_synergy_level_within_group: synergyLevels.length === 1
      });
    });
}

export function runBooleanMobiusInteractionAssay(options = {}) {
  const census = options.booleanCensus || runBooleanSynergyCensus();
  if (census.complete_declared_family !== true || census.function_count !== 16) {
    throw new TypeError('Complete 16-function Boolean census required.');
  }

  const functions = census.functions.map(item => {
    const coefficient = secondMixedBooleanDifference(item.truth_table_00_01_10_11);
    return deepFreeze({
      function_id: item.function_id,
      mask: item.mask,
      truth_table_00_01_10_11: [...item.truth_table_00_01_10_11],
      mobius_interaction_coefficient: coefficient,
      absolute_mobius_interaction: Math.abs(coefficient),
      joining_synergy_proxy_bits: item.joining_synergy_proxy_bits,
      pure_synergy: item.pure_synergy,
      positive_excess: item.positive_excess
    });
  });

  const magnitudeGroups = groupByMagnitude(functions);
  const exactLevelMapping = magnitudeGroups.every(group => group.single_synergy_level_within_group);
  const orderedLevels = magnitudeGroups.map(group => ({
    magnitude: group.absolute_mobius_interaction,
    synergy: group.joining_synergy_levels_bits[0]
  }));
  const strictlyMonotone = exactLevelMapping && orderedLevels.every((item, index) => {
    if (index === 0) return true;
    return item.synergy > orderedLevels[index - 1].synergy;
  });
  const zeroMagnitudeMatchesZeroExcess = functions.every(item =>
    (item.absolute_mobius_interaction === 0) === (item.joining_synergy_proxy_bits === 0)
  );
  const parityMagnitude = functions
    .filter(item => item.function_id.includes('_XOR') || item.function_id.includes('_XNOR'))
    .map(item => item.absolute_mobius_interaction);

  return deepFreeze({
    schema: BOOLEAN_MOBIUS_INTERACTION_SCHEMA,
    source_status: 'SIMULATED_EXHAUSTIVE_FINITE_CENSUS',
    authority_class: 'A2_DERIVATIONAL',
    domain: 'Boolean square {0,1}^2 with deterministic binary-valued functions and uniform input measure',
    operator: 'second-order Boolean-lattice Mobius interaction / mixed finite difference',
    operator_formula: 'Delta_AB f = f(1,1) - f(1,0) - f(0,1) + f(0,0)',
    interaction_order: 2,
    function_count: functions.length,
    magnitude_groups: magnitudeGroups,
    functions,
    exact_synergy_level_by_absolute_mobius_magnitude: exactLevelMapping,
    strictly_monotone_synergy_across_mobius_magnitude_levels: strictlyMonotone,
    zero_mobius_magnitude_iff_zero_joining_excess_in_declared_family: zeroMagnitudeMatchesZeroExcess,
    xor_xnor_absolute_mobius_magnitude: parityMagnitude[0] ?? null,
    xor_xnor_share_maximum_magnitude: parityMagnitude.length === 2 && parityMagnitude.every(value => value === Math.max(...functions.map(item => item.absolute_mobius_interaction))),
    algebraic_lineage: 'Möbius inversion / alternating inclusion-exclusion on a subset lattice; same operator family as TD613 bounded higher-order interference.',
    discrete_mixed_derivative_declared: true,
    discrete_hessian_interpretation_available: true,
    riemannian_metric_declared: false,
    affine_connection_declared: false,
    curvature_tensor_declared: false,
    intrinsic_geometric_curvature_claim: false,
    synergy_equals_mobius_coefficient_claim: false,
    generalization_beyond_declared_boolean_family: false,
    finding: 'Within the complete declared 2x2 deterministic Boolean family, absolute second-order Möbius interaction exactly partitions the functions into the same three joining-excess levels: |Delta_AB f|=0 -> 0 bits, 1 -> 0.188722 bits, and 2 -> 1 bit. This supplies a non-arbitrary discrete interaction coordinate, not a Riemannian curvature quantity.',
    caveat: 'The observed level correspondence is exact only for this finite family under the uniform input measure. The Möbius coefficient and information quantity have different units and are not identified. A metric, connection, and curvature construction remain unmeasured.'
  });
}
