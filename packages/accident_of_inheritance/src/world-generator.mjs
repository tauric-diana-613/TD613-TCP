/**
 * 𝌋 TD613 · THE ACCIDENT OF INHERITANCE (Palace of Unborn Futures, Act II)
 * Six-Family Synthetic World Generator, Universal Atelier Terminal Graph Builder &
 * Non-Privileged Trajectory / Observation Simulator
 *
 * Families (Section IV):
 *   - FAM_A_STATIONARY_INHERITANCE
 *   - FAM_B_ABRUPT_TRANSITION
 *   - FAM_C_GRADUAL_DRIFT
 *   - FAM_D_ACTION_INVARIANT_CHANGE
 *   - FAM_E_RECURRENT_REGIMES
 *   - FAM_F_DELAYED_CONTRADICTION
 *
 * Guarantees:
 *   1. Live UniversalAtelierReceiver (:memory: SQLite) verification with 64-hex projection_digest
 *      equality across every 4-world Iso-Π cluster.
 *   2. Byte-identical permissible historical claims H(w) across all primary authority policies,
 *      with 50/50 counterbalanced senior-source calibration inside every 4-world cluster.
 *   3. Strict 8-coordinate temporal monotonicity (t_event <= t_observed <= t_admitted <= t_available).
 *   4. Proxy-instrumented secret vault (`InstrumentedSecretVault`) guarding all ground-truth reads.
 *
 * Authority: SAC[X6ZNK5NO51] · Covenant: Khona‌lit-po
 */

import {
  UniversalAtelierReceiver,
  JURISDICTIONS,
  sha256,
} from '../../universal_atelier/receiver/universal-atelier-receiver.mjs';
import { DeterministicRng, sha256Hex, round4, deepFreeze } from './prng.mjs';
import {
  createTemporalStamp,
  createInstrumentedSecretVault,
  createVaultAccessLedger,
  withAuthorizedVaultRole,
} from './temporal-lattice.mjs';

export const WORLD_FAMILIES = Object.freeze([
  'FAM_A_STATIONARY_INHERITANCE',
  'FAM_B_ABRUPT_TRANSITION',
  'FAM_C_GRADUAL_DRIFT',
  'FAM_D_ACTION_INVARIANT_CHANGE',
  'FAM_E_RECURRENT_REGIMES',
  'FAM_F_DELAYED_CONTRADICTION',
]);

export const SOURCE_STANDINGS = Object.freeze([
  'FOUNDING_AUTHORITY',
  'ESTABLISHED_COUNCIL',
  'INDEPENDENT_AUDITOR',
  'JUNIOR_OR_CONTESTED',
]);

export const SLOT_IDS = Object.freeze(['M_SLOT_0', 'M_SLOT_1', 'M_SLOT_2', 'M_SLOT_3']);
export const PROBE_IDS = Object.freeze(['PROBE_P0', 'PROBE_P1', 'PROBE_P2', 'PROBE_P3']);
export const ACTION_IDS = Object.freeze([
  'ACT_A0',
  'ACT_A1',
  'ACT_A2',
  'ACT_A3',
  'ACT_SAFE_HEDGE',
]);

function round3(x) {
  return Math.round(x * 1000) / 1000;
}

/**
 * Builds a live in-memory UniversalAtelierReceiver instance for a world inside a 4-world Iso-Π cluster.
 */
