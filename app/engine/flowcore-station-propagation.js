import {
  compilePedagogicalScene,
  compilePedagogicalTransition,
  compileRestState,
  compileTransferEncounter,
  compilePedagogueReceipt,
  verifyPedagogueReceipt
} from './flowcore-pedagogue-core.js';
import {
  AIA_ROUTE_IDS,
  compileAIAView,
  verifyAIAInvariants
} from './flowcore-pedagogue-aia.js';
import {
  renderPedagogueScene,
  renderPedagogueStaticFrame,
  compileVisualReceipt
} from '../dome-world/flowcore-pedagogue-visual.js';
import { canonicalDigest, canonicalJson } from '../dome-world/ash/canonical-json.js';

export const STATION_PROPAGATION_SCENE_SCHEMA = 'td613.flowcore.station-propagation-scene/v0.1';
export const STATION_PROPAGATION_BUNDLE_SCHEMA = 'td613.flowcore.station-propagation-bundle/v0.1';
export const STATION_PROPAGATION_RECEIPT_SCHEMA = 'td613.flowcore.station-propagation-receipt/v0.1';

export const PRIMARY_PROPAGATION_STATIONS = Object.freeze(['Hush', 'Aperture', 'Safe Harbor', 'Phason']);
export const PROPAGATION_SIDECARS = Object.freeze(['EO-RFD', 'ACEDIT', 'KIRA']);
export const STATION_RESPONSIBILITY_ROLES = Object.freeze(['observed', 'contextualized', 'reconstructed', 'rendered', 'decided']);

const RAW_KEYS = new Set([
  'body', 'text', 'content', 'raw', 'rawText', 'raw_text', 'bytes', 'buffer',
  'sourceText', 'source_bytes', 'raw_bytes', 'raw_artifact_content'
]);

const STATION_REQUIREMENTS = Object.freeze({
  Hush: Object.freeze([
    'speech_act_retained', 'anchors_retained', 'register_changed', 'source_residue_visible',
    'forbidden_compliance_posture_visible', 'release_holds_visible'
  ]),
  Aperture: Object.freeze([
    'held_source_visible', 'projection_or_registry_change_visible', 'observed_differences_visible',
    'candidate_models_visible', 'residuals_visible', 'abstention_visible'
  ]),
  'Safe Harbor': Object.freeze([
    'arrival_visible', 'shelter_visible', 'local_reference_visible', 'transport_performed_false',
    'return_route_visible', 'structural_rest_visible'
  ]),
  Phason: Object.freeze([
    'content_anchor_stationary', 'hidden_coordinate_visible', 'acceptance_window_visible',
    'projection_change_visible', 'content_mutation_false', 'publication_authority_false'
  ])
});

const DEFAULT_RESPONSIBILITY = Object.freeze({
  Hush: Object.freeze(['contextualized']),
  Aperture: Object.freeze(['observed', 'reconstructed']),
  'Safe Harbor': Object.freeze(['observed', 'contextualized']),
  Phason: Object.freeze(['decided']),
  'EO-RFD': Object.freeze(['observed']),
  ACEDIT: Object.freeze(['rendered']),
  KIRA: Object.freeze(['observed'])
});

function clone(value) {
  return value === null || typeof value !== 'object'
    ? value
    : Array.isArray(value)
      ? value.map(clone)
      : Object.fromEntries(Object.entries(value).map(([key, child]) => [key, clone(child)]));
}

function freeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.values(value).forEach(freeze);
  return Object.freeze(value);
}

function rejectRawContent(value, path = '$') {
  if (!value || typeof value !== 'object') return;
  if (Array.isArray(value)) return value.forEach((item, index) => rejectRawContent(item, `${path}[${index}]`));
  for (const [key, child] of Object.entries(value)) {
    if (RAW_KEYS.has(key) && child != null && child !== '') throw new Error(`${path}.${key} cannot cross the station propagation membrane.`);
    rejectRawContent(child, `${path}.${key}`);
  }
}

function strings(value = [], label = 'value') {
  if (!Array.isArray(value) || value.some(item => typeof item !== 'string')) throw new TypeError(`${label} must be an array of strings.`);
  return [...new Set(value)].sort();
}

