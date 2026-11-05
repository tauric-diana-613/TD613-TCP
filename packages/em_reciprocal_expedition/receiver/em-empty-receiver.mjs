/**
 * TD613 Independent Empty Encyclopedia Recipient (Crossing E)
 * 
 * Brand-new, source-free recipient instance designed specifically for Crossing E (EMSTD613).
 * Schema: td613.em-empty-receiver/v1
 * 
 * Implements strict architectural custody over:
 * 1. Source vs. Derivative: Primary byte evidence remains immutable; derivatives are extracted views.
 * 2. Work Route vs. Manifestation: Conceptual identity units remain separate from physical artifacts;
 *    manifestation presence never silently resolves human gates or promotes claims.
 * 3. Contextual Role vs. Intrinsic Assertion: Roles are strictly compiler-pass relative;
 *    intrinsic role promotion is strictly prohibited.
 * 4. Byte-level Unicode & Binary Safety: Fatal UTF-8 decoding, safe-integer coordinates,
 *    and clean separation of text vs. raw byte evidence.
 */

import { DatabaseSync } from 'node:sqlite';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

export const EM_RECEIVER_SCHEMA_V1 = 'td613.em-empty-receiver/v1';

export const EM_WARRANT_CONTRACTS = {
  WARRANT_GROUNDED_SPAN_EVIDENCE: {
    contract_id: 'WARRANT_GROUNDED_SPAN_EVIDENCE/v1',
    allowed_relation_types: ['HISTORICAL_CITATION', 'EXPLORE_PROJECTIVE', 'GROUNDED_SPAN_CO_OCCURRENCE', 'CROSS_REFERENCE'],
    temporal_rule: 'ANY_RELATION',
  },
  WARRANT_HISTORICAL_CITATION: {
    contract_id: 'WARRANT_HISTORICAL_CITATION/v1',
    allowed_relation_types: ['HISTORICAL_CITATION', 'RETROSPECTIVE_REFERENCE'],
    temporal_rule: 'PREEXISTING_OR_CONTEMPORANEOUS',
  },
  WARRANT_EXACT_FORWARD_EXPLORE_CUE: {
    contract_id: 'WARRANT_EXACT_FORWARD_EXPLORE_CUE/v1',
    allowed_relation_types: ['EXPLORE_PROJECTIVE'],
    temporal_rule: 'STRICTLY_FORWARD',
  },
  WARRANT_CONTEMPORANEOUS_CROSS_REFERENCE: {
    contract_id: 'WARRANT_CONTEMPORANEOUS_CROSS_REFERENCE/v1',
    allowed_relation_types: ['CROSS_REFERENCE'],
    temporal_rule: 'ANY_RELATION',
  },
};

export class EmReceiverError extends Error {
  constructor(code, message, details = {}) {
    super(`[${code}] ${message}`);
    this.code = code;
    this.details = details;
  }
}

export function sha256(data) {
  const buf = Buffer.isBuffer(data) ? data : Buffer.from(String(data), 'utf8');
  return crypto.createHash('sha256').update(buf).digest('hex');
}

export function isUtf8ContinuationByte(byte) {
  return (byte & 0xC0) === 0x80;
}

export function isCodepointBoundary(buf, offset) {
  if (offset < 0 || offset > buf.length) return false;
  if (offset === 0 || offset === buf.length) return true;
  return !isUtf8ContinuationByte(buf[offset]);
}

export class EmEmptyEncyclopediaReceiver {
  constructor(dbPath) {
    this.dbPath = dbPath;
    this.db = null;
    this.initialWitness = null;
  }

