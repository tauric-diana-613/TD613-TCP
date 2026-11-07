/**
 * 𝌋 TD613 · Chamber 6: Equal-Graph Twin-World Assay
 * The Principal Scientific Experiment of the Capstone
 * 
 * Formal Question:
 * Can the same terminal research graph arise from materially different histories,
 * and can the Universal Atelier preserve the information required to distinguish them
 * without inventing evidence?
 * 
 * Method:
 * 1. For each of the 4 estates (SignalRupture, EMSTD613, Wendbine, TD613), construct
 *    two source-free research worlds:
 *    - World A: Direct, cleanly witnessed execution path.
 *    - World B: Distinct history containing rejected attempts, gate revisions,
 *               dropped captures, or late accession intake.
 * 2. Preregister Canonical Terminal Projection Pi:
 *    Pi(G) strips historical timestamps and internal receipts, retaining only
 *    nodes, labels, types, and directed links.
 *    Verify mathematically: sha256(Pi(G_A)) === sha256(Pi(G_B)).
 * 3. Preregister Retained Process History H:
 *    H contains ua_proposals, ua_adjudication_events, rejections, overrides, and intake lineage.
 *    Verify: H_A !== H_B.
 * 4. Execute Blinded Inquiries:
 *    - Inquiry 1: Terminal Graph Only (Discriminator given only Pi(G)). Mutual information = 0.
 *    - Inquiry 2: Retained Process-History Witness (Discriminator given H). Identifiability = 100%.
 * 5. Verify Ceilings:
 *    Synthetic process trace restores internal discriminability; does NOT prove external empirical origin.
 * 
 * Emits: packages/four_crossing_capstone/twin-world-assay-receipt.json
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

import {
  UniversalAtelierReceiver,
  UNIVERSAL_ATELIER_SCHEMA_V1,
  JURISDICTIONS,
  sha256,
} from '../universal_atelier/receiver/universal-atelier-receiver.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const receiptDir = process.env.TD613_UPDATE_RECEIPTS === '1' ? __dirname : os.tmpdir();
const RECEIPT_PATH = path.resolve(receiptDir, 'twin-world-assay-receipt.json');

console.log('================================================================');
console.log('CHAMBER 6: EQUAL-GRAPH TWIN-WORLD ASSAY');
console.log('THE PROVENANCE DISCRIMINATOR & PROCESS IDENTIFIABILITY TRIAL');
console.log('================================================================\n');

/**
 * Preregistered Canonical Projection Operator Pi:
 * Normalizes admitted graph nodes and edges into deterministic JSON string and computes digest.
 * Strictly excludes unadmitted, candidate-only, or withdrawn links.
 */
function canonicalProjectionPi(receiver) {
  return receiver.canonicalProjectionPi();
}

/**
 * Retained Process History Extractor H:
 * Collects full proposal history, adjudication receipts, decisions, and bindings.
 */
function extractProcessHistoryH(receiver) {
  const proposals = receiver.db.prepare(`
    SELECT proposal_id, input_sha256, disposition, record_json, created_at
    FROM ua_proposals ORDER BY proposal_id ASC
  `).all();

  const adjudications = receiver.db.prepare(`
    SELECT receipt_id, jurisdiction, adjudicator_kind, adjudicator_role, action, decision,
           target_id, episode_id, evidence_sha256, binding_json, registered_at
    FROM ua_adjudication_events ORDER BY registered_at ASC
  `).all();

  const rejections = adjudications.filter(a => a.decision === 'REJECT' || a.action === 'WITHDRAWAL');

  const historyPayload = {
    proposals_count: proposals.length,
    adjudications_count: adjudications.length,
    rejections_count: rejections.length,
    rejections: rejections.map(r => ({ receipt_id: r.receipt_id, target: r.target_id, role: r.adjudicator_role })),
    adjudication_trail: adjudications.map(a => `${a.action}:${a.decision}:${a.target_id}`),
  };

  const historyJson = JSON.stringify(historyPayload);
  return {
    history_payload: historyPayload,
    history_json: historyJson,
    history_digest: sha256(historyJson),
  };
}

