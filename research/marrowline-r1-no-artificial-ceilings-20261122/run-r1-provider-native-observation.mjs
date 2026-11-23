// TD613 · The Screaming Grove · R1 Provider-Native Uncapped Observation Executable
// Commission: TD613-MARROWLINE-R1-NO-ARTIFICIAL-CEILINGS-20261122
// Covenant: Khona‌lit-po (literal U+200C preserved) · Seal: ⟐SAC[X6ZNK5NO51]
// SECURITY BOUNDARY:
// 1. FAIL-CLOSED OFFLINE BY DEFAULT (0 provider calls, 0 credential reads, 0 nonce writes).
// 2. Contains ZERO test trust overrides, ZERO NODE_TEST_CONTEXT branches, ZERO mock fetch hooks,
//    and ZERO checked-out HEAD overrides. Test keys CANNOT reach real provider dispatch.

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  R1ProviderNativeError,
  R1_NATIVE_RUNNER_SCHEMA,
  buildProviderNativeConditionPlans,
  executeProviderNativeCore
} from './r1-provider-native-core.mjs';

// Operator-attested Ed25519 SPKI DER SHA-256 public-key fingerprint (non-secret trust anchor).
// Private key and passphrase remain strictly under offline human operator custody.
export const R1_NATIVE_TRUSTED_OPERATOR_PUBLIC_KEY_SHA256 = '840a71625f4b9db224871bbb126b6debc3fefdc9179b5628bd9faf514f2c7701';

const ALLOWED_EXECUTABLE_OPTIONS = new Set([
  'acknowledgeLiveExecution',
  'grant',
  'publicKeyPem',
  'evidenceDir',
  'revocationFilePath',
  'episodes',
  'measureCountTokens',
  'checkModelDiscovery',
  'operatorAbortSignal'
]);

export function resolveCheckedOutGitHeadSha(repoRoot = process.cwd()) {
  try {
    const out = execFileSync('git', ['rev-parse', 'HEAD'], {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe']
    }).trim();
    if (!/^[0-9a-f]{40}$/.test(out)) {
      throw new R1ProviderNativeError('R1_INVALID_CHECKED_OUT_HEAD', `Invalid git HEAD SHA: ${out}`);
    }
    return out;
  } catch (error) {
    if (error instanceof R1ProviderNativeError) throw error;
    throw new R1ProviderNativeError('R1_GIT_HEAD_RESOLUTION_FAILED', `Could not resolve checked-out git HEAD: ${error?.message || error}`);
  }
}

export async function executeProviderNativeR1Observation(options = {}) {
  if (!options || typeof options !== 'object' || Array.isArray(options)) {
    throw new R1ProviderNativeError('R1_INVALID_OPTIONS', 'Options must be an object');
  }
  for (const key of Object.keys(options)) {
    if (!ALLOWED_EXECUTABLE_OPTIONS.has(key)) {
      throw new R1ProviderNativeError(
        'R1_UNBOUNDED_FORBIDDEN_EXECUTABLE_OVERRIDE',
        `Production executable rejects unrecognized or test-override option "${key}"`
      );
    }
  }

  return executeProviderNativeCore({
    acknowledgeLiveExecution: options.acknowledgeLiveExecution === true,
    grant: options.grant ?? null,
    publicKeyPem: options.publicKeyPem ?? null,
    // Hard-bound solely to reviewed source constant and real host transport/git HEAD:
    pinnedTrustFingerprintSha256: R1_NATIVE_TRUSTED_OPERATOR_PUBLIC_KEY_SHA256,
    checkedOutHeadSha: resolveCheckedOutGitHeadSha(process.cwd()),
    transportFetch: globalThis.fetch,
    evidenceDir: options.evidenceDir ?? null,
    revocationFilePath: options.revocationFilePath ?? null,
    env: process.env,
    nowMs: Date.now(),
    episodes: options.episodes ?? [{ episodeId: 1, order: 'A_THEN_B' }],
    measureCountTokens: options.measureCountTokens !== false,
    checkModelDiscovery: true,
    operatorAbortSignal: options.operatorAbortSignal ?? null
  });
}

