import { freeze, integer, ratio, text } from './aperture-v31-core.js';

export const REFERENCE_LAYER_SCHEMA = 'td613.aperture.reference-layer-tomography/v0.1';

export function estimateReferenceLayers({ pairs, flatThresholdNumerator = 1, flatThresholdDenominator = 100 }) {
  if (!Array.isArray(pairs) || pairs.length === 0) throw new Error('Reference-layer estimation requires declared pairs.');
  const estimates = pairs.map(pair => {
    const deltaInput = integer(pair.deltaInput, 'Reference delta input');
    if (deltaInput === 0) throw new Error('Reference delta input may not be zero.');
    const deltaOutput = integer(pair.deltaOutput, 'Reference delta output');
    const absoluteInput = Math.abs(deltaInput);
    const absoluteOutput = Math.abs(deltaOutput);
    const plateau = absoluteOutput * flatThresholdDenominator < absoluteInput * flatThresholdNumerator;
    return {
      reference_stratum: text(pair.referenceStratum, 'Reference stratum'),
      varied_stratum: text(pair.variedStratum, 'Varied stratum'),
      delta_input: deltaInput,
      delta_output: deltaOutput,
      cross_response: ratio(deltaOutput, absoluteInput),
      state: plateau ? 'RESPONSE_PLATEAU' : pair.discontinuity === true ? 'RESPONSE_GAP_CANDIDATE' : 'BOUNDED_CROSS_RESPONSE',
      source_status: pair.sourceStatus || 'DERIVED'
    };
  });
  return freeze({
    schema: REFERENCE_LAYER_SCHEMA,
    estimates,
    strata_merged: false,
    scope_statement: 'Bounded cross-response estimate between separately identified strata.',
    cannot_establish: ['hidden communication', 'collusion', 'causal transfer', 'total coupling']
  });
}
