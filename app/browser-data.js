window.TCP_DATA = {
  defaults: {
    voiceA:
      'The room kept returning something close to recognition without ever handing me the route. It was not quite repair. It was pressure. The same punctuation habits kept finding me before the explanation could.',
    voiceB:
      "I thought it was just tone. Then the clause rhythm repeated, the contractions landed in the same places, and the whole thing started feeling traceable in a way that was a little too intimate.",
    badge: 'badge.holds',
    mirror_logic: 'off',
    containment: 'on'
  },
  basePersonas: [
    {
      id: 'archivist',
      name: 'Archivist',
      blurb: 'Longer cadence. Lower contraction rate. Quiet continuity pressure.',
      chips: ['long line', 'receipt-minded', 'low contraction'],
      mod: { sent: 2, cont: -2, punc: 1 },
      source: 'built-in'
    },
    {
      id: 'spark',
      name: 'Spark',
      blurb: 'Shorter bursts. Brighter punctuation. Public lure without losing the trace.',
      chips: ['quick burst', 'bright punctuation', 'public lure'],
      mod: { sent: -2, cont: 1, punc: 3 },
      source: 'built-in'
    },
    {
      id: 'undertow',
      name: 'Undertow',
      blurb: 'Slow gravity. Recursive return. The afterimage arrives before the prose does.',
      chips: ['slow pull', 'recursive', 'afterimage'],
      mod: { sent: 1, cont: 0, punc: 0 },
      source: 'built-in'
    },
    {
      id: 'operator',
      name: 'Operator',
      blurb: 'Tighter rhythm. Lower ornament. Cleaner route pressure.',
      chips: ['controlled', 'cooler room', 'quiet precision'],
      mod: { sent: 0, cont: -1, punc: -1 },
      source: 'built-in'
    }
  ],
  microcopy: {
    hero_title: 'TCP - The Cadence Playground',
    hero_lead:
      'Throw two voices into the room, watch the pattern light up, and see whether recognition can find a route before the signal slips into static.',
    compare_hint: 'Resemblance is gathering, but it still needs a route.',
    mirror_off: 'Mirror shield is armed. Public play stays legible without turning into spectacle.',
    route_warning: 'Recognition is outrunning explanation. Keep the branch open.',
    harbor_success: 'Harbor locked in. Provenance is holding above threshold.',
    criticality_warning: 'Recognition is gathering, but the field has not produced passage yet.',
    receipt_created: 'A receipt hit the ledger before interpretive expansion.',
    ledger_footer:
      'If the loop hardens before repair arrives, switch to harbor and keep the provenance.'
  }
};
