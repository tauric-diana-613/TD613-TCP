const personas = [
  {
    id: 'archivist',
    name: 'Archivist',
    blurb: 'Witness-ledger mask. Stretches the line, lowers contraction, and keeps the record sealed.',
    chips: ['ledger raven', 'witness-first', 'low contraction'],
    profileRecipe: {
      blend: [
        { sampleId: 'witness-statement', weight: 0.65 },
        { sampleId: 'institutional-memo', weight: 0.35 }
      ],
      overlayMod: {
        sent: 2,
        cont: -2,
        punc: 0
      },
      strength: 0.9
    },
    maskVisualClass: 'ledger-raven',
    maskArtLabel: 'ledger raven',
    maskSigil: '[]',
    maskState: 'mask ready',
    source: 'built-in'
  },
  {
    id: 'spark',
    name: 'Spark',
    blurb: 'Signal-jackal mask. Shortens the line, sharpens the punctuation, and pushes the text into public motion.',
    chips: ['signal jackal', 'bright punctuation', 'public pull'],
    profileRecipe: {
      blend: [
        { sampleId: 'operations-brief', weight: 0.8 },
        { sampleId: 'critical-review', weight: 0.2 }
      ],
      overlayMod: {
        sent: -3,
        cont: 3,
        punc: 3
      },
      strength: 0.9
    },
    maskVisualClass: 'signal-jackal',
    maskArtLabel: 'signal jackal',
    maskSigil: '++',
    maskState: 'mask ready',
    source: 'built-in'
  },
  {
    id: 'undertow',
    name: 'Undertow',
    blurb: 'Velvet-eel mask. Keeps circling back, stretches the clause, and lets the afterimage land late.',
    chips: ['velvet eel', 'recursive return', 'late landing'],
    profileRecipe: {
      blend: [
        { sampleId: 'recursive-debrief', weight: 0.85 },
        { sampleId: 'critical-review', weight: 0.15 }
      ],
      overlayMod: {
        sent: 2,
        cont: 0,
        punc: 0
      },
      strength: 0.89
    },
    maskVisualClass: 'velvet-eel',
    maskArtLabel: 'velvet eel',
    maskSigil: '~~',
    maskState: 'mask ready',
    source: 'built-in'
  },
  {
    id: 'operator',
    name: 'Operator',
    blurb: 'Quiet-hound mask. Clips ornament, lowers pulse, and keeps route language clean under pressure.',
    chips: ['quiet hound', 'route-clean', 'low ornament'],
    profileRecipe: {
      blend: [
        { sampleId: 'operations-brief', weight: 0.55 },
        { sampleId: 'witness-statement', weight: 0.45 }
      ],
      overlayMod: {
        sent: -3,
        cont: -2,
        punc: -2
      },
      strength: 0.87
    },
    maskVisualClass: 'quiet-hound',
    maskArtLabel: 'quiet hound',
    maskSigil: '//',
    maskState: 'mask ready',
    source: 'built-in'
  },
  {
    id: 'methods-editor',
    name: 'Methods Editor',
    blurb: 'Schema-moth mask. Formal, caveated, and cold enough to carry a claim without overfitting it.',
    chips: ['schema moth', 'measured caveats', 'formal schema'],
    profileRecipe: {
      blend: [
        { sampleId: 'deliberative-hedged', weight: 0.55 },
        { sampleId: 'grant-narrative', weight: 0.45 }
      ],
      overlayMod: {
        sent: 2,
        cont: -2,
        punc: -1
      },
      strength: 0.87
    },
    maskVisualClass: 'schema-moth',
    maskArtLabel: 'schema moth',
    maskSigil: '::',
    maskState: 'mask ready',
    source: 'built-in'
  }
];

export default personas;
