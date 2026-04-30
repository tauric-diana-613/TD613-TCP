// Discourse-ontology vocabulary used by the cadence engine to classify a
// source text's discourse move and pick a scaffold or parenthetical that
// matches that move.
//
// The vocabulary used to live as inline regex inside generator-v2.js
// (inferDiscourseOntology, chooseDiscourseScaffold,
// chooseParentheticalScaffold, scaffoldPhraseToSentence,
// isDiscourseScaffoldSentence, expectedOperatorsForContext). Keeping it
// here lets fixture writers extend the vocabulary without engine edits.
//
// Order matters in the arrays — first-match precedence is preserved.
// Palette arrays are addressed by stableChoiceIndex, so reordering one
// palette member changes the deterministic dispatch.
//
// Tokens are treated as regex fragments, not literals — e.g. `docs?`
// matches both "doc" and "docs". Adding a token with a regex special
// character is a deliberate act; in the common case tokens are plain words.
//
// A signal entry may carry an optional `extraPattern` string (a raw regex
// fragment, no flags). It is appended as `|(?:<extraPattern>)` to the
// bounded-token regex so the signal fires on either the word-boundary list
// OR the extra pattern — used where the trigger cannot be expressed as a
// plain word boundary (e.g. `\s[+&]\s` for clipped shorthand).

