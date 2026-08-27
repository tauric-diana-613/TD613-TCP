import { blockDecomposeTqWord } from './aperture-pedagogue-target-equivalence-completeness-receipt-witness.js';
import { quotientCoordinate } from './aperture-pedagogue-target-equivalence-quotient-congruence.js';
import {
  enterCurrentQLastActionDomain,
  rehydrateReceiptPinnedRecurrenceSource,
  transportHistory,
} from './aperture-pedagogue-directed-fiber-transport-quotient-descent.js';

export const MINIMAL_ROUTE_SENSITIVE_TRANSPORT_STATE_SCHEMA = 'td613.a15-r0.aperture-pedagogue-minimal-route-sensitive-transport-state/v0.1';
export const MINIMAL_ROUTE_SENSITIVE_TRANSPORT_PARENT_RECEIPT = 'e14a4a9a7a35cac8b5c806d1f2fed4317f0effc7';

const freeze = (value) => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
};
const keyOf = (value) => JSON.stringify(value);
const trace2 = (M) => M[0][0] + M[1][1];
const SEASONS = freeze(['S0', 'S1', 'S2', 'S3']);
const Q = (n) => Array.from({ length: n }, () => 'Q');
const T = (n) => Array.from({ length: n }, () => 'T');

function sameCoordinate(a, b) {
  return a?.status === 'TARGET_EQUIVALENCE_QUOTIENT_COORDINATE_DERIVED'
    && b?.status === 'TARGET_EQUIVALENCE_QUOTIENT_COORDINATE_DERIVED'
    && a.t === b.t && a.E === b.E && a.O === b.O;
}

function wordFromBlocks(blocks) {
  if (!Array.isArray(blocks) || blocks.length === 0 || blocks.some((n) => !Number.isInteger(n) || n < 0)) {
    return freeze({ status: 'BLOCK_WORD_RECONSTRUCTION_ABSTAINS' });
  }
  const word = [];
  for (let i = 0; i < blocks.length; i += 1) {
    word.push(...Q(blocks[i]));
    if (i < blocks.length - 1) word.push('T');
  }
  return freeze({ status: 'TQ_WORD_RECONSTRUCTED_FROM_BLOCKS', word: freeze(word) });
}

export function routeSchedule(word) {
  const d = blockDecomposeTqWord(word);
  if (d.status !== 'UNIQUE_TQ_Q_BLOCK_DECOMPOSITION_DERIVED') {
    return freeze({ status: d.status });
  }
  let running = 0;
  const prefixQBeforeTicks = [];
  for (let i = 0; i < d.t; i += 1) {
    running += d.blocks[i];
    prefixQBeforeTicks.push(running);
  }
  return freeze({
    status: 'ROUTE_FAITHFUL_TQ_BLOCK_SCHEDULE_DERIVED',
    t: d.t,
    q_total: d.q_total,
    blocks: freeze([...d.blocks]),
    prefix_q_before_ticks: freeze(prefixQBeforeTicks),
    parity_coordinate: freeze({ t: d.t, E: d.E, O: d.O }),
    potential: d.potential,
  });
}

export function leanTransportObservable(sourceHistory, word) {
  const transported = transportHistory(sourceHistory, word);
  if (transported.status !== 'DIRECTED_HISTORY_TRANSPORT_DERIVED') {
    return freeze({
      status: transported.status,
      disposition: transported.disposition ?? 'ABSTAIN_BEFORE_LEAN_TRANSPORT_OBSERVABLE',
    });
  }
  const delta = transported.route_free_delta;
  return freeze({
    status: 'LEAN_ROUTE_FREE_TRANSPORT_OBSERVABLE_DERIVED',
    q_event_count: delta.custody_events.length,
    tick_scalar_responses: freeze(delta.forcing_evolution_events.map((event) => event.scalar_response)),
  });
}

