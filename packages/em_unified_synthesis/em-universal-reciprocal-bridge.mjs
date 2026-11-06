/**
 * TD613 Em to Universal Reciprocal Bridge
 * Commission EM E-00 · Section V
 * 
 * Bounded, source-free reciprocal interface inheriting frozen U-00 estates:
 * - UniversalAtelierEstate (in-memory SQLite receiver, 10 canonical operations, span proofs)
 * - UniversalEncyclopediaEstate (authentic Reference Corpus v1.4, 1,141 records, 2,131 edges)
 * - ManifestWarrantEngine (least fixed point LFP closure, default-deny)
 * - Palace-style temporal availability and withdrawal constraints
 * 
 * Invariants:
 * - Em research identity is strictly preserved.
 * - Reference corpus matches are NOT automatically promoted into warranted scientific theory.
 * - Exact source, method, observation, acquisition, and recording coordinates are preserved.
 */

import {
  UniversalAtelierEstate,
  UniversalEncyclopediaEstate,
  sha256Hex
} from '../cross_atelier_interoperability/universal-estates-bridge.mjs';

import {
  ManifestWarrantEngine
} from '../manifest_reciprocal_warrant/manifest-warrant-engine.mjs';

export class EmUniversalBridgeError extends Error {
  constructor(code, message, details = {}) {
    super(`[${code}] ${message}`);
    this.code = code;
    this.details = details;
  }
}

export class EmUniversalReciprocalBridge {
  constructor(options = {}) {
    this.covenant = 'Khona\u200Clit-po';
    this.authority = 'SAC[X6ZNK5NO51]';
    this.atelier = new UniversalAtelierEstate();
    this.encyclopedia = new UniversalEncyclopediaEstate();
    this.warrantEngine = new ManifestWarrantEngine();
    this.crossingLedger = [];
    this.admittedEmSources = new Map();
    this.census = null;
  }

  initialize() {
    const witness = this.atelier.initialize();
    this.census = this.encyclopedia.loadReferenceCorpus();
    return {
      initialized: true,
      covenant: this.covenant,
      atelier_zero_row_witness: witness,
      encyclopedia_census: this.census
    };
  }

  /**
   * Admits an Em source reference into the bridge custody ledger.
   */
  admitEmSource({ sourceId, filename, rawBytes, evidenceClass = 'TEXT_DOCUMENT', acquisitionId = 'EM_NATIVE_FIXTURE' }) {
    if (!sourceId || !rawBytes) {
      throw new EmUniversalBridgeError('SOURCE_ID_AND_BYTES_REQUIRED', 'Source ID and raw bytes are required.');
    }
    const buf = Buffer.isBuffer(rawBytes) ? rawBytes : Buffer.from(rawBytes, 'utf8');
    const digest = sha256Hex(buf);

    const sourceRecord = {
      source_id: sourceId,
      filename,
      byte_length: buf.length,
      sha256: digest,
      evidence_class: evidenceClass,
      acquisition_id: acquisitionId,
      raw_bytes: buf,
      admitted_at: new Date().toISOString()
    };
    this.admittedEmSources.set(sourceId, sourceRecord);

    // Also register root in Manifest warrant engine
    this.warrantEngine.admitSourceRoot({
      root_id: sourceId,
      source_id: sourceId,
      raw_bytes: buf,
      acquisition_id: acquisitionId
    });

    return sourceRecord;
  }

  /**
   * Conveys an Em source passage into the Universal Atelier under native admission contract.
   */
  stageEmPassageIntoAtelier({
    recordId,
    sourceId,
    byteOffset,
    length,
    claimSummary,
    synthetic = true
  }) {
    const src = this.admittedEmSources.get(sourceId);
    if (!src) {
      throw new EmUniversalBridgeError('SOURCE_NOT_FOUND', `Source ${sourceId} not admitted in bridge.`);
    }

    if (byteOffset < 0 || byteOffset + length > src.raw_bytes.length) {
      throw new EmUniversalBridgeError('SPAN_OUT_OF_BOUNDS', `Span [${byteOffset}, ${byteOffset + length}] exceeds source length ${src.raw_bytes.length}.`);
    }

    const spanSlice = src.raw_bytes.subarray(byteOffset, byteOffset + length);
    const spanSha = sha256Hex(spanSlice);
    const spanText = spanSlice.toString('utf8');

    // Stage into Universal Atelier via prepareAndAdmitRecord
    const recordObj = {
      id: recordId,
      kind: 'contract',
      label: claimSummary || 'Em Passage Staging',
      family: 'covenant',
      status: 'ADMITTED',
      evidence_class: 'SYNTHETIC_RESEARCH_WITNESS',
      claim_ceiling: 'Research witness only.',
      body: spanText,
      synthetic: true
    };

    const atelierRecord = this.atelier.prepareAndAdmitRecord(recordObj, {
      adjudicatorRole: 'ORCHESTRATOR',
      humanReviewRef: 'SAC[X6ZNK5NO51]'
    });

    this.crossingLedger.push({
      action: 'STAGE_EM_TO_ATELIER',
      record_id: recordId,
      source_id: sourceId,
      span_sha256: spanSha,
      timestamp: new Date().toISOString()
    });

    return {
      atelier_record_id: recordId,
      source_id: sourceId,
      byte_offset: byteOffset,
      length: spanSlice.length,
      span_sha256: spanSha,
      span_text: spanText,
      admission_time: atelierRecord.admission_time || new Date().toISOString()
    };
  }

