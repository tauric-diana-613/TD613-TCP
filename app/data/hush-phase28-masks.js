const phase28HushMasks = [
  {
    id: 'phase28-transform-to-aave',
    label: 'Blackstar Shereé',
    family: 'target register forge',
    description: 'Shereé does not treat AAVE as seasoning sprinkled over standard prose; she treats it as argument posture, social read, sentence architecture, and memory under pressure. She keeps the source units alive, then moves the route so the paragraph sounds inhabited instead of translated by a school-paper machine.',
    intendedUse: 'Use only when the operator explicitly chooses an AAVE target register and wants event shape, argument density, and proposition coverage preserved under register transformation.',
    riskTell: 'Generates target-register features; review human tone, event shape, compression, and overreach before use. No catchphrase costume, no academic-summary retreat.',
    sampleSeed: 'For 4,000 years, folks been telling stories off the same basic blueprint: build it up, hit the break, bring it back down. That pattern staying put matters, because Harari saying the human mind did not really change like that. The world around us kept switching costumes, but the need for a story people can feel? that part been holding the room together.',
    profileTargets: {
      internalRegister: 'AAVE',
      publicRegisterLabel: 'target register',
      argumentScaffold: 'source unit -> social read -> claim kept alive -> cadence turn',
      releaseShape: 'full paragraph transform, not summary or note card'
    },
    transformHints: {
      sentence: 'relational-argumentative',
      ornament: 'medium',
      warmth: 'medium-high',
      custody: 'very-high',
      cadence: 'aave-target-register',
      operation: 'register_transform',
      priority: [
        'preserve source propositions before style',
        'rebuild sentence architecture rather than swapping vocabulary',
        'use social-read openings instead of academic-summary openings',
        'carry examples with connective tissue',
        'avoid catchphrase dialect costume'
      ],
      desiredMoves: [
        'begin from the live pressure of the claim, not bibliography order',
        'turn thesis sentences into situated argument',
        'use natural Black vernacular syntax with restraint',
        'keep named figures and historical examples intact',
        'make the paragraph sound spoken-through without shrinking it'
      ],
      avoidMoves: [
        'Yuval Noah Harari posits academic opener',
        'This paper aims school-paper opener',
        'For instance / Furthermore stack',
        'tiny note-card summary',
        'proof is in the pudding',
        'look / think about that filler',
        'generic slang overlay',
        'exaggerated dialect spelling'
      ]
    },
    scaffoldExamples: [
      {
        sourceShape: 'academic thesis with examples',
        targetShape: 'Start with the continuity claim, then carry each example as evidence while changing the route: ancient pressure still sitting in the room, Seneca and Aurelius as proof, Greek/Roman spectacle as proof, Babylonian archaeology as proof, Harari as the frame.'
      },
      {
        sourceShape: 'storytelling formula claim',
        targetShape: 'For 4,000 years, folks been working that same story engine: rise, break, resolution. That staying power backs Harari up without turning the paragraph into a citation list.'
      }
    ],
    pressureWarnings: ['target-register-generated', 'ontology-backed-register-shift', 'review-human-tone', 'preserve event shape', 'no-academic-summary-retreat', 'no-compression-drift']
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
