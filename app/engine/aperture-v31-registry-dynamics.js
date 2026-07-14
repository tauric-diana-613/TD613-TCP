import { freeze, integer, text } from './aperture-v31-core.js';

export const REGISTRY_SELECTION_SCHEMA = 'td613.aperture.registry-selection/v0.1';

export function estimateRegistryDynamics({ globalConfiguration, orientations, localRegistries, jumpThreshold = 100, commensurationMismatch = null, commensurationThreshold = 100 }) {
  if (!Array.isArray(orientations) || orientations.length < 2) throw new Error('Registry dynamics requires at least two orientations.');
  if (!Array.isArray(localRegistries) || localRegistries.length !== orientations.length) throw new Error('Local registries must align with orientations.');
  const theta = orientations.map((value, index) => integer(value, `Orientation ${index}`));
  const rho = localRegistries.map((value, index) => integer(value, `Registry ${index}`));
  const nonzeroSigns = theta.filter(Boolean).map(value => Math.sign(value));
  const sequenceClass = nonzeroSigns.length && nonzeroSigns.every(value => value === nonzeroSigns[0])
    ? 'HELICAL'
    : nonzeroSigns.slice(1).every((value, index) => value !== nonzeroSigns[index]) ? 'ALTERNATE' : 'MIXED';
  const jumps = rho.slice(1).map((value, index) => ({
    from_index: index,
    to_index: index + 1,
    delta: value - rho[index],
    jump: Math.abs(value - rho[index]) > integer(jumpThreshold, 'Jump threshold', { min: 0 })
  }));
  let commensurationState = 'UNRESOLVED';
  if (commensurationMismatch != null) {
    const mismatch = integer(commensurationMismatch, 'Commensuration mismatch', { min: 0 });
    commensurationState = mismatch < commensurationThreshold ? 'NEAR_COMMENSURATE' : 'INCOMMENSURATE';
  }
  return freeze({
    schema: REGISTRY_SELECTION_SCHEMA,
    global_configuration: text(globalConfiguration, 'Global configuration'),
    sequence_class: sequenceClass,
    orientations: theta,
    local_registries: rho,
    registry_jumps: jumps,
    jump_count: jumps.filter(value => value.jump).length,
    commensuration_state: commensurationState,
    symmetry_registry_equated: false,
    evidence_basis: ['declared orientation sequence', 'declared local registry sequence'],
    observations: jumps, missingness: commensurationMismatch == null ? ['commensuration mismatch'] : [], alternatives: [], open_questions: [], operator_notes: [], closure: { required: true, status: 'OPEN' }
  });
}
