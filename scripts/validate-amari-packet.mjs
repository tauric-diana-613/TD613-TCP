import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const SCHEMA_VERSION = 'td613-amari-patch/v1';
const MAX_FILES = 12;
const MAX_OPERATIONS = 40;
const MAX_FIELD_CHARS = 12000;
const GENERATED_PATTERNS = [
  /^app\/browser-engine\.js$/i,
  /^app\/browser-diagnostics\.js$/i,
  /^app\/browser-data\.js$/i,
  /^app\/defaults\.json$/i,
  /^app\/data\/personas\.json$/i,
  /^app\/retrieval-fixtures\.js$/i
];
const BLOCKED_PATH_PARTS = new Set(['.git', 'node_modules', 'dist', 'build', 'coverage']);
const EXACT_TYPES = new Set(['replace-exact', 'delete-exact', 'insert-before', 'insert-after']);
const VALID_TYPES = new Set([...EXACT_TYPES, 'note', 'manual-diff']);

function fail(message) {
  console.error(`amari-packet invalid: ${message}`);
  process.exit(1);
}

function warn(message) {
  console.warn(`amari-packet warning: ${message}`);
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function assertString(value, label, { required = true } = {}) {
  if (!required && (value === undefined || value === null || value === '')) return '';
  if (typeof value !== 'string' || !value.trim()) fail(`${label} must be a non-empty string`);
  if (value.length > MAX_FIELD_CHARS) fail(`${label} is too large (${value.length} chars; max ${MAX_FIELD_CHARS})`);
  return value;
}

function normalizeRepoPath(filePath, label = 'path') {
  const raw = assertString(filePath, label).replaceAll('\\', '/');
  if (path.isAbsolute(raw)) fail(`${label} must be repo-relative: ${raw}`);
  const normalized = path.posix.normalize(raw);
  if (normalized.startsWith('../') || normalized === '..') fail(`${label} must not escape repo root: ${raw}`);
  const parts = normalized.split('/');
  if (parts.some((part) => BLOCKED_PATH_PARTS.has(part))) fail(`${label} points into blocked directory: ${raw}`);
  return normalized;
}

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    fail(`could not read JSON packet ${filePath}: ${error.message}`);
  }
}

function countOccurrences(text, needle) {
  if (!needle) return 0;
  let count = 0;
  let index = 0;
  while (true) {
    const found = text.indexOf(needle, index);
    if (found === -1) return count;
    count += 1;
    index = found + needle.length;
  }
}

function validateOperation(operation, index, declaredFiles) {
  if (!operation || typeof operation !== 'object' || Array.isArray(operation)) {
    fail(`operations[${index}] must be an object`);
  }
  const type = assertString(operation.type, `operations[${index}].type`);
  if (!VALID_TYPES.has(type)) fail(`operations[${index}].type is not supported: ${type}`);

  if (type === 'note') return;

  const opPath = normalizeRepoPath(operation.path, `operations[${index}].path`);
  if (!declaredFiles.has(opPath)) {
    fail(`operations[${index}].path is not listed in files: ${opPath}`);
  }
  if (GENERATED_PATTERNS.some((pattern) => pattern.test(opPath))) {
    warn(`operation targets generated/mirrored file; prefer source module plus sync script: ${opPath}`);
  }

  const absPath = path.join(ROOT, opPath);
  if (!fs.existsSync(absPath)) fail(`operations[${index}].path does not exist: ${opPath}`);
  const current = fs.readFileSync(absPath, 'utf8');

  if (type === 'manual-diff') {
    assertString(operation.summary, `operations[${index}].summary`);
    return;
  }

  const needle = type.startsWith('insert-')
    ? assertString(operation.anchor, `operations[${index}].anchor`)
    : assertString(operation.find, `operations[${index}].find`);
  const occurrences = countOccurrences(current, needle);
  if (occurrences === 0) fail(`operations[${index}] anchor was not found in ${opPath}`);
  if (occurrences > 1) fail(`operations[${index}] anchor is ambiguous in ${opPath} (${occurrences} matches)`);

  if (type === 'replace-exact') assertString(operation.replace, `operations[${index}].replace`, { required: true });
  if (type.startsWith('insert-')) assertString(operation.insert, `operations[${index}].insert`, { required: true });
}

const packetPath = process.argv[2];
if (!packetPath) fail('usage: node scripts/validate-amari-packet.mjs path/to/packet.json');

const packet = readJson(packetPath);
if (!packet || typeof packet !== 'object' || Array.isArray(packet)) fail('packet root must be an object');

assertString(packet.schemaVersion, 'schemaVersion');
if (packet.schemaVersion !== SCHEMA_VERSION) fail(`schemaVersion must be ${SCHEMA_VERSION}`);

assertString(packet.patchId, 'patchId');
assertString(packet.intent, 'intent');
assertString(packet.scope, 'scope');
assertString(packet.risk, 'risk');
if (!['low', 'medium', 'high'].includes(packet.risk)) fail('risk must be low, medium, or high');

const files = asArray(packet.files);
if (!files.length) fail('files must list at least one target file');
if (files.length > MAX_FILES) fail(`files lists too many targets (${files.length}; max ${MAX_FILES})`);
const normalizedFiles = files.map((filePath, index) => normalizeRepoPath(filePath, `files[${index}]`));
const declaredFiles = new Set(normalizedFiles);
if (declaredFiles.size !== normalizedFiles.length) fail('files contains duplicate paths');
for (const filePath of normalizedFiles) {
  if (!fs.existsSync(path.join(ROOT, filePath))) warn(`declared file does not exist yet: ${filePath}`);
  if (GENERATED_PATTERNS.some((pattern) => pattern.test(filePath))) {
    warn(`declared target appears generated/mirrored; prefer editing source modules: ${filePath}`);
  }
}

const operations = asArray(packet.operations);
if (!operations.length) fail('operations must include at least one operation');
if (operations.length > MAX_OPERATIONS) fail(`operations has too many entries (${operations.length}; max ${MAX_OPERATIONS})`);
operations.forEach((operation, index) => validateOperation(operation, index, declaredFiles));

const tests = asArray(packet.tests);
if (!tests.length) warn('tests is empty; Codex should choose targeted checks before merge');
for (const [index, test] of tests.entries()) assertString(test, `tests[${index}]`);

console.log(`amari-packet valid: ${packet.patchId} (${operations.length} operations, ${files.length} files)`);
