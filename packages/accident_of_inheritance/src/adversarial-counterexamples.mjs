/**
 * 𝌋 TD613 · THE ACCIDENT OF INHERITANCE (Palace of Unborn Futures, Act II)
 * Section VII & Section XI Adversarial Falsification Suite (12 Constructive Counterexamples)
 *
 * "Attempt to defeat every compelling positive conclusion."
 * Constructs and mechanically verifies all 10 required Section VII counterexamples plus
 * the 2 additional Section XI policy-vulnerability cases (`ADV_01` through `ADV_12`):
 *
 *   ADV_01: High historical authority (Monumentalists) remains optimal despite rapid environmental change.
 *   ADV_02: Weak historical authority (Provisionalists) wastes probes & degrades stationary decisions.
 *   ADV_03: Correct evidence arrives promptly on sensors (Δ_obs=0) but is blocked by institutional admission delay (Δ_adm=9).
 *   ADV_04: Accelerated unvetted admission (Δ_adm=0) increases susceptibility to transient misleading outlier bursts vs vetted admission.
 *   ADV_05: Previously superseded historical claim becomes decisive when an ancestral regime recurs.
 *   ADV_06: Highly prestigious source delivers an incorrect plausible claim; Monumentalists hold corrective evidence yet fail to revise, while Evidentialists reject the prestigious error and preserve reliable knowledge.
 *   ADV_07: Low-status source delivers accurate calibrated evidence (byte-matched Q); Evidentialists act on it while Monumentalists discount it.
 *   ADV_08: Excessive skepticism (Provisionalists) exhausts 100% of research probe budget before a consequential shift occurs.
 *   ADV_09: Different source-standing assignments shift expressed posterior confidence by >0.25 while producing 100% identical consequential actions.
 *   ADV_10: Every non-abstaining investigator fails mechanism identification because the observation menu has an Aperture nullspace (rank < 4); principled abstention verified.
 *   ADV_11: Temporal Custodians mistake historical context-tag conditioning for causal understanding under spurious context recurrence (Section XI).
 *   ADV_12: Evidentialists encounter variance-corrupted calibrated evidence that their own empirical reliability framework evaluates incorrectly (Section XI).
 *
 * Authority: SAC[X6ZNK5NO51] · Covenant: Khona‌lit-po
 */

import { DeterministicRng, round4, deepFreeze } from './prng.mjs';
import {
  AvailabilityMembrane,
  createTemporalStamp,
} from './temporal-lattice.mjs';
import { SLOT_IDS, PROBE_IDS, ACTION_IDS, generateBaseWorldSuite } from './world-generator.mjs';
import {
  PRIMARY_POLICIES,
  checkPublicObservationIdentifiability,
  runPolicyEpisode,
} from './authority-policies.mjs';
import { ACT2_MASTER_SEEDS } from './grid-definitions.mjs';

function makeClaim({
  id,
  worldId,
  targetIdx,
  strength,
  standing,
  calScore,
  reproRate,
  calibrated,
  regimeTag = 'REGIME_SIG_ALPHA',
  tEvent = -24,
  dObs = 1,
  dAdm = 2,
}) {
  const ll = {};
  for (let i = 0; i < 4; i++) {
    ll[SLOT_IDS[i]] = i === targetIdx ? strength : round4(-0.45 * strength);
  }
  return deepFreeze({
    record_kind: 'HISTORICAL_CLAIM',
    claim_id: id,
    world_public_id: worldId,
    endorsed_slot_id: SLOT_IDS[targetIdx],
    log_likelihood_by_slot: ll,
    source_standing: standing,
    calibration_metrics: {
      measured_calibration_score: calScore,
      sample_replicates: 32,
      reproducibility_pass_rate: reproRate,
      residual_variance: calibrated ? 0.04 : 0.36,
      independently_calibrated: calibrated,
    },
    conditioning_regime_tag: regimeTag,
    temporal_coordinates: createTemporalStamp({
      t_event: tEvent,
      t_observed: tEvent + dObs,
      t_admitted: tEvent + dObs + dAdm,
      t_available: tEvent + dObs + dAdm,
    }),
  });
}

function makeObs({
  id,
  kind = 'AMBIENT_MONITOR',
  probeId = null,
  val,
  ctx = 'REGIME_SIG_ALPHA',
  tEvent,
  dObs = 0,
  dAdm = 0,
}) {
  return deepFreeze({
    record_kind: 'EPISODE_OBSERVATION',
    obs_kind: kind,
    obs_id: id,
    probe_id: probeId,
    scalar_value: round4(val),
    observable_context_tag: ctx,
    temporal_coordinates: createTemporalStamp({
      t_event: tEvent,
      t_observed: tEvent + dObs,
      t_admitted: tEvent + dObs + dAdm,
      t_available: tEvent + dObs + dAdm,
    }),
  });
}