  initialize(options = { memory: false }) {
    if (this.db) {
      throw new EmReceiverError('ALREADY_INITIALIZED', 'Receiver database is already active.');
    }

    if (options.memory) {
      this.db = new DatabaseSync(':memory:');
    } else {
      if (fs.existsSync(this.dbPath)) {
        throw new EmReceiverError('NON_EMPTY_START', `Target path ${this.dbPath} already exists. Cannot attest a new empty state.`);
      }
      const dir = path.dirname(path.resolve(this.dbPath));
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      this.db = new DatabaseSync(this.dbPath);
    }

    this.db.exec('PRAGMA foreign_keys = ON;');

    // 1. Core Metadata
    this.db.exec(`
      CREATE TABLE meta (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `);

    // 2. Primary Source Evidence (Sources are primary byte records)
    this.db.exec(`
      CREATE TABLE em_sources (
        source_id TEXT PRIMARY KEY,
        filename TEXT NOT NULL,
        relative_path TEXT NOT NULL,
        evidence_class TEXT NOT NULL,
        sha256 TEXT NOT NULL,
        byte_length INTEGER NOT NULL,
        admitted_at TEXT NOT NULL,
        created_at TEXT NOT NULL,
        raw_bytes BLOB NOT NULL
      );
    `);

    // 3. Extracted Derivatives (Derivatives are extracted representations; source bytes untouched)
    this.db.exec(`
      CREATE TABLE em_derivatives (
        derivative_id TEXT PRIMARY KEY,
        source_id TEXT NOT NULL REFERENCES em_sources(source_id),
        extraction_status TEXT NOT NULL,
        derivative_sha256 TEXT NOT NULL,
        extracted_text TEXT,
        created_at TEXT NOT NULL
      );
    `);

    // 4. Canonical Work Units (Work routes)
    this.db.exec(`
      CREATE TABLE em_work_routes (
        work_id TEXT PRIMARY KEY,
        declared_title TEXT NOT NULL,
        identity_status TEXT NOT NULL,
        human_gate_required INTEGER NOT NULL,
        minimum_independent_work_contribution INTEGER NOT NULL,
        maximum_independent_work_contribution INTEGER NOT NULL,
        adjudication_state TEXT NOT NULL
      );
    `);

    // 5. Work Manifestations (Physical artifacts linked to Work routes)
    this.db.exec(`
      CREATE TABLE em_manifestations (
        manifestation_id TEXT PRIMARY KEY,
        work_id TEXT NOT NULL REFERENCES em_work_routes(work_id),
        source_id TEXT NOT NULL REFERENCES em_sources(source_id),
        evidence_sha256 TEXT NOT NULL,
        registered_at TEXT NOT NULL
      );
    `);

    // 6. Contextual Roles (Compiler-relative roles; intrinsic promotion strictly forbidden)
    this.db.exec(`
      CREATE TABLE em_contextual_roles (
        assertion_id TEXT PRIMARY KEY,
        entity_id TEXT NOT NULL,
        compiler_pass TEXT NOT NULL,
        contextual_role TEXT NOT NULL,
        scope TEXT NOT NULL,
        intrinsic_role_promotion INTEGER NOT NULL DEFAULT 0,
        provenance TEXT NOT NULL,
        asserted_at TEXT NOT NULL
      );
    `);

    // 7. Grounded Relations with Cryptographic Span Proof
    this.db.exec(`
      CREATE TABLE em_admitted_relations (
        relation_id TEXT PRIMARY KEY,
        from_id TEXT NOT NULL,
        to_id TEXT NOT NULL,
        relation_type TEXT NOT NULL,
        temporal_classification TEXT NOT NULL,
        warrant_id TEXT NOT NULL,
        source_capture_span_proof TEXT NOT NULL,
        admitted_at TEXT NOT NULL
      );
    `);

    // 8. Version-bound Adjudication Events
    this.db.exec(`
      CREATE TABLE em_adjudication_events (
        receipt_id TEXT PRIMARY KEY,
        adjudicator_role TEXT NOT NULL,
        decision TEXT NOT NULL,
        relation_id TEXT,
        span_sha256 TEXT NOT NULL,
        registered_at TEXT NOT NULL
      );
    `);

    // Initialize Initial-State Zero-Row Witness (Review Finding E-04)
    const tables = ['em_sources', 'em_derivatives', 'em_work_routes', 'em_manifestations', 'em_contextual_roles', 'em_admitted_relations', 'em_adjudication_events'];
    const zeroRowCounts = {};
    for (const tbl of tables) {
      const row = this.db.prepare(`SELECT count(*) as count FROM ${tbl}`).get();
      if (row.count !== 0) {
        throw new EmReceiverError('NON_EMPTY_INITIAL_STATE', `Table ${tbl} contains ${row.count} rows; expected 0.`);
      }
      zeroRowCounts[tbl] = row.count;
    }

    const witnessEntropy = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    const recipientId = options.recipientId || `em_rcp_${witnessEntropy.slice(0, 8)}`;
    const episodeId = options.episodeId || `ep_${witnessEntropy.slice(9, 17)}`;

    const witnessPayload = {
      attestation_type: 'INITIAL_ZERO_ROW_STATE_WITNESS',
      schema: EM_RECEIVER_SCHEMA_V1,
      recipient_id: recipientId,
      episode_id: episodeId,
      initialized_at: createdAt,
      entropy: witnessEntropy,
      tables,
      zero_row_counts: zeroRowCounts,
    };
    const witnessHash = sha256(JSON.stringify(witnessPayload));

    const insertMeta = this.db.prepare('INSERT INTO meta (key, value) VALUES (?, ?)');
    insertMeta.run('attestation_type', 'INITIAL_ZERO_ROW_STATE_WITNESS');
    insertMeta.run('schema', EM_RECEIVER_SCHEMA_V1);
    insertMeta.run('recipient_id', recipientId);
    insertMeta.run('episode_id', episodeId);
    insertMeta.run('initialized_at', createdAt);
    insertMeta.run('initial_witness_hash', witnessHash);
    insertMeta.run('entropy', witnessEntropy);
    insertMeta.run('zero_row_counts', JSON.stringify(zeroRowCounts));

    this.initialWitness = {
      ...witnessPayload,
      witness_hash: witnessHash,
    };

    return this.initialWitness;
  }

