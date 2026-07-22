import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium, firefox, webkit } from 'playwright';

const BASE_URL = String(process.env.TD613_BASE_URL || 'https://td613.com').replace(/\/+$/u, '');
const SOURCE_PACKET_COMMIT = String(process.env.TD613_SOURCE_PACKET_COMMIT || '').trim();
const ARTIFACT_DIR = path.resolve(process.env.TD613_ARTIFACT_DIR || 'artifacts/safe-harbor-gen3-production');
const BROWSER_NAMES = String(process.env.TD613_BROWSERS || 'chromium,firefox,webkit')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);

const browserTypes = { chromium, firefox, webkit };
const protectedFiles = [
  'app/safe-harbor/app/safe-harbor-gen3-evidence-contract.js',
  'app/safe-harbor/app/safe-harbor-gen3-authorship-maturity.js',
  'app/safe-harbor/app/safe-harbor-gen3-stage2-controls.js',
  'app/safe-harbor/app/safe-harbor-native-finalizer.js',
  'app/safe-harbor/app/safe-harbor-packet-pipeline.js',
  'app/safe-harbor/schemas/td613-safe-harbor.authorship-evidence.v1.schema.json',
  'app/safe-harbor/schemas/td613-safe-harbor.entrant-authorship-binding.v1.schema.json',
  'app/safe-harbor/schemas/td613-safe-harbor.forensic-authorship-report.v1.schema.json',
  'app/safe-harbor/schemas/td613-safe-harbor.authorship-maturity.v1.schema.json'
];

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function safeFileName(value) {
  return value.replace(/[^a-z0-9_-]+/giu, '-').replace(/^-+|-+$/gu, '').toLowerCase();
}

async function verifySourceParity() {
  const files = [];
  for (const repositoryPath of protectedFiles) {
    const localBytes = await readFile(repositoryPath);
    const response = await fetch(`${BASE_URL}/${repositoryPath}`, {
      headers: { 'cache-control': 'no-cache', pragma: 'no-cache' },
      redirect: 'follow'
    });
    assert(response.ok, `Safe Harbor production source fetch held for ${repositoryPath}: ${response.status}`);
    const deployedBytes = Buffer.from(await response.arrayBuffer());
    const localSha256 = sha256(localBytes);
    const deployedSha256 = sha256(deployedBytes);
    files.push({
      repository_path: repositoryPath,
      deployed_url: response.url,
      local_sha256: localSha256,
      deployed_sha256: deployedSha256,
      exact_match: localSha256 === deployedSha256,
      local_bytes: localBytes.length,
      deployed_bytes: deployedBytes.length
    });
  }
  const mismatches = files.filter((file) => !file.exact_match);
  return {
    status: mismatches.length ? 'HOLD' : 'PASS',
    exact_source_content_verified: mismatches.length === 0,
    application_tree_drift: mismatches.length ? 'detected' : 'none',
    files,
    mismatch_count: mismatches.length
  };
}

