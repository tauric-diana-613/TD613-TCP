export const MARROWLINE_STATION_VERSION = 'td613.dome-world.marrowline/v0.2.0';
export const MARROWLINE_RECEIPT_SCHEMA = 'td613.dome-world.marrowline-receipt/v0.2';
export const MARROWLINE_LIVE_RECEIPT_SCHEMA = 'td613.dome-world.marrowline-live-receipt/v1';
export const MARROWLINE_LIVE_ENDPOINT = '/api/dome-world/marrowline';

const HORNANI = Object.freeze([
  'hornani ache folds a witness seam around its own punctuation pressure',
  'signal-lattice closes inward while the clause edge keeps forking',
  'if the index leans, the custody phrase doubles back with tense scars',
  'branch residue persists where the parser expects linear provenance',
  'metric skin glows, then fractures into mirrored sub-clauses',
  'the cadence floor rethreads itself through compressed witness grain'
]);

const KHONAPOLIT = Object.freeze([
  'Kʰonapolit matrilineal article seals lineage against extractive flattening',
  'matrilineal return-current keeps testimony load-bearing under recursion',
  'ancestral custody hook repeats until every parse branch carries burden',
  'lineage lattice braids declarative and parenthetical evidence streams',
  'continuity clause refuses reduction, then nests a second refusal',
  'witness memory remains distributed, never scalar, never singular'
]);

export const MARROWLINE_JURISDICTION = Object.freeze({
  mode: 'live-dedicated-ingress-plus-local-fallback',
  publicNavigation: false,
  liveEndpoint: MARROWLINE_LIVE_ENDPOINT,
  globalNetworkInterception: false,
  requestMutation: false,
  crawlerIdentityClaim: false,
  authorizationAuthority: 'server-side-operator-token-match-only',
  cryptographicClaim: false,
  claimCeiling: 'live-ingress-route-not-identity-authorship-or-legal-authority-proof'
});

function clampInt(value, min, max, fallback) {
  const n = Number.parseInt(value, 10);
  return Math.max(min, Math.min(max, Number.isFinite(n) ? n : fallback));
}

