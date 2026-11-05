/**
 * TD613 Independently Empty Encyclopedia Research Receiver (v3 - Fatal UTF-8 & Strict Coordinate Bounds)
 * 
 * Corrected, source-free implementation conforming to the Universal Encyclopedia receiver contract
 * with strict byte-level custody for multilingual, combining, and supplementary-plane Unicode text.
 * 
 * Version 3 Repairs (addressing Review Finding A-S2-F06):
 * 1. Fatal UTF-8 decoding: TextDecoder('utf-8', { fatal: true }) throws on malformed bytes;
 *    eliminates silent replacement-character corruption (\uFFFD).
 * 2. Explicit classification of arbitrary binary data as BYTE_EVIDENCE (is_byte_evidence=true).
 * 3. Enforces Number.isSafeInteger on all byte coordinates (rejects NaN, Infinity, fractional offsets).
 * 4. In translateCoordinates: strictly validates coordinate ranges against source buffer bounds
 *    (0 <= start <= end <= length) before asserting identity mapping.
 * 5. Strict code point boundary validation and roundtrip byte verification across all span operations.
 */

import { DatabaseSync } from 'node:sqlite';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

export const RECEIVER_SCHEMA_V3 = 'td613.empty-encyclopedia-receiver/v3';

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

/**
 * Checks if a byte in a UTF-8 sequence is a continuation byte (10xxxxxx)
 */
export function isUtf8ContinuationByte(byte) {
  return (byte & 0xC0) === 0x80;
}

/**
 * Validates that an offset into a Buffer is at a valid UTF-8 code point boundary.
 */
export function isCodepointBoundary(buf, offset) {
  if (offset < 0 || offset > buf.length) return false;
  if (offset === 0 || offset === buf.length) return true;
  return !isUtf8ContinuationByte(buf[offset]);
}

/**
 * Finds the nearest valid UTF-8 code point boundary at or after targetOffset.
 */
export function nextCodepointBoundary(buf, offset) {
  let pos = Math.max(0, Math.min(offset, buf.length));
  while (pos < buf.length && isUtf8ContinuationByte(buf[pos])) {
    pos++;
  }
  return pos;
}

/**
 * Computes a mapping between UTF-8 byte offsets and UTF-16 code unit offsets for a string.
 */
export function computeCoordinateIndex(str) {
  const buf = Buffer.from(str, 'utf8');
  const byteToChar = new Int32Array(buf.length + 1);
  const charToByte = new Int32Array(str.length + 1);

  let byteIdx = 0;
  let charIdx = 0;

  while (charIdx < str.length) {
    charToByte[charIdx] = byteIdx;
    const codePoint = str.codePointAt(charIdx);
    const codePointCharLength = codePoint > 0xFFFF ? 2 : 1;
    
    // Determine UTF-8 byte length for this code point
    let codePointByteLength = 1;
    if (codePoint > 0x7FF) {
      codePointByteLength = codePoint > 0xFFFF ? 4 : 3;
    } else if (codePoint > 0x7F) {
      codePointByteLength = 2;
    }

    for (let b = 0; b < codePointByteLength; b++) {
      byteToChar[byteIdx + b] = charIdx;
    }

    byteIdx += codePointByteLength;
    charIdx += codePointCharLength;
  }

  charToByte[str.length] = buf.length;
  byteToChar[buf.length] = str.length;

  return { buf, byteToChar, charToByte };
}

export class EmptyEncyclopediaReceiverV3 {
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

