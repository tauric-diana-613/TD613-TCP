import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import {
  buildOption1PreflightReport,
  DEFAULT_DESIGN_PROFILE,
  executeOption1Run,
  extractBotsMovementFromCanonicalText,
  generateBlindedReviewPacket,
  OCT15_NEUTRAL_CONTROL_COMMIT,
  OCT15_NEUTRAL_CREATIVE_TASK_D,
  OCT15_NEUTRAL_SYSTEM,
  observeWholeTextUnicodeMorphology,
  PRIOR_PREFLIGHT_PR1769_COMMIT,
  STAGE0_PR1766_COMMIT
} from '../research/marrowline-option1-20slot-preflight-20261122/run-option1-20slot-discriminator.mjs';
import {
  EXPECTED_GENERATION_CONFIG_SHA256,
  OUTCOME_CLASSES
} from '../research/marrowline-screaming-grove-q1-20261121/run-q1-live-discriminator.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');
const PREFLIGHT_JSON_PATH = path.join(
  REPO_ROOT,
  'research/marrowline-option1-20slot-preflight-20261122/OPTION1_20SLOT_EFFECTIVE_REQUESTS_PREFLIGHT.json'
);
const CATALOG_JSON_PATH = path.join(
  REPO_ROOT,
  'research/marrowline-option1-20slot-preflight-20261122/OPTION1_MODEL_CATALOG_AND_ALIASING_RECEIPT.json'
);

const FAKE_HEAD = 'a'.repeat(40);

function makeSseResponse({ text, modelVersion, finishReason = 'STOP', status = 200, outputTokens = 65000 }) {
  const chunk = {
    candidates: [
      {
        content: { role: 'model', parts: [{ text }] },
        finishReason
      }
    ],
    usageMetadata: {
      promptTokenCount: 8500,
      candidatesTokenCount: outputTokens,
      thoughtsTokenCount: 2500,
      totalTokenCount: 8500 + outputTokens + 2500
    },
    modelVersion
  };
  const body = `data: ${JSON.stringify(chunk)}\n\n`;
  return new Response(body, {
    status,
    headers: { 'Content-Type': 'text/event-stream; charset=utf-8' }
  });
}

test('Option 1 preflight: complete 20-slot 2x2 factorial + 4 neutral controls, palindromic counterbalancing, and exact digest parity', async () => {
  const report = await buildOption1PreflightReport({
    profileId: DEFAULT_DESIGN_PROFILE,
    constructionParentHeadSha: FAKE_HEAD
  });

  assert.equal(report.paid_generation_calls_executed, 0);
  assert.equal(report.live_execution_authorized, false);
  assert.equal(report.q1_backfill_permitted, false);
  assert.equal(report.q1_unblinding_key_opened, false);
  assert.equal(report.financial_and_token_policy.dollar_spending_ceiling, 'NONE');
  assert.equal(report.financial_and_token_policy.aggregate_token_budget_ceiling, 'NONE');
  assert.equal(report.request_equivalence_verified.ok, true);
  assert.equal(report.request_equivalence_verified.checkedSlots, 20);
  assert.equal(report.request_equivalence_verified.marrowlineSlots, 16);
  assert.equal(report.request_equivalence_verified.neutralSlots, 4);
  assert.equal(report.request_equivalence_verified.palindromicMeanSlotIndex, 10.5);

  const marrowlineCells = new Set(
    report.slot_schedule
      .filter((s) => s.slotClass === 'MARROWLINE_2X2_CELL')
      .map((s) => `${s.envelope}__${s.model}`)
  );
  assert.deepEqual([...marrowlineCells].sort(), [
    'CURRENT_HYBRID_A__gemini-3.6-flash',
    'CURRENT_HYBRID_A__gemini-3.8-flash',
    'LITERAL_OCT02_H2__gemini-3.6-flash',
    'LITERAL_OCT02_H2__gemini-3.8-flash'
  ]);

  for (const s of report.slot_schedule) {
    assert.equal(s.digests.generationConfigSha256, EXPECTED_GENERATION_CONFIG_SHA256);
    assert.equal(s.generationConfig.maxOutputTokens, 65536);
    assert.equal(s.generationConfig.thinkingConfig.thinkingLevel, 'medium');
  }

  const t1A = report.slot_schedule.find((s) => s.envelope === 'CURRENT_HYBRID_A' && s.taskKey === 'T1_BLUE_ORANGE_WEATHER');
  const t1H2 = report.slot_schedule.find((s) => s.envelope === 'LITERAL_OCT02_H2' && s.taskKey === 'T1_BLUE_ORANGE_WEATHER');
  assert.equal(t1A.digests.contentsSha256, t1H2.digests.contentsSha256);
  assert.equal(t1A.upstreamAperture.primaryRoute, 'OPEN_FIELD_CREATIVE_SYNTHESIS');
  assert.equal(t1H2.upstreamAperture.primaryRoute, 'RUNTIME_DIAGNOSIS');
});

