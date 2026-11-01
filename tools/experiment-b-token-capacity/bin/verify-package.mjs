import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
const read=p=>fs.readFileSync(path.join(root,p),'utf8'),json=p=>JSON.parse(read(p));
const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(x=>x.name==='node_modules'?[]:x.isDirectory()?walk(path.join(d,x.name)):[path.join(d,x.name)]);
try{
 const manifest=json('artifact-manifest.json');
 const actual=walk(root).map(f=>path.relative(root,f).replaceAll('\\','/')).filter(p=>p!=='artifact-manifest.json').sort();
 if(JSON.stringify(actual)!==JSON.stringify(manifest.files.map(f=>f.path).sort()))throw Error();
 for(const f of manifest.files){const data=fs.readFileSync(path.join(root,f.path));if(data.length!==f.bytes||sha(data)!==f.sha256)throw Error();}
 const bindings=json('source-bindings.json');
 for(const s of bindings.predecessor_snapshots){const b=fs.readFileSync(path.join(root,s.snapshot));if(sha(b)!==s.sha256||crypto.createHash('sha1').update(Buffer.concat([Buffer.from('blob '+b.length+'\0'),b])).digest('hex')!==s.git_blob_sha1)throw Error();}
 const measured=json('sources/pr1616-reasoning-summary.json');if(measured.ARM_2A_MODULAR.usage.input_tokens+measured.ARM_2A_MODULAR.usage.output_tokens!==72206||measured.ARM_2B_MATCHED_UNION.usage.input_tokens+measured.ARM_2B_MATCHED_UNION.usage.output_tokens!==74144)throw Error();
 if(json('receipts/synthetic-tests.json').status!=='PASS'||json('receipts/synthetic-tests.json').protected_archive_operations!==0)throw Error();
 const example=json('receipts/synthetic-aggregate.json');if(example.gate_f!=='HELD'||example.model_mapping_verified||example.provider_input_exact)throw Error();
 if(!read('README.md').includes('Khona\u200clit-po'))throw Error();
 console.log(JSON.stringify({status:'PASS',kind:'SOURCE_FREE_PACKAGE_INTEGRITY',files:manifest.files.length,predecessor_snapshots:bindings.predecessor_snapshots.length,gate_f:'HELD',new_model_calls:0,protected_archive_operations:0}));
}catch{console.log(JSON.stringify({status:'FAIL',code:'PACKAGE_VERIFICATION_FAILED'}));process.exitCode=1;}
