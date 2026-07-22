import { readFileSync, writeFileSync } from 'node:fs';

function replaceOnce(path, before, after) {
  const source = readFileSync(path, 'utf8');
  if (!source.includes(before)) throw new Error(`Expected Stage 3 integration seam missing in ${path}`);
  if (source.indexOf(before) !== source.lastIndexOf(before)) throw new Error(`Stage 3 integration seam is not unique in ${path}`);
  writeFileSync(path, source.replace(before, after));
}

const mainPath = 'app/safe-harbor/app/main.js';
replaceOnce(
  mainPath,
  "  const MIN_LANE_WORDS = 40;\n",
  "  const MIN_LANE_WORDS = 40;\n  const PUBLIC_MATURE_LANE_WORDS = 360;\n"
);

replaceOnce(
  mainPath,
  "    window.addEventListener('td613:badge-render', (event) => handleRenderer(event.detail || {}));\n",
  "    window.addEventListener('td613:badge-render', (event) => handleRenderer(event.detail || {}));\n    window.addEventListener('td613:safe-harbor:stage3-request-state', emitStage3State);\n    window.addEventListener('td613:safe-harbor:countersign-request', (event) => void handleStage3CountersignRequest(event.detail || {}));\n"
);

replaceOnce(
  mainPath,
  `  function render() {
    updateHelpers();
    updateFooterPreview();
    renderIngress();
    renderBatchIntake();
    renderHooks();
    renderPacket();
    renderDynamicLaneState();
    renderAudit();
    renderSafeHarborReceipt();
    renderThermal();
    renderCoherenceSigil();
    renderRailState();
  }

  function renderRailState() {`,
  `  function render() {
    updateHelpers();
    updateFooterPreview();
    renderIngress();
    renderBatchIntake();
    renderHooks();
    renderPacket();
    renderDynamicLaneState();
    renderAudit();
    renderSafeHarborReceipt();
    renderThermal();
    renderCoherenceSigil();
    renderRailState();
    emitStage3State();
  }

  function buildStage3PacketSummary() {
    const packet = state.packet || null;
    if (!packet) return null;
    const canon = packet.canon || {};
    const issuance = packet.issuance || {};
    const evidence = packet.authorship_evidence || {};
    const binding = packet.binding_provenance && packet.binding_provenance.entrant_authorship_binding
      ? packet.binding_provenance.entrant_authorship_binding
      : {};
    const credential = binding.entrant_credential || {};
    const countersignature = binding.countersignature || {
      status: 'unsigned', signed_at_utc: null, signature_digest: null
    };
    const blind = evidence.blind_custody_challenge || {};
    const blindResult = blind.results || blind.result || blind;
    const perturbation = evidence.perturbation_invariance || {};
    const restoration = perturbation.restoration_receipt || {};
    const principalNode = document.querySelector('[data-td613-principal="true"]');
    const issuedShi = issuance.badge_number || null;
    return {
      schema_version: 'td613.safe-harbor.stage3-packet-summary/v1',
      principal: canon.principal || D.canon.principal,
      badge_id: canon.badge_id || D.canon.badge_id,
      claimed_pua: canon.claimed_pua || D.canon.claimed_pua,
      canonical_phrase: canon.canonical_phrase || D.canon.canonical_phrase,
      binding_fragment: canon.binding_fragment || bindingFragment(),
      sac: canon.sac || sacText(),
      footer_mode: canon.footer_mode || dom.inputFooterMode.value || D.trustProfile.current_public_mode,
      shi_number: issuedShi,
      canon_shi: canon.shi_number || null,
      binding_shi: credential.shi_number || null,
      dom_shi: principalNode && principalNode.dataset ? (principalNode.dataset.td613Shi || issuedShi) : issuedShi,
      packet_hash_sha256: packet.packet_hash_sha256 || null,
      stylometric_fingerprint: issuance.stylometric_fingerprint_v3 || issuance.stylometric_fingerprint || null,
      stability_digest: evidence.stability_receipt && evidence.stability_receipt.stability_digest
        ? evidence.stability_receipt.stability_digest
        : null,
      blind_challenge_precommitment_digest: blind.precommitment && blind.precommitment.precommitment_digest
        ? blind.precommitment.precommitment_digest
        : null,
      blind_challenge_result_digest: blind.result_digest || blindResult.result_digest || null,
      restoration_receipt_digest: restoration.restoration_receipt_digest || null,
      genuine_holdout_rank: blindResult.genuine_holdout_rank || blindResult.rank || null,
      nearest_impostor_margin: blindResult.nearest_impostor_margin || blindResult.separation_margin || null,
      imitation_collision_state: blindResult.imitation_collision_state || blindResult.imitation_collision || null,
      blind_challenge: {
        outcome: blindResult.outcome || blindResult.status || null,
        imitation_collision: blindResult.imitation_collision || blindResult.imitation_collision_state || false
      },
      countersignature: clone(countersignature),
      temporal_lineage: clone(packet.temporal_lineage || {}),
      entrant_intake_ts: packet.intake && packet.intake.ts_utc ? packet.intake.ts_utc : packet.created_at || null,
      claim_ceiling: evidence.evidence_contract && evidence.evidence_contract.claim_ceiling
        ? evidence.evidence_contract.claim_ceiling
        : 'Packet-scoped stylometric evidence and custody assertion only; independent identity and universal authorship adjudication are not claimed.',
      historical_example: evidence.evidence_contract && evidence.evidence_contract.historical_example
        ? evidence.evidence_contract.historical_example
        : 'TD613-Binding:#9B07D8B/SAC[X6ZNK5NO51] · payload 5 · 2025-10-17 · ⟐',
      export_gate: packet.bridge && packet.bridge.export_gate ? clone(packet.bridge.export_gate) : null,
      raw_text_included: false,
      telemetry_collected: false
    };
  }

  function emitStage3State() {
    const laneCounts = {};
    KEYS.forEach((key) => { laneCounts[key] = laneWordCount(key); });
    window.dispatchEvent(new CustomEvent('td613:safe-harbor:stage3-state', {
      detail: {
        schema_version: 'td613.safe-harbor.stage3-counted-state/v1',
        public_mode: !getDevModeEnabled(),
        current_lane: currentIngressKey(),
        current_step_index: currentIngressStepIndex(),
        lane_counts: laneCounts,
        mature_threshold: PUBLIC_MATURE_LANE_WORDS,
        threshold_authority: 'safe-harbor-main-counted-state',
        independent_tokenization_performed: false,
        surface_open: surfaceOpen(),
        packet_summary: buildStage3PacketSummary(),
        raw_text_included: false,
        telemetry_collected: false
      }
    }));
  }

  async function handleStage3CountersignRequest(detail) {
    const resultEvent = (status, reason) => window.dispatchEvent(new CustomEvent('td613:safe-harbor:countersign-result', {
      detail: { status, reason: reason || null }
    }));
    if (!detail || detail.userGesture !== true) {
      resultEvent('hold', 'explicit-user-gesture-required');
      return;
    }
    if (!state.packet || !state.packet.issuance || !state.packet.issuance.badge_number) {
      resultEvent('hold', 'issued-packet-required');
      return;
    }
    try {
      const module = await import('./safe-harbor-gen3-evidence-contract.js');
      const countersigned = await module.countersignEntrantAuthorshipBinding(state.packet, {
        signatureType: detail.signatureType || 'entrant-declared-local-digest',
        signedAtUtc: detail.signedAtUtc || nowIso()
      });
      state.packet = countersigned;
      render();
      persist();
      const status = countersigned && countersigned.binding_provenance
        && countersigned.binding_provenance.entrant_authorship_binding
        && countersigned.binding_provenance.entrant_authorship_binding.countersignature
        ? countersigned.binding_provenance.entrant_authorship_binding.countersignature.status
        : 'unsigned';
      if (status !== 'countersigned') {
        resultEvent('hold', 'countersignature-not-attached');
        return;
      }
      logEvent('entrant-authorship-countersigned', {
        status: 'countersigned',
        shi_number: countersigned.issuance.badge_number,
        raw_text_included: false
      });
      resultEvent('pass', null);
    } catch (error) {
      resultEvent('hold', String(error && error.message ? error.message : error));
    }
  }

  function renderRailState() {`
);