  getInitialWitness() {
    return this.initialWitness;
  }

  /**
   * Admitting a primary source document with strict UTF-8 or explicit binary classification.
   */
  admitSource({ sourceId, filename, relativePath, rawBytes, isByteEvidence = false, createdAt = null }) {
    if (!this.db) throw new EmReceiverError('NOT_INITIALIZED', 'Receiver database is not initialized.');
    if (!Buffer.isBuffer(rawBytes)) {
      rawBytes = Buffer.from(rawBytes);
    }

    const byteLen = rawBytes.length;
    const byteDigest = sha256(rawBytes);
    let evidenceClass = 'TEXT_DOCUMENT';

    if (isByteEvidence) {
      evidenceClass = 'BYTE_EVIDENCE';
    } else {
      // Strictly fatal UTF-8 decoding
      try {
        const fatalDecoder = new TextDecoder('utf-8', { fatal: true });
        fatalDecoder.decode(rawBytes);
      } catch (err) {
        throw new EmReceiverError(
          'MALFORMED_UTF8_SEQUENCE',
          `Source ${sourceId} contains invalid UTF-8 bytes and was not declared as is_byte_evidence=true.`,
          { sourceId, error: err.message }
        );
      }
    }

    const admittedAt = new Date().toISOString();
    const sourceCreatedAt = createdAt || admittedAt;
    const stmt = this.db.prepare(`
      INSERT INTO em_sources (source_id, filename, relative_path, evidence_class, sha256, byte_length, admitted_at, created_at, raw_bytes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(sourceId, filename, relativePath, evidenceClass, byteDigest, byteLen, admittedAt, sourceCreatedAt, rawBytes);

    return {
      source_id: sourceId,
      evidence_class: evidenceClass,
      sha256: byteDigest,
      byte_length: byteLen,
      admitted_at: admittedAt,
      created_at: sourceCreatedAt,
    };
  }

  /**
   * Registering an extracted derivative.
   * Strict invariant: A derivative is derived from a source; raw source is untouched.
   */
  admitDerivative({ derivativeId, sourceId, extractionStatus, extractedText = null }) {
    if (!this.db) throw new EmReceiverError('NOT_INITIALIZED', 'Receiver database is not initialized.');

    // Verify parent source exists
    const source = this.db.prepare('SELECT source_id, evidence_class FROM em_sources WHERE source_id = ?').get(sourceId);
    if (!source) {
      throw new EmReceiverError('PARENT_SOURCE_NOT_FOUND', `Parent source ${sourceId} not found for derivative ${derivativeId}`);
    }

    const derivativeDigest = extractedText ? sha256(extractedText) : 'UNSUPPORTED_DERIVATIVE_FORMAT_NO_TEXT';
    const createdAt = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO em_derivatives (derivative_id, source_id, extraction_status, derivative_sha256, extracted_text, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run(derivativeId, sourceId, extractionStatus, derivativeDigest, extractedText, createdAt);

    return {
      derivative_id: derivativeId,
      source_id: sourceId,
      extraction_status: extractionStatus,
      derivative_sha256: derivativeDigest,
      created_at: createdAt,
    };
  }

  /**
   * Admitting a canonical Work Route.
   * Preserves singleton vs. same-work supported human gate required distinctions.
   */
  admitWorkRoute({ workId, declaredTitle, identityStatus, humanGateRequired = false, minContribution = 1, maxContribution = 1 }) {
    if (!this.db) throw new EmReceiverError('NOT_INITIALIZED', 'Receiver database is not initialized.');

    if (identityStatus !== 'SINGLETON_WORK_SURFACE' && identityStatus !== 'SAME_WORK_SUPPORTED') {
      throw new EmReceiverError('INVALID_WORK_IDENTITY_STATUS', `Unknown work identity status: ${identityStatus}`);
    }

    const stmt = this.db.prepare(`
      INSERT INTO em_work_routes (work_id, declared_title, identity_status, human_gate_required, minimum_independent_work_contribution, maximum_independent_work_contribution, adjudication_state)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      workId,
      declaredTitle,
      identityStatus,
      humanGateRequired ? 1 : 0,
      minContribution,
      maxContribution,
      humanGateRequired ? 'PENDING_HUMAN_CUSTODIAL_RESOLUTION' : 'ROBUST_SINGLETON'
    );

    return {
      work_id: workId,
      identity_status: identityStatus,
      human_gate_required: Boolean(humanGateRequired),
      contribution_bounds: [minContribution, maxContribution],
    };
  }

