const phase27HushMasks = [
  {
    id: 'phase27-register-preserve',
    label: 'Phase 27 Register Preserve',
    family: 'register custody',
    description: 'Preserves source register while protecting sequence, caveats, and event shape.',
    intendedUse: 'Use when messy, chat-like, or dialect-marked source text should stay in its own register while Hush masks identity.',
    riskTell: 'Preserves informal surface; not intended for formal filing output.',
    sampleSeed: 'girl keep the note how it moves. FILE-72 still gotta stay tied to the same minute, one copy with footer and one without. maybe template, cool, but do not clean the mismatch into nothing.',
    profileTargets: {},
    transformHints: { sentence: 'source-shaped', ornament: 'low', warmth: 'medium', custody: 'very-high', cadence: 'register-preserve' },
    pressureWarnings: ['preserve register', 'preserve caveats', 'preserve event shape']
  },
  {
    id: 'phase27-clear-with-cadence',
    label: 'Phase 27 Clear With Cadence',
    family: 'clear register custody',
    description: 'Clarifies rough notes while retaining meaningful register signals and hedges.',
    intendedUse: 'Use when a rough note needs clarity without converting the speaker into generic formal prose.',
    riskTell: 'May preserve more informal structure than expected; use formalize mode when formal prose is required.',
    sampleSeed: 'The point should stay clear without stripping the way the speaker framed it. FILE-72 should remain tied to the same export minute, and the footer mismatch should stay visible. If the source says maybe, the output should not become certainty.',
    profileTargets: {},
    transformHints: { sentence: 'clear-mid', ornament: 'low', warmth: 'low-medium', custody: 'very-high', cadence: 'clear-with-cadence' },
    pressureWarnings: ['do not inflate certainty', 'preserve hedges', 'preserve source relation']
  },
  {
    id: 'phase27-chat-custody',
    label: 'Phase 27 Chat Custody',
    family: 'chat custody',
    description: 'Preserves chatspeak, shorthand, affect, and compact signal while retaining event shape.',
    intendedUse: 'Use for group-message style, rushed mobile notes, and abbreviation-heavy text.',
    riskTell: 'Designed for chat-like notes, not formal output.',
    sampleSeed: 'idk maybe it is nothing but FILE-72 having same minute plus one footer and one no footer is the thing. like do not make it dramatic, just do not erase it fr.',
    profileTargets: {},
    transformHints: { sentence: 'compact-chat', ornament: 'low', warmth: 'medium', custody: 'high', cadence: 'chat-custody' },
    pressureWarnings: ['preserve abbreviations', 'preserve affect', 'review certainty']
  },
  {
    id: 'phase27-blip-bridge',
    label: 'Phase 27 Blip Bridge',
    family: 'shorthand relay bridge',
    description: 'Uses the repo-native Blip shorthand-relay posture as a Hush bridge mask.',
    intendedUse: 'Use when a clean passage needs evidenced shorthand, clipped grammar, and compact signal without parody.',
    riskTell: 'Abbreviation posture, lowercase drift, and social-platform markers can cling hard after contact.',
    sampleSeed: 'small note big route. FILE-72 same minute, one copy footer, one not. maybe template, maybe nothing, but keep the mismatch. Blip keeps shorthand legible without turning it into a joke.',
    profileTargets: {},
    transformHints: { sentence: 'short-compact', ornament: 'low', warmth: 'medium', custody: 'high', cadence: 'blip-bridge' },
    pressureWarnings: ['shorthand relay', 'review abbreviation drift', 'preserve event shape']
  }
];

export default phase27HushMasks;
