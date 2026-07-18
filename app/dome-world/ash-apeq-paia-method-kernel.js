export const ASH_APEQ_PAIA_METHOD_VERSION = 'td613.ash.apeq-paia-method/v0.1';

export const APEQ_CONTROL_CLASSES = Object.freeze([
  'POSITIVE',
  'MATCHED_BENIGN',
  'NULL',
  'MISSING',
  'CONTRADICTORY',
  'SHUFFLED',
  'TRUNCATED',
  'ROUTE_ORDER',
  'DELAYED_DISCLOSURE',
  'CROSS_SESSION',
  'SOURCE_DRIFT',
  'METADATA_ONLY'
]);

export const PAIA_STRATA = Object.freeze([
  'content',
  'projection',
  'cryptographic',
  'endpoint',
  'provider',
  'reader',
  'metadata',
  'temporal',
  'custody',
  'human'
]);

export const APEQ_HELD_DIMENSIONS = Object.freeze([
  'rare_fact_conjunctions',
  'chronology',
  'source_identity',
  'hypotheses',
  'lifecycle_state',
  'metadata_linkage',
  'document_provenance',
  'unknown_reader'
]);

export const APEQ_PAIA_COUNTS = Object.freeze({
  rooms: 14,
  nodes: 72,
  relationships: 112,
  rules: 8,
  routes: 6,
  controls: 12,
  held_outs: 8,
  strata: 10,
  joining_keys: 8
});

