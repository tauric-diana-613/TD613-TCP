import fs from 'node:fs';
import {randomBytes,randomUUID} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {CustodyStore} from './store.mjs';
import {digest} from '../../experiment-b-resumable/journal.mjs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {windowsAudit} from './windows-audit.mjs';

// HUMAN-ONLY ACTIVATION SOFTWARE. Engineering tests never invoke this entry.
// Key generation is prospective; no generation is performed by module import.
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))try{
  const [action,file,inputFile,confirmedDigest]=process.argv.slice(2);
  const c=JSON.parse(fs.readFileSync(file,'utf8'));
  if(process.platform!=='win32'||!process.stdin.isTTY||!process.stdout.isTTY)throw Error('INTERACTIVE_CUSTODIAN_CONSOLE_REQUIRED');
  const r=spawnSync(c.pwsh,['-NoLogo','-NoProfile','-NonInteractive','-Command',
    '$i=[Security.Principal.WindowsIdentity]::GetCurrent();$p=[Security.Principal.WindowsPrincipal]::new($i);if($p.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator) -or @($i.Groups|ForEach-Object{$_.Value}) -contains "S-1-5-32-544"){exit 2};$i.User.Value'],
    {encoding:'utf8',windowsHide:true,timeout:5000});
  if(r.status!==0||r.stdout.trim()!==c.custodianSid)throw Error('SEPARATE_STANDARD_CUSTODIAN_IDENTITY_REQUIRED');
  if(action==='Initialize'){
    const acceptance=JSON.parse(fs.readFileSync(c.installationAcceptance,'utf8'));
    if(acceptance.status!=='HUMAN_ACCEPTED_AFTER_INDEPENDENT_REVIEW'||acceptance.configurationDigest!==digest(c)||acceptance.sourceCommit!==c.sourceCommit)
      throw Error('INDEPENDENTLY_REVIEWED_REAL_INSTALLATION_REQUIRED');
    if(confirmedDigest!==digest({action:'INITIALIZE_FRESH_EXPERIMENT_B_CUSTODY',configurationDigest:digest(c)}))throw Error('EXPLICIT_INITIALIZATION_GESTURE_REQUIRED');
    for(const target of [c.keyFile,c.checkpointKeyFile]){const key=randomBytes(48);const fd=fs.openSync(target,'wx',0o600);try{fs.writeSync(fd,key);fs.fsyncSync(fd);}finally{fs.closeSync(fd);key.fill(0);}}
    CustodyStore.initializeEmpty(c);
    // The fresh key ID has no historical authority.
    fs.writeFileSync(c.issuerRecord,JSON.stringify({issuer:c.issuer,keyId:c.issuer,algorithm:'HS256',purpose:'EXPERIMENT_B_NATIVE_DISPATCH',
      provenance:'FRESH_PROSPECTIVE_AUTHORITY',activationId:randomUUID(),configurationDigest:digest(c)})+'\n',{flag:'wx',mode:0o600});
    console.log(JSON.stringify({status:'FRESH_CUSTODIAN_INITIALIZED',productionIsolation:'REQUIRES_INDEPENDENT_INSTALLATION_ACCEPTANCE',issuer:c.issuer,privateMaterialExported:false}));
  }else{
    const bytes=fs.readFileSync(inputFile);if(digest(bytes)!==confirmedDigest)throw Error('REVIEWED_HUMAN_INPUT_DIGEST_MISMATCH');
    const input=JSON.parse(bytes),key=fs.readFileSync(c.keyFile),checkpointKey=fs.readFileSync(c.checkpointKeyFile);
    const store=new CustodyStore({...c,key,checkpointKey,externalAudit:windowsAudit(c)});key.fill(0);checkpointKey.fill(0);
    try{
      let receipt;if(action==='Approve')receipt=store.approveMandate(input);
      else if(action==='Revoke')receipt=store.revoke(input.mandateId);
      else if(action==='Bind'){
        const m=store.mandate(input.mandateId),settings={pipeName:c.pipeName,custodianSid:c.custodianSid,controllerSid:c.controllerSid,
          mandateId:m.id,episode:m.context.episode,timeoutMs:c.timeoutMs};
        fs.writeFileSync(path.join(c.controllerDirectory,'settings.json'),JSON.stringify(settings,null,2)+'\n',{flag:'wx',mode:0o600});
        const code="import fs from 'node:fs';\nimport {fileURLToPath} from 'node:url';\nimport {createCustodianClient} from '../code/scripts/experiment-b-operational/custodian/client.mjs';\n"+
          "const settings=JSON.parse(fs.readFileSync(new URL('./settings.json',import.meta.url),'utf8'));\n"+
          "const client=createCustodianClient({settings,settingsDigest:"+JSON.stringify(digest(settings))+
          ",pipeClient:fileURLToPath(new URL('../code/CustodyPipeClient.exe',import.meta.url))});\n"+
          "export const authorizeAndConsume=client.authorizeAndConsume;\nexport const checkpointCustody=client.checkpointCustody;\n";
        fs.writeFileSync(path.join(c.controllerDirectory,'dispatch-authority.mjs'),code,{flag:'wx',mode:0o600});
        receipt={status:'CLIENT_BOUND_NO_EXECUTION_GRANT',settingsDigest:digest(settings),adapterSHA256:digest(code),
          requiredFlightConfiguration:{custodianProfile:'TD613_LOCAL_CUSTODIAN_V1',custodianCheckpointRequired:true,checkpointAuthorityModule:'SAME_INSTALLED_ADAPTER',independentAcceptance:'STILL_REQUIRED'}};
      }
      else throw Error('HUMAN_CUSTODY_ACTION_UNKNOWN');
      console.log(JSON.stringify({status:'HUMAN_CUSTODY_ACTION_RECORDED',action,receipt,privateMaterialExported:false}));
    }finally{store.close();}
  }
}catch{console.error('HUMAN_CUSTODY_ACTION_HELD_NO_SECRET_OUTPUT');process.exitCode=1;}
