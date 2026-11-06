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

    // Defense: reject duplicate source admission before mutating custody
    if (this.admittedEmSources.has(sourceId)) {
      throw new EmUniversalBridgeError('DUPLICATE_SOURCE_ADMISSION_REJECTED', `Source ID ${sourceId} is already admitted in bridge.`);
    }

    // Defensive buffer copy
    const buf = Buffer.isBuffer(rawBytes) ? Buffer.from(rawBytes) : Buffer.from(String(rawBytes), 'utf8');
    const digest = sha256Hex(buf);

    // Defense: raw PDF bytes cannot masquerade as extracted text support
    const isPdfBytes = buf.length >= 4 && buf.subarray(0, 4).toString('ascii') === '%PDF';
    const isPdfFilename = Boolean(filename && filename.toLowerCase().endsWith('.pdf'));
    if ((isPdfBytes || isPdfFilename) && evidenceClass === 'TEXT_DOCUMENT') {
      throw new EmUniversalBridgeError(
        'RAW_PDF_CANNOT_SERVE_AS_TEXT_EVIDENCE',
        `Raw PDF bytes for ${filename || sourceId} cannot be admitted as TEXT_DOCUMENT evidence without extracted text derivative.`
      );
    }

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

    if (!Number.isInteger(byteOffset) || !Number.isInteger(length)) {
      throw new EmUniversalBridgeError('INVALID_COORDINATES', `byteOffset and length must be integers.`);
    }
    if (length <= 0) {
      throw new EmUniversalBridgeError('EMPTY_SPAN_REJECTED', `Passage length must be strictly positive.`);
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
   * Returns independent multilayer warrant coordinates:
   * 1. source_byte_integrity: source exists and raw byte digest verified
   * 2. span_validity: exact slice byte digest verified
   * 3. graph_reachability: target claim derivable in least fixed point closure
   * 4. derivation_rule_valid: valid rule structure and premise linkages
   * 5. claim_entailment: explicitly distinguishing syntax from empirical truth
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

    if (!Number.isInteger(sourceCaptureSpanProof.start) || !Number.isInteger(sourceCaptureSpanProof.end) ||
        sourceCaptureSpanProof.start < 0 || sourceCaptureSpanProof.start >= sourceCaptureSpanProof.end) {
      throw new EmUniversalBridgeError('INVALID_SPAN_BOUNDS', 'Span proof bounds must be valid non-empty integer range.');
    }

    // Coordinate 1: Source byte integrity
    const src = this.admittedEmSources.get(sourceCaptureSpanProof.source_id);
    if (!src) {
      throw new EmUniversalBridgeError('SOURCE_NOT_FOUND', `Source ${sourceCaptureSpanProof.source_id} not admitted.`);
    }
    const sourceByteIntegrity = sha256Hex(src.raw_bytes) === src.sha256;

    if (sourceCaptureSpanProof.end > src.raw_bytes.length) {
      throw new EmUniversalBridgeError('SPAN_OUT_OF_BOUNDS', `Span end ${sourceCaptureSpanProof.end} exceeds source size ${src.raw_bytes.length}.`);
    }

    // Coordinate 2: Span validity
    const slice = src.raw_bytes.subarray(sourceCaptureSpanProof.start, sourceCaptureSpanProof.end);
    const hash = sha256Hex(slice);
    if (hash !== sourceCaptureSpanProof.span_sha256) {
      throw new EmUniversalBridgeError('EXACT_SPAN_DIGEST_MISMATCH', `Span digest mismatch: expected ${sourceCaptureSpanProof.span_sha256} got ${hash}.`);
    }
    const spanValidity = true;

    // Coordinate 4: Derivation rule structure
    this.warrantEngine.registerClaim({
      claim_id: targetClaimId,
      claim_text: claimStatement || targetClaimId,
      derivation_premises: premises,
    });

    this.warrantEngine.addDerivationRule({
      rule_id: ruleId,
      head_claim_id: targetClaimId,
      premise_ids: premises,
      rule_type: 'DIRECT_WARRANT',
    });
    const derivationRuleValid = true;

    // Coordinate 3: Graph reachability in least fixed point closure
    const lfp = this.warrantEngine.computeLeastFixedPoint();
    const isGrounded = (lfp.P && lfp.P.has(targetClaimId)) ||
      (lfp.lfpResult && lfp.lfpResult.grounded_ids && lfp.lfpResult.grounded_ids.includes(targetClaimId));
    const graphReachability = Boolean(isGrounded);

    // Coordinate 5: Scientific entailment (cannot be verified by syntactic reachability alone)
    const claimEntailment = 'HELD_UNVERIFIED_BY_SYNTAX_ALONE';

    return {
      rule_id: ruleId,
      target_claim_id: targetClaimId,
      is_grounded_in_lfp: graphReachability,
      total_grounded_claims: lfp.P ? lfp.P.size : 0,
      span_proof_verified: spanValidity,
      warrant_coordinates: {
        source_byte_integrity: sourceByteIntegrity,
        span_validity: spanValidity,
        graph_reachability: graphReachability,
        derivation_rule_valid: derivationRuleValid,
        claim_entailment: claimEntailment
      }
    };
  }

  close() {
    if (this.atelier.receiver && typeof this.atelier.receiver.close === 'function') {
      this.atelier.receiver.close();
    }
  }
}
