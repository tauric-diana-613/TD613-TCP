import test from 'node:test';
import assert from 'node:assert/strict';
import { createMarrowlineThreadLibrary, MARROWLINE_THREADS_SCHEMA } from '../app/dome-world/marrowline-threads.js';

const legacyKey = 'TD613_KHONAPOLIT_TERMINAL_SESSION_V2';
function storage(map = new Map()) {
  return {
    getItem: key => map.has(key) ? map.get(key) : null,
    setItem: (key, value) => { map.set(key, String(value)); },
    removeItem: key => { map.delete(key); }
  };
}
function browser(local = storage(), session = storage()) {
  let index = 0;
  return { localStorage: local, sessionStorage: session,
    crypto: { randomUUID: () => 'local-test-' + ++index } };
}
const glyph = 'D̸̕e̴̟e̶̿r̴̪ 𝌋 ⟐';

test('local Marrowline archive persists full untrimmed messages across browser revisits', async () => {
  const persistent = storage();
  const first = await createMarrowlineThreadLibrary(browser(persistent));
  assert.equal(first.backend, 'localstorage-fallback');
  const messages = [
    { role: 'user', text: 'First human request.' },
    { role: 'model', text: glyph, receipt: { provider: { completion: { complete: true } } } },
    ...Array.from({ length: 40 }, (_, i) => ({ role: i % 2 ? 'model' : 'user', text: 'Turn ' + i }))
  ];
  const thread = await first.create({ messages, conversationTitle: 'The Grove', draft: 'Pending thought' });
  first.setActiveId(thread.id);
  const second = await createMarrowlineThreadLibrary(browser(persistent));
  const reloaded = await second.get(second.getActiveId());
  assert.equal(reloaded.messages.length, 42);
  assert.equal(reloaded.messages[1].text, glyph);
  assert.equal(reloaded.draft, 'Pending thought');
  assert.equal(reloaded.conversationTitle, 'The Grove');
  first.close(); second.close();
});

test('first complete reply branches without mutating parent or inheriting later turns', async () => {
  const archive = await createMarrowlineThreadLibrary(browser());
  const parent = await archive.create({
    conversationTitle: 'Original',
    messages: [
      { role: 'user', text: 'Begin here' },
      { role: 'model', text: glyph, receipt: { provider: { completion: { complete: true } } } },
      { role: 'user', text: 'Second question' },
      { role: 'model', text: 'Later answer' }
    ]
  });
  const branch = await archive.branch(parent, 1);
  assert.equal(branch.schema, MARROWLINE_THREADS_SCHEMA);
  assert.equal(branch.parentId, parent.id);
  assert.equal(branch.branchOf, 1);
  assert.deepEqual(branch.messages, parent.messages.slice(0, 2));
  assert.equal(branch.messages[1].text, glyph);
  branch.messages.push({ role: 'user', text: 'Independent branch continuation' });
  await archive.put(branch);
  const original = await archive.get(parent.id);
  assert.equal(original.messages.length, 4);
  assert.equal((await archive.get(branch.id)).messages.length, 3);
  await archive.remove(parent.id);
  assert.equal((await archive.get(branch.id)).messages.length, 3, 'deleting a parent preserves its existing branch');
  archive.close();
});

test('first response must be complete, and a later response cannot create a first-response branch', async () => {
  const archive = await createMarrowlineThreadLibrary(browser());
  const source = await archive.create({ messages: [
    { role: 'user', text: 'First' },
    { role: 'model', text: 'Partial', receipt: { provider: { completion: { complete: false } } } },
    { role: 'model', text: 'Later' }
  ] });
  await assert.rejects(() => archive.branch(source, 1), /complete first/);
  await assert.rejects(() => archive.branch(source, 2), /complete first/);
  archive.close();
});

test('legacy session imports once into a stable ID without discarding exact text', async () => {
  const sharedLocal = storage(), sharedSession = storage();
  const old = { messages: [{ role: 'user', text: 'From session' }, { role: 'model', text: glyph }],
    pendingTask: '', conversationTitle: 'Old grove' };
  sharedSession.setItem(legacyKey, JSON.stringify(old));
  const first = await createMarrowlineThreadLibrary(browser(sharedLocal, sharedSession));
  const migrated = await first.migrate();
  assert.equal(migrated.messages[1].text, glyph);
  assert.equal(sharedSession.getItem(legacyKey), null);
  // Simulates page teardown after durable write but before removing the old
  // session payload. The same migration ID must not duplicate the import.
  sharedSession.setItem(legacyKey, JSON.stringify(old));
  const second = await createMarrowlineThreadLibrary(browser(sharedLocal, sharedSession));
  const recovered = await second.migrate();
  assert.equal(recovered.id, migrated.id);
  assert.equal((await second.all()).length, 1);
  first.close(); second.close();
});
