import {
  analyzeHolonomyLoomMessage,
  makeHolonomyLoomSaferCopy,
  HOLONOMY_LOOM_CLAIM_CEILING
} from './engine.js';
import { HOLONOMY_LOOM_MOTION_KEYS } from './flowcore-aia-motion.js';

export const LOOM_SEMANTIC_FIELD_SCHEMA = 'td613.loom.semantic-field/v0.1';
export const LOOM_PORTABLE_PACKET_SCHEMA = 'td613.loom.portable-aia/v0.1';

const COMPILER = 'loom-fictional-practice/v0.1';
const QUIET_TEXT = 'Our fictional garden group meets tomorrow.';
const PROTECTED_TEXT = 'The glass seed stays in our practice box.';
const PROTECTED_RULE = { value: 'glass seed', label: 'fictional protected phrase' };
const JOURNEY_RULE = { value: 'amber path', label: 'declared fictional garden route' };

function freeze(value) {
  if (value && typeof value === 'object') {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
}

const definitions = freeze([
  {
    id: 'quiet', title: 'A clear path',
    consequence: 'Nothing matched the rules we checked.',
    why: 'The fictional garden note has no match under the enabled Loom rules. GREEN is not a promise about every risk.',
    next: 'Try a note carrying a fictional contact address.',
    input: { text: QUIET_TEXT }, phase: 'gathering', glyphs: ['gathering', 'protected_continuity'],
    alert: 'NONE', severity: 'GREEN', pressure: 0
  },
  {
    id: 'bounded-change', title: 'Something travels with it',
    consequence: 'An address would travel with this note.',
    why: 'The real email rule matched a reserved, fictional address. The amber narrowing means a change is needed, not that anyone has read it.',
    next: 'See what happens when an exact phrase is protected.',
    input: { text: 'Our fictional plotter is plotter@example.invalid.' }, phase: 'recurrence',
    glyphs: ['gathering', 'recurrence'], alert: 'NOTICE', severity: 'YELLOW', pressure: 0.28
  },
  {
    id: 'release-block', title: 'This thread stays here',
    consequence: 'The original note cannot leave through Loom’s checked release path.',
    why: 'We declared “glass seed” protected. The real exact-match rule blocks this fictional note; no message is sent.',
    next: 'Follow a declared connection to another journey.',
    input: { text: PROTECTED_TEXT, protectedTerms: [PROTECTED_RULE] }, phase: 'protected_continuity',
    glyphs: ['recurrence', 'protected_continuity'], alert: 'NOTICE', severity: 'RED', pressure: 0.56
  },
  {
    id: 'route-memory', title: 'The route leaves a trace',
    consequence: 'The note reaches the same place by a declared return route.',
    why: 'Two exact “amber path” matches were found under the journey marker we supplied. The loop shows that declared relation, not recovered history or geometric holonomy.',
    next: 'Watch a modeled warning while hidden-state reconstruction remains unearned.',
    input: { text: 'We followed amber path and returned by amber path.', journeyMarkers: [JOURNEY_RULE] },
    phase: 'recurrence', glyphs: ['recurrence', 'protected_continuity'], alert: 'NOTICE', severity: 'GREEN', pressure: 0
  },
  {
    id: 'modeled-pressure', title: 'A warning is not a discovery',
    consequence: 'The practice model asks us to pause and look closer.',
    why: 'This declared teaching model draws a pressure front when a supplied journey marker repeats. It has not measured reconstructability or shown that a provider recovered hidden state.',
    next: 'Keep disagreement and a missing link visible together.',
    input: { text: 'amber path returns; amber path returns; amber path rests.', journeyMarkers: [JOURNEY_RULE] },
    phase: 'recurrence', glyphs: ['recurrence', 'protected_continuity'], alert: 'RECONSTRUCTABILITY_PRESSURE',
    severity: 'YELLOW', pressure: 0.68, modeled: true
  },
  {
    id: 'contradiction-missingness', title: 'Do not fill the gap',
    consequence: 'Two declared rule sets disagree, and a custody link is missing.',
    why: 'The same fictional note is GREEN without the protected-term rule and RED with it. Both results remain in the receipt. A separately declared missing custody link stays a gap, not an inferred connection.',
    next: 'Make a safer copy using the real Loom transformation.',
    input: { text: PROTECTED_TEXT, protectedTerms: [PROTECTED_RULE] }, phase: 'protected_continuity',
    glyphs: ['recurrence', 'protected_continuity'], alert: 'CONTRADICTION', severity: 'HELD', pressure: 0.42,
    missingness: ['Fictional custody link after the garden gate was not supplied.'],
    contradictions: ['Same fictional text: GREEN without the protected-term rule; RED with the declared rule.']
  },
  {
    id: 'recovery', title: 'A narrower promise, kept',
    consequence: 'The protected phrase was removed; the safer copy clears the enabled rules.',
    why: 'Loom’s real safer-copy function removes the fictional protected phrase and the engine checks the transformed note again. This does not guarantee privacy elsewhere.',
    next: 'Rest. Keep the result without keeping it moving.',
    input: { text: PROTECTED_TEXT, protectedTerms: [PROTECTED_RULE] }, phase: 'bounded_emergence',
    glyphs: ['bounded_emergence', 'protected_continuity'], alert: 'RECOVERY', severity: 'GREEN', pressure: 0
  },
  {
    id: 'structural-rest', title: 'The result can rest',
    consequence: 'Nothing needs to keep moving. The meaning stays available.',
    why: 'Rest is an explicit state. The clock stops while the static route, claim boundary, and exact receipt remain inspectable.',
    next: 'Replay, choose another scene, or leave without penalty.',
    input: { text: QUIET_TEXT }, phase: 'structural_rest', glyphs: ['structural_rest'],
    alert: 'REST', severity: 'GREEN', pressure: 0, rest: true
  }
]);

export const LOOM_DEMO_SCENES = freeze(definitions.map((definition, index) => ({
  id: definition.id, index, title: definition.title, child_summary: definition.consequence
})));

const CEILING = freeze([
  ...HOLONOMY_LOOM_CLAIM_CEILING,
  'fictional practice state is not live-source evidence or consequence authority',
  'V (trace observability) ≠ C (custody recoverability) ≠ P (process identifiability) ≠ L (latent-state reconstructibility)',
  'visual pressure is a declared teaching scale, not a measured probability or reconstruction score',
  'a declared route relation is not a transport law or geometric holonomy',
  'no provider hidden-state access, payload recovery, external origin, attribution, or causal-effect claim',
  'the Western Horizon empirical boundary remains closed',
  'no automatic release, deployment, or provider authority'
]);

function definitionAt(index) {
  if (!Number.isInteger(index) || index < 0 || index >= definitions.length) {
    throw new RangeError('A Loom practice scene must use an integer index from 0 to 7.');
  }
  return definitions[index];
}

function checkedRevision(revision) {
  if (typeof revision !== 'string' || !/^(working-tree|[a-f0-9]{40})$/.test(revision)) {
    throw new TypeError('sourceRevision must be working-tree or an exact lowercase 40-character commit SHA.');
  }
  return revision;
}

/** Loading these fictional inputs performs no analysis, receipt creation, or I/O. */
export function getLoomDemoInput(index) {
  const definition = definitionAt(index);
  return freeze({
    text: definition.input.text,
    protectedTerms: (definition.input.protectedTerms ?? []).map(term => ({ ...term })),
    journeyMarkers: (definition.input.journeyMarkers ?? []).map(marker => ({ ...marker }))
  });
}

function canonical(value) {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${canonical(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

// An accidental-change/replay checksum only. Never authentication, signatures,
// collision-resistant evidence, or a credential-derived value.
function replayChecksum(value) {
  let hash = 0x811c9dc5;
  for (const byte of new TextEncoder().encode(canonical(value))) {
    hash = Math.imul(hash ^ byte, 0x01000193) >>> 0;
  }
  return `fnv1a32:${hash.toString(16).padStart(8, '0')}`;
}

/** Call only after a human deliberately traverses the fictional practice case. */
export function compileLoomDemoScene(index, { sourceRevision = 'working-tree' } = {}) {
  const definition = definitionAt(index);
  const revision = checkedRevision(sourceRevision);
  const input = getLoomDemoInput(index);
  const original = analyzeHolonomyLoomMessage(input);
  const safer = definition.id === 'recovery' ? makeHolonomyLoomSaferCopy(input) : null;
  const analysis = safer
    ? analyzeHolonomyLoomMessage({ text: safer.text, journeyMarkers: input.journeyMarkers })
    : original;
  const occurrences = analysis.journey_relations.reduce((sum, item) => sum + item.occurrence_count, 0);
  const basis = [
    'FICTIONAL_PRACTICE_INPUT',
    ...analysis.findings.map(finding => `${finding.evidence_class}:${finding.rule_id}`),
    ...analysis.journey_relations.map(relation => `${relation.evidence_class}:${relation.relation_id}:${relation.occurrence_count}`)
  ];
  if (analysis.findings.length === 0) basis.push('LOCAL_ENGINE:NO_ENABLED_RULE_FIRED');
  if (definition.modeled) basis.push('DECLARED_DEMO_MODEL:REPEATED_DECLARED_MARKER_PRESSURE');
  if (definition.contradictions) basis.push('LOCAL_ENGINE:CONTRAST_OF_TWO_DECLARED_RULE_SETS', 'DECLARED_DEMO_CONTEXT:MISSING_CUSTODY_LINK');
  if (safer) basis.push('LOCAL_ENGINE:SAFER_COPY_AND_RECHECK');
  if (definition.rest) basis.push('EXPLICIT_PRACTICE_STATE:STRUCTURAL_REST');

  const packet = {
    schema: LOOM_SEMANTIC_FIELD_SCHEMA,
    scene: { id: definition.id, index, title: definition.title, consequence: definition.consequence, why: definition.why, next: definition.next },
    source: { revision, kind: 'FICTIONAL_DEMO', ownership: 'TD613 fictional practice case' },
    analysis,
    flow_core: { phase: definition.phase, glyph_relations: [...definition.glyphs] },
    alert: {
      alert_class: definition.alert, severity: definition.severity, basis: [...basis], source_revision: revision,
      observed_vs_modeled: definition.modeled ? 'MODELED_DEMO' : (definition.rest ? 'DECLARED_DEMO_STATE' : 'OBSERVED_LOCAL_RULE_ON_FICTIONAL_INPUT'),
      uncertainty: definition.modeled
        ? 'Teaching model only: reconstructability is unmeasured; the pressure scale has no empirical calibration.'
        : 'Only the enabled local rules and explicitly supplied fictional context were checked; no hidden-state measurement.',
      claim_ceiling: [...CEILING], triggered_glyph_relations: [...definition.glyphs]
    },
    geometry: {
      route: definition.contradictions ? 'fork' : (occurrences > 1 ? 'return' : 'direct'),
      custody: definition.missingness ? 'missing' : (occurrences > 0 ? 'declared' : 'intact'),
      pressure: definition.pressure, missingness: [...(definition.missingness ?? [])],
      contradictions: [...(definition.contradictions ?? [])], rest: definition.rest === true
    },
    distinctions: { V: 'LOCAL_RULE_TRACE_ONLY', C: definition.missingness ? 'MISSING_DECLARED_LINK' : 'DECLARED_PRACTICE_CONTEXT_ONLY', P: 'UNMEASURED', L: 'UNEARNED' },
    claim_ceiling: [...CEILING],
    receipt: {
      schema: 'td613.loom.semantic-field-receipt/v0.1', source_revision: revision, scene_id: definition.id,
      demo: true, manifestly_fictional: true, evidence_authority: false, consequence_authority: false,
      external_retrieval: false, compiler: COMPILER, evidence_basis: [...basis], analysis_receipt: analysis.receipt,
      route_occurrence_count: occurrences,
      pressure_basis: definition.modeled ? 'DECLARED_MODEL_DISPLAY_LEVEL_NOT_MEASUREMENT' : 'DECLARED_RULE_PRESENTATION_LEVEL_NOT_MEASUREMENT',
      missingness_basis: definition.missingness ? 'EXPLICIT_FICTIONAL_CONTEXT_NOT_INFERRED' : 'NO_MISSINGNESS_SUPPLIED_NOT_PROOF_OF_COMPLETENESS',
      geometry_basis: {
        route: definition.contradictions ? 'TWO_DECLARED_RULE_SET_RESULTS_PRESERVED' : (occurrences > 1 ? 'MORE_THAN_ONE_EXACT_DECLARED_MARKER_OCCURRENCE' : 'DEFAULT_DIRECT_PRACTICE_ROUTE'),
        custody: definition.missingness ? 'EXPLICITLY_MISSING_FICTIONAL_LINK' : (occurrences > 0 ? 'USER_DECLARED_MARKER_NOT_PROOF_OF_PROVENANCE' : 'DECLARED_FICTIONAL_CONTINUITY_NOT_RECOVERED_CUSTODY'),
        horizon: 'UNEARNED_L_AND_CLOSED_EMPIRICAL_SHORE_IN_EVERY_SCENE',
        rest: definition.rest ? 'EXPLICIT_STRUCTURAL_REST_SCENE' : 'BOUNDED_TRANSITION_ONLY'
      },
      model: definition.modeled ? {
        id: 'fictional-repeated-marker-pressure/v0.1',
        input: { declared_marker_occurrences: occurrences },
        rule: 'declared_marker_occurrences >= 2',
        rule_fired: occurrences >= 2,
        display_level: definition.pressure,
        empirically_calibrated: false,
        inferred_provider_reconstruction: false
      } : null,
      compared_surfaces: definition.contradictions ? [
        { label: 'without declared protected-term rule', status: analyzeHolonomyLoomMessage({ text: input.text }).status, receipt: analyzeHolonomyLoomMessage({ text: input.text }).receipt },
        { label: 'with declared protected-term rule', status: original.status, receipt: original.receipt }
      ] : [],
      transformation: safer ? {
        operation: 'makeHolonomyLoomSaferCopy', original_status: original.status, original_receipt: original.receipt,
        remaining_status: safer.remaining_status, real_engine_recheck_status: analysis.status,
        raw_text_retained: false, original_text_retained: false
      } : null,
      replay: {
        compiler: COMPILER, scene_index: index, scene_sequence: definitions.map(scene => scene.id),
        sequence_kind: 'DECLARED_PRACTICE_ORDER_NOT_OBSERVED_TRAVERSAL', seed: 613
      },
      checksum_scope: 'Canonical semantic packet excluding checksum; non-cryptographic replay check, not source authentication.'
    }
  };
  if (!packet.flow_core.glyph_relations.every(key => HOLONOMY_LOOM_MOTION_KEYS.includes(key))) {
    throw new Error('Practice compiler requested an unknown canonical Flow-Core relation.');
  }
  packet.receipt.checksum = replayChecksum(packet);
  return freeze(packet);
}

// Reject accessors, custom prototypes, cycles, symbols, holes, non-finite values,
// or authority-bearing extra keys before reading candidate values. This bounded
// v0.1 admission lane is deliberately closed to unknown/model-authored scenes.
function auditPlainData(root) {
  const errors = [];
  const seen = new Set();
  let count = 0;
  function visit(value, path, depth) {
    if (++count > 3000 || depth > 20) throw new TypeError('packet exceeds the bounded data budget');
    if (value === null || typeof value === 'boolean') return;
    if (typeof value === 'string') {
      if (value.length > 4096) throw new TypeError(`${path}: string exceeds data budget`);
      return;
    }
    if (typeof value === 'number' && Number.isFinite(value)) return;
    if (typeof value !== 'object') throw new TypeError(`${path}: only plain JSON data is admitted`);
    if (seen.has(value)) throw new TypeError(`${path}: cycles or aliased objects are not admitted`);
    seen.add(value);
    const array = Array.isArray(value);
    if (Object.getPrototypeOf(value) !== (array ? Array.prototype : Object.prototype)) throw new TypeError(`${path}: custom prototype is not admitted`);
    const descriptors = Object.getOwnPropertyDescriptors(value);
    const keys = Reflect.ownKeys(descriptors);
    if (array && keys.length !== value.length + 1) throw new TypeError(`${path}: array holes or extra fields are not admitted`);
    for (const key of keys) {
      if (array && key === 'length') continue;
      if (typeof key !== 'string' || ['__proto__', 'prototype', 'constructor'].includes(key)) throw new TypeError(`${path}: unsafe key`);
      const descriptor = descriptors[key];
      if (!Object.hasOwn(descriptor, 'value') || !descriptor.enumerable) throw new TypeError(`${path}.${key}: accessors or hidden data are not admitted`);
      if (array && !/^(0|[1-9]\d*)$/.test(key)) throw new TypeError(`${path}: non-index array field`);
      visit(descriptor.value, `${path}.${key}`, depth + 1);
    }
    seen.delete(value);
  }
  try { visit(root, 'packet', 0); } catch (error) { errors.push(String(error.message)); }
  return errors;
}

function compareExact(actual, expected, path, errors) {
  if (errors.length >= 12) return;
  if (actual === expected) return;
  if (!actual || !expected || typeof actual !== 'object' || typeof expected !== 'object' || Array.isArray(actual) !== Array.isArray(expected)) {
    errors.push(`${path}: does not match the deterministic practice compiler`);
    return;
  }
  const actualKeys = Object.keys(actual).sort();
  const expectedKeys = Object.keys(expected).sort();
  if (actualKeys.join('\u0000') !== expectedKeys.join('\u0000')) {
    errors.push(`${path}: unexpected or missing fields`);
    return;
  }
  for (const key of expectedKeys) compareExact(actual[key], expected[key], `${path}.${key}`, errors);
}

/** Admission is fixture-closed, not general-purpose model mediation or authentication. */
export function validateLoomSemanticField(packet) {
  const errors = auditPlainData(packet);
  if (errors.length) return freeze({ valid: false, errors });
  try {
    const expected = compileLoomDemoScene(packet?.scene?.index, { sourceRevision: packet?.source?.revision });
    compareExact(packet, expected, 'packet', errors);
  } catch (error) { errors.push(String(error.message)); }
  return freeze({ valid: errors.length === 0, errors });
}

/** Route-specific envelope; underlying admitted semantic/evidence state is unchanged. */
export function createLoomPortablePacket(packet) {
  const validation = validateLoomSemanticField(packet);
  if (!validation.valid) throw new TypeError(`Loom portable packet held: ${validation.errors.join('; ')}`);
  return freeze({
    schema: LOOM_PORTABLE_PACKET_SCHEMA, realization: 'PORTABLE', provider_neutral: true,
    requires_provider: false, contains_credentials: false, shared_hidden_state_required: false,
    authority: { evidence: false, consequence: false, automatic_release: false, deployment: false },
    semantic_field: JSON.parse(JSON.stringify(packet))
  });
}
