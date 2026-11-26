/**
 * 𝌋 Vixen · THE BIAS DRAFT — Composable Computational Couture Pattern & Optical Seam.
 *
 * Presentation-layer composition only. Reads visible research coordinates and
 * synthesizes a deterministic dimensional pattern draft; never mutates source
 * state, never owns a continuous animation clock (no RAF: render on change only),
 * and never claims empirical evidence or manuscript equivalence.
 *
 * Inherited optical & mathematical synthesis:
 *   1. Dome-Art fields (`observatory-foundry-kernel.mjs`)
 *      - Panel I  (bias, +45°)        · displaced by triangular D₃ lattice field T(r)
 *      - Panel II (counter-bias, −45°) · displaced by tenfold φ-quasiperiodic field Q(r)
 *      - Signed directional seam      · x_s(y) = x₀ + 1.15·a·[T(x_A, y) − Q(x_B, y)]
 *        (Permits displacement toward either panel; F(r)=|T(r)−Q(r)| & G(r)=||∇T−∇Q||₂
 *         drive fold relief and caustic luster rather than clamping seam sign.)
 *   2. Loom carrier depth roster (`CARRIERS`: 6 near · 13 mid · 20 far = 39 per panel)
 *      - Exact interior chord parameterization guarantees all 39 computational
 *        carriers survive as rendered bias threads on both panels at every viewport,
 *        clipped strictly to each cloth polygon.
 *   3. Beat radiometry & folded-chrome drape (`vixen-beat-radiometry-rgi15.mjs`,
 *      `vixen-folded-cuirass.mjs`, `vixen-live-mesh-rgi13.mjs`)
 *      - Analytic D₃/φ wave-vector pairs (`measureCoutureBeats` + `sampleCuirassFields`)
 *        sculpt chiaroscuro pleat gores and Reinhard-bounded electrical emission nodes
 *        (`allocateBloom`, Nyquist-guarded α_N ≤ 0.45) along carrier-seam crossings.
 *   4. Synthetic geometric diagnostics (`singularValues2`, `project111`, `fiveClockTicks`)
 *      - Hestenes–Jacobi singular values σ(M) of the synthetic field-gradient matrix
 *        M = [∇T; ∇Q] and [111]-orthogonal triad residue at the seam waist; explicitly
 *        labeled as synthetic optical diagnostics, never manuscript identifiability.
 *
 * OPERAHOUSE ≠ OPERA ≠ PERFORMER · model_connected: false · empirical_credit: 0.
 */
import {
  CARRIERS, PHI, triangular, quasiperiodic, gradientMisfit,
  singularValues2, project111, fiveClockTicks
} from './observatory-foundry-kernel.mjs';
import {
  BEAT_POLICY, measureCoutureBeats, reinhardBounded
} from './vixen-beat-radiometry-rgi15.mjs';
import { sampleCuirassFields } from './vixen-folded-cuirass.mjs';
import { ELECTRIC_COUTURE, normalizeComposerVisualField } from './vixen-live-mesh-rgi13.mjs';

export const BIAS_DRAFT_CONTRACT = Object.freeze({
  schema: 'td613.vixen.bias-draft/v1',
  layer: 'PRESENTATION_ONLY',
  clock_owner: 'NONE_RENDER_ON_CHANGE',
  seam_operator: 'SIGNED_FIELD_DIFFERENCE_x0_PLUS_1.15a_(T_MINUS_Q)',
  fold_relief_operator: 'ABS_FIELD_DIFFERENCE_AND_GRADIENT_MISFIT',
  computational_carriers_per_panel: 39,
  guaranteed_rendered_carriers_per_panel: 39,
  optical_inheritance: Object.freeze([
    'observatory-foundry-kernel.mjs',
    'vixen-beat-radiometry-rgi15.mjs',
    'vixen-folded-cuirass.mjs',
    'vixen-live-mesh-rgi13.mjs'
  ]),
  gates_basted: 8,
  human_closure: 'RESERVED_UNWORKED',
  aperture_meaning: 'SYNTHETIC_OPTICAL_GRADIENT_MATRIX_NOT_MANUSCRIPT_IDENTIFIABILITY',
  epistemic: 'FORMAL_DIRECTIONAL_GEOMETRY_NOT_EVIDENCE',
  empirical_credit: 0
});

const S2 = Math.SQRT1_2;
const TAU = Math.PI * 2;
const clamp = (v, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, Number.isFinite(+v) ? +v : lo));
const r2 = (n) => Math.round(n * 100) / 100;
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
));

let instanceSeq = 0;

function fnv1a(str) {
  let h = 2166136261;
  const text = String(str || '');
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h;
}

/**
 * Order-dependent directional encounter phase:
 * (A, B) and (B, A) produce measurably distinct phases & seam trajectories.
 * Accepts optional recorded work identifiers so manuscript identity seeds
 * phase stably while remaining explicitly formal (not semantic equivalence).
 */
export function encounterPhase(indexA = 0, indexB = 0, ids = null) {
  const iA = Number.isFinite(+indexA) ? +indexA : 0;
  const iB = Number.isFinite(+indexB) ? +indexB : 0;
  let idOffset = 0;
  if (ids && (ids.workIdA || ids.workIdB)) {
    const hA = (fnv1a(ids.workIdA || '') % 4093) / 4093;
    const hB = (fnv1a(ids.workIdB || '') % 4093) / 4093;
    idOffset = hA * PHI * 0.65 + hB * 0.31;
  }
  return (((iA * PHI + iB * 0.5 + idOffset) % TAU) + TAU) % TAU;
}

function seamSampler({ width, clothH, selvW, indexA, indexB, lag, workIdA, workIdB, baseRatio = 0.5 }) {
  const phase = encounterPhase(indexA, indexB, { workIdA, workIdB });
  const idSeedA = workIdA ? (fnv1a(workIdA) % 11) * 0.0022 : 0;
  const theta = 0.055 + ((indexA + 1) % 7) * 0.006 + idSeedA;
  const innerW = Math.max(120, width - selvW * 2);
  const center = selvW + innerW * clamp(baseRatio, 0.38, 0.62);
  const amp = Math.min(innerW * 0.068, 56);
  const minX = selvW + Math.max(46, innerW * 0.16);
  const maxX = width - selvW - Math.max(46, innerW * 0.16);
  const n = 72;
  const xs = new Float64Array(n + 1);
  const relief = new Float64Array(n + 1);
  const caustics = new Float64Array(n + 1);
  const xProbeA = width * 0.5 + indexB * 11;
  const xProbeB = width * 0.5 + lag * 2.3;
  for (let i = 0; i <= n; i++) {
    const y = (i / n) * clothH;
    const T = triangular(xProbeA, y * 1.7, { theta });
    const Q = quasiperiodic(xProbeB, y * 1.7, { phase });
    // Signed difference operator: x_s(y) = x_0 + 1.15 * a * (T - Q)
    xs[i] = clamp(center + amp * (T - Q) * 1.15, minX, maxX);
    relief[i] = Math.abs(T - Q);
    caustics[i] = gradientMisfit(xs[i], y * 1.35, { theta, phase });
  }
  const at = (y) => {
    const f = clamp((y / Math.max(1, clothH)) * n, 0, n);
    const i = Math.floor(f);
    const t = f - i;
    return i >= n ? xs[n] : xs[i] * (1 - t) + xs[i + 1] * t;
  };
  return { at, phase, theta, xs, relief, caustics, n, center, amp };
}