  /**
   * Queries the Universal Encyclopedia's Reference Corpus and returns findings
   * WITHOUT automatically promoting reference matches into warranted theory.
   */
  queryEncyclopediaReference(searchTerm) {
    const searchResults = this.encyclopedia.queryReferenceCorpus({ search: searchTerm, limit: 20 });

    // Invariant: Reference match is an informative bibliographic link, NOT a warranted theory
    const mappedFindings = searchResults.map(entry => {
      const rec = this.encyclopedia.getRecord(entry.id);
      return {
        contract_id: entry.id,
        title: entry.label || entry.id,
        corpus_record_sha256: entry.record_sha256,
        citation_format: rec ? rec.citation : `TD613·UA[${entry.id}]`,
        reference_match_promoted_to_theory: false, // MANDATORY INVARIANT
        promotion_status: 'BIBLIOGRAPHIC_REFERENCE_ONLY'
      };
    });

    return {
      search_term: searchTerm,
      matches_found: mappedFindings.length,
      findings: mappedFindings
    };
  }

  /**
   * Executes Manifest Least Fixed Point Grounding over verified derivation premises.
   */
  groundTheoryWarrant({
    ruleId,
    premises,
    targetClaimId,
    claimStatement,
    sourceCaptureSpanProof
  }) {
    if (!sourceCaptureSpanProof || !sourceCaptureSpanProof.source_id || !sourceCaptureSpanProof.span_sha256) {
      throw new EmUniversalBridgeError('MISSING_SPAN_PROOF', 'Grounded theory warrant requires valid cryptographic span proof.');
    }

    // Verify span against admitted source
    const src = this.admittedEmSources.get(sourceCaptureSpanProof.source_id);
    if (!src) {
      throw new EmUniversalBridgeError('SOURCE_NOT_FOUND', `Source ${sourceCaptureSpanProof.source_id} not admitted.`);
    }

    const slice = src.raw_bytes.subarray(sourceCaptureSpanProof.start, sourceCaptureSpanProof.end);
    const hash = sha256Hex(slice);
    if (hash !== sourceCaptureSpanProof.span_sha256) {
      throw new EmUniversalBridgeError('EXACT_SPAN_DIGEST_MISMATCH', `Span digest mismatch: expected ${sourceCaptureSpanProof.span_sha256} got ${hash}.`);
    }

    // Register claim
    this.warrantEngine.registerClaim({
      claim_id: targetClaimId,
      claim_text: claimStatement || targetClaimId,
      derivation_premises: premises,
    });

    // Register derivation rule in Manifest Warrant Engine
    this.warrantEngine.addDerivationRule({
      rule_id: ruleId,
      head_claim_id: targetClaimId,
      premise_ids: premises,
      rule_type: 'DIRECT_WARRANT',
    });

    const lfp = this.warrantEngine.computeLeastFixedPoint();
    const isGrounded = (lfp.P && lfp.P.has(targetClaimId)) ||
      (lfp.lfpResult && lfp.lfpResult.grounded_ids && lfp.lfpResult.grounded_ids.includes(targetClaimId));

    return {
      rule_id: ruleId,
      target_claim_id: targetClaimId,
      is_grounded_in_lfp: Boolean(isGrounded),
      total_grounded_claims: lfp.P ? lfp.P.size : 0,
      span_proof_verified: true
    };
  }

  close() {
    if (this.atelier.receiver && typeof this.atelier.receiver.close === 'function') {
      this.atelier.receiver.close();
    }
  }
}
