/** Explicitly package version-bound Dollhouse SKILL.md and references for Work-mode skill creator. */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const SKILLS={
 'dollhouse-audit':['SKILL.md','references/cli.md','references/examples.md','references/specialists.md'],
 'dollhouse-design':['SKILL.md','references/authoring-cycle.md','references/firebreak-and-provenance.md',
   'references/scholarly-calculus-of-absence.md','references/selectable-instruments.md']
};
const ENGINE_PATHS=['.agents/agents/dollhouse-atlas.md','app/engine/atlas-mathematical-engine.js',
 'app/engine/dollhouse-atlas-relational-custody.js','app/engine/dollhouse-design-conductor.js',
 'app/engine/dollhouse-skill-dispatcher.js','scripts/run-dollhouse-skill-audit.mjs','scripts/run-dollhouse-design.mjs'];
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
function file(root,relative,includeContent){
 const abs=path.resolve(root,relative);
 if(!abs.startsWith(path.resolve(root)+path.sep))throw Error('REFERENCE_ESCAPE_REFUSED');
 const bytes=fs.readFileSync(abs);
 return {path:relative,sha256:sha(bytes),bytes:bytes.length,...(includeContent?{content:bytes.toString('utf8')}:{})};
}
export function skillRefreshPacket({root=ROOT,expectedCommit}={}){
 const head=execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();
 if(expectedCommit&&head!==expectedCommit)throw Error('SOURCE_REVISION_DRIFT_REFUSED');
 return {schema:'td613.dollhouse.work-skill-refresh/v1',exact_checkout_revision:head,
  skill_packages:Object.fromEntries(Object.entries(SKILLS).map(([name,refs])=>[
   name,{name,files:refs.map(r=>file(root,'.agents/skills/'+name+'/'+r,true)),
     installation_status:'USER_WORK_MODE_SKILL_CREATOR_REQUIRED'}
  ])),engine_manifest:ENGINE_PATHS.map(p=>file(root,p,false)),
  engine_runtime_in_chatgpt:'NOT_AUTOMATICALLY_INSTALLED',
  operator_merge_authorization:false,protected_flight_authority:false};
}
if(process.argv[1]?.endsWith('export-dollhouse-work-skill-packets.mjs')){
 const packet=skillRefreshPacket();
 const pos=process.argv.indexOf('--output');
 if(pos>=0){
   if(!process.argv[pos+1])throw Error('OUTPUT_FILE_REQUIRED');
   const dst=path.resolve(process.argv[pos+1]);
   fs.mkdirSync(path.dirname(dst),{recursive:true});
   fs.writeFileSync(dst,JSON.stringify(packet,null,2)+'\n',{flag:'wx',mode:0o600});
   console.log(JSON.stringify({output:dst,revision:packet.exact_checkout_revision,skills:Object.keys(packet.skill_packages)}));
 }else console.log(JSON.stringify({revision:packet.exact_checkout_revision,skills:Object.keys(packet.skill_packages),
   dependencies:packet.engine_manifest,installed:false}));
}
