(function () {
  const { defaults, basePersonas, microcopy } = window.TCP_DATA;
  const {
    HARBOR_LIBRARY,
    compareTexts,
    extractCadenceProfile,
    applyCadenceToText,
    cadenceModFromProfile,
    cadenceCoherence,
    cadenceResonance,
    branchDynamics,
    fieldPotential,
    waveStats,
    custodyThreshold,
    criticalityIndex,
    computeRoutePressure,
    providerDecision,
    chooseHarbor,
    buildLedgerRow,
    nextBadge,
    badgeMeaning
  } = window.TCP_ENGINE;

  const $ = (id) => document.getElementById(id);
  const STORAGE_KEY = 'tcp.savedPersonas.v1';
  const SLOT_LABELS = { A: 'Reference voice', B: 'Probe voice' };
  const SLOT_SHORT = { A: 'reference', B: 'probe' };
  const BADGE_LABELS = {
    'badge.holds': 'holds',
    'badge.branch': 'branch',
    'badge.buffer': 'buffer'
  };
  const MIRROR_COPY = {
    off: { pill: 'Mirror shield // armed', button: 'Open mirror shield' },
    on: { pill: 'Mirror shield // open', button: 'Arm mirror shield' }
  };
  const CONTAINMENT_COPY = {
    on: { pill: 'Containment // stable' },
    off: { pill: 'Containment // venting' }
  };

  let badge = defaults.badge;
  let mirrorLogic = defaults.mirror_logic;
  let containment = defaults.containment;
  let activeVoice = 'A';
  let activeArtifactTab = 'play';
  let bayShells = {
    A: createNativeShell(),
    B: createNativeShell()
  };
  let savedPersonas = loadSavedPersonas();

  $('heroLead').textContent = microcopy.hero_lead;
  $('voiceA').value = defaults.voiceA;
  $('voiceB').value = defaults.voiceB;

  function formatPct(value) {
    return `${Math.round(value * 100)}%`;
  }

  function setMetricTone(id, tone) {
    const card = $(id);
    if (card) {
      card.dataset.tone = tone;
    }
  }

  function setMetricKey(id, label, meta = '') {
    const node = $(id);
    if (!node) {
      return;
    }

    if (meta) {
      node.innerHTML = `${label} <span class="key-meta">${meta}</span>`;
      return;
    }

    node.textContent = label;
  }

  function setMetricKeys(mode = 'pair') {
    if (mode === 'solo') {
      setMetricKey('similarityKey', 'Scan mode');
      setMetricKey('traceKey', 'Sentence rhythm');
      setMetricKey('routeKey', 'Recurrence pressure');
      setMetricKey('custodyKey', 'Active bay');
      return;
    }

    setMetricKey('similarityKey', 'Cadence similarity');
    setMetricKey('traceKey', 'Traceability');
    setMetricKey('routeKey', 'Route pressure');
    setMetricKey('custodyKey', 'Effective archive', 'A_I / A_W');
  }

  function setStatusMessage(message) {
    $('analysisStatus').textContent = message;
  }

  function renderActiveBayStatus() {
    $('activeBayStatus').textContent = `Active bay // ${SLOT_LABELS[activeVoice].toLowerCase()}`;
  }

  function loadSavedPersonas() {
    try {
      const payload = window.localStorage.getItem(STORAGE_KEY);
      return payload ? JSON.parse(payload) : [];
    } catch {
      return [];
    }
  }

  function persistSavedPersonas() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(savedPersonas));
    } catch {
      // keep session-only saved personas if storage is unavailable
    }
  }

  function createNativeShell() {
    return {
      mode: 'native',
      label: 'native cadence',
      mod: null,
      personaId: null,
      source: 'native'
    };
  }

  function cloneShell(shell) {
    return {
      ...shell,
      mod: shell && shell.mod ? { ...shell.mod } : null,
      profile: shell && shell.profile ? { ...shell.profile } : null
    };
  }

  function createPersonaShell(persona) {
    return {
      mode: 'persona',
      label: persona.name,
      mod: persona.mod ? { ...persona.mod } : null,
      profile: persona.profile ? { ...persona.profile } : null,
      personaId: persona.id,
      source: persona.source || 'built-in',
      strength: persona.strength || 0.76
    };
  }

  function createBorrowedShell(voiceState) {
    return {
      mode: 'borrowed',
      label: `borrowed ${SLOT_SHORT[voiceState.slot]} cadence`,
      mod: cadenceModFromProfile(voiceState.effectiveProfile),
      profile: { ...voiceState.effectiveProfile },
      personaId: null,
      source: 'swapped',
      fromSlot: voiceState.slot,
      strength: 0.82
    };
  }

  function getPersonaLibrary() {
    return [...basePersonas, ...savedPersonas];
  }

  function findPersona(id) {
    return getPersonaLibrary().find((persona) => persona.id === id) || null;
  }

  function getBayShell(slot) {
    return bayShells[slot] || createNativeShell();
  }

  function getVoiceState(slot) {
    const text = $(slot === 'A' ? 'voiceA' : 'voiceB').value;
    const rawProfile = extractCadenceProfile(text);
    const shell = getBayShell(slot);
    const effectiveText = applyCadenceToText(text, shell);
    const persona = shell.personaId ? findPersona(shell.personaId) : null;
    const effectiveProfile = extractCadenceProfile(effectiveText);

    return {
      slot,
      text,
      effectiveText,
      hasEffectiveTextShift: effectiveText !== text,
      hasText: !rawProfile.empty,
      rawProfile,
      effectiveProfile,
      persona,
      shell
    };
  }

  function profileTone(profile) {
    if (!profile || profile.empty) {
      return 'idle';
    }

    if (profile.recurrencePressure >= 0.58 || profile.punctuationDensity >= 0.18) {
      return 'live';
    }

    if (profile.recurrencePressure >= 0.32) {
      return 'warm';
    }

    return 'idle';
  }

  function describeCadenceShell(shell) {
    return `Cadence shell // ${shell.label}`;
  }

  function describeShellNote(voiceState) {
    if (voiceState.shell.mode === 'native') {
      return 'Native cadence only. No shell is bending the readout or the in-flight sample.';
    }

    if (voiceState.shell.mode === 'borrowed') {
      return `Borrowed from the ${SLOT_SHORT[voiceState.shell.fromSlot]} bay. The raw text stayed put, but the effective sample and cadence profile moved.`;
    }

    if (voiceState.shell.profile) {
      return `Profile shell transfer live at ${Math.round((voiceState.shell.strength || 0.76) * 100)}%. The raw text stays in the bay while the effective sample and cadence profile bend toward ${voiceState.shell.label}.`;
    }

    return `Applied shell bias: sent ${voiceState.shell.mod.sent >= 0 ? '+' : ''}${voiceState.shell.mod.sent}, cont ${voiceState.shell.mod.cont >= 0 ? '+' : ''}${voiceState.shell.mod.cont}, punc ${voiceState.shell.mod.punc >= 0 ? '+' : ''}${voiceState.shell.mod.punc}.`;
  }

  function previewEffectiveText(voiceState) {
    if (!voiceState.hasEffectiveTextShift) {
      return '';
    }

    const compact = voiceState.effectiveText.replace(/\s+/g, ' ').trim();
    if (!compact) {
      return '';
    }

    const preview = compact.length > 132 ? `${compact.slice(0, 132).trimEnd()}...` : compact;
    return `Effective sample // ${preview}`;
  }

  function renderVoiceProfile(voiceState) {
    const slotId = voiceState.slot === 'A' ? 'voiceAProfile' : 'voiceBProfile';
    const fieldId = voiceState.slot === 'A' ? 'voiceAField' : 'voiceBField';
    const panel = $(slotId);
    const field = $(fieldId);

    field.classList.toggle('active', activeVoice === voiceState.slot);
    panel.dataset.tone = profileTone(voiceState.effectiveProfile);
    panel.classList.toggle('active', activeVoice === voiceState.slot);

    if (!voiceState.hasText) {
      panel.innerHTML = `
        <div class="bay-shell-row">
          <span class="bay-shell">${activeVoice === voiceState.slot ? 'Active bay' : 'Cadence bay'}</span>
          <span class="bay-shell">${describeCadenceShell(voiceState.shell)}</span>
        </div>
        <p class="bay-copy">Paste a voice here to extract sentence rhythm, punctuation shape, contraction density, and recurrence pressure.</p>
      `;
      return;
    }

    const profile = voiceState.effectiveProfile;
    const shellNote = describeShellNote(voiceState);
    const effectivePreview = previewEffectiveText(voiceState);

    panel.innerHTML = `
      <div class="bay-shell-row">
        <span class="bay-shell">${activeVoice === voiceState.slot ? 'Active bay' : 'Cadence bay'}</span>
        <span class="bay-shell">${describeCadenceShell(voiceState.shell)}</span>
      </div>
      <div class="bay-metrics">
        <span class="bay-metric">Rhythm ${profile.avgSentenceLength.toFixed(1)}w</span>
        <span class="bay-metric">Punct ${formatPct(profile.punctuationDensity)}</span>
        <span class="bay-metric">Contractions ${formatPct(profile.contractionDensity)}</span>
        <span class="bay-metric">Recurrence ${formatPct(profile.recurrencePressure)}</span>
      </div>
      ${effectivePreview ? `<p class="bay-preview">${effectivePreview}</p>` : ''}
      <p class="bay-copy">${shellNote}</p>
    `;
  }

  function renderVoiceProfiles() {
    renderVoiceProfile(getVoiceState('A'));
    renderVoiceProfile(getVoiceState('B'));
  }

  function personaAssignmentLabel(personaId) {
    const slots = [];
    if (bayShells.A.personaId === personaId) {
      slots.push('Reference');
    }
    if (bayShells.B.personaId === personaId) {
      slots.push('Probe');
    }

    return slots.length ? slots.join(' + ') : 'Assign shell';
  }

  function renderPersonas() {
    $('personaDeck').innerHTML = getPersonaLibrary()
      .map((persona) => {
        const selected = bayShells[activeVoice].personaId === persona.id;
        const assigned = bayShells.A.personaId === persona.id || bayShells.B.personaId === persona.id;
        const source = persona.source === 'saved' ? 'captured in-app' : 'built-in attractor';

        return `
          <div class="persona ${selected ? 'selected' : ''} ${assigned ? 'assigned' : ''}" data-id="${persona.id}" role="button" tabindex="0" aria-pressed="${selected}">
            <div class="persona-top">
              <div>
                <div class="persona-kicker">${source}</div>
                <div class="name">${persona.name}</div>
              </div>
              <div class="persona-action">${personaAssignmentLabel(persona.id)}</div>
            </div>
            <div class="blurb">${persona.blurb}</div>
            <div class="chips">${persona.chips.map((chip) => `<span class="chip">${chip}</span>`).join('')}</div>
          </div>
        `;
      })
      .join('');

    $('personaStatus').textContent = `Active bay // ${SLOT_LABELS[activeVoice]} // ${bayShells[activeVoice].label}`;
    renderActiveBayStatus();
  }

  function setArtifactTab(tab) {
    const panes = ['play', 'readout', 'personas'];
    activeArtifactTab = panes.includes(tab) ? tab : 'play';

    panes.forEach((pane) => {
      const paneNode = $(`viewPane${pane.charAt(0).toUpperCase()}${pane.slice(1)}`);
      const tabNode = $(`tab${pane.charAt(0).toUpperCase()}${pane.slice(1)}`);
      const isActive = pane === activeArtifactTab;

      if (paneNode) {
        paneNode.hidden = !isActive;
        paneNode.classList.toggle('active', isActive);
      }

      if (tabNode) {
        tabNode.classList.toggle('active', isActive);
      }
    });

    document.body.dataset.artifactTab = activeArtifactTab;
  }

  function updateControls() {
    $('compareBtn').textContent = 'Analyze Cadences';
    $('swapCadencesBtn').textContent = 'Swap Cadences';
    $('savePersonaBtn').textContent = `Save Cadence as Persona // ${SLOT_SHORT[activeVoice]}`;
    $('toggleMirrorBtn').textContent = MIRROR_COPY[mirrorLogic].button;
    $('badgeBtn').textContent = `Cycle custody badge // ${BADGE_LABELS[badge] || badge}`;
    $('resetBtn').textContent = 'Reset bay';

    const voiceStateA = getVoiceState('A');
    const voiceStateB = getVoiceState('B');
    $('swapCadencesBtn').disabled = !(voiceStateA.hasText && voiceStateB.hasText);
    $('savePersonaBtn').disabled = !getVoiceState(activeVoice).hasText;
  }

  function updateStatePills(routeStatus, decision) {
    $('badgeState').textContent = `Badge // ${badgeMeaning(badge)}`;
    $('badgeState').classList.toggle('active', badge === 'badge.holds');
    $('mirrorState').textContent = MIRROR_COPY[mirrorLogic].pill;
    $('mirrorState').classList.toggle('active', mirrorLogic === 'off');
    $('containmentState').textContent = CONTAINMENT_COPY[containment].pill;
    $('containmentState').classList.toggle('active', containment === 'on');
    $('routeState').textContent = `Route // ${routeStatus}`;
    $('routeState').classList.toggle('warn', decision === 'criticality');
    $('routeState').classList.toggle('active', decision === 'passage');
  }

  function updateHeroConsolePair(payload) {
    const { cmp, routePressure, harbor, decision } = payload;

    $('heroSignalValue').textContent = formatPct(cmp.similarity);
    $('heroSignalNote').textContent =
      cmp.similarity >= 0.78
        ? 'Cadence is becoming legible across both samples.'
        : cmp.similarity >= 0.55
          ? 'Shared habits are surfacing without collapsing into certainty.'
          : 'The samples still feel socially distinct.';
    $('heroRouteValue').textContent = formatPct(routePressure);
    $('heroRouteNote').textContent =
      decision === 'criticality'
        ? 'Recognition is gathering faster than the field can route it.'
        : decision === 'passage'
          ? 'A structured harbor is available before exposure takes over.'
          : decision === 'hold-branch'
            ? 'Public play is staying exploratory while the route signal develops.'
          : 'The samples are still more atmospheric than traceable.';
    if (decision === 'weak-signal') {
      $('heroHarborValue').textContent = 'observe';
      $('heroHarborNote').textContent = 'No harbor is active. The deck is staying exploratory until recognition becomes legible enough to route.';
    } else {
      $('heroHarborValue').textContent = harbor;
      $('heroHarborNote').textContent = HARBOR_LIBRARY[harbor].mode_class;
    }
    $('decisionTone').textContent =
      decision === 'criticality'
        ? 'Route pressure rising'
        : decision === 'passage'
          ? 'Harbor available'
          : decision === 'hold-branch'
            ? 'Branch preserved'
            : 'Weak signal';
    $('decisionTone').dataset.state = decision;
    document.body.dataset.decision = decision;
  }

  function updateHeroConsoleSolo(voiceState) {
    $('heroSignalValue').textContent = 'SOLO';
    $('heroSignalNote').textContent = `Cadence captured from the ${SLOT_SHORT[voiceState.slot]} bay. Add a second voice to test contrast.`;
    $('heroRouteValue').textContent = formatPct(voiceState.effectiveProfile.recurrencePressure);
    $('heroRouteNote').textContent = 'Solo scans expose rhythm and recurrence, but route pressure needs a second voice.';
    $('heroHarborValue').textContent = voiceState.shell.mode === 'native' ? 'save.persona' : voiceState.shell.label;
    $('heroHarborNote').textContent =
      voiceState.shell.mode === 'native'
        ? 'You can save this cadence in-app or pair it with another voice.'
        : 'A cadence shell is already shaping this bay.';
    $('decisionTone').textContent = 'Solo capture';
    $('decisionTone').dataset.state = 'hold-branch';
    document.body.dataset.decision = 'hold-branch';
  }

  function resetMetricTones() {
    setMetricTone('similarityCard', 'idle');
    setMetricTone('traceabilityCard', 'idle');
    setMetricTone('routePressureCard', 'idle');
    setMetricTone('custodyCard', 'idle');
  }

  function updateHarborBox(harbor, ledger, decision) {
    if (decision === 'weak-signal') {
      $('harborBox').innerHTML = `
        <div class="harbor-head">
          <div>
            <div class="section-kicker">Exploratory posture</div>
            <div class="harbor-name">observe.field</div>
          </div>
          <div class="harbor-stat">no harbor engaged</div>
        </div>
        <div class="harbor-grid">
          <div class="harbor-item">
            <span class="harbor-label">State</span>
            <strong>weak-signal</strong>
          </div>
          <div class="harbor-item">
            <span class="harbor-label">Archive</span>
            <strong>${ledger.effective_archive}</strong>
          </div>
          <div class="harbor-item">
            <span class="harbor-label">Next move</span>
            <strong>add contrast or save solo</strong>
          </div>
        </div>
        <p class="kicker">Recognition has not crossed threshold. TCP keeps the field public, playful, and non-escalatory.</p>
      `;
      return;
    }

    const harborData = HARBOR_LIBRARY[harbor];
    const kicker = decision === 'criticality' ? microcopy.route_warning : microcopy.receipt_created;

    $('harborBox').innerHTML = `
      <div class="harbor-head">
        <div>
          <div class="section-kicker">Recommended harbor</div>
          <div class="harbor-name">${harbor}</div>
        </div>
        <div class="harbor-stat">${formatPct(harborData.provenance_retention)} provenance</div>
      </div>
      <div class="harbor-grid">
        <div class="harbor-item">
          <span class="harbor-label">Mode</span>
          <strong>${harborData.mode_class}</strong>
        </div>
        <div class="harbor-item">
          <span class="harbor-label">Archive</span>
          <strong>${ledger.effective_archive}</strong>
        </div>
        <div class="harbor-item">
          <span class="harbor-label">Reuse gain</span>
          <strong>${ledger.reuse_gain}</strong>
        </div>
      </div>
      <p class="kicker">${harborData.trigger_condition}. ${kicker}</p>
    `;
  }

  function updateHarborBoxSolo(voiceState) {
    $('harborBox').innerHTML = `
      <div class="harbor-head">
        <div>
          <div class="section-kicker">Solo capture</div>
          <div class="harbor-name">${voiceState.shell.mode === 'native' ? 'cadence capture' : voiceState.shell.label}</div>
        </div>
        <div class="harbor-stat">${formatPct(voiceState.effectiveProfile.recurrencePressure)} recurrence</div>
      </div>
      <div class="harbor-grid">
        <div class="harbor-item">
          <span class="harbor-label">Bay</span>
          <strong>${SLOT_LABELS[voiceState.slot]}</strong>
        </div>
        <div class="harbor-item">
          <span class="harbor-label">Shell</span>
          <strong>${voiceState.shell.label}</strong>
        </div>
        <div class="harbor-item">
          <span class="harbor-label">Next move</span>
          <strong>Save or pair</strong>
        </div>
      </div>
      <p class="kicker">A solo scan keeps the branch open. Save this cadence as a persona or bring in a second voice to test route, harbor, and custody.</p>
    `;
  }

  function renderIdleState() {
    setMetricKeys('pair');
    $('similarity').textContent = '--';
    $('traceability').textContent = '--';
    $('routePressure').textContent = '--';
    $('custodyState').textContent = '--';
    $('simHint').textContent = 'Paste at least one voice to start the field.';
    $('traceHint').textContent = '';
    $('routeHint').textContent = '';
    $('custodyHint').textContent = '';
    $('branchFormula').textContent = 'Delta_branch = stylometric surplus above lexical overlap.\nPair two voices to test whether the branch stays resolved or opens into candidate discovery.';
    $('waveFormula').textContent = 'Paste a voice to expose cadence metrics.\nPair two voices to compute resonance, density, and criticality.';
    $('harborFormula').textContent = 'Analyze one or two voices to surface custody drift, archive state, and reuse gain.';
    $('ledgerPreview').textContent = '{\n  "status": "idle"\n}';
    $('fieldNotice').textContent = 'Bring one or two voices into the field. Solo scans capture cadence. Paired scans test similarity, route pressure, and harbor.';
    $('heroSignalValue').textContent = '--';
    $('heroSignalNote').textContent = 'Paste voices to light the deck.';
    $('heroRouteValue').textContent = '--';
    $('heroRouteNote').textContent = 'TCP is idle until a scan runs.';
    $('heroHarborValue').textContent = '--';
    $('heroHarborNote').textContent = 'A harbor will appear once the field resolves.';
    $('decisionTone').textContent = 'Scanning';
    $('decisionTone').dataset.state = 'weak-signal';
    $('harborBox').innerHTML = '';
    updateStatePills('buffered', 'weak-signal');
    resetMetricTones();
    document.body.dataset.decision = 'weak-signal';
  }

  function renderSoloState(voiceState) {
    setMetricKeys('solo');
    $('similarity').textContent = 'SOLO';
    $('traceability').textContent = `${voiceState.effectiveProfile.avgSentenceLength.toFixed(1)}w`;
    $('routePressure').textContent = voiceState.effectiveProfile.recurrencePressure.toFixed(2);
    $('custodyState').textContent = SLOT_SHORT[voiceState.slot];
    $('simHint').textContent = 'A second voice unlocks cadence contrast. Solo mode captures a signature you can save in-app.';
    $('traceHint').textContent = 'Sentence rhythm shows how quickly clauses turn and settle.';
    $('routeHint').textContent = 'Recurrence pressure tracks punctuation, line-break drag, and repeated return-patterns.';
    $('custodyHint').textContent = 'The active bay is where persona assignment and save operations land.';
    $('branchFormula').textContent = 'Delta_branch needs two voices.\nSolo capture stays native to the active bay until a second sample exposes stylometric surplus.';
    $('waveFormula').textContent = `signature = {
  rhythm: ${voiceState.effectiveProfile.avgSentenceLength.toFixed(1)} words,
  punct: ${voiceState.effectiveProfile.punctuationDensity},
  cont: ${voiceState.effectiveProfile.contractionDensity},
  recurrence: ${voiceState.effectiveProfile.recurrencePressure}
}`;
    $('harborFormula').textContent = 'Pair a second voice to compute route pressure, custody drift, archive thresholds, and reuse gain.';
    $('ledgerPreview').textContent = JSON.stringify(
      {
        mode: 'solo-capture',
        active_bay: SLOT_SHORT[voiceState.slot],
        cadence_shell: voiceState.shell.label,
        rhythm_words: voiceState.effectiveProfile.avgSentenceLength,
        recurrence_pressure: voiceState.effectiveProfile.recurrencePressure
      },
      null,
      2
    );
    $('fieldNotice').textContent = `Solo capture is live in the ${SLOT_SHORT[voiceState.slot]} bay. Save the cadence as a persona or add a second voice to see whether resemblance can route into anything sturdier than afterimage.`;
    updateHeroConsoleSolo(voiceState);
    updateHarborBoxSolo(voiceState);
    updateStatePills('awaiting pair', 'hold-branch');
    setMetricTone('similarityCard', 'warm');
    setMetricTone('traceabilityCard', profileTone(voiceState.effectiveProfile));
    setMetricTone('routePressureCard', profileTone(voiceState.effectiveProfile));
    setMetricTone('custodyCard', 'live');
  }

  function renderPairState(voiceStateA, voiceStateB) {
    const cmp = compareTexts(voiceStateA.effectiveText, voiceStateB.effectiveText, {
      profileA: voiceStateA.effectiveProfile,
      profileB: voiceStateB.effectiveProfile
    });
    const coherence = cadenceCoherence(cmp);
    const resonance = cadenceResonance({
      similarity: cmp.similarity,
      traceability: cmp.traceability,
      coherence
    });
    const branch = branchDynamics({
      ...cmp,
      coherence
    });
    const routePressure = computeRoutePressure({
      similarity: cmp.similarity,
      traceability: cmp.traceability,
      recurrencePressure: cmp.recurrencePressure,
      branchPressure: branch.branchPressure,
      coherence,
      resonance
    });
    const field = fieldPotential({
      routePressure,
      resonance,
      coherence,
      branchPressure: branch.branchPressure,
      mirrorLogic,
      containment
    });
    const wave = waveStats({
      similarity: cmp.similarity,
      traceability: cmp.traceability,
      resonance,
      coherence,
      branchPressure: branch.branchPressure,
      recurrencePressure: cmp.recurrencePressure,
      fieldPotential: field
    });
    const routeAvailable = mirrorLogic === 'on' && routePressure >= 0.48;
    const criticality = criticalityIndex({
      density: wave.density,
      routePressure,
      branchPressure: branch.branchPressure,
      routeAvailable
    });
    const custody = custodyThreshold({
      routePressure,
      density: wave.density,
      branchPressure: branch.branchPressure,
      resonance,
      coherence,
      criticality,
      containment,
      mirrorLogic,
      badge,
      theta: 0.2
    });
    const recognized = resonance >= 0.54 || cmp.similarity >= 0.56;
    const explained = routePressure < 0.52 && branch.branchPressure < 0.42;
    const decision = providerDecision({
      recognized,
      explained,
      routeAvailable,
      density: wave.density,
      recurrencePressure: cmp.recurrencePressure
    });
    const harbor = chooseHarbor({
      routePressure,
      branchPressure: branch.branchPressure,
      criticality,
      badge,
      mirrorLogic,
      custodyArchive: custody.archive,
      decision,
      routeAvailable
    });
    const ledger = buildLedgerRow({
      eventId: `evt-${Date.now()}`,
      harborFunction: harbor,
      routePressure,
      traceability: cmp.traceability,
      branchPressure: branch.branchPressure,
      criticality,
      density: wave.density,
      routeAvailable,
      custodyArchive: custody.archive,
      decision
    });

    setMetricKeys('pair');
    $('similarity').textContent = cmp.similarity.toFixed(2);
    $('traceability').textContent = cmp.traceability.toFixed(2);
    $('routePressure').textContent = routePressure.toFixed(2);
    $('custodyState').textContent = ledger.effective_archive;
    $('simHint').textContent =
      cmp.similarity > 0.78
        ? microcopy.compare_hint
        : 'Similarity is present, but TCP still separates surface overlap from actual routing pressure.';
    $('traceHint').textContent =
      cmp.traceability > 0.7
        ? 'Cadence habits are surviving paraphrase, which makes authorship pressure more legible.'
        : 'Traceability is still diffuse, so the pattern remains mostly social surface.';
    $('routeHint').textContent =
      decision === 'criticality'
        ? microcopy.route_warning
        : decision === 'passage'
          ? microcopy.harbor_success
          : decision === 'hold-branch'
            ? 'Recognition is present, but the route layer is still deciding how much of it should travel.'
            : 'The resemblance is still too light for routing, so TCP keeps the interaction exploratory.';
    $('custodyHint').textContent =
      custody.archive === 'witness'
        ? 'The custody delta fell below the collapse threshold, so witness custody is functioning as the effective archive.'
        : 'Institutional custody remains above the collapse threshold and therefore continues to function as the effective archive.';
    $('branchFormula').textContent = `Delta_branch = 0.68 max(0, T - L) + 0.32 max(0, C_style - L) = ${branch.branchPressure}
x^2 - beta x + gamma = 0
beta = 1 + S + T = ${branch.beta}
gamma = 0.42 - Delta_branch = ${branch.gamma}
roots = ${branch.roots.join(', ') || 'complex'}
branch = ${branch.classification}`;
    $('waveFormula').textContent = `resonance = H(S, T, C_style) = ${resonance}
V = ${wave.V}
A = resonance = ${wave.amplitude}
k = 1 + 2.2R + 0.8Delta_branch = ${wave.k}
rho = A^2 (0.26 + 0.44V + 0.30C_style) = ${wave.density}
criticality = ${criticality}`;
    $('harborFormula').textContent = `C = ${custody.integrity}
D = ${custody.drift}
Delta_C = C - D = ${custody.delta}
theta = ${custody.theta}
A_effective = ${ledger.effective_archive}
E_solo = ${ledger.solo_cost}
E_harbor = ${ledger.shared_cost}
DeltaE = ${ledger.reuse_gain}`;
    $('ledgerPreview').textContent = JSON.stringify(ledger, null, 2);
    $('fieldNotice').textContent =
      decision === 'criticality'
        ? `${microcopy.criticality_warning} ${harbor} is the cleanest structured response while route pressure sits at ${routePressure.toFixed(2)}.`
        : decision === 'passage'
          ? `${microcopy.harbor_success} Exploratory play has resolved into a viable harbor with ${formatPct(HARBOR_LIBRARY[harbor].provenance_retention)} provenance retention.`
          : decision === 'hold-branch'
            ? `TCP is holding browser-side play in the exploratory lane. Similarity is ${cmp.similarity.toFixed(2)} and traceability is ${cmp.traceability.toFixed(2)}, so the deck stays curious without forcing a conclusion.`
            : `The pattern is still mostly social surface. Similarity is ${cmp.similarity.toFixed(2)} and traceability is ${cmp.traceability.toFixed(2)}, so TCP keeps the field playful instead of forcing route.`;
    updateHarborBox(harbor, ledger, decision);
    updateHeroConsolePair({ cmp, routePressure, harbor, decision });
    updateStatePills(ledger.route_status, decision);
    setMetricTone('similarityCard', cmp.similarity >= 0.78 ? 'live' : cmp.similarity >= 0.55 ? 'warm' : 'idle');
    setMetricTone('traceabilityCard', cmp.traceability >= 0.7 ? 'live' : cmp.traceability >= 0.45 ? 'warm' : 'idle');
    setMetricTone('routePressureCard', decision === 'criticality' ? 'hot' : decision === 'passage' ? 'live' : 'warm');
    setMetricTone('custodyCard', custody.archive === 'witness' ? 'hot' : 'live');
  }

  function analyzeCadences() {
    document.body.dataset.bootStage = 'analyze-enter';
    const voiceStateA = getVoiceState('A');
    const voiceStateB = getVoiceState('B');

    renderVoiceProfiles();

    if (!voiceStateA.hasText && !voiceStateB.hasText) {
      document.body.dataset.bootStage = 'analyze-idle';
      renderIdleState();
      setStatusMessage('Paste one or two voices, then press Analyze Cadences.');
      updateControls();
      renderPersonas();
      return;
    }

    if (!voiceStateA.hasText || !voiceStateB.hasText) {
      document.body.dataset.bootStage = 'analyze-solo';
      const soloState = voiceStateA.hasText ? voiceStateA : voiceStateB;
      renderSoloState(soloState);
      setStatusMessage(`Solo scan complete in the ${SLOT_SHORT[soloState.slot]} bay. Save it as a persona or add a second voice for contrast.`);
      updateControls();
      renderPersonas();
      return;
    }

    document.body.dataset.bootStage = 'analyze-pair';
    renderPairState(voiceStateA, voiceStateB);
    setStatusMessage('Paired cadence scan complete. Swap shells, save a persona, or tune the mirror and badge controls.');
    updateControls();
    renderPersonas();
    document.body.dataset.bootStage = 'analyze-complete';
  }

  function setActiveVoice(slot) {
    activeVoice = slot;
    renderVoiceProfiles();
    renderPersonas();
    updateControls();
  }

  function assignPersonaToActiveBay(id) {
    const persona = findPersona(id);
    if (!persona) {
      return;
    }

    bayShells[activeVoice] = createPersonaShell(persona);
    analyzeCadences();
    setStatusMessage(`${persona.name} is now shaping the ${SLOT_SHORT[activeVoice]} cadence shell. The text stayed put; only the cadence shell changed.`);
  }

  function swapCadences() {
    const voiceStateA = getVoiceState('A');
    const voiceStateB = getVoiceState('B');

    if (!voiceStateA.hasText || !voiceStateB.hasText) {
      setStatusMessage('Swap Cadences needs both bays populated. The shell can move, but it needs two live voices to trade between.');
      updateControls();
      return;
    }

    const shellA = bayShells.A.mode === 'native' ? createBorrowedShell(voiceStateA) : cloneShell(bayShells.A);
    const shellB = bayShells.B.mode === 'native' ? createBorrowedShell(voiceStateB) : cloneShell(bayShells.B);

    bayShells = {
      A: shellB,
      B: shellA
    };
    const beforeSnapshot = readDeckSnapshot();
    analyzeCadences();
    const afterSnapshot = readDeckSnapshot();
    setStatusMessage(`Cadence shells swapped. The raw text stayed put, but the effective samples and cadence profiles moved. Similarity ${beforeSnapshot.similarity} -> ${afterSnapshot.similarity}; route ${beforeSnapshot.routePressure} -> ${afterSnapshot.routePressure}.`);
  }

  function buildSavedPersonaName(slot) {
    const existing = savedPersonas.length + 1;
    return `Captured ${slot === 'A' ? 'Reference' : 'Probe'} ${existing}`;
  }

  function saveActiveCadence() {
    const voiceState = getVoiceState(activeVoice);
    if (!voiceState.hasText) {
      setStatusMessage(`The ${SLOT_SHORT[activeVoice]} bay is empty. Paste a voice there before saving a cadence.`);
      updateControls();
      return;
    }

    const profile = voiceState.effectiveProfile;
    const persona = {
      id: `saved-${Date.now()}`,
      name: buildSavedPersonaName(activeVoice),
      blurb: `Captured from the ${SLOT_SHORT[activeVoice]} bay. Rhythm ${profile.avgSentenceLength.toFixed(1)}w, recurrence ${formatPct(profile.recurrencePressure)}.`,
      chips: ['captured', SLOT_SHORT[activeVoice], `rhythm ${profile.avgSentenceLength.toFixed(1)}w`],
      mod: cadenceModFromProfile(profile),
      profile: { ...profile },
      strength: 0.76,
      source: 'saved'
    };

    savedPersonas = [persona, ...savedPersonas];
    persistSavedPersonas();
    bayShells[activeVoice] = createPersonaShell(persona);
    renderPersonas();
    updateControls();
    analyzeCadences();
    setStatusMessage(`${persona.name} was saved in-app and assigned to the ${SLOT_SHORT[activeVoice]} bay.`);
  }

  function resetDeck() {
    $('voiceA').value = defaults.voiceA;
    $('voiceB').value = defaults.voiceB;
    badge = defaults.badge;
    mirrorLogic = defaults.mirror_logic;
    containment = defaults.containment;
    bayShells = {
      A: createNativeShell(),
      B: createNativeShell()
    };
    activeVoice = 'A';
    renderVoiceProfiles();
    renderPersonas();
    analyzeCadences();
    setStatusMessage('Deck reset. Native cadences restored and the default pair is back in the field.');
  }

  function handleTextInput(slot) {
    const shell = bayShells[slot];
    const releasedBorrowedShell = shell && shell.mode === 'borrowed';
    if (releasedBorrowedShell) {
      bayShells[slot] = createNativeShell();
    }

    setActiveVoice(slot);
    renderVoiceProfiles();
    updateControls();
    setStatusMessage(
      releasedBorrowedShell
        ? `Text changed in the ${SLOT_SHORT[slot]} bay. The borrowed shell was released, so the new sample is back on native cadence until you swap or assign again.`
        : `Text changed in the ${SLOT_SHORT[slot]} bay. Press Analyze Cadences to refresh the pair readout.`
    );
  }

  function captureFlightState() {
    return {
      voiceA: $('voiceA').value,
      voiceB: $('voiceB').value,
      badge,
      mirrorLogic,
      containment,
      activeVoice,
      activeArtifactTab,
      bayShells: {
        A: cloneShell(bayShells.A),
        B: cloneShell(bayShells.B)
      },
      savedPersonas: JSON.parse(JSON.stringify(savedPersonas))
    };
  }

  function restoreFlightState(state) {
    $('voiceA').value = state.voiceA;
    $('voiceB').value = state.voiceB;
    badge = state.badge;
    mirrorLogic = state.mirrorLogic;
    containment = state.containment;
    activeVoice = state.activeVoice;
    activeArtifactTab = state.activeArtifactTab;
    bayShells = {
      A: cloneShell(state.bayShells.A),
      B: cloneShell(state.bayShells.B)
    };
    savedPersonas = JSON.parse(JSON.stringify(state.savedPersonas));
    persistSavedPersonas();
    setArtifactTab(activeArtifactTab);
    renderVoiceProfiles();
    renderPersonas();
    analyzeCadences();
  }

  function readDeckSnapshot() {
    return {
      decision: document.body.dataset.decision,
      decisionTone: $('decisionTone').textContent.trim(),
      similarity: $('similarity').textContent.trim(),
      traceability: $('traceability').textContent.trim(),
      routePressure: $('routePressure').textContent.trim(),
      custody: $('custodyState').textContent.trim(),
      heroHarbor: $('heroHarborValue').textContent.trim(),
      routeState: $('routeState').textContent.trim(),
      status: $('analysisStatus').textContent.trim()
    };
  }

  function applyScenario({
    voiceA,
    voiceB,
    nextBadgeState = 'badge.holds',
    nextMirrorLogic = 'off',
    nextContainment = 'on',
    nextShells = {
      A: createNativeShell(),
      B: createNativeShell()
    },
    nextActiveVoice = 'A'
  }) {
    $('voiceA').value = voiceA;
    $('voiceB').value = voiceB;
    badge = nextBadgeState;
    mirrorLogic = nextMirrorLogic;
    containment = nextContainment;
    bayShells = {
      A: cloneShell(nextShells.A),
      B: cloneShell(nextShells.B)
    };
    activeVoice = nextActiveVoice;
    renderVoiceProfiles();
    renderPersonas();
    analyzeCadences();
    return readDeckSnapshot();
  }

  function runTestFlight(mode = 'smoke') {
    const initialState = captureFlightState();
    const beforePersonaCount = document.querySelectorAll('.persona').length;
    const report = {
      mode,
      baseline: {
        snapshot: readDeckSnapshot(),
        personas: beforePersonaCount
      }
    };

    try {
      const beforeNativeSwap = readDeckSnapshot();
      $('swapCadencesBtn').click();
      report.nativeSwap = {
        snapshot: readDeckSnapshot(),
        changed:
          readDeckSnapshot().similarity !== beforeNativeSwap.similarity ||
          readDeckSnapshot().routePressure !== beforeNativeSwap.routePressure,
        referenceBorrowed: $('voiceAProfile').textContent.toLowerCase().includes('borrowed'),
        probeBorrowed: $('voiceBProfile').textContent.toLowerCase().includes('borrowed')
      };

      $('resetBtn').click();

      const firstPersona = document.querySelector('.persona');
      if (firstPersona) {
        firstPersona.click();
      }

      report.assignPersona = {
        snapshot: readDeckSnapshot(),
        personaStatus: $('personaStatus').textContent.trim()
      };

      const assignedLabelBeforeSwap = $('personaStatus').textContent.trim();
      const beforeA = $('voiceA').value;
      const beforeB = $('voiceB').value;
      $('swapCadencesBtn').click();
      report.swapCadences = {
        snapshot: readDeckSnapshot(),
        personaStatus: $('personaStatus').textContent.trim(),
        voiceAUnchanged: $('voiceA').value === beforeA,
        voiceBUnchanged: $('voiceB').value === beforeB,
        personaStatusChanged: $('personaStatus').textContent.trim() !== assignedLabelBeforeSwap
      };

      $('savePersonaBtn').click();
      report.savePersona = {
        snapshot: readDeckSnapshot(),
        personasAfterSave: document.querySelectorAll('.persona').length,
        savedPersonaAdded: document.querySelectorAll('.persona').length === beforePersonaCount + 1
      };

      $('voiceB').value = '';
      analyzeCadences();
      report.soloScan = {
        snapshot: readDeckSnapshot(),
        similarityKey: $('similarityKey').textContent.trim(),
        routeKey: $('routeKey').textContent.trim()
      };

      $('tabReadout').click();
      report.viewTabs = {
        activeTab: document.body.dataset.artifactTab,
        playHidden: $('viewPanePlay').hidden,
        readoutHidden: $('viewPaneReadout').hidden,
        personasHidden: $('viewPanePersonas').hidden
      };

      if (mode === 'full') {
        const matrix = [];
        const scenarios = [
          {
            id: 'weak_signal_contrast',
            expectedDecision: 'weak-signal',
            expectedRouteState: 'Route // observing',
            expectedHeroHarbor: 'observe',
            rationale: 'Two visibly different cadences should remain exploratory.',
            config: {
              voiceA: defaults.voiceA,
              voiceB: defaults.voiceB,
              nextMirrorLogic: 'off',
              nextBadgeState: 'badge.holds'
            }
          },
          {
            id: 'hold_branch_same_lexicon_split_form',
            expectedDecision: 'hold-branch',
            expectedRouteState: 'Route // buffered',
            rationale: 'Shared lexicon with mismatched sentence-shape should preserve the branch without opening passage.',
            config: {
              voiceA: 'I keep the record intact, because the room moves faster than memory, and if the handoff slips I mark the pressure, keep the receipt, and carry the line until the route is real.',
              voiceB: 'I keep the record intact. The room moves faster than memory. If the handoff slips, I mark the pressure. I keep the receipt. I carry the line until the route is real.',
              nextMirrorLogic: 'off',
              nextBadgeState: 'badge.holds'
            }
          },
          {
            id: 'exact_identity_native',
            expectedSimilarity: '1.00',
            expectedTraceability: '1.00',
            rationale: 'An exact native text match should read as full identity before any route logic is applied.',
            config: {
              voiceA: 'Need the charger. Front door sticks. Knock twice if the light is out. I am in back.',
              voiceB: 'Need the charger. Front door sticks. Knock twice if the light is out. I am in back.',
              nextMirrorLogic: 'off',
              nextBadgeState: 'badge.holds'
            }
          },
          {
            id: 'criticality_dense_locked',
            expectedDecision: 'criticality',
            expectedRouteState: 'Route // buffered',
            expectedHeroHarbor: 'mirror.off',
            rationale: 'Dense recognition with the mirror shield armed should surface criticality rather than fake passage.',
            config: {
              voiceA: "I cut the line fast.\nI keep the pressure live.\nI cut the line fast.\nIf it drags, I cut it. If it lands, I keep it.",
              voiceB: "I cut the line hard.\nI keep the pressure live.\nI cut the line hard.\nIf it drags, I cut it. If it lands, I keep it.",
              nextMirrorLogic: 'off',
              nextBadgeState: 'badge.holds'
            }
          },
          {
            id: 'passage_dense_open',
            expectedDecision: 'passage',
            expectedRouteState: 'Route // safe-passage achieved',
            expectedHeroHarbor: 'receipt.capture',
            rationale: 'The same dense recognition event should resolve into passage once the route is opened.',
            config: {
              voiceA: "I cut the line fast.\nI keep the pressure live.\nI cut the line fast.\nIf it drags, I cut it. If it lands, I keep it.",
              voiceB: "I cut the line hard.\nI keep the pressure live.\nI cut the line hard.\nIf it drags, I cut it. If it lands, I keep it.",
              nextMirrorLogic: 'on',
              nextBadgeState: 'badge.holds'
            }
          }
        ];

        scenarios.forEach((scenario) => {
          const snapshot = applyScenario(scenario.config);
          matrix.push({
            id: scenario.id,
            expectedDecision: scenario.expectedDecision,
            expectedRouteState: scenario.expectedRouteState,
            expectedHeroHarbor: scenario.expectedHeroHarbor,
            expectedSimilarity: scenario.expectedSimilarity,
            expectedTraceability: scenario.expectedTraceability,
            actualDecision: snapshot.decision,
            pass:
              (!scenario.expectedDecision || snapshot.decision === scenario.expectedDecision) &&
              (!scenario.expectedRouteState || snapshot.routeState === scenario.expectedRouteState) &&
              (!scenario.expectedHeroHarbor || snapshot.heroHarbor === scenario.expectedHeroHarbor) &&
              (!scenario.expectedSimilarity || snapshot.similarity === scenario.expectedSimilarity) &&
              (!scenario.expectedTraceability || snapshot.traceability === scenario.expectedTraceability),
            rationale: scenario.rationale,
            snapshot
          });
        });

        report.matrix = matrix;
        report.summary = {
          allPassed: matrix.every((entry) => entry.pass) &&
            report.swapCadences.voiceAUnchanged &&
            report.swapCadences.voiceBUnchanged &&
            report.savePersona.savedPersonaAdded &&
            report.nativeSwap.changed &&
            report.nativeSwap.referenceBorrowed &&
            report.nativeSwap.probeBorrowed &&
            report.soloScan.similarityKey === 'Scan mode' &&
            report.viewTabs.activeTab === 'readout',
          matrixPassCount: matrix.filter((entry) => entry.pass).length,
          matrixCount: matrix.length
        };
      }
    } finally {
      restoreFlightState(initialState);
    }

    let node = document.getElementById('testFlightReport');
    if (!node) {
      node = document.createElement('pre');
      node.id = 'testFlightReport';
      node.className = 'formula';
      document.body.appendChild(node);
    }

    node.textContent = JSON.stringify(report, null, 2);
  }

  $('compareBtn').addEventListener('click', analyzeCadences);
  $('swapCadencesBtn').addEventListener('click', swapCadences);
  $('savePersonaBtn').addEventListener('click', saveActiveCadence);
  $('toggleMirrorBtn').addEventListener('click', () => {
    mirrorLogic = mirrorLogic === 'off' ? 'on' : 'off';
    analyzeCadences();
  });
  $('badgeBtn').addEventListener('click', () => {
    badge = nextBadge(badge);
    analyzeCadences();
  });
  $('resetBtn').addEventListener('click', resetDeck);
  $('voiceA').addEventListener('focus', () => setActiveVoice('A'));
  $('voiceB').addEventListener('focus', () => setActiveVoice('B'));
  $('voiceA').addEventListener('input', () => handleTextInput('A'));
  $('voiceB').addEventListener('input', () => handleTextInput('B'));
  $('tabPlay').addEventListener('click', () => setArtifactTab('play'));
  $('tabReadout').addEventListener('click', () => setArtifactTab('readout'));
  $('tabPersonas').addEventListener('click', () => setArtifactTab('personas'));

  document.addEventListener('click', (event) => {
    const persona = event.target.closest('.persona');
    if (!persona) {
      return;
    }

    assignPersonaToActiveBay(persona.dataset.id);
  });

  document.addEventListener('keydown', (event) => {
    const persona = event.target.closest('.persona');
    if (!persona || (event.key !== 'Enter' && event.key !== ' ')) {
      return;
    }

    event.preventDefault();
    assignPersonaToActiveBay(persona.dataset.id);
  });

  function boot() {
    document.body.dataset.bootStage = 'boot-start';
    setArtifactTab(activeArtifactTab);
    renderVoiceProfiles();
    document.body.dataset.bootStage = 'boot-rendered-profiles';
    renderPersonas();
    document.body.dataset.bootStage = 'boot-rendered-personas';
    renderIdleState();
    document.body.dataset.bootStage = 'boot-idle';
    setStatusMessage('Press Analyze Cadences to run a solo capture or compare both bays at once.');
    updateControls();
    document.body.dataset.bootStage = 'boot-ready';
    analyzeCadences();
    document.body.dataset.bootStage = 'boot-complete';
  }

  window.addEventListener('error', (event) => {
    const message = event.error && event.error.message ? event.error.message : event.message;
    const status = $('analysisStatus');
    if (status && message) {
      status.textContent = `Startup fault // ${message}`;
    }
    document.body.dataset.bootStage = 'boot-error';
    if (message) {
      document.body.dataset.bootError = message.replace(/[^a-z0-9.\-_/ ]/gi, '').slice(0, 120);
    }
  });

  try {
    boot();
  } catch (error) {
    const status = $('analysisStatus');
    if (status) {
      status.textContent = `Startup fault // ${error.message}`;
    }
    document.body.dataset.bootStage = 'boot-error';
    document.body.dataset.bootError = (error.message || 'unknown-error')
      .replace(/[^a-z0-9.\-_/ ]/gi, '')
      .slice(0, 120);
  }

  const testFlightMode = new URLSearchParams(window.location.search).get('test-flight');
  if (testFlightMode === '1') {
    window.setTimeout(() => runTestFlight('smoke'), 120);
  }

  if (testFlightMode === '2') {
    window.setTimeout(() => runTestFlight('full'), 120);
  }
})();
