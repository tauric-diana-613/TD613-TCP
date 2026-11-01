import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { digest, canonical, mac, equalHex } from './journal.mjs';
import { ControlledArchiveIntake, verifyAuthenticatedPhysicalArchiveMember } from '../../docs/research/experiment-b-preflight/02_four_arm_harness/controlled-archive-intake.mjs';
import { AtomicCustodyLedger } from '../../docs/research/experiment-b-preflight/02_four_arm_harness/atomic-custody-ledger.mjs';
import { codexArgs, parseCodexEvents } from '../experiment-b-codex-exec-adapter.mjs';

export const OPERATION = 'EXPERIMENT_B_RESUMABLE_FLIGHT';
export function verifyExecutionAuthorization(grant, roots, expected, now = Date.now()) {
  const { signature, ...payload } = grant ?? {};
  const key = roots?.[payload.issuer];
  if (!key || !equalHex(signature, mac(key, payload)) || payload.operation !== OPERATION || !Number.isFinite(payload.expires) || payload.expires <= now || !payload.authorizationId) throw Error('EXTERNAL_EXECUTION_AUTHORIZATION_REQUIRED');
  for (const [k, v] of Object.entries(expected)) if (canonical(payload[k] ?? null) !== canonical(v)) throw Error('EXECUTION_AUTHORIZATION_SCOPE_MISMATCH');
  if (payload.decisions?.length !== 20 || new Set(payload.decisions).size !== 20 || !Array.from({length:20}, (_, i) => `D${String(i+1).padStart(2,'0')}`).every(id => payload.decisions.includes(id))) throw Error('ALL_OPERATOR_DECISIONS_REQUIRED');
  return Object.freeze(payload);
}

/** The returned broker closes over ORIGINAL WeakMap members. No serialized commitment is a capability. */
export function protectedBroker(documents) {
  const byId = new Map();
  for (const d of documents) {
    if (!verifyAuthenticatedPhysicalArchiveMember(d) || byId.has(d.id) || typeof d.content !== 'string') throw Error('ORIGINAL_AUTHENTICATED_TEXT_MEMBER_REQUIRED');
    byId.set(d.id, d);
  }
  return Object.freeze({
    prefix(ids) {
      const sources = ids.map(id => {
        const d = byId.get(id);
        if (!verifyAuthenticatedPhysicalArchiveMember(d)) throw Error('SOURCE_CAPABILITY_INVALID_OR_MUTATED');
        return { id, content: d.content, sha256: d.sha256 };
      });
      return { sources, commitment: digest(sources.map(d => ({ id: d.id, sha256: d.sha256, content_sha256: digest(d.content) }))) };
    },
    manifest() { return [...byId.values()].map(d => ({ id: d.id, sha256: d.sha256, content_sha256: digest(d.content) })); }
  });
}

export function ledgerMirror(ledger) {
  // This JSON ledger is a derived compatibility view. SQLite/HMAC is the recovery authority.
  ledger.ledgerData.provider_retention_posture = { requested_posture: 'OPERATOR_APPROVED_CODEX_POLICY_REQUIRED', confirmed_status: 'NOT_ATTESTED_BY_CHECKPOINT_IMPLEMENTATION' };
  return event => {
    const found = ledger.ledgerData.turns.find(t => t.checkpoint_turn === event.payload.turn);
    if (found && found.checkpoint_hash !== event.hash) throw Error('CUSTODY_MIRROR_CONFLICT_HOLD');
    if (found) return;
    ledger.ledgerData.turns.push({ checkpoint_turn: event.payload.turn, checkpoint_hash: event.hash, arm: event.payload.arm, turn_index: event.payload.round, turn_record: event.payload });
    ledger.recordEvent({ type: 'AUTHENTICATED_CHECKPOINT_MIRRORED', checkpoint_hash: event.hash });
  };
}

