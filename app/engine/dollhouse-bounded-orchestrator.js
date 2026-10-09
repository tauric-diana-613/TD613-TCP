import { createDollhouseCaseDossier, DOLLHOUSE_CASE_DOSSIER_SCHEMA } from './dollhouse-case-dossier.js';
import { runTemporalCustodianAudit } from './dollhouse-temporal-custodian.js';

export const DOLLHOUSE_BOUNDED_ORCHESTRATOR_SCHEMA = 'td613.dollhouse.bounded-orchestration/v0.1';
function freeze(value) {
  if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
}

/** A local clerk plus a distinct temporal sidecar; no model calls or actions. */
export function runBoundedDollhouseOrchestrator(input) {
  const keys = ['schema', 'case_id', 'source_revision', 'episode_id', 'findings', 'temporal'];
  if (!input || Object.getPrototypeOf(input) !== Object.prototype || Reflect.ownKeys(input).length !== keys.length || keys.some(key => !Object.hasOwn(input, key))) throw new TypeError('orchestration: exact fields required');
  const descriptors = Object.getOwnPropertyDescriptors(input);
  if (keys.some(key => !descriptors[key].enumerable || !Object.hasOwn(descriptors[key], 'value'))) throw new TypeError('orchestration: accessors and hidden fields forbidden');
  if (input.schema !== DOLLHOUSE_BOUNDED_ORCHESTRATOR_SCHEMA) throw new TypeError('orchestration: unsupported schema');
  if (typeof input.episode_id !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9_.:-]{0,99}$/.test(input.episode_id)) throw new TypeError('orchestration: episode identity required');
  const dossier = createDollhouseCaseDossier({ schema: DOLLHOUSE_CASE_DOSSIER_SCHEMA, case_id: input.case_id, source_revision: input.source_revision, findings: input.findings });
  const temporal = runTemporalCustodianAudit(input.temporal);
  const holds = [];
  const bound = temporal.case_id === input.case_id && temporal.episode_id === input.episode_id && temporal.source_revision === input.source_revision;
  if (!bound) holds.push({ code: 'TEMPORAL_IDENTITY_MISMATCH', detail: 'Temporal case, episode and source must match the dossier.' });
  if (!temporal.input_valid || temporal.verdict !== 'PASS') holds.push({ code: 'TEMPORAL_REVIEW_HELD', detail: 'Missing, invalid, contradictory or incomplete temporal evidence holds the route.' });
  if (temporal.journey_audit?.veto_applied) holds.push({ code: 'LOCAL_PASS_PLUS_GLOBAL_ROUTE_REGRESSION', detail: 'Temporal Custodian whole-route veto retained.' });
  for (const role of dossier.agent_coverage.filter(item => !item.present)) holds.push({ code: 'ROLE_MISSING', agent: role.agent });
  if (dossier.unresolved_finding_ids.length) holds.push({ code: 'UNRESOLVED_ROLE_FINDINGS', finding_ids: [...dossier.unresolved_finding_ids] });
  return freeze({
    schema: DOLLHOUSE_BOUNDED_ORCHESTRATOR_SCHEMA, case_id: input.case_id, episode_id: input.episode_id, source_revision: input.source_revision,
    dossier, temporal_sidecar: temporal, holds,
    role_coverage: [...dossier.agent_coverage, { agent: 'TEMPORAL_CUSTODIAN', present: bound && temporal.input_valid }],
    recommendation: holds.length ? 'HELD' : 'PRESENT_TO_HUMAN', decision: 'HUMAN_REVIEW_REQUIRED',
    evidence_posture: { findings_are_caller_declared: true, artifact_bytes_checked: false, provider_origin_authenticated: false, majority_vote: false, global_score: null, automatic_temporal_sidecar_consumed: true, model_scheduler: false },
    authority: { execute: false, automatic_redesign: false, provider: false, merge: false, deployment: false, release: false, human_closure_required: true }
  });
}
