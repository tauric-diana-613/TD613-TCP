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

export const PHYSICAL_FLOWCORE_MODEL_SCHEMA = 'td613.flowcore.physical-model/v0.1';
export const PHYSICAL_FLOWCORE_PACKAGE_SCHEMA = 'td613.flowcore.physical-scene-package/v0.1';

const PPM = 1_000_000;
const GRAVITY_NUMERATOR = 980_665;
const GRAVITY_DENOMINATOR = 100_000_000;
const RAW_KEYS = new Set(['body', 'text', 'content', 'raw', 'rawText', 'raw_text', 'bytes', 'buffer', 'sourceText']);

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

function rejectRaw(value, path = '$') {
  if (!value || typeof value !== 'object') return;
  if (Array.isArray(value)) return value.forEach((item, index) => rejectRaw(item, `${path}[${index}]`));
  for (const [key, child] of Object.entries(value)) {
    if (RAW_KEYS.has(key) && child != null && child !== '') throw new Error(`${path}.${key} is raw content and cannot enter the physical Flow-Core model.`);
    rejectRaw(child, `${path}.${key}`);
  }
}

function safeInteger(value, name, { min = 0, max = Number.MAX_SAFE_INTEGER } = {}) {
  if (!Number.isSafeInteger(value) || value < min || value > max) throw new Error(`${name} must be a safe integer between ${min} and ${max}.`);
  return value;
}

function ppm(value, name) {
  return safeInteger(value, name, { min: 0, max: PPM });
}

function multiplyPpm(value, ratio) {
  return Math.floor((value * ratio) / PPM);
}

function potentialMillijoules(volumeMl, headMm) {
  const product = volumeMl * headMm;
  if (!Number.isSafeInteger(product)) throw new Error('Water-volume and head product exceeds the deterministic integer ceiling.');
  const weighted = product * GRAVITY_NUMERATOR;
  if (!Number.isSafeInteger(weighted)) throw new Error('Potential-energy calculation exceeds the deterministic integer ceiling.');
  return Math.round(weighted / GRAVITY_DENOMINATOR);
}

function validateInput(input = {}) {
  rejectRaw(input);
  const model = {
    water_volume_ml: safeInteger(input.water_volume_ml, 'water_volume_ml', { min: 1 }),
    head_mm: safeInteger(input.head_mm, 'head_mm', { min: 1 }),
    mechanical_input_millijoules: safeInteger(input.mechanical_input_millijoules, 'mechanical_input_millijoules'),
    lift_efficiency_ppm: ppm(input.lift_efficiency_ppm, 'lift_efficiency_ppm'),
    descent_efficiency_ppm: ppm(input.descent_efficiency_ppm, 'descent_efficiency_ppm'),
    pipe_friction_loss_ppm: ppm(input.pipe_friction_loss_ppm, 'pipe_friction_loss_ppm'),
    prior_reserve_millijoules: safeInteger(input.prior_reserve_millijoules, 'prior_reserve_millijoules'),
    essential_reserve_floor_millijoules: safeInteger(input.essential_reserve_floor_millijoules, 'essential_reserve_floor_millijoules'),
    optional_surplus_load_millijoules: safeInteger(input.optional_surplus_load_millijoules, 'optional_surplus_load_millijoules'),
    thermal_store_millijoules: safeInteger(input.thermal_store_millijoules ?? 0, 'thermal_store_millijoules'),
    thermal_converter_present: input.thermal_converter_present === true,
    participant_input_class: String(input.participant_input_class || 'OPTIONAL_SURPLUS_ONLY')
  };
  if (model.prior_reserve_millijoules < model.essential_reserve_floor_millijoules) {
    throw new Error('The essential reserve must already be protected before optional participant input is considered.');
  }
  if (model.participant_input_class !== 'OPTIONAL_SURPLUS_ONLY') {
    throw new Error('Participant input may be modeled only as optional surplus work.');
  }
  if (model.thermal_converter_present) {
    throw new Error('P8 v0.1 keeps the thermal ledger separate and does not yet model a thermal-to-mechanical converter.');
  }
  return model;
}

