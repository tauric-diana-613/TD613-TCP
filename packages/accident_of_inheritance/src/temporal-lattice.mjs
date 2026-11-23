/**
 * 𝌋 TD613 · THE ACCIDENT OF INHERITANCE (Palace of Unborn Futures, Act II)
 * Eight-Coordinate Non-Retroactive Temporal Lattice, Availability Membrane &
 * Proxy-Instrumented Dynamic Secret-Vault Access Ledger
 *
 * Enforces Section II & Section IX.3–IX.4 fail-closed invariants:
 *   - t_event <= t_observed <= t_admitted <= t_available
 *   - t_decision <= t_action
 *   - Decisions at t_decision may access ONLY records with t_available <= t_decision
 *   - Dynamic JavaScript Proxy intercepts every secret-vault property read and throws
 *     DYNAMIC_VAULT_ACCESS_VIOLATION if read outside an authorized simulator/oracle/scorer scope.
 *
 * Authority: SAC[X6ZNK5NO51] · Covenant: Khona‌lit-po
 */

import { deepFreeze, round4 } from './prng.mjs';

export function assertValidTemporalStamp(stamp, contextLabel = 'record') {
  if (!stamp || typeof stamp !== 'object') {
    throw new TypeError(`[TEMPORAL_SCHEMA_VIOLATION] Missing temporal_coordinates on ${contextLabel}`);
  }
  const {
    t_event,
    t_observed,
    t_admitted,
    t_available,
    t_decision = null,
    t_action = null,
    t_contradiction = null,
    t_correction = null,
  } = stamp;

  for (const [k, v] of [
    ['t_event', t_event],
    ['t_observed', t_observed],
    ['t_admitted', t_admitted],
    ['t_available', t_available],
  ]) {
    if (!Number.isSafeInteger(v)) {
      throw new TypeError(`[TEMPORAL_SCHEMA_VIOLATION] ${k} must be a safe integer on ${contextLabel}, got ${v}`);
    }
  }

  for (const [k, v] of [
    ['t_decision', t_decision],
    ['t_action', t_action],
    ['t_contradiction', t_contradiction],
    ['t_correction', t_correction],
  ]) {
    if (v !== null && !Number.isSafeInteger(v)) {
      throw new TypeError(`[TEMPORAL_SCHEMA_VIOLATION] ${k} must be null or safe integer on ${contextLabel}, got ${v}`);
    }
  }

  if (t_observed < t_event) {
    throw new RangeError(
      `[TEMPORAL_RETROACTIVITY_VIOLATION] ${contextLabel}: t_observed (${t_observed}) < t_event (${t_event})`
    );
  }
  if (t_admitted < t_observed) {
    throw new RangeError(
      `[TEMPORAL_RETROACTIVITY_VIOLATION] ${contextLabel}: t_admitted (${t_admitted}) < t_observed (${t_observed})`
    );
  }
  if (t_available < t_admitted) {
    throw new RangeError(
      `[TEMPORAL_RETROACTIVITY_VIOLATION] ${contextLabel}: t_available (${t_available}) < t_admitted (${t_admitted})`
    );
  }
  if (t_decision !== null && t_decision < t_available) {
    throw new RangeError(
      `[TEMPORAL_RETROACTIVITY_VIOLATION] ${contextLabel}: t_decision (${t_decision}) < t_available (${t_available})`
    );
  }
  if (t_decision !== null && t_action !== null && t_action < t_decision) {
    throw new RangeError(
      `[TEMPORAL_RETROACTIVITY_VIOLATION] ${contextLabel}: t_action (${t_action}) < t_decision (${t_decision})`
    );
  }
  return true;
}

export function createTemporalStamp({
  t_event,
  t_observed,
  t_admitted,
  t_available = t_admitted,
  t_decision = null,
  t_action = null,
  t_contradiction = null,
  t_correction = null,
}, contextLabel = 'record') {
  const stamp = {
    t_event,
    t_observed,
    t_admitted,
    t_available,
    t_decision,
    t_action,
    t_contradiction,
    t_correction,
  };
  assertValidTemporalStamp(stamp, contextLabel);
  return Object.freeze(stamp);
}

/**
 * Enforces non-retroactive access at decision tick `tDecision`.
 * Strips any queued observation with `t_available > tDecision` and double-checks all visible records.
 */
