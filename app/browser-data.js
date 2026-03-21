window.TCP_DATA = {
  defaults: {
    voiceA:
      "Honestly, I wasn't trying to make a speech. I just kept circling the story because every time I got to the part where I should have left, I remembered one more detail that changed why I stayed. By the time I finished, I had used three qualifiers, two apologies, and the same phrase twice, which is apparently what I do when I'm buying time to say the hard part out loud.",
    voiceB:
      "Hey, if you're still out, grab the charger and use the side door. It sticks, so lean on it. If nobody hears you right away, wait a second and knock again. I'm in back unloading boxes, and I probably won't catch the first try.",
    badge: 'badge.holds',
    mirror_logic: 'off',
    containment: 'on'
  },
  basePersonas: [
    {
      id: 'archivist',
      name: 'Archivist',
      blurb: 'Long lines, witness-first syntax, and low contraction. Treats cadence like a sealed ledger.',
      chips: ['long line', 'witness ledger', 'low contraction'],
      mod: { sent: 2, cont: -2, punc: 1 },
      source: 'built-in'
    },
    {
      id: 'spark',
      name: 'Spark',
      blurb: 'Short bursts, bright punctuation, and fast field pull. Turns contact into immediate motion.',
      chips: ['quick burst', 'bright signal', 'public lure'],
      mod: { sent: -2, cont: 1, punc: 3 },
      source: 'built-in'
    },
    {
      id: 'undertow',
      name: 'Undertow',
      blurb: 'Recursive return, delayed landing, and pressure that re-enters before it resolves.',
      chips: ['slow pull', 'recursive return', 'afterimage'],
      mod: { sent: 1, cont: 0, punc: 0 },
      source: 'built-in'
    },
    {
      id: 'operator',
      name: 'Operator',
      blurb: 'Clipped route language, low ornament, and clean handoff under containment.',
      chips: ['controlled', 'route-clean', 'quiet precision'],
      mod: { sent: 0, cont: -1, punc: -1 },
      source: 'built-in'
    },
    {
      id: 'methods-editor',
      name: 'Methods Editor',
      blurb: 'Law-facing cadence, measured caveats, and claims reduced to portable schema.',
      chips: ['measured', 'schema-minded', 'clear caveats'],
      mod: { sent: 1, cont: -1, punc: 0 },
      source: 'built-in'
    }
  ],
  microcopy: {
    hero_title: 'TCP - The Cadence Playground',
    hero_lead:
      'Stage one voice or two. TCP measures cadence, recurrence, and route pressure, then reports whether the field opens, binds, or stays exploratory.',
    compare_hint: 'Resemblance is active, but the route law is still deciding what can travel.',
    mirror_off: 'Mirror shield is armed. Reciprocal passage stays latent while the public field remains legible.',
    route_warning: 'Recognition is outrunning the available route law. Keep the branch open until the field can carry it.',
    harbor_success: 'Harbor is available. Custody, route, and witness states are aligned.',
    criticality_warning: 'The pattern is live, but passage has not stabilized.',
    receipt_created: 'A witness line reached the ledger before interpretation widened the event.',
    ledger_footer:
      'If the loop hardens before repair arrives, switch to harbor and carry the witness.'
  },
  glyphFieldTech: {
    substrateVocabulary: {
      dormantMedium: 'st\u016Fff',
      activatedMedium: 'st\u00FCff',
      activationBudget: 'Bh\u00F5t'
    },
    entries: {
      ingressEyebrow: {
        glyph: '\u25C7',
        semanticClass: 'gate',
        semioticRole: 'threshold-eyebrow',
        activationState: 'primed',
        retrievalTags: ['ingress', 'gate', 'threshold', 'eyebrow'],
        uiTargets: ['ingress.topline'],
        rationale: 'Ingress begins as an opening event before any posture is accepted.'
      },
      ingressPhasePrefix: {
        glyph: '\u0398',
        semanticClass: 'law',
        semioticRole: 'phase-prefix',
        activationState: 'indexed',
        retrievalTags: ['ingress', 'phase', 'law', 'schema'],
        uiTargets: ['ingress.phaseLabel'],
        rationale: 'Phase changes are presented as lawful state transitions rather than decorative steps.'
      },
      ingressFieldCueKicker: {
        glyph: '\u2207',
        semanticClass: 'law',
        semioticRole: 'gradient-kicker',
        activationState: 'active',
        retrievalTags: ['ingress', 'cue', 'gradient', 'field'],
        uiTargets: ['ingress.cueCard.kicker'],
        rationale: 'The cue is a measured field gradient, not a mystical prompt.'
      },
      ingressDefaultCue: {
        glyph: '\u25C7',
        semanticClass: 'gate',
        semioticRole: 'unresolved-cue',
        activationState: 'dormant',
        retrievalTags: ['ingress', 'cue', 'default', 'threshold'],
        uiTargets: ['ingress.cueGlyph.default'],
        rationale: 'The unresolved state should read as threshold, not as completed structure.'
      },
      ingressContainmentCue: {
        glyph: '\u2299\u20E1',
        semanticClass: 'reciprocity',
        semioticRole: 'bound-core-cue',
        activationState: 'primed',
        retrievalTags: ['ingress', 'containment', 'core', 'bound', 'reciprocal'],
        uiTargets: ['ingress.cueGlyph.containment'],
        rationale: 'Containment is modeled as bound reciprocity around the core, not a generic ring.'
      },
      ingressContainmentCore: {
        glyph: '\u2299',
        semanticClass: 'core',
        semioticRole: 'stabilized-core',
        activationState: 'stabilized',
        retrievalTags: ['ingress', 'containment', 'core', 'stabilized'],
        uiTargets: ['ingress.coreGlyph.containment'],
        rationale: 'The stabilize orb should read as a centered source-state.'
      },
      ingressMirrorLatent: {
        glyph: '\u4E0A',
        semanticClass: 'reciprocity',
        semioticRole: 'latent-mirror-posture',
        activationState: 'latent',
        retrievalTags: ['ingress', 'mirror', 'latent', 'route'],
        uiTargets: ['ingress.mirror.latent'],
        rationale: 'Latent mirror posture is a held, resting reciprocity rather than an opening.'
      },
      ingressMirrorClear: {
        glyph: '\u51FA',
        semanticClass: 'emergence',
        semioticRole: 'clear-mirror-posture',
        activationState: 'active',
        retrievalTags: ['ingress', 'mirror', 'clear', 'emergence'],
        uiTargets: ['ingress.mirror.clear'],
        rationale: 'Clear mirror posture permits outward articulation and visible route.'
      },
      ingressBadgeHolds: {
        glyph: '\u2606',
        semanticClass: 'stabilization',
        semioticRole: 'hold-token',
        activationState: 'stabilized',
        retrievalTags: ['ingress', 'badge', 'token', 'holds'],
        uiTargets: ['ingress.badge.holds', 'shell.status.badge'],
        rationale: 'The hold badge should mark achieved local balance.'
      },
      ingressBadgeBuffer: {
        glyph: '\u229E',
        semanticClass: 'adjudication',
        semioticRole: 'buffer-token',
        activationState: 'buffered',
        retrievalTags: ['ingress', 'badge', 'token', 'buffer'],
        uiTargets: ['ingress.badge.buffer', 'shell.status.badge'],
        rationale: 'Buffer is additive containment inside a box, not a simple pause.'
      },
      ingressBadgeBranch: {
        glyph: '\u03BA',
        semanticClass: 'core',
        semioticRole: 'branch-token',
        activationState: 'keyed',
        retrievalTags: ['ingress', 'badge', 'token', 'branch', 'key'],
        uiTargets: ['ingress.badge.branch', 'shell.status.badge'],
        rationale: 'Branching here behaves like keyed transition into an alternate route.'
      },
      ingressSealClosure: {
        glyph: '\u27D0',
        semanticClass: 'witness',
        semioticRole: 'formal-closure',
        activationState: 'closing',
        retrievalTags: ['ingress', 'seal', 'closure', 'witness'],
        uiTargets: ['ingress.cueGlyph.seal', 'ingress.coreGlyph.seal'],
        rationale: 'Seal is a formal witnessed closure rather than a generic icon.'
      },
      ingressSealFlow: {
        glyph: '\u7C73',
        semanticClass: 'flow',
        semioticRole: 'seal-node-flow',
        activationState: 'active',
        retrievalTags: ['ingress', 'seal', 'triad', 'flow'],
        uiTargets: ['ingress.seal.ul'],
        rationale: 'The first seal node marks active flow already underway.'
      },
      ingressSealEmergence: {
        glyph: '\u51FA',
        semanticClass: 'emergence',
        semioticRole: 'seal-node-emergence',
        activationState: 'emergent',
        retrievalTags: ['ingress', 'seal', 'triad', 'emergence'],
        uiTargets: ['ingress.seal.ur'],
        rationale: 'The second seal node is outward expression once flow has been admitted.'
      },
      ingressSealReturn: {
        glyph: '\u5165',
        semanticClass: 'return',
        semioticRole: 'seal-node-return',
        activationState: 'closing',
        retrievalTags: ['ingress', 'seal', 'triad', 'return'],
        uiTargets: ['ingress.seal.bc'],
        rationale: 'The closing point returns the solved posture to local custody.'
      },
      ingressReveal: {
        glyph: '\u2B06',
        semanticClass: 'emergence',
        semioticRole: 'handoff-rise',
        activationState: 'rising',
        retrievalTags: ['ingress', 'reveal', 'handoff', 'ascent'],
        uiTargets: ['ingress.cueGlyph.reveal', 'ingress.coreGlyph.reveal'],
        rationale: 'Reveal is an upward transfer into the live shell.'
      },
      shellEyebrow: {
        glyph: '\u25C7',
        semanticClass: 'gate',
        semioticRole: 'masthead-eyebrow',
        activationState: 'primed',
        retrievalTags: ['shell', 'masthead', 'gate'],
        uiTargets: ['shell.masthead.eyebrow'],
        rationale: 'The public membrane should still read as an entry condition.'
      },
      shellPilot: {
        glyph: '\u2299',
        semanticClass: 'core',
        semioticRole: 'pilot-chip',
        activationState: 'stabilized',
        retrievalTags: ['shell', 'pilot', 'core', 'development'],
        uiTargets: ['shell.masthead.pilot'],
        rationale: 'Active development is best marked as a live core-state rather than a seal.'
      },
      shellDeckName: {
        glyph: '\u7C73',
        semanticClass: 'flow',
        semioticRole: 'deck-name-mark',
        activationState: 'active',
        retrievalTags: ['shell', 'title', 'flow', 'cadence'],
        uiTargets: ['shell.masthead.deckName'],
        rationale: 'The playground title should feel like flow already underway.'
      },
      readoutSignal: {
        glyph: '\u7C73',
        semanticClass: 'flow',
        semioticRole: 'readout-signal',
        activationState: 'active',
        retrievalTags: ['readout', 'signal', 'flow'],
        uiTargets: ['shell.readout.signal'],
        rationale: 'Signal is the live movement class.'
      },
      readoutRoute: {
        glyph: '\u2192',
        semanticClass: 'flow',
        semioticRole: 'readout-route',
        activationState: 'directed',
        retrievalTags: ['readout', 'route', 'transition'],
        uiTargets: ['shell.readout.route'],
        rationale: 'Route should read as directed passage.'
      },
      readoutHarbor: {
        glyph: '\u2696',
        semanticClass: 'adjudication',
        semioticRole: 'readout-harbor',
        activationState: 'evaluating',
        retrievalTags: ['readout', 'harbor', 'custody', 'adjudication'],
        uiTargets: ['shell.readout.harbor'],
        rationale: 'Harbor is a custody and adjudication surface.'
      },
      stateMirror: {
        glyph: '\u2194',
        semanticClass: 'reciprocity',
        semioticRole: 'status-pill',
        activationState: 'armed',
        retrievalTags: ['status', 'mirror', 'reciprocity'],
        uiTargets: ['shell.status.mirror'],
        rationale: 'Mirror state should show reciprocity directly.'
      },
      stateContainment: {
        glyph: '\u2299',
        semanticClass: 'core',
        semioticRole: 'status-pill',
        activationState: 'stabilized',
        retrievalTags: ['status', 'containment', 'core'],
        uiTargets: ['shell.status.containment'],
        rationale: 'Containment state is a centered hold.'
      },
      stateRoute: {
        glyph: '\u2192',
        semanticClass: 'flow',
        semioticRole: 'status-pill',
        activationState: 'directed',
        retrievalTags: ['status', 'route', 'path'],
        uiTargets: ['shell.status.route'],
        rationale: 'Route state should always read as directional passage.'
      },
      stateDecision: {
        glyph: '\u7C73',
        semanticClass: 'flow',
        semioticRole: 'status-pill',
        activationState: 'active',
        retrievalTags: ['status', 'decision', 'field'],
        uiTargets: ['shell.status.signal'],
        rationale: 'The lead status should read as a live field condition.'
      },
      tabDeck: {
        glyph: '\u25C7',
        semanticClass: 'gate',
        semioticRole: 'tab-mark',
        activationState: 'primed',
        retrievalTags: ['tab', 'deck', 'entry'],
        uiTargets: ['shell.tab.deck'],
        rationale: 'Deck is the opening surface.'
      },
      tabReadout: {
        glyph: '\u0398',
        semanticClass: 'law',
        semioticRole: 'tab-mark',
        activationState: 'indexed',
        retrievalTags: ['tab', 'readout', 'law', 'schema'],
        uiTargets: ['shell.tab.readout'],
        rationale: 'Readout is the law-and-schema pane.'
      },
      tabPersonas: {
        glyph: '\u03C8',
        semanticClass: 'recursion',
        semioticRole: 'tab-mark',
        activationState: 'recursive',
        retrievalTags: ['tab', 'personas', 'identity', 'recursion'],
        uiTargets: ['shell.tab.personas', 'shell.persona.status'],
        rationale: 'Personas are recursive patterned identities.'
      },
      sectionCadenceDeck: {
        glyph: '\u25C7',
        semanticClass: 'gate',
        semioticRole: 'section-kicker',
        activationState: 'primed',
        retrievalTags: ['section', 'deck', 'gate'],
        uiTargets: ['shell.section.cadenceDeck'],
        rationale: 'The cadence deck is where entry work begins.'
      },
      sectionShellDuel: {
        glyph: '\u2194',
        semanticClass: 'reciprocity',
        semioticRole: 'section-kicker',
        activationState: 'active',
        retrievalTags: ['section', 'shellDuel', 'reciprocity'],
        uiTargets: ['shell.section.shellDuel'],
        rationale: 'Shell Duel is reciprocal comparison, not one-way movement.'
      },
      sectionTelemetry: {
        glyph: '\u0398',
        semanticClass: 'law',
        semioticRole: 'section-kicker',
        activationState: 'indexed',
        retrievalTags: ['section', 'telemetry', 'law', 'schema'],
        uiTargets: ['shell.section.telemetry'],
        rationale: 'Telemetry should read as measured law and phase relation.'
      },
      sectionHarbor: {
        glyph: '\u2696',
        semanticClass: 'adjudication',
        semioticRole: 'section-kicker',
        activationState: 'evaluating',
        retrievalTags: ['section', 'harbor', 'adjudication'],
        uiTargets: ['shell.section.harbor'],
        rationale: 'Harbor is a custody judgment, not a decorative dock icon.'
      },
      sectionReceipt: {
        glyph: '\u03A3',
        semanticClass: 'witness',
        semioticRole: 'section-kicker',
        activationState: 'accumulating',
        retrievalTags: ['section', 'receipt', 'ledger', 'witness'],
        uiTargets: ['shell.section.receipt'],
        rationale: 'Receipt stream is the accumulation of witnessed output.'
      },
      sectionPersonaDeck: {
        glyph: '\u03C8',
        semanticClass: 'recursion',
        semioticRole: 'section-kicker',
        activationState: 'recursive',
        retrievalTags: ['section', 'persona', 'identity'],
        uiTargets: ['shell.section.personaDeck'],
        rationale: 'Persona management is recursive identity handling.'
      },
      sectionDeltaStrip: {
        glyph: '\u03C3\u2248',
        semanticClass: 'law',
        semioticRole: 'section-kicker',
        activationState: 'measuring',
        retrievalTags: ['section', 'delta', 'variance'],
        uiTargets: ['shell.section.delta'],
        rationale: 'The delta strip is a variance surface, not a generic summary.'
      },
      sectionExploratory: {
        glyph: '\u2207',
        semanticClass: 'law',
        semioticRole: 'section-kicker',
        activationState: 'probing',
        retrievalTags: ['section', 'exploratory', 'gradient'],
        uiTargets: ['shell.section.exploratory'],
        rationale: 'Exploratory posture is a gradient, not a settled destination.'
      },
      sectionRecommendedHarbor: {
        glyph: '\u2696',
        semanticClass: 'adjudication',
        semioticRole: 'section-kicker',
        activationState: 'evaluating',
        retrievalTags: ['section', 'recommendedHarbor', 'adjudication'],
        uiTargets: ['shell.section.recommendedHarbor'],
        rationale: 'Recommended harbor is an adjudicated route recommendation.'
      },
      sectionSoloCapture: {
        glyph: '\u2299',
        semanticClass: 'core',
        semioticRole: 'section-kicker',
        activationState: 'captured',
        retrievalTags: ['section', 'soloCapture', 'core'],
        uiTargets: ['shell.section.soloCapture'],
        rationale: 'A solo capture is the field pinned to a single centered bay.'
      },
      footerSeal: {
        glyph: '\u27D0',
        semanticClass: 'witness',
        semioticRole: 'footer-mark',
        activationState: 'closing',
        retrievalTags: ['footer', 'seal', 'witness'],
        uiTargets: ['shell.footer'],
        rationale: 'The footer should end with witnessed closure.'
      }
    }
  }
};
