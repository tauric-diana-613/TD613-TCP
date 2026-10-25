/**
 * @fileoverview TD613 Dollhouse Design Conductor (DD-02) v0.2.
 *
 * Implements the native creative authoring cycle:
 *   COMMISSION -> SELECT INSTRUMENTS -> GENERATE ALTERNATIVES -> COMPOSE -> MATERIALIZE -> REFRACT -> COMPARE -> RETURN
 *
 * v0.2 Refinements (Post-Audition / Pre-M6 Qualification):
 *   1. Commission-Derived Formal Alternatives: Replaces static hardcoded candidates with dynamic,
 *      seed-conditioned structural propositions derived from semantic cluster analysis, while supporting
 *      explicit author overrides.
 *   2. Causally Consequential Instrumentation: Declares formal causal contracts for each selectable
 *      instrument, specifying target domains, parameter transfer laws, and empirical falsification probes.
 *   3. Genuine Temporal & Interaction Design: Explicitly categorizes continuous geometry vs discrete
 *      state transitions, enforces user-controlled still-state reduced-motion modes, and mandates mobile legibility.
 *   4. Theoretical Fidelity & Creative Freedom: Anchors Caro, Butler, Sedgwick, Aperture, and Dialectical traditions
 *      in verifiable structural operations rather than decorative jargon.
 *
 * Governance:
 *   - Operates under OPEN_FIELD_CREATIVE_SYNTHESIS.
 *   - Zero scientific proof, zero release authority, zero production Loom/M6 mutation.
 *   - Human closure required.
 */

import { createHash } from 'node:crypto';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { runDollhouseSkillAudit } from './dollhouse-skill-dispatcher.js';

export const DOLLHOUSE_DESIGN_SCHEMA = 'td613.dollhouse-design.return-receipt/v0.2';
export const DOLLHOUSE_DESIGN_VERSION = 'v0.2-candidate';

export const VALID_REFERENCE_CLASSIFICATIONS = Object.freeze([
  'BINDING_CUSTODY_LAW',
  'BINDING_CONSTRAINT',
  'NEGOTIABLE_AESTHETIC_DIRECTION',
  'CONDUCTOR_HEURISTICS',
  'AGENT_AUTHORED_DECISIONS'
]);

export const VALID_PROVENANCE_CLASSES = Object.freeze([
  'CONTEMPORANEOUS_ORIGINAL',
  'RECONSTRUCTED_RECORD',
  'ANNOTATED_RECORD'
]);

export const AVAILABLE_INSTRUMENTS = Object.freeze({
  PHASONIC_COUNTERPOINT: {
    id: 'PHASONIC_COUNTERPOINT',
    label: 'D₃/φ Phasonic Counterpoint',
    lineage: 'Aperture v3.2-alpha Triple Overlay',
    operatesOn: 'transmedia invariance, periodic recurrence, quasiperiodic detour, and temporal lag',
    suitableFor: ['VISUAL', 'MOTION', 'HYBRID', 'THEORETICAL'],
    governing_theory: 'Triple Overlay (D₃ Periodic Lattice × φ Quasiperiodic Modulation × Heterostratigraphic Interference)'
  },
  CARO_INSTITUTIONAL_RECONSTRUCTION: {
    id: 'CARO_INSTITUTIONAL_RECONSTRUCTION',
    label: 'Caro Institutional Reconstruction',
    lineage: 'Thinkers Bin (Robert Caro / Institutional Power)',
    operatesOn: 'physical corridors, procedural friction, bureaucratic accumulation, and omitted records',
    suitableFor: ['SCHOLARLY', 'VISUAL', 'PRODUCT', 'HYBRID'],
    governing_theory: 'Robert Caro Archival Reconstruction & Procedural Resistance'
  },
  BUTLER_PERFORMATIVE_ITERATION: {
    id: 'BUTLER_PERFORMATIVE_ITERATION',
    label: 'Butler Performative Iteration',
    lineage: 'Thinkers Bin (Judith Butler / Performative Subversion)',
    operatesOn: 'ritualized reiteration, normative slippage, and compulsory legibility',
    suitableFor: ['SCHOLARLY', 'THEORETICAL', 'VISUAL'],
    governing_theory: 'Judith Butler Citational Reiteration & Normative Subversion'
  },
  SEDGWICK_REPARATIVE_TEXTURE: {
    id: 'SEDGWICK_REPARATIVE_TEXTURE',
    label: 'Sedgwick Reparative Texture',
    lineage: 'Thinkers Bin (Eve Kosofsky Sedgwick / Reparative Reading)',
    operatesOn: 'textural granularity, affective survival, and resisting paranoid closure',
    suitableFor: ['SCHOLARLY', 'VISUAL', 'PRODUCT'],
    governing_theory: 'Eve Kosofsky Sedgwick Paratactic Beside-ness & Affective Survival'
  },
  DIALECTICAL_TENSION: {
    id: 'DIALECTICAL_TENSION',
    label: 'Contrapuntal Dialectic',
    lineage: 'Classical Dialectics & Polyphony',
    operatesOn: 'irreducible antithesis, competing perspectives, and non-synthesizing juxtaposition',
    suitableFor: ['SCHOLARLY', 'THEORETICAL', 'MOTION'],
    governing_theory: 'Polyphonic Contrapuntalism & Irreducible Antithesis'
  }
});

export const VALID_MEDIA = Object.freeze([
  'VISUAL',
  'MOTION',
  'SCHOLARLY',
  'THEORETICAL',
  'PRODUCT',
  'HYBRID'
]);

function deepFreeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(deepFreeze);
    Object.freeze(value);
  }
  return value;
}

function sha256(data) {
  return createHash('sha256').update(typeof data === 'string' ? data : JSON.stringify(data)).digest('hex');
}

/**
 * Resolves and reads a historical source reference against git or local filesystem.
 * Fails closed (throws ReferenceError) if a binding reference cannot be retrieved.
 *
 * @param {object} ref
 * @param {object} [options={}]
 * @returns {object}
 */
