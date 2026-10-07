import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

import {
  CARRIER_COUNT,
  NEAR_CARRIER_COUNT,
  MID_CARRIER_COUNT,
  FAR_CARRIER_COUNT,
  CSS_OPACITY_NEAR,
  CSS_OPACITY_MID,
  CSS_OPACITY_FAR,
  MOTION_DEPTH_GAIN_NEAR,
  MOTION_DEPTH_GAIN_MID,
  MOTION_DEPTH_GAIN_FAR,
  FONT_SIZE_NEAR_PRIMARY,
  FONT_SIZE_NEAR_SECONDARY,
  FONT_SIZE_MID,
  FONT_SIZE_FAR,
  CLAIM_CEILING_MOTION_BRIDGE,
  PROPOSED_AESTHETIC_BINDINGS,
  classifyCarrier,
  getCarrierRoster,
  resolveCanonicalRelation,
  buildMotionPresentationDescriptor,
  evaluateCarrier,
  evaluateAllCarriers,
  renderDomeArt,
  generateSvgSnapshot,
  DIRECTOR_DIRECTIONS,
  PRODUCT_JURISDICTIONS
} from '../app/engine/flowcore-semantic-motion-bridge.js';

import {
  FLOWCORE_GLYPH_REGISTRY
} from '../app/dome-world/data/flowcore-glyph-semantics-v01.js';

test('1. exactly 39 carriers in total', () => {
  const roster = getCarrierRoster();
  assert.equal(roster.length, 39);
  assert.equal(CARRIER_COUNT, 39);
  for (let i = 0; i < 39; i++) {
    const c = classifyCarrier(i);
    assert.equal(c.index, i);
    assert.equal(c.count, 39);
  }
});

test('2. exact 6 near / 13 mid / 20 far depth allocation', () => {
  const roster = getCarrierRoster();
  const nearCarriers = roster.filter(c => c.near);
  const midCarriers = roster.filter(c => c.mid);
  const farCarriers = roster.filter(c => c.far);

  assert.equal(nearCarriers.length, 6, 'near plane must contain exactly 6 carriers');
  assert.equal(midCarriers.length, 13, 'mid plane must contain exactly 13 carriers');
  assert.equal(farCarriers.length, 20, 'far plane must contain exactly 20 carriers');
  assert.equal(nearCarriers.length + midCarriers.length + farCarriers.length, 39);

  // Verify the exact classification rule
  // near: i % 13 === 0 || i % 11 === 0
  const expectedNearIndices = [0, 11, 13, 22, 26, 33];
  assert.deepEqual(nearCarriers.map(c => c.index), expectedNearIndices);
});

test('3. distinct coordinates: CARRIER_COUNT != CSS_OPACITY != MOTION_DEPTH_GAIN != RENDERED_SCALE', () => {
  // Counts: 6, 13, 20
  assert.equal(NEAR_CARRIER_COUNT, 6);
  assert.equal(MID_CARRIER_COUNT, 13);
  assert.equal(FAR_CARRIER_COUNT, 20);

  // CSS Opacities: .38, .24, .20
  assert.equal(CSS_OPACITY_NEAR, 0.38);
  assert.equal(CSS_OPACITY_MID, 0.24);
  assert.equal(CSS_OPACITY_FAR, 0.20);

  // Motion depth gains: 1.35, .82, .46
  assert.equal(MOTION_DEPTH_GAIN_NEAR, 1.35);
  assert.equal(MOTION_DEPTH_GAIN_MID, 0.82);
  assert.equal(MOTION_DEPTH_GAIN_FAR, 0.46);

  // Rendered font sizes: 184/132, 56, 26
  const c0 = classifyCarrier(0); // i % 13 === 0 -> 184
  const c11 = classifyCarrier(11); // i % 11 === 0 -> 132
  const c4 = classifyCarrier(4); // mid -> 56
  const c1 = classifyCarrier(1); // far -> 26

  assert.equal(c0.font_size, FONT_SIZE_NEAR_PRIMARY);
  assert.equal(c11.font_size, FONT_SIZE_NEAR_SECONDARY);
  assert.equal(c4.font_size, FONT_SIZE_MID);
  assert.equal(c1.font_size, FONT_SIZE_FAR);

  // None of these four dimensions are equal
  assert.notEqual(NEAR_CARRIER_COUNT, CSS_OPACITY_NEAR);
  assert.notEqual(CSS_OPACITY_NEAR, MOTION_DEPTH_GAIN_NEAR);
  assert.notEqual(MOTION_DEPTH_GAIN_NEAR, FONT_SIZE_NEAR_PRIMARY);
});

