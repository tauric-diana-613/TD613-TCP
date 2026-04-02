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

function harmonicMean(values = []) {
  const finite = values
    .map((value) => clamp01(Number(value) || 0))
    .filter((value) => value > 0);

  if (!finite.length) {
    return 0;
  }

  return finite.length / finite.reduce((sum, value) => sum + (1 / Math.max(value, 1e-6)), 0);
}

function arithmeticMean(values = []) {
  if (!values.length) {
    return 0;
  }

  return values.reduce((sum, value) => sum + clamp01(Number(value) || 0), 0) / values.length;
}

function transferLengthCeiling(sourceText = '', sourceProfile = {}, targetProfile = {}, strength = 0.76) {
  const normalized = normalizeText(sourceText);
  const sourceAvg = sourceProfile.avgSentenceLength || avgSentenceLength(normalized) || 0;
  const targetAvg = targetProfile.avgSentenceLength || sourceAvg;
  const sentenceStretch = Math.max(0, targetAvg - sourceAvg);
  const abstractionStretch = Math.max(0, (targetProfile.abstractionPosture || 0) - (sourceProfile.abstractionPosture || 0));
  const modifierStretch = Math.max(0, (targetProfile.modifierDensity || 0) - (sourceProfile.modifierDensity || 0));
  const sourceWords = sourceProfile.wordCount || wordCount(normalized);
  let ratio = 1.28;

  ratio += Math.min(0.5, sentenceStretch / 18);
  ratio += Math.min(0.2, abstractionStretch * 0.25);
  ratio += Math.min(0.12, modifierStretch * 1.6);
  ratio += Math.min(0.12, strength * 0.12);

  if (sourceWords <= 12 && sentenceStretch >= 4) {
    ratio += 0.48;
  }

  return Math.ceil(normalized.length * clamp(ratio, 1.28, 2.4));
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

const SURFACE_MARKER_DEFINITIONS = [
  { key: 'pls', pattern: /\bpls\b/gi },
  { key: 'bc', pattern: /\bbc\b/gi },
  { key: 'wSlash', pattern: /\bw\/\s*/gi },
  { key: 'woSlash', pattern: /\bw\/o\b/gi },
  { key: 'thru', pattern: /\bthru\b/gi },
  { key: 'tmrw', pattern: /\btmrw\b/gi },
  { key: 'acct', pattern: /\bacct\b/gi },
  { key: 'pkg', pattern: /\bpkg\b/gi },
  { key: 'appt', pattern: /\bappt\b/gi },
  { key: 'mgmt', pattern: /\bmgmt\b/gi },
  { key: 'wk', pattern: /\bwk\b/gi },
  { key: 'msg', pattern: /\bmsg\b/gi },
  { key: 'ref', pattern: /\bref\b/gi },
  { key: 'ok', pattern: /\bok\b/gi },
  { key: 'plusList', pattern: /\s\+\s/gi }
];

const SURFACE_MARKER_KEYS = [
  ...SURFACE_MARKER_DEFINITIONS.map((entry) => entry.key),
  'lowercaseLead',
  'apostropheDrop'
];

const COMMON_FINITE_VERBS = new Set([
  'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'do', 'does', 'did', 'done',
  'have', 'has', 'had',
  'go', 'goes', 'went', 'gone',
  'get', 'gets', 'got', 'gotten',
  'keep', 'keeps', 'kept',
  'leave', 'leaves', 'left',
  'need', 'needs', 'needed',
  'want', 'wants', 'wanted',
  'check', 'checks', 'checked',
  'bring', 'brings', 'brought',
  'stay', 'stays', 'stayed',
  'start', 'starts', 'started',
  'run', 'runs', 'ran',
  'revise', 'revises', 'revised',
  'write', 'writes', 'wrote', 'written',
  'show', 'shows', 'showed', 'shown',
  'shrink', 'shrinks', 'shrank', 'shrunk',
  'confirm', 'confirms', 'confirmed',
  'sign', 'signs', 'signed',
  'wait', 'waits', 'waited',
  'paint', 'paints', 'painted',
  'chill', 'chills', 'chilled'
]);

const CONVERSATIONAL_MARKERS = new Set([
  'just', 'ok', 'okay', 'yeah', 'yep', 'honestly', 'actually', 'really',
  'literally', 'pls', 'bc', 'kinda', 'kinda', 'sorta', 'lol', 'fr', 'please'
]);

const APOSTROPHE_DROP_PATTERN = /\b(?:youre|dont|cant|wont|im|ive|ill|id|thats|wasnt|didnt|couldnt|shouldnt|wouldnt|isnt|arent|theres|heres|whats|lets|youll|theyre|weve|havent|hasnt|hadnt)\b/gi;

function baseSurfaceMarkerProfile() {
  return Object.fromEntries(SURFACE_MARKER_KEYS.map((key) => [key, 0]));
}

function buildSurfaceMarkerProfile(text = '', words = [], sentenceCount = 0) {
  const normalized = normalizeText(text);
  const wordTotal = Math.max(words.length || tokenize(text).length, 1);
  const chunkCount = Math.max(sentenceCount || sentenceChunks(text).length, 1);
  const profile = baseSurfaceMarkerProfile();

  for (const entry of SURFACE_MARKER_DEFINITIONS) {
    const matches = normalized.match(entry.pattern) || [];
    profile[entry.key] = round3(matches.length / wordTotal);
  }

  const lowercaseLeadMatches = normalized.match(/(^|[.!?]\s+|\n+)[a-z]/g) || [];
  const apostropheDropMatches = normalized.match(APOSTROPHE_DROP_PATTERN) || [];
  profile.lowercaseLead = round3(lowercaseLeadMatches.length / chunkCount);
  profile.apostropheDrop = round3(apostropheDropMatches.length / wordTotal);

  return profile;
}

function blendSurfaceMarkerProfile(a = {}, b = {}, blend = 0) {
  const output = {};
  for (const key of SURFACE_MARKER_KEYS) {
    output[key] = round3(((a[key] || 0) * (1 - blend)) + ((b[key] || 0) * blend));
  }
  return output;
}

function surfaceMarkerDistance(a = {}, b = {}) {
  return round3(arithmeticMean(
    SURFACE_MARKER_KEYS.map((key) => {
      const max = key === 'lowercaseLead'
        ? 0.35
        : key === 'apostropheDrop'
          ? 0.16
          : 0.08;
      return boundedDistance(a[key] || 0, b[key] || 0, max);
    })
  ));
}

function normalizedAbbreviationDensity(text = '', words = [], surfaceMarkerProfile = {}) {
  const wordTotal = Math.max(words.length || tokenize(text).length, 1);
  const score =
    ((surfaceMarkerProfile.pls || 0) * 1.2) +
    ((surfaceMarkerProfile.bc || 0) * 1.1) +
    ((surfaceMarkerProfile.wSlash || 0) * 1.4) +
    ((surfaceMarkerProfile.woSlash || 0) * 1.4) +
    ((surfaceMarkerProfile.thru || 0) * 1.2) +
    ((surfaceMarkerProfile.tmrw || 0) * 1.2) +
    ((surfaceMarkerProfile.acct || 0) * 1.3) +
    ((surfaceMarkerProfile.pkg || 0) * 1.3) +
    ((surfaceMarkerProfile.appt || 0) * 1.3) +
    ((surfaceMarkerProfile.mgmt || 0) * 1.3) +
    ((surfaceMarkerProfile.wk || 0) * 1.2) +
    ((surfaceMarkerProfile.msg || 0) * 1.2) +
    ((surfaceMarkerProfile.ref || 0) * 1.2) +
    ((surfaceMarkerProfile.plusList || 0) * 0.8);

  return round3(clamp01(score * Math.min(10, Math.max(3, wordTotal / 6))));
}

function normalizedOrthographicLooseness(text = '', sentences = [], words = [], surfaceMarkerProfile = {}) {
  const normalized = normalizeText(text).trim();
  const sentenceTotal = Math.max(sentences.length || sentenceSplit(text).length, 1);
  const wordTotal = Math.max(words.length || tokenize(text).length, 1);
  const allLowerBias = normalized && normalized === normalized.toLowerCase() ? 0.12 : 0;
  const score =
    ((surfaceMarkerProfile.lowercaseLead || 0) * 0.7) +
    ((surfaceMarkerProfile.apostropheDrop || 0) * 4.2) +
    ((surfaceMarkerProfile.plusList || 0) * 0.6) +
    allLowerBias +
    (((normalized.match(/\b(?:u|ur|ya)\b/gi) || []).length / wordTotal) * 0.8) +
    (((normalized.match(/(^|[.!?]\s+|\n+)i\b/g) || []).length / sentenceTotal) * 0.3);

  return round3(clamp01(score));
}

function normalizedFragmentPressure(text = '') {
  const chunks = sentenceChunks(text);
  if (!chunks.length) {
    return 0;
  }

  const fragmentCount = chunks.filter((chunk) => {
    const tokens = tokenize(chunk);
    if (!tokens.length) {
      return false;
    }
    if (DIRECTIVE_MARKERS.has(tokens[0])) {
      return false;
    }
    const hasFiniteVerb = tokens.some((token) =>
      COMMON_FINITE_VERBS.has(token) ||
      /(?:ed|ing)$/.test(token)
    );
    return tokens.length <= 6 && !hasFiniteVerb;
  }).length;

  return round3(clamp01(fragmentCount / chunks.length));
}

function normalizedConversationalPosture(text = '', words = [], surfaceMarkerProfile = {}) {
  const wordTotal = Math.max(words.length || tokenize(text).length, 1);
  const firstSecondPerson = words.filter((word) =>
    ['i', 'im', 'me', 'my', 'we', 'us', 'our', 'you', 'your', 'youre'].includes(word)
  ).length;
  const conversationalMarkers = countLexemeMatches(words, CONVERSATIONAL_MARKERS);
  const questionMarks = (text.match(/\?/g) || []).length;
  const discourseLeads = (normalizeText(text).match(/(^|[.!?]\s+|\n+)(?:ok|okay|honestly|look|listen|so|and)\b/gi) || []).length;
  const score =
    ((firstSecondPerson / wordTotal) * 1.4) +
    ((conversationalMarkers / wordTotal) * 1.8) +
    ((questionMarks / Math.max(sentenceChunks(text).length, 1)) * 0.28) +
    ((discourseLeads / Math.max(sentenceChunks(text).length, 1)) * 0.22) +
    ((surfaceMarkerProfile.ok || 0) * 1.5);

  return round3(clamp01(score));
}

function hasIntentionalLowercaseSurface(text = '') {
  const normalized = normalizeText(text).trim();
  if (!normalized) {
    return false;
  }

  const chunks = sentenceChunks(normalized);
  const lowercaseLeadMatches = normalized.match(/(^|[.!?]\s+|\n+)[a-z]/g) || [];
  const shorthandSignals = normalized.match(/\b(?:pls|bc|w\/o|w\/|acct|pkg|appt|mgmt|tmrw|thru|dont|cant|youre|im|ive|ill|id|wasnt|didnt|couldnt)\b/gi) || [];

  return (
    lowercaseLeadMatches.length >= Math.max(2, Math.ceil(chunks.length * 0.5)) ||
    shorthandSignals.length >= 2 ||
    (normalized === normalized.toLowerCase() && chunks.length >= 2)
  );
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
    output = output.replace(new RegExp(escapeRegex(literal.placeholder), 'gi'), literal.value);
  }
  return output;
}

