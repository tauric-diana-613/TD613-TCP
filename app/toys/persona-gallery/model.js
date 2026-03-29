import { buildCorpusExtraction, splitCorpusSamples as splitTrainerCorpusSamples } from '../persona-trainer/extractor.js';

const BUILTIN_MASK_ART = Object.freeze({
  archivist: Object.freeze({
    visualClass: 'ledger-raven',
    artLabel: 'ledger raven',
    sigil: '[]',
    state: 'mask ready'
  }),
  spark: Object.freeze({
    visualClass: 'signal-jackal',
    artLabel: 'signal jackal',
    sigil: '++',
    state: 'mask ready'
  }),
  undertow: Object.freeze({
    visualClass: 'velvet-eel',
    artLabel: 'velvet eel',
    sigil: '~~',
    state: 'mask ready'
  }),
  operator: Object.freeze({
    visualClass: 'quiet-hound',
    artLabel: 'quiet hound',
    sigil: '//',
    state: 'mask ready'
  }),
  'methods-editor': Object.freeze({
    visualClass: 'schema-moth',
    artLabel: 'schema moth',
    sigil: '::',
    state: 'mask ready'
  }),
  'cross-examiner': Object.freeze({
    visualClass: 'gavel-viper',
    artLabel: 'gavel viper',
    sigil: '?!',
    state: 'mask ready'
  }),
  matron: Object.freeze({
    visualClass: 'velvet-stag',
    artLabel: 'velvet stag',
    sigil: '()',
    state: 'mask ready'
  })
});

function round(value, digits = 4) {
  return Number(Number(value || 0).toFixed(digits));
}

function clamp01(value) {
  return Math.max(0, Math.min(1, Number(value || 0)));
}

function normalizeText(text = '') {
  return String(text || '')
    .replace(/\r\n/g, '\n')
    .replace(/\u00A0/g, ' ')
    .trim();
}