export function resolveHistoricalReference(ref, options = {}) {
  const repoRoot = options.repoRoot || process.cwd();
  const refId = String(ref.reference_id || 'REF-UNNAMED').trim();
  const sourcePath = String(ref.source_path || ref.path || '').trim();
  const sourceRevision = String(ref.source_revision || ref.commit || ref.revision || '').trim();
  
  let classification = 'NEGOTIABLE_AESTHETIC_DIRECTION';
  if (ref.classification !== undefined && ref.classification !== null) {
    const rawClass = String(ref.classification).trim().toUpperCase();
    if (!VALID_REFERENCE_CLASSIFICATIONS.includes(rawClass)) {
      throw new TypeError(`Unrecognized historical reference classification "${ref.classification}". Allowed: ${VALID_REFERENCE_CLASSIFICATIONS.join(', ')}`);
    }
    classification = rawClass;
  }

  const isHexCommit = /^[a-f0-9]{40}$/i.test(sourceRevision);
  let revisionType = 'UNSPECIFIED';
  if (isHexCommit) {
    revisionType = 'IMMUTABLE_40HEX_COMMIT';
  } else if (sourceRevision && sourceRevision !== 'WORKING_TREE' && sourceRevision !== 'HEAD') {
    revisionType = 'MUTABLE_SYMBOLIC_REF';
  } else {
    revisionType = 'WORKING_TREE';
  }

  let provenanceClass = sourceRevision ? 'CONTEMPORANEOUS_ORIGINAL' : 'RECONSTRUCTED_RECORD';
  if (ref.provenance_class !== undefined && ref.provenance_class !== null) {
    const rawProv = String(ref.provenance_class).trim().toUpperCase();
    if (!VALID_PROVENANCE_CLASSES.includes(rawProv)) {
      throw new TypeError(`Unrecognized provenance class "${ref.provenance_class}". Allowed: ${VALID_PROVENANCE_CLASSES.join(', ')}`);
    }
    provenanceClass = rawProv;
  }

  const summary = String(ref.summary || ref.description || '').trim();
  const isBinding = classification === 'BINDING_CUSTODY_LAW' || classification === 'BINDING_CONSTRAINT';

  if (!sourcePath) {
    if (isBinding) {
      throw new TypeError(`Binding historical reference "${refId}" missing source_path`);
    }
  }

  let rawContent = null;
  let retrievalMethod = 'UNRESOLVED';
  let retrievalError = null;

  // 1. If source_revision is specified and not working tree, attempt git show
  if (sourceRevision && sourceRevision !== 'WORKING_TREE') {
    try {
      rawContent = execFileSync('git', ['show', `${sourceRevision}:${sourcePath}`], {
        cwd: repoRoot,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe']
      });
      retrievalMethod = isHexCommit ? 'GIT_SHOW_IMMUTABLE_40HEX_COMMIT' : 'GIT_SHOW_MUTABLE_REF';
    } catch (err) {
      retrievalError = String(err && err.message ? err.message : err).trim();
    }
  }

  // 2. Fallback to local filesystem if git show wasn't applicable or if working tree was requested
  if (rawContent === null && (!sourceRevision || sourceRevision === 'WORKING_TREE' || sourceRevision === 'HEAD')) {
    const fullPath = resolve(repoRoot, sourcePath);
    if (existsSync(fullPath)) {
      try {
        rawContent = readFileSync(fullPath, 'utf8');
        retrievalMethod = 'LOCAL_FILESYSTEM_WORKING_TREE';
      } catch (err) {
        retrievalError = String(err && err.message ? err.message : err).trim();
      }
    } else {
      retrievalError = `File not found on filesystem: ${sourcePath}`;
    }
  }

  // 3. Handle retrieval failure
  if (rawContent === null) {
    if (isBinding) {
      throw new ReferenceError(
        `Binding historical reference "${refId}" could not be resolved at revision ${sourceRevision || 'HEAD'}:${sourcePath}. Reason: ${retrievalError}`
      );
    }
    return Object.freeze({
      reference_id: refId,
      source_path: sourcePath,
      source_revision: sourceRevision,
      revision_type: revisionType,
      classification,
      provenance_class: provenanceClass,
      summary,
      resolution_status: 'UNRESOLVED',
      retrieval_method: 'FAILED',
      error: retrievalError,
      resolved: false
    });
  }

  // 4. Handle retrieval success
  const contentDigest = sha256(rawContent);
  const byteCount = Buffer.byteLength(rawContent, 'utf8');
  const lineCount = rawContent.split(/\r?\n/).length;
  const charCount = rawContent.length;

  // Compact excerpt for summary cards / receipts
  const contentExcerpt = rawContent.length > 1000 ? rawContent.slice(0, 1000) + '... [TRUNCATED]' : rawContent;

  // Complete source text retained so downstream creative author receives the entire document
  // without losing critical rules beyond the 1,000-character boundary
  const fullContent = rawContent;

  const contentManifest = Object.freeze({
    byte_count: byteCount,
    char_count: charCount,
    line_count: lineCount,
    sha256: contentDigest,
    is_complete: true,
    inspection_protocol: 'FULL_SOURCE_INGESTION'
  });

  return Object.freeze({
    reference_id: refId,
    source_path: sourcePath,
    source_revision: sourceRevision,
    revision_type: revisionType,
    classification,
    provenance_class: provenanceClass,
    summary,
    resolution_status: 'RESOLVED',
    retrieval_method: retrievalMethod,
    sha256: contentDigest,
    byte_count: byteCount,
    line_count: lineCount,
    content_excerpt: contentExcerpt,
    full_content: fullContent,
    content_manifest: contentManifest,
    resolved: true
  });
}

/**
 * Retrieves the complete source content of a resolved reference, ensuring
 * that instructions beyond any truncated excerpt are fully accessible to the author.
 *
 * @param {object} resolvedRef
 * @returns {string}
 */