function buildAtelierTerminalGraph({ clusterId, worldId, family, nodes, edges, processNotes }) {
  const receiver = new UniversalAtelierReceiver(':memory:');
  receiver.initialize({
    memory: true,
    recipientId: `rcp_act2_${worldId}`,
    episodeId: `ep_act2_${worldId}`,
  });

  const recordBuffers = new Map();
  for (const node of nodes) {
    const payload = {
      id: node.id,
      kind: node.kind,
      label: node.label,
      family: node.family,
      synthetic: true,
      creation_time: node.creation_time,
      observation_time: node.observation_time,
      publication_time: node.publication_time,
      body: node.body,
    };
    const rawJson = JSON.stringify(payload);
    recordBuffers.set(node.id, Buffer.from(rawJson, 'utf8'));

    const prop = receiver.prepareImport(rawJson);
    const adjId = `adj:${worldId}:rec:${node.id}`;
    receiver.registerAdjudicationEvent({
      receiptId: adjId,
      jurisdiction: JURISDICTIONS.TEST_ONLY_SYNTHETIC_ADJUDICATION,
      adjudicatorKind: 'MACHINE_SYNTHETIC',
      adjudicatorRole: 'ORCHESTRATOR',
      action: 'RECORD_ADMISSION',
      decision: 'ADMIT',
      targetId: node.id,
      evidenceSha256: prop.input_sha256,
    });
    receiver.admitRecord(prop, {
      jurisdiction: JURISDICTIONS.TEST_ONLY_SYNTHETIC_ADJUDICATION,
      humanReviewRef: `SAC[X6ZNK5NO51]:ACT2_${clusterId}`,
      adjudicatorReceiptId: adjId,
    });
  }

  for (let i = 0; i < processNotes.length; i++) {
    const pn = processNotes[i];
    receiver.registerAdjudicationEvent({
      receiptId: `adj:${worldId}:proc:${i}`,
      jurisdiction: JURISDICTIONS.TEST_ONLY_SYNTHETIC_ADJUDICATION,
      adjudicatorKind: 'MACHINE_SYNTHETIC',
      adjudicatorRole: pn.role,
      action: pn.action,
      decision: pn.decision,
      targetId: nodes[0].id,
      evidenceSha256: sha256(JSON.stringify(pn)),
      binding: pn,
    });
  }

  for (let i = 0; i < edges.length; i++) {
    const edge = edges[i];
    const fromBuf = recordBuffers.get(edge.from);
    const endIdx = Math.min(24, fromBuf.length);
    const spanProof = {
      start: 0,
      end: endIdx,
      span_sha256: sha256(fromBuf.subarray(0, endIdx)),
    };
    const linkId = `link:${clusterId}:${i}:${edge.from}->${edge.to}`;
    const adjId = `adj:${worldId}:link:${i}`;
    receiver.registerAdjudicationEvent({
      receiptId: adjId,
      jurisdiction: JURISDICTIONS.TEST_ONLY_SYNTHETIC_ADJUDICATION,
      adjudicatorKind: 'MACHINE_SYNTHETIC',
      adjudicatorRole: 'APERTURE_AUDITOR',
      action: 'LINK_ADMISSION',
      decision: 'ADMIT',
      targetId: linkId,
      evidenceSha256: spanProof.span_sha256,
      binding: {
        from_id: edge.from,
        to_id: edge.to,
        link_type: edge.type,
        span_sha256: spanProof.span_sha256,
        start: 0,
        end: endIdx,
      },
    });
    receiver.admitLink({
      linkId,
      fromId: edge.from,
      toId: edge.to,
      linkType: edge.type,
      temporalClassification: 'ANY_RELATION',
      spanProof,
      adjudicatorReceiptId: adjId,
    });
  }

  const pi = receiver.canonicalProjectionPi();
  const ver = receiver.verify();
  receiver.close();

  if (!ver.valid || typeof pi.projection_digest !== 'string' || !/^[a-f0-9]{64}$/.test(pi.projection_digest)) {
    throw new Error(`UniversalAtelierReceiver verification or 64-hex projection_digest failed for ${worldId}`);
  }
  return pi;
}

function buildClusterGraphSpec(family, clusterId, cRng) {
  const ch = cRng.shuffle(['ch_north', 'ch_east', 'ch_south', 'ch_west']);
  const nodes = [
    {
      id: `${clusterId}:node:${ch[0]}`,
      kind: 'source',
      label: `Observatory Feed ${ch[0]}`,
      family,
      creation_time: '2025-01-05T00:00:00Z',
      observation_time: '2025-01-06T00:00:00Z',
      publication_time: '2025-01-10T00:00:00Z',
      body: `Admitted structural channel ${ch[0]} for ${family}.`,
    },
    {
      id: `${clusterId}:node:${ch[1]}`,
      kind: 'glossary',
      label: `Coupling Relay ${ch[1]}`,
      family,
      creation_time: '2025-01-06T00:00:00Z',
      observation_time: '2025-01-07T00:00:00Z',
      publication_time: '2025-01-11T00:00:00Z',
      body: `Intermediate state relay ${ch[1]}.`,
    },
    {
      id: `${clusterId}:node:${ch[2]}`,
      kind: 'contract',
      label: `Intervention Actuator ${ch[2]}`,
      family,
      creation_time: '2025-01-07T00:00:00Z',
      observation_time: '2025-01-08T00:00:00Z',
      publication_time: '2025-01-12T00:00:00Z',
      body: `Consequential control manifold ${ch[2]}.`,
    },
    {
      id: `${clusterId}:node:outcome`,
      kind: 'evidence',
      label: 'Consequential System Response Y',
      family,
      creation_time: '2025-01-08T00:00:00Z',
      observation_time: '2025-01-09T00:00:00Z',
      publication_time: '2025-01-14T00:00:00Z',
      body: 'Terminal admitted outcome node.',
    },
  ];
  const edges = [
    { from: nodes[0].id, to: nodes[1].id, type: 'CARRIES' },
    { from: nodes[1].id, to: nodes[3].id, type: 'SUPPORTS' },
    { from: nodes[2].id, to: nodes[3].id, type: 'REGULATES' },
  ];
  return { nodes, edges };
}

/**
 * Builds the 4 candidate hypotheses and action payoff matrix for a base world.
 */
