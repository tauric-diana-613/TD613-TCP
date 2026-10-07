/**
 * TD613 · Sequence 6 · Tranche 2
 * 39-Carrier Flow-Core × Dome-Art Semantic Motion Bridge
 *
 * Embodying the surviving relation set under one semantic, deterministic
 * animation jurisdiction.
 *
 * Invariants:
 * - CARRIER_COUNT != CSS_OPACITY != MOTION_DEPTH_GAIN != RENDERED_SCALE
 * - MOTION_INTERPRETATION != SEMANTIC_REDEFINITION
 * - AMBIENT_MOTION != EVENT_HISTORY
 * - VISUAL_RELATION != EXTERNAL_REALITY
 * - AESTHETIC_BINDING != EMPIRICAL_VALIDATION
 * - ONE_WORLD_STATE = ONE_RENDER_CAUSAL_FRAME
 * - REDUCED_MOTION != REDUCED_MEANING
 */

import {
  FLOWCORE_GLYPH_REGISTRY,
  getFlowcoreGlyphSemantic
} from '../dome-world/data/flowcore-glyph-semantics-v01.js';
import {
  computeHeterostratigraphicPotential,
  computeGradientMisfit
} from '../dome-world/holonomy-loom/dome-art-lattice.js';

export const FLOWCORE_SEMANTIC_MOTION_BRIDGE_SCHEMA = 'td613.flowcore.semantic-motion-bridge/v1.0';
export const MOTION_PRESENTATION_DESCRIPTOR_SCHEMA = 'td613.flowcore.motion-presentation-descriptor/v1.0';
export const RENDER_DOME_ART_FRAME_SCHEMA = 'td613.flowcore.render-dome-art-frame/v1.0';

// Canonical carrier counts
export const CARRIER_COUNT = 39;
export const NEAR_CARRIER_COUNT = 6;
export const MID_CARRIER_COUNT = 13;
export const FAR_CARRIER_COUNT = 20;

// Canonical deployed Loom CSS opacity (.loom-product-v6.css)
export const CSS_OPACITY_NEAR = 0.38;
export const CSS_OPACITY_MID = 0.24;
export const CSS_OPACITY_FAR = 0.20;

// Motion-family depth gains (projectFlowcoreMotionFamily)
export const MOTION_DEPTH_GAIN_NEAR = 1.35;
export const MOTION_DEPTH_GAIN_MID = 0.82;
export const MOTION_DEPTH_GAIN_FAR = 0.46;

// Canonical base font sizes / SVG geometry
export const FONT_SIZE_NEAR_PRIMARY = 184;   // i % 13 === 0
export const FONT_SIZE_NEAR_SECONDARY = 132; // i % 11 === 0
export const FONT_SIZE_MID = 56;
export const FONT_SIZE_FAR = 26;

// Claim ceiling
export const CLAIM_CEILING_MOTION_BRIDGE = Object.freeze({
  aesthetic_binding: 'AESTHETIC_BINDING_NOT_EMPIRICAL_VALIDATION',
  ambient_motion: 'AMBIENT_MOTION_NOT_EVENT_HISTORY',
  visual_relation: 'VISUAL_RELATION_NOT_EXTERNAL_REALITY',
  animation_jurisdiction: 'SINGLE_COORDINATOR_DETERMINISTIC_FRAME'
});

/**
 * Proposed aesthetic bindings mapping canonical relations to Dome-Art motion families.
 * Status: PROPOSED_AESTHETIC_BINDING (awaiting empirical evaluation).
 * Semantics remain governed exclusively by FLOWCORE_GLYPH_REGISTRY.
 */
