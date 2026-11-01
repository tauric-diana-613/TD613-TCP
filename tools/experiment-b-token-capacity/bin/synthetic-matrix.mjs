import {syntheticMembers,syntheticPlan} from '../test/fixtures.mjs';
import {prepareDatasets,measureCapacity,aggregateReport} from '../lib/capacity.mjs';
import {need,publicError} from '../lib/errors.mjs';
try{
 need(process.argv.length===2,'SYNTHETIC_ENTRY_ACCEPTS_NO_ARCHIVE_ARGUMENT');
 const cases=[];
 for(const D of [3,20,24]){
  const p=syntheticPlan(D);p.scope=D===3?'MICROSTUDY':'SINGLE_PASS';
  const members=syntheticMembers(D),membership={AUTHENTIC:Array.from({length:D},(_,i)=>i)};
  cases.push({case:D===3?'SYNTHETIC_MICRO_3':'SYNTHETIC_SINGLE_'+D,report:aggregateReport(measureCapacity({plan:p,datasets:prepareDatasets(members,membership,D)}),{fields:['document_count','source_token_total_bucket','capacity_by_arm'],quantum:1000})});
 }
 for(const D of [20,24]){
  const p=syntheticPlan(D);p.scope='FULL';p.conditions=[];
  for(const evidence of ['AUTHENTIC','NEGATIVE'])for(const representation of ['NEUTRAL','DOLLHOUSE'])for(const order of ['ORIGINAL','REVERSED','EXPLICIT'])p.conditions.push({evidence,representation,order,...(order==='EXPLICIT'?{indices:Array.from({length:D},(_,i)=>(i+1)%D)}:{}),replications:3});
  const members=[...syntheticMembers(D),...syntheticMembers(D,true)],membership={AUTHENTIC:Array.from({length:D},(_,i)=>i),NEGATIVE:Array.from({length:D},(_,i)=>D+i)};
  cases.push({case:'SYNTHETIC_FULL_'+D,report:aggregateReport(measureCapacity({plan:p,datasets:prepareDatasets(members,membership,D)}),{fields:['document_count','source_token_total_bucket','capacity_by_arm'],quantum:1000})});
 }
 console.log(JSON.stringify({kind:'SYNTHETIC_ALTERNATIVES_NOT_PROTECTED_MEASUREMENTS',cases},null,2));
}catch(error){console.log(JSON.stringify(publicError(error)));process.exitCode=1;}
