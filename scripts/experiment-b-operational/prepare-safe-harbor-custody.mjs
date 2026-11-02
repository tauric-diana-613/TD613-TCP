import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {digest,canonical} from '../experiment-b-resumable/journal.mjs';
import {SAFE_HARBOR_NAMESPACE} from './safe-harbor-dispatch-bridge.mjs';

// Administrative setup only: no imports of supplied modules, secrets, signatures,
// grants, archive operations, provider connections, service installation or dispatch.
export function operatorTemplate(){return {version:1,namespace:{...SAFE_HARBOR_NAMESPACE},
  custodian:{serviceModule:null,moduleSHA256:null,independentAcceptanceDigest:null},
  context:{experiment:'EXPERIMENT_B',episode:null,shi:null,safeHarborPacketReplayDigest:null,safeHarborPacketRecordDigest:null,planDigest:null,policyDigest:null,
    sourceManifestDigest:null,decisionsDigest:null,executionAuthorizationDigest:null}};}
export function checkOperatorInput(input){
  const template=operatorTemplate(),missing=[];
  if(!input||input.version!==1||canonical(input.namespace??null)!==canonical(template.namespace))throw Error('CUSTODY_SETUP_NAMESPACE_OR_VERSION_MISMATCH');
  for(const [section,fields] of Object.entries(template)){
    if(section==='version'||section==='namespace')continue;
    if(!input[section]||typeof input[section]!=='object')throw Error('CUSTODY_SETUP_SCHEMA_REQUIRED');
    if(Object.keys(input[section]).some(k=>!Object.hasOwn(fields,k)))throw Error('CUSTODY_SETUP_UNDECLARED_FIELD_REFUSED');
    for(const key of Object.keys(fields)){
      const value=input[section][key];
      if(value===null||value===undefined||value===''){missing.push(section+'.'+key);continue;}
      if(typeof value!=='string'||(key.endsWith('Digest')||key==='moduleSHA256')&&!/^[a-f0-9]{64}$/.test(value))throw Error('CUSTODY_SETUP_VALUE_INVALID');
    }
  }
  if(Object.keys(input).some(k=>!Object.hasOwn(template,k)))throw Error('CUSTODY_SETUP_UNDECLARED_FIELD_REFUSED');
  if(input.context.shi&&!/^TD613-SH-9B07D8B-[A-F0-9]{8}$/.test(input.context.shi))throw Error('CUSTODY_SETUP_SHI_INVALID');
  let modulePin='NOT_SUPPLIED';
  if(input.custodian.serviceModule){
    const file=input.custodian.serviceModule;
    if(!/\.(mjs|js)$/.test(file)||!fs.lstatSync(file).isFile()||fs.lstatSync(file).isSymbolicLink())throw Error('CUSTODY_SETUP_MODULE_REFUSED');
    const bytes=fs.readFileSync(file);if(bytes.length>2*1024*1024)throw Error('CUSTODY_SETUP_MODULE_BOUND');
    modulePin=digest(bytes)===input.custodian.moduleSHA256?'MATCH':'MISMATCH';
    if(modulePin!=='MATCH')throw Error('CUSTODY_SETUP_MODULE_DIGEST_MISMATCH');
  }
  return {status:missing.length?'CUSTODY_SETUP_INPUTS_REQUIRED':'CUSTODY_SETUP_PREPARED_FOR_INDEPENDENT_ACCEPTANCE',missing,modulePin,
    liveAuthority:'NOT_ATTESTED',independentAcceptance:'NOT_VERIFIED_BY_THIS_HELPER',
    executionAuthorized:false,secretInputsAccepted:false};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try{
    const [mode,file,...extra]=process.argv.slice(2);
    if(extra.length||!file||!['--prepare','--check'].includes(mode))throw Error('USE_PREPARE_NEW_INPUT_FILE_OR_CHECK_INPUT_FILE');
    if(mode==='--prepare'){
      const fd=fs.openSync(file,'wx',0o600);try{fs.writeSync(fd,JSON.stringify(operatorTemplate(),null,2)+'\n');fs.fsyncSync(fd);}finally{fs.closeSync(fd);}
      console.log(JSON.stringify({status:'NON_SECRET_OPERATOR_INPUT_CREATED',editOnlyMissingFields:true,executionAuthorized:false}));
    }else console.log(JSON.stringify(checkOperatorInput(JSON.parse(fs.readFileSync(file,'utf8')))));
  }catch(error){console.error(/^[A-Z0-9_]+$/.test(error.message)?error.message:'CUSTODY_SETUP_HELD');process.exitCode=1;}
}
