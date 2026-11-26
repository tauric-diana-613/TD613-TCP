/**
 * 𝌋 TD613 Isomorphic Dollhouse Design Grammar Core (Browser + Node zero-I/O)
 *
 * Extracted from the TD613 Dollhouse Design Conductor (/dollhouse-design) so both
 * browser-hosted Vixen Unified Theory Synthesis and Node Podium / Conductor pipelines
 * run the exact same deterministic formal grammar operators with zero Node built-ins
 * and zero external requests.
 *
 * Governance invariants:
 *   - Operates strictly under OPEN_FIELD_CREATIVE_SYNTHESIS
 *   - empirical_replication_credit = 0
 *   - scientific_promotion_authority = false
 *   - human_closure_required = true
 */

export const DESIGN_GRAMMAR_SCHEMA = 'td613.dollhouse-design.isomorphic-grammar/v1';

export const VALID_MEDIA = Object.freeze([
  'VISUAL',
  'MOTION',
  'SCHOLARLY',
  'THEORETICAL',
  'PRODUCT',
  'HYBRID'
]);

export const AVAILABLE_INSTRUMENTS = Object.freeze({
  PHASONIC_COUNTERPOINT: Object.freeze({
    id: 'PHASONIC_COUNTERPOINT',
    label: 'D₃/φ Phasonic Counterpoint',
    lineage: 'Aperture v3.2-alpha Triple Overlay',
    operatesOn: 'transmedia invariance, periodic recurrence, quasiperiodic detour, and temporal lag',
    suitableFor: Object.freeze(['VISUAL', 'MOTION', 'HYBRID', 'THEORETICAL']),
    governing_theory: 'Triple Overlay (D₃ Periodic Lattice × φ Quasiperiodic Modulation × Heterostratigraphic Interference)'
  }),
  CARO_INSTITUTIONAL_RECONSTRUCTION: Object.freeze({
    id: 'CARO_INSTITUTIONAL_RECONSTRUCTION',
    label: 'Caro Institutional Reconstruction',
    lineage: 'Thinkers Bin (Robert Caro / Institutional Power)',
    operatesOn: 'physical corridors, procedural friction, bureaucratic accumulation, and omitted records',
    suitableFor: Object.freeze(['SCHOLARLY', 'VISUAL', 'PRODUCT', 'HYBRID']),
    governing_theory: 'Robert Caro Archival Reconstruction & Procedural Resistance'
  }),
  BUTLER_PERFORMATIVE_ITERATION: Object.freeze({
    id: 'BUTLER_PERFORMATIVE_ITERATION',
    label: 'Butler Performative Iteration',
    lineage: 'Thinkers Bin (Judith Butler / Performative Subversion)',
    operatesOn: 'ritualized reiteration, normative slippage, and compulsory legibility',
    suitableFor: Object.freeze(['SCHOLARLY', 'THEORETICAL', 'VISUAL']),
    governing_theory: 'Judith Butler Citational Reiteration & Normative Subversion'
  }),
  SEDGWICK_REPARATIVE_TEXTURE: Object.freeze({
    id: 'SEDGWICK_REPARATIVE_TEXTURE',
    label: 'Sedgwick Reparative Texture',
    lineage: 'Thinkers Bin (Eve Kosofsky Sedgwick / Reparative Reading)',
    operatesOn: 'textural granularity, affective survival, and resisting paranoid closure',
    suitableFor: Object.freeze(['SCHOLARLY', 'VISUAL', 'PRODUCT']),
    governing_theory: 'Eve Kosofsky Sedgwick Paratactic Beside-ness & Affective Survival'
  }),
  DIALECTICAL_TENSION: Object.freeze({
    id: 'DIALECTICAL_TENSION',
    label: 'Contrapuntal Dialectic',
    lineage: 'Classical Dialectics & Polyphony',
    operatesOn: 'irreducible antithesis, competing perspectives, and non-synthesizing juxtaposition',
    suitableFor: Object.freeze(['SCHOLARLY', 'THEORETICAL', 'MOTION']),
    governing_theory: 'Polyphonic Contrapuntalism & Irreducible Antithesis'
  })
});

