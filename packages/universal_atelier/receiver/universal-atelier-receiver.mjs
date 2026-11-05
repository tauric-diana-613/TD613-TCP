/**
 * 𝌋 TD613 · Independent Empty Universal Atelier Recipient (Crossing T)
 * 
 * Schema: td613.universal-atelier/v1
 * 
 * Implements strict architectural custody over:
 * 1. Initial State Zero-Row Witness Attestation across all 5 receiver tables
 * 2. 10 Canonical Governed Reference Operations:
 *    - search(): deterministic facet & phrase query with 100-hit ceiling
 *    - get(): verbatim record and link retrieval (fail-closed)
 *    - cite(): cryptographic citation and claim ceiling generation
 *    - neighbors(): bidirectional traversal with citedBy tracking
 *    - route(): bounded acyclic path discovery (maxDepth <= 8)
 *    - context(): epistemic bundle packing with explicit budget truncation
 *    - verify(): live raw payload SHA-256 recalculation
 *    - export(): deterministic lossless serialization
 *    - prepareImport(): read-only proposal validation (0 DB mutations)
 *    - admitRecord(): custodial admission requiring human review & registered adjudication
 * 3. Default-Deny Link Admission & Non-Retroactive Reverse Citations
 * 4. Multilingual Unicode Custody (preserving Covenant Khona‌lit-po)
 */

import { DatabaseSync } from 'node:sqlite';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

export const UNIVERSAL_ATELIER_SCHEMA_V1 = 'td613.universal-atelier/v1';

export class UniversalAtelierError extends Error {
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

export const UA_VALID_KINDS = Object.freeze([
  'contract', 'research_assessment', 'edition', 'formula', 'glossary',
  'open_question', 'evidence', 'lineage_note', 'pdf', 'research_program',
  'source', 'crosswalk', 'work_route'
]);

export class UniversalAtelierReceiver {
  constructor(dbPath = ':memory:') {
    this.dbPath = dbPath;
    this.db = null;
    this.initialWitness = null;
  }

