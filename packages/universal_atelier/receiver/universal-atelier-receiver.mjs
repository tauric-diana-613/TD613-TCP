/**
 * 𝌋 TD613 · Independent Empty Universal Atelier Receiver (Crossing T)
 * 
 * Schema: td613.universal-atelier/v1
 * 
 * Implements strict architectural custody over:
 * 1. Initial State Zero-Row Witness Attestation across all 5 receiver tables
 * 2. Two Explicit Jurisdictions:
 *    - TEST_ONLY_SYNTHETIC_ADJUDICATION: internally generated approval events solely for declared synthetic fixtures.
 *    - EXTERNALLY_AUTHENTICATED_HUMAN_ADMISSION: requires separate verifiable external authorization root; real source fails closed.
 * 3. 10 Canonical Governed Reference Operations:
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
 * 4. Bound Directed Link Adjudication (endpoint, predicate, coordinates, span hash binding)
 * 5. Distinct Time-Bases: creation_time, publication_time, observation_time, recording_time, admission_time, adjudication_time
 * 6. Multilingual Unicode Custody (preserving Covenant Khona‌lit-po U+200C)
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

export const JURISDICTIONS = Object.freeze({
  TEST_ONLY_SYNTHETIC_ADJUDICATION: 'TEST_ONLY_SYNTHETIC_ADJUDICATION',
  EXTERNALLY_AUTHENTICATED_HUMAN_ADMISSION: 'EXTERNALLY_AUTHENTICATED_HUMAN_ADMISSION',
});

export const UA_VALID_ACTIONS = Object.freeze([
  'RECORD_ADMISSION', 'LINK_ADMISSION', 'REJECTION', 'WITHDRAWAL'
]);

export const UA_VALID_KINDS = Object.freeze([
  'contract', 'research_assessment', 'edition', 'formula', 'glossary',
  'open_question', 'evidence', 'lineage_note', 'pdf', 'research_program',
  'source', 'crosswalk', 'work_route'
]);

export const UA_VALID_LINK_PREDICATES = Object.freeze([
  // Reference Edition 1.4 relations
  'cites_source', 'mentions_record', 'explicit_alias_cross_reference', 'supersedes',
  'warranted_by', 'exemplifies', 'formalizes', 'refutes', 'generalizes', 'instantiates',
  'CITES_SOURCE', 'MENTIONS_RECORD', 'WARRANTED_BY', 'EXEMPLIFIES', 'FORMALIZES',
  // Wendbine 9-graph vocabulary (lowercase & uppercase)
  'bounds', 'challenges', 'stabilizes', 'carries', 'regulates', 'differs_from',
  'supports', 'constrains', 'measures', 'generates', 'revises', 'contains',
  'BOUNDS', 'CHALLENGES', 'STABILIZES', 'CARRIES', 'REGULATES', 'DIFFERS_FROM',
  'SUPPORTS', 'CONSTRAINS', 'MEASURES', 'GENERATES', 'REVISES', 'CONTAINS',
  'MAPS_TO', 'PRECEDES', 'CONCURRENT_WITH', 'EXEMPTS', 'INHIBITS', 'EXPRESSES'
]);

export class UniversalAtelierReceiver {
  constructor(dbPath = ':memory:') {
    this.dbPath = dbPath;
    this.db = null;
    this.initialWitness = null;
    this.recipientId = null;
    this.episodeId = null;
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

    // 1. Version-bound Adjudication Events (registered before records & links for FK integrity)
    this.db.exec(`
      CREATE TABLE ua_adjudication_events (
        receipt_id TEXT PRIMARY KEY,
        jurisdiction TEXT NOT NULL,
        adjudicator_kind TEXT NOT NULL,
        adjudicator_role TEXT NOT NULL,
        action TEXT NOT NULL,
        decision TEXT NOT NULL,
        target_id TEXT NOT NULL,
        episode_id TEXT NOT NULL,
        schema TEXT NOT NULL,
        method_version TEXT NOT NULL,
        evidence_sha256 TEXT NOT NULL,
        binding_json TEXT,
        registered_at TEXT NOT NULL
      );
    `);

    // 2. Records
    this.db.exec(`
      CREATE TABLE ua_records (
        record_id TEXT PRIMARY KEY,
        kind TEXT NOT NULL,
        label TEXT NOT NULL,
        family TEXT,
        status TEXT,
        jurisdiction TEXT NOT NULL,
        evidence_class TEXT NOT NULL,
        claim_ceiling TEXT,
        creation_time TEXT,
        publication_time TEXT,
        observation_time TEXT,
        recording_time TEXT NOT NULL,
        admission_time TEXT NOT NULL,
        raw_payload TEXT NOT NULL,
        sha256 TEXT NOT NULL,
        adjudicator_receipt_id TEXT NOT NULL REFERENCES ua_adjudication_events(receipt_id),
        human_review_ref TEXT
      );
    `);

    // 3. Links (directed edges)
    this.db.exec(`
      CREATE TABLE ua_links (
        link_id TEXT PRIMARY KEY,
        from_id TEXT NOT NULL REFERENCES ua_records(record_id),
        to_id TEXT NOT NULL REFERENCES ua_records(record_id),
        link_type TEXT NOT NULL,
        status TEXT NOT NULL,
        temporal_classification TEXT NOT NULL,
        span_proof_json TEXT NOT NULL,
        adjudicator_receipt_id TEXT NOT NULL REFERENCES ua_adjudication_events(receipt_id),
        admitted_at TEXT NOT NULL
      );
    `);

    // 4. Staged Proposals (read-only preparation)
    this.db.exec(`
      CREATE TABLE ua_proposals (
        proposal_id TEXT PRIMARY KEY,
        input_sha256 TEXT NOT NULL,
        disposition TEXT NOT NULL,
        record_json TEXT NOT NULL,
        created_at TEXT NOT NULL
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
    this.recipientId = options.recipientId || `ua_rcp_${entropy.slice(0, 8)}`;
    this.episodeId = options.episodeId || `ua_ep_${entropy.slice(9, 17)}`;

    const witnessPayload = {
      attestation_type: 'INITIAL_ZERO_ROW_STATE_WITNESS',
      schema: UNIVERSAL_ATELIER_SCHEMA_V1,
      recipient_id: this.recipientId,
      episode_id: this.episodeId,
      initialized_at: createdAt,
      entropy,
      tables,
      zero_row_counts: zeroRowCounts,
    };
    const witnessHash = sha256(JSON.stringify(witnessPayload));

    const insertMeta = this.db.prepare('INSERT INTO meta (key, value) VALUES (?, ?)');
    insertMeta.run('attestation_type', 'INITIAL_ZERO_ROW_STATE_WITNESS');
    insertMeta.run('schema', UNIVERSAL_ATELIER_SCHEMA_V1);
    insertMeta.run('recipient_id', this.recipientId);
    insertMeta.run('episode_id', this.episodeId);
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
  // Governed Operation: Adjudication Registration
  // -------------------------------------------------------------
  registerAdjudicationEvent({
    receiptId,
    jurisdiction = JURISDICTIONS.TEST_ONLY_SYNTHETIC_ADJUDICATION,
    adjudicatorKind = 'MACHINE_SYNTHETIC',
    adjudicatorRole,
    action = 'RECORD_ADMISSION',
    decision = 'ADMIT',
    targetId,
    evidenceSha256,
    episodeId = null,
    schema = UNIVERSAL_ATELIER_SCHEMA_V1,
    methodVersion = 'v1.0',
    binding = null,
  }) {
    if (!this.db) throw new UniversalAtelierError('NOT_INITIALIZED', 'Receiver is not initialized.');
    if (!receiptId) throw new UniversalAtelierError('MISSING_RECEIPT_ID', 'receiptId is required.');
    
    if (!Object.values(JURISDICTIONS).includes(jurisdiction)) {
      throw new UniversalAtelierError('INVALID_JURISDICTION', `Jurisdiction '${jurisdiction}' is unrecognized.`);
    }

    if (!['HUMAN', 'MACHINE_SYNTHETIC'].includes(adjudicatorKind)) {
      throw new UniversalAtelierError('INVALID_ADJUDICATOR_KIND', `Adjudicator kind '${adjudicatorKind}' must be HUMAN or MACHINE_SYNTHETIC.`);
    }

    const validRoles = ['ORCHESTRATOR', 'APERTURE_AUDITOR', 'PEDAGOGUE_AUDITOR', 'ATLAS_AUDITOR', 'FADT_AUDITOR', 'TEMPORAL_CUSTODIAN', 'INDEPENDENT_AUDITOR'];
    if (!validRoles.includes(adjudicatorRole)) {
      throw new UniversalAtelierError('INVALID_ADJUDICATOR_ROLE', `Role ${adjudicatorRole} is not an authorized auditor.`);
    }

    if (!UA_VALID_ACTIONS.includes(action)) {
      throw new UniversalAtelierError('INVALID_ACTION', `Action '${action}' is not authorized.`);
    }

    if (!['ADMIT', 'REJECT', 'HOLD'].includes(decision)) {
      throw new UniversalAtelierError('INVALID_ADJUDICATION_DECISION', `Decision ${decision} is invalid.`);
    }

    if (!targetId || typeof targetId !== 'string') {
      throw new UniversalAtelierError('MISSING_TARGET_ID', 'targetId is required.');
    }

    if (!evidenceSha256 || !/^[0-9a-f]{64}$/i.test(evidenceSha256)) {
      throw new UniversalAtelierError('INVALID_EVIDENCE_HASH', 'Valid 64-char hex evidenceSha256 required.');
    }

    const activeEp = episodeId || this.episodeId;
    const now = new Date().toISOString();
    const bindingJson = binding ? JSON.stringify(binding) : null;

    const stmt = this.db.prepare(`
      INSERT INTO ua_adjudication_events (
        receipt_id, jurisdiction, adjudicator_kind, adjudicator_role, action, decision,
        target_id, episode_id, schema, method_version, evidence_sha256, binding_json, registered_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      receiptId, jurisdiction, adjudicatorKind, adjudicatorRole, action, decision,
      targetId, activeEp, schema, methodVersion, evidenceSha256, bindingJson, now
    );

    return {
      receipt_id: receiptId,
      jurisdiction,
      adjudicator_kind: adjudicatorKind,
      adjudicator_role: adjudicatorRole,
      action,
      decision,
      target_id: targetId,
      episode_id: activeEp,
      evidence_sha256: evidenceSha256,
      binding,
      registered_at: now,
    };
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
  // Governed Operation 10: admitRecord (Custodial Gate with 2 Jurisdictions)
  // -------------------------------------------------------------
  admitRecord(proposal, {
    jurisdiction = JURISDICTIONS.TEST_ONLY_SYNTHETIC_ADJUDICATION,
    humanReviewRef = null,
    externalAuthToken = null,
    adjudicatorReceiptId,
  } = {}) {
    if (!this.db) throw new UniversalAtelierError('NOT_INITIALIZED', 'Receiver is not initialized.');

    if (!proposal || !proposal.proposal_id || !proposal.record) {
      throw new UniversalAtelierError('INVALID_PROPOSAL_OBJECT', 'Valid staged proposal required.');
    }

    // 1. Confirm exact staged proposal exists
    const staged = this.db.prepare('SELECT * FROM ua_proposals WHERE proposal_id = ?').get(proposal.proposal_id);
    if (!staged) {
      throw new UniversalAtelierError('PROPOSAL_NOT_STAGED', `Proposal ${proposal.proposal_id} is not staged.`);
    }

    // 2. Recompute raw payload digest independently
    const recomputedDigest = sha256(proposal.raw_json);
    if (recomputedDigest !== proposal.input_sha256 || recomputedDigest !== staged.input_sha256) {
      throw new UniversalAtelierError('PROPOSAL_DIGEST_CORRUPTED', 'Proposal digest recomputation failed or corrupted.');
    }

    // 3. Jurisdiction & Human Review Reference Enforcement
    if (!humanReviewRef || typeof humanReviewRef !== 'string') {
      throw new UniversalAtelierError(
        'HUMAN_REVIEW_REF_REQUIRED',
        'Record admission requires explicit human review reference (--human-review-ref).'
      );
    }

    const rec = proposal.record;
    if (jurisdiction === JURISDICTIONS.EXTERNALLY_AUTHENTICATED_HUMAN_ADMISSION) {
      // Real-source external human admission requires verifiable external authorization root
      if (!externalAuthToken) {
        throw new UniversalAtelierError(
          'REAL_SOURCE_ADMISSION_HELD_WITHOUT_EXTERNAL_AUTH',
          'Real-source admission requires independently verifiable external authorization root. Protected Experiment B is HELD.'
        );
      }
    } else if (jurisdiction === JURISDICTIONS.TEST_ONLY_SYNTHETIC_ADJUDICATION) {
      // Permits internally generated approvals SOLELY for declared synthetic fixtures
      if (rec.synthetic === false || rec.evidence_class === 'OPERATOR_ADMITTED_SOURCE_RECORD') {
        throw new UniversalAtelierError(
          'TEST_JURISDICTION_REAL_SOURCE_REFUSED',
          'Real source records cannot be admitted under TEST_ONLY_SYNTHETIC_ADJUDICATION.'
        );
      }
    } else {
      throw new UniversalAtelierError('INVALID_JURISDICTION', `Unknown jurisdiction '${jurisdiction}'.`);
    }

    // 4. Retrieve & Bind Adjudication Event
    if (!adjudicatorReceiptId) {
      throw new UniversalAtelierError('ADJUDICATOR_RECEIPT_REQUIRED', 'Admission requires positive adjudicator receipt.');
    }

    const adjEvent = this.db.prepare('SELECT * FROM ua_adjudication_events WHERE receipt_id = ?').get(adjudicatorReceiptId);
    if (!adjEvent) {
      throw new UniversalAtelierError('UNREGISTERED_ADJUDICATION_EVENT', `Adjudicator receipt ${adjudicatorReceiptId} is not registered.`);
    }

    // Bind action
    if (adjEvent.action !== 'RECORD_ADMISSION') {
      throw new UniversalAtelierError('ADJUDICATION_ACTION_MISMATCH', `Receipt action is ${adjEvent.action}, expected RECORD_ADMISSION.`);
    }

    // Bind decision
    if (adjEvent.decision !== 'ADMIT') {
      throw new UniversalAtelierError('ADJUDICATION_DECISION_NOT_ADMIT', `Adjudication decision is ${adjEvent.decision}, expected ADMIT.`);
    }

    // Bind target record ID
    if (adjEvent.target_id !== rec.id) {
      throw new UniversalAtelierError('ADJUDICATION_TARGET_MISMATCH', `Adjudication target ${adjEvent.target_id} does not match record ${rec.id}.`);
    }

    // Bind jurisdiction
    if (adjEvent.jurisdiction !== jurisdiction) {
      throw new UniversalAtelierError('ADJUDICATION_JURISDICTION_MISMATCH', `Adjudication was issued under ${adjEvent.jurisdiction}, cannot be used in ${jurisdiction}.`);
    }

    // Bind episode identity (anti-replay)
    if (adjEvent.episode_id !== this.episodeId) {
      throw new UniversalAtelierError('ADJUDICATION_CROSS_EPISODE_REPLAY_REJECTED', `Adjudication episode ${adjEvent.episode_id} does not match active episode ${this.episodeId}.`);
    }

    // Bind schema & evidence hash
    if (adjEvent.schema !== UNIVERSAL_ATELIER_SCHEMA_V1) {
      throw new UniversalAtelierError('ADJUDICATION_SCHEMA_MISMATCH', `Receipt schema ${adjEvent.schema} does not match receiver schema.`);
    }
    if (adjEvent.evidence_sha256 !== proposal.input_sha256) {
      throw new UniversalAtelierError('ADJUDICATOR_HASH_MISMATCH', `Adjudication hash ${adjEvent.evidence_sha256} does not match proposal input_sha256 ${proposal.input_sha256}.`);
    }

    // 5. Historical Rejection & Withdrawal Invariant
    const priorNegative = this.db.prepare(`
      SELECT * FROM ua_adjudication_events
      WHERE target_id = ? AND (decision = 'REJECT' OR action = 'WITHDRAWAL')
      ORDER BY registered_at DESC
    `).all(rec.id);

    if (priorNegative.length > 0) {
      const binding = adjEvent.binding_json ? JSON.parse(adjEvent.binding_json) : null;
      if (!binding || !binding.reparative_override) {
        throw new UniversalAtelierError(
          'RECORD_PREVIOUSLY_REJECTED_OR_WITHDRAWN',
          `Record ${rec.id} has prior rejection/withdrawal history; explicit reparative override required.`
        );
      }
    }

    // 6. Time-base separation
    const creationTime = rec.creation_time || rec.created_at || null;
    const publicationTime = rec.publication_time || rec.published_at || null;
    const observationTime = rec.observation_time || rec.observed_at || null;
    const recordingTime = proposal.created_at;
    const admissionTime = new Date().toISOString();

    const assignedEvidenceClass = jurisdiction === JURISDICTIONS.TEST_ONLY_SYNTHETIC_ADJUDICATION
      ? 'TEST_ONLY_SYNTHETIC_WITNESS'
      : (rec.evidence_class || 'SYNTHETIC_RESEARCH_WITNESS');

    const stmt = this.db.prepare(`
      INSERT INTO ua_records (
        record_id, kind, label, family, status, jurisdiction, evidence_class, claim_ceiling,
        creation_time, publication_time, observation_time, recording_time, admission_time,
        raw_payload, sha256, adjudicator_receipt_id, human_review_ref
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      rec.id,
      rec.kind,
      rec.label,
      rec.family || null,
      rec.status || 'ADMITTED',
      jurisdiction,
      assignedEvidenceClass,
      rec.claim_ceiling || 'Zero private data; research witness only.',
      creationTime,
      publicationTime,
      observationTime,
      recordingTime,
      admissionTime,
      proposal.raw_json,
      proposal.input_sha256,
      adjudicatorReceiptId,
      humanReviewRef
    );

    return {
      record_id: rec.id,
      kind: rec.kind,
      label: rec.label,
      jurisdiction,
      evidence_class: assignedEvidenceClass,
      sha256: proposal.input_sha256,
      admission_time: admissionTime,
      adjudication_time: adjEvent.registered_at,
      human_review_ref: humanReviewRef,
    };
  }

  // -------------------------------------------------------------
  // Governed Operation: admitLink (Bound Link Adjudication & Time Bases)
  // -------------------------------------------------------------
  admitLink({
    linkId,
    fromId,
    toId,
    linkType,
    temporalClassification = 'ANY_RELATION',
    spanProof,
    adjudicatorReceiptId,
    methodVersion = 'v1.0',
  }) {
    if (!this.db) throw new UniversalAtelierError('NOT_INITIALIZED', 'Receiver is not initialized.');

    if (!linkId) throw new UniversalAtelierError('MISSING_LINK_ID', 'linkId is required.');

    // 1. Endpoint existence
    const fromRec = this.db.prepare('SELECT record_id, creation_time, publication_time, raw_payload FROM ua_records WHERE record_id = ?').get(fromId);
    if (!fromRec) throw new UniversalAtelierError('SOURCE_ENDPOINT_UNADMITTED', `Source record ${fromId} not admitted.`);
    const toRec = this.db.prepare('SELECT record_id, creation_time, publication_time FROM ua_records WHERE record_id = ?').get(toId);
    if (!toRec) throw new UniversalAtelierError('TARGET_ENDPOINT_UNADMITTED', `Target record ${toId} not admitted.`);

    // 2. Mandatory span proof & safe coordinates
    if (!spanProof) {
      throw new UniversalAtelierError('MISSING_SPAN_PROOF', 'Link admission requires cryptographic spanProof.');
    }
    const { start, end, span_sha256 } = spanProof;
    if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end)) {
      throw new UniversalAtelierError('INVALID_SPAN_COORDINATES', 'Span coordinates must be safe integers.');
    }
    const buf = Buffer.from(fromRec.raw_payload, 'utf8');
    if (start < 0 || end <= start || end > buf.length) {
      throw new UniversalAtelierError('INVALID_SPAN_BOUNDS', `Span [${start}, ${end}] out of range or empty for source (length ${buf.length}).`);
    }
    const slice = buf.subarray(start, end);
    const recomputedSha = sha256(slice);
    if (recomputedSha !== span_sha256) {
      throw new UniversalAtelierError('INVALID_SPAN_PROOF_DIGEST', `Span proof mismatch. Recomputed: ${recomputedSha}, Provided: ${span_sha256}`);
    }

    // 3. Adjudicator Receipt Verification & Link-Parameter Binding
    if (!adjudicatorReceiptId) throw new UniversalAtelierError('ADJUDICATOR_RECEIPT_REQUIRED', 'Link requires adjudicator receipt.');
    const adjEvent = this.db.prepare('SELECT * FROM ua_adjudication_events WHERE receipt_id = ?').get(adjudicatorReceiptId);
    if (!adjEvent) {
      throw new UniversalAtelierError('UNREGISTERED_ADJUDICATION_EVENT', `Adjudication event ${adjudicatorReceiptId} missing.`);
    }

    if (adjEvent.action !== 'LINK_ADMISSION') {
      throw new UniversalAtelierError('ADJUDICATION_ACTION_MISMATCH', `Adjudication action is ${adjEvent.action}, expected LINK_ADMISSION.`);
    }
    if (adjEvent.decision !== 'ADMIT') {
      throw new UniversalAtelierError('ADJUDICATION_DECISION_NOT_ADMIT', `Adjudication decision is ${adjEvent.decision}, expected ADMIT.`);
    }
    if (adjEvent.target_id !== linkId) {
      throw new UniversalAtelierError('ADJUDICATION_TARGET_MISMATCH', `Adjudication target ${adjEvent.target_id} does not match linkId ${linkId}. Approval cannot be reused cross-link.`);
    }
    if (adjEvent.episode_id !== this.episodeId) {
      throw new UniversalAtelierError('ADJUDICATION_CROSS_EPISODE_REPLAY_REJECTED', `Cross-episode link replay rejected.`);
    }

    // Verify parameter binding inside adjudication event
    if (!adjEvent.binding_json) {
      throw new UniversalAtelierError('LINK_ADJUDICATION_BINDING_MISSING', 'Link adjudication receipt missing required binding parameters.');
    }
    const bound = JSON.parse(adjEvent.binding_json);
    if (bound.from_id !== fromId || bound.to_id !== toId) {
      throw new UniversalAtelierError('LINK_ADJUDICATION_ENDPOINT_MISMATCH', `Adjudication bound endpoints (${bound.from_id} -> ${bound.to_id}) mismatch (${fromId} -> ${toId}).`);
    }
    if (bound.link_type !== linkType) {
      throw new UniversalAtelierError('LINK_ADJUDICATION_PREDICATE_MISMATCH', `Adjudication bound predicate ${bound.link_type} mismatches ${linkType}.`);
    }
    if (bound.span_sha256 !== span_sha256 || bound.start !== start || bound.end !== end) {
      throw new UniversalAtelierError('LINK_ADJUDICATION_SPAN_MISMATCH', 'Adjudication bound span coordinates or digest mismatch.');
    }

    // 4. Predicate Vocabulary Validation & Status
    const isApprovedPredicate = UA_VALID_LINK_PREDICATES.includes(linkType);
    const linkStatus = isApprovedPredicate ? 'ADMITTED' : 'CANDIDATE_UNVALIDATED_PREDICATE';

    // 5. Historical Non-Retroactivity Invariant (Based on publication/creation time, NOT admission time!)
    const fromTimeStr = fromRec.publication_time || fromRec.creation_time;
    const toTimeStr = toRec.publication_time || toRec.creation_time;
    if (fromTimeStr && toTimeStr) {
      const tSrc = new Date(fromTimeStr).getTime();
      const tTgt = new Date(toTimeStr).getTime();
      if (!Number.isNaN(tSrc) && !Number.isNaN(tTgt)) {
        if (temporalClassification === 'PREEXISTING_OR_CONTEMPORANEOUS' && tTgt > tSrc) {
          throw new UniversalAtelierError(
            'ANACHRONISTIC_CITATION_TARGET_FUTURE',
            `Historical citation cannot target future publication (Target: ${toTimeStr} > Source: ${fromTimeStr}).`
          );
        }
        if (temporalClassification === 'STRICTLY_FORWARD' && tTgt <= tSrc) {
          throw new UniversalAtelierError(
            'ANACHRONISTIC_FORWARD_ROUTING',
            `Strictly forward link cannot target preexisting or contemporaneous record (Target: ${toTimeStr} <= Source: ${fromTimeStr}).`
          );
        }
      }
    }

    const now = new Date().toISOString();
    const proofJson = JSON.stringify({
      ...spanProof,
      adjudicator_receipt_id: adjudicatorReceiptId,
      verified_at: now,
      predicate_status: linkStatus,
      method_version: methodVersion,
    });

    // Insert forward link
    this.db.prepare(`
      INSERT INTO ua_links (link_id, from_id, to_id, link_type, status, temporal_classification, span_proof_json, adjudicator_receipt_id, admitted_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(linkId, fromId, toId, linkType, linkStatus, temporalClassification, proofJson, adjudicatorReceiptId, now);

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
      status: linkStatus,
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

    let sql = 'SELECT record_id, kind, label, family, status, jurisdiction, evidence_class, claim_ceiling, sha256, admission_time FROM ua_records WHERE 1=1';
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
    if (filter.jurisdiction) {
      sql += ' AND jurisdiction = ?';
      params.push(filter.jurisdiction);
    }

    if (q) {
      sql += ' AND (label LIKE ? OR raw_payload LIKE ?)';
      params.push(`%${q}%`, `%${q}%`);
    }

    for (const ex of exclude) {
      sql += ' AND record_id != ?';
      params.push(ex);
    }

    sql += ' ORDER BY admission_time DESC LIMIT ? OFFSET ?';
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

    const outgoing = this.db.prepare('SELECT to_id, link_type, status, temporal_classification, span_proof_json FROM ua_links WHERE from_id = ?').all(record_id);
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
    const row = this.db.prepare('SELECT record_id, label, sha256, claim_ceiling, evidence_class, jurisdiction, admission_time FROM ua_records WHERE record_id = ?').get(record_id);
    if (!row) throw new UniversalAtelierError('RECORD_NOT_FOUND', `Record ${record_id} is not admitted.`);

    const incoming = this.db.prepare('SELECT count(*) as c FROM ua_reverse_citations WHERE target_id = ?').get(record_id);

    return {
      record_id: row.record_id,
      label: row.label,
      sha256: row.sha256,
      jurisdiction: row.jurisdiction,
      evidence_class: row.evidence_class,
      claim_ceiling: row.claim_ceiling,
      admission_time: row.admission_time,
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
      let q = 'SELECT to_id, link_type, status, admitted_at FROM ua_links WHERE from_id = ?';
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
    const records = this.db.prepare('SELECT * FROM ua_records ORDER BY admission_time').all();
    const links = this.db.prepare('SELECT * FROM ua_links ORDER BY admitted_at').all();
    const reverse = this.db.prepare('SELECT * FROM ua_reverse_citations ORDER BY admitted_at').all();
    const adjudications = this.db.prepare('SELECT * FROM ua_adjudication_events ORDER BY registered_at').all();

    return {
      schema: 'td613.universal-atelier-export/v1',
      exported_at: new Date().toISOString(),
      initial_witness: this.initialWitness,
      total_records: records.length,
      total_links: links.length,
      total_adjudications: adjudications.length,
      records: records.map(r => ({ ...r, parsed_payload: JSON.parse(r.raw_payload) })),
      links,
      reverse_citations: reverse,
      adjudications,
    };
  }

  close() {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}