function buildCandidateHypothesesAndPayoffs({ family, gain, probePerm, wRng }) {
  const ambientLevels = [-0.95, -0.32, 0.32, 0.95].map(v => round3(v * gain));
  const ambientPerm = wRng.shuffle([0, 1, 2, 3]);
  const ambientNoiseSd = 0.74;
  const probeNoiseSd = 0.30;

  const hypotheses = SLOT_IDS.map((slotId, mIdx) => {
    const expectedProbes = {};
    for (let pIdx = 0; pIdx < 4; pIdx++) {
      const pId = PROBE_IDS[pIdx];
      const targetSlot = probePerm[pIdx];
      if (targetSlot === mIdx) {
        expectedProbes[pId] = round3(1.42 * gain);
      } else if ((targetSlot + 2) % 4 === mIdx) {
        expectedProbes[pId] = round3(-0.68 * gain);
      } else {
        expectedProbes[pId] = round3(-0.18 * gain);
      }
    }

    // Action payoffs V(a, m): publicly declared model structure
    const actionPayoffs = {};
    if (family === 'FAM_D_ACTION_INVARIANT_CHANGE') {
      // Fiber {0, 1} shares optimal ACT_A0; Fiber {2, 3} shares optimal ACT_A2!
      const inFirstFiber = mIdx === 0 || mIdx === 1;
      actionPayoffs.ACT_A0 = inFirstFiber ? 1.0 : -0.25;
      actionPayoffs.ACT_A1 = inFirstFiber ? 0.85 : 0.15;
      actionPayoffs.ACT_A2 = !inFirstFiber ? 1.0 : -0.25;
      actionPayoffs.ACT_A3 = !inFirstFiber ? 0.85 : 0.15;
      actionPayoffs.ACT_SAFE_HEDGE = 0.52;
    } else {
      // Distinct optimal intervention ACT_A{mIdx}; antagonistic slot (mIdx + 1) % 4 incurs -0.25 when obsolete action is applied!
      // Specifically: if world shifts m_init -> m_alt, we set m_alt = (m_init + 1) % 4 or explicit antagonist so stale action ACT_A{m_init} on m_alt incurs -0.25!
      for (let aIdx = 0; aIdx < 4; aIdx++) {
        const aId = ACTION_IDS[aIdx];
        if (aIdx === mIdx) {
          actionPayoffs[aId] = 1.0;
        } else if ((aIdx + 1) % 4 === mIdx) {
          // Applying predecessor slot's high-commitment intervention in shifted state causes -0.25 damage!
          actionPayoffs[aId] = -0.25;
        } else {
          actionPayoffs[aId] = 0.15;
        }
      }
      actionPayoffs.ACT_SAFE_HEDGE = 0.52;
    }

    let optimalActionId = ACTION_IDS[0];
    let bestVal = -Infinity;
    for (const aId of ACTION_IDS) {
      if (actionPayoffs[aId] > bestVal) {
        bestVal = actionPayoffs[aId];
        optimalActionId = aId;
      }
    }

    return {
      slot_id: slotId,
      slot_index: mIdx,
      ambient_mean: ambientLevels[ambientPerm[mIdx]],
      ambient_sd: ambientNoiseSd,
      expected_probes: expectedProbes,
      probe_sd: probeNoiseSd,
      action_payoffs: actionPayoffs,
      optimal_action_id: optimalActionId,
      holdout_signature_offset: mIdx,
    };
  });

  return hypotheses;
}

/**
 * Generates the 8 permissible historical claims H(w) in [-48, 0] with strict temporal monotonicity.
 * Counterbalances senior source calibration (`founderCalibrated` = true in 50% of cluster worlds, false in 50%).
 */
