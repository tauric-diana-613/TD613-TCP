// TD613 · Marrowline R2 · Unsigned Single-Use Grant Builder & Human-Interactive Offline Signer
// Commission: TD613-MARROWLINE-R2-LIVE-RUNNER-20261123
// Covenant: Khona‌lit-po (literal U+200C preserved) · Seal: ⟐SAC[X6ZNK5NO51]
// BOUNDARY: Agents and offline tests may build unsigned canonical payloads (--build-unsigned-payload).
// Private-key signing is restricted strictly to direct human terminal execution outside test contexts.

import crypto from 'node:crypto';
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
import {
  R2_ESTATE_SPECS,
  R2_TRUSTED_COVENANT,
  R2_TRUSTED_SEAL,
  R2ObservationError,
  buildExpectedEstatePlan,
  canonicalizeR2AuthorizationPayload
} from './r2-custody-gate-verifier.mjs';
import {
  R2_TRUSTED_OPERATOR_PUBLIC_KEY_SHA256,
  resolveCheckedOutGitHeadSha
} from './r2-runner-cli-common.mjs';

export function buildUnsignedR2GrantPayload({
  estate,
  checkedOutHeadSha = resolveCheckedOutGitHeadSha(process.cwd()),
  authorizedBy = 'Tauric Diana',
  permittedPurpose = null,
  sessionId = null,
  nonce = null,
  issuedAt = new Date().toISOString(),
  notAfter = null
} = {}) {
  const spec = R2_ESTATE_SPECS[estate];
  if (!spec) {
    throw new R2ObservationError('R2_UNKNOWN_ESTATE', `Unknown estate ${estate}`);
  }
  if (!/^[0-9a-f]{40}$/.test(String(checkedOutHeadSha || ''))) {
    throw new R2ObservationError('R2_INVALID_HEAD_SHA', 'checkedOutHeadSha must be a 40-char lowercase hex git SHA');
  }

  const plan = buildExpectedEstatePlan(estate);
  const conditions = {};
  for (const [slotId, slot] of Object.entries(plan.conditions)) {
    conditions[slotId] = {
      bodySha256: slot.observation.bodySha256,
      modelAndBodySha256: slot.observation.modelAndBodySha256,
      countTokensRequestSha256: slot.countTokensRequestSha256
    };
  }

  const resolvedSessionId = sessionId || `r2_${estate.toLowerCase().replace(/[^a-z0-9]/g, '')}_${crypto.randomBytes(6).toString('hex')}`;
  const resolvedNonce = nonce || `wx_${crypto.randomBytes(12).toString('hex')}`;
  const resolvedPurpose = permittedPurpose || (
    estate === 'R2-U'
      ? 'Authorized single-session R2-U native Unicode capability observation'
      : 'Authorized single-session R2-W authentic whole-frame artistic observation'
  );

  const payload = {
    schema: spec.grantSchema,
    estate,
    experimentId: spec.experimentId,
    pinnedModel: spec.pinnedModel,
    thinkingLevel: spec.thinkingLevel,
    sessionMode: 'OPERATOR_CONTROLLED_UNBOUNDED_OBSERVATION',
    permittedPurpose: resolvedPurpose,
    sessionId: resolvedSessionId,
    checkedOutHeadSha,
    generationConfigSha256: plan.generationConfigSha256,
    generationConfig: plan.generationConfig,
    conditions,
    issuedAt,
    nonce: resolvedNonce,
    authorizedBy,
    covenant: R2_TRUSTED_COVENANT,
    seal: R2_TRUSTED_SEAL,
    ...(notAfter ? { notAfter } : {})
  };

  return Object.freeze({
    estate,
    domainSeparator: spec.domainSeparator,
    signingMessageUtf8: canonicalizeR2AuthorizationPayload(estate, payload),
    payload
  });
}

function getFlag(argv, flag) {
  const idx = argv.indexOf(flag);
  if (idx === -1 || idx + 1 >= argv.length) return null;
  const val = argv[idx + 1];
  return val && !val.startsWith('--') ? val : null;
}