export class AvailabilityMembrane {
  constructor(initialHistoricalClaims = []) {
    this._allQueuedRecords = [];
    this.non_retroactivity_checks = 0;
    this.withheld_future_records_count = 0;
    for (const c of initialHistoricalClaims) {
      assertValidTemporalStamp(c.temporal_coordinates, c.claim_id);
      if (c.temporal_coordinates.t_available > 0) {
        throw new RangeError(
          `[TEMPORAL_RETROACTIVITY_VIOLATION] Historical claim ${c.claim_id} has positive t_available=${c.temporal_coordinates.t_available}`
        );
      }
      this._allQueuedRecords.push(c);
    }
  }

  enqueueObservation(obsRecord) {
    assertValidTemporalStamp(obsRecord.temporal_coordinates, obsRecord.obs_id);
    this._allQueuedRecords.push(obsRecord);
  }

  getAuthorizedRecordsAt(tDecision, { onlyEpisodeObservations = false } = {}) {
    if (!Number.isSafeInteger(tDecision)) {
      throw new TypeError(`tDecision must be a safe integer, got ${tDecision}`);
    }
    const visible = [];
    for (const rec of this._allQueuedRecords) {
      if (onlyEpisodeObservations && rec.record_kind !== 'EPISODE_OBSERVATION') continue;
      this.non_retroactivity_checks += 1;
      assertValidTemporalStamp(rec.temporal_coordinates, rec.obs_id || rec.claim_id);
      if (rec.temporal_coordinates.t_available <= tDecision) {
        if (rec.temporal_coordinates.t_observed > tDecision || rec.temporal_coordinates.t_event > tDecision) {
          throw new RangeError(
            `[TEMPORAL_RETROACTIVITY_VIOLATION] Record ${rec.obs_id || rec.claim_id} violates event/obs <= tDecision (${tDecision})`
          );
        }
        visible.push(rec);
      } else {
        this.withheld_future_records_count += 1;
      }
    }
    visible.sort((a, b) => {
      const da = a.temporal_coordinates.t_available - b.temporal_coordinates.t_available;
      if (da !== 0) return da;
      const de = a.temporal_coordinates.t_event - b.temporal_coordinates.t_event;
      if (de !== 0) return de;
      const idA = a.obs_id || a.claim_id || '';
      const idB = b.obs_id || b.claim_id || '';
      return idA < idB ? -1 : idA > idB ? 1 : 0;
    });
    return visible;
  }
}

export function computeDimensionlessNumbers({ h, tau, nu }) {
  return {
    chi: round4(h * tau),
    kappa: round4(nu * tau),
  };
}

export function computeDelayDecomposition({
  tShiftEvent,
  tContradictionObserved,
  tContradictionAdmitted,
  tContradictionAvailable,
  tCorrection,
  horizonTicks,
}) {
  if (tShiftEvent === null || tContradictionAvailable === null) {
    return {
      has_actionable_contradiction: false,
      delta_obs_ticks: null,
      delta_adm_ticks: null,
      delta_avail_ticks: null,
      empirical_access_delay_ticks: null,
      policy_evaluation_delay_ticks: null,
      censored_evaluation_delay_ticks: null,
      effective_total_latency_ticks: null,
      revised_within_horizon: null,
    };
  }
  const deltaObs = tContradictionObserved - tShiftEvent;
  const deltaAdm = tContradictionAdmitted - tContradictionObserved;
  const deltaAvail = tContradictionAvailable - tContradictionAdmitted;
  const empDelay = tContradictionAvailable - tShiftEvent;

  const revised = tCorrection !== null && tCorrection <= horizonTicks;
  const evalDelayUncensored = revised ? tCorrection - tContradictionAvailable : null;
  const evalDelayCensored = revised
    ? tCorrection - tContradictionAvailable
    : Math.max(0, horizonTicks + 1 - tContradictionAvailable);
  const totalEff = revised
    ? tCorrection - tShiftEvent
    : horizonTicks + 1 - tShiftEvent;

  return {
    has_actionable_contradiction: true,
    delta_obs_ticks: deltaObs,
    delta_adm_ticks: deltaAdm,
    delta_avail_ticks: deltaAvail,
    empirical_access_delay_ticks: empDelay,
    policy_evaluation_delay_ticks: evalDelayUncensored,
    censored_evaluation_delay_ticks: evalDelayCensored,
    effective_total_latency_ticks: totalEff,
    revised_within_horizon: revised,
  };
}

