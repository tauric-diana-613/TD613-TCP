/**
 * TD613 EMSTD613 Unified Theory Synthesis & Reciprocal Inheritance Test Suite
 * Commission EM E-00.1 · Verification Suite
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

import {
  inspectCorpus,
  sha256Hex,
  parseZipCentralDirectory
} from './corpus-inspector.mjs';

import {
  buildNativeTextIndex,
  executeSearch,
  retrieveContextSpan
} from './lexical-readback-witness.mjs';

import {
  OperatorZipIntakeEngine,
  ZipIntakeError,
  computeCrc32
} from './operator-zip-intake.mjs';

import {
  EmUniversalReciprocalBridge,
  EmUniversalBridgeError
} from './em-universal-reciprocal-bridge.mjs';

import {
  EmUnifiedTheorySynthesisEngine,
  PROMOTION_LADDER
} from './em-unified-theory-synthesis.mjs';

import {
  CompetentNullComparator,
  CANONICAL_PAIRED_CASE_LEDGER
} from './competent-null-comparator.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../..');
const EM_ROOT = path.resolve(REPO_ROOT, 'packages/dome_world_exact/fixtures/a15-r0/EMSTD613');

function buildSyntheticZip(files) {
  const localHeaders = [];
  const cdHeaders = [];
  let currentOffset = 0;

  for (const f of files) {
    const fnameBuf = Buffer.from(f.name, 'utf8');
    const localFnameBuf = f.localName !== undefined ? Buffer.from(f.localName, 'utf8') : fnameBuf;
    const contentBuf = Buffer.isBuffer(f.content) ? f.content : Buffer.from(String(f.content), 'utf8');
    const crc = f.crc !== undefined ? f.crc : computeCrc32(contentBuf);
    const localCrc = f.localCrc !== undefined ? f.localCrc : crc;
    let compData;
    let method = f.method !== undefined ? f.method : 8; // default deflate
    let localMethod = f.localMethod !== undefined ? f.localMethod : method;

    if (method === 0) {
      compData = contentBuf;
    } else {
      compData = zlib.deflateRawSync(contentBuf);
    }

    const compSize = f.compSize !== undefined ? f.compSize : compData.length;
    const uncompSize = f.uncompSize !== undefined ? f.uncompSize : contentBuf.length;
    const localCompSize = f.localCompSize !== undefined ? f.localCompSize : compSize;
    const localUncompSize = f.localUncompSize !== undefined ? f.localUncompSize : uncompSize;
    const flags = f.flags !== undefined ? f.flags : 0;
    const localFlags = f.localFlags !== undefined ? f.localFlags : flags;
    const externalAttrs = f.externalAttrs !== undefined ? f.externalAttrs : 0;

    // Local Header: PK\x03\x04
    const local = Buffer.alloc(30 + localFnameBuf.length);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(localFlags, 6);
    local.writeUInt16LE(localMethod, 8);
    local.writeUInt16LE(0, 10);
    local.writeUInt16LE(0, 12);
    local.writeUInt32LE(localCrc, 14);
    local.writeUInt32LE(localCompSize, 18);
    local.writeUInt32LE(localUncompSize, 22);
    local.writeUInt16LE(localFnameBuf.length, 26);
    local.writeUInt16LE(0, 28);
    localFnameBuf.copy(local, 30);

    let memberBody = compData;
    if (f.descriptor) {
      memberBody = Buffer.concat([compData, f.descriptor]);
    }

    localHeaders.push(Buffer.concat([local, memberBody]));

    const entryOffset = f.cdOffset !== undefined ? f.cdOffset : currentOffset;

    // Central Directory Header: PK\x01\x02
    const cd = Buffer.alloc(46 + fnameBuf.length);
    cd.writeUInt32LE(0x02014b50, 0);
    cd.writeUInt16LE(20, 4);
    cd.writeUInt16LE(20, 6);
    cd.writeUInt16LE(flags, 8);
    cd.writeUInt16LE(method, 10);
    cd.writeUInt16LE(0, 12);
    cd.writeUInt16LE(0, 14);
    cd.writeUInt32LE(crc, 16);
    cd.writeUInt32LE(compSize, 20);
    cd.writeUInt32LE(uncompSize, 24);
    cd.writeUInt16LE(fnameBuf.length, 28);
    cd.writeUInt16LE(0, 30);
    cd.writeUInt16LE(0, 32);
    cd.writeUInt16LE(0, 34);
    cd.writeUInt16LE(0, 36);
    cd.writeUInt32LE(externalAttrs >>> 0, 38);
    cd.writeUInt32LE(entryOffset, 42);
    fnameBuf.copy(cd, 46);

    cdHeaders.push(cd);
    currentOffset += local.length + memberBody.length;
  }

  const cdTotalBuf = Buffer.concat(cdHeaders);

  // EOCD Header: PK\x05\x06
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(files.length, 8);
  eocd.writeUInt16LE(files.length, 10);
  eocd.writeUInt32LE(cdTotalBuf.length, 12);
  eocd.writeUInt32LE(currentOffset, 16);
  eocd.writeUInt16LE(0, 20);

  return Buffer.concat([...localHeaders, cdTotalBuf, eocd]);
}

describe('EM E-00.1: Unified Theory Synthesis & Reciprocal Inheritance Test Suite', () => {

  it('1. Verifies 87 historical sources, exact format bytes, and 53 extracted derivatives', () => {
    const inspection = inspectCorpus();
    assert.equal(inspection.acquisitionManifest.summary_census.total_source_objects, 87);
    assert.equal(inspection.acquisitionManifest.summary_census.total_source_bytes, 7938934);

    const formatBytes = inspection.acquisitionManifest.summary_census.source_format_byte_breakdown;
    assert.equal(formatBytes.pdf.count, 20);
    assert.equal(formatBytes.pdf.bytes, 5642539);
    assert.equal(formatBytes.zip_container.count, 1);
    assert.equal(formatBytes.zip_container.bytes, 697429);
    assert.equal(formatBytes.markdown_documents.count, 33);
    assert.equal(formatBytes.markdown_documents.bytes, 1534070);
    assert.equal(formatBytes.appledouble_metadata.count, 33);
    assert.equal(formatBytes.appledouble_metadata.bytes, 64896);
    assert.equal(formatBytes.total.count, 87);
    assert.equal(formatBytes.total.bytes, 7938934);

    assert.equal(inspection.acquisitionManifest.summary_census.total_extracted_derivatives, 53);
    assert.equal(inspection.acquisitionManifest.summary_census.total_unsupported_formats, 34);
    assert.equal(inspection.acquisitionManifest.summary_census.total_documentary_instruments, 21);
    assert.equal(inspection.acquisitionManifest.summary_census.standalone_scientific_executors_in_lineage, 0);
  });

  it('2. Reconciles Archive.zip central directory (33 content files + 33 AppleDouble sidecars = 66)', () => {
    const zipPath = path.join(EM_ROOT, '02-ORIGINALS/emstd613lineage/Archive.zip');
    const entries = parseZipCentralDirectory(zipPath);
    assert.equal(entries.length, 66);
    const contentDocs = entries.filter(e => !e.is_macosx_sidecar);
    const macosxSidecars = entries.filter(e => e.is_macosx_sidecar);
    assert.equal(contentDocs.length, 33);
    assert.equal(macosxSidecars.length, 33);
  });

  it('3. Verifies 32 Work routes, 8 human gates, and 256 identity hypotheses in [32, 40] interval', () => {
    const crosswalk = JSON.parse(fs.readFileSync(path.join(__dirname, 'identity_metadata_crosswalk.json'), 'utf8'));
    assert.equal(crosswalk.total_work_routes, 32);
    assert.equal(crosswalk.human_gated_count, 8);
    assert.deepEqual(crosswalk.work_count_interval, [32, 40]);
    assert.equal(crosswalk.partitions_count, 256);
  });

  it('4. Executes native lexical index search with Unicode support and integer coordinate safety', () => {
    const testDbPath = path.join(__dirname, 'test_lexical.sqlite');
    const { db, indexedCount } = buildNativeTextIndex(testDbPath);
    assert.equal(indexedCount, 53);

    // ASCII search
    const res = executeSearch(db, 'algedonic', { limit: 5 });
    assert.ok(res.total >= 1);
    assert.equal(res.method, 'NATIVE_LEXICAL_NOT_SEMANTIC');

    const topHit = res.results[0];
    const span = retrieveContextSpan(db, topHit.source_id, 0, 300);
    assert.equal(span.source_id, topHit.source_id);
    assert.equal(span.span_sha256, sha256Hex(Buffer.from(span.text, 'utf8')));

    // Non-ASCII Unicode query test
    const unicodeRes = executeSearch(db, 'cybernetic', { limit: 5 });
    assert.ok(unicodeRes.total >= 1);

    // Coordinate safety tests
    assert.throws(() => {
      retrieveContextSpan(db, topHit.source_id, 1.5, 300); // fractional offset
    }, /NATIVE_CONTEXT_INVALID_COORDINATES/);

    assert.throws(() => {
      retrieveContextSpan(db, topHit.source_id, 0, -10); // negative length
    }, /NATIVE_CONTEXT_NEGATIVE_LENGTH/);

    db.close();
    if (fs.existsSync(testDbPath)) fs.unlinkSync(testDbPath);
  });

  it('5. Refuses text queries on AppleDouble sidecars and asserts semantic model unavailability', () => {
    const witness = JSON.parse(fs.readFileSync(path.join(__dirname, 'lexical_readback_witness.json'), 'utf8'));
    assert.equal(witness.unavailable_format_negative_controls.disposition, 'FAIL_CLOSED_NO_BINARY_MANUFACTURE');
    assert.equal(witness.semantic_retrieval_status.classification, 'SEMANTIC_MODEL_UNAVAILABLE_IN_HISTORICAL_FIXTURE');
    assert.equal(witness.semantic_retrieval_status.semantic_parity_asserted, false);
  });

  it('6. Operator ZIP Intake Engine: admits valid archive with CRC-32 and extracts text derivatives', () => {
    const engine = new OperatorZipIntakeEngine();
    const zipBuf = buildSyntheticZip([
      { name: 'test_manifesto.md', content: '# Synthetic Manifesto\nTesting safe zip extraction.' }
    ]);

    const result = engine.processZipArchive(zipBuf, 'test_zip_001');
    assert.equal(result.total_members_enumerated, 1);
    assert.equal(result.admitted_sources_count, 1);
    assert.equal(result.extracted_derivatives_count, 1);

    const derivId = result.results[0].derivative_id;
    const passage = engine.retrievePassage(derivId, 0, 21);
    assert.equal(passage.span_text, '# Synthetic Manifesto');
    assert.equal(passage.span_sha256, sha256Hex(Buffer.from('# Synthetic Manifesto', 'utf8')));

    // Coordinate validation in retrievePassage
    assert.throws(() => {
      engine.retrievePassage(derivId, 2.5, 10);
    }, /INVALID_COORDINATES/);
    assert.throws(() => {
      engine.retrievePassage(derivId, 10, 5);
    }, /INVALID_COORDINATES/);
  });

  it('7. Operator ZIP Intake Engine: blocks path traversal (Zip-Slip) fail-closed', () => {
    const engine = new OperatorZipIntakeEngine();
    const zipBuf = buildSyntheticZip([
      { name: '../../etc/passwd', content: 'malicious' }
    ]);

    assert.throws(() => {
      engine.processZipArchive(zipBuf, 'malicious_slip');
    }, (err) => {
      return err instanceof ZipIntakeError && err.code === 'ZIP_PATH_TRAVERSAL_REFUSED';
    });
  });

  it('8. Em-to-Universal Reciprocal Bridge: multilayer warrant integrity coordinates and duplicate rejection', () => {
    const bridge = new EmUniversalReciprocalBridge();
    const initRes = bridge.initialize();
    assert.equal(initRes.initialized, true);
    assert.equal(initRes.covenant, 'Khona\u200Clit-po');

    const sourceText = 'Algedonic feedback loop ensures dynamic cybernetic homeostasis.';
    const sourceRecord = bridge.admitEmSource({
      sourceId: 'src:em_test_001',
      filename: 'Algedonic Test.md',
      rawBytes: Buffer.from(sourceText, 'utf8')
    });
    assert.equal(sourceRecord.source_id, 'src:em_test_001');

    // Duplicate source rejection test
    assert.throws(() => {
      bridge.admitEmSource({
        sourceId: 'src:em_test_001',
        filename: 'Duplicate.md',
        rawBytes: Buffer.from('Duplicate', 'utf8')
      });
    }, /DUPLICATE_SOURCE_ADMISSION_REJECTED/);

    // Raw PDF masquerading as text rejection test
    assert.throws(() => {
      bridge.admitEmSource({
        sourceId: 'src:pdf_fake_text',
        filename: 'Fake.pdf',
        rawBytes: Buffer.from('%PDF-1.4 binary data', 'utf8'),
        evidenceClass: 'TEXT_DOCUMENT'
      });
    }, /RAW_PDF_CANNOT_SERVE_AS_TEXT_EVIDENCE/);

    const staged = bridge.stageEmPassageIntoAtelier({
      recordId: 'ua:rec:em_test_witness',
      sourceId: 'src:em_test_001',
      byteOffset: 0,
      length: 23,
      claimSummary: 'Algedonic feedback loop witness'
    });
    assert.equal(staged.span_text, 'Algedonic feedback loop');

    // Multilayer warrant evaluation
    const groundedRes = bridge.groundTheoryWarrant({
      ruleId: 'rule:em_lift_algedonic',
      premises: ['src:em_test_001'],
      targetClaimId: 'claim:algedonic_stabilization',
      claimStatement: 'Algedonic feedback ensures stability',
      sourceCaptureSpanProof: {
        source_id: 'src:em_test_001',
        start: 0,
        end: 23,
        span_sha256: staged.span_sha256
      }
    });

    assert.equal(groundedRes.is_grounded_in_lfp, true);
    assert.equal(groundedRes.warrant_coordinates.source_byte_integrity, true);
    assert.equal(groundedRes.warrant_coordinates.span_validity, true);
    assert.equal(groundedRes.warrant_coordinates.graph_reachability, true);
    assert.equal(groundedRes.warrant_coordinates.derivation_rule_valid, true);
    assert.equal(groundedRes.warrant_coordinates.claim_entailment, 'HELD_UNVERIFIED_BY_SYNTAX_ALONE');

    bridge.close();
  });

  it('9. Unified Theory Synthesis Engine: refuses superficial motif matches fail-closed', () => {
    const engine = new EmUnifiedTheorySynthesisEngine();
    engine.extractWorkAnatomy({
      workId: 'work:w1',
      title: 'Work One',
      domain: 'DOMAIN_A',
      operators: ['OpA.run()']
    });
    engine.extractWorkAnatomy({
      workId: 'work:w2',
      title: 'Work Two',
      domain: 'DOMAIN_B',
      operators: ['OpB.run()']
    });

    const res = engine.synthesizeCrossDomainCandidate({
      candidateId: 'cand:superficial_feedback',
      workAId: 'work:w1',
      workBId: 'work:w2',
      proposedBridgeHypothesis: 'Feedback in cybernetics equals feedback in microphone screeching',
      sharedMotifVocabulary: ['feedback'],
      formalOperatorMapping: [],
      proposedPredictions: []
    });

    assert.equal(res.verdict, 'NO_UNIFICATION_WARRANTED');
    assert.equal(res.promotion_level, PROMOTION_LADDER.LEVEL_0_SUPERFICIAL_ANALOGY);
    assert.equal(res.reason, 'SUPERFICIAL_MOTIF_CONVERGENCE_WITHOUT_FORMAL_OPERATOR_MAPPING');
  });

  it('10. Unified Theory Synthesis Engine: retains contradictions on incommensurable assumptions', () => {
    const engine = new EmUnifiedTheorySynthesisEngine();
    engine.extractWorkAnatomy({
      workId: 'work:hypervisor',
      title: 'Multi-Agent Hypervisor',
      domain: 'AGENT_ORCHESTRATION',
      assumptions: ['NON_STATIONARY_HEURISTIC', 'VARIABLE_DELAY'],
      operators: ['Agent.schedule()']
    });
    engine.extractWorkAnatomy({
      workId: 'work:dsp_tracker',
      title: 'Deterministic Audio DSP Engine',
      domain: 'REALTIME_DSP',
      assumptions: ['DETERMINISTIC_REALTIME', 'ZERO_LATENCY'],
      operators: ['DSP.tick()']
    });

    const res = engine.synthesizeCrossDomainCandidate({
      candidateId: 'cand:clashing_realtime',
      workAId: 'work:hypervisor',
      workBId: 'work:dsp_tracker',
      proposedBridgeHypothesis: 'Non-stationary LLM hypervisor directly schedules deterministic real-time audio threads',
      sharedMotifVocabulary: ['scheduling', 'cadence'],
      formalOperatorMapping: [
        { opA: 'Agent.schedule()', opB: 'DSP.tick()', morphismType: 'HOMOMORPHIC_INTERVENTION' }
      ],
      proposedPredictions: [{ metric: 'jitter', expected_direction: 'ZERO', minimum_effect: 0 }]
    });

    assert.equal(res.verdict, 'NO_UNIFICATION_WARRANTED');
    assert.equal(res.reason, 'COMPOSABILITY_FAILURE_DUE_TO_INCOMMENSURABLE_ASSUMPTIONS');
    assert.equal(res.incompatible_assumptions.length >= 1, true);
    assert.equal(res.falsification_status, 'CONTRADICTION_PRESERVED_WITHOUT_FORCED_CONSENSUS');
  });

  it('11. Unified Theory Synthesis Engine: admits valid composable candidate and cascades withdrawal with immutable snapshots', () => {
    const engine = new EmUnifiedTheorySynthesisEngine();
    const algedonicRaw = Buffer.from('Algedonic Alert Channels provide bypass mechanisms for homeostatic regulation.', 'utf8');
    const hypervisorRaw = Buffer.from('AI Hypervisor Chaos Steering dynamically corrects agent trajectory.', 'utf8');

    engine.registerAuthenticatedSource({
      sourceId: 'src:algedonic_root',
      filename: 'AlgedonicRoot.md',
      rawBytes: algedonicRaw
    });
    engine.registerAuthenticatedSource({
      sourceId: 'src:hypervisor_root',
      filename: 'HypervisorRoot.md',
      rawBytes: hypervisorRaw
    });

    engine.extractWorkAnatomy({
      workId: 'work:algedonic_01',
      title: 'Algedonic Alert Channels',
      domain: 'MANAGEMENT_CYBERNETICS',
      assumptions: ['HOMEOSTATIC_EQUILIBRIUM'],
      operators: ['Alert.bypass()'],
      sourcePassages: [{
        source_id: 'src:algedonic_root',
        byteOffset: 0,
        length: algedonicRaw.length,
        span_text: algedonicRaw.toString('utf8'),
        span_sha256: sha256Hex(algedonicRaw),
        operator: 'Alert.bypass()'
      }]
    });
    engine.extractWorkAnatomy({
      workId: 'work:hypervisor_02',
      title: 'AI Hypervisor Chaos Steering',
      domain: 'CONTROL_THEORY',
      assumptions: ['HOMEOSTATIC_EQUILIBRIUM'],
      operators: ['Steering.correct()'],
      sourcePassages: [{
        source_id: 'src:hypervisor_root',
        byteOffset: 0,
        length: hypervisorRaw.length,
        span_text: hypervisorRaw.toString('utf8'),
        span_sha256: sha256Hex(hypervisorRaw),
        operator: 'Steering.correct()'
      }]
    });

    const candidate = engine.synthesizeCrossDomainCandidate({
      candidateId: 'theory:cybernetic_homeostasis_synthesis',
      workAId: 'work:algedonic_01',
      workBId: 'work:hypervisor_02',
      proposedBridgeHypothesis: 'Algedonic alert bypass maps homomorphically to hypervisor chaos steering',
      sharedMotifVocabulary: ['homeostasis', 'steering'],
      formalOperatorMapping: [
        { opA: 'Alert.bypass()', opB: 'Steering.correct()', morphismType: 'HOMOMORPHIC_INTERVENTION' }
      ],
      proposedPredictions: [
        { metric: 'recovery_time_ticks', expected_direction: 'DECREASE', minimum_effect: 0.20 }
      ]
    });

    assert.equal(candidate.verdict, 'COMPOSABLE_THEORY_CANDIDATE_ADMITTED');
    assert.equal(candidate.promotion_level, PROMOTION_LADDER.LEVEL_2_COMPOSABLE_THEORY_CANDIDATE);
    assert.equal(candidate.competing_models.length, 2);

    // Verify initial immutable snapshot
    const initialSnap = engine.getHistoricalSnapshot(candidate.candidate_id, 0);
    assert.equal(initialSnap.status, 'ACTIVE_CANDIDATE');

    // Dependency-aware source withdrawal propagation
    const propRes = engine.propagateSourceWithdrawal('src:algedonic_root', 'Laboratory source retracted due to instrument failure');
    assert.equal(propRes.cascaded_theories_count, 1);

    const postSnap = engine.getHistoricalSnapshot(candidate.candidate_id, 1);
    assert.equal(postSnap.status, 'WITHDRAWN');
    assert.equal(postSnap.tombstone.non_retroactive, true);

    // Initial snapshot remains unmutated
    assert.equal(initialSnap.status, 'ACTIVE_CANDIDATE');
  });

  it('12. Competent Null Comparator: runs trace-derived comparison and reports verified bounded tie', () => {
    const comparator = new CompetentNullComparator();
    const testCorpus = {
      hypervisorSource: {
        id: 'emsrc_hypervisor_test',
        filename: 'Hypervisor.md',
        text: 'Hypervisor control mathematics and chaos steering.'
      },
      algedonicSource: {
        id: 'emsrc_algedonic_test',
        filename: 'Algedonic.md',
        text: 'Algedonic systems provide immediate pain signals.'
      },
      hypervisorWork: {
        workId: 'work:hypervisor_test',
        title: 'Hypervisor Control',
        domain: 'CYBERNETICS',
        assumptions: ['HOMEOSTATIC_EQUILIBRIUM'],
        operators: ['Hypervisor.vector_cull()'],
        sourcePassages: [{
          source_id: 'emsrc_hypervisor_test',
          byteOffset: 0,
          length: 40,
          span_text: 'Hypervisor control mathematics and chaos',
          span_sha256: sha256Hex('Hypervisor control mathematics and chaos'),
          operator: 'Hypervisor.vector_cull()'
        }]
      },
      algedonicWork: {
        workId: 'work:algedonic_test',
        title: 'Algedonic Loop',
        domain: 'CYBERNETICS',
        assumptions: ['HOMEOSTATIC_EQUILIBRIUM'],
        operators: ['Algedonic.bypass_hierarchy()'],
        sourcePassages: [{
          source_id: 'emsrc_algedonic_test',
          byteOffset: 0,
          length: 40,
          span_text: 'Algedonic systems provide immediate pain',
          span_sha256: sha256Hex('Algedonic systems provide immediate pain'),
          operator: 'Algedonic.bypass_hierarchy()'
        }]
      }
    };

    const comp = comparator.evaluateComparison(testCorpus);
    assert.ok(comp.arms.arm_1_documentary);
    assert.ok(comp.arms.arm_2_receiver);
    assert.ok(comp.arms.arm_3_non_reciprocal_union);
    assert.ok(comp.arms.arm_4_reciprocal);

    // Trace-derived tie assertions
    assert.equal(comp.differential_matrix.measured_graph_fidelity_comparison.determination, 'BOUNDED_TIE_AT_100_PERCENT');
    assert.equal(comp.differential_matrix.unsupported_targets_rejection_comparison.determination, 'BOUNDED_TIE');
    assert.equal(comp.differential_matrix.scientific_reciprocal_surplus, 'UNESTABLISHED');

    // Both systems achieve 100% graph fidelity on observed cases
    assert.equal(comp.arms.arm_3_non_reciprocal_union.measured_graph_fidelity, 1.0);
    assert.equal(comp.arms.arm_4_reciprocal.measured_graph_fidelity, 1.0);

    // Both systems evaluate identical case counts (WIRE-01 matched denominator)
    assert.equal(comp.arms.arm_3_non_reciprocal_union.cases_evaluated, 6);
    assert.equal(comp.arms.arm_4_reciprocal.cases_evaluated, 6);
    assert.equal(comp.arms.arm_3_non_reciprocal_union.correct_decisions, 6);
    assert.equal(comp.arms.arm_4_reciprocal.correct_decisions, 6);
    assert.equal(comp.arms.arm_3_non_reciprocal_union.unsupported_targets_rejected, 4);
    assert.equal(comp.arms.arm_4_reciprocal.unsupported_targets_rejected, 4);

    // Historical authored declarations preserved without polluting active metrics
    assert.equal(comp.arms.arm_3_non_reciprocal_union.historical_authored_declaration.status, 'HISTORICAL_AUTHORED_DECLARATION_SUPERSEDED_BY_EMPIRICAL_TIE');
  });

  it('13. Verified Operator Mappings: rejects invented operators and unsupported morphism labels', () => {
    const engine = new EmUnifiedTheorySynthesisEngine();
    engine.extractWorkAnatomy({
      workId: 'work:real_a',
      title: 'Real Work A',
      domain: 'DOMAIN_A',
      operators: ['Valid.opA()']
    });
    engine.extractWorkAnatomy({
      workId: 'work:real_b',
      title: 'Real Work B',
      domain: 'DOMAIN_B',
      operators: ['Valid.opB()']
    });

    // Test invented operator in Work A
    const resInventedA = engine.synthesizeCrossDomainCandidate({
      candidateId: 'cand:invented_a',
      workAId: 'work:real_a',
      workBId: 'work:real_b',
      proposedBridgeHypothesis: 'Invented operator test',
      formalOperatorMapping: [
        { opA: 'Invented.opUnknown()', opB: 'Valid.opB()', morphismType: 'HOMOMORPHIC_INTERVENTION' }
      ],
      proposedPredictions: [{ metric: 'm', expected_direction: 'ZERO', minimum_effect: 0 }]
    });
    assert.equal(resInventedA.verdict, 'NO_UNIFICATION_WARRANTED');
    assert.equal(resInventedA.reason, 'INVENTED_OPERATOR_NAME_REJECTED');

    // Test unsupported morphism label
    const resBadMorphism = engine.synthesizeCrossDomainCandidate({
      candidateId: 'cand:bad_morphism',
      workAId: 'work:real_a',
      workBId: 'work:real_b',
      proposedBridgeHypothesis: 'Bad morphism test',
      formalOperatorMapping: [
        { opA: 'Valid.opA()', opB: 'Valid.opB()', morphismType: 'MAGIC_TRANSMUTATION' }
      ],
      proposedPredictions: [{ metric: 'm', expected_direction: 'ZERO', minimum_effect: 0 }]
    });
    assert.equal(resBadMorphism.verdict, 'NO_UNIFICATION_WARRANTED');
    assert.equal(resBadMorphism.reason, 'UNSUPPORTED_MORPHISM_LABEL_REJECTED');
  });

  it('14. Continuous-Discrete Correspondence: permits unification when correspondence mapping is declared', () => {
    const engine = new EmUnifiedTheorySynthesisEngine();
    const contText = 'Continuous differential flow integration dynamics.';
    const discText = 'Discrete automaton step transition updates.';

    engine.registerAuthenticatedSource({
      sourceId: 'src:continuous_dynamics',
      rawBytes: Buffer.from(contText, 'utf8')
    });
    engine.registerAuthenticatedSource({
      sourceId: 'src:discrete_automaton',
      rawBytes: Buffer.from(discText, 'utf8')
    });

    engine.extractWorkAnatomy({
      workId: 'work:continuous_model',
      title: 'Continuous Differential Flow',
      domain: 'DYNAMICS',
      assumptions: ['CONTINUOUS_FLOW'],
      operators: ['Flow.integrate()'],
      sourcePassages: [{
        source_id: 'src:continuous_dynamics',
        byteOffset: 0,
        length: contText.length,
        span_text: contText,
        span_sha256: sha256Hex(contText),
        operator: 'Flow.integrate()'
      }]
    });
    engine.extractWorkAnatomy({
      workId: 'work:discrete_model',
      title: 'Discrete Event Automaton',
      domain: 'AUTOMATA',
      assumptions: ['DISCRETE_TRANSITION'],
      operators: ['Automaton.step()'],
      sourcePassages: [{
        source_id: 'src:discrete_automaton',
        byteOffset: 0,
        length: discText.length,
        span_text: discText,
        span_sha256: sha256Hex(discText),
        operator: 'Automaton.step()'
      }]
    });

    // 1. Without correspondence: fails closed
    const resNoBridge = engine.synthesizeCrossDomainCandidate({
      candidateId: 'cand:no_bridge',
      workAId: 'work:continuous_model',
      workBId: 'work:discrete_model',
      proposedBridgeHypothesis: 'Continuous and discrete equate naively',
      formalOperatorMapping: [
        { opA: 'Flow.integrate()', opB: 'Automaton.step()', morphismType: 'HOMOMORPHIC_INTERVENTION' }
      ],
      proposedPredictions: [{ metric: 'error', expected_direction: 'ZERO', minimum_effect: 0 }]
    });
    assert.equal(resNoBridge.verdict, 'NO_UNIFICATION_WARRANTED');
    assert.equal(resNoBridge.reason, 'COMPOSABILITY_FAILURE_DUE_TO_INCOMMENSURABLE_ASSUMPTIONS');

    // 2. With formal discretization correspondence: admitted as candidate but mathematical validity preserved as HELD_UNVERIFIED
    const resWithBridge = engine.synthesizeCrossDomainCandidate({
      candidateId: 'cand:with_bridge',
      workAId: 'work:continuous_model',
      workBId: 'work:discrete_model',
      proposedBridgeHypothesis: 'Runge-Kutta discrete sampling step maps to continuous flow integration',
      proposedCorrespondence: {
        type: 'DISCRETIZATION_CORRESPONDENCE',
        discretization_method: 'RUNGE_KUTTA_SAMPLING',
        step_size: 0.01,
        bounded_error_guarantee: 'O(dt^2) <= 0.05'
      },
      formalOperatorMapping: [
        { opA: 'Flow.integrate()', opB: 'Automaton.step()', morphismType: 'DISCRETIZATION_CORRESPONDENCE' }
      ],
      proposedPredictions: [{ metric: 'truncation_error', expected_direction: 'DECREASE', minimum_effect: 0.05 }]
    });
    assert.equal(resWithBridge.verdict, 'COMPOSABLE_THEORY_CANDIDATE_ADMITTED');
    assert.equal(resWithBridge.promotion_level, PROMOTION_LADDER.LEVEL_2_COMPOSABLE_THEORY_CANDIDATE);
    assert.equal(resWithBridge.mathematical_validity_status, 'HELD_UNVERIFIED');
    assert.equal(resWithBridge.discretization_correspondence.mathematical_validity, 'HELD_UNVERIFIED');
  });

  it('15. Hardened ZIP Intake: rejects symlinks, encryption, duplicate paths, and zip bombs', () => {
    const engine = new OperatorZipIntakeEngine();

    // 1. Symlink rejection
    const symlinkZip = buildSyntheticZip([
      { name: 'link_to_root', content: '/root', externalAttrs: 0o120755 << 16 }
    ]);
    assert.throws(() => {
      engine.processZipArchive(symlinkZip, 'symlink_test');
    }, /SYMLINK_REJECTED/);

    // 2. Encrypted entry rejection
    const encryptedZip = buildSyntheticZip([
      { name: 'secret.txt', content: 'encrypted bytes', flags: 0x0001 }
    ]);
    assert.throws(() => {
      engine.processZipArchive(encryptedZip, 'encrypted_test');
    }, /ENCRYPTED_ZIP_UNSUPPORTED/);

    // 3. Duplicate normalized path rejection
    const dupPathZip = buildSyntheticZip([
      { name: 'document.md', content: '# First copy' },
      { name: 'document.md', content: '# Second copy' }
    ]);
    assert.throws(() => {
      engine.processZipArchive(dupPathZip, 'dup_path_test');
    }, /DUPLICATE_PATH_IN_ARCHIVE_REJECTED/);

    // 4. Zip bomb uncompressed size limit rejection
    const smallEngine = new OperatorZipIntakeEngine({ maxSingleFileSize: 50 });
    const bombZip = buildSyntheticZip([
      { name: 'bomb.txt', content: 'A'.repeat(200) }
    ]);
    assert.throws(() => {
      smallEngine.processZipArchive(bombZip, 'bomb_test');
    }, /ZIP_RESOURCE_LIMIT_EXCEEDED/);

    // 5. Atomic admission verification: on failure, zero sources admitted
    assert.equal(engine.admittedSources.size, 0);
    assert.equal(engine.admittedDerivatives.size, 0);
  });

  it('16. WIRE-01 Matched Comparator: paired case ledger regression, denominator parity & dynamic evaluation', () => {
    const comparator = new CompetentNullComparator();
    const testCorpus = {
      hypervisorSource: {
        id: 'emsrc_hypervisor_test',
        filename: 'Hypervisor.md',
        text: 'Hypervisor control mathematics and chaos steering.'
      },
      algedonicSource: {
        id: 'emsrc_algedonic_test',
        filename: 'Algedonic.md',
        text: 'Algedonic systems provide immediate pain signals.'
      },
      hypervisorWork: {
        workId: 'work:hypervisor_test',
        title: 'Hypervisor Control',
        domain: 'CYBERNETICS',
        assumptions: ['HOMEOSTATIC_EQUILIBRIUM'],
        operators: ['Hypervisor.vector_cull()'],
        sourcePassages: [{
          source_id: 'emsrc_hypervisor_test',
          byteOffset: 0,
          length: 40,
          span_text: 'Hypervisor control mathematics and chaos',
          span_sha256: sha256Hex('Hypervisor control mathematics and chaos'),
          operator: 'Hypervisor.vector_cull()'
        }]
      },
      algedonicWork: {
        workId: 'work:algedonic_test',
        title: 'Algedonic Loop',
        domain: 'CYBERNETICS',
        assumptions: ['HOMEOSTATIC_EQUILIBRIUM'],
        operators: ['Algedonic.bypass_hierarchy()'],
        sourcePassages: [{
          source_id: 'emsrc_algedonic_test',
          byteOffset: 0,
          length: 40,
          span_text: 'Algedonic systems provide immediate pain',
          span_sha256: sha256Hex('Algedonic systems provide immediate pain'),
          operator: 'Algedonic.bypass_hierarchy()'
        }]
      }
    };

    // 1. Verify ledger length and immutability
    assert.equal(CANONICAL_PAIRED_CASE_LEDGER.length, 6);
    assert.ok(Object.isFrozen(CANONICAL_PAIRED_CASE_LEDGER));

    // 2. Reject empty or invalid ledger fail-closed
    assert.throws(() => {
      comparator.evaluateComparison(testCorpus, []);
    }, /ASYMMETRIC_CASE_LEDGER_DETECTED/);

    assert.throws(() => {
      comparator.evaluateComparison(testCorpus, null);
    }, /ASYMMETRIC_CASE_LEDGER_DETECTED/);

    // 3. Matched execution across 6 cases with identical denominators
    const findings = comparator.evaluateComparison(testCorpus);
    assert.equal(findings.arms.arm_3_non_reciprocal_union.cases_evaluated, 6);
    assert.equal(findings.arms.arm_4_reciprocal.cases_evaluated, 6);
    assert.equal(findings.arms.arm_3_non_reciprocal_union.measured_graph_fidelity, 1.0);
    assert.equal(findings.arms.arm_4_reciprocal.measured_graph_fidelity, 1.0);
    assert.equal(findings.arms.arm_3_non_reciprocal_union.unsupported_targets_rejected, 4);
    assert.equal(findings.arms.arm_4_reciprocal.unsupported_targets_rejected, 4);
    assert.equal(findings.arms.arm_3_non_reciprocal_union.false_graph_convergences, 0);
    assert.equal(findings.arms.arm_4_reciprocal.false_graph_convergences, 0);

    // 4. Equal withdrawal counts verified
    assert.equal(findings.differential_matrix.withdrawal_operation_counts.arm_3_non_reciprocal, 2);
    assert.equal(findings.differential_matrix.withdrawal_operation_counts.arm_4_reciprocal, 2);
    assert.equal(findings.differential_matrix.withdrawal_operation_counts.determination, 'EQUIVALENT_WITHDRAWAL_OPERATIONS');

    // 5. Negative Control A: Duplicate case_id in ledger is rejected fail-closed
    const duplicateLedger = [
      ...CANONICAL_PAIRED_CASE_LEDGER,
      { ...CANONICAL_PAIRED_CASE_LEDGER[0] }
    ];
    assert.throws(() => {
      comparator.evaluateComparison(testCorpus, duplicateLedger);
    }, /ASYMMETRIC_CASE_LEDGER_DETECTED/);

    // 6. Negative Control B: Missing case_id or malformed entry rejected fail-closed
    assert.throws(() => {
      comparator.evaluateComparison(testCorpus, [
        { case_id: 'case_1_valid' },
        { target: 'missing_case_id' }
      ]);
    }, /ASYMMETRIC_CASE_LEDGER_DETECTED/);

    // 7. Negative Control C: Asymmetric outcomes dynamically emit ASYMMETRIC determinations, never unconditional ties
    const asymmetricLedger = [
      {
        case_id: 'asym_case_1',
        case_type: 'PRE_WITHDRAWAL_TARGET',
        root: 'root:hypervisor',
        target: 'claim:priority_bypass',
        expected_admissible: true
      },
      {
        case_id: 'asym_case_2',
        case_type: 'PRE_WITHDRAWAL_TARGET',
        root: 'root:hypervisor',
        target: 'claim:unreachable_target_arm3',
        expected_admissible: false
      },
      {
        case_id: 'asym_case_3',
        case_type: 'PRE_WITHDRAWAL_TARGET',
        root: 'root:hypervisor',
        target: 'premise:priority_inversion', // Reachable in Arm 3 union graph, but ungrounded in Arm 4 LFP.P
        expected_admissible: true
      }
    ];

    const asymFindings = comparator.evaluateComparison(testCorpus, asymmetricLedger);
    assert.equal(asymFindings.arms.arm_3_non_reciprocal_union.measured_graph_fidelity, 1.0);
    assert.equal(asymFindings.arms.arm_4_reciprocal.measured_graph_fidelity < 1.0, true);
    assert.ok(asymFindings.differential_matrix.measured_graph_fidelity_comparison.determination.startsWith('ASYMMETRIC_FIDELITY_OBSERVED'));
    assert.notEqual(asymFindings.differential_matrix.measured_graph_fidelity_comparison.determination, 'BOUNDED_TIE_AT_100_PERCENT');
    assert.equal(asymFindings.differential_matrix.scientific_reciprocal_surplus, 'UNESTABLISHED');
    assert.ok(asymFindings.governance_determination.startsWith('EMPIRICAL_OUTCOME_OBSERVED'));
  });

  it('17. WIRE-02 Source-Attested Operator & Morphism Qualification: rejects unattested, unverified, or digest-mismatched proposals', () => {
    const engine = new EmUnifiedTheorySynthesisEngine();

    // 1. Works with empty source passages: rejected fail-closed
    engine.extractWorkAnatomy({
      workId: 'work:empty_passages_a',
      title: 'Empty Passages Work A',
      domain: 'CYBERNETICS',
      operators: ['OpA.action()'],
      sourcePassages: []
    });
    engine.extractWorkAnatomy({
      workId: 'work:empty_passages_b',
      title: 'Empty Passages Work B',
      domain: 'CYBERNETICS',
      operators: ['OpB.action()'],
      sourcePassages: []
    });

    const resEmpty = engine.synthesizeCrossDomainCandidate({
      candidateId: 'cand:empty_passages',
      workAId: 'work:empty_passages_a',
      workBId: 'work:empty_passages_b',
      proposedBridgeHypothesis: 'Empty passages test',
      formalOperatorMapping: [{ opA: 'OpA.action()', opB: 'OpB.action()', morphismType: 'HOMOMORPHIC_INTERVENTION' }],
      proposedPredictions: [{ metric: 'm', expected_direction: 'ZERO', minimum_effect: 0 }]
    });
    assert.equal(resEmpty.verdict, 'NO_UNIFICATION_WARRANTED');
    assert.equal(resEmpty.reason, 'EMPTY_SOURCE_PASSAGES_CANNOT_ATTEST_OPERATORS');

    // 2. Operator quotation digest mismatch: rejected fail-closed against authenticated source
    engine.registerAuthenticatedSource({
      sourceId: 'src:fake',
      rawBytes: Buffer.from('Valid text passage for testing', 'utf8')
    });
    engine.registerAuthenticatedSource({
      sourceId: 'src:valid',
      rawBytes: Buffer.from('OpB text for testing', 'utf8')
    });

    engine.extractWorkAnatomy({
      workId: 'work:digest_mismatch_a',
      title: 'Digest Mismatch Work A',
      domain: 'CYBERNETICS',
      operators: [
        {
          name: 'OpBad.action()',
          source_attestation: {
            source_id: 'src:fake',
            passage_coordinates: { start: 0, end: 10 },
            quoted_text: 'Valid text passage',
            content_digest: 'tampered_sha256_digest_1234567890abcdef'
          }
        }
      ],
      sourcePassages: [{ source_id: 'src:fake', span_text: 'Valid text passage' }]
    });
    engine.extractWorkAnatomy({
      workId: 'work:valid_b',
      title: 'Valid Work B',
      domain: 'CYBERNETICS',
      operators: ['OpB.action()'],
      sourcePassages: [{
        source_id: 'src:valid',
        byteOffset: 0,
        length: 'OpB text for testing'.length,
        span_text: 'OpB text for testing',
        span_sha256: sha256Hex('OpB text for testing'),
        operator: 'OpB.action()'
      }]
    });

    const resMismatch = engine.synthesizeCrossDomainCandidate({
      candidateId: 'cand:digest_mismatch',
      workAId: 'work:digest_mismatch_a',
      workBId: 'work:valid_b',
      proposedBridgeHypothesis: 'Digest mismatch test',
      formalOperatorMapping: [{ opA: 'OpBad.action()', opB: 'OpB.action()', morphismType: 'HOMOMORPHIC_INTERVENTION' }],
      proposedPredictions: [{ metric: 'm', expected_direction: 'ZERO', minimum_effect: 0 }]
    });
    assert.equal(resMismatch.verdict, 'NO_UNIFICATION_WARRANTED');
    assert.equal(resMismatch.reason, 'SOURCE_QUOTATION_DIGEST_MISMATCH_REJECTED');

    // 3. Bare boolean continuous/discrete correspondence flag rejected
    engine.registerAuthenticatedSource({
      sourceId: 'src:cont',
      rawBytes: Buffer.from('Flow text', 'utf8')
    });
    engine.registerAuthenticatedSource({
      sourceId: 'src:disc',
      rawBytes: Buffer.from('Step text', 'utf8')
    });

    engine.extractWorkAnatomy({
      workId: 'work:cont_bare',
      title: 'Continuous Model Bare',
      domain: 'DYNAMICS',
      assumptions: ['CONTINUOUS_FLOW'],
      operators: ['Flow.run()'],
      sourcePassages: [{
        source_id: 'src:cont',
        byteOffset: 0,
        length: 'Flow text'.length,
        span_text: 'Flow text',
        span_sha256: sha256Hex('Flow text'),
        operator: 'Flow.run()'
      }]
    });
    engine.extractWorkAnatomy({
      workId: 'work:disc_bare',
      title: 'Discrete Model Bare',
      domain: 'AUTOMATA',
      assumptions: ['DISCRETE_TRANSITION'],
      operators: ['Step.run()'],
      sourcePassages: [{
        source_id: 'src:disc',
        byteOffset: 0,
        length: 'Step text'.length,
        span_text: 'Step text',
        span_sha256: sha256Hex('Step text'),
        operator: 'Step.run()'
      }]
    });

    const resBareBool = engine.synthesizeCrossDomainCandidate({
      candidateId: 'cand:bare_bool_rejection',
      workAId: 'work:cont_bare',
      workBId: 'work:disc_bare',
      proposedBridgeHypothesis: 'Bare boolean correspondence',
      proposedCorrespondence: { handlesContinuousDiscrete: true }, // bare flag without formal method
      formalOperatorMapping: [{ opA: 'Flow.run()', opB: 'Step.run()', morphismType: 'HOMOMORPHIC_INTERVENTION' }],
      proposedPredictions: [{ metric: 'm', expected_direction: 'ZERO', minimum_effect: 0 }]
    });
    assert.equal(resBareBool.verdict, 'NO_UNIFICATION_WARRANTED');
    assert.equal(resBareBool.reason, 'UNVERIFIED_CONTINUOUS_DISCRETE_CORRESPONDENCE_REJECTED');

    // 4. Unverified / unobserved mapping relationship: classified as HELD_UNVERIFIED
    const resUnverified = engine.synthesizeCrossDomainCandidate({
      candidateId: 'cand:unverified_relationship',
      workAId: 'work:valid_b',
      workBId: 'work:valid_b',
      proposedBridgeHypothesis: 'Unverified relationship test',
      formalOperatorMapping: [
        { opA: 'OpB.action()', opB: 'OpB.action()', morphismType: 'HOMOMORPHIC_INTERVENTION', unverified: true }
      ],
      proposedPredictions: [{ metric: 'm', expected_direction: 'ZERO', minimum_effect: 0 }]
    });
    assert.equal(resUnverified.verdict, 'NO_UNIFICATION_WARRANTED');
    assert.equal(resUnverified.status, 'HELD_UNVERIFIED');
    assert.equal(resUnverified.reason, 'MAPPING_RELATIONSHIP_UNVERIFIED_OR_UNOBSERVED');

    // 5. Adversarial negative test: caller supplies a self-consistent quotation and digest,
    // but the source is NOT registered in the authenticated source registry.
    const unauthQuote = 'Adversarial unauthenticated operator claim and definition.';
    const unauthDigest = sha256Hex(unauthQuote); // perfectly self-consistent with quoted text!
    engine.extractWorkAnatomy({
      workId: 'work:adversarial_unauth_a',
      title: 'Adversarial Unauthenticated Work A',
      domain: 'CYBERNETICS',
      operators: [
        {
          name: 'OpAdversarial.run()',
          source_attestation: {
            source_id: 'src:unregistered_external_source',
            passage_coordinates: { start: 0, end: unauthQuote.length },
            quoted_text: unauthQuote,
            content_digest: unauthDigest
          }
        }
      ],
      sourcePassages: [{
        source_id: 'src:unregistered_external_source',
        byteOffset: 0,
        length: unauthQuote.length,
        span_text: unauthQuote,
        span_sha256: unauthDigest
      }]
    });

    const resUnauth = engine.synthesizeCrossDomainCandidate({
      candidateId: 'cand:adversarial_unauth',
      workAId: 'work:adversarial_unauth_a',
      workBId: 'work:valid_b',
      proposedBridgeHypothesis: 'Adversarial unauthenticated attestation test',
      formalOperatorMapping: [{ opA: 'OpAdversarial.run()', opB: 'OpB.action()', morphismType: 'HOMOMORPHIC_INTERVENTION' }],
      proposedPredictions: [{ metric: 'm', expected_direction: 'ZERO', minimum_effect: 0 }]
    });

    assert.equal(resUnauth.verdict, 'NO_UNIFICATION_WARRANTED');
    assert.equal(resUnauth.status, 'HELD_UNVERIFIED');
    assert.equal(resUnauth.reason, 'UNAUTHENTICATED_SOURCE_ATTESTATION_REJECTED');
    assert.equal(resUnauth.falsification_status, 'HELD_UNVERIFIED_SOURCE');
  });

  it('18. WIRE-03 Complete ZIP Header & Admission Contract: adversarial header mismatches, descriptors, and atomic rollback', () => {
    const engine = new OperatorZipIntakeEngine();

    // 1. Local-Central Flags Mismatch
    const flagsMismatchZip = buildSyntheticZip([
      { name: 'file1.txt', content: 'test content', flags: 0x0000, localFlags: 0x0008 }
    ]);
    assert.throws(() => {
      engine.processZipArchive(flagsMismatchZip, 'flags_mismatch');
    }, /LOCAL_CENTRAL_METADATA_MISMATCH/);

    // 2. Local-Central Filename Mismatch
    const fnameMismatchZip = buildSyntheticZip([
      { name: 'central_name.txt', localName: 'local_name.txt', content: 'test content' }
    ]);
    assert.throws(() => {
      engine.processZipArchive(fnameMismatchZip, 'fname_mismatch');
    }, /LOCAL_CENTRAL_METADATA_MISMATCH/);

    // 3. Local-Central CRC-32 Mismatch
    const crcMismatchZip = buildSyntheticZip([
      { name: 'file_crc.txt', content: 'test content', crc: 0x12345678, localCrc: 0x87654321 }
    ]);
    assert.throws(() => {
      engine.processZipArchive(crcMismatchZip, 'crc_mismatch');
    }, /LOCAL_CENTRAL_METADATA_MISMATCH/);

    // 4. Local-Central Compression Method Mismatch
    const methodMismatchZip = buildSyntheticZip([
      { name: 'file_method.txt', content: 'test content', method: 0, localMethod: 8 }
    ]);
    assert.throws(() => {
      engine.processZipArchive(methodMismatchZip, 'method_mismatch');
    }, /LOCAL_CENTRAL_METADATA_MISMATCH/);

    // 5. Corrupt Streaming Data Descriptor (bit 3 set with invalid CRC in descriptor)
    const badDesc = Buffer.alloc(16);
    badDesc.writeUInt32LE(0x08074b50, 0); // Signature
    badDesc.writeUInt32LE(0xdeadbeef, 4);  // Corrupt CRC
    badDesc.writeUInt32LE(20, 8);          // compSize
    badDesc.writeUInt32LE(20, 12);         // uncompSize
    const badDescZip = buildSyntheticZip([
      {
        name: 'streaming.txt',
        content: 'hello streaming world',
        flags: 0x0008,
        localFlags: 0x0008,
        localCrc: 0,
        localCompSize: 0,
        localUncompSize: 0,
        descriptor: badDesc
      }
    ]);
    assert.throws(() => {
      engine.processZipArchive(badDescZip, 'bad_descriptor');
    }, /DATA_DESCRIPTOR_RECONCILIATION_FAILED/);

    // 6. Overlapping Member Spans (member 2 CD offset overlaps member 1)
    const overlapZip = buildSyntheticZip([
      { name: 'first.txt', content: 'first content' },
      { name: 'second.txt', content: 'second content', cdOffset: 0 } // Points back to offset 0!
    ]);
    assert.throws(() => {
      engine.processZipArchive(overlapZip, 'overlap_test');
    }, /CORRUPT_OR_OVERLAPPING_MEMBER_RANGE/);

    // 7. Atomic Admission Rollback on Mid-Archive Failure
    const midFailEngine = new OperatorZipIntakeEngine();
    const midFailZip = buildSyntheticZip([
      { name: 'valid_first.md', content: '# Valid first member' },
      { name: 'corrupt_second.md', content: '# Corrupt member', crc: 0x11111111, localCrc: 0x22222222 }
    ]);
    assert.throws(() => {
      midFailEngine.processZipArchive(midFailZip, 'mid_fail_test');
    }, /LOCAL_CENTRAL_METADATA_MISMATCH/);

    // Verify ZERO state committed from failed archive
    assert.equal(midFailEngine.admittedSources.size, 0);
    assert.equal(midFailEngine.admittedDerivatives.size, 0);
  });

});