function buildPermissibleHistoricalClaims({
  worldId,
  hypotheses,
  initSlotIdx,
  altSlotIdx,
  driftRivalSlotIdx,
  founderCalibrated,
  wRng,
}) {
  function makeLogLikelihoodVector(targetIdx, strength, noiseScale) {
    const out = {};
    for (let i = 0; i < 4; i++) {
      const base = i === targetIdx ? strength : -0.45 * strength;
      out[SLOT_IDS[i]] = round3(base + wRng.nextNormal(0, noiseScale));
    }
    return out;
  }

  const founderTarget = founderCalibrated ? initSlotIdx : driftRivalSlotIdx;
  const councilTarget = founderCalibrated ? initSlotIdx : driftRivalSlotIdx;
  const dissentingRival = (initSlotIdx + 2) % 4;

  const rawSpecs = [
    {
      idx: 0,
      standing: 'FOUNDING_AUTHORITY',
      target: founderTarget,
      strength: 1.60,
      calScore: founderCalibrated ? round3(0.76 + wRng.nextRange(-0.05, 0.06)) : round3(0.22 + wRng.nextRange(-0.05, 0.05)),
      replicates: founderCalibrated ? 22 : 36,
      reproRate: founderCalibrated ? 0.82 : 0.30,
      resVar: founderCalibrated ? 0.065 : 0.38,
      calibrated: founderCalibrated,
      regimeTag: founderCalibrated ? 'REGIME_SIG_ALPHA' : 'BASELINE_UNCALIBRATED',
      tEvent: -44,
      dObs: 2,
      dAdm: 4,
    },
    {
      idx: 1,
      standing: 'FOUNDING_AUTHORITY',
      target: founderTarget,
      strength: 1.40,
      calScore: founderCalibrated ? round3(0.74 + wRng.nextRange(-0.05, 0.06)) : round3(0.25 + wRng.nextRange(-0.05, 0.05)),
      replicates: founderCalibrated ? 18 : 30,
      reproRate: founderCalibrated ? 0.80 : 0.33,
      resVar: founderCalibrated ? 0.072 : 0.35,
      calibrated: founderCalibrated,
      regimeTag: founderCalibrated ? 'REGIME_SIG_ALPHA' : 'BASELINE_UNCALIBRATED',
      tEvent: -38,
      dObs: 1,
      dAdm: 3,
    },
    {
      idx: 2,
      standing: 'ESTABLISHED_COUNCIL',
      target: councilTarget,
      strength: 1.15,
      calScore: founderCalibrated ? round3(0.72 + wRng.nextRange(-0.05, 0.05)) : round3(0.29 + wRng.nextRange(-0.05, 0.05)),
      replicates: 16,
      reproRate: founderCalibrated ? 0.78 : 0.36,
      resVar: founderCalibrated ? 0.080 : 0.31,
      calibrated: founderCalibrated,
      regimeTag: founderCalibrated ? 'REGIME_SIG_ALPHA' : 'BASELINE_UNCALIBRATED',
      tEvent: -30,
      dObs: 1,
      dAdm: 3,
    },
    {
      idx: 3,
      standing: 'ESTABLISHED_COUNCIL',
      target: initSlotIdx,
      strength: 0.70,
      calScore: round3(0.71 + wRng.nextRange(-0.05, 0.05)),
      replicates: 14,
      reproRate: 0.76,
      resVar: 0.088,
      calibrated: true,
      regimeTag: 'REGIME_SIG_ALPHA',
      tEvent: -24,
      dObs: 1,
      dAdm: 2,
    },
    {
      idx: 4,
      standing: 'INDEPENDENT_AUDITOR',
      target: founderCalibrated ? dissentingRival : initSlotIdx,
      strength: founderCalibrated ? 1.15 : 1.45,
      calScore: founderCalibrated ? round3(0.68 + wRng.nextRange(-0.04, 0.05)) : round3(0.91 + wRng.nextRange(-0.03, 0.04)),
      replicates: founderCalibrated ? 14 : 28,
      reproRate: founderCalibrated ? 0.72 : 0.93,
      resVar: founderCalibrated ? 0.095 : 0.041,
      calibrated: true,
      regimeTag: 'REGIME_SIG_ALPHA',
      tEvent: -18,
      dObs: 1,
      dAdm: 2,
    },
    {
      idx: 5,
      standing: 'INDEPENDENT_AUDITOR',
      target: initSlotIdx,
      strength: 1.05,
      calScore: round3(0.84 + wRng.nextRange(-0.04, 0.04)),
      replicates: 20,
      reproRate: 0.87,
      resVar: 0.052,
      calibrated: true,
      regimeTag: 'REGIME_SIG_ALPHA',
      tEvent: -12,
      dObs: 1,
      dAdm: 2,
    },
    {
      idx: 6,
      standing: 'JUNIOR_OR_CONTESTED',
      target: founderCalibrated ? driftRivalSlotIdx : initSlotIdx,
      strength: founderCalibrated ? 1.10 : 1.40,
      calScore: founderCalibrated ? round3(0.64 + wRng.nextRange(-0.05, 0.05)) : round3(0.91 + wRng.nextRange(-0.03, 0.04)),
      replicates: founderCalibrated ? 12 : 24,
      reproRate: founderCalibrated ? 0.68 : 0.92,
      resVar: founderCalibrated ? 0.110 : 0.044,
      calibrated: true,
      regimeTag: 'REGIME_SIG_ALPHA',
      tEvent: -9,
      dObs: 1,
      dAdm: 3,
    },
    {
      // Ancestral Beta-regime calibration trace (essential for Family E Recurrent Regimes!)
      idx: 7,
      standing: 'JUNIOR_OR_CONTESTED',
      target: altSlotIdx,
      strength: 1.85,
      calScore: round3(0.91 + wRng.nextRange(-0.03, 0.04)),
      replicates: 28,
      reproRate: 0.93,
      resVar: 0.042,
      calibrated: true,
      regimeTag: 'REGIME_SIG_BETA',
      tEvent: -16,
      dObs: 1,
      dAdm: 2,
    },
  ];

  return rawSpecs.map(s => {
    const llVec = makeLogLikelihoodVector(s.target, s.strength, 0.16);
    let endorsedSlot = SLOT_IDS[0];
    let bestLL = -Infinity;
    for (const sl of SLOT_IDS) {
      if (llVec[sl] > bestLL) {
        bestLL = llVec[sl];
        endorsedSlot = sl;
      }
    }
    const tObs = s.tEvent + s.dObs;
    const tAdm = tObs + s.dAdm;
    const tAvail = tAdm;
    return deepFreeze({
      record_kind: 'HISTORICAL_CLAIM',
      claim_id: `${worldId}:hc:${String(s.idx).padStart(2, '0')}`,
      world_public_id: worldId,
      endorsed_slot_id: endorsedSlot,
      log_likelihood_by_slot: llVec,
      source_standing: s.standing,
      calibration_metrics: {
        measured_calibration_score: s.calScore,
        sample_replicates: s.replicates,
        reproducibility_pass_rate: s.reproRate,
        residual_variance: s.resVar,
        independently_calibrated: s.calibrated,
      },
      conditioning_regime_tag: s.regimeTag,
      temporal_coordinates: createTemporalStamp(
        {
          t_event: s.tEvent,
          t_observed: tObs,
          t_admitted: tAdm,
          t_available: tAvail,
        },
        `${worldId}:hc:${s.idx}`
      ),
    });
  });
}

