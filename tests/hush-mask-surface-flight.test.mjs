import assert from 'assert';
import { getHushMask } from '../app/engine/hush-mask-studio.js';
import { generateMaskSurfaceCandidates, HUSH_MASK_SURFACE_FLIGHT_VERSION } from '../app/engine/hush-mask-surface-flight.js';
import { buildHushSwap, HUSH_SWAP_PATCH38_INTERNAL_VERSION } from '../app/engine/hush-swap-patch38.js';
import { GENERATOR_MODES } from '../app/engine/hush-generator-provider.js';

const source = 'How do you find a tech job with no prior experience in the sector? Is signal reading fluency really that much of a skill asset?';
const maskIds = [
  'plain-witness',
  'group-chat-soft',
  'busy-admin',
  'quirky-orbit',
  'soft-snark',
  'clipboard',
  'burner-minimal',
  'academic-caveat'
];

function words(text = '') {
  return String(text || '').toLowerCase().match(/[a-z0-9][a-z0-9'-]*/g) || [];
}

function jaccard(a = '', b = '') {
  const aa = new Set(words(a).filter((word) => word.length > 2));
  const bb = new Set(words(b).filter((word) => word.length > 2));
  const union = new Set([...aa, ...bb]);
  let intersection = 0;
  for (const word of aa) if (bb.has(word)) intersection += 1;
  return union.size ? intersection / union.size : 0;
}

const surfaceRows = [];
const selectedRows = [];

for (const maskId of maskIds) {
  const mask = getHushMask(maskId);
  assert(mask, `missing mask ${maskId}`);

  const surface = generateMaskSurfaceCandidates({ sourceText: source, mask });
  assert.equal(surface.version, HUSH_MASK_SURFACE_FLIGHT_VERSION);
  assert(surface.candidates.length >= 1, `no mask-surface candidates for ${maskId}`);
  assert(surface.candidates.every((candidate) => candidate.operations.includes(HUSH_MASK_SURFACE_FLIGHT_VERSION)), `surface candidates missing operation for ${maskId}`);
  assert(surface.candidates.every((candidate) => candidate.mask_surface_notes?.mask_id === maskId), `surface notes missing mask id for ${maskId}`);

  const first = surface.candidates[0].text;
  surfaceRows.push({ maskId, first });

  const result = buildHushSwap({
    sourceText: source,
    mask,
    maskProfile: mask.profile,
    generatorMode: GENERATOR_MODES.OFFLINE_EXPRESSIVE,
    contextType: 'group-chat',
    operatorMode: 'neutralize',
    exposureDuration: 'single-use',
    options: { candidateCount: 30, includePrivateText: false }
  });

  assert.equal(HUSH_SWAP_PATCH38_INTERNAL_VERSION, 'phase-37.6-mask-surface-flight-selector');
  assert(result.selectedOutput, `no selected output for ${maskId}`);
  assert(result.patch38Diagnostics?.maskSurfaceCandidateCount >= 1, `Patch38 did not merge mask-surface candidates for ${maskId}`);
  assert(result.patch38Diagnostics?.operationSpread?.some((op) => /mask_surface_/i.test(op)), `operation spread lacks mask surface for ${maskId}`);
  assert(result.patch38Diagnostics?.selectedMaskFidelity >= 0.28, `mask fidelity too low for ${maskId}`);

  selectedRows.push({ maskId, output: result.selectedOutput, selectedMaskSurfaceFlight: result.patch38Diagnostics?.selectedMaskSurfaceFlight, operation: result.patch38Diagnostics?.selectedStyleOperation });
}

const uniqueSurfaceTexts = new Set(surfaceRows.map((row) => row.first));
assert(uniqueSurfaceTexts.size >= maskIds.length - 1, 'mask surface generator collapsed distinct masks into duplicate outputs');

let lowSimilarityPairs = 0;
for (let i = 0; i < selectedRows.length; i += 1) {
  for (let j = i + 1; j < selectedRows.length; j += 1) {
    if (jaccard(selectedRows[i].output, selectedRows[j].output) < 0.82) lowSimilarityPairs += 1;
  }
}
assert(lowSimilarityPairs >= 10, `selected outputs remain too similar across masks; low-similarity pairs=${lowSimilarityPairs}`);
assert(selectedRows.some((row) => row.selectedMaskSurfaceFlight), 'selector never selected a mask-surface-flight candidate');

console.log('HUSH_MASK_SURFACE_FLIGHT_SUMMARY ' + JSON.stringify({ maskCount: maskIds.length, uniqueSurfaceTexts: uniqueSurfaceTexts.size, lowSimilarityPairs, selectedRows }));
console.log('hush-mask-surface-flight tests passed');