function protectedLiteralIntegrity(text = '', literals = []) {
  return literals.every((literal) => {
    const matches = text.match(new RegExp(escapeRegex(literal.placeholder), 'gi')) || [];
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
  /,\s+(because|though|while|if|when|which|that)\s+/gi,
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
  const words = tokenize(text);
  const surfaceMarkerProfile = buildSurfaceMarkerProfile(text, words, chunks.length);
  const abbreviationOpportunity = SURFACE_MARKER_DEFINITIONS.reduce((sum, entry) => {
    if (entry.key === 'ok' || entry.key === 'plusList') {
      return sum;
    }
    return sum + Math.round((surfaceMarkerProfile[entry.key] || 0) * Math.max(words.length, 1));
  }, 0);
  const orthographyOpportunity =
    Math.round((surfaceMarkerProfile.lowercaseLead || 0) * Math.max(chunks.length, 1)) +
    Math.round((surfaceMarkerProfile.apostropheDrop || 0) * Math.max(words.length, 1));
  const fragmentOpportunity = Math.round(normalizedFragmentPressure(text) * Math.max(chunks.length, 1));
  const conversationalOpportunity = Math.round(normalizedConversationalPosture(text, words, surfaceMarkerProfile) * Math.max(chunks.length, 1));

  return {
    sentenceSplit: countPatternMatches(text, SPLIT_OPPORTUNITY_PATTERNS),
    sentenceMerge: sentenceBoundaries,
    contraction: countPatternMatches(text, CONTRACTION_OPPORTUNITY_PATTERNS),
    connector: countPatternMatches(text, CONNECTOR_OPPORTUNITY_PATTERNS),
    lineBreak: ((normalizeText(text).match(/[.!?]\s+/g) || []).length) + ((text.match(/\n+/g) || []).length),
    abbreviation: abbreviationOpportunity,
    orthography: orthographyOpportunity,
    fragment: fragmentOpportunity,
    conversational: conversationalOpportunity,
    ...relationProfile
  };
}

function hasLimitedRewriteOpportunity(opportunityProfile = {}) {
  const total =
    (opportunityProfile.sentenceSplit || 0) +
    (opportunityProfile.sentenceMerge || 0) +
    (opportunityProfile.contraction || 0) +
    (opportunityProfile.connector || 0) +
    (opportunityProfile.lineBreak || 0) +
    (opportunityProfile.abbreviation || 0) +
    (opportunityProfile.orthography || 0) +
    (opportunityProfile.fragment || 0) +
    (opportunityProfile.conversational || 0);
  const directStructural =
    (opportunityProfile.sentenceSplit || 0) +
    (opportunityProfile.sentenceMerge || 0) +
    (opportunityProfile.contraction || 0) +
    (opportunityProfile.connector || 0) +
    (opportunityProfile.abbreviation || 0) +
    (opportunityProfile.orthography || 0) +
    (opportunityProfile.fragment || 0);

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
  applyRule(/,\s+(because|though|while|if|when|which|that)\s+/gi, (match, connector) => `. ${connector} `);
  applyRule(/\s+(and|but|so)\s+(i|we|you|they|he|she)\b/gi, (match, connector, subject) => `. ${connector} ${subject} `);
  applyRule(/,\s+(because|though|while|when|if|once|since|as)\s+/gi, (match, connector) => `. ${connector} `);
  applyRule(/,\s+(apparently|basically|honestly|frankly|maybe|still|though)\b,?\s*/gi, (match, phrase) => `. ${phrase} `);
  applyRule(/,\s+(i think|i guess|i mean|to be honest|at least|if anything)\b,?\s*/gi, (match, phrase) => `. ${phrase} `);
  applyRule(/,\s+(even though|even if|as if|as though|unless)\s+/gi, (match, phrase) => `. ${phrase} `);
  applyRule(/,\s+(who|which|that)\s+(is|was|were|are|do|did|can|could|would|will)\s+/gi, (match, pronoun, verb) => `. ${pronoun} ${verb} `);
  applyRule(/:\s+/g, () => '. ');
  applyRule(/,\s+(?=(?:I|we|you|they|he|she|it|there|this|that|the|a|an)\b)/gi, () => '. ');

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
  const modDirection = Math.sign(mod.cont || 0);
  let direction = target > current + 0.006
    ? 1
    : target < current - 0.006
      ? -1
      : modDirection;

  // Never fight an explicit mod direction — the mod is the user/shell intent
  if (modDirection !== 0 && direction !== 0 && Math.sign(direction) !== Math.sign(modDirection)) {
    direction = modDirection;
  }

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
  const dominantRelation = transferPlan?.dominantRelation || 'additive';

  if (
    (target.but || 0) > (current.but || 0) + 0.0015 &&
    (dominantRelation === 'contrastive' || dominantRelation === 'resumptive')
  ) {
    result = replaceLimited(result, /\band\b/gi, (match) => matchCase(match, 'but'), 1);
  } else if (
    additiveDominance(target) &&
    (target.and || 0) > (current.and || 0) + 0.006 &&
    dominantRelation === 'additive'
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
  { words: ['when', 'while'], threshold: 0.0015 },
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

const AUXILIARY_WORDS = new Set([
  'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'do', 'does', 'did', 'done',
  'have', 'has', 'had',
  'will', 'would', 'can', 'could', 'may', 'might', 'must',
  'shall', 'should', 'ought'
]);

const ABSTRACT_LEXEMES = new Set([
  'story', 'account', 'narrative', 'speech', 'remark', 'remarks', 'reason', 'reasons',
  'memory', 'pressure', 'signal', 'route', 'custody', 'recognition', 'decision',
  'meaning', 'silence', 'passage', 'criticality', 'archive', 'detail', 'details',
  'particular', 'particulars', 'narration', 'posture', 'branch', 'receipt', 'threshold',
  'decision', 'context', 'message', 'speech', 'conversation', 'reflection', 'recognition'
]);

const OPERATIONAL_LEXEMES = new Set([
  'grab', 'take', 'get', 'use', 'check', 'knock', 'wait', 'call', 'leave', 'bring',
  'door', 'charger', 'boxes', 'back', 'front', 'lean', 'pull', 'push', 'move',
  'send', 'hold', 'keep', 'route', 'watch', 'load', 'open', 'close', 'stick', 'stuck'
]);

const HEDGE_MARKERS = new Set([
  'maybe', 'perhaps', 'possibly', 'apparently', 'honestly', 'frankly', 'actually',
  'sort', 'kind', 'rather', 'quite', 'just', 'simply', 'really'
]);

const DIRECTIVE_MARKERS = new Set([
  'grab', 'take', 'use', 'wait', 'knock', 'lean', 'pull', 'push', 'bring', 'check',
  'call', 'send', 'keep', 'watch', 'hold', 'meet', 'leave', 'go'
]);

const MODIFIER_MARKERS = new Set([
  'hard', 'harder', 'soft', 'softly', 'quick', 'quickly', 'slow', 'slowly', 'quiet',
  'quietly', 'silent', 'silently', 'awkward', 'awkwardly', 'strange', 'strangely',
  'difficult', 'difficultly', 'careful', 'carefully', 'apparent', 'apparently',
  'honest', 'honestly', 'steady', 'steadily', 'rapid', 'rapidly', 'direct', 'directly'
]);

const LATINATE_SUFFIXES = ['tion', 'sion', 'ment', 'ance', 'ence', 'ity', 'ous', 'ive', 'ate', 'ize'];

const REGISTER_MODES = ['plain', 'conversational', 'compressed', 'operational', 'reflective', 'formal'];

const PHRASE_REALIZATION_PACKS = [
  {
    id: 'make-speech',
    pattern: /\bmake a speech\b/gi,
    replacements: {
      plain: 'give a speech',
      operational: 'say it',
      reflective: 'make a speech',
      formal: 'deliver remarks'
    }
  },
  {
    id: 'circling-story',
    pattern: /\bcircling the story\b/gi,
    replacements: {
      plain: 'going over the story',
      operational: 'going over the details',
      reflective: 'circling the story',
      formal: 'revisiting the narrative'
    }
  },
  {
    id: 'buying-time',
    pattern: /\bbuying time\b/gi,
    replacements: {
      plain: 'stalling',
      operational: 'stalling',
      reflective: 'buying time',
      formal: 'delaying'
    }
  },
  {
    id: 'wait-second',
    pattern: /\bwait a second\b/gi,
    replacements: {
      plain: 'wait a second',
      operational: 'hold a second',
      reflective: 'pause a moment',
      formal: 'wait a moment'
    }
  },
  {
    id: 'use-side-door',
    pattern: /\buse the side door\b/gi,
    replacements: {
      plain: 'use the side door',
      operational: 'take the side door',
      reflective: 'come through the side door',
      formal: 'use the side entrance'
    }
  },
  {
    id: 'grab-charger',
    pattern: /\bgrab the charger\b/gi,
    replacements: {
      plain: 'get the charger',
      operational: 'grab the charger',
      reflective: 'bring the charger',
      formal: 'retrieve the charger'
    }
  },
  {
    id: 'hard-part',
    pattern: /\bthe hard part\b/gi,
    replacements: {
      plain: 'the hard part',
      operational: 'the hard part',
      reflective: 'the difficult part',
      formal: 'the difficult portion'
    }
  },
  {
    id: 'received-call',
    pattern: /\breceived a call\b/gi,
    replacements: {
      plain: 'got a call',
      operational: 'got a call',
      reflective: 'received a call',
      formal: 'received a call'
    }
  },
  {
    id: 'remains-pending',
    pattern: /\bremains pending\b/gi,
    replacements: {
      plain: 'is still pending',
      operational: 'is still pending',
      reflective: 'remains pending',
      formal: 'remains pending'
    }
  },
  {
    id: 'could-not',
    pattern: /\bcould not\b/gi,
    replacements: {
      plain: "couldn't",
      operational: "couldn't",
      reflective: 'could not',
      formal: 'could not'
    }
  },
  {
    id: 'does-not-match',
    pattern: /\bdoes not match\b/gi,
    replacements: {
      plain: "doesn't match",
      operational: "doesn't line up with",
      reflective: 'does not match',
      formal: 'does not match'
    }
  },
  {
    id: 'verbally-confirmed',
    pattern: /\bwas verbally confirmed\b/gi,
    replacements: {
      plain: 'was confirmed',
      operational: 'got confirmed',
      reflective: 'was verbally confirmed',
      formal: 'was verbally confirmed'
    }
  },
  {
    id: 'as-of-close',
    pattern: /\bas of close\b/gi,
    replacements: {
      plain: 'by close',
      operational: 'by close',
      reflective: 'as of close',
      formal: 'as of close'
    }
  },
  {
    id: 'remained-unlocated',
    pattern: /\bremained unlocated\b/gi,
    replacements: {
      plain: "still wasn't found",
      operational: "still wasn't found",
      reflective: 'remained unlocated',
      formal: 'remained unlocated'
    }
  },
  {
    id: 'reminder-note-sent',
    pattern: /\ba reminder note was sent\b/gi,
    replacements: {
      plain: 'a reminder went out',
      operational: 'a reminder went out',
      reflective: 'a reminder note was sent',
      formal: 'a reminder note was sent'
    }
  },
  {
    id: 'not-saying-no',
    pattern: /\bnot saying no\b/gi,
    replacements: {
      plain: 'not saying no',
      operational: 'not saying no',
      reflective: 'not refusing support',
      formal: 'this is not a denial'
    }
  },
  {
    id: 'case-split-twice',
    pattern: /\bdon['’]?t want (?:the )?case split twice\b/gi,
    replacements: {
      plain: "don't want the case split twice",
      operational: "don't want the case split twice",
      reflective: 'do not want the case split twice',
      formal: 'the case should not be split twice'
    }
  },
  {
    id: 'kinda-matches',
    pattern: /\bkinda matches\b/gi,
    replacements: {
      plain: 'kind of matches',
      operational: 'kind of matches',
      reflective: 'seems to match',
      formal: 'partially matched'
    }
  }
];

const SHORTHAND_REALIZATION_PACKS = [
  { id: 'acct', pattern: /\bacct\b/gi, formal: 'account', operational: 'acct' },
  { id: 'fam', pattern: /\bfam\b/gi, formal: 'family', operational: 'family' },
  { id: 'pkg', pattern: /\bpkg\b/gi, formal: 'package', operational: 'package' },
  { id: 'appt', pattern: /\bappt\b/gi, formal: 'appointment', operational: 'appt' },
  { id: 'auth', pattern: /\bauth\b/gi, formal: 'authorization', operational: 'auth' },
  { id: 'mgmt', pattern: /\bmgmt\b/gi, formal: 'management', operational: 'mgmt' },
  { id: 'wk', pattern: /\bwk\b/gi, formal: 'week', operational: 'wk' },
  { id: 'msg', pattern: /\bmsg\b/gi, formal: 'message', operational: 'msg' },
  { id: 'ref', pattern: /\bref\b/gi, formal: 'referral', operational: 'ref' },
  { id: 'bc', pattern: /\bbc\b/gi, formal: 'because', operational: 'bc' },
  { id: 'w-slash', pattern: /\bw\/\s*/gi, formal: 'with ', operational: 'w/ ' },
  { id: 'wo-slash', pattern: /\bw\/o\b/gi, formal: 'without', operational: 'w/o' },
  { id: 'thru', pattern: /\bthru\b/gi, formal: 'through', operational: 'through' },
  { id: 'tmrw', pattern: /\btmrw\b/gi, formal: 'tomorrow', operational: 'tomorrow' },
  { id: 'pls', pattern: /\bpls\b/gi, formal: 'please', operational: 'please' }
];

const LEXICAL_FAMILIES = [
  {
    id: 'say',
    forms: {
      plain: { base: 'say', past: 'said', ing: 'saying', third: 'says' },
      operational: { base: 'tell', past: 'told', ing: 'telling', third: 'tells' },
      reflective: { base: 'explain', past: 'explained', ing: 'explaining', third: 'explains' },
      formal: { base: 'state', past: 'stated', ing: 'stating', third: 'states' }
    }
  },
  {
    id: 'get',
    forms: {
      plain: { base: 'get', past: 'got', ing: 'getting', third: 'gets' },
      operational: { base: 'get', past: 'got', ing: 'getting', third: 'gets' },
      reflective: { base: 'receive', past: 'received', ing: 'receiving', third: 'receives' },
      formal: { base: 'receive', past: 'received', ing: 'receiving', third: 'receives' }
    }
  },
  {
    id: 'use',
    forms: {
      plain: { base: 'use', past: 'used', ing: 'using', third: 'uses' },
      operational: { base: 'deploy', past: 'deployed', ing: 'deploying', third: 'deploys' },
      reflective: { base: 'use', past: 'used', ing: 'using', third: 'uses' },
      formal: { base: 'utilize', past: 'utilized', ing: 'utilizing', third: 'utilizes' }
    }
  },
  {
    id: 'keep',
    forms: {
      plain: { base: 'keep', past: 'kept', ing: 'keeping', third: 'keeps' },
      operational: { base: 'hold', past: 'held', ing: 'holding', third: 'holds' },
      reflective: { base: 'retain', past: 'retained', ing: 'retaining', third: 'retains' },
      formal: { base: 'preserve', past: 'preserved', ing: 'preserving', third: 'preserves' }
    }
  },
  {
    id: 'leave',
    forms: {
      plain: { base: 'leave', past: 'left', ing: 'leaving', third: 'leaves' },
      operational: { base: 'head out', past: 'headed out', ing: 'heading out', third: 'heads out' },
      reflective: { base: 'depart', past: 'departed', ing: 'departing', third: 'departs' },
      formal: { base: 'exit', past: 'exited', ing: 'exiting', third: 'exits' }
    }
  },
  {
    id: 'start',
    forms: {
      plain: { base: 'start', past: 'started', ing: 'starting', third: 'starts' },
      operational: { base: 'kick off', past: 'kicked off', ing: 'kicking off', third: 'kicks off' },
      reflective: { base: 'begin', past: 'began', ing: 'beginning', third: 'begins' },
      formal: { base: 'commence', past: 'commenced', ing: 'commencing', third: 'commences' }
    }
  },
  {
    id: 'finish',
    forms: {
      plain: { base: 'finish', past: 'finished', ing: 'finishing', third: 'finishes' },
      operational: { base: 'wrap up', past: 'wrapped up', ing: 'wrapping up', third: 'wraps up' },
      reflective: { base: 'finish', past: 'finished', ing: 'finishing', third: 'finishes' },
      formal: { base: 'conclude', past: 'concluded', ing: 'concluding', third: 'concludes' }
    }
  },
  {
    id: 'change',
    forms: {
      plain: { base: 'change', past: 'changed', ing: 'changing', third: 'changes' },
      operational: { base: 'shift', past: 'shifted', ing: 'shifting', third: 'shifts' },
      reflective: { base: 'alter', past: 'altered', ing: 'altering', third: 'alters' },
      formal: { base: 'modify', past: 'modified', ing: 'modifying', third: 'modifies' }
    }
  },
  {
    id: 'show',
    forms: {
      plain: { base: 'show', past: 'showed', ing: 'showing', third: 'shows' },
      operational: { base: 'show', past: 'showed', ing: 'showing', third: 'shows' },
      reflective: { base: 'explain', past: 'explained', ing: 'explaining', third: 'explains' },
      formal: { base: 'display', past: 'displayed', ing: 'displaying', third: 'displays' }
    }
  },
  {
    id: 'help',
    forms: {
      plain: { base: 'help', past: 'helped', ing: 'helping', third: 'helps' },
      operational: { base: 'help', past: 'helped', ing: 'helping', third: 'helps' },
      reflective: { base: 'support', past: 'supported', ing: 'supporting', third: 'supports' },
      formal: { base: 'assist', past: 'assisted', ing: 'assisting', third: 'assists' }
    }
  },
  {
    id: 'story',
    forms: {
      plain: { singular: 'story', plural: 'stories' },
      operational: { singular: 'detail', plural: 'details' },
      reflective: { singular: 'account', plural: 'accounts' },
      formal: { singular: 'narrative', plural: 'narratives' }
    }
  },
  {
    id: 'speech',
    forms: {
      plain: { singular: 'speech', plural: 'speeches' },
      operational: { singular: 'message', plural: 'messages' },
      reflective: { singular: 'remark', plural: 'remarks' },
      formal: { singular: 'address', plural: 'addresses' }
    }
  },
  {
    id: 'detail',
    forms: {
      plain: { singular: 'detail', plural: 'details' },
      operational: { singular: 'point', plural: 'points' },
      reflective: { singular: 'detail', plural: 'details' },
      formal: { singular: 'particular', plural: 'particulars' }
    }
  },
  {
    id: 'door',
    forms: {
      plain: { singular: 'door', plural: 'doors' },
      operational: { singular: 'door', plural: 'doors' },
      reflective: { singular: 'doorway', plural: 'doorways' },
      formal: { singular: 'entrance', plural: 'entrances' }
    }
  },
  {
    id: 'signal',
    forms: {
      plain: { singular: 'signal', plural: 'signals' },
      operational: { singular: 'signal', plural: 'signals' },
      reflective: { singular: 'sign', plural: 'signs' },
      formal: { singular: 'indication', plural: 'indications' }
    }
  },
  {
    id: 'route',
    forms: {
      plain: { singular: 'route', plural: 'routes' },
      operational: { singular: 'route', plural: 'routes' },
      reflective: { singular: 'path', plural: 'paths' },
      formal: { singular: 'channel', plural: 'channels' }
    }
  },
  {
    id: 'hard',
    forms: {
      plain: { adjective: 'hard', adverb: 'hard' },
      operational: { adjective: 'tough', adverb: 'hard' },
      reflective: { adjective: 'difficult', adverb: 'carefully' },
      formal: { adjective: 'arduous', adverb: 'carefully' }
    }
  },
  {
    id: 'quiet',
    forms: {
      plain: { adjective: 'quiet', adverb: 'quietly' },
      operational: { adjective: 'still', adverb: 'still' },
      reflective: { adjective: 'quiet', adverb: 'quietly' },
      formal: { adjective: 'silent', adverb: 'silently' }
    }
  },
  {
    id: 'fast',
    forms: {
      plain: { adjective: 'fast', adverb: 'fast' },
      operational: { adjective: 'quick', adverb: 'quickly' },
      reflective: { adjective: 'steady', adverb: 'steadily' },
      formal: { adjective: 'rapid', adverb: 'rapidly' }
    }
  },
    {
      id: 'settle',
      forms: {
        plain: { base: 'settle', past: 'settled', ing: 'settling', third: 'settles' },
        operational: { base: 'set', past: 'set', ing: 'setting', third: 'sets' },
        reflective: { base: 'rest', past: 'rested', ing: 'resting', third: 'rests' },
        formal: { base: 'stabilize', past: 'stabilized', ing: 'stabilizing', third: 'stabilizes' }
      }
    },
    {
      id: 'ask',
      forms: {
        plain: { base: 'ask', past: 'asked', ing: 'asking', third: 'asks' },
        operational: { base: 'ask', past: 'asked', ing: 'asking', third: 'asks' },
        reflective: { base: 'request', past: 'requested', ing: 'requesting', third: 'requests' },
        formal: { base: 'request', past: 'requested', ing: 'requesting', third: 'requests' }
      }
    },
    {
      id: 'need',
      forms: {
        plain: { base: 'need', past: 'needed', ing: 'needing', third: 'needs' },
        operational: { base: 'need', past: 'needed', ing: 'needing', third: 'needs' },
        reflective: { base: 'need', past: 'needed', ing: 'needing', third: 'needs' },
        formal: { base: 'need', past: 'needed', ing: 'needing', third: 'needs' }
      }
    },
    {
      id: 'give',
      forms: {
        plain: { base: 'give', past: 'gave', ing: 'giving', third: 'gives' },
        operational: { base: 'hand', past: 'handed', ing: 'handing', third: 'hands' },
        reflective: { base: 'provide', past: 'provided', ing: 'providing', third: 'provides' },
        formal: { base: 'issue', past: 'issued', ing: 'issuing', third: 'issues' }
      }
    },
    {
      id: 'find',
      forms: {
        plain: { base: 'find', past: 'found', ing: 'finding', third: 'finds' },
        operational: { base: 'find', past: 'found', ing: 'finding', third: 'finds' },
        reflective: { base: 'identify', past: 'identified', ing: 'identifying', third: 'identifies' },
        formal: { base: 'locate', past: 'located', ing: 'locating', third: 'locates' }
      }
    },
    {
      id: 'call',
      forms: {
        plain: { base: 'call', past: 'called', ing: 'calling', third: 'calls' },
        operational: { base: 'call', past: 'called', ing: 'calling', third: 'calls' },
        reflective: { base: 'contact', past: 'contacted', ing: 'contacting', third: 'contacts' },
        formal: { base: 'contact', past: 'contacted', ing: 'contacting', third: 'contacts' }
      }
    },
    {
      id: 'book',
      forms: {
        plain: { base: 'book', past: 'booked', ing: 'booking', third: 'books' },
        operational: { base: 'book', past: 'booked', ing: 'booking', third: 'books' },
        reflective: { base: 'schedule', past: 'scheduled', ing: 'scheduling', third: 'schedules' },
        formal: { base: 'schedule', past: 'scheduled', ing: 'scheduling', third: 'schedules' }
      }
    },
    {
      id: 'send',
      forms: {
        plain: { base: 'send', past: 'sent', ing: 'sending', third: 'sends' },
        operational: { base: 'send', past: 'sent', ing: 'sending', third: 'sends' },
        reflective: { base: 'forward', past: 'forwarded', ing: 'forwarding', third: 'forwards' },
        formal: { base: 'transmit', past: 'transmitted', ing: 'transmitting', third: 'transmits' }
      }
    },
    {
      id: 'fix',
      forms: {
        plain: { base: 'fix', past: 'fixed', ing: 'fixing', third: 'fixes' },
        operational: { base: 'fix', past: 'fixed', ing: 'fixing', third: 'fixes' },
        reflective: { base: 'resolve', past: 'resolved', ing: 'resolving', third: 'resolves' },
        formal: { base: 'resolve', past: 'resolved', ing: 'resolving', third: 'resolves' }
      }
    },
    {
      id: 'check',
      forms: {
        plain: { base: 'check', past: 'checked', ing: 'checking', third: 'checks' },
        operational: { base: 'check', past: 'checked', ing: 'checking', third: 'checks' },
        reflective: { base: 'review', past: 'reviewed', ing: 'reviewing', third: 'reviews' },
        formal: { base: 'verify', past: 'verified', ing: 'verifying', third: 'verifies' }
      }
    },
    {
      id: 'move',
      forms: {
        plain: { base: 'move', past: 'moved', ing: 'moving', third: 'moves' },
        operational: { base: 'move', past: 'moved', ing: 'moving', third: 'moves' },
        reflective: { base: 'relocate', past: 'relocated', ing: 'relocating', third: 'relocates' },
        formal: { base: 'transfer', past: 'transferred', ing: 'transferring', third: 'transfers' }
      }
    },
    {
      id: 'match',
      forms: {
        plain: { base: 'match', past: 'matched', ing: 'matching', third: 'matches' },
        operational: { base: 'line up', past: 'lined up', ing: 'lining up', third: 'lines up' },
        reflective: { base: 'align', past: 'aligned', ing: 'aligning', third: 'aligns' },
        formal: { base: 'align', past: 'aligned', ing: 'aligning', third: 'aligns' }
      }
    }
  ];

const LEXICAL_FAMILY_SKIP_PATTERNS = {
  say: [
    /\b(?:error|fault|open|closed|false-open|alert|status)\s+state\b/i,
    /\b(?:say|says|said|saying|tell|tells|told|telling)\s+(?:me|us|him|her|them|it|the\s+\w+)\s+to\b/i,
    /\b(?:keep|keeps|kept)\s+(?:saying|telling)\b/i,
    /\breports?\s+(?:say|says|said)\b/i
  ],
  get: [
    /\b(?:get|gets|got|getting)\s+to\b/i,
    /\b(?:get|gets|got|getting)\s+(?:a\s+)?(?:call|text|message|reply|note|pickup|dropoff)\b/i,
    /\breceiving\s+(?:desk|dock|team|corridor|window)\b/i
  ],
  ask: [
    /\b(?:access|authorization|badge|change|correction|fix|pickup|repair|review|support)\s+request\b/i,
    /\bask(?:ed|ing)?\s+\w+\s+whether\b/i
  ],
  book: [
    /\b(?:scheduling|booking)\s+(?:desk|office|team|line|queue|status)\b/i,
    /\b(?:scheduling|booking)\s+could(?:\s+not|n't)\s+book\b/i
  ],
  change: [
    /\b(?:pickup|schedule|staffing|policy|room|address)\s+change\b/i,
    /\bchange\s+in\s+the\s+(?:dismissal|incident|pickup|routing)\s+log\b/i
  ],
  give: [
    /\b(?:access|badge|billing|clinic|coordination|paperwork|routing|safety|latch|voltage|firmware)\s+issue\b/i,
    /\bhand(?:ed|ing)?\s+in\b/i,
    /\b(?:the|a|an|this|that|underlying|corrective|procedural|staffing|coordination|operational)\s+issue(?:s)?\b/i
  ],
  start: [
    /\b(?:began|begin|beginning|started|start|starting|commenced|commence|commencing)\s+(?:presenting|validating|processing|showing)\b/i
  ],
  keep: [
    /\b(?:keep|keeps|kept|holding|hold|holds|held)\s+\w+ing\b/i,
    /\b(?:fraud|account|manual|review|device|credential|security)\s+hold\b/i,
    /\b(?:clear|clearing|remove|removing|removed)\s+(?:the\s+)?hold\b/i
  ],
  leave: [
    /\b(?:no|none|nothing|little|less)\b[^.!?]{0,18}\bleft\b/i,
    /\b(?:stock|inventory|time|room|rooms|capacity|availability|food|money)\s+left\b/i,
    /\bleft[-\s](?:knee|arm|side|hip|ankle|foot|hand|shoulder|wrist|leg|elbow|eye|ear|breast|lung|lower|upper)\b/i,
    /\b(?:was|were|is|are|got)(?:\s+\w+){0,2}\s+left\s+on\b/i
  ],
  settle: [
    /\bbox\s+(?:rested|sat|set)\b/i
  ],
  check: [
    /\b(?:verified|reviewed)\s+override\b/i
  ],
  match: [
    /\b(?:photo\s+)?id\s+match\b/i,
    /\b(?:badge|name|pickup|record)\s+match\b/i
  ],
  quiet: [
    /\bstill\s+(?:out|in|there|here)\b/i,
    /\bstill\s+(?:was|were|is|are|had|has|have|not|being)\b/i
  ]
};

const DISABLED_LEXICAL_FAMILY_IDS = new Set(['quiet', 'signal']);
const BORROWED_SHELL_DISABLED_LEXICAL_FAMILY_IDS = new Set(['quiet', 'say', 'keep', 'leave', 'give', 'signal']);

const CONTENT_STOP_WORDS = new Set([...FUNCTION_WORDS, ...AUXILIARY_WORDS, 'i', 'you', 'we', 'they', 'he', 'she', 'it']);

const FAMILY_VARIANT_INDEX = (() => {
  const entries = [];
  for (const family of LEXICAL_FAMILIES) {
    for (const [mode, forms] of Object.entries(family.forms)) {
      for (const [formKey, surface] of Object.entries(forms)) {
        entries.push({
          familyId: family.id,
          mode,
          formKey,
          surface,
          normalized: surface.toLowerCase()
        });
      }
    }
  }
  return entries.sort((left, right) => right.surface.length - left.surface.length);
})();

function countLexemeMatches(words = [], lexemes = new Set()) {
  return words.reduce((sum, word) => sum + (lexemes.has(word) ? 1 : 0), 0);
}

function contentWords(text = '') {
  return tokenize(text).filter((word) => !CONTENT_STOP_WORDS.has(word));
}

function normalizedContentWordComplexity(words = []) {
  if (!words.length) {
    return 0;
  }

  const averageLength = words.reduce((sum, word) => sum + word.replace(/'/g, '').length, 0) / words.length;
  return round3(clamp01((averageLength - 3) / 7));
}

function normalizedModifierDensity(words = []) {
  if (!words.length) {
    return 0;
  }

  const count = words.filter((word) =>
    MODIFIER_MARKERS.has(word) ||
    /(?:ly|ive|ous|al|ful|less|able|ible|ish|ic)$/i.test(word)
  ).length;
  return round3(clamp01(count / words.length));
}

function normalizedHedgeDensity(words = []) {
  if (!words.length) {
    return 0;
  }

  return round3(clamp01(countLexemeMatches(words, HEDGE_MARKERS) / words.length));
}

function normalizedAbstractionPosture(words = []) {
  if (!words.length) {
    return 0.5;
  }

  const abstractCount = countLexemeMatches(words, ABSTRACT_LEXEMES);
  const operationalCount = countLexemeMatches(words, OPERATIONAL_LEXEMES);
  if (!abstractCount && !operationalCount) {
    return 0.5;
  }

  return round3(clamp01(abstractCount / Math.max(abstractCount + operationalCount, 1)));
}

function normalizedDirectness(text = '', words = []) {
  const sentences = sentenceSplit(text);
  const imperativeHits = sentences.filter((sentence) => {
    const tokens = tokenize(sentence);
    return tokens.length > 1 && DIRECTIVE_MARKERS.has(tokens[0]);
  }).length;
  const secondPersonHits = words.filter((word) => word === 'you' || word === 'your').length;
  const directiveHits = countLexemeMatches(words, DIRECTIVE_MARKERS);
  const raw = (imperativeHits * 0.5) + (directiveHits * 0.18) + (secondPersonHits * 0.08);
  return round3(clamp01(raw));
}

function normalizedLatinatePreference(words = []) {
  if (!words.length) {
    return 0;
  }

  const latinateHits = words.filter((word) =>
    LATINATE_SUFFIXES.some((suffix) => word.endsWith(suffix)) ||
    /(?:utilize|preserve|commence|conclude|obtain|assist|display|narrative|indication|particulars?)$/.test(word)
  ).length;
  return round3(clamp01(latinateHits / words.length));
}

function detectRegisterMode(profile = {}) {
  if (
    (profile.abbreviationDensity || 0) >= 0.14 ||
    (profile.orthographicLooseness || 0) >= 0.22 ||
    (profile.fragmentPressure || 0) >= 0.3
  ) {
    return 'compressed';
  }

  if (
    (profile.conversationalPosture || 0) >= 0.18 &&
    (profile.contentWordComplexity || 0) <= 0.48 &&
    (profile.latinatePreference || 0) <= 0.18
  ) {
    return 'conversational';
  }

  if ((profile.directness || 0) >= 0.22 && (profile.abstractionPosture || 0) <= 0.55) {
    return 'operational';
  }

  if ((profile.latinatePreference || 0) >= 0.18 && (profile.contentWordComplexity || 0) >= 0.42) {
    return 'formal';
  }

  if ((profile.abstractionPosture || 0) >= 0.58 || (profile.hedgeDensity || 0) >= 0.04) {
    return 'reflective';
  }

  return 'plain';
}

function registerDistance(profileA = {}, profileB = {}) {
  return round3(arithmeticMean([
    boundedDistance(profileA.contentWordComplexity || 0, profileB.contentWordComplexity || 0, 0.55),
    boundedDistance(profileA.abstractionPosture || 0, profileB.abstractionPosture || 0, 0.65),
    boundedDistance(profileA.modifierDensity || 0, profileB.modifierDensity || 0, 0.22),
    boundedDistance(profileA.hedgeDensity || 0, profileB.hedgeDensity || 0, 0.12),
    boundedDistance(profileA.directness || 0, profileB.directness || 0, 0.4),
    boundedDistance(profileA.latinatePreference || 0, profileB.latinatePreference || 0, 0.3),
    boundedDistance(profileA.abbreviationDensity || 0, profileB.abbreviationDensity || 0, 0.28),
    boundedDistance(profileA.orthographicLooseness || 0, profileB.orthographicLooseness || 0, 0.38),
    boundedDistance(profileA.fragmentPressure || 0, profileB.fragmentPressure || 0, 0.45),
    boundedDistance(profileA.conversationalPosture || 0, profileB.conversationalPosture || 0, 0.42)
  ]));
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
  const content = contentWords(text);
  const sentences = sentenceSplit(text);
  const surfaceMarkerProfile = buildSurfaceMarkerProfile(text, words, sentences.length);
  const contentWordComplexity = normalizedContentWordComplexity(content);
  const modifierDensity = normalizedModifierDensity(content);
  const hedgeDensity = normalizedHedgeDensity(words);
  const abstractionPosture = normalizedAbstractionPosture(content);
  const directness = normalizedDirectness(text, words);
  const latinatePreference = normalizedLatinatePreference(content);
  const abbreviationDensity = normalizedAbbreviationDensity(text, words, surfaceMarkerProfile);
  const orthographicLooseness = normalizedOrthographicLooseness(text, sentences, words, surfaceMarkerProfile);
  const fragmentPressure = normalizedFragmentPressure(text);
  const conversationalPosture = normalizedConversationalPosture(text, words, surfaceMarkerProfile);

  const profile = {
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
    contentWordComplexity,
    modifierDensity,
    hedgeDensity,
    abstractionPosture,
    directness,
    latinatePreference,
    abbreviationDensity,
    orthographicLooseness,
    fragmentPressure,
    conversationalPosture,
    surfaceMarkerProfile,
    functionWordProfile: functionWordProfile(text),
    wordLengthProfile: wordLengthProfile(text),
    charTrigramProfile: charTrigramProfile(text)
  };

  return {
    ...profile,
    registerMode: detectRegisterMode(profile)
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
  const abbreviationDensity = round3(clamp01((profile.abbreviationDensity || 0) + ((mod.punc || 0) * 0.012)));
  const orthographicLooseness = round3(clamp01((profile.orthographicLooseness || 0) + ((mod.punc || 0) * 0.015)));
  const fragmentPressure = round3(clamp01((profile.fragmentPressure || 0) + ((mod.sent || 0) < 0 ? Math.abs(mod.sent || 0) * 0.04 : (mod.sent || 0) * -0.02)));
  const conversationalPosture = round3(clamp01((profile.conversationalPosture || 0) + (((mod.cont || 0) + (mod.punc || 0)) * 0.01)));

  const result = {
    ...profile,
    avgSentenceLength: avgSentence,
    sentenceLengthSpread: spread,
    punctuationDensity: punctuation,
    contractionDensity: contraction,
    lineBreakDensity: lineBreak,
    recurrencePressure: recurrence,
    lexicalDispersion: lexical,
    abbreviationDensity,
    orthographicLooseness,
    fragmentPressure,
    conversationalPosture,
    shellBias: {
      sent: mod.sent || 0,
      cont: mod.cont || 0,
      punc: mod.punc || 0
    }
  };

  return {
    ...result,
    registerMode: detectRegisterMode(result)
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
  const contentWordComplexity = round3(clamp01(
    ((profile.contentWordComplexity || 0) * (1 - softBlend)) + ((source.contentWordComplexity || 0) * softBlend)
  ));
  const modifierDensity = round3(clamp01(
    ((profile.modifierDensity || 0) * (1 - softBlend)) + ((source.modifierDensity || 0) * softBlend)
  ));
  const hedgeDensity = round3(clamp01(
    ((profile.hedgeDensity || 0) * (1 - softBlend)) + ((source.hedgeDensity || 0) * softBlend)
  ));
  const abstractionPosture = round3(clamp01(
    ((profile.abstractionPosture || 0.5) * (1 - softBlend)) + ((source.abstractionPosture || 0.5) * softBlend)
  ));
  const directness = round3(clamp01(
    ((profile.directness || 0) * (1 - softBlend)) + ((source.directness || 0) * softBlend)
  ));
  const latinatePreference = round3(clamp01(
    ((profile.latinatePreference || 0) * (1 - softBlend)) + ((source.latinatePreference || 0) * softBlend)
  ));
  const abbreviationDensity = round3(clamp01(
    ((profile.abbreviationDensity || 0) * (1 - softBlend)) + ((source.abbreviationDensity || 0) * softBlend)
  ));
  const orthographicLooseness = round3(clamp01(
    ((profile.orthographicLooseness || 0) * (1 - softBlend)) + ((source.orthographicLooseness || 0) * softBlend)
  ));
  const fragmentPressure = round3(clamp01(
    ((profile.fragmentPressure || 0) * (1 - recurrenceBlend)) + ((source.fragmentPressure || 0) * recurrenceBlend)
  ));
  const conversationalPosture = round3(clamp01(
    ((profile.conversationalPosture || 0) * (1 - softBlend)) + ((source.conversationalPosture || 0) * softBlend)
  ));
  const recurrence = round3(
    (
      clamp01(punctuation / 0.35) +
      clamp01(lineBreak / 0.75) +
      clamp01(bigram / 0.18)
    ) / 3
  );

  const result = {
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
    contentWordComplexity,
    modifierDensity,
    hedgeDensity,
    abstractionPosture,
    directness,
    latinatePreference,
    abbreviationDensity,
    orthographicLooseness,
    fragmentPressure,
    conversationalPosture,
    surfaceMarkerProfile: source.surfaceMarkerProfile
      ? blendSurfaceMarkerProfile(profile.surfaceMarkerProfile || {}, source.surfaceMarkerProfile, softBlend)
      : profile.surfaceMarkerProfile,
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

  return {
    ...result,
    registerMode: detectRegisterMode(result)
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
  const isPersonaShell = shell?.mode === 'persona';
  const visibleBlend = clamp(isPersonaShell ? 0.88 + (strength * 0.1) : 0.82 + (strength * 0.18), 0, isPersonaShell ? 0.99 : 1);
  const recurrenceBlend = clamp(isPersonaShell ? 0.84 + (strength * 0.12) : 0.76 + (strength * 0.18), 0, isPersonaShell ? 0.99 : 1);
  const lexicalBlend = clamp(isPersonaShell ? 0.78 + (strength * 0.16) : 0.62 + (strength * 0.16), 0, isPersonaShell ? 0.99 : 0.96);

  const result = {
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
    contentWordComplexity: round3(clamp01(
      (baseProfile.contentWordComplexity || 0) +
      (((donor.contentWordComplexity || baseProfile.contentWordComplexity || 0) - (baseProfile.contentWordComplexity || 0)) * lexicalBlend)
    )),
    modifierDensity: round3(clamp01(
      (baseProfile.modifierDensity || 0) +
      (((donor.modifierDensity || baseProfile.modifierDensity || 0) - (baseProfile.modifierDensity || 0)) * lexicalBlend)
    )),
    hedgeDensity: round3(clamp01(
      (baseProfile.hedgeDensity || 0) +
      (((donor.hedgeDensity || baseProfile.hedgeDensity || 0) - (baseProfile.hedgeDensity || 0)) * lexicalBlend)
    )),
    abstractionPosture: round3(clamp01(
      (baseProfile.abstractionPosture || 0.5) +
      (((donor.abstractionPosture || baseProfile.abstractionPosture || 0.5) - (baseProfile.abstractionPosture || 0.5)) * lexicalBlend)
    )),
    directness: round3(clamp01(
      (baseProfile.directness || 0) +
      (((donor.directness || 0) - (baseProfile.directness || 0)) * lexicalBlend)
    )),
    latinatePreference: round3(clamp01(
      (baseProfile.latinatePreference || 0) +
      (((donor.latinatePreference || 0) - (baseProfile.latinatePreference || 0)) * lexicalBlend)
    )),
    abbreviationDensity: round3(clamp01(
      (baseProfile.abbreviationDensity || 0) +
      (((donor.abbreviationDensity || 0) - (baseProfile.abbreviationDensity || 0)) * lexicalBlend)
    )),
    orthographicLooseness: round3(clamp01(
      (baseProfile.orthographicLooseness || 0) +
      (((donor.orthographicLooseness || 0) - (baseProfile.orthographicLooseness || 0)) * lexicalBlend)
    )),
    fragmentPressure: round3(clamp01(
      (baseProfile.fragmentPressure || 0) +
      (((donor.fragmentPressure || 0) - (baseProfile.fragmentPressure || 0)) * visibleBlend)
    )),
    conversationalPosture: round3(clamp01(
      (baseProfile.conversationalPosture || 0) +
      (((donor.conversationalPosture || 0) - (baseProfile.conversationalPosture || 0)) * lexicalBlend)
    )),
    surfaceMarkerProfile: donor.surfaceMarkerProfile
      ? blendSurfaceMarkerProfile(baseProfile.surfaceMarkerProfile || {}, donor.surfaceMarkerProfile, lexicalBlend)
      : baseProfile.surfaceMarkerProfile,
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
      targetMode: isPersonaShell ? 'persona-donor' : 'donor'
    }
  };

  return {
    ...result,
    registerMode: detectRegisterMode(result)
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
    functionWord: functionWordDistance(profile.functionWordProfile || {}, targetProfile.functionWordProfile || {}),
    lexicalComplexity: Math.abs((profile.contentWordComplexity || 0) - (targetProfile.contentWordComplexity || 0)),
    modifierDensity: Math.abs((profile.modifierDensity || 0) - (targetProfile.modifierDensity || 0)),
    hedgeDensity: Math.abs((profile.hedgeDensity || 0) - (targetProfile.hedgeDensity || 0)),
    directness: Math.abs((profile.directness || 0) - (targetProfile.directness || 0)),
    abstraction: Math.abs((profile.abstractionPosture || 0.5) - (targetProfile.abstractionPosture || 0.5)),
    latinate: Math.abs((profile.latinatePreference || 0) - (targetProfile.latinatePreference || 0)),
    abbreviation: Math.abs((profile.abbreviationDensity || 0) - (targetProfile.abbreviationDensity || 0)),
    orthography: Math.abs((profile.orthographicLooseness || 0) - (targetProfile.orthographicLooseness || 0)),
    fragment: Math.abs((profile.fragmentPressure || 0) - (targetProfile.fragmentPressure || 0)),
    conversation: Math.abs((profile.conversationalPosture || 0) - (targetProfile.conversationalPosture || 0)),
    surfaceMarkers: surfaceMarkerDistance(profile.surfaceMarkerProfile || {}, targetProfile.surfaceMarkerProfile || {}),
    register: registerDistance(profile, targetProfile)
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
    (clamp01((gap.register || 0) / 0.4) * 0.12) +
    (clamp01((gap.directness || 0) / 0.4) * 0.04) +
    (clamp01((gap.abstraction || 0) / 0.4) * 0.04) +
    (clamp01((gap.modifierDensity || 0) / 0.2) * 0.04) +
    (clamp01((gap.abbreviation || 0) / 0.18) * 0.08) +
    (clamp01((gap.orthography || 0) / 0.24) * 0.08) +
    (clamp01((gap.fragment || 0) / 0.25) * 0.06) +
    (clamp01((gap.conversation || 0) / 0.24) * 0.06) +
    (clamp01(gap.surfaceMarkers || 0) * 0.06) +
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
    (gap.punctuationShape || 0) >= 0.05 ||
    (gap.register || 0) >= 0.11 ||
    (gap.directness || 0) >= 0.06 ||
    (gap.abstraction || 0) >= 0.08 ||
    (gap.abbreviation || 0) >= 0.03 ||
    (gap.orthography || 0) >= 0.05 ||
    (gap.fragment || 0) >= 0.06 ||
    (gap.conversation || 0) >= 0.06 ||
    (gap.surfaceMarkers || 0) >= 0.08;
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
  if ((compare.registerDistance || 0) >= 0.09) {
    shifted.push('lexical-register');
  }
  if (Math.abs((outputProfile.contentWordComplexity || 0) - (sourceProfile.contentWordComplexity || 0)) >= 0.045) {
    shifted.push('content-word-complexity');
  }
  if (Math.abs((outputProfile.modifierDensity || 0) - (sourceProfile.modifierDensity || 0)) >= 0.02) {
    shifted.push('modifier-density');
  }
  if (Math.abs((outputProfile.directness || 0) - (sourceProfile.directness || 0)) >= 0.05) {
    shifted.push('directness');
  }
  if (Math.abs((outputProfile.abstractionPosture || 0.5) - (sourceProfile.abstractionPosture || 0.5)) >= 0.08) {
    shifted.push('abstraction-posture');
  }
  if (Math.abs((outputProfile.abbreviationDensity || 0) - (sourceProfile.abbreviationDensity || 0)) >= 0.02) {
    shifted.push('abbreviation-posture');
  }
  if (Math.abs((outputProfile.orthographicLooseness || 0) - (sourceProfile.orthographicLooseness || 0)) >= 0.04) {
    shifted.push('orthography-posture');
  }
  if (Math.abs((outputProfile.fragmentPressure || 0) - (sourceProfile.fragmentPressure || 0)) >= 0.05) {
    shifted.push('fragment-posture');
  }
  if (Math.abs((outputProfile.conversationalPosture || 0) - (sourceProfile.conversationalPosture || 0)) >= 0.05) {
    shifted.push('conversation-posture');
  }
  if (surfaceMarkerDistance(outputProfile.surfaceMarkerProfile || {}, sourceProfile.surfaceMarkerProfile || {}) >= 0.08) {
    shifted.push('surface-marker-posture');
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

const LEXICAL_TRANSFER_DIMENSIONS = new Set([
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

function structuralDimensions(changedDimensions = []) {
  return changedDimensions.filter((dimension) => STRUCTURAL_TRANSFER_DIMENSIONS.has(dimension));
}

function lexicalDimensions(changedDimensions = []) {
  return changedDimensions.filter((dimension) => LEXICAL_TRANSFER_DIMENSIONS.has(dimension));
}

function hasMaterialStructuralTransfer(changedDimensions = []) {
  const nonPunctuationDimensions = changedDimensions.filter((dimension) => dimension !== 'punctuation-shape');
  return structuralDimensions(changedDimensions).length >= 1 && nonPunctuationDimensions.length >= 2;
}

function borrowedShellStructuralDimensions(changedDimensions = []) {
  return structuralDimensions(changedDimensions).filter((dimension) => dimension !== 'contraction-posture');
}

function hasBorrowedShellVisibleShift(sourceText = '', outputText = '', changedDimensions = [], lexicalShiftProfile = {}) {
  if (!sourceText || !outputText || outputText === sourceText) {
    return false;
  }

  const nonPunctuationDimensions = changedDimensions.filter((dimension) => dimension !== 'punctuation-shape');
  return nonPunctuationDimensions.length > 0 || Number(lexicalShiftProfile.swapCount || 0) > 0;
}

function hasBorrowedShellNonTrivialShift(sourceText = '', outputText = '', changedDimensions = [], lexicalShiftProfile = {}) {
  if (!hasBorrowedShellVisibleShift(sourceText, outputText, changedDimensions, lexicalShiftProfile)) {
    return false;
  }

  return lexicalDimensions(changedDimensions).length > 0 ||
    borrowedShellStructuralDimensions(changedDimensions).length > 0 ||
    Number(lexicalShiftProfile.swapCount || 0) > 0;
}

function donorDistanceFromFit(fit = {}) {
  return round3(
    (fit.sentenceDistance || 0) +
    (fit.functionWordDistance || 0) +
    (fit.contractionDistance || 0) +
    (fit.punctShapeDistance || 0) +
    (fit.registerDistance || 0) +
    (fit.abbreviationDistance || 0) +
    (fit.orthographyDistance || 0) +
    (fit.fragmentDistance || 0) +
    (fit.conversationDistance || 0) +
    (fit.surfaceMarkerDistance || 0)
  );
}

function buildBorrowedShellDonorProgress(
  sourceText = '',
  outputText = '',
  sourceProfile = {},
  targetProfile = {},
  outputProfile = {}
) {
  if (!sourceText || !outputText || !targetProfile || targetProfile.empty) {
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
    profileA: sourceProfile,
    profileB: targetProfile
  });
  const outputFit = compareTexts('', '', {
    profileA: outputProfile,
    profileB: targetProfile
  });
  const sourceOutputFit = compareTexts(sourceText, outputText, {
    profileA: sourceProfile,
    profileB: outputProfile
  });
  const sourceDonorDistance = donorDistanceFromFit(sourceFit);
  const outputDonorDistance = donorDistanceFromFit(outputFit);
  const donorImprovement = round3(Math.max(0, sourceDonorDistance - outputDonorDistance));
  const donorImprovementRatio = round3(
    sourceDonorDistance > 0
      ? donorImprovement / sourceDonorDistance
      : 0
  );

  return {
    eligible: true,
    sourceDonorDistance,
    outputDonorDistance,
    donorImprovement,
    donorImprovementRatio,
    sourceOutputLexicalOverlap: round3(sourceOutputFit.lexicalOverlap ?? 1)
  };
}

function borrowedShellSurfaceClose(donorProgress = {}) {
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

function borrowedShellPathologyBlocked(qualityNotes = []) {
  const hardBlockers = [
    /^Protected literals did not survive the rewrite intact\./,
    /^Protected placeholders leaked into the output\./,
    /^Transfer introduced a duplicated sentence chunk\./,
    /^Transfer introduced a repeated connector sequence\./,
    /^Banned connector stack detected:/,
    /^Orphan fragment detected:/,
    /^Transfer expanded past the bounded output ratio\./,
    /^Transfer collapsed into an unreadable empty result\./
  ];

  return qualityNotes.some((note) => hardBlockers.some((pattern) => pattern.test(note)));
}

function sanitizeBorrowedShellPathologies(text = '') {
  let result = normalizeText(text);

  if (!result) {
    return result;
  }

  result = result
    .replace(/\bbut\s+because\b/gi, (match) => matchCase(match, 'because'))
    .replace(/\bthough\s+if\b/gi, (match) => matchCase(match, 'if'))
    .replace(/\band\s+though\s+if\b/gi, (match) => matchCase(match, 'if'))
    .replace(/\bhonestly[,;]?\s+and\b/gi, (match) => {
      if (/;/.test(match)) {
        return matchCase(match, 'honestly;');
      }
      return matchCase(match, 'honestly,');
    })
    .replace(/\bbetween([^.!?]{0,120}),\s+but\s+/gi, 'between$1, and ')
    .replace(/;\s+but\b/gi, ', but')
    .replace(/\bquiet\s+(receive|receives|received|receiving|get|gets|got|getting|stand|stands|stood|standing|pass|passes|passed|passing|fail|fails|failed|failing|match|matches|matched|matching|clear|clears|cleared|clearing|stay|stays|stayed|staying|remain|remains|remained|remaining|run|runs|ran|running|work|works|worked|working|hold|holds|held|holding|show|shows|showed|showing|move|moves|moved|moving)\b/gi, 'still $1')
    .replace(/\bexplaining\s+(me|us|him|her|them)\s+to\b/gi, 'telling $1 to')
    .replace(/\bthe\s+corrective\s+provide\s+is\s+not\s+merely\b/gi, "the problem isn't just")
    .replace(/\bthe\s+underlying\s+provide\b/gi, 'the underlying issue')
    .replace(/\bthe\s+procedural\s+provide\b/gi, 'the procedural issue')
    .replace(/\bwhat\s+did\s+fix\s+was\b/gi, 'what did help was')
    .replace(/\bYet\s+and\b/gi, 'And')
    .replace(/\bthough\s+and\b/gi, 'and')
    .replace(/\bthough\s+also\b/gi, 'and also')
    .replace(/\band shell have id\b/gi, "and she'll have ID")
    .replace(/\band also I swear\b/gi, 'and I swear')
    .replace(/;\s+yet if\b/gi, '. If')
    .replace(/\b(As of [^.!?]{1,48}|During [^.!?]{1,36}|By [^.!?]{1,20})\.\s+([A-Z])/g, (match, leadIn, nextLetter) => {
      return `${leadIn}, ${nextLetter.toLowerCase()}`;
    })
    .replace(/\b(On [^.;!?]{1,48});\s+([A-Z])/g, (match, leadIn, nextLetter) => {
      return `${leadIn}, ${nextLetter}`;
    })
    .replace(/\b(At [^.!?]{1,48})\.\s+(Door\s+\d+\b)/g, (match, leadIn, doorPhrase) => {
      return `${leadIn}, ${doorPhrase}`;
    })
    .replace(/\bRequired correction\.\s+No future\b/gi, 'Required correction: no future')
    .replace(/\blive-door test,\s+A latch release check\b/gi, 'live-door test, a latch release check')
    .replace(/([A-Za-z0-9"'%)])\.\s+(When|While|Once|If|Because|Since|Though|Although)\b/g, (match, lastChar, connector) => {
      return `${lastChar}, ${connector.toLowerCase()}`;
    })
    .replace(/([A-Za-z0-9"'%)])\.\s+(Which|That)\b/g, (match, lastChar, connector) => {
      return `${lastChar}, ${connector.toLowerCase()}`;
    })
    .replace(/([A-Za-z0-9"'%)])\.\s+((?:A|An|The)\s+[^.!?]{1,48}),\s+and\s+/g, (match, lastChar, fragment) => {
      return `${lastChar}, ${fragment}, and `;
    })
    .replace(/([.!?]\s+)(And|But|So|Yet|Still)\s+([^.!?]{1,28})\.\s+([A-Z][^.!?]{1,160}[.!?]?)/g, (match, lead, connector, fragment, nextSentence) => {
      const fragmentWords = tokenize(`${connector} ${fragment}`);
      if (fragmentWords.length > 3) {
        return match;
      }
      const stitchedNext = nextSentence.replace(/^[A-Z]/, (letter) => letter.toLowerCase());
      return `${lead}${connector} ${fragment} ${stitchedNext}`;
    })
    .replace(/([.!?])\s+(?:and|but|so|yet|still)\s*\./gi, '$1 ')
    .replace(/([.!?])\s+(?:and|but|so|yet|still)\s+([A-Z])/g, '$1 $2');

  return finalizeTransformedText(result);
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

// ============================================================================
// IR System - Semantic Scaffold for Text Transformation
// ============================================================================

export function segmentTextToIR(text, protectedState) {
  const sentences = sentenceSplit(text);
  let sentenceId = 0;

  const irSentences = sentences.map((sentenceText) => {
    const clauses = segmentSentenceToClauses(sentenceText);
    const terminalPunct = /[.!?]$/.test(sentenceText) ? sentenceText[sentenceText.length - 1] : '.';
    const relation = relationInventory(buildRelationOpportunityProfile(sentenceText));
    const dominantRel = dominantRelationFromInventory(relation);

    const irClauses = clauses.map((clauseText, clauseIdx) => {
      const normalized = normalizeText(clauseText).toLowerCase();
      const relationToPrev = clauseIdx === 0 ? 'start' : inferClauseRelation('', clauseText);
      const clauseType = classifyClauseType(clauseText);
      const completeness = detectClauseCompleteness(clauseText);
      const modality = detectModalityAndHedges(clauseText);
      const semanticScaffold = extractClauseSemanticScaffold(clauseText);

      return {
        id: `s${sentenceId}c${clauseIdx}`,
        text: clauseText,
        normalized,
        relationToPrev,
        clauseType,
        subjectPresent: completeness.subjectPresent,
        finiteVerbPresent: completeness.finiteVerbPresent,
        polarity: modality.polarity,
        modality: modality.modality,
        hedgeMarkers: modality.hedgeMarkers,
        tenseAspect: semanticScaffold.tenseAspect,
        propositionHead: semanticScaffold.propositionHead,
        actor: semanticScaffold.actor,
        action: semanticScaffold.action,
        object: semanticScaffold.object,
        modifiers: semanticScaffold.modifiers,
        connectorLead: (RELATION_LEAD_PATTERNS[relationToPrev] || /(?!)/).test(clauseText),
        transformOps: {
          canCompact: completeness.subjectPresent && completeness.finiteVerbPresent,
          canExpand: clauseType !== 'fragment',
          canPromote: clauseType === 'subordinate' && completeness.finiteVerbPresent,
          canDemote: clauseType === 'main',
          canMergeNext: clauseIdx < clauses.length - 1
        }
      };
    });

    sentenceId += 1;
    return {
      id: `s${sentenceId - 1}`,
      raw: sentenceText,
      clauses: irClauses,
      terminalPunct,
      rhetoricalRole: dominantRel,
      canSplit: clauses.length > 1,
      canMerge: true
    };
  });

  return {
    sourceText: text,
    protectedState,
    sentences: irSentences,
    metadata: {
      literalSpans: protectedState.literals || [],
      sentenceCount: irSentences.length,
      clauseCount: irSentences.reduce((sum, s) => sum + s.clauses.length, 0)
    }
  };
}

function segmentSentenceToClauses(sentenceText = '') {
  const stripped = stripTerminalPunctuation(sentenceText).trim();
  if (!stripped) return [];

  const clauses = [];
  let remaining = stripped;

  // Split on major clause boundaries: semicolons, dashes with subjects
  const parts = remaining
    .split(/;\s+|(?:,?\s*-\s+(?=[A-Z]|\b(?:and|but|though|so|because|if|when|while)))/)
    .filter(Boolean);

  if (parts.length > 1) {
    return parts.map(p => p.trim()).filter(Boolean);
  }

  // Split on coordinating conjunctions with likely subject following
  const coordParts = remaining
    .split(/,?\s+(?:and|but|so|though|yet|or)\s+(?=[A-Z]|I\b|we\b|they\b|you\b|he\b|she\b|it\b|there\b|this\b|that\b)/)
    .filter(Boolean);

  if (coordParts.length > 1) {
    return coordParts.map(p => p.trim()).filter(Boolean);
  }

  // Split on subordinating conjunctions
  const subordParts = remaining
    .split(/,?\s+(?:because|since|as|if|when|while|unless|until|once|though|although|even\s+though)(?:\s+|$)/)
    .filter(Boolean);

  if (subordParts.length > 1) {
    return subordParts.map(p => p.trim()).filter(Boolean);
  }

  // No clear splits; return the whole sentence as one clause
  return [stripped];
}

function classifyClauseType(text = '') {
  const normalized = stripTerminalPunctuation(text).toLowerCase().trim();

  // Check for relative clauses
  if (/^\s*(?:which|that|who|whom|whose)\b/.test(text)) {
    return 'relative';
  }

  // Check for subordinate clause leads
  if (/^(?:because|since|as|if|when|while|unless|until|once|though|although|even\s+though)(?:\s+|$)/i.test(normalized)) {
    return 'subordinate';
  }

  // Check for parenthetical/resumptive leads
  if (/^(?:honestly|apparently|frankly|basically|anyway|i\s+think|i\s+guess|i\s+mean|to\s+be\s+honest)(?:\s|,|$)/i.test(normalized)) {
    return 'parenthetical';
  }

  // Check for fragment (no verb/subject)
  const hasAnyVerb = /\b(?:is|was|are|were|be|been|being|do|does|did|will|would|can|could|may|might|shall|should|have|has|had|must|go|comes?|makes?|says?|sees?|thinks?|knows?|gets?|takes?|gives?|finds?|tells?|asks?|works?|calls?|tries?|uses?|starts?|helps?|plays?|moves?|likes?|lives?|believes?|holds?|brings?|begins?|seems?|talks?|turns?|shows?|hears?|lets?|means?|sets?|meets?|runs?|pays?|sits?|speaks?|lies?|leads?|reads?|allows?|adds?|spends?|grows?|opens?|walks?|wins?|offers?|remembers?|loves?|considers?|appears?|buys?|waits?|serves?|dies?|sends?|expects?|builds?|stays?|falls?|cuts?|reaches?|kills?|remains?|suggests?|raises?|passes?|sells?|requires?|reports?|decides?|pulls?|produces?|eats?|covers?|catches?|draws?|breaks?|changes?|understands?|watches?|follows?|stops?|creates?)\b/i;
  if (!hasAnyVerb.test(normalized)) {
    return 'fragment';
  }

  return 'main';
}

function detectClauseCompleteness(text = '') {
  const normalized = stripTerminalPunctuation(text).toLowerCase().trim();

  // Common subject patterns
  const subjectPattern = /\b(?:I|we|you|they|he|she|it|there|this|that|which|who|one|each|every|some|any|all|both|neither|either|another|the|a|an)\b|^[A-Z]\w+\s+/i;
  const subjectPresent = subjectPattern.test(text);

  // Check for any form of finite verb (simplified)
  const finiteVerbPresent = /\b(?:is|was|are|were|be|been|do|does|did|will|would|can|could|may|might|have|has|had|must|am|go|comes?|makes?|says?|sees?|thinks?|knows?|gets?|takes?|gives?|finds?|tells?|asks?|works?|calls?|tries?|uses?|starts?|helps?|plays?|moves?|likes?|lives?|believes?|holds?|brings?|begins?|seems?|talks?|turns?|shows?|hears?|lets?|means?|sets?|meets?|runs?|pays?|sits?|speaks?|lies?|leads?|reads?|allows?|adds?|spends?|grows?|opens?|walks?|wins?|offers?|remembers?|loves?|considers?|appears?|buys?|waits?|serves?|dies?|sends?|expects?|builds?|stays?|falls?|cuts?|reaches?|kills?|remains?|suggests?|raises?|passes?|sells?|requires?|reports?|decides?|pulls?|produces?|eats?|covers?|catches?|draws?|breaks?|changes?|understands?|watches?|follows?|stops?|creates?)\b/i;
  const finiteVerbCheck = finiteVerbPresent.test(normalized);

  return { subjectPresent, finiteVerbPresent: finiteVerbCheck };
}

function detectModalityAndHedges(text = '') {
  const normalized = normalizeText(text).toLowerCase();

  let modality = 'indicative';
  if (/\b(?:would|could|might|may|should|must|can)\b/.test(normalized)) {
    modality = 'modal';
  } else if (/\b(?:might|may|could)\b/.test(normalized)) {
    modality = 'conditional';
  }

  const hedgeMarkers = [];
  const hedgePatterns = [
    { pattern: /\b(?:maybe|perhaps|possibly|arguably|apparently|sort\s+of|kind\s+of|somewhat|rather|quite|somewhat)\b/gi, hedge: 'uncertainty' },
    { pattern: /\b(?:honestly|frankly|to\s+be\s+honest|i\s+think|i\s+guess|i\s+mean|in\s+my\s+opinion)\b/gi, hedge: 'stance' },
    { pattern: /\b(?:just|simply|merely|only|barely|hardly|scarcely)\b/gi, hedge: 'minimization' },
    { pattern: /\b(?:really|very|quite|rather|definitely|certainly|absolutely)\b/gi, hedge: 'intensification' }
  ];

  for (const { pattern, hedge } of hedgePatterns) {
    if (pattern.test(normalized)) {
      hedgeMarkers.push(hedge);
    }
  }

  const polarity = /\b(?:not|no|never|neither|nor|cannot|can't|won't|don't|didn't|isn't|aren't|wasn't|weren't|shouldn't|wouldn't|couldn't|mustn't|hasn't|haven't|hadn't)\b/i.test(text)
    ? 'negative'
    : 'positive';

  return { modality, hedgeMarkers: [...new Set(hedgeMarkers)], polarity };
}

function detectTenseAspect(text = '') {
  const normalized = normalizeText(text).toLowerCase();

  if (/\b(?:had|has|have)\s+\w+ed\b/.test(normalized)) {
    return 'perfect';
  }

  if (/\b(?:was|were|am|is|are)\s+\w+ing\b/.test(normalized)) {
    return 'progressive';
  }

  if (/\b(?:will|would|shall|should|won't|can't|cannot|couldn't|shouldn't|wouldn't|i'll|we'll|you'll|they'll|he'll|she'll|it'll)\b/.test(normalized)) {
    return 'future-modal';
  }

  if (/\b\w+ed\b/.test(normalized)) {
    return 'past';
  }

  return 'present';
}

function extractClauseSemanticScaffold(text = '') {
  const tokens = tokenize(text);
  const actorMatch = normalizeText(text).match(/\b(?:I|we|you|they|he|she|it|there|this|that|the\s+\w+|a\s+\w+|an\s+\w+)\b/i);
  const actor = actorMatch ? actorMatch[0] : '';
  const lexicalActionMatch = normalizeText(text).match(/\b(?:go|goes|went|get|gets|got|keep|keeps|kept|leave|leaves|left|remember|remembers|remembered|wait|waits|waited|pause|pauses|paused|grab|grabs|grabbed|bring|brings|brought|use|uses|used|pull|pulls|pulled|call|calls|called|contact|contacts|contacted|knock|knocks|knocked|lean|leans|leaned|change|changes|changed|say|says|said|tell|tells|told|ask|asks|asked|request|requests|requested|need|needs|needed|require|requires|required|show|shows|showed|check|checks|checked|review|reviews|reviewed|verify|verifies|verified|confirm|confirms|confirmed|shift|shifts|shifted|begin|begins|began|finish|finishes|finished|wrap|wraps|wrapped|conclude|concludes|concluded|come|comes|came|catch|catches|caught|deploy|deploys|deployed|head|heads|headed|circle|circles|circled|stall|stalls|stalled|provide|provides|provided|issue|issues|issued|find|finds|found|locate|locates|located|identify|identifies|identified|book|books|booked|schedule|schedules|scheduled|send|sends|sent|forward|forwards|forwarded|transmit|transmits|transmitted|fix|fixes|fixed|resolve|resolves|resolved|move|moves|moved|relocate|relocates|relocated|transfer|transfers|transferred|match|matches|matched|align|aligns|aligned|log|logs|logged|flag|flags|flagged|release|releases|released)\b/i);
  const auxiliaryActionMatch = normalizeText(text).match(/\b(?:am|is|are|was|were|be|been|being|do|does|did|have|has|had|will|would|can|could|may|might|must)\b/i);
  const actionMatch = lexicalActionMatch || auxiliaryActionMatch;
  const action = actionMatch ? actionMatch[0] : '';
  const actionIndex = actionMatch ? Math.max(0, tokens.indexOf(action.toLowerCase())) : -1;
  const object = actionIndex >= 0
    ? tokens
      .slice(actionIndex + 1)
      .filter((word) => !HEDGE_MARKERS.has(word) && !CONTENT_STOP_WORDS.has(word))
      .slice(0, 5)
      .join(' ')
    : '';
  const modifiers = tokens.filter((word) =>
    MODIFIER_MARKERS.has(word) ||
    /(?:ly|ive|ous|al|ful|less|able|ible|ish|ic)$/i.test(word)
  );
  const propositionHead = action || tokens.find((word) => !CONTENT_STOP_WORDS.has(word)) || '';

  return {
    propositionHead,
    actor,
    action,
    object,
    modifiers,
    tenseAspect: detectTenseAspect(text)
  };
}

export function buildOpportunityProfileFromIR(ir) {
  // Enhanced opportunity profile from IR structure
  const profile = buildOpportunityProfile(ir.sourceText);

  // Add IR-based opportunities
  profile.irClauseBoundaries = ir.metadata.clauseCount;
  profile.irSentenceCount = ir.metadata.sentenceCount;
  profile.irClauses = ir.sentences.filter(s => s.clauses.length > 1).length;

  return profile;
}

function preferredRegisterMode(targetProfile = {}, currentProfile = {}) {
  const targetMode = detectRegisterMode(targetProfile);
  const currentMode = detectRegisterMode(currentProfile);

  if (targetMode !== currentMode) {
    return targetMode;
  }

  if (
    (targetProfile.abbreviationDensity || 0) > ((currentProfile.abbreviationDensity || 0) + 0.03) ||
    (targetProfile.orthographicLooseness || 0) > ((currentProfile.orthographicLooseness || 0) + 0.05) ||
    (targetProfile.fragmentPressure || 0) > ((currentProfile.fragmentPressure || 0) + 0.06)
  ) {
    return 'compressed';
  }

  if ((targetProfile.conversationalPosture || 0) > ((currentProfile.conversationalPosture || 0) + 0.05)) {
    return 'conversational';
  }

  if ((targetProfile.directness || 0) > (currentProfile.directness || 0) + 0.04) {
    return 'operational';
  }

  if ((targetProfile.abstractionPosture || 0) > (currentProfile.abstractionPosture || 0) + 0.06) {
    return 'reflective';
  }

  if ((targetProfile.latinatePreference || 0) > (currentProfile.latinatePreference || 0) + 0.05) {
    return 'formal';
  }

  return targetMode;
}

function applyShorthandRealizationTexture(text = '', currentProfile = {}, targetProfile = {}, strength = 0.76) {
  const mode = preferredRegisterMode(targetProfile, currentProfile);
  const wantsCompression =
    mode === 'compressed' ||
    (targetProfile.abbreviationDensity || 0) > ((currentProfile.abbreviationDensity || 0) + 0.03);
  const wantsExpansion =
    mode === 'formal' ||
    mode === 'reflective' ||
    (
      mode === 'plain' &&
      (targetProfile.abbreviationDensity || 0) <= ((currentProfile.abbreviationDensity || 0) + 0.01)
    );
  const maxPacks = Math.max(2, Math.min(SHORTHAND_REALIZATION_PACKS.length, Math.round(2 + (strength * 5))));
  let result = text;
  let applied = 0;

  if (!wantsCompression && !wantsExpansion) {
    return result;
  }

  for (const pack of SHORTHAND_REALIZATION_PACKS) {
    if (applied >= maxPacks) {
      break;
    }

    const replacement = wantsExpansion ? pack.formal : pack.operational;
    if (!replacement) {
      continue;
    }

    const next = replaceLimited(result, pack.pattern, (match) => matchCase(match, replacement), 1);
    if (next !== result) {
      result = next;
      applied += 1;
    }
  }

  return result;
}

function applyPhraseRealizationPacks(text = '', currentProfile = {}, targetProfile = {}, strength = 0.76) {
  let result = text;
  const mode = preferredRegisterMode(targetProfile, currentProfile);
  const surfaceHeavyTarget =
    (targetProfile.abbreviationDensity || 0) >= 0.08 ||
    (targetProfile.orthographicLooseness || 0) >= 0.14 ||
    mode === 'compressed';
  const maxPacks = surfaceHeavyTarget
    ? 0
    : Math.max(1, Math.min(PHRASE_REALIZATION_PACKS.length, Math.round(1 + (strength * 3))));
  let applied = 0;

  for (const pack of PHRASE_REALIZATION_PACKS) {
    if (applied >= maxPacks) {
      break;
    }

    const replacement = pack.replacements[mode] || pack.replacements.plain;
    if (!replacement) {
      continue;
    }

    const next = replaceLimited(result, pack.pattern, (match) => matchCase(match, replacement), 1);
    if (next !== result) {
      result = next;
      applied += 1;
    }
  }

  return result;
}

const DONOR_SURFACE_PACKS = [
  { key: 'pls', expandedPattern: /\bplease\b/gi, compressed: 'pls' },
  { key: 'bc', expandedPattern: /\bbecause\b/gi, compressed: 'bc' },
  { key: 'wSlash', expandedPattern: /\bwith\b/gi, compressed: 'w/' },
  { key: 'woSlash', expandedPattern: /\bwithout\b/gi, compressed: 'w/o' },
  { key: 'thru', expandedPattern: /\bthrough\b/gi, compressed: 'thru' },
  { key: 'tmrw', expandedPattern: /\btomorrow\b/gi, compressed: 'tmrw' },
  { key: 'acct', expandedPattern: /\baccount\b/gi, compressed: 'acct' },
  { key: 'pkg', expandedPattern: /\bpackage\b/gi, compressed: 'pkg' },
  { key: 'appt', expandedPattern: /\bappointment\b/gi, compressed: 'appt' },
  { key: 'mgmt', expandedPattern: /\bmanagement\b/gi, compressed: 'mgmt' },
  { key: 'wk', expandedPattern: /\bweek\b/gi, compressed: 'wk' },
  { key: 'msg', expandedPattern: /\bmessage\b/gi, compressed: 'msg' },
  { key: 'ref', expandedPattern: /\breferral\b/gi, compressed: 'ref' }
];

function loosenApostrophes(text = '', limit = 3) {
  const packs = [
    { pattern: /\byou['’]re\b/gi, replacement: 'youre' },
    { pattern: /\bdon['’]t\b/gi, replacement: 'dont' },
    { pattern: /\bcan['’]t\b/gi, replacement: 'cant' },
    { pattern: /\bwon['’]t\b/gi, replacement: 'wont' },
    { pattern: /\bwasn['’]t\b/gi, replacement: 'wasnt' },
    { pattern: /\bdidn['’]t\b/gi, replacement: 'didnt' },
    { pattern: /\bcouldn['’]t\b/gi, replacement: 'couldnt' },
    { pattern: /\bshouldn['’]t\b/gi, replacement: 'shouldnt' },
    { pattern: /\bI['’]m\b/gi, replacement: 'im' },
    { pattern: /\bI['’]ve\b/gi, replacement: 'ive' },
    { pattern: /\bI['’]ll\b/gi, replacement: 'ill' },
    { pattern: /\bthat['’]s\b/gi, replacement: 'thats' }
  ];
  let result = text;
  let applied = 0;

  for (const pack of packs) {
    if (applied >= limit) {
      break;
    }
    const next = replaceLimited(result, pack.pattern, (match) => matchCase(match, pack.replacement), 1);
    if (next !== result) {
      result = next;
      applied += 1;
    }
  }

  return result;
}

function loosenSentenceStarts(text = '', limit = 3) {
  let applied = 0;
  return text.replace(/(^|[.!?]\s+|\n+)([A-Z][a-z]+)/g, (match, prefix, word) => {
    if (applied >= limit || /^I(?:\b|$)/.test(word)) {
      return match;
    }
    applied += 1;
    return `${prefix}${word.charAt(0).toLowerCase()}${word.slice(1)}`;
  });
}

function applyDonorSurfaceTexture(text = '', currentProfile = {}, targetProfile = {}, strength = 0.76) {
  let result = text;
  const mode = preferredRegisterMode(targetProfile, currentProfile);
  const currentMarkers = currentProfile.surfaceMarkerProfile || {};
  const targetMarkers = targetProfile.surfaceMarkerProfile || {};
  const wantsCompressedSurface =
    mode === 'compressed' ||
    (targetProfile.abbreviationDensity || 0) > ((currentProfile.abbreviationDensity || 0) + 0.03) ||
    (targetProfile.orthographicLooseness || 0) > ((currentProfile.orthographicLooseness || 0) + 0.05);
  const wantsExpandedSurface =
    mode === 'formal' ||
    mode === 'reflective' ||
    (
      (targetProfile.abbreviationDensity || 0) + (targetProfile.orthographicLooseness || 0) + 0.03 <
      (currentProfile.abbreviationDensity || 0) + (currentProfile.orthographicLooseness || 0)
    );

  if (wantsCompressedSurface) {
    const maxSurfacePacks = Math.max(2, Math.min(DONOR_SURFACE_PACKS.length, Math.round(2 + (strength * 4))));
    let applied = 0;

    for (const pack of DONOR_SURFACE_PACKS) {
      if (applied >= maxSurfacePacks) {
        break;
      }

      const wantsMarker =
        (targetMarkers[pack.key] || 0) > (currentMarkers[pack.key] || 0) ||
        (targetProfile.abbreviationDensity || 0) > ((currentProfile.abbreviationDensity || 0) + 0.05);
      if (!wantsMarker) {
        continue;
      }

      const next = replaceLimited(result, pack.expandedPattern, (match) => matchCase(match, pack.compressed), 1);
      if (next !== result) {
        result = next;
        applied += 1;
      }
    }

    if ((targetProfile.orthographicLooseness || 0) > ((currentProfile.orthographicLooseness || 0) + 0.04)) {
      result = loosenApostrophes(result, Math.max(2, Math.round(2 + (strength * 2))));
    }

    if (
      (targetMarkers.plusList || 0) > (currentMarkers.plusList || 0) ||
      (
        (targetProfile.fragmentPressure || 0) > ((currentProfile.fragmentPressure || 0) + 0.05) &&
        (targetProfile.abbreviationDensity || 0) > ((currentProfile.abbreviationDensity || 0) + 0.02)
      )
    ) {
      result = replaceLimited(
        result,
        /\b([A-Za-z][A-Za-z'-]{2,})\s+and\s+([A-Za-z][A-Za-z'-]{2,})(?=[,.;!?]|$)/g,
        (match, left, right) => `${left} + ${right}`,
        1
      );
    }

    if ((targetProfile.orthographicLooseness || 0) > ((currentProfile.orthographicLooseness || 0) + 0.07)) {
      result = loosenSentenceStarts(result, 2);
    }

    return result;
  }

  if (wantsExpandedSurface) {
    result = applyShorthandRealizationTexture(result, currentProfile, {
      ...targetProfile,
      abbreviationDensity: 0,
      orthographicLooseness: 0
    }, strength);
  }

  return result;
}

function preferredFamilySurface(family, formKey, mode = 'plain') {
  return family.forms?.[mode]?.[formKey] || family.forms?.plain?.[formKey] || '';
}

function applyLexicalFamilyRealization(text = '', currentProfile = {}, targetProfile = {}, strength = 0.76, options = {}) {
  let result = text;
  const mode = preferredRegisterMode(targetProfile, currentProfile);
  const maxFamilies = Math.max(1, Math.min(6, Math.round(2 + (strength * 4))));
  const disabledFamilyIds = new Set([
    ...DISABLED_LEXICAL_FAMILY_IDS,
    ...(options?.disabledLexicalFamilies || [])
  ]);
  let applied = 0;

  for (const family of LEXICAL_FAMILIES) {
    if (disabledFamilyIds.has(family.id)) {
      continue;
    }

    if (applied >= maxFamilies) {
      break;
    }

    const preferredForms = family.forms?.[mode] || family.forms?.plain || {};
    const familyVariants = FAMILY_VARIANT_INDEX.filter((entry) => entry.familyId === family.id);
    let swapped = false;

    for (const entry of familyVariants) {
      const preferredSurface = preferredForms[entry.formKey] || family.forms?.plain?.[entry.formKey];
      if (!preferredSurface || preferredSurface.toLowerCase() === entry.normalized) {
        continue;
      }

      const pattern = new RegExp(`\\b${escapeRegex(entry.surface)}\\b`, 'gi');
      const skipPatterns = LEXICAL_FAMILY_SKIP_PATTERNS[family.id] || [];
      let replaced = false;
      const next = result.replace(pattern, (match, offset, fullText) => {
        if (replaced) {
          return match;
        }

        const context = fullText.slice(Math.max(0, offset - 32), Math.min(fullText.length, offset + match.length + 32));
        if (skipPatterns.some((candidate) => candidate.test(context))) {
          return match;
        }

        replaced = true;
        return matchCase(match, preferredSurface);
      });
      if (next !== result) {
        result = next;
        applied += 1;
        swapped = true;
        break;
      }
    }

    if (swapped && applied >= maxFamilies) {
      break;
    }
  }

  return result;
}

function applyRegisterFramingTexture(text = '', currentProfile = {}, targetProfile = {}, strength = 0.76, options = {}) {
  const mode = preferredRegisterMode(targetProfile, currentProfile);
  const wantsLonger = (targetProfile.avgSentenceLength || 0) > ((currentProfile.avgSentenceLength || 0) + 0.6);
  const wantsShorter = (targetProfile.avgSentenceLength || 0) < ((currentProfile.avgSentenceLength || 0) - 0.8);
  const sharpensDirectness = (targetProfile.directness || 0) > ((currentProfile.directness || 0) + 0.08);
  const softensDirectness = (targetProfile.directness || 0) < ((currentProfile.directness || 0) - 0.08);
  let result = text;
  result = result.replace(/^\s*hey[,.]?\s+/i, '');

  if (mode !== 'compressed') {
    result = result.replace(/\s+\+\s+/g, ', ').replace(/\s+\/\s+/g, '; ');
  }

  if ((targetProfile.contractionDensity || 0) > ((currentProfile.contractionDensity || 0) + 0.01) || wantsShorter || sharpensDirectness) {
    result = result
      .replace(/\bdo not\b/gi, "don't")
      .replace(/\bcould not\b/gi, "couldn't")
      .replace(/\bwas not\b/gi, "wasn't")
      .replace(/\bdid not\b/gi, "didn't")
      .replace(/\bI am\b/gi, "I'm");
  }

  if (wantsLonger || softensDirectness) {
    result = result.replace(/\.\s+So\s+/g, ', so ');
    result = result.replace(/\.\s+And\s+I\b/g, ', and I');
    result = result.replace(/\.\s+I\s+(am|was|will|would|should|could|can|have|had|probably)\b/g, ', and I $1');
  }

  if ((targetProfile.hedgeDensity || 0) > (currentProfile.hedgeDensity || 0) + 0.02) {
    const hasLeadHedge = /^\s*(?:honestly|apparently|maybe|perhaps|frankly)\b/i.test(result);
    if (!hasLeadHedge) {
      result = result.replace(/^([A-Z])/m, (match) => `Apparently, ${match.toLowerCase()}`);
    }
  }

  if (mode === 'reflective') {
    result = replaceLimited(result, /\bI keep telling the story\b/gi, (match) => matchCase(match, 'I keep recounting the account'), 1);
    result = replaceLimited(result, /\bIt was not one mistake\b/gi, (match) => matchCase(match, 'It was not a single error'), 1);
    result = replaceLimited(result, /\bone more\b/gi, (match) => matchCase(match, 'another'), 2);
    result = replaceLimited(result, /\bthe rest of it\b/gi, (match) => matchCase(match, 'the remainder'), 1);
    result = replaceLimited(result, /\bI know that pattern\b/gi, (match) => matchCase(match, 'I recognize that pattern'), 1);
  }

  if (mode === 'formal') {
    result = replaceLimited(result, /\bI keep telling the story\b/gi, (match) => matchCase(match, 'I continue to recount the matter'), 1);
    result = replaceLimited(result, /\bIt was not one mistake\b/gi, (match) => matchCase(match, 'This was not a single error'), 1);
    result = replaceLimited(result, /\bone more\b/gi, (match) => matchCase(match, 'an additional'), Math.max(1, Math.round(strength * 2)));
    result = replaceLimited(result, /\bthe rest of it\b/gi, (match) => matchCase(match, 'the remainder'), 1);
    result = replaceLimited(result, /\bI know that pattern\b/gi, (match) => matchCase(match, 'I recognize that pattern'), 1);
    result = replaceLimited(result, /\bno motel stock left\b/gi, (match) => matchCase(match, 'motel placement was unavailable'), 1);
    result = replaceLimited(result, /\bfood tonight\b/gi, (match) => matchCase(match, 'same-night food support'), 1);
    result = replaceLimited(result, /\bkinda matches\b/gi, (match) => matchCase(match, 'partially matched'), 1);
    result = replaceLimited(result, /\bnot saying no\b/gi, (match) => matchCase(match, 'this is not a denial'), 1);
    result = replaceLimited(result, /\bdon['’]?t want (?:the )?case split twice\b/gi, (match) => matchCase(match, 'the case should not be split twice'), 1);
  }

  return result;
}

function applyVoiceRealizationTexture(text = '', currentProfile = {}, targetProfile = {}, strength = 0.76, options = {}) {
  let result = text;
  result = applyShorthandRealizationTexture(result, currentProfile, targetProfile, strength);
  result = applyPhraseRealizationPacks(result, currentProfile, targetProfile, strength);
  result = applyLexicalFamilyRealization(result, currentProfile, targetProfile, strength, options);
  result = applyRegisterFramingTexture(result, currentProfile, targetProfile, strength, options);
  result = applyDonorSurfaceTexture(result, currentProfile, targetProfile, strength);
  return result;
}

// ============================================================================
// Operator Library - IR-aware Text Transformations
// ============================================================================

const PATHOLOGY_TYPES = {
  PATH_CONNECTOR_STACK: 'PATH_CONNECTOR_STACK',
  PATH_ADDITIVE_COLLAPSE: 'PATH_ADDITIVE_COLLAPSE',
  PATH_FRAGMENT_ORPHAN: 'PATH_FRAGMENT_ORPHAN',
  PATH_DUPLICATE_CHUNK: 'PATH_DUPLICATE_CHUNK',
  PATH_LITERAL_LEAK: 'PATH_LITERAL_LEAK',
  PATH_SEMANTIC_ROLE_DRIFT: 'PATH_SEMANTIC_ROLE_DRIFT'
};

function detectPathologies(candidateText, sourceText, targetProfile, opportunityProfile) {
  const pathologies = [];

  // Check for banned connector stacks
  if (/(though\s+if|honestly[,;]\s+and|but\s+because|and\s+though\s+if)/gi.test(candidateText)) {
    pathologies.push({ type: PATHOLOGY_TYPES.PATH_CONNECTOR_STACK, detail: 'Banned connector sequence' });
  }

  // Check for duplicate sentence chunks
  if (hasDuplicateSentenceChunks(candidateText)) {
    pathologies.push({ type: PATHOLOGY_TYPES.PATH_DUPLICATE_CHUNK, detail: 'Duplicate sentence detected' });
  }

  // Check for unresolved placeholders
  const unresolvedCount = unresolvedProtectedLiteralCount(candidateText);
  if (unresolvedCount > 0) {
    pathologies.push({ type: PATHOLOGY_TYPES.PATH_LITERAL_LEAK, detail: `${unresolvedCount} unresolved literals` });
  }

  // Check for orphan fragments
  const sentences = sentenceSplit(candidateText);
  for (let i = 0; i < sentences.length; i += 1) {
    const sentence = sentences[i].toLowerCase().trim();
    if (/^(?:and|but|so|then|because|since|when|while|though|although)\b/.test(sentence) && i > 0) {
      // Check if it's a real clause or orphaned
      if (!/\b(?:is|was|are|were|be|been|do|does|did|will|would|can|could|have|has|had)\b/.test(sentence)) {
        pathologies.push({ type: PATHOLOGY_TYPES.PATH_FRAGMENT_ORPHAN, detail: `Orphaned connector: "${sentence.slice(0, 30)}"` });
      }
    }
  }

  return pathologies;
}

// Compression operators
function opSplitTrailingClarifier(text, ir, targetProfile) {
  // Split "text, which is X" → "text. Which is X" if beneficial
  if (!/,\s+(?:which|that)\s+is\b/i.test(text)) {
    return text;
  }

  const targetWords = targetProfile.functionWordProfile || {};
  const currentWords = functionWordProfile(text);
  const shouldSplit = (targetWords.which || 0) > (currentWords.which || 0) + 0.001;

  if (!shouldSplit) {
    return text;
  }

  return replaceLimited(text, /,\s+(?:which|that)\s+is\b/gi, (match) => '. Which is ', 1);
}

function opCompactCausalFrame(text, ir, targetProfile) {
  // "because every time X" → "when X"
  if (!/because\s+every\s+time\b/i.test(text)) {
    return text;
  }

  return replaceLimited(text, /\bbecause\s+every\s+time\b/gi, (match) => matchCase(match, 'when'), 1);
}

function opCompactTemporalFrame(text, ir, targetProfile) {
  // "by the time X, I had Y" → "by the time X, I'd Y"
  if (!/by\s+the\s+time\b.*,\s+I\s+had\b/i.test(text)) {
    return text;
  }

  return replaceLimited(text, /,\s+I\s+had\b/gi, (match) => `, I'd`, 1);
}

function opCompactAuxiliary(text, targetProfile) {
  return applyContractionTexture(text, targetProfile, { cont: 1 });
}

function opPromoteAndSplit(text, ir, targetProfile) {
  // If there's a semicolon, try to split it
  if (!text.includes(';')) {
    return text;
  }

  return text.replace(/;\s+/g, '. ');
}

function opDropResumptiveLead(text, ir, targetProfile) {
  // Remove surplus hedges at sentence start
  return replaceLimited(text, /^\s*(?:honestly|apparently|frankly|basically)[,;]?\s+/gm, '', 1);
}

// Expansion operators
function opMergeByRelation(text, ir, targetProfile, mod) {
  return mergeSentencePairs(text, targetProfile, 0.8, mod, null);
}

function opDemoteToSubordinate(text, ir, targetProfile) {
  // Convert "X. Because Y." → "X because Y."
  const sentences = sentenceSplit(text);
  if (sentences.length < 2) {
    return text;
  }

  let result = text;
  for (let i = 0; i < sentences.length - 1; i += 1) {
    const nextSent = sentences[i + 1].toLowerCase();
    if (/^(?:because|since|when|while|if)\b/.test(nextSent)) {
      const first = stripTerminalPunctuation(sentences[i]);
      const second = sentences[i + 1];
      const merged = `${first}, ${decapitalizeSentenceLead(second)}`;
      result = result.replace(
        new RegExp(escapeRegex(sentences[i]) + `\\s+${escapeRegex(sentences[i + 1])}`),
        merged
      );
      break;
    }
  }

  return result;
}

function opInsertResumptive(text, ir, targetProfile) {
  // Add hedge at clause boundary
  const sentences = sentenceSplit(text);
  if (sentences.length < 1) {
    return text;
  }

  const targetWords = targetProfile.functionWordProfile || {};
  if ((targetWords.apparently || 0) < 0.002) {
    return text;
  }

  return replaceLimited(text, /^([A-Z])/gm, (match) => `Apparently, ${match.toLowerCase()}`, 1);
}

function opExpandClarifier(text, ir, targetProfile) {
  // "that's" → "which is"
  return replaceLimited(text, /\bthat's\b/gi, (match) => matchCase(match, "which is"), 1);
}

function opExpandTemporalLink(text, ir) {
  // Add temporal connectors
  return replaceLimited(text, /\bwhen\b/gi, (match) => matchCase(match, 'by the time'), 1);
}

function opExpandCausalLink(text, ir) {
  // Add causal connectors
  return replaceLimited(text, /\bso\b/gi, (match) => matchCase(match, 'because of that'), 1);
}

// Connector operators
function opSwapConnectorFamily(text, ir, targetProfile, connectorProfile) {
  return applyFunctionWordTexture(text, targetProfile, 0.76, connectorProfile, null);
}

// Hedge/stance operators
function opRepositionHedge(text, ir, targetProfile) {
  const targetWords = targetProfile.functionWordProfile || {};
  const currentWords = functionWordProfile(text);

  if ((targetWords.honestly || 0) > (currentWords.honestly || 0) + 0.001) {
    return replaceLimited(text, /,?\s+honestly\b/gi, '', 1) || text;
  }

  return text;
}

function opCompactHedge(text) {
  return replaceLimited(text, /\bto\s+be\s+honest\b/gi, (match) => matchCase(match, 'honestly'), 2);
}

function opExpandHedge(text) {
  return replaceLimited(text, /\bhonestly\b/gi, (match) => matchCase(match, 'to be honest'), 1);
}

// ============================================================================
// IR-based Transfer Planning and Beam Search
// ============================================================================

export function buildTransferPlanFromIR(ir, sourceProfile, targetProfile, strength, opportunityProfile) {
  const irPlan = buildTransferPlan({
    sourceProfile,
    targetProfile,
    targetGap: profileDeltaToTarget(sourceProfile, targetProfile),
    opportunityProfile,
    effectiveMod: {},
    strength
  });

  return {
    transferMode: irPlan.limitedOpportunity ? 'weak' : (irPlan.wantsShorter ? 'compress' : irPlan.wantsLonger ? 'expand' : 'rebalance'),
    structuralGoals: {
      sentenceCountDelta: (targetProfile.sentenceCount || 0) - (sourceProfile.sentenceCount || 0),
      avgSentenceDelta: (targetProfile.avgSentenceLength || 0) - (sourceProfile.avgSentenceLength || 0)
    },
    discourseGoals: {
      contractionDelta: (targetProfile.contractionDensity || 0) - (sourceProfile.contractionDensity || 0),
      hedgeDelta: (targetProfile.hedgeDensity || 0) - (sourceProfile.hedgeDensity || 0)
    },
    registerGoals: {
      contentWordComplexityDelta: (targetProfile.contentWordComplexity || 0) - (sourceProfile.contentWordComplexity || 0),
      modifierDensityDelta: (targetProfile.modifierDensity || 0) - (sourceProfile.modifierDensity || 0),
      directnessDelta: (targetProfile.directness || 0) - (sourceProfile.directness || 0),
      abstractionDelta: (targetProfile.abstractionPosture || 0.5) - (sourceProfile.abstractionPosture || 0.5),
      latinateDelta: (targetProfile.latinatePreference || 0) - (sourceProfile.latinatePreference || 0),
      registerMode: detectRegisterMode(targetProfile)
    },
    operationBudget: {
      splitSentence: irPlan.splitCount || 0,
      mergeSentence: irPlan.mergeCount || 0,
      swapConnector: (opportunityProfile.connector || 0) > 0 ? 2 : 0,
      applyHedge: (opportunityProfile.resumptive || 0) > 0 ? 2 : 0,
      realizeLexicon: Math.max(1, Math.round(2 + (strength * 3)))
    },
    dominantRelation: irPlan.dominantRelation,
    relationInventory: irPlan.relationInventory,
    wantsShorter: irPlan.wantsShorter,
    wantsLonger: irPlan.wantsLonger,
    limitedOpportunity: irPlan.limitedOpportunity,
    weakCeiling: irPlan.limitedOpportunity
  };
}

export function beamSearchTransfer(ir, plan, sourceProfile, targetProfile, strength, protectedState, sourceText, mod, connectorProfile, debug) {
  const allCandidates = [];
  const needsContraction = Number(mod?.cont || 0) > 0;

  // Strategy 1: compression-first
  if (plan.wantsShorter) {
    let workText = ir.sourceText;
    workText = applySplitRules(workText, Math.max(1, plan.operationBudget.splitSentence || 1));
    workText = applyPhraseTexture(workText, sourceProfile, targetProfile, strength);
    workText = applyVoiceRealizationTexture(workText, sourceProfile, targetProfile, Math.min(1, strength + 0.16));
    if (needsContraction) workText = applyContractionTexture(workText, targetProfile, mod);
    allCandidates.push({
      text: workText,
      operationHistory: ['split-rules', 'phrase-texture', ...(needsContraction ? ['contraction'] : [])],
      pathologyFlags: detectPathologies(workText, sourceText, targetProfile, {})
    });
  }

  // Strategy 2: expansion-first
  if (plan.wantsLonger) {
    let workText = ir.sourceText;
    workText = mergeSentencePairs(workText, targetProfile, Math.min(1, strength + 0.06), mod, plan);
    workText = applyClauseTexture(workText, sourceProfile, targetProfile, strength, mod, plan);
    workText = applyVoiceRealizationTexture(workText, sourceProfile, targetProfile, Math.min(1, strength + 0.16));
    if (needsContraction) workText = applyContractionTexture(workText, targetProfile, mod);
    allCandidates.push({
      text: workText,
      operationHistory: ['merge-pairs', 'clause-texture', ...(needsContraction ? ['contraction'] : [])],
      pathologyFlags: detectPathologies(workText, sourceText, targetProfile, {})
    });
  }

  // Strategy 3: discourse-first
  let discourseText = ir.sourceText;
  discourseText = applyFunctionWordTexture(discourseText, targetProfile, strength, connectorProfile, plan);
  discourseText = applyStanceTexture(discourseText, targetProfile, strength, connectorProfile);
  discourseText = applyVoiceRealizationTexture(discourseText, sourceProfile, targetProfile, Math.min(1, strength + 0.12));
  if (needsContraction) discourseText = applyContractionTexture(discourseText, targetProfile, mod);
  allCandidates.push({
    text: discourseText,
    operationHistory: ['discourse-frame', 'stance-texture', ...(needsContraction ? ['contraction'] : [])],
    pathologyFlags: detectPathologies(discourseText, sourceText, targetProfile, {})
  });

  // Strategy 4: mixed-structural (baseline)
  let mixedText = ir.sourceText;
  mixedText = applyBaselineTransferFloor(mixedText, sourceProfile, targetProfile, Math.min(1, strength + 0.08), mod, connectorProfile, plan);
  mixedText = applyClauseTexture(mixedText, sourceProfile, targetProfile, Math.min(1, strength + 0.06), mod, plan);
  mixedText = applyVoiceRealizationTexture(mixedText, sourceProfile, targetProfile, Math.min(1, strength + 0.18));
  if (needsContraction) mixedText = applyContractionTexture(mixedText, targetProfile, mod);
  allCandidates.push({
    text: mixedText,
    operationHistory: ['baseline-floor', 'clause-texture', ...(needsContraction ? ['contraction'] : [])],
    pathologyFlags: detectPathologies(mixedText, sourceText, targetProfile, {})
  });

  // Strategy 5: conservative-structural (always apply contraction if mod says so)
  let conservText = ir.sourceText;
  // Ensure contraction is applied if mod.cont > 0
  if (needsContraction) {
    conservText = applyContractionTexture(conservText, targetProfile, mod);
  }
  conservText = applyVoiceRealizationTexture(conservText, sourceProfile, targetProfile, Math.min(1, strength + 0.1));
  conservText = applyPunctuationTexture(conservText, targetProfile, mod);
  allCandidates.push({
    text: conservText,
    operationHistory: ['contraction', 'punctuation'],
    pathologyFlags: detectPathologies(conservText, sourceText, targetProfile, {})
  });

  // Strategy 6: clarifier-heavy
  let clarifyText = ir.sourceText;
  clarifyText = opSplitTrailingClarifier(clarifyText, ir, targetProfile);
  clarifyText = applyDiscourseFrameTexture(clarifyText, sourceProfile, targetProfile, strength, plan);
  clarifyText = applyVoiceRealizationTexture(clarifyText, sourceProfile, targetProfile, Math.min(1, strength + 0.16));
  if (needsContraction) clarifyText = applyContractionTexture(clarifyText, targetProfile, mod);
  allCandidates.push({
    text: clarifyText,
    operationHistory: ['clarifier-split', 'discourse-frame', ...(needsContraction ? ['contraction'] : [])],
    pathologyFlags: detectPathologies(clarifyText, sourceText, targetProfile, {})
  });

  // Strategy 7: hedge-heavy
  let hedgeText = ir.sourceText;
  hedgeText = opInsertResumptive(hedgeText, ir, targetProfile);
  hedgeText = applyStanceTexture(hedgeText, targetProfile, strength, connectorProfile);
  hedgeText = applyVoiceRealizationTexture(hedgeText, sourceProfile, targetProfile, Math.min(1, strength + 0.16));
  if (needsContraction) hedgeText = applyContractionTexture(hedgeText, targetProfile, mod);
  allCandidates.push({
    text: hedgeText,
    operationHistory: ['resumptive-hedge', 'stance', ...(needsContraction ? ['contraction'] : [])],
    pathologyFlags: detectPathologies(hedgeText, sourceText, targetProfile, {})
  });

  // Strategy 8: contraction-heavy
  let contractionText = ir.sourceText;
  contractionText = applyContractionTexture(contractionText, targetProfile, { cont: 1 });
  contractionText = applyPhraseTexture(contractionText, sourceProfile, targetProfile, strength);
  contractionText = applyVoiceRealizationTexture(contractionText, sourceProfile, targetProfile, Math.min(1, strength + 0.18));
  allCandidates.push({
    text: contractionText,
    operationHistory: ['contraction', 'phrase-texture'],
    pathologyFlags: detectPathologies(contractionText, sourceText, targetProfile, {})
  });

  // Strategy 9: lexical-register-first
  let lexicalText = ir.sourceText;
  lexicalText = applyVoiceRealizationTexture(lexicalText, sourceProfile, targetProfile, Math.min(1, strength + 0.24));
  lexicalText = applyStanceTexture(lexicalText, targetProfile, strength, connectorProfile);
  if (needsContraction) lexicalText = applyContractionTexture(lexicalText, targetProfile, mod);
  allCandidates.push({
    text: lexicalText,
    operationHistory: ['voice-realization', 'stance-texture', ...(needsContraction ? ['contraction'] : [])],
    pathologyFlags: detectPathologies(lexicalText, sourceText, targetProfile, {})
  });

  // Ensure all candidates apply contractions if needed (final pass)
  const finalCandidates = allCandidates.map((candidate) => {
    let finalText = candidate.text;
    if (needsContraction) {
      finalText = applyContractionTexture(finalText, targetProfile, mod);
    }
    return {
      text: finalText,
      operationHistory: candidate.operationHistory,
      pathologyFlags: candidate.pathologyFlags
    };
  });

  // Score and filter candidates
  const scoredCandidates = finalCandidates.map((candidate) => {
    const candidateProfile = extractCadenceProfile(candidate.text);
    const donorVector = cadenceAxisVector(targetProfile);
    const outputVector = cadenceAxisVector(candidateProfile);
    const sourceFit = compareTexts('', '', {
      profileA: sourceProfile,
      profileB: targetProfile
    });
    const fit = compareTexts('', '', {
      profileA: candidateProfile,
      profileB: targetProfile
    });
    const donorImprovement = donorVector.reduce((sum, axis, idx) => {
      const outputAxis = outputVector[idx] || { normalized: 0 };
      const gap = Math.abs(axis.normalized - outputAxis.normalized);
      return sum + (1 - Math.min(1, gap));
    }, 0) / Math.max(donorVector.length, 1);

    const changedDims = collectChangedDimensions(sourceProfile, candidateProfile);
    const structDims = structuralDimensions(changedDims).length;
    const lexicalDims = lexicalDimensions(changedDims).length;
    const discDims = changedDims.filter((d) => !structuralDimensions([d]).length && !lexicalDimensions([d]).length).length;
    const readability = 1 - (candidateProfile.sentenceLengthSpread || 0) / 14;
    const pathologyPenalty = candidate.pathologyFlags.length * 35;
    const registerPenalty = (fit.registerDistance || 0) * 20;
    const registerProgress = Math.max(0, (sourceFit.registerDistance || 0) - (fit.registerDistance || 0));
    const sentenceProgress = Math.max(0, (sourceFit.sentenceDistance || 0) - (fit.sentenceDistance || 0));
    const lexemeSwapCount = detectLexemeSwaps(sourceText, candidate.text).length;
    const outputMode = detectRegisterMode(candidateProfile);
    const targetMode = detectRegisterMode(targetProfile);
    const materialRegisterGap =
      (sourceFit.registerDistance || 0) >= 0.11 ||
      (sourceFit.directnessDistance || 0) >= 0.08 ||
      (sourceFit.abstractionDistance || 0) >= 0.08;
    const materialSentenceGap = (sourceFit.sentenceDistance || 0) >= 6;

    const score =
      (donorImprovement * 34) +
      (structDims * 18) +
      (lexicalDims * 18) +
      (discDims * 10) +
      (readability * 6) +
      (registerProgress * 28) +
      (sentenceProgress * 18) +
      (lexemeSwapCount * 4) +
      (outputMode === targetMode ? 8 : 0) -
      pathologyPenalty -
      registerPenalty;

    const adjustedScore =
      (sourceFit.registerDistance || 0) >= 0.11 && lexicalDims === 0 && lexemeSwapCount === 0
        ? score - 24
        : score;

    const sentenceAwareScore =
      materialSentenceGap && structDims === 0
        ? adjustedScore - 18
        : adjustedScore;

    const finalScore =
      (materialRegisterGap || materialSentenceGap) &&
      (structDims + lexicalDims + discDims) < 2
        ? sentenceAwareScore - 24
        : sentenceAwareScore;

    return {
      text: candidate.text,
      score: finalScore,
      changedDimensions: changedDims,
      pathologyFlags: candidate.pathologyFlags,
      operationHistory: candidate.operationHistory
    };
  });

  // Return best candidate
  const best = scoredCandidates.sort((a, b) => b.score - a.score)[0] || {
    text: ir.sourceText,
    score: 0,
    changedDimensions: [],
    pathologyFlags: [],
    operationHistory: ['fallback-none']
  };

  return {
    bestCandidate: best,
    allCandidates: scoredCandidates.slice(0, 24)
  };
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
    shiftLexicon:
      (targetGap.register || 0) >= 0.11 ||
      (targetGap.directness || 0) >= 0.06 ||
      (targetGap.abstraction || 0) >= 0.08 ||
      (targetGap.modifierDensity || 0) >= 0.03 ||
      (targetGap.abbreviation || 0) >= 0.03 ||
      (targetGap.orthography || 0) >= 0.05 ||
      (targetGap.fragment || 0) >= 0.06 ||
      (targetGap.conversation || 0) >= 0.06 ||
      (targetGap.surfaceMarkers || 0) >= 0.08,
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

  if (transferPlan.shiftLexicon) {
    specs.push({
      name: 'lexical-register-heavy',
      splitBias: 0.9,
      mergeBias: 0.9,
      connectorBias: 1.15,
      frameBias: 1.1,
      lineBreakBias: 0.75,
      punctuationBias: 0.45,
      allowFallback: true
    });
  }

  return specs;
}

function additiveDriftState({
  sourceText = '',
  outputText = '',
  sourceProfile = {},
  outputProfile = {},
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
  const targetMode = detectRegisterMode(targetProfile);
  const outputMode = detectRegisterMode(outputProfile);
  const compressionLanded =
    ((sourceProfile.avgSentenceLength || 0) - (outputProfile.avgSentenceLength || 0)) >= 1.2 ||
    ((outputProfile.sentenceCount || 0) - (sourceProfile.sentenceCount || 0)) >= 1 ||
    ((outputProfile.contractionDensity || 0) - (sourceProfile.contractionDensity || 0)) >= 0.006;

  if (
    sourceStructuredRelations > 0 &&
    !additivePreferred &&
    (glueJoins >= 2 || addedAnd >= 2 || flattenedContrast) &&
    !(targetMode !== 'formal' && outputMode === targetMode && compressionLanded && glueJoins <= 2 && addedAnd <= 2)
  ) {
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
  sourceProfile = {},
  outputProfile = {},
  targetProfile = {},
  changedDimensions = [],
  passesApplied = [],
  targetProgressBias = false
}) {
  const fit = compareTexts('', '', {
    profileA: outputProfile,
    profileB: targetProfile
  });
  const nonPunctuationDimensions = changedDimensions.filter((dimension) => dimension !== 'punctuation-shape');
  const signalSource = normalizeText(sourceText).replace(/[.,!?;:'"()[\]{}]/g, ' ').replace(/\s+/g, ' ').trim();
  const signalOutput = normalizeText(outputText).replace(/[.,!?;:'"()[\]{}]/g, ' ').replace(/\s+/g, ' ').trim();
  const signalRewrite = Boolean(signalOutput) && signalOutput !== signalSource;
  const sentenceDelta = Math.abs(sentenceSplit(sourceText).length - sentenceSplit(outputText).length);
  const sourceSentenceDistance = Math.abs((sourceProfile.avgSentenceLength || 0) - (targetProfile.avgSentenceLength || 0));
  const outputSentenceDistance = Math.abs((outputProfile.avgSentenceLength || 0) - (targetProfile.avgSentenceLength || 0));
  const sourceSentenceCountDistance = Math.abs((sourceProfile.sentenceCount || 0) - (targetProfile.sentenceCount || 0));
  const outputSentenceCountDistance = Math.abs((outputProfile.sentenceCount || 0) - (targetProfile.sentenceCount || 0));
  const sentenceProgress = Math.max(0, sourceSentenceDistance - outputSentenceDistance);
  const sentenceCountProgress = Math.max(0, sourceSentenceCountDistance - outputSentenceCountDistance);
  const sentenceDriftPenalty = Math.max(0, outputSentenceDistance - sourceSentenceDistance);
  const sentenceCountDriftPenalty = Math.max(0, outputSentenceCountDistance - sourceSentenceCountDistance);
  const sentenceStartRewrite = normalizeSentenceStarts(sourceText) !== normalizeSentenceStarts(outputText);
  const targetGap = profileDeltaToTarget(sourceProfile, targetProfile);
  const materialRegisterGap =
    (targetGap.register || 0) >= 0.11 ||
    (targetGap.directness || 0) >= 0.08 ||
    (targetGap.abstraction || 0) >= 0.08 ||
    (targetGap.modifierDensity || 0) >= 0.03 ||
    (targetGap.lexicalComplexity || 0) >= 0.05 ||
    (targetGap.abbreviation || 0) >= 0.03 ||
    (targetGap.orthography || 0) >= 0.05 ||
    (targetGap.fragment || 0) >= 0.06 ||
    (targetGap.conversation || 0) >= 0.06 ||
    (targetGap.surfaceMarkers || 0) >= 0.08;
  const materialSentenceGap =
    (targetGap.avgSentence || 0) >= 6 ||
    (targetGap.sentenceCount || 0) >= 1;
  const registerProgress = Math.max(0, (targetGap.register || 0) - (fit.registerDistance || 0));
  const directnessProgress = Math.max(0, (targetGap.directness || 0) - (fit.directnessDistance || 0));
  const abstractionProgress = Math.max(0, (targetGap.abstraction || 0) - (fit.abstractionDistance || 0));
  const modifierProgress = Math.max(0, (targetGap.modifierDensity || 0) - (fit.modifierDensityDistance || 0));
  const lexicalComplexityProgress = Math.max(0, (targetGap.lexicalComplexity || 0) - (fit.contentWordComplexityDistance || 0));
  const abbreviationProgress = Math.max(0, (targetGap.abbreviation || 0) - (fit.abbreviationDistance || 0));
  const orthographyProgress = Math.max(0, (targetGap.orthography || 0) - (fit.orthographyDistance || 0));
  const fragmentProgress = Math.max(0, (targetGap.fragment || 0) - (fit.fragmentDistance || 0));
  const conversationProgress = Math.max(0, (targetGap.conversation || 0) - (fit.conversationDistance || 0));
  const surfaceProgress = Math.max(0, (targetGap.surfaceMarkers || 0) - (fit.surfaceMarkerDistance || 0));
  const lexemeSwapCount = detectLexemeSwaps(sourceText, outputText).length;
  const targetMode = detectRegisterMode(targetProfile);
  const sourceMode = detectRegisterMode(sourceProfile);
  const outputMode = detectRegisterMode(outputProfile);

  let score = quality.qualityGatePassed ? 80 : -30;
  score += structuralDimensions(changedDimensions).length * 16;
  score += lexicalDimensions(changedDimensions).length * 14;
  score += quality.nonPunctuationDimensions.length * 10;
  score += nonPunctuationDimensions.length * 6;
  score += hasMaterialStructuralTransfer(changedDimensions) ? 24 : 0;
  score += passesApplied.length * 1.5;
  score += signalRewrite ? 18 : 0;
  score += Math.min(28, registerProgress * 90);
  score += Math.min(16, (directnessProgress * 55) + (abstractionProgress * 55));
  score += Math.min(12, (modifierProgress * 48) + (lexicalComplexityProgress * 42));
  score += Math.min(14, (abbreviationProgress * 72) + (orthographyProgress * 54));
  score += Math.min(12, (fragmentProgress * 48) + (conversationProgress * 48) + (surfaceProgress * 36));
  score += Math.min(16, lexemeSwapCount * 4);
  score += targetMode !== sourceMode && outputMode === targetMode ? 14 : 0;
  if (targetProgressBias) {
    score += Math.min(24, sentenceProgress * 8);
    score += Math.min(12, sentenceCountProgress * 6);
    score += sentenceStartRewrite && (sentenceProgress > 0 || sentenceCountProgress > 0) ? 6 : 0;
  } else {
    score += Math.min(12, sentenceDelta * 4);
    score += sentenceStartRewrite ? 8 : 0;
  }
  score -= (fit.sentenceDistance || 0) * 12;
  score -= (fit.functionWordDistance || 0) * 22;
  score -= (fit.contractionDistance || 0) * 8;
  score -= (fit.registerDistance || 0) * 18;
  score -= (fit.directnessDistance || 0) * 8;
  score -= (fit.abstractionDistance || 0) * 8;
  score -= (fit.abbreviationDistance || 0) * 10;
  score -= (fit.orthographyDistance || 0) * 10;
  score -= (fit.fragmentDistance || 0) * 8;
  score -= (fit.conversationDistance || 0) * 8;
  score -= (fit.surfaceMarkerDistance || 0) * 6;
  score -= (fit.punctShapeDistance || 0) * 6;
  score -= (fit.punctDistance || 0) * 4;
  if (targetProgressBias) {
    score -= Math.min(20, sentenceDriftPenalty * 8);
    score -= Math.min(10, sentenceCountDriftPenalty * 5);
  }

  if (outputText === sourceText) {
    score -= 24;
  }

  if (outputText !== sourceText && !signalRewrite) {
    score -= 24;
  }

  if (outputText !== sourceText && nonPunctuationDimensions.length === 0) {
    score -= 28;
  }

  if (materialRegisterGap && lexicalDimensions(changedDimensions).length === 0 && lexemeSwapCount === 0) {
    score -= 34;
  }

  if ((targetGap.avgSentence || 0) >= 6 && !changedDimensions.some((dimension) => /^sentence-/.test(dimension))) {
    score -= 18;
  }

  if (targetProgressBias && materialRegisterGap && lexicalDimensions(changedDimensions).length < 1 && lexemeSwapCount < 1) {
    score -= 28;
  }

  if (targetProgressBias && materialSentenceGap && structuralDimensions(changedDimensions).length < 1) {
    score -= 22;
  }

  if (
    targetProgressBias &&
    (materialRegisterGap || materialSentenceGap) &&
    nonPunctuationDimensions.length < 2 &&
    lexicalDimensions(changedDimensions).length + structuralDimensions(changedDimensions).length < 2
  ) {
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
  const lexicalDimensionsChanged = lexicalDimensions(changedDimensions);
  const sourceFit = compareTexts('', '', {
    profileA: sourceProfile,
    profileB: targetProfile
  });
  const outputFit = compareTexts('', '', {
    profileA: outputProfile,
    profileB: targetProfile
  });
  const sourceMode = detectRegisterMode(sourceProfile);
  const targetMode = detectRegisterMode(targetProfile);
  const outputMode = detectRegisterMode(outputProfile);
  const registerProgress = Math.max(0, (sourceFit.registerDistance || 0) - (outputFit.registerDistance || 0));
  const functionWordProgress = Math.max(0, (sourceFit.functionWordDistance || 0) - (outputFit.functionWordDistance || 0));
  const directnessProgress = Math.max(0, (sourceFit.directnessDistance || 0) - (outputFit.directnessDistance || 0));
  const abstractionProgress = Math.max(0, (sourceFit.abstractionDistance || 0) - (outputFit.abstractionDistance || 0));
  const contractionProgress = Math.max(0, (sourceFit.contractionDistance || 0) - (outputFit.contractionDistance || 0));
  const abbreviationProgress = Math.max(0, (sourceFit.abbreviationDistance || 0) - (outputFit.abbreviationDistance || 0));
  const orthographyProgress = Math.max(0, (sourceFit.orthographyDistance || 0) - (outputFit.orthographyDistance || 0));
  const fragmentProgress = Math.max(0, (sourceFit.fragmentDistance || 0) - (outputFit.fragmentDistance || 0));
  const conversationProgress = Math.max(0, (sourceFit.conversationDistance || 0) - (outputFit.conversationDistance || 0));
  const surfaceProgress = Math.max(0, (sourceFit.surfaceMarkerDistance || 0) - (outputFit.surfaceMarkerDistance || 0));
  const stylisticRegisterLanding =
    lexicalDimensionsChanged.length >= 1 ||
    (targetMode !== sourceMode && outputMode === targetMode) ||
    registerProgress >= 0.015 ||
    functionWordProgress >= 0.025 ||
    contractionProgress >= 0.006 ||
    abbreviationProgress >= 0.015 ||
    orthographyProgress >= 0.02 ||
    fragmentProgress >= 0.02 ||
    conversationProgress >= 0.02 ||
    surfaceProgress >= 0.02 ||
    (directnessProgress + abstractionProgress) >= 0.025 ||
    changedDimensions.includes('connector-stance') ||
    changedDimensions.includes('contraction-posture');
  const materialLexicalGap =
    (targetGap.register || 0) >= 0.11 ||
    (targetGap.directness || 0) >= 0.06 ||
    (targetGap.abstraction || 0) >= 0.08 ||
    (targetGap.modifierDensity || 0) >= 0.03 ||
    (targetGap.lexicalComplexity || 0) >= 0.05 ||
    (targetGap.abbreviation || 0) >= 0.03 ||
    (targetGap.orthography || 0) >= 0.05 ||
    (targetGap.fragment || 0) >= 0.06 ||
    (targetGap.conversation || 0) >= 0.06 ||
    (targetGap.surfaceMarkers || 0) >= 0.08;

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

  // Hard pathology: banned connector stacks (Section 5)
  const BANNED_CONNECTOR_STACKS = [
    /\bthough\s+if\b/i,
    /\bhonestly[,;]?\s+and\b/i,
    /\bbut\s+because\b/i,
    /\band\s+though\s+if\b/i,
    /\bhonestly[;]\s+and\b/i
  ];
  for (const banned of BANNED_CONNECTOR_STACKS) {
    if (banned.test(outputText)) {
      notes.push(`Banned connector stack detected: ${banned.source}`);
    }
  }

  // Hard pathology: orphan fragments (sentences starting with lone connector, < 4 words)
  const outputChunks = sentenceChunks(outputText);
  for (const chunk of outputChunks) {
    const words = tokenize(chunk);
    if (words.length <= 3 && /^(though|but|and|so|yet|still)\b/i.test(chunk.trim())) {
      notes.push(`Orphan fragment detected: "${chunk.trim().substring(0, 40)}"`);
    }
  }

  if (outputText.length > transferLengthCeiling(sourceText, sourceProfile, targetProfile, 0.76)) {
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

  if (materialLexicalGap && !stylisticRegisterLanding) {
    notes.push('Transfer missed donor lexical/register realization.');
  }

  if (outputText === sourceText && materialGap && !limitedOpportunity) {
    notes.push('Material target gap remained unresolved.');
  }

  const additiveDrift = additiveDriftState({
    sourceText,
    outputText,
    sourceProfile,
    outputProfile,
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
    lexicalDimensions: lexicalDimensionsChanged,
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

function borrowedShellProgressAdmission({
  qualityNotes = [],
  changedDimensions = [],
  sourceProfile = {},
  outputProfile = {},
  targetProfile = {},
  protectedAnchorIntegrity = 1,
  semanticAudit = {},
  lexicalShiftProfile = {},
  visibleShift = false,
  nonTrivialShift = false
}) {
  const toleratedQualityNotes = qualityNotes.length > 0 &&
    qualityNotes.every((note) =>
      /Transfer missed donor lexical\/register realization\./i.test(note) ||
      /Structural opportunity existed but the current candidate collapsed into additive drift\./i.test(note)
    );
  const polarityTolerance = changedDimensions.includes('contraction-posture') ? 2 : 1;

  if (
    !toleratedQualityNotes ||
    borrowedShellPathologyBlocked(qualityNotes) ||
    !visibleShift ||
    !nonTrivialShift ||
    protectedAnchorIntegrity < 1 ||
    (semanticAudit.polarityMismatches ?? 0) > polarityTolerance
  ) {
    return {
      eligible: false,
      progressProfile: null
    };
  }

  const sourceFitToTarget = compareTexts('', '', {
    profileA: sourceProfile,
    profileB: targetProfile
  });
  const outputFitToTarget = compareTexts('', '', {
    profileA: outputProfile,
    profileB: targetProfile
  });
  const progressProfile = {
    structuralCount: borrowedShellStructuralDimensions(changedDimensions).length,
    lexicalCount: lexicalDimensions(changedDimensions).length,
    sentenceProgress: round3(Math.max(0, (sourceFitToTarget.sentenceDistance || 0) - (outputFitToTarget.sentenceDistance || 0))),
    functionWordProgress: round3(Math.max(0, (sourceFitToTarget.functionWordDistance || 0) - (outputFitToTarget.functionWordDistance || 0))),
    registerProgress: round3(Math.max(0, (sourceFitToTarget.registerDistance || 0) - (outputFitToTarget.registerDistance || 0))),
    directnessProgress: round3(Math.max(0, (sourceFitToTarget.directnessDistance || 0) - (outputFitToTarget.directnessDistance || 0))),
    abstractionProgress: round3(Math.max(0, (sourceFitToTarget.abstractionDistance || 0) - (outputFitToTarget.abstractionDistance || 0))),
    swapCount: Number(lexicalShiftProfile.swapCount || 0)
  };

  const structuralProgressLanded =
    progressProfile.structuralCount >= 1 &&
    (
      progressProfile.sentenceProgress >= 0.02 ||
      progressProfile.functionWordProgress >= 0.02
    );
  const registerProgressLanded =
    progressProfile.lexicalCount >= 1 ||
    progressProfile.swapCount >= 1 ||
    changedDimensions.includes('contraction-posture') ||
    changedDimensions.includes('connector-stance') ||
    progressProfile.registerProgress >= 0.015 ||
    progressProfile.functionWordProgress >= 0.03 ||
    (progressProfile.directnessProgress + progressProfile.abstractionProgress) >= 0.025;

  if (
    !structuralProgressLanded ||
    !registerProgressLanded
  ) {
    return {
      eligible: false,
      progressProfile
    };
  }

  return {
    eligible: true,
    progressProfile
  };
}

function borrowedShellPartialFallback({
  shell,
  bestCandidate,
  sourceText,
  sourceProfile,
  targetProfile,
  protectedState,
  ir
}) {
  if (!shell || shell.mode !== 'borrowed') {
    return { eligible: false };
  }

  if (!bestCandidate || !bestCandidate.outputText || bestCandidate.outputText === sourceText) {
    return { eligible: false };
  }

  const changedDimensions = Array.isArray(bestCandidate.changedDimensions) ? bestCandidate.changedDimensions : [];
  const qualityNotes = Array.isArray(bestCandidate.quality?.notes) ? bestCandidate.quality.notes : [];
  if (borrowedShellPathologyBlocked(qualityNotes)) {
    return { eligible: false };
  }

  const lexicalShiftProfile = buildLexicalShiftProfile(
    sourceText,
    bestCandidate.outputText,
    sourceProfile,
    targetProfile,
    bestCandidate.outputProfile
  );
  const visibleShift = hasBorrowedShellVisibleShift(
    sourceText,
    bestCandidate.outputText,
    changedDimensions,
    lexicalShiftProfile
  );
  const nonTrivialShift = hasBorrowedShellNonTrivialShift(
    sourceText,
    bestCandidate.outputText,
    changedDimensions,
    lexicalShiftProfile
  );

  if (!visibleShift || !nonTrivialShift) {
    return { eligible: false };
  }

  const {
    semanticAudit,
    protectedAnchorAudit,
    outputIR
  } = buildSemanticAuditBundle(ir, bestCandidate.outputText, protectedState);
  const protectedAnchorIntegrity =
    protectedAnchorAudit.protectedAnchorIntegrity ?? semanticAudit.protectedAnchorIntegrity ?? 1;

  if (
    protectedAnchorIntegrity < 1 ||
    (semanticAudit.propositionCoverage ?? 1) < 0.82 ||
    (semanticAudit.actionCoverage ?? 1) < 0.82 ||
    (semanticAudit.polarityMismatches ?? 0) > 0
  ) {
    const progressAdmission = borrowedShellProgressAdmission({
      qualityNotes,
      changedDimensions,
      sourceProfile,
      outputProfile: bestCandidate.outputProfile || extractCadenceProfile(bestCandidate.outputText),
      targetProfile,
      protectedAnchorIntegrity,
      semanticAudit,
      lexicalShiftProfile,
      visibleShift,
      nonTrivialShift
    });

    if (!progressAdmission.eligible) {
      return { eligible: false, progressProfile: progressAdmission.progressProfile };
    }

    return {
      eligible: true,
      relaxed: true,
      progressProfile: progressAdmission.progressProfile,
      lexicalShiftProfile,
      semanticAudit,
      protectedAnchorAudit,
      outputIR,
      visibleShift,
      nonTrivialShift
    };
  }

  return {
    eligible: true,
    relaxed: false,
    progressProfile: borrowedShellProgressAdmission({
      qualityNotes,
      changedDimensions,
      sourceProfile,
      outputProfile: bestCandidate.outputProfile || extractCadenceProfile(bestCandidate.outputText),
      targetProfile,
      protectedAnchorIntegrity,
      semanticAudit,
      lexicalShiftProfile,
      visibleShift,
      nonTrivialShift
    }).progressProfile,
    lexicalShiftProfile,
    semanticAudit,
    protectedAnchorAudit,
    outputIR,
    visibleShift,
    nonTrivialShift
  };
}

function borrowedShellRescueScore(candidate = {}, fallback = {}) {
  const changedDimensions = Array.isArray(candidate.changedDimensions) ? candidate.changedDimensions : [];
  const structuralCount = borrowedShellStructuralDimensions(changedDimensions).length;
  const lexicalCount = lexicalDimensions(changedDimensions).length;
  const swapCount = Number(fallback.lexicalShiftProfile?.swapCount || 0);
  const rescueCount = Array.isArray(candidate.rescuePasses) ? candidate.rescuePasses.length : 0;
  const notePenalty = Array.isArray(candidate.quality?.notes)
    ? candidate.quality.notes.filter((note) => /additive drift|lexical\/register realization/i.test(note)).length
    : 0;

  return (structuralCount * 24) +
    (lexicalCount * 18) +
    (swapCount * 10) +
    (rescueCount * 3) +
    (fallback.nonTrivialShift ? 8 : 0) +
    (fallback.visibleShift ? 4 : 0) -
    (notePenalty * 6);
}

function buildBorrowedShellOverlayCandidate({
  shell,
  sourceText = '',
  sourceProfile = {},
  targetProfile = {},
  targetGap = {},
  protectedState = { literals: [] },
  opportunityProfile = {},
  ir = {},
  variant = 'balanced'
}) {
  if (shell?.mode !== 'borrowed' || !sourceText) {
    return null;
  }

  const candidateStrength = clamp(Number(shell.strength ?? 0.82), 0, 1);
  const transferPlan = buildTransferPlanFromIR(
    ir,
    sourceProfile,
    targetProfile,
    candidateStrength,
    opportunityProfile
  );
  const baseMod = shell.mod || {};
  const candidateMod = {
    ...baseMod,
    sent: transferPlan.wantsShorter
      ? -Math.max(1, Math.round(Math.max(Math.abs(Number(baseMod.sent || 0)), 1)))
      : transferPlan.wantsLonger
        ? Math.max(1, Math.round(Math.max(Math.abs(Number(baseMod.sent || 0)), 1)))
        : Number(baseMod.sent || 0),
    cont: Number(baseMod.cont || 0),
    punc: Number(baseMod.punc || 0)
  };
  const connectorProfile = shell.profile || targetProfile;
  const voiceOptions = { allowPlainTargetCompression: true };
  let workingText = sourceText;
  const passesApplied = [];
  const rescuePasses = [];
  const maxLength = transferLengthCeiling(sourceText, sourceProfile, targetProfile, candidateStrength);
  const shouldStructure = variant !== 'conservative' && (
    transferPlan.shiftSentenceLength ||
    transferPlan.shiftSentenceCount ||
    transferPlan.wantsLonger ||
    transferPlan.wantsShorter
  );
  const voiceStrength =
    variant === 'conservative'
      ? Math.min(1, candidateStrength + 0.14)
      : variant === 'register'
        ? Math.min(1, candidateStrength + 0.24)
        : Math.min(1, candidateStrength + 0.28);
  const discourseStrength =
    variant === 'conservative'
      ? Math.min(1, candidateStrength + 0.14)
      : Math.min(1, candidateStrength + 0.2);
  const functionStrength =
    variant === 'register'
      ? Math.min(1, candidateStrength + 0.2)
      : Math.min(1, candidateStrength + 0.24);

  if (shouldStructure) {
    const overlayStructured = applyClauseTexture(
      workingText,
      sourceProfile,
      targetProfile,
      Math.min(1, candidateStrength + 0.16),
      candidateMod,
      transferPlan
    );
    if (overlayStructured !== workingText && overlayStructured.length <= maxLength) {
      workingText = overlayStructured;
      passesApplied.push('overlay-structural');
      rescuePasses.push('overlay-structural');
    }
  }

  let overlayWorking = workingText;
  overlayWorking = applyContractionTexture(overlayWorking, targetProfile, candidateMod);
  overlayWorking = applyPhraseTexture(overlayWorking, sourceProfile, targetProfile, Math.min(1, candidateStrength + 0.18));
  overlayWorking = applyVoiceRealizationTexture(overlayWorking, sourceProfile, targetProfile, voiceStrength, voiceOptions);
  overlayWorking = applyDiscourseFrameTexture(overlayWorking, sourceProfile, targetProfile, discourseStrength, transferPlan);
  overlayWorking = applyStanceTexture(overlayWorking, targetProfile, Math.min(1, candidateStrength + 0.18), connectorProfile);
  overlayWorking = applyFunctionWordTexture(overlayWorking, targetProfile, functionStrength, connectorProfile, transferPlan);
  overlayWorking = sanitizeBorrowedShellPathologies(overlayWorking);
  overlayWorking = finalizeTransformedText(overlayWorking);

  if (overlayWorking !== workingText && overlayWorking.length <= maxLength) {
    workingText = overlayWorking;
    passesApplied.push(`overlay-${variant}`);
    rescuePasses.push(`overlay-${variant}`);
  }

  const outputText = normalizeText(workingText);
  const outputProfile = extractCadenceProfile(outputText);
  const changedDimensions = collectChangedDimensions(sourceProfile, outputProfile);
  const quality = evaluateTransferQuality({
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

  return {
    spec: 'borrowed-shell-overlay',
    workingText,
    outputText,
    outputProfile,
    changedDimensions,
    quality,
    passesApplied,
    rescuePasses,
    score: candidateScore({
      quality,
      outputText,
      sourceText,
      sourceProfile,
      outputProfile,
      targetProfile,
      changedDimensions,
      passesApplied,
      targetProgressBias: shell?.mode === 'persona' || shell?.mode === 'borrowed'
    })
  };
}

function findBorrowedShellRescueCandidate({
  shell,
  candidates = [],
  sourceText = '',
  sourceProfile = {},
  targetProfile = {},
  targetGap = {},
  protectedState = { literals: [] },
  opportunityProfile = {},
  ir = {}
}) {
  if (shell?.mode !== 'borrowed') {
    return { candidate: null, fallback: null };
  }

  const rescueCandidates = Array.isArray(candidates) ? [...candidates] : [];
  for (const variant of ['conservative', 'register', 'balanced']) {
    const overlayCandidate = buildBorrowedShellOverlayCandidate({
      shell,
      sourceText,
      sourceProfile,
      targetProfile,
      targetGap,
      protectedState,
      opportunityProfile,
      ir,
      variant
    });
    if (overlayCandidate) {
      rescueCandidates.push(overlayCandidate);
    }
  }

  let best = null;

  for (const candidate of rescueCandidates) {
    const fallback = borrowedShellPartialFallback({
      shell,
      bestCandidate: candidate,
      sourceText,
      sourceProfile,
      targetProfile,
      protectedState,
      ir
    });

    if (!fallback.eligible) {
      continue;
    }

    const score = borrowedShellRescueScore(candidate, fallback);
    if (!best || score > best.score) {
      best = {
        candidate,
        fallback,
        score
      };
    }
  }

  return best || { candidate: null, fallback: null };
}

function inferBorrowedShellFailureClass({
  shell,
  targetGap = {},
  qualityNotes = [],
  protectedAnchorAudit = {},
  semanticAudit = {},
  visibleShift = false,
  nonTrivialShift = false,
  literalLocked = false,
  transferClass = '',
  borrowedShellOutcome = ''
}) {
  if (!shell || shell.mode !== 'borrowed') {
    return null;
  }

  if (borrowedShellOutcome === 'structural' || borrowedShellOutcome === 'partial') {
    return null;
  }

  const protectedAnchorIntegrity =
    protectedAnchorAudit.protectedAnchorIntegrity ?? semanticAudit.protectedAnchorIntegrity ?? 1;

  if (literalLocked) {
    return 'literal-lock';
  }

  if (borrowedShellPathologyBlocked(qualityNotes)) {
    return 'pathology-block';
  }

  if (
    protectedAnchorIntegrity < 1 ||
    (semanticAudit.propositionCoverage ?? 1) < 0.82 ||
    (semanticAudit.actionCoverage ?? 1) < 0.82 ||
    (semanticAudit.polarityMismatches ?? 0) > 0
  ) {
    return 'semantic-risk';
  }

  if (!isMaterialCadenceGap(targetGap)) {
    return 'already-close';
  }

  if (transferClass === 'rejected' && !visibleShift) {
    return 'donor-underfit';
  }

  if (!nonTrivialShift || borrowedShellOutcome === 'subtle') {
    return 'lexical-underreach';
  }

  return 'donor-underfit';
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

function applyBaselineTransferFloor(text = '', baseProfile = {}, targetProfile = {}, strength = 0.76, mod = {}, connectorProfile = null, transferPlan = null, voiceOptions = {}) {
  let result = text;
  const maxLength = transferLengthCeiling(text, baseProfile, targetProfile, strength);
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
  result = applyVoiceRealizationTexture(result, baseProfile, targetProfile, Math.min(1, strength + 0.2), voiceOptions);
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
  const normalizedBase = hasIntentionalLowercaseSurface(text)
    ? text
    : normalizeSentenceStarts(text);

  return normalizedBase
    .replace(/([;:.!?]\s+)(and|but|though|yet|since|because|so|then|when|while)\s+\2\b/gi, '$1$2')
    .replace(/\bthough\s+so\b/gi, 'so')
    .replace(/\bbut\s+so\b/gi, 'so')
    .replace(/\b(?:and|but)\s+then\b/gi, 'then')
    .replace(/\bOn\s+([^.;!?]{1,48});\s+([A-Z])/g, 'On $1, $2')
    .replace(/([A-Za-z0-9"'%)])\.\s+(Which|That)\b/g, (match, lastChar, connector) => `${lastChar}, ${connector.toLowerCase()}`)
    .replace(/;\s+but\b/gi, ', but')
    .replace(/\basking\s+for\s+for\b/gi, 'asking ')
    .replace(/\basked\s+for\s+for\b/gi, 'asked for ')
    .replace(/\bThough\s+([^,.!?]{1,40}),\s+so\b/g, '$1, so')
    .replace(/\bthough\s+([^,.!?]{1,40}),\s+so\b/g, '$1, so')
    .replace(/\bbetween([^.!?]{0,120}),\s+but\s+/gi, 'between$1, and ')
    .replace(/\b(As of [^.!?]{1,48}|During [^.!?]{1,36}|By [^.!?]{1,20})\.\s+([A-Z])/g, (match, leadIn, nextLetter) => {
      return `${leadIn}, ${nextLetter.toLowerCase()}`;
    })
    .replace(/\.{2,}/g, '.')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ ]{2,}/g, ' ')
    .trim();
}

function forceStructuralShift(text = '', baseProfile = {}, targetProfile = {}, strength = 0.76, mod = {}, connectorProfile = null, transferPlan = null, voiceOptions = {}) {
  let result = text;
  const maxLength = transferLengthCeiling(text, baseProfile, targetProfile, strength);
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
  result = applyVoiceRealizationTexture(result, baseProfile, targetProfile, Math.min(1, strength + 0.22), voiceOptions);
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
  const retrieval = Boolean(options?.retrieval);
  const strictBorrowedMode = shell?.mode === 'borrowed' && (retrieval || shell?.source === 'swapped');

  if (!sourceText || ((!mod.sent && !mod.cont && !mod.punc) && !shell?.profile) || shell?.mode === 'native') {
    const protectedState = protectTransferLiterals(sourceText);
    const ir = segmentTextToIR(protectedState.text, protectedState);
    const { semanticAudit, protectedAnchorAudit, outputIR } = buildSemanticAuditBundle(ir, sourceText, protectedState);
    const result = {
      text: sourceText,
      sourceProfile,
      targetProfile: sourceProfile,
      outputProfile: sourceProfile,
      opportunityProfile,
      changedDimensions: [],
      protectedLiteralCount: 0,
      passesApplied: [],
      rescuePasses: [],
      transferClass: 'native',
      qualityGatePassed: true,
      notes: sourceText ? ['Native shell: no transfer applied.'] : ['No source text loaded.'],
      effectiveMod: mod,
      realizationTier: 'none',
      lexicalShiftProfile: {
        lexemeSwaps: [],
        swapCount: 0,
        registerDistance: 0,
        contentWordComplexityDelta: 0,
        modifierDensityDelta: 0,
        directnessDelta: 0,
        abstractionDelta: 0,
        contractionAligned: true
      },
      semanticRisk: 0,
      lexemeSwaps: [],
      realizationNotes: [],
      borrowedShellOutcome: null,
      borrowedShellFailureClass: null,
      visibleShift: false,
      nonTrivialShift: false,
      semanticAudit,
      protectedAnchorAudit
    };

    if (retrieval || debug) {
      result.retrievalTrace = buildRetrievalTrace({
        sourceText,
        shell,
        sourceProfile,
        targetProfile: sourceProfile,
        opportunityProfile,
        ir,
        transferPlan: {},
        irPlan: {},
        allCandidates: [],
        bestCandidate: {
          spec: 'native',
          score: 1,
          passesApplied: [],
          changedDimensions: [],
          quality: {
            qualityGatePassed: true,
            notes: []
          }
        },
        finalText: sourceText,
        result,
        semanticAudit,
        protectedAnchorAudit,
        outputIR
      });
    }

    return result;
  }

  const targetProfile = buildTransferTargetProfile(sourceProfile, shell, mod, strength);
  const effectiveMod = deriveRelativeCadenceMod(sourceProfile, targetProfile, mod);
  const voiceRealizationOptions = {
    allowPlainTargetCompression: shell?.mode === 'borrowed' && (retrieval || shell?.source === 'swapped'),
    disabledLexicalFamilies:
      shell?.mode === 'borrowed' && (retrieval || shell?.source === 'swapped')
        ? [...BORROWED_SHELL_DISABLED_LEXICAL_FAMILY_IDS]
        : []
  };
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
  const maxLength = transferLengthCeiling(sourceText, sourceProfile, targetProfile, strength);
  const previewText = (candidate) => finalizeTransformedText(
    restoreProtectedLiterals(candidate, protectedState.literals)
  );
  const previewProfile = (candidate) => extractCadenceProfile(previewText(candidate));

  // Build IR and run beam search alongside legacy candidates
  const ir = segmentTextToIR(protectedState.text, protectedState);
  const irPlan = buildTransferPlanFromIR(ir, sourceProfile, targetProfile, strength, opportunityProfile);
  const beamResult = beamSearchTransfer(ir, irPlan, sourceProfile, targetProfile, strength, protectedState, sourceText, effectiveMod, connectorProfile, debug);

  // Legacy candidate specs
  const candidateSpecs = buildCandidateSpecs(transferPlan);

  const runCandidate = (spec = {}) => {
    let workingText = protectedState.text;
    let passesApplied = [];
    let rescuePasses = [];
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

    // Decomposed baseline transfer: structure first, then discourse layers
    {
      const baseStrength = Math.min(1, candidateStrength + 0.08);
      const maxLength = transferLengthCeiling(workingText, currentProfile, targetProfile, baseStrength);
      const baseCurrentProfile = currentProfile;
      const targetCount = desiredSentenceCount(baseCurrentProfile, targetProfile);
      const currentCount = baseCurrentProfile.sentenceCount || 0;
      const targetAvg = targetProfile.avgSentenceLength || baseCurrentProfile.avgSentenceLength || 0;
      const currentAvg = baseCurrentProfile.avgSentenceLength || 0;
      const wantsLonger = targetAvg > currentAvg + 0.4 || targetCount < currentCount;
      const wantsShorter = targetAvg < currentAvg - 0.4 || targetCount > currentCount;
      const contractionDirection = Number(candidateMod.cont || 0) || Math.sign((targetProfile.contractionDensity || 0) - (baseCurrentProfile.contractionDensity || 0));

      if (wantsLonger && sentenceChunks(workingText).length > 1) {
        runPass('baseline-merge', () =>
          mergeSentencePairs(workingText, targetProfile, Math.min(1, baseStrength + 0.08), {
            ...candidateMod,
            sent: Math.max(1, Number(candidateMod.sent || 0) || 1)
          }, transferPlan)
        );
      } else if (wantsShorter) {
        runPass('baseline-split', () =>
          splitLongSentences(workingText, targetProfile, Math.min(1, baseStrength + 0.08))
        );
      }

      runPass('baseline-contraction', () =>
        applyContractionTexture(workingText, targetProfile, {
          ...candidateMod,
          cont: contractionDirection
        })
      );
      runPass('baseline-phrase', () =>
        applyPhraseTexture(workingText, currentProfile, targetProfile, Math.min(1, baseStrength + 0.14))
      );
      runPass('baseline-voice-realization', () =>
        applyVoiceRealizationTexture(workingText, currentProfile, targetProfile, Math.min(1, baseStrength + 0.22), voiceRealizationOptions)
      );
      runPass('baseline-discourse', () =>
        applyDiscourseFrameTexture(workingText, currentProfile, targetProfile, Math.min(1, baseStrength + 0.12), transferPlan)
      );
      runPass('baseline-stance', () =>
        applyStanceTexture(workingText, targetProfile, Math.min(1, baseStrength + 0.14), connectorProfile)
      );
      runPass('baseline-function-word', () =>
        applyFunctionWordTexture(workingText, targetProfile, Math.min(1, baseStrength + 0.18), connectorProfile, transferPlan)
      );

      if (Math.abs((targetProfile.lineBreakDensity || 0) - (baseCurrentProfile.lineBreakDensity || 0)) >= 0.02) {
        runPass('baseline-line-break', () =>
          applyLineBreakTexture(workingText, targetProfile, Math.min(1, baseStrength + 0.1))
        );
      }

      // Finalize baseline
      const baselineFinalized = finalizeTransformedText(workingText);
      if (baselineFinalized !== workingText && baselineFinalized.length <= maxLength) {
        workingText = baselineFinalized;
      }
    }
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
      nextValue = applyVoiceRealizationTexture(
        nextValue,
        currentProfile,
        targetProfile,
        Math.min(1, candidateStrength + (0.18 * Math.max(1, spec.connectorBias || 1))),
        voiceRealizationOptions
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
      // Skip punctuation finishing when plan wants longer sentences and punc mod is negative
      // — applyPunctuationTexture converts semicolons (merge joins) to periods, undoing merges
      if (!(transferPlan.wantsLonger && (candidateMod.punc || 0) < 0)) {
        runPass('punctuation-finish', () => {
          let nextValue = applyPunctuationTexture(workingText, targetProfile, candidateMod);
          if ((candidateMod.punc || 0) < 0) {
            nextValue = nextValue.replace(/[;:]+/g, '.').replace(/,+/g, ',');
          }
          return nextValue;
        });
      }
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
      (spec.allowFallback || shell?.mode === 'borrowed') &&
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
        transferPlan,
        voiceRealizationOptions
      );

      if (forcedWorking !== workingText && forcedWorking.length <= maxLength) {
        workingText = forcedWorking;
        passesApplied.push('structural-rescue');
        rescuePasses.push('structural-rescue');
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

    if (
      !quality.qualityGatePassed &&
      (
        shell?.mode === 'borrowed' ||
        (quality.notes || []).some((note) => /lexical\/register realization/i.test(note))
      )
    ) {
      const realizedWorking = applyVoiceRealizationTexture(
        workingText,
        sourceProfile,
        targetProfile,
        Math.min(1, candidateStrength + 0.26),
        voiceRealizationOptions
      );

      if (realizedWorking !== workingText && realizedWorking.length <= maxLength) {
        workingText = realizedWorking;
        passesApplied.push('lexical-register-rescue');
        rescuePasses.push('lexical-register-rescue');
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
      }
    }

      if (!quality.qualityGatePassed && shell?.mode === 'borrowed') {
        let connectorWorking = applyDiscourseFrameTexture(
          workingText,
          outputProfile,
          targetProfile,
        Math.min(1, candidateStrength + 0.18),
        transferPlan
      );
      connectorWorking = applyStanceTexture(
        connectorWorking,
        targetProfile,
        Math.min(1, candidateStrength + 0.18),
        connectorProfile
      );
        connectorWorking = applyFunctionWordTexture(
          connectorWorking,
          targetProfile,
          Math.min(1, candidateStrength + 0.22),
          connectorProfile,
          transferPlan
        );
        connectorWorking = sanitizeBorrowedShellPathologies(connectorWorking);
        connectorWorking = finalizeTransformedText(connectorWorking);

      if (connectorWorking !== workingText && connectorWorking.length <= maxLength) {
        workingText = connectorWorking;
        passesApplied.push('connector-stance-rescue');
        rescuePasses.push('connector-stance-rescue');
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
      rescuePasses: [...new Set(rescuePasses)],
      score: candidateScore({
        quality,
        outputText,
        sourceText,
        sourceProfile,
        outputProfile,
        targetProfile,
        changedDimensions,
        passesApplied,
        targetProgressBias: shell?.mode === 'persona' || shell?.mode === 'borrowed'
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

  // Convert beam search best candidate into legacy candidate format for comparison
  const beamBest = beamResult.bestCandidate;
  const beamOutputText = finalizeTransformedText(
    restoreProtectedLiterals(beamBest.text, protectedState.literals)
  );
  const beamOutputProfile = extractCadenceProfile(beamOutputText);
  const beamChangedDimensions = collectChangedDimensions(sourceProfile, beamOutputProfile);
  const beamQuality = evaluateTransferQuality({
    sourceText,
    outputText: beamOutputText,
    workingText: beamBest.text,
    sourceProfile,
    targetProfile,
    targetGap,
    outputProfile: beamOutputProfile,
    changedDimensions: beamChangedDimensions,
    protectedState,
    opportunityProfile
  });
  const beamCandidate = {
    spec: 'ir-beam-search',
    workingText: beamBest.text,
    outputText: beamOutputText,
    outputProfile: beamOutputProfile,
    changedDimensions: beamChangedDimensions,
    quality: beamQuality,
    passesApplied: beamBest.operationHistory || [],
    rescuePasses: [],
    score: candidateScore({
      quality: beamQuality,
      outputText: beamOutputText,
      sourceText,
      sourceProfile,
      outputProfile: beamOutputProfile,
      targetProfile,
      changedDimensions: beamChangedDimensions,
      passesApplied: beamBest.operationHistory || [],
      targetProgressBias: shell?.mode === 'persona' || shell?.mode === 'borrowed'
    }),
    debug: null
  };

  // Pool beam + legacy candidates; accepted retrieval-safe survivors win first.
  const allCandidates = [beamCandidate, ...candidates];
  const candidateAcceptanceSummary = (candidate = {}) => {
    const candidateOutputText = candidate.outputText || sourceText;
    const candidateOutputProfile = candidate.outputProfile || extractCadenceProfile(candidateOutputText);
    const candidateChangedDimensions = [...(candidate.changedDimensions || [])];
    const lexicalShiftProfile = buildLexicalShiftProfile(
      sourceText,
      candidateOutputText,
      sourceProfile,
      targetProfile,
      candidateOutputProfile
    );
    const visibleShift = hasBorrowedShellVisibleShift(
      sourceText,
      candidateOutputText,
      candidateChangedDimensions,
      lexicalShiftProfile
    );
    const nonTrivialShift = hasBorrowedShellNonTrivialShift(
      sourceText,
      candidateOutputText,
      candidateChangedDimensions,
      lexicalShiftProfile
    );
    const auditBundle = buildSemanticAuditBundle(ir, candidateOutputText, protectedState);
    const semanticAudit = auditBundle.semanticAudit || {};
    const protectedAnchorAudit = auditBundle.protectedAnchorAudit || {};
    const protectedAnchorIntegrity =
      protectedAnchorAudit.protectedAnchorIntegrity ??
      semanticAudit.protectedAnchorIntegrity ??
      1;
    const sourceFitToTarget = compareTexts('', '', {
      profileA: sourceProfile,
      profileB: targetProfile
    });
    const outputFitToTarget = compareTexts('', '', {
      profileA: candidateOutputProfile,
      profileB: targetProfile
    });
    const donorProgress = buildBorrowedShellDonorProgress(
      sourceText,
      candidateOutputText,
      sourceProfile,
      targetProfile,
      candidateOutputProfile
    );
    const sourceDonorDistance = donorDistanceFromFit(sourceFitToTarget);
    const outputDonorDistance = donorDistanceFromFit(outputFitToTarget);
    const donorImprovement = donorProgress.donorImprovement;
    const donorRegression = round3(Math.max(0, outputDonorDistance - sourceDonorDistance));
    const structuralCount = borrowedShellStructuralDimensions(candidateChangedDimensions).length;
    const lexicalCount = lexicalDimensions(candidateChangedDimensions).length;
    const registerRealization =
      lexicalCount >= 1 ||
      Number(lexicalShiftProfile.swapCount || 0) > 0 ||
      candidateChangedDimensions.includes('connector-stance') ||
      candidateChangedDimensions.includes('contraction-posture');
    const surfaceClose = strictBorrowedMode && borrowedShellSurfaceClose(donorProgress);
    const transferClass =
      hasMaterialStructuralTransfer(candidateChangedDimensions) &&
      !surfaceClose &&
      (!strictBorrowedMode || registerRealization)
        ? 'structural'
        : 'weak';
    const acceptedForBorrowed =
      candidate.quality?.qualityGatePassed &&
      !borrowedShellPathologyBlocked(candidate.quality?.notes || []) &&
      candidateOutputText !== sourceText &&
      !surfaceClose &&
      visibleShift &&
      nonTrivialShift &&
      protectedAnchorIntegrity >= 1 &&
      (semanticAudit.propositionCoverage ?? 1) >= 0.85 &&
      (semanticAudit.actorCoverage ?? 1) >= 0.75 &&
      (semanticAudit.actionCoverage ?? 1) >= 0.75 &&
      (semanticAudit.objectCoverage ?? 1) >= 0.65 &&
      (semanticAudit.polarityMismatches ?? 0) <= 1 &&
      structuralCount >= 1 &&
      registerRealization;
    const acceptedForPersona =
      candidate.quality?.qualityGatePassed &&
      !borrowedShellPathologyBlocked(candidate.quality?.notes || []) &&
      candidateOutputText !== sourceText &&
      protectedAnchorIntegrity >= 1 &&
      (semanticAudit.propositionCoverage ?? 1) >= 0.9 &&
      (semanticAudit.polarityMismatches ?? 0) <= 1 &&
      (visibleShift || lexicalCount > 0 || structuralCount > 0);
    const accepted =
      strictBorrowedMode
        ? acceptedForBorrowed
        : shell?.mode === 'persona'
          ? acceptedForPersona
          : Boolean(candidate.quality?.qualityGatePassed);
    const acceptanceScore =
      candidate.score +
      (transferClass === 'structural' ? 36 : 12) +
      (structuralCount * 18) +
      (lexicalCount * 14) +
      (Number(lexicalShiftProfile.swapCount || 0) * 8) +
      (visibleShift ? 8 : 0) +
      (nonTrivialShift ? 12 : 0) +
      Math.min(40, donorImprovement * 80) -
      Math.min(32, donorRegression * 60) +
      (surfaceClose ? -60 : 0) +
      (((semanticAudit.propositionCoverage ?? 1) * 12) + ((semanticAudit.actionCoverage ?? 1) * 8));

    return {
      candidate,
      accepted,
      acceptanceScore,
      transferClass,
      lexicalShiftProfile,
      visibleShift,
      nonTrivialShift,
      auditBundle,
      donorProgress,
      surfaceClose
    };
  };
  const acceptedSelection =
    strictBorrowedMode || shell?.mode === 'persona'
      ? allCandidates
        .map((candidate) => candidateAcceptanceSummary(candidate))
        .filter((entry) => entry.accepted)
        .sort((left, right) => right.acceptanceScore - left.acceptanceScore)[0] || null
      : null;
  const borrowedRescue =
    strictBorrowedMode && !acceptedSelection
      ? findBorrowedShellRescueCandidate({
          shell,
          candidates: allCandidates,
          sourceText,
          sourceProfile,
          targetProfile,
          targetGap,
          protectedState,
          opportunityProfile,
          ir
        })
      : { candidate: null, fallback: null };
  let bestCandidate =
    acceptedSelection?.candidate ||
    borrowedRescue.candidate ||
    [...allCandidates].sort((left, right) => right.score - left.score)[0];

  let finalText = bestCandidate.outputText;
  let finalProfile = bestCandidate.outputProfile;
  let qualityGatePassed = bestCandidate.quality.qualityGatePassed;
  let transferClass = 'weak';
  let changedDimensions = [...bestCandidate.changedDimensions];
  const notes = [...bestCandidate.quality.notes];
  let precomputedAuditBundle = null;
  let precomputedLexicalShiftProfile = null;
  const rescuePasses = [...new Set(bestCandidate.rescuePasses || [])];
  let borrowedShellOutcome = shell?.mode === 'borrowed' ? 'subtle' : null;
  let borrowedShellFailureClass = null;
  let precomputedVisibleShift = null;
  let precomputedNonTrivialShift = null;
  let directBorrowedProgressCheck = null;

  if (bestCandidate.quality.materialGap && bestCandidate.quality.limitedOpportunity) {
    notes.push('Source offered limited structural rewrite opportunities, so the transfer stayed subtle.');
  }

  if (acceptedSelection) {
    finalText = shell?.mode === 'borrowed'
      ? sanitizeBorrowedShellPathologies(bestCandidate.outputText)
      : bestCandidate.outputText;
    finalProfile = extractCadenceProfile(finalText);
    qualityGatePassed = true;
    changedDimensions = [...bestCandidate.changedDimensions];
    transferClass = acceptedSelection.transferClass;
    precomputedAuditBundle = {
      ...acceptedSelection.auditBundle
    };
    precomputedLexicalShiftProfile = acceptedSelection.lexicalShiftProfile;
    precomputedVisibleShift = acceptedSelection.visibleShift;
    precomputedNonTrivialShift = acceptedSelection.nonTrivialShift;
    rescuePasses.push(...(bestCandidate.rescuePasses || []));
    if (shell?.mode === 'borrowed') {
      borrowedShellOutcome = transferClass === 'structural' ? 'structural' : 'subtle';
      directBorrowedProgressCheck = {
        eligible: true,
        qualityNotes: bestCandidate.quality.notes || [],
        changedDimensions: [...(bestCandidate.changedDimensions || [])],
        visibleShift: acceptedSelection.visibleShift,
        nonTrivialShift: acceptedSelection.nonTrivialShift,
        protectedAnchorIntegrity: acceptedSelection.auditBundle.protectedAnchorAudit?.protectedAnchorIntegrity ??
          acceptedSelection.auditBundle.semanticAudit?.protectedAnchorIntegrity ??
          1,
        propositionCoverage: acceptedSelection.auditBundle.semanticAudit?.propositionCoverage ?? 1,
        actionCoverage: acceptedSelection.auditBundle.semanticAudit?.actionCoverage ?? 1,
        polarityMismatches: acceptedSelection.auditBundle.semanticAudit?.polarityMismatches ?? 0,
        progressProfile: {
          accepted: true,
          structuralCount: borrowedShellStructuralDimensions(bestCandidate.changedDimensions || []).length,
          lexicalCount: lexicalDimensions(bestCandidate.changedDimensions || []).length,
          swapCount: Number(acceptedSelection.lexicalShiftProfile?.swapCount || 0)
        },
        lexicalShiftProfile: acceptedSelection.lexicalShiftProfile,
        donorProgress: acceptedSelection.donorProgress
      };
      notes.push('Borrowed shell landed a retrieval-safe donor realization without partial fallback.');
    } else if (shell?.mode === 'persona') {
      notes.push('Persona shell landed a retrieval-safe mask realization.');
    }
  } else if (strictBorrowedMode && borrowedRescue.candidate && borrowedRescue.fallback) {
    finalText = sanitizeBorrowedShellPathologies(borrowedRescue.candidate.outputText);
    finalProfile = extractCadenceProfile(finalText);
    qualityGatePassed = Boolean(borrowedRescue.candidate.quality?.qualityGatePassed);
    changedDimensions = collectChangedDimensions(sourceProfile, finalProfile);
    transferClass = hasMaterialStructuralTransfer(changedDimensions) ? 'structural' : 'weak';
    precomputedAuditBundle = {
      semanticAudit: borrowedRescue.fallback.semanticAudit,
      protectedAnchorAudit: borrowedRescue.fallback.protectedAnchorAudit,
      outputIR: borrowedRescue.fallback.outputIR
    };
    precomputedLexicalShiftProfile = borrowedRescue.fallback.lexicalShiftProfile;
    precomputedVisibleShift = borrowedRescue.fallback.visibleShift;
    precomputedNonTrivialShift = borrowedRescue.fallback.nonTrivialShift;
    rescuePasses.push(borrowedRescue.fallback.relaxed ? 'progress-admit' : 'partial-rescue');
    directBorrowedProgressCheck = {
      eligible: true,
      relaxed: Boolean(borrowedRescue.fallback.relaxed),
      qualityNotes: borrowedRescue.candidate.quality?.notes || [],
      changedDimensions: [...(borrowedRescue.candidate.changedDimensions || [])],
      visibleShift: borrowedRescue.fallback.visibleShift,
      nonTrivialShift: borrowedRescue.fallback.nonTrivialShift,
      protectedAnchorIntegrity: borrowedRescue.fallback.protectedAnchorAudit?.protectedAnchorIntegrity ??
        borrowedRescue.fallback.semanticAudit?.protectedAnchorIntegrity ??
        1,
      propositionCoverage: borrowedRescue.fallback.semanticAudit?.propositionCoverage ?? 1,
      actionCoverage: borrowedRescue.fallback.semanticAudit?.actionCoverage ?? 1,
      polarityMismatches: borrowedRescue.fallback.semanticAudit?.polarityMismatches ?? 0,
      progressProfile: borrowedRescue.fallback.progressProfile,
      lexicalShiftProfile: borrowedRescue.fallback.lexicalShiftProfile,
      donorProgress: buildBorrowedShellDonorProgress(
        sourceText,
        finalText,
        sourceProfile,
        targetProfile,
        finalProfile
      )
    };
    notes.push(
      borrowedRescue.fallback.relaxed
        ? 'Borrowed shell held a retrieval-safe rescue shift under progress admission.'
        : 'Borrowed shell held a retrieval-safe rescue shift.'
    );
  } else if (strictBorrowedMode) {
    finalText = sourceText;
    finalProfile = sourceProfile;
    qualityGatePassed = false;
    transferClass = 'rejected';
    changedDimensions = [];
    borrowedShellOutcome = 'rejected';
    precomputedAuditBundle = {
      ...buildSemanticAuditBundle(ir, finalText, protectedState)
    };
    precomputedLexicalShiftProfile = buildLexicalShiftProfile(sourceText, finalText, sourceProfile, targetProfile, finalProfile);
    precomputedVisibleShift = false;
    precomputedNonTrivialShift = false;
    rescuePasses.push('final-rejection');
    directBorrowedProgressCheck = {
      eligible: false,
      qualityNotes: bestCandidate.quality.notes || [],
      changedDimensions: [...(bestCandidate.changedDimensions || [])],
      visibleShift: false,
      nonTrivialShift: false,
      protectedAnchorIntegrity: 1,
      propositionCoverage: 1,
      actionCoverage: 1,
      polarityMismatches: 0,
      progressProfile: null,
      lexicalShiftProfile: precomputedLexicalShiftProfile
    };
    notes.push('No retrieval-safe borrowed-shell candidate survived semantic review.');
  } else if (!bestCandidate.quality.qualityGatePassed) {
    if (isMaterialCadenceGap(targetGap)) {
      if (shell?.mode === 'persona') {
        const personaRescueText = forceStructuralShift(
          bestCandidate.outputText,
          sourceProfile,
          targetProfile,
          Math.min(1, strength + 0.22),
          effectiveMod,
          connectorProfile,
          transferPlan
        );
        const personaRescueProfile = extractCadenceProfile(personaRescueText);
        const personaRescueAudit = buildSemanticAuditBundle(ir, personaRescueText, protectedState);
        const personaProtectedAnchorIntegrity =
          personaRescueAudit.protectedAnchorAudit?.protectedAnchorIntegrity ??
          personaRescueAudit.semanticAudit?.protectedAnchorIntegrity ??
          1;

        if (
          personaRescueText !== sourceText &&
          personaProtectedAnchorIntegrity >= 1 &&
          (personaRescueAudit.semanticAudit?.propositionCoverage ?? 1) >= 0.9 &&
          (personaRescueAudit.semanticAudit?.actorCoverage ?? 1) >= 0.75 &&
          (personaRescueAudit.semanticAudit?.actionCoverage ?? 1) >= 0.75 &&
          (personaRescueAudit.semanticAudit?.objectCoverage ?? 1) >= 0.65 &&
          (personaRescueAudit.semanticAudit?.polarityMismatches ?? 0) <= 1
        ) {
          finalText = personaRescueText;
          finalProfile = personaRescueProfile;
          changedDimensions = collectChangedDimensions(sourceProfile, finalProfile);
          transferClass = hasMaterialStructuralTransfer(changedDimensions) ? 'structural' : 'weak';
          precomputedAuditBundle = personaRescueAudit;
          rescuePasses.push('persona-structural-rescue');
          notes.push('Persona shell preserved a retrieval-safe structural mask shift.');
        } else {
          finalText = sourceText;
          finalProfile = sourceProfile;
          changedDimensions = [];
          transferClass = 'rejected';
          borrowedShellOutcome = 'rejected';
          rescuePasses.push('final-rejection');
          notes.push('Transfer fell back to the source text to preserve meaning and readability.');
        }
      } else {
        finalText = sourceText;
        finalProfile = sourceProfile;
        changedDimensions = [];
        transferClass = 'rejected';
        borrowedShellOutcome = 'rejected';
        rescuePasses.push('final-rejection');
        notes.push('Transfer fell back to the source text to preserve meaning and readability.');
      }
    } else {
      transferClass = 'weak';
      borrowedShellOutcome = shell?.mode === 'borrowed' ? 'subtle' : borrowedShellOutcome;
      notes.push('Source and target cadence were already close, so the transfer stayed subtle.');
    }
  } else if (!changedDimensions.length) {
    transferClass = 'weak';
    borrowedShellOutcome = shell?.mode === 'borrowed' ? 'subtle' : borrowedShellOutcome;
    notes.push('Source and target cadence were already close, so the transfer stayed subtle.');
  } else {
    const lexicalShiftPreview = buildLexicalShiftProfile(sourceText, finalText, sourceProfile, targetProfile, finalProfile);
    const hasLexicalRealization =
      lexicalDimensions(changedDimensions).length > 0 ||
      lexicalShiftPreview.swapCount > 0;
    transferClass = hasMaterialStructuralTransfer(changedDimensions) && hasLexicalRealization ? 'structural' : 'weak';
    if (shell?.mode === 'borrowed') {
      borrowedShellOutcome = transferClass === 'structural' ? 'structural' : 'subtle';
    }
    notes.push(`Shifted ${changedDimensions.join(', ')}.`);
  }

  if (
    shell?.mode === 'persona' &&
    transferClass !== 'rejected'
  ) {
    const personaGapBefore = profileDeltaToTarget(finalProfile, targetProfile);
    const personaNeedsVividRescue =
      profileDeltaScore(personaGapBefore) >= 0.18 ||
      personaGapBefore.avgSentence >= 1.2 ||
      personaGapBefore.functionWord >= 0.025 ||
      personaGapBefore.directness >= 0.09 ||
      personaGapBefore.abstraction >= 0.09 ||
      personaGapBefore.register >= 0.12;

    if (personaNeedsVividRescue) {
      let personaStructured = finalText;
      let personaWorkingProfile = finalProfile;
      const personaRescueStrength = Math.min(1, strength + 0.22);
      const personaWantsShorter =
        (targetProfile.avgSentenceLength || 0) < ((personaWorkingProfile.avgSentenceLength || 0) - 0.8) ||
        desiredSentenceCount(personaWorkingProfile, targetProfile) > (personaWorkingProfile.sentenceCount || 0);

      if (personaWantsShorter) {
        personaStructured = splitLongSentences(
          personaStructured,
          targetProfile,
          Math.min(1, personaRescueStrength + 0.08)
        );
        personaWorkingProfile = extractCadenceProfile(personaStructured);
        personaStructured = applySentenceTexture(
          personaStructured,
          personaWorkingProfile,
          targetProfile,
          Math.min(1, personaRescueStrength + 0.08),
          effectiveMod
        );
        personaWorkingProfile = extractCadenceProfile(personaStructured);
      }

      if (Number(effectiveMod.sent || 0) !== 0 || personaGapBefore.avgSentence >= 1.2 || personaGapBefore.sentenceCount >= 1) {
        personaStructured = forceStructuralShift(
          personaStructured,
          personaWorkingProfile,
          targetProfile,
          personaRescueStrength,
          effectiveMod,
          connectorProfile,
          transferPlan,
          voiceRealizationOptions
        );
        personaWorkingProfile = extractCadenceProfile(personaStructured);
      }

      personaStructured = applyDiscourseFrameTexture(
        personaStructured,
        personaWorkingProfile,
        targetProfile,
        personaRescueStrength,
        transferPlan
      );
      personaWorkingProfile = extractCadenceProfile(personaStructured);

      personaStructured = applyStanceTexture(
        personaStructured,
        targetProfile,
        personaRescueStrength,
        connectorProfile
      );
      personaStructured = applyFunctionWordTexture(
        personaStructured,
        targetProfile,
        personaRescueStrength,
        connectorProfile,
        transferPlan
      );
      personaWorkingProfile = extractCadenceProfile(personaStructured);

      personaStructured = applyVoiceRealizationTexture(
        personaStructured,
        personaWorkingProfile,
        targetProfile,
        Math.min(1, personaRescueStrength + 0.06),
        voiceRealizationOptions
      );

      if (personaGapBefore.contraction >= 0.008 || Math.abs(Number(effectiveMod.cont || 0)) > 0) {
        personaStructured = applyContractionTexture(personaStructured, targetProfile, effectiveMod);
      }

      if (
        (personaGapBefore.punctuation >= 0.01 || personaGapBefore.punctuationShape >= 0.06 || Math.abs(Number(effectiveMod.punc || 0)) > 0) &&
        !(transferPlan.wantsLonger && (effectiveMod.punc || 0) < 0)
      ) {
        personaStructured = applyPunctuationTexture(personaStructured, targetProfile, effectiveMod);
      }

      personaWorkingProfile = extractCadenceProfile(personaStructured);
      if (
        personaWantsShorter &&
        (personaWorkingProfile.avgSentenceLength || 0) > ((targetProfile.avgSentenceLength || 0) + 1.5)
      ) {
        const desiredSplits = Math.max(
          1,
          Math.round(
            (((personaWorkingProfile.avgSentenceLength || 0) - (targetProfile.avgSentenceLength || 0)) / 2.4) +
            Math.max(1, personaGapBefore.sentenceCount || 0)
          )
        );
        personaStructured = applySplitRules(personaStructured, desiredSplits);
      }

      personaStructured = finalizeTransformedText(personaStructured);

      if (personaStructured !== finalText) {
        const personaProfile = extractCadenceProfile(personaStructured);
        const personaGapAfter = profileDeltaToTarget(personaProfile, targetProfile);
        const personaAuditBundle = buildSemanticAuditBundle(ir, personaStructured, protectedState);
        const personaProtectedAnchorIntegrity =
          personaAuditBundle.protectedAnchorAudit?.protectedAnchorIntegrity ??
          personaAuditBundle.semanticAudit?.protectedAnchorIntegrity ??
          1;

        if (
          personaProtectedAnchorIntegrity >= 1 &&
          (personaAuditBundle.semanticAudit?.propositionCoverage ?? 1) >= 0.9 &&
          (personaAuditBundle.semanticAudit?.actorCoverage ?? 1) >= 0.75 &&
          (personaAuditBundle.semanticAudit?.actionCoverage ?? 1) >= 0.75 &&
          (personaAuditBundle.semanticAudit?.objectCoverage ?? 1) >= 0.65 &&
          (personaAuditBundle.semanticAudit?.polarityMismatches ?? 0) <= 1 &&
          profileDeltaScore(personaGapAfter) + 0.02 < profileDeltaScore(personaGapBefore)
        ) {
          finalText = personaStructured;
          finalProfile = personaProfile;
          changedDimensions = collectChangedDimensions(sourceProfile, finalProfile);
          precomputedAuditBundle = personaAuditBundle;
          rescuePasses.push('persona-vivid-rescue');
          notes.push('Persona shell deepened cadence alignment to hold the requested mask posture.');
        }
      }
    }
  }

  let lexicalShiftProfile = precomputedLexicalShiftProfile || buildLexicalShiftProfile(sourceText, finalText, sourceProfile, targetProfile, finalProfile);
  let realizationTier = determineRealizationTier(changedDimensions, lexicalShiftProfile.lexemeSwaps);
  let semanticRisk = computeSemanticRisk(sourceText, finalText, protectedState, sourceProfile, finalProfile);
  const protectedLiteralRatio = protectedState.literals.length / Math.max(1, sourceProfile.wordCount || 1);
  const literalLocked =
    protectedState.literals.length >= 2 &&
    protectedLiteralRatio >= 0.25 &&
    (sourceProfile.wordCount || 0) <= 12 &&
    lexicalShiftProfile.swapCount === 0;

  if (literalLocked && finalText !== sourceText) {
    finalText = sourceText;
    finalProfile = sourceProfile;
    changedDimensions = [];
    transferClass = 'rejected';
    borrowedShellOutcome = shell?.mode === 'borrowed' ? 'rejected' : borrowedShellOutcome;
    rescuePasses.push('final-rejection');
    notes.push('Literal-heavy source stayed anchored to preserve protected anchors.');
    lexicalShiftProfile = buildLexicalShiftProfile(sourceText, finalText, sourceProfile, targetProfile, finalProfile);
    realizationTier = determineRealizationTier(changedDimensions, lexicalShiftProfile.lexemeSwaps);
    semanticRisk = computeSemanticRisk(sourceText, finalText, protectedState, sourceProfile, finalProfile);
  }

  if (protectedState.literals.length) {
    notes.push(`${protectedState.literals.length} protected literal${protectedState.literals.length === 1 ? '' : 's'} held fixed.`);
  }

  const realizationNotes = [];
  if (lexicalShiftProfile.swapCount > 0) {
    realizationNotes.push(`${lexicalShiftProfile.swapCount} lexical family swap${lexicalShiftProfile.swapCount === 1 ? '' : 's'} landed.`);
  }
  if (lexicalDimensions(changedDimensions).length > 0) {
    realizationNotes.push(`Register shift surfaced through ${lexicalDimensions(changedDimensions).join(', ')}.`);
  }
  if (semanticRisk >= 0.3) {
    realizationNotes.push('Semantic risk is elevated; review the realized output before relying on it.');
  }

  let {
    semanticAudit,
    protectedAnchorAudit,
    outputIR
  } = precomputedAuditBundle || buildSemanticAuditBundle(ir, finalText, protectedState);

  const finalProtectedAnchorIntegrity =
    protectedAnchorAudit?.protectedAnchorIntegrity ?? semanticAudit?.protectedAnchorIntegrity ?? 1;
  const enforceFinalBorrowedSemanticGuard = Boolean(retrieval || shell?.source === 'swapped');
  const donorProgress = shell?.mode === 'borrowed'
    ? buildBorrowedShellDonorProgress(sourceText, finalText, sourceProfile, targetProfile, finalProfile)
    : {
        eligible: false,
        sourceDonorDistance: 0,
        outputDonorDistance: 0,
        donorImprovement: 0,
        donorImprovementRatio: 0,
        sourceOutputLexicalOverlap: 1
      };
  const finalBorrowedSurfaceClose =
    enforceFinalBorrowedSemanticGuard &&
    shell?.mode === 'borrowed' &&
    finalText !== sourceText &&
    borrowedShellSurfaceClose(donorProgress);
  const finalSemanticBorrowedFailure =
    enforceFinalBorrowedSemanticGuard &&
    shell?.mode === 'borrowed' &&
    finalText !== sourceText &&
    (
      finalBorrowedSurfaceClose ||
      finalProtectedAnchorIntegrity < 1 ||
      (semanticAudit?.propositionCoverage ?? 1) < 0.85 ||
      (semanticAudit?.actorCoverage ?? 1) < 0.75 ||
      (semanticAudit?.actionCoverage ?? 1) < 0.75 ||
      (semanticAudit?.objectCoverage ?? 1) < 0.65 ||
      (semanticAudit?.polarityMismatches ?? 0) > 1
    );

  if (finalSemanticBorrowedFailure) {
    finalText = sourceText;
    finalProfile = sourceProfile;
    changedDimensions = [];
    transferClass = 'rejected';
    borrowedShellOutcome = 'rejected';
    rescuePasses.push('semantic-final-rejection');
    notes.push(
      finalBorrowedSurfaceClose
        ? 'Transfer fell back to the source text after donor realization stayed surface-close.'
        : 'Transfer fell back to the source text after final semantic review.'
    );
    lexicalShiftProfile = buildLexicalShiftProfile(sourceText, finalText, sourceProfile, targetProfile, finalProfile);
    realizationTier = determineRealizationTier(changedDimensions, lexicalShiftProfile.lexemeSwaps);
    semanticRisk = computeSemanticRisk(sourceText, finalText, protectedState, sourceProfile, finalProfile);
    precomputedVisibleShift = null;
    precomputedNonTrivialShift = null;
    ({ semanticAudit, protectedAnchorAudit, outputIR } = buildSemanticAuditBundle(ir, finalText, protectedState));
  }

  const visibleShift = precomputedVisibleShift ?? hasBorrowedShellVisibleShift(
    sourceText,
    finalText,
    changedDimensions,
    lexicalShiftProfile
  );
  const nonTrivialShift = precomputedNonTrivialShift ?? hasBorrowedShellNonTrivialShift(
    sourceText,
    finalText,
    changedDimensions,
    lexicalShiftProfile
  );

  if (shell?.mode === 'borrowed') {
    if (transferClass === 'structural') {
      borrowedShellOutcome = 'structural';
    } else if (transferClass === 'rejected') {
      borrowedShellOutcome = 'rejected';
    } else if (
      (
        rescuePasses.includes('partial-rescue') ||
        rescuePasses.includes('partial-progress-rescue') ||
        rescuePasses.includes('progress-admit')
      ) &&
      nonTrivialShift
    ) {
      borrowedShellOutcome = 'partial';
    } else {
      borrowedShellOutcome = 'subtle';
    }

    borrowedShellFailureClass = inferBorrowedShellFailureClass({
      shell,
      targetGap,
      qualityNotes: notes,
      protectedAnchorAudit,
      semanticAudit,
      visibleShift,
      nonTrivialShift,
      literalLocked,
      transferClass,
      borrowedShellOutcome
    });
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
    rescuePasses: [...new Set(rescuePasses)],
    transferClass,
    qualityGatePassed,
    notes: [...new Set(notes)],
    effectiveMod,
    realizationTier,
    lexicalShiftProfile,
    semanticRisk,
    donorProgress,
    lexemeSwaps: lexicalShiftProfile.lexemeSwaps,
    realizationNotes,
    borrowedShellOutcome,
    borrowedShellFailureClass,
    visibleShift,
    nonTrivialShift,
    semanticAudit,
    protectedAnchorAudit
  };

  if (retrieval || debug) {
    result.retrievalTrace = buildRetrievalTrace({
      sourceText,
      shell,
      sourceProfile,
      targetProfile,
      opportunityProfile,
      ir,
      transferPlan,
      irPlan,
      allCandidates,
      bestCandidate,
      finalText,
      result,
      semanticAudit,
      protectedAnchorAudit,
      outputIR
    });
  }

  if (debug) {
    result.debug = {
      plan: transferPlan,
      irPlan,
      irSource: ir,
      beamCandidates: beamResult.allCandidates.map((c) => ({
        score: round3(c.score),
        changedDimensions: c.changedDimensions,
        pathologyFlags: c.pathologyFlags,
        operationHistory: c.operationHistory
      })),
      distanceBefore: profileDeltaScore(profileDeltaToTarget(sourceProfile, targetProfile)),
      distanceAfter: profileDeltaScore(profileDeltaToTarget(bestCandidate.outputProfile, targetProfile)),
      candidates: allCandidates.map((candidate) => ({
        spec: candidate.spec,
        score: round3(candidate.score),
        changedDimensions: [...candidate.changedDimensions],
        qualityGatePassed: candidate.quality.qualityGatePassed,
        lexicalDimensions: [...candidate.quality.lexicalDimensions],
        notes: [...candidate.quality.notes],
        passesApplied: [...candidate.passesApplied]
      })),
      selected: bestCandidate.spec,
      directBorrowedProgressCheck,
      trace: bestCandidate.debug
    };
  }

  return result;
}

export function buildCadenceTransferTrace(text = '', shell = {}, options = {}) {
  return buildCadenceTransfer(text, shell, {
    ...options,
    retrieval: true
  }).retrievalTrace;
}

export function applyCadenceToText(text = '', shell = {}) {
  return buildCadenceTransfer(text, shell).text;
}

export const SWAP_CADENCE_FLAGSHIP_PAIRS = Object.freeze([
  Object.freeze({ sourceId: 'building-access-formal-record', donorId: 'building-access-rushed-mobile' }),
  Object.freeze({ sourceId: 'building-access-rushed-mobile', donorId: 'building-access-formal-record' }),
  Object.freeze({ sourceId: 'package-handoff-formal-record', donorId: 'package-handoff-rushed-mobile' }),
  Object.freeze({ sourceId: 'package-handoff-rushed-mobile', donorId: 'package-handoff-formal-record' }),
  Object.freeze({ sourceId: 'volunteer-cleanup-formal-record', donorId: 'volunteer-cleanup-rushed-mobile' }),
  Object.freeze({ sourceId: 'volunteer-cleanup-rushed-mobile', donorId: 'volunteer-cleanup-formal-record' }),
  Object.freeze({ sourceId: 'customer-support-formal-record', donorId: 'customer-support-rushed-mobile' }),
  Object.freeze({ sourceId: 'customer-support-rushed-mobile', donorId: 'customer-support-formal-record' })
]);

function normalizeSwapSample(sample = {}, index = 0) {
  return {
    id: sample.id || `sample-${index}`,
    name: sample.name || sample.id || `Sample ${index + 1}`,
    text: normalizeText(sample.text || ''),
    intention: sample.intention || ''
  };
}

function sortUniqueStrings(values = []) {
  return [...new Set(values.filter(Boolean))].sort((left, right) => left.localeCompare(right));
}

function buildSwapBorrowedShell(sample = {}, fromSlot = 'B', strength = 0.82) {
  const profile = extractCadenceProfile(sample.text || '');
  return {
    mode: 'borrowed',
    label: `borrowed ${sample.name || sample.id || fromSlot} cadence`,
    profile,
    mod: cadenceModFromProfile(profile),
    source: 'swapped',
    fromSlot,
    strength
  };
}

function buildSwapLaneResult(sourceSample, donorSample, slot = 'A', donorSlot = 'B', strength = 0.82) {
  const transfer = buildCadenceTransfer(sourceSample.text, buildSwapBorrowedShell(donorSample, donorSlot, strength), {
    retrieval: true,
    strength
  });
  const trace = transfer.retrievalTrace || {};
  const semanticAudit = trace.semanticAudit || transfer.semanticAudit || {};
  const protectedAnchorAudit = trace.protectedAnchorAudit || transfer.protectedAnchorAudit || {};

  return {
    slot,
    sourceId: sourceSample.id,
    donorId: donorSample.id,
    sourceName: sourceSample.name,
    donorName: donorSample.name,
    transferClass: transfer.transferClass || 'native',
    borrowedShellOutcome: transfer.borrowedShellOutcome || (transfer.transferClass === 'rejected' ? 'rejected' : 'subtle'),
    borrowedShellFailureClass: transfer.borrowedShellFailureClass || null,
    realizationTier: transfer.realizationTier || 'none',
    changedDimensions: [...new Set(transfer.changedDimensions || [])],
    lexemeSwapFamilies: sortUniqueStrings((transfer.lexemeSwaps || []).map((swap) => swap.family)),
    rescuePasses: [...new Set(transfer.rescuePasses || [])],
    visibleShift: Boolean(transfer.visibleShift),
    nonTrivialShift: Boolean(transfer.nonTrivialShift),
    donorProgress: transfer.donorProgress || {},
    propositionCoverage: semanticAudit.propositionCoverage ?? 1,
    actorCoverage: semanticAudit.actorCoverage ?? 1,
    actionCoverage: semanticAudit.actionCoverage ?? 1,
    objectCoverage: semanticAudit.objectCoverage ?? 1,
    polarityMismatches: semanticAudit.polarityMismatches ?? 0,
    tenseMismatches: semanticAudit.tenseMismatches ?? 0,
    protectedAnchorIntegrity: protectedAnchorAudit.protectedAnchorIntegrity ?? semanticAudit.protectedAnchorIntegrity ?? 1,
    semanticRisk: transfer.semanticRisk ?? 0,
    notes: [...new Set(transfer.notes || [])],
    text: transfer.text
  };
}

function classifySwapCadencePair(laneA = {}, laneB = {}) {
  const engagedA =
    laneA.borrowedShellOutcome === 'structural' ||
    laneA.borrowedShellOutcome === 'partial' ||
    (laneA.borrowedShellOutcome === 'subtle' && laneA.nonTrivialShift);
  const engagedB =
    laneB.borrowedShellOutcome === 'structural' ||
    laneB.borrowedShellOutcome === 'partial' ||
    (laneB.borrowedShellOutcome === 'subtle' && laneB.nonTrivialShift);

  if (laneA.borrowedShellOutcome === 'rejected' && laneB.borrowedShellOutcome === 'rejected') {
    return 'both-rejected';
  }

  if (
    borrowedShellSurfaceClose(laneA.donorProgress || {}) &&
    borrowedShellSurfaceClose(laneB.donorProgress || {})
  ) {
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

function buildSwapCadencePairReport(sourceSample, donorSample, strength = 0.82) {
  const laneA = buildSwapLaneResult(sourceSample, donorSample, 'A', 'B', strength);
  const laneB = buildSwapLaneResult(donorSample, sourceSample, 'B', 'A', strength);
  const classification = classifySwapCadencePair(laneA, laneB);
  const failureFamilyTags = sortUniqueStrings([
    ['structural', 'partial'].includes(laneA.borrowedShellOutcome) ? null : laneA.borrowedShellFailureClass,
    ['structural', 'partial'].includes(laneB.borrowedShellOutcome) ? null : laneB.borrowedShellFailureClass
  ]);
  const atLeastOneStructural =
    laneA.borrowedShellOutcome === 'structural' ||
    laneB.borrowedShellOutcome === 'structural';
  const flagshipPass =
    laneA.borrowedShellOutcome !== 'rejected' &&
    laneB.borrowedShellOutcome !== 'rejected' &&
    !borrowedShellSurfaceClose(laneA.donorProgress || {}) &&
    !borrowedShellSurfaceClose(laneB.donorProgress || {}) &&
    ['structural', 'partial'].includes(laneA.borrowedShellOutcome) &&
    ['structural', 'partial'].includes(laneB.borrowedShellOutcome) &&
    atLeastOneStructural &&
    classification === 'bilateral-engaged';

  return {
    id: `${sourceSample.id}__${donorSample.id}`,
    sourceId: sourceSample.id,
    donorId: donorSample.id,
    laneA,
    laneB,
    pairAudit: {
      classification,
      flagshipPass,
      atLeastOneStructural,
      bilateralEngaged: classification === 'bilateral-engaged',
      oneSided: classification === 'one-sided',
      bothRejected: classification === 'both-rejected',
      surfaceClose: classification === 'surface-close'
    },
    failureFamilyTags,
    visibleShiftSummary: {
      laneAVisibleShift: laneA.visibleShift,
      laneBVisibleShift: laneB.visibleShift,
      laneANonTrivialShift: laneA.nonTrivialShift,
      laneBNonTrivialShift: laneB.nonTrivialShift,
      bilateralVisibleShift: laneA.visibleShift && laneB.visibleShift,
      bilateralNonTrivialShift: laneA.nonTrivialShift && laneB.nonTrivialShift
    },
    semanticAuditSummary: {
      propositionCoverageMin: round3(Math.min(laneA.propositionCoverage, laneB.propositionCoverage)),
      actorCoverageMin: round3(Math.min(laneA.actorCoverage, laneB.actorCoverage)),
      actionCoverageMin: round3(Math.min(laneA.actionCoverage, laneB.actionCoverage)),
      objectCoverageMin: round3(Math.min(laneA.objectCoverage, laneB.objectCoverage)),
      polarityMismatchesMax: Math.max(laneA.polarityMismatches, laneB.polarityMismatches),
      tenseMismatchesMax: Math.max(laneA.tenseMismatches, laneB.tenseMismatches),
      protectedAnchorIntegrityMin: round3(Math.min(laneA.protectedAnchorIntegrity, laneB.protectedAnchorIntegrity)),
      semanticRiskMax: round3(Math.max(laneA.semanticRisk, laneB.semanticRisk))
    }
  };
}

export function buildSwapCadenceMatrix(sampleLibrary = [], options = {}) {
  const samples = (sampleLibrary || [])
    .map((sample, index) => normalizeSwapSample(sample, index))
    .filter((sample) => sample.text);
  const samplesById = Object.freeze(samples.reduce((acc, sample) => {
    acc[sample.id] = sample;
    return acc;
  }, {}));
  const strength = clamp(Number(options.strength ?? 0.82), 0, 1);
  const flagshipPairs = (options.flagshipPairs || SWAP_CADENCE_FLAGSHIP_PAIRS)
    .map((pair) => ({
      sourceId: pair.sourceId,
      donorId: pair.donorId
    }))
    .filter((pair) => samplesById[pair.sourceId] && samplesById[pair.donorId] && pair.sourceId !== pair.donorId);
  const allPairs = Array.isArray(options.orderedPairs) && options.orderedPairs.length
    ? options.orderedPairs
      .map((pair) => ({
        sourceId: pair.sourceId,
        donorId: pair.donorId
      }))
      .filter((pair) => samplesById[pair.sourceId] && samplesById[pair.donorId] && pair.sourceId !== pair.donorId)
    : (() => {
      const pairs = [];
      for (const sourceSample of samples) {
        for (const donorSample of samples) {
          if (sourceSample.id === donorSample.id) {
            continue;
          }

          pairs.push({
            sourceId: sourceSample.id,
            donorId: donorSample.id
          });
        }
      }
      return pairs;
    })();

  const fullMatrix = allPairs.map((pair) =>
    buildSwapCadencePairReport(samplesById[pair.sourceId], samplesById[pair.donorId], strength)
  );
  const fullMatrixById = fullMatrix.reduce((acc, report) => {
    acc[report.id] = report;
    return acc;
  }, {});
  const flagshipReports = flagshipPairs
    .map((pair) => fullMatrixById[`${pair.sourceId}__${pair.donorId}`])
    .filter(Boolean);
  const failureFamilyCounts = fullMatrix.reduce((acc, report) => {
    for (const tag of report.failureFamilyTags) {
      acc[tag] = (acc[tag] || 0) + 1;
    }
    return acc;
  }, {});
  const summary = {
    caseCount: fullMatrix.length,
    flagshipCount: flagshipReports.length,
    bilateralEngaged: fullMatrix.filter((report) => report.pairAudit.bilateralEngaged).length,
    oneSided: fullMatrix.filter((report) => report.pairAudit.oneSided).length,
    bothRejected: fullMatrix.filter((report) => report.pairAudit.bothRejected).length,
    surfaceClose: fullMatrix.filter((report) => report.pairAudit.surfaceClose).length,
    flagshipPassCount: flagshipReports.filter((report) => report.pairAudit.flagshipPass).length,
    flagshipCaseCount: flagshipReports.length,
    flagshipAllPassed: flagshipReports.length > 0 && flagshipReports.every((report) => report.pairAudit.flagshipPass),
    failureFamilyCounts
  };

  return {
    flagshipPairs,
    flagshipReports,
    fullMatrix,
    summary
  };
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
  const contentWordComplexityDistance = boundedDistance(
    profileA.contentWordComplexity || 0,
    profileB.contentWordComplexity || 0,
    0.55
  );
  const modifierDensityDistance = boundedDistance(
    profileA.modifierDensity || 0,
    profileB.modifierDensity || 0,
    0.25
  );
  const hedgeDensityDistance = boundedDistance(
    profileA.hedgeDensity || 0,
    profileB.hedgeDensity || 0,
    0.14
  );
  const directnessDistance = boundedDistance(
    profileA.directness || 0,
    profileB.directness || 0,
    0.45
  );
  const abstractionDistance = boundedDistance(
    profileA.abstractionPosture || 0.5,
    profileB.abstractionPosture || 0.5,
    0.6
  );
  const latinateDistance = boundedDistance(
    profileA.latinatePreference || 0,
    profileB.latinatePreference || 0,
    0.35
  );
  const abbreviationDistance = boundedDistance(
    profileA.abbreviationDensity || 0,
    profileB.abbreviationDensity || 0,
    0.28
  );
  const orthographyDistance = boundedDistance(
    profileA.orthographicLooseness || 0,
    profileB.orthographicLooseness || 0,
    0.38
  );
  const fragmentDistance = boundedDistance(
    profileA.fragmentPressure || 0,
    profileB.fragmentPressure || 0,
    0.45
  );
  const conversationDistance = boundedDistance(
    profileA.conversationalPosture || 0,
    profileB.conversationalPosture || 0,
    0.42
  );
  const surfaceMarkerDistanceValue = surfaceMarkerDistance(
    profileA.surfaceMarkerProfile || {},
    profileB.surfaceMarkerProfile || {}
  );
  const registerDistanceValue = registerDistance(profileA, profileB);
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
    contentWordComplexityDistance === 0 &&
    modifierDensityDistance === 0 &&
    hedgeDensityDistance === 0 &&
    directnessDistance === 0 &&
    abstractionDistance === 0 &&
    latinateDistance === 0 &&
    punctShapeDistance === 0 &&
    abbreviationDistance === 0 &&
    orthographyDistance === 0 &&
    fragmentDistance === 0 &&
    conversationDistance === 0 &&
    surfaceMarkerDistanceValue === 0;

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
        ((1 - recurrenceDistance) * 0.03) +
        ((1 - registerDistanceValue) * 0.04) +
        ((1 - abbreviationDistance) * 0.03) +
        ((1 - orthographyDistance) * 0.03) +
        ((1 - fragmentDistance) * 0.02) +
        ((1 - conversationDistance) * 0.02) +
        ((1 - surfaceMarkerDistanceValue) * 0.02)
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
        ((1 - recurrenceDistance) * 0.02) +
        ((1 - registerDistanceValue) * 0.05) +
        ((1 - abbreviationDistance) * 0.04) +
        ((1 - orthographyDistance) * 0.04) +
        ((1 - fragmentDistance) * 0.03) +
        ((1 - conversationDistance) * 0.02) +
        ((1 - surfaceMarkerDistanceValue) * 0.02)
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
    contentWordComplexityDistance: round3(contentWordComplexityDistance),
    modifierDensityDistance: round3(modifierDensityDistance),
    hedgeDensityDistance: round3(hedgeDensityDistance),
    directnessDistance: round3(directnessDistance),
    abstractionDistance: round3(abstractionDistance),
    latinateDistance: round3(latinateDistance),
    abbreviationDistance: round3(abbreviationDistance),
    orthographyDistance: round3(orthographyDistance),
    fragmentDistance: round3(fragmentDistance),
    conversationDistance: round3(conversationDistance),
    surfaceMarkerDistance: round3(surfaceMarkerDistanceValue),
    registerDistance: round3(registerDistanceValue),
    avgSentenceA: profileA.avgSentenceLength,
    avgSentenceB: profileB.avgSentenceLength,
    lexicalOverlap: round3(lexicalOverlap),
    profileA,
    profileB
  };
}

function surfaceAppears(text = '', surface = '') {
  if (!surface) {
    return false;
  }

  return new RegExp(`\\b${escapeRegex(surface)}\\b`, 'i').test(text);
}

function detectLexemeSwaps(sourceText = '', outputText = '') {
  const swaps = [];
  const seen = new Set();

  for (const pack of PHRASE_REALIZATION_PACKS) {
    const sourceVariant = Object.values(pack.replacements).find((variant) => surfaceAppears(sourceText, variant));
    const outputVariant = Object.values(pack.replacements).find((variant) => surfaceAppears(outputText, variant));
    if (sourceVariant && outputVariant && sourceVariant.toLowerCase() !== outputVariant.toLowerCase()) {
      const key = `${pack.id}:${sourceVariant.toLowerCase()}:${outputVariant.toLowerCase()}`;
      if (!seen.has(key)) {
        seen.add(key);
        swaps.push({
          family: pack.id,
          from: sourceVariant,
          to: outputVariant,
          kind: 'phrase'
        });
      }
    }
  }

  for (const family of LEXICAL_FAMILIES) {
    const familyVariants = FAMILY_VARIANT_INDEX.filter((entry) => entry.familyId === family.id);
    const sourceVariant = familyVariants.find((entry) => surfaceAppears(sourceText, entry.surface));
    const outputVariant = familyVariants.find((entry) => surfaceAppears(outputText, entry.surface));
    if (!sourceVariant || !outputVariant || sourceVariant.normalized === outputVariant.normalized) {
      continue;
    }

    const key = `${family.id}:${sourceVariant.normalized}:${outputVariant.normalized}`;
    if (!seen.has(key)) {
      seen.add(key);
      swaps.push({
        family: family.id,
        from: sourceVariant.surface,
        to: outputVariant.surface,
        kind: 'lexeme'
      });
    }
  }

  return swaps;
}

function buildLexicalShiftProfile(sourceText = '', outputText = '', sourceProfile = {}, targetProfile = {}, outputProfile = {}) {
  const fit = compareTexts(sourceText, outputText, {
    profileA: sourceProfile,
    profileB: outputProfile
  });
  const lexemeSwaps = detectLexemeSwaps(sourceText, outputText);

  return {
    lexemeSwaps,
    swapCount: lexemeSwaps.length,
    registerDistance: fit.registerDistance || 0,
    contentWordComplexityDelta: round3((outputProfile.contentWordComplexity || 0) - (sourceProfile.contentWordComplexity || 0)),
    modifierDensityDelta: round3((outputProfile.modifierDensity || 0) - (sourceProfile.modifierDensity || 0)),
    directnessDelta: round3((outputProfile.directness || 0) - (sourceProfile.directness || 0)),
    abstractionDelta: round3((outputProfile.abstractionPosture || 0.5) - (sourceProfile.abstractionPosture || 0.5)),
    contractionAligned:
      Math.sign((outputProfile.contractionDensity || 0) - (sourceProfile.contractionDensity || 0)) ===
        Math.sign((targetProfile.contractionDensity || 0) - (sourceProfile.contractionDensity || 0)) ||
      Math.abs((targetProfile.contractionDensity || 0) - (sourceProfile.contractionDensity || 0)) < 0.006
  };
}

function computeSemanticRisk(sourceText = '', outputText = '', protectedState = { literals: [] }, sourceProfile = {}, outputProfile = {}) {
  const fit = compareTexts(sourceText, outputText, {
    profileA: sourceProfile,
    profileB: outputProfile
  });
  let risk = 0;

  if (!protectedLiteralIntegrity(outputText, protectedState.literals || [])) {
    risk += 0.3;
  }

  const sourceNegative = /\b(?:not|never|no|cannot|can't|won't|didn't|wasn't|aren't)\b/i.test(sourceText);
  const outputNegative = /\b(?:not|never|no|cannot|can't|won't|didn't|wasn't|aren't)\b/i.test(outputText);
  if (sourceNegative !== outputNegative) {
    risk += 0.18;
  }

  if ((fit.lexicalOverlap || 0) < 0.28) {
    risk += 0.18;
  }

  if (Math.abs((outputProfile.sentenceCount || 0) - (sourceProfile.sentenceCount || 0)) > 4) {
    risk += 0.12;
  }

  if (outputText.length > Math.ceil(sourceText.length * 1.35)) {
    risk += 0.1;
  }

  return round3(clamp01(risk));
}

function determineRealizationTier(changedDimensions = [], lexemeSwaps = []) {
  const hasStructural = structuralDimensions(changedDimensions).length > 0;
  const hasLexical = lexicalDimensions(changedDimensions).length > 0 || lexemeSwaps.length > 0;

  if (!changedDimensions.length && !lexemeSwaps.length) {
    return 'none';
  }

  if (hasStructural && hasLexical) {
    return 'lexical-structural';
  }

  return 'cadence-only';
}

const SEMANTIC_VARIANT_FAMILY_LOOKUP = Object.freeze(FAMILY_VARIANT_INDEX.reduce((acc, entry) => {
  acc[entry.normalized] = entry.familyId;
  return acc;
}, {}));

const PRONOUN_ROLE_CLASSES = Object.freeze({
  i: 'first-singular',
  me: 'first-singular',
  my: 'first-singular',
  mine: 'first-singular',
  we: 'first-plural',
  us: 'first-plural',
  our: 'first-plural',
  ours: 'first-plural',
  you: 'second',
  your: 'second',
  yours: 'second',
  he: 'third-singular',
  him: 'third-singular',
  his: 'third-singular',
  she: 'third-singular',
  her: 'third-singular',
  hers: 'third-singular',
  it: 'third-singular',
  its: 'third-singular',
  they: 'third-plural',
  them: 'third-plural',
  their: 'third-plural',
  theirs: 'third-plural',
  there: 'ambient',
  this: 'deictic',
  that: 'deictic'
});

const SEMANTIC_EQUIVALENT_FORMS = Object.freeze({
  headed: 'leave',
  head: 'leave',
  departure: 'leave',
  depart: 'leave',
  wrapped: 'finish',
  wrap: 'finish',
  deployed: 'use',
  deploy: 'use',
  requested: 'ask',
  request: 'ask',
  asked: 'ask',
  requires: 'need',
  required: 'need',
  require: 'need',
  provided: 'give',
  provide: 'give',
  issued: 'give',
  issue: 'give',
  located: 'find',
  locate: 'find',
  identified: 'find',
  identify: 'find',
  contacted: 'call',
  contact: 'call',
  scheduled: 'book',
  schedule: 'book',
  verified: 'check',
  verify: 'check',
  reviewed: 'check',
  review: 'check',
  confirmed: 'check',
  confirm: 'check',
  resolved: 'fix',
  resolve: 'fix',
  transferred: 'move',
  transfer: 'move',
  relocated: 'move',
  relocate: 'move',
  matched: 'match',
  aligns: 'match',
  aligned: 'match',
  align: 'match',
  logged: 'record',
  log: 'record',
  flagged: 'note',
  flag: 'note',
  speech: 'tell',
  said: 'tell',
  says: 'tell',
  told: 'tell',
  pauses: 'wait',
  pause: 'wait',
  grabbed: 'bring',
  grab: 'bring',
  doorway: 'door',
  point: 'detail',
  points: 'detail',
  reason: 'detail',
  reasons: 'detail',
  tough: 'hard',
  charger: 'charger',
  qualifiers: 'qualifier',
  apologies: 'apology'
});

function normalizeSemanticToken(token = '') {
  const normalized = normalizeText(token)
    .toLowerCase()
    .replace(/[^a-z0-9']/g, '')
    .trim();

  if (!normalized) {
    return '';
  }

  if (PRONOUN_ROLE_CLASSES[normalized]) {
    return `pronoun:${PRONOUN_ROLE_CLASSES[normalized]}`;
  }

  if (SEMANTIC_VARIANT_FAMILY_LOOKUP[normalized]) {
    return `family:${SEMANTIC_VARIANT_FAMILY_LOOKUP[normalized]}`;
  }

  if (SEMANTIC_EQUIVALENT_FORMS[normalized]) {
    return SEMANTIC_EQUIVALENT_FORMS[normalized];
  }

  if (normalized.endsWith('ing') && normalized.length > 5) {
    return normalized.slice(0, -3);
  }

  if (normalized.endsWith('ed') && normalized.length > 4) {
    return normalized.slice(0, -2);
  }

  if (normalized.endsWith('es') && normalized.length > 4) {
    return normalized.slice(0, -2);
  }

  if (normalized.endsWith('s') && normalized.length > 3 && !normalized.endsWith("'s")) {
    return normalized.slice(0, -1);
  }

  return normalized;
}

function semanticRoleTokens(value = '') {
  return tokenize(value)
    .filter((token) => !CONTENT_STOP_WORDS.has(token) && !HEDGE_MARKERS.has(token))
    .map(normalizeSemanticToken)
    .filter(Boolean);
}

function roleCoverage(roleTokens = [], targetSet = new Set(), fallbackScore = 0) {
  if (!roleTokens.length) {
    return 1;
  }

  const unique = [...new Set(roleTokens)];
  const matched = unique.filter((token) => targetSet.has(token)).length;
  const directCoverage = matched / unique.length;
  return round3(clamp01(Math.max(directCoverage, fallbackScore)));
}

function semanticJaccard(leftTokens = [], rightTokens = []) {
  const left = new Set(leftTokens);
  const right = new Set(rightTokens);

  if (!left.size && !right.size) {
    return 1;
  }

  if (!left.size || !right.size) {
    return 0;
  }

  let overlap = 0;
  left.forEach((token) => {
    if (right.has(token)) {
      overlap += 1;
    }
  });

  return overlap / (left.size + right.size - overlap);
}

function compatibleTenseAspect(source = '', target = '') {
  if (!source || !target || source === target) {
    return true;
  }

  if (source === 'mixed' || target === 'mixed') {
    return true;
  }

  const pair = new Set([source, target]);
  if (pair.has('present') && pair.has('progressive')) {
    return true;
  }

  if (pair.has('past') && pair.has('perfect')) {
    return true;
  }

  return false;
}

function summarizeProfile(profile = {}) {
  return {
    avgSentenceLength: round2(profile.avgSentenceLength || 0),
    sentenceCount: profile.sentenceCount || 0,
    contractionDensity: round3(profile.contractionDensity || 0),
    punctuationDensity: round3(profile.punctuationDensity || 0),
    lineBreakDensity: round3(profile.lineBreakDensity || 0),
    contentWordComplexity: round3(profile.contentWordComplexity || 0),
    modifierDensity: round3(profile.modifierDensity || 0),
    hedgeDensity: round3(profile.hedgeDensity || 0),
    directness: round3(profile.directness || 0),
    abstractionPosture: round3(profile.abstractionPosture || 0.5),
    latinatePreference: round3(profile.latinatePreference || 0),
    recurrencePressure: round3(profile.recurrencePressure || 0)
  };
}

function summarizeIR(ir = {}) {
  return {
    metadata: {
      sentenceCount: ir.metadata?.sentenceCount || 0,
      clauseCount: ir.metadata?.clauseCount || 0,
      literalSpans: (ir.metadata?.literalSpans || []).map((entry) => ({
        value: entry.value,
        placeholder: entry.placeholder
      }))
    },
    sentences: (ir.sentences || []).map((sentence) => ({
      id: sentence.id,
      raw: sentence.raw,
      rhetoricalRole: sentence.rhetoricalRole,
      terminalPunct: sentence.terminalPunct,
      clauses: (sentence.clauses || []).map((clause) => ({
        id: clause.id,
        text: clause.text,
        relationToPrev: clause.relationToPrev,
        clauseType: clause.clauseType,
        polarity: clause.polarity,
        tenseAspect: clause.tenseAspect,
        propositionHead: clause.propositionHead,
        actor: clause.actor,
        action: clause.action,
        object: clause.object,
        modifiers: clause.modifiers,
        hedgeMarkers: clause.hedgeMarkers
      }))
    }))
  };
}

function flattenSemanticClauses(ir = {}) {
  return (ir.sentences || []).flatMap((sentence) =>
    (sentence.clauses || []).map((clause) => {
      const propositionTokens = semanticRoleTokens(clause.propositionHead);
      const actorTokens = semanticRoleTokens(clause.actor);
      const actionTokens = semanticRoleTokens(clause.action);
      const objectTokens = semanticRoleTokens(clause.object);
      const modifierTokens = semanticRoleTokens((clause.modifiers || []).join(' '));
      const bag = [
        ...propositionTokens,
        ...actorTokens,
        ...actionTokens,
        ...objectTokens,
        ...modifierTokens
      ];

      return {
        id: clause.id,
        text: clause.text,
        relationToPrev: clause.relationToPrev,
        polarity: clause.polarity,
        tenseAspect: clause.tenseAspect,
        propositionTokens,
        actorTokens,
        actionTokens,
        objectTokens,
        modifierTokens,
        bag: [...new Set(bag)]
      };
    })
  );
}

function bestSemanticClauseMatch(sourceClause, outputClauses = []) {
  if (!outputClauses.length) {
    return {
      clause: null,
      score: 0,
      bagScore: 0
    };
  }

  const windows = [];
  for (let index = 0; index < outputClauses.length; index += 1) {
    const single = outputClauses[index];
    windows.push({
      id: single.id,
      relationToPrev: single.relationToPrev,
      polarity: single.polarity,
      tenseAspect: single.tenseAspect,
      actorTokens: single.actorTokens,
      actionTokens: single.actionTokens,
      objectTokens: single.objectTokens,
      bag: single.bag
    });

    if (index < outputClauses.length - 1) {
      const next = outputClauses[index + 1];
      windows.push({
        id: `${single.id}+${next.id}`,
        relationToPrev: single.relationToPrev,
        polarity: single.polarity === next.polarity ? single.polarity : 'mixed',
        tenseAspect: single.tenseAspect === next.tenseAspect ? single.tenseAspect : 'mixed',
        actorTokens: [...new Set([...single.actorTokens, ...next.actorTokens])],
        actionTokens: [...new Set([...single.actionTokens, ...next.actionTokens])],
        objectTokens: [...new Set([...single.objectTokens, ...next.objectTokens])],
        bag: [...new Set([...single.bag, ...next.bag])]
      });
    }
  }

  return windows.reduce((best, candidate) => {
    const bagScore = semanticJaccard(sourceClause.bag, candidate.bag);
    const actorScore = semanticJaccard(sourceClause.actorTokens, candidate.actorTokens);
    const actionScore = semanticJaccard(sourceClause.actionTokens, candidate.actionTokens);
    const relationBonus = sourceClause.relationToPrev === candidate.relationToPrev ? 0.08 : 0;
    const polarityBonus = sourceClause.polarity === candidate.polarity || candidate.polarity === 'mixed' ? 0.08 : 0;
    const score = (
      (bagScore * 0.54) +
      (actorScore * 0.16) +
      (actionScore * 0.14) +
      relationBonus +
      polarityBonus
    );

    if (score > best.score) {
      return {
        clause: candidate,
        score,
        bagScore
      };
    }

    return best;
  }, {
    clause: windows[0],
    score: -1,
    bagScore: 0
  });
}

function buildProtectedAnchorAudit(outputText = '', protectedState = { literals: [] }) {
  const literals = protectedState?.literals || [];
  const missingAnchors = literals
    .filter((entry) => !outputText.includes(entry.value))
    .map((entry) => entry.value);
  const resolvedAnchors = literals.length - missingAnchors.length;
  const protectedAnchorIntegrity = literals.length
    ? round3(resolvedAnchors / literals.length)
    : 1;

  return {
    totalAnchors: literals.length,
    resolvedAnchors,
    missingAnchors,
    protectedAnchorIntegrity
  };
}

function buildSemanticAuditBundle(sourceIR, outputText = '', protectedState = { literals: [] }) {
  const outputIR = segmentTextToIR(normalizeText(outputText), protectedState);
  const sourceClauses = flattenSemanticClauses(sourceIR);
  const outputClauses = flattenSemanticClauses(outputIR);
  const globalOutputSet = new Set(outputClauses.flatMap((clause) => clause.bag));
  const protectedAnchorAudit = buildProtectedAnchorAudit(outputText, protectedState);

  if (!sourceClauses.length) {
    return {
      semanticAudit: {
        propositionCoverage: 1,
        actorCoverage: 1,
        actionCoverage: 1,
        objectCoverage: 1,
        polarityMismatches: 0,
        tenseMismatches: 0,
        protectedAnchorIntegrity: protectedAnchorAudit.protectedAnchorIntegrity,
        clauseAudits: [],
        sourceClauseCount: 0,
        outputClauseCount: outputClauses.length
      },
      protectedAnchorAudit,
      outputIR
    };
  }

  const clauseAudits = sourceClauses.map((sourceClause) => {
    const match = bestSemanticClauseMatch(sourceClause, outputClauses);
    const targetClause = match.clause;
    const targetSet = new Set(targetClause?.bag || []);
    const globalBagScore = round3(semanticJaccard(sourceClause.bag, [...globalOutputSet]));
    const bagScore = round3(clamp01(match.bagScore || 0));
    const basePropositionCoverage = Math.max(
      roleCoverage(sourceClause.propositionTokens, targetSet, bagScore),
      roleCoverage(sourceClause.propositionTokens, globalOutputSet, globalBagScore * 0.94)
    );
    const actorCoverage = Math.max(
      roleCoverage(sourceClause.actorTokens, targetSet, bagScore * 0.9),
      roleCoverage(sourceClause.actorTokens, globalOutputSet, globalBagScore * 0.9)
    );
    const rawActionCoverage = Math.max(
      roleCoverage(sourceClause.actionTokens, targetSet, bagScore),
      roleCoverage(sourceClause.actionTokens, globalOutputSet, globalBagScore * 0.94)
    );
    const rawObjectCoverage = Math.max(
      roleCoverage(sourceClause.objectTokens, targetSet, bagScore * 0.82),
      roleCoverage(sourceClause.objectTokens, globalOutputSet, globalBagScore * 0.88)
    );
    const propositionCoverage = Math.max(
      basePropositionCoverage,
      rawActionCoverage,
      rawObjectCoverage * 0.9
    );
    const actionCoverage = sourceClause.actionTokens.length
      ? Math.max(rawActionCoverage, propositionCoverage * 0.9)
      : propositionCoverage;
    const objectCoverage = sourceClause.objectTokens.length
      ? Math.max(rawObjectCoverage, propositionCoverage * 0.75)
      : propositionCoverage;
    const polarityRelevant =
      sourceClause.propositionTokens.length > 0 ||
      sourceClause.actionTokens.length > 0 ||
      sourceClause.objectTokens.length > 0;
    const polarityMismatch = targetClause
      ? Number(polarityRelevant && sourceClause.polarity !== targetClause.polarity && globalBagScore < 0.5 && bagScore < 0.95)
      : 0;
    const tenseMismatch = targetClause
      ? Number(sourceClause.actionTokens.length > 0 && !compatibleTenseAspect(sourceClause.tenseAspect, targetClause.tenseAspect) && globalBagScore < 0.5)
      : 0;

    return {
      sourceClauseId: sourceClause.id,
      matchedClauseId: targetClause?.id || null,
      propositionCoverage,
      actorCoverage,
      actionCoverage,
      objectCoverage,
      polarityMismatch,
      tenseMismatch,
      bagScore,
      globalBagScore
    };
  });

  const average = (key) => round3(
    clauseAudits.reduce((sum, entry) => sum + (entry[key] || 0), 0) / Math.max(1, clauseAudits.length)
  );
  const semanticAudit = {
    propositionCoverage: average('propositionCoverage'),
    actorCoverage: average('actorCoverage'),
    actionCoverage: average('actionCoverage'),
    objectCoverage: average('objectCoverage'),
    polarityMismatches: clauseAudits.reduce((sum, entry) => sum + entry.polarityMismatch, 0),
    tenseMismatches: clauseAudits.reduce((sum, entry) => sum + entry.tenseMismatch, 0),
    protectedAnchorIntegrity: protectedAnchorAudit.protectedAnchorIntegrity,
    clauseAudits,
    sourceClauseCount: sourceClauses.length,
    outputClauseCount: outputClauses.length
  };

  return {
    semanticAudit,
    protectedAnchorAudit,
    outputIR
  };
}

function summarizeTransferPlan(transferPlan = {}, irPlan = {}, passesApplied = []) {
  const uniquePasses = [...new Set(passesApplied)];
  return {
    transferMode: irPlan.transferMode || 'weak',
    structuralOperationsSelected: uniquePasses.filter((name) =>
      /(split|merge|sentence|clause|structural)/i.test(name)
    ),
    lexicalRegisterOperationsSelected: uniquePasses.filter((name) =>
      /(phrase|voice|stance|connector|function-word|line-break|punctuation|lexical|contraction|discourse)/i.test(name)
    ),
    connectorStrategy: irPlan.dominantRelation || transferPlan.dominantRelation || 'balanced',
    contractionStrategy:
      (irPlan.discourseGoals?.contractionDelta || 0) > 0.006
        ? 'increase'
        : (irPlan.discourseGoals?.contractionDelta || 0) < -0.006
          ? 'decrease'
          : 'hold',
    relationInventory: irPlan.relationInventory || transferPlan.relationInventory || [],
    structuralGoals: irPlan.structuralGoals || {},
    discourseGoals: irPlan.discourseGoals || {},
    registerGoals: irPlan.registerGoals || {},
    operationBudget: irPlan.operationBudget || {}
  };
}

function summarizeCandidate(candidate = {}) {
  return {
    spec: candidate.spec || 'selected',
    score: round3(candidate.score || 0),
    passesApplied: candidate.passesApplied || [],
    rescuePasses: candidate.rescuePasses || [],
    changedDimensions: candidate.changedDimensions || [],
    qualityGatePassed: Boolean(candidate.quality?.qualityGatePassed),
    notes: candidate.quality?.notes || []
  };
}

function buildRetrievalTrace({
  sourceText,
  shell,
  sourceProfile,
  targetProfile,
  opportunityProfile,
  ir,
  transferPlan,
  irPlan,
  allCandidates,
  bestCandidate,
  finalText,
  result,
  semanticAudit,
  protectedAnchorAudit,
  outputIR
}) {
  return {
    sourceText,
    donorProfileSummary: {
      mode: shell?.mode || 'native',
      label: shell?.label || 'native cadence',
      strength: round3(Number(shell?.strength || 0)),
      profile: summarizeProfile(targetProfile)
    },
    sourceIR: summarizeIR(ir),
    opportunityProfile: {
      ...opportunityProfile
    },
    planSummary: summarizeTransferPlan(transferPlan, irPlan, bestCandidate?.passesApplied || []),
    candidateSummary: {
      selected: summarizeCandidate(bestCandidate),
      candidates: (allCandidates || []).map(summarizeCandidate)
    },
    finalRealization: {
      text: finalText,
      transferClass: result.transferClass,
      borrowedShellOutcome: result.borrowedShellOutcome,
      borrowedShellFailureClass: result.borrowedShellFailureClass,
      realizationTier: result.realizationTier,
      changedDimensions: result.changedDimensions || [],
      lexemeSwaps: result.lexemeSwaps || [],
      semanticRisk: result.semanticRisk,
      donorProgress: result.donorProgress || {},
      rescuePasses: result.rescuePasses || [],
      visibleShift: Boolean(result.visibleShift),
      nonTrivialShift: Boolean(result.nonTrivialShift)
    },
    semanticAudit,
    protectedAnchorAudit,
    realizedIR: summarizeIR(outputIR),
    realizationSummary: {
      transferClass: result.transferClass,
      borrowedShellOutcome: result.borrowedShellOutcome,
      borrowedShellFailureClass: result.borrowedShellFailureClass,
      realizationTier: result.realizationTier,
      changedDimensions: result.changedDimensions || [],
      lexemeSwaps: result.lexemeSwaps || [],
      semanticRisk: result.semanticRisk,
      donorProgress: result.donorProgress || {},
      realizationNotes: result.realizationNotes || [],
      rescuePasses: result.rescuePasses || [],
      visibleShift: Boolean(result.visibleShift),
      nonTrivialShift: Boolean(result.nonTrivialShift)
    }
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
