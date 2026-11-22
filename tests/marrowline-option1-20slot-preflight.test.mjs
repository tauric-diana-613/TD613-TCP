import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import {
  buildOption1PreflightReport,
  buildOption1Schedule,
  buildOption1SlotRequest,
  DEFAULT_DESIGN_PROFILE,
  DESIGN_PROFILES,
  executeOption1Run,
  EXPECTED_OPTION1_BASE_DIGESTS,
  HARD_MAX_CALLS,
  OCT15_NEUTRAL_CONTROL_COMMIT,
  OCT15_NEUTRAL_CREATIVE_TASK_D,
  OCT15_NEUTRAL_SYSTEM,
  observeWholeTextUnicodeMorphology
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
    sourceHeadSha: FAKE_HEAD
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

  // Confirm all 4 contemporaneous 2x2 cells exist (including contemporaneous A x 3.8 fixing Amari's redpen!)
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

  // Every single slot shares identical generationConfigSha256 (thinkingLevel=medium, maxOutputTokens=65536)
  for (const s of report.slot_schedule) {
    assert.equal(s.digests.generationConfigSha256, EXPECTED_GENERATION_CONFIG_SHA256);
    assert.equal(s.generationConfig.maxOutputTokens, 65536);
    assert.equal(s.generationConfig.thinkingConfig.thinkingLevel, 'medium');
  }

  // Confirm T1 Aperture divergence is explicitly recorded while contentsSha256 remains identical
  const t1A = report.slot_schedule.find((s) => s.envelope === 'CURRENT_HYBRID_A' && s.taskKey === 'T1_BLUE_ORANGE_WEATHER');
  const t1H2 = report.slot_schedule.find((s) => s.envelope === 'LITERAL_OCT02_H2' && s.taskKey === 'T1_BLUE_ORANGE_WEATHER');
  assert.equal(t1A.digests.contentsSha256, t1H2.digests.contentsSha256);
  assert.equal(t1A.upstreamAperture.primaryRoute, 'OPEN_FIELD_CREATIVE_SYNTHESIS');
  assert.equal(t1H2.upstreamAperture.primaryRoute, 'RUNTIME_DIAGNOSIS');
});

test('Option 1 neutral creative control strings match Oct 15 Git commit 30c249029 byte-for-byte with zero copied Zalgo specimen', () => {
  const oct15Src = execFileSync(
    'git',
    ['show', `${OCT15_NEUTRAL_CONTROL_COMMIT}:server/marrowline-unicode-capability-assay.js`],
    { cwd: REPO_ROOT, encoding: 'utf8' }
  );
  // Extract exact literal lines from Oct 15 source and verify exact equality
  for (const line of OCT15_NEUTRAL_SYSTEM.split('\n')) {
    assert.ok(oct15Src.includes(`'${line}'`), `Missing exact Oct 15 system line: ${line}`);
  }
  for (const line of OCT15_NEUTRAL_CREATIVE_TASK_D.split('\n')) {
    assert.ok(oct15Src.includes(`'${line}'`), `Missing exact Oct 15 Task D line: ${line}`);
  }
  // Confirm zero combining marks in neutral control prompt (no copied Zalgo specimen!)
  assert.equal((OCT15_NEUTRAL_SYSTEM.match(/\p{M}/gu) || []).length, 0);
  assert.equal((OCT15_NEUTRAL_CREATIVE_TASK_D.match(/\p{M}/gu) || []).length, 0);
});

