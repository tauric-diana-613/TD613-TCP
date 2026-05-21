const phase24HushMasks = [
  {
    id: 'phase24-clear-record',
    label: 'Phase 24 Clear Record',
    family: 'clear record note',
    description: 'Plain, coherent record voice for normalizing jagged notes while preserving IDs, dates, sequence, and caveats.',
    intendedUse: 'Use when a rough record note needs clearer prose without losing timing or version details.',
    riskTell: 'Can sound formal if used for casual masking; review tone before sharing.',
    sampleSeed: 'The record should keep the sequence narrow. FILE-72 should remain tied to the same export minute. One copy includes the footer and one copy does not. The explanation may be a template issue, but the mismatch should remain visible. INV-440 should stay tied to 2:18, Jordan, the resend hold, finance, and the version question.',
    profileTargets: {},
    transformHints: { sentence: 'clear-mid', ornament: 'low', warmth: 'low', custody: 'very-high', cadence: 'plain-record' },
    pressureWarnings: ['preserve IDs', 'preserve timestamps', 'preserve version context', 'review caveats']
  }
];

export default phase24HushMasks;
