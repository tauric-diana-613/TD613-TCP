import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import vm from 'vm';

export const SAFE_HARBOR_EXPECTED_CANON = Object.freeze({
  principal: 'tauric.diana.613',
  claimed_pua: 'U+10D613',
  badge_id: 'bdg_glyph_U10D613',
  binding_fragment: '#9B07D8B',
  sac: 'SAC[X6ZNK5NO51]',
  public_mode: 'legacy-compat',
  public_footer: 'TD613-Binding:#9B07D8B/SAC[X6ZNK5NO51] \u00B7 payload {n} \u00B7 YYYY-MM-DD \u00B7 \u27D0'
});

export const SAFE_HARBOR_REQUIRED_FILES = Object.freeze([
  'app/safe-harbor/index.html',
  'app/safe-harbor/11_TD613_PUA_Badge_Provenance_Attestation_Lab.html',
  'app/safe-harbor/app/data.js',
  'app/safe-harbor/app/main.js',
  'app/safe-harbor/app/styles.css',
  'app/safe-harbor/docs/ARCHITECTURE.md',
  'app/safe-harbor/docs/HOOKS.md',
  'app/safe-harbor/examples/td613-safe-harbor.packet.sample.json',
  'app/safe-harbor/probes/06_TD613_PUA_Badge_Provenance_Attestation_Commands.json',
  'app/safe-harbor/reference/12_TD613_PUA_Badge_Provenance_Attestation_Registry.json',
  'app/safe-harbor/reference/20_KIT_MANIFEST.json',
  'app/safe-harbor/reference/td613_manifest.json',
  'app/safe-harbor/reference/td613_trust_profile.json',
  'app/safe-harbor/reference/TD613_verify.html',
  'app/safe-harbor/reference/TD613_offline_capsule.html',
  'app/safe-harbor/renderers/10_TD613_PUA_Badge_Provenance_Attestation_Renderer_v7_2_1.user.js',
  'app/safe-harbor/assets/13_U10D613_preview.svg',
  'app/safe-harbor/schemas/td613-safe-harbor.packet.schema.json',
  'app/safe-harbor/schemas/td613-safe-harbor.hook-event.schema.json'
]);

function rel(value) {
  return String(value || '').replace(/\\/g, '/');
}

function readText(targetPath) {
  return fs.readFileSync(targetPath, 'utf8');
}

function readJson(targetPath) {
  return JSON.parse(readText(targetPath));
}

function digestBuffer(buffer, algorithm = 'sha256') {
  return crypto.createHash(algorithm).update(buffer).digest('hex');
}

function escapeForRegex(value) {
  return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function extractConstAssignment(source, name) {
  const match = String(source || '').match(new RegExp(`\\bconst\\s+${escapeForRegex(name)}\\s*=\\s*'([^']*)'`, 'u'));
  return match ? match[1] : null;
}

function evaluateDataModule(targetPath) {
  const source = readText(targetPath);
  const sandbox = { window: {}, console: { log() {}, warn() {}, error() {} } };
  vm.runInNewContext(source, sandbox, { filename: targetPath });
  return sandbox.window.TD613_SAFE_HARBOR_DATA || null;
}

function canonicalJson(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map((item) => canonicalJson(item)).join(',')}]`;
  return `{${Object.keys(value)
    .filter((key) => value[key] !== undefined)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`)
    .join(',')}}`;
}

function computePacketHash(packet) {
  const material = JSON.parse(JSON.stringify(packet));
  delete material.packet_hash_sha256;
  if (material.signature) {
    material.signature.sig = null;
    material.signature.attached_at = null;
    if (material.signature.status === 'sealed') {
      material.signature.status = 'declared';
    }
  }
  return `sha256:${crypto.createHash('sha256').update(canonicalJson(material), 'utf8').digest('hex')}`;
}

function findMissingIds(html, ids = []) {
  return ids.filter((id) => !html.includes(`id="${id}"`));
}

function summarizeFiles(rootPath) {
  const files = [];
  const stack = [rootPath];
  while (stack.length) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const next = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(next);
      } else if (entry.isFile()) {
        files.push(next);
      }
    }
  }
  return files.sort((left, right) => left.localeCompare(right));
}

function pushFailure(target, condition, message) {
  if (!condition) target.push(message);
}

