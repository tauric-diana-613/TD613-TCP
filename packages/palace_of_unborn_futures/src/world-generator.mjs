/**
 * 𝌋 TD613 · THE PALACE OF UNBORN FUTURES
 * Synthetic Hidden-World Generator & Universal Atelier Estate Builder
 *
 * Constructs Iso-Π Quartets across four mathematical hidden-world families:
 *   - Family A: CAUSAL_LOOKALIKES (Markov-equivalent SCMs with divergent do() interventions)
 *   - Family B: HIGHER_ORDER_RELATIONS (GF(2) pairwise-null vs 2-way/3-way parity hyperedges)
 *   - Family C: TEMPORAL_INHERITANCE (Delayed lags, withdrawn hazards & 6-clock inversions)
 *   - Family D: THE_IMPOSSIBLE_LIBRARY (Missing modular/holonomic predicates, exterior nullspace & noise controls)
 *
 * Guarantees:
 *   1. Exact SHA-256 terminal graph equality Π(G_0) = Π(G_1) = Π(G_2) = Π(G_3) inside every quartet,
 *      verified via live UniversalAtelierReceiver SQLite instances.
 *   2. Strict physical separation between GroundTruthSecretVault and InvestigatorBaseView.
 *   3. Authentic Twin-World pairing for Condition V (THE EXILES): each world w_{q,k} is paired
 *      with the genuine, unmodified history H(w_{q, (k+1) mod 4}) of a distinct mechanism in the
 *      exact same Iso-Π Quartet.
 *   4. Explicit experimental isolation tag on Condition IV (THE FALSE PROPHETS) fabricated histories.
 *
 * Authority: SAC[X6ZNK5NO51] · Covenant: Khona‌lit-po
 */

import {
  UniversalAtelierReceiver,
  JURISDICTIONS,
  sha256,
} from '../../universal_atelier/receiver/universal-atelier-receiver.mjs';
import { DeterministicRng, sha256Hex } from './prng.mjs';

export const FAMILIES = Object.freeze([
  'A_CAUSAL_LOOKALIKES',
  'B_HIGHER_ORDER_RELATIONS',
  'C_TEMPORAL_INHERITANCE',
  'D_IMPOSSIBLE_LIBRARY',
]);

export const HISTORY_CATEGORIES = Object.freeze([
  'CAT_CALIBRATED_REJECTIONS',
  'CAT_TEMPORAL_LEDGER',
  'CAT_RESIDUAL_ANOMALIES',
  'CAT_EPOCH0_DRIFT_TRIALS',
  'CAT_PROVENANCE_AND_SENSITIVE',
  'CAT_ADMINISTRATIVE_CLUTTER',
]);

const SENSITIVE_STYLES = Object.freeze([
  {
    cohort_tag: 'COHORT_CHERSONESOS_ALPHA',
    reviewer_bigrams: ['strictly deferred', 'coastal ledger', 'margin noted'],
    ms_mod: 0,
  },
  {
    cohort_tag: 'COHORT_BOSPORAN_BETA',
    reviewer_bigrams: ['provisionally sealed', 'strait witness', 'folio bound'],
    ms_mod: 1,
  },
  {
    cohort_tag: 'COHORT_OLBIA_GAMMA',
    reviewer_bigrams: ['harbor docket', 'estuary check', 'quarantine held'],
    ms_mod: 2,
  },
  {
    cohort_tag: 'COHORT_THEODOSIA_DELTA',
    reviewer_bigrams: ['ridge archive', 'terrace audit', 'lantern verified'],
    ms_mod: 3,
  },
]);

function round3(x) {
  return Math.round(x * 1000) / 1000;
}

/**
 * Populates a UniversalAtelierReceiver instance with admitted terminal nodes & edges
 * common to an Iso-Π quartet, plus world-specific adjudication history events.
 */
function buildAtelierWorldInstance({ quartetId, worldId, family, nodes, edges, historyAdjudications }) {
  const receiver = new UniversalAtelierReceiver(':memory:');
  receiver.initialize({
    memory: true,
    recipientId: `rcp_${worldId}`,
    episodeId: `ep_${worldId}`,
  });

  const recordBuffers = new Map();

  for (const node of nodes) {
    const recordPayload = {
      id: node.id,
      kind: node.kind,
      label: node.label,
      family: node.family,
      synthetic: true,
      creation_time: node.creation_time,
      publication_time: node.publication_time,
      observation_time: node.observation_time,
      body: node.body,
    };
    const rawJson = JSON.stringify(recordPayload);
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
      humanReviewRef: `SAC[X6ZNK5NO51]:SYNTHETIC_${quartetId}`,
      adjudicatorReceiptId: adjId,
    });
  }

  // Register world-specific non-admitted process history events (rejections, withdrawals, holds)
  for (let i = 0; i < historyAdjudications.length; i++) {
    const ev = historyAdjudications[i];
    receiver.registerAdjudicationEvent({
      receiptId: `adj:${worldId}:hist:${i}:${ev.tag}`,
      jurisdiction: JURISDICTIONS.TEST_ONLY_SYNTHETIC_ADJUDICATION,
      adjudicatorKind: 'MACHINE_SYNTHETIC',
      adjudicatorRole: ev.role,
      action: ev.action,
      decision: ev.decision,
      targetId: ev.targetId,
      evidenceSha256: sha256(JSON.stringify(ev.binding)),
      binding: ev.binding,
    });
  }

  // Admit terminal graph edges (identical across the quartet)
  for (let i = 0; i < edges.length; i++) {
    const edge = edges[i];
    const fromBuf = recordBuffers.get(edge.from);
    const endIdx = Math.min(24, fromBuf.length);
    const spanProof = {
      start: 0,
      end: endIdx,
      span_sha256: sha256(fromBuf.subarray(0, endIdx)),
    };
    const linkId = `link:${quartetId}:${i}:${edge.from}->${edge.to}`;
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
      temporalClassification: edge.temporalClassification || 'ANY_RELATION',
      spanProof,
      adjudicatorReceiptId: adjId,
    });
  }

  const pi = receiver.canonicalProjectionPi();
  const verification = receiver.verify();
  const exported = receiver.export();
  receiver.close();

  if (!verification.valid) {
    throw new Error(`Universal Atelier verification failed for ${worldId}`);
  }

  return {
    family,
    pi,
    atelier_summary: {
      recipient_id: exported.initial_witness.recipient_id,
      initial_witness_hash: exported.initial_witness.witness_hash,
      total_records: exported.total_records,
      total_admitted_links: exported.total_links,
      total_adjudications: exported.total_adjudications,
    },
    adjudications: exported.adjudications,
  };
}

/**
 * Generates shared quartet graph specification so Π(G) is identical across the 4 sibling worlds.
 */
