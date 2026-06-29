import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(path, 'utf8');
const scripts = [
  'app/operator-receipt.js',
  'app/safe-harbor/app/data.js',
  'app/safe-harbor/app/forensic-authorship-packet.js',
  'app/safe-harbor/app/footer-history-packet.js',
  'app/safe-harbor/app/main.js',
  'app/safe-harbor/app/safe-harbor-housekeeping.js',
  'app/safe-harbor/app/safe-harbor-pr169-packet-vault-direct.js'
];

for (const path of scripts) {
  assert.doesNotThrow(
    () => new Function(read(path)),
    `${path} must parse as an executable classic browser script`
  );
}

const index = read('app/safe-harbor/index.html');
const receipt = read('app/operator-receipt.js');
const main = read('app/safe-harbor/app/main.js');
const forensicAuthorship = read('app/safe-harbor/app/forensic-authorship-packet.js');
const footerHistory = read('app/safe-harbor/app/footer-history-packet.js');
const nativeFinalizer = read('app/safe-harbor/app/safe-harbor-native-finalizer.js');
const authorityVerifier = read('app/safe-harbor/app/safe-harbor-authority-verifier.js');
const packetPipeline = read('app/safe-harbor/app/safe-harbor-packet-pipeline.js');
const publicDefaultGate = read('app/safe-harbor/app/safe-harbor-public-default-gate.js');
const housekeeping = read('app/safe-harbor/app/safe-harbor-housekeeping.js');
const packetVault = read('app/safe-harbor/app/safe-harbor-pr169-packet-vault-direct.js');

