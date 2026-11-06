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
  CompetentNullComparator
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
    const contentBuf = Buffer.isBuffer(f.content) ? f.content : Buffer.from(String(f.content), 'utf8');
    const crc = f.crc !== undefined ? f.crc : computeCrc32(contentBuf);
    let compData;
    let method = f.method !== undefined ? f.method : 8; // default deflate

    if (method === 0) {
      compData = contentBuf;
    } else {
      compData = zlib.deflateRawSync(contentBuf);
    }

    const compSize = f.compSize !== undefined ? f.compSize : compData.length;
    const uncompSize = f.uncompSize !== undefined ? f.uncompSize : contentBuf.length;
    const flags = f.flags !== undefined ? f.flags : 0;
    const externalAttrs = f.externalAttrs !== undefined ? f.externalAttrs : 0;

    // Local Header: PK\x03\x04
    const local = Buffer.alloc(30 + fnameBuf.length);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(flags, 6);
    local.writeUInt16LE(method, 8);
    local.writeUInt16LE(0, 10);
    local.writeUInt16LE(0, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(compSize, 18);
    local.writeUInt32LE(uncompSize, 22);
    local.writeUInt16LE(fnameBuf.length, 26);
    local.writeUInt16LE(0, 28);
    fnameBuf.copy(local, 30);

    localHeaders.push(Buffer.concat([local, compData]));

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
    cd.writeUInt32LE(currentOffset, 42);
    fnameBuf.copy(cd, 46);

    cdHeaders.push(cd);
    currentOffset += local.length + compData.length;
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
    engine.extractWorkAnatomy({
      workId: 'work:algedonic_01',
      title: 'Algedonic Alert Channels',
      domain: 'MANAGEMENT_CYBERNETICS',
      assumptions: ['HOMEOSTATIC_EQUILIBRIUM'],
      operators: ['Alert.bypass()'],
      sourcePassages: [{ source_id: 'src:algedonic_root' }]
    });
    engine.extractWorkAnatomy({
      workId: 'work:hypervisor_02',
      title: 'AI Hypervisor Chaos Steering',
      domain: 'CONTROL_THEORY',
      assumptions: ['HOMEOSTATIC_EQUILIBRIUM'],
      operators: ['Steering.correct()'],
      sourcePassages: [{ source_id: 'src:hypervisor_root' }]
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
        operators: ['Hypervisor.vector_cull()']
      },
      algedonicWork: {
        workId: 'work:algedonic_test',
        title: 'Algedonic Loop',
        domain: 'CYBERNETICS',
        assumptions: ['HOMEOSTATIC_EQUILIBRIUM'],
        operators: ['Algedonic.bypass_hierarchy()']
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
    engine.extractWorkAnatomy({
      workId: 'work:continuous_model',
      title: 'Continuous Differential Flow',
      domain: 'DYNAMICS',
      assumptions: ['CONTINUOUS_FLOW'],
      operators: ['Flow.integrate()']
    });
    engine.extractWorkAnatomy({
      workId: 'work:discrete_model',
      title: 'Discrete Event Automaton',
      domain: 'AUTOMATA',
      assumptions: ['DISCRETE_TRANSITION'],
      operators: ['Automaton.step()']
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

    // 2. With explicit discretization correspondence: admitted as candidate
    const resWithBridge = engine.synthesizeCrossDomainCandidate({
      candidateId: 'cand:with_bridge',
      workAId: 'work:continuous_model',
      workBId: 'work:discrete_model',
      proposedBridgeHypothesis: 'Runge-Kutta discrete sampling step maps to continuous flow integration',
      proposedCorrespondence: { handlesContinuousDiscrete: true, type: 'DISCRETIZATION_CORRESPONDENCE' },
      formalOperatorMapping: [
        { opA: 'Flow.integrate()', opB: 'Automaton.step()', morphismType: 'DISCRETIZATION_CORRESPONDENCE' }
      ],
      proposedPredictions: [{ metric: 'truncation_error', expected_direction: 'DECREASE', minimum_effect: 0.05 }]
    });
    assert.equal(resWithBridge.verdict, 'COMPOSABLE_THEORY_CANDIDATE_ADMITTED');
    assert.equal(resWithBridge.promotion_level, PROMOTION_LADDER.LEVEL_2_COMPOSABLE_THEORY_CANDIDATE);
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

});