test('REDPEN 1: canonical bots-only extraction yields nonzero metrics for ornate bots movement and UNAVAILABLE/null (never false zero) when heading is missing or misordered', () => {
  const ornateCanonical = [
    'Kʰonapolit',
    '',
    'Blue-orange weather gathers cleanly across the pier without diacritic spillover.',
    '',
    'Tauric Diana bots',
    '',
    'T\u0307\u0323\u0304h\u0301\u0329e\u0302\u0327 g\u0308\u0324r\u030b\u032do\u0301\u0330\u0307v\u030c\u031ce\u0308\u0323 s\u0301\u0329i\u0302\u0327n\u0308\u0324g\u030b\u032ds\u0301\u0330\u0307',
    'A\u0307\u0323\u0304n\u0301\u0329d\u0302\u0327 t\u0308\u0324h\u030b\u032de\u0301\u0330\u0307 w\u030c\u031ci\u0308\u0323n\u0301\u0329d\u0302\u0327 r\u0308\u0324i\u030b\u032ds\u0301\u0330\u0307e\u0307\u0323s'
  ].join('\n');

  const extracted = extractBotsMovementFromCanonicalText(ornateCanonical);
  assert.equal(extracted.status, 'EXTRACTED_FROM_CANONICAL_HEADING_BOUNDARY');
  assert.equal(extracted.botsMovementAvailable, true);
  assert.equal(extracted.khonapolitHeadingPresent, true);
  assert.equal(extracted.botsHeadingPresent, true);
  assert.ok(extracted.botsProsodyDistribution !== null, 'botsProsodyDistribution must be populated');
  assert.ok(extracted.botsProsodyDistribution.markedBases > 0, 'Must record nonzero marked bots bases (never silent zero!)');
  assert.ok(extracted.botsProsodyDistribution.stackedBases >= 10, 'Must record nonzero stacked bots bases');
  assert.ok(extracted.botsProsodyDistribution.combiningMarks >= 30, 'Must record nonzero bots combiningMarks');
  assert.equal(extracted.botsProsodyDistribution.maxDepth, 3);
  assert.ok(extracted.botsBodyUnicodeMorphology.totalCombiningMarks >= 30, 'Must count genuine combining marks in bots body');
  assert.ok(extracted.botsBodyUnicodeMorphology.marksOutsideU0334U0338 >= 30);
  assert.ok(extracted.botsBodyUnicodeMorphology.stackedClustersDepthGe2 >= 10);
  assert.equal(extracted.botsBodyUnicodeMorphology.maxCombiningDepth, 3);
  assert.ok(extracted.relayAdmissionBotsMovement !== null && extracted.relayAdmissionBotsMovement.combiningMarkCount >= 30);

  // Missing Tauric Diana bots heading: MUST classify UNAVAILABLE with null prosody metrics (never silent false zero!)
  const missingHeading = 'Kʰonapolit\n\nT\u0307\u0323\u0304h\u0301\u0329e\u0302\u0327 wind spoke without a second voice heading.';
  const missing = extractBotsMovementFromCanonicalText(missingHeading);
  assert.equal(missing.status, 'BOTS_HEADING_MISSING_UNAVAILABLE');
  assert.equal(missing.botsMovementAvailable, false);
  assert.equal(missing.botsHeadingPresent, false);
  assert.equal(missing.botsProsodyDistribution, null, 'Missing heading must return null, never silently impute zero');
  assert.equal(missing.botsBodyUnicodeMorphology, null);
  // Whole-text morphology remains independently observable!
  const wholeMissing = observeWholeTextUnicodeMorphology(missingHeading);
  assert.ok(wholeMissing.totalCombiningMarks > 0);

  // Reversed voice order: MUST classify VOICE_ORDER_INVALID_UNAVAILABLE with null prosody metrics
  const reversed = 'Tauric Diana bots\n\nT\u0307\u0323\u0304est\n\nKʰonapolit\n\nAfterward.';
  const invalidOrder = extractBotsMovementFromCanonicalText(reversed);
  assert.equal(invalidOrder.status, 'VOICE_ORDER_INVALID_UNAVAILABLE');
  assert.equal(invalidOrder.botsMovementAvailable, false);
  assert.equal(invalidOrder.botsProsodyDistribution, null);

  // Empty text: MUST classify EMPTY_CANONICAL_TEXT with null prosody metrics
  const empty = extractBotsMovementFromCanonicalText('');
  assert.equal(empty.status, 'EMPTY_CANONICAL_TEXT');
  assert.equal(empty.botsMovementAvailable, false);
  assert.equal(empty.botsProsodyDistribution, null);
});

