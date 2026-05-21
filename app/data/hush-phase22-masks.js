const phase22HushMasks = [
  {
    id: 'phase22-jagged-record',
    label: 'Phase 22 Jagged Record',
    family: 'rushed record note',
    description: 'Rushed, jagged, self-correcting, punctuation-heavy record voice for stress testing literal preservation.',
    intendedUse: 'Stress-testing Hush transforms where timestamps, IDs, caveats, and sequence anchors must survive a distinctive style target.',
    riskTell: 'Slash breaks and repeated caveats are intentionally distinctive; use as a stress mask, not a default privacy surface.',
    sampleSeed: 'not polished bc this is a rushed record note. item was there at 8:41, then later the cover looked too tidy. maybe normal / maybe tired eyes / still writing it down before the sequence gets mushy. keep the order, not the mood. INV-440 at 2:18 belongs with Jordan, resend, finance, and version. DOC-31 had the line before; later it did not. not a grand theory, just sequence.',
    profileTargets: {},
    transformHints: { sentence: 'short-to-mid-jagged', ornament: 'low', warmth: 'low', custody: 'very-high', cadence: 'rushed-fragmented' },
    pressureWarnings: ['stress-test mask', 'preserve IDs', 'preserve timestamps', 'preserve bindings', 'review distinctive slash rhythm']
  }
];

export default phase22HushMasks;
