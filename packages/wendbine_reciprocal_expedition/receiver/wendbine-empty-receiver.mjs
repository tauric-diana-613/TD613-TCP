/**
 * 𝌋 TD613 · Wendbine Independent Empty Encyclopedia Recipient (Crossing W)
 * 
 * Schema: td613.wendbine-empty-receiver/v1
 * 
 * Implements strict architectural custody over:
 * 1. Initial State Zero-Row Witness Attestation
 * 2. Public Bounded Scope Enforcement (Refusal of selftext/body/source_body)
 * 3. 9-Graph Typed Relation Registry (Default-Deny for G_A .. G_X)
 * 4. Inverted Concept Declaration & Co-occurrence Overlay
 * 5. Fatal UTF-8 Decoding, Safe-Integer Coordinates, and Live Span SHA-256 Verification
 * 6. Multilingual Unicode Custody (Preserving Covenant Khona‌lit-po)
 */

import { DatabaseSync } from 'node:sqlite';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

export const WB_RECEIVER_SCHEMA_V1 = 'td613.wendbine-empty-receiver/v1';

export class WendbineReceiverError extends Error {
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

export function scanForForbiddenFields(obj) {
  if (!obj || typeof obj !== 'object') return;
  for (const [k, v] of Object.entries(obj)) {
    if (['selftext', 'body', 'source_body', 'full_text'].includes(k)) {
      throw new WendbineReceiverError(
        'WENDBINE_FULL_BODY_FIELD_REFUSED',
        `Forbidden full-body field '${k}' detected in raw_payload.`
      );
    }
    if (typeof v === 'string') {
      const trimmed = v.trim();
      if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
        let parsed = null;
        try {
          parsed = JSON.parse(trimmed);
        } catch {
          // not valid JSON, ignore
        }
        if (parsed && typeof parsed === 'object') {
          scanForForbiddenFields(parsed);
        }
      }
    } else if (typeof v === 'object') {
      scanForForbiddenFields(v);
    }
  }
}

export const WENDBINE_NINE_GRAPH_VOCABULARY = Object.freeze({
  G_A: Object.freeze([
    'BOUNDS', 'CAN_BECOME', 'CAN_CAUSE', 'CAN_CHANGE', 'CAN_DELAY',
    'CAN_PROPAGATE_THROUGH', 'DEPENDS_ON', 'DIFFERS_FROM', 'FAILURE_CAN_PROMOTE',
    'LIMITS', 'MULTIPLIES', 'MUST_REMAIN_DISTINCT_FROM', 'REDUCES', 'REQUIRES', 'REQUIRES_TYPED'
  ]),
  G_D: Object.freeze([
    'CAN_CHANGE_AS', 'CAN_CONVERGE_ON', 'CAN_CREATE', 'CAN_EXPLAIN', 'CAN_REACH',
    'CONNECTS_TO', 'CONTAINS', 'CONTAINS_OR_CALLS', 'DIFFERS_FROM', 'EXPANDS_INTO',
    'EXTENDS_THROUGH', 'REDUCES', 'SHAPES', 'SITS_WITHIN'
  ]),
  G_F: Object.freeze([
    'CAN_PROPAGATE_TRANSITIVELY_THROUGH', 'DIFFERS_FROM', 'PROPAGATES_ACROSS'
  ]),
  G_I: Object.freeze([
    'ALIGNS', 'ALIGNS_THROUGH', 'CAN_SUPPORT', 'EXPANDS', 'ORGANIZED_AS', 'SUPPORTS'
  ]),
  G_O: Object.freeze([
    'CAN_CAUSE', 'CAN_HIDE_BEHIND', 'CAN_YIELD', 'DIFFERS_FROM',
    'MUST_REMAIN_DISTINCT_FROM', 'PROJECTS_TO', 'REDUCES'
  ]),
  G_P: Object.freeze([
    'BOUNDS', 'CONSTRAINS', 'DIFFERS_FROM', 'DISAMBIGUATES', 'LEAVES',
    'MITIGATES', 'PRESERVES', 'PRESERVES_HISTORY_OF'
  ]),
  G_R: Object.freeze([
    'CAN_DEGRADE', 'CAN_SUPPORT', 'CONSTRAINS', 'CONTRIBUTES_TO', 'DIFFERS_FROM',
    'DOES_NOT_ESTABLISH', 'LIMITS', 'MUST_BE_PRESERVED_BY', 'OBSERVATIONALLY_CAN_RESEMBLE',
    'SHAPES', 'SUPPORTS'
  ]),
  G_T: Object.freeze([
    'CAN_CREATE', 'CAN_DIVERGE_TEMPORARILY_FROM', 'CAN_INITIATE', 'DECLARES_SECTION', 'DIFFERS_FROM'
  ]),
  G_X: Object.freeze([
    'CAN_AMPLIFY', 'CAN_PRODUCE', 'DECLARED_CORRIDOR_TO', 'DECLARED_LAYER_CHAIN_TO',
    'PARTICIPATES_IN', 'SOURCE_SYNTHESIS_LINKS_TO', 'TRACKS'
  ]),
});