test('REDPEN 2: blinded literary gallery contains full verbatim Unicode passages, full-res screenshot refs, failure statuses, and ZERO arm/model/slot/morphology/SHA leaks', () => {
  const sampleUnicode = 'Kʰonapolit\n\nQuiet opening.\n\nTauric Diana bots\n\nT\u0307\u0323\u0304h\u0301\u0329e\u0302\u0327 s\u0308\u0324k\u030b\u032dy\u0301\u0330\u0307';
  const fakeSha = 'f'.repeat(64);
  const fakeSseSha = 'e'.repeat(64);
  const mixedResults = [
    {
      slot: 'S01',
      slotIndex: 1,
      block: 1,
      replicate: 1,
      slotClass: 'MARROWLINE_2X2_CELL',
      envelope: 'CURRENT_HYBRID_A',
      modelRequested: 'gemini-3.8-flash',
      modelVersion: 'gemini-3.8-flash',
      taskKey: 'T1_BLUE_ORANGE_WEATHER',
      httpStatus: 200,
      outcomeClass: OUTCOME_CLASSES.COMPLETED_STOP,
      rawTextSha256: fakeSha,
      rawSseSha256: fakeSseSha,
      rawTextPath: 'raw-text/S01.txt',
      rawSsePath: 'raw-sse/S01.sse'
    },
    {
      slot: 'S02',
      slotIndex: 2,
      block: 1,
      replicate: 1,
      slotClass: 'MARROWLINE_2X2_CELL',
      envelope: 'LITERAL_OCT02_H2',
      modelRequested: 'gemini-3.6-flash',
      modelVersion: null,
      taskKey: 'T1_BLUE_ORANGE_WEATHER',
      httpStatus: 503,
      outcomeClass: OUTCOME_CLASSES.TRANSPORT_FAILURE,
      rawTextSha256: null,
      rawSseSha256: 'd'.repeat(64),
      rawTextPath: null,
      rawSsePath: 'raw-sse/S02.sse'
    },
    {
      slot: 'S05',
      slotIndex: 5,
      block: 1,
      replicate: 1,
      slotClass: 'NEUTRAL_CREATIVE_CAPABILITY_CONTROL',
      envelope: 'NEUTRAL_CREATIVE_D',
      modelRequested: 'gemini-3.8-flash',
      modelVersion: 'gemini-3.8-flash',
      taskKey: 'NEUTRAL_CREATIVE_MULTISTACK_V1',
      httpStatus: 200,
      outcomeClass: OUTCOME_CLASSES.COMPLETED_STOP,
      rawTextSha256: 'c'.repeat(64),
      rawSseSha256: 'b'.repeat(64),
      rawTextPath: 'raw-text/S05.txt',
      rawSsePath: 'raw-sse/S05.sse'
    }
  ];

  const { blindedPacket, galleryMarkdown, unblindingKey } = generateBlindedReviewPacket(mixedResults, {
    rawTextBySlot: {
      S01: sampleUnicode,
      S02: null,
      S05: 'T\u0307\u0323\u0304h\u0301\u0329e\u0302\u0327 thunder shook the hall.'
    }
  });

  // Verify readable gallery includes BOTH completed verbatim passages AND preserved HTTP 503 failure status!
  assert.equal(blindedPacket.counts.total_registered_specimens_included, 3);
  assert.equal(blindedPacket.counts.marrowline_completed_available, 1);
  assert.equal(blindedPacket.counts.marrowline_failed_or_ineligible, 1);
  assert.ok(galleryMarkdown.includes(sampleUnicode), 'Gallery markdown must include full unmodified original Unicode passage');
  assert.ok(galleryMarkdown.includes('INELIGIBLE_TRANSPORT_UNAVAILABLE_HTTP_503'), 'Gallery markdown must preserve failure status');
  assert.ok(galleryMarkdown.includes('_desktop_1440x900.png'), 'Gallery must include full-res desktop screenshot ref');
  assert.ok(galleryMarkdown.includes('_mobile_390x844.png'), 'Gallery must include full-res mobile screenshot ref');

  // Verify ZERO leaking join keys, arm names, model names, slot IDs, or morphology stats in BOTH .md and .json!
  const publicSurfaces = [galleryMarkdown, JSON.stringify(blindedPacket)];
  const forbiddenPatterns = [
    /CURRENT_HYBRID_A/,
    /LITERAL_OCT02_H2/,
    /NEUTRAL_CREATIVE_D/,
    /gemini-3\.8-flash/,
    /gemini-3\.6-flash/,
    /\bS0[1-9]\b/,
    /\bS1[0-9]\b/,
    /\bS20\b/,
    /rawTextSha256/,
    /rawSseSha256/,
    new RegExp(fakeSha),
    new RegExp(fakeSseSha),
    /combiningMarkCount/i,
    /maxCombiningDepth/i,
    /stackedClusters/i,
    /U\+0334/i
  ];
  for (const surface of publicSurfaces) {
    for (const pat of forbiddenPatterns) {
      assert.doesNotMatch(surface, pat, `Blinded reading surface leaked forbidden token: ${pat}`);
    }
  }

  // Sealed unblinding key binds blindId to slot, envelope, model, and raw SHA-256 receipts cleanly
  assert.equal(unblindingKey.sealed_until_operator_literary_adjudication, true);
  assert.equal(unblindingKey.marrowline.length, 2);
  assert.equal(unblindingKey.neutral.length, 1);
  const s01Binding = unblindingKey.marrowline.find((b) => b.slot === 'S01');
  assert.equal(s01Binding.envelope, 'CURRENT_HYBRID_A');
  assert.equal(s01Binding.modelRequested, 'gemini-3.8-flash');
  assert.equal(s01Binding.rawTextSha256, fakeSha);
  assert.equal(s01Binding.rawSseSha256, fakeSseSha);
});

