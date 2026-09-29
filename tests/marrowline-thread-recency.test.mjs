import test from 'node:test';
import assert from 'node:assert/strict';
import { createMarrowlineThreadLibrary } from '../app/dome-world/marrowline-threads.js';

function storage(map = new Map()) {
  return {
    getItem: key => map.has(key) ? map.get(key) : null,
    setItem: (key, value) => { map.set(key, String(value)); },
    removeItem: key => { map.delete(key); }
  };
}

function browser() {
  let index = 0;
  return {
    localStorage: storage(),
    sessionStorage: storage(),
    crypto: { randomUUID: () => 'recency-test-' + ++index }
  };
}

test('read-only thread navigation preserves newest-activity ordering', async () => {
  const archive = await createMarrowlineThreadLibrary(browser());
  const tick = () => new Promise(resolve => setTimeout(resolve, 4));

  const first = await archive.create({
    conversationTitle: 'First',
    messages: [{ role: 'user', text: 'First task' }]
  });
  await tick();
  const second = await archive.create({
    conversationTitle: 'Second',
    messages: [{ role: 'user', text: 'Second task' }]
  });
  await tick();
  const third = await archive.create({
    conversationTitle: 'Third',
    messages: [{ role: 'user', text: 'Third task' }]
  });

  assert.deepEqual((await archive.all()).map(thread => thread.id), [third.id, second.id, first.id]);

  const openedFirst = await archive.get(first.id);
  await tick();
  const unchanged = await archive.put({ ...openedFirst });
  assert.equal(unchanged.updatedAt, openedFirst.updatedAt,
    'opening/leaving an unchanged thread cannot rewrite its activity timestamp');
  assert.deepEqual((await archive.all()).map(thread => thread.id), [third.id, second.id, first.id],
    'a passive read cannot move an older thread to the top');

  await tick();
  const edited = await archive.put({ ...openedFirst, draft: 'Meaningful new draft activity' });
  assert.notEqual(edited.updatedAt, openedFirst.updatedAt);
  assert.equal((await archive.all())[0].id, first.id,
    'meaningful persisted activity still advances thread recency');

  archive.close();
});
