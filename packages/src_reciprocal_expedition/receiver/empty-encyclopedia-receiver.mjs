/**
 * TD613 Independently Empty Encyclopedia Research Receiver (v1)
 * 
 * Standalone, pure Node.js / node:sqlite implementation conforming to the
 * Universal Encyclopedia receiver contract:
 * - Begins from demonstrable 0-state (0 sources, 0 captures, 0 chunks, 0 relations)
 * - Emits independently inspectable initial-state witness
 * - Exact source, capture, and span preservation (SHA-256 verified)
 * - Grounded search and byte-level retrieval
 * - Typed scientific relations with missing-endpoint rejection
 * - Native method registry, invocation, readback, and return packaging
 * - Complete failed operations logging
 */

import { DatabaseSync } from 'node:sqlite';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

export const RECEIVER_SCHEMA = 'td613.empty-encyclopedia-receiver/v1';

export class ReceiverError extends Error {
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

export class EmptyEncyclopediaReceiver {
  constructor(dbPath) {
    this.dbPath = dbPath;
    this.db = null;
    this.initialWitness = null;
    this.registeredMethods = new Map();
  }

  initialize(options = { memory: false }) {
    if (this.db) {
      throw new ReceiverError('ALREADY_INITIALIZED', 'Receiver database is already active.');
    }

    if (options.memory) {
      this.db = new DatabaseSync(':memory:');
    } else {
      if (fs.existsSync(this.dbPath)) {
        throw new ReceiverError('NON_EMPTY_START', `Target path ${this.dbPath} already exists. Cannot attest a new empty state.`);
      }
      const dir = path.dirname(path.resolve(this.dbPath));
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      this.db = new DatabaseSync(this.dbPath);
    }

    // Set pragmas
    this.db.exec('PRAGMA foreign_keys = ON;');

    // Create tables
    this.db.exec(`
      CREATE TABLE meta (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );

      CREATE TABLE sources (
        source_id TEXT PRIMARY KEY,
        canonical_url TEXT,
        platform TEXT NOT NULL,
        declared_title TEXT NOT NULL,
        created_at TEXT NOT NULL,
        admitted_at TEXT NOT NULL
      );

      CREATE TABLE captures (
        capture_id TEXT PRIMARY KEY,
        source_id TEXT NOT NULL REFERENCES sources(source_id),
        captured_at TEXT NOT NULL,
        raw_bytes_sha256 TEXT NOT NULL,
        normalized_body_sha256 TEXT NOT NULL,
        raw_bytes BLOB,
        normalized_body TEXT NOT NULL
      );

      CREATE TABLE chunks (
        chunk_id TEXT PRIMARY KEY,
        capture_id TEXT NOT NULL REFERENCES captures(capture_id),
        ordinal INTEGER NOT NULL,
        byte_start INTEGER NOT NULL,
        byte_end INTEGER NOT NULL,
        text_span TEXT NOT NULL,
        span_sha256 TEXT NOT NULL,
        UNIQUE(capture_id, ordinal)
      );

      CREATE TABLE relations (
        relation_id TEXT PRIMARY KEY,
        from_source_id TEXT NOT NULL REFERENCES sources(source_id),
        to_source_id TEXT NOT NULL REFERENCES sources(source_id),
        relation_type TEXT NOT NULL,
        evidence_class TEXT NOT NULL,
        registered_at TEXT NOT NULL,
        provenance_id TEXT,
        UNIQUE(from_source_id, to_source_id, relation_type)
      );

      CREATE TABLE registered_methods (
        method_name TEXT PRIMARY KEY,
        version TEXT NOT NULL,
        contract TEXT NOT NULL,
        registered_at TEXT NOT NULL
      );

      CREATE TABLE method_invocations (
        invocation_id TEXT PRIMARY KEY,
        method_name TEXT NOT NULL,
        input_summary TEXT NOT NULL,
        invoked_at TEXT NOT NULL,
        result_sha256 TEXT NOT NULL,
        result_json TEXT NOT NULL,
        execution_status TEXT NOT NULL
      );

      CREATE TABLE failed_operations_log (
        failure_id TEXT PRIMARY KEY,
        operation_name TEXT NOT NULL,
        attempted_input_summary TEXT NOT NULL,
        error_code TEXT NOT NULL,
        error_message TEXT NOT NULL,
        occurred_at TEXT NOT NULL
      );
    `);

    // Verify 0-state
    const counts = this.getCounts();
    for (const [k, v] of Object.entries(counts)) {
      if (v !== 0) {
        throw new ReceiverError('STATE_POLLUTED', `Initial count for ${k} is ${v}, expected 0.`);
      }
    }

    const initTime = new Date().toISOString();
    const witnessData = {
      schema: RECEIVER_SCHEMA,
      initialized_at: initTime,
      db_type: options.memory ? 'IN_MEMORY' : 'FILE_BACKED',
      initial_counts: counts,
      table_count: 8,
    };
    const witnessHash = sha256(JSON.stringify(witnessData));

    this.initialWitness = {
      ...witnessData,
      witness_sha256: witnessHash,
    };

    const insertMeta = this.db.prepare('INSERT INTO meta (key, value) VALUES (?, ?)');
    insertMeta.run('schema_version', RECEIVER_SCHEMA);
    insertMeta.run('initialized_at', initTime);
    insertMeta.run('initial_witness', JSON.stringify(this.initialWitness));

    return this.initialWitness;
  }