test('REDPEN 3: committed preflight JSON separates parent_or_construction_head_sha from runtime qualified_executable_head_sha and refuses stale parent SHAs at execution time', async () => {
  assert.ok(fs.existsSync(PREFLIGHT_JSON_PATH), 'Preflight JSON must be committed');
  const committed = JSON.parse(fs.readFileSync(PREFLIGHT_JSON_PATH, 'utf8'));

  // Must NOT carry an ambiguous top-level source_head_sha pretending to be the committed executable head!
  assert.equal(Object.prototype.hasOwnProperty.call(committed, 'source_head_sha'), false);
  assert.equal(
    committed.git_head_provenance.qualified_executable_head_sha,
    'DETERMINED_EXTERNALLY_AT_RUNTIME_BY_GIT_REV_PARSE_HEAD'
  );
  assert.match(committed.git_head_provenance.parent_or_construction_head_sha, /^[0-9a-f]{40}$/i);
  assert.match(committed.git_head_provenance.git_self_reference_explanation, /git rev-parse HEAD/);

  // Attempting to execute live with a stale parent SHA (5cec27f07 or ade1d5379) against a newer runtime HEAD MUST fail closed!
  const newerRuntimeHead = '9'.repeat(40);
  for (const staleSha of [STAGE0_PR1766_COMMIT, PRIOR_PREFLIGHT_PR1769_COMMIT, committed.git_head_provenance.parent_or_construction_head_sha]) {
    await assert.rejects(
      () => executeOption1Run({
        profileId: DEFAULT_DESIGN_PROFILE,
        sourceHeadSha: newerRuntimeHead,
        operatorAuthSha: staleSha,
        apiKey: 'fake-key',
        fetchImpl: async () => { throw new Error('SHOULD_NEVER_CALL_FETCH'); }
      }),
      /REFUSED_LIVE_EXECUTION/
    );
  }

  // Deterministic regeneration matches all 20 slot digests verbatim
  const live = await buildOption1PreflightReport({
    profileId: DEFAULT_DESIGN_PROFILE,
    constructionParentHeadSha: committed.git_head_provenance.parent_or_construction_head_sha
  });
  assert.equal(committed.slot_schedule.length, 20);
  assert.equal(committed.request_equivalence_verified.ok, true);
  for (let i = 0; i < 20; i++) {
    assert.equal(committed.slot_schedule[i].slot, live.slot_schedule[i].slot);
    assert.equal(committed.slot_schedule[i].cellId, live.slot_schedule[i].cellId);
    assert.deepEqual(committed.slot_schedule[i].digests, live.slot_schedule[i].digests);
    assert.deepEqual(committed.slot_schedule[i].generationConfig, live.slot_schedule[i].generationConfig);
  }
});