const indexPath = 'app/safe-harbor/index.html';
replaceOnce(
  indexPath,
  '  <link rel="stylesheet" href="app/styles.css">\n',
  '  <link rel="stylesheet" href="app/styles.css">\n  <link rel="stylesheet" href="app/safe-harbor-temporal-bloom.css?v=20260722-gen3-stage3">\n'
);

replaceOnce(
  indexPath,
  '          <div class="status-pill" id="ingressProgressPill">0 / 3 lanes</div>',
  '          <div class="status-pill" id="ingressProgressPill">temporal field</div>'
);

replaceOnce(
  indexPath,
  `            <textarea id="ingressStepInput" class="ingress-textarea" placeholder="Speak forward through the membrane."></textarea>
             <div class="ingress-meta" id="ingressStepMeta">No line held yet.</div>`,
  `            <textarea id="ingressStepInput" class="ingress-textarea" placeholder="Speak forward through the membrane." aria-describedby="temporalBloomReassurance temporalBloomRecognition"></textarea>
            <div class="temporal-bloom-shell" id="temporalBloom" data-lane="future_self" data-band="waiting" data-color="grey" data-mature="false" role="status" aria-live="polite" aria-atomic="true">
              <p class="temporal-bloom-reassurance" id="temporalBloomReassurance">Write naturally. Repetition, fragments, pauses, and unfinished thoughts are welcome.</p>
              <div class="temporal-bloom-line" id="temporalBloomLine" data-band="waiting" data-color="grey" aria-hidden="true"></div>
              <p class="temporal-bloom-recognition" id="temporalBloomRecognition">This page is waiting with you.</p>
            </div>
            <div class="ingress-meta" id="ingressStepMeta">This page is waiting with you.</div>`
);

