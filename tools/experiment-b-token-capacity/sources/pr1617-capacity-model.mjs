// Pure arithmetic over public planning assumptions. No CLI/model calls, network or archive operations.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
export function calculate(a){
 const o=a.observations;
 const rates={a:(o.arm_2a_input+o.arm_2a_output)/o.reasoning_turns_per_arm,b:(o.arm_2b_input+o.arm_2b_output)/o.reasoning_turns_per_arm};
 const p=a.replay_forecast_assumptions;
 const rows=a.scenarios.map(s=>{
  const n=s.orders*s.factorial_cells*s.replications,D=s.documents,matched=s.schedule==='matched';
  const baseA=n*(matched?2*D+2:2*D),baseB=n*(matched?2*D+2:D);
  const highA=baseA+Math.ceil(baseA*a.retry_reserve_fraction),highB=baseB+Math.ceil(baseB*a.retry_reserve_fraction);
  const e=a.stage2_forecast;
  const evalPerArm=n*(e.candidates_per_arm_per_condition*e.independent_calls_per_candidate*e.tokens_per_independent_call+e.blinding_audit_calls_per_condition*e.tokens_per_blinding_audit/2);
  const evalCalls=2*n*e.candidates_per_arm_per_condition*e.independent_calls_per_candidate+n*e.blinding_audit_calls_per_condition;
  const evalCandidateBasePerArm=n*e.candidates_per_arm_per_condition*e.independent_calls_per_candidate;
  const evalCandidateMaxPerArm=evalCandidateBasePerArm+Math.ceil(evalCandidateBasePerArm*a.retry_reserve_fraction);
  const auditBase=n*e.blinding_audit_calls_per_condition,auditMax=auditBase+Math.ceil(auditBase*a.retry_reserve_fraction);
  const evalReservedPerArm=evalCandidateMaxPerArm*e.tokens_per_independent_call+auditMax*e.tokens_per_blinding_audit/2;
  let replayA=null,replayB=null,peakA=null,peakB=null;
  if(matched){
   const H=p.harness_tokens_per_call+p.instruction_tokens_per_call,Q=p.source_tokens_per_document,S=p.previous_output_tokens_per_call,V=p.new_output_tokens_per_call;
   replayA=H+V;replayB=H+V;
   peakA=H;peakB=H;
   for(let d=0;d<D;d++){
    replayA+=2*H+Q*(d+1)+(4*d+1)*S+2*V;
    replayB+=2*H+2*Q*(d+1)+(4*d+1)*S+2*V;
    peakA=Math.max(peakA,H+Q*(d+1)+2*d*S,H+(2*d+1)*S);
    peakB=Math.max(peakB,H+Q*(d+1)+(2*d+1)*S);
   }
   replayA+=H+2*D*S+V;replayB+=H+D*Q+2*D*S+V;
   peakA=Math.max(peakA,H+2*D*S);peakB=Math.max(peakB,H+D*Q+2*D*S);
   replayA=Math.ceil(replayA*n*(1+a.retry_reserve_fraction));replayB=Math.ceil(replayB*n*(1+a.retry_reserve_fraction));
  }
  const hardPerCall=a.hard_envelope_assumptions.maximum_total_input_tokens_per_call+a.hard_envelope_assumptions.maximum_total_output_tokens_per_call;
  return {...s,conditions_per_architecture:n,base_generation_calls:{a:baseA,b:baseB},reserved_max_generation_attempts:{a:highA,b:highB},
   observed_mean_projection_no_retry:{a:Math.ceil(baseA*rates.a),b:Math.ceil(baseB*rates.b)},
   observed_mean_with_retry_reserve:{a:Math.ceil(highA*rates.a),b:Math.ceil(highB*rates.b)},
   hypothetical_growing_replay_with_retry_fraction:{a:replayA,b:replayB},
   hypothetical_peak_input_per_call:{a:peakA,b:peakB},
   hypothetical_replay_fits_input_cap:peakA===null?null:Math.max(peakA,peakB)<=a.hard_envelope_assumptions.maximum_total_input_tokens_per_call,
   hypothetical_hard_generation_envelope:{a:highA*hardPerCall,b:highB*hardPerCall},
   stage2_base_forecast:{calls:evalCalls,tokens_per_arm:evalPerArm,total_tokens:2*evalPerArm,maximum_candidates:2*n*e.candidates_per_arm_per_condition},
   stage2_with_retry_reserve:{maximum_attempts:2*evalCandidateMaxPerArm+auditMax,tokens_per_arm:evalReservedPerArm,total_tokens:2*evalReservedPerArm},
   mean_plus_stage2_projection_per_arm:{a:Math.ceil(highA*rates.a)+evalReservedPerArm,b:Math.ceil(highB*rates.b)+evalReservedPerArm},
   fits_180k_generation_at_observed_mean:highA*rates.a<=180000&&highB*rates.b<=180000,
   fits_current_ceiling_generation_at_observed_mean:highA*rates.a<=a.prospective_authorized_token_ceiling_per_arm&&highB*rates.b<=a.prospective_authorized_token_ceiling_per_arm,
   fits_current_ceiling_mean_plus_stage2:Math.ceil(highA*rates.a)+evalReservedPerArm<=a.prospective_authorized_token_ceiling_per_arm&&Math.ceil(highB*rates.b)+evalReservedPerArm<=a.prospective_authorized_token_ceiling_per_arm,
   authorized:false};
 });
 return {status:'PROSPECTIVE_ARITHMETIC_NOT_EXECUTION',current_prospective_ceiling_per_arm:a.prospective_authorized_token_ceiling_per_arm,earlier_prospective_ceiling_per_arm:180000,observed_mean_tokens_per_turn:rates,observed_qualification_totals:{a:o.arm_2a_input+o.arm_2a_output,b:o.arm_2b_input+o.arm_2b_output,review:o.review_input+o.review_output},rows,overall_full_flight_feasible_under_current_ceiling:false,power_established:false,high_effort_token_multiplier_known:false};
}
if(path.resolve(process.argv[1]||'')===fileURLToPath(import.meta.url)){
 const a=JSON.parse(fs.readFileSync(path.join(root,'capacity-assumptions.json'),'utf8'));
 const result=calculate(a);
 if(process.argv.includes('--write'))fs.writeFileSync(path.join(root,'capacity-results.json'),JSON.stringify(result,null,2)+'\n');
 console.log(JSON.stringify(result,null,2));
}
