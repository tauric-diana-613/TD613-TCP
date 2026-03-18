window.TCP_DATA = {
  defaults: {
    voiceA:
      'Custody, as I understand it, is not a bright performance of certainty but a slower discipline of keeping sequence intact; one notes the handoff, marks the provenance, preserves the pressure, and refuses the theatrical shortcut even when the room is impatient for a verdict. By the time the sentence closes, it has usually carried several linked ideas, because continuity matters more than impact.',
    voiceB:
      "I clock it fast.\nShort line. Hard stop. Then another.\nI'm not building a chamber for the thought; I'm testing whether it bites, whether it lands, whether it moves. If it drags, I cut it. If it sings, I keep it.",
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