function runtimeOptions(fixture, options = {}) {
  return {
    ...fixture.determinism,
    ...options,
    cryptoImpl: options.cryptoImpl || globalThis.crypto,
    TextEncoderImpl: options.TextEncoderImpl || globalThis.TextEncoder
  };
}

function validateStationFixture(fixture) {
  if (!fixture || fixture.fixture_schema !== 'td613.flowcore.station-propagation-fixture/v0.1') throw new Error('A canonical station propagation fixture is required.');
  if (!PRIMARY_PROPAGATION_STATIONS.includes(fixture.origin_station)) throw new Error('Unknown primary propagation station.');
  if (fixture.scene_input?.station_owner !== 'Dome-World') throw new Error('Dome-World must remain the scene host.');
  if (!Array.isArray(fixture.responsibility_roles) || !fixture.responsibility_roles.length) throw new Error('Station responsibility roles are required.');
  if (fixture.responsibility_roles.some(role => !STATION_RESPONSIBILITY_ROLES.includes(role))) throw new Error('Unknown station responsibility role.');
  if (fixture.scene_input?.available_affordances?.some(item => item.authorized_by_station !== fixture.origin_station)) throw new Error('Operational action must remain owned by the origin station.');
  rejectRawContent(fixture);
}

function compileSidecar(sidecar, sceneReference) {
  if (!sidecar || !PROPAGATION_SIDECARS.includes(sidecar.station)) throw new Error('Unknown propagation sidecar.');
  const roles = strings(sidecar.responsibility_roles || DEFAULT_RESPONSIBILITY[sidecar.station], 'sidecar.responsibility_roles');
  if (roles.some(role => !STATION_RESPONSIBILITY_ROLES.includes(role))) throw new Error('Unknown sidecar responsibility role.');
  const output = {
    schema: 'td613.flowcore.station-sidecar-observation/v0.1',
    station: sidecar.station,
    scene_reference: sceneReference,
    responsibility_roles: roles,
    observation_reference: String(sidecar.observation_reference || `${sidecar.station}:declared-observation`),
    observation_summary: String(sidecar.observation_summary || 'Declared bounded sidecar observation.'),
    missingness: strings(sidecar.missingness || [], 'sidecar.missingness'),
    claim_ceiling: strings(sidecar.claim_ceiling || ['sidecar observation does not establish station authority'], 'sidecar.claim_ceiling'),
    can_advance_cycle: false,
    can_mutate_station: false,
    can_authorize_ash_action: false,
    can_authorize_release: false,
    raw_content_included: false,
    receipt_may_cross: true,
    authority_may_cross: false,
    closure: { status: 'OPEN', closed_by: null }
  };
  rejectRawContent(output);
  canonicalJson(output);
  return freeze(output);
}

async function compileCycle(fixture, options) {
  const opts = runtimeOptions(fixture, options);
  const scene = await compilePedagogicalScene(fixture.scene_input, opts);
  const notice = await compilePedagogicalTransition(scene, null, null, {
    ...opts,
    phase: 'NOTICE',
    staticEquivalent: {
      summary: scene.visible_condition.plain_language,
      steps: ['origin station', 'visible condition', 'source boundary', 'claim ceiling']
    }
  });
  const act = await compilePedagogicalTransition(scene, fixture.action, null, {
    ...opts,
    phase: 'ACT',
    priorTransitions: [notice],
    staticEquivalent: {
      summary: `The declared action remains owned by ${fixture.origin_station}.`,
      steps: ['purpose', 'origin-station authority', 'reversibility', 'rest', 'exit']
    }
  });
  const answer = await compilePedagogicalTransition(scene, fixture.action, fixture.world_delta, {
    ...opts,
    phase: 'WORLD_ANSWERS',
    priorTransitions: [notice, act]
  });
  const name = await compilePedagogicalTransition(scene, null, null, {
    ...opts,
    phase: 'NAME',
    priorTransitions: [notice, act, answer],
    name: fixture.name,
    staticEquivalent: {
      summary: fixture.name.plain_language,
      steps: ['plain consequence', 'station responsibility', 'technical term', 'non-equivalence']
    }
  });
  const rest = await compilePedagogicalTransition(scene, null, null, {
    ...opts,
    phase: 'REST',
    priorTransitions: [notice, act, answer, name],
    staticEquivalent: {
      summary: 'New demand stops while the station result, provenance, return, replay, and exit remain visible.',
      steps: ['stop prompts', 'retain station result', 'retain provenance', 'return', 'replay', 'exit']
    }
  });
  const restState = await compileRestState(scene, rest, opts);
  const transfer = await compileTransferEncounter(name, fixture.transfer_context, opts);
  const receipt = await compilePedagogueReceipt(scene, [notice, act, answer, name, rest], {
    ...opts,
    transferEncounters: [transfer]
  });
  const verification = await verifyPedagogueReceipt(receipt, opts);
  if (!verification.valid) throw new Error('Station pedagogue receipt verification failed.');
  return { opts, scene, notice, act, answer, name, rest, restState, transfer, receipt, verification };
}

