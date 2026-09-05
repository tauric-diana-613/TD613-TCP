import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import {
  HOLONOMY_LOOM_ADVISORY_RULES
} from '../app/dome-world/holonomy-loom-advisory-policy.js';
import {
  auditPortablePayloadVocabulary,
  compilePortableAiaProjection
} from '../app/dome-world/portable-aia-three-route-invariance.js';
import {
  LOCAL_POCKET_ARTIFACT_SCHEMA,
  LOCAL_POCKET_EXPORT_SCHEMA,
  buildLocalPocketManifest,
  renderLocalPocketHtml
} from '../scripts/holonomy-loom-local-pocket-v0-2-builder.mjs';

const manifest = buildLocalPocketManifest();
const html = renderLocalPocketHtml();
const calibrationWrapper = await readFile(new URL('../scripts/ash-a15-transition-trace-browser-probe.mjs', import.meta.url), 'utf8');
const browserWitness = await readFile(new URL('../scripts/holonomy-loom-local-pocket-v0-2-browser-witness.mjs', import.meta.url), 'utf8');

assert.equal(manifest.schema, LOCAL_POCKET_ARTIFACT_SCHEMA);
assert.equal(manifest.route_mode, 'LOCAL_POCKET');
assert.equal(manifest.authority.release_authority, false);
assert.equal(manifest.authority.human_closure_required, true);
assert.equal(manifest.authority.network_required, false);
assert.equal(manifest.authority.remote_model_required, false);
assert.equal(manifest.authority.automatic_persistence, false);

// Canonical policy drives meaning tokens; local detectors may only point at canonical rules.
assert.deepEqual(Object.keys(manifest.rules).sort(), Object.keys(HOLONOMY_LOOM_ADVISORY_RULES).sort());
for (const [ruleId, rule] of Object.entries(HOLONOMY_LOOM_ADVISORY_RULES)) {
  assert.deepEqual(manifest.rules[ruleId], JSON.parse(JSON.stringify(rule)));
  const projection = compilePortableAiaProjection({ ruleId, routeMode: 'LOCAL_POCKET' });
  assert.deepEqual(manifest.payload_templates[ruleId], JSON.parse(JSON.stringify(projection.portable_payload)));
  const audit = auditPortablePayloadVocabulary(projection);
  assert.equal(audit.ok, true);
  assert.equal(audit.digest_token_present, false);
  assert.equal(audit.route_mode_present, false);
  assert.equal(audit.presentation_host_present, false);
}
for (const detector of manifest.detectors) {
  assert.ok(HOLONOMY_LOOM_ADVISORY_RULES[detector.rule_id], `detector points at unknown rule ${detector.rule_id}`);
  assert.doesNotThrow(() => new RegExp(detector.source, detector.flags));
}

