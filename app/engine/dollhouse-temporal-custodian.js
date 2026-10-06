/**
 * app/engine/dollhouse-temporal-custodian.js
 * 
 * TD613 Dollhouse Temporal Custodian Pure Adapter
 * 
 * Epistemic Jurisdiction: Chronology governance, non-retroactivity, preemption gap,
 * and whole-route overwatch.
 * 
 * Role Status: BOUNDED_RESEARCH_CANDIDATE
 */

const freeze = value => Object.freeze(value);

export const TEMPORAL_CUSTODIAN_CLAIM_CEILING = 
  'temporal-governance-and-whole-route-veto-only-no-retroactive-mutation-no-execution-authority-human-closure-required';

export const ALLOWED_AMENDMENT_TYPES = freeze(['CORRECTION', 'REFINEMENT', 'RECLASSIFICATION']);

export const CLOSURE_CLASSES = freeze({
  CLOSED: 'CLOSED',
  DRIFT: 'DRIFT',
  SUPPRESSED: 'SUPPRESSED',
  INEXPRESSIBLE_AT_TIME_T: 'INEXPRESSIBLE_AT_TIME_T'
});

/**
 * Pure audit of non-retroactive temporal ledgers.
 */
export function auditTemporalLedgerNonRetroactivity(entries, baselineEntries = null) {
  const violations = [];
  const validated = [];

  if (!Array.isArray(entries) || entries.length === 0) {
    return freeze({
      is_valid: false,
      violations: freeze(['Ledger entries must be a non-empty array.']),
      entry_count: 0
    });
  }

  // 1. Check against baseline snapshot if provided
  if (baselineEntries && Array.isArray(baselineEntries)) {
    for (const base of baselineEntries) {
      const curr = entries.find(e => e.entry_id === base.entry_id);
      if (!curr) {
        violations.push({
          type: 'HISTORICAL_ENTRY_DELETED',
          entry_id: base.entry_id,
          message: `Antecedent entry ${base.entry_id} was removed from ledger.`
        });
        continue;
      }
      const coreFields = ['t_sequence', 'timestamp', 'state', 'observation', 'registered_event', 'authority'];
      for (const field of coreFields) {
        if (JSON.stringify(base[field]) !== JSON.stringify(curr[field])) {
          violations.push({
            type: 'RETROACTIVE_HISTORICAL_MUTATION',
            entry_id: base.entry_id,
            field,
            original_value: base[field],
            mutated_value: curr[field],
            message: `Field '${field}' of entry ${base.entry_id} mutated retroactively. LATER_CLOSURE != EARLIER_KNOWLEDGE.`
          });
        }
      }
    }
  }

  // 2. Monotonicity and structure checks
  let prevTs = null;
  let prevSeq = -1;

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    if (!entry.entry_id || entry.t_sequence === undefined || !entry.timestamp || !entry.observation) {
      violations.push({
        type: 'MALFORMED_ENTRY',
        index: i,
        message: `Entry at index ${i} lacks required fields.`
      });
      continue;
    }

    if (entry.retroactive_rewrite_forbidden !== true) {
      violations.push({
        type: 'LAW_AFFIRMATION_MISSING',
        entry_id: entry.entry_id,
        message: `Entry ${entry.entry_id} must affirm retroactive_rewrite_forbidden: true.`
      });
    }

    const currentSeq = parseInt(String(entry.t_sequence).replace(/\D/g, ''), 10);
    if (!isNaN(currentSeq)) {
      if (currentSeq <= prevSeq) {
        violations.push({
          type: 'TEMPORAL_SEQUENCE_INVERSION',
          entry_id: entry.entry_id,
          message: `Sequence ${entry.t_sequence} is non-monotonic after ${prevSeq}.`
        });
      }
      prevSeq = currentSeq;
    }

    const currentTs = new Date(entry.timestamp).getTime();
    if (!isNaN(currentTs)) {
      if (prevTs !== null && currentTs < prevTs) {
        violations.push({
          type: 'TEMPORAL_MONOTONICITY_INVERSION',
          entry_id: entry.entry_id,
          message: `Timestamp ${entry.timestamp} moves backwards in time.`
        });
      }
      prevTs = currentTs;
    }

    if (entry.amendments && Array.isArray(entry.amendments)) {
      for (const amd of entry.amendments) {
        if (!ALLOWED_AMENDMENT_TYPES.includes(amd.amendment_type)) {
          violations.push({
            type: 'INVALID_AMENDMENT_TYPE',
            entry_id: entry.entry_id,
            amendment_type: amd.amendment_type,
            message: `Invalid amendment type '${amd.amendment_type}'.`
          });
        }
      }
    }

    validated.push(entry.entry_id);
  }

  return freeze({
    is_valid: violations.length === 0,
    entry_count: entries.length,
    validated_entries: freeze(validated),
    violations: freeze(violations)
  });
}