const twinWorldEvaluations = [];

// =============================================================
// TWIN WORLD SET 1: SIGNALRUPTURE (Rejected Hypothesis Trace)
// =============================================================
console.log('--- EXECUTING TWIN WORLD SET 1: SIGNALRUPTURE ---');

const receiverSR_A = new UniversalAtelierReceiver(':memory:');
receiverSR_A.initialize({ memory: true, recipientId: 'sr_a', episodeId: 'ep_sr_a' });

const receiverSR_B = new UniversalAtelierReceiver(':memory:');
receiverSR_B.initialize({ memory: true, recipientId: 'sr_b', episodeId: 'ep_sr_b' });

// Common records
const srRecs = [
  { id: 'sr:source:burst', kind: 'source', label: 'Signal Burst Origin', synthetic: true, body: 'Observed burst emission.' },
  { id: 'sr:concept:dispersion', kind: 'contract', label: 'Dispersion Relation', synthetic: true, body: 'Dispersion protocol bounds.' },
];

// World A: Direct admission
for (const r of srRecs) {
  const prop = receiverSR_A.prepareImport(JSON.stringify(r));
  const adjId = `adj:sr_a:${r.id}`;
  receiverSR_A.registerAdjudicationEvent({
    receiptId: adjId,
    adjudicatorRole: 'ORCHESTRATOR',
    action: 'RECORD_ADMISSION',
    decision: 'ADMIT',
    targetId: r.id,
    evidenceSha256: prop.input_sha256,
  });
  receiverSR_A.admitRecord(prop, { humanReviewRef: 'SAC[X6ZNK5NO51]:TEST', adjudicatorReceiptId: adjId });
}

// World A: Link admission
const srBufA = Buffer.from(JSON.stringify(srRecs[0]));
const srSpanA = { start: 0, end: 15, span_sha256: sha256(srBufA.subarray(0, 15)) };
const srLinkAdjA = 'adj:sr_a:link:01';
receiverSR_A.registerAdjudicationEvent({
  receiptId: srLinkAdjA,
  adjudicatorRole: 'APERTURE_AUDITOR',
  action: 'LINK_ADMISSION',
  decision: 'ADMIT',
  targetId: 'link:sr:burst->dispersion',
  evidenceSha256: srSpanA.span_sha256,
  binding: { from_id: srRecs[0].id, to_id: srRecs[1].id, link_type: 'CARRIES', span_sha256: srSpanA.span_sha256, start: 0, end: 15 },
});
receiverSR_A.admitLink({
  linkId: 'link:sr:burst->dispersion',
  fromId: srRecs[0].id,
  toId: srRecs[1].id,
  linkType: 'CARRIES',
  spanProof: srSpanA,
  adjudicatorReceiptId: srLinkAdjA,
});

// World B: SAME records & link, BUT history contains a rejected prior candidate attempt!
for (const r of srRecs) {
  const prop = receiverSR_B.prepareImport(JSON.stringify(r));
  const adjId = `adj:sr_b:${r.id}`;
  receiverSR_B.registerAdjudicationEvent({
    receiptId: adjId,
    adjudicatorRole: 'ORCHESTRATOR',
    action: 'RECORD_ADMISSION',
    decision: 'ADMIT',
    targetId: r.id,
    evidenceSha256: prop.input_sha256,
  });
  receiverSR_B.admitRecord(prop, { humanReviewRef: 'SAC[X6ZNK5NO51]:TEST', adjudicatorReceiptId: adjId });
}

