import test from 'node:test';
import assert from 'node:assert/strict';
import {
  auditTemporalLedgerNonRetroactivity,
  auditServiceJourneyChronology,
  runTemporalCustodianAudit,
  TEMPORAL_CUSTODIAN_CLAIM_CEILING
} from '../app/engine/dollhouse-temporal-custodian.js';
import { getDollhouseAgent, listDollhouseAgents } from '../app/engine/dollhouse-agent-registry.js';
import { auditClaimCeilingRegistry } from '../app/engine/dollhouse-claim-ceilings.js';

test('Temporal Custodian: Valid monotonic ledger passes audit', () => {
  const entries = [
    {
      entry_id: 'ENT_01',
      t_sequence: 'SEQ_01',
      timestamp: '2026-10-06T00:00:00Z',
      state: 'STAGED',
      observation: 'Request staged cleanly',
      registered_event: 'EVT_STAGE',
      authority: 'OPERATOR',
      retroactive_rewrite_forbidden: true,
      later_reinterpretation_allowed: true
    },
    {
      entry_id: 'ENT_02',
      t_sequence: 'SEQ_02',
      timestamp: '2026-10-06T00:01:00Z',
      state: 'DISPATCHED',
      observation: 'Dispatched to provider',
      registered_event: 'EVT_DISPATCH',
      authority: 'SYSTEM',
      retroactive_rewrite_forbidden: true,
      later_reinterpretation_allowed: true
    }
  ];

  const report = auditTemporalLedgerNonRetroactivity(entries);
  assert.equal(report.is_valid, true);
  assert.equal(report.violations.length, 0);
  assert.equal(report.entry_count, 2);
});

test('Temporal Custodian: Historical entry deletion is detected and rejected', () => {
  const baseline = [
    {
      entry_id: 'ENT_01',
      t_sequence: 'SEQ_01',
      timestamp: '2026-10-06T00:00:00Z',
      state: 'STAGED',
      observation: 'Request staged cleanly',
      registered_event: 'EVT_STAGE',
      authority: 'OPERATOR',
      retroactive_rewrite_forbidden: true,
      later_reinterpretation_allowed: true
    },
    {
      entry_id: 'ENT_02',
      t_sequence: 'SEQ_02',
      timestamp: '2026-10-06T00:01:00Z',
      state: 'DISPATCHED',
      observation: 'Dispatched to provider',
      registered_event: 'EVT_DISPATCH',
      authority: 'SYSTEM',
      retroactive_rewrite_forbidden: true,
      later_reinterpretation_allowed: true
    }
  ];

  const mutated = [baseline[1]]; // ENT_01 deleted

  const report = auditTemporalLedgerNonRetroactivity(mutated, baseline);
  assert.equal(report.is_valid, false);
  const violation = report.violations.find(v => v.type === 'HISTORICAL_ENTRY_DELETED');
  assert.ok(violation);
  assert.equal(violation.entry_id, 'ENT_01');
});

test('Temporal Custodian: Retroactive mutation of core fields is detected and rejected', () => {
  const baseline = [
    {
      entry_id: 'ENT_01',
      t_sequence: 'SEQ_01',
      timestamp: '2026-10-06T00:00:00Z',
      state: 'INITIAL_UNVERIFIED',
      observation: 'Initial observation without verification',
      registered_event: 'EVT_INIT',
      authority: 'SYSTEM',
      retroactive_rewrite_forbidden: true,
      later_reinterpretation_allowed: true
    }
  ];

  const mutated = [
    {
      entry_id: 'ENT_01',
      t_sequence: 'SEQ_01',
      timestamp: '2026-10-06T00:00:00Z',
      state: 'VERIFIED_COMPLETE', // Retroactively updated
      observation: 'Retroactively upgraded observation',
      registered_event: 'EVT_INIT',
      authority: 'SYSTEM',
      retroactive_rewrite_forbidden: true,
      later_reinterpretation_allowed: true
    }
  ];

  const report = auditTemporalLedgerNonRetroactivity(mutated, baseline);
  assert.equal(report.is_valid, false);
  const violation = report.violations.find(v => v.type === 'RETROACTIVE_HISTORICAL_MUTATION');
  assert.ok(violation);
  assert.equal(violation.field, 'state');
});

