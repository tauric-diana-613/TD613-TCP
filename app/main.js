import defaults from './data/defaults.js';
import basePersonas from './data/personas.js';
import microcopy from '../copy/microcopy.js';
import {
  cadenceCoherence,
  cadenceResonance,
  branchDynamics,
  fieldPotential,
  waveStats,
  custodyThreshold,
  criticalityIndex,
  routePressure as computeRoutePressure,
  providerDecision
} from './engine/formulas.js';
import {
  compareTexts,
  extractCadenceProfile,
  applyCadenceToText,
  cadenceModFromProfile
} from './engine/stylometry.js';
import { chooseHarbor, buildLedgerRow, HARBOR_LIBRARY } from './engine/harbor.js';
import { nextBadge, badgeMeaning } from './engine/badges.js';

const $ = (id) => document.getElementById(id);

const STORAGE_KEY = 'tcp.savedPersonas.v1';
const SLOT_LABELS = {
  A: 'Reference voice',
  B: 'Probe voice'
};
const SLOT_SHORT = {
  A: 'reference',
  B: 'probe'
};
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
let activeVoice = 'A';
let cadenceAssignments = {
  A: null,
  B: null
};
let savedPersonas = loadSavedPersonas();

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

function setMetricKeys(mode = 'pair') {
  if (mode === 'solo') {
    $('similarityKey').textContent = 'Scan mode';
    $('traceKey').textContent = 'Sentence rhythm';
    $('routeKey').textContent = 'Recurrence pressure';
    $('custodyKey').textContent = 'Active bay';
    return;
  }

  $('similarityKey').textContent = 'Cadence similarity';
  $('traceKey').textContent = 'Traceability';
  $('routeKey').textContent = 'Route pressure';
  $('custodyKey').textContent = 'Effective archive';
}

function setStatusMessage(message) {
  $('analysisStatus').textContent = message;
}

function renderActiveBayStatus() {
  $('activeBayStatus').textContent = `Active bay // ${SLOT_LABELS[activeVoice].toLowerCase()}`;
}

function loadSavedPersonas() {
  try {
    const payload = window.localStorage.getItem(STORAGE_KEY);
    return payload ? JSON.parse(payload) : [];
  } catch {
    return [];
  }
}

function persistSavedPersonas() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(savedPersonas));
  } catch {
    // localStorage can be unavailable on some file:// contexts; keep the session alive anyway
  }
}

function getPersonaLibrary() {
  return [...basePersonas, ...savedPersonas];
}

function findPersona(id) {
  return getPersonaLibrary().find((persona) => persona.id === id) || null;
}

function getAssignedPersona(slot) {
  return findPersona(cadenceAssignments[slot]);
}

function getVoiceState(slot) {
  const text = $(slot === 'A' ? 'voiceA' : 'voiceB').value;
  const rawProfile = extractCadenceProfile(text);
  const persona = getAssignedPersona(slot);
  const effectiveText = applyCadenceToText(text, persona ? { mode: 'persona', mod: persona.mod } : { mode: 'native' });
  const effectiveProfile = extractCadenceProfile(effectiveText);

  return {
    slot,
    text,
    effectiveText,
    hasText: !rawProfile.empty,
    rawProfile,
    effectiveProfile,
    persona
  };
}

function profileTone(profile) {
  if (!profile || profile.empty) {
    return 'idle';
  }

  if (profile.recurrencePressure >= 0.58 || profile.punctuationDensity >= 0.18) {
    return 'live';
  }

  if (profile.recurrencePressure >= 0.32) {
    return 'warm';
  }

  return 'idle';
}

function describeCadenceShell(persona) {
  return persona ? `Cadence shell // ${persona.name}` : 'Cadence shell // native';
}