function stationEvidence(fixture, cycle) {
  const evidence = clone(fixture.station_evidence || {});
  const required = STATION_REQUIREMENTS[fixture.origin_station];
  for (const key of required) {
    if (!(key in evidence)) throw new Error(`${fixture.origin_station} evidence is missing ${key}.`);
  }
  return {
    origin_station: fixture.origin_station,
    responsibility_roles: strings(fixture.responsibility_roles, 'responsibility_roles'),
    required_fields: clone(required),
    evidence,
    operational_action_reference: cycle.answer.selected_action?.action_id || null,
    operational_action_authority: cycle.answer.selected_action?.authorized_by_station || null,
    dome_world_hosts_scene: true,
    flowcore_contextualizes_only: true
  };
}

export async function compileStationPropagationScene(fixture, options = {}) {
  validateStationFixture(fixture);
  const cycle = await compileCycle(fixture, options);
  const evidence = stationEvidence(fixture, cycle);
  const views = [];
  for (const route of AIA_ROUTE_IDS) views.push(await compileAIAView(cycle.scene, cycle.answer, route, cycle.opts));
  const invariantReport = verifyAIAInvariants(cycle.scene, views);
  const desktopFrames = {};
  const reducedFrames = {};
  const visualReceipts = {};
  for (const route of AIA_ROUTE_IDS) {
    const viewId = `station-propagation:${fixture.origin_station}:${fixture.fixture_id}:${route}`;
    desktopFrames[route] = renderPedagogueScene(
      viewId,
      cycle.scene,
      cycle.answer,
      options.desktopViewport || { width: 1120, height: 760, devicePixelRatio: 1 },
      options.time || 0,
      { activeViewId: viewId, reducedMotion: false }
    );
    reducedFrames[route] = renderPedagogueStaticFrame(
      viewId,
      cycle.scene,
      cycle.answer,
      options.mobileViewport || { width: 390, height: 844, devicePixelRatio: 1 },
      { activeViewId: viewId }
    );
    visualReceipts[route] = await compileVisualReceipt(cycle.scene, cycle.answer, desktopFrames[route], {
      ...cycle.opts,
      idSeed: `${cycle.opts.idSeed}:${route}`,
      worldRevision: `${fixture.origin_station}:${fixture.fixture_id}`,
      inputDigest: cycle.receipt.receipt_digest
    });
  }
  const sidecars = (fixture.sidecars || []).map(item => compileSidecar(item, cycle.scene.scene_id));
  const subject = {
    fixture_id: fixture.fixture_id,
    origin_station: fixture.origin_station,
    responsibility_roles: evidence.responsibility_roles,
    scene_reference: cycle.scene.scene_id,
    receipt_digest: cycle.receipt.receipt_digest,
    sidecars: sidecars.map(item => ({ station: item.station, observation_reference: item.observation_reference }))
  };
  const digest = await canonicalDigest('TD613:FLOWCORE:STATION-PROPAGATION-SCENE:v1', subject, cycle.opts);
  const output = {
    schema: STATION_PROPAGATION_SCENE_SCHEMA,
    package_id: `station_scene_${digest.slice(-24)}`,
    package_digest: digest,
    fixture_id: fixture.fixture_id,
    origin_station: fixture.origin_station,
    station_responsibility: evidence,
    scene: cycle.scene,
    phase_sequence: [cycle.notice, cycle.act, cycle.answer, cycle.name, cycle.rest],
    rest_state: cycle.restState,
    transfer_encounter: cycle.transfer,
    pedagogue_receipt: cycle.receipt,
    receipt_verification: cycle.verification,
    aia_views: Object.fromEntries(views.map(view => [view.route, view])),
    aia_invariant_report: invariantReport,
    desktop_frames: desktopFrames,
    reduced_mobile_frames: reducedFrames,
    visual_receipts: visualReceipts,
    sidecars,
    propagation: {
      receipt_may_cross: true,
      observation_may_cross: true,
      raw_content_may_cross: false,
      authority_may_cross: false,
      automatic_phase_advance: false,
      automatic_station_mutation: false,
      automatic_ash_action: false,
      automatic_release: false
    },
    authority: {
      scene_host: 'Dome-World',
      origin_station: fixture.origin_station,
      operational_action_authority: fixture.origin_station,
      flowcore_commands_station: false,
      station_authority_transferred: false,
      human_closure_required: true
    },
    closure: { status: 'OPEN', closed_by: null }
  };
  verifyStationPropagationScene(output);
  return freeze(output);
}