test('Temporal Custodian: Append-only valid amendment succeeds without mutating prior record', () => {
  const entries = [
    {
      entry_id: 'ENT_01',
      t_sequence: 'SEQ_01',
      timestamp: '2026-10-06T00:00:00Z',
      state: 'UNVERIFIED',
      observation: 'Observation at t1',
      registered_event: 'EVT_INIT',
      authority: 'SYSTEM',
      retroactive_rewrite_forbidden: true,
      later_reinterpretation_allowed: true,
      amendments: [
        {
          amendment_type: 'RECLASSIFICATION',
          appended_at: '2026-10-06T01:00:00Z',
          appended_by: 'AUDITOR',
          note: 'Reclassified following subsequent audit trace'
        }
      ]
    }
  ];

  const report = auditTemporalLedgerNonRetroactivity(entries);
  assert.equal(report.is_valid, true);
  assert.equal(report.violations.length, 0);
});

test('Temporal Custodian: Timestamp monotonicity inversion is caught', () => {
  const entries = [
    {
      entry_id: 'ENT_01',
      t_sequence: 'SEQ_01',
      timestamp: '2026-10-06T00:10:00Z',
      state: 'FIRST',
      observation: 'First event',
      registered_event: 'EVT_1',
      authority: 'SYSTEM',
      retroactive_rewrite_forbidden: true,
      later_reinterpretation_allowed: true
    },
    {
      entry_id: 'ENT_02',
      t_sequence: 'SEQ_02',
      timestamp: '2026-10-06T00:05:00Z', // Inverted timestamp
      state: 'SECOND',
      observation: 'Second event backwards in time',
      registered_event: 'EVT_2',
      authority: 'SYSTEM',
      retroactive_rewrite_forbidden: true,
      later_reinterpretation_allowed: true
    }
  ];

  const report = auditTemporalLedgerNonRetroactivity(entries);
  assert.equal(report.is_valid, false);
  const violation = report.violations.find(v => v.type === 'TEMPORAL_MONOTONICITY_INVERSION');
  assert.ok(violation);
});

test('Temporal Custodian: Local subsystem pass triggers whole-route veto when downstream fails', () => {
  const journeyPhases = {
    phase1_loom: { status: 'PASS' },
    phase2_setup: { status: 'PASS' },
    phase2_continuation: { status: 'FAIL' },
    phase3_return: { status: 'HELD' }
  };

  const audit = auditServiceJourneyChronology(journeyPhases);
  assert.equal(audit.veto_applied, true);
  assert.equal(audit.veto_authority, 'LOCAL_PASS_PLUS_GLOBAL_ROUTE_REGRESSION');
  assert.equal(audit.verdict, 'HELD');
  assert.ok(audit.rationale.includes('local component success cannot mask'));
});

test('Temporal Custodian: Adapter integrates with Dollhouse contract conventions', () => {
  const finding = runTemporalCustodianAudit({
    coordinate: 'return_state_divergence_and_held_c2',
    episode_id: 'ep_test_123',
    phases: {
      phase1: 'PASS',
      phase2: 'FAIL'
    }
  });

  assert.equal(finding.agent, 'TEMPORAL_CUSTODIAN');
  assert.equal(finding.status, 'BOUNDED_RESEARCH_CANDIDATE');
  assert.equal(finding.verdict, 'HELD');
  assert.equal(finding.claim_ceiling, TEMPORAL_CUSTODIAN_CLAIM_CEILING);
  assert.ok(finding.concern.includes('LOCAL_PASS_PLUS_GLOBAL_ROUTE_REGRESSION'));
});

test('Temporal Custodian: Registry and Claim Ceiling parity verified', () => {
  const agent = getDollhouseAgent('TEMPORAL_CUSTODIAN');
  assert.ok(agent, 'TEMPORAL_CUSTODIAN must be present in registry');
  assert.equal(agent.status, 'BOUNDED_RESEARCH_CANDIDATE');
  assert.equal(agent.authority_ceiling, TEMPORAL_CUSTODIAN_CLAIM_CEILING);

  const baseAgents = listDollhouseAgents();
  assert.equal(baseAgents.length, 4, 'Must contain 4 base registered Dollhouse agents');

  const allAgents = listDollhouseAgents({ includeCandidates: true });
  assert.equal(allAgents.length, 5, 'Must contain 5 registered Dollhouse agents when including candidates');

  const observatory = auditClaimCeilingRegistry();
  const firstEntry = observatory.entries[0];
  const tcFinding = firstEntry.findings.find(f => f.role === 'TEMPORAL_CUSTODIAN');
  assert.ok(tcFinding, 'TEMPORAL_CUSTODIAN must be present in claim ceiling findings');
  assert.ok(tcFinding.question.includes('Does later evidence'));
});