export const DISCOURSE_ONTOLOGY = Object.freeze({
  // ---- Source-text signal categories -------------------------------------
  // Each entry: a tag and the token list that triggers it. A regex of the
  // form /\b(?:tok1|tok2|…)\b/i is built from the tokens at load time.
  // Optional `extraPattern` string extends the regex beyond word boundaries.
  sourceSignals: Object.freeze([
    Object.freeze({ tag: 'dependency-chain',      tokens: Object.freeze(['unit', 'onboarding', 'leans on it', 'relies on it', 'dependency', 'mentoring']) }),
    Object.freeze({ tag: 'route-risk-separation', tokens: Object.freeze(['motel', 'household', 'case split', 'duplicate', 'intake', 'not saying no']) }),
    Object.freeze({ tag: 'unresolved-condition',  tokens: Object.freeze(['leak', 'plumber', 'cabinet', 'wet', 'fixed', 'resolved', 'repair']) }),
    Object.freeze({ tag: 'procedural-dead-path',  tokens: Object.freeze(['fraud hold', 'manual review', 'dead path', 'credential mismatch', 'reset flow']) }),
    Object.freeze({ tag: 'record-correction',     tokens: Object.freeze(['correct', 'correction', 'record', 'log', 'footage', 'testimony', 'signature', 'attempted', 'quote', 'speaker tag', 'speaker attribution', 'graf', 'paragraph', 'homepage hed', 'homepage headline', 'body fixed', 'body copy corrected', 'newsletter grab', 'newsletter pull', 'vote passed', 'cleared committee']) }),
    Object.freeze({ tag: 'clipped-source',        tokens: Object.freeze(['acct', 'docs?', 'eod', 'last\\s*4', 'dont', 'wasnt', 'isnt', 'pkg', 'mgmt', 'pls', 'lmk', 'fwd', 'appt', 'b4', 'graf', 'hed', 'speaker tag', 'body fixed', 'newsletter grab']), extraPattern: '\\s[+&]\\s' })
  ]),

  // ---- Donor-text signal categories --------------------------------------
  donorSignals: Object.freeze([
    Object.freeze({ tag: 'careful-reframing',      tokens: Object.freeze(['trying to be careful']) }),
    Object.freeze({ tag: 'contrastive-reframe',    tokens: Object.freeze(['not just that', 'the point is', 'not merely']) }),
    Object.freeze({ tag: 'clarification',          tokens: Object.freeze(['for clarity', 'clarify']) }),
    Object.freeze({ tag: 'procedural-distinction', tokens: Object.freeze(['procedural risk', 'corrective issue', 'underlying issue', 'not credential mismatch']) })
  ]),

  // ---- Signal → primaryMove (precedence-ordered) -------------------------
  // Iterate in order; first matching signal wins. `from` names which signal
  // group to consult.
  primaryMovePrecedence: Object.freeze([
    Object.freeze({ from: 'sourceSignals', signal: 'dependency-chain',      primaryMove: 'evidentiary-dependency' }),
    Object.freeze({ from: 'sourceSignals', signal: 'route-risk-separation', primaryMove: 'route-risk-separation' }),
    Object.freeze({ from: 'sourceSignals', signal: 'unresolved-condition',  primaryMove: 'unresolved-state' }),
    Object.freeze({ from: 'sourceSignals', signal: 'procedural-dead-path',  primaryMove: 'procedural-dead-path' }),
    Object.freeze({ from: 'sourceSignals', signal: 'record-correction',     primaryMove: 'record-correction' }),
    Object.freeze({ from: 'donorSignals',  signal: 'contrastive-reframe',   primaryMove: 'contrastive-reframe' }),
    Object.freeze({ from: 'donorSignals',  signal: 'careful-reframing',     primaryMove: 'careful-reframing' })
  ]),
  defaultPrimaryMove: 'clarification',

  // ---- Discourse scaffolds keyed by primaryMove --------------------------
  primaryMoveScaffolds: Object.freeze({
    'evidentiary-dependency': 'The evidentiary issue is',
    'route-risk-separation':  'The routing issue is',
    'unresolved-state':       'The unresolved condition is',
    'procedural-dead-path':   'The procedural issue is',
    'record-correction':      'The corrective issue is'
  }),

  // ---- Donor-text scaffold patterns (ordered) ----------------------------
  // First match wins. Used by chooseDiscourseScaffold after the primaryMove
  // table fails. The 'for the record' branch is special: it also fires when
  // targetLane === 'formal-record', handled by formalRecordScaffold below.
  donorScaffoldPatterns: Object.freeze([
    Object.freeze({ tokens: Object.freeze(['trying to be careful']),                  scaffold: 'I want to be careful here' }),
    Object.freeze({ tokens: Object.freeze(['trying to be precise', 'precisely']),     scaffold: 'I want to be precise here' }),
    Object.freeze({ tokens: Object.freeze(['not just that', 'the point is']),         scaffold: 'The point is' }),
    Object.freeze({ tokens: Object.freeze(['for clarity', 'clarify']),                scaffold: 'For clarity' }),
    Object.freeze({ tokens: Object.freeze(['for the record']),                        scaffold: 'For the record' })
  ]),
  formalRecordScaffold: 'For the record',

  // ---- Source-text scaffold patterns (ordered) ---------------------------
  sourceScaffoldPatterns: Object.freeze([
    Object.freeze({ tokens: Object.freeze(['stuck', 'missing', 'needs?', 'update', 'blocked', 'delay', 'risk']), scaffold: 'The practical issue is' }),
    Object.freeze({ tokens: Object.freeze(['because', 'so', 'therefore', 'why']),                                scaffold: 'The connective issue is' })
  ]),

  // ---- Target-lane scaffold palette (ordered, indexed by stableChoiceIndex) ---
  scaffoldFallbackByLane: Object.freeze({
    'professional-message': Object.freeze(['For clarity', 'The practical issue is', 'I want to be precise here']),
    _default:               Object.freeze(['The narrower issue is', 'In practical terms', 'The point is'])
  }),

  // ---- Source-text parenthetical patterns (ordered) ----------------------
  sourceParentheticalPatterns: Object.freeze([
    Object.freeze({ tokens: Object.freeze(['unit', 'onboarding', 'mentoring']),             phrase: 'with that dependency made explicit' }),
    Object.freeze({ tokens: Object.freeze(['motel', 'household', 'intake', 'case split']),  phrase: 'with the routing risk kept separate' }),
    Object.freeze({ tokens: Object.freeze(['leak', 'plumber', 'cabinet', 'repair']),        phrase: 'with the unresolved condition preserved' }),
    Object.freeze({ tokens: Object.freeze(['archive', 'grant', 'deliverables', 'catalog']), phrase: 'with the deliverable chain kept intact' })
  ]),

  // ---- Donor-text parenthetical patterns (ordered) -----------------------
  donorParentheticalPatterns: Object.freeze([
    Object.freeze({ tokens: Object.freeze(['not just', 'the point is']),                    phrase: 'with the distinction made explicit' })
  ]),

  // ---- Target-lane parenthetical palette ---------------------------------
  parentheticalFallbackByLane: Object.freeze({
    'formal-record': Object.freeze(['with the evidentiary relation preserved', 'with the sequence kept auditable', 'with the dependency made explicit']),
    _default:        Object.freeze(['with the practical stakes still visible', 'with the connective tissue kept in view', 'with the sequence kept intact'])
  }),

  // ---- scaffoldPhraseToSentence: tag → sentence --------------------------
  primaryMoveSentences: Object.freeze({
    'evidentiary-dependency': 'The dependency remains part of the evidentiary chain.',
    'route-risk-separation':  'The duplicate-intake risk remains separate from denial.',
    'unresolved-state':       'The condition remains unresolved.',
    'procedural-dead-path':   'The failure path remains procedural, not credential-based.',
    'record-correction':      'The correction remains about the record, not merely the surface event.'
  }),

  // ---- scaffoldPhraseToSentence: substring-match → sentence (ordered) ----
  // First match wins. Used for parenthetical phrases like "with that
  // dependency made explicit" → "The dependency remains explicit."
  parentheticalPhraseSentences: Object.freeze([
    Object.freeze({ match: 'that dependency made explicit',  sentence: 'The dependency remains explicit.' }),
    Object.freeze({ match: 'routing risk kept separate',     sentence: 'The routing risk remains separate.' }),
    Object.freeze({ match: 'unresolved condition preserved', sentence: 'The condition remains unresolved.' }),
    Object.freeze({ match: 'deliverable chain kept intact',  sentence: 'The deliverable chain remains intact.' }),
    Object.freeze({ match: 'distinction made explicit',      sentence: 'The distinction remains explicit.' }),
    Object.freeze({ match: 'evidentiary relation preserved', sentence: 'The evidentiary relation remains intact.' }),
    Object.freeze({ match: 'sequence kept auditable',        sentence: 'The sequence remains auditable.' }),
    Object.freeze({ match: 'dependency made explicit',       sentence: 'The dependency remains explicit.' }),
    Object.freeze({ match: 'practical stakes still visible', sentence: 'The practical stakes remain visible.' }),
    Object.freeze({ match: 'connective tissue kept in view', sentence: 'The connective tissue remains visible.' }),
    Object.freeze({ match: 'sequence kept intact',           sentence: 'The sequence remains intact.' })
  ]),

  // ---- isDiscourseScaffoldSentence: substrings that mark scaffold output -
  scaffoldSentenceMarkers: Object.freeze([
    'dependency remains explicit',
    'dependency remains part of the evidentiary chain',
    'routing risk remains separate',
    'duplicate-intake risk remains separate',
    'condition remains unresolved',
    'failure path remains procedural',
    'correction remains about the record',
    'deliverable chain remains intact',
    'distinction remains explicit',
    'evidentiary relation remains intact',
    'sequence remains auditable',
    'practical stakes remain visible',
    'connective tissue remains visible'
  ]),

  // ---- DISCOURSE_SCAFFOLD_PREFIX_PATTERN tokens --------------------------
  // Used by insertHedgePrefix to detect text that already opens with a
  // scaffold and should not be re-prefixed.
  scaffoldPrefixTokens: Object.freeze([
    'maybe',
    'in a sense',
    'i want to be precise here',
    'i want to be careful here',
    'the practical issue is',
    'the connective issue is',
    'the narrower issue is',
    'the point is',
    'for clarity',
    'for the record',
    'what i am trying to say is'
  ]),

  // ---- expectedOperatorsForContext donor-scaffold pressure tokens --------
  donorScaffoldPressureTokens: Object.freeze([
    'i am trying',
    "i'm trying",
    'trying to be careful',
    'the point is',
    'not just that',
    'in a sense'
  ]),

  // ---- expectedOperatorsForContext clipped-source pressure tokens --------
  // Profile-based checks (abbreviationDensity, fragmentPressure) live in the
  // engine as they require numeric thresholds, not vocabulary matching.
  clippedSourcePressureTokens: Object.freeze([
    'acct', 'docs?', 'eod', 'last\\s*4', 'dont', 'wasnt', 'isnt', 'arent',
    'pkg', 'mgmt', 'pls', 'lmk', 'fwd', 'appt',
    'b4', 'graf', 'hed', 'speaker tag', 'body fixed', 'newsletter grab'
  ]),

  // ---- Extra non-word-boundary pattern for clipped-source pressure -------
  // Used alongside clippedSourcePressureTokens to catch shorthand operators
  // like "foo + bar" or "foo & bar" that can't be expressed as \b-anchored.
  clippedSourceExtraPattern: '\\s[+&]\\s'
});