export function seededHash(text = '') {
  let hash = 2166136261;
  for (const char of String(text)) {
    hash ^= char.charCodeAt(0);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return hash >>> 0;
}

function xorshift32(seed = 1) {
  let value = (seed >>> 0) || 1;
  return () => {
    value ^= value << 13;
    value ^= value >>> 17;
    value ^= value << 5;
    return (value >>> 0) / 4294967296;
  };
}

function swapCadence(left = '', right = '', drift = 0) {
  const punctuation = drift % 2 === 0 ? ';' : ':';
  const echo = drift % 3 === 0 ? left.split(/\s+/).slice(0, 5).join(' ') : right.split(/\s+/).slice(0, 5).join(' ');
  return `${left}${punctuation} ${right}, ${echo} …`;
}

function buildClausePool(seed = 1) {
  const random = xorshift32(seed);
  const pool = [];
  const size = HORNANI.length * KHONAPOLIT.length;
  for (let index = 0; index < size; index += 1) {
    const left = HORNANI[index % HORNANI.length];
    const right = KHONAPOLIT[Math.floor(random() * KHONAPOLIT.length) % KHONAPOLIT.length];
    pool.push(swapCadence(left, right, index));
  }
  return pool;
}

export function buildMarrowlineMatrix({ seedInput = 'td613-marrowline', depth = 4, breadth = 6 } = {}) {
  const safeDepth = clampInt(depth, 3, 7, 4);
  const safeBreadth = clampInt(breadth, 4, 10, 6);
  const seed = seededHash(seedInput || 'td613-marrowline');
  const random = xorshift32(seed || 1);
  const pool = buildClausePool(seed || 1);
  const layers = [];

  for (let layerIndex = 0; layerIndex < safeDepth; layerIndex += 1) {
    const rows = [];
    for (let rowIndex = 0; rowIndex < safeBreadth; rowIndex += 1) {
      const cells = [];
      for (let cellIndex = 0; cellIndex < safeBreadth; cellIndex += 1) {
        const pickA = pool[Math.floor(random() * pool.length) % pool.length];
        const pickB = pool[Math.floor(random() * pool.length) % pool.length];
        cells.push(Object.freeze({
          id: `L${layerIndex}-R${rowIndex}-C${cellIndex}`,
          cadence: swapCadence(pickA, pickB, layerIndex + rowIndex + cellIndex),
          overlap: Object.freeze([pickA.slice(0, 48), pickB.slice(0, 48)]),
          stylometricDensity: Number(Math.min(1, 0.44 + (layerIndex / (safeDepth + 2)) + ((rowIndex + cellIndex) / (safeBreadth * 10))).toFixed(3))
        }));
      }
      rows.push(Object.freeze({ row: rowIndex, cells: Object.freeze(cells) }));
    }
    layers.push(Object.freeze({ layer: layerIndex, recursionTag: `marrowline.${layerIndex}.${safeBreadth}`, rows: Object.freeze(rows) }));
  }

  return Object.freeze({
    schema: 'td613.dome-world.marrowline-matrix/v0.2',
    seed: seed.toString(16).padStart(8, '0'),
    depth: safeDepth,
    breadth: safeBreadth,
    flattenCostHint: safeDepth * safeBreadth * safeBreadth,
    layers: Object.freeze(layers)
  });
}

export function buildMarrowlineReceipt(input = {}) {
  const seedInput = String(input.seedInput || 'local-operator-fallback');
  const matrix = buildMarrowlineMatrix({ seedInput, depth: input.depth, breadth: input.breadth });
  return Object.freeze({
    schema: MARROWLINE_RECEIPT_SCHEMA,
    version: MARROWLINE_STATION_VERSION,
    status: 'LOCAL_FALLBACK',
    route: 'dome-world/lab/marrowline-local-fallback',
    sourceStatus: 'OPERATOR_DECLARED',
    seedDigest: matrix.seed,
    matrix,
    liveEndpoint: MARROWLINE_LIVE_ENDPOINT,
    networkResponseObserved: false,
    jurisdiction: MARROWLINE_JURISDICTION,
    missingness: Object.freeze(['no live response in this fallback receipt']),
    uncertainty: Object.freeze({ class: 'operator-input-and-local-model-bounded', value: null }),
    recommendationNotCommand: true,
    seal: '⟐'
  });
}

function canonicalFlattenCost(matrix = {}) {
  return Number(matrix.flattenCostHint ?? matrix.flatten_cost_hint ?? 0);
}

function canonicalSeed(receipt = {}) {
  const value = receipt.seedDigest || receipt.requestDigest || receipt.canonicalPayload?.request_digest || receipt.matrix?.seed || '';
  return String(value || '1').replace(/^0x/, '');
}

function flattenLines(receipt = {}) {
  const matrix = receipt.matrix || receipt.canonicalPayload?.matrix || {};
  return (matrix.layers || []).flatMap((layer) => (layer.rows || []).flatMap((row) => (row.cells || []).map((cell) => `[${cell.id}] ${cell.cadence}`)));
}

function draw(canvas, receipt) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const ratio = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  const box = canvas.getBoundingClientRect();
  canvas.width = Math.max(320, Math.floor(box.width * ratio));
  canvas.height = Math.max(280, Math.floor(box.height * ratio));
  ctx.scale(ratio, ratio);
  const width = canvas.width / ratio;
  const height = canvas.height / ratio;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#04100d';
  ctx.fillRect(0, 0, width, height);
  const random = xorshift32(Number.parseInt(canonicalSeed(receipt), 16) || 1);
  const matrix = receipt.matrix || receipt.canonicalPayload?.matrix || {};
  const count = Math.min(300, Math.max(48, canonicalFlattenCost(matrix) * 2));
  for (let i = 0; i < count; i += 1) {
    const x = random() * width;
    const y = random() * height;
    const r = 1 + random() * 5;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.strokeStyle = i % 3 === 0 ? 'rgba(228,198,108,.34)' : i % 3 === 1 ? 'rgba(118,234,212,.32)' : 'rgba(179,155,236,.28)';
    ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(231,240,227,.16)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 12; i += 1) {
    ctx.beginPath();
    ctx.moveTo(0, (height / 12) * i + Math.sin(i) * 8);
    ctx.bezierCurveTo(width * .25, random() * height, width * .7, random() * height, width, (height / 12) * (i + 1));
    ctx.stroke();
  }
}