export const PROPOSED_AESTHETIC_BINDINGS = Object.freeze({
  recurrence: Object.freeze({
    family_id: 'phi-gossamer',
    binding_status: 'PROPOSED_AESTHETIC_BINDING',
    rate: 0.041,
    amplitude: 1.0,
    velocity_profile: 'HARMONIC_RADIAL_PULSE',
    deformation: 'QUASIPERIODIC_GOSSAMER'
  }),
  gathering: Object.freeze({
    family_id: 'orbital-braid',
    binding_status: 'PROPOSED_AESTHETIC_BINDING',
    rate: 0.034,
    amplitude: 1.15,
    velocity_profile: 'INWARD_CAPACITY_DECELERATION',
    deformation: 'TORSION_BRAID'
  }),
  release: Object.freeze({
    family_id: 'moire-shear',
    binding_status: 'PROPOSED_AESTHETIC_BINDING',
    rate: 0.038,
    amplitude: 1.25,
    velocity_profile: 'OUTWARD_SHEAR_EXPANSION',
    deformation: 'MOIRE_SHEAR'
  }),
  bounded_emergence: Object.freeze({
    family_id: 'torsion-bloom',
    binding_status: 'PROPOSED_AESTHETIC_BINDING',
    rate: 0.046,
    amplitude: 1.2,
    velocity_profile: 'AZIMUTHAL_ROTATIONAL_BLOOM',
    deformation: 'TORSION_BLOOM'
  }),
  protected_continuity: Object.freeze({
    family_id: 'quiet-recurrence',
    binding_status: 'PROPOSED_AESTHETIC_BINDING',
    rate: 0.017,
    amplitude: 0.65,
    velocity_profile: 'LOW_ENERGY_ORBITAL_STABILIZATION',
    deformation: 'CONTRACTED_LIVING_BOUNDARY'
  }),
  created_potential: Object.freeze({
    family_id: 'phasonic-rise',
    binding_status: 'PROPOSED_AESTHETIC_BINDING',
    rate: 0.044,
    amplitude: 1.1,
    velocity_profile: 'VERTICAL_PHASONIC_ASCENT',
    deformation: 'PHASONIC_RISE'
  }),
  released_tendency: Object.freeze({
    family_id: 'gradient-stampede',
    binding_status: 'PROPOSED_AESTHETIC_BINDING',
    rate: 0.055,
    amplitude: 1.3,
    velocity_profile: 'GROUNDING_DESCENT_ACCELERATION',
    deformation: 'GRADIENT_MISFIT'
  }),
  structural_rest: Object.freeze({
    family_id: 'coast-and-settle',
    binding_status: 'CANONICAL_REST_GRAMMAR',
    rate: 0.0,
    amplitude: 0.0,
    velocity_profile: 'NEW_PULSES_STOP_COAST_AND_SETTLE',
    deformation: 'EQUILIBRIUM_LATTICE'
  })
});

/**
 * Classifies a carrier index into its exact depth plane, counts, opacity,
 * depth gain, font size, and carrier color.
 *
 * Law: CARRIER_COUNT != CSS_OPACITY != MOTION_DEPTH_GAIN != RENDERED_SCALE
 */
export function classifyCarrier(index, count = CARRIER_COUNT) {
  if (!Number.isInteger(index) || index < 0 || index >= count) {
    throw new RangeError(`Carrier index must be integer in [0, ${count - 1}], got ${index}`);
  }
  const near = index % 13 === 0 || index % 11 === 0;
  const mid = !near && (index % 4 === 0 || index % 7 === 0);
  const plane = near ? 'flight-near' : mid ? 'flight-mid' : 'flight-far';

  const cssOpacity = near ? CSS_OPACITY_NEAR : mid ? CSS_OPACITY_MID : CSS_OPACITY_FAR;
  const depthGain = near ? MOTION_DEPTH_GAIN_NEAR : mid ? MOTION_DEPTH_GAIN_MID : MOTION_DEPTH_GAIN_FAR;
  const fontSize = near
    ? (index % 13 === 0 ? FONT_SIZE_NEAR_PRIMARY : FONT_SIZE_NEAR_SECONDARY)
    : mid ? FONT_SIZE_MID : FONT_SIZE_FAR;

  const color = index % 9 === 0 ? '#f3bd86' : index % 5 === 0 ? '#9ce7e4' : '#b69be9';

  return Object.freeze({
    index,
    count,
    plane,
    near,
    mid,
    far: !near && !mid,
    css_opacity: cssOpacity,
    depth_gain: depthGain,
    font_size: fontSize,
    color
  });
}

/**
 * Verifies that the full 39-carrier distribution conforms exactly to 6 near / 13 mid / 20 far.
 */
export function getCarrierRoster(count = CARRIER_COUNT) {
  const roster = Array.from({ length: count }, (_, i) => classifyCarrier(i, count));
  const nearCount = roster.filter(c => c.near).length;
  const midCount = roster.filter(c => c.mid).length;
  const farCount = roster.filter(c => c.far).length;

  if (count === CARRIER_COUNT) {
    if (nearCount !== NEAR_CARRIER_COUNT || midCount !== MID_CARRIER_COUNT || farCount !== FAR_CARRIER_COUNT) {
      throw new Error(`Carrier distribution mismatch: expected 6/13/20, got ${nearCount}/${midCount}/${farCount}`);
    }
  }

  return Object.freeze(roster);
}