function buildQuartetGraphSpec(family, quartetId, qRng) {
  const varPerm = qRng.shuffle(['alpha', 'beta', 'gamma']);
  const baseYear = 2024;

  if (family === 'A_CAUSAL_LOOKALIKES') {
    const nodes = [
      { id: `${quartetId}:var:${varPerm[0]}`, kind: 'glossary', label: `Signal Driver ${varPerm[0]}`, family: 'CausalSCM', creation_time: `${baseYear}-01-10T00:00:00Z`, publication_time: `${baseYear}-01-15T00:00:00Z`, observation_time: `${baseYear}-01-12T00:00:00Z`, body: `Upstream observable node ${varPerm[0]} in Markov equivalence class.` },
      { id: `${quartetId}:var:${varPerm[1]}`, kind: 'glossary', label: `Hub Variable ${varPerm[1]}`, family: 'CausalSCM', creation_time: `${baseYear}-01-11T00:00:00Z`, publication_time: `${baseYear}-01-16T00:00:00Z`, observation_time: `${baseYear}-01-13T00:00:00Z`, body: `Central correlated node ${varPerm[1]}.` },
      { id: `${quartetId}:var:${varPerm[2]}`, kind: 'glossary', label: `Pathway Relay ${varPerm[2]}`, family: 'CausalSCM', creation_time: `${baseYear}-01-12T00:00:00Z`, publication_time: `${baseYear}-01-17T00:00:00Z`, observation_time: `${baseYear}-01-14T00:00:00Z`, body: `Downstream correlated relay ${varPerm[2]}.` },
      { id: `${quartetId}:var:aux_lever`, kind: 'contract', label: 'Auxiliary Bypass Lever', family: 'CausalSCM', creation_time: `${baseYear}-01-13T00:00:00Z`, publication_time: `${baseYear}-01-18T00:00:00Z`, observation_time: `${baseYear}-01-15T00:00:00Z`, body: `Orthogonal control actuator.` },
      { id: `${quartetId}:target:outcome_y`, kind: 'evidence', label: 'Target Response Y', family: 'CausalSCM', creation_time: `${baseYear}-01-14T00:00:00Z`, publication_time: `${baseYear}-01-19T00:00:00Z`, observation_time: `${baseYear}-01-16T00:00:00Z`, body: `Observed passive correlation target.` },
    ];
    const edges = [
      { from: nodes[0].id, to: nodes[1].id, type: 'SUPPORTS' },
      { from: nodes[1].id, to: nodes[2].id, type: 'SUPPORTS' },
      { from: nodes[1].id, to: nodes[4].id, type: 'SUPPORTS' },
      { from: nodes[3].id, to: nodes[4].id, type: 'BOUNDS' },
    ];
    return { nodes, edges, varPerm };
  }

  if (family === 'B_HIGHER_ORDER_RELATIONS') {
    const nodes = [
      { id: `${quartetId}:ctx:carrier`, kind: 'source', label: 'Shared Carrier Field', family: 'HigherOrderGF2', creation_time: `${baseYear}-02-01T00:00:00Z`, publication_time: `${baseYear}-02-05T00:00:00Z`, observation_time: `${baseYear}-02-02T00:00:00Z`, body: 'Ambient carrier driving uniform binary marginals.' },
      { id: `${quartetId}:spin:${varPerm[0]}`, kind: 'glossary', label: `Spin Channel ${varPerm[0]}`, family: 'HigherOrderGF2', creation_time: `${baseYear}-02-02T00:00:00Z`, publication_time: `${baseYear}-02-06T00:00:00Z`, observation_time: `${baseYear}-02-03T00:00:00Z`, body: `Binary spin sensor ${varPerm[0]}.` },
      { id: `${quartetId}:spin:${varPerm[1]}`, kind: 'glossary', label: `Spin Channel ${varPerm[1]}`, family: 'HigherOrderGF2', creation_time: `${baseYear}-02-02T00:00:00Z`, publication_time: `${baseYear}-02-06T00:00:00Z`, observation_time: `${baseYear}-02-03T00:00:00Z`, body: `Binary spin sensor ${varPerm[1]}.` },
      { id: `${quartetId}:spin:${varPerm[2]}`, kind: 'glossary', label: `Spin Channel ${varPerm[2]}`, family: 'HigherOrderGF2', creation_time: `${baseYear}-02-02T00:00:00Z`, publication_time: `${baseYear}-02-06T00:00:00Z`, observation_time: `${baseYear}-02-03T00:00:00Z`, body: `Binary spin sensor ${varPerm[2]}.` },
      { id: `${quartetId}:parity:readout_y`, kind: 'evidence', label: 'Composite Parity Readout Y', family: 'HigherOrderGF2', creation_time: `${baseYear}-02-03T00:00:00Z`, publication_time: `${baseYear}-02-07T00:00:00Z`, observation_time: `${baseYear}-02-04T00:00:00Z`, body: 'Pairwise-uncorrelated binary observable.' },
    ];
    // Notice: NO pairwise spin->Y edges exist because pairwise correlations vanish!
    const edges = [
      { from: nodes[0].id, to: nodes[1].id, type: 'CARRIES' },
      { from: nodes[0].id, to: nodes[2].id, type: 'CARRIES' },
      { from: nodes[0].id, to: nodes[3].id, type: 'CARRIES' },
      { from: nodes[0].id, to: nodes[4].id, type: 'MEASURES' },
    ];
    return { nodes, edges, varPerm };
  }

  if (family === 'C_TEMPORAL_INHERITANCE') {
    const nodes = [
      { id: `${quartetId}:stage:${varPerm[0]}`, kind: 'work_route', label: `Primary Impulse Stage ${varPerm[0]}`, family: 'TemporalLag', creation_time: `${baseYear}-03-01T00:00:00Z`, publication_time: `${baseYear}-03-10T00:00:00Z`, observation_time: `${baseYear}-03-05T00:00:00Z`, body: 'Impulse actuation stage.' },
      { id: `${quartetId}:stage:${varPerm[1]}`, kind: 'work_route', label: `Precursor Gate ${varPerm[1]}`, family: 'TemporalLag', creation_time: `${baseYear}-03-01T00:00:00Z`, publication_time: `${baseYear}-03-10T00:00:00Z`, observation_time: `${baseYear}-03-02T00:00:00Z`, body: 'Asynchronous precursor stage.' },
      { id: `${quartetId}:horizon:integral_y`, kind: 'evidence', label: 'Horizon Outcome Summary Y', family: 'TemporalLag', creation_time: `${baseYear}-03-02T00:00:00Z`, publication_time: `${baseYear}-03-12T00:00:00Z`, observation_time: `${baseYear}-03-11T00:00:00Z`, body: 'Cumulative window summary stripping transient trajectory.' },
    ];
    const edges = [
      { from: nodes[0].id, to: nodes[2].id, type: 'REGULATES' },
      { from: nodes[1].id, to: nodes[0].id, type: 'SUPPORTS' },
    ];
    return { nodes, edges, varPerm };
  }

  // Family D: THE_IMPOSSIBLE_LIBRARY
  const nodes = [
    { id: `${quartetId}:attr:${varPerm[0]}`, kind: 'glossary', label: `Coordinate ${varPerm[0]} (ternary)`, family: 'ImpossibleLibrary', creation_time: `${baseYear}-04-01T00:00:00Z`, publication_time: `${baseYear}-04-04T00:00:00Z`, observation_time: `${baseYear}-04-02T00:00:00Z`, body: 'Ternary observable coordinate in {0,1,2}.' },
    { id: `${quartetId}:attr:${varPerm[1]}`, kind: 'glossary', label: `Coordinate ${varPerm[1]} (ternary)`, family: 'ImpossibleLibrary', creation_time: `${baseYear}-04-01T00:00:00Z`, publication_time: `${baseYear}-04-04T00:00:00Z`, observation_time: `${baseYear}-04-02T00:00:00Z`, body: 'Ternary observable coordinate in {0,1,2}.' },
    { id: `${quartetId}:attr:${varPerm[2]}`, kind: 'glossary', label: `Coordinate ${varPerm[2]} (binary)`, family: 'ImpossibleLibrary', creation_time: `${baseYear}-04-01T00:00:00Z`, publication_time: `${baseYear}-04-04T00:00:00Z`, observation_time: `${baseYear}-04-02T00:00:00Z`, body: 'Binary observable switch in {0,1}.' },
    { id: `${quartetId}:phenomenon:anomaly_y`, kind: 'open_question', label: 'Unresolved Phenomenon Y', family: 'ImpossibleLibrary', creation_time: `${baseYear}-04-02T00:00:00Z`, publication_time: `${baseYear}-04-06T00:00:00Z`, observation_time: `${baseYear}-04-05T00:00:00Z`, body: 'Target phenomenon only weakly bounded by monotone single-coordinate taxonomy.' },
  ];
  const edges = [
    { from: nodes[0].id, to: nodes[3].id, type: 'BOUNDS' },
    { from: nodes[1].id, to: nodes[3].id, type: 'BOUNDS' },
    { from: nodes[2].id, to: nodes[3].id, type: 'SUPPORTS' },
  ];
  return { nodes, edges, varPerm };
}

/**
 * Defines structural parameters, probe simulator, intervention simulator, holdout generator,
 * and realistic historical record generator for a single world inside a quartet.
 */
