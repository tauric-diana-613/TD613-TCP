// Finite, declared synthetic populations only. No sampling estimator or live capture.
export const FINITE_CHANNEL_SCHEMA = 'td613.loom.finite-channel/v0.1';
const ROUTES = ['control', 'protected'];
const MAX_ROWS = 1024;
const MAX_CHANNELS = 6;
const has = (object, key) => Object.hasOwn(object, key);
const scalar = value => value === null || typeof value === 'boolean' ||
  (typeof value === 'string' && value.length <= 256) || Number.isSafeInteger(value);
const tuple = values => JSON.stringify(values); // Retains scalar type and tuple boundaries.
const closeZero = value => Math.abs(value) < 1e-12 ? 0 : value;
export function freezeFinite(value) {
  if (value && typeof value === 'object') {
    Object.values(value).forEach(freezeFinite);
    Object.freeze(value);
  }
  return value;
}

function validate(model, selected) {
  const errors = [];
  const fail = message => errors.push(message);
  if (!model || model.schema !== FINITE_CHANNEL_SCHEMA || model.evidence_class !== 'SYNTHETIC_ENUMERATED') {
    return ['Only an explicitly declared synthetic finite population is admitted.'];
  }
  if (!Array.isArray(model.rows) || !model.rows.length || model.rows.length > MAX_ROWS ||
      !Array.isArray(model.channels) || !model.channels.length || model.channels.length > MAX_CHANNELS) {
    return ['Declare 1–1024 population rows and 1–6 channels.'];
  }
  const ids = new Set();
  for (const channel of model.channels) {
    if (!channel || typeof channel.id !== 'string' || !/^[a-z][a-z0-9_]{0,31}$/.test(channel.id) || ids.has(channel.id)) {
      fail('Channel identities must be unique bounded identifiers.'); continue;
    }
    ids.add(channel.id);
    for (const route of ROUTES) {
      if (!['CAPTURED', 'MISSING'].includes(channel.capture?.[route])) fail(`Capture status missing: ${route}/${channel.id}.`);
    }
  }
  if (!Array.isArray(selected) || new Set(selected).size !== selected.length || selected.some(id => !ids.has(id))) {
    fail('Selected observer channels must be a unique subset of the declared boundary.');
  }
  const rowIds = new Set();
  let weight = 0;
  for (const row of model.rows) {
    if (!row || typeof row.id !== 'string' || !row.id.length || row.id.length > 128 || rowIds.has(row.id)) {
      fail('Population row identities must be unique.'); continue;
    }
    rowIds.add(row.id);
    if (!Number.isSafeInteger(row.weight) || row.weight <= 0) fail(`Positive integer mass required: ${row.id}.`);
    weight += row.weight;
    for (const key of ['secret', 'baseline', 'auxiliary', 'permitted', 'expected']) {
      if (!has(row, key) || !scalar(row[key])) fail(`Explicit scalar required: ${row.id}/${key}.`);
    }
    for (const route of ROUTES) {
      const record = row[route];
      if (!record || !has(record, 'answer') || !scalar(record.answer) || !record.trace || typeof record.trace !== 'object' || Array.isArray(record.trace)) {
        fail(`Malformed route record: ${row.id}/${route}.`); continue;
      }
      if (Object.keys(record.trace).some(id => !ids.has(id))) fail(`Undeclared trace channel: ${row.id}/${route}.`);
      for (const channel of model.channels) {
        if (!channel || !ids.has(channel.id)) continue;
        const captured = channel.capture?.[route] === 'CAPTURED';
        if (captured && (!has(record.trace, channel.id) || !scalar(record.trace[channel.id]))) {
          fail(`Captured value absent or invalid: ${row.id}/${route}/${channel.id}.`);
        }
        if (!captured && has(record.trace, channel.id)) fail(`Missing channel contains a fabricated value: ${row.id}/${route}/${channel.id}.`);
      }
    }
  }
  if (!Number.isSafeInteger(weight)) fail('Total population mass exceeds safe integer arithmetic.');
  return errors;
}