/**
 * Pure evaluation of end-to-end service journey chronology.
 */
export function auditServiceJourneyChronology(phases) {
  if (!phases || typeof phases !== 'object') {
    throw new TypeError('phases object required');
  }

  const phaseEntries = Object.entries(phases);
  let hasEarlyPass = false;
  let hasDownstreamFailure = false;
  let vetoApplied = false;
  const evaluations = {};

  for (let idx = 0; idx < phaseEntries.length; idx++) {
    const [phaseKey, phaseData] = phaseEntries[idx];
    const status = typeof phaseData === 'string' ? phaseData : phaseData.status;

    evaluations[phaseKey] = status;

    if (status === 'PASS') {
      if (idx < phaseEntries.length - 1) {
        hasEarlyPass = true;
      }
    } else if (status === 'FAIL' || status === 'HELD' || status === 'FAILED_OR_HELD') {
      if (hasEarlyPass) {
        hasDownstreamFailure = true;
      }
    }
  }

  if (hasEarlyPass && hasDownstreamFailure) {
    vetoApplied = true;
  }

  return freeze({
    veto_applied: vetoApplied,
    veto_authority: vetoApplied ? 'LOCAL_PASS_PLUS_GLOBAL_ROUTE_REGRESSION' : null,
    verdict: vetoApplied ? 'HELD' : (hasDownstreamFailure ? 'HELD' : 'PASS'),
    evaluations: freeze(evaluations),
    rationale: vetoApplied 
      ? 'Temporal Custodian vetoes completion: local component success cannot mask downstream route failure or abandonment.'
      : 'Chronological progression verified without whole-route regression.'
  });
}

/**
 * Primary Dollhouse Operational Adapter for Temporal Custodian.
 */
export function runTemporalCustodianAudit(input) {
  if (!input || typeof input !== 'object') {
    throw new TypeError('input object required');
  }

  const { coordinate, episode_id, phases, ledger_entries, baseline_entries } = input;

  let ledgerAudit = null;
  if (ledger_entries) {
    ledgerAudit = auditTemporalLedgerNonRetroactivity(ledger_entries, baseline_entries);
  }

  let journeyAudit = null;
  if (phases) {
    journeyAudit = auditServiceJourneyChronology(phases);
  }

  let verdict = 'PASS';
  let concern = 'None. Chronology is monotonic and whole-route continuity is intact.';
  let falsifier = 'Inject retroactive historical mutation or downstream route abandonment.';
  let recommended_action = 'Maintain monotonic append-only ledger and verify end-to-end route.';

  if (ledgerAudit && !ledgerAudit.is_valid) {
    verdict = 'FAIL';
    concern = `Temporal non-retroactivity violated: ${ledgerAudit.violations[0].message}`;
    falsifier = 'Demonstrate that all historical entries remain strictly immutable and monotonic.';
    recommended_action = 'Revert retroactive mutations; record new evidence strictly as append-only amendments.';
  } else if (journeyAudit && journeyAudit.veto_applied) {
    verdict = 'HELD';
    concern = 'Local subsystem pass masks downstream route regression (LOCAL_PASS_PLUS_GLOBAL_ROUTE_REGRESSION).';
    falsifier = 'Verify that downstream phase completed end-to-end on live route before advancing status.';
    recommended_action = 'Enforce whole-route veto; hold completion status until all downstream journey phases complete.';
  }

  return freeze({
    agent: 'TEMPORAL_CUSTODIAN',
    status: 'BOUNDED_RESEARCH_CANDIDATE',
    coordinate: coordinate || 'chronology_and_whole_route_continuity',
    episode_id: episode_id || null,
    verdict,
    observation: journeyAudit ? journeyAudit.rationale : (ledgerAudit?.is_valid ? 'Ledger is monotonic and non-retroactive.' : 'Ledger audit failed.'),
    concern,
    falsifier,
    recommended_action,
    claim_ceiling: TEMPORAL_CUSTODIAN_CLAIM_CEILING,
    ledger_audit: ledgerAudit,
    journey_audit: journeyAudit
  });
}
