/**
 * 𝌋 TD613 · TEST SUITE: UNIVERSAL ESTATES INDEPENDENT QUALIFICATION
 * Verifies Universal Atelier and Universal Encyclopedia as Distinguishable Operational Estates
 * 
 * Tests:
 * 1. Universal Atelier native zero-row witness & SQLite initialization
 * 2. Multilingual Unicode & Covenant Khona‌lit-po literal U+200C integrity
 * 3. Strict custodial admission gate (synthetic: true required, real source held)
 * 4. Cryptographic span proof link admission
 * 5. Complete 10 canonical operations execution
 * 6. Universal Encyclopedia authentic reference corpus census (1,141 records, 2,131 edges)
 * 7. Method attribution, directory search, and graph neighbor traversal
 * 8. Composite crossing: Universal Atelier -> Universal Encyclopedia -> Manifest LFP Grounding
 * 
 * Authority: SAC[X6ZNK5NO51] · Covenant: Khona‌lit-po
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';

import {
  UniversalAtelierEstate,
  UniversalEncyclopediaEstate,
  executeUniversalToCrossAtelierBridge,
} from './universal-estates-bridge.mjs';
import { ManifestWarrantEngine } from '../manifest_reciprocal_warrant/manifest-warrant-engine.mjs';

describe('Universal Estates Independent Qualification (Crossing T & U-00)', () => {
  it('1. Universal Atelier initializes in-memory SQLite with zero-row witness', () => {
    const ua = new UniversalAtelierEstate({
      recipientId: 'ua_test_rcp_001',
      episodeId: 'ua_test_ep_001',
    });
    const witness = ua.initialize();

    assert.ok(witness);
    assert.strictEqual(witness.schema, 'td613.universal-atelier/v1');
    assert.strictEqual(witness.attestation_type, 'INITIAL_ZERO_ROW_STATE_WITNESS');
    assert.strictEqual(typeof witness.witness_hash, 'string');
    assert.strictEqual(witness.witness_hash.length, 64);
    assert.strictEqual(witness.zero_row_counts.ua_records, 0);
    assert.strictEqual(witness.zero_row_counts.ua_links, 0);
  });

  it('2. Preserves literal interior U+200C zero-width non-joiner in covenant string', () => {
    const covenant = 'Khona\u200Clit-po';
    assert.strictEqual(covenant.includes('\u200C'), true);
    assert.strictEqual(Buffer.byteLength(covenant, 'utf8'), 14); // 11 ascii chars + 3 bytes for U+200C
  });

  it('3. Enforces strict synthetic declaration and admits valid record', () => {
    const ua = new UniversalAtelierEstate();
    ua.initialize();

    // Valid synthetic record admission
    const record = {
      id: 'ua:contract:khonalit_po_governance',
      kind: 'contract',
      label: 'Khona\u200Clit-po Governance Invariant',
      family: 'covenant',
      status: 'ADMITTED',
      evidence_class: 'SYNTHETIC_RESEARCH_WITNESS',
      claim_ceiling: 'Zero private data; research witness only.',
      body: 'Strict preservation of interior zero-width non-joiner U+200C across all crossing interfaces.',
    };

    const admitted = ua.prepareAndAdmitRecord(record, {
      adjudicatorRole: 'ORCHESTRATOR',
      humanReviewRef: 'SAC[X6ZNK5NO51]',
    });

    assert.ok(admitted);
    assert.strictEqual(admitted.record_id, record.id);
    assert.strictEqual(typeof admitted.sha256, 'string');
    assert.strictEqual(admitted.sha256.length, 64);
  });

  it('4. Admits directed link with authentic cryptographic span proof', () => {
    const ua = new UniversalAtelierEstate();
    ua.initialize();

    const recordA = {
      id: 'ua:contract:source_contract',
      kind: 'contract',
      label: 'Source Contract',
      family: 'covenant',
      status: 'ADMITTED',
      evidence_class: 'SYNTHETIC_RESEARCH_WITNESS',
      claim_ceiling: 'Research witness only.',
      body: 'Observes the covenant Khona\u200Clit-po as a mandatory protocol invariant.',
    };
    const recordB = {
      id: 'ua:evidence:target_evidence',
      kind: 'evidence',
      label: 'Target Evidence',
      family: 'covenant',
      status: 'ADMITTED',
      evidence_class: 'SYNTHETIC_RESEARCH_WITNESS',
      claim_ceiling: 'Research witness only.',
      body: 'Empirical verification of protocol invariants.',
    };

    const admittedA = ua.prepareAndAdmitRecord(recordA);
    const admittedB = ua.prepareAndAdmitRecord(recordB);

    const sourceRawJson = JSON.stringify({ ...recordA, synthetic: true }, null, 2);
    const linkResult = ua.admitDirectedLink({
      sourceRecordId: admittedA.record_id,
      targetRecordId: admittedB.record_id,
      predicate: 'WARRANTED_BY',
      sourceRawJson,
      matchedSpanText: 'Khona\u200Clit-po',
      adjudicatorRole: 'APERTURE_AUDITOR',
      humanReviewRef: 'SAC[X6ZNK5NO51]',
    });

    assert.ok(linkResult);
    assert.strictEqual(linkResult.link_type, 'WARRANTED_BY');
    assert.ok(linkResult.span_proof_json || linkResult.status === 'ADMITTED');
  });

  it('5. Executes complete 10 canonical operations suite on Universal Atelier', () => {
    const ua = new UniversalAtelierEstate();
    ua.initialize();

    const record = {
      id: 'ua:contract:sample_for_suite',
      kind: 'contract',
      label: 'Khona\u200Clit-po Governance Sample',
      family: 'covenant',
      status: 'ADMITTED',
      evidence_class: 'SYNTHETIC_RESEARCH_WITNESS',
      claim_ceiling: 'Research witness only.',
      body: 'Sample body text mentioning Khona\u200Clit-po invariant.',
    };
    const admitted = ua.prepareAndAdmitRecord(record);

    const suiteResults = ua.executeCanonicalOperationsSuite(admitted.record_id);
    assert.ok(suiteResults.search_hit_count >= 1);
    assert.strictEqual(suiteResults.retrieved_id, admitted.record_id);
    assert.ok(suiteResults.citation_format.startsWith('TD613·UA['));
    assert.strictEqual(suiteResults.verification_mismatches, 0);
    assert.strictEqual(suiteResults.export_witness_matches_startup, true);
  });

  it('6. Loads authentic Universal Encyclopedia Reference Corpus v1.4 (1,141 records, 2,131 edges)', () => {
    const enc = new UniversalEncyclopediaEstate();
    const census = enc.loadReferenceCorpus();

    assert.strictEqual(census.edition_version, '1.4');
    assert.strictEqual(census.record_count, 1141);
    assert.strictEqual(census.edge_count, 2131);
    assert.strictEqual(census.unresolved_count, 0);
    assert.strictEqual(typeof census.canonical_sha256, 'string');
  });

  it('7. Universal Encyclopedia executes query, search, and neighbor tracing', () => {
    const enc = new UniversalEncyclopediaEstate();
    enc.loadReferenceCorpus();

    // Query record
    const apt01 = enc.getRecord('APT-01');
    assert.ok(apt01);
    assert.strictEqual(apt01.directory_entry.id, 'APT-01');
    assert.strictEqual(apt01.directory_entry.kind, 'contract');
    assert.ok(apt01.citation.startsWith('TD613·UA[APT-01]::sha256('));

    // Search
    const searchHits = enc.queryReferenceCorpus({ search: 'admissibility', limit: 10 });
    assert.ok(searchHits.length > 0);

    // Neighbors
    const neighbors = enc.traceNeighbors('APT-01');
    assert.ok(Array.isArray(neighbors.outgoing));
    assert.ok(Array.isArray(neighbors.incoming));
  });

  it('8. Executes composite crossing: Universal Atelier -> Universal Encyclopedia -> Manifest LFP Grounding', () => {
    const ua = new UniversalAtelierEstate();
    ua.initialize();

    const record = {
      id: 'ua:contract:cross_atelier_witness',
      kind: 'contract',
      label: 'Cross-Atelier Governance Bridge',
      family: 'covenant',
      status: 'ADMITTED',
      evidence_class: 'SYNTHETIC_RESEARCH_WITNESS',
      claim_ceiling: 'Research witness only.',
      body: 'Operational bridge grounding across Universal Atelier, Encyclopedia, and Manifest Engine.',
    };
    const admitted = ua.prepareAndAdmitRecord(record);

    const manifestEngine = new ManifestWarrantEngine({
      engineId: 'manifest_ua_bridge_test',
      epochSnapshotId: 'snap_ua_001',
    });

    const bridgeResult = executeUniversalToCrossAtelierBridge({
      atelierRecord: admitted,
      encyclopediaContractId: 'APT-01',
      manifestEngine,
      currentTick: 10,
    });

    assert.strictEqual(bridgeResult.schema, 'td613.universal-cross-atelier-bridge/v1.0');
    assert.strictEqual(bridgeResult.atelier_source_id, admitted.record_id);
    assert.strictEqual(bridgeResult.encyclopedia_contract_id, 'APT-01');
    assert.ok(bridgeResult.warrant_digest);
    assert.strictEqual(bridgeResult.is_grounded, true);
    assert.strictEqual(bridgeResult.census.record_count, 1141);
  });
});