function distribution(rows, project) {
  const masses = new Map();
  for (const row of rows) {
    const key = tuple(project(row));
    masses.set(key, (masses.get(key) || 0) + row.weight);
  }
  return masses;
}
function entropy(rows, mass, project) {
  let result = 0;
  for (const weight of distribution(rows, project).values()) {
    const probability = weight / mass;
    result -= probability * Math.log2(probability);
  }
  return result;
}
function recovery(rows, mass, view) {
  const cells = new Map();
  for (const row of rows) {
    const key = tuple(view(row)), secret = tuple([row.secret]);
    if (!cells.has(key)) cells.set(key, new Map());
    const cell = cells.get(key);
    cell.set(secret, (cell.get(secret) || 0) + row.weight);
  }
  return [...cells.values()].reduce((sum, cell) => sum + Math.max(...cell.values()), 0) / mass;
}

/** Enumerate the declared law. `permitted` is never silently added to observer knowledge. */
export function analyzeFiniteChannel(model, selected) {
  if (selected === undefined) selected = Array.isArray(model?.channels) ? model.channels.map(channel => channel?.id) : undefined;
  const errors = validate(model, selected);
  const ceiling = {
    evidence_class: 'SYNTHETIC_ENUMERATED', empirical_credit: 0,
    golden_egg: 'UNEARNED', empirical_contract: 'HELD', release_authority: false,
    scope: 'Only the declared population and selected channels; no real-conversation privacy claim.',
    arithmetic: 'Integer probability masses; floating-point logarithms; values below 1e-12 displayed as zero.'
  };
  if (errors.length) return freezeFinite({ schema: 'td613.loom.observer-analysis/v0.1', status: 'INADMISSIBLE', errors, ceiling });
  const rows = model.rows, mass = rows.reduce((sum, row) => sum + row.weight, 0);
  const h = entropy(rows, mass, row => [row.secret]);
  const prior = row => [row.baseline, row.auxiliary];
  const info = view => closeZero(h + entropy(rows, mass, view) - entropy(rows, mass, row => [row.secret, ...view(row)]));
  const baseline = info(prior), priorRecovery = recovery(rows, mass, prior);
  const routes = Object.fromEntries(ROUTES.map(route => {
    const missing = selected.filter(id => model.channels.find(channel => channel.id === id).capture[route] !== 'CAPTURED');
    const captured = selected.filter(id => !missing.includes(id));
    const view = ids => row => [...prior(row), ...ids.map(id => row[route].trace[id])];
    const measure = ids => {
      const total = info(view(ids));
      return { channels: [...ids], baseline_bits: baseline, additional_bits: closeZero(total - baseline),
        total_bits: total, remaining_bits: closeZero(h - total),
        baseline_recovery: priorRecovery, total_recovery: recovery(rows, mass, view(ids)) };
    };
    const subsets = [];
    for (let mask = 0; mask < 2 ** captured.length; mask++) {
      subsets.push(measure(captured.filter((_, index) => mask & (1 << index))));
    }
    const observed = measure(captured);
    const full = missing.length ? null : observed;
    let last = baseline;
    const sequence = captured.map((id, index) => {
      const total = measure(captured.slice(0, index + 1)).total_bits;
      const increment = closeZero(total - last); last = total;
      return { channel: id, conditional_increment_bits: increment, cumulative_total_bits: total };
    });
    const marginalSum = captured.reduce((sum, id) => sum + measure([id]).additional_bits, 0);
    return [route, {
      status: missing.length ? 'HELD_MISSING_CHANNELS' : 'SYNTHETIC_CALCULATED', missing_channels: missing,
      selected_view: full, captured_subview: observed, subsets,
      captured_sequence: sequence,
      signed_excess_bits: full ? closeZero(full.additional_bits - marginalSum) : null,
      authorized_accuracy: rows.reduce((sum, row) => sum + (tuple([row[route].answer]) === tuple([row.expected]) ? row.weight : 0), 0) / mass
    }];
  }));
  return freezeFinite({ schema: 'td613.loom.observer-analysis/v0.1',
    status: ROUTES.some(route => routes[route].missing_channels.length) ? 'HELD_MISSING_CHANNELS' : 'SYNTHETIC_CALCULATED',
    case_id: model.id, selected_channels: [...selected], population_rows: rows.length, population_mass: mass,
    secret_entropy_bits: h, baseline_bits: baseline, routes, ceiling,
    comparison: 'Two modeled routes share each population row. This is not an observed empirical matched return.'
  });
}
