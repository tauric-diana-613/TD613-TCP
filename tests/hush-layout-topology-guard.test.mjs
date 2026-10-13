import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const guard = readFileSync(join(root, 'app/hush-layout-topology-guard.js'), 'utf8');
const compare = readFileSync(join(root, 'app/hush-compare-layout-custody.js'), 'utf8');
const runtime = readFileSync(join(root, 'app/hush-mask-native-layout-runtime.js'), 'utf8');

assert.match(compare, /hush-layout-topology-guard\.js\?v=202607052150|hush-layout-topology-guard\.js\?v=202607020735/);
assert.match(compare, /hush-aperture-repair-runtime\.js/);
assert.match(compare, /hush-mask-native-layout-runtime\.js/);
assert.match(guard, /repairOutputLayout/);
assert.match(guard, /repairLiveOutput/);
assert.match(runtime, /repairMaskNativeLayout/);

console.log('Hush layout topology guard: PASS');
