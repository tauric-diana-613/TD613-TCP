/** Disposable private development supplement. Never writes to A0 or a Work roster. */
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {pathToFileURL,fileURLToPath} from 'node:url';

export const A0='b90ae99559b21e1561229cdc8e1d873cfaf6f43a';
export const KIND='development_supplement_page';
export const REFERENCE_KIND='development_supplement_reference';
const HERE=path.dirname(fileURLToPath(import.meta.url));
const H=x=>createHash('sha256').update(x).digest('hex');
export const defaultBaseline=path.resolve(HERE,'../eighth-variable/baseline');
export const defaultExtracts=path.resolve(HERE,'../eighth-variable/derived');

async function nativeComponents(baselineRoot){
  const file=path.join(baselineRoot,'scripts/build-vixen-experiment-a-corpus.mjs');
  const source=await fs.readFile(file,'utf8');
  // Reuse only the trusted pinned builder's pure functions and numerical build
  // block. Its main(), original-source acquisition and write calls never run.
  const prefix=source.slice(source.indexOf('const M_DIM ='),source.indexOf('async function resolveEmRoot'));
  const core=source.slice(source.indexOf('  // Build lossless BM25F'),source.indexOf('  // Explicit typed adjacency graph'));
  if(!prefix.startsWith('const M_DIM =')||!core.includes('const compactDocs ='))throw Error('PINNED_BUILDER_LAYOUT_CHANGED');
  const corpusUrl=pathToFileURL(path.join(baselineRoot,'app/encyclopedia/vixen-estate/corpus-experiment-a.mjs')).href;
  const tail=`
  return {
    schema:'td613.vixen.development-supplement-index/v1',built_at:context.binding,
    development_scope:context,
    corpus_custody:{vixen_corpus_bundle_sha256:context.binding,
      development_supplement_source_count:context.source_count,canonical_work_count:0,
      canonical_manifestation_count:0,not_an_a0_index:true,empirical_replication_credit:0},
    bm25f:{N,k1:1.2,field_weights:[3,2,1,0.75],field_b:[0.40,0.55,0.75,0.20],
      avg_field_lengths:avgFieldLengths,vocab_lines:vocabList.join('\\n'),
      df_u16_b64:typedToBase64(dfArr),post_lengths_u16_b64:typedToBase64(postLengths),
      postings_varint_b64:Buffer.from(postBytes).toString('base64')},
    svd_subspace:{M:M_DIM,K:K_DIM,idf_f32_b64:typedToBase64(idfDim),
      mean_f32_b64:typedToBase64(Float32Array.from(mu)),basis_vk_f32_b64:typedToBase64(eigen.basisVk),
      singular_values_f32_b64:typedToBase64(eigen.singularValues),
      doc_vecs_i8_b64:typedToBase64(docVecsI8),doc_scales_f32_b64:typedToBase64(docScalesF32),
      jacobi_sweeps:eigen.sweeps,jacobi_off_diag_residual:eigen.offMax,
      background_null:{mu:bgMu,sigma:bgSigma,covariance_2x2:[[varX,covXY],[covXY,varY]]}},
    chunk_sha256_b64:Buffer.from(chunkShaPacked).toString('base64'),
    graph:{relation_promotion_allowed:false,edges:[]},
    semiotic_taxonomy:{planes:PLANE_KEYS,unit_kinds:UNIT_KINDS,tag_names:tagNameList,rung_names:RUNG_NAMES},
    sources_meta:sourcesMeta,docs:compactDocs
  };
`;
  const moduleText=`import {createHash} from 'node:crypto';\nimport {scrubBase64BlobsForDisplay} from ${JSON.stringify(corpusUrl)};\n${prefix}\nUNIT_KINDS.push(${JSON.stringify(KIND)},${JSON.stringify(REFERENCE_KIND)});\nexport {chunkTextSafe,inferPlaneVec,detectSemioticTags};\nexport function buildIndex(docsForIndex,context){\n${core}\n${tail}\n}`;
  const helpers=await import('data:text/javascript;base64,'+Buffer.from(moduleText).toString('base64'));
  const enginePath=path.join(baselineRoot,'app/encyclopedia/vixen-estate/semantic-semiotic-search.mjs');
  const native=await import(pathToFileURL(enginePath));
  return {helpers,native,builder_sha256:H(source),ranking_sha256:H(await fs.readFile(enginePath))};
}