export function reconstructRouteScheduleFromLean(sourceHistory, observable) {
  if (observable?.status !== 'LEAN_ROUTE_FREE_TRANSPORT_OBSERVABLE_DERIVED') {
    return freeze({ status: 'LEAN_TRANSPORT_SCHEDULE_RECONSTRUCTION_ABSTAINS' });
  }
  const t = observable.tick_scalar_responses.length;
  const qTotal = observable.q_event_count;
  const baseline = leanTransportObservable(sourceHistory, T(t));
  if (baseline.status !== 'LEAN_ROUTE_FREE_TRANSPORT_OBSERVABLE_DERIVED'
    || baseline.tick_scalar_responses.length !== t) {
    return freeze({ status: 'T_ONLY_BASELINE_TRANSPORT_ABSTAINS' });
  }

  const prefix = observable.tick_scalar_responses.map((value, i) => value - baseline.tick_scalar_responses[i]);
  const prefixLawful = prefix.every((value, i) => Number.isInteger(value)
    && value >= 0
    && value <= qTotal
    && (i === 0 || value >= prefix[i - 1]));
  if (!prefixLawful) {
    return freeze({
      status: 'LEAN_TRANSPORT_PREFIX_RECONSTRUCTION_FAILED',
      prefix_q_before_ticks: freeze(prefix),
    });
  }

  let blocks;
  if (t === 0) {
    blocks = [qTotal];
  } else {
    blocks = [prefix[0]];
    for (let i = 1; i < prefix.length; i += 1) blocks.push(prefix[i] - prefix[i - 1]);
    blocks.push(qTotal - prefix[prefix.length - 1]);
  }
  if (blocks.some((value) => !Number.isInteger(value) || value < 0)) {
    return freeze({ status: 'LEAN_TRANSPORT_BLOCK_RECONSTRUCTION_FAILED', blocks: freeze(blocks) });
  }
  const rebuilt = wordFromBlocks(blocks);
  if (rebuilt.status !== 'TQ_WORD_RECONSTRUCTED_FROM_BLOCKS') return rebuilt;

  return freeze({
    status: 'ROUTE_FAITHFUL_TQ_BLOCK_SCHEDULE_RECONSTRUCTED_FROM_LEAN_TRANSPORT',
    t,
    q_total: qTotal,
    prefix_q_before_ticks: freeze(prefix),
    blocks: freeze(blocks),
    reconstructed_word: rebuilt.word,
  });
}

function lawfulSource(season, receiptVariant = 'R1') {
  const parent = rehydrateReceiptPinnedRecurrenceSource(season, receiptVariant);
  const source = enterCurrentQLastActionDomain(parent);
  if (source?.status) return source;
  return source;
}

function reconstructionControl(source, word) {
  const actual = routeSchedule(word);
  const lean = leanTransportObservable(source, word);
  const reconstructed = reconstructRouteScheduleFromLean(source, lean);
  return freeze({
    word: freeze([...word]),
    actual,
    lean,
    reconstructed,
    passed: actual.status === 'ROUTE_FAITHFUL_TQ_BLOCK_SCHEDULE_DERIVED'
      && reconstructed.status === 'ROUTE_FAITHFUL_TQ_BLOCK_SCHEDULE_RECONSTRUCTED_FROM_LEAN_TRANSPORT'
      && keyOf(actual.blocks) === keyOf(reconstructed.blocks)
      && keyOf(word) === keyOf(reconstructed.reconstructed_word),
  });
}

function symbolicReconstructionCertificate() {
  const sourceRows = SEASONS.map((season) => {
    const source = lawfulSource(season);
    const q = transportHistory(source, ['Q']);
    const t4 = transportHistory(source, ['T', 'T', 'T', 'T']);
    const qTraceIncrement = q.status === 'DIRECTED_HISTORY_TRANSPORT_DERIVED'
      ? trace2(q.final_history.endpoint) - trace2(source.endpoint)
      : null;
    const tLastActionStable = t4.status === 'DIRECTED_HISTORY_TRANSPORT_DERIVED'
      && t4.final_history.last_action === 'Q_PHASE_PULSE';
    const tSeasonProgressionIndependentOfQ = t4.status === 'DIRECTED_HISTORY_TRANSPORT_DERIVED'
      && t4.final_history.forcing_season === source.forcing_season;
    return freeze({
      season,
      q_trace_increment: qTraceIncrement,
      q_trace_is_unit: qTraceIncrement === 1,
      t_last_action_stable: tLastActionStable,
      four_tick_season_returns: tSeasonProgressionIndependentOfQ,
    });
  });

  return freeze({
    passed: sourceRows.every((row) => row.q_trace_is_unit
      && row.t_last_action_stable
      && row.four_tick_season_returns),
    source_rows: freeze(sourceRows),
    universal_identity: 'For the j-th T, r_j^T = r0 + p_j + A_j(s): Q does not advance forcing season, every Q adds trace 1, and T preserves Q_PHASE_PULSE as last_action, so the T-only baseline supplies r0+A_j(s). Hence p_j = observed_j - baseline_j for every finite authored word.',
    reconstruction: 'The ordered prefix vector p plus q_total uniquely recovers q0=p1, qi=p(i+1)-pi, and qt=q_total-pt; t=0 reduces to q0=q_total.',
    proof_scope: 'Symbolic finite-control consequence of the frozen additive T/Q laws; concrete controls are hostile witnesses, not a finite-horizon proof.',
  });
}