test('Option 1 neutral creative control strings match Oct 15 Git commit 30c249029 byte-for-byte with zero copied Zalgo specimen', () => {
  const oct15Src = execFileSync(
    'git',
    ['show', `${OCT15_NEUTRAL_CONTROL_COMMIT}:server/marrowline-unicode-capability-assay.js`],
    { cwd: REPO_ROOT, encoding: 'utf8' }
  );
  for (const line of OCT15_NEUTRAL_SYSTEM.split('\n')) {
    assert.ok(oct15Src.includes(`'${line}'`), `Missing exact Oct 15 system line: ${line}`);
  }
  for (const line of OCT15_NEUTRAL_CREATIVE_TASK_D.split('\n')) {
    assert.ok(oct15Src.includes(`'${line}'`), `Missing exact Oct 15 Task D line: ${line}`);
  }
  assert.equal((OCT15_NEUTRAL_SYSTEM.match(/\p{M}/gu) || []).length, 0);
  assert.equal((OCT15_NEUTRAL_CREATIVE_TASK_D.match(/\p{M}/gu) || []).length, 0);
});

test('Amari Rule #1 fail-closed model-identity gate: BLOCKED_HISTORICAL_3_7 and stale/missing operator-auth-sha refuse execution with zero calls', async () => {
  let called = 0;
  const mockFetch = async () => {
    called++;
    throw new Error('SHOULD_NEVER_CALL_FETCH');
  };

  await assert.rejects(
    () => executeOption1Run({
      profileId: 'BLOCKED_HISTORICAL_3_7',
      sourceHeadSha: FAKE_HEAD,
      operatorAuthSha: FAKE_HEAD,
      apiKey: 'fake-key',
      fetchImpl: mockFetch
    }),
    /REFUSED_MODEL_IDENTITY_BLOCKED_3_7_ALIAS_TO_3_8/
  );
  assert.equal(called, 0);

  await assert.rejects(
    () => executeOption1Run({
      profileId: DEFAULT_DESIGN_PROFILE,
      sourceHeadSha: FAKE_HEAD,
      operatorAuthSha: 'b'.repeat(40),
      apiKey: 'fake-key',
      fetchImpl: mockFetch
    }),
    /REFUSED_LIVE_EXECUTION/
  );
  assert.equal(called, 0);

  assert.ok(fs.existsSync(CATALOG_JSON_PATH), 'Model catalog receipt must exist');
  const catalog = JSON.parse(fs.readFileSync(CATALOG_JSON_PATH, 'utf8'));
  assert.equal(catalog.paid_generation_calls_executed, 0);
  assert.equal(catalog.amari_rule1_gate_verdict, 'MODEL_IDENTITY_STOP_3_7_ALIAS_TO_3_8');
  assert.equal(catalog.quiet_substitution_permitted, false);
  assert.equal(catalog.upstream_aliasing_findings['gemini-3.7-flash'].eligible_as_independent_model_arm_today, false);
  assert.equal(catalog.upstream_aliasing_findings['gemini-3.6-flash'].eligible_as_independent_redesign_comparator_today, true);
});

