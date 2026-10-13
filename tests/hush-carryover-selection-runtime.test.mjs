import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { generateSyntaxRecomposerCandidates } from '../app/engine/hush-syntax-recomposer.js';
import { buildSourceResidue, scoreSourceResidue } from '../app/engine/hush-source-residue.js';
import { applyCarryoverSelection } from '../app/hush-candidate-carryover-runtime.js';

const bridge = readFileSync(join(process.cwd(), 'app/hush-compare-layout-custody.js'), 'utf8');
assert.match(bridge, /hush-candidate-carryover-runtime\.js\?v=202607052325/);

const runtimeSource = readFileSync(join(process.cwd(), 'app/hush-candidate-carryover-runtime.js'), 'utf8');
assert.match(runtimeSource, /v2-live-candidate-scoring/);
assert.match(runtimeSource, /buildSourceResidue/);
assert.match(runtimeSource, /scoreSourceResidue/);

const syntaxSource = readFileSync(join(process.cwd(), 'app/engine/hush-syntax-recomposer.js'), 'utf8');
assert.match(syntaxSource, /source-detached-brief/);
assert.match(syntaxSource, /residue-break-turn/);
assert.match(syntaxSource, /archive-reframe/);
assert.match(syntaxSource, /sequence-inversion/);

const sourceText = 'FILE-72 remains attached. The footer mismatch is not resolved. The receipt matters because the earlier image returns as evidence, not decoration.';
const bundle = generateSyntaxRecomposerCandidates({ sourceText, candidateCount: 8, meaningPlan: { protectedLiterals: ['FILE-72'], units: [{ text: sourceText, protectedFragments: ['FILE-72'] }] }, payloadMap: { payloadUnits: [{ kind: 'evidence-id', text: 'FILE-72' }] }, payloadBindingMap: {} });
assert.ok(bundle.candidates.some((candidate) => candidate.family === 'source-detached-brief'));
assert.ok(bundle.candidates.some((candidate) => candidate.family === 'residue-break-turn'));
const detached = bundle.candidates.find((candidate) => candidate.family === 'source-detached-brief');
const detachedRisk = scoreSourceResidue(buildSourceResidue({ sourceText, outputText: detached.text, protectedLiterals: ['FILE-72'] })).sourceResidueRisk;
const copiedRisk = scoreSourceResidue(buildSourceResidue({ sourceText, outputText: sourceText, protectedLiterals: ['FILE-72'] })).sourceResidueRisk;
assert.ok(detachedRisk < copiedRisk, JSON.stringify({ detached: detached.text, detachedRisk, copiedRisk }));

const lowerText = 'Anchor first: FILE-72. Keep the claim narrow. The unresolved footer mismatch stays with the evidence record.';
const result = {
  selectedCandidateId: 'too-close',
  selectedOutput: sourceText,
  candidates: [
    { id: 'too-close', text: sourceText, finalScore: 0.91, releasePolicy: { mayPopulateOutput: true }, payloadIntegrity: { passed: true, score: 1 }, escapeVector: { scores: { semanticFidelity: 0.96 } } },
    { id: 'lower-carry', text: lowerText, finalScore: 0.74, releasePolicy: { mayPopulateOutput: true }, payloadIntegrity: { passed: true, score: 1 }, escapeVector: { scores: { semanticFidelity: 0.88 } } }
  ],
  patch38Diagnostics: { selectedCandidateId: 'too-close' },
  outboundPacket: { contract: { sourceText, protectedLiterals: ['FILE-72'] } }
};
const outputNode = { value: '', dataset: {}, dispatchEvent(event) { this.lastEvent = event.type; } };
const doc = { getElementById(id) { return id === 'protectedOutputInput' ? outputNode : { value: sourceText }; } };
assert.equal(applyCarryoverSelection(result, doc), true);
assert.equal(result.selectedCandidateId, 'lower-carry');
assert.equal(result.selectedOutput, lowerText);
assert.equal(outputNode.value, lowerText);
assert.equal(outputNode.dataset.carryoverSelectionRuntime, 'hush-candidate-carryover-runtime/v2-live-candidate-scoring');
assert.equal(result.carryoverSelectionReceipt.applied, true);
assert.ok(result.carryoverSelectionReceipt.before.carry > result.carryoverSelectionReceipt.after.carry, JSON.stringify(result.carryoverSelectionReceipt));

console.log('hush-carryover-selection-runtime: ok');
