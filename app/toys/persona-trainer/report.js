function escapeHtml(value = '') {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatPct(value, digits = 0) {
  return `${(Number(value || 0) * 100).toFixed(digits)}%`;
}

function formatNumber(value, digits = 2) {
  return Number(value || 0).toFixed(digits);
}

export function renderFingerprintSummary(extraction, promptBuild) {
  if (!extraction) {
    return '<p class="trainer-empty">Paste a reference corpus, then extract the target voice.</p>';
  }

  const profile = extraction.targetProfile || {};
  const selfSimilarity = extraction.selfSimilarity || {};
  const topConstraints = (promptBuild?.promptConstraints || []).slice(0, 3);

  return `
    <div class="trainer-summary-grid">
      <article class="metric">
        <div class="key">Corpus samples</div>
        <div class="val">${extraction.stats.sampleCount}</div>
        <div class="hint">${extraction.stats.totalWords} words across the pasted corpus.</div>
      </article>
      <article class="metric">
        <div class="key">Self-similarity</div>
        <div class="val">${formatPct(selfSimilarity.meanSimilarity || 1)}</div>
        <div class="hint">Traceability ${formatPct(selfSimilarity.meanTraceability || 1)} inside the corpus itself.</div>
      </article>
      <article class="metric">
        <div class="key">Rhythm mean</div>
        <div class="val">${formatNumber(profile.avgSentenceLength || 0, 1)}w</div>
        <div class="hint">Spread ${formatNumber(profile.sentenceLengthSpread || 0, 1)} across extracted samples.</div>
      </article>
      <article class="metric">
        <div class="key">Register lane</div>
        <div class="val">${escapeHtml(extraction.fingerprint.registerMode || 'unknown')}</div>
        <div class="hint">${topConstraints.map((constraint) => escapeHtml(constraint.level)).join(' / ') || 'Prompt constraints appear here after extraction.'}</div>
      </article>
    </div>
  `;
}

export function renderValidationReport(validation) {
  if (!validation) {
    return '<p class="trainer-empty">Paste a generated sample, then validate it against the retrieval lane.</p>';
  }

  const scalar = validation.scalarSummary || {};
  const retrieval = validation.retrievalContract || {};
  const semantic = validation.semanticAuditSummary || {};
  const protectedSummary = validation.protectedAnchorSummary || {};

  return `
    <div class="trainer-summary-grid">
      <article class="metric" data-tone="${validation.pass ? 'live' : validation.status === 'scalar-drift' ? 'warm' : 'hot'}">
        <div class="key">Trainer status</div>
        <div class="val">${escapeHtml(validation.status)}</div>
        <div class="hint">${validation.pass ? 'Ready for export and persona injection.' : 'Retrieval safety leads; scalar fit comes second.'}</div>
      </article>
      <article class="metric">
        <div class="key">Scalar fidelity</div>
        <div class="val">${formatPct(scalar.aggregate || 0, 0)}</div>
        <div class="hint">Mean similarity ${formatPct(scalar.pairwise?.meanSimilarity || 0, 0)} // traceability ${formatPct(scalar.pairwise?.meanTraceability || 0, 0)}</div>
      </article>
      <article class="metric">
        <div class="key">Retrieval pass</div>
        <div class="val">${retrieval.passCount || 0}/${retrieval.calibrationCount || 0}</div>
        <div class="hint">Agreement ${formatPct(retrieval.meanAgreement || 0, 0)} across calibration traces.</div>
      </article>
      <article class="metric">
        <div class="key">Anchor integrity</div>
        <div class="val">${formatPct(protectedSummary.integrityMean || 0, 0)}</div>
        <div class="hint">Minimum integrity ${formatPct(protectedSummary.integrityMin || 0, 0)} // proposition floor ${formatPct(semantic.propositionCoverageMin || 0, 0)}</div>
      </article>
    </div>
    <div class="trainer-contract-grid">
      ${((retrieval.calibration || []).map((entry) => `
        <article class="trainer-contract ${entry.pass ? 'pass' : 'fail'}">
          <div class="trainer-contract-head">
            <strong>${escapeHtml(entry.name)}</strong>
            <span>${entry.pass ? 'pass' : 'check'}</span>
          </div>
          <div class="trainer-contract-body">
            <div>agreement ${formatPct(entry.agreement?.score || 0, 0)}</div>
            <div>${escapeHtml(entry.candidateContract?.transferClass || 'native')} / ${escapeHtml(entry.candidateContract?.realizationTier || 'none')}</div>
            <div>prop ${formatPct(entry.safety?.propositionCoverage || 0, 0)} // act ${formatPct(entry.safety?.actionCoverage || 0, 0)}</div>
          </div>
        </article>
      `).join(''))}
    </div>
  `;
}

export function renderCorrectionHints(validation) {
  if (!validation) {
    return '<p class="trainer-empty">Correction hints surface here after validation.</p>';
  }

  const hints = validation.correctionHints || [];
  const preview = validation.correctionPreview || {};
  const beamPreview = preview.beamPreview;
  const plan = preview.plan;

  const previewBlock = beamPreview
    ? `
      <div class="trainer-preview">
        <div class="trainer-preview-head">Engine correction preview</div>
        <div class="trainer-preview-meta">
          <span>score ${formatNumber(beamPreview.score, 3)}</span>
          <span>${escapeHtml((beamPreview.changedDimensions || []).join(', ') || 'no visible shift')}</span>
        </div>
        <div class="trainer-preview-copy">${escapeHtml(beamPreview.text || '')}</div>
      </div>
    `
    : plan
      ? `
        <div class="trainer-preview">
          <div class="trainer-preview-head">Transfer plan</div>
          <div class="trainer-preview-meta">
            <span>${escapeHtml(plan.transferMode || 'rebalance')}</span>
            <span>${escapeHtml(plan.registerGoals?.registerMode || 'mixed')}</span>
          </div>
        </div>
      `
      : '';

  if (!hints.length) {
    return `<p class="trainer-empty">No urgent corrections surfaced. Retrieval and scalar checks are aligned enough for export.</p>${previewBlock}`;
  }

  return `
    <ul class="trainer-hints">
      ${hints.map((hint) => `<li>${escapeHtml(hint)}</li>`).join('')}
    </ul>
    ${previewBlock}
  `;
}