  /**
   * Linking a manifestation to a Work Route.
   * Strict invariant: Existential manifestation presence never copies claims to sibling manifestations.
   */
  linkManifestation({ manifestationId, workId, sourceId }) {
    if (!this.db) throw new EmReceiverError('NOT_INITIALIZED', 'Receiver database is not initialized.');

    const source = this.db.prepare('SELECT source_id, sha256 FROM em_sources WHERE source_id = ?').get(sourceId);
    if (!source) {
      throw new EmReceiverError('SOURCE_NOT_FOUND', `Source ${sourceId} not found.`);
    }

    const work = this.db.prepare('SELECT work_id FROM em_work_routes WHERE work_id = ?').get(workId);
    if (!work) {
      throw new EmReceiverError('WORK_NOT_FOUND', `Work route ${workId} not found.`);
    }

    const registeredAt = new Date().toISOString();
    const linkEvidence = sha256(`${workId}:${sourceId}:${source.sha256}`);

    const stmt = this.db.prepare(`
      INSERT INTO em_manifestations (manifestation_id, work_id, source_id, evidence_sha256, registered_at)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(manifestationId, workId, sourceId, linkEvidence, registeredAt);

    return {
      manifestation_id: manifestationId,
      work_id: workId,
      source_id: sourceId,
      link_evidence: linkEvidence,
      registered_at: registeredAt,
    };
  }

  /**
   * Asserting a Contextual Role.
   * Strict invariant: Contextual roles are relative to compiler_pass; intrinsic role promotion is forbidden.
   */
  assertContextualRole({ assertionId, entityId, compilerPass, contextualRole, scope = 'LOCAL', provenance = 'WITNESSED_PASS', intrinsicPromotion = false }) {
    if (!this.db) throw new EmReceiverError('NOT_INITIALIZED', 'Receiver database is not initialized.');

    if (intrinsicPromotion === true) {
      throw new EmReceiverError(
        'INTRINSIC_ROLE_PROMOTION_FORBIDDEN',
        `Entity ${entityId} cannot be promoted to an intrinsic role. Contextual roles must remain strictly compiler-relative.`
      );
    }

    const assertedAt = new Date().toISOString();
    const stmt = this.db.prepare(`
      INSERT INTO em_contextual_roles (assertion_id, entity_id, compiler_pass, contextual_role, scope, intrinsic_role_promotion, provenance, asserted_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(assertionId, entityId, compilerPass, contextualRole, scope, 0, provenance, assertedAt);

    return {
      assertion_id: assertionId,
      entity_id: entityId,
      compiler_pass: compilerPass,
      contextual_role: contextualRole,
      intrinsic_role_promotion: false,
    };
  }

  /**
   * Registers a version-bound positive or negative adjudication event.
   */
  registerAdjudicationEvent({ receiptId, adjudicatorRole, decision = 'ADMIT', relationId = null, spanSha256 }) {
    if (!this.db) throw new EmReceiverError('NOT_INITIALIZED', 'Receiver database is not initialized.');
    if (!receiptId) throw new EmReceiverError('MISSING_RECEIPT_ID', 'receiptId is required.');
    const validRoles = ['ORCHESTRATOR', 'APERTURE_AUDITOR', 'PEDAGOGUE_AUDITOR', 'ATLAS_AUDITOR', 'FADT_AUDITOR', 'TEMPORAL_CUSTODIAN', 'INDEPENDENT_AUDITOR'];
    if (!validRoles.includes(adjudicatorRole)) {
      throw new EmReceiverError('INVALID_ADJUDICATOR_ROLE', `Role ${adjudicatorRole} is not an authorized auditor.`);
    }
    if (!['ADMIT', 'REJECT', 'HOLD'].includes(decision)) {
      throw new EmReceiverError('INVALID_ADJUDICATION_DECISION', `Decision ${decision} is invalid.`);
    }
    if (!spanSha256 || !/^[0-9a-f]{64}$/i.test(spanSha256)) {
      throw new EmReceiverError('INVALID_SPAN_HASH', 'Valid 64-char hex span_sha256 required.');
    }
    const now = new Date().toISOString();
    const stmt = this.db.prepare(`
      INSERT INTO em_adjudication_events (receipt_id, adjudicator_role, decision, relation_id, span_sha256, registered_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run(receiptId, adjudicatorRole, decision, relationId, spanSha256, now);
    return { receipt_id: receiptId, adjudicator_role: adjudicatorRole, decision, relation_id: relationId, span_sha256: spanSha256, registered_at: now };
  }

  /**
   * Retrieving a byte span with strict safe-integer coordinate checks and fatal UTF-8 or raw Buffer return.
   */
  retrieveByteSpan(sourceId, start, end) {
    if (!this.db) throw new EmReceiverError('NOT_INITIALIZED', 'Receiver database is not initialized.');

    if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end)) {
      throw new EmReceiverError('INVALID_COORDINATES', `Coordinates must be safe integers. Received [${start}, ${end}].`);
    }

    if (start < 0 || end < start) {
      throw new EmReceiverError('INVALID_COORDINATES', `Invalid range [${start}, ${end}].`);
    }

    const row = this.db.prepare('SELECT source_id, raw_bytes, evidence_class, byte_length FROM em_sources WHERE source_id = ?').get(sourceId);
    if (!row) {
      throw new EmReceiverError('SOURCE_NOT_FOUND', `Source ${sourceId} not found.`);
    }

    const buf = Buffer.from(row.raw_bytes);
    if (end > buf.length) {
      throw new EmReceiverError('INVALID_SPAN', `Span [${start}, ${end}] exceeds buffer length ${buf.length}.`);
    }

    const slice = buf.subarray(start, end);

    if (row.evidence_class === 'BYTE_EVIDENCE') {
      return {
        source_id: sourceId,
        evidence_class: 'BYTE_EVIDENCE',
        start,
        end,
        byte_length: slice.length,
        span_bytes: slice,
        span_sha256: sha256(slice),
        span_text: null,
      };
    }

    // Text document: verify UTF-8 code point boundaries
    if (!isCodepointBoundary(buf, start) || !isCodepointBoundary(buf, end)) {
      throw new EmReceiverError('INVALID_CODEPOINT_BOUNDARY', `Span [${start}, ${end}] cuts inside a multi-byte UTF-8 code point.`);
    }

    const decoder = new TextDecoder('utf-8', { fatal: true });
    const text = decoder.decode(slice);

    return {
      source_id: sourceId,
      evidence_class: 'TEXT_DOCUMENT',
      start,
      end,
      byte_length: slice.length,
      span_bytes: slice,
      span_sha256: sha256(slice),
      span_text: text,
    };
  }

  /**
   * Admitting a Grounded Relation with cryptographic source span proof.
   * Enforces Review Finding E-02:
   * - Default-deny warrant registry lookup
   * - Endpoint existence verification
   * - Safe-integer coordinate bounds validation
   * - Live recomputation and verification of SHA-256 against raw source bytes
   * - Mandatory adjudicator receipt validation
   * - Relation-specific temporal constraints
   */
  admitRelation({
    relationId,
    fromId,
    toId,
    relationType,
    temporalClassification = 'ANY_RELATION',
    warrantId,
    sourceCaptureSpanProof,
    adjudicatorReceiptId = null,
  }) {
    if (!this.db) throw new EmReceiverError('NOT_INITIALIZED', 'Receiver database is not initialized.');

    // 1. DEFAULT-DENY Warrant Contract Check
    const contract = EM_WARRANT_CONTRACTS[warrantId];
    if (!contract) {
      throw new EmReceiverError(
        'UNRECOGNIZED_WARRANT_DENIED',
        `Warrant ${warrantId} is unrecognized or fabricated. Default-deny registry rejects this attempt.`
      );
    }

    if (!contract.allowed_relation_types.includes(relationType)) {
      throw new EmReceiverError(
        'WARRANT_RELATION_MISMATCH',
        `Warrant contract ${warrantId} does not permit relation type ${relationType}.`
      );
    }

    // 2. Endpoint Existence Checks
    const fromSource = this.db.prepare('SELECT source_id, evidence_class, byte_length, admitted_at, created_at, raw_bytes FROM em_sources WHERE source_id = ?').get(fromId);
    if (!fromSource) {
      throw new EmReceiverError('SOURCE_ENDPOINT_UNADMITTED', `Source endpoint ${fromId} is not admitted.`);
    }

    const toSource = this.db.prepare('SELECT source_id, evidence_class, byte_length, admitted_at, created_at FROM em_sources WHERE source_id = ?').get(toId);
    if (!toSource) {
      throw new EmReceiverError('TARGET_ENDPOINT_UNADMITTED', `Target endpoint ${toId} is not admitted.`);
    }

    // 3. Cryptographic Span Proof Structural Checks
    if (!sourceCaptureSpanProof) {
      throw new EmReceiverError('MISSING_SPAN_PROOF', 'Admitted relation requires cryptographic source_capture_span_proof.');
    }

    const { source_id, start, end, span_sha256 } = sourceCaptureSpanProof;
    if (!source_id || !Number.isSafeInteger(start) || !Number.isSafeInteger(end) || !span_sha256) {
      throw new EmReceiverError(
        'INVALID_SPAN_PROOF_STRUCTURE',
        'source_capture_span_proof must include safe integer coordinates [start, end] and span_sha256.'
      );
    }

    if (source_id !== fromId) {
      throw new EmReceiverError(
        'SPAN_PROOF_SOURCE_MISMATCH',
        `Span proof source_id (${source_id}) does not match fromId (${fromId}).`
      );
    }

    if (start < 0 || end < start || end > fromSource.byte_length) {
      throw new EmReceiverError(
        'INVALID_SPAN_BOUNDS',
        `Span bounds [${start}, ${end}] out of range for source of length ${fromSource.byte_length}.`
      );
    }

    // 4. Live Cryptographic Span Verification from Raw Bytes
    const rawBuf = Buffer.from(fromSource.raw_bytes);
    const slice = rawBuf.subarray(start, end);
    const recomputedSha = sha256(slice);

    if (recomputedSha !== span_sha256) {
      throw new EmReceiverError(
        'INVALID_SPAN_PROOF_DIGEST',
        `Cryptographic span proof digest mismatch. Recomputed: ${recomputedSha}, Provided: ${span_sha256}.`,
        { recomputed: recomputedSha, provided: span_sha256 }
      );
    }

    // 5. Version-Bound Adjudicator Receipt Verification
    const adjId = adjudicatorReceiptId || sourceCaptureSpanProof.adjudicator_receipt_id;
    if (!adjId) {
      throw new EmReceiverError(
        'ADJUDICATOR_RECEIPT_REQUIRED',
        'Admitted relation requires positive adjudicator_receipt_id verification.'
      );
    }
    const adjEvent = this.db.prepare('SELECT * FROM em_adjudication_events WHERE receipt_id = ?').get(adjId);
    if (!adjEvent) {
      throw new EmReceiverError(
        'UNREGISTERED_ADJUDICATION_EVENT',
        `Adjudicator receipt ${adjId} is not registered in version-bound adjudication events.`
      );
    }
    if (adjEvent.decision !== 'ADMIT') {
      throw new EmReceiverError(
        'ADJUDICATION_DECISION_NOT_ADMIT',
        `Adjudication receipt ${adjId} has decision '${adjEvent.decision}', expected 'ADMIT'.`
      );
    }
    if (adjEvent.span_sha256 !== span_sha256) {
      throw new EmReceiverError(
        'ADJUDICATOR_SPAN_HASH_MISMATCH',
        `Adjudication event span hash ${adjEvent.span_sha256} does not match provided span proof hash ${span_sha256}.`
      );
    }
    if (adjEvent.relation_id && adjEvent.relation_id !== relationId) {
      throw new EmReceiverError(
        'ADJUDICATOR_RELATION_ID_MISMATCH',
        `Adjudication event relation_id ${adjEvent.relation_id} does not match relationId ${relationId}.`
      );
    }

    // 6. Relation-Specific Temporal Evaluation
    const temporalRule = contract.temporal_rule || temporalClassification;
    const tSrc = new Date(fromSource.created_at || fromSource.admitted_at).getTime();
    const tTgt = new Date(toSource.created_at || toSource.admitted_at).getTime();

    if (!isNaN(tSrc) && !isNaN(tTgt)) {
      if (temporalRule === 'STRICTLY_FORWARD') {
        if (tTgt <= tSrc) {
          throw new EmReceiverError(
            'FORWARD_ROUTING_CANNOT_ROUTE_TO_PREEXISTING_TARGET',
            `Forward relation ${relationType} cannot target preexisting or contemporaneous source (target: ${toSource.created_at}, source: ${fromSource.created_at}).`
          );
        }
      } else if (temporalRule === 'PREEXISTING_OR_CONTEMPORANEOUS') {
        if (tTgt > tSrc) {
          throw new EmReceiverError(
            'ANACHRONISTIC_CITATION_TARGET_CREATED_AFTER_SOURCE',
            `Historical citation target ${toId} was created after citing source ${fromId}.`
          );
        }
      }
    }

    // 7. Insert Admitted Relation
    const admittedAt = new Date().toISOString();
    const proofJson = JSON.stringify({
      ...sourceCaptureSpanProof,
      adjudicator_receipt_id: adjId,
      verified_by_receiver: true,
      verified_at: admittedAt,
    });

    const stmt = this.db.prepare(`
      INSERT INTO em_admitted_relations (relation_id, from_id, to_id, relation_type, temporal_classification, warrant_id, source_capture_span_proof, admitted_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(relationId, fromId, toId, relationType, temporalClassification, warrantId, proofJson, admittedAt);

    return {
      relation_id: relationId,
      from_id: fromId,
      to_id: toId,
      relation_type: relationType,
      temporal_classification: temporalClassification,
      warrant_id: warrantId,
      adjudicator_receipt_id: adjId,
      source_capture_span_proof: sourceCaptureSpanProof,
      admitted_at: admittedAt,
    };
  }

  close() {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}
