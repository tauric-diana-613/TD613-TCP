import { canonicalDigest, canonicalJson } from './ash/canonical-json.js';
import { FLOWCORE_GLYPH_REGISTRY } from './data/flowcore-glyph-semantics-v01.js';

export const FLOWCORE_VISUAL_SCHEMA = 'td613.flowcore.pedagogue-visual/v0.1';
export const FLOWCORE_VISUAL_RECEIPT_SCHEMA = 'td613.flowcore.pedagogue-visual-receipt/v0.1';
export const FLOWCORE_VISUAL_CHANNELS = Object.freeze(['glyph', 'motion', 'shape', 'language', 'inspection']);

const GLYPH_BY_RELATION = Object.freeze(Object.fromEntries(
  Object.values(FLOWCORE_GLYPH_REGISTRY.entries).map(entry => [entry.semantic_relation, entry.glyph])
));

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

function viewportOf(viewport = {}) {
  const width = Number(viewport.width);
  const height = Number(viewport.height);
  const devicePixelRatio = Number(viewport.devicePixelRatio || 1);
  if (!Number.isFinite(width) || width <= 0 || !Number.isFinite(height) || height <= 0) {
    throw new Error('Visual viewport requires positive width and height.');
  }
  if (!Number.isFinite(devicePixelRatio) || devicePixelRatio <= 0) throw new Error('Invalid device-pixel ratio.');
  return {
    width: Math.round(width),
    height: Math.round(height),
    devicePixelRatio,
    layout: width <= 390 ? 'SINGLE_COLUMN_390' : 'RESPONSIVE_FIELD',
    horizontal_overflow_allowed: false,
    minimum_touch_target_css_px: 44,
    zoom_200_controls_visible: true
  };
}

function assertGoverned(scene, transition) {
  if (!scene || !transition) throw new Error('Scene and transition are required.');
  if (transition.scene_reference !== scene.scene_id) throw new Error('Transition does not belong to scene.');
  if (scene.closure?.status !== 'OPEN' || transition.closure?.status !== 'OPEN') throw new Error('Visual grammar cannot render automatic closure.');
  if (scene.authority?.human_closure_required !== true || transition.authority?.human_closure_required !== true) throw new Error('Human closure must remain required.');
  if (scene.authority?.automatic_ash_action !== false || transition.authority?.automatic_ash_action !== false) throw new Error('Visual grammar cannot authorize Ash action.');
}

function selectedGlyph(scene, transition) {
  const relation = transition.name?.glyph_relation || transition.glyph_candidates?.[0] || null;
  return relation ? { relation, glyph: GLYPH_BY_RELATION[relation] || null } : { relation: null, glyph: null };
}

function staticSequence(scene, transition) {
  const steps = transition.static_equivalent?.steps || [
    'show visible condition',
    'show declared action',
    'show world answer',
    'show residual and claim ceiling'
  ];
  return {
    mode: 'SIMULTANEOUS_CAUSAL_FRAME',
    numbered_markers: steps.map((step, index) => ({ number: index + 1, step })),
    start_visible: true,
    route_visible: true,
    end_visible: true,
    autoplay: false,
    flashing: false,
    oscillation: false
  };
}

function active(viewId, preferences = {}) {
  return !preferences.activeViewId || preferences.activeViewId === viewId;
}