replaceOnce(
  indexPath,
  `              <h2>Canonical packet before the seal</h2>
              <p class="surface-copy">This chamber holds the staged packet, the packet hash, the route recommendation, and the cadence witness before any cryptographic seal is allowed to bind.</p>
              <div class="metric-block roomy">`,
  `              <h2>Canonical packet before the seal</h2>
              <p class="surface-copy">This chamber holds the staged packet, the packet hash, the route recommendation, and the cadence witness before any cryptographic seal is allowed to bind.</p>
              <section class="stage3-provenance-panel" id="stage3ProvenancePanel" data-td613-stage3-provenance="true" data-state="awaiting-packet" aria-labelledby="stage3ProvenanceTitle">
                <div class="stage3-provenance-head">
                  <div>
                    <span class="surface-kicker">PUA Provenance Attestation</span>
                    <h3 class="stage3-provenance-title" id="stage3ProvenanceTitle">Packet-scoped authorship and custody</h3>
                  </div>
                  <span class="surface-state" id="stage3Countersignature">UNSIGNED</span>
                </div>
                <div class="stage3-shi" id="stage3Shi">not issued</div>
                <dl class="stage3-authority-grid">
                  <dt>Principal</dt><dd id="stage3Principal">tauric.diana.613</dd>
                  <dt>Root binding authority</dt><dd id="stage3BindingAuthority">2025-08-11T03:58:39Z</dd>
                  <dt>Badge-protocol history</dt><dd id="stage3HistoricalAuthority">payload 5 · 2025-10-17</dd>
                  <dt>Entrant credential authority</dt><dd id="stage3EntrantIntake">unavailable</dd>
                  <dt>Countersignature authority</dt><dd id="stage3CountersignatureAuthority">UNSIGNED</dd>
                  <dt>Presentation authority</dt><dd id="stage3PresentationAuthority">unavailable</dd>
                </dl>
                <p class="stage3-authority-reduction" id="stage3AuthorityReduction">Packet evidence unavailable.</p>
                <p class="stage3-export-state" id="stage3ExportState">SVG export held until packet issuance.</p>
                <p class="stage3-claim-ceiling" id="stage3ClaimCeiling">Independent identity adjudication and universal authorship attribution are not claimed.</p>
                <button class="control" id="stage3CountersignButton" type="button" disabled>Countersign Packet-Scoped Authorship &amp; Custody</button>
              </section>
              <div class="metric-block roomy">`
);

