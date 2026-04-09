import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

function normalizeWhitespace(value = '') {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function escapeRegExp(value = '') {
  return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function extractAttr(fragment = '', name = '') {
  const match = fragment.match(new RegExp(`${escapeRegExp(name)}\\s*=\\s*(["'])(.*?)\\1`, 'i'));
  return match ? match[2] : null;
}

function extractTitle(source = '') {
  const match = source.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return normalizeWhitespace(match?.[1] || '');
}

function extractMetaMap(source = '') {
  const meta = {};
  const metaMatches = source.match(/<meta\b[^>]*>/gi) || [];
  metaMatches.forEach((tag) => {
    const name = extractAttr(tag, 'name');
    if (!name) {
      return;
    }
    meta[name] = extractAttr(tag, 'content') || '';
  });
  return meta;
}

function extractBodyDataset(source = '') {
  const dataset = {};
  const bodyMatch = source.match(/<body\b([^>]*)>/i);
  const bodyAttrs = bodyMatch?.[1] || '';
  const dataAttrMatches = bodyAttrs.match(/\bdata-[a-z0-9_-]+\s*=\s*(["']).*?\1/gi) || [];
  dataAttrMatches.forEach((attr) => {
    const nameMatch = attr.match(/\b(data-[a-z0-9_-]+)/i);
    if (!nameMatch) {
      return;
    }
    dataset[nameMatch[1].replace(/^data-/i, '')] = extractAttr(attr, nameMatch[1]) || '';
  });
  return dataset;
}

function hasPattern(source = '', pattern) {
  const flags = pattern.flags.replace(/g/g, '');
  return new RegExp(pattern.source, flags).test(source);
}

function createCheck(id, label, ok, detail, expected = null, actual = null) {
  return {
    id,
    label,
    ok: Boolean(ok),
    detail: normalizeWhitespace(detail),
    expected,
    actual
  };
}

function evaluateHtmlAnnex(spec, repoRoot) {
  const absolutePath = path.resolve(repoRoot, spec.relativePath);
  const relativePath = path.relative(repoRoot, absolutePath).replace(/\\/g, '/');

  if (!fs.existsSync(absolutePath)) {
    return {
      id: spec.id,
      label: spec.label,
      file: relativePath,
      passed: false,
      fingerprint: null,
      title: null,
      version: null,
      meta: {},
      bodyDataset: {},
      checks: [
        createCheck('file-exists', 'file exists', false, `${relativePath} is missing`, 'existing file', 'missing')
      ],
      checkSummary: {
        total: 1,
        passed: 0,
        failed: 1
      }
    };
  }

  const source = fs.readFileSync(absolutePath, 'utf8');
  const title = extractTitle(source);
  const versionMatch = source.match(spec.versionPattern || /v([0-9.]+)/i);
  const version = versionMatch?.[1] || null;
  const meta = extractMetaMap(source);
  const bodyDataset = extractBodyDataset(source);
  const inlineScriptCount = (source.match(/<script\b(?![^>]*\bsrc=)/gi) || []).length;
  const fingerprint = {
    bytes: Buffer.byteLength(source, 'utf8'),
    lineCount: source.split(/\r?\n/).length,
    inlineScriptCount,
    panelCount: (source.match(/\bclass\s*=\s*(["'])[^"']*\bpanel\b[^"']*\1/gi) || []).length,
    buttonCount: (source.match(/<button\b/gi) || []).length,
    contentHashSha256: crypto.createHash('sha256').update(source, 'utf8').digest('hex')
  };

  const checks = [
    createCheck(
      'title',
      'title marker',
      spec.titleIncludes.every((token) => title.includes(token)),
      `${title || 'missing title'} observed`,
      spec.titleIncludes.join(' + '),
      title
    ),
    createCheck(
      'version',
      'version marker',
      version === spec.expectedVersion,
      `version ${version || 'missing'} observed`,
      spec.expectedVersion,
      version
    ),
    createCheck(
      'inline-script',
      'inline runtime present',
      inlineScriptCount >= spec.minimumInlineScripts,
      `${inlineScriptCount} inline script block(s)`,
      `>= ${spec.minimumInlineScripts}`,
      inlineScriptCount
    )
  ];

  Object.entries(spec.meta).forEach(([name, expected]) => {
    const actual = meta[name] || null;
    checks.push(
      createCheck(
        `meta:${name}`,
        `meta ${name}`,
        actual === expected,
        `${name} => ${actual || 'missing'}`,
        expected,
        actual
      )
    );
  });

  Object.entries(spec.bodyDataset).forEach(([name, expected]) => {
    const actual = bodyDataset[name] || null;
    checks.push(
      createCheck(
        `body:${name}`,
        `body dataset ${name}`,
        actual === expected,
        `${name} => ${actual || 'missing'}`,
        expected,
        actual
      )
    );
  });

  spec.requiredIds.forEach((id) => {
    checks.push(
      createCheck(
        `id:${id}`,
        `id ${id}`,
        hasPattern(source, new RegExp(`id=["']${escapeRegExp(id)}["']`, 'i')),
        `${id} ${hasPattern(source, new RegExp(`id=["']${escapeRegExp(id)}["']`, 'i')) ? 'present' : 'missing'}`
      )
    );
  });

  spec.requiredFunctions.forEach((fnName) => {
    const pattern = new RegExp(`(?:function\\s+${escapeRegExp(fnName)}\\s*\\(|window\\.${escapeRegExp(fnName)}\\s*=|const\\s+${escapeRegExp(fnName)}\\s*=)`, 'i');
    checks.push(
      createCheck(
        `fn:${fnName}`,
        `function ${fnName}`,
        hasPattern(source, pattern),
        `${fnName} ${hasPattern(source, pattern) ? 'present' : 'missing'}`
      )
    );
  });

  spec.requiredPatterns.forEach(({ id, label, pattern, detail }) => {
    checks.push(
      createCheck(
        `pattern:${id}`,
        label,
        hasPattern(source, pattern),
        detail || `${label} ${hasPattern(source, pattern) ? 'present' : 'missing'}`
      )
    );
  });

  const passedChecks = checks.filter((check) => check.ok);
  const failedChecks = checks.filter((check) => !check.ok);

  return {
    id: spec.id,
    label: spec.label,
    file: relativePath,
    passed: failedChecks.length === 0,
    title,
    version,
    meta,
    bodyDataset,
    fingerprint,
    checks,
    failedChecks,
    checkSummary: {
      total: checks.length,
      passed: passedChecks.length,
      failed: failedChecks.length
    }
  };
}

const ANNEX_SPECS = Object.freeze([
  Object.freeze({
    id: 'aperture',
    label: 'TD613 Aperture',
    relativePath: 'app/aperture/index.html',
    expectedVersion: '1.8.0',
    versionPattern: /TD613 APERTURE v([0-9.]+) SOURCE DECLARATION/i,
    titleIncludes: ['TD613 Aperture', 'v1.8.0'],
    minimumInlineScripts: 1,
    meta: Object.freeze({
      'tool-name': 'TD613 Aperture',
      'tool-role': 'counter-tool',
      'observed-regime': 'PRCS-A',
      'anti-enforcement': 'true'
    }),
    bodyDataset: Object.freeze({
      'tool-name': 'TD613 Aperture',
      'tool-role': 'counter-tool',
      'observed-regime': 'PRCS-A',
      'anti-enforcement': 'true'
    }),
    requiredIds: Object.freeze([
      'leftPanel',
      'centerArea',
      'rightPanel',
      'humanRoutePanel',
      'tcpBridgePanel',
      'btnTCPExport',
      'td613SchemaPanel',
      'diffAuditPanel',
      'ethicsAuditPanel',
      'schemaVersionReadout',
      'diffAuditMatrix',
      'ethicsAuditTable'
    ]),
    requiredFunctions: Object.freeze([
      'resetSystem',
      'createTCPHandoffPacket',
      'scrubPacketEnvelope',
      'triggerPreparedTCPHandoff'
    ]),
    requiredPatterns: Object.freeze([
      {
        id: 'source-declaration',
        label: 'source declaration',
        pattern: /TD613 APERTURE v1\.8\.0 SOURCE DECLARATION/i
      },
      {
        id: 'counter-tool-stance',
        label: 'counter-tool stance',
        pattern: /counter-tool/i
      },
      {
        id: 'anti-enforcement-stance',
        label: 'anti-enforcement stance',
        pattern: /anti-enforcement/i
      },
      {
        id: 'observed-regime',
        label: 'PRCS-A regime marker',
        pattern: /\bPRCS-A\b/i
      },
      {
        id: 'tool-identity',
        label: 'TD613 Aperture identity marker',
        pattern: /TD613 Aperture/i
      },
      {
        id: 'source-global',
        label: 'source declaration global',
        pattern: /window\.APERTURE_SOURCE_DECLARATION\s*=/i
      },
      {
        id: 'aperture-global',
        label: 'Aperture runtime definition',
        pattern: /const\s+APERTURE\s*=\s*\{/i
      },
      {
        id: 'packet-export-gate',
        label: 'packet export gate',
        pattern: /EXPORT GATED/i
      },
      {
        id: 'route-classes',
        label: 'route class sync',
        pattern: /route-warning[\s\S]*route-buffer[\s\S]*route-harbor/i
      },
      {
        id: 'residue-packet',
        label: 'non-identifying packet copy',
        pattern: /non-identifying audit packet/i
      },
      {
        id: 'governed-exposure-schema',
        label: 'governed exposure schema marker',
        pattern: /td613-governed-exposure\/v1/i
      },
      {
        id: 'differential-admissibility',
        label: 'differential admissibility panel',
        pattern: /DIFFERENTIAL ADMISSIBILITY/i
      },
      {
        id: 'ethics-audit',
        label: 'protective vocabulary reassignment panel',
        pattern: /PROTECTIVE VOCABULARY REASSIGNMENT/i
      },
      {
        id: 'packet-forensic-schema',
        label: 'packet forensic schema export',
        pattern: /packet\.forensicSchema\s*=/i
      }
    ])
  })
]);

export function buildAnnexDiagnostics(repoRoot) {
  return Object.freeze(
    Object.fromEntries(
      ANNEX_SPECS.map((spec) => [spec.id, evaluateHtmlAnnex(spec, repoRoot)])
    )
  );
}

export function buildAnnexMarkdown(entry) {
  const lines = [
    `# ${entry.label} Annex Diagnostics`,
    '',
    `Source: ${entry.file}`,
    `Status: ${entry.passed ? 'passed' : 'failed'}`,
    `Version: ${entry.version || 'unknown'}`,
    `Title: ${entry.title || 'missing'}`,
    ''
  ];

  if (entry.fingerprint) {
    lines.push('## Fingerprint', '');
    lines.push(`- bytes: ${entry.fingerprint.bytes}`);
    lines.push(`- line_count: ${entry.fingerprint.lineCount}`);
    lines.push(`- inline_script_count: ${entry.fingerprint.inlineScriptCount}`);
    lines.push(`- panel_count: ${entry.fingerprint.panelCount}`);
    lines.push(`- button_count: ${entry.fingerprint.buttonCount}`);
    lines.push(`- content_hash_sha256: ${entry.fingerprint.contentHashSha256}`);
    lines.push('');
  }

  lines.push('## Checks', '');
  entry.checks.forEach((check) => {
    lines.push(`- [${check.ok ? 'pass' : 'fail'}] ${check.label}: ${check.detail}`);
  });

  return `${lines.join('\n')}\n`;
}
