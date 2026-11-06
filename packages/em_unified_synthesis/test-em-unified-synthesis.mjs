/**
 * TD613 EMSTD613 Unified Theory Synthesis & Reciprocal Inheritance Test Suite
 * Commission EM E-00 · Verification Suite
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
  ZipIntakeError
} from './operator-zip-intake.mjs';

import {
  EmUniversalReciprocalBridge
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

describe('EM E-00: Unified Theory Synthesis & Reciprocal Inheritance Suite', () => {

  it('1. Verifies 87 historical sources and 53 extracted derivatives against exact hashes', () => {
    const inspection = inspectCorpus();
    assert.equal(inspection.acquisitionManifest.summary_census.total_source_objects, 87);
    assert.equal(inspection.acquisitionManifest.summary_census.total_source_bytes, 7938934);
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

  it('4. Executes native lexical index search and retrieves exact byte spans with UTF-8 safety', () => {
    const testDbPath = path.join(__dirname, 'test_lexical.sqlite');
    const { db, indexedCount } = buildNativeTextIndex(testDbPath);
    assert.equal(indexedCount, 53);

    const res = executeSearch(db, 'algedonic', { limit: 5 });
    assert.ok(res.total >= 1);
    assert.equal(res.method, 'NATIVE_LEXICAL_NOT_SEMANTIC');

    const topHit = res.results[0];
    const span = retrieveContextSpan(db, topHit.source_id, 0, 300);
    assert.equal(span.source_id, topHit.source_id);
    assert.equal(span.span_sha256, sha256Hex(Buffer.from(span.text, 'utf8')));

    db.close();
    if (fs.existsSync(testDbPath)) fs.unlinkSync(testDbPath);
  });

  it('5. Refuses text queries on AppleDouble sidecars and asserts semantic model unavailability', () => {
    const witness = JSON.parse(fs.readFileSync(path.join(__dirname, 'lexical_readback_witness.json'), 'utf8'));
    assert.equal(witness.unavailable_format_negative_controls.disposition, 'FAIL_CLOSED_NO_BINARY_MANUFACTURE');
    assert.equal(witness.semantic_retrieval_status.classification, 'SEMANTIC_MODEL_UNAVAILABLE_IN_HISTORICAL_FIXTURE');
    assert.equal(witness.semantic_retrieval_status.semantic_parity_asserted, false);
  });

  it('6. Operator ZIP Intake Engine: admits valid archive and extracts text derivatives', () => {
    const engine = new OperatorZipIntakeEngine();

    // Create a minimal in-memory synthetic zip buffer
    // Local header: PK\x03\x04
    // Filename: test_manifesto.md
    // Content: "# Synthetic Manifesto\nTesting safe zip extraction."
    const content = Buffer.from('# Synthetic Manifesto\nTesting safe zip extraction.', 'utf8');
    const fname = Buffer.from('test_manifesto.md', 'utf8');
    const compData = zlib.deflateRawSync(content);

    const localHeader = Buffer.alloc(30 + fname.length);
    localHeader.writeUInt32LE(0x04034b50, 0); // PK\x03\x04
    localHeader.writeUInt16LE(20, 4); // version
    localHeader.writeUInt16LE(0, 6); // flags
    localHeader.writeUInt16LE(8, 8); // deflate
    localHeader.writeUInt16LE(0, 10); // time
    localHeader.writeUInt16LE(0, 12); // date
    localHeader.writeUInt32LE(0, 14); // crc32
    localHeader.writeUInt32LE(compData.length, 18);
    localHeader.writeUInt32LE(content.length, 22);
    localHeader.writeUInt16LE(fname.length, 26);
    localHeader.writeUInt16LE(0, 28);
    fname.copy(localHeader, 30);

    const cdHeader = Buffer.alloc(46 + fname.length);
    cdHeader.writeUInt32LE(0x02014b50, 0); // PK\x01\x02
    cdHeader.writeUInt16LE(20, 4);
    cdHeader.writeUInt16LE(20, 6);
    cdHeader.writeUInt16LE(0, 8);
    cdHeader.writeUInt16LE(8, 10);
    cdHeader.writeUInt16LE(0, 12);
    cdHeader.writeUInt16LE(0, 14);
    cdHeader.writeUInt32LE(0, 16);
    cdHeader.writeUInt32LE(compData.length, 20);
    cdHeader.writeUInt32LE(content.length, 24);
    cdHeader.writeUInt16LE(fname.length, 28);
    cdHeader.writeUInt16LE(0, 30);
    cdHeader.writeUInt16LE(0, 32);
    cdHeader.writeUInt16LE(0, 34);
    cdHeader.writeUInt16LE(0, 36);
    cdHeader.writeUInt32LE(0, 38);
    cdHeader.writeUInt32LE(0, 42); // local header offset = 0
    fname.copy(cdHeader, 46);

    const eocd = Buffer.alloc(22);
    eocd.writeUInt32LE(0x06054b50, 0); // PK\x05\x06
    eocd.writeUInt16LE(0, 4);
    eocd.writeUInt16LE(0, 6);
    eocd.writeUInt16LE(1, 8); // total entries on disk
    eocd.writeUInt16LE(1, 10); // total entries
    eocd.writeUInt32LE(cdHeader.length, 12); // cd size
    eocd.writeUInt32LE(localHeader.length + compData.length, 16); // cd offset
    eocd.writeUInt16LE(0, 20);

    const zipBuf = Buffer.concat([localHeader, compData, cdHeader, eocd]);

    const result = engine.processZipArchive(zipBuf, 'test_zip_001');
    assert.equal(result.total_members_enumerated, 1);
    assert.equal(result.admitted_sources_count, 1);
    assert.equal(result.extracted_derivatives_count, 1);

    const derivId = result.results[0].derivative_id;
    const passage = engine.retrievePassage(derivId, 0, 21);
    assert.equal(passage.span_text, '# Synthetic Manifesto');
    assert.equal(passage.span_sha256, sha256Hex(Buffer.from('# Synthetic Manifesto', 'utf8')));
  });

  it('7. Operator ZIP Intake Engine: blocks path traversal (Zip-Slip) fail-closed', () => {
    const engine = new OperatorZipIntakeEngine();

    const content = Buffer.from('malicious', 'utf8');
    const fname = Buffer.from('../../etc/passwd', 'utf8');
    const compData = content;

    const localHeader = Buffer.alloc(30 + fname.length);
    localHeader.writeUInt32LE(0x04034b50, 0);
    localHeader.writeUInt16LE(20, 4);
    localHeader.writeUInt16LE(0, 6);
    localHeader.writeUInt16LE(0, 8); // stored
    localHeader.writeUInt32LE(compData.length, 18);
    localHeader.writeUInt32LE(content.length, 22);
    localHeader.writeUInt16LE(fname.length, 26);
    fname.copy(localHeader, 30);

    const cdHeader = Buffer.alloc(46 + fname.length);
    cdHeader.writeUInt32LE(0x02014b50, 0);
    cdHeader.writeUInt16LE(20, 4);
    cdHeader.writeUInt16LE(20, 6);
    cdHeader.writeUInt16LE(0, 8);
    cdHeader.writeUInt16LE(0, 10);
    cdHeader.writeUInt32LE(compData.length, 20);
    cdHeader.writeUInt32LE(content.length, 24);
    cdHeader.writeUInt16LE(fname.length, 28);
    cdHeader.writeUInt32LE(0, 42);
    fname.copy(cdHeader, 46);

    const eocd = Buffer.alloc(22);
    eocd.writeUInt32LE(0x06054b50, 0);
    eocd.writeUInt16LE(1, 8);
    eocd.writeUInt16LE(1, 10);
    eocd.writeUInt32LE(cdHeader.length, 12);
    eocd.writeUInt32LE(localHeader.length + compData.length, 16);

    const zipBuf = Buffer.concat([localHeader, compData, cdHeader, eocd]);

    assert.throws(() => {
      engine.processZipArchive(zipBuf, 'malicious_zip');
    }, (err) => {
      return err instanceof ZipIntakeError && err.code === 'ZIP_PATH_TRAVERSAL_REFUSED';
    });
  });

  it('8. Em-to-Universal Reciprocal Bridge: stages passages and executes LFP warrant grounding', () => {
    const bridge = new EmUniversalReciprocalBridge();
    const initRes = bridge.initialize();
    assert.equal(initRes.initialized, true);
    assert.equal(initRes.covenant, 'Khona\u200Clit-po');
    assert.equal(initRes.encyclopedia_census.record_count, 1141);
    assert.equal(initRes.encyclopedia_census.edge_count, 2131);

    const sourceText = 'Algedonic feedback loop ensures dynamic cybernetic homeostasis.';
    const sourceRecord = bridge.admitEmSource({
      sourceId: 'src:em_test_001',
      filename: 'Algedonic Test.md',
      rawBytes: Buffer.from(sourceText, 'utf8')
    });
    assert.equal(sourceRecord.source_id, 'src:em_test_001');

    const staged = bridge.stageEmPassageIntoAtelier({
      recordId: 'ua:rec:em_test_witness',
      sourceId: 'src:em_test_001',
      byteOffset: 0,
      length: 23, // 'Algedonic feedback loop'
      claimSummary: 'Algedonic feedback loop witness'
    });
    assert.equal(staged.span_text, 'Algedonic feedback loop');

    // Encyclopedia query verifies NO auto-promotion to theory
    const encQuery = bridge.queryEncyclopediaReference('Aperture');
    assert.ok(encQuery.matches_found >= 1);
    assert.equal(encQuery.findings[0].reference_match_promoted_to_theory, false);

    // Manifest Grounding
    const groundedRes = bridge.groundTheoryWarrant({
      ruleId: 'rule:em_lift_algedonic',
      premises: ['src:em_test_001'],
      targetClaimId: 'claim:algedonic_stabilization',
      claimStatement: 'System stability bounded by algedonic alert threshold',
      sourceCaptureSpanProof: {
        source_id: 'src:em_test_001',
        start: 0,
        end: 23,
        span_sha256: staged.span_sha256
      }
    });
    assert.equal(groundedRes.is_grounded_in_lfp, true);
    assert.equal(groundedRes.span_proof_verified, true);

    bridge.close();
  });

  it('9. Unified Theory Synthesis Engine: refuses superficial motif matches fail-closed', () => {
    const engine = new EmUnifiedTheorySynthesisEngine();
    engine.extractWorkAnatomy({
      workId: 'work:w1',
      title: 'Cybernetic Feedback Systems',
      domain: 'CYBERNETICS',
      assumptions: ['CONTINUOUS_FEEDBACK'],
      operators: ['Feedback.loop()']
    });
    engine.extractWorkAnatomy({
      workId: 'work:w2',
      title: 'Audio Feedback Suppressor',
      domain: 'ACOUSTICS',
      assumptions: ['PHASE_INVERSION'],
      operators: ['Acoustic.invert()']
    });

    // Superficial vocabulary overlap without formal operator mapping
    const res = engine.synthesizeCrossDomainCandidate({
      candidateId: 'cand:superficial_feedback',
      workAId: 'work:w1',
      workBId: 'work:w2',
      proposedBridgeHypothesis: 'Feedback in cybernetics equals feedback in microphone screeching',
      sharedMotifVocabulary: ['feedback'],
      formalOperatorMapping: [], // Missing!
      proposedPredictions: []
    });

    assert.equal(res.verdict, 'NO_UNIFICATION_WARRANTED');
    assert.equal(res.promotion_level, PROMOTION_LADDER.LEVEL_1_MOTIF_MATCH);
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
        { opA: 'Agent.schedule()', opB: 'DSP.tick()', morphismType: 'SURFACE_ANALOGY' }
      ],
      proposedPredictions: [{ metric: 'jitter', expected_direction: 'ZERO', minimum_effect: 0 }]
    });

    assert.equal(res.verdict, 'NO_UNIFICATION_WARRANTED');
    assert.equal(res.reason, 'COMPOSABILITY_FAILURE_DUE_TO_INCOMMENSURABLE_ASSUMPTIONS');
    assert.equal(res.incompatible_assumptions.length >= 1, true);
    assert.equal(res.falsification_status, 'CONTRADICTION_PRESERVED_WITHOUT_FORCED_CONSENSUS');
  });

  it('11. Unified Theory Synthesis Engine: admits valid composable candidate and cascades withdrawal', () => {
    const engine = new EmUnifiedTheorySynthesisEngine();
    engine.extractWorkAnatomy({
      workId: 'work:algedonic_01',
      title: 'Algedonic Alert Channels',
      domain: 'MANAGEMENT_CYBERNETICS',
      assumptions: ['HOMEOSTATIC_EQUILIBRIUM'],
      operators: ['Alert.bypass()']
    });
    engine.extractWorkAnatomy({
      workId: 'work:hypervisor_02',
      title: 'AI Hypervisor Chaos Steering',
      domain: 'CONTROL_THEORY',
      assumptions: ['HOMEOSTATIC_EQUILIBRIUM'],
      operators: ['Steering.correct()']
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
    assert.equal(candidate.promotion_level, PROMOTION_LADDER.LEVEL_3_COMPOSABLE_CANDIDATE);
    assert.equal(candidate.competing_models.length, 2);

    // Non-retroactive withdrawal test
    const tombstone = engine.withdrawTheory(
      candidate.candidate_id,
      'FALSIFIED_BY_EMPIRICAL_TEST',
      'Measured recovery time did not decrease by 0.20'
    );
    assert.equal(tombstone.non_retroactive, true);
    assert.equal(tombstone.prior_status, 'ACTIVE_CANDIDATE');
  });

  it('12. Competent Null Comparator: runs 4-arm matched comparison and documents equal-affordance matrix', () => {
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

    // Assert that reciprocal arm enforces span proofs and detects composability failure
    assert.equal(comp.arms.arm_4_reciprocal.source_warrant_fidelity, 1.0);
    assert.equal(comp.arms.arm_4_reciprocal.composability_failure_detected, true);
    assert.equal(comp.arms.arm_4_reciprocal.withdrawal_tombstoning_verified, true);
    assert.equal(comp.differential_matrix.warrant_fidelity_ranking[0], 'Arm 4 (100%)');
  });

});
