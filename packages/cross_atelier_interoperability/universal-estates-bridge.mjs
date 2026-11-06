/**
 * 𝌋 TD613 · UNIVERSAL ESTATES BRIDGE & QUALIFICATION (CROSSING T)
 * Operationalization of Universal Atelier and Universal Encyclopedia
 * 
 * Implements Section III Requirements:
 * 1. Universal Atelier: Original research-method inventory, lawful source routing,
 *    native receiver functionality, adjudication receipts, span proofs, and 10 canonical operations.
 * 2. Universal Encyclopedia: Reference corpus (1,141 records, 2,131 edges),
 *    bounded reception, source-preserving representation, method attribution, and custodial return.
 * 3. Composite Crossing: Universal Atelier -> Universal Encyclopedia -> Manifest / SRC / Palace
 * 
 * Authority: SAC[X6ZNK5NO51] · Covenant: Khona‌lit-po (literal U+200C preserved)
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

import {
  UniversalAtelierReceiver,
  UniversalAtelierError,
  sha256,
  JURISDICTIONS,
} from '../universal_atelier/receiver/universal-atelier-receiver.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..', '..');
const ENCYCLOPEDIA_REF_DIR = path.resolve(REPO_ROOT, 'app', 'encyclopedia', 'reference');

export function sha256Hex(data) {
  const buf = Buffer.isBuffer(data) ? data : Buffer.from(String(data), 'utf8');
  return crypto.createHash('sha256').update(buf).digest('hex');
}

/**
 * 1. Universal Atelier Estate
 * Encapsulates the native SQLite-backed receiver and 10 canonical operations.
 */
export class UniversalAtelierEstate {
  constructor({
    recipientId = 'ua_rcp_synth_u00',
    episodeId = `ua_ep_${Date.now()}`,
    dbPath = ':memory:',
  } = {}) {
    this.recipientId = recipientId;
    this.episodeId = episodeId;
    this.dbPath = dbPath;
    this.receiver = new UniversalAtelierReceiver(this.dbPath);
    this.startupWitness = null;
    this.admittedRecordIds = new Set();
    this.admittedLinkIds = new Set();
  }

  initialize() {
    this.startupWitness = this.receiver.initialize({
      memory: this.dbPath === ':memory:',
      recipientId: this.recipientId,
      episodeId: this.episodeId,
    });
    return this.startupWitness;
  }

