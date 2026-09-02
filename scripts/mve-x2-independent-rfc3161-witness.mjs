import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileP=promisify(execFile);

export const FREETSA={
  endpoint:'https://freetsa.org/tsr',
  ca_url:'https://freetsa.org/files/cacert.pem',
  tsa_cert_url:'https://freetsa.org/files/tsa.crt',
  certificate_pin_representation:'DOWNLOADED_FILE_BYTES',
  ca_cert_file_sha256:'2151b61137ffa86bf664691ba67e7da0b19f98c758e3d228d5d8ebf27e044438',
  tsa_cert_file_sha256:'8bfb0305bb64e2571ca507552ef3245cb1c2fee8728e0ff8689225081ea13467'
};

const sha256=input=>crypto.createHash('sha256').update(input).digest('hex');
const hash=input=>'sha256:'+sha256(input);

async function fetchBytes(url,options={}){
  const response=await fetch(url,{...options,signal:AbortSignal.timeout(20000)});
  if(!response.ok)throw new Error(`external request failed: ${response.status} ${url}`);
  return Buffer.from(await response.arrayBuffer());
}

async function openssl(args,options={}){
  return execFileP('openssl',args,{maxBuffer:8*1024*1024,...options});
}

async function prepareTrustMaterial(dir){
  const caPath=path.join(dir,'freetsa-ca.pem');
  const tsaPath=path.join(dir,'freetsa-tsa.crt');
  const [caBytes,tsaBytes]=await Promise.all([
    fetchBytes(FREETSA.ca_url),
    fetchBytes(FREETSA.tsa_cert_url)
  ]);
  const caFileSha256=sha256(caBytes);
  const tsaFileSha256=sha256(tsaBytes);
  if(caFileSha256!==FREETSA.ca_cert_file_sha256)throw new Error(`FreeTSA CA published file hash mismatch: ${caFileSha256}`);
  if(tsaFileSha256!==FREETSA.tsa_cert_file_sha256)throw new Error(`FreeTSA TSA published file hash mismatch: ${tsaFileSha256}`);
  await Promise.all([fs.writeFile(caPath,caBytes),fs.writeFile(tsaPath,tsaBytes)]);
  await Promise.all([
    openssl(['x509','-in',caPath,'-noout','-subject']),
    openssl(['x509','-in',tsaPath,'-noout','-subject'])
  ]);
  return Object.freeze({
    caPath,
    tsaPath,
    certificate_pin_representation:'DOWNLOADED_FILE_BYTES',
    caFileSha256,
    tsaFileSha256,
    pinned_certificate_files_verified:true,
    x509_parse_verified:true
  });
}

async function acquireTimestampWitness({dir,trust,pairId,artifactDigest}){
  const nonce=crypto.randomBytes(24).toString('hex');
  const envelope=JSON.stringify({
    schema:'td613.mve-x2.blinded-rfc3161-commitment/v0.1',
    episode:'western-mve-x2-independent-tsa-witness-v01',
    pair_id:pairId,
    artifact_digest:artifactDigest,
    witness_nonce:nonce
  });
  const commitmentPath=path.join(dir,`${pairId}.commitment.json`);
  const queryPath=path.join(dir,`${pairId}.tsq`);
  const responsePath=path.join(dir,`${pairId}.tsr`);
  await fs.writeFile(commitmentPath,envelope,'utf8');

  await openssl(['ts','-query','-data',commitmentPath,'-sha256','-cert','-out',queryPath]);
  const query=await fs.readFile(queryPath);
  const response=await fetchBytes(FREETSA.endpoint,{
    method:'POST',
    headers:{
      'Content-Type':'application/timestamp-query',
      'Accept':'application/timestamp-reply'
    },
    body:query
  });
  await fs.writeFile(responsePath,response);

  await openssl([
    'ts','-verify',
    '-queryfile',queryPath,
    '-in',responsePath,
    '-CAfile',trust.caPath,
    '-untrusted',trust.tsaPath
  ]);

  const {stdout:replyText}=await openssl(['ts','-reply','-in',responsePath,'-text'],{encoding:'utf8'});
  const granted=/Status:\s*Granted/i.test(replyText);
  if(!granted)throw new Error('RFC3161 response was not granted');

  return Object.freeze({
    valid:true,
    response_digest:hash(response),
    request_digest:hash(query),
    commitment_digest:hash(Buffer.from(envelope,'utf8')),
    request_base64:query.toString('base64'),
    response_base64:response.toString('base64'),
    message_imprint_only:true,
    external_witness_received_raw_artifact:false,
    external_witness_received_origin_label:false,
    external_witness_received_salted_commitment_digest_only:true
  });
}

