(function () {
  const {
    defaults,
    basePersonas,
    microcopy,
    glyphFieldTech = {},
    diagnostic_corpus: diagnosticCorpus = {},
    diagnostic_battery: diagnosticBattery = {},
    diagnostic_annexes: diagnosticAnnexes = {}
  } = window.TCP_DATA;
  const {
    HARBOR_LIBRARY,
    compareTexts,
    extractCadenceProfile,
    buildCadenceTransfer,
    buildCadenceTransferTrace,
    buildSwapCadenceMatrix,
    buildCadenceSignature,
    sentenceSplit,
    segmentTextToIR,
    buildOpportunityProfileFromIR,
    buildTransferPlanFromIR,
    beamSearchTransfer,
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
    badgeMeaning,
    SWAP_CADENCE_FLAGSHIP_PAIRS
  } = window.TCP_ENGINE;
  const RETRIEVAL_FIXTURE_BUNDLE = window.TCP_RETRIEVAL_FIXTURES || { cases: {} };
  const SAMPLE_LIBRARY = Object.freeze(
    (diagnosticCorpus.promotedSampleLibrary || defaults.sample_library || []).map((sample) => Object.freeze({ ...sample }))
  );
  const FULL_SAMPLE_LIBRARY = Object.freeze(
    (diagnosticCorpus.samples || SAMPLE_LIBRARY).map((sample) => Object.freeze({ ...sample }))
  );
  const DECK_RANDOMIZER_SAMPLE_LIBRARY = Object.freeze(
    (diagnosticCorpus.deckRandomizerSampleLibrary || diagnosticCorpus.promotedSampleLibrary || FULL_SAMPLE_LIBRARY)
      .map((sample) => Object.freeze({ ...sample }))
  );
  const STARTER_DUEL_SAMPLE_IDS = Object.freeze({
    A: 'package-handoff-formal-record',
    B: 'package-handoff-rushed-mobile'
  });
  const DECK_RANDOMIZER_TOP_COUNT = 8;
  const DECK_RANDOMIZER_FIELD_POOL_COUNT = 24;
  const DIAGNOSTIC_BATTERY = Object.freeze({
    swapPairs: Object.freeze(diagnosticBattery.swapPairs || []),
    maskCases: Object.freeze(diagnosticBattery.maskCases || []),
    trainerCases: Object.freeze(diagnosticBattery.trainerCases || []),
    retrievalCases: Object.freeze(diagnosticBattery.retrievalCases || []),
    falseNeighborCases: Object.freeze(diagnosticBattery.falseNeighborCases || [])
  });
  const DIAGNOSTIC_ANNEXES = Object.freeze({
    safeHarbor: Object.freeze(diagnosticAnnexes.safeHarbor || {})
  });
  const SAMPLE_LIBRARY_BY_ID = Object.freeze(FULL_SAMPLE_LIBRARY.reduce((acc, sample) => {
    acc[sample.id] = sample;
    return acc;
  }, {}));
  const SAMPLE_PROFILE_BY_ID = Object.freeze(FULL_SAMPLE_LIBRARY.reduce((acc, sample) => {
    acc[sample.id] = Object.freeze(extractCadenceProfile(sample.text));
    return acc;
  }, {}));
  const SAMPLE_SIGNATURE_BY_ID = Object.freeze(FULL_SAMPLE_LIBRARY.reduce((acc, sample) => {
    acc[sample.id] = Object.freeze(buildCadenceSignature(sample.text, SAMPLE_PROFILE_BY_ID[sample.id]));
    return acc;
  }, {}));
  if (!defaults.voiceA && !defaults.voiceB) {
    const starterA = FULL_SAMPLE_LIBRARY.find((sample) => sample.id === STARTER_DUEL_SAMPLE_IDS.A) || null;
    const starterB = FULL_SAMPLE_LIBRARY.find((sample) => sample.id === STARTER_DUEL_SAMPLE_IDS.B) || null;
    defaults.voiceA = starterA?.text || '';
    defaults.voiceB = starterB?.text || '';
    defaults.voiceA_sample_id = starterA?.id || '';
    defaults.voiceB_sample_id = starterB?.id || '';
  }
  const CURRENT_SCRIPT_SRC = document.currentScript?.src || Array.from(document.querySelectorAll('script[src]'))
    .map((node) => node.getAttribute('src') || '')
    .find((src) => /browser-main\.js/i.test(src)) || '';
  const CURRENT_SCRIPT_URL = new URL(CURRENT_SCRIPT_SRC || './browser-main.js', window.location.href);
  const ASSET_VERSION = CURRENT_SCRIPT_URL.searchParams.get('v') || '';
  const TRAINER_MODULE_URL = (() => {
    const url = new URL('./toys/persona-trainer/browser.js', window.location.href);
    if (ASSET_VERSION) {
      url.searchParams.set('v', ASSET_VERSION);
    }
    return url.href;
  })();
  const PERSONA_GALLERY_MODULE_URL = (() => {
    const url = new URL('./toys/persona-gallery/model.js', window.location.href);
    if (ASSET_VERSION) {
      url.searchParams.set('v', ASSET_VERSION);
    }
    return url.href;
  })();
  const TEST_FLIGHT_SAMPLE_IDS = Object.freeze({
    A: 'performance-review-professional-message',
    B: 'performance-review-rushed-mobile'
  });
  const PRIVATE_EORFD_REPRESENTATIVE_ANCHORS = Object.freeze([
    'building-access-rushed-mobile',
    'customer-support-formal-record',
    'overwork-debrief-formal-record',
    'school-coordination-tangled-followup'
  ]);
  const SWAP_FLAGSHIP_PAIRS = Object.freeze((SWAP_CADENCE_FLAGSHIP_PAIRS || []).map((pair) => Object.freeze({
    sourceId: pair.sourceId,
    donorId: pair.donorId
  })));

  const $ = (id) => document.getElementById(id);
  const STORAGE_KEY = 'tcp.savedPersonas.v1';
  const LOCK_STORAGE_KEY = 'tcp.cadenceLocks.v1';
  const ACTIVE_LOCK_STORAGE_KEY = 'tcp.activeCadenceLock.v1';
  function createRuntimeStore() {
    const memory = new Map();
    return Object.freeze({
      mode: 'session-memory',
      isPersistent: false,
      getItem(key) {
        return memory.has(key) ? memory.get(key) : null;
      },
      setItem(key, value) {
        memory.set(key, String(value));
      },
      removeItem(key) {
        memory.delete(key);
      },
      clear() {
        memory.clear();
      }
    });
  }
  const runtimeStore = createRuntimeStore();
  const SLOT_LABELS = { A: 'Reference voice', B: 'Probe voice' };
  const SLOT_SHORT = { A: 'reference', B: 'probe' };
  const BADGE_LABELS = {
    'badge.holds': 'holds',
    'badge.branch': 'branch',
    'badge.buffer': 'buffer'
  };
  const GLYPH_LOOKUP = Object.freeze(Object.entries(glyphFieldTech.entries || {}).reduce((acc, [key, entry]) => {
    acc[key] = Object.freeze({
      ...entry,
      retrievalTags: Object.freeze([...(entry.retrievalTags || [])]),
      uiTargets: Object.freeze([...(entry.uiTargets || [])])
    });
    return acc;
  }, {}));
  const GLYPH_SUBSTRATE = Object.freeze({ ...(glyphFieldTech.substrateVocabulary || {}) });
  window.TCP_RUNTIME_STORE = runtimeStore;
  window.TCP_RUNTIME_RETENTION = Object.freeze({
    mode: runtimeStore.mode,
    persistent: runtimeStore.isPersistent
  });
  window.TCP_DIAGNOSTIC_ANNEXES = DIAGNOSTIC_ANNEXES;
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
      label: 'latent',
      cue: 'route latent',
      glyphKey: 'ingressMirrorLatent',
      glyph: '◫'
    },
    on: {
      value: 'on',
      label: 'clear',
      cue: 'route clear',
      glyphKey: 'ingressMirrorClear',
      glyph: '◧'
    }
  };
  const LEGACY_INGRESS_BADGE_OPTIONS = [
    { value: 'badge.holds', label: 'holds', cue: 'custody holds', glyph: '⟁' },
    { value: 'badge.buffer', label: 'buffer', cue: 'custody buffer', glyph: '⬒' },
    { value: 'badge.branch', label: 'branch', cue: 'candidate branch', glyph: '⟉' }
  ];
  const INGRESS_BADGE_OPTIONS = [
    { id: 'token-holds', value: 'badge.holds', label: 'holds', cue: 'custody holds', glyphKey: 'ingressBadgeHolds', glyph: '\u2606' },
    { id: 'token-buffer', value: 'badge.buffer', label: 'buffer', cue: 'custody buffer', glyphKey: 'ingressBadgeBuffer', glyph: '\u229E' },
    { id: 'token-branch', value: 'badge.branch', label: 'branch', cue: 'candidate branch', glyphKey: 'ingressBadgeBranch', glyph: '\u03BA' },
    { id: 'token-down', value: 'badge.holds', label: 'down hold', cue: 'custody grounds', glyphKey: 'ingressBadgeDown', glyph: '\u4E0B' },
    { id: 'token-tetragram', value: 'badge.buffer', label: 'pattern lattice', cue: 'pattern lattice', glyphKey: 'ingressBadgeTetragram', glyph: '\uD834\uDF0B' },
    { id: 'token-witness', value: 'badge.branch', label: 'witness branch', cue: 'witness branch', glyphKey: 'ingressBadgeWitness', glyph: '\uDBF5\uDE13' },
    { id: 'token-therefore', value: 'badge.buffer', label: 'therefore', cue: 'reasoned buffer', glyphKey: 'ingressBadgeTherefore', glyph: '\u2234' }
  ];
  const INGRESS_STAGES = ['containment', 'mirror', 'badge', 'seal'];
  const INGRESS_SEAL_NODE_GLYPHS = {
    ul: '\u25EB\u2301',
    ur: '\u27C9\u232C',
    bc: '\u25CE\u232D'
  };
  const INGRESS_SEAL_NODE_KEYS = {
    ul: 'ingressSealFlow',
    ur: 'ingressSealEmergence',
    bc: 'ingressSealReturn'
  };
  const ROUTE_STATUS_KEYS = Object.freeze({
    observing: 'observing',
    buffered: 'buffered',
    'awaiting pair': 'awaiting-pair',
    'safe-passage achieved': 'safe-passage-achieved'
  });
  const STATUS_CUE_KEYS = Object.freeze({
    none: '',
    shellDuelUpdated: 'shell-duel-updated'
  });
  const ARTIFACT_TABS = Object.freeze(['console', 'homebase', 'personas', 'readout', 'play', 'trainer']);
  const ARTIFACT_TAB_TO_HASH = Object.freeze({
    console: 'console',
    homebase: 'homebase',
    personas: 'personas',
    readout: 'readout',
    play: 'deck',
    trainer: 'trainer'
  });
  const HASH_TO_ARTIFACT_TAB = Object.freeze({
    console: 'console',
    homebase: 'homebase',
    personas: 'personas',
    readout: 'readout',
    deck: 'play',
    play: 'play',
    trainer: 'trainer'
  });
  const ARTIFACT_TAB_PANE_IDS = Object.freeze({
    console: 'viewPaneConsole',
    homebase: 'viewPaneHomebase',
    personas: 'viewPanePersonas',
    readout: 'viewPaneReadout',
    play: 'viewPanePlay',
    trainer: 'viewPaneTrainer'
  });
  const ARTIFACT_TAB_BUTTON_IDS = Object.freeze({
    console: 'tabConsole',
    homebase: 'tabHomebase',
    personas: 'tabPersonas',
    readout: 'tabReadout',
    play: 'tabPlay',
    trainer: 'tabTrainer'
  });
  const STATION_CHROME = Object.freeze({
    homebase: Object.freeze({
      title: 'TCP / Homebase',
      line: 'Homebase / anchor, contact, residue',
      lead: 'Lock a cadence home, bring a worn mask across, and read the passage room without losing the underlying runtime.'
    }),
    personas: Object.freeze({
      title: 'TCP / Personas',
      line: 'Personas / shelf, dossier, dispatch',
      lead: 'Choose on the shelf first. The selected mask stays collectible here until you carry it into Homebase or Deck.'
    }),
    readout: Object.freeze({
      title: 'TCP / Readout',
      line: 'Readout / witness, law, harbor',
      lead: 'This page stays colder than the rest of the site so similarity, traceability, route pressure, and harbor never collapse into one feeling.'
    }),
    play: Object.freeze({
      title: 'TCP / Deck',
      line: 'Deck / encounter, duel, aftermath',
      lead: 'Stage two voices, keep text swap separate from cadence swap, and inspect the duel aftermath without leaving the shared field.'
    }),
    trainer: Object.freeze({
      title: 'TCP / Trainer',
      line: 'Trainer / extract, forge, validate, inject',
      lead: 'Use the forge lane when the shelf needs a real draft, a retrieval contract, and a clean path back into Personas, Homebase, or Deck.'
    })
  });

  const TCP_GLYPH_SYSTEM = {
    substrateVocabulary: { ...GLYPH_SUBSTRATE },
    lookup(key) {
      const entry = GLYPH_LOOKUP[key];
      return entry
        ? {
            key,
            glyph: entry.glyph,
            semanticClass: entry.semanticClass,
            semioticRole: entry.semioticRole,
            activationState: entry.activationState,
            retrievalTags: [...entry.retrievalTags],
            uiTargets: [...entry.uiTargets],
            rationale: entry.rationale
          }
        : null;
    },
    locate(uiTarget) {
      return Object.keys(GLYPH_LOOKUP)
        .filter((key) => GLYPH_LOOKUP[key].uiTargets.includes(uiTarget))
        .map((key) => this.lookup(key));
    },
    keys() {
      return Object.keys(GLYPH_LOOKUP);
    }
  };

  function routeStatusKey(routeStatus = '') {
    const normalized = String(routeStatus || '')
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim();
    return ROUTE_STATUS_KEYS[normalized] || normalized.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  function retrievalFixtureIds() {
    return Object.keys(RETRIEVAL_FIXTURE_BUNDLE.cases || {});
  }

  function retrievalFixtureCase(caseId = '') {
    return (RETRIEVAL_FIXTURE_BUNDLE.cases || {})[caseId] || null;
  }

  window.TCP_GLYPH_SYSTEM = Object.freeze(TCP_GLYPH_SYSTEM);

  function resolveIngressMirrorTarget(value) {
    return Object.prototype.hasOwnProperty.call(INGRESS_MIRROR_OPTIONS, value) ? value : null;
  }

  function resolveIngressBadgeTarget(value) {
    if (!value) {
      return null;
    }
    const byId = INGRESS_BADGE_OPTIONS.find((option) => option.id === value);
    if (byId) {
      return byId.id;
    }
    const byValue = INGRESS_BADGE_OPTIONS.find((option) => option.value === value);
    return byValue ? byValue.id : null;
  }

  function normalizeArtifactTab(value = '') {
    const normalized = String(value || '').replace(/^#/, '').trim().toLowerCase();
    if (!normalized || normalized === 'console') {
      return 'homebase';
    }
    return HASH_TO_ARTIFACT_TAB[normalized] || 'homebase';
  }

  function artifactHashForTab(tab = 'homebase') {
    const normalized = ARTIFACT_TAB_TO_HASH[normalizeArtifactTab(tab)] || 'homebase';
    return `#${normalized}`;
  }

  function publicArtifactLabel(tab = 'homebase') {
    return {
      homebase: 'Homebase',
      personas: 'Personas',
      readout: 'Readout',
      play: 'Deck',
      trainer: 'Trainer'
    }[normalizeArtifactTab(tab)] || 'Homebase';
  }

  function resolveArtifactTabFromHash(hash = window.location.hash) {
    const cleaned = String(hash || '').trim();
    if (!cleaned) {
      return 'homebase';
    }
    return normalizeArtifactTab(cleaned);
  }

  function syncArtifactHash(tab, { replace = false } = {}) {
    const nextHash = artifactHashForTab(tab);
    if ((window.location.hash || '') === nextHash) {
      return;
    }
    const nextUrl = new URL(window.location.href);
    nextUrl.hash = nextHash;
    if (replace && window.history && typeof window.history.replaceState === 'function') {
      window.history.replaceState(null, '', nextUrl);
      return;
    }
    if (window.history && typeof window.history.pushState === 'function') {
      window.history.pushState(null, '', nextUrl);
      return;
    }
    window.location.hash = nextHash;
  }

  function applyStationChrome(tab = 'homebase') {
    const station = normalizeArtifactTab(tab);
    const chrome = STATION_CHROME[station] || STATION_CHROME.homebase;
    document.title = chrome.title;
    const heroStationLine = $('heroStationLine');
    const heroLead = $('heroLead');
    if (heroStationLine) {
      heroStationLine.textContent = chrome.line;
    }
    if (heroLead) {
      heroLead.textContent = chrome.lead;
    }
  }

  let badge = defaults.badge;
  let mirrorLogic = defaults.mirror_logic;
  let containment = defaults.containment;
  let activeVoice = 'A';
  let activeArtifactTab = resolveArtifactTabFromHash(window.location.hash);
  let analysisRevealed = false;
  let shellDuelPulseTimer = null;
  let swapButtonPulseTimer = null;
  let statusCueTimer = null;
  let lastSwapCadenceAudit = null;
  let baySampleIds = {
    A: defaults.voiceA_sample_id || null,
    B: defaults.voiceB_sample_id || null
  };
  let bayShells = {
    A: createNativeShell(),
    B: createNativeShell()
  };
  let personaGalleryModel = null;
  let resolvedBasePersonas = [];
  let savedPersonas = [];
  let cadenceLocks = [];
  let activeCadenceLockId = '';
  let stagedCadenceLock = null;
  let revealedCadenceLockKey = '';
  let readoutOwner = 'idle';
  let gallerySelectedMaskId = '';
  let homebaseWornMaskId = '';
  let trainerController = null;
  let ingress = createIngressState();

  applyStationChrome(activeArtifactTab);
  $('voiceA').value = defaults.voiceA;
  $('voiceB').value = defaults.voiceB;
  baySampleIds = {
    A: baySampleIds.A || inferSampleIdFromText(defaults.voiceA),
    B: baySampleIds.B || inferSampleIdFromText(defaults.voiceB)
  };
  applyStaticGlyphs();
  syncBaySampleMetadata();

  function formatPct(value) {
    return `${Math.round(value * 100)}%`;
  }

  function formatFixed(value, digits = 2) {
    return Number.isFinite(value) ? value.toFixed(digits) : '--';
  }

  function escapeHtml(value = '') {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function sampleEntry(sampleId = '') {
    return SAMPLE_LIBRARY_BY_ID[sampleId] || null;
  }

  function sampleProfileEntry(sample = null) {
    if (!sample) {
      return null;
    }
    return (sample.id && SAMPLE_PROFILE_BY_ID[sample.id]) || extractCadenceProfile(sample.text || '');
  }

  function buildSignatureEntry(text = '', profile = null) {
    const resolvedProfile = profile || extractCadenceProfile(text || '');
    return buildCadenceSignature(text || '', resolvedProfile);
  }

  function sampleSignatureEntry(sample = null) {
    if (!sample) {
      return null;
    }
    return (sample.id && SAMPLE_SIGNATURE_BY_ID[sample.id]) || buildSignatureEntry(sample.text || '', sampleProfileEntry(sample));
  }

  function signatureAxisDistance(signatureA = null, signatureB = null) {
    const axesA = Array.isArray(signatureA?.axes) ? signatureA.axes : [];
    const axesB = Array.isArray(signatureB?.axes) ? signatureB.axes : [];
    if (!axesA.length || !axesB.length) {
      return 0;
    }
    return Number(axesA.reduce((sum, axis, index) =>
      sum + Math.abs(Number(axis.normalized || 0) - Number(axesB[index]?.normalized || 0)),
    0).toFixed(4));
  }

  function heatmapDistanceScore(heatmapA = null, heatmapB = null) {
    const matrixA = Array.isArray(heatmapA?.matrix) ? heatmapA.matrix : [];
    const matrixB = Array.isArray(heatmapB?.matrix) ? heatmapB.matrix : [];
    if (!matrixA.length || !matrixB.length) {
      return 0;
    }
    let total = 0;
    for (let rowIndex = 0; rowIndex < Math.max(matrixA.length, matrixB.length); rowIndex += 1) {
      const rowA = Array.isArray(matrixA[rowIndex]) ? matrixA[rowIndex] : [];
      const rowB = Array.isArray(matrixB[rowIndex]) ? matrixB[rowIndex] : [];
      for (let colIndex = 0; colIndex < Math.max(rowA.length, rowB.length); colIndex += 1) {
        total += Math.abs(Number(rowA[colIndex] || 0) - Number(rowB[colIndex] || 0));
      }
    }
    return Number(total.toFixed(4));
  }

  function fieldSpreadScore(signatureA = null, signatureB = null) {
    if (!signatureA || !signatureB) {
      return 0;
    }
    const profileDelta = profileDistanceScore(signatureA.profile, signatureB.profile);
    const axisDelta = signatureAxisDistance(signatureA, signatureB);
    const heatmapDelta = heatmapDistanceScore(signatureA.heatmap, signatureB.heatmap);
    return Number((profileDelta + axisDelta + heatmapDelta).toFixed(4));
  }

  function humanizeToken(value = '') {
    return String(value || '')
      .split(/[-_]/g)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  function registerModeLabel(mode = '') {
    return humanizeToken(mode || 'unresolved');
  }

  function sampleFamilyLabel(sample = null) {
    return sample?.familyId ? humanizeToken(sample.familyId) : 'Ad hoc input';
  }

  function sampleVariantLabel(sample = null) {
    return sample?.variant ? humanizeToken(sample.variant) : 'Custom text';
  }

  function renderMetricChips(entries = [], containerClass = 'chips', itemClass = 'chip') {
    if (!entries.length) {
      return '';
    }
    return `
      <div class="${containerClass}">
        ${entries.map((entry) => `<span class="${itemClass}">${escapeHtml(entry.label)} ${escapeHtml(entry.value)}</span>`).join('')}
      </div>
    `;
  }

  function bayFingerprintEntries(profile = {}) {
    return [
      { label: 'Rhythm', value: `${formatFixed(profile.avgSentenceLength, 1)}w` },
      { label: 'Punct', value: formatPct(profile.punctuationDensity || 0) },
      { label: 'Contractions', value: formatPct(profile.contractionDensity || 0) },
      { label: 'Recurrence', value: formatPct(profile.recurrencePressure || 0) },
      { label: 'Directness', value: formatPct(profile.directness || 0) },
      { label: 'Abstraction', value: formatPct(profile.abstractionPosture || 0) },
      { label: 'Register', value: registerModeLabel(profile.registerMode) }
    ];
  }

  function personaFingerprintEntries(profile = {}) {
    return [
      { label: 'Rhythm', value: `${formatFixed(profile.avgSentenceLength, 1)}w` },
      { label: 'Sentence span', value: `${formatFixed(profile.sentenceLengthSpread || 0, 1)} spread` },
      { label: 'Recurrence', value: formatPct(profile.recurrencePressure || 0) },
      { label: 'Directness', value: formatPct(profile.directness || 0) },
      { label: 'Abstraction', value: formatPct(profile.abstractionPosture || 0) },
      { label: 'Register', value: registerModeLabel(profile.registerMode) }
    ];
  }

  function personaShelfChipLabels(profile = {}) {
    if (!profile || profile.empty) {
      return [];
    }
    return [
      `Register ${registerModeLabel(profile.registerMode)}`,
      `Rhythm ${formatFixed(profile.avgSentenceLength, 1)}w`,
      `Recurrence ${formatPct(profile.recurrencePressure || 0)}`
    ];
  }

  function baySampleProvenanceHtml(sample = null) {
    if (!sample) {
      return `
        <div class="bay-source">
          <div class="persona-kicker">Ad hoc input</div>
          <div class="bay-source-name">Live text without a diagnostics sample bind</div>
          <div class="bay-source-meta">Family // Ad hoc input | Variant // Custom text</div>
        </div>
      `;
    }

    return `
      <div class="bay-source">
        <div class="persona-kicker">Diagnostics sample</div>
        <div class="bay-source-name">${escapeHtml(sample.name || sample.id)}</div>
        <div class="bay-source-meta">Family // ${escapeHtml(sampleFamilyLabel(sample))} | Variant // ${escapeHtml(sampleVariantLabel(sample))}</div>
      </div>
    `;
  }

  function signedBias(value = 0) {
    const numeric = Number(value || 0);
    return `${numeric >= 0 ? '+' : ''}${numeric}`;
  }

  function overlayModLabel(mod = null) {
    if (!mod) {
      return 'native';
    }
    return `sent ${signedBias(mod.sent)} / cont ${signedBias(mod.cont)} / punc ${signedBias(mod.punc)}`;
  }

  function buildPersonaProvenanceLines(persona = {}) {
    const diagnosticSpecimen = persona.diagnosticSpecimen || null;
    const resolution = persona.recipeResolution || null;
    if (resolution && ((resolution.entries || []).length || (resolution.missingSampleIds || []).length)) {
      const sampleLine = (resolution.entries || []).length
        ? `Samples // ${(resolution.entries || []).map((entry) => `${entry.sampleName} [${entry.sampleId}] x${formatFixed(entry.weight, 2)}`).join(' | ')}`
        : 'Samples // unresolved';
      const missingLine = (resolution.missingSampleIds || []).length
        ? `Missing // ${(resolution.missingSampleIds || []).join(', ')}`
        : null;
      return [
        sampleLine,
        `Resolved strength // ${Math.round((resolution.strength || persona.strength || 0) * 100)}%`,
        `Overlay mod // ${overlayModLabel(resolution.overlayMod || persona.mod)}`,
        diagnosticSpecimen?.fieldSpanLine || null,
        diagnosticSpecimen?.contributorLine || null,
        missingLine
      ].filter(Boolean);
    }

    if (persona.source === 'saved') {
      return [
        'Samples // live cadence capture',
        `Resolved strength // ${Math.round((persona.strength || 0.82) * 100)}%`,
        `Overlay mod // ${overlayModLabel(persona.mod)}`
      ];
    }

    if (persona.source === 'trainer') {
      return [
        'Samples // trainer-forged shell',
        `Resolved strength // ${Math.round((persona.strength || 0.82) * 100)}%`,
        `Overlay mod // ${overlayModLabel(persona.mod)}`
      ];
    }

    return [
      'Samples // built-in field mask',
      `Resolved strength // ${Math.round((persona.strength || 0.84) * 100)}%`,
      `Overlay mod // ${overlayModLabel(persona.mod)}`
    ];
  }

  function profileDistanceScore(profileA = null, profileB = null) {
    if (!profileA || !profileB) {
      return 0;
    }
    const fit = compareTexts('', '', {
      profileA,
      profileB
    });
    return Number((
      (fit.sentenceDistance || 0) +
      (fit.spreadDistance || 0) +
      (fit.punctDistance || 0) +
      (fit.contractionDistance || 0) +
      (fit.recurrenceDistance || 0) +
      (fit.directnessDistance || 0) +
      (fit.abstractionDistance || 0) +
      (fit.registerDistance || 0)
    ).toFixed(4));
  }

  function inferSampleIdFromText(text = '') {
    const normalized = String(text || '').trim();
    return FULL_SAMPLE_LIBRARY.find((sample) => sample.text.trim() === normalized)?.id || null;
  }

  function slotTextId(slot) {
    return slot === 'A' ? 'voiceA' : 'voiceB';
  }

  function syncBaySampleMetadata() {
    ['A', 'B'].forEach((slot) => {
      const node = $(slotTextId(slot));
      const sample = sampleEntry(baySampleIds[slot]);
      if (!node) {
        return;
      }
      node.dataset.sampleId = sample ? sample.id : '';
      node.dataset.sampleName = sample ? sample.name : '';
    });
  }

  function randomSampleCandidates(slot) {
    const otherSlot = slot === 'A' ? 'B' : 'A';
    const otherId = baySampleIds[otherSlot];
    const ownId = baySampleIds[slot];
    let candidates = DECK_RANDOMIZER_SAMPLE_LIBRARY.filter((sample) => sample.id !== otherId && sample.id !== ownId);
    if (!candidates.length) {
      candidates = DECK_RANDOMIZER_SAMPLE_LIBRARY.filter((sample) => sample.id !== otherId);
    }
    if (!candidates.length) {
      candidates = DECK_RANDOMIZER_SAMPLE_LIBRARY.filter((sample) => sample.id !== ownId);
    }
    return candidates.length ? candidates : [...DECK_RANDOMIZER_SAMPLE_LIBRARY];
  }

  function testFlightSeedPair() {
    const sampleA = sampleEntry(TEST_FLIGHT_SAMPLE_IDS.A) || SAMPLE_LIBRARY[0] || null;
    const sampleB = sampleEntry(TEST_FLIGHT_SAMPLE_IDS.B) || SAMPLE_LIBRARY.find((sample) => sample.id !== sampleA?.id) || SAMPLE_LIBRARY[1] || null;
    return {
      voiceA: sampleA?.text || '',
      voiceB: sampleB?.text || ''
    };
  }

  function applyDeckSample(slot, sample) {
    if (!sample) {
      return;
    }

    clearSwapCadenceAudit();

    const textNode = $(slotTextId(slot));
    if (!textNode) {
      return;
    }

    const priorShell = bayShells[slot];
    const releasedBorrowedShell = Boolean(priorShell && priorShell.mode === 'borrowed');
    textNode.value = sample.text;
    baySampleIds[slot] = sample.id;
    if (releasedBorrowedShell) {
      bayShells[slot] = createNativeShell();
    }
    syncBaySampleMetadata();
    activeVoice = slot;
    collapseAnalysisDeck();
    renderVoiceProfiles();
    renderPersonas();
    updateControls();

    const otherSlot = slot === 'A' ? 'B' : 'A';
    const otherSample = sampleEntry(baySampleIds[otherSlot]);
    const pairNote = otherSample ? ` Cast against ${otherSample.name}.` : '';
    setStatusMessage(
      `${SLOT_LABELS[slot]} now carries ${sample.name}.${pairNote}${releasedBorrowedShell ? ' Borrowed shell cleared so the fresh sample starts native.' : ' The cast report is live; press Analyze Cadences when you want the duel awake.'}`
    );
  }

  function randomizeVoiceSample(slot) {
    if (!DECK_RANDOMIZER_SAMPLE_LIBRARY.length) {
      setStatusMessage('No sample library is loaded for the Cadence Desk yet.');
      return;
    }

    const candidates = randomizerSamplePool(slot, randomSampleCandidates(slot));
    const nextSample = candidates[Math.floor(Math.random() * candidates.length)] || null;
    applyDeckSample(slot, nextSample);
  }

  function glyphEntry(key) {
    return GLYPH_LOOKUP[key] || null;
  }

  function glyphChar(key, fallback = '') {
    return glyphEntry(key)?.glyph || fallback;
  }

  function glyphKeyForBadge(value) {
    const option = INGRESS_BADGE_OPTIONS.find((entry) => entry.id === value || entry.value === value);
    if (option?.glyphKey) {
      return option.glyphKey;
    }
    if (value === 'badge.branch') {
      return 'ingressBadgeBranch';
    }
    if (value === 'badge.buffer') {
      return 'ingressBadgeBuffer';
    }
    return 'ingressBadgeHolds';
  }

  function applyGlyphMetadata(node, key) {
    const entry = glyphEntry(key);
    if (!node || !entry) {
      return;
    }

    node.dataset.glyphKey = key;
    node.dataset.semanticClass = entry.semanticClass;
    node.dataset.semioticRole = entry.semioticRole;
    node.dataset.activationState = entry.activationState;
    node.dataset.retrievalTags = entry.retrievalTags.join('|');
    node.dataset.uiTargets = entry.uiTargets.join('|');
  }

  function setGlyphNode(node, key, fallback = '') {
    if (!node) {
      return;
    }

    const entry = glyphEntry(key);
    if (!entry) {
      node.textContent = fallback;
      return;
    }

    node.textContent = entry.glyph;
    applyGlyphMetadata(node, key);
  }

  function glyphSpanHtml(key, tone = 'glyph-cyan') {
    const entry = glyphEntry(key);
    if (!entry) {
      return '';
    }

    return `<span class="glyph ${tone}" aria-hidden="true" data-glyph-key="${key}" data-semantic-class="${escapeHtml(entry.semanticClass)}" data-semiotic-role="${escapeHtml(entry.semioticRole)}" data-activation-state="${escapeHtml(entry.activationState)}" data-retrieval-tags="${escapeHtml(entry.retrievalTags.join('|'))}" data-ui-targets="${escapeHtml(entry.uiTargets.join('|'))}">${escapeHtml(entry.glyph)}</span>`;
  }

  function applyStaticGlyphs(root = document) {
    root.querySelectorAll('[data-glyph-key]').forEach((node) => {
      const key = node.dataset.glyphKey;
      setGlyphNode(node, key, node.textContent || '');
    });
  }

  function randomChoice(list = []) {
    return list[Math.floor(Math.random() * list.length)];
  }

  function createIngressState() {
    const targetMirror = resolveIngressMirrorTarget(ingressMirrorOverride) || randomChoice(['off', 'on']);
    const targetBadgeId = resolveIngressBadgeTarget(ingressBadgeOverride) || randomChoice(INGRESS_BADGE_OPTIONS.map((option) => option.id));
    const targetBadge = ingressBadgeOption(targetBadgeId);
    return {
      enabled: ingressEnabled,
      phase: ingressEnabled ? 'booting' : 'complete',
      holding: null,
      holdStartedAt: 0,
      holdPointerId: null,
      currentMirror: null,
      currentBadge: null,
      currentBadgeToken: null,
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
        badge: targetBadge.value,
        badgeToken: targetBadge.id
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
      actionCue.dataset.cueKey = STATUS_CUE_KEYS.none;
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

  function revealShellDuel() {
    setArtifactTab('play');
    const duel = $('shellDuel');
    if (!duel || typeof duel.scrollIntoView !== 'function') {
      return;
    }

    try {
      duel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch {
      duel.scrollIntoView();
    }
  }

  /* legacy swap cue helpers removed
    const cueMessage = `${baseMessage} ↓ Shell Duel updated below.`;
    clearStatusCueTimer();
    setStatusMessage(cueMessage);
    pulseShellDuel();
    statusCueTimer = window.setTimeout(() => {
      if ($('analysisStatus').textContent === cueMessage) {
        setStatusMessage(baseMessage);
      }
      statusCueTimer = null;
    }, 1800);
  }

  function setSwapStatusMessageLegacyCue(baseMessage) {
    clearStatusCueTimer();
    setStatusMessage(baseMessage);
    const cue = $('analysisStatusCue');
    if (cue) {
      cue.textContent = 'â†“ Shell Duel updated below';
      cue.hidden = false;
    }
    pulseShellDuel();
    statusCueTimer = window.setTimeout(() => {
      if (cue) {
        cue.hidden = true;
        cue.textContent = '';
      }
      statusCueTimer = null;
    }, 1800);
  }
  */

  function setAnalysisRevealState(revealed) {
    analysisRevealed = revealed;
    document.body.dataset.analysisRevealed = revealed ? 'true' : 'false';
  }

  function collapseAnalysisDeck() {
    setAnalysisRevealState(false);
    renderIdleState();
    const shellDuel = $('shellDuel');
    if (shellDuel) {
      shellDuel.dataset.state = 'empty';
    }
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
      cue.dataset.cueKey = STATUS_CUE_KEYS.shellDuelUpdated;
    }
    pulseSwapCadenceButton();
    pulseShellDuel();
    statusCueTimer = window.setTimeout(() => {
      if (cue) {
        cue.hidden = true;
        cue.textContent = '';
        cue.dataset.cueKey = STATUS_CUE_KEYS.none;
      }
      statusCueTimer = null;
    }, 4500);
  }

  function ingressMirrorOption(value) {
    return INGRESS_MIRROR_OPTIONS[value] || INGRESS_MIRROR_OPTIONS.off;
  }

  function ingressBadgeOption(value) {
    return INGRESS_BADGE_OPTIONS.find((option) => option.id === value || option.value === value) || INGRESS_BADGE_OPTIONS[0];
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
    document.body.dataset.ingressTargetBadge = ingress.target.badgeToken || ingress.target.badge;
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
    overlay.dataset.targetBadge = ingress.target.badgeToken || ingress.target.badge;
    overlay.dataset.currentMirror = ingress.currentMirror || 'unset';
    overlay.dataset.currentBadge = ingress.currentBadgeToken || ingress.currentBadge || 'unset';
    if (shell) {
      shell.inert = ingress.phase !== 'complete';
      shell.setAttribute('aria-hidden', ingress.phase === 'complete' ? 'false' : 'true');
    }
    updateIngressStageRail();

    const mirrorTarget = ingressMirrorOption(ingress.target.mirrorLogic);
    const badgeTarget = ingressBadgeOption(ingress.target.badgeToken || ingress.target.badge);
    const currentBadge = ingress.currentBadgeToken ? ingressBadgeOption(ingress.currentBadgeToken) : null;
    const currentMirror = ingress.currentMirror ? ingressMirrorOption(ingress.currentMirror) : null;

    let phaseLabel = 'Protocol // membrane waking';
    let cueGlyphKey = 'ingressDefaultCue';
    let cueGlyph = '◌';
    let cueLabel = 'custody handshake unresolved';
    let cueCopy = 'Four gates. One valid posture.';
    let status = 'Wait for the first demand.';
    let coreLabel = 'Stand by';
    let coreGlyphKey = 'ingressSealClosure';
    let coreGlyph = '⟐';
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
    $('ingressMirrorArmed').innerHTML = `${glyphSpanHtml('ingressMirrorLatent', 'glyph-lime')} latent`;
    $('ingressMirrorOpen').innerHTML = `${glyphSpanHtml('ingressMirrorClear', 'glyph-cyan')} clear`;
    $('ingressBadgeReadout').innerHTML = currentBadge
      ? `token // ${glyphSpanHtml(glyphKeyForBadge(ingress.currentBadgeToken || ingress.currentBadge), 'glyph-lime')} ${escapeHtml(currentBadge.label)}`
      : 'token // unset';
    if (sealTrack) {
      sealTrack.dataset.active = ingress.phase === 'seal' ? 'true' : 'false';
      sealTrack.dataset.step = String(ingress.sealSequenceIndex || 0);
    }
    if (sealNodeWrap) {
      sealNodeWrap.hidden = ingress.phase !== 'seal';
    }

    if (ingress.phase === 'containment') {
      phaseLabel = 'Gate // containment';
      cueGlyphKey = 'ingressContainmentCue';
      cueGlyph = '◎';
      cueLabel = 'collapse the ring stack';
      cueCopy = 'The field admits only stable contact.';
      status = ingress.holding === 'containment'
        ? 'Do not break contact.'
        : 'Unbroken contact resolves the gate.';
      coreLabel = 'stabilize';
      coreGlyphKey = 'ingressContainmentCore';
      coreGlyph = '◎';
      coreEnabled = true;
    } else if (ingress.phase === 'mirror') {
      phaseLabel = 'Gate // mirror';
      cueGlyphKey = mirrorTarget.glyphKey || 'ingressMirrorLatent';
      cueGlyph = mirrorTarget.glyph;
      cueLabel = mirrorTarget.cue;
      cueCopy = 'One posture keeps the route latent. One clears it.';
      status = !ingress.currentMirror
        ? 'Choose the posture that satisfies the cue.'
        : ingress.currentMirror === ingress.target.mirrorLogic
          ? 'Mirror posture accepted.'
          : 'The membrane rejects that posture.';
      coreLabel = currentMirror ? currentMirror.cue : 'unresolved';
      coreGlyphKey = currentMirror ? currentMirror.glyphKey || 'ingressMirrorLatent' : mirrorTarget.glyphKey || 'ingressMirrorLatent';
      coreGlyph = currentMirror ? currentMirror.glyph : mirrorTarget.glyph;
      $('ingressMirrorControls').hidden = false;
    } else if (ingress.phase === 'badge') {
      phaseLabel = 'Gate // token';
      cueGlyphKey = badgeTarget.glyphKey || glyphKeyForBadge(ingress.target.badgeToken || ingress.target.badge);
      cueGlyph = badgeTarget.glyph;
      cueLabel = badgeTarget.cue;
      cueCopy = 'Advance the token until the mark holds.';
      status = !ingress.currentBadge
        ? 'Rotate the token until the cue resolves.'
        : ingress.currentBadgeToken === ingress.target.badgeToken
          ? 'Token accepted. Seal is now listening.'
          : 'The field does not accept that mark.';
      coreLabel = currentBadge ? currentBadge.label : 'token unset';
      coreGlyphKey = currentBadge ? glyphKeyForBadge(ingress.currentBadgeToken || ingress.currentBadge) : glyphKeyForBadge(ingress.target.badgeToken || ingress.target.badge);
      coreGlyph = currentBadge ? currentBadge.glyph : badgeTarget.glyph;
      $('ingressBadgeControls').hidden = false;
    } else if (ingress.phase === 'seal') {
      phaseLabel = 'Gate // seal';
      cueGlyphKey = 'ingressSealClosure';
      cueGlyph = '⟐';
      cueLabel = 'close the triad';
      cueCopy = `Resolved posture: ${mirrorTarget.cue} / ${badgeTarget.label} / containment stable. Seal the three points in clockwise order.`;
      status = ingress.sealRejectedNode
        ? 'That point does not close the triad. Touch the live point.'
        : 'Touch the next live point.';
      coreLabel = 'triad live';
      coreGlyphKey = 'ingressSealClosure';
      coreGlyph = '⟐';
      coreEnabled = false;
    } else if (ingress.phase === 'revealing') {
      phaseLabel = 'Reveal // handoff';
      cueGlyphKey = 'ingressReveal';
      cueGlyph = '⬡';
      cueLabel = 'membrane dissolving';
      cueCopy = 'The solved posture is crossing into the live deck.';
      status = 'Route handoff in progress.';
      coreLabel = 'opening';
      coreGlyphKey = 'ingressReveal';
      coreGlyph = '⬡';
    }

    $('ingressPhaseLabel').innerHTML = `<span class="glyph glyph-cyan" aria-hidden="true">⟒</span> ${phaseLabel}`;
    $('ingressCueGlyph').textContent = cueGlyph;
    $('ingressPhaseLabel').innerHTML = `${glyphSpanHtml('ingressPhasePrefix', 'glyph-cyan')} <span id="ingressPhaseText">${escapeHtml(phaseLabel)}</span>`;
    setGlyphNode($('ingressCueGlyph'), cueGlyphKey, cueGlyph);
    $('ingressCueLabel').textContent = cueLabel;
    $('ingressCueCopy').textContent = cueCopy;
    $('ingressStatus').textContent = status;
    $('ingressCoreLabel').textContent = coreLabel;
    $('ingressCoreGlyph').textContent = coreGlyph;
    setGlyphNode($('ingressCoreGlyph'), coreGlyphKey, coreGlyph);
    $('ingressCore').disabled = !coreEnabled;

    $('ingressMirrorArmed').dataset.selected = ingress.currentMirror === 'off';
    $('ingressMirrorOpen').dataset.selected = ingress.currentMirror === 'on';
    $('ingressMirrorArmed').dataset.feedback = ingress.currentMirror === 'off' ? (ingress.mirrorFeedback || 'idle') : 'idle';
    $('ingressMirrorOpen').dataset.feedback = ingress.currentMirror === 'on' ? (ingress.mirrorFeedback || 'idle') : 'idle';
    $('ingressMirrorArmed').disabled = ingress.phase !== 'mirror' || ingress.resolvingGate === 'mirror';
    $('ingressMirrorOpen').disabled = ingress.phase !== 'mirror' || ingress.resolvingGate === 'mirror';
    $('ingressBadgeCycle').dataset.ready = ingress.currentBadgeToken === ingress.target.badgeToken;
    $('ingressBadgeCycle').dataset.feedback = ingress.badgeFeedback || 'idle';
    $('ingressBadgeCycle').disabled = ingress.phase !== 'badge' || ingress.resolvingGate === 'badge';
    $('ingressBadgeReadout').dataset.feedback = ingress.badgeFeedback || 'idle';
    sealNodes.forEach(({ id, node }, index) => {
      if (!node) {
        return;
      }

      const glyphNode = node.querySelector('span[aria-hidden="true"]');
      if (glyphNode) {
        glyphNode.textContent = INGRESS_SEAL_NODE_GLYPHS[id] || '\u27D0';
        setGlyphNode(glyphNode, INGRESS_SEAL_NODE_KEYS[id], glyphNode.textContent);
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
    const currentIndex = INGRESS_BADGE_OPTIONS.findIndex((option) => option.id === ingress.currentBadgeToken);
    const nextOption = INGRESS_BADGE_OPTIONS[(currentIndex + 1 + INGRESS_BADGE_OPTIONS.length) % INGRESS_BADGE_OPTIONS.length];
    ingress.currentBadge = nextOption.value;
    ingress.currentBadgeToken = nextOption.id;
    if (ingress.currentBadgeToken === ingress.target.badgeToken) {
      ingress.resolvingGate = 'badge';
      ingress.badgeFeedback = 'accepted';
      renderIngress();
      setIngressPhase('seal');
      return;
    }

    renderIngress();
  }

  function defaultMaskScaffold(persona = {}) {
    if (persona.source === 'trainer') {
      return {
        maskVisualClass: 'trained-mask',
        maskArtLabel: 'trained shell',
        maskSigil: '##',
        maskState: 'unforged',
        family: 'Forged shell',
        tagline: 'Derived under retrieval law.',
        voicePromise: 'A trained shell carrying the pressure of a validated forge pass.',
        fieldUse: 'Use when you want a trainer-forged shell available in Homebase or Deck.',
        riskTell: 'Forge residue can still cling where validation left the strongest lanes intact.',
        frameTone: 'bruise-violet',
        collectorClass: 'trained',
        portrait: { src: '', alt: 'Forged shell portrait' }
      };
    }

    if (persona.source === 'saved') {
      return {
        maskVisualClass: 'captured-mask',
        maskArtLabel: 'captured shell',
        maskSigil: '::',
        maskState: 'unforged',
        family: 'Captured shell',
        tagline: 'Lifted from live cadence.',
        voicePromise: 'A captured shell carrying residue from saved live cadence.',
        fieldUse: 'Use when you want to replay a saved shell through Homebase or Deck.',
        riskTell: 'Captured residue often preserves the strongest visible lanes.',
        frameTone: 'ash',
        collectorClass: 'captured',
        portrait: { src: '', alt: 'Captured shell portrait' }
      };
    }

    return {
      maskVisualClass: 'field-mask',
      maskArtLabel: 'field mask',
      maskSigil: '[]',
      maskState: 'mask ready',
      family: 'Field mask',
      tagline: 'Unknown pressure. Unregistered surface.',
      voicePromise: 'A field mask with no registered portrait metadata yet.',
      fieldUse: 'Use to test pressure without a stronger registered cast identity.',
      riskTell: 'No explicit risk tell has been registered yet.',
      frameTone: 'cyan',
      collectorClass: 'built-in',
      portrait: { src: '', alt: 'Field mask portrait' }
    };
  }

  function normalizeStoredPersona(persona = {}) {
    const scaffold = defaultMaskScaffold(persona);
    const profile = persona.profile ? { ...persona.profile } : null;
    const normalizedMaskState = persona.maskState === 'generated' ? 'mask ready' : persona.maskState;
    return {
      ...persona,
      chips: Array.isArray(persona.chips) ? [...persona.chips] : [],
      mod: persona.mod ? { ...persona.mod } : (profile ? cadenceModFromProfile(profile) : null),
      profile,
      strength: Number(persona.strength || (persona.source === 'trainer' ? 0.82 : 0.78)),
      source: persona.source || 'saved',
      maskVisualClass: persona.maskVisualClass || scaffold.maskVisualClass,
      maskArtLabel: persona.maskArtLabel || scaffold.maskArtLabel,
      maskSigil: persona.maskSigil || scaffold.maskSigil,
      maskState: normalizedMaskState || scaffold.maskState,
      family: persona.family || scaffold.family,
      tagline: persona.tagline || scaffold.tagline,
      voicePromise: persona.voicePromise || scaffold.voicePromise,
      fieldUse: persona.fieldUse || scaffold.fieldUse,
      riskTell: persona.riskTell || scaffold.riskTell,
      frameTone: persona.frameTone || scaffold.frameTone,
      collectorClass: persona.collectorClass || scaffold.collectorClass,
      portrait: persona.portrait ? { ...persona.portrait } : { ...scaffold.portrait }
    };
  }

  function normalizeCadenceLock(lock = {}) {
    return {
      ...lock,
      samples: Array.isArray(lock.samples)
        ? lock.samples.map((sample, index) => ({
            id: sample.id || `sample-${index + 1}`,
            text: sample.text || '',
            profile: sample.profile ? { ...sample.profile } : extractCadenceProfile(sample.text || '')
          }))
        : [],
      profile: lock.profile ? { ...lock.profile } : null,
      fingerprint: lock.fingerprint ? JSON.parse(JSON.stringify(lock.fingerprint)) : {},
      stats: lock.stats ? { ...lock.stats } : {},
      selfSimilarity: lock.selfSimilarity ? { ...lock.selfSimilarity } : {},
      fingerprintSummary: lock.fingerprintSummary ? { ...lock.fingerprintSummary } : {},
      source: lock.source || 'gallery-lock'
    };
  }

  function loadSavedPersonas() {
    const payload = runtimeStore.getItem(STORAGE_KEY);
    if (!payload) {
      return [];
    }
    try {
      return JSON.parse(payload).map((persona) => normalizeStoredPersona(persona));
    } catch {
      runtimeStore.removeItem(STORAGE_KEY);
      return [];
    }
  }

  function persistSavedPersonas() {
    runtimeStore.setItem(STORAGE_KEY, JSON.stringify(savedPersonas));
  }

  function loadCadenceLocks() {
    const payload = runtimeStore.getItem(LOCK_STORAGE_KEY);
    if (!payload) {
      return [];
    }
    try {
      return JSON.parse(payload).map((lock) => normalizeCadenceLock(lock));
    } catch {
      runtimeStore.removeItem(LOCK_STORAGE_KEY);
      return [];
    }
  }

  function persistCadenceLocks() {
    runtimeStore.setItem(LOCK_STORAGE_KEY, JSON.stringify(cadenceLocks));
  }

  function loadActiveCadenceLockId() {
    return runtimeStore.getItem(ACTIVE_LOCK_STORAGE_KEY) || '';
  }

  function persistActiveCadenceLockId() {
    if (activeCadenceLockId) {
      runtimeStore.setItem(ACTIVE_LOCK_STORAGE_KEY, activeCadenceLockId);
    } else {
      runtimeStore.removeItem(ACTIVE_LOCK_STORAGE_KEY);
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

  function borrowedShellFromProfile(profile, fromSlot) {
    return {
      mode: 'borrowed',
      label: `borrowed ${SLOT_SHORT[fromSlot]} cadence`,
      mod: cadenceModFromProfile(profile),
      profile: { ...profile },
      personaId: null,
      source: 'swapped',
      fromSlot,
      strength: 0.82
    };
  }

  function swapCadenceScoreLane(result = {}, sourceText = '') {
    const semanticAudit = result.semanticAudit || {};
    const protectedAnchorIntegrity =
      result.protectedAnchorAudit?.protectedAnchorIntegrity ??
      semanticAudit.protectedAnchorIntegrity ??
      1;
    const nonPunctuationDimensions = (result.changedDimensions || []).filter((dimension) => dimension !== 'punctuation-shape');
    const accepted =
      result.transferClass !== 'rejected' &&
      result.text !== sourceText &&
      protectedAnchorIntegrity >= 1 &&
      (semanticAudit.propositionCoverage ?? 1) >= 0.85 &&
      (semanticAudit.actorCoverage ?? 1) >= 0.75 &&
      (semanticAudit.actionCoverage ?? 1) >= 0.75 &&
      (semanticAudit.objectCoverage ?? 1) >= 0.65 &&
      (semanticAudit.polarityMismatches ?? 0) <= 1 &&
      Boolean(result.visibleShift) &&
      Boolean(result.nonTrivialShift) &&
      nonPunctuationDimensions.length > 0;
    let score = 0;
    const changed = result.text !== sourceText;

    if (accepted) {
      score += result.transferClass === 'structural' ? 12 : 4;
    } else if (result.transferClass === 'rejected') {
      score -= 12;
    } else {
      score -= changed ? 6 : 10;
    }

    if (accepted && changed) {
      score += 3;
    }
    if (accepted && result.realizationTier === 'lexical-structural') {
      score += 4;
    }
    if (accepted && nonPunctuationDimensions.length >= 2) {
      score += 3;
    }
    if (accepted && (semanticAudit.propositionCoverage ?? 1) >= 0.9) {
      score += 2;
    }
    if (changed && !Boolean(result.nonTrivialShift)) {
      score -= 6;
    }
    if (changed && nonPunctuationDimensions.length === 0) {
      score -= 8;
    }
    if ((semanticAudit.polarityMismatches ?? 0) > 0) {
      score -= 4;
    }

    return score;
  }

  function evaluateSwapCadencePairing(referenceText = '', probeText = '') {
    if (!referenceText.trim() || !probeText.trim()) {
      return {
        score: 0,
        bilateralVisible: false,
        bilateralNonTrivial: false,
        engagedLaneCount: 0,
        rejectedLaneCount: 0,
        laneOutcomes: [],
        laneTransferClasses: [],
        minProtectedAnchorIntegrity: 1,
        minPropositionCoverage: 1
      };
    }

    const referenceProfile = extractCadenceProfile(referenceText);
    const probeProfile = extractCadenceProfile(probeText);
    const laneA = buildCadenceTransfer(referenceText, borrowedShellFromProfile(probeProfile, 'B'), { retrieval: true });
    const laneB = buildCadenceTransfer(probeText, borrowedShellFromProfile(referenceProfile, 'A'), { retrieval: true });
    const laneOutcomes = [
      laneA.borrowedShellOutcome || laneA.transferClass,
      laneB.borrowedShellOutcome || laneB.transferClass
    ];
    const laneAccepted = [
      swapCadenceScoreLane(laneA, referenceText) > 0,
      swapCadenceScoreLane(laneB, probeText) > 0
    ];
    const engagedLaneCount = laneAccepted.filter(Boolean).length;
    const rejectedLaneCount = laneOutcomes.filter((outcome) => outcome === 'rejected').length;
    const bilateralVisible = laneAccepted[0] && laneAccepted[1] && Boolean(laneA.visibleShift) && Boolean(laneB.visibleShift);
    const bilateralNonTrivial = laneAccepted[0] && laneAccepted[1] && Boolean(laneA.nonTrivialShift) && Boolean(laneB.nonTrivialShift);
    let score = swapCadenceScoreLane(laneA, referenceText) + swapCadenceScoreLane(laneB, probeText);

    if (bilateralVisible) {
      score += 8;
    }
    if (bilateralNonTrivial) {
      score += 8;
    }
    score += engagedLaneCount * 4;
    if (engagedLaneCount === 1) {
      score -= 6;
    }
    score -= rejectedLaneCount * 6;

    return {
      score,
      bilateralVisible,
      bilateralNonTrivial,
      engagedLaneCount,
      rejectedLaneCount,
      laneAccepted,
      laneOutcomes,
      laneTransferClasses: [laneA.transferClass, laneB.transferClass],
      minProtectedAnchorIntegrity: Math.min(
        laneA.protectedAnchorAudit?.protectedAnchorIntegrity ?? 1,
        laneB.protectedAnchorAudit?.protectedAnchorIntegrity ?? 1
      ),
      minPropositionCoverage: Math.min(
        laneA.semanticAudit?.propositionCoverage ?? 1,
        laneB.semanticAudit?.propositionCoverage ?? 1
      )
    };
  }

  function compareSwapCadencePairings(left = {}, right = {}) {
    return (
      Number(Boolean(right.bilateralNonTrivial)) - Number(Boolean(left.bilateralNonTrivial)) ||
      Number(Boolean(right.bilateralVisible)) - Number(Boolean(left.bilateralVisible)) ||
      Number(right.engagedLaneCount || 0) - Number(left.engagedLaneCount || 0) ||
      Number(left.rejectedLaneCount || 0) - Number(right.rejectedLaneCount || 0) ||
      Number(right.score || 0) - Number(left.score || 0) ||
      Number(right.minProtectedAnchorIntegrity ?? 1) - Number(left.minProtectedAnchorIntegrity ?? 1) ||
      Number(right.minPropositionCoverage ?? 1) - Number(left.minPropositionCoverage ?? 1)
    );
  }

  function evaluateRepresentativeSwapPair(referenceSample, probeSample) {
    const evaluation = evaluateSwapCadencePairing(referenceSample.text, probeSample.text);

    return {
      anchorId: referenceSample.id,
      candidateId: probeSample.id,
      ...evaluation
    };
  }

  function buildRepresentativeSwapSelections(sampleLibrary = DECK_RANDOMIZER_SAMPLE_LIBRARY, anchorIds = PRIVATE_EORFD_REPRESENTATIVE_ANCHORS) {
    const sampleById = Object.fromEntries(sampleLibrary.map((sample) => [sample.id, sample]));

    return anchorIds.map((anchorId) => {
      const anchor = sampleById[anchorId];
      if (!anchor) {
        return null;
      }

      let best = null;
      for (const candidate of sampleLibrary) {
        if (candidate.id === anchor.id) {
          continue;
        }
        const evaluation = evaluateRepresentativeSwapPair(anchor, candidate);
        if (
          !best ||
          compareSwapCadencePairings(evaluation, best) < 0 ||
          (compareSwapCadencePairings(evaluation, best) === 0 && candidate.id.localeCompare(best.candidateId) < 0)
        ) {
          best = evaluation;
        }
      }
      return best;
    }).filter(Boolean);
  }

  function summarizeRepresentativeSwapSelections(selections = []) {
    const count = selections.length;
    const bilateralVisibleCount = selections.filter((entry) => entry.bilateralVisible).length;
    const bilateralNonTrivialCount = selections.filter((entry) => entry.bilateralNonTrivial).length;

    return {
      count,
      bilateralVisibleCount,
      bilateralNonTrivialCount,
      bilateralVisibleRate: count ? Number((bilateralVisibleCount / count).toFixed(4)) : 0,
      bilateralNonTrivialRate: count ? Number((bilateralNonTrivialCount / count).toFixed(4)) : 0,
      averageScore: count ? Number((selections.reduce((sum, entry) => sum + Number(entry.score || 0), 0) / count).toFixed(2)) : 0,
      minProtectedAnchorIntegrity: count ? Number(Math.min(...selections.map((entry) => Number(entry.minProtectedAnchorIntegrity ?? 1))).toFixed(4)) : 1,
      minPropositionCoverage: count ? Number(Math.min(...selections.map((entry) => Number(entry.minPropositionCoverage ?? 1))).toFixed(4)) : 1,
      selections
    };
  }

  function buildPrivateSwapDoctrine(matrixReport) {
    const summary = matrixReport?.summary || {};
    const representativePairs = summarizeRepresentativeSwapSelections(buildRepresentativeSwapSelections());
    const caseCount = Math.max(summary.caseCount || 1, 1);
    const oneSidedRate = Number(((summary.oneSided || 0) / caseCount).toFixed(4));
    const donorPressureReal = (summary.bilateralEngaged || 0) >= 24 || (representativePairs.averageScore || 0) >= 12;
    const realizedPassageWeak = !summary.flagshipAllPassed || oneSidedRate >= 0.3;

    let state = 'playable';
    if (donorPressureReal && (!summary.flagshipAllPassed || oneSidedRate >= 0.18)) {
      state = 'warning';
    }
    if (donorPressureReal && realizedPassageWeak) {
      state = 'buffered';
    }
    if (state === 'buffered' && (representativePairs.bilateralNonTrivialRate || 0) < 0.5) {
      state = 'harbor-eligible';
    }

    return {
      state,
      blockedGenerativePassage: state === 'buffered' || state === 'harbor-eligible',
      donorPressure: donorPressureReal ? 'real' : 'latent',
      realizedPassage: realizedPassageWeak ? 'weak' : 'landing',
      matrix: {
        caseCount: summary.caseCount || 0,
        bilateralEngaged: summary.bilateralEngaged || 0,
        oneSided: summary.oneSided || 0,
        bothRejected: summary.bothRejected || 0,
        flagshipPassCount: summary.flagshipPassCount || 0,
        flagshipCaseCount: summary.flagshipCaseCount || 0,
        flagshipAllPassed: Boolean(summary.flagshipAllPassed),
        oneSidedRate
      },
      representativePairs
    };
  }

  function predictedSwapCadenceScore(referenceText = '', probeText = '') {
    return evaluateSwapCadencePairing(referenceText, probeText).score;
  }

  function randomizerEvaluationTier(evaluation = null) {
    if (!evaluation) {
      return 0;
    }
    if (evaluation.bilateralNonTrivial) {
      return 3;
    }
    if (evaluation.bilateralVisible) {
      return 2;
    }
    if ((evaluation.engagedLaneCount || 0) >= 1 && (evaluation.rejectedLaneCount || 0) === 0) {
      return 1;
    }
    return 0;
  }

  function randomizerCarriesLiveDuel(evaluation = null) {
    if (!evaluation) {
      return false;
    }
    if (evaluation.bilateralNonTrivial || evaluation.bilateralVisible) {
      return true;
    }
    return (evaluation.engagedLaneCount || 0) >= 1 && (evaluation.rejectedLaneCount || 0) === 0 && (evaluation.score || 0) > 0;
  }

  function randomizerSamplePool(slot, candidates = []) {
    const otherSlot = slot === 'A' ? 'B' : 'A';
    const ownText = $(slotTextId(slot))?.value || '';
    const otherText = $(slotTextId(otherSlot))?.value || '';
    if (!candidates.length) {
      return candidates;
    }

    const ownSample = sampleEntry(baySampleIds[slot]) || null;
    const otherSample = sampleEntry(baySampleIds[otherSlot]) || null;
    const diversityAnchorSample = ownSample || otherSample || null;
    const diversityAnchorSignature = diversityAnchorSample
      ? sampleSignatureEntry(diversityAnchorSample)
      : ownText.trim()
        ? buildSignatureEntry(ownText, extractCadenceProfile(ownText))
        : otherText.trim()
          ? buildSignatureEntry(otherText, extractCadenceProfile(otherText))
          : null;
    const bothBaysPopulated = Boolean(ownText.trim() && otherText.trim());
    const sameFamilyPairLoaded = Boolean(
      bothBaysPopulated &&
      ownSample &&
      otherSample &&
      ownSample.familyId &&
      ownSample.familyId === otherSample.familyId
    );

    const ranked = candidates.map((sample) => {
      const candidateProfile = sampleProfileEntry(sample);
      const candidateSignature = sampleSignatureEntry(sample);
      const evaluation = bothBaysPopulated
        ? evaluateSwapCadencePairing(
            slot === 'A' ? sample.text : otherText,
            slot === 'A' ? otherText : sample.text
          )
        : null;
      const profileDelta = profileDistanceScore(candidateProfile, diversityAnchorSignature?.profile);
      const axisDelta = signatureAxisDistance(candidateSignature, diversityAnchorSignature);
      const heatmapDelta = heatmapDistanceScore(candidateSignature?.heatmap, diversityAnchorSignature?.heatmap);
      const fieldDelta = fieldSpreadScore(candidateSignature, diversityAnchorSignature);
      return {
        sample,
        evaluation,
        diversity: {
          familyBonus: diversityAnchorSample && sample.familyId !== diversityAnchorSample.familyId ? 1 : 0,
          variantBonus: diversityAnchorSample && sample.variant !== diversityAnchorSample.variant ? 1 : 0,
          profileDelta,
          axisDelta,
          heatmapDelta,
          fieldDelta
        },
        profileDelta,
        axisDelta,
        heatmapDelta,
        fieldDelta,
        evaluationTier: randomizerEvaluationTier(evaluation)
      };
    });

    const sortByLiveDuelThenField = (left, right) => (
      Number(right.evaluationTier || 0) - Number(left.evaluationTier || 0) ||
      compareSwapCadencePairings(left.evaluation, right.evaluation) ||
      Number(right.fieldDelta || 0) - Number(left.fieldDelta || 0) ||
      Number(right.heatmapDelta || 0) - Number(left.heatmapDelta || 0) ||
      Number(right.axisDelta || 0) - Number(left.axisDelta || 0) ||
      Number(right.diversity.familyBonus || 0) - Number(left.diversity.familyBonus || 0) ||
      Number(right.diversity.variantBonus || 0) - Number(left.diversity.variantBonus || 0) ||
      Number(right.diversity.profileDelta || 0) - Number(left.diversity.profileDelta || 0) ||
      left.sample.id.localeCompare(right.sample.id)
    );
    const sortByFieldThenLiveDuel = (left, right) => (
      Number(right.fieldDelta || 0) - Number(left.fieldDelta || 0) ||
      Number(right.heatmapDelta || 0) - Number(left.heatmapDelta || 0) ||
      Number(right.axisDelta || 0) - Number(left.axisDelta || 0) ||
      Number(right.evaluationTier || 0) - Number(left.evaluationTier || 0) ||
      compareSwapCadencePairings(left.evaluation, right.evaluation) ||
      Number(right.diversity.familyBonus || 0) - Number(left.diversity.familyBonus || 0) ||
      Number(right.diversity.variantBonus || 0) - Number(left.diversity.variantBonus || 0) ||
      Number(right.diversity.profileDelta || 0) - Number(left.diversity.profileDelta || 0) ||
      left.sample.id.localeCompare(right.sample.id)
    );
    const liveCapable = ranked.filter((entry) => randomizerCarriesLiveDuel(entry.evaluation));

    if (bothBaysPopulated && otherSample?.familyId) {
      if (sameFamilyPairLoaded) {
        const pivotPool = ranked.filter((entry) => entry.sample.familyId !== otherSample.familyId);
        const livePivotPool = pivotPool.filter((entry) => randomizerCarriesLiveDuel(entry.evaluation));
        const selectedPivotPool = livePivotPool.length ? livePivotPool : pivotPool;
        return [...selectedPivotPool]
          .sort(sortByFieldThenLiveDuel)
          .slice(0, Math.min(DECK_RANDOMIZER_TOP_COUNT, selectedPivotPool.length))
          .map((entry) => entry.sample);
      }

      const sameFamilyLive = liveCapable.filter((entry) =>
        entry.sample.familyId === otherSample.familyId &&
        entry.sample.id !== otherSample.id
      );
      if (sameFamilyLive.length) {
        return [...sameFamilyLive]
          .sort(sortByLiveDuelThenField)
          .slice(0, Math.min(DECK_RANDOMIZER_TOP_COUNT, sameFamilyLive.length))
          .map((entry) => entry.sample);
      }

      const sameFamily = ranked.filter((entry) =>
        entry.sample.familyId === otherSample.familyId &&
        entry.sample.id !== otherSample.id
      );
      if (sameFamily.length) {
        return [...sameFamily]
          .sort(sortByLiveDuelThenField)
          .slice(0, Math.min(DECK_RANDOMIZER_TOP_COUNT, sameFamily.length))
          .map((entry) => entry.sample);
      }

      const livePool = liveCapable.length ? liveCapable : ranked;
      return [...livePool]
        .sort(sortByLiveDuelThenField)
        .slice(0, Math.min(DECK_RANDOMIZER_TOP_COUNT, livePool.length))
        .map((entry) => entry.sample);
    }

    const fieldPreferredIds = new Set(
      [...ranked]
        .sort((left, right) =>
          Number(right.fieldDelta || 0) - Number(left.fieldDelta || 0) ||
          Number(right.heatmapDelta || 0) - Number(left.heatmapDelta || 0) ||
          Number(right.axisDelta || 0) - Number(left.axisDelta || 0) ||
          left.sample.id.localeCompare(right.sample.id)
        )
        .slice(0, Math.min(DECK_RANDOMIZER_FIELD_POOL_COUNT, ranked.length))
        .map((entry) => entry.sample.id)
    );
    const pool = ranked.filter((entry) => fieldPreferredIds.has(entry.sample.id));

    const sorted = [...pool].sort(sortByFieldThenLiveDuel);

    return sorted.slice(0, Math.min(DECK_RANDOMIZER_TOP_COUNT, sorted.length)).map((entry) => entry.sample);
  }

  function inspectRandomizerPool(slot) {
    const candidates = randomSampleCandidates(slot);
    const preferred = randomizerSamplePool(slot, candidates);
    const preferredProfiles = preferred.map((sample) => sampleProfileEntry(sample));
    const preferredSignatures = preferred.map((sample) => sampleSignatureEntry(sample));
    const pairwiseProfileDeltas = [];
    const pairwiseFieldDeltas = [];
    for (let index = 0; index < preferredProfiles.length; index += 1) {
      for (let otherIndex = index + 1; otherIndex < preferredProfiles.length; otherIndex += 1) {
        pairwiseProfileDeltas.push(profileDistanceScore(preferredProfiles[index], preferredProfiles[otherIndex]));
        pairwiseFieldDeltas.push(fieldSpreadScore(preferredSignatures[index], preferredSignatures[otherIndex]));
      }
    }
    return {
      corpusSize: DECK_RANDOMIZER_SAMPLE_LIBRARY.length,
      candidateCount: candidates.length,
      preferredCount: preferred.length,
      preferredIds: preferred.map((sample) => sample.id),
      minPreferredProfileDelta: pairwiseProfileDeltas.length ? Math.min(...pairwiseProfileDeltas) : 0,
      maxPreferredProfileDelta: pairwiseProfileDeltas.length ? Math.max(...pairwiseProfileDeltas) : 0,
      averagePreferredProfileDelta: pairwiseProfileDeltas.length
        ? Number((pairwiseProfileDeltas.reduce((sum, value) => sum + value, 0) / pairwiseProfileDeltas.length).toFixed(4))
        : 0,
      minPreferredFieldDelta: pairwiseFieldDeltas.length ? Math.min(...pairwiseFieldDeltas) : 0,
      maxPreferredFieldDelta: pairwiseFieldDeltas.length ? Math.max(...pairwiseFieldDeltas) : 0,
      averagePreferredFieldDelta: pairwiseFieldDeltas.length
        ? Number((pairwiseFieldDeltas.reduce((sum, value) => sum + value, 0) / pairwiseFieldDeltas.length).toFixed(4))
        : 0
    };
  }

  function getPersonaLibrary() {
    return [...(resolvedBasePersonas.length ? resolvedBasePersonas : basePersonas), ...savedPersonas];
  }

  function findPersona(id) {
    return getPersonaLibrary().find((persona) => persona.id === id) || null;
  }

  function getActiveCadenceLock() {
    const activeLock = cadenceLocks.find((lock) => lock.id === activeCadenceLockId) || cadenceLocks[0] || null;
    if (activeLock && activeLock.id !== activeCadenceLockId) {
      activeCadenceLockId = activeLock.id;
      persistActiveCadenceLockId();
    }
    return activeLock;
  }

  function currentHomebaseLock() {
    return stagedCadenceLock || getActiveCadenceLock();
  }

  function homebaseLockKey(lock = null) {
    if (!lock) {
      return '';
    }
    if (stagedCadenceLock && lock.id === stagedCadenceLock.id) {
      return 'staged';
    }
    return lock.id || '';
  }

  function homebaseLockRevealed(lock = currentHomebaseLock()) {
    return Boolean(lock) && revealedCadenceLockKey === homebaseLockKey(lock);
  }

  function clearHomebaseReveal() {
    revealedCadenceLockKey = '';
  }

  function setHomebaseReveal(lock = currentHomebaseLock()) {
    revealedCadenceLockKey = homebaseLockKey(lock);
  }

  function getSelectedMask() {
    const library = getPersonaLibrary();
    return library.find((persona) => persona.id === gallerySelectedMaskId) || null;
  }

  function getHomebaseWornMask() {
    const library = getPersonaLibrary();
    return library.find((persona) => persona.id === homebaseWornMaskId) || null;
  }

  function buildSurfacePhaseMap({
    lock,
    revealed,
    selectedMask,
    wornMask,
    comparisonText,
    comparison,
    deckCastingSummary
  }) {
    const comparisonReady = Boolean(String(comparisonText || '').trim());
    const maskContactSummary = comparison?.contactSummary || null;
    const readoutWitnessMode = readoutOwner === 'homebase'
      ? (revealed ? 'solo-home-reveal' : 'homebase-latent')
      : (document.body.dataset.decision === 'criticality'
        ? 'criticality'
        : document.body.dataset.decision === 'passage'
          ? 'harbor'
          : 'observing');
    const trainerSnapshot = typeof trainerController?.snapshot === 'function' ? trainerController.snapshot() : null;
    const trainerForgeState = !trainerSnapshot || !trainerSnapshot.corpusReady
      ? 'latent'
      : trainerSnapshot.validationPass
        ? 'forge-ready'
        : trainerSnapshot.validationReady
          ? 'correcting'
          : trainerSnapshot.promptReady
            ? 'inspect'
            : 'extract';

    return {
      console: {
        surfaceRole: 'index',
        surfacePhase: readoutOwner === 'homebase'
          ? 'solo-home-reveal'
          : lastSwapCadenceAudit
            ? 'aftermath'
            : deckCastingSummary?.ready
              ? 'overview-hot'
              : 'overview-latent',
        cueGlyphKey: 'consoleIndex',
        cueTone: readoutOwner === 'homebase' || lastSwapCadenceAudit ? 'clear' : 'latent',
        statusGrammar: 'console-index'
      },
      homebase: {
        surfaceRole: 'anchor',
        surfacePhase: !lock
          ? 'latent'
          : !wornMask
            ? 'home-only'
            : !comparisonReady
              ? 'mask-worn'
              : comparison
                ? 'residue'
                : 'contact-staged',
        cueGlyphKey: revealed ? 'homebaseDossierReveal' : lock ? 'homebaseCadenceHome' : 'tabHomebase',
        cueTone: revealed ? 'cold' : lock ? 'warm' : 'latent',
        statusGrammar: !lock
          ? 'homebase-latent'
          : revealed
            ? 'homebase-revealed'
            : 'homebase-staged'
      },
      personas: {
        surfaceRole: 'shelf',
        surfacePhase: selectedMask
          ? 'chosen'
          : homebaseWornMaskId
            ? 'worn-elsewhere'
            : 'latent',
        cueGlyphKey: selectedMask ? 'personaChosen' : 'tabPersonas',
        cueTone: selectedMask ? 'warm' : 'latent',
        statusGrammar: selectedMask ? 'persona-preview' : 'persona-shelf'
      },
      readout: {
        surfaceRole: 'witness',
        surfacePhase: readoutWitnessMode,
        cueGlyphKey:
          readoutWitnessMode === 'solo-home-reveal'
            ? 'readoutSoloHomeReveal'
            : readoutWitnessMode === 'criticality'
              ? 'readoutCriticality'
              : readoutWitnessMode === 'harbor'
                ? 'readoutHarbor'
                : 'tabReadout',
        cueTone:
          readoutWitnessMode === 'criticality' || readoutWitnessMode === 'solo-home-reveal'
            ? 'cold'
            : readoutWitnessMode === 'harbor'
              ? 'clear'
              : 'latent',
        statusGrammar: readoutWitnessMode
      },
      deck: {
        surfaceRole: 'encounter',
        surfacePhase: lastSwapCadenceAudit
          ? 'aftermath'
          : document.body.dataset.bootStage === 'analyze-pair'
            ? 'duel-wake'
            : (deckCastingSummary?.ready ? 'casting' : 'latent'),
        cueGlyphKey: lastSwapCadenceAudit ? 'deckSwapAftermath' : deckCastingSummary?.ready ? 'deckCasting' : 'tabDeck',
        cueTone: lastSwapCadenceAudit ? 'warm' : deckCastingSummary?.ready ? 'play' : 'latent',
        statusGrammar: lastSwapCadenceAudit ? 'deck-aftermath' : deckCastingSummary?.ready ? 'deck-casting' : 'deck-latent'
      },
      trainer: {
        surfaceRole: 'forge',
        surfacePhase: trainerForgeState,
        cueGlyphKey:
          trainerForgeState === 'forge-ready'
            ? 'trainerForgeReady'
            : trainerForgeState === 'correcting'
              ? 'trainerCorrection'
              : trainerForgeState === 'inspect'
                ? 'trainerInspect'
                : trainerForgeState === 'extract'
                  ? 'trainerExtract'
                  : 'tabTrainer',
        cueTone: trainerForgeState === 'forge-ready' ? 'clear' : trainerForgeState === 'correcting' ? 'warm' : 'latent',
        statusGrammar: trainerForgeState
      },
      maskContactSummary
    };
  }

  function buildDeckCastingSummary(voiceStateA, voiceStateB) {
    if (!voiceStateA.hasText || !voiceStateB.hasText) {
      return {
        ready: false,
        contrast: 'awaiting both bays',
        branchHeat: 'latent',
        swapPromise: 'unresolved',
        line: 'Cast two voices to expose contrast, branch heat, and swap promise before the duel wakes.'
      };
    }

    const cmp = compareTexts(voiceStateA.text, voiceStateB.text, {
      profileA: voiceStateA.rawProfile,
      profileB: voiceStateB.rawProfile
    });
    const branch = branchDynamics({
      ...cmp,
      coherence: cadenceCoherence(cmp)
    });
    const contrast =
      cmp.similarity <= 0.42
        ? 'hard contrast'
        : cmp.similarity <= 0.58
          ? 'live contrast'
          : cmp.similarity <= 0.72
            ? 'close weave'
            : 'near lock';
    const branchHeat =
      branch.branchPressure >= 0.48
        ? 'hot branch'
        : branch.branchPressure >= 0.3
          ? 'warm branch'
          : 'cool branch';
    const swapPromise =
      cmp.traceability >= 0.68
        ? 'high swap promise'
        : cmp.traceability >= 0.48
          ? 'partial swap promise'
          : 'low swap promise';

    return {
      ready: true,
      contrast,
      branchHeat,
      swapPromise,
      line: `Cast report // ${contrast} // ${branchHeat} // ${swapPromise}`
    };
  }

  function buildPersonaGalleryState() {
    const savedLock = getActiveCadenceLock();
    const lock = currentHomebaseLock();
    const comparisonText = $('personaComparisonText') ? $('personaComparisonText').value : '';
    const selectedMask = getSelectedMask();
    const wornMask = getHomebaseWornMask();
    const revealed = homebaseLockRevealed(lock);
    const selectedMaskPreview = personaGalleryModel && comparisonText.trim() && selectedMask
      ? personaGalleryModel.buildMaskTransformationResult(window.TCP_ENGINE, {
          comparisonText,
          lock,
          persona: selectedMask
        })
      : null;
    const dossier = personaGalleryModel && lock && revealed
      ? personaGalleryModel.buildLockDossier(window.TCP_ENGINE, lock)
      : null;
    const comparison = personaGalleryModel && comparisonText.trim() && wornMask
      ? personaGalleryModel.buildMaskTransformationResult(window.TCP_ENGINE, {
          comparisonText,
          lock,
          persona: wornMask
        })
      : null;
    const selectedMaskSwatch = selectedMaskPreview?.swatch || '';
    const selectedMaskContact = selectedMaskPreview?.contactSummary || null;
    const selectedMaskEffect = selectedMaskPreview?.effectSummary || null;
    const voiceStateA = getVoiceState('A');
    const voiceStateB = getVoiceState('B');
    const deckCastingSummary = buildDeckCastingSummary(voiceStateA, voiceStateB);
    const fieldGrammar = buildSurfacePhaseMap({
      lock,
      revealed,
      selectedMask,
      wornMask,
      comparisonText,
      comparison,
      deckCastingSummary
    });

    return {
      library: getPersonaLibrary(),
      savedLock,
      lock,
      revealed,
      hasStagedLock: Boolean(stagedCadenceLock),
      dossier,
      comparisonText,
      selectedMask,
      wornMask,
      comparison,
      selectedMaskSwatch,
      selectedMaskContact,
      selectedMaskEffect,
      deckCastingSummary,
      fieldGrammar,
      galleryGroups: {
        builtIn: getPersonaLibrary().filter((persona) => persona.source === 'built-in'),
        captured: getPersonaLibrary().filter((persona) => persona.source === 'saved'),
        trained: getPersonaLibrary().filter((persona) => persona.source === 'trainer')
      }
    };
  }

  function getBayShell(slot) {
    return bayShells[slot] || createNativeShell();
  }

  function getVoiceState(slot) {
    const text = $(slot === 'A' ? 'voiceA' : 'voiceB').value;
    const rawProfile = extractCadenceProfile(text);
    const shell = getBayShell(slot);
    const transfer = buildCadenceTransfer(text, shell, { retrieval: true });
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
      transfer,
      transferTrace: transfer.retrievalTrace || null
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

     if (borrowedTransferSurfaceClose(transfer)) {
      return 'Transfer stayed surface-close to the source cadence.';
    }

    if (transfer.borrowedShellOutcome === 'structural' || transfer.transferClass === 'structural') {
      return shifted ? `Transfer moved ${shifted}.` : 'Transfer landed a structural cadence shift.';
    }

    if (transfer.borrowedShellOutcome === 'partial') {
      return shifted ? `Transfer held a retrieval-safe partial shell shift across ${shifted}.` : 'Transfer held a retrieval-safe partial shell shift.';
    }

    if ((transfer.changedDimensions || []).length || (transfer.lexemeSwaps || []).length) {
      return shifted ? `Transfer landed a partial shell shift across ${shifted}.` : 'Transfer landed a partial shell shift.';
    }

    return 'Transfer stayed close to the source cadence.';
  }

  function transferDonorProgress(transfer = {}) {
    if (transfer?.donorProgress?.eligible) {
      return transfer.donorProgress;
    }

    if (!transfer?.sourceProfile || !transfer?.targetProfile || !transfer?.outputProfile) {
      return {
        eligible: false,
        sourceDonorDistance: 0,
        outputDonorDistance: 0,
        donorImprovement: 0,
        donorImprovementRatio: 0,
        sourceOutputLexicalOverlap: 1
      };
    }

    const sourceFit = compareTexts('', '', {
      profileA: transfer.sourceProfile,
      profileB: transfer.targetProfile
    });
    const outputFit = compareTexts('', '', {
      profileA: transfer.outputProfile,
      profileB: transfer.targetProfile
    });
    const sourceOutputFit = compareTexts('', '', {
      profileA: transfer.sourceProfile,
      profileB: transfer.outputProfile
    });
    const sourceDonorDistance =
      (sourceFit.sentenceDistance || 0) +
      (sourceFit.functionWordDistance || 0) +
      (sourceFit.contractionDistance || 0) +
      (sourceFit.punctShapeDistance || 0) +
      (sourceFit.registerDistance || 0);
    const outputDonorDistance =
      (outputFit.sentenceDistance || 0) +
      (outputFit.functionWordDistance || 0) +
      (outputFit.contractionDistance || 0) +
      (outputFit.punctShapeDistance || 0) +
      (outputFit.registerDistance || 0);
    const donorImprovement = Math.max(0, sourceDonorDistance - outputDonorDistance);

    return {
      eligible: true,
      sourceDonorDistance,
      outputDonorDistance,
      donorImprovement,
      donorImprovementRatio: sourceDonorDistance > 0 ? donorImprovement / sourceDonorDistance : 0,
      sourceOutputLexicalOverlap: sourceOutputFit.lexicalOverlap ?? 1
    };
  }

  function borrowedTransferSurfaceClose(transfer = {}) {
    const donorProgress = transferDonorProgress(transfer);
    if (!donorProgress.eligible) {
      return false;
    }

    return (
      donorProgress.donorImprovement <= 0.1 ||
      donorProgress.donorImprovementRatio <= 0.08 ||
      (
        donorProgress.sourceOutputLexicalOverlap >= 0.88 &&
        donorProgress.donorImprovement < 0.42
      )
    );
  }

  function realizedTransferLabel(transfer = {}, hasEffectiveTextShift = false) {
    const percent = realizedTransferPercent(transfer, hasEffectiveTextShift);
    if (percent === 0) {
      return 'no transfer';
    }
    if (borrowedTransferSurfaceClose(transfer) || percent <= 18) {
      return 'surface-close';
    }
    if (percent <= 38) {
      return 'weak';
    }
    if (percent <= 68) {
      return 'partial';
    }
    return 'structural';
  }

  function classifySwapPairFromLanes(laneA, laneB) {
    const engagedA = ['structural', 'partial'].includes(laneA.borrowedShellOutcome);
    const engagedB = ['structural', 'partial'].includes(laneB.borrowedShellOutcome);

    if (laneA.borrowedShellOutcome === 'rejected' && laneB.borrowedShellOutcome === 'rejected') {
      return 'both-rejected';
    }

    if (laneA.surfaceClose && laneB.surfaceClose) {
      return 'surface-close';
    }

    if (engagedA && engagedB) {
      return 'bilateral-engaged';
    }

    if (!laneA.nonTrivialShift && !laneB.nonTrivialShift) {
      return 'surface-close';
    }

    return 'one-sided';
  }

  function summarizeTransferLane(voiceState) {
    const transfer = voiceState?.transfer || {};
    const trace = voiceState?.transferTrace || transfer.retrievalTrace || {};
    const semanticAudit = trace.semanticAudit || transfer.semanticAudit || {};
    const notes = [...new Set(transfer.notes || [])];

    return {
      slot: voiceState?.slot || '',
      hasText: Boolean(voiceState?.hasText),
      visibleShift: Boolean(voiceState?.hasEffectiveTextShift),
      nonTrivialShift: Boolean(transfer.nonTrivialShift),
      transferClass: transfer.transferClass || 'native',
      borrowedShellOutcome: transfer.borrowedShellOutcome || (transfer.transferClass === 'rejected' ? 'rejected' : voiceState?.shell?.mode === 'borrowed' ? 'subtle' : null),
      borrowedShellFailureClass: transfer.borrowedShellFailureClass || null,
      realizationTier: transfer.realizationTier || 'none',
      changedDimensions: [...new Set(transfer.changedDimensions || [])],
      lexemeSwapFamilies: [...new Set((transfer.lexemeSwaps || []).map((swap) => swap.family))],
      rescuePasses: [...new Set(transfer.rescuePasses || [])],
      donorProgress: transferDonorProgress(transfer),
      surfaceClose: borrowedTransferSurfaceClose(transfer),
      propositionCoverage: semanticAudit.propositionCoverage ?? 1,
      actorCoverage: semanticAudit.actorCoverage ?? 1,
      actionCoverage: semanticAudit.actionCoverage ?? 1,
      objectCoverage: semanticAudit.objectCoverage ?? 1,
      polarityMismatches: semanticAudit.polarityMismatches ?? 0,
      tenseMismatches: semanticAudit.tenseMismatches ?? 0,
      protectedAnchorIntegrity: transfer.protectedAnchorAudit?.protectedAnchorIntegrity ?? semanticAudit.protectedAnchorIntegrity ?? 1,
      semanticRisk: transfer.semanticRisk ?? 0,
      partialFallback: transfer.borrowedShellOutcome === 'partial',
      notes
    };
  }

  function realizedTransferPercent(transfer = {}, hasEffectiveTextShift = false) {
    if (!transfer || transfer.transferClass === 'native' || transfer.transferClass === 'rejected') {
      return 0;
    }

    if (borrowedTransferSurfaceClose(transfer)) {
      return 8;
    }

    const semanticAudit = transfer.retrievalTrace?.semanticAudit || transfer.semanticAudit || {};
    const protectedAnchorIntegrity =
      transfer.protectedAnchorAudit?.protectedAnchorIntegrity ??
      semanticAudit.protectedAnchorIntegrity ??
      1;
    const donorProgress = transferDonorProgress(transfer);
    const changedDimensions = [...new Set(transfer.changedDimensions || [])];
    const nonPunctuationDimensions = changedDimensions.filter((dimension) => dimension !== 'punctuation-shape');
    const surfaceDimensions = nonPunctuationDimensions.filter((dimension) => [
      'abbreviation-posture',
      'orthography-posture',
      'fragment-posture',
      'conversation-posture',
      'surface-marker-posture',
      'contraction-posture'
    ].includes(dimension));
    const structuralDimensions = nonPunctuationDimensions.filter((dimension) => [
      'sentence-mean',
      'sentence-count',
      'sentence-spread',
      'connector-stance',
      'directness',
      'abstraction-posture',
      'lexical-register'
    ].includes(dimension));
    const lexicalShiftCount = Math.min((transfer.lexemeSwaps || []).length, 3);
    let score = 0;

    score += Math.min(30, Math.round((donorProgress.donorImprovementRatio || 0) * 92));
    score += Math.min(16, Math.round(Math.max(0, donorProgress.donorImprovement || 0) * 7));

    if (hasEffectiveTextShift && transfer.visibleShift) {
      score += 4;
    }
    if (transfer.visibleShift && donorProgress.donorImprovementRatio >= 0.1) {
      score += 4;
    }
    if (transfer.nonTrivialShift && donorProgress.donorImprovementRatio >= 0.12) {
      score += 5;
    }

    score += Math.min(structuralDimensions.length, 4) * 4;
    score += Math.min(surfaceDimensions.length, 4) * 5;
    score += lexicalShiftCount * 3;

    if (transfer.transferClass === 'structural') {
      score += 6;
    } else if (transfer.borrowedShellOutcome === 'partial' || transfer.transferClass === 'weak') {
      score += 3;
    }

    if (transfer.realizationTier === 'lexical-structural') {
      score += 4;
    } else if (transfer.realizationTier === 'structural') {
      score += 2;
    }

    if (!nonPunctuationDimensions.length && lexicalShiftCount === 0) {
      score = Math.min(score, changedDimensions.includes('punctuation-shape') ? 8 : 4);
    }

    if ((donorProgress.donorImprovementRatio || 0) < 0.14) {
      score = Math.min(score, 18);
    }

    if (
      (donorProgress.sourceOutputLexicalOverlap ?? 1) >= 0.9 &&
      surfaceDimensions.length < 3 &&
      lexicalShiftCount === 0
    ) {
      score = Math.min(score, 24);
    } else if (
      (donorProgress.sourceOutputLexicalOverlap ?? 1) >= 0.88 &&
      surfaceDimensions.length < 2 &&
      structuralDimensions.length < 3
    ) {
      score = Math.min(score, 32);
    }

    if ((donorProgress.sourceOutputLexicalOverlap ?? 1) >= 0.82) {
      score -= Math.round(((donorProgress.sourceOutputLexicalOverlap ?? 1) - 0.82) * 72);
    }

    if ((semanticAudit.propositionCoverage ?? 1) < 0.9) {
      score -= 12;
    }
    if ((semanticAudit.actionCoverage ?? 1) < 0.75) {
      score -= 8;
    }
    if ((semanticAudit.objectCoverage ?? 1) < 0.65) {
      score -= 6;
    }
    if ((semanticAudit.polarityMismatches ?? 0) > 0) {
      score -= 10;
    }
    if (protectedAnchorIntegrity < 1) {
      score -= 20;
    }
    if ((transfer.semanticRisk ?? 0) >= 0.4) {
      score -= 10;
    }

    const overlapCap = Math.round(Math.max(0, 1 - (donorProgress.sourceOutputLexicalOverlap ?? 1)) * 120) +
      Math.min(12, surfaceDimensions.length * 3) +
      Math.min(10, structuralDimensions.length * 2);
    score = Math.min(score, Math.max(8, overlapCap));

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  function buildSwapCadenceAudit(beforeSnapshot, afterSnapshot, voiceStateA, voiceStateB) {
    const laneA = summarizeTransferLane(voiceStateA);
    const laneB = summarizeTransferLane(voiceStateB);
    const classification = classifySwapPairFromLanes(laneA, laneB);
    const rejectedSlots = [laneA, laneB]
      .filter((lane) => lane.borrowedShellOutcome === 'rejected')
      .map((lane) => lane.slot);
    const partialFallbackSlots = [laneA, laneB]
      .filter((lane) => lane.partialFallback)
      .map((lane) => lane.slot);
    const failureFamilyTags = [...new Set([
      ['structural', 'partial'].includes(laneA.borrowedShellOutcome) ? null : laneA.borrowedShellFailureClass,
      ['structural', 'partial'].includes(laneB.borrowedShellOutcome) ? null : laneB.borrowedShellFailureClass
    ].filter(Boolean))];
    const visibleTextShift =
      laneA.visibleShift ||
      laneB.visibleShift ||
      beforeSnapshot.duelReferenceSample !== afterSnapshot.duelReferenceSample ||
      beforeSnapshot.duelProbeSample !== afterSnapshot.duelProbeSample;

    return {
      classification,
      visibleTextShift,
      bothRejected: classification === 'both-rejected',
      oneSided: classification === 'one-sided',
      surfaceClose: classification === 'surface-close',
      bilateralEngaged: classification === 'bilateral-engaged',
      rejectedSlots,
      partialFallbackSlots,
      failureFamilyTags,
      similarityChanged: beforeSnapshot.similarity !== afterSnapshot.similarity,
      routeChanged: beforeSnapshot.routePressure !== afterSnapshot.routePressure,
      lanes: {
        A: laneA,
        B: laneB
      }
    };
  }

  function clearSwapCadenceAudit() {
    lastSwapCadenceAudit = null;
  }

  function describeSwapCadenceAudit(audit, beforeSnapshot, afterSnapshot) {
    const similarityDelta = `${beforeSnapshot.similarity} -> ${afterSnapshot.similarity}`;
    const routeDelta = `${beforeSnapshot.routePressure} -> ${afterSnapshot.routePressure}`;
    const slotLabel = (slot) => SLOT_SHORT[slot] || slot;

    if (audit.classification === 'both-rejected') {
      const failureTags = audit.failureFamilyTags.length ? ` Failure family: ${audit.failureFamilyTags.join(', ')}.` : '';
      return `Cadence shells swapped, but both bays stayed on source text. The retrieval gate blocked this pair, so similarity ${similarityDelta} and route ${routeDelta} held near-source.${failureTags}`;
    }

    if (audit.classification === 'one-sided') {
      const stalledSlot = audit.rejectedSlots[0] || (audit.lanes.A.borrowedShellOutcome === 'subtle' ? 'A' : 'B');
      const stalled = slotLabel(stalledSlot);
      const live = slotLabel(stalledSlot === 'A' ? 'B' : 'A');
      const failureTags = audit.failureFamilyTags.length ? ` Failure family: ${audit.failureFamilyTags.join(', ')}.` : '';
      return `Cadence shells swapped one-sided. The ${live} bay moved, but the ${stalled} bay stayed on source text after the retrieval gate blocked donor realization. Similarity ${similarityDelta}; route ${routeDelta}.${failureTags}`;
    }

    if (audit.classification === 'surface-close') {
      const failureTags = audit.failureFamilyTags.length ? ` Failure family: ${audit.failureFamilyTags.join(', ')}.` : '';
      return `Cadence shells swapped, but the pair stayed surface-close after the retrieval pass. Similarity ${similarityDelta}; route ${routeDelta}.${failureTags}`;
    }

    if (audit.partialFallbackSlots.length && audit.classification === 'bilateral-engaged') {
      const slots = audit.partialFallbackSlots.map(slotLabel).join(' + ');
      return `Cadence shells swapped. ${slots} held a retrieval-safe partial shell shift instead of collapsing back to native text. Similarity ${similarityDelta}; route ${routeDelta}.`;
    }

    return `Cadence shells swapped. Each bay kept its own raw text and took the other bay's shell. Similarity ${similarityDelta}; route ${routeDelta}.`;
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
      return `Profile shell reads ${realizedTransferPercent(transfer, voiceState.hasEffectiveTextShift)}% ${realizedTransferLabel(transfer, voiceState.hasEffectiveTextShift)} transfer. ${transferSummary} ${literalNote}`.trim();
    }

    return `Applied shell bias: sent ${voiceState.shell.mod.sent >= 0 ? '+' : ''}${voiceState.shell.mod.sent}, cont ${voiceState.shell.mod.cont >= 0 ? '+' : ''}${voiceState.shell.mod.cont}, punc ${voiceState.shell.mod.punc >= 0 ? '+' : ''}${voiceState.shell.mod.punc}.`;
  }

  function shellStrengthCopy(shell, transfer = {}, hasEffectiveTextShift = false) {
    if (!shell || shell.mode === 'native') {
      return 'native shell';
    }

    return `${realizedTransferPercent(transfer, hasEffectiveTextShift)}% ${realizedTransferLabel(transfer, hasEffectiveTextShift)}`;
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
      <div class="duel-heatmap-copy">Sentence length × punctuation load</div>
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
            <div class="section-kicker">${glyphSpanHtml('sectionShellDuel', 'glyph-cyan')} ${side.title}</div>
            <div class="duel-shell-name">${escapeHtml(side.shell.label)}</div>
          </div>
          <div class="duel-shell-strength">${shellStrengthCopy(side.shell, side.transfer, side.hasEffectiveTextShift)}</div>
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
          <div class="section-kicker">${glyphSpanHtml('sectionDeltaStrip', 'glyph-cyan')} Delta strip</div>
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
    const sample = sampleEntry(baySampleIds[voiceState.slot]);

    panel.innerHTML = `
      <div class="bay-shell-row">
        <span class="bay-shell">${activeVoice === voiceState.slot ? 'Active bay' : 'Cadence bay'}</span>
        <span class="bay-shell">${describeCadenceShell(voiceState.shell)}</span>
      </div>
      ${baySampleProvenanceHtml(sample)}
      ${renderMetricChips(bayFingerprintEntries(profile), 'bay-metrics', 'bay-metric')}
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

  function personaSourceLabel(persona = {}) {
    if (persona.source === 'saved') {
      return 'captured shell';
    }
    if (persona.source === 'trainer') {
      return 'trained shell';
    }
    return 'built-in field mask';
  }

  function personaMaskStateLabel(persona = {}) {
    const normalized = persona.maskState === 'generated' ? 'mask ready' : persona.maskState;
    return normalized || (persona.source === 'built-in' ? 'mask ready' : 'unforged');
  }

  function personaStateKicker(persona = {}) {
    const assignment = personaAssignmentLabel(persona.id);
    return assignment === 'Assign shell' ? 'Unassigned' : assignment;
  }

  function personaFamilyLabel(persona = {}) {
    return persona.family || persona.maskArtLabel || 'Field mask';
  }

  function personaTagline(persona = {}) {
    return persona.tagline || persona.blurb || 'Unregistered mask surface.';
  }

  function personaVoicePromise(persona = {}) {
    return persona.voicePromise || persona.blurb || 'This mask has no registered voice promise yet.';
  }

  function personaFieldUse(persona = {}) {
    return persona.fieldUse || 'Use in Homebase or Deck when you want to test its pull.';
  }

  function personaRiskTell(persona = {}) {
    return persona.riskTell || 'No explicit risk tell has been registered yet.';
  }

  function personaCollectorClass(persona = {}) {
    return persona.collectorClass || (persona.source === 'trainer' ? 'trained' : persona.source === 'saved' ? 'captured' : 'built-in');
  }

  function personaToneClass(persona = {}) {
    return `tone-${persona.frameTone || 'cyan'}`;
  }

  function renderPersonaPortrait(persona = {}, { loading = 'lazy', active = false } = {}) {
    const portrait = persona.portrait || {};
    const hasImage = Boolean(portrait.src);
    const toneClass = personaToneClass(persona);
    const family = personaFamilyLabel(persona);
    return `
      <div class="persona-mask-portrait ${escapeHtml(persona.maskVisualClass || 'field-mask')} ${escapeHtml(toneClass)} ${active ? 'is-active' : ''}" data-mask-state="${escapeHtml(personaMaskStateLabel(persona))}" data-collector-class="${escapeHtml(personaCollectorClass(persona))}">
        ${hasImage ? `<img class="persona-mask-image" src="${escapeHtml(portrait.src)}" alt="${escapeHtml(portrait.alt || `${persona.name || 'Mask'} portrait`)}" loading="${escapeHtml(loading)}" decoding="async">` : ''}
        <span class="persona-mask-shade" aria-hidden="true"></span>
        <span class="persona-mask-noise" aria-hidden="true"></span>
        <div class="persona-mask-meta">
          <span class="persona-mask-family">${escapeHtml(family)}</span>
          <span class="persona-mask-state">${escapeHtml(personaMaskStateLabel(persona))}</span>
        </div>
        <div class="persona-mask-plate">
          <span class="persona-mask-sigil">${escapeHtml(persona.maskSigil || '[]')}</span>
          <span class="persona-mask-label">${escapeHtml(persona.maskArtLabel || 'field mask')}</span>
        </div>
      </div>
    `;
  }

  function createdAtLabel(value = '') {
    if (!value) {
      return '';
    }
    try {
      return new Date(value).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      });
    } catch {
      return value;
    }
  }

  function comparisonMetricSummary(summary = null) {
    if (!summary) {
      return '--';
    }
    return `${formatPct(summary.meanSimilarity || 0)} sim // ${formatPct(summary.meanTraceability || 0)} trace`;
  }

  function applySurfaceFieldGrammar(node, summary = null) {
    if (!node) {
      return;
    }
    node.dataset.surfaceRole = summary?.surfaceRole || '';
    node.dataset.surfacePhase = summary?.surfacePhase || '';
    node.dataset.cueGlyphKey = summary?.cueGlyphKey || '';
    node.dataset.cueTone = summary?.cueTone || '';
    node.dataset.statusGrammar = summary?.statusGrammar || '';
  }

  function maskRouteState(state) {
    if (state.comparison?.contactSummary) {
      return 'residue';
    }
    if (state.wornMask && String(state.comparisonText || '').trim()) {
      return 'contact';
    }
    if (state.wornMask) {
      return 'worn';
    }
    if (state.selectedMask) {
      return 'chosen';
    }
    return 'latent';
  }

  function maskFieldEffectLabel(fieldEffect = '') {
    switch (fieldEffect) {
      case 'both':
        return 'proximity + surface texture moved';
      case 'proximity':
        return 'home distance moved';
      case 'surface-texture':
        return 'surface texture moved';
      case 'neither':
        return 'contact held near home';
      default:
        return 'contact staging';
    }
  }

  function renderHomebaseWornMask(state) {
    const stage = $('homebaseWornMaskStage');
    const route = $('homebaseMaskRoute');
    const body = $('homebaseWornMask');
    if (!stage || !route || !body) {
      return;
    }

    const routeState = maskRouteState(state);
    stage.dataset.maskPhase = routeState;
    route.querySelectorAll('[data-step]').forEach((chip) => {
      const step = chip.dataset.step;
      const active =
        (step === 'chosen' && ['chosen', 'worn', 'contact', 'residue'].includes(routeState)) ||
        (step === 'worn' && ['worn', 'contact', 'residue'].includes(routeState)) ||
        (step === 'contact' && ['contact', 'residue'].includes(routeState)) ||
        (step === 'residue' && routeState === 'residue');
      chip.dataset.active = active ? 'true' : 'false';
    });

    if (!state.wornMask) {
      const shelfLine = state.selectedMask
        ? `${state.selectedMask.name} is chosen on the shelf, but not yet worn in Homebase.`
        : 'No mask is being worn in Homebase yet.';
      body.innerHTML = `
        <div class="homebase-worn-mask-empty">
          <div class="persona-kicker">${escapeHtml(routeState === 'chosen' ? 'chosen on shelf' : 'no mask worn')}</div>
          <h3>${escapeHtml(routeState === 'chosen' ? state.selectedMask.name : 'Bring one in from Personas')}</h3>
          <p class="persona-empty">${escapeHtml(shelfLine)}</p>
        </div>
      `;
      return;
    }

    const swatch = state.comparison?.swatch || '';
    const source = personaSourceLabel(state.wornMask);
    const family = personaFamilyLabel(state.wornMask);
    const tagline = personaTagline(state.wornMask);
    const voicePromise = personaVoicePromise(state.wornMask);
    const fieldUse = personaFieldUse(state.wornMask);
    const riskTell = personaRiskTell(state.wornMask);
    const stageLine = state.comparison?.contactSummary?.line
      || (!state.lock
        ? 'The mask is worn, but Homebase still needs a cadence home.'
        : !String(state.comparisonText || '').trim()
          ? `The mask is worn against ${state.lock.name}. Paste source text to pass through it.`
          : 'Passage is staged. Read the source, the through-mask output, and what clung.');

    body.innerHTML = `
      <div class="homebase-worn-mask-card">
        ${renderPersonaPortrait(state.wornMask, { loading: 'eager', active: true })}
        <div class="homebase-worn-mask-copy">
          <div class="persona-kicker">${escapeHtml(source)}</div>
          <h3>${escapeHtml(state.wornMask.name)}</h3>
          <div class="persona-family-line">${escapeHtml(family)}</div>
          <p class="persona-tagline">${escapeHtml(tagline)}</p>
          <div class="persona-note-grid">
            <article class="persona-note">
              <div class="persona-kicker">Voice promise</div>
              <p>${escapeHtml(voicePromise)}</p>
            </article>
            <article class="persona-note">
              <div class="persona-kicker">Field use</div>
              <p>${escapeHtml(fieldUse)}</p>
            </article>
            <article class="persona-note danger-note">
              <div class="persona-kicker">Risk tell</div>
              <p>${escapeHtml(riskTell)}</p>
            </article>
          </div>
          <div class="trainer-surface homebase-swatch-card">
            <div class="persona-kicker">${escapeHtml(swatch ? 'writing swatch' : 'voice promise')}</div>
            <p class="persona-empty">${escapeHtml(swatch || voicePromise || 'Bring source text into contact to see how the mask begins a passage.')}</p>
          </div>
          <div class="analysis-status homebase-worn-mask-line">${escapeHtml(stageLine)}</div>
          <div class="persona-actions">
            <button type="button" class="secondary persona-inline-action" data-persona-action="open-trainer" data-persona-id="${state.wornMask.id}">Open in Trainer</button>
            <button type="button" class="ghost persona-inline-action" data-persona-action="clear-homebase">Clear worn mask</button>
          </div>
        </div>
      </div>
    `;
  }

  function renderHomebaseChrome(state) {
    const lockboxSurface = $('cadenceLockboxSurface');
    const dossierSurface = $('cadenceLockDossierSurface');
    const homebasePane = $('viewPaneHomebase');
    const revealButton = $('revealCadenceBtn');
    const saveButton = $('saveCadenceLockBtn');
    const homebaseStatus = $('homebaseStatus');
    const homebaseMaskStatus = $('homebaseMaskStatus');
    const lockStatus = $('homebaseLockStatus');
    const activeLockLabel = state.lock ? state.lock.name : 'no cadence home';
    const stagedLabel = state.hasStagedLock ? `${glyphChar('stateLockStaged', '')} staged draft` : 'archive latent';

    applySurfaceFieldGrammar(homebasePane, state.fieldGrammar?.homebase);
    if (lockboxSurface) {
      lockboxSurface.classList.toggle('is-staged', state.hasStagedLock);
    }
    if (dossierSurface) {
      dossierSurface.dataset.revealed = state.revealed ? 'true' : 'false';
    }
    if (revealButton) {
      revealButton.disabled = !state.lock;
    }
    if (saveButton) {
      saveButton.disabled = !state.hasStagedLock;
    }
    if (homebaseStatus) {
      homebaseStatus.textContent = !state.lock
        ? `${glyphChar('tabHomebase', '')} Homebase // anchor latent // stage a cadence home`
        : `${glyphChar('tabHomebase', '')} Homebase // ${activeLockLabel} // ${stagedLabel}`;
      applyGlyphMetadata(homebaseStatus, 'tabHomebase');
    }
    if (homebaseMaskStatus) {
      const wornMask = state.wornMask;
      homebaseMaskStatus.textContent = !wornMask
        ? `${glyphChar('homebaseWornMask', glyphChar('sectionMaskBench', ''))} Worn mask // none // choose on shelf, then bring into Homebase`
        : !state.lock
          ? `${glyphChar('homebaseWornMask', glyphChar('sectionMaskBench', ''))} Worn mask // ${wornMask.name} // cadence home still missing`
          : !String(state.comparisonText || '').trim()
            ? `${glyphChar('homebaseContact', glyphChar('sectionMaskBench', ''))} Worn mask // ${wornMask.name} // source text still missing`
            : state.comparison?.contactSummary
              ? `${glyphChar('homebaseResidue', glyphChar('sectionMaskBench', ''))} Worn mask // ${wornMask.name} // ${maskFieldEffectLabel(state.comparison.contactSummary.fieldEffect)}`
              : `${glyphChar('homebaseContact', glyphChar('sectionMaskBench', ''))} Worn mask // ${wornMask.name} // contact staging`;
      applyGlyphMetadata(
        homebaseMaskStatus,
        state.comparison?.contactSummary
          ? 'homebaseResidue'
          : wornMask && String(state.comparisonText || '').trim()
            ? 'homebaseContact'
            : wornMask
              ? 'homebaseWornMask'
              : 'sectionMaskBench'
      );
    }
    if (lockStatus) {
      lockStatus.textContent = !state.lock
        ? 'Stage a cadence draft. Reveal opens the dossier. Save keeps it in the session archive for this tab only.'
        : state.hasStagedLock && !state.revealed
          ? `${glyphChar('stateLockStaged', '')} Draft staged. The mask bench is live now. Reveal wakes the dossier and the solo readout path.`
        : state.hasStagedLock && state.revealed
            ? `${glyphChar('actionReveal', '')} Draft revealed. Stylometrics and solo harbor are live. Save when you want this cadence home to stay in the session archive.`
          : state.revealed
            ? `${glyphChar('actionReveal', '')} Saved cadence home revealed. Telemetry and Harbor are reading it through the solo path.`
            : 'Saved cadence home selected. Reveal when you want the dossier and solo readout live.';
    }
    renderHomebaseWornMask(state);
  }

  function renderLockArchive(state) {
    const archive = $('cadenceLockArchive');
    if (!archive) {
      return;
    }

    if (!cadenceLocks.length) {
      archive.innerHTML = '<div class="persona-empty">No session cadence home yet. Stage one in the lockbox, then press Save when you want it kept in this tab.</div>';
      return;
    }

    archive.innerHTML = cadenceLocks.map((lock) => {
      const selected = state.savedLock && state.savedLock.id === lock.id;
      const fingerprint = lock.fingerprintSummary || {};
      const meta = `${lock.stats?.sampleCount || lock.samples?.length || 0} samples // ${fingerprint.stickinessClass || 'portable'}`;
      const trace = `self trace ${formatPct(lock.selfSimilarity?.meanTraceability || 0)} // ${fingerprint.distinctivenessClass || 'noticeable'} // ${createdAtLabel(lock.createdAt)}`;
      return `
        <div class="lock-card ${selected ? 'selected' : ''}">
          <button type="button" class="lock-card-main" data-lock-action="select" data-lock-id="${lock.id}">
            <div class="persona-kicker">cadence home</div>
            <div class="name">${escapeHtml(lock.name || 'Cadence Lock')}</div>
            <div class="lock-meta">${escapeHtml(meta)}</div>
            <div class="lock-note">${escapeHtml(trace)}</div>
          </button>
          <button type="button" class="ghost lock-card-delete" data-lock-action="delete" data-lock-id="${lock.id}">Delete</button>
        </div>
      `;
    }).join('');
  }

  function renderLockDossier(state) {
    const dossierNode = $('cadenceLockDossier');
    if (!dossierNode) {
      return;
    }

    if (!state.lock) {
      dossierNode.innerHTML = '<div class="persona-empty">Stage or select a cadence home, then Reveal to open the dossier. The detail is the warning.</div>';
      return;
    }

    if (!state.revealed || !state.dossier) {
      dossierNode.innerHTML = `
        <div class="persona-dossier-latent">
          <div class="section-kicker">${glyphSpanHtml('sectionDeepDossier', 'glyph-cyan')} Deep dossier latent</div>
          <h3>${escapeHtml(state.lock.name)}</h3>
          <p class="persona-empty">This cadence home is loaded but unrevealed. Masks can still work against it. Reveal is what opens the dense stylometric readout and wakes the solo Telemetry and Harbor path.</p>
          <div class="trainer-summary-grid persona-dossier-grid">
            <div class="trainer-summary-card">
              <div class="persona-kicker">corpus</div>
              <strong>${state.lock.stats?.sampleCount || state.lock.samples?.length || 0}</strong>
              <span>${state.lock.stats?.totalWords || 0} words held in staged or session archive memory</span>
            </div>
            <div class="trainer-summary-card">
              <div class="persona-kicker">state</div>
              <strong>${state.hasStagedLock ? 'staged' : 'saved'}</strong>
              <span>${state.hasStagedLock ? 'Unsaved yellow-line draft.' : 'Archive copy selected.'}</span>
            </div>
            <div class="trainer-summary-card">
              <div class="persona-kicker">next move</div>
              <strong>Reveal</strong>
              <span>Open the dossier when you want the browser to say the quiet part out loud.</span>
            </div>
          </div>
        </div>
      `;
      return;
    }

    const dossier = state.dossier;
    const fingerprint = dossier.fingerprintSummary || {};
    const riskNotes = (dossier.riskInterpretation || [])
      .map((note) => `<li>${escapeHtml(note)}</li>`)
      .join('');
    const functionWords = (dossier.functionWordSnapshot || [])
      .map((entry) => `<span class="chip">${escapeHtml(entry.label)} ${entry.value.toFixed(3)}</span>`)
      .join('');
    const punctuation = (dossier.punctuationSnapshot || [])
      .map((entry) => `<span class="chip">${escapeHtml(entry.label)} ${entry.value.toFixed(3)}</span>`)
      .join('');
    const axes = (dossier.dominantAxes || [])
      .map((axis) => `<span class="chip">${escapeHtml(axis)}</span>`)
      .join('');

    dossierNode.innerHTML = `
      <div class="dossier-head">
        <div>
          <div class="section-kicker">${glyphSpanHtml('sectionDeepDossier', 'glyph-cyan')} Deep dossier</div>
          <h3>${escapeHtml(dossier.name)}</h3>
        </div>
        <button id="sendLockToDeckBtn" type="button" class="secondary">Send to Deck</button>
      </div>
      <div class="trainer-summary-grid persona-dossier-grid">
        <div class="trainer-summary-card">
          <div class="persona-kicker">corpus</div>
          <strong>${dossier.stats.sampleCount}</strong>
          <span>${dossier.stats.totalWords} words // ${formatFixed(dossier.stats.avgSentencesPerSample, 1)} sentences per sample</span>
        </div>
        <div class="trainer-summary-card">
          <div class="persona-kicker">self trace</div>
          <strong>${formatPct(dossier.selfSimilarity.meanTraceability || 0)}</strong>
          <span>${formatPct(dossier.selfSimilarity.meanSimilarity || 0)} similarity</span>
        </div>
        <div class="trainer-summary-card">
          <div class="persona-kicker">fingerprint</div>
          <strong>${escapeHtml(fingerprint.stickinessClass || 'portable')}</strong>
          <span>${escapeHtml(fingerprint.stabilityClass || 'steady')} // ${escapeHtml(fingerprint.distinctivenessClass || 'noticeable')}</span>
        </div>
      </div>
      <div class="persona-dossier-metrics">
        <div class="persona-dossier-card"><div class="persona-kicker">sentence rhythm</div><strong>${dossier.profile.avgSentenceLength.toFixed(1)}w</strong><span>spread ${dossier.profile.sentenceLengthSpread.toFixed(1)}</span></div>
        <div class="persona-dossier-card"><div class="persona-kicker">punctuation / contraction</div><strong>${dossier.profile.punctuationDensity.toFixed(3)}</strong><span>contraction ${dossier.profile.contractionDensity.toFixed(3)}</span></div>
        <div class="persona-dossier-card"><div class="persona-kicker">recurrence / dispersion</div><strong>${dossier.profile.recurrencePressure.toFixed(3)}</strong><span>dispersion ${dossier.profile.lexicalDispersion.toFixed(3)}</span></div>
        <div class="persona-dossier-card"><div class="persona-kicker">abstraction / directness</div><strong>${dossier.profile.abstractionPosture.toFixed(3)}</strong><span>directness ${dossier.profile.directness.toFixed(3)}</span></div>
        <div class="persona-dossier-card"><div class="persona-kicker">hedge / modifier</div><strong>${dossier.profile.hedgeDensity.toFixed(3)}</strong><span>modifier ${dossier.profile.modifierDensity.toFixed(3)}</span></div>
        <div class="persona-dossier-card"><div class="persona-kicker">register mode</div><strong>${escapeHtml(dossier.profile.registerMode || 'unknown')}</strong><span>latinate ${dossier.profile.latinatePreference.toFixed(3)}</span></div>
      </div>
      <div class="persona-dossier-snapshots">
        <div class="trainer-surface">
          <div class="persona-kicker">function-word snapshot</div>
          <div class="chips">${functionWords || '<span class="chip">none loaded</span>'}</div>
        </div>
        <div class="trainer-surface">
          <div class="persona-kicker">punctuation mix</div>
          <div class="chips">${punctuation || '<span class="chip">none loaded</span>'}</div>
        </div>
        <div class="trainer-surface">
          <div class="persona-kicker">dominant axes</div>
          <div class="chips">${axes || '<span class="chip">no dominant axis yet</span>'}</div>
        </div>
      </div>
      <div class="trainer-surface persona-dossier-risk">
        <div class="persona-kicker">${glyphChar('sectionMaskBench', '')} Risk interpretation</div>
        <ul class="persona-risk-list">${riskNotes}</ul>
      </div>
    `;
  }

  function renderMaskBench(state) {
    const statusNode = $('maskBenchStatus');
    const contactNode = $('maskContactSummary');
    const sourceNode = $('personaMaskSource');
    const outputNode = $('personaMaskOutput');
    const beforeNode = $('maskRawToLock');
    const afterNode = $('maskMaskedToLock');
    const movedNode = $('maskWhatMoved');
    const deltaNode = $('maskDeltaToLock');
    const notesNode = $('maskStickinessNotes');
    const shiftPreviewNode = $('personaMaskShiftPreview');

    const renderShiftPreview = (rows = [], fallback = 'Sentence-level movement will appear here once the mask rewrites a passage.') => {
      if (!shiftPreviewNode) {
        return;
      }
      if (!rows.length) {
        shiftPreviewNode.textContent = fallback;
        return;
      }
      shiftPreviewNode.innerHTML = rows.map((row) => `
        <article class="mask-shift-row" data-effect="${escapeHtml(row.effect || 'hold')}">
          <div class="mask-shift-label">${escapeHtml((row.effect || 'hold').replace(/-/g, ' '))}</div>
          <div class="mask-shift-copy">
            <div><strong>Source</strong> ${escapeHtml(row.source || '—')}</div>
            <div><strong>Through Mask</strong> ${escapeHtml(row.output || '—')}</div>
          </div>
        </article>
      `).join('');
    };

    if (!statusNode || !contactNode || !sourceNode || !outputNode || !beforeNode || !afterNode || !movedNode || !deltaNode || !notesNode) {
      return;
    }

    if (!state.lock) {
      statusNode.textContent = state.wornMask
        ? `${state.wornMask.name} is worn, but Homebase still needs a cadence home. Lock one or select one from the archive first.`
        : 'Stage or select a cadence home to turn this bench on.';
      contactNode.textContent = 'Contact state // cadence home missing';
      applyGlyphMetadata(contactNode, 'homebaseCadenceHome');
      sourceNode.value = String(state.comparisonText || '').trim();
      outputNode.value = '';
      beforeNode.textContent = '--';
      afterNode.textContent = '--';
      movedNode.textContent = '--';
      deltaNode.textContent = '--';
      notesNode.innerHTML = state.wornMask
        ? `<li>${escapeHtml(state.wornMask.name)} is worn and ready. The missing ingredient is the cadence home.</li>`
        : '<li>Select or create a cadence home first.</li>';
      renderShiftPreview([], state.wornMask
        ? `${state.wornMask.name} is worn, but Homebase still needs a cadence home before movement can be read.`
        : 'Stage or select a cadence home first.');
      return;
    }

    if (!state.comparisonText.trim()) {
      statusNode.textContent = state.wornMask
        ? `${state.wornMask.name} is worn against ${state.lock.name}. Paste source text to run contact.`
        : `Cadence home live // ${state.lock.name}. Choose a shelf mask, bring it into Homebase, then paste source text.`;
      contactNode.textContent = state.wornMask
        ? 'Contact state // worn mask waiting on source passage'
        : 'Contact state // no worn mask';
      applyGlyphMetadata(contactNode, state.wornMask ? 'homebaseWornMask' : 'homebaseCadenceHome');
      sourceNode.value = '';
      outputNode.value = '';
      beforeNode.textContent = '--';
      afterNode.textContent = '--';
      movedNode.textContent = '--';
      deltaNode.textContent = '--';
      notesNode.innerHTML = state.wornMask
        ? `<li>${escapeHtml(state.wornMask.name)} is waiting on source passage.</li><li>The bench compares source and through-mask text against ${escapeHtml(state.lock.name)}.</li>`
        : '<li>The bench compares source and through-mask text against the active lock.</li>';
      renderShiftPreview([], state.wornMask
        ? `${state.wornMask.name} is worn against ${state.lock.name}. Paste source text to read the rewrite.`
        : `Choose a mask and bring it into Homebase to read movement against ${state.lock.name}.`);
      return;
    }

    if (!state.wornMask || !state.comparison) {
      statusNode.textContent = `Source text is ready against ${state.lock.name}. Bring a mask into Homebase to see what still reads as home.`;
      contactNode.textContent = 'Contact state // source staged, mask missing';
      applyGlyphMetadata(contactNode, 'homebaseContact');
      sourceNode.value = state.comparisonText || '';
      outputNode.value = '';
      beforeNode.textContent = '--';
      afterNode.textContent = '--';
      movedNode.textContent = '--';
      deltaNode.textContent = '--';
      notesNode.innerHTML = '<li>No mask is worn yet.</li><li>Choose one in Personas, bring it into Homebase, then read what clings after contact.</li>';
      renderShiftPreview([], 'Source text is staged. Bring a worn mask in to read the rewrite sentence by sentence.');
      return;
    }

    const result = state.comparison;
    const delta = result.deltaToLock || {};
    const contact = result.contactSummary || {};
    statusNode.textContent = `${state.wornMask.name} is passing source text through ${state.lock.name}.`;
    contactNode.textContent = `Contact state // ${contact.line || 'Residue is now readable.'}`;
    applyGlyphMetadata(contactNode, contact.fieldEffect === 'neither' ? 'homebaseContact' : 'homebaseResidue');
    sourceNode.value = result.rawText || state.comparisonText || '';
    outputNode.value = result.maskedText || '';
    beforeNode.textContent = comparisonMetricSummary(result.rawToLock);
    afterNode.textContent = comparisonMetricSummary(result.maskedToLock);
    movedNode.textContent = result.whatMovedSummary || '--';
    deltaNode.textContent =
      contact.fieldEffect === 'both'
        ? `${delta.traceability >= 0 ? '+' : ''}${formatPct(Math.abs(delta.traceability || 0))} trace // surface texture shifted too`
        : contact.fieldEffect === 'proximity'
          ? `${delta.traceability >= 0 ? '+' : ''}${formatPct(Math.abs(delta.traceability || 0))} trace // home distance moved`
          : contact.fieldEffect === 'surface-texture'
            ? 'surface texture shifted // home distance held'
            : 'surface texture held // home distance held';
    notesNode.innerHTML = [
      `What clung // ${escapeHtml(contact.line || 'Residue remains readable.')} `,
      ...(result.stickinessNotes || [])
    ].map((note) => `<li>${escapeHtml(note)}</li>`).join('');
    renderShiftPreview(result.shiftPreview || [], 'The mask held close enough to source that sentence movement stayed minimal.');
  }

  function renderPersonaPreview(state) {
    const node = $('personaPreviewBody');
    const stage = $('personaPreviewStage');
    if (!node || !stage) {
      return;
    }

    applySurfaceFieldGrammar(stage, state.fieldGrammar?.personas);

    if (!state.selectedMask) {
      node.innerHTML = `
        <div class="persona-preview-empty">
          <h3>Choose a mask on the shelf</h3>
          <p class="persona-empty">The shelf is for choosing. Homebase is where the mask gets worn and the passage gets tested.</p>
        </div>
      `;
      return;
    }

    const persona = state.selectedMask;
    const swatch = state.selectedMaskSwatch || '';
    const diagnosticSpecimen = persona.diagnosticSpecimen || null;
    const specimenSwatch = swatch || diagnosticSpecimen?.swatch || '';
    const specimenLabel = swatch
      ? 'writing swatch'
      : diagnosticSpecimen?.swatch
        ? 'diagnostic field swatch'
        : 'voice promise';
    const effectSummary = state.selectedMaskEffect || null;
    const effectLine = effectSummary
      ? [effectSummary.sentenceShift, effectSummary.registerShift]
          .filter(Boolean)
          .map((entry) => `<span class="chip">${escapeHtml(entry)}</span>`)
          .join('')
      : persona.chips.slice(0, 2).map((chip) => `<span class="chip">${escapeHtml(chip)}</span>`).join('');
    const source = personaSourceLabel(persona);
    const family = personaFamilyLabel(persona);
    const tagline = personaTagline(persona);
    const voicePromise = personaVoicePromise(persona);
    const fieldUse = personaFieldUse(persona);
    const riskTell = personaRiskTell(persona);
    const fingerprintEntries = persona.profile ? personaFingerprintEntries(persona.profile) : [];
    const provenanceLines = buildPersonaProvenanceLines(persona);
    node.innerHTML = `
      <div class="persona-preview-grid">
        ${renderPersonaPortrait(persona, { loading: 'eager' })}
        <div class="persona-preview-copy">
          <div class="persona-kicker">${escapeHtml(source)}</div>
          <h3>${escapeHtml(persona.name)}</h3>
          <div class="persona-family-line">${escapeHtml(family)}</div>
          <p class="persona-tagline">${escapeHtml(tagline)}</p>
          <div class="chips">${effectLine}</div>
          <div class="persona-note-grid">
            <article class="persona-note">
              <div class="persona-kicker">Voice promise</div>
              <p>${escapeHtml(voicePromise)}</p>
            </article>
            <article class="persona-note">
              <div class="persona-kicker">Field use</div>
              <p>${escapeHtml(fieldUse)}</p>
            </article>
            <article class="persona-note danger-note">
              <div class="persona-kicker">Risk tell</div>
              <p>${escapeHtml(riskTell)}</p>
            </article>
          </div>
          <div class="trainer-surface persona-preview-swatch">
            <div class="persona-kicker">${escapeHtml(specimenLabel)}</div>
            <p class="persona-empty">${escapeHtml(specimenSwatch || voicePromise || 'Paste comparison text in Homebase to see how this mask begins a passage.')}</p>
          </div>
          <div class="trainer-surface persona-preview-swatch">
            <div class="persona-kicker">Diagnostics field span</div>
            <div class="persona-provenance-copy">
              <p class="persona-empty">${escapeHtml(diagnosticSpecimen?.fieldSpanLine || 'Diagnostics field span is unresolved for this mask.')}</p>
              <p class="persona-empty">${escapeHtml(diagnosticSpecimen?.contributorLine || 'No dominant diagnostics specimen registered yet.')}</p>
            </div>
          </div>
          <div class="trainer-surface persona-preview-swatch">
            <div class="persona-kicker">Resolved mask fingerprint</div>
            <div id="selectedMaskFingerprint">
              ${fingerprintEntries.length
                ? renderMetricChips(fingerprintEntries, 'chips persona-fingerprint-chips', 'chip')
                : '<p class="persona-empty">No resolved fingerprint registered yet.</p>'}
            </div>
          </div>
          <div class="trainer-surface persona-preview-swatch">
            <div class="persona-kicker">Recipe provenance</div>
            <div id="selectedMaskProvenance" class="persona-provenance-copy">
              ${provenanceLines.map((line) => `<p class="persona-empty">${escapeHtml(line)}</p>`).join('')}
            </div>
          </div>
          <div class="persona-actions">
            <button type="button" class="secondary persona-inline-action" data-persona-action="wear-homebase" data-persona-id="${persona.id}">Bring into Homebase</button>
            <button type="button" class="ghost persona-inline-action" data-persona-action="assign-reference" data-persona-id="${persona.id}">Try on Deck A</button>
            <button type="button" class="ghost persona-inline-action" data-persona-action="assign-probe" data-persona-id="${persona.id}">Try on Deck B</button>
            <button type="button" class="ghost persona-inline-action" data-persona-action="open-trainer" data-persona-id="${persona.id}">Open in Trainer</button>
          </div>
        </div>
      </div>
    `;
  }

  function renderMaskGallery(state) {
    const deck = $('personaDeck');
    if (!deck) {
      return;
    }

    const sectionConfigs = [
      { key: 'builtIn', title: 'Built-in masks', kicker: 'field cast' },
      { key: 'captured', title: 'Captured shells', kicker: 'saved from live cadence' },
      { key: 'trained', title: 'Trained shells', kicker: 'forged in trainer' }
    ];

    deck.innerHTML = sectionConfigs
      .filter((section) => (state.galleryGroups?.[section.key] || []).length)
      .map((section) => {
        const cards = (state.galleryGroups?.[section.key] || []).map((persona) => {
          const selected = state.selectedMask && state.selectedMask.id === persona.id;
          const assigned = bayShells.A.personaId === persona.id || bayShells.B.personaId === persona.id;
          const shellSelected = bayShells[activeVoice].personaId === persona.id;
          const wornHere = state.wornMask && state.wornMask.id === persona.id;
          const source = personaSourceLabel(persona);
          const family = personaFamilyLabel(persona);
          const tagline = personaTagline(persona);
          const diagnosticSpecimen = persona.diagnosticSpecimen || null;
          const effectLine = [
            ...persona.chips.slice(0, 1),
            ...personaShelfChipLabels(persona.profile)
          ].map((chip) => `<span class="chip">${escapeHtml(chip)}</span>`).join('');

          return `
            <div class="persona ${selected ? 'selected chosen-shelf' : ''} ${assigned ? 'assigned deck-assigned' : ''} ${shellSelected ? 'shell-selected' : ''} ${wornHere ? 'worn-homebase' : ''}" data-id="${persona.id}" role="button" tabindex="0" aria-pressed="${selected}">
              <div class="persona-top">
                <div>
                  <div class="persona-kicker">${escapeHtml(source)}</div>
                  <div class="name">${escapeHtml(persona.name)}</div>
                </div>
                <div class="persona-action">${escapeHtml(wornHere ? 'Worn in Homebase' : personaStateKicker(persona))}</div>
              </div>
              ${renderPersonaPortrait(persona)}
              <div class="persona-card-copy">
                <div class="persona-family-line">${escapeHtml(family)}</div>
                <p class="persona-tagline">${escapeHtml(tagline)}</p>
                <div class="persona-diagnostic-line">${escapeHtml(diagnosticSpecimen?.fieldSpanShort || 'Diagnostics specimen unresolved')}</div>
                ${diagnosticSpecimen?.swatch ? `<p class="persona-diagnostic-swatch">${escapeHtml(diagnosticSpecimen.swatch)}</p>` : ''}
              </div>
              <div class="chips">${effectLine}</div>
            </div>
          `;
        }).join('');

        return `
          <section class="persona-gallery-section">
            <div class="persona-gallery-heading">
              <div>
                <div class="persona-kicker">${escapeHtml(section.kicker)}</div>
                <h3>${escapeHtml(section.title)}</h3>
              </div>
            </div>
            <div class="personagrid compact persona-shelf-grid">${cards}</div>
          </section>
        `;
      })
      .join('');
  }

  function renderPersonaGalleryStatus(state) {
    const node = $('personaStatus');
    if (!node) {
      return;
    }

    const maskLabel = state.selectedMask ? state.selectedMask.name : 'no mask chosen';
    const homeLabel = state.lock ? state.lock.name : 'no cadence home';
    const nextStep = !state.selectedMask
      ? 'choose a mask on the shelf'
      : !state.lock
        ? 'bring it into Homebase or throw it into the Deck'
        : !state.wornMask
          ? `${maskLabel} is chosen; bring it into Homebase to start contact`
          : !state.comparisonText.trim()
            ? `Homebase is waiting on source text for ${homeLabel}`
            : `${maskLabel} is now writing against ${homeLabel}`;
    node.textContent = `${glyphChar('tabPersonas', '')} Shelf // ${maskLabel} // ${nextStep} // ${state.library.length} masks loaded`;
    applyGlyphMetadata(node, 'tabPersonas');
  }

  function renderDeckCastReport(state) {
    const node = $('deckCastReport');
    const pane = $('viewPanePlay');
    const previewNode = $('deckAftermathPreview');
    if (!node) {
      return;
    }

    applySurfaceFieldGrammar(pane, state.fieldGrammar?.deck);

    if (lastSwapCadenceAudit) {
      const classification = lastSwapCadenceAudit.classification || 'aftermath';
      const held = [
        lastSwapCadenceAudit.lanes?.A?.borrowedShellOutcome || '',
        lastSwapCadenceAudit.lanes?.B?.borrowedShellOutcome || ''
      ].filter(Boolean).join(' / ');
      node.textContent = `${glyphChar('deckSwapAftermath', glyphChar('tabDeck', ''))} Aftermath // ${classification} // ${held || 'read Shell Duel for movement'}`;
      if (previewNode) {
        const voiceStateA = getVoiceState('A');
        const voiceStateB = getVoiceState('B');
        const compact = (text = '') => {
          const normalized = String(text || '').replace(/\s+/g, ' ').trim();
          return normalized.length > 160 ? `${normalized.slice(0, 157).trimEnd()}...` : normalized;
        };
        previewNode.hidden = false;
        previewNode.innerHTML = `
          <article class="deck-aftermath-card">
            <div class="persona-kicker">A borrowed shell</div>
            <p>${escapeHtml(compact(voiceStateA.effectiveText || voiceStateA.text || 'No preview yet.'))}</p>
          </article>
          <article class="deck-aftermath-card">
            <div class="persona-kicker">B borrowed shell</div>
            <p>${escapeHtml(compact(voiceStateB.effectiveText || voiceStateB.text || 'No preview yet.'))}</p>
          </article>
        `;
      }
      return;
    }

    const summary = state.deckCastingSummary;
    node.textContent = `${glyphChar('deckCasting', glyphChar('tabDeck', ''))} ${summary.line}`;
    if (previewNode) {
      previewNode.hidden = true;
      previewNode.innerHTML = '';
    }
  }

  function buildConsoleStationCards(state) {
    const trainerSnapshot = readTrainerSnapshot();
    const routeLine = $('routeState')?.textContent.trim() || 'Route // buffered';
    const decisionLine = $('decisionTone')?.textContent.trim() || 'Waiting on a scan';
    const homeSummary = !state.lock
      ? 'No cadence home staged yet.'
      : state.revealed
        ? `${state.lock.name} is revealed on the solo witness lane.`
        : `${state.lock.name} is anchored and waiting on Reveal.`;
    const homeDetail = !state.lock
      ? 'Lock a corpus, then Reveal when you want the dossier and solo witness live.'
      : state.wornMask && state.comparison?.contactSummary
        ? `${state.wornMask.name} is in contact. ${maskFieldEffectLabel(state.comparison.contactSummary.fieldEffect)}.`
        : state.wornMask
          ? `${state.wornMask.name} is worn. Add source text to wake passage.`
          : 'Bring a mask in when you want passage and residue live.';
    const selectedShelfMask = state.selectedMask?.name || '';
    const wornMask = state.wornMask?.name || '';
    const personaSummary = wornMask && selectedShelfMask && wornMask === selectedShelfMask
      ? `${selectedShelfMask} is chosen on the shelf and worn in Homebase.`
      : selectedShelfMask
        ? `${selectedShelfMask} is chosen on the shelf.`
        : wornMask
          ? `${wornMask} is worn in Homebase.`
          : 'The shelf is latent until you choose a mask.';
    const personaDetail = !state.library.length
      ? 'No masks loaded.'
      : `${state.galleryGroups.builtIn.length} built-in / ${state.galleryGroups.captured.length} captured / ${state.galleryGroups.trained.length} trained.`;
    const readoutSummary = readoutOwner === 'homebase' && state.revealed
      ? `${state.lock?.name || 'Cadence home'} is driving the solo witness path.`
      : readoutOwner === 'idle'
        ? 'Telemetry is latent until the field is actually read.'
        : decisionLine;
    const deckSummary = lastSwapCadenceAudit
      ? `Aftermath // ${lastSwapCadenceAudit.classification || 'aftermath'}`
      : state.deckCastingSummary?.ready
        ? state.deckCastingSummary.line
        : 'No pair awake yet.';
    const trainerSummary = trainerSnapshot.lastInjectedPersonaSummary
      ? `${trainerSnapshot.lastInjectedPersonaSummary.name} is live on the session shelf.`
      : trainerSnapshot.validationPass
        ? `${trainerSnapshot.personaName} is forge-ready for session inject${trainerSnapshot.releaseGateArmed ? ' and release' : ''}.`
        : trainerSnapshot.corpusReady
          ? 'Corpus extracted. Validation is waiting on a candidate.'
          : 'The forge is latent.';

    return [
      {
        target: 'homebase',
        glyphKey: 'tabHomebase',
        glyphClass: 'glyph-lime',
        kicker: 'Anchor',
        title: 'Homebase',
        summary: homeSummary,
        detail: homeDetail
      },
      {
        target: 'personas',
        glyphKey: 'tabPersonas',
        glyphClass: 'glyph-lime',
        kicker: 'Shelf',
        title: 'Personas',
        summary: personaSummary,
        detail: personaDetail
      },
      {
        target: 'readout',
        glyphKey: 'tabReadout',
        glyphClass: 'glyph-cyan',
        kicker: 'Witness',
        title: 'Readout',
        summary: readoutSummary,
        detail: routeLine
      },
      {
        target: 'deck',
        glyphKey: 'tabDeck',
        glyphClass: 'glyph-lime',
        kicker: 'Encounter',
        title: 'Deck',
        summary: deckSummary,
        detail: lastSwapCadenceAudit
          ? 'Read the aftermath there; the shell audit is already live.'
          : state.deckCastingSummary?.detail || 'Load one voice or two and press Analyze Cadences when you want the duel awake.'
      },
      {
        target: 'trainer',
        glyphKey: 'tabTrainer',
        glyphClass: 'glyph-cyan',
        kicker: 'Forge',
        title: 'Trainer',
        summary: trainerSummary,
        detail: trainerSnapshot.lastInjectedPersonaSummary
          ? 'Open the forge to route the injected persona into the session shelf, Homebase, or Deck.'
          : 'Extract, inspect, validate, session-inject, and release only when the field still stands behind it.'
      }
    ];
  }

  function renderConsoleStationGrid(state) {
    const pane = $('viewPaneConsole');
    const grid = $('consoleStationGrid');
    if (!pane || !grid) {
      return;
    }

    applySurfaceFieldGrammar(pane, state.fieldGrammar?.console);
    const cards = buildConsoleStationCards(state);
    grid.innerHTML = cards.map((card) => `
      <button type="button" class="console-station-card" data-station-target="${card.target}">
        <div class="console-station-topline">
          <div class="console-station-kicker">
            ${glyphSpanHtml(card.glyphKey, card.glyphClass)}
            ${escapeHtml(card.kicker)}
          </div>
          <span class="console-station-open">Open &rarr;</span>
        </div>
        <h3>${escapeHtml(card.title)}</h3>
        <p class="console-station-summary">${escapeHtml(card.summary)}</p>
        <p class="console-station-detail">${escapeHtml(card.detail)}</p>
      </button>
    `).join('');
  }

  function renderTrainerBridge() {
    const surface = $('trainerBridgeSurface');
    const body = $('trainerBridgeBody');
    if (!surface || !body) {
      return;
    }

    const snapshot = readTrainerSnapshot();
    const injected = snapshot.lastInjectedPersonaSummary || null;
    surface.hidden = false;

    if (!injected) {
      body.innerHTML = `
        <div class="trainer-bridge-card trainer-bridge-empty">
          <div>
            <div class="persona-kicker">Next move</div>
            <p class="persona-empty">A successful inject opens direct routes into the session shelf, Homebase, and Deck. Export stays sealed until you open the release gate in this tab.</p>
          </div>
        </div>
      `;
      return;
    }

    body.innerHTML = `
      <div class="trainer-bridge-card">
        <div class="trainer-bridge-copy">
          <div class="persona-kicker">Injected persona</div>
          <h3>${escapeHtml(injected.name)}</h3>
          <p>${escapeHtml(injected.name)} is live on the session shelf. Open it in Personas, bring it into Homebase, or test it in Deck without leaving the shared runtime.</p>
        </div>
        <div class="persona-actions">
          <button type="button" class="ghost" data-station-target="personas">Open in Personas</button>
          <button type="button" class="secondary" data-persona-action="wear-homebase" data-persona-id="${escapeHtml(injected.id)}">Bring into Homebase</button>
          <button type="button" class="ghost" data-persona-action="assign-reference" data-persona-id="${escapeHtml(injected.id)}">Try in Deck</button>
        </div>
      </div>
    `;
  }

  function renderPersonas() {
    const state = buildPersonaGalleryState();
    renderConsoleStationGrid(state);
    renderHomebaseChrome(state);
    renderMaskBench(state);
    renderLockDossier(state);
    renderLockArchive(state);
    renderPersonaPreview(state);
    renderMaskGallery(state);
    renderPersonaGalleryStatus(state);
    renderDeckCastReport(state);
    renderTrainerBridge();
    applySurfaceFieldGrammar($('viewPaneConsole'), state.fieldGrammar?.console);
    applySurfaceFieldGrammar($('viewPaneHomebase'), state.fieldGrammar?.homebase);
    applySurfaceFieldGrammar($('viewPanePersonas'), state.fieldGrammar?.personas);
    applySurfaceFieldGrammar($('viewPaneReadout'), state.fieldGrammar?.readout);
    applySurfaceFieldGrammar($('viewPaneTrainer'), state.fieldGrammar?.trainer);
    applySurfaceFieldGrammar($('trainerPane'), state.fieldGrammar?.trainer);
    renderActiveBayStatus();
  }

  function setArtifactTab(tab, options = {}) {
    const {
      announce = false,
      scroll = false,
      updateHash = true,
      replaceHash = false
    } = options;
    activeArtifactTab = normalizeArtifactTab(tab);
    let activePaneNode = null;

    ARTIFACT_TABS.forEach((pane) => {
      const paneNode = $(ARTIFACT_TAB_PANE_IDS[pane]);
      const tabNode = $(ARTIFACT_TAB_BUTTON_IDS[pane]);
      const isActive = pane === activeArtifactTab;

      if (paneNode) {
        paneNode.hidden = !isActive;
        paneNode.classList.toggle('active', isActive);
        if (isActive) {
          activePaneNode = paneNode;
        }
      }

      if (tabNode) {
        tabNode.classList.toggle('active', isActive);
        tabNode.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      }
    });

    document.body.dataset.artifactTab = activeArtifactTab;
    document.body.dataset.stationRoute = ARTIFACT_TAB_TO_HASH[activeArtifactTab] || activeArtifactTab;

    const masthead = $('consoleMasthead');
    if (masthead) {
      masthead.hidden = false;
      masthead.dataset.station = activeArtifactTab;
    }
    applyStationChrome(activeArtifactTab);
    if (updateHash) {
      syncArtifactHash(activeArtifactTab, { replace: replaceHash });
    }

    const scrollTarget = activePaneNode || masthead;
    if (scroll && scrollTarget && typeof scrollTarget.scrollIntoView === 'function') {
      try {
        scrollTarget.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } catch {
        scrollTarget.scrollIntoView();
      }
    }

    if (announce) {
      const viewLabels = {
        homebase: 'Homebase ready.',
        personas: 'Shelf ready.',
        readout: 'Readout ready.',
        play: 'Deck ready.',
        trainer: 'Forge ready.'
      };
      setStatusMessage(viewLabels[activeArtifactTab] || 'View updated.');
    }
  }

  function handleArtifactRouteChange() {
    const currentHash = String(window.location.hash || '').trim().toLowerCase();
    const nextTab = resolveArtifactTabFromHash(window.location.hash);
    if (nextTab === activeArtifactTab) {
      if (currentHash === '#console') {
        syncArtifactHash('homebase', { replace: true });
      } else if (!window.location.hash) {
        syncArtifactHash(activeArtifactTab, { replace: true });
      }
      return;
    }
    setArtifactTab(nextTab, { updateHash: false });
    if (currentHash === '#console') {
      syncArtifactHash('homebase', { replace: true });
    }
  }

  function updateControls() {
    $('compareBtn').textContent = 'Analyze Cadences';
    $('swapCadencesBtn').textContent = 'Swap Cadences';
    $('swapMedallion').textContent = 'Swap Text';
    $('swapMedallion').setAttribute('aria-label', 'Swap source text between bays');
    $('swapMedallion').title = 'Swap source text between bays';
    const referenceSample = sampleEntry(baySampleIds.A);
    const probeSample = sampleEntry(baySampleIds.B);
    $('randomizeVoiceABtn').setAttribute('aria-label', 'Randomize reference voice sample');
    $('randomizeVoiceABtn').title = referenceSample ? `Randomize reference voice sample // current ${referenceSample.name}` : 'Randomize reference voice sample';
    $('randomizeVoiceBBtn').setAttribute('aria-label', 'Randomize probe voice sample');
    $('randomizeVoiceBBtn').title = probeSample ? `Randomize probe voice sample // current ${probeSample.name}` : 'Randomize probe voice sample';
    $('savePersonaBtn').textContent = `Save Cadence as Persona // ${SLOT_SHORT[activeVoice]}`;
    $('toggleMirrorBtn').textContent = MIRROR_COPY[mirrorLogic].button;
    $('badgeBtn').textContent = `Cycle custody badge // ${BADGE_LABELS[badge] || badge}`;
    $('resetBtn').textContent = 'Reset bay';

    const voiceStateA = getVoiceState('A');
    const voiceStateB = getVoiceState('B');
    $('swapCadencesBtn').disabled = !(voiceStateA.hasText && voiceStateB.hasText);
    $('swapMedallion').disabled = !(voiceStateA.hasText && voiceStateB.hasText);
    $('randomizeVoiceABtn').disabled = !DECK_RANDOMIZER_SAMPLE_LIBRARY.length;
    $('randomizeVoiceBBtn').disabled = !DECK_RANDOMIZER_SAMPLE_LIBRARY.length;
    $('savePersonaBtn').disabled = !getVoiceState(activeVoice).hasText;
  }

  function updateStatePills(routeStatus, decision) {
    $('badgeState').textContent = `${glyphChar(glyphKeyForBadge(badge), '')} Badge // ${badgeMeaning(badge)}`;
    applyGlyphMetadata($('badgeState'), glyphKeyForBadge(badge));
    $('badgeState').classList.toggle('active', badge === 'badge.holds');
    $('mirrorState').textContent = `${glyphChar('stateMirror', '')} ${MIRROR_COPY[mirrorLogic].pill}`;
    applyGlyphMetadata($('mirrorState'), 'stateMirror');
    $('mirrorState').classList.toggle('active', mirrorLogic === 'off');
    $('containmentState').textContent = `${glyphChar('stateContainment', '')} ${CONTAINMENT_COPY[containment].pill}`;
    applyGlyphMetadata($('containmentState'), 'stateContainment');
    $('containmentState').classList.toggle('active', containment === 'on');
    $('routeState').textContent = `${glyphChar('stateRoute', '')} Route // ${routeStatus}`;
    applyGlyphMetadata($('routeState'), 'stateRoute');
    $('routeState').dataset.routeStatusKey = routeStatusKey(routeStatus);
    $('routeState').classList.toggle('warn', decision === 'criticality');
    $('routeState').classList.toggle('active', decision === 'passage');
    document.body.dataset.routeStatusKey = $('routeState').dataset.routeStatusKey;
  }

  function updateHeroConsolePair(payload) {
    const { cmp, routePressure, harbor, decision } = payload;

    $('heroSignalValue').textContent = formatPct(cmp.similarity);
    $('heroSignalNote').textContent =
      cmp.similarity >= 0.78
        ? 'Witness pressure is tightening. These voices are starting to read like the same weather system.'
        : cmp.similarity >= 0.55
          ? 'Shared field habits are surfacing, but the encounter has not earned passage yet.'
          : 'The two voices are still holding separate weather.';
    $('heroRouteValue').textContent = formatPct(routePressure);
    $('heroRouteNote').textContent =
      decision === 'criticality'
        ? 'Witness pressure is outrunning route stability.'
        : decision === 'passage'
          ? 'Route, harbor, and archive are aligned enough to move without bluffing.'
          : decision === 'hold-branch'
            ? 'The branch is live, but passage is still being argued in law.'
            : 'The field is still more atmospheric than traceable.';
    if (decision === 'weak-signal') {
      $('heroHarborValue').textContent = 'observe';
      $('heroHarborNote').textContent = 'No harbor yet. Keep the encounter playful until custody can actually support it.';
    } else {
      $('heroHarborValue').textContent = harbor;
      $('heroHarborNote').textContent = HARBOR_LIBRARY[harbor].mode_class;
    }
    $('decisionTone').textContent = `${glyphChar('stateDecision', '')} ${
      decision === 'criticality'
        ? 'Witness pressure rising'
        : decision === 'passage'
          ? 'Harbor law aligned'
          : decision === 'hold-branch'
            ? 'Branch preserved'
            : 'Weak signal'
    }`;
    applyGlyphMetadata($('decisionTone'), 'stateDecision');
    $('decisionTone').dataset.state = decision;
    document.body.dataset.decision = decision;
  }

  function updateHeroConsoleSolo(voiceState) {
    $('heroSignalValue').textContent = 'SOLO';
    $('heroSignalNote').textContent = `Cadence captured from the ${SLOT_SHORT[voiceState.slot]} bay. Add a second voice when you want contrast instead of signature alone.`;
    $('heroRouteValue').textContent = formatPct(voiceState.effectiveProfile.recurrencePressure);
    $('heroRouteNote').textContent = 'Solo scans expose recurrence and cadence signature, but route still needs a second voice.';
    $('heroHarborValue').textContent = voiceState.shell.mode === 'native' ? 'save.persona' : voiceState.shell.label;
    $('heroHarborNote').textContent =
      voiceState.shell.mode === 'native'
        ? 'Save the captured cadence or pair it with a second voice.'
        : 'A cadence shell is already shaping this bay.';
    $('decisionTone').textContent = `${glyphChar('stateDecision', '')} Solo witness`;
    applyGlyphMetadata($('decisionTone'), 'stateDecision');
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
            <div class="section-kicker">${glyphSpanHtml('sectionExploratory', 'glyph-cyan')} Exploratory posture</div>
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
      <p class="kicker">Recognition has not crossed threshold. TCP keeps the deck curious, public, and non-escalatory.</p>
      `;
      return;
    }

    const harborData = HARBOR_LIBRARY[harbor];
    const kicker = decision === 'criticality' ? microcopy.route_warning : microcopy.receipt_created;

    $('harborBox').innerHTML = `
      <div class="harbor-head">
        <div>
          <div class="section-kicker">${glyphSpanHtml('sectionRecommendedHarbor', 'glyph-lime')} Recommended harbor</div>
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
          <div class="section-kicker">${glyphSpanHtml('sectionSoloCapture', 'glyph-cyan')} Solo capture</div>
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
      <p class="kicker">A solo scan keeps the branch open. Save this cadence as a persona or invite a second voice into the ring.</p>
    `;
  }

  function renderIdleState() {
    setMetricKeys('pair');
    $('similarity').textContent = '--';
    $('traceability').textContent = '--';
    $('routePressure').textContent = '--';
    $('custodyState').textContent = '--';
    $('simHint').textContent = 'Drop in at least one voice to get the deck humming.';
    $('traceHint').textContent = '';
    $('routeHint').textContent = '';
    $('custodyHint').textContent = '';
    $('branchFormula').textContent = 'Delta_branch = stylometric surplus above lexical overlap.\nPair two voices to test whether the branch stays resolved or opens into candidate discovery.';
    $('waveFormula').textContent = 'Paste a voice to expose cadence metrics.\nPair two voices to compute resonance, density, and criticality.';
    $('harborFormula').textContent = 'Analyze one or two voices to surface custody drift, archive state, and reuse gain.';
    $('ledgerPreview').textContent = '{\n  "status": "idle"\n}';
    $('fieldNotice').textContent = 'Bring one or two voices into the room. Readout keeps witness, route, harbor, and archive in separate lanes.';
    $('heroSignalValue').textContent = '--';
    $('heroSignalNote').textContent = 'Stage one voice or two and wake the field.';
    $('heroRouteValue').textContent = '--';
    $('heroRouteNote').textContent = 'Route stays latent until a scan runs.';
    $('heroHarborValue').textContent = '--';
    $('heroHarborNote').textContent = 'Harbor shows up only when the field actually earns passage.';
    $('decisionTone').textContent = `${glyphChar('stateDecision', '')} Waiting on a scan`;
    applyGlyphMetadata($('decisionTone'), 'stateDecision');
    $('decisionTone').dataset.state = 'weak-signal';
    $('harborBox').innerHTML = '';
    updateStatePills('buffered', 'weak-signal');
    resetMetricTones();
    document.body.dataset.decision = 'weak-signal';
  }

  function renderSoloReadoutCore({
    metricTraceability,
    metricCustody,
    simHint,
    traceHint,
    routeHint,
    custodyHint,
    branchFormula,
    waveFormula,
    harborFormula,
    ledgerPreview,
    fieldNotice,
    heroSignalValue,
    heroSignalNote,
    heroRouteValue,
    heroRouteNote,
    heroHarborValue,
    heroHarborNote,
    decisionLabel,
    harborName,
    harborStat,
    harborItems,
    harborKicker,
    routeStatus = 'awaiting pair'
  }) {
    setMetricKeys('solo');
    $('similarity').textContent = heroSignalValue;
    $('traceability').textContent = metricTraceability;
    $('routePressure').textContent = heroRouteValue;
    $('custodyState').textContent = metricCustody;
    $('simHint').textContent = simHint;
    $('traceHint').textContent = traceHint;
    $('routeHint').textContent = routeHint;
    $('custodyHint').textContent = custodyHint;
    $('branchFormula').textContent = branchFormula;
    $('waveFormula').textContent = waveFormula;
    $('harborFormula').textContent = harborFormula;
    $('ledgerPreview').textContent = ledgerPreview;
    $('fieldNotice').textContent = fieldNotice;
    $('heroSignalValue').textContent = heroSignalValue;
    $('heroSignalNote').textContent = heroSignalNote;
    $('heroRouteValue').textContent = heroRouteValue;
    $('heroRouteNote').textContent = heroRouteNote;
    $('heroHarborValue').textContent = heroHarborValue;
    $('heroHarborNote').textContent = heroHarborNote;
    $('decisionTone').textContent = `${glyphChar('stateDecision', '')} ${decisionLabel}`;
    applyGlyphMetadata($('decisionTone'), 'stateDecision');
    $('decisionTone').dataset.state = 'hold-branch';
    $('harborBox').innerHTML = `
      <div class="harbor-head">
        <div>
          <div class="section-kicker">${glyphSpanHtml('sectionSoloCapture', 'glyph-cyan')} Solo capture</div>
          <div class="harbor-name">${escapeHtml(harborName)}</div>
        </div>
        <div class="harbor-stat">${escapeHtml(harborStat)}</div>
      </div>
      <div class="harbor-grid">
        ${harborItems.map((item) => `
          <div class="harbor-item">
            <span class="harbor-label">${escapeHtml(item.label)}</span>
            <strong>${escapeHtml(item.value)}</strong>
          </div>
        `).join('')}
      </div>
      <p class="kicker">${escapeHtml(harborKicker)}</p>
    `;
    updateStatePills(routeStatus, 'hold-branch');
    setMetricTone('similarityCard', 'warm');
    setMetricTone('traceabilityCard', 'live');
    setMetricTone('routePressureCard', 'live');
    setMetricTone('custodyCard', 'live');
    document.body.dataset.decision = 'hold-branch';
  }

  function renderSoloState(voiceState) {
    renderSoloReadoutCore({
      metricTraceability: `${voiceState.effectiveProfile.avgSentenceLength.toFixed(1)}w`,
      metricCustody: SLOT_SHORT[voiceState.slot],
      simHint: 'A second voice unlocks contrast. Solo witness mode captures a signature you can keep in this tab.',
      traceHint: 'Sentence rhythm shows how quickly clauses turn, settle, and recur.',
      routeHint: 'Recurrence pressure tracks punctuation, line-break drag, and repeated return-patterns.',
      custodyHint: 'The active bay is where shell assignment and save operations land.',
      branchFormula: 'Delta_branch needs two voices.\nSolo capture stays native to the active bay until a second sample exposes stylometric surplus.',
      waveFormula: `signature = {\n  rhythm: ${voiceState.effectiveProfile.avgSentenceLength.toFixed(1)} words,\n  punct: ${voiceState.effectiveProfile.punctuationDensity},\n  cont: ${voiceState.effectiveProfile.contractionDensity},\n  recurrence: ${voiceState.effectiveProfile.recurrencePressure}\n}`,
      harborFormula: 'Pair a second voice to compute route pressure, custody drift, archive thresholds, and reuse gain.',
      ledgerPreview: JSON.stringify(
        {
          mode: 'solo-capture',
          active_bay: SLOT_SHORT[voiceState.slot],
          cadence_shell: voiceState.shell.label,
          rhythm_words: voiceState.effectiveProfile.avgSentenceLength,
          recurrence_pressure: voiceState.effectiveProfile.recurrencePressure
        },
        null,
        2
      ),
      fieldNotice: `Solo witness is live in the ${SLOT_SHORT[voiceState.slot]} bay. Save the cadence into the session shelf or add a second voice to see whether the pattern can do more than echo.`,
      heroSignalValue: 'SOLO',
      heroSignalNote: `Cadence captured from the ${SLOT_SHORT[voiceState.slot]} bay. Add a second voice if you want a real matchup.`,
      heroRouteValue: formatPct(voiceState.effectiveProfile.recurrencePressure),
      heroRouteNote: 'Solo scans catch rhythm and recurrence, but route still needs a second voice.',
      heroHarborValue: voiceState.shell.mode === 'native' ? 'save.persona' : voiceState.shell.label,
      heroHarborNote:
        voiceState.shell.mode === 'native'
          ? 'You can save this cadence into the session shelf or pair it with a second voice.'
          : 'A cadence shell is already shaping this bay.',
      decisionLabel: 'Solo witness',
      harborName: voiceState.shell.mode === 'native' ? 'cadence capture' : voiceState.shell.label,
      harborStat: `${formatPct(voiceState.effectiveProfile.recurrencePressure)} recurrence`,
      harborItems: [
        { label: 'Bay', value: SLOT_LABELS[voiceState.slot] },
        { label: 'Shell', value: voiceState.shell.label },
        { label: 'Next move', value: 'Save in session or pair' }
      ],
      harborKicker: 'A solo scan keeps the branch open. Save this cadence into the session shelf or invite a second voice into the encounter chamber.'
    });
  }

  function renderHomebaseSoloState(lock) {
    if (!lock?.profile) {
      return;
    }

    setAnalysisRevealState(true);
    readoutOwner = 'homebase';

    renderSoloReadoutCore({
      metricTraceability: `${lock.profile.avgSentenceLength.toFixed(1)}w`,
      metricCustody: 'homebase',
      simHint: 'Reveal is reading one locked cadence home through the same solo path the Deck uses for one live sample.',
      traceHint: 'Sentence rhythm, punctuation pressure, and return-patterns are enough to make a cadence feel uncomfortably legible.',
      routeHint: 'Recurrence pressure is still being measured without a second voice, but the signature is already exposed.',
      custodyHint: 'This is a private cadence home, not a Deck bay. Save controls the archive; Reveal controls exposure.',
      branchFormula: 'Delta_branch still needs two voices.\nHomebase reveal uses the solo capture path: one cadence, one signature, no verdict.',
      waveFormula: `signature = {\n  rhythm: ${lock.profile.avgSentenceLength.toFixed(1)} words,\n  punct: ${lock.profile.punctuationDensity},\n  cont: ${lock.profile.contractionDensity},\n  recurrence: ${lock.profile.recurrencePressure}\n}`,
      harborFormula: 'A revealed cadence home wakes Telemetry and Harbor through solo capture. Pairing still belongs to the Deck.',
      ledgerPreview: JSON.stringify(
        {
          mode: 'homebase-capture',
          cadence_home: lock.name,
          sample_count: lock.stats?.sampleCount || lock.samples?.length || 0,
          rhythm_words: lock.profile.avgSentenceLength,
          recurrence_pressure: lock.profile.recurrencePressure
        },
        null,
        2
      ),
      fieldNotice: `${lock.name} is revealed. The browser can already recover enough rhythm, punctuation, and recurrence to make this cadence home feel cross-context legible before any second voice enters the room.`,
      heroSignalValue: 'SOLO',
      heroSignalNote: `${lock.name} is now reading as an exposed cadence signature.`,
      heroRouteValue: formatPct(lock.profile.recurrencePressure),
      heroRouteNote: 'Homebase reveal does not force route. It only shows how much of the cadence already persists as a signature.',
      heroHarborValue: lock.name,
      heroHarborNote: 'The cadence home is revealed, but still private until you decide what to keep in session, compare, or send back into the Deck.',
      decisionLabel: 'Exposed signature',
      harborName: lock.name,
      harborStat: `${formatPct(lock.profile.recurrencePressure)} recurrence`,
      harborItems: [
        { label: 'State', value: homebaseLockKey(lock) === 'staged' ? 'staged reveal' : 'saved reveal' },
        { label: 'Shell', value: 'cadence home' },
        { label: 'Next move', value: 'Keep in session, mask, or pair' }
      ],
      harborKicker: 'Homebase reveal is not a verdict. It is the point where a private cadence home becomes explicitly measurable through the solo witness path.',
      routeStatus: 'awaiting pair'
    });
  }

  function releaseHomebaseReadout() {
    if (readoutOwner !== 'homebase') {
      return;
    }

    readoutOwner = 'idle';
    setAnalysisRevealState(false);
    const voiceStateA = getVoiceState('A');
    const voiceStateB = getVoiceState('B');

    if (voiceStateA.hasText || voiceStateB.hasText) {
      analyzeCadences({ reveal: false });
      return;
    }

    renderIdleState();
    updateControls();
    renderPersonas();
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
        : 'Similarity is present, but TCP still separates surface overlap from actual route pressure.';
    $('traceHint').textContent =
      cmp.traceability > 0.7
        ? 'Cadence habits are surviving paraphrase, which makes witness pressure more legible.'
        : 'Traceability is still diffuse, so the pattern stays more atmospheric than evidentiary.';
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
        ? 'The custody delta fell below collapse, so witness custody is functioning as the effective archive.'
        : 'Institutional custody remains above collapse and therefore continues to function as the effective archive.';
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
                ? `TCP is keeping the pair in branch mode. Similarity is ${cmp.similarity.toFixed(2)} and traceability is ${cmp.traceability.toFixed(2)}, so the deck can stay curious without pretending it has a verdict.`
                : `The pattern is still light. Similarity is ${cmp.similarity.toFixed(2)} and traceability is ${cmp.traceability.toFixed(2)}, so TCP keeps the encounter playful instead of forcing route.`;
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
    readoutOwner = 'deck';
    document.body.dataset.bootStage = 'analyze-enter';
    const voiceStateA = getVoiceState('A');
    const voiceStateB = getVoiceState('B');

    renderVoiceProfiles(voiceStateA, voiceStateB);

    if (!voiceStateA.hasText && !voiceStateB.hasText) {
      document.body.dataset.bootStage = 'analyze-idle';
      renderIdleState();
      setStatusMessage('Paste one voice or a pair, then press Analyze Cadences.');
      updateControls();
      renderPersonas();
      return;
    }

    if (!voiceStateA.hasText || !voiceStateB.hasText) {
      document.body.dataset.bootStage = 'analyze-solo';
      const soloState = voiceStateA.hasText ? voiceStateA : voiceStateB;
      renderSoloState(soloState);
      setStatusMessage(`Solo witness complete in the ${SLOT_SHORT[soloState.slot]} bay. Save it as a persona or throw in a second voice for contrast.`);
      updateControls();
      renderPersonas();
      return;
    }

    document.body.dataset.bootStage = 'analyze-pair';
    renderPairState(voiceStateA, voiceStateB);
    setStatusMessage('Duel wake complete. Read the shell cards, try a swap, or save a persona.');
    updateControls();
    renderPersonas();
    document.body.dataset.bootStage = 'analyze-complete';
  }

  function handleAnalyzeCadences() {
    clearSwapCadenceAudit();
    analyzeCadences({ reveal: true });
  }

  function setActiveVoice(slot) {
    activeVoice = slot;
    renderVoiceProfiles();
    renderPersonas();
    updateControls();
  }

  function buildTrainerDraftContext(preferredPersonaId = '') {
    const state = buildPersonaGalleryState();
    const preferredPersona = preferredPersonaId ? findPersona(preferredPersonaId) : null;
    const activeVoiceState = getVoiceState(activeVoice);
    const sourceText = String(
      state.comparisonText?.trim()
        ? state.comparisonText
        : activeVoiceState.text?.trim()
          ? activeVoiceState.text
          : state.lock?.samples?.[0] || ''
    ).trim();
    const sourceOrigin = state.comparisonText?.trim()
      ? 'Homebase comparison text'
      : activeVoiceState.text?.trim()
        ? `${SLOT_SHORT[activeVoice]} bay source text`
        : state.lock?.samples?.[0]
          ? `${state.lock.name} sample one`
          : '';
    const persona = preferredPersona || state.selectedMask || state.wornMask || null;
    const corpusText = String(
      state.lock?.samples?.length
        ? state.lock.samples.join('\n\n')
        : activeVoiceState.text?.trim()
          ? activeVoiceState.text
          : ''
    ).trim();

    return {
      persona,
      sourceText,
      sourceOrigin,
      corpusText,
      corpusOrigin: state.lock?.samples?.length
        ? `${state.lock.name} cadence home`
        : activeVoiceState.text?.trim()
          ? `${SLOT_SHORT[activeVoice]} bay`
          : '',
      selectedMaskId: state.selectedMask?.id || '',
      wornMaskId: state.wornMask?.id || '',
      activeLockId: state.lock?.id || ''
    };
  }

  function openPersonaInTrainer(id) {
    const persona = findPersona(id);
    if (!persona) {
      return;
    }
    gallerySelectedMaskId = id;
    const context = buildTrainerDraftContext(id);
    setArtifactTab('trainer');
    renderPersonas();
    if (trainerController && typeof trainerController.openContext === 'function') {
      trainerController.openContext({
        ...context,
        forcePopulate: true
      });
    }
    const focusTarget = $('trainerForgeDraftBtn');
    if (focusTarget && typeof focusTarget.focus === 'function') {
      focusTarget.focus({ preventScroll: true });
    }
    setStatusMessage(`${persona.name} is staged in Trainer. Forge Draft can now seed a live candidate from current field context.`);
  }

  function selectMaskPersona(id) {
    if (!findPersona(id)) {
      return;
    }
    gallerySelectedMaskId = id;
    renderPersonas();
  }

  function wearPersonaInHomebase(id) {
    const persona = findPersona(id);
    if (!persona) {
      return;
    }
    gallerySelectedMaskId = id;
    homebaseWornMaskId = id;
    setArtifactTab('homebase');
    renderPersonas();
    const lock = currentHomebaseLock();
    const comparisonText = String($('personaComparisonText')?.value || '').trim();
    if (!lock) {
      $('cadenceLockCorpus')?.focus();
      setStatusMessage(`${persona.name} is now worn in Homebase. Stage or select a cadence home so the passage bench has something real to read against.`);
      return;
    }
    if (!comparisonText) {
      $('personaComparisonText')?.focus();
      setStatusMessage(`${persona.name} is worn against ${lock.name}. Paste comparison text to pass a source through it and read what clings.`);
      return;
    }
    $('personaComparisonText')?.focus();
    setStatusMessage(`${persona.name} is now carrying passage in Homebase against ${lock.name}. Source, through-mask, and residue are all live.`);
  }

  function clearHomebaseWornMask() {
    const wornMask = getHomebaseWornMask();
    homebaseWornMaskId = '';
    renderPersonas();
    if (wornMask) {
      setStatusMessage(`${wornMask.name} was released from Homebase. The cadence home is still there; bring in another mask when you want passage back on the bench.`);
    }
  }

  function assignPersonaToBay(id, slot = activeVoice) {
    const persona = findPersona(id);
    if (!persona) {
      return;
    }

    activeVoice = slot;
    gallerySelectedMaskId = id;
    clearSwapCadenceAudit();
    bayShells[slot] = createPersonaShell(persona);
    setArtifactTab('play');
    analyzeCadences();
    setStatusMessage(`${persona.name} is now shaping the ${SLOT_SHORT[slot]} cadence shell. The text stayed put; only the cadence shell changed.`);
  }

  function assignPersonaToActiveBay(id) {
    assignPersonaToBay(id, activeVoice);
  }

  function lockCadenceFromGallery() {
    if (!personaGalleryModel) {
      return;
    }

    const corpusText = $('cadenceLockCorpus') ? $('cadenceLockCorpus').value : '';
    const lockName = $('cadenceLockName') ? $('cadenceLockName').value : '';

    try {
      const lock = normalizeCadenceLock(personaGalleryModel.buildCadenceLockRecord(window.TCP_ENGINE, {
        corpusText,
        name: lockName
      }));
      stagedCadenceLock = lock;
      clearHomebaseReveal();
      releaseHomebaseReadout();
      renderPersonas();
      setStatusMessage(`${lock.name} is staged in Homebase. The mask bench is live now; Reveal opens the dossier, and Save keeps it in the session archive for this tab.`);
    } catch (error) {
      setStatusMessage(error.message || 'Paste at least one sample before locking a cadence home.');
    }
  }

  function saveStagedCadenceLock() {
    if (!stagedCadenceLock) {
      setStatusMessage('Stage a cadence home before trying to save it.');
      return;
    }

    cadenceLocks = [
      stagedCadenceLock,
      ...cadenceLocks.filter((entry) => entry.id !== stagedCadenceLock.id)
    ];
    activeCadenceLockId = stagedCadenceLock.id;
    const wasRevealed = revealedCadenceLockKey === 'staged';
    stagedCadenceLock = null;
    persistCadenceLocks();
    persistActiveCadenceLockId();
    if (wasRevealed) {
      revealedCadenceLockKey = activeCadenceLockId;
    }
    renderPersonas();
    setStatusMessage(`${getActiveCadenceLock()?.name || 'Cadence home'} is now saved in the session archive for this tab.`);
  }

  function revealCadenceLock() {
    const lock = currentHomebaseLock();
    if (!lock) {
      setStatusMessage('Stage or select a cadence home before trying to reveal it.');
      return;
    }

    setHomebaseReveal(lock);
    renderHomebaseSoloState(lock);
    renderPersonas();
    setStatusMessage(`${lock.name} is revealed. Telemetry and Harbor are now reading it through the solo path.`);
  }

  function selectCadenceLock(lockId = '') {
    if (!cadenceLocks.some((lock) => lock.id === lockId)) {
      return;
    }
    stagedCadenceLock = null;
    activeCadenceLockId = lockId;
    clearHomebaseReveal();
    persistActiveCadenceLockId();
    releaseHomebaseReadout();
    renderPersonas();
    const lock = getActiveCadenceLock();
    setStatusMessage(`${lock?.name || 'Cadence home'} is active in Homebase. Reveal when you want the dossier and solo readout live.`);
  }

  function deleteCadenceLock(lockId = '') {
    const lock = cadenceLocks.find((entry) => entry.id === lockId);
    cadenceLocks = cadenceLocks.filter((entry) => entry.id !== lockId);
    if (revealedCadenceLockKey === lockId) {
      clearHomebaseReveal();
      releaseHomebaseReadout();
    }
    if (activeCadenceLockId === lockId) {
      activeCadenceLockId = cadenceLocks[0]?.id || '';
      persistActiveCadenceLockId();
    }
    persistCadenceLocks();
    renderPersonas();
    setStatusMessage(`${lock?.name || 'Cadence home'} was removed from the session archive in this tab.`);
  }

  function sendActiveLockToDeck() {
    const lock = currentHomebaseLock();
    const sample = lock?.samples?.[0];
    if (!sample) {
      setStatusMessage('Select a cadence home before sending it back into the Deck.');
      return;
    }

    const slot = activeVoice;
    $(slotTextId(slot)).value = sample.text;
    baySampleIds[slot] = null;
    bayShells[slot] = createNativeShell();
    clearSwapCadenceAudit();
    syncBaySampleMetadata();
    setArtifactTab('play');
    analyzeCadences();
    setStatusMessage(`${lock.name} sample one is now loaded into the ${SLOT_SHORT[slot]} bay.`);
  }

  function updateSavedPersona(id, updater) {
    savedPersonas = savedPersonas.map((persona) => {
      if (persona.id !== id) {
        return persona;
      }
      return normalizeStoredPersona(updater(persona));
    });
    persistSavedPersonas();
    renderPersonas();
  }

  function generateMaskForPersona(id) {
    openPersonaInTrainer(id);
  }

  function swapCadences() {
    const voiceStateA = getVoiceState('A');
    const voiceStateB = getVoiceState('B');

    if (!voiceStateA.hasText || !voiceStateB.hasText) {
      setStatusMessage('Swap Cadences needs both bays populated. Two live voices, then shell trading.');
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
    analyzeCadences({ reveal: true });
    const afterSnapshot = readDeckSnapshot();
    const afterVoiceA = getVoiceState('A');
    const afterVoiceB = getVoiceState('B');
    lastSwapCadenceAudit = buildSwapCadenceAudit(beforeSnapshot, afterSnapshot, afterVoiceA, afterVoiceB);

    revealShellDuel();
    setSwapStatusMessage(describeSwapCadenceAudit(lastSwapCadenceAudit, beforeSnapshot, afterSnapshot));
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
    const nextSampleIdA = baySampleIds.B;
    const nextSampleIdB = baySampleIds.A;
    $('voiceA').value = nextA;
    $('voiceB').value = nextB;
    baySampleIds = {
      A: nextSampleIdA,
      B: nextSampleIdB
    };
    clearSwapCadenceAudit();
    syncBaySampleMetadata();
    analyzeCadences();
    const focusTarget = activeVoice === 'A' ? $('voiceA') : $('voiceB');
    if (focusTarget && typeof focusTarget.focus === 'function') {
      focusTarget.focus({ preventScroll: true });
    }
    setStatusMessage('Bay text swapped. Each shell stayed loyal to its original side.');
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
    const persona = normalizeStoredPersona({
      id: `saved-${Date.now()}`,
      name: buildSavedPersonaName(activeVoice),
      blurb: `Captured from the ${SLOT_SHORT[activeVoice]} bay. Rhythm ${profile.avgSentenceLength.toFixed(1)}w, recurrence ${formatPct(profile.recurrencePressure)}.`,
      chips: ['captured shell', SLOT_SHORT[activeVoice], `rhythm ${profile.avgSentenceLength.toFixed(1)}w`],
      mod: cadenceModFromProfile(profile),
      profile: { ...profile },
      strength: 0.76,
      source: 'saved'
    });

    savedPersonas = [persona, ...savedPersonas];
    gallerySelectedMaskId = persona.id;
    persistSavedPersonas();
    bayShells[activeVoice] = createPersonaShell(persona);
    renderPersonas();
    updateControls();
    analyzeCadences();
    setStatusMessage(`${persona.name} was kept in this tab and assigned to the ${SLOT_SHORT[activeVoice]} bay.`);
  }

  function normalizeTrainerPersona(persona = {}) {
    return normalizeStoredPersona({
      id: persona.id || `trainer-${Date.now()}`,
      name: persona.name || 'Trainer Persona',
      blurb: persona.blurb || 'Derived retrieval shell.',
      chips: Array.isArray(persona.chips) ? [...persona.chips] : ['trainer'],
      mod: persona.mod ? { ...persona.mod } : null,
      profile: persona.profile ? { ...persona.profile } : null,
      strength: persona.strength || 0.82,
      source: 'trainer'
    });
  }

  function injectTrainerPersona(persona = {}) {
    const normalized = normalizeTrainerPersona(persona);
    savedPersonas = [
      normalized,
      ...savedPersonas.filter((entry) => entry.id !== normalized.id)
    ];
    gallerySelectedMaskId = normalized.id;
    persistSavedPersonas();
    renderPersonas();
    updateControls();
    return normalized;
  }

  function resetDeck() {
    clearSwapCadenceAudit();
    $('voiceA').value = defaults.voiceA;
    $('voiceB').value = defaults.voiceB;
    baySampleIds = {
      A: defaults.voiceA_sample_id || inferSampleIdFromText(defaults.voiceA),
      B: defaults.voiceB_sample_id || inferSampleIdFromText(defaults.voiceB)
    };
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
    syncBaySampleMetadata();
    renderVoiceProfiles();
    renderPersonas();
    analyzeCadences({ reveal: keepRevealed });
    setStatusMessage(
      keepRevealed
        ? 'Deck reset. Native cadences restored and both bays cleared for a new pair.'
        : 'Deck reset. Native cadences restored, both bays cleared, and the deck went latent again. Press Analyze Cadences when you want it live.'
    );
  }

  function handleTextInput(slot) {
    const shell = bayShells[slot];
    const releasedBorrowedShell = shell && shell.mode === 'borrowed';
    if (releasedBorrowedShell) {
      bayShells[slot] = createNativeShell();
    }

    baySampleIds[slot] = inferSampleIdFromText($(slotTextId(slot)).value);
    clearSwapCadenceAudit();
    syncBaySampleMetadata();
    activeVoice = slot;
    if (readoutOwner !== 'homebase') {
      collapseAnalysisDeck();
    }
    renderVoiceProfiles();
    updateControls();
    renderPersonas();
    setStatusMessage(
      releasedBorrowedShell
        ? `Text changed in the ${SLOT_SHORT[slot]} bay. The borrowed shell was released, so the new sample is back on native cadence until you swap or assign again.`
        : readoutOwner === 'homebase'
          ? `Text changed in the ${SLOT_SHORT[slot]} bay. Homebase reveal is still owning the readout until you analyze the Deck again.`
          : `Text changed in the ${SLOT_SHORT[slot]} bay. Press Analyze Cadences to refresh the readout.`
    );
  }

  function captureFlightState() {
    return {
      voiceA: $('voiceA').value,
      voiceB: $('voiceB').value,
      cadenceLockName: $('cadenceLockName') ? $('cadenceLockName').value : '',
      cadenceLockCorpus: $('cadenceLockCorpus') ? $('cadenceLockCorpus').value : '',
      personaComparisonText: $('personaComparisonText') ? $('personaComparisonText').value : '',
      baySampleIds: {
        A: baySampleIds.A,
        B: baySampleIds.B
      },
      badge,
      mirrorLogic,
      containment,
      activeVoice,
      activeArtifactTab,
      artifactHash: window.location.hash || artifactHashForTab(activeArtifactTab),
      bayShells: {
        A: cloneShell(bayShells.A),
        B: cloneShell(bayShells.B)
      },
      savedPersonas: JSON.parse(JSON.stringify(savedPersonas)),
      cadenceLocks: JSON.parse(JSON.stringify(cadenceLocks)),
      activeCadenceLockId,
      stagedCadenceLock: stagedCadenceLock ? JSON.parse(JSON.stringify(stagedCadenceLock)) : null,
      revealedCadenceLockKey,
      readoutOwner,
      gallerySelectedMaskId,
      homebaseWornMaskId,
      trainerState: trainerController && typeof trainerController.serializeState === 'function'
        ? trainerController.serializeState()
        : null
    };
  }

  function restoreFlightState(state) {
    $('voiceA').value = state.voiceA;
    $('voiceB').value = state.voiceB;
    if ($('cadenceLockName')) {
      $('cadenceLockName').value = state.cadenceLockName || '';
    }
    if ($('cadenceLockCorpus')) {
      $('cadenceLockCorpus').value = state.cadenceLockCorpus || '';
    }
    if ($('personaComparisonText')) {
      $('personaComparisonText').value = state.personaComparisonText || '';
    }
    baySampleIds = {
      A: state.baySampleIds?.A || inferSampleIdFromText(state.voiceA),
      B: state.baySampleIds?.B || inferSampleIdFromText(state.voiceB)
    };
    badge = state.badge;
    mirrorLogic = state.mirrorLogic;
    containment = state.containment;
    activeVoice = state.activeVoice;
    activeArtifactTab = normalizeArtifactTab(state.artifactHash || state.activeArtifactTab);
    bayShells = {
      A: cloneShell(state.bayShells.A),
      B: cloneShell(state.bayShells.B)
    };
    savedPersonas = (state.savedPersonas || []).map((persona) => normalizeStoredPersona(persona));
    cadenceLocks = (state.cadenceLocks || []).map((lock) => normalizeCadenceLock(lock));
    activeCadenceLockId = state.activeCadenceLockId || cadenceLocks[0]?.id || '';
    stagedCadenceLock = state.stagedCadenceLock ? normalizeCadenceLock(state.stagedCadenceLock) : null;
    revealedCadenceLockKey = state.revealedCadenceLockKey || '';
    readoutOwner = state.readoutOwner || 'idle';
    gallerySelectedMaskId = state.gallerySelectedMaskId || '';
    homebaseWornMaskId = state.homebaseWornMaskId || '';
    persistSavedPersonas();
    persistCadenceLocks();
    persistActiveCadenceLockId();
    setArtifactTab(activeArtifactTab, { updateHash: true, replaceHash: true });
    syncBaySampleMetadata();
    renderVoiceProfiles();
    renderPersonas();
    if (trainerController && typeof trainerController.restoreState === 'function') {
      trainerController.restoreState(state.trainerState || {});
    }
    const revealedLock = currentHomebaseLock();
    if (readoutOwner === 'homebase' && homebaseLockRevealed(revealedLock)) {
      renderHomebaseSoloState(revealedLock);
      renderPersonas();
      updateControls();
    } else {
      analyzeCadences({ reveal: analysisRevealed });
    }
  }

  function readDeckSnapshot() {
    const readText = (id) => {
      const node = $(id);
      return node ? node.textContent.trim() : '';
    };
    const routeNode = $('routeState');
    const cueNode = $('swapActionCue');

    return {
      decision: document.body.dataset.decision,
      decisionTone: readText('decisionTone'),
      similarity: readText('similarity'),
      traceability: readText('traceability'),
      routePressure: readText('routePressure'),
      custody: readText('custodyState'),
      heroHarbor: readText('heroHarborValue'),
      routeState: readText('routeState'),
      castReport: readText('deckCastReport'),
      statusBase: readText('analysisStatusBase'),
      routeStatusKey: routeNode ? routeNode.dataset.routeStatusKey || '' : '',
      statusCue: cueNode ? cueNode.textContent.trim() : '',
      statusCueKey: cueNode ? cueNode.dataset.cueKey || '' : '',
      statusCueVisible: cueNode ? !cueNode.hidden : false,
      swapMedallionDisabled: $('swapMedallion').disabled,
      duelState: $('shellDuel').dataset.state,
      duelSource: readText('duelSourceStatus'),
      duelSimilarity: readText('duelSimilarity'),
      duelTraceability: readText('duelTraceability'),
      duelSentenceDrift: readText('duelSentenceDrift'),
      duelFunctionWordDistance: readText('duelFunctionWordDistance'),
      voiceAProfile: readText('voiceAProfile'),
      voiceBProfile: readText('voiceBProfile'),
      voiceASampleId: $('voiceA')?.dataset.sampleId || '',
      voiceBSampleId: $('voiceB')?.dataset.sampleId || '',
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
    baySampleIds = {
      A: inferSampleIdFromText(voiceA),
      B: inferSampleIdFromText(voiceB)
    };
    badge = nextBadgeState;
    mirrorLogic = nextMirrorLogic;
    containment = nextContainment;
    bayShells = {
      A: cloneShell(nextShells.A),
      B: cloneShell(nextShells.B)
    };
    activeVoice = nextActiveVoice;
    syncBaySampleMetadata();
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
      currentBadgeValue: ingress.currentBadge || '',
      currentBadgeToken: ingress.currentBadgeToken || '',
      sealSequenceIndex: ingress.sealSequenceIndex,
      sealRejectedNode: ingress.sealRejectedNode || '',
      mirrorControlsHidden: $('ingressMirrorControls').hidden,
      badgeControlsHidden: $('ingressBadgeControls').hidden,
      sealNodesHidden: $('ingressSealNodes') ? $('ingressSealNodes').hidden : true,
      status: readText('ingressStatus'),
      cue: readText('ingressCueLabel'),
      cueGlyph: readText('ingressCueGlyph'),
      cueGlyphKey: $('ingressCueGlyph') ? $('ingressCueGlyph').dataset.glyphKey || '' : '',
      coreGlyph: readText('ingressCoreGlyph'),
      coreGlyphKey: $('ingressCoreGlyph') ? $('ingressCoreGlyph').dataset.glyphKey || '' : '',
      sealGlyphs: [
        $('ingressSealNodeUl'),
        $('ingressSealNodeUr'),
        $('ingressSealNodeBc')
      ].map((node) => {
        const glyphNode = node ? node.querySelector('span[aria-hidden="true"]') : null;
        return glyphNode ? glyphNode.textContent.trim() : '';
      }),
      badgeReadout: readText('ingressBadgeReadout'),
      bodyOverflow: window.getComputedStyle(document.body).overflow,
      layerOverflowY: layer ? window.getComputedStyle(layer).overflowY : '',
      layerHasVerticalOverflow: layer ? layer.scrollHeight > layer.clientHeight + 1 : false
    };
  }

  function readShellGlyphSnapshot() {
    const readGlyph = (key) => {
      const node = document.querySelector(`[data-glyph-key="${key}"]`);
      return {
        glyph: node ? node.textContent.trim() : '',
        semanticClass: node ? node.dataset.semanticClass || '' : '',
        semioticRole: node ? node.dataset.semioticRole || '' : '',
        activationState: node ? node.dataset.activationState || '' : '',
        retrievalTags: node ? (node.dataset.retrievalTags || '').split('|').filter(Boolean) : []
      };
    };

    return {
      tabs: {
        console: readGlyph('tabConsole'),
        homebase: readGlyph('tabHomebase'),
        deck: readGlyph('tabDeck'),
        readout: readGlyph('tabReadout'),
        personas: readGlyph('tabPersonas'),
        trainer: readGlyph('tabTrainer')
      },
      readoutStrip: {
        signal: readGlyph('readoutSignal'),
        route: readGlyph('readoutRoute'),
        harbor: readGlyph('readoutHarbor')
      },
      footer: readGlyph('footerSeal')
    };
  }

  function readTrainerSnapshot() {
    const exportOutput = $('trainerExportOutput');
    const promptOutput = $('trainerPromptOutput');
    const validationStatus = $('trainerValidationReport');
    const hints = $('trainerCorrectionHints');

    return trainerController && typeof trainerController.snapshot === 'function'
      ? {
          ...trainerController.snapshot(),
          promptLength: promptOutput ? promptOutput.value.trim().length : 0,
          exportLength: exportOutput ? exportOutput.value.trim().length : 0,
          validationTextLength: validationStatus ? validationStatus.textContent.trim().length : 0,
          hintsTextLength: hints ? hints.textContent.trim().length : 0
        }
      : {
          personaName: '',
          corpusReady: false,
          sampleCount: 0,
          promptReady: false,
          validationReady: false,
          validationPass: false,
          validationStatus: 'unavailable',
          draftReady: false,
          draftSource: '',
          draftPersonaId: '',
          draftPersonaName: '',
          generatedLength: 0,
          exportReady: false,
          canInject: false,
          lastInjectedPersonaSummary: null,
          statusMessage: '',
          statusCue: '',
          statusCueKey: '',
          promptLength: 0,
          exportLength: 0,
          validationTextLength: 0,
          hintsTextLength: 0
        };
  }

  function readPersonaGallerySnapshot() {
    const state = buildPersonaGalleryState();
    const selectedShelfChipText = state.selectedMask?.id
      ? Array.from(document.querySelectorAll(`.persona[data-id="${state.selectedMask.id}"] .chip`)).map((node) => node.textContent.trim()).join(' | ')
      : '';
    return {
      lockCount: cadenceLocks.length,
      activeLockId: state.savedLock?.id || '',
      activeLockName: state.savedLock?.name || '',
      homebaseLockId: state.lock?.id || '',
      homebaseLockName: state.lock?.name || '',
      stagedLockId: stagedCadenceLock?.id || '',
      stagedLockPresent: Boolean(stagedCadenceLock),
      revealed: state.revealed,
      dossierReady: Boolean(state.dossier),
      selectedMaskId: state.selectedMask?.id || '',
      selectedMaskName: state.selectedMask?.name || '',
      homebaseWornMaskId: state.wornMask?.id || '',
      homebaseWornMaskName: state.wornMask?.name || '',
      selectedMaskState: state.selectedMask?.maskState || '',
      homebaseWornMaskState: state.wornMask?.maskState || '',
      comparisonReady: Boolean(state.comparisonText.trim()),
      comparisonLength: state.comparisonText.trim().length,
      maskedOutputLength: state.comparison?.maskedText?.trim().length || 0,
      rawSimilarity: state.comparison?.rawToLock?.meanSimilarity || 0,
      rawTraceability: state.comparison?.rawToLock?.meanTraceability || 0,
      maskedSimilarity: state.comparison?.maskedToLock?.meanSimilarity || 0,
      maskedTraceability: state.comparison?.maskedToLock?.meanTraceability || 0,
      deltaSimilarity: state.comparison?.deltaToLock?.similarity || 0,
      deltaTraceability: state.comparison?.deltaToLock?.traceability || 0,
      homeStickyLanes: state.comparison?.whatHeld || [],
      maskState: state.wornMask?.maskState || state.selectedMask?.maskState || '',
      maskContactFieldEffect: state.comparison?.contactSummary?.fieldEffect || '',
      homebasePhase: state.fieldGrammar?.homebase?.surfacePhase || '',
      personasPhase: state.fieldGrammar?.personas?.surfacePhase || '',
      personaCount: state.library.length,
      readoutOwner,
      homebaseStatusText: $('homebaseStatus')?.textContent.trim() || '',
      homebaseMaskStatusText: $('homebaseMaskStatus')?.textContent.trim() || '',
      maskBenchStatusText: $('maskBenchStatus')?.textContent.trim() || '',
      selectedMaskFingerprintText: $('selectedMaskFingerprint')?.textContent.trim() || '',
      selectedMaskProvenanceText: $('selectedMaskProvenance')?.textContent.trim() || '',
      selectedShelfChipText
    };
  }

  function runSwapCadenceMatrixReport() {
    return buildSwapCadenceMatrix(FULL_SAMPLE_LIBRARY, {
      orderedPairs: DIAGNOSTIC_BATTERY.swapPairs,
      flagshipPairs: SWAP_FLAGSHIP_PAIRS,
      strength: 0.82
    });
  }

  function canonicalSemanticContractFromTrace(trace = {}) {
    const realization = trace.realizationSummary || trace.finalRealization || {};
    const plan = trace.planSummary || {};
    const semanticAudit = trace.semanticAudit || {};
    const protectedAudit = trace.protectedAnchorAudit || {};
    const relationInventory = Array.isArray(plan.relationInventory)
      ? [...new Set(plan.relationInventory)].sort()
      : plan.relationInventory && typeof plan.relationInventory === 'object'
        ? Object.keys(plan.relationInventory)
          .sort((left, right) => left.localeCompare(right))
          .map((key) => `${key}:${plan.relationInventory[key]}`)
        : [];

    return {
      transferClass: realization.transferClass || 'native',
      realizationTier: realization.realizationTier || 'none',
      changedDimensions: [...new Set(realization.changedDimensions || [])].sort(),
      lexemeSwapFamilies: [...new Set((realization.lexemeSwaps || []).map((swap) => swap.family))].sort(),
      relationInventory,
      structuralOperations: [...new Set(plan.structuralOperationsSelected || [])].sort(),
      lexicalOperations: [...new Set(plan.lexicalRegisterOperationsSelected || [])].sort(),
      connectorStrategy: plan.connectorStrategy || 'balanced',
      contractionStrategy: plan.contractionStrategy || 'hold',
      propositionCoverage: semanticAudit.propositionCoverage ?? 1,
      actorCoverage: semanticAudit.actorCoverage ?? 1,
      actionCoverage: semanticAudit.actionCoverage ?? 1,
      objectCoverage: semanticAudit.objectCoverage ?? 1,
      polarityMismatches: semanticAudit.polarityMismatches ?? 0,
      tenseMismatches: semanticAudit.tenseMismatches ?? 0,
      protectedAnchorIntegrity: protectedAudit.protectedAnchorIntegrity ?? semanticAudit.protectedAnchorIntegrity ?? 1
    };
  }

  window.TCP_RETRIEVAL_LANE = Object.freeze({
    getActiveTransferTrace(slot) {
      if (slot !== 'A' && slot !== 'B') {
        return null;
      }

      return getVoiceState(slot).transferTrace || null;
    },
    getCanonicalTrace(caseId) {
      return retrievalFixtureCase(caseId)?.retrievalTrace || null;
    },
    getCanonicalCase(caseId) {
      return retrievalFixtureCase(caseId);
    },
    listCanonicalCaseIds() {
      return retrievalFixtureIds();
    },
    getSemanticAudit(key) {
      if (key === 'A' || key === 'B') {
        return getVoiceState(key).transferTrace?.semanticAudit || null;
      }

      return retrievalFixtureCase(key)?.retrievalTrace?.semanticAudit || null;
    },
    getLastSwapCadenceAudit() {
      return lastSwapCadenceAudit
        ? JSON.parse(JSON.stringify(lastSwapCadenceAudit))
        : null;
    },
    getSwapCadenceFlagshipCases() {
      return JSON.parse(JSON.stringify(SWAP_FLAGSHIP_PAIRS));
    },
    runSwapCadenceMatrix() {
      return JSON.parse(JSON.stringify(runSwapCadenceMatrixReport()));
    }
  });

  async function initializePersonaGallery() {
    personaGalleryModel = await import(PERSONA_GALLERY_MODULE_URL);
    resolvedBasePersonas = personaGalleryModel.resolvePersonaCatalog(window.TCP_ENGINE, basePersonas, FULL_SAMPLE_LIBRARY);
    savedPersonas = loadSavedPersonas();
    cadenceLocks = loadCadenceLocks();
    activeCadenceLockId = loadActiveCadenceLockId();
    const activeLock = getActiveCadenceLock();
    if (activeLock && activeLock.id !== activeCadenceLockId) {
      activeCadenceLockId = activeLock.id;
      persistActiveCadenceLockId();
    }
    gallerySelectedMaskId = '';
    homebaseWornMaskId = '';

    window.TCP_PERSONA_GALLERY = Object.freeze({
      snapshot: () => readPersonaGallerySnapshot(),
      selectLock: (lockId) => selectCadenceLock(lockId),
      lock: () => lockCadenceFromGallery(),
      reveal: () => revealCadenceLock(),
      save: () => saveStagedCadenceLock(),
      selectMask: (personaId) => selectMaskPersona(personaId),
      wearHomebase: (personaId) => wearPersonaInHomebase(personaId),
      bringHomebase: (personaId) => wearPersonaInHomebase(personaId),
      openTrainer: (personaId) => openPersonaInTrainer(personaId),
      generateMask: (personaId) => openPersonaInTrainer(personaId)
    });

    return personaGalleryModel;
  }

  async function initializeTrainerLab() {
    const root = $('trainerPane');
    if (!root) {
      return null;
    }

    const module = await import(TRAINER_MODULE_URL);
    trainerController = await module.createTrainerController({
      root,
      engine: window.TCP_ENGINE,
      sampleLibrary: FULL_SAMPLE_LIBRARY,
      onInjectPersona: injectTrainerPersona,
      resolveDraftContext: () => buildTrainerDraftContext(),
      onStatus: (message) => {
        setStatusMessage(message);
        renderTrainerBridge();
        renderConsoleStationGrid(buildPersonaGalleryState());
      },
      applyStaticGlyphs
    });

    window.TCP_TRAINER_LAB = Object.freeze({
      snapshot: () => trainerController?.snapshot() || null,
      serializeState: () => trainerController?.serializeState() || null,
      restoreState: (state) => trainerController?.restoreState(state),
      openContext: (context) => trainerController?.openContext(context),
      extract: () => trainerController?.extract(),
      forgeDraft: () => trainerController?.forgeDraft(),
      validate: () => trainerController?.validate(),
      toggleReleaseGate: () => trainerController?.toggleReleaseGate(),
      exportSpec: () => trainerController?.exportSpec(),
      inject: () => trainerController?.inject()
    });

    renderTrainerBridge();

    return trainerController;
  }

  function primeIngressScenario({
    phase = 'containment',
    targetMirror = 'off',
    targetBadge = 'badge.holds',
    currentMirror = null,
    currentBadge = null
  } = {}) {
    clearIngressTimers();
    const targetBadgeId = resolveIngressBadgeTarget(targetBadge) || INGRESS_BADGE_OPTIONS[0].id;
    const targetBadgeOption = ingressBadgeOption(targetBadgeId);
    const currentBadgeId = currentBadge ? (resolveIngressBadgeTarget(currentBadge) || currentBadge) : null;
    const currentBadgeOption = currentBadgeId ? ingressBadgeOption(currentBadgeId) : null;
    ingress.enabled = true;
    ingress.phase = phase;
    ingress.holding = null;
    ingress.holdStartedAt = 0;
    ingress.holdPointerId = null;
    ingress.sealSequenceIndex = 0;
    ingress.sealRejectedNode = null;
    ingress.currentMirror = currentMirror;
    ingress.currentBadge = currentBadgeOption?.value || null;
    ingress.currentBadgeToken = currentBadgeOption?.id || null;
    ingress.target = {
      containment: 'on',
      mirrorLogic: targetMirror,
      badge: targetBadgeOption.value,
      badgeToken: targetBadgeOption.id
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

    pushCase(
      'containment_glyph_binding',
      readIngressSnapshot().cueGlyph === glyphChar('ingressContainmentCue') &&
        readIngressSnapshot().coreGlyph === glyphChar('ingressContainmentCore'),
      readIngressSnapshot(),
      'Containment should expose the reciprocal cue and stabilized core glyphs.'
    );

    pushCase(
      'token_pool_expanded',
      INGRESS_BADGE_OPTIONS.length >= 7 &&
        INGRESS_BADGE_OPTIONS.some((option) => option.glyphKey === 'ingressBadgeDown') &&
        INGRESS_BADGE_OPTIONS.some((option) => option.glyphKey === 'ingressBadgeTetragram') &&
        INGRESS_BADGE_OPTIONS.some((option) => option.glyphKey === 'ingressBadgeWitness') &&
        INGRESS_BADGE_OPTIONS.some((option) => option.glyphKey === 'ingressBadgeTherefore'),
      readIngressSnapshot(),
      'Ingress should expose a larger token pool with the new Dome-World variants.'
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
        readIngressSnapshot().currentBadgeValue === 'badge.holds' &&
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
    pushCase(
      'seal_triad_glyphs',
      JSON.stringify(readIngressSnapshot().sealGlyphs) === JSON.stringify([
        glyphChar('ingressSealFlow'),
        glyphChar('ingressSealEmergence'),
        glyphChar('ingressSealReturn')
      ]),
      readIngressSnapshot(),
      'The live triad should render flow, emergence, and return in clockwise order.'
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

  function transferStructuralDimensions(transfer = {}) {
    return (transfer.changedDimensions || [])
      .filter((dimension) => [
        'sentence-mean',
        'sentence-count',
        'sentence-spread',
        'contraction-posture',
        'line-break-texture',
        'connector-stance'
      ].includes(dimension));
  }

  function transferLexicalDimensions(transfer = {}) {
    return (transfer.changedDimensions || [])
      .filter((dimension) => [
        'lexical-register',
        'content-word-complexity',
        'modifier-density',
        'directness',
        'abstraction-posture'
      ].includes(dimension));
  }

  function hasTransferBannedConnectors(text = '') {
    return /(though\s+if|honestly[,;]\s+and|but\s+because|and\s+though\s+if)/gi.test(text);
  }

  function hasTransferOrphanFragments(text = '') {
    return sentenceSplit(text).some((sentence, index) =>
      index > 0 && /^(?:and|but|so|then|because|since|when|while|though|although)\s+\w{1,3}\s*$/i.test(sentence.trim())
    );
  }

  function semanticContractMatches(actual = {}, expected = {}) {
    return JSON.stringify(actual) === JSON.stringify(expected);
  }

  function runTransferTestFlight() {
    const cases = retrievalFixtureIds()
      .map((caseId) => retrievalFixtureCase(caseId))
      .filter(Boolean)
      .map((fixture) => {
        const shell = {
          mode: 'borrowed',
          profile: extractCadenceProfile(fixture.donorText || ''),
          strength: fixture.strength || fixture.donorSummary?.strength || 0.9
        };
        const transfer = buildCadenceTransfer(fixture.sourceText, shell, { retrieval: true });
        const trace = transfer.retrievalTrace || {};
        const actualContract = canonicalSemanticContractFromTrace(trace);
        const expectedContract = fixture.semanticContract || {};
        const semanticAudit = trace.semanticAudit || {};
        const protectedAudit = trace.protectedAnchorAudit || {};
        const contractMatch = semanticContractMatches(actualContract, expectedContract);
        const lexicalShiftCount = transferLexicalDimensions(transfer).length + (((transfer.lexemeSwaps || []).length > 0) ? 1 : 0);
        const structuralShiftCount = transferStructuralDimensions(transfer).length;
        const pathologySafe = !hasTransferBannedConnectors(transfer.text) && !hasTransferOrphanFragments(transfer.text);
        let pass = contractMatch;

        if (fixture.category === 'flagship') {
          pass = pass &&
            transfer.transferClass === 'structural' &&
            transfer.realizationTier === 'lexical-structural' &&
            structuralShiftCount >= 1 &&
            lexicalShiftCount >= 1 &&
            (semanticAudit.propositionCoverage || 0) >= 0.85 &&
            (semanticAudit.actorCoverage || 0) >= 0.75 &&
            (semanticAudit.actionCoverage || 0) >= 0.85 &&
            (semanticAudit.objectCoverage || 0) >= 0.65 &&
            (semanticAudit.polarityMismatches || 0) === 0 &&
            (protectedAudit.protectedAnchorIntegrity || semanticAudit.protectedAnchorIntegrity || 0) === 1 &&
            pathologySafe;
        } else if (fixture.category === 'pathology') {
          pass = pass && (transfer.transferClass === 'rejected' || pathologySafe);
        } else {
          pass = pass &&
            typeof semanticAudit.propositionCoverage === 'number' &&
            typeof semanticAudit.actorCoverage === 'number' &&
            typeof semanticAudit.actionCoverage === 'number' &&
            typeof semanticAudit.objectCoverage === 'number';
        }

        return {
          id: fixture.id,
          category: fixture.category,
          pass,
          contractMatch,
          transformedText: transfer.text,
          transferClass: transfer.transferClass,
          realizationTier: transfer.realizationTier,
          changedDimensions: transfer.changedDimensions || [],
          lexemeSwaps: transfer.lexemeSwaps || [],
          actualContract,
          expectedContract,
          semanticAudit,
          protectedAnchorAudit: protectedAudit,
          planSummary: trace.planSummary || {},
          candidateSummary: trace.candidateSummary || {}
        };
      });

    const report = {
      mode: 'transfer',
      fixtureCount: retrievalFixtureIds().length,
      cases,
      summary: {
        allPassed: cases.length > 0 && cases.every((entry) => entry.pass),
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
  }

  function runSwapTestFlight() {
    const matrixReport = runSwapCadenceMatrixReport();
    const flagshipCases = matrixReport.flagshipReports || [];
    const workingDoctrine = buildPrivateSwapDoctrine(matrixReport);
    const summary = matrixReport.summary || {};
    const report = {
      mode: 'swap',
      flagshipPairs: matrixReport.flagshipPairs || [],
      flagshipCases,
      fullSummary: summary,
      workingDoctrine,
      summary: {
        allPassed:
          Boolean(summary.flagshipAllPassed) &&
          (summary.bilateralEngaged || 0) >= 24 &&
          (summary.bothRejected || 0) <= 8 &&
          (summary.oneSided || 0) <= 18 &&
          (workingDoctrine.representativePairs?.bilateralNonTrivialRate || 0) >= 0.75,
        passCount: [
          Boolean(summary.flagshipAllPassed),
          (summary.bilateralEngaged || 0) >= 24,
          (summary.bothRejected || 0) <= 8,
          (summary.oneSided || 0) <= 18,
          (workingDoctrine.representativePairs?.bilateralNonTrivialRate || 0) >= 0.75
        ].filter(Boolean).length,
        caseCount: 5
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
    const summaryText = `Swap flight // ${report.summary.allPassed ? 'passed' : 'check failed'} ${report.summary.passCount}/${report.summary.caseCount}`;
    document.body.dataset.testFlightStatus = report.summary.allPassed ? 'passed' : 'complete';
    document.body.dataset.testFlightSummary = summaryText.toLowerCase().replace(/[^a-z0-9/ ]/gi, '');
    setStatusMessage(summaryText);
  }

  function runTestFlight(mode = 'smoke') {
    if (mode === 'transfer') {
      runTransferTestFlight();
      return;
    }

    if (mode === 'swap') {
      runSwapTestFlight();
      return;
    }

    const initialState = captureFlightState();
    const beforePersonaCount = document.querySelectorAll('.persona').length;
    const seededPair = testFlightSeedPair();
    const readPersistentKey = (key) => {
      try {
        return window.localStorage.getItem(key);
      } catch {
        return '__unavailable__';
      }
    };
    const persistentStorageBaseline = {
      savedPersonas: readPersistentKey(STORAGE_KEY),
      cadenceLocks: readPersistentKey(LOCK_STORAGE_KEY),
      activeCadenceLock: readPersistentKey(ACTIVE_LOCK_STORAGE_KEY)
    };
    const report = {
      mode,
      baseline: {
        snapshot: null,
        personas: beforePersonaCount
      },
      galleryBootstrap: readPersonaGallerySnapshot(),
      runtimeRetention: {
        mode: window.TCP_RUNTIME_STORE?.mode || '',
        persistent: Boolean(window.TCP_RUNTIME_STORE?.isPersistent),
        localStorageBaseline: persistentStorageBaseline
      }
    };

    try {
      const profileLooksLive = (text = '') => /rhythm/i.test(text) && /register/i.test(text);
      report.baseline.snapshot = applyScenario({
        voiceA: seededPair.voiceA,
        voiceB: seededPair.voiceB,
        nextMirrorLogic: 'off',
        nextBadgeState: 'badge.holds'
      });

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
      $('voiceA').value = '';
      handleTextInput('A');
      const placeholderProfileA = $('voiceAProfile').textContent.trim();
      const referencePool = inspectRandomizerPool('A');
      const beforeRandomA = $('voiceA').value;
      const beforeRandomB = $('voiceB').value;
      $('randomizeVoiceABtn').click();
      const afterRandomA = $('voiceA').value;
      const randomizedReferenceSampleId = $('voiceA').dataset.sampleId || '';
      const referenceProfileAfterRandomize = $('voiceAProfile').textContent.trim();
      const afterRandomReferenceSnapshot = readDeckSnapshot();
      analyzeCadences();
      const analyzedReferenceSampleId = $('voiceA').dataset.sampleId || '';
      const analyzedReferenceProfile = $('voiceAProfile').textContent.trim();
      $('randomizeVoiceABtn').click();
      const rerandomizedReferenceSampleId = $('voiceA').dataset.sampleId || '';
      const rerandomizedReferenceProfile = $('voiceAProfile').textContent.trim();
      const probePool = inspectRandomizerPool('B');
      $('randomizeVoiceBBtn').click();
      const afterRandomB = $('voiceB').value;
      const randomizedProbeSampleId = $('voiceB').dataset.sampleId || '';
      report.sampleRandomizer = {
        referenceChanged: afterRandomA !== beforeRandomA,
        probeChanged: afterRandomB !== beforeRandomB,
        referenceSampleId: randomizedReferenceSampleId,
        probeSampleId: randomizedProbeSampleId,
        pairDistinct: Boolean(randomizedReferenceSampleId) && randomizedReferenceSampleId !== randomizedProbeSampleId,
        snapshot: readDeckSnapshot(),
        referencePool,
        probePool,
        placeholderCleared: /paste a voice here/i.test(placeholderProfileA) && profileLooksLive(referenceProfileAfterRandomize),
        rerenderAfterAnalysis:
          Boolean(rerandomizedReferenceSampleId) &&
          rerandomizedReferenceSampleId !== analyzedReferenceSampleId &&
          rerandomizedReferenceProfile !== analyzedReferenceProfile,
        readoutCleared:
          afterRandomReferenceSnapshot.similarity === '--' &&
          afterRandomReferenceSnapshot.routePressure === '--' &&
          afterRandomReferenceSnapshot.traceability === '--',
        duelLivePreanalysis: afterRandomReferenceSnapshot.duelState === 'live'
      };

      const ownSourceSnapshot = applyScenario({
        voiceA: seededPair.voiceA,
        voiceB: seededPair.voiceB,
        nextMirrorLogic: 'off',
        nextBadgeState: 'badge.holds'
      });
      report.ownSourceDuel = {
        sourceLabel: ownSourceSnapshot.duelSource,
        referenceOwnSource: ownSourceSnapshot.duelReferenceSample === seededPair.voiceA,
        probeOwnSource: ownSourceSnapshot.duelProbeSample === seededPair.voiceB,
        samplesDistinct: ownSourceSnapshot.duelReferenceSample !== ownSourceSnapshot.duelProbeSample
      };

        const firstPersonaAssign = document.querySelector('[data-persona-action="assign-reference"]');
        if (firstPersonaAssign) {
          firstPersonaAssign.click();
        }

        report.assignPersona = {
          snapshot: readDeckSnapshot(),
          personaStatus: $('personaStatus').textContent.trim(),
          gallery: readPersonaGallerySnapshot()
        };

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
        pairClassification: lastSwapCadenceAudit?.classification || '',
        cueVisible: readDeckSnapshot().statusCueVisible,
        cueText: readDeckSnapshot().statusCue,
        audit: lastSwapCadenceAudit
      };

      $('savePersonaBtn').click();
        report.savePersona = {
          snapshot: readDeckSnapshot(),
          personasAfterSave: document.querySelectorAll('.persona').length,
          savedPersonaAdded: document.querySelectorAll('.persona').length === beforePersonaCount + 1,
          localStorageAfterSave: {
            savedPersonas: readPersistentKey(STORAGE_KEY),
            cadenceLocks: readPersistentKey(LOCK_STORAGE_KEY),
            activeCadenceLock: readPersistentKey(ACTIVE_LOCK_STORAGE_KEY)
          }
        };

        $('tabHomebase').click();
        const galleryBaseline = readPersonaGallerySnapshot();
        $('cadenceLockName').value = 'Field Home One';
        $('cadenceLockCorpus').value = `${seededPair.voiceA}\n\n${seededPair.voiceB}`;
        $('lockCadenceBtn').click();
        const firstStageSnapshot = readPersonaGallerySnapshot();
        $('revealCadenceBtn').click();
        const firstRevealSnapshot = readPersonaGallerySnapshot();
        $('saveCadenceLockBtn').click();
        const firstSaveSnapshot = readPersonaGallerySnapshot();
        const firstLockId = firstSaveSnapshot.activeLockId;
        $('cadenceLockName').value = 'Field Home Two';
        $('cadenceLockCorpus').value = `${seededPair.voiceB}\n\n${SAMPLE_LIBRARY_BY_ID['archive-grant-formal-record']?.text || seededPair.voiceA}`;
        $('lockCadenceBtn').click();
        $('saveCadenceLockBtn').click();
        const secondSaveSnapshot = readPersonaGallerySnapshot();
        report.runtimeRetention.localStorageAfterLockSave = {
          savedPersonas: readPersistentKey(STORAGE_KEY),
          cadenceLocks: readPersistentKey(LOCK_STORAGE_KEY),
          activeCadenceLock: readPersistentKey(ACTIVE_LOCK_STORAGE_KEY)
        };
        const firstLockButton = firstLockId ? document.querySelector(`[data-lock-action="select"][data-lock-id="${firstLockId}"]`) : null;
        if (firstLockButton) {
          firstLockButton.click();
        }
        const firstSelectSnapshot = readPersonaGallerySnapshot();
        $('personaComparisonText').value = SAMPLE_LIBRARY_BY_ID['customer-support-formal-record']?.text || seededPair.voiceB;
        $('personaComparisonText').dispatchEvent(new Event('input', { bubbles: true }));
        $('tabPersonas').click();
        const sparkMaskCard = document.querySelector('.persona[data-id="spark"]');
        if (sparkMaskCard) {
          sparkMaskCard.click();
        }
        const sparkMaskButton = document.querySelector('[data-persona-id="spark"][data-persona-action="wear-homebase"]');
        if (sparkMaskButton) {
          sparkMaskButton.click();
        }
        report.personaGallery = {
          baseline: galleryBaseline,
          afterFirstStage: firstStageSnapshot,
          afterFirstReveal: firstRevealSnapshot,
          afterFirstSave: firstSaveSnapshot,
          afterSecondSave: secondSaveSnapshot,
          afterFirstSelect: firstSelectSnapshot,
          afterMask: readPersonaGallerySnapshot()
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
        stationRoute: document.body.dataset.stationRoute || '',
        consoleHidden: $('viewPaneConsole').hidden,
        homebaseHidden: $('viewPaneHomebase').hidden,
        personasHidden: $('viewPanePersonas').hidden,
        readoutHidden: $('viewPaneReadout').hidden,
        playHidden: $('viewPanePlay').hidden,
        trainerHidden: $('viewPaneTrainer').hidden
      };
      report.glyphSystem = {
        snapshot: readShellGlyphSnapshot(),
        pass: (() => {
          const snapshot = readShellGlyphSnapshot();
          return snapshot.tabs.console.glyph === glyphChar('tabConsole') &&
            snapshot.tabs.homebase.glyph === glyphChar('tabHomebase') &&
            snapshot.tabs.deck.glyph === glyphChar('tabDeck') &&
            snapshot.tabs.readout.glyph === glyphChar('tabReadout') &&
            snapshot.tabs.personas.glyph === glyphChar('tabPersonas') &&
            snapshot.tabs.trainer.glyph === glyphChar('tabTrainer') &&
            snapshot.readoutStrip.signal.glyph === glyphChar('readoutSignal') &&
            snapshot.readoutStrip.route.glyph === glyphChar('readoutRoute') &&
            snapshot.readoutStrip.harbor.glyph === glyphChar('readoutHarbor') &&
            snapshot.footer.glyph === glyphChar('footerSeal') &&
            snapshot.tabs.homebase.semanticClass === 'witness' &&
            snapshot.tabs.deck.semanticClass === 'gate' &&
            snapshot.tabs.trainer.semanticClass === 'law' &&
            snapshot.readoutStrip.harbor.semanticClass === 'adjudication';
        })()
      };
      report.stationRouting = (() => {
        const homebaseBefore = readPersonaGallerySnapshot();
        window.history.pushState(null, '', '#console');
        handleArtifactRouteChange();
        const consoleAliasWorks = document.body.dataset.artifactTab === 'homebase' && (window.location.hash || '') === '#homebase';
        window.history.pushState(null, '', artifactHashForTab('homebase'));
        handleArtifactRouteChange();
        const homebaseMounted = document.body.dataset.artifactTab === 'homebase' && !$('viewPaneHomebase').hidden;
        const homebaseAfter = readPersonaGallerySnapshot();
        window.history.pushState(null, '', artifactHashForTab('play'));
        handleArtifactRouteChange();
        const deckActive = document.body.dataset.artifactTab === 'play' && !$('viewPanePlay').hidden;
        window.history.pushState(null, '', artifactHashForTab('readout'));
        handleArtifactRouteChange();
        return {
          initialTab: initialState.activeArtifactTab,
          initialHash: initialState.artifactHash || '',
          consoleAliasWorks,
          homebaseDeepLinkWorks: homebaseMounted && document.body.dataset.artifactTab === 'readout' && !$('viewPaneReadout').hidden && homebaseAfter.homebaseLockId === homebaseBefore.homebaseLockId,
          deckDeepLinkWorks: deckActive,
          statePreservedAcrossRouteChange:
            homebaseAfter.homebaseLockId === homebaseBefore.homebaseLockId &&
            homebaseAfter.homebaseWornMaskId === homebaseBefore.homebaseWornMaskId
        };
      })();

      if (mode === 'full') {
        $('tabTrainer').click();
        const trainerCorpus = SAMPLE_LIBRARY_BY_ID['building-access-formal-record']?.text || seededPair.voiceA;
        $('trainerPersonaName').value = 'Trainer Smoke Persona';
        $('trainerPersonaName').dispatchEvent(new Event('input', { bubbles: true }));
        $('trainerCorpusInput').value = trainerCorpus;
        $('trainerCorpusInput').dispatchEvent(new Event('input', { bubbles: true }));
        const trainerBridge = window.TCP_TRAINER_LAB || null;
        if (trainerBridge && typeof trainerBridge.openContext === 'function') {
          trainerBridge.openContext({
            sourceText: trainerCorpus,
            sourceOrigin: 'trainer corpus',
            corpusText: trainerCorpus,
            corpusOrigin: 'trainer corpus',
            forcePopulate: true
          });
        }
        $('trainerExtractBtn').click();
        $('trainerForgeDraftBtn').click();
        $('trainerValidateBtn').click();
        const trainerBeforeRelease = readTrainerSnapshot();
        $('trainerExportBtn').click();
        const trainerAfterBlockedExport = readTrainerSnapshot();
        $('trainerReleaseGateBtn').click();
        const trainerAfterReleaseGate = readTrainerSnapshot();
        $('trainerExportBtn').click();
        const trainerBeforeInject = readTrainerSnapshot();
        const personaCountBeforeTrainerInject = document.querySelectorAll('.persona').length;
        $('trainerInjectBtn').click();
        const trainerAfterInject = readTrainerSnapshot();
        const injectedTrainerId = trainerAfterInject.lastInjectedPersonaSummary?.id || '';
        const trainerBridgePresent = Boolean(
          trainerBridge &&
          typeof trainerBridge.snapshot === 'function' &&
          typeof trainerBridge.serializeState === 'function' &&
          typeof trainerBridge.restoreState === 'function' &&
          typeof trainerBridge.openContext === 'function' &&
          typeof trainerBridge.extract === 'function' &&
          typeof trainerBridge.forgeDraft === 'function' &&
          typeof trainerBridge.validate === 'function' &&
          typeof trainerBridge.toggleReleaseGate === 'function' &&
          typeof trainerBridge.exportSpec === 'function' &&
          typeof trainerBridge.inject === 'function'
        );
        const trainerSerializedState = trainerBridgePresent ? trainerBridge.serializeState() : null;
        let trainerAfterRestore = null;
        if (trainerBridgePresent && trainerSerializedState) {
          $('trainerPersonaName').value = 'Trainer Restore Probe';
          $('trainerPersonaName').dispatchEvent(new Event('input', { bubbles: true }));
          trainerBridge.restoreState(trainerSerializedState);
          trainerAfterRestore = readTrainerSnapshot();
        }
        report.trainer = {
          snapshotBeforeRelease: trainerBeforeRelease,
          snapshotAfterBlockedExport: trainerAfterBlockedExport,
          snapshotAfterReleaseGate: trainerAfterReleaseGate,
          snapshotBeforeInject: trainerBeforeInject,
          snapshotAfterInject: trainerAfterInject,
          snapshotAfterRestore: trainerAfterRestore,
          personasAfterInject: document.querySelectorAll('.persona').length,
          personaAdded: document.querySelectorAll('.persona').length === personaCountBeforeTrainerInject + 1,
          injectedPersonaId: injectedTrainerId,
          trainerTabActive: document.body.dataset.artifactTab === 'trainer',
          bridgePresent: trainerBridgePresent,
          localStorageAfterInject: {
            savedPersonas: readPersistentKey(STORAGE_KEY),
            cadenceLocks: readPersistentKey(LOCK_STORAGE_KEY),
            activeCadenceLock: readPersistentKey(ACTIVE_LOCK_STORAGE_KEY)
          },
          roundtripRestored: Boolean(
            trainerAfterRestore &&
            trainerSerializedState &&
            trainerAfterRestore.personaName === trainerSerializedState.personaName &&
            trainerAfterRestore.validationPass === Boolean(trainerSerializedState.validation?.pass) &&
            trainerAfterRestore.exportReady === Boolean(trainerSerializedState.exportSpec) &&
            trainerAfterRestore.statusMessage === (trainerSerializedState.statusMessage || '') &&
            trainerAfterRestore.statusCue === (trainerSerializedState.statusCue || '')
          ),
          injectedSummaryRestored: Boolean(
            trainerAfterRestore &&
            trainerSerializedState &&
            (trainerAfterRestore.lastInjectedPersonaSummary?.id || '') === (trainerSerializedState.lastInjectedPersonaSummary?.id || '')
          )
        };

          $('tabPersonas').click();
          const injectedTrainerPersona = injectedTrainerId ? document.querySelector(`.persona[data-id="${injectedTrainerId}"]`) : null;
          const injectedTrainerOpen = injectedTrainerId
            ? document.querySelector(`[data-persona-id="${injectedTrainerId}"][data-persona-action="open-trainer"]`)
            : null;
          if (injectedTrainerOpen) {
            injectedTrainerOpen.click();
          }
          const injectedTrainerAssign = injectedTrainerId
            ? document.querySelector(`[data-persona-id="${injectedTrainerId}"][data-persona-action="assign-reference"]`)
            : null;
          if (injectedTrainerAssign) {
            injectedTrainerAssign.click();
          }
          report.trainer.personaAssigned =
            Boolean(injectedTrainerPersona) && bayShells[activeVoice].personaId === injectedTrainerId;
          report.trainer.gallerySnapshot = readPersonaGallerySnapshot();
          report.swapMatrix = runSwapCadenceMatrixReport();

        const matrix = [];
        const scenarios = [
          {
            id: 'weak_signal_contrast',
            expectedDecision: 'weak-signal',
            expectedRouteKey: 'observing',
            expectedHeroHarbor: 'observe',
            rationale: 'Two visibly different cadences should remain exploratory.',
            config: {
              voiceA: "Honestly, I wasn't trying to make a speech. I just kept circling the story because every time I got to the part where I should have left, I remembered one more detail that changed why I stayed. By the time I finished, I had used three qualifiers, two apologies, and the same phrase twice, which is apparently what I do when I'm buying time to say the hard part out loud.",
              voiceB: "Hey, if you're still out, grab the charger and use the side door. It sticks, so lean on it. If nobody hears you right away, wait a second and knock again. I'm in back unloading boxes, and I probably won't catch the first try.",
              nextMirrorLogic: 'off',
              nextBadgeState: 'badge.holds'
            }
          },
          {
            id: 'hold_branch_same_lexicon_split_form',
            expectedDecision: 'hold-branch',
            expectedRouteKey: 'buffered',
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
            expectedRouteKey: 'buffered',
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
            expectedRouteKey: 'safe-passage-achieved',
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
            expectedRouteKey: scenario.expectedRouteKey,
            expectedHeroHarbor: scenario.expectedHeroHarbor,
            expectedSimilarity: scenario.expectedSimilarity,
            expectedTraceability: scenario.expectedTraceability,
            actualDecision: snapshot.decision,
            pass:
              (!scenario.expectedDecision || snapshot.decision === scenario.expectedDecision) &&
              (!scenario.expectedRouteKey || snapshot.routeStatusKey === scenario.expectedRouteKey) &&
              (!scenario.expectedHeroHarbor || snapshot.heroHarbor === scenario.expectedHeroHarbor) &&
              (!scenario.expectedSimilarity || snapshot.similarity === scenario.expectedSimilarity) &&
              (!scenario.expectedTraceability || snapshot.traceability === scenario.expectedTraceability),
            rationale: scenario.rationale,
            snapshot
          });
        });

        report.matrix = matrix;
        const supportChecks = [
          { id: 'homebase_is_default_post_threshold_route', pass: report.stationRouting.initialTab === 'homebase' && report.stationRouting.initialHash === '#homebase' },
          { id: 'console_alias_redirects_to_homebase', pass: report.stationRouting.consoleAliasWorks },
          { id: 'station_deep_links_mount_shared_views', pass: report.stationRouting.homebaseDeepLinkWorks && report.stationRouting.deckDeepLinkWorks },
          { id: 'station_routes_preserve_runtime_state', pass: report.stationRouting.statePreservedAcrossRouteChange },
          { id: 'homebase_boot_has_no_worn_mask', pass: !report.galleryBootstrap.homebaseWornMaskId && report.galleryBootstrap.homebasePhase !== 'mask-worn' && report.galleryBootstrap.homebasePhase !== 'residue' },
          { id: 'sample_randomizer_distinct', pass: report.sampleRandomizer.referenceChanged && report.sampleRandomizer.probeChanged && report.sampleRandomizer.pairDistinct },
          {
            id: 'sample_randomizer_pool_uses_diverse_deck_corpus',
            pass:
              report.sampleRandomizer.referencePool.corpusSize === DECK_RANDOMIZER_SAMPLE_LIBRARY.length &&
              report.sampleRandomizer.probePool.corpusSize === DECK_RANDOMIZER_SAMPLE_LIBRARY.length &&
              report.sampleRandomizer.referencePool.averagePreferredProfileDelta >= 1 &&
              report.sampleRandomizer.probePool.averagePreferredProfileDelta >= 1
          },
          { id: 'sample_randomizer_live_profile_from_placeholder', pass: report.sampleRandomizer.placeholderCleared },
          { id: 'sample_randomizer_rerenders_after_prior_analysis', pass: report.sampleRandomizer.rerenderAfterAnalysis },
          { id: 'sample_randomizer_clears_readout_but_keeps_duel_live', pass: report.sampleRandomizer.readoutCleared && report.sampleRandomizer.duelLivePreanalysis },
          { id: 'deck_cast_report_preanalysis', pass: String(report.sampleRandomizer.snapshot.castReport || '').toLowerCase().includes('cast report') },
          { id: 'swap_shells_preserve_raw_text', pass: report.swapCadences.voiceAUnchanged && report.swapCadences.voiceBUnchanged },
            { id: 'swap_cadences_retrieval_audit_present', pass: Boolean(report.swapCadences.audit && report.swapCadences.audit.lanes && report.swapCadences.audit.lanes.A && report.swapCadences.audit.lanes.B) },
            { id: 'save_persona_adds_entry', pass: report.savePersona.savedPersonaAdded },
            {
              id: 'session_artifacts_do_not_touch_local_storage',
              pass:
                report.runtimeRetention.mode === 'session-memory' &&
                !report.runtimeRetention.persistent &&
                report.savePersona.localStorageAfterSave.savedPersonas === report.runtimeRetention.localStorageBaseline.savedPersonas &&
                report.savePersona.localStorageAfterSave.cadenceLocks === report.runtimeRetention.localStorageBaseline.cadenceLocks &&
                report.savePersona.localStorageAfterSave.activeCadenceLock === report.runtimeRetention.localStorageBaseline.activeCadenceLock &&
                report.runtimeRetention.localStorageAfterLockSave.savedPersonas === report.runtimeRetention.localStorageBaseline.savedPersonas &&
                report.runtimeRetention.localStorageAfterLockSave.cadenceLocks === report.runtimeRetention.localStorageBaseline.cadenceLocks &&
                report.runtimeRetention.localStorageAfterLockSave.activeCadenceLock === report.runtimeRetention.localStorageBaseline.activeCadenceLock &&
                report.trainer.localStorageAfterInject.savedPersonas === report.runtimeRetention.localStorageBaseline.savedPersonas &&
                report.trainer.localStorageAfterInject.cadenceLocks === report.runtimeRetention.localStorageBaseline.cadenceLocks &&
                report.trainer.localStorageAfterInject.activeCadenceLock === report.runtimeRetention.localStorageBaseline.activeCadenceLock
            },
            { id: 'homebase_stage_does_not_autosave', pass: report.personaGallery.afterFirstStage.lockCount === report.personaGallery.baseline.lockCount && report.personaGallery.afterFirstStage.stagedLockPresent && !report.personaGallery.afterFirstStage.revealed },
            { id: 'homebase_reveal_wakes_solo_path', pass: report.personaGallery.afterFirstReveal.revealed && report.personaGallery.afterFirstReveal.dossierReady && report.personaGallery.afterFirstReveal.readoutOwner === 'homebase' },
            { id: 'homebase_save_keeps_session_lock', pass: report.personaGallery.afterFirstSave.lockCount === report.personaGallery.baseline.lockCount + 1 && !report.personaGallery.afterFirstSave.stagedLockPresent },
            { id: 'homebase_keeps_multiple_session_locks', pass: report.personaGallery.afterSecondSave.lockCount >= report.personaGallery.afterFirstSave.lockCount + 1 },
            { id: 'saved_lock_reselection_stays_latent', pass: report.personaGallery.afterFirstSelect.activeLockId === report.personaGallery.afterFirstSave.activeLockId && !report.personaGallery.afterFirstSelect.revealed },
          { id: 'persona_gallery_masks_comparison_text', pass: report.personaGallery.afterMask.comparisonReady && report.personaGallery.afterMask.maskedOutputLength > 0 && report.personaGallery.afterMask.selectedMaskId === 'spark' && report.personaGallery.afterMask.homebaseWornMaskId === 'spark' },
          { id: 'generate_mask_removed_from_public_ui', pass: !document.querySelector('[data-persona-action="generate-mask"]') },
          { id: 'persona_homebase_handoff_explains_active_mask', pass: report.personaGallery.afterMask.homebaseMaskStatusText.toLowerCase().includes('spark') && report.personaGallery.afterMask.maskBenchStatusText.toLowerCase().includes('spark') },
            { id: 'persona_preview_shows_fingerprint', pass: report.personaGallery.afterMask.selectedMaskFingerprintText.toLowerCase().includes('register') && report.personaGallery.afterMask.selectedMaskFingerprintText.toLowerCase().includes('rhythm') },
            { id: 'persona_preview_shows_provenance', pass: report.personaGallery.afterMask.selectedMaskProvenanceText.toLowerCase().includes('samples //') && report.personaGallery.afterMask.selectedMaskProvenanceText.toLowerCase().includes('resolved strength //') },
            { id: 'persona_shelf_shows_stylometric_chips', pass: report.personaGallery.afterMask.selectedShelfChipText.toLowerCase().includes('register') && report.personaGallery.afterMask.selectedShelfChipText.toLowerCase().includes('rhythm') },
            { id: 'persona_homebase_separates_chosen_from_worn', pass: report.personaGallery.afterMask.selectedMaskId === 'spark' && report.personaGallery.afterMask.homebaseWornMaskId === 'spark' && report.personaGallery.afterMask.homebasePhase === 'residue' },
            { id: 'swap_medallion_moves_bay_text', pass: report.textSwapMedallion.voiceASwapped && report.textSwapMedallion.voiceBSwapped },
            { id: 'swap_medallion_updates_duel', pass: report.textSwapMedallion.duelSamplesChanged },
            { id: 'duel_uses_own_sources', pass: report.ownSourceDuel.referenceOwnSource && report.ownSourceDuel.probeOwnSource && report.ownSourceDuel.samplesDistinct },
            { id: 'swap_cadences_emits_pair_classification', pass: Boolean(report.swapCadences.pairClassification) },
            { id: 'swap_cadence_cue_key', pass: report.swapCadences.cueVisible && report.swapCadences.snapshot.statusCueKey === STATUS_CUE_KEYS.shellDuelUpdated },
            { id: 'solo_scan_uses_scan_mode', pass: report.soloScan.similarityKey === 'Scan mode' },
            { id: 'baseline_duel_live', pass: report.baseline.snapshot.duelState === 'live' },
            { id: 'readout_station_visible', pass: report.viewTabs.activeTab === 'readout' && report.viewTabs.stationRoute === 'readout' && !report.viewTabs.readoutHidden },
          { id: 'trainer_forges_real_draft', pass: Boolean(report.trainer && report.trainer.snapshotBeforeInject.draftReady && report.trainer.snapshotBeforeInject.generatedLength > 0 && report.trainer.snapshotBeforeInject.draftSource) },
          {
            id: 'trainer_validates_generated_output',
            pass: Boolean(
              report.trainer &&
              report.trainer.snapshotBeforeRelease.validationPass &&
              report.trainer.snapshotBeforeRelease.promptReady &&
              !report.trainer.snapshotBeforeRelease.exportReady &&
              !report.trainer.snapshotBeforeRelease.releaseGateArmed &&
              !report.trainer.snapshotAfterBlockedExport.exportReady
            )
          },
          {
            id: 'trainer_release_gate_arms_export',
            pass: Boolean(
              report.trainer &&
              report.trainer.snapshotAfterReleaseGate.releaseGateArmed &&
              report.trainer.snapshotBeforeInject.exportReady &&
              report.trainer.snapshotBeforeInject.generatedLength > 0
            )
          },
            { id: 'trainer_injects_persona', pass: Boolean(report.trainer && report.trainer.personaAdded && report.trainer.personaAssigned && report.trainer.gallerySnapshot.selectedMaskId === report.trainer.injectedPersonaId) },
          { id: 'trainer_bridge_present', pass: Boolean(report.trainer && report.trainer.bridgePresent) },
          { id: 'trainer_restore_roundtrip', pass: Boolean(report.trainer && report.trainer.roundtripRestored) },
          { id: 'trainer_restore_keeps_injected_summary', pass: Boolean(report.trainer && report.trainer.injectedSummaryRestored) },
          { id: 'swap_matrix_runner_present', pass: Boolean(report.swapMatrix && report.swapMatrix.summary && report.swapMatrix.flagshipReports) },
          { id: 'glyph_registry_smoke', pass: report.glyphSystem.pass }
        ];

        report.supportChecks = supportChecks;
        report.summary = {
          allPassed: matrix.every((entry) => entry.pass) && supportChecks.every((entry) => entry.pass),
          passCount: matrix.filter((entry) => entry.pass).length + supportChecks.filter((entry) => entry.pass).length,
          caseCount: matrix.length + supportChecks.length,
          matrixPassCount: matrix.filter((entry) => entry.pass).length,
          matrixCount: matrix.length,
          supportPassCount: supportChecks.filter((entry) => entry.pass).length,
          supportCount: supportChecks.length
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
      ? `Test flight // ${report.summary.allPassed ? 'passed' : 'check failed'} ${report.summary.passCount}/${report.summary.caseCount}`
      : `Test flight // ${mode} complete`;
    document.body.dataset.testFlightStatus = report.summary && report.summary.allPassed ? 'passed' : 'complete';
    document.body.dataset.testFlightSummary = summaryText.toLowerCase().replace(/[^a-z0-9/ ]/gi, '');
    setStatusMessage(summaryText);
  }

  $('compareBtn').addEventListener('click', handleAnalyzeCadences);
  $('swapMedallion').addEventListener('click', swapBayText);
  $('swapCadencesBtn').addEventListener('click', swapCadences);
  $('randomizeVoiceABtn').addEventListener('click', () => randomizeVoiceSample('A'));
  $('randomizeVoiceBBtn').addEventListener('click', () => randomizeVoiceSample('B'));
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
  $('lockCadenceBtn').addEventListener('click', lockCadenceFromGallery);
  $('revealCadenceBtn').addEventListener('click', revealCadenceLock);
  $('saveCadenceLockBtn').addEventListener('click', saveStagedCadenceLock);
  $('personaComparisonText').addEventListener('input', () => renderPersonas());
  $('tabConsole').addEventListener('click', () => setArtifactTab('homebase', { announce: true, scroll: true }));
  $('tabHomebase').addEventListener('click', () => setArtifactTab('homebase', { announce: true, scroll: true }));
  $('tabPlay').addEventListener('click', () => setArtifactTab('play', { announce: true, scroll: true }));
  $('tabReadout').addEventListener('click', () => setArtifactTab('readout', { announce: true, scroll: true }));
  $('tabPersonas').addEventListener('click', () => setArtifactTab('personas', { announce: true, scroll: true }));
  $('tabTrainer').addEventListener('click', () => setArtifactTab('trainer', { announce: true, scroll: true }));
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
    const stationAction = event.target.closest('[data-station-target]');
    if (stationAction) {
      setArtifactTab(stationAction.dataset.stationTarget || 'homebase', { announce: true, scroll: true });
      return;
    }

    const lockAction = event.target.closest('[data-lock-action]');
    if (lockAction) {
      const action = lockAction.dataset.lockAction;
      const lockId = lockAction.dataset.lockId;
      if (action === 'select') {
        selectCadenceLock(lockId);
      } else if (action === 'delete') {
        deleteCadenceLock(lockId);
      }
      return;
    }

    if (event.target.closest('#sendLockToDeckBtn')) {
      sendActiveLockToDeck();
      return;
    }

    const personaAction = event.target.closest('[data-persona-action]');
    if (personaAction) {
      const action = personaAction.dataset.personaAction;
      const personaId = personaAction.dataset.personaId;
      if (action === 'wear-homebase') {
        wearPersonaInHomebase(personaId);
      } else if (action === 'clear-homebase') {
        clearHomebaseWornMask();
      } else if (action === 'assign-reference') {
        assignPersonaToBay(personaId, 'A');
      } else if (action === 'assign-probe') {
        assignPersonaToBay(personaId, 'B');
      } else if (action === 'open-trainer') {
        openPersonaInTrainer(personaId);
      } else if (action === 'generate-mask') {
        generateMaskForPersona(personaId);
      }
      return;
    }

    const persona = event.target.closest('.persona');
    if (!persona) {
      return;
    }

    selectMaskPersona(persona.dataset.id);
  });

  document.addEventListener('keydown', (event) => {
    const persona = event.target.closest('.persona');
    if (!persona || (event.key !== 'Enter' && event.key !== ' ')) {
      return;
    }

    event.preventDefault();
    selectMaskPersona(persona.dataset.id);
  });

  window.addEventListener('hashchange', handleArtifactRouteChange);
  window.addEventListener('popstate', handleArtifactRouteChange);

  async function boot() {
    document.body.dataset.bootStage = 'boot-start';
    setAnalysisRevealState(false);
    setArtifactTab(activeArtifactTab, { updateHash: true, replaceHash: !window.location.hash });
    renderVoiceProfiles();
    document.body.dataset.bootStage = 'boot-rendered-profiles';
    await initializePersonaGallery();
    document.body.dataset.bootStage = 'boot-rendered-gallery';
    renderPersonas();
    document.body.dataset.bootStage = 'boot-rendered-personas';
    await initializeTrainerLab();
    document.body.dataset.bootStage = 'boot-rendered-trainer';
    renderIdleState();
    document.body.dataset.bootStage = 'boot-idle';
    setStatusMessage('Press Analyze Cadences for a solo scan or a head-to-head run.');
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

  (async () => {
    try {
      await boot();
    } catch (error) {
      const status = $('analysisStatus');
      if (status) {
        setStatusMessage(`Startup fault // ${error.message}`);
      }
      document.body.dataset.bootStage = 'boot-error';
      document.body.dataset.bootError = (error.message || 'unknown-error')
        .replace(/[^a-z0-9.\-_/ ]/gi, '')
        .slice(0, 120);
      return;
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

    if (testFlightMode === 'swap') {
      window.setTimeout(() => runTestFlight('swap'), 120);
    }

    if (ingressFlightMode) {
      window.setTimeout(() => runIngressTestFlight(), 120);
    }
  })();
})();
