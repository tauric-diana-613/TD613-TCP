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

test('any model reply branches without mutating parent or inheriting later turns', async () => {
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
  const firstBranch = await archive.branch(parent, 1);
  assert.equal(firstBranch.schema, MARROWLINE_THREADS_SCHEMA);
  assert.equal(firstBranch.parentId, parent.id);
  assert.equal(firstBranch.branchOf, 1);
  assert.equal(firstBranch.conversationTitle, 'Original', 'branch status is represented by parentId, never forced into the title');
  assert.deepEqual(firstBranch.messages, parent.messages.slice(0, 2));
  assert.equal(firstBranch.messages[1].text, glyph);

  const laterBranch = await archive.branch(parent, 3);
  assert.equal(laterBranch.branchOf, 3);
  assert.deepEqual(laterBranch.messages, parent.messages.slice(0, 4), 'later branch copies only through the selected model reply');

  laterBranch.messages.push({ role: 'user', text: 'Independent branch continuation' });
  await archive.put(laterBranch);
  const original = await archive.get(parent.id);
  assert.equal(original.messages.length, 4);
  assert.equal((await archive.get(laterBranch.id)).messages.length, 5);
  await archive.remove(parent.id);
  assert.equal((await archive.get(laterBranch.id)).messages.length, 5, 'deleting a parent preserves its existing branch');
  archive.close();
});

