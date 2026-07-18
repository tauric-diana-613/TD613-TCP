import {
  CASE_PROFILES,
  compileCaseMap,
  compileRoomRules,
  compileRouteMemory
} from '../engine/ash-keep-core.js';
import {
  ASH_APEQ_PAIA_METHOD_VERSION,
  buildApeqPaiaFixture
} from './ash-apeq-paia-method-kernel.js';
import { ASH_APEQ_PAIA_PROFILE_SPECS } from './ash-apeq-paia-profile-specs.js';

export const ASH_APEQ_PAIA_PROFILE_DEMOS_VERSION = 'td613.ash.apeq-paia-profile-demos/v0.1';
export const ASH_INVESTIGATION_APEQ_PAIA_VERSION = 'td613.ash.investigation-demo/v0.2-apeq-paia';

const DB_NAME = 'td613-ash-keep';
const POINTER_KEY = 'td613.ash-keep.current-case';
const DEMO_MARKER = 'demo_profile:';
const fixtureCache = new Map();
const byId = id => document.getElementById(id);
const join = values => (values || []).join(', ');
const lines = values => (values || []).join('\n');

export const ASH_APEQ_PAIA_PROFILE_DEMOS = Object.freeze(Object.fromEntries(
  Object.entries(ASH_APEQ_PAIA_PROFILE_SPECS).map(([profile, spec]) => [profile, Object.freeze({
    label: spec.label,
    demo_id: spec.demo_id,
    method_version: ASH_APEQ_PAIA_METHOD_VERSION
  })])
));

export function buildApeqPaiaProfileFixture(profile) {
  if (fixtureCache.has(profile)) return fixtureCache.get(profile);
  const spec = ASH_APEQ_PAIA_PROFILE_SPECS[profile];
  if (!spec) throw new Error(`No APEQ/PAIA demo is registered for ${profile}.`);
  const fixture = buildApeqPaiaFixture(spec);
  fixtureCache.set(profile, fixture);
  return fixture;
}

