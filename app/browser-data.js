window.TCP_DATA = {
  defaults: {
    voiceA: '',
    voiceB: '',
    badge: 'badge.holds',
    mirror_logic: 'off',
    containment: 'on',
    sample_library: [
      {
        id: 'institutional-memo',
        name: 'Institutional Memo',
        intention: 'Procedural precision, causal correction, and chain-of-custody logic under institutional pressure.',
        text: `At 08:42, the lab lost card-reader access at the north entrance, and within eleven minutes the failure had propagated to the archive room and the loading corridor. Facilities initially treated the issue as a local power fluctuation; that assumption was incorrect. The readers were energized, but the controller had stopped validating badge renewals after the overnight firmware push, which meant that staff with active credentials could still trigger the green light while the lock itself remained mechanically engaged. We suspended deliveries at 09:03, moved temperature-sensitive material to the south annex at 09:17, and restored controlled access by 09:46 after rolling the controller to the prior image. No specimens were lost, no external visitor entered a restricted zone, and the chain-of-custody log remains continuous. What matters now is not only the repair but the procedural correction: the next firmware deployment cannot occur before a live-door validation, a physical latch test, and a signed handoff between systems and archive operations. If that sequence sounds excessive, it is only because the earlier sequence assumed that visible status and actual passage were the same event, and they were not.`
      },
      {
        id: 'recursive-debrief',
        name: 'Recursive Debrief',
        intention: 'Reflective recursion, self-correction, and emotionally literate long-line syntax.',
        text: `I keep telling the story as if it has a clean hinge somewhere, as if there were a single minute when I could have said no, closed the laptop, and gone home without carrying the rest of it into the week; but every time I get near that supposed hinge, another smaller decision starts glowing at the edge of the frame. It was not one mistake. It was a braid of small permissions: answering one more message because I did not want to seem difficult, revising one more paragraph because the earlier version sounded almost right but not defensibly right, staying on the call after the useful part was over because silence felt more dangerous than exhaustion. By the time anyone asked whether I had capacity, I had already spent it, and then, predictably, I began narrating my own depletion in the careful, apologetic syntax I use when I am trying to make overwork sound like thoughtfulness. I know that pattern well enough to name it, which is almost worse, because recognition has not yet produced refusal. What I want now is not praise for having held the line. I want a slower threshold, a place where I can notice the drift before I start calling it duty.`
      },
      {
        id: 'ethnographic-fieldnote',
        name: 'Ethnographic Fieldnote',
        intention: 'Observational method, group-process reading, and high abstraction without losing the scene.',
        text: `The meeting began five minutes late, although no one acknowledged lateness as such; instead, the room performed an improvised etiquette of minor adjustments, with chairs pulled inward, notebooks reopened, and a sequence of low-volume side clarifications that allowed the official start to arrive without having to declare itself. What struck me was not conflict in the obvious sense but the disciplined management of anticipatory disagreement. Speakers front-loaded their remarks with local disclaimers, not because they doubted the substance, I think, but because the group has learned to treat unhedged certainty as a breach of method. Even the most forceful intervention came wrapped in procedural courtesy: a restatement of the previous point, a narrow concession, then the actual correction. When the budget table appeared on screen, posture changed before language did. People leaned forward, stopped embellishing, and shifted from interpretive vocabulary to allocative vocabulary: coverage, bridge period, minimum viable staffing, exposure window. No one said crisis. Several participants described the same condition with neighboring terms, none of which were neutral. I wrote in the margin that the committee's real expertise may consist less in decision than in the socially sustainable pacing of decision, which is not the same thing, though in practice it may be what keeps an institution from mistaking velocity for consensus.`
      },
      {
        id: 'grant-narrative',
        name: 'Grant Narrative',
        intention: 'Future-facing institutional ambition, Latinate texture, and formal outcome framing.',
        text: `The project addresses a familiar but insufficiently studied problem: small civic archives are often asked to serve as memory infrastructure, instructional resource, and trust-bearing community institution at the same time, yet they are typically funded as if they performed only one of those functions. Our proposal does not treat access as a simple matter of digitization or public programming in the abstract. Instead, it begins from the premise that access is an interaction among description, stewardship, interpretive framing, and local legitimacy. Over eighteen months, we will build a shared cataloging protocol, train a cohort of neighborhood stewards, and produce a portable exhibition kit designed for circulation through libraries, schools, and tenant associations. The scholarly contribution lies in the comparative method: each archive will document not only what becomes newly visible, but which descriptive choices alter use, which public events change donation behavior, and which forms of community review increase long-term trust in the collection. We expect outcomes at several scales, from recoverable metadata and curricular pilots to a sharper language for discussing archival reciprocity as a measurable public practice. The work is ambitious, but it is not speculative in the casual sense. It is grounded in existing partnerships, staged deliverables, and a research design that treats institutional durability as part of the humanities question rather than as an administrative afterthought.`
      },
      {
        id: 'operations-brief',
        name: 'Operations Brief',
        intention: 'High-directness operational control, imperative stacking, and low-abstraction safety language.',
        text: `Here is the Saturday plan. We open the lot at 07:30, stage tools by the west fence, and start debris pull no later than 08:00. If you arrive after the first pass, do not improvise your own task; check in, get assigned, and stay inside one lane until the team lead moves you. We are clearing glass, resetting the pantry posts, repainting the gate, and sorting salvage into keep, repair, and dump. Gloves matter. Water matters. Closed-toe shoes matter. If you forgot one of those, say so immediately instead of pretending you can work around it. Kids can help at the table station, but they do not go near the saw horses or the paint thinner, and nobody gets points for being relaxed about that. At 10:15 we stop for a fast inventory, not because breaks are sentimental, but because the work gets sloppier once everyone starts freelancing off partial information. If rain hits early, we abandon paint first, then lumber cuts, then everything else. The win condition is simple: leave the lot safer than we found it, leave a record someone else can follow tomorrow, and do not build hidden risk just to produce a satisfying before-and-after photo.`
      },
      {
        id: 'witness-statement',
        name: 'Witness Statement',
        intention: 'Literal anchor preservation, named entities, timestamps, and evidentiary sequence.',
        text: `I arrived at the building at approximately 6:52 PM on Thursday, March 12, and remained on the front walk for less than two minutes before Ms. Alvarez opened the outer door. I am confident about the time because I checked my phone after parking and again while waiting for the buzzer. The hallway lights were on, the mail table was in its usual position, and I did not observe any sign of damage near the entrance. Ms. Alvarez appeared alert but strained. She told me, in substance, that the earlier delivery had been left on the second-floor landing rather than brought to her unit, and she asked whether I would carry it down because she had already made one trip and did not want to aggravate her knee. I agreed. The package was medium-sized, sealed, and marked with a red rush label. I did not open it, shake it, or otherwise disturb it beyond lifting it from the landing and placing it on the table inside her apartment doorway. After that, we spoke for several minutes about the missed signature notice. I left at approximately 7:04 PM. At no point did I see any other visitor enter the unit, and at no point was the package unattended after I picked it up from the landing.`
      },
      {
        id: 'deliberative-hedged',
        name: 'Deliberative Hedged',
        intention: 'Procedural caution, active hedging, and soft-assertive committee reasoning.',
        text: `I think we may be under-reading the pattern, although I would not call it definitive yet and I do not want us to manufacture confidence simply because the timeline is tidy. Maybe the attendance drop is seasonal; perhaps the budget freeze is merely amplifying a weakness that was already present. Even so, the overlap is, to my mind, a little too neat to dismiss as coincidence. Several staff members appear to have been compensating informally for the same procedural gap, and that kind of workaround usually looks minor right up until the moment the institution begins treating it as ordinary background texture. I am not saying we have proof in the hard sense, and I would resist any memo that claimed more than the record can presently carry. I am saying we probably have enough converging signals to justify a narrow review before the committee teaches itself to normalize the drift. If I sound cautious, that is intentional. I would rather hedge the claim than harden it too early, but caution and delay are not identical, and I worry that we keep performing prudence as a way to postpone the discomfort of naming what the process is already showing us. A scoped inquiry now would cost less than retrospective explanation later.`
      },
      {
        id: 'critical-review',
        name: 'Critical Review',
        intention: 'Evaluative intelligence, aesthetic reasoning, and medium-high conceptual density.',
        text: `What makes the performance unusual is not volume, novelty, or even technical precision in the narrow sense. It is the discipline with which the choreographer refuses climax as the only available form of significance. Motions that would ordinarily serve as transition are held long enough to become arguments about balance, fatigue, and witness. The dancers do not move as if space were empty and awaiting expression; they move as if the floor were already full of instructions, frictions, and prior claims. That choice alters everything downstream. A lift reads less like triumph than negotiated leverage. A pause reads less like hesitation than an ethical check on momentum. Even the lighting design participates in this refusal of obviousness. Instead of isolating bodies against a neutral field, it keeps giving the eye partial information, so that orientation must be earned rather than passively received. I left thinking that the work's central achievement was methodological. It built an aesthetics of constraint without turning constraint into a sermon, and it let rigor generate feeling instead of asking feeling to excuse vagueness. In a cultural moment that still confuses acceleration with conviction, that felt like a rare and serious intelligence.`
      }
    ]
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
      tabTrainer: {
        glyph: '\u22A2',
        semanticClass: 'law',
        semioticRole: 'tab-mark',
        activationState: 'deriving',
        retrievalTags: ['tab', 'trainer', 'derivation', 'proof'],
        uiTargets: ['shell.tab.trainer'],
        rationale: 'Trainer is a derivation lane: extraction, proof, and persona construction.'
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
      sectionTrainerLab: {
        glyph: '\u03BA\u2295',
        semanticClass: 'core',
        semioticRole: 'section-kicker',
        activationState: 'keyed',
        retrievalTags: ['section', 'trainer', 'lab', 'keyed-activation'],
        uiTargets: ['shell.section.trainerLab'],
        rationale: 'The trainer lab is where keyed activation becomes a reusable shell.'
      },
      sectionTrainerValidation: {
        glyph: '\u03A6',
        semanticClass: 'law',
        semioticRole: 'section-kicker',
        activationState: 'measuring',
        retrievalTags: ['section', 'trainer', 'validation', 'correspondence'],
        uiTargets: ['shell.section.trainerValidation'],
        rationale: 'Validation is a correspondence surface between the target shell and the candidate shell.'
      },
      sectionTrainerExport: {
        glyph: '\u27D0',
        semanticClass: 'witness',
        semioticRole: 'section-kicker',
        activationState: 'sealed',
        retrievalTags: ['section', 'trainer', 'export', 'seal'],
        uiTargets: ['shell.section.trainerExport'],
        rationale: 'Export closes the trainer result as a portable witnessed persona spec.'
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
