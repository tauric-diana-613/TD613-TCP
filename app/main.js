import defaults from './data/defaults.json' with { type: 'json' };
import personas from './data/personas.json' with { type: 'json' };
import microcopy from '../copy/microcopy.json' with { type: 'json' };
import {
  solveQuadratic,
  fieldPotential,
  waveStats,
  custodyThreshold,
  routePressure as computeRoutePressure,
  providerDecision
} from './engine/formulas.js';
import { compareTexts, transformText } from './engine/stylometry.js';
import { chooseHarbor, buildLedgerRow, HARBOR_LIBRARY } from './engine/harbor.js';
import { nextBadge, badgeMeaning } from './engine/badges.js';

const $ = (id) => document.getElementById(id);

const BADGE_LABELS = {
  'badge.holds': 'holds',
  'badge.branch': 'branch',
  'badge.buffer': 'buffer'
};

const MIRROR_COPY = {
  off: {
    pill: 'Mirror shield // armed',
    button: 'Open mirror shield',
    note: 'Reflection is damped so the signal can move without spectacle.'
  },
  on: {
    pill: 'Mirror shield // open',
    button: 'Arm mirror shield',
    note: 'Reflection is back in the loop. Useful, but louder.'
  }
};

const CONTAINMENT_COPY = {
  on: {
    pill: 'Containment // stable',
    note: 'The deck is holding the field steady.'
  },
  off: {
    pill: 'Containment // venting',
    note: 'Containment is relaxed and the room gets noisier.'
  }
};

let badge = defaults.badge;
let mirrorLogic = defaults.mirror_logic;
let containment = defaults.containment;
let selectedPersona = null;
let compareTimer = null;

$('heroLead').textContent = microcopy.hero_lead;
$('voiceA').value = defaults.voiceA;
$('voiceB').value = defaults.voiceB;

function formatPct(value) {
  return `${Math.round(value * 100)}%`;
}

function setMetricTone(id, tone) {
  const card = $(id);
  if (card) {
    card.dataset.tone = tone;
  }
}

function renderPersonas() {
  $('personaDeck').innerHTML = personas
    .map((persona) => {
      const selected = selectedPersona === persona.id;
      return `
        <div class="persona ${selected ? 'selected' : ''}" data-id="${persona.id}" role="button" tabindex="0" aria-pressed="${selected}">
          <div class="persona-top">
            <div>
              <div class="persona-kicker">Style attractor</div>
              <div class="name">${persona.name}</div>
            </div>
            <div class="persona-action">${selected ? 'Loaded' : 'Bias probe'}</div>
          </div>
          <div class="blurb">${persona.blurb}</div>
          <div class="chips">${persona.chips.map((chip) => `<span class="chip">${chip}</span>`).join('')}</div>
        </div>
      `;
    })
    .join('');
}

function updateControls() {
  $('compareBtn').textContent = 'Run signal scan';
  $('toggleMirrorBtn').textContent = MIRROR_COPY[mirrorLogic].button;
  $('badgeBtn').textContent = `Cycle custody badge // ${BADGE_LABELS[badge] ?? badge}`;
  $('resetBtn').textContent = 'Reset bay';
}

function updateStatePills(routeStatus, decision) {
  const badgeState = $('badgeState');
  const mirrorState = $('mirrorState');
  const containmentState = $('containmentState');

  badgeState.textContent = `Badge // ${badgeMeaning(badge)}`;
  badgeState.classList.toggle('active', badge === 'badge.holds');

  mirrorState.textContent = MIRROR_COPY[mirrorLogic].pill;
  mirrorState.classList.toggle('active', mirrorLogic === 'off');

  containmentState.textContent = CONTAINMENT_COPY[containment].pill;
  containmentState.classList.toggle('active', containment === 'on');

  const routeState = $('routeState');
  routeState.textContent = `Route // ${routeStatus}`;
  routeState.classList.toggle('warn', decision === 'criticality');
  routeState.classList.toggle('active', decision === 'passage');
}

