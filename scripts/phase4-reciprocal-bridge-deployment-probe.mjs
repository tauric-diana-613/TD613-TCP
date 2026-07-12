import {
  auditReturnedFlowCoreReceipt,
  compileRoundTripReceipt,
  replayRoundTripReceipt
} from '../app/engine/aperture-v3-reciprocal-bridge.js';

const base=(process.env.TD613_BASE_URL||process.argv[2]||'http://localhost:3000').replace(/\/$/,'');

function diagnostic(metrics, id='apdiag_phase4_live_probe'){
  return {
    schema:'td613.aperture.diagnostic-receipt/v3.0-alpha',
    receipt_id:id,
    instrument:'TD613 Aperture',
    version:'v3.0-alpha',
    firmwareSchema:'td613-aperture/v3.0-alpha',
    posture:'recommendation-not-command',
    taskIntent:{primary_route:'REQUESTED_SYNTHESIS',runtime_materiality:'BACKGROUND',automatic_redirect:false},
    source:{status:'DERIVED'},
    runtime:{materiality:'BACKGROUND'},
    produced:{context_request:{metrics}}
  };
}

async function post(receipt){
  const response=await fetch(`${base}/api/aperture-bridge`,{
    method:'POST',headers:{'content-type':'application/json'},
    body:JSON.stringify({operation:'aperture-bridge-contextualize',traceId:'phase4-live-probe',payload:{diagnosticReceipt:receipt}})
  });
  return {response,body:await response.json()};
}

const readiness=await fetch(`${base}/api/aperture-bridge`).then(async response=>({response,body:await response.json()}));
if(!readiness.response.ok||!readiness.body.reciprocalReceipts)throw new Error('Phase IV readiness failed');
if(readiness.body.contextReceiptSchema!=='td613.flowcore.context-receipt/v0.1')throw new Error('Phase IV did not adopt v0.1');
if(readiness.body.reciprocalAuthority!==false||readiness.body.automaticAshAction!==false||readiness.body.predictionAuthorized!==false)throw new Error('Phase IV authority boundary failed');

const complete=diagnostic({omissionPressure:0.2,coherence:0.75,divergence:0.3,namingSensitivity:0.4,rupturePressure:0.1});
const run=await post(complete);
if(!run.response.ok||run.body.result?.schema!=='td613.flowcore.context-receipt/v0.1')throw new Error('Phase IV context return failed');
if(run.body.result?.bridge_integration_status!=='PHASE_4_ACTIVE'||run.body.result?.artifact_reference!==null)throw new Error('Phase IV return posture failed');

const audit=auditReturnedFlowCoreReceipt(complete,run.body.result);
if(!audit.recommendation.startsWith('CONTEXT_RECEIPT_ADMISSIBLE'))throw new Error('Phase IV returned audit failed');
const roundTrip=await compileRoundTripReceipt(complete,run.body.result,{audit});
const replay=await replayRoundTripReceipt(roundTrip);
if(!replay.status.startsWith('ROUND_TRIP_VERIFIED'))throw new Error('Phase IV replay failed');

const incomplete=diagnostic({omissionPressure:0.2,divergence:0.3},'apdiag_phase4_abstain_probe');
const abstain=await post(incomplete);
if(!abstain.response.ok||abstain.body.result?.status!=='ABSTAIN'||abstain.body.result?.modeled_weather!==null)throw new Error('Phase IV abstention failed');

const injected={...complete,artifact_digest:'sha256:must-reject'};
const rejection=await post(injected);
if(rejection.response.status!==400||rejection.body?.ok!==false)throw new Error('Phase IV artifact rejection failed');

console.log(JSON.stringify({
  readiness:readiness.body.status,
  context_schema:run.body.result.schema,
  context_receipt:run.body.result.receipt_id,
  audit:audit.recommendation,
  round_trip:roundTrip.receipt_id,
  replay:replay.status,
  abstention:abstain.body.result.context_posture,
  artifact_rejection:rejection.response.status,
  reciprocal_authority:false,
  automatic_ash_action:false,
  prediction_authorized:false
},null,2));
