import assert from 'assert';
import {
  appendAcceptedOutput,
  computePersonaCentroid,
  computePersonaLinkabilityState,
  createPersonaMemory,
  derivePersonaField
} from '../app/engine/persona-memory.js';
import { buildEscapeVector } from '../app/engine/escape-vector.js';

assert.equal(typeof createPersonaMemory, 'function');
assert.equal(typeof appendAcceptedOutput, 'function');
assert.equal(typeof derivePersonaField, 'function');
assert.equal(typeof computePersonaCentroid, 'function');
assert.equal(typeof computePersonaLinkabilityState, 'function');

function ingestionAudit(friction = 0.2, extra = {}) {
  return {
    ingestionFriction: friction,
    normalization: { nfcChanged: false, nfkcChanged: false, ...(extra.normalization || {}) },
    unicodeSurface: { hiddenMarkCount: 0, zwnjCount: 0, puaCount: 0, astralSymbolCount: 0, ...(extra.unicodeSurface || {}) },
    parserSensitive: { spanCount: 0, ...(extra.parserSensitive || {}) },
    khonaLitPo: extra.khonaLitPo || { status: 'absent' },
    warnings: extra.warnings || []
  };
}

function baseMemory(overrides = {}) {
  return createPersonaMemory({
    personaId: 'field-messenger',
    label: 'Field Messenger',
    displayName: 'Field Messenger',
    surface: { tags: ['short', 'plain'], ...(overrides.surface || {}) },
    ontology: { role: 'field-note messenger', targetContexts: ['secure group chat'], registerHints: ['short', 'plain'], ...(overrides.ontology || {}) },
    ritualSurface: { requiredMarkers: ['𝌋'], optionalMarkers: ['⟐'], protectedLiterals: ['EXHIBIT-42'], glyphs: ['𝌋', '⟐'], khonaLitPoRequired: true, ...(overrides.ritualSurface || {}) },
    maxEntries: overrides.maxEntries
  });
}

const empty = baseMemory();
assert.equal(empty.version, 'phase-4');
assert.equal(empty.memory.entries.length, 0);
assert.equal(empty.diagnostics.status, 'empty');
assert.equal(empty.label, 'Field Messenger');
assert(empty.ontology.prohibitedUses.includes('impersonation'));
assert(empty.ontology.prohibitedUses.includes('platform-proof claim'));

const one = appendAcceptedOutput(empty, {
  text: '𝌋 Need the blue folder and keep EXHIBIT-42 in the note. Knock twice and move fast.',
  createdAt: '2026-05-16T00:00:00.000Z',
  acceptance: { acceptedBy: 'test', reason: 'sealed fixture', stateAtAcceptance: 'seal' },
  ingestionAudit: ingestionAudit(0.2)
});
assert.equal(empty.memory.entries.length, 0);
assert.equal(one.memory.entries.length, 1);
assert.equal(one.memory.acceptedCount, 1);
assert(one.memory.entries[0].id);
assert.equal(one.diagnostics.status, 'underfit');
assert(one.diagnostics.warnings.includes('persona-history-underfit'));

const two = appendAcceptedOutput(one, {
  text: '𝌋 Bring the small bag, keep EXHIBIT-42 visible, and stay by the back door. Say less and move fast.',
  ingestionAudit: ingestionAudit(0.24)
});
assert.equal(two.diagnostics.status, 'underfit');
assert(two.diagnostics.warnings.includes('persona-history-underfit'));

const three = appendAcceptedOutput(two, {
  text: '𝌋 Keep EXHIBIT-42 in the packet. Knock twice, take the small bag, and leave through the back gate.',
  ingestionAudit: ingestionAudit(0.22)
});
assert(three.field.centroid);
assert.equal(three.field.centroid.entryCount, 3);
assert(three.field.centroid.featureCount > 0);
assert(three.field.variance);
assert(three.field.tolerance);
assert(['usable', 'overfit-risk'].includes(three.diagnostics.status));