function empiricalBinaryMutualInformation(rows){
  const total=rows.length;
  const joint=new Map(),oCount=new Map(),xCount=new Map();
  for(const row of rows){
    const o=row.origin;
    const x=String(row.x_valid_external_tsa_receipt);
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

async function githubEventHeadSha(){
  try{
    if(!process.env.GITHUB_EVENT_PATH)return null;
    const event=JSON.parse(await fs.readFile(process.env.GITHUB_EVENT_PATH,'utf8'));
    return event?.pull_request?.head?.sha??null;
  }catch{return null;}
}

export async function runMveX2Pilot({pairs=2,custodyPath=null}={}){
  if(!Number.isInteger(pairs)||pairs<2||pairs>3)throw new Error('pairs must be an integer from 2 to 3; external witness requests are intentionally bounded');
  const dir=await fs.mkdtemp(path.join(os.tmpdir(),'td613-mve-x2-'));
  const rows=[];
  const witnessEvidence=[];
  try{
    await openssl(['version']);
    const trust=await prepareTrustMaterial(dir);

    for(let i=0;i<pairs;i++){
      const challenge=`mve-x2-${String(i).padStart(4,'0')}-${sha256(`seed-${i}`).slice(0,24)}`;
      const artifact=challenge;
      const artifactDigest=hash(Buffer.from(artifact,'utf8'));
      const order=i%2===0?['LOCAL_ONLY','FREETSA_RFC3161_WITNESSED']:['FREETSA_RFC3161_WITNESSED','LOCAL_ONLY'];

      for(const origin of order){
        let receipt=null;
        if(origin==='FREETSA_RFC3161_WITNESSED'){
          receipt=await acquireTimestampWitness({
            dir,
            trust,
            pairId:`pair-${i}`,
            artifactDigest
          });
          witnessEvidence.push({
            pair_id:`pair-${i}`,
            commitment_digest:receipt.commitment_digest,
            request_digest:receipt.request_digest,
            response_digest:receipt.response_digest,
            request_base64:receipt.request_base64,
            response_base64:receipt.response_base64
          });
        }
        rows.push({
          pair_id:`pair-${i}`,
          origin,
          artifact,
          artifact_digest:artifactDigest,
          x_valid_external_tsa_receipt:receipt?.valid===true,
          external_receipt_digest:receipt?.response_digest??null,
          commitment_digest:receipt?.commitment_digest??null,
          external_witness_received_raw_artifact:receipt?.external_witness_received_raw_artifact??false,
          external_witness_received_origin_label:receipt?.external_witness_received_origin_label??false
        });
      }
    }

    const byPair=new Map();
    for(const row of rows){
      if(!byPair.has(row.pair_id))byPair.set(row.pair_id,[]);
      byPair.get(row.pair_id).push(row);
    }
    const artifact_pair_byte_identity=[...byPair.values()].every(pair=>
      pair.length===2&&
      pair[0].artifact===pair[1].artifact&&
      pair[0].artifact_digest===pair[1].artifact_digest
    );
    const a_only_origin_accuracy=artifact_pair_byte_identity?0.5:NaN;
    const correctWithX=rows.filter(row=>
      (row.x_valid_external_tsa_receipt?'FREETSA_RFC3161_WITNESSED':'LOCAL_ONLY')===row.origin
    ).length;
    const a_plus_x_origin_accuracy=correctWithX/rows.length;
    const bounded_conditional_origin_information_bits=artifact_pair_byte_identity?empiricalBinaryMutualInformation(rows):NaN;
    const route_conditioned_attestation_association_observed=artifact_pair_byte_identity&&a_plus_x_origin_accuracy>0.5&&bounded_conditional_origin_information_bits>0;
    const witnessRows=rows.filter(row=>row.origin==='FREETSA_RFC3161_WITNESSED');
    let custody_record_written=false;
    if(custodyPath){
      const eventHeadSha=await githubEventHeadSha();
      const custody={
        schema:'td613.dome-world.mve-x2-independent-tsa-observation-custody/v0.1',
        episode_id:'western-mve-x2-independent-rfc3161-witness-v01',
        recorded_at:new Date().toISOString(),
        github_event_head_sha:eventHeadSha,
        github_run_id:process.env.GITHUB_RUN_ID??null,
        github_run_attempt:process.env.GITHUB_RUN_ATTEMPT??null,
        github_run_number:process.env.GITHUB_RUN_NUMBER??null,
        github_workflow:process.env.GITHUB_WORKFLOW??null,
        github_job:process.env.GITHUB_JOB??null,
        external_authority:{
          provider:'FreeTSA',
          protocol:'RFC3161',
          endpoint:FREETSA.endpoint,
          certificate_pin_representation:trust.certificate_pin_representation,
          ca_certificate_file_sha256:trust.caFileSha256,
          tsa_signer_certificate_file_sha256:trust.tsaFileSha256,
          x509_parse_verified:trust.x509_parse_verified
        },
        privacy:{
          raw_artifact_included:false,
          origin_label_sent_to_external_witness:false,
          private_witness_nonce_included:false,
          message_imprint_only:true
        },
        interpretation:{
          independently_administered_external_attestation_observed:true,
          route_conditioned_attestation_association_observed,
          independently_governed_external_witness_acquired:false,
          independent_origin_sensor_acquired:false,
          empirical_exogenous_channel_acquired:false,
          bounded_empirical_exteriority_information_gain_measured:false,
          conditional_information_interpretation:'ROUTE_CONDITIONED_ATTESTATION_ASSOCIATION_NOT_INDEPENDENT_ORIGIN_INFORMATION'
        },
        result:{
          pairs,
          trials:rows.length,
          external_requests_issued:witnessRows.length,
          artifact_pair_byte_identity,
          a_only_origin_accuracy,
          a_plus_x_origin_accuracy,
          bounded_conditional_origin_information_bits
        },
        rfc3161_witnesses:witnessEvidence
      };
      await fs.mkdir(path.dirname(custodyPath),{recursive:true});
      await fs.writeFile(custodyPath,JSON.stringify(custody,null,2)+'\n','utf8');
      custody_record_written=true;
    }

    return Object.freeze({
      status:'MVE_X2_INDEPENDENT_TSA_PILOT_OBSERVED',
      pairs,
      trials:rows.length,
      external_requests_issued:witnessRows.length,
      origin_classes:Object.freeze(['LOCAL_ONLY','FREETSA_RFC3161_WITNESSED']),
      artifact_pair_byte_identity,
      a_only_origin_accuracy,
      a_plus_x_origin_accuracy,
      bounded_conditional_origin_information_bits,
      route_conditioned_attestation_association_observed,
      conditional_information_interpretation:'ROUTE_CONDITIONED_ATTESTATION_ASSOCIATION_NOT_INDEPENDENT_ORIGIN_INFORMATION',
      actual_externally_signed_rfc3161_receipts_observed:witnessRows.length===pairs&&witnessRows.every(row=>row.x_valid_external_tsa_receipt),
      certificate_pin_representation:trust.certificate_pin_representation,
      pinned_external_tsa_certificate_files_verified:trust.pinned_certificate_files_verified,
      x509_parse_verified:trust.x509_parse_verified,
      same_run_signed_receipt_custody_required:custodyPath!==null,
      signed_receipts_preserved_in_same_run_custody:custodyPath!==null&&custody_record_written&&witnessEvidence.length===pairs,
      custody_record_written,
      custody_record_contains_raw_artifact:false,
      custody_record_contains_origin_labels:false,
      external_witness_received_origin_labels:false,
      external_witness_received_raw_artifact:false,
      external_witness_received_message_imprint_only:true,
      external_authority_under_experiment_orchestrator_control:false,
      external_authority_distinct_trust_anchor_observed:true,
      paid_subscription_used:false,
      service_credentials_used:false,
      public_transparency_log_written:false,
      specialized_lab_hardware_used:false,
      privileged_model_internal_state_used:false,
      independently_administered_external_attestation_observed:true,
      independently_governed_external_witness_acquired:false,
      independent_origin_sensor_acquired:false,
      empirical_exogenous_channel_acquired:false,
      bounded_empirical_exteriority_information_gain_measured:false,
      external_origin_of_admitted_artifact_proven:false,
      universal_externality_claim:false,
      exact_golden_egg_surfaces_added:Object.freeze([]),
      empirical_credit_to_golden_egg:0,
      golden_egg_earned:false
    });
  } finally {
    await fs.rm(dir,{recursive:true,force:true});
  }
}

if(import.meta.url===`file://${process.argv[1]}`){
  const result=await runMveX2Pilot();
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
}
