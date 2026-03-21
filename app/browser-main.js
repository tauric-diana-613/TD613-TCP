(function () {
  const { defaults, basePersonas, microcopy } = window.TCP_DATA;
  const {
    HARBOR_LIBRARY,
    compareTexts,
    extractCadenceProfile,
    buildCadenceTransfer,
    buildCadenceSignature,
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
  const queryParams = new URLSearchParams(window.location.search);
  const testFlightMode = queryParams.get('test-flight');
  const ingressFlightMode = testFlightMode === 'ingress';
  const ingressMirrorOverride = queryParams.get('ingress-mirror');
  const ingressBadgeOverride = queryParams.get('ingress-badge');
  const ingressEnabled = (ingressFlightMode || !testFlightMode) && queryParams.get('ingress') !== 'off';
  const INGRESS_REVEAL_MS = 1500;
  const INGRESS_BOOT_MS = 680;
  const INGRESS_HOLD_MS = {
    containment: 1200
  };
  const INGRESS_HOLD_GRACE_RATIO = 0.9;
  const INGRESS_SEAL_SEQUENCE = ['ul', 'ur', 'bc'];
  const INGRESS_MIRROR_OPTIONS = {
    off: {
      value: 'off',
      label: 'armed',
      cue: 'route latent',
      glyph: '\u25EB'
    },
    on: {
      value: 'on',
      label: 'open',
      cue: 'route clear',
      glyph: '\u25E7'
    }
  };
  const INGRESS_BADGE_OPTIONS = [
    { value: 'badge.holds', label: 'holds', cue: 'custody holds', glyph: '\u27C1' },
    { value: 'badge.buffer', label: 'buffer', cue: 'custody buffer', glyph: '\u2B12' },
    { value: 'badge.branch', label: 'branch', cue: 'candidate branch', glyph: '\u27C9' }
  ];
  const INGRESS_STAGES = ['containment', 'mirror', 'badge', 'seal'];

  function resolveIngressMirrorTarget(value) {
    return Object.prototype.hasOwnProperty.call(INGRESS_MIRROR_OPTIONS, value) ? value : null;
  }

  function resolveIngressBadgeTarget(value) {
    return INGRESS_BADGE_OPTIONS.some((option) => option.value === value) ? value : null;
  }

  let badge = defaults.badge;
  let mirrorLogic = defaults.mirror_logic;
  let containment = defaults.containment;
  let activeVoice = 'A';
  let activeArtifactTab = 'play';
  let analysisRevealed = false;
  let shellDuelPulseTimer = null;
  let swapButtonPulseTimer = null;
  let statusCueTimer = null;
  let bayShells = {
    A: createNativeShell(),
    B: createNativeShell()
  };
  let savedPersonas = loadSavedPersonas();
  let ingress = createIngressState();

  $('heroLead').textContent = microcopy.hero_lead;
  $('voiceA').value = defaults.voiceA;
  $('voiceB').value = defaults.voiceB;

  function formatPct(value) {
    return `${Math.round(value * 100)}%`;
  }

  function formatFixed(value, digits = 2) {
    return Number.isFinite(value) ? value.toFixed(digits) : '--';
  }

  function escapeHtml(value = '') {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function randomChoice(list = []) {
    return list[Math.floor(Math.random() * list.length)];
  }

  function createIngressState() {
    const targetMirror = resolveIngressMirrorTarget(ingressMirrorOverride) || randomChoice(['off', 'on']);
    const targetBadge = resolveIngressBadgeTarget(ingressBadgeOverride) || randomChoice(INGRESS_BADGE_OPTIONS.map((option) => option.value));
    return {
      enabled: ingressEnabled,
      phase: ingressEnabled ? 'booting' : 'complete',
      holding: null,
      holdStartedAt: 0,
      holdPointerId: null,
      currentMirror: null,
      currentBadge: null,
      resolvingGate: null,
      mirrorFeedback: null,
      badgeFeedback: null,
      sealSequenceIndex: 0,
      sealRejectedNode: null,
      holdTimer: null,
      bootTimer: null,
      revealTimer: null,
      feedbackTimer: null,
      target: {
        containment: 'on',
        mirrorLogic: targetMirror,
        badge: targetBadge
      }
    };
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
    const base = $('analysisStatusBase');
    const cue = $('analysisStatusCue');
    const actionCue = $('swapActionCue');
    const swapButton = $('swapCadencesBtn');
    if (base) {
      base.textContent = message;
    } else {
      $('analysisStatus').textContent = message;
    }
    if (cue) {
      cue.hidden = true;
      cue.textContent = '';
    }
    if (actionCue) {
      actionCue.hidden = true;
      actionCue.textContent = '';
    }
    if (swapButton) {
      swapButton.dataset.pulse = 'off';
    }
  }

  function clearStatusCueTimer() {
    if (statusCueTimer) {
      window.clearTimeout(statusCueTimer);
      statusCueTimer = null;
    }
  }

  function pulseShellDuel() {
    const duel = $('shellDuel');
    if (!duel) {
      return;
    }

    if (shellDuelPulseTimer) {
      window.clearTimeout(shellDuelPulseTimer);
    }

    duel.dataset.pulse = 'on';
    shellDuelPulseTimer = window.setTimeout(() => {
      duel.dataset.pulse = 'off';
      shellDuelPulseTimer = null;
    }, 1400);
  }

  function pulseSwapCadenceButton() {
    const button = $('swapCadencesBtn');
    if (!button) {
      return;
    }

    if (swapButtonPulseTimer) {
      window.clearTimeout(swapButtonPulseTimer);
    }

    button.dataset.pulse = 'on';
    swapButtonPulseTimer = window.setTimeout(() => {
      button.dataset.pulse = 'off';
      swapButtonPulseTimer = null;
    }, 1100);
  }

  /* legacy swap cue helpers removed */

  function setAnalysisRevealState(revealed) {
    analysisRevealed = revealed;
    document.body.dataset.analysisRevealed = revealed ? 'true' : 'false';
  }

  function renderActiveBayStatus() {
    $('activeBayStatus').textContent = `Active bay // ${SLOT_LABELS[activeVoice].toLowerCase()}`;
  }

  function setSwapStatusMessage(baseMessage) {
    clearStatusCueTimer();
    setStatusMessage(baseMessage);
    const cue = $('swapActionCue');
    if (cue) {
      cue.textContent = '\u2193 Shell Duel below';
      cue.hidden = false;
    }
    pulseSwapCadenceButton();
    pulseShellDuel();
    statusCueTimer = window.setTimeout(() => {
      if (cue) {
        cue.hidden = true;
        cue.textContent = '';
      }
      statusCueTimer = null;
    }, 4500);
  }

  function ingressMirrorOption(value) {
    return INGRESS_MIRROR_OPTIONS[value] || INGRESS_MIRROR_OPTIONS.off;
  }

  function ingressBadgeOption(value) {
    return INGRESS_BADGE_OPTIONS.find((option) => option.value === value) || INGRESS_BADGE_OPTIONS[0];
  }

  function clearIngressHold() {
    if (ingress.holdTimer) {
      window.clearTimeout(ingress.holdTimer);
      ingress.holdTimer = null;
    }

    const core = $('ingressCore');
    if (core && ingress.holdPointerId != null) {
      try {
        if (core.hasPointerCapture && core.hasPointerCapture(ingress.holdPointerId)) {
          core.releasePointerCapture(ingress.holdPointerId);
        }
      } catch {
        // pointer capture can be unavailable during teardown
      }
    }

    ingress.holding = null;
    ingress.holdStartedAt = 0;
    ingress.holdPointerId = null;
    const bar = $('ingressProgressBar');
    if (bar) {
      bar.style.animation = 'none';
      bar.offsetWidth;
      bar.style.animation = '';
    }
  }

  function clearIngressSealSequence() {
    ingress.sealSequenceIndex = 0;
    ingress.sealRejectedNode = null;
  }

  function chooseIngressSealNode(nodeId) {
    if (ingress.phase !== 'seal' || ingress.resolvingGate === 'seal') {
      return;
    }

    const expectedNode = INGRESS_SEAL_SEQUENCE[ingress.sealSequenceIndex];
    if (nodeId !== expectedNode) {
      ingress.resolvingGate = 'seal';
      ingress.sealRejectedNode = nodeId;
      renderIngress();
      scheduleIngressFeedbackClear('seal', 440);
      return;
    }

    ingress.sealRejectedNode = null;
    ingress.sealSequenceIndex += 1;

    if (ingress.sealSequenceIndex >= INGRESS_SEAL_SEQUENCE.length) {
      finalizeIngress();
      return;
    }

    renderIngress();
  }

  function handleIngressCorePointerDown(event) {
    if (ingress.phase === 'seal') {
      return;
    }

    beginIngressHold(event);
  }

  function handleIngressCorePointerMove() {}

  function handleIngressCorePointerUp(event) {
    if (ingress.phase === 'seal') {
      return;
    }

    cancelIngressHold(event);
  }

  function handleIngressCorePointerCancel(event) {
    if (ingress.phase === 'seal') {
      return;
    }

    cancelIngressHold(event);
  }

  function clearIngressFeedback() {
    if (ingress.feedbackTimer) {
      window.clearTimeout(ingress.feedbackTimer);
      ingress.feedbackTimer = null;
    }

    ingress.resolvingGate = null;
    ingress.mirrorFeedback = null;
    ingress.badgeFeedback = null;
    ingress.sealRejectedNode = null;
  }

  function scheduleIngressFeedbackClear(gate, delay = 320) {
    if (ingress.feedbackTimer) {
      window.clearTimeout(ingress.feedbackTimer);
    }

    ingress.feedbackTimer = window.setTimeout(() => {
      if (gate === 'mirror' && ingress.phase === 'mirror') {
        ingress.mirrorFeedback = null;
      }

      if (gate === 'badge' && ingress.phase === 'badge') {
        ingress.badgeFeedback = null;
      }

      if (gate === 'seal' && ingress.phase === 'seal') {
        ingress.sealRejectedNode = null;
      }

      if (ingress.resolvingGate === gate) {
        ingress.resolvingGate = null;
      }

      ingress.feedbackTimer = null;
      renderIngress();
    }, delay);
  }

  function clearIngressTimers() {
    clearIngressHold();
    clearIngressSealSequence();
    clearIngressFeedback();

    if (ingress.bootTimer) {
      window.clearTimeout(ingress.bootTimer);
      ingress.bootTimer = null;
    }

    if (ingress.revealTimer) {
      window.clearTimeout(ingress.revealTimer);
      ingress.revealTimer = null;
    }
  }

  function setIngressStageChip(id, state) {
    const node = $(id);
    if (node) {
      node.dataset.state = state;
    }
  }

  function updateIngressStageRail() {
    const phaseIndex = INGRESS_STAGES.indexOf(ingress.phase);
    INGRESS_STAGES.forEach((stage, index) => {
      let state = 'pending';
      if (ingress.phase === 'revealing' || ingress.phase === 'complete') {
        state = 'complete';
      } else if (phaseIndex === index) {
        state = 'active';
      } else if (phaseIndex > index) {
        state = 'complete';
      }

      setIngressStageChip(`ingressStage${stage.charAt(0).toUpperCase()}${stage.slice(1)}`, state);
    });
  }

  function setIngressBodyState() {
    document.body.dataset.ingressPhase = ingress.phase;
    document.body.dataset.ingressLocked = ingress.phase === 'complete' ? 'false' : 'true';
    document.body.dataset.ingressHolding = ingress.holding || 'none';
    document.body.dataset.ingressResolving = ingress.resolvingGate || 'none';
    document.body.dataset.ingressTargetMirror = ingress.target.mirrorLogic;
    document.body.dataset.ingressTargetBadge = ingress.target.badge;
  }

  function renderIngress() {
    const overlay = $('ingressMembrane');
    const shell = document.querySelector('.shell');
    if (!overlay) {
      return;
    }

    setIngressBodyState();
    overlay.hidden = ingress.phase === 'complete';
    overlay.dataset.phase = ingress.phase;
    overlay.dataset.holding = ingress.holding || 'none';
    overlay.dataset.resolving = ingress.resolvingGate || 'none';
    overlay.dataset.targetMirror = ingress.target.mirrorLogic;
    overlay.dataset.targetBadge = ingress.target.badge;
    overlay.dataset.currentMirror = ingress.currentMirror || 'unset';
    overlay.dataset.currentBadge = ingress.currentBadge || 'unset';
    if (shell) {
      shell.inert = ingress.phase !== 'complete';
      shell.setAttribute('aria-hidden', ingress.phase === 'complete' ? 'false' : 'true');
    }
    updateIngressStageRail();

    const mirrorTarget = ingressMirrorOption(ingress.target.mirrorLogic);
    const badgeTarget = ingressBadgeOption(ingress.target.badge);
    const currentBadge = ingress.currentBadge ? ingressBadgeOption(ingress.currentBadge) : null;
    const currentMirror = ingress.currentMirror ? ingressMirrorOption(ingress.currentMirror) : null;

    let phaseLabel = 'Protocol // membrane waking';
    let cueGlyph = '\u25CC';
    let cueLabel = 'custody handshake unresolved';
    let cueCopy = 'Four gates. One valid posture.';
    let status = 'Wait for the first demand.';
    let coreLabel = 'Stand by';
    let coreGlyph = '\u27D0';
    let coreEnabled = false;
    const sealTrack = $('ingressSealTrack');
    const sealNodeWrap = $('ingressSealNodes');
    const sealNodes = [
      { id: 'ul', node: $('ingressSealNodeUl') },
      { id: 'ur', node: $('ingressSealNodeUr') },
      { id: 'bc', node: $('ingressSealNodeBc') }
    ];
    const sealLinks = [$('ingressSealLink1'), $('ingressSealLink2'), $('ingressSealLink3')];

    $('ingressMirrorControls').hidden = true;
    $('ingressBadgeControls').hidden = true;
    $('ingressBadgeReadout').textContent = `token // ${currentBadge ? currentBadge.label : 'unset'}`;
    if (sealTrack) {
      sealTrack.dataset.active = ingress.phase === 'seal' ? 'true' : 'false';
      sealTrack.dataset.step = String(ingress.sealSequenceIndex || 0);
    }
    if (sealNodeWrap) {
      sealNodeWrap.hidden = ingress.phase !== 'seal';
    }

    if (ingress.phase === 'containment') {
      phaseLabel = 'Gate // containment';
      cueGlyph = '\u25CE';
      cueLabel = 'collapse the ring stack';
      cueCopy = 'The field admits only stable contact.';
      status = ingress.holding === 'containment'
        ? 'Do not break contact.'
        : 'Unbroken contact resolves the gate.';
      coreLabel = 'stabilize';
      coreGlyph = '\u25CE';
      coreEnabled = true;
    } else if (ingress.phase === 'mirror') {
      phaseLabel = 'Gate // mirror';
      cueGlyph = mirrorTarget.glyph;
      cueLabel = mirrorTarget.cue;
      cueCopy = 'One posture keeps the route latent. One clears it.';
      status = !ingress.currentMirror
        ? 'Choose the posture that satisfies the cue.'
        : ingress.currentMirror === ingress.target.mirrorLogic
          ? 'Mirror posture accepted.'
          : 'The membrane rejects that posture.';
      coreLabel = currentMirror ? currentMirror.cue : 'unresolved';
      coreGlyph = currentMirror ? currentMirror.glyph : mirrorTarget.glyph;
      $('ingressMirrorControls').hidden = false;
    } else if (ingress.phase === 'badge') {
      phaseLabel = 'Gate // token';
      cueGlyph = badgeTarget.glyph;
      cueLabel = badgeTarget.cue;
      cueCopy = 'Advance the token until the mark holds.';
      status = !ingress.currentBadge
        ? 'Rotate the token until the cue resolves.'
        : ingress.currentBadge === ingress.target.badge
          ? 'Token accepted. Seal is now listening.'
          : 'The field does not accept that mark.';
      coreLabel = currentBadge ? currentBadge.label : 'token unset';
      coreGlyph = currentBadge ? currentBadge.glyph : badgeTarget.glyph;
      $('ingressBadgeControls').hidden = false;
    } else if (ingress.phase === 'seal') {
      phaseLabel = 'Gate // seal';
      cueGlyph = '\u27D0';
      cueLabel = 'close the triad';
      cueCopy = `Resolved posture: ${mirrorTarget.cue} / ${badgeTarget.label} / containment stable. Seal the three points in clockwise order.`;
      status = ingress.sealRejectedNode
        ? 'That point does not close the triad. Touch the live point.'
        : 'Touch the next live point.';
      coreLabel = 'triad live';
      coreGlyph = '\u27D0';
      coreEnabled = false;
    } else if (ingress.phase === 'revealing') {
      phaseLabel = 'Reveal // handoff';
      cueGlyph = '\u2B21';
      cueLabel = 'membrane dissolving';
      cueCopy = 'The solved posture is crossing into the live deck.';
      status = 'Route handoff in progress.';
      coreLabel = 'opening';
      coreGlyph = '\u2B21';
    }

    $('ingressPhaseLabel').innerHTML = `<span class="glyph glyph-cyan" aria-hidden="true">\u27D2</span> ${phaseLabel}`;
    $('ingressCueGlyph').textContent = cueGlyph;
    $('ingressCueLabel').textContent = cueLabel;
    $('ingressCueCopy').textContent = cueCopy;
    $('ingressStatus').textContent = status;
    $('ingressCoreLabel').textContent = coreLabel;
    $('ingressCoreGlyph').textContent = coreGlyph;
    $('ingressCore').disabled = !coreEnabled;

    $('ingressMirrorArmed').dataset.selected = ingress.currentMirror === 'off';
    $('ingressMirrorOpen').dataset.selected = ingress.currentMirror === 'on';
    $('ingressMirrorArmed').dataset.feedback = ingress.currentMirror === 'off' ? (ingress.mirrorFeedback || 'idle') : 'idle';
    $('ingressMirrorOpen').dataset.feedback = ingress.currentMirror === 'on' ? (ingress.mirrorFeedback || 'idle') : 'idle';
    $('ingressMirrorArmed').disabled = ingress.phase !== 'mirror' || ingress.resolvingGate === 'mirror';
    $('ingressMirrorOpen').disabled = ingress.phase !== 'mirror' || ingress.resolvingGate === 'mirror';
    $('ingressBadgeCycle').dataset.ready = ingress.currentBadge === ingress.target.badge;
    $('ingressBadgeCycle').dataset.feedback = ingress.badgeFeedback || 'idle';
    $('ingressBadgeCycle').disabled = ingress.phase !== 'badge' || ingress.resolvingGate === 'badge';
    $('ingressBadgeReadout').dataset.feedback = ingress.badgeFeedback || 'idle';
    sealNodes.forEach(({ id, node }, index) => {
      if (!node) {
        return;
      }

      let state = 'pending';
      if (ingress.phase === 'seal') {
        if (ingress.sealRejectedNode === id) {
          state = 'rejected';
        } else if (index < ingress.sealSequenceIndex) {
          state = 'complete';
        } else if (index === ingress.sealSequenceIndex) {
          state = 'active';
        }
      }

      node.dataset.state = state;
      node.disabled = ingress.phase !== 'seal' || ingress.resolvingGate === 'seal';
    });
    sealLinks.forEach((link, index) => {
      if (!link) {
        return;
      }

      let state = 'pending';
      if (ingress.phase === 'seal') {
        if (index === 0 && ingress.sealSequenceIndex >= 2) {
          state = 'complete';
        } else if (index > 0 && ingress.sealSequenceIndex >= 3) {
          state = 'complete';
        }
      }

      link.dataset.state = state;
    });

  }

  function setIngressPhase(phase) {
    ingress.phase = phase;
    clearIngressHold();
    clearIngressSealSequence();
    clearIngressFeedback();
    renderIngress();
  }

  function startIngressSequence() {
    if (!ingress.enabled || ingress.phase !== 'booting') {
      renderIngress();
      return;
    }

    renderIngress();
    ingress.bootTimer = window.setTimeout(() => {
      setIngressPhase('containment');
    }, INGRESS_BOOT_MS);
  }

  function applyIngressPreset(preset) {
    badge = preset.badge;
    mirrorLogic = preset.mirrorLogic;
    containment = preset.containment;
  }

  function finalizeIngress() {
    clearIngressTimers();

    const preset = {
      badge: ingress.target.badge,
      mirrorLogic: ingress.target.mirrorLogic,
      containment: 'on'
    };

    applyIngressPreset(preset);
    analyzeCadences();

    ingress.phase = 'revealing';
    renderIngress();

    ingress.revealTimer = window.setTimeout(() => {
      ingress.enabled = false;
      ingress.phase = 'complete';
      renderIngress();
    }, INGRESS_REVEAL_MS);
  }

  function completeIngressHold(phase) {
    if (ingress.phase !== phase || ingress.holding !== phase) {
      return;
    }

    clearIngressHold();

    if (phase === 'containment') {
      setIngressPhase('mirror');
    }
  }

  function beginIngressHold(event) {
    const duration = INGRESS_HOLD_MS[ingress.phase];
    if (!duration || ingress.holding || ingress.phase === 'complete') {
      return;
    }

    if (event) {
      event.preventDefault();
    }

    ingress.holding = ingress.phase;
    ingress.holdStartedAt = window.performance && typeof window.performance.now === 'function'
      ? window.performance.now()
      : Date.now();
    ingress.holdPointerId = event && typeof event.pointerId === 'number' ? event.pointerId : null;
    if (event && event.currentTarget && typeof event.currentTarget.setPointerCapture === 'function' && ingress.holdPointerId != null) {
      try {
        event.currentTarget.setPointerCapture(ingress.holdPointerId);
      } catch {
        // capture can fail on unsupported platforms; hold still works
      }
    }
    const bar = $('ingressProgressBar');
    if (bar) {
      bar.style.animation = 'none';
      bar.offsetWidth;
      bar.style.animation = `ingress-progress ${duration}ms linear forwards`;
    }
    renderIngress();
    ingress.holdTimer = window.setTimeout(() => completeIngressHold(ingress.phase), duration);
  }

  function cancelIngressHold(event) {
    if (!ingress.holding) {
      return;
    }

    if (event) {
      event.preventDefault();
    }

    const phase = ingress.holding;
    const duration = INGRESS_HOLD_MS[phase];
    const now = window.performance && typeof window.performance.now === 'function'
      ? window.performance.now()
      : Date.now();
    const elapsed = ingress.holdStartedAt ? now - ingress.holdStartedAt : 0;
    if (duration && elapsed >= duration * INGRESS_HOLD_GRACE_RATIO) {
      completeIngressHold(phase);
      return;
    }

    clearIngressHold();
    renderIngress();
  }

  function chooseIngressMirror(value) {
    if (ingress.phase !== 'mirror' || ingress.resolvingGate) {
      return;
    }

    clearIngressFeedback();
    ingress.currentMirror = value;
    if (value === ingress.target.mirrorLogic) {
      ingress.resolvingGate = 'mirror';
      ingress.mirrorFeedback = 'accepted';
      renderIngress();
      setIngressPhase('badge');
      return;
    }

    ingress.resolvingGate = 'mirror';
    ingress.mirrorFeedback = 'rejected';
    renderIngress();
    scheduleIngressFeedbackClear('mirror');
  }

  function cycleIngressBadge() {
    if (ingress.phase !== 'badge' || ingress.resolvingGate) {
      return;
    }

    clearIngressFeedback();
    const currentIndex = INGRESS_BADGE_OPTIONS.findIndex((option) => option.value === ingress.currentBadge);
    const nextOption = INGRESS_BADGE_OPTIONS[(currentIndex + 1 + INGRESS_BADGE_OPTIONS.length) % INGRESS_BADGE_OPTIONS.length];
    ingress.currentBadge = nextOption.value;
    if (ingress.currentBadge === ingress.target.badge) {
      ingress.resolvingGate = 'badge';
      ingress.badgeFeedback = 'accepted';
      renderIngress();
      setIngressPhase('seal');
      return;
    }

    renderIngress();
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
    const transfer = buildCadenceTransfer(text, shell);
    const effectiveText = transfer.text;
    const persona = shell.personaId ? findPersona(shell.personaId) : null;
    const effectiveProfile = transfer.outputProfile || extractCadenceProfile(effectiveText);

    return {
      slot,
      text,
      effectiveText,
      hasEffectiveTextShift: effectiveText !== text,
      hasText: !rawProfile.empty,
      rawProfile,
      effectiveProfile,
      persona,
      shell,
      transfer
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

  function transferDimensionLabel(id) {
    const labels = {
      'sentence-mean': 'sentence mean',
      'sentence-count': 'sentence count',
      'sentence-spread': 'sentence spread',
      'contraction-posture': 'contraction posture',
      'line-break-texture': 'line-break texture',
      'connector-stance': 'connector stance',
      'punctuation-shape': 'punctuation shape'
    };

    return labels[id] || id;
  }

  function transferSummaryCopy(transfer, shifted = '') {
    if (!transfer || transfer.transferClass === 'native') {
      return 'Transfer stayed on source cadence.';
    }

    if (transfer.transferClass === 'rejected') {
      return 'Transfer stayed on source cadence.';
    }

    if (transfer.transferClass === 'structural') {
      return shifted ? `Transfer moved ${shifted}.` : 'Transfer landed a structural cadence shift.';
    }

    return 'Transfer stayed close to the source cadence.';
  }

  function describeShellNote(voiceState) {
    if (voiceState.shell.mode === 'native') {
      return 'Native cadence only. Shell Duel will show the source text unchanged until another shell lands.';
    }

    const transfer = voiceState.transfer;
    const shifted = (transfer?.changedDimensions || [])
      .map((dimension) => transferDimensionLabel(dimension))
      .slice(0, 3)
      .join(', ');
    const literalNote = transfer?.protectedLiteralCount
      ? `${transfer.protectedLiteralCount} literal${transfer.protectedLiteralCount === 1 ? '' : 's'} held fixed.`
      : '';
    const transferSummary = transferSummaryCopy(transfer, shifted);

    if (voiceState.shell.mode === 'borrowed') {
      return `Borrowed from the ${SLOT_SHORT[voiceState.shell.fromSlot]} bay. ${transferSummary} ${literalNote}`.trim();
    }

    if (voiceState.shell.profile) {
      return `Profile shell transfer live at ${Math.round((voiceState.shell.strength || 0.76) * 100)}%. ${transferSummary} ${literalNote}`.trim();
    }

    return `Applied shell bias: sent ${voiceState.shell.mod.sent >= 0 ? '+' : ''}${voiceState.shell.mod.sent}, cont ${voiceState.shell.mod.cont >= 0 ? '+' : ''}${voiceState.shell.mod.cont}, punc ${voiceState.shell.mod.punc >= 0 ? '+' : ''}${voiceState.shell.mod.punc}.`;
  }

  function shellStrengthCopy(shell) {
    if (!shell || shell.mode === 'native') {
      return 'native shell';
    }

    return `${Math.round(((shell.strength || 0.76)) * 100)}% transfer`;
  }

  function compactAxisLabel(id) {
    const labels = {
      rhythm_mean: 'mean',
      rhythm_spread: 'spread',
      punctuation: 'punct',
      contractions: 'cont',
      line_breaks: 'breaks',
      recurrence: 'recur',
      lexical: 'lex'
    };

    return labels[id] || id;
  }

  function radarPoint(index, total, radius, center) {
    const angle = (-Math.PI / 2) + ((Math.PI * 2 * index) / total);
    const x = center + Math.cos(angle) * radius;
    const y = center + Math.sin(angle) * radius;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }

  function renderDuelSignature(signature) {
    const axes = signature.axes || [];
    if (!axes.length) {
      return '<div class="duel-visual-empty">Signature waiting for a live sample.</div>';
    }

    const center = 76;
    const maxRadius = 54;
    const levels = [0.25, 0.5, 0.75, 1];
    const grid = levels
      .map((level) => {
        const points = axes
          .map((axis, index) => radarPoint(index, axes.length, maxRadius * level, center))
          .join(' ');
        return `<polygon class="duel-radar-grid" points="${points}"></polygon>`;
      })
      .join('');
    const spokes = axes
      .map((axis, index) => {
        const point = radarPoint(index, axes.length, maxRadius, center);
        return `<line class="duel-radar-spoke" x1="${center}" y1="${center}" x2="${point.split(',')[0]}" y2="${point.split(',')[1]}"></line>`;
      })
      .join('');
    const dataPoints = axes
      .map((axis, index) => radarPoint(index, axes.length, maxRadius * axis.normalized, center))
      .join(' ');
    const nodes = axes
      .map((axis, index) => {
        const point = radarPoint(index, axes.length, maxRadius * axis.normalized, center).split(',');
        return `<circle class="duel-radar-node" cx="${point[0]}" cy="${point[1]}" r="2.6"></circle>`;
      })
      .join('');
    const legend = axes
      .map((axis) => `<span class="duel-radar-chip">${compactAxisLabel(axis.id)}</span>`)
      .join('');

    return `
      <svg class="duel-radar" viewBox="0 0 152 152" role="img" aria-label="Cadence signature radar">
        <circle class="duel-radar-core" cx="${center}" cy="${center}" r="2.8"></circle>
        ${grid}
        ${spokes}
        <polygon class="duel-radar-fill" points="${dataPoints}"></polygon>
        <polyline class="duel-radar-line" points="${dataPoints}"></polyline>
        ${nodes}
      </svg>
      <div class="duel-radar-legend">${legend}</div>
    `;
  }

  function renderDuelHeatmap(heatmap) {
    const matrix = heatmap && Array.isArray(heatmap.matrix) ? heatmap.matrix : Array.from({ length: 4 }, () => Array(4).fill(0));
    const rows = heatmap && Array.isArray(heatmap.rows) ? heatmap.rows : ['quiet-short', 'measured-mid', 'extended-long', 'drifting-wide'];
    const cols = heatmap && Array.isArray(heatmap.cols) ? heatmap.cols : ['mute', 'marked', 'charged', 'saturated'];
    const flat = matrix.flat();
    const peak = Math.max(1, ...flat);
    const cells = matrix
      .map((row, rowIndex) => row
        .map((value, colIndex) => {
          const intensity = value === 0 ? 0 : Math.max(0.16, value / peak);
          return `
            <span
              class="duel-heat-cell"
              style="--heat:${intensity.toFixed(2)}"
              title="${rows[rowIndex]} x ${cols[colIndex]} // ${value}"
            >${value ? value : ''}</span>
          `;
        })
        .join(''))
      .join('');

    return `
      <div class="duel-heatmap-grid">${cells}</div>
      <div class="duel-heatmap-copy">Sentence length \u00D7 punctuation load</div>
    `;
  }

  function renderDuelSide(side) {
    const profile = side.profile;
    const transferShift = (side.transfer?.changedDimensions || [])
      .map((dimension) => transferDimensionLabel(dimension))
      .slice(0, 3)
      .join(', ');
    const transferNote = transferSummaryCopy(side.transfer, transferShift);

    return `
      <article class="duel-side" data-slot="${side.slot}">
        <div class="duel-side-head">
          <div>
            <div class="section-kicker">${side.title}</div>
            <div class="duel-shell-name">${escapeHtml(side.shell.label)}</div>
          </div>
          <div class="duel-shell-strength">${shellStrengthCopy(side.shell)}</div>
        </div>
        <div id="duelSample${side.slot}" class="duel-sample">${escapeHtml(side.text)}</div>
        <div class="duel-mini-metrics">
          <span class="duel-mini-metric">Rhythm ${profile.avgSentenceLength.toFixed(1)}w</span>
          <span class="duel-mini-metric">Punct ${formatPct(profile.punctuationDensity)}</span>
          <span class="duel-mini-metric">Contractions ${formatPct(profile.contractionDensity)}</span>
          <span class="duel-mini-metric">Recurrence ${formatPct(profile.recurrencePressure)}</span>
        </div>
        <div class="duel-side-copy">${escapeHtml(transferNote)}</div>
        <div class="duel-visual-grid">
          <div class="duel-visual-card">
            <div class="duel-visual-label">Heatmap</div>
            ${renderDuelHeatmap(side.signature.heatmap)}
          </div>
          <div class="duel-visual-card">
            <div class="duel-visual-label">7-axis signature</div>
            ${renderDuelSignature(side.signature)}
          </div>
        </div>
      </article>
    `;
  }

  function buildShellDuelPayload(voiceStateA, voiceStateB) {
    const hasAnyText = voiceStateA.hasText || voiceStateB.hasText;
    const hasBothText = voiceStateA.hasText && voiceStateB.hasText;

    if (!hasAnyText) {
      return {
        state: 'empty',
        sourceLabel: 'Own sources // waiting for live bays',
        note: 'Paste both voices to wake Shell Duel. Each side will stage its own bay under the currently attached shell.'
      };
    }

    if (!hasBothText) {
      return {
        state: 'awaiting-pair',
        sourceLabel: 'Own sources // awaiting both bays',
        note: 'Shell Duel compares the reference bay against the probe bay. Populate both bays to stage their transformed samples side by side.'
      };
    }

    const referenceText = voiceStateA.effectiveText;
    const probeText = voiceStateB.effectiveText;
    const referenceProfile = voiceStateA.effectiveProfile;
    const probeProfile = voiceStateB.effectiveProfile;
    const referenceSignature = buildCadenceSignature(referenceText, referenceProfile);
    const probeSignature = buildCadenceSignature(probeText, probeProfile);
    const duelCompare = compareTexts(referenceText, probeText, {
      profileA: referenceProfile,
      profileB: probeProfile
    });

    return {
      state: 'live',
      sourceLabel: 'Own sources // reference bay and probe bay raw text',
      note: 'Each side stages its own bay under the currently attached shell. Raw text stays in the textarea; Shell Duel exposes only the cadence transfer.',
      reference: {
        slot: 'A',
        title: 'Reference bay under current shell',
        shell: voiceStateA.shell,
        text: referenceText,
        profile: referenceProfile,
        signature: referenceSignature,
        transfer: voiceStateA.transfer
      },
      probe: {
        slot: 'B',
        title: 'Probe bay under current shell',
        shell: voiceStateB.shell,
        text: probeText,
        profile: probeProfile,
        signature: probeSignature,
        transfer: voiceStateB.transfer
      },
      compare: duelCompare,
      sentenceDrift: Math.abs((duelCompare.avgSentenceA || 0) - (duelCompare.avgSentenceB || 0))
    };
  }

  function renderShellDuel(voiceStateA, voiceStateB) {
    const duel = buildShellDuelPayload(voiceStateA, voiceStateB);
    const shellDuel = $('shellDuel');
    const body = $('shellDuelBody');

    shellDuel.dataset.state = duel.state;
    $('duelSourceStatus').textContent = duel.sourceLabel;
    $('duelNote').textContent = duel.note;

    if (duel.state !== 'live') {
      body.innerHTML = `
        <div class="duel-empty">
          <div class="duel-empty-mark">SHELL DUEL</div>
          <p class="duel-empty-copy">${duel.note}</p>
        </div>
      `;
      return;
    }

    body.innerHTML = `
      <div class="duel-grid">
        ${renderDuelSide(duel.reference)}
        <aside class="duel-delta">
          <div class="section-kicker">Delta strip</div>
          <div class="duel-delta-list">
            <div class="duel-delta-item">
              <span class="duel-delta-label">Duel similarity</span>
              <strong id="duelSimilarity">${formatFixed(duel.compare.similarity)}</strong>
            </div>
            <div class="duel-delta-item">
              <span class="duel-delta-label">Duel traceability</span>
              <strong id="duelTraceability">${formatFixed(duel.compare.traceability)}</strong>
            </div>
            <div class="duel-delta-item">
              <span class="duel-delta-label">Sentence drift</span>
              <strong id="duelSentenceDrift">${duel.sentenceDrift.toFixed(1)}w</strong>
            </div>
          <div class="duel-delta-item">
              <span class="duel-delta-label">Function-word distance</span>
              <strong id="duelFunctionWordDistance">${formatFixed(duel.compare.functionWordDistance)}</strong>
            </div>
          </div>
          <p class="duel-delta-copy">Each bay keeps its own text. Swap Cadences should move shell behavior without moving content.</p>
        </aside>
        ${renderDuelSide(duel.probe)}
      </div>
    `;
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
      <p class="bay-copy">${shellNote}</p>
    `;
  }

  function renderVoiceProfiles(voiceStateA = getVoiceState('A'), voiceStateB = getVoiceState('B')) {
    renderVoiceProfile(voiceStateA);
    renderVoiceProfile(voiceStateB);
    renderShellDuel(voiceStateA, voiceStateB);
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
    $('swapMedallion').setAttribute('aria-label', 'Swap bay text');
    $('swapMedallion').title = 'Swap bay text';
    $('savePersonaBtn').textContent = `Save Cadence as Persona // ${SLOT_SHORT[activeVoice]}`;
    $('toggleMirrorBtn').textContent = MIRROR_COPY[mirrorLogic].button;
    $('badgeBtn').textContent = `Cycle custody badge // ${BADGE_LABELS[badge] || badge}`;
    $('resetBtn').textContent = 'Reset bay';

    const voiceStateA = getVoiceState('A');
    const voiceStateB = getVoiceState('B');
    $('swapCadencesBtn').disabled = !(voiceStateA.hasText && voiceStateB.hasText);
    $('swapMedallion').disabled = !(voiceStateA.hasText && voiceStateB.hasText);
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

  function analyzeCadences(options = {}) {
    const { reveal = analysisRevealed } = options;
    if (reveal && !analysisRevealed) {
      setAnalysisRevealState(true);
    }
    document.body.dataset.bootStage = 'analyze-enter';
    const voiceStateA = getVoiceState('A');
    const voiceStateB = getVoiceState('B');

    renderVoiceProfiles(voiceStateA, voiceStateB);

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

  function handleAnalyzeCadences() {
    analyzeCadences({ reveal: true });
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
    setSwapStatusMessage(`Cadence shells swapped. Each bay kept its own raw text and took the other bay's shell. Similarity ${beforeSnapshot.similarity} -> ${afterSnapshot.similarity}; route ${beforeSnapshot.routePressure} -> ${afterSnapshot.routePressure}.`);
  }

  function swapBayText() {
    const voiceStateA = getVoiceState('A');
    const voiceStateB = getVoiceState('B');

    if (!voiceStateA.hasText || !voiceStateB.hasText) {
      setStatusMessage('Swap bay text needs both bays populated before the source samples can trade places.');
      updateControls();
      return;
    }

    const nextA = $('voiceB').value;
    const nextB = $('voiceA').value;
    $('voiceA').value = nextA;
    $('voiceB').value = nextB;
    analyzeCadences();
    const focusTarget = activeVoice === 'A' ? $('voiceA') : $('voiceB');
    if (focusTarget && typeof focusTarget.focus === 'function') {
      focusTarget.focus({ preventScroll: true });
    }
    setStatusMessage('Bay text swapped. Each shell stayed attached to its original side.');
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
    const keepRevealed = Boolean(testFlightMode);
    setAnalysisRevealState(keepRevealed);
    bayShells = {
      A: createNativeShell(),
      B: createNativeShell()
    };
    activeVoice = 'A';
    renderVoiceProfiles();
    renderPersonas();
    analyzeCadences({ reveal: keepRevealed });
    setStatusMessage(
      keepRevealed
        ? 'Deck reset. Native cadences restored and the default pair is back in the field.'
        : 'Deck reset. Native cadences restored and the deck went latent again. Press Analyze Cadences to wake the field.'
    );
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
    const readText = (id) => {
      const node = $(id);
      return node ? node.textContent.trim() : '';
    };

    return {
      decision: document.body.dataset.decision,
      decisionTone: readText('decisionTone'),
      similarity: readText('similarity'),
      traceability: readText('traceability'),
      routePressure: readText('routePressure'),
      custody: readText('custodyState'),
      heroHarbor: readText('heroHarborValue'),
      routeState: readText('routeState'),
      status: readText('analysisStatus'),
      statusBase: readText('analysisStatusBase'),
      statusCue: readText('swapActionCue'),
      statusCueVisible: !$('swapActionCue').hidden,
      swapMedallionDisabled: $('swapMedallion').disabled,
      duelState: $('shellDuel').dataset.state,
      duelSource: readText('duelSourceStatus'),
      duelSimilarity: readText('duelSimilarity'),
      duelTraceability: readText('duelTraceability'),
      duelSentenceDrift: readText('duelSentenceDrift'),
      duelFunctionWordDistance: readText('duelFunctionWordDistance'),
      duelReferenceSample: readText('duelSampleA'),
      duelProbeSample: readText('duelSampleB')
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

  function readIngressSnapshot() {
    const overlay = $('ingressMembrane');
    const layer = overlay ? overlay.querySelector('.ingress-layer') : null;
    const readText = (id) => {
      const node = $(id);
      return node ? node.textContent.trim() : '';
    };

    return {
      phase: ingress.phase,
      resolvingGate: ingress.resolvingGate || 'none',
      targetMirror: overlay ? overlay.dataset.targetMirror : '',
      targetBadge: overlay ? overlay.dataset.targetBadge : '',
      currentMirror: overlay ? overlay.dataset.currentMirror : '',
      currentBadge: overlay ? overlay.dataset.currentBadge : '',
      sealSequenceIndex: ingress.sealSequenceIndex,
      sealRejectedNode: ingress.sealRejectedNode || '',
      mirrorControlsHidden: $('ingressMirrorControls').hidden,
      badgeControlsHidden: $('ingressBadgeControls').hidden,
      sealNodesHidden: $('ingressSealNodes') ? $('ingressSealNodes').hidden : true,
      status: readText('ingressStatus'),
      cue: readText('ingressCueLabel'),
      badgeReadout: readText('ingressBadgeReadout'),
      bodyOverflow: window.getComputedStyle(document.body).overflow,
      layerOverflowY: layer ? window.getComputedStyle(layer).overflowY : '',
      layerHasVerticalOverflow: layer ? layer.scrollHeight > layer.clientHeight + 1 : false
    };
  }

  function primeIngressScenario({
    phase = 'containment',
    targetMirror = 'off',
    targetBadge = 'badge.holds',
    currentMirror = null,
    currentBadge = null
  } = {}) {
    clearIngressTimers();
    ingress.enabled = true;
    ingress.phase = phase;
    ingress.holding = null;
    ingress.holdStartedAt = 0;
    ingress.holdPointerId = null;
    ingress.sealSequenceIndex = 0;
    ingress.sealRejectedNode = null;
    ingress.currentMirror = currentMirror;
    ingress.currentBadge = currentBadge;
    ingress.target = {
      containment: 'on',
      mirrorLogic: targetMirror,
      badge: targetBadge
    };
    ingress.resolvingGate = null;
    ingress.mirrorFeedback = null;
    ingress.badgeFeedback = null;
    renderIngress();
    return readIngressSnapshot();
  }

  function runIngressTestFlight() {
    const report = {
      mode: 'ingress',
      cases: []
    };

    const pushCase = (id, pass, snapshot, rationale) => {
      report.cases.push({ id, pass, rationale, snapshot });
    };

    primeIngressScenario({
      phase: 'containment',
      targetMirror: resolveIngressMirrorTarget(ingressMirrorOverride) || 'off',
      targetBadge: resolveIngressBadgeTarget(ingressBadgeOverride) || 'badge.buffer'
    });
    pushCase(
      'layout_containment',
      readIngressSnapshot().phase === 'containment' &&
        readIngressSnapshot().bodyOverflow === 'hidden' &&
        readIngressSnapshot().layerOverflowY === 'hidden' &&
        readIngressSnapshot().mirrorControlsHidden &&
        readIngressSnapshot().badgeControlsHidden,
      readIngressSnapshot(),
      'Containment should own the screen without inner scrolling or leaked later-stage controls.'
    );

    primeIngressScenario({ phase: 'containment', targetMirror: 'off', targetBadge: 'badge.buffer' });
    ingress.holding = 'containment';
    completeIngressHold('containment');
    pushCase(
      'containment_advances_to_mirror',
      readIngressSnapshot().phase === 'mirror' &&
        !readIngressSnapshot().mirrorControlsHidden,
      readIngressSnapshot(),
      'Containment should advance directly into the mirror gate.'
    );

    primeIngressScenario({ phase: 'mirror', targetMirror: 'off', targetBadge: 'badge.buffer' });
    chooseIngressMirror('on');
    pushCase(
      'mirror_wrong_choice_stays_put',
      readIngressSnapshot().phase === 'mirror' &&
        readIngressSnapshot().currentMirror === 'on' &&
        readIngressSnapshot().status.toLowerCase().includes('reject'),
      readIngressSnapshot(),
      'A wrong mirror posture should reject and stay on the mirror gate.'
    );

    primeIngressScenario({ phase: 'mirror', targetMirror: 'off', targetBadge: 'badge.buffer' });
    chooseIngressMirror('off');
    pushCase(
      'mirror_off_advances_to_token',
      readIngressSnapshot().phase === 'badge' && !readIngressSnapshot().badgeControlsHidden,
      readIngressSnapshot(),
      'A correct latent mirror choice should advance immediately to the token gate.'
    );

    primeIngressScenario({ phase: 'mirror', targetMirror: 'on', targetBadge: 'badge.buffer' });
    chooseIngressMirror('on');
    pushCase(
      'mirror_on_advances_to_token',
      readIngressSnapshot().phase === 'badge' && !readIngressSnapshot().badgeControlsHidden,
      readIngressSnapshot(),
      'A correct clear mirror choice should advance immediately to the token gate.'
    );

    primeIngressScenario({ phase: 'badge', targetMirror: 'off', targetBadge: 'badge.buffer', currentBadge: null });
    cycleIngressBadge();
    pushCase(
      'token_wrong_choice_stays_put',
      readIngressSnapshot().phase === 'badge' &&
        readIngressSnapshot().currentBadge === 'badge.holds' &&
        readIngressSnapshot().badgeReadout.toLowerCase().includes('holds'),
      readIngressSnapshot(),
      'A non-matching token should stay on the token gate and remain interactive.'
    );

    primeIngressScenario({ phase: 'badge', targetMirror: 'off', targetBadge: 'badge.buffer', currentBadge: 'badge.holds' });
    cycleIngressBadge();
    pushCase(
      'token_match_advances_to_seal',
      readIngressSnapshot().phase === 'seal',
      readIngressSnapshot(),
      'Cycling onto the target token should advance immediately to seal.'
    );

    primeIngressScenario({ phase: 'seal', targetMirror: 'on', targetBadge: 'badge.buffer', currentMirror: 'on', currentBadge: 'badge.buffer' });
    chooseIngressSealNode('bc');
    pushCase(
      'seal_wrong_node_stays_put',
      readIngressSnapshot().phase === 'seal' &&
        readIngressSnapshot().sealSequenceIndex === 0 &&
        readIngressSnapshot().sealRejectedNode === 'bc',
      readIngressSnapshot(),
      'A wrong triad point should reject without finalizing ingress.'
    );

    primeIngressScenario({ phase: 'seal', targetMirror: 'on', targetBadge: 'badge.buffer', currentMirror: 'on', currentBadge: 'badge.buffer' });
    chooseIngressSealNode('ul');
    chooseIngressSealNode('ur');
    chooseIngressSealNode('bc');
    pushCase(
      'seal_triad_advances_to_revealing',
      readIngressSnapshot().phase === 'revealing',
      readIngressSnapshot(),
      'The three-node seal should hand off into the reveal phase once the clockwise triad is complete.'
    );

    report.summary = {
      allPassed: report.cases.every((entry) => entry.pass),
      passCount: report.cases.filter((entry) => entry.pass).length,
      caseCount: report.cases.length
    };

    let node = document.getElementById('testFlightReport');
    if (!node) {
      node = document.createElement('pre');
      node.id = 'testFlightReport';
      node.className = 'formula';
      document.body.appendChild(node);
    }

    node.textContent = JSON.stringify(report, null, 2);

    const summaryText = `Ingress flight // ${report.summary.allPassed ? 'passed' : 'check failed'} ${report.summary.passCount}/${report.summary.caseCount}`;
    document.body.dataset.testFlightStatus = report.summary.allPassed ? 'passed' : 'complete';
    document.body.dataset.testFlightSummary = summaryText.toLowerCase().replace(/[^a-z0-9/ ]/gi, '');
    $('ingressStatus').textContent = summaryText;
    setStatusMessage(summaryText);
  }

  function runTestFlight(mode = 'smoke') {
    if (mode === 'transfer') {
      const structuralDimensions = (transfer = {}) =>
        (transfer.changedDimensions || [])
          .filter((dimension) => [
            'sentence-mean',
            'sentence-count',
            'sentence-spread',
            'contraction-posture',
            'line-break-texture',
            'connector-stance'
          ].includes(dimension));
      const cases = [];

      const contrastSource = "Honestly, I was not trying to make a speech because every time I got to the part where I should have left, I remembered one more detail that changed why I stayed. By the time I finished, which is apparently what I do, I was still buying time.";
      const contrastDonor = "Need you to grab the charger on your way in. Front door sticks, so pull hard. If the downstairs light is off, knock twice. I'm in back.";
      const contrastTransfer = buildCadenceTransfer(contrastSource, {
        mode: 'borrowed',
        profile: extractCadenceProfile(contrastDonor),
        strength: 0.9
      });
      cases.push({
        id: 'contrast_structural',
        source: contrastSource,
        donorText: contrastDonor,
        transfer: contrastTransfer,
        pass:
          contrastTransfer.transferClass === 'structural' &&
          contrastTransfer.text !== contrastSource &&
          (contrastTransfer.changedDimensions || []).filter((dimension) => dimension !== 'punctuation-shape').length >= 2 &&
          structuralDimensions(contrastTransfer).length >= 1
      });

      const connectorSource = 'Because the room stayed loud, I kept the note, but the line dragged, so I left this mark behind.';
      const connectorDonor = 'Since the room stayed loud, I kept the note. Though the line dragged, I stayed. Then I left that mark behind.';
      const connectorTransfer = buildCadenceTransfer(connectorSource, {
        mode: 'borrowed',
        profile: extractCadenceProfile(connectorDonor),
        strength: 0.88
      });
      const connectorLower = connectorTransfer.text.toLowerCase();
      cases.push({
        id: 'connector_visibility',
        source: connectorSource,
        donorText: connectorDonor,
        transfer: connectorTransfer,
        pass:
          connectorTransfer.text !== connectorSource &&
          (
            connectorLower.includes('since') ||
            connectorLower.includes('though') ||
            connectorLower.includes('then') ||
            connectorLower.includes('that')
          ) &&
          (connectorTransfer.changedDimensions || []).includes('connector-stance')
      });

      const mergeSource = 'Door sticks. Knock twice. I am in back.';
      const mergeDonor = 'Honestly, I kept circling the point because every time I tried to leave, I found one more reason to stay, and then I stalled again because the room went quiet.';
      const mergeTransfer = buildCadenceTransfer(mergeSource, {
        mode: 'borrowed',
        profile: extractCadenceProfile(mergeDonor),
        strength: 0.88
      });
      const mergeSourceProfile = extractCadenceProfile(mergeSource);
      const mergeOutputProfile = extractCadenceProfile(mergeTransfer.text);
      cases.push({
        id: 'merge_structural',
        source: mergeSource,
        donorText: mergeDonor,
        transfer: mergeTransfer,
        pass:
          mergeTransfer.text !== mergeSource &&
          (
            mergeTransfer.transferClass === 'structural' ||
            (mergeTransfer.changedDimensions || []).includes('sentence-count') ||
            (mergeTransfer.changedDimensions || []).includes('sentence-mean')
          ) &&
          (mergeOutputProfile.sentenceCount || 0) <= (mergeSourceProfile.sentenceCount || 0)
      });

      const reverseContrastSource = 'Need the charger. Front door sticks. Knock twice if the light is out. I am in back.';
      const reverseContrastDonor = mergeDonor;
      const reverseContrastTransfer = buildCadenceTransfer(reverseContrastSource, {
        mode: 'borrowed',
        profile: extractCadenceProfile(reverseContrastDonor),
        strength: 0.9
      });
      const reverseContrastSourceProfile = extractCadenceProfile(reverseContrastSource);
      const reverseContrastOutputProfile = extractCadenceProfile(reverseContrastTransfer.text);
      cases.push({
        id: 'reverse_contrast_structural',
        source: reverseContrastSource,
        donorText: reverseContrastDonor,
        transfer: reverseContrastTransfer,
        pass:
          reverseContrastTransfer.text !== reverseContrastSource &&
          (
            reverseContrastTransfer.transferClass === 'structural' ||
            (reverseContrastTransfer.changedDimensions || []).includes('sentence-count') ||
            (reverseContrastTransfer.changedDimensions || []).includes('sentence-mean')
          ) &&
          (
            (reverseContrastOutputProfile.avgSentenceLength || 0) > (reverseContrastSourceProfile.avgSentenceLength || 0) ||
            (reverseContrastOutputProfile.sentenceCount || 0) < (reverseContrastSourceProfile.sentenceCount || 0)
          )
      });

      const additiveGuardSource = 'Because the room stayed loud, I kept the note. But the line dragged. So I left this mark behind.';
      const additiveGuardTransfer = buildCadenceTransfer(additiveGuardSource, {
        mode: 'borrowed',
        profile: extractCadenceProfile(reverseContrastDonor),
        strength: 0.9
      });
      const additiveGlueCount = (additiveGuardTransfer.text.match(/(?:,\s+and\b|;\s+and\b|-\s+and\b)/gi) || []).length;
      const additiveGuardLower = additiveGuardTransfer.text.toLowerCase();
      cases.push({
        id: 'anti_additive_glue',
        source: additiveGuardSource,
        donorText: reverseContrastDonor,
        transfer: additiveGuardTransfer,
        pass:
          additiveGlueCount <= 1 &&
          (
            additiveGuardTransfer.transferClass === 'rejected' ||
            additiveGuardLower.includes('because') ||
            additiveGuardLower.includes('since') ||
            additiveGuardLower.includes('though') ||
            additiveGuardLower.includes('yet') ||
            additiveGuardLower.includes('but') ||
            additiveGuardLower.includes('so') ||
            additiveGuardLower.includes('then')
          )
      });

      const lowOpportunitySource = 'Stone settles under glass.';
      const lowOpportunityDonor = contrastDonor;
      const lowOpportunityTransfer = buildCadenceTransfer(lowOpportunitySource, {
        mode: 'borrowed',
        profile: extractCadenceProfile(lowOpportunityDonor),
        strength: 0.9
      });
      cases.push({
        id: 'low_opportunity_honesty',
        source: lowOpportunitySource,
        donorText: lowOpportunityDonor,
        transfer: lowOpportunityTransfer,
        pass:
          ['weak', 'rejected'].includes(lowOpportunityTransfer.transferClass) &&
          lowOpportunityTransfer.transferClass !== 'structural' &&
          lowOpportunityTransfer.opportunityProfile &&
          lowOpportunityTransfer.opportunityProfile.sentenceSplit === 0 &&
          lowOpportunityTransfer.opportunityProfile.sentenceMerge === 0
      });

      const report = {
        mode,
        cases: cases.map((entry) => ({
          id: entry.id,
          source: entry.source,
          donorText: entry.donorText,
          transferClass: entry.transfer.transferClass,
          changedDimensions: entry.transfer.changedDimensions || [],
          passesApplied: entry.transfer.passesApplied || [],
          transformedText: entry.transfer.text,
          opportunityProfile: entry.transfer.opportunityProfile || {},
          pass: entry.pass
        })),
        summary: {
          allPassed: cases.every((entry) => entry.pass),
          passCount: cases.filter((entry) => entry.pass).length,
          caseCount: cases.length
        }
      };

      let node = document.getElementById('testFlightReport');
      if (!node) {
        node = document.createElement('pre');
        node.id = 'testFlightReport';
        node.className = 'formula';
        document.body.appendChild(node);
      }

      node.textContent = JSON.stringify(report, null, 2);
      const summaryText = `Transfer flight // ${report.summary.allPassed ? 'passed' : 'check failed'} ${report.summary.passCount}/${report.summary.caseCount}`;
      document.body.dataset.testFlightStatus = report.summary.allPassed ? 'passed' : 'complete';
      document.body.dataset.testFlightSummary = summaryText.toLowerCase().replace(/[^a-z0-9/ ]/gi, '');
      setStatusMessage(summaryText);
      return;
    }

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
      const beforeTextSwap = readDeckSnapshot();
      const beforeTextSwapA = $('voiceA').value;
      const beforeTextSwapB = $('voiceB').value;
      $('swapMedallion').click();
      const afterTextSwap = readDeckSnapshot();
      report.textSwapMedallion = {
        snapshot: afterTextSwap,
        medallionEnabled: !afterTextSwap.swapMedallionDisabled,
        voiceASwapped: $('voiceA').value === beforeTextSwapB,
        voiceBSwapped: $('voiceB').value === beforeTextSwapA,
        metricsChanged:
          afterTextSwap.similarity !== beforeTextSwap.similarity ||
          afterTextSwap.routePressure !== beforeTextSwap.routePressure,
        duelChanged:
          afterTextSwap.duelSimilarity !== beforeTextSwap.duelSimilarity ||
          afterTextSwap.duelTraceability !== beforeTextSwap.duelTraceability,
        duelSamplesChanged:
          afterTextSwap.duelReferenceSample !== beforeTextSwap.duelReferenceSample ||
          afterTextSwap.duelProbeSample !== beforeTextSwap.duelProbeSample
      };

      $('resetBtn').click();
      const ownSourceSnapshot = readDeckSnapshot();
      report.ownSourceDuel = {
        sourceLabel: ownSourceSnapshot.duelSource,
        referenceOwnSource: ownSourceSnapshot.duelReferenceSample.toLowerCase().includes('honestly'),
        probeOwnSource: ownSourceSnapshot.duelProbeSample.toLowerCase().includes('charger'),
        samplesDistinct: ownSourceSnapshot.duelReferenceSample !== ownSourceSnapshot.duelProbeSample
      };

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
        duelSamplesChanged:
          readDeckSnapshot().duelReferenceSample !== ownSourceSnapshot.duelReferenceSample ||
          readDeckSnapshot().duelProbeSample !== ownSourceSnapshot.duelProbeSample,
        personaStatusChanged: $('personaStatus').textContent.trim() !== assignedLabelBeforeSwap,
        cueVisible: readDeckSnapshot().statusCueVisible,
        cueText: readDeckSnapshot().statusCue
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
              report.textSwapMedallion.voiceASwapped &&
              report.textSwapMedallion.voiceBSwapped &&
              report.textSwapMedallion.duelSamplesChanged &&
              report.ownSourceDuel.referenceOwnSource &&
              report.ownSourceDuel.probeOwnSource &&
              report.ownSourceDuel.samplesDistinct &&
              report.swapCadences.duelSamplesChanged &&
              report.swapCadences.cueVisible &&
              report.swapCadences.cueText.toLowerCase().includes('shell duel updated below') &&
              report.soloScan.similarityKey === 'Scan mode' &&
              report.baseline.snapshot.duelState === 'live' &&
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

    const summaryText = report.summary
      ? `Test flight // ${report.summary.allPassed ? 'passed' : 'check failed'} ${report.summary.matrixPassCount}/${report.summary.matrixCount}`
      : `Test flight // ${mode} complete`;
    document.body.dataset.testFlightStatus = report.summary && report.summary.allPassed ? 'passed' : 'complete';
    document.body.dataset.testFlightSummary = summaryText.toLowerCase().replace(/[^a-z0-9/ ]/gi, '');
    setStatusMessage(summaryText);
  }

  $('compareBtn').addEventListener('click', handleAnalyzeCadences);
  $('swapMedallion').addEventListener('click', swapBayText);
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
  $('ingressMirrorArmed').addEventListener('click', () => chooseIngressMirror('off'));
  $('ingressMirrorOpen').addEventListener('click', () => chooseIngressMirror('on'));
  $('ingressBadgeCycle').addEventListener('click', cycleIngressBadge);
  $('ingressCore').addEventListener('pointerdown', handleIngressCorePointerDown);
  $('ingressCore').addEventListener('pointermove', handleIngressCorePointerMove);
  $('ingressCore').addEventListener('pointerup', handleIngressCorePointerUp);
  $('ingressCore').addEventListener('pointercancel', handleIngressCorePointerCancel);
  $('ingressCore').addEventListener('lostpointercapture', handleIngressCorePointerCancel);
  $('ingressCore').addEventListener('blur', handleIngressCorePointerCancel);
  $('ingressCore').addEventListener('keydown', (event) => {
    if ((event.key === 'Enter' || event.key === ' ') && !event.repeat) {
      event.preventDefault();
      beginIngressHold();
    }
  });
  $('ingressCore').addEventListener('keyup', (event) => {
    if ((event.key === 'Enter' || event.key === ' ') && ingress.phase !== 'seal') {
      event.preventDefault();
      cancelIngressHold();
    }
  });
  $('ingressSealNodeUl').addEventListener('click', () => chooseIngressSealNode('ul'));
  $('ingressSealNodeUr').addEventListener('click', () => chooseIngressSealNode('ur'));
  $('ingressSealNodeBc').addEventListener('click', () => chooseIngressSealNode('bc'));

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
    setAnalysisRevealState(false);
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
    analyzeCadences({ reveal: Boolean(testFlightMode) });
    startIngressSequence();
    document.body.dataset.bootStage = 'boot-complete';
  }

  window.addEventListener('error', (event) => {
    const message = event.error && event.error.message ? event.error.message : event.message;
    const status = $('analysisStatus');
    if (status && message) {
      setStatusMessage(`Startup fault // ${message}`);
    }
    document.body.dataset.bootStage = 'boot-error';
    if (message) {
      document.body.dataset.bootError = message.replace(/[^a-z0-9.\-_/ ]/gi, '').slice(0, 120);
    }
  });

  renderIngress();

  try {
    boot();
  } catch (error) {
    const status = $('analysisStatus');
    if (status) {
      setStatusMessage(`Startup fault // ${error.message}`);
    }
    document.body.dataset.bootStage = 'boot-error';
    document.body.dataset.bootError = (error.message || 'unknown-error')
      .replace(/[^a-z0-9.\-_/ ]/gi, '')
      .slice(0, 120);
  }

  if (testFlightMode === '1') {
    window.setTimeout(() => runTestFlight('smoke'), 120);
  }

  if (testFlightMode === '2') {
    window.setTimeout(() => runTestFlight('full'), 120);
  }

  if (testFlightMode === 'transfer') {
    window.setTimeout(() => runTestFlight('transfer'), 120);
  }

  if (ingressFlightMode) {
    window.setTimeout(() => runIngressTestFlight(), 120);
  }
})();
