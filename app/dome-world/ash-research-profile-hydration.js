import {
  CASE_PROFILES,
  compileCaseMap,
  compileRoomRules,
  compileRouteMemory
} from '../engine/ash-keep-core.js';

export const ASH_RESEARCH_HYDRATION_VERSION = 'td613.ash.research-hydration/2026-07-17-v1';
export const ASH_INGRESS_MEMBRANE_VERSION = 'td613.ash.ingress-scroll/2026-07-17-v1';

const PROFILE = 'research';
const DB_NAME = 'td613-ash-keep';
const POINTER_KEY = 'td613.ash-keep.current-case';
const DEMO_MARKER = 'demo_profile:';
const FIXTURE_URL = '/dome-world/fixtures/ash-keep-demo-research.json?v=20260717-research-v1';
const PROFILE_FIXTURES = Object.freeze({
  political_campaign: '/dome-world/fixtures/ash-keep-demo-political-campaign.json?v=20260717-research-audit-v1',
  fundraiser: '/dome-world/fixtures/ash-keep-demo-fundraiser.json?v=20260717-research-audit-v1',
  research: FIXTURE_URL
});
const fixtureCache = new Map();

const byId = id => document.getElementById(id);
const join = values => (values || []).join(', ');
const lines = values => (values || []).join('\n');

function ensureIngressStyles() {
  if (byId('td613-ash-ingress-research-styles')) return;
  const style = document.createElement('style');
  style.id = 'td613-ash-ingress-research-styles';
  style.textContent = `
    .launch{
      display:flex!important;
      align-items:flex-start!important;
      justify-content:flex-start!important;
      overflow-y:auto!important;
      overflow-x:hidden!important;
      overscroll-behavior:contain;
      scrollbar-gutter:stable both-edges;
      min-block-size:100%;
      block-size:100dvh;
      padding:max(18px,env(safe-area-inset-top)) max(18px,env(safe-area-inset-right)) max(18px,env(safe-area-inset-bottom)) max(18px,env(safe-area-inset-left))!important;
    }
    .launch-panel{
      flex:0 0 auto;
      margin:auto!important;
      max-inline-size:100%;
      max-block-size:none;
      scroll-margin-block:18px;
    }
    .launch-panel:focus-within{outline:1px solid rgba(118,234,212,.24);outline-offset:4px}
    .research-hydration-audit{
      margin:0 0 14px;
      padding:14px;
      border:1px solid rgba(228,198,108,.34);
      background:linear-gradient(135deg,rgba(228,198,108,.055),rgba(118,234,212,.025));
      clip-path:polygon(10px 0,100% 0,100% calc(100% - 10px),calc(100% - 10px) 100%,0 100%,0 10px);
    }
    .research-hydration-audit h3{margin:0;font:500 1.15rem var(--serif)}
    .research-hydration-audit p{margin:6px 0 0;color:var(--muted);font-size:.74rem;line-height:1.55}
    .research-audit-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:1px;margin-top:10px;background:var(--line)}
    .research-audit-grid div{padding:9px;background:#06130f}
    .research-audit-grid span{display:block;color:var(--muted);font:600 .58rem var(--mono);text-transform:uppercase}
    .research-audit-grid b{display:block;margin-top:4px;color:var(--paper);font:500 1.05rem var(--serif)}
    .research-audit-findings{margin:10px 0 0;padding-left:18px;color:var(--muted);font-size:.71rem;line-height:1.55}
    .research-audit-findings strong{color:var(--gold)}
    @media(max-width:620px){
      .launch{padding:10px!important;scrollbar-gutter:auto}
      .launch-panel{margin:auto!important}
      .research-audit-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
    }
    @media(max-height:720px) and (min-width:621px){
      .launch-panel{padding:22px!important}
      .launch h2{margin-block:8px 6px;font-size:clamp(2rem,6vw,3.5rem)}
      .launch p{margin-block:6px}
    }
  `;
  document.head.append(style);
  document.documentElement.dataset.ashIngressMembrane = ASH_INGRESS_MEMBRANE_VERSION;
}