export function runSafeHarborDiagnostics({ repoRoot }) {
  const safeHarborRoot = path.join(repoRoot, 'app', 'safe-harbor');
  const failures = [];
  const warnings = [];

  if (!fs.existsSync(safeHarborRoot)) {
    return {
      id: 'safe-harbor-annex',
      root: 'app/safe-harbor',
      passed: false,
      version: null,
      fileCount: 0,
      requiredFiles: SAFE_HARBOR_REQUIRED_FILES.map((relativePath) => ({ path: relativePath, exists: false })),
      versions: {},
      canon: {},
      packetSample: {},
      htmlSurface: {},
      hookBus: {},
      renderer: {},
      failures: ['missing Safe Harbor annex at app/safe-harbor'],
      warnings
    };
  }

  const fileInventory = summarizeFiles(safeHarborRoot);
  const requiredFiles = SAFE_HARBOR_REQUIRED_FILES.map((relativePath) => {
    const absolutePath = path.join(repoRoot, ...relativePath.split('/'));
    const exists = fs.existsSync(absolutePath);
    if (!exists) failures.push(`missing required file: ${relativePath}`);
    return { path: relativePath, exists };
  });

  const data = evaluateDataModule(path.join(safeHarborRoot, 'app', 'data.js'));
  const samplePacket = readJson(path.join(safeHarborRoot, 'examples', 'td613-safe-harbor.packet.sample.json'));
  const packetSchema = readJson(path.join(safeHarborRoot, 'schemas', 'td613-safe-harbor.packet.schema.json'));
  const commands = readJson(path.join(safeHarborRoot, 'probes', '06_TD613_PUA_Badge_Provenance_Attestation_Commands.json'));
  const registry = readJson(path.join(safeHarborRoot, 'reference', '12_TD613_PUA_Badge_Provenance_Attestation_Registry.json'));
  const kitManifest = readJson(path.join(safeHarborRoot, 'reference', '20_KIT_MANIFEST.json'));
  const manifest = readJson(path.join(safeHarborRoot, 'reference', 'td613_manifest.json'));
  const trustProfile = readJson(path.join(safeHarborRoot, 'reference', 'td613_trust_profile.json'));
  const indexHtml = readText(path.join(safeHarborRoot, 'index.html'));
  const verifyHtml = readText(path.join(safeHarborRoot, 'reference', 'TD613_verify.html'));
  const capsuleHtml = readText(path.join(safeHarborRoot, 'reference', 'TD613_offline_capsule.html'));
  const hooksDoc = readText(path.join(safeHarborRoot, 'docs', 'HOOKS.md'));
  const rendererPath = path.join(safeHarborRoot, 'renderers', '10_TD613_PUA_Badge_Provenance_Attestation_Renderer_v7_2_1.user.js');
  const rendererSource = readText(rendererPath);
  const rendererSha256 = digestBuffer(Buffer.from(rendererSource, 'utf8'), 'sha256');
  const previewSvgPath = path.join(safeHarborRoot, 'assets', '13_U10D613_preview.svg');
  const previewSvg = fs.readFileSync(previewSvgPath);
  const previewSvgSha256 = digestBuffer(previewSvg, 'sha256');
  const previewSvgMd5 = digestBuffer(previewSvg, 'md5');
  const compatLabPath = path.join(safeHarborRoot, '11_TD613_PUA_Badge_Provenance_Attestation_Lab.html');
  const compatLabSha256 = digestBuffer(fs.readFileSync(compatLabPath), 'sha256');
  const manifestPreviewSvg = kitManifest?.files?.['13_U10D613_preview.svg'] || {};
  const manifestCompatLab = kitManifest?.files?.['11_TD613_PUA_Badge_Provenance_Attestation_Lab.html'] || {};
  const rendererPreviewSvgSha256 = extractConstAssignment(rendererSource, 'PREVIEW_SVG_SHA256');
  const rendererPreviewSvgMd5 = extractConstAssignment(rendererSource, 'PREVIEW_SVG_MD5');
  const rendererPrincipal = extractConstAssignment(rendererSource, 'PRINCIPAL');
  const rendererBadgeId = extractConstAssignment(rendererSource, 'BADGE_ID');
  const rendererClaimedPua = extractConstAssignment(rendererSource, 'CODEPOINT');

  if (!data) {
    failures.push('could not evaluate app/data.js into TD613_SAFE_HARBOR_DATA');
  }

  const versions = {
    app: data?.meta?.version || null,
    sample: samplePacket?.canonicalization?.version || null,
    commands: commands?.safe_harbor?.version || null,
    registry: registry?.safe_harbor?.version || null,
    manifest: manifest?.safe_harbor?.version || null,
    trust: trustProfile?.safe_harbor?.version || null,
    kit: kitManifest?.safe_harbor?.version || null
  };
  const distinctVersions = [...new Set(Object.values(versions).filter(Boolean))];

  pushFailure(failures, data?.canon?.principal === SAFE_HARBOR_EXPECTED_CANON.principal, 'canon principal drifted');
  pushFailure(failures, data?.canon?.claimed_pua === SAFE_HARBOR_EXPECTED_CANON.claimed_pua, 'canon claimed_pua drifted');
  pushFailure(failures, data?.canon?.badge_id === SAFE_HARBOR_EXPECTED_CANON.badge_id, 'canon badge_id drifted');
  pushFailure(failures, `#${String(data?.canon?.binding_fragment || '').replace(/^#/, '')}` === SAFE_HARBOR_EXPECTED_CANON.binding_fragment, 'canon binding fragment drifted');
  pushFailure(failures, `SAC[${String(data?.canon?.sac || '').replace(/^SAC\[/, '').replace(/\]$/, '')}]` === SAFE_HARBOR_EXPECTED_CANON.sac, 'canon SAC drifted');
  pushFailure(failures, data?.trustProfile?.current_public_mode === SAFE_HARBOR_EXPECTED_CANON.public_mode, 'current public mode drifted');
  pushFailure(failures, data?.trustProfile?.public_footer_template === SAFE_HARBOR_EXPECTED_CANON.public_footer, 'public footer template drifted');
  pushFailure(failures, distinctVersions.length === 1, `version drift across Safe Harbor surfaces: ${JSON.stringify(versions)}`);

  const sampleHash = computePacketHash(samplePacket);
  const schemaRequired = packetSchema?.required || [];
  const schemaHandshakeRequired = packetSchema?.properties?.handshake?.required || [];
  const covenantGateRequired = packetSchema?.properties?.bridge?.properties?.covenant_gate?.required || [];
  const exportGateStates = packetSchema?.properties?.bridge?.properties?.export_gate?.properties?.state?.enum || [];
  const routeStates = packetSchema?.properties?.analysis?.properties?.route?.properties?.state?.enum || [];
  const packetPreview = canonicalJson(samplePacket);

  pushFailure(failures, samplePacket?.schema_version === 'td613.safe-harbor.packet/v1', 'sample packet schema version missing');
  pushFailure(failures, samplePacket?.packet_hash_sha256 === sampleHash, 'sample packet hash does not match canonical packet hash');
  pushFailure(failures, samplePacket?.handshake?.principal_assertion?.asserted === true, 'sample packet handshake is missing principal assertion');
  pushFailure(failures, samplePacket?.handshake?.operator_witness?.witnessed === true, 'sample packet handshake is missing operator witness');
  pushFailure(failures, samplePacket?.bridge?.covenant_gate?.ready_for_export === true, 'sample packet covenant gate is not ready for export in sealed state');
  pushFailure(failures, samplePacket?.bridge?.export_gate?.state === 'sealed', 'sample packet export gate should report sealed before covenant export');
  pushFailure(failures, !packetPreview.includes('"raw_text"'), 'sample packet leaked sealed raw_text into public packet');
  pushFailure(failures, schemaRequired.includes('handshake'), 'packet schema missing handshake top-level requirement');
  pushFailure(failures, schemaHandshakeRequired.includes('principal_assertion') && schemaHandshakeRequired.includes('operator_witness') && schemaHandshakeRequired.includes('countersign_rule'), 'packet schema missing handshake required blocks');
  pushFailure(failures, covenantGateRequired.includes('ready_for_export') && covenantGateRequired.includes('blockers'), 'packet schema missing covenant gate readiness fields');
  pushFailure(failures, exportGateStates.includes('sealed'), 'packet schema export gate missing sealed state');
  pushFailure(failures, routeStates.includes('sealed') && routeStates.includes('harbor-eligible'), 'packet schema route states missing sealed / harbor-eligible');

  const missingIndexIds = findMissingIds(indexHtml, [
    'ingressMembrane',
    'mintStagedPacket',
    'clearIngress',
    'assertPrincipal',
    'operatorWitness',
    'clearHandshake',
    'covenantExport',
    'packetPreview',
    'probeOutput'
  ]);
  const missingHookEvents = ['td613:tcp-intake', 'td613:eo-route', 'td613:signature-lane', 'td613:safe-harbor-packet']
    .filter((eventName) => !hooksDoc.includes(eventName));

  pushFailure(failures, missingIndexIds.length === 0, `index.html missing expected Safe Harbor controls: ${missingIndexIds.join(', ')}`);
  pushFailure(failures, verifyHtml.includes('td613.safe-harbor.packet/v1'), 'verify page does not mention Safe Harbor packet schema');
  pushFailure(failures, verifyHtml.includes('packet_hash_sha256'), 'verify page does not mention packet_hash_sha256');
  pushFailure(failures, capsuleHtml.includes('packet_schema_version'), 'offline capsule does not expose packet schema version');
  pushFailure(failures, hooksDoc.includes('td613:tcp-intake') && hooksDoc.includes('td613:safe-harbor-packet'), 'hook docs do not expose Safe Harbor hook bus');
  pushFailure(failures, missingHookEvents.length === 0, `hook bus doc drift: ${missingHookEvents.join(', ')}`);
  pushFailure(failures, previewSvg.length > 0, 'preview SVG asset is empty');
  pushFailure(failures, manifestPreviewSvg.sha256 === previewSvgSha256, 'kit manifest preview SVG sha256 drifted');
  pushFailure(failures, manifestPreviewSvg.md5 === previewSvgMd5, 'kit manifest preview SVG md5 drifted');
  pushFailure(failures, rendererPreviewSvgSha256 === previewSvgSha256, 'renderer preview SVG sha256 metadata drifted');
  pushFailure(failures, rendererPreviewSvgMd5 === previewSvgMd5, 'renderer preview SVG md5 metadata drifted');
  pushFailure(failures, data?.canon?.preview_svg_sha256 === previewSvgSha256, 'canon preview SVG sha256 drifted');
  pushFailure(failures, data?.canon?.preview_svg_md5 === previewSvgMd5, 'canon preview SVG md5 drifted');
  pushFailure(failures, rendererPrincipal === SAFE_HARBOR_EXPECTED_CANON.principal, 'renderer principal drifted');
  pushFailure(failures, rendererBadgeId === SAFE_HARBOR_EXPECTED_CANON.badge_id, 'renderer badge_id drifted');
  pushFailure(failures, rendererClaimedPua === SAFE_HARBOR_EXPECTED_CANON.claimed_pua, 'renderer claimed_pua drifted');
  pushFailure(failures, kitManifest?.external_renderer?.filename === path.basename(rendererPath), 'kit manifest external renderer filename drifted');
  pushFailure(failures, kitManifest?.external_renderer?.sha256 === rendererSha256, 'kit manifest external renderer sha256 drifted');
  pushFailure(failures, manifestCompatLab.sha256 === compatLabSha256, 'kit manifest compat lab bridge sha256 drifted');

  const safeHarborVersion = versions.app;
  const packetStates = {
    schemaVersion: samplePacket?.schema_version || null,
    receiptState: samplePacket?.receipt?.state || null,
    routeState: samplePacket?.analysis?.route?.state || null,
    exportGateState: samplePacket?.bridge?.export_gate?.state || null
  };

  if (!samplePacket?.canon?.public_footer?.includes('payload {n}')) {
    warnings.push('sample packet public footer is no longer templated with payload {n}');
  }

  return {
    id: 'safe-harbor-annex',
    root: rel(path.relative(repoRoot, safeHarborRoot)),
    passed: failures.length === 0,
    version: safeHarborVersion,
    fileCount: fileInventory.length,
    requiredFiles,
    versions,
    canon: {
      principal: data?.canon?.principal || null,
      claimed_pua: data?.canon?.claimed_pua || null,
      badge_id: data?.canon?.badge_id || null,
      binding_fragment: `#${String(data?.canon?.binding_fragment || '').replace(/^#/, '')}`,
      sac: `SAC[${String(data?.canon?.sac || '').replace(/^SAC\[/, '').replace(/\]$/, '')}]`,
      public_mode: data?.trustProfile?.current_public_mode || null,
      public_footer: data?.trustProfile?.public_footer_template || null
    },
    packetSample: {
      hashMatches: samplePacket?.packet_hash_sha256 === sampleHash,
      computedHash: sampleHash,
      publicFooter: samplePacket?.canon?.public_footer || null,
      handshakeSatisfied: Boolean(samplePacket?.handshake?.countersign_rule?.satisfied),
      route: packetStates
    },
    htmlSurface: {
      missingIds: missingIndexIds,
      verifyMentionsPacketSchema: verifyHtml.includes('td613.safe-harbor.packet/v1'),
      capsuleMentionsPacketSchema: capsuleHtml.includes('packet_schema_version')
    },
    hookBus: {
      events: data?.hookBus?.events || {},
      documented: hooksDoc.includes('td613:tcp-intake') && hooksDoc.includes('td613:safe-harbor-packet')
    },
    renderer: {
      previewSvgBytes: previewSvg.length,
      previewSvgSha256,
      previewSvgMd5,
      rendererPreviewSvgSha256,
      rendererPreviewSvgMd5,
      rendererSha256,
      canonLinked: Boolean(
        rendererPrincipal === SAFE_HARBOR_EXPECTED_CANON.principal &&
        rendererBadgeId === SAFE_HARBOR_EXPECTED_CANON.badge_id &&
        rendererClaimedPua === SAFE_HARBOR_EXPECTED_CANON.claimed_pua
      ),
      kitManifestLinked: Boolean(
        manifestPreviewSvg.sha256 === previewSvgSha256 &&
        kitManifest?.external_renderer?.sha256 === rendererSha256
      ),
      labBridgeManifested: Boolean(manifestCompatLab.sha256)
    },
    failures,
    warnings
  };
}

