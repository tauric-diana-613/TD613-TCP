import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { digest, canonical, mac, equalHex } from './journal.mjs';
import { ControlledArchiveIntake, verifyAuthenticatedPhysicalArchiveMember } from '../../docs/research/experiment-b-preflight/02_four_arm_harness/controlled-archive-intake.mjs';
import { AtomicCustodyLedger } from '../../docs/research/experiment-b-preflight/02_four_arm_harness/atomic-custody-ledger.mjs';
import { codexArgs } from '../experiment-b-codex-exec-adapter.mjs';
import { capturedNativeCall, requireCaptureService } from './terminal-capture.mjs';
import { admissionPolicyDigest } from '../../docs/research/experiment-b-preflight/02_four_arm_harness/admission-policy.mjs';
import {evidenceMode,OBSERVATIONAL} from '../experiment-b-operational/d04-evidence-policy.mjs';

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
export function nativeTransport({ workspace, model, effort, observeRuntime, spawnNative, captureService }) {
  if (!path.isAbsolute(workspace) || typeof spawnNative !== 'function') throw Error('PROVISIONED_ISOLATED_NATIVE_SPAWN_REQUIRED');
  return async request => {
    try {
    requireCaptureService(captureService);
    const args = codexArgs({ model, workspace });
    // Exact flags are retained; successful application/effective effort require runtime acceptance.
    args.splice(args.length - 1, 0, '-c', `model_reasoning_effort=${JSON.stringify(effort)}`);
    const observedIdentity = await observeRuntime();
    if (digest(observedIdentity) !== digest(request.runtime)) throw Error('PRE_DISPATCH_RUNTIME_DRIFT');
    // spawnNative is operator-reviewed runtime provisioning, not a boolean isolation assertion.
    const { run, parsed, args: capturedArgs, finalEvidence } = await capturedNativeCall({ service: captureService, spawnNative, args, request, executableSHA256: observedIdentity.cliExecutableSHA256 });
    const events = run.stdout.trim().split(/\r?\n/).map(JSON.parse);
    const activities = events.filter(e => e.type === 'item.completed' && !['agent_message', 'reasoning'].includes(e.item?.type)&&
      !parsed.approved_kernel_item_ids.includes(e.item?.id));
    const observations={schema:'TD613_NATIVE_OBSERVABILITY_V1',
      compaction:'UNKNOWN',truncation:'UNKNOWN',contextError:'UNKNOWN',incompleteTurn:'UNKNOWN',
      sourceOmission:'UNKNOWN',unequalOpportunity:'UNKNOWN',
      nativeTerminal:'OBSERVED_COMPLETED_TURN_AND_VERIFIED_FINAL_BYTES',
      requestedRuntimeComparison:'OBSERVED_MATCH',
      submittedPrompt:{bytes:Buffer.byteLength(request.rendered.prompt),sha256:digest(Buffer.from(request.rendered.prompt)),scope:'PARENT_SUBMITTED_TEXT_NOT_PROVIDER_RETAINED_CONTEXT'}};
    return { status: 'COMPLETED', response: parsed.output, usage: parsed.usage_reported, observedIdentity,observations,
      completeEvidence: { evidence_class: 'EXTERNAL_TERMINAL_FILE_AND_JSONL_CAPTURE', stdout: run.stdout, stderr: run.stderr, args: capturedArgs, terminalFinal: finalEvidence, thread_id: parsed.thread_id,
        native_runtime:run.effectiveConfiguration??null,nativeObservability:observations,
        model_served_independently_attested: false, provider_persisted_history_restored: false },
      tools: activities, kernelActivity: run.kernelActivity ?? [], isolationViolation: activities.length > 0,
      billableUSD: run.billableUSD ?? null, subscriptionQuotaUnits: run.subscriptionQuotaUnits ?? null,
      reasoningInclusionSemantics: run.reasoningInclusionSemantics ?? 'UNAVAILABLE' };
    } catch(error) {
      // Existing parser/capture refusals remain refusals. Never reinterpret a
      // provider error string or unsupported event as a fabricated detector.
      const candidate=String(error.code??error.message??'');
      const reason=/^[A-Z][A-Z0-9_]{1,120}$/.test(candidate)?candidate:'NATIVE_CAPTURE_OR_RUNTIME_REFUSED';
      throw Object.assign(Error(reason),{code:reason,nativeObservation:{schema:'TD613_NATIVE_OBSERVABILITY_V1',
        evidenceClass:'OBSERVED_NATIVE_PATH_REFUSAL',refusalCode:reason,
        hiddenCompaction:'UNKNOWN',providerRetainedContext:'UNKNOWN',effectiveOutputCeiling:'UNKNOWN'}});
    }
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
  requireCaptureService(runtime.captureService);
  return { authority, runtime };
}

export function requireAdmissionEscrow(config,roots,now=Date.now()){
  if(evidenceMode(config.plan?.context?.evidencePolicy)!==OBSERVATIONAL)return;
  const e=config.admissionEscrow,sha=x=>typeof x==='string'&&/^[a-f0-9]{64}$/.test(x);
  if(!e||e.operation!=='EXPERIMENT_B_ADMISSION_ONLY'||e.inferenceAuthorized!==false||
    !['archiveSHA256','metadataPolicyDigest','intakeManifestDigest','sourceManifestDigest'].every(k=>sha(e[k]))||
    !Array.isArray(e.brokerManifest)||digest(e.brokerManifest)!==e.sourceManifestDigest||
    e.sourceManifestDigest!==config.sourceManifestDigest)throw Error('OBSERVATIONAL_ADMISSION_ESCROW_REQUIRED');
  const {signature,...receipt}=config.admissionEscrowReceipt??{};
  const key=roots?.[receipt.issuer];
  if(!key||!equalHex(signature,mac(key,receipt))||receipt.operation!=='EXPERIMENT_B_ADMISSION_ESCROW'||
    !receipt.authorizationId||!Number.isFinite(receipt.expires)||receipt.expires<=now||
    receipt.experiment!==config.plan.experiment||receipt.episode!==config.plan.episode||
    receipt.escrowDigest!==digest(e))throw Error('EXTERNAL_ADMISSION_ESCROW_RECEIPT_REQUIRED');
  // The separately trusted custodian attests that admitOnly produced this escrow.
  // This checks its receipt and signed-configuration commitment, not physical-member authority.
  // Protected admission below still needs its original independent grant and must
  // physically reproduce archive, policy, intake and source commitments.
}
export function admitAuthorizedSources(config, roots) {
  requireAdmissionEscrow(config,roots);
  // Never called by synthetic tests. Existing ZIP guards verify the original independently supplied admission grant.
  const intake = new ControlledArchiveIntake({ syntheticMode: false, allowProtectedAdmission: true, trustedOperatorKeys: roots, authorizedDerivativesMap: config.authorizedDerivativesMap ?? {}, prospectiveMetadataMap: config.prospectiveMetadataMap ?? {} });
  if (config.admissionEscrow && config.admissionEscrow.metadataPolicyDigest !== admissionPolicyDigest({
    authorizedDerivativesMap: intake.authorizedDerivativesMap, prospectiveMetadataMap: intake.prospectiveMetadataMap,
    maxMembers: intake.maxMembers, maxPerMemberBytes: intake.maxPerMemberBytes,
    maxTotalExpandedBytes: intake.maxTotalExpandedBytes, maxDecompressionRatio: intake.maxDecompressionRatio
  })) throw Error('ADMISSION_POLICY_DRIFT_HOLD');
  const admission = intake.admitArchive(config.archivePath, { operatorFlightGrant: config.archiveGrant });
  if (config.admissionEscrow) {
    const escrow = config.admissionEscrow;
    if (escrow.operation !== 'EXPERIMENT_B_ADMISSION_ONLY' || escrow.inferenceAuthorized !== false ||
        escrow.archiveSHA256 !== admission.archive_sha256 || escrow.sourceManifestDigest !== config.sourceManifestDigest ||
        escrow.intakeManifestDigest !== admission.manifest_sha256) throw Error('ADMISSION_ESCROW_DRIFT_HOLD');
  }
  const broker = protectedBroker(admission.documents);
  if (digest(broker.manifest()) !== config.sourceManifestDigest) throw Error('AUTHORIZED_SOURCE_MANIFEST_MISMATCH');
  return { admission, broker };
}
export function openCompatibilityLedger(filename, repoRoot) { return new AtomicCustodyLedger(filename, { repoRoot, resume: true }); }
export const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
