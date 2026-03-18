window.TCP_DATA = {
  defaults: {
    voiceA:
      "Honestly, I wasn't trying to make a speech. I just kept circling the story because every time I got to the part where I should have left, I remembered one more detail that changed why I stayed. By the time I finished, I had used three qualifiers, two apologies, and the same phrase twice, which is apparently what I do when I'm buying time to say the hard part out loud.",
    voiceB:
      "Need you to grab the charger on your way in. Front door sticks, so pull hard. Code is 4402. If the downstairs light is off, knock twice. I'm in back finishing inventory, and I probably will not hear the first one.",
    badge: 'badge.holds',
    mirror_logic: 'off',
    containment: 'on'
  },
  basePersonas: [
    {
      id: 'archivist',
      name: 'Archivist',
      blurb: 'Long lines, fewer contractions, steady receipt language.',
      chips: ['long line', 'receipt-minded', 'low contraction'],
      mod: { sent: 2, cont: -2, punc: 1 },
      source: 'built-in'
    },
    {
      id: 'spark',
      name: 'Spark',
      blurb: 'Short bursts, brighter punctuation, quicker social pull.',
      chips: ['quick burst', 'bright punctuation', 'public lure'],
      mod: { sent: -2, cont: 1, punc: 3 },
      source: 'built-in'
    },
    {
      id: 'undertow',
      name: 'Undertow',
      blurb: 'Repeated phrases, slower loops, and pressure that circles once before landing.',
      chips: ['slow pull', 'recursive', 'afterimage'],
      mod: { sent: 1, cont: 0, punc: 0 },
      source: 'built-in'
    },
    {
      id: 'operator',
      name: 'Operator',
      blurb: 'Plainspoken, clipped, low ornament, built for direct handoff.',
      chips: ['controlled', 'cooler room', 'quiet precision'],
      mod: { sent: 0, cont: -1, punc: -1 },
      source: 'built-in'
    },
    {
      id: 'methods-editor',
      name: 'Methods Editor',
      blurb: 'Measured, caveated, still human. Memo cadence after the adjectives got cut.',
      chips: ['measured', 'clear caveats', 'research memo'],
      mod: { sent: 1, cont: -1, punc: 0 },
      source: 'built-in'
    }
  ],
  microcopy: {
    hero_title: 'TCP - The Cadence Playground',
    hero_lead:
      'Drop in one voice or two. TCP reads sentence rhythm, punctuation habits, contraction density, and recurrence pressure, then shows whether resemblance stays surface-level or starts asking for route.',
    compare_hint: 'The two samples are starting to rhyme, but the route layer still matters.',
    mirror_off: 'Mirror shield is armed. Public play stays legible without turning into spectacle.',
    route_warning: 'Recognition is rising faster than the interface can safely route it.',
    harbor_success: 'Harbor available. The field found a route before the pressure turned recursive.',
    criticality_warning: 'The pattern is real, but the route is not open yet.',
    receipt_created: 'A receipt landed before interpretation ran away with the event.',
    ledger_footer:
      'If the loop hardens before repair arrives, switch to harbor and keep the provenance.'
  }
};