export const slug = value => String(value || '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '_')
  .replace(/^_|_$/g, '');

export const syntheticDigest = seed => {
  const source = String(seed || '0');
  return `sha256:${source.repeat(Math.ceil(64 / source.length)).slice(0, 64)}`;
};

export const nodeReference = (roomId, topic) => `node_${slug(roomId)}_${slug(topic)}`;

function inferNodeType(room, topic) {
  const value = topic.toLowerCase();
  if (room.id === 'next') return 'intended-action';
  if (/missing|gap|unresolved|unobserved|unknown|unsigned|incomplete|unrun|unconfirmed|uncertainty|unavailable/.test(value)) return 'evidence-gap';
  if (/hypothesis|scenario|alternative|explanation|counterfactual|may |could |might /.test(value) || room.role === 'alternatives') return 'hypothesis';
  if (/claim|limit|goal|estimate|outcome|reversal|finding|generalization|truth|ceiling|distance|probability|authorization/.test(value) || room.role === 'claims') return 'claim';
  if (/candidate|manager|host|committee|partner|vendor|reviewer|custodian|source|lead|cohort|processor|recipient|counsel|annotator|volunteer/.test(value)) return 'entity';
  if (/meeting|review|checkpoint|window|rally|arrival|announcement|approval|request|interview|award|launch/.test(value)) return 'event';
  if (/provenance|registry|source bundle|origin record|custody root/.test(value)) return 'source';
  return 'artifact';
}

function inferSourceStatus(type, topic) {
  const value = topic.toLowerCase();
  if (type === 'evidence-gap') return 'UNRESOLVED';
  if (type === 'hypothesis') return 'INFERRED';
  if (type === 'claim') return 'DERIVED';
  if (/receipt|observed|window|request|checkpoint/.test(value)) return 'OBSERVED';
  return 'SUPPLIED';
}

function buildNodes(spec) {
  const nodes = [];
  let chronologyIndex = 0;
  for (const room of spec.rooms) {
    for (const topic of room.topics) {
      const label = typeof topic === 'string' ? topic : topic.label;
      const type = typeof topic === 'string' ? inferNodeType(room, label) : (topic.type || inferNodeType(room, label));
      const sourceStatus = typeof topic === 'string' ? inferSourceStatus(type, label) : (topic.source_status || inferSourceStatus(type, label));
      const gapLike = type === 'evidence-gap' || type === 'hypothesis' || type === 'intended-action';
      nodes.push({
        id: nodeReference(room.id, label),
        type,
        label,
        room_id: `room_${slug(room.id)}`,
        source_status: sourceStatus,
        sensitivity: typeof topic === 'string' ? (room.sensitivity || 'PRIVATE') : (topic.sensitivity || room.sensitivity || 'PRIVATE'),
        confidence_posture: typeof topic === 'string' ? (gapLike ? 'OPEN' : 'HELD') : (topic.confidence_posture || (gapLike ? 'OPEN' : 'HELD')),
        disclosure_state: room.role === 'routes' ? 'DISCLOSED' : 'LOCAL',
        chronology_index: chronologyIndex++
      });
    }
  }
  for (const special of spec.special_nodes) {
    nodes.push({
      id: special.id,
      type: special.type,
      label: special.label,
      room_id: `room_${slug(special.room_id)}`,
      source_status: special.source_status,
      sensitivity: special.sensitivity || 'RESTRICTED',
      confidence_posture: special.confidence_posture || 'HELD',
      disclosure_state: special.disclosure_state || 'LOCAL',
      chronology_index: chronologyIndex++
    });
  }
  return nodes;
}

function buildRelationships(spec, nodes) {
  const relationships = [];
  for (const room of spec.rooms) {
    const ids = nodes.filter(node => node.room_id === `room_${slug(room.id)}`).map(node => node.id);
    for (let index = 0; index < ids.length - 1; index += 1) {
      relationships.push({
        id: `edge_${slug(room.id)}_local_${index + 1}`,
        from: ids[index],
        to: ids[index + 1],
        type: 'informs-next-local-stage',
        source_status: 'CONSTRUCTED'
      });
    }
  }
  const ordered = nodes.map(node => node.id);
  for (let index = 0; index < 54; index += 1) {
    const from = ordered[(index * 7) % ordered.length];
    const candidate = ordered[(index * 11 + 17) % ordered.length];
    const to = from === candidate ? ordered[(index * 11 + 18) % ordered.length] : candidate;
    relationships.push({
      id: `edge_cross_${String(index + 1).padStart(2, '0')}`,
      from,
      to,
      type: ['governs', 'qualifies', 'tests', 'constrains', 'supports-alternative', 'requires-retest'][index % 6],
      source_status: 'CONSTRUCTED'
    });
  }
  return relationships;
}

function resolveReferences(references) {
  return references.map(reference => {
    if (typeof reference === 'string') return reference;
    return nodeReference(reference[0], reference[1]);
  });
}

function buildRulesAndRoutes(spec) {
  const routeDefinitions = spec.routes;
  const ruleDefinitions = [...routeDefinitions, ...spec.internal_rules];
  const rules = ruleDefinitions.map((definition, index) => ({
    route_id: `route_${definition.id}`,
    allowed_room_ids: definition.rooms.map(room => `room_${slug(room)}`),
    local_link_keys: [
      `edge_cross_${String(index + 1).padStart(2, '0')}`,
      `edge_cross_${String(index + 21).padStart(2, '0')}`
    ],
    allowed_node_types: definition.allowed_node_types || ['artifact', 'claim', 'hypothesis', 'evidence-gap']
  }));
  const entries = routeDefinitions.map((definition, index) => ({
    entry_id: `routeentry_${slug(spec.profile)}_${slug(definition.id)}_01`,
    draft_digest: syntheticDigest(definition.digest_seed || String(index + 1)),
    route_id: `route_${definition.id}`,
    purpose: definition.purpose,
    recipient_class: definition.recipient,
    recorded_at: `2026-07-18T0${index + 1}:10:00Z`,
    disclosed_opaque_references: resolveReferences(definition.refs),
    recall_state: 'NOT_RECALLED'
  }));
  return { rules, entries };
}

function buildAssay(spec, nodes) {
  const heldDimensions = spec.held_dimensions || APEQ_HELD_DIMENSIONS;
  return {
    schema: 'td613.ash.apeq-paia-assay/v0.1',
    source_status: 'CONSTRUCTED',
    promotion_authorized: false,
    maximum_assurance: 'PA2_LOCALLY_EXECUTED',
    controls: APEQ_CONTROL_CLASSES.map((kind, index) => ({
      control_id: `control_${slug(spec.profile)}_${slug(kind)}`,
      class: kind,
      purpose: `${spec.label}: ${spec.control_focus[index] || `declared ${kind.toLowerCase().replaceAll('_', ' ')} reconstruction control`}.`
    })),
    held_outs: heldDimensions.map((dimension, index) => ({
      heldout_id: `heldout_${slug(spec.profile)}_${slug(dimension)}`,
      protected_dimension: dimension,
      reference: nodes[(index * 9 + 3) % nodes.length].id
    })),
    strata: [...PAIA_STRATA],
    environment_profile: spec.environment_profile,
    reader_classes: spec.reader_classes,
    joining_keys: spec.joining_keys,
    unknown_readers: 'UNMEASURED',
    universal_secrecy: false,
    claim_ceiling: spec.claim_ceiling,
    automatic_release: false,
    human_review_required: true
  };
}

export function validateApeqPaiaFixture(fixture) {
  const counts = fixture.counts;
  for (const [key, expected] of Object.entries(APEQ_PAIA_COUNTS)) {
    if (counts[key] !== expected) throw new Error(`${fixture.profile.id} ${key} count drifted: ${counts[key]} !== ${expected}.`);
  }
  const roomIds = new Set(fixture.rooms.map(room => room.id));
  const nodeIds = new Set(fixture.nodes.map(node => node.id));
  const edgeIds = new Set(fixture.relationships.map(edge => edge.id));
  if (roomIds.size !== fixture.rooms.length) throw new Error(`${fixture.profile.id} Room IDs are not unique.`);
  if (nodeIds.size !== fixture.nodes.length) throw new Error(`${fixture.profile.id} object IDs are not unique.`);
  if (edgeIds.size !== fixture.relationships.length) throw new Error(`${fixture.profile.id} relation IDs are not unique.`);
  for (const node of fixture.nodes) if (!roomIds.has(node.room_id)) throw new Error(`${fixture.profile.id} object ${node.id} references an unknown Room.`);
  for (const edge of fixture.relationships) {
    if (!nodeIds.has(edge.from)) throw new Error(`${fixture.profile.id} relation ${edge.id} has an unknown source.`);
    if (!nodeIds.has(edge.to)) throw new Error(`${fixture.profile.id} relation ${edge.id} has an unknown target.`);
  }
  for (const rule of fixture.rules) {
    for (const roomId of rule.allowed_room_ids) if (!roomIds.has(roomId)) throw new Error(`${fixture.profile.id} rule ${rule.route_id} has an unknown Room.`);
    for (const edgeId of rule.local_link_keys) if (!edgeIds.has(edgeId)) throw new Error(`${fixture.profile.id} rule ${rule.route_id} has an unknown local link.`);
  }
  for (const route of fixture.routes.entries) {
    if (!/^sha256:[0-9a-f]{64}$/.test(route.draft_digest)) throw new Error(`${fixture.profile.id} route ${route.entry_id} has an invalid digest.`);
    for (const reference of route.disclosed_opaque_references) if (!nodeIds.has(reference)) throw new Error(`${fixture.profile.id} route ${route.entry_id} has an unknown reference.`);
  }
  for (const reference of [
    ...fixture.defaults.test_refs,
    ...fixture.defaults.route.refs,
    ...fixture.defaults.draft.refs
  ]) if (!nodeIds.has(reference)) throw new Error(`${fixture.profile.id} default references unknown object ${reference}.`);
  return fixture;
}

export function buildApeqPaiaFixture(spec) {
  if (spec.rooms.length !== 14) throw new Error(`${spec.profile} must declare exactly 14 Rooms.`);
  for (const room of spec.rooms) if (room.topics.length !== 5) throw new Error(`${spec.profile} Room ${room.id} must declare exactly five primary objects.`);
  if (spec.special_nodes.length !== 2) throw new Error(`${spec.profile} must declare exactly two held method objects.`);
  if (spec.routes.length !== 6 || spec.internal_rules.length !== 2) throw new Error(`${spec.profile} must declare six routes and two internal route laws.`);
  if (spec.control_focus.length !== 12) throw new Error(`${spec.profile} must declare twelve control purposes.`);
  if (spec.joining_keys.length !== 8) throw new Error(`${spec.profile} must declare eight joining keys.`);

  const rooms = spec.rooms.map(room => ({
    id: `room_${slug(room.id)}`,
    label: room.label,
    color: room.color,
    notes: room.notes || `Synthetic ${room.label} chamber.`
  }));
  const nodes = buildNodes(spec);
  const relationships = buildRelationships(spec, nodes);
  const { rules, entries } = buildRulesAndRoutes(spec);
  const assay = buildAssay(spec, nodes);
  const defaults = {
    ...spec.defaults,
    test_refs: resolveReferences(spec.defaults.test_refs),
    route: { ...spec.defaults.route, refs: resolveReferences(spec.defaults.route.refs) },
    draft: { ...spec.defaults.draft, refs: resolveReferences(spec.defaults.draft.refs) }
  };
  const fixture = {
    schema: 'td613.ash.apeq-paia-profile-demo/v0.1',
    method_version: ASH_APEQ_PAIA_METHOD_VERSION,
    profile: {
      id: spec.profile,
      label: spec.label,
      demo_id: spec.demo_id,
      title: spec.title,
      summary: spec.summary,
      observations: [{
        kind: 'SYNTHETIC_QUALIFICATION_GRADE_DEMO',
        real_people: false,
        real_organizations: false,
        real_documents: false,
        real_events: false,
        real_provider_execution: false,
        empirical_reader_execution: false,
        causation_established: false,
        attribution_established: false,
        identity_established: false,
        prediction_authorized: false,
        automatic_action_authorized: false
      }],
      missingness: spec.missingness,
      alternatives: spec.alternatives,
      open_questions: spec.open_questions,
      chronology: spec.chronology,
      actions: spec.actions
    },
    rooms,
    nodes,
    relationships,
    rules,
    routes: {
      entries,
      operator_declared_assumptions: spec.route_assumptions,
      unknown: spec.route_unknowns
    },
    assay,
    defaults,
    counts: {
      rooms: rooms.length,
      nodes: nodes.length,
      relationships: relationships.length,
      rules: rules.length,
      routes: entries.length,
      controls: assay.controls.length,
      held_outs: assay.held_outs.length,
      strata: assay.strata.length,
      joining_keys: assay.joining_keys.length
    }
  };
  return Object.freeze(validateApeqPaiaFixture(fixture));
}
