import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {execFileSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import {validateAssayPolicy,requireThat,sha256} from '../../../server/loom-assay-contract.js';
import {prepareServerRequest} from '../../portable-loom-server-transport-20261009/server-client.mjs';

const base='research/portable-loom-registered-source-control-20261011/priority-v1/';
// Inert preparation only: never imports a provider/database client, reads a
// credential, creates a ledger row, or sends a request.
export function preparePriorityRun(directory, activationFile, runId) {
  requireThat(directory && activationFile && !existsSync(directory),'ASSAY_PRIORITY_PREPARATION_ARGUMENTS');
  const activation=JSON.parse(readFileSync(activationFile)), protocolBytes=readFileSync(base+'PROTOCOL.json');
  requireThat(activation.status==='ACTIVATED_BY_DIRECT_OPERATOR' && activation.operator==='Tawanna C. Miller'
    && activation.authority_class==='INTERACTIVE_OPERATOR_DIRECT' && typeof activation.instruction==='string' && activation.instruction.length>0
    && Number.isFinite(Date.parse(activation.recorded_at)) && Date.parse(activation.recorded_at)<=Date.now()
    && Date.now()-Date.parse(activation.recorded_at)<=6*60*60*1000
    && activation.protocol_sha256===sha256(protocolBytes)
    && activation.provider_requests===5 && activation.reservation_ceiling_usd===2.5 && activation.automatic_retries===0
    && activation.manual_retries===4 && activation.fresh_enrollments===5 && activation.vercel_deployments===1
    && activation.neon_validator_deployments===1 && activation.detached_delegation===false,
    'ASSAY_PRIORITY_EXECUTION_NOT_ACTIVATED');
  const head=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
  requireThat(!execFileSync('git',['diff','HEAD','--name-only'],{encoding:'utf8'}).trim(),'ASSAY_UNCOMMITTED_SOURCE');
  const protocol=JSON.parse(protocolBytes);
  requireThat(protocol.run_ids.includes(runId),'ASSAY_PRIORITY_RUN_OUTSIDE_BATCH');
  const policy=JSON.parse(readFileSync(base+'POLICY.template.json'));
  policy.run_id=runId;
  policy.protocol_commit=policy.binding.protocol_commit=head;
  policy.expires_at=new Date(Date.now()+6*60*60*1000).toISOString();
  const path=resolve(directory); policy.binding.authorization={record:join(path,'ACTIVATION.json'),
    scope:'Fresh direct activation: this run: one provider request, one reservation, maximum USD0.50, zero automatic retries; batch five sequential attempts / USD2.50, stop first complete capture; one governed Vercel release and one verified Neon validator deployment. No custody admission or detached activity.'};
  validateAssayPolicy(policy);
  const {request,provider_wire}=prepareServerRequest(policy,{trial_id:'FIRST_CONFIGURED_RECEIVER-R01-1',case_id:'R01',role:'RECEIVER',turn_index:0});
  requireThat(provider_wire.request_sha256===protocol.expected_provider_request_sha256
    && provider_wire.reserved_cost_nanos===491184000,'ASSAY_PRIORITY_FROZEN_WIRE_MISMATCH');
  mkdirSync(path,{recursive:false});
  const save=(name,value)=>writeFileSync(join(path,name),JSON.stringify(value,null,2)+'\n',{flag:'wx',mode:0o600});
  save('ACTIVATION.json',activation);save('policy.json',policy);save('request.json',request);
  writeFileSync(join(path,'provider-request.body.json'),provider_wire.body,{flag:'wx',mode:0o600});
  const callerDigest='baaa5a59eff5540a9061554ae92beafa3ede5c279ce6e2ae18fc21c2a0c8122b';
  execFileSync('node',['research/portable-loom-server-transport-20261009/prepare-enrollment.mjs',join(path,'policy.json'),callerDigest,join(path,'enrollment.json')],{stdio:'pipe'});
  return {status:'PREPARED_NOT_APPLIED',source_commit:head,provider_request_sha256:provider_wire.request_sha256,
    reserved_cost_nanos:provider_wire.reserved_cost_nanos,expires_at:policy.expires_at,provider_requests:0,reservations:0,enrollments:0};
}
if(process.argv[1] && import.meta.url===pathToFileURL(resolve(process.argv[1])).href) {
  try {console.log(JSON.stringify(preparePriorityRun(...process.argv.slice(2))));}
  catch(error){console.error(JSON.stringify({status:'HELD',error:error.message}));process.exitCode=2;}
}