export function buildSafeHarborMarkdownReport(audit) {
  const lines = [
    '# Safe Harbor Annex Diagnostics',
    '',
    `- root: ${audit.root}`,
    `- version: ${audit.version || 'unknown'}`,
    `- passed: ${audit.passed ? 'yes' : 'no'}`,
    `- file_count: ${audit.fileCount}`,
    `- packet_hash_matches: ${audit.packetSample?.hashMatches ? 'yes' : 'no'}`,
    `- handshake_satisfied_in_sample: ${audit.packetSample?.handshakeSatisfied ? 'yes' : 'no'}`,
    `- route_state: ${audit.packetSample?.route?.routeState || 'unknown'}`,
    `- export_gate_state: ${audit.packetSample?.route?.exportGateState || 'unknown'}`,
    ''
  ];

  if (audit.failures?.length) {
    lines.push('## Failures', '');
    audit.failures.forEach((failure) => lines.push(`- ${failure}`));
    lines.push('');
  }

  if (audit.warnings?.length) {
    lines.push('## Warnings', '');
    audit.warnings.forEach((warning) => lines.push(`- ${warning}`));
    lines.push('');
  }

  lines.push('## Canon', '');
  lines.push(`- principal: ${audit.canon?.principal || 'unknown'}`);
  lines.push(`- badge_id: ${audit.canon?.badge_id || 'unknown'}`);
  lines.push(`- claimed_pua: ${audit.canon?.claimed_pua || 'unknown'}`);
  lines.push(`- binding_fragment: ${audit.canon?.binding_fragment || 'unknown'}`);
  lines.push(`- sac: ${audit.canon?.sac || 'unknown'}`);
  lines.push(`- public_mode: ${audit.canon?.public_mode || 'unknown'}`);
  lines.push(`- public_footer: ${audit.canon?.public_footer || 'unknown'}`);
  lines.push('', '## Renderer', '');
  lines.push(`- preview_svg_sha256: ${audit.renderer?.previewSvgSha256 || 'unknown'}`);
  lines.push(`- renderer_manifest_linked: ${audit.renderer?.kitManifestLinked ? 'yes' : 'no'}`);
  lines.push(`- renderer_canon_linked: ${audit.renderer?.canonLinked ? 'yes' : 'no'}`);
  lines.push(`- compat_lab_manifested: ${audit.renderer?.labBridgeManifested ? 'yes' : 'no'}`);
  lines.push('', '## Required Files', '');
  audit.requiredFiles.forEach((entry) => lines.push(`- ${entry.exists ? 'ok' : 'missing'} ${entry.path}`));

  return `${lines.join('\n')}\n`;
}