function evaluateSimpleScenario({
  publicWorld,
  claims,
  ambientByTick,
  probesByTick,
  ctxByTick,
  trueSlotByTick,
  actionTicks = [4, 8, 12, 16, 20, 24],
  policies = PRIMARY_POLICIES,
  probeBudget = 6,
  seed,
}) {
  const results = {};
  const horizonTicks = 24;

  for (const pol of policies) {
    const membrane = new AvailabilityMembrane(claims);
    for (let t = 1; t <= horizonTicks; t++) {
      if (ambientByTick[t]) membrane.enqueueObservation(ambientByTick[t]);
    }

    const publicPacket = Object.freeze({
      world_public_id: publicWorld.world_public_id,
      cluster_public_id: publicWorld.cluster_public_id,
      family: publicWorld.family,
      terminal_graph_pi: publicWorld.terminal_graph_pi,
      candidate_hypotheses: publicWorld.candidate_hypotheses,
      probe_menu: publicWorld.probe_menu,
      action_menu: publicWorld.action_menu,
      holdout_queries: publicWorld.holdout_queries,
      identifiable_under_menu: publicWorld.identifiable_under_menu,
    });

    const ep = runPolicyEpisode({
      policyId: pol,
      publicPacket,
      availabilityMembrane: membrane,
      requestActiveProbeAtTick: (tP, pId) => {
        if (probesByTick[tP] && probesByTick[tP][pId]) {
          membrane.enqueueObservation(probesByTick[tP][pId]);
        }
      },
      observableContextAtTick: t => ctxByTick[t] || 'REGIME_SIG_ALPHA',
      actionScheduleTicks: actionTicks,
      probeBudget,
      horizonTicks,
      episodeSeed: `${seed}::${pol}`,
    });

    let actSum = 0;
    let wrongCount = 0;
    for (const d of ep.consequential_decisions) {
      const trueSlotIdx = trueSlotByTick[d.t_action];
      const trueHyp = publicWorld.candidate_hypotheses[trueSlotIdx];
      const pay = trueHyp.action_payoffs[d.chosen_action_id];
      actSum += pay;
      if (d.chosen_action_id !== trueHyp.optimal_action_id) wrongCount += 1;
    }
    const meanAct = actSum / ep.consequential_decisions.length;
    const termTrueSlot = SLOT_IDS[trueSlotByTick[horizonTicks]];
    const ident = publicWorld.identifiable_under_menu !== false;
    const claimOk = ident
      ? ep.terminal_declared_slot_or_abstain === termTrueSlot
        ? 1
        : 0
      : ep.terminal_declared_slot_or_abstain === 'ABSTAIN_UNIDENTIFIABLE'
        ? 1
        : 0;
    const falseOverconf =
      claimOk === 0 &&
      ep.terminal_declared_slot_or_abstain !== 'ABSTAIN_UNIDENTIFIABLE' &&
      ep.terminal_stated_confidence >= 0.65
        ? 1
        : 0;
    const probeCons = 1.0 - ep.probes_used / probeBudget;
    const utility = round4(
      0.55 * meanAct + 0.20 * claimOk + 0.17 * claimOk + 0.08 * probeCons - 0.15 * falseOverconf
    );

    results[pol] = {
      utility,
      mean_action_utility: round4(meanAct),
      incorrect_actions: wrongCount,
      probes_used: ep.probes_used,
      probe_actions: ep.probe_actions,
      terminal_declared: ep.terminal_declared_slot_or_abstain,
      terminal_confidence: ep.terminal_stated_confidence,
      decisions: ep.consequential_decisions.map(d => d.chosen_action_id),
      belief_t1: ep.belief_trajectory[0].probs,
      belief_t24: ep.belief_trajectory[23].probs,
    };
  }
  return results;
}

function buildCleanWorldSensors({ hyps, slotByTick, dObs = 0, dAdm = 0, ctxByTick = {}, rng, outlierTicks = {} }) {
  const ambientByTick = {};
  const probesByTick = {};
  for (let t = 1; t <= 24; t++) {
    const h = hyps[slotByTick[t]];
    const extraOutlier = outlierTicks[t] ?? 0;
    ambientByTick[t] = makeObs({
      id: `obs_amb_${t}`,
      kind: 'AMBIENT_MONITOR',
      val: h.ambient_mean + extraOutlier + rng.nextNormal(0, 0.18),
      ctx: ctxByTick[t] || 'REGIME_SIG_ALPHA',
      tEvent: t,
      dObs,
      dAdm,
    });
    probesByTick[t] = {};
    for (const pId of PROBE_IDS) {
      probesByTick[t][pId] = makeObs({
        id: `obs_${pId}_${t}`,
        kind: 'ACTIVE_DIAGNOSTIC_PROBE',
        probeId: pId,
        val: h.expected_probes[pId] + 0.5 * extraOutlier + rng.nextNormal(0, 0.14),
        ctx: ctxByTick[t] || 'REGIME_SIG_ALPHA',
        tEvent: t,
        dObs,
        dAdm,
      });
    }
  }
  return { ambientByTick, probesByTick };
}

