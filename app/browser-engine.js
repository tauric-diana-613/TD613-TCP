(function () {
  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function clamp01(value) {
    return clamp(value, 0, 1);
  }

  function round3(value) {
    return Number(value.toFixed(3));
  }

  function round2(value) {
    return Number(value.toFixed(2));
  }

  function normalizeText(text = '') {
    return text
      .replace(/\u2019/g, "'")
      .replace(/\u2018/g, "'")
      .replace(/\u2014/g, '-')
      .replace(/\u2013/g, '-');
  }

  function tokenize(text) {
    return normalizeText(text).toLowerCase().match(/[a-z0-9']+/g) || [];
  }

  function sentenceSplit(text) {
    return normalizeText(text)
      .split(/(?:[.!?]+\s+|\n+)/)
      .map((sentence) => sentence.trim())
      .filter(Boolean);
  }

  function avgSentenceLength(text) {
    const sentences = sentenceSplit(text);
    if (!sentences.length) {
      return 0;
    }

    const words = sentences.reduce((count, sentence) => count + tokenize(sentence).length, 0);
    return words / sentences.length;
  }

  function punctuationDensity(text) {
    const words = tokenize(text).length;
    const marks = (normalizeText(text).match(/[,:;.!?-]/g) || []).length;
    return round3(marks / Math.max(words, 1));
  }

  function contractionDensity(text) {
    const words = tokenize(text);
    const contractions = words.filter((word) => word.includes("'")).length;
    return round3(contractions / Math.max(words.length, 1));
  }

  function lineBreakDensity(text) {
    const sentences = sentenceSplit(text).length;
    const breaks = (normalizeText(text).match(/\n/g) || []).length;
    return round3(breaks / Math.max(sentences, 1));
  }

  function repeatedBigramPressure(text) {
    const words = tokenize(text);
    if (words.length < 2) {
      return 0;
    }

    const counts = new Map();
    for (let index = 0; index < words.length - 1; index += 1) {
      const bigram = `${words[index]} ${words[index + 1]}`;
      counts.set(bigram, (counts.get(bigram) || 0) + 1);
    }

    let repeated = 0;
    for (const count of counts.values()) {
      if (count > 1) {
        repeated += count - 1;
      }
    }

    return round3(repeated / Math.max(words.length - 1, 1));
  }

  function recurrencePressure(text) {
    const punct = clamp01(punctuationDensity(text) / 0.35);
    const line = clamp01(lineBreakDensity(text) / 0.75);
    const bigram = clamp01(repeatedBigramPressure(text) / 0.18);
    return round3((punct + line + bigram) / 3);
  }

  function lexicalDispersion(text) {
    const words = tokenize(text);
    if (!words.length) {
      return 0;
    }

    const uniqueRatio = new Set(words).size / words.length;
    const counts = {};
    words.forEach((word) => {
      counts[word] = (counts[word] || 0) + 1;
    });

    let repeated = 0;
    let singletons = 0;
    Object.values(counts).forEach((count) => {
      if (count === 1) {
        singletons += 1;
      } else {
        repeated += count - 1;
      }
    });

    const predictability = 1 - repeated / Math.max(words.length, 1);
    const novelty = singletons / Math.max(Object.keys(counts).length, 1);
    return round3((0.4 * uniqueRatio) + (0.3 * predictability) + (0.3 * novelty));
  }

  function jaccard(a, b) {
    const setA = new Set(a);
    const setB = new Set(b);
    const intersection = [...setA].filter((value) => setB.has(value)).length;
    const union = new Set([...setA, ...setB]).size || 1;
    return intersection / union;
  }

  function boundedDistance(a, b, scale) {
    return clamp01(Math.abs(a - b) / scale);
  }

  function extractCadenceProfile(text = '') {
    const words = tokenize(text);
    const sentences = sentenceSplit(text);

    return {
      empty: words.length === 0,
      wordCount: words.length,
      sentenceCount: sentences.length,
      avgSentenceLength: round2(avgSentenceLength(text)),
      punctuationDensity: punctuationDensity(text),
      contractionDensity: contractionDensity(text),
      lineBreakDensity: lineBreakDensity(text),
      repeatedBigramPressure: repeatedBigramPressure(text),
      recurrencePressure: recurrencePressure(text),
      lexicalDispersion: lexicalDispersion(text)
    };
  }

  function applyCadenceMod(profile, mod = {}) {
    if (!profile) {
      return extractCadenceProfile('');
    }

    mod = mod || {};

    const sentBias = Number(((mod.sent || 0) * 1.75).toFixed(2));
    const contractionBias = Number(((mod.cont || 0) * 0.028).toFixed(3));
    const punctuationBias = Number(((mod.punc || 0) * 0.022).toFixed(3));
    const lineBreakBias = Number(((mod.sent || 0) * 0.04).toFixed(3));
    const lexicalBias = Number((((mod.sent || 0) * 0.008) - ((mod.punc || 0) * 0.004)).toFixed(3));

    const avgSentence = round2(Math.max(1, profile.avgSentenceLength + sentBias));
    const punctuation = round3(clamp01(profile.punctuationDensity + punctuationBias));
    const contraction = round3(clamp01(profile.contractionDensity + contractionBias));
    const lineBreak = round3(clamp01(profile.lineBreakDensity + lineBreakBias));
    const lexical = round3(clamp01(profile.lexicalDispersion + lexicalBias));
    const recurrence = round3(
      (
        clamp01(punctuation / 0.35) +
        clamp01(lineBreak / 0.75) +
        clamp01(profile.repeatedBigramPressure / 0.18)
      ) / 3
    );

    return {
      ...profile,
      avgSentenceLength: avgSentence,
      punctuationDensity: punctuation,
      contractionDensity: contraction,
      lineBreakDensity: lineBreak,
      recurrencePressure: recurrence,
      lexicalDispersion: lexical,
      shellBias: {
        sent: mod.sent || 0,
        cont: mod.cont || 0,
        punc: mod.punc || 0
      }
    };
  }

  function cadenceModFromProfile(profile) {
    if (!profile || profile.empty) {
      return { sent: 0, cont: 0, punc: 0 };
    }

    const sent = clamp(Math.round((profile.avgSentenceLength - 14) / 3), -3, 3);
    const cont = clamp(Math.round((profile.contractionDensity - 0.06) / 0.03), -3, 3);
    const punc = clamp(Math.round((profile.punctuationDensity - 0.11) / 0.025), -3, 3);

    return { sent, cont, punc };
  }

  function compareTexts(a, b, options = {}) {
    const wordsA = tokenize(a);
    const wordsB = tokenize(b);
    const profileA = options.profileA || extractCadenceProfile(a);
    const profileB = options.profileB || extractCadenceProfile(b);

    const lexicalOverlap = jaccard(wordsA, wordsB);
    const sentenceDistance = boundedDistance(profileA.avgSentenceLength, profileB.avgSentenceLength, 12);
    const punctDistance = boundedDistance(profileA.punctuationDensity, profileB.punctuationDensity, 0.35);
    const contractionDistance = boundedDistance(
      profileA.contractionDensity,
      profileB.contractionDensity,
      0.25
    );
    const lexicalDistance = boundedDistance(profileA.lexicalDispersion, profileB.lexicalDispersion, 0.4);
    const recurrenceDistance = clamp01(
      Math.abs(profileA.recurrencePressure - profileB.recurrencePressure)
    );

    const similarity = clamp01(
      (lexicalOverlap * 0.22) +
      ((1 - sentenceDistance) * 0.20) +
      ((1 - punctDistance) * 0.16) +
      ((1 - contractionDistance) * 0.12) +
      ((1 - lexicalDistance) * 0.14) +
      ((1 - recurrenceDistance) * 0.16)
    );

    const traceability = clamp01(
      ((1 - sentenceDistance) * 0.34) +
      ((1 - punctDistance) * 0.24) +
      ((1 - contractionDistance) * 0.18) +
      ((1 - recurrenceDistance) * 0.24)
    );

    return {
      similarity: round3(similarity),
      traceability: round3(traceability),
      recurrencePressure: round3((profileA.recurrencePressure + profileB.recurrencePressure) / 2),
      avgSentenceA: profileA.avgSentenceLength,
      avgSentenceB: profileB.avgSentenceLength,
      lexicalOverlap: round3(lexicalOverlap),
      profileA,
      profileB
    };
  }

  function solveQuadratic(a, b, c) {
    if (a === 0) {
      throw new Error('a must be non-zero');
    }

    const discriminant = b * b - (4 * a * c);
    if (discriminant < 0) {
      return {
        roots: [],
        discriminant,
        unwanted: [],
        classification: 'complex'
      };
    }

    const sqrt = Math.sqrt(discriminant);
    const roots = [(-b + sqrt) / (2 * a), (-b - sqrt) / (2 * a)].sort((x, y) => x - y);
    const unwanted = roots.filter((root) => root < 0);

    return {
      roots,
      discriminant,
      unwanted,
      classification: unwanted.length ? 'candidate-discovery-branch' : 'resolved'
    };
  }

  function fieldPotential({ routePressure = 0, mirrorLogic = 'off', containment = 'on' } = {}) {
    const pressure = clamp01(routePressure);
    const mirrorTerm = mirrorLogic === 'on' ? 0.12 : 0;
    const containmentTerm = containment === 'on' ? 0.06 : -0.02;
    return round3(clamp01((pressure * 0.72) + mirrorTerm + containmentTerm));
  }

  function waveStats({ traceability = 0, recurrencePressure = 0, fieldPotential: V = 0 } = {}) {
    const amplitude = round3(clamp01(traceability));
    const waveNumber = round3(1 + (clamp01(recurrencePressure) * 3));
    const density = round3(clamp01((amplitude ** 2) * (0.4 + (0.6 * clamp01(V)))));

    return {
      amplitude,
      k: waveNumber,
      density,
      V: round3(clamp01(V))
    };
  }

  function custodyThreshold(custodialIntegrity, custodialDrift, theta = 0.2) {
    const integrity = clamp01(custodialIntegrity);
    const drift = clamp01(custodialDrift);
    const threshold = round3(theta);
    const delta = round3(integrity - drift);

    return {
      integrity,
      drift,
      delta,
      theta: threshold,
      archive: delta >= threshold ? 'institutional' : 'witness'
    };
  }

  function computeRoutePressure(similarity, traceability, branchFlag = 0, recurrence = 0) {
    const pressure =
      (clamp01(similarity) * 0.33) +
      (clamp01(traceability) * 0.27) +
      (clamp01(recurrence) * 0.22) +
      ((branchFlag ? 1 : 0) * 0.05);

    return round3(clamp01(pressure));
  }

  function providerDecision({
    recognized,
    explained,
    routeAvailable,
    density = 0,
    recurrencePressure = 0
  }) {
    const denseSignal = clamp01(density) >= 0.28 || clamp01(recurrencePressure) >= 0.58;

    if (!recognized) {
      return 'weak-signal';
    }

    if (recognized && routeAvailable) {
      return 'passage';
    }

    if (recognized && !explained && !routeAvailable && denseSignal) {
      return 'criticality';
    }

    return 'hold-branch';
  }

  function nextBadge(current) {
    const badges = ['badge.holds', 'badge.branch', 'badge.buffer'];
    const idx = badges.indexOf(current);
    return badges[(idx + 1) % badges.length];
  }

  function badgeMeaning(badge) {
    switch (badge) {
      case 'badge.holds':
        return 'compact custody token active';
      case 'badge.branch':
        return 'awkward branch preserved';
      case 'badge.buffer':
        return 'stabilization before interpretation';
      default:
        return 'unknown badge';
    }
  }

  const HARBOR_LIBRARY = {
    'mirror.off': {
      mode_class: 'anti-reflective safe passage',
      trigger_condition: 'route pressure high / witness load rising',
      provenance_retention: 0.95,
      witness_load_effect: -0.18,
      coordination_overhead: 0.22,
      route_status_on_success: 'safe-passage achieved'
    },
    'receipt.capture': {
      mode_class: 'receipt-first stabilization',
      trigger_condition: 'recognition exceeds explanation',
      provenance_retention: 0.98,
      witness_load_effect: -0.09,
      coordination_overhead: 0.18,
      route_status_on_success: 'buffered'
    },
    'provenance.seal': {
      mode_class: 'chain-of-custody preservation',
      trigger_condition: 'handoff / reuse / protected storage',
      provenance_retention: 0.99,
      witness_load_effect: -0.05,
      coordination_overhead: 0.12,
      route_status_on_success: 'sealed'
    }
  };

  function estimateGroupSize({ routePressure = 0, traceability = 0, custodyArchive = 'institutional' }) {
    const base = 1 + Math.round((clamp01(routePressure) * 2) + clamp01(traceability));
    return Math.max(1, base + (custodyArchive === 'witness' ? 1 : 0));
  }

  function estimateSoloCostPerOperator({
    routePressure = 0,
    traceability = 0,
    custodyArchive = 'institutional'
  }) {
    const archivePenalty = custodyArchive === 'witness' ? 0.12 : 0.04;
    return round3(0.18 + (clamp01(routePressure) * 0.42) + (clamp01(traceability) * 0.22) + archivePenalty);
  }

  function chooseHarbor({
    routePressure = 0,
    badge = 'badge.holds',
    mirrorLogic = 'off',
    custodyArchive = 'institutional',
    decision = 'hold-branch'
  }) {
    const pressure = clamp01(routePressure);

    if ((custodyArchive === 'witness' || decision === 'criticality') && mirrorLogic === 'off') {
      return 'mirror.off';
    }

    if (pressure >= 0.7) {
      return mirrorLogic === 'off' ? 'mirror.off' : 'receipt.capture';
    }

    if (pressure >= 0.45) {
      return 'receipt.capture';
    }

    if (badge === 'badge.holds') {
      return 'provenance.seal';
    }

    return 'receipt.capture';
  }

  function computeReuseGain(soloCost, sharedCost) {
    return round3(Math.max(0, soloCost - sharedCost));
  }

  function estimateWitnessLoad({
    routePressure = 0,
    traceability = 0,
    harborFunction,
    custodyArchive = 'institutional'
  }) {
    const harbor = HARBOR_LIBRARY[harborFunction];
    const archivePenalty = custodyArchive === 'witness' ? 0.12 : 0.02;
    const base =
      0.14 +
      (clamp01(routePressure) * 0.32) +
      (clamp01(traceability) * 0.22) +
      archivePenalty;

    return round3(clamp(base + ((harbor && harbor.witness_load_effect) || 0), 0, 2));
  }

  function buildLedgerRow({
    eventId,
    harborFunction,
    routePressure = 0,
    traceability = 0,
    custodyArchive = 'institutional',
    decision = 'hold-branch',
    operatorId = 'demo-operator',
    sourceClass = 'public membrane'
  }) {
    const harbor = HARBOR_LIBRARY[harborFunction];
    const groupSize = estimateGroupSize({ routePressure, traceability, custodyArchive });
    const soloCostPerOperator = estimateSoloCostPerOperator({ routePressure, traceability, custodyArchive });
    const soloCost = round3(groupSize * soloCostPerOperator);
    const sharedCost = round3(
      soloCostPerOperator + (harbor.coordination_overhead * Math.log2(groupSize + 1))
    );
    const witnessLoad = estimateWitnessLoad({
      routePressure,
      traceability,
      harborFunction,
      custodyArchive
    });
    const justiceDeficit = round3(
      clamp(
        0.16 + (clamp01(routePressure) * 0.46) + (custodyArchive === 'witness' ? 0.18 : 0.04),
        0,
        2
      )
    );
  const routeStatus =
    decision === 'passage'
      ? 'safe-passage achieved'
      : decision === 'criticality'
        ? 'buffered'
        : decision === 'hold-branch'
            ? 'buffered'
            : 'observing';
    const evidentiaryClass =
      custodyArchive === 'witness' || decision === 'criticality'
        ? 'receipt-bearing'
        : harborFunction === 'provenance.seal' || decision === 'passage'
          ? 'provenance-bearing'
          : 'exploratory';

    return {
      event_id: eventId,
      timestamp: new Date().toISOString(),
      operator_id: operatorId,
      witness_channel: custodyArchive === 'witness' ? 'inside-frame' : 'mixed',
      source_class: sourceClass,
      evidentiary_class: evidentiaryClass,
      harbor_function: harborFunction,
      group_size: groupSize,
      effective_archive: custodyArchive === 'witness' ? 'A_W' : 'A_I',
      solo_cost: soloCost,
      shared_cost: sharedCost,
      reuse_gain: computeReuseGain(soloCost, sharedCost),
      provenance_retention: harbor.provenance_retention,
      witness_load: witnessLoad,
      justice_deficit: justiceDeficit,
      route_status: routeStatus,
      receipt_hash: `sha256:${eventId}`
    };
  }

  window.TCP_ENGINE = {
    HARBOR_LIBRARY,
    compareTexts,
    extractCadenceProfile,
    applyCadenceMod,
    cadenceModFromProfile,
    solveQuadratic,
    fieldPotential,
    waveStats,
    custodyThreshold,
    computeRoutePressure,
    providerDecision,
    chooseHarbor,
    buildLedgerRow,
    nextBadge,
    badgeMeaning
  };
})();