function statusElement() {
  let status = byId('demoProfileStatus');
  if (status) return status;
  const actions = byId('startDemo')?.closest('.actions');
  if (!actions) return null;
  status = document.createElement('p');
  status.id = 'demoProfileStatus';
  status.className = 'demo-profile-status';
  status.setAttribute('aria-live', 'polite');
  actions.insertAdjacentElement('afterend', status);
  return status;
}

function selectedProfile() {
  return byId('newProfile')?.value || '';
}

function syncResearchControls() {
  const select = byId('newProfile');
  const button = byId('startDemo');
  const newCase = byId('newCase');
  if (!select || !button) return;
  if (select.value !== PROFILE) return;
  button.disabled = false;
  button.classList.add('demo-available');
  button.classList.remove('demo-unavailable');
  button.textContent = 'Start Research qualification demo';
  button.title = 'Hydrate the synthetic Research workspace with preregistration, controls, contradictions, route memory, and qualification limits.';
  button.setAttribute('aria-disabled', 'false');
  if (newCase) newCase.disabled = !Object.hasOwn(CASE_PROFILES, PROFILE);
  const status = statusElement();
  if (status) status.innerHTML = '<strong>Research qualification demo available.</strong> Hydrates a synthetic preregistered study with provenance, calibration controls, held-outs, contradictory Readers, ethics, route memory, and an explicit PA2 ceiling.';
}

function scheduleResearchControlSync() {
  queueMicrotask(syncResearchControls);
  requestAnimationFrame(syncResearchControls);
}

async function loadFixture(profile = PROFILE) {
  if (fixtureCache.has(profile)) return fixtureCache.get(profile);
  const url = PROFILE_FIXTURES[profile];
  if (!url) throw new Error(`No audited fixture is registered for ${profile}.`);
  const response = await fetch(url, { cache: 'no-store', credentials: 'same-origin' });
  if (!response.ok) throw new Error(`The ${profile} hydration fixture did not load.`);
  const fixture = await response.json();
  fixtureCache.set(profile, fixture);
  return fixture;
}