/**
 * Normalizes a relation key into canonical Flow-Core semantic entry.
 */
export function resolveCanonicalRelation(relationKey) {
  const key = String(relationKey || '').trim().toLowerCase();
  const entry = getFlowcoreGlyphSemantic(key);
  if (!entry) {
    throw new TypeError(`Unknown Flow-Core relation key: ${relationKey}`);
  }
  return { key, entry };
}

/**
 * Builds a typed MotionPresentationDescriptor from a FlowCoreRelationState.
 *
 * FlowCoreRelationState -> MotionPresentationDescriptor
 *
 * Primary law: CANONICAL_RELATION -> VISUAL_INTERPRETATION
 * Motion interpretation does not redefine canonical semantics.
 */
export function buildMotionPresentationDescriptor(relationState = {}, options = {}) {
  const relationKey = relationState.relation_key || relationState.key || 'structural_rest';
  const { key, entry } = resolveCanonicalRelation(relationKey);

  const binding = PROPOSED_AESTHETIC_BINDINGS[key] || PROPOSED_AESTHETIC_BINDINGS.structural_rest;
  const progress = Math.max(0, Math.min(1, Number(relationState.progress ?? 1)));
  const reducedMotion = Boolean(options.reducedMotion || relationState.reduced_motion);
  const isRest = key === 'structural_rest';

  // Settling behavior for rest: coast and settle existing movement
  const settlingDurationMs = 800;
  const settlingBehavior = isRest
    ? Object.freeze({
        mode: 'COAST_AND_SETTLE',
        new_pulses_stopped: true,
        final_state_inspectable: true,
        settling_window_ms: settlingDurationMs,
        damping_factor: 0.92
      })
    : Object.freeze({
        mode: 'ACTIVE_GOVERNED_TRANSIT',
        new_pulses_stopped: false,
        final_state_inspectable: false,
        settling_window_ms: 0,
        damping_factor: 1.0
      });

  // Consequence discriminability metrics
  const discriminability = Object.freeze({
    vector_class:
      key === 'recurrence' ? 'RADIAL_PULSE_DIVERGENCE' :
      key === 'gathering' ? 'INWARD_CENTRIPETAL_CONVERGENCE' :
      key === 'release' ? 'OUTWARD_CENTRIFUGAL_EXPANSION' :
      key === 'bounded_emergence' ? 'ROTATIONAL_AZIMUTHAL_BLOOM' :
      key === 'protected_continuity' ? 'CONTRACTED_LOW_ENERGY_ORBIT' :
      key === 'created_potential' ? 'VERTICAL_ASCENT_LIFT' :
      key === 'released_tendency' ? 'VERTICAL_DESCENT_GROUNDING' :
      'QUIESCENT_LATTICE_EQUILIBRIUM',
    directional_axis:
      key === 'created_potential' || key === 'released_tendency' ? 'VERTICAL_Y' :
      key === 'release' ? 'HORIZONTAL_X_SHEAR' :
      key === 'gathering' || key === 'recurrence' ? 'RADIAL_XY' :
      key === 'bounded_emergence' ? 'ANGULAR_THETA' :
      key === 'protected_continuity' ? 'ELLIPTICAL_BOUNDED' :
      'STATIONARY_REST',
    dignity_standard: 'CONSEQUENCE_BEFORE_NAMING'
  });

  // Static equivalent for reduced motion
  const staticEquivalent = Object.freeze({
    reduced_motion_active: reducedMotion,
    inspectable_frame: true,
    relation_preserved: entry.semantic_relation,
    glyph_preserved: entry.glyph,
    vector_hint: discriminability.vector_class,
    carrier_disposition: 'ARCHITECTURAL_STATIC_GRID'
  });

  const descriptor = {
    schema: MOTION_PRESENTATION_DESCRIPTOR_SCHEMA,
    relation_id: key,
    canonical_glyph: entry.glyph,
    semantic_relation: entry.semantic_relation,
    questions: entry.questions,
    proposed_binding: binding,
    progress,
    reduced_motion: reducedMotion,
    velocity_profile: binding.velocity_profile,
    amplitude: reducedMotion ? 0 : binding.amplitude,
    depth_response: Object.freeze({
      near: MOTION_DEPTH_GAIN_NEAR,
      mid: MOTION_DEPTH_GAIN_MID,
      far: MOTION_DEPTH_GAIN_FAR
    }),
    deformation_family: binding.deformation,
    settling_behavior: settlingBehavior,
    discriminability,
    static_equivalent: staticEquivalent,
    claim_ceiling: CLAIM_CEILING_MOTION_BRIDGE,
    ambient_contribution_allowed: !isRest,
    authority: Object.freeze({
      commands_station: false,
      automatic_ash_action: false,
      release_authorized: false,
      human_closure_required: true
    })
  };

  return Object.freeze(descriptor);
}

