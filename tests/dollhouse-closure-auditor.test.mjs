import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { auditDollhouseClosure, CLOSURE_AUDIT_SCHEMA } from '../app/engine/dollhouse-closure-auditor.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test('Dollhouse Closure Auditor: rejects overclaiming fixture (CLOSURE = REJECTED)', () => {
  // Construct an overclaiming synthetic fixture
  const overclaimingReport = {
    verdict: 'COMPLETED',
    stages: [
      { name: '06_continuation2_dispatch', summary: { status: 'NO_NETWORK_RESPONSE', body: null } },
      { name: '07_loom_return', summary: { returnWorkspaceVisible: false, journeyState: 'marrowline' } }
    ],
    predecessor_proof: {
      predecessor_binding_verified: false
    },
    provider_classification: null
  };

  const badObservatory = {
    observers: {
      ATLAS: {
        observations: {
          phase2_marrowline: { status: 'PASS', evidence: 'Fabricated pass despite NO_NETWORK_RESPONSE' }
        }
      },
      APERTURE: {
        observations: {
          phase1_loom: { status: 'PASS', evidence: '20 far carriers have opacity 0.035' }
        }
      }
    }
  };

  const badLedger = {
    disagreements: [
      {
        coordinate: 'governor_lifecycle_leak_in_error_branch',
        orchestrator_decision: 'ACKNOWLEDGE_AND_RECORD',
        rationale: 'Stale claim that cleanup is still needed in next maintenance patch'
      }
    ]
  };

  const result = auditDollhouseClosure({
    closureReport: overclaimingReport,
    episodeObservatory: badObservatory,
    disagreementLedger: badLedger,
    currentSourceMetrics: { farCarrierOpacity: 0.20, governorEarlyCatchCleaned: true }
  });

  assert.equal(result.schema, CLOSURE_AUDIT_SCHEMA);
  assert.equal(result.verdict, 'CLOSURE_REJECTED', 'Must reject closure when contradictions exist');
  assert.equal(result.passed, false);
  assert.ok(result.infraction_count >= 6, `Must detect multiple infractions (found ${result.infraction_count})`);

  const codes = result.infractions.map(i => i.code);
  assert.ok(codes.includes('ERR_C2_NO_NETWORK_OVERCLAIM'), 'Detects C2 NO_NETWORK_RESPONSE contradiction');
  assert.ok(codes.includes('ERR_PREDECESSOR_UNVERIFIED_OVERCLAIM'), 'Detects predecessor binding unverified');
  assert.ok(codes.includes('ERR_RETURN_WORKSPACE_NOT_ADMITTED'), 'Detects Return workspace not admitted');
  assert.ok(codes.includes('ERR_JOURNEY_STATE_NOT_RETURN'), 'Detects journeyState not return');
  assert.ok(codes.includes('ERR_PROVIDER_CLASSIFICATION_NULL'), 'Detects null provider classification');
  assert.ok(codes.includes('ERR_OBSERVATORY_CONTRADICTS_EPISODE_ATLAS'), 'Detects observatory contradicting episode payload');
  assert.ok(codes.includes('ERR_HISTORICAL_OPACITY_CONTAMINATION'), 'Detects 0.035 opacity as historical artifact');
  assert.ok(codes.includes('ERR_HISTORICAL_GOVERNOR_CONTAMINATION'), 'Detects already-repaired governor defect');
});

test('Dollhouse Closure Auditor: verifies committed episode fixtures evaluate to EVIDENCE_ALIGNED_HELD', () => {
  const closureReportPath = path.join(__dirname, '..', 'docs', 'receipts', '1428-closure-assay', 'closure-assay-report.json');
  const observatoryPath = path.join(__dirname, 'fixtures', 'dollhouse', 'episode-1428-x-observatory.json');
  const ledgerPath = path.join(__dirname, 'fixtures', 'dollhouse', 'disagreement-ledger-1428.json');

  const closureReport = JSON.parse(fs.readFileSync(closureReportPath, 'utf8'));
  const episodeObservatory = JSON.parse(fs.readFileSync(observatoryPath, 'utf8'));
  const disagreementLedger = JSON.parse(fs.readFileSync(ledgerPath, 'utf8'));

  const result = auditDollhouseClosure({
    closureReport,
    episodeObservatory,
    disagreementLedger,
    currentSourceMetrics: { farCarrierOpacity: 0.20, governorEarlyCatchCleaned: true }
  });

  assert.equal(result.verdict, 'EVIDENCE_ALIGNED_HELD', 'Must transition to EVIDENCE_ALIGNED_HELD when honest');
  assert.equal(result.passed, true);
  assert.equal(result.infraction_count, 0, `Expected 0 infractions, got: ${JSON.stringify(result.infractions)}`);
});

test('Dollhouse Closure Auditor: rejects harness defects (timeout mismatch, observer mutation, wrong digest)', () => {
  // Test harness defect 1: timeout ceiling < 225000ms
  const shortTimeoutReport = {
    verdict: 'HELD',
    environment: { witness_timeout_ms: 45000, product_client_timeout_ms: 225000 },
    stages: [],
    predecessor_proof: null
  };
  const res1 = auditDollhouseClosure({ closureReport: shortTimeoutReport });
  assert.equal(res1.passed, false);
  assert.ok(res1.infractions.some(i => i.code === 'ERR_WITNESS_TIMEOUT_BELOW_PRODUCT_TIMEOUT'),
    'Rejects assay with timeout ceiling lower than product timeout');

  // Test harness defect 2: observer mutated hash to manufacture Return
  const mutatedHashReport = {
    verdict: 'HELD',
    stages: [
      {
        name: '07_loom_return',
        summary: { returnWorkspaceVisible: false, observer_mutated_hash: true }
      }
    ],
    predecessor_proof: null
  };
  const res2 = auditDollhouseClosure({ closureReport: mutatedHashReport });
  assert.equal(res2.passed, false);
  assert.ok(res2.infractions.some(i => i.code === 'ERR_OBSERVER_MUTATED_RETURN_STATE'),
    'Rejects witness where observer mutated URL/hash to manufacture Return');

  // Test harness defect 3: predecessor verifier derived from request_digest instead of stage receipt digest
  const wrongDigestReport = {
    verdict: 'HELD',
    stages: [],
    predecessor_proof: {
      algorithm: 'request_digest',
      c1_receipt_digest_source: 'request_digest'
    }
  };
  const res3 = auditDollhouseClosure({ closureReport: wrongDigestReport });
  assert.equal(res3.passed, false);
  assert.ok(res3.infractions.some(i => i.code === 'ERR_PREDECESSOR_DIGEST_AIMED_AT_REQUEST_DIGEST'),
    'Rejects predecessor verifier derived from request_digest instead of stage receipt digest');
});

test('Dollhouse Closure Auditor: verifies R4 live production report evaluates to CLOSURE_ADMITTED', () => {
  const r4ReportPath = path.join(__dirname, '..', 'docs', 'receipts', '1428-closure-assay', 'closure-assay-report-r4.json');
  if (fs.existsSync(r4ReportPath)) {
    const r4Report = JSON.parse(fs.readFileSync(r4ReportPath, 'utf8'));
    const result = auditDollhouseClosure({
      closureReport: r4Report,
      currentSourceMetrics: { farCarrierOpacity: 0.20, governorEarlyCatchCleaned: true }
    });
    assert.equal(result.verdict, 'CLOSURE_ADMITTED', 'R4 live report must evaluate to CLOSURE_ADMITTED');
    assert.equal(result.passed, true);
    assert.equal(result.infraction_count, 0);
  }
});