function ensureStyles() {
  if (byId('td613-ash-apeq-paia-demo-styles')) return;
  const style = document.createElement('style');
  style.id = 'td613-ash-apeq-paia-demo-styles';
  style.textContent = `
    #startDemo.demo-unavailable{border-color:rgba(154,180,170,.12);background:#07100d;color:#5e7069;box-shadow:none;filter:saturate(.15)}
    #startDemo.demo-available{border-color:rgba(118,234,212,.68);background:#0b2a21;color:var(--paper);box-shadow:0 0 0 1px rgba(118,234,212,.08),0 14px 34px rgba(0,0,0,.22)}
    #startDemo[aria-busy="true"]{cursor:progress;opacity:.72}
    .demo-profile-status{margin:10px 0 0;padding:9px 11px;border-left:2px solid rgba(228,198,108,.6);background:rgba(228,198,108,.045);color:var(--muted);font:600 .63rem/1.55 var(--mono)}
    .demo-profile-status strong{color:var(--gold)}
    .apeq-paia-method-docket{margin:0 0 16px;padding:18px;border:1px solid rgba(228,198,108,.38);background:linear-gradient(135deg,rgba(7,26,21,.96),rgba(24,14,31,.78));line-height:1.55}
    .apeq-paia-method-docket h3{margin:0 0 8px;font:500 clamp(1.4rem,3vw,2.2rem) var(--serif)}
    .apeq-paia-method-docket h3 small{display:block;margin-top:4px;color:var(--gold);font:700 .58rem var(--mono);letter-spacing:.12em;text-transform:uppercase}
    .apeq-paia-method-docket p{margin:.55rem 0;color:var(--muted)}
    .apeq-paia-docket-metrics{display:flex;gap:6px;flex-wrap:wrap;margin:12px 0}
    .apeq-paia-docket-metrics b{padding:7px;border:1px solid var(--line);font:700 .58rem var(--mono);text-transform:uppercase}
    .apeq-paia-method-docket details{margin-top:8px;padding:9px 11px;border:1px solid rgba(118,234,212,.14);background:rgba(4,19,15,.58)}
    .apeq-paia-method-docket summary{cursor:pointer;color:var(--paper);font:700 .62rem var(--mono);letter-spacing:.08em;text-transform:uppercase}
    .apeq-paia-method-docket ul{margin:8px 0 0;padding-left:18px;color:var(--muted)}
    .apeq-paia-method-docket code{white-space:normal;color:var(--cyan)}
    .apeq-paia-ceiling{color:var(--rose)!important;font:700 .64rem var(--mono);text-transform:uppercase}
    @media(max-width:620px){.apeq-paia-method-docket{padding:14px}.apeq-paia-method-docket h3{font-size:1.35rem}}
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
  for (const [value, demo] of Object.entries(ASH_APEQ_PAIA_PROFILE_DEMOS)) {
    let option = select.querySelector(`option[value="${value}"]`);
    if (!option) {
      option = document.createElement('option');
      option.value = value;
      option.textContent = demo.label;
      select.append(option);
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
  return byId('newProfile')?.querySelector(`option[value="${value}"]`)?.textContent?.trim() || value || 'this profile';
}

function setButtonState(button, { disabled, busy = false, label, title, state }) {
  if (button.disabled !== disabled) button.disabled = disabled;
  button.setAttribute('aria-disabled', String(disabled));
  button.setAttribute('aria-busy', String(busy));
  button.classList.toggle('demo-available', !disabled);
  button.classList.toggle('demo-unavailable', disabled);
  if (button.textContent !== label) button.textContent = label;
  button.title = title;
  button.dataset.ashMethodDemoState = state;
}

function updateControls() {
  const select = ensureProfileOptions();
  const button = byId('startDemo');
  const newCase = byId('newCase');
  const status = ensureStatus();
  if (!select || !button || !newCase) return false;
  const selected = select.value;
  if (selected === 'research') return false;
  const demo = ASH_APEQ_PAIA_PROFILE_DEMOS[selected] || null;
  if (demo) {
    setButtonState(button, {
      disabled: false,
      label: `Start ${demo.label} qualification demo`,
      title: `Hydrate the synthetic ${demo.label} APEQ/PAIA method specimen.`,
      state: 'READY'
    });
  } else {
    setButtonState(button, {
      disabled: true,
      label: 'Start a demo',
      title: selected ? `No qualification demo is registered for ${profileLabel(selected)}.` : 'Select a workspace profile first.',
      state: 'HELD'
    });
  }
  newCase.disabled = !selected || !Object.hasOwn(CASE_PROFILES, selected);
  if (status) {
    if (!selected) status.innerHTML = '<strong>Select a profile first.</strong> New case and demo actions remain held until the workspace context is explicit.';
    else if (demo) status.innerHTML = `<strong>${demo.label} qualification demo available.</strong> This hydrates an APEQ/PAIA Environment Profile, Reader field, joining-key registry, controls, held-outs, route laws, Route Memory, claim ceiling, and continuity prompts.`;
    else status.innerHTML = `<strong>No ${profileLabel(selected)} qualification demo yet.</strong> A blank workspace may still open; synthetic method hydration remains held.`;
  }
  return Boolean(demo);
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
        reject(new Error('Ash Keep did not reach APEQ/PAIA profile-demo readiness.'));
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
  const defaults = fixture.defaults;
  setValue('readerClass', defaults.reader_class);
  setValue('testRefs', join(defaults.test_refs));
  setValue('linkLeft', defaults.style_samples?.left || '');
  setValue('linkRight', defaults.style_samples?.right || '');
  setValue('routeId', defaults.route.id);
  setValue('routeRecipient', defaults.route.recipient_class);
  setValue('routePurpose', defaults.route.purpose);
  setValue('routeDigest', defaults.route.digest);
  setValue('routeRefs', join(defaults.route.refs));
  setValue('draftBody', defaults.draft.body);
  setValue('draftRoute', defaults.draft.route);
  setValue('draftRecipient', defaults.draft.recipient_class);
  setValue('draftPurpose', defaults.draft.purpose);
  setValue('draftVersion', defaults.draft.version);
  setValue('draftRefs', join(defaults.draft.refs));
  setValue('providerTask', defaults.provider_task);
  setValue('protectedLiterals', join(defaults.protected_literals));
  setValue('saveQuestions', lines(defaults.save_questions));
  setValue('saveNext', lines(defaults.save_next));
  setValue('researchNotes', defaults.research_notes);
  for (const [key, value] of Object.entries(defaults.tradeoff || {})) {
    setValue(`${key}Value`, value);
    const readout = byId(`${key}Readout`);
    if (readout) readout.textContent = String(value);
  }
  document.documentElement.dataset.ashDemoProfile = fixture.profile.id;
  document.documentElement.dataset.ashDemoId = fixture.profile.demo_id;
  document.documentElement.dataset.ashMethodProfile = ASH_APEQ_PAIA_PROFILE_DEMOS_VERSION;
}

function list(items, render = value => value) {
  return `<ul>${items.map(item => `<li>${render(item)}</li>`).join('')}</ul>`;
}

function renderMethodDocket(fixture) {
  byId('researchMethodDocket')?.remove();
  const map = byId('workspace-map');
  const layout = map?.querySelector('.map-layout');
  if (!layout) return;
  let docket = byId('apeqPaiaMethodDocket');
  if (!docket) {
    docket = document.createElement('section');
    docket.id = 'apeqPaiaMethodDocket';
    docket.className = 'apeq-paia-method-docket';
    layout.before(docket);
  }
  const assay = fixture.assay;
  const environment = assay.environment_profile;
  docket.dataset.profile = fixture.profile.id;
  docket.innerHTML = `
    <h3>${fixture.profile.label} Method Docket<small>APEQ environment qualification · PAIA anisotropic projection field</small></h3>
    <p>${fixture.profile.summary}</p>
    <div class="apeq-paia-docket-metrics">${Object.entries(fixture.counts).map(([key, value]) => `<b>${key.replaceAll('_', ' ')} · ${value}</b>`).join('')}</div>
    <p><strong>Environment:</strong> ${Object.entries(environment).map(([key, value]) => `${key.replaceAll('_', ' ')}=${value}`).join(' · ')}</p>
    <p><strong>Reader classes:</strong> ${assay.reader_classes.join(' · ')}</p>
    <details><summary>Joining-key registry · ${assay.joining_keys.length}</summary>${list(assay.joining_keys, key => `<code>${key.id}</code> — ${key.joins.join(' + ')} → ${key.risk} · local_only=${key.local_only}`)}</details>
    <details><summary>Control bank · ${assay.controls.length}</summary>${list(assay.controls, control => `<code>${control.class}</code> — ${control.purpose}`)}</details>
    <details><summary>Held-out challenge · ${assay.held_outs.length}</summary>${list(assay.held_outs, held => `<code>${held.protected_dimension}</code> → ${held.reference}`)}</details>
    <details><summary>Heterostratigraphic field · ${assay.strata.length}</summary>${list(assay.strata, stratum => `<code>${stratum}</code> retained as a nonmerged measurement layer`)}</details>
    <p class="apeq-paia-ceiling">PA2 ceiling · Unknown Readers UNMEASURED · Universal secrecy false · Automatic release false · Human review required</p>
  `;
}

async function currentCaseRecord() {
  const caseId = localStorage.getItem(POINTER_KEY);
  if (!caseId) return null;
  const db = await openDb();
  const record = await new Promise((resolve, reject) => {
    const request = db.transaction('cases').objectStore('cases').get(caseId);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
  db.close();
  return record;
}

function demoProfileFromCase(caseMap) {
  const marker = (caseMap?.operator_notes || []).find(note => String(note).startsWith(DEMO_MARKER));
  return marker ? marker.slice(DEMO_MARKER.length) : null;
}

export async function rehydrateCurrentApeqPaiaDemo() {
  try {
    const caseMap = await currentCaseRecord();
    const profile = demoProfileFromCase(caseMap);
    if (!ASH_APEQ_PAIA_PROFILE_DEMOS[profile]) return null;
    const fixture = buildApeqPaiaProfileFixture(profile);
    applyDefaults(fixture);
    renderMethodDocket(fixture);
    return fixture;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function hydrateApeqPaiaProfileDemo(profile) {
  const config = ASH_APEQ_PAIA_PROFILE_DEMOS[profile];
  const button = byId('startDemo');
  const status = ensureStatus();
  if (!config || !button) return null;
  setButtonState(button, {
    disabled: true,
    busy: true,
    label: `Hydrating ${config.label} method…`,
    title: `Compiling the synthetic ${config.label} APEQ/PAIA specimen locally.`,
    state: 'BUSY'
  });
  if (status) status.textContent = `Compiling the synthetic ${config.label} Environment Profile, Case Map, joining keys, controls, held-outs, route laws, and Route Memory locally…`;
  try {
    await waitForAsh();
    const fixture = buildApeqPaiaProfileFixture(profile);
    const caseMap = await compileCaseMap({
      profile,
      title: fixture.profile.title,
      rooms: fixture.rooms,
      nodes: fixture.nodes,
      relationships: fixture.relationships,
      privateChronology: fixture.profile.chronology,
      intendedActions: fixture.profile.actions,
      sourceStatus: 'SIMULATED',
      evidenceBasis: [`synthetic ${fixture.profile.label} APEQ/PAIA qualification fixture`, 'operator-selected workspace profile'],
      observations: fixture.profile.observations,
      missingness: fixture.profile.missingness,
      alternatives: fixture.profile.alternatives,
      openQuestions: fixture.profile.open_questions,
      operatorNotes: [
        `${DEMO_MARKER}${profile}`,
        `demo_id:${fixture.profile.demo_id}`,
        `method_version:${fixture.method_version}`,
        'assurance_ceiling:PA2_LOCALLY_EXECUTED',
        `apeq_controls:${fixture.counts.controls}`,
        `apeq_held_outs:${fixture.counts.held_outs}`,
        `paia_strata:${fixture.counts.strata}`,
        `paia_joining_keys:${fixture.counts.joining_keys}`
      ]
    });
    const roomRules = await compileRoomRules({
      caseId: caseMap.case_id,
      rules: fixture.rules,
      sourceStatus: 'SIMULATED',
      evidenceBasis: [`synthetic ${fixture.profile.label} route boundaries`]
    });
    const routeMemory = await compileRouteMemory({
      caseId: caseMap.case_id,
      entries: fixture.routes.entries,
      operatorDeclaredAssumptions: fixture.routes.operator_declared_assumptions,
      unknown: fixture.routes.unknown,
      sourceStatus: 'SIMULATED',
      evidenceBasis: [`synthetic ${fixture.profile.label} route history`]
    });
    await writeDemoRecords(caseMap, roomRules, routeMemory);
    localStorage.setItem(POINTER_KEY, caseMap.case_id);
    await window.__td613AshKeep.refresh();
    applyDefaults(fixture);
    renderMethodDocket(fixture);
    window.dispatchEvent(new CustomEvent('td613:ash:profile-demo-hydrated', {
      detail: {
        profile,
        case_id: caseMap.case_id,
        case_map_digest: caseMap.case_map_digest,
        route_memory_digest: routeMemory.route_memory_digest,
        source_status: 'CONSTRUCTED',
        maximum_assurance: fixture.assay.maximum_assurance,
        unknown_readers: fixture.assay.unknown_readers,
        universal_secrecy: fixture.assay.universal_secrecy,
        ...fixture.counts
      }
    }));
    setTimeout(() => (window.__td613AshPremiumUI?.open || window.__td613OpenAshWorkspace)?.(profile === 'investigation' ? 'home' : 'map'), 0);
    if (status) status.innerHTML = `<strong>${config.label} qualification demo hydrated.</strong> The method docket remains synthetic, locally executed, human-gated, and capped at PA2.`;
    return { caseMap, roomRules, routeMemory, assay: fixture.assay, fixture };
  } catch (error) {
    console.error(error);
    if (status) status.innerHTML = `<strong>${config.label} demo held.</strong> ${error.message}`;
    return null;
  } finally {
    setTimeout(updateControls, 0);
  }
}

export function installApeqPaiaProfileDemos(doc = document, host = window) {
  if (!doc?.documentElement || !host) return false;
  ensureStyles();
  const select = ensureProfileOptions();
  const button = byId('startDemo');
  if (!select || !button) return false;
  select.addEventListener('change', () => setTimeout(updateControls, 0));
  host.addEventListener('click', event => {
    const target = event.target?.closest?.('#startDemo');
    const profile = select.value;
    if (!target || !ASH_APEQ_PAIA_PROFILE_DEMOS[profile]) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    hydrateApeqPaiaProfileDemo(profile);
  }, true);
  host.addEventListener('td613:ash:case-opened', () => setTimeout(rehydrateCurrentApeqPaiaDemo, 0));
  host.addEventListener('td613:ash:profile-demo-hydrated', event => {
    if (event.detail?.profile === 'research') byId('apeqPaiaMethodDocket')?.remove();
  });
  doc.documentElement.dataset.ashDemoProfiles = ASH_APEQ_PAIA_PROFILE_DEMOS_VERSION;
  doc.documentElement.dataset.ashApeqPaiaMethod = ASH_APEQ_PAIA_METHOD_VERSION;
  const api = Object.freeze({
    version: ASH_APEQ_PAIA_PROFILE_DEMOS_VERSION,
    method_version: ASH_APEQ_PAIA_METHOD_VERSION,
    profiles: Object.freeze(Object.keys(ASH_APEQ_PAIA_PROFILE_DEMOS)),
    build: buildApeqPaiaProfileFixture,
    hydrate: hydrateApeqPaiaProfileDemo,
    rehydrate: rehydrateCurrentApeqPaiaDemo,
    counts: Object.freeze(Object.fromEntries(Object.keys(ASH_APEQ_PAIA_PROFILE_DEMOS).map(profile => [profile, buildApeqPaiaProfileFixture(profile).counts]))),
    assurance: Object.freeze({ source_status: 'CONSTRUCTED', maximum: 'PA2_LOCALLY_EXECUTED', unknown_readers: 'UNMEASURED', universal_secrecy: false })
  });
  host.__td613AshProfileDemos = api;
  host.__td613AshApeqPaiaProfileDemos = api;
  host.__td613AshInvestigationDemo = Object.freeze({
    version: ASH_INVESTIGATION_APEQ_PAIA_VERSION,
    method_version: ASH_APEQ_PAIA_METHOD_VERSION,
    hydrate: () => hydrateApeqPaiaProfileDemo('investigation'),
    build: () => buildApeqPaiaProfileFixture('investigation'),
    counts: buildApeqPaiaProfileFixture('investigation').counts,
    assurance: api.assurance
  });
  queueMicrotask(updateControls);
  setTimeout(rehydrateCurrentApeqPaiaDemo, 0);
  return true;
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') installApeqPaiaProfileDemos();