replaceOnce(
  indexPath,
  `  <script src="app/main.js?v=202607022110"></script>
  <script src="app/safe-harbor-housekeeping.js?v=202606290035"></script>`,
  `  <script src="app/main.js?v=20260722-gen3-stage3"></script>
  <script type="module" src="app/safe-harbor-temporal-bloom.js?v=20260722-gen3-stage3"></script>
  <script src="app/safe-harbor-housekeeping.js?v=202606290035"></script>`
);

const rendererPath = 'app/safe-harbor/renderers/10_TD613_PUA_Badge_Provenance_Attestation_Renderer_v7_2_1.user.js';
replaceOnce(
  rendererPath,
  "  const WORLD_BRIDGE = 'page-world-dom-bridge-v1';\n",
  "  const WORLD_BRIDGE = 'page-world-dom-bridge-v1';\n  const GEN3_EXTENSION = 'stage3-temporal-bloom-provenance/v1';\n  const ATTESTATION_SCHEMA = 'td613.safe-harbor.pua-provenance-attestation/v1';\n  const SHI_PATTERN = /^TD613-SH-9B07D8B-[0-9A-F]{8}$/u;\n"
);

replaceOnce(
  rendererPath,
  `  function readBadgeMeta(node) {
    const principalNode = (node && node.closest && node.closest(PRINCIPAL_ATTR_SELECTOR))
      || document.querySelector(PRINCIPAL_ATTR_SELECTOR)
      || document.body;
    const ds = (principalNode && principalNode.dataset) ? principalNode.dataset : {};
    return {
      shi: ds.td613Shi || null,
      packet_id: ds.td613PacketId || null,
      packet_hash: ds.td613PacketHash || null,
      stylometric_fingerprint: ds.td613StylometricFingerprint || null
    };
  }
`,
  `  function readBadgeMeta(node) {
    const principalNode = (node && node.closest && node.closest(PRINCIPAL_ATTR_SELECTOR))
      || document.querySelector(PRINCIPAL_ATTR_SELECTOR)
      || document.body;
    const stage3Node = document.querySelector('[data-td613-stage3-provenance="true"]');
    const ds = (principalNode && principalNode.dataset) ? principalNode.dataset : {};
    const s3 = (stage3Node && stage3Node.dataset) ? stage3Node.dataset : {};
    const shi = s3.td613Shi || ds.td613Shi || null;
    return {
      attestation_mode: stage3Node ? 'gen3' : 'legacy',
      shi: shi,
      packet_shi: s3.td613PacketShi || shi,
      canon_shi: s3.td613CanonShi || shi,
      binding_shi: s3.td613BindingShi || shi,
      dom_shi: s3.td613Shi || ds.td613Shi || shi,
      packet_id: ds.td613PacketId || null,
      packet_hash: s3.td613PacketHash || ds.td613PacketHash || null,
      stylometric_fingerprint: s3.td613StylometricFingerprint || ds.td613StylometricFingerprint || null,
      stability_digest: s3.td613StabilityDigest || null,
      blind_challenge_precommitment_digest: s3.td613BlindPrecommitmentDigest || null,
      blind_challenge_result_digest: s3.td613BlindResultDigest || null,
      restoration_receipt_digest: s3.td613RestorationDigest || null,
      genuine_holdout_rank: s3.td613HoldoutRank || null,
      nearest_impostor_margin: s3.td613NearestImpostorMargin || null,
      imitation_collision_state: s3.td613ImitationCollision || 'ABSENT',
      countersignature_status: s3.td613CountersignatureStatus || 'UNSIGNED',
      countersignature_digest: s3.td613CountersignatureDigest || null,
      binding_timestamp: s3.td613BindingTimestamp || '2025-08-11T03:58:39Z',
      historical_date: s3.td613HistoricalDate || '2025-10-17',
      historical_example: s3.td613HistoricalExample || HISTORICAL_EXAMPLE,
      entrant_intake_timestamp: s3.td613EntrantIntakeTimestamp || null,
      countersignature_timestamp: s3.td613CountersignatureTimestamp || null,
      presentation_timestamp: s3.td613PresentationTimestamp || null,
      claim_ceiling: s3.td613ClaimCeiling || 'Independent identity adjudication and universal authorship attribution are not claimed.',
      authority_claim_reduced: s3.td613AuthorityReduced === 'true'
    };
  }
`
);