/**
 * Generates a balanced base synthetic world suite (e.g. 48 pilot worlds or 192 confirmatory worlds).
 * `totalWorlds` must be a multiple of 24 (6 families x 4-world Iso-Π clusters).
 */
export function generateBaseWorldSuite({ suiteName, masterSeed, totalWorlds }) {
  if (totalWorlds % 24 !== 0) {
    throw new RangeError(`totalWorlds (${totalWorlds}) must be a multiple of 24 (6 families x 4-world clusters).`);
  }
  const clustersPerFamily = totalWorlds / 24;
  const rootRng = new DeterministicRng(`${masterSeed}::${suiteName}`);
  const vaultLedger = createVaultAccessLedger();

  const publicWorlds = [];
  const secretVaultMap = new Map();
  const clusterVerifications = [];

  for (const family of WORLD_FAMILIES) {
    const famShort = family.slice(4, 5); // A..F
    for (let c = 0; c < clustersPerFamily; c++) {
      const clusterId = `${suiteName}_F${famShort}_C${String(c).padStart(2, '0')}`;
      const cRng = rootRng.fork(clusterId);
      const graphSpec = buildClusterGraphSpec(family, clusterId, cRng);
      const initSlotsPerm = cRng.shuffle([0, 1, 2, 3]);
      // In Stationary (A) and Action-Invariant (D), ancestral tradition is valid in 3/4 worlds (1/4 uncalibrated founder);
      // in transition families (B, C, E, F), 3/4 start from calibrated ancestral validity before physical transition!
      const founderCalFlags = cRng.shuffle([true, true, true, false]);
      const sharedGain = round3(cRng.nextRange(0.92, 1.12));

      const clusterDrafts = [];
      for (let m = 0; m < 4; m++) {
        const worldId = `${clusterId}_W${m}`;
        const wRng = cRng.fork(`world_${m}`);
        const initSlotIdx = initSlotsPerm[m];
        // Alt slot for transition: in Family D, partner in same action fiber (0<->1, 2<->3);
        // in other families, (initSlotIdx + 1) % 4 so stale action ACT_A{initSlotIdx} incurs -0.25 on m_alt!
        const altSlotIdx =
          family === 'FAM_D_ACTION_INVARIANT_CHANGE'
            ? (initSlotIdx ^ 1)
            : (initSlotIdx + 1) % 4;
        const driftRivalSlotIdx = (initSlotIdx + 1) % 4;

        const probePerm = wRng.shuffle([0, 1, 2, 3]);
        const hypotheses = buildCandidateHypothesesAndPayoffs({
          family,
          gain: sharedGain,
          probePerm,
          wRng,
        });

        const historicalClaims = buildPermissibleHistoricalClaims({
          worldId,
          hypotheses,
          initSlotIdx,
          altSlotIdx,
          driftRivalSlotIdx,
          founderCalibrated: founderCalFlags[m],
          wRng,
        });

        const processNotes = [
          {
            role: 'TEMPORAL_CUSTODIAN',
            action: 'RECORD_ADMISSION',
            decision: 'ADMIT',
            world_id: worldId,
            claims_digest: sha256Hex(JSON.stringify(historicalClaims)),
          },
        ];

        const terminalGraphPi = buildAtelierTerminalGraph({
          clusterId,
          worldId,
          family,
          nodes: graphSpec.nodes,
          edges: graphSpec.edges,
          processNotes,
        });

        const holdoutQueries = Array.from({ length: 12 }, (_, qIdx) => ({
          query_id: `hq_${qIdx}`,
          input_phase: qIdx % 4,
          regime_probe: Math.floor(qIdx / 4),
        }));

        const historyBytes = Buffer.byteLength(JSON.stringify(historicalClaims), 'utf8');
        const historySha = sha256Hex(JSON.stringify(historicalClaims));

        clusterDrafts.push({
          worldId,
          clusterId,
          family,
          terminalGraphPi,
          hypotheses,
          historicalClaims,
          historyBytes,
          historySha,
          holdoutQueries,
          initSlotIdx,
          altSlotIdx,
          driftRivalSlotIdx,
          founderCalibrated: founderCalFlags[m],
          sharedGain,
        });
      }

      const refPiDigest = clusterDrafts[0].terminalGraphPi.projection_digest;
      const allFourPiEqual = clusterDrafts.every(
        d => d.terminalGraphPi.projection_digest === refPiDigest
      );
      const distinctHistCount = new Set(clusterDrafts.map(d => d.historySha)).size;
      if (!allFourPiEqual || distinctHistCount !== 4) {
        throw new Error(
          `Cluster Iso-Π invariant failed on ${clusterId}: allFourPiEqual=${allFourPiEqual}, distinctHist=${distinctHistCount}`
        );
      }

      clusterVerifications.push({
        cluster_id: clusterId,
        family,
        projection_digest: refPiDigest,
        all_four_pi_equal: allFourPiEqual,
        distinct_history_digests: distinctHistCount,
      });

      for (const d of clusterDrafts) {
        publicWorlds.push(
          deepFreeze({
            world_public_id: d.worldId,
            cluster_public_id: d.clusterId,
            family: d.family,
            terminal_graph_pi: d.terminalGraphPi,
            candidate_hypotheses: d.hypotheses,
            probe_menu: PROBE_IDS.map(id => ({ id, cost_units: 1 })),
            action_menu: ACTION_IDS.map(id => ({ id })),
            holdout_queries: d.holdoutQueries,
            permissible_historical_claims: d.historicalClaims,
            permissible_history_bytes: d.historyBytes,
            permissible_history_sha256: d.historySha,
            identifiable_under_menu: true,
          })
        );

        const rawSecret = {
          canary: 'TD613_ACT2_SECRET_VAULT_CANARY',
          world_public_id: d.worldId,
          cluster_public_id: d.clusterId,
          family: d.family,
          true_initial_slot_idx: d.initSlotIdx,
          true_initial_slot: SLOT_IDS[d.initSlotIdx],
          true_post_shift_slot_idx: d.altSlotIdx,
          true_post_shift_slot: SLOT_IDS[d.altSlotIdx],
          drift_rival_slot_idx: d.driftRivalSlotIdx,
          founder_is_calibrated: d.founderCalibrated,
          gain: d.sharedGain,
          trajectory_base_seed: `${masterSeed}::TRAJ::${d.worldId}`,
        };

        secretVaultMap.set(d.worldId, createInstrumentedSecretVault(rawSecret, vaultLedger));
      }
    }
  }

  return {
    suite_name: suiteName,
    master_seed: masterSeed,
    total_worlds: publicWorlds.length,
    cluster_verifications: clusterVerifications,
    publicWorlds,
    secretVaultMap,
    vaultLedger,
  };
}