test('4. canonical eight-relation registry unchanged', () => {
  const expectedKeys = [
    'recurrence',
    'gathering',
    'release',
    'created_potential',
    'released_tendency',
    'protected_continuity',
    'bounded_emergence',
    'structural_rest'
  ];
  const registryKeys = Object.keys(FLOWCORE_GLYPH_REGISTRY.entries);
  assert.deepEqual(registryKeys.sort(), expectedKeys.sort());

  const expectedGlyphs = {
    recurrence: '米',
    gathering: 'à',
    release: '出',
    created_potential: '上',
    released_tendency: '下',
    protected_continuity: 'cōl',
    bounded_emergence: 'hõt',
    structural_rest: '𝄐'
  };

  for (const [key, glyph] of Object.entries(expectedGlyphs)) {
    const canonical = resolveCanonicalRelation(key);
    assert.equal(canonical.entry.glyph, glyph);
  }
});

test('5. single animation owner: no loop duplication and hidden views draw zero', () => {
  // Check source code: must NOT contain requestAnimationFrame or setInterval
  const source = fs.readFileSync('app/engine/flowcore-semantic-motion-bridge.js', 'utf8');
  assert.equal(source.includes('requestAnimationFrame'), false, 'bridge must not instantiate a second rAF crown');
  assert.equal(source.includes('setInterval'), false, 'bridge must not instantiate rogue setInterval loops');

  // Active view renders
  const activeSnapshot = { activeViewId: 'field', relationState: { relation_key: 'gathering' } };
  const activeFrame = renderDomeArt('field', activeSnapshot, { width: 1000, height: 520 }, 1000);
  assert.equal(activeFrame.active, true);
  assert.equal(activeFrame.draw, true);
  assert.equal(activeFrame.carriers.length, 39);
  assert.equal(activeFrame.scheduler.coordinator, 'renderDomeArt');
  assert.equal(activeFrame.scheduler.owns_animation_loop, false);
  assert.equal(activeFrame.scheduler.hidden_views_draw_zero, true);

  // Hidden/inactive view performs strictly zero drawing
  const hiddenSnapshot = { activeViewId: 'cockpit-lab', relationState: { relation_key: 'gathering' } };
  const hiddenFrame = renderDomeArt('field', hiddenSnapshot, { width: 1000, height: 520 }, 1000);
  assert.equal(hiddenFrame.active, false);
  assert.equal(hiddenFrame.draw, false);
  assert.equal(hiddenFrame.carriers.length, 0);
  assert.equal(hiddenFrame.draw_commands.length, 0);
  assert.equal(hiddenFrame.hidden_view_reason, 'INACTIVE_DOME_VIEW');
});

test('6. deterministic presentation under fixed state/time/seed', () => {
  const snapshot = {
    activeViewId: 'field',
    relationState: { relation_key: 'release', progress: 0.5 }
  };
  const viewport = { width: 1000, height: 520, dpr: 1 };
  const time = 2400;

  const frame1 = renderDomeArt('field', snapshot, viewport, time);
  const frame2 = renderDomeArt('field', snapshot, viewport, time);

  assert.deepEqual(frame1.carriers, frame2.carriers);
  assert.equal(generateSvgSnapshot(frame1), generateSvgSnapshot(frame2));
});

