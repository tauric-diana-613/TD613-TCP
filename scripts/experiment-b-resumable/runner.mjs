import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Journal, digest, mac, equalHex } from './journal.mjs';
import { ResumableFlight, validatePlan } from './engine.mjs';
import { validatePolicy } from './resources.mjs';
import { loadAuthorizedRuntime, admitAuthorizedSources, nativeTransport, openCompatibilityLedger, ledgerMirror, repositoryRoot } from './boundaries.mjs';
import { validatePrivatePathConfinement } from '../../docs/research/experiment-b-preflight/02_four_arm_harness/atomic-custody-ledger.mjs';
import { verifyWitnessAttestationDetailed } from '../../docs/research/experiment-b-preflight/02_four_arm_harness/stage2-independent-evaluator.mjs';

function privateFile(file) {
  const resolved = path.resolve(file);
  // Stronger local policy than the legacy lexical guard: store completely outside this checkout.
  let parent = path.dirname(resolved);
  while (!fs.existsSync(parent)) parent = path.dirname(parent);
  const real = fs.realpathSync(parent), repo = fs.realpathSync(repositoryRoot);
  if (real === repo || real.startsWith(repo + path.sep)) throw Error('EXTERNAL_PRIVATE_STORE_REQUIRED');
  if (fs.existsSync(resolved) && fs.lstatSync(resolved).isSymbolicLink()) throw Error('PRIVATE_STORE_SYMLINK_REFUSED');
  return validatePrivatePathConfinement(resolved, repositoryRoot);
}