export function getReferenceFullContent(resolvedRef) {
  if (!resolvedRef || typeof resolvedRef !== 'object') {
    throw new TypeError('Reference must be an object');
  }
  if (!resolvedRef.resolved || !resolvedRef.full_content) {
    throw new ReferenceError(`Reference "${resolvedRef.reference_id || 'UNKNOWN'}" has not been resolved or has no content`);
  }
  return resolvedRef.full_content;
}

/**
 * Resolves a list of historical references against git or local filesystem.
 * @param {Array<object>} references
 * @param {object} [options={}]
 * @returns {Array<object>}
 */
export function resolveHistoricalReferences(references = [], options = {}) {
  if (!Array.isArray(references)) return Object.freeze([]);
  return Object.freeze(references.map(ref => resolveHistoricalReference(ref, options)));
}

export const THEMATIC_CLUSTERS = Object.freeze({
  // Five selectable tradition clusters for deterministic instrument scoring
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
    'phason', 'phasonic', 'quasiperiodic', 'lattice', 'periodic', 'moiré', 'trajectory',
    'geometry', 'wave', 'interference', 'recurrence', 'detour', 'transmedia', 'cadence',
    'temporal', 'spatial', 'endpoint', 'door', 'arrival', 'passage', 'stage', 'machinery',
    'proscenium', 'scaffold', 'projection', 'strain', 'd3', 'phi', 'scene', 'time'
  ]),
  // Semantic descriptive clusters for candidate generation
  temporal: Object.freeze([
    'time', 'scene', 'history', 'before', 'after', 'dawn', 'future', 'past',
    'passage', 'cadence', 'quietly', 'temporal', 'moment'
  ]),
  machinery: Object.freeze([
    'machinery', 'machine', 'stage', 'pulley', 'crane', 'gear', 'lever',
    'rigging', 'console', 'engine', 'instrument', 'mechanism', 'anvil'
  ]),
  textual: Object.freeze([
    'punctuation', 'grammar', 'marks', 'sentence', 'clause', 'word', 'syntax',
    'letters', 'language', 'title', 'ledger', 'record', 'stop', 'colon', 'dash'
  ]),
  spatial: Object.freeze([
    'theater', 'corridor', 'door', 'endpoint', 'boundary', 'threshold',
    'estuary', 'proscenium', 'hall', 'room', 'vault', 'site', 'ground'
  ]),
  relational: Object.freeze([
    'arrive', 'differ', 'separate', 'change', 'converge', 'refract', 'invert',
    'slip', 'reiterate', 'dissolve', 'suspend', 'hold'
  ])
});

/**
 * Analyzes seed semantics to derive operative keywords and thematic tensions.
 * @param {string} seed
 * @returns {object}
 */
