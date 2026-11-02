import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {createOperationalRuntime,PINNED_IMAGE} from './docker-capture-runtime.mjs';
import {digest} from '../experiment-b-resumable/journal.mjs';
// Explicit diagnostic, never imported by the Flight runner. Uses the existing
// authenticated profile only for supported non-inferential quota metadata.
const sessionFile=process.env.TD613_OPERATIONAL_STATE_FILE;
const privateCaptureDirectory=process.env.TD613_PRIVATE_CAPTURE_DIRECTORY;
if(!path.isAbsolute(sessionFile??'')||!path.isAbsolute(privateCaptureDirectory??''))throw Error('PRIVATE_DIAGNOSTIC_LOCATIONS_REQUIRED');
const config={image:PINNED_IMAGE,sessionFile,privateCaptureDirectory,workspace:'/scratch',
  timeoutMs:60000,captureStorageBytes:32*1024*1024,quotaMaxAgeMs:60000};
let phase='OBSERVE_RUNTIME';
try{
  const runtime=createOperationalRuntime(config);
  const observation=await runtime.observeRuntime();
  const again=await runtime.observeRuntime();
  const receipt={evidenceClass:'ACTUAL_PROVISIONED_RUNTIME_NON_INFERENTIAL_OBSERVATION',
    stableObservation: digest(observation)===digest(again),image:observation.image,
    cliExecutableSHA256:observation.cliExecutableSHA256,node:observation.node,
    observationDigest:digest(observation),dependencies:observation.dependencies,
    isolation:observation.isolation,nativeProfile:observation.nativeSettings,
    effectiveLimits:'NOT_YET_ACCEPTED',tokenizationAndEnvelopeBound:'NOT_YET_ACCEPTED',
    modelRequests:0,protectedArchiveOperations:0};
  // Any supported account/quota result stays exclusively in private custody.
  phase='SUPPORTED_NON_INFERENTIAL_METADATA';
  const result=await runtime.confirmQuotaWindow('SOURCE_FREE_METADATA_DIAGNOSTIC');
  const file=path.join(privateCaptureDirectory,'diagnostic-'+crypto.randomUUID()+'.json');
  const fd=fs.openSync(file,'wx',0o600);try{fs.writeSync(fd,JSON.stringify({availability:result}));fs.fsyncSync(fd);}finally{fs.closeSync(fd);}
  receipt.supportedMetadataDiagnosticCompleted=true;receipt.accountAndQuotaValuesPublished=false;
  console.log(JSON.stringify(receipt,null,2));
}catch(error){console.log(JSON.stringify({evidenceClass:'ACTUAL_RUNTIME_DIAGNOSTIC_HOLD',phase,code:error.code??'DIAGNOSTIC_FAILED',modelRequests:0,protectedArchiveOperations:0}));process.exitCode=1;}