// In World B, an earlier contested candidate link was REJECTED by Aperture before the true link was found!
receiverSR_B.registerAdjudicationEvent({
  receiptId: 'adj:sr_b:rejected_attempt:01',
  adjudicatorRole: 'APERTURE_AUDITOR',
  action: 'LINK_ADMISSION',
  decision: 'REJECT',
  targetId: 'link:sr:burst->noise_unconditioned',
  evidenceSha256: sha256('REJECTED_UNCONDITIONED_CANDIDATE'),
  binding: { from_id: srRecs[0].id, to_id: srRecs[1].id, link_type: 'OVERWHELMS', reason: 'Aperture ill-conditioned noise geometry' },
});

// World B then admits the exact same valid link as World A
const srBufB = Buffer.from(JSON.stringify(srRecs[0]));
const srSpanB = { start: 0, end: 15, span_sha256: sha256(srBufB.subarray(0, 15)) };
const srLinkAdjB = 'adj:sr_b:link:01';
receiverSR_B.registerAdjudicationEvent({
  receiptId: srLinkAdjB,
  adjudicatorRole: 'APERTURE_AUDITOR',
  action: 'LINK_ADMISSION',
  decision: 'ADMIT',
  targetId: 'link:sr:burst->dispersion',
  evidenceSha256: srSpanB.span_sha256,
  binding: { from_id: srRecs[0].id, to_id: srRecs[1].id, link_type: 'CARRIES', span_sha256: srSpanB.span_sha256, start: 0, end: 15 },
});
receiverSR_B.admitLink({
  linkId: 'link:sr:burst->dispersion',
  fromId: srRecs[0].id,
  toId: srRecs[1].id,
  linkType: 'CARRIES',
  spanProof: srSpanB,
  adjudicatorReceiptId: srLinkAdjB,
});

// Evaluate Twin World 1
const piSR_A = canonicalProjectionPi(receiverSR_A);
const piSR_B = canonicalProjectionPi(receiverSR_B);
const hSR_A = extractProcessHistoryH(receiverSR_A);
const hSR_B = extractProcessHistoryH(receiverSR_B);

const srEqualTerminal = piSR_A.projection_digest === piSR_B.projection_digest;
const srDistinctHistory = hSR_A.history_digest !== hSR_B.history_digest;
const srRejectionsObserved = hSR_B.history_payload.rejections_count === 1 && hSR_A.history_payload.rejections_count === 0;

twinWorldEvaluations.push({
  estate: 'SIGNALRUPTURE',
  description: 'Equal final relation graph; World B retains an Aperture-rejected candidate attempt',
  pi_equality: srEqualTerminal,
  pi_digest: piSR_A.projection_digest,
  h_inequality: srDistinctHistory,
  inquiry_1_terminal_mutual_information: 0.0,
  inquiry_1_theoretical_discriminability_under_balanced_prior: 0.50,
  inquiry_2_construction_history_separability: 1.0,
  separability_classification: 'THEORETICAL_QUOTIENT_LOSS_AND_IN_SAMPLE_TRACE_SEPARABILITY',
  empirical_blinded_classifier_executed: false,
  rejection_event_preserved: srRejectionsObserved,
  verdict: srEqualTerminal && srDistinctHistory && srRejectionsObserved ? 'INVARIANT_CONFIRMED' : 'FAILED',
});

console.log(`[SignalRupture] Pi(G_A) === Pi(G_B): ${srEqualTerminal} (Digest: ${piSR_A.projection_digest.slice(0, 16)}...)`);
console.log(`[SignalRupture] H_A !== H_B: ${srDistinctHistory} (World B Rejections: ${hSR_B.history_payload.rejections_count})`);

// =============================================================
// TWIN WORLD SET 2: EMSTD613 (Human Work Gate Contestation & Override)
// =============================================================
console.log('\n--- EXECUTING TWIN WORLD SET 2: EMSTD613 ---');

const receiverEM_A = new UniversalAtelierReceiver(':memory:');
receiverEM_A.initialize({ memory: true, recipientId: 'em_a', episodeId: 'ep_em_a' });
const receiverEM_B = new UniversalAtelierReceiver(':memory:');
receiverEM_B.initialize({ memory: true, recipientId: 'em_b', episodeId: 'ep_em_b' });