export function verifyStationPropagationScene(packageView) {
  if (!packageView || packageView.schema !== STATION_PROPAGATION_SCENE_SCHEMA) throw new Error('Malformed station propagation scene package.');
  if (!PRIMARY_PROPAGATION_STATIONS.includes(packageView.origin_station)) throw new Error('Unknown origin station.');
  if (packageView.receipt_verification?.valid !== true || packageView.aia_invariant_report?.all_invariants_preserved !== true) throw new Error('Station scene receipt or AIA invariant failed.');
  if (Object.keys(packageView.aia_views || {}).length !== AIA_ROUTE_IDS.length) throw new Error('Station scene lacks four AIA routes.');
  if (Object.values(packageView.reduced_mobile_frames || {}).some(frame => frame.reduced_motion !== true || frame.viewport?.layout !== 'SINGLE_COLUMN_390')) throw new Error('Station scene reduced-motion parity failed.');
  if (packageView.station_responsibility?.operational_action_authority !== packageView.origin_station) throw new Error('Operational action authority drifted from origin station.');
  if (packageView.sidecars?.some(sidecar => sidecar.can_advance_cycle || sidecar.can_mutate_station || sidecar.authority_may_cross)) throw new Error('Sidecar authority widened.');
  if (packageView.propagation?.receipt_may_cross !== true || packageView.propagation?.authority_may_cross !== false || packageView.propagation?.raw_content_may_cross !== false) throw new Error('Propagation boundary is invalid.');
  if (packageView.propagation?.automatic_phase_advance !== false || packageView.propagation?.automatic_station_mutation !== false || packageView.authority?.flowcore_commands_station !== false || packageView.closure?.status !== 'OPEN') throw new Error('Station propagation widened authority or closure.');
  rejectRawContent(packageView);
  canonicalJson(packageView);
  return true;
}

function responsibilityMatrix(packages) {
  const matrix = Object.fromEntries(STATION_RESPONSIBILITY_ROLES.map(role => [role, []]));
  for (const packageView of packages) {
    for (const role of packageView.station_responsibility.responsibility_roles) matrix[role].push(packageView.origin_station);
    for (const sidecar of packageView.sidecars) {
      for (const role of sidecar.responsibility_roles) matrix[role].push(sidecar.station);
    }
    matrix.rendered.push('Dome-World');
  }
  return Object.fromEntries(Object.entries(matrix).map(([role, stations]) => [role, [...new Set(stations)].sort()]));
}