function readPassphraseFromStdinSync() {
  const chunks = [];
  const buf = Buffer.alloc(1024);
  while (true) {
    let n = 0;
    try {
      n = fs.readSync(0, buf, 0, buf.length, null);
    } catch (error) {
      if (error?.code === 'EAGAIN') continue;
      throw error;
    }
    if (n <= 0) break;
    chunks.push(Buffer.from(buf.subarray(0, n)));
  }
  buf.fill(0);
  const full = Buffer.concat(chunks);
  const pass = full.toString('utf8').replace(/\r?\n$/, '');
  full.fill(0);
  return pass;
}

async function runCli(argv = process.argv.slice(2)) {
  const args = new Set(argv);
  const estate = getFlag(argv, '--estate') || 'R2-U';
  const sessionId = getFlag(argv, '--session-id');
  const authorizedBy = getFlag(argv, '--authorized-by') || 'Tauric Diana';
  const purpose = getFlag(argv, '--purpose');
  const notAfter = getFlag(argv, '--not-after');

  const unsigned = buildUnsignedR2GrantPayload({
    estate,
    sessionId,
    authorizedBy,
    permittedPurpose: purpose,
    notAfter
  });

  if (args.has('--sign-interactively')) {
    if (process.env.NODE_TEST_CONTEXT || process.env.CI) {
      throw new R2ObservationError('R2_SIGNING_FORBIDDEN_IN_AUTOMATION_OR_TESTS', 'Interactive human signing cannot execute inside tests or CI');
    }
    const privateKeyFile = getFlag(argv, '--private-key-file');
    const outGrantFile = getFlag(argv, '--out-grant-file');
    const outPubKeyFile = getFlag(argv, '--out-public-key-file');
    if (!privateKeyFile || !outGrantFile || !outPubKeyFile) {
      throw new R2ObservationError(
        'R2_SIGNING_ARGS_MISSING',
        '--sign-interactively requires --private-key-file, --out-grant-file, and --out-public-key-file'
      );
    }

    const encryptedPem = fs.readFileSync(privateKeyFile, 'utf8');
    let passphrase = readPassphraseFromStdinSync();
    let privateKey;
    try {
      privateKey = crypto.createPrivateKey({ key: encryptedPem, passphrase });
    } finally {
      passphrase = '';
    }
    const publicKey = crypto.createPublicKey(privateKey);
    const pubPem = publicKey.export({ type: 'spki', format: 'pem' });
    const spkiDer = publicKey.export({ type: 'spki', format: 'der' });
    const fp = crypto.createHash('sha256').update(spkiDer).digest('hex');
    if (fp !== R2_TRUSTED_OPERATOR_PUBLIC_KEY_SHA256) {
      throw new R2ObservationError(
        'R2_AUTH_UNTRUSTED_PUBLIC_KEY',
        `Loaded private key fingerprint (${fp}) does not match source-pinned trust anchor (${R2_TRUSTED_OPERATOR_PUBLIC_KEY_SHA256})`
      );
    }
    const sig = crypto.sign(null, Buffer.from(unsigned.signingMessageUtf8, 'utf8'), privateKey);
    const signedGrant = {
      algorithm: 'ed25519',
      payload: unsigned.payload,
      signatureBase64: sig.toString('base64')
    };
    fs.writeFileSync(outGrantFile, `${JSON.stringify(signedGrant, null, 2)}\n`, { encoding: 'utf8', flag: 'wx', mode: 0o600 });
    fs.writeFileSync(outPubKeyFile, pubPem, { encoding: 'utf8', flag: 'w', mode: 0o600 });
    return {
      schema: 'td613.marrowline.r2-grant-signed-summary/v1',
      estate,
      sessionId: unsigned.payload.sessionId,
      nonce: unsigned.payload.nonce,
      checkedOutHeadSha: unsigned.payload.checkedOutHeadSha,
      publicKeySha256: fp,
      grantFile: outGrantFile,
      publicKeyFile: outPubKeyFile
    };
  }

  // Safe default: print unsigned canonical payload structure ONLY (0 keys touched)
  return {
    schema: 'td613.marrowline.r2-unsigned-grant-preview/v1',
    note: 'Unsigned single-use payload preview only (0 private keys touched).',
    ...unsigned
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runCli(process.argv.slice(2)).then((out) => {
    process.stdout.write(`${JSON.stringify(out, null, 2)}\n`);
  }).catch((error) => {
    process.stderr.write(`${error?.code || error?.name || 'ERROR'}: ${error?.message || error}\n`);
    process.exitCode = 1;
  });
}
