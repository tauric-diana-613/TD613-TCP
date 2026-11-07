import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import jsdom from 'jsdom';
const { JSDOM } = jsdom;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const vixenHtmlPath = path.join(rootDir, 'app', 'encyclopedia', 'vix-cyb.html');
const designFixturePath = path.join(rootDir, 'tests', 'fixtures', 'pedagogue', 'vixen-cybernetics-design.json');
const practiceFixturePath = path.join(rootDir, 'tests', 'fixtures', 'pedagogue', 'vixen-cybernetics-practice.json');

function createVixenDOM(vixenHtml, opts = {}) {
  const dom = new JSDOM(vixenHtml, {
    url: opts.url || 'http://localhost:3000/encyclopedia/vix-cyb.html',
    runScripts: 'dangerously',
    resources: 'usable',
    beforeParse(win) {
      if (opts.hostConfig) {
        win.VIXEN_HOST_CONFIG = opts.hostConfig;
      }
      win.HTMLCanvasElement.prototype.getContext = () => ({
        clearRect: () => {}, beginPath: () => {}, arc: () => {}, fill: () => {}, stroke: () => {},
        moveTo: () => {}, lineTo: () => {}, closePath: () => {}, fillRect: () => {}, strokeRect: () => {},
        fillText: () => {}, measureText: () => ({ width: 0 }), save: () => {}, restore: () => {},
        scale: () => {}, translate: () => {}, rotate: () => {}
      });
      win.scrollTo = () => {};
      win.requestAnimationFrame = () => 1;
      win.cancelAnimationFrame = () => {};
    }
  });
  return dom;
}


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

  await t.test('9. Amari Adjudication #5811085212 Regressions (P-V4-01 Return-Link Security & P-V4-02 Public Language Cleanup)', () => {
    // P-V4-01: Return-link security sanitization logic must be present in client runtime
    assert.ok(
      html.includes('function sanitizeReturnUrl(raw)'),
      'sanitizeReturnUrl function must be implemented in client runtime'
    );
    assert.ok(
      html.includes("lower.startsWith('javascript:')"),
      'Must explicitly block javascript: URIs'
    );
    assert.ok(
      html.includes("lower.startsWith('data:')"),
      'Must explicitly block data: URIs'
    );
    assert.ok(
      html.includes("lower.startsWith('vbscript:')"),
      'Must explicitly block vbscript: URIs'
    );

    // P-V4-02: Public language leakage eliminated
    assert.strictEqual(
      html.includes('Every canonical <code>emwork_*</code> route from <code>identity_metadata_crosswalk.json</code>'),
      false,
      'Works intro must not contain raw internal filenames or emwork_* code keys'
    );
    assert.ok(
      html.includes('The preserved catalogue comprises thirty-two canonical works'),
      'Works intro must present human-legible editorial language'
    );
    assert.strictEqual(
      html.includes('placeholder="Search title, emwork_* ID, emsrc_* ID'),
      false,
      'Work search input placeholder must not contain emwork_* internal key names'
    );
    assert.strictEqual(
      html.includes('C1 Algedonic Hypervisor (emwork_085223...)'),
      false,
      'Preset dropdown labels must not contain truncated emwork_ hash IDs'
    );
    assert.ok(
      html.includes('C1 Algedonic Hypervisor ⊕ C2 Lock-Free DSP (Illustrative Pair)'),
      'Preset dropdown must present clean illustrative pair labels'
    );
    assert.ok(
      html.includes('Manuscript Body Reserved'),
      'Public badges must state Manuscript Body Reserved rather than raw machine status'
    );
  });

  await t.test('10. Emergence HQ Review #5811435392 Directives (P-V4-06 Return-Link Security, P-V4-07 OPERAHOUSE ≠ OPERA ≠ PERFORMER Text Membrane, P-V4-08 Astra Creative Scope)', () => {
    // P-V4-06: Strict return-link sanitizer logic and slash-backslash bypass immunity
    assert.ok(
      html.includes('// Return-Link Security Sanitizer (P-V4-06'),
      'P-V4-06 sanitizer must be present'
    );
    assert.ok(
      html.includes('/[\\\\<>\'"`\\s\\x00-\\x1f]/'),
      'Sanitizer must reject backslashes and control characters'
    );

    // Test sanitizeReturnUrl directly from production window.VixenReference
    const testLocation = {
      href: 'http://localhost:3000/encyclopedia/vix-cyb.html',
      origin: 'http://localhost:3000'
    };

    const domForSanitizer = createVixenDOM(html);
    const prodSanitizer = (vec) => domForSanitizer.window.VixenReference.sanitizeReturnUrl(vec);

    // Hostile vectors must fail closed to #overview
    const hostileVectors = [
      '/\\evil.example/entry',
      '/\\\\evil.example/entry',
      '\\evil.example',
      '//evil.example',
      '///evil.example',
      'https://evil.example/phish',
      'http://attacker.com/bypass',
      'javascript:alert(document.domain)',
      'data:text/html,<script>alert(1)</script>',
      'vbscript:msgbox(1)',
      'file:///etc/passwd',
      '   ',
      null,
      undefined,
      '/valid/path\\with\\backslash',
      '/path<script>'
    ];

    for (const vec of hostileVectors) {
      const sanitized = prodSanitizer(vec);
      assert.strictEqual(
        sanitized,
        '#overview',
        `Hostile vector ${JSON.stringify(vec)} must fail closed to #overview, got ${JSON.stringify(sanitized)}`
      );

      // Verify browser resolution test
      const resolved = new URL(sanitized, testLocation.href);
      assert.strictEqual(
        resolved.origin,
        testLocation.origin,
        `Browser resolved origin for ${JSON.stringify(vec)} must remain on same origin`
      );
      assert.strictEqual(
        resolved.protocol,
        'http:',
        `Browser resolved protocol must be http:`
      );
    }

    // Safe vectors must be admitted cleanly
    assert.strictEqual(prodSanitizer('#overview'), '#overview');
    assert.strictEqual(prodSanitizer('#gates'), '#gates');
    assert.strictEqual(prodSanitizer('#works'), '#works');
    assert.strictEqual(prodSanitizer('/encyclopedia/vix-cyb.html'), '/encyclopedia/vix-cyb.html');
    assert.strictEqual(prodSanitizer('/app/home?lang=en#top'), '/app/home?lang=en#top');
    assert.strictEqual(prodSanitizer('http://localhost:3000/encyclopedia/'), '/encyclopedia/');

    // P-V4-07: Verify default public surfaces omit host vocabulary
    // Extract public markup up to scripts and inspector
    const mainMarkup = html.slice(html.indexOf('<main id="main">'), html.indexOf('<footer class="footer"'));
    const footerMarkup = html.slice(html.indexOf('<footer class="footer"'), html.indexOf('<script id="vixen-reference-manifest"'));

    // Public markup must not contain EMSTD613
    assert.strictEqual(
      mainMarkup.includes('EMSTD613'),
      false,
      'Main public markup must not contain EMSTD613'
    );
    assert.strictEqual(
      footerMarkup.includes('EMSTD613'),
      false,
      'Footer brand must not contain EMSTD613'
    );

    // Public markup must not contain raw CATALOGUE_METADATA_ONLY or UNAVAILABLE_IN_PUBLIC_SURFACE
    assert.strictEqual(
      mainMarkup.includes('>CATALOGUE_METADATA_ONLY<'),
      false,
      'Main public markup must not contain rendered >CATALOGUE_METADATA_ONLY<'
    );
    assert.strictEqual(
      mainMarkup.includes('>UNAVAILABLE_IN_PUBLIC_SURFACE<'),
      false,
      'Main public markup must not contain rendered >UNAVAILABLE_IN_PUBLIC_SURFACE<'
    );

    // Formula card rendering for RC-06 must display Finite Admissibility & Packaging Quarantine (c₄)
    assert.ok(
      html.includes("displayTitle = 'RC-06 · Finite Admissibility & Packaging Quarantine (c₄)'"),
      'RC-06 formula card must map title to scholarly Finite Admissibility'
    );
    assert.ok(
      html.includes("displayStatus = 'EXACT DESCENT (FIBER QUOTIENT)'"),
      'RC-06 status must map to EXACT DESCENT (FIBER QUOTIENT)'
    );

    // VixenReference.cite must use scholarly citation brand
    assert.ok(
      html.includes("[Vixen Cybernetics Research Atelier]"),
      'VixenReference.cite must output [Vixen Cybernetics Research Atelier]'
    );
    assert.strictEqual(
      html.includes("[EMSTD613 · Vixen Cybernetics]"),
      false,
      'VixenReference.cite must not output [EMSTD613 · Vixen Cybernetics]'
    );

    // Preserved canonical manifests must still contain authentic data
    assert.ok(
      html.includes('"atelier_id":"EMSTD613"'),
      'Canonical data manifest must retain atelier_id EMSTD613'
    );
    assert.ok(
      html.includes('"id":"RC-06"'),
      'RC-06 must exist in formula folios'
    );

    // P-V4-08: Astra creative latitude declaration in handoff manifest
    const handoffMatch = html.match(/<script type="application\/json" id="vixen-astra-handoff">([\s\S]*?)<\/script>/);
    const handoff = JSON.parse(handoffMatch[1]);
    assert.ok(
      handoff.authorized_creative_latitude_for_astra.code_refactoring.includes('client presentation JS'),
      'Handoff manifest must permit Astra code refactoring of presentation JS'
    );
  });
  await t.test('11. Emergence HQ Review #5811601958 Directives (V41-F01 Return Link, V41-F02 Filter Consistency, V41-F03 Footer Nav, V41-F04 Gate Decoupling, V41-F05 Production Test, V41-Q06 Route History)', () => {
    // --- V41-F01: Return-Link Multi-Destination Agreement & Native Routing ---
    // A. #gates returnUrl
    const domGates = createVixenDOM(html, { hostConfig: { returnUrl: '#gates' } });
    const winGates = domGates.window;
    const docGates = winGates.document;
    const returnLinkGates = docGates.getElementById('vixenReturnLink');
    assert.strictEqual(returnLinkGates.getAttribute('href'), '#gates');
    assert.strictEqual(returnLinkGates.getAttribute('aria-label'), 'Return to Split-Plane Gates');
    assert.strictEqual(returnLinkGates.querySelector('span').textContent, 'Gates');
    // Click return link
    returnLinkGates.click();
    assert.strictEqual(docGates.body.getAttribute('data-view'), 'gates');
    assert.strictEqual(docGates.getElementById('view-gates').hidden, false);
    assert.strictEqual(docGates.getElementById('view-overview').hidden, true);
    assert.ok(winGates.location.hash.includes('gates'));

    // B. Registered Nested Route: #works/<first_work_id>
    const firstWork = winGates.VixenReference.search('')[0];
    const domNested = createVixenDOM(html, { hostConfig: { returnUrl: '#works/' + firstWork.id } });
    const winNested = domNested.window;
    const docNested = winNested.document;
    const returnLinkNested = docNested.getElementById('vixenReturnLink');
    assert.strictEqual(returnLinkNested.getAttribute('href'), '#works/' + firstWork.id);
    assert.strictEqual(returnLinkNested.getAttribute('aria-label'), 'Return to Work ' + firstWork.id);
    returnLinkNested.click();
    assert.strictEqual(docNested.body.getAttribute('data-view'), 'works');
    assert.strictEqual(docNested.getElementById('view-works').hidden, false);
    assert.ok(winNested.location.hash.includes(firstWork.id));

    // C. #protocols returnUrl
    const domProto = createVixenDOM(html, { hostConfig: { returnUrl: '#protocols' } });
    const winProto = domProto.window;
    const docProto = winProto.document;
    const returnLinkProto = docProto.getElementById('vixenReturnLink');
    assert.strictEqual(returnLinkProto.getAttribute('href'), '#protocols');
    assert.strictEqual(returnLinkProto.getAttribute('aria-label'), 'Return to Documentary Protocols');
    returnLinkProto.click();
    assert.strictEqual(docProto.body.getAttribute('data-view'), 'protocols');

    // D. Unknown fragment fallback to #overview
    const domUnknown = createVixenDOM(html, { hostConfig: { returnUrl: '#invalid_fragment_xyz' } });
    const winUnknown = domUnknown.window;
    const docUnknown = winUnknown.document;
    const returnLinkUnknown = docUnknown.getElementById('vixenReturnLink');
    assert.strictEqual(returnLinkUnknown.getAttribute('href'), '#overview');
    assert.strictEqual(returnLinkUnknown.getAttribute('aria-label'), 'Return to Overview');

    // --- V41-F02: Filtered Catalogue & Reader-Panel Consistency ---
    const domFilter = createVixenDOM(html);
    const winFilter = domFilter.window;
    const docFilter = winFilter.document;

    // Switch to Works view
    docFilter.querySelector('[data-view="works"]').click();
    assert.strictEqual(docFilter.body.getAttribute('data-view'), 'works');

    // 1. Normal state: reader shows selected work
    const workSummaryBefore = docFilter.getElementById('worksResultSummary').textContent;
    assert.ok(workSummaryBefore.includes('Showing 32 of 32 Works'));
    const readerBefore = docFilter.getElementById('worksReaderPanel');
    assert.strictEqual(readerBefore.innerHTML.includes('NO_MATCHING_RECORDS'), false);

    // 2. Zero-match query in Works: reader MUST show NO_MATCHING_RECORDS, never unrelated work
    const workInput = docFilter.getElementById('workSearchInput');
    workInput.value = 'query_with_absolutely_zero_matches_xyz';
    workInput.dispatchEvent(new winFilter.Event('input'));
    const workSummaryZero = docFilter.getElementById('worksResultSummary').textContent;
    assert.ok(workSummaryZero.includes('Showing 0 of 32 Works'));
    const listHtmlZero = docFilter.getElementById('worksListContainer').innerHTML;
    const readerHtmlZero = docFilter.getElementById('worksReaderPanel').innerHTML;
    assert.ok(listHtmlZero.includes('NO_MATCHING_RECORDS'));
    assert.ok(readerHtmlZero.includes('NO_MATCHING_RECORDS'));
    assert.strictEqual(readerHtmlZero.includes('Catalog Accession:'), false, 'Zero-match must not display archival accession');

    // 3. Clear search restores records and reader
    workInput.value = '';
    workInput.dispatchEvent(new winFilter.Event('input'));
    const workSummaryRestored = docFilter.getElementById('worksResultSummary').textContent;
    assert.ok(workSummaryRestored.includes('Showing 32 of 32 Works'));
    const readerHtmlRestored = docFilter.getElementById('worksReaderPanel').innerHTML;
    assert.strictEqual(readerHtmlRestored.includes('NO_MATCHING_RECORDS'), false);
    assert.ok(readerHtmlRestored.includes('Catalog Accession:'));

    // 4. Batch-B zero-match query
    docFilter.querySelector('[data-work-cluster="BATCH_B"]').click();
    assert.ok(docFilter.getElementById('worksResultSummary').textContent.includes('Showing 7 of 7'));
    workInput.value = 'no_batch_b_match_xyz';
    workInput.dispatchEvent(new winFilter.Event('input'));
    assert.ok(docFilter.getElementById('worksResultSummary').textContent.includes('Showing 0 of 7'));
    assert.ok(docFilter.getElementById('worksReaderPanel').innerHTML.includes('NO_MATCHING_RECORDS'));

    // 5. Protocols zero-match query
    docFilter.querySelector('[data-view="protocols"]').click();
    assert.strictEqual(docFilter.body.getAttribute('data-view'), 'protocols');
    const protoInput = docFilter.getElementById('protocolSearchInput');
    protoInput.value = 'zero_match_protocol_query_xyz';
    protoInput.dispatchEvent(new winFilter.Event('input'));
    assert.ok(docFilter.getElementById('protocolsResultSummary').textContent.includes('Showing 0 of 21'));
    assert.ok(docFilter.getElementById('protocolsReaderPanel').innerHTML.includes('NO_MATCHING_RECORDS'));

    // --- V41-F03: Standalone Offline Footer Navigation ---
    // A. Offline file: execution
    const domOffline = createVixenDOM(html, { url: 'file:///C:/test/vix-cyb.html' });
    const docOffline = domOffline.window.document;
    const footLinkOffline = docOffline.getElementById('footerEncyclopediaLink');
    assert.strictEqual(footLinkOffline.getAttribute('href'), '#overview');
    assert.ok(footLinkOffline.textContent.includes('Offline'));

    // B. Hosted http: execution
    const domHosted = createVixenDOM(html, { url: 'http://localhost:3000/encyclopedia/vix-cyb.html' });
    const docHosted = domHosted.window.document;
    const footLinkHosted = docHosted.getElementById('footerEncyclopediaLink');
    assert.strictEqual(footLinkHosted.getAttribute('href'), '/encyclopedia/');

    // --- V41-F04: Gate Decoupling & Local Hypothesis Verification ---
    const domGateTest = createVixenDOM(html);
    const winGateTest = domGateTest.window;
    const initialVerify = winGateTest.VixenReference.verify();
    assert.strictEqual(initialVerify.canonical_gates_default_unadjudicated, true);
    assert.strictEqual(initialVerify.initial_runtime_gates_unadjudicated, true);
    assert.strictEqual(initialVerify.human_gates_default_unadjudicated, true);
    assert.strictEqual(initialVerify.session_gates_hypothetically_modified, false);
    assert.strictEqual(initialVerify.human_closure_authority, 'RESERVED_TAWANNA_C_MILLER');

    // Reader experiments with HYP_MERGED on Gate 1 and HYP_SPLIT on Gate 2
    domGateTest.window.document.querySelector('[data-view="gates"]').click();
    domGateTest.window.document.querySelector('[data-gate-set="1:HYP_MERGED"]').click();
    domGateTest.window.document.querySelector('[data-gate-set="2:HYP_SPLIT"]').click();

    const postHypothesisVerify = winGateTest.VixenReference.verify();
    // Canonical default integrity remains TRUE
    assert.strictEqual(postHypothesisVerify.canonical_gates_default_unadjudicated, true);
    assert.strictEqual(postHypothesisVerify.initial_runtime_gates_unadjudicated, true);
    assert.strictEqual(postHypothesisVerify.human_gates_default_unadjudicated, true);
    // Session hypothesis state correctly reflects reader experimentation
    assert.strictEqual(postHypothesisVerify.session_gates_hypothetically_modified, true);
    assert.strictEqual(postHypothesisVerify.session_gate_hypotheses['1'], 'HYP_MERGED');
    assert.strictEqual(postHypothesisVerify.session_gate_hypotheses['2'], 'HYP_SPLIT');
    assert.strictEqual(postHypothesisVerify.scientific_authority, false);

    // --- V41-Q06: Route History & Four Presentation Perspectives ---
    // Direct hash routing on initialization
    const domHashRoute = createVixenDOM(html, { url: 'http://localhost:3000/encyclopedia/vix-cyb.html#gates' });
    assert.strictEqual(domHashRoute.window.document.body.getAttribute('data-view'), 'gates');

    // Four presentation perspectives transform editorial labels over shared metadata
    const domLens = createVixenDOM(html);
    const docLens = domLens.window.document;
    docLens.querySelector('[data-view="works"]').click();
    docLens.querySelector('[data-aia-proj="AUDIT"]').click();
    assert.ok(docLens.getElementById('worksResultSummary').textContent.includes('Evidence & Verification perspective'));
    docLens.querySelector('[data-aia-proj="CUSTODIAL"]').click();
    assert.ok(docLens.getElementById('worksResultSummary').textContent.includes('Curatorial Custody perspective'));
  });

});