/**
 * Cuts all 39 Loom carriers across the exact interior domain of a cloth panel.
 * Every carrier index 0..38 is parameterized across the panel's interior bias
 * span so all 39 carriers yield >= 12 interior stations at every viewport.
 */
function cutPanel({ side, width, clothH, selvW, seam, gap, field, cuirassPairs, amp }) {
  const threads = [];
  const sampleCandidates = [];
  const isLeft = side === 'I';
  let maxSpanW = 0;
  for (let i = 0; i <= 32; i++) {
    const sy = seam((i / 32) * clothH);
    const wSide = isLeft ? (sy - gap - selvW) : (width - selvW - (sy + gap));
    if (wSide > maxSpanW) maxSpanW = wSide;
  }
  maxSpanW = Math.max(48, maxSpanW);
  const totalU = maxSpanW + clothH;
  const padU = Math.min(18, totalU * 0.042);

  for (const carrier of CARRIERS) {
    // u = localX + y runs from padU to totalU - padU across the bias diagonal
    const u = padU + ((carrier.index + 0.5) / CARRIERS.length) * (totalU - 2 * padU);
    const yLo = Math.max(0, u - maxSpanW);
    const yHi = Math.min(clothH, u);
    const steps = Math.max(16, Math.ceil((yHi - yLo + 24) / 5.5));
    const pts = [];
    let terminus = null;
    let peakLuster = 0;

    for (let s = 0; s <= steps; s++) {
      const yBase = yLo + ((yHi - yLo) * (steps - s)) / steps; // trace bottom-up along +45°/-45°
      const localX = u - yBase;
      if (localX < -1) continue;
      const worldX0 = isLeft ? (selvW + localX) : (width - selvW - localX);
      const disp = amp * carrier.depth_gain * field(worldX0, yBase);
      const localDispX = localX + disp * S2;
      const yDisp = clamp(yBase + disp * S2, 0, clothH);
      const seamLimitLocal = isLeft
        ? (seam(yDisp) - gap - selvW)
        : (width - selvW - (seam(yDisp) + gap));

      if (localDispX < 0) continue;
      if (localDispX >= seamLimitLocal) {
        const tx = isLeft ? (selvW + seamLimitLocal) : (width - selvW - seamLimitLocal);
        terminus = [tx, yDisp];
        pts.push(terminus);
        sampleCandidates.push({ x: tx, y: yDisp, carrierIndex: carrier.index, near: carrier.near });
        break;
      }
      const wx = isLeft ? (selvW + localDispX) : (width - selvW - localDispX);
      pts.push([wx, yDisp]);
      if (cuirassPairs && (s % 4 === 0)) {
        const cf = sampleCuirassFields(cuirassPairs, wx, yDisp, 0);
        if (cf.envelope > peakLuster) peakLuster = cf.envelope;
        if (carrier.near && localDispX > seamLimitLocal * 0.68) {
          sampleCandidates.push({ x: wx, y: yDisp, carrierIndex: carrier.index, near: true });
        }
      }
    }

    // Fallback safety chord if extreme curvature pinched a corner carrier
    if (pts.length < 2) {
      const ym = clamp(u * 0.5, 4, clothH - 4);
      const lim = isLeft ? (seam(ym) - gap - selvW) : (width - selvW - (seam(ym) + gap));
      const x0 = isLeft ? selvW + 1 : width - selvW - 1;
      const x1 = isLeft ? selvW + Math.max(6, lim * 0.45) : width - selvW - Math.max(6, lim * 0.45);
      pts.length = 0;
      pts.push([x0, clamp(ym + 6, 0, clothH)], [x1, clamp(ym - 6, 0, clothH)]);
    }

    threads.push({
      carrier,
      pts,
      terminus,
      sign: isLeft ? 1 : -1,
      luster: r2(peakLuster)
    });
  }
  return { threads, sampleCandidates };
}

/**
 * Builds 6 sculpted folded-gore ribbons per panel from `sampleCuirassFields`
 * so both bias panels exhibit dimensional haute-couture drape and specular arris.
 */
function buildDrapeGores({ side, width, clothH, selvW, seam, gap, cuirassPairs }) {
  const isLeft = side === 'I';
  const gores = [];
  const count = 6;
  for (let g = 0; g < count; g++) {
    const frac0 = (g + 0.14) / count;
    const frac1 = (g + 0.62) / count;
    const edgeA = [];
    const edgeB = [];
    const arris = [];
    let meanBeat = 0;
    const M = 18;
    for (let i = 0; i <= M; i++) {
      const y = (i / M) * clothH;
      const lim = isLeft ? (seam(y) - gap) : (seam(y) + gap);
      const outer = isLeft ? selvW : (width - selvW);
      const span = lim - outer;
      // Bias skew across height creates genuine diagonal couture gores
      const skew = ((y / clothH) - 0.5) * span * 0.28;
      const x0 = clamp(outer + span * frac0 + skew, Math.min(outer, lim), Math.max(outer, lim));
      const x1 = clamp(outer + span * frac1 + skew, Math.min(outer, lim), Math.max(outer, lim));
      const xm = (x0 + x1) * 0.5;
      const sample = cuirassPairs ? sampleCuirassFields(cuirassPairs, xm, y, 0) : { beat: 0, envelope: 0.3 };
      const wave = sample.beat * 4.5;
      meanBeat += (sample.beat + 1) * 0.5;
      edgeA.push([x0 + wave, y]);
      edgeB.push([x1 + wave, y]);
      arris.push([xm + wave * 1.15, y]);
    }
    gores.push({
      index: g,
      edgeA,
      edgeB,
      arris,
      intensity: r2(clamp(meanBeat / (M + 1), 0.12, 0.95))
    });
  }
  return gores;
}

/**
 * Collision-free two-track solver for the five non-commutative clock callouts.
 */