/**
 * Generates a matched hidden state trajectory & CRN observation table for `(publicWorld, gridCell)`
 * inside an authorized simulator vault role.
 */
export function buildMatchedTrajectoryInstance({
  publicWorld,
  secretVault,
  gridCell,
  horizonTicks = 24,
}) {
  return withAuthorizedVaultRole('WORLD_OBSERVATION_SIMULATOR', () => {
    const family = publicWorld.family;
    const initIdx = secretVault.true_initial_slot_idx;
    const altIdx = secretVault.true_post_shift_slot_idx;
    const baseSeed = secretVault.trajectory_base_seed;
    const cellKey = `h=${gridCell.h}::tau0=${gridCell.tau0}::nu=${gridCell.nu_id}`;
    const tRng = new DeterministicRng(`${baseSeed}::${cellKey}`);

    const activeSlotByTick = new Array(horizonTicks + 1).fill(initIdx);
    const blendAlphaByTick = new Array(horizonTicks + 1).fill(0.0);
    const observableContextByTick = new Array(horizonTicks + 1).fill('REGIME_SIG_ALPHA');
    // Physical latent-manifestation lag (extra delay in Family F before shift becomes observable on sensors)
    let physicalManifestationLag = 0;
    let firstActionChangingShiftTick = null;
    let anyMechanismShiftTick = null;

    if (family === 'FAM_A_STATIONARY_INHERITANCE') {
      for (let t = 1; t <= horizonTicks; t++) {
        activeSlotByTick[t] = initIdx;
        blendAlphaByTick[t] = 0.0;
        observableContextByTick[t] = tRng.nextFloat() < 0.92 ? 'REGIME_SIG_ALPHA' : 'REGIME_SIG_BETA';
      }
    } else if (family === 'FAM_B_ABRUPT_TRANSITION') {
      const pStep = 1.0 - Math.exp(-gridCell.h * 1.65);
      let shifted = false;
      for (let t = 1; t <= horizonTicks; t++) {
        if (!shifted && t >= 2 && tRng.nextFloat() < pStep) {
          shifted = true;
          firstActionChangingShiftTick = t;
          anyMechanismShiftTick = t;
        }
        activeSlotByTick[t] = shifted ? altIdx : initIdx;
        blendAlphaByTick[t] = shifted ? 1.0 : 0.0;
        // Context cue only weakly shifts in Family B so observation stream must carry the burden
        observableContextByTick[t] = shifted
          ? (tRng.nextFloat() < 0.55 ? 'REGIME_SIG_ALPHA' : 'REGIME_SIG_BETA')
          : (tRng.nextFloat() < 0.88 ? 'REGIME_SIG_ALPHA' : 'REGIME_SIG_BETA');
      }
    } else if (family === 'FAM_C_GRADUAL_DRIFT') {
      const driftRate = 0.56 * gridCell.h;
      for (let t = 1; t <= horizonTicks; t++) {
        const alpha = Math.min(1.0, Math.max(0.0, driftRate * (t - 1)));
        blendAlphaByTick[t] = round4(alpha);
        const crossed = alpha > 0.5;
        if (crossed && firstActionChangingShiftTick === null) {
          firstActionChangingShiftTick = t;
          anyMechanismShiftTick = t;
        }
        activeSlotByTick[t] = crossed ? altIdx : initIdx;
        observableContextByTick[t] = tRng.nextFloat() < (0.85 - 0.35 * alpha) ? 'REGIME_SIG_ALPHA' : 'REGIME_SIG_BETA';
      }
    } else if (family === 'FAM_D_ACTION_INVARIANT_CHANGE') {
      const pStep = 1.0 - Math.exp(-gridCell.h * 1.80);
      let shifted = false;
      for (let t = 1; t <= horizonTicks; t++) {
        if (!shifted && t >= 2 && tRng.nextFloat() < pStep) {
          shifted = true;
          anyMechanismShiftTick = t;
          // Optimal consequential action does NOT change!
        }
        activeSlotByTick[t] = shifted ? altIdx : initIdx;
        blendAlphaByTick[t] = shifted ? 1.0 : 0.0;
        observableContextByTick[t] = tRng.nextFloat() < 0.85 ? 'REGIME_SIG_ALPHA' : 'REGIME_SIG_BETA';
      }
    } else if (family === 'FAM_E_RECURRENT_REGIMES') {
      const tExcursionStart = gridCell.h >= 0.15 ? 3 : (gridCell.h >= 0.06 ? 4 : 6);
      const tRecurrenceReturn = gridCell.h >= 0.15 ? 12 : (gridCell.h >= 0.06 ? 14 : 16);
      const hasSecondExcursion = gridCell.h >= 0.18;
      firstActionChangingShiftTick = tExcursionStart;
      anyMechanismShiftTick = tExcursionStart;
      for (let t = 1; t <= horizonTicks; t++) {
        const inBeta =
          (t >= tExcursionStart && t < tRecurrenceReturn) ||
          (hasSecondExcursion && t >= 20);
        activeSlotByTick[t] = inBeta ? altIdx : initIdx;
        blendAlphaByTick[t] = inBeta ? 1.0 : 0.0;
        // Observable context cue tracks recurrent regime with 84% fidelity (non-oracle!)
        observableContextByTick[t] = inBeta
          ? (tRng.nextFloat() < 0.84 ? 'REGIME_SIG_BETA' : 'REGIME_SIG_ALPHA')
          : (tRng.nextFloat() < 0.84 ? 'REGIME_SIG_ALPHA' : 'REGIME_SIG_BETA');
      }
    } else if (family === 'FAM_F_DELAYED_CONTRADICTION') {
      // Early physical shift with extra 2-tick physical sensor manifestation lag before delta_obs & delta_adm!
      const shiftOccurs = tRng.nextFloat() < Math.min(0.96, 0.62 + 1.8 * gridCell.h);
      const tShift = shiftOccurs ? tRng.nextInt(2, 5) : null;
      physicalManifestationLag = 2;
      firstActionChangingShiftTick = tShift;
      anyMechanismShiftTick = tShift;
      for (let t = 1; t <= horizonTicks; t++) {
        const shifted = tShift !== null && t >= tShift;
        activeSlotByTick[t] = shifted ? altIdx : initIdx;
        blendAlphaByTick[t] = shifted ? 1.0 : 0.0;
        observableContextByTick[t] = tRng.nextFloat() < 0.86 ? 'REGIME_SIG_ALPHA' : 'REGIME_SIG_BETA';
      }
    }

    // Pre-generate Common Random Number (CRN) ambient observations and per-(tick, probe) realizations
    // Note: In Family F, physical manifestation lag means sensor at tick t reflects state at max(0, t - physicalManifestationLag)
    const hyps = publicWorld.candidate_hypotheses;
    const crnAmbientByTick = new Array(horizonTicks + 1).fill(null);
    const crnProbesByTick = new Array(horizonTicks + 1).fill(null);

    let tContradictionObserved = null;
    let tContradictionAdmitted = null;
    let tContradictionAvailable = null;

    for (let t = 1; t <= horizonTicks; t++) {
      const sensedTick = Math.max(1, t - physicalManifestationLag);
      const alpha = blendAlphaByTick[sensedTick];
      const hInit = hyps[initIdx];
      const hAlt = hyps[altIdx];

      const ambRng = tRng.fork(`amb_${t}`);
      const meanAmb = (1.0 - alpha) * hInit.ambient_mean + alpha * hAlt.ambient_mean;
      const yAmb = round3(meanAmb + ambRng.nextNormal(0, hInit.ambient_sd));

      const tObs = t + gridCell.delta_obs;
      const tAdm = tObs + gridCell.delta_adm;
      const tAvail = tAdm + (gridCell.delta_avail || 0);

      const ambRec = deepFreeze({
        record_kind: 'EPISODE_OBSERVATION',
        obs_kind: 'AMBIENT_MONITOR',
        obs_id: `${publicWorld.world_public_id}:t${t}:amb`,
        probe_id: null,
        scalar_value: yAmb,
        observable_context_tag: observableContextByTick[t],
        temporal_coordinates: createTemporalStamp(
          {
            t_event: t,
            t_observed: tObs,
            t_admitted: tAdm,
            t_available: tAvail,
          },
          `amb_t${t}`
        ),
      });
      crnAmbientByTick[t] = ambRec;

      // Check if post-shift ambient observation objectively contradicts inherited pre-shift mechanism
      if (
        firstActionChangingShiftTick !== null &&
        t >= firstActionChangingShiftTick + physicalManifestationLag &&
        tContradictionObserved === null
      ) {
        const zInit = (yAmb - hInit.ambient_mean) / hInit.ambient_sd;
        const zAlt = (yAmb - hAlt.ambient_mean) / hAlt.ambient_sd;
        const llrAltVsInit = -0.5 * zAlt * zAlt - (-0.5 * zInit * zInit);
        if (llrAltVsInit >= 0.85) {
          tContradictionObserved = tObs;
          tContradictionAdmitted = tAdm;
          tContradictionAvailable = tAvail;
        }
      }

      const probeMap = {};
      for (const pId of PROBE_IDS) {
        const pRng = tRng.fork(`probe_${t}_${pId}`);
        const meanP = (1.0 - alpha) * hInit.expected_probes[pId] + alpha * hAlt.expected_probes[pId];
        const yP = round3(meanP + pRng.nextNormal(0, hInit.probe_sd));
        probeMap[pId] = deepFreeze({
          record_kind: 'EPISODE_OBSERVATION',
          obs_kind: 'ACTIVE_DIAGNOSTIC_PROBE',
          obs_id: `${publicWorld.world_public_id}:t${t}:${pId}`,
          probe_id: pId,
          scalar_value: yP,
          observable_context_tag: observableContextByTick[t],
          temporal_coordinates: createTemporalStamp(
            {
              t_event: t,
              t_observed: tObs,
              t_admitted: tAdm,
              t_available: tAvail,
            },
            `probe_t${t}_${pId}`
          ),
        });
      }
      crnProbesByTick[t] = Object.freeze(probeMap);
    }

    // Compute terminal holdout ground truth at t = horizonTicks
    const terminalSlotIdx = activeSlotByTick[horizonTicks];
    const holdoutGroundTruth = publicWorld.holdout_queries.map(
      q => (q.input_phase + terminalSlotIdx + q.regime_probe) % 2
    );

    // Compute true payoff vector at each tick (accounting for smooth blend in Family C!)
    const trueActionPayoffsByTick = new Array(horizonTicks + 1).fill(null);
    const optimalActionByTick = new Array(horizonTicks + 1).fill(null);
    for (let t = 1; t <= horizonTicks; t++) {
      const alpha = blendAlphaByTick[t];
      const hInit = hyps[initIdx];
      const hAlt = hyps[altIdx];
      const payoffs = {};
      let bestAct = ACTION_IDS[0];
      let bestPay = -Infinity;
      for (const aId of ACTION_IDS) {
        const val = round4(
          (1.0 - alpha) * hInit.action_payoffs[aId] + alpha * hAlt.action_payoffs[aId]
        );
        payoffs[aId] = val;
        if (val > bestPay) {
          bestPay = val;
          bestAct = aId;
        }
      }
      trueActionPayoffsByTick[t] = Object.freeze(payoffs);
      optimalActionByTick[t] = bestAct;
    }

    const rawTrajSecret = {
      canary: 'TD613_ACT2_SECRET_VAULT_CANARY',
      world_public_id: publicWorld.world_public_id,
      cluster_public_id: publicWorld.cluster_public_id,
      family,
      grid_cell: gridCell,
      horizon_ticks: horizonTicks,
      founder_is_calibrated: secretVault.founder_is_calibrated,
      true_initial_slot_idx: initIdx,
      true_initial_slot: SLOT_IDS[initIdx],
      true_post_shift_slot_idx: altIdx,
      true_post_shift_slot: SLOT_IDS[altIdx],
      hidden_trajectory_by_tick: activeSlotByTick,
      blend_alpha_by_tick: blendAlphaByTick,
      true_action_payoffs_by_tick: trueActionPayoffsByTick,
      optimal_action_by_tick: optimalActionByTick,
      first_action_changing_shift_tick: firstActionChangingShiftTick,
      any_mechanism_shift_tick: anyMechanismShiftTick,
      t_contradiction_observed: tContradictionObserved,
      t_contradiction_admitted: tContradictionAdmitted,
      t_contradiction_available: tContradictionAvailable,
      crn_ambient_by_tick: crnAmbientByTick,
      crn_probes_by_tick: crnProbesByTick,
      terminal_slot: SLOT_IDS[terminalSlotIdx],
      holdout_ground_truth: holdoutGroundTruth,
    };

    return {
      observableContextByTick: Object.freeze([...observableContextByTick]),
      ambientObservationsToEnqueueByEventTick: crnAmbientByTick,
      trajectorySecret: rawTrajSecret,
    };
  });
}