/**
 * Evaluates individual carrier geometry (position, roll, scale, opacity)
 * for a specific carrier under the motion presentation descriptor.
 *
 * Deterministic with respect to (descriptor, carrier, seconds, viewport, seed).
 */
export function evaluateCarrier(carrierInput, descriptor, options = {}) {
  const carrier = typeof carrierInput === 'number'
    ? classifyCarrier(carrierInput)
    : carrierInput;

  const seconds = Number.isFinite(options.timeSeconds) ? Math.max(0, options.timeSeconds) : 0;
  const viewport = options.viewport || { width: 1000, height: 520 };
  const compact = Number(viewport.width || 1000) <= 760;
  const reducedMotion = descriptor.reduced_motion === true || options.reducedMotion === true;

  const i = carrier.index;
  const count = carrier.count || CARRIER_COUNT;
  const seed = (i + 0.5) / count;
  const relationKey = descriptor.relation_id;
  const pBinding = descriptor.proposed_binding;

  // Viewport center baseline
  const cx = 500;
  const cy = 260;

  // Reduced motion: deterministic static architectural positioning
  if (reducedMotion) {
    const cols = compact ? 5 : 7;
    const col = i % cols;
    const row = Math.floor(i / cols);
    const spacingX = compact ? 88 : 124;
    const spacingY = compact ? 86 : 74;
    const startX = compact ? 220 : 128;
    const startY = compact ? 120 : 112;

    const staticX = startX + col * spacingX;
    const staticY = startY + row * spacingY;
    const staticRoll = (col - Math.floor(cols / 2)) * 2.5;
    const staticScale = carrier.near ? 1.25 : carrier.mid ? 0.95 : 0.72;
    const staticOpacity = carrier.css_opacity;

    return Object.freeze({
      carrier,
      x: Math.round(staticX * 100) / 100,
      y: Math.round(staticY * 100) / 100,
      roll: Math.round(staticRoll * 100) / 100,
      scale: Math.round(staticScale * 1000) / 1000,
      opacity: Math.round(staticOpacity * 1000) / 1000,
      plane: carrier.plane,
      glyph: descriptor.canonical_glyph,
      color: carrier.color,
      font_size: carrier.font_size,
      reduced_motion: true
    });
  }

  // Active / dynamic motion evaluation
  const rate = pBinding.rate || 0.03;
  const t = seconds * rate;
  const progress = descriptor.progress;
  const lane = (i % 9) - 4;

  let x = cx;
  let y = cy;
  let roll = 0;
  let scale = 0.5 + (i % 9) * 0.06;
  let opacity = 1.0;

  if (relationKey === 'gathering') {
    // Inward convergence from periphery toward focal center
    const phase = ((seed + t * 2.8) % 1 + 1) % 1;
    const radius = (1 - phase) * 580 + 42;
    const angle = i * 2.3999632297 + seconds * 0.08;
    x = cx + Math.cos(angle) * radius;
    y = cy + Math.sin(angle) * radius * 0.44;
    roll = (1 - phase) * 20 * (i % 2 ? 1 : -1);
    scale = 0.44 + phase * 0.56;
    opacity = 0.2 + phase * 0.8;
  } else if (relationKey === 'recurrence') {
    // Harmonic radial/orbital pulsation with divergence pause
    const phase = ((seed + t * 1.8) % 1 + 1) % 1;
    const orbit = 160 + (i % 7) * 36;
    const angle = phase * Math.PI * 2 + i * 0.61;
    x = cx + Math.cos(angle) * orbit * 1.4;
    y = cy + Math.sin(angle) * orbit * 0.55;
    roll = Math.sin(angle) * 14;
    scale = 0.48 + (Math.sin(angle * 2) * 0.5 + 0.5) * 0.4;
  } else if (relationKey === 'release') {
    // Outward directional egress and expansion beyond bounds
    const phase = ((seed + t * 3.2) % 1 + 1) % 1;
    x = cx + (phase - 0.1) * 780 * (i % 2 ? 1 : -1);
    y = cy + lane * 40 + Math.sin(phase * Math.PI + i) * 32;
    roll = (i % 2 ? 1 : -1) * (10 + phase * 26);
    scale = 0.52 + phase * 0.45;
    opacity = phase > 0.8 ? (1 - phase) / 0.2 : 0.85;
  } else if (relationKey === 'bounded_emergence') {
    // Rotational blooming around axes; widening corona
    const phase = ((seed + t * 2.4) % 1 + 1) % 1;
    const angle = i * 2.3999632297 + seconds * 0.05;
    const radius = 32 + phase * (340 + (i % 6) * 40);
    x = cx + Math.cos(angle) * radius * 1.4;
    y = cy + Math.sin(angle) * radius * 0.56;
    roll = phase * 22 * (i % 2 ? 1 : -1);
    scale = 0.46 + phase * 0.75;
  } else if (relationKey === 'protected_continuity') {
    // Contracted living boundary, low-energy steady orbit
    const phase = ((seed + t * 1.2) % 1 + 1) % 1;
    const angle = phase * Math.PI * 2 + i * 0.48;
    const radius = 175 + (i % 5) * 24;
    x = cx + Math.cos(angle) * radius;
    y = cy + Math.sin(angle) * radius * 0.44;
    roll = Math.sin(angle) * 4;
    scale = 0.52 + (i % 4) * 0.06;
    opacity = 0.68;
  } else if (relationKey === 'created_potential') {
    // Bounded vertical ascent (lift)
    const phase = ((seed + t * 2.6) % 1 + 1) % 1;
    x = cx + lane * 54 + Math.sin(i * 0.73 + seconds * 0.16) * 24;
    y = 560 - phase * 640;
    roll = Math.sin(i + phase * Math.PI) * 8;
    scale = 0.44 + phase * 0.55;
  } else if (relationKey === 'released_tendency') {
    // Bounded vertical descent (grounding/return)
    const phase = ((seed + t * 2.8) % 1 + 1) % 1;
    x = cx + lane * 56 + Math.sin(i * 0.53 + seconds * 0.15) * 26;
    y = -60 + phase * 680;
    roll = Math.sin(i + phase * Math.PI) * 10;
    scale = 1.0 - phase * 0.35;
  } else if (relationKey === 'structural_rest') {
    // 𝄐 Canonical structural rest: new pulses stop, existing movement coast & settles
    const angle = i * 2.3999632297;
    const radius = 112 + (i % 7) * 22;
    // Settling decay: settles to quiet stationary equilibrium
    const settleDecay = Math.max(0, 1 - (options.settledRatio ?? 1));
    const settlePulse = settleDecay * Math.sin(seconds * 1.2 + i) * 14;
    x = cx + Math.cos(angle) * radius * 1.2 + settlePulse;
    y = cy + Math.sin(angle) * radius * 0.46;
    roll = settleDecay * Math.sin(angle) * 5;
    scale = 0.44 + (i % 5) * 0.05;
    opacity = 0.52;
  }

  // Sample live heterostratigraphic Dome-Art lattice potential
  // In structural rest, ambient motion settles to stationary equilibrium (effectiveT -> 0)
  const isRest = relationKey === 'structural_rest';
  const restDecay = isRest ? Math.max(0, 1 - (options.settledRatio ?? 1)) : 1;
  const effectiveT = isRest ? restDecay * t : t;
  const latticeOptions = { phase: seed * Math.PI * 2 + effectiveT * 0.37, theta: 0.055 };
  const sampleX = x - cx;
  const sampleY = y - cy;
  const lattice = computeHeterostratigraphicPotential(sampleX, sampleY, latticeOptions);
  const gradient = computeGradientMisfit(sampleX, sampleY, latticeOptions);

  const moire = lattice.triangular;
  const quasi = lattice.quasiperiodic;
  const [tx, ty] = gradient.g_triangular;
  const [qx, qy] = gradient.g_quasiperiodic;
  const torsion = Math.max(-1, Math.min(1, (tx * qy - ty * qx) * 1024));
  const shear = Math.max(-1, Math.min(1, (tx - qx) * 32));

  // Depth response: multiply depthGain by deformation coordinates
  const depthGain = carrier.depth_gain;
  const dx = depthGain * (moire * 12 + quasi * 8 + shear * 4);
  const dy = depthGain * (moire * 8 - quasi * 10 + torsion * 6);
  x += dx;
  y += dy;
  roll += depthGain * torsion * 6;
  scale *= 1 + depthGain * 0.06 * quasi;

  // Scale and opacity adjustments according to depth plane
  if (carrier.near) {
    scale *= 1.45;
    opacity = Math.min(1.0, opacity * carrier.css_opacity * 2.5);
  } else if (carrier.mid) {
    scale *= 1.05;
    opacity = Math.min(0.72, opacity * carrier.css_opacity * 2.2);
  } else {
    scale *= 0.85;
    opacity = Math.min(0.42, Math.max(0.08, opacity * carrier.css_opacity * 1.8));
  }

  return Object.freeze({
    carrier,
    x: Math.round(x * 100) / 100,
    y: Math.round(y * 100) / 100,
    roll: Math.round(roll * 100) / 100,
    scale: Math.max(0.1, Math.round(scale * 1000) / 1000),
    opacity: Math.max(0.04, Math.min(1.0, Math.round(opacity * 1000) / 1000)),
    plane: carrier.plane,
    glyph: descriptor.canonical_glyph,
    color: carrier.color,
    font_size: carrier.font_size,
    reduced_motion: false
  });
}