function layoutClockCallouts(clocks, width, selvW) {
  const clockSym = { LAYER_k: 'k', TOKEN_n: 'n', SURROGATE_tau: 'τ', WALL: 'wall', PLANT_48KHZ: '48k' };
  const maxTick = Math.max(...clocks.map((c) => c.tick), 1);
  const padX = Math.max(selvW + 10, 26);
  const usable = Math.max(120, width - padX * 2);
  const raw = clocks.map((c) => {
    const text = `${clockSym[c.id] || c.id}·${c.tick}`;
    const tickX = padX + (c.tick / (maxTick * 1.08)) * usable;
    const estW = text.length * 6.6 + 14;
    return { ...c, sym: clockSym[c.id] || c.id, text, tickX, labelX: tickX, estW, row: 0 };
  }).sort((a, b) => a.tickX - b.tickX);

  const rowRight = [-Infinity, -Infinity];
  for (const item of raw) {
    const desiredLeft = clamp(item.tickX + 6, 8, Math.max(8, width - item.estW - 6));
    if (desiredLeft >= rowRight[0] + 8) {
      item.row = 0;
      item.labelX = desiredLeft;
      rowRight[0] = desiredLeft + item.estW;
    } else if (desiredLeft >= rowRight[1] + 8) {
      item.row = 1;
      item.labelX = desiredLeft;
      rowRight[1] = desiredLeft + item.estW;
    } else {
      const r = rowRight[0] <= rowRight[1] ? 0 : 1;
      item.row = r;
      item.labelX = Math.min(width - item.estW - 6, rowRight[r] + 8);
      rowRight[r] = item.labelX + item.estW;
    }
  }
  // Right-boundary pass in case narrow viewport pushed final label past right edge
  for (const r of [0, 1]) {
    const rowItems = raw.filter((x) => x.row === r);
    let maxRight = width - 6;
    for (let i = rowItems.length - 1; i >= 0; i--) {
      const it = rowItems[i];
      if (it.labelX + it.estW > maxRight) it.labelX = Math.max(6, maxRight - it.estW);
      maxRight = it.labelX - 5;
    }
  }
  return raw;
}

/** Pure geometry & optical model: composable by any renderer. */
export function composeBiasDraft({
  width = 1200,
  height = 420,
  indexA = 1,
  indexB = 2,
  lag = 36,
  labelA = 'Work I',
  labelB = 'Work II',
  fileA = '',
  fileB = '',
  workIdA = '',
  workIdB = '',
  reversed = false,
  mode = 'salon',
  podiumRole = '',
  notesActive = false,
  cartCount = 0,
  proposalTitle = '',
  proposalFit = null,
  visualField = null
} = {}) {
  const w = Math.max(300, Math.round(width));
  const h = Math.max(210, Math.round(height));
  const compact = w < 620;
  const rulerH = compact ? 38 : 34;
  const clothH = h - rulerH;
  const selvW = compact ? 16 : 22;
  const gap = compact ? 3.5 : 4.5;

  const [iA, iB] = reversed ? [indexB, indexA] : [indexA, indexB];
  const [idA, idB] = reversed ? [workIdB, workIdA] : [workIdA, workIdB];
  const baseRatio = mode === 'podium' && podiumRole === 'MAESTRO' ? 0.56 : 0.5;
  const normalizedField = normalizeComposerVisualField(visualField);
  const fieldGain = Number.isFinite(normalizedField?.depthGain) ? normalizedField.depthGain : 1;
  const seed = fnv1a(`${idA || iA}|${idB || iB}|${mode}|${reversed ? 'BA' : 'AB'}`);

  // Pre-compute analytical D3/phi wave-vector pairs from RGI15 beat radiometry
  const baseOptics = measureCoutureBeats({ width: w, height: clothH, time: lag * 0.04, seed });
  const cuirassPairs = baseOptics.pairs;

  const seam = seamSampler({
    width: w, clothH, selvW, indexA: iA, indexB: iB, lag,
    workIdA: idA, workIdB: idB, baseRatio
  });
  const amp = Math.min(13.5, w / 78) * (0.94 + fieldGain * 0.06);
  const tOpts = { theta: seam.theta };
  const qOpts = { phase: seam.phase };
  const T = (x, y) => triangular(x, y, tOpts);
  const Q = (x, y) => quasiperiodic(x, y, qOpts);

  const leftCut = cutPanel({ side: 'I', width: w, clothH, selvW, seam: seam.at, gap, field: T, cuirassPairs, amp });
  const rightCut = cutPanel({ side: 'II', width: w, clothH, selvW, seam: seam.at, gap, field: Q, cuirassPairs, amp });
  const leftGores = buildDrapeGores({ side: 'I', width: w, clothH, selvW, seam: seam.at, gap, cuirassPairs });
  const rightGores = buildDrapeGores({ side: 'II', width: w, clothH, selvW, seam: seam.at, gap, cuirassPairs });

  // Measure RGI15 bounded electrical blooms across actual carrier-seam stations
  const seamSamples = [
    ...leftCut.sampleCandidates,
    ...rightCut.sampleCandidates,
    ...Array.from({ length: 18 }, (_, k) => {
      const y = ((k + 0.5) / 18) * clothH;
      return { x: seam.at(y), y };
    })
  ];
  const optics = measureCoutureBeats({
    width: w,
    height: clothH,
    time: lag * 0.04,
    seed,
    samplePoints: seamSamples
  });

  // Waist: tightest inward sweep of the seam within the central bodice zone
  let waistY = clothH * 0.48;
  let best = Infinity;
  const iStart = Math.max(6, Math.floor(seam.n * 0.22));
  const iEnd = Math.min(seam.n - 6, Math.ceil(seam.n * 0.78));
  for (let i = iStart; i <= iEnd; i++) {
    if (seam.xs[i] < best) {
      best = seam.xs[i];
      waistY = (i / seam.n) * clothH;
    }
  }
  const waist = [seam.at(waistY), waistY];
  const e = 2.5;
  const [wx, wy] = waist;
  const grad = (F) => [
    (F(wx + e, wy) - F(wx - e, wy)) / (2 * e),
    (F(wx, wy + e) - F(wx, wy - e)) / (2 * e)
  ];
  const gT = grad(T);
  const gQ = grad(Q);
  const scale = 40;
  const aperture = singularValues2([
    [gT[0] * scale, gT[1] * scale],
    [gQ[0] * scale, gQ[1] * scale]
  ]);
  const tw = T(wx, wy);
  const qw = Q(wx, wy);
  const mirror = project111([tw, qw, Math.abs(tw - qw)]);

  // Geometric caustic peak: maximum |T - Q| fold difference well separated from waist
  let causticY = clothH * 0.72;
  let fMax = -1;
  for (let i = 6; i <= seam.n - 6; i++) {
    const y = (i / seam.n) * clothH;
    if (y < clothH * 0.22 || y > clothH * 0.84) continue;
    const x = seam.at(y);
    const f = Math.abs(T(x, y) - Q(x, y));
    if (f > fMax && Math.abs(y - waistY) > clothH * 0.18) {
      fMax = f;
      causticY = y;
    }
  }

  const clocks = fiveClockTicks(lag);
  const clockCallouts = layoutClockCallouts(clocks, w, selvW);
  const gates = Array.from({ length: 8 }, (_, j) => {
    const y = ((j + 0.58) / 8.3) * (clothH - 22) + 20;
    return [seam.at(y), y];
  });
  const custodyLocks = ['OPERAHOUSE', 'OPERA', 'PERFORMER'].map((role, j) => {
    const y = clothH * (0.24 + j * 0.27);
    return { role, x: seam.at(y), y };
  });

  const labels = reversed
    ? { A: labelB, B: labelA, fA: fileB, fB: fileA, oA: 'II', oB: 'I', idA: workIdB, idB: workIdA }
    : { A: labelA, B: labelB, fA: fileA, fB: fileB, oA: 'I', oB: 'II', idA: workIdA, idB: workIdB };

  return Object.freeze({
    contract: BIAS_DRAFT_CONTRACT,
    mode,
    podiumRole,
    notesActive: Boolean(notesActive),
    cartCount: Math.max(0, Number(cartCount) || 0),
    proposalTitle: String(proposalTitle || ''),
    proposalFit: Number.isFinite(+proposalFit) && proposalFit !== null ? +proposalFit : null,
    width: w,
    height: h,
    compact,
    clothH,
    rulerH,
    selvW,
    gap,
    seam,
    left: leftCut.threads,
    right: rightCut.threads,
    leftGores,
    rightGores,
    computational_carriers_per_panel: CARRIERS.length,
    rendered_carriers: Object.freeze({
      left: leftCut.threads.length,
      right: rightCut.threads.length
    }),
    optics: Object.freeze({
      peakCount: optics.peakCount,
      peaks: optics.peaks,
      nyquistGuarded: optics.nyquistGuarded,
      aliasRatio: r2(optics.aliasRatio),
      totalEmission: r2(reinhardBounded(optics.totalEmission)),
      palette: ELECTRIC_COUTURE.garment
    }),
    waist,
    gradT: gT,
    gradQ: gQ,
    aperture,
    mirror,
    proposal: [seam.at(causticY), causticY, r2(Math.max(0, fMax))],
    gates,
    custodyLocks,
    clocks,
    clockCallouts,
    lag,
    reversed,
    labels
  });
}

