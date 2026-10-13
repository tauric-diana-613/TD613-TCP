import { createPortableFlowcoreControl } from './dollhouse-atlas-fadt.js';
import { revalidateDollhousePortableReturn } from './dollhouse-portable-aia-roundtrip.js';

const freeze = value => {
  if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
};

// JSON-only intake; reject accessors, cycles, sparse arrays and excessive work before admission.
function copy(value, depth = 0, budget = { left: 20000 }) {
  if (--budget.left < 0 || depth > 40) throw new TypeError('Return exceeds the bounded JSON budget.');
  if (value === null || ['boolean', 'string'].includes(typeof value)) return value;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (!value || typeof value !== 'object') throw new TypeError('Return must contain JSON data only.');
  if (![Object.prototype, Array.prototype, null].includes(Object.getPrototypeOf(value))) throw new TypeError('Return requires plain JSON data.');
  const keys = Object.keys(value);
  if (Array.isArray(value) && (keys.length !== value.length || keys.some((key, i) => key !== String(i)))) throw new TypeError('Return arrays must be dense.');
  const entries = keys.map(key => {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (!Object.hasOwn(descriptor, 'value')) throw new TypeError('Return accessors are forbidden.');
    return [key, copy(descriptor.value, depth + 1, budget)];
  });
  return Array.isArray(value) ? entries.map(([, item]) => item) : Object.fromEntries(entries);
}

/** A local admission boundary over the current fixture-closed Loom origin schema.
 * Every receive executes Atlas/FADT checks before the session admits a result.
 * This module has no provider transport or consequential action executor.
 */
export function createLoomPortableGovernor(packet) {
  const origin = freeze(copy(packet));
  const originControl = createPortableFlowcoreControl(origin); // Full canonical admission.
  let status = 'ACTIVE', revision = 0, admitted = 0, held = 0;
  const events = [];
  function record(event) {
    const result = freeze({ ordinal: ++revision, ...event,
      source_scene: origin.scene.id, source_revision: origin.source.revision,
      origin_replay_checksum: origin.receipt.checksum, checksum_is_authentication: false,
      action_executed: false, release_authority: false });
    events.push(result); if (events.length > 64) events.shift();
    return result;
  }
  const inspect = () => freeze({ schema: 'td613.loom.portable-governor/v0.1',
    scope: 'LOOM_LOCAL_PORTABLE_SESSION', origin_kind: 'CANONICAL_FICTIONAL_SCENE',
    status, revision, origin_control: originControl,
    latest_event: events.at(-1) || null, events: [...events],
    admitted_count: admitted, held_count: held,
    external_host_enforced: false, action_executed: false });
  return Object.freeze({
    receive(candidate) {
      const prior = status;
      let result = null, reasons = [];
      try {
        if (status === 'REST' || status === 'CLOSED') throw new TypeError(`SESSION_${status}`);
        const input = copy(candidate);
        if (JSON.stringify(input).length > 64000) throw new TypeError('Return exceeds 64,000 characters.');
        result = revalidateDollhousePortableReturn(origin, input);
        reasons = result.reason_codes;
      } catch (error) { reasons = [String(error.message).slice(0, 240)]; }
      const allowed = result?.status === 'PRESENT_TO_HUMAN';
      if (allowed) { status = 'ACTIVE'; admitted++; }
      else { held++; if (!['REST', 'CLOSED'].includes(status)) status = 'HELD'; }
      return record({ kind: 'RETURN', outcome: allowed ? 'ADMITTED' : 'HELD',
        recovered: allowed && prior === 'HELD', reasons, revalidation: result });
    },
    rest() { if (status !== 'CLOSED') { status = 'REST'; record({ kind: 'REST', outcome: 'REST', reasons: [], revalidation: null }); } return inspect(); },
    resume() { if (status === 'REST') { status = 'ACTIVE'; record({ kind: 'RESUME', outcome: 'ACTIVE', reasons: [], revalidation: null }); } return inspect(); },
    close() { if (status !== 'CLOSED') { status = 'CLOSED'; record({ kind: 'CLOSE', outcome: 'CLOSED', reasons: [], revalidation: null }); } return inspect(); },
    inspect
  });
}
