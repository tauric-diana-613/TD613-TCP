// Bounded in-memory public examples; no extraction and no protected inputs.
// node reproduce-zip-public.mjs /absolute/frozen-checkout /absolute/output
import fs from 'node:fs';import path from 'node:path';import {pathToFileURL} from 'node:url';import {execFileSync} from 'node:child_process';
const root=path.resolve(process.argv[2]),out=path.resolve(process.argv[3]||'.');
if(execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim()!=='5c7c48313cf25bcb75a0045f91e01337eed5c0af')throw Error('EXACT_HEAD_REQUIRED');
const {OperatorZipIntakeEngine:I}=await import(pathToFileURL(path.join(root,'packages/em_unified_synthesis/operator-zip-intake.mjs')));
const crc=b=>{let c=0xffffffff;for(const x of b){c^=x;for(let j=0;j<8;j++)c=(c&1)?0xedb88320^(c>>>1):c>>>1;}return (c^0xffffffff)>>>0;};
function fixture({extra=0,directory=false,badLocal=false,badCrc=false}={}){
 const n=Buffer.from(directory?'public/':'public.txt'),b=Buffer.from('Public inert archive.'),c=badCrc?0:crc(b);
 const local=Buffer.alloc(30+n.length);local.writeUInt32LE(badLocal?0x00004b50:0x04034b50,0);local.writeUInt16LE(20,4);local.writeUInt32LE(c,14);local.writeUInt32LE(b.length,18);local.writeUInt32LE(b.length,22);local.writeUInt16LE(n.length,26);n.copy(local,30);
 const central=Buffer.alloc(46+n.length);central.writeUInt32LE(0x02014b50,0);central.writeUInt16LE(20,4);central.writeUInt16LE(20,6);central.writeUInt32LE(c,16);central.writeUInt32LE(b.length,20);central.writeUInt32LE(b.length,24);central.writeUInt16LE(n.length,28);central.writeUInt16LE(extra,30);n.copy(central,46);
 const end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50,0);end.writeUInt16LE(1,8);end.writeUInt16LE(1,10);end.writeUInt32LE(central.length,12);end.writeUInt32LE(local.length+b.length,16);
 return Buffer.concat([local,b,central,end]);
}
const checks=[];for(const [name,opts,expected] of [['valid',{},true],['central_extra_escapes_declared_bounds',{extra:123},false],['skipped_directory_local_header',{directory:true,badLocal:true},false]]){
 const e=new I({maxSingleFileSize:1024,maxCumulativeBytes:2048,maxFileCount:4});let accepted=false,error=null;try{e.processZipArchive(fixture(opts),'public');accepted=true;}catch(x){error=x.code||x.name;}
 checks.push({name,contract_met:accepted===expected,observation:{accepted,error,sources:e.admittedSources.size,ledger:e.intakeLedger.length}});
}
fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'public-zip-reproduction.json'),JSON.stringify({checks,no_extraction:true,fixture_size_ceiling:1024},null,2));console.log(JSON.stringify(checks,null,2));