const pathOf = (pts) => pts.map((p, i) => (i ? 'L' : 'M') + r2(p[0]) + ' ' + r2(p[1])).join('');
const gorePolygon = (a, b) => `${pathOf(a)} ${b.slice().reverse().map((p) => `L${r2(p[0])} ${r2(p[1])}`).join(' ')}Z`;

function threadStroke(c, side) {
  if (side === 'I') return c.index % 9 === 0 ? '#7c5e17' : c.index % 5 === 0 ? '#52575e' : '#23262c';
  return c.index % 9 === 0 ? '#fff2a9' : c.index % 5 === 0 ? '#d8dce2' : '#f4f1ea';
}

function clipText(str, maxChars) {
  const s = String(str || '').trim();
  if (s.length <= maxChars) return s;
  return s.slice(0, Math.max(8, maxChars - 1)).trimEnd() + '…';
}

/** SVG renderer for the computed Bias Draft model. */
export function renderBiasDraftSVG(m, { title = 'The Bias Draft' } = {}) {
  const uid = `bcd${++instanceSeq}`;
  const { width: W, height: H, clothH, selvW, gap, seam, compact, mode } = m;
  const N = seam.n;
  const seamPts = Array.from({ length: N + 1 }, (_, i) => [seam.xs[i], (i / N) * clothH]);
  const leftPoly = `M${selvW} 0 ${seamPts.map(([x, y]) => `L${r2(x - gap)} ${r2(y)}`).join(' ')} L${selvW} ${clothH}Z`;
  const rightPoly = `M${W - selvW} 0 ${seamPts.map(([x, y]) => `L${r2(x + gap)} ${r2(y)}`).join(' ')} L${W - selvW} ${clothH}Z`;
  const band = `M${seamPts.map(([x, y]) => `${r2(x - gap)} ${r2(y)}`).join(' L')} L${[...seamPts].reverse().map(([x, y]) => `${r2(x + gap)} ${r2(y)}`).join(' L')}Z`;
  const seamL = pathOf(seamPts.map(([x, y]) => [x - gap - 2.6, y]));
  const seamR = pathOf(seamPts.map(([x, y]) => [x + gap + 2.6, y]));
  const weltL = pathOf(seamPts.map(([x, y]) => [x - gap - 0.6, y]));
  const weltR = pathOf(seamPts.map(([x, y]) => [x + gap + 0.6, y]));

  // Dimensional folded-gore pleats
  const renderGores = (gores, side) => gores.map((g) => {
    const isLeft = side === 'I';
    const fill = isLeft
      ? (g.index % 2 === 0 ? `rgba(21,23,27,${r2(0.032 + g.intensity * 0.045)})` : `rgba(255,252,245,${r2(0.42 + g.intensity * 0.3)})`)
      : (g.index % 2 === 0 ? `rgba(216,220,226,${r2(0.045 + g.intensity * 0.08)})` : `rgba(7,8,10,${r2(0.32 + g.intensity * 0.25)})`);
    const arrisColor = isLeft ? '#ffffff' : (g.index % 3 === 0 ? '#fff2a9' : '#d8dce2');
    const arrisOp = isLeft ? 0.55 : r2(0.14 + g.intensity * 0.22);
    return `<path d="${gorePolygon(g.edgeA, g.edgeB)}" fill="${fill}"/>` +
      `<path d="${pathOf(g.arris)}" fill="none" stroke="${arrisColor}" stroke-width="${isLeft ? 0.9 : 0.75}" stroke-opacity="${arrisOp}"/>`;
  }).join('');

  // 39 + 39 Loom carriers with structural boning under-sheen on the 6 near-plane ribs
  const renderThreads = (list, side) => list.map((t, k) => {
    const c = t.carrier;
    const d = pathOf(t.pts);
    const sw = c.near ? 1.45 : c.mid ? 0.92 : 0.56;
    const op = c.near ? 0.94 : c.mid ? 0.62 : 0.34;
    const boning = c.near
      ? `<path d="${d}" stroke="${side === 'I' ? '#ffffff' : '#e8d7a8'}" stroke-width="${sw + 2.1}" stroke-opacity="${side === 'I' ? 0.65 : 0.14}"/>`
      : '';
    const eyelet = t.terminus && (c.near || (c.mid && k % 2 === 0))
      ? `<circle cx="${r2(t.terminus[0])}" cy="${r2(t.terminus[1])}" r="${c.near ? 2.1 : 1.35}" fill="${side === 'I' ? '#15171b' : '#fff2a9'}" fill-opacity="${c.near ? 0.95 : 0.72}"/>`
      : '';
    return `${boning}<path class="bc-d-thread bc-d-${c.plane}" pathLength="1" style="--k:${k}" d="${d}" stroke="${threadStroke(c, side)}" stroke-width="${sw}" stroke-opacity="${op}"/>${eyelet}`;
  }).join('');

  // RGI15 Reinhard-bounded electrical couture blooms
  const blooms = m.optics.peaks.slice(0, compact ? 6 : 10).map((pk, idx) => {
    const rad = r2(clamp(pk.bloomRadius * (compact ? 0.78 : 0.95), 4, BEAT_POLICY.max_bloom_css_px));
    const core = r2(Math.max(1.3, rad * 0.18));
    const flare = r2(rad * 0.62);
    const warm = idx % 3 !== 1;
    const gradId = warm ? `${uid}BloomGold` : `${uid}BloomRose`;
    const op = r2(clamp(0.42 + pk.energy * 0.55, 0.35, 0.95));
    return `<g class="bc-d-bloom" opacity="${op}">` +
      `<circle cx="${r2(pk.x)}" cy="${r2(pk.y)}" r="${rad}" fill="url(#${gradId})"/>` +
      `<path d="M${r2(pk.x - flare)} ${r2(pk.y)} L${r2(pk.x + flare)} ${r2(pk.y)} M${r2(pk.x)} ${r2(pk.y - flare * 1.15)} L${r2(pk.x)} ${r2(pk.y + flare * 1.15)}" stroke="${warm ? '#fff2a9' : '#ff9fbb'}" stroke-width="0.85" stroke-opacity="0.85"/>` +
      `<circle cx="${r2(pk.x)}" cy="${r2(pk.y)}" r="${core}" fill="#fffef7"/>` +
      `</g>`;
  }).join('');

  // Seam stitches: 8 human-gated pairs in Salon; 3 role-separation lockstitches in Threshold/Podium
  let seamMarks = '';
  if (mode === 'threshold') {
    seamMarks = m.custodyLocks.map(({ role, x, y }) => {
      const boxW = role.length * 6.4 + 16;
      const bx = clamp(x - boxW * 0.5, selvW + 8, W - selvW - boxW - 8);
      return `<g class="bc-d-lock">` +
        `<line x1="${r2(x - 24)}" y1="${r2(y)}" x2="${r2(x + 24)}" y2="${r2(y)}" stroke="#e8d7a8" stroke-width="1.25" stroke-dasharray="4 3"/>` +
        `<rect x="${r2(bx)}" y="${r2(y - 9)}" width="${r2(boxW)}" height="18" rx="2" fill="#0b0c0f" stroke="#e8d7a8" stroke-opacity="0.72"/>` +
        `<text x="${r2(bx + boxW * 0.5)}" y="${r2(y + 3.5)}" text-anchor="middle" class="bc-d-micro" fill="#fff2a9">${esc(role)}</text>` +
        `</g>`;
    }).join('');
  } else if (mode === 'podium') {
    const roleTag = m.podiumRole === 'MAESTRO'
      ? 'MAESTRO · SOURCE EXPEDITION'
      : m.podiumRole === 'COMPOSER'
        ? 'COMPOSER · COUNTERPOINT HELD'
        : 'CHOOSE ONE ROLE PER SESSION';
    const ryLock = Math.abs(m.waist[1] - clothH * 0.32) < 30 ? clothH * 0.68 : clothH * 0.32;
    const rx = m.seam.at(ryLock);
    const rw = Math.min(W - selvW * 2 - 20, roleTag.length * 6.5 + 22);
    const rbx = clamp(rx - rw * 0.5, selvW + 8, W - selvW - rw - 8);
    seamMarks = `<g class="bc-d-lock">` +
      `<line x1="${r2(rx - 28)}" y1="${r2(ryLock)}" x2="${r2(rx + 28)}" y2="${r2(ryLock)}" stroke="#ff91af" stroke-width="1.2" stroke-dasharray="4 3"/>` +
      `<rect x="${r2(rbx)}" y="${r2(ryLock - 10)}" width="${r2(rw)}" height="20" rx="2" fill="#0b0c0f" stroke="#e8d7a8" stroke-opacity="0.85"/>` +
      `<text x="${r2(rbx + rw * 0.5)}" y="${r2(ryLock + 3.5)}" text-anchor="middle" class="bc-d-micro" fill="#fff2a9">${esc(roleTag)}</text>` +
      `</g>`;
  } else {
    seamMarks = m.gates.map(([x, y], j) =>
      `<g class="bc-d-gate"><path d="M${r2(x - 18)} ${r2(y - 6)} L${r2(x + 18)} ${r2(y + 6)}" stroke="#e8d7a8" stroke-width="1.3" stroke-dasharray="4 3"/>` +
      `<path d="M${r2(x - gap - 5.5)} ${r2(y - 3)} l4.5 3 l-4.5 3z" fill="#e8d7a8"/><path d="M${r2(x + gap + 5.5)} ${r2(y - 3)} l-4.5 3 l4.5 3z" fill="#e8d7a8"/>` +
      `<text x="${r2(x + 21)}" y="${r2(y + 9)}" class="bc-d-micro" fill="#e8d7a8">G${j + 1}</text></g>`
    ).join('');
  }

  // Synthetic optical waist aperture + [111] triad spokes
  const [wx, wy] = m.waist;
  const ap = m.aperture;
  const rMax = compact ? 24 : 33;
  const rMin = typeof ap.condition === 'number' ? Math.max(1.4, rMax / Math.min(ap.condition, 24)) : 1.1;
  const angle = (Math.atan2(m.gradT[1], m.gradT[0]) * 180) / Math.PI;
  const kappa = typeof ap.condition === 'number' ? ap.condition.toFixed(2) : '∞';
  const proj = m.mirror.projection;
  const spoke = (i, a) => {
    const L = 7 + Math.min(1, Math.abs(proj[i]) * 2.2) * (compact ? 18 : 25);
    const rad = (a * Math.PI) / 180;
    return `<line x1="${r2(wx)}" y1="${r2(wy)}" x2="${r2(wx + L * Math.cos(rad))}" y2="${r2(wy + L * Math.sin(rad))}"/>`;
  };
  const apText = compact ? `synthetic κ ${kappa}` : `OPTICAL κ ${kappa} · SYNTHETIC`;
  const apBoxW = apText.length * 6.5 + 16;
  const apPlaceLeft = mode === 'threshold'
    ? true
    : (wx + rMax + apBoxW + 14 > W - selvW - 6);
  const apBoxX = apPlaceLeft
    ? Math.max(selvW + 6, wx - rMax - apBoxW - 10)
    : wx + rMax + 10;
  const apBoxY = clamp(wy - 9.5, 32, clothH - 28);

  // Caustic peak / Salon unratified inquiry marker (Salon mode only)
  let causticMarkup = '';
  if (mode === 'salon') {
    const [px, py, fVal] = m.proposal;
    const tagTxt = m.proposalFit !== null
      ? `UNRATIFIED FIT ${(m.proposalFit * 100).toFixed(1)}%`
      : `CAUSTIC |T−Q| ${fVal.toFixed(2)}`;
    const tagW = tagTxt.length * 6.2 + 14;
    const placeRight = px - tagW - 14 < selvW + 6;
    const tx = placeRight ? Math.min(W - selvW - tagW - 6, px + 13) : Math.max(selvW + 6, px - tagW - 13);
    causticMarkup = `<g class="bc-d-proposal">` +
      `<path d="M${r2(px)} ${r2(py - 9)} L${r2(px + 2.8)} ${r2(py - 2.8)} L${r2(px + 9)} ${r2(py)} L${r2(px + 2.8)} ${r2(py + 2.8)} L${r2(px)} ${r2(py + 9)} L${r2(px - 2.8)} ${r2(py + 2.8)} L${r2(px - 9)} ${r2(py)} L${r2(px - 2.8)} ${r2(py - 2.8)}Z" fill="#ff91af" stroke="#15171b" stroke-width="0.7"/>` +
      `<rect x="${r2(tx)}" y="${r2(py - 9)}" width="${r2(tagW)}" height="18" rx="2" fill="rgba(244,241,234,.92)" stroke="#a3204f" stroke-opacity="0.55"/>` +
      `<text x="${r2(tx + tagW * 0.5)}" y="${r2(py + 3.5)}" text-anchor="middle" class="bc-d-micro" fill="#a3204f">${esc(tagTxt)}</text>` +
      `</g>`;
  }

  // Unworked human-closure buttonhole: clamped strictly within [selvW + 8, W - selvW - 8]
  const bhX = m.seam.at(16);
  const bhY = 15;
  const bhLabel = compact ? 'CLOSURE · RESERVED' : 'HUMAN CLOSURE · RESERVED';
  const bhLabelW = bhLabel.length * 6.3 + 12;
  const bhTotalW = 28 + 6 + bhLabelW;
  const bhLeft = clamp(bhX - 14, selvW + 8, Math.max(selvW + 8, W - selvW - bhTotalW - 8));
  const closureMarkup = `<g class="bc-d-closure">` +
    `<rect x="${r2(bhLeft - 3)}" y="${r2(bhY - 9)}" width="${r2(bhTotalW + 6)}" height="18" rx="3" fill="rgba(11,12,15,.88)" stroke="#e8d7a8" stroke-opacity="0.38"/>` +
    `<rect x="${r2(bhLeft)}" y="${r2(bhY - 4.5)}" width="26" height="9" rx="4.5" fill="#0b0c0f" stroke="#fff2a9" stroke-width="1.4"/>` +
    `<line x1="${r2(bhLeft + 5)}" y1="${r2(bhY)}" x2="${r2(bhLeft + 21)}" y2="${r2(bhY)}" stroke="#fff2a9" stroke-width="0.9" stroke-dasharray="2 2"/>` +
    `<text x="${r2(bhLeft + 32)}" y="${r2(bhY + 3.5)}" class="bc-d-micro" fill="#fff2a9">${bhLabel}</text>` +
    `</g>`;

  // Grain arrows & compact horizontal nameplates
  const L = m.labels;
  const grainLabelA = mode === 'threshold' ? 'HUMAN · ON THE BIAS' : 'CUT I · ON THE BIAS';
  const grainLabelB = mode === 'threshold' ? 'AI / LLM · COUNTER-BIAS' : 'CUT II · COUNTER-BIAS';
  const gSpan = compact ? 36 : 58;
  const gA = [selvW + (m.seam.at(clothH * 0.76) - selvW) * 0.42, clothH * 0.76];
  const gB = [W - selvW - (W - selvW - m.seam.at(clothH * 0.76)) * 0.42, clothH * 0.76];

  const showGrainArrows = !compact || clothH >= 180;
  const grainMarkup = showGrainArrows
    ? `<g class="bc-d-grain" stroke-width="1" fill="none">
  <g transform="rotate(-45 ${r2(gA[0])} ${r2(gA[1])})" stroke="#23262c">
    <line x1="${r2(gA[0] - gSpan)}" y1="${r2(gA[1])}" x2="${r2(gA[0] + gSpan)}" y2="${r2(gA[1])}"/>
    <path d="M${r2(gA[0] - gSpan)} ${r2(gA[1])} l7 -3.5 M${r2(gA[0] - gSpan)} ${r2(gA[1])} l7 3.5 M${r2(gA[0] + gSpan)} ${r2(gA[1])} l-7 -3.5 M${r2(gA[0] + gSpan)} ${r2(gA[1])} l-7 3.5"/>
    <text x="${r2(gA[0])}" y="${r2(gA[1] - 6)}" text-anchor="middle" class="bc-d-label" fill="#15171b" stroke="none">${grainLabelA}</text>
  </g>
  <g transform="rotate(45 ${r2(gB[0])} ${r2(gB[1])})" stroke="#d8dce2">
    <line x1="${r2(gB[0] - gSpan)}" y1="${r2(gB[1])}" x2="${r2(gB[0] + gSpan)}" y2="${r2(gB[1])}"/>
    <path d="M${r2(gB[0] - gSpan)} ${r2(gB[1])} l7 -3.5 M${r2(gB[0] - gSpan)} ${r2(gB[1])} l7 3.5 M${r2(gB[0] + gSpan)} ${r2(gB[1])} l-7 -3.5 M${r2(gB[0] + gSpan)} ${r2(gB[1])} l-7 3.5"/>
    <text x="${r2(gB[0])}" y="${r2(gB[1] - 6)}" text-anchor="middle" class="bc-d-label" fill="#eceae4" stroke="none">${grainLabelB}</text>
  </g>
</g>`
    : '';

  const room = Math.max(18, Math.floor((clothH - 22) / 6.8));
  const selA = clipText(`${L.oA} · ${L.A}${L.fA ? ' · ' + L.fA : ''}`, room);
  const selB = clipText(`${L.oB} · ${L.B}${L.fB ? ' · ' + L.fB : ''}`, room);

  // On compact viewports, add crisp horizontal selvedge badges at top-left / bottom-right
  const compactBadges = compact
    ? `<g class="bc-d-compact-plate">` +
      `<rect x="${selvW + 6}" y="38" width="${Math.min(148, Math.round(W * 0.4))}" height="20" rx="2" fill="rgba(244,241,234,.94)" stroke="#8d939a"/>` +
      `<text x="${selvW + 12}" y="51.5" class="bc-d-micro" fill="#15171b">${esc(clipText(`${L.oA} · ${L.fA || L.A}`, 21))}</text>` +
      `<rect x="${W - selvW - Math.min(148, Math.round(W * 0.4)) - 6}" y="${clothH - 28}" width="${Math.min(148, Math.round(W * 0.4))}" height="20" rx="2" fill="rgba(16,18,24,.92)" stroke="#8d939a"/>` +
      `<text x="${W - selvW - 12}" y="${clothH - 14.5}" text-anchor="end" class="bc-d-micro" fill="#f4f1ea">${esc(clipText(`${L.oB} · ${L.fB || L.B}`, 21))}</text>` +
      `</g>`
    : '';

  // Vernier ruler + collision-free five-clock callouts (or threshold contract datum)
  const ry = clothH;
  const step = Math.max(11, W / 88);
  let mainTicks = '';
  let vernTicks = '';
  for (let x = selvW, i = 0; x <= W - selvW; x += step, i++) {
    mainTicks += `<line x1="${r2(x)}" y1="${ry}" x2="${r2(x)}" y2="${ry + (i % 5 ? 4.5 : 8.5)}"/>`;
  }
  const vstep = step * 0.9;
  const voff = selvW + ((m.lag % 10) / 10) * step;
  for (let x = voff, i = 0; x <= W - selvW; x += vstep, i++) {
    vernTicks += `<line x1="${r2(x)}" y1="${H}" x2="${r2(x)}" y2="${H - (i % 5 ? 4.5 : 8.5)}"/>`;
  }

  const rulerCallouts = mode === 'threshold'
    ? `<text x="${r2(W * 0.5)}" y="${ry + Math.round(m.rulerH * 0.62)}" text-anchor="middle" class="bc-d-micro" fill="#e8d7a8">${compact ? 'OPERAHOUSE ≠ OPERA ≠ PERFORMER · credit 0' : 'OPERAHOUSE ≠ OPERA ≠ PERFORMER · model_connected: false · empirical_credit: 0'}</text>`
    : m.clockCallouts.map((c) => {
        const dotY = ry + 12.5;
        const textY = ry + (c.row === 0 ? 16 : 30);
        const leader = (c.row === 1 || Math.abs(c.labelX - (c.tickX + 6)) > 5)
          ? `<path d="M${r2(c.tickX)} ${r2(dotY + 2.5)} L${r2(c.labelX - 2)} ${r2(textY - 3.5)}" stroke="#8d939a" stroke-width="0.75" stroke-opacity="0.78" fill="none"/>`
          : '';
        return `<g class="bc-d-clock">${leader}<circle cx="${r2(c.tickX)}" cy="${r2(dotY)}" r="2.2" fill="#fff2a9"/><text x="${r2(c.labelX)}" y="${r2(textY)}" class="bc-d-micro" fill="#eceae4">${esc(c.text)}</text></g>`;
      }).join('');

  const hitTargets = mode === 'threshold'
    ? `<path class="bc-d-hit" data-bc-door="human" d="${leftPoly}" fill="transparent"/>` +
      `<path class="bc-d-hit" data-bc-door="ai" d="${rightPoly}" fill="transparent"/>`
    : mode === 'salon'
      ? `<path class="bc-d-hit" data-bc-panel="I" d="${leftPoly}" fill="transparent"/>` +
        `<path class="bc-d-hit" data-bc-panel="II" d="${rightPoly}" fill="transparent"/>` +
        `<path class="bc-d-hit bc-d-hit-seam" data-bc-seam-flip="true" d="${band}" fill="transparent"/>`
      : '';

  const descText = mode === 'threshold'
    ? `Dual-door threshold pattern draft. Left bias panel (${L.A}, ${L.fA}) and right counter-bias panel (${L.B}, ${L.fB}) each compute and render ${m.rendered_carriers.left}/${m.computational_carriers_per_panel} and ${m.rendered_carriers.right}/${m.computational_carriers_per_panel} carriers across a non-merging custody seam (OPERAHOUSE != OPERA != PERFORMER). Synthetic optical waist condition ${kappa}. Human closure reserved.`
    : `Bias-cut pattern draft (${m.reversed ? 'Route II before I' : 'Route I before II'}). Panel ${L.oA} (${L.A}) renders ${m.rendered_carriers.left} of ${m.computational_carriers_per_panel} D3-displaced carriers; Panel ${L.oB} (${L.B}) renders ${m.rendered_carriers.right} of ${m.computational_carriers_per_panel} phi-quasiperiodic counter-bias carriers. Signed seam x_s(y) = x_0 + 1.15a(T - Q) with ${m.optics.peakCount} bounded interference blooms. Synthetic optical gradient condition ${kappa} (formal geometry, not empirical identifiability). Eight unadjudicated human gates basted; human closure reserved.`;

  return `<svg class="bc-draft-svg bc-draft-svg--${esc(mode)}" viewBox="0 0 ${W} ${H}" width="100%" height="${H}" role="img" aria-labelledby="${uid}T ${uid}D" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
<title id="${uid}T">${esc(title)}</title>
<desc id="${uid}D">${esc(descText)}</desc>
<defs>
<linearGradient id="${uid}Vellum" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f8f5ef"/><stop offset=".58" stop-color="#f2ede4"/><stop offset="1" stop-color="#e5dfd4"/></linearGradient>
<linearGradient id="${uid}Night" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#22262c"/><stop offset=".52" stop-color="#12151b"/><stop offset="1" stop-color="#090a0d"/></linearGradient>
<linearGradient id="${uid}Chrome" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7c828a"/><stop offset=".48" stop-color="#f1efe9"/><stop offset="1" stop-color="#7c828a"/></linearGradient>
<radialGradient id="${uid}BloomGold" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#fffef7" stop-opacity=".95"/><stop offset="28%" stop-color="#fff2a9" stop-opacity=".58"/><stop offset="100%" stop-color="#fff2a9" stop-opacity="0"/></radialGradient>
<radialGradient id="${uid}BloomRose" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#fffef7" stop-opacity=".92"/><stop offset="30%" stop-color="#ff91af" stop-opacity=".52"/><stop offset="100%" stop-color="#ff91af" stop-opacity="0"/></radialGradient>
<clipPath id="${uid}ClipL"><path d="${leftPoly}"/></clipPath>
<clipPath id="${uid}ClipR"><path d="${rightPoly}"/></clipPath>
</defs>
<rect x="0" y="0" width="${W}" height="${clothH}" fill="#090a0d"/>
<g clip-path="url(#${uid}ClipL)">
  <path d="${leftPoly}" fill="url(#${uid}Vellum)"/>
  ${renderGores(m.leftGores, 'I')}
  <g fill="none" stroke-linecap="round">${renderThreads(m.left, 'I')}</g>
</g>
<g clip-path="url(#${uid}ClipR)">
  <path d="${rightPoly}" fill="url(#${uid}Night)"/>
  ${renderGores(m.rightGores, 'II')}
  <g fill="none" stroke-linecap="round">${renderThreads(m.right, 'II')}</g>
</g>
<path d="${band}" fill="#07080a"/>
<path d="${weltL}" fill="none" stroke="#d8dce2" stroke-width="0.9" stroke-opacity=".75"/>
<path d="${weltR}" fill="none" stroke="#e8d7a8" stroke-width="0.9" stroke-opacity=".68"/>
<path class="bc-d-stitch" d="${seamL}" fill="none" stroke="#23262c" stroke-width="1.05" stroke-dasharray="5 3"/>
<path class="bc-d-stitch" d="${seamR}" fill="none" stroke="#d8dce2" stroke-width="1.05" stroke-dasharray="5 3"/>
<g class="bc-d-blooms">${blooms}</g>
${seamMarks}
<g class="bc-d-aperture">
  <ellipse cx="${r2(wx)}" cy="${r2(wy)}" rx="${rMax}" ry="${r2(rMin)}" transform="rotate(${r2(angle)} ${r2(wx)} ${r2(wy)})" fill="rgba(11,12,15,.28)" stroke="url(#${uid}Chrome)" stroke-width="1.5"/>
  <circle cx="${r2(wx)}" cy="${r2(wy)}" r="${rMax + 5}" fill="none" stroke="#d8dce2" stroke-opacity=".36" stroke-dasharray="1.5 4"/>
  <g stroke="#ff91af" stroke-width="1.5" stroke-linecap="round">${spoke(0, -90)}${spoke(1, 30)}${spoke(2, 150)}</g>
  <rect x="${r2(apBoxX)}" y="${r2(apBoxY)}" width="${r2(apBoxW)}" height="19" rx="2" fill="#0b0c0f" stroke="#c9ccd1" stroke-opacity=".75"/>
  <text x="${r2(apBoxX + apBoxW * 0.5)}" y="${r2(apBoxY + 13)}" text-anchor="middle" class="bc-d-micro" fill="#f4f1ea">${esc(apText)}</text>
</g>
${causticMarkup}
${grainMarkup}
<g class="bc-d-selvedge">
  <rect x="0" y="0" width="${selvW}" height="${clothH}" fill="url(#${uid}Chrome)"/>
  <rect x="${W - selvW}" y="0" width="${selvW}" height="${clothH}" fill="url(#${uid}Chrome)"/>
  <line x1="${selvW}" y1="0" x2="${selvW}" y2="${clothH}" stroke="#23262c" stroke-width="1"/>
  <line x1="${W - selvW}" y1="0" x2="${W - selvW}" y2="${clothH}" stroke="#23262c" stroke-width="1"/>
  <text transform="translate(${r2(selvW * 0.68)} ${clothH - 10}) rotate(-90)" class="bc-d-selv" fill="#15171b">${esc(selA)}</text>
  <text transform="translate(${r2(W - selvW * 0.68)} 10) rotate(90)" class="bc-d-selv" fill="#15171b">${esc(selB)}</text>
</g>
${compactBadges}
${closureMarkup}
<rect x="0" y="${clothH}" width="${W}" height="${m.rulerH}" fill="#0d0f14"/>
<line x1="0" y1="${clothH}" x2="${W}" y2="${clothH}" stroke="#8d939a" stroke-width="1"/>
<g stroke="#8d939a" stroke-width="1">${mainTicks}</g>
<g stroke="#e8d7a8" stroke-opacity=".58" stroke-width="1">${vernTicks}</g>
${rulerCallouts}
${hitTargets}
</svg>`;
}