// ---- Compiled regex helpers --------------------------------------------
// Built once at module-load time so the engine functions don't recompile
// per invocation. Kept here next to the data so the regex shape and the
// data shape can't drift independently.

function tokenListToBoundedRegex(tokens, flags = 'i') {
  const joined = tokens.map((t) => String(t)).join('|');
  return new RegExp(`\\b(?:${joined})\\b`, flags);
}

function tokenListToPrefixRegex(tokens, flags = 'i') {
  const joined = tokens.map((t) => String(t)).join('|');
  return new RegExp(`^(?:${joined})\\b`, flags);
}

function buildSourceSignalRegex(entry, flags = 'i') {
  const base = tokenListToBoundedRegex(entry.tokens, flags);
  if (!entry.extraPattern) return base;
  return new RegExp(base.source + '|(?:' + entry.extraPattern + ')', flags);
}

export const DISCOURSE_REGEX = Object.freeze({
  sourceSignal: Object.freeze(Object.fromEntries(
    DISCOURSE_ONTOLOGY.sourceSignals.map((entry) => [entry.tag, buildSourceSignalRegex(entry)])
  )),
  donorSignal: Object.freeze(Object.fromEntries(
    DISCOURSE_ONTOLOGY.donorSignals.map((entry) => [entry.tag, tokenListToBoundedRegex(entry.tokens)])
  )),
  donorScaffold: Object.freeze(DISCOURSE_ONTOLOGY.donorScaffoldPatterns.map((entry) => Object.freeze({
    test: tokenListToBoundedRegex(entry.tokens),
    scaffold: entry.scaffold
  }))),
  sourceScaffold: Object.freeze(DISCOURSE_ONTOLOGY.sourceScaffoldPatterns.map((entry) => Object.freeze({
    test: tokenListToBoundedRegex(entry.tokens),
    scaffold: entry.scaffold
  }))),
  sourceParenthetical: Object.freeze(DISCOURSE_ONTOLOGY.sourceParentheticalPatterns.map((entry) => Object.freeze({
    test: tokenListToBoundedRegex(entry.tokens),
    phrase: entry.phrase
  }))),
  donorParenthetical: Object.freeze(DISCOURSE_ONTOLOGY.donorParentheticalPatterns.map((entry) => Object.freeze({
    test: tokenListToBoundedRegex(entry.tokens),
    phrase: entry.phrase
  }))),
  scaffoldPrefix: tokenListToPrefixRegex(DISCOURSE_ONTOLOGY.scaffoldPrefixTokens),
  donorScaffoldPressure: tokenListToBoundedRegex(DISCOURSE_ONTOLOGY.donorScaffoldPressureTokens),
  clippedSourcePressure: tokenListToBoundedRegex(DISCOURSE_ONTOLOGY.clippedSourcePressureTokens),
  clippedSourceExtra: new RegExp(DISCOURSE_ONTOLOGY.clippedSourceExtraPattern, 'i'),
  scaffoldSentenceMarker: tokenListToBoundedRegex(DISCOURSE_ONTOLOGY.scaffoldSentenceMarkers)
});