test('7. consequence before naming: materially different relation classes produce distinguishable motion vectors', () => {
  const snapshot = (key) => ({
    activeViewId: 'field',
    relationState: { relation_key: key, progress: 0.5 }
  });
  const viewport = { width: 1000, height: 520 };
  const time = 3000;

  const fGathering = renderDomeArt('field', snapshot('gathering'), viewport, time);
  const fRelease = renderDomeArt('field', snapshot('release'), viewport, time);
  const fPotential = renderDomeArt('field', snapshot('created_potential'), viewport, time);
  const fTendency = renderDomeArt('field', snapshot('released_tendency'), viewport, time);
  const fContinuity = renderDomeArt('field', snapshot('protected_continuity'), viewport, time);
  const fRest = renderDomeArt('field', snapshot('structural_rest'), viewport, time);

  // Simulated discrimination test label:
  // SIMULATED_DISCRIMINATION != HUMAN_COMPREHENSION
  assert.notEqual(
    fGathering.descriptor.discriminability.vector_class,
    fRelease.descriptor.discriminability.vector_class,
    'gathering (inward) must differ from release (outward)'
  );
  assert.notEqual(
    fPotential.descriptor.discriminability.directional_axis,
    fRelease.descriptor.discriminability.directional_axis,
    'vertical potential must differ from horizontal shear release'
  );
  assert.notEqual(
    fPotential.descriptor.discriminability.vector_class,
    fTendency.descriptor.discriminability.vector_class,
    'upward ascent must differ from downward grounding'
  );

  // Position deltas across relations: carriers must not sit in the exact same positions
  const posGathering = fGathering.carriers.map(c => [c.x, c.y]);
  const posRelease = fRelease.carriers.map(c => [c.x, c.y]);
  const posPotential = fPotential.carriers.map(c => [c.x, c.y]);

  assert.notDeepEqual(posGathering, posRelease);
  assert.notDeepEqual(posGathering, posPotential);
  assert.notDeepEqual(posRelease, posPotential);
});

test('8. structural rest stops new impulses and settles rather than erasing', () => {
  const restSnapshot = {
    activeViewId: 'field',
    relationState: { relation_key: 'structural_rest', progress: 1.0 }
  };
  const viewport = { width: 1000, height: 520 };

  const frameT1 = renderDomeArt('field', restSnapshot, viewport, 2000);
  const frameT2 = renderDomeArt('field', restSnapshot, viewport, 5000);

  // In rest: new pulses stopped; settles to equilibrium
  assert.equal(frameT1.descriptor.settling_behavior.new_pulses_stopped, true);
  assert.equal(frameT1.descriptor.settling_behavior.final_state_inspectable, true);

  // All 39 carriers remain rendered and inspectable (not deleted or made 0-opacity)
  assert.equal(frameT1.carriers.length, 39);
  assert.ok(frameT1.carriers.every(c => c.opacity > 0.1), 'carriers must remain visible in rest');
  assert.ok(frameT1.carriers.every(c => c.glyph === '𝄐'), 'all carriers carry rest glyph');

  // Once settled (progress = 1.0), stationary equilibrium is preserved
  assert.deepEqual(frameT1.carriers.map(c => [c.x, c.y]), frameT2.carriers.map(c => [c.x, c.y]));
});

test('9. reduced motion is first-class: static frame retains all 39 carriers and full meaning', () => {
  const snapshot = {
    activeViewId: 'field',
    relationState: { relation_key: 'gathering', progress: 0.5 },
    reducedMotion: true
  };
  const viewport = { width: 1000, height: 520 };

  const frameT0 = renderDomeArt('field', snapshot, viewport, 0);
  const frameT10 = renderDomeArt('field', snapshot, viewport, 10000);

  // REDUCED_MOTION != REDUCED_MEANING
  assert.equal(frameT0.reduced_motion, true);
  assert.equal(frameT0.carriers.length, 39);

  // Depth distribution intact
  const nearCount = frameT0.carriers.filter(c => c.carrier.near).length;
  const midCount = frameT0.carriers.filter(c => c.carrier.mid).length;
  const farCount = frameT0.carriers.filter(c => c.carrier.far).length;
  assert.equal(nearCount, 6);
  assert.equal(midCount, 13);
  assert.equal(farCount, 20);

  // Static: zero movement across arbitrary time
  assert.deepEqual(frameT0.carriers, frameT10.carriers);
});