function concreteReconstructionControls() {
  const words = freeze([
    freeze([]),
    freeze(['Q']),
    freeze(['T']),
    freeze(['T', 'Q']),
    freeze(['Q', 'T']),
    freeze(['T', 'T', 'T', 'T', 'Q']),
    freeze(['Q', 'T', 'T', 'T', 'T']),
    freeze(['T', 'Q', 'T', 'Q', 'T']),
    freeze(['Q', 'T', 'T', 'T', 'Q']),
    freeze(['Q', 'Q', 'T', 'Q', 'T', 'T', 'Q', 'Q']),
  ]);
  const rows = [];
  for (const season of SEASONS) {
    const source = lawfulSource(season);
    for (const word of words) rows.push(reconstructionControl(source, word));
  }
  return freeze({
    passed: rows.every((row) => row.passed),
    rows: freeze(rows),
    authority: 'HOSTILE_SANITY_ONLY_NOT_UNIVERSAL_PROOF',
  });
}

function parentObstructionHostile() {
  const u = freeze(['T', 'T', 'T', 'T', 'Q']);
  const v = freeze(['Q', 'T', 'T', 'T', 'T']);
  const cu = quotientCoordinate(u);
  const cv = quotientCoordinate(v);
  const rows = SEASONS.map((season) => {
    const source = lawfulSource(season);
    const su = routeSchedule(u);
    const sv = routeSchedule(v);
    const ju = leanTransportObservable(source, u);
    const jv = leanTransportObservable(source, v);
    return freeze({
      season,
      same_parent_coordinate: sameCoordinate(cu, cv),
      schedule_distinct: keyOf(su.blocks) !== keyOf(sv.blocks),
      lean_distinct: keyOf(ju) !== keyOf(jv),
      u_reconstructs: reconstructionControl(source, u).passed,
      v_reconstructs: reconstructionControl(source, v).passed,
    });
  });
  return freeze({
    passed: sameCoordinate(cu, cv) && rows.every((row) => row.schedule_distinct
      && row.lean_distinct && row.u_reconstructs && row.v_reconstructs),
    coordinate: freeze({ t: cu.t, E: cu.E, O: cu.O }),
    rows: freeze(rows),
  });
}

function firstMomentHostile() {
  const u = freeze(['T', 'Q', 'T', 'Q', 'T']);
  const v = freeze(['Q', 'T', 'T', 'T', 'Q']);
  const du = blockDecomposeTqWord(u);
  const dv = blockDecomposeTqWord(v);
  const sameAugmentedScalar = du.status === 'UNIQUE_TQ_Q_BLOCK_DECOMPOSITION_DERIVED'
    && dv.status === 'UNIQUE_TQ_Q_BLOCK_DECOMPOSITION_DERIVED'
    && du.t === dv.t && du.E === dv.E && du.O === dv.O
    && du.q_total === dv.q_total && du.potential === dv.potential;
  const rows = SEASONS.map((season) => {
    const source = lawfulSource(season);
    const ju = leanTransportObservable(source, u);
    const jv = leanTransportObservable(source, v);
    return freeze({
      season,
      lean_distinct: keyOf(ju) !== keyOf(jv),
      u_reconstructs: reconstructionControl(source, u).passed,
      v_reconstructs: reconstructionControl(source, v).passed,
    });
  });
  return freeze({
    passed: sameAugmentedScalar && rows.every((row) => row.lean_distinct
      && row.u_reconstructs && row.v_reconstructs),
    u_blocks: freeze([...du.blocks]),
    v_blocks: freeze([...dv.blocks]),
    shared: freeze({ t: du.t, E: du.E, O: du.O, q_total: du.q_total, potential: du.potential }),
    rows: freeze(rows),
    classification: sameAugmentedScalar
      ? 'PARITY_QUOTIENT_PLUS_FIRST_BLOCK_MOMENT_REMAINS_TRANSPORT_INSUFFICIENT'
      : 'PREREGISTERED_FIRST_MOMENT_HOSTILE_MALFORMED',
  });
}

