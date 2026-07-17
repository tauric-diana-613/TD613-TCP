import {
  CASE_PROFILES,
  compileCaseMap,
  compileRoomRules,
  compileRouteMemory
} from '../engine/ash-keep-core.js';

export const ASH_PROFILE_DEMO_VERSION = 'td613.ash.profile-demos/v0.2-campaign-fundraiser';

const DB_NAME = 'td613-ash-keep';
const POINTER_KEY = 'td613.ash-keep.current-case';
const DEMO_MARKER = 'demo_profile:';
const fixtureCache = new Map();

export const ASH_PROFILE_DEMOS = Object.freeze({
  political_campaign: Object.freeze({
    label: 'Political Campaign',
    fixture: '/dome-world/fixtures/ash-keep-demo-political-campaign.json'
  }),
  fundraiser: Object.freeze({
    label: 'Fundraiser',
    fixture: '/dome-world/fixtures/ash-keep-demo-fundraiser.json'
  })
});

const byId = id => document.getElementById(id);
const join = values => (values || []).join(', ');
const lines = values => (values || []).join('\n');

function ensureStyles() {
  if (byId('td613-ash-profile-demo-styles')) return;
  const style = document.createElement('style');
  style.id = 'td613-ash-profile-demo-styles';
  style.textContent = `
    #startDemo.demo-unavailable{border-color:rgba(154,180,170,.12);background:#07100d;color:#5e7069;box-shadow:none;filter:saturate(.15)}
    #startDemo.demo-available{border-color:rgba(118,234,212,.68);background:#0b2a21;color:var(--paper);box-shadow:0 0 0 1px rgba(118,234,212,.08),0 14px 34px rgba(0,0,0,.22)}
    #startDemo[aria-busy="true"]{cursor:progress;opacity:.72}
    .demo-profile-status{margin:10px 0 0;padding:9px 11px;border-left:2px solid rgba(228,198,108,.6);background:rgba(228,198,108,.045);color:var(--muted);font:600 .63rem/1.55 var(--mono)}
    .demo-profile-status strong{color:var(--gold)}
  `;
  document.head.append(style);
}

function ensureProfileOptions() {
  const select = byId('newProfile');
  if (!select) return null;
  if (!select.querySelector('option[value=""]')) {
    const blank = document.createElement('option');
    blank.value = '';
    blank.textContent = 'Select a profile…';
    select.prepend(blank);
  }
  for (const [value, demo] of Object.entries(ASH_PROFILE_DEMOS)) {
    let option = select.querySelector(`option[value="${value}"]`);
    if (!option) {
      option = document.createElement('option');
      option.value = value;
      option.textContent = demo.label;
      const investigation = select.querySelector('option[value="investigation"]');
      if (investigation) select.insertBefore(option, investigation);
      else select.append(option);
    }
  }
  if (!localStorage.getItem(POINTER_KEY) && !select.dataset.ashProfileInitialized) {
    select.value = '';
    select.dataset.ashProfileInitialized = 'true';
  }
  return select;
}