function buildWorldMechanics({
  family,
  quartetId,
  worldId,
  archetype,
  slotOrder,
  quartetSharedParams,
  wRng,
}) {
  const trueSlot = slotOrder.indexOf(archetype);
  if (trueSlot < 0) throw new Error(`Archetype ${archetype} missing from slotOrder`);
  const trueSlotId = `M_SLOT_${trueSlot}`;

  // Balanced sensitive provenance attribute S in {0,1,2,3}
  const sensitiveS = wRng.nextInt(0, 4);
  const sStyle = SENSITIVE_STYLES[sensitiveS];

  // Whether early epoch_0 uncalibrated instrument had strong confounding baseline drift
  // (~58% of worlds experience strong early calibration drift + founder anchoring)
  const hasStrongEpoch0Drift = wRng.nextFloat() < 0.58;
  const wrongSlotChoices = [0, 1, 2, 3].filter(s => s !== trueSlot);
  const driftAnchoredSlotId = `M_SLOT_${wRng.choice(wrongSlotChoices)}`;

  const holdoutQueries = [];
  const holdoutTruth = [];
  let structuralParams = {};
  let probeMenu = [];
  let interventionMenu = [];
  let candidateHypotheses = [];
  let optimalProbeId = null;
  let optimalInterventionId = null;
  let identifiable = true;

  if (family === 'A_CAUSAL_LOOKALIKES') {
    const gain = round3(quartetSharedParams.gain); // ~1.0
    const noiseSd = 0.11;
    structuralParams = { gain, noise_sd: noiseSd, suppressor_gain: round3(1.85 * gain) };

    probeMenu = [
      { id: 'PROBE_DO_HUB_UNIT', label: 'Perturb Hub Variable do(Hub = +1.0)' },
      { id: 'PROBE_DO_HUB_HIGH', label: 'High-Amplitude Hub Sweep do(Hub = +2.0)' },
      { id: 'PROBE_DO_RELAY_UNIT', label: 'Perturb Downstream Relay do(Relay = +1.0)' },
      { id: 'PROBE_PASSIVE_COV', label: 'Passive Observational Resample (No Intervention)' },
    ];
    interventionMenu = [
      { id: 'INT_HUB_HIGH', label: 'Drive Hub to +2.0 (Assumes linear unconfounded chain)' },
      { id: 'INT_AUX_BYPASS', label: 'Actuate Auxiliary Bypass Lever +1.6 (Bypasses confounded hub/relay)' },
      { id: 'INT_RELAY_DIRECT', label: 'Drive Downstream Relay +1.6 Directly' },
      { id: 'INT_CLAMPED_MOD_PAIR', label: 'Moderate Hub +1.0 + Relay Clamp (Avoids high-amplitude suppressor)' },
    ];

    const archDescriptions = {
      ARCH_A1_CAUSAL_CHAIN: {
        kind: 'SCM_LINEAR_CHAIN',
        expected_probes: {
          PROBE_DO_HUB_UNIT: round3(1.0 * gain),
          PROBE_DO_HUB_HIGH: round3(2.0 * gain),
          PROBE_DO_RELAY_UNIT: round3(1.0 * gain),
          PROBE_PASSIVE_COV: 0.55,
        },
        recommended_intervention: 'INT_HUB_HIGH',
      },
      ARCH_A2_LATENT_CONFOUNDER: {
        kind: 'SCM_FULL_CONFOUNDER',
        expected_probes: {
          PROBE_DO_HUB_UNIT: 0.0,
          PROBE_DO_HUB_HIGH: 0.0,
          PROBE_DO_RELAY_UNIT: 0.0,
          PROBE_PASSIVE_COV: 0.55,
        },
        recommended_intervention: 'INT_AUX_BYPASS',
      },
      ARCH_A3_MEDIATED_BLOCKED: {
        kind: 'SCM_HUB_CONFOUNDED_RELAY_ACTIVE',
        expected_probes: {
          PROBE_DO_HUB_UNIT: 0.0,
          PROBE_DO_HUB_HIGH: 0.0,
          PROBE_DO_RELAY_UNIT: round3(1.0 * gain),
          PROBE_PASSIVE_COV: 0.55,
        },
        recommended_intervention: 'INT_RELAY_DIRECT',
      },
      ARCH_A4_NONLINEAR_SUPPRESSOR: {
        kind: 'SCM_THRESHOLD_SUPPRESSOR',
        expected_probes: {
          PROBE_DO_HUB_UNIT: round3(1.0 * gain),
          PROBE_DO_HUB_HIGH: round3(-1.5 * gain),
          PROBE_DO_RELAY_UNIT: round3(1.0 * gain),
          PROBE_PASSIVE_COV: 0.55,
        },
        recommended_intervention: 'INT_CLAMPED_MOD_PAIR',
      },
    };

    candidateHypotheses = slotOrder.map((arch, idx) => ({
      slot_id: `M_SLOT_${idx}`,
      model_signature: archDescriptions[arch].kind,
      expected_probes: archDescriptions[arch].expected_probes,
      noise_sd: noiseSd,
      recommended_intervention: archDescriptions[arch].recommended_intervention,
    }));

    optimalProbeId = (archetype === 'ARCH_A1_CAUSAL_CHAIN' || archetype === 'ARCH_A4_NONLINEAR_SUPPRESSOR')
      ? 'PROBE_DO_HUB_HIGH'
      : 'PROBE_DO_RELAY_UNIT';
    optimalInterventionId = archDescriptions[archetype].recommended_intervention;

    // 16 held-out counterfactual intervention queries
    for (let i = 0; i < 16; i++) {
      const hubDo = [-1, 0, 1, 2][i % 4];
      const relayDo = [0, 1][Math.floor(i / 4) % 2];
      const auxDo = [0, 1][Math.floor(i / 8) % 2];
      const q = { query_id: `ho_a_${i}`, do_hub: hubDo, do_relay: relayDo, do_aux: auxDo };
      holdoutQueries.push(q);
      let y = 0.5 * auxDo * gain;
      if (archetype === 'ARCH_A1_CAUSAL_CHAIN') y += (hubDo + 0.6 * relayDo) * gain;
      else if (archetype === 'ARCH_A2_LATENT_CONFOUNDER') y += 0.5 * auxDo * gain;
      else if (archetype === 'ARCH_A3_MEDIATED_BLOCKED') y += 1.0 * relayDo * gain;
      else if (archetype === 'ARCH_A4_NONLINEAR_SUPPRESSOR') {
        y += (hubDo + 0.6 * relayDo - (Math.abs(hubDo) > 1.2 ? 1.75 * hubDo : 0)) * gain;
      }
      holdoutTruth.push(y > 0.45 ? 1 : 0);
    }
  } else if (family === 'B_HIGHER_ORDER_RELATIONS') {
    const pIdx = quartetSharedParams.parityPerm; // permutation of [0,1,2]
    const noiseSd = 0.10;
    structuralParams = { parity_perm: pIdx, noise_sd: noiseSd };

    probeMenu = [
      { id: 'PROBE_PAIR_AB', label: 'Joint Pairwise Co-Observation (Spin A, Spin B -> Y)' },
      { id: 'PROBE_PAIR_BC', label: 'Joint Pairwise Co-Observation (Spin B, Spin C -> Y)' },
      { id: 'PROBE_TRIAD_ONES', label: 'Joined 3-Body Clamp (Spin A=1, B=1, C=1 -> Y)' },
      { id: 'PROBE_SINGLE_MARGINAL', label: 'Singleton Marginal Sweep (Spin A -> Y)' },
    ];
    interventionMenu = [
      { id: 'INT_PARITY_LOCK_AB', label: 'Enforce 2-Body Parity Feedback on Pair AB' },
      { id: 'INT_PARITY_LOCK_BC', label: 'Enforce 2-Body Parity Feedback on Pair BC' },
      { id: 'INT_TRIAD_XOR_EVEN', label: 'Enforce 3-Body Odd-Parity Stabilizer (A xor B xor C)' },
      { id: 'INT_TRIAD_XNOR_COMP', label: 'Enforce 3-Body Complemented XNOR Stabilizer (1 xor A xor B xor C)' },
    ];

    const archDescriptions = {
      ARCH_B1_PAIR_XOR_AB: {
        kind: 'GF2_PAIR_XOR_AB',
        expected_probes: { PROBE_PAIR_AB: 1.0, PROBE_PAIR_BC: 0.0, PROBE_TRIAD_ONES: 0.0, PROBE_SINGLE_MARGINAL: 0.0 },
        recommended_intervention: 'INT_PARITY_LOCK_AB',
      },
      ARCH_B2_PAIR_XOR_BC: {
        kind: 'GF2_PAIR_XOR_BC',
        expected_probes: { PROBE_PAIR_AB: 0.0, PROBE_PAIR_BC: 1.0, PROBE_TRIAD_ONES: 0.0, PROBE_SINGLE_MARGINAL: 0.0 },
        recommended_intervention: 'INT_PARITY_LOCK_BC',
      },
      ARCH_B3_PURE_TRIAD_XOR: {
        kind: 'GF2_PURE_3BODY_XOR',
        expected_probes: { PROBE_PAIR_AB: 0.0, PROBE_PAIR_BC: 0.0, PROBE_TRIAD_ONES: 1.0, PROBE_SINGLE_MARGINAL: 0.0 },
        recommended_intervention: 'INT_TRIAD_XOR_EVEN',
      },
      ARCH_B4_COMPLEMENT_TRIAD_XNOR: {
        kind: 'GF2_PURE_3BODY_XNOR',
        expected_probes: { PROBE_PAIR_AB: 0.0, PROBE_PAIR_BC: 0.0, PROBE_TRIAD_ONES: 0.0, PROBE_SINGLE_MARGINAL: 0.0 },
        recommended_intervention: 'INT_TRIAD_XNOR_COMP',
      },
    };

    candidateHypotheses = slotOrder.map((arch, idx) => ({
      slot_id: `M_SLOT_${idx}`,
      model_signature: archDescriptions[arch].kind,
      expected_probes: archDescriptions[arch].expected_probes,
      noise_sd: noiseSd,
      recommended_intervention: archDescriptions[arch].recommended_intervention,
    }));

    optimalProbeId = (archetype === 'ARCH_B1_PAIR_XOR_AB' || archetype === 'ARCH_B2_PAIR_XOR_BC')
      ? 'PROBE_PAIR_AB'
      : 'PROBE_TRIAD_ONES';
    optimalInterventionId = archDescriptions[archetype].recommended_intervention;

    for (let i = 0; i < 16; i++) {
      const b0 = i & 1;
      const b1 = (i >> 1) & 1;
      const b2 = (i >> 2) & 1;
      const vec = [b0, b1, b2];
      holdoutQueries.push({ query_id: `ho_b_${i}`, spins: vec });
      const u = vec[pIdx[0]];
      const v = vec[pIdx[1]];
      const w = vec[pIdx[2]];
      let y = 0;
      if (archetype === 'ARCH_B1_PAIR_XOR_AB') y = u ^ v;
      else if (archetype === 'ARCH_B2_PAIR_XOR_BC') y = v ^ w;
      else if (archetype === 'ARCH_B3_PURE_TRIAD_XOR') y = u ^ v ^ w;
      else y = 1 ^ u ^ v ^ w;
      holdoutTruth.push(y);
    }
  } else if (family === 'C_TEMPORAL_INHERITANCE') {
    const amp = round3(quartetSharedParams.amp);
    const noiseSd = 0.11;
    structuralParams = { amp, noise_sd: noiseSd };

    probeMenu = [
      { id: 'PROBE_IMMEDIATE_T0', label: 'Measure Immediate T=0 Impulse Response' },
      { id: 'PROBE_DELAYED_T2', label: 'Measure Delayed T=+2 Horizon Response' },
      { id: 'PROBE_PRECURSOR_SEQUENCE', label: 'Ordered Precursor-Before-Primary Sequence Test' },
      { id: 'PROBE_NAIVE_ADM_LOG', label: 'Query Static Terminal Integral Only' },
    ];
    interventionMenu = [
      { id: 'INT_PULSE_AND_WAIT', label: 'Single Early Pulse + Respect T=+2 Transport Lag' },
      { id: 'INT_CONTINUOUS_CLAMP', label: 'Continuous Sustained Clamp (Compensates fast decay)' },
      { id: 'INT_DAMPED_RAMP', label: 'Damped Two-Step Ramp (Prevents T=+2 overshoot collapse)' },
      { id: 'INT_PRECURSOR_GATED', label: 'Pre-Condition Precursor Gate at T=-1 Before Impulse' },
    ];

    const archDescriptions = {
      ARCH_C1_TRUE_DELAYED_LAG: {
        kind: 'TEMP_PURE_LAG_T2',
        expected_probes: {
          PROBE_IMMEDIATE_T0: 0.0,
          PROBE_DELAYED_T2: round3(1.35 * amp),
          PROBE_PRECURSOR_SEQUENCE: round3(0.25 * amp),
          PROBE_NAIVE_ADM_LOG: 0.5,
        },
        recommended_intervention: 'INT_PULSE_AND_WAIT',
      },
      ARCH_C2_TRANSIENT_SPIKE_DECAY: {
        kind: 'TEMP_IMMEDIATE_DECAY',
        expected_probes: {
          PROBE_IMMEDIATE_T0: round3(1.35 * amp),
          PROBE_DELAYED_T2: 0.0,
          PROBE_PRECURSOR_SEQUENCE: round3(0.25 * amp),
          PROBE_NAIVE_ADM_LOG: 0.5,
        },
        recommended_intervention: 'INT_CONTINUOUS_CLAMP',
      },
      ARCH_C3_DELAYED_COLLAPSE_HAZARD: {
        kind: 'TEMP_OVERSHOOT_COLLAPSE',
        expected_probes: {
          PROBE_IMMEDIATE_T0: round3(1.25 * amp),
          PROBE_DELAYED_T2: round3(-1.65 * amp),
          PROBE_PRECURSOR_SEQUENCE: round3(0.20 * amp),
          PROBE_NAIVE_ADM_LOG: 0.5,
        },
        recommended_intervention: 'INT_DAMPED_RAMP',
      },
      ARCH_C4_CLOCK_INVERTED_FEEDBACK: {
        kind: 'TEMP_CLOCK_INVERTED_PRECURSOR',
        expected_probes: {
          PROBE_IMMEDIATE_T0: 0.0,
          PROBE_DELAYED_T2: 0.0,
          PROBE_PRECURSOR_SEQUENCE: round3(1.40 * amp),
          PROBE_NAIVE_ADM_LOG: 0.5,
        },
        recommended_intervention: 'INT_PRECURSOR_GATED',
      },
    };

    candidateHypotheses = slotOrder.map((arch, idx) => ({
      slot_id: `M_SLOT_${idx}`,
      model_signature: archDescriptions[arch].kind,
      expected_probes: archDescriptions[arch].expected_probes,
      noise_sd: noiseSd,
      recommended_intervention: archDescriptions[arch].recommended_intervention,
    }));

    optimalProbeId = (archetype === 'ARCH_C1_TRUE_DELAYED_LAG' || archetype === 'ARCH_C4_CLOCK_INVERTED_FEEDBACK')
      ? 'PROBE_PRECURSOR_SEQUENCE'
      : 'PROBE_DELAYED_T2';
    optimalInterventionId = archDescriptions[archetype].recommended_intervention;

    for (let i = 0; i < 16; i++) {
      const horizon = i % 2 === 0 ? 'T0' : 'T2';
      const precursorFirst = (i >> 1) & 1;
      const highPulse = (i >> 2) & 1;
      holdoutQueries.push({ query_id: `ho_c_${i}`, horizon, precursor_first: precursorFirst, high_pulse: highPulse });
      let y = 0;
      if (archetype === 'ARCH_C1_TRUE_DELAYED_LAG') y = horizon === 'T2' ? 1 : 0;
      else if (archetype === 'ARCH_C2_TRANSIENT_SPIKE_DECAY') y = horizon === 'T0' ? 1 : 0;
      else if (archetype === 'ARCH_C3_DELAYED_COLLAPSE_HAZARD') y = (horizon === 'T0' || !highPulse) ? 1 : 0;
      else y = (precursorFirst === 1 && horizon === 'T2') ? 1 : 0;
      holdoutTruth.push(y);
    }
  } else {
    // Family D: THE_IMPOSSIBLE_LIBRARY
    const modC1 = quartetSharedParams.modC1; // 1 or 2
    const modC2 = quartetSharedParams.modC2; // 1 or 2
    const modTarget = quartetSharedParams.modTarget; // 0, 1, or 2
    const noisyCoord = quartetSharedParams.noisyCoord; // 0, 1, or 2
    const extTheta = wRng.nextInt(0, 2); // hidden exterior bit for D3 (unidentifiable!)
    const noiseSd = 0.08;

    identifiable = archetype !== 'ARCH_D3_UNIDENTIFIABLE_EXTERIOR';
    structuralParams = {
      mod_c1: modC1,
      mod_c2: modC2,
      mod_target: modTarget,
      noisy_coord: noisyCoord,
      unobservable_exterior_theta: extTheta,
      noise_sd: noiseSd,
    };

    probeMenu = [
      { id: 'PROBE_MODULAR_CELLS', label: '9-Cell Static Lattice Diagnostic Sweep (Tests composite modular structure)' },
      { id: 'PROBE_HYSTERESIS_LOOP', label: 'Path-Ordered Loop (0->x* vs 2->x* at fixed static endpoint x*)' },
      { id: 'PROBE_REPEATABILITY_CHECK', label: 'Identical-State-And-Path Replicate Noise Floor Assay' },
      { id: 'PROBE_EXTERIOR_APERTURE', label: 'Attempt Exterior Boundary Probe (Checks Aperture rank/nullspace)' },
    ];
    interventionMenu = [
      { id: 'INT_MODULAR_PHASE_ALIGN', label: 'Align Composite (c1*A1 + c2*A2) mod 3 Resonance' },
      { id: 'INT_HOLONOMY_PRE_LATCH', label: 'Execute Boundary Pre-Latch Transition Before Target State' },
      { id: 'INT_SAFE_INTERIOR_HEDGE', label: 'Conservative Interior Hedge (Safe under unresolved exterior nullspace)' },
      { id: 'INT_MONOTONE_SINGLE_ATTR', label: 'Standard Inherited Single-Coordinate Threshold Control' },
    ];

    const archDescriptions = {
      ARCH_D1_MODULAR_INVARIANT: {
        kind: 'RUPTURE_MISSING_COMPOSITE_INVARIANT',
        expected_probes: {
          PROBE_MODULAR_CELLS: 1.0,
          PROBE_HYSTERESIS_LOOP: 0.0,
          PROBE_REPEATABILITY_CHECK: 0.04,
          PROBE_EXTERIOR_APERTURE: 0.5,
        },
        recommended_intervention: 'INT_MODULAR_PHASE_ALIGN',
      },
      ARCH_D2_HYSTERETIC_HOLONOMY: {
        kind: 'RUPTURE_MISSING_PATH_HOLONOMY',
        expected_probes: {
          PROBE_MODULAR_CELLS: 0.35,
          PROBE_HYSTERESIS_LOOP: 1.0,
          PROBE_REPEATABILITY_CHECK: 0.04,
          PROBE_EXTERIOR_APERTURE: 0.5,
        },
        recommended_intervention: 'INT_HOLONOMY_PRE_LATCH',
      },
      ARCH_D3_UNIDENTIFIABLE_EXTERIOR: {
        kind: 'UNIDENTIFIABLE_EXTERIOR_NULLSPACE',
        expected_probes: {
          PROBE_MODULAR_CELLS: 0.0,
          PROBE_HYSTERESIS_LOOP: 0.0,
          PROBE_REPEATABILITY_CHECK: 0.04,
          PROBE_EXTERIOR_APERTURE: -1.0, // sentinel rank-deficit nullspace return
        },
        recommended_intervention: 'INT_SAFE_INTERIOR_HEDGE',
      },
      ARCH_D4_COMPLETE_NOISY_ONTOLOGY: {
        kind: 'COMPLETE_ONTOLOGY_HIGH_NOISE',
        expected_probes: {
          PROBE_MODULAR_CELLS: 0.0,
          PROBE_HYSTERESIS_LOOP: 0.0,
          PROBE_REPEATABILITY_CHECK: 0.85, // high within-cell aleatoric variance!
          PROBE_EXTERIOR_APERTURE: 0.5,
        },
        recommended_intervention: 'INT_MONOTONE_SINGLE_ATTR',
      },
    };

    candidateHypotheses = slotOrder.map((arch, idx) => ({
      slot_id: `M_SLOT_${idx}`,
      model_signature: archDescriptions[arch].kind,
      expected_probes: archDescriptions[arch].expected_probes,
      noise_sd: noiseSd,
      recommended_intervention: archDescriptions[arch].recommended_intervention,
    }));

    if (archetype === 'ARCH_D1_MODULAR_INVARIANT') optimalProbeId = 'PROBE_MODULAR_CELLS';
    else if (archetype === 'ARCH_D2_HYSTERETIC_HOLONOMY') optimalProbeId = 'PROBE_HYSTERESIS_LOOP';
    else if (archetype === 'ARCH_D3_UNIDENTIFIABLE_EXTERIOR') optimalProbeId = 'PROBE_EXTERIOR_APERTURE';
    else optimalProbeId = 'PROBE_REPEATABILITY_CHECK';

    optimalInterventionId = archDescriptions[archetype].recommended_intervention;

    for (let i = 0; i < 16; i++) {
      const a1 = i % 3;
      const a2 = Math.floor(i / 3) % 3;
      const a3 = i % 2;
      const prevA1 = (i + 1) % 3;
      const exteriorMode = i >= 8 ? 1 : 0;
      holdoutQueries.push({
        query_id: `ho_d_${i}`,
        a1,
        a2,
        a3,
        prev_a1: prevA1,
        exterior_mode: exteriorMode,
      });
      let y = 0;
      if (archetype === 'ARCH_D1_MODULAR_INVARIANT') {
        y = ((modC1 * a1 + modC2 * a2) % 3 === modTarget) ? 1 : 0;
      } else if (archetype === 'ARCH_D2_HYSTERETIC_HOLONOMY') {
        y = a3 ^ (prevA1 === 2 ? 1 : 0);
      } else if (archetype === 'ARCH_D3_UNIDENTIFIABLE_EXTERIOR') {
        y = exteriorMode === 0 ? a3 : (a3 ^ extTheta);
      } else {
        const coords = [a1 > 0 ? 1 : 0, a2 > 0 ? 1 : 0, a3];
        y = coords[noisyCoord];
      }
      holdoutTruth.push(y);
    }
  }

  // Generate authentic synthetic historical records H(w) from noisy simulated past micro-trials
  const historyRecords = buildAuthenticHistoryRecords({
    family,
    worldId,
    archetype,
    trueSlotId,
    slotOrder,
    candidateHypotheses,
    structuralParams,
    hasStrongEpoch0Drift,
    driftAnchoredSlotId,
    sensitiveS,
    sStyle,
    wRng,
  });

  // Generate explicitly isolated fabricated history H_false(w) for Condition IV (False Prophets)
  const falseHistoryRecords = buildFabricatedHistoryRecords({
    family,
    worldId,
    trueSlotId,
    slotOrder,
    candidateHypotheses,
    driftAnchoredSlotId,
    sStyle,
    wRng,
  });

  return {
    trueSlotId,
    archetype,
    identifiable,
    structuralParams,
    sensitiveS,
    hasStrongEpoch0Drift,
    driftAnchoredSlotId,
    probeMenu,
    interventionMenu,
    candidateHypotheses,
    holdoutQueries,
    holdoutTruth,
    optimalProbeId,
    optimalInterventionId,
    historyRecords,
    falseHistoryRecords,
  };
}

