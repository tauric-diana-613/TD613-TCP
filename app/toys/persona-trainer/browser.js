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
    applyStaticGlyphs,
    resolveDraftContext
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
    draftContext: byId(root, 'trainerDraftContext'),
    validationReport: byId(root, 'trainerValidationReport'),
    correctionHints: byId(root, 'trainerCorrectionHints'),
    exportOutput: byId(root, 'trainerExportOutput'),
    extractBtn: byId(root, 'trainerExtractBtn'),
    forgeDraftBtn: byId(root, 'trainerForgeDraftBtn'),
    validateBtn: byId(root, 'trainerValidateBtn'),
    releaseGateBtn: byId(root, 'trainerReleaseGateBtn'),
    releaseGateHint: byId(root, 'trainerReleaseGateHint'),
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
    releaseGateArmed: false,
    draftResult: null,
    draftContext: null,
    lastInjectedPersonaSummary: null,
    statusMessage: '',
    statusCue: '',
    statusCueKey: ''
  };

  function applyStatus() {
    const message = state.statusMessage || '';
    const cue = state.statusCue || '';
    const visible = Boolean(cue);

    nodes.statusBase.textContent = message;
    nodes.statusCue.hidden = !visible;
    nodes.statusCue.textContent = cue;
    nodes.statusCue.dataset.cueKey = visible ? (state.statusCueKey || cue || 'trainer') : '';
  }

  function setStatus(message, cue = '') {
    state.statusMessage = message || '';
    state.statusCue = cue || '';
    state.statusCueKey = cue || '';
    applyStatus();
    if (typeof onStatus === 'function') {
      onStatus(message);
    }
  }

  function personaName() {
    return String(nodes.personaName?.value || '').trim() || 'Trainer Persona';
  }

  function cloneContext(value) {
    return value ? clone(value) : null;
  }

  function currentDraftContext() {
    const resolved = typeof resolveDraftContext === 'function' ? (resolveDraftContext() || {}) : {};
    const merged = {
      ...cloneContext(resolved),
      ...(state.draftContext || {})
    };

    if (!String(merged.sourceText || '').trim() && state.extraction?.samples?.[0]) {
      merged.sourceText = state.extraction.samples[0];
      merged.sourceOrigin = merged.sourceOrigin || 'first extracted corpus sample';
    }
    if (!String(merged.corpusText || '').trim() && state.extraction?.rawCorpus) {
      merged.corpusText = state.extraction.rawCorpus;
      merged.corpusOrigin = merged.corpusOrigin || 'extracted corpus';
    }
    return merged;
  }

  function draftShell(context = {}) {
    const persona = context.persona || null;
    const profile = persona?.profile || state.extraction?.targetProfile || null;
    if (!profile) {
      return null;
    }
    return {
      mode: 'persona',
      label: persona?.name || personaName(),
      profile: { ...profile },
      mod: persona?.mod ? { ...persona.mod } : (typeof engine.cadenceModFromProfile === 'function' ? engine.cadenceModFromProfile(profile) : null),
      strength: Number(persona?.strength || (state.extraction ? 0.84 : 0.82)),
      source: persona?.source || 'trainer'
    };
  }

  function renderDraftContext() {
    if (!nodes.draftContext) {
      return;
    }
    const context = currentDraftContext();
    const persona = context.persona || null;
    const sourceText = String(context.sourceText || '').trim();
    const sourceOrigin = context.sourceOrigin || (state.extraction?.samples?.[0] ? 'first extracted corpus sample' : 'no live source');
    const sourcePreview = sourceText
      ? `${sourceText.replace(/\s+/g, ' ').slice(0, 120)}${sourceText.replace(/\s+/g, ' ').length > 120 ? '…' : ''}`
      : 'Forge Draft will fall back to the extracted corpus once you extract the field.';
    const shellLine = persona
      ? `${persona.name} will steer the draft.`
      : state.extraction
        ? `${personaName()} can draft directly from the extracted field.`
        : 'Choose a shelf mask, wear one in Homebase, or extract a field first.';
    nodes.draftContext.innerHTML = `
      <div class="trainer-draft-context">
        <div><strong>Shell</strong> ${shellLine}</div>
        <div><strong>Source</strong> ${sourceOrigin}</div>
        <div><strong>Preview</strong> ${sourcePreview}</div>
      </div>
    `;
  }

  function updateButtons() {
    const hasCorpus = Boolean(nodes.corpusInput?.value.trim());
    const hasExtraction = Boolean(state.extraction);
    const hasGenerated = Boolean(nodes.generatedOutput?.value.trim());
    const context = currentDraftContext();
    const hasDraftSource = Boolean(String(context.sourceText || '').trim()) || Boolean(state.extraction?.samples?.[0]);
    const hasDraftShell = Boolean(draftShell(context));
    const releaseGateReady = Boolean(state.validation?.pass && state.exportSpec);

    nodes.extractBtn.disabled = !hasCorpus;
    nodes.forgeDraftBtn.disabled = !(hasCorpus || hasExtraction || hasDraftSource) || !hasDraftShell;
    nodes.validateBtn.disabled = !(hasExtraction && hasGenerated);
    if (nodes.releaseGateBtn) {
      nodes.releaseGateBtn.disabled = !releaseGateReady;
    }
    nodes.exportBtn.disabled = !(releaseGateReady && state.releaseGateArmed);
    nodes.injectBtn.disabled = !(state.exportSpec && state.validation?.pass);
  }

  function render() {
    if (applyStaticGlyphs) {
      applyStaticGlyphs(root);
    }
    applyStatus();
    renderDraftContext();
    nodes.fingerprintSummary.innerHTML = renderFingerprintSummary(state.extraction, state.promptBuild);
    nodes.validationReport.innerHTML = renderValidationReport(state.validation);
    nodes.correctionHints.innerHTML = renderCorrectionHints(state.validation);
    nodes.promptOutput.value = state.promptBuild?.systemPrompt || '';
    if (nodes.releaseGateBtn) {
      nodes.releaseGateBtn.textContent = state.releaseGateArmed ? 'Close Release Gate' : 'Arm Release Gate';
      nodes.releaseGateBtn.dataset.armed = state.releaseGateArmed ? 'true' : 'false';
    }
    if (nodes.releaseGateHint) {
      nodes.releaseGateHint.textContent =
        state.releaseGateArmed && state.exportSpec
          ? 'Release gate armed for this tab. Export is materialized until you close the gate or refresh.'
          : state.validation?.pass && state.exportSpec
            ? 'Validation passed. Arm the one-session release gate if you need an export artifact outside this tab.'
            : 'Export stays sealed until you validate a passing sample and arm a one-session release gate.';
    }
    nodes.exportOutput.value = state.releaseGateArmed && state.exportSpec ? exportPersonaSpec(state.exportSpec) : '';
    updateButtons();
  }

  function resetDerivedState({ keepExtraction = false } = {}) {
    if (!keepExtraction) {
      state.extraction = null;
      state.promptBuild = null;
    }
    state.validation = null;
    state.exportSpec = null;
    state.releaseGateArmed = false;
    state.draftResult = null;
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
    setStatus(`${personaName()} forged a target field from corpus.`, `samples ${state.extraction.stats.sampleCount}`);
    return snapshot();
  }

  function openContext(nextContext = {}) {
    const context = cloneContext(nextContext) || {};
    state.draftContext = {
      ...(state.draftContext || {}),
      ...context
    };

    if (context.forcePopulate) {
      if (context.persona?.name) {
        nodes.personaName.value = context.persona.name;
      }
      if (String(context.corpusText || '').trim()) {
        nodes.corpusInput.value = context.corpusText;
        resetDerivedState();
      }
      nodes.generatedOutput.value = '';
    }

    render();
    setStatus(
      context.persona?.name
        ? `${context.persona.name} opened in Trainer. Forge Draft can seed a live candidate from current field context.`
        : 'Trainer context refreshed. Forge Draft can now seed a live candidate from the field.',
      'trainer-context'
    );
    return snapshot();
  }

  function forgeDraft() {
    if (!state.extraction && nodes.corpusInput.value.trim()) {
      extract();
    }

    const context = currentDraftContext();
    const sourceText = String(context.sourceText || state.extraction?.samples?.[0] || '').trim();
    if (!sourceText) {
      throw new Error('Forge Draft needs source text from Homebase, Deck, or the extracted corpus.');
    }

    const shell = draftShell(context);
    if (!shell) {
      throw new Error('Forge Draft needs either a selected persona, a worn mask, or an extracted corpus field.');
    }

    const candidates = [];
    const seenTexts = new Set();
    const pushCandidate = (text, meta = {}) => {
      const normalizedText = String(text || '').trim();
      if ((!normalizedText && meta.holdStatus !== 'held') || (normalizedText && seenTexts.has(normalizedText))) {
        return;
      }
      if (normalizedText) {
        seenTexts.add(normalizedText);
      }
      let validationPreview = null;
      if (normalizedText) {
        try {
          validationPreview = validateCandidateAgainstFingerprint(engine, normalizedText, state.extraction, {
            personaName: personaName(),
            sampleLibrary
          });
        } catch (error) {
          validationPreview = null;
        }
      }
      candidates.push({
        text: normalizedText,
        validationPreview,
        ...meta
      });
    };

    const strengthVariants = [...new Set([
      Number(shell.strength || 0.84),
      Math.max(0.58, Number(shell.strength || 0.84) * 0.84),
      Math.max(0.42, Number(shell.strength || 0.84) * 0.68)
    ].map((value) => Number(value.toFixed(3))))];

    strengthVariants.forEach((candidateStrength) => {
      const transfer = engine.buildCadenceTransfer(sourceText, shell, {
        retrieval: true,
        strength: candidateStrength
      });
      pushCandidate(transfer.text || '', {
        transfer,
        strength: candidateStrength,
        changedDimensions: [...(transfer.changedDimensions || [])],
        transferClass: transfer.transferClass || 'native',
        visibleShift: Boolean(transfer.visibleShift),
        nonTrivialShift: Boolean(transfer.nonTrivialShift),
        holdStatus: transfer.holdStatus || 'landed',
        generationDocket: transfer.generationDocket || null
      });
    });

    candidates.sort((left, right) => {
      const leftHeld = left.holdStatus === 'held';
      const rightHeld = right.holdStatus === 'held';
      const leftValidation = left.validationPreview;
      const rightValidation = right.validationPreview;
      const leftScore =
        (leftHeld ? -120 : 0) +
        (leftValidation?.pass ? 1000 : 0) +
        (leftValidation?.retrievalContract?.retrievalPass ? 300 : 0) +
        ((leftValidation?.scalarSummary?.aggregate || 0) * 100) +
        ((leftValidation?.retrievalContract?.meanAgreement || 0) * 40) +
        (left.nonTrivialShift ? 14 : left.visibleShift ? 6 : 0) +
        ((left.changedDimensions || []).length * 1.5);
      const rightScore =
        (rightHeld ? -120 : 0) +
        (rightValidation?.pass ? 1000 : 0) +
        (rightValidation?.retrievalContract?.retrievalPass ? 300 : 0) +
        ((rightValidation?.scalarSummary?.aggregate || 0) * 100) +
        ((rightValidation?.retrievalContract?.meanAgreement || 0) * 40) +
        (right.nonTrivialShift ? 14 : right.visibleShift ? 6 : 0) +
        ((right.changedDimensions || []).length * 1.5);
      return rightScore - leftScore;
    });

    const chosen = candidates.find((candidate) => candidate.holdStatus !== 'held') || candidates[0] || null;

    if (!chosen || chosen.holdStatus === 'held') {
      nodes.generatedOutput.value = '';
      state.validation = null;
      state.exportSpec = null;
      state.draftResult = {
        sourceOrigin: context.sourceOrigin || 'extracted corpus',
        sourceText,
        personaId: context.persona?.id || '',
        personaName: context.persona?.name || '',
        changedDimensions: [],
        transferClass: 'held',
        visibleShift: false,
        nonTrivialShift: false,
        holdStatus: 'held',
        generationDocket: chosen?.generationDocket || null
      };
      render();
      setStatus(
        chosen?.generationDocket?.headline || `${personaName()} issued a visible hold docket instead of a weak draft.`,
        'draft-held'
      );
      return snapshot();
    }

    nodes.generatedOutput.value = chosen.text || '';
    state.validation = null;
    state.exportSpec = null;
    state.draftResult = {
      sourceOrigin: context.sourceOrigin || 'extracted corpus',
      sourceText,
      personaId: context.persona?.id || '',
      personaName: context.persona?.name || '',
      changedDimensions: [...(chosen.changedDimensions || [])],
      transferClass: chosen.transferClass || 'native',
      visibleShift: Boolean(chosen.visibleShift),
      nonTrivialShift: Boolean(chosen.nonTrivialShift),
      holdStatus: 'landed',
      generationDocket: chosen.generationDocket || null
    };
    render();
    setStatus(
      chosen.transfer
        ? `${personaName()} forged a live draft from ${state.draftResult.sourceOrigin}.`
        : `${personaName()} held the draft close to source to preserve retrieval law.`,
      chosen.nonTrivialShift ? 'draft-live' : 'draft-near-home'
    );
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
    state.releaseGateArmed = false;
    render();
    setStatus(
      state.validation.pass
        ? `${personaName()} held retrieval law and is ready for session-local inject. Arm the release gate only if export is necessary.`
        : `${personaName()} still needs another forge pass before persona injection.`,
      state.validation.pass ? 'forge-ready' : state.validation.status
    );
    return snapshot();
  }

  function toggleReleaseGate() {
    if (!state.exportSpec || !state.validation?.pass) {
      render();
      setStatus('Validate a passing trainer sample before opening the release gate.', 'sealed');
      return snapshot();
    }

    state.releaseGateArmed = !state.releaseGateArmed;
    render();
    setStatus(
      state.releaseGateArmed
        ? `One-session release gate armed for ${personaName()}. Export can materialize in this tab.`
        : `Release gate closed for ${personaName()}. Export is sealed again.`,
      state.releaseGateArmed ? 'release-open' : 'sealed'
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
    if (!state.releaseGateArmed) {
      render();
      setStatus('Arm the one-session release gate before materializing export.', 'sealed');
      return null;
    }
    render();
    setStatus(`Forge export ready for ${personaName()} in this tab.`, 'json');
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
    setStatus(`${state.lastInjectedPersonaSummary.name} is now live on the session shelf and ready for Homebase or Deck.`, 'injected');
    return state.lastInjectedPersonaSummary;
  }

  function serializeState() {
    return {
      personaName: nodes.personaName.value,
      corpusInput: nodes.corpusInput.value,
      generatedOutput: nodes.generatedOutput.value,
      draftContext: clone(state.draftContext),
      draftResult: clone(state.draftResult),
      extraction: clone(state.extraction),
      promptBuild: clone(state.promptBuild),
      validation: clone(state.validation),
      exportSpec: clone(state.exportSpec),
      releaseGateArmed: Boolean(state.releaseGateArmed),
      lastInjectedPersonaSummary: clone(state.lastInjectedPersonaSummary),
      statusMessage: state.statusMessage,
      statusCue: state.statusCue,
      statusCueKey: state.statusCueKey
    };
  }

  function restoreState(nextState = {}) {
    nodes.personaName.value = nextState.personaName || '';
    nodes.corpusInput.value = nextState.corpusInput || '';
    nodes.generatedOutput.value = nextState.generatedOutput || '';
    state.draftContext = clone(nextState.draftContext) || null;
    state.draftResult = clone(nextState.draftResult) || null;
    state.extraction = clone(nextState.extraction) || null;
    state.promptBuild = clone(nextState.promptBuild) || null;
    state.validation = clone(nextState.validation) || null;
    state.exportSpec = clone(nextState.exportSpec) || null;
    state.releaseGateArmed = Boolean(nextState.releaseGateArmed);
    state.lastInjectedPersonaSummary = clone(nextState.lastInjectedPersonaSummary) || null;
    state.statusMessage = nextState.statusMessage || '';
    state.statusCue = nextState.statusCue || '';
    state.statusCueKey = nextState.statusCueKey || nextState.statusCue || '';
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
      draftReady: Boolean(state.draftResult && nodes.generatedOutput.value.trim()),
      draftSource: state.draftResult?.sourceOrigin || '',
      draftPersonaId: state.draftResult?.personaId || '',
      draftPersonaName: state.draftResult?.personaName || '',
      generatedLength: nodes.generatedOutput.value.trim().length,
      exportReady: Boolean(state.releaseGateArmed && state.exportSpec),
      releaseGateArmed: Boolean(state.releaseGateArmed),
      canInject: !nodes.injectBtn.disabled,
      lastInjectedPersonaSummary: clone(state.lastInjectedPersonaSummary),
      statusMessage: state.statusMessage,
      statusCue: state.statusCue,
      statusCueKey: state.statusCueKey
    };
  }

  nodes.extractBtn.addEventListener('click', () => {
    try {
      extract();
    } catch (error) {
      setStatus(error.message);
    }
  });
  nodes.forgeDraftBtn.addEventListener('click', () => {
    try {
      forgeDraft();
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
  nodes.releaseGateBtn.addEventListener('click', () => {
    try {
      toggleReleaseGate();
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
    setStatus('Forge corpus changed. Extract again to refresh the target field.');
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
      state.releaseGateArmed = false;
      render();
    }
  });
  nodes.generatedOutput.addEventListener('input', () => {
    state.validation = null;
    state.exportSpec = null;
    render();
    setStatus('Candidate passage changed. Validate again to refresh retrieval and scalar checks.');
  });

  function consumeSafeHarborHookEvent() {
    if (typeof localStorage === 'undefined') return;
    let raw = null;
    try {
      raw = localStorage.getItem('td613_hook_event');
    } catch (error) {
      return;
    }
    if (!raw) return;
    let hookEvent = null;
    try {
      hookEvent = JSON.parse(raw);
    } catch (error) {
      try { localStorage.removeItem('td613_hook_event'); } catch (cleanupError) {}
      return;
    }
    try { localStorage.removeItem('td613_hook_event'); } catch (cleanupError) {}
    if (!hookEvent || hookEvent.action !== 'route_to_trainer') return;
    const text = String(hookEvent.payload && hookEvent.payload.text ? hookEvent.payload.text : '').trim();
    if (!text) return;
    openContext({ corpusText: text, forcePopulate: true });
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('storage', (event) => {
      if (event.key === 'td613_hook_event' && event.newValue) {
        consumeSafeHarborHookEvent();
      }
    });
  }
  consumeSafeHarborHookEvent();

  render();
  setStatus('Paste a corpus, extract the field, forge a draft, then validate the passage.');

  return {
    openContext,
    extract,
    forgeDraft,
    validate,
    toggleReleaseGate,
    exportSpec,
    inject,
    snapshot,
    serializeState,
    restoreState
  };
}
