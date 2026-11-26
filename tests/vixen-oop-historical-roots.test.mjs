import {test} from 'node:test';
import assert from 'node:assert/strict';
import {resolveHistoricalEmCoordinates} from '../scripts/vixen-em-pinned-archive-qualifier.mjs';
test('missing historical source is an explicit availability HOLD',()=>{
 assert.throws(()=>resolveHistoricalEmCoordinates({}),/HELD_EM_OUT_OF_TREE_ARCHIVE_REQUIRED/);
});