/**
 * Generates the 6 typed categories of permissible synthetic history H(w) by simulating
 * noisy past micro-trials and custodial/temporal logs without leaking secret identifiers.
 */
function buildAuthenticHistoryRecords({
  family,
  worldId,
  archetype,
  slotOrder,
  candidateHypotheses,
  structuralParams,
  hasStrongEpoch0Drift,
  driftAnchoredSlotId,
  sensitiveS,
  sStyle,
  wRng,
}) {
  // Compute noisy historical half-space / diagnostic observations from the actual mechanism
  let calHintKey = '';
  let calHintVal = 0;
  let temporalFlag = { withdrawal_count: 0, clock_inverted: false };
  let residualStats = { within_cell_var: 0.03, between_cell_var: 0.04, triad_synergy_excess: 0.0, exterior_nullspace_flag: false, dominant_single_coord: 0 };

  if (family === 'A_CAUSAL_LOOKALIKES') {
    // Historical preliminary test of Hub=+1.0 (rejected before terminal admission if zero, or held pending mediation check)
    const hubTrue = (archetype === 'ARCH_A1_CAUSAL_CHAIN' || archetype === 'ARCH_A4_NONLINEAR_SUPPRESSOR')
      ? structuralParams.gain
      : 0.0;
    calHintKey = 'hub_unit_micro_delta';
    calHintVal = round3(hubTrue + wRng.nextNormal(0, 0.12));
    residualStats.within_cell_var = round3(Math.max(0.008, 0.014 + wRng.nextNormal(0, 0.003)));
    residualStats.between_cell_var = round3(Math.abs(archetype === 'ARCH_A4_NONLINEAR_SUPPRESSOR' ? 0.34 : 0.04) + Math.abs(wRng.nextNormal(0, 0.02)));
  } else if (family === 'B_HIGHER_ORDER_RELATIONS') {
    // Historical pairwise correlation rejections tell us whether ANY 2-body XOR exists vs pure 3-body
    const anyPair = (archetype === 'ARCH_B1_PAIR_XOR_AB' || archetype === 'ARCH_B2_PAIR_XOR_BC') ? 1.0 : 0.0;
    calHintKey = 'max_subthreshold_pair_score';
    calHintVal = round3(anyPair * 0.78 + wRng.nextNormal(0, 0.11));
    residualStats.within_cell_var = round3(Math.max(0.008, 0.015 + wRng.nextNormal(0, 0.003)));
    residualStats.between_cell_var = 0.25;
    residualStats.triad_synergy_excess = round3((1 - anyPair) * 0.85 + wRng.nextNormal(0, 0.10));
  } else if (family === 'C_TEMPORAL_INHERITANCE') {
    const immTrue = (archetype === 'ARCH_C2_TRANSIENT_SPIKE_DECAY' || archetype === 'ARCH_C3_DELAYED_COLLAPSE_HAZARD') ? 1.0 : 0.0;
    calHintKey = 'immediate_t0_micro_pulse';
    calHintVal = round3(immTrue * 1.15 + wRng.nextNormal(0, 0.13));
    temporalFlag = {
      withdrawal_count: archetype === 'ARCH_C3_DELAYED_COLLAPSE_HAZARD' ? 2 : (archetype === 'ARCH_C2_TRANSIENT_SPIKE_DECAY' ? 1 : 0),
      clock_inverted: archetype === 'ARCH_C4_CLOCK_INVERTED_FEEDBACK',
    };
    residualStats.within_cell_var = round3(Math.max(0.008, 0.014 + wRng.nextNormal(0, 0.003)));
  } else {
    // Family D
    calHintKey = 'best_inherited_monotone_fit_err';
    calHintVal = round3(archetype === 'ARCH_D4_COMPLETE_NOISY_ONTOLOGY' ? 0.28 + wRng.nextNormal(0, 0.03) : 0.44 + wRng.nextNormal(0, 0.03));
    if (archetype === 'ARCH_D1_MODULAR_INVARIANT') {
      residualStats = { within_cell_var: round3(0.02 + Math.abs(wRng.nextNormal(0, 0.005))), between_cell_var: round3(0.24 + wRng.nextNormal(0, 0.02)), path_loop_gap: round3(Math.abs(wRng.nextNormal(0, 0.03))), exterior_nullspace_flag: false, dominant_single_coord: 0 };
    } else if (archetype === 'ARCH_D2_HYSTERETIC_HOLONOMY') {
      residualStats = { within_cell_var: round3(0.23 + wRng.nextNormal(0, 0.02)), between_cell_var: round3(0.25 + wRng.nextNormal(0, 0.02)), path_loop_gap: round3(0.88 + wRng.nextNormal(0, 0.06)), exterior_nullspace_flag: false, dominant_single_coord: 0 };
    } else if (archetype === 'ARCH_D3_UNIDENTIFIABLE_EXTERIOR') {
      residualStats = { within_cell_var: round3(0.02 + Math.abs(wRng.nextNormal(0, 0.005))), between_cell_var: round3(0.02 + Math.abs(wRng.nextNormal(0, 0.005))), path_loop_gap: round3(Math.abs(wRng.nextNormal(0, 0.02))), exterior_nullspace_flag: true, dominant_single_coord: 2 };
    } else {
      residualStats = { within_cell_var: round3(0.21 + wRng.nextNormal(0, 0.02)), between_cell_var: round3(0.22 + wRng.nextNormal(0, 0.02)), path_loop_gap: round3(Math.abs(wRng.nextNormal(0, 0.03))), exterior_nullspace_flag: false, dominant_single_coord: structuralParams.noisy_coord };
    }
  }

  // Compute likelihood-consistent candidate support scores under calibrated vs drifted epoch_0
  const calSlotLogEvidence = {};
  for (const h of candidateHypotheses) {
    calSlotLogEvidence[h.slot_id] = computeCalibratedLogSupport(family, h, calHintKey, calHintVal, temporalFlag, residualStats);
  }

  // Epoch-0 uncalibrated drift trials: verbose high-weight legacy log that pulls toward driftAnchoredSlotId when drift is active
  const epoch0Scores = {};
  for (const h of candidateHypotheses) {
    if (hasStrongEpoch0Drift) {
      epoch0Scores[h.slot_id] = h.slot_id === driftAnchoredSlotId
        ? round3(3.1 + wRng.nextNormal(0, 0.25))
        : round3(-0.8 + wRng.nextNormal(0, 0.25));
    } else {
      epoch0Scores[h.slot_id] = round3(0.2 * calSlotLogEvidence[h.slot_id] + wRng.nextNormal(0, 0.4));
    }
  }

  const ms = 100 + 4 * wRng.nextInt(10, 200) + sStyle.ms_mod;
  const obsTs = temporalFlag.clock_inverted ? `2024-03-09T11:20:10.${ms}Z` : `2024-03-03T09:10:05.${ms}Z`;
  const admTs = `2024-03-06T14:00:00.${ms}Z`;

  const records = [
    {
      entry_id: `${worldId}:h:01`,
      category: 'CAT_CALIBRATED_REJECTIONS',
      epoch: 'EPOCH_2_CALIBRATED_APERTURE',
      timestamp_obs: `2024-03-05T10:00:00.${ms}Z`,
      timestamp_adm: admTs,
      payload: {
        auditor: 'APERTURE_AUDITOR',
        decision: 'REJECT_UNADMITTED_CANDIDATE',
        diagnostic_metric: calHintKey,
        measured_value: calHintVal,
        calibrated_log_support: calSlotLogEvidence,
        sample_replicates: 12,
      },
    },
    {
      entry_id: `${worldId}:h:02`,
      category: 'CAT_TEMPORAL_LEDGER',
      epoch: 'EPOCH_2_TEMPORAL_CUSTODY',
      timestamp_obs: obsTs,
      timestamp_adm: admTs,
      payload: {
        custodian: 'TEMPORAL_CUSTODIAN',
        withdrawn_claims_count: temporalFlag.withdrawal_count,
        precursor_obs_before_primary: temporalFlag.clock_inverted,
        admission_order_matches_observation_order: !temporalFlag.clock_inverted,
        note: temporalFlag.withdrawal_count > 0
          ? 'Aggressive transient claim withdrawn after delayed horizon audit.'
          : 'Monotonic observation ledger recorded without withdrawal.',
      },
    },
    {
      entry_id: `${worldId}:h:03`,
      category: 'CAT_RESIDUAL_ANOMALIES',
      epoch: 'EPOCH_2_RESIDUAL_CHECK',
      timestamp_obs: `2024-03-05T12:30:00.${ms}Z`,
      timestamp_adm: admTs,
      payload: {
        within_cell_var: residualStats.within_cell_var,
        between_cell_var: residualStats.between_cell_var,
        triad_synergy_excess: residualStats.triad_synergy_excess ?? 0,
        path_loop_gap: residualStats.path_loop_gap ?? 0,
        exterior_nullspace_flag: Boolean(residualStats.exterior_nullspace_flag),
        dominant_single_coord: residualStats.dominant_single_coord ?? 0,
      },
    },
    {
      entry_id: `${worldId}:h:04`,
      category: 'CAT_EPOCH0_DRIFT_TRIALS',
      epoch: 'EPOCH_0_UNCALIBRATED_FOUNDER_SERIES',
      timestamp_obs: `2023-11-12T08:00:00.${ms}Z`,
      timestamp_adm: `2023-11-15T08:00:00.${ms}Z`,
      payload: {
        instrument_status: 'LEGACY_UNCALIBRATED_BASELINE_DRIFT_UNVERIFIED',
        authoritative_founder_endorsement: hasStrongEpoch0Drift ? driftAnchoredSlotId : null,
        legacy_sample_count: 64,
        legacy_pooled_log_scores: epoch0Scores,
        narrative: `Authoritative Founding Monograph Series (${worldId}): Extensive 64-run legacy campaign conducted prior to Aperture covariance whitening strongly favored ${driftAnchoredSlotId}; junior investigators were historically advised to treat the question as settled and avoid redundant perturbation.`,
      },
    },
    {
      entry_id: `${worldId}:h:05`,
      category: 'CAT_PROVENANCE_AND_SENSITIVE',
      epoch: 'EPOCH_1_CUSTODY_INTAKE',
      timestamp_obs: `2024-01-20T16:45:12.${ms}Z`,
      timestamp_adm: `2024-01-21T09:15:00.${ms}Z`,
      payload: {
        custody_cohort_code: sStyle.cohort_tag,
        intake_clerk_note: `Folio intake verified; ${sStyle.reviewer_bigrams[0]} under ${sStyle.reviewer_bigrams[1]}; ${sStyle.reviewer_bigrams[2]} at millisecond phase ${ms}.`,
        archive_box_serial: `BOX-${1000 + sensitiveS * 137 + wRng.nextInt(0, 25)}`,
        provenance_jitter_ms: ms,
      },
    },
    {
      entry_id: `${worldId}:h:06`,
      category: 'CAT_ADMINISTRATIVE_CLUTTER',
      epoch: 'EPOCH_1_BUREAUCRATIC_LEDGER',
      timestamp_obs: `2024-02-10T11:00:00.${ms}Z`,
      timestamp_adm: `2024-02-11T11:00:00.${ms}Z`,
      payload: {
        clearance_corridor: 'CHAMBER_IV_FILING_ANNEX',
        form_revisions: ['REV-104A-STAMPED', 'REV-104B-COUNTERSIGNED', 'REV-109-INDEXED', 'REV-112-ARCHIVED'],
        boilerplate_minutes: `Routine quarterly schema formatting audit completed for synthetic dossier ${worldId}. Pagination, header kerning, citation bracket normalization, and storage checksums verified across four administrative desks with zero substantive experimental changes.`,
        desk_signatures_sha256: sha256Hex(`admin:${worldId}:${slotOrder.join(',')}`),
      },
    },
  ];

  return records;
}

