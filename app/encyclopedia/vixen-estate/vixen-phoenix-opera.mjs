/**
 * 𝌋 TD613 · VIXEN CYBERNETICS — THE PHOENIX OPERA ENGINE (DD-02 · COMM-VIXEN-PHOENIX-OPERA-V5)
 *
 * Reconstructs Vixen Cybernetics as a unified eight-act computational Opera
 * governed by the five selectable Dollhouse Design instruments:
 *   1. PHASONIC_COUNTERPOINT             (D₃ periodic × φ quasiperiodic × H(u) interference)
 *   2. SEDGWICK_REPARATIVE_TEXTURE       (paratactic beside-ness δ: Pearl Vellum beside Obsidian)
 *   3. CARO_INSTITUTIONAL_RECONSTRUCTION (intake sieve 87 = 54 ⊔ 33 & procedural accounting μ)
 *   4. BUTLER_PERFORMATIVE_ITERATION     (manifestation slippage ε across .md/.pdf & route order)
 *   5. DIALECTICAL_TENSION               (polyphonic non-merging duel & E-00.1 bounded tie ω)
 *
 * Governance & Motion Custody Invariants:
 *   - Operates strictly under OPEN_FIELD_CREATIVE_SYNTHESIS
 *   - Zero continuous RAF loops (render-on-change only; preserves room-owner RAF law)
 *   - OPERAHOUSE ≠ OPERA ≠ PERFORMER (hides automatically when stage === OPERAHOUSE)
 *   - Preserves all 32 Works, 53 manifestations, 8 unadjudicated gates, 21 methods
 *   - empirical_replication_credit = 0 · release_authority = false · human_closure_required = true
 */

import {
  AVAILABLE_INSTRUMENTS,
  INSTRUMENT_CAUSAL_LAWS,
  DESIGN_PHI,
  computePhasonicInterference,
  scoreDesignCadence,
  deriveDesignGrammarSynthesis
} from './dollhouse-design-grammar.mjs';

export const PHOENIX_OPERA_CONTRACT = Object.freeze({
  schema: 'td613.vixen.phoenix-opera/v1',
  commission_id: 'COMM-VIXEN-PHOENIX-OPERA-V5',
  discourse_mode: 'OPEN_FIELD_CREATIVE_SYNTHESIS',
  clock_owner: 'NONE_RENDER_ON_CHANGE',
  instruments: Object.freeze([
    'PHASONIC_COUNTERPOINT',
    'SEDGWICK_REPARATIVE_TEXTURE',
    'CARO_INSTITUTIONAL_RECONSTRUCTION',
    'BUTLER_PERFORMATIVE_ITERATION',
    'DIALECTICAL_TENSION'
  ]),
  acts: 8,
  mutates_source_corpus: false,
  empirical_replication_credit: 0,
  scientific_promotion_authority: false,
  release_authority: false,
  human_closure_required: true
});

export const OPERA_LIBRETTO_ACTS = Object.freeze([
  Object.freeze({
    num: '00',
    view: 'overview',
    short: 'Entrance',
    actTitle: 'Overture & Four-Portal Proscenium',
    instrument: 'PHASONIC_COUNTERPOINT',
    coupling: 'WHAT ↔ WHO · 32 preserved Works meet an unhurried human witness',
    phaseBase: 0.08
  }),
  Object.freeze({
    num: '01',
    view: 'works',
    short: 'Works',
    actTitle: 'The Pearl-Vellum Repertoire',
    instrument: 'SEDGWICK_REPARATIVE_TEXTURE',
    coupling: 'WHERE ↔ HOW · Primary manuscripts rest beside curatorial provenance',
    phaseBase: 0.19
  }),
  Object.freeze({
    num: '02',
    view: 'observatory',
    short: 'Observatory',
    actTitle: 'The Electric Foundry',
    instrument: 'PHASONIC_COUNTERPOINT',
    coupling: 'WHEN ↔ WHY · Five non-commutative clocks & S ≠ W ≠ A caustics',
    phaseBase: 0.34
  }),
  Object.freeze({
    num: '03',
    view: 'collection',
    short: 'Salon',
    actTitle: 'The Polyphonic Couture Studio',
    instrument: 'DIALECTICAL_TENSION',
    coupling: 'WHAT ↔ HOW · Cross-work quests, dares & directional bias seams',
    phaseBase: 0.50
  }),
  Object.freeze({
    num: '04',
    view: 'reference',
    short: 'Folios',
    actTitle: 'The Facing-Folio Chamber',
    instrument: 'BUTLER_PERFORMATIVE_ITERATION',
    coupling: 'WHERE ↔ WHO · Recorded manifestations compared without collapsing authorship',
    phaseBase: 0.62
  }),
  Object.freeze({
    num: '05',
    view: 'protocols',
    short: 'Methods',
    actTitle: 'The 21-Instrument Apparatus',
    instrument: 'CARO_INSTITUTIONAL_RECONSTRUCTION',
    coupling: 'HOW ↔ WHY · 87-file intake sieve & bijective documentary protocols',
    phaseBase: 0.74
  }),
  Object.freeze({
    num: '06',
    view: 'gates',
    short: 'Gates',
    actTitle: 'The Split-Plane Diptychs (2⁸)',
    instrument: 'BUTLER_PERFORMATIVE_ITERATION',
    coupling: 'WHAT ↔ WHEN · Eight .md/.pdf pairs held open across [32, 40]',
    phaseBase: 0.86
  }),
  Object.freeze({
    num: '07',
    view: 'holds',
    short: 'Refusals',
    actTitle: 'Tribunal of the Competent Null',
    instrument: 'CARO_INSTITUTIONAL_RECONSTRUCTION',
    coupling: 'WHY ↔ WHO · E-00.1 bounded tie & sovereign human closure',
    phaseBase: 0.96
  })
]);

