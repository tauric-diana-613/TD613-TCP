import test from 'node:test';
import assert from 'node:assert/strict';
import { parseCodexEvents } from './baseline/scripts/experiment-b-codex-exec-adapter.mjs';
import { ControlledArchiveIntake, createSyntheticZipArchive, verifyAuthenticatedPhysicalArchiveMember } from './baseline/docs/research/experiment-b-preflight/02_four_arm_harness/controlled-archive-intake.mjs';

// Reproductions against unmodified reviewed source. Every event and byte is invented.
const start = { type: 'thread.started', thread_id: 'SYNTHETIC-ONLY' };
const done = { type: 'turn.completed', usage: { input_tokens: 1, output_tokens: 1 } };
const message = text => ({ type: 'item.completed', item: { type: 'agent_message', text } });
const jsonl = events => events.map(JSON.stringify).join('\n');

test('SYNTHETIC: parser merges commentary and final without terminal identity', () => {
  assert.equal(parseCodexEvents(jsonl([start, message('commentary'), message('final'), done])).output, 'commentary\nfinal');
});
test('SYNTHETIC: incomplete disallowed tool start survives parser and completed-only filter', () => {
  const events = [start, { type: 'item.started', item: { type: 'command_execution', id: 'invented' } }, message('final'), done];
  assert.equal(parseCodexEvents(jsonl(events)).output, 'final');
  const activities = events.filter(e => e.type === 'item.completed' && !['agent_message', 'reasoning'].includes(e.item?.type));
  assert.equal(activities.length, 0);
});
test('SYNTHETIC: messages after terminal completion are included', () => {
  assert.equal(parseCodexEvents(jsonl([start, message('final'), done, message('late')])).output, 'final\nlate');
});
test('SYNTHETIC: oversize JSONL is refused without accepting a prefix', () => {
  const text = jsonl([start, message('x'.repeat(16 * 1024 * 1024)), done]);
  assert.throws(() => parseCodexEvents(text), /MISSING_OR_OVERSIZED/);
});
test('SYNTHETIC: genuine ZIP parsing does not grant physical member authority', () => {
  const intake = new ControlledArchiveIntake({ syntheticMode: true });
  const zipBuffer = createSyntheticZipArchive([{ name: 'invented.txt', data: 'invented only' }]);
  const receipt = intake.admitArchive({ zipBuffer }, { trustedSyntheticFixture: true });
  assert.equal(receipt.physical_io_executed, false);
  assert.equal(verifyAuthenticatedPhysicalArchiveMember(receipt.documents[0]), false);
  assert.equal(verifyAuthenticatedPhysicalArchiveMember(JSON.parse(JSON.stringify(receipt.documents[0]))), false);
});
test('SYNTHETIC: physical path denied before I/O and no grant minted', () => {
  const intake = new ControlledArchiveIntake({ syntheticMode: false, allowProtectedAdmission: false });
  assert.throws(() => intake.admitArchive('SYNTHETIC-NONEXISTENT.zip'), /PHYSICAL_PATH_BLOCKED/);
});