export function compilePhysicalFlowCoreModel(input = {}) {
  const model = validateInput(input);
  const potentialCapacity = potentialMillijoules(model.water_volume_ml, model.head_mm);
  const liftAvailable = multiplyPpm(model.mechanical_input_millijoules, model.lift_efficiency_ppm);
  const liftedStored = Math.min(potentialCapacity, liftAvailable);
  const liftLoss = model.mechanical_input_millijoules - liftedStored;
  const descentAvailable = multiplyPpm(liftedStored, model.descent_efficiency_ppm);
  const pipeLoss = multiplyPpm(descentAvailable, model.pipe_friction_loss_ppm);
  const deliveredWork = descentAvailable - pipeLoss;
  const reserveBeforeOptionalOutput = model.prior_reserve_millijoules + deliveredWork;
  const availableOptionalSurplus = Math.max(0, reserveBeforeOptionalOutput - model.essential_reserve_floor_millijoules);
  const optionalOutput = Math.min(model.optional_surplus_load_millijoules, availableOptionalSurplus);
  const reserveNext = reserveBeforeOptionalOutput - optionalOutput;
  const unservedOptionalLoad = model.optional_surplus_load_millijoules - optionalOutput;
  const result = {
    schema: PHYSICAL_FLOWCORE_MODEL_SCHEMA,
    units: {
      water_volume: 'millilitres',
      head: 'millimetres',
      energy: 'millijoules',
      efficiencies: 'parts-per-million'
    },
    constants: {
      water_density_kg_per_litre: 1,
      gravity_micrometres_per_second_squared: 9_806_650,
      gravity_rational: `${GRAVITY_NUMERATOR}/${GRAVITY_DENOMINATOR}`
    },
    inputs: model,
    mechanical_ledger: {
      potential_capacity_millijoules: potentialCapacity,
      mechanical_input_millijoules: model.mechanical_input_millijoules,
      lifted_stored_millijoules: liftedStored,
      lift_loss_millijoules: liftLoss,
      descent_available_millijoules: descentAvailable,
      pipe_friction_loss_millijoules: pipeLoss,
      delivered_work_millijoules: deliveredWork,
      prior_reserve_millijoules: model.prior_reserve_millijoules,
      optional_output_millijoules: optionalOutput,
      unserved_optional_load_millijoules: unservedOptionalLoad,
      next_reserve_millijoules: reserveNext,
      essential_reserve_floor_millijoules: model.essential_reserve_floor_millijoules,
      essential_reserve_protected: reserveNext >= model.essential_reserve_floor_millijoules
    },
    thermal_ledger: {
      stored_thermal_energy_millijoules: model.thermal_store_millijoules,
      converter_present: false,
      thermal_to_mechanical_transfer_millijoules: 0,
      mechanically_spendable: false
    },
    equations: [
      'E_stored = ρVgh',
      'W_out = η_up η_down ρVgh - pipe_loss',
      'R_next = R + delivered_work - optional_output',
      'thermal_store ≠ mechanical_reserve without a modeled converter'
    ],
    child_safety: {
      participant_input_is_optional_surplus_only: true,
      essential_service_depends_on_participant_input: false,
      essential_reserve_floor_protected: reserveNext >= model.essential_reserve_floor_millijoules,
      participant_nonperformance_penalty: false
    },
    claim_ceiling: {
      allowed_claims: [
        'the declared model separates potential, delivered work, loss, reserve, optional surplus, and thermal storage',
        'optional output is capped above the protected essential reserve floor',
        'thermal energy contributes zero mechanical work without a modeled converter'
      ],
      forbidden_claims: [
        'the model certifies a real installation',
        'the model proves efficiency under unmeasured conditions',
        'participant effort may be required for an essential service',
        'thermal storage may be spent as mechanical work without conversion'
      ]
    },
    authority: {
      model_commands_physical_system: false,
      essential_service_control_authorized: false,
      automatic_station_mutation: false,
      release_authorized: false,
      human_closure_required: true
    },
    closure: { status: 'OPEN', closed_by: null }
  };
  canonicalJson(result);
  return freeze(result);
}

