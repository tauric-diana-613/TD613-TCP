import fs from 'node:fs';

const path = 'app/dome-world/ash-keep.js';
const source = fs.readFileSync(path, 'utf8');
const oldBlock = `    caseId: state.caseMap.case_id,\n    body: $('draftBody').value,`;
const newBlock = `    caseId: state.caseMap.case_id,\n    caseMapDigest: state.caseMap.case_map_digest,\n    body: $('draftBody').value,`;

if (!source.includes(oldBlock)) {
  if (source.includes(newBlock)) {
    console.log('Canonical Ash Draft source already carries the Case Map digest.');
    process.exit(0);
  }
  throw new Error('Ash Draft Case Map source marker not found.');
}

const patched = source.replace(oldBlock, newBlock);
const count = (patched.match(/caseMapDigest: state\.caseMap\.case_map_digest/g) || []).length;
if (count !== 1) throw new Error(`Expected one canonical Case Map Draft binding; observed ${count}.`);
fs.writeFileSync(path, patched);
console.log('Prepared canonical Ash Draft Case Map binding.');
