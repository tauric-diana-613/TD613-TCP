import assert from 'node:assert/strict';
import fs from 'node:fs';

const field = fs.readFileSync('app/dome-world/ash-flowcore-pedagogy-field.js', 'utf8');
const css = fs.readFileSync('app/dome-world/ash-flowcore-pedagogy-field.css', 'utf8');
const portal = fs.readFileSync('app/dome-world/ash-flowcore-ingress-portal.js', 'utf8');
const boundary = fs.readFileSync('app/dome-world/ash-session-boundary.js', 'utf8');
const ingressSpacing = fs.readFileSync('app/dome-world/ash-ingress-copy-spacing.js', 'utf8');
const bridge = fs.readFileSync('app/dome-world/ash-workspace-bridge.js', 'utf8');
const closeRepair = fs.readFileSync('app/dome-world/ash-case-close-repair.js', 'utf8');

assert.match(field, /renderPedagogueScene, renderPedagogueStaticFrame/);
assert.match(field, /td613\.ash\.flowcore-pedagogy-field\/v0\.2-consequence-topology-syntax-closed/);
for (const phase of ['NOTICE','ACT','WORLD_ANSWERS','NAME','REST']) assert.match(field, new RegExp(`id:'${phase}'`));
for (const glyph of ['à','上','出','米','𝄐']) assert.ok(field.includes(glyph), `Flow-Core field omitted ${glyph}`);
for (const label of ['RAW BYTES DO NOT CROSS','REFERENCE','≠ ARTIFACT','CASE MAP RELATION FIELD','missingness stays visible']) assert.ok(field.includes(label), `Flow-Core field omitted ${label}`);
for (const channel of ['glyph','motion','shape','language','inspection']) assert.ok(field.includes(`<span>${channel}</span>`), `Flow-Core field omitted ${channel} channel`);
assert.match(field, /artifact_required:false/);
assert.match(field, /EXPLICIT_PLAY_GESTURE/);
assert.match(field, /td613:ash:explanation-frame/);
assert.match(field, /STATIC_COMPLETE/);
assert.match(field, /const playing = options\.playing \?\? bounded > 0/);
assert.doesNotMatch(field, /playing:nextPhase\s*>/);
assert.doesNotMatch(field, /setInterval\s*\(/);
assert.doesNotMatch(field, /requestAnimationFrame\s*\(/);

assert.match(css, /\.ash-ux-motion-track\{display:none!important\}/);
assert.match(css, /data-flowcore-phase="0"/);
assert.match(css, /data-flowcore-phase="4"/);
assert.match(css, /prefers-reduced-motion:reduce/);
assert.doesNotMatch(css, /animation:[^;}]*infinite/);

assert.match(portal, /v0\.2-single-visible-field-styled/);
assert.match(portal, /getElementById\('guidedLaunchPromise'\)/);
assert.match(portal, /dataset\.aiaPlay = ''/);
assert.match(portal, /classList\.add\('ash-flowcore-field--proxy'\)/);
assert.match(portal, /proxyField\.hidden = true/);
assert.match(portal, /proxyField\.inert = true/);
assert.match(portal, /stripDuplicateIds\(proxyField\)/);
assert.match(portal, /ingress\.replaceChildren\(visibleField\)/);
assert.match(portal, /visibleField\.dataset\.flowcoreHost = 'aia'/);
assert.match(portal, /duplicate_visible_fields/);
assert.match(portal, /\.guided-launch-promise\.ash-flowcore-ingress-host/);
assert.doesNotMatch(portal, /setInterval\s*\(|requestAnimationFrame\s*\(/);

assert.match(boundary, /v0\.4-pointer-governs-case-recovery-replay-stays-open/);
assert.match(boundary, /if \(!activePointer\) return closedCurrent\(\)/);
assert.match(boundary, /function capsuleRecoveryOpen\(\)/);
assert.match(boundary, /Boolean\(file\?\.files\?\.length\)/);
assert.match(boundary, /visible\(returnBar\)/);
assert.match(boundary, /Boolean\(replay && !replay\.disabled && visible\(replay\)\)/);
assert.match(boundary, /const interactive = caseOpen \|\| recoveryOpen/);
assert.match(boundary, /if \(caseOpen\)[\s\S]*?rail\.removeAttribute\('inert'\)[\s\S]*?else[\s\S]*?rail\.setAttribute\('inert',''\)/);
assert.match(boundary, /attributeFilter:\['class','hidden','disabled'\]/);
assert.match(boundary, /RECOVERY_FILE_CHANGED/);
assert.match(boundary, /CUSTODIAN_RETURN_SETTLED/);
assert.match(boundary, /CAPSULE_OPENED_SETTLED/);
assert.match(boundary, /host\.__td613AshKeep = facade/);
assert.match(boundary, /td613:ash:case-closed/);
assert.match(boundary, /launch\?\.classList\.remove\('hidden'\)/);
assert.doesNotMatch(boundary, /indexedDB\.deleteDatabase/);
assert.match(closeRepair, /localStorage\.removeItem\(POINTER_KEY\)/);

assert.match(ingressSpacing, /v0\.2-two-dimensional-overlap/);
assert.match(ingressSpacing, /title\.insertAdjacentElement\('afterend', recovery\)/);
assert.match(ingressSpacing, /recovery\.insertAdjacentElement\('afterend', primary\)/);
assert.match(ingressSpacing, /margin-top:6px!important/);
assert.match(ingressSpacing, /margin-top:2px!important/);
assert.match(ingressSpacing, /Math\.min\(a\.right, b\.right\)/);
assert.match(ingressSpacing, /overlap_area:collision\.area/);
assert.match(ingressSpacing, /overlap_px:collision\.area > 0 \? collision\.height : 0/);
assert.match(ingressSpacing, /ordered:title\.nextElementSibling === recovery/);
assert.doesNotMatch(ingressSpacing, /setInterval\s*\(|requestAnimationFrame\s*\(/);

assert.match(bridge, /ash-session-boundary\.js\?v=20260721-flowcore-live-field-v1/);
assert.match(bridge, /ash-ingress-copy-spacing\.js\?v=20260721-flowcore-live-field-v1/);
assert.match(bridge, /ash-flowcore-pedagogy-field\.js\?v=20260721-flowcore-live-field-v1/);
assert.match(bridge, /ash-flowcore-ingress-portal\.js\?v=20260721-flowcore-live-field-v1/);

console.log('ash-flowcore-live-field.test.mjs passed');