/**
 * Evaluates all 39 carriers for the given descriptor and options.
 */
export function evaluateAllCarriers(descriptor, options = {}) {
  const roster = getCarrierRoster(CARRIER_COUNT);
  return Object.freeze(roster.map(carrier => evaluateCarrier(carrier, descriptor, options)));
}

/**
 * Target coordinator implementation:
 *
 * renderDomeArt(viewId, worldSnapshot, viewport, time)
 *
 * Laws:
 * - One world-state snapshot per render.
 * - One animation clock (time).
 * - No component-local animation clocks.
 * - Hidden views draw zero (hidden_views_draw_zero: true).
 * - Deterministic output.
 */
export function renderDomeArt(viewId, worldSnapshot = {}, viewport = {}, time = 0) {
  const targetViewId = String(viewId || 'cockpit');
  const activeViewId = worldSnapshot.activeViewId || targetViewId;
  const isActive = activeViewId === targetViewId;

  const vpWidth = Number(viewport.width || 1000);
  const vpHeight = Number(viewport.height || 520);
  const dpr = Number(viewport.dpr || viewport.devicePixelRatio || 1);
  const compact = vpWidth <= 760;
  const isPortraitMobile = vpWidth <= 420;

  const reducedMotion = Boolean(
    worldSnapshot.reducedMotion ||
    viewport.reducedMotion ||
    worldSnapshot.preferences?.reducedMotion
  );

  // If view is hidden or inactive, perform strictly ZERO drawing work
  if (!isActive) {
    return Object.freeze({
      schema: RENDER_DOME_ART_FRAME_SCHEMA,
      view_id: targetViewId,
      active: false,
      draw: false,
      hidden_view_reason: 'INACTIVE_DOME_VIEW',
      hidden_views_draw_count: 0,
      carriers: Object.freeze([]),
      draw_commands: Object.freeze([]),
      scheduler: Object.freeze({
        coordinator: 'renderDomeArt',
        owns_animation_loop: false,
        hidden_views_draw_zero: true,
        one_clock: true
      }),
      authority: Object.freeze({
        commands_station: false,
        automatic_ash_action: false,
        release_authorized: false,
        human_closure_required: true
      })
    });
  }

  // Active view: consume worldSnapshot relation state
  const relationState = worldSnapshot.relationState || {
    relation_key: worldSnapshot.relation_key || 'structural_rest',
    progress: worldSnapshot.progress ?? 1
  };

  const descriptor = buildMotionPresentationDescriptor(relationState, { reducedMotion });
  const timeSeconds = reducedMotion ? 0 : Number(time) / 1000;

  // Evaluate all 39 carriers
  const evaluatedCarriers = evaluateAllCarriers(descriptor, {
    timeSeconds,
    viewport: { width: vpWidth, height: vpHeight, dpr },
    reducedMotion
  });

  const drawCommands = [
    { channel: 'flight-layer', count: CARRIER_COUNT, planes: ['flight-near', 'flight-mid', 'flight-far'] },
    { channel: 'glyph', glyph: descriptor.canonical_glyph, relation: descriptor.relation_id },
    { channel: 'inspection', inspectable: true }
  ];

  return Object.freeze({
    schema: RENDER_DOME_ART_FRAME_SCHEMA,
    view_id: targetViewId,
    active: true,
    draw: true,
    descriptor,
    carriers: evaluatedCarriers,
    draw_commands: Object.freeze(drawCommands),
    viewport: Object.freeze({
      width: vpWidth,
      height: vpHeight,
      dpr,
      compact,
      is_portrait_mobile: isPortraitMobile,
      viewBox: compact ? '200 -220 600 1120' : '0 0 1000 520'
    }),
    scheduler: Object.freeze({
      coordinator: 'renderDomeArt',
      owns_animation_loop: false,
      hidden_views_draw_zero: true,
      one_clock: true,
      time_ms: Number(time) || 0
    }),
    reduced_motion: reducedMotion,
    claim_ceiling: CLAIM_CEILING_MOTION_BRIDGE,
    authority: Object.freeze({
      commands_station: false,
      automatic_ash_action: false,
      release_authorized: false,
      human_closure_required: true
    })
  });
}

