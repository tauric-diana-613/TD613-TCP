import {
  CASE_PROFILES,
  EXPOSURE_DIMENSIONS,
  compileCaseMap,
  compileLinkCheck,
  compileReaderProfile,
  compileRebuildTest,
  compileRoomRules,
  compileRouteMemory,
  compileUnexpectedDetail,
  replayRebuildTest,
  verifyCaseMap,
  verifyRouteMemory
} from '../engine/ash-keep-core.js';
import {
  compileAshDraft,
  compileDraftReview,
  compileReleaseReceipt
} from '../engine/ash-keep-drafts.js';
import {
  compileSavePoint,
  decryptAshCapsule,
  encryptAshCapsule,
  verifySavePoint
} from '../engine/ash-keep-continuity.js';
import { compileProviderPacket, screenProviderDraft } from '../engine/ash-keep-provider.js';

const DB_NAME = 'td613-ash-keep';
const DB_VERSION = 2;
const POINTER_KEY = 'td613.ash-keep.current-case';
const PREFS_KEY = 'td613.ash-keep.preferences';
const STORES = [
  'cases', 'roomRules', 'routeMemory', 'tests', 'drafts', 'reviews', 'releases', 'savePoints', 'unexpectedDetails', 'notes',
  'authorityContexts', 'authorityBindings', 'invalidations', 'caseStates', 'operations', 'deletionPlans', 'deletionReceipts',
  'compatibilityAudits', 'lifecycle', 'savedCases', 'custodyReceipts', 'tombstones'
];
const $ = id => document.getElementById(id);
const qsa = (selector, root = document) => [...root.querySelectorAll(selector)];
const split = value => [...new Set(String(value || '').split(',').map(item => item.trim()).filter(Boolean))];
const safeJson = value => JSON.stringify(value, null, 2);
const glyphs = ['米', '上', '下', 'hõt', 'cōl', 'à', '出', '≈', '𝄐', '☆', '⟐', '𝌋‌'];

const state = {
  db: null,
  caseMap: null,
  roomRules: null,
  routeMemory: null,
  reader: null,
  latestTest: null,
  latestDraft: null,
  latestReview: null,
  latestRelease: null,
  latestProviderReceipt: null,
  latestProviderScreen: null,
  latestProviderPacket: null,
  localFileMetadata: null,
  savePoints: [],
  selectedNodeId: null,
  workspace: 'map',
  mapMode: 'everything',
  demo: false,
  worker: null,
  workerTasks: new Map(),
  view: { x: 0, y: 0, scale: 1 },
  pointers: new Map(),
  drag: null,
  pinchDistance: 0,
  layout: null,
  mapVisible: true,
  reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
  frame: 0,
  canvasSize: { width: 0, height: 0, dpr: 0 }
};

