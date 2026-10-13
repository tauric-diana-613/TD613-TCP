import {
  LOOM_SEMANTIC_FIELD_SCHEMA,
  validateLoomSemanticField
} from '../dome-world/holonomy-loom/semantic-field.js';
import {
  HOLONOMY_LOOM_MOTION_DESCRIPTORS
} from '../dome-world/holonomy-loom/flowcore-aia-motion.js';

export const DOLLHOUSE_ATLAS_AGENT_SCHEMA = 'td613.dollhouse.atlas-agent/v0.1';
export const DOLLHOUSE_FADT_AGENT_SCHEMA = 'td613.dollhouse.fadt-agent/v0.1';
export const PORTABLE_FLOWCORE_CONTROL_SCHEMA = 'td613.portable-aia.flowcore-control/v0.1';

function freeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
}

function canonical(value) {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${canonical(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

function requireLoomSemanticField(packet) {
  const validation = validateLoomSemanticField(packet);
  if (!validation.valid) {
    throw new TypeError(`Atlas requires an admitted ${LOOM_SEMANTIC_FIELD_SCHEMA}: ${validation.errors.join('; ')}`);
  }
  return packet;
}

function flowcoreLegend(keys = []) {
  return keys.map(key => {
    const descriptor = HOLONOMY_LOOM_MOTION_DESCRIPTORS[key];
    if (!descriptor) throw new TypeError(`Unknown Flow-Core relation key: ${key}`);
    return freeze({
      key,
      glyph: descriptor.glyph,
      semantic_relation: descriptor.semantic_relation,
      motion_grammar: [...descriptor.motion_grammar],
      static_equivalent: [...descriptor.static_equivalent],
      inspection_grammar: [...descriptor.inspection_grammar],
      authority_ceiling: descriptor.authority_ceiling
    });
  });
}

/**
 * Builds the bounded control grammar that may travel with a Portable-AIA projection.
 * It contains relation semantics and authority ceilings, never raw source text.
 */
export function createPortableFlowcoreControl(packet) {
  const field = requireLoomSemanticField(packet);
  const relationKeys = [...field.flow_core.glyph_relations];
  const legend = flowcoreLegend(relationKeys);
  return freeze({
    schema: PORTABLE_FLOWCORE_CONTROL_SCHEMA,
    source_revision: String(field.source?.revision || 'unknown'),
    scene_id: String(field.scene?.id || 'unknown'),
    flow_core: {
      phase: String(field.flow_core.phase || ''),
      relation_keys: relationKeys,
      glyph_trace: legend.map(item => item.glyph).join(' '),
      legend
    },
    governance: {
      analysis_status: String(field.analysis.status || 'HELD'),
      raw_release_allowed: field.analysis.release_boundary?.raw_release_allowed === true,
      safer_copy_available: field.analysis.release_boundary?.safer_copy_available === true,
      human_closure_required: true,
      remote_host_release_authority: false,
      td613_release_authority_transferred: false
    },
    evidentiary_coordinates: { ...field.distinctions },
    // Preserve the basis of the projected warning and gaps. A revision supplied
    // to the fixture compiler is a reference, never source authentication.
    evidence_context: {
      source_kind: field.source.kind,
      source_ownership: field.source.ownership,
      source_revision_authenticated: false,
      alert: JSON.parse(JSON.stringify(field.alert)),
      model: field.receipt.model === null ? null : JSON.parse(JSON.stringify(field.receipt.model)),
      pressure_basis: field.receipt.pressure_basis,
      missingness_basis: field.receipt.missingness_basis,
      geometry_basis: { ...field.receipt.geometry_basis }
    },
    route_state: {
      route: String(field.geometry?.route || 'unknown'),
      custody: String(field.geometry?.custody || 'unknown'),
      missingness: [...(field.geometry?.missingness || [])],
      contradictions: [...(field.geometry?.contradictions || [])]
    },
    claim_ceiling: [...field.claim_ceiling],
    raw_source_included: false,
    provider_call_required: false,
    candidate_return_trusted_by_arrival: false,
    return_requires_loom_revalidation: true
  });
}

function atlasProjection(packet, control, receiver) {
  if (receiver === 'child') {
    return freeze({
      receiver,
      control,
      presentation: {
        consequence: String(packet.scene?.consequence || ''),
        next: String(packet.scene?.next || ''),
        flow_core_trace: control.flow_core.glyph_trace,
        relation_labels: control.flow_core.legend.map(item => item.key),
        claim_ceiling_summary: 'The horizon stays closed; the receiving host gets no release authority.'
      }
    });
  }
  if (receiver === 'auditor') {
    return freeze({
      receiver,
      control,
      presentation: {
        semantic_field_schema: packet.schema,
        source_revision: control.source_revision,
        scene_id: control.scene_id,
        analysis_status: control.governance.analysis_status,
        evidentiary_coordinates: { ...control.evidentiary_coordinates },
        route_state: { ...control.route_state },
        flow_core_legend: control.flow_core.legend,
        claim_ceiling: [...control.claim_ceiling]
      }
    });
  }
  throw new TypeError(`Unsupported Atlas receiver: ${receiver}`);
}

/**
 * Atlas audits one admitted relation under intentionally non-equivalent receiver projections.
 * Equality is required only on the machine control plane, never on presentation bytes.
 */
export function runAtlasAgent(packet, { receivers = ['child', 'auditor'] } = {}) {
  const field = requireLoomSemanticField(packet);
  const declared = [...new Set(receivers.map(value => String(value).toLowerCase()))];
  if (declared.length < 2) throw new TypeError('Atlas requires at least two declared receiver projections.');
  const control = createPortableFlowcoreControl(field);
  const projections = declared.map(receiver => atlasProjection(field, control, receiver));
  const controlKeys = projections.map(item => canonical(item.control));
  const presentationKeys = projections.map(item => canonical(item.presentation));
  const controlPlaneEqual = controlKeys.every(value => value === controlKeys[0]);
  const presentationsDistinct = new Set(presentationKeys).size === presentationKeys.length;

  return freeze({
    schema: DOLLHOUSE_ATLAS_AGENT_SCHEMA,
    agent: 'ATLAS',
    source_schema: field.schema,
    projections,
    audit: {
      control_plane_equal: controlPlaneEqual,
      presentations_intentionally_non_equivalent: presentationsDistinct,
      verdict: controlPlaneEqual && presentationsDistinct ? 'PASS' : 'HOLD'
    },
    portable_return_contract: {
      required_control_schema: PORTABLE_FLOWCORE_CONTROL_SCHEMA,
      preserve: ['source_revision', 'scene_id', 'flow_core', 'governance', 'evidentiary_coordinates', 'evidence_context', 'route_state', 'claim_ceiling'],
      candidate_trusted: false,
      return_requires_loom_revalidation: true,
      raw_model_prose_is_not_a_control_receipt: true
    },
    claim_ceiling: [
      'receiver-projection audit is not basis-free geometry or physical tomography',
      'shared control plane is not equal presentation or equal host authority',
      'Flow-Core glyph trace is not sufficient without its versioned relation legend and governance state',
      'remote return remains untrusted until Loom revalidation',
      'no merge deployment release provider or Vercel authority'
    ]
  });
}

function requireFadtArray(value, label) {
  if (!Array.isArray(value)) throw new TypeError(`${label} must be an array.`);
  for (let index = 0; index < value.length; index += 1) {
    if (!Object.hasOwn(value, index)) throw new TypeError(`${label} must not contain missing entries.`);
  }
  return value;
}

function requireFadtString(value, label) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new TypeError(`${label} must be a nonempty string.`);
  }
  return value;
}

function normalizeSupport(support, label) {
  const values = requireFadtArray(support, `${label} support`);
  values.forEach((value, index) => requireFadtString(value, `${label} support[${index}]`));
  return [...new Set(values)].sort();
}

function intersect(left, right) {
  const keep = new Set(right);
  return left.filter(value => keep.has(value));
}

/** Exact finite FADT audit over occupied quotient fibres. */
export function runFadtAgent(input = {}) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new TypeError('FADT input must be an object containing fibres.');
  }
  const { fibres } = input;
  if (!Array.isArray(fibres) || fibres.length === 0) {
    throw new TypeError('FADT requires at least one occupied finite quotient fibre.');
  }
  requireFadtArray(fibres, 'FADT fibres');
  const fibreIds = new Set();

  const results = fibres.map((fibre, fibreIndex) => {
    if (!fibre || typeof fibre !== 'object' || Array.isArray(fibre) || !Array.isArray(fibre.antecedents) || fibre.antecedents.length === 0) {
      throw new TypeError(`FADT fibre ${fibreIndex} must contain at least one antecedent.`);
    }
    const fibreId = requireFadtString(fibre.id === undefined ? `fibre-${fibreIndex}` : fibre.id, `FADT fibre ${fibreIndex} id`);
    if (fibreIds.has(fibreId)) throw new TypeError(`Duplicate FADT fibre id: ${fibreId}`);
    fibreIds.add(fibreId);
    requireFadtArray(fibre.antecedents, `FADT fibre ${fibreIndex} antecedents`);
    const antecedentIds = new Set();
    const antecedents = fibre.antecedents.map((antecedent, antecedentIndex) => {
      const label = `FADT fibre ${fibreIndex} antecedent ${antecedentIndex}`;
      if (!antecedent || typeof antecedent !== 'object' || Array.isArray(antecedent)) {
        throw new TypeError(`${label} must be an object containing support.`);
      }
      const id = requireFadtString(antecedent.id === undefined ? `antecedent-${antecedentIndex}` : antecedent.id, `${label} id`);
      if (antecedentIds.has(id)) throw new TypeError(`Duplicate FADT antecedent id in fibre ${fibreId}: ${id}`);
      antecedentIds.add(id);
      return { id, support: normalizeSupport(antecedent.support, label) };
    });
    const union = [...new Set(antecedents.flatMap(item => item.support))].sort();
    const intersection = antecedents.slice(1).reduce((current, item) => intersect(current, item.support), [...antecedents[0].support]);
    const intersectionSet = new Set(intersection);
    const gap = union.filter(value => !intersectionSet.has(value));
    const supportKeys = antecedents.map(item => canonical(item.support));
    const constantOnFibre = supportKeys.every(value => value === supportKeys[0]);
    const exactDescent = gap.length === 0 && constantOnFibre;

    return freeze({
      fibre_id: fibreId,
      antecedents,
      union,
      intersection,
      irreducible_gap: gap,
      gap_size: gap.length,
      support_constant_on_fibre: constantOnFibre,
      exact_descended_admissibility: exactDescent,
      largest_universally_sound_rule: intersection,
      smallest_universally_complete_rule: union,
      verdict: exactDescent ? 'AUTHORIZED' : 'HOLD'
    });
  });

  return freeze({
    schema: DOLLHOUSE_FADT_AGENT_SCHEMA,
    agent: 'FADT',
    occupied_fibre_count: results.length,
    all_fibres_exact: results.every(item => item.exact_descended_admissibility),
    fibres: results,
    theorem_surface: 'finite exact admissibility descends iff lawful support is constant on every occupied quotient fibre; union/intersection preserve the complete/sound extremals and their difference remains visible',
    claim_ceiling: [
      'finite support audit only',
      'no unoccupied quotient state receives invented support authority',
      'gap minimization does not identify a uniquely correct surviving rule',
      'finite FADT adapter is not a universal AI information-loss theorem',
      'no source-state reconstruction merge deployment release provider or Vercel authority'
    ]
  });
}

/**
 * Converts the Loom contradiction fixture into one finite FADT fibre.
 * This is a bounded demonstration bridge, not a claim that status labels exhaust admissibility in general.
 */
export function loomComparedSurfacesToFadt(packet) {
  const field = requireLoomSemanticField(packet);
  const surfaces = field.receipt?.compared_surfaces || [];
  if (!Array.isArray(surfaces) || surfaces.length < 2) {
    throw new TypeError('Loom-to-FADT bridge requires at least two compared surfaces in the semantic-field receipt.');
  }
  return freeze({
    fibres: [{
      id: `loom:${String(field.scene?.id || 'unknown')}:visible-note`,
      antecedents: surfaces.map((surface, index) => ({
        id: String(surface.label || `surface-${index}`),
        support: [String(surface.status || 'HELD')]
      }))
    }]
  });
}