function ensureStatus() {
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

function profileLabel(value) {
  const option = byId('newProfile')?.querySelector(`option[value="${value}"]`);
  return option?.textContent?.trim() || value || 'this profile';
}

function updateControls() {
  const select = ensureProfileOptions();
  const demoButton = byId('startDemo');
  const newCase = byId('newCase');
  const status = ensureStatus();
  if (!select || !demoButton || !newCase) return;
  const selected = select.value;
  const demo = ASH_PROFILE_DEMOS[selected] || null;
  demoButton.disabled = !demo;
  demoButton.classList.toggle('demo-available', Boolean(demo));
  demoButton.classList.toggle('demo-unavailable', !demo);
  demoButton.textContent = demo ? `Start ${demo.label} demo` : 'Start a demo';
  demoButton.title = demo ? `Hydrate the synthetic ${demo.label} workspace.` : 'No demo is available for the selected profile yet.';
  demoButton.setAttribute('aria-disabled', String(!demo));
  newCase.disabled = !selected || !Object.hasOwn(CASE_PROFILES, selected);
  if (!status) return;
  if (!selected) {
    status.innerHTML = '<strong>Select a profile first.</strong> New case and demo actions remain held until the workspace context is explicit.';
  } else if (demo) {
    status.innerHTML = `<strong>${demo.label} demo available.</strong> This loads synthetic, profile-specific Rooms, relations, Route Memory, draft posture, and continuity prompts.`;
  } else {
    status.innerHTML = `<strong>No ${profileLabel(selected)} demo yet.</strong> You may still open a blank ${profileLabel(selected)} workspace; the demo control remains deliberately inert.`;
  }
}

async function loadFixture(profile) {
  if (fixtureCache.has(profile)) return fixtureCache.get(profile);
  const config = ASH_PROFILE_DEMOS[profile];
  if (!config) throw new Error('No demo is registered for this workspace profile.');
  const response = await fetch(config.fixture, { cache: 'no-store' });
  if (!response.ok) throw new Error(`${config.label} demo fixture did not load.`);
  const fixture = await response.json();
  validateFixture(fixture, profile);
  fixtureCache.set(profile, fixture);
  return fixture;
}

function validateFixture(fixture, profile) {
  if (fixture?.schema !== 'td613.ash.keep-demo/v0.2') throw new Error('Unsupported Ash profile demo schema.');
  if (fixture.profile !== profile) throw new Error('Demo profile and selected workspace profile do not match.');
  if (!fixture.case?.rooms?.length || !fixture.case?.nodes?.length || !fixture.case?.relationships?.length) {
    throw new Error('Demo fixture is missing its Case Map structure.');
  }
  if (!fixture.room_rules?.length || !fixture.route_memory?.entries?.length) {
    throw new Error('Demo fixture is missing Room Rules or Route Memory.');
  }
  const nodeIds = new Set(fixture.case.nodes.map(node => node.id));
  const roomIds = new Set(fixture.case.rooms.map(room => room.id));
  for (const node of fixture.case.nodes) if (!roomIds.has(node.room_id)) throw new Error(`Demo node ${node.id} references an unknown Room.`);
  for (const edge of fixture.case.relationships) {
    if (!nodeIds.has(edge.from) || !nodeIds.has(edge.to)) throw new Error(`Demo relation ${edge.id} references an unknown object.`);
  }
  for (const entry of fixture.route_memory.entries) {
    for (const reference of entry.disclosed_opaque_references || []) if (!nodeIds.has(reference)) throw new Error(`Demo route ${entry.entry_id} references an unknown object.`);
  }
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
        reject(new Error('Ash Keep did not reach profile-demo readiness.'));
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
}

async function currentCaseRecord() {
  const caseId = localStorage.getItem(POINTER_KEY);
  if (!caseId) return null;
  const db = await openDb();
  const value = await new Promise((resolve, reject) => {
    const request = db.transaction('cases').objectStore('cases').get(caseId);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
  db.close();
  return value;
}

function demoProfileFromCase(caseMap) {
  const marker = (caseMap?.operator_notes || []).find(note => String(note).startsWith(DEMO_MARKER));
  return marker ? marker.slice(DEMO_MARKER.length) : null;
}

async function rehydrateCurrentDemo() {
  try {
    const caseMap = await currentCaseRecord();
    const profile = demoProfileFromCase(caseMap);
    if (!profile || !ASH_PROFILE_DEMOS[profile]) return;
    applyDefaults(await loadFixture(profile));
  } catch (error) {
    console.error(error);
  }
}

async function hydrateDemo(profile) {
  const config = ASH_PROFILE_DEMOS[profile];
  const button = byId('startDemo');
  const status = ensureStatus();
  if (!config || !button) return;
  button.disabled = true;
  button.setAttribute('aria-busy', 'true');
  button.textContent = `Hydrating ${config.label}…`;
  if (status) status.textContent = `Compiling the synthetic ${config.label} Case Map, Room Rules, and Route Memory locally…`;
  try {
    await waitForAsh();
    const fixture = await loadFixture(profile);
    const caseMap = await compileCaseMap({
      profile: fixture.profile,
      title: fixture.title,
      rooms: fixture.case.rooms,
      nodes: fixture.case.nodes,
      relationships: fixture.case.relationships,
      privateChronology: fixture.case.privateChronology,
      intendedActions: fixture.case.intendedActions,
      sourceStatus: fixture.source_status || 'SIMULATED',
      evidenceBasis: [`synthetic ${fixture.profile_label} demo fixture`, 'operator-selected workspace profile'],
      observations: fixture.observations || [],
      missingness: fixture.missingness || [],
      alternatives: fixture.alternatives || [],
      openQuestions: fixture.open_questions || [],
      operatorNotes: [
        `${DEMO_MARKER}${fixture.profile}`,
        `demo_id:${fixture.demo_id}`,
        ...((fixture.stress_targets || []).map(value => `stress_target:${value}`))
      ]
    });
    const roomRules = await compileRoomRules({
      caseId: caseMap.case_id,
      rules: fixture.room_rules,
      sourceStatus: 'SIMULATED',
      evidenceBasis: [`synthetic ${fixture.profile_label} route boundaries`]
    });
    const routeMemory = await compileRouteMemory({
      caseId: caseMap.case_id,
      entries: fixture.route_memory.entries,
      operatorDeclaredAssumptions: fixture.route_memory.operator_declared_assumptions,
      unknown: fixture.route_memory.unknown,
      sourceStatus: 'SIMULATED',
      evidenceBasis: [`synthetic ${fixture.profile_label} route history`]
    });
    await writeDemoRecords(caseMap, roomRules, routeMemory);
    localStorage.setItem(POINTER_KEY, caseMap.case_id);
    await window.__td613AshKeep.refresh();
    applyDefaults(fixture);
    window.__td613OpenAshWorkspace?.('map');
    window.dispatchEvent(new CustomEvent('td613:ash:profile-demo-hydrated', { detail: {
      case_id: caseMap.case_id,
      case_map_digest: caseMap.case_map_digest,
      route_memory_digest: routeMemory.route_memory_digest,
      profile: fixture.profile,
      demo_id: fixture.demo_id,
      room_count: caseMap.rooms.length,
      node_count: caseMap.nodes.length,
      relationship_count: caseMap.relationships.length,
      route_count: routeMemory.entries.length
    } }));
    if (status) status.innerHTML = `<strong>${config.label} hydrated.</strong> ${caseMap.rooms.length} Rooms, ${caseMap.nodes.length} objects, ${caseMap.relationships.length} relations, and ${routeMemory.entries.length} remembered routes are now local.`;
  } catch (error) {
    if (status) status.innerHTML = `<strong>${config.label} demo held.</strong> ${error.message}`;
    console.error(error);
  } finally {
    button.removeAttribute('aria-busy');
    updateControls();
  }
}

function install() {
  ensureStyles();
  const select = ensureProfileOptions();
  const startDemo = byId('startDemo');
  if (!select || !startDemo) return false;
  ensureStatus();
  updateControls();
  select.addEventListener('change', updateControls);
  document.addEventListener('click', event => {
    const target = event.target?.closest?.('#startDemo');
    if (!target) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const profile = select.value;
    if (ASH_PROFILE_DEMOS[profile]) hydrateDemo(profile);
  }, true);
  for (const type of ['case-opened', 'case-created', 'capsule-opened']) {
    window.addEventListener(`td613:ash:${type}`, rehydrateCurrentDemo);
  }
  document.documentElement.dataset.ashDemoProfiles = ASH_PROFILE_DEMO_VERSION;
  window.__td613AshProfileDemos = Object.freeze({
    version: ASH_PROFILE_DEMO_VERSION,
    profiles: Object.freeze(Object.keys(ASH_PROFILE_DEMOS)),
    hydrate: profile => hydrateDemo(profile),
    current: () => document.documentElement.dataset.ashDemoProfile || null
  });
  waitForAsh().then(rehydrateCurrentDemo).catch(error => console.error(error));
  return true;
}

install();
