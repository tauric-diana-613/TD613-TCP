function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function byId(root, id) {
  return root.querySelector(`#${id}`);
}

let trainerModuleBundlePromise = null;

function versionedModuleHref(relativePath) {
  const url = new URL(relativePath, import.meta.url);
  const currentVersion = new URL(import.meta.url).searchParams.get('v');
  if (currentVersion) {
    url.searchParams.set('v', currentVersion);
  }
  return url.href;
}

function loadTrainerModuleBundle() {
  if (!trainerModuleBundlePromise) {
    trainerModuleBundlePromise = Promise.all([
      import(versionedModuleHref('./extractor.js')),
      import(versionedModuleHref('./translator.js')),
      import(versionedModuleHref('./validator.js')),
      import(versionedModuleHref('./persona.js')),
      import(versionedModuleHref('./report.js'))
    ]).then(([
      extractor,
      translator,
      validator,
      persona,
      report
    ]) => ({
      extractor,
      translator,
      validator,
      persona,
      report
    }));
  }

  return trainerModuleBundlePromise;
}

export async function createTrainerController(options = {}) {
  const {
    root,
    engine,
    sampleLibrary = [],
    onInjectPersona,
    onStatus,
    applyStaticGlyphs
  } = options;

  if (!root) {
    throw new Error('Trainer root node is required.');
  }
  if (!engine || typeof engine.extractCadenceProfile !== 'function') {
    throw new Error('Trainer requires the live TCP engine.');
  }

  const modules = await loadTrainerModuleBundle();
  const { buildCorpusExtraction } = modules.extractor;
  const { buildPersonaPrompt } = modules.translator;
  const { validateCandidateAgainstFingerprint } = modules.validator;
  const { buildPersonaSpec, exportPersonaSpec } = modules.persona;
  const { renderCorrectionHints, renderFingerprintSummary, renderValidationReport } = modules.report;

  const nodes = {
    personaName: byId(root, 'trainerPersonaName'),
    corpusInput: byId(root, 'trainerCorpusInput'),
    fingerprintSummary: byId(root, 'trainerFingerprintSummary'),
    promptOutput: byId(root, 'trainerPromptOutput'),
    generatedOutput: byId(root, 'trainerGeneratedOutput'),
    validationReport: byId(root, 'trainerValidationReport'),
    correctionHints: byId(root, 'trainerCorrectionHints'),
    exportOutput: byId(root, 'trainerExportOutput'),
    extractBtn: byId(root, 'trainerExtractBtn'),
    validateBtn: byId(root, 'trainerValidateBtn'),
    exportBtn: byId(root, 'trainerExportBtn'),
    injectBtn: byId(root, 'trainerInjectBtn'),
    statusBase: byId(root, 'trainerStatusBase'),
    statusCue: byId(root, 'trainerStatusCue')
  };

  const state = {
    extraction: null,
    promptBuild: null,
    validation: null,
    exportSpec: null,
    lastInjectedPersonaSummary: null
  };

  function setStatus(message, cue = '') {
    nodes.statusBase.textContent = message;
    const visible = Boolean(cue);
    nodes.statusCue.hidden = !visible;
    nodes.statusCue.textContent = cue;
    nodes.statusCue.dataset.cueKey = visible ? 'trainer' : '';
    if (typeof onStatus === 'function') {
      onStatus(message);
    }
  }

  function personaName() {
    return String(nodes.personaName?.value || '').trim() || 'Trainer Persona';
  }

  function updateButtons() {
    const hasCorpus = Boolean(nodes.corpusInput?.value.trim());
    const hasExtraction = Boolean(state.extraction);
    const hasGenerated = Boolean(nodes.generatedOutput?.value.trim());

    nodes.extractBtn.disabled = !hasCorpus;
    nodes.validateBtn.disabled = !(hasExtraction && hasGenerated);
    nodes.exportBtn.disabled = !hasExtraction;
    nodes.injectBtn.disabled = !(state.exportSpec && state.validation?.pass);
  }

  function render() {
    if (applyStaticGlyphs) {
      applyStaticGlyphs(root);
    }
    nodes.fingerprintSummary.innerHTML = renderFingerprintSummary(state.extraction, state.promptBuild);
    nodes.validationReport.innerHTML = renderValidationReport(state.validation);
    nodes.correctionHints.innerHTML = renderCorrectionHints(state.validation);
    nodes.promptOutput.value = state.promptBuild?.systemPrompt || '';
    nodes.exportOutput.value = state.exportSpec ? exportPersonaSpec(state.exportSpec) : '';
    updateButtons();
  }

  function resetDerivedState({ keepExtraction = false } = {}) {
    if (!keepExtraction) {
      state.extraction = null;
      state.promptBuild = null;
    }
    state.validation = null;
    state.exportSpec = null;
    nodes.exportOutput.value = '';
  }

  function extract() {
    state.extraction = buildCorpusExtraction(engine, nodes.corpusInput.value);
    state.promptBuild = buildPersonaPrompt(state.extraction.fingerprint, {
      name: personaName(),
      referenceSamples: state.extraction.samples
    });
    state.validation = null;
    state.exportSpec = null;
    render();
    setStatus(`Trainer corpus extracted for ${personaName()}.`, `samples ${state.extraction.stats.sampleCount}`);
    return snapshot();
  }

  function validate() {
    if (!state.extraction) {
      extract();
    }
    state.validation = validateCandidateAgainstFingerprint(engine, nodes.generatedOutput.value, state.extraction, {
      personaName: personaName(),
      sampleLibrary
    });
    state.promptBuild = buildPersonaPrompt(state.extraction.fingerprint, {
      name: personaName(),
      referenceSamples: state.extraction.samples,
      correctionHints: state.validation.correctionHints
    });
    state.exportSpec = buildPersonaSpec({
      name: personaName(),
      extraction: state.extraction,
      promptBuild: state.promptBuild,
      validation: state.validation,
      buildMod: engine.cadenceModFromProfile
    });
    render();
    setStatus(
      state.validation.pass
        ? `${personaName()} is retrieval-safe enough to export or inject.`
        : `${personaName()} still needs correction before persona injection.`,
      state.validation.pass ? 'ready' : state.validation.status
    );
    return snapshot();
  }

  function exportSpec() {
    if (!state.extraction) {
      extract();
    }
    if (!state.validation) {
      validate();
    }
    render();
    setStatus(`Persona spec prepared for ${personaName()}.`, 'json');
    return state.exportSpec;
  }

  function inject() {
    if (!state.exportSpec || !state.validation?.pass) {
      throw new Error('Validate a successful trainer sample before injecting a persona.');
    }
    if (typeof onInjectPersona !== 'function') {
      throw new Error('Trainer injection hook is unavailable.');
    }
    const inserted = onInjectPersona(clone(state.exportSpec.browserPersona));
    state.lastInjectedPersonaSummary = inserted
      ? { id: inserted.id, name: inserted.name, source: inserted.source }
      : { id: state.exportSpec.browserPersona.id, name: state.exportSpec.browserPersona.name, source: state.exportSpec.browserPersona.source };
    render();
    setStatus(`${state.lastInjectedPersonaSummary.name} is now in the Personas deck.`, 'injected');
    return state.lastInjectedPersonaSummary;
  }

  function serializeState() {
    return {
      personaName: nodes.personaName.value,
      corpusInput: nodes.corpusInput.value,
      generatedOutput: nodes.generatedOutput.value,
      extraction: clone(state.extraction),
      promptBuild: clone(state.promptBuild),
      validation: clone(state.validation),
      exportSpec: clone(state.exportSpec),
      lastInjectedPersonaSummary: clone(state.lastInjectedPersonaSummary)
    };
  }

  function restoreState(nextState = {}) {
    nodes.personaName.value = nextState.personaName || '';
    nodes.corpusInput.value = nextState.corpusInput || '';
    nodes.generatedOutput.value = nextState.generatedOutput || '';
    state.extraction = clone(nextState.extraction) || null;
    state.promptBuild = clone(nextState.promptBuild) || null;
    state.validation = clone(nextState.validation) || null;
    state.exportSpec = clone(nextState.exportSpec) || null;
    state.lastInjectedPersonaSummary = clone(nextState.lastInjectedPersonaSummary) || null;
    render();
  }

  function snapshot() {
    return {
      personaName: personaName(),
      corpusReady: Boolean(state.extraction),
      sampleCount: state.extraction?.stats?.sampleCount || 0,
      promptReady: Boolean(nodes.promptOutput.value.trim()),
      validationReady: Boolean(state.validation),
      validationPass: Boolean(state.validation?.pass),
      validationStatus: state.validation?.status || 'idle',
      exportReady: Boolean(state.exportSpec),
      canInject: !nodes.injectBtn.disabled,
      lastInjectedPersonaSummary: clone(state.lastInjectedPersonaSummary)
    };
  }

  nodes.extractBtn.addEventListener('click', () => {
    try {
      extract();
    } catch (error) {
      setStatus(error.message);
    }
  });
  nodes.validateBtn.addEventListener('click', () => {
    try {
      validate();
    } catch (error) {
      setStatus(error.message);
    }
  });
  nodes.exportBtn.addEventListener('click', () => {
    try {
      exportSpec();
    } catch (error) {
      setStatus(error.message);
    }
  });
  nodes.injectBtn.addEventListener('click', () => {
    try {
      inject();
    } catch (error) {
      setStatus(error.message);
    }
  });
  nodes.corpusInput.addEventListener('input', () => {
    resetDerivedState();
    render();
    setStatus('Trainer corpus changed. Extract again to refresh the target fingerprint.');
  });
  nodes.personaName.addEventListener('input', () => {
    if (state.extraction) {
      state.promptBuild = buildPersonaPrompt(state.extraction.fingerprint, {
        name: personaName(),
        referenceSamples: state.extraction.samples,
        correctionHints: state.validation?.correctionHints || []
      });
      if (state.validation) {
        state.exportSpec = buildPersonaSpec({
          name: personaName(),
          extraction: state.extraction,
          promptBuild: state.promptBuild,
          validation: state.validation,
          buildMod: engine.cadenceModFromProfile
        });
      }
      render();
    }
  });
  nodes.generatedOutput.addEventListener('input', () => {
    state.validation = null;
    state.exportSpec = null;
    render();
    setStatus('Generated sample changed. Validate again to refresh retrieval and scalar checks.');
  });

  render();
  setStatus('Paste a reference corpus, extract the voice, then validate a manually generated sample.');

  return {
    extract,
    validate,
    exportSpec,
    inject,
    snapshot,
    serializeState,
    restoreState
  };
}
