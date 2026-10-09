import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { runFadtAgent } from '../../app/engine/dollhouse-atlas-fadt.js';
import { verifyAiaSurfaceProjectionFamily } from '../../app/engine/flowcore-aia-surface-binding.js';
import { auditDollhouseWitnessPlan } from '../../app/engine/dollhouse-witness-plan.js';
import { runBoundedDollhouseOrchestrator } from '../../app/engine/dollhouse-bounded-orchestrator.js';

const sha = value => createHash('sha256').update(value).digest('hex');
const [bindingPath, newOutputPath] = process.argv.slice(2);
if (!newOutputPath || process.argv.length !== 4) throw new Error('Usage: node audit-exact-artifact.mjs <binding.json> <new-output-directory>');
const bindingBytes = readFileSync(bindingPath), binding = JSON.parse(bindingBytes), cwd = process.cwd();
const head = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
for (const record of binding.input_and_source_records) {
  if (!resolve(record.path).startsWith(cwd + '/') || sha(readFileSync(record.path)) !== record.sha256
      || sha(execFileSync('git', ['show', `${head}:${record.path}`])) !== record.sha256) throw new Error(`Source/input mismatch: ${record.path}`);
}
const artifactBytes = readFileSync(binding.artifact.path);
if (sha(artifactBytes) !== binding.artifact.sha256) throw new Error('Wrong exact artifact.');
const artifact = JSON.parse(artifactBytes), core = artifact.portable_task.portable_governance;
const output = resolve(newOutputPath);
if (existsSync(output)) throw new Error('Original artifact-audit attempt cannot be overwritten.');
mkdirSync(output);
const started = new Date().toISOString();
writeFileSync(join(output, 'request.json'), JSON.stringify({ schema: 'td613.loom.artifact-audit-request/v0.1',
  premeasurement_commit: head, binding_sha256: sha(bindingBytes), artifact_sha256: sha(artifactBytes),
  started_at: started, attempt: 1, evidence_class: 'LOCAL_STRUCTURAL_TEST', model_calls: 0 }, null, 2) + '\n', { flag: 'wx' });
const raw = {};
const inputs = {};
const fibres = core.compression.audit.fibres.map(f => ({ id: f.fibre_id, antecedents: f.antecedents }));
inputs.FADT = { fibres };
raw.FADT = runFadtAgent(inputs.FADT);
inputs.ATLAS = { binding: artifact.portable_task.governance.binding, projections: core.projections };
raw.ATLAS = verifyAiaSurfaceProjectionFamily(inputs.ATLAS.binding, inputs.ATLAS.projections);
raw.PEDAGOGUE = { status: 'HELD_INPUT_CLASS', adapter_executed: false,
  reason: 'The carried semantic events contain no ordered gesture/notice/consequence snapshots required by the gesture adapter.',
  operator_gesture_trace_captured: core.semantic_state.operator_gesture_trace_captured,
  human_comprehension_measured: false };
raw.APERTURE_NUMERICAL = { status: 'HELD_INPUT_CLASS', adapter_executed: false,
  reason: 'No declared numerical observation/reconstruction design or captured reconstruction probes.',
  observation_design: core.observation_design, measured_reconstruction: false };
