#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const DEFAULT_ROOT = path.resolve(HERE, '..');
const REPO_ROOT = path.resolve(DEFAULT_ROOT, '../../../../..');
const ALLOWED_METHODS = new Set(['AUTHOR_SUPPLIED_EXPORT', 'AUTHOR_SUPPLIED_FILE', 'REDDIT_API_OBJECT_WITH_PERMISSION', 'AUTHORIZED_RESEARCH_EXPORT']);
const ALLOWED_RIGHTS = new Set(['AUTHOR_PERMISSION', 'APPLICABLE_LICENSE', 'USER_ATTESTED_AUTHORIZED_COPY']);

export function sha256Utf8(text) {
  return crypto.createHash('sha256').update(Buffer.from(text, 'utf8')).digest('hex');
}
export function loadGapLedger(root = DEFAULT_ROOT) {
  return JSON.parse(fs.readFileSync(path.join(root, '04-RECEIPTS/2026-09-22-verbatim-originals-gap-ledger-v01.json'), 'utf8'));
}
export function validateOriginal(record, known) {
  if (!record || typeof record !== 'object' || Array.isArray(record)) throw new Error('INVALID_ORIGINAL_RECORD');
  if (!known || known.source_id !== record.source_id) throw new Error('UNKNOWN_SOURCE_ID');
  if (record.canonical_url !== known.canonical_url) throw new Error('SOURCE_URL_MISMATCH');
  if (typeof record.author !== 'string' || record.author.toLowerCase().replace(/^u\//, '') !== 'upset-ratio502') throw new Error('ACCOUNT_AUTHOR_MISMATCH');
  if (record.subreddit !== 'Wendbine' && record.subreddit !== 'r/Wendbine') throw new Error('SUBREDDIT_MISMATCH');
  if (!ALLOWED_METHODS.has(record.source_capture_method)) throw new Error('CAPTURE_METHOD_UNVERIFIED');
  if (!ALLOWED_RIGHTS.has(record.rights_basis)) throw new Error('RIGHTS_BASIS_MISSING');
  if (typeof record.title !== 'string' || record.title.length === 0) throw new Error('VERBATIM_TITLE_REQUIRED');
  if (typeof record.selftext !== 'string') throw new Error('SELF_TEXT_FIELD_REQUIRED_ALLOW_EMPTY');
  if (!['self', 'link', 'media'].includes(record.post_kind)) throw new Error('POST_KIND_REQUIRED');
  if (record.post_kind === 'self' && !record.selftext.length) throw new Error('EMPTY_SELF_POST_REQUIRES_SOURCE_EXPLANATION');
  if (record.source_capture_method === 'REDDIT_API_OBJECT_WITH_PERMISSION' && !record.reddit_object_id?.endsWith(record.source_id.slice('reddit:t3_'.length))) throw new Error('REDDIT_OBJECT_ID_MISMATCH');
  return record;
}
function assertPrivateDestination(destination) {
  const absolute = path.resolve(destination);
  const rel = path.relative(REPO_ROOT, absolute);
  if (rel === '' || (!rel.startsWith('..'+path.sep) && rel !== '..' && !path.isAbsolute(rel))) throw new Error('PRIVATE_ORIGINALS_DESTINATION_MUST_BE_OUTSIDE_REPOSITORY');
  if (absolute === path.parse(absolute).root) throw new Error('REFUSE_FILESYSTEM_ROOT');
  return absolute;
}
export function ingestAuthorizedOriginals({ inputPath, destination, root = DEFAULT_ROOT }) {
  const out = assertPrivateDestination(destination);
  const ledger = loadGapLedger(root);
  const known = new Map(ledger.records.map(r => [r.source_id, r]));
  const lines = fs.readFileSync(inputPath, 'utf8').split(/\r?\n/).filter(Boolean);
  const supplied = lines.map(line => JSON.parse(line));
  const seen = new Set();
  for (const record of supplied) {
    validateOriginal(record, known.get(record.source_id));
    if (seen.has(record.source_id)) throw new Error('DUPLICATE_ORIGINAL_IN_INPUT');
    seen.add(record.source_id);
  }
  fs.mkdirSync(out, { recursive: true, mode: 0o700 });
  const receipts = [];
  for (const record of supplied) {
    const id = record.source_id.slice('reddit:t3_'.length);
    const original = {
      schema: 'wendbine-private-original-text/v0.1',
      source_id: record.source_id,
      canonical_url: record.canonical_url,
      author: record.author,
      subreddit: record.subreddit,
      source_capture_method: record.source_capture_method,
      rights_basis: record.rights_basis,
      post_kind: record.post_kind,
      title: record.title,
      selftext: record.selftext,
      reddit_object_id: record.reddit_object_id ?? null,
      source_observed_at: record.source_observed_at ?? null,
      publication_timestamp: record.publication_timestamp ?? null
    };
    const dest = path.join(out, id + '.json');
    fs.writeFileSync(dest, JSON.stringify(original, null, 2) + '\n', { flag: 'wx', mode: 0o600 });
    receipts.push({
      source_id: record.source_id,
      canonical_url: record.canonical_url,
      exact_text_state: 'SOURCE_TEXT_FIELDS_CUSTODIED_FROM_DECLARED_AUTHORIZED_INPUT',
      source_capture_method: record.source_capture_method,
      rights_basis: record.rights_basis,
      post_kind: record.post_kind,
      title_sha256_utf8: sha256Utf8(record.title),
      title_utf8_bytes: Buffer.byteLength(record.title, 'utf8'),
      selftext_sha256_utf8: sha256Utf8(record.selftext),
      selftext_utf8_bytes: Buffer.byteLength(record.selftext, 'utf8'),
      selftext_empty: record.selftext.length === 0,
      private_original_file: dest,
      publication_timestamp: record.publication_timestamp ?? null,
      source_observed_at: record.source_observed_at ?? null,
      caveat: 'TEXT_FIELD_HASH_NOT_RAW_HTTP_BYTES; AUTHORSHIP_LINK_AND_INPUT_AUTHORIZATION_RECORDED_NOT_INDEPENDENTLY_ADJUDICATED'
    });
  }
  const report = {
    schema: 'wendbine-private-originals-intake-report/v0.1',
    gap_ledger_source_count: ledger.records.length,
    imported_originals: receipts.length,
    still_missing_originals: ledger.records.length - receipts.length,
    status: receipts.length === ledger.records.length ? 'DECLARED_AUTHORIZED_SOURCE_TEXT_FIELDS_IMPORTED_ALL' : 'PARTIAL_SOURCE_TEXT_FIELDS_IMPORTED',
    records: receipts,
    non_equivalence: [
      'DECLARED_AUTHORIZED_INPUT != INDEPENDENT_ORIGIN_AUTHENTICATION',
      'TEXT_FIELD_UTF8_HASH != HTTP_RESPONSE_BYTE_HASH',
      'SEARCHABLE_DERIVATIVE != ORIGINAL',
      'PRIVATE_ORIGINALS_CUSTODY != PUBLIC_REPUBLICATION_PERMISSION'
    ]
  };
  fs.writeFileSync(path.join(out, 'intake-report.json'), JSON.stringify(report, null, 2) + '\n', { flag: 'wx', mode: 0o600 });
  return report;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [input, destination] = process.argv.slice(2);
  if (!input || !destination) {
    process.stderr.write('Usage: node wendbine-originals-intake.mjs <authorized-export.jsonl> <PRIVATE_DIR_OUTSIDE_REPO>\n');
    process.exitCode = 2;
  } else {
    const report = ingestAuthorizedOriginals({ inputPath: input, destination });
    process.stdout.write(JSON.stringify({ imported_originals: report.imported_originals, still_missing_originals: report.still_missing_originals, state: report.status }) + '\n');
  }
}