export function analyzeSeedSemantics(seed = '') {
  const clean = String(seed).toLowerCase();
  const words = clean.match(/[a-z0-9'-]+/g) || [];

  const detected = {};
  for (const [clusterName, termList] of Object.entries(THEMATIC_CLUSTERS)) {
    detected[clusterName] = words.filter(w => termList.includes(w));
  }

  const stopWords = new Set([
    'a', 'an', 'the', 'in', 'which', 'are', 'and', 'each', 'of', 'it', 'to',
    'for', 'with', 'on', 'at', 'by', 'from', 'but', 'is', 'as', 'that', 'this',
    'when', 'where', 'only', 'all', 'any', 'into', 'over'
  ]);
  const salientKeywords = words.filter(w => !stopWords.has(w) && w.length > 2);

  return {
    raw: seed,
    word_count: words.length,
    detected_clusters: detected,
    salient_keywords: Array.from(new Set(salientKeywords))
  };
}

/**
 * Builds an explicit causal contract for an instrument, linking parameters to material effects.
 * @param {string} instrumentId
 * @param {string} medium
 * @param {Array<string>} seedTerms
 * @returns {object}
 */
export function buildInstrumentCausalContract(instrumentId, medium, seedTerms = []) {
  const contracts = {
    PHASONIC_COUNTERPOINT: {
      instrument_id: 'PHASONIC_COUNTERPOINT',
      governing_theory: 'Triple Overlay (D₃ Periodic Lattice × φ Quasiperiodic Modulation × Heterostratigraphic Interference)',
      target_domains: ['GEOMETRY', 'MOTION', 'GRAMMAR'],
      causal_bindings: [
        {
          parameter: 'scalar_interference_H',
          target_component: 'spatial_lattice_geometry',
          transfer_law: 'dx(k) = 24.0 * H(u) * cos(2*pi*phi*k*0.05); dy(k) = 24.0 * H(u) * sin(2*pi*phi*k*0.05); where H(u) = 0.5*(1 - cos(2*pi*u)) + 0.5*(1 - cos(2*pi*phi*u))',
          falsification_probe: 'H = 0.0000 collapses all vertex displacement to 0.00px, restoring unperturbed D3 equilateral triangular mesh'
        },
        {
          parameter: 'scalar_interference_H',
          target_component: 'clause_syntax_selection',
          transfer_law: 'syntax_state = H >= 1.30 ? SEMICOLON_EQUIPOLLENCE : (H >= 0.75 ? EM_DASH_SHEAR : (H >= 0.25 ? COLON_SUSPENSION : PERIODIC_BASELINE))',
          falsification_probe: 'Forcing H = 0.0000 resets syntax_state to PERIODIC_BASELINE ("The king arrived.") and font weight to 400'
        }
      ],
      causality_class: 'OPERATIVE_TRANSFER'
    },
    CARO_INSTITUTIONAL_RECONSTRUCTION: {
      instrument_id: 'CARO_INSTITUTIONAL_RECONSTRUCTION',
      governing_theory: 'Robert Caro Archival Reconstruction & Procedural Resistance',
      target_domains: ['SPATIAL_TOPOLOGY', 'INTERACTION_FRICTION', 'DOCUMENT_CUSTODY'],
      causal_bindings: [
        {
          parameter: 'procedural_friction_coefficient_mu',
          target_component: 'procedural_clearance_latency',
          transfer_law: 'T_clearance = mu * 400ms (chamber latency delay; navigation controls locked during administrative review; reduced-motion or falsification probe bypasses to 0ms)',
          declarative_alternative: 'scroll_delta_effective = scroll_delta_raw / (1 + mu * bureaucratic_layers)',
          execution_status: 'EXECUTED_DEMONSTRATION_LAW',
          falsification_probe: 'mu = 0.0 collapses procedural clearance latency to 0ms (immediate transition across corridor)'
        },
        {
          parameter: 'archive_omission_index_lambda',
          target_component: 'progressive_document_redaction',
          transfer_law: 'redacted_word_count = chamber_index * 4 (discrete petition redaction; terminal door unlocks at 16/16 redactions)',
          declarative_alternative: 'text_opacity = 1.0 - lambda * sovereign_censure_level',
          execution_status: 'EXECUTED_DEMONSTRATION_LAW',
          falsification_probe: 'lambda = 0.0 restores all 16 words to full visibility and keeps terminal door locked'
        }
      ],
      causality_class: 'OPERATIVE_TRANSFER'
    },
    BUTLER_PERFORMATIVE_ITERATION: {
      instrument_id: 'BUTLER_PERFORMATIVE_ITERATION',
      governing_theory: 'Judith Butler Citational Reiteration & Normative Subversion',
      target_domains: ['TYPOGRAPHY', 'ITERATIVE_CADENCE', 'SYNTAX'],
      causal_bindings: [
        {
          parameter: 'citational_slippage_epsilon',
          target_component: 'glyph_variance_and_kerning',
          transfer_law: 'kerning(n) = kerning_0 + epsilon * log(1 + n)',
          falsification_probe: 'epsilon = 0.0 forces mechanical conformity across all repetitions'
        }
      ],
      causality_class: 'OPERATIVE_TRANSFER'
    },
    SEDGWICK_REPARATIVE_TEXTURE: {
      instrument_id: 'SEDGWICK_REPARATIVE_TEXTURE',
      governing_theory: 'Eve Kosofsky Sedgwick Paratactic Beside-ness & Affective Survival',
      target_domains: ['LAYOUT_TOPOLOGY', 'MATERIAL_SURFACE', 'READING_ORDER'],
      causal_bindings: [
        {
          parameter: 'paratactic_proximity_delta',
          target_component: 'marginal_fragment_placement',
          transfer_law: 'x_marginal = x_sovereign_edge + delta * sensory_salience',
          falsification_probe: 'delta = 0.0 collapses beside-ness into subordinating vertical footnote hierarchy'
        }
      ],
      causality_class: 'OPERATIVE_TRANSFER'
    },
    DIALECTICAL_TENSION: {
      instrument_id: 'DIALECTICAL_TENSION',
      governing_theory: 'Polyphonic Contrapuntalism & Irreducible Antithesis',
      target_domains: ['TEMPORAL_STRUCTURE', 'AUDIO_VISUAL_INTERVAL', 'ARGUMENTATION'],
      causal_bindings: [
        {
          parameter: 'dissonance_interval_omega',
          target_component: 'polyphonic_phase_alignment',
          transfer_law: 'phase_offset = omega * pi * sin(t)',
          falsification_probe: 'omega = 0.0 resolves competing voices into unison synthesis'
        }
      ],
      causality_class: 'OPERATIVE_TRANSFER'
    }
  };

  return contracts[instrumentId] || {
    instrument_id: instrumentId,
    governing_theory: 'Generic Creative Instrument',
    target_domains: ['AESTHETIC_FORM'],
    causal_bindings: [],
    causality_class: 'ANALOGICAL_COMPOSITION'
  };
}

/**
 * Derives structurally distinct formal candidates from the commission.
 * @param {object} commission
 * @returns {Array<object>}
 */
export function deriveCommissionCandidates(commission) {
  // If author supplied explicit candidate proposals, validate and preserve them
  if (Array.isArray(commission.candidate_overrides) && commission.candidate_overrides.length >= 2) {
    return commission.candidate_overrides.map((cand, idx) => ({
      id: `${commission.commission_id}-CAND-${String.fromCharCode(65 + idx)}`,
      concept_title: String(cand.concept_title || cand.title || `Custom Proposal ${idx + 1}`),
      governing_instrument: String(cand.governing_instrument || commission.instruments[idx] || commission.instruments[0]),
      formal_proposition: String(cand.formal_proposition || cand.proposition || ''),
      structural_mechanisms: Array.isArray(cand.structural_mechanisms) ? cand.structural_mechanisms : [],
      medium_consequence: String(cand.medium_consequence || `Custom structural consequence in ${commission.medium}.`),
      scaffolding_class: 'AUTHOR_DECLARED_PROPOSAL',
      proposal_origin: 'OPERATOR_OVERRIDE',
      seed_anchor_terms: Array.isArray(cand.seed_anchor_terms) ? cand.seed_anchor_terms : []
    }));
  }

  const analysis = analyzeSeedSemantics(commission.seed);
  const primaryInst = commission.instruments[0] || 'PHASONIC_COUNTERPOINT';
  const secondaryInst = commission.instruments[1] || commission.instruments[0];

  const primaryTerms = analysis.salient_keywords.slice(0, 3);
  const noun1 = primaryTerms[0] || 'form';
  const noun2 = primaryTerms[1] || 'tension';
  const noun3 = primaryTerms[2] || 'relation';

  // Capitalize helper
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

  // Candidate A: Direct Synthesis derived from seed's primary nouns + primary instrument
  let candATitle = `The ${cap(noun1)} ${cap(noun2)} Strata`;
  let candAProp = `Constructs a dual-strata composition where ${noun1} functions as an operative baseline, while ${noun2} exerts structural tension across the work.`;

  if (analysis.detected_clusters.machinery.length > 0 && analysis.detected_clusters.textual.length > 0) {
    candATitle = `The ${cap(analysis.detected_clusters.textual[0])} Machinery`;
    candAProp = `Couples textual syntax with mechanical rigging, turning grammatical marks into operative stage levers that deform antecedent history.`;
  } else if (primaryInst === 'CARO_INSTITUTIONAL_RECONSTRUCTION' || analysis.detected_clusters.institutional.length > 0) {
    candATitle = `The ${cap(analysis.detected_clusters.institutional[0] || 'Corridor')} Apparatus`;
    candAProp = `Materializes administrative resistance and institutional friction through procedural delay and archival omission.`;
  } else if (primaryInst === 'BUTLER_PERFORMATIVE_ITERATION' || analysis.detected_clusters.performative.length > 0) {
    candATitle = `The ${cap(analysis.detected_clusters.performative[0] || 'Ritual')} Iteration`;
    candAProp = `Stages citational repetition where small performative slippages subvert the normative decree.`;
  } else if (primaryInst === 'SEDGWICK_REPARATIVE_TEXTURE' || analysis.detected_clusters.reparative.length > 0) {
    candATitle = `The ${cap(analysis.detected_clusters.reparative[0] || 'Textile')} Shelter`;
    candAProp = `Assembles paratactic fragments beside the sovereign baseline, prioritizing affective survival and tactile care.`;
  } else if (primaryInst === 'DIALECTICAL_TENSION' || analysis.detected_clusters.dialectical.length > 0) {
    candATitle = `The ${cap(analysis.detected_clusters.dialectical[0] || 'Dissonant')} Counterpoint`;
    candAProp = `Maintains irreconcilable polyphonic voices in sustained tension without forced synthesis or harmonic erasure.`;
  } else if (primaryInst === 'PHASONIC_COUNTERPOINT' || analysis.detected_clusters.phasonic.length > 0) {
    candATitle = `The ${cap(analysis.detected_clusters.phasonic[0] || 'Phasonic')} Escapement`;
    candAProp = `Couples quasiperiodic wave modulation with physical lattice strain, transforming recurrence into material displacement.`;
  }

  const candidateA = {
    id: `${commission.commission_id}-CAND-A`,
    concept_title: candATitle,
    governing_instrument: primaryInst,
    formal_proposition: candAProp,
    structural_mechanisms: [
      `Baseline Cadence: Maps ${noun1} into a structured recursive invariant`,
      `Counter-Pressure: Introduces ${noun2} as an aperiodic strain vector`,
      `Causal Interference: Measures observable displacement where ${noun1} and ${noun2} collide`
    ],
    medium_consequence: `In ${commission.medium}, the work refuses singular closure by presenting distinct rival paths.`,
    scaffolding_class: 'DETERMINISTIC_FRAMEWORK',
    proposal_origin: 'COMMISSION_DERIVED',
    seed_anchor_terms: primaryTerms
  };

  // Candidate B: Structural Inversion / Counter-Pole
  let candBTitle = `The Inverted ${cap(noun2)}`;
  let candBProp = `Inverts the temporal sequence: displays the terminal consequence at ingress, requiring the observer to unravel accumulated expenditure.`;

  if (secondaryInst === 'SEDGWICK_REPARATIVE_TEXTURE' || analysis.detected_clusters.reparative.length > 0) {
    candBTitle = `The Paratactic Shelter`;
    candBProp = `Assembles discarded textures beside the sovereign baseline, prioritizing affective survival over procedural prosecution.`;
  } else if (secondaryInst === 'CARO_INSTITUTIONAL_RECONSTRUCTION' || analysis.detected_clusters.institutional.length > 0) {
    candBTitle = `The Applicant's Corridor`;
    candBProp = `Reframes the work through the sensory exhaustion of the delayed subject rather than the sovereign designer's blueprint.`;
  } else if (secondaryInst === 'BUTLER_PERFORMATIVE_ITERATION' || analysis.detected_clusters.performative.length > 0) {
    candBTitle = `The Citational Slippage`;
    candBProp = `Discloses how successive repetitions introduce subversive drift into the authoritative script.`;
  } else if (secondaryInst === 'DIALECTICAL_TENSION' || analysis.detected_clusters.dialectical.length > 0) {
    candBTitle = `The Antithetical Voice`;
    candBProp = `Elevates the opposing choral counter-voice, refusing premature unison and exposing structural contradiction.`;
  }

  const candidateB = {
    id: `${commission.commission_id}-CAND-B`,
    concept_title: candBTitle,
    governing_instrument: secondaryInst,
    formal_proposition: candBProp,
    structural_mechanisms: [
      `Procedural Inversion: Consequence displayed at ingress; terminal loss visible prior to operational cause`,
      `Friction Accounting: Each interaction demands explicit recognition of past energetic cost`,
      `Asymmetric Recovery: Historical traversal is fully recordable but structurally irreversible`
    ],
    medium_consequence: `In ${commission.medium}, the work subverts institutional arrival by foregrounding retained loss.`,
    scaffolding_class: 'DETERMINISTIC_FRAMEWORK',
    proposal_origin: 'COMMISSION_DERIVED',
    seed_anchor_terms: [noun2, noun3].filter(Boolean)
  };

  return [candidateA, candidateB];
}

/**
 * Infers a context-sensitive default instrument from the semantic seed when omitted.
 * Uses deterministic token scoring across THEMATIC_CLUSTERS.
 * @param {string} seed
 * @returns {Array<string>}
 */
export function inferContextualInstruments(seed = '') {
  const analysis = analyzeSeedSemantics(seed);

  const scores = {
    CARO_INSTITUTIONAL_RECONSTRUCTION: analysis.detected_clusters.institutional.length,
    BUTLER_PERFORMATIVE_ITERATION: analysis.detected_clusters.performative.length,
    SEDGWICK_REPARATIVE_TEXTURE: analysis.detected_clusters.reparative.length,
    DIALECTICAL_TENSION: analysis.detected_clusters.dialectical.length,
    PHASONIC_COUNTERPOINT: analysis.detected_clusters.phasonic.length
  };

  // Find candidate with highest score (deterministic tie-break follows order above)
  let bestInstrument = null;
  let maxScore = 0;
  for (const [inst, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      bestInstrument = inst;
    }
  }

  // If at least one cluster matched with score > 0, return best; otherwise predictable fallback to PHASONIC
  return [bestInstrument || 'PHASONIC_COUNTERPOINT'];
}

/**
 * Normalizes and validates the incoming design commission.
 */
export function normalizeCommission(raw = {}) {
  const seed = String(raw.seed || '').trim();
  if (!seed) throw new TypeError('Commission requires an intellectual seed');

  const medium = String(raw.medium || 'SCHOLARLY').trim().toUpperCase();
  if (!VALID_MEDIA.includes(medium)) {
    throw new TypeError(`Invalid medium "${medium}". Allowed: ${VALID_MEDIA.join(', ')}`);
  }

  const rawHc = raw.human_coordinates || raw.humanCoordinates || {};
  const humanCoordinates = Object.freeze({
    what: String(rawHc.what || rawHc.WHAT || 'Declared artifact form').trim(),
    who: String(rawHc.who || rawHc.WHO || 'Intended human encounter & authority').trim(),
    where: String(rawHc.where || rawHc.WHERE || 'Material site & viewport').trim(),
    how: String(rawHc.how || rawHc.HOW || 'Operational & rhetorical mechanism').trim(),
    when: String(rawHc.when || rawHc.WHEN || 'Temporal cadence & transform sequence').trim(),
    why: String(rawHc.why || rawHc.WHY || 'Teleological & consequential purpose').trim()
  });

  let selectedInstruments = [];
  if (raw.instruments !== undefined && raw.instruments !== null) {
    if (!Array.isArray(raw.instruments)) {
      throw new TypeError('Commission "instruments" must be an array of instrument identifiers');
    }
    if (raw.instruments.length === 0) {
      throw new TypeError('Commission "instruments" must not be an empty array. Omit "instruments" to allow contextual inference.');
    }
    for (const inst of raw.instruments) {
      const cleanInst = String(inst).trim().toUpperCase();
      if (!AVAILABLE_INSTRUMENTS[cleanInst]) {
        throw new TypeError(`Unrecognized instrument "${inst}". Available: ${Object.keys(AVAILABLE_INSTRUMENTS).join(', ')}`);
      }
      selectedInstruments.push(cleanInst);
    }
  } else {
    selectedInstruments = inferContextualInstruments(seed);
  }

  // Parse and freeze historical reference inputs (Pre-M6 Reference Ingestion)
  let rawRefs = [];
  if (raw.historical_references !== undefined && raw.historical_references !== null) {
    if (!Array.isArray(raw.historical_references)) {
      throw new TypeError('Commission "historical_references" must be an array of reference objects');
    }
    rawRefs = raw.historical_references;
  }

  const historicalReferences = Object.freeze(rawRefs.map((ref, idx) => {
    if (!ref || typeof ref !== 'object') {
      throw new TypeError(`Historical reference at index ${idx} must be an object`);
    }
    const refId = String(ref.reference_id || `REF-${idx + 1}`).trim();
    if (!refId) throw new TypeError(`Historical reference at index ${idx} missing reference_id`);

    let classification = 'NEGOTIABLE_AESTHETIC_DIRECTION';
    if (ref.classification !== undefined && ref.classification !== null) {
      const cleanClass = String(ref.classification).trim().toUpperCase();
      if (!VALID_REFERENCE_CLASSIFICATIONS.includes(cleanClass)) {
        throw new TypeError(
          `Unrecognized historical reference classification "${ref.classification}" in reference "${refId}". Allowed: ${VALID_REFERENCE_CLASSIFICATIONS.join(', ')}`
        );
      }
      classification = cleanClass;
    }

    const sourceRevision = String(ref.source_revision || ref.commit || ref.revision || '').trim();
    let provenanceClass = sourceRevision ? 'CONTEMPORANEOUS_ORIGINAL' : 'RECONSTRUCTED_RECORD';
    if (ref.provenance_class !== undefined && ref.provenance_class !== null) {
      const cleanProv = String(ref.provenance_class).trim().toUpperCase();
      if (!VALID_PROVENANCE_CLASSES.includes(cleanProv)) {
        throw new TypeError(
          `Unrecognized provenance class "${ref.provenance_class}" in reference "${refId}". Allowed: ${VALID_PROVENANCE_CLASSES.join(', ')}`
        );
      }
      provenanceClass = cleanProv;
    }

    const sourcePath = String(ref.source_path || ref.path || '').trim();
    if (!sourcePath && (classification === 'BINDING_CUSTODY_LAW' || classification === 'BINDING_CONSTRAINT')) {
      throw new TypeError(`Binding historical reference "${refId}" missing source_path`);
    }

    return Object.freeze({
      reference_id: refId,
      source_path: sourcePath,
      source_revision: sourceRevision,
      classification,
      provenance_class: provenanceClass,
      summary: String(ref.summary || ref.description || '').trim()
    });
  }));

  const requestedDeliverables = raw.deliverable_count === undefined ? 1 : raw.deliverable_count;
  if (!Number.isSafeInteger(requestedDeliverables) || requestedDeliverables < 1) {
    throw new TypeError('Commission "deliverable_count" must be a positive safe integer; default is 1');
  }

  return Object.freeze({
    commission_id: String(raw.commission_id || `COMM-${sha256(seed).slice(0, 8)}`),
    deliverable_count: requestedDeliverables,
    seed,
    medium,
    human_coordinates: humanCoordinates,
    instruments: Object.freeze(selectedInstruments),
    historical_references: historicalReferences,
    candidate_overrides: deepFreeze(raw.candidate_overrides || raw.candidates || null),
    refractive_parameters: deepFreeze(raw.refractive_parameters || {}),
    scientific_audit_requested: raw.scientific_audit_requested === true
  });
}

/**
 * Executes the generative authoring cycle.
 */
export async function runDollhouseDesignCycle(commissionInput = {}, options = {}) {
  const commission = normalizeCommission(commissionInput);

  // 1. RESOLVE HISTORICAL REFERENCES (Pre-M6 Reference Resolution - Fail-Closed on BINDING)
  const resolvedReferences = resolveHistoricalReferences(commission.historical_references, options);

  // 2. SELECT INSTRUMENTS
  const instruments = commission.instruments.map(id => AVAILABLE_INSTRUMENTS[id]);

  // 3. GENERATE COMMISSION-DERIVED ALTERNATIVES
  const candidates = deriveCommissionCandidates(commission);
  const [candidateA, candidateB] = candidates;

  // 3. COMPOSE & MATERIALIZE (Primary Choice)
  const primaryMaterialization = {
    selected_concept: candidateA.id,
    title: `Composition on: ${commission.seed}`,
    medium: commission.medium,
    instruments: commission.instruments,
    formal_architecture: {
      ingress: `Coupling WHAT (${commission.human_coordinates.what}) with WHO (${commission.human_coordinates.who})`,
      cadence: `Choreographing WHEN (${commission.human_coordinates.when}) against WHY (${commission.human_coordinates.why})`,
      execution: `Resolving WHERE (${commission.human_coordinates.where}) through HOW (${commission.human_coordinates.how})`
    },
    operative_verbs: [
      { verb: 'PROPAGATION', action: `Derived dual commission-grounded proposals (${candidateA.concept_title} / ${candidateB.concept_title})` },
      { verb: 'COMPRESSION', action: 'Retained path-sensitive distinctions without decorative surplus' },
      { verb: 'COUPLING', action: 'Bound human coordinates into mutually consequential pairs' },
      { verb: 'TRANSITION', action: 'Shifted projection into declared medium without losing invariants' },
      { verb: 'STABILIZATION', action: 'Anchored final form with inspectable boundaries and human closure' }
    ]
  };

  // 4. REFRACT (Controlled Counterfactual Variant)
  const defaultRefractiveProfiles = {
    PHASONIC_COUNTERPOINT: {
      mutated_parameter: 'temporal_revelation_order',
      mutation_description: 'Reverses the sequence: reveals path divergence first, and shared endpoint alibi second.',
      formal_consequence: 'Changes the work from an exposure of institutional erasure into a study of inevitable convergence.',
      material_difference: 'The viewer witnesses the divergence before discovering they were destined for the same door.',
      instruction_trace: 'Choreograph the trajectory so the observer witnesses divergence before discovering the shared endpoint.'
    },
    CARO_INSTITUTIONAL_RECONSTRUCTION: {
      mutated_parameter: 'administrative_friction_inversion',
      mutation_description: 'Inverts the vantage point from sovereign bureaucratic gatekeeper to the affected citizen traversing the corridor.',
      formal_consequence: 'Shifts from documenting administrative machinery to measuring the human exhaustion of delay.',
      material_difference: 'The composition is framed through the citizen waiting room rather than the executive drafting chamber.',
      instruction_trace: 'Reconstruct the physical and procedural friction from the standpoint of the delayed applicant.'
    },
    BUTLER_PERFORMATIVE_ITERATION: {
      mutated_parameter: 'citational_conformity',
      mutation_description: 'Shifts from compliant ritual repetition to subversive slippage across iterations.',
      formal_consequence: 'Discloses the fragility of sovereign norms through imperfect mimicry.',
      material_difference: 'Iterative copies introduce uncontrollable variance that destabilizes the original authority.',
      instruction_trace: 'Structure each repetition to amplify marginal variance against the declared norm.'
    },
    SEDGWICK_REPARATIVE_TEXTURE: {
      mutated_parameter: 'hermeneutic_posture',
      mutation_description: 'Shifts from paranoid exposure of sovereign harm to paratactic affective survival.',
      formal_consequence: 'Gathers discarded textures and communal practices beside the official ledger.',
      material_difference: 'Replaces forensic prosecution of the censor with an inhabitable shelter of shared memory.',
      instruction_trace: 'Assemble unofficial communal survival fragments in side-by-side parataxis with the sovereign decree.'
    },
    DIALECTICAL_TENSION: {
      mutated_parameter: 'polyphonic_hierarchy',
      mutation_description: 'Inverts the dominant and counter-melody lines without allowing synthesis.',
      formal_consequence: 'Forces the audience to sustain contradictory claims simultaneously.',
      material_difference: 'Elevates the suppressed counter-premise into structural dominance while preserving the interval.',
      instruction_trace: 'Counter-pose thesis and antithesis without resolving them into a harmonious third term.'
    }
  };

  const primaryInst = commission.instruments[0] || 'PHASONIC_COUNTERPOINT';
  const defaultProfile = defaultRefractiveProfiles[primaryInst] || defaultRefractiveProfiles.PHASONIC_COUNTERPOINT;

  const rawParams = commission.refractive_parameters || {};
  const mutatedParameter = String(rawParams.mutated_parameter || Object.keys(rawParams)[0] || defaultProfile.mutated_parameter);
  const mutationDescription = String(rawParams.mutation_description || rawParams[mutatedParameter] || defaultProfile.mutation_description);
  const formalConsequence = String(rawParams.formal_consequence || defaultProfile.formal_consequence);
  const materialDifference = String(rawParams.material_difference || defaultProfile.material_difference);
  const instructionTrace = String(rawParams.instruction_trace || defaultProfile.instruction_trace);

  const refractiveVariant = {
    id: `${commission.commission_id}-REFRACT-01`,
    governing_instrument: commission.instruments[1] || commission.instruments[0],
    mutated_parameter: mutatedParameter,
    mutation_description: mutationDescription,
    formal_consequence: formalConsequence,
    material_difference: materialDifference,
    instruction_trace: instructionTrace,
    status: 'INTERNAL_COMPARATIVE_DESIGN_STUDY_NOT_A_DELIVERABLE'
  };

  // 5. COMPARE (What survived, what changed, open decisions)
  const comparativeAnalysis = {
    shared_invariants: [
      `The core intellectual seed ("${commission.seed}") is held invariant across internal design alternatives`,
      `Internal studies inhabit the declared medium: ${commission.medium}`,
      'No scalar utility score or automatic aesthetic crown is applied'
    ],
    divergent_qualities: [
      `Candidate A operates under primary instrument ${primaryInst}: ${candidateA.formal_proposition}`,
      `Refractive Variant mutates [${mutatedParameter}]: ${formalConsequence}`
    ],
    governing_interaction_topology: {
      spatial_interpolation: 'CONTINUOUS_MANIFOLD_WHERE_REQUIRED',
      grammatical_state_transitions: 'DISCRETE_STATE_PERMUTATIONS',
      motion_policy: 'USER_CONTROLLED_STILL_STATE_UNDER_REDUCED_MOTION',
      mobile_legibility_profile: {
        minimum_telemetry_font_px: 12,
        minimum_hit_target_px: 44,
        viewport_stack_boundary_px: 480
      }
    },
    open_aesthetic_questions: [
      `Does the materialization of [${mutatedParameter}] successfully alter the observer's understanding of the seed?`,
      'Which counterfactual insights improve the commissioned work without creating unauthorized outputs?'
    ]
  };

  // 6. INSTRUMENT PROVENANCE & CAUSAL CONTRACT LEDGER
  const analysis = analyzeSeedSemantics(commission.seed);
  const instrumentProvenance = commission.instruments.map(instId => {
    const inst = AVAILABLE_INSTRUMENTS[instId];
    const causalContract = buildInstrumentCausalContract(inst.id, commission.medium, analysis.salient_keywords);
    let contrib = 'Supplied formal generative grammar';
    if (inst.id === 'PHASONIC_COUNTERPOINT') {
      contrib = 'Supplied D₃ periodic scaffold, φ quasiperiodic detour equations, and interference field';
    } else if (inst.id === 'CARO_INSTITUTIONAL_RECONSTRUCTION') {
      contrib = 'Supplied procedural friction, statutory cross-referencing, and corridor resistance';
    } else if (inst.id === 'BUTLER_PERFORMATIVE_ITERATION') {
      contrib = 'Supplied ritualized citational reiteration and subversive slippage across repetitions';
    } else if (inst.id === 'SEDGWICK_REPARATIVE_TEXTURE') {
      contrib = 'Supplied paratactic beside-ness, textural granularity, and affective survival';
    } else if (inst.id === 'DIALECTICAL_TENSION') {
      contrib = 'Supplied polyphonic contrapuntal resistance and non-synthesizing tension';
    }
    return {
      instrument_id: inst.id,
      lineage: inst.lineage,
      material_contribution: contrib,
      causal_contract: causalContract
    };
  });

  // 7. SCIENTIFIC COMPANION AUDIT (Optional & Advisory)
  let scientificAuditReceipt = null;
  if (commission.scientific_audit_requested) {
    try {
      const auditResult = await runDollhouseSkillAudit({
        source_revision: 'main',
        task_scope: `DOLLHOUSE_DESIGN_ADVISORY_${commission.commission_id}`,
        roles: ['PEDAGOGUE', 'APERTURE'],
        include_orchestrator: true,
        evidence_class: 'SYNTHETIC_TEST_FIXTURE',
        evidence_references: ['app/engine/dollhouse-design-conductor.js']
      });
      scientificAuditReceipt = {
        disposition: auditResult.orchestrator_disposition,
        exit_code: auditResult.exit_code,
        summary: 'Scientific companion completed bounded advisory audit of design components.'
      };
    } catch (err) {
      scientificAuditReceipt = {
        disposition: 'AUDIT_UNAVAILABLE',
        error: String(err && err.message || err)
      };
    }
  }

  // 8. COMPILE FINAL RETURN RECEIPT
  const returnReceipt = {
    schema: DOLLHOUSE_DESIGN_SCHEMA,
    version: DOLLHOUSE_DESIGN_VERSION,
    commission_id: commission.commission_id,
    seed: commission.seed,
    medium: commission.medium,
    human_coordinates: commission.human_coordinates,
    selected_instruments: commission.instruments,
    output_contract: {
      requested_deliverables: commission.deliverable_count,
      cardinality_authority: 'OPERATOR_COMMISSION_ONLY',
      default_deliverables: 1,
      candidates_are_internal_scaffolding: true,
      refraction_is_internal_scaffolding: true,
      additional_files_or_visual_modes_authorized: false,
      instruction: 'Materialize and return exactly the commissioned number of coherent finished artifacts; do not deliver Candidate B, refraction, receipts, or bonus modes as separate artifacts unless the operator specifically requests them.'
    },
    historical_references: resolvedReferences,
    candidates: [candidateA, candidateB],
    primary_materialization: primaryMaterialization,
    refractive_variant: refractiveVariant,
    comparative_analysis: comparativeAnalysis,
    instrument_provenance: instrumentProvenance,
    scientific_companion_audit: scientificAuditReceipt,
    governance: {
      discourse_mode: 'OPEN_FIELD_CREATIVE_SYNTHESIS',
      scientific_proof: false,
      palate_status: 'UNBORN',
      release_authority: false,
      deployment_authority: false,
      human_closure_required: true,
      governing_law: 'Make the unresolved relation productive. Let distinct forms meet without forcing them to merge. Allow the work to discover its medium through consequence.'
    }
  };

  return deepFreeze(returnReceipt);
}
