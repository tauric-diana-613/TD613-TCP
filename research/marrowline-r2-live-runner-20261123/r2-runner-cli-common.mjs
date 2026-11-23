// TD613 · Marrowline R2 · Shared Production-Boundary CLI & Non-Secret Summary Formatter
// Commission: TD613-MARROWLINE-R2-LIVE-RUNNER-20261123
// Covenant: Khona‌lit-po (literal U+200C preserved) · Seal: ⟐SAC[X6ZNK5NO51]
// SECURITY BOUNDARY: Hard-bound to source-pinned operator trust anchor, host HEAD, and native fetch with strict option allowlist.

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {
  R1_NATIVE_TRUSTED_OPERATOR_PUBLIC_KEY_SHA256
} from '../marrowline-r1-no-artificial-ceilings-20261122/run-r1-provider-native-observation.mjs';
import {
  R2_U_ACQUISITION_PLANS,
  R2_W_ACQUISITION_PLANS,
  getR2PlanPreset
} from './r2-acquisition-plans.mjs';
import {
  R2_ESTATE_SPECS,
  R2ObservationError,
  buildExpectedEstatePlan
} from './r2-custody-gate-verifier.mjs';
import { executeR2ObservationCore } from './r2-live-core.mjs';

export const R2_TRUSTED_OPERATOR_PUBLIC_KEY_SHA256 = R1_NATIVE_TRUSTED_OPERATOR_PUBLIC_KEY_SHA256;

const ALLOWED_EXECUTABLE_OPTIONS = new Set([
  'acknowledgeLiveExecution',
  'grant',
  'publicKeyPem',
  'evidenceDir',
  'revocationFilePath',
  'planId',
  'episodes',
  'measureCountTokens',
  'operatorAbortSignal',
  'onProgress'
]);

export function resolveCheckedOutGitHeadSha(repoRoot = process.cwd()) {
  try {
    const out = execFileSync('git', ['rev-parse', 'HEAD'], {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe']
    }).trim();
    if (!/^[0-9a-f]{40}$/.test(out)) {
      throw new R2ObservationError('R2_INVALID_CHECKED_OUT_HEAD', `Invalid git HEAD SHA: ${out}`);
    }
    return out;
  } catch (error) {
    if (error instanceof R2ObservationError) throw error;
    throw new R2ObservationError('R2_GIT_HEAD_RESOLUTION_FAILED', `Could not resolve checked-out git HEAD: ${error?.message || error}`);
  }
}

export async function executeR2ObservationExecutable(estate, options = {}) {
  if (!R2_ESTATE_SPECS[estate]) {
    throw new R2ObservationError('R2_UNKNOWN_ESTATE', `Unsupported R2 estate "${estate}"`);
  }
  if (!options || typeof options !== 'object' || Array.isArray(options)) {
    throw new R2ObservationError('R2_INVALID_OPTIONS', 'Options must be an object');
  }
  for (const key of Object.keys(options)) {
    if (!ALLOWED_EXECUTABLE_OPTIONS.has(key)) {
      throw new R2ObservationError(
        'R2_UNBOUNDED_FORBIDDEN_EXECUTABLE_OVERRIDE',
        `Production executable rejects unrecognized or test-override option "${key}"`
      );
    }
  }

  return executeR2ObservationCore({
    estate,
    acknowledgeLiveExecution: options.acknowledgeLiveExecution === true,
    grant: options.grant ?? null,
    publicKeyPem: options.publicKeyPem ?? null,
    pinnedTrustFingerprintSha256: R2_TRUSTED_OPERATOR_PUBLIC_KEY_SHA256,
    checkedOutHeadSha: resolveCheckedOutGitHeadSha(process.cwd()),
    transportFetch: globalThis.fetch,
    evidenceDir: options.evidenceDir ?? null,
    revocationFilePath: options.revocationFilePath ?? null,
    env: process.env,
    nowMs: Date.now(),
    planId: options.planId ?? 'INITIAL_PILOT',
    episodes: options.episodes ?? null,
    measureCountTokens: options.measureCountTokens !== false,
    checkModelDiscovery: true,
    operatorAbortSignal: options.operatorAbortSignal ?? null,
    onProgress: options.onProgress ?? null
  });
}