test('10. mobile (390px) preserves all three depth planes and all 39 carriers', () => {
  const snapshot = {
    activeViewId: 'field',
    relationState: { relation_key: 'release', progress: 0.5 }
  };
  const mobileViewport = { width: 390, height: 844, dpr: 3 };

  const mobileFrame = renderDomeArt('field', snapshot, mobileViewport, 1500);

  assert.equal(mobileFrame.viewport.compact, true);
  assert.equal(mobileFrame.viewport.is_portrait_mobile, true);
  assert.equal(mobileFrame.viewport.viewBox, '200 -220 600 1120');

  // Full 39 carriers preserved
  assert.equal(mobileFrame.carriers.length, 39);

  // All 3 depth planes preserved
  const near = mobileFrame.carriers.filter(c => c.carrier.near);
  const mid = mobileFrame.carriers.filter(c => c.carrier.mid);
  const far = mobileFrame.carriers.filter(c => c.carrier.far);

  assert.equal(near.length, 6, 'mobile must not delete near carriers');
  assert.equal(mid.length, 13, 'mobile must not delete mid carriers');
  assert.equal(far.length, 20, 'mobile must not delete far carriers');

  // None of the carriers have display:none or 0-scale
  assert.ok(mobileFrame.carriers.every(c => c.scale > 0 && c.opacity > 0));
});

test('11. ambient choreography cannot mutate event history, authority, or canonical semantics', () => {
  const snapshot = {
    activeViewId: 'field',
    relationState: { relation_key: 'recurrence' }
  };
  const frame = renderDomeArt('field', snapshot, { width: 1000, height: 520 }, 2000);

  // Authority strictly closed
  assert.equal(frame.authority.commands_station, false);
  assert.equal(frame.authority.automatic_ash_action, false);
  assert.equal(frame.authority.release_authorized, false);
  assert.equal(frame.authority.human_closure_required, true);

  // Claim ceiling bound
  assert.equal(frame.claim_ceiling.ambient_motion, 'AMBIENT_MOTION_NOT_EVENT_HISTORY');
  assert.equal(frame.claim_ceiling.aesthetic_binding, 'AESTHETIC_BINDING_NOT_EMPIRICAL_VALIDATION');
  assert.equal(frame.claim_ceiling.visual_relation, 'VISUAL_RELATION_NOT_EXTERNAL_REALITY');

  // Proposed aesthetic bindings remain unpromoted
  assert.equal(PROPOSED_AESTHETIC_BINDINGS.recurrence.binding_status, 'PROPOSED_AESTHETIC_BINDING');
  assert.equal(PROPOSED_AESTHETIC_BINDINGS.gathering.binding_status, 'PROPOSED_AESTHETIC_BINDING');
});

