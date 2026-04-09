import {
  classifyTD613ApertureProjection,
  detectTD613ApertureTextPathologies,
  extractTD613ApertureWitnessAnchors,
  registerTD613ApertureSegment,
  repairTD613ApertureProjection,
  splitTD613ApertureSourceSegments
} from '../../engine/td613-aperture.js';
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

function enforceClippedMaskSurface(text = '') {
  return normalizeText(
    String(text || '')
      .replace(/\bbut couldn't complete login because\b/gi, "but couldn't complete login. Because")
      .replace(/,\s+which lined up ([^.]+?)\./gi, '. That lined up $1.')
      .replace(/,\s+but that advice didn't clear the hold because\b/gi, ". That advice didn't clear the hold because")
      .replace(/\bbecause the underlying issue wasn't credential mismatch\./gi, "The underlying issue wasn't credential mismatch.")
      .replace(/\bhold The underlying issue wasn't credential mismatch\./gi, "hold. The underlying issue wasn't credential mismatch.")
      .replace(/\bremains inaccessible until\b/gi, 'remains inaccessible. Until')
      .replace(/guidance that makes the customer loop through the same dead route while the fraud queue stays untouched\./gi, 'guidance. It keeps the customer looping through the same dead route while the fraud queue stays untouched.')
      .replace(/\bguidance this makes\b/gi, 'guidance. This makes')
      .replace(/,\s+which aligned ([^.]+?)\./gi, '. That aligned $1.')
      .replace(/,\s+which made ([^.]+?)\./gi, '. That made $1.')
  );
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
  const resolvedEntries = [];
  const missingSampleIds = [];
  blend.forEach((entry) => {
    const sampleId = entry?.sampleId;
    const sample = sampleLibraryById[sampleId];
    if (!sample || !sample.text) {
      if (sampleId) {
        missingSampleIds.push(sampleId);
      }
      return;
    }
    const count = repeatCount(entry.weight);
    resolvedEntries.push({
      sampleId,
      sampleName: sample.name || sampleId,
      familyId: sample.familyId || '',
      variant: sample.variant || '',
      weight: Number(entry.weight || 0),
      repeats: count
    });
    for (let index = 0; index < count; index += 1) {
      samples.push(sample.text);
    }
  });
  return {
    samples,
    resolvedEntries,
    missingSampleIds: [...new Set(missingSampleIds)]
  };
}

function resolveRecipeProfile(engine, recipe = {}, sampleLibraryById = {}) {
  const resolution = resolveRecipeSamples(recipe, sampleLibraryById);
  const samples = resolution.samples;

  const strength = Number(recipe.strength || 0.86);
  const overlayShell = recipe.overlayMod
    ? {
        mode: 'synthetic',
        mod: { ...recipe.overlayMod },
        strength
      }
    : null;

  if (!samples.length) {
    return {
      profile: null,
      mod: recipe.overlayMod ? { ...recipe.overlayMod } : null,
      strength,
      sampleCount: 0,
      resolvedEntries: resolution.resolvedEntries.map((entry) => ({ ...entry })),
      missingSampleIds: [...resolution.missingSampleIds],
      overlayMod: recipe.overlayMod ? { ...recipe.overlayMod } : null
    };
  }

  const transformedSamples = overlayShell
    ? samples.map((sample) => engine.buildCadenceTransfer(sample, overlayShell).text)
    : samples;
  const extraction = buildCorpusExtraction(engine, transformedSamples);

  return {
    profile: extraction.targetProfile,
    mod: recipe.overlayMod ? { ...recipe.overlayMod } : engine.cadenceModFromProfile(extraction.targetProfile),
    strength,
    sampleCount: transformedSamples.length,
    resolvedEntries: resolution.resolvedEntries.map((entry) => ({ ...entry })),
    missingSampleIds: [...resolution.missingSampleIds],
    overlayMod: recipe.overlayMod ? { ...recipe.overlayMod } : null
  };
}

function recipeFieldSpan(entries = []) {
  const families = [...new Set((entries || []).map((entry) => entry.familyId).filter(Boolean))];
  const variants = [...new Set((entries || []).map((entry) => entry.variant).filter(Boolean))];
  const formatLabel = (value = '') => String(value || '').replace(/-/g, ' ');

  return {
    families,
    variants,
    line: families.length || variants.length
      ? `Families // ${families.map(formatLabel).join(' + ') || 'unbound'} | Variants // ${variants.map(formatLabel).join(' + ') || 'unbound'}`
      : 'Families // unresolved | Variants // unresolved',
    shortLine: families.length || variants.length
      ? `${families.length || 0} diagnostics families // ${variants.map(formatLabel).join(' + ') || 'unbound'}`
      : 'Diagnostics specimen unresolved'
  };
}

function buildDiagnosticSpecimen(engine, shell = {}, resolvedEntries = [], sampleLibraryById = {}) {
  if (!resolvedEntries.length || !shell?.profile) {
    return null;
  }

  const rankedEntries = [...resolvedEntries].sort((left, right) =>
    Number(right.weight || 0) - Number(left.weight || 0) ||
    Number(right.repeats || 0) - Number(left.repeats || 0) ||
    String(left.sampleId || '').localeCompare(String(right.sampleId || ''))
  );
  const dominantEntry = rankedEntries[0];
  const dominantSample = sampleLibraryById[dominantEntry.sampleId];
  if (!dominantSample?.text) {
    return null;
  }

  const specimenTransfer = engine.buildCadenceTransfer(dominantSample.text, shell, { retrieval: true });
  const span = recipeFieldSpan(resolvedEntries);

  return {
    sourceSampleId: dominantEntry.sampleId,
    sourceSampleName: dominantEntry.sampleName || dominantEntry.sampleId,
    swatch: compactSwatch(specimenTransfer.text || dominantSample.text, 180),
    fieldSpanLine: span.line,
    fieldSpanShort: span.shortLine,
    contributorLine: `Specimen anchor // ${dominantEntry.sampleName || dominantEntry.sampleId} x${round(dominantEntry.weight || 0, 2)}`
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
    const strength = Number(persona.strength || resolvedRecipe?.strength || 0.84);
    const resolvedShell = profile
      ? {
          mode: 'persona',
          label: persona.name,
          mod: mod ? { ...mod } : null,
          profile: { ...profile },
          strength
        }
      : null;
    const diagnosticSpecimen = resolvedShell && resolvedRecipe?.resolvedEntries?.length
      ? buildDiagnosticSpecimen(engine, resolvedShell, resolvedRecipe.resolvedEntries, sampleLibraryById)
      : null;

    return {
      ...persona,
      chips: Array.isArray(persona.chips) ? [...persona.chips] : [],
      profile,
      mod,
      strength,
      recipeResolution: persona.profileRecipe
        ? {
            entries: (resolvedRecipe?.resolvedEntries || []).map((entry) => ({ ...entry })),
            missingSampleIds: [...(resolvedRecipe?.missingSampleIds || [])],
            strength,
            overlayMod: resolvedRecipe?.overlayMod ? { ...resolvedRecipe.overlayMod } : null,
            sampleCount: resolvedRecipe?.sampleCount || 0
          }
        : null,
      diagnosticSpecimen: diagnosticSpecimen
        ? { ...diagnosticSpecimen }
        : null,
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

function stripSignalPunctuation(text = '') {
  return normalizeText(text)
    .toLowerCase()
    .replace(/[.,!?;:'"()[\]{}]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const MASK_LEAD_MARKER_RE = /^(?:apparently|basically|clearly|frankly|honestly|look|okay|ok|well)\b[,:;.!?\-\s]*/i;
const MASK_STOPWORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'because', 'been', 'but', 'by', 'for', 'from',
  'had', 'has', 'have', 'he', 'her', 'hers', 'him', 'his', 'i', 'if', 'in', 'into', 'is',
  'it', 'its', 'me', 'my', 'of', 'on', 'or', 'our', 'ours', 'she', 'so', 'that', 'the',
  'their', 'theirs', 'them', 'there', 'they', 'this', 'to', 'us', 'was', 'we', 'were',
  'what', 'when', 'where', 'who', 'why', 'will', 'with', 'you', 'your', 'yours'
]);
const CONTRACTION_REPLACEMENTS = Object.freeze([
  ['\\bI am\\b', "I'm"],
  ['\\bI have\\b', "I've"],
  ['\\bI will\\b', "I'll"],
  ['\\bI would\\b', "I'd"],
  ['\\bit is\\b', "it's"],
  ['\\bthat is\\b', "that's"],
  ['\\bthere is\\b', "there's"],
  ['\\bthere are\\b', "there're"],
  ['\\bwe are\\b', "we're"],
  ['\\bwe have\\b', "we've"],
  ['\\byou are\\b', "you're"],
  ['\\byou have\\b', "you've"],
  ['\\bthey are\\b', "they're"],
  ['\\bthey have\\b', "they've"],
  ['\\bdoes not\\b', "doesn't"],
  ['\\bdo not\\b', "don't"],
  ['\\bdid not\\b', "didn't"],
  ['\\bwas not\\b', "wasn't"],
  ['\\bwere not\\b', "weren't"],
  ['\\bhas not\\b', "hasn't"],
  ['\\bhave not\\b', "haven't"],
  ['\\bhad not\\b', "hadn't"],
  ['\\bwill not\\b', "won't"],
  ['\\bwould not\\b', "wouldn't"],
  ['\\bcould not\\b', "couldn't"],
  ['\\bshould not\\b', "shouldn't"],
  ['\\bcan not\\b', "can't"]
]);
const EXPANSION_REPLACEMENTS = Object.freeze([
  ["\\bI'm\\b", 'I am'],
  ["\\bI've\\b", 'I have'],
  ["\\bI'll\\b", 'I will'],
  ["\\bI'd\\b", 'I would'],
  ["\\bit's\\b", 'it is'],
  ["\\bthat's\\b", 'that is'],
  ["\\bthere's\\b", 'there is'],
  ["\\bwe're\\b", 'we are'],
  ["\\bwe've\\b", 'we have'],
  ["\\byou're\\b", 'you are'],
  ["\\byou've\\b", 'you have'],
  ["\\bthey're\\b", 'they are'],
  ["\\bthey've\\b", 'they have'],
  ["\\bdoesn't\\b", 'does not'],
  ["\\bdon't\\b", 'do not'],
  ["\\bdidn't\\b", 'did not'],
  ["\\bwasn't\\b", 'was not'],
  ["\\bweren't\\b", 'were not'],
  ["\\bhasn't\\b", 'has not'],
  ["\\bhaven't\\b", 'have not'],
  ["\\bhadn't\\b", 'had not'],
  ["\\bwon't\\b", 'will not'],
  ["\\bwouldn't\\b", 'would not'],
  ["\\bcouldn't\\b", 'could not'],
  ["\\bshouldn't\\b", 'should not'],
  ["\\bcan't\\b", 'can not']
]);

function splitSentencesPreservePunctuation(text = '') {
  const normalized = String(text || '').replace(/\r\n/g, '\n').trim();
  if (!normalized) {
    return [];
  }
  return normalized
    .split(/(?<=[.!?]["')\]]*)(?=\s+|\n|$)/g)
    .map((entry) => normalizeText(entry))
    .filter(Boolean);
}

function splitPreviewSegments(text = '') {
  const normalized = String(text || '').replace(/\r\n/g, '\n').trim();
  if (!normalized) {
    return [];
  }
  return normalized
    .split(/(?<=[.!?;]["')\]]*)(?=\s+|\n|$)/g)
    .map((entry) => normalizeText(entry))
    .filter(Boolean);
}

function maskWordTokens(text = '') {
  return normalizeText(text)
    .toLowerCase()
    .replace(/[^a-z0-9' ]+/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function maskContentWords(text = '') {
  return maskWordTokens(text)
    .filter((token) => token.length > 2 && !MASK_STOPWORDS.has(token));
}

function lexicalDriftSummary(source = '', output = '') {
  const sourceContent = maskContentWords(source);
  const outputContent = maskContentWords(output);
  const sourceSet = new Set(sourceContent);
  const outputSet = new Set(outputContent);
  const preservedCount = [...sourceSet].filter((token) => outputSet.has(token)).length;
  const introduced = [...outputSet].filter((token) => !sourceSet.has(token));
  return {
    sourceContentCount: sourceSet.size,
    outputContentCount: outputSet.size,
    preservedContentRatio: sourceSet.size ? round(preservedCount / sourceSet.size, 4) : 1,
    introducedContentCount: introduced.length,
    introducedContent: introduced
  };
}

function tidyMaskSentenceText(text = '') {
  return normalizeText(
    String(text || '')
      .replace(/\s+([,;:.!?])/g, '$1')
      .replace(/,\s*;/g, ';')
      .replace(/;\s*,/g, ';')
      .replace(/;\s*\./g, '.')
      .replace(/,\s*\./g, '.')
      .replace(/\.{2,}/g, '.')
      .replace(/!{2,}/g, '!')
      .replace(/\?{2,}/g, '?')
      .replace(/^[,;:\-–—\s]+/g, '')
  );
}

function matchSentenceSurface(source = '', output = '') {
  const sourceText = normalizeText(source);
  let working = tidyMaskSentenceText(output);
  if (!sourceText || !working) {
    return working;
  }

  if (/^[A-Z]/.test(sourceText) && /^[a-z]/.test(working)) {
    working = working.charAt(0).toUpperCase() + working.slice(1);
  }

  const sourceTerminal = sourceText.match(/[.!?]["')\]]*$/)?.[0] || '';
  if (sourceTerminal && !/[.!?]["')\]]*$/.test(working)) {
    working = `${working}${sourceTerminal}`;
  }

  return tidyMaskSentenceText(working);
}

function stripLeadingMaskIntrusion(source = '', output = '') {
  let working = tidyMaskSentenceText(output);
  if (!working) {
    return working;
  }

  if (MASK_LEAD_MARKER_RE.test(working) && !MASK_LEAD_MARKER_RE.test(normalizeText(source))) {
    working = working.replace(MASK_LEAD_MARKER_RE, '');
  }

  if (/^and\b/i.test(working) && !/^and\b/i.test(normalizeText(source))) {
    working = working.replace(/^and\b[,\s]*/i, '');
  }

  if (/^but\b/i.test(working) && !/^but\b/i.test(normalizeText(source))) {
    working = working.replace(/^but\b[,\s]*/i, '');
  }

  return matchSentenceSurface(source, working);
}

function outputHasMaskPathology(text = '') {
  const normalized = normalizeText(text);
  if (!normalized) {
    return true;
  }
  return /(?:,\s*;|;\s*,|;\.|,\.|\.{2,}|,,|;;)/.test(normalized);
}

function replaceWithCaseAware(text = '', pattern = '', replacement = '') {
  return text.replace(new RegExp(pattern, 'gi'), (match) => {
    if (match.toUpperCase() === match) {
      return replacement.toUpperCase();
    }
    if (match.charAt(0).toUpperCase() === match.charAt(0)) {
      return replacement.charAt(0).toUpperCase() + replacement.slice(1);
    }
    return replacement;
  });
}

function contractCommonPhrases(text = '') {
  return CONTRACTION_REPLACEMENTS.reduce(
    (working, [pattern, replacement]) => replaceWithCaseAware(working, pattern, replacement),
    String(text || '')
  );
}

function expandCommonContractions(text = '') {
  return EXPANSION_REPLACEMENTS.reduce(
    (working, [pattern, replacement]) => replaceWithCaseAware(working, pattern, replacement),
    String(text || '')
  );
}

function applySurfaceOnlyMaskSentence(source = '', sourceProfile = {}, targetProfile = {}, personaId = '') {
  let working = String(source || '');
  const contractionDelta = Number(targetProfile.contractionDensity || 0) - Number(sourceProfile.contractionDensity || 0);
  const sentenceDelta = Number(targetProfile.avgSentenceLength || 0) - Number(sourceProfile.avgSentenceLength || 0);
  const punctuationDelta = Number(targetProfile.punctuationDensity || 0) - Number(sourceProfile.punctuationDensity || 0);

  if (contractionDelta >= 0.03) {
    working = contractCommonPhrases(working);
  } else if (contractionDelta <= -0.03) {
    working = expandCommonContractions(working);
  }

  if (personaId === 'spark' || sentenceDelta <= -1.2) {
    working = working
      .replace(/,\s+because\b/gi, '. Because')
      .replace(/,\s+but\b/gi, '. But')
      .replace(/,\s+which\b/gi, '. Which')
      .replace(/,\s+and\b/gi, '. And')
      .replace(/\bbecause\b/gi, '. Because')
      .replace(/\bregarding\b/gi, '. Regarding')
      .replace(/\bafter\b/gi, '. After');
  }

  if (personaId === 'matron') {
    working = working
      .replace(/,\s+which\b/gi, '; which')
      .replace(/,\s+and\b/gi, '; and');
  }

  if (personaId === 'undertow') {
    working = working
      .replace(/,\s+but\b/gi, '; but')
      .replace(/\bbecause\b/gi, '. Because')
      .replace(/\bafter\b/gi, '. After');
  }

  if (personaId === 'archivist') {
    working = working
      .replace(/,\s+which\b/gi, '. Which')
      .replace(/,\s+who\b/gi, '. Who');
  }

  if (personaId === 'cross-examiner') {
    working = working
      .replace(/,\s+which\b/gi, '. Which')
      .replace(/\bbecause\b/gi, '. Because')
      .replace(/,\s+and\b/gi, '. And')
      .replace(/\bafter\b/gi, '. After');
  }

  if (punctuationDelta >= 0.015) {
    working = working.replace(/,\s+(?=[A-Z])/g, '; ');
  } else if (punctuationDelta <= -0.015) {
    working = working.replace(/;\s+/g, '. ');
  }

  return matchSentenceSurface(source, working);
}

function deriveRealizedMaskDimensions(sourceProfile = {}, outputProfile = {}) {
  const changed = [];
  if (Math.abs((outputProfile.avgSentenceLength || 0) - (sourceProfile.avgSentenceLength || 0)) >= 1.5) {
    changed.push('sentence-mean');
  }
  if (Math.abs((outputProfile.sentenceCount || 0) - (sourceProfile.sentenceCount || 0)) >= 1) {
    changed.push('sentence-count');
  }
  if (Math.abs((outputProfile.sentenceLengthSpread || 0) - (sourceProfile.sentenceLengthSpread || 0)) >= 1.25) {
    changed.push('sentence-spread');
  }
  if (Math.abs((outputProfile.contractionDensity || 0) - (sourceProfile.contractionDensity || 0)) >= 0.03) {
    changed.push('contraction-posture');
  }
  if (Math.abs((outputProfile.lineBreakDensity || 0) - (sourceProfile.lineBreakDensity || 0)) >= 0.01) {
    changed.push('line-break-texture');
  }
  if (Math.abs((outputProfile.punctuationDensity || 0) - (sourceProfile.punctuationDensity || 0)) >= 0.015) {
    changed.push('punctuation-shape');
  }
  if ((outputProfile.registerMode || '') !== (sourceProfile.registerMode || '')) {
    changed.push('lexical-register');
  }
  if (Math.abs((outputProfile.directness || 0) - (sourceProfile.directness || 0)) >= 0.08) {
    changed.push('directness');
  }
  if (Math.abs((outputProfile.abstractionPosture || 0) - (sourceProfile.abstractionPosture || 0)) >= 0.08) {
    changed.push('abstraction-posture');
  }
  if (Math.abs((outputProfile.conversationalPosture || 0) - (sourceProfile.conversationalPosture || 0)) >= 0.08) {
    changed.push('conversation-posture');
  }
  if (Math.abs((outputProfile.modifierDensity || 0) - (sourceProfile.modifierDensity || 0)) >= 0.03) {
    changed.push('modifier-density');
  }
  return changed;
}

function substantiveMaskDimensions(changedDimensions = []) {
  return (changedDimensions || []).filter((dimension) =>
    dimension !== 'contraction-posture' && dimension !== 'punctuation-shape'
  );
}

const MASK_REALIZATION_STRUCTURAL_DIMENSIONS = new Set([
  'sentence-mean',
  'sentence-count',
  'sentence-spread',
  'contraction-posture',
  'line-break-texture',
  'connector-stance'
]);

const MASK_REALIZATION_LEXICAL_DIMENSIONS = new Set([
  'lexical-register',
  'content-word-complexity',
  'modifier-density',
  'directness',
  'abstraction-posture',
  'abbreviation-posture',
  'orthography-posture',
  'fragment-posture',
  'conversation-posture',
  'surface-marker-posture'
]);

function determineMaskRealizationTier(changedDimensions = [], lexemeSwaps = []) {
  const hasStructural = (changedDimensions || []).some((dimension) =>
    MASK_REALIZATION_STRUCTURAL_DIMENSIONS.has(dimension)
  );
  const hasLexical = (changedDimensions || []).some((dimension) =>
    MASK_REALIZATION_LEXICAL_DIMENSIONS.has(dimension)
  ) || (lexemeSwaps || []).length > 0;

  if (!(changedDimensions || []).length && !(lexemeSwaps || []).length) {
    return 'none';
  }
  if (hasStructural && hasLexical) {
    return 'lexical-structural';
  }
  return 'cadence-only';
}

function buildSegmentProtectedState(sourceText = '') {
  const exactAnchors = extractTD613ApertureWitnessAnchors({ sourceText })
    .filter((anchor) => anchor.exact)
    .map((anchor) => ({ value: anchor.value }));
  return {
    literals: exactAnchors,
    text: sourceText
  };
}

function buildHeldSemanticAudit(sourceIR = {}, registeredText = '') {
  const sourceClauseCount = Number(sourceIR?.metadata?.clauseCount || 0);
  const outputClauseCount = Math.max(sourceClauseCount, splitPreviewSegments(registeredText).length || 0);
  return {
    propositionCoverage: 1,
    actorCoverage: 1,
    actionCoverage: 1,
    objectCoverage: 1,
    polarityMismatches: 0,
    tenseMismatches: 0,
    protectedAnchorIntegrity: 1,
    clauseAudits: [],
    sourceClauseCount,
    outputClauseCount
  };
}

function buildHeldProtectedAnchorAudit(registration = {}) {
  const audit = registration.registeredWitnessAudit || {};
  return {
    totalAnchors: Number(audit.totalAnchors || 0),
    resolvedAnchors: Number(audit.totalAnchors || 0),
    missingAnchors: [],
    protectedAnchorIntegrity: 1
  };
}

function profileDriftToTarget(profile = {}, targetProfile = {}) {
  return round(
    (Math.abs((profile.avgSentenceLength || 0) - (targetProfile.avgSentenceLength || 0)) / 20) +
    (Math.abs((profile.contractionDensity || 0) - (targetProfile.contractionDensity || 0)) * 6) +
    (Math.abs((profile.punctuationDensity || 0) - (targetProfile.punctuationDensity || 0)) * 8) +
    (Math.abs((profile.directness || 0) - (targetProfile.directness || 0)) * 3) +
    (Math.abs((profile.abstractionPosture || 0) - (targetProfile.abstractionPosture || 0)) * 3) +
    ((profile.registerMode || '') === (targetProfile.registerMode || '') ? 0 : 0.5),
    4
  );
}

function aggregateSemanticAudit(segmentLedger = []) {
  if (!segmentLedger.length) {
    return buildHeldSemanticAudit({}, '');
  }
  const averageKey = (key, fallback = 1) => round(
    segmentLedger.reduce((sum, entry) => sum + Number(entry.semanticAudit?.[key] ?? fallback), 0) /
    Math.max(segmentLedger.length, 1),
    4
  );
  return {
    propositionCoverage: averageKey('propositionCoverage'),
    actorCoverage: averageKey('actorCoverage'),
    actionCoverage: averageKey('actionCoverage'),
    objectCoverage: averageKey('objectCoverage'),
    polarityMismatches: segmentLedger.reduce((sum, entry) => sum + Number(entry.semanticAudit?.polarityMismatches || 0), 0),
    tenseMismatches: segmentLedger.reduce((sum, entry) => sum + Number(entry.semanticAudit?.tenseMismatches || 0), 0),
    protectedAnchorIntegrity: averageKey('protectedAnchorIntegrity'),
    clauseAudits: segmentLedger.flatMap((entry) => entry.semanticAudit?.clauseAudits || []),
    sourceClauseCount: segmentLedger.reduce((sum, entry) => sum + Number(entry.semanticAudit?.sourceClauseCount || 0), 0),
    outputClauseCount: segmentLedger.reduce((sum, entry) => sum + Number(entry.semanticAudit?.outputClauseCount || 0), 0)
  };
}

function aggregateProtectedAnchorAudit(segmentLedger = []) {
  const totalAnchors = segmentLedger.reduce((sum, entry) => sum + Number(entry.protectedAnchorAudit?.totalAnchors || 0), 0);
  const resolvedAnchors = segmentLedger.reduce((sum, entry) => sum + Number(entry.protectedAnchorAudit?.resolvedAnchors || 0), 0);
  const missingAnchors = [...new Set(segmentLedger.flatMap((entry) => entry.protectedAnchorAudit?.missingAnchors || []))];
  return {
    totalAnchors,
    resolvedAnchors,
    missingAnchors,
    protectedAnchorIntegrity: totalAnchors ? round(resolvedAnchors / totalAnchors, 4) : 1
  };
}

function aggregateApertureAudit(segmentLedger = []) {
  const audits = segmentLedger.map((entry) => entry?.apertureAudit || {}).filter(Boolean);
  return {
    observedRegime: 'PRCS-A',
    instrumentRole: 'counter-tool',
    generatorFault: audits.some((audit) => audit.generatorFault),
    warningSignals: [...new Set(audits.flatMap((audit) => audit.warningSignals || []))],
    repairPasses: [...new Set(audits.flatMap((audit) => audit.repairPasses || []))],
    candidateSuppression: round(audits.reduce((max, audit) => Math.max(max, Number(audit.candidateSuppression || 0)), 0), 4),
    observabilityDeficit: round(audits.reduce((max, audit) => Math.max(max, Number(audit.observabilityDeficit || 0)), 0), 4),
    aliasPersistence: round(audits.reduce((max, audit) => Math.max(max, Number(audit.aliasPersistence || 0)), 0), 4),
    namingSensitivity: round(audits.reduce((max, audit) => Math.max(max, Number(audit.namingSensitivity || 0)), 0), 4),
    redundancyInflation: round(audits.reduce((max, audit) => Math.max(max, Number(audit.redundancyInflation || 0)), 0), 4),
    capacityPressure: round(audits.reduce((max, audit) => Math.max(max, Number(audit.capacityPressure || 0)), 0), 4),
    policyPressure: round(audits.reduce((max, audit) => Math.max(max, Number(audit.policyPressure || 0)), 0), 4),
    withheldMaterial: audits.some((audit) => audit.withheldMaterial),
    withheldReason: audits.find((audit) => audit.withheldReason)?.withheldReason || null
  };
}

function segmentOutcomeCounts(segmentLedger = []) {
  return segmentLedger.reduce((acc, entry) => {
    const outcome = entry?.outcome || 'surface-held';
    if (outcome === 'projected') {
      acc.projected += 1;
    } else if (outcome === 'repaired') {
      acc.repaired += 1;
    } else if (outcome === 'surface-held') {
      acc.surfaceHeld += 1;
    } else {
      acc.sourceRerouted += 1;
    }
    return acc;
  }, {
    projected: 0,
    repaired: 0,
    surfaceHeld: 0,
    sourceRerouted: 0
  });
}

function aggregateApertureOutcome(segmentLedger = []) {
  const counts = segmentOutcomeCounts(segmentLedger);
  const total = segmentLedger.length;
  if (!total) {
    return 'surface-held';
  }
  if (counts.sourceRerouted === total) {
    return 'source-rerouted';
  }
  if ((counts.projected + counts.repaired) === 0 && counts.surfaceHeld > 0) {
    return 'surface-held';
  }
  if (counts.repaired > 0 || counts.surfaceHeld > 0 || counts.sourceRerouted > 0) {
    return 'repaired';
  }
  return 'projected';
}

function buildRegistrationLine(outcome = 'surface-held', counts = {}) {
  const total = (counts.projected || 0) + (counts.repaired || 0) + (counts.surfaceHeld || 0) + (counts.sourceRerouted || 0);
  if (!total) {
    return 'Aperture is waiting for a registerable segment.';
  }
  if (outcome === 'source-rerouted') {
    return `Aperture withheld ${counts.sourceRerouted || total} of ${total} segment${total === 1 ? '' : 's'} only after catastrophic generator faults.`;
  }
  if (outcome === 'surface-held' && (counts.projected || 0) === 0 && (counts.repaired || 0) === 0) {
    return `Aperture kept ${counts.surfaceHeld || total} of ${total} segment${total === 1 ? '' : 's'} in a surface-held lane and surfaced pressure notes instead of suppressing them.`;
  }

  const parts = [];
  if (counts.projected) {
    parts.push(`${counts.projected} projected`);
  }
  if (counts.repaired) {
    parts.push(`${counts.repaired} repaired`);
  }
  if (counts.surfaceHeld) {
    parts.push(`${counts.surfaceHeld} surface-held`);
  }
  if (counts.sourceRerouted) {
    parts.push(`${counts.sourceRerouted} source-rerouted`);
  }
  return `Aperture registered ${parts.join(' // ')} segment${total === 1 ? '' : 's'} and kept the pressure ledger visible.`;
}

function buildLedgerPreview(segmentLedger = []) {
  const previewHeld = segmentLedger.some((entry) => entry.previewHold);
  const alignedCount = previewHeld ? 0 : segmentLedger.length;
  const ratio = round(
    alignedCount / Math.max(segmentLedger.length, 1),
    4
  );

  if (previewHeld) {
    return {
      rows: [],
      alignment: {
        ratio,
        alignedCount,
        sourceCount: segmentLedger.length,
        outputCount: segmentLedger.length,
        trustworthy: false,
        withheld: true
      }
    };
  }

  const rows = segmentLedger.map((entry) => {
    const source = compactSwatch(entry.sourceText, 120);
    const output = compactSwatch(entry.registeredText, 120);
    const effect = stripSignalPunctuation(entry.sourceText) === stripSignalPunctuation(entry.registeredText)
      ? 'hold'
      : 'shift';
    return {
      effect,
      source,
      output
    };
  });

  return {
    rows: (rows.filter((row) => row.effect !== 'hold').length ? rows.filter((row) => row.effect !== 'hold') : rows).slice(0, 4),
    alignment: {
      ratio,
      alignedCount,
      sourceCount: segmentLedger.length,
      outputCount: segmentLedger.length,
      trustworthy: true,
      withheld: false
    }
  };
}

function isCounterRecognitionSurface(text = '') {
  return /\b(?:badge(?:-renewal)?|door\s+\d+|west annex|suite\s+\d+|firmware|controller|custody|restricted room|archive operations|manual escort|device challenge|fraud hold)\b/i.test(text);
}

function buildRegisteredMaskSurface(engine, sourceText = '', shell = {}) {
  const paragraphs = String(sourceText || '')
    .replace(/\r\n/g, '\n')
    .split(/\n{2,}/)
    .map((entry) => normalizeText(entry))
    .filter(Boolean);

  const registeredSegments = [];
  const segmentLedger = [];
  const internalParagraphs = [];
  const notes = new Set();

  paragraphs.forEach((paragraph, paragraphIndex) => {
    const sourceSegments = splitTD613ApertureSourceSegments(paragraph);
    const paragraphLedger = [];
    const internalSegments = [];

    sourceSegments.forEach((segment, segmentIndex) => {
      const sourceProfile = engine.extractCadenceProfile(segment);
      const protectedState = buildSegmentProtectedState(segment);
      const sourceIR = engine.segmentTextToIR(segment, protectedState);
      const transfer = engine.buildCadenceTransfer(segment, shell, { retrieval: true });
      const projectedText = stripLeadingMaskIntrusion(segment, transfer.text || segment);
      const surfaceText = applySurfaceOnlyMaskSentence(segment, sourceProfile, shell.profile || {}, shell.personaId || '');
      const registration = registerTD613ApertureSegment({
        sourceText: segment,
        projectedText,
        surfaceText,
        personaId: shell.personaId || '',
        sourceProfile,
        targetProfile: shell.profile || {},
        sourceIR,
        protectedState,
        blocked: Boolean(transfer.apertureAudit?.generatorFault),
        transferClass: transfer.transferClass || ''
      });
      let registeredText = registration.registeredText;
      let registeredOutcome = registration.outcome;
      let registeredPathologies = [...(registration.pathologies || [])];
      const entryNotes = [...new Set([
        ...(transfer.notes || []),
        ...(registration.notes || [])
      ])];
      if (registration.outcome !== 'source-rerouted' && surfaceText && surfaceText !== registration.registeredText) {
        const projectedProfile = engine.extractCadenceProfile(registration.registeredText);
        const surfaceProfile = engine.extractCadenceProfile(surfaceText);
        const projectedDrift = profileDriftToTarget(projectedProfile, shell.profile || {});
        const surfaceDrift = profileDriftToTarget(surfaceProfile, shell.profile || {});
        if (surfaceText !== segment && surfaceDrift + 0.05 < projectedDrift) {
          registeredText = surfaceText;
          registeredOutcome = 'repaired';
          registeredPathologies = detectTD613ApertureTextPathologies({
            sourceText: segment,
            outputText: registeredText
          }).flags;
          entryNotes.push('Aperture preferred the safer visible counter-record because it preserved witness anchors while landing the target persona pressure more honestly.');
        }
      }

      const registeredProfile = engine.extractCadenceProfile(registeredText);
      const changedDimensions = deriveRealizedMaskDimensions(sourceProfile, registeredProfile);
      const semanticAudit = (registeredOutcome === 'projected' || registeredOutcome === 'repaired')
        ? {
            ...(transfer.semanticAudit || buildHeldSemanticAudit(sourceIR, registration.registeredText)),
            protectedAnchorIntegrity: Number(registration.witnessAnchorIntegrity ?? 1)
          }
        : buildHeldSemanticAudit(sourceIR, registeredText);
      const protectedAnchorAudit = (registeredOutcome === 'projected' || registeredOutcome === 'repaired')
        ? {
            ...(transfer.protectedAnchorAudit || buildHeldProtectedAnchorAudit(registration)),
            totalAnchors: Number(registration.registeredWitnessAudit?.totalAnchors ?? transfer.protectedAnchorAudit?.totalAnchors ?? 0),
            resolvedAnchors: Number(registration.registeredWitnessAudit?.resolvedAnchors ?? transfer.protectedAnchorAudit?.resolvedAnchors ?? 0),
            missingAnchors: [...(registration.registeredWitnessAudit?.missingAnchors || [])],
            protectedAnchorIntegrity: Number(registration.witnessAnchorIntegrity ?? 1)
          }
        : buildHeldProtectedAnchorAudit(registration);
      const lexemeSwaps = (registeredOutcome === 'projected' || registeredOutcome === 'repaired')
        ? [...(transfer.lexemeSwaps || [])]
        : [];

      const entry = Object.freeze({
        paragraphIndex,
        segmentIndex,
        sourceText: segment,
        internalText: registration.internalText,
        registeredText,
        outcome: registeredOutcome,
        notes: entryNotes,
        pathologies: [...registeredPathologies],
        witnessAnchorIntegrity: Number(registration.witnessAnchorIntegrity ?? 1),
        aliasPersistenceRisk: Number(registration.aliasPersistenceRisk || 0),
        compressionState:
          registeredText === registration.registeredText
            ? (registration.compressionState || 'one-to-one')
            : 'one-to-one',
        previewHold: Boolean(registration.previewHold),
        renderSafe: registration.renderSafe !== false,
        changedDimensions,
        lexemeSwaps,
        transferClass:
          registeredOutcome === 'source-rerouted'
            ? 'rejected'
            : registeredOutcome === 'surface-held'
              ? 'surface'
              : (transfer.transferClass || 'structural'),
        semanticAudit,
        protectedAnchorAudit,
        repairPasses: [...(registration.repairPasses || [])],
        apertureAudit: {
          ...(transfer.apertureAudit || {}),
          ...(registration.apertureAudit || {}),
          warningSignals: [...new Set([
            ...((transfer.apertureAudit && transfer.apertureAudit.warningSignals) || []),
            ...((registration.apertureAudit && registration.apertureAudit.warningSignals) || [])
          ])],
          repairPasses: [...new Set([
            ...((transfer.apertureAudit && transfer.apertureAudit.repairPasses) || []),
            ...((registration.apertureAudit && registration.apertureAudit.repairPasses) || [])
          ])]
        },
        apertureProtocol: {
          ...(transfer.apertureProtocol || {}),
          outcome: registeredOutcome,
          line: entryNotes[0] || ''
        }
      });

      entryNotes.forEach((note) => notes.add(note));
      paragraphLedger.push(entry);
      segmentLedger.push(entry);
      internalSegments.push(registration.internalText);
    });

    const paragraphText = normalizeText(paragraphLedger.map((entry) => entry.registeredText).join(' '));
    registeredSegments.push(Object.freeze({
      paragraphIndex,
      text: paragraphText,
      segments: Object.freeze(paragraphLedger.map((entry) => Object.freeze({
        segmentIndex: entry.segmentIndex,
        text: entry.registeredText,
        outcome: entry.outcome
      })))
    }));
    internalParagraphs.push(normalizeText(internalSegments.join(' ')));
  });

  let registration = {
    maskedText: registeredSegments.map((paragraph) => paragraph.text).filter(Boolean).join('\n\n'),
    internalMaskedText: internalParagraphs.filter(Boolean).join('\n\n'),
    registeredSegments: Object.freeze(registeredSegments),
    segmentLedger: Object.freeze(segmentLedger),
    notes: [...notes]
  };

  const counts = segmentOutcomeCounts(registration.segmentLedger || []);
  if (isCounterRecognitionSurface(sourceText)) {
    registration = {
      ...registration,
      notes: [
        ...new Set([
          ...(registration.notes || []),
          counts.sourceRerouted
            ? 'Counter-recognition pressure is present on this passage. Aperture kept the warning ledger visible and only withheld catastrophic generator faults.'
            : 'Counter-recognition pressure is present on this passage. Aperture kept the counter-record visible and attached warning signals instead of suppressing it.'
        ])
      ]
    };
  }

  return registration;
}

function evaluateMaskProjection(engine, sourceText = '', outputText = '', transfer = {}, options = {}) {
  const normalizedSource = normalizeText(sourceText);
  const normalizedOutput = normalizeText(outputText);
  const sourceProfile = engine.extractCadenceProfile(normalizedSource);
  const outputProfile = engine.extractCadenceProfile(normalizedOutput);
  const changedDimensions = deriveRealizedMaskDimensions(sourceProfile, outputProfile);
  const drift = lexicalDriftSummary(normalizedSource, normalizedOutput);
  const visibleShift = Boolean(normalizedOutput && normalizedOutput !== normalizedSource);
  const nonTrivialShift = substantiveMaskDimensions(changedDimensions).length > 0 || Number(transfer?.lexemeSwaps?.length || 0) > 0;
  const pathologies = options.pathologies || detectTD613ApertureTextPathologies({
    sourceText: normalizedSource,
    outputText: normalizedOutput
  });
  const aperture = classifyTD613ApertureProjection({
    sourceText: normalizedSource,
    outputText: normalizedOutput,
    changedDimensions,
    lexemeSwaps: transfer?.lexemeSwaps || [],
    visibleShift,
    nonTrivialShift,
    repaired: Boolean(options.repaired),
    pathologies,
    blocked: Boolean(options.blocked)
  });

  return {
    text: normalizedOutput,
    outputProfile,
    changedDimensions,
    drift,
    visibleShift,
    nonTrivialShift,
    pathologies,
    aperture
  };
}

function scoreMaskProjection(candidate = {}) {
  const outcomeWeights = {
    projected: 4,
    repaired: 3,
    'surface-held': 1,
    'source-rerouted': 0
  };
  const substantiveMovement = substantiveMaskDimensions(candidate.changedDimensions).length;
  const pathologyPenalty = (candidate.pathologies?.flags || []).length * 0.12;
  const driftPenalty =
    Math.max(0, Number(candidate.drift?.introducedContentCount || 0) - 1) * 0.32 +
    (Number(candidate.drift?.preservedContentRatio || 1) < 0.88 ? 0.9 : 0);
  return (
    (outcomeWeights[candidate.aperture?.outcome] || 0) +
    Number(candidate.aperture?.movementConfidence || 0) +
    (substantiveMovement * 0.25) -
    pathologyPenalty -
    driftPenalty -
    (candidate.aperture?.renderSafe === false ? 10 : 0)
  );
}

function sentenceTransferIsUsable(source = '', output = '', transfer = {}) {
  const semantic = transfer.semanticAudit || {};
  const drift = lexicalDriftSummary(source, output);
  const sourceContentCount = drift.sourceContentCount;
  const outputClauseCount = semantic.outputClauseCount ?? semantic.clauseAudits?.length ?? 0;
  const sourceClauseCount = semantic.sourceClauseCount ?? 0;

  if (outputHasMaskPathology(output)) {
    return false;
  }
  if ((semantic.protectedAnchorIntegrity ?? 1) < 1) {
    return false;
  }
  if ((semantic.propositionCoverage ?? 1) < 0.95 || (semantic.actorCoverage ?? 1) < 0.9 || (semantic.actionCoverage ?? 1) < 0.9) {
    return false;
  }
  if ((semantic.objectCoverage ?? 1) < 0.85 || (semantic.polarityMismatches ?? 0) > 0 || (semantic.tenseMismatches ?? 0) > 0) {
    return false;
  }
  if (sourceContentCount <= 4 && drift.introducedContentCount > 0) {
    return false;
  }
  if (drift.preservedContentRatio < 0.72 || drift.introducedContentCount > 1) {
    return false;
  }
  if (sourceContentCount <= 6 && outputClauseCount > sourceClauseCount) {
    return false;
  }
  return true;
}

function buildStableMaskSurface(engine, sourceText = '', shell = {}) {
  const paragraphs = String(sourceText || '')
    .replace(/\r\n/g, '\n')
    .split(/\n{2,}/);
  const targetProfile = shell?.profile || {};
  let rescueCount = 0;
  let repairedCount = 0;
  let projectedCount = 0;

  const text = paragraphs
    .map((paragraph) => {
      const sentences = splitSentencesPreservePunctuation(paragraph);
      if (!sentences.length) {
        return '';
      }

      return sentences.map((sentence) => {
        const sourceProfile = engine.extractCadenceProfile(sentence);
        const transfer = engine.buildCadenceTransfer(sentence, shell, { retrieval: true });
        const repaired = repairTD613ApertureProjection({
          sourceText: sentence,
          outputText: transfer.text || sentence,
          personaId: shell?.personaId || '',
          sourceProfile,
          targetProfile
        });
        const candidate = stripLeadingMaskIntrusion(sentence, repaired.outputText || transfer.text || sentence);
        const evaluated = evaluateMaskProjection(engine, sentence, candidate, transfer, {
          repaired: repaired.repaired,
          pathologies: repaired.pathologies
        });
        if (sentenceTransferIsUsable(sentence, candidate, transfer) && evaluated.aperture.outcome !== 'source-rerouted') {
          if (repaired.repaired) {
            repairedCount += 1;
          }
          if (evaluated.aperture.outcome !== 'surface-held') {
            projectedCount += 1;
          }
          return candidate;
        }
        rescueCount += 1;
        return applySurfaceOnlyMaskSentence(sentence, sourceProfile, targetProfile, shell?.personaId || '');
      }).join(' ');
    })
    .filter(Boolean)
    .join('\n\n');

  return {
    text: normalizeText(text),
    rescueCount,
    repairedCount,
    projectedCount
  };
}

function sentenceAnchorSimilarity(source = '', output = '') {
  const sourceTokens = stripSignalPunctuation(source).split(/\s+/).filter(Boolean);
  const outputTokens = stripSignalPunctuation(output).split(/\s+/).filter(Boolean);
  if (!sourceTokens.length || !outputTokens.length) {
    return 0;
  }
  const sourceSet = new Set(sourceTokens);
  const outputSet = new Set(outputTokens);
  const overlap = sourceTokens.filter((token) => outputSet.has(token)).length;
  const union = new Set([...sourceSet, ...outputSet]).size || 1;
  const prefixBonus = sourceTokens[0] === outputTokens[0] ? 0.12 : 0;
  const suffixBonus = sourceTokens[sourceTokens.length - 1] === outputTokens[outputTokens.length - 1] ? 0.08 : 0;
  return round(Math.min(1, (overlap / union) + prefixBonus + suffixBonus), 4);
}

function sentencePreviewRows(engine, sourceText = '', maskedText = '') {
  const sourceSentences = splitPreviewSegments(sourceText);
  const maskedSentences = splitPreviewSegments(maskedText);
  const rows = [];
  let outputIndex = 0;
  let alignedCount = 0;

  for (let sourceIndex = 0; sourceIndex < sourceSentences.length; sourceIndex += 1) {
    const source = sourceSentences[sourceIndex];
    let bestIndex = -1;
    let bestScore = 0;

    for (let candidateIndex = outputIndex; candidateIndex < Math.min(maskedSentences.length, outputIndex + 3); candidateIndex += 1) {
      const score = sentenceAnchorSimilarity(source, maskedSentences[candidateIndex]);
      if (score > bestScore) {
        bestScore = score;
        bestIndex = candidateIndex;
      }
    }

    if (bestIndex !== -1 && bestScore >= 0.34) {
      while (outputIndex < bestIndex) {
        rows.push({
          effect: 'mask-only',
          source: '--',
          output: compactSwatch(maskedSentences[outputIndex], 120)
        });
        outputIndex += 1;
      }
      const masked = maskedSentences[bestIndex] || '';
      const sourceSignal = stripSignalPunctuation(source);
      const maskedSignal = stripSignalPunctuation(masked);
      rows.push({
        effect: sourceSignal === maskedSignal ? 'hold' : 'shift',
        source: compactSwatch(source, 120),
        output: compactSwatch(masked, 120)
      });
      alignedCount += 1;
      outputIndex = bestIndex + 1;
      continue;
    }

    rows.push({
      effect: 'source-only',
      source: compactSwatch(source, 120),
      output: '--'
    });
  }

  while (outputIndex < maskedSentences.length) {
    rows.push({
      effect: 'mask-only',
      source: '--',
      output: compactSwatch(maskedSentences[outputIndex], 120)
    });
    outputIndex += 1;
  }

  const shiftedRows = rows.filter((row) => row.effect !== 'hold');
  const alignmentRatio = round(
    alignedCount / Math.max(sourceSentences.length, maskedSentences.length, 1),
    4
  );

  return {
    rows: (shiftedRows.length ? shiftedRows : rows).slice(0, 4),
    alignment: {
      ratio: alignmentRatio,
      alignedCount,
      sourceCount: sourceSentences.length,
      outputCount: maskedSentences.length,
      trustworthy: alignmentRatio >= 0.5 || sourceSentences.length <= 1
    }
  };
}

function movementSummary(transfer = {}, effectSummary = {}, contactSummary = {}, contactHonesty = {}) {
  const segmentCounts = contactHonesty.segmentCounts || segmentOutcomeCounts(transfer.segmentLedger || []);
  const segmentTotal =
    (segmentCounts.projected || 0) +
    (segmentCounts.repaired || 0) +
    (segmentCounts.surfaceHeld || 0) +
    (segmentCounts.sourceRerouted || 0);
  if (segmentTotal) {
    if (contactHonesty.outcome === 'source-rerouted') {
      return `generator fault hold // ${segmentCounts.sourceRerouted || segmentTotal} segments withheld after catastrophic failure`;
    }
    if (contactHonesty.outcome === 'surface-held' && !segmentCounts.projected && !segmentCounts.repaired) {
      return `surface-held // ${segmentCounts.surfaceHeld || segmentTotal} segments published with elevated pressure`;
    }
    const lane = [];
    if (segmentCounts.projected) {
      lane.push(`${segmentCounts.projected} projected`);
    }
    if (segmentCounts.repaired) {
      lane.push(`${segmentCounts.repaired} repaired`);
    }
    if (segmentCounts.surfaceHeld) {
      lane.push(`${segmentCounts.surfaceHeld} held`);
    }
    if (segmentCounts.sourceRerouted) {
      lane.push(`${segmentCounts.sourceRerouted} catastrophic holds`);
    }
    return `registered segments // ${lane.join(' // ')}`;
  }

  const changedDimensions = Array.isArray(transfer.changedDimensions) ? transfer.changedDimensions : [];
  const lexemeSwaps = Array.isArray(transfer.lexemeSwaps) ? transfer.lexemeSwaps : [];
  const visibleDimensions = substantiveMaskDimensions(changedDimensions);
  const dimensionLine = visibleDimensions
    .slice(0, 4)
    .map((dimension) => dimension.replace(/-/g, ' '))
    .join(' // ');

  if (contactHonesty.outcome === 'source-rerouted') {
    return 'generator fault hold // public output withheld';
  }

  if (contactHonesty.outcome === 'surface-held') {
    return 'surface-held // warning-first minimal movement';
  }

  if (!changedDimensions.length && !lexemeSwaps.length) {
    return 'near-home hold';
  }

  if (!visibleDimensions.length && lexemeSwaps.length) {
    return `lexical lane // ${lexemeSwaps.slice(0, 2).map((entry) => entry.family).filter(Boolean).join(' + ') || 'word family shift'}`;
  }

  if (!visibleDimensions.length) {
    return 'punctuation edge shift';
  }

  if (contactSummary.fieldEffect === 'neither') {
    return `${dimensionLine} // home held`;
  }

  if (contactHonesty.outcome === 'repaired') {
    return dimensionLine ? `${dimensionLine} // repaired projection` : 'repaired projection // safe counter-surface';
  }

  if (effectSummary.registerShift && effectSummary.registerShift !== 'register holds') {
    return `${dimensionLine} // ${effectSummary.registerShift}`;
  }

  return dimensionLine;
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

  const honesty = result.contactHonesty || {};
  const segmentCounts = honesty.segmentCounts || segmentOutcomeCounts(result.segmentLedger || []);
  const totalSegments =
    (segmentCounts.projected || 0) +
    (segmentCounts.repaired || 0) +
    (segmentCounts.surfaceHeld || 0) +
    (segmentCounts.sourceRerouted || 0);
  const delta = result.deltaToLock || {};
  const changedProximity = Math.abs(delta.traceability || 0) >= 0.05 || Math.abs(delta.similarity || 0) >= 0.05;
  const changedSurfaceTexture = Boolean(
    normalizeText(result.maskedText) &&
    normalizeText(result.rawText) &&
    normalizeText(result.maskedText) !== normalizeText(result.rawText)
  );

  if (totalSegments) {
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
    const line = buildRegistrationLine(honesty.outcome || 'source-rerouted', segmentCounts);
    return {
      changedProximity,
      changedSurfaceTexture,
      contactClass:
        honesty.outcome === 'source-rerouted'
          ? 'source-rerouted'
          : honesty.outcome === 'surface-held' && !segmentCounts.projected && !segmentCounts.repaired
            ? 'surface-held'
            : fieldEffect === 'both'
              ? 'full-contact'
              : fieldEffect === 'proximity'
                ? 'deep-drift'
                : fieldEffect === 'surface-texture'
                  ? 'surface-drift'
                  : 'guarded-contact',
      fieldEffect,
      line: fieldEffect === 'neither' ? line : `${line} ${proximityLine}`
    };
  }

  if (honesty.outcome === 'source-rerouted') {
    return {
      changedProximity: false,
      changedSurfaceTexture: false,
      contactClass: 'source-rerouted',
      fieldEffect: 'source-rerouted',
      line: honesty.line || 'Aperture withheld the published output after a catastrophic generator fault.'
    };
  }

  if (honesty.outcome === 'surface-held') {
    return {
      changedProximity: false,
      changedSurfaceTexture: normalizeText(result.maskedText) !== normalizeText(result.rawText),
      contactClass: 'surface-held',
      fieldEffect: 'surface-held',
      line: honesty.line || 'Aperture kept the passage in a surface-held lane and surfaced pressure notes instead of suppressing it.'
    };
  }
  const effect = result.effectSummary || {};
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
            ? `${honesty.outcome === 'repaired' ? 'Aperture repaired the projection into a safe counter-surface. ' : ''}Surface texture changed while home distance held. ${textureLine}`
            : 'The mask touched the passage, but home pressure and surface texture largely held.'
  };
}

export function buildMaskTransformationResult(engine, { comparisonText = '', lock = null, persona = null } = {}) {
  const normalized = normalizeText(comparisonText);
  if (!normalized || !persona?.profile) {
    return null;
  }

  const rawProfile = engine.extractCadenceProfile(normalized);
  const shell = {
    mode: 'persona',
    label: persona.name,
    personaId: persona.id,
    mod: persona.mod ? { ...persona.mod } : null,
    profile: { ...persona.profile },
    strength: Number(persona.strength || 0.84)
  };
  const registration = buildRegisteredMaskSurface(engine, normalized, shell);
  const maskedText = normalizeText(registration.maskedText || normalized) || normalized;
  const internalMaskedText = normalizeText(registration.internalMaskedText || maskedText);
  const segmentLedger = [...(registration.segmentLedger || [])];
  const counts = segmentOutcomeCounts(segmentLedger);
  const realizedProfile = engine.extractCadenceProfile(maskedText);
  const realizedChangedDimensions = deriveRealizedMaskDimensions(rawProfile, realizedProfile);
  const realizedLexemeSwaps = segmentLedger.flatMap((entry) => entry.lexemeSwaps || []);
  const realizedPathologies = detectTD613ApertureTextPathologies({
    sourceText: normalized,
    outputText: maskedText
  });
  const realizedSemanticAudit = aggregateSemanticAudit(segmentLedger);
  const realizedProtectedAnchorAudit = aggregateProtectedAnchorAudit(segmentLedger);
  const apertureAudit = aggregateApertureAudit(segmentLedger);
  const apertureOutcome = aggregateApertureOutcome(segmentLedger);
  const movementConfidence = round(
    clamp01(
      (
        (counts.projected * 0.24) +
        (counts.repaired * 0.18) +
        (counts.surfaceHeld * 0.08) -
        (counts.sourceRerouted * 0.06)
      ) / Math.max(segmentLedger.length, 1)
    ),
    4
  );
  const transfer = {
    mode: shell.mode,
    label: shell.label,
    personaId: shell.personaId,
    transferClass:
      apertureOutcome === 'source-rerouted'
        ? 'rejected'
        : apertureOutcome === 'surface-held'
          ? 'surface'
          : 'structural',
    realizationTier: determineMaskRealizationTier(realizedChangedDimensions, realizedLexemeSwaps),
    text: maskedText,
    internalText: internalMaskedText,
    outputProfile: realizedProfile,
    changedDimensions: realizedChangedDimensions,
    lexemeSwaps: realizedLexemeSwaps,
    visibleShift: maskedText !== normalized,
    nonTrivialShift:
      substantiveMaskDimensions(realizedChangedDimensions).length > 0 ||
      Number(realizedLexemeSwaps.length || 0) > 0,
    semanticAudit: realizedSemanticAudit,
    protectedAnchorAudit: realizedProtectedAnchorAudit,
    notes: [...new Set([
      ...(registration.notes || []),
      ...(segmentLedger.filter((entry) => entry.outcome === 'source-rerouted').length
        ? [`Aperture withheld ${counts.sourceRerouted} segment${counts.sourceRerouted === 1 ? '' : 's'} only after catastrophic generator faults.`]
        : []),
      ...(segmentLedger.filter((entry) => entry.outcome === 'surface-held').length
        ? [`Aperture kept ${counts.surfaceHeld} segment${counts.surfaceHeld === 1 ? '' : 's'} in a surface-held lane and surfaced pressure notes.`]
        : [])
    ])],
    apertureProtocol: {
      outcome: apertureOutcome,
      line: buildRegistrationLine(apertureOutcome, counts),
      pathologies: [...(realizedPathologies.flags || [])],
      apertureAudit
    },
    segmentLedger,
    apertureAudit
  };
  const rawToLock = lock ? compareTextToLock(engine, normalized, lock) : null;
  const maskedToLock = lock ? compareTextToLock(engine, maskedText, lock) : null;
  const deltaToLock = rawToLock && maskedToLock
    ? {
        similarity: round((maskedToLock.meanSimilarity || 0) - (rawToLock.meanSimilarity || 0), 4),
        traceability: round((maskedToLock.meanTraceability || 0) - (rawToLock.meanTraceability || 0), 4)
      }
    : null;
  const effectSummary = effectSummaryFromProfiles(
    engine.extractCadenceProfile(normalized),
    realizedProfile,
    deltaToLock
  );
  const heldLanes = maskedToLock?.stickyLanes || [];
  const whatMoved = realizedChangedDimensions.slice(0, 5);
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

  const swatch = compactSwatch(maskedText || '');
  const preview = buildLedgerPreview(segmentLedger);
  const contactHonesty = {
    outcome: apertureOutcome,
    line: buildRegistrationLine(apertureOutcome, counts),
    movementConfidence,
    previewAlignment: preview.alignment,
    pathologyFlags: [...(realizedPathologies.flags || [])],
    renderSafe: !realizedPathologies.severe,
    overclaimRisk:
      apertureOutcome === 'projected'
        ? 'low'
        : apertureOutcome === 'repaired'
          ? 'medium'
          : 'high',
    segmentCounts: counts,
    witnessAnchorIntegrity: realizedProtectedAnchorAudit.protectedAnchorIntegrity,
    aliasPersistenceRisk: round(
      segmentLedger.reduce((maxRisk, entry) => Math.max(maxRisk, Number(entry.aliasPersistenceRisk || 0)), 0),
      4
    ),
    apertureAudit,
    warningSignals: apertureAudit.warningSignals,
    repairPasses: apertureAudit.repairPasses
  };
  const contactSummary = maskContactSummary({
    rawText: normalized,
    maskedText,
    deltaToLock,
    effectSummary,
    contactHonesty,
    segmentLedger
  });
  const whatMovedSummary = movementSummary(
    {
      ...transfer,
      changedDimensions: realizedChangedDimensions,
      segmentLedger
    },
    effectSummary,
    contactSummary,
    contactHonesty
  );

  return {
    rawText: normalized,
    maskedText,
    internalMaskedText,
    registeredMaskedText: maskedText,
    registeredSegments: registration.registeredSegments,
    segmentLedger,
    transfer,
    rawToLock,
    maskedToLock,
    deltaToLock,
    effectSummary,
    whatMoved,
    whatMovedSummary,
    whatHeld: heldLanes,
    stickinessNotes,
    swatch,
    contactSummary,
    shiftPreview: preview.rows,
    previewAlignment: preview.alignment,
    apertureOutcome,
    apertureNotes: [
      ...(transfer.notes || []),
      ...segmentLedger.flatMap((entry) => entry.notes || []),
      ...(apertureAudit.warningSignals.length
        ? [`Aperture warning ledger // ${apertureAudit.warningSignals.join(' // ')}`]
        : []),
      ...(apertureAudit.repairPasses.length
        ? [`Aperture repair passes // ${apertureAudit.repairPasses.join(' // ')}`]
        : [])
    ],
    apertureAudit,
    movementConfidence,
    contactHonesty,
    witnessAnchorIntegrity: realizedProtectedAnchorAudit.protectedAnchorIntegrity,
    aliasPersistenceRisk: contactHonesty.aliasPersistenceRisk,
    compressionState: segmentLedger.some((entry) => entry.compressionState === 'compressed')
      ? 'compressed'
      : segmentLedger.some((entry) => entry.compressionState === 'expanded')
        ? 'expanded'
        : 'one-to-one'
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