export function buildPublicBlindedWArtifact(result) {
  return {
    schema: 'td613.marrowline.r2-w-blind-witness/v1',
    sourceRole: 'BLIND_READERS_ONLY',
    humanArtisticAuthority: 'RESERVED_HUMAN_ONLY',
    estate: result.estate,
    experimentId: result.experimentId,
    blindedEpisodes: (result.blindedEpisodes || []).map((pkt) => pkt.publicPacket)
  };
}

export function formatNonSecretOperatorSummary({ result, outPath, blindedOutPath = null }) {
  const gate = result.physicalCustodyGate?.gateResult || {};
  const lines = [
    `TD613 Marrowline ${result.estate} Non-Secret Session Receipt Summary`,
    `Schema: ${result.schema}`,
    `Experiment: ${result.experimentId}`,
    `Session ID: ${result.authorization?.sessionId}`,
    `Checked-Out HEAD: ${result.authorization?.checkedOutHeadSha}`,
    `Disposition: ${gate.overallDisposition} (held=${Boolean(gate.held)}, physicalVerified=${Boolean(result.physicalCustodyGate?.physicalVerificationPassed)})`,
    `Hypothesis Verdict: ${gate.scientificHypothesisVerdict || 'PENDING'}`,
    `Acquisition Scope: ${result.acquisitionScope?.classification} (${result.dispatchCounts?.episodesCompletedValid}/${result.dispatchCounts?.episodesPlanned} valid episodes, multiEpisodeComplete=${Boolean(result.acquisitionScope?.multiEpisodeComparisonCompleted)})`,
    `External Admission Proved: ${Boolean(gate.securityAndSafeHarbor?.externalAdmissionProved)}`,
    `Human Artistic Authority: ${result.humanArtisticAcceptance}`,
    `Evidence Directory: ${result.evidenceDir}`,
    `Custody Receipt JSON: ${outPath}`
  ];
  if (blindedOutPath) {
    lines.push(`Blinded Artistic Packet JSON (read this first before inspecting ${outPath}): ${blindedOutPath}`);
  }
  if (result.integritySessionHaltReason) {
    lines.push(`Integrity Halt Reason: ${result.integritySessionHaltReason}`);
  }
  lines.push('No API keys, private keys, or passphrases are recorded in this file.');
  return `${lines.join('\n')}\n`;
}

function getCliFlagValue(argv, flag) {
  const idx = argv.indexOf(flag);
  if (idx === -1 || idx + 1 >= argv.length) return null;
  const val = argv[idx + 1];
  return val && !val.startsWith('--') ? val : null;
}

