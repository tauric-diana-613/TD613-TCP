import assert from 'assert';
import fs from 'fs';
import { getHushMask } from '../app/engine/hush-mask-studio.js';
import { PHASE32_1_DIAGNOSTIC_SAMPLE } from '../scripts/run-hush-phase32-1-mask-diagnostics.mjs';
import { generateExpressiveCandidates, buildExpressivePayloadMap, HUSH_EXPRESSIVE_GENERATOR_VERSION } from '../app/engine/hush-expressive-generator.js';
import { buildHushSwap, HUSH_SWAP_PHASE34_VERSION } from '../app/engine/hush-swap-phase34.js';

assert.equal(HUSH_EXPRESSIVE_GENERATOR_VERSION, 'phase-34-expressive-generation');
assert.equal(HUSH_SWAP_PHASE34_VERSION, 'phase-34-expressive-generation');

const mask = getHushMask('plain-witness');
const payload = buildExpressivePayloadMap(PHASE32_1_DIAGNOSTIC_SAMPLE);
assert.equal(payload.expressive.active, true);
assert(payload.anchors.includes('rose-bush-pruning'));
assert(payload.anchors.includes('rot-latency'));
assert(payload.anchors.includes('dromological-anchors'));
assert(payload.fragments.rose.includes('rose bush'));
assert(payload.fragments.rot.includes('rot latency'));
assert(payload.fragments.dromology.includes('dromological anchors'));

const generated = generateExpressiveCandidates({
  sourceText: PHASE32_1_DIAGNOSTIC_SAMPLE,
  mask,
  maskProfile: mask.profile,
  options: { expressiveMode: true }
});
assert.equal(generated.version, HUSH_EXPRESSIVE_GENERATOR_VERSION);
assert.equal(generated.expressive.active, true);
assert(generated.candidates.length >= 4);
assert(generated.candidates.every((candidate) => candidate.source === 'phase34-expressive-generator'));
assert(generated.candidates.some((candidate) => /rose bush|rose-bush/i.test(candidate.text)));
assert(generated.candidates.some((candidate) => /rot latency/i.test(candidate.text)));
assert(generated.candidates.some((candidate) => /dromological anchors/i.test(candidate.text)));
assert(generated.candidates.every((candidate) => candidate.operations.includes('phase34-expressive-generation')));

const result = buildHushSwap({
  sourceText: PHASE32_1_DIAGNOSTIC_SAMPLE,
  mask,
  maskProfile: mask.profile,
  contextType: 'group-chat',
  operatorMode: 'expressive-theory',
  exposureDuration: 'single-use',
  options: { candidateCount: 30, includePrivateText: false, expressiveMode: true }
});
assert(result.version.includes('phase-34-expressive-generation'));
assert(result.phase34Diagnostics, 'Phase 34 diagnostics missing');
assert.equal(result.phase34Diagnostics.active, true);
assert(result.phase34Diagnostics.generatedCount >= 4);
assert(result.phase34Diagnostics.mergedCount >= result.phase34Diagnostics.generatedCount);
assert(result.phase34Diagnostics.selectorRows.some((row) => row.generated === true));
assert(Number.isFinite(result.phase34Diagnostics.selectedRetentionScore));
assert(Number.isFinite(result.phase34Diagnostics.selectedWrapperFatigue));
assert(Number.isFinite(result.phase34Diagnostics.selectedExpressiveScore));
assert(result.selectedOutput.length > 0);
assert(/rose bush|rose-bush|rot latency|dromological anchors/i.test(result.selectedOutput), 'Phase 34 output should preserve expressive anchors in selected output');

const ui = fs.readFileSync('app/hush-phase32.js', 'utf8');
assert(ui.includes('hush-swap-phase34.js'));
assert(ui.includes('Phase 34 expressive generator'));
assert(ui.includes('selectedGenerated'));
assert(ui.includes('generatedCount'));
console.log('hush-phase34-expressive-generation tests passed');
