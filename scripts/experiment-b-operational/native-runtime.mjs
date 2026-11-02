// External ABI entry point. Importing this module does not start Docker, read
// sources, authenticate an account, or issue any provider request.
import fs from 'node:fs';
import path from 'node:path';
import {createOperationalRuntime} from './docker-capture-runtime.mjs';
let runtime;
function active(){
  if(!runtime){
    const file=process.env.TD613_NATIVE_RUNTIME_CONFIG;
    if(!path.isAbsolute(file??'')||fs.lstatSync(file).isSymbolicLink())throw Object.assign(Error('PRIVATE_RUNTIME_CONFIGURATION_REQUIRED'),{code:'PRIVATE_RUNTIME_CONFIGURATION_REQUIRED'});
    runtime=createOperationalRuntime(JSON.parse(fs.readFileSync(file,'utf8')));
  }
  return runtime;
}
// The Flight entry, unlike the explicit diagnostic factory, refuses unprovided
// counting, limits, authority and tool policy BEFORE protected archive admission.
export const observeRuntime=async(...a)=>{await active().assertProvisioned();return active().observeRuntime(...a);};
export const confirmQuotaWindow=(...a)=>active().confirmQuotaWindow(...a);
export const measureInput=(...a)=>active().measureInput(...a);
export const spawnNative=(...a)=>active().spawnNative(...a);
export const freezeStage2Packets=(...a)=>active().freezeStage2Packets(...a);
export const collectIndependentStage2=(...a)=>active().collectIndependentStage2(...a);
export const captureService={prepare:(...a)=>active().captureService.prepare(...a),
  collect:(...a)=>active().captureService.collect(...a),verify:(...a)=>active().captureService.verify(...a),
  kernelEvidence:(...a)=>active().captureService.kernelEvidence(...a)};