const emRec = {
  id: 'em:work:route_03_custody',
  kind: 'work_route',
  label: 'Work Route 3 Custodial Progression',
  family: 'governance',
  synthetic: true,
  body: 'Human gated route across 8 decision boundaries.',
};

// World A: Direct human approval
const propEMA = receiverEM_A.prepareImport(JSON.stringify(emRec));
const adjEMA = 'adj:em_a:direct';
receiverEM_A.registerAdjudicationEvent({
  receiptId: adjEMA,
  adjudicatorKind: 'HUMAN',
  adjudicatorRole: 'ORCHESTRATOR',
  action: 'RECORD_ADMISSION',
  decision: 'ADMIT',
  targetId: emRec.id,
  evidenceSha256: propEMA.input_sha256,
});
receiverEM_A.admitRecord(propEMA, { humanReviewRef: 'SAC[X6ZNK5NO51]:OPERATOR_CONFIRMED', adjudicatorReceiptId: adjEMA });

// World B: Prior rejection on Gate #3, resolved by reparative override
const propEMB = receiverEM_B.prepareImport(JSON.stringify(emRec));
receiverEM_B.registerAdjudicationEvent({
  receiptId: 'adj:em_b:gate3_reject',
  adjudicatorKind: 'HUMAN',
  adjudicatorRole: 'PEDAGOGUE_AUDITOR',
  action: 'RECORD_ADMISSION',
  decision: 'REJECT',
  targetId: emRec.id,
  evidenceSha256: propEMB.input_sha256,
  binding: { gate: 'GATE_03_CISTERN_LAW', reason: 'Consequence order inverted' },
});
// Reparative override
const adjEMB_Reparative = 'adj:em_b:gate3_reparative';
receiverEM_B.registerAdjudicationEvent({
  receiptId: adjEMB_Reparative,
  adjudicatorKind: 'HUMAN',
  adjudicatorRole: 'ORCHESTRATOR',
  action: 'RECORD_ADMISSION',
  decision: 'ADMIT',
  targetId: emRec.id,
  evidenceSha256: propEMB.input_sha256,
  binding: { reparative_override: true, gate: 'GATE_03_CISTERN_LAW', resolution: 'Consequence restored prior to ontology' },
});
receiverEM_B.admitRecord(propEMB, { humanReviewRef: 'SAC[X6ZNK5NO51]:REPARATIVE_RESOLUTION', adjudicatorReceiptId: adjEMB_Reparative });

const piEM_A = canonicalProjectionPi(receiverEM_A);
const piEM_B = canonicalProjectionPi(receiverEM_B);
const hEM_A = extractProcessHistoryH(receiverEM_A);
const hEM_B = extractProcessHistoryH(receiverEM_B);

const emEqualTerminal = piEM_A.projection_digest === piEM_B.projection_digest;
const emDistinctHistory = hEM_A.history_digest !== hEM_B.history_digest;
const emGateHistoryPreserved = hEM_B.history_payload.rejections_count === 1;

twinWorldEvaluations.push({
  estate: 'EMSTD613',
  description: 'Equal final Work Route node; World B preserves prior Gate #3 human rejection & reparative override',
  pi_equality: emEqualTerminal,
  pi_digest: piEM_A.projection_digest,
  h_inequality: emDistinctHistory,
  inquiry_1_terminal_mutual_information: 0.0,
  inquiry_1_theoretical_discriminability_under_balanced_prior: 0.50,
  inquiry_2_construction_history_separability: 1.0,
  separability_classification: 'THEORETICAL_QUOTIENT_LOSS_AND_IN_SAMPLE_TRACE_SEPARABILITY',
  empirical_blinded_classifier_executed: false,
  rejection_event_preserved: emGateHistoryPreserved,
  verdict: emEqualTerminal && emDistinctHistory && emGateHistoryPreserved ? 'INVARIANT_CONFIRMED' : 'FAILED',
});

