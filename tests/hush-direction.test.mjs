import assert from 'assert';
import { resolveHushDirection } from '../app/engine/hush-direction.js';

const explicit = resolveHushDirection({ direction: 'jagged-to-coherent' });
assert.equal(explicit.direction, 'jagged-to-coherent');
assert(explicit.weights.coherence > explicit.weights.movement);

const rough = resolveHushDirection({ sourceText: 'rough note / maybe normal / still logging order', mask: { id: 'phase24-clear-record' } });
assert.equal(rough.direction, 'jagged-to-coherent');

const clear = resolveHushDirection({ sourceText: 'FILE-72 exported at the same minute.', mask: { id: 'phase22-jagged-record' } });
assert.equal(clear.direction, 'coherent-to-jagged');

const fallback = resolveHushDirection({ sourceText: 'Plain note.', mask: { id: 'plain-witness' } });
assert.equal(fallback.direction, 'mask-to-mask');

console.log('hush-direction tests passed');