export async function buildOverlay({baselineRoot=defaultBaseline,extractsRoot=defaultExtracts}={}){
  const {helpers,native,builder_sha256,ranking_sha256}=await nativeComponents(baselineRoot);
  const ids=(await fs.readdir(extractsRoot)).filter(x=>/^emb_[a-z0-9_]+$/.test(x)).sort();
  const ledger=JSON.parse(await fs.readFile(path.resolve(extractsRoot,'../historical-source-ledger.json')));
  const registered=ledger.batch_b_files;
  const documents=[],bodies={},locators={},sourceIdentities=[];
  for(const sourceId of ids){
    const meta=registered.find(x=>x.source_file_id===sourceId);
    if(!meta)throw Error('UNKNOWN_SUPPLEMENT_ID:'+sourceId);
    const pages=JSON.parse(await fs.readFile(path.join(extractsRoot,sourceId,'pages.json')));
    let body='',inReferences=false;
    const sourceLocators=[];
    for(const page of pages){
      const pageBase=body.length;
      body+=page.text+'\f';
      const normalized=page.text.normalize('NFC');
      const heading=/^Works cited\s*$/mi.exec(page.text);
      const segments=heading
        ?[{start:0,text:page.text.slice(0,heading.index),references:inReferences},
          {start:heading.index,text:page.text.slice(heading.index),references:true}]
        :[{start:0,text:page.text,references:inReferences}];
      if(heading)inReferences=true;
      let chunkIndex=0;
      // Actual page labels come from the recovered extraction, never estimated
      // from total length. Keep original-page offsets even if NFC changes text.
      for(const segment of segments)for(const c of helpers.chunkTextSafe(segment.text)){
        const localOffset=segment.start+c.char_offset;
        const id=sourceId+':p'+page.page+':c'+chunkIndex++;
        const raw=normalized.slice(localOffset,localOffset+c.char_length);
        // Recovered page text uses NFC in the existing extraction; fail rather
        // than silently mixing normalized and original source coordinates.
        if(normalized!==page.text)throw Error('NON_NFC_PAGE_REQUIRES_OFFSET_MAP:'+id);
        const offset=pageBase+localOffset;
        documents.push({id,unit_kind:segment.references?REFERENCE_KIND:KIND,work_id:null,source_file_id:sourceId,
          original_filename:meta.original_filename,title:meta.original_filename,format:'pdf',
          media_type:'application/pdf',identity_status:'NONCANONICAL_DEVELOPMENT_SOURCE',
          custody_status:'OPERATOR_AUTHORIZED_PRIVATE_DEVELOPMENT',
          body_representation:'VERIFIED_EXTRACTED_PAGE_TEXT',page_count:pages.length,
          sha256:meta.sha256,derivative_sha256:H(body),char_offset:offset,char_length:c.char_length,
          byte_offset:Buffer.byteLength(body.slice(0,offset)),byte_length:Buffer.byteLength(raw),
          chunk_sha256_bytes:Buffer.from(H(raw),'hex'),page_span:[page.page,page.page],
          snippet:c.snippet,plane_vec:helpers.inferPlaneVec([],'',raw),
          semiotic_tags:helpers.detectSemioticTags(raw),protocol_ids:[],
          _fields:{f0:meta.original_filename,f1:raw.split('\n').slice(0,2).join(' '),f2:c.text,f3:sourceId}});
        locators[id]={page_number:page.page,page_sha256:page.sha256,
          section:segment.references?'references':'prose',
          page_offset_utf16:localOffset,page_length_utf16:c.char_length,
          page_offset_unicode:[...page.text.slice(0,localOffset)].length,
          page_length_unicode:[...raw].length,source_offset_utf16:offset,
          raw_chunk_sha256:H(raw)};
      }
      sourceLocators.push({page:page.page,offset_utf16:pageBase,length_utf16:page.text.length});
    }
    bodies[sourceId]=body;
    for(const d of documents.filter(d=>d.source_file_id===sourceId))d.derivative_sha256=H(body);
    sourceIdentities.push({source_id:sourceId,original_filename:meta.original_filename,
      pdf_sha256:meta.sha256,body_sha256:H(body),pages:pages.length,page_locators:sourceLocators});
  }
  const context={source_sha:A0,source_count:ids.length,scope:'PRIVATE_DEVELOPMENT_SUPPLEMENT_ONLY',
    unit_kind:KIND,canonical_work_count:0,methods:'native BM25F + centered hashed 256→48 Jacobi-SVD + native rule-based semiotic affinity; contextual SRC-conditioned signals when selected',
    empirical_replication_credit:0,primary_answer_model_trials:0,
    builder_sha256,ranking_sha256,binding:H(JSON.stringify(sourceIdentities))};
  const index=helpers.buildIndex(documents,context);
  // The original constructor and original prospective-admission guard remain
  // untouched. This is a distinct schema/type with zero canonical Work records.
  new native.SemanticSemioticSearchEngine(index);
  return {schema:'td613.vixen.dev-seven-source-overlay/v1',context,index,bodies,locators,sourceIdentities};
}

