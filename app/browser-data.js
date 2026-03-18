window.TCP_DATA = {
  defaults: {
    voiceA:
      'Upon review of accession records, conservators determined that restricted handling should remain in force until every transfer, annotation, environmental deviation, and custodial variance had been reconciled against the provenance register; only after the missing interval was reconstructed, earlier seals were cross-checked, and archival discrepancies were formally resolved could reclassification proceed without contaminating evidentiary continuity. Consequently, the memorandum retained cumulative syntax, subordinate clauses, and restrained qualifiers, because premature compression would convert a custody sequence into mere confidence theater.',
    voiceB:
      "land yet\nland yet\nno\ncut lights\nrun again\ncan't wait\ndon't smooth\nhit send\nmissed again\nhit send\nmove now\nmove now",
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
    },
    {
      id: 'methods-editor',
      name: 'Methods Editor',
      blurb: 'Measured lines, explicit caveats, and a human research memo cadence.',
      chips: ['measured', 'clear caveats', 'research memo'],
      mod: { sent: 1, cont: -1, punc: 0 },
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
