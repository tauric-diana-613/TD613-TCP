/** Byte-exact predecessor-custody regression. No text normalization permitted. */
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const EXPECTED={
  "COUNTERWORLD_DOCKET.md": "1386b87f4058dbb5b8ae5652d537714ff4d82d1b",
  "GEOMETRY_OF_REFUSAL_AND_RECOGNITION.md": "55cf62402365399ddd949cc044f554f35c808fe0",
  "NEW_PRIMITIVE_DECISION.md": "4af8f946c66c30655e6b3e56ef5acfeafd2b0744",
  "OPERATOR_REVIEW_PACKET.md": "922c3a81aeb1d3036f7b3e3bcc6939ea4ada3c2a",
  "RECIPROCAL_MANIFEST_TRIAL.md": "97c03ffbe150da190b7873beb349f4e3c052fc1b",
  "RELATIONAL_ATLAS_DOSSIER.md": "2abd8d9170d4af67e31037c5f44b76663ea25330",
  "SEVEN_CHAMBERS_RECORD.md": "5becde5b5f48984d4ccb84ae9b6f1703f7d7d350",
  "THE_APPEAL_THAT_REQUIRED_PERMISSION_FROM_THE_ERROR.md": "462599797cd58fd09501e2c2fe6446748bf62cf1",
  "THE_INSPECTOR_WHO_FOUND_THE_BUILDING_BUT_COULD_NOT_FIND_ITS_PEOPLE.md": "a09548fc71207125d9d1a59f18ff5b3b3f3acfb6",
  "THE_INSTITUTION_THAT_LEARNED_TO_IMITATE_ITS_OWN_ERROR.md": "92fb9300f6f74fe6750a0c6230fe7caeb6a64f64",
  "THE_NOTARY_WHO_COULD_READ_EVERY_WORD_EXCEPT_THE_OBJECTION.md": "94b408050454f4b6b3913c2e570002412473cc89",
  "THE_NOTARY_WHO_NEVER_SAW_THE_WITNESS.md": "3c3a9ad0566bdfc616890a3523d6bf3bac3be0a4",
  "THE_REMEDY_THAT_MADE_ITS_OWN_WITNESS_DISAPPEAR.md": "283e4e4da93440233cdb8a9144c0c9e166a194ac",
  "THE_SENTENCE_THAT_OUTRAN_ITS_AUTHOR.md": "848ebc89f9ba96a27447dc05cf8b3164ef30b378",
  "THE_STAY_THAT_TESTIFIED_AGAINST_ITS_AUTHOR.md": "1bd6978f6756d3941de23b0ad139d8f78733cda1",
  "WILD_FIELD_COUNTERWORLD_LOOM_DIRECTIVE.md": "f3973d19b03b7118e6444cb340085a237d37bcce",
  "WITNESS_THAT_ARRIVED_TOO_LATE_DOSSIER.md": "c8609cfbd1c842e574d1c0fdd372f3fced677797",
  "WITNESS_WHO_REFUSED_TO_BE_PROVEN.md": "ea3c8b588775dde5432e6d6439ff08e3bee6dc92"
};
const receipt=JSON.parse(readFileSync(new URL('../artifacts/atlas-after-hours/predecessor_source_custody_receipt.json',import.meta.url),'utf8'));
const blobSha=(buf)=>createHash('sha1').update('blob '+buf.length+'\0').update(buf).digest('hex');
const bufferAt=(path)=>readFileSync(new URL('../'+path,import.meta.url));
test('predecessor inventory is complete and review-only',()=>{
  assert.equal(Object.keys(EXPECTED).length,18);
  assert.equal(receipt.status,'COMPLETE_18_OF_18_PREDECESSOR_DOCS');
  assert.equal(receipt.restored.length,18);
  assert.equal(receipt.rootMirrorsRestored,18);
  assert.equal(receipt.totalRestoredPaths,36);
  assert.equal(receipt.yetToRestore.length,0);
  assert.equal(receipt.protectedFlight,'HELD');
  assert.equal(receipt.humanClosure,'RESERVED');
});
test('root originals preserve exact content-addressed historical bytes',()=>{
  for(const [name,sha] of Object.entries(EXPECTED)){
    assert.equal(blobSha(bufferAt(name)),sha,name);
  }
});
test('dossier mirrors are byte-identical and separately integrity-checked',()=>{
  for(const [name,sha] of Object.entries(EXPECTED)){
    const root=bufferAt(name),mirror=bufferAt('dossier/'+name);
    assert.deepEqual(mirror,root,name);
    assert.equal(blobSha(mirror),sha,name);
  }
});
test('receipt cites every original file and its exact Git object',()=>{
  assert.deepEqual(new Set(receipt.restored.map(r=>r.path)),new Set(Object.keys(EXPECTED)));
  for(const record of receipt.restored){
    assert.equal(record.blobSha,EXPECTED[record.path],record.path);
    assert.equal(record.mirror,'dossier/'+record.path);
  }
});