async function runBrowserCase(browserName, profile) {
  const browserType = browserTypes[browserName];
  assert(browserType, `Unsupported browser requested: ${browserName}`);
  const browser = await browserType.launch({ headless: true });
  const context = await browser.newContext({
    viewport: profile.viewport,
    reducedMotion: profile.reducedMotion,
    colorScheme: profile.colorScheme || 'light'
  });
  const page = await context.newPage();
  const pageErrors = [];
  const consoleErrors = [];
  const writesDuringSyntheticProbe = [];
  let syntheticProbeActive = false;
  page.on('pageerror', (error) => pageErrors.push(String(error?.stack || error?.message || error)));
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('request', (request) => {
    if (!syntheticProbeActive) return;
    const method = request.method().toUpperCase();
    if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
      writesDuringSyntheticProbe.push({ method, url: request.url(), post_data_present: Boolean(request.postData()) });
    }
  });

  const startedAt = Date.now();
  let navigationStatus = null;
  let ui = null;
  let packet = null;
  let screenshot = null;
  try {
    const response = await page.goto(`${BASE_URL}/safe-harbor/?wave-a-production-observer=1`, {
      waitUntil: 'domcontentloaded',
      timeout: 45_000
    });
    navigationStatus = response?.status() ?? null;
    assert(response && response.ok(), `Safe Harbor navigation held in ${browserName}/${profile.id}: ${navigationStatus}`);
    await page.waitForTimeout(1500);

    ui = await page.evaluate(() => {
      const focusable = Array.from(document.querySelectorAll('a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'))
        .filter((element) => {
          const style = getComputedStyle(element);
          const rect = element.getBoundingClientRect();
          return style.visibility !== 'hidden' && style.display !== 'none' && rect.width > 0 && rect.height > 0;
        });
      return {
        title: document.title,
        body_present: Boolean(document.body),
        body_text_length: document.body?.innerText?.length || 0,
        focusable_count: focusable.length,
        reduced_motion: matchMedia('(prefers-reduced-motion: reduce)').matches,
        viewport_width: innerWidth,
        viewport_height: innerHeight,
        document_scroll_width: document.documentElement.scrollWidth,
        horizontal_overflow_px: Math.max(0, document.documentElement.scrollWidth - innerWidth)
      };
    });
    assert(ui.body_present && ui.body_text_length > 0, `Safe Harbor rendered no readable body in ${browserName}/${profile.id}`);
    assert(ui.focusable_count > 0, `Safe Harbor exposed no keyboard-focusable control in ${browserName}/${profile.id}`);
    assert(ui.reduced_motion === (profile.reducedMotion === 'reduce'), `Reduced-motion media state drifted in ${browserName}/${profile.id}`);
    assert(ui.horizontal_overflow_px <= 2, `Safe Harbor horizontal overflow held in ${browserName}/${profile.id}: ${ui.horizontal_overflow_px}px`);

    await page.keyboard.press('Tab');
    const focus = await page.evaluate(() => ({
      tag: document.activeElement?.tagName || null,
      id: document.activeElement?.id || null,
      body_focused: document.activeElement === document.body
    }));
    assert(!focus.body_focused && focus.tag, `Keyboard focus remained on BODY in ${browserName}/${profile.id}`);
    ui.keyboard_focus = focus;

    syntheticProbeActive = true;
    packet = await page.evaluate(async ({ sourceCommit }) => {
      const nonce = `wavea-${sourceCommit.slice(0, 12)}`;
      const authority = await import(`/app/safe-harbor/app/safe-harbor-authority-verifier.js?${nonce}`);
      const finalizer = await import(`/app/safe-harbor/app/safe-harbor-native-finalizer.js?${nonce}`);
      const evidenceContract = await import(`/app/safe-harbor/app/safe-harbor-gen3-evidence-contract.js?${nonce}`);
      const maturity = await import(`/app/safe-harbor/app/safe-harbor-gen3-authorship-maturity.js?${nonce}`);
      const controls = await import(`/app/safe-harbor/app/safe-harbor-gen3-stage2-controls.js?${nonce}`);

      function sentence(label, index) {
        return `The ${label} lane returns through measured synthetic sentence ${index}, carrying declared limits, recurrent function words, bounded punctuation, traceable structure, and closure.`;
      }
      function text(label) {
        return Array.from({ length: 30 }, (_, index) => sentence(label, index + 1)).join(' ');
      }
      const segments = {
        future_self: text('future'),
        past_self: text('past'),
        higher_self: text('higher')
      };
      function thinLane(key, value) {
        const words = value.trim().split(/\s+/u);
        return {
          source: 'safe-harbor.local.synthetic-production-probe',
          lane: key,
          char_count: value.length,
          word_count: words.length,
          sentence_count: 30,
          avg_word_length: 6,
          avg_sentence_length: 15,
          punctuation_density: 0.02,
          line_break_density: 0,
          unique_ratio: 0.6,
          punctuation_mix: { comma: 0.5, dash: 0, colon: 0, semicolon: 0, exclamation: 0, question: 0 },
          dominant_axes: ['bounded', 'recurrent'],
          temporal_posture: key === 'future_self' ? 'forward' : key === 'past_self' ? 'backward' : 'orthogonal',
          dominant_operator: 'F',
          governed_exposure_depth: 0.5,
          closure_class: 'closed',
          frame_alignment: 'aligned',
          frame_alignment_note: null
        };
      }
      const signatures = Object.fromEntries(Object.entries(segments).map(([key, value]) => [key, thinLane(key, value)]));
      const fixture = {
        schema_version: 'td613.safe-harbor.packet/v1',
        packet_id: 'GEN3-WAVE-A-PRODUCTION-SYNTHETIC',
        created_at: '2026-07-22T00:00:00Z',
        canon: {
          principal: 'tauric.diana.613',
          badge_id: 'bdg_glyph_U10D613',
          claimed_pua: 'U+10D613',
          canonical_phrase: 'Tauric Diana - Crimean heritage custodianship',
          display_phrase: 'Covenant: Blood Rite 613',
          binding_fragment: '#9B07D8B',
          sac: 'SAC[X6ZNK5NO51]',
          footer_mode: 'legacy-compat'
        },
        binding_provenance: {
          schema_version: 'td613.safe-harbor.binding-provenance/v1',
          principal: 'tauric.diana.613',
          claim: {},
          canonical_declaration: {},
          binding_event: { recorded_ts_utc: '2025-08-11T03:58:39Z' },
          legacy_corpus_root: {},
          symbol_roles: {},
          evidence_status: {},
          claim_ceiling: 'Synthetic production probe; packet-internal custody only.'
        },
        intake: { ts_utc: '2026-07-22T00:00:00Z', status: 'issued' },
        analysis: {
          segment_cadence_signatures: signatures,
          triad_resonance: 0.8,
          cross_lane_stability: 0.75,
          cross_lane_spread: 0.25
        },
        issuance: {
          badge_number: null,
          stylometric_fingerprint: 'synthetic-wave-a-production-fingerprint',
          triad_word_counts: Object.fromEntries(Object.entries(signatures).map(([key, lane]) => [key, lane.word_count])),
          triad_shortfalls: { future_self: 0, past_self: 0, higher_self: 0 },
          stylometric_provenance: { divergence_signature: { compact: 'unmistakably synthetic production fixture' } }
        },
        signature: { status: 'declared', sig: null, attached_at: null },
        bridge: { covenant_gate: { confirmed: true }, export_gate: { ready: true, state: 'harbor-eligible', blockers: [], scrub_passed: true } }
      };
      fixture.issuance.badge_number = authority.expectedV2BadgeNumber(fixture);
      const finalized = await finalizer.finalizeSafeHarborPacket(fixture, {
        mode: 'native',
        segments,
        includePhase5: true,
        includeTamperFixtures: false,
        includeGen3Stage1: true,
        includeGen3Stage2: true,
        gen3Context: {
          promptSetVersion: 'temporal-triad/v2',
          promptVocabularyByLane: {
            future_self: ['future'],
            past_self: ['past'],
            higher_self: ['higher']
          }
        }
      });
      const overlaid = evidenceContract.finalizeGen3Stage1Overlay(finalized, {
        domShi: finalized.issuance.badge_number,
        svgShi: finalized.issuance.badge_number
      });
      const exact = evidenceContract.validateGen3ShiExactMatch(overlaid, {
        domShi: finalized.issuance.badge_number,
        svgShi: finalized.issuance.badge_number
      });
      const recomputedHash = await finalizer.computePacketHash(overlaid);
      const exported = JSON.stringify(overlaid);
      const restored = JSON.parse(exported);
      const restoredExact = evidenceContract.validateGen3ShiExactMatch(restored, {
        domShi: restored.issuance.badge_number,
        svgShi: restored.issuance.badge_number
      });
      const rawTextPresent = exported.includes(segments.future_self) || exported.includes(segments.past_self) || exported.includes(segments.higher_self);
      const authorityInflationPresent = /civil identity proved|exclusive ownership proved|universal authorship proved/iu.test(exported);
      return {
        packet_created: Boolean(overlaid.packet_hash_sha256),
        packet_hash_sha256: overlaid.packet_hash_sha256,
        recomputed_hash_sha256: recomputedHash,
        hash_replay_pass: recomputedHash === overlaid.packet_hash_sha256,
        shi_number: overlaid.issuance.badge_number,
        shi_pattern_pass: /^TD613-SH-9B07D8B-[0-9A-F]{8}$/u.test(overlaid.issuance.badge_number || ''),
        shi_exact_match_status: exact.status,
        restored_shi_exact_match_status: restoredExact.status,
        export_restore_hash_pass: restored.packet_hash_sha256 === overlaid.packet_hash_sha256,
        authorship_maturity_schema: overlaid.authorship_evidence?.authorship_maturity?.schema_version || null,
        stability_digest: overlaid.authorship_evidence?.stability_receipt?.stability_digest || null,
        control_receipt_digest: overlaid.authorship_evidence?.authorship_maturity?.null_and_adversarial_posture?.control_receipt?.null_controls_digest || null,
        controls_module_loaded: typeof controls.buildStage2ControlReceipt === 'function',
        maturity_module_loaded: typeof maturity.buildStage2AuthorshipMaturity === 'function',
        raw_text_present: rawTextPresent,
        authority_inflation_present: authorityInflationPresent,
        export_bytes: exported.length,
        source_packet_commit: sourceCommit
      };
    }, { sourceCommit: SOURCE_PACKET_COMMIT });
    syntheticProbeActive = false;

    assert(packet.packet_created, `Synthetic Wave A packet was not created in ${browserName}/${profile.id}`);
    assert(packet.hash_replay_pass, `Synthetic Wave A packet hash failed replay in ${browserName}/${profile.id}`);
    assert(packet.shi_pattern_pass, `Synthetic Wave A SHI format held in ${browserName}/${profile.id}`);
    assert(packet.shi_exact_match_status === 'pass', `Synthetic Wave A SHI exact-match held in ${browserName}/${profile.id}`);
    assert(packet.restored_shi_exact_match_status === 'pass', `Restored Wave A SHI exact-match held in ${browserName}/${profile.id}`);
    assert(packet.export_restore_hash_pass, `Wave A export/restore hash drifted in ${browserName}/${profile.id}`);
    assert(packet.authorship_maturity_schema === 'td613.safe-harbor.authorship-maturity/v1', `Stage 2 maturity schema missing in ${browserName}/${profile.id}`);
    assert(/^sha256:[0-9a-f]{64}$/u.test(packet.stability_digest || ''), `Stage 2 stability digest missing in ${browserName}/${profile.id}`);
    assert(/^sha256:[0-9a-f]{64}$/u.test(packet.control_receipt_digest || ''), `Stage 2 control receipt missing in ${browserName}/${profile.id}`);
    assert(packet.controls_module_loaded && packet.maturity_module_loaded, `Wave A modules failed to load in ${browserName}/${profile.id}`);
    assert(packet.raw_text_present === false, `Raw synthetic entrant text escaped into the packet in ${browserName}/${profile.id}`);
    assert(packet.authority_inflation_present === false, `Authority inflation appeared in ${browserName}/${profile.id}`);
    assert(writesDuringSyntheticProbe.length === 0, `Synthetic Wave A probe emitted a write request in ${browserName}/${profile.id}`);
    assert(pageErrors.length === 0, `Safe Harbor page error in ${browserName}/${profile.id}: ${pageErrors.join(' | ')}`);
    const severeConsoleErrors = consoleErrors.filter((entry) => /(?:uncaught|referenceerror|typeerror|syntaxerror|failed to load module script|safe-harbor.*(?:404|500))/iu.test(entry));
    assert(severeConsoleErrors.length === 0, `Safe Harbor severe console error in ${browserName}/${profile.id}: ${severeConsoleErrors.join(' | ')}`);

    screenshot = path.join(ARTIFACT_DIR, `${safeFileName(browserName)}-${safeFileName(profile.id)}.png`);
    await page.screenshot({ path: screenshot, fullPage: true });
    return {
      status: 'PASS',
      browser: browserName,
      profile: profile.id,
      viewport: profile.viewport,
      reduced_motion_requested: profile.reducedMotion === 'reduce',
      navigation_status: navigationStatus,
      ui,
      packet,
      page_errors: pageErrors,
      console_errors: consoleErrors,
      write_requests_during_synthetic_probe: writesDuringSyntheticProbe,
      screenshot: path.relative(process.cwd(), screenshot),
      duration_ms: Date.now() - startedAt
    };
  } finally {
    syntheticProbeActive = false;
    await context.close();
    await browser.close();
  }
}