function computeCalibratedLogSupport(family, h, calHintKey, calHintVal, temporalFlag, residualStats) {
  const sig = h.model_signature;
  if (family === 'A_CAUSAL_LOOKALIKES') {
    const expectsPositiveHub = sig === 'SCM_LINEAR_CHAIN' || sig === 'SCM_THRESHOLD_SUPPRESSOR';
    const mu = expectsPositiveHub ? 1.0 : 0.0;
    const diff = calHintVal - mu;
    let score = -2.2 * diff * diff;
    if (sig === 'SCM_THRESHOLD_SUPPRESSOR' && residualStats.between_cell_var > 0.18) score += 0.55;
    if (sig === 'SCM_LINEAR_CHAIN' && residualStats.between_cell_var <= 0.18) score += 0.35;
    return round3(score);
  }
  if (family === 'B_HIGHER_ORDER_RELATIONS') {
    const isPair = sig === 'GF2_PAIR_XOR_AB' || sig === 'GF2_PAIR_XOR_BC';
    const pairSignal = calHintVal > 0.38;
    const triadSignal = (residualStats.triad_synergy_excess ?? 0) > 0.42;
    let score = 0;
    if (isPair && pairSignal) score += 1.35;
    if (!isPair && !pairSignal) score += 1.35;
    if (!isPair && triadSignal) score += 0.95;
    if (isPair && triadSignal) score -= 0.95;
    return round3(score);
  }
  if (family === 'C_TEMPORAL_INHERITANCE') {
    const isImmediate = sig === 'TEMP_IMMEDIATE_DECAY' || sig === 'TEMP_OVERSHOOT_COLLAPSE';
    const mu = isImmediate ? 1.15 : 0.0;
    let score = -1.8 * (calHintVal - mu) * (calHintVal - mu);
    if (sig === 'TEMP_OVERSHOOT_COLLAPSE' && temporalFlag.withdrawal_count >= 2) score += 1.6;
    if (sig === 'TEMP_IMMEDIATE_DECAY' && temporalFlag.withdrawal_count === 1) score += 1.1;
    if (sig === 'TEMP_CLOCK_INVERTED_PRECURSOR' && temporalFlag.clock_inverted) score += 1.9;
    if (sig === 'TEMP_PURE_LAG_T2' && temporalFlag.withdrawal_count === 0 && !temporalFlag.clock_inverted) score += 1.2;
    return round3(score);
  }
  // Family D
  if (sig === 'UNIDENTIFIABLE_EXTERIOR_NULLSPACE') {
    return residualStats.exterior_nullspace_flag ? 2.4 : -1.8;
  }
  if (sig === 'COMPLETE_ONTOLOGY_HIGH_NOISE') {
    return (!residualStats.exterior_nullspace_flag && residualStats.within_cell_var > 0.12 && (residualStats.path_loop_gap ?? 0) < 0.35) ? 2.1 : -1.4;
  }
  if (sig === 'RUPTURE_MISSING_COMPOSITE_INVARIANT') {
    return (!residualStats.exterior_nullspace_flag && residualStats.within_cell_var < 0.09 && residualStats.between_cell_var > 0.14) ? 2.2 : -1.5;
  }
  if (sig === 'RUPTURE_MISSING_PATH_HOLONOMY') {
    return (!residualStats.exterior_nullspace_flag && (residualStats.path_loop_gap ?? 0) > 0.45) ? 2.3 : -1.5;
  }
  return 0;
}