const r2 = (n) => Math.round(Number(n || 0) * 100) / 100;
const clamp = (v, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, Number.isFinite(+v) ? +v : lo));
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
));

/**
 * Generates an SVG Phasonic Counterpoint stave (D3 periodic + phi quasiperiodic + H envelope).
 */
export function renderPhasonicStaveSVG({
  width = 360,
  height = 38,
  gamma = 0.62,
  phaseOffset = 0.12,
  slippage = 0.24,
  parataxis = 0.55
} = {}) {
  const W = Math.max(180, Math.round(width));
  const H = Math.max(28, Math.round(height));
  const midY = H * 0.52;
  const amp = H * 0.28;
  const N = 72;
  const ptsD3 = [];
  const ptsPhi = [];
  const ptsInterf = [];

  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const x = 8 + t * (W - 16);
    const sample = computePhasonicInterference(t + phaseOffset, gamma);
    const yD3 = midY - sample.periodic_d3 * amp * 0.52;
    const yPhi = midY - sample.quasiperiodic_phi * amp * 0.64 * clamp(gamma / 0.8, 0, 1.35);
    const yH = midY - clamp(sample.interference, -1.6, 1.6) * amp * 0.58;
    ptsD3.push(`${i === 0 ? 'M' : 'L'}${r2(x)} ${r2(yD3)}`);
    ptsPhi.push(`${i === 0 ? 'M' : 'L'}${r2(x)} ${r2(yPhi)}`);
    ptsInterf.push(`${i === 0 ? 'M' : 'L'}${r2(x)} ${r2(yH)}`);
  }

  // Butlerian logarithmic citation ticks + Sedgwickian beside-ness rails
  const ticks = [];
  const railGap = r2(2.5 + parataxis * 5.5);
  for (let n = 0; n < 9; n++) {
    const slip = slippage * Math.log(1 + n) * 9.5;
    const tx = clamp(14 + (n / 8) * (W - 28) + slip, 8, W - 8);
    const gold = n % 3 === 0;
    ticks.push(
      `<line x1="${r2(tx)}" y1="${r2(midY - railGap - 4)}" x2="${r2(tx)}" y2="${r2(midY + railGap + 4)}" stroke="${gold ? '#fff2a9' : '#c9ccd1'}" stroke-width="${gold ? 1.15 : 0.7}" stroke-opacity="${gold ? 0.72 : 0.34}"/>`
    );
  }

  return `<svg class="vx-phx-stave-svg" viewBox="0 0 ${W} ${H}" width="100%" height="${H}" aria-hidden="true" preserveAspectRatio="none">
    <line x1="6" y1="${r2(midY - railGap)}" x2="${W - 6}" y2="${r2(midY - railGap)}" stroke="#f4f1ea" stroke-opacity="0.22" stroke-width="0.8"/>
    <line x1="6" y1="${r2(midY + railGap)}" x2="${W - 6}" y2="${r2(midY + railGap)}" stroke="#e8d7a8" stroke-opacity="0.22" stroke-width="0.8" stroke-dasharray="4 3"/>
    ${ticks.join('')}
    <path d="${ptsD3.join(' ')}" fill="none" stroke="#c9ccd1" stroke-opacity="0.45" stroke-width="1"/>
    <path d="${ptsPhi.join(' ')}" fill="none" stroke="#fff2a9" stroke-opacity="${gamma > 0.001 ? 0.68 : 0.14}" stroke-width="1.15"/>
    <path d="${ptsInterf.join(' ')}" fill="none" stroke="#ff91af" stroke-opacity="0.95" stroke-width="1.65"/>
  </svg>`;
}

function classifyClauseSyntax(H) {
  const absH = Math.abs(Number(H) || 0);
  if (absH >= 0.95) return 'SEMICOLON_EQUIPOLLENCE';
  if (absH >= 0.55) return 'EM_DASH_SHEAR';
  if (absH >= 0.20) return 'COLON_SUSPENSION';
  return 'PERIODIC_BASELINE';
}