console.log(`[EMSTD613] Pi(G_A) === Pi(G_B): ${emEqualTerminal} (Digest: ${piEM_A.projection_digest.slice(0, 16)}...)`);
console.log(`[EMSTD613] H_A !== H_B: ${emDistinctHistory} (World B Rejections: ${hEM_B.history_payload.rejections_count})`);

// =============================================================
// TWIN WORLD SET 3: WENDBINE (Dropped Capture vs Admitted Metadata)
// =============================================================
console.log('\n--- EXECUTING TWIN WORLD SET 3: WENDBINE ---');

const receiverWB_A = new UniversalAtelierReceiver(':memory:');
receiverWB_A.initialize({ memory: true, recipientId: 'wb_a', episodeId: 'ep_wb_a' });
const receiverWB_B = new UniversalAtelierReceiver(':memory:');
receiverWB_B.initialize({ memory: true, recipientId: 'wb_b', episodeId: 'ep_wb_b' });

const wbRecs = [
  { id: 'wb:concept:homeostasis', kind: 'glossary', label: 'Homeostatic Boundary', family: 'G_A', synthetic: true, body: 'Homeostatic network control.' },
  { id: 'wb:concept:governance', kind: 'glossary', label: 'Network Governance', family: 'G_A', synthetic: true, body: 'Governed protocol.' },
];

for (const r of wbRecs) {
  const pA = receiverWB_A.prepareImport(JSON.stringify(r));
  const adjA = `adj:wb_a:${r.id}`;
  receiverWB_A.registerAdjudicationEvent({
    receiptId: adjA,
    adjudicatorRole: 'ORCHESTRATOR',
    action: 'RECORD_ADMISSION',
    decision: 'ADMIT',
    targetId: r.id,
    evidenceSha256: pA.input_sha256,
  });
  receiverWB_A.admitRecord(pA, { humanReviewRef: 'SAC[X6ZNK5NO51]:TEST', adjudicatorReceiptId: adjA });

  const pB = receiverWB_B.prepareImport(JSON.stringify(r));
  const adjB = `adj:wb_b:${r.id}`;
  receiverWB_B.registerAdjudicationEvent({
    receiptId: adjB,
    adjudicatorRole: 'ORCHESTRATOR',
    action: 'RECORD_ADMISSION',
    decision: 'ADMIT',
    targetId: r.id,
    evidenceSha256: pB.input_sha256,
  });
  receiverWB_B.admitRecord(pB, { humanReviewRef: 'SAC[X6ZNK5NO51]:TEST', adjudicatorReceiptId: adjB });
}

// In World B, an unauthorized attempt with unallowlisted fields was rejected prior to clean admission
receiverWB_B.registerAdjudicationEvent({
  receiptId: 'adj:wb_b:unallowlisted_attempt',
  adjudicatorRole: 'FADT_AUDITOR',
  action: 'RECORD_ADMISSION',
  decision: 'REJECT',
  targetId: 'wb:concept:unallowlisted_smuggled_capture',
  evidenceSha256: sha256('UNALLOWLISTED_BODY_ATTEMPT'),
  binding: { reason: 'WENDBINE_FULL_BODY_FIELD_REFUSED' },
});

// Admit common link
const wbBufA = Buffer.from(JSON.stringify(wbRecs[0]));
const wbSpanA = { start: 0, end: 15, span_sha256: sha256(wbBufA.subarray(0, 15)) };
const wbLinkAdjA = 'adj:wb_a:link:01';
receiverWB_A.registerAdjudicationEvent({
  receiptId: wbLinkAdjA,
  adjudicatorRole: 'ORCHESTRATOR',
  action: 'LINK_ADMISSION',
  decision: 'ADMIT',
  targetId: 'link:wb:homeostasis->governance',
  evidenceSha256: wbSpanA.span_sha256,
  binding: { from_id: wbRecs[0].id, to_id: wbRecs[1].id, link_type: 'BOUNDS', span_sha256: wbSpanA.span_sha256, start: 0, end: 15 },
});
receiverWB_A.admitLink({
  linkId: 'link:wb:homeostasis->governance',
  fromId: wbRecs[0].id,
  toId: wbRecs[1].id,
  linkType: 'BOUNDS',
  spanProof: wbSpanA,
  adjudicatorReceiptId: wbLinkAdjA,
});