/**
 * Generates an inspectable SVG string from a rendered frame.
 * Compatible with node/browser environments for visual witnessing and test assertions.
 */
export function generateSvgSnapshot(frame) {
  if (!frame || !frame.draw || !Array.isArray(frame.carriers)) {
    return '<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0"></svg>';
  }

  const vp = frame.viewport || { width: 1000, height: 520, viewBox: '0 0 1000 520' };
  const viewBox = vp.viewBox || '0 0 1000 520';

  const carriersXml = frame.carriers.map(c => {
    const tr = `translate(${c.x} ${c.y}) rotate(${c.roll}) scale(${c.scale}) translate(${-c.x} ${-c.y})`;
    return `    <text x="${c.x}" y="${c.y}" font-size="${c.font_size}" fill="${c.color}" class="${c.plane}" opacity="${c.opacity}" transform="${tr}" text-anchor="middle" dominant-baseline="middle">${c.glyph}</text>`;
  }).join('\n');

  const glyph = frame.descriptor?.canonical_glyph || '';
  const relation = frame.descriptor?.relation_id || 'rest';
  const viewId = frame.view_id || 'unknown';
  const nearCount = frame.carriers.filter(c => c.carrier?.near).length;
  const midCount = frame.carriers.filter(c => c.carrier?.mid).length;
  const farCount = frame.carriers.filter(c => c.carrier?.far).length;
  const totalCount = frame.carriers.length;
  const reduced = Boolean(frame.reduced_motion);

  return `<!--
  TD613 Flow-Core Semantic Motion Bridge Visual Witness
  Relation: ${relation} (${glyph})
  Active View ID: ${viewId}
  Carrier Count: ${totalCount} (Distribution: ${nearCount} near / ${midCount} mid / ${farCount} far)
  Reduced Motion: ${reduced ? 'ENABLED' : 'DISABLED'}
  Viewport: ${vp.width}x${vp.height} (viewBox: ${viewBox})
  Claim Ceiling: VISUAL_RELATION != EXTERNAL_REALITY | AMBIENT_MOTION != EVENT_HISTORY | AESTHETIC_BINDING != EMPIRICAL_VALIDATION
-->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="${vp.width}" height="${vp.height}" style="background:#0a0a0c;">
  <style>
    .flight-near { font-family: 'JetBrains Mono', 'PingFang SC', monospace; font-weight: bold; }
    .flight-mid  { font-family: 'JetBrains Mono', 'PingFang SC', monospace; }
    .flight-far  { font-family: 'JetBrains Mono', 'PingFang SC', monospace; opacity: 0.20; }
  </style>
  <g class="loom-field-flight" aria-hidden="true" data-active-relation="${relation}">
${carriersXml}
  </g>
  <g class="loom-field-center-glyph" text-anchor="middle" dominant-baseline="middle">
    <text x="500" y="260" font-size="140" fill="#f4f4f0" opacity="0.88">${glyph}</text>
    <text x="500" y="360" font-size="18" fill="#d97706" letter-spacing="2" opacity="0.95">${relation.toUpperCase()}</text>
  </g>
</svg>`;
}
