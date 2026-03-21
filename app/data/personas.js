const personas = [
  {
    id: 'archivist',
    name: 'Archivist',
    blurb: 'Long lines, witness-first syntax, and low contraction. Treats cadence like a sealed ledger.',
    chips: ['long line', 'witness ledger', 'low contraction'],
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
    blurb: 'Short bursts, bright punctuation, and fast field pull. Turns contact into immediate motion.',
    chips: ['quick burst', 'bright signal', 'public lure'],
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
    blurb: 'Recursive return, delayed landing, and pressure that re-enters before it resolves.',
    chips: ['slow pull', 'recursive return', 'afterimage'],
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
    blurb: 'Clipped route language, low ornament, and clean handoff under containment.',
    chips: ['controlled', 'route-clean', 'quiet precision'],
    mod: {
      sent: 0,
      cont: -1,
      punc: -1
    },
    source: 'built-in'
  },
  {
    id: 'methods-editor',
    name: 'Methods Editor',
    blurb: 'Law-facing cadence, measured caveats, and claims reduced to portable schema.',
    chips: ['measured', 'schema-minded', 'clear caveats'],
    mod: {
      sent: 1,
      cont: -1,
      punc: 0
    },
    source: 'built-in'
  }
];

export default personas;
