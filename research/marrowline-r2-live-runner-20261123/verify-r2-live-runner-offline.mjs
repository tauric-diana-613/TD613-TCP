// TD613 · Marrowline R2 · Pure Offline Live-Runner Verifier & Baseline Artifact Generator
// Commission: TD613-MARROWLINE-R2-LIVE-RUNNER-20261123
// Covenant: Khona‌lit-po (literal U+200C preserved) · Seal: ⟐SAC[X6ZNK5NO51]
// OFFLINE ONLY: Zero network calls, zero private keys, zero nonce claims.

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  R2_U_ACQUISITION_PLANS,
  R2_W_ACQUISITION_PLANS,
  classifyR2AcquisitionCompletion
} from './r2-acquisition-plans.mjs';
import { R2_ESTATE_SPECS, buildExpectedEstatePlan } from './r2-custody-gate-verifier.mjs';
import { buildR2HealthyBaselineCorrelation } from './r2-healthy-baseline-correlation.mjs';
import { runEstateRunnerCli } from './r2-runner-cli-common.mjs';
import { buildUnsignedR2GrantPayload } from './sign-r2-grant-interactive.mjs';

export const R2_LIVE_RUNNER_OFFLINE_SCHEMA = 'td613.marrowline.r2-live-runner-offline-verification/v1';

export async function runVerifyR2LiveRunnerOfflineCli(argv = []) {
  for (const bad of ['--execute', '--live', '--paid', '--sign', '--deploy']) {
    if (argv.includes(bad)) {
      throw new Error(`R2_OFFLINE_VERIFIER_FORBIDS_FLAG:${bad}`);
    }
  }

  const uPreflight = await runEstateRunnerCli('R2-U', []);
  const wPreflight = await runEstateRunnerCli('R2-W', []);
  assert.equal(uPreflight.paidProviderCallsExecuted, 0);
  assert.equal(wPreflight.paidProviderCallsExecuted, 0);
  assert.equal(uPreflight.trustAnchorProvisioned, true);
  assert.equal(wPreflight.trustAnchorProvisioned, true);

  const baselineCorrelation = buildR2HealthyBaselineCorrelation();
  const unsignedU = buildUnsignedR2GrantPayload({
    estate: 'R2-U',
    checkedOutHeadSha: uPreflight.checkedOutHeadSha,
    issuedAt: '2026-11-23T09:00:00.000Z',
    sessionId: 'r2u_offline_preview',
    nonce: 'wx_offline_preview_r2u_0001'
  });
  const unsignedW = buildUnsignedR2GrantPayload({
    estate: 'R2-W',
    checkedOutHeadSha: wPreflight.checkedOutHeadSha,
    issuedAt: '2026-11-23T09:00:00.000Z',
    sessionId: 'r2w_offline_preview',
    nonce: 'wx_offline_preview_r2w_0001'
  });

  // Verify scope guard refuses classifying single-slot pilot as complete multi-episode comparison
  const limitedScope = classifyR2AcquisitionCompletion({
    estate: 'R2-U',
    plannedEpisodes: R2_U_ACQUISITION_PLANS.INITIAL_SINGLE_ARM_LITERAL_CHECK.episodes,
    episodeSummaries: [{
      episodeId: 1,
      contrastId: 'LITERAL_COPY_REPRODUCTION_ONLY',
      order: 'SINGLE_SLOT',
      sequence: ['R2_U_LITERAL_COPY'],
      attemptedSlotsCount: 1,
      validSlotsCount: 1,
      allSlotsValid: true,
      held: false
    }]
  });
  assert.equal(limitedScope.classification, 'LIMITED_INITIAL_SINGLE_OBSERVATION');
  assert.equal(limitedScope.multiEpisodeComparisonCompleted, false);

  const summary = Object.freeze({
    schema: R2_LIVE_RUNNER_OFFLINE_SCHEMA,
    commission: 'TD613-MARROWLINE-R2-LIVE-RUNNER-20261123',
    status: 'R2_LIVE_READY_HUMAN_AUTHORIZATION_REQUIRED',
    paidProviderCallsExecuted: 0,
    credentialsAccessed: false,
    privateKeysAccessed: false,
    nonceClaimsWritten: 0,
    r2U: Object.freeze({
      grantSchema: R2_ESTATE_SPECS['R2-U'].grantSchema,
      domainSeparator: R2_ESTATE_SPECS['R2-U'].domainSeparator,
      armCount: Object.keys(buildExpectedEstatePlan('R2-U').conditions).length,
      plans: Object.keys(R2_U_ACQUISITION_PLANS),
      unsignedGrantDomainPrefixOk: unsignedU.signingMessageUtf8.startsWith('TD613_R2_U_AUTH_V1\n')
    }),
    r2W: Object.freeze({
      grantSchema: R2_ESTATE_SPECS['R2-W'].grantSchema,
      domainSeparator: R2_ESTATE_SPECS['R2-W'].domainSeparator,
      conditionCount: Object.keys(buildExpectedEstatePlan('R2-W').conditions).length,
      plans: Object.keys(R2_W_ACQUISITION_PLANS),
      unsignedGrantDomainPrefixOk: unsignedW.signingMessageUtf8.startsWith('TD613_R2_W_AUTH_V1\n')
    }),
    healthyBaselineCorrelationSummary: Object.freeze({
      oct02SourceCommit: baselineCorrelation.healthySourceBasis.oct02SourceCommit,
      historicalTrialId: baselineCorrelation.healthySourceBasis.historicalTrialId,
      generationConfigMatches: baselineCorrelation.healthySourceBasis.matchesWFullGenerationConfigSha256,
      archivedReferenceCount: baselineCorrelation.archivedHealthyTextCorpusReference.references.length
    }),
    limitedScopeCheck: limitedScope
  });

  if (argv.includes('--write-artifacts')) {
    const outDir = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
    fs.writeFileSync(
      path.join(outDir, 'R2_HEALTHY_BASELINE_CORRELATION.json'),
      `${JSON.stringify(baselineCorrelation, null, 2)}\n`,
      'utf8'
    );
  }
  return summary;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runVerifyR2LiveRunnerOfflineCli(process.argv.slice(2)).then((out) => {
    process.stdout.write(`${JSON.stringify(out, null, 2)}\n`);
  }).catch((error) => {
    process.stderr.write(`${error?.code || error?.name || 'ERROR'}: ${error?.message || error}\n`);
    process.exitCode = 1;
  });
}
