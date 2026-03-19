function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
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

function stripTerminalPunctuation(text = '') {
  return text.replace(/[.!?]+$/g, '').trim();
}

function replaceLimited(text = '', pattern, replacer, limit = 1) {
  if (limit <= 0) {
    return text;
  }

  let count = 0;
  return text.replace(pattern, (...args) => {
    if (count >= limit) {
      return args[0];
    }

    count += 1;
    return typeof replacer === 'function' ? replacer(...args) : replacer;
  });
}

function matchCase(source = '', replacement = '') {
  if (!source) {
    return replacement;
  }

  if (source === source.toUpperCase()) {
    return replacement.toUpperCase();
  }

  if (source.charAt(0) === source.charAt(0).toUpperCase()) {
    return replacement.charAt(0).toUpperCase() + replacement.slice(1);
  }

  return replacement;
}

function escapeRegex(value = '') {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeSentenceStarts(text = '') {
  return text
    .replace(/(^|[.!?]\s+|\n+)([a-z])/g, (match, prefix, letter) => `${prefix}${letter.toUpperCase()}`)
    .replace(/\bi\b/g, 'I');
}

function indexToLetters(index = 0) {
  let value = index;
  let output = '';

  do {
    output = String.fromCharCode(97 + (value % 26)) + output;
    value = Math.floor(value / 26) - 1;
  } while (value >= 0);

  return output;
}

const PROTECTED_LITERAL_PATTERNS = [
  /\b(?:https?:\/\/|www\.)[^\s<>"']+/gi,
  /\b[\w.+-]+@[\w.-]+\.[a-z]{2,}\b/gi,
  /\B[@#][A-Za-z0-9_][A-Za-z0-9_.:-]*/g,
  /\b(?:\d{1,2}:\d{2}(?:\s?[ap]m)?|\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{2,4})\b/gi,
  /"(?:[^"\\\n]|\\.){1,160}"/g,
  /\b(?:[A-Z]{2,}(?:[-_][A-Z0-9]+)*|[A-Za-z]+[A-Z][A-Za-z0-9_-]+)\b/g,
  /\b(?=\S*\d)[A-Za-z0-9:/._-]+\b/g
];

function protectTransferLiterals(text = '') {
  const literals = [];
  let output = text;

  const registerLiteral = (match) => {
    const placeholder = `zzprotlit${indexToLetters(literals.length)}zz`;
    literals.push({
      placeholder,
      value: match
    });
    return placeholder;
  };

  for (const pattern of PROTECTED_LITERAL_PATTERNS) {
    output = output.replace(pattern, registerLiteral);
  }

  return {
    text: output,
    literals
  };
}

function restoreProtectedLiterals(text = '', literals = []) {
  let output = text;
  for (const literal of literals) {
    output = output.replace(new RegExp(escapeRegex(literal.placeholder), 'g'), literal.value);
  }
  return output;
}

function protectedLiteralIntegrity(text = '', literals = []) {
  return literals.every((literal) => {
    const matches = text.match(new RegExp(escapeRegex(literal.placeholder), 'g')) || [];
    return matches.length === 1;
  });
}

function unresolvedProtectedLiteralCount(text = '') {
  return (text.match(/zzprotlit[a-z]+zz/gi) || []).length;
}

function sentenceChunks(text = '') {
  return normalizeText(text)
    .replace(/\r\n/g, '\n')
    .split(/\n+/)
    .flatMap((line) => line.match(/[^.!?]+[.!?]?/g) || [])
    .map((chunk) => chunk.trim())
    .filter(Boolean);
}

function countPatternMatches(text = '', patterns = []) {
  const normalized = normalizeText(text);
  return patterns.reduce((sum, pattern) => sum + ((normalized.match(pattern) || []).length), 0);
}

const SPLIT_OPPORTUNITY_PATTERNS = [
  /;\s+/g,
  /\s-\s+/g,
  /,\s+(and|but|so|because|though|while|if|when|which|that)\s+/gi,
  /,\s+(because|though|while|when|if|once|since|as)\s+/gi,
  /,\s+(apparently|basically|honestly|frankly|maybe|still|though)\b/gi,
  /,\s+(i think|i guess|i mean|to be honest|at least|if anything)\b/gi,
  /,\s+(even though|even if|as if|as though|unless)\b/gi,
  /,\s+(who|which|that)\s+(is|was|were|are|do|did|can|could|would|will)\b/gi,
  /:\s+/g
];

const CONNECTOR_OPPORTUNITY_PATTERNS = [
  /\b(because|since|as|but|though|yet|so|then|when|while|once|this|that)\b/gi,
  /\b(just|simply|still|yet|maybe|perhaps|really|actually)\b/gi
];

const CONTRACTION_OPPORTUNITY_PATTERNS = [
  /\b(I was not|do not|does not|did not|will not|cannot|was not|are not|I am|I have|I will|I would|we are|we will|they are|they will|you are|you will|it is|that is)\b/gi,
  /\b(I wasn't|don't|doesn't|didn't|won't|can't|wasn't|aren't|I'm|I've|I'll|I'd|we're|we'll|they're|they'll|you're|you'll|it's|that's)\b/gi
];

const RELATION_OPPORTUNITY_PATTERNS = {
  additive: [
    /\b(and|also)\b/gi
  ],
  contrastive: [
    /\b(but|though|yet|still|however|instead)\b/gi
  ],
  causal: [
    /\b(because|since|as|so)\b/gi
  ],
  temporal: [
    /\b(when|while|once|then|after|before)\b/gi
  ],
  clarifying: [
    /\b(which is|that is|i mean|in other words|apparently|honestly|to be honest|at least|if anything)\b/gi
  ],
  resumptive: [
    /\b(honestly|apparently|frankly|basically|anyway|still)\b/gi,
    /\b(i think|i guess|i mean|to be honest|at least|if anything)\b/gi
  ]
};

const RELATION_LEAD_PATTERNS = {
  contrastive: /^(but|though|yet|still|however|instead)\b\s*/i,
  causal: /^(because|since|as|so)\b\s*/i,
  temporal: /^(when|while|once|then|after|before)\b\s*/i,
  clarifying: /^(which is|that is|i mean|in other words|apparently|honestly|to be honest|at least|if anything)\b\s*/i,
  resumptive: /^(honestly|apparently|frankly|basically|anyway|still|i think|i guess|i mean|to be honest|at least|if anything)\b\s*/i
};

const RELATION_CONNECTOR_WORDS = {
  additive: ['and'],
  contrastive: ['though', 'but', 'yet'],
  causal: ['since', 'because', 'as', 'so'],
  temporal: ['then', 'once', 'while', 'when'],
  clarifying: ['that'],
  resumptive: ['still', 'though', 'then']
};

function buildRelationOpportunityProfile(text = '') {
  return Object.fromEntries(
    Object.entries(RELATION_OPPORTUNITY_PATTERNS).map(([relation, patterns]) => [
      relation,
      countPatternMatches(text, patterns)
    ])
  );
}

function relationInventory(opportunityProfile = {}) {
  return {
    additive: opportunityProfile.additive || 0,
    contrastive: opportunityProfile.contrastive || 0,
    causal: opportunityProfile.causal || 0,
    temporal: opportunityProfile.temporal || 0,
    clarifying: opportunityProfile.clarifying || 0,
    resumptive: opportunityProfile.resumptive || 0
  };
}

function dominantRelationFromInventory(inventory = {}) {
  return Object.entries(inventory)
    .sort((left, right) => right[1] - left[1])[0]?.[0] || 'additive';
}

function countWordOccurrences(text = '', word = '') {
  if (!word) {
    return 0;
  }

  return (normalizeText(text).match(new RegExp(`\\b${escapeRegex(word)}\\b`, 'gi')) || []).length;
}

function buildOpportunityProfile(text = '') {
  const chunks = sentenceChunks(text);
  const sentenceBoundaries = Math.max(0, chunks.length - 1);
  const relationProfile = buildRelationOpportunityProfile(text);

  return {
    sentenceSplit: countPatternMatches(text, SPLIT_OPPORTUNITY_PATTERNS),
    sentenceMerge: sentenceBoundaries,
    contraction: countPatternMatches(text, CONTRACTION_OPPORTUNITY_PATTERNS),
    connector: countPatternMatches(text, CONNECTOR_OPPORTUNITY_PATTERNS),
    lineBreak: ((normalizeText(text).match(/[.!?]\s+/g) || []).length) + ((text.match(/\n+/g) || []).length),
    ...relationProfile
  };
}

function hasLimitedRewriteOpportunity(opportunityProfile = {}) {
  const total =
    (opportunityProfile.sentenceSplit || 0) +
    (opportunityProfile.sentenceMerge || 0) +
    (opportunityProfile.contraction || 0) +
    (opportunityProfile.connector || 0) +
    (opportunityProfile.lineBreak || 0);
  const directStructural =
    (opportunityProfile.sentenceSplit || 0) +
    (opportunityProfile.sentenceMerge || 0) +
    (opportunityProfile.contraction || 0) +
    (opportunityProfile.connector || 0);

  return total < 2 || directStructural < 1;
}

function additiveDominance(targetWords = {}) {
  const additivePressure = (targetWords.and || 0) + (targetWords.also || 0);
  const alternativePressure = Math.max(
    targetWords.but || 0,
    targetWords.though || 0,
    targetWords.yet || 0,
    targetWords.because || 0,
    targetWords.since || 0,
    targetWords.as || 0,
    targetWords.so || 0,
    targetWords.then || 0,
    targetWords.when || 0,
    targetWords.while || 0,
    targetWords.once || 0,
    targetWords.still || 0
  );

  return additivePressure > alternativePressure + 0.004 && additivePressure > 0.012;
}

function inferClauseRelation(first = '', second = '') {
  const firstLower = stripTerminalPunctuation(first).toLowerCase();
  const secondLower = stripTerminalPunctuation(second).toLowerCase();
  const combined = `${firstLower} ${secondLower}`;

  if (RELATION_LEAD_PATTERNS.contrastive.test(secondLower) || /\b(but|though|yet|still|however|instead)\b/.test(combined)) {
    return 'contrastive';
  }

  if (RELATION_LEAD_PATTERNS.causal.test(secondLower) || /\b(because|since|as)\b/.test(combined)) {
    return 'causal';
  }

  if (
    RELATION_LEAD_PATTERNS.temporal.test(secondLower) ||
    /\b(and then|by the time|every time|after that|before that)\b/.test(combined)
  ) {
    return 'temporal';
  }

  if (
    RELATION_LEAD_PATTERNS.clarifying.test(secondLower) ||
    /\b(which is|that is|i mean|in other words)\b/.test(combined)
  ) {
    return 'clarifying';
  }

  if (RELATION_LEAD_PATTERNS.resumptive.test(secondLower)) {
    return 'resumptive';
  }

  return 'additive';
}

function stripLeadingRelationCue(text = '', relation = 'additive') {
  const pattern = RELATION_LEAD_PATTERNS[relation];
  if (!pattern) {
    return text;
  }

  return text.replace(pattern, '').trim();
}

function decapitalizeSentenceLead(text = '') {
  if (!text || /^I\b/.test(text)) {
    return text;
  }

  return text.replace(/^([A-Z][a-z']+)/, (match) => {
    if (/^[A-Z]{2,}$/.test(match)) {
      return match;
    }

    return match.toLowerCase();
  });
}

function preferredRelationWord(targetWords = {}, relation = 'additive') {
  const words = RELATION_CONNECTOR_WORDS[relation] || RELATION_CONNECTOR_WORDS.additive;
  return [...words]
    .sort((left, right) => (targetWords[right] || 0) - (targetWords[left] || 0))[0] || words[0];
}

function joinDescriptorCandidates(relation = 'additive', targetProfile = {}, mod = {}) {
  const mix = targetProfile.punctuationMix || {};
  const targetWords = targetProfile.functionWordProfile || {};
  const strongPreferred = (mix.strong || 0) >= 0.14 && (mix.strong || 0) >= (mix.comma || 0);
  const dashPreferred = (mix.dash || 0) >= 0.14 && (mix.dash || 0) >= (mix.comma || 0);
  const candidates = [];
  const pushDescriptor = (descriptor) => {
    if (!candidates.some((candidate) => candidate.kind === descriptor.kind && candidate.value === descriptor.value)) {
      candidates.push(descriptor);
    }
  };

  if (relation === 'contrastive') {
    pushDescriptor({ kind: 'connector', value: preferredRelationWord(targetWords, 'contrastive') });
    pushDescriptor({ kind: 'connector-word', value: 'yet' });
    pushDescriptor({ kind: 'punctuation', value: strongPreferred ? '; ' : ' - ' });
  } else if (relation === 'causal') {
    pushDescriptor({ kind: 'connector', value: preferredRelationWord(targetWords, 'causal') });
    pushDescriptor({ kind: 'punctuation', value: strongPreferred || (mod.punc || 0) > 1 ? '; ' : ', ' });
  } else if (relation === 'temporal') {
    pushDescriptor({ kind: 'connector', value: preferredRelationWord(targetWords, 'temporal') });
    pushDescriptor({ kind: 'punctuation', value: dashPreferred ? ' - ' : '; ' });
  } else if (relation === 'clarifying') {
    pushDescriptor({ kind: 'punctuation', value: dashPreferred ? ' - ' : '; ' });
    pushDescriptor({ kind: 'connector-word', value: 'that is' });
  } else if (relation === 'resumptive') {
    pushDescriptor({ kind: 'connector', value: preferredRelationWord(targetWords, 'resumptive') });
    pushDescriptor({ kind: 'punctuation', value: dashPreferred ? ' - ' : '; ' });
  } else {
    if (additiveDominance(targetWords)) {
      pushDescriptor({ kind: 'connector', value: 'and' });
    }
    pushDescriptor({ kind: 'punctuation', value: strongPreferred || (mod.punc || 0) > 1 ? '; ' : dashPreferred ? ' - ' : '; ' });
    pushDescriptor({ kind: 'connector-word', value: targetWords.then > 0.008 ? 'then' : 'and' });
  }

  if (!candidates.length) {
    pushDescriptor({ kind: 'punctuation', value: '; ' });
  }

  return candidates;
}

function buildMergedSentence(first = '', second = '', descriptor = { kind: 'punctuation', value: '; ' }, relation = 'additive') {
  const left = stripTerminalPunctuation(first);
  let right = stripTerminalPunctuation(second).trim();
  right = stripLeadingRelationCue(right, relation);

  if (!right) {
    return `${left}.`;
  }

  if (descriptor.kind === 'connector') {
    right = decapitalizeSentenceLead(right);
    return `${left}, ${descriptor.value} ${right}.`;
  }

  if (descriptor.kind === 'connector-word') {
    right = decapitalizeSentenceLead(right);
    if (descriptor.value === 'that is') {
      return `${left}, that is ${right}.`;
    }
    return `${left}; ${descriptor.value} ${right}.`;
  }

  right = decapitalizeSentenceLead(right);
  return `${left}${descriptor.value}${right}.`;
}

function mergeCandidateScore(candidate = '', targetProfile = {}, relation = 'additive', sourceText = '') {
  const candidateProfile = extractCadenceProfile(candidate);
  const fit = compareTexts('', '', {
    profileA: candidateProfile,
    profileB: targetProfile
  });
  const targetWords = targetProfile.functionWordProfile || {};
  const sourceAnd = countWordOccurrences(sourceText, 'and');
  const outputAnd = countWordOccurrences(candidate, 'and');
  const addedAnd = Math.max(0, outputAnd - sourceAnd);
  let score =
    (1 - (fit.sentenceDistance || 0)) * 18 +
    (1 - (fit.functionWordDistance || 0)) * 22 +
    (1 - (fit.punctShapeDistance || 0)) * 8 +
    (1 - (fit.contractionDistance || 0)) * 6;

  if (relation !== 'additive' && addedAnd > 0 && !additiveDominance(targetWords)) {
    score -= addedAnd * 12;
  }

  return score;
}

function mergeSentencePairs(text = '', targetProfile = {}, strength = 0.76, mod = {}, transferPlan = null) {
  let chunks = sentenceChunks(text);
  if (chunks.length < 2) {
    return text;
  }

  const currentAvg = avgSentenceLength(text);
  const targetAvg = targetProfile.avgSentenceLength || currentAvg;
  const delta = targetAvg - currentAvg;
  const desiredMerges = Math.min(
    chunks.length - 1,
    Math.max(0, Math.round((delta / 3) * (0.8 + (strength * 0.45))))
  );

  if (desiredMerges <= 0) {
    return text;
  }

  const merged = [];
  let index = 0;
  let merges = 0;

  while (index < chunks.length) {
    if (merges < desiredMerges && index < chunks.length - 1) {
      const first = chunks[index];
      const second = chunks[index + 1];
      const relation = inferClauseRelation(first, second) || transferPlan?.dominantRelation || 'additive';
      const pairCandidates = joinDescriptorCandidates(relation, targetProfile, mod)
        .map((descriptor) => buildMergedSentence(first, second, descriptor, relation))
        .sort((left, right) => mergeCandidateScore(right, targetProfile, relation, `${first} ${second}`) - mergeCandidateScore(left, targetProfile, relation, `${first} ${second}`));
      merged.push(pairCandidates[0] || `${stripTerminalPunctuation(first)}; ${decapitalizeSentenceLead(stripTerminalPunctuation(second))}.`);
      index += 2;
      merges += 1;
      continue;
    }

    merged.push(chunks[index]);
    index += 1;
  }

  return merged.join(' ');
}

function applySplitRules(text = '', desiredSplits = 1) {
  if (desiredSplits <= 0) {
    return text;
  }

  let remaining = desiredSplits;
  let result = normalizeText(text);
  const applyRule = (pattern, replacer) => {
    result = result.replace(pattern, (...args) => {
      if (remaining <= 0) {
        return args[0];
      }

      remaining -= 1;
      return replacer(...args);
    });
  };

  applyRule(/;\s+/g, () => '. ');
  applyRule(/\s-\s+/g, () => '. ');
  applyRule(/,\s+(and|but|so|because|though|while|if|when|which|that)\s+/gi, (match, connector) => `. ${connector} `);
  applyRule(/\s+(and|but|so)\s+(i|we|you|they|he|she)\b/gi, (match, connector, subject) => `. ${connector} ${subject} `);
  applyRule(/,\s+(because|though|while|when|if|once|since|as)\s+/gi, (match, connector) => `. ${connector} `);
  applyRule(/,\s+(apparently|basically|honestly|frankly|maybe|still|though)\b,?\s*/gi, (match, phrase) => `. ${phrase} `);
  applyRule(/,\s+(i think|i guess|i mean|to be honest|at least|if anything)\b,?\s*/gi, (match, phrase) => `. ${phrase} `);
  applyRule(/,\s+(even though|even if|as if|as though|unless)\s+/gi, (match, phrase) => `. ${phrase} `);
  applyRule(/,\s+(who|which|that)\s+(is|was|were|are|do|did|can|could|would|will)\s+/gi, (match, pronoun, verb) => `. ${pronoun} ${verb} `);
  applyRule(/:\s+/g, () => '. ');
  applyRule(/,\s+/g, () => '. ');

  return result;
}

function splitLongSentences(text = '', targetProfile = {}, strength = 0.76) {
  const currentAvg = avgSentenceLength(text);
  const targetAvg = targetProfile.avgSentenceLength || currentAvg;
  const delta = currentAvg - targetAvg;
  const desiredSplits = Math.max(0, Math.round((delta / 3) * (0.8 + (strength * 0.45))));

  if (desiredSplits <= 0) {
    return text;
  }

  return applySplitRules(text, desiredSplits);
}

function applyClauseTexture(text = '', currentProfile = {}, targetProfile = {}, strength = 0.76, mod = {}, transferPlan = null) {
  const targetCount = desiredSentenceCount(currentProfile, targetProfile);
  const currentCount = currentProfile.sentenceCount || 0;
  const wantsShorter =
    (targetProfile.avgSentenceLength || 0) < ((currentProfile.avgSentenceLength || 0) - 0.5) ||
    targetCount > currentCount;
  const wantsLonger =
    (targetProfile.avgSentenceLength || 0) > ((currentProfile.avgSentenceLength || 0) + 0.5) ||
    targetCount < currentCount;
  let result = text;

  if (wantsShorter) {
    const plannedSplits = transferPlan?.splitCount
      ? Math.max(1, Math.round((transferPlan.splitCount || 1) * Math.max(1, strength)))
      : Math.max(1, Math.round(Math.max(1.2, strength) * 3));
    return applySplitRules(result, plannedSplits);
  }

  if (wantsLonger) {
    return mergeSentencePairs(result, targetProfile, Math.min(1, strength + 0.04), mod, transferPlan);
  }

  return result;
}

function applyPhraseTexture(text = '', currentProfile = {}, targetProfile = {}, strength = 0.76) {
  let result = text;
  const wantsShorter =
    (targetProfile.avgSentenceLength || 0) < ((currentProfile.avgSentenceLength || 0) - 0.8);
  const wantsMoreContractions =
    (targetProfile.contractionDensity || 0) > ((currentProfile.contractionDensity || 0) + 0.006);
  const targetWords = targetProfile.functionWordProfile || {};
  const currentWords = functionWordProfile(result);
  const wantsWhenShift =
    (targetWords.when || 0) > ((currentWords.when || 0) + 0.001) ||
    (targetWords.once || 0) > ((currentWords.once || 0) + 0.001);
  const wantsThenShift = (targetWords.then || 0) > ((currentWords.then || 0) + 0.001);
  const wantsThatShift = (targetWords.that || 0) > ((currentWords.that || 0) + 0.001);

  if (wantsShorter || wantsWhenShift) {
    result = replaceLimited(result, /\bbecause every time\b/gi, (match) => matchCase(match, 'when'), 2);

    if (wantsWhenShift) {
      result = replaceLimited(result, /\bevery time\b/gi, (match) => matchCase(match, 'when'), 2);
      result = replaceLimited(result, /\bby the time\b/gi, (match) => matchCase(match, 'once'), 1);
    }
  }

  if (wantsShorter || wantsThenShift) {
    result = replaceLimited(result, /\band then\b/gi, (match) => matchCase(match, 'then'), 2);
  }

  if (wantsMoreContractions || wantsShorter || wantsThatShift) {
    result = replaceLimited(result, /\bwhich is\b/gi, (match) => matchCase(match, "that's"), 2);
  }

  if (wantsMoreContractions || wantsShorter) {
    result = replaceLimited(result, /\bI was not trying to\b/gi, (match) => matchCase(match, "I wasn't trying to"), 1);
    result = replaceLimited(result, /\bI was not going to\b/gi, (match) => matchCase(match, "I wasn't going to"), 1);
  }

  return result;
}

function applyDiscourseFrameTexture(text = '', currentProfile = {}, targetProfile = {}, strength = 0.76, transferPlan = {}) {
  let result = text;
  const targetWords = targetProfile.functionWordProfile || {};
  const currentWords = functionWordProfile(result);
  const relation = transferPlan?.dominantRelation || dominantRelationFromInventory(relationInventory(transferPlan?.relationInventory || {}));
  const wantsShorter = Boolean(transferPlan?.wantsShorter);
  const wantsLonger = Boolean(transferPlan?.wantsLonger);

  if ((relation === 'clarifying' || relation === 'resumptive' || transferPlan?.shiftStanceFrames) && (targetWords.actually || 0) > ((currentWords.actually || 0) + 0.0015)) {
    result = replaceLimited(result, /\bi mean\b/gi, (match) => matchCase(match, 'actually'), 1);
  }

  if ((relation === 'contrastive' || relation === 'resumptive') && (targetWords.still || 0) > ((currentWords.still || 0) + 0.0015)) {
    result = replaceLimited(result, /\bat least\b/gi, (match) => matchCase(match, 'still'), 1);
  }

  if ((relation === 'clarifying' || wantsLonger) && (targetWords.that || 0) > ((currentWords.that || 0) + 0.0015)) {
    result = replaceLimited(result, /\bin other words\b/gi, (match) => matchCase(match, 'that is'), 1);
  }

  if (wantsShorter) {
    result = replaceLimited(result, /\bto be honest\b/gi, (match) => matchCase(match, 'honestly'), 1);
    result = replaceLimited(result, /\bi think\b/gi, (match) => matchCase(match, 'apparently'), 1);
  }

  if (wantsLonger && relation === 'resumptive') {
    result = replaceLimited(result, /\bapparently\b/gi, (match) => matchCase(match, 'honestly'), Math.max(1, Math.round(strength * 2)));
  }

  return result;
}

function applyStanceTexture(text = '', targetProfile = {}, strength = 0.76, connectorProfile = null) {
  const targetWords = connectorProfile?.functionWordProfile || targetProfile.functionWordProfile || {};
  const currentWords = functionWordProfile(text);
  let result = text;

  const replacements = [
    { from: 'maybe', to: 'perhaps', key: 'perhaps', threshold: 0.0015, limit: 2 },
    { from: 'just', to: 'simply', key: 'simply', threshold: 0.0015, limit: 2 },
    { from: 'really', to: 'actually', key: 'actually', threshold: 0.0015, limit: 2 },
    { from: 'still', to: 'yet', key: 'yet', threshold: 0.0015, limit: 1 },
    { from: 'when', to: 'while', key: 'while', threshold: 0.0015, limit: 1 },
    { from: 'when', to: 'once', key: 'once', threshold: 0.0015, limit: 1 },
    { from: 'but', to: 'though', key: 'though', threshold: 0.0015, limit: 2 },
    { from: 'but', to: 'yet', key: 'yet', threshold: 0.0015, limit: 1 },
    { from: 'because', to: 'since', key: 'since', threshold: 0.0015, limit: 2 },
    { from: 'because', to: 'as', key: 'as', threshold: 0.0015, limit: 1 },
    { from: 'this', to: 'that', key: 'that', threshold: 0.002, limit: 2 }
  ];

  for (const replacement of replacements) {
    if ((targetWords[replacement.key] || 0) <= ((currentWords[replacement.key] || 0) + replacement.threshold)) {
      continue;
    }

    const pattern = new RegExp(`\\b${escapeRegex(replacement.from)}\\b`, 'gi');
    result = replaceLimited(
      result,
      pattern,
      (match) => matchCase(match, replacement.to),
      Math.max(1, Math.round(replacement.limit * Math.max(0.9, strength)))
    );
  }

  return result;
}

function applyLineBreakTexture(text = '', targetProfile = {}, strength = 0.76) {
  const current = lineBreakDensity(text);
  const target = targetProfile.lineBreakDensity || 0;

  if (target <= current + 0.04) {
    return target < current - 0.04 ? text.replace(/\n+/g, ' ') : text;
  }

  let remaining = Math.max(1, Math.round((target - current) * 4 * Math.max(0.6, strength)));
  return text.replace(/([.!?])\s+/g, (match, terminal) => {
    if (remaining <= 0) {
      return match;
    }

    remaining -= 1;
    return `${terminal}\n`;
  });
}

function applyContractionTexture(text = '', targetProfile = {}, mod = {}) {
  const target = targetProfile.contractionDensity ?? 0;
  const current = contractionDensity(text);
  const direction = target > current + 0.006
    ? 1
    : target < current - 0.006
      ? -1
      : Math.sign(mod.cont || 0);

  if (!direction) {
    return text;
  }

  if (direction > 0) {
    return text
      .replace(/\bI was not\b/gi, "I wasn't")
      .replace(/\bdo not\b/gi, "don't")
      .replace(/\bdoes not\b/gi, "doesn't")
      .replace(/\bdid not\b/gi, "didn't")
      .replace(/\bwill not\b/gi, "won't")
      .replace(/\bcannot\b/gi, "can't")
      .replace(/\bwas not\b/gi, "wasn't")
      .replace(/\bare not\b/gi, "aren't")
      .replace(/\bI am\b/g, "I'm")
      .replace(/\bI have\b/gi, "I've")
      .replace(/\bI will\b/gi, "I'll")
      .replace(/\bI would\b/gi, "I'd")
      .replace(/\bwe are\b/gi, "we're")
      .replace(/\bwe will\b/gi, "we'll")
      .replace(/\bthey are\b/gi, "they're")
      .replace(/\bthey will\b/gi, "they'll")
      .replace(/\byou are\b/gi, "you're")
      .replace(/\byou will\b/gi, "you'll")
      .replace(/\bit is\b/gi, "it's")
      .replace(/\bthat is\b/gi, "that's");
  }

  return text
    .replace(/\bI wasn't\b/gi, 'I was not')
    .replace(/\bdon't\b/gi, 'do not')
    .replace(/\bdoesn't\b/gi, 'does not')
    .replace(/\bdidn't\b/gi, 'did not')
    .replace(/\bwon't\b/gi, 'will not')
    .replace(/\bcan't\b/gi, 'cannot')
    .replace(/\bwasn't\b/gi, 'was not')
    .replace(/\baren't\b/gi, 'are not')
    .replace(/\bI'm\b/g, 'I am')
    .replace(/\bI've\b/gi, 'I have')
    .replace(/\bI'll\b/gi, 'I will')
    .replace(/\bI'd\b/gi, 'I would')
    .replace(/\bwe're\b/gi, 'we are')
    .replace(/\bwe'll\b/gi, 'we will')
    .replace(/\bthey're\b/gi, 'they are')
    .replace(/\bthey'll\b/gi, 'they will')
    .replace(/\byou're\b/gi, 'you are')
    .replace(/\byou'll\b/gi, 'you will')
    .replace(/\bit's\b/gi, 'it is')
    .replace(/\bthat's\b/gi, 'that is');
}

function applyFunctionWordTexture(text = '', targetProfile = {}, strength = 0.76, connectorProfile = null, transferPlan = null) {
  const target = connectorProfile?.functionWordProfile || targetProfile.functionWordProfile || {};
  const current = functionWordProfile(text);
  let result = text;
  const limit = Math.max(1, Math.round(Math.max(1.2, strength) * 4));

  if ((target.but || 0) > (current.but || 0) + 0.0015) {
    result = replaceLimited(result, /\band\b/gi, (match) => matchCase(match, 'but'), limit);
  } else if (
    additiveDominance(target) &&
    (target.and || 0) > (current.and || 0) + 0.006 &&
    (transferPlan?.dominantRelation || 'additive') === 'additive'
  ) {
    result = replaceLimited(result, /\bbut\b/gi, (match) => matchCase(match, 'and'), limit);
  }

  if ((target.this || 0) > (current.this || 0) + 0.0015) {
    result = replaceLimited(result, /\bthat\b/gi, (match) => matchCase(match, 'this'), 2);
  } else if ((target.that || 0) > (current.that || 0) + 0.0015) {
    result = replaceLimited(result, /\bthis\b/gi, (match) => matchCase(match, 'that'), 2);
  }

  result = applyConnectorSynonymPack(result, { functionWordProfile: target }, strength);

  return result;
}

function applyPunctuationTexture(text = '', targetProfile = {}, mod = {}) {
  let result = text;
  const mix = targetProfile.punctuationMix || {};

  if ((mix.strong || 0) >= 0.18 || (mod.punc || 0) > 1) {
    let swaps = Math.max(1, Math.round(((mix.strong || 0) + Math.max(0, mod.punc || 0) * 0.05) * 4));
    result = result.replace(/,\s+/g, (match) => {
      if (swaps <= 0) {
        return match;
      }

      swaps -= 1;
      return '; ';
    });
  } else if ((mix.strong || 0) <= 0.08 && (mod.punc || 0) < 0) {
    result = result.replace(/;\s+/g, '. ');
  }

  if ((mix.dash || 0) >= 0.14) {
    let dashSwap = 1;
    result = result.replace(/,\s+/g, (match) => {
      if (dashSwap <= 0) {
        return match;
      }

      dashSwap -= 1;
      return ' - ';
    });
  }

  return result;
}

export function tokenize(text) {
  return normalizeText(text).toLowerCase().match(/[a-z0-9']+/g) || [];
}

export function sentenceSplit(text) {
  return normalizeText(text)
    .split(/(?:[.!?]+\s+|\n+)/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function sentenceLengths(text) {
  return sentenceSplit(text)
    .map((sentence) => tokenize(sentence).length)
    .filter((count) => count > 0);
}

export function avgSentenceLength(text) {
  const lengths = sentenceLengths(text);
  if (!lengths.length) {
    return 0;
  }

  const words = lengths.reduce((sum, count) => sum + count, 0);
  return words / lengths.length;
}

export function sentenceLengthSpread(text) {
  const lengths = sentenceLengths(text);
  if (lengths.length <= 1) {
    return 0;
  }

  const mean = lengths.reduce((sum, count) => sum + count, 0) / lengths.length;
  const variance = lengths.reduce((sum, count) => sum + ((count - mean) ** 2), 0) / lengths.length;
  return round2(Math.sqrt(variance));
}

export function punctuationDensity(text) {
  const words = tokenize(text).length;
  const marks = (normalizeText(text).match(/[,:;.!?-]/g) || []).length;
  return round3(marks / Math.max(words, 1));
}

export function contractionDensity(text) {
  const words = tokenize(text);
  const contractions = words.filter((word) => word.includes("'")).length;
  return round3(contractions / Math.max(words.length, 1));
}

export function lineBreakDensity(text) {
  const sentences = sentenceSplit(text).length;
  const breaks = (normalizeText(text).match(/\n/g) || []).length;
  return round3(breaks / Math.max(sentences, 1));
}

export function punctuationMix(text) {
  const normalized = normalizeText(text);
  const comma = (normalized.match(/,/g) || []).length;
  const strong = (normalized.match(/[;:]/g) || []).length;
  const terminal = (normalized.match(/[.!?]/g) || []).length;
  const dash = (normalized.match(/(?:\s-\s|--)/g) || []).length;
  const total = comma + strong + terminal + dash;

  if (!total) {
    return {
      comma: 0,
      strong: 0,
      terminal: 0,
      dash: 0
    };
  }

  return {
    comma: round3(comma / total),
    strong: round3(strong / total),
    terminal: round3(terminal / total),
    dash: round3(dash / total)
  };
}

export function repeatedBigramPressure(text) {
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

export function recurrencePressure(text) {
  const punct = clamp01(punctuationDensity(text) / 0.35);
  const line = clamp01(lineBreakDensity(text) / 0.75);
  const bigram = clamp01(repeatedBigramPressure(text) / 0.18);
  return round3((punct + line + bigram) / 3);
}

export function lexicalDispersion(text) {
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

export function jaccard(a, b) {
  const setA = new Set(a);
  const setB = new Set(b);
  const intersection = [...setA].filter((value) => setB.has(value)).length;
  const union = new Set([...setA, ...setB]).size || 1;
  return intersection / union;
}

function boundedDistance(a, b, scale) {
  return clamp01(Math.abs(a - b) / scale);
}

function punctuationMixDistance(a = {}, b = {}) {
  return distributionDistance(a, b, ['comma', 'strong', 'terminal', 'dash']);
}

const FUNCTION_WORDS = [
  'a', 'an', 'the', 'and', 'or', 'but', 'if', 'that', 'this', 'it',
  'to', 'of', 'in', 'on', 'for', 'with', 'as', 'is', 'are', 'was',
  'were', 'be', 'been', 'i', 'you', 'we', 'they', 'he', 'she',
  'my', 'your', 'our', 'their', 'not',
  'because', 'since', 'though', 'yet', 'so', 'then',
  'when', 'while', 'once', 'also', 'only', 'still', 'just', 'simply',
  'really', 'actually', 'maybe', 'perhaps'
];

const CONNECTOR_SYNONYM_PACKS = [
  { words: ['because', 'since', 'as'], threshold: 0.0015 },
  { words: ['but', 'though', 'yet'], threshold: 0.0015 },
  { words: ['so', 'then'], threshold: 0.0015 },
  { words: ['when', 'while', 'once'], threshold: 0.0015 },
  { words: ['this', 'that'], threshold: 0.002 },
  { words: ['just', 'simply'], threshold: 0.0015 },
  { words: ['really', 'actually'], threshold: 0.0015 },
  { words: ['maybe', 'perhaps'], threshold: 0.0015 }
];

function dominantProfileWord(profile = {}, words = []) {
  return [...words]
    .sort((a, b) => (profile[b] || 0) - (profile[a] || 0))[0] || words[0];
}

function applyConnectorSynonymPack(text = '', targetProfile = {}, strength = 0.76) {
  const target = targetProfile.functionWordProfile || {};
  let result = text;
  let current = functionWordProfile(result);

  for (const pack of CONNECTOR_SYNONYM_PACKS) {
    const threshold = pack.threshold || 0.0015;
    const targetWord = dominantProfileWord(target, pack.words);
    const targetValue = target[targetWord] || 0;

    if (targetValue <= threshold) {
      continue;
    }

    const donorWord = [...pack.words]
      .filter((word) => word !== targetWord)
      .sort((a, b) => (current[b] || 0) - (current[a] || 0))[0];
    const donorValue = donorWord ? (current[donorWord] || 0) : 0;
    const currentTargetValue = current[targetWord] || 0;

    if (!donorWord || donorValue <= 0 || currentTargetValue >= targetValue - (threshold / 2)) {
      continue;
    }

    const delta = targetValue - currentTargetValue;
    const limit = Math.max(1, Math.round(Math.max(1.4, strength * 3) * (delta > 0.015 ? 2 : 1)));
    const pattern = new RegExp(`\\b${escapeRegex(donorWord)}\\b`, 'gi');
    result = replaceLimited(result, pattern, (match) => matchCase(match, targetWord), limit);
    current = functionWordProfile(result);
  }

  return result;
}

export function functionWordProfile(text = '') {
  const words = tokenize(text);
  const total = Math.max(words.length, 1);
  const counts = Object.fromEntries(FUNCTION_WORDS.map((word) => [word, 0]));

  for (const word of words) {
    if (Object.hasOwn(counts, word)) {
      counts[word] += 1;
    }
  }

  const profile = {};
  for (const word of FUNCTION_WORDS) {
    profile[word] = round3(counts[word] / total);
  }

  return profile;
}

function functionWordDistance(a = {}, b = {}) {
  return distributionDistance(a, b, FUNCTION_WORDS);
}

const WORD_LENGTH_BUCKETS = [
  { id: '1-2', max: 2 },
  { id: '3-4', max: 4 },
  { id: '5-6', max: 6 },
  { id: '7-8', max: 8 },
  { id: '9+', max: Infinity }
];

function distributionDistance(a = {}, b = {}, keys = null) {
  const keyset = keys || [...new Set([...Object.keys(a), ...Object.keys(b)])];
  if (!keyset.length) {
    return 0;
  }

  const sumA = keyset.reduce((sum, key) => sum + (a[key] || 0), 0) || 1;
  const sumB = keyset.reduce((sum, key) => sum + (b[key] || 0), 0) || 1;

  let js = 0;
  for (const key of keyset) {
    const p = (a[key] || 0) / sumA;
    const q = (b[key] || 0) / sumB;
    const m = (p + q) / 2;

    if (p > 0) {
      js += 0.5 * p * Math.log2(p / m);
    }
    if (q > 0) {
      js += 0.5 * q * Math.log2(q / m);
    }
  }

  return round3(clamp01(Math.sqrt(js)));
}

function blendDistribution(a = {}, b = {}, blend = 0, keys = null) {
  const keyset = keys || [...new Set([...Object.keys(a), ...Object.keys(b)])];
  const output = {};

  for (const key of keyset) {
    output[key] = round3(((a[key] || 0) * (1 - blend)) + ((b[key] || 0) * blend));
  }

  return output;
}

export function wordLengthProfile(text = '') {
  const words = tokenize(text);
  const total = Math.max(words.length, 1);
  const counts = Object.fromEntries(WORD_LENGTH_BUCKETS.map((bucket) => [bucket.id, 0]));

  for (const word of words) {
    const length = word.replace(/'/g, '').length;
    const bucket = WORD_LENGTH_BUCKETS.find((candidate) => length <= candidate.max);
    counts[bucket ? bucket.id : '9+'] += 1;
  }

  const profile = {};
  for (const bucket of WORD_LENGTH_BUCKETS) {
    profile[bucket.id] = round3(counts[bucket.id] / total);
  }

  return profile;
}

function wordLengthDistance(a = {}, b = {}) {
  return distributionDistance(
    a,
    b,
    WORD_LENGTH_BUCKETS.map((bucket) => bucket.id)
  );
}

export function charTrigramProfile(text = '') {
  const normalized = normalizeText(text)
    .toLowerCase()
    .replace(/[^a-z0-9' ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (normalized.length < 3) {
    return {};
  }

  const counts = {};
  let total = 0;
  for (let index = 0; index <= normalized.length - 3; index += 1) {
    const gram = normalized.slice(index, index + 3);
    counts[gram] = (counts[gram] || 0) + 1;
    total += 1;
  }

  const profile = {};
  Object.entries(counts).forEach(([gram, count]) => {
    profile[gram] = round3(count / Math.max(total, 1));
  });

  return profile;
}

function charTrigramDistance(a = {}, b = {}) {
  return distributionDistance(a, b);
}

function normalizeAxis(value, min, max) {
  return round3(clamp01((value - min) / Math.max(max - min, 1e-9)));
}

function heatmapLengthBucket(length) {
  if (length <= 6) {
    return 0;
  }
  if (length <= 12) {
    return 1;
  }
  if (length <= 20) {
    return 2;
  }
  return 3;
}

function heatmapPunctuationBucket(count) {
  if (count <= 0) {
    return 0;
  }
  if (count === 1) {
    return 1;
  }
  if (count === 2) {
    return 2;
  }
  return 3;
}

export function extractCadenceProfile(text = '') {
  const words = tokenize(text);
  const sentences = sentenceSplit(text);

  return {
    empty: words.length === 0,
    wordCount: words.length,
    sentenceCount: sentences.length,
    avgSentenceLength: round2(avgSentenceLength(text)),
    sentenceLengthSpread: sentenceLengthSpread(text),
    punctuationDensity: punctuationDensity(text),
    punctuationMix: punctuationMix(text),
    contractionDensity: contractionDensity(text),
    lineBreakDensity: lineBreakDensity(text),
    repeatedBigramPressure: repeatedBigramPressure(text),
    recurrencePressure: recurrencePressure(text),
    lexicalDispersion: lexicalDispersion(text),
    functionWordProfile: functionWordProfile(text),
    wordLengthProfile: wordLengthProfile(text),
    charTrigramProfile: charTrigramProfile(text)
  };
}

export function applyCadenceMod(profile, mod = {}) {
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
  const spread = round2(Math.max(0, (profile.sentenceLengthSpread || 0) + Math.abs(sentBias * 0.62)));
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
    sentenceLengthSpread: spread,
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

export function applyCadenceShell(profile, shell = {}) {
  if (!profile) {
    return extractCadenceProfile('');
  }

  if (!shell || shell.mode === 'native') {
    return applyCadenceMod(profile, {});
  }

  if (!shell.profile) {
    return applyCadenceMod(profile, shell.mod || {});
  }

  const source = shell.profile;
  const strength = clamp(Number(shell.strength ?? 0.76), 0, 1);
  const softBlend = clamp(strength * 0.58, 0, 1);
  const cadenceBlend = clamp(strength * 0.78, 0, 1);
  const recurrenceBlend = clamp(strength * 0.7, 0, 1);

  const avgSentence = round2(Math.max(
    1,
    (profile.avgSentenceLength * (1 - cadenceBlend)) + (source.avgSentenceLength * cadenceBlend)
  ));
  const spread = round2(Math.max(
    0,
    ((profile.sentenceLengthSpread || 0) * (1 - cadenceBlend)) + ((source.sentenceLengthSpread || 0) * cadenceBlend)
  ));
  const punctuation = round3(clamp01(
    (profile.punctuationDensity * (1 - cadenceBlend)) + (source.punctuationDensity * cadenceBlend)
  ));
  const contraction = round3(clamp01(
    (profile.contractionDensity * (1 - cadenceBlend)) + (source.contractionDensity * cadenceBlend)
  ));
  const lineBreak = round3(clamp01(
    (profile.lineBreakDensity * (1 - recurrenceBlend)) + (source.lineBreakDensity * recurrenceBlend)
  ));
  const bigram = round3(clamp01(
    (profile.repeatedBigramPressure * (1 - recurrenceBlend)) + (source.repeatedBigramPressure * recurrenceBlend)
  ));
  const lexical = round3(clamp01(
    (profile.lexicalDispersion * (1 - softBlend)) + (source.lexicalDispersion * softBlend)
  ));
  const recurrence = round3(
    (
      clamp01(punctuation / 0.35) +
      clamp01(lineBreak / 0.75) +
      clamp01(bigram / 0.18)
    ) / 3
  );

  return {
    ...profile,
    avgSentenceLength: avgSentence,
    sentenceLengthSpread: spread,
    punctuationDensity: punctuation,
    punctuationMix: source.punctuationMix
      ? blendDistribution(profile.punctuationMix, source.punctuationMix, cadenceBlend, ['comma', 'strong', 'terminal', 'dash'])
      : profile.punctuationMix,
    contractionDensity: contraction,
    lineBreakDensity: lineBreak,
    repeatedBigramPressure: bigram,
    recurrencePressure: recurrence,
    lexicalDispersion: lexical,
    functionWordProfile: source.functionWordProfile
      ? blendDistribution(profile.functionWordProfile, source.functionWordProfile, softBlend, FUNCTION_WORDS)
      : profile.functionWordProfile,
    wordLengthProfile: source.wordLengthProfile
      ? blendDistribution(
          profile.wordLengthProfile,
          source.wordLengthProfile,
          cadenceBlend,
          WORD_LENGTH_BUCKETS.map((bucket) => bucket.id)
        )
      : profile.wordLengthProfile,
    charTrigramProfile: source.charTrigramProfile
      ? blendDistribution(profile.charTrigramProfile, source.charTrigramProfile, softBlend)
      : profile.charTrigramProfile,
    shellBias: {
      mode: shell.mode,
      strength: round3(strength)
    }
  };
}

export function cadenceModFromProfile(profile) {
  if (!profile || profile.empty) {
    return { sent: 0, cont: 0, punc: 0 };
  }

  const sent = clamp(Math.round((profile.avgSentenceLength - 14) / 3), -3, 3);
  const cont = clamp(Math.round((profile.contractionDensity - 0.06) / 0.03), -3, 3);
  const punc = clamp(Math.round((profile.punctuationDensity - 0.11) / 0.025), -3, 3);

  return { sent, cont, punc };
}

function normalizeShellMod(shell = {}) {
  if (!shell || shell.mode === 'native') {
    return { sent: 0, cont: 0, punc: 0 };
  }

  const mod = shell.mod || cadenceModFromProfile(shell.profile || extractCadenceProfile(''));

  return {
    sent: clamp(Math.round(Number(mod.sent || 0)), -3, 3),
    cont: clamp(Math.round(Number(mod.cont || 0)), -3, 3),
    punc: clamp(Math.round(Number(mod.punc || 0)), -3, 3)
  };
}

function deriveRelativeCadenceMod(baseProfile = {}, targetProfile = {}, fallbackMod = {}) {
  const sentDelta = (targetProfile.avgSentenceLength || 0) - (baseProfile.avgSentenceLength || 0);
  const contractionDelta = (targetProfile.contractionDensity || 0) - (baseProfile.contractionDensity || 0);
  const punctuationDelta = (targetProfile.punctuationDensity || 0) - (baseProfile.punctuationDensity || 0);
  const lineBreakDelta = (targetProfile.lineBreakDensity || 0) - (baseProfile.lineBreakDensity || 0);

  const sent = Math.abs(sentDelta) >= 0.5
    ? clamp(Math.round(sentDelta / 1.8), -3, 3)
    : clamp(Math.round(Number(fallbackMod.sent || 0)), -3, 3);
  const cont = Math.abs(contractionDelta) >= 0.006
    ? clamp(Math.sign(contractionDelta) * Math.max(1, Math.round(Math.abs(contractionDelta) / 0.02)), -3, 3)
    : clamp(Math.round(Number(fallbackMod.cont || 0)), -3, 3);
  const puncSignal = Math.abs(punctuationDelta) >= 0.008
    ? punctuationDelta
    : lineBreakDelta;
  const punc = Math.abs(puncSignal) >= 0.008
    ? clamp(Math.sign(puncSignal) * Math.max(1, Math.round(Math.abs(puncSignal) / 0.02)), -3, 3)
    : clamp(Math.round(Number(fallbackMod.punc || 0)), -3, 3);

  return { sent, cont, punc };
}

function buildTransferTargetProfile(baseProfile = {}, shell = {}, fallbackMod = {}, strength = 0.76) {
  if (!shell?.profile) {
    return applyCadenceMod(baseProfile, fallbackMod);
  }

  const donor = shell.profile;
  const visibleBlend = clamp(0.82 + (strength * 0.18), 0, 1);
  const recurrenceBlend = clamp(0.76 + (strength * 0.18), 0, 1);
  const lexicalBlend = clamp(0.62 + (strength * 0.16), 0, 0.96);

  return {
    ...baseProfile,
    avgSentenceLength: round2(
      (baseProfile.avgSentenceLength || 0) +
      (((donor.avgSentenceLength || baseProfile.avgSentenceLength || 0) - (baseProfile.avgSentenceLength || 0)) * visibleBlend)
    ),
    sentenceLengthSpread: round2(
      (baseProfile.sentenceLengthSpread || 0) +
      (((donor.sentenceLengthSpread || 0) - (baseProfile.sentenceLengthSpread || 0)) * visibleBlend)
    ),
    punctuationDensity: round3(clamp01(
      (baseProfile.punctuationDensity || 0) +
      (((donor.punctuationDensity || 0) - (baseProfile.punctuationDensity || 0)) * visibleBlend)
    )),
    punctuationMix: donor.punctuationMix
      ? blendDistribution(baseProfile.punctuationMix || {}, donor.punctuationMix, visibleBlend, ['comma', 'strong', 'terminal', 'dash'])
      : baseProfile.punctuationMix,
    contractionDensity: round3(clamp01(
      (baseProfile.contractionDensity || 0) +
      (((donor.contractionDensity || 0) - (baseProfile.contractionDensity || 0)) * visibleBlend)
    )),
    lineBreakDensity: round3(clamp01(
      (baseProfile.lineBreakDensity || 0) +
      (((donor.lineBreakDensity || 0) - (baseProfile.lineBreakDensity || 0)) * recurrenceBlend)
    )),
    repeatedBigramPressure: round3(clamp01(
      (baseProfile.repeatedBigramPressure || 0) +
      (((donor.repeatedBigramPressure || 0) - (baseProfile.repeatedBigramPressure || 0)) * recurrenceBlend)
    )),
    recurrencePressure: round3(clamp01(
      (baseProfile.recurrencePressure || 0) +
      (((donor.recurrencePressure || 0) - (baseProfile.recurrencePressure || 0)) * recurrenceBlend)
    )),
    lexicalDispersion: round3(clamp01(
      (baseProfile.lexicalDispersion || 0) +
      (((donor.lexicalDispersion || baseProfile.lexicalDispersion || 0) - (baseProfile.lexicalDispersion || 0)) * lexicalBlend)
    )),
    functionWordProfile: donor.functionWordProfile
      ? blendDistribution(baseProfile.functionWordProfile || {}, donor.functionWordProfile, Math.min(1, visibleBlend + 0.04), FUNCTION_WORDS)
      : baseProfile.functionWordProfile,
    wordLengthProfile: donor.wordLengthProfile
      ? blendDistribution(
          baseProfile.wordLengthProfile || {},
          donor.wordLengthProfile,
          lexicalBlend,
          WORD_LENGTH_BUCKETS.map((bucket) => bucket.id)
        )
      : baseProfile.wordLengthProfile,
    charTrigramProfile: donor.charTrigramProfile
      ? blendDistribution(baseProfile.charTrigramProfile || {}, donor.charTrigramProfile, lexicalBlend)
      : baseProfile.charTrigramProfile,
    shellBias: {
      mode: shell.mode,
      strength: round3(strength),
      targetMode: 'donor'
    }
  };
}

function desiredSentenceCount(profile = {}, targetProfile = {}) {
  const wordCount = Math.max(profile.wordCount || 0, 1);
  const targetAvg = Math.max(1, targetProfile.avgSentenceLength || profile.avgSentenceLength || 1);
  return Math.max(1, Math.round(wordCount / targetAvg));
}

function profileDeltaToTarget(profile = {}, targetProfile = {}) {
  return {
    avgSentence: Math.abs((profile.avgSentenceLength || 0) - (targetProfile.avgSentenceLength || 0)),
    spread: Math.abs((profile.sentenceLengthSpread || 0) - (targetProfile.sentenceLengthSpread || 0)),
    sentenceCount: Math.abs((profile.sentenceCount || 0) - desiredSentenceCount(profile, targetProfile)),
    contraction: Math.abs((profile.contractionDensity || 0) - (targetProfile.contractionDensity || 0)),
    lineBreak: Math.abs((profile.lineBreakDensity || 0) - (targetProfile.lineBreakDensity || 0)),
    punctuation: Math.abs((profile.punctuationDensity || 0) - (targetProfile.punctuationDensity || 0)),
    punctuationShape: punctuationMixDistance(profile.punctuationMix || {}, targetProfile.punctuationMix || {}),
    functionWord: functionWordDistance(profile.functionWordProfile || {}, targetProfile.functionWordProfile || {})
  };
}

function profileDeltaScore(gap = {}) {
  return (
    (clamp01((gap.avgSentence || 0) / 10) * 0.22) +
    (clamp01((gap.sentenceCount || 0) / 4) * 0.16) +
    (clamp01((gap.spread || 0) / 8) * 0.12) +
    (clamp01((gap.contraction || 0) / 0.16) * 0.12) +
    (clamp01((gap.lineBreak || 0) / 0.4) * 0.12) +
    (clamp01(gap.functionWord || 0) * 0.14) +
    (clamp01((gap.punctuation || 0) / 0.16) * 0.06) +
    (clamp01(gap.punctuationShape || 0) * 0.06)
  );
}

function isMaterialCadenceGap(gap = {}) {
  return (gap.avgSentence || 0) >= 0.8 ||
    (gap.sentenceCount || 0) >= 1 ||
    (gap.contraction || 0) >= 0.01 ||
    (gap.lineBreak || 0) >= 0.035 ||
    (gap.functionWord || 0) >= 0.03 ||
    (gap.punctuationShape || 0) >= 0.05;
}

function collectChangedDimensions(sourceProfile = {}, outputProfile = {}) {
  const shifted = [];
  const compare = compareTexts('', '', {
    profileA: sourceProfile,
    profileB: outputProfile
  });

  if (Math.abs((outputProfile.avgSentenceLength || 0) - (sourceProfile.avgSentenceLength || 0)) >= 0.5) {
    shifted.push('sentence-mean');
  }
  if (Math.abs((outputProfile.sentenceCount || 0) - (sourceProfile.sentenceCount || 0)) >= 1) {
    shifted.push('sentence-count');
  }
  if (Math.abs((outputProfile.sentenceLengthSpread || 0) - (sourceProfile.sentenceLengthSpread || 0)) >= 0.5) {
    shifted.push('sentence-spread');
  }
  if (Math.abs((outputProfile.contractionDensity || 0) - (sourceProfile.contractionDensity || 0)) >= 0.006) {
    shifted.push('contraction-posture');
  }
  if (Math.abs((outputProfile.lineBreakDensity || 0) - (sourceProfile.lineBreakDensity || 0)) >= 0.02) {
    shifted.push('line-break-texture');
  }
  if ((compare.functionWordDistance || 0) >= 0.015) {
    shifted.push('connector-stance');
  }
  if (
    Math.abs((outputProfile.punctuationDensity || 0) - (sourceProfile.punctuationDensity || 0)) >= 0.018 ||
    (compare.punctShapeDistance || 0) >= 0.05
  ) {
    shifted.push('punctuation-shape');
  }

  return shifted;
}

const STRUCTURAL_TRANSFER_DIMENSIONS = new Set([
  'sentence-mean',
  'sentence-count',
  'sentence-spread',
  'contraction-posture',
  'line-break-texture',
  'connector-stance'
]);

function structuralDimensions(changedDimensions = []) {
  return changedDimensions.filter((dimension) => STRUCTURAL_TRANSFER_DIMENSIONS.has(dimension));
}

function hasMaterialStructuralTransfer(changedDimensions = []) {
  const nonPunctuationDimensions = changedDimensions.filter((dimension) => dimension !== 'punctuation-shape');
  return structuralDimensions(changedDimensions).length >= 1 && nonPunctuationDimensions.length >= 2;
}

function hasDuplicateSentenceChunks(text = '') {
  const seen = new Set();

  for (const chunk of sentenceChunks(text)) {
    const normalized = chunk
      .toLowerCase()
      .replace(/[^a-z0-9'\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (tokenize(normalized).length < 4) {
      continue;
    }

    if (seen.has(normalized)) {
      return true;
    }

    seen.add(normalized);
  }

  return false;
}

function hasRepeatedConnectorSequence(text = '') {
  return /(^|[;:.!?]\s+|\s)(and|but|though|yet|since|because|so|then|when|while|as)\s+\2\b/i.test(text);
}

function buildTransferPlan({
  sourceProfile = {},
  targetProfile = {},
  targetGap = {},
  opportunityProfile = {},
  effectiveMod = {},
  strength = 0.76
}) {
  const relationProfile = relationInventory(opportunityProfile);
  const wantsShorter =
    (targetProfile.avgSentenceLength || 0) < ((sourceProfile.avgSentenceLength || 0) - 0.4) ||
    (targetGap.sentenceCount || 0) >= 1 && (targetProfile.avgSentenceLength || 0) <= (sourceProfile.avgSentenceLength || 0);
  const wantsLonger =
    (targetProfile.avgSentenceLength || 0) > ((sourceProfile.avgSentenceLength || 0) + 0.4) ||
    ((sourceProfile.sentenceCount || 0) - desiredSentenceCount(sourceProfile, targetProfile)) >= 1;
  const splitCount = wantsShorter
    ? Math.max(1, Math.round(((targetGap.avgSentence || 0) + (targetGap.sentenceCount || 0)) * (0.7 + (strength * 0.4))))
    : 0;
  const mergeCount = wantsLonger
    ? Math.max(1, Math.round(((targetGap.avgSentence || 0) + (targetGap.sentenceCount || 0)) * (0.45 + (strength * 0.32))))
    : 0;

  return {
    wantsShorter,
    wantsLonger,
    splitCount,
    mergeCount,
    raiseContraction: (effectiveMod.cont || 0) > 0 || (targetGap.contraction || 0) >= 0.006,
    lowerContraction: (effectiveMod.cont || 0) < 0 || (targetProfile.contractionDensity || 0) < ((sourceProfile.contractionDensity || 0) - 0.006),
    shiftConnectors: (targetGap.functionWord || 0) >= 0.015 || (opportunityProfile.connector || 0) > 0,
    shiftStanceFrames: (relationProfile.clarifying || 0) > 0 || (relationProfile.resumptive || 0) > 0 || (relationProfile.contrastive || 0) > 0,
    raiseLineBreaks: (targetGap.lineBreak || 0) >= 0.02 && (targetProfile.lineBreakDensity || 0) > (sourceProfile.lineBreakDensity || 0),
    lowerLineBreaks: (targetGap.lineBreak || 0) >= 0.02 && (targetProfile.lineBreakDensity || 0) < (sourceProfile.lineBreakDensity || 0),
    dominantRelation: dominantRelationFromInventory(relationProfile),
    relationInventory: relationProfile,
    limitedOpportunity: hasLimitedRewriteOpportunity(opportunityProfile)
  };
}

function buildCandidateSpecs(transferPlan = {}) {
  const specs = [
    {
      name: 'mixed-structural',
      splitBias: 1,
      mergeBias: 1,
      connectorBias: 1,
      frameBias: 1,
      lineBreakBias: 1,
      punctuationBias: 1,
      allowFallback: true
    }
  ];

  if (transferPlan.splitCount > 0) {
    specs.push({
      name: 'split-heavy',
      splitBias: 1.6,
      mergeBias: 0.45,
      connectorBias: 1.15,
      frameBias: 1.15,
      lineBreakBias: 1.1,
      punctuationBias: 0.72,
      allowFallback: true
    });
  }

  if (transferPlan.mergeCount > 0) {
    specs.push({
      name: 'merge-heavy',
      splitBias: 0.4,
      mergeBias: 1.6,
      connectorBias: 1.1,
      frameBias: 1.05,
      lineBreakBias: 0.85,
      punctuationBias: 0.82,
      allowFallback: true
    });
  }

  if (transferPlan.shiftConnectors || transferPlan.shiftStanceFrames) {
    specs.push({
      name: 'connector-stance-heavy',
      splitBias: 0.8,
      mergeBias: 0.8,
      connectorBias: 1.45,
      frameBias: 1.35,
      lineBreakBias: 0.8,
      punctuationBias: 0.55,
      allowFallback: false
    });
  }

  return specs;
}

function additiveDriftState({
  sourceText = '',
  outputText = '',
  targetProfile = {},
  opportunityProfile = {}
}) {
  const targetWords = targetProfile.functionWordProfile || {};
  const sourceAnd = countWordOccurrences(sourceText, 'and');
  const outputAnd = countWordOccurrences(outputText, 'and');
  const sourceBut = countWordOccurrences(sourceText, 'but');
  const outputBut = countWordOccurrences(outputText, 'but');
  const glueJoins = (normalizeText(outputText).match(/(?:,\s+and\b|;\s+and\b|-\s+and\b)/gi) || []).length;
  const addedAnd = Math.max(0, outputAnd - sourceAnd);
  const sourceStructuredRelations =
    (opportunityProfile.contrastive || 0) +
    (opportunityProfile.causal || 0) +
    (opportunityProfile.temporal || 0) +
    (opportunityProfile.clarifying || 0);
  const additivePreferred = additiveDominance(targetWords);
  const flattenedContrast = sourceBut > outputBut && addedAnd > 0;

  if (sourceStructuredRelations > 0 && !additivePreferred && (glueJoins >= 2 || addedAnd >= 2 || flattenedContrast)) {
    return {
      failed: true,
      note: 'Structural opportunity existed but the current candidate collapsed into additive drift.'
    };
  }

  return {
    failed: false,
    note: ''
  };
}

function candidateScore({
  quality = {},
  outputText = '',
  sourceText = '',
  outputProfile = {},
  targetProfile = {},
  changedDimensions = [],
  passesApplied = []
}) {
  const fit = compareTexts('', '', {
    profileA: outputProfile,
    profileB: targetProfile
  });

  let score = quality.qualityGatePassed ? 80 : -30;
  score += structuralDimensions(changedDimensions).length * 16;
  score += quality.nonPunctuationDimensions.length * 10;
  score += hasMaterialStructuralTransfer(changedDimensions) ? 24 : 0;
  score += passesApplied.length * 1.5;
  score -= (fit.sentenceDistance || 0) * 12;
  score -= (fit.functionWordDistance || 0) * 22;
  score -= (fit.contractionDistance || 0) * 8;
  score -= (fit.punctShapeDistance || 0) * 6;
  score -= (fit.punctDistance || 0) * 4;

  if (outputText === sourceText) {
    score -= 24;
  }

  if ((quality.notes || []).some((note) => /additive drift/i.test(note))) {
    score -= 40;
  }

  return score;
}

function evaluateTransferQuality({
  sourceText = '',
  outputText = '',
  workingText = '',
  sourceProfile = {},
  targetProfile = {},
  targetGap = {},
  outputProfile = {},
  changedDimensions = [],
  protectedState = { literals: [] },
  opportunityProfile = {}
}) {
  const notes = [];
  const materialGap = isMaterialCadenceGap(targetGap);
  const limitedOpportunity = hasLimitedRewriteOpportunity(opportunityProfile);
  const nonPunctuationDimensions = changedDimensions.filter((dimension) => dimension !== 'punctuation-shape');
  const structuralDimensionsChanged = structuralDimensions(changedDimensions);

  if (!protectedLiteralIntegrity(workingText, protectedState.literals || [])) {
    notes.push('Protected literals did not survive the rewrite intact.');
  }

  if (unresolvedProtectedLiteralCount(outputText) > 0) {
    notes.push('Protected placeholders leaked into the output.');
  }

  if (hasDuplicateSentenceChunks(outputText)) {
    notes.push('Transfer introduced a duplicated sentence chunk.');
  }

  if (hasRepeatedConnectorSequence(outputText)) {
    notes.push('Transfer introduced a repeated connector sequence.');
  }

  if (outputText.length > Math.ceil(sourceText.length * 1.28)) {
    notes.push('Transfer expanded past the bounded output ratio.');
  }

  if (!outputText.trim()) {
    notes.push('Transfer collapsed into an unreadable empty result.');
  }

  if (materialGap && !limitedOpportunity && structuralDimensionsChanged.length < 1) {
    notes.push('Transfer did not land a structural cadence shift.');
  }

  if (materialGap && !limitedOpportunity && nonPunctuationDimensions.length < 2) {
    notes.push('Transfer stayed too close to punctuation-only drift.');
  }

  if (outputText === sourceText && materialGap && !limitedOpportunity) {
    notes.push('Material target gap remained unresolved.');
  }

  const additiveDrift = additiveDriftState({
    sourceText,
    outputText,
    targetProfile,
    opportunityProfile
  });

  if (additiveDrift.failed) {
    notes.push(additiveDrift.note);
  }

  return {
    qualityGatePassed: notes.length === 0,
    notes,
    materialGap,
    limitedOpportunity,
    nonPunctuationDimensions,
    structuralDimensions: structuralDimensionsChanged,
    changedDimensions
  };
}

function structuralShiftDimensions(baseProfile = {}, currentProfile = {}) {
  let shifts = 0;

  if (Math.abs((currentProfile.avgSentenceLength || 0) - (baseProfile.avgSentenceLength || 0)) >= 0.75) {
    shifts += 1;
  }

  if (Math.abs((currentProfile.sentenceCount || 0) - (baseProfile.sentenceCount || 0)) >= 1) {
    shifts += 1;
  }

  if (Math.abs((currentProfile.contractionDensity || 0) - (baseProfile.contractionDensity || 0)) >= 0.006) {
    shifts += 1;
  }

  if (Math.abs((currentProfile.lineBreakDensity || 0) - (baseProfile.lineBreakDensity || 0)) >= 0.02) {
    shifts += 1;
  }

  if (functionWordDistance(baseProfile.functionWordProfile || {}, currentProfile.functionWordProfile || {}) >= 0.015) {
    shifts += 1;
  }

  return shifts;
}

function shouldApplySentenceTexture(currentProfile = {}, targetProfile = {}, gap = {}, mod = {}) {
  if ((mod.sent || 0) !== 0) {
    return true;
  }

  return (gap.avgSentence || 0) >= 0.45 ||
    (gap.sentenceCount || 0) >= 1 ||
    (gap.spread || 0) >= 0.5;
}

function applySentenceTexture(text = '', currentProfile = {}, targetProfile = {}, strength = 0.76, mod = {}) {
  const targetCount = desiredSentenceCount(currentProfile, targetProfile);
  const currentCount = currentProfile.sentenceCount || 0;
  const targetAvg = targetProfile.avgSentenceLength || currentProfile.avgSentenceLength || 0;
  const currentAvg = currentProfile.avgSentenceLength || 0;
  const wantsLonger = targetAvg > currentAvg + 0.4 || targetCount < currentCount;
  const wantsShorter = targetAvg < currentAvg - 0.4 || targetCount > currentCount;

  if (wantsLonger) {
    return mergeSentencePairs(text, targetProfile, Math.min(1, strength + 0.08), mod);
  }

  if (wantsShorter) {
    return splitLongSentences(text, targetProfile, Math.min(1, strength + 0.08));
  }

  return text;
}

function applyBaselineTransferFloor(text = '', baseProfile = {}, targetProfile = {}, strength = 0.76, mod = {}, connectorProfile = null, transferPlan = null) {
  let result = text;
  const maxLength = Math.ceil(normalizeText(text).length * 1.28);
  const targetCount = desiredSentenceCount(baseProfile, targetProfile);
  const currentCount = baseProfile.sentenceCount || 0;
  const targetAvg = targetProfile.avgSentenceLength || baseProfile.avgSentenceLength || 0;
  const currentAvg = baseProfile.avgSentenceLength || 0;
  const wantsLonger = targetAvg > currentAvg + 0.4 || targetCount < currentCount;
  const wantsShorter = targetAvg < currentAvg - 0.4 || targetCount > currentCount;
  const contractionDirection = Number(mod.cont || 0) || Math.sign((targetProfile.contractionDensity || 0) - (baseProfile.contractionDensity || 0));

  if (wantsLonger && sentenceChunks(result).length > 1) {
    result = mergeSentencePairs(result, targetProfile, Math.min(1, strength + 0.08), {
      ...mod,
      sent: Math.max(1, Number(mod.sent || 0) || 1)
    }, transferPlan);
  } else if (wantsShorter) {
    result = splitLongSentences(result, targetProfile, Math.min(1, strength + 0.08));
  }

  result = applyContractionTexture(result, targetProfile, {
    ...mod,
    cont: contractionDirection
  });
  result = applyPhraseTexture(result, baseProfile, targetProfile, Math.min(1, strength + 0.14));
  result = applyDiscourseFrameTexture(result, baseProfile, targetProfile, Math.min(1, strength + 0.12), transferPlan);
  result = applyStanceTexture(result, targetProfile, Math.min(1, strength + 0.14), connectorProfile);
  result = applyFunctionWordTexture(result, targetProfile, Math.min(1, strength + 0.18), connectorProfile, transferPlan);

  if (Math.abs((targetProfile.lineBreakDensity || 0) - (baseProfile.lineBreakDensity || 0)) >= 0.02) {
    result = applyLineBreakTexture(result, targetProfile, Math.min(1, strength + 0.1));
  }

  if (result.length > maxLength) {
    return finalizeTransformedText(text);
  }

  return finalizeTransformedText(result);
}

function finalizeTransformedText(text = '') {
  return normalizeSentenceStarts(text)
    .replace(/([;:.!?]\s+)(and|but|though|yet|since|because|so|then|when|while)\s+\2\b/gi, '$1$2')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ ]{2,}/g, ' ')
    .trim();
}

function forceStructuralShift(text = '', baseProfile = {}, targetProfile = {}, strength = 0.76, mod = {}, connectorProfile = null, transferPlan = null) {
  let result = text;
  const maxLength = Math.ceil(normalizeText(text).length * 1.28);
  const currentProfile = extractCadenceProfile(result);
  const targetCount = desiredSentenceCount(currentProfile, targetProfile);
  const wantsLonger = (targetProfile.avgSentenceLength || currentProfile.avgSentenceLength || 0) > (currentProfile.avgSentenceLength || 0) + 0.6;
  const wantsShorter = (targetProfile.avgSentenceLength || currentProfile.avgSentenceLength || 0) < (currentProfile.avgSentenceLength || 0) - 0.6;

  if ((wantsLonger || targetCount < (currentProfile.sentenceCount || 0)) && sentenceChunks(result).length > 1) {
    result = mergeSentencePairs(result, targetProfile, Math.min(1, strength + 0.2), {
      ...mod,
      sent: Math.max(1, Number(mod.sent || 0))
    }, transferPlan);
  } else if (wantsShorter || targetCount > (currentProfile.sentenceCount || 0)) {
    result = splitLongSentences(result, targetProfile, Math.min(1, strength + 0.22));
  }

  result = applyPhraseTexture(result, baseProfile, targetProfile, Math.min(1, strength + 0.16));
  result = applyDiscourseFrameTexture(result, baseProfile, targetProfile, Math.min(1, strength + 0.14), transferPlan);
  result = applyContractionTexture(result, targetProfile, {
    ...mod,
    cont: Number(mod.cont || 0) || Math.sign((targetProfile.contractionDensity || 0) - (currentProfile.contractionDensity || 0))
  });
  result = applyFunctionWordTexture(result, targetProfile, Math.min(1, strength + 0.18), connectorProfile, transferPlan);
  result = applyLineBreakTexture(result, targetProfile, Math.min(1, strength + 0.14));

  if (Math.abs((targetProfile.punctuationDensity || 0) - (baseProfile.punctuationDensity || 0)) > 0.01) {
    result = applyPunctuationTexture(result, targetProfile, mod);
  }

  if (result.length > maxLength) {
    return finalizeTransformedText(text);
  }

  return finalizeTransformedText(result);
}

export function buildCadenceTransfer(text = '', shell = {}, options = {}) {
  const sourceText = normalizeText(text);
  const sourceProfile = extractCadenceProfile(sourceText);
  const opportunityProfile = buildOpportunityProfile(sourceText);
  const mod = normalizeShellMod(shell);
  const strength = clamp(Number(options?.strength ?? shell?.strength ?? (shell?.profile ? 0.82 : 0.68)), 0, 1);
  const debug = Boolean(options?.debug);

  if (!sourceText || ((!mod.sent && !mod.cont && !mod.punc) && !shell?.profile) || shell?.mode === 'native') {
    return {
      text: sourceText,
      sourceProfile,
      targetProfile: sourceProfile,
      outputProfile: sourceProfile,
      opportunityProfile,
      changedDimensions: [],
      protectedLiteralCount: 0,
      passesApplied: [],
      transferClass: 'native',
      qualityGatePassed: true,
      notes: sourceText ? ['Native shell: no transfer applied.'] : ['No source text loaded.'],
      effectiveMod: mod
    };
  }

  const targetProfile = buildTransferTargetProfile(sourceProfile, shell, mod, strength);
  const effectiveMod = deriveRelativeCadenceMod(sourceProfile, targetProfile, mod);
  const targetGap = profileDeltaToTarget(sourceProfile, targetProfile);
  const transferPlan = buildTransferPlan({
    sourceProfile,
    targetProfile,
    targetGap,
    opportunityProfile,
    effectiveMod,
    strength
  });
  const protectedState = protectTransferLiterals(sourceText);
  const connectorProfile = shell?.profile || targetProfile;
  const maxLength = Math.ceil(sourceText.length * 1.28);
  const previewText = (candidate) => finalizeTransformedText(
    restoreProtectedLiterals(candidate, protectedState.literals)
  );
  const previewProfile = (candidate) => extractCadenceProfile(previewText(candidate));
  const candidateSpecs = buildCandidateSpecs(transferPlan);
  const runCandidate = (spec = {}) => {
    let workingText = protectedState.text;
    let passesApplied = [];
    let currentProfile = sourceProfile;
    let gap = targetGap;
    const candidateDebugPasses = debug ? [] : null;
    const candidateStrength = Math.min(
      1,
      strength +
      ((((spec.splitBias || 1) + (spec.mergeBias || 1) + (spec.connectorBias || 1)) - 3) * 0.035)
    );
    const candidateMod = {
      ...effectiveMod,
      sent: transferPlan.wantsShorter
        ? -Math.max(1, Math.round(Math.max(Math.abs(Number(effectiveMod.sent || 0)), spec.splitBias || 1)))
        : transferPlan.wantsLonger
          ? Math.max(1, Math.round(Math.max(Math.abs(Number(effectiveMod.sent || 0)), spec.mergeBias || 1)))
          : Number(effectiveMod.sent || 0),
      cont: Number(effectiveMod.cont || 0),
      punc: (spec.punctuationBias || 1) < 0.7
        ? clamp(Number(effectiveMod.punc || 0), -1, 1)
        : Number(effectiveMod.punc || 0)
    };
    const runPass = (name, fn) => {
      const nextValue = fn(workingText);
      if (nextValue !== workingText) {
        workingText = nextValue;
        passesApplied.push(name);
        if (candidateDebugPasses) {
          candidateDebugPasses.push({
            name,
            text: previewText(workingText)
          });
        }
      }
    };

    runPass('baseline-transfer-floor', () =>
      applyBaselineTransferFloor(
        workingText,
        currentProfile,
        targetProfile,
        Math.min(1, candidateStrength + 0.08),
        candidateMod,
        connectorProfile,
        transferPlan
      )
    );
    currentProfile = previewProfile(workingText);

    if (transferPlan.wantsShorter && (spec.splitBias || 0) > 0.1) {
      runPass('planned-sentence-split', () =>
        applySplitRules(
          workingText,
          Math.max(1, Math.round((transferPlan.splitCount || 1) * (spec.splitBias || 1)))
        )
      );
      currentProfile = previewProfile(workingText);
    } else if (transferPlan.wantsLonger && (spec.mergeBias || 0) > 0.1) {
      runPass('planned-sentence-merge', () => {
        let nextValue = workingText;
        const mergeLoops = Math.max(1, Math.round((transferPlan.mergeCount || 1) * (spec.mergeBias || 1)));
        for (let index = 0; index < mergeLoops; index += 1) {
          const merged = mergeSentencePairs(
            nextValue,
            targetProfile,
            Math.min(1, candidateStrength + 0.06),
            candidateMod,
            transferPlan
          );
          if (merged === nextValue) {
            break;
          }
          nextValue = merged;
        }
        return nextValue;
      });
      currentProfile = previewProfile(workingText);
    }

    if (shouldApplySentenceTexture(currentProfile, targetProfile, targetGap, candidateMod)) {
      runPass('sentence-structure', () =>
        applySentenceTexture(
          workingText,
          currentProfile,
          targetProfile,
          Math.min(1, candidateStrength + 0.08),
          candidateMod
        )
      );
      currentProfile = previewProfile(workingText);
    }

    runPass('clause-join-split', () =>
      applyClauseTexture(
        workingText,
        currentProfile,
        targetProfile,
        Math.min(1, candidateStrength + 0.06),
        candidateMod,
        transferPlan
      )
    );
    currentProfile = previewProfile(workingText);

    if (transferPlan.shiftStanceFrames || transferPlan.shiftConnectors) {
      runPass('discourse-frame', () =>
        applyDiscourseFrameTexture(
          workingText,
          currentProfile,
          targetProfile,
          Math.min(1, candidateStrength + (0.12 * Math.max(1, spec.frameBias || 1))),
          transferPlan
        )
      );
      currentProfile = previewProfile(workingText);
    }

    runPass('connector-stance-lexicon', () => {
      let nextValue = applyPhraseTexture(
        workingText,
        currentProfile,
        targetProfile,
        Math.min(1, candidateStrength + (0.12 * Math.max(1, spec.connectorBias || 1)))
      );
      nextValue = applyStanceTexture(
        nextValue,
        targetProfile,
        Math.min(1, candidateStrength + (0.12 * Math.max(1, spec.connectorBias || 1))),
        connectorProfile
      );
      nextValue = applyFunctionWordTexture(
        nextValue,
        targetProfile,
        Math.min(1, candidateStrength + (0.16 * Math.max(1, spec.connectorBias || 1))),
        connectorProfile,
        transferPlan
      );
      return nextValue;
    });
    currentProfile = previewProfile(workingText);

    gap = profileDeltaToTarget(currentProfile, targetProfile);
    if (transferPlan.raiseContraction || transferPlan.lowerContraction || gap.contraction >= 0.006 || Math.abs(Number(candidateMod.cont || 0)) > 0) {
      runPass('contraction-auxiliary', () => applyContractionTexture(workingText, targetProfile, candidateMod));
      currentProfile = previewProfile(workingText);
      gap = profileDeltaToTarget(currentProfile, targetProfile);
    }

    if (transferPlan.raiseLineBreaks || transferPlan.lowerLineBreaks || gap.lineBreak >= 0.02) {
      runPass('line-break', () =>
        applyLineBreakTexture(
          workingText,
          targetProfile,
          Math.min(1, candidateStrength + (0.08 * Math.max(1, spec.lineBreakBias || 1)))
        )
      );
      currentProfile = previewProfile(workingText);
      gap = profileDeltaToTarget(currentProfile, targetProfile);
    }

    const currentChangedDimensions = collectChangedDimensions(sourceProfile, currentProfile);
    const hasStructuralMovement = structuralDimensions(currentChangedDimensions).length > 0;
    const reducedStructuralGap =
      (gap.avgSentence || 0) < 0.45 &&
      (gap.functionWord || 0) < 0.015 &&
      (gap.contraction || 0) < 0.006;

    if (
      (spec.punctuationBias || 1) > 0.45 &&
      (
        hasStructuralMovement ||
        reducedStructuralGap ||
        (!transferPlan.wantsShorter && !transferPlan.wantsLonger)
      ) &&
      (
        gap.punctuation >= 0.008 ||
        gap.punctuationShape >= 0.05 ||
        Math.abs(Number(candidateMod.punc || 0)) > 0
      )
    ) {
      runPass('punctuation-finish', () => {
        let nextValue = applyPunctuationTexture(workingText, targetProfile, candidateMod);
        if ((candidateMod.punc || 0) < 0) {
          nextValue = nextValue.replace(/[;:]+/g, '.').replace(/,+/g, ',');
        }
        return nextValue;
      });
    }

    const finalizedWorking = finalizeTransformedText(workingText);
    if (finalizedWorking !== workingText) {
      passesApplied.push('cleanup-restore');
      workingText = finalizedWorking;
    }

    let outputText = previewText(workingText);
    let outputProfile = extractCadenceProfile(outputText);
    let changedDimensions = collectChangedDimensions(sourceProfile, outputProfile);
    let quality = evaluateTransferQuality({
      sourceText,
      outputText,
      workingText,
      sourceProfile,
      targetProfile,
      targetGap,
      outputProfile,
      changedDimensions,
      protectedState,
      opportunityProfile
    });
    let fallbackDebug = null;

    if (
      spec.allowFallback &&
      (
        !quality.qualityGatePassed ||
        (quality.materialGap && !quality.limitedOpportunity && !hasMaterialStructuralTransfer(changedDimensions))
      )
    ) {
      const forcedWorking = forceStructuralShift(
        workingText,
        sourceProfile,
        targetProfile,
        Math.min(1, candidateStrength + 0.18),
        candidateMod,
        connectorProfile,
        transferPlan
      );

      if (forcedWorking !== workingText && forcedWorking.length <= maxLength) {
        workingText = forcedWorking;
        passesApplied.push('structural-fallback');
        outputText = previewText(workingText);
        outputProfile = extractCadenceProfile(outputText);
        changedDimensions = collectChangedDimensions(sourceProfile, outputProfile);
        quality = evaluateTransferQuality({
          sourceText,
          outputText,
          workingText,
          sourceProfile,
          targetProfile,
          targetGap,
          outputProfile,
          changedDimensions,
          protectedState,
          opportunityProfile
        });

        if (candidateDebugPasses) {
          fallbackDebug = {
            text: outputText,
            changedDimensions: [...changedDimensions],
            qualityGatePassed: quality.qualityGatePassed,
            notes: [...quality.notes]
          };
        }
      }
    }

    return {
      spec: spec.name,
      workingText,
      outputText,
      outputProfile,
      changedDimensions,
      quality,
      passesApplied: [...new Set(passesApplied)],
      score: candidateScore({
        quality,
        outputText,
        sourceText,
        outputProfile,
        targetProfile,
        changedDimensions,
        passesApplied
      }),
      debug: candidateDebugPasses
        ? {
            passes: [...candidateDebugPasses],
            fallback: fallbackDebug
          }
        : null
    };
  };

  const candidates = candidateSpecs.map((spec) => runCandidate(spec));
  const bestCandidate = [...candidates].sort((left, right) => right.score - left.score)[0];

  let finalText = bestCandidate.outputText;
  let finalProfile = bestCandidate.outputProfile;
  let qualityGatePassed = bestCandidate.quality.qualityGatePassed;
  let transferClass = 'weak';
  let changedDimensions = [...bestCandidate.changedDimensions];
  const notes = [...bestCandidate.quality.notes];

  if (bestCandidate.quality.materialGap && bestCandidate.quality.limitedOpportunity) {
    notes.push('Source offered limited structural rewrite opportunities, so the transfer stayed subtle.');
  }

  if (!bestCandidate.quality.qualityGatePassed) {
    if (isMaterialCadenceGap(targetGap)) {
      finalText = sourceText;
      finalProfile = sourceProfile;
      changedDimensions = [];
      transferClass = 'rejected';
      notes.push('Transfer fell back to the source text to preserve meaning and readability.');
    } else {
      transferClass = 'weak';
      notes.push('Source and target cadence were already close, so the transfer stayed subtle.');
    }
  } else if (!changedDimensions.length) {
    transferClass = 'weak';
    notes.push('Source and target cadence were already close, so the transfer stayed subtle.');
  } else {
    transferClass = hasMaterialStructuralTransfer(changedDimensions) ? 'structural' : 'weak';
    notes.push(`Shifted ${changedDimensions.join(', ')}.`);
  }

  if (protectedState.literals.length) {
    notes.push(`${protectedState.literals.length} protected literal${protectedState.literals.length === 1 ? '' : 's'} held fixed.`);
  }

  const result = {
    text: finalText,
    sourceProfile,
    targetProfile,
    outputProfile: finalProfile,
    opportunityProfile,
    changedDimensions,
    protectedLiteralCount: protectedState.literals.length,
    passesApplied: bestCandidate.passesApplied,
    transferClass,
    qualityGatePassed,
    notes: [...new Set(notes)],
    effectiveMod
  };

  if (debug) {
    result.debug = {
      plan: transferPlan,
      candidates: candidates.map((candidate) => ({
        spec: candidate.spec,
        score: round3(candidate.score),
        changedDimensions: [...candidate.changedDimensions],
        qualityGatePassed: candidate.quality.qualityGatePassed,
        notes: [...candidate.quality.notes],
        passesApplied: [...candidate.passesApplied]
      })),
      selected: bestCandidate.spec,
      trace: bestCandidate.debug
    };
  }

  return result;
}

export function applyCadenceToText(text = '', shell = {}) {
  return buildCadenceTransfer(text, shell).text;
}

export function compareTexts(a, b, options = {}) {
  const wordsA = tokenize(a);
  const wordsB = tokenize(b);
  const profileA = options.profileA || extractCadenceProfile(a);
  const profileB = options.profileB || extractCadenceProfile(b);

  const lexicalOverlap = jaccard(wordsA, wordsB);
  const sentenceDistance = boundedDistance(profileA.avgSentenceLength, profileB.avgSentenceLength, 12);
  const punctDistance = boundedDistance(profileA.punctuationDensity, profileB.punctuationDensity, 0.35);
  const spreadDistance = boundedDistance(profileA.sentenceLengthSpread || 0, profileB.sentenceLengthSpread || 0, 14);
  const contractionDistance = boundedDistance(
    profileA.contractionDensity,
    profileB.contractionDensity,
    0.25
  );
  const lexicalDistance = boundedDistance(profileA.lexicalDispersion, profileB.lexicalDispersion, 0.4);
  const punctShapeDistance = punctuationMixDistance(profileA.punctuationMix, profileB.punctuationMix);
  const functionDistance = functionWordDistance(profileA.functionWordProfile, profileB.functionWordProfile);
  const wordLengthDistanceValue = wordLengthDistance(profileA.wordLengthProfile, profileB.wordLengthProfile);
  const charGramDistance = charTrigramDistance(profileA.charTrigramProfile, profileB.charTrigramProfile);
  const recurrenceDistance = clamp01(
    Math.abs(profileA.recurrencePressure - profileB.recurrencePressure)
  );
  const exactTextMatch = normalizeText(a).trim().length > 0 && normalizeText(a).trim() === normalizeText(b).trim();
  const exactProfileMatch =
    Math.abs((profileA.avgSentenceLength || 0) - (profileB.avgSentenceLength || 0)) < 0.001 &&
    Math.abs((profileA.sentenceLengthSpread || 0) - (profileB.sentenceLengthSpread || 0)) < 0.001 &&
    Math.abs((profileA.punctuationDensity || 0) - (profileB.punctuationDensity || 0)) < 0.001 &&
    Math.abs((profileA.contractionDensity || 0) - (profileB.contractionDensity || 0)) < 0.001 &&
    Math.abs((profileA.lineBreakDensity || 0) - (profileB.lineBreakDensity || 0)) < 0.001 &&
    Math.abs((profileA.repeatedBigramPressure || 0) - (profileB.repeatedBigramPressure || 0)) < 0.001 &&
    Math.abs((profileA.recurrencePressure || 0) - (profileB.recurrencePressure || 0)) < 0.001 &&
    functionDistance === 0 &&
    wordLengthDistanceValue === 0 &&
    charGramDistance === 0 &&
    Math.abs((profileA.lexicalDispersion || 0) - (profileB.lexicalDispersion || 0)) < 0.001 &&
    punctShapeDistance === 0;

  const similarity = exactTextMatch && exactProfileMatch
    ? 1
    : clamp01(
        (lexicalOverlap * 0.08) +
        ((1 - sentenceDistance) * 0.12) +
        ((1 - spreadDistance) * 0.08) +
        ((1 - punctDistance) * 0.08) +
        ((1 - punctShapeDistance) * 0.10) +
        ((1 - contractionDistance) * 0.08) +
        ((1 - functionDistance) * 0.16) +
        ((1 - wordLengthDistanceValue) * 0.08) +
        ((1 - charGramDistance) * 0.16) +
        ((1 - lexicalDistance) * 0.03) +
        ((1 - recurrenceDistance) * 0.03)
      );

  const traceability = exactProfileMatch
    ? 1
    : clamp01(
        ((1 - sentenceDistance) * 0.16) +
        ((1 - spreadDistance) * 0.12) +
        ((1 - punctDistance) * 0.10) +
        ((1 - punctShapeDistance) * 0.14) +
        ((1 - contractionDistance) * 0.12) +
        ((1 - functionDistance) * 0.18) +
        ((1 - wordLengthDistanceValue) * 0.08) +
        ((1 - charGramDistance) * 0.08) +
        ((1 - recurrenceDistance) * 0.02)
      );

  return {
    similarity: round3(similarity),
    traceability: round3(traceability),
    recurrencePressure: round3((profileA.recurrencePressure + profileB.recurrencePressure) / 2),
    sentenceDistance: round3(sentenceDistance),
    spreadDistance: round3(spreadDistance),
    punctDistance: round3(punctDistance),
    punctShapeDistance: round3(punctShapeDistance),
    contractionDistance: round3(contractionDistance),
    functionWordDistance: round3(functionDistance),
    wordLengthDistance: round3(wordLengthDistanceValue),
    charGramDistance: round3(charGramDistance),
    lexicalDistance: round3(lexicalDistance),
    recurrenceDistance: round3(recurrenceDistance),
    avgSentenceA: profileA.avgSentenceLength,
    avgSentenceB: profileB.avgSentenceLength,
    lexicalOverlap: round3(lexicalOverlap),
    profileA,
    profileB
  };
}

export function cadenceAxisVector(input) {
  const profile = typeof input === 'string' ? extractCadenceProfile(input) : input;

  return [
    {
      id: 'rhythm_mean',
      label: 'Rhythm mean',
      raw: round2(profile.avgSentenceLength || 0),
      normalized: normalizeAxis(profile.avgSentenceLength || 0, 4, 32)
    },
    {
      id: 'rhythm_spread',
      label: 'Rhythm spread',
      raw: round2(profile.sentenceLengthSpread || 0),
      normalized: normalizeAxis(profile.sentenceLengthSpread || 0, 0, 14)
    },
    {
      id: 'punctuation',
      label: 'Punctuation density',
      raw: round3(profile.punctuationDensity || 0),
      normalized: normalizeAxis(profile.punctuationDensity || 0, 0, 0.22)
    },
    {
      id: 'contractions',
      label: 'Contraction density',
      raw: round3(profile.contractionDensity || 0),
      normalized: normalizeAxis(profile.contractionDensity || 0, 0, 0.18)
    },
    {
      id: 'line_breaks',
      label: 'Line-break drag',
      raw: round3(profile.lineBreakDensity || 0),
      normalized: normalizeAxis(profile.lineBreakDensity || 0, 0, 0.75)
    },
    {
      id: 'recurrence',
      label: 'Recurrence pressure',
      raw: round3(profile.recurrencePressure || 0),
      normalized: normalizeAxis(profile.recurrencePressure || 0, 0, 1)
    },
    {
      id: 'lexical',
      label: 'Lexical dispersion',
      raw: round3(profile.lexicalDispersion || 0),
      normalized: normalizeAxis(profile.lexicalDispersion || 0, 0.35, 1)
    }
  ];
}

export function cadenceHeatmap(text = '') {
  const sentences = sentenceSplit(text);
  const rows = ['quiet-short', 'measured-mid', 'extended-long', 'drifting-wide'];
  const cols = ['mute', 'marked', 'charged', 'saturated'];
  const matrix = Array.from({ length: 4 }, () => Array(4).fill(0));

  if (!sentences.length) {
    return {
      rows,
      cols,
      matrix,
      trace: []
    };
  }

  const trace = sentences.map((sentence, index) => {
    const length = tokenize(sentence).length;
    const marks = (normalizeText(sentence).match(/[,:;.!?-]/g) || []).length;
    const row = heatmapLengthBucket(length);
    const col = heatmapPunctuationBucket(marks);
    matrix[row][col] += 1;

    return {
      index,
      length,
      punctuation: marks,
      row,
      col
    };
  });

  const normalizedMatrix = matrix.map((row) =>
    row.map((count) => round3(count / Math.max(sentences.length, 1)))
  );

  return {
    rows,
    cols,
    matrix: normalizedMatrix,
    trace
  };
}

export function buildCadenceSignature(text = '', profile = extractCadenceProfile(text)) {
  const axes = cadenceAxisVector(profile);
  const dominantAxes = [...axes]
    .sort((a, b) => b.normalized - a.normalized)
    .slice(0, 3)
    .map((axis) => axis.id);

  return {
    profile,
    axes,
    punctuationMix: profile.punctuationMix || punctuationMix(text),
    heatmap: cadenceHeatmap(text),
    dominantAxes
  };
}

export function transformText(text, mod = {}, options = {}) {
  const shell = options?.profile
    ? {
        mode: 'borrowed',
        profile: options.profile,
        strength: options.strength ?? 0.76,
        mod
      }
    : {
        mode: 'synthetic',
        strength: options?.strength ?? 0.76,
        mod
      };

  return buildCadenceTransfer(text, shell, options).text;
}