let pruned = createPersonaMemory({ personaId: 'tiny-history', label: 'Tiny History', maxEntries: 3 });
for (let i = 0; i < 5; i += 1) {
  pruned = appendAcceptedOutput(pruned, { text: `Entry ${i} keeps a short field voice with a different number ${i}.` });
}
assert.equal(pruned.memory.entries.length, 3);
assert.equal(pruned.memory.acceptedCount, 5);
assert(pruned.memory.entries[0].text.includes('Entry 2'));
assert(pruned.memory.entries[2].text.includes('Entry 4'));

const ritualMemory = createPersonaMemory({
  personaId: 'ritual-field',
  label: 'Ritual Field',
  ritualSurface: { requiredMarkers: ['𝌋'], optionalMarkers: ['⟐'], protectedLiterals: ['EXHIBIT-42'], glyphs: ['𝌋', '⟐'], khonaLitPoRequired: true }
});
const ritualOne = appendAcceptedOutput(ritualMemory, { text: '𝌋 Khona‌lit-po keeps EXHIBIT-42 intact ⟐', ingestionAudit: ingestionAudit(0.18, { unicodeSurface: { zwnjCount: 1 }, khonaLitPo: { status: 'intact' } }) });
const ritualTwo = appendAcceptedOutput(ritualOne, { text: '𝌋 Khona po lit keeps EXHIBIT-42 but the boundary is broken', ingestionAudit: ingestionAudit(0.3, { khonaLitPo: { status: 'broken' } }) });
assert(ritualTwo.field.ritual.glyphsObserved.includes('𝌋'));
assert(ritualTwo.field.ritual.glyphsObserved.includes('⟐'));
assert.equal(ritualTwo.field.ritual.khonaLitPo.intact, 1);
assert.equal(ritualTwo.field.ritual.khonaLitPo.broken, 1);
assert(ritualTwo.field.ritual.warnings.includes('khona-lit-po-memory-drift'));

const ingestionMemory = appendAcceptedOutput(three, {
  text: '𝌋 EXHIBIT-42 stays visible, but this one carries high friction.',
  ingestionAudit: ingestionAudit(0.72, { normalization: { nfkcChanged: true }, unicodeSurface: { hiddenMarkCount: 2, zwnjCount: 1 }, parserSensitive: { spanCount: 3 } })
});
assert.equal(typeof ingestionMemory.field.ingestion.meanIngestionFriction, 'number');
assert.equal(typeof ingestionMemory.field.ingestion.maxIngestionFriction, 'number');
assert(ingestionMemory.field.ingestion.warnings.includes('persona-ingestion-friction-high'));

let overfit = createPersonaMemory({ personaId: 'overfit', label: 'Overfit' });
for (let i = 0; i < 3; i += 1) {
  overfit = appendAcceptedOutput(overfit, { text: 'Repeat the exact same field sentence so the mask becomes extremely recognizable.' });
}
const linkState = computePersonaLinkabilityState(overfit);
assert(linkState.meanPairwiseSimilarity >= 0.8);
assert(linkState.status === 'overfit-risk' || linkState.warnings.includes('persona-linkability-high'));

const field = derivePersonaField(three);
assert(field.maskProfile);
assert(Array.isArray(field.maskHistory));
const vector = buildEscapeVector({
  protectedBaselineText: 'I keep circling around the issue with a lot of clauses and a reflective rhythm that keeps returning to the same emotional surface.',
  maskText: field.maskHistory[0].text,
  maskProfile: field.maskProfile,
  maskHistory: field.maskHistory,
  draftText: 'Please keep EXHIBIT-42 in the message while shortening the cadence.',
  outputText: '𝌋 Keep EXHIBIT-42 in the packet. Knock twice and move fast.',
  protectedLiterals: ['EXHIBIT-42'],
  options: { thresholds: { minWords: 5 }, targetContext: 'secure group chat' }
});
assert(vector.scores);

const summaryText = JSON.stringify(three).toLowerCase();
assert(!summaryText.includes('untraceable'));
assert(!summaryText.includes('same author'));
assert(!summaryText.includes('not same author'));
assert(!summaryText.includes('guaranteed safe'));

console.log('persona-memory tests passed');
