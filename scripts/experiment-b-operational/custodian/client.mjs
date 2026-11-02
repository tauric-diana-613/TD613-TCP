import {spawnSync} from 'node:child_process';
import {randomUUID} from 'node:crypto';
import {digest} from '../../experiment-b-resumable/journal.mjs';

// This process holds no production issuer root. The accepted HS256 verifier is
// inside the custodian. Windows verifies both IPC peers, not a caller Boolean.
export function createCustodianClient({settings,settingsDigest,pipeClient,invoke}={}){
  if(!settings||digest(settings)!==settingsDigest||!settings.mandateId||!settings.episode)throw Error('PINNED_CUSTODIAN_CLIENT_CONFIGURATION_REQUIRED');
  if(invoke&&settings.evidenceClass!=='SYNTHETIC_TRANSPORT_ONLY')throw Error('SYNTHETIC_TRANSPORT_MUST_BE_EXPLICIT');
  if(!invoke&&process.platform!=='win32')throw Error('WINDOWS_CUSTODIAN_IPC_REQUIRED');
  const call=(operation,payload)=>{
    const request={requestId:randomUUID(),operation,mandateId:settings.mandateId,episode:settings.episode,payload};
    let response;
    try{
      if(invoke)response=invoke(request); // Explicit source-free test transport only; production shim supplies none.
      else{
        const input=JSON.stringify(request);
        if(Buffer.byteLength(input)>65536)throw Error('CUSTODIAN_REQUEST_BOUND');
        const r=spawnSync(pipeClient,[settings.pipeName,settings.custodianSid,settings.controllerSid,String(settings.timeoutMs??10000)],
          {input,encoding:'utf8',windowsHide:true,timeout:settings.timeoutMs??10000,maxBuffer:65536,env:{SystemRoot:process.env.SystemRoot}});
        if(r.error||r.status!==0)throw Error();response=JSON.parse(r.stdout);
      }
    }catch{throw Error('CUSTODIAN_UNAVAILABLE_OR_UNAUTHENTICATED_HOLD');}
    if(!response||response.status!=='OK'||response.requestId!==request.requestId)throw Error('CUSTODIAN_REFUSAL_OR_UNCERTAIN_HOLD');
    return response.result;
  };
  const checkpointCustody={
    minimumAnchor:()=>call('anchor.read',{}),
    publish:event=>{
      const anchor=call('anchor.publish',{seq:event.seq,hash:event.hash,previous:event.previous,signature:event.signature});
      if(event.type==='TURN_ACCEPTED'){
        const final=event.payload?.complete_evidence?.terminalFinal;
        if(!final)throw Error('TERMINAL_CUSTODY_EVIDENCE_REQUIRED');
        call('terminal.record',{attempt:event.payload.attempt,evidence:{journalHash:event.hash,finalSHA256:final.finalSHA256,jsonlSHA256:final.jsonlSHA256}});
      }
      return anchor;
    }};
  checkpointCustody.reconcile=event=>checkpointCustody.publish(event);
  return Object.freeze({authorizeAndConsume:async binding=>call('dispatch.authorize',binding)?.status==='ACCEPTED',checkpointCustody,
    lookup:attempt=>call('dispatch.lookup',{attempt})});
}