assert.ok(
  main.indexOf('const BATCH_FILE_MANIFEST') < main.indexOf('init();'),
  'batch manifest must initialize before Safe Harbor boots'
);
assert.match(
  main,
  /if \(!state\.packet && state\.ingress\.packetId && state\.ingress\.receiptId\) void rebuild\('init'\)/,
  'restoring a complete packet must not rerun rich stylometry during startup'
);
assert.doesNotMatch(
  main,
  /^\s*void rebuild\('init'\);$/m,
  'Safe Harbor startup must not unconditionally rebuild a restored packet'
);
assert.match(
  main,
  /event\.target\.closest\('#signOutIngress,#signOutVault,#railSignOut,#clearIngress'\)/,
  'session reset controls must have one stable delegated owner'
);
assert.match(
  main,
  /document\.addEventListener\('click', handleSessionControlClick, true\)/,
  'session reset controls must run before late click handlers'
);
assert.match(
  main,
  /localStorage\.removeItem\(MIRROR_KEY\)/,
  'sign out must clear the local recovery mirror natively'
);
assert.doesNotMatch(
  main,
  /logEvent\('session-reset'/,
  'reset must not recreate the session immediately after clearing it'
);
assert.match(
  main,
  /adoptGovernedPacket: function \(packet\)/,
  'the native runtime must be able to adopt its governed packet'
);
assert.match(
  main,
  /resetSession: function \(\)/,
  'the native runtime must expose one reset operation to compatibility controls'
);
assert.match(
  receipt,
  /String\(value == null \? '' : value\)/,
  'operator receipt HTML escaping must preserve non-null values'
);
assert.match(
  index,
  /safe-harbor-housekeeping\.js\?v=/,
  'Safe Harbor must own its housekeeping runtime explicitly'
);
assert.doesNotMatch(
  index,
  /safe-harbor-pr167-packet-vault-txt\.js/,
  'the obsolete packet-vault runtime must not be loaded'
);
assert.match(
  receipt,
  /Safe Harbor now owns its compatibility assets explicitly/,
  'the shared receipt runtime must not secretly bootstrap Safe Harbor assets'
);
assert.doesNotMatch(
  housekeeping,
  /setInterval\(/,
  'housekeeping must be event-driven rather than continuously polling'
);
assert.match(
  housekeeping,
  /nativeApi\.resetSession\(\)/,
  'the compatibility sign-out wrapper must delegate to native state ownership'
);
assert.doesNotMatch(
  forensicAuthorship + footerHistory,
  /MutationObserver/,
  'packet augmentors must not rewrite the preview from mutation callbacks'
);
assert.doesNotMatch(
  forensicAuthorship + footerHistory,
  /addEventListener\('td613:safe-harbor-packet'/,
  'packet augmentors must remain pure transforms rather than independent preview painters'
);
assert.doesNotMatch(
  forensicAuthorship,
  /#copyPacketPreview,#exportPacketPreview,#covenantExport/,
  'forensic augmentation must not intercept native packet controls'
);
assert.match(
  footerHistory,
  /augmentPacket/,
  'footer history must expose a pipeline-owned packet transform'
);
assert.doesNotMatch(
  forensicAuthorship + footerHistory,
  /packet_hash_sha256 = await sha256/,
  'supplemental receipts must not rewrite the native packet hash'
);
assert.match(nativeFinalizer, /'pipeline_state'/, 'pipeline state must be excluded from native packet hashing');
assert.match(authorityVerifier, /delete material\.pipeline_state/, 'replay verification must exclude pipeline state');
assert.match(nativeFinalizer, /'release_checklist'/, 'release checklist must be excluded from native packet hashing');
assert.match(authorityVerifier, /delete material\.release_checklist/, 'replay verification must exclude release checklist');
assert.match(
  packetPipeline,
  /\.\.\.\(alignment\.renderer_authority_metadata \|\| \{\}\), \.\.\.\(out\.renderer_authority_metadata \|\| \{\}\)/,
  'outside-witness alignment must preserve native renderer authority fields'
);
assert.doesNotMatch(
  packetPipeline,
  /out\.signature_overlay_authority = \{[^;]*out\.signature_overlay_authority/s,
  'fresh signature authority must replace stale prior-cycle refusal state'
);
assert.doesNotMatch(
  packetPipeline,
  /out\.(?:tcp|eo)_hook_authority = \{[^;]*out\.(?:tcp|eo)_hook_authority/s,
  'fresh hook authority must replace stale prior-cycle block state'
);
assert.match(publicDefaultGate, /\.\.\.existing/, 'Phase 8 renderer policy must preserve native authority fields');
assert.match(publicDefaultGate, /promotion_status: existing\.promotion_status/, 'Phase 8 renderer policy must preserve promotion status');
assert.match(
  packetVault,
  /window\.addEventListener\('td613:safe-harbor-packet', function \(\) \{ lastNormalizedSnapshot = null; window\.setTimeout\(syncButton, 0\); \}\)/,
  'packet-vault controls must listen on the packet event dispatch target'
);
assert.doesNotMatch(
  packetVault,
  /document\.addEventListener\('td613:safe-harbor-packet'/,
  'packet-vault controls must not listen on the wrong event target'
);
assert.doesNotMatch(
  packetVault,
  /setInterval\(/,
  'packet-vault controls must not run a permanent synchronization poll'
);
assert.match(
  packetVault,
  /if \(!normalizationPromise\)/,
  'packet normalization must deduplicate overlapping startup and packet events'
);
assert.match(
  packetVault,
  /window\.requestIdleCallback\(run, \{ timeout: 4000 \}\)/,
  'governance normalization must yield initial page presentation before auditing'
);
assert.match(
  packetVault,
  /if \(document\.readyState === 'complete'\) queue\(\)/,
  'governance normalization must not begin before the load boundary'
);
assert.match(
  packetVault,
  /sourceSnapshot === lastNormalizedSnapshot/,
  'unchanged packets must not repeat the full governance pipeline'
);
assert.match(
  packetVault,
  /pipelineState\.pipeline_version === api\.PIPELINE_VERSION/,
  'persisted packets on the current healthy pipeline must use the reload fast path'
);
assert.match(
  packetPipeline,
  /if \(!\(await canReusePhase5\(out\)\)\) out = await refreshPhase5ThroughPipeline/,
  'valid Phase 5 replay hardening must not be rebuilt during every normalization'
);
assert.doesNotMatch(
  packetVault,
  /\[100, 360, 900, 1800\]/,
  'startup must not launch four redundant packet normalization passes'
);
assert.match(
  packetVault,
  /exportButton\.disabled = !ready/,
  'the visible packet export control must reflect pipeline readiness'
);
assert.match(
  packetVault,
  /nativeApi\.adoptGovernedPacket\(patched\)/,
  'the policy bridge must return normalized packets to native state ownership'
);
assert.match(
  packetVault,
  /JSON\.stringify\(packet\.forensic_schema \|\| \{\}, null, 2\)/,
  'the forensic schema panel must not duplicate the complete packet preview'
);
assert.match(
  packetVault,
  /Expand Operator packet mirror to render the complete packet/,
  'the complete packet mirror must render lazily'
);
assert.match(
  packetVault,
  /corePacketForPipeline\(packet\)/,
  'replay verification must strip supplemental receipts before normalization'
);
assert.match(
  packetVault,
  /epoch !== sessionEpoch/,
  'stale asynchronous normalization must not resurrect a cleared session'
);
assert.match(
  packetVault,
  /phase5 !== 'pass'/,
  'packet export must fail closed when Phase 5 is absent or not passing'
);
assert.match(
  packetVault,
  /phase9 === 'verification-ready' \|\| phase9 === 'public-readable'/,
  'packet export must require an explicit Phase 9 release class'
);

console.log('safe-harbor-runtime-boot.test.mjs passed');