export const THEMATIC_CLUSTERS = Object.freeze({
  institutional: Object.freeze([
    'king', 'court', 'power', 'authority', 'sovereign', 'censor', 'bureaucracy',
    'statute', 'archive', 'allegiance', 'title', 'law', 'corridor', 'gatekeeper',
    'administrative', 'official', 'procedural', 'redact', 'redaction', 'petition',
    'waiting', 'waiting-room', 'hearing', 'permit', 'clerk', 'sanction', 'stamp'
  ]),
  performative: Object.freeze([
    'performativity', 'performative', 'ritual', 'reiteration', 'reiterate', 'norm',
    'normative', 'subversion', 'subversive', 'slippage', 'mimicry', 'convention',
    'citation', 'citational', 'legibility', 'syntax', 'grammar', 'marks', 'repetition',
    'parody', 'conformity', 'compulsory', 'script', 'iteration'
  ]),
  reparative: Object.freeze([
    'reparative', 'texture', 'textural', 'beside', 'besideness', 'affective', 'care',
    'survival', 'fragment', 'shelter', 'parataxis', 'paratactic', 'communal',
    'vulnerability', 'dissolve', 'dissolution', 'reparation', 'touch', 'tactile',
    'loss', 'wound', 'remedy', 'gathering', 'discarded', 'patch', 'textile'
  ]),
  dialectical: Object.freeze([
    'dialectical', 'dialectic', 'tension', 'antithesis', 'polyphonic', 'polyphony',
    'dissonance', 'contradiction', 'dispute', 'rival', 'oppose', 'opposition',
    'irreducible', 'counterpoint', 'interval', 'unison', 'synthesis', 'antagonism',
    'contrapuntal', 'thesis', 'incommensurable', 'conflict', 'voice'
  ]),
  phasonic: Object.freeze([
    'phason', 'phasonic', 'quasiperiodic', 'lattice', 'periodic', 'moiré',
    'trajectory', 'geometry', 'wave', 'interference', 'recurrence', 'detour',
    'transmedia', 'cadence', 'temporal', 'spatial', 'endpoint', 'door', 'arrival',
    'passage', 'stage', 'machinery', 'proscenium', 'scaffold', 'projection',
    'strain', 'd3', 'phi', 'scene', 'time'
  ]),
  temporal: Object.freeze([
    'time', 'scene', 'history', 'before', 'after', 'dawn', 'future', 'past',
    'passage', 'cadence', 'quietly', 'temporal', 'moment'
  ]),
  machinery: Object.freeze([
    'machinery', 'machine', 'stage', 'pulley', 'crane', 'gear', 'lever', 'rigging',
    'console', 'engine', 'instrument', 'mechanism', 'anvil'
  ]),
  textual: Object.freeze([
    'punctuation', 'grammar', 'marks', 'sentence', 'clause', 'word', 'syntax',
    'letters', 'language', 'title', 'ledger', 'record', 'stop', 'colon', 'dash'
  ]),
  spatial: Object.freeze([
    'theater', 'corridor', 'door', 'endpoint', 'boundary', 'threshold', 'estuary',
    'proscenium', 'hall', 'room', 'vault', 'site', 'ground'
  ]),
  relational: Object.freeze([
    'arrive', 'differ', 'separate', 'change', 'converge', 'refract', 'invert',
    'slip', 'reiterate', 'dissolve', 'suspend', 'hold'
  ])
});

export const CYBERNETIC_CADENCE_TERMS = Object.freeze([
  'probe', 'probes', 'crossed', 'mirror', 'signal', 'glare', 'clock', 'clocks',
  'depth', 'plane', 'planes', 'cleave', 'reply', 'replies', 'refuse', 'holonomy',
  'witness', 'sensor', 'actuation', 'quotient', 'fiber', 'custody'
]);

export const INSTRUMENT_CAUSAL_LAWS = Object.freeze({
  PHASONIC_COUNTERPOINT: Object.freeze({
    parameter: 'quasiperiodic_phase_strain_gamma',
    transfer_law: 'H(u) = D_3 * cos(2*pi*u) + gamma * sin(2*pi*phi*u)',
    falsification_probe: 'gamma = 0 collapses quasiperiodic trajectory into flat mirror periodicity'
  }),
  CARO_INSTITUTIONAL_RECONSTRUCTION: Object.freeze({
    parameter: 'procedural_latency_mu',
    transfer_law: 'friction(n) = friction_0 + mu * omitted_witness_count(n)',
    falsification_probe: 'mu = 0 erases administrative delay and archival gap structure'
  }),
  BUTLER_PERFORMATIVE_ITERATION: Object.freeze({
    parameter: 'citational_slippage_epsilon',
    transfer_law: 'kerning(n) = kerning_0 + epsilon * log(1 + n)',
    falsification_probe: 'epsilon = 0 forces mechanical conformity across all repetitions'
  }),
  SEDGWICK_REPARATIVE_TEXTURE: Object.freeze({
    parameter: 'paratactic_proximity_delta',
    transfer_law: 'x_marginal = x_sovereign_edge + delta * sensory_salience',
    falsification_probe: 'delta = 0 collapses beside-ness into subordinating vertical hierarchy'
  }),
  DIALECTICAL_TENSION: Object.freeze({
    parameter: 'dissonance_interval_omega',
    transfer_law: 'phase_offset = omega * pi * sin(t)',
    falsification_probe: 'omega = 0 resolves competing voices into unison synthesis'
  })
});

