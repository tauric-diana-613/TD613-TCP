import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { evaluateApertureRepairCandidate } from '../app/engine/hush-aperture-repair-pass.js';
import { repairMaskNativeLayout } from '../app/hush-mask-native-layout-runtime.js';

const source = readFileSync(join(process.cwd(), 'app/hush-mask-native-layout-runtime.js'), 'utf8');
assert.match(source, /v2-special-mask-lanes/);
assert.match(source, /repairLuz/);
assert.match(source, /repairCryo/);
assert.match(source, /repairRex/);

const luzChecklist = '1) Identify the file\n2) Explain the mismatch\n3) Note the custody issue\n4) Summarize the result';
const luzFixed = repairMaskNativeLayout(luzChecklist, 'plain source text', 'indexed-anchor-blocks');
assert.match(luzFixed, /Index 1 —/);
assert.ok((luzFixed.match(/\n\s*\n/g) || []).length >= 1, luzFixed);
assert.ok(!/^\s*(?:\d+[.)]|[-*•])\s+/m.test(luzFixed), luzFixed);

const cryoLong = 'Status: held. The record remains unresolved. The source still matters. Do not soften this. Keep the handoff short. Stop here.';
const cryoFixed = repairMaskNativeLayout(cryoLong, 'one\n\ntwo\n\nthree', 'short-handoff-paragraphs');
assert.ok((cryoFixed.match(/\n\s*\n/g) || []).length >= 1, cryoFixed);
assert.ok(cryoFixed.length < cryoLong.length + 20);

const rexLong = 'Break one. Break two. Break three. Break four. Break five. Break six.';
const rexFixed = repairMaskNativeLayout(rexLong, 'source text', 'bounded-fracture-lines');
assert.ok((rexFixed.match(/\n\s*\n/g) || []).length >= 2, rexFixed);

const luzGeneric = evaluateApertureRepairCandidate({ id: 'luz-list', text: luzChecklist }, 'The file remains unresolved.', { mask: { id: 'luz-index', label: 'Luz of the Index' } });
const luzNative = evaluateApertureRepairCandidate({ id: 'luz-archive', text: 'Provisional custody anchor: unresolved record remains in the stack.\n\nReturn to item one: the later record reframes the index.' }, 'The file remains unresolved.', { mask: { id: 'luz-index', label: 'Luz of the Index' } });
assert.ok(luzGeneric.warnings.includes('luz-checklist-demotion'), JSON.stringify(luzGeneric));
assert.equal(luzNative.warnings.includes('luz-checklist-demotion'), false, JSON.stringify(luzNative));
assert.equal(luzNative.luz.luzNativeSignal, true, JSON.stringify(luzNative));

console.log('hush-special-mask-layout-runtime: ok');