  /**
   * Stages and imports a research record with explicit synthetic declaration (Amendment B).
   */
  prepareAndAdmitRecord(recordObj, {
    adjudicatorRole = 'ORCHESTRATOR',
    humanReviewRef = 'SAC[X6ZNK5NO51]',
    decision = 'ADMIT',
  } = {}) {
    // Enforce explicit synthetic boolean flag for test adjudication
    const stagedRecord = {
      ...recordObj,
      synthetic: true,
    };

    const rawJson = JSON.stringify(stagedRecord, null, 2);
    const proposal = this.receiver.prepareImport(rawJson);

    const receiptId = `adj:ua:${recordObj.id || 'rec'}:${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    this.receiver.registerAdjudicationEvent({
      receiptId,
      adjudicatorRole,
      decision,
      targetId: recordObj.id,
      evidenceSha256: proposal.input_sha256,
    });

    const admitted = this.receiver.admitRecord(proposal, {
      humanReviewRef,
      adjudicatorReceiptId: receiptId,
    });

    this.admittedRecordIds.add(admitted.record_id);
    return admitted;
  }

  /**
   * Admits a directed link with an authentic cryptographic span proof.
   */
  admitDirectedLink({
    sourceRecordId,
    targetRecordId,
    predicate = 'WARRANTED_BY',
    sourceRawJson,
    matchedSpanText,
    linkId = null,
    adjudicatorRole = 'APERTURE_AUDITOR',
    humanReviewRef = 'SAC[X6ZNK5NO51]',
  }) {
    const buf = Buffer.from(sourceRawJson, 'utf8');
    const startIdx = buf.indexOf(matchedSpanText);
    if (startIdx < 0) {
      throw new Error(`[SPAN_NOT_FOUND] Span text "${matchedSpanText}" not found in source payload.`);
    }
    const endIdx = startIdx + Buffer.from(matchedSpanText, 'utf8').length;
    const spanHash = sha256(buf.subarray(startIdx, endIdx));

    const finalLinkId = linkId || `link:${sourceRecordId}->${targetRecordId}`;
    const receiptId = `adj:ua:link:${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    this.receiver.registerAdjudicationEvent({
      receiptId,
      jurisdiction: 'TEST_ONLY_SYNTHETIC_ADJUDICATION',
      adjudicatorKind: 'MACHINE_SYNTHETIC',
      adjudicatorRole,
      action: 'LINK_ADMISSION',
      decision: 'ADMIT',
      targetId: finalLinkId,
      evidenceSha256: spanHash,
      binding: {
        from_id: sourceRecordId,
        to_id: targetRecordId,
        link_type: predicate,
        span_sha256: spanHash,
        start: startIdx,
        end: endIdx,
      },
    });

    const linkResult = this.receiver.admitLink({
      linkId: finalLinkId,
      fromId: sourceRecordId,
      toId: targetRecordId,
      linkType: predicate,
      temporalClassification: 'ANY_RELATION',
      spanProof: {
        start: startIdx,
        end: endIdx,
        span_sha256: spanHash,
      },
      adjudicatorReceiptId: receiptId,
      humanReviewRef,
    });

    this.admittedLinkIds.add(linkResult.link_id);
    return linkResult;
  }

  /**
   * Executes the 10 canonical operations suite.
   */
  executeCanonicalOperationsSuite(sampleRecordId, targetRecordId = null) {
    const sResults = this.receiver.search({ q: 'Khona' });
    const gResult = this.receiver.get(sampleRecordId);
    const cResult = this.receiver.cite(sampleRecordId);
    const nResult = this.receiver.neighbors(sampleRecordId);
    const rResult = targetRecordId ? this.receiver.route(sampleRecordId, targetRecordId) : { found: false, depth: 0, path: [] };
    const ctxResult = this.receiver.context(sampleRecordId, { maxRecords: 10 });
    const vResult = this.receiver.verify();
    const expResult = this.receiver.export();

    return {
      search_hit_count: sResults.total_returned,
      retrieved_id: gResult.record_id,
      citation_format: cResult.citation_format,
      neighbors_outgoing_count: nResult.outgoing.length,
      route_found: rResult.found,
      context_packaged_records: ctxResult.records.length,
      verification_mismatches: vResult.mismatches,
      export_record_count: expResult.total_records,
      export_witness_matches_startup: expResult.initial_witness.witness_hash === this.startupWitness.witness_hash,
    };
  }
}

/**
 * 2. Universal Encyclopedia Estate
 * Provides access to the verified Reference Corpus v1.4 (1,141 records, 2,131 edges).
 */
export class UniversalEncyclopediaEstate {
  constructor({ refDir = ENCYCLOPEDIA_REF_DIR } = {}) {
    this.refDir = refDir;
    this.manifest = null;
    this.directory = null;
    this.graph = null;
    this.isLoaded = false;
  }

  loadReferenceCorpus() {
    const manifestPath = path.join(this.refDir, 'manifest.json');
    const directoryPath = path.join(this.refDir, 'directory.json');
    const graphPath = path.join(this.refDir, 'graph.json');

    if (!fs.existsSync(manifestPath) || !fs.existsSync(directoryPath) || !fs.existsSync(graphPath)) {
      throw new Error(`[ENCYCLOPEDIA_MISSING] Reference directory incomplete at ${this.refDir}`);
    }

    this.manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    this.directory = JSON.parse(fs.readFileSync(directoryPath, 'utf8'));
    this.graph = JSON.parse(fs.readFileSync(graphPath, 'utf8'));
    this.isLoaded = true;

    return {
      edition_version: this.manifest.edition_version || '1.4',
      record_count: this.directory.length,
      edge_count: this.graph.edges ? this.graph.edges.length : 0,
      unresolved_count: this.graph.unresolved ? this.graph.unresolved.length : 0,
      canonical_sha256: this.manifest.canonical_payload_sha256,
    };
  }