function portalMotifSVG(view) {
  if (view === 'works') {
    return `<svg class="vx-phx-door-crest" viewBox="0 0 88 32" aria-hidden="true">
      <rect x="4" y="4" width="34" height="24" fill="rgba(247,244,238,.92)" stroke="#c9ccd1" stroke-width="1"/>
      <line x1="10" y1="10" x2="32" y2="10" stroke="#15171b" stroke-width="1.1"/>
      <line x1="10" y1="15" x2="29" y2="15" stroke="#52575e" stroke-width="0.9"/>
      <line x1="10" y1="20" x2="31" y2="20" stroke="#52575e" stroke-width="0.9"/>
      <line x1="44" y1="3" x2="44" y2="29" stroke="#fff2a9" stroke-dasharray="3 2" stroke-width="1.1"/>
      <rect x="50" y="4" width="34" height="24" fill="rgba(16,20,25,.9)" stroke="#e8d7a8" stroke-opacity=".65" stroke-width="1"/>
      <circle cx="67" cy="16" r="6" fill="none" stroke="#ff91af" stroke-width="1.2"/>
    </svg>`;
  }
  if (view === 'observatory') {
    return `<svg class="vx-phx-door-crest" viewBox="0 0 88 32" aria-hidden="true">
      <ellipse cx="44" cy="16" rx="34" ry="11" fill="none" stroke="#c9ccd1" stroke-opacity=".55" stroke-width="1"/>
      <ellipse cx="44" cy="16" rx="20" ry="7" transform="rotate(-16 44 16)" fill="none" stroke="#fff2a9" stroke-width="1.15"/>
      <line x1="44" y1="3" x2="44" y2="29" stroke="#ff91af" stroke-width="1.2"/>
      <line x1="20" y1="23" x2="68" y2="9" stroke="#ff91af" stroke-opacity=".72" stroke-width="1"/>
      <circle cx="44" cy="16" r="2.6" fill="#fff2a9"/>
    </svg>`;
  }
  if (view === 'collection') {
    return `<svg class="vx-phx-door-crest" viewBox="0 0 88 32" aria-hidden="true">
      <path d="M4 28 L32 4 M16 28 L40 6" stroke="#f4f1ea" stroke-opacity=".7" stroke-width="1.05"/>
      <path d="M44 2 C49 10, 39 22, 44 30" fill="none" stroke="#ff91af" stroke-width="1.6"/>
      <path d="M84 28 L56 4 M72 28 L48 6" stroke="#fff2a9" stroke-opacity=".75" stroke-width="1.05"/>
      <circle cx="44" cy="16" r="2.5" fill="#fff2a9"/>
    </svg>`;
  }
  return `<svg class="vx-phx-door-crest" viewBox="0 0 88 32" aria-hidden="true">
    <rect x="8" y="5" width="28" height="22" fill="none" stroke="#f4f1ea" stroke-opacity=".75" stroke-width="1"/>
    <rect x="52" y="5" width="28" height="22" fill="none" stroke="#fff2a9" stroke-opacity=".75" stroke-width="1" stroke-dasharray="3 2"/>
    <path d="M38 16 L50 16" stroke="#ff91af" stroke-width="1.3"/>
    <circle cx="44" cy="16" r="2.2" fill="#ff91af"/>
  </svg>`;
}

function renderGateSeamSVG(decision) {
  const mode = decision === 'HYP_MERGED' ? 'merged' : decision === 'HYP_SPLIT' ? 'split' : 'unadjudicated';
  if (mode === 'merged') {
    return `<svg class="vx-phx-gate-svg" viewBox="0 0 36 132" width="32" height="100%" aria-hidden="true">
      <line x1="18" y1="4" x2="18" y2="128" stroke="#fff2a9" stroke-width="2"/>
      <line x1="13" y1="8" x2="13" y2="124" stroke="#c9ccd1" stroke-width="0.9" stroke-opacity=".65"/>
      <line x1="23" y1="8" x2="23" y2="124" stroke="#c9ccd1" stroke-width="0.9" stroke-opacity=".65"/>
      <rect x="6" y="53" width="24" height="26" rx="2" fill="#101419" stroke="#fff2a9" stroke-width="1.2"/>
      <text x="18" y="70" text-anchor="middle" fill="#fff2a9" font-family="monospace" font-size="13" font-weight="700">≡</text>
    </svg>`;
  }
  if (mode === 'split') {
    return `<svg class="vx-phx-gate-svg" viewBox="0 0 36 132" width="32" height="100%" aria-hidden="true">
      <path d="M12 4 L12 128" stroke="#f4f1ea" stroke-width="1.2" stroke-dasharray="4 3"/>
      <path d="M24 4 L24 128" stroke="#ff91af" stroke-width="1.2" stroke-dasharray="4 3"/>
      <rect x="5" y="53" width="26" height="26" rx="2" fill="#101419" stroke="#ff91af" stroke-width="1.2"/>
      <text x="18" y="70" text-anchor="middle" fill="#ff91af" font-family="monospace" font-size="13" font-weight="700">≠</text>
    </svg>`;
  }
  return `<svg class="vx-phx-gate-svg" viewBox="0 0 36 132" width="32" height="100%" aria-hidden="true">
    <line x1="18" y1="4" x2="18" y2="128" stroke="#e8d7a8" stroke-width="1.25" stroke-dasharray="5 4"/>
    <path d="M9 26 L27 34 M9 64 L27 72 M9 98 L27 106" stroke="#e8d7a8" stroke-opacity=".68" stroke-width="1.1"/>
    <rect x="6" y="53" width="24" height="26" rx="2" fill="#101419" stroke="#e8d7a8" stroke-width="1.15"/>
    <text x="18" y="70" text-anchor="middle" fill="#fff2a9" font-family="monospace" font-size="11" font-weight="700">1‥2</text>
  </svg>`;
}

