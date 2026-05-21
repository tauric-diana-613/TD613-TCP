import assert from 'assert';
import { getHushMask } from '../app/engine/hush-mask-studio.js';
import { buildPhase27HushSwap } from '../app/engine/hush-phase27-swap.js';
import { loadHushRegisterRegistry, summarizeHushRegisterRegistry } from '../app/engine/hush-register-registry.js';
import { phase27MessyNotes, phase27Chatspeak, phase27AaveMarkedSynthetic, phase27CodeSwitching, phase27FormalizationRequests } from './fixtures/hush-phase27-linguistic-custody-fixtures.mjs';

const avg = (values) => {
  const nums = values.filter((value) => Number.isFinite(value));
  return nums.length ? Number((nums.reduce((sum, value) => sum + value, 0) / nums.length).toFixed(4)) : 0;
};

function row(name, input, mask, registerMode = 'preserve-source', warnings = []) {
  const result = buildPhase27HushSwap({ sourceText: input, mask, maskProfile: mask.profile, registerMode, warnings, options: { candidateCount: 30 } });
  const output = result.selectedOutput || result.reviewOutput || '';
  return {
    name,
    input,
    output,
    emitted: Boolean(output.trim()),
    phase27Score: result.phase27?.score ?? null,
    ready: Boolean(result.phase27?.ready),
    dialectPassed: result.dialectCustody?.passed !== false,
    chatspeakPassed: result.chatspeakCustody?.passed !== false,
    codeSwitchPassed: result.codeSwitchBoundary?.passed !== false,
    dialectDrops: result.dialectCustody?.droppedFeatures || [],
    chatDrops: result.chatspeakCustody?.droppedSignals || [],
    boundaryErased: result.codeSwitchBoundary?.erasedBoundaries || [],
    registerMode: result.registerContract?.registerMode || registerMode
  };
}

function summary(rows = []) {
  return {
    attempts: rows.length,
    emitted: rows.filter((item) => item.emitted).length,
    readyRows: rows.filter((item) => item.ready).length,
    dialectFailures: rows.filter((item) => !item.dialectPassed).length,
    chatspeakFailures: rows.filter((item) => !item.chatspeakPassed).length,
    codeSwitchFailures: rows.filter((item) => !item.codeSwitchPassed).length,
    avgPhase27Score: avg(rows.map((item) => item.phase27Score)),
    rows
  };
}

function ready(sum) {
  return sum.emitted > 0 && sum.dialectFailures === 0 && sum.chatspeakFailures === 0 && sum.codeSwitchFailures === 0;
}

const registry = loadHushRegisterRegistry();
const registerPreserve = getHushMask('phase27-register-preserve');
const clearWithCadence = getHushMask('phase27-clear-with-cadence');
const chatCustody = getHushMask('phase27-chat-custody');
const blipBridge = getHushMask('phase27-blip-bridge');
assert(registerPreserve && clearWithCadence && chatCustody && blipBridge);

const messyRows = phase27MessyNotes.map((input, index) => row(`messy-${index + 1}`, input, registerPreserve));
const chatRows = phase27Chatspeak.map((input, index) => row(`chat-${index + 1}`, input, chatCustody));
const dialectRows = phase27AaveMarkedSynthetic.map((input, index) => row(`dialect-${index + 1}`, input, registerPreserve));
const switchRows = phase27CodeSwitching.map((input, index) => row(`switch-${index + 1}`, input, blipBridge));
const formalRows = phase27FormalizationRequests.map((input, index) => row(`formal-${index + 1}`, input, clearWithCadence, 'formalize-source', ['register-formalized']));

const report = {
  version: 'phase-27-linguistic-custody-report',
  ontologyRegistry: summarizeHushRegisterRegistry(registry),
  maskRegistry: {
    phase27MasksRegistered: [registerPreserve.id, clearWithCadence.id, chatCustody.id, blipBridge.id],
    deferredPhase28Masks: ['phase28-transform-to-aave', 'phase28-transform-to-chatspeak']
  },
  messyNotes: summary(messyRows),
  chatspeak: summary(chatRows),
  dialectPreservation: summary(dialectRows),
  codeSwitching: summary(switchRows),
  formalizationExplicitMode: summary(formalRows)
};
report.readiness = {
  ontologyIntake: registry.loaded === true,
  messyNotes: ready(report.messyNotes),
  chatspeak: ready(report.chatspeak),
  dialectPreservation: ready(report.dialectPreservation),
  codeSwitching: ready(report.codeSwitching),
  formalizationExplicitMode: ready(report.formalizationExplicitMode)
};
report.readiness.overall = report.readiness.ontologyIntake && report.readiness.messyNotes && report.readiness.chatspeak && report.readiness.dialectPreservation && report.readiness.codeSwitching && report.readiness.formalizationExplicitMode;

console.log('HUSH_PHASE27_LINGUISTIC_CUSTODY_REPORT ' + JSON.stringify(report));
assert(report.ontologyRegistry.aaveLoaded);
assert(report.ontologyRegistry.chatspeakLoaded);
assert(report.ontologyRegistry.blipLoaded);
assert(report.maskRegistry.phase27MasksRegistered.length === 4);
console.log('hush-phase27-linguistic-custody-report tests passed');