function announce(type, detail = {}) {
  window.dispatchEvent(new CustomEvent(`td613:ash:${type}`, { detail: {
    case_id: state.caseMap?.case_id || null,
    case_map_digest: state.caseMap?.case_map_digest || null,
    route_memory_digest: state.routeMemory?.route_memory_digest || null,
    ...detail
  } }));
}

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      for (const store of STORES) if (!db.objectStoreNames.contains(store)) db.createObjectStore(store, { keyPath: store === 'cases' ? 'case_id' : 'id' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function tx(store, mode = 'readonly') {
  return state.db.transaction(store, mode).objectStore(store);
}

function put(store, value, id = null) {
  const record = store === 'cases' ? value : { id: id || value.id || `${value.case_id || 'global'}:${Date.now()}`, value };
  return new Promise((resolve, reject) => {
    const request = tx(store, 'readwrite').put(record);
    request.onsuccess = () => resolve(record);
    request.onerror = () => reject(request.error);
  });
}

function get(store, id) {
  return new Promise((resolve, reject) => {
    const request = tx(store).get(id);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

function all(store) {
  return new Promise((resolve, reject) => {
    const request = tx(store).getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

function caseInput(record, patch = {}) {
  return {
    profile: record.profile,
    caseId: record.case_id,
    title: record.title,
    createdAt: record.created_at,
    updatedAt: new Date().toISOString(),
    custodyReference: record.custody_reference,
    tamperState: record.tamper_state,
    rooms: record.rooms,
    nodes: record.nodes,
    relationships: record.relationships,
    privateChronology: record.private_chronology,
    intendedActions: record.intended_actions,
    sourceStatus: record.source_status,
    evidenceBasis: record.evidence_basis,
    observations: record.observations,
    missingness: record.missingness,
    alternatives: record.alternatives,
    openQuestions: record.open_questions,
    operatorNotes: record.operator_notes,
    closureStatus: record.closure?.status,
    ...patch
  };
}

function routeInput(record, patch = {}) {
  return {
    caseId: record.case_id,
    createdAt: record.created_at,
    entries: record.entries,
    controlledTestRecovery: record.controlled_test_recovery,
    operatorDeclaredAssumptions: record.operator_declared_assumptions,
    unknown: record.unknown,
    sourceStatus: record.source_status,
    evidenceBasis: record.evidence_basis,
    observations: record.observations,
    missingness: record.missingness,
    alternatives: record.alternatives,
    openQuestions: record.open_questions,
    operatorNotes: record.operator_notes,
    closureStatus: record.closure?.status,
    ...patch
  };
}

async function persistCore() {
  await put('cases', state.caseMap);
  await put('roomRules', state.roomRules, state.caseMap.case_id);
  await put('routeMemory', state.routeMemory, state.caseMap.case_id);
  localStorage.setItem(POINTER_KEY, state.caseMap.case_id);
  $('storageState').textContent = 'IndexedDB active';
  announce('core-mutated');
}

async function loadCase(caseId) {
  const record = await get('cases', caseId);
  if (!record) return false;
  state.caseMap = record;
  state.roomRules = (await get('roomRules', caseId))?.value || await compileRoomRules({ caseId, rules: [] });
  state.routeMemory = (await get('routeMemory', caseId))?.value || await compileRouteMemory({ caseId, entries: [] });
  state.latestTest = (await all('tests')).filter(item => item.value?.case_id === caseId).at(-1)?.value || null;
  state.latestDraft = (await all('drafts')).filter(item => item.value?.case_id === caseId).at(-1)?.value || null;
  state.latestReview = (await all('reviews')).filter(item => item.value?.draft_id === state.latestDraft?.draft_id).at(-1)?.value || null;
  state.latestRelease = (await all('releases')).filter(item => item.value?.case_id === caseId).at(-1)?.value || null;
  state.savePoints = (await all('savePoints')).filter(item => item.value?.case_id === caseId).map(item => item.value);
  state.demo = record.title === 'Glasshouse Archive inquiry';
  $('launch').classList.add('hidden');
  renderAll();
  announce('case-opened');
  return true;
}

async function createCase({ demo = false } = {}) {
  if (demo) {
    const fixture = await fetch('/dome-world/fixtures/ash-keep-demo.json', { cache: 'no-store' }).then(response => {
      if (!response.ok) throw new Error('Demo fixture did not load.');
      return response.json();
    });
    state.caseMap = await compileCaseMap({
      profile: fixture.profile,
      title: fixture.title,
      rooms: fixture.case.rooms,
      nodes: fixture.case.nodes,
      relationships: fixture.case.relationships,
      privateChronology: fixture.case.privateChronology,
      intendedActions: fixture.case.intendedActions,
      evidenceBasis: ['synthetic tutorial fixture'],
      observations: ['No real person, organization, or investigation is represented.']
    });
    state.roomRules = await compileRoomRules({ caseId: state.caseMap.case_id, rules: fixture.room_rules, evidenceBasis: ['synthetic tutorial fixture'] });
    state.routeMemory = await compileRouteMemory({ caseId: state.caseMap.case_id, entries: [], evidenceBasis: ['operator Route Memory'] });
    $('linkLeft').value = fixture.style_samples.left;
    $('linkRight').value = fixture.style_samples.right;
    $('draftBody').value = fixture.held_draft;
    $('draftRefs').value = fixture.disclosure_sequence.slice(0, 4).flat().join(', ');
    $('testRefs').value = fixture.disclosure_sequence.slice(0, 5).flat().join(', ');
    state.demo = true;
  } else {
    const profile = $('newProfile').value;
    state.caseMap = await compileCaseMap({
      profile,
      title: $('newTitle').value,
      rooms: [{ id: 'room_primary', label: profile === 'legal' ? 'Record' : 'Working room', color: '#76ead4' }],
      nodes: [], relationships: [], privateChronology: [], intendedActions: [], evidenceBasis: ['operator-created local workspace']
    });
    state.roomRules = await compileRoomRules({ caseId: state.caseMap.case_id, rules: [] });
    state.routeMemory = await compileRouteMemory({ caseId: state.caseMap.case_id, entries: [] });
    state.demo = false;
  }
  await persistCore();
  $('launch').classList.add('hidden');
  renderAll();
  announce('case-created');
}

function initWorker() {
  state.worker = new Worker('/dome-world/ash-keep-worker.js');
  state.worker.addEventListener('message', event => {
    const task = state.workerTasks.get(event.data?.id);
    if (!task) return;
    state.workerTasks.delete(event.data.id);
    task.resolve(event.data.trials);
  });
  state.worker.addEventListener('error', error => {
    for (const task of state.workerTasks.values()) task.reject(error);
    state.workerTasks.clear();
  });
}

function workerTrials(proposedReferences) {
  return new Promise((resolve, reject) => {
    const id = crypto.randomUUID();
    state.workerTasks.set(id, { resolve, reject });
    state.worker.postMessage({ id, caseMap: state.caseMap, routeMemory: state.routeMemory, proposedReferences, seed: 613 });
  });
}

function setWorkspace(name) {
  state.workspace = name;
  qsa('.work-tab').forEach(button => button.setAttribute('aria-selected', String(button.dataset.workspace === name)));
  qsa('.workspace').forEach(panel => panel.classList.toggle('active', panel.id === `workspace-${name}`));
  state.mapVisible = name === 'map' && !document.hidden;
  const prefs = JSON.parse(localStorage.getItem(PREFS_KEY) || '{}');
  localStorage.setItem(PREFS_KEY, JSON.stringify({ ...prefs, workspace: name, mapMode: state.mapMode }));
  if (state.mapVisible) startScheduler(); else stopScheduler();
}

window.__td613OpenAshWorkspace = setWorkspace;

function renderAll() {
  if (!state.caseMap) return;
  $('objectLabel').textContent = `/ ${state.caseMap.object_label}`;
  $('caseTitle').textContent = state.caseMap.title;
  $('mapState').textContent = `${state.caseMap.object_label} · ${state.caseMap.tamper_state}`;
  $('roomCount').textContent = state.caseMap.rooms.length;
  $('nodeCount').textContent = state.caseMap.nodes.length;
  $('edgeCount').textContent = state.caseMap.relationships.length;
  renderRooms();
  renderMapEditors();
  renderRoutes();
  renderAccessibleTable();
  renderTest();
  renderDraft();
  renderSaves();
  buildLayout();
  drawMap(performance.now());
}

function renderMapEditors() {
  $('objectRoom').innerHTML = state.caseMap.rooms.map(room => `<option value="${room.id}">${escapeHtml(room.label)}</option>`).join('');
  const nodeOptions = state.caseMap.nodes.map(node => `<option value="${node.id}">${escapeHtml(node.label)}</option>`).join('');
  $('linkFrom').innerHTML = nodeOptions;
  $('linkTo').innerHTML = nodeOptions;
}

function renderRooms() {
  $('roomList').innerHTML = state.caseMap.rooms.map((room, index) => {
    const count = state.caseMap.nodes.filter(node => node.room_id === room.id).length;
    return `<article class="room-card" data-glyph="${glyphs[index % glyphs.length]}" style="border-color:${room.color}55"><strong>${escapeHtml(room.label)}</strong><small>${room.id}<br>${count} mapped object${count === 1 ? '' : 's'}</small></article>`;
  }).join('');
}

function renderRoutes() {
  $('routeList').innerHTML = state.routeMemory.entries.length ? state.routeMemory.entries.map(entry => `<article class="route-card"><strong>${escapeHtml(entry.route_id)}</strong><small>${escapeHtml(entry.purpose)}<br>${entry.disclosed_opaque_references.length} opaque reference(s)<br>${entry.recall_state}</small></article>`).join('') : '<p class="sub">Nothing has been recorded as leaving this case.</p>';
}

function renderAccessibleTable() {
  const roomById = new Map(state.caseMap.rooms.map(room => [room.id, room.label]));
  $('objectRows').innerHTML = state.caseMap.nodes.map(node => `<tr><td>${escapeHtml(node.label)}</td><td>${node.type}</td><td>${escapeHtml(roomById.get(node.room_id) || node.room_id)}</td><td>${node.source_status}</td><td>${node.disclosure_state}</td></tr>`).join('');
}

function renderTest() {
  if (!state.latestTest) {
    $('testReceipt').textContent = 'No Rebuild Test yet.';
    return;
  }
  $('testReceipt').textContent = safeJson(state.latestTest);
  $('testStatus').textContent = state.latestTest.calibration_state === 'NOT_ENOUGH_TEST_DATA' ? 'Not enough test data' : state.latestTest.review_state;
  $('trialCount').textContent = state.latestTest.trials.length;
  $('controlCount').textContent = state.latestTest.trials.filter(trial => trial.benign_control).length;
  $('heldoutCount').textContent = state.latestTest.trials.filter(trial => trial.held_out).length;
  $('coverageState').textContent = state.latestTest.exposure_bands_active ? 'tested' : 'open';
  renderExposureVector();
}

function renderExposureVector() {
  const trial = state.latestTest?.trials.find(value => value.state === 'OBSERVED' && !value.benign_control);
  const vector = trial?.after || Object.fromEntries(EXPOSURE_DIMENSIONS.map(key => [key, { numerator: 0, denominator: 1 }]));
  $('exposureVector').innerHTML = EXPOSURE_DIMENSIONS.map(key => {
    const value = vector[key] || { numerator: 0, denominator: 1 };
    const percent = Math.max(0, Math.min(100, Math.round(value.numerator / value.denominator * 100)));
    return `<div class="vector-row"><span>${key.replaceAll('_', ' ')}</span><span class="meter"><i style="width:${percent}%"></i></span><b>${value.numerator}/${value.denominator}</b></div>`;
  }).join('');
}

function renderDraft() {
  if (state.latestDraft) {
    $('draftStatus').textContent = `Kept ${state.latestDraft.draft_digest.slice(-16)}`;
    if (!$('draftBody').value) $('draftBody').value = state.latestDraft.body;
  }
  if (state.latestReview) {
    $('reviewStatus').textContent = state.latestReview.status;
    $('approveRelease').disabled = !(state.latestReview.status === 'READY_FOR_LOCAL_RELEASE_APPROVAL' && state.latestReview.local_export_approved);
  }
  if (state.latestRelease) $('releaseReceipt').textContent = safeJson(state.latestRelease);
}

function renderSaves() {
  $('saveList').innerHTML = state.savePoints.length ? state.savePoints.map(point => `<article class="save-card"><strong>${point.save_point_id}</strong><small>${point.created_at}<br>${point.tamper_state}<br>${point.save_point_digest.slice(-16)}</small></article>`).join('') : '<p class="sub">No Save Point yet.</p>';
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[character]);
}

function roomColor(roomId) {
  return state.caseMap.rooms.find(room => room.id === roomId)?.color || '#76ead4';
}

function buildLayout() {
  if (!state.caseMap) return;
  const rect = $('mapStage').getBoundingClientRect();
  const width = Math.max(320, rect.width);
  const height = Math.max(420, rect.height);
  const mobile = width < 640;
  const limit = mobile ? 120 : 250;
  const nodes = state.caseMap.nodes.slice(0, limit);
  const roomIndex = new Map(state.caseMap.rooms.map((room, index) => [room.id, index]));
  const byRoom = new Map(state.caseMap.rooms.map(room => [room.id, nodes.filter(node => node.room_id === room.id)]));
  const chambers = state.caseMap.rooms.map((room, index) => {
    const angle = (index / Math.max(1, state.caseMap.rooms.length)) * Math.PI * 2 - Math.PI / 2;
    const ring = Math.min(width, height) * (mobile ? .27 : .31);
    return { ...room, x: width / 2 + Math.cos(angle) * ring, y: height / 2 + Math.sin(angle) * ring, radius: Math.max(74, Math.min(145, ring * .52)) };
  });
  const chamberById = new Map(chambers.map(chamber => [chamber.id, chamber]));
  const positions = new Map();
  for (const node of nodes) {
    const chamber = chamberById.get(node.room_id);
    const list = byRoom.get(node.room_id) || [];
    const index = list.findIndex(value => value.id === node.id);
    const angle = (index / Math.max(1, list.length)) * Math.PI * 2 + (roomIndex.get(node.room_id) || 0) * .41;
    const radius = list.length === 1 ? 0 : chamber.radius * (.34 + (index % 2) * .2);
    positions.set(node.id, { x: chamber.x + Math.cos(angle) * radius, y: chamber.y + Math.sin(angle) * radius, node });
  }
  const grid = new Map();
  for (const [id, point] of positions) {
    const key = `${Math.floor(point.x / 64)}:${Math.floor(point.y / 64)}`;
    if (!grid.has(key)) grid.set(key, []);
    grid.get(key).push(id);
  }
  state.layout = { width, height, chambers, positions, grid };
}

function visibleSets() {
  const left = new Set(state.routeMemory?.entries.flatMap(entry => entry.disclosed_opaque_references) || []);
  const trial = state.latestTest?.trials.find(value => value.state === 'OBSERVED' && !value.benign_control);
  const before = new Set(trial?.recovered_opaque_references?.filter(id => left.has(id)) || [...left]);
  const after = new Set(trial?.recovered_opaque_references || []);
  const changed = new Set([...after].filter(id => !before.has(id)));
  const remains = new Set(state.caseMap.nodes.map(node => node.id).filter(id => !after.has(id)));
  return { left, before, after, changed, remains };
}

function resizeCanvas() {
  const canvas = $('caseCanvas');
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(devicePixelRatio || 1, innerWidth < 640 ? 1.35 : 1.75);
  const width = Math.round(rect.width * dpr);
  const height = Math.round(rect.height * dpr);
  if (state.canvasSize.width === width && state.canvasSize.height === height && state.canvasSize.dpr === dpr) return;
  canvas.width = width;
  canvas.height = height;
  state.canvasSize = { width, height, dpr };
  buildLayout();
}

function drawMap(time = 0) {
  if (!state.caseMap || !state.layout) return;
  resizeCanvas();
  const canvas = $('caseCanvas');
  const ctx = canvas.getContext('2d');
  const { dpr } = state.canvasSize;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, state.layout.width, state.layout.height);
  ctx.save();
  ctx.translate(state.view.x, state.view.y);
  ctx.scale(state.view.scale, state.view.scale);
  const sets = visibleSets();
  const roomByNode = new Map(state.caseMap.nodes.map(node => [node.id, node.room_id]));
  for (let ring = 1; ring <= 5; ring += 1) {
    ctx.beginPath();
    ctx.arc(state.layout.width / 2, state.layout.height / 2, Math.min(state.layout.width, state.layout.height) * (.08 + ring * .075), 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(118,234,212,${.025 + ring * .009})`;
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  for (const chamber of state.layout.chambers) {
    ctx.beginPath();
    for (let side = 0; side < 8; side += 1) {
      const angle = side / 8 * Math.PI * 2 - Math.PI / 8;
      const x = chamber.x + Math.cos(angle) * chamber.radius;
      const y = chamber.y + Math.sin(angle) * chamber.radius;
      if (!side) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = `${chamber.color}08`;
    ctx.strokeStyle = `${chamber.color}55`;
    ctx.lineWidth = 1;
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = `${chamber.color}bb`;
    ctx.font = '600 10px IBM Plex Mono, monospace';
    ctx.fillText(chamber.label.toUpperCase(), chamber.x - chamber.radius + 9, chamber.y - chamber.radius + 17);
  }
  for (const edge of state.caseMap.relationships) {
    const a = state.layout.positions.get(edge.from);
    const b = state.layout.positions.get(edge.to);
    if (!a || !b) continue;
    const crossRoom = roomByNode.get(edge.from) !== roomByNode.get(edge.to);
    const newly = sets.changed.has(edge.from) && sets.changed.has(edge.to);
    ctx.beginPath(); ctx.moveTo(a.x, a.y);
    const mx = (a.x + b.x) / 2 + (crossRoom ? (a.y - b.y) * .08 : 0);
    const my = (a.y + b.y) / 2 + (crossRoom ? (b.x - a.x) * .08 : 0);
    ctx.quadraticCurveTo(mx, my, b.x, b.y);
    ctx.strokeStyle = newly ? 'rgba(217,161,255,.85)' : crossRoom ? 'rgba(228,198,108,.35)' : 'rgba(118,234,212,.24)';
    ctx.lineWidth = newly ? 2 : 1;
    ctx.stroke();
  }
  const activeSet = state.mapMode === 'left' ? sets.left : state.mapMode === 'before' ? sets.before : state.mapMode === 'after' ? sets.after : state.mapMode === 'changed' ? sets.changed : state.mapMode === 'remains' ? sets.remains : null;
  for (const [id, point] of state.layout.positions) {
    const selected = id === state.selectedNodeId;
    const active = activeSet ? activeSet.has(id) : true;
    const changed = sets.changed.has(id);
    const left = sets.left.has(id);
    const unresolved = point.node.confidence_posture === 'OPEN' || point.node.type === 'evidence-gap';
    let color = roomColor(point.node.room_id);
    if (changed) color = '#d9a1ff'; else if (left) color = '#e4c66c'; else if (unresolved && state.mapMode === 'remains') color = '#ff8b9d';
    ctx.globalAlpha = active ? 1 : .15;
    ctx.beginPath(); ctx.arc(point.x, point.y, selected ? 9 : 6, 0, Math.PI * 2);
    ctx.fillStyle = color; ctx.fill();
    ctx.strokeStyle = selected ? '#fff8da' : `${color}99`; ctx.lineWidth = selected ? 2 : 1;
    ctx.stroke();
    if (selected || state.layout.width > 680) {
      ctx.fillStyle = '#fff8da';
      ctx.font = '11px IBM Plex Mono, monospace';
      ctx.fillText(point.node.label.slice(0, 28), point.x + 10, point.y + 4);
    }
    ctx.globalAlpha = 1;
  }
  if (!state.reducedMotion && state.latestTest) {
    const angle = (time * .00018) % (Math.PI * 2);
    const radius = Math.min(state.layout.width, state.layout.height) * .43;
    ctx.beginPath();
    ctx.arc(state.layout.width / 2, state.layout.height / 2, radius, angle, angle + .42);
    ctx.strokeStyle = 'rgba(217,161,255,.72)'; ctx.lineWidth = 2; ctx.stroke();
  }
  ctx.restore();
}

const scheduleFrame = callback => requestAnimationFrame(callback);

function frame(time) {
  state.frame = 0;
  if (!state.mapVisible || state.reducedMotion) return;
  drawMap(time);
  state.frame = scheduleFrame(frame);
}

function startScheduler() {
  if (state.reducedMotion) { drawMap(0); return; }
  if (!state.frame) state.frame = scheduleFrame(frame);
}

function stopScheduler() {
  if (state.frame) cancelAnimationFrame(state.frame);
  state.frame = 0;
}

function canvasPoint(event) {
  const rect = $('caseCanvas').getBoundingClientRect();
  return { x: (event.clientX - rect.left - state.view.x) / state.view.scale, y: (event.clientY - rect.top - state.view.y) / state.view.scale };
}

function nearestNode(point) {
  if (!state.layout) return null;
  const cellX = Math.floor(point.x / 64), cellY = Math.floor(point.y / 64);
  let best = null, distance = 24 / state.view.scale;
  for (let x = cellX - 1; x <= cellX + 1; x += 1) for (let y = cellY - 1; y <= cellY + 1; y += 1) {
    for (const id of state.layout.grid.get(`${x}:${y}`) || []) {
      const candidate = state.layout.positions.get(id);
      const current = Math.hypot(candidate.x - point.x, candidate.y - point.y);
      if (current < distance) { best = id; distance = current; }
    }
  }
  return best;
}

function selectNode(id) {
  state.selectedNodeId = id;
  const node = state.caseMap.nodes.find(value => value.id === id);
  $('selectionTitle').textContent = node?.label || 'Map posture';
  $('selectedValue').textContent = node ? `${node.type} · ${node.room_id}` : 'none';
  drawMap(performance.now());
}

async function runTest() {
  await window.TD613AshConvergence.authorize('APERTURE_REBUILD');
  const proposed = split($('testRefs').value);
  $('testStatus').textContent = 'Reader sweep running…';
  state.reader = await compileReaderProfile({
    label: $('readerClass').selectedOptions[0].textContent,
    readerClass: $('readerClass').value,
    repeatCount: 4,
    seeded: true,
    evidenceBasis: ['declared Reader class', 'browser-local route projection']
  });
  const trials = await workerTrials(proposed);
  if ($('readerClass').value === 'imported-provider-output' && $('importedReaderOutput').value.trim()) {
    trials[0].observations.push({ imported_provider_output: $('importedReaderOutput').value.trim() });
  }
  const calibratedFixture = state.demo && $('readerClass').value !== 'ash-v06-quick-scan';
  state.latestTest = await compileRebuildTest({
    caseMap: state.caseMap,
    routeMemory: state.routeMemory,
    reader: state.reader,
    trials,
    sourceDriftState: 'SOURCE_HELD',
    calibration: {
      preregisteredFixture: calibratedFixture,
      sourceDriftCheck: true,
      alternativeReader: calibratedFixture,
      exactThresholds: calibratedFixture ? { room_bridges: { numerator: 1, denominator: 2 } } : {}
    },
    signedResidue: [{ dimension: 'unresolved', numerator: state.caseMap.nodes.filter(node => node.confidence_posture === 'OPEN').length, denominator: Math.max(1, state.caseMap.nodes.length) }],
    evidenceBasis: ['named Reader results', 'exact componentwise exposure vectors'],
    alternatives: ['ordinary topic overlap', 'shared templates', 'incomplete route memory'],
    openQuestions: ['Which additional held-out Reader would discriminate among the alternatives?']
  });
  await put('tests', state.latestTest, state.latestTest.test_id);
  state.routeMemory = await compileRouteMemory(routeInput(state.routeMemory, {
    controlledTestRecovery: [...state.routeMemory.controlled_test_recovery, { test_id: state.latestTest.test_id, test_digest: state.latestTest.test_digest, reader_id: state.reader.reader_id }]
  }));
  await persistCore();
  renderTest(); buildLayout(); drawMap(performance.now()); startScheduler();
  announce('rebuild-kept', { rebuild_receipt_reference: state.latestTest.test_id });
  const first = state.latestTest.trials.find(trial => trial.state === 'OBSERVED' && !trial.benign_control);
  if (first) {
    const added = first.change.room_bridges.direction === 'INCREASE' ? 7 : first.change.relationships.direction === 'INCREASE' ? 4 : 0;
    $('rebuildValue').value = String(added);
    $('rebuildReadout').textContent = String(added);
  }
}

function buildReviewChecks() {
  const labels = {
    validCustody: 'Custody is current', sufficientTestCoverage: 'Test coverage reviewed', unresolvedTamper: 'No unresolved tamper event', explicitReview: 'I reviewed this exact draft', protectedIdentityReviewed: 'Protected identities reviewed', confidentialPassagesReviewed: 'Confidential passages reviewed', metadataReviewed: 'Metadata reviewed', sourceReferencesReviewed: 'Source references reviewed', promptInjectionReviewed: 'Copied instructions quarantined', routeHistoryReviewed: 'Route Memory reviewed', roomBridgesReviewed: 'Cross-Room links reviewed', chronologyReviewed: 'Chronology exposure reviewed', hushLinkCheckReviewed: 'Hush Link Check reviewed'
  };
  $('reviewChecks').innerHTML = Object.entries(labels).map(([key, label]) => `<label class="check"><input type="checkbox" data-review="${key}">${label}</label>`).join('');
}

async function keepDraft() {
  await window.TD613AshConvergence.authorize('KEEP_DRAFT');
  state.latestDraft = await compileAshDraft({
    caseId: state.caseMap.case_id,
    caseMapDigest: state.caseMap.case_map_digest,
    body: $('draftBody').value,
    version: $('draftVersion').value,
    selectedRoute: $('draftRoute').value,
    recipientClass: $('draftRecipient').value,
    purpose: $('draftPurpose').value,
    disclosedOpaqueReferences: split($('draftRefs').value),
    roomIds: uniqueRoomIds(split($('draftRefs').value)),
    evidenceBasis: ['operator-authored local draft'],
    observations: [{
      tradeoff: {
        usefulness: Number($('utilityValue').value),
        added_reconstructability: Number($('rebuildValue').value),
        linkability: Number($('linkValue').value),
        custodial_work: Number($('workValue').value)
      },
      provider_receipt: state.latestProviderReceipt ? cloneLocal(state.latestProviderReceipt) : null
    }],
    alternatives: ['redact', 'paraphrase', 'generalize', 'omit', 'separate Rooms', 'structural surrogate', 'keep local']
  });
  state.latestReview = null; state.latestRelease = null;
  await put('drafts', state.latestDraft, state.latestDraft.draft_id);
  renderDraft();
  announce('draft-kept', { draft_reference: state.latestDraft.draft_id });
}

function uniqueRoomIds(refs) {
  return [...new Set(state.caseMap.nodes.filter(node => refs.includes(node.id)).map(node => node.room_id))];
}

async function reviewDraft() {
  await window.TD613AshConvergence.authorize('REVIEW_DRAFT');
  if (!state.latestDraft || state.latestDraft.body !== $('draftBody').value || state.latestDraft.version !== $('draftVersion').value) await keepDraft();
  const values = Object.fromEntries(qsa('[data-review]').map(input => [input.dataset.review, input.checked]));
  state.latestReview = await compileDraftReview({
    draft: state.latestDraft,
    validCustody: values.validCustody,
    sufficientTestCoverage: values.sufficientTestCoverage,
    unresolvedTamper: !values.unresolvedTamper,
    explicitReview: values.explicitReview,
    protectedIdentityReviewed: values.protectedIdentityReviewed,
    confidentialPassagesReviewed: values.confidentialPassagesReviewed,
    metadataReviewed: values.metadataReviewed,
    sourceReferencesReviewed: values.sourceReferencesReviewed,
    promptInjectionReviewed: values.promptInjectionReviewed,
    routeHistoryReviewed: values.routeHistoryReviewed,
    roomBridgesReviewed: values.roomBridgesReviewed,
    chronologyReviewed: values.chronologyReviewed,
    hushLinkCheckReviewed: values.hushLinkCheckReviewed,
    approvalScope: 'LOCAL_EXPORT',
    observations: ['Review was performed against the exact kept draft.']
  });
  await put('reviews', state.latestReview, state.latestReview.review_id);
  renderDraft();
  announce('review-kept', { review_reference: state.latestReview.review_id });
}

async function approveRelease() {
  await window.TD613AshConvergence.authorize('KEEP_RELEASE');
  const existing = (await all('releases')).map(item => item.value?.nonce).filter(Boolean);
  state.latestRelease = await compileReleaseReceipt({
    draft: state.latestDraft,
    review: state.latestReview,
    route: $('draftRoute').value,
    recipientClass: $('draftRecipient').value,
    purpose: $('draftPurpose').value,
    version: $('draftVersion').value,
    operatorGesture: 'button:Keep Release Receipt',
    usedNonces: existing
  });
  await put('releases', state.latestRelease, state.latestRelease.receipt_id);
  renderDraft();
  announce('release-kept', { release_reference: state.latestRelease.receipt_id });
}

async function makeSavePoint() {
  await window.TD613AshConvergence.authorize('SEAL_CONTINUITY');
  state.savePoints.push(await compileSavePoint({
    caseId: state.caseMap.case_id,
    caseMapDigest: state.caseMap.case_map_digest,
    routeMemoryDigest: state.routeMemory.route_memory_digest,
    releaseReceiptReference: state.latestRelease?.receipt_id || null,
    releaseReceiptDigest: state.latestRelease?.receipt_digest || null,
    releaseCreatedAt: state.latestRelease?.created_at || null,
    evidenceInventory: state.caseMap.nodes.filter(node => ['artifact', 'source'].includes(node.type)).map(node => node.id),
    unansweredQuestions: String($('saveQuestions').value || '').split('\n').filter(Boolean),
    corroborationState: state.caseMap.nodes.filter(node => node.type === 'claim').map(node => ({ node_id: node.id, posture: node.confidence_posture })),
    hypothesisPosture: state.caseMap.nodes.filter(node => node.type === 'hypothesis').map(node => ({ node_id: node.id, posture: node.confidence_posture })),
    nextStepPosture: String($('saveNext').value || '').split('\n').filter(Boolean),
    tamperState: state.caseMap.tamper_state,
    evidenceBasis: ['current local Case Map', 'current local Route Memory']
  }));
  const point = state.savePoints.at(-1);
  await put('savePoints', point, point.save_point_id);
  $('saveStatus').textContent = `Save Point ${point.save_point_id} sealed locally.`;
  renderSaves();
  announce('continuity-kept', { continuity_reference: point.save_point_id });
}

function downloadJson(filename, value) {
  const url = URL.createObjectURL(new Blob([safeJson(value)], { type: 'application/json' }));
  const anchor = document.createElement('a'); anchor.href = url; anchor.download = filename; anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function exportCapsule() {
  await window.TD613AshConvergence.authorize('EXPORT_CAPSULE');
  const latestSavePoint = state.savePoints.at(-1);
  const currentRelease = state.latestRelease;
  if (!currentRelease) throw new Error('A current Release Receipt is required before Capsule export.');
  if (!latestSavePoint || latestSavePoint.release_receipt_reference !== currentRelease.receipt_id || latestSavePoint.release_receipt_digest !== currentRelease.receipt_digest || latestSavePoint.release_created_at !== currentRelease.created_at) await makeSavePoint();
  const passphrase = $('capsulePassphrase').value;
  $('capsuleStatus').textContent = 'Encrypting locally…';
  const capsule = await encryptAshCapsule({
    passphrase,
    caseId: state.caseMap.case_id,
    savePoint: state.savePoints.at(-1),
    caseBundle: { caseMap: state.caseMap, roomRules: state.roomRules, routeMemory: state.routeMemory }
  });
  downloadJson(`td613-ash-capsule-${state.caseMap.case_id}.json`, capsule);
  $('capsulePassphrase').value = '';
  $('capsuleStatus').textContent = 'Encrypted copy exported. Passphrase and key were not stored.';
}

async function importCapsule() {
  const file = $('capsuleFile').files?.[0];
  if (!file) throw new Error('Choose an Ash Capsule first.');
  const capsule = JSON.parse(await file.text());
  const payload = await decryptAshCapsule(capsule, $('capsulePassphrase').value);
  const { caseMap, roomRules, routeMemory } = payload.case_bundle || {};
  if (!(await verifyCaseMap(caseMap)) || !(await verifyRouteMemory(routeMemory)) || !(await verifySavePoint(payload.save_point))) throw new Error('Capsule records failed verification; nothing was imported.');
  state.caseMap = caseMap; state.roomRules = roomRules; state.routeMemory = routeMemory; state.savePoints = [payload.save_point];
  await persistCore();
  await put('savePoints', payload.save_point, payload.save_point.save_point_id);
  $('capsulePassphrase').value = '';
  $('capsuleStatus').textContent = 'Authenticated capsule opened into local custody.';
  $('launch').classList.add('hidden');
  renderAll();
  announce('capsule-opened', { continuity_reference: payload.save_point.save_point_id });
}

async function recordRoute() {
  await window.TD613AshConvergence.authorize('ROUTE_MEMORY_WRITE');
  const draftDigest = $('routeDigest').value || state.latestDraft?.draft_digest;
  state.routeMemory = await compileRouteMemory(routeInput(state.routeMemory, { entries: [...state.routeMemory.entries, {
    draft_digest: draftDigest,
    route_id: $('routeId').value,
    purpose: $('routePurpose').value,
    recipient_class: $('routeRecipient').value,
    disclosed_opaque_references: split($('routeRefs').value),
    hush_receipt_reference: null,
    recall_state: 'NOT_RECALLED'
  }] }));
  await persistCore(); renderRoutes(); buildLayout(); drawMap(performance.now());
  $('routeStatus').textContent = 'What left was recorded as an immutable successor entry.';
}

async function addRoom() {
  const label = $('roomName').value.trim();
  if (!label) throw new Error('Room name is required.');
  let id = `room_${label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') || 'local'}`;
  if (state.caseMap.rooms.some(room => room.id === id)) id += `_${state.caseMap.rooms.length + 1}`;
  state.caseMap = await compileCaseMap(caseInput(state.caseMap, { rooms: [...state.caseMap.rooms, { id, label, color: $('roomColor').value }] }));
  await persistCore(); renderAll(); $('roomName').value = ''; $('roomStatus').textContent = `${label} added.`;
}

function cloneLocal(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

async function addObject() {
  const label = $('objectName').value.trim();
  if (!label) throw new Error('Object name is required.');
  const stem = label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') || 'object';
  let id = `node_${stem}`;
  if (state.caseMap.nodes.some(node => node.id === id)) id += `_${state.caseMap.nodes.length + 1}`;
  const node = {
    id,
    type: $('objectType').value,
    label,
    room_id: $('objectRoom').value,
    source_status: $('objectSource').value,
    confidence_posture: 'OPEN',
    disclosure_state: 'LOCAL',
    chronology_index: state.caseMap.nodes.length
  };
  state.caseMap = await compileCaseMap(caseInput(state.caseMap, { nodes: [...state.caseMap.nodes, node] }));
  await persistCore();
  $('objectName').value = '';
  $('mapEditStatus').textContent = `${label} added to ${node.room_id}.`;
  renderAll();
}

async function addRelationship() {
  const from = $('linkFrom').value, to = $('linkTo').value;
  if (!from || !to || from === to) throw new Error('Choose two different objects.');
  const type = $('linkType').value.trim();
  if (!type) throw new Error('Relationship name is required.');
  const stem = type.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') || 'relation';
  let id = `edge_${stem}_${state.caseMap.relationships.length + 1}`;
  while (state.caseMap.relationships.some(edge => edge.id === id)) id += '_next';
  state.caseMap = await compileCaseMap(caseInput(state.caseMap, {
    relationships: [...state.caseMap.relationships, { id, from, to, type, source_status: 'SUPPLIED', confidence_posture: 'OPEN', disclosure_state: 'LOCAL' }]
  }));
  await persistCore();
  $('relationshipStatus').textContent = `${type} connected.`;
  $('linkType').value = '';
  renderAll();
}

async function replayLatestTest() {
  if (!state.latestTest) throw new Error('Run a Rebuild Test first.');
  const replay = await replayRebuildTest(state.latestTest);
  $('replayReceipt').hidden = false;
  $('replayReceipt').textContent = safeJson(replay);
  $('testStatus').textContent = replay.status;
}

async function recordUnexpectedDetail() {
  const event = await compileUnexpectedDetail({
    caseId: state.caseMap.case_id,
    detail: $('unexpectedText').value,
    knownBeforeOutput: $('knownBefore').checked,
    providerReceiptReference: state.latestProviderReceipt?.local_receipt_id || null,
    evidenceBasis: ['operator-observed provider output'],
    openQuestions: ['Which supplied context, ordinary inference, or other route best accounts for this detail?']
  });
  await put('unexpectedDetails', event, event.event_id);
  $('unexpectedStatus').textContent = `Unexpected Detail ${event.event_id} recorded with acquisition route UNKNOWN.`;
  $('unexpectedText').value = '';
}

async function askHushProvider() {
  await window.TD613AshConvergence.authorize('HUSH_CANDIDATE');
  if (!$('providerApproval').checked) throw new Error('Confirm the exact provider draft first.');
  if (!$('providerScreenReview').checked) throw new Error('Review the local provider screen first.');
  const body = $('draftBody').value.trim();
  if (!body) throw new Error('Draft body is required.');
  await screenCurrentProvider();
  state.latestProviderPacket = await compileProviderPacket({
    sourceText: body,
    purpose: $('draftPurpose').value,
    task: $('providerTask').value,
    providerRouteClass: 'hush-gemini-proxy',
    screen: state.latestProviderScreen,
    screenReviewed: $('providerScreenReview').checked,
    operatorConfirmed: $('providerApproval').checked
  });
  $('providerPacket').textContent = safeJson(state.latestProviderPacket);
  $('providerStatus').textContent = 'Confirmed draft sent through the Hush API…';
  const response = await fetch('/api/hush-generate', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      mode: 'provider-draft',
      operatorConfirmed: true,
      packet: state.latestProviderPacket,
      contract: {
        sourceText: state.latestProviderPacket.source_text,
        ashKeepMode: 'provider-draft',
        operatorConfirmed: true,
        candidateCount: 2,
        packetTier: 'ash_keep_provider_draft',
        packetHints: { routeInstruction: state.latestProviderPacket.task }
      }
    })
  });
  const payload = await response.json();
  if (!response.ok || !payload.ok || !payload.candidates?.length) throw new Error(payload.error || payload.reason || 'Provider returned no draft.');
  const candidate = payload.candidates[0].text;
  state.latestProviderReceipt = {
    schema: 'td613.hush.ash-keep-provider-receipt/v0.1',
    local_receipt_id: `hush_${crypto.randomUUID()}`,
    created_at: new Date().toISOString(),
    sent: { packet_id: state.latestProviderPacket.packet_id, packet_digest: state.latestProviderPacket.packet_digest, body },
    returned: { body: candidate, provider: payload.provider, model: payload.model },
    requestReceipt: payload.requestReceipt,
    provider_confidentiality_status: 'NOT_RECORDED_BY_THIS_RECEIPT',
    recipient_transport: false
  };
  $('draftBody').value = candidate;
  $('draftVersion').value = String(Number($('draftVersion').value || 0) + 1);
  $('providerApproval').checked = false;
  $('providerStatus').textContent = 'Provider result is an unkept successor draft. Review and keep it before any local export.';
}

async function screenCurrentProvider() {
  state.latestProviderScreen = await screenProviderDraft({
    body: $('draftBody').value,
    protectedLiterals: split($('protectedLiterals').value),
    routeClass: 'hush-gemini-proxy',
    fileMetadata: state.localFileMetadata,
    evidenceBasis: ['operator-selected local text']
  });
  state.latestProviderPacket = null;
  $('providerPacket').textContent = safeJson(state.latestProviderScreen);
  $('providerStatus').textContent = `${state.latestProviderScreen.status}. Review is required before provider use.`;
}

async function loadLocalTextFile() {
  const file = $('localTextFile').files?.[0];
  if (!file) return;
  if (file.size > 1024 * 1024) throw new Error('Local text import is limited to 1 MiB. Select a smaller excerpt.');
  const allowed = /(?:text\/(?:plain|markdown|csv)|application\/json)/.test(file.type) || /\.(?:txt|md|csv|json)$/i.test(file.name);
  if (!allowed) throw new Error('This lane opens text, Markdown, CSV, or JSON locally. Extract a selected text excerpt from other document types first.');
  $('draftBody').value = await file.text();
  state.localFileMetadata = { name: file.name, media_type: file.type || 'application/octet-stream', byte_length: file.size, last_modified: file.lastModified };
  state.latestProviderScreen = null;
  state.latestProviderPacket = null;
  $('providerScreenReview').checked = false;
  $('providerApproval').checked = false;
  $('draftStatus').textContent = `${file.name} opened locally. Nothing was sent.`;
}

async function saveRoomRule() {
  const next = { route_id: $('ruleRoute').value, allowed_room_ids: split($('ruleRooms').value), local_link_keys: split($('ruleKeys').value) };
  const rules = [...state.roomRules.rules.filter(rule => rule.route_id !== next.route_id), next];
  state.roomRules = await compileRoomRules({ caseId: state.caseMap.case_id, rules, evidenceBasis: ['operator-declared Room Rules'] });
  await persistCore(); $('roomStatus').textContent = `Rule kept for ${next.route_id}.`;
}

async function compareDrafts() {
  const receipt = await compileLinkCheck({ leftText: $('linkLeft').value, rightText: $('linkRight').value, evidenceBasis: ['browser-local character trigrams'] });
  $('linkStatus').textContent = `${receipt.result} · ${receipt.linkability_vector.numerator}/${receipt.linkability_vector.denominator} shared structure`;
}

async function saveResearchNotes() {
  if (!state.caseMap) return;
  await put('notes', { notes: $('researchNotes').value, updated_at: new Date().toISOString() }, state.caseMap.case_id);
}

function bindEvents() {
  qsa('.work-tab').forEach(button => button.addEventListener('click', () => setWorkspace(button.dataset.workspace)));
  qsa('#mapModes button').forEach(button => button.addEventListener('click', () => {
    state.mapMode = button.dataset.mode;
    qsa('#mapModes button').forEach(item => item.classList.toggle('active', item === button));
    drawMap(performance.now());
  }));
  $('startDemo').addEventListener('click', () => act(() => createCase({ demo: true })));
  $('newCase').addEventListener('click', () => act(() => createCase()));
  $('addRoom').addEventListener('click', () => act(addRoom, 'roomStatus'));
  $('addObject').addEventListener('click', () => act(addObject, 'mapEditStatus'));
  $('addRelationship').addEventListener('click', () => act(addRelationship, 'relationshipStatus'));
  $('saveRule').addEventListener('click', () => act(saveRoomRule, 'roomStatus'));
  $('recordRoute').addEventListener('click', () => act(recordRoute, 'routeStatus'));
  $('runTest').addEventListener('click', () => act(runTest, 'testStatus'));
  $('loadSeed').addEventListener('click', () => { $('testRefs').value = state.demo ? 'node_archive, node_register, node_claim, node_invoice, node_hypothesis' : $('testRefs').value; act(runTest, 'testStatus'); });
  $('replayTest').addEventListener('click', () => act(replayLatestTest, 'testStatus'));
  $('recordUnexpected').addEventListener('click', () => act(recordUnexpectedDetail, 'unexpectedStatus'));
  $('compareDrafts').addEventListener('click', () => act(compareDrafts, 'linkStatus'));
  $('keepDraft').addEventListener('click', () => act(keepDraft, 'draftStatus'));
  $('draftTest').addEventListener('click', () => { $('testRefs').value = $('draftRefs').value; setWorkspace('test'); act(runTest, 'testStatus'); });
  $('reviewDraft').addEventListener('click', () => act(reviewDraft, 'reviewStatus'));
  $('approveRelease').addEventListener('click', () => act(approveRelease, 'reviewStatus'));
  $('askHush').addEventListener('click', () => act(askHushProvider, 'providerStatus'));
  $('screenProvider').addEventListener('click', () => act(screenCurrentProvider, 'providerStatus'));
  $('localTextFile').addEventListener('change', () => act(loadLocalTextFile, 'draftStatus'));
  $('makeSave').addEventListener('click', () => act(makeSavePoint, 'saveStatus'));
  $('exportCapsule').addEventListener('click', () => act(exportCapsule, 'capsuleStatus'));
  $('importCapsule').addEventListener('click', () => act(importCapsule, 'capsuleStatus'));
  $('toggleTable').addEventListener('click', () => $('accessibleTable').classList.toggle('active'));
  $('resetView').addEventListener('click', () => { state.view = { x: 0, y: 0, scale: 1 }; drawMap(performance.now()); });
  $('researchNotes').addEventListener('change', () => act(saveResearchNotes));
  for (const id of ['utility', 'rebuild', 'link', 'work']) {
    $(`${id}Value`).addEventListener('input', event => { $(`${id}Readout`).textContent = event.target.value; });
  }
  document.addEventListener('visibilitychange', () => { state.mapVisible = state.workspace === 'map' && !document.hidden; if (state.mapVisible) startScheduler(); else stopScheduler(); });
  const canvas = $('caseCanvas');
  canvas.addEventListener('pointerdown', event => {
    canvas.setPointerCapture(event.pointerId); state.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    state.drag = { x: event.clientX, y: event.clientY, viewX: state.view.x, viewY: state.view.y, moved: false };
  });
  canvas.addEventListener('pointermove', event => {
    if (state.pointers.has(event.pointerId)) state.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (state.pointers.size === 2) {
      const [a, b] = [...state.pointers.values()]; const distance = Math.hypot(a.x - b.x, a.y - b.y);
      if (state.pinchDistance) state.view.scale = Math.max(.55, Math.min(2.8, state.view.scale * distance / state.pinchDistance));
      state.pinchDistance = distance; drawMap(performance.now()); return;
    }
    if (state.drag && state.pointers.size === 1) {
      const dx = event.clientX - state.drag.x, dy = event.clientY - state.drag.y;
      if (Math.hypot(dx, dy) > 4) state.drag.moved = true;
      state.view.x = state.drag.viewX + dx; state.view.y = state.drag.viewY + dy; drawMap(performance.now());
    } else if (event.pointerType === 'mouse') selectNode(nearestNode(canvasPoint(event)));
  });
  const endPointer = event => {
    const moved = state.drag?.moved; state.pointers.delete(event.pointerId); state.pinchDistance = 0;
    if (!moved && state.pointers.size === 0) selectNode(nearestNode(canvasPoint(event)));
    if (!state.pointers.size) state.drag = null;
  };
  canvas.addEventListener('pointerup', endPointer); canvas.addEventListener('pointercancel', endPointer);
  canvas.addEventListener('wheel', event => { event.preventDefault(); state.view.scale = Math.max(.55, Math.min(2.8, state.view.scale * (event.deltaY > 0 ? .9 : 1.1))); drawMap(performance.now()); }, { passive: false });
  new ResizeObserver(() => { buildLayout(); drawMap(performance.now()); }).observe($('mapStage'));
}

async function act(operation, statusId = null) {
  try { await operation(); }
  catch (error) { if (statusId && $(statusId)) $(statusId).textContent = error.message; else console.error(error); }
}

async function boot() {
  state.db = await openDb();
  initWorker(); bindEvents(); buildReviewChecks();
  const prefs = JSON.parse(localStorage.getItem(PREFS_KEY) || '{}');
  const pointer = localStorage.getItem(POINTER_KEY);
  if (pointer && await loadCase(pointer)) {
    const notes = await get('notes', pointer); $('researchNotes').value = notes?.value?.notes || '';
    setWorkspace(prefs.workspace || 'map');
  } else {
    $('launch').classList.remove('hidden');
  }
  startScheduler();
  window.__td613AshKeep = Object.freeze({
    version: 'td613.ash-keep.browser-core/v1.1-convergence-native',
    current: () => ({
      case_id: state.caseMap?.case_id || null,
      case_map_digest: state.caseMap?.case_map_digest || null,
      route_memory_digest: state.routeMemory?.route_memory_digest || null
    }),
    refresh: async () => {
      const caseId = localStorage.getItem(POINTER_KEY);
      if (caseId) await loadCase(caseId);
    },
    openWorkspace: setWorkspace
  });
  announce('core-ready');
}

boot().catch(error => { $('storageState').textContent = 'Local custody error'; console.error(error); });
