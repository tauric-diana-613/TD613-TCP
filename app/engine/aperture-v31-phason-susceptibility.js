import { freeze, integer, ratio } from './aperture-v31-core.js';

export const PHASON_SUSCEPTIBILITY_SCHEMA = 'td613.aperture.phason-susceptibility/v0.1';

export function estimatePhasonSusceptibility({ trials, shamResponse = 0, reversalDifference = 0, hysteresisThreshold = 0 }) {
  if (!Array.isArray(trials) || trials.length < 2) throw new Error('Phason susceptibility requires repeated perturbations.');
  const normalized = trials.map((value, index) => ({
    trial: index + 1,
    delta_coordinate: integer(value.deltaCoordinate, 'Coordinate displacement'),
    delta_observation: integer(value.deltaObservation, 'Observation displacement')
  }));
  if (normalized.some(value => value.delta_coordinate === 0)) throw new Error('Coordinate displacement may not be zero.');
  const numerator = normalized.reduce((sum, value) => sum + Math.abs(value.delta_observation), 0);
  const denominator = normalized.reduce((sum, value) => sum + Math.abs(value.delta_coordinate), 0);
  const sham = Math.abs(integer(shamResponse, 'Sham response'));
  const hysteretic = Math.abs(integer(reversalDifference, 'Reversal difference')) > integer(hysteresisThreshold, 'Hysteresis threshold', { min: 0 });
  let state = 'PHASON_LINEAR_RESPONSE';
  if (numerator === 0) state = 'PHASON_INSENSITIVE';
  else if (hysteretic) state = 'PHASON_HYSTERETIC';
  else if (numerator >= denominator * 2 && numerator > sham * 2) state = 'PHASON_DOMINANT_CANDIDATE';
  else if (normalized.some(value => Math.abs(value.delta_observation) >= Math.abs(value.delta_coordinate) * 2)) state = 'PHASON_THRESHOLD_RESPONSE';
  return freeze({
    schema: PHASON_SUSCEPTIBILITY_SCHEMA,
    trials: normalized,
    susceptibility: ratio(numerator, denominator),
    sham_response: sham,
    reversal_difference: reversalDifference,
    state,
    controls: { repeated: true, sham_present: true, reversal_checked: true, hysteresis_checked: true },
    scope_statement: 'Sensitivity of observed output to a controlled registry displacement.',
    cannot_establish: ['physical phonon', 'electrical charge', 'Chern invariant', 'surveillance', 'intent', 'causal monopoly']
  });
}