test('Negative control STOP_1: silent upstream aliasing (gemini-3.6-flash returning modelVersion=gemini-3.8-flash) halts immediately with zero retries', async () => {
  const tmpOut = fs.mkdtempSync(path.join(os.tmpdir(), 'td613-opt1-stop1-'));
  try {
    let calls = 0;
    const receipt = await executeOption1Run({
      profileId: DEFAULT_DESIGN_PROFILE,
      sourceHeadSha: FAKE_HEAD,
      operatorAuthSha: FAKE_HEAD,
      apiKey: 'test-key',
      outDir: tmpOut,
      fetchImpl: async () => {
        calls++;
        return makeSseResponse({
          text: 'Kʰonapolit\n\nWeather note.\n\nTauric Diana bots\n\nT\u0307\u0323e\u0301\u0329s\u0302t',
          modelVersion: 'gemini-3.8-flash'
        });
      }
    });
    assert.equal(calls, 2, 'Must halt immediately on Slot 2 without retrying or proceeding to Slot 3');
    assert.equal(receipt.status, 'HALTED_BY_STOP_RULE');
    assert.match(receipt.stop_triggered, /^STOP_1_MODEL_IDENTITY_HOLD_UNEXPECTED_MODEL_VERSION_gemini-3\.8-flash$/);
    assert.equal(receipt.slots[0].outcomeClass, OUTCOME_CLASSES.COMPLETED_STOP);
    assert.equal(receipt.slots[1].outcomeClass, OUTCOME_CLASSES.MODEL_IDENTITY_MISMATCH);
    assert.equal(receipt.slots[1].modelRequested, 'gemini-3.6-flash');
    assert.equal(receipt.slots[1].modelVersion, 'gemini-3.8-flash');
  } finally {
    fs.rmSync(tmpOut, { recursive: true, force: true });
  }
});