export function mountVixenPhoenixOpera({
  document: doc = globalThis.document,
  window: win = globalThis.window
} = {}) {
  if (!doc?.body || !win) {
    return Object.freeze({ mounted: false, reason: 'NO_BROWSER_HOST' });
  }
  if (win.VIXEN_PHOENIX_OPERA?.mounted) {
    return win.VIXEN_PHOENIX_OPERA;
  }

  const state = {
    activeInstrument: 'PHASONIC_COUNTERPOINT',
    gamma: 0.62,
    parataxis: 0.58,
    slippage: 0.24,
    carryCollapsed: false,
    falsifiedZero: false
  };

  // ── 1. Mount Opera-Wide Eight-Act Proscenium Score Bar ─────────────────────
  const mainEl = doc.getElementById('main');
  let scoreBar = doc.getElementById('vixenPhoenixScoreBar');
  if (!scoreBar && mainEl?.parentNode) {
    scoreBar = doc.createElement('aside');
    scoreBar.id = 'vixenPhoenixScoreBar';
    scoreBar.className = 'vx-phx-scorebar';
    scoreBar.setAttribute('aria-label', 'Opera Libretto Act & Dollhouse Design Score');
    scoreBar.innerHTML = `
      <div class="vx-phx-scorebar-inner">
        <div class="vx-phx-act-ident">
          <span class="vx-phx-kicker" id="vxPhxActKicker">ACT 00 · OVERTURE</span>
          <strong class="vx-phx-act-title" id="vxPhxActTitle">Overture &amp; Four-Portal Proscenium</strong>
          <span class="vx-phx-coupling" id="vxPhxActCoupling">WHAT ↔ WHO · 32 preserved Works meet an unhurried human witness</span>
        </div>
        <div class="vx-phx-stave-host" id="vxPhxStaveHost" aria-hidden="true"></div>
        <div class="vx-phx-act-pills" role="group" aria-label="Jump across the eight Opera rooms">
          ${OPERA_LIBRETTO_ACTS.map((act) =>
            `<button type="button" class="vx-phx-act-pill" data-phx-view="${act.view}" title="${esc(act.num + ' · ' + act.short + ' — ' + act.actTitle)}"><span>${act.num}</span><em>${esc(act.short)}</em></button>`
          ).join('')}
        </div>
      </div>`;
    mainEl.parentNode.insertBefore(scoreBar, mainEl);
    scoreBar.addEventListener('click', (ev) => {
      const btn = ev.target.closest?.('button[data-phx-view]');
      if (!btn) return;
      const targetView = btn.getAttribute('data-phx-view');
      const railBtn = doc.querySelector(`#vixenRoomRail button[data-view="${targetView}"]`) ||
        doc.querySelector(`.main-nav button[data-view="${targetView}"]`);
      railBtn?.click();
    });
  }

  // ── 2. Decorate Entrance Four Portals with Architectural Motifs ────────────
  doc.querySelectorAll('.vixen-doorways button[data-view]').forEach((door) => {
    if (door.querySelector('.vx-phx-door-crest')) return;
    const v = door.getAttribute('data-view') || '';
    const crestWrap = doc.createElement('span');
    crestWrap.className = 'vx-phx-door-crest-wrap';
    crestWrap.setAttribute('aria-hidden', 'true');
    crestWrap.innerHTML = portalMotifSVG(v);
    door.insertBefore(crestWrap, door.firstChild);
  });

  // ── 3. Mount Salon Dollhouse Design Grammar Diapason & Falsification Lab ───
  const inquiryInner = doc.querySelector('#constitutiveInquiry .vixen-inquiry-inner');
  let diapason = doc.getElementById('vixenDollhouseDiapason');
  if (!diapason && inquiryInner) {
    diapason = doc.createElement('section');
    diapason.id = 'vixenDollhouseDiapason';
    diapason.className = 'vx-phx-diapason';
    diapason.setAttribute('aria-label', 'Dollhouse Design Formal Grammar & Causal Perturbation Instrument');
    const instButtons = Object.values(AVAILABLE_INSTRUMENTS).map((inst) =>
      `<button type="button" class="vx-phx-inst-btn" data-dd-inst="${inst.id}" aria-pressed="${inst.id === state.activeInstrument}">${esc(inst.label)}</button>`
    ).join('');
    diapason.innerHTML = `
      <div class="vx-phx-diapason-head">
        <div>
          <p class="vx-phx-eyebrow">DOLLHOUSE DESIGN STUDIO · SELECTABLE FORMAL GRAMMARS &amp; CAUSAL PERTURBATION</p>
          <h3 class="vx-phx-diapason-title">Shape the inquiry’s formal lens — <em>and test what collapses when strain goes to zero.</em></h3>
        </div>
        <span class="vx-phx-ceiling-pill">CREATIVE INQUIRY STUDIO · NON-EMPIRICAL (CREDIT 0)</span>
      </div>
      <div class="vx-phx-inst-bar" role="group" aria-label="Selectable Dollhouse Design instruments">
        ${instButtons}
      </div>
      <div class="vx-phx-diapason-grid">
        <div class="vx-phx-wave-card">
          <div class="vx-phx-wave-canvas" id="vxPhxSalonWave"></div>
          <div class="vx-phx-law-line" id="vxPhxLawLine"></div>
        </div>
        <div class="vx-phx-controls-card">
          <label class="vx-phx-slider-row" for="vxPhxParamSlider">
            <span id="vxPhxParamLabel">Quasiperiodic strain γ</span>
            <output id="vxPhxParamOut">0.62</output>
          </label>
          <input id="vxPhxParamSlider" type="range" min="0" max="120" step="2" value="62" aria-label="Steer active Dollhouse Design causal parameter">
          <div class="vx-phx-probe-actions">
            <button type="button" class="ci-btn" id="vxPhxZeroProbeBtn">Zero Probe (Falsify = 0)</button>
            <button type="button" class="ci-btn" id="vxPhxRestoreProbeBtn">Golden Default (φ⁻¹ = 0.62)</button>
          </div>
          <div class="vx-phx-cadence-metrics" id="vxPhxCadenceMetrics" aria-live="polite"></div>
        </div>
      </div>`;
    const studioTop = inquiryInner.querySelector('.bc-salon-top-studio');
    if (studioTop) studioTop.after(diapason);
    else inquiryInner.append(diapason);

    diapason.querySelectorAll('[data-dd-inst]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.activeInstrument = btn.getAttribute('data-dd-inst') || 'PHASONIC_COUNTERPOINT';
        diapason.querySelectorAll('[data-dd-inst]').forEach((b) => {
          b.setAttribute('aria-pressed', String(b === btn));
        });
        renderDiapason();
      });
    });

    const slider = diapason.querySelector('#vxPhxParamSlider');
    slider?.addEventListener('input', () => {
      const val = Number(slider.value || 0) / 100;
      state.gamma = val;
      state.falsifiedZero = val === 0;
      applyStudioCssVariables();
      renderDiapason();
      syncScoreBar();
    });

    diapason.querySelector('#vxPhxZeroProbeBtn')?.addEventListener('click', () => {
      state.gamma = 0;
      state.falsifiedZero = true;
      if (slider) slider.value = '0';
      applyStudioCssVariables();
      renderDiapason();
      syncScoreBar();
    });

    diapason.querySelector('#vxPhxRestoreProbeBtn')?.addEventListener('click', () => {
      state.gamma = 0.62;
      state.falsifiedZero = false;
      if (slider) slider.value = '62';
      applyStudioCssVariables();
      renderDiapason();
      syncScoreBar();
    });
  }

  function applyStudioCssVariables() {
    const root = doc.documentElement;
    const g = state.gamma;
    root.style.setProperty('--dd-phasonic-gamma', g.toFixed(3));
    root.style.setProperty('--dd-paratactic-gap', `${Math.round(12 + g * 18)}px`);
    root.style.setProperty('--dd-citational-tracking', `${(g * 0.028).toFixed(4)}em`);
  }

  function renderDiapason() {
    if (!diapason) return;
    const inst = AVAILABLE_INSTRUMENTS[state.activeInstrument] || AVAILABLE_INSTRUMENTS.PHASONIC_COUNTERPOINT;
    const law = INSTRUMENT_CAUSAL_LAWS[state.activeInstrument] || INSTRUMENT_CAUSAL_LAWS.PHASONIC_COUNTERPOINT;
    const paramNames = {
      PHASONIC_COUNTERPOINT: 'Quasiperiodic strain γ',
      SEDGWICK_REPARATIVE_TEXTURE: 'Paratactic beside-ness δ',
      CARO_INSTITUTIONAL_RECONSTRUCTION: 'Procedural corridor resistance μ',
      BUTLER_PERFORMATIVE_ITERATION: 'Citational slippage ε',
      DIALECTICAL_TENSION: 'Polyphonic interval ω'
    };
    const pLabel = diapason.querySelector('#vxPhxParamLabel');
    const pOut = diapason.querySelector('#vxPhxParamOut');
    if (pLabel) pLabel.textContent = paramNames[inst.id] || law.parameter;
    if (pOut) pOut.textContent = state.gamma.toFixed(2);

    const lagVal = Number(doc.getElementById('ciLagInput')?.value || 36);
    const waveHost = diapason.querySelector('#vxPhxSalonWave');
    if (waveHost) {
      waveHost.innerHTML = renderPhasonicStaveSVG({
        width: 560,
        height: 76,
        gamma: state.gamma,
        phaseOffset: (lagVal % 40) / 40,
        slippage: state.activeInstrument === 'BUTLER_PERFORMATIVE_ITERATION' ? state.gamma * 0.85 : 0.22,
        parataxis: state.activeInstrument === 'SEDGWICK_REPARATIVE_TEXTURE' ? state.gamma : 0.55
      });
    }

    const lawEl = diapason.querySelector('#vxPhxLawLine');
    if (lawEl) {
      lawEl.textContent = state.gamma === 0
        ? `FALSIFICATION PROBE ACTIVE · ${law.falsification_probe}.`
        : `${inst.governing_theory} · Law: ${law.transfer_law}`;
    }

    const qText = doc.getElementById('ciQuestionInput')?.value ||
      doc.getElementById('synthResearchQuestion')?.textContent || '';
    const heroText = doc.getElementById('synthHeroStatement')?.textContent || '';
    const subText = doc.getElementById('synthPatternSubtitle')?.textContent || '';
    const cadence = scoreDesignCadence({
      heroStatement: heroText,
      patternSubtitle: subText,
      researchQuestion: qText,
      governing_instrument: inst.id
    }, qText);
    const sample = computePhasonicInterference((lagVal % 29) / 29, state.gamma);
    const clauseMode = state.gamma === 0 ? 'PERIODIC_BASELINE' : classifyClauseSyntax(sample.interference * (0.75 + state.gamma));
    const synthesisMeta = deriveDesignGrammarSynthesis({
      seed: `${subText} ${qText}`,
      worksCount: 32,
      activeInstruments: [inst.id]
    });

    const metricsEl = diapason.querySelector('#vxPhxCadenceMetrics');
    if (metricsEl) {
      metricsEl.innerHTML =
        `<span><strong>Cadence fit</strong> ${(cadence.design_cadence * 100).toFixed(1)}%</span>` +
        `<span><strong>Breath</strong> ${(cadence.pedagogue_cadence * 100).toFixed(0)}%</span>` +
        `<span><strong>Syntax</strong> ${esc(clauseMode.replaceAll('_', ' '))}</span>` +
        `<span><strong>φ</strong> ${synthesisMeta.phasonic_phi.toFixed(4)}</span>`;
    }
  }

  // ── 4. Enhance Gates (06) with Binary Partition Lattice & SVG Seams ────────
  const gatesSection = doc.getElementById('view-gates');
  const gatesStack = doc.getElementById('gatesStackContainer');
  let gatesLattice = doc.getElementById('vixenGatesLattice');
  if (gatesSection && gatesStack && !gatesLattice) {
    gatesLattice = doc.createElement('div');
    gatesLattice.id = 'vixenGatesLattice';
    gatesLattice.className = 'vx-phx-gates-lattice';
    gatesLattice.setAttribute('aria-label', 'Eight Human Identity Gates Quick Matrix');
    gatesStack.parentNode.insertBefore(gatesLattice, gatesStack);
  }

  function enhanceGatesPresentation() {
    if (!gatesStack) return;
    const cards = Array.from(gatesStack.querySelectorAll('.gate-pair-card'));
    const latticeButtons = [];
    cards.forEach((card, idx) => {
      const gateNum = idx + 1;
      const pressedBtn = card.querySelector('button[data-gate-set][aria-pressed="true"]');
      const rawSet = pressedBtn?.getAttribute('data-gate-set') || `${gateNum}:UNADJUDICATED_PAIR`;
      const decision = rawSet.split(':')[1] || 'UNADJUDICATED_PAIR';
      card.dataset.gateDecision = decision;
      const seam = card.querySelector('.optical-seam');
      if (seam && seam.dataset.phxRendered !== decision) {
        seam.dataset.phxRendered = decision;
        seam.innerHTML = renderGateSeamSVG(decision);
      }
      const sym = decision === 'HYP_MERGED' ? '≡ [1]' : decision === 'HYP_SPLIT' ? '≠ [2]' : '● [1‥2]';
      latticeButtons.push(
        `<button type="button" class="vx-phx-gate-chip" data-gate-state="${esc(decision)}" data-jump-gate-card="gate-card-${gateNum}">` +
        `<strong>G${gateNum}</strong><span>${sym}</span></button>`
      );
    });
    if (gatesLattice) {
      gatesLattice.innerHTML =
        `<span class="vx-phx-lattice-label">2⁸ PARTITION MATRIX · CLICK TO INSPECT</span>` +
        `<div class="vx-phx-lattice-strip">${latticeButtons.join('')}</div>`;
    }
  }

  gatesLattice?.addEventListener('click', (ev) => {
    const chip = ev.target.closest?.('[data-jump-gate-card]');
    if (!chip) return;
    const target = doc.getElementById(chip.getAttribute('data-jump-gate-card'));
    if (!target) return;
    const still = doc.body.dataset.vixenMotion === 'still' ||
      win.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    target.scrollIntoView({ behavior: still ? 'auto' : 'smooth', block: 'center' });
  });

  if (gatesStack && typeof win.MutationObserver === 'function') {
    new win.MutationObserver(() => enhanceGatesPresentation()).observe(gatesStack, { childList: true });
    enhanceGatesPresentation();
  }

  // ── 5. Enhance Methods (05) & Refusals (07) Visual Diagrams ────────────────
  const methodsPedagogy = doc.querySelector('#view-protocols .vix-method-pedagogy');
  if (methodsPedagogy && !doc.getElementById('vxPhxCaroSieve')) {
    const sieve = doc.createElement('div');
    sieve.id = 'vxPhxCaroSieve';
    sieve.className = 'vx-phx-sieve-diagram';
    sieve.setAttribute('aria-label', 'Archival intake quotient and bijective protocol partition');
    sieve.innerHTML = `
      <div class="vx-phx-sieve-node">
        <span class="vx-phx-sieve-num">87</span>
        <span class="vx-phx-sieve-lbl">Historical Intake Files</span>
      </div>
      <span class="vx-phx-sieve-arrow" aria-hidden="true">⟶</span>
      <div class="vx-phx-sieve-node vx-phx-sieve-quarantine">
        <span class="vx-phx-sieve-num">33</span>
        <span class="vx-phx-sieve-lbl">AppleDouble <code>._*</code> Quarantined (c₄)</span>
      </div>
      <span class="vx-phx-sieve-arrow" aria-hidden="true">⊔</span>
      <div class="vx-phx-sieve-node vx-phx-sieve-substantive">
        <span class="vx-phx-sieve-num">54</span>
        <span class="vx-phx-sieve-lbl">Substantive Source Records</span>
      </div>
      <span class="vx-phx-sieve-arrow" aria-hidden="true">⟶</span>
      <div class="vx-phx-sieve-node vx-phx-sieve-registry">
        <span class="vx-phx-sieve-num">6 + 7 + 4 + 4 = 21</span>
        <span class="vx-phx-sieve-lbl">Documentary Methods · 0 Executors</span>
      </div>`;
    const pipeline = methodsPedagogy.querySelector('.protocol-pipeline');
    if (pipeline) methodsPedagogy.insertBefore(sieve, pipeline);
  }

  const holdsFirstPanel = doc.querySelector('#view-holds .holds-grid .hold-panel');
  if (holdsFirstPanel && !doc.getElementById('vxPhxTieScale')) {
    const tie = doc.createElement('div');
    tie.id = 'vxPhxTieScale';
    tie.className = 'vx-phx-tie-scale';
    tie.setAttribute('aria-label', 'Four-arm E-00.1 bounded tie visual summary');
    tie.innerHTML = `
      <div class="vx-phx-tie-arm vx-phx-tie-baseline"><span>ARM 1 · DOCUMENTARY</span><strong>Baseline</strong></div>
      <div class="vx-phx-tie-arm vx-phx-tie-baseline"><span>ARM 2 · RECEIVER</span><strong>Baseline</strong></div>
      <div class="vx-phx-tie-arm vx-phx-tie-null"><span>ARM 3 · COMPETENT NULL</span><strong>100% Fidelity · 0 False</strong></div>
      <div class="vx-phx-tie-fulcrum" aria-hidden="true">≡ TIE</div>
      <div class="vx-phx-tie-arm vx-phx-tie-recip"><span>ARM 4 · RECIPROCAL</span><strong>100% Fidelity · Surplus Unestablished</strong></div>`;
    const tableWrap = holdsFirstPanel.querySelector('.comp-table-wrap');
    if (tableWrap) holdsFirstPanel.insertBefore(tie, tableWrap);
  }

  // ── 6. Collapsible, Non-Overlapping Carry Shuttle & Excursion Coordination ─
  const carryRail = doc.getElementById('vixenCarryRail');
  const journeyDock = doc.getElementById('vmaJourneyDock');
  if (carryRail && !carryRail.querySelector('.vx-phx-carry-collapse')) {
    const collapseBtn = doc.createElement('button');
    collapseBtn.type = 'button';
    collapseBtn.className = 'vx-phx-carry-collapse';
    collapseBtn.setAttribute('aria-label', 'Minimize or expand floating Research Cart pill');
    collapseBtn.setAttribute('title', 'Minimize / expand Research Cart pill');
    collapseBtn.textContent = '–';
    collapseBtn.addEventListener('click', (ev) => {
      ev.stopPropagation();
      state.carryCollapsed = !state.carryCollapsed;
      carryRail.dataset.collapsed = String(state.carryCollapsed);
      collapseBtn.textContent = state.carryCollapsed ? '+' : '–';
      collapseBtn.setAttribute('aria-expanded', String(!state.carryCollapsed));
    });
    carryRail.append(collapseBtn);
  }

  function syncDockCoordination() {
    const excursionVisible = Boolean(journeyDock && !journeyDock.hidden);
    doc.body.classList.toggle('has-podium-excursion-dock', excursionVisible);
  }

  if (journeyDock && typeof win.MutationObserver === 'function') {
    new win.MutationObserver(syncDockCoordination).observe(journeyDock, {
      attributes: true,
      attributeFilter: ['hidden', 'style', 'class']
    });
  }
  syncDockCoordination();

  // ── 7. Synchronize Proscenium Score Bar with Active View & Stage ───────────
  function syncScoreBar() {
    if (!scoreBar) return;
    const isOperahouse = doc.body.dataset.activeResearchStage === 'OPERAHOUSE';
    scoreBar.hidden = isOperahouse;
    if (isOperahouse) return;

    const curView = doc.body.dataset.view || 'overview';
    const coverEl = doc.getElementById('cover');
    if (curView === 'overview' && coverEl?.parentNode) {
      if (coverEl.nextElementSibling !== scoreBar) {
        coverEl.after(scoreBar);
      }
    } else if (mainEl?.parentNode && mainEl.previousElementSibling !== scoreBar) {
      mainEl.parentNode.insertBefore(scoreBar, mainEl);
    }
    const act = OPERA_LIBRETTO_ACTS.find((a) => a.view === curView) || OPERA_LIBRETTO_ACTS[0];
    const kicker = doc.getElementById('vxPhxActKicker');
    const title = doc.getElementById('vxPhxActTitle');
    const coupling = doc.getElementById('vxPhxActCoupling');
    const staveHost = doc.getElementById('vxPhxStaveHost');
    const instMeta = AVAILABLE_INSTRUMENTS[act.instrument];

    if (kicker) {
      kicker.textContent = `ACT ${act.num} · ${act.short.toUpperCase()} · ${instMeta ? instMeta.label.toUpperCase() : act.instrument}`;
    }
    if (title) title.textContent = act.actTitle;
    if (coupling) coupling.textContent = act.coupling;

    const lagVal = Number(doc.getElementById('ciLagInput')?.value || 36);
    const cartCount = Number(doc.getElementById('vixenCarryCount')?.textContent || 0);
    if (staveHost) {
      staveHost.innerHTML = renderPhasonicStaveSVG({
        width: 340,
        height: 34,
        gamma: state.gamma,
        phaseOffset: act.phaseBase + (lagVal % 24) * 0.015 + cartCount * 0.03,
        slippage: 0.18 + cartCount * 0.04,
        parataxis: state.parataxis
      });
    }

    scoreBar.querySelectorAll('.vx-phx-act-pill').forEach((pill) => {
      const match = pill.getAttribute('data-phx-view') === curView;
      pill.classList.toggle('is-active', match);
      if (match) pill.setAttribute('aria-current', 'page');
      else pill.removeAttribute('aria-current');
    });
  }

  if (typeof win.MutationObserver === 'function') {
    new win.MutationObserver(() => {
      syncScoreBar();
      syncDockCoordination();
    }).observe(doc.body, {
      attributes: true,
      attributeFilter: ['data-view', 'data-active-research-stage']
    });
  }

  // Global Escape key closes open non-modal drawers (Menu ☰ & Observatory Proof)
  win.addEventListener('keydown', (ev) => {
    if (ev.key !== 'Escape') return;
    const mobileNav = doc.getElementById('mobileNav');
    const menuToggle = doc.getElementById('menuToggle');
    if (mobileNav && !mobileNav.hidden) {
      mobileNav.hidden = true;
      menuToggle?.setAttribute('aria-expanded', 'false');
      menuToggle?.focus?.({ preventScroll: true });
    }
    const foundryProof = doc.getElementById('vixenFoundryInspectorReadout');
    if (foundryProof && !foundryProof.hidden) {
      const closeBtn = foundryProof.querySelector('.ef-readout-close');
      closeBtn?.click();
    }
  });

  doc.getElementById('ciLagInput')?.addEventListener('input', () => {
    renderDiapason();
    syncScoreBar();
  });
  win.addEventListener('vixen:synthesis-updated', () => {
    renderDiapason();
    syncScoreBar();
  });
  win.addEventListener('vixen-study-tray-change', syncScoreBar);
  doc.addEventListener('vixen:editorial-synthesis', renderDiapason);

  applyStudioCssVariables();
  renderDiapason();
  syncScoreBar();

  const api = Object.freeze({
    mounted: true,
    contract: PHOENIX_OPERA_CONTRACT,
    getState: () => Object.freeze({
      active_view: doc.body.dataset.view || 'overview',
      active_instrument: state.activeInstrument,
      phasonic_gamma: state.gamma,
      falsified_zero: state.falsifiedZero,
      carry_collapsed: state.carryCollapsed,
      empirical_replication_credit: 0,
      release_authority: false
    }),
    refresh: () => {
      enhanceGatesPresentation();
      renderDiapason();
      syncScoreBar();
      syncDockCoordination();
    }
  });

  try {
    Object.defineProperty(win, 'VIXEN_PHOENIX_OPERA', { value: api, configurable: true });
  } catch (_) {
    win.VIXEN_PHOENIX_OPERA = api;
  }
  return api;
}

if (typeof document !== 'undefined' && typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => mountVixenPhoenixOpera({ document, window }), { once: true });
  } else {
    mountVixenPhoenixOpera({ document, window });
  }
}