test('12. Tranche 2B visual director tournament: all three directions maintain exact 39 carriers, distinct aesthetics, and first-class mobile/reduced-motion support', () => {
  const directions = ['lithic_tectonic', 'organza_choreography', 'aperture_monochrome'];
  const relations = ['gathering', 'release', 'protected_continuity', 'structural_rest'];

  for (const dir of directions) {
    for (const rel of relations) {
      const snapDesktop = {
        activeViewId: 'field',
        relationState: { relation_key: rel, progress: 0.5 },
        directorDirection: dir
      };
      const fDesktop = renderDomeArt('field', snapDesktop, { width: 1000, height: 520 }, 2000);

      // Must have exactly 39 carriers with 6/13/20 distribution
      assert.equal(fDesktop.carriers.length, 39, `${dir} ${rel} must have 39 carriers`);
      assert.equal(fDesktop.carriers.filter(c => c.carrier.near).length, 6);
      assert.equal(fDesktop.carriers.filter(c => c.carrier.mid).length, 13);
      assert.equal(fDesktop.carriers.filter(c => c.carrier.far).length, 20);

      // Manifestation matches director style
      assert.equal(fDesktop.director_direction, dir);
      assert.ok(fDesktop.carriers.every(c => c.manifestation?.style === dir));

      // Mobile 390px preservation
      const snapMobile = { ...snapDesktop };
      const fMobile = renderDomeArt('field', snapMobile, { width: 390, height: 844 }, 2000);
      assert.equal(fMobile.carriers.length, 39, `${dir} ${rel} mobile must have 39 carriers`);
      assert.equal(fMobile.carriers.filter(c => c.carrier.near).length, 6);
      assert.equal(fMobile.carriers.filter(c => c.carrier.mid).length, 13);
      assert.equal(fMobile.carriers.filter(c => c.carrier.far).length, 20);

      // Reduced motion static verification
      const snapReduced = { ...snapDesktop, reducedMotion: true };
      const fRed0 = renderDomeArt('field', snapReduced, { width: 1000, height: 520 }, 0);
      const fRed10k = renderDomeArt('field', snapReduced, { width: 1000, height: 520 }, 10000);
      assert.equal(fRed0.carriers.length, 39);
      assert.deepEqual(fRed0.carriers, fRed10k.carriers, `${dir} ${rel} reduced motion must be static across time`);

      // SVG snapshots generate without error and contain direction watermark
      const svg = generateSvgSnapshot(fDesktop);
      assert.ok(svg.includes(dir), `${dir} svg must contain direction label`);
      assert.ok(svg.includes('39 (Distribution: 6 near / 13 mid / 20 far)'));
    }
  }

  // The 3 directions produce distinct visual representations for the same state
  const snap = (d) => ({ activeViewId: 'field', relationState: { relation_key: 'gathering', progress: 0.5 }, directorDirection: d });
  const fLithic = renderDomeArt('field', snap('lithic_tectonic'), { width: 1000, height: 520 }, 1500);
  const fOrganza = renderDomeArt('field', snap('organza_choreography'), { width: 1000, height: 520 }, 1500);
  const fRadar = renderDomeArt('field', snap('aperture_monochrome'), { width: 1000, height: 520 }, 1500);

  const svgLithic = generateSvgSnapshot(fLithic);
  const svgOrganza = generateSvgSnapshot(fOrganza);
  const svgRadar = generateSvgSnapshot(fRadar);

  assert.notEqual(svgLithic, svgOrganza, 'Lithic and Organza must be visually distinct');
  assert.notEqual(svgLithic, svgRadar, 'Lithic and Radar must be visually distinct');
  assert.notEqual(svgOrganza, svgRadar, 'Organza and Radar must be visually distinct');
});