function sceneInput(model, fixture) {
  const ledger = model.mechanical_ledger;
  return {
    scene_kind: 'GENERIC',
    station_owner: 'Dome-World',
    source_status: 'E4',
    observation_status: 'OBSERVED',
    world_state_reference: fixture.fixture_id,
    provenance: {
      source_references: ['app/engine/flowcore-physical-scene.js', fixture.fixture_id],
      evidence_basis: ['declared SI-derived inputs', 'integer fixed-unit calculation', 'synthetic physical proving fixture'],
      transformations: ['validate optional-surplus boundary', 'compute potential and delivered work', 'protect reserve floor', 'separate thermal ledger'],
      station_owners: ['Dome-World']
    },
    visible_condition: {
      plain_language: 'Optional work lifts water; descent returns less work after efficiency and friction losses while the essential reserve remains protected.',
      potential_capacity_millijoules: ledger.potential_capacity_millijoules,
      delivered_work_millijoules: ledger.delivered_work_millijoules,
      total_losses_millijoules: ledger.lift_loss_millijoules + ledger.pipe_friction_loss_millijoules,
      next_reserve_millijoules: ledger.next_reserve_millijoules,
      essential_reserve_floor_millijoules: ledger.essential_reserve_floor_millijoules,
      thermal_mechanically_spendable: false
    },
    available_affordances: [{
      action_id: 'run_optional_physical_cycle',
      purpose: 'Run one declared optional-surplus lift and descent cycle without touching the protected essential reserve.',
      authorized_by_station: 'Dome-World',
      reversible: true
    }],
    route_topology: {
      sequence: ['optional input', 'lift', 'stored potential', 'descent', 'friction loss', 'optional output', 'protected reserve', '𝄐'],
      essential_reserve_floor: ledger.essential_reserve_floor_millijoules,
      thermal_ledger_separate: true,
      child_input_required_for_essential_service: false
    },
    causal_structure: {
      input: 'declared optional mechanical work and bounded water/head fixture',
      operator: 'integer SI-derived gravitational storage and loss ledger',
      observable: 'stored potential, delivered work, losses, optional output, reserve floor, and separate thermal store',
      equations: clone(model.equations),
      authority: 'the model demonstrates accounting only and commands no physical system'
    },
    research_frame: clone(fixture.research_frame),
    missingness: clone(fixture.missingness || []),
    contradictions: clone(fixture.contradictions || []),
    claim_ceiling: clone(model.claim_ceiling),
    technical_terms_withheld: ['gravitational potential energy', 'lift efficiency', 'descent efficiency', 'reserve floor', 'thermal conversion']
  };
}

function worldDelta(model) {
  const ledger = model.mechanical_ledger;
  return {
    observation_status: 'OBSERVED',
    before: {
      reserve_millijoules: ledger.prior_reserve_millijoules,
      optional_load_served_millijoules: 0,
      thermal_store_millijoules: model.thermal_ledger.stored_thermal_energy_millijoules
    },
    after: {
      reserve_millijoules: ledger.next_reserve_millijoules,
      optional_load_served_millijoules: ledger.optional_output_millijoules,
      thermal_store_millijoules: model.thermal_ledger.stored_thermal_energy_millijoules,
      essential_reserve_protected: ledger.essential_reserve_protected
    },
    causal_trace: [
      'optional mechanical input entered the lift ledger',
      'lift efficiency limited stored potential',
      'descent efficiency and pipe friction reduced deliverable work',
      'optional output was capped above the essential reserve floor',
      'thermal storage remained mechanically unavailable'
    ],
    losses: [
      `lift loss ${ledger.lift_loss_millijoules} mJ`,
      `pipe friction loss ${ledger.pipe_friction_loss_millijoules} mJ`
    ],
    missingness: ['real pipe geometry, turbulence, leakage, maintenance condition, and measured thermal converter performance are outside this synthetic fixture'],
    contradictions: ['stored energy is visible while full recovery remains impossible', 'thermal energy exists while mechanical transfer remains zero'],
    unresolved_relations: ['real installation performance requires measured calibration'],
    glyph_candidates: ['created-potential', 'released-tendency', 'structural-rest'],
    static_equivalent: {
      summary: 'The static ledger shows input, stored potential, lift loss, descent loss, delivered work, optional output, protected reserve, and separate thermal storage.',
      steps: ['show optional input', 'show lifted storage', 'show losses', 'show delivered work', 'show optional output cap', 'show protected reserve', 'show separate thermal ledger', 'show rest and claim ceiling']
    }
  };
}

function runtimeOptions(fixture, options = {}) {
  return {
    ...fixture.determinism,
    cryptoImpl: options.cryptoImpl || globalThis.crypto,
    TextEncoderImpl: options.TextEncoderImpl || globalThis.TextEncoder
  };
}

