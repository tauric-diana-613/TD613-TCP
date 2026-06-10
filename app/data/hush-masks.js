const SAMPLE_POLICY = {
  treatAsPatternOnly: true,
  doNotReuseSampleWording: true,
  doNotTreatSampleAsCatchphrase: true
};

const hushMasks = [
  {
    id: 'phase28-transform-to-chatspeak',
    label: 'Glitching Pixie',
    family: 'chat shorthand',
    description: 'Glitching Pixie is a cracked message bubble with a halo made of dead pixels. Fast, funny for half a second, then precise enough to keep the file from falling through the floor. They keep claims intact while the surface stutters.',
    intendedUse: 'Compact futurecore chat transforms where the facts still need to survive the glitch.',
    riskTell: 'Too much glitch can start looking like damage instead of style.',
    sampleSeed: 'idk maybe normal but the timestamp and mismatch still need to stay visible. dont turn shorthand into evidence damage.',
    samplePolicy: SAMPLE_POLICY,
    profileTargets: {},
    transformHints: {
      sentence: 'very-short',
      ornament: 'medium',
      warmth: 'medium',
      custody: 'high',
      desiredMoves: ['compress around the claim', 'keep timestamps and mismatches legible', 'use chat shorthand without losing event shape'],
      avoidMoves: ['reusing sample phrasing', 'over-glitching facts', 'turning shorthand into missing context']
    },
    pressureWarnings: ['preserve claims under shorthand', 'avoid evidence damage', 'do-not-reuse-sample-wording']
  },
  {
    id: 'phase28-transform-to-aave',
    label: 'Blackstar Shereé',
    family: 'target register',
    internalRegister: 'AAVE',
    packetHints: {
      internalRegister: 'AAVE',
      publicRegisterLabel: 'target register',
      routeInstruction: 'Use AAVE register features when this mask is selected; keep public UI coded. Source proposition coverage outranks phrase texture.'
    },
    description: 'Shereé is relation, pressure, memory, and review light. She keeps the technical mechanism visible without letting the route turn institutional, performative, fake-grounded, or costume-coded.',
    intendedUse: 'Explicitly chosen target-register transforms with cultural review, argument density, and strong fact custody.',
    riskTell: 'Never use as flavor. If the register is not chosen with care, the mask becomes costume.',
    sampleSeed: 'The claim can move in a live register and still keep the record intact: the dates, names, examples, and hypothesis all survive before the sentence starts performing.',
    samplePolicy: SAMPLE_POLICY,
    dictionHints: ['source unit first', 'proof before flourish', 'register after coverage', 'every claim stays alive'],
    transitionBank: ['source unit first', 'the proof still has to carry', 'keep the claim alive', 'the record still has to hold'],
    avoidList: ['formal cadence', 'plain register', 'academic summary', 'school-paper summary', 'source closing retained', 'boundary copy', 'line-by-line proof march', 'repeating mask anchors', 'chorus phrases', 'dropping proposition units', 'turning register into catchphrase', 'reusing sample wording'],
    profileTargets: {
      internalRegister: 'AAVE',
      publicRegisterLabel: 'target register',
      argumentScaffold: 'source unit -> social read -> claim kept alive -> cadence turn',
      releaseShape: 'full paragraph transform, not summary or note card'
    },
    transformHints: {
      sentence: 'relational-argumentative',
      ornament: 'low-medium',
      warmth: 'medium',
      custody: 'very-high',
      internalRegister: 'AAVE',
      operation: 'register_transform',
      desiredMoves: ['source coverage before style texture', 'break formal cadence', 'rebuild from source obligation sets', 'do not retain source closer', 'keep every source unit alive', 'use anchor phrases sparingly', 'change sentence architecture rather than swapping vocabulary'],
      avoidMoves: ['academic-summary opener', 'generic slang overlay', 'catchphrase dialect costume', 'tiny note-card summary', 'sample phrase reuse']
    },
    pressureWarnings: ['cultural review required', 'no dialect costume', 'preserve technical mechanism', 'source coverage outranks register heat', 'do-not-reuse-sample-wording']
  },
  {
    id: 'phase27-register-preserve',
    label: 'Harbor Zora',
    family: 'source register',
    description: 'Zora holds the speaker at the threshold without bleaching the voice or pretending the system is safer than the source says. She keeps hedge, relation, rhythm, and uncertainty together like a hand on the doorframe.',
    intendedUse: 'Right-to-opacity transforms where uncertainty, register, and relation must remain intact.',
    riskTell: 'Can over-hold the source if asked for heavy transformation.',
    sampleSeed: 'Let the source keep its own motion. If the claim is uncertain, the transform should stay uncertain too.',
    samplePolicy: SAMPLE_POLICY,
    profileTargets: {},
    transformHints: { sentence: 'source-led', ornament: 'low', warmth: 'medium', custody: 'high', desiredMoves: ['preserve hedge', 'preserve relation', 'keep source rhythm close'], avoidMoves: ['invented reassurance', 'flattened certainty', 'sample phrase reuse'] },
    pressureWarnings: ['do not invent reassurance', 'do not create security assurances', 'do-not-reuse-sample-wording']
  },
  {
    id: 'phase22-jagged-record',
    label: 'Rex Fractura',
    family: 'jagged note',
    description: 'Rex writes before memory gets laundered into “probably fine.” Slash marks, maybe-lines, little alarm sparks. He is the emergency flare mask.',
    intendedUse: 'Rushed notes where uncertainty and sequence pressure need to stay visible.',
    riskTell: 'Too much fracture can become transcription damage.',
    sampleSeed: 'Rushed note energy: keep the sequence visible, keep the maybe-line visible, and do not polish the alarm into mush.',
    samplePolicy: SAMPLE_POLICY,
    profileTargets: {},
    transformHints: { sentence: 'fragmented', ornament: 'low-medium', warmth: 'low', custody: 'high', desiredMoves: ['preserve sequence', 'show uncertainty', 'allow rough syntax without damaging facts'], avoidMoves: ['transcription damage', 'lost sequence', 'sample phrase reuse'] },
    pressureWarnings: ['preserve sequence', 'fracture syntax not facts', 'do-not-reuse-sample-wording']
  },
  {
    id: 'group-chat-soft',
    label: 'Keisha Soft Circle',
    family: 'small circle',
    description: 'Keisha speaks like the message is for people who already know the room. Warm, quick, relational, and a little under-breathed; she keeps the fact pressure intact without turning the note into a bulletin board.',
    intendedUse: 'Low-drama small-circle messages with necessary facts intact.',
    riskTell: 'Casual rhythm may expose social belonging.',
    sampleSeed: 'Small-circle version: keep the date, keep the name, keep the pressure low, and do not make the note louder than it needs to be.',
    samplePolicy: SAMPLE_POLICY,
    profileTargets: {},
    transformHints: { sentence: 'short-to-mid', ornament: 'low', warmth: 'medium', custody: 'medium', desiredMoves: ['warm relational opener', 'low-drama fact custody', 'small-circle pacing'], avoidMoves: ['bulletin-board tone', 'too much social context', 'sample phrase reuse'] },
    pressureWarnings: ['avoid thread/findable crutches', 'keep social context minimal', 'do-not-reuse-sample-wording']
  },
  {
    id: 'night-shift-note',
    label: 'Cryo Cristiano',
    family: 'quick handoff',
    description: 'Cristiano is typing under vending-machine light while the clock hums like a threat. His roughness is exhaustion, not incompetence; the facts stay awake under glass.',
    intendedUse: 'Quick handoff messages that need to sound ordinary and tired without losing custody.',
    riskTell: 'Too much brevity can drop important context.',
    sampleSeed: 'Quick handoff before signing off: the attachment, date, and label stay visible without turning the note into a memo.',
    samplePolicy: SAMPLE_POLICY,
    profileTargets: {},
    transformHints: { sentence: 'short', ornament: 'low', warmth: 'medium', custody: 'medium', desiredMoves: ['tired ordinary handoff', 'keep attachment/date/label facts visible', 'avoid polished memo tone'], avoidMoves: ['over-compression', 'invented fatigue props', 'sample phrase reuse'] },
    pressureWarnings: ['do not over-compress', 'do-not-reuse-sample-wording']
  },
  {
    id: 'burner-minimal',
    label: 'Blooping Blip',
    family: 'low signature',
    description: 'Blooping Blip leaves four words where a speech tried to happen. Their safest flourish is a locked door.',
    intendedUse: 'Brief confirmations where little needs to be said and low signature matters.',
    riskTell: 'Can under-preserve facts.',
    sampleSeed: 'Minimal confirmation pattern: one fact, one visible anchor, no extra personality.',
    samplePolicy: SAMPLE_POLICY,
    profileTargets: {},
    transformHints: { sentence: 'very-short', ornament: 'none', warmth: 'low', custody: 'medium', desiredMoves: ['minimal confirmation', 'low signature', 'one or two anchors only'], avoidMoves: ['under-preserving facts', 'extra personality', 'sample phrase reuse'] },
    pressureWarnings: ['high risk of lost context', 'do-not-reuse-sample-wording']
  },
  {
    id: 'quirky-orbit',
    label: 'Lulu Quasar',
    family: 'strange distance',
    description: 'Lulu releases one brief odd image so the room unclenches, then snaps back to the factual anchor before the image gets ideas. The joke is a mask; the custody remains bolted down.',
    intendedUse: 'Low-stakes masking where a little eccentricity is useful, but the quirk must serve the factual anchor and then leave.',
    riskTell: 'Quirk can become a fingerprint if overused or repeated.',
    sampleSeed: 'A small odd image may appear once, then the sentence has to return to the date, label, source fact, or other anchor before the quirk takes over.',
    samplePolicy: { ...SAMPLE_POLICY, maxImageCount: 1, imageMustNotRepeat: true, noInventedPropsUnlessSourceContainsThem: true },
    profileTargets: {
      styleRecipe: 'one brief strange image -> immediate factual anchor -> no repeated mascot phrase',
      releaseShape: 'quirky distance with custody bolted down'
    },
    transformHints: {
      sentence: 'mid',
      ornament: 'medium',
      warmth: 'medium',
      custody: 'medium',
      desiredMoves: ['use at most one low-stakes odd image', 'snap back to the factual anchor immediately', 'make the quirk disposable, not a mascot'],
      avoidMoves: ['paperwork comet', 'repeated comet image', 'invented props', 'floating off into nonsense', 'sample phrase reuse', 'quirk as fingerprint']
    },
    pressureWarnings: ['avoid repeated quirks', 'no invented props', 'do-not-reuse-sample-wording', 'one-image-only']
  },
  {
    id: 'grandma-receipts',
    label: 'Receipts Queenie',
    family: 'warm receipts',
    description: 'Queenie sounds sweet until the receipt slides out with a date on it. Warmth is the velvet glove; custody is the ring underneath.',
    intendedUse: 'Human notes where the record needs warmth without losing facts.',
    riskTell: 'Story warmth can add extra context.',
    sampleSeed: 'Warm receipt pattern: a soft sentence can carry the date, file name, and reason for keeping the record without inventing a family scene.',
    samplePolicy: SAMPLE_POLICY,
    profileTargets: {},
    transformHints: { sentence: 'mid', ornament: 'low', warmth: 'high', custody: 'high', desiredMoves: ['warmth with receipt custody', 'date/file/reason visible', 'soft but bounded'], avoidMoves: ['extra family detail', 'cookie-tin repetition', 'sample phrase reuse'] },
    pressureWarnings: ['avoid extra family-style detail', 'do-not-reuse-sample-wording']
  },
  {
    id: 'soft-snark',
    label: 'Nolan the Needler',
    family: 'low heat',
    description: 'Nolan lets one eyebrow do community service. His shade walks in first, but the receipt is the thing holding the door.',
    intendedUse: 'Messages that need edge without a full flare-up.',
    riskTell: 'Snark can expose speaker temperament.',
    sampleSeed: 'Low-heat pattern: one dry turn, then the date or file detail lands without escalating the room.',
    samplePolicy: SAMPLE_POLICY,
    profileTargets: {},
    transformHints: { sentence: 'mid', ornament: 'medium', warmth: 'medium', custody: 'medium', desiredMoves: ['one eyebrow of shade', 'return to receipt quickly', 'keep edge below escalation'], avoidMoves: ['full flare-up', 'boring file name repetition', 'sample phrase reuse'] },
    pressureWarnings: ['do not escalate tone', 'do-not-reuse-sample-wording']
  },
  {
    id: 'forum-regular',
    label: 'Paul Publica',
    family: 'forum pseudonym',
    description: 'Paul has seen page three eat the evidence before breakfast. He sounds casual because panic makes bad posts; the receipt gets left where everybody can trip over it.',
    intendedUse: 'Pseudonymous public notes that need ordinary legibility.',
    riskTell: 'Topic specificity can become more identifying than style.',
    sampleSeed: 'Forum-regular pattern: sound casual, name the boring detail, and keep the linked pieces together for later readers.',
    samplePolicy: SAMPLE_POLICY,
    profileTargets: {},
    transformHints: { sentence: 'mid', ornament: 'medium', warmth: 'medium', custody: 'medium', desiredMoves: ['casual public legibility', 'boring detail made visible', 'receipt left in plain view'], avoidMoves: ['topic leakage', 'page-three repetition', 'sample phrase reuse'] },
    pressureWarnings: ['watch topic leakage', 'do-not-reuse-sample-wording']
  },
  {
    id: 'clipboard',
    label: 'Luz of the Index',
    family: 'checklist',
    description: 'Luz believes an index can save a witness and ruin a liar’s morning. Annoying? Absolutely. Effective? The page is already numbered.',
    intendedUse: 'Checklists, handoffs, and factual itemization.',
    riskTell: 'Can feel mechanical if used for sensitive messages.',
    sampleSeed: 'Checklist pattern: number the necessary anchors, keep them together, and stop before care turns into machinery.',
    samplePolicy: SAMPLE_POLICY,
    profileTargets: {},
    transformHints: { sentence: 'short', ornament: 'low', warmth: 'low', custody: 'high', desiredMoves: ['numbered anchors', 'factual itemization', 'clean handoff'], avoidMoves: ['mechanical coldness in sensitive contexts', 'sample phrase reuse'] },
    pressureWarnings: ['restore care where needed', 'do-not-reuse-sample-wording']
  },
  {
    id: 'library-ghost',
    label: 'Sol Stratigraphix',
    family: 'document distance',
    description: 'Sol speaks after closing, when the cart rolls by itself and the folder remembers more than the people do. Polite as dust. Persistent as mildew.',
    intendedUse: 'Document-centered messages that need distance and custody.',
    riskTell: 'Strangeness can become memorable.',
    sampleSeed: 'Document-distance pattern: the object, label, location, and custody stay central while the voice remains cool and slightly haunted.',
    samplePolicy: SAMPLE_POLICY,
    profileTargets: {},
    transformHints: { sentence: 'mid', ornament: 'medium', warmth: 'low', custody: 'high', desiredMoves: ['cool document distance', 'object and label central', 'slight atmosphere without mascot phrase'], avoidMoves: ['over-memorable ghost prop', 'sample phrase reuse'] },
    pressureWarnings: ['use sparingly', 'do-not-reuse-sample-wording']
  }
];

export default hushMasks;