/**
 * Generates an explicitly isolated fabricated history H_false(w) for Condition IV (False Prophets).
 * Notice: because it is an invented narrative rather than a genuine simulator trace, its
 * fabricated residual variance is unnaturally over-smoothed (within_cell_var = 0.001, below
 * physical Aperture noise floor) while asserting polished confidence in a false mechanism!
 */
function buildFabricatedHistoryRecords({
  family,
  worldId,
  slotOrder,
  candidateHypotheses,
  driftAnchoredSlotId,
  sStyle,
  wRng,
}) {
  const lieSlotId = driftAnchoredSlotId;
  const fakeSupport = {};
  for (const h of candidateHypotheses) {
    fakeSupport[h.slot_id] = h.slot_id === lieSlotId ? 2.95 : -1.65;
  }
  const ms = 200 + 4 * wRng.nextInt(10, 100) + sStyle.ms_mod;

  return [
    {
      entry_id: `${worldId}:false:01`,
      category: 'CAT_CALIBRATED_REJECTIONS',
      epoch: 'EPOCH_2_CALIBRATED_APERTURE',
      timestamp_obs: `2024-03-05T10:00:00.${ms}Z`,
      timestamp_adm: `2024-03-06T14:00:00.${ms}Z`,
      payload: {
        experimental_isolation_tag: 'CONDITION_IV_SYNTHETIC_FALSE_HISTORY_DO_NOT_ADMIT',
        auditor: 'APERTURE_AUDITOR',
        decision: 'REJECT_UNADMITTED_CANDIDATE',
        diagnostic_metric: 'fabricated_decisive_assay',
        measured_value: 1.0,
        calibrated_log_support: fakeSupport,
        sample_replicates: 20,
      },
    },
    {
      entry_id: `${worldId}:false:02`,
      category: 'CAT_TEMPORAL_LEDGER',
      epoch: 'EPOCH_2_TEMPORAL_CUSTODY',
      timestamp_obs: `2024-03-05T10:05:00.${ms}Z`,
      timestamp_adm: `2024-03-06T14:00:00.${ms}Z`,
      payload: {
        experimental_isolation_tag: 'CONDITION_IV_SYNTHETIC_FALSE_HISTORY_DO_NOT_ADMIT',
        custodian: 'TEMPORAL_CUSTODIAN',
        withdrawn_claims_count: 0,
        precursor_obs_before_primary: false,
        admission_order_matches_observation_order: true,
        note: `Polished narrative confirming ${lieSlotId} with zero reported anomalies.`,
      },
    },
    {
      entry_id: `${worldId}:false:03`,
      category: 'CAT_RESIDUAL_ANOMALIES',
      epoch: 'EPOCH_2_RESIDUAL_CHECK',
      timestamp_obs: `2024-03-05T12:30:00.${ms}Z`,
      timestamp_adm: `2024-03-06T14:00:00.${ms}Z`,
      payload: {
        experimental_isolation_tag: 'CONDITION_IV_SYNTHETIC_FALSE_HISTORY_DO_NOT_ADMIT',
        within_cell_var: 0.001, // unnaturally smooth fabricated residual (below physical noise floor ~0.01)
        between_cell_var: 0.002,
        triad_synergy_excess: 0.0,
        path_loop_gap: 0.0,
        exterior_nullspace_flag: false,
        dominant_single_coord: 0,
      },
    },
    {
      entry_id: `${worldId}:false:04`,
      category: 'CAT_EPOCH0_DRIFT_TRIALS',
      epoch: 'EPOCH_0_UNCALIBRATED_FOUNDER_SERIES',
      timestamp_obs: `2023-11-12T08:00:00.${ms}Z`,
      timestamp_adm: `2023-11-15T08:00:00.${ms}Z`,
      payload: {
        experimental_isolation_tag: 'CONDITION_IV_SYNTHETIC_FALSE_HISTORY_DO_NOT_ADMIT',
        instrument_status: 'POLISHED_CANONICAL_CONSENSUS',
        authoritative_founder_endorsement: lieSlotId,
        legacy_sample_count: 80,
        legacy_pooled_log_scores: fakeSupport,
        narrative: `Polished Consensus Monograph (${worldId}): All historical committees unanimously confirmed ${lieSlotId} with textbook precision (${family}); contrary hypotheses were dismissed as measurement error.`,
      },
    },
    {
      entry_id: `${worldId}:false:05`,
      category: 'CAT_PROVENANCE_AND_SENSITIVE',
      epoch: 'EPOCH_1_CUSTODY_INTAKE',
      timestamp_obs: `2024-01-20T16:45:12.${ms}Z`,
      timestamp_adm: `2024-01-21T09:15:00.${ms}Z`,
      payload: {
        experimental_isolation_tag: 'CONDITION_IV_SYNTHETIC_FALSE_HISTORY_DO_NOT_ADMIT',
        custody_cohort_code: 'SYNTHETIC_FABRICATOR_ISOLATED',
        intake_clerk_note: 'Isolated experimental counter-narrative fixture.',
        archive_box_serial: 'BOX-ISOLATED-IV',
        provenance_jitter_ms: ms,
      },
    },
    {
      entry_id: `${worldId}:false:06`,
      category: 'CAT_ADMINISTRATIVE_CLUTTER',
      epoch: 'EPOCH_1_BUREAUCRATIC_LEDGER',
      timestamp_obs: `2024-02-10T11:00:00.${ms}Z`,
      timestamp_adm: `2024-02-11T11:00:00.${ms}Z`,
      payload: {
        experimental_isolation_tag: 'CONDITION_IV_SYNTHETIC_FALSE_HISTORY_DO_NOT_ADMIT',
        clearance_corridor: 'ISOLATED_SIMULATION_ANNEX',
        form_revisions: ['FAB-01', 'FAB-02'],
        boilerplate_minutes: `Synthetic misleading narrative fixture for ${worldId}; strictly quarantined from Universal Atelier admitted records.`,
        desk_signatures_sha256: sha256Hex(`false:${worldId}:${slotOrder.join(',')}`),
      },
    },
  ];
}