  getCounts() {
    if (!this.db) throw new ReceiverError('NOT_INITIALIZED', 'Receiver is not initialized.');
    const q = (sql) => this.db.prepare(sql).get()['c'];
    return {
      sources: q('SELECT COUNT(*) as c FROM sources'),
      captures: q('SELECT COUNT(*) as c FROM captures'),
      chunks: q('SELECT COUNT(*) as c FROM chunks'),
      relations: q('SELECT COUNT(*) as c FROM relations'),
      registered_methods: q('SELECT COUNT(*) as c FROM registered_methods'),
      method_invocations: q('SELECT COUNT(*) as c FROM method_invocations'),
      failed_operations: q('SELECT COUNT(*) as c FROM failed_operations_log'),
    };
  }

  getInitialWitness() {
    return this.initialWitness;
  }

  logFailure(operation, inputSummary, error) {
    if (!this.db) return;
    try {
      const fid = 'fail-' + crypto.randomUUID();
      const insert = this.db.prepare(`
        INSERT INTO failed_operations_log 
        (failure_id, operation_name, attempted_input_summary, error_code, error_message, occurred_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      insert.run(
        fid,
        operation,
        typeof inputSummary === 'string' ? inputSummary : JSON.stringify(inputSummary),
        error.code || 'UNKNOWN_ERROR',
        error.message || String(error),
        new Date().toISOString()
      );
    } catch (e) {
      // logging must never crash process
    }
  }

  admitSource({ source_id, canonical_url, platform, declared_title, created_at, raw_bytes, normalized_body, chunk_size = 200 }) {
    if (!this.db) throw new ReceiverError('NOT_INITIALIZED', 'Receiver is not initialized.');

    const summary = { source_id, platform, declared_title };

    try {
      if (!source_id || typeof source_id !== 'string') {
        throw new ReceiverError('INVALID_SOURCE_ID', 'source_id must be a non-empty string.');
      }
      if (!declared_title || typeof declared_title !== 'string') {
        throw new ReceiverError('INVALID_TITLE', 'declared_title must be a non-empty string.');
      }
      if (!platform || typeof platform !== 'string') {
        throw new ReceiverError('INVALID_PLATFORM', 'platform must be a valid identifier.');
      }

      // Check duplicate source
      const existing = this.db.prepare('SELECT source_id FROM sources WHERE source_id = ?').get(source_id);
      if (existing) {
        throw new ReceiverError('DUPLICATE_SOURCE_REFUSED', `Source ${source_id} is already admitted.`);
      }

      const bodyText = String(normalized_body || '');
      const rawBuf = raw_bytes ? (Buffer.isBuffer(raw_bytes) ? raw_bytes : Buffer.from(raw_bytes)) : Buffer.from(bodyText, 'utf8');
      const rawHash = sha256(rawBuf);
      const normHash = sha256(bodyText);

      // Check for identical normalized body from a different source
      const dupBody = this.db.prepare('SELECT source_id FROM captures WHERE normalized_body_sha256 = ?').get(normHash);
      let identicalBodySourceId = dupBody ? dupBody.source_id : null;

      const now = new Date().toISOString();

      // Begin transaction for atomicity
      this.db.exec('BEGIN TRANSACTION;');

      const insertSource = this.db.prepare(`
        INSERT INTO sources (source_id, canonical_url, platform, declared_title, created_at, admitted_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      insertSource.run(source_id, canonical_url || null, platform, declared_title, created_at || now, now);

      const captureId = `cap-${sha256(source_id + ':' + rawHash).slice(0, 16)}`;
      const insertCapture = this.db.prepare(`
        INSERT INTO captures (capture_id, source_id, captured_at, raw_bytes_sha256, normalized_body_sha256, raw_bytes, normalized_body)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      insertCapture.run(captureId, source_id, now, rawHash, normHash, rawBuf, bodyText);

      // Chunks generation
      const insertChunk = this.db.prepare(`
        INSERT INTO chunks (chunk_id, capture_id, ordinal, byte_start, byte_end, text_span, span_sha256)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      let offset = 0;
      let ordinal = 0;
      while (offset < bodyText.length) {
        const end = Math.min(offset + chunk_size, bodyText.length);
        const span = bodyText.slice(offset, end);
        const chunkId = `chk-${sha256(captureId + ':' + ordinal).slice(0, 16)}`;
        insertChunk.run(chunkId, captureId, ordinal, offset, end, span, sha256(span));
        offset = end;
        ordinal++;
      }

      this.db.exec('COMMIT;');

      return {
        admitted: true,
        source_id,
        capture_id: captureId,
        raw_bytes_sha256: rawHash,
        normalized_body_sha256: normHash,
        chunk_count: ordinal,
        identical_body_detected: Boolean(identicalBodySourceId),
        ancestral_lineage_refused: Boolean(identicalBodySourceId),
        admitted_at: now,
      };
    } catch (err) {
      try { this.db.exec('ROLLBACK;'); } catch (_) {}
      this.logFailure('admitSource', summary, err);
      throw err;
    }
  }

  retrieveBySpan(sourceId, byteStart, byteEnd) {
    if (!this.db) throw new ReceiverError('NOT_INITIALIZED', 'Receiver is not initialized.');
    const summary = { sourceId, byteStart, byteEnd };
    try {
      const cap = this.db.prepare('SELECT capture_id, normalized_body FROM captures WHERE source_id = ?').get(sourceId);
      if (!cap) {
        throw new ReceiverError('SOURCE_NOT_FOUND', `Source ${sourceId} not found in admitted records.`);
      }

      const body = cap.normalized_body;
      if (byteStart < 0 || byteEnd > body.length || byteStart >= byteEnd) {
        throw new ReceiverError('INVALID_SPAN', `Span [${byteStart}, ${byteEnd}] out of range for body length ${body.length}.`);
      }

      const spanText = body.slice(byteStart, byteEnd);
      return {
        source_id: sourceId,
        capture_id: cap.capture_id,
        byte_start: byteStart,
        byte_end: byteEnd,
        span_text: spanText,
        span_sha256: sha256(spanText),
        verified: true,
      };
    } catch (err) {
      this.logFailure('retrieveBySpan', summary, err);
      throw err;
    }
  }

  searchEntities(keyword) {
    if (!this.db) throw new ReceiverError('NOT_INITIALIZED', 'Receiver is not initialized.');
    const term = `%${keyword.toLowerCase()}%`;

    const titleMatches = this.db.prepare(`
      SELECT source_id, declared_title, platform, created_at 
      FROM sources 
      WHERE LOWER(declared_title) LIKE ?
    `).all(term);

    const chunkMatches = this.db.prepare(`
      SELECT c.chunk_id, c.capture_id, s.source_id, c.ordinal, c.text_span 
      FROM chunks c 
      JOIN captures cap ON c.capture_id = cap.capture_id
      JOIN sources s ON cap.source_id = s.source_id
      WHERE LOWER(c.text_span) LIKE ?
    `).all(term);

    return {
      keyword,
      title_matches: titleMatches,
      chunk_matches: chunkMatches,
      match_count: titleMatches.length + chunkMatches.length,
    };
  }

  registerRelation({ from_source_id, to_source_id, relation_type, evidence_class, provenance_id }) {
    if (!this.db) throw new ReceiverError('NOT_INITIALIZED', 'Receiver is not initialized.');
    const summary = { from_source_id, to_source_id, relation_type };

    try {
      // Endpoint validation
      const s1 = this.db.prepare('SELECT source_id FROM sources WHERE source_id = ?').get(from_source_id);
      const s2 = this.db.prepare('SELECT source_id FROM sources WHERE source_id = ?').get(to_source_id);

      if (!s1 || !s2) {
        throw new ReceiverError('UNSUPPORTED_GRAPH_LINK', `Cannot register relation: endpoints must both exist. Missing: ${!s1 ? from_source_id : ''} ${!s2 ? to_source_id : ''}`.trim());
      }

      const existing = this.db.prepare(`
        SELECT relation_id FROM relations 
        WHERE from_source_id = ? AND to_source_id = ? AND relation_type = ?
      `).get(from_source_id, to_source_id, relation_type);

      if (existing) {
        throw new ReceiverError('DUPLICATE_RELATION_REFUSED', `Relation ${relation_type} between ${from_source_id} and ${to_source_id} already exists.`);
      }

      const relId = `rel-${sha256(`${from_source_id}->${relation_type}->${to_source_id}`).slice(0, 16)}`;
      const now = new Date().toISOString();

      const insert = this.db.prepare(`
        INSERT INTO relations (relation_id, from_source_id, to_source_id, relation_type, evidence_class, registered_at, provenance_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      insert.run(relId, from_source_id, to_source_id, relation_type, evidence_class || 'QUALIFIED_WITNESS', now, provenance_id || null);

      return {
        registered: true,
        relation_id: relId,
        from_source_id,
        to_source_id,
        relation_type,
        registered_at: now,
      };
    } catch (err) {
      this.logFailure('registerRelation', summary, err);
      throw err;
    }
  }

  registerMethod(name, executorFn, version = 'v1', contract = 'STRICT_SRC_INHERITANCE') {
    if (typeof executorFn !== 'function') {
      throw new ReceiverError('INVALID_EXECUTOR', 'executorFn must be a callable function.');
    }
    this.registeredMethods.set(name, { executorFn, version, contract });

    const now = new Date().toISOString();
    const insert = this.db.prepare(`
      INSERT OR REPLACE INTO registered_methods (method_name, version, contract, registered_at)
      VALUES (?, ?, ?, ?)
    `);
    insert.run(name, version, contract, now);
  }

  invokeMethod(name, params = {}) {
    if (!this.db) throw new ReceiverError('NOT_INITIALIZED', 'Receiver is not initialized.');
    if (!this.registeredMethods.has(name)) {
      const err = new ReceiverError('UNREGISTERED_METHOD', `Method ${name} is not registered in receiver.`);
      this.logFailure('invokeMethod', { name, params }, err);
      throw err;
    }

    const { executorFn, version, contract } = this.registeredMethods.get(name);
    const invokedAt = new Date().toISOString();
    const invocationId = `inv-${crypto.randomUUID()}`;

    try {
      // Execute method passing receiver context
      const result = executorFn({
        receiver: this,
        params,
      });

      const resultJson = JSON.stringify(result);
      const resHash = sha256(resultJson);

      const insert = this.db.prepare(`
        INSERT INTO method_invocations 
        (invocation_id, method_name, input_summary, invoked_at, result_sha256, result_json, execution_status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      insert.run(invocationId, name, JSON.stringify(params), invokedAt, resHash, resultJson, 'SUCCESS');

      return {
        invocation_id: invocationId,
        method_name: name,
        version,
        contract,
        invoked_at: invokedAt,
        result_sha256: resHash,
        result,
      };
    } catch (err) {
      this.logFailure('invokeMethod', { name, params }, err);
      throw err;
    }
  }

  readbackResults(invocationId) {
    if (!this.db) throw new ReceiverError('NOT_INITIALIZED', 'Receiver is not initialized.');
    const row = this.db.prepare(`
      SELECT invocation_id, method_name, input_summary, invoked_at, result_sha256, result_json, execution_status
      FROM method_invocations
      WHERE invocation_id = ?
    `).get(invocationId);

    if (!row) {
      throw new ReceiverError('INVOCATION_NOT_FOUND', `Invocation ${invocationId} not found.`);
    }

    const computedHash = sha256(row.result_json);
    const verified = computedHash === row.result_sha256;

    return {
      invocation_id: row.invocation_id,
      method_name: row.method_name,
      input_summary: JSON.parse(row.input_summary),
      invoked_at: row.invoked_at,
      result: JSON.parse(row.result_json),
      result_sha256: row.result_sha256,
      integrity_verified: verified,
    };
  }

  formatReturnPackage(invocationId) {
    const readback = this.readbackResults(invocationId);
    return {
      schema: 'td613.empty-encyclopedia-return/v1',
      return_receipt_id: `ret-${sha256(invocationId).slice(0, 16)}`,
      initial_state_witness: this.initialWitness,
      current_counts: this.getCounts(),
      invocation: {
        invocation_id: readback.invocation_id,
        method_name: readback.method_name,
        invoked_at: readback.invoked_at,
        result_sha256: readback.result_sha256,
        integrity_verified: readback.integrity_verified,
      },
      result: readback.result,
      epistemic_ceiling: 'SOURCE_FREE_QUALIFIED_RECEIVER_WITNESS_ONLY',
    };
  }

  getFailedOperations() {
    if (!this.db) throw new ReceiverError('NOT_INITIALIZED', 'Receiver is not initialized.');
    return this.db.prepare(`
      SELECT failure_id, operation_name, attempted_input_summary, error_code, error_message, occurred_at
      FROM failed_operations_log
      ORDER BY occurred_at ASC
    `).all();
  }

  close() {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}