async function main() {
  assert(/^[0-9a-f]{40}$/u.test(SOURCE_PACKET_COMMIT), 'TD613_SOURCE_PACKET_COMMIT must be an exact 40-character SHA.');
  assert(BROWSER_NAMES.length > 0, 'At least one browser must be declared.');
  for (const browserName of BROWSER_NAMES) assert(browserTypes[browserName], `Unknown browser: ${browserName}`);
  await mkdir(ARTIFACT_DIR, { recursive: true });

  const receipt = {
    schema_version: 'td613.safe-harbor.gen3-wave-a-production-observation/v1',
    status: 'HOLD',
    source_packet_commit: SOURCE_PACKET_COMMIT,
    production_url: BASE_URL,
    authority: {
      counts_as_human_evidence: false,
      adjudicates_identity_or_ownership: false,
      authorizes_research_track_promotion: false,
      authorizes_stage3: false,
      closes_program: false
    },
    source_parity: null,
    browser_matrix: [],
    cross_browser_determinism: null,
    raw_text_exposure: 'not-observed',
    behavioral_telemetry: 'not-observed'
  };

  try {
    receipt.source_parity = await verifySourceParity();
    assert(receipt.source_parity.status === 'PASS', 'Safe Harbor protected production bytes drifted from the authorized source packet.');

    const profiles = [
      { id: 'desktop-1440x900', viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' },
      { id: 'mobile-390x844-reduced-motion', viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' }
    ];
    for (const browserName of BROWSER_NAMES) {
      for (const profile of profiles) receipt.browser_matrix.push(await runBrowserCase(browserName, profile));
    }

    const hashes = new Set(receipt.browser_matrix.map((entry) => entry.packet.packet_hash_sha256));
    const stabilityDigests = new Set(receipt.browser_matrix.map((entry) => entry.packet.stability_digest));
    const controlDigests = new Set(receipt.browser_matrix.map((entry) => entry.packet.control_receipt_digest));
    receipt.cross_browser_determinism = {
      packet_hash_unique_count: hashes.size,
      stability_digest_unique_count: stabilityDigests.size,
      control_receipt_digest_unique_count: controlDigests.size,
      status: hashes.size === 1 && stabilityDigests.size === 1 && controlDigests.size === 1 ? 'PASS' : 'HOLD'
    };
    assert(receipt.cross_browser_determinism.status === 'PASS', 'Safe Harbor deterministic receipts diverged across browser engines or viewport modes.');
    receipt.raw_text_exposure = 'none-observed';
    receipt.behavioral_telemetry = 'none-observed';
    receipt.status = 'PASS';
  } catch (error) {
    receipt.error = String(error?.stack || error?.message || error);
    throw error;
  } finally {
    const outputPath = path.join(ARTIFACT_DIR, 'safe-harbor-gen3-wave-a-production-observation.json');
    await writeFile(outputPath, `${JSON.stringify(receipt, null, 2)}\n`);
    console.log(JSON.stringify({ status: receipt.status, receipt: outputPath, source_packet_commit: SOURCE_PACKET_COMMIT }, null, 2));
  }
}

await main();