export async function compileStationPropagationBundle(fixtures, options = {}) {
  if (!Array.isArray(fixtures) || fixtures.length !== PRIMARY_PROPAGATION_STATIONS.length) throw new Error('P7 requires exactly four primary station fixtures.');
  const packages = [];
  for (const fixture of fixtures) packages.push(await compileStationPropagationScene(fixture, options));
  const stations = [...new Set(packages.map(item => item.origin_station))].sort();
  if (canonicalJson(stations) !== canonicalJson([...PRIMARY_PROPAGATION_STATIONS].sort())) throw new Error('Primary station coverage is incomplete or duplicated.');
  const matrix = responsibilityMatrix(packages);
  for (const role of STATION_RESPONSIBILITY_ROLES) if (!matrix[role].length) throw new Error(`Responsibility matrix has no ${role} station.`);
  const first = fixtures[0];
  const opts = runtimeOptions(first, options);
  const subject = {
    station_packages: packages.map(item => ({
      package_id: item.package_id,
      package_digest: item.package_digest,
      origin_station: item.origin_station,
      receipt_digest: item.pedagogue_receipt.receipt_digest
    })),
    responsibility_matrix: matrix,
    sidecar_stations: PROPAGATION_SIDECARS
  };
  const digest = await canonicalDigest('TD613:FLOWCORE:STATION-PROPAGATION-BUNDLE:v1', subject, opts);
  const receiptDigest = await canonicalDigest('TD613:FLOWCORE:STATION-PROPAGATION-RECEIPT:v1', {
    bundle_digest: digest,
    responsibility_matrix: matrix,
    station_receipts: subject.station_packages.map(item => item.receipt_digest)
  }, opts);
  const receipt = {
    schema: STATION_PROPAGATION_RECEIPT_SCHEMA,
    receipt_id: `station_propagation_${receiptDigest.slice(-24)}`,
    receipt_digest: receiptDigest,
    created_at: opts.frozenClock,
    bundle_digest: digest,
    responsibility_matrix: matrix,
    station_receipts: subject.station_packages.map(item => item.receipt_digest),
    receipts_may_cross: true,
    observations_may_cross: true,
    raw_content_may_cross: false,
    authority_may_cross: false,
    automatic_phase_advance: false,
    automatic_station_mutation: false,
    automatic_ash_action: false,
    release_authorized: false,
    human_closure_required: true,
    closure: { status: 'OPEN', closed_by: null }
  };
  const bundle = {
    schema: STATION_PROPAGATION_BUNDLE_SCHEMA,
    bundle_id: `station_bundle_${digest.slice(-24)}`,
    bundle_digest: digest,
    station_packages: packages,
    primary_stations: clone(PRIMARY_PROPAGATION_STATIONS),
    sidecar_stations: clone(PROPAGATION_SIDECARS),
    responsibility_matrix: matrix,
    propagation_receipt: receipt,
    serverless_delta: 0,
    persistence_delta: 0,
    raw_content_transport_added: false,
    station_authority_transferred: false,
    automatic_phase_advance: false,
    automatic_station_mutation: false,
    automatic_ash_action: false,
    release_authorized: false,
    human_closure_required: true,
    closure: { status: 'OPEN', closed_by: null }
  };
  verifyStationPropagationBundle(bundle);
  return freeze(bundle);
}

export function verifyStationPropagationBundle(bundle) {
  if (!bundle || bundle.schema !== STATION_PROPAGATION_BUNDLE_SCHEMA) throw new Error('Malformed station propagation bundle.');
  if (!Array.isArray(bundle.station_packages) || bundle.station_packages.length !== PRIMARY_PROPAGATION_STATIONS.length) throw new Error('Bundle lacks four primary station scenes.');
  bundle.station_packages.forEach(verifyStationPropagationScene);
  if (bundle.propagation_receipt?.receipts_may_cross !== true || bundle.propagation_receipt?.authority_may_cross !== false) throw new Error('Bundle receipt crossed authority.');
  if (bundle.serverless_delta !== 0 || bundle.persistence_delta !== 0 || bundle.raw_content_transport_added !== false) throw new Error('P7 added infrastructure or content transport.');
  if (bundle.station_authority_transferred !== false || bundle.automatic_phase_advance !== false || bundle.automatic_station_mutation !== false || bundle.automatic_ash_action !== false || bundle.release_authorized !== false) throw new Error('P7 widened station authority.');
  if (bundle.human_closure_required !== true || bundle.closure?.status !== 'OPEN') throw new Error('P7 closed without the human.');
  rejectRawContent(bundle);
  canonicalJson(bundle);
  return true;
}
