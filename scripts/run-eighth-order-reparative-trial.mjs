#!/usr/bin/env node
/** Executable, offline eighth-order evidence receipts. No simulated audit invocation. */
import {writeFileSync,mkdirSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {runEighthOrderTrial} from '../packages/rulefield/lab/eighth_order_reparative_consequence.mjs';
export function buildEighthOrderArtifacts(){
  const trial=runEighthOrderTrial();
  const payload=JSON.stringify(trial);
  return {
    docket:{schema:'td613.atlas-after-hours.eighth-order-docket/v1',case:'TD613-AAH-ORD8-0009',
      sourceClass:'SOURCE_FREE_SYNTHETIC',researchStatus:'EXECUTABLE_LOCAL_RESEARCH_ONLY',
      contentSha256:createHash('sha256').update(payload,'utf8').digest('hex'),
      operator:'tauric.diana.613',covenant:'Khona\u200Clit-po',humanClosure:'RESERVED',
      baseline:'f1928fcafd359f071cc9ded5750fe00b22bb8b02',
      scientificHolds:trial.preexistingHolds,
      postExecutionSkillAudit:'NOT_EXECUTED_BY_THIS_RUNNER_REQUIRES_REPO_NATIVE_CONTEXT',
      verdict:'SYNTHETIC_DISTINCTION_DEMONSTRATED_NO_EMPIRICAL_GENERALIZATION'},
    trial
  };
}
const isMain=process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href;
if(isMain){
  const artifacts=buildEighthOrderArtifacts();
  const output={
    'artifacts/atlas-after-hours/reparative_consequence_docket.json':artifacts.docket,
    'artifacts/atlas-after-hours/counterworld-loom/berlantian_reparative_counterworlds.json':artifacts.trial
  };
  for(const [p,data] of Object.entries(output)){
    const file=resolve(p);mkdirSync(dirname(file),{recursive:true});
    writeFileSync(file,JSON.stringify(data,null,2)+'\n');
  }
  console.log(JSON.stringify({result:'EIGHTH_ORDER_EXECUTED',sha256:artifacts.docket.contentSha256,
    paths:Object.keys(output),postExecutionAudit:'NOT_EXECUTED',scientificHolds:artifacts.docket.scientificHolds},null,2));
}
