// Invented B.5 fixture constructors retained as data, not research implementations.
import fs from 'node:fs';import path from 'node:path';import {createHash} from 'node:crypto';import {inventedFixture} from '../E3B5/invented-fixtures.mjs';const hash=b=>createHash('sha256').update(b).digest('hex');
export function td(){
 const records=[['A','Tú puedes clonarme, pero no tienes mis genes.','collapse governance topology'],['B','Second reference','other source']].map(([id,label,body],i)=>({id:'R-FIXTURE-'+id,kind:'evidence',label,aliases:['governance'],evidence_class:'SYNTHETIC',visibility:'public',record:{body},supplement:{},links:i?[]:[{type:'cites_source',target:'R-FIXTURE-B'}],source_keys:['FIXTURE-TD'],origin:{json_pointer:'fixture:/'+id}}));
 return {manifest:{schema:'td613.encyclopedia.reference/v1',edition_version:'1.4',edition_source_commit:'synthetic-only',canonical_payload_sha256:'synthetic-only',facets:{}},records,directory:records.map(r=>({id:r.id,record_sha256:hash(JSON.stringify(r).replace(/</g,'\\u003c')),html_line:1,html_anchor:'#record='+r.id}))};
}
export function w(){
 const posts=['a','b'].map((x,i)=>({source_id:'reddit:t3_fixture'+x,snapshot_id:'B5-SYNTHETIC',community:'r/Wendbine',source_text_stored:false,real_person_identity_adjudicated:false,canonical_url:'https://www.reddit.com/r/Wendbine/comments/fixture_'+x,declared_concepts:i?['beta']:['topology','alpha'],normalized_summary:'Synthetic governance topology',public_date:'2026-09-1'+i,time_precision:'DAY',technical_header:'Synthetic '+x,source_flags:[]}));
 return {meta:{schema:'wendbine-public-corpus-snapshot/v0.1',snapshot_id:'B5-SYNTHETIC',coverage:{admitted_source_count:2},scope:{surface:'synthetic',community:'r/Wendbine',private_google_group_admitted:false},rights:{full_post_bodies_copied:false},authority:{}},posts,relations:[{source_id:posts[0].source_id,graph:'G_D',from:'alpha',to:'beta',relation:'DEPENDS_ON',evidence_class:'SOURCE_EXPLICIT_PROGRAM'}]};
}
export function src(name='spanish_exact'){
 const dir=path.resolve('tests/fixtures/e3b41-invented',name,'03-DERIVATIVES/text/zenodo');
 const documents=fs.readdirSync(dir).filter(f=>/^zenodo-\d+-file-0.md$/.test(f)).sort().map(f=>{
  const id=f.match(/zenodo-(\d+)/)[1],meta='zenodo-'+id+'-metadata.md',body=fs.readFileSync(path.join(dir,f)),metadata=fs.readFileSync(path.join(dir,meta));
  return {entity_id:'zenodo:'+id,body_base64:body.toString('base64'),metadata_base64:metadata.toString('base64'),body_sha256:hash(body),metadata_sha256:hash(metadata),body_path:'03-DERIVATIVES/text/zenodo/'+f,metadata_path:'03-DERIVATIVES/text/zenodo/'+meta,rights:'INVENTED_SOURCE_FREE'};
 });
 return {methods:inventedFixture(),routing:{synthetic_only:true,evidence_class:'SYNTHETIC_REPLAY_ONLY',documents}};
}
