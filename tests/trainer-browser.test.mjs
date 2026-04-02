import assert from 'assert';

import * as engine from '../app/engine/stylometry.js';
import { createTrainerController } from '../app/toys/persona-trainer/browser.js';
import { DIAGNOSTIC_SAMPLE_LIBRARY } from '../app/data/diagnostics.js';

class MockElement {
  constructor(id) {
    this.id = id;
    this.value = '';
    this.innerHTML = '';
    this.textContent = '';
    this.hidden = false;
    this.disabled = false;
    this.dataset = {};
    this.listeners = new Map();
  }

  addEventListener(type, listener) {
    const listeners = this.listeners.get(type) || [];
    listeners.push(listener);
    this.listeners.set(type, listeners);
  }

  dispatch(type) {
    const listeners = this.listeners.get(type) || [];
    listeners.forEach((listener) => listener({ target: this }));
  }
}

class MockRoot {
  constructor(ids = []) {
    this.nodes = new Map(ids.map((id) => [id, new MockElement(id)]));
  }

  querySelector(selector) {
    if (!selector.startsWith('#')) {
      return null;
    }
    return this.nodes.get(selector.slice(1)) || null;
  }
}

const ids = [
  'trainerPersonaName',
  'trainerCorpusInput',
  'trainerFingerprintSummary',
  'trainerPromptOutput',
  'trainerGeneratedOutput',
  'trainerDraftContext',
  'trainerValidationReport',
  'trainerCorrectionHints',
  'trainerExportOutput',
  'trainerExtractBtn',
  'trainerForgeDraftBtn',
  'trainerValidateBtn',
  'trainerReleaseGateBtn',
  'trainerExportBtn',
  'trainerInjectBtn',
  'trainerReleaseGateHint',
  'trainerStatusBase',
  'trainerStatusCue'
];

const root = new MockRoot(ids);
const sampleA = DIAGNOSTIC_SAMPLE_LIBRARY.find((sample) => sample.id === 'building-access-formal-record');
const sampleB = DIAGNOSTIC_SAMPLE_LIBRARY.find((sample) => sample.id === 'building-access-rushed-mobile');

assert.ok(sampleA, 'building-access-formal-record sample is present');
assert.ok(sampleB, 'building-access-rushed-mobile sample is present');

const injected = [];
const controller = await createTrainerController({
  root,
  engine,
  sampleLibrary: DIAGNOSTIC_SAMPLE_LIBRARY,
  onInjectPersona: (persona) => {
    injected.push(persona);
    return persona;
  },
  onStatus: () => {},
  applyStaticGlyphs: () => {},
  resolveDraftContext: () => ({
    sourceText: sampleA.text,
    sourceOrigin: 'test fixture'
  })
});

root.querySelector('#trainerPersonaName').value = 'Release Gate Persona';
root.querySelector('#trainerCorpusInput').value = `${sampleA.text}\n\n${sampleB.text}`;

controller.extract();
root.querySelector('#trainerGeneratedOutput').value = sampleA.text;
controller.validate();

const beforeRelease = controller.snapshot();
assert.ok(beforeRelease.validationPass, 'validation passes on the seeded trainer fixture');
assert.equal(beforeRelease.exportReady, false, 'export is not ready before the release gate is armed');
assert.equal(beforeRelease.releaseGateArmed, false, 'release gate starts closed');
assert.equal(root.querySelector('#trainerExportBtn').disabled, true, 'export button stays disabled before gate arming');
assert.equal(root.querySelector('#trainerExportOutput').value, '', 'export output stays blank before gate arming');

const blockedExport = controller.exportSpec();
assert.equal(blockedExport, null, 'exportSpec returns null while the release gate is closed');
assert.equal(root.querySelector('#trainerExportOutput').value, '', 'blocked export does not materialize output');

controller.toggleReleaseGate();
const afterGate = controller.snapshot();
assert.equal(afterGate.releaseGateArmed, true, 'release gate arms after explicit toggle');
assert.equal(root.querySelector('#trainerExportBtn').disabled, false, 'export button unlocks after the release gate opens');
assert.ok(root.querySelector('#trainerExportOutput').value.trim().length > 0, 'arming the release gate materializes export output in-tab');

const exported = controller.exportSpec();
assert.ok(exported && exported.browserPersona, 'exportSpec returns the forged persona once the gate is armed');

const injectedPersona = controller.inject();
assert.equal(injected.length, 1, 'inject pushes one session-local persona through the hook');
assert.equal(injectedPersona.id, exported.browserPersona.id, 'inject returns the exported browser persona identity');

const serialized = controller.serializeState();
root.querySelector('#trainerPersonaName').value = 'Changed Persona';
controller.restoreState(serialized);
const afterRestore = controller.snapshot();
assert.equal(afterRestore.releaseGateArmed, true, 'restoreState preserves release-gate posture inside the live runtime');
assert.equal(afterRestore.lastInjectedPersonaSummary?.id, exported.browserPersona.id, 'restoreState preserves injected persona summary');

console.log('trainer-browser.test.mjs passed');