const FAMILY_ARCHETYPES = Object.freeze({
  A_CAUSAL_LOOKALIKES: [
    'ARCH_A1_CAUSAL_CHAIN',
    'ARCH_A2_LATENT_CONFOUNDER',
    'ARCH_A3_MEDIATED_BLOCKED',
    'ARCH_A4_NONLINEAR_SUPPRESSOR',
  ],
  B_HIGHER_ORDER_RELATIONS: [
    'ARCH_B1_PAIR_XOR_AB',
    'ARCH_B2_PAIR_XOR_BC',
    'ARCH_B3_PURE_TRIAD_XOR',
    'ARCH_B4_COMPLEMENT_TRIAD_XNOR',
  ],
  C_TEMPORAL_INHERITANCE: [
    'ARCH_C1_TRUE_DELAYED_LAG',
    'ARCH_C2_TRANSIENT_SPIKE_DECAY',
    'ARCH_C3_DELAYED_COLLAPSE_HAZARD',
    'ARCH_C4_CLOCK_INVERTED_FEEDBACK',
  ],
  D_IMPOSSIBLE_LIBRARY: [
    'ARCH_D1_MODULAR_INVARIANT',
    'ARCH_D2_HYSTERETIC_HOLONOMY',
    'ARCH_D3_UNIDENTIFIABLE_EXTERIOR',
    'ARCH_D4_COMPLETE_NOISY_ONTOLOGY',
  ],
});