  getRecord(recordId) {
    if (!this.isLoaded) this.loadReferenceCorpus();
    const entry = this.directory.find(d => d.id === recordId);
    if (!entry) return null;

    const recordFile = path.join(this.refDir, 'records', `${recordId}.json`);
    let fullRecord = null;
    if (fs.existsSync(recordFile)) {
      fullRecord = JSON.parse(fs.readFileSync(recordFile, 'utf8'));
    }

    const sha = entry.record_sha256 || entry.sha256 || '0000000000000000';
    return {
      directory_entry: entry,
      full_record: fullRecord,
      citation: `TD613·UA[${entry.id}]::sha256(${sha.slice(0, 16)})`,
    };
  }

  queryReferenceCorpus({ search = '', kind = null, limit = 20 } = {}) {
    if (!this.isLoaded) this.loadReferenceCorpus();
    const term = search.toLowerCase();
    const filtered = this.directory.filter(entry => {
      if (kind && entry.kind !== kind) return false;
      if (!term) return true;
      return (entry.label && entry.label.toLowerCase().includes(term)) ||
             (entry.family && entry.family.toLowerCase().includes(term)) ||
             (entry.id && entry.id.toLowerCase().includes(term));
    });
    return filtered.slice(0, limit);
  }

  traceNeighbors(recordId) {
    if (!this.isLoaded) this.loadReferenceCorpus();
    const edges = this.graph.edges || [];
    const outgoing = edges.filter(e => e.source === recordId);
    const incoming = edges.filter(e => e.target === recordId);
    return {
      recordId,
      outgoing,
      incoming,
    };
  }
}

/**
 * 3. Composite Crossing: Universal Atelier -> Universal Encyclopedia -> Manifest/SRC/Palace
 * Connects research intake in Universal Atelier with authoritative reference records in Universal Encyclopedia,
 * producing grounded warrants for Manifest and bounded capsules for Palace.
 */
export function executeUniversalToCrossAtelierBridge({
  atelierRecord,
  encyclopediaContractId = 'APT-01',
  manifestEngine,
  currentTick = 10,
}) {
  const encEstate = new UniversalEncyclopediaEstate();
  const encCensus = encEstate.loadReferenceCorpus();
  const encContract = encEstate.getRecord(encyclopediaContractId);

  if (!encContract) {
    throw new Error(`[UNIVERSAL_CROSSING_ERROR] Target contract ${encyclopediaContractId} not found in reference corpus.`);
  }

  // Cryptographic method attribution & warrant binding
  const contractSha = encContract.directory_entry.record_sha256 || encContract.directory_entry.sha256 || '00000000';
  const derivationPayload = {
    source_record_id: atelierRecord.record_id,
    source_sha256: atelierRecord.sha256,
    reference_contract_id: encContract.directory_entry.id,
    reference_contract_sha256: contractSha,
    citation: encContract.citation,
    admitted_at_tick: currentTick,
  };

  const warrantDigest = sha256Hex(JSON.stringify(derivationPayload));

  // If manifestEngine is provided, admit derivation rule under default-deny contracts
  let manifestLfp = null;
  if (manifestEngine) {
    const rootId = `root_${atelierRecord.record_id}`;
    manifestEngine.admitSourceRoot({
      root_id: rootId,
      source_id: atelierRecord.record_id,
      raw_bytes: Buffer.from(atelierRecord.sha256, 'utf8'),
      evidence_class: 'SYNTHETIC_RESEARCH_WITNESS',
      acquisition_id: `acq:ua:${atelierRecord.record_id}`,
    });

    manifestEngine.addDerivationRule({
      rule_id: `rule:ua_enc_${atelierRecord.record_id}`,
      head_claim_id: `claim:grounded_${atelierRecord.record_id}`,
      premise_ids: [rootId],
      rule_type: 'DEFAULT_DENY_EXPLICIT_LIFT',
      receipt_id: `receipt:ua_enc_${warrantDigest.slice(0, 16)}`,
    });

    manifestLfp = manifestEngine.computeLeastFixedPoint();
  }

  return {
    schema: 'td613.universal-cross-atelier-bridge/v1.0',
    atelier_source_id: atelierRecord.record_id,
    encyclopedia_contract_id: encContract.directory_entry.id,
    encyclopedia_citation: encContract.citation,
    warrant_digest: warrantDigest,
    manifest_lfp_size: manifestLfp ? manifestLfp.P.size : null,
    is_grounded: manifestLfp ? manifestLfp.P.has(`claim:grounded_${atelierRecord.record_id}`) : false,
    census: encCensus,
  };
}