export async function compilePhysicalFlowCoreScene(fixture, options = {}) {
  if (!fixture || fixture.fixture_schema !== 'td613.flowcore.physical-fixture/v0.1') throw new Error('Canonical physical Flow-Core fixture required.');
  rejectRaw(fixture);
  const model = compilePhysicalFlowCoreModel(fixture.model_input);
  const opts = runtimeOptions(fixture, options);
  const scene = await compilePedagogicalScene(sceneInput(model, fixture), opts);
  const notice = await compilePedagogicalTransition(scene, null, null, {
    ...opts,
    phase: 'NOTICE',
    staticEquivalent: { summary: scene.visible_condition.plain_language, steps: ['condition', 'reserve floor', 'thermal separation', 'claim ceiling'] }
  });
  const action = { action_id: 'run_optional_physical_cycle', authorized_by_station: 'Dome-World' };
  const act = await compilePedagogicalTransition(scene, action, null, {
    ...opts,
    phase: 'ACT',
    priorTransitions: [notice],
    staticEquivalent: { summary: 'One optional lift/descent cycle is selected; the essential reserve remains protected.', steps: ['optional input', 'authority', 'reserve floor', 'rest', 'exit'] }
  });
  const delta = worldDelta(model);
  const answer = await compilePedagogicalTransition(scene, action, delta, {
    ...opts,
    phase: 'WORLD_ANSWERS',
    priorTransitions: [notice, act]
  });
  const nameSpec = {
    plain_language: 'Water stores potential when lifted, returns less work after losses, and cannot spend thermal storage as mechanical work without conversion.',
    glyph_relation: 'created-potential',
    technical_term: 'bounded gravitational storage ledger',
    non_equivalence: [
      'stored potential is not delivered work',
      'loss is not disappearance from the ledger',
      'optional input is not an essential-service obligation',
      'heat is not mechanical work without a converter'
    ]
  };
  const name = await compilePedagogicalTransition(scene, null, null, {
    ...opts,
    phase: 'NAME',
    priorTransitions: [notice, act, answer],
    name: nameSpec,
    staticEquivalent: { summary: nameSpec.plain_language, steps: ['potential', 'delivered work', 'loss', 'reserve', 'thermal separation'] }
  });
  const rest = await compilePedagogicalTransition(scene, null, null, {
    ...opts,
    phase: 'REST',
    priorTransitions: [notice, act, answer, name],
    staticEquivalent: { summary: 'The model coasts to a stable inspectable frame; no new demand is introduced.', steps: ['stop input', 'retain ledger', 'inspect loss', 'replay', 'return', 'exit'] }
  });
  const restState = await compileRestState(scene, rest, opts);
  const transfer = await compileTransferEncounter(name, fixture.transfer_context, opts);
  const receipt = await compilePedagogueReceipt(scene, [notice, act, answer, name, rest], { ...opts, transferEncounters: [transfer] });
  const receiptVerification = await verifyPedagogueReceipt(receipt, opts);
  if (!receiptVerification.valid) throw new Error('Physical Flow-Core pedagogue receipt verification failed.');

  const views = [];
  const desktopFrames = {};
  const reducedMobileFrames = {};
  const visualReceipts = {};
  for (const route of AIA_ROUTE_IDS) {
    const view = await compileAIAView(scene, answer, route, opts);
    views.push(view);
    const viewId = `physical-flowcore:${fixture.fixture_id}:${route}`;
    desktopFrames[route] = renderPedagogueScene(viewId, scene, name, options.desktopViewport || { width: 1120, height: 760, devicePixelRatio: 1 }, options.time || 0, { activeViewId: viewId, reducedMotion: false });
    reducedMobileFrames[route] = renderPedagogueStaticFrame(viewId, scene, name, options.mobileViewport || { width: 390, height: 844, devicePixelRatio: 1 }, { activeViewId: viewId });
    visualReceipts[route] = await compileVisualReceipt(scene, name, desktopFrames[route], {
      ...opts,
      idSeed: `${opts.idSeed}:${route}`,
      worldRevision: fixture.fixture_id,
      inputDigest: receipt.receipt_digest
    });
  }
  const invariantReport = verifyAIAInvariants(scene, views);
  const subject = {
    fixture_id: fixture.fixture_id,
    model,
    scene_reference: scene.scene_id,
    transition_references: [notice, act, answer, name, rest].map(item => item.transition_id),
    receipt_digest: receipt.receipt_digest,
    routes: AIA_ROUTE_IDS
  };
  const digest = await canonicalDigest('TD613:FLOWCORE:PHYSICAL-SCENE-PACKAGE:v1', subject, opts);
  const output = {
    schema: PHYSICAL_FLOWCORE_PACKAGE_SCHEMA,
    package_id: `flowcore_physical_${digest.slice(-24)}`,
    package_digest: digest,
    fixture_id: fixture.fixture_id,
    model,
    scene,
    phase_sequence: [notice, act, answer, name, rest],
    rest_state: restState,
    transfer_encounter: transfer,
    pedagogue_receipt: receipt,
    receipt_verification: receiptVerification,
    aia_views: Object.fromEntries(views.map(view => [view.route, view])),
    aia_invariant_report: invariantReport,
    desktop_frames: desktopFrames,
    reduced_mobile_frames: reducedMobileFrames,
    visual_receipts: visualReceipts,
    child_safety: clone(model.child_safety),
    serverless_delta: 0,
    persistence_delta: 0,
    authority: {
      dome_world_hosts_scene: true,
      flowcore_commands_physical_system: false,
      essential_service_control_authorized: false,
      automatic_ash_action: false,
      release_authorized: false,
      human_closure_required: true
    },
    closure: { status: 'OPEN', closed_by: null }
  };
  canonicalJson(output);
  return freeze(output);
}
