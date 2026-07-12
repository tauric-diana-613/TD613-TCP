const base=(process.env.TD613_BASE_URL||process.argv[2]||'http://localhost:3000').replace(/\/$/,'');
const required=['omissionPressure','coherence','divergence'];
const readiness=await fetch(`${base}/api/flowcore-context`).then(async response=>({response,body:await response.json()}));
if(!readiness.response.ok||readiness.body.status!=='phase-3-active')throw new Error('Flow-Core Phase III readiness failed');
if(readiness.body.artifactBlind!==true||readiness.body.privateByDefault!==true)throw new Error('Flow-Core privacy/artifact boundary failed');
for(const metric of required){if(!readiness.body.requiredWeatherMetrics.includes(metric))throw new Error(`missing required metric ${metric}`)}
const payload={operation:'flowcore-context-instrument',traceId:'phase3-live-probe',apertureContext:{version:'v3.0-alpha',schema:'td613-aperture/v3.0-alpha',observedRegime:'PRCS-A'},payload:{diagnosticReceipt:{receipt_id:'apdiag_phase3_live_probe'},measurements:[['omissionPressure',0.2],['coherence',0.75],['divergence',0.3]].map(([name,value])=>({name,value,sensor_id:'derived-formula',source_status:'DERIVED',transformation_history:['live probe fixture -> bounded metric']}))}};
const run=await fetch(`${base}/api/flowcore-context`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload)}).then(async response=>({response,body:await response.json()}));
if(!run.response.ok||run.body.result?.schema!=='td613.flowcore.context-receipt/v0.1')throw new Error('Flow-Core Phase III receipt failed');
if(run.body.result?.status!=='OPEN'||run.body.result?.artifact_reference!==null)throw new Error('Flow-Core Phase III posture failed');
console.log(JSON.stringify({readiness:readiness.body.status,receipt:run.body.result.receipt_id,posture:run.body.result.context_posture},null,2));
