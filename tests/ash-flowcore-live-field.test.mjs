import assert from 'node:assert/strict';
import fs from 'node:fs';

const field = fs.readFileSync('app/dome-world/ash-flowcore-pedagogy-field.js', 'utf8');
const css = fs.readFileSync('app/dome-world/ash-flowcore-pedagogy-field.css', 'utf8');
const portal = fs.readFileSync('app/dome-world/ash-flowcore-ingress-portal.js', 'utf8');
const portalLoader = fs.readFileSync('app/dome-world/ash-flowcore-ingress-portal-loader.js', 'utf8');
const restoration = fs.readFileSync('app/dome-world/ash-post-ingress-motion-restoration.js', 'utf8');
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

assert.match(css, /\.ash-flowcore-mounted>\.ash-ux-motion-track\{[^}]*display:grid!important/);
assert.match(css, /\.ash-flowcore-mounted\{[^}]*height:auto!important[^}]*overflow:visible!important/);
assert.match(css, /\.ash-flowcore-field__canvas\{[^}]*display:block!important[^}]*max-height:none!important/);
assert.doesNotMatch(css, /\.ash-ux-motion-track\{display:none!important\}/);
assert.match(css, /data-flowcore-phase="0"/);
assert.match(css, /data-flowcore-phase="4"/);
assert.match(css, /prefers-reduced-motion:reduce/);
assert.doesNotMatch(css, /animation:[^;}]*infinite/);

assert.match(restoration, /v0\.3-canonical-field-ingress-polish/);
assert.match(restoration, /function stabilizeGeometry\(\)/);
assert.match(restoration, /style\.setProperty\(property, value, 'important'\)/);
assert.match(restoration, /ashPostIngressMotion = receipt\.canvas_visible && receipt\.rail_visible/);
assert.match(restoration, /field_clipped/);
assert.match(restoration, /rail_clipped/);
assert.match(restoration, /\.ash-flowcore-mounted>\.ash-ux-motion-track/);
assert.doesNotMatch(restoration, /setInterval\s*\(/);

assert.match(portal, /v0\.9-phase-atomic-canonical-play/);
assert.match(portal, /INGRESS_HOST_ID = 'guidedLaunchPromise'/);
assert.match(portal, /LEGACY_PROMISE_ID = 'guidedLaunchPromiseLegacy'/);
assert.match(portal, /legacyPromise\.id = LEGACY_PROMISE_ID/);
assert.match(portal, /actions\.insertAdjacentElement\('afterend', ingress\)/);
assert.match(portal, /legacyPromise\.hidden = true/);
assert.match(portal, /dataset\.ashAia3 = 'true'/);
assert.doesNotMatch(portal, /dataset\.aiaPlay/);
assert.match(portal, /button\.addEventListener\('click', playFlowcoreField\)/);
assert.match(portal, /__td613AshFlowcoreField\?\.setPhase\?\.\(0\)/);
assert.match(portal, /const canonicalPlay = doc\.querySelector\('\[data-aia-play\]'\)/);
assert.match(portal, /if \(canonicalPlay\) canonicalPlay\.click\(\)/);
assert.match(portal, /else host\.__td613AshFlowcoreField\?\.play\?\.\(\)/);
assert.match(portal, /host\.addEventListener\('td613:ash:flowcore-field-phase', copyDynamicState\)/);
assert.match(portal, /function applyProxyPosture\(node\)/);
assert.match(portal, /function normalizeStageFields\(\)/);
assert.match(portal, /classList\.add\('ash-flowcore-field--proxy'\)/);
assert.match(portal, /setBooleanProperty\(node, 'hidden', true\)/);
assert.match(portal, /setBooleanProperty\(node, 'inert', true\)/);
assert.match(portal, /stripDuplicateIds\(node\)/);
assert.match(portal, /if \(proxyField\?\.isConnected && proxyField !== nextProxy\) proxyField\.remove\(\)/);
assert.match(portal, /for \(const node of siblings\)/);
assert.match(portal, /if \(node === proxyField\) applyProxyPosture\(node\)/);
assert.match(portal, /ingress\.replaceChildren\(visibleField\)/);
assert.match(portal, /setDataset\(visibleField, 'flowcoreHost', 'aia'\)/);
assert.match(portal, /normalizeStageFields\(\)/);
assert.match(portal, /proxy_count/);
assert.match(portal, /duplicate_visible_fields/);
assert.match(portal, /#guidedLaunchPromise\.ash-flowcore-ingress-host/);
assert.match(portal, /max-height:calc\(100vh - 44px\)!important/);
assert.match(portal, /if \(node\.textContent !== next\) node\.textContent = next/);
assert.match(portal, /if \(node\.dataset\[name\] !== next\) node\.dataset\[name\] = next/);
assert.match(portal, /function queueSync\(reason\)/);
assert.match(portal, /if \(syncQueued\) return/);
assert.match(portal, /function mutationTouchesPortal\(record\)/);
assert.match(portal, /if \(node\?\.nodeType !== 1\) return false/);
assert.match(portal, /records\.some\(mutationTouchesPortal\)/);
assert.doesNotMatch(portal, /setInterval\s*\(|requestAnimationFrame\s*\(/);

assert.match(portalLoader, /v0\.3-observer-hotfix/);
assert.match(portalLoader, /const browser = Boolean\(host && doc\?\.documentElement\)/);
assert.match(portalLoader, /const eligible = browser && !legacy/);
assert.match(portalLoader, /if \(!browser\)/);
assert.match(portalLoader, /params\.get\('presentation'\) === 'legacy'/);
assert.match(portalLoader, /eligible:false/);
assert.match(portalLoader, /reason:'EXPLICIT_LEGACY_PRESENTATION'/);
assert.match(portalLoader, /import\('\.\/ash-flowcore-ingress-portal\.js\?v=20260722-flowcore-observer-hotfix-v3'\)/);
assert.doesNotMatch(portalLoader, /setInterval\s*\(|requestAnimationFrame\s*\(/);

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

const RELEASE_EPOCH = '20260723-a2-a5-release-v1';
for (const module of [
  'ash-session-boundary',
  'ash-ingress-copy-spacing',
  'ash-flowcore-pedagogy-field',
  'ash-flowcore-ingress-portal-loader',
  'ash-post-ingress-motion-restoration',
  'ash-reviewability-repair'
]) assert.match(bridge, new RegExp(`${module}\\.js\\?v=${RELEASE_EPOCH}`));
assert.doesNotMatch(bridge, /import '\.\/ash-flowcore-ingress-portal\.js/);

console.log('ash-flowcore-live-field.test.mjs passed');
