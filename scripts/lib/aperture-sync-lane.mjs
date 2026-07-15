import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'parse5';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const REPO_ROOT = path.resolve(__dirname, '..', '..');
export const APERTURE_DIR = path.join(REPO_ROOT, 'app', 'aperture');
export const APERTURE_TOOL_PATH = path.join(APERTURE_DIR, 'tool.html');
export const APERTURE_INDEX_PATH = path.join(APERTURE_DIR, 'index.html');
export const ASSET_VERSIONS_PATH = path.join(REPO_ROOT, 'app', 'asset-versions.js');
export const APERTURE_ENGINE_PATH = path.join(REPO_ROOT, 'app', 'engine', 'td613-aperture.js');
export const APERTURE_RELEASE_PATH = path.join(APERTURE_DIR, 'release.json');
export const STAGING_DIR = path.join(REPO_ROOT, '.aperture-staging');
export const STAGED_HTML_PATH = path.join(STAGING_DIR, 'candidate.html');
export const STAGED_MANIFEST_PATH = path.join(STAGING_DIR, 'manifest.json');
export const STAGED_REPORT_PATH = path.join(STAGING_DIR, 'report.md');

export function normalizeCliPath(value = '') {
  return String(value).trim().replace(/^"(.*)"$/, '$1');
}

export async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function readText(filePath) {
  return fs.readFile(filePath, 'utf8');
}

export async function writeText(filePath, value) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, value, 'utf8');
}

export async function readHtmlArtifact(filePath) {
  const absolutePath = path.resolve(filePath);
  const buffer = await fs.readFile(absolutePath);
  const html = buffer.toString('utf8');
  return {
    path: absolutePath,
    html,
    bytes: buffer.length,
    lines: html.split(/\r\n|\r|\n/).length,
    sha256: sha256(buffer),
    metadata: extractApertureMetadata(html, absolutePath)
  };
}

export function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

export function currentCacheToken(date = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    pad(date.getHours()),
    pad(date.getMinutes())
  ].join('');
}