// ============================================================================
// Dynamic Proxy-Instrumented Secret Vault (Fixes PR #1699 Review Finding #5)
// ============================================================================

const ACTIVE_VAULT_ROLE_STACK = [];

export const ALLOWED_VAULT_ROLES = Object.freeze([
  'WORLD_OBSERVATION_SIMULATOR',
  'DYNAMIC_SYNTHETIC_ORACLE',
  'POST_EPISODE_SCORER',
]);

export function withAuthorizedVaultRole(role, fn) {
  if (!ALLOWED_VAULT_ROLES.includes(role)) {
    throw new Error(`[VAULT_ROLE_VIOLATION] Unrecognized vault role: ${role}`);
  }
  ACTIVE_VAULT_ROLE_STACK.push(role);
  try {
    return fn();
  } finally {
    ACTIVE_VAULT_ROLE_STACK.pop();
  }
}

export function createVaultAccessLedger() {
  return {
    instrumentation_type: 'DYNAMIC_JS_PROXY_PROPERTY_TRAP',
    simulator_property_reads: 0,
    oracle_property_reads: 0,
    post_episode_scorer_reads: 0,
    unauthorized_investigator_reads: 0,
    unauthorized_attempts: [],
  };
}

export function createInstrumentedSecretVault(rawSecretObject, sharedLedger) {
  const frozenInner = deepFreeze({ ...rawSecretObject });
  return new Proxy(frozenInner, {
    get(target, prop, receiver) {
      if (typeof prop === 'symbol' || prop === 'then') {
        return Reflect.get(target, prop, receiver);
      }
      const currentRole =
        ACTIVE_VAULT_ROLE_STACK.length > 0
          ? ACTIVE_VAULT_ROLE_STACK[ACTIVE_VAULT_ROLE_STACK.length - 1]
          : null;

      if (!currentRole) {
        sharedLedger.unauthorized_investigator_reads += 1;
        sharedLedger.unauthorized_attempts.push({
          property: String(prop),
          world_id: target.world_public_id,
        });
        throw new Error(
          `[DYNAMIC_VAULT_ACCESS_VIOLATION] Unauthorized read of secret property '${String(prop)}' outside authorized simulator/oracle/scorer scope!`
        );
      }

      if (currentRole === 'WORLD_OBSERVATION_SIMULATOR') {
        sharedLedger.simulator_property_reads += 1;
      } else if (currentRole === 'DYNAMIC_SYNTHETIC_ORACLE') {
        sharedLedger.oracle_property_reads += 1;
      } else if (currentRole === 'POST_EPISODE_SCORER') {
        sharedLedger.post_episode_scorer_reads += 1;
      }

      return Reflect.get(target, prop, receiver);
    },
    set() {
      throw new TypeError('[SECRET_VAULT_IMMUTABLE] Secret vault cannot be mutated.');
    },
    deleteProperty() {
      throw new TypeError('[SECRET_VAULT_IMMUTABLE] Secret vault properties cannot be deleted.');
    },
    ownKeys(target) {
      const currentRole =
        ACTIVE_VAULT_ROLE_STACK.length > 0
          ? ACTIVE_VAULT_ROLE_STACK[ACTIVE_VAULT_ROLE_STACK.length - 1]
          : null;
      if (!currentRole) {
        sharedLedger.unauthorized_investigator_reads += 1;
        throw new Error('[DYNAMIC_VAULT_ACCESS_VIOLATION] Unauthorized enumeration of secret vault keys!');
      }
      return Reflect.ownKeys(target);
    },
  });
}

export function assertPacketContainsNoSecrets(packet) {
  const raw = JSON.stringify(packet);
  const forbiddenTokens = [
    'TD613_ACT2_SECRET_VAULT_CANARY',
    'true_initial_slot',
    'true_post_shift_slot',
    'hidden_trajectory_by_tick',
    'holdout_ground_truth',
  ];
  for (const tok of forbiddenTokens) {
    if (raw.includes(tok)) {
      throw new Error(`[SECRET_LEAKAGE_VIOLATION] Forbidden secret token '${tok}' detected in investigator packet!`);
    }
  }
  return true;
}