export async function loadOverlay(file,{baselineRoot=defaultBaseline}={}){
  const packet=JSON.parse(await fs.readFile(file));
  if(packet.schema!=='td613.vixen.dev-seven-source-overlay/v1')throw Error('WRONG_OVERLAY_SCHEMA');
  const {SemanticSemioticSearchEngine}=await import(pathToFileURL(path.join(baselineRoot,'app/encyclopedia/vixen-estate/semantic-semiotic-search.mjs')));
  const engine=new SemanticSemioticSearchEngine(packet.index);
  for(const s of packet.sourceIdentities){
    if(H(packet.bodies[s.source_id])!==s.body_sha256)throw Error('BODY_CHANGED:'+s.source_id);
    engine.shardTexts.set(s.source_id,packet.bodies[s.source_id]);
  }
  let enabled=true;
  return {packet,engine,disable(){enabled=false;engine.shardTexts.clear();},search(query,{mode='hybrid',scope='supplement',section='prose',...opts}={}){
    if(scope!=='supplement')throw Error('USE_SEPARATE_A0_ENGINE_FOR_CANONICAL_SCOPE');
    if(!['prose','references','all'].includes(section))throw Error('UNKNOWN_SECTION');
    if(!enabled)return {status:'SUPPLEMENT_REMOVED',scope,hits:[],returned_hits:0};
    const raw=engine.search(query,{deployment_env:'PREVIEW',mode,limit:7,uniqueSources:true,...opts,
      unitKindFilter:section==='prose'?KIND:section==='references'?REFERENCE_KIND:null});
    const hits=raw.hits.map(h=>{
      const locator=packet.locators[h.id];
      const chunk=packet.bodies[h.source_file_id].slice(h.char_offset,h.char_offset+h.char_length);
      if(!locator||H(chunk)!==locator.raw_chunk_sha256||h.chunk_sha256!==locator.raw_chunk_sha256)throw Error('CHUNK_CHANGED:'+h.id);
      return {...h,prospective_source_id:h.source_file_id,page_number:locator.page_number,
        text_locator:locator,method:packet.context.methods,score_profile:raw.fusion_controls,
        citation:{...h.citation,prospective_source_id:h.source_file_id,page_number:locator.page_number,text_locator:locator},
        canonical_work:false,relationship_status:'UNRATIFIED',text:chunk};
    });
    // A0's raw result has hardcoded historical census labels. Do not carry them
    // into the supplemental API: report the actual seven-source scope instead.
    return {status:raw.status,query:raw.query,mode,scope,section,engine_version:raw.engine_version,
      // Native early-abstention responses omit this field. The attached engine
      // is still the real full index; preserving its identity lets Podium return
      // a truthful zero-hit receipt instead of misclassifying it as a fallback.
      fusion_state:raw.fusion_state??'FULL_INDEX_FUSION',total_hits:raw.total_hits??0,pagination:raw.pagination,
      source_count:packet.sourceIdentities.length,canonical_work_count:0,
      fusion_controls:raw.fusion_controls,observability:raw.aperture_observability,
      returned_hits:hits.length,hits,primary_trial_credit:0};
  }};
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const [command,file,...query]=process.argv.slice(2);
  if(command==='build'){
    const packet=await buildOverlay();
    await fs.writeFile(file,JSON.stringify(packet));
    console.log(JSON.stringify({status:'BUILT',sources:packet.sourceIdentities.length,pages:packet.sourceIdentities.reduce((n,s)=>n+s.pages,0),chunks:packet.index.docs.length,bytes:(await fs.stat(file)).size,context:packet.context},null,2));
  }else if(command==='search'){
    const overlay=await loadOverlay(file);
    console.log(JSON.stringify(overlay.search(query.join(' ')),null,2));
  }else throw Error('Usage: node seven-source-overlay.mjs build <private-index.json> | search <private-index.json> <query>');
}
