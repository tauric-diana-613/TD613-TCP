import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {loadPrivateOriginals,queryPrivateOriginals} from '../packages/dome_world_exact/fixtures/a15-r0/WENDBINE/99-ADMIN/wendbine-private-originals-query.mjs';
import {sha256Utf8} from '../packages/dome_world_exact/fixtures/a15-r0/WENDBINE/99-ADMIN/wendbine-originals-intake.mjs';
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'wendbine-private-query-test-'));
try{
 assert.deepEqual(loadPrivateOriginals(path.join(tmp,'missing')),[]);
 assert.throws(()=>queryPrivateOriginals([],' '),/NONEMPTY_SOURCE_QUERY_REQUIRED/);
 const item={source_id:'reddit:t3_1wc66e4',canonical_url:'https://www.reddit.com/r/Wendbine/comments/1wc66e4/wendbine/',title:'Exact ∴ source title',selftext:'Line one\r\n  Provenance and Recovery  ⟐\nLast line',rights_basis:'AUTHOR_PERMISSION',source_capture_method:'AUTHOR_SUPPLIED_FILE'};
 fs.writeFileSync(path.join(tmp,'source-1wc66e4.json'),JSON.stringify(item));
 fs.writeFileSync(path.join(tmp,'not-an-original.json'),JSON.stringify({source_id:'reddit:t3_fake',title:'Fake',selftext:'Fake'}));
 const originals=loadPrivateOriginals(tmp);
 assert.equal(originals.length,1);
 const hits=queryPrivateOriginals(originals,'provenance and recovery');
 assert.equal(hits.length,1);
 assert.equal(hits[0].source_id,item.source_id);
 assert.equal(hits[0].field,'selftext');
 assert.equal(hits[0].exact_field_sha256_utf8,sha256Utf8(item.selftext));
 assert.equal(queryPrivateOriginals(originals,'provenance and recovery',{caseSensitive:true}).length,0);
 assert.equal(queryPrivateOriginals(originals,'Provenance and Recovery',{caseSensitive:true}).length,1);
}finally{fs.rmSync(tmp,{recursive:true,force:true});}
console.log('Wendbine private original-field query: exact source hash and case-sensitive/insensitive search passed.');
