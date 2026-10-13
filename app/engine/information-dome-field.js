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

export const INFORMATION_DOME_SCENE_SCHEMA = 'td613.information-dome.scene-package/v0.1';
export const INFORMATION_DOME_FIELD_SCHEMA = 'td613.information-dome.field/v0.1';

export const INFORMATION_DOME_SCENE_KINDS = Object.freeze([
  'GLUING_OBSTRUCTION',
  'CONTENT_INVARIANT_PHASON',
  'PAIR_EMERGENT_MOIRE'
]);

const REQUIRED_NONCLAIMS = Object.freeze({
  GLUING_OBSTRUCTION: 'Mismatch ≠ falsehood, bad faith, identity, intent, or required suppression.',
  CONTENT_INVARIANT_PHASON: 'Projection change ≠ content mutation, falsehood, identity change, or publication authority.',
  PAIR_EMERGENT_MOIRE: 'Pair residue does not establish intent, identity, authorship, causation, surveillance probability, release prohibition, prediction, recommendation, suppression, or automatic Ash action.'
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

function runtimeOptions(fixture, options = {}) {
  return {
    ...fixture.determinism,
    cryptoImpl: options.cryptoImpl || globalThis.crypto,
    TextEncoderImpl: options.TextEncoderImpl || globalThis.TextEncoder
  };
}

function staticStep(summary, steps) {
  return { summary, steps };
}

function sceneModel(fixture, scene, answer) {
  const before = fixture.world_delta?.before || {};
  const after = fixture.world_delta?.after || {};
  switch (scene.scene_kind) {
    case 'GLUING_OBSTRUCTION':
      return {
        model: 'LOCAL_SECTIONS_AND_GLUING_OBSTRUCTION',
        sequence: ['room sections', 'restriction into overlap', 'mismatch', 'closure class', 'visible seam', 'optional intervention', 'new seam state'],
        sections: clone(scene.route_topology),
        before: clone(before),
        after: clone(after),
        seam_remains_visible: true,
        intervention_authority: answer.selected_action?.authorized_by_station || null,
        mismatch_is_global_verdict: false
      };
    case 'CONTENT_INVARIANT_PHASON':
      return {
        model: 'EXACT_PHASON_PROJECTION_CHANGE',
        sequence: ['fixed source anchor', 'hidden coordinate', 'declared shift', 'acceptance window', 'boundary relation', 'changed projection'],
        source_anchor: {
          before: scene.visible_condition?.content_digest_before,
          after: scene.visible_condition?.content_digest_after,
          stationary: scene.visible_condition?.content_digest_before === scene.visible_condition?.content_digest_after
        },
        previous_projection: scene.visible_condition?.previous_projection,
        new_projection: scene.visible_condition?.new_projection,
        before: clone(before),
        after: clone(after),
        exact_origin_reference: scene.provenance?.source_references?.find(item => item.includes('phason_gate_exact.py')) || null,
        browser_float_presented_as_exact: false,
        publication_authority_changed: false
      };
    case 'PAIR_EMERGENT_MOIRE':
      return {
        model: 'PAIR_EMERGENT_MOIRE_TOPOLOGY',
        sequence: ['baseline', 'singleton A', 'singleton B', 'pair A+B', 'pair residue'],
        baseline: scene.visible_condition?.baseline_bridge,
        singleton_a: scene.visible_condition?.singleton_a_bridge,
        singleton_b: scene.visible_condition?.singleton_b_bridge,
        pair: scene.visible_condition?.pair_bridge,
        pair_residue: clone(after.visible_relationships || []),
        emergent_topology_detected: after.emergent_topology_detected === true,
        residue_rule: scene.route_topology?.residue_rule,
        pair_residue_grants_authority: false
      };
    default:
      throw new Error('Unsupported Information-Dome scene kind.');
  }
}

async function compileCycle(fixture, options = {}) {
  const opts = runtimeOptions(fixture, options);
  const scene = await compilePedagogicalScene(fixture.scene_input, opts);
  const notice = await compilePedagogicalTransition(scene, null, null, {
    ...opts,
    phase: 'NOTICE',
    staticEquivalent: staticStep(scene.visible_condition.plain_language, ['condition', 'source', 'claim ceiling'])
  });
  const act = await compilePedagogicalTransition(scene, fixture.action, null, {
    ...opts,
    phase: 'ACT',
    priorTransitions: [notice],
    staticEquivalent: staticStep('The declared action, purpose, authority, reversibility, rest, and exit remain visible.', ['purpose', 'authority', 'reversibility', 'rest', 'exit'])
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
    staticEquivalent: staticStep(fixture.name.plain_language, ['plain relation', 'glyph relation', 'technical term', 'non-equivalence'])
  });
  const rest = await compilePedagogicalTransition(scene, null, null, {
    ...opts,
    phase: 'REST',
    priorTransitions: [notice, act, answer, name],
    staticEquivalent: staticStep('New demand stops while consequence, return, replay, and exit remain available.', ['stop new prompts', 'retain consequence', 'replay', 'return', 'exit'])
  });
  const restState = await compileRestState(scene, rest, opts);
  const transfer = await compileTransferEncounter(name, fixture.transfer_context, opts);
  const receipt = await compilePedagogueReceipt(scene, [notice, act, answer, name, rest], {
    ...opts,
    transferEncounters: [transfer]
  });
  const verification = await verifyPedagogueReceipt(receipt, opts);
  if (!verification.valid) throw new Error('Information-Dome scene produced an invalid pedagogue receipt.');
  return { opts, scene, notice, act, answer, name, rest, restState, transfer, receipt, verification };
}

export async function compileInformationDomeScene(fixture, options = {}) {
  if (!fixture || fixture.fixture_schema !== 'td613.flowcore.pedagogue-fixture/v0.1') throw new Error('Canonical pedagogue fixture required.');
  if (!INFORMATION_DOME_SCENE_KINDS.includes(fixture.scene_input?.scene_kind)) throw new Error('Fixture is outside the three canonical Information-Dome scene kinds.');
  const cycle = await compileCycle(fixture, options);
  const aiaViews = [];
  for (const route of AIA_ROUTE_IDS) {
    aiaViews.push(await compileAIAView(cycle.scene, cycle.answer, route, cycle.opts));
  }
  const aiaReport = verifyAIAInvariants(cycle.scene, aiaViews);
  const desktopFrames = {};
  const reducedMobileFrames = {};
  const visualReceipts = {};
  for (const route of AIA_ROUTE_IDS) {
    const viewId = `information-dome:${fixture.fixture_id}:${route}`;
    desktopFrames[route] = renderPedagogueScene(
      viewId,
      cycle.scene,
      cycle.name,
      options.desktopViewport || { width: 1120, height: 760, devicePixelRatio: 1 },
      options.time || 0,
      { activeViewId: viewId, reducedMotion: false }
    );
    reducedMobileFrames[route] = renderPedagogueStaticFrame(
      viewId,
      cycle.scene,
      cycle.name,
      options.mobileViewport || { width: 390, height: 844, devicePixelRatio: 1 },
      { activeViewId: viewId }
    );
    visualReceipts[route] = await compileVisualReceipt(cycle.scene, cycle.name, desktopFrames[route], {
      ...cycle.opts,
      idSeed: `${cycle.opts.idSeed}:${route}`,
      worldRevision: fixture.fixture_id,
      inputDigest: cycle.receipt.receipt_digest
    });
  }

  const model = sceneModel(fixture, cycle.scene, cycle.answer);
  const subject = {
    fixture_id: fixture.fixture_id,
    scene_reference: cycle.scene.scene_id,
    transition_references: [cycle.notice, cycle.act, cycle.answer, cycle.name, cycle.rest].map(item => item.transition_id),
    receipt_digest: cycle.receipt.receipt_digest,
    model,
    required_nonclaim: REQUIRED_NONCLAIMS[cycle.scene.scene_kind],
    routes: AIA_ROUTE_IDS
  };
  const packageDigest = await canonicalDigest('TD613:INFORMATION-DOME:SCENE-PACKAGE:v1', subject, cycle.opts);
  const output = {
    schema: INFORMATION_DOME_SCENE_SCHEMA,
    package_id: `info_dome_scene_${packageDigest.slice(-24)}`,
    package_digest: packageDigest,
    fixture_id: fixture.fixture_id,
    scene_kind: cycle.scene.scene_kind,
    scene: cycle.scene,
    phase_sequence: [cycle.notice, cycle.act, cycle.answer, cycle.name, cycle.rest],
    rest_state: cycle.restState,
    transfer_encounter: cycle.transfer,
    pedagogue_receipt: cycle.receipt,
    receipt_verification: cycle.verification,
    aia_views: Object.fromEntries(aiaViews.map(view => [view.route, view])),
    aia_invariant_report: aiaReport,
    desktop_frames: desktopFrames,
    reduced_mobile_frames: reducedMobileFrames,
    visual_receipts: visualReceipts,
    field_model: model,
    required_nonclaim: REQUIRED_NONCLAIMS[cycle.scene.scene_kind],
    research_frame: clone(cycle.scene.research_frame),
    authority: {
      station_owner: 'Dome-World',
      flowcore_commands_station: false,
      automatic_ash_action: false,
      release_authorized: false,
      station_authority_transferred: false,
      human_closure_required: true
    },
    closure: { status: 'OPEN', closed_by: null }
  };
  canonicalJson(output);
  return freeze(output);
}

export async function compileInformationDomeField(fixtures, options = {}) {
  if (!Array.isArray(fixtures) || fixtures.length !== 3) throw new Error('The canonical Information-Dome field requires exactly three fixtures.');
  const packages = [];
  for (const fixture of fixtures) packages.push(await compileInformationDomeScene(fixture, options));
  const kinds = [...new Set(packages.map(item => item.scene_kind))].sort();
  if (canonicalJson(kinds) !== canonicalJson([...INFORMATION_DOME_SCENE_KINDS].sort())) throw new Error('Canonical scene coverage is incomplete or duplicated.');
  const subject = {
    scene_packages: packages.map(item => ({
      package_id: item.package_id,
      package_digest: item.package_digest,
      scene_kind: item.scene_kind,
      receipt_digest: item.pedagogue_receipt.receipt_digest
    })),
    routes: AIA_ROUTE_IDS,
    serverless_delta: 0
  };
  const first = fixtures[0];
  const opts = runtimeOptions(first, options);
  const digest = await canonicalDigest('TD613:INFORMATION-DOME:FIELD:v1', subject, opts);
  const field = {
    schema: INFORMATION_DOME_FIELD_SCHEMA,
    field_id: `information_dome_${digest.slice(-24)}`,
    field_digest: digest,
    scene_packages: packages,
    canonical_scene_kinds: clone(INFORMATION_DOME_SCENE_KINDS),
    routes: clone(AIA_ROUTE_IDS),
    synthetic_first: true,
    ash_integration_authorized: false,
    serverless_delta: 0,
    authority: {
      dome_world_hosts_scenes: true,
      flowcore_commands_station: false,
      aperture_audits_only: true,
      ash_custody_authority_unchanged: true,
      human_closure_required: true
    },
    closure: { status: 'OPEN', closed_by: null }
  };
  verifyInformationDomeField(field);
  return freeze(field);
}

export function verifyInformationDomeField(field) {
  if (!field || field.schema !== INFORMATION_DOME_FIELD_SCHEMA) throw new Error('Malformed Information-Dome field.');
  if (!Array.isArray(field.scene_packages) || field.scene_packages.length !== 3) throw new Error('Information-Dome field must contain three scene packages.');
  for (const item of field.scene_packages) {
    if (item.receipt_verification?.valid !== true) throw new Error('Scene receipt verification failed.');
    if (item.aia_invariant_report?.all_invariants_preserved !== true) throw new Error('AIA invariant failure.');
    if (Object.keys(item.aia_views || {}).length !== 4) throw new Error('Scene lacks four AIA views.');
    if (Object.values(item.reduced_mobile_frames || {}).some(frame => frame.reduced_motion !== true || frame.viewport?.layout !== 'SINGLE_COLUMN_390')) throw new Error('Reduced-motion mobile parity failed.');
    if (item.authority?.station_authority_transferred !== false || item.closure?.status !== 'OPEN') throw new Error('Scene authority or closure widened.');
    if (!item.required_nonclaim || !item.research_frame?.falsifier?.length || !item.research_frame?.alternative_explanations?.length) throw new Error('Scene research framing is incomplete.');
  }
  if (field.serverless_delta !== 0 || field.ash_integration_authorized !== false || field.authority?.ash_custody_authority_unchanged !== true || field.closure?.status !== 'OPEN') throw new Error('Field boundary widened.');
  canonicalJson(field);
  return true;
}