test('branching requires a real model reply but does not reject an observed incomplete reply', async () => {
  const archive = await createMarrowlineThreadLibrary(browser());
  const source = await archive.create({ messages: [
    { role: 'user', text: 'First' },
    { role: 'model', text: 'Partial', receipt: { provider: { completion: { complete: false } } } },
    { role: 'user', text: 'Second' },
    { role: 'model', text: 'Later' }
  ] });
  assert.equal((await archive.branch(source, 1)).branchOf, 1);
  assert.equal((await archive.branch(source, 3)).branchOf, 3);
  await assert.rejects(() => archive.branch(source, 2), /Marrowline reply/);
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

test('migration strips only the old generated branch suffix, preserving manually chosen branch subjects', async () => {
  const archive = await createMarrowlineThreadLibrary(browser());
  const parent = await archive.create({ conversationTitle: 'What the Ash Kept', messages: [{role:'user',text:'One'}, {role:'model',text:'Two'}] });
  const generated = await archive.create({ conversationTitle: 'What the Ash Kept · Branch', messages: [], }, { parentId: parent.id, branchOf: 1 });
  const authored = await archive.create({ conversationTitle: 'Studying a Branch', messages: [] }, { parentId: parent.id, branchOf: 1 });
  await archive.migrateLegacyBranchTitles();
  assert.equal((await archive.get(generated.id)).conversationTitle, 'What the Ash Kept');
  assert.equal((await archive.get(authored.id)).conversationTitle, 'Studying a Branch');
  archive.close();
});

test('only exact legacy auto-generated titles are retitled; operator labels and content survive', async () => {
  const archive = await createMarrowlineThreadLibrary(browser());
  const prompt = 'An anonymous archive receives two passages whose syntax and metaphors feel uncannily alike. The board declares authorship theft from resemblance alone. Design a cautious stylometric comparison with provenance, alternative explanations and limitations.';
  const oldTitle = 'An anonymous archive receives two passages whose syntax';
  const messages = [{role:'user',text:prompt}, {role:'model',text:glyph,receipt:{provider:{completion:{complete:true}}}}];
  const old = await archive.create({messages,conversationTitle:oldTitle});
  const manual = await archive.create({messages,conversationTitle:'Archive Witnesses',titleSource:'operator'});
  const renamed = await archive.create({messages,conversationTitle:'My Own Label'});
  const branch = await archive.branch(old,1);
  const longTopic = await archive.create({messages:[{role:'user',text:
    'I underestimated the contribution was in how directly the research changed the design.'}],
    conversationTitle:'I Underestimated the Contribution Was in How Directly',
    titleSource:'local-topic-v2'});
  const clippedQuestion = await archive.create({messages:[
      {role:'user',text:'What does this photo mean?'},
      {role:'model',text:glyph,receipt:{provider:{completion:{complete:true}}}}
    ],
    conversationTitle:'This Photo Mean',
    titleSource:'local-topic-v3-after-return'});
  assert.equal(await archive.migrateLegacyGeneratedTitles(),4,
    'matching legacy titles, clipped natural questions, and previously generated oversized topic titles are repaired');
  const repaired = await archive.get(old.id);
  assert.equal(repaired.conversationTitle,'Stylometric Comparison with Provenance');
  assert.equal(repaired.titleSource,'local-topic-v3-after-return');
  assert.deepEqual(repaired.messages,messages,'retitling never rewrites the saved transcript or receipt');
  assert.equal((await archive.get(branch.id)).conversationTitle,repaired.conversationTitle);
  const shortened = await archive.get(longTopic.id);
  assert.ok(shortened.conversationTitle.split(/\s+/u).length <= 5,
    'existing generated topic title is compressed to five words on next load');
  assert.notEqual(shortened.conversationTitle,'I Underestimated the Contribution Was in How Directly');
  assert.equal((await archive.get(manual.id)).conversationTitle,'Archive Witnesses');
  assert.equal((await archive.get(renamed.id)).conversationTitle,'My Own Label');
  assert.equal((await archive.get(clippedQuestion.id)).conversationTitle,'What Does This Photo Mean',
    'existing generated question titles recover the interrogative and auxiliary on next load');
  assert.equal(await archive.migrateLegacyGeneratedTitles(),0,'migration is one-time and idempotent');
  archive.close();
});



test('speaking-grove placeholder is never durable: empty phantoms are pruned and interrupted work becomes untitled', async () => {
  const archive = await createMarrowlineThreadLibrary(browser());
  const phantom = await archive.create({ conversationTitle: 'The speaking grove' });
  const draft = await archive.create({ draft: 'keep this draft', conversationTitle: 'The speaking grove' });
  const interrupted = await archive.create({
    messages: [{ role: 'user', text: 'Preserve this interrupted task.' }],
    pendingTask: 'Preserve this interrupted task.',
    conversationTitle: 'The speaking grove'
  });
  const completed = await archive.create({
    messages: [
      { role: 'user', text: 'Explain the archive threshold carefully.' },
      { role: 'model', text: glyph }
    ],
    conversationTitle: 'The speaking grove'
  });
  const renamed = await archive.create({ conversationTitle: 'Named Empty Thread', titleSource: 'operator' });

  assert.equal((await archive.all()).length, 5);
  assert.equal(await archive.pruneEmptyGeneratedThreads(), 1);
  assert.equal(await archive.get(phantom.id), null);

  const repairedDraft = await archive.get(draft.id);
  assert.equal(repairedDraft.draft, 'keep this draft');
  assert.equal(repairedDraft.conversationTitle, '');
  assert.equal(repairedDraft.titleSource, 'pending-return');

  const repairedInterrupted = await archive.get(interrupted.id);
  assert.equal(repairedInterrupted.conversationTitle, '');
  assert.equal(repairedInterrupted.titleSource, 'pending-return');

  assert.equal(await archive.migrateLegacyGeneratedTitles(), 1);
  const repairedCompleted = await archive.get(completed.id);
  assert.notEqual(repairedCompleted.conversationTitle, 'The speaking grove');
  assert.ok(repairedCompleted.conversationTitle.split(/\s+/u).length <= 5);
  assert.equal(repairedCompleted.titleSource, 'local-topic-v3-after-return');

  assert.equal((await archive.get(renamed.id)).conversationTitle, 'Named Empty Thread');
  archive.close();
});


test('read-only conversation access preserves activity order while meaningful edits advance recency', async () => {
  const archive = await createMarrowlineThreadLibrary(browser());
  const waitTick = () => new Promise(resolve => setTimeout(resolve, 4));
  const first = await archive.create({ conversationTitle: 'First', messages: [{ role: 'user', text: 'First task' }] });
  await waitTick();
  const second = await archive.create({ conversationTitle: 'Second', messages: [{ role: 'user', text: 'Second task' }] });
  await waitTick();
  const third = await archive.create({ conversationTitle: 'Third', messages: [{ role: 'user', text: 'Third task' }] });

  assert.deepEqual((await archive.all()).map(thread => thread.id), [third.id, second.id, first.id],
    'archive starts newest meaningful activity first');

  const openedFirst = await archive.get(first.id);
  await waitTick();
  const readOnlySave = await archive.put({ ...openedFirst });
  assert.equal(readOnlySave.updatedAt, openedFirst.updatedAt,
    'opening then leaving an unchanged conversation must not rewrite its activity timestamp');
  assert.deepEqual((await archive.all()).map(thread => thread.id), [third.id, second.id, first.id],
    'read-only navigation must not move an older conversation to the top');

  await waitTick();
  const editedFirst = await archive.put({ ...openedFirst, draft: 'Meaningful new draft activity' });
  assert.notEqual(editedFirst.updatedAt, openedFirst.updatedAt,
    'a durable draft mutation advances the activity timestamp');
  assert.equal((await archive.all())[0].id, first.id,
    'meaningful conversation activity moves the thread to the top');
  archive.close();
});
