import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {restrictModelCatalog,verifyRestrictedCatalog} from './restricted-model-catalog.mjs';
import {writePrivateAccountReceipt} from './private-account-receipt.mjs';
import {PINNED_IMAGE} from './docker-capture-runtime.mjs';
// Reads exactly one runtime-owned metadata cache, not any source archive.
const state=JSON.parse(fs.readFileSync(process.env.TD613_OPERATIONAL_STATE_FILE,'utf8'));
const parent=process.env.TD613_PRIVATE_CAPTURE_DIRECTORY;
if(state.image!==PINNED_IMAGE||!/^td613-auth-[a-f0-9]{32}$/.test(state.authVolume)||!path.isAbsolute(parent??''))throw Error('PRIVATE_RUNTIME_METADATA_CUSTODY_REQUIRED');
const code="const fs=require('fs');const c=JSON.parse(fs.readFileSync('/custody/native/models_cache.json'));const m=c.models.find(m=>m.slug==='gpt-6.1-sol');if(!m)throw Error('SELECTED_MODEL_REQUIRED');process.stdout.write(JSON.stringify(m))";
const r=spawnSync('docker',['run','--rm','--network','none','--read-only','--log-driver','none','--cap-drop','ALL',
  '--security-opt','no-new-privileges=true','--user','65534:65534','--mount',`type=volume,src=${state.authVolume},dst=/custody,readonly`,
  '--entrypoint','node',PINNED_IMAGE,'-e',code],{encoding:'utf8',windowsHide:true,timeout:30000,maxBuffer:2*1024*1024,stdio:['ignore','pipe','pipe']});
if(r.status!==0)throw Error('SELECTED_NATIVE_CATALOG_READ_HOLD');
const source=JSON.parse(r.stdout),catalog=restrictModelCatalog(source),evidence=verifyRestrictedCatalog(source,catalog);
const id=crypto.randomUUID();
const sourceModelFile=path.join(parent,'selected-model-'+id+'.json');
const restrictedCatalogFile=path.join(parent,'restricted-catalog-'+id+'.json');
writePrivateAccountReceipt(sourceModelFile,source);writePrivateAccountReceipt(restrictedCatalogFile,catalog);
// This private descriptor is configuration, never authority to execute.
writePrivateAccountReceipt(path.join(parent,'catalog-candidate.json'),{sourceModelFile,restrictedCatalogFile,...evidence,inferenceAuthorized:false});
console.log(JSON.stringify({evidenceClass:'ACTUAL_SELECTED_NATIVE_CACHE_AND_LOCAL_TOOL_RESTRICTION',
  ...evidence,originalCapabilities:{shell_type:source.shell_type,apply_patch_tool_type:source.apply_patch_tool_type,
    experimental_supported_tools:source.experimental_supported_tools,tool_mode:source.tool_mode},
  clientCatalogContextWindow:source.context_window??null,clientCatalogMaximumOverride:source.max_context_window??null,
  clientCatalogUsablePercent:source.effective_context_window_percent??null,
  maximumOutputTokens:'NOT_REPORTED',nativeSubscriptionHardLimits:'NOT_ATTESTED',
  modelRequests:0,protectedArchiveOperations:0,inferenceAuthorized:false},null,2));
