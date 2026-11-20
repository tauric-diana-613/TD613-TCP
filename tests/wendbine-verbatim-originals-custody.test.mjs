import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { loadGapLedger, validateOriginal, ingestAuthorizedOriginals, sha256Utf8 } from '../packages/dome_world_exact/fixtures/a15-r0/WENDBINE/99-ADMIN/wendbine-originals-intake.mjs';

const ledger = loadGapLedger();
assert.equal(ledger.records.length, 60);
const foundational = JSON.parse(fs.readFileSync(path.resolve('packages/dome_world_exact/fixtures/a15-r0/WENDBINE/01-MANIFESTS/foundational-sept10-11-originals-rescue-v01.json'), 'utf8'));
assert.equal(foundational.records.length, 33, 'The earliest 33 sources must be a complete P0 recovery cohort.');
assert.equal(foundational.counts.sept10, 21);
assert.equal(foundational.counts.sept11, 12);
assert.equal(foundational.counts.full_title_body_originals_custodied, 0, 'Index visibility cannot become original custody.');
assert.equal(foundational.counts.source_specific_fulltext_completeness_verified, 0);
assert.deepEqual(new Set(foundational.records.map(r => r.source_id)), new Set(ledger.records.slice(0,33).map(r=>r.source_id)), 'P0 must cover all and only the September 10-11 base registry IDs.');
assert.ok(foundational.records.every(r => r.priority === 'P0_FOUNDATIONAL_SEPTEMBER_10_11' && r.verbatim_body_custodied === false && r.private_original_ref === null));
assert.ok(foundational.records.some(r => r.source_id === 'reddit:t3_1wc66e4' && r.public_retrieval_status.startsWith('SEARCH_INDEX_')));

assert.equal(new Set(ledger.records.map(x=>x.source_id)).size, 60);
assert.equal(ledger.scope.older_source_bound_summary_records, 35);
assert.equal(ledger.scope.newer_card_level_observations, 25);
assert.equal(ledger.scope.verbatim_title_and_body_custodied, 0);
for (const record of ledger.records) {
  assert.equal(record.original_title_verbatim_custodied, false);
  assert.equal(record.original_body_verbatim_custodied, false);
  assert.equal(record.full_text_status, 'NOT_CUSTODIED');
  assert.equal(record.source_text_hash_sha256, null);
  assert.equal(record.original_text_storage_ref, null);
}
const first = ledger.records[0];
const example = {
  source_id: first.source_id,
  canonical_url: first.canonical_url,
  author: 'Upset-Ratio502',
  subreddit: 'Wendbine',
  source_capture_method: 'AUTHOR_SUPPLIED_EXPORT',
  rights_basis: 'USER_ATTESTED_AUTHORIZED_COPY',
  post_kind: 'self',
  title: 'Synthetic test ∴ title',
  selftext: 'Synthetic line 1\r\n  two spaces  ∴\nFinal line  ',
  source_observed_at: '2026-09-22T12:00:00Z'
};
assert.equal(validateOriginal(example, first), example);
assert.throws(()=>validateOriginal({...example, author:'OtherAccount'}, first), /ACCOUNT_AUTHOR_MISMATCH/);
assert.throws(()=>validateOriginal({...example, canonical_url:'https://www.reddit.com/r/Wendbine/comments/other/'}, first), /SOURCE_URL_MISMATCH/);
assert.throws(()=>validateOriginal({...example, rights_basis:null}, first), /RIGHTS_BASIS_MISSING/);
assert.throws(()=>validateOriginal({...example, selftext:null}, first), /SELF_TEXT_FIELD_REQUIRED_ALLOW_EMPTY/);
assert.throws(()=>validateOriginal({...example, title:''}, first), /VERBATIM_TITLE_REQUIRED/);
const dir=fs.mkdtempSync(path.join(os.tmpdir(), 'wendbine-verbatim-test-'));
try {
  const inFile=path.join(dir,'authorized-export.jsonl');
  const dest=path.join(dir,'private-originals');
  fs.writeFileSync(inFile, JSON.stringify(example)+'\n');
  const report=ingestAuthorizedOriginals({inputPath:inFile,destination:dest});
  assert.equal(report.imported_originals,1);
  assert.equal(report.still_missing_originals,59);
  assert.equal(report.status,'PARTIAL_SOURCE_TEXT_FIELDS_IMPORTED');
  const id=example.source_id.slice('reddit:t3_'.length);
  const privateOriginal=JSON.parse(fs.readFileSync(path.join(dest,id+'.json'),'utf8'));
  assert.equal(privateOriginal.title, example.title);
  assert.equal(privateOriginal.selftext, example.selftext, 'Retain exact text including whitespace and Unicode.');
  assert.equal(report.records[0].title_sha256_utf8, sha256Utf8(example.title));
  assert.equal(report.records[0].selftext_sha256_utf8, sha256Utf8(example.selftext));
  assert.equal(report.records[0].selftext_utf8_bytes,Buffer.byteLength(example.selftext,'utf8'));
  assert.throws(()=>ingestAuthorizedOriginals({inputPath:inFile,destination:dest}), /EEXIST/, 'Do not overwrite an already captured original.');
  const dupe=path.join(dir,'duplicate.jsonl');
  fs.writeFileSync(dupe,JSON.stringify(example)+'\n'+JSON.stringify(example)+'\n');
  assert.throws(()=>ingestAuthorizedOriginals({inputPath:dupe,destination:path.join(dir,'second')}), /DUPLICATE_ORIGINAL_IN_INPUT/);
} finally {
  fs.rmSync(dir, {recursive:true,force:true});
}
console.log('Wendbine 60-record verbatim-originals gap and permissioned exact-text import tests passed.');