function receiptExternalityControl() {
  const a = lawfulSource('S0', 'R1');
  const b = lawfulSource('S0', 'R1_DUP');
  const word = freeze(['T', 'Q', 'T', 'Q', 'T']);
  const ta = transportHistory(a, word);
  const tb = transportHistory(b, word);
  const ja = leanTransportObservable(a, word);
  const jb = leanTransportObservable(b, word);
  const ra = reconstructRouteScheduleFromLean(a, ja);
  const rb = reconstructRouteScheduleFromLean(b, jb);
  return freeze({
    passed: ta.status === 'DIRECTED_HISTORY_TRANSPORT_DERIVED'
      && tb.status === 'DIRECTED_HISTORY_TRANSPORT_DERIVED'
      && ta.final_history.receipt_variant === 'R1'
      && tb.final_history.receipt_variant === 'R1_DUP'
      && keyOf(ta.route_free_delta) === keyOf(tb.route_free_delta)
      && keyOf(ja) === keyOf(jb)
      && keyOf(ra.blocks) === keyOf(rb.blocks),
    receipt_distinction_preserved: ta.final_history.receipt_variant !== tb.final_history.receipt_variant,
    route_free_payload_equal: keyOf(ta.route_free_delta) === keyOf(tb.route_free_delta),
    lean_observable_equal: keyOf(ja) === keyOf(jb),
    reconstructed_schedule_equal: keyOf(ra.blocks) === keyOf(rb.blocks),
  });
}

function minimalityCertificate(symbolic) {
  return freeze({
    passed: symbolic.passed,
    exact_transport_kernel: symbolic.passed ? 'TRIVIAL_ROUTE_IDENTITY_KERNEL' : 'NOT_ESTABLISHED',
    canonical_coordinate: 'S(w)=(t,q_total;p_1,...,p_t), equivalently B(w)=(t;q_0,...,q_t)',
    implication: 'If exact route-free deltas are equal from one fixed retained source, their lean subobservables J_h are equal. Symbolic reconstruction then gives identical block schedules and therefore identical T/Q words.',
    quotient_order_consequence: 'Any representation sufficient for exact route-free transport must be injective on route schedules. Bijective recodings are allowed; a genuine many-to-one route quotient is not.',
    fixed_dimension_claim: false,
  });
}

export function runMinimalRouteSensitiveTransportStateAssay() {
  const symbolic = symbolicReconstructionCertificate();
  const concrete = concreteReconstructionControls();
  const parentHostile = parentObstructionHostile();
  const momentHostile = firstMomentHostile();
  const receipt = receiptExternalityControl();
  const minimality = minimalityCertificate(symbolic);

  const passed = symbolic.passed
    && concrete.passed
    && parentHostile.passed
    && momentHostile.passed
    && receipt.passed
    && minimality.passed;

  return freeze({
    schema: MINIMAL_ROUTE_SENSITIVE_TRANSPORT_STATE_SCHEMA,
    passed,
    status: passed
      ? 'MINIMAL_ROUTE_SENSITIVE_TRANSPORT_STATE_ROUND_CLOSED'
      : 'MINIMAL_ROUTE_SENSITIVE_TRANSPORT_STATE_AUDITION_FAILED',
    canonical_classification: passed
      ? 'EXACT_ROUTE_FREE_TRANSPORT_HAS_TRIVIAL_ROUTE_KERNEL_AND_REQUIRES_ROUTE_FAITHFUL_TQ_BLOCK_SCHEDULE'
      : 'LEAN_TRANSPORT_OBSERVABLE_DOES_NOT_SEPARATE_ALL_AUTHORED_ROUTE_SCHEDULES',
    symbolic_reconstruction: symbolic,
    concrete_controls: concrete,
    parent_obstruction_hostile: parentHostile,
    first_moment_hostile: momentHostile,
    receipt_externality: receipt,
    minimality,
    no_h8_farming: true,
    claim_ceiling: freeze({
      cocycle: false,
      cohomology: false,
      connection: false,
      differential_geometric_parallel_transport: false,
      inverse_transport: false,
      inverse_morphisms: false,
      groupoid: false,
      closed_nonidentity_loop: false,
      loop_endomorphism: false,
      holonomy: false,
      curvature: false,
      berry_or_quantum: false,
      manifold_fiber_bundle: false,
      fixed_finite_dimensional_transport_state: false,
      proto_loom: false,
      a16: false,
      live_ash_mutation: false,
      merge: false,
      production: false,
      vercel: false,
    }),
    human_stop: 'HUMAN_𝄐_REQUIRED_BEFORE_ANY_TRANSPORT_INCREMENT_COCYCLE_OR_WEAKER_OBSERVABLE_QUOTIENT_AUDITION',
  });
}
