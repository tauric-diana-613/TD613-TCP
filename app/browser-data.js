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
      family: 'Witness ledger',
      tagline: 'Long line. Cold seal.',
      blurb: 'Witness-ledger mask. Long line, cold seal, low contraction.',
      voicePromise: 'Lengthens the sentence and cools the surface until the record sounds sealed.',
      fieldUse: 'Use when the passage needs procedural gravity without losing human witness pressure.',
      riskTell: 'Sentence span and witness posture tend to cling after contact.',
      chips: ['cold seal', 'low contraction'],
      profileRecipe: {
        blend: [
          { sampleId: 'witness-statement', weight: 0.65 },
          { sampleId: 'institutional-memo', weight: 0.35 }
        ],
      overlayMod: { sent: 4, cont: -3, punc: -1 },
      strength: 0.94
      },
      maskVisualClass: 'ledger-raven',
      maskArtLabel: 'ledger raven',
      maskSigil: '[]',
      maskState: 'mask ready',
      frameTone: 'sick-gold',
      collectorClass: 'built-in',
      portrait: {
        src: 'assets/persona-portraits/archivist.svg',
        alt: 'Archivist portrait'
      },
      source: 'built-in'
    },
    {
      id: 'spark',
      name: 'Spark',
      family: 'Public signal',
      tagline: 'Fast surface. Bright cut.',
      blurb: 'Signal-jackal mask. Fast surface, bright cut, public motion.',
      voicePromise: 'Cuts the line short, sharpens punctuation, and pushes the passage outward.',
      fieldUse: 'Use when you need public-facing velocity, directness, and visible momentum.',
      riskTell: 'Directness often survives even when home distance loosens.',
      chips: ['bright cut', 'public pull'],
      profileRecipe: {
        blend: [
          { sampleId: 'operations-brief', weight: 0.8 },
          { sampleId: 'critical-review', weight: 0.2 }
        ],
      overlayMod: { sent: -5, cont: 4, punc: 4 },
      strength: 0.92
      },
      maskVisualClass: 'signal-jackal',
      maskArtLabel: 'signal jackal',
      maskSigil: '++',
      maskState: 'mask ready',
      frameTone: 'cyan',
      collectorClass: 'built-in',
      portrait: {
        src: 'assets/persona-portraits/spark.svg',
        alt: 'Spark portrait'
      },
      source: 'built-in'
    },
    {
      id: 'undertow',
      name: 'Undertow',
      family: 'Recursive undertow',
      tagline: 'Late landing. Return current.',
      blurb: 'Recursive undertow mask. Late landing, return current, delayed afterimage.',
      voicePromise: 'Lets the sentence drift longer and land after the surface seems finished.',
      fieldUse: 'Use when you want recursive drag, delayed closure, and a submerged emotional wake.',
      riskTell: 'Recurrence and late-closing sentence rhythm tend to stay visible.',
      chips: ['late landing', 'return current'],
      profileRecipe: {
        blend: [
          { sampleId: 'recursive-debrief', weight: 0.85 },
          { sampleId: 'critical-review', weight: 0.15 }
        ],
        overlayMod: { sent: 2, cont: 0, punc: 0 },
        strength: 0.89
      },
      maskVisualClass: 'velvet-eel',
      maskArtLabel: 'velvet eel',
      maskSigil: '~~',
      maskState: 'mask ready',
      frameTone: 'bruise-violet',
      collectorClass: 'built-in',
      portrait: {
        src: 'assets/persona-portraits/undertow.svg',
        alt: 'Undertow portrait'
      },
      source: 'built-in'
    },
    {
      id: 'operator',
      name: 'Operator',
      family: 'Route discipline',
      tagline: 'Dry hand. Clean route.',
      blurb: 'Route-discipline mask. Dry hand, clipped surface, clean route language.',
      voicePromise: 'Strips ornament, lowers pulse, and keeps the line operational under pressure.',
      fieldUse: 'Use when the passage needs clipped control and low-ornament route clarity.',
      riskTell: 'Route-clean phrasing can remain visible even when the shell shifts elsewhere.',
      chips: ['clean route', 'dry hand'],
      profileRecipe: {
        blend: [
          { sampleId: 'operations-brief', weight: 0.55 },
          { sampleId: 'witness-statement', weight: 0.45 }
        ],
      overlayMod: { sent: -4, cont: -2, punc: -2 },
        strength: 0.87
      },
      maskVisualClass: 'quiet-hound',
      maskArtLabel: 'quiet hound',
      maskSigil: '//',
      maskState: 'mask ready',
      frameTone: 'ash',
      collectorClass: 'built-in',
      portrait: {
        src: 'assets/persona-portraits/operator.svg',
        alt: 'Operator portrait'
      },
      source: 'built-in'
    },
    {
      id: 'methods-editor',
      name: 'Methods Editor',
      family: 'Schema cold',
      tagline: 'Measured caveat. Clean proof.',
      blurb: 'Schema-cold mask. Formal, caveated, and stripped of warmth.',
      voicePromise: 'Flattens heat, formalizes claims, and keeps the sentence inside a colder proof surface.',
      fieldUse: 'Use when a claim needs caveat, formal distance, and procedural restraint.',
      riskTell: 'Caveat structure and abstraction posture often remain after transfer.',
      chips: ['measured caveat', 'clean proof'],
      profileRecipe: {
        blend: [
          { sampleId: 'deliberative-hedged', weight: 0.55 },
          { sampleId: 'grant-narrative', weight: 0.45 }
        ],
      overlayMod: { sent: 4, cont: -3, punc: -1 },
      strength: 0.9
      },
      maskVisualClass: 'schema-moth',
      maskArtLabel: 'schema moth',
      maskSigil: '::',
      maskState: 'mask ready',
      frameTone: 'ice',
      collectorClass: 'built-in',
      portrait: {
        src: 'assets/persona-portraits/methods-editor.svg',
        alt: 'Methods Editor portrait'
      },
      source: 'built-in'
    },
    {
      id: 'cross-examiner',
      name: 'Cross-Examiner',
      family: 'Adversarial pressure',
      tagline: 'Hard edge. Closed throat.',
      blurb: 'Adversarial-pressure mask. Hard edge, clipped line, sharpened pressure.',
      voicePromise: 'Tightens the sentence, hardens the edge, and turns soft claims into challenge surfaces.',
      fieldUse: 'Use when the passage needs interrogation pressure and minimal softness.',
      riskTell: 'Pressure syntax and abrupt punctuation can keep showing through.',
      chips: ['hard edge', 'pressure syntax'],
      profileRecipe: {
        blend: [
          { sampleId: 'critical-review', weight: 0.55 },
          { sampleId: 'operations-brief', weight: 0.45 }
        ],
      overlayMod: { sent: -5, cont: -3, punc: 5 },
      strength: 0.91
      },
      maskVisualClass: 'gavel-viper',
      maskArtLabel: 'gavel viper',
      maskSigil: '?!',
      maskState: 'mask ready',
      frameTone: 'oxide-red',
      collectorClass: 'built-in',
      portrait: {
        src: 'assets/persona-portraits/cross-examiner.svg',
        alt: 'Cross-Examiner portrait'
      },
      source: 'built-in'
    },
    {
      id: 'matron',
      name: 'Matron',
      family: 'Protective veil',
      tagline: 'Soft shelter. Held pulse.',
      blurb: 'Protective-veil mask. Held pulse, softened cadence, shelter without blur.',
      voicePromise: 'Steadies the breath and softens the cadence while keeping the line legible.',
      fieldUse: 'Use when the passage needs shelter, steadiness, and controlled warmth.',
      riskTell: 'Steady sentence pulse can persist even when the tone cools elsewhere.',
      chips: ['held pulse', 'soft shelter'],
      profileRecipe: {
        blend: [
          { sampleId: 'witness-statement', weight: 0.45 },
          { sampleId: 'recursive-debrief', weight: 0.35 },
          { sampleId: 'institutional-memo', weight: 0.2 }
        ],
      overlayMod: { sent: 4, cont: -1, punc: -2 },
      strength: 0.9
      },
      maskVisualClass: 'velvet-stag',
      maskArtLabel: 'velvet stag',
      maskSigil: '()',
      maskState: 'mask ready',
      frameTone: 'velvet',
      collectorClass: 'built-in',
      portrait: {
        src: 'assets/persona-portraits/matron.svg',
        alt: 'Matron portrait'
      },
      source: 'built-in'
    }
  ],
  microcopy: {
    hero_title: 'TCP - The Cadence Playground',
    hero_lead:
      'Bring one voice or bring a pair. TCP measures cadence, recurrence, and route pressure, then shows whether the field stays curious, opens a branch, or earns passage.',
    compare_hint: 'Resemblance is real, but route still has to earn its way.',
    mirror_off: 'Mirror shield is armed. You can play in public without auto-opening passage.',
    route_warning: 'Recognition is outrunning the available route. Keep the branch open until the field can actually carry it.',
    harbor_success: 'Harbor is live. Custody, route, and witness state are aligned enough to move.',
    criticality_warning: 'The pattern is hot, but passage is not stable yet.',
    receipt_created: 'A witness-safe receipt hit the ledger before the story got overinterpreted.',
    ledger_footer:
      'If the loop hardens before repair arrives, switch to harbor and keep provenance intact.'
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
      tabHomebase: {
        glyph: '\u4E0B',
        semanticClass: 'witness',
        semioticRole: 'tab-mark',
        activationState: 'anchored',
        retrievalTags: ['tab', 'homebase', 'archive', 'lockbox'],
        uiTargets: ['shell.tab.homebase'],
        rationale: 'Homebase is where cadence is brought down into a private anchored hold.'
      },
      tabConsole: {
        glyph: '\u25C7',
        semanticClass: 'gate',
        semioticRole: 'tab-mark',
        activationState: 'indexed',
        retrievalTags: ['tab', 'console', 'routing', 'index'],
        uiTargets: ['shell.tab.console'],
        rationale: 'Console is the front-door station index that routes into the shared field.'
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
      sectionHomebase: {
        glyph: '\uD834\uDF0B',
        semanticClass: 'witness',
        semioticRole: 'section-kicker',
        activationState: 'anchored',
        retrievalTags: ['section', 'homebase', 'lockbox', 'archive'],
        uiTargets: ['shell.section.homebase'],
        rationale: 'Homebase is the private cadence lock surface.'
      },
      consoleIndex: {
        glyph: '\u25C7',
        semanticClass: 'gate',
        semioticRole: 'section-kicker',
        activationState: 'indexed',
        retrievalTags: ['section', 'console', 'station', 'index'],
        uiTargets: ['shell.section.console'],
        rationale: 'The console index is the routed front door into the shared runtime.'
      },
      sectionDeepDossier: {
        glyph: '\u2234',
        semanticClass: 'law',
        semioticRole: 'section-kicker',
        activationState: 'revealed',
        retrievalTags: ['section', 'dossier', 'reveal', 'stylometrics'],
        uiTargets: ['shell.section.deepDossier'],
        rationale: 'The dossier is where inference is stated rather than hinted.'
      },
      sectionMaskBench: {
        glyph: '\uDBF5\uDE13',
        semanticClass: 'recursion',
        semioticRole: 'section-kicker',
        activationState: 'testing',
        retrievalTags: ['section', 'maskBench', 'comparison', 'counterstyle'],
        uiTargets: ['shell.section.maskBench'],
        rationale: 'Mask bench is the comparison surface where other text is tried against home.'
      },
      homebaseCadenceHome: {
        glyph: '\u4E0B',
        semanticClass: 'witness',
        semioticRole: 'surface-cue',
        activationState: 'anchored',
        retrievalTags: ['homebase', 'cadence-home', 'anchor'],
        uiTargets: ['shell.homebase.status', 'shell.homebase.lockbox'],
        rationale: 'Cadence home is an anchored private hold.'
      },
      homebaseWornMask: {
        glyph: '\uDBF5\uDE13',
        semanticClass: 'recursion',
        semioticRole: 'surface-cue',
        activationState: 'worn',
        retrievalTags: ['homebase', 'mask', 'worn', 'contact'],
        uiTargets: ['shell.homebase.wornMask'],
        rationale: 'A worn mask marks active steering pressure in Homebase.'
      },
      homebaseContact: {
        glyph: '\uD834\uDF0B',
        semanticClass: 'recursion',
        semioticRole: 'surface-cue',
        activationState: 'contact',
        retrievalTags: ['homebase', 'contact', 'passage'],
        uiTargets: ['shell.homebase.passageBench'],
        rationale: 'Contact marks the moment source text is passed through a worn mask.'
      },
      homebaseResidue: {
        glyph: '\u2234',
        semanticClass: 'law',
        semioticRole: 'surface-cue',
        activationState: 'revealed',
        retrievalTags: ['homebase', 'residue', 'what-clung'],
        uiTargets: ['shell.homebase.residue'],
        rationale: 'Residue is the phase where what clung can be stated explicitly.'
      },
      homebaseDossierReveal: {
        glyph: '\u2234',
        semanticClass: 'law',
        semioticRole: 'surface-cue',
        activationState: 'revealed',
        retrievalTags: ['homebase', 'dossier', 'reveal'],
        uiTargets: ['shell.homebase.dossier'],
        rationale: 'The revealed dossier is explicit law, not latent contact.'
      },
      personaChosen: {
        glyph: '\u03C8',
        semanticClass: 'recursion',
        semioticRole: 'surface-cue',
        activationState: 'chosen',
        retrievalTags: ['personas', 'chosen', 'shelf'],
        uiTargets: ['shell.persona.preview'],
        rationale: 'A chosen mask is still on the shelf, not yet in contact.'
      },
      deckCasting: {
        glyph: '\u25C7',
        semanticClass: 'gate',
        semioticRole: 'surface-cue',
        activationState: 'primed',
        retrievalTags: ['deck', 'casting', 'pre-analysis'],
        uiTargets: ['shell.deck.castReport'],
        rationale: 'Casting belongs to the encounter chamber before analysis wakes the duel.'
      },
      deckSwapAftermath: {
        glyph: '\u2194',
        semanticClass: 'reciprocity',
        semioticRole: 'surface-cue',
        activationState: 'aftermath',
        retrievalTags: ['deck', 'swap', 'aftermath'],
        uiTargets: ['shell.deck.castReport', 'shell.deck.swap'],
        rationale: 'Swap aftermath should read as reciprocal movement or blockage, not as a generic success state.'
      },
      readoutSoloHomeReveal: {
        glyph: '\u2234',
        semanticClass: 'law',
        semioticRole: 'surface-cue',
        activationState: 'revealed',
        retrievalTags: ['readout', 'solo-home-reveal', 'witness'],
        uiTargets: ['shell.readout.telemetry', 'shell.readout.status'],
        rationale: 'Solo home reveal is explicit witness pressure under law.'
      },
      readoutCriticality: {
        glyph: '\u7C73',
        semanticClass: 'flow',
        semioticRole: 'surface-cue',
        activationState: 'hot',
        retrievalTags: ['readout', 'criticality', 'witness'],
        uiTargets: ['shell.readout.status', 'shell.readout.telemetry'],
        rationale: 'Criticality marks recognition outrunning route stability.'
      },
      readoutHarbor: {
        glyph: '\u2696',
        semanticClass: 'adjudication',
        semioticRole: 'surface-cue',
        activationState: 'aligned',
        retrievalTags: ['readout', 'harbor', 'law'],
        uiTargets: ['shell.readout.harbor'],
        rationale: 'Harbor remains the adjudicated passage surface.'
      },
      actionReveal: {
        glyph: '\u2234',
        semanticClass: 'law',
        semioticRole: 'action-mark',
        activationState: 'revealed',
        retrievalTags: ['action', 'reveal', 'dossier', 'wake'],
        uiTargets: ['shell.action.reveal'],
        rationale: 'Reveal is a reasoned opening into explicit stylometric description.'
      },
      stateLockStaged: {
        glyph: '\uDBF5\uDE13',
        semanticClass: 'witness',
        semioticRole: 'status-pill',
        activationState: 'staged',
        retrievalTags: ['status', 'lock', 'staged', 'unsaved'],
        uiTargets: ['shell.status.lockStaged'],
        rationale: 'A staged lock is present and powerful, but not yet written into archive.'
      },
      ingressBadgeDown: {
        glyph: '\u4E0B',
        semanticClass: 'witness',
        semioticRole: 'badge-token',
        activationState: 'anchored',
        retrievalTags: ['ingress', 'badge', 'token', 'down'],
        uiTargets: ['ingress.badge.down'],
        rationale: 'Downward anchoring behaves like a deliberate local hold before passage.'
      },
      ingressBadgeTetragram: {
        glyph: '\uD834\uDF0B',
        semanticClass: 'recursion',
        semioticRole: 'badge-token',
        activationState: 'patterned',
        retrievalTags: ['ingress', 'badge', 'token', 'tetragram'],
        uiTargets: ['ingress.badge.tetragram'],
        rationale: 'The tetragram token marks patterned recursion before the route settles.'
      },
      ingressBadgeWitness: {
        glyph: '\uDBF5\uDE13',
        semanticClass: 'witness',
        semioticRole: 'badge-token',
        activationState: 'witnessed',
        retrievalTags: ['ingress', 'badge', 'token', 'witness'],
        uiTargets: ['ingress.badge.witness'],
        rationale: 'Witness token marks a more explicit custody posture during ingress.'
      },
      ingressBadgeTherefore: {
        glyph: '\u2234',
        semanticClass: 'law',
        semioticRole: 'badge-token',
        activationState: 'deriving',
        retrievalTags: ['ingress', 'badge', 'token', 'therefore'],
        uiTargets: ['ingress.badge.therefore'],
        rationale: 'Therefore token presents the ingress badge as a reasoned derivation rather than a casual pick.'
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
      trainerExtract: {
        glyph: '\u03BA\u2295',
        semanticClass: 'core',
        semioticRole: 'surface-cue',
        activationState: 'extracting',
        retrievalTags: ['trainer', 'extract', 'forge'],
        uiTargets: ['shell.trainer.status'],
        rationale: 'Extraction is the first forge motion: recovering a reusable field from corpus.'
      },
      trainerInspect: {
        glyph: '\u03A6',
        semanticClass: 'law',
        semioticRole: 'surface-cue',
        activationState: 'inspecting',
        retrievalTags: ['trainer', 'inspect', 'validation'],
        uiTargets: ['shell.trainer.validation'],
        rationale: 'Inspection is the measured comparison between field and candidate.'
      },
      trainerCorrection: {
        glyph: '\u2234',
        semanticClass: 'law',
        semioticRole: 'surface-cue',
        activationState: 'correcting',
        retrievalTags: ['trainer', 'correction', 'forge'],
        uiTargets: ['shell.trainer.correction'],
        rationale: 'Correction is a reasoned second pass rather than a failure badge.'
      },
      trainerForgeReady: {
        glyph: '\u27D0',
        semanticClass: 'witness',
        semioticRole: 'surface-cue',
        activationState: 'sealed',
        retrievalTags: ['trainer', 'forge-ready', 'export'],
        uiTargets: ['shell.trainer.export', 'shell.trainer.status'],
        rationale: 'Forge-ready means the candidate survived retrieval law and can now be carried outward.'
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