function renderVoiceProfile(voiceState) {
  const slotId = voiceState.slot === 'A' ? 'voiceAProfile' : 'voiceBProfile';
  const fieldId = voiceState.slot === 'A' ? 'voiceAField' : 'voiceBField';
  const panel = $(slotId);
  const field = $(fieldId);

  field.classList.toggle('active', activeVoice === voiceState.slot);
  panel.dataset.tone = profileTone(voiceState.effectiveProfile);
  panel.classList.toggle('active', activeVoice === voiceState.slot);

  if (!voiceState.hasText) {
    panel.innerHTML = `
      <div class="bay-shell-row">
        <span class="bay-shell">${activeVoice === voiceState.slot ? 'Active bay' : 'Cadence bay'}</span>
        <span class="bay-shell">${describeCadenceShell(voiceState.persona)}</span>
      </div>
      <p class="bay-copy">Paste a voice here to extract sentence rhythm, punctuation shape, contraction density, and recurrence pressure.</p>
    `;
    return;
  }

  const profile = voiceState.effectiveProfile;
  const shellNote = voiceState.persona
    ? `Applied shell bias: sent ${voiceState.persona.mod.sent >= 0 ? '+' : ''}${voiceState.persona.mod.sent}, cont ${voiceState.persona.mod.cont >= 0 ? '+' : ''}${voiceState.persona.mod.cont}, punc ${voiceState.persona.mod.punc >= 0 ? '+' : ''}${voiceState.persona.mod.punc}.`
    : 'Native cadence only. No shell is bending the readout.';

  panel.innerHTML = `
    <div class="bay-shell-row">
      <span class="bay-shell">${activeVoice === voiceState.slot ? 'Active bay' : 'Cadence bay'}</span>
      <span class="bay-shell">${describeCadenceShell(voiceState.persona)}</span>
    </div>
    <div class="bay-metrics">
      <span class="bay-metric">Rhythm ${profile.avgSentenceLength.toFixed(1)}w</span>
      <span class="bay-metric">Punct ${formatPct(profile.punctuationDensity)}</span>
      <span class="bay-metric">Contractions ${formatPct(profile.contractionDensity)}</span>
      <span class="bay-metric">Recurrence ${formatPct(profile.recurrencePressure)}</span>
    </div>
    <p class="bay-copy">${shellNote}</p>
  `;
}

function renderVoiceProfiles() {
  renderVoiceProfile(getVoiceState('A'));
  renderVoiceProfile(getVoiceState('B'));
}

function personaAssignmentLabel(personaId) {
  const slots = [];
  if (cadenceAssignments.A === personaId) {
    slots.push('Reference');
  }
  if (cadenceAssignments.B === personaId) {
    slots.push('Probe');
  }

  return slots.length ? slots.join(' + ') : 'Assign shell';
}

function renderPersonas() {
  $('personaDeck').innerHTML = getPersonaLibrary()
    .map((persona) => {
      const selected = cadenceAssignments[activeVoice] === persona.id;
      const assigned = cadenceAssignments.A === persona.id || cadenceAssignments.B === persona.id;
      const source = persona.source === 'saved' ? 'captured in-app' : 'built-in attractor';

      return `
        <div class="persona ${selected ? 'selected' : ''} ${assigned ? 'assigned' : ''}" data-id="${persona.id}" role="button" tabindex="0" aria-pressed="${selected}">
          <div class="persona-top">
            <div>
              <div class="persona-kicker">${source}</div>
              <div class="name">${persona.name}</div>
            </div>
            <div class="persona-action">${personaAssignmentLabel(persona.id)}</div>
          </div>
          <div class="blurb">${persona.blurb}</div>
          <div class="chips">${persona.chips.map((chip) => `<span class="chip">${chip}</span>`).join('')}</div>
        </div>
      `;
    })
    .join('');

  const activePersona = getAssignedPersona(activeVoice);
  $('personaStatus').textContent = `Active bay // ${SLOT_LABELS[activeVoice]} // ${activePersona ? activePersona.name : 'native cadence'}`;
  renderActiveBayStatus();
}