function validateResearchFixture(fixture) {
  if (fixture?.schema !== 'td613.ash.keep-demo/v0.2') throw new Error('Unsupported Research demo schema.');
  if (fixture.profile !== PROFILE) throw new Error('Research fixture/profile mismatch.');
  const rooms = fixture.case?.rooms || [];
  const nodes = fixture.case?.nodes || [];
  const relations = fixture.case?.relationships || [];
  const routes = fixture.route_memory?.entries || [];
  if (rooms.length < 10 || nodes.length < 40 || relations.length < 40 || routes.length < 4) {
    throw new Error('Research demo remains below the qualification-hydration floor.');
  }
  const roomIds = new Set(rooms.map(room => room.id));
  const nodeIds = new Set(nodes.map(node => node.id));
  for (const node of nodes) if (!roomIds.has(node.room_id)) throw new Error(`Research node ${node.id} references an unknown Room.`);
  for (const edge of relations) if (!nodeIds.has(edge.from) || !nodeIds.has(edge.to)) throw new Error(`Research relation ${edge.id} references an unknown object.`);
  const requiredRooms = ['room_question','room_sources','room_methods','room_observations','room_controls','room_alternatives','room_ethics','room_routes'];
  for (const room of requiredRooms) if (!roomIds.has(room)) throw new Error(`Research qualification Room missing: ${room}.`);
  const sourceStates = new Set(nodes.map(node => node.source_status));
  for (const state of ['OBSERVED','CONSTRUCTED','DERIVED','UNRESOLVED']) {
    if (!sourceStates.has(state)) throw new Error(`Research fixture does not preserve ${state} evidence.`);
  }
  if (!fixture.missingness?.length || !fixture.alternatives?.length || !fixture.open_questions?.length) {
    throw new Error('Research fixture flattened missingness, alternatives, or open questions.');
  }
  return fixture;
}

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function writeDemoRecords(caseMap, roomRules, routeMemory) {
  const db = await openDb();
  await new Promise((resolve, reject) => {
    const transaction = db.transaction(['cases', 'roomRules', 'routeMemory'], 'readwrite');
    transaction.objectStore('cases').put(caseMap);
    transaction.objectStore('roomRules').put({ id: caseMap.case_id, value: roomRules });
    transaction.objectStore('routeMemory').put({ id: caseMap.case_id, value: routeMemory });
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
  db.close();
}

async function waitForAsh() {
  if (window.__td613AshKeep?.refresh) return;
  await new Promise((resolve, reject) => {
    const started = performance.now();
    const timer = setInterval(() => {
      if (window.__td613AshKeep?.refresh) {
        clearInterval(timer);
        resolve();
      } else if (performance.now() - started > 30000) {
        clearInterval(timer);
        reject(new Error('Ash Keep did not reach Research hydration readiness.'));
      }
    }, 50);
  });
}

function setValue(id, value) {
  const element = byId(id);
  if (!element || value == null) return;
  element.value = String(value);
  element.dispatchEvent(new Event('input', { bubbles: true }));
  element.dispatchEvent(new Event('change', { bubbles: true }));
}

function applyDefaults(fixture) {
  const defaults = fixture.defaults || {};
  setValue('readerClass', defaults.reader_class || 'deterministic-baseline');
  setValue('testRefs', join(defaults.test_refs));
  setValue('linkLeft', fixture.style_samples?.left || '');
  setValue('linkRight', fixture.style_samples?.right || '');
  setValue('routeId', defaults.route?.id || '');
  setValue('routeRecipient', defaults.route?.recipient_class || '');
  setValue('routePurpose', defaults.route?.purpose || '');
  setValue('routeDigest', defaults.route?.digest || '');
  setValue('routeRefs', join(defaults.route?.refs));
  setValue('draftBody', defaults.draft?.body || fixture.held_draft || '');
  setValue('draftRoute', defaults.draft?.route || '');
  setValue('draftRecipient', defaults.draft?.recipient_class || '');
  setValue('draftPurpose', defaults.draft?.purpose || '');
  setValue('draftVersion', defaults.draft?.version || '1');
  setValue('draftRefs', join(defaults.draft?.refs));
  setValue('providerTask', defaults.provider_task || '');
  setValue('protectedLiterals', join(defaults.protected_literals));
  setValue('saveQuestions', lines(defaults.save_questions));
  setValue('saveNext', lines(defaults.save_next));
  setValue('researchNotes', defaults.research_notes || '');
  for (const [key, value] of Object.entries(defaults.tradeoff || {})) {
    setValue(`${key}Value`, value);
    const readout = byId(`${key}Readout`);
    if (readout) readout.textContent = String(value);
  }
  document.documentElement.dataset.ashDemoProfile = fixture.profile;
  document.documentElement.dataset.ashDemoId = fixture.demo_id;
  document.documentElement.dataset.ashResearchHydration = ASH_RESEARCH_HYDRATION_VERSION;
}

function auditFixture(fixture) {
  const nodes = fixture.case?.nodes || [];
  const relations = fixture.case?.relationships || [];
  const states = [...new Set(nodes.map(node => node.source_status))];
  const nodeTypes = [...new Set(nodes.map(node => node.type))];
  const findings = [];
  if ((fixture.case?.rooms || []).length < 10) findings.push('Room ecology remains baseline rather than qualification-grade.');
  if (nodes.length < 40) findings.push('Object density remains below the Research qualification floor.');
  if (!states.includes('UNRESOLVED')) findings.push('Unresolved evidence is underrepresented.');
  if (!fixture.missingness?.length) findings.push('Missingness lacks an explicit fixture lane.');
  if (!fixture.alternatives?.length) findings.push('Alternative models lack an explicit fixture lane.');
  if (!nodeTypes.includes('evidence-gap')) findings.push('Evidence gaps are not represented as first-class objects.');
  if ((fixture.route_memory?.entries || []).length < 4) findings.push('Route Memory remains a small demonstration sample.');
  return Object.freeze({
    profile: fixture.profile,
    hydration_class: fixture.hydration_class || 'BASELINE_HYDRATION',
    rooms: fixture.case?.rooms?.length || 0,
    objects: nodes.length,
    relations: relations.length,
    routes: fixture.route_memory?.entries?.length || 0,
    source_states: states.length,
    missingness: fixture.missingness?.length || 0,
    alternatives: fixture.alternatives?.length || 0,
    findings
  });
}

function renderAudit(fixture) {
  const map = byId('workspace-map');
  if (!map) return null;
  let panel = byId('researchHydrationAudit');
  if (!panel) {
    panel = document.createElement('section');
    panel.id = 'researchHydrationAudit';
    panel.className = 'research-hydration-audit';
    panel.setAttribute('aria-live', 'polite');
    map.querySelector('.workspace-head')?.insertAdjacentElement('afterend', panel);
  }
  const audit = auditFixture(fixture);
  const findingItems = audit.findings.length
    ? audit.findings.map(item => `<li>${item}</li>`).join('')
    : '<li><strong>Qualification hydration floor met.</strong> This remains synthetic PA2 evidence, not external validity.</li>';
  panel.innerHTML = `
    <h3>${fixture.profile_label || fixture.profile} · Hydration audit</h3>
    <p>${audit.hydration_class}. Counts describe the synthetic workspace; they do not establish empirical sufficiency, endpoint integrity, or PA3–PA5 assurance.</p>
    <div class="research-audit-grid">
      <div><span>Rooms</span><b>${audit.rooms}</b></div>
      <div><span>Objects</span><b>${audit.objects}</b></div>
      <div><span>Relations</span><b>${audit.relations}</b></div>
      <div><span>Routes</span><b>${audit.routes}</b></div>
      <div><span>Source states</span><b>${audit.source_states}</b></div>
      <div><span>Missingness</span><b>${audit.missingness}</b></div>
      <div><span>Alternatives</span><b>${audit.alternatives}</b></div>
      <div><span>Ceiling</span><b>PA2</b></div>
    </div>
    <ul class="research-audit-findings">${findingItems}</ul>`;
  panel.dataset.profile = fixture.profile;
  panel.dataset.hydrationClass = audit.hydration_class;
  window.dispatchEvent(new CustomEvent('td613:ash:hydration-audit-rendered', { detail: audit }));
  return audit;
}

async function auditHydratedProfile(profile) {
  try {
    const fixture = await loadFixture(profile);
    renderAudit(fixture);
  } catch (error) {
    console.error(error);
  }
}

async function hydrateResearch() {
  const button = byId('startDemo');
  const status = statusElement();
  if (!button) return;
  button.disabled = true;
  button.setAttribute('aria-busy', 'true');
  button.textContent = 'Hydrating Research qualification…';
  if (status) status.textContent = 'Compiling the synthetic preregistration, source lineage, controls, contradictions, route memory, and human closure posture locally…';
  try {
    await waitForAsh();
    const fixture = validateResearchFixture(await loadFixture(PROFILE));
    const caseMap = await compileCaseMap({
      profile: fixture.profile,
      title: fixture.title,
      rooms: fixture.case.rooms,
      nodes: fixture.case.nodes,
      relationships: fixture.case.relationships,
      privateChronology: fixture.case.privateChronology,
      intendedActions: fixture.case.intendedActions,
      sourceStatus: fixture.source_status || 'SIMULATED',
      evidenceBasis: ['synthetic Research qualification fixture', 'operator-selected Research workspace'],
      observations: fixture.observations || [],
      missingness: fixture.missingness || [],
      alternatives: fixture.alternatives || [],
      openQuestions: fixture.open_questions || [],
      operatorNotes: [
        `${DEMO_MARKER}${fixture.profile}`,
        `demo_id:${fixture.demo_id}`,
        `hydration_class:${fixture.hydration_class}`,
        `assurance_ceiling:${fixture.minimum_assurance_ceiling}`,
        ...((fixture.stress_targets || []).map(value => `stress_target:${value}`))
      ]
    });
    const roomRules = await compileRoomRules({
      caseId: caseMap.case_id,
      rules: fixture.room_rules,
      sourceStatus: 'SIMULATED',
      evidenceBasis: ['synthetic Research route boundaries']
    });
    const routeMemory = await compileRouteMemory({
      caseId: caseMap.case_id,
      entries: fixture.route_memory.entries,
      operatorDeclaredAssumptions: fixture.route_memory.operator_declared_assumptions,
      unknown: fixture.route_memory.unknown,
      sourceStatus: 'SIMULATED',
      evidenceBasis: ['synthetic Research route history']
    });
    await writeDemoRecords(caseMap, roomRules, routeMemory);
    localStorage.setItem(POINTER_KEY, caseMap.case_id);
    await window.__td613AshKeep.refresh();
    applyDefaults(fixture);
    renderAudit(fixture);
    window.__td613OpenAshWorkspace?.('map');
    window.dispatchEvent(new CustomEvent('td613:ash:profile-demo-hydrated', { detail: {
      case_id: caseMap.case_id,
      case_map_digest: caseMap.case_map_digest,
      route_memory_digest: routeMemory.route_memory_digest,
      profile: fixture.profile,
      demo_id: fixture.demo_id,
      hydration_class: fixture.hydration_class,
      assurance_ceiling: fixture.minimum_assurance_ceiling,
      room_count: caseMap.rooms.length,
      node_count: caseMap.nodes.length,
      relationship_count: caseMap.relationships.length,
      route_count: routeMemory.entries.length
    } }));
    if (status) status.innerHTML = `<strong>Research qualification hydrated.</strong> ${caseMap.rooms.length} Rooms, ${caseMap.nodes.length} objects, ${caseMap.relationships.length} relations, and ${routeMemory.entries.length} remembered routes are local. Constructed evidence remains capped at PA2.`;
  } catch (error) {
    if (status) status.innerHTML = `<strong>Research demo held.</strong> ${error.message}`;
    console.error(error);
  } finally {
    button.removeAttribute('aria-busy');
    scheduleResearchControlSync();
  }
}

function installResearchHydration() {
  ensureIngressStyles();
  const select = byId('newProfile');
  const button = byId('startDemo');
  if (!select || !button) return false;

  document.addEventListener('click', event => {
    const target = event.target?.closest?.('#startDemo');
    if (!target || selectedProfile() !== PROFILE) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    hydrateResearch();
  }, true);

  select.addEventListener('change', scheduleResearchControlSync);

  window.addEventListener('td613:ash:profile-demo-hydrated', event => {
    const profile = event.detail?.profile;
    if (PROFILE_FIXTURES[profile]) auditHydratedProfile(profile);
  });

  for (const type of ['case-opened','case-created','capsule-opened']) {
    window.addEventListener(`td613:ash:${type}`, () => {
      if (document.documentElement.dataset.ashDemoProfile === PROFILE) auditHydratedProfile(PROFILE);
    });
  }

  if (selectedProfile() === PROFILE) scheduleResearchControlSync();
  document.documentElement.dataset.ashResearchHydration = ASH_RESEARCH_HYDRATION_VERSION;
  window.__td613AshResearchHydration = Object.freeze({
    version: ASH_RESEARCH_HYDRATION_VERSION,
    ingress_version: ASH_INGRESS_MEMBRANE_VERSION,
    hydrate: hydrateResearch,
    audit: auditHydratedProfile
  });
  return true;
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', installResearchHydration, { once: true });
  else installResearchHydration();
}