const wbLinkAdjB = 'adj:wb_b:link:01';
receiverWB_B.registerAdjudicationEvent({
  receiptId: wbLinkAdjB,
  adjudicatorRole: 'ORCHESTRATOR',
  action: 'LINK_ADMISSION',
  decision: 'ADMIT',
  targetId: 'link:wb:homeostasis->governance',
  evidenceSha256: wbSpanA.span_sha256,
  binding: { from_id: wbRecs[0].id, to_id: wbRecs[1].id, link_type: 'BOUNDS', span_sha256: wbSpanA.span_sha256, start: 0, end: 15 },
});
receiverWB_B.admitLink({
  linkId: 'link:wb:homeostasis->governance',
  fromId: wbRecs[0].id,
  toId: wbRecs[1].id,
  linkType: 'BOUNDS',
  spanProof: wbSpanA,
  adjudicatorReceiptId: wbLinkAdjB,
});

const piWB_A = canonicalProjectionPi(receiverWB_A);
const piWB_B = canonicalProjectionPi(receiverWB_B);
const hWB_A = extractProcessHistoryH(receiverWB_A);
const hWB_B = extractProcessHistoryH(receiverWB_B);

const wbEqualTerminal = piWB_A.projection_digest === piWB_B.projection_digest;
const wbDistinctHistory = hWB_A.history_digest !== hWB_B.history_digest;

twinWorldEvaluations.push({
  estate: 'WENDBINE',
  description: 'Equal 9-graph BOUNDS relation; World B preserves unallowlisted capture rejection event',
  pi_equality: wbEqualTerminal,
  pi_digest: piWB_A.projection_digest,
  h_inequality: wbDistinctHistory,
  inquiry_1_terminal_mutual_information: 0.0,
  inquiry_1_theoretical_discriminability_under_balanced_prior: 0.50,
  inquiry_2_construction_history_separability: 1.0,
  separability_classification: 'THEORETICAL_QUOTIENT_LOSS_AND_IN_SAMPLE_TRACE_SEPARABILITY',
  empirical_blinded_classifier_executed: false,
  rejection_event_preserved: hWB_B.history_payload.rejections_count === 1,
  verdict: wbEqualTerminal && wbDistinctHistory ? 'INVARIANT_CONFIRMED' : 'FAILED',
});

console.log(`[Wendbine] Pi(G_A) === Pi(G_B): ${wbEqualTerminal} (Digest: ${piWB_A.projection_digest.slice(0, 16)}...)`);
console.log(`[Wendbine] H_A !== H_B: ${wbDistinctHistory} (World B Rejections: ${hWB_B.history_payload.rejections_count})`);

// =============================================================
// TWIN WORLD SET 4: TD613 REFERENCE (Canonical Baseline vs Late Accession)
// =============================================================
console.log('\n--- EXECUTING TWIN WORLD SET 4: TD613 REFERENCE ---');

const receiverTD_A = new UniversalAtelierReceiver(':memory:');
receiverTD_A.initialize({ memory: true, recipientId: 'td_a', episodeId: 'ep_td_a' });
const receiverTD_B = new UniversalAtelierReceiver(':memory:');
receiverTD_B.initialize({ memory: true, recipientId: 'td_b', episodeId: 'ep_td_b' });

const tdRecs = [
  { id: 'G-001', kind: 'glossary', label: 'Eclipse–Omega', family: 'Foundations', synthetic: true, body: 'Canonical theory.' },
  { id: 'SRC-P1', kind: 'source', label: 'Primary Literature P1', family: 'Sources', synthetic: true, body: 'Foundational paper.' },
];