function average(values = []) {
  if (!values.length) {
    return 0;
  }
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function sampleLibraryMap(sampleLibrary = []) {
  return sampleLibrary.reduce((acc, sample) => {
    if (sample && sample.id) {
      acc[sample.id] = sample;
    }
    return acc;
  }, {});
}

function repeatCount(weight = 0.5) {
  return Math.max(1, Math.min(8, Math.round((Number(weight) || 0.5) * 6)));
}

function safePersonaName(name = '', fallback = 'Cadence Lock') {
  const normalized = normalizeText(name).replace(/\s+/g, ' ');
  return normalized || fallback;
}

function slugify(text = '') {
  return normalizeText(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48);
}

function topDistributionEntries(distribution = {}, count = 6) {
  return Object.entries(distribution || {})
    .filter(([, value]) => Number(value) > 0)
    .sort((left, right) => right[1] - left[1])
    .slice(0, count)
    .map(([label, value]) => ({
      label,
      value: round(value, 4)
    }));
}

function punctuationSnapshot(punctuationMix = {}) {
  return Object.entries(punctuationMix || {})
    .filter(([, value]) => Number(value) > 0)
    .sort((left, right) => right[1] - left[1])
    .slice(0, 4)
    .map(([label, value]) => ({
      label,
      value: round(value, 4)
    }));
}

function stableAxisNotes(candidateProfile = {}, lockProfile = {}) {
  const shared = [];
  if (Math.abs((candidateProfile.avgSentenceLength || 0) - (lockProfile.avgSentenceLength || 0)) <= 3.5) {
    shared.push('sentence cadence');
  }
  if (Math.abs((candidateProfile.punctuationDensity || 0) - (lockProfile.punctuationDensity || 0)) <= 0.015) {
    shared.push('punctuation pressure');
  }
  if (Math.abs((candidateProfile.contractionDensity || 0) - (lockProfile.contractionDensity || 0)) <= 0.012) {
    shared.push('contraction posture');
  }
  if (Math.abs((candidateProfile.recurrencePressure || 0) - (lockProfile.recurrencePressure || 0)) <= 0.06) {
    shared.push('recurrence');
  }
  if ((candidateProfile.registerMode || '') === (lockProfile.registerMode || '')) {
    shared.push('register mode');
  }
  if (Math.abs((candidateProfile.directness || 0) - (lockProfile.directness || 0)) <= 0.08) {
    shared.push('directness');
  }
  if (Math.abs((candidateProfile.abstractionPosture || 0) - (lockProfile.abstractionPosture || 0)) <= 0.08) {
    shared.push('abstraction');
  }
  return shared.slice(0, 4);
}

function fingerprintSummaryFromExtraction(extraction = {}) {
  const profile = extraction.targetProfile || {};
  const selfSimilarity = extraction.selfSimilarity || {};
  const stabilityScore = clamp01(((selfSimilarity.meanSimilarity || 0) * 0.42) + ((selfSimilarity.meanTraceability || 0) * 0.58));
  const distinctivenessScore = clamp01(
    (Math.min(Math.abs((profile.avgSentenceLength || 0) - 16) / 16, 1) * 0.18) +
    (Math.min(Math.abs((profile.punctuationDensity || 0) - 0.11) / 0.08, 1) * 0.12) +
    (Math.min(Math.abs((profile.contractionDensity || 0) - 0.06) / 0.07, 1) * 0.12) +
    ((profile.recurrencePressure || 0) * 0.18) +
    ((1 - (profile.lexicalDispersion || 0)) * 0.2) +
    (Math.abs((profile.directness || 0) - 0.5) * 0.1) +
    (Math.abs((profile.abstractionPosture || 0) - 0.5) * 0.1)
  );
  const stickinessScore = clamp01((stabilityScore * 0.55) + (distinctivenessScore * 0.45));

  const stabilityClass = stabilityScore >= 0.82 ? 'highly stable' : stabilityScore >= 0.64 ? 'steady' : 'loose';
  const distinctivenessClass = distinctivenessScore >= 0.68 ? 'marked' : distinctivenessScore >= 0.48 ? 'noticeable' : 'diffuse';
  const stickinessClass = stickinessScore >= 0.78 ? 'highly sticky' : stickinessScore >= 0.58 ? 'portable' : 'less adhesive';

  return {
    stabilityScore: round(stabilityScore, 4),
    distinctivenessScore: round(distinctivenessScore, 4),
    stickinessScore: round(stickinessScore, 4),
    stabilityClass,
    distinctivenessClass,
    stickinessClass
  };
}

function riskInterpretation(profile = {}, extraction = {}, signature = null) {
  const fingerprint = extraction.fingerprintSummary || {};
  const functionWords = topDistributionEntries(extraction.fingerprint?.distributions?.functionWordProfile, 4)
    .map((entry) => entry.label)
    .join(', ');
  const dominantAxes = (signature?.dominantAxes || []).join(', ');
  const sentences = [];

  sentences.push(
    `Self-trace sits at ${Math.round((extraction.selfSimilarity?.meanTraceability || 0) * 100)}%. This corpus reads as ${fingerprint.stabilityClass || 'steady'} across its own samples, which makes reuse easier to spot.`
  );
  sentences.push(
    `The lock is ${fingerprint.distinctivenessClass || 'noticeable'} because sentence span (${round(profile.avgSentenceLength, 1)}w), punctuation density (${round(profile.punctuationDensity, 3)}), contraction posture (${round(profile.contractionDensity, 3)}), and recurrence (${round(profile.recurrencePressure, 3)}) travel together.`
  );
  sentences.push(
    `${fingerprint.stickinessClass || 'Portable'} residue is carried by ${functionWords || 'function-word mix'}, ${dominantAxes || profile.registerMode || 'register mode'}, and the way directness (${round(profile.directness, 3)}) and abstraction (${round(profile.abstractionPosture, 3)}) keep reinforcing each other.`
  );
  sentences.push(
    'Nothing here is an authorship verdict. The warning is simpler: a local browser tool can already recover enough rhythm, distribution, and posture to make this cadence legible across contexts.'
  );

  return sentences;
}

function resolveRecipeSamples(recipe = {}, sampleLibraryById = {}) {
  const blend = Array.isArray(recipe.blend) ? recipe.blend : [];
  const samples = [];
  blend.forEach((entry) => {
    const sample = sampleLibraryById[entry?.sampleId];
    if (!sample || !sample.text) {
      return;
    }
    const count = repeatCount(entry.weight);
    for (let index = 0; index < count; index += 1) {
      samples.push(sample.text);
    }
  });
  return samples;
}

function resolveRecipeProfile(engine, recipe = {}, sampleLibraryById = {}) {
  const samples = resolveRecipeSamples(recipe, sampleLibraryById);
  if (!samples.length) {
    return null;
  }

  const strength = Number(recipe.strength || 0.86);
  const overlayShell = recipe.overlayMod
    ? {
        mode: 'synthetic',
        mod: { ...recipe.overlayMod },
        strength
      }
    : null;

  const transformedSamples = overlayShell
    ? samples.map((sample) => engine.buildCadenceTransfer(sample, overlayShell).text)
    : samples;
  const extraction = buildCorpusExtraction(engine, transformedSamples);

  return {
    profile: extraction.targetProfile,
    mod: recipe.overlayMod ? { ...recipe.overlayMod } : engine.cadenceModFromProfile(extraction.targetProfile),
    strength,
    sampleCount: transformedSamples.length
  };
}

function fallbackMaskScaffold(persona = {}, index = 0) {
  const sources = {
    'built-in': {
      visualClass: 'field-mask',
      artLabel: 'field mask',
      sigil: '[]',
      state: 'mask ready',
      family: 'Field mask',
      tagline: 'Unknown pressure. Unregistered surface.',
      voicePromise: 'A field mask with no registered portrait metadata yet.',
      fieldUse: 'Use to test pressure without a stronger registered cast identity.',
      riskTell: 'No explicit risk tell has been registered yet.',
      frameTone: 'cyan',
      collectorClass: 'built-in',
      portrait: { src: '', alt: 'Field mask portrait' }
    },
    saved: {
      visualClass: 'captured-mask',
      artLabel: 'captured shell',
      sigil: '::',
      state: 'unforged',
      family: 'Captured shell',
      tagline: 'Lifted from live cadence.',
      voicePromise: 'A captured shell carrying residue from saved live cadence.',
      fieldUse: 'Use when you want to replay a saved shell through Homebase or Deck.',
      riskTell: 'Captured residue often preserves the strongest visible lanes.',
      frameTone: 'ash',
      collectorClass: 'captured',
      portrait: { src: '', alt: 'Captured shell portrait' }
    },
    trainer: {
      visualClass: 'trained-mask',
      artLabel: 'trained shell',
      sigil: '##',
      state: 'unforged',
      family: 'Forged shell',
      tagline: 'Derived under retrieval law.',
      voicePromise: 'A trained shell carrying the pressure of a validated forge pass.',
      fieldUse: 'Use when you want a trainer-forged shell available in Homebase or Deck.',
      riskTell: 'Forge residue can still cling where validation left the strongest lanes intact.',
      frameTone: 'bruise-violet',
      collectorClass: 'trained',
      portrait: { src: '', alt: 'Forged shell portrait' }
    }
  };
  const fallback = sources[persona.source] || {
    visualClass: 'field-mask',
    artLabel: `mask ${index + 1}`,
    sigil: '[]',
    state: 'unforged',
    family: 'Unregistered mask',
    tagline: 'Unknown field identity.',
    voicePromise: 'This mask has no registered portrait metadata yet.',
    fieldUse: 'Use to test an unregistered shell.',
    riskTell: 'No explicit risk tell has been registered yet.',
    frameTone: 'cyan',
    collectorClass: 'unknown',
    portrait: { src: '', alt: 'Unregistered mask portrait' }
  };
  return {
    visualClass: persona.maskVisualClass || fallback.visualClass,
    artLabel: persona.maskArtLabel || fallback.artLabel,
    sigil: persona.maskSigil || fallback.sigil,
    state: persona.maskState || fallback.state,
    family: persona.family || fallback.family,
    tagline: persona.tagline || fallback.tagline,
    voicePromise: persona.voicePromise || fallback.voicePromise,
    fieldUse: persona.fieldUse || fallback.fieldUse,
    riskTell: persona.riskTell || fallback.riskTell,
    frameTone: persona.frameTone || fallback.frameTone,
    collectorClass: persona.collectorClass || fallback.collectorClass,
    portrait: persona.portrait ? { ...persona.portrait } : { ...fallback.portrait }
  };
}

export function splitCadenceLockSamples(rawText = '') {
  return splitTrainerCorpusSamples(rawText);
}

export function resolvePersonaCatalog(engine, basePersonas = [], sampleLibrary = []) {
  const sampleLibraryById = sampleLibraryMap(sampleLibrary);

  return basePersonas.map((persona, index) => {
    const resolvedRecipe = persona.profileRecipe
      ? resolveRecipeProfile(engine, persona.profileRecipe, sampleLibraryById)
      : null;
    const profile = persona.profile
      ? { ...persona.profile }
      : resolvedRecipe?.profile
        ? { ...resolvedRecipe.profile }
        : null;
    const mod = persona.mod
      ? { ...persona.mod }
      : resolvedRecipe?.mod
        ? { ...resolvedRecipe.mod }
      : profile
        ? engine.cadenceModFromProfile(profile)
        : { sent: 0, cont: 0, punc: 0 };
    const art = BUILTIN_MASK_ART[persona.id] || fallbackMaskScaffold(persona, index);

    return {
      ...persona,
      chips: Array.isArray(persona.chips) ? [...persona.chips] : [],
      profile,
      mod,
      strength: Number(persona.strength || resolvedRecipe?.strength || 0.84),
      maskVisualClass: persona.maskVisualClass || art.visualClass,
      maskArtLabel: persona.maskArtLabel || art.artLabel,
      maskSigil: persona.maskSigil || art.sigil,
      maskState: persona.maskState || art.state,
      family: persona.family || art.family,
      tagline: persona.tagline || art.tagline,
      voicePromise: persona.voicePromise || art.voicePromise,
      fieldUse: persona.fieldUse || art.fieldUse,
      riskTell: persona.riskTell || art.riskTell,
      frameTone: persona.frameTone || art.frameTone,
      collectorClass: persona.collectorClass || art.collectorClass,
      portrait: persona.portrait ? { ...persona.portrait } : { ...art.portrait },
      source: persona.source || 'built-in'
    };
  });
}

export function buildCadenceLockRecord(engine, { corpusText = '', name = '', id = '', createdAt = '' } = {}) {
  const samples = splitCadenceLockSamples(corpusText);
  if (!samples.length) {
    throw new Error('Paste at least one sample before locking a cadence base.');
  }

  const extraction = buildCorpusExtraction(engine, samples);
  const fingerprintSummary = fingerprintSummaryFromExtraction(extraction);
  extraction.fingerprintSummary = fingerprintSummary;

  return {
    id: id || `lock-${Date.now()}-${slugify(name || samples[0].slice(0, 32)) || 'cadence'}`,
    name: safePersonaName(name, `Cadence Lock ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`),
    samples: extraction.samples.map((sample, index) => ({
      id: `sample-${index + 1}`,
      text: sample,
      profile: extraction.profiles[index]
    })),
    profile: extraction.targetProfile,
    fingerprint: extraction.fingerprint,
    stats: extraction.stats,
    selfSimilarity: extraction.selfSimilarity,
    fingerprintSummary,
    createdAt: createdAt || new Date().toISOString(),
    source: 'gallery-lock'
  };
}

export function buildLockDossier(engine, lock = {}) {
  if (!lock || !lock.profile) {
    return null;
  }

  const combinedText = (lock.samples || [])
    .map((sample) => sample.text)
    .join('\n\n');
  const signature = typeof engine.buildCadenceSignature === 'function'
    ? engine.buildCadenceSignature(combinedText, lock.profile)
    : null;
  const extraction = {
    fingerprint: lock.fingerprint || {},
    selfSimilarity: lock.selfSimilarity || {},
    fingerprintSummary: lock.fingerprintSummary || {}
  };

  return {
    id: lock.id,
    name: lock.name,
    source: lock.source || 'gallery-lock',
    stats: {
      sampleCount: lock.stats?.sampleCount || (lock.samples || []).length,
      totalWords: lock.stats?.totalWords || 0,
      avgWordsPerSample: lock.stats?.avgWordsPerSample || 0,
      avgSentencesPerSample: lock.stats?.avgSentencesPerSample || 0
    },
    selfSimilarity: {
      meanSimilarity: round(lock.selfSimilarity?.meanSimilarity, 4),
      meanTraceability: round(lock.selfSimilarity?.meanTraceability, 4),
      pairs: Number(lock.selfSimilarity?.pairs || 0)
    },
    profile: {
      avgSentenceLength: round(lock.profile.avgSentenceLength, 2),
      sentenceLengthSpread: round(lock.profile.sentenceLengthSpread, 2),
      punctuationDensity: round(lock.profile.punctuationDensity, 4),
      contractionDensity: round(lock.profile.contractionDensity, 4),
      recurrencePressure: round(lock.profile.recurrencePressure, 4),
      lexicalDispersion: round(lock.profile.lexicalDispersion, 4),
      contentWordComplexity: round(lock.profile.contentWordComplexity, 4),
      modifierDensity: round(lock.profile.modifierDensity, 4),
      hedgeDensity: round(lock.profile.hedgeDensity, 4),
      abstractionPosture: round(lock.profile.abstractionPosture, 4),
      directness: round(lock.profile.directness, 4),
      latinatePreference: round(lock.profile.latinatePreference, 4),
      registerMode: lock.profile.registerMode || 'unknown'
    },
    punctuationSnapshot: punctuationSnapshot(lock.profile.punctuationMix),
    functionWordSnapshot: topDistributionEntries(lock.profile.functionWordProfile),
    wordLengthSnapshot: topDistributionEntries(lock.profile.wordLengthProfile),
    dominantAxes: signature?.dominantAxes || [],
    fingerprintSummary: lock.fingerprintSummary || {},
    riskInterpretation: riskInterpretation(lock.profile, extraction, signature)
  };
}

export function compareTextToLock(engine, text = '', lock = {}) {
  const normalized = normalizeText(text);
  if (!normalized || !lock || !Array.isArray(lock.samples) || !lock.samples.length) {
    return null;
  }

  const profile = engine.extractCadenceProfile(normalized);
  const comparisons = lock.samples.map((sample) => {
    const comparison = engine.compareTexts(normalized, sample.text, {
      profileA: profile,
      profileB: sample.profile
    });
    return {
      sampleId: sample.id,
      similarity: round(comparison.similarity, 4),
      traceability: round(comparison.traceability, 4)
    };
  });
  const meanSimilarity = round(average(comparisons.map((entry) => entry.similarity)), 4);
  const meanTraceability = round(average(comparisons.map((entry) => entry.traceability)), 4);
  const strongestMatch = [...comparisons].sort((left, right) => right.traceability - left.traceability)[0] || null;
  const stickyLanes = stableAxisNotes(profile, lock.profile || {});

  return {
    profile,
    meanSimilarity,
    meanTraceability,
    strongestMatch,
    stickyLanes,
    closenessClass:
      meanTraceability >= 0.78 ? 'high' :
      meanTraceability >= 0.58 ? 'moderate' :
      meanTraceability >= 0.4 ? 'light' :
      'low'
  };
}

function effectSummaryFromProfiles(sourceProfile = {}, outputProfile = {}, deltaToLock = null) {
  const sentenceDelta = (outputProfile.avgSentenceLength || 0) - (sourceProfile.avgSentenceLength || 0);
  const punctuationDelta = (outputProfile.punctuationDensity || 0) - (sourceProfile.punctuationDensity || 0);
  const contractionDelta = (outputProfile.contractionDensity || 0) - (sourceProfile.contractionDensity || 0);
  const directnessDelta = (outputProfile.directness || 0) - (sourceProfile.directness || 0);
  const abstractionDelta = (outputProfile.abstractionPosture || 0) - (sourceProfile.abstractionPosture || 0);

  return {
    sentenceShift:
      sentenceDelta >= 4 ? 'longer lines' :
      sentenceDelta <= -4 ? 'shorter hits' :
      'span holds',
    punctuationShift:
      punctuationDelta >= 0.015 ? 'brighter punctuation' :
      punctuationDelta <= -0.015 ? 'straighter punctuation' :
      'punctuation holds',
    contractionShift:
      contractionDelta >= 0.01 ? 'more contraction' :
      contractionDelta <= -0.01 ? 'lower contraction' :
      'contraction holds',
    registerShift:
      outputProfile.registerMode && outputProfile.registerMode !== sourceProfile.registerMode
        ? `${outputProfile.registerMode} register`
        : directnessDelta >= 0.08
          ? 'more directive'
          : directnessDelta <= -0.08
            ? 'less directive'
            : abstractionDelta >= 0.08
              ? 'more abstract'
              : abstractionDelta <= -0.08
                ? 'more concrete'
                : 'register holds',
    legibilityEffect:
      deltaToLock && deltaToLock.traceability <= -0.05
        ? 'less home-sticky'
        : deltaToLock && deltaToLock.traceability >= 0.05
          ? 'more home-sticky'
          : 'home residue persists'
  };
}

function compactSwatch(text = '', maxLength = 180) {
  const normalized = normalizeText(text).replace(/\s+/g, ' ');
  if (!normalized) {
    return '';
  }
  if (normalized.length <= maxLength) {
    return normalized;
  }
  return `${normalized.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}

function maskContactSummary(result = null) {
  if (!result) {
    return {
      changedProximity: false,
      changedSurfaceTexture: false,
      contactClass: 'latent',
      fieldEffect: 'unresolved',
      line: 'No contact has been staged yet.'
    };
  }

  const delta = result.deltaToLock || {};
  const effect = result.effectSummary || {};
  const changedProximity = Math.abs(delta.traceability || 0) >= 0.05 || Math.abs(delta.similarity || 0) >= 0.05;
  const changedSurfaceTexture = Boolean(
    normalizeText(result.maskedText) &&
    normalizeText(result.rawText) &&
    normalizeText(result.maskedText) !== normalizeText(result.rawText)
  );
  const fieldEffect =
    changedProximity && changedSurfaceTexture
      ? 'both'
      : changedProximity
        ? 'proximity'
        : changedSurfaceTexture
          ? 'surface-texture'
          : 'neither';
  const proximityLine =
    (delta.traceability || 0) <= -0.05
      ? `Home trace eased by ${Math.round(Math.abs(delta.traceability || 0) * 100)} points.`
      : (delta.traceability || 0) >= 0.05
        ? `Home trace tightened by ${Math.round(Math.abs(delta.traceability || 0) * 100)} points.`
        : 'Home distance barely moved.';
  const textureLine =
    changedSurfaceTexture
      ? `${effect.sentenceShift || 'span holds'}, ${effect.punctuationShift || 'punctuation holds'}, ${effect.contractionShift || 'contraction holds'}.`
      : 'Surface texture held near source.';

  return {
    changedProximity,
    changedSurfaceTexture,
    contactClass:
      fieldEffect === 'both'
        ? 'full-contact'
        : fieldEffect === 'proximity'
          ? 'deep-drift'
          : fieldEffect === 'surface-texture'
            ? 'surface-drift'
            : 'near-hold',
    fieldEffect,
    line:
      fieldEffect === 'both'
        ? `${proximityLine} Surface texture shifted too.`
        : fieldEffect === 'proximity'
          ? proximityLine
          : fieldEffect === 'surface-texture'
            ? `Surface texture changed while home distance held. ${textureLine}`
            : 'The mask touched the passage, but home pressure and surface texture largely held.'
  };
}

export function buildMaskTransformationResult(engine, { comparisonText = '', lock = null, persona = null } = {}) {
  const normalized = normalizeText(comparisonText);
  if (!normalized || !persona?.profile) {
    return null;
  }

  const shell = {
    mode: 'persona',
    label: persona.name,
    mod: persona.mod ? { ...persona.mod } : null,
    profile: { ...persona.profile },
    strength: Number(persona.strength || 0.84)
  };
  const transfer = engine.buildCadenceTransfer(normalized, shell, { retrieval: true });
  const rawToLock = lock ? compareTextToLock(engine, normalized, lock) : null;
  const maskedToLock = lock ? compareTextToLock(engine, transfer.text, lock) : null;
  const deltaToLock = rawToLock && maskedToLock
    ? {
        similarity: round((maskedToLock.meanSimilarity || 0) - (rawToLock.meanSimilarity || 0), 4),
        traceability: round((maskedToLock.meanTraceability || 0) - (rawToLock.meanTraceability || 0), 4)
      }
    : null;
  const effectSummary = effectSummaryFromProfiles(
    engine.extractCadenceProfile(normalized),
    transfer.outputProfile || engine.extractCadenceProfile(transfer.text),
    deltaToLock
  );
  const heldLanes = maskedToLock?.stickyLanes || [];
  const whatMoved = (transfer.changedDimensions || []).slice(0, 5);
  const stickinessNotes = [];

  if (deltaToLock) {
    if (deltaToLock.traceability <= -0.05) {
      stickinessNotes.push(`Mask pull reduced home trace by ${Math.round(Math.abs(deltaToLock.traceability) * 100)} points.`);
    } else if (deltaToLock.traceability >= 0.05) {
      stickinessNotes.push(`Mask pull raised home trace by ${Math.round(deltaToLock.traceability * 100)} points.`);
    } else {
      stickinessNotes.push('Mask motion changed surface texture more than home proximity.');
    }
  }

  if (heldLanes.length) {
    stickinessNotes.push(`Sticky lanes still visible: ${heldLanes.join(', ')}.`);
  }

  if (!stickinessNotes.length) {
    stickinessNotes.push('No lock selected yet. The mask can still be sampled, but home proximity is unresolved.');
  }

  const swatch = compactSwatch(transfer.text || '');
  const contactSummary = maskContactSummary({
    rawText: normalized,
    maskedText: transfer.text,
    deltaToLock,
    effectSummary
  });

  return {
    rawText: normalized,
    maskedText: transfer.text,
    transfer,
    rawToLock,
    maskedToLock,
    deltaToLock,
    effectSummary,
    whatMoved,
    whatHeld: heldLanes,
    stickinessNotes,
    swatch,
    contactSummary
  };
}

export function buildMaskEffectSummary(engine, { comparisonText = '', lock = null, persona = null } = {}) {
  const result = buildMaskTransformationResult(engine, { comparisonText, lock, persona });
  return result ? result.effectSummary : null;
}

export function buildMaskSwatch(engine, { comparisonText = '', persona = null } = {}) {
  const result = buildMaskTransformationResult(engine, { comparisonText, lock: null, persona });
  return result ? result.swatch : '';
}

export function buildMaskContactSummary(engine, { comparisonText = '', lock = null, persona = null } = {}) {
  const result = buildMaskTransformationResult(engine, { comparisonText, lock, persona });
  return result ? result.contactSummary : maskContactSummary(null);
}