replaceOnce(
  rendererPath,
  `  function utf8ToBase64(text) {
    return btoa(unescape(encodeURIComponent(text)));
  }

  function makeBadgeSvg(meta) {`,
  `  function utf8ToBase64(text) {
    return btoa(unescape(encodeURIComponent(text)));
  }

  function escapeXml(value) {
    return String(value == null ? '' : value)
      .replace(/&/gu, '&amp;')
      .replace(/</gu, '&lt;')
      .replace(/>/gu, '&gt;')
      .replace(/"/gu, '&quot;')
      .replace(/'/gu, '&apos;');
  }

  function stableCanonicalJson(value) {
    if (value === null || typeof value !== 'object') return JSON.stringify(value);
    if (Array.isArray(value)) return '[' + value.map(stableCanonicalJson).join(',') + ']';
    return '{' + Object.keys(value).sort().map(function (key) {
      return JSON.stringify(key) + ':' + stableCanonicalJson(value[key]);
    }).join(',') + '}';
  }

  function validateAttestationInputs(meta) {
    const m = meta || {};
    if (m.attestation_mode !== 'gen3') return { status: 'pass', reason: null, mode: 'legacy' };
    const values = [m.packet_shi, m.canon_shi, m.binding_shi, m.dom_shi, m.shi];
    if (values.some(function (value) { return !value; })) return { status: 'hold', reason: 'missing-shi' };
    if (values.some(function (value) { return !SHI_PATTERN.test(String(value)); })) return { status: 'hold', reason: 'invalid-shi-format' };
    if (!values.every(function (value) { return value === values[0]; })) return { status: 'hold', reason: 'shi-mismatch' };
    if (m.binding_timestamp !== '2025-08-11T03:58:39Z') return { status: 'hold', reason: 'binding-authority-timestamp-conflict' };
    if (m.historical_date !== '2025-10-17' || m.historical_example !== HISTORICAL_EXAMPLE) return { status: 'hold', reason: 'historical-authority-conflict' };
    if (String(m.countersignature_status).toUpperCase() === 'COUNTERSIGNED' && !m.countersignature_digest) return { status: 'hold', reason: 'invalid-countersignature' };
    if (!m.packet_hash || !m.stability_digest) return { status: 'hold', reason: 'unreconciled-digest' };
    if (!m.presentation_timestamp) return { status: 'hold', reason: 'missing-presentation-authority' };
    return { status: 'pass', reason: null, mode: 'gen3', shi_number: values[0] };
  }

  function buildGen3AttestationMetadata(meta) {
    const m = meta || {};
    const collision = String(m.imitation_collision_state || 'ABSENT').toUpperCase() === 'PRESENT';
    return {
      schema_version: ATTESTATION_SCHEMA,
      extension: GEN3_EXTENSION,
      namespace_anchor: CODEPOINT,
      principal: PRINCIPAL,
      shi_number: m.shi || null,
      svg_shi: m.shi || null,
      packet_hash_sha256: m.packet_hash || null,
      stylometric_fingerprint: m.stylometric_fingerprint || null,
      stability_digest: m.stability_digest || null,
      blind_challenge_precommitment_digest: m.blind_challenge_precommitment_digest || null,
      blind_challenge_result_digest: m.blind_challenge_result_digest || null,
      restoration_receipt_digest: m.restoration_receipt_digest || null,
      genuine_holdout_rank: m.genuine_holdout_rank || null,
      nearest_impostor_margin: m.nearest_impostor_margin || null,
      imitation_collision_state: collision ? 'PRESENT' : 'ABSENT',
      countersignature_status: String(m.countersignature_status || 'UNSIGNED').toUpperCase(),
      countersignature_digest: m.countersignature_digest || null,
      authority_chronology: {
        binding_authority: { authority_class: 'root namespace and covenant binding authority', timestamp: m.binding_timestamp },
        badge_protocol_history: { authority_class: 'first preserved operational badge-protocol specimen', date: m.historical_date, historical_example: m.historical_example },
        entrant_credential_authority: { authority_class: 'packet-specific credential authority', timestamp: m.entrant_intake_timestamp || null },
        entrant_countersignature_authority: { authority_class: 'packet-scoped custody and authorship-assertion authority', timestamp: m.countersignature_timestamp || null },
        presentation_authority: { authority_class: 'presentation and integrity-attestation authority', timestamp: m.presentation_timestamp || null }
      },
      authority_claim_reduced: Boolean(m.authority_claim_reduced || collision),
      historical_example: HISTORICAL_EXAMPLE,
      claim_ceiling: m.claim_ceiling,
      raw_text_included: false
    };
  }

  function makeBadgeSvg(meta) {`
);