function updateControls() {
  $('compareBtn').textContent = 'Analyze Cadences';
  $('swapCadencesBtn').textContent = 'Swap Cadences';
  $('savePersonaBtn').textContent = `Save Cadence as Persona // ${SLOT_SHORT[activeVoice]}`;
  $('toggleMirrorBtn').textContent = MIRROR_COPY[mirrorLogic].button;
  $('badgeBtn').textContent = `Cycle custody badge // ${BADGE_LABELS[badge] ?? badge}`;
  $('resetBtn').textContent = 'Reset bay';

  $('swapCadencesBtn').disabled = !cadenceAssignments.A && !cadenceAssignments.B;
  $('savePersonaBtn').disabled = !getVoiceState(activeVoice).hasText;
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

function updateHeroConsolePair({ cmp, routePressure, harbor, decision }) {
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

function updateHeroConsoleSolo(voiceState) {
  $('heroSignalValue').textContent = 'SOLO';
  $('heroSignalNote').textContent = `Cadence captured from the ${SLOT_SHORT[voiceState.slot]} bay. Add a second voice to test contrast.`;
  $('heroRouteValue').textContent = formatPct(voiceState.effectiveProfile.recurrencePressure);
  $('heroRouteNote').textContent = 'Solo scans expose rhythm and recurrence, but route pressure needs a second voice.';
  $('heroHarborValue').textContent = voiceState.persona ? voiceState.persona.name : 'save.persona';
  $('heroHarborNote').textContent = voiceState.persona
    ? 'A cadence shell is already shaping this bay.'
    : 'You can save this cadence in-app or pair it with another voice.';

  const decisionTone = $('decisionTone');
  decisionTone.textContent = 'Solo capture';
  decisionTone.dataset.state = 'hold-branch';
  document.body.dataset.decision = 'hold-branch';
}

function resetMetricTones() {
  setMetricTone('similarityCard', 'idle');
  setMetricTone('traceabilityCard', 'idle');
  setMetricTone('routePressureCard', 'idle');
  setMetricTone('custodyCard', 'idle');
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

function updateHarborBoxSolo(voiceState) {
  $('harborBox').innerHTML = `
    <div class="harbor-head">
      <div>
        <div class="section-kicker">Solo capture</div>
        <div class="harbor-name">${voiceState.persona ? voiceState.persona.name : 'cadence capture'}</div>
      </div>
      <div class="harbor-stat">${formatPct(voiceState.effectiveProfile.recurrencePressure)} recurrence</div>
    </div>
    <div class="harbor-grid">
      <div class="harbor-item">
        <span class="harbor-label">Bay</span>
        <strong>${SLOT_LABELS[voiceState.slot]}</strong>
      </div>
      <div class="harbor-item">
        <span class="harbor-label">Shell</span>
        <strong>${voiceState.persona ? voiceState.persona.name : 'native cadence'}</strong>
      </div>
      <div class="harbor-item">
        <span class="harbor-label">Next move</span>
        <strong>Save or pair</strong>
      </div>
    </div>
    <p class="kicker">A solo scan keeps the branch open. Save this cadence as a persona or bring in a second voice to test route, harbor, and custody.</p>
  `;
}

function renderIdleState() {
  setMetricKeys('pair');
  $('similarity').textContent = '--';
  $('traceability').textContent = '--';
  $('routePressure').textContent = '--';
  $('custodyState').textContent = '--';
  $('simHint').textContent = 'Paste at least one voice to start the field.';
  $('traceHint').textContent = '';
  $('routeHint').textContent = '';
  $('custodyHint').textContent = '';
  $('branchFormula').textContent = 'Delta_branch = stylometric surplus above lexical overlap.\nPair two voices to test whether the branch stays resolved or opens into candidate discovery.';
  $('waveFormula').textContent = 'Paste a voice to expose cadence metrics.\nPair two voices to compute resonance, density, and criticality.';
  $('harborFormula').textContent = 'Analyze one or two voices to surface custody drift, archive state, and reuse gain.';
  $('ledgerPreview').textContent = '{\n  "status": "idle"\n}';
  $('fieldNotice').textContent = 'Bring one or two voices into the field. Solo scans capture cadence. Paired scans test similarity, route pressure, and harbor.';
  $('heroSignalValue').textContent = '--';
  $('heroSignalNote').textContent = 'Paste voices to light the deck.';
  $('heroRouteValue').textContent = '--';
  $('heroRouteNote').textContent = 'TCP is idle until a scan runs.';
  $('heroHarborValue').textContent = '--';
  $('heroHarborNote').textContent = 'A harbor will appear once the field resolves.';
  $('decisionTone').textContent = 'Scanning';
  $('decisionTone').dataset.state = 'weak-signal';
  $('harborBox').innerHTML = '';
  updateStatePills('buffered', 'weak-signal');
  resetMetricTones();
  document.body.dataset.decision = 'weak-signal';
}

function renderSoloState(voiceState) {
  setMetricKeys('solo');
  $('similarity').textContent = 'SOLO';
  $('traceability').textContent = `${voiceState.effectiveProfile.avgSentenceLength.toFixed(1)}w`;
  $('routePressure').textContent = voiceState.effectiveProfile.recurrencePressure.toFixed(2);
  $('custodyState').textContent = SLOT_SHORT[voiceState.slot];

  $('simHint').textContent = 'A second voice unlocks cadence contrast. Solo mode captures a signature you can save in-app.';
  $('traceHint').textContent = 'Sentence rhythm shows how quickly clauses turn and settle.';
  $('routeHint').textContent = 'Recurrence pressure tracks punctuation, line-break drag, and repeated return-patterns.';
  $('custodyHint').textContent = 'The active bay is where persona assignment and save operations land.';

  $('branchFormula').textContent = `Delta_branch needs two voices.
Solo capture stays native to the active bay until a second sample exposes stylometric surplus.`;
  $('waveFormula').textContent = `signature = {
  rhythm: ${voiceState.effectiveProfile.avgSentenceLength.toFixed(1)} words,
  punct: ${voiceState.effectiveProfile.punctuationDensity},
  cont: ${voiceState.effectiveProfile.contractionDensity},
  recurrence: ${voiceState.effectiveProfile.recurrencePressure}
}`;
  $('harborFormula').textContent = 'Pair a second voice to compute route pressure, archive thresholds, and reuse gain.';
  $('ledgerPreview').textContent = JSON.stringify(
    {
      mode: 'solo-capture',
      active_bay: SLOT_SHORT[voiceState.slot],
      cadence_shell: voiceState.persona ? voiceState.persona.name : 'native',
      rhythm_words: voiceState.effectiveProfile.avgSentenceLength,
      recurrence_pressure: voiceState.effectiveProfile.recurrencePressure
    },
    null,
    2
  );
  $('fieldNotice').textContent = `Solo capture is live in the ${SLOT_SHORT[voiceState.slot]} bay. Save the cadence as a persona or add a second voice to see whether resemblance can route into anything sturdier than afterimage.`;

  updateHeroConsoleSolo(voiceState);
  updateHarborBoxSolo(voiceState);
  updateStatePills('awaiting pair', 'hold-branch');
  setMetricTone('similarityCard', 'warm');
  setMetricTone('traceabilityCard', profileTone(voiceState.effectiveProfile));
  setMetricTone('routePressureCard', profileTone(voiceState.effectiveProfile));
  setMetricTone('custodyCard', 'live');
}

function renderPairState(voiceStateA, voiceStateB) {
  const cmp = compareTexts(voiceStateA.effectiveText, voiceStateB.effectiveText, {
    profileA: voiceStateA.effectiveProfile,
    profileB: voiceStateB.effectiveProfile
  });
  const coherence = cadenceCoherence(cmp);
  const resonance = cadenceResonance({
    similarity: cmp.similarity,
    traceability: cmp.traceability,
    coherence
  });
  const branch = branchDynamics({
    ...cmp,
    coherence
  });
  const routePressure = computeRoutePressure({
    similarity: cmp.similarity,
    traceability: cmp.traceability,
    recurrencePressure: cmp.recurrencePressure,
    branchPressure: branch.branchPressure,
    coherence,
    resonance
  });
  const field = fieldPotential({
    routePressure,
    resonance,
    coherence,
    branchPressure: branch.branchPressure,
    mirrorLogic,
    containment
  });
  const wave = waveStats({
    similarity: cmp.similarity,
    traceability: cmp.traceability,
    resonance,
    coherence,
    branchPressure: branch.branchPressure,
    recurrencePressure: cmp.recurrencePressure,
    fieldPotential: field
  });
  const routeAvailable = mirrorLogic === 'on' && routePressure >= 0.48;
  const criticality = criticalityIndex({
    density: wave.density,
    routePressure,
    branchPressure: branch.branchPressure,
    routeAvailable
  });
  const custody = custodyThreshold({
    routePressure,
    density: wave.density,
    branchPressure: branch.branchPressure,
    resonance,
    coherence,
    criticality,
    badge,
    mirrorLogic,
    containment,
    theta: 0.2
  });
  const decision = providerDecision({
    recognized: resonance >= 0.54 || cmp.similarity >= 0.56,
    explained: routePressure < 0.52 && branch.branchPressure < 0.42,
    routeAvailable,
    density: wave.density,
    recurrencePressure: cmp.recurrencePressure
  });
  const harbor = chooseHarbor({
    routePressure,
    branchPressure: branch.branchPressure,
    criticality,
    badge,
    mirrorLogic,
    custodyArchive: custody.archive,
    decision,
    routeAvailable
  });
  const ledger = buildLedgerRow({
    eventId: `evt-${Date.now()}`,
    harborFunction: harbor,
    routePressure,
    traceability: cmp.traceability,
    branchPressure: branch.branchPressure,
    criticality,
    density: wave.density,
    routeAvailable,
    custodyArchive: custody.archive,
    decision
  });

  setMetricKeys('pair');
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
      ? 'The custody delta fell below the collapse threshold, so witness custody is functioning as the effective archive.'
      : 'Institutional custody remains above the collapse threshold and therefore continues to function as the effective archive.';

  $('branchFormula').textContent = `Delta_branch = 0.68 max(0, T - L) + 0.32 max(0, C_style - L) = ${branch.branchPressure}
x^2 - beta x + gamma = 0
beta = 1 + S + T = ${branch.beta}
gamma = 0.42 - Delta_branch = ${branch.gamma}
roots = ${branch.roots.join(', ') || 'complex'}
branch = ${branch.classification}`;

  $('waveFormula').textContent = `resonance = H(S, T, C_style) = ${resonance}
V = ${wave.V}
A = resonance = ${wave.amplitude}
k = 1 + 2.2R + 0.8Delta_branch = ${wave.k}
rho = A^2 (0.26 + 0.44V + 0.30C_style) = ${wave.density}
criticality = ${criticality}`;

  $('harborFormula').textContent = `C = ${custody.integrity}
D = ${custody.drift}
Delta_C = C - D = ${custody.delta}
theta = ${custody.theta}
A_effective = ${ledger.effective_archive}
E_solo = ${ledger.solo_cost}
E_harbor = ${ledger.shared_cost}
DeltaE = ${ledger.reuse_gain}`;

  $('ledgerPreview').textContent = JSON.stringify(ledger, null, 2);
  $('fieldNotice').textContent =
    decision === 'criticality'
      ? `${microcopy.criticality_warning} ${harbor} is the cleanest structured response while route pressure sits at ${routePressure.toFixed(2)}.`
      : decision === 'passage'
        ? `${microcopy.harbor_success} Exploratory play has resolved into a viable harbor with ${formatPct(HARBOR_LIBRARY[harbor].provenance_retention)} provenance retention.`
        : decision === 'hold-branch'
          ? `TCP is holding browser-side play in the exploratory lane. Similarity is ${cmp.similarity.toFixed(2)} and traceability is ${cmp.traceability.toFixed(2)}, so the deck stays curious without forcing a conclusion.`
          : `The pattern is still mostly social surface. Similarity is ${cmp.similarity.toFixed(2)} and traceability is ${cmp.traceability.toFixed(2)}, so TCP keeps the field playful instead of forcing route.`;

  updateHarborBox({ harbor, ledger, decision });
  updateHeroConsolePair({ cmp, routePressure, harbor, decision });
  updateStatePills(ledger.route_status, decision);

  setMetricTone('similarityCard', cmp.similarity >= 0.78 ? 'live' : cmp.similarity >= 0.55 ? 'warm' : 'idle');
  setMetricTone('traceabilityCard', cmp.traceability >= 0.7 ? 'live' : cmp.traceability >= 0.45 ? 'warm' : 'idle');
  setMetricTone('routePressureCard', decision === 'criticality' ? 'hot' : decision === 'passage' ? 'live' : 'warm');
  setMetricTone('custodyCard', custody.archive === 'witness' ? 'hot' : 'live');
}

function analyzeCadences() {
  const voiceStateA = getVoiceState('A');
  const voiceStateB = getVoiceState('B');

  renderVoiceProfiles();

  if (!voiceStateA.hasText && !voiceStateB.hasText) {
    renderIdleState();
    setStatusMessage('Paste one or two voices, then press Analyze Cadences.');
    updateControls();
    renderPersonas();
    return;
  }

  if (!voiceStateA.hasText || !voiceStateB.hasText) {
    const soloState = voiceStateA.hasText ? voiceStateA : voiceStateB;
    renderSoloState(soloState);
    setStatusMessage(`Solo scan complete in the ${SLOT_SHORT[soloState.slot]} bay. Save it as a persona or add a second voice for contrast.`);
    updateControls();
    renderPersonas();
    return;
  }

  renderPairState(voiceStateA, voiceStateB);
  setStatusMessage('Paired cadence scan complete. Swap shells, save a persona, or tune the mirror and badge controls.');
  updateControls();
  renderPersonas();
}

function setActiveVoice(slot) {
  activeVoice = slot;
  renderVoiceProfiles();
  renderPersonas();
  updateControls();
}

function assignPersonaToActiveBay(id) {
  const persona = findPersona(id);
  if (!persona) {
    return;
  }

  cadenceAssignments[activeVoice] = persona.id;
  analyzeCadences();
  setStatusMessage(`${persona.name} is now shaping the ${SLOT_SHORT[activeVoice]} cadence shell. The text stayed put; only the cadence shell changed.`);
}

function swapCadences() {
  const nextAssignments = {
    A: cadenceAssignments.B,
    B: cadenceAssignments.A
  };
  cadenceAssignments = nextAssignments;
  analyzeCadences();
  setStatusMessage('Cadence shells swapped. The text stayed put; only the shells moved.');
}

function buildSavedPersonaName(slot) {
  const existing = savedPersonas.length + 1;
  return `Captured ${slot === 'A' ? 'Reference' : 'Probe'} ${existing}`;
}

function saveActiveCadence() {
  const voiceState = getVoiceState(activeVoice);
  if (!voiceState.hasText) {
    setStatusMessage(`The ${SLOT_SHORT[activeVoice]} bay is empty. Paste a voice there before saving a cadence.`);
    updateControls();
    return;
  }

  const profile = voiceState.effectiveProfile;
  const persona = {
    id: `saved-${Date.now()}`,
    name: buildSavedPersonaName(activeVoice),
    blurb: `Captured from the ${SLOT_SHORT[activeVoice]} bay. Rhythm ${profile.avgSentenceLength.toFixed(1)}w, recurrence ${formatPct(profile.recurrencePressure)}.`,
    chips: [
      'captured',
      SLOT_SHORT[activeVoice],
      `rhythm ${profile.avgSentenceLength.toFixed(1)}w`
    ],
    mod: cadenceModFromProfile(profile),
    source: 'saved'
  };

  savedPersonas = [persona, ...savedPersonas];
  persistSavedPersonas();
  cadenceAssignments[activeVoice] = persona.id;
  renderPersonas();
  updateControls();
  analyzeCadences();
  setStatusMessage(`${persona.name} was saved in-app and assigned to the ${SLOT_SHORT[activeVoice]} bay.`);
}

function resetDeck() {
  $('voiceA').value = defaults.voiceA;
  $('voiceB').value = defaults.voiceB;
  badge = defaults.badge;
  mirrorLogic = defaults.mirror_logic;
  containment = defaults.containment;
  cadenceAssignments = {
    A: null,
    B: null
  };
  activeVoice = 'A';
  renderVoiceProfiles();
  renderPersonas();
  analyzeCadences();
  setStatusMessage('Deck reset. Native cadences restored and the default pair is back in the field.');
}

function handleTextInput(slot) {
  setActiveVoice(slot);
  renderVoiceProfiles();
  updateControls();
  setStatusMessage(`Text changed in the ${SLOT_SHORT[slot]} bay. Press Analyze Cadences to refresh the pair readout.`);
}

$('compareBtn').addEventListener('click', analyzeCadences);
$('swapCadencesBtn').addEventListener('click', swapCadences);
$('savePersonaBtn').addEventListener('click', saveActiveCadence);
$('toggleMirrorBtn').addEventListener('click', () => {
  mirrorLogic = mirrorLogic === 'off' ? 'on' : 'off';
  analyzeCadences();
});
$('badgeBtn').addEventListener('click', () => {
  badge = nextBadge(badge);
  analyzeCadences();
});
$('resetBtn').addEventListener('click', resetDeck);

$('voiceA').addEventListener('focus', () => setActiveVoice('A'));
$('voiceB').addEventListener('focus', () => setActiveVoice('B'));
$('voiceA').addEventListener('input', () => handleTextInput('A'));
$('voiceB').addEventListener('input', () => handleTextInput('B'));

document.addEventListener('click', (event) => {
  const persona = event.target.closest('.persona');
  if (!persona) {
    return;
  }

  assignPersonaToActiveBay(persona.dataset.id);
});

document.addEventListener('keydown', (event) => {
  const persona = event.target.closest('.persona');
  if (!persona || (event.key !== 'Enter' && event.key !== ' ')) {
    return;
  }

  event.preventDefault();
  assignPersonaToActiveBay(persona.dataset.id);
});

renderVoiceProfiles();
renderPersonas();
renderIdleState();
setStatusMessage('Press Analyze Cadences to run a solo capture or compare both bays at once.');
updateControls();
analyzeCadences();