export const WENDBINE_EVIDENCE_CLASSES = Object.freeze([
  'SOURCE_EXPLICIT_NEGATIVE_RELATION',
  'SOURCE_EXPLICIT_OR_DIRECT_PARAPHRASE',
  'SOURCE_EXPLICIT_PROGRAM',
  'SOURCE_EXPLICIT_SEQUENCE',
  'SOURCE_EXPLICIT_SYNTHESIS',
  'ARCHIVE_DERIVED_COOCCURRENCE_NOT_CAUSAL',
]);

export class WendbineEmptyEncyclopediaReceiver {
  constructor(dbPath = ':memory:') {
    this.dbPath = dbPath;
    this.db = null;
    this.initialWitness = null;
  }

  initialize(options = { memory: true, recipientId: null, episodeId: null }) {
    if (this.db) {
      throw new WendbineReceiverError('ALREADY_INITIALIZED', 'Receiver database is already initialized.');
    }

    if (options.memory || this.dbPath === ':memory:') {
      this.db = new DatabaseSync(':memory:');
    } else {
      if (fs.existsSync(this.dbPath)) {
        throw new WendbineReceiverError('NON_EMPTY_START', `Target database file ${this.dbPath} already exists.`);
      }
      const dir = path.dirname(path.resolve(this.dbPath));
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      this.db = new DatabaseSync(this.dbPath);
    }

    this.db.exec('PRAGMA foreign_keys = ON;');

    // 1. Meta
    this.db.exec(`
      CREATE TABLE meta (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `);

    // 2. Sources
    this.db.exec(`
      CREATE TABLE wb_sources (
        source_id TEXT PRIMARY KEY,
        canonical_url TEXT,
        public_date TEXT NOT NULL,
        time_precision TEXT NOT NULL,
        evidence_class TEXT NOT NULL,
        sha256 TEXT NOT NULL,
        byte_length INTEGER NOT NULL,
        admitted_at TEXT NOT NULL,
        raw_bytes BLOB NOT NULL
      );
    `);

    // 3. Concepts
    this.db.exec(`
      CREATE TABLE wb_concepts (
        concept_id TEXT PRIMARY KEY,
        label TEXT NOT NULL,
        registered_at TEXT NOT NULL
      );
    `);

    // 4. Concept Declarations (source -> concept)
    this.db.exec(`
      CREATE TABLE wb_concept_declarations (
        declaration_id TEXT PRIMARY KEY,
        source_id TEXT NOT NULL REFERENCES wb_sources(source_id),
        concept_id TEXT NOT NULL REFERENCES wb_concepts(concept_id),
        declared_at TEXT NOT NULL
      );
    `);

    // 5. 9-Graph Typed Relations
    this.db.exec(`
      CREATE TABLE wb_typed_relations (
        relation_id TEXT PRIMARY KEY,
        source_id TEXT NOT NULL REFERENCES wb_sources(source_id),
        graph_family TEXT NOT NULL,
        from_concept TEXT NOT NULL,
        relation_predicate TEXT NOT NULL,
        to_concept TEXT NOT NULL,
        evidence_class TEXT NOT NULL,
        adjudicator_receipt_id TEXT NOT NULL,
        span_proof_json TEXT NOT NULL,
        admitted_at TEXT NOT NULL
      );
    `);

    // 6. Co-occurrence Overlay
    this.db.exec(`
      CREATE TABLE wb_cooccurrences (
        cooccurrence_id TEXT PRIMARY KEY,
        concept_a TEXT NOT NULL,
        concept_b TEXT NOT NULL,
        weight INTEGER NOT NULL,
        source_ids_json TEXT NOT NULL,
        evidence_class TEXT NOT NULL,
        registered_at TEXT NOT NULL
      );
    `);

    // 7. Captures
    this.db.exec(`
      CREATE TABLE wb_captures (
        capture_id TEXT PRIMARY KEY,
        source_id TEXT NOT NULL REFERENCES wb_sources(source_id),
        manifestation_id TEXT NOT NULL,
        capture_timestamp TEXT NOT NULL,
        content_digest TEXT NOT NULL,
        registered_at TEXT NOT NULL
      );
    `);

    // 8. Version-bound Adjudication Events
    this.db.exec(`
      CREATE TABLE wb_adjudication_events (
        receipt_id TEXT PRIMARY KEY,
        adjudicator_role TEXT NOT NULL,
        decision TEXT NOT NULL,
        relation_id TEXT,
        span_sha256 TEXT NOT NULL,
        registered_at TEXT NOT NULL
      );
    `);

    // Zero-Row Attestation across all 7 data tables
    const tables = ['wb_sources', 'wb_concepts', 'wb_concept_declarations', 'wb_typed_relations', 'wb_cooccurrences', 'wb_captures', 'wb_adjudication_events'];
    const zeroRowCounts = {};
    for (const tbl of tables) {
      const row = this.db.prepare(`SELECT count(*) as count FROM ${tbl}`).get();
      if (row.count !== 0) {
        throw new WendbineReceiverError('NON_EMPTY_INITIAL_STATE', `Table ${tbl} contains ${row.count} rows; expected 0.`);
      }
      zeroRowCounts[tbl] = row.count;
    }

    const witnessEntropy = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    const recipientId = options.recipientId || `wb_rcp_${witnessEntropy.slice(0, 8)}`;
    const episodeId = options.episodeId || `wb_ep_${witnessEntropy.slice(9, 17)}`;

    const witnessPayload = {
      attestation_type: 'INITIAL_ZERO_ROW_STATE_WITNESS',
      schema: WB_RECEIVER_SCHEMA_V1,
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
    insertMeta.run('schema', WB_RECEIVER_SCHEMA_V1);
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
   * Admitting a post source with public bounded scope enforcement.
   * Strictly refuses forbidden full post body fields, including nested JSON payloads.
   */
  admitPostSource(postRecord) {
    if (!this.db) throw new WendbineReceiverError('NOT_INITIALIZED', 'Receiver is not initialized.');

    // 1. Forbidden Full-Body Field Refusal at top-level
    for (const field of ['selftext', 'body', 'source_body', 'full_text']) {
      if (Object.hasOwn(postRecord, field)) {
        throw new WendbineReceiverError(
          'WENDBINE_FULL_BODY_FIELD_REFUSED',
          `Post ${postRecord.source_id} contains forbidden full-body field '${field}'. Public bounded scope refuses body copies.`
        );
      }
    }

    const {
      source_id,
      canonical_url = null,
      public_date,
      time_precision = 'DAY',
      raw_payload = null,
      is_byte_evidence = false,
    } = postRecord;

    if (!source_id) {
      throw new WendbineReceiverError('MISSING_SOURCE_ID', 'Post record requires unique source_id.');
    }

    if (!public_date || !/^\d{4}-\d{2}-\d{2}$/.test(public_date)) {
      throw new WendbineReceiverError('INVALID_PUBLIC_DATE', `public_date must be YYYY-MM-DD. Received: ${public_date}`);
    }

    // 2. Strict Raw Payload Boundary Inspection & Schema Enforcement
    if (raw_payload !== null && raw_payload !== undefined) {
      let parsedPayload = null;
      if (typeof raw_payload === 'string') {
        try { parsedPayload = JSON.parse(raw_payload); } catch {}
      } else if (Buffer.isBuffer(raw_payload)) {
        try { parsedPayload = JSON.parse(raw_payload.toString('utf8')); } catch {}
      } else if (typeof raw_payload === 'object') {
        parsedPayload = raw_payload;
      }
      if (parsedPayload) {
        scanForForbiddenFields(parsedPayload);
        if (typeof parsedPayload === 'object' && !Array.isArray(parsedPayload)) {
          const allowedKeys = new Set([
            'source_id', 'canonical_url', 'public_date', 'time_precision',
            'declared_concepts', 'source_flags', 'title', 'evidence', 'concepts',
            'author', 'subreddit', 'technical_header', 'id', 'community'
          ]);
          for (const k of Object.keys(parsedPayload)) {
            if (!allowedKeys.has(k)) {
              throw new WendbineReceiverError(
                'WENDBINE_UNALLOWLISTED_PAYLOAD_FIELD',
                `Payload contains unallowlisted field '${k}'. Public bounded schema permits only declared metadata fields.`
              );
            }
          }
        }
      }
    }

    const payloadBytes = Buffer.isBuffer(raw_payload)
      ? raw_payload
      : Buffer.from(typeof raw_payload === 'string' ? raw_payload : JSON.stringify({ source_id, canonical_url, public_date }));

    let evidenceClass = 'TEXT_METADATA';
    if (is_byte_evidence) {
      evidenceClass = 'BYTE_EVIDENCE';
    } else {
      try {
        const fatalDecoder = new TextDecoder('utf-8', { fatal: true });
        fatalDecoder.decode(payloadBytes);
      } catch (err) {
        throw new WendbineReceiverError('MALFORMED_UTF8_SEQUENCE', `Source ${source_id} contains invalid UTF-8 bytes.`);
      }
    }

    const admittedAt = new Date().toISOString();
    const digest = sha256(payloadBytes);

    const stmt = this.db.prepare(`
      INSERT INTO wb_sources (source_id, canonical_url, public_date, time_precision, evidence_class, sha256, byte_length, admitted_at, raw_bytes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(source_id, canonical_url, public_date, time_precision, evidenceClass, digest, payloadBytes.length, admittedAt, payloadBytes);

    return {
      source_id,
      canonical_url,
      public_date,
      evidence_class: evidenceClass,
      sha256: digest,
      byte_length: payloadBytes.length,
      admitted_at: admittedAt,
    };
  }

  /**
   * Admitting a concept into the registry.
   */
  admitConcept(conceptId, label = null) {
    if (!this.db) throw new WendbineReceiverError('NOT_INITIALIZED', 'Receiver is not initialized.');
    const now = new Date().toISOString();
    const lbl = label || conceptId.replace(/^concept:/, '');

    const stmt = this.db.prepare(`
      INSERT OR IGNORE INTO wb_concepts (concept_id, label, registered_at)
      VALUES (?, ?, ?)
    `);
    stmt.run(conceptId, lbl, now);
    return { concept_id: conceptId, label: lbl, registered_at: now };
  }

  /**
   * Declaring a concept association with a source post.
   */
  declareConcept(sourceId, conceptId) {
    if (!this.db) throw new WendbineReceiverError('NOT_INITIALIZED', 'Receiver is not initialized.');

    const source = this.db.prepare('SELECT source_id FROM wb_sources WHERE source_id = ?').get(sourceId);
    if (!source) throw new WendbineReceiverError('SOURCE_NOT_FOUND', `Source ${sourceId} not admitted.`);

    this.admitConcept(conceptId);

    const decId = `dec:${sha256(`${sourceId}:${conceptId}`).slice(0, 16)}`;
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT OR IGNORE INTO wb_concept_declarations (declaration_id, source_id, concept_id, declared_at)
      VALUES (?, ?, ?, ?)
    `);
    stmt.run(decId, sourceId, conceptId, now);

    return { declaration_id: decId, source_id: sourceId, concept_id: conceptId, declared_at: now };
  }

  /**
   * Registers a version-bound positive or negative adjudication event.
   */
  registerAdjudicationEvent({ receiptId, adjudicatorRole, decision = 'ADMIT', relationId = null, spanSha256 }) {
    if (!this.db) throw new WendbineReceiverError('NOT_INITIALIZED', 'Receiver is not initialized.');
    if (!receiptId) throw new WendbineReceiverError('MISSING_RECEIPT_ID', 'receiptId is required.');
    const validRoles = ['ORCHESTRATOR', 'APERTURE_AUDITOR', 'PEDAGOGUE_AUDITOR', 'ATLAS_AUDITOR', 'FADT_AUDITOR', 'TEMPORAL_CUSTODIAN', 'INDEPENDENT_AUDITOR'];
    if (!validRoles.includes(adjudicatorRole)) {
      throw new WendbineReceiverError('INVALID_ADJUDICATOR_ROLE', `Role ${adjudicatorRole} is not an authorized auditor.`);
    }
    if (!['ADMIT', 'REJECT', 'HOLD'].includes(decision)) {
      throw new WendbineReceiverError('INVALID_ADJUDICATION_DECISION', `Decision ${decision} is invalid.`);
    }
    if (!spanSha256 || !/^[0-9a-f]{64}$/i.test(spanSha256)) {
      throw new WendbineReceiverError('INVALID_SPAN_HASH', 'Valid 64-char hex span_sha256 required.');
    }
    const now = new Date().toISOString();
    const stmt = this.db.prepare(`
      INSERT INTO wb_adjudication_events (receipt_id, adjudicator_role, decision, relation_id, span_sha256, registered_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run(receiptId, adjudicatorRole, decision, relationId, spanSha256, now);
    return { receipt_id: receiptId, adjudicator_role: adjudicatorRole, decision, relation_id: relationId, span_sha256: spanSha256, registered_at: now };
  }

  /**
   * Admitting a 9-Graph Typed Relation.
   * Enforces Default-Deny against WENDBINE_NINE_GRAPH_VOCABULARY,
   * mandatory cryptographic spanProof, declared concept endpoint verification,
   * and version-bound registered adjudication receipts.
   */
  admitTypedRelation({
    relationId,
    sourceId,
    graphFamily,
    fromConcept,
    relationPredicate,
    toConcept,
    evidenceClass,
    adjudicatorReceiptId,
    spanProof = null,
  }) {
    if (!this.db) throw new WendbineReceiverError('NOT_INITIALIZED', 'Receiver is not initialized.');

    // 1. Default-Deny Vocabulary Verification
    const familyVocab = WENDBINE_NINE_GRAPH_VOCABULARY[graphFamily];
    if (!familyVocab) {
      throw new WendbineReceiverError(
        'WENDBINE_UNSUPPORTED_GRAPH_FAMILY',
        `Graph family ${graphFamily} is unrecognized. Expected one of: ${Object.keys(WENDBINE_NINE_GRAPH_VOCABULARY).join(', ')}`
      );
    }

    if (!familyVocab.includes(relationPredicate)) {
      throw new WendbineReceiverError(
        'WENDBINE_UNSUPPORTED_GRAPH_RELATION',
        `Predicate ${relationPredicate} is not supported in graph family ${graphFamily}.`
      );
    }

    if (!WENDBINE_EVIDENCE_CLASSES.includes(evidenceClass)) {
      throw new WendbineReceiverError(
        'WENDBINE_UNSUPPORTED_EVIDENCE_CLASS',
        `Evidence class ${evidenceClass} is not recognized.`
      );
    }

    // 2. Mandatory Span Proof (eliminating default-allow fallback)
    if (!spanProof) {
      throw new WendbineReceiverError(
        'MISSING_SPAN_PROOF',
        'Typed relation admission strictly requires cryptographic spanProof; default-allow fallback is eliminated.'
      );
    }

    // 3. Source Endpoint Existence
    const source = this.db.prepare('SELECT source_id, byte_length, raw_bytes, public_date FROM wb_sources WHERE source_id = ?').get(sourceId);
    if (!source) {
      throw new WendbineReceiverError('SOURCE_ENDPOINT_UNADMITTED', `Source endpoint ${sourceId} is not admitted.`);
    }

    // 4. Verify Concept Endpoints Existence and Declaration for this Source
    const fromDec = this.db.prepare('SELECT declaration_id FROM wb_concept_declarations WHERE source_id = ? AND concept_id = ?').get(sourceId, fromConcept);
    if (!fromDec) {
      throw new WendbineReceiverError(
        'CONCEPT_NOT_DECLARED_FOR_SOURCE',
        `fromConcept '${fromConcept}' is not declared for source '${sourceId}'.`
      );
    }
    const toDec = this.db.prepare('SELECT declaration_id FROM wb_concept_declarations WHERE source_id = ? AND concept_id = ?').get(sourceId, toConcept);
    if (!toDec) {
      throw new WendbineReceiverError(
        'CONCEPT_NOT_DECLARED_FOR_SOURCE',
        `toConcept '${toConcept}' is not declared for source '${sourceId}'.`
      );
    }

    // 5. Live Cryptographic Span Verification
    const { start, end, span_sha256 } = spanProof;
    if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end)) {
      throw new WendbineReceiverError('INVALID_SPAN_COORDINATES', 'Span coordinates must be safe integers.');
    }
    if (start < 0 || end < start || end > source.byte_length) {
      throw new WendbineReceiverError('INVALID_SPAN_BOUNDS', `Span [${start}, ${end}] out of range for source.`);
    }
    const rawBuf = Buffer.from(source.raw_bytes);
    const slice = rawBuf.subarray(start, end);
    const recomputedSha = sha256(slice);
    if (recomputedSha !== span_sha256) {
      throw new WendbineReceiverError(
        'INVALID_SPAN_PROOF_DIGEST',
        `Cryptographic span proof mismatch. Recomputed: ${recomputedSha}, Provided: ${span_sha256}`
      );
    }

    // 6. Mandatory Version-Bound Adjudicator Receipt Verification
    if (!adjudicatorReceiptId) {
      throw new WendbineReceiverError('ADJUDICATOR_RECEIPT_REQUIRED', 'Relation requires positive adjudicator_receipt_id verification.');
    }
    const adjEvent = this.db.prepare('SELECT * FROM wb_adjudication_events WHERE receipt_id = ?').get(adjudicatorReceiptId);
    if (!adjEvent) {
      throw new WendbineReceiverError(
        'UNREGISTERED_ADJUDICATION_EVENT',
        `Adjudicator receipt ${adjudicatorReceiptId} is not registered in version-bound adjudication events.`
      );
    }
    if (adjEvent.decision !== 'ADMIT') {
      throw new WendbineReceiverError(
        'ADJUDICATION_DECISION_NOT_ADMIT',
        `Adjudication receipt ${adjudicatorReceiptId} has decision '${adjEvent.decision}', expected 'ADMIT'.`
      );
    }
    if (adjEvent.span_sha256 !== span_sha256) {
      throw new WendbineReceiverError(
        'ADJUDICATOR_SPAN_HASH_MISMATCH',
        `Adjudication event span hash ${adjEvent.span_sha256} does not match provided span proof hash ${span_sha256}.`
      );
    }
    if (adjEvent.relation_id && adjEvent.relation_id !== relationId) {
      throw new WendbineReceiverError(
        'ADJUDICATOR_RELATION_ID_MISMATCH',
        `Adjudication event relation_id ${adjEvent.relation_id} does not match relationId ${relationId}.`
      );
    }

    const admittedAt = new Date().toISOString();
    const proofJson = JSON.stringify({
      ...spanProof,
      adjudicator_receipt_id: adjudicatorReceiptId,
      adjudicator_role: adjEvent.adjudicator_role,
      verified_at: admittedAt,
      verified_by_receiver: true,
    });

    const stmt = this.db.prepare(`
      INSERT INTO wb_typed_relations (relation_id, source_id, graph_family, from_concept, relation_predicate, to_concept, evidence_class, adjudicator_receipt_id, span_proof_json, admitted_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(relationId, sourceId, graphFamily, fromConcept, relationPredicate, toConcept, evidenceClass, adjudicatorReceiptId, proofJson, admittedAt);

    return {
      relation_id: relationId,
      source_id: sourceId,
      graph_family: graphFamily,
      from_concept: fromConcept,
      relation_predicate: relationPredicate,
      to_concept: toConcept,
      evidence_class: evidenceClass,
      adjudicator_receipt_id: adjudicatorReceiptId,
      admitted_at: admittedAt,
    };
  }

  /**
   * Computes and records the concept co-occurrence overlay across admitted declarations.
   * Requires threshold >= minThreshold (default 2).
   */
  computeCooccurrenceOverlay(minThreshold = 2) {
    if (!this.db) throw new WendbineReceiverError('NOT_INITIALIZED', 'Receiver is not initialized.');

    const declarations = this.db.prepare(`
      SELECT source_id, concept_id FROM wb_concept_declarations ORDER BY source_id, concept_id
    `).all();

    const postConcepts = new Map();
    for (const d of declarations) {
      if (!postConcepts.has(d.source_id)) postConcepts.set(d.source_id, new Set());
      postConcepts.get(d.source_id).add(d.concept_id);
    }

    const pairSources = new Map();
    for (const [sId, concepts] of postConcepts.entries()) {
      const arr = Array.from(concepts).sort();
      for (let i = 0; i < arr.length; i++) {
        for (let j = i + 1; j < arr.length; j++) {
          const key = `${arr[i]}<->${arr[j]}`;
          if (!pairSources.has(key)) pairSources.set(key, new Set());
          pairSources.get(key).add(sId);
        }
      }
    }

    const now = new Date().toISOString();
    const insertStmt = this.db.prepare(`
      INSERT OR REPLACE INTO wb_cooccurrences (cooccurrence_id, concept_a, concept_b, weight, source_ids_json, evidence_class, registered_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const overlayResults = [];
    for (const [pairKey, sources] of pairSources.entries()) {
      if (sources.size >= minThreshold) {
        const [cA, cB] = pairKey.split('<->');
        const coId = `cooc:${sha256(pairKey).slice(0, 16)}`;
        const srcJson = JSON.stringify(Array.from(sources).sort());
        insertStmt.run(coId, cA, cB, sources.size, srcJson, 'ARCHIVE_DERIVED_COOCCURRENCE_NOT_CAUSAL', now);
        overlayResults.push({
          cooccurrence_id: coId,
          concept_a: cA,
          concept_b: cB,
          weight: sources.size,
          sources: Array.from(sources).sort(),
        });
      }
    }

    return overlayResults;
  }

  close() {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}
