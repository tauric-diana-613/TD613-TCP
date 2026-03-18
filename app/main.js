import defaults from './data/defaults.json' with { type: 'json' };
import personas from './data/personas.json' with { type: 'json' };
import microcopy from '../copy/microcopy.json' with { type: 'json' };
import { solveQuadratic, fieldPotential, waveStats, custodyThreshold, routePressure as computeRoutePressure, providerDecision } from './engine/formulas.js';
import { compareTexts, transformText } from './engine/stylometry.js';
import { chooseHarbor, buildLedgerRow, HARBOR_LIBRARY } from './engine/harbor.js';
import { nextBadge, badgeMeaning } from './engine/badges.js';
const $ = id => document.getElementById(id);
let badge = defaults.badge; let mirrorLogic = defaults.mirror_logic; let containment = defaults.containment; let selectedPersona = null;
$('heroLead').textContent = microcopy.hero_lead; $('voiceA').value = defaults.voiceA; $('voiceB').value = defaults.voiceB;
function renderPersonas() {
  $('personaDeck').innerHTML = personas.map(p => `<div class="persona ${selectedPersona===p.id ? 'selected':''}" data-id="${p.id}"><div class="name">${p.name}</div><div class="blurb">${p.blurb}</div><div class="chips">${p.chips.map(c=>`<span class="chip">${c}</span>`).join('')}</div></div>`).join('');
}
function updateStatePills(routeStatus, warning=false) {
  $('badgeState').textContent = `${badge} · ${badgeMeaning(badge)}`;
  $('mirrorState').textContent = `mirror.${mirrorLogic}`;
  $('containmentState').textContent = `containment.${containment}`;
  $('routeState').textContent = routeStatus;
  $('routeState').classList.toggle('warn', warning);
}
function compare() {
  const a = $('voiceA').value; const b = $('voiceB').value;
  const cmp = compareTexts(a,b);
  const branch = solveQuadratic(1,-2,-3); const branchFlag = branch.unwanted.length ? 1 : 0;
  const routePressure = computeRoutePressure(cmp.similarity, cmp.traceability, branchFlag, cmp.recurrencePressure);
  const V = fieldPotential({ routePressure, mirrorLogic, containment });
  const wave = waveStats({ traceability: cmp.traceability, recurrencePressure: cmp.recurrencePressure, fieldPotential: V });
  const custody = custodyThreshold(0.68, routePressure * 0.58, 0.2);
  const harbor = chooseHarbor({ routePressure, badge, mirrorLogic });
  const decision = providerDecision({ recognized: cmp.similarity >= 0.5, explained: routePressure < 0.45, routeAvailable: harbor === 'mirror.off' || harbor === 'receipt.capture', density: wave.density, recurrencePressure: cmp.recurrencePressure });
  const ledger = buildLedgerRow({ eventId: `evt-${Date.now()}`, harborFunction: harbor, routePressure, traceability: cmp.traceability, custodyArchive: custody.archive });
  $('similarity').textContent = cmp.similarity.toFixed(2); $('traceability').textContent = cmp.traceability.toFixed(2); $('routePressure').textContent = routePressure.toFixed(2); $('custodyState').textContent = custody.archive === 'witness' ? 'A_W' : 'A_I';
  $('simHint').textContent = cmp.similarity > 0.78 ? microcopy.compare_hint : 'Similarity is present but not decisive.';
  $('traceHint').textContent = cmp.traceability > 0.7 ? 'Stylometric habits are carrying pressure.' : 'Traceability remains light.';
  $('routeHint').textContent = decision === 'criticality' ? microcopy.route_warning : (decision === 'passage' ? microcopy.harbor_success : 'Preserve the branch until routing catches up.');
  $('custodyHint').textContent = custody.archive === 'witness' ? 'Custodial drift has crossed threshold; witness layer is active.' : 'Institutional custody remains above threshold.';
  $('branchFormula').textContent = `t² - 2t - 3 = 0
roots = ${branch.roots.join(', ')}
classification = ${branch.classification}`;
  $('waveFormula').textContent = `[-ℏ²/(2m)·∂² + V]
V=${wave.V}
ψ(x)=A sin(kx)
A=${wave.amplitude}
k=${wave.k}
|Ψ|²≈${wave.density}
R=${cmp.recurrencePressure}`;
  $('harborFormula').textContent = `A_effective=${custody.archive === 'witness' ? 'A_W' : 'A_I'}
C-D=${custody.delta}
θ=${custody.theta}
harbor=${harbor}`;
  $('harborBox').innerHTML = `<div class="small">Recommended harbor</div><div style="font-size:28px;font-weight:900;margin:6px 0">${harbor}</div><div class="kicker">${HARBOR_LIBRARY[harbor].mode_class}. ${microcopy.receipt_created}</div>`;
  $('ledgerPreview').textContent = JSON.stringify(ledger, null, 2);
  updateStatePills(ledger.route_status, decision === 'criticality');
}
$('compareBtn').addEventListener('click', compare);
$('toggleMirrorBtn').addEventListener('click', () => { mirrorLogic = mirrorLogic === 'off' ? 'on' : 'off'; compare(); });
$('badgeBtn').addEventListener('click', () => { badge = nextBadge(badge); compare(); });
$('resetBtn').addEventListener('click', () => { $('voiceA').value = defaults.voiceA; $('voiceB').value = defaults.voiceB; badge = defaults.badge; mirrorLogic = defaults.mirror_logic; containment = defaults.containment; selectedPersona = null; renderPersonas(); compare(); });
renderPersonas();
document.addEventListener('click', (e) => { const el = e.target.closest('.persona'); if (!el) return; selectedPersona = el.dataset.id; const persona = personas.find(p => p.id === el.dataset.id); $('voiceB').value = transformText($('voiceB').value, persona.mod); renderPersonas(); compare(); });
compare();