export const DESIGN_PHI = (1 + Math.sqrt(5)) / 2;
const STOP_WORDS = new Set([
  'a', 'an', 'the', 'in', 'which', 'are', 'and', 'each', 'of', 'it', 'to',
  'for', 'with', 'on', 'at', 'by', 'from', 'but', 'is', 'as', 'that', 'this',
  'when', 'where', 'only', 'all', 'any', 'into', 'over'
]);
const ANTI_BOILERPLATE_SUBTITLE_RX = /\bTHE\s+ARCHITECTURE\s+OF\b/i;
const BUREAUCRATIC_FILLER_RX = /\b(?:public record|witness deficits|tracks source order|podium inspection|cross into the)\b/i;

export function analyzeSeedSemantics(seed = '') {
  const clean = String(seed).toLowerCase();
  const words = clean.match(/[a-z0-9'-]+/g) || [];

  const detected = {};
  for (const [clusterName, termList] of Object.entries(THEMATIC_CLUSTERS)) {
    detected[clusterName] = words.filter((w) => termList.includes(w));
  }

  const salientKeywords = words.filter((w) => !STOP_WORDS.has(w) && w.length > 2);

  return {
    raw: seed,
    word_count: words.length,
    detected_clusters: detected,
    salient_keywords: Array.from(new Set(salientKeywords))
  };
}

export function inferContextualInstruments(seed = '') {
  const analysis = analyzeSeedSemantics(seed);

  const scores = {
    CARO_INSTITUTIONAL_RECONSTRUCTION: analysis.detected_clusters.institutional.length,
    BUTLER_PERFORMATIVE_ITERATION: analysis.detected_clusters.performative.length,
    SEDGWICK_REPARATIVE_TEXTURE: analysis.detected_clusters.reparative.length,
    DIALECTICAL_TENSION: analysis.detected_clusters.dialectical.length,
    PHASONIC_COUNTERPOINT: analysis.detected_clusters.phasonic.length
  };

  let bestInstrument = null;
  let maxScore = 0;
  for (const [inst, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      bestInstrument = inst;
    }
  }

  return [bestInstrument || 'PHASONIC_COUNTERPOINT'];
}

/**
 * Computes D_3 x phi Phasonic Counterpoint interference scalar for normalized phase u in [0, 1].
 */
export function computePhasonicInterference(u = 0, gamma = 0.618) {
  const phase = Number.isFinite(Number(u)) ? Number(u) : 0;
  const g = Math.max(0, Math.min(2, Number.isFinite(Number(gamma)) ? Number(gamma) : 0.618));
  const periodic = Math.cos(2 * Math.PI * 3 * phase);
  const quasi = Math.sin(2 * Math.PI * DESIGN_PHI * phase);
  const value = 0.5 * periodic + g * quasi;
  return {
    phase: +phase.toFixed(6),
    periodic_d3: +periodic.toFixed(6),
    quasiperiodic_phi: +quasi.toFixed(6),
    interference: +value.toFixed(6)
  };
}

/**
 * Evaluates a Unified Theory candidate's phrasing and formal grammar alignment using
 * /dollhouse-design operators (seed semantic density, Phasonic counterpoint rhythm,
 * Sedgwickian beside-ness / Butlerian non-collapse, Pedagogue cadence discipline).
 * Purely structural heuristic; carries zero authority or empirical replication credit.
 */
export function scoreDesignCadence(candidate = {}, seedContext = '') {
  const hero = String(candidate?.heroStatement || '');
  const sub = String(candidate?.patternSubtitle || '');
  const hdr = String(candidate?.headerTagline || '');
  const title = String(candidate?.title || '');
  const q = String(candidate?.researchQuestion || '');
  const combined = `${hdr} ${sub} ${hero} ${title}`.trim();
  const analysis = analyzeSeedSemantics(`${combined} ${seedContext || ''}`);
  const inferred = inferContextualInstruments(combined);
  const primaryInst = candidate?.governing_instrument && AVAILABLE_INSTRUMENTS[candidate.governing_instrument]
    ? candidate.governing_instrument
    : inferred[0];

  // 1. Line count & Pedagogue breathable cadence balance (sweet spot: 2-4 crisp lines, 10-32 words)
  const lines = hero.split(/\n+/).map((l) => l.trim()).filter(Boolean);
  const heroWords = hero.match(/[a-zA-Z0-9'-]+/g) || [];
  const lineLengths = lines.map((l) => l.length);
  const maxL = lineLengths.length ? Math.max(...lineLengths) : 0;
  const minL = lineLengths.length ? Math.min(...lineLengths) : 0;
  const rhythmEvenness = maxL > 0 ? 1 - Math.min(1, (maxL - minL) / (maxL * 1.4)) : 0;
  const lineScore = lines.length >= 2 && lines.length <= 4 ? 1.0 : (lines.length === 1 ? 0.55 : 0.72);
  const densityScore = heroWords.length >= 10 && heroWords.length <= 28
    ? 1.0
    : Math.max(0.35, 1 - Math.abs(heroWords.length - 18) * 0.03);
  const pedagogueCadence = +(0.45 * lineScore + 0.35 * densityScore + 0.20 * rhythmEvenness).toFixed(4);

  // 2. Semantic cluster span across /dollhouse-design instruments
  const activeClusters = Object.entries(analysis.detected_clusters)
    .filter(([, hits]) => hits.length > 0)
    .map(([name]) => name);
  const phasonicDepth = computePhasonicInterference(
    (heroWords.length % 17) / 17,
    0.35 + Math.min(0.8, (analysis.detected_clusters.phasonic.length + analysis.detected_clusters.relational.length) * 0.14)
  );
  const cadenceTermHits = (combined.toLowerCase().match(/[a-z0-9'-]+/g) || []).filter((w) => CYBERNETIC_CADENCE_TERMS.includes(w));
  const clusterBreadth = Math.min(1, (activeClusters.length + Math.min(3, cadenceTermHits.length * 0.6)) / 6);
  const instrumentFocus = primaryInst === 'PHASONIC_COUNTERPOINT' || primaryInst === 'DIALECTICAL_TENSION' ? 0.92 : 0.85;
  const semanticCoupling = +(0.50 * clusterBreadth + 0.30 * Math.min(1, (analysis.salient_keywords.length + cadenceTermHits.length) / 14) + 0.20 * instrumentFocus).toFixed(4);

  // 3. Anti-boilerplate, anti-bureaucratic fill, and epistemic concreteness
  const boilerplateHit = ANTI_BOILERPLATE_SUBTITLE_RX.test(sub) || ANTI_BOILERPLATE_SUBTITLE_RX.test(hdr);
  const bureaucraticHit = BUREAUCRATIC_FILLER_RX.test(hero);
  const questionBound = q.length >= 40;
  const concreteness = boilerplateHit
    ? 0.0
    : (bureaucraticHit ? 0.42 : (questionBound ? 1.0 : 0.84));

  // 4. Composite /dollhouse-design cadence score
  const score = +Math.max(
    0,
    Math.min(1, 0.36 * pedagogueCadence + 0.34 * semanticCoupling + 0.30 * concreteness)
  ).toFixed(4);

  return Object.freeze({
    schema: DESIGN_GRAMMAR_SCHEMA,
    design_cadence: score,
    governing_instrument: primaryInst,
    instrument_label: AVAILABLE_INSTRUMENTS[primaryInst]?.label || primaryInst,
    causal_law: INSTRUMENT_CAUSAL_LAWS[primaryInst] || INSTRUMENT_CAUSAL_LAWS.PHASONIC_COUNTERPOINT,
    active_clusters: Object.freeze(activeClusters),
    salient_keyword_count: analysis.salient_keywords.length,
    phasonic_sample: Object.freeze(phasonicDepth),
    pedagogue_cadence: pedagogueCadence,
    semantic_coupling: semanticCoupling,
    anti_boilerplate: !boilerplateHit,
    anti_bureaucratic: !bureaucraticHit,
    empirical_replication_credit: 0,
    authority: 'OPEN_FIELD_CREATIVE_SYNTHESIS'
  });
}

/**
 * Generates grammar-inflected synthesis telemetry over an Experiment-A corpus seed
 * so Salon & Podium expose which /dollhouse-design formal grammars shaped candidates.
 */
export function deriveDesignGrammarSynthesis({ seed = '', worksCount = 32, activeInstruments = [] } = {}) {
  const analysis = analyzeSeedSemantics(seed || 'two crossed probes non-collapsing planes five clocks mirror depth signal glare world replies');
  const inferred = activeInstruments.length ? activeInstruments : inferContextualInstruments(analysis.raw);
  return Object.freeze({
    schema: DESIGN_GRAMMAR_SCHEMA,
    inferred_instruments: Object.freeze(inferred),
    instrument_profiles: Object.freeze(inferred.map((id) => AVAILABLE_INSTRUMENTS[id]).filter(Boolean)),
    detected_clusters: analysis.detected_clusters,
    salient_keywords: Object.freeze(analysis.salient_keywords),
    works_census: Number(worksCount) || 32,
    phasonic_phi: +DESIGN_PHI.toFixed(6),
    empirical_replication_credit: 0,
    human_closure_required: true
  });
}
