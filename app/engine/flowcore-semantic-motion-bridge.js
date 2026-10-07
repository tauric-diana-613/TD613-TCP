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

// Tranche 2B Visual Director directions
export const DIRECTOR_DIRECTIONS = Object.freeze([
  'diagnostic',
  'lithic_tectonic',
  'organza_choreography',
  'aperture_monochrome'
]);

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
 * Computes the director manifestation metadata for a logical carrier.
 * Under Tranche 2B, logical carriers may manifest as monolith incisions,
 * shear planes, moire pleat fins, silk ribbons, or radar telemetry crosshairs.
 */
export function computeDirectorManifestation(carrier, descriptor, style = 'diagnostic') {
  const i = carrier.index;
  const glyph = descriptor.canonical_glyph;
  const rel = descriptor.relation_id;

  if (style === 'lithic_tectonic') {
    if (carrier.near) {
      return Object.freeze({
        style: 'lithic_tectonic',
        type: 'MONOLITH_INCISION',
        label: `SEC6//MONO-0${i}`,
        glyph_fragment: glyph,
        material: 'RAW_BONE_BASALT',
        accent_color: '#e2b714',
        border_width: 1.5,
        elevation: 'HIGH_RELIEF'
      });
    } else if (carrier.mid) {
      return Object.freeze({
        style: 'lithic_tectonic',
        type: 'TECTONIC_SHEAR_PLANE',
        label: `ΔX-${i}`,
        glyph_fragment: glyph,
        material: 'OXIDIZED_SILVER_PLANE',
        accent_color: '#8b95a5',
        border_width: 1.0,
        elevation: 'SHEAR_DATUM'
      });
    } else {
      return Object.freeze({
        style: 'lithic_tectonic',
        type: 'LATTICE_BASALT_SHARD',
        label: `PT-${i}`,
        glyph_fragment: glyph,
        material: 'BASALT_FRACTURE_SHARD',
        accent_color: '#566171',
        border_width: 0.5,
        elevation: 'SUBTERRANEAN_BED'
      });
    }
  }

  if (style === 'organza_choreography') {
    if (carrier.near) {
      return Object.freeze({
        style: 'organza_choreography',
        type: 'COUTURE_LIGAMENT',
        label: `SILK-SWEEP-0${i}`,
        glyph_fragment: glyph,
        material: 'TRANSLUCENT_SILK_ORGANZA',
        accent_color: '#c4b5fd',
        secondary_color: '#f43f5e',
        weight: 'BILLOWING_RIBBON',
        elevation: 'RUNWAY_FOREGROUND'
      });
    } else if (carrier.mid) {
      return Object.freeze({
        style: 'organza_choreography',
        type: 'MOIRE_PLEAT_FIN',
        label: `PLEAT-${i}`,
        glyph_fragment: glyph,
        material: 'IRIDESCENT_MOIRE_MEMBRANE',
        accent_color: '#f59e0b',
        secondary_color: '#c4b5fd',
        weight: 'PLEATED_INTERFERENCE',
        elevation: 'MID_DRAPERY'
      });
    } else {
      return Object.freeze({
        style: 'organza_choreography',
        type: 'SILK_DUST_WHISPER',
        label: `DUST-${i}`,
        glyph_fragment: glyph,
        material: 'GOSSAMER_MICRO_FILAMENT',
        accent_color: '#e9d5ff',
        secondary_color: '#a855f7',
        weight: 'SUSPENDED_PARTICLE',
        elevation: 'THEATRICAL_DEPTH'
      });
    }
  }

  if (style === 'aperture_monochrome') {
    if (carrier.near) {
      return Object.freeze({
        style: 'aperture_monochrome',
        type: 'PHOSPHOR_APERTURE_GATE',
        label: `GATE-N0${i}`,
        glyph_fragment: glyph,
        material: 'HIGH_VOLTAGE_PHOSPHOR_STENCIL',
        accent_color: '#00f0a8',
        telemetry: `FREQ:613 // STAT:LOCK`,
        elevation: 'OPTICAL_RETICLE_PRIMARY'
      });
    } else if (carrier.mid) {
      return Object.freeze({
        style: 'aperture_monochrome',
        type: 'VECTOR_TELEMETRY_CROSSHAIR',
        label: `TRK-M${i}`,
        glyph_fragment: glyph,
        material: 'CATHODE_VERNIER_SCALE',
        accent_color: '#22d3ee',
        telemetry: `AZ:${(i * 9.2).toFixed(1)}°`,
        elevation: 'RADAR_BEARING_INTERMEDIATE'
      });
    } else {
      return Object.freeze({
        style: 'aperture_monochrome',
        type: 'CATHODE_ECHO_BLIP',
        label: `ECHO-${i}`,
        glyph_fragment: glyph,
        material: 'PHASED_SURVEILLANCE_ECHO',
        accent_color: '#10b981',
        telemetry: `D:${(i * 14.5).toFixed(0)}km`,
        elevation: 'BACKGROUND_SWEEP_FIELD'
      });
    }
  }

  return Object.freeze({
    style: 'diagnostic',
    type: 'GLYPH_CARRIER',
    label: `CARRIER-${i}`,
    glyph_fragment: glyph,
    material: 'DIAGNOSTIC_TYPOGRAPHIC_FIELD',
    accent_color: carrier.color,
    elevation: carrier.plane
  });
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
  const directorDirection = options.directorDirection || options.style || 'diagnostic';

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
      manifestation: computeDirectorManifestation(carrier, descriptor, directorDirection),
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
    manifestation: computeDirectorManifestation(carrier, descriptor, directorDirection),
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
  const directorDirection = String(
    worldSnapshot.directorDirection ||
    worldSnapshot.direction ||
    viewport.directorDirection ||
    'diagnostic'
  ).toLowerCase();

  // Evaluate all 39 carriers
  const evaluatedCarriers = evaluateAllCarriers(descriptor, {
    timeSeconds,
    viewport: { width: vpWidth, height: vpHeight, dpr },
    reducedMotion,
    directorDirection
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
    director_direction: directorDirection,
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
 * Generates the baseline diagnostic SVG witness.
 */
export function renderDiagnosticSvg(frame) {
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

/**
 * Direction 1: Lithic Tectonic (Basalt & Shard Observatory)
 * Architectural brutalism, monolithic slabs, high-relief cuts, and ruled shear lines.
 */
export function renderLithicTectonicSvg(frame) {
  const vp = frame.viewport || { width: 1000, height: 520, viewBox: '0 0 1000 520' };
  const viewBox = vp.viewBox || '0 0 1000 520';
  const glyph = frame.descriptor?.canonical_glyph || '';
  const relation = frame.descriptor?.relation_id || 'rest';
  const viewId = frame.view_id || 'unknown';
  const nearCount = frame.carriers.filter(c => c.carrier?.near).length;
  const midCount = frame.carriers.filter(c => c.carrier?.mid).length;
  const farCount = frame.carriers.filter(c => c.carrier?.far).length;
  const totalCount = frame.carriers.length;
  const reduced = Boolean(frame.reduced_motion);

  const carriersXml = frame.carriers.map(c => {
    const tr = `translate(${c.x} ${c.y}) rotate(${c.roll}) scale(${c.scale}) translate(${-c.x} ${-c.y})`;
    if (c.carrier.near) {
      return `    <g class="lithic-near" transform="${tr}">
      <rect x="${c.x - 42}" y="${c.y - 24}" width="84" height="48" fill="#141822" stroke="#e2b714" stroke-width="1.2" opacity="${c.opacity}" rx="2"/>
      <line x1="${c.x - 42}" y1="${c.y}" x2="${c.x + 42}" y2="${c.y}" stroke="#e2b714" stroke-width="0.5" stroke-dasharray="2 2" opacity="0.5"/>
      <text x="${c.x}" y="${c.y + 8}" font-size="28" font-family="'Cinzel', 'Noto Serif SC', 'PingFang SC', serif" font-weight="900" fill="#ede9e3" opacity="${c.opacity}" text-anchor="middle" dominant-baseline="middle">${c.glyph}</text>
      <text x="${c.x + 32}" y="${c.y - 14}" font-size="7" font-family="'JetBrains Mono', monospace" fill="#e2b714" opacity="0.9">P${c.carrier.index}</text>
    </g>`;
    }
    if (c.carrier.mid) {
      return `    <g class="lithic-mid" transform="${tr}">
      <line x1="${c.x - 28}" y1="${c.y}" x2="${c.x + 28}" y2="${c.y}" stroke="#8b95a5" stroke-width="1" opacity="${c.opacity}"/>
      <circle cx="${c.x}" cy="${c.y}" r="2.5" fill="#8b95a5" opacity="${c.opacity}"/>
      <text x="${c.x + 8}" y="${c.y - 6}" font-size="14" font-family="'PingFang SC', monospace" fill="#8b95a5" opacity="${c.opacity}">${c.glyph}</text>
      <text x="${c.x - 26}" y="${c.y - 4}" font-size="6" font-family="'JetBrains Mono', monospace" fill="#566171">Δ${c.carrier.index}</text>
    </g>`;
    }
    return `    <g class="lithic-far" transform="${tr}">
      <polygon points="${c.x},${c.y - 5} ${c.x + 4},${c.y + 3} ${c.x - 4},${c.y + 3}" fill="#2a303c" stroke="#3d4656" stroke-width="0.5" opacity="${c.opacity * 0.8}"/>
      <text x="${c.x}" y="${c.y + 4}" font-size="10" font-family="'PingFang SC', monospace" fill="#64748b" opacity="${c.opacity}">${c.glyph}</text>
    </g>`;
  }).join('\n');

  return `<!--
  TD613 Flow-Core Semantic Motion Bridge Visual Witness [Direction: Lithic Tectonic]
  Relation: ${relation} (${glyph})
  Active View ID: ${viewId}
  Carrier Count: ${totalCount} (Distribution: ${nearCount} near / ${midCount} mid / ${farCount} far)
  Reduced Motion: ${reduced ? 'ENABLED' : 'DISABLED'}
  Viewport: ${vp.width}x${vp.height} (viewBox: ${viewBox})
  Visual Theory: Architectural Basalt Monolith & High-Relief Tectonic Shard Observatory
  Claim Ceiling: VISUAL_RELATION != EXTERNAL_REALITY | AMBIENT_MOTION != EVENT_HISTORY | AESTHETIC_BINDING != EMPIRICAL_VALIDATION
-->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="${vp.width}" height="${vp.height}" style="background:#08090d;">
  <defs>
    <pattern id="lithicGrid" width="60" height="60" patternUnits="userSpaceOnUse">
      <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#161a24" stroke-width="0.6" stroke-dasharray="2 4"/>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#lithicGrid)" opacity="0.8"/>
  <g class="lithic-field-flight" aria-hidden="true" data-active-relation="${relation}" data-visual-direction="lithic_tectonic">
${carriersXml}
  </g>
  <g class="lithic-center-monolith" text-anchor="middle" dominant-baseline="middle">
    <rect x="415" y="175" width="170" height="170" fill="#10131c" stroke="#2c3444" stroke-width="1.5" rx="3" opacity="0.92"/>
    <rect x="420" y="180" width="160" height="160" fill="none" stroke="#e2b714" stroke-width="0.5" stroke-dasharray="3 3" opacity="0.4"/>
    <text x="500" y="255" font-size="104" font-family="'Cinzel', 'Noto Serif SC', 'PingFang SC', serif" font-weight="900" fill="#ede9e3" opacity="0.95">${glyph}</text>
    <text x="500" y="322" font-size="9" font-family="'JetBrains Mono', monospace" fill="#e2b714" letter-spacing="3" opacity="0.9">SEC6 // LITHIC-TECTONIC // ${relation.toUpperCase()}</text>
  </g>
</svg>`;
}

/**
 * Direction 2: Organza Choreography (Haute Couture Diaphanous Membrane & Moiré Veil)
 * Flowing calligraphic ribbons, fluted moiré pleats, and gossamer silk particles.
 */
export function renderOrganzaChoreographySvg(frame) {
  const vp = frame.viewport || { width: 1000, height: 520, viewBox: '0 0 1000 520' };
  const viewBox = vp.viewBox || '0 0 1000 520';
  const glyph = frame.descriptor?.canonical_glyph || '';
  const relation = frame.descriptor?.relation_id || 'rest';
  const viewId = frame.view_id || 'unknown';
  const nearCount = frame.carriers.filter(c => c.carrier?.near).length;
  const midCount = frame.carriers.filter(c => c.carrier?.mid).length;
  const farCount = frame.carriers.filter(c => c.carrier?.far).length;
  const totalCount = frame.carriers.length;
  const reduced = Boolean(frame.reduced_motion);

  const carriersXml = frame.carriers.map(c => {
    const tr = `translate(${c.x} ${c.y}) rotate(${c.roll}) scale(${c.scale}) translate(${-c.x} ${-c.y})`;
    if (c.carrier.near) {
      return `    <g class="organza-near" transform="${tr}" style="mix-blend-mode: screen;">
      <path d="M${c.x - 48},${c.y + 16} Q${c.x},${c.y - 30} ${c.x + 48},${c.y + 12}" fill="none" stroke="url(#silkRibbon)" stroke-width="2.6" opacity="${c.opacity * 0.95}"/>
      <path d="M${c.x - 44},${c.y + 20} Q${c.x + 4},${c.y - 26} ${c.x + 52},${c.y + 15}" fill="none" stroke="#f43f5e" stroke-width="0.8" opacity="${c.opacity * 0.6}"/>
      <text x="${c.x}" y="${c.y + 5}" font-size="32" font-family="'Bodoni Moda', 'Playfair Display', 'PingFang SC', serif" font-style="italic" fill="#fdf6e2" opacity="${c.opacity * 0.9}" text-anchor="middle" dominant-baseline="middle">${c.glyph}</text>
    </g>`;
    }
    if (c.carrier.mid) {
      return `    <g class="organza-mid" transform="${tr}">
      <ellipse cx="${c.x}" cy="${c.y}" rx="26" ry="11" fill="#c4b5fd" fill-opacity="${c.opacity * 0.15}" stroke="#c4b5fd" stroke-width="0.8" opacity="${c.opacity}"/>
      <line x1="${c.x - 18}" y1="${c.y}" x2="${c.x + 18}" y2="${c.y}" stroke="#f59e0b" stroke-width="0.6" opacity="${c.opacity * 0.7}"/>
      <text x="${c.x}" y="${c.y + 4}" font-size="15" font-family="'PingFang SC', sans-serif" fill="#fdf6e2" opacity="${c.opacity * 0.85}" text-anchor="middle" dominant-baseline="middle">${c.glyph}</text>
    </g>`;
    }
    return `    <g class="organza-far" transform="${tr}">
      <circle cx="${c.x}" cy="${c.y}" r="2" fill="#e9d5ff" opacity="${c.opacity * 0.9}"/>
      <circle cx="${c.x}" cy="${c.y}" r="6" fill="#c4b5fd" opacity="${c.opacity * 0.25}"/>
      <text x="${c.x + 6}" y="${c.y + 3}" font-size="9" font-family="'PingFang SC', sans-serif" fill="#a855f7" opacity="${c.opacity * 0.7}">${c.glyph}</text>
    </g>`;
  }).join('\n');

  return `<!--
  TD613 Flow-Core Semantic Motion Bridge Visual Witness [Direction: Organza Choreography]
  Relation: ${relation} (${glyph})
  Active View ID: ${viewId}
  Carrier Count: ${totalCount} (Distribution: ${nearCount} near / ${midCount} mid / ${farCount} far)
  Reduced Motion: ${reduced ? 'ENABLED' : 'DISABLED'}
  Viewport: ${vp.width}x${vp.height} (viewBox: ${viewBox})
  Visual Theory: Haute Couture Diaphanous Membrane, Moiré Pleats & Calligraphic Silk
  Claim Ceiling: VISUAL_RELATION != EXTERNAL_REALITY | AMBIENT_MOTION != EVENT_HISTORY | AESTHETIC_BINDING != EMPIRICAL_VALIDATION
-->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="${vp.width}" height="${vp.height}" style="background:#05040a;">
  <defs>
    <radialGradient id="organzaAura" cx="50%" cy="50%" r="55%">
      <stop offset="0%" stop-color="#2a1240" stop-opacity="0.45"/>
      <stop offset="60%" stop-color="#0e071c" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#05040a" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="silkRibbon" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#c4b5fd"/>
      <stop offset="50%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#f43f5e"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#organzaAura)"/>
  <g class="organza-field-flight" aria-hidden="true" data-active-relation="${relation}" data-visual-direction="organza_choreography">
${carriersXml}
  </g>
  <g class="organza-center-glyph" text-anchor="middle" dominant-baseline="middle">
    <circle cx="500" cy="260" r="82" fill="none" stroke="#f59e0b" stroke-width="0.8" stroke-dasharray="4 6" opacity="0.6"/>
    <circle cx="500" cy="260" r="92" fill="none" stroke="#c4b5fd" stroke-width="0.5" stroke-dasharray="2 4" opacity="0.4"/>
    <text x="500" y="268" font-size="118" font-family="'Bodoni Moda', 'Didot', 'PingFang SC', serif" font-style="italic" font-weight="300" fill="#fdf6e2" opacity="0.95">${glyph}</text>
    <text x="500" y="328" font-size="10" font-family="'Bodoni Moda', serif" font-style="italic" fill="#c4b5fd" letter-spacing="4" opacity="0.9">SEQUENCE 6 // HAUTE COUTURE // ${relation.toUpperCase()}</text>
  </g>
</svg>`;
}

/**
 * Direction 3: Aperture Monochrome / Radar Crypt
 * Cold-cathode phosphor, rotating sweep reticles, telemetric verniers, and surveillance echo blips.
 */
export function renderApertureMonochromeSvg(frame) {
  const vp = frame.viewport || { width: 1000, height: 520, viewBox: '0 0 1000 520' };
  const viewBox = vp.viewBox || '0 0 1000 520';
  const glyph = frame.descriptor?.canonical_glyph || '';
  const relation = frame.descriptor?.relation_id || 'rest';
  const viewId = frame.view_id || 'unknown';
  const nearCount = frame.carriers.filter(c => c.carrier?.near).length;
  const midCount = frame.carriers.filter(c => c.carrier?.mid).length;
  const farCount = frame.carriers.filter(c => c.carrier?.far).length;
  const totalCount = frame.carriers.length;
  const reduced = Boolean(frame.reduced_motion);

  const carriersXml = frame.carriers.map(c => {
    const tr = `translate(${c.x} ${c.y}) rotate(${c.roll}) scale(${c.scale}) translate(${-c.x} ${-c.y})`;
    if (c.carrier.near) {
      return `    <g class="radar-near" transform="${tr}">
      <circle cx="${c.x}" cy="${c.y}" r="24" fill="#021c13" fill-opacity="0.8" stroke="#00f0a8" stroke-width="1.4" opacity="${c.opacity}"/>
      <circle cx="${c.x}" cy="${c.y}" r="16" fill="none" stroke="#22d3ee" stroke-width="0.7" stroke-dasharray="2 3" opacity="${c.opacity}"/>
      <line x1="${c.x - 28}" y1="${c.y}" x2="${c.x + 28}" y2="${c.y}" stroke="#00f0a8" stroke-width="0.8" opacity="${c.opacity * 0.8}"/>
      <text x="${c.x}" y="${c.y + 6}" font-size="20" font-family="'JetBrains Mono', 'PingFang SC', monospace" font-weight="700" fill="#ffffff" opacity="${c.opacity}" text-anchor="middle" dominant-baseline="middle">${c.glyph}</text>
      <text x="${c.x + 16}" y="${c.y - 16}" font-size="6" font-family="'JetBrains Mono', monospace" fill="#00f0a8">N0${c.carrier.index}</text>
    </g>`;
    }
    if (c.carrier.mid) {
      return `    <g class="radar-mid" transform="${tr}">
      <line x1="${c.x - 12}" y1="${c.y}" x2="${c.x + 12}" y2="${c.y}" stroke="#22d3ee" stroke-width="0.8" opacity="${c.opacity}"/>
      <line x1="${c.x}" y1="${c.y - 12}" x2="${c.x}" y2="${c.y + 12}" stroke="#22d3ee" stroke-width="0.8" opacity="${c.opacity}"/>
      <circle cx="${c.x}" cy="${c.y}" r="5" fill="none" stroke="#fbbf24" stroke-width="0.6" opacity="${c.opacity}"/>
      <text x="${c.x + 8}" y="${c.y + 10}" font-size="11" font-family="'JetBrains Mono', 'PingFang SC', monospace" fill="#22d3ee" opacity="${c.opacity}">${c.glyph}</text>
      <text x="${c.x - 14}" y="${c.y - 6}" font-size="5" font-family="'JetBrains Mono', monospace" fill="#94a3b8">TRK-${c.carrier.index}</text>
    </g>`;
    }
    return `    <g class="radar-far" transform="${tr}">
      <rect x="${c.x - 2}" y="${c.y - 2}" width="4" height="4" fill="#00f0a8" opacity="${c.opacity * 0.9}"/>
      <circle cx="${c.x}" cy="${c.y}" r="6" fill="none" stroke="#00f0a8" stroke-width="0.4" stroke-dasharray="1 2" opacity="${c.opacity * 0.5}"/>
      <text x="${c.x + 5}" y="${c.y + 3}" font-size="9" font-family="'PingFang SC', monospace" fill="#10b981" opacity="${c.opacity * 0.7}">${c.glyph}</text>
    </g>`;
  }).join('\n');

  return `<!--
  TD613 Flow-Core Semantic Motion Bridge Visual Witness [Direction: Aperture Monochrome]
  Relation: ${relation} (${glyph})
  Active View ID: ${viewId}
  Carrier Count: ${totalCount} (Distribution: ${nearCount} near / ${midCount} mid / ${farCount} far)
  Reduced Motion: ${reduced ? 'ENABLED' : 'DISABLED'}
  Viewport: ${vp.width}x${vp.height} (viewBox: ${viewBox})
  Visual Theory: Cold-Cathode Radar Crypt, Telemetric Stencils & Phosphor Reticles
  Claim Ceiling: VISUAL_RELATION != EXTERNAL_REALITY | AMBIENT_MOTION != EVENT_HISTORY | AESTHETIC_BINDING != EMPIRICAL_VALIDATION
-->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="${vp.width}" height="${vp.height}" style="background:#020403;">
  <g class="radar-grid" opacity="0.25">
    <circle cx="500" cy="260" r="100" fill="none" stroke="#00f0a8" stroke-width="0.6" stroke-dasharray="3 3"/>
    <circle cx="500" cy="260" r="200" fill="none" stroke="#00f0a8" stroke-width="0.6" stroke-dasharray="3 3"/>
    <circle cx="500" cy="260" r="300" fill="none" stroke="#00f0a8" stroke-width="0.6" stroke-dasharray="3 3"/>
    <circle cx="500" cy="260" r="400" fill="none" stroke="#00f0a8" stroke-width="0.6" stroke-dasharray="3 3"/>
    <line x1="80" y1="260" x2="920" y2="260" stroke="#00f0a8" stroke-width="0.5"/>
    <line x1="500" y1="20" x2="500" y2="500" stroke="#00f0a8" stroke-width="0.5"/>
  </g>
  <g class="radar-field-flight" aria-hidden="true" data-active-relation="${relation}" data-visual-direction="aperture_monochrome">
${carriersXml}
  </g>
  <g class="radar-center-aperture" text-anchor="middle" dominant-baseline="middle">
    <circle cx="500" cy="260" r="68" fill="#021c13" stroke="#00f0a8" stroke-width="1.8" opacity="0.9"/>
    <circle cx="500" cy="260" r="58" fill="none" stroke="#22d3ee" stroke-width="0.6" stroke-dasharray="3 3" opacity="0.6"/>
    <text x="500" y="268" font-size="102" font-family="'JetBrains Mono', 'PingFang SC', monospace" font-weight="700" fill="#00f0a8" opacity="0.98">${glyph}</text>
    <text x="500" y="318" font-size="9" font-family="'JetBrains Mono', monospace" fill="#fbbf24" letter-spacing="3" opacity="0.9">AZ-352° // STAT:LOCK // ${relation.toUpperCase()}</text>
  </g>
</svg>`;
}

/**
 * Generates an inspectable SVG string from a rendered frame.
 * Dispatches to director visual renderers when specified.
 * Compatible with node/browser environments for visual witnessing and test assertions.
 */
export function generateSvgSnapshot(frame, options = {}) {
  if (!frame || !frame.draw || !Array.isArray(frame.carriers)) {
    return '<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0"></svg>';
  }

  const direction = options.directorDirection || frame.director_direction || 'diagnostic';
  if (direction === 'lithic_tectonic') {
    return renderLithicTectonicSvg(frame);
  }
  if (direction === 'organza_choreography') {
    return renderOrganzaChoreographySvg(frame);
  }
  if (direction === 'aperture_monochrome') {
    return renderApertureMonochromeSvg(frame);
  }
  return renderDiagnosticSvg(frame);
}