test('13. Tranche 2C Director’s Cut & Visual Federalism: 39-carrier preservation across 5 jurisdictions, inspectable HOLD, calm receipts, structural rest, and 390px mobile support', () => {
  // Constant registry verification
  assert.ok(DIRECTOR_DIRECTIONS.includes('directors_cut'), 'directors_cut must be in DIRECTOR_DIRECTIONS');
  assert.equal(PRODUCT_JURISDICTIONS.length, 5);
  const expectedJurisdictions = ['living_field', 'hold', 'authorization_boundary', 'receipt_inspection', 'structural_rest'];
  assert.deepEqual([...PRODUCT_JURISDICTIONS], expectedJurisdictions);

  // Alias verification: couture_tectonic maps to directors_cut
  const fAlias = renderDomeArt('cockpit', { directorDirection: 'couture_tectonic' }, { width: 1000, height: 520 }, 1000);
  assert.equal(fAlias.director_direction, 'directors_cut');

  // Verify all 5 jurisdictions preserve exactly 39 carriers and 6/13/20 distribution
  for (const j of PRODUCT_JURISDICTIONS) {
    const snap = {
      activeViewId: 'cockpit',
      directorDirection: 'directors_cut',
      jurisdiction: j,
      relationState: { relation_key: j === 'structural_rest' ? 'structural_rest' : 'gathering', progress: 0.6 }
    };

    // Desktop
    const fDesk = renderDomeArt('cockpit', snap, { width: 1000, height: 520 }, 1500);
    assert.equal(fDesk.carriers.length, 39, `${j} desktop must have exactly 39 carriers`);
    assert.equal(fDesk.carriers.filter(c => c.carrier.near).length, 6, `${j} desktop near plane must be 6`);
    assert.equal(fDesk.carriers.filter(c => c.carrier.mid).length, 13, `${j} desktop mid plane must be 13`);
    assert.equal(fDesk.carriers.filter(c => c.carrier.far).length, 20, `${j} desktop far plane must be 20`);
    assert.equal(fDesk.jurisdiction, j);
    assert.equal(fDesk.director_direction, 'directors_cut');

    // Mobile 390px
    const fMobile = renderDomeArt('cockpit', snap, { width: 390, height: 844 }, 1500);
    assert.equal(fMobile.carriers.length, 39, `${j} mobile must have exactly 39 carriers`);
    assert.equal(fMobile.carriers.filter(c => c.carrier.near).length, 6, `${j} mobile near plane must be 6`);
    assert.equal(fMobile.carriers.filter(c => c.carrier.mid).length, 13, `${j} mobile mid plane must be 13`);
    assert.equal(fMobile.carriers.filter(c => c.carrier.far).length, 20, `${j} mobile far plane must be 20`);

    // Reduced motion static verification
    const snapRed = { ...snap, reducedMotion: true };
    const fRed0 = renderDomeArt('cockpit', snapRed, { width: 1000, height: 520 }, 0);
    const fRed5k = renderDomeArt('cockpit', snapRed, { width: 1000, height: 520 }, 5000);
    assert.equal(fRed0.carriers.length, 39);
    assert.deepEqual(fRed0.carriers, fRed5k.carriers, `${j} reduced motion must produce static deterministic frame`);

    // SVG snapshot generation
    const svg = generateSvgSnapshot(fDesk);
    assert.ok(svg.includes('Director\'s Cut / Couture Tectonic'));
    assert.ok(svg.includes(`Jurisdiction: ${j.toUpperCase()}`));
    assert.ok(svg.includes('39 (Distribution: 6 near / 13 mid / 20 far)'));
  }

  // Jurisdiction-specific semantics and manifestation verification
  // 1. HOLD State: Docked inspection berths, inspectable deficit, operator agency
  const fHold = renderDomeArt('cockpit', { directorDirection: 'directors_cut', jurisdiction: 'hold' }, { width: 1000, height: 520 }, 1000);
  assert.ok(fHold.carriers.filter(c => c.carrier.near).every(c => c.manifestation.type === 'HOLD_INSPECTION_BERTH'));
  assert.ok(fHold.carriers.filter(c => c.carrier.mid).every(c => c.manifestation.type === 'HOLD_RETENTION_BRACKET'));
  assert.ok(fHold.carriers.filter(c => c.carrier.far).every(c => c.manifestation.type === 'HOLD_FOUNDATION_PIN'));
  const svgHold = generateSvgSnapshot(fHold);
  assert.ok(svgHold.includes('HOLD ⟐'));
  assert.ok(svgHold.includes('JURISDICTION: EVIDENCE_DEFICIT'));
  assert.ok(svgHold.includes('DEFICIT: UNRESOLVED COMPARATOR VARIANCE'));
  assert.ok(svgHold.includes('OPERATOR AGENCY: REST / RESUME / AUDIT'));
  assert.ok(!svgHold.includes('radar-grid'), 'HOLD must not contain radar sweeps');

  // 2. Authorization Boundary: Titanium gate, operator-direct vs detached delegation
  const fBound = renderDomeArt('cockpit', { directorDirection: 'directors_cut', jurisdiction: 'authorization_boundary' }, { width: 1000, height: 520 }, 1000);
  assert.ok(fBound.carriers.filter(c => c.carrier.near).every(c => c.manifestation.type === 'CUSTODY_GATE_PIN'));
  assert.ok(fBound.carriers.filter(c => c.carrier.mid).every(c => c.manifestation.type === 'TRANSIT_VECTOR_MARKER'));
  assert.ok(fBound.carriers.filter(c => c.carrier.far).every(c => c.manifestation.type === 'BOUNDARY_VERNIER_TICK'));
  const svgBound = generateSvgSnapshot(fBound);
  assert.ok(svgBound.includes('LOCAL ENCLAVE // OPERATOR-DIRECT'));
  assert.ok(svgBound.includes('EXTERNAL CARRIAGE // DETACHED'));
  assert.ok(svgBound.includes('GATE: CLOSED ⟐ ISSUE #691'));

  // 3. Receipt / Evidence Inspection: Calm monospace, [OBSERVED]/[DERIVED]/[HELD], zero radar
  const fReceipt = renderDomeArt('cockpit', { directorDirection: 'directors_cut', jurisdiction: 'receipt_inspection' }, { width: 1000, height: 520 }, 1000);
  assert.ok(fReceipt.carriers.filter(c => c.carrier.near).every(c => c.manifestation.type === 'EPISTEMIC_RECEIPT_BLOCK'));
  assert.ok(fReceipt.carriers.filter(c => c.carrier.mid).every(c => c.manifestation.type === 'VERNIER_METRIC_TICK'));
  assert.ok(fReceipt.carriers.filter(c => c.carrier.far).every(c => c.manifestation.type === 'ALIGNMENT_DATUM_PIN'));
  const svgReceipt = generateSvgSnapshot(fReceipt);
  assert.ok(svgReceipt.includes('TD613 EVIDENCE &amp; RECEIPT LEDGER // APERTURE REGISTER'));
  assert.ok(svgReceipt.includes('[OBSERVED]'));
  assert.ok(svgReceipt.includes('[DERIVED]'));
  assert.ok(svgReceipt.includes('[HELD]'));
  assert.ok(!svgReceipt.includes('radar-grid'), 'Receipts must not contain faux-military radar sweeps');
  assert.ok(!svgReceipt.includes('AZ-352°'), 'Receipts must not contain fake azimuth telemetry');

  // 4. Structural Rest: Kinetic obligation resolved, history inspectable
  const fRest = renderDomeArt('cockpit', { directorDirection: 'directors_cut', jurisdiction: 'structural_rest', relationState: { relation_key: 'structural_rest' } }, { width: 1000, height: 520 }, 1000);
  assert.ok(fRest.carriers.filter(c => c.carrier.near).every(c => c.manifestation.type === 'RESTING_DRAPERY_STELE'));
  assert.ok(fRest.carriers.filter(c => c.carrier.mid).every(c => c.manifestation.type === 'EQUILIBRIUM_PLUMB_SHARD'));
  assert.ok(fRest.carriers.filter(c => c.carrier.far).every(c => c.manifestation.type === 'STATIONARY_LATTICE_STAR'));
  const svgRest = generateSvgSnapshot(fRest);
  assert.ok(svgRest.includes('STRUCTURAL REST'));
  assert.ok(svgRest.includes('KINETIC OBLIGATION RESOLVED'));
  assert.ok(svgRest.includes('HISTORY INSPECTABLE · EXIT &amp; RETURN OPEN'));

  // 5. Living Field: Tested across canonical relations
  const livingRelations = ['gathering', 'release', 'protected_continuity', 'recurrence', 'bounded_emergence', 'created_potential', 'released_tendency'];
  for (const rel of livingRelations) {
    const fLiving = renderDomeArt('cockpit', { directorDirection: 'directors_cut', jurisdiction: 'living_field', relationState: { relation_key: rel, progress: 0.5 } }, { width: 1000, height: 520 }, 2000);
    assert.equal(fLiving.carriers.length, 39);
    assert.ok(fLiving.carriers.filter(c => c.carrier.near).every(c => c.manifestation.type === 'COUTURE_TECTONIC_LIGAMENT'));
    assert.ok(fLiving.carriers.filter(c => c.carrier.mid).every(c => c.manifestation.type === 'TECTONIC_MOIRE_FIN'));
    assert.ok(fLiving.carriers.filter(c => c.carrier.far).every(c => c.manifestation.type === 'GOSSAMER_BASALT_SHARD'));
    const svgLiving = generateSvgSnapshot(fLiving);
    assert.ok(svgLiving.includes(`COUTURE-TECTONIC // ${rel.toUpperCase()}`));
  }
});


