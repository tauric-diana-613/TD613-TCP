import { getDollhouseAgent, listDollhouseAgents } from './dollhouse-agent-registry.js';

export const DOLLHOUSE_CASE_DOSSIER_SCHEMA = 'td613.dollhouse.case-dossier/v0.1';
const CLASSES = ['DECLARATION', 'OFFLINE_TEST', 'BROWSER_WITNESS', 'PROVIDER_RESPONSE', 'EMPIRICAL_ACQUISITION'];
const VERDICTS = ['SUPPORTED', 'HELD', 'CONTRADICTED', 'UNKNOWN'];
function exact(value, keys, label) {
  if (!value || Object.getPrototypeOf(value) !== Object.prototype || Reflect.ownKeys(value).length !== keys.length || keys.some(key => !Object.hasOwn(value, key))) throw new TypeError(`${label}: exact fields required`);
  const descriptors = Object.getOwnPropertyDescriptors(value);
  if (keys.some(key => !descriptors[key].enumerable || !Object.hasOwn(descriptors[key], 'value'))) throw new TypeError(`${label}: accessors and hidden data forbidden`);
}
function text(value, limit, label) {
  if (typeof value !== 'string' || !value.trim() || value.length > limit) throw new TypeError(`${label}: bounded nonempty text required`);
  return value;
}
function dense(value, min, max, label) {
  if (!Array.isArray(value) || Object.getPrototypeOf(value) !== Array.prototype || value.length < min || value.length > max || Reflect.ownKeys(value).length !== value.length + 1) throw new TypeError(`${label}: dense bounded array required`);
  const descriptors = Object.getOwnPropertyDescriptors(value);
  for (let index = 0; index < value.length; index++) if (!descriptors[index]?.enumerable || !Object.hasOwn(descriptors[index], 'value')) throw new TypeError(`${label}: sparse entries and accessors forbidden`);
  return value;
}
function freeze(value) {
  if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
}

/**
 * A bounded clerk for independently scoped findings, not a voting or admission
 * engine. Supplied evidence labels/digests remain declared references. This
 * function neither reads their artifacts nor authenticates their authors.
 */
export function createDollhouseCaseDossier(input) {
  exact(input, ['schema', 'case_id', 'source_revision', 'findings'], 'case');
  if (input.schema !== DOLLHOUSE_CASE_DOSSIER_SCHEMA) throw new TypeError('case: unsupported schema');
  text(input.case_id, 100, 'case id');
  if (typeof input.source_revision !== 'string' || !/^[a-f0-9]{40}$/.test(input.source_revision)) throw new TypeError('case: exact source revision required');
  const ids = new Set();
  const findings = dense(input.findings, 1, 64, 'findings').map(finding => {
    exact(finding, ['id', 'agent', 'claim_key', 'verdict', 'evidence_class', 'observation_scope', 'reference', 'limitations'], 'finding');
    text(finding.id, 100, 'finding id');
    if (ids.has(finding.id)) throw new TypeError('finding: duplicate id');
    ids.add(finding.id);
    if (typeof finding.agent !== 'string' || !getDollhouseAgent(finding.agent) || finding.agent !== finding.agent.toUpperCase()) throw new TypeError('finding: undeclared agent');
    text(finding.claim_key, 160, 'claim key');
    if (!VERDICTS.includes(finding.verdict) || !CLASSES.includes(finding.evidence_class)) throw new TypeError('finding: unsupported verdict or evidence class');
    exact(finding.observation_scope, ['source', 'instrument', 'condition', 'temporal_window'], 'observation scope');
    for (const value of Object.values(finding.observation_scope)) text(value, 500, 'observation scope');
    exact(finding.reference, ['artifact', 'sha256'], 'reference');
    text(finding.reference.artifact, 500, 'artifact reference');
    if (typeof finding.reference.sha256 !== 'string' || !/^[a-f0-9]{64}$/.test(finding.reference.sha256)) throw new TypeError('reference: SHA256 commitment required');
    dense(finding.limitations, 1, 16, 'limitations').forEach(value => text(value, 1000, 'limitation'));
    return JSON.parse(JSON.stringify(finding));
  });
  const groups = new Map();
  for (const finding of findings) {
    if (!groups.has(finding.claim_key)) groups.set(finding.claim_key, []);
    groups.get(finding.claim_key).push(finding);
  }
  const disagreements = [...groups].filter(([, group]) => new Set(group.map(item => item.verdict)).size > 1).map(([claim_key, group]) => ({
    claim_key, finding_ids: group.map(item => item.id),
    verdicts: group.map(item => ({ id: item.id, agent: item.agent, verdict: item.verdict, evidence_class: item.evidence_class })),
    resolution: 'HUMAN_REVIEW_REQUIRED'
  }));
  const represented = new Set(findings.map(item => item.agent));
  return freeze({
    schema: DOLLHOUSE_CASE_DOSSIER_SCHEMA, case_id: input.case_id, source_revision: input.source_revision,
    findings, disagreements,
    agent_coverage: listDollhouseAgents().map(agent => ({ agent: agent.id, present: represented.has(agent.id) })),
    unresolved_finding_ids: findings.filter(item => item.verdict !== 'SUPPORTED').map(item => item.id),
    evidence_posture: {
      evidence_class_is_caller_declared: true, artifact_bytes_checked: false,
      reference_authentication: 'UNVERIFIED', findings_independently_scoped: true,
      evidence_classes_aggregated: false, majority_vote: false, global_score: null
    },
    decision: 'HUMAN_REVIEW_REQUIRED',
    authority: { execute: false, automatic_redesign: false, release: false, merge: false, deployment: false, provider: false, human_closure_required: true }
  });
}
