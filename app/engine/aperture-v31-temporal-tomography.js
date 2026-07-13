import { freeze, ratio } from './aperture-v31-core.js';

export const TEMPORAL_ROUTE_SCHEMA = 'td613.aperture.temporal-route-object/v0.1';

export function estimateTemporalRoute(lattice) {
  const usable = lattice.entries.filter(value => value.observed_value != null && !value.held_out);
  const byTime = new Map();
  usable.forEach(value => {
    const current = byTime.get(value.time_index) || { sum: 0, count: 0 };
    current.sum += value.observed_value; current.count += 1; byTime.set(value.time_index, current);
  });
  const marginals = [...byTime.entries()].sort(([a], [b]) => a - b).map(([time, value]) => ({ time_index: time, estimate: ratio(value.sum, value.count), sample_count: value.count }));
  const transitions = marginals.slice(1).map((value, index) => ({
    from_time: marginals[index].time_index,
    to_time: value.time_index,
    delta_numerator: value.estimate.numerator * marginals[index].estimate.denominator - marginals[index].estimate.numerator * value.estimate.denominator,
    delta_denominator: value.estimate.denominator * marginals[index].estimate.denominator,
    state: 'TRANSITION_ESTIMATED'
  }));
  const state = marginals.length < 2 ? 'TRANSITION_NONIDENTIFIABLE' : lattice.coverage.state === 'COVERAGE_BOUNDED_COMPLETE' ? 'TRANSITION_ESTIMATED' : 'TRANSITION_PARTIAL';
  return freeze({
    schema: TEMPORAL_ROUTE_SCHEMA,
    state,
    temporal_marginals: marginals,
    transition_slices: transitions,
    declared_clock: 'time_index',
    quantum_temporal_state: false,
    backward_causation_claimed: false,
    scope_statement: 'Classical bounded multi-time route estimate from the declared snapshot lattice.',
    cannot_establish: ['quantum temporal state', 'backward causation', 'time travel', 'total causal order']
  });
}
