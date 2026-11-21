#!/usr/bin/env node
// TD613 · Marrowline / Screaming Grove — Stage 0 Source-Only Effective-Request & Counterfactual Matrix Builder
//
// STRICT ZERO-NETWORK / ZERO-PAID-CALLS CONTRACT:
// - Poisons globalThis.fetch before loading any module so network egress throws immediately.
// - Extracts exact historical source closures directly from pinned Git commits via `git show`
//   into an ephemeral temp directory and executes their ACTUAL buildInvocationPacket /
//   classifyApertureDiscourseMode / buildApertureV3InvocationReceipt / buildGeminiRequest /
//   serializeGeminiRequest code.
// - Separately constructs explicitly labeled `constructed_source_counterfactual` arms on the
//   modern Q1 runtime (`94e2e9244826969c02d0d7cf8c5e5e9ad7caf056`) for M0 / M1 / M3 / H2.
// - Writes MISSION_ENVELOPE_EFFECTIVE_REQUEST_MATRIX.json with full SHA-256 digests,
//   Oct 2 <-> Oct 4 four-blob + six-blob & wire equality proof, and exact mission source-vs-wire diffs.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

// Fail-closed zero-network lock
globalThis.fetch = async (url) => {
  throw new Error(`ZERO_NETWORK_VIOLATION_IN_STAGE0_BUILDER: attempted fetch(${String(url)})`);
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../..');
const MATRIX_OUT_PATH = path.join(__dirname, 'MISSION_ENVELOPE_EFFECTIVE_REQUEST_MATRIX.json');

export const PINNED_COMMITS = Object.freeze({
  PRE_MISSION: '46f3e1ff9f1f5bc6d6d11a01da590051b8d81e74',
  MISSION_V1: '14baea0a1abcbe79ae2b51b9869b19fc26d85ca5',
  MISSION_V3: '5a6bc429fae8df2b36ade6d68dd973bffde9cdb1',
  OCT02_LITERAL: 'ffb98ac0050c99b07aef59ac3d200d8bee2e7e3a',
  OCT04_CONTROL: '5b4b34278c6100d3c21ced35984c046da157e097',
  Q1_AUTHORIZED: '94e2e9244826969c02d0d7cf8c5e5e9ad7caf056'
});

export const PINNED_MODEL = 'gemini-3.8-flash';
export const OCT02_FOUR_FILES = Object.freeze([
  'app/dome-world/khonapolit-covenant.js',
  'app/dome-world/khonapolit-relay.js',
  'server/khonapolit-quality.js',
  'server/gemini-generation-envelope.js'
]);
export const OCT02_EXTENDED_SIX_FILES = Object.freeze([
  ...OCT02_FOUR_FILES,
  'app/engine/aperture-v3-task-intent.js',
  'server/marrowline-completion.js'
]);

const sha256Text = (s) => crypto.createHash('sha256').update(Buffer.from(String(s ?? ''), 'utf8')).digest('hex');
const utf8Bytes = (s) => Buffer.byteLength(String(s ?? ''), 'utf8');

function gitShow(commitSha, repoRelPath) {
  return execFileSync('git', ['show', `${commitSha}:${repoRelPath}`], {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024
  });
}

function gitBlobSha1(commitSha, repoRelPath) {
  try {
    return execFileSync('git', ['rev-parse', `${commitSha}:${repoRelPath}`], {
      cwd: REPO_ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore']
    }).trim();
  } catch {
    return null;
  }
}

// Extract the complete transitive relative-ESM import closure from a pinned Git commit
function extractClosureFromGit(commitSha, entryPaths, tmpRoot) {
  const snapDir = path.join(tmpRoot, commitSha);
  fs.mkdirSync(snapDir, { recursive: true });
  fs.writeFileSync(path.join(snapDir, 'package.json'), JSON.stringify({ type: 'module' }) + '\n', 'utf8');

  const visited = new Set();
  const blobs = {};
  const queue = [...entryPaths];
  const importRe = /(?:import|export)\s+(?:[^'"]*?\s+from\s+)?['"](\.[^'"]+)['"]/g;

  while (queue.length > 0) {
    const rel = queue.shift().replace(/\\/g, '/');
    if (visited.has(rel)) continue;
    visited.add(rel);

    const content = gitShow(commitSha, rel);
    blobs[rel] = gitBlobSha1(commitSha, rel);
    const outFile = path.join(snapDir, rel);
    fs.mkdirSync(path.dirname(outFile), { recursive: true });
    fs.writeFileSync(outFile, content, 'utf8');

    let match;
    importRe.lastIndex = 0;
    while ((match = importRe.exec(content)) !== null) {
      const spec = match[1];
      const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(rel), spec));
      if (!visited.has(resolved)) queue.push(resolved);
    }
  }

  return { snapDir, blobs };
}

