import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
// Static source closure only. Does not import activation code or inspect any key.
export function custodySourceClosure(repo){
  const root=fs.realpathSync(repo),folder='scripts/experiment-b-operational/custodian',seen=new Set();
  function add(relative){
    relative=relative.split(path.sep).join('/');
    if(seen.has(relative))return;
    const file=path.resolve(root,relative),real=fs.realpathSync(file);
    if(!real.startsWith(root+path.sep)||fs.lstatSync(file).isSymbolicLink()||!/\.(mjs|ps1|cs)$/.test(relative))throw Error('CUSTODIAN_SOURCE_CLOSURE_ESCAPE');
    seen.add(relative);if(!relative.endsWith('.mjs'))return;
    const text=fs.readFileSync(file,'utf8');
    if(/import\s*\(\s*[^'"\s]/.test(text))throw Error('UNREVIEWED_DYNAMIC_IMPORT');
    // Anchor declarations to source lines: generated adapter source strings are
    // not imports of the generating module.
    const declarations=[...text.matchAll(/^\s*(?:import|export)\s+(?:[^;]*?\bfrom\s*)?['"]([^'"]+)['"]/gm),
      ...text.matchAll(/^\s*import\s*\(\s*['"]([^'"]+)['"]/gm)];
    for(const match of declarations){
      const ref=match[1];if(ref.startsWith('node:'))continue;
      if(!ref.startsWith('.'))throw Error('UNPINNED_EXTERNAL_CUSTODIAN_DEPENDENCY');
      add(path.relative(root,path.resolve(path.dirname(file),ref)));
    }
  }
  for(const name of fs.readdirSync(path.join(root,folder)))if(/\.(mjs|ps1|cs)$/.test(name))add(folder+'/'+name);
  return [...seen].sort();
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try{console.log(JSON.stringify(custodySourceClosure(process.argv[2])));}catch{console.error('CUSTODIAN_SOURCE_CLOSURE_HOLD');process.exitCode=1;}
}
