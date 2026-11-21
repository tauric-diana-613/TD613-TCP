import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync,readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {execFileSync} from 'node:child_process';
import {VIXEN_OPERA_HEADLINERS} from '../app/encyclopedia/vixen-estate/vixen-stage-subject-contract.mjs';
test('newly generated preview README uses the runtime headliner authority',()=>{
 const scratch=mkdtempSync(join(tmpdir(),'vixen-package-'));
 try{
  const archive=join(scratch,'preview.zip');
  const receipt=JSON.parse(execFileSync('python3',['scripts/package-vixen-preview.py','--out',archive],{encoding:'utf8',timeout:60000}));
  assert(receipt.files>1000);
  const readme=execFileSync('python3',['-c','import zipfile,sys;z=zipfile.ZipFile(sys.argv[1]);print(z.read(next(n for n in z.namelist() if n.endswith("/README.md"))).decode())',archive],{encoding:'utf8'});
  assert(readme.includes('The six headliners are **'+VIXEN_OPERA_HEADLINERS.join(', ')+'**'));
  assert(!/The six headliners[^\n]*RC-/.test(readme));
 }finally{rmSync(scratch,{recursive:true,force:true});}
});
test('high-salience candidate labels and accessible source identity stay prospective',()=>{
 const html=readFileSync('app/encyclopedia/vix-cyb.html','utf8');
 assert(html.includes('L2 preset candidate'));
 assert(html.includes('7 Proposed Comparison Lenses'));
 assert(!/L2 ADMITTED|L2 Admitted|7 Admissible Bridges/i.test(html));
});
