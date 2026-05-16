import assert from 'assert';
import {
  appendIterationRow,
  createIterationLedger,
  createIterationRow,
  deriveChangedDimensions,
  exportIterationLedgerJson,
  hashLedgerText,
  linkAcceptedOutputToIteration
} from '../app/engine/iteration-ledger.js';

assert.equal(typeof createIterationLedger, 'function');
assert.equal(typeof createIterationRow, 'function');
assert.equal(typeof appendIterationRow, 'function');
assert.equal(typeof exportIterationLedgerJson, 'function');
assert.equal(typeof linkAcceptedOutputToIteration, 'function');
assert.equal(typeof hashLedgerText, 'function');

const ledger = createIterationLedger({ context: { mode: 'neutralize', selectedPersonaId: 'field-messenger' } });
assert.equal(ledger.version, 'phase-6');
assert.equal(ledger.rows.length, 0);
assert.equal(ledger.diagnostics.rowCount, 0);
assert.equal(ledger.reproducibility.localOnly, true);
assert(ledger.reproducibility.hashAlgorithm);

assert.equal(hashLedgerText('same text'), hashLedgerText('same text'));
assert.notEqual(hashLedgerText('same text'), hashLedgerText('different text'));
assert.equal(hashLedgerText(''), hashLedgerText(''));
assert.doesNotThrow(() => hashLedgerText({ hello: 'world' }));

const fixtureVector = {
  scores: {
    sourceResidualRisk: 0.72,
    maskFit: 0.31,
    maskDeltaSafe: -0.41,
    semanticFidelity: 0.96,
    belongingWithoutCollapse: 0.44,
    ingestionFriction: 0.21,
    apertureRecaptureRisk: 0.63,
    maskLinkability: 0.18,
    maskDrift: 0.28
  },
  diagnostics: { warnings: [] }
};
const fixtureDecision = {
  state: 'continue',
  action: 'neutralize-source',
  confidence: 0.77,
  reasons: ['source-residual-above-band'],
  warnings: [],
  steeringActions: [{ code: 'dampen-source-connectors', targetMetric: 'sourceResidualRisk' }],
  steeringPacket: { nextInstruction: 'Dampen source connectors.' }
};

const row = createIterationRow({
  protectedBaselineText: 'PRIVATE BASELINE TEXT',
  maskReferenceText: 'MASK REFERENCE TEXT',
  messageDraftText: 'PRIVATE DRAFT TEXT',
  protectedOutputText: 'PRIVATE OUTPUT TEXT',
  escapeVector: fixtureVector,
  controllerDecision: fixtureDecision
});
assert(row.hashes.inputHash);
assert(row.hashes.outputHash);
assert.equal(row.texts.protectedBaseline, null);
assert.equal(row.texts.messageDraft, null);
assert.equal(row.texts.protectedOutput, null);
assert.equal(row.textIncluded.protectedBaseline, false);

const included = createIterationRow({
  protectedBaselineText: 'PRIVATE BASELINE TEXT',
  maskReferenceText: 'MASK REFERENCE TEXT',
  messageDraftText: 'PRIVATE DRAFT TEXT',
  protectedOutputText: 'PRIVATE OUTPUT TEXT',
  escapeVector: fixtureVector,
  controllerDecision: fixtureDecision,
  includeTexts: true
});
assert.equal(included.texts.protectedBaseline, 'PRIVATE BASELINE TEXT');
assert.equal(included.textIncluded.protectedOutput, true);

const ledger0 = createIterationLedger();
const ledger1 = appendIterationRow(ledger0, { protectedOutputText: 'one', escapeVector: fixtureVector, controllerDecision: fixtureDecision });
assert.equal(ledger0.rows.length, 0);
assert.equal(ledger1.rows.length, 1);
assert.equal(ledger1.rows[0].t, 0);
const ledger2 = appendIterationRow(ledger1, { protectedOutputText: 'two', escapeVector: fixtureVector, controllerDecision: fixtureDecision });
assert.equal(ledger2.rows[1].t, 1);
assert.equal(ledger2.diagnostics.rowCount, 2);

assert.equal(row.scores.sourceResidualRisk, 0.72);
assert.equal(row.scores.maskFit, 0.31);
assert.equal(row.scores.maskDeltaSafe, -0.41);
assert.equal(row.scores.semanticFidelity, 0.96);
assert.equal(row.scores.belongingWithoutCollapse, 0.44);
assert.equal(row.scores.ingestionFriction, 0.21);
assert.equal(row.scores.apertureRecaptureRisk, 0.63);
assert.equal(row.controller.state, 'continue');
assert.equal(row.controller.action, 'neutralize-source');
assert.equal(row.controller.confidence, 0.77);
assert(row.controller.reasons.includes('source-residual-above-band'));
assert(row.controller.steeringActions[0].code === 'dampen-source-connectors');
assert.equal(row.status.sealed, false);
assert.equal(row.status.held, false);
assert.equal(row.status.acceptEligible, true);

const restoreDims = deriveChangedDimensions({
  escapeVector: { scores: { semanticFidelity: 0.5, ingestionFriction: 0.7 } },
  controllerDecision: { state: 'restore' }
});
assert(restoreDims.includes('semantic-fidelity-low'));
assert(restoreDims.includes('ingestion-friction-high'));
assert(restoreDims.includes('controller-restore'));

const linked = linkAcceptedOutputToIteration(ledger1, { iterationId: ledger1.rows[0].id, personaMemoryEntryId: 'entry-1' });
assert.equal(linked.rows[0].status.accepted, true);
assert.equal(linked.rows[0].references.personaMemoryEntryId, 'entry-1');
assert.equal(linked.accepted.iterationIds.length, 1);
assert.equal(linked.accepted.latestAcceptedIterationId, ledger1.rows[0].id);

const exportedDefault = exportIterationLedgerJson(appendIterationRow(createIterationLedger(), {
  protectedBaselineText: 'PRIVATE BASELINE TEXT',
  maskReferenceText: 'MASK REFERENCE TEXT',
  messageDraftText: 'PRIVATE DRAFT TEXT',
  protectedOutputText: 'PRIVATE OUTPUT TEXT',
  escapeVector: fixtureVector,
  controllerDecision: fixtureDecision
}));
assert(!exportedDefault.includes('PRIVATE BASELINE TEXT'));
assert(!exportedDefault.includes('PRIVATE DRAFT TEXT'));
assert(!exportedDefault.includes('PRIVATE OUTPUT TEXT'));
assert(exportedDefault.includes('outputHash'));
assert(exportedDefault.includes('sourceResidualRisk'));
assert(exportedDefault.includes('reproducibility'));

const exportedWithText = exportIterationLedgerJson(appendIterationRow(createIterationLedger(), {
  protectedBaselineText: 'PRIVATE BASELINE TEXT',
  maskReferenceText: 'MASK REFERENCE TEXT',
  messageDraftText: 'PRIVATE DRAFT TEXT',
  protectedOutputText: 'PRIVATE OUTPUT TEXT',
  escapeVector: fixtureVector,
  controllerDecision: fixtureDecision,
  includeTexts: true
}), { includeTexts: true });
assert(exportedWithText.includes('PRIVATE BASELINE TEXT'));
assert(exportedWithText.includes('PRIVATE OUTPUT TEXT'));

for (const forbidden of ['untraceable', 'platform-proof', 'guaranteed safe', 'same author', 'not same author']) {
  assert(!exportedDefault.toLowerCase().includes(forbidden));
}

console.log('iteration-ledger tests passed');