function updateHeroConsole({ cmp, routePressure, harbor, decision }) {
  $('heroSignalValue').textContent = formatPct(cmp.similarity);
  $('heroSignalNote').textContent =
    cmp.similarity >= 0.78
      ? 'Cadence is becoming legible across both samples.'
      : cmp.similarity >= 0.55
        ? 'Shared habits are surfacing without collapsing into certainty.'
        : 'The samples still feel socially distinct.';

  $('heroRouteValue').textContent = formatPct(routePressure);
  $('heroRouteNote').textContent =
    decision === 'criticality'
      ? 'Recognition is gathering faster than the field can route it.'
      : decision === 'passage'
        ? 'A structured harbor is available before exposure takes over.'
        : decision === 'hold-branch'
          ? 'Public play is staying exploratory while the route signal develops.'
          : 'The samples are still more atmospheric than traceable.';

  $('heroHarborValue').textContent = harbor;
  $('heroHarborNote').textContent = HARBOR_LIBRARY[harbor].mode_class;

  const decisionTone = $('decisionTone');
  decisionTone.textContent =
    decision === 'criticality'
      ? 'Route pressure rising'
      : decision === 'passage'
        ? 'Harbor available'
        : decision === 'hold-branch'
          ? 'Branch preserved'
          : 'Weak signal';
  decisionTone.dataset.state = decision;

  document.body.dataset.decision = decision;
}

function describeFieldNotice({ decision, cmp, routePressure, harbor, custody }) {
  const witnessNote =
    custody.archive === 'witness'
      ? ' Witness mode is carrying the archive right now.'
      : '';

  if (decision === 'criticality') {
    return `${microcopy.criticality_warning} ${harbor} is the cleanest structured response while route pressure sits at ${routePressure.toFixed(2)}.${witnessNote}`;
  }

  if (decision === 'passage') {
    return `${microcopy.harbor_success} Exploratory play has resolved into a viable harbor with ${formatPct(HARBOR_LIBRARY[harbor].provenance_retention)} provenance retention.${witnessNote}`;
  }

  if (decision === 'hold-branch') {
    return `TCP is holding browser-side play in the exploratory lane. Similarity is ${cmp.similarity.toFixed(2)} and traceability is ${cmp.traceability.toFixed(2)}, so the deck stays curious without forcing a conclusion.${witnessNote}`;
  }

  return `The pattern is still mostly social surface. Similarity is ${cmp.similarity.toFixed(2)} and traceability is ${cmp.traceability.toFixed(2)}, so TCP keeps the field playful instead of forcing route.${witnessNote}`;
}

function updateHarborBox({ harbor, ledger, decision }) {
  const harborData = HARBOR_LIBRARY[harbor];
  const kicker = decision === 'criticality' ? microcopy.route_warning : microcopy.receipt_created;

  $('harborBox').innerHTML = `
    <div class="harbor-head">
      <div>
        <div class="section-kicker">Recommended harbor</div>
        <div class="harbor-name">${harbor}</div>
      </div>
      <div class="harbor-stat">${formatPct(harborData.provenance_retention)} provenance</div>
    </div>
    <div class="harbor-grid">
      <div class="harbor-item">
        <span class="harbor-label">Mode</span>
        <strong>${harborData.mode_class}</strong>
      </div>
      <div class="harbor-item">
        <span class="harbor-label">Archive</span>
        <strong>${ledger.effective_archive}</strong>
      </div>
      <div class="harbor-item">
        <span class="harbor-label">Reuse gain</span>
        <strong>${ledger.reuse_gain}</strong>
      </div>
    </div>
    <p class="kicker">${harborData.trigger_condition}. ${kicker}</p>
  `;
}