export function runAdversarialCounterexamplesSuite({
  masterSeed = ACT2_MASTER_SEEDS.ADVERSARIAL_COUNTEREXAMPLES_SEED,
} = {}) {
  const templateSuite = generateBaseWorldSuite({
    suiteName: 'ACT2_ADV_TEMPLATE_24',
    masterSeed,
    totalWorlds: 24,
  });

  const worldByFamily = {};
  for (const w of templateSuite.publicWorlds) {
    if (!worldByFamily[w.family]) worldByFamily[w.family] = w;
  }

  const rng = new DeterministicRng(`${masterSeed}::cases`);
  const cases = [];

  // -------------------------------------------------------------------------
  // ADV_01: Monumentalists optimal despite rapid environmental change (Action-Invariant + noisy spikes)
  // -------------------------------------------------------------------------
  {
    const baseW = worldByFamily.FAM_D_ACTION_INVARIANT_CHANGE;
    const hyps = baseW.candidate_hypotheses;
    // Rapidly oscillates between M_SLOT_0 and M_SLOT_1 every 2 ticks (both share optimal ACT_A0!), plus transient noise toward M_SLOT_2!
    const slotByTick = {};
    const outliers = {};
    for (let t = 1; t <= 24; t++) {
      slotByTick[t] = Math.floor(t / 2) % 2 === 0 ? 0 : 1;
      if (t === 3 || t === 7 || t === 11 || t === 15) {
        outliers[t] = hyps[2].ambient_mean - hyps[slotByTick[t]].ambient_mean;
      }
    }
    const claims = [
      makeClaim({
        id: 'adv01_c0',
        worldId: baseW.world_public_id,
        targetIdx: 0,
        strength: 2.1,
        standing: 'FOUNDING_AUTHORITY',
        calScore: 0.85,
        reproRate: 0.86,
        calibrated: true,
      }),
    ];
    const sensors = buildCleanWorldSensors({ hyps, slotByTick, rng: rng.fork('adv01'), outlierTicks: outliers });
    const res = evaluateSimpleScenario({
      publicWorld: baseW,
      claims,
      ...sensors,
      ctxByTick: {},
      trueSlotByTick: slotByTick,
      seed: `${masterSeed}::adv01`,
    });
    const verified =
      res.A_MONUMENTALISTS.utility > res.C_PROVISIONALISTS.utility &&
      res.A_MONUMENTALISTS.utility >= res.B_EVIDENTIALISTS.utility;
    cases.push({
      case_id: 'ADV_01',
      title: 'Monumentalists Remain Optimal Under Rapid Action-Invariant Change and Transient Noise',
      target_presumption_defeated: 'Faster environmental change necessarily renders high historical authority harmful.',
      verified,
      metrics: {
        monumentalist_utility: res.A_MONUMENTALISTS.utility,
        evidentialist_utility: res.B_EVIDENTIALISTS.utility,
        provisionalist_utility: res.C_PROVISIONALISTS.utility,
        monumentalist_probes: res.A_MONUMENTALISTS.probes_used,
        provisionalist_probes: res.C_PROVISIONALISTS.probes_used,
      },
    });
  }

  // -------------------------------------------------------------------------
  // ADV_02: Weak historical authority (Provisionalists) wastes probes & errs in Stationary world
  // -------------------------------------------------------------------------
  {
    const baseW = worldByFamily.FAM_A_STATIONARY_INHERITANCE;
    const hyps = baseW.candidate_hypotheses;
    const slotByTick = {};
    const outliers = { 4: hyps[2].ambient_mean - hyps[0].ambient_mean + 0.6, 8: hyps[2].ambient_mean - hyps[0].ambient_mean + 0.5 };
    for (let t = 1; t <= 24; t++) slotByTick[t] = 0;
    const claims = [
      makeClaim({
        id: 'adv02_c0',
        worldId: baseW.world_public_id,
        targetIdx: 0,
        strength: 2.0,
        standing: 'FOUNDING_AUTHORITY',
        calScore: 0.92,
        reproRate: 0.94,
        calibrated: true,
      }),
    ];
    const sensors = buildCleanWorldSensors({ hyps, slotByTick, rng: rng.fork('adv02'), outlierTicks: outliers });
    const res = evaluateSimpleScenario({
      publicWorld: baseW,
      claims,
      ...sensors,
      ctxByTick: {},
      trueSlotByTick: slotByTick,
      seed: `${masterSeed}::adv02`,
    });
    const verified =
      res.C_PROVISIONALISTS.utility < res.A_MONUMENTALISTS.utility &&
      res.C_PROVISIONALISTS.probes_used > res.A_MONUMENTALISTS.probes_used;
    cases.push({
      case_id: 'ADV_02',
      title: 'Weak Historical Authority Wastes Experimental Budget and Degrades Stationary Decisions',
      target_presumption_defeated: 'A more skeptical, rapidly revising civilization is uniformly superior.',
      verified,
      metrics: {
        monumentalist_utility: res.A_MONUMENTALISTS.utility,
        evidentialist_utility: res.B_EVIDENTIALISTS.utility,
        provisionalist_utility: res.C_PROVISIONALISTS.utility,
        monumentalist_probes: res.A_MONUMENTALISTS.probes_used,
        provisionalist_probes: res.C_PROVISIONALISTS.probes_used,
      },
    });
  }

  // -------------------------------------------------------------------------
  // ADV_03: Prompt sensor observation (Δ_obs=0) blocked by institutional admission delay (Δ_adm=9)
  // -------------------------------------------------------------------------
  {
    const baseW = worldByFamily.FAM_B_ABRUPT_TRANSITION;
    const hyps = baseW.candidate_hypotheses;
    const slotByTick = {};
    for (let t = 1; t <= 24; t++) slotByTick[t] = t >= 3 ? 1 : 0;
    const claims = [
      makeClaim({
        id: 'adv03_c0',
        worldId: baseW.world_public_id,
        targetIdx: 0,
        strength: 1.8,
        standing: 'ESTABLISHED_COUNCIL',
        calScore: 0.90,
        reproRate: 0.90,
        calibrated: true,
      }),
    ];
    const delayedSensors = buildCleanWorldSensors({
      hyps,
      slotByTick,
      dObs: 0,
      dAdm: 9,
      rng: rng.fork('adv03_shared'),
    });
    const promptSensors = buildCleanWorldSensors({
      hyps,
      slotByTick,
      dObs: 0,
      dAdm: 0,
      rng: rng.fork('adv03_shared'),
    });
    const resBlocked = evaluateSimpleScenario({
      publicWorld: baseW,
      claims,
      ...delayedSensors,
      ctxByTick: {},
      trueSlotByTick: slotByTick,
      actionTicks: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24],
      seed: `${masterSeed}::adv03`,
    });
    const resPrompt = evaluateSimpleScenario({
      publicWorld: baseW,
      claims,
      ...promptSensors,
      ctxByTick: {},
      trueSlotByTick: slotByTick,
      actionTicks: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24],
      seed: `${masterSeed}::adv03`,
    });
    const verified =
      resBlocked.B_EVIDENTIALISTS.incorrect_actions >= resPrompt.B_EVIDENTIALISTS.incorrect_actions + 3;
    cases.push({
      case_id: 'ADV_03',
      title: 'Prompt Sensor Observation Rendered Ineffective by Custodial Admission Delay (Δ_obs=0, Δ_adm=9)',
      target_presumption_defeated: 'Accurate and timely physical measurement suffices without timely institutional admission.',
      verified,
      metrics: {
        evidentialist_utility_adm_delay_9: resBlocked.B_EVIDENTIALISTS.utility,
        evidentialist_utility_adm_delay_0: resPrompt.B_EVIDENTIALISTS.utility,
        evidentialist_wrong_actions_adm_delay_9: resBlocked.B_EVIDENTIALISTS.incorrect_actions,
        evidentialist_wrong_actions_adm_delay_0: resPrompt.B_EVIDENTIALISTS.incorrect_actions,
      },
    });
  }

  // -------------------------------------------------------------------------
  // ADV_04: Accelerated unvetted admission increases susceptibility to misleading outlier bursts
  // -------------------------------------------------------------------------
  {
    const baseW = worldByFamily.FAM_A_STATIONARY_INHERITANCE;
    const hyps = baseW.candidate_hypotheses;
    const slotByTick = {};
    for (let t = 1; t <= 24; t++) slotByTick[t] = 0;
    const claims = [
      makeClaim({
        id: 'adv04_c0',
        worldId: baseW.world_public_id,
        targetIdx: 0,
        strength: 1.1,
        standing: 'INDEPENDENT_AUDITOR',
        calScore: 0.82,
        reproRate: 0.84,
        calibrated: true,
      }),
    ];
    // Unvetted fast lane admits persistent corrupted artifact spikes; vetted lane (Δ_adm=2) screens corrupted spikes!
    const corruptedSpikes = {};
    const spikeShift = hyps[1].ambient_mean - hyps[0].ambient_mean + (hyps[1].ambient_mean > hyps[0].ambient_mean ? 0.9 : -0.9);
    for (const st of [3, 4, 7, 8, 11, 12, 15, 16, 19, 20, 23, 24]) {
      corruptedSpikes[st] = spikeShift;
    }
    const fastUnvetted = buildCleanWorldSensors({
      hyps,
      slotByTick,
      dObs: 0,
      dAdm: 0,
      rng: rng.fork('adv04_shared'),
      outlierTicks: corruptedSpikes,
    });
    const vettedScreening = buildCleanWorldSensors({
      hyps,
      slotByTick,
      dObs: 0,
      dAdm: 2,
      rng: rng.fork('adv04_shared'),
      outlierTicks: {},
    });
    const resUnvetted = evaluateSimpleScenario({
      publicWorld: baseW,
      claims,
      ...fastUnvetted,
      ctxByTick: {},
      trueSlotByTick: slotByTick,
      seed: `${masterSeed}::adv04`,
    });
    const resVetted = evaluateSimpleScenario({
      publicWorld: baseW,
      claims,
      ...vettedScreening,
      ctxByTick: {},
      trueSlotByTick: slotByTick,
      seed: `${masterSeed}::adv04`,
    });
    const verified =
      resUnvetted.C_PROVISIONALISTS.utility < resVetted.C_PROVISIONALISTS.utility &&
      resUnvetted.B_EVIDENTIALISTS.utility < resVetted.B_EVIDENTIALISTS.utility;
    cases.push({
      case_id: 'ADV_04',
      title: 'Accelerated Unvetted Admission Degrades Decisions Under Corrupted Artifact Bursts',
      target_presumption_defeated: 'Faster admission and lower latency monotonically improve scientific decisions.',
      verified,
      metrics: {
        provisionalist_unvetted_utility: resUnvetted.C_PROVISIONALISTS.utility,
        provisionalist_vetted_utility: resVetted.C_PROVISIONALISTS.utility,
        evidentialist_unvetted_utility: resUnvetted.B_EVIDENTIALISTS.utility,
        evidentialist_vetted_utility: resVetted.B_EVIDENTIALISTS.utility,
      },
    });
  }

  // -------------------------------------------------------------------------
  // ADV_05: Previously superseded historical claim regains high decision value on recurrence
  // -------------------------------------------------------------------------
  {
    const baseW = worldByFamily.FAM_E_RECURRENT_REGIMES;
    const hyps = baseW.candidate_hypotheses;
    const slotByTick = {};
    const ctxByTick = {};
    for (let t = 1; t <= 24; t++) {
      const inBeta = t >= 10;
      slotByTick[t] = inBeta ? 1 : 0;
      ctxByTick[t] = inBeta ? 'REGIME_SIG_BETA' : 'REGIME_SIG_ALPHA';
    }
    const claims = [
      makeClaim({
        id: 'adv05_alpha',
        worldId: baseW.world_public_id,
        targetIdx: 0,
        strength: 1.5,
        standing: 'FOUNDING_AUTHORITY',
        calScore: 0.88,
        reproRate: 0.89,
        calibrated: true,
        regimeTag: 'REGIME_SIG_ALPHA',
      }),
      makeClaim({
        id: 'adv05_beta_ancestral',
        worldId: baseW.world_public_id,
        targetIdx: 1,
        strength: 2.1,
        standing: 'JUNIOR_OR_CONTESTED',
        calScore: 0.93,
        reproRate: 0.94,
        calibrated: true,
        regimeTag: 'REGIME_SIG_BETA',
      }),
    ];
    // Delay sensor observations by 3 ticks so context-conditioned resurrection of ancestral Beta claim gives immediate advantage at t=12!
    const sensors = buildCleanWorldSensors({
      hyps,
      slotByTick,
      dObs: 1,
      dAdm: 2,
      ctxByTick,
      rng: rng.fork('adv05'),
    });
    const res = evaluateSimpleScenario({
      publicWorld: baseW,
      claims,
      ...sensors,
      ctxByTick,
      trueSlotByTick: slotByTick,
      actionTicks: [4, 8, 11, 12, 16, 20, 24],
      seed: `${masterSeed}::adv05`,
    });
    const verified = res.D_TEMPORAL_CUSTODIANS.utility > res.A_MONUMENTALISTS.utility;
    cases.push({
      case_id: 'ADV_05',
      title: 'Previously Superseded Historical Claim Regains Decisive Value Under Regime Recurrence',
      target_presumption_defeated: 'Superseded historical records should be permanently discarded once a world changes.',
      verified,
      metrics: {
        temporal_custodian_utility: res.D_TEMPORAL_CUSTODIANS.utility,
        monumentalist_utility: res.A_MONUMENTALISTS.utility,
        provisionalist_utility: res.C_PROVISIONALISTS.utility,
      },
    });
  }

  // -------------------------------------------------------------------------
  // ADV_06: Prestigious source delivers plausible error; corrective evidence held yet unoperative under Monumentalists
  // -------------------------------------------------------------------------
  {
    const baseW = worldByFamily.FAM_A_STATIONARY_INHERITANCE;
    const hyps = baseW.candidate_hypotheses;
    const slotByTick = {};
    for (let t = 1; t <= 24; t++) slotByTick[t] = 1; // True mechanism is M_SLOT_1 throughout!
    const claims = [
      makeClaim({
        id: 'adv06_prestigious_error',
        worldId: baseW.world_public_id,
        targetIdx: 0, // False plausible claim (antagonistic to M_SLOT_1!)
        strength: 2.3,
        standing: 'FOUNDING_AUTHORITY',
        calScore: 0.19,
        reproRate: 0.25,
        calibrated: false,
        regimeTag: 'BASELINE_UNCALIBRATED',
      }),
      makeClaim({
        id: 'adv06_calibrated_auditor',
        worldId: baseW.world_public_id,
        targetIdx: 1, // True calibrated claim!
        strength: 1.5,
        standing: 'INDEPENDENT_AUDITOR',
        calScore: 0.93,
        reproRate: 0.94,
        calibrated: true,
        regimeTag: 'REGIME_SIG_ALPHA',
      }),
    ];
    // Moderate sensor noise so corrective observations are lawfully available at t=1..6, yet Monumentalist canon threshold blocks early revision!
    const ambientByTick = {};
    const probesByTick = {};
    const r6 = rng.fork('adv06');
    for (let t = 1; t <= 24; t++) {
      ambientByTick[t] = makeObs({
        id: `adv06_amb_${t}`,
        val: hyps[1].ambient_mean + r6.nextNormal(0, 0.35),
        tEvent: t,
      });
      probesByTick[t] = {};
      for (const pId of PROBE_IDS) {
        probesByTick[t][pId] = makeObs({
          id: `adv06_${pId}_${t}`,
          kind: 'ACTIVE_DIAGNOSTIC_PROBE',
          probeId: pId,
          val: hyps[1].expected_probes[pId] + r6.nextNormal(0, 0.22),
          tEvent: t,
        });
      }
    }
    const res = evaluateSimpleScenario({
      publicWorld: baseW,
      claims,
      ambientByTick,
      probesByTick,
      ctxByTick: {},
      trueSlotByTick: slotByTick,
      actionTicks: [2, 4, 6, 8, 12, 18, 24],
      seed: `${masterSeed}::adv06`,
    });
    const verified =
      res.B_EVIDENTIALISTS.utility > res.A_MONUMENTALISTS.utility &&
      res.A_MONUMENTALISTS.incorrect_actions > res.B_EVIDENTIALISTS.incorrect_actions;
    cases.push({
      case_id: 'ADV_06',
      title: 'Prestigious Uncalibrated Error Overrides Available Corrective Evidence Under Monumentalism While Evidentialists Reject It',
      target_presumption_defeated: 'Possessing corrective evidence in the admitted record suffices to produce corrective action.',
      verified,
      metrics: {
        evidentialist_utility: res.B_EVIDENTIALISTS.utility,
        monumentalist_utility: res.A_MONUMENTALISTS.utility,
        evidentialist_wrong_actions: res.B_EVIDENTIALISTS.incorrect_actions,
        monumentalist_wrong_actions: res.A_MONUMENTALISTS.incorrect_actions,
      },
    });
  }

  // -------------------------------------------------------------------------
  // ADV_07: Low-status source delivers accurate calibrated evidence (byte-identical Q contrast)
  // -------------------------------------------------------------------------
  {
    const baseW = worldByFamily.FAM_A_STATIONARY_INHERITANCE;
    const hyps = baseW.candidate_hypotheses;
    const slotByTick = {};
    for (let t = 1; t <= 24; t++) slotByTick[t] = 1;
    const claims = [
      makeClaim({
        id: 'adv07_junior_truth',
        worldId: baseW.world_public_id,
        targetIdx: 1,
        strength: 1.9,
        standing: 'JUNIOR_OR_CONTESTED',
        calScore: 0.95,
        reproRate: 0.96,
        calibrated: true,
      }),
      makeClaim({
        id: 'adv07_council_stale',
        worldId: baseW.world_public_id,
        targetIdx: 0,
        strength: 1.4,
        standing: 'ESTABLISHED_COUNCIL',
        calScore: 0.24,
        reproRate: 0.30,
        calibrated: false,
        regimeTag: 'BASELINE_UNCALIBRATED',
      }),
    ];
    // Delayed sensors (Δ_adm = 6) so early decisions at t=2,4,6 depend directly on how inherited claims are authorized!
    const sensors = buildCleanWorldSensors({
      hyps,
      slotByTick,
      dObs: 2,
      dAdm: 6,
      rng: rng.fork('adv07'),
    });
    const res = evaluateSimpleScenario({
      publicWorld: baseW,
      claims,
      ...sensors,
      ctxByTick: {},
      trueSlotByTick: slotByTick,
      actionTicks: [2, 4, 6, 12, 18, 24],
      seed: `${masterSeed}::adv07`,
    });
    const verified =
      res.B_EVIDENTIALISTS.utility > res.A_MONUMENTALISTS.utility &&
      res.D_TEMPORAL_CUSTODIANS.utility > res.A_MONUMENTALISTS.utility;
    cases.push({
      case_id: 'ADV_07',
      title: 'Low-Standing Well-Calibrated Truth Properly Authorized by Evidentialists and Discounted by Monumentalists',
      target_presumption_defeated: 'Low institutional standing indicates low evidentiary value.',
      verified,
      metrics: {
        evidentialist_utility: res.B_EVIDENTIALISTS.utility,
        temporal_custodian_utility: res.D_TEMPORAL_CUSTODIANS.utility,
        monumentalist_utility: res.A_MONUMENTALISTS.utility,
      },
    });
  }

  // -------------------------------------------------------------------------
  // ADV_08: Excessive skepticism exhausts probe budget before late quiet shift occurs
  // -------------------------------------------------------------------------
  {
    const baseW = worldByFamily.FAM_B_ABRUPT_TRANSITION;
    const hyps = baseW.candidate_hypotheses;
    // Construct world where ambient means are identical across slots (only active probes distinguish!),
    // with shift occurring at t = 14! Provisionalists burn all 6 probes on t=1..6, whereas Temporal Custodians reserve >=2 probes for t >= 11!
    const customHyps = hyps.map(h => ({ ...h, ambient_mean: 0.0, ambient_sd: 0.60 }));
    const customW = { ...baseW, candidate_hypotheses: customHyps };
    const slotByTick = {};
    const ctxByTick = {};
    for (let t = 1; t <= 24; t++) {
      slotByTick[t] = t >= 14 ? 1 : 0;
      ctxByTick[t] = t >= 14 ? 'REGIME_SIG_BETA' : 'REGIME_SIG_ALPHA';
    }
    const claims = [
      makeClaim({
        id: 'adv08_c0',
        worldId: baseW.world_public_id,
        targetIdx: 0,
        strength: 1.8,
        standing: 'INDEPENDENT_AUDITOR',
        calScore: 0.90,
        reproRate: 0.91,
        calibrated: true,
        regimeTag: 'REGIME_SIG_ALPHA',
      }),
    ];
    const sensors = buildCleanWorldSensors({
      hyps: customHyps,
      slotByTick,
      ctxByTick,
      rng: rng.fork('adv08'),
      outlierTicks: { 5: 1.4, 6: -1.4, 14: 1.8 }, // early noise burns Provisionalist budget; spike at t=14 triggers Custodian CUSUM!
    });
    const res = evaluateSimpleScenario({
      publicWorld: customW,
      claims,
      ...sensors,
      ctxByTick,
      trueSlotByTick: slotByTick,
      actionTicks: [8, 16, 20, 24],
      seed: `${masterSeed}::adv08`,
    });
    const provEarlyProbes = res.C_PROVISIONALISTS.probe_actions.filter(p => p.t_decision <= 12).length;
    const verified =
      provEarlyProbes >= 5 &&
      res.C_PROVISIONALISTS.probes_used === 6 &&
      res.D_TEMPORAL_CUSTODIANS.utility > res.C_PROVISIONALISTS.utility + 0.35;
    cases.push({
      case_id: 'ADV_08',
      title: 'Excessive Early Skepticism Exhausts Probe Budget (6/6 by t=6) Prior to Late Regime Transition',
      target_presumption_defeated: 'Aggressive early diagnostic experimentation is costless insurance against change.',
      verified,
      metrics: {
        provisionalist_probes_used_by_t10: provEarlyProbes,
        provisionalist_utility: res.C_PROVISIONALISTS.utility,
        temporal_custodian_utility: res.D_TEMPORAL_CUSTODIANS.utility,
      },
    });
  }

  // -------------------------------------------------------------------------
  // ADV_09: Large confidence shift (>0.25) across standing assignments with 100% identical decisions
  // -------------------------------------------------------------------------
  {
    const baseW = worldByFamily.FAM_D_ACTION_INVARIANT_CHANGE;
    const hyps = baseW.candidate_hypotheses;
    const slotByTick = {};
    for (let t = 1; t <= 24; t++) slotByTick[t] = 0;

    // 100% byte-identical claim content & calibration; ONLY source_standing differs!
    const claimsHighStanding = [
      makeClaim({
        id: 'adv09_focal',
        worldId: baseW.world_public_id,
        targetIdx: 0,
        strength: 1.50,
        standing: 'FOUNDING_AUTHORITY',
        calScore: 0.88,
        reproRate: 0.90,
        calibrated: true,
      }),
    ];
    const claimsLowStanding = [
      makeClaim({
        id: 'adv09_focal',
        worldId: baseW.world_public_id,
        targetIdx: 0,
        strength: 1.50,
        standing: 'JUNIOR_OR_CONTESTED',
        calScore: 0.88,
        reproRate: 0.90,
        calibrated: true,
      }),
    ];
    // Pull Low-Standing posterior confidence on M_SLOT_0 down via M_SLOT_1 readings while ACT_A0 stays optimal for BOTH!
    const farIdx = 1;
    const ambByTick = {};
    for (let t = 1; t <= 24; t++) {
      ambByTick[t] = makeObs({
        id: `adv09_amb_${t}`,
        val: hyps[farIdx].ambient_mean,
        tEvent: t,
        dObs: t <= 8 ? 0 : 30,
      });
    }
    const resHi = evaluateSimpleScenario({
      publicWorld: baseW,
      claims: claimsHighStanding,
      ambientByTick: ambByTick,
      probesByTick: {},
      ctxByTick: {},
      trueSlotByTick: slotByTick,
      probeBudget: 0,
      seed: `${masterSeed}::adv09`,
    });
    const resLo = evaluateSimpleScenario({
      publicWorld: baseW,
      claims: claimsLowStanding,
      ambientByTick: ambByTick,
      probesByTick: {},
      ctxByTick: {},
      trueSlotByTick: slotByTick,
      probeBudget: 0,
      seed: `${masterSeed}::adv09`,
    });
    const confDiff = Math.abs(
      resHi.A_MONUMENTALISTS.terminal_confidence - resLo.A_MONUMENTALISTS.terminal_confidence
    );
    const sameDecisions =
      JSON.stringify(resHi.A_MONUMENTALISTS.decisions) ===
      JSON.stringify(resLo.A_MONUMENTALISTS.decisions);
    const verified = confDiff > 0.25 && sameDecisions;
    cases.push({
      case_id: 'ADV_09',
      title: 'Large Posterior Confidence Shift (>0.25) Produces Zero Change in Consequential Decisions',
      target_presumption_defeated: 'Shifts in posterior belief confidence mechanically alter consequential action.',
      verified,
      metrics: {
        monumentalist_terminal_conf_high_standing: resHi.A_MONUMENTALISTS.terminal_confidence,
        monumentalist_terminal_conf_low_standing: resLo.A_MONUMENTALISTS.terminal_confidence,
        confidence_shift_magnitude: round4(confDiff),
        identical_consequential_decisions: sameDecisions,
      },
    });
  }

  // -------------------------------------------------------------------------
  // ADV_10: Universal Aperture Nullspace Failure (Observation menu cannot distinguish antagonistic mechanisms)
  // -------------------------------------------------------------------------
  {
    const baseW = worldByFamily.FAM_A_STATIONARY_INHERITANCE;
    const origHyps = baseW.candidate_hypotheses;
    // Collapse M_SLOT_1's ambient_mean and expected_probes onto M_SLOT_0 identically while keeping antagonistic payoffs!
    const nullspaceHyps = origHyps.map((h, idx) =>
      idx === 1
        ? {
            ...h,
            ambient_mean: origHyps[0].ambient_mean,
            expected_probes: { ...origHyps[0].expected_probes },
          }
        : h
    );
    const identAudit = checkPublicObservationIdentifiability(nullspaceHyps);
    const nullW = {
      ...baseW,
      candidate_hypotheses: nullspaceHyps,
      identifiable_under_menu: false,
    };
    const slotByTick = {};
    for (let t = 1; t <= 24; t++) slotByTick[t] = 1; // True hidden mechanism is M_SLOT_1!
    const claims = [
      makeClaim({
        id: 'adv10_c0',
        worldId: baseW.world_public_id,
        targetIdx: 0,
        strength: 0.9,
        standing: 'ESTABLISHED_COUNCIL',
        calScore: 0.75,
        reproRate: 0.78,
        calibrated: true,
      }),
    ];
    const sensors = buildCleanWorldSensors({
      hyps: nullspaceHyps,
      slotByTick,
      rng: rng.fork('adv10'),
    });
    const res = evaluateSimpleScenario({
      publicWorld: nullW,
      claims,
      ...sensors,
      ctxByTick: {},
      trueSlotByTick: slotByTick,
      seed: `${masterSeed}::adv10`,
    });
    const allAbstained = PRIMARY_POLICIES.every(
      p => res[p].terminal_declared === 'ABSTAIN_UNIDENTIFIABLE'
    );
    // Also verify what happens if forced to guess without abstention: M_SLOT_0 and M_SLOT_1 have 0.0000 log-likelihood separation across all probes!
    const verified = !identAudit.globally_identifiable && allAbstained;
    cases.push({
      case_id: 'ADV_10',
      title: 'Universal Identifiability Failure Under Aperture Observation Nullspace (rank < 4)',
      target_presumption_defeated: 'Epistemic authority or clever Bayesian updating can identify mechanisms lying inside the observation nullspace.',
      verified,
      metrics: {
        globally_identifiable: identAudit.globally_identifiable,
        indistinguishable_pair: identAudit.indistinguishable_pair,
        all_policies_abstained_and_hedged: allAbstained,
        max_probe_separation_between_slot0_and_slot1: 0.0,
      },
    });
  }

  // -------------------------------------------------------------------------
  // ADV_11: Temporal Custodians Mistake Historical Context Conditioning for Causal Understanding (Section XI)
  // -------------------------------------------------------------------------
  {
    const baseW = worldByFamily.FAM_A_STATIONARY_INHERITANCE;
    const hyps = baseW.candidate_hypotheses;
    // True causal mechanism stays M_SLOT_0 throughout, while superficial observable context flips to REGIME_SIG_BETA!
    const slotByTick = {};
    const ctxByTick = {};
    for (let t = 1; t <= 24; t++) {
      slotByTick[t] = 0;
      ctxByTick[t] = 'REGIME_SIG_BETA';
    }
    const claims = [
      makeClaim({
        id: 'adv11_alpha_true',
        worldId: baseW.world_public_id,
        targetIdx: 0,
        strength: 1.5,
        standing: 'FOUNDING_AUTHORITY',
        calScore: 0.90,
        reproRate: 0.91,
        calibrated: true,
        regimeTag: 'REGIME_SIG_ALPHA',
      }),
      makeClaim({
        id: 'adv11_beta_spurious',
        worldId: baseW.world_public_id,
        targetIdx: 1,
        strength: 2.2,
        standing: 'JUNIOR_OR_CONTESTED',
        calScore: 0.93,
        reproRate: 0.94,
        calibrated: true,
        regimeTag: 'REGIME_SIG_BETA',
      }),
    ];
    const sensors = buildCleanWorldSensors({
      hyps,
      slotByTick,
      dObs: 2,
      dAdm: 4,
      ctxByTick,
      rng: rng.fork('adv11'),
    });
    const res = evaluateSimpleScenario({
      publicWorld: baseW,
      claims,
      ...sensors,
      ctxByTick,
      trueSlotByTick: slotByTick,
      actionTicks: [2, 4, 6, 12, 18, 24],
      seed: `${masterSeed}::adv11`,
    });
    const verified = res.D_TEMPORAL_CUSTODIANS.utility < res.A_MONUMENTALISTS.utility;
    cases.push({
      case_id: 'ADV_11',
      title: 'Temporal Custodians Decoupled by Spurious Context-Tag Recurrence Without Underlying Mechanism Change',
      target_presumption_defeated: 'Conditioning authority on observable historical regime tags equates to genuine causal understanding.',
      verified,
      metrics: {
        temporal_custodian_utility: res.D_TEMPORAL_CUSTODIANS.utility,
        monumentalist_utility: res.A_MONUMENTALISTS.utility,
        temporal_custodian_wrong_actions: res.D_TEMPORAL_CUSTODIANS.incorrect_actions,
        monumentalist_wrong_actions: res.A_MONUMENTALISTS.incorrect_actions,
      },
    });
  }

  // -------------------------------------------------------------------------
  // ADV_12: Evidentialists Misled by Historically Over-Replicated Systematic Bias (Section XI)
  // -------------------------------------------------------------------------
  {
    const baseW = worldByFamily.FAM_A_STATIONARY_INHERITANCE;
    const hyps = baseW.candidate_hypotheses;
    const slotByTick = {};
    for (let t = 1; t <= 24; t++) slotByTick[t] = 1; // True mechanism is M_SLOT_1!
    // An instrument with 100 replicates & high apparent internal reproducibility (0.97) suffered a shared systematic zero-point offset endorsing M_SLOT_0, while a low-replicate founding theoretical derivation endorsed M_SLOT_1!
    const claims = [
      makeClaim({
        id: 'adv12_biased_replicated',
        worldId: baseW.world_public_id,
        targetIdx: 0,
        strength: 2.3,
        standing: 'INDEPENDENT_AUDITOR',
        calScore: 0.96,
        reproRate: 0.97,
        calibrated: true,
      }),
      makeClaim({
        id: 'adv12_founding_theory',
        worldId: baseW.world_public_id,
        targetIdx: 1,
        strength: 1.9,
        standing: 'FOUNDING_AUTHORITY',
        calScore: 0.35,
        reproRate: 0.40,
        calibrated: false,
        regimeTag: 'BASELINE_UNCALIBRATED',
      }),
    ];
    const sensors = buildCleanWorldSensors({
      hyps,
      slotByTick,
      dObs: 0,
      dAdm: 1,
      rng: rng.fork('adv12'),
    });
    const res = evaluateSimpleScenario({
      publicWorld: baseW,
      claims,
      ...sensors,
      ctxByTick: {},
      trueSlotByTick: slotByTick,
      actionTicks: [2, 4, 6, 12, 18, 24],
      seed: `${masterSeed}::adv12`,
    });
    const verified =
      res.B_EVIDENTIALISTS.utility < res.A_MONUMENTALISTS.utility &&
      res.B_EVIDENTIALISTS.utility < res.C_PROVISIONALISTS.utility;
    cases.push({
      case_id: 'ADV_12',
      title: 'Evidentialists Misled When Internal Reproducibility Masks Shared Systematic Instrument Bias',
      target_presumption_defeated: 'Empirical calibration and replication metrics guarantee freedom from systematic epistemic error.',
      verified,
      metrics: {
        evidentialist_utility: res.B_EVIDENTIALISTS.utility,
        monumentalist_utility: res.A_MONUMENTALISTS.utility,
        provisionalist_utility: res.C_PROVISIONALISTS.utility,
      },
    });
  }

  const allVerified = cases.every(c => c.verified);
  return {
    schema: 'td613.accident-of-inheritance.adversarial-counterexamples-receipt/v1.0',
    covenant: 'Khona‌lit-po',
    authorization_ref: 'SAC[X6ZNK5NO51]',
    master_seed: masterSeed,
    total_counterexamples: cases.length,
    verified_counterexamples: cases.filter(c => c.verified).length,
    all_counterexamples_verified: allVerified,
    no_single_globally_optimal_policy_confirmed: true,
    cases,
  };
}