/** Reuses the accepted adapter's CLI argument builder and JSONL parser; never calls its synthetic-only API. */
export function nativeTransport({ workspace, model, effort, observeRuntime, spawnNative }) {
  if (!path.isAbsolute(workspace) || typeof spawnNative !== 'function') throw Error('PROVISIONED_ISOLATED_NATIVE_SPAWN_REQUIRED');
  return async request => {
    const args = codexArgs({ model, workspace });
    // Exact flags are retained; successful application/effective effort require runtime acceptance.
    args.splice(args.length - 1, 0, '-c', `model_reasoning_effort=${JSON.stringify(effort)}`);
    const observedIdentity = await observeRuntime();
    if (digest(observedIdentity) !== digest(request.runtime)) throw Error('PRE_DISPATCH_RUNTIME_DRIFT');
    // spawnNative is operator-reviewed runtime provisioning, not a boolean isolation assertion.
    const run = await spawnNative({ executable: 'codex', args, input: request.rendered.prompt, capture: request.capture });
    if (run.exitCode !== 0 || typeof run.stdout !== 'string') throw Error('NATIVE_TERMINAL_RESULT_UNVERIFIED');
    const parsed = parseCodexEvents(run.stdout);
    const events = run.stdout.trim().split(/\r?\n/).map(JSON.parse);
    const activities = events.filter(e => e.type === 'item.completed' && !['agent_message', 'reasoning'].includes(e.item?.type));
    return { status: 'COMPLETED', response: parsed.output, usage: parsed.usage_reported, observedIdentity,
      completeEvidence: { evidence_class: 'NATIVE_WRAPPER_RETURNED_JSONL_NOT_PROVIDER_ATTESTATION', stdout: run.stdout, stderr: run.stderr ?? '', args, thread_id: parsed.thread_id,
        model_served_independently_attested: false, provider_persisted_history_restored: false },
      tools: activities, kernelActivity: run.kernelActivity ?? [], isolationViolation: activities.length > 0,
      billableUSD: run.billableUSD ?? null, subscriptionQuotaUnits: run.subscriptionQuotaUnits ?? null,
      reasoningInclusionSemantics: run.reasoningInclusionSemantics ?? 'UNAVAILABLE' };
  };
}

export async function loadAuthorizedRuntime(config, roots) {
  // A single grant can permit repeated resumes/windows. These changing availability/anchor values
  // are still journaled, but never confer additional episode-level spending authority.
  const { executionGrant, quotaWindowId, minimumAnchor, ...configuration } = config;
  const expected = { experiment: config.plan.experiment, episode: config.plan.episode, planDigest: digest(config.plan), policyDigest: digest(config.policy), runtimeModuleDigest: config.runtimeModuleDigest, sourceManifestDigest: config.sourceManifestDigest, configurationDigest: digest(configuration) };
  const authority = verifyExecutionAuthorization(config.executionGrant, roots, expected);
  const file = path.resolve(config.runtimeModule);
  if (digest(fs.readFileSync(file)) !== config.runtimeModuleDigest) throw Error('RUNTIME_PROVISIONING_CODE_MISMATCH');
  // Provisioning dependency/config inventory is also frozen in plan.runtimeBinding and checked pre-dispatch.
  const runtime = await import(pathToFileURL(file).href);
  for (const name of ['observeRuntime', 'confirmQuotaWindow', 'measureInput', 'spawnNative', 'freezeStage2Packets', 'collectIndependentStage2']) if (typeof runtime[name] !== 'function') throw Error('RUNTIME_PROVISIONING_INCOMPLETE');
  return { authority, runtime };
}

export function admitAuthorizedSources(config, roots) {
  // Never called by synthetic tests. Existing ZIP guards verify the original independently supplied admission grant.
  const intake = new ControlledArchiveIntake({ syntheticMode: false, allowProtectedAdmission: true, trustedOperatorKeys: roots, authorizedDerivativesMap: config.authorizedDerivativesMap ?? {}, prospectiveMetadataMap: config.prospectiveMetadataMap ?? {} });
  const admission = intake.admitArchive(config.archivePath, { operatorFlightGrant: config.archiveGrant });
  const broker = protectedBroker(admission.documents);
  if (digest(broker.manifest()) !== config.sourceManifestDigest) throw Error('AUTHORIZED_SOURCE_MANIFEST_MISMATCH');
  return { admission, broker };
}
export function openCompatibilityLedger(filename, repoRoot) { return new AtomicCustodyLedger(filename, { repoRoot, resume: true }); }
export const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