export function renderPedagogueScene(viewId, scene, transition, viewport, time = 0, preferences = {}) {
  assertGoverned(scene, transition);
  const frameViewport = viewportOf(viewport);
  const isActive = active(viewId, preferences);
  const reducedMotion = preferences.reducedMotion === true;
  const glyph = selectedGlyph(scene, transition);
  const operators = [
    scene.causal_structure?.operator,
    transition.selected_action?.action_id,
    ...(transition.causal_trace || []).map(item => item.step || String(item))
  ].filter(Boolean);

  const channels = {
    glyph: {
      relation: glyph.relation,
      symbol: glyph.glyph,
      text_equivalent: transition.name?.plain_language || scene.visible_condition?.plain_language || 'No glyph relation named.',
      appears_after_world_answer: true
    },
    motion: reducedMotion ? staticSequence(scene, transition) : {
      mode: 'COORDINATOR_TICKED',
      owns_animation_loop: false,
      time: Number(time) || 0,
      causal_order: ['condition', 'action', 'world_answer', 'relation', 'rest'],
      amplitude_bounded: true,
      autoplay_authority: false
    },
    shape: {
      route_topology: clone(scene.route_topology),
      visible_seams: clone(transition.contradictions || scene.contradictions || []),
      missingness_markers: clone(transition.missingness || scene.missingness || []),
      color_is_sole_signal: false
    },
    language: {
      visible_condition: clone(scene.visible_condition),
      consequence: transition.name?.plain_language || transition.static_equivalent?.summary || null,
      unresolved_relations: clone(transition.unresolved_relations || []),
      technical_term: transition.name?.technical_term || null,
      technical_term_after_consequence: true
    },
    inspection: {
      scene_reference: scene.scene_id,
      transition_reference: transition.transition_id,
      station_owner: scene.station_owner,
      authorized_actions: clone(transition.authorized_actions || []),
      claim_ceiling: clone(scene.claim_ceiling),
      operators,
      missingness: clone(transition.missingness || scene.missingness || []),
      contradictions: clone(transition.contradictions || scene.contradictions || []),
      closure: { status: 'OPEN', closed_by: null }
    }
  };

  const drawCommands = isActive ? [
    { channel: 'shape', operation: 'DRAW_ROUTE_TOPOLOGY' },
    { channel: 'glyph', operation: glyph.glyph ? 'DRAW_GLYPH_RELATION' : 'DRAW_RELATION_PLACEHOLDER' },
    { channel: 'language', operation: 'UPDATE_BOUNDED_DOM_SUMMARY' }
  ] : [];

  const frame = {
    schema: FLOWCORE_VISUAL_SCHEMA,
    view_id: String(viewId),
    scene_reference: scene.scene_id,
    transition_reference: transition.transition_id,
    active: isActive,
    draw: isActive,
    hidden_view_draw_count: 0,
    draw_commands: drawCommands,
    viewport: frameViewport,
    scheduler: {
      coordinator: 'renderDomeArt',
      requires_existing_coordinator: true,
      owns_animation_loop: false,
      hidden_views_draw_zero: true,
      backing_store_resize_policy: 'ONLY_WHEN_CSS_SIZE_OR_DPR_CHANGES'
    },
    channels,
    structured_dom_summary: {
      role: 'region',
      aria_label: 'Flow-Core consequence and relation',
      live_announcement: isActive ? transition.name?.plain_language || transition.static_equivalent?.summary || null : null,
      continuous_frame_narration: false,
      keyboard_actions: clone(scene.available_affordances || []),
      rest_available: true,
      replay_available: true,
      exit_available: true
    },
    reduced_motion: reducedMotion,
    static_equivalent: staticSequence(scene, transition),
    authority: {
      commands_station: false,
      automatic_ash_action: false,
      release_authorized: false,
      human_closure_required: true
    },
    closure: { status: 'OPEN', closed_by: null }
  };
  if (!isActive) frame.hidden_view_reason = 'INACTIVE_DOME_VIEW';
  return freeze(frame);
}

export function renderPedagogueStaticFrame(viewId, scene, transition, viewport, preferences = {}) {
  return renderPedagogueScene(viewId, scene, transition, viewport, 0, { ...preferences, reducedMotion: true });
}

export async function compileVisualReceipt(scene, transition, renderState, options = {}) {
  assertGoverned(scene, transition);
  if (!renderState || renderState.schema !== FLOWCORE_VISUAL_SCHEMA) throw new Error('A governed visual render state is required.');
  const frozenClock = String(options.frozenClock || '');
  const idSeed = String(options.idSeed || '');
  if (!frozenClock || !idSeed) throw new Error('Visual receipt requires frozenClock and idSeed.');
  const subject = {
    scene_reference: scene.scene_id,
    transition_reference: transition.transition_id,
    renderer: 'flowcore-pedagogue-visual',
    world_revision: options.worldRevision || null,
    input_digest: options.inputDigest || null,
    operators: clone(renderState.channels.inspection.operators),
    modeled: true,
    claim_ceiling: clone(scene.claim_ceiling),
    reduced_motion: renderState.reduced_motion,
    viewport: clone(renderState.viewport),
    draw: renderState.draw,
    active: renderState.active,
    scheduler: clone(renderState.scheduler),
    channels: FLOWCORE_VISUAL_CHANNELS
  };
  const digest = await canonicalDigest('TD613:FLOWCORE:VISUAL-RECEIPT:v1', {
    frozen_clock: frozenClock,
    id_seed: idSeed,
    subject
  }, options);
  const receipt = {
    schema: FLOWCORE_VISUAL_RECEIPT_SCHEMA,
    receipt_id: `flowped_visual_${digest.slice(-24)}`,
    created_at: frozenClock,
    ...subject,
    receipt_digest: digest,
    authority: {
      commands_station: false,
      automatic_ash_action: false,
      release_authorized: false,
      human_closure_required: true
    },
    closure: { status: 'OPEN', closed_by: null }
  };
  canonicalJson(receipt);
  return freeze(receipt);
}

export function createPedagogueCoordinatorAdapter(registerRenderer) {
  if (typeof registerRenderer !== 'function') throw new TypeError('Existing coordinator registration function is required.');
  return freeze({
    schema: 'td613.flowcore.pedagogue-coordinator-adapter/v0.1',
    owns_animation_loop: false,
    register(viewId, scene, transition, preferences = {}) {
      return registerRenderer(viewId, (worldSnapshot, viewport, time) =>
        renderPedagogueScene(viewId, scene, transition, viewport, time, {
          ...preferences,
          activeViewId: worldSnapshot?.activeViewId || preferences.activeViewId
        })
      );
    }
  });
}
