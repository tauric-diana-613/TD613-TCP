import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {SemanticSemioticSearchEngine,SEARCH_ENGINE_VERSION} from '/app/encyclopedia/vixen-estate/semantic-semiotic-search.mjs';
const H=x=>createHash('sha256').update(x).digest('hex');
const index=JSON.parse(fs.readFileSync('/app/encyclopedia/vixen-estate/semantic-semiotic-index.v1.json'));
const tasks=JSON.parse(fs.readFileSync('/protocol/02_LOCKED_PROMPTS.json')).tasks;
const engine=new SemanticSemioticSearchEngine(index);
const results=[];
for(const t of tasks){const start=performance.now();let retrieval,error=null;try{retrieval=engine.search(t.prompt,{mode:'hybrid',limit:5,deployment_env:'PREVIEW'});}catch(e){error=String(e)}results.push({task_id:t.id,prompt:t.prompt,prompt_sha256:H(t.prompt),fixture:t.synthetic_fixture,actual_component:'UNMODIFIED_NATIVE_RETRIEVAL_ONLY_NOT_GENERATIVE_ANSWER',retrieval,error,elapsed_ms:performance.now()-start,model_output:null,model_status:'HELD_MISSING_WITNESS',gold_status:'HELD_GOLD_NOT_ESTABLISHED',primary_score:null});}
console.log(JSON.stringify({schema:'td613.eighth-variable.C0.component/v1',arm:'C0',source_sha:'b90ae99559b21e1561229cdc8e1d873cfaf6f43a',engine:SEARCH_ENGINE_VERSION,node:process.version,index_sha256:H(fs.readFileSync('/app/encyclopedia/vixen-estate/semantic-semiotic-index.v1.json')),new_inputs:0,primary_model_trial_executed:false,results},null,2));
