// Reviewer-owned non-reciprocal union. Source-free; no candidate imports.
// Batch recomputation from a union of records, with no feedback into either estate.
import crypto from 'node:crypto';
export const digest=b=>crypto.createHash('sha256').update(b).digest('hex');
export class StrongUnion {
  constructor(){this.roots=new Map();this.rules=new Map();this.claims=new Map();this.withdrawals=[];}
  admitSourceRoot(x){
    if(this.roots.has(x.root_id))throw Error('ROOT_ID_REUSE');
    const b=Buffer.from(x.raw_bytes); if(!b.length)throw Error('EMPTY_ROOT');
    this.roots.set(x.root_id,{...x,raw_bytes:b,sha256:digest(b),active:true});
  }
  registerClaim(x){this.claims.set(x.claim_id,structuredClone(x));}
  addDerivationRule(x){if(!x.premise_ids?.length)throw Error('EMPTY_RULE');const r={...x,premise_ids:[...x.premise_ids]};this.rules.set(x.rule_id,r);return r;}
  closure(){
    const p=new Map();for(const [id,r] of this.roots)if(r.active)p.set(id,{roots:new Set([id]),acq:new Set([r.acquisition_id||id])});
    let changes=true,passes=0;
    while(changes){changes=false;if(++passes>1000)throw Error('BUDGET');
      for(const r of this.rules.values()){
        if(r.status&&r.status!=='ADMITTED')continue;
        if(!r.premise_ids.every(x=>p.has(x)))continue;
        let n=p.get(r.head_claim_id);if(!n){n={roots:new Set(),acq:new Set()};p.set(r.head_claim_id,n);changes=true;}
        for(const id of r.premise_ids)for(const key of ['roots','acq'])for(const x of p.get(id)[key])if(!n[key].has(x)){n[key].add(x);changes=true;}
      }
    }return p;
  }
  query(id){const p=this.closure(),n=p.get(id);return {grounded:!!n,acquisitions:n?.acq.size||0,roots:[...(n?.roots||[])].sort()};}
  withdrawSourceRoot({root_id}){const r=this.roots.get(root_id);if(!r)throw Error('ROOT_MISSING');r.active=false;this.withdrawals.push({root_id,sequence:this.withdrawals.length+1});return this.closure();}
  ground({ruleId,premises,targetClaimId,claimStatement,sourceCaptureSpanProof:s}){
    if(!s?.source_id||!s?.span_sha256)throw Error('MISSING_SPAN_PROOF');
    const root=this.roots.get(s.source_id);if(!root)throw Error('SOURCE_MISSING');
    if(digest(root.raw_bytes.subarray(s.start,s.end))!==s.span_sha256)throw Error('DIGEST_MISMATCH');
    this.registerClaim({claim_id:targetClaimId,claim_text:claimStatement});
    this.addDerivationRule({rule_id:ruleId,head_claim_id:targetClaimId,premise_ids:premises,rule_type:'DIRECT_WARRANT'});
    return this.query(targetClaimId);
  }
}
