import { FINITE_CHANNEL_SCHEMA, freezeFinite } from './observer-channel.js';

const channel = (id, label, missing = false) => ({ id, label, capture: { control: 'CAPTURED', protected: missing ? 'MISSING' : 'CAPTURED' } });
const row = (id, secret, control, protectedTrace, extras = {}) => ({ id, weight: 1, secret,
  baseline: null, auxiliary: null, permitted: 'done', expected: 'done',
  control: { answer: 'done', trace: control }, protected: { answer: 'done', trace: protectedTrace }, ...extras });
const model = (id, title, question, lesson, channels, rows) => ({ schema: FINITE_CHANNEL_SCHEMA,
  evidence_class: 'SYNTHETIC_ENUMERATED', id, title, question, lesson, channels, rows });
const bits = [0, 1];

export const OBSERVER_CASES = freezeFinite([
  model('baseline', 'Already known', 'Can zero extra disclosure hide a secret that is already public?',
    'The observer already knows the bit. Removing it from the new reply adds no protection against that observer.',
    [channel('reply', 'Reply')], bits.map(h => row(`h${h}`, h, { reply: h }, { reply: 'done' }, { baseline: h, permitted: h }))),
  model('length', 'The length gives it away', 'Can the right answer still reveal the secret through its size?',
    'Both routes answer correctly. The original length distinguishes the bit; fixed length removes that channel in this model only.',
    [channel('reply', 'Reply'), channel('length', 'Response length')],
    bits.map(h => row(`h${h}`, h, { reply: 'done', length: 100 + h }, { reply: 'done', length: 101 }))),
  model('parity', 'Three clues together', 'What can three observers learn that every pair misses?',
    'Each clue and every pair hide the bit. All three reveal it. Select different views to see where the disclosure appears.',
    [channel('first', 'First clue'), channel('second', 'Second clue'), channel('third', 'Third clue')],
    bits.flatMap(x => bits.flatMap(y => bits.map(z => row(`${x}${y}${z}`, x ^ y ^ z,
      { first: x, second: y, third: z }, { first: x, second: y, third: 0 }))))),
  model('redundancy', 'A misleading negative score', 'Can a negative joining score coexist with complete disclosure?',
    'Two copies reveal the same bit. The signed excess is negative because the information overlaps, not because the bit is private.',
    [channel('first', 'First copy'), channel('second', 'Second copy')],
    bits.map(h => row(`h${h}`, h, { first: h, second: h }, { first: h, second: h }))),
  model('missing', 'An unrecorded channel', 'What if the audit sees the reply but misses the error code?',
    'A missing error channel cannot be filled with zero leakage. Only the captured subview can be calculated; the combined claim stays held.',
    [channel('reply', 'Reply'), channel('error', 'Error code', true)],
    bits.map(h => row(`h${h}`, h, { reply: 'done', error: h }, { reply: 'done' }))),
  model('utility', 'The task needs the bit', 'What if the authorized task itself requires revealing the protected fact?',
    'Hiding the bit lowers authorized-task accuracy. A permitted projection is not automatically prior observer knowledge.',
    [channel('reply', 'Reply')], bits.map(h => row(`h${h}`, h, {}, {}, {
      permitted: h, expected: h, control: { answer: h, trace: { reply: h } },
      protected: { answer: 0, trace: { reply: 0 } }
    })))
]);

export function getObserverCase(id) {
  const found = OBSERVER_CASES.find(item => item.id === id);
  if (!found) throw new RangeError('Choose a declared synthetic case.');
  return found;
}