export function extractApertureMetadata(html, filePath = '') {
  const apertureVersionMeta = firstMeta(html, 'aperture-version');
  const version =
    firstMatch(html, /TD613 APERTURE\s+(v\d+(?:\.\d+){2,3})\s+SOURCE DECLARATION/i) ||
    firstMatch(html, /TD613 APERTURE\s+(v\d+(?:\.\d+){1,3}(?:-[A-Za-z0-9_.]+)?)\s+SOURCE DECLARATION/i) ||
    firstMeta(html, 'aperture-roots-version') ||
    apertureVersionMeta ||
    firstMatch(html, /SOURCE_DECLARATION\s*=\s*Object\.freeze\(\s*\{[\s\S]{0,240}?version:\s*["'](v\d+(?:\.\d+){2,3})["']/i) ||
    firstMatch(html, /SOURCE_DECLARATION\s*=\s*Object\.freeze\(\s*\{[\s\S]{0,240}?version:\s*["'](v\d+(?:\.\d+){1,3}(?:-[A-Za-z0-9_.]+)?)["']/i) ||
    firstMatch(html, /\bVERSION:\s*["'](v\d+(?:\.\d+){2,3})["']/) ||
    firstMatch(html, /\bVERSION:\s*["'](v\d+(?:\.\d+){1,3}(?:-[A-Za-z0-9_.]+)?)["']/) ||
    firstMatch(html, /\bconst\s+VERSION\s*=\s*["'](v\d+(?:\.\d+){2,3})["']/) ||
    firstMatch(html, /\bconst\s+VERSION\s*=\s*["'](v\d+(?:\.\d+){1,3}(?:-[A-Za-z0-9_.]+)?)["']/) ||
    firstMatch(html, /<title>TD613 Aperture\s*-\s*(v\d+(?:\.\d+){2,3})<\/title>/i) ||
    firstMatch(html, /<title>TD613 Aperture\s*-\s*(v\d+(?:\.\d+){1,3}(?:-[A-Za-z0-9_.]+)?)<\/title>/i) ||
    firstVersion(html);

  const schema =
    firstMatch(html, new RegExp(`td613-aperture\\/${escapeRegex(version || '')}(?![-\\w])`)) ||
    (version ? `td613-aperture/${version}` : null) ||
    firstMatch(html, /td613-aperture\/v\d+(?:\.\d+){1,3}(?:-[A-Za-z0-9_.]+)?(?![-\w])/);

  const featureVersion =
    firstMeta(html, 'aperture-feature-version') ||
    (apertureVersionMeta && apertureVersionMeta !== version ? apertureVersionMeta : null) ||
    firstMatch(html, /\bTD613_APERTURE_FEATURE_VERSION\s*=\s*["']([^"']+)["']/) ||
    firstMatch(html, /\bAPERTURE_VERSION\s*=\s*["']([^"']+)["']/);

  const token = firstMatch(html, /tool\.html\?v=([0-9A-Za-z._-]+)/);
  const duplicateIds = findDuplicateDomIds(html);
  const versionCounts = countBy([...html.matchAll(/\bv\d+(?:\.\d+){1,3}(?:[-A-Za-z0-9_.]+)?/g)].map((match) => match[0]));

  return {
    filePath,
    version: version || null,
    schema: schema || (version ? `td613-aperture/${version}` : null),
    featureVersion: featureVersion || version || null,
    doctrineKernelSchema: firstMeta(html, 'aperture-doctrine-kernel') ||
      firstMatch(html, /"schema"\s*:\s*"([^"]*doctrine-kernel[^"]*)"/),
    cacheToken: token || null,
    title: firstMatch(html, /<title>([^<]+)<\/title>/i) || null,
    blocks: {
      doctrineKernel: hasId(html, 'apertureDoctrineKernel'),
      canonicalGovernanceStack: hasId(html, 'apertureCanonicalGovernanceStack'),
      spineTransition: hasId(html, 'apertureSpineTransition'),
      lineageLedger: hasId(html, 'apertureLineageLedger'),
      adapterPolicy: hasId(html, 'apertureAdapterPolicy')
    },
    globals: {
      doctrineKernel: /APERTURE_DOCTRINE_KERNEL/.test(html),
      modelReaderAudit: /APERTURE_MODEL_READER_AUDIT/.test(html),
      zfpCertification: /APERTURE_ZFP_CERTIFICATION/.test(html),
      moireStratigraphy: /APERTURE_MOIRE_STRATIGRAPHY/.test(html),
      gatewayEmbed: /APERTURE_GATEWAY_EMBED/.test(html)
    },
    duplicateIds,
    versionCounts,
    mojibakeSignals: countMatches(html, /�|Ã|Â|â[^\s"'<]{0,3}|Î|Ï|ð[^\s"'<]{0,3}/gu)
  };
}

export function compareVersions(a, b) {
  const aa = parseVersion(a);
  const bb = parseVersion(b);
  if (!aa || !bb) return null;
  const max = Math.max(aa.length, bb.length);
  for (let i = 0; i < max; i += 1) {
    const left = aa[i] || 0;
    const right = bb[i] || 0;
    if (left > right) return 1;
    if (left < right) return -1;
  }
  return 0;
}

export function summarizeComparison(candidate, repo) {
  const versionOrder = compareVersions(candidate.metadata.version, repo.metadata.version);
  const hashEqual = candidate.sha256 === repo.sha256;
  let status = 'same-version-different-content';
  if (hashEqual) status = 'byte-identical';
  else if (versionOrder === 1) status = 'candidate-newer';
  else if (versionOrder === -1) status = 'repo-newer';
  else if (versionOrder === null) status = 'unknown-version-order';

  return {
    status,
    versionOrder,
    hashEqual,
    candidate: summarizeArtifact(candidate),
    repo: summarizeArtifact(repo),
    recommendation: comparisonRecommendation(status)
  };
}

export function normalizeApertureForRepo(html, metadata) {
  const version = metadata.version;
  const schema = metadata.schema || (version ? `td613-aperture/${version}` : null);
  const featureVersion = metadata.featureVersion || version;
  if (!version) throw new Error('Cannot normalize Aperture HTML without a detected version.');

  let next = html;
  next = setMetaContent(next, 'aperture-roots-version', version);
  next = setMetaContent(next, 'aperture-compat-version', version);
  next = setMetaContent(next, 'hcc-version', version);
  next = setMetaContent(next, 'vector-substrate-intake-version', version);
  next = setMetaContent(next, 'aperture-version', version);
  next = setMetaContent(next, 'aperture-feature-version', featureVersion);
  next = setMetaContent(next, 'spine-forward-version', `${version}-hidden-governance-skeleton`);

  next = next.replace(/\bdata-hcc-version=["'][^"']+["']/g, `data-hcc-version="${version}"`);
  next = next.replace(/\bdata-aperture-version=["'][^"']+["']/g, `data-aperture-version="${version}"`);
  next = next.replace(/document\.body\.dataset\.apertureVersion\s*=\s*['"]v2\.9\.4['"]/g, `document.body.dataset.apertureVersion = '${version}'`);
  next = next.replace(
    /featureVersion:\s*['"]v2\.9\.4-sigma-dynamical-instrument['"]/g,
    `featureVersion: '${featureVersion}',\n      sigmaLineage: 'v2.9.4-sigma-dynamical-instrument'`
  );

  // Known active patch layers used stale constants in several historical donor files.
  // Normalize schema roots while preserving any local suffixes, e.g. /witness-lab.
  next = next.replace(/td613-aperture\/v2\.7\.2/g, schema);
  next = next.replace(/td613-aperture\/v2\.9\.4/g, schema);
  next = next.replace(/\bv2\.7\.2\b/g, version);

  // Normalize active identity writers without rewriting lineage or deployed
  // receipt contracts that intentionally retain their original schema version.
  next = next.replace(/TD613 Aperture v3\.0-alpha/g, `TD613 Aperture ${version}`);
  next = next.replace(/<title>TD613 Aperture[^<]*<\/title>/i, `<title>TD613 Aperture ${version}</title>`);
  next = next.replace(
    /(const\s+FIRMWARE\s*=\s*\{[\s\S]{0,180}?\bVERSION:\s*)["'][^"']+["']([\s\S]{0,120}?\bSCHEMA_VERSION:\s*)["'][^"']+["']/,
    `$1"${version}"$2"${schema}"`
  );
  next = next.replace(
    /(const\s+SOURCE_DECLARATION\s*=\s*Object\.freeze\(\s*\{[\s\S]{0,180}?\bversion:\s*)["'][^"']+["']([\s\S]{0,120}?\bschema:\s*)["'][^"']+["']/,
    `$1"${version}"$2"${schema}"`
  );
  next = next.split(/(\r?\n)/).map((line) => {
    const activeIdentityWriter = /(document\.title|mFirmwareVer|firmwareSpineVersion|schemaVersionReadout|dataset\.aperture(?:Version|Schema)|data-aperture-version|APERTURE_VERSION|APERTURE_SCHEMA_VERSION|FIRMWARE\.VERSION|FIRMWARE\.SCHEMA_VERSION|const\s+TITLE\s*=|--aperture-current-(?:version|schema)|(?:setMeta|ensureMeta)\(['"]aperture-(?:version|roots-version|compat-version|feature-version))/.test(line);
    if (!activeIdentityWriter) return line;
    let normalizedLine = line
      .replace(/v3\.0-alpha-anti-epistemicide-research-runtime/g, featureVersion)
      .replace(/v3\.0-alpha/g, version)
      .replace(/td613-aperture\/v3\.0-alpha/g, schema)
      .replace(/dataset\.apertureVersion\s*=\s*(?:VERSION|V\d+\.VERSION|CANONICAL\.apertureVersion)/g, `dataset.apertureVersion='${version}'`)
      .replace(/dataset\.apertureSchema\s*=\s*(?:SCHEMA|V\d+\.SCHEMA|CANONICAL\.apertureSchema)/g, `dataset.apertureSchema='${schema}'`);
    normalizedLine = normalizedLine.replace(
      /((?:setMeta|ensureMeta)\(['"]aperture-(version|roots-version|compat-version|feature-version)['"]\s*,\s*)[^)]+(\))/g,
      (_match, prefix, name, suffix) => `${prefix}'${name === 'feature-version' ? featureVersion : version}'${suffix}`
    );
    return normalizedLine;
  }).join('');

  // The final stability guard owns current identity. Its constants are not
  // receipt-contract versions, so update them without touching frozen Phase
  // IV/V v3.0 receipt schemas elsewhere in the document.
  next = next.replace(
    /(<script id=["']apertureV3IdentityAndDrawerStabilityGuard["'][^>]*>[\s\S]*?\bconst VERSION\s*=\s*)["'][^"']+["']([\s\S]*?\bconst SCHEMA\s*=\s*)["'][^"']+["']/,
    `$1'${version}'$2'${schema}'`
  );
  next = next.replace(
    /\[0,\s*220,\s*900,\s*1800\]\.forEach\(delay\s*=>\s*setTimeout\(applyIdentity,\s*delay\)\);/,
    `requestAnimationFrame(applyIdentity);`
  );

  return next;
}

export function updateApertureIndexHtml(html, metadata, token) {
  const version = metadata.version;
  let next = setMetaContent(html, 'aperture-version', version);
  next = next.replace(
    /(<iframe\b[^>]*\bid=["']td613ApertureTool["'][^>]*\bsrc=["']\.\/tool\.html\?v=)[^"']+(["'][^>]*>)/i,
    `$1${token}$2`
  );
  return next;
}

export function updateAssetVersionsJs(js, token) {
  return js.replace(/(\baperture:\s*['"])[^'"]+(['"])/, `$1${token}$2`);
}

export function updateApertureEngineJs(js, metadata) {
  const version = metadata.version;
  const schema = metadata.schema || `td613-aperture/${version}`;
  const featureVersion = metadata.featureVersion || version;
  return js
    .replace(/(TD613_APERTURE_VERSION\s*=\s*['"])[^'"]+(['"])/, `$1${version}$2`)
    .replace(/(TD613_APERTURE_SCHEMA\s*=\s*['"])[^'"]+(['"])/, `$1${schema}$2`)
    .replace(/(TD613_APERTURE_FEATURE_VERSION\s*=\s*['"])[^'"]+(['"])/, `$1${featureVersion}$2`);
}

export function releaseManifestFromMetadata(metadata, currentRelease = {}) {
  const version = metadata.version;
  const apertureSchema = metadata.schema || `td613-aperture/${version}`;
  const isV31 = /^v3\.1(?:-|$)/.test(version);
  const compatibilityReceiptVersion = isV31 ? 'v3.0-alpha' : version;
  return {
    ...currentRelease,
    schema: 'td613.aperture.release/v1',
    version,
    apertureSchema,
    featureVersion: metadata.featureVersion || version,
    doctrineKernelSchema: metadata.doctrineKernelSchema || `td613.aperture.doctrine-kernel/${version}`,
    domeBridgeSchema: `td613.aperture.reciprocal-receipt-bridge/${version}`,
    phase4BridgeContract: currentRelease.phase4BridgeContract || 'td613.phase4.reciprocal-bridge/v0.1',
    phase4ReadinessStatus: currentRelease.phase4ReadinessStatus || 'phase-4-active',
    phase4ProductionStatus: currentRelease.phase4ProductionStatus || 'IMPLEMENTED_PRODUCTION_DEMONSTRATED',
    domeDiagnosticReceiptSchema: `td613.aperture.diagnostic-receipt/${compatibilityReceiptVersion}`,
    flowCoreContextReceiptSchema: 'td613.flowcore.context-receipt/v0.1',
    legacyFlowCoreContextReceiptSchema: 'td613.flowcore.context-receipt/vNext',
    returnedContextAuditSchema: currentRelease.returnedContextAuditSchema || 'td613.aperture.returned-context-audit/v0.1',
    roundTripReceiptSchema: `td613.aperture.round-trip-receipt/${compatibilityReceiptVersion}`,
    bridgePosture: 'reciprocal_receipts_without_reciprocal_authority',
    compatibility: {
      ...(currentRelease.compatibility || {}),
      phase4ReceiptSchemaVersion: compatibilityReceiptVersion,
      v3ProducerMayEmitV30BridgeReceipts: isV31,
      phase5RelationEnvelopeUnchanged: true
    },
    observatory: isV31 ? {
      status: currentRelease.observatory?.status || 'IMPLEMENTED_VALIDATION_GATED',
      productionStatus: currentRelease.observatory?.productionStatus || 'PRODUCTION_GATED',
      capabilityProfile: ['reciprocal-bridge', 'admissibility-tomography'],
      domeExperimentSchema: currentRelease.observatory?.domeExperimentSchema || 'td613.dome-world.experiment-run/v0.2',
      flowCoreContextSeriesSchema: currentRelease.observatory?.flowCoreContextSeriesSchema || 'td613.flowcore.context-series/v0.2',
      instrumentAdapterReceiptSchema: currentRelease.observatory?.instrumentAdapterReceiptSchema || 'td613.aperture.instrument-adapter-receipt/v0.2',
      tomographyReceiptSchema: currentRelease.observatory?.tomographyReceiptSchema || 'td613.aperture.admissibility-tomography-receipt/v0.2',
      tomographyReplaySchema: currentRelease.observatory?.tomographyReplaySchema || 'td613.aperture.tomography-replay/v0.2',
      evidenceRecord: {
        fields: ['source_status', 'evidence_basis', 'observations', 'missingness', 'alternatives', 'open_questions', 'operator_notes', 'closure'],
        researchNotes: {
          default: 'OFF',
          humanOperated: true,
          modelContextInjection: false
        },
        legacyLimitingVocabularyCurrent: false
      }
    } : currentRelease.observatory,
    ash: isV31 ? {
      version: currentRelease.ash?.version || 'v1.0-alpha',
      phase: currentRelease.ash?.phase || 'ASH_KEEP_CASE_MAP_RUNTIME',
      status: currentRelease.ash?.status || 'IMPLEMENTED_VALIDATION_GATED',
      productionStatus: currentRelease.ash?.productionStatus || 'PRODUCTION_GATED',
      experimentCustodySchema: currentRelease.ash?.experimentCustodySchema || 'td613.ash.experiment-custody-manifest/v0.2',
      snapshotBatchSchema: currentRelease.ash?.snapshotBatchSchema || 'td613.ash.snapshot-batch-receipt/v0.2',
      tomographyResultCustodySchema: currentRelease.ash?.tomographyResultCustodySchema || 'td613.ash.tomography-result-custody/v0.2',
      derivativeEligibilitySchema: currentRelease.ash?.derivativeEligibilitySchema || 'td613.ash.derivative-eligibility-receipt/v0.2',
      automaticCinder: false,
      transport: false
    } : currentRelease.ash,
    domeWorld: {
      ...(currentRelease.domeWorld || {}),
      version: isV31 ? (currentRelease.domeWorld?.version || 'v0.7.0-alpha') : (currentRelease.domeWorld?.version || 'v0.5.0'),
      schema: isV31 ? (currentRelease.domeWorld?.schema || 'td613.dome-world/v0.7.0-alpha') : (currentRelease.domeWorld?.schema || 'td613.dome-world/v0.5.0'),
      exactReceiptSchema: currentRelease.domeWorld?.exactReceiptSchema || 'td613.dome-world.exact-receipt/v0.4.3'
    },
    observedRegime: 'PRCS-A',
    eorfd: {
      operationalState: 'interface_context',
      claimAuthority: 'design_signal',
      targetOperationalState: 'verified_runtime_installation'
    }
  };
}

export async function writeStage(candidatePath) {
  const candidate = await readHtmlArtifact(candidatePath);
  const repo = await readHtmlArtifact(APERTURE_TOOL_PATH);
  const comparison = summarizeComparison(candidate, repo);
  const now = new Date().toISOString();
  const manifest = {
    schema: 'td613.aperture.sync-lane.stage/v1',
    stagedAt: now,
    mutatesLiveRepo: false,
    originalPath: candidate.path,
    stagedPath: STAGED_HTML_PATH,
    candidate: summarizeArtifact(candidate),
    repo: summarizeArtifact(repo),
    comparison
  };

  await fs.mkdir(STAGING_DIR, { recursive: true });
  await fs.copyFile(candidate.path, STAGED_HTML_PATH);
  await writeJson(STAGED_MANIFEST_PATH, manifest);
  await writeText(STAGED_REPORT_PATH, formatMarkdownReport('Aperture Stage Report', manifest));
  return manifest;
}

export async function readStageManifest() {
  if (!(await fileExists(STAGED_MANIFEST_PATH)) || !(await fileExists(STAGED_HTML_PATH))) {
    throw new Error('No staged Aperture candidate found. Run: npm run aperture:stage -- "<path-to-html>"');
  }
  return JSON.parse(await readText(STAGED_MANIFEST_PATH));
}

export async function promoteStagedCandidate() {
  const manifest = await readStageManifest();
  const candidate = await readHtmlArtifact(STAGED_HTML_PATH);
  const repoBefore = await readHtmlArtifact(APERTURE_TOOL_PATH);
  const token = currentCacheToken();
  const normalizedHtml = normalizeApertureForRepo(candidate.html, candidate.metadata);
  const normalizedMetadata = extractApertureMetadata(normalizedHtml, APERTURE_TOOL_PATH);

  await fs.mkdir(STAGING_DIR, { recursive: true });
  await writeText(path.join(STAGING_DIR, 'tool.before-promote.html'), repoBefore.html);
  await writeText(APERTURE_TOOL_PATH, normalizedHtml);
  await writeText(APERTURE_INDEX_PATH, updateApertureIndexHtml(await readText(APERTURE_INDEX_PATH), normalizedMetadata, token));
  await writeText(ASSET_VERSIONS_PATH, updateAssetVersionsJs(await readText(ASSET_VERSIONS_PATH), token));
  await writeText(APERTURE_ENGINE_PATH, updateApertureEngineJs(await readText(APERTURE_ENGINE_PATH), normalizedMetadata));
  const currentRelease = await fileExists(APERTURE_RELEASE_PATH)
    ? JSON.parse(await readText(APERTURE_RELEASE_PATH))
    : {};
  await writeJson(APERTURE_RELEASE_PATH, releaseManifestFromMetadata(normalizedMetadata, currentRelease));

  const promoted = await readHtmlArtifact(APERTURE_TOOL_PATH);
  const promotion = {
    ...manifest,
    schema: 'td613.aperture.sync-lane.promotion/v1',
    promotedAt: new Date().toISOString(),
    cacheToken: token,
    repoBefore: summarizeArtifact(repoBefore),
    repoAfter: summarizeArtifact(promoted),
    normalizedMetadata
  };
  await writeJson(path.join(STAGING_DIR, 'promotion.json'), promotion);
  await writeText(path.join(STAGING_DIR, 'promotion.md'), formatMarkdownReport('Aperture Promotion Report', promotion));
  return promotion;
}

export async function exportRepoApertureToDownloads(outputDir = defaultDownloadsDir()) {
  const repo = await readHtmlArtifact(APERTURE_TOOL_PATH);
  const version = repo.metadata.version || 'unversioned';
  const safeVersion = version.replace(/\./g, '_');
  const canonicalPath = path.join(outputDir, 'Aperture.html');
  const versionedPath = path.join(outputDir, `Aperture_${safeVersion}.html`);
  const manifestPath = path.join(outputDir, `Aperture_${safeVersion}.manifest.json`);
  const manifest = {
    schema: 'td613.aperture.sync-lane.export/v1',
    exportedAt: new Date().toISOString(),
    source: APERTURE_TOOL_PATH,
    outputs: [canonicalPath, versionedPath],
    artifact: summarizeArtifact(repo)
  };

  await fs.mkdir(outputDir, { recursive: true });
  await fs.copyFile(APERTURE_TOOL_PATH, canonicalPath);
  await fs.copyFile(APERTURE_TOOL_PATH, versionedPath);
  await writeJson(manifestPath, manifest);
  return manifest;
}

export async function findDefaultDownloadsAperture() {
  const dir = defaultDownloadsDir();
  if (!(await fileExists(dir))) return null;
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const candidates = [];
  for (const entry of entries) {
    if (!entry.isFile() || !/^Aperture(?:_v[\d_]+)?\.html$/i.test(entry.name)) continue;
    const filePath = path.join(dir, entry.name);
    const stat = await fs.stat(filePath);
    candidates.push({ filePath, mtimeMs: stat.mtimeMs });
  }
  candidates.sort((a, b) => b.mtimeMs - a.mtimeMs);
  return candidates[0]?.filePath || null;
}

export function defaultDownloadsDir() {
  return path.join(os.homedir(), 'Downloads');
}

export function formatMarkdownReport(title, data) {
  return [
    `# ${title}`,
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
    '```json',
    JSON.stringify(data, null, 2),
    '```',
    ''
  ].join('\n');
}

export async function writeJson(filePath, value) {
  await writeText(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

export function summarizeArtifact(artifact) {
  return {
    path: artifact.path,
    bytes: artifact.bytes,
    lines: artifact.lines,
    sha256: artifact.sha256,
    version: artifact.metadata.version,
    schema: artifact.metadata.schema,
    featureVersion: artifact.metadata.featureVersion,
    doctrineKernelSchema: artifact.metadata.doctrineKernelSchema,
    mojibakeSignals: artifact.metadata.mojibakeSignals,
    duplicateIdCount: artifact.metadata.duplicateIds.length,
    blocks: artifact.metadata.blocks,
    globals: artifact.metadata.globals
  };
}

function comparisonRecommendation(status) {
  if (status === 'candidate-newer') return 'Stage and test the candidate before promoting it into the repo.';
  if (status === 'repo-newer') return 'Export the repo-approved Aperture to Downloads if the local operator copy is stale.';
  if (status === 'byte-identical') return 'No import or export is needed.';
  if (status === 'same-version-different-content') return 'Inspect the diff; same-version drift should be staged or exported deliberately.';
  return 'Inspect metadata before choosing import or export.';
}

function parseVersion(version) {
  const match = String(version || '').match(/^v(\d+(?:\.\d+){1,3})/);
  return match ? match[1].split('.').map((part) => Number(part)) : null;
}

function firstVersion(html) {
  return firstMatch(html, /\bv\d+(?:\.\d+){1,3}(?:-[A-Za-z0-9_.]+)?\b/);
}

function firstMeta(html, name) {
  const tags = [...html.matchAll(/<meta\b[^>]*>/gi)].map((match) => match[0]);
  for (const tag of tags) {
    const metaName = firstMatch(tag, /\bname=["']([^"']+)["']/i);
    if (metaName !== name) continue;
    return firstMatch(tag, /\bcontent=["']([^"']*)["']/i);
  }
  return null;
}

function firstMatch(html, pattern) {
  const match = html.match(pattern);
  return match ? match[1] || match[0] : null;
}

function hasId(html, id) {
  return new RegExp(`\\bid=["']${escapeRegex(id)}["']`).test(html);
}

function setMetaContent(html, name, content) {
  if (!content) return html;
  const tagPattern = /<meta\b[^>]*>/gi;
  return html.replace(tagPattern, (tag) => {
    const metaName = firstMatch(tag, /\bname=["']([^"']+)["']/i);
    if (metaName !== name) return tag;
    if (/\bcontent=["'][^"']*["']/i.test(tag)) {
      return tag.replace(/(\bcontent=["'])[^"']*(["'])/i, `$1${content}$2`);
    }
    return tag.replace(/\/?>$/, (ending) => ` content="${content}"${ending}`);
  });
}

function countMatches(text, pattern) {
  return [...text.matchAll(pattern)].length;
}

function countBy(values) {
  return values.reduce((acc, value) => {
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

function findDuplicateDomIds(html) {
  const ids = [];
  const stack = [parse(html)];
  while (stack.length) {
    const node = stack.pop();
    const id = node?.attrs?.find((attribute) => attribute.name === 'id')?.value;
    if (id) ids.push(id);
    if (Array.isArray(node?.childNodes)) stack.push(...node.childNodes);
    if (node?.content) stack.push(node.content);
  }
  return Object.entries(countBy(ids))
    .filter(([, count]) => count > 1)
    .map(([id, count]) => ({ id, count }));
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
