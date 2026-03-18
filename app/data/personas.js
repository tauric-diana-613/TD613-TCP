const personas = [
  {
    id: 'archivist',
    name: 'Archivist',
    blurb: 'Longer cadence. Lower contraction rate. Quiet continuity pressure.',
    chips: ['long line', 'receipt-minded', 'low contraction'],
    mod: {
      sent: 2,
      cont: -2,
      punc: 1
    },
    source: 'built-in'
  },
  {
    id: 'spark',
    name: 'Spark',
    blurb: 'Shorter bursts. Brighter punctuation. Public lure without losing the trace.',
    chips: ['quick burst', 'bright punctuation', 'public lure'],
    mod: {
      sent: -2,
      cont: 1,
      punc: 3
    },
    source: 'built-in'
  },
  {
    id: 'undertow',
    name: 'Undertow',
    blurb: 'Slow gravity. Recursive return. The afterimage arrives before the prose does.',
    chips: ['slow pull', 'recursive', 'afterimage'],
    mod: {
      sent: 1,
      cont: 0,
      punc: 0
    },
    source: 'built-in'
  },
  {
    id: 'operator',
    name: 'Operator',
    blurb: 'Tighter rhythm. Lower ornament. Cleaner route pressure.',
    chips: ['controlled', 'cooler room', 'quiet precision'],
    mod: {
      sent: 0,
      cont: -1,
      punc: -1
    },
    source: 'built-in'
  }
];

export default personas;