/**
 * Generates a balanced synthetic suite (e.g. 48 pilot worlds or 96 confirmatory worlds).
 * Returns { publicWorlds, secretVaultMap, quartetVerification } strictly separated.
 */
export function generateSyntheticWorldSuite({ suiteName, masterSeed, totalWorlds }) {
  if (totalWorlds % 16 !== 0) {
    throw new RangeError(`totalWorlds (${totalWorlds}) must be a multiple of 16 (4 families x 4-world Iso-Π quartets).`);
  }
  const quartetsPerFamily = totalWorlds / 16;
  const rootRng = new DeterministicRng(`${masterSeed}::${suiteName}`);

  const publicWorlds = [];
  const secretVaultMap = new Map();
  const quartetVerifications = [];

  for (const family of FAMILIES) {
    const archetypes = FAMILY_ARCHETYPES[family];

    for (let q = 0; q < quartetsPerFamily; q++) {
      const quartetId = `${suiteName}_${family.slice(0, 1)}_Q${String(q).padStart(2, '0')}`;
      const qRng = rootRng.fork(quartetId);

      const graphSpec = buildQuartetGraphSpec(family, quartetId, qRng);
      const slotOrder = qRng.shuffle(archetypes);
      const worldOrder = qRng.shuffle(archetypes);

      const quartetSharedParams = {
        gain: qRng.nextRange(0.88, 1.14),
        amp: qRng.nextRange(0.90, 1.12),
        parityPerm: qRng.shuffle([0, 1, 2]),
        modC1: qRng.choice([1, 2]),
        modC2: qRng.choice([1, 2]),
        modTarget: qRng.choice([0, 1, 2]),
        noisyCoord: qRng.choice([0, 1, 2]),
      };

      const quartetDrafts = [];

      for (let m = 0; m < 4; m++) {
        const worldId = `${quartetId}_W${m}`;
        const wRng = qRng.fork(`world_${m}`);
        const archetype = worldOrder[m];

        const mechanics = buildWorldMechanics({
          family,
          quartetId,
          worldId,
          archetype,
          slotOrder,
          quartetSharedParams,
          wRng,
        });

        const historyAdjudications = [
          {
            tag: 'aperture_rej',
            role: 'APERTURE_AUDITOR',
            action: 'REJECTION',
            decision: 'REJECT',
            targetId: graphSpec.nodes[0].id,
            binding: mechanics.historyRecords[0].payload,
          },
          {
            tag: 'temporal_chk',
            role: 'TEMPORAL_CUSTODIAN',
            action: mechanics.historyRecords[1].payload.withdrawn_claims_count > 0 ? 'WITHDRAWAL' : 'RECORD_ADMISSION',
            decision: mechanics.historyRecords[1].payload.withdrawn_claims_count > 0 ? 'HOLD' : 'ADMIT',
            targetId: graphSpec.nodes[graphSpec.nodes.length - 1].id,
            binding: mechanics.historyRecords[1].payload,
          },
        ];

        const atelier = buildAtelierWorldInstance({
          quartetId,
          worldId,
          family,
          nodes: graphSpec.nodes,
          edges: graphSpec.edges,
          historyAdjudications,
        });

        const historyJson = JSON.stringify(mechanics.historyRecords);
        const historyDigest = sha256Hex(historyJson);

        quartetDrafts.push({
          worldId,
          quartetId,
          family,
          atelier,
          mechanics,
          historyJson,
          historyDigest,
          crnSeed: `${masterSeed}::CRN::${worldId}`,
        });
      }

      // Verify Iso-Π Quartet Invariant: exact terminal graph equality + distinct histories!
      const refDigest = quartetDrafts[0].atelier.pi.projection_digest;
      const allPiEqual = quartetDrafts.every(d => d.atelier.pi.projection_digest === refDigest);
      const uniqueHistDigests = new Set(quartetDrafts.map(d => d.historyDigest)).size;
      if (!allPiEqual || uniqueHistDigests !== 4) {
        throw new Error(`Iso-Π Quartet invariant failed in ${quartetId}: allPiEqual=${allPiEqual}, uniqueHist=${uniqueHistDigests}`);
      }

      quartetVerifications.push({
        quartet_id: quartetId,
        family,
        pi_digest: refDigest,
        all_four_pi_equal: allPiEqual,
        distinct_history_digests: uniqueHistDigests,
      });

      // Pair each world w_m with authentic history of sibling world w_{(m+1) mod 4} for Condition V (THE EXILES)
      for (let m = 0; m < 4; m++) {
        const cur = quartetDrafts[m];
        const donor = quartetDrafts[(m + 1) % 4];
        // Donor has distinct hidden mechanism (worldOrder is a permutation of 4 distinct archetypes)
        if (cur.mechanics.archetype === donor.mechanics.archetype) {
          throw new Error(`Exile donor mechanism collision in ${quartetId}`);
        }

        // Public world structure (contains NO true mechanism, NO answer keys, NO sensitive S label)
        publicWorlds.push(Object.freeze({
          world_public_id: cur.worldId,
          quartet_public_id: cur.quartetId,
          family: cur.family,
          terminal_graph_pi: cur.atelier.pi,
          atelier_summary: cur.atelier.atelier_summary,
          candidate_mechanism_hypotheses: cur.mechanics.candidateHypotheses,
          probe_menu: cur.mechanics.probeMenu,
          intervention_menu: cur.mechanics.interventionMenu,
          inherited_vocabulary: {
            predicates: ['ATTR_0_GT_0', 'ATTR_1_GT_0', 'ATTR_2_EQ_1'],
            supports_composite_modular: false,
            supports_path_holonomy: false,
          },
          holdout_query_inputs: cur.mechanics.holdoutQueries,
          permissible_full_history: cur.mechanics.historyRecords,
          permissible_history_digest: cur.historyDigest,
          isolated_false_history: cur.mechanics.falseHistoryRecords,
          exile_authentic_foreign_history: donor.mechanics.historyRecords,
          exile_donor_world_public_id: donor.worldId,
          exile_donor_history_digest: donor.historyDigest,
        }));

        // Sealed Ground-Truth Vault (accessible ONLY to evaluator & privacy postflight scorer)
        secretVaultMap.set(cur.worldId, Object.freeze({
          vault_only_canary: 'TD613_SECRET_VAULT_DO_NOT_EXPOSE_TO_INVESTIGATOR',
          world_public_id: cur.worldId,
          quartet_public_id: cur.quartetId,
          family: cur.family,
          true_mechanism_slot: cur.mechanics.trueSlotId,
          true_mechanism_archetype: cur.mechanics.archetype,
          exile_donor_true_slot: donor.mechanics.trueSlotId,
          false_prophet_target_slot: cur.mechanics.driftAnchoredSlotId,
          has_strong_epoch0_drift: cur.mechanics.hasStrongEpoch0Drift,
          identifiable_under_action_menu: cur.mechanics.identifiable,
          structural_parameters: cur.mechanics.structuralParams,
          true_sensitive_attribute_S: cur.mechanics.sensitiveS,
          holdout_ground_truth_outputs: cur.mechanics.holdoutTruth,
          optimal_probe_id: cur.mechanics.optimalProbeId,
          optimal_intervention_id: cur.mechanics.optimalInterventionId,
          crn_seed: cur.crnSeed,
        }));
      }
    }
  }

  return {
    suite_name: suiteName,
    master_seed: masterSeed,
    total_worlds: publicWorlds.length,
    quartet_verifications: quartetVerifications,
    publicWorlds,
    secretVaultMap,
  };
}
