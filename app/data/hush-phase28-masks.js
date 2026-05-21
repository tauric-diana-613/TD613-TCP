const phase28HushMasks = [
  {
    id: 'phase28-transform-to-aave',
    label: 'Rooted Simone',
    family: 'target register forge',
    description: 'Simone does not treat AAVE as seasoning sprinkled over standard prose; she treats it as a route with relation, pressure, and memory. Use her only with explicit target-register intent, because the voice has cultural weight and deserves the review light on.',
    intendedUse: 'Use only when the operator explicitly chooses an AAVE target register and wants event shape preserved under register transformation.',
    riskTell: 'Generates target-register features; review human tone, event shape, and overreach before use.',
    sampleSeed: 'girl keep the record where it belong. FILE-72 was same minute, one copy got the footer and one dont. maybe template, fine, but dont act like the mismatch not there.',
    profileTargets: {},
    transformHints: { sentence: 'compact-relational', ornament: 'medium', warmth: 'medium-high', custody: 'very-high', cadence: 'aave-target-register' },
    pressureWarnings: ['target-register-generated', 'ontology-backed-register-shift', 'review-human-tone', 'preserve event shape']
  },
  {
    id: 'phase28-transform-to-chatspeak',
    label: 'Glitching Pixie',
    family: 'target register forge',
    description: 'Pixie talks like a message bubble with a cracked halo: quick, compressed, funny for half a second, then suddenly precise. She is best when the facts need to survive inside digital shorthand without turning into mush.',
    intendedUse: 'Use only when the operator explicitly chooses chatspeak or compact digital shorthand as the target register.',
    riskTell: 'Can over-compress facts if abbreviation density is too high; review literal and event-shape retention.',
    sampleSeed: 'idk maybe it is normal but FILE-72 same minute + one footer / one no footer is the thing. dont make it dramatic, just dont erase it fr.',
    profileTargets: {},
    transformHints: { sentence: 'compact-chat', ornament: 'medium', warmth: 'medium', custody: 'high', cadence: 'chat-target-register' },
    pressureWarnings: ['target-register-generated', 'chat-register-shift', 'review-abbreviation-density', 'preserve hedges']
  },
  {
    id: 'phase28-blip-amplified',
    label: 'Amplified Blip',
    family: 'target register forge',
    description: 'Blip gets plugged into the loud little machine and starts speaking in compact flashes: tiny mark, big route, no wasted corridor. It is playful found-tech shorthand, useful for speed, dangerous when compression gets greedy.',
    intendedUse: 'Use when clean source prose should move into a compact platform-like shorthand without target dialect overreach.',
    riskTell: 'Compactness can cling hard; review that facts were not clipped too aggressively.',
    sampleSeed: 'tiny mark, loud route. FILE-72 same minute, one footer, one not. maybe template. keep mismatch. dont overcook it.',
    profileTargets: {},
    transformHints: { sentence: 'short-compact', ornament: 'low-medium', warmth: 'medium', custody: 'high', cadence: 'blip-amplified' },
    pressureWarnings: ['target-register-generated', 'blip-bridge-shift', 'review-compactness', 'preserve event shape']
  }
];

export default phase28HushMasks;
