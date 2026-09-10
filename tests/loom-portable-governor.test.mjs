import test from 'node:test';
import assert from 'node:assert/strict';
import { createLoomPortableGovernor } from '../app/engine/loom-portable-governor.js';
import { compileLoomDemoScene } from '../app/dome-world/holonomy-loom/semantic-field.js';
import { compileDollhousePortableProjection, operateDollhousePortableProjection } from '../app/engine/dollhouse-portable-aia-roundtrip.js';

const setup = () => {
  const packet = compileLoomDemoScene(2);
  const projection = compileDollhousePortableProjection(packet);
  return { packet, session: createLoomPortableGovernor(packet), candidate: operateDollhousePortableProjection(projection, { operation: 'PROPOSE_ACTION', proposedAction: 'REST' }) };
};

test('portable governor enforces finite control and action support, retaining original through recovery', () => {
  const { session, candidate } = setup();
  const control = session.inspect().origin_control;
  assert.equal(session.receive(candidate).outcome, 'ADMITTED');
  const drift = structuredClone(candidate); drift.returned_control.governance.raw_release_allowed = true;
  const event = session.receive(drift);
  assert.equal(event.outcome, 'HELD');
  assert.deepEqual(event.revalidation.fadt.fibres[0].irreducible_gap, ['COPY_CHECKED_MESSAGE']);
  assert.equal(session.inspect().origin_control, control);
  assert.equal(session.receive(candidate).recovered, true);
  assert.equal(session.inspect().held_count, 1);
  assert.equal(session.inspect().action_executed, false);
  assert.equal(session.inspect().external_host_enforced, false);
  assert.throws(() => { event.revalidation.status = 'PRESENT_TO_HUMAN'; }, TypeError);
});

test('rest and close withhold even valid returns; resume requires a live resting session', () => {
  const { session, candidate } = setup(); session.rest();
  assert.equal(session.receive(candidate).outcome, 'HELD');
  assert.equal(session.inspect().status, 'REST');
  session.resume(); assert.equal(session.receive(candidate).outcome, 'ADMITTED');
  session.close(); session.resume();
  assert.equal(session.receive(candidate).outcome, 'HELD');
  assert.equal(session.inspect().status, 'CLOSED');
});

test('malformed, executable, oversized, stale and unsupported returns earn no admission', () => {
  const { session, candidate } = setup();
  const cyclic = {}; cyclic.self = cyclic;
  const accessor = {}; Object.defineProperty(accessor, 'schema', { enumerable: true, get() { throw new Error('MUST NOT EXECUTE'); } });
  const stale = operateDollhousePortableProjection(compileDollhousePortableProjection(compileLoomDemoScene(4)), { operation: 'EXPLAIN_STATE' });
  for (const input of [null, cyclic, accessor, { ...candidate, reported_missingness: ['x'.repeat(65000)] }, { ...candidate, proposed_action: 'DEPLOY' }, stale]) {
    assert.equal(session.receive(input).outcome, 'HELD');
  }
  assert.equal(session.inspect().admitted_count, 0);
});

test('event history is bounded, immutable and strictly monotonic after truncation', () => {
  const { session, candidate } = setup();
  for (let i = 0; i < 80; i++) session.receive(candidate);
  const snapshot = session.inspect();
  assert.equal(snapshot.events.length, 64);
  assert.equal(snapshot.events[0].ordinal, 17);
  assert.equal(snapshot.latest_event.ordinal, 80);
  assert.throws(() => snapshot.events.pop(), TypeError);
  assert.ok(!JSON.stringify(snapshot).includes('The glass seed stays'));
});

test('forged origin is refused at construction rather than becoming a policy', () => {
  const packet = structuredClone(compileLoomDemoScene(2));
  packet.analysis.release_boundary.raw_release_allowed = true;
  assert.throws(() => createLoomPortableGovernor(packet));
});