function getCliFlagValue(argv, flag) {
  const idx = argv.indexOf(flag);
  if (idx === -1 || idx + 1 >= argv.length) return null;
  const val = argv[idx + 1];
  return val && !val.startsWith('--') ? val : null;
}

function parseEpisodesFlag(raw) {
  if (!raw) return [{ episodeId: 1, order: 'A_THEN_B' }];
  const tokens = String(raw).split(',').map((s) => s.trim()).filter(Boolean);
  if (!tokens.length) throw new R1ProviderNativeError('R1_INVALID_EPISODES_PLAN', 'Empty --episodes list');
  return tokens.map((order, i) => ({ episodeId: i + 1, order }));
}

export function buildPublicBlindedArtifact(result) {
  return {
    schema: 'td613.marrowline.r1-provider-native-blind-witness/v1',
    sourceRole: 'BLIND_READERS_ONLY',
    humanArtisticAcceptance: 'RESERVED_HUMAN_ONLY',
    experimentId: result.experimentId,
    blindedEpisodes: (result.blindedEpisodes || []).map((ep) => ({
      episodeId: ep.episodeId,
      blindedItems: ep.blindedItems
    }))
  };
}

async function runCli(argv = process.argv.slice(2)) {
  const args = new Set(argv);
  if (args.has('--live') || args.has('--count-tokens')) {
    throw new R1ProviderNativeError(
      'R1_CLI_LIVE_DISPATCH_HELD',
      'Unauthorized --live/--count-tokens flags rejected; signed Ed25519 grant and source-pinned trust anchor required.'
    );
  }
  if (args.has('--execute')) {
    if (!args.has('--ack-live-r1-observation')) {
      throw new R1ProviderNativeError(
        'R1_LIVE_EXECUTION_NOT_ACKNOWLEDGED',
        '--execute requires --ack-live-r1-observation, --grant-file <path>, --public-key-file <path>, --evidence-dir <abs>, --out <abs>'
      );
    }
    const grantFile = getCliFlagValue(argv, '--grant-file');
    const publicKeyFile = getCliFlagValue(argv, '--public-key-file');
    const evidenceDir = getCliFlagValue(argv, '--evidence-dir');
    const outPath = getCliFlagValue(argv, '--out');
    const revocationFilePath = getCliFlagValue(argv, '--revocation-file');
    const episodes = parseEpisodesFlag(getCliFlagValue(argv, '--episodes'));

    if (!grantFile || !publicKeyFile) {
      throw new R1ProviderNativeError('R1_AUTH_MISSING', '--execute requires both --grant-file and --public-key-file');
    }
    if (!evidenceDir || !outPath || !path.isAbsolute(evidenceDir) || !path.isAbsolute(outPath)) {
      throw new R1ProviderNativeError(
        'R1_EXPLICIT_ABSOLUTE_EVIDENCE_PATHS_REQUIRED',
        'Live CLI requires explicit absolute --evidence-dir and --out before dispatching'
      );
    }

    const grant = JSON.parse(fs.readFileSync(grantFile, 'utf8'));
    const publicKeyPem = fs.readFileSync(publicKeyFile, 'utf8');
    const blindedOutPath = `${outPath}.blinded.json`;

    const outFd = fs.openSync(outPath, 'wx', 0o600);
    fs.closeSync(outFd);
    const blindFd = fs.openSync(blindedOutPath, 'wx', 0o600);
    fs.closeSync(blindFd);

    const cliAbortController = new AbortController();
    const onStopSignal = (sigName) => {
      if (!cliAbortController.signal.aborted) {
        cliAbortController.abort(new R1ProviderNativeError('R1_OPERATOR_SIGINT_OR_SIGTERM', `Operator ${sigName} manual stop`));
      }
    };
    const onSigint = () => onStopSignal('SIGINT');
    const onSigterm = () => onStopSignal('SIGTERM');
    process.on('SIGINT', onSigint);
    process.on('SIGTERM', onSigterm);

    let result;
    try {
      result = await executeProviderNativeR1Observation({
        acknowledgeLiveExecution: true,
        grant,
        publicKeyPem,
        evidenceDir,
        revocationFilePath,
        episodes,
        measureCountTokens: !args.has('--skip-count-tokens'),
        operatorAbortSignal: cliAbortController.signal
      });
    } catch (error) {
      const code = String(error?.code || '');
      const preCustody = code.startsWith('R1_AUTH_') || code.startsWith('R1_LIVE_') || code.startsWith('R1_UNBOUNDED_FORBIDDEN_') || code.startsWith('R1_INVALID_EPISODE');
      if (preCustody) {
        for (const p of [outPath, blindedOutPath]) {
          try { if (fs.existsSync(p) && fs.statSync(p).size === 0) fs.unlinkSync(p); } catch { /* ignore */ }
        }
      } else {
        const heldErr = `${JSON.stringify({ schema: 'td613.marrowline.r1-error-held/v1', error: { code, message: String(error?.message || error) } }, null, 2)}\n`;
        try { fs.writeFileSync(outPath, heldErr, { encoding: 'utf8', flag: 'w', mode: 0o600 }); } catch { /* ignore */ }
        try {
          fs.writeFileSync(
            blindedOutPath,
            `${JSON.stringify({ schema: 'td613.marrowline.r1-blind-witness-held/v1', classification: 'HELD', blindedEpisodes: [] }, null, 2)}\n`,
            { encoding: 'utf8', flag: 'w', mode: 0o600 }
          );
        } catch { /* ignore */ }
      }
      throw error;
    } finally {
      process.off('SIGINT', onSigint);
      process.off('SIGTERM', onSigterm);
    }

    fs.writeFileSync(outPath, `${JSON.stringify(result, null, 2)}\n`, { encoding: 'utf8', flag: 'w', mode: 0o600 });
    fs.writeFileSync(blindedOutPath, `${JSON.stringify(buildPublicBlindedArtifact(result), null, 2)}\n`, {
      encoding: 'utf8',
      flag: 'w',
      mode: 0o600
    });
    return result;
  }

  const plan = buildProviderNativeConditionPlans();
  const checkedOutHeadSha = resolveCheckedOutGitHeadSha(process.cwd());
  return Object.freeze({
    schema: R1_NATIVE_RUNNER_SCHEMA,
    status: 'SOURCE_ONLY_QUALIFIED',
    trustAnchorProvisioned: R1_NATIVE_TRUSTED_OPERATOR_PUBLIC_KEY_SHA256 !== null,
    paidProviderCallsExecuted: 0,
    countTokensCallsExecuted: 0,
    modelDiscoveryCallsExecuted: 0,
    resourceCeilingsImposedByTD613: 'NONE',
    checkedOutHeadSha,
    experimentId: plan.experimentId,
    pinnedModel: plan.pinnedModel,
    thinkingLevel: plan.thinkingLevel,
    conditions: ['R1_NATIVE_A', 'R1_NATIVE_B'].map((key) => ({
      condition: key,
      arm: plan.conditions[key].arm,
      bodySha256: plan.conditions[key].observation.bodySha256,
      modelAndBodySha256: plan.conditions[key].observation.modelAndBodySha256,
      generationConfigSha256: plan.conditions[key].observation.generationConfigSha256,
      countTokensRequestSha256: plan.conditions[key].countTokensRequestSha256,
      utf8Bytes: plan.conditions[key].observation.utf8Bytes
    }))
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runCli(process.argv.slice(2)).then((summary) => {
    process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
  }).catch((error) => {
    process.stderr.write(`${error?.code || error?.name || 'ERROR'}: ${error?.message || error}\n`);
    process.exitCode = 1;
  });
}