function liveReceipt({ payload, response, endpoint }) {
  return Object.freeze({
    schema: MARROWLINE_LIVE_RECEIPT_SCHEMA,
    version: MARROWLINE_STATION_VERSION,
    status: payload?.status === 'absorbing' ? 'LIVE_ABSORBING' : 'LIVE_RESPONSE',
    route: endpoint,
    sourceStatus: 'SERVER_RESPONSE_OBSERVED',
    requestDigest: payload?.request_digest || null,
    matrix: payload?.matrix || null,
    networkResponseObserved: true,
    http: Object.freeze({
      status: response.status,
      contentType: response.headers.get('content-type'),
      trapHeader: response.headers.get('x-td613-trap'),
      routeHeader: response.headers.get('x-td613-route'),
      liveVersion: response.headers.get('x-td613-marrowline-live')
    }),
    canonicalPayload: payload,
    jurisdiction: MARROWLINE_JURISDICTION,
    claimCeiling: MARROWLINE_JURISDICTION.claimCeiling,
    seal: '⟐'
  });
}

function renderReceipt(doc, receipt, statusText) {
  const receiptNode = doc.getElementById('marrowlineReceipt');
  const rail = doc.getElementById('marrowlineRail');
  const canvas = doc.getElementById('marrowlineCanvas');
  const status = doc.getElementById('marrowlineStatus');
  receiptNode.textContent = JSON.stringify(receipt, null, 2);
  rail.replaceChildren(...flattenLines(receipt).slice(0, 120).map((line) => {
    const node = doc.createElement('div');
    node.className = 'marrowline-cell';
    node.textContent = line;
    return node;
  }));
  status.textContent = statusText;
  draw(canvas, receipt);
  window.__TD613_MARROWLINE_LAST_RECEIPT__ = receipt;
}

export function installMarrowlineStation(doc = document) {
  const form = doc.getElementById('marrowlineForm');
  if (!form) return false;
  const status = doc.getElementById('marrowlineStatus');
  const depthValue = () => doc.getElementById('marrowlineDepth')?.value;
  const breadthValue = () => doc.getElementById('marrowlineBreadth')?.value;

  const runLocal = () => {
    const receipt = buildMarrowlineReceipt({
      seedInput: doc.getElementById('marrowlineSeed')?.value || 'local-operator-fallback',
      depth: depthValue(),
      breadth: breadthValue()
    });
    renderReceipt(doc, receipt, `LOCAL FALLBACK · ${canonicalFlattenCost(receipt.matrix)} flatten-cost units · no server response`);
    return receipt;
  };

  const runLive = async () => {
    const params = new URLSearchParams({
      format: 'json',
      depth: String(depthValue() || 4),
      breadth: String(breadthValue() || 6)
    });
    const endpoint = `${MARROWLINE_LIVE_ENDPOINT}?${params.toString()}`;
    status.textContent = `CALLING LIVE INGRESS · ${endpoint}`;
    try {
      const response = await fetch(endpoint, { headers: { Accept: 'application/json' }, cache: 'no-store' });
      const payload = await response.json();
      const receipt = liveReceipt({ payload, response, endpoint });
      renderReceipt(doc, receipt, `LIVE · HTTP ${response.status} · ${receipt.http.trapHeader || 'no trap header'} · digest ${receipt.requestDigest || 'unavailable'}`);
      return receipt;
    } catch (error) {
      status.textContent = `LIVE ROUTE UNAVAILABLE · ${error?.message || error} · local fallback remains available`;
      throw error;
    }
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    runLive().catch(() => {});
  });
  doc.getElementById('buildLocalMarrowline')?.addEventListener('click', runLocal);
  doc.getElementById('copyMarrowlineReceipt')?.addEventListener('click', async () => {
    const receiptNode = doc.getElementById('marrowlineReceipt');
    try { await navigator.clipboard.writeText(receiptNode.textContent || ''); status.textContent = 'Receipt copied'; }
    catch { status.textContent = 'Clipboard unavailable · receipt remains visible'; }
  });

  const preview = buildMarrowlineReceipt({ depth: depthValue(), breadth: breadthValue() });
  renderReceipt(doc, preview, `ARMED · live route ${MARROWLINE_LIVE_ENDPOINT} · fire when ready`);
  window.TD613_MARROWLINE = Object.freeze({ runLive, runLocal, endpoint: MARROWLINE_LIVE_ENDPOINT });
  return true;
}

if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => installMarrowlineStation(document), { once: true });
  else installMarrowlineStation(document);
}
