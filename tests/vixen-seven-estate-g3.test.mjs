import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {mkdtempSync,mkdirSync,realpathSync,rmSync} from 'node:fs';
import {dirname,join,resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {fileURLToPath} from 'node:url';
import {createNativeAtelierReadAdapters} from '../scripts/vixen-native-atelier-bridge.mjs';

const repo=realpathSync(resolve(dirname(fileURLToPath(import.meta.url)),'..'));
const expected=Object.freeze({
 SRC:'b3e69acf587d534eeef2e01d0bb5bdbdecdbd320',
 EMSTD613:'70b5a0f9e94626cba6068f41c6117e7978800bbd'
});
const run=(...args)=>execFileSync(args[0],args.slice(1),{
 cwd:repo,encoding:'utf8',timeout:80000,stdio:['ignore','pipe','pipe']
}).trim();
const python=process.env.TD613_NATIVE_PYTHON||(process.platform==='win32'?'python':'python3');

test('ROOT-A: historically pinned original SRC/EM checkout roots separate from estate roots',async t=>{
 for(const head of Object.values(expected)){
  try{run('git','cat-file','-e',head+'^{commit}')}
  catch{t.skip('HOLD_HISTORICAL_GIT_COMMIT_NOT_IN_LOCAL_CI_HISTORY:'+head);return}
 }
 const temp=mkdtempSync(join(tmpdir(),'td613-g3-native-roots-'));
 const src=join(temp,'src-history'),em=join(temp,'em-history');
 let srcAdded=false,emAdded=false;
 try{
  run('git','worktree','add','--detach',src,expected.SRC);srcAdded=true;
  run('git','worktree','add','--detach',em,expected.EMSTD613);emAdded=true;
  const config={SRC:{path:src,git_head:expected.SRC},
    EMSTD613:{path:em,git_head:expected.EMSTD613}};
  const native=createNativeAtelierReadAdapters({repoRoot:repo,sourceCheckouts:config});
  // The EM original work-route --em-root expects <checkout>/packages/.../EMSTD613.
  const routed=native.EM_ATELIER({
    operation:'em_native_work_route',
    payload:{work_id:'emwork_074ccf9ad783c9c9047d73a8'}
  });
  assert.equal(routed.kind,'ORIGINAL_NATIVE_EXECUTABLE');
  assert.equal(routed.data.schema,'td613.em.work-route/v1');
  assert.equal(routed.scientific_credit,0);
  // The cross-estate original loader expects the checkout root, not estate root.
  const db=join(temp,'synthetic-empty-wendbine.sqlite');
  execFileSync(python,['-c',`import sqlite3,sys
con=sqlite3.connect(sys.argv[1])
con.execute("""CREATE TABLE sources(
 source_id TEXT,canonical_url TEXT,selftext BLOB,title BLOB,
 body_sha256 TEXT,title_sha256 TEXT,published_unix INTEGER)""")
con.commit()
con.close()`,db],{encoding:'utf8',timeout:12000});
  const cross=native.CROSS_ATELIER({operation:'cross_atelier_lexical',
    payload:{wendbine_db:db,query:'architecture',limit:6}});
  assert.equal(cross.data.schema,'td613.cross-estate-query/v1');
  assert.equal(cross.data.automatic_crosswalk_admitted,false);
  assert.equal(cross.scientific_credit,0);
  assert(cross.data.ranked.length>0,'Real native SRC/EM retrieval should find source-bound derivatives');
  assert(cross.data.ranked.every(hit=>hit.source_sha256 && hit.chunk_sha256));
  const wrong={...config,SRC:{path:join(src,'packages','dome_world_exact','fixtures','a15-r0','SRC'),git_head:expected.SRC}};
  assert.throws(()=>createNativeAtelierReadAdapters({repoRoot:repo,sourceCheckouts:wrong}),
   /HELD_NATIVE_CHECKOUT_ROOT_CONTRACT_REQUIRED/);
  const wrongSHA={...config,SRC:{path:src,git_head:'0'.repeat(40)}};
  assert.throws(()=>createNativeAtelierReadAdapters({repoRoot:repo,sourceCheckouts:wrongSHA}),
   /HELD_NATIVE_SOURCE_CHECKOUT_HEAD_DRIFT/);
 } finally {
  if(emAdded)try{run('git','worktree','remove','--force',em)}catch{}
  if(srcAdded)try{run('git','worktree','remove','--force',src)}catch{}
  rmSync(temp,{recursive:true,force:true});
 }
});