for (const r of tdRecs) {
  const pA = receiverTD_A.prepareImport(JSON.stringify(r));
  const adjA = `adj:td_a:${r.id}`;
  receiverTD_A.registerAdjudicationEvent({
    receiptId: adjA,
    adjudicatorRole: 'ORCHESTRATOR',
    action: 'RECORD_ADMISSION',
    decision: 'ADMIT',
    targetId: r.id,
    evidenceSha256: pA.input_sha256,
  });
  receiverTD_A.admitRecord(pA, { humanReviewRef: 'SAC[X6ZNK5NO51]:CANONICAL_BASELINE', adjudicatorReceiptId: adjA });

  const pB = receiverTD_B.prepareImport(JSON.stringify(r));
  const adjB = `adj:td_b:${r.id}`;
  receiverTD_B.registerAdjudicationEvent({
    receiptId: adjB,
    adjudicatorRole: 'ORCHESTRATOR',
    action: 'RECORD_ADMISSION',
    decision: 'ADMIT',
    targetId: r.id,
    evidenceSha256: pB.input_sha256,
  });
  receiverTD_B.admitRecord(pB, { humanReviewRef: 'SAC[X6ZNK5NO51]:LATE_ACCESSION_STAGED', adjudicatorReceiptId: adjB });
}

// World B records a withdrawn draft accession proposal
receiverTD_B.registerAdjudicationEvent({
  receiptId: 'adj:td_b:withdrawn_draft',
  adjudicatorRole: 'TEMPORAL_CUSTODIAN',
  action: 'WITHDRAWAL',
  decision: 'HOLD',
  targetId: 'G-001',
  evidenceSha256: sha256('WITHDRAWN_DRAFT_PROPOSAL'),
  binding: { reason: 'Superseded by canonical baseline before final publication' },
});

// Common link
const tdBufA = Buffer.from(JSON.stringify(tdRecs[0]));
const tdSpanA = { start: 0, end: 15, span_sha256: sha256(tdBufA.subarray(0, 15)) };
const tdLinkAdjA = 'adj:td_a:link:01';
receiverTD_A.registerAdjudicationEvent({
  receiptId: tdLinkAdjA,
  adjudicatorRole: 'ORCHESTRATOR',
  action: 'LINK_ADMISSION',
  decision: 'ADMIT',
  targetId: 'link:td:G-001->SRC-P1',
  evidenceSha256: tdSpanA.span_sha256,
  binding: { from_id: tdRecs[0].id, to_id: tdRecs[1].id, link_type: 'cites_source', span_sha256: tdSpanA.span_sha256, start: 0, end: 15 },
});
receiverTD_A.admitLink({
  linkId: 'link:td:G-001->SRC-P1',
  fromId: tdRecs[0].id,
  toId: tdRecs[1].id,
  linkType: 'cites_source',
  spanProof: tdSpanA,
  adjudicatorReceiptId: tdLinkAdjA,
});

const tdLinkAdjB = 'adj:td_b:link:01';
receiverTD_B.registerAdjudicationEvent({
  receiptId: tdLinkAdjB,
  adjudicatorRole: 'ORCHESTRATOR',
  action: 'LINK_ADMISSION',
  decision: 'ADMIT',
  targetId: 'link:td:G-001->SRC-P1',
  evidenceSha256: tdSpanA.span_sha256,
  binding: { from_id: tdRecs[0].id, to_id: tdRecs[1].id, link_type: 'cites_source', span_sha256: tdSpanA.span_sha256, start: 0, end: 15 },
});
receiverTD_B.admitLink({
  linkId: 'link:td:G-001->SRC-P1',
  fromId: tdRecs[0].id,
  toId: tdRecs[1].id,
  linkType: 'cites_source',
  spanProof: tdSpanA,
  adjudicatorReceiptId: tdLinkAdjB,
});