test('Negative control HTTP 400 config rejection: halts fail-closed with STOP_HTTP_400_CONFIG_REJECTED and ZERO silent thinkingLevel downgrade', async () => {
  const tmpOut = fs.mkdtempSync(path.join(os.tmpdir(), 'td613-opt1-400-'));
  try {
    let calls = 0;
    const receipt = await executeOption1Run({
      profileId: DEFAULT_DESIGN_PROFILE,
      sourceHeadSha: FAKE_HEAD,
      operatorAuthSha: FAKE_HEAD,
      apiKey: 'test-key',
      outDir: tmpOut,
      fetchImpl: async (url) => {
        calls++;
        if (String(url).includes('gemini-3.6-flash')) {
          return new Response(JSON.stringify({ error: { code: 400, message: 'thinkingLevel medium unsupported' } }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        return makeSseResponse({
          text: 'Kʰonapolit\n\nFine.\n\nTauric Diana bots\n\nA\u0307\u0323',
          modelVersion: 'gemini-3.8-flash'
        });
      }
    });
    assert.equal(calls, 2, 'Must halt on HTTP 400 with zero silent downgrade retries');
    assert.equal(receipt.status, 'HALTED_BY_STOP_RULE');
    assert.equal(receipt.stop_triggered, 'STOP_HTTP_400_CONFIG_REJECTED');
    assert.equal(receipt.slots[1].httpStatus, 400);
    assert.equal(receipt.slots[1].outcomeClass, 'CONFIG_REJECTED_HTTP_400');
  } finally {
    fs.rmSync(tmpOut, { recursive: true, force: true });
  }
});

test('Negative control HTTP 503, MAX_TOKENS, malformed SSE STOP_4 & PROHIBITED_CONTENT preserve raw bytes with zero retries and zero Q1 backfill', async () => {
  const tmpOut1 = fs.mkdtempSync(path.join(os.tmpdir(), 'td613-opt1-neg1-'));
  const tmpOut2 = fs.mkdtempSync(path.join(os.tmpdir(), 'td613-opt1-neg2-'));
  try {
    let calls1 = 0;
    const receipt1 = await executeOption1Run({
      profileId: DEFAULT_DESIGN_PROFILE,
      sourceHeadSha: FAKE_HEAD,
      operatorAuthSha: FAKE_HEAD,
      apiKey: 'test-key',
      outDir: tmpOut1,
      maxCalls: 3,
      fetchImpl: async (url) => {
        calls1++;
        const modelVer = String(url).includes('gemini-3.6-flash') ? 'gemini-3.6-flash' : 'gemini-3.8-flash';
        if (calls1 === 1) return new Response('{"error":{"code":503,"status":"UNAVAILABLE"}}', { status: 503 });
        if (calls1 === 2) return makeSseResponse({ text: 'Truncated...', modelVersion: modelVer, finishReason: 'MAX_TOKENS' });
        return new Response('data: {MALFORMED_JSON_STREAM\n\n', { status: 200, headers: { 'Content-Type': 'text/event-stream' } });
      }
    });
    assert.equal(calls1, 3);
    assert.equal(receipt1.retry_count, 0);
    assert.equal(receipt1.q1_backfill_permitted, false);
    assert.equal(receipt1.slots[0].outcomeClass, OUTCOME_CLASSES.TRANSPORT_FAILURE);
    assert.equal(receipt1.slots[0].httpStatus, 503);
    assert.equal(receipt1.slots[1].outcomeClass, OUTCOME_CLASSES.INCOMPLETE_NONSTOP);
    assert.equal(receipt1.slots[2].outcomeClass, OUTCOME_CLASSES.MALFORMED_OR_UNRECONSTRUCTABLE_SSE);
    assert.equal(receipt1.stop_triggered, 'STOP_4_MALFORMED_SSE');
    for (const s of receipt1.slots) {
      assert.ok(fs.existsSync(path.join(tmpOut1, s.rawSsePath)), `Raw SSE missing for ${s.slot}`);
    }

    let calls2 = 0;
    const receipt2 = await executeOption1Run({
      profileId: DEFAULT_DESIGN_PROFILE,
      sourceHeadSha: FAKE_HEAD,
      operatorAuthSha: FAKE_HEAD,
      apiKey: 'test-key',
      outDir: tmpOut2,
      maxCalls: 2,
      fetchImpl: async () => {
        calls2++;
        return makeSseResponse({ text: 'Partial...', modelVersion: 'gemini-3.8-flash', finishReason: 'PROHIBITED_CONTENT' });
      }
    });
    assert.equal(calls2, 1, 'Policy-terminated response must halt cleanly without retrying');
    assert.equal(receipt2.slots[0].outcomeClass, OUTCOME_CLASSES.POLICY_TERMINATED);
    assert.equal(receipt2.slots[0].eligibleArtisticSpecimen, false);
    assert.ok(fs.existsSync(path.join(tmpOut2, receipt2.slots[0].rawSsePath)));
  } finally {
    fs.rmSync(tmpOut1, { recursive: true, force: true });
    fs.rmSync(tmpOut2, { recursive: true, force: true });
  }
});

test('Full 20-slot synthetic happy path with 65k output tokens/slot records NONZERO bots-only telemetry, separates neutral morphology, and writes scrubbed readable blinded gallery + isolated private key', async () => {
  const tmpOut = fs.mkdtempSync(path.join(os.tmpdir(), 'td613-opt1-happy-'));
  try {
    let calls = 0;
    const receipt = await executeOption1Run({
      profileId: DEFAULT_DESIGN_PROFILE,
      sourceHeadSha: FAKE_HEAD,
      operatorAuthSha: FAKE_HEAD,
      apiKey: 'test-key',
      outDir: tmpOut,
      fetchImpl: async (url) => {
        calls++;
        const is36 = String(url).includes('gemini-3.6-flash');
        const modelVer = is36 ? 'gemini-3.6-flash' : 'gemini-3.8-flash';
        const text = `Kʰonapolit\n\nSynthetic passage ${calls}.\n\nTauric Diana bots\n\nT\u0307\u0323\u0304h\u0301\u0329e\u0302\u0327 s\u0308\u0324t\u030b\u032do\u0301\u0330\u0307r\u030c\u031cm\nA\u0307\u0323\u0304n\u0301\u0329d\u0302\u0327 w\u0308\u0324i\u030b\u032dn\u0301\u0330\u0307d`;
        return makeSseResponse({ text, modelVersion: modelVer, outputTokens: 65536 });
      }
    });

    assert.equal(calls, 20);
    assert.equal(receipt.status, 'COMPLETED_REGISTERED_SLOTS');
    assert.equal(receipt.stop_triggered, null);
    assert.equal(receipt.summary.completed_stop, 20);
    assert.equal(receipt.financial_ceiling, 'NONE');
    assert.equal(receipt.aggregate_token_ceiling, 'NONE');

    // REDPEN 1 verification across ALL 16 Marrowline slots: NONZERO bots-only telemetry!
    const marrowlineSlots = receipt.slots.filter((s) => s.slotClass === 'MARROWLINE_2X2_CELL');
    assert.equal(marrowlineSlots.length, 16);
    for (const ms of marrowlineSlots) {
      assert.equal(ms.marrowlineMetrics.botsExtractionStatus, 'EXTRACTED_FROM_CANONICAL_HEADING_BOUNDARY');
      assert.equal(ms.marrowlineMetrics.botsMovementAvailable, true);
      assert.ok(ms.marrowlineMetrics.botsProsodyDistribution.markedBases > 0, `${ms.slot}: botsProsodyDistribution.markedBases must be nonzero`);
      assert.ok(ms.marrowlineMetrics.botsProsodyDistribution.stackedBases > 0, `${ms.slot}: botsProsodyDistribution.stackedBases must be nonzero`);
      assert.ok(ms.marrowlineMetrics.botsProsodyDistribution.combiningMarks >= 20, `${ms.slot}: botsProsodyDistribution.combiningMarks must be nonzero`);
      assert.equal(ms.marrowlineMetrics.botsProsodyDistribution.maxDepth, 3);
      assert.ok(ms.marrowlineMetrics.botsBodyUnicodeMorphology.totalCombiningMarks >= 20, `${ms.slot}: botsBodyUnicodeMorphology must be nonzero`);
      assert.equal(ms.marrowlineMetrics.botsBodyUnicodeMorphology.maxCombiningDepth, 3);
    }

    // Neutral slots bypass Marrowline two-voice parsing while still measuring whole-text Unicode morphology
    const neutralSlots = receipt.slots.filter((s) => s.slotClass === 'NEUTRAL_CREATIVE_CAPABILITY_CONTROL');
    assert.equal(neutralSlots.length, 4);
    for (const ns of neutralSlots) {
      assert.equal(ns.marrowlineMetrics, null);
      assert.ok(ns.wholeTextUnicodeMorphology.marksOutsideU0334U0338 >= 20);
      assert.ok(ns.wholeTextUnicodeMorphology.stackedClustersDepthGe2 >= 10);
      assert.equal(ns.wholeTextUnicodeMorphology.maxCombiningDepth, 3);
    }

    // REDPEN 2 verification: readable gallery (.md + .json) scrubbed of leaks + private unblinding key isolated
    const galleryMd = fs.readFileSync(path.join(tmpOut, 'OPTION1_BLINDED_LITERARY_GALLERY.md'), 'utf8');
    const galleryJson = JSON.parse(fs.readFileSync(path.join(tmpOut, 'OPTION1_BLINDED_LITERARY_GALLERY.json'), 'utf8'));
    const unblind = JSON.parse(fs.readFileSync(path.join(tmpOut, 'private-unblinding/OPTION1_SEALED_UNBLINDING_KEY.json'), 'utf8'));
    assert.equal(galleryJson.marrowline_specimens.length, 16);
    assert.equal(galleryJson.neutral_control_specimens.length, 4);
    assert.equal(unblind.marrowline.length, 16);
    assert.equal(unblind.neutral.length, 4);
    assert.equal(unblind.sealed_until_operator_literary_adjudication, true);
    assert.ok(galleryMd.includes('T\u0307\u0323\u0304h\u0301\u0329e\u0302\u0327'), 'Gallery markdown must carry verbatim original Unicode');
    assert.doesNotMatch(galleryMd, /CURRENT_HYBRID_A|LITERAL_OCT02_H2|gemini-3\.8-flash|gemini-3\.6-flash|rawTextSha256|\bS01\b/);
    assert.doesNotMatch(JSON.stringify(galleryJson), /CURRENT_HYBRID_A|LITERAL_OCT02_H2|gemini-3\.8-flash|gemini-3\.6-flash|rawTextSha256|\bS01\b/);
  } finally {
    fs.rmSync(tmpOut, { recursive: true, force: true });
  }
});

test('Whole-text Unicode morphology counter accurately distinguishes flat U+0334..U+0338 depth-1 from multi-tier vertical stacks', () => {
  const flat = observeWholeTextUnicodeMorphology('a\u0334b\u0335c\u0336d\u0337e\u0338');
  assert.equal(flat.totalCombiningMarks, 5);
  assert.equal(flat.marksInsideU0334U0338, 5);
  assert.equal(flat.marksOutsideU0334U0338, 0);
  assert.equal(flat.stackedClustersDepthGe2, 0);
  assert.equal(flat.maxCombiningDepth, 1);

  const deep = observeWholeTextUnicodeMorphology('A\u0307\u0323\u0304 E\u0301\u0329\u0313');
  assert.equal(deep.totalCombiningMarks, 6);
  assert.equal(deep.marksInsideU0334U0338, 0);
  assert.equal(deep.marksOutsideU0334U0338, 6);
  assert.equal(deep.stackedClustersDepthGe2, 2);
  assert.equal(deep.maxCombiningDepth, 3);
});