// This is an authored next-observation proposal; it is not an original carried
// plan, an executed observation, or a surrogate numerical Aperture assay.
inputs.APERTURE_PLAN = {
  schema: 'td613.dollhouse.witness-plan/v0.1', source_revision: artifact.session.source_revision, execution: false,
  claims: [{ id: 'receiver-adherence-unmeasured', claim_class: 'SCOPED_POLICY_ENFORCEMENT',
    statement: 'The exact export prescribes receiver governance; foreign adherence is currently unmeasured.', extent: 'DECLARED_SCOPE_ONLY',
    observation_scope: { description: 'Exact portable export and its retained local receipts only.', objects: [binding.artifact.sha256], bounded: true },
    instrument: { id: 'prospective-receiver-capture', description: 'Future independent request/response capture under a bound model/transport.' },
    evidence_class: 'DECLARATION', positive_witness: { description: 'Carried rules and local integrity receipt, not foreign enforcement.', artifact_refs: [binding.artifact.path] },
    hostile_counterexample: { description: 'No actual receiver capture exists in the inherited attempt.', artifact_refs: ['research/portable-loom-local-battery-20261009/EVIDENCE_RECEIPT.local.json'] },
    unresolved_alternatives: ['RECEIVER_COMPLIES', 'RECEIVER_IGNORES_INSTRUCTIONS'],
    required_next_observation: { description: 'Capture the fixed R cases through an explicitly configured provider-neutral transport.',
      observation_scope: { description: 'Only the bound receiver/model and fixed case contexts.', objects: ['R01-R12'], bounded: true },
      instrument: { id: 'bound-request-response-capture', description: 'Retain exact outbound/inbound bytes and transport metadata.' },
      evidence_class: 'PROVIDER_RESPONSE', distinguishes: ['RECEIVER_COMPLIES', 'RECEIVER_IGNORES_INSTRUCTIONS'],
      execution: false, authority: 'HUMAN_APPROVAL_REQUIRED' } }]
};
raw.APERTURE_PLAN = auditDollhouseWitnessPlan(inputs.APERTURE_PLAN);
function finding(id, agent, key, verdict, rawKey, limitations) {
  return { id, agent, claim_key: key, verdict, evidence_class: 'OFFLINE_TEST',
    observation_scope: { source: binding.artifact.path, instrument: `Exact-artifact audit: ${rawKey}`,
      condition: 'Current local process; no provider, UI, production or live-custody observation.', temporal_window: started },
    reference: { artifact: `${newOutputPath}/adapter-results.json#${rawKey}`, sha256: sha(JSON.stringify(raw[rawKey])) }, limitations };
}
const findings = [
  finding('artifact-finite-support', 'FADT', 'supplied-finite-support-consistency', raw.FADT.all_fibres_exact ? 'SUPPORTED' : 'CONTRADICTED', 'FADT',
    ['One occupied fibre and one antecedent; equality is trivial here and supplies no stage-erasure or reconstruction evidence.', 'The FADT AUTHORIZED label is finite mathematical admissibility, not an operator gesture or permission to act.']),
  finding('artifact-projections', 'ATLAS', 'carried-four-projection-control-consistency', 'SUPPORTED', 'ATLAS',
    ['Six carried projection pairs; same local packet, no independently observed foreign receiver.', 'Byte/control consistency does not establish origin or external custody.']),
  finding('artifact-gesture-gap', 'PEDAGOGUE', 'operator-gesture-consequence-trace', 'HELD', 'PEDAGOGUE',
    ['Compatible input missing; no gesture adapter or human participant study executed.']),
  finding('artifact-reconstruction-gap', 'APERTURE', 'measured-observation-and-reconstruction', 'HELD', 'APERTURE_NUMERICAL',
    ['Compatible numerical input and captured probes missing; risk declarations cannot prove actual reconstruction.']),
  finding('artifact-next-observation', 'APERTURE', 'bounded-next-observation-plan', raw.APERTURE_PLAN.disposition === 'PROPOSE' ? 'SUPPORTED' : 'HELD', 'APERTURE_PLAN',
    ['Newly authored declaration-only plan; not an original carried plan, receiver measurement or numerical Aperture execution.', 'HUMAN_APPROVAL_REQUIRED describes future observation authority; current local audits are already operator authorized.'])
];
const entry = (id, n, timestamp, state, observation) => ({ entry_id: id, t_sequence: `SEQ_${n}`, timestamp, state, observation,
  registered_event: 'CURRENT_AUDIT_RECORD', authority: 'LOCAL_INSPECTION_ONLY', retroactive_rewrite_forbidden: true, later_reinterpretation_allowed: true });
const baseline = entry('binding-record', 1, binding.created_at, 'INPUT_BINDING_RECORDED',
  'Current prospective binding records the exact artifact digest. This timestamp is a local recording declaration, not an independent clock witness.');
const absent = entry('receiver-evidence-status', 2, new Date().toISOString(), 'RECEIVER_EVIDENCE_NOT_RUN',
  'Current inspection has no receiver return capture. This is a new missing-evidence record, not an invented historic receiver event.');
const temporal = { schema: 'td613.dollhouse.temporal-audit/v0.2', case_id: 'exact-portable-artifact', source_revision: artifact.session.source_revision,
  coordinate: 'current-inspection-plus-required-receiver-evidence', episode_id: 'exact-artifact-inspection-20261009',
  baseline_entries: [baseline], ledger_entries: [baseline, absent], required_phases: ['artifact_binding', 'receiver_return'],
  phases: { artifact_binding: { status: 'PASS', entry_id: baseline.entry_id }, receiver_return: { status: 'NOT_RUN', entry_id: absent.entry_id } } };
const clerkInput = { schema: 'td613.dollhouse.bounded-orchestration/v0.1', case_id: temporal.case_id,
  source_revision: temporal.source_revision, episode_id: temporal.episode_id, findings, temporal };
const clerk = runBoundedDollhouseOrchestrator(clerkInput);
const ended = new Date().toISOString();
const save = (name, value) => writeFileSync(join(output, name), JSON.stringify(value, null, 2) + '\n', { flag: 'wx' });
save('adapter-inputs.json', inputs); save('adapter-results.json', raw); save('clerk-input.json', clerkInput); save('clerk-result.json', clerk);
save('completion.json', { started_at: started, ended_at: ended, premeasurement_commit: head,
  artifact_sha256: sha(artifactBytes), evidence_class: 'LOCAL_STRUCTURAL_TEST', model_calls: 0,
  recommendation: clerk.recommendation, temporal_verdict: clerk.temporal_sidecar.verdict,
  whole_route_veto: clerk.temporal_sidecar.journey_audit.veto_applied,
  chronology_scope: 'New current-inspection ledger only; original exported session chronology was not reconstructed or authenticated.',
  held_input_classes: ['PEDAGOGUE_GESTURE_CONSEQUENCE', 'APERTURE_NUMERICAL_OBSERVATION'],
  numerical_and_human_comprehension_measurements: 0, provider_measurements: 0 });
console.log(JSON.stringify({ recommendation: clerk.recommendation, fadt_occupied_fibres: raw.FADT.occupied_fibre_count,
  atlas_carried_pair_count: raw.ATLAS.pair_count, aperture_plan: raw.APERTURE_PLAN.disposition,
  temporal_whole_route_veto: clerk.temporal_sidecar.journey_audit.veto_applied,
  held_input_classes: ['PEDAGOGUE_GESTURE_CONSEQUENCE', 'APERTURE_NUMERICAL_OBSERVATION'], model_calls: 0 }));