export async function runEstateRunnerCli(estate, argv = process.argv.slice(2)) {
  const spec = R2_ESTATE_SPECS[estate];
  const args = new Set(argv);
  const expectedAck = estate === 'R2-U' ? '--ack-live-r2-u-observation' : '--ack-live-r2-w-observation';
  const forbiddenOtherAck = estate === 'R2-U' ? '--ack-live-r2-w-observation' : '--ack-live-r2-u-observation';

  if (args.has(forbiddenOtherAck)) {
    throw new R2ObservationError(
      'R2_AUTH_CROSS_ESTATE_ACK_FORBIDDEN',
      `Cross-estate acknowledgment ${forbiddenOtherAck} cannot invoke ${estate}`
    );
  }
  if (args.has('--live') || args.has('--count-tokens')) {
    throw new R2ObservationError(
      'R2_CLI_LIVE_DISPATCH_HELD',
      `Unauthorized --live/--count-tokens flags rejected for ${estate}; signed Ed25519 grant and ${expectedAck} required.`
    );
  }

  if (args.has('--execute')) {
    if (!args.has(expectedAck)) {
      throw new R2ObservationError(
        'R2_LIVE_EXECUTION_NOT_ACKNOWLEDGED',
        `--execute requires ${expectedAck}, --grant-file <abs>, --public-key-file <abs>, --evidence-dir <abs>, --out <abs>`
      );
    }
    const grantFile = getCliFlagValue(argv, '--grant-file');
    const publicKeyFile = getCliFlagValue(argv, '--public-key-file');
    const evidenceDir = getCliFlagValue(argv, '--evidence-dir');
    const outPath = getCliFlagValue(argv, '--out');
    const revocationFilePath = getCliFlagValue(argv, '--revocation-file');
    const planId = getCliFlagValue(argv, '--plan') || 'INITIAL_PILOT';
    const episodesJsonFile = getCliFlagValue(argv, '--episodes-json');

    if (!grantFile || !publicKeyFile) {
      throw new R2ObservationError('R2_AUTH_MISSING', '--execute requires both --grant-file and --public-key-file');
    }
    if (!evidenceDir || !outPath || !path.isAbsolute(evidenceDir) || !path.isAbsolute(outPath)) {
      throw new R2ObservationError(
        'R2_EXPLICIT_ABSOLUTE_EVIDENCE_PATHS_REQUIRED',
        'Live CLI requires explicit absolute --evidence-dir and --out before dispatching'
      );
    }

    const grant = JSON.parse(fs.readFileSync(grantFile, 'utf8'));
    const publicKeyPem = fs.readFileSync(publicKeyFile, 'utf8');
    const customEpisodes = episodesJsonFile ? JSON.parse(fs.readFileSync(episodesJsonFile, 'utf8')) : null;
    const summaryOutPath = `${outPath}.summary.txt`;
    const blindedOutPath = estate === 'R2-W' ? `${outPath}.blinded.json` : null;

    fs.mkdirSync(path.dirname(outPath), { recursive: true, mode: 0o700 });
    const createdPlaceholders = [outPath, summaryOutPath, ...(blindedOutPath ? [blindedOutPath] : [])];
    for (const p of createdPlaceholders) {
      const fd = fs.openSync(p, 'wx', 0o600);
      fs.closeSync(fd);
    }

    const cliAbortController = new AbortController();
    const onStopSignal = (sigName) => {
      if (!cliAbortController.signal.aborted) {
        cliAbortController.abort(new R2ObservationError('R2_OPERATOR_SIGINT_OR_SIGTERM', `Operator ${sigName} manual stop`));
      }
    };
    const onSigint = () => onStopSignal('SIGINT');
    const onSigterm = () => onStopSignal('SIGTERM');
    process.on('SIGINT', onSigint);
    process.on('SIGTERM', onSigterm);

    let result;
    try {
      result = await executeR2ObservationExecutable(estate, {
        acknowledgeLiveExecution: true,
        grant,
        publicKeyPem,
        evidenceDir,
        revocationFilePath,
        planId,
        episodes: customEpisodes,
        measureCountTokens: !args.has('--skip-count-tokens'),
        operatorAbortSignal: cliAbortController.signal,
        onProgress: (line) => { process.stderr.write(`${line}\n`); }
      });
    } catch (error) {
      const code = String(error?.code || '');
      const preCustody = code.startsWith('R2_AUTH_')
        || code.startsWith('R2_LIVE_')
        || code.startsWith('R2_UNBOUNDED_FORBIDDEN_')
        || code.startsWith('R2_CROSS_ESTATE_')
        || code.startsWith('R2_INVALID_')
        || code.startsWith('R2_UNKNOWN_');
      if (preCustody) {
        for (const p of createdPlaceholders) {
          try { if (fs.existsSync(p) && fs.statSync(p).size === 0) fs.unlinkSync(p); } catch { /* ignore */ }
        }
      } else {
        const heldErr = `${JSON.stringify({ schema: 'td613.marrowline.r2-error-held/v1', estate, error: { code, message: String(error?.message || error) } }, null, 2)}\n`;
        try { fs.writeFileSync(outPath, heldErr, { encoding: 'utf8', flag: 'w', mode: 0o600 }); } catch { /* ignore */ }
        try { fs.writeFileSync(summaryOutPath, `TD613 ${estate} HALTED (${code}): ${error?.message || error}\n`, { encoding: 'utf8', flag: 'w', mode: 0o600 }); } catch { /* ignore */ }
        if (blindedOutPath) {
          try {
            fs.writeFileSync(
              blindedOutPath,
              `${JSON.stringify({ schema: 'td613.marrowline.r2-w-blind-witness-held/v1', classification: 'HELD', blindedEpisodes: [] }, null, 2)}\n`,
              { encoding: 'utf8', flag: 'w', mode: 0o600 }
            );
          } catch { /* ignore */ }
        }
      }
      throw error;
    } finally {
      process.off('SIGINT', onSigint);
      process.off('SIGTERM', onSigterm);
    }

    fs.writeFileSync(outPath, `${JSON.stringify(result, null, 2)}\n`, { encoding: 'utf8', flag: 'w', mode: 0o600 });
    fs.writeFileSync(summaryOutPath, formatNonSecretOperatorSummary({ result, outPath, blindedOutPath }), { encoding: 'utf8', flag: 'w', mode: 0o600 });
    if (blindedOutPath) {
      fs.writeFileSync(blindedOutPath, `${JSON.stringify(buildPublicBlindedWArtifact(result), null, 2)}\n`, {
        encoding: 'utf8',
        flag: 'w',
        mode: 0o600
      });
    }
    return result;
  }

  // Default fail-closed offline preflight
  const expectedPlan = buildExpectedEstatePlan(estate);
  const checkedOutHeadSha = resolveCheckedOutGitHeadSha(process.cwd());
  const planId = getCliFlagValue(argv, '--plan') || 'INITIAL_PILOT';
  const selectedPlan = getR2PlanPreset(estate, planId);
  const availablePlans = Object.keys(estate === 'R2-U' ? R2_U_ACQUISITION_PLANS : R2_W_ACQUISITION_PLANS);

  return Object.freeze({
    schema: 'td613.marrowline.r2-runner-preflight/v1',
    estate,
    experimentId: spec.experimentId,
    grantSchema: spec.grantSchema,
    signingDomainSeparator: spec.domainSeparator,
    status: 'SOURCE_ONLY_QUALIFIED',
    trustAnchorProvisioned: R2_TRUSTED_OPERATOR_PUBLIC_KEY_SHA256 !== null,
    trustedPublicKeyFingerprintSha256: R2_TRUSTED_OPERATOR_PUBLIC_KEY_SHA256,
    paidProviderCallsExecuted: 0,
    countTokensCallsExecuted: 0,
    modelDiscoveryCallsExecuted: 0,
    resourceCeilingsImposedByTD613: 'NONE',
    publishedOutputCapacityTokens: spec.publishedOutputCapacity,
    checkedOutHeadSha,
    pinnedModel: spec.pinnedModel,
    thinkingLevel: spec.thinkingLevel,
    generationConfigSha256: expectedPlan.generationConfigSha256,
    availablePlans,
    selectedPlan: Object.freeze({
      planId: selectedPlan.planId,
      intendedScope: selectedPlan.intendedScope,
      episodeCount: selectedPlan.episodes.length,
      episodes: selectedPlan.episodes
    }),
    conditions: Object.keys(expectedPlan.conditions).map((key) => {
      const slot = expectedPlan.conditions[key];
      return {
        slotId: key,
        ...(slot.scenarioId ? { scenarioId: slot.scenarioId } : {}),
        bodySha256: slot.observation.bodySha256,
        modelAndBodySha256: slot.observation.modelAndBodySha256,
        generationConfigSha256: slot.observation.generationConfigSha256,
        countTokensRequestSha256: slot.countTokensRequestSha256,
        utf8Bytes: slot.observation.utf8Bytes
      };
    })
  });
}
