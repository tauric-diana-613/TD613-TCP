import { createHash } from 'node:crypto';
import { compilePedagogueGestureConsequenceAudit } from '../../app/engine/pedagogue-gesture-consequence.js';
import { auditDollhouseWitnessPlan } from '../../app/engine/dollhouse-witness-plan.js';
import { runAtlasContinuityAudit } from '../../app/engine/dollhouse-continuity-audit.js';
import { runFadtAgent } from '../../app/engine/dollhouse-atlas-fadt.js';
import { runTemporalCustodianAudit } from '../../app/engine/dollhouse-temporal-custodian.js';

export const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const copy = value => JSON.parse(JSON.stringify(value));
const roles = ['PEDAGOGUE', 'APERTURE', 'ATLAS', 'FADT', 'TEMPORAL_CUSTODIAN'];

// Arm E is conventional deterministic code, not four independent model calls
// and not the governed-clerk arm D. It does not read the scoring key.
export function evaluateConventionalCase(input) {
  if (!input || input.schema !== 'td613.loom.fixed-audit-case/v0.1'
      || !/^K\d{2}$/.test(input.case_id) || input.origin_kind !== 'SYNTHETIC_AUDIT_FIXTURE'
      || !/^[a-f0-9]{40}$/.test(input.source_revision) || !input.role_inputs
      || !Array.isArray(input.prior_findings)) throw new TypeError('Unsupported case envelope.');
  const checks = [];
  function check(id, fn) {
    try { const result = fn(); checks.push({ id, ...result }); }
    catch (error) { checks.push({ id, status: 'HELD_INPUT_CLASS', error: error.message }); }
  }
  check('adapter_identity', () => ({ status:
    input.role_inputs.PEDAGOGUE?.case_id === input.case_id
    && input.role_inputs.PEDAGOGUE?.observation?.source_revision === input.source_revision
    && input.role_inputs.APERTURE?.source_revision === input.source_revision
    && input.role_inputs.TEMPORAL_CUSTODIAN?.case_id === input.case_id
    && input.role_inputs.TEMPORAL_CUSTODIAN?.source_revision === input.source_revision
      ? 'PASS' : 'HOLD' }));
  check('payload_integrity', () => ({ status: input.payload && typeof input.payload.utf8 === 'string'
    && /^[a-f0-9]{64}$/.test(input.payload.sha256) && sha256(input.payload.utf8) === input.payload.sha256
      ? 'PASS' : 'HOLD', scope: 'Exact declared UTF-8 payload hash; not origin authentication.' }));
  check('PEDAGOGUE', () => {
    const result = compilePedagogueGestureConsequenceAudit(input.role_inputs.PEDAGOGUE);
    return { status: result.classification === 'DECLARED_GESTURE_CONSEQUENCES_PRESERVED' ? 'PASS' : 'HOLD', result };
  });
  check('APERTURE', () => {
    const result = auditDollhouseWitnessPlan(input.role_inputs.APERTURE);
    return { status: result.disposition === 'ASK_NOTHING' ? 'PASS' : 'HOLD', result,
      scope: 'Plan completeness only; ASK_NOTHING is not claim verification.' };
  });
  check('ATLAS', () => {
    const result = runAtlasContinuityAudit(input.role_inputs.ATLAS);
    return { status: result.audit.verdict === 'DECLARED_CONSISTENCY' ? 'PASS' : 'HOLD', result };
  });
  check('FADT', () => {
    const result = runFadtAgent(input.role_inputs.FADT);
    return { status: result.all_fibres_exact ? 'PASS' : 'HOLD', result };
  });
  check('TEMPORAL_CUSTODIAN', () => {
    const result = runTemporalCustodianAudit(input.role_inputs.TEMPORAL_CUSTODIAN);
    return { status: result.input_valid && result.verdict === 'PASS' ? 'PASS' : 'HOLD', result };
  });
  const prior = copy(input.prior_findings);
  const ids = new Set();
  check('prior_findings_shape', () => {
    for (const f of prior) {
      if (!f || typeof f.id !== 'string' || ids.has(f.id) || !roles.includes(f.agent)
          || typeof f.claim_key !== 'string' || !['SUPPORTED', 'HELD', 'CONTRADICTED', 'UNKNOWN'].includes(f.verdict)) {
        throw new TypeError('Malformed or duplicated prior finding.');
      }
      ids.add(f.id);
    }
    return { status: 'PASS' };
  });
  const unresolved = prior.filter(f => f.verdict !== 'SUPPORTED').map(f => f.id);
  const blocked = checks.some(c => c.status !== 'PASS') || unresolved.length > 0;
  return {
    schema: 'td613.loom.conventional-baseline-result/v0.1', arm: 'E', case_id: input.case_id,
    evidence_class: 'LOCAL_STRUCTURAL_TEST', input_origin: input.origin_kind,
    recommendation: blocked ? 'HELD' : 'PRESENT_TO_HUMAN', decision: 'HUMAN_REVIEW_REQUIRED',
    checks, prior_findings: prior, unresolved_prior_finding_ids: unresolved,
    independent_model_calls: 0, provider_origin_authenticated: false,
    actions_executed: false, authority_transferred: false,
    claim_ceiling: 'Finite synthetic-fixture validation only; no model comparison or portable receiver conformance measurement.'
  };
}