    this.db.exec('PRAGMA foreign_keys = ON;');

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
        evidence_class TEXT NOT NULL,
        raw_bytes_sha256 TEXT NOT NULL,
        raw_byte_length INTEGER NOT NULL,
        normalized_body_sha256 TEXT NOT NULL,
        normalized_byte_length INTEGER NOT NULL,
        normalization_form TEXT NOT NULL,
        coordinates_diverged INTEGER NOT NULL,
        raw_bytes BLOB NOT NULL,
        normalized_body TEXT
      );

      CREATE TABLE chunks (
        chunk_id TEXT PRIMARY KEY,
        capture_id TEXT NOT NULL REFERENCES captures(capture_id),
        ordinal INTEGER NOT NULL,
        byte_start INTEGER NOT NULL,
        byte_end INTEGER NOT NULL,
        byte_length INTEGER NOT NULL,
        code_unit_start INTEGER NOT NULL,
        code_unit_end INTEGER NOT NULL,
        text_span TEXT NOT NULL,
        span_bytes_sha256 TEXT NOT NULL,
        span_text_sha256 TEXT NOT NULL,
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
      schema: RECEIVER_SCHEMA_V3,
      initialized_at: initTime,
      db_type: options.memory ? 'IN_MEMORY' : 'FILE_BACKED',
      initial_counts: counts,
      table_count: 8,
      byte_custody: 'FATAL_UTF8_STRICT_COORDINATES_VERIFIED',
    };
    const witnessHash = sha256(JSON.stringify(witnessData));

    this.initialWitness = {
      ...witnessData,
      witness_sha256: witnessHash,
    };

    const insertMeta = this.db.prepare('INSERT INTO meta (key, value) VALUES (?, ?)');
    insertMeta.run('schema_version', RECEIVER_SCHEMA_V3);
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
    } catch (_) {}
  }

  /**
   * Admits a source with fatal UTF-8 byte boundary preservation and strict coordinate indexing.
   */
  admitSource({
    source_id,
    canonical_url,
    platform,
    declared_title,
    created_at,
    raw_bytes,
    normalized_body,
    normalization_form = 'NFC',
    chunk_byte_size = 200,
    is_byte_evidence = false,
  }) {
    if (!this.db) throw new ReceiverError('NOT_INITIALIZED', 'Receiver is not initialized.');

    const summary = { source_id, platform, declared_title, normalization_form, is_byte_evidence };

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

      // 1. Resolve raw bytes and verify fatal UTF-8 decoding
      let rawBuf;
      if (raw_bytes !== undefined && raw_bytes !== null) {
        rawBuf = Buffer.isBuffer(raw_bytes) ? raw_bytes : Buffer.from(raw_bytes);
      } else if (normalized_body !== undefined && normalized_body !== null) {
        rawBuf = Buffer.from(String(normalized_body), 'utf8');
      } else {
        rawBuf = Buffer.alloc(0);
      }

      const rawHash = sha256(rawBuf);

      // Strict fatal UTF-8 decoding (A-S2-F06 fix)
      let decodedRawText = '';
      let evidenceClass = 'TEXT_DOCUMENT';

      if (is_byte_evidence) {
        evidenceClass = 'BYTE_EVIDENCE';
        decodedRawText = null;
      } else {
        const decoder = new TextDecoder('utf-8', { fatal: true });
        try {
          decodedRawText = decoder.decode(rawBuf);
        } catch (decodeErr) {
          throw new ReceiverError(
            'MALFORMED_UTF8_SEQUENCE',
            `Source contains malformed UTF-8 byte sequences: ${decodeErr.message}. For arbitrary binary payloads, explicitly specify is_byte_evidence=true.`
          );
        }
      }

      // 2. Resolve normalized body
      let normForm = normalization_form || 'NONE';
      let normText;
      let normBuf;
      let normHash;
      let coordinatesDiverged = false;

      if (evidenceClass === 'BYTE_EVIDENCE') {
        normForm = 'NONE';
        normText = null;
        normBuf = Buffer.alloc(0);
        normHash = rawHash;
      } else {
        if (normalized_body !== undefined && normalized_body !== null) {
          normText = String(normalized_body);
        } else {
          normText = decodedRawText;
        }

        if (normForm === 'NFC') {
          normText = normText.normalize('NFC');
        } else if (normForm === 'NFD') {
          normText = normText.normalize('NFD');
        } else if (normForm === 'NFKC') {
          normText = normText.normalize('NFKC');
        } else if (normForm === 'NFKD') {
          normText = normText.normalize('NFKD');
        }

        normBuf = Buffer.from(normText, 'utf8');
        normHash = sha256(normBuf);
        coordinatesDiverged = !rawBuf.equals(normBuf);
      }

      // Check duplicate normalized body
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
        INSERT INTO captures (
          capture_id, source_id, captured_at, evidence_class, raw_bytes_sha256, raw_byte_length,
          normalized_body_sha256, normalized_byte_length, normalization_form,
          coordinates_diverged, raw_bytes, normalized_body
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      insertCapture.run(
        captureId,
        source_id,
        now,
        evidenceClass,
        rawHash,
        rawBuf.length,
        normHash,
        normBuf.length,
        normForm,
        coordinatesDiverged ? 1 : 0,
        rawBuf,
        normText
      );

      // 3. UTF-8 Byte-Aware Chunking on Normalized Body (Only for text documents)
      let chunkCount = 0;
      if (evidenceClass === 'TEXT_DOCUMENT' && normBuf.length > 0) {
        const insertChunk = this.db.prepare(`
          INSERT INTO chunks (
            chunk_id, capture_id, ordinal, byte_start, byte_end, byte_length,
            code_unit_start, code_unit_end, text_span, span_bytes_sha256, span_text_sha256
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const { byteToChar } = computeCoordinateIndex(normText);
        let byteOffset = 0;
        let ordinal = 0;

        while (byteOffset < normBuf.length) {
          let targetEnd = Math.min(byteOffset + chunk_byte_size, normBuf.length);
          let validEnd = nextCodepointBoundary(normBuf, targetEnd);

          if (validEnd > normBuf.length) {
            validEnd = normBuf.length;
          }
          if (validEnd <= byteOffset && byteOffset < normBuf.length) {
            validEnd = nextCodepointBoundary(normBuf, byteOffset + 1);
          }

          const spanBytes = normBuf.subarray(byteOffset, validEnd);
          const spanText = spanBytes.toString('utf8');

          const cuStart = byteToChar[byteOffset];
          const cuEnd = byteToChar[validEnd];

          const chunkId = `chk-${sha256(captureId + ':' + ordinal).slice(0, 16)}`;
          insertChunk.run(
            chunkId,
            captureId,
            ordinal,
            byteOffset,
            validEnd,
            spanBytes.length,
            cuStart,
            cuEnd,
            spanText,
            sha256(spanBytes),
            sha256(spanText)
          );

          byteOffset = validEnd;
          ordinal++;
        }
        chunkCount = ordinal;
      }

      this.db.exec('COMMIT;');

      return {
        admitted: true,
        source_id,
        capture_id: captureId,
        evidence_class: evidenceClass,
        raw_bytes_sha256: rawHash,
        raw_byte_length: rawBuf.length,
        normalized_body_sha256: normHash,
        normalized_byte_length: normBuf.length,
        coordinates_diverged: coordinatesDiverged,
        chunk_count: chunkCount,
        identical_body_detected: Boolean(identicalBodySourceId),
        identical_body_source_id: identicalBodySourceId,
        ancestral_lineage_refused: Boolean(identicalBodySourceId),
        admitted_at: now,
      };
    } catch (err) {
      if (this.db) {
        try { this.db.exec('ROLLBACK;'); } catch (_) {}
      }
      this.logFailure('admitSource', summary, err);
      throw err;
    }
  }

  /**
   * Retrieves a slice of source text strictly by byte offsets with code-point boundary enforcement
   * and roundtrip verification.
   */
  retrieveByByteSpan(sourceId, byteStart, byteEnd, target = 'raw') {
    if (!this.db) throw new ReceiverError('NOT_INITIALIZED', 'Receiver is not initialized.');

    const summary = { sourceId, byteStart, byteEnd, target };

    try {
      if (!Number.isSafeInteger(byteStart) || !Number.isSafeInteger(byteEnd)) {
        throw new ReceiverError(
          'INVALID_COORDINATES',
          `byteStart and byteEnd must be safe integers; received byteStart=${byteStart}, byteEnd=${byteEnd}.`
        );
      }

      const cap = this.db.prepare(`
        SELECT capture_id, raw_bytes, normalized_body, evidence_class
        FROM captures WHERE source_id = ?
      `).get(sourceId);

      if (!cap) {
        throw new ReceiverError('SOURCE_NOT_FOUND', `Source ${sourceId} not found.`);
      }

      let buf;
      if (target === 'raw') {
        buf = Buffer.isBuffer(cap.raw_bytes) ? cap.raw_bytes : Buffer.from(cap.raw_bytes);
      } else if (target === 'normalized') {
        if (!cap.normalized_body) {
          throw new ReceiverError('NO_NORMALIZED_BODY', `Source ${sourceId} has no normalized text (BYTE_EVIDENCE).`);
        }
        buf = Buffer.from(cap.normalized_body, 'utf8');
      } else {
        throw new ReceiverError('INVALID_TARGET', `Target buffer '${target}' must be 'raw' or 'normalized'.`);
      }

      if (byteStart < 0 || byteEnd > buf.length || byteStart >= byteEnd) {
        throw new ReceiverError('INVALID_SPAN', `Span [${byteStart}, ${byteEnd}] out of range for buffer length ${buf.length}.`);
      }

      // Strict UTF-8 code point boundary validation
      if (!isCodepointBoundary(buf, byteStart)) {
        throw new ReceiverError(
          'INVALID_CODEPOINT_BOUNDARY',
          `byteStart ${byteStart} lands inside a multi-byte UTF-8 sequence.`
        );
      }
      if (!isCodepointBoundary(buf, byteEnd)) {
        throw new ReceiverError(
          'INVALID_CODEPOINT_BOUNDARY',
          `byteEnd ${byteEnd} lands inside a multi-byte UTF-8 sequence.`
        );
      }

      const spanBytes = buf.subarray(byteStart, byteEnd);
      const spanText = spanBytes.toString('utf8');

      // Cryptographic verification that span re-encodes exactly to the extracted bytes
      const verifyBuf = Buffer.from(spanText, 'utf8');
      if (!spanBytes.equals(verifyBuf)) {
        throw new ReceiverError('SPAN_CORRUPTION', 'Decoded span text failed roundtrip byte verification.');
      }

      return {
        source_id: sourceId,
        capture_id: cap.capture_id,
        target_buffer: target,
        byte_start: byteStart,
        byte_end: byteEnd,
        byte_length: spanBytes.length,
        span_bytes_sha256: sha256(spanBytes),
        span_text: spanText,
        verified: true,
      };
    } catch (err) {
      this.logFailure('retrieveByByteSpan', summary, err);
      throw err;
    }
  }

  /**
   * Refuses unsupported coordinate translations when normalization has altered byte coordinates
   * or when coordinates are out of bounds or not safe integers.
   */
  translateCoordinates(sourceId, rawByteStart, rawByteEnd) {
    if (!this.db) throw new ReceiverError('NOT_INITIALIZED', 'Receiver is not initialized.');

    if (!Number.isSafeInteger(rawByteStart) || !Number.isSafeInteger(rawByteEnd)) {
      throw new ReceiverError(
        'INVALID_COORDINATES',
        `Coordinates must be safe integers; received rawByteStart=${rawByteStart}, rawByteEnd=${rawByteEnd}.`
      );
    }

    const cap = this.db.prepare(`
      SELECT capture_id, coordinates_diverged, raw_bytes, raw_byte_length, normalized_body
      FROM captures WHERE source_id = ?
    `).get(sourceId);

    if (!cap) {
      throw new ReceiverError('SOURCE_NOT_FOUND', `Source ${sourceId} not found.`);
    }

    if (rawByteStart < 0 || rawByteEnd > cap.raw_byte_length || rawByteStart > rawByteEnd) {
      throw new ReceiverError(
        'COORDINATES_OUT_OF_BOUNDS',
        `Coordinate range [${rawByteStart}, ${rawByteEnd}] out of bounds for buffer length ${cap.raw_byte_length}.`
      );
    }

    if (cap.coordinates_diverged) {
      throw new ReceiverError(
        'COORDINATE_TRANSLATION_UNSUPPORTED',
        `Source ${sourceId} has diverged raw vs normalized coordinates; direct offset mapping is unsupported without explicit alignment table.`
      );
    }

    return {
      source_id: sourceId,
      raw_span: [rawByteStart, rawByteEnd],
      normalized_span: [rawByteStart, rawByteEnd],
      identity_mapping: true,
    };
  }

  searchEntities(keyword) {
    if (!this.db) throw new ReceiverError('NOT_INITIALIZED', 'Receiver is not initialized.');
    const term = `%${keyword.toLowerCase()}%`;

    const titleMatches = this.db.prepare(`
      SELECT source_id, declared_title, platform, 'TITLE_MATCH' as match_type
      FROM sources
      WHERE LOWER(declared_title) LIKE ?
    `).all(term);

    const chunkMatches = this.db.prepare(`
      SELECT c.source_id, s.declared_title, ch.chunk_id, ch.byte_start, ch.byte_end, ch.byte_length, ch.text_span, 'SPAN_MATCH' as match_type
      FROM chunks ch
      JOIN captures c ON ch.capture_id = c.capture_id
      JOIN sources s ON c.source_id = s.source_id
      WHERE LOWER(ch.text_span) LIKE ?
    `).all(term);

    return {
      query: keyword,
      title_matches: titleMatches,
      span_matches: chunkMatches,
      total_matches: titleMatches.length + chunkMatches.length,
    };
  }

  registerRelation({ from_source_id, to_source_id, relation_type, evidence_class, provenance_id }) {
    if (!this.db) throw new ReceiverError('NOT_INITIALIZED', 'Receiver is not initialized.');

    const summary = { from_source_id, to_source_id, relation_type, evidence_class };

    try {
      if (!from_source_id || !to_source_id || !relation_type || !evidence_class) {
        throw new ReceiverError('INVALID_RELATION_INPUT', 'All relation parameters must be non-empty.');
      }

      // Endpoint verification
      const fromSrc = this.db.prepare('SELECT source_id FROM sources WHERE source_id = ?').get(from_source_id);
      if (!fromSrc) {
        throw new ReceiverError('FROM_SOURCE_NOT_FOUND', `Source ${from_source_id} does not exist in registry.`);
      }

      const toSrc = this.db.prepare('SELECT source_id FROM sources WHERE source_id = ?').get(to_source_id);
      if (!toSrc) {
        throw new ReceiverError('TO_SOURCE_NOT_FOUND', `Source ${to_source_id} does not exist in registry.`);
      }

      const relId = `rel-${sha256(`${from_source_id}:${to_source_id}:${relation_type}`).slice(0, 16)}`;
      const now = new Date().toISOString();

      const insert = this.db.prepare(`
        INSERT INTO relations (relation_id, from_source_id, to_source_id, relation_type, evidence_class, registered_at, provenance_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      try {
        insert.run(relId, from_source_id, to_source_id, relation_type, evidence_class, now, provenance_id || null);
      } catch (err) {
        if (err.message && err.message.includes('UNIQUE constraint failed')) {
          throw new ReceiverError('DUPLICATE_RELATION', `Relation ${from_source_id} -> ${to_source_id} [${relation_type}] already registered.`);
        }
        throw err;
      }

      return {
        relation_id: relId,
        from_source_id,
        to_source_id,
        relation_type,
        evidence_class,
        registered_at: now,
      };
    } catch (err) {
      this.logFailure('registerRelation', summary, err);
      throw err;
    }
  }

  close() {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}