/** Mounts the Bias Draft and re-cuts strictly on input or resize change. Zero RAF. */
export function mountBiasDraft(host, readInputs, { height = 420, title } = {}) {
  if (!host || typeof readInputs !== 'function') return () => {};
  let last = '';
  let lastClientW = 0;
  let pending = 0;
  const resolveWidth = () => {
    const cw = Math.round(host.clientWidth || 0);
    if (cw > 0) return Math.max(300, cw);
    const vw = typeof window !== 'undefined' && window.innerWidth ? window.innerWidth : 1280;
    return Math.max(300, vw <= 680 ? vw - 32 : Math.min(1260, vw - 140));
  };
  const cut = () => {
    if (pending) {
      clearTimeout(pending);
      pending = 0;
    }
    const cw = Math.round(host.clientWidth || 0);
    const width = resolveWidth();
    const h = typeof height === 'function' ? height(width) : height;
    host.style.height = `${h}px`;
    const input = { ...readInputs(), width, height: h };
    const sig = JSON.stringify(input);
    lastClientW = cw;
    if (sig === last) return;
    const recut = last !== '';
    last = sig;
    const model = composeBiasDraft(input);
    host.innerHTML = renderBiasDraftSVG(model, { title });
    host.dataset.bcCut = recut ? 'recut' : 'first';
    host.dataset.bcCarriersLeft = String(model.rendered_carriers.left);
    host.dataset.bcCarriersRight = String(model.rendered_carriers.right);
    host.dispatchEvent(new CustomEvent('bc-draft-cut', {
      bubbles: true,
      detail: { recut, renderedCarriers: model.rendered_carriers, peakCount: model.optics.peakCount }
    }));
  };
  const schedule = () => {
    const cw = Math.round(host.clientWidth || 0);
    if (lastClientW === 0 && cw > 0) {
      cut();
      return;
    }
    if (!pending) pending = setTimeout(cut, 90);
  };
  cut();
  const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(schedule) : null;
  ro?.observe(host);
  return schedule;
}
