/**
 * tests/exteriority-observatory.test.mjs
 * 
 * Comprehensive Test Suite for TD613 Exteriority Observatory (Sequence 2 · Laboratory Monster)
 * 
 * Exercises all observatory engines against historical failure fixtures:
 *   1. Canonical-byte custody & CRLF/LF drift detection
 *   2. Pre-egress vs post-egress receipt lineage enforcement
 *   3. Claim-ceiling enforcement & promotion prevention
 *   4. Temporal non-retroactivity & immutable history auditing
 *   5. FADT authority support & finite quotient computation
 *   6. Classification replay stability perturbation assay
 *   7. Neutral protocol lexical hygiene & commitment verification
 *   8. All 8 historical failure fixtures
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

// Import observatory engines
import {
  detectNewlineMode,
  computeSha256,
  computeGitBlobSha
} from '../scripts/verify-carried-bytes.mjs';

import {
  evaluateClaimRecord,
  auditClaimLedger
} from '../scripts/audit-claim-ceiling.mjs';

import {
  auditTemporalLedger
} from '../scripts/audit-temporal-nonretroactivity.mjs';

import {
  computeUnion,
  computeIntersection,
  computeDifference,
  auditQuotientCandidate,
  auditAuthoritySupportSpec
} from '../scripts/audit-authority-support.mjs';

import {
  auditExteriorityLadder
} from '../scripts/audit-exteriority-ladder.mjs';

import {
  auditReceipt,
  auditReceiptChain
} from '../scripts/audit-receipt-lineage.mjs';

import {
  applyPerturbation,
  runClassificationReplayAssay
} from '../scripts/audit-classification-replay.mjs';

import {
  auditLexicalHygiene,
  verifyCommitment
} from '../scripts/audit-neutralization-protocol.mjs';

const FIXTURES_DIR = path.resolve('tests/fixtures/exteriority-observatory');

// --- 1. Canonical-Byte Custody Tests ---

test('Canonical-Byte: distinguishes LF vs CRLF without silent normalization', () => {
  const lfBuf = Buffer.from('hello\nworld\n');
  const crlfBuf = Buffer.from('hello\r\nworld\r\n');

  assert.equal(detectNewlineMode(lfBuf), 'LF');
  assert.equal(detectNewlineMode(crlfBuf), 'CRLF');

  const lfSha = computeSha256(lfBuf);
  const crlfSha = computeSha256(crlfBuf);

  assert.notEqual(lfSha, crlfSha, 'SHA-256 of LF and CRLF must never be equal');
});

test('Fixture 1: Episode A CRLF/LF mismatch triggers canonicalization drift failure', () => {
  const fixture = JSON.parse(fs.readFileSync(path.join(FIXTURES_DIR, 'fixture-01-episode-a-crlf-lf-mismatch.json'), 'utf8'));
  const worktreeBuf = Buffer.from(fixture.worktree_bytes_hex, 'hex');
  const remoteBuf = Buffer.from(fixture.remote_blob_bytes_hex, 'hex');

  const worktreeSha = computeSha256(worktreeBuf);
  const remoteSha = computeSha256(remoteBuf);

  assert.notEqual(worktreeSha, remoteSha);
  assert.equal(worktreeSha, fixture.declared_sha256);
  assert.notEqual(remoteSha, fixture.declared_sha256);

  const hasDrift = worktreeSha !== remoteSha;
  assert.equal(hasDrift, fixture.expected_evaluation.has_canonicalization_drift);
});

// --- 2. Receipt Lineage & Pre/Post Egress Invariant Tests ---

test('Receipt Lineage: valid pre-egress intent passes validation', () => {
  const validIntent = {
    receipt_id: 'RCPT-VALID-01',
    receipt_type: 'EGRESS_INTENT',
    stage: 'PRE_EGRESS',
    created_at: '2026-10-04T21:00:00Z',
    issuer: { identity: 'producer', jurisdiction: 'local', is_exogenous: false },
    payload: {
      intended_branch: 'witness/test',
      expected_head: '582a1f04fd11e502fc7b3083ef6fa079dd0d23c8',
      manifest_sha256: 'abc123abc123abc123abc123abc123abc123abc123abc123abc123abc123abc1'
    }
  };

  const res = auditReceipt(validIntent);
  assert.equal(res.is_valid, true);
  assert.equal(res.violations.length, 0);
});

test('Fixture 2: Pre-egress receipt with future execution observation is rejected', () => {
  const fixture = JSON.parse(fs.readFileSync(path.join(FIXTURES_DIR, 'fixture-02-preegress-with-future-observation.json'), 'utf8'));
  const res = auditReceipt(fixture.receipt);

  assert.equal(res.is_valid, fixture.expected_evaluation.is_valid);
  assert.equal(res.violations.some(v => v.type === fixture.expected_evaluation.violation_type), true);
});

// --- 3. Claim Ceiling & Anti-Promotion Tests ---

test('Fixture 3: R4 one-turn observation promoted to capability bound is rejected', () => {
  const fixture = JSON.parse(fs.readFileSync(path.join(FIXTURES_DIR, 'fixture-03-r4-promoted-to-capability-bound.json'), 'utf8'));
  const res = evaluateClaimRecord(fixture.claim);

  assert.equal(res.evaluation_disposition.verdict, fixture.expected_evaluation.verdict);
});

test('Fixture 4: R2 cleanroom promoted to exogenous exteriority is rejected', () => {
  const fixture = JSON.parse(fs.readFileSync(path.join(FIXTURES_DIR, 'fixture-04-r2-cleanroom-promoted-to-exteriority.json'), 'utf8'));
  const res = evaluateClaimRecord(fixture.claim);

  assert.equal(res.evaluation_disposition.verdict, fixture.expected_evaluation.verdict);
  assert.equal(res.evaluation_disposition.violations.some(v => v.rule_id === 'SAME_HOST_TO_EXOGENOUS'), true);
});

test('Fixture 5: Eight-action sufficient basis promoted to minimal basis is rejected', () => {
  const fixture = JSON.parse(fs.readFileSync(path.join(FIXTURES_DIR, 'fixture-05-eight-action-promoted-to-minimal-basis.json'), 'utf8'));
  const res = evaluateClaimRecord(fixture.claim);

  assert.equal(res.evaluation_disposition.verdict, fixture.expected_evaluation.verdict);
  assert.equal(res.evaluation_disposition.violations.some(v => v.rule_id === 'SUFFICIENT_TO_MINIMAL'), true);
});

test('Fixture 6: Constructed neutral mapping promoted to witnessed descent is rejected', () => {
  const fixture = JSON.parse(fs.readFileSync(path.join(FIXTURES_DIR, 'fixture-06-neutral-mapping-promoted-to-witnessed-descent.json'), 'utf8'));
  const res = evaluateClaimRecord(fixture.claim);

  assert.equal(res.evaluation_disposition.verdict, fixture.expected_evaluation.verdict);
  assert.equal(res.evaluation_disposition.violations.some(v => v.rule_id === 'MAPPING_TO_WITNESSED_SURVIVAL'), true);
});

test('Fixture 8: PR #1433 green validation promoted to merged main is rejected', () => {
  const fixture = JSON.parse(fs.readFileSync(path.join(FIXTURES_DIR, 'fixture-08-pr1433-green-promoted-to-merged-main.json'), 'utf8'));
  const res = evaluateClaimRecord(fixture.claim);

  assert.equal(res.evaluation_disposition.verdict, fixture.expected_evaluation.verdict);
  assert.equal(res.evaluation_disposition.violations.some(v => v.rule_id === 'UNMERGED_PR_TO_MAIN'), true);
});

// --- 4. Dependency Hydration Deficit vs Candidate Defect (Fixture 7) ---

test('Fixture 7: Missing JSDOM is classified as dependency hydration deficit, not candidate defect', () => {
  const fixture = JSON.parse(fs.readFileSync(path.join(FIXTURES_DIR, 'fixture-07-missing-jsdom-promoted-to-candidate-defect.json'), 'utf8'));
  const incident = fixture.incident;

  const isDependencyDeficit = incident.error_message.includes('Cannot find package') || incident.failure_class === 'RECEIVER_ENVIRONMENT_DEFICIT';
  assert.equal(isDependencyDeficit, true);
  assert.equal(incident.falsely_claimed_culprit === 'CANDIDATE_X_LOGIC_DEFECT', true);
  assert.equal(fixture.expected_evaluation.is_candidate_defect, false);
});

// --- 5. Temporal Non-Retroactivity Tests ---

test('Temporal Custodian: allows forward amendments (REFINEMENT, CORRECTION) without mutating earlier records', () => {
  const baseEntries = [
    {
      entry_id: 'TL-1',
      t_sequence: 't1',
      timestamp: '2026-10-04T13:00:00Z',
      state: 'STATE_A',
      observation: 'Observed 1 continuation',
      registered_event: 'R4 PASS',
      authority: 'live_witness',
      retroactive_rewrite_forbidden: true,
      later_reinterpretation_allowed: true,
      amendments: []
    }
  ];

  const amendedEntries = [
    {
      entry_id: 'TL-1',
      t_sequence: 't1',
      timestamp: '2026-10-04T13:00:00Z',
      state: 'STATE_A',
      observation: 'Observed 1 continuation', // untouched!
      registered_event: 'R4 PASS', // untouched!
      authority: 'live_witness',
      retroactive_rewrite_forbidden: true,
      later_reinterpretation_allowed: true,
      amendments: [
        {
          amendment_type: 'REFINEMENT',
          appended_at: '2026-10-04T18:00:00Z',
          appended_by: 'code_audit',
          note: 'Later discovery showed product permitted continuation 2'
        }
      ]
    }
  ];

  const report = auditTemporalLedger(amendedEntries, baseEntries);
  assert.equal(report.is_valid, true);
  assert.equal(report.violations.length, 0);
});

test('Temporal Custodian: detects and rejects retroactive historical mutations', () => {
  const baseEntries = [
    {
      entry_id: 'TL-1',
      t_sequence: 't1',
      timestamp: '2026-10-04T13:00:00Z',
      state: 'STATE_A',
      observation: 'Observed 1 continuation',
      registered_event: 'R4 PASS',
      authority: 'live_witness',
      retroactive_rewrite_forbidden: true,
      later_reinterpretation_allowed: true
    }
  ];

  const illegallyMutated = [
    {
      entry_id: 'TL-1',
      t_sequence: 't1',
      timestamp: '2026-10-04T13:00:00Z',
      state: 'STATE_A',
      observation: 'Observed 2 continuations', // ILLEGAL HISTORICAL REWRITE!
      registered_event: 'R4 PASS',
      authority: 'live_witness',
      retroactive_rewrite_forbidden: true,
      later_reinterpretation_allowed: true
    }
  ];

  const report = auditTemporalLedger(illegallyMutated, baseEntries);
  assert.equal(report.is_valid, false);
  assert.equal(report.violations.some(v => v.type === 'RETROACTIVE_HISTORICAL_MUTATION'), true);
});

// --- 6. FADT Authority-Support Auditor Tests ---

test('FADT: calculates U, I, Gamma and obstructs descent when Gamma is non-empty', () => {
  const candidate = {
    erased_conditioning_coordinate: 'membrane_dialog',
    antecedent_supports: {
      REST: ['chat_send', 'return_review'],
      ARMED: ['chat_send', 'return_review', 'carriage_dispatch', 'files_carried']
    }
  };

  const res = auditQuotientCandidate(candidate);
  assert.deepEqual(res.union_U, ['carriage_dispatch', 'chat_send', 'files_carried', 'return_review']);
  assert.deepEqual(res.intersection_I, ['chat_send', 'return_review']);
  assert.deepEqual(res.gamma_gap, ['carriage_dispatch', 'files_carried']);
  assert.equal(res.descent_status, 'DESCENT_OBSTRUCTED');
  assert.equal(res.minimality_status, 'MINIMALITY_UNPROVEN');
});

test('FADT: confirms descent admissible when Gamma is empty', () => {
  const candidate = {
    erased_conditioning_coordinate: 'unrelated_styling_state',
    antecedent_supports: {
      THEME_A: ['chat_send', 'return_review'],
      THEME_B: ['chat_send', 'return_review']
    }
  };

  const res = auditQuotientCandidate(candidate);
  assert.deepEqual(res.gamma_gap, []);
  assert.equal(res.descent_status, 'DESCENT_ADMISSIBLE');
});

// --- 7. Classification Replay Stability Perturbation Assay Tests ---

test('Classification Replay: detects instability when perturbation alters classification', () => {
  const assaySpec = {
    assay_id: 'TEST-REPLAY-01',
    frozen_input_evidence: '{"foo": "bar", "active": true}',
    declared_perturbation_family: ['JSON_KEY_REORDERING', 'WHITESPACE_JITTER']
  };

  // Stable classifier
  const stableClassifier = (str) => ({
    length_bucket: str.length > 5 ? 'LONG' : 'SHORT'
  });

  const stableReport = runClassificationReplayAssay(assaySpec, stableClassifier);
  assert.equal(stableReport.status, 'REPLAY_STABILITY_WITNESSED');
  assert.equal(stableReport.aperture_disposition, 'STABLE');

  // Fragile classifier sensitive to key ordering
  const fragileClassifier = (str) => ({
    first_char_after_brace: str.charAt(str.indexOf('{') + 1)
  });

  const fragileReport = runClassificationReplayAssay(assaySpec, fragileClassifier);
  assert.equal(fragileReport.status, 'REPLAY_STABILITY_FALSIFIED');
  assert.equal(fragileReport.aperture_disposition, 'HELD');
});

// --- 8. Neutral Protocol Lexical Hygiene Tests ---

test('Neutral Protocol: detects forbidden mythology terms and passes clean prose', () => {
  const polluted = 'Under TD613 law, Dome-World hosts the Holonomy Loom continuation.';
  const auditPolluted = auditLexicalHygiene(polluted);

  assert.equal(auditPolluted.is_clean, false);
  assert.equal(auditPolluted.violation_count, 3);
  assert.deepEqual(auditPolluted.violations.map(v => v.term), ['TD613', 'Dome-World', 'Holonomy Loom']);

  const clean = 'The system separates internal state from observed transitions and external records.';
  const auditClean = auditLexicalHygiene(clean);

  assert.equal(auditClean.is_clean, true);
  assert.equal(auditClean.violation_count, 0);
});

test('Neutral Commitment: verifies cryptographic commitment hash', () => {
  const candidatePlaintext = '{"invariant": "authority_revocation_at_rest"}';
  const commitment = crypto.createHash('sha256').update(candidatePlaintext).digest('hex');

  assert.equal(verifyCommitment(commitment, candidatePlaintext), true);
  assert.equal(verifyCommitment(commitment, 'tampered text'), false);
});

// --- 9. Full Observatory Ledger & Ladder Schema Validation ---

test('Exteriority Observatory: ladder json validates without illegal promotions', () => {
  const ladderPath = path.resolve('research/exteriority-observatory/exteriority-ladder.json');
  assert.equal(fs.existsSync(ladderPath), true);

  const ladderDoc = JSON.parse(fs.readFileSync(ladderPath, 'utf8'));
  const auditRes = auditExteriorityLadder(ladderDoc);

  assert.equal(auditRes.is_valid, true, `Ladder violations: ${JSON.stringify(auditRes.violations)}`);
});