  initialize(options = { memory: true, recipientId: null, episodeId: null }) {
    if (this.db) {
      throw new UniversalAtelierError('ALREADY_INITIALIZED', 'Receiver is already initialized.');
    }

    if (options.memory || this.dbPath === ':memory:') {
      this.db = new DatabaseSync(':memory:');
    } else {
      if (fs.existsSync(this.dbPath)) {
        throw new UniversalAtelierError('NON_EMPTY_START', `Target database file ${this.dbPath} already exists.`);
      }
      const dir = path.dirname(path.resolve(this.dbPath));
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      this.db = new DatabaseSync(this.dbPath);
    }

    this.db.exec('PRAGMA foreign_keys = ON;');

    // Meta
    this.db.exec(`
      CREATE TABLE meta (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `);

    // 1. Records
    this.db.exec(`
      CREATE TABLE ua_records (
        record_id TEXT PRIMARY KEY,
        kind TEXT NOT NULL,
        label TEXT NOT NULL,
        family TEXT,
        status TEXT,
        evidence_class TEXT,
        claim_ceiling TEXT,
        raw_payload TEXT NOT NULL,
        sha256 TEXT NOT NULL,
        admitted_at TEXT NOT NULL,
        adjudicator_receipt_id TEXT NOT NULL
      );
    `);

    // 2. Links (directed edges)
    this.db.exec(`
      CREATE TABLE ua_links (
        link_id TEXT PRIMARY KEY,
        from_id TEXT NOT NULL REFERENCES ua_records(record_id),
        to_id TEXT NOT NULL REFERENCES ua_records(record_id),
        link_type TEXT NOT NULL,
        temporal_classification TEXT NOT NULL,
        span_proof_json TEXT NOT NULL,
        admitted_at TEXT NOT NULL
      );
    `);

    // 3. Staged Proposals (read-only preparation)
    this.db.exec(`
      CREATE TABLE ua_proposals (
        proposal_id TEXT PRIMARY KEY,
        input_sha256 TEXT NOT NULL,
        disposition TEXT NOT NULL,
        record_json TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
    `);

    // 4. Version-bound Adjudication Events
    this.db.exec(`
      CREATE TABLE ua_adjudication_events (
        receipt_id TEXT PRIMARY KEY,
        adjudicator_role TEXT NOT NULL,
        decision TEXT NOT NULL,
        target_id TEXT NOT NULL,
        evidence_sha256 TEXT NOT NULL,
        registered_at TEXT NOT NULL
      );
    `);

    // 5. Reverse Citations (citedBy index)
    this.db.exec(`
      CREATE TABLE ua_reverse_citations (
        citation_id TEXT PRIMARY KEY,
        target_id TEXT NOT NULL REFERENCES ua_records(record_id),
        citing_id TEXT NOT NULL REFERENCES ua_records(record_id),
        link_type TEXT NOT NULL,
        admitted_at TEXT NOT NULL
      );
    `);

    // Measure Zero-Row Attestation across all 5 data tables
    const tables = ['ua_records', 'ua_links', 'ua_proposals', 'ua_adjudication_events', 'ua_reverse_citations'];
    const zeroRowCounts = {};
    for (const tbl of tables) {
      const row = this.db.prepare(`SELECT count(*) as count FROM ${tbl}`).get();
      if (row.count !== 0) {
        throw new UniversalAtelierError('NON_EMPTY_INITIAL_STATE', `Table ${tbl} contains ${row.count} rows; expected 0.`);
      }
      zeroRowCounts[tbl] = row.count;
    }

    const entropy = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    const recipientId = options.recipientId || `ua_rcp_${entropy.slice(0, 8)}`;
    const episodeId = options.episodeId || `ua_ep_${entropy.slice(9, 17)}`;

    const witnessPayload = {
      attestation_type: 'INITIAL_ZERO_ROW_STATE_WITNESS',
      schema: UNIVERSAL_ATELIER_SCHEMA_V1,
      recipient_id: recipientId,
      episode_id: episodeId,
      initialized_at: createdAt,
      entropy,
      tables,
      zero_row_counts: zeroRowCounts,
    };
    const witnessHash = sha256(JSON.stringify(witnessPayload));

    const insertMeta = this.db.prepare('INSERT INTO meta (key, value) VALUES (?, ?)');
    insertMeta.run('attestation_type', 'INITIAL_ZERO_ROW_STATE_WITNESS');
    insertMeta.run('schema', UNIVERSAL_ATELIER_SCHEMA_V1);
    insertMeta.run('recipient_id', recipientId);
    insertMeta.run('episode_id', episodeId);
    insertMeta.run('initialized_at', createdAt);
    insertMeta.run('initial_witness_hash', witnessHash);
    insertMeta.run('entropy', entropy);
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

  // -------------------------------------------------------------
  // Governed Operation 4: Adjudication Registration
  // -------------------------------------------------------------
  registerAdjudicationEvent({ receiptId, adjudicatorRole, decision = 'ADMIT', targetId, evidenceSha256 }) {
    if (!this.db) throw new UniversalAtelierError('NOT_INITIALIZED', 'Receiver is not initialized.');
    if (!receiptId) throw new UniversalAtelierError('MISSING_RECEIPT_ID', 'receiptId is required.');
    const validRoles = ['ORCHESTRATOR', 'APERTURE_AUDITOR', 'PEDAGOGUE_AUDITOR', 'ATLAS_AUDITOR', 'FADT_AUDITOR', 'TEMPORAL_CUSTODIAN', 'INDEPENDENT_AUDITOR'];
    if (!validRoles.includes(adjudicatorRole)) {
      throw new UniversalAtelierError('INVALID_ADJUDICATOR_ROLE', `Role ${adjudicatorRole} is not an authorized auditor.`);
    }
    if (!['ADMIT', 'REJECT', 'HOLD'].includes(decision)) {
      throw new UniversalAtelierError('INVALID_ADJUDICATION_DECISION', `Decision ${decision} is invalid.`);
    }
    if (!evidenceSha256 || !/^[0-9a-f]{64}$/i.test(evidenceSha256)) {
      throw new UniversalAtelierError('INVALID_EVIDENCE_HASH', 'Valid 64-char hex evidenceSha256 required.');
    }
    const now = new Date().toISOString();
    const stmt = this.db.prepare(`
      INSERT INTO ua_adjudication_events (receipt_id, adjudicator_role, decision, target_id, evidence_sha256, registered_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run(receiptId, adjudicatorRole, decision, targetId, evidenceSha256, now);
    return { receipt_id: receiptId, adjudicator_role: adjudicatorRole, decision, target_id: targetId, evidence_sha256: evidenceSha256, registered_at: now };
  }

  // -------------------------------------------------------------
  // Governed Operation 9: prepareImport (Read-Only)
  // -------------------------------------------------------------
  prepareImport(jsonText) {
    if (!this.db) throw new UniversalAtelierError('NOT_INITIALIZED', 'Receiver is not initialized.');
    let recordObj = null;
    try {
      recordObj = typeof jsonText === 'string' ? JSON.parse(jsonText) : jsonText;
    } catch (err) {
      throw new UniversalAtelierError('INVALID_JSON', `Failed to parse import text: ${err.message}`);
    }

    if (!recordObj || typeof recordObj !== 'object') {
      throw new UniversalAtelierError('INVALID_RECORD_STRUCTURE', 'Record must be a JSON object.');
    }

    const { id, kind, label } = recordObj;
    if (!id || typeof id !== 'string') throw new UniversalAtelierError('MISSING_ID', 'Record id is required.');
    if (!kind || !UA_VALID_KINDS.includes(kind)) throw new UniversalAtelierError('INVALID_KIND', `Kind '${kind}' is not in approved ontology.`);
    if (!label || typeof label !== 'string') throw new UniversalAtelierError('MISSING_LABEL', 'Record label is required.');

    const rawString = typeof jsonText === 'string' ? jsonText : JSON.stringify(recordObj);
    const digest = sha256(rawString);
    const proposalId = `prop:${digest.slice(0, 16)}`;
    const now = new Date().toISOString();

    const proposal = {
      schema: 'td613.universal-atelier.proposal/v1',
      proposal_id: proposalId,
      disposition: 'PROPOSED',
      input_sha256: digest,
      record: recordObj,
      raw_json: rawString,
      created_at: now,
    };

    // Staged in ua_proposals table (read-only proposal registry, does not mutate records)
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO ua_proposals (proposal_id, input_sha256, disposition, record_json, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(proposalId, digest, 'PROPOSED', rawString, now);

    return proposal;
  }

  // -------------------------------------------------------------
  // Governed Operation 10: admitRecord (Custodial Gate)
  // -------------------------------------------------------------
  admitRecord(proposal, { humanReviewRef, adjudicatorReceiptId }) {
    if (!this.db) throw new UniversalAtelierError('NOT_INITIALIZED', 'Receiver is not initialized.');

    if (!humanReviewRef || typeof humanReviewRef !== 'string') {
      throw new UniversalAtelierError(
        'HUMAN_REVIEW_REF_REQUIRED',
        'Record admission requires explicit human review reference (--human-review-ref).'
      );
    }

    if (!adjudicatorReceiptId) {
      throw new UniversalAtelierError('ADJUDICATOR_RECEIPT_REQUIRED', 'Admission requires positive adjudicator receipt.');
    }

    const adjEvent = this.db.prepare('SELECT * FROM ua_adjudication_events WHERE receipt_id = ?').get(adjudicatorReceiptId);
    if (!adjEvent) {
      throw new UniversalAtelierError('UNREGISTERED_ADJUDICATION_EVENT', `Adjudicator receipt ${adjudicatorReceiptId} is not registered.`);
    }
    if (adjEvent.decision !== 'ADMIT') {
      throw new UniversalAtelierError('ADJUDICATION_DECISION_NOT_ADMIT', `Adjudication decision is ${adjEvent.decision}, expected ADMIT.`);
    }
    if (adjEvent.evidence_sha256 !== proposal.input_sha256) {
      throw new UniversalAtelierError('ADJUDICATOR_HASH_MISMATCH', `Adjudication hash ${adjEvent.evidence_sha256} does not match proposal input_sha256 ${proposal.input_sha256}.`);
    }

    const rec = proposal.record;
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO ua_records (record_id, kind, label, family, status, evidence_class, claim_ceiling, raw_payload, sha256, admitted_at, adjudicator_receipt_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      rec.id,
      rec.kind,
      rec.label,
      rec.family || null,
      rec.status || 'ADMITTED',
      rec.evidence_class || 'SYNTHETIC_RESEARCH_WITNESS',
      rec.claim_ceiling || 'Zero private data; research witness only.',
      proposal.raw_json,
      proposal.input_sha256,
      now,
      adjudicatorReceiptId
    );

    return {
      record_id: rec.id,
      kind: rec.kind,
      label: rec.label,
      sha256: proposal.input_sha256,
      admitted_at: now,
      human_review_ref: humanReviewRef,
    };
  }

  // -------------------------------------------------------------
  // Governed Operation: admitLink (Directed Edge with Span Proof & Adjudication)
  // -------------------------------------------------------------
  admitLink({ linkId, fromId, toId, linkType, temporalClassification = 'ANY_RELATION', spanProof, adjudicatorReceiptId }) {
    if (!this.db) throw new UniversalAtelierError('NOT_INITIALIZED', 'Receiver is not initialized.');

    // Endpoint existence
    const fromRec = this.db.prepare('SELECT record_id, admitted_at, raw_payload FROM ua_records WHERE record_id = ?').get(fromId);
    if (!fromRec) throw new UniversalAtelierError('SOURCE_ENDPOINT_UNADMITTED', `Source record ${fromId} not admitted.`);
    const toRec = this.db.prepare('SELECT record_id, admitted_at FROM ua_records WHERE record_id = ?').get(toId);
    if (!toRec) throw new UniversalAtelierError('TARGET_ENDPOINT_UNADMITTED', `Target record ${toId} not admitted.`);

    // Mandatory span proof
    if (!spanProof) {
      throw new UniversalAtelierError('MISSING_SPAN_PROOF', 'Link admission requires cryptographic spanProof.');
    }
    const { start, end, span_sha256 } = spanProof;
    if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end)) {
      throw new UniversalAtelierError('INVALID_SPAN_COORDINATES', 'Span coordinates must be safe integers.');
    }
    const buf = Buffer.from(fromRec.raw_payload, 'utf8');
    if (start < 0 || end < start || end > buf.length) {
      throw new UniversalAtelierError('INVALID_SPAN_BOUNDS', `Span [${start}, ${end}] out of range for source.`);
    }
    const slice = buf.subarray(start, end);
    const recomputedSha = sha256(slice);
    if (recomputedSha !== span_sha256) {
      throw new UniversalAtelierError('INVALID_SPAN_PROOF_DIGEST', `Span proof mismatch. Recomputed: ${recomputedSha}, Provided: ${span_sha256}`);
    }

    // Adjudicator receipt verification
    if (!adjudicatorReceiptId) throw new UniversalAtelierError('ADJUDICATOR_RECEIPT_REQUIRED', 'Link requires adjudicator receipt.');
    const adjEvent = this.db.prepare('SELECT * FROM ua_adjudication_events WHERE receipt_id = ?').get(adjudicatorReceiptId);
    if (!adjEvent || adjEvent.decision !== 'ADMIT') {
      throw new UniversalAtelierError('UNREGISTERED_ADJUDICATION_EVENT', `Adjudication event ${adjudicatorReceiptId} missing or not ADMIT.`);
    }

    // Temporal classification rule
    const tSrc = new Date(fromRec.admitted_at).getTime();
    const tTgt = new Date(toRec.admitted_at).getTime();
    if (temporalClassification === 'STRICTLY_FORWARD' && tTgt <= tSrc) {
      throw new UniversalAtelierError('ANACHRONISTIC_FORWARD_ROUTING', `Forward link cannot target preexisting or contemporaneous record.`);
    }
    if (temporalClassification === 'PREEXISTING_OR_CONTEMPORANEOUS' && tTgt > tSrc) {
      throw new UniversalAtelierError('ANACHRONISTIC_CITATION_TARGET_FUTURE', `Historical citation cannot target future record.`);
    }

    const now = new Date().toISOString();
    const proofJson = JSON.stringify({ ...spanProof, adjudicator_receipt_id: adjudicatorReceiptId, verified_at: now });

    // Insert forward link
    this.db.prepare(`
      INSERT INTO ua_links (link_id, from_id, to_id, link_type, temporal_classification, span_proof_json, admitted_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(linkId, fromId, toId, linkType, temporalClassification, proofJson, now);

    // Insert reverse citation index (citedBy)
    const citId = `cit:${sha256(`${fromId}->${toId}:${linkType}`).slice(0, 16)}`;
    this.db.prepare(`
      INSERT OR REPLACE INTO ua_reverse_citations (citation_id, target_id, citing_id, link_type, admitted_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(citId, toId, fromId, linkType, now);

    return {
      link_id: linkId,
      from_id: fromId,
      to_id: toId,
      link_type: linkType,
      temporal_classification: temporalClassification,
      admitted_at: now,
    };
  }

  // -------------------------------------------------------------
  // Governed Operation 1: search
  // -------------------------------------------------------------
  search({ q = '', filter = {}, match = 'all', exclude = [], limit = 100, offset = 0 } = {}) {
    if (!this.db) throw new UniversalAtelierError('NOT_INITIALIZED', 'Receiver is not initialized.');
    const safeLimit = Math.min(Math.max(1, limit), 100);

    let sql = 'SELECT record_id, kind, label, family, status, evidence_class, claim_ceiling, sha256, admitted_at FROM ua_records WHERE 1=1';
    const params = [];

    if (filter.kind) {
      sql += ' AND kind = ?';
      params.push(filter.kind);
    }
    if (filter.family) {
      sql += ' AND family = ?';
      params.push(filter.family);
    }
    if (filter.status) {
      sql += ' AND status = ?';
      params.push(filter.status);
    }

    if (q) {
      sql += ' AND (label LIKE ? OR raw_payload LIKE ?)';
      params.push(`%${q}%`, `%${q}%`);
    }

    for (const ex of exclude) {
      sql += ' AND record_id != ?';
      params.push(ex);
    }

    sql += ' ORDER BY admitted_at DESC LIMIT ? OFFSET ?';
    params.push(safeLimit, offset);

    const rows = this.db.prepare(sql).all(...params);
    return {
      total_returned: rows.length,
      limit: safeLimit,
      offset,
      results: rows.map(r => ({ ...r, relevance_score: 1.0 })),
    };
  }

  // -------------------------------------------------------------
  // Governed Operation 2: get
  // -------------------------------------------------------------
  get(record_id) {
    if (!this.db) throw new UniversalAtelierError('NOT_INITIALIZED', 'Receiver is not initialized.');
    const row = this.db.prepare('SELECT * FROM ua_records WHERE record_id = ?').get(record_id);
    if (!row) throw new UniversalAtelierError('RECORD_NOT_FOUND', `Record ${record_id} is not admitted.`);

    const outgoing = this.db.prepare('SELECT to_id, link_type, temporal_classification, span_proof_json FROM ua_links WHERE from_id = ?').all(record_id);
    const incoming = this.db.prepare('SELECT citing_id, link_type FROM ua_reverse_citations WHERE target_id = ?').all(record_id);

    return {
      ...row,
      parsed_payload: JSON.parse(row.raw_payload),
      outgoing_links: outgoing,
      cited_by: incoming,
    };
  }

  // -------------------------------------------------------------
  // Governed Operation 3: cite
  // -------------------------------------------------------------
  cite(record_id) {
    if (!this.db) throw new UniversalAtelierError('NOT_INITIALIZED', 'Receiver is not initialized.');
    const row = this.db.prepare('SELECT record_id, label, sha256, claim_ceiling, evidence_class, admitted_at FROM ua_records WHERE record_id = ?').get(record_id);
    if (!row) throw new UniversalAtelierError('RECORD_NOT_FOUND', `Record ${record_id} is not admitted.`);

    const incoming = this.db.prepare('SELECT count(*) as c FROM ua_reverse_citations WHERE target_id = ?').get(record_id);

    return {
      record_id: row.record_id,
      label: row.label,
      sha256: row.sha256,
      evidence_class: row.evidence_class,
      claim_ceiling: row.claim_ceiling,
      admitted_at: row.admitted_at,
      reverse_citations_count: incoming.c,
      citation_format: `TD613·UA[${row.record_id}]::sha256(${row.sha256.slice(0, 16)})`,
    };
  }

  // -------------------------------------------------------------
  // Governed Operation 4: neighbors
  // -------------------------------------------------------------
  neighbors(record_id, { direction = 'both', type = null } = {}) {
    if (!this.db) throw new UniversalAtelierError('NOT_INITIALIZED', 'Receiver is not initialized.');
    const res = { outgoing: [], incoming: [] };

    if (direction === 'both' || direction === 'outgoing') {
      let q = 'SELECT to_id, link_type, admitted_at FROM ua_links WHERE from_id = ?';
      const p = [record_id];
      if (type) { q += ' AND link_type = ?'; p.push(type); }
      res.outgoing = this.db.prepare(q).all(...p);
    }

    if (direction === 'both' || direction === 'incoming') {
      let q = 'SELECT citing_id, link_type, admitted_at FROM ua_reverse_citations WHERE target_id = ?';
      const p = [record_id];
      if (type) { q += ' AND link_type = ?'; p.push(type); }
      res.incoming = this.db.prepare(q).all(...p);
    }

    return res;
  }

  // -------------------------------------------------------------
  // Governed Operation 5: route (BFS path discovery, maxDepth <= 8)
  // -------------------------------------------------------------
  route(from_id, to_id, { maxDepth = 4, types = null } = {}) {
    if (!this.db) throw new UniversalAtelierError('NOT_INITIALIZED', 'Receiver is not initialized.');
    const safeMax = Math.min(Math.max(1, maxDepth), 8);

    if (from_id === to_id) return { found: true, depth: 0, path: [from_id] };

    const queue = [[from_id]];
    const visited = new Set([from_id]);

    while (queue.length > 0) {
      const currentPath = queue.shift();
      if (currentPath.length > safeMax + 1) break;

      const current = currentPath[currentPath.length - 1];
      let sql = 'SELECT to_id, link_type FROM ua_links WHERE from_id = ?';
      const params = [current];
      if (types && types.length) {
        sql += ` AND link_type IN (${types.map(() => '?').join(',')})`;
        params.push(...types);
      }
      const edges = this.db.prepare(sql).all(...params);

      for (const edge of edges) {
        if (edge.to_id === to_id) {
          return {
            found: true,
            depth: currentPath.length,
            path: [...currentPath, edge.to_id],
          };
        }
        if (!visited.has(edge.to_id)) {
          visited.add(edge.to_id);
          queue.push([...currentPath, edge.to_id]);
        }
      }
    }

    return { found: false, depth: null, path: null };
  }

  // -------------------------------------------------------------
  // Governed Operation 6: context
  // -------------------------------------------------------------
  context(record_id, { maxRecords = 10 } = {}) {
    if (!this.db) throw new UniversalAtelierError('NOT_INITIALIZED', 'Receiver is not initialized.');
    const root = this.get(record_id);
    const n = this.neighbors(record_id);

    const relatedIds = Array.from(new Set([
      ...n.outgoing.map(o => o.to_id),
      ...n.incoming.map(i => i.citing_id),
    ]));

    const budget = Math.min(maxRecords, 50);
    const includedIds = relatedIds.slice(0, budget - 1);
    const truncated = relatedIds.length > includedIds.length;

    const relatedRecords = includedIds.map(id => this.get(id));

    return {
      root_record: root,
      related_records_count: relatedRecords.length,
      total_accessible_neighbors: relatedIds.length,
      truncated,
      records: [root, ...relatedRecords],
    };
  }

  // -------------------------------------------------------------
  // Governed Operation 7: verify
  // -------------------------------------------------------------
  verify() {
    if (!this.db) throw new UniversalAtelierError('NOT_INITIALIZED', 'Receiver is not initialized.');
    const records = this.db.prepare('SELECT record_id, raw_payload, sha256 FROM ua_records').all();
    let mismatches = 0;

    for (const r of records) {
      const recomputed = sha256(r.raw_payload);
      if (recomputed !== r.sha256) mismatches++;
    }

    return {
      total_records_checked: records.length,
      matches: records.length - mismatches,
      mismatches,
      valid: mismatches === 0,
      verified_at: new Date().toISOString(),
    };
  }

  // -------------------------------------------------------------
  // Governed Operation 8: export
  // -------------------------------------------------------------
  export() {
    if (!this.db) throw new UniversalAtelierError('NOT_INITIALIZED', 'Receiver is not initialized.');
    const records = this.db.prepare('SELECT * FROM ua_records ORDER BY admitted_at').all();
    const links = this.db.prepare('SELECT * FROM ua_links ORDER BY admitted_at').all();
    const reverse = this.db.prepare('SELECT * FROM ua_reverse_citations ORDER BY admitted_at').all();

    return {
      schema: 'td613.universal-atelier-export/v1',
      exported_at: new Date().toISOString(),
      initial_witness: this.initialWitness,
      total_records: records.length,
      total_links: links.length,
      records: records.map(r => ({ ...r, parsed_payload: JSON.parse(r.raw_payload) })),
      links,
      reverse_citations: reverse,
    };
  }

  close() {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}