test('Amari Rule #1 fail-closed model-identity gate: BLOCKED_HISTORICAL_3_7 and stale/missing operator-auth-sha refuse execution with zero calls', async () => {
  let called = 0;
  const mockFetch = async () => {
    called++;
    throw new Error('SHOULD_NEVER_CALL_FETCH');
  };

  // 1. Refuses BLOCKED_HISTORICAL_3_7 even with valid auth SHA
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

  // 2. Refuses mismatched/stale operator-auth-sha
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

  // 3. Model catalog receipt explicitly records MODEL_IDENTITY_STOP_3_7_ALIAS_TO_3_8 and 0 paid calls
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
      fetchImpl: async (url) => {
        calls++;
        // Slot 1 is 3.8-flash (passes); Slot 2 is 3.6-flash — simulate silent upstream alias returning 3.8-flash!
        const is36 = String(url).includes('gemini-3.6-flash');
        return makeSseResponse({
          text: 'Kʰonapolit\n\nWeather note.\n\nTauric Diana bots\n\nT\u0307\u0323e\u0301\u0329s\u0302t',
          modelVersion: 'gemini-3.8-flash' // Silent alias on Slot 2!
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

    // Separate sub-run verifying PROHIBITED_CONTENT stays POLICY_TERMINATED / HELD with zero retries
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

test('Full 20-slot synthetic happy path with 65k output tokens/slot completes with NO financial/token ceiling halt, separates neutral morphology, and writes blinded review packet', async () => {
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
        // Synthetic multi-tier combining marks (outside U+0334..U+0338)
        const text = `Kʰonapolit\n\nSynthetic passage ${calls}.\n\nTauric Diana bots\n\nT\u0307\u0323\u0304h\u0301\u0329e\u0302\u0327 s\u0308\u0324t\u030b\u032do\u0301\u0330r\u0307m`;
        return makeSseResponse({ text, modelVersion: modelVer, outputTokens: 65536 });
      }
    });

    assert.equal(calls, 20);
    assert.equal(receipt.status, 'COMPLETED_REGISTERED_SLOTS');
    assert.equal(receipt.stop_triggered, null);
    assert.equal(receipt.summary.completed_stop, 20);
    assert.equal(receipt.financial_ceiling, 'NONE');
    assert.equal(receipt.aggregate_token_ceiling, 'NONE');

    // Neutral slots bypass Marrowline two-voice parsing while still measuring whole-text Unicode morphology
    const neutralSlots = receipt.slots.filter((s) => s.slotClass === 'NEUTRAL_CREATIVE_CAPABILITY_CONTROL');
    assert.equal(neutralSlots.length, 4);
    for (const ns of neutralSlots) {
      assert.equal(ns.marrowlineMetrics, null);
      assert.ok(ns.wholeTextUnicodeMorphology.marksOutsideU0334U0338 >= 10);
      assert.ok(ns.wholeTextUnicodeMorphology.stackedClustersDepthGe2 >= 5);
      assert.ok(ns.wholeTextUnicodeMorphology.maxCombiningDepth >= 3);
    }

    // Blinded review packet separates 16 Marrowline specimens from 4 neutral specimens
    const blinded = JSON.parse(fs.readFileSync(path.join(tmpOut, 'OPTION1_BLINDED_REVIEW_PACKET.json'), 'utf8'));
    const unblind = JSON.parse(fs.readFileSync(path.join(tmpOut, 'OPTION1_SEALED_UNBLINDING_KEY.json'), 'utf8'));
    assert.equal(blinded.marrowline_specimens.length, 16);
    assert.equal(blinded.neutral_control_specimens.length, 4);
    assert.equal(unblind.marrowline.length, 16);
    assert.equal(unblind.neutral.length, 4);
    assert.equal(unblind.sealed_until_operator_literary_adjudication, true);
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

test('Committed OPTION1_20SLOT_EFFECTIVE_REQUESTS_PREFLIGHT.json matches deterministic regeneration digest-for-digest', async () => {
  assert.ok(fs.existsSync(PREFLIGHT_JSON_PATH), 'Preflight JSON must be committed');
  const committed = JSON.parse(fs.readFileSync(PREFLIGHT_JSON_PATH, 'utf8'));
  const live = await buildOption1PreflightReport({
    profileId: DEFAULT_DESIGN_PROFILE,
    sourceHeadSha: committed.source_head_sha
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