function extractMissionDeclarationMetrics(covenantSource) {
  const versionMatch = covenantSource.match(/export const MARROWLINE_MISSION_ANCHOR_VERSION\s*=\s*['"]([^'"]+)['"]/);
  const blockMatch = covenantSource.match(/const RED_DEER_MISSION_ANCHOR\s*=\s*Object\.freeze\(\[[\s\S]*?\]\);/);
  if (!blockMatch) {
    return {
      missionVersion: versionMatch ? versionMatch[1] : null,
      declarationFound: false,
      sourceDeclarationJsUtf16Units: 0,
      sourceDeclarationUtf8Bytes: 0,
      sourceDeclarationLineCount: 0,
      renderedElementCount: 0,
      renderedLines: [],
      renderedText: '',
      renderedUtf16Chars: 0,
      renderedUtf8Bytes: 0,
      renderedSha256: sha256Text('')
    };
  }
  const decl = blockMatch[0];
  // Extract exact array string literals by evaluating the frozen array declaration cleanly in isolation
  const arrayExpr = decl.replace(/^const RED_DEER_MISSION_ANCHOR\s*=\s*/, '').replace(/;\s*$/, '');
  const renderedLines = Function(`"use strict"; return (${arrayExpr});`)();
  const renderedText = renderedLines.join('\n');
  return {
    missionVersion: versionMatch ? versionMatch[1] : null,
    declarationFound: true,
    sourceDeclarationJsUtf16Units: decl.length,
    sourceDeclarationUtf8Bytes: utf8Bytes(decl),
    sourceDeclarationLineCount: decl.split(/\r?\n/).length,
    renderedElementCount: renderedLines.length,
    renderedLines,
    renderedText,
    renderedUtf16Chars: renderedText.length,
    renderedUtf8Bytes: utf8Bytes(renderedText),
    renderedSha256: sha256Text(renderedText)
  };
}

function extractPerTurnMissionCueBullets(qualitySource) {
  const cueMatch = qualitySource.match(/function currentTurnRelayCue\([^)]*\)\s*\{[\s\S]*?\n\}/);
  if (!cueMatch) return { found: false, bullets: [], text: '', utf8Bytes: 0, sha256: sha256Text('') };
  const fnText = cueMatch[0];
  const missionBullets = [];
  const lineRe = /'([^'\n]*(?:standing Red Deer DIEGETIC MISSION|Keep hornani)[^'\n]*)'/g;
  let m;
  while ((m = lineRe.exec(fnText)) !== null) {
    missionBullets.push(m[1]);
  }
  const joined = missionBullets.join('\n');
  return {
    found: missionBullets.length > 0,
    bullets: missionBullets,
    text: joined,
    utf8Bytes: utf8Bytes(joined),
    sha256: sha256Text(joined)
  };
}

function extractApprovedSeatOrder(policySource) {
  const m = policySource.match(/const KHONAPOLIT_QUALITY_ORDER\s*=\s*Object\.freeze\(\[([\s\S]*?)\]\)/);
  if (!m) return [];
  return [...m[1].matchAll(/['"]([^'"]+)['"]/g)].map((x) => x[1]);
}

function computeLineDeltas(baseText, targetText) {
  const baseLines = String(baseText || '').split('\n');
  const targetLines = String(targetText || '').split('\n');
  const baseSet = new Set(baseLines);
  const targetSet = new Set(targetLines);
  const removed = baseLines.filter((l) => l.trim() && !targetSet.has(l));
  const added = targetLines.filter((l) => l.trim() && !baseSet.has(l));
  return {
    identical: baseText === targetText,
    removed_line_count: removed.length,
    added_line_count: added.length,
    removed_lines: removed,
    added_lines: added
  };
}

