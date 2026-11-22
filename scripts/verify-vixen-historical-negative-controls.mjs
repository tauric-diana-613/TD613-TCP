#!/usr/bin/env node
/** Requires genuine preserved checkout. Mutations occur ONLY in a newly created
 * disposable worktree; the original historical checkout is never altered. */
import {execFileSync} from 'node:child_process';
import {mkdtempSync,readFileSync,writeFileSync,rmSync,renameSync,symlinkSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {resolve} from 'node:path';
import assert from 'node:assert/strict';
import {resolveHistoricalEmCoordinates,qualifyEmOriginalArchive} from './vixen-em-pinned-archive-qualifier.mjs';
const original=process.env.TD613_EM_ARCHIVE_CHECKOUT;
const roots=resolveHistoricalEmCoordinates({checkoutRoot:original});
const temp=mkdtempSync(resolve(tmpdir(),'vixen-historical-negatives-')),checkout=resolve(temp,'historical');
const exec=(...args)=>execFileSync('git',args,{encoding:'utf8',stdio:['ignore','pipe','pipe']});
const results=[];
const rejects=(name,fn,pattern=/HELD_/)=>{assert.throws(fn,pattern);results.push({name,disposition:'REJECTED'});};
try{
 exec('-C',original,'worktree','add','--detach',checkout,roots.historicalGitHead);
 const estate=resolve(checkout,'packages/dome_world_exact/fixtures/a15-r0/EMSTD613');
 rejects('estate supplied as checkout',()=>resolveHistoricalEmCoordinates({checkoutRoot:estate}));
 rejects('checkout supplied as manifest root',()=>resolveHistoricalEmCoordinates({checkoutRoot:checkout,originalManifestRoot:checkout}));
 const otherHead=exec('-C',original,'rev-parse','origin/main').trim();
 exec('-C',checkout,'update-ref','--no-deref','HEAD',otherHead);
 try{rejects('wrong observed historical HEAD',()=>resolveHistoricalEmCoordinates({checkoutRoot:checkout}));}
 finally{exec('-C',checkout,'update-ref','--no-deref','HEAD',roots.historicalGitHead);}
 rejects('wrong historical SHA',()=>resolveHistoricalEmCoordinates({checkoutRoot:checkout,historicalGitHead:'a'.repeat(40)}));
 const modify=(relative,change)=>{const path=resolve(estate,relative),bytes=readFileSync(path);try{writeFileSync(path,change(bytes));qualifyEmOriginalArchive({checkoutRoot:checkout});}finally{writeFileSync(path,bytes);}};
 const profile=resolve(estate,'ATELIER_PROFILE.json');
 renameSync(profile,profile+'.held');
 try{rejects('missing historical profile',()=>resolveHistoricalEmCoordinates({checkoutRoot:checkout}));}finally{renameSync(profile+'.held',profile);}
 rejects('substituted tracked source',()=>modify('ATELIER_PROFILE.json',b=>Buffer.concat([b,Buffer.from(' ')])));
 rejects('tampered Work title',()=>modify('01-MANIFESTS/work-index.jsonl',b=>Buffer.from(b.toString().replace('Architecture','Counterfeit Architecture'))));
 const sources=readFileSync(resolve(estate,'01-MANIFESTS/source-files.jsonl'),'utf8').trim().split('\n').map(JSON.parse);
 rejects('modified manifestation',()=>modify(sources[0].archive_relative_path,b=>Buffer.concat([b,Buffer.from('altered')])));
 const absent=resolve(estate,sources[0].archive_relative_path);renameSync(absent,absent+'.held');
 try{rejects('missing manifestation',()=>qualifyEmOriginalArchive({checkoutRoot:checkout}));}finally{renameSync(absent+'.held',absent);}
 const derivatives=readFileSync(resolve(estate,'03-DERIVATIVES/derivative-index.jsonl'),'utf8').trim().split('\n').map(JSON.parse);
 const derivative=derivatives.find(d=>d.derivative_relative_path);
 rejects('altered derivative digest',()=>modify(derivative.derivative_relative_path,b=>Buffer.concat([b,Buffer.from('altered')])));
 rejects('metadata companion promoted to manifestation',()=>modify('01-MANIFESTS/work-manifestations.jsonl',b=>Buffer.from(b.toString().replace('METADATA_COMPANION','MANIFESTATION_OF'))));
 const source=resolve(estate,sources[0].archive_relative_path);
 const outside=resolve(temp,'outside-source');writeFileSync(outside,readFileSync(source));
 renameSync(source,source+'.held');symlinkSync(outside,source);
 try{rejects('source symlink escape',()=>qualifyEmOriginalArchive({checkoutRoot:checkout}));}finally{rmSync(source);renameSync(source+'.held',source);}
 // Native success is never accepted as an injected input; the qualifier executes
 // the pinned route itself and checks its actual return and indexed source census.
 const r=qualifyEmOriginalArchive({checkoutRoot:checkout,nativeSuccess:{kind:'ORIGINAL_NATIVE_EXECUTABLE'}});
 assert.equal(r.native_work_route_executed,true);assert.equal(r.original_derivatives_sha256_verified,53);
 results.push({name:'caller native success field has no authority; genuine route still executes',disposition:'GENUINE_EXECUTION_REQUIRED'});
 console.log(JSON.stringify({schema:'td613.vixen.historical-negative-controls/v1',historical_head:roots.historicalGitHead,results,positive:r},null,2));
}finally{
 try{exec('-C',original,'worktree','remove','--force',checkout);}finally{rmSync(temp,{recursive:true,force:true});}
}
