import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import vm from 'node:vm';
import { evaluateApertureRepairCandidate } from '../app/engine/hush-aperture-repair-pass.js';

const source = readFileSync(join(process.cwd(), 'app/hush-mask-native-layout-runtime.js'), 'utf8');
assert.match(source, /v2-special-mask-lanes/);
assert.match(source, /repairLuz/);
assert.match(source, /repairCryo/);
assert.match(source, /repairRex/);

const context = { window: {}, document: { body: { dataset: {} }, readyState: 'complete', addEventListener() {}, getElementById() { return null; } }, Event: class Event {} };
vm.runInNewContext(`${source}\nwindow.__TEST_API__ = { repairMaskNativeLayout };`, context);
const api = context.window.__TEST_API__;

const luzChecklist = '1. Identify the file.\n2. Explain the mismatch.\n3. Note the custody issue.\n4. Summarize the result.';
const luzFixed = api.repairMaskNativeLayout(luzChecklist, 'plain source text', 'indexed-anchor-blocks');
assert.match(luzFixed, /Index 1 —/);
assert.match(luzFixed, /Index 2 —/);
assert.doesNotMatch(luzFixed, /^\s*1\./m);
assert.ok((luzFixed.match(/\n\s*\n/g) || []).length >= 1);

const cryoLong = 'Status: held. The record remains unresolved. The source still matters. Do not soften this. Keep the handoff short. Stop here.';
const cryoFixed = api.repairMaskNativeLayout(cryoLong, 'one\n\ntwo\n\nthree', 'short-handoff-paragraphs');
assert.ok((cryoFixed.match(/\n\s*\n/g) || []).length >= 1);
assert.ok(cryoFixed.split(/\n\s*\n/).every((block) => block.split(/\s+/).length <= 24));

const rexLong = 'Break one. Break two. Break three. Break four. Break five. Break six.';
const rexFixed = api.repairMaskNativeLayout(rexLong, 'source text', 'bounded-fracture-lines');
assert.ok((rexFixed.match(/\n\s*\n/g) || []).length >= 2);

const luzGeneric = evaluateApertureRepairCandidate({ id: 'luz-list', text: luzChecklist }, 'The file remains unresolved.', { mask: { id: 'luz-index', label: 'Luz of the Index' } });
const luzNative = evaluateApertureRepairCandidate({ id: 'luz-archive', text: 'Provisional custody anchor: the file remains unresolved.\n\nReturn to item one: the later record reframes the index.' }, 'The file remains unresolved.', { mask: { id: 'luz-index', label: 'Luz of the Index' } });
assert.ok(luzGeneric.warnings.includes('aperture-luz-checklist-demotion'));
assert.ok(luzGeneric.penalty > luzNative.penalty);

console.log('hush-special-mask-layout-runtime: ok');
