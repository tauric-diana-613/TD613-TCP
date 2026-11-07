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
      if (win.HTMLDialogElement) {
        if (!win.HTMLDialogElement.prototype.showModal) win.HTMLDialogElement.prototype.showModal = function() { this.open = true; };
        if (!win.HTMLDialogElement.prototype.close) win.HTMLDialogElement.prototype.close = function() { this.open = false; };
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

  await t.test('7. Standalone offline execution integrity & zero external requests (D01)', () => {
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

    // D01: Zero automatic external resource declarations
    const externalScripts = [...html.matchAll(/<script\b[^>]*\bsrc\s*=\s*['"]([^'"]+)['"]/gi)];
    assert.strictEqual(
      externalScripts.length,
      0,
      'Document must contain ZERO external <script src> tags'
    );

    const remoteLinks = [...html.matchAll(/<link\b[^>]*\bhref\s*=\s*['"]https?:\/\/([^'"]+)['"]/gi)];
    assert.strictEqual(
      remoteLinks.length,
      0,
      'Document must contain ZERO remote <link href="http..."> stylesheet or preconnect tags'
    );

    const preconnectLinks = [...html.matchAll(/<link\b[^>]*\brel\s*=\s*['"]preconnect['"]/gi)];
    assert.strictEqual(
      preconnectLinks.length,
      0,
      'Document must contain ZERO <link rel="preconnect"> tags'
    );

    const cssImports = [...html.matchAll(/@import\b[^;]+;/gi)];
    assert.strictEqual(
      cssImports.length,
      0,
      'Document must contain ZERO CSS @import declarations'
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


  test('12. Emergence HQ Review #5811994808 Directives (R01 Tracks Search, R02 Deep Link Reconciliation, R03 Runtime Gate Witness & Negative Control, M01 2x2 Operator Calibration)', async () => {
    const html = fs.readFileSync(vixenHtmlPath, 'utf8');
    const dom = createVixenDOM(html);
    const win = dom.window;
    const doc = win.document;

    // --- R01: Prospective Research Tracks Respect Active Search ---
    doc.querySelector('[data-view="protocols"]').click();
    doc.querySelector('[data-inst-family="TRACKS"]').click();
    assert.strictEqual(doc.getElementById('protocolsResultSummary').textContent.includes('Showing 6 of 6'), true);

    const protoInput = doc.getElementById('protocolSearchInput');
    // Search for single track keyword
    protoInput.value = 'Five-Clock';
    protoInput.dispatchEvent(new win.Event('input'));
    assert.strictEqual(doc.getElementById('protocolsResultSummary').textContent.includes('Showing 1 of 6'), true);
    assert.strictEqual(doc.getElementById('protocolsReaderPanel').innerHTML.includes('Track B · Five-Clock Derivative Custody'), true);

    // Zero-match search on tracks
    protoInput.value = 'impossible_giveback_track_xyz';
    protoInput.dispatchEvent(new win.Event('input'));
    assert.strictEqual(doc.getElementById('protocolsResultSummary').textContent.includes('Showing 0 of 6'), true);
    assert.ok(doc.getElementById('protocolsListContainer').innerHTML.includes('NO_MATCHING_RECORDS'));
    assert.ok(doc.getElementById('protocolsReaderPanel').innerHTML.includes('NO_MATCHING_RECORDS'));

    // Clear search on tracks restores 6 tracks and active selection
    protoInput.value = '';
    protoInput.dispatchEvent(new win.Event('input'));
    assert.strictEqual(doc.getElementById('protocolsResultSummary').textContent.includes('Showing 6 of 6'), true);
    assert.strictEqual(doc.getElementById('protocolsListContainer').querySelectorAll('.lexicon-item').length, 6);
    assert.strictEqual(doc.getElementById('protocolsReaderPanel').innerHTML.includes('NO_MATCHING_RECORDS'), false);

    // --- R02: Explicit Deep Links Reconcile Obstructing Search State ---
    // Sequence A: Impossible works search -> valid registered work deep link
    doc.querySelector('[data-view="works"]').click();
    const workInput = doc.getElementById('workSearchInput');
    workInput.value = 'impossible_work_search_query_123';
    workInput.dispatchEvent(new win.Event('input'));
    assert.ok(doc.getElementById('worksReaderPanel').innerHTML.includes('NO_MATCHING_RECORDS'));

    // Navigate to deep link
    win.location.hash = '#works/emwork_085223e721130117f5510975';
    win.dispatchEvent(new win.HashChangeEvent('hashchange'));

    // Verify search query reconciled
    assert.strictEqual(workInput.value, '');
    assert.strictEqual(doc.getElementById('worksReaderPanel').innerHTML.includes('NO_MATCHING_RECORDS'), false);
    assert.ok(doc.getElementById('worksReaderPanel').textContent.includes('emwork_085223e721130117f5510975'));
    const activeWorkBtn = doc.querySelector('[data-select-work="emwork_085223e721130117f5510975"]');
    assert.ok(activeWorkBtn);
    assert.strictEqual(activeWorkBtn.getAttribute('aria-current'), 'true');

    // Sequence B: Impossible protocols search -> valid registered protocol deep link
    doc.querySelector('[data-view="protocols"]').click();
    protoInput.value = 'impossible_proto_query_456';
    protoInput.dispatchEvent(new win.Event('input'));
    assert.ok(doc.getElementById('protocolsReaderPanel').innerHTML.includes('NO_MATCHING_RECORDS'));

    win.location.hash = '#protocols/EPISTEMIC_CONTROL_PLANE_HOSTILE_BATTERY_V0_1';
    win.dispatchEvent(new win.HashChangeEvent('hashchange'));

    assert.strictEqual(protoInput.value, '');
    assert.strictEqual(doc.getElementById('protocolsReaderPanel').innerHTML.includes('NO_MATCHING_RECORDS'), false);
    assert.ok(doc.getElementById('protocolsReaderPanel').textContent.includes('EPISTEMIC_CONTROL_PLANE_HOSTILE_BATTERY_V0_1'));
    const activeProtoBtn = doc.querySelector('[data-select-inst="EPISTEMIC_CONTROL_PLANE_HOSTILE_BATTERY_V0_1"]');
    assert.ok(activeProtoBtn);
    assert.strictEqual(activeProtoBtn.getAttribute('aria-current'), 'true');

    // Sequence C: Return link with configured internal deep link destination
    const domReturn = createVixenDOM(html, { hostConfig: { returnUrl: '#works/emwork_085223e721130117f5510975' } });
    const docReturn = domReturn.window.document;
    // Set obstructing search
    const wSearch = docReturn.getElementById('workSearchInput');
    wSearch.value = 'obstructing_search_query_789';
    wSearch.dispatchEvent(new domReturn.window.Event('input'));
    assert.ok(docReturn.getElementById('worksReaderPanel').innerHTML.includes('NO_MATCHING_RECORDS'));

    // Click return link
    const rLink = docReturn.getElementById('vixenReturnLink');
    assert.strictEqual(rLink.getAttribute('href'), '#works/emwork_085223e721130117f5510975');
    rLink.click();
    assert.strictEqual(wSearch.value, '');
    assert.strictEqual(docReturn.getElementById('worksReaderPanel').innerHTML.includes('NO_MATCHING_RECORDS'), false);
    assert.ok(docReturn.getElementById('worksReaderPanel').textContent.includes('emwork_085223e721130117f5510975'));

    // --- R03: Runtime Gate Initialization Witness & Negative Control ---
    const v = win.VixenReference.verify();
    // 1. Canonical source data defaults
    assert.strictEqual(v.canonical_gates_default_unadjudicated, true);
    assert.strictEqual(Object.keys(v.canonical_gate_defaults).length, 8);
    for (let i = 1; i <= 8; i++) {
      assert.strictEqual(v.canonical_gate_defaults[i], 'UNADJUDICATED_PAIR');
    }

    // 2. Initial runtime gate assignments witness
    assert.strictEqual(v.initial_runtime_gates_unadjudicated, true);
    assert.strictEqual(Object.keys(v.initial_runtime_gate_assignments).length, 8);
    for (let i = 1; i <= 8; i++) {
      assert.strictEqual(v.initial_runtime_gate_assignments[i], 'UNADJUDICATED_PAIR');
    }
    assert.strictEqual(v.initial_runtime_gates_witness.all_unadjudicated, true);

    // 3. Subsequent session-local hypothetical modifications
    assert.strictEqual(v.session_gates_hypothetically_modified, false);

    // 4. Negative-control fixture: Deliberately incorrect runtime initialization
    const badRuntimeAssignments = { ...v.initial_runtime_gate_assignments, 1: 'HYP_SPLIT' };
    const badWitness = win.VixenReference.evaluateRuntimeGateWitness(badRuntimeAssignments);
    assert.strictEqual(badWitness.ok, false);
    assert.strictEqual(badWitness.all_unadjudicated, false);
    // Canonical source defaults remain unaffected
    assert.strictEqual(win.VixenReference.verify().canonical_gates_default_unadjudicated, true);

    // Missing gate count in assignments
    const incompleteAssignments = { 1: 'UNADJUDICATED_PAIR', 2: 'UNADJUDICATED_PAIR' };
    const incompleteWitness = win.VixenReference.evaluateRuntimeGateWitness(incompleteAssignments);
    assert.strictEqual(incompleteWitness.ok, false);
    assert.strictEqual(incompleteWitness.all_unadjudicated, false);

    // --- M01: Mathematical Operator Calibration & Regression ---
    function svd2x2(a, b, c, d) {
      const e = a*a + c*c;
      const f = a*b + c*d;
      const g = b*b + d*d;
      const tr = e + g;
      const det = e*g - f*f;
      const disc = Math.sqrt(Math.max(0, tr*tr - 4*det));
      const lambda1 = (tr + disc) / 2;
      const lambda2 = (tr - disc) / 2;
      return {
        sigma1: Math.sqrt(lambda1),
        sigma2: Math.sqrt(lambda2),
        kappa: Math.sqrt(lambda1) / Math.sqrt(lambda2)
      };
    }

    // Repaired 2x2 calibration operator: [[1, 0.5], [0.2, 0.8]]
    const repOp = svd2x2(1, 0.5, 0.2, 0.8);
    assert.ok(Math.abs(repOp.kappa - 2.3275) < 0.0001, 'Repaired operator must have kappa ≈ 2.3275');

    // Old operator [[1, 1], [0.15, 0.85]] had kappa ≈ 3.6472
    const oldOp = svd2x2(1, 1, 0.15, 0.85);
    assert.ok(Math.abs(oldOp.kappa - 3.6472) < 0.0001, 'Old operator had kappa ≈ 3.6472');

    // Rank-1 negative control [[1, 1], [0.15, 0.15]]
    const rank1Op = svd2x2(1, 1, 0.15, 0.15);
    assert.strictEqual(rank1Op.sigma2, 0); // det = 0, rank 1

    // Verify HTML displays the calibrated [[1, 0.5], [0.2, 0.8]] in Observatory aperture tab
    assert.ok(html.includes("0.2 & 0.8"));
    assert.ok(html.includes("A_{2×2} = [[1, 0.5], [0.2, 0.8]] (κ ≈ 2.3275)"));
  });

  await t.test('13. Emergence HQ Review Findings (D01-D06: Zero External Dependencies, Execution Contract & Semantic Math Fallback)', () => {
    // Contract verification in handoff manifest
    const manifestMatch = html.match(/<script type="application\/json" id="vixen-astra-handoff">([\s\S]*?)<\/script>/);
    assert.ok(manifestMatch, 'Handoff manifest #vixen-astra-handoff must exist');
    const handoff = JSON.parse(manifestMatch[1]);
    assert.strictEqual(handoff.predecessor_commit, '893e391a522eda0f9ad66100c948f4cd19e56917');
    assert.strictEqual(handoff.predecessor_html_sha256, 'e4388e0a6a538b98d695a40fc7e46d342d5072d9f75fe86cf10d14188c556017');
    assert.strictEqual(handoff.external_resource_requests_contract, 'STANDALONE_EXTERNAL_RESOURCE_REQUESTS = 0');
    assert.strictEqual(handoff.standalone_external_dependencies_count, 0);

    // Verify window.VixenReference.verify() attestation
    const dom = createVixenDOM(html);
    const win = dom.window;
    const v = win.VixenReference.verify();
    assert.strictEqual(v.external_resource_requests_contract, 'STANDALONE_EXTERNAL_RESOURCE_REQUESTS = 0');
    assert.strictEqual(v.standalone_external_dependencies_count, 0);

    // D02: Semantic mathematical fallbacks across all 22 folios
    const corpusMatch = html.match(/<script id="vixen-corpus-bundle" type="application\/json">([\s\S]*?)<\/script>/);
    assert.ok(corpusMatch, 'Corpus bundle must exist');
    const corpus = JSON.parse(corpusMatch[1]);
    assert.strictEqual(corpus.formula_folios.length, 22, 'Must contain 22 formula folios');
    corpus.formula_folios.forEach((folio) => {
      assert.ok(folio.latex && folio.latex.length > 0, `Folio ${folio.id} must have non-empty LaTeX`);
      assert.ok(folio.fallback && folio.fallback.length > 0, `Folio ${folio.id} must have non-empty fallback`);
    });

    // Check 10 spine stages have LaTeX & fallback
    assert.strictEqual(corpus.spine_stages.length, 10, 'Must contain 10 spine stages');
    corpus.spine_stages.forEach((stage) => {
      assert.ok(stage.latex && stage.latex.length > 0, `Stage ${stage.code} must have non-empty LaTeX`);
      assert.ok(stage.fallback && stage.fallback.length > 0, `Stage ${stage.code} must have non-empty fallback`);
    });

    // Check Observatory models have LaTeX & fallback
    const obsBlocks = win.document.querySelectorAll('#obsMathBox');
    assert.ok(obsBlocks.length > 0, '#obsMathBox must exist in DOM');
    const obsMath = obsBlocks[0];
    assert.ok(obsMath.getAttribute('data-latex'), 'Obs math must have data-latex');
    assert.ok(obsMath.querySelector('.math-fallback'), 'Obs math must contain .math-fallback');
    assert.ok(obsMath.getAttribute('role') === 'math', 'Obs math must have role="math"');

    // Matrix legibility: RC-07 must preserve rank-deficient negative control and lifted 2x2/3x2 operators
    const rc07 = corpus.formula_folios.find((f) => f.id === 'RC-07');
    assert.ok(rc07, 'RC-07 folio must exist');
    assert.ok(rc07.fallback.includes('[[1, 1], [0.15, 0.15]]') || rc07.fallback.includes('[[1,1],[0.15,0.15]]'), 'RC-07 must format rank-1 negative control matrix with brackets');
    assert.ok(rc07.fallback.includes('A_{2×2} (κ ≈ 2.3275)'), 'RC-07 must reference calibrated A_{2×2}');
    assert.ok(rc07.fallback.includes('A_{3×2} (κ ≈ 2.6311)'), 'RC-07 must reference 3×2 probe');

    // D03: Native system font stacks declared in structural CSS
    assert.ok(html.includes('--font-sans'), 'Must define --font-sans');
    assert.ok(html.includes('--font-display'), 'Must define --font-display');
    assert.ok(html.includes('--font-serif'), 'Must define --font-serif');
    assert.ok(html.includes('--font-mono'), 'Must define --font-mono');
    assert.ok(html.includes('system-ui'), 'Sans must include system-ui fallback');
    assert.ok(html.includes('Georgia'), 'Serif must include Georgia fallback');
    assert.ok(html.includes('Consolas'), 'Mono must include Consolas fallback');
  });

  await t.test('14. Emergence HQ Review #5812619950 Directives (X01 Visible Search Clearing, X02 Selection/URL Agreement, X03 Batch-B Status Inapplicability)', async (t2) => {
    // Subtest X01: Stale Visible Search Fields After Cross-Feature Navigation
    await t2.test('X01: openRecordById synchronizes visible input value and application query state', () => {
      const dom = createVixenDOM(html, { url: 'http://localhost:3000/encyclopedia/vix-cyb.html#works' });
      const win = dom.window;
      const doc = win.document;

      // 1. Works: set impossible query into #workSearchInput
      const workInput = doc.getElementById('workSearchInput');
      assert.ok(workInput, '#workSearchInput must exist');
      workInput.value = 'impossible_query_xyz';
      workInput.dispatchEvent(new win.Event('input'));

      // Verify empty state rendered
      const summaryEl = doc.getElementById('worksResultSummary');
      assert.ok(summaryEl.textContent.includes('0 of 32'), 'Must report 0 of 32 Works for impossible query');

      // Now pick a registered work via global search modal (Cmd+K flow)
      const globalInput = doc.getElementById('globalSearchInput');
      assert.ok(globalInput, '#globalSearchInput must exist');
      globalInput.value = 'algedonic';
      globalInput.dispatchEvent(new win.Event('input'));

      const results = doc.getElementById('globalSearchResults');
      const pick = results.querySelector('[data-search-pick]');
      assert.ok(pick, 'Must have at least one search pick');
      const pickedWorkId = pick.getAttribute('data-search-pick');
      pick.click();

      // Verification of X01 acceptance predicate in Works:
      assert.strictEqual(workInput.value, '', 'Visible work search input value must be cleared after cross-feature navigation');
      assert.strictEqual(summaryEl.textContent.includes('32 of 32'), true, 'Works summary must report 32 of 32 after clearing obstructing query');

      // Verify target work is selected, aria-current is true, reader displays it, and URL hash reflects it
      const currentWorkBtn = doc.querySelector('[data-select-work="' + pickedWorkId + '"]');
      assert.ok(currentWorkBtn, 'Target work button must be rendered in list');
      assert.strictEqual(currentWorkBtn.getAttribute('aria-current'), 'true', 'Target work button must have aria-current="true"');
      const readerHeader = doc.querySelector('#worksReaderPanel h2');
      assert.ok(readerHeader, 'Works reader panel must have header');
      assert.ok(win.location.hash.includes(pickedWorkId), 'URL hash must reflect selected work ID');

      // 2. Protocols: set impossible query into #protocolSearchInput
      // Navigate to Protocols view first
      const protoNavBtn = doc.querySelector('.nav-btn[data-view="protocols"]');
      assert.ok(protoNavBtn, 'Protocols nav button must exist');
      protoNavBtn.click();

      const protoInput = doc.getElementById('protocolSearchInput');
      assert.ok(protoInput, '#protocolSearchInput must exist');
      protoInput.value = 'impossible_proto_query_xyz';
      protoInput.dispatchEvent(new win.Event('input'));

      const protoSummary = doc.getElementById('protocolsResultSummary');
      assert.ok(protoSummary.textContent.includes('0 of 21'), 'Must report 0 of 21 Protocols for impossible query');

      // Pick a registered protocol via global search
      globalInput.value = 'epistemic';
      globalInput.dispatchEvent(new win.Event('input'));
      const protoPick = results.querySelector('[data-search-pick]');
      assert.ok(protoPick, 'Must find protocol search pick');
      const pickedInstId = protoPick.getAttribute('data-search-pick');
      protoPick.click();

      // Verification of X01 in Protocols:
      assert.strictEqual(protoInput.value, '', 'Visible protocol search input value must be cleared after cross-feature navigation');
      assert.strictEqual(protoSummary.textContent.includes('21 of 21'), true, 'Protocols summary must report 21 of 21 after clearing obstructing query');
      const currentInstBtn = doc.querySelector('[data-select-inst="' + pickedInstId + '"]');
      assert.ok(currentInstBtn, 'Target instrument button must be rendered in list');
      assert.strictEqual(currentInstBtn.getAttribute('aria-current'), 'true', 'Target instrument button must have aria-current="true"');
      assert.ok(win.location.hash.includes(pickedInstId), 'URL hash must reflect selected instrument ID');
    });

    // Subtest X02: Selected-record, filtered-reader and URL disagreement
    await t2.test('X02: Filter transitions synchronize selected ID, aria-current, reader, and URL hash', () => {
      const dom = createVixenDOM(html, { url: 'http://localhost:3000/encyclopedia/vix-cyb.html#works' });
      const win = dom.window;
      const doc = win.document;

      // 1. Works: Switch to Confirmed Dual (13 works)
      const confirmedBtn = doc.querySelector('[data-work-status="SAME_WORK_CONFIRMED"]');
      assert.ok(confirmedBtn, 'Confirmed Dual button must exist');
      confirmedBtn.click();

      // Check current selection
      const confirmedSelected = doc.querySelector('[data-select-work][aria-current="true"]');
      assert.ok(confirmedSelected, 'A work must be selected under Confirmed Dual');
      const confWorkId = confirmedSelected.getAttribute('data-select-work');
      assert.ok(win.location.hash.includes(confWorkId), 'URL hash must match selected work under Confirmed Dual');

      // 2. Switch to Singleton filter (11 works)
      const singletonBtn = doc.querySelector('[data-work-status="SINGLETON_WORK_SURFACE"]');
      assert.ok(singletonBtn, 'Singleton button must exist');
      singletonBtn.click();

      // Under Singleton, the previous Confirmed Dual work is excluded.
      // Selection must deterministically fall back to the first singleton work (emwork_0d33e61fc09e51761acb87d9).
      const singletonSelected = doc.querySelector('[data-select-work][aria-current="true"]');
      assert.ok(singletonSelected, 'A work must be selected under Singleton');
      const singWorkId = singletonSelected.getAttribute('data-select-work');
      assert.notStrictEqual(singWorkId, confWorkId, 'Previous selection must not persist when excluded by filter');

      // Acceptance predicate: URL record ID === state selected ID === aria-current ID === reader record ID
      const expectedSingletonId = 'emwork_0d33e61fc09e51761acb87d9';
      assert.strictEqual(singWorkId, expectedSingletonId, 'Deterministic fallback selection must be emwork_0d33e61fc09e51761acb87d9');
      assert.strictEqual(win.location.hash, '#works/' + expectedSingletonId, 'URL hash must synchronize to fallback selection');
      const readerHeader = doc.querySelector('#worksReaderPanel h2').textContent;
      assert.ok(readerHeader.length > 0, 'Reader header must be populated');

      // 3. Zero-match query in Works: URL must drop record ID to #works
      const workInput = doc.getElementById('workSearchInput');
      workInput.value = 'zero_match_test_query';
      workInput.dispatchEvent(new win.Event('input'));
      assert.strictEqual(win.location.hash, '#works', 'URL hash must fall back to base #works when 0 matches remain');
      assert.ok(doc.querySelector('[data-state="NO_MATCHING_RECORDS"]'), 'Empty state must be displayed');

      // 4. Protocols: Navigate to Protocols tab
      const protoNavBtn = doc.querySelector('.nav-btn[data-view="protocols"]');
      assert.ok(protoNavBtn, 'Protocols nav button must exist');
      protoNavBtn.click();

      // Switch to F1 (4 instruments)
      const f1Btn = doc.querySelector('[data-inst-family="F1"]');
      assert.ok(f1Btn, 'F1 button must exist');
      f1Btn.click();

      const f1Selected = doc.querySelector('[data-select-inst][aria-current="true"]');
      assert.ok(f1Selected, 'An instrument must be selected under F1');
      const f1InstId = f1Selected.getAttribute('data-select-inst');
      assert.strictEqual(f1InstId, 'ACADEMIA_SUI_GENERIS_SIEVE_V0_1', 'F1 must select ACADEMIA_SUI_GENERIS_SIEVE_V0_1');
      assert.strictEqual(win.location.hash, '#protocols/ACADEMIA_SUI_GENERIS_SIEVE_V0_1', 'URL hash must match visible F1 selection');

      // 5. Protocols: Switch to TRACKS (6 tracks)
      const tracksBtn = doc.querySelector('[data-inst-family="TRACKS"]');
      assert.ok(tracksBtn, 'TRACKS button must exist');
      tracksBtn.click();

      const trackSelected = doc.querySelector('[data-select-track][aria-current="true"]');
      assert.ok(trackSelected, 'A track must be selected under TRACKS');
      const trackId = trackSelected.getAttribute('data-select-track');
      assert.strictEqual(trackId, 'TRACK-A', 'TRACKS must select TRACK-A');
      assert.strictEqual(win.location.hash, '#protocols/TRACK-A', 'URL hash must match visible track selection');
    });

    // Subtest X03: Incompatible Work-status control during Batch-B browsing
    await t2.test('X03: Entering Batch-B dims and disables status controls; returning restores canonical status', () => {
      const dom = createVixenDOM(html, { url: 'http://localhost:3000/encyclopedia/vix-cyb.html#works' });
      const win = dom.window;
      const doc = win.document;

      // 1. In canonical works, select Confirmed Dual
      const confirmedBtn = doc.querySelector('[data-work-status="SAME_WORK_CONFIRMED"]');
      confirmedBtn.click();
      assert.strictEqual(confirmedBtn.getAttribute('aria-pressed'), 'true', 'Confirmed Dual must be pressed in canonical works');

      // 2. Switch cluster to Batch-B (+7 Batch-B Annex)
      const batchBBtn = doc.querySelector('[data-work-cluster="BATCH_B"]');
      assert.ok(batchBBtn, 'Batch-B cluster button must exist');
      batchBBtn.click();

      // Check 7 Batch-B records rendered
      const batchBItems = doc.querySelectorAll('[data-select-batchb]');
      assert.strictEqual(batchBItems.length, 7, 'Must display exactly 7 Batch-B records');

      // X03 acceptance: Confirmed Dual must NOT remain pressed
      assert.strictEqual(confirmedBtn.getAttribute('aria-pressed'), 'false', 'Confirmed Dual must NOT be aria-pressed under Batch-B');
      assert.strictEqual(confirmedBtn.disabled, true, 'Status buttons must be disabled under Batch-B');
      assert.strictEqual(confirmedBtn.getAttribute('aria-disabled'), 'true', 'Status buttons must have aria-disabled="true" under Batch-B');

      // Status group must indicate inapplicability
      const statusGroup = doc.querySelector('[role="group"][aria-label*="Status Filter"]');
      assert.ok(statusGroup, 'Status group must exist');
      assert.ok(statusGroup.getAttribute('aria-label').includes('Inapplicable to Batch-B Annex'), 'Status group label must indicate inapplicability to Batch-B');
      assert.strictEqual(statusGroup.style.opacity, '0.45', 'Status group must be dimmed');

      // Clicking a status button during Batch-B must be a no-op
      const singletonBtn = doc.querySelector('[data-work-status="SINGLETON_WORK_SURFACE"]');
      singletonBtn.click();
      const stillBatchBItems = doc.querySelectorAll('[data-select-batchb]');
      assert.strictEqual(stillBatchBItems.length, 7, 'Batch-B records must still be displayed after clicking status button');
      assert.strictEqual(singletonBtn.getAttribute('aria-pressed'), 'false', 'Singleton must remain unpressed under Batch-B');

      // 3. Switch back to canonical Works (e.g. All 32)
      const allClusterBtn = doc.querySelector('[data-work-cluster="ALL"]');
      allClusterBtn.click();

      // Canonical status must be restored (Confirmed Dual restored from state.lastCanonicalWorkStatus)
      assert.strictEqual(confirmedBtn.disabled, false, 'Status buttons must be re-enabled when returning to canonical Works');
      assert.strictEqual(confirmedBtn.getAttribute('aria-disabled'), 'false', 'Status buttons must have aria-disabled="false"');
      assert.strictEqual(confirmedBtn.getAttribute('aria-pressed'), 'true', 'Confirmed Dual must be restored to aria-pressed="true"');
      assert.strictEqual(statusGroup.style.opacity, '1', 'Status group must return to full opacity');
      assert.strictEqual(statusGroup.getAttribute('aria-label'), 'Identity Status Filter', 'Status group label must be restored');

      const worksItems = doc.querySelectorAll('[data-select-work]');
      assert.strictEqual(worksItems.length, 13, 'Must display the 13 Confirmed Dual works restored from memory');
    });
  });

});
