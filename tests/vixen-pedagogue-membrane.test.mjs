import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const vixenHtmlPath = path.join(rootDir, 'app', 'encyclopedia', 'vix-cyb.html');
const designFixturePath = path.join(rootDir, 'tests', 'fixtures', 'pedagogue', 'vixen-cybernetics-design.json');
const practiceFixturePath = path.join(rootDir, 'tests', 'fixtures', 'pedagogue', 'vixen-cybernetics-practice.json');

test('Vixen Cybernetics · Pedagogue Membrane & Reader Experience Suite', async (t) => {
  assert.ok(fs.existsSync(vixenHtmlPath), 'vix-cyb.html must exist at primary path');
  const html = fs.readFileSync(vixenHtmlPath, 'utf8');

  await t.test('1. Anti-leakage rule: host infrastructure nomenclature omitted from public navigation', () => {
    // PEDAGOGUE CADENCE must not appear in public surface or folios
    assert.strictEqual(
      html.includes('PEDAGOGUE CADENCE'),
      false,
      'PEDAGOGUE CADENCE must not leak into public research navigation'
    );
    assert.strictEqual(
      html.includes('PEDAGOGUE_CADENCE'),
      false,
      'PEDAGOGUE_CADENCE must not leak into folio statuses'
    );

    // Hard-coded /aperture/ link must not exist
    assert.strictEqual(
      html.includes('href="/aperture/"'),
      false,
      'Hard-coded /aperture/ link must be replaced with standalone/configurable return link'
    );
    assert.ok(
      html.includes('id="vixenReturnLink"'),
      '#vixenReturnLink element must exist for standalone navigation'
    );

    // Raw AIA ROUTE PROJECTION LENS must not appear in public UI
    assert.strictEqual(
      html.includes('AIA ROUTE PROJECTION LENS'),
      false,
      'Raw AIA ROUTE PROJECTION LENS must be replaced by CATALOGUE PERSPECTIVE'
    );
    assert.ok(
      html.includes('CATALOGUE PERSPECTIVE (PRESERVING ROUTE INTEGRITY)'),
      'CATALOGUE PERSPECTIVE must appear in work catalogue'
    );

    // Observatory Tab III must be research-native Observation Geometry
    assert.ok(
      html.includes('III · Observation Geometry &amp; Fiber Admissibility'),
      'Observatory Tab III must be named Observation Geometry & Fiber Admissibility'
    );
    assert.strictEqual(
      html.includes('Aperture κ &amp; FADT c₄'),
      false,
      'Observatory Tab III must not use raw host coupling Aperture κ & FADT c₄'
    );

    // Observatory readout must use OBSERVATION OPERATOR
    assert.ok(
      html.includes('OBSERVATION OPERATOR:'),
      'Observatory readout must use OBSERVATION OPERATOR'
    );
    assert.strictEqual(
      html.includes('APERTURE OPERATOR:'),
      false,
      'Observatory readout must not use APERTURE OPERATOR'
    );

    // Canvas must use FINITE QUOTIENT
    assert.ok(
      html.includes('FINITE QUOTIENT (c₄ FIBER · 87 FILES)'),
      'Canvas must render FINITE QUOTIENT (c₄ FIBER · 87 FILES)'
    );
    assert.strictEqual(
      html.includes('FADT c₄ ESTATE QUOTIENT'),
      false,
      'Canvas must not use FADT c₄ ESTATE QUOTIENT'
    );
  });

  await t.test('2. Three-tier product language membrane & OPERAHOUSE ≠ OPERA ≠ PERFORMER', () => {
    // Check embedded Astra handoff manifest
    assert.ok(
      html.includes('id="vixen-astra-handoff"'),
      '#vixen-astra-handoff script element must be present'
    );
    const handoffMatch = html.match(/<script type="application\/json" id="vixen-astra-handoff">([\s\S]*?)<\/script>/);
    assert.ok(handoffMatch, 'Must match #vixen-astra-handoff script content');
    const handoff = JSON.parse(handoffMatch[1]);

    assert.ok(handoff.product_language_membrane, 'product_language_membrane must be declared');
    assert.strictEqual(
      handoff.product_language_membrane.governing_anti_equivalence,
      'OPERAHOUSE ≠ OPERA ≠ PERFORMER',
      'Governing anti-equivalence must be declared'
    );

    assert.deepStrictEqual(
      Object.keys(handoff.product_language_membrane.three_tiers),
      ['RESEARCH_OBJECT', 'SCHOLARLY_INTERPRETATION', 'HOST_INFRASTRUCTURE'],
      'Three membrane tiers must be declared'
    );
    assert.ok(
      handoff.product_language_membrane.anti_leakage_rule.includes('HOST_INFRASTRUCTURE terminology'),
      'Anti-leakage rule must be explicit'
    );

    // Check data-membrane attributes in HTML
    assert.ok(
      html.includes('data-membrane="RESEARCH_OBJECT"'),
      'Must contain data-membrane="RESEARCH_OBJECT" elements'
    );
    assert.ok(
      html.includes('data-membrane="SCHOLARLY_INTERPRETATION"'),
      'Must contain data-membrane="SCHOLARLY_INTERPRETATION" elements'
    );
    assert.ok(
      html.includes('data-membrane="HOST_INFRASTRUCTURE"'),
      'Must contain data-membrane="HOST_INFRASTRUCTURE" elements'
    );
  });

  await t.test('3. Journey A: Scholarly encounter threshold order & accession integrity', () => {
    // Consequence and research objects before apparatus in threshold
    const threshIdx = html.indexOf('id="atelierThreshold"');
    assert.ok(threshIdx !== -1, '#atelierThreshold must exist');
    const threshHtml = html.slice(threshIdx, threshIdx + 2000);

    const resObjIdx = threshHtml.indexOf('data-membrane="RESEARCH_OBJECT"');
    const schIntIdx = threshHtml.indexOf('data-membrane="SCHOLARLY_INTERPRETATION"');
    const hostInfIdx = threshHtml.indexOf('data-membrane="HOST_INFRASTRUCTURE"');

    assert.ok(resObjIdx !== -1 && schIntIdx !== -1 && hostInfIdx !== -1, 'All 3 membranes in threshold');
    assert.ok(
      resObjIdx < schIntIdx && schIntIdx < hostInfIdx,
      'Threshold order must present RESEARCH_OBJECT before SCHOLARLY_INTERPRETATION before HOST_INFRASTRUCTURE'
    );

    // Four public inquiry pathways
    assert.ok(
      html.includes('INQUIRY PROGRESSION: OBSERVE ≺ INTERVENE ≺ WITNESS ≺ FORMULATE'),
      'Threshold must display research inquiry progression'
    );

    // Work reader displays Catalog Accession cleanly
    assert.ok(
      html.includes('Catalog Accession: <code>'),
      'Work reader must present Catalog Accession'
    );
  });

  await t.test('4. Journey B: Manifestation comparison & split-plane gates at UNADJUDICATED_PAIR', () => {
    // Split gates view section exists
    assert.ok(
      html.includes('id="view-gates"') || html.includes('data-page="gates"'),
      'Gates view panel must exist'
    );
    assert.ok(
      html.includes('UNADJUDICATED_PAIR'),
      'Gates must initialize as UNADJUDICATED_PAIR'
    );
    assert.ok(
      html.includes('ACTIVE SENSITIVITY INTERVAL'),
      'Sensitivity interval must be rendered'
    );
    assert.ok(
      html.includes('HUMAN CLOSURE REQUIRED'),
      'Human closure notice must be present'
    );
  });

  await t.test('5. Journey C: Expert investigation via concealed Alt+I inspector', () => {
    assert.ok(
      html.includes('id="inspectorDialog"'),
      '#inspectorDialog element must exist'
    );
    assert.ok(
      html.includes('Alt+I'),
      'Concealed inspector must advertise Alt+I shortcut'
    );
    assert.ok(
      html.includes('ESTATE CENSUS') || html.includes('census'),
      'Inspector must contain estate census tab'
    );
    assert.ok(
      html.includes('PROVENANCE') || html.includes('provenance'),
      'Inspector must contain provenance tab'
    );
  });

  await t.test('6. Four catalogue perspectives (Experiential, Curatorial, Audit, System)', () => {
    assert.ok(html.includes('data-aia-proj="EXPERIENTIAL"'), 'Experiential projection button');
    assert.ok(html.includes('data-aia-proj="CUSTODIAL"'), 'Custodial projection button');
    assert.ok(html.includes('data-aia-proj="AUDIT"'), 'Audit projection button');
    assert.ok(html.includes('data-aia-proj="IMPLEMENTATION"'), 'Implementation projection button');

    assert.ok(html.includes('Reading Guide (Experiential)'), 'Reading Guide label');
    assert.ok(html.includes('Curatorial Custody (Historical)'), 'Curatorial Custody label');
    assert.ok(html.includes('Evidence &amp; Verification (Audit)'), 'Evidence & Verification label');
    assert.ok(html.includes('System Architecture (Technical)'), 'System Architecture label');
  });

  await t.test('7. Standalone offline execution integrity', () => {
    // Must contain all inline assets
    assert.ok(
      html.includes('image/webp;base64,'),
      'Mugler couture WebP frontispiece must be embedded inline'
    );
    assert.ok(
      html.includes('vixen-fox-emblem'),
      'Fox emblem SVG must be embedded inline'
    );
    assert.ok(
      html.includes('Khona\u200clit-po'),
      'Covenant Khona‌lit-po with interior U+200C must be intact'
    );
    assert.ok(
      html.includes('𝌋'),
      'Tetragram of contrariety U+1D30B must be preserved'
    );
  });

  await t.test('8. Pedagogue Design Gate & Practice Fixtures PASS', async () => {
    const { compilePedagogueDesignReview } = await import('../app/engine/pedagogue-design-gate.js');
    const { compilePedagoguePracticeReview } = await import('../app/engine/pedagogue-practice-fixture.js');

    const designFixture = JSON.parse(fs.readFileSync(designFixturePath, 'utf8'));
    const designReview = await compilePedagogueDesignReview(designFixture);

    const designPassed = Object.values(designReview.design_gate).every((v) => v === true);
    assert.strictEqual(designPassed, true, 'Design fixture must PASS Pedagogue Design Gate');
    assert.strictEqual(designReview.design_gate.consequence_before_ontology, true);
    assert.strictEqual(designReview.design_gate.rest_and_exit_preserved, true);
    assert.strictEqual(designReview.design_gate.aia_invariants_preserved, true);
    assert.strictEqual(designReview.design_gate.aia_surface_bound, true);
    assert.strictEqual(designReview.design_gate.route_history_explicit, true);
    assert.strictEqual(designReview.design_gate.route_burden_non_worsening, true);
    assert.strictEqual(designReview.design_gate.automatic_redesign_forbidden, true);
    assert.strictEqual(designReview.design_gate.human_closure_required, true);

    const practiceFixture = JSON.parse(fs.readFileSync(practiceFixturePath, 'utf8'));
    const practiceReview = compilePedagoguePracticeReview(practiceFixture);
    const practicePassed = Object.values(practiceReview.practice_gate).every((v) => v === true);
    assert.strictEqual(practicePassed, true, 'Practice fixture must PASS Pedagogue Practice Gate');
  });
});
