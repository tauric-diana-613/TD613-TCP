#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const DEFAULT_ROOT = path.resolve(HERE, '..');

const INCLUDED_TOP_LEVEL = new Set([
  '01-MANIFESTS',
  '03-DERIVATIVES',
  '04-RECEIPTS',
  '05-OPERATIONS',
  '06-INSTRUMENTS',
  '07-ARCHIVE-LEDGER',
  '08-EXTERNAL-CORPORA'
]);
const INCLUDED_ROOT_FILES = new Set(['README.md', 'CONNECTOR_ENTRY.md', 'ATELIER_PROFILE.json']);
const TEXT_EXTENSIONS = new Set(['.json', '.jsonl', '.md', '.txt']);
const STOP = new Set(['the','a','an','and','or','of','to','in','on','for','with','as','by','from','is','are','be','this','that','it','its','into','not']);
const ACTOR_ALIASES = ['PAUL', 'Upset-Ratio502', 'Wendbine'];

function walk(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.isFile() && TEXT_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) out.push(full);
  }
  return out;
}

function normalizeToken(value) {
  return String(value ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[_/\\:|→·—–-]+/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function tokens(value) {
  return [...new Set(normalizeToken(value).split(/\s+/).filter(Boolean).filter(token => token.length > 1 && !STOP.has(token)))];
}

function flatten(value, out = []) {
  if (value == null) return out;
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') out.push(String(value));
  else if (Array.isArray(value)) for (const item of value) flatten(item, out);
  else if (typeof value === 'object') for (const [key, item] of Object.entries(value)) { out.push(key); flatten(item, out); }
  return out;
}

function inferredDate(record, relPath) {
  const candidates = [
    record?.public_date,
    record?.observed_in_chat_date,
    record?.retrieval_day_utc,
    record?.date_policy?.observed_on,
    record?.created_at,
    record?.date,
    record?.retrieved_at,
    record?.observed_at
  ].filter(Boolean);
  if (candidates.length) return String(candidates[0]);
  const match = relPath.match(/(20\d{2})[-_]?([01]\d)[-_]?([0-3]\d)/);
  return match ? `${match[1]}-${match[2]}-${match[3]}` : null;
}

function statusOf(record) {
  return record?.source_binding_state
    ?? record?.public_surface_status
    ?? record?.state
    ?? record?.coverage?.state
    ?? record?.refresh?.state
    ?? record?.status
    ?? null;
}

function idOf(record, relPath, ordinal) {
  return record?.source_id
    ?? record?.snapshot_id
    ?? record?.atelier_snapshot_id
    ?? record?.receipt_id
    ?? record?.record_id
    ?? record?.observation_id
    ?? record?.evidence_id
    ?? `${relPath}#${ordinal}`;
}

function conceptValues(record) {
  const values = [];
  for (const key of ['declared_concepts','concepts','normalized_spine','strongest_recurrences','claim_ceiling','membranes']) {
    if (record?.[key] != null) flatten(record[key], values);
  }
  if (record?.source_explicit_relations) flatten(record.source_explicit_relations, values);
  if (record?.source_explicit_role_witnesses) flatten(record.source_explicit_role_witnesses, values);
  return values;
}

function makeEntry(record, relPath, ordinal, kind) {
  const flattened = flatten(record).join(' ');
  const conceptText = conceptValues(record).join(' ');
  const header = String(record?.technical_header ?? record?.title ?? record?.name ?? '');
  const summary = String(record?.normalized_summary ?? record?.summary ?? record?.claim ?? '');
  const isPublicRedditSource = /public-reddit.*source-registry/i.test(relPath);
  const aliasText = isPublicRedditSource ? ACTOR_ALIASES.join(' ') : '';
  const searchText = [relPath, aliasText, header, summary, conceptText, flattened].filter(Boolean).join(' ');
  return {
    id: idOf(record, relPath, ordinal),
    schema: record?.schema ?? record?.schema_version ?? null,
    path: relPath,
    ordinal,
    kind,
    date: inferredDate(record, relPath),
    time_precision: record?.time_precision ?? (record?.public_date ? 'DECLARED_BY_RECORD' : null),
    status: statusOf(record),
    canonical_url: record?.canonical_url ?? null,
    technical_header: header || null,
    normalized_summary: summary || null,
    declared_concepts: Array.isArray(record?.declared_concepts) ? record.declared_concepts : [],
    record,
    search_text: normalizeToken(searchText),
    header_tokens: tokens(header),
    summary_tokens: tokens(summary),
    concept_tokens: tokens(conceptText),
    all_tokens: tokens(searchText),
    query_aliases: isPublicRedditSource ? ACTOR_ALIASES : []
  };
}

function parseFile(root, file) {
  const relPath = path.relative(root, file).replaceAll(path.sep, '/');
  const raw = fs.readFileSync(file, 'utf8');
  const ext = path.extname(file).toLowerCase();
  if (ext === '.jsonl') {
    return raw.split(/\r?\n/).filter(line => line.trim()).map((line, index) => makeEntry(JSON.parse(line), relPath, index + 1, 'JSONL_RECORD'));
  }
  if (ext === '.json') return [makeEntry(JSON.parse(raw), relPath, 1, 'JSON_DOCUMENT')];
  return [makeEntry({ text: raw }, relPath, 1, 'TEXT_DOCUMENT')];
}

export function buildIndex(root = DEFAULT_ROOT) {
  const files = [];
  for (const top of INCLUDED_TOP_LEVEL) files.push(...walk(path.join(root, top)));
  for (const file of INCLUDED_ROOT_FILES) {
    const full = path.join(root, file);
    if (fs.existsSync(full)) files.push(full);
  }
  return files.sort().flatMap(file => parseFile(root, file));
}

function publicView(entry, score = undefined, match_basis = undefined) {
  const out = {
    id: entry.id,
    schema: entry.schema,
    path: entry.path,
    ordinal: entry.ordinal,
    kind: entry.kind,
    date: entry.date,
    time_precision: entry.time_precision,
    status: entry.status,
    canonical_url: entry.canonical_url,
    technical_header: entry.technical_header,
    normalized_summary: entry.normalized_summary,
    declared_concepts: entry.declared_concepts,
    query_aliases: entry.query_aliases
  };
  if (score !== undefined) out.score = score;
  if (match_basis !== undefined) out.match_basis = match_basis;
  return out;
}

export function lexicalSearch(index, query, { limit = 20 } = {}) {
  const phrase = normalizeToken(query);
  const qTokens = tokens(query);
  if (!phrase) return [];
  const ranked = [];
  for (const entry of index) {
    let score = 0;
    const basis = [];
    if (entry.search_text.includes(phrase)) { score += 20; basis.push('PHRASE'); }
    for (const token of qTokens) {
      if (entry.header_tokens.includes(token)) { score += 8; basis.push(`HEADER:${token}`); }
      else if (entry.concept_tokens.includes(token)) { score += 6; basis.push(`CONCEPT:${token}`); }
      else if (entry.summary_tokens.includes(token)) { score += 4; basis.push(`SUMMARY:${token}`); }
      else if (entry.all_tokens.includes(token)) { score += 1; basis.push(`TEXT:${token}`); }
    }
    if (score > 0) ranked.push({ entry, score, basis });
  }
  return ranked.sort((a,b) => b.score - a.score || String(b.entry.date ?? '').localeCompare(String(a.entry.date ?? '')) || a.entry.path.localeCompare(b.entry.path))
    .slice(0, limit)
    .map(row => publicView(row.entry, row.score, [...new Set(row.basis)]));
}

export function semanticSearch(index, query, { limit = 20 } = {}) {
  const q = new Set(tokens(query));
  if (!q.size) return [];
  const ranked = [];
  for (const entry of index) {
    const header = new Set(entry.header_tokens);
    const concepts = new Set(entry.concept_tokens);
    const summary = new Set(entry.summary_tokens);
    const all = new Set(entry.all_tokens);
    let score = 0;
    const basis = [];
    for (const token of q) {
      if (concepts.has(token)) { score += 10; basis.push(`CONCEPT:${token}`); }
      if (header.has(token)) { score += 7; basis.push(`HEADER:${token}`); }
      if (summary.has(token)) { score += 5; basis.push(`SUMMARY:${token}`); }
      else if (all.has(token)) { score += 1; basis.push(`TEXT:${token}`); }
    }
    const conceptCoverage = [...q].filter(token => concepts.has(token)).length / q.size;
    const textualCoverage = [...q].filter(token => all.has(token)).length / q.size;
    score += Math.round(conceptCoverage * 20 + textualCoverage * 5);
    if (score > 0) ranked.push({ entry, score, basis });
  }
  return ranked.sort((a,b) => b.score - a.score || String(b.entry.date ?? '').localeCompare(String(a.entry.date ?? '')) || a.entry.path.localeCompare(b.entry.path))
    .slice(0, limit)
    .map(row => publicView(row.entry, row.score, [...new Set(row.basis)]));
}

export function recentEntries(index, { limit = 20, sourceOnly = false } = {}) {
  const rows = index.filter(entry => entry.date && (!sourceOnly || entry.canonical_url || /^reddit:|^facebook:/.test(String(entry.id))));
  return rows.sort((a,b) => String(b.date).localeCompare(String(a.date)) || a.path.localeCompare(b.path) || a.ordinal - b.ordinal)
    .slice(0, limit)
    .map(entry => publicView(entry));
}

export function resolveEntry(index, id) {
  return index.filter(entry => String(entry.id) === String(id)).map(entry => publicView(entry));
}

function argValue(args, name, fallback = null) {
  const idx = args.indexOf(name);
  return idx >= 0 && idx + 1 < args.length ? args[idx + 1] : fallback;
}

function stripOptions(args) {
  const valueOptions = new Set(['--mode','--limit']);
  const out = [];
  for (let i = 0; i < args.length; i += 1) {
    if (valueOptions.has(args[i])) { i += 1; continue; }
    if (args[i].startsWith('--')) continue;
    out.push(args[i]);
  }
  return out;
}

function main(argv = process.argv.slice(2)) {
  const index = buildIndex();
  const command = argv[0] ?? 'summary';
  const rest = argv.slice(1);
  const limit = Number(argValue(rest, '--limit', '20'));
  let result;
  if (command === 'summary') {
    result = {
      schema: 'wendbine-query-summary/v0.1',
      indexed_records: index.length,
      dated_records: index.filter(entry => entry.date).length,
      source_like_records: index.filter(entry => entry.canonical_url || /^reddit:|^facebook:/.test(String(entry.id))).length,
      held_records: index.filter(entry => /HELD|UNBOUND|STALE|NOT_EXHAUSTIVE/i.test(String(entry.status ?? ''))).length,
      archival_debt_records: index.filter(entry => /ARCHIVAL_DEBT|CAPTURE_DEBT|LOSS/i.test(String(entry.status ?? '')) || /loss-ledger/i.test(entry.path)).length,
      membranes: [
        'QUERY_MATCH != SOURCE_PROMOTION',
        'SEMANTIC_MATCH != CAUSAL_RELATION',
        'RECENCY != AUTHORITY',
        'DISPLAY_ALIAS != PERSON_IDENTITY != OPERATOR_IDENTITY != AUTHORITY',
        'HELD_RECORD_RETRIEVABLE != HELD_RECORD_PROMOTED'
      ]
    };
  } else if (command === 'search') {
    const mode = argValue(rest, '--mode', 'lexical');
    const query = stripOptions(rest).join(' ');
    result = mode === 'semantic' ? semanticSearch(index, query, { limit }) : lexicalSearch(index, query, { limit });
  } else if (command === 'recent') {
    result = recentEntries(index, { limit, sourceOnly: rest.includes('--sources') });
  } else if (command === 'resolve') {
    result = resolveEntry(index, stripOptions(rest).join(' '));
  } else {
    throw new Error(`Unknown command: ${command}`);
  }
  process.stdout.write(`${JSON.stringify({ schema:'wendbine-query-result/v0.1', command, result }, null, 2)}\n`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
