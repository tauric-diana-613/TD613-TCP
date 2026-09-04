import net from 'node:net';
import crypto from 'node:crypto';
import { fork } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SELF=fileURLToPath(import.meta.url);
const hash=s=>'sha256:'+crypto.createHash('sha256').update(s).digest('hex');

async function runObserverChild(){
  let connections=0;
  const server=net.createServer(socket=>{
    connections+=1;
    socket.on('data',chunk=>socket.write(chunk));
    socket.on('end',()=>socket.end());
  });
  server.listen(0,'127.0.0.1',()=>{
    const address=server.address();
    process.send?.({type:'ready',port:address.port});
  });
  process.on('message',message=>{
    if(message?.type==='snapshot')process.send?.({type:'snapshot',request_id:message.request_id,connections});
    if(message?.type==='shutdown')server.close(()=>process.exit(0));
  });
}

const onceMessage=(child,predicate)=>new Promise((resolve,reject)=>{
  const onMessage=message=>{if(predicate(message)){cleanup();resolve(message);}};
  const onExit=code=>{cleanup();reject(new Error(`observer exited before response: ${code}`));};
  const cleanup=()=>{child.off('message',onMessage);child.off('exit',onExit);};
  child.on('message',onMessage);
  child.on('exit',onExit);
});

async function snapshot(child){
  const request_id=crypto.randomUUID();
  const pending=onceMessage(child,m=>m?.type==='snapshot'&&m?.request_id===request_id);
  child.send({type:'snapshot',request_id});
  return (await pending).connections;
}

const socketEcho=(port,payload)=>new Promise((resolve,reject)=>{
  const socket=net.createConnection({host:'127.0.0.1',port},()=>socket.end(payload));
  const chunks=[];
  socket.on('data',chunk=>chunks.push(chunk));
  socket.on('end',()=>resolve(Buffer.concat(chunks).toString('utf8')));
  socket.on('error',reject);
});

function empiricalBinaryMutualInformation(rows){
  const total=rows.length;
  const joint=new Map(),oCount=new Map(),xCount=new Map();
  for(const row of rows){
    const o=row.origin;
    const x=String(row.x_socket_event);
    joint.set(`${o}|${x}`,(joint.get(`${o}|${x}`)||0)+1);
    oCount.set(o,(oCount.get(o)||0)+1);
    xCount.set(x,(xCount.get(x)||0)+1);
  }
  let mi=0;
  for(const [key,count] of joint){
    const [o,x]=key.split('|');
    const p=count/total,po=oCount.get(o)/total,px=xCount.get(x)/total;
    mi+=p*Math.log2(p/(po*px));
  }
  return mi;
}

export async function runMveX1Pilot({pairs=12}={}){
  if(!Number.isInteger(pairs)||pairs<2)throw new Error('pairs must be an integer >= 2');
  const observer=fork(SELF,['--observer'],{stdio:['ignore','ignore','inherit','ipc']});
  const ready=await onceMessage(observer,m=>m?.type==='ready');
  const rows=[];
  try{
    for(let i=0;i<pairs;i++){
      const challenge=`mve-x1-${String(i).padStart(4,'0')}-${hash(`seed-${i}`).slice(-16)}`;
      const order=i%2===0?['IN_PROCESS','SOCKET_SERVICE']:['SOCKET_SERVICE','IN_PROCESS'];
      for(const origin of order){
        const before=await snapshot(observer);
        let artifact;
        if(origin==='IN_PROCESS')artifact=challenge;
        else artifact=await socketEcho(ready.port,challenge);
        const after=await snapshot(observer);
        rows.push({
          pair_id:`pair-${i}`,
          origin,
          artifact,
          artifact_digest:hash(artifact),
          x_socket_event:after>before,
          observer_connection_delta:after-before
        });
      }
    }
  } finally {
    observer.send({type:'shutdown'});
    await new Promise(resolve=>observer.once('exit',resolve));
  }

  const byPair=new Map();
  for(const row of rows){
    if(!byPair.has(row.pair_id))byPair.set(row.pair_id,[]);
    byPair.get(row.pair_id).push(row);
  }
  const artifact_pair_byte_identity=[...byPair.values()].every(pair=>pair.length===2&&pair[0].artifact===pair[1].artifact&&pair[0].artifact_digest===pair[1].artifact_digest);
  const a_only_origin_accuracy=artifact_pair_byte_identity?0.5:NaN;
  const correctWithX=rows.filter(row=>(row.x_socket_event?'SOCKET_SERVICE':'IN_PROCESS')===row.origin).length;
  const a_plus_x_origin_accuracy=correctWithX/rows.length;
  const bounded_conditional_origin_information_bits=artifact_pair_byte_identity?empiricalBinaryMutualInformation(rows):NaN;
  const actual_tcp_socket_events_observed=rows.some(row=>row.x_socket_event)&&rows.some(row=>!row.x_socket_event);

  return Object.freeze({
    status:'MVE_X1_BOUNDED_PROCESS_PILOT_OBSERVED',
    pairs,
    trials:rows.length,
    origin_classes:Object.freeze(['IN_PROCESS','SOCKET_SERVICE']),
    actual_os_process_boundary_observed:true,
    actual_tcp_socket_events_observed,
    artifact_pair_byte_identity,
    a_only_origin_accuracy,
    a_plus_x_origin_accuracy,
    bounded_conditional_origin_information_bits,
    observer_received_origin_labels:false,
    observer_feature_uses_payload:false,
    observer_governance_independent_from_experiment_orchestrator:false,
    independently_governed_external_witness_acquired:false,
    empirical_exogenous_channel_acquired:false,
    empirical_exteriority_information_gain_measured:false,
    standard_resources_used:Object.freeze(['NODE_RUNTIME','LOOPBACK_TCP','OS_PROCESS_BOUNDARY','SHA256']),
    exotic_hardware_used:false,
    privileged_model_internal_state_used:false,
    universal_externality_claim:false,
    exact_golden_egg_surfaces_added:Object.freeze([]),
    empirical_credit_to_golden_egg:0,
    golden_egg_earned:false
  });
}

if(process.argv[2]==='--observer')await runObserverChild();
else if(process.argv[1]===SELF){
  const result=await runMveX1Pilot();
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
}