replaceOnce(
  rendererPath,
  `  function makeBadgeSvg(meta) {
    const m = meta || {};
    const md = JSON.stringify({
      shi_label: SHI_LABEL,
      shi_number: m.shi || null,
      packet_id: m.packet_id || null,
      packet_hash_sha256: m.packet_hash || null,
      stylometric_fingerprint: m.stylometric_fingerprint || null,
      shi_canonical_footer: SHI_CANONICAL_FOOTER,
      historical_example: HISTORICAL_EXAMPLE,
      binding_text_sha256: BINDING_TEXT_SHA256,
      binding_text_md5: BINDING_TEXT_MD5,
      binding_text_md5_legacy: BINDING_TEXT_MD5,
      binding_text_digest_scope: 'NFC UTF-8 with LF newlines and terminal LF',
      binding_provenance_manifest: 'binding_provenance_manifest.json',
      binding_event_signature_status: 'unsigned',
      preview_svg_sha256: PREVIEW_SVG_SHA256,
      preview_svg_md5: PREVIEW_SVG_MD5,
      principal: PRINCIPAL,
      claimed_pua: CODEPOINT,
      canonical_phrase: CANONICAL_PHRASE,
      display_phrase: DISPLAY_PHRASE,
      fallback_glyph: FALLBACK_GLYPH,
      fallback_reason: FALLBACK_REASON,
      renderer: RENDERER,
      schema_family: SCHEMA_FAMILY,
      semver: SEMVER
    });
    return '<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">' +
      '<metadata id="safeHarborStylometricProvenance">' + md + '</metadata>' +
      '<text x="64" y="80" text-anchor="middle" font-size="64" data-codepoint="' + CODEPOINT + '" aria-label="' + CODEPOINT + '">' + FALLBACK_GLYPH + '</text>' +
      '</svg>';
  }
`,
  `  function makeBadgeSvg(meta) {
    const m = meta || {};
    if (m.attestation_mode !== 'gen3') {
      const legacyMetadata = JSON.stringify({
        shi_label: SHI_LABEL,
        shi_number: m.shi || null,
        packet_id: m.packet_id || null,
        packet_hash_sha256: m.packet_hash || null,
        stylometric_fingerprint: m.stylometric_fingerprint || null,
        historical_example: HISTORICAL_EXAMPLE,
        principal: PRINCIPAL,
        claimed_pua: CODEPOINT,
        renderer: RENDERER,
        schema_family: SCHEMA_FAMILY,
        semver: SEMVER
      });
      return '<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">' +
        '<metadata id="safeHarborStylometricProvenance">' + escapeXml(legacyMetadata) + '</metadata>' +
        '<text x="64" y="80" text-anchor="middle" font-size="64" data-codepoint="' + CODEPOINT + '" aria-label="' + CODEPOINT + '">' + FALLBACK_GLYPH + '</text>' +
        '</svg>';
    }
    const validation = validateAttestationInputs(m);
    if (validation.status !== 'pass') throw new Error('SVG export hold: ' + validation.reason);
    const metadata = buildGen3AttestationMetadata(m);
    const metadataText = escapeXml(stableCanonicalJson(metadata));
    const collisionLine = metadata.imitation_collision_state === 'PRESENT'
      ? 'AI IMITATION COLLISION: PRESENT'
      : 'AI IMITATION COLLISION: ABSENT';
    const authorityLine = metadata.authority_claim_reduced
      ? 'AUTHORITY CLAIM REDUCED'
      : 'PACKET-BOUND AUTHORITY';
    return '<svg viewBox="0 0 640 360" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="td613Title td613Desc">' +
      '<title id="td613Title">TD613 PUA Provenance Attestation</title>' +
      '<desc id="td613Desc">' + escapeXml(authorityLine + '. ' + collisionLine + '.') + '</desc>' +
      '<metadata id="safeHarborGen3Provenance">' + metadataText + '</metadata>' +
      '<rect x="1" y="1" width="638" height="358" rx="24" fill="#071018" stroke="#78dce8" stroke-width="2"/>' +
      '<text x="40" y="64" fill="#f5f7fa" font-size="24" font-family="ui-monospace, monospace">TD613 · U+10D613</text>' +
      '<text x="40" y="112" fill="#78dce8" font-size="20" font-family="ui-monospace, monospace">' + escapeXml(metadata.shi_number) + '</text>' +
      '<text x="40" y="164" fill="#f5f7fa" font-size="16" font-family="ui-monospace, monospace">' + escapeXml(collisionLine) + '</text>' +
      '<text x="40" y="204" fill="#f5f7fa" font-size="16" font-family="ui-monospace, monospace">' + escapeXml(authorityLine) + '</text>' +
      '<text x="40" y="252" fill="#c9d1d9" font-size="14" font-family="ui-monospace, monospace">INDEPENDENT IDENTITY ADJUDICATION: NOT CLAIMED</text>' +
      '<text x="40" y="302" fill="#c9d1d9" font-size="12" font-family="ui-monospace, monospace">Presentation and integrity attestation; packet-scoped custody only.</text>' +
      '</svg>';
  }
`
);