/** One entry point for later authorized execution. No grant creation, fallback, or source auto-discovery. */
export async function runProtectedConfiguration(configFile, rootsFile, checkpointKeyFile) {
  if (!configFile || !rootsFile || !checkpointKeyFile) throw Error('EXPLICIT_PRIVATE_CONFIGURATION_AND_ROOTS_REQUIRED');
  const config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
  const roots = JSON.parse(fs.readFileSync(rootsFile, 'utf8'));
  validatePlan(config.plan); validatePolicy(config.policy);
  if (process.env.TD613_FLIGHT_EXECUTION_AUTHORIZED !== 'true' || process.env.TD613_OPERATOR_ARCHIVE_ADMISSION_GRANTED !== 'true') throw Error('PROTECTED_EXECUTION_NOT_AUTHORIZED');
  const store = privateFile(config.checkpointFile), mirrorFile = privateFile(config.ledgerFile);
  const { authority, runtime } = await loadAuthorizedRuntime(config, roots);
  if (!authority.resumeAcrossQuotaWindows || !await runtime.confirmQuotaWindow(config.quotaWindowId)) throw Error('APPROVED_CONFIRMED_QUOTA_WINDOW_REQUIRED');
  // Model/tool/credential provisioning must pass BEFORE archive admission.
  if (digest(await runtime.observeRuntime()) !== config.plan.runtimeBinding) throw Error('RUNTIME_ACCEPTANCE_REQUIRED_BEFORE_SOURCE_EXPOSURE');
  const journal = new Journal(store, fs.readFileSync(checkpointKeyFile), { anchor: config.minimumAnchor ?? null });
  let stop = false;
  const onStop = () => { stop = true; };
  process.on('SIGINT', onStop); process.on('SIGTERM', onStop);
  try {
    const root = journal.events().find(e => e.type === 'ROOT');
    if (root && root.payload.plan_digest !== digest(config.plan)) throw Error('FROZEN_CONDITION_DRIFT_HOLD');
    const { admission, broker } = admitAuthorizedSources(config, roots);
    const ledger = openCompatibilityLedger(mirrorFile, repositoryRoot);
    ledger.initializeFlight({ executionMode: 'CODEX_RESUMABLE', permutation: 'FROZEN_PRIVATE_PLAN', model: config.plan.model.requested, budgetCeilings: { policy_digest: digest(config.policy) }, admissionReceipt: admission });
    // Deterministic transport and AUTHENTIC archival compiler remain mandatory; provenance checked against frozen plan.
    if (!journal.events().some(e => e.type === 'BASELINES_ACCEPTED')) {
      const { runArm1Archival } = await import('../../docs/research/experiment-b-preflight/02_four_arm_harness/run-arm1-archival.mjs');
      const results = { binding: config.plan.baselineBinding,
        arm0: { role: 'DETERMINISTIC_TRANSPORT', documents: admission.documents.map(d => ({ id: d.id, sha256: d.sha256, raw_byte_sha256: digest(d.raw_bytes) })) },
        arm1: await runArm1Archival(repositoryRoot, admission.documents) };
      journal.append('BASELINES_ACCEPTED', { results });
      ledger.recordArmCompletion('ARM_0_TRANSPORT', results.arm0); ledger.recordArmCompletion('ARM_1_ARCHIVAL', results.arm1);
    }
    const flight = new ResumableFlight({ journal, plan: config.plan, policy: config.policy, broker,
      observeRuntime: runtime.observeRuntime, measureInput: runtime.measureInput,
      transport: nativeTransport({ workspace: config.isolatedWorkspace, model: config.plan.model.requested, effort: config.plan.model.effort, observeRuntime: runtime.observeRuntime, spawnNative: runtime.spawnNative }),
      mirror: ledgerMirror(ledger), pauseRequested: () => stop });
    const result = await flight.run({ windowId: config.quotaWindowId, policyAuthorization: authority.authorizationId, runtimeAuthorization: authority.authorizationId });
    if (result.status !== 'REASONING_COMPLETE_STAGE2_REQUIRED') return result;
    if (!journal.events().some(e => e.type === 'STAGE2_PACKETS_FROZEN')) {
      const packets = await runtime.freezeStage2Packets({ events: journal.events(), binding: config.plan.stage2Binding });
      if (!packets?.semanticMaskingReview || !packets?.negativeControls || !packets?.frozenCandidates || packets.binding !== config.plan.stage2Binding) throw Error('INDEPENDENT_MASKING_AND_COMPLETE_CANDIDATES_REQUIRED');
      journal.append('STAGE2_PACKETS_FROZEN', { packets, packet_digest: digest(packets) });
    }
    const frozen = journal.events().find(e => e.type === 'STAGE2_PACKETS_FROZEN');
    const prior = journal.events().find(e => e.type === 'STAGE2_ACCEPTED');
    if (prior) return { status: 'FLIGHT_RECORDED_INDEPENDENT_ADJUDICATION_RESERVED', stage2_checkpoint: prior.hash };
    // collectIndependentStage2 retrieves independently executed receipts. It MUST NOT issue inference or retries.
    const external = await runtime.collectIndependentStage2({ packets: frozen.payload.packets, packetDigest: frozen.payload.packet_digest });
    if (!external) return { status: 'HELD_INDEPENDENT_STAGE2_RECEIPTS_REQUIRED', packet_checkpoint: frozen.hash };
    const expected = config.stage2Expected;
    if (!expected || expected.expectedEpisodeId !== config.plan.episode || external.packetDigest !== frozen.payload.packet_digest || !external.proofVerification || !external.semanticLeakageReview || external.binding !== config.plan.stage2Binding) throw Error('INDEPENDENT_STAGE2_BINDING_REQUIRED');
    const independentKey = config.independentWitnessRoots?.[external.attestation?.witnessId];
    const { resultSignature, ...signedResult } = external;
    if (!independentKey || !equalHex(resultSignature, mac(independentKey, signedResult))) throw Error('INDEPENDENT_RESULT_SIGNATURE_REJECTED');
    const verified = verifyWitnessAttestationDetailed(external.attestation, independentKey, expected);
    if (!verified.valid) throw Error('INDEPENDENT_STAGE2_ATTESTATION_REJECTED');
    const receipt = journal.append('STAGE2_ACCEPTED', { independent_receipt: external, verified, unblinding_authorized: false });
    ledger.recordAdjudications(external.adjudications ?? []);
    return { status: 'FLIGHT_RECORDED_INDEPENDENT_ADJUDICATION_RESERVED', stage2_checkpoint: receipt.hash };
  } finally { process.off('SIGINT', onStop); process.off('SIGTERM', onStop); journal.close(); }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  runProtectedConfiguration(...process.argv.slice(2)).then(r => console.log(JSON.stringify(r))).catch(() => { console.error('RESUMABLE_FLIGHT_HELD_SEE_PRIVATE_AUTHENTICATED_JOURNAL'); process.exitCode = 1; });
}