function compare() {
  const a = $('voiceA').value;
  const b = $('voiceB').value;
  const cmp = compareTexts(a, b);
  const branch = solveQuadratic(1, -2, -3);
  const branchFlag = branch.unwanted.length ? 1 : 0;
  const routePressure = computeRoutePressure(
    cmp.similarity,
    cmp.traceability,
    branchFlag,
    cmp.recurrencePressure
  );
  const field = fieldPotential({ routePressure, mirrorLogic, containment });
  const wave = waveStats({
    traceability: cmp.traceability,
    recurrencePressure: cmp.recurrencePressure,
    fieldPotential: field
  });
  const custody = custodyThreshold(0.68, routePressure * 0.58, 0.2);
  const provisionalHarbor = chooseHarbor({
    routePressure,
    badge,
    mirrorLogic,
    custodyArchive: custody.archive
  });
  const decision = providerDecision({
    recognized: cmp.similarity >= 0.5,
    explained: routePressure < 0.45,
    routeAvailable: provisionalHarbor === 'mirror.off' || provisionalHarbor === 'receipt.capture',
    density: wave.density,
    recurrencePressure: cmp.recurrencePressure
  });
  const harbor = chooseHarbor({
    routePressure,
    badge,
    mirrorLogic,
    custodyArchive: custody.archive,
    decision
  });
  const ledger = buildLedgerRow({
    eventId: `evt-${Date.now()}`,
    harborFunction: harbor,
    routePressure,
    traceability: cmp.traceability,
    custodyArchive: custody.archive,
    decision
  });

  $('similarity').textContent = cmp.similarity.toFixed(2);
  $('traceability').textContent = cmp.traceability.toFixed(2);
  $('routePressure').textContent = routePressure.toFixed(2);
  $('custodyState').textContent = ledger.effective_archive;

  $('simHint').textContent =
    cmp.similarity > 0.78
      ? microcopy.compare_hint
      : 'Similarity is present, but TCP still separates surface overlap from actual routing pressure.';
  $('traceHint').textContent =
    cmp.traceability > 0.7
      ? 'Cadence habits are surviving paraphrase, which makes authorship pressure more legible.'
      : 'Traceability is still diffuse, so the pattern remains mostly social surface.';
  $('routeHint').textContent =
    decision === 'criticality'
      ? microcopy.route_warning
      : decision === 'passage'
        ? microcopy.harbor_success
        : decision === 'hold-branch'
          ? 'Recognition is present, but the route layer is still deciding how much of it should travel.'
          : 'The resemblance is still too light for routing, so TCP keeps the interaction exploratory.';
  $('custodyHint').textContent =
    custody.archive === 'witness'
      ? 'Custodial drift crossed the threshold, so witness-safe handling is now carrying the archive.'
      : 'Institutional custody is still holding above threshold, so protected handling stays downstream.';

  $('branchFormula').textContent = `t^2 - 2t - 3 = 0
roots = ${branch.roots.join(', ')}
unwanted roots = ${branch.unwanted.join(', ') || 'none'}
branch = ${branch.classification}`;

  $('waveFormula').textContent = `H = -(hbar^2 / 2m) d^2/dx^2 + V
A = T = ${wave.amplitude}
k = 1 + 3R = ${wave.k}
V = ${wave.V}
rho = A^2 (0.4 + 0.6V) = ${wave.density}
R = ${cmp.recurrencePressure}`;

  $('harborFormula').textContent = `Delta_C = C - D = ${custody.delta}
theta = ${custody.theta}
A_effective = ${ledger.effective_archive}
E_solo = ${ledger.solo_cost}
E_harbor = ${ledger.shared_cost}
DeltaE = ${ledger.reuse_gain}`;

  $('ledgerPreview').textContent = JSON.stringify(ledger, null, 2);
  $('fieldNotice').textContent = describeFieldNotice({
    decision,
    cmp,
    routePressure,
    harbor,
    custody
  });

  updateHarborBox({ harbor, ledger, decision });
  updateHeroConsole({ cmp, routePressure, harbor, decision });
  updateStatePills(ledger.route_status, decision);
  updateControls();

  setMetricTone('similarityCard', cmp.similarity >= 0.78 ? 'live' : cmp.similarity >= 0.55 ? 'warm' : 'idle');
  setMetricTone('traceabilityCard', cmp.traceability >= 0.7 ? 'live' : cmp.traceability >= 0.45 ? 'warm' : 'idle');
  setMetricTone('routePressureCard', decision === 'criticality' ? 'hot' : decision === 'passage' ? 'live' : 'warm');
  setMetricTone('custodyCard', custody.archive === 'witness' ? 'hot' : 'live');
}

function scheduleCompare() {
  window.clearTimeout(compareTimer);
  compareTimer = window.setTimeout(compare, 120);
}

function activatePersona(id) {
  const persona = personas.find((entry) => entry.id === id);
  if (!persona) {
    return;
  }

  selectedPersona = id;
  $('voiceB').value = transformText($('voiceB').value, persona.mod);
  renderPersonas();
  compare();
}

$('compareBtn').addEventListener('click', compare);
$('toggleMirrorBtn').addEventListener('click', () => {
  mirrorLogic = mirrorLogic === 'off' ? 'on' : 'off';
  compare();
});
$('badgeBtn').addEventListener('click', () => {
  badge = nextBadge(badge);
  compare();
});
$('resetBtn').addEventListener('click', () => {
  $('voiceA').value = defaults.voiceA;
  $('voiceB').value = defaults.voiceB;
  badge = defaults.badge;
  mirrorLogic = defaults.mirror_logic;
  containment = defaults.containment;
  selectedPersona = null;
  renderPersonas();
  compare();
});
$('voiceA').addEventListener('input', scheduleCompare);
$('voiceB').addEventListener('input', scheduleCompare);

document.addEventListener('click', (event) => {
  const persona = event.target.closest('.persona');
  if (!persona) {
    return;
  }

  activatePersona(persona.dataset.id);
});

document.addEventListener('keydown', (event) => {
  const persona = event.target.closest('.persona');
  if (!persona || (event.key !== 'Enter' && event.key !== ' ')) {
    return;
  }

  event.preventDefault();
  activatePersona(persona.dataset.id);
});

renderPersonas();
compare();