replaceOnce(
  rendererPath,
  `    const meta = readBadgeMeta(badge);
    const svgText = makeBadgeSvg(meta);
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');`,
  `    const meta = readBadgeMeta(badge);
    const validation = validateAttestationInputs(meta);
    if (validation.status !== 'pass') {
      emit('badge-svg-export-held', { reason: validation.reason, shi: meta.shi || null, packet_id: meta.packet_id || null });
      return;
    }
    let svgText;
    try {
      svgText = makeBadgeSvg(meta);
    } catch (error) {
      emit('badge-svg-export-held', { reason: String(error && error.message ? error.message : error), shi: meta.shi || null, packet_id: meta.packet_id || null });
      return;
    }
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');`
);

replaceOnce(
  rendererPath,
  `    aperture_audit_field: APERTURE_AUDIT_FIELD,
    world_bridge: WORLD_BRIDGE
  };`,
  `    aperture_audit_field: APERTURE_AUDIT_FIELD,
    world_bridge: WORLD_BRIDGE,
    gen3_extension: GEN3_EXTENSION,
    attestation_schema: ATTESTATION_SCHEMA,
    build_attestation_svg: makeBadgeSvg,
    build_attestation_metadata: buildGen3AttestationMetadata,
    validate_attestation_inputs: validateAttestationInputs,
    read_badge_meta: readBadgeMeta
  };`
);

const packagePath = 'package.json';
const pkg = JSON.parse(readFileSync(packagePath, 'utf8'));
pkg.scripts['test:safe-harbor:gen3:stage3'] = 'node tests/safe-harbor-gen3-stage3-temporal-bloom.test.mjs && node tests/safe-harbor-gen3-stage3-provenance.test.mjs && node tests/safe-harbor-gen3-stage3-ui-contract.test.mjs && node tests/safe-harbor-gen3-stage3-renderer.test.mjs';
pkg.scripts['test:safe-harbor:gen3:wave-b'] = 'npm run test:safe-harbor:gen3:wave-a && npm run test:safe-harbor:gen3:stage3';
writeFileSync(packagePath, `${JSON.stringify(pkg, null, 2)}\n`);

console.log('Safe Harbor Gen3 Stage 3 integration patch applied.');
