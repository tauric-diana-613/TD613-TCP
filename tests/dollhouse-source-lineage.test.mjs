import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {validateDollhouseSourceCatalogue} from '../scripts/export-dollhouse.mjs';
const root = new URL('../', import.meta.url);
const read = p => readFileSync(new URL(p,root));
const catalogueBytes=read('dollhouse/lineage/source-records.json');
const catalogue=JSON.parse(catalogueBytes);
test('all 678 original documents retain exact source bytes and immutable bindings',()=>{
  validateDollhouseSourceCatalogue(catalogueBytes);
  assert.equal(catalogue.records.length,678);
  const counts={'fadt-752':4,'atlas-984':261,'western-992':33,'rest-1002':19,'pedagogue-677':144,'main-20260930':215,'pedagogue-spec-original':1,'pedagogue-spec-expanded':1};
  for(const [id,count] of Object.entries(counts)) assert.equal(catalogue.records.filter(r=>r.snapshot_id===id).length,count,id);
  const index=read('dollhouse/lineage/README.md').toString();
  for(const r of catalogue.records){
    const bytes=read(r.local_path);
    assert.equal(bytes.length,r.bytes,r.id);
    assert.equal(createHash('sha256').update(bytes).digest('hex'),r.sha256,r.id);
    assert.equal(createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex'),r.source_blob_sha,r.id);
    assert.ok(index.includes(r.source_url),r.id);
  }
  assert.equal(readdirSync(new URL('dollhouse/lineage/originals/',root)).length,678);
  for(const s of catalogue.snapshots.filter(s=>s.pr_number)) assert.equal(s.merged,false);
});
test('Aperture cradle preserves all four complete embedded mathematical payloads',()=>{
  const r=catalogue.records.find(r=>r.snapshot_id==='main-20260930'&&r.source_path==='app/aperture/tool.html');
  const html=read(r.local_path).toString();
  const cradle=read('dollhouse/lineage/aperture-mathematical-cradle.md').toString();
  for(const id of ['apertureDoctrineKernel','apertureCanonicalGovernanceStack','apertureV294TripleOverlay','apertureV294PhasonSeamBoundaryModel']) {
    const payload=html.match(new RegExp(`<script[^>]*\\bid="${id}"[^>]*>([\\s\\S]*?)</script>`))[1];
    assert.ok(cradle.includes(payload),id);
    JSON.parse(payload);
  }
});