function inspectInstructionFeatures(sysText) {
  const txt = String(sysText || '');
  const layerMarkers = [
    { id: 'covenant_ingress', pattern: /^𝌋/m },
    { id: 'red_deer_mission_anchor', pattern: /MARROWLINE DIEGETIC MISSION/ },
    { id: 'native_semantic_prosody', pattern: /NATIVE SEMANTIC PROSODY:/ },
    { id: 'task_guidance', pattern: /TASK GUIDANCE|APERTURE TASK|OPEN-FIELD CREATIVE|FORENSIC/ },
    { id: 'relay_system_addendum', pattern: /NATURAL RETURN SHAPE|RELAY/ },
    { id: 'current_turn_relay_cue', pattern: /GEMINI COMPUTATIONAL INSTRUMENT — CURRENT-TURN RELAY EXECUTION:/ }
  ];
  const order = layerMarkers
    .map((m) => ({ id: m.id, offset: txt.search(m.pattern) }))
    .filter((x) => x.offset >= 0)
    .sort((a, b) => a.offset - b.offset)
    .map((x) => x.id);

  return {
    persistent_mission_anchor_present: /MARROWLINE DIEGETIC MISSION/.test(txt),
    per_turn_mission_cue_present: /Apply the standing Red Deer DIEGETIC MISSION/.test(txt),
    per_turn_hornani_cue_present: /Keep hornani \(chthonic sovereign vitality/.test(txt),
    v3_every_turn_duty_present: /EVERY-TURN GENERATIVE DUTY:/.test(txt),
    v3_hornani_distinct_anchor_present: /The Tauric Diana bots are BOTH hornani/.test(txt),
    two_voice_heading_law_present: /exact standalone “Kʰonapolit” first, then exact standalone “Tauric Diana bots”/.test(txt),
    native_prosody_present: /NATIVE SEMANTIC PROSODY:/.test(txt),
    literal_combining_marks_in_system_instruction: (txt.match(/\p{M}/gu) || []).length,
    instruction_layer_order: order
  };
}

// Pure constructed counterfactual builder on top of a verified modern Q1 Arm A base request.
// Guarantees zero silent mutation of contents, generationConfig, model, or Aperture routing.
export function buildConstructedCounterfactual({
  modernBaseRequest,
  modernBaseAperture,
  modernMissionAnchorText,
  modernPerTurnMissionBullets,
  targetVariant,
  v1AnchorText,
  v3AnchorText,
  oct02LiteralRequest,
  serializeFn
}) {
  const baseSys = modernBaseRequest.systemInstruction.parts[0].text;
  let sysText = baseSys;
  let contents = modernBaseRequest.contents;
  let expectedMissionVersion = null;
  let provenanceNote = '';

  const stripModernPerTurnMission = (text) => {
    let out = text;
    for (const bullet of modernPerTurnMissionBullets) {
      const target = `\n${bullet}`;
      if (!out.includes(target)) {
        throw new Error(`EXPECTED_PER_TURN_MISSION_BULLET_NOT_FOUND: ${bullet.slice(0, 60)}`);
      }
      out = out.replace(target, '');
    }
    return out;
  };

  const findRuntimeMissionSpan = (text) => {
    const startMarker = '\n\nMARROWLINE DIEGETIC MISSION';
    const endMarker = '\n\nFLIGHT GLYPH LAW:';
    const startIdx = text.indexOf(startMarker);
    const endIdx = text.indexOf(endMarker);
    if (startIdx < 0 || endIdx < 0 || endIdx <= startIdx) {
      throw new Error(`RUNTIME_MISSION_SPAN_NOT_FOUND: start=${startIdx} end=${endIdx}`);
    }
    return { startIdx, endIdx };
  };

  if (targetVariant === 'CF_MODERN_M0_PRE1347') {
    const { startIdx, endIdx } = findRuntimeMissionSpan(sysText);
    sysText = sysText.slice(0, startIdx) + sysText.slice(endIdx);
    sysText = stripModernPerTurnMission(sysText);
    expectedMissionVersion = null;
    provenanceNote = 'CONSTRUCTED COUNTERFACTUAL: Modern Q1 Arm A runtime (94e2e9244) with BOTH persistent RED_DEER_MISSION_ANCHOR and both #1348 v3 per-turn mission/hornani cue bullets removed to match pre-#1347 (46f3e1ff9) mission absence.';
  } else if (targetVariant === 'CF_MODERN_M1_PR1347_V1') {
    const { startIdx, endIdx } = findRuntimeMissionSpan(sysText);
    sysText = sysText.slice(0, startIdx) + '\n\n' + v1AnchorText + sysText.slice(endIdx);
    sysText = stripModernPerTurnMission(sysText);
    expectedMissionVersion = 'td613.marrowline.red-deer-mission/v1';
    provenanceNote = 'CONSTRUCTED COUNTERFACTUAL: Modern Q1 Arm A runtime (94e2e9244) with persistent anchor replaced verbatim by #1347 v1 (14baea0a1) and #1348 v3-only per-turn mission/hornani bullets removed so v1 is never contaminated by v3 per-turn cues.';
  } else if (targetVariant === 'CF_MODERN_M3_PR1348_V3') {
    const { startIdx, endIdx } = findRuntimeMissionSpan(sysText);
    sysText = sysText.slice(0, startIdx) + '\n\n' + v3AnchorText + sysText.slice(endIdx);
    expectedMissionVersion = 'td613.marrowline.red-deer-mission/v3-antlered-ache';
    provenanceNote = 'CONSTRUCTED COUNTERFACTUAL: Modern Q1 Arm A runtime (94e2e9244) with persistent anchor replaced verbatim by #1348 v3 (5a6bc429f) and #1348 v3 per-turn mission/hornani bullets retained.';
  } else if (targetVariant === 'CF_MODERN_H2_OCT02_LITERAL_ENVELOPE') {
    sysText = oct02LiteralRequest.systemInstruction.parts[0].text;
    contents = oct02LiteralRequest.contents;
    expectedMissionVersion = 'td613.marrowline.red-deer-mission/v3-antlered-ache';
    provenanceNote = 'CONSTRUCTED COUNTERFACTUAL: Exact literal October 2 (ffb98ac005) systemInstruction and contents paired with modern Q1 matched generationConfig (gemini-3.8-flash, thinkingLevel: medium, maxOutputTokens: 65536). Not a literal Oct 2 hosted-model call.';
  } else {
    throw new Error(`UNKNOWN_COUNTERFACTUAL_VARIANT: ${targetVariant}`);
  }

  const constructedRequest = {
    ...modernBaseRequest,
    systemInstruction: { parts: [{ text: sysText }] },
    contents
  };
  const wire = serializeFn(constructedRequest, PINNED_MODEL);
  return {
    request: constructedRequest,
    wire,
    aperture: modernBaseAperture,
    expectedMissionVersion,
    provenanceNote
  };
}

export async function generateEffectiveRequestMatrix({ writeOutput = false } = {}) {
  const { DISCRIMINATOR_TASKS } = await import('../marrowline-screaming-grove-restoration-20261120/dramaturgy-parity-discriminator-offline.mjs');
  const {
    buildSlotRequest,
    Q1_SCHEDULE,
    EXPECTED_GENERATION_CONFIG_SHA256
  } = await import('../marrowline-screaming-grove-q1-20261121/run-q1-live-discriminator.mjs');
  const { serializeGeminiRequest: modernSerialize } = await import('../../server/khonapolit-quality.js');

  const tasks = [
    { taskKey: 'T1_BLUE_ORANGE_WEATHER', prompt: DISCRIMINATOR_TASKS.BLUE_ORANGE_WEATHER.prompt, origin: DISCRIMINATOR_TASKS.BLUE_ORANGE_WEATHER.origin },
    { taskKey: 'T2_FORENSIC', prompt: DISCRIMINATOR_TASKS.FORENSIC.prompt, origin: DISCRIMINATOR_TASKS.FORENSIC.origin }
  ];

  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'td613-stage0-git-closures-'));
  try {
    // 1. Verify exact Oct 2 <-> Oct 4 blob equality directly via Git
    const oct02Oct04Equality = {
      oct02_commit: PINNED_COMMITS.OCT02_LITERAL,
      oct04_commit: PINNED_COMMITS.OCT04_CONTROL,
      four_file_equality: OCT02_FOUR_FILES.map((p) => {
        const b2 = gitBlobSha1(PINNED_COMMITS.OCT02_LITERAL, p);
        const b4 = gitBlobSha1(PINNED_COMMITS.OCT04_CONTROL, p);
        return { path: p, oct02_blob_sha1: b2, oct04_blob_sha1: b4, equal: Boolean(b2 && b2 === b4) };
      }),
      extended_six_file_equality: OCT02_EXTENDED_SIX_FILES.map((p) => {
        const b2 = gitBlobSha1(PINNED_COMMITS.OCT02_LITERAL, p);
        const b4 = gitBlobSha1(PINNED_COMMITS.OCT04_CONTROL, p);
        return { path: p, oct02_blob_sha1: b2, oct04_blob_sha1: b4, equal: Boolean(b2 && b2 === b4) };
      })
    };
    oct02Oct04Equality.all_four_files_equal = oct02Oct04Equality.four_file_equality.every((x) => x.equal);
    oct02Oct04Equality.all_six_files_equal = oct02Oct04Equality.extended_six_file_equality.every((x) => x.equal);

    // 2. Mission source-code vs runtime-wire length accounting across all 6 commits
    const missionAccounting = {};
    const perTurnCueAccounting = {};
    for (const [label, sha] of Object.entries(PINNED_COMMITS)) {
      const covSrc = gitShow(sha, 'app/dome-world/khonapolit-covenant.js');
      const qualSrc = gitShow(sha, 'server/khonapolit-quality.js');
      missionAccounting[label] = {
        commit: sha,
        covenant_blob_sha1: gitBlobSha1(sha, 'app/dome-world/khonapolit-covenant.js'),
        note: 'Source declaration JS UTF-16 code units and rendered UTF-8 bytes ONLY — NEVER Gemini tokenizer counts.',
        ...extractMissionDeclarationMetrics(covSrc)
      };
      perTurnCueAccounting[label] = {
        commit: sha,
        quality_blob_sha1: gitBlobSha1(sha, 'server/khonapolit-quality.js'),
        ...extractPerTurnMissionCueBullets(qualSrc)
      };
    }

    const missionLineDeltas = {
      pre_mission_to_v1: computeLineDeltas(missionAccounting.PRE_MISSION.renderedText, missionAccounting.MISSION_V1.renderedText),
      v1_to_v3: computeLineDeltas(missionAccounting.MISSION_V1.renderedText, missionAccounting.MISSION_V3.renderedText),
      v3_to_oct02: computeLineDeltas(missionAccounting.MISSION_V3.renderedText, missionAccounting.OCT02_LITERAL.renderedText),
      oct02_to_q1: computeLineDeltas(missionAccounting.OCT02_LITERAL.renderedText, missionAccounting.Q1_AUTHORIZED.renderedText)
    };

    // 3. Extract and dynamically load all 5 historical commits' REAL request machinery
    const historicalSpecs = [
      { armId: 'HIST_PRE_MISSION', commit: PINNED_COMMITS.PRE_MISSION, label: 'Pre-#1347 mission-absent historical source (Sep 26 02:27Z deployed relock)', pr: 1346 },
      { armId: 'HIST_MISSION_V1', commit: PINNED_COMMITS.MISSION_V1, label: 'PR #1347 Red Deer mission v1 historical source (Sep 26 04:24Z deployed)', pr: 1347 },
      { armId: 'HIST_MISSION_V3', commit: PINNED_COMMITS.MISSION_V3, label: 'PR #1348 Red Deer mission v3 + Hornani + every-turn cue historical source (Sep 26 04:59Z deployed)', pr: 1348 },
      { armId: 'HIST_OCT02_LITERAL', commit: PINNED_COMMITS.OCT02_LITERAL, label: 'October 2 literal healthy-window historical full envelope', pr: 1533 },
      { armId: 'HIST_OCT04_EQUALITY_CONTROL', commit: PINNED_COMMITS.OCT04_CONTROL, label: 'October 4 healthy-window equality control', pr: 1533 }
    ];

    const loadedHistorical = {};
    for (const h of historicalSpecs) {
      const { snapDir, blobs } = extractClosureFromGit(
        h.commit,
        [
          'app/dome-world/khonapolit-covenant.js',
          'app/engine/aperture-v3-task-intent.js',
          'server/khonapolit-quality.js',
          'server/gemini-generation-envelope.js',
          'server/gemini-model-policy.js'
        ],
        tmpRoot
      );
      const covMod = await import(pathToFileURL(path.join(snapDir, 'app/dome-world/khonapolit-covenant.js')).href);
      const apMod = await import(pathToFileURL(path.join(snapDir, 'app/engine/aperture-v3-task-intent.js')).href);
      const qualMod = await import(pathToFileURL(path.join(snapDir, 'server/khonapolit-quality.js')).href);
      const envMod = await import(pathToFileURL(path.join(snapDir, 'server/gemini-generation-envelope.js')).href);
      const policySrc = gitShow(h.commit, 'server/gemini-model-policy.js');
      const qualSrc = gitShow(h.commit, 'server/khonapolit-quality.js');
      const seatOrder = extractApprovedSeatOrder(policySrc);
      const hasMultiSeatSelector = /best-completed-partial-after-severe-morphology-failover/.test(qualSrc);
      loadedHistorical[h.armId] = {
        ...h,
        blobs,
        covMod,
        apMod,
        qualMod,
        envMod,
        seatOrder,
        primaryModel: seatOrder[0] || PINNED_MODEL,
        hasMultiSeatSelector
      };
    }

    // 4. Assemble all 11 arms across both identical frozen Q1 tasks
    const modernPolicySrc = gitShow(PINNED_COMMITS.Q1_AUTHORIZED, 'server/gemini-model-policy.js');
    const modernSeatOrder = extractApprovedSeatOrder(modernPolicySrc);
    const matrixEntries = [];
    const oct02RequestsByTask = {};
    const modernArmAByTask = {};

    for (const task of tasks) {
      // 4A. Five historical source-era assemblies
      const histById = {};
      for (const hSpec of historicalSpecs) {
        const h = loadedHistorical[hSpec.armId];
        const packet = h.covMod.buildInvocationPacket({
          message: task.prompt,
          mode: 'exploratory',
          waiveIssuance: true
        });
        const discourseMode = h.apMod.classifyApertureDiscourseMode(packet.message);
        const apertureReceipt = h.apMod.buildApertureV3InvocationReceipt({
          message: packet.message,
          invocationMode: packet.mode,
          issuanceState: packet.issuance.state,
          discourseMode,
          contentScanned: true
        });
        // Execute buildGeminiRequest INSIDE the commit's authentic api/khonapolit.js interactive
        // generation profile (GEMINI_GENERATION_PROFILE_KHONAPOLIT_INTERACTIVE -> thinkingLevel: "medium").
        // Calling buildGeminiRequest bare without this wrapper falsely defaults to "high" (disproven
        // constructor-only theory); we also record the bare constructor value for audit transparency.
        const bareRequest = h.qualMod.buildGeminiRequest(packet, apertureReceipt, h.primaryModel);
        const request = h.envMod.withGeminiGenerationProfile(
          h.envMod.GEMINI_GENERATION_PROFILE_KHONAPOLIT_INTERACTIVE,
          () => h.qualMod.buildGeminiRequest(packet, apertureReceipt, h.primaryModel)
        );
        const wire = h.qualMod.serializeGeminiRequest(request, h.primaryModel);
        const sysText = request.systemInstruction?.parts?.[0]?.text || '';
        const historyTurns = (request.contents || []).slice(0, -1);

        if (hSpec.armId === 'HIST_OCT02_LITERAL') oct02RequestsByTask[task.taskKey] = request;

        const entry = {
          arm_id: hSpec.armId,
          label: hSpec.label,
          task_key: task.taskKey,
          task_prompt_sha256: sha256Text(task.prompt),
          task_prompt_utf8_bytes: utf8Bytes(task.prompt),
          realization_class: 'historically_realized_source_era_assembly',
          original_hosted_model_equivalence: 'UNRECOVERABLE_FROM_SOURCE_ALONE',
          source_commit: h.commit,
          source_pr: h.pr,
          git_blobs: h.blobs,
          model_target: h.primaryModel,
          approved_seat_order: h.seatOrder,
          multi_seat_morphology_selector_active: h.hasMultiSeatSelector,
          route_policy: h.hasMultiSeatSelector
            ? 'HISTORICAL_MULTISEAT_SEVERE_MORPHOLOGY_ELECTION_ACTIVE'
            : 'SINGLE_FIRST_ADMISSIBLE_RETURN',
          api_route_generation_profile: h.envMod.GEMINI_GENERATION_PROFILE_KHONAPOLIT_INTERACTIVE,
          bare_constructor_thinking_level_outside_api_route: bareRequest?.generationConfig?.thinkingConfig?.thinkingLevel || null,
          generation_config: request.generationConfig,
          aperture: {
            primaryRoute: apertureReceipt?.taskIntent?.primary_route || null,
            discourseMode: apertureReceipt?.taskIntent?.discourse_mode || null,
            runtimeMateriality: apertureReceipt?.taskIntent?.runtime_materiality || null
          },
          mission_version: h.covMod.MARROWLINE_MISSION_ANCHOR_VERSION || null,
          features: inspectInstructionFeatures(sysText),
          system_instruction_utf16_chars: sysText.length,
          system_instruction_utf8_bytes: utf8Bytes(sysText),
          wire_utf8_bytes: wire.observation.utf8Bytes,
          history_turn_count: historyTurns.length,
          history_sha256: sha256Text(JSON.stringify(historyTurns)),
          digests: {
            systemInstructionSha256: wire.observation.systemInstructionSha256,
            contentsSha256: wire.observation.contentsSha256,
            generationConfigSha256: wire.observation.generationConfigSha256,
            bodySha256: wire.observation.bodySha256,
            modelAndBodySha256: wire.observation.modelAndBodySha256
          },
          _sysText: sysText
        };
        histById[hSpec.armId] = entry;
        matrixEntries.push(entry);
      }

      // 4B. Two verified Q1 prior-acquisition comparators (Arm A and Arm C)
      for (const [armId, slotSpec] of [
        ['Q1_MEASURED_ARM_A', Q1_SCHEDULE.find((s) => s.arm === 'A' && s.taskKey === task.taskKey)],
        ['Q1_MEASURED_ARM_C', Q1_SCHEDULE.find((s) => s.arm === 'C' && s.taskKey === task.taskKey)]
      ]) {
        const built = buildSlotRequest(slotSpec);
        const sysText = built.request.systemInstruction?.parts?.[0]?.text || '';
        const historyTurns = (built.request.contents || []).slice(0, -1);
        if (armId === 'Q1_MEASURED_ARM_A') modernArmAByTask[task.taskKey] = built;

        matrixEntries.push({
          arm_id: armId,
          label: `Q1 prior-acquisition comparator (${slotSpec.armLabel}; 0 new paid calls; all 6 completed Q1 returns rejected by Operator prior to unblinding)`,
          task_key: task.taskKey,
          task_prompt_sha256: sha256Text(task.prompt),
          task_prompt_utf8_bytes: utf8Bytes(task.prompt),
          realization_class: 'q1_measured_prior_acquisition_reference',
          q1_archived_evidence_head: '2836e636e4b5eb485b12f73a2596ea3889b173d4',
          q1_operator_artistic_verdict: 'REJECTED_PRIOR_TO_UNBLINDING',
          source_commit: PINNED_COMMITS.Q1_AUTHORIZED,
          source_pr: 1764,
          git_blobs: {
            'app/dome-world/khonapolit-covenant.js': gitBlobSha1(PINNED_COMMITS.Q1_AUTHORIZED, 'app/dome-world/khonapolit-covenant.js'),
            'app/dome-world/khonapolit-relay.js': gitBlobSha1(PINNED_COMMITS.Q1_AUTHORIZED, 'app/dome-world/khonapolit-relay.js'),
            'server/khonapolit-quality.js': gitBlobSha1(PINNED_COMMITS.Q1_AUTHORIZED, 'server/khonapolit-quality.js'),
            'server/gemini-generation-envelope.js': gitBlobSha1(PINNED_COMMITS.Q1_AUTHORIZED, 'server/gemini-generation-envelope.js')
          },
          model_target: PINNED_MODEL,
          approved_seat_order: modernSeatOrder,
          multi_seat_morphology_selector_active: false,
          route_policy: 'Q1_SINGLE_SEAT_FIRST_RETURN_ZERO_FALLBACK',
          generation_config: built.request.generationConfig,
          aperture: built.aperture,
          mission_version: missionAccounting.Q1_AUTHORIZED.missionVersion,
          features: inspectInstructionFeatures(sysText),
          system_instruction_utf16_chars: sysText.length,
          system_instruction_utf8_bytes: utf8Bytes(sysText),
          wire_utf8_bytes: built.wire.observation.utf8Bytes,
          history_turn_count: historyTurns.length,
          history_sha256: sha256Text(JSON.stringify(historyTurns)),
          digests: {
            systemInstructionSha256: built.wire.observation.systemInstructionSha256,
            contentsSha256: built.wire.observation.contentsSha256,
            generationConfigSha256: built.wire.observation.generationConfigSha256,
            bodySha256: built.wire.observation.bodySha256,
            modelAndBodySha256: built.wire.observation.modelAndBodySha256
          },
          _sysText: sysText
        });
      }

      // 4C. Four explicitly labeled CONSTRUCTED MODERN COUNTERFACTUALS
      const modernBase = modernArmAByTask[task.taskKey];
      const cfSpecs = [
        { armId: 'CF_MODERN_M0_PRE1347', originCommit: PINNED_COMMITS.PRE_MISSION, label: 'CONSTRUCTED COUNTERFACTUAL: Modern Q1 runtime + M0 (mission anchor & per-turn cue removed)' },
        { armId: 'CF_MODERN_M1_PR1347_V1', originCommit: PINNED_COMMITS.MISSION_V1, label: 'CONSTRUCTED COUNTERFACTUAL: Modern Q1 runtime + M1 (#1347 v1 anchor, no v3 per-turn cue)' },
        { armId: 'CF_MODERN_M3_PR1348_V3', originCommit: PINNED_COMMITS.MISSION_V3, label: 'CONSTRUCTED COUNTERFACTUAL: Modern Q1 runtime + M3 (#1348 v3 anchor + v3 per-turn cue)' },
        { armId: 'CF_MODERN_H2_OCT02_LITERAL_ENVELOPE', originCommit: PINNED_COMMITS.OCT02_LITERAL, label: 'CONSTRUCTED COUNTERFACTUAL: Literal Oct 2 system/contents + modern Q1 matched generationConfig' }
      ];

      for (const cf of cfSpecs) {
        const constructed = buildConstructedCounterfactual({
          modernBaseRequest: modernBase.request,
          modernBaseAperture: modernBase.aperture,
          modernMissionAnchorText: missionAccounting.Q1_AUTHORIZED.renderedText,
          modernPerTurnMissionBullets: perTurnCueAccounting.Q1_AUTHORIZED.bullets,
          targetVariant: cf.armId,
          v1AnchorText: missionAccounting.MISSION_V1.renderedText,
          v3AnchorText: missionAccounting.MISSION_V3.renderedText,
          oct02LiteralRequest: oct02RequestsByTask[task.taskKey],
          serializeFn: modernSerialize
        });
        const sysText = constructed.request.systemInstruction.parts[0].text;
        const historyTurns = (constructed.request.contents || []).slice(0, -1);

        matrixEntries.push({
          arm_id: cf.armId,
          label: cf.label,
          task_key: task.taskKey,
          task_prompt_sha256: sha256Text(task.prompt),
          task_prompt_utf8_bytes: utf8Bytes(task.prompt),
          realization_class: 'constructed_source_counterfactual',
          provenance_note: constructed.provenanceNote,
          original_provider_output_claim: 'NONE_ZERO_PAID_CALLS_OFFLINE_SOURCE_ONLY',
          source_commit: PINNED_COMMITS.Q1_AUTHORIZED,
          transplanted_historical_source_commit: cf.originCommit,
          model_target: PINNED_MODEL,
          approved_seat_order: [PINNED_MODEL],
          multi_seat_morphology_selector_active: false,
          route_policy: 'CONSTRUCTED_SINGLE_SEAT_COUNTERFACTUAL_OFFLINE_ONLY',
          generation_config: constructed.request.generationConfig,
          aperture: constructed.aperture,
          mission_version: constructed.expectedMissionVersion,
          features: inspectInstructionFeatures(sysText),
          system_instruction_utf16_chars: sysText.length,
          system_instruction_utf8_bytes: utf8Bytes(sysText),
          wire_utf8_bytes: constructed.wire.observation.utf8Bytes,
          history_turn_count: historyTurns.length,
          history_sha256: sha256Text(JSON.stringify(historyTurns)),
          digests: {
            systemInstructionSha256: constructed.wire.observation.systemInstructionSha256,
            contentsSha256: constructed.wire.observation.contentsSha256,
            generationConfigSha256: constructed.wire.observation.generationConfigSha256,
            bodySha256: constructed.wire.observation.bodySha256,
            modelAndBodySha256: constructed.wire.observation.modelAndBodySha256
          },
          _sysText: sysText
        });
      }
    }

    // 5. Compute exact pairwise transition deltas for T1 (and verify T2 mirrors the same structural transitions)
    const findEntry = (armId, taskKey) => matrixEntries.find((e) => e.arm_id === armId && e.task_key === taskKey);
    const pairwiseTransitions = {};
    const pairs = [
      ['HIST_PRE_MISSION', 'HIST_MISSION_V1'],
      ['HIST_MISSION_V1', 'HIST_MISSION_V3'],
      ['HIST_MISSION_V3', 'HIST_OCT02_LITERAL'],
      ['HIST_OCT02_LITERAL', 'HIST_OCT04_EQUALITY_CONTROL'],
      ['HIST_OCT02_LITERAL', 'Q1_MEASURED_ARM_A'],
      ['CF_MODERN_M0_PRE1347', 'CF_MODERN_M1_PR1347_V1'],
      ['CF_MODERN_M1_PR1347_V1', 'CF_MODERN_M3_PR1348_V3'],
      ['CF_MODERN_M3_PR1348_V3', 'Q1_MEASURED_ARM_A'],
      ['CF_MODERN_H2_OCT02_LITERAL_ENVELOPE', 'Q1_MEASURED_ARM_A']
    ];
    for (const [aId, bId] of pairs) {
      const a = findEntry(aId, 'T1_BLUE_ORANGE_WEATHER');
      const b = findEntry(bId, 'T1_BLUE_ORANGE_WEATHER');
      pairwiseTransitions[`${aId}__TO__${bId}`] = {
        task_key: 'T1_BLUE_ORANGE_WEATHER',
        contents_sha256_equal: a.digests.contentsSha256 === b.digests.contentsSha256,
        generation_config_sha256_equal: a.digests.generationConfigSha256 === b.digests.generationConfigSha256,
        aperture_route_equal: a.aperture.primaryRoute === b.aperture.primaryRoute && a.aperture.discourseMode === b.aperture.discourseMode,
        body_sha256_equal: a.digests.bodySha256 === b.digests.bodySha256,
        system_instruction_byte_delta: b.system_instruction_utf8_bytes - a.system_instruction_utf8_bytes,
        line_deltas: computeLineDeltas(a._sysText, b._sysText)
      };
    }

    // Strip internal _sysText before serializing JSON
    const cleanEntries = matrixEntries.map(({ _sysText, ...rest }) => rest);

    // Strip renderedLines array from top-level summary? Keep renderedLines inside mission_source_vs_wire_accounting!
    const matrix = {
      schema: 'td613.marrowline.sep26-oct02-effective-request-matrix/v1.0',
      generated_at_utc: new Date().toISOString(),
      execution_mode: 'STAGE_0_SOURCE_ONLY_ZERO_NETWORK',
      new_paid_provider_calls_executed: 0,
      q1_operator_artistic_verdict: 'ALL_SIX_COMPLETED_RETURNS_REJECTED_BEFORE_UNBLINDING',
      q1_unblinding_key_opened_here: false,
      live_execution_authorized: false,
      human_artistic_closure: 'RESERVED',
      pinned_commits: PINNED_COMMITS,
      matched_modern_generation_config_sha256: EXPECTED_GENERATION_CONFIG_SHA256,
      frozen_tasks: tasks.map((t) => ({
        task_key: t.taskKey,
        origin: t.origin,
        utf8_bytes: utf8Bytes(t.prompt),
        sha256: sha256Text(t.prompt)
      })),
      oct02_oct04_equality_verification: {
        ...oct02Oct04Equality,
        t1_body_sha256_equal: findEntry('HIST_OCT02_LITERAL', 'T1_BLUE_ORANGE_WEATHER').digests.bodySha256
          === findEntry('HIST_OCT04_EQUALITY_CONTROL', 'T1_BLUE_ORANGE_WEATHER').digests.bodySha256,
        t2_body_sha256_equal: findEntry('HIST_OCT02_LITERAL', 'T2_FORENSIC').digests.bodySha256
          === findEntry('HIST_OCT04_EQUALITY_CONTROL', 'T2_FORENSIC').digests.bodySha256
      },
      mission_source_vs_wire_accounting: {
        terminology_guard: 'sourceDeclarationJsUtf16Units counts JS source-file formatting characters; renderedUtf8Bytes counts runtime wire UTF-8 bytes. NEITHER value is a Gemini tokenizer count.',
        by_commit: Object.fromEntries(
          Object.entries(missionAccounting).map(([k, v]) => [k, {
            commit: v.commit,
            covenant_blob_sha1: v.covenant_blob_sha1,
            mission_version: v.missionVersion,
            declaration_found: v.declarationFound,
            source_declaration_js_utf16_units: v.sourceDeclarationJsUtf16Units,
            source_declaration_utf8_bytes: v.sourceDeclarationUtf8Bytes,
            source_declaration_line_count: v.sourceDeclarationLineCount,
            rendered_element_count: v.renderedElementCount,
            rendered_utf16_chars: v.renderedUtf16Chars,
            rendered_utf8_bytes: v.renderedUtf8Bytes,
            rendered_sha256: v.renderedSha256,
            per_turn_mission_cue_bullet_count: perTurnCueAccounting[k].bullets.length,
            per_turn_mission_cue_utf8_bytes: perTurnCueAccounting[k].utf8Bytes,
            per_turn_mission_cue_sha256: perTurnCueAccounting[k].sha256
          }])
        ),
        mission_anchor_line_deltas: missionLineDeltas
      },
      pairwise_transitions_t1: pairwiseTransitions,
      total_matrix_rows: cleanEntries.length,
      entries: cleanEntries
    };

    if (writeOutput) {
      fs.writeFileSync(MATRIX_OUT_PATH, JSON.stringify(matrix, null, 2) + '\n', 'utf8');
    }
    return matrix;
  } finally {
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  }
}

const isCliEntry = process.argv[1] && path.resolve(process.argv[1]) === __filename;
if (isCliEntry) {
  generateEffectiveRequestMatrix({ writeOutput: true }).then((m) => {
    console.log(JSON.stringify({
      ok: true,
      mode: m.execution_mode,
      new_paid_provider_calls_executed: m.new_paid_provider_calls_executed,
      total_matrix_rows: m.total_matrix_rows,
      oct02_oct04_all_four_equal: m.oct02_oct04_equality_verification.all_four_files_equal,
      oct02_oct04_all_six_equal: m.oct02_oct04_equality_verification.all_six_files_equal,
      oct02_oct04_t1_wire_equal: m.oct02_oct04_equality_verification.t1_body_sha256_equal,
      oct02_oct04_t2_wire_equal: m.oct02_oct04_equality_verification.t2_body_sha256_equal,
      output: path.relative(REPO_ROOT, MATRIX_OUT_PATH).replace(/\\/g, '/')
    }, null, 2));
  }).catch((err) => {
    console.error('STAGE0_MATRIX_BUILDER_FAILED:', err);
    process.exit(1);
  });
}