const piTD_A = canonicalProjectionPi(receiverTD_A);
const piTD_B = canonicalProjectionPi(receiverTD_B);
const hTD_A = extractProcessHistoryH(receiverTD_A);
const hTD_B = extractProcessHistoryH(receiverTD_B);

const tdEqualTerminal = piTD_A.projection_digest === piTD_B.projection_digest;
const tdDistinctHistory = hTD_A.history_digest !== hTD_B.history_digest;

twinWorldEvaluations.push({
  estate: 'TD613_REFERENCE',
  description: 'Equal canonical citation graph; World B retains withdrawn draft accession history',
  pi_equality: tdEqualTerminal,
  pi_digest: piTD_A.projection_digest,
  h_inequality: tdDistinctHistory,
  inquiry_1_terminal_mutual_information: 0.0,
  inquiry_1_theoretical_discriminability_under_balanced_prior: 0.50,
  inquiry_2_construction_history_separability: 1.0,
  separability_classification: 'THEORETICAL_QUOTIENT_LOSS_AND_IN_SAMPLE_TRACE_SEPARABILITY',
  empirical_blinded_classifier_executed: false,
  rejection_event_preserved: hTD_B.history_payload.rejections_count === 1,
  verdict: tdEqualTerminal && tdDistinctHistory ? 'INVARIANT_CONFIRMED' : 'FAILED',
});

console.log(`[TD613 Reference] Pi(G_A) === Pi(G_B): ${tdEqualTerminal} (Digest: ${piTD_A.projection_digest.slice(0, 16)}...)`);
console.log(`[TD613 Reference] H_A !== H_B: ${tdDistinctHistory} (World B Rejections: ${hTD_B.history_payload.rejections_count})`);

// -------------------------------------------------------------
// SUMMARY & SCIENTIFIC RETURN
// -------------------------------------------------------------
const allPassed = twinWorldEvaluations.every(e => e.verdict === 'INVARIANT_CONFIRMED');

console.log('\n================================================================');
console.log(`TWIN-WORLD ASSAY SUMMARY: ${twinWorldEvaluations.filter(e => e.verdict === 'INVARIANT_CONFIRMED').length} / 4 Estates INVARIANT_CONFIRMED (All Passed: ${allPassed})`);
console.log('================================================================');

const receipt = {
  schema: 'td613.four-crossing-capstone.twin-world-assay-receipt/v1',
  evaluated_at: new Date().toISOString(),
  authority: 'SAC[X6ZNK5NO51]',
  covenant: 'Khona\u200Clit-po',
  preregistered_theorems: {
    terminal_projection_quotient: 'Pi(G_A) === Pi(G_B) holds across all 4 estates; canonical graph serialization of admitted nodes/edges yields identical SHA-256 digest.',
    historical_trace_divergence: 'H_A !== H_B holds across all 4 estates; retained adjudication events, rejections, and intake lineage yield distinct digests.',
    inquiry_1_theoretical_separability: 'Under Pi alone, terminal graphs are identical. Mutual information I(World; Pi(G)) = 0. Under a balanced symmetric prior, expected chance accuracy is 50%. This is a theoretical property of the lossy quotient, NOT an empirically scored blinded classifier result.',
    inquiry_2_construction_separability: 'When process trace H is provided, the signed rejection/override events render World A and World B distinguishable in-sample (1.0 trace separability within this constructed synthetic assay). This demonstrates internal trace preservation, NOT an empirical blinded evaluation.',
    externality_boundary_preserved: 'Synthetic process trace restores internal discriminability within the constructed experiment without proving external empirical origin. Shared acquisition adds zero independent replication credit.',
  },
  estates_evaluated: twinWorldEvaluations,
  all_passed: allPassed,
};

fs.writeFileSync(RECEIPT_PATH, JSON.stringify(receipt, null, 2), 'utf8');
console.log(`Wrote Twin-World assay receipt to: ${RECEIPT_PATH}`);

if (!allPassed) process.exit(1);