// Single-file Layer-0 isolation contract.
assert.match(html, /default-src 'none'/);
assert.match(html, /connect-src 'none'/);
assert.match(html, /form-action 'none'/);
assert.match(html, /worker-src 'none'/);
assert.doesNotMatch(html, /<script\s+[^>]*src=/i);
assert.doesNotMatch(html, /<link\s+[^>]*href=/i);
assert.doesNotMatch(html, /https?:\/\//i);
assert.doesNotMatch(html, /\/api\//i);
assert.doesNotMatch(html, /GEMINI_API_KEY|generativelanguage\.googleapis\.com/i);
assert.doesNotMatch(html, /localStorage|sessionStorage|indexedDB|caches\.|serviceWorker|document\.cookie/i);

// The runtime also blocks common network primitives if called.
assert.match(html, /window\.fetch=blockedNetwork/);
assert.match(html, /XMLHttpRequest\.prototype\.open=blockedNetwork/);
assert.match(html, /window\.WebSocket=function/);
assert.match(html, /window\.EventSource=function/);
assert.match(html, /navigator\.sendBeacon=blockedNetwork/);

// Receipt-state booleans stay canonical; pristine unchecked must never collapse to null/undefined.
assert.match(html, /function stillChecked\(\)\{return Boolean\(checkedSnapshot&&checkedSnapshot\.draft===draftEl\.value&&checkedSnapshot\.protected===protectedEl\.value\)\}/);
assert.match(html, /checked:stillChecked\(\)/);

// Pedagogue order stays consequence-first and optional technical detail stays behind a drawer.
for (const token of ['SEE', 'CHECK', 'UNDERSTAND', '𝄐 REST']) assert.match(html, new RegExp(token));
assert.ok(html.indexOf('Before you send it, check what this message carries.') < html.indexOf('Open the grown-up drawer'));
assert.match(html, /𝄐 NAP NOOK/);
assert.match(html, /COME BACK/);
assert.match(html, /FRONT DOOR · CLEAR & EXIT/);
assert.match(html, /Green only means no enabled canonical detector currently requires REMOVE or CHANGE/);
assert.match(html, /It cannot prevent manual copying/);

// Two doors remain distinct: raw checked text is an explicit human transfer; Pocket packet is born-minimized policy data.
assert.match(html, /COPY CHECKED TEXT/);
assert.match(html, /COPY POCKET PACKET/);
assert.match(html, new RegExp(LOCAL_POCKET_EXPORT_SCHEMA.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
assert.match(html, /portable_findings/);
assert.match(html, /release_authority:false/);
assert.match(html, /human_closure_required:true/);

// No legacy discretionary portable carriers return.
for (const forbidden of [
  'journeyLabel',
  'receiptId',
  'receipt_id',
  'sourceHost',
  'source_host:',
  'route history',
  'promptTranscript',
  'prompt_transcript'
]) assert.equal(html.includes(forbidden), false, `legacy/discretionary carrier reappeared: ${forbidden}`);

// Export templates themselves remain finite and raw-free.
const serializedTemplates = JSON.stringify(manifest.payload_templates);
for (const forbidden of [
  'raw_draft', 'rawDraft', 'matched_value', 'matchedValue', 'selected_text', 'selectedText',
  'span_start', 'span_end', 'receipt', 'sha256:', 'conversation_history', 'prompt_transcript'
]) assert.equal(serializedTemplates.includes(forbidden), false, `portable template contains forbidden carrier: ${forbidden}`);
assert.equal(serializedTemplates.includes('LOCAL_POCKET'), false, 'route label must not appear inside portable payload templates');

// Browser observation must remain downstream of inherited A15 + exact-source Marrowline custody in the existing calibration path.
assert.match(calibrationWrapper, /marrowline-loom-advisory-exact-source-witness\.mjs/);
assert.match(calibrationWrapper, /holonomy-loom-local-pocket-v0-2-browser-witness\.mjs/);
const marrowlineImport = calibrationWrapper.indexOf('td613_marrowline_loom_exact_source');
const pocketImport = calibrationWrapper.indexOf('td613_local_pocket_v0_2');
assert.ok(marrowlineImport >= 0 && pocketImport > marrowlineImport, 'Pocket witness must run after exact-source Marrowline custody.');
assert.doesNotMatch(calibrationWrapper, /merge_pull_request|vercel|deploy|GEMINI_API_KEY/i);

// The browser witness observes the generated artifact directly and freezes the preregistered falsifiers.
for (const marker of [
  'renderLocalPocketHtml',
  "TD613_BROWSER || 'chromium'",
  'unexpected_requests',
  'COMMON_API_KEY_BLOCK',
  'USER_DECLARED_PROTECTED_TERM',
  '390x844',
  'release_authority: false',
  'provider_call_performed: false',
  'production_mutation: false'
]) assert.ok(browserWitness.includes(marker), `Pocket browser witness lost required marker: ${marker}`);
assert.doesNotMatch(browserWitness, /GEMINI_API_KEY|generativelanguage\.googleapis\.com|\/api\/khonapolit/i);

console.log('Holonomy Loom Local Pocket v0.2 hostile contract: PASS');
