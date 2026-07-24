export const ASH_A8_DRAFT_DURABILITY_VERSION = 'td613.ash.a8-draft-durability/v0.1';

const host = globalThis.window;
const doc = globalThis.document;
const POINTER_KEY = 'td613.ash-keep.current-case';
const OBJECT_IDS = Object.freeze([
  'ashA8ObjectName',
  'ashA8ObjectType',
  'ashA8ObjectRoom',
  'ashA8ObjectKnown',
  'ashA8ObjectUncertain',
  'ashA8ObjectEvidence',
  'ashA8ObjectSource',
  'ashA8ObjectNotes'
]);
const RELATION_IDS = Object.freeze([
  'ashA8RelationFrom',
  'ashA8RelationTo',
  'ashA8RelationType',
  'ashA8RelationEvidence',
  'ashA8RelationUncertain',
  'ashA8RelationNotes'
]);
const GROUPS = Object.freeze({ object:OBJECT_IDS, relation:RELATION_IDS });
const groupForId = new Map(Object.entries(GROUPS).flatMap(([group, ids]) => ids.map(id => [id, group])));
const drafts = new Map();
let restoreQueued = false;

function caseKey() {
  return host?.localStorage?.getItem?.(POINTER_KEY) || null;
}

function currentRecord(create = false) {
  const key = caseKey();
  if (!key) return null;
  if (!drafts.has(key) && create) drafts.set(key, { object:new Map(), relation:new Map() });
  return drafts.get(key) || null;
}

function captureControl(control) {
  const group = groupForId.get(control?.id);
  if (!group) return false;
  const record = currentRecord(true);
  if (!record) return false;
  record[group].set(control.id, Object.freeze({
    value:String(control.value ?? ''),
    checked:'checked' in control ? Boolean(control.checked) : null
  }));
  return true;
}

function captureGroup(group) {
  for (const id of GROUPS[group] || []) {
    const control = doc?.getElementById?.(id);
    if (control) captureControl(control);
  }
}

function restoreDrafts() {
  restoreQueued = false;
  const record = currentRecord(false);
  if (!record) return false;
  let restored = false;
  for (const group of Object.keys(GROUPS)) {
    for (const [id, saved] of record[group]) {
      const control = doc?.getElementById?.(id);
      if (!control?.closest?.('#ashA8RelationWorkshop')) continue;
      if (control.tagName === 'SELECT' && ![...control.options].some(option => option.value === saved.value)) continue;
      control.value = saved.value;
      if (saved.checked !== null && 'checked' in control) control.checked = saved.checked;
      control.dispatchEvent(new Event('input', { bubbles:true }));
      control.dispatchEvent(new Event('change', { bubbles:true }));
      restored = true;
    }
  }
  doc.documentElement.dataset.ashA8DraftDurability = restored ? 'RESTORED' : 'READY';
  return restored;
}

function queueRestore() {
  if (restoreQueued) return;
  restoreQueued = true;
  requestAnimationFrame(() => requestAnimationFrame(restoreDrafts));
}

function clearGroup(group) {
  const key = caseKey();
  const record = key ? drafts.get(key) : null;
  if (!record) return;
  record[group]?.clear?.();
  if (![...record.object.values(), ...record.relation.values()].length) drafts.delete(key);
}

function clearAll() {
  drafts.clear();
  restoreQueued = false;
  if (doc?.documentElement) doc.documentElement.dataset.ashA8DraftDurability = 'CLEARED';
}

function captureInput(event) {
  captureControl(event.target);
}

function captureCommit(event) {
  if (event.target?.closest?.('#ashA8CommitObject')) captureGroup('object');
  if (event.target?.closest?.('#ashA8CommitRelation')) captureGroup('relation');
}

function reconcileWorldAnswer(event) {
  const message = String(event.detail?.message || '');
  if (message.startsWith('Ash delegated “')) clearGroup('object');
  if (message.startsWith('Ash delegated one directed relation')) clearGroup('relation');
}

function install() {
  if (!host || !doc || host.__td613AshA8DraftDurability) return false;
  doc.addEventListener('input', captureInput, true);
  doc.addEventListener('change', captureInput, true);
  doc.addEventListener('click', captureCommit, true);
  host.addEventListener('td613:ash:a8-recompiled', queueRestore);
  host.addEventListener('td613:ash:ux-workspace-opened', event => {
    if (event.detail?.workspace === 'map') queueRestore();
  });
  host.addEventListener('td613:ash:a8-world-answer', reconcileWorldAnswer);
  for (const type of ['case-closed', 'case-created', 'profile-demo-hydrated']) {
    host.addEventListener(`td613:ash:${type}`, clearAll);
  }
  host.__td613AshA8DraftDurability = Object.freeze({
    version:ASH_A8_DRAFT_DURABILITY_VERSION,
    restore:restoreDrafts,
    capture:() => { captureGroup('object'); captureGroup('relation'); },
    storage:'MEMORY_ONLY',
    map_authority_changed:false,
    custody_authority_changed:false,
    release_authority_changed:false,
    human_closure_required:true
  });
  doc.documentElement.dataset.ashA8DraftDurability = ASH_A8_DRAFT_DURABILITY_VERSION;
  return true;
}

install();
