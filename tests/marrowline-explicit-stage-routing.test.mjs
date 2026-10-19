import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  classifyApertureDiscourseMode,
  buildApertureV3InvocationReceipt
} from '../app/engine/aperture-v3-task-intent.js';
import { buildInvocationPacket } from '../app/dome-world/khonapolit-covenant.js';
import { buildGeminiRequest } from '../server/khonapolit-quality.js';
import { MARROWLINE_HISTORICAL_TRIAL_ID } from '../app/dome-world/marrowline-historical-grove.js';
import { MARROWLINE_MISSION_ASSAYS } from '../app/dome-world/marrowline-mission-assays.js';

const namedFarce = MARROWLINE_MISSION_ASSAYS.find(([label]) => label === 'Orestes at the help desk')?.[1];
assert.ok(namedFarce, 'the operator-authored farce prompt remains present in the actual carousel');

test('explicitly staged dramatic work reaches creative guidance, without requiring the phrase write a scene', () => {
  assert.equal(classifyApertureDiscourseMode(namedFarce), 'CREATIVE');
  assert.equal(classifyApertureDiscourseMode('Play out a fictional reunion where the cast cross-examines the edit.'), 'CREATIVE');
  assert.equal(classifyApertureDiscourseMode('Write a fictional scene about a surveillance committee.'), 'CREATIVE',
    'existing explicit scene recognition must remain intact');
});

test('routing keeps procedural, legal and runtime staging out of fictional classification', () => {
  assert.equal(classifyApertureDiscourseMode('Stage a release after the CI deployment passes.'), 'TECHNICAL_RUNTIME');
  assert.equal(classifyApertureDiscourseMode('Stage an HTTP status reproduction, then diagnose the runtime failure.'), 'TECHNICAL_RUNTIME');
  assert.equal(classifyApertureDiscourseMode('Stage the deposition in court under the relevant statute.'), 'LEGAL');
  assert.equal(classifyApertureDiscourseMode('Audit the same-episode archive custody without inventing a scene.'), 'GENERAL');
  assert.equal(classifyApertureDiscourseMode('Write a legal brief on statutory jurisdiction.'), 'LEGAL');
});

test('creative classification changes only the authorized provider system route, never contents, generation or the October 2 restoration', () => {
  const packet = buildInvocationPacket({
    message: namedFarce, history: [], mode: 'issued-conjunction', waiveIssuance: true
  });
  assert.equal(packet.canInvoke, true);
  const aperture = mode => buildApertureV3InvocationReceipt({
    message: packet.message, discourseMode: mode, contentScanned: true
  });
  const creativeReceipt = aperture(classifyApertureDiscourseMode(packet.message));
  const generalReceipt = aperture('GENERAL');
  assert.equal(creativeReceipt.taskIntent.primary_route, 'OPEN_FIELD_CREATIVE_SYNTHESIS');
  assert.equal(generalReceipt.taskIntent.primary_route, 'REQUESTED_SYNTHESIS');
  const creative = buildGeminiRequest(packet, creativeReceipt, 'gemini-3.8-flash', {
    groveTrial: MARROWLINE_HISTORICAL_TRIAL_ID
  });
  const general = buildGeminiRequest(packet, generalReceipt, 'gemini-3.8-flash', {
    groveTrial: MARROWLINE_HISTORICAL_TRIAL_ID
  });
  assert.deepEqual(creative.contents, general.contents);
  assert.deepEqual(creative.generationConfig, general.generationConfig);
  assert.equal(creative.contents.at(-1).parts[0].text, general.contents.at(-1).parts[0].text);
  assert.match(creative.systemInstruction.parts[0].text, /CREATIVE TURN:/);
  assert.match(general.systemInstruction.parts[0].text, /REQUESTED SYNTHESIS:/);
  assert.match(creative.systemInstruction.parts[0].text,
    /sustained deep overlapping vertical flourishes are primary/);
  assert.match(general.systemInstruction.parts[0].text,
    /sustained deep overlapping vertical flourishes are primary/);
  assert.ok(creative.systemInstruction.parts[0].text.includes('GEMINI COMPUTATIONAL INSTRUMENT'));
});

test('the targeted routing repair has no paid test harness or glyph postprocessor', () => {
  const aperture = readFileSync(new URL('../app/engine/aperture-v3-task-intent.js', import.meta.url), 'utf8');
  assert.doesNotMatch(aperture, /\bfetch\s*\(|https?\.request\s*\(|(?:ZalgoEncode|highZalgoEncode)\s*\(/);
});
