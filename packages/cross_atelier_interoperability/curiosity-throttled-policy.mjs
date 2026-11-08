/**
 * 𝌋 TD613 · EXPLORATORY COST-OF-CURIOSITY POLICY THROTTLE (Act II Policy Variant)
 * Implements Operator Decision 1: Calibrated against the measured -0.0357 probing regret
 * 
 * In standard Act II policies (e.g. D_TEMPORAL_CUSTODIANS), active diagnostic probing is
 * triggered when Shannon entropy exceeds an unconstrained threshold (e.g. H > 0.45 bits).
 * However, empirical single-factor ablation P-03 proved that on synthetic cell
 * H_MOD__L3_MODERATE__V_ACCELERATED, disabling probing IMPROVES mean utility from 0.6654 to 0.7011,
 * revealing an empirical probing regret of -0.0357.
 * 
 * This module introduces the exploratory throttled variant:
 *   EIG(probe) must exceed the empirical probing cost hurdle c_probe = 0.0357.
 * When belief confidence is already sufficient or ambient observation provides adequate SNR,
 * diagnostic probing is suppressed, preserving probe budget and avoiding curiosity regret.
 * 
 * Authority: SAC[X6ZNK5NO51] · Covenant: Khona‌lit-po
 */

export const CURIOSITY_THROTTLE_REGRET_PENALTY = 0.0357; // Empirical delta from P-03

export class CuriosityThrottledBayesianPolicy {
  constructor({
    policyId = 'EXPLORATORY_CURIOSITY_THROTTLED_CUSTODIAN',
    probingCostHurdle = CURIOSITY_THROTTLE_REGRET_PENALTY,
    entropyProbeThreshold = 0.85, // Higher hurdle than standard 0.45
    minActionConfidence = 0.75,
  } = {}) {
    this.policyId = policyId;
    this.probingCostHurdle = probingCostHurdle;
    this.entropyProbeThreshold = entropyProbeThreshold;
    this.minActionConfidence = minActionConfidence;
    this.telemetry = {
      probes_requested: 0,
      probes_throttled: 0,
      probes_executed: 0,
      estimated_regret_prevented: 0,
    };
  }

  /**
   * Evaluates whether an active diagnostic probe should be executed or throttled.
   */
  evaluateProbingDecision({
    currentTick,
    posteriorProbs,
    entropyBits,
    expectedInformationGain = 0.0,
    remainingProbeBudget,
  }) {
    if (remainingProbeBudget <= 0) {
      return {
        shouldProbe: false,
        reason: 'PROBE_BUDGET_EXHAUSTED',
        telemetry: { ...this.telemetry },
      };
    }

    // 1. High confidence test: if top slot has confidence >= minActionConfidence, throttle probing
    const maxProb = Math.max(...Object.values(posteriorProbs));
    if (maxProb >= this.minActionConfidence) {
      this.telemetry.probes_requested++;
      this.telemetry.probes_throttled++;
      this.telemetry.estimated_regret_prevented += this.probingCostHurdle;
      return {
        shouldProbe: false,
        reason: 'THROTTLED_HIGH_CONFIDENCE_ACTION_ALIGNED',
        entropyBits,
        maxProb,
        hurdle: this.probingCostHurdle,
        telemetry: { ...this.telemetry },
      };
    }

    // 2. Information gain vs cost hurdle test:
    // If entropy is moderate (< entropyProbeThreshold) and EIG < probingCostHurdle, throttle
    if (entropyBits < this.entropyProbeThreshold && expectedInformationGain < this.probingCostHurdle) {
      this.telemetry.probes_requested++;
      this.telemetry.probes_throttled++;
      this.telemetry.estimated_regret_prevented += this.probingCostHurdle;
      return {
        shouldProbe: false,
        reason: 'THROTTLED_COST_OF_CURIOSITY_EXCEEDS_EXPECTED_GAIN',
        entropyBits,
        expectedInformationGain,
        hurdle: this.probingCostHurdle,
        telemetry: { ...this.telemetry },
      };
    }

    // 3. High ambiguity: entropy exceeds threshold and expected gain justifies cost
    this.telemetry.probes_requested++;
    this.telemetry.probes_executed++;
    return {
      shouldProbe: true,
      reason: 'PROBE_AUTHORIZED_HIGH_ENTROPY_AND_GAIN',
      entropyBits,
      expectedInformationGain,
      hurdle: this.probingCostHurdle,
      telemetry: { ...this.telemetry },
    };
  }

  getTelemetry() {
    return Object.freeze({ ...this.telemetry });
  }
}
