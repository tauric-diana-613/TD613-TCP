import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = path => fs.readFileSync(path, 'utf8');
const module = read('app/dome-world/ash-map-labels.js');
const core = read('app/dome-world/ash-keep.js');
const controls = read('app/dome-world/ash-case-controls.js');
const html = read('app/dome-world/ash-keep.html');
const delivery = read('app/dome-world/ash-keep-source.html');

assert.equal(delivery, html, 'Static Ash Keep delivery source must remain byte-identical to the canonical document.');
assert.match(controls, /import '\.\/ash-map-labels\.js'/, 'The case-control composition must retain the map registry layer.');
assert.match(module, /ASH_OBJECT_REGISTRY_VERSION = 'td613\.ash-keep\.object-registry\/v1\.0'/);
assert.match(module, /id="ashObjectRegistryTitle">Object Registry<\/h4>/);
assert.match(module, /inspector\.insertBefore\(registry, notes\)/, 'Object Registry must remain directly above Research Notes.');
assert.match(module, /role="listbox" aria-label="Case Map objects"/);
assert.match(module, /data-object-index/);
assert.match(module, /pointerover/);
assert.match(module, /pointerup/);
assert.match(module, /scrollRegistryTo\(record\.index\)/);
assert.match(module, /scrollIntoView\(\{/);
assert.match(module, /classList\.toggle\('is-active'/);
assert.match(module, /classList\.add\('is-returned'\)/);
assert.match(module, /label_mode: 'overlay-only'/);
assert.match(module, /dataset\.ashMapLabelMode = 'overlay-only'/);
assert.match(module, /state\.awaitingLabelRecord/);
assert.match(module, /state\.suppressedLabelCount \+= 1/);
assert.match(module, /if \(isNodeLabel\(this\)\)[\s\S]*return undefined;/, 'Legacy desktop node labels must be intercepted before canvas paint.');
assert.match(module, /original\.fillText\.call\(this, String\(node\.index\)/, 'Stable map numbers must remain canvas-native.');
assert.match(module, /Hover or tap an object to trace its node\. Click a node to return here\./);
assert.match(module, /max-height:clamp\(190px,34vh,420px\)/, 'Object Registry must remain a bounded scroll lane.');
assert.match(module, /@media\(max-width:900px\)/);
assert.match(module, /@media\(prefers-reduced-motion:reduce\)/);
assert.doesNotMatch(module, /requestAnimationFrame\(/, 'Registry must reuse Ash Keep scheduling rather than adding an animation loop.');
assert.equal((core.match(/requestAnimationFrame\(/g) || []).length, 1, 'Ash Keep must retain one visible-canvas scheduler.');
assert.match(core, /state\.layout\.width > 680/, 'The registry layer must continue to suppress the legacy desktop label path until the core renderer is refactored.');
assert.match(html, /Research Notes · off by default/);

console.log('ash-keep-map-object-registry.test.mjs passed');
