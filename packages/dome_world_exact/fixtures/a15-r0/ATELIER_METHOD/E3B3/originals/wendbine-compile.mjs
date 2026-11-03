import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const DEFAULT_META = path.join(ROOT, '01-MANIFESTS', 'public-reddit-48h-snapshot-v01.json');
const DEFAULT_POSTS = path.join(ROOT, '01-MANIFESTS', 'public-reddit-48h-source-registry-v01.jsonl');
const DEFAULT_RELATIONS = path.join(ROOT, '01-MANIFESTS', 'typed-relation-registry-v01.json');
const DEFAULT_OUTPUT = path.join(ROOT, '03-DERIVATIVES', 'public-reddit-48h', 'topology.generated.json');

function readJsonl(filePath) {
  const text = fs.readFileSync(filePath, 'utf8');
  return text.split(/\r?\n/).filter(Boolean).map((line, index) => {
    try { return JSON.parse(line); }
    catch (error) { throw new Error(`${filePath}:${index + 1}: invalid JSONL: ${error.message}`); }
  });
}

function pairKey(left, right) { return left < right ? `${left}\u0000${right}` : `${right}\u0000${left}`; }
function sortObject(object) { return Object.fromEntries(Object.entries(object).sort(([a], [b]) => a.localeCompare(b))); }

export function compilePublicCorpus(meta, posts, relations) {
  if (!meta || meta.schema !== 'wendbine-public-corpus-snapshot/v0.1') throw new Error('unsupported or missing Wendbine snapshot metadata');
  if (!Array.isArray(posts) || posts.length === 0) throw new Error('posts are required');
  if (!Array.isArray(relations)) throw new Error('relations array is required');

  const byId = new Map();
  for (const post of posts) {
    if (post.snapshot_id !== meta.snapshot_id) throw new Error(`${post.source_id}: snapshot mismatch`);
    if (!/^reddit:t3_[a-z0-9]+$/i.test(post.source_id)) throw new Error(`${post.source_id}: invalid source id`);
    if (byId.has(post.source_id)) throw new Error(`${post.source_id}: duplicate source id`);
    if (post.community !== 'r/Wendbine') throw new Error(`${post.source_id}: wrong community`);
    if (post.source_text_stored !== false) throw new Error(`${post.source_id}: source-body copying is forbidden in v0.1`);
    if (post.real_person_identity_adjudicated !== false) throw new Error(`${post.source_id}: person identity must remain unadjudicated`);
    if (!/^https:\/\/www\.reddit\.com\/r\/Wendbine\/comments\//.test(post.canonical_url)) throw new Error(`${post.source_id}: canonical public Reddit URL required`);
    if (!Array.isArray(post.declared_concepts)) throw new Error(`${post.source_id}: declared concepts required`);
    byId.set(post.source_id, post);
  }
  if (posts.length !== meta.coverage.admitted_source_count) throw new Error(`source count ${posts.length} disagrees with snapshot metadata ${meta.coverage.admitted_source_count}`);

  const conceptSources = new Map();
  for (const post of posts) for (const concept of [...new Set(post.declared_concepts)].sort()) {
    if (!conceptSources.has(concept)) conceptSources.set(concept, new Set());
    conceptSources.get(concept).add(post.source_id);
  }

  const relationEdges = relations.map(edge => {
    if (!byId.has(edge.source_id)) throw new Error(`${edge.source_id}: relation cites an unadmitted source`);
    if (!/^G_[A-Z]+$/.test(edge.graph)) throw new Error(`${edge.source_id}: invalid graph layer ${edge.graph}`);
    for (const key of ['from', 'relation', 'to', 'evidence_class']) if (!edge[key]) throw new Error(`${edge.source_id}: relation missing ${key}`);
    return { graph: edge.graph, from: edge.from, relation: edge.relation, to: edge.to, source_id: edge.source_id, evidence_class: edge.evidence_class };
  }).sort((a,b) => a.graph.localeCompare(b.graph) || a.from.localeCompare(b.from) || a.relation.localeCompare(b.relation) || a.to.localeCompare(b.to) || a.source_id.localeCompare(b.source_id));

  const declarationEdges = [];
  for (const post of posts) for (const concept of [...new Set(post.declared_concepts)].sort()) declarationEdges.push({ graph:'G_SOURCE', from:post.source_id, relation:'DECLARES_CONCEPT', to:`concept:${concept}`, source_id:post.source_id, evidence_class:'ARCHIVE_NORMALIZED_FROM_PUBLIC_SOURCE' });
  declarationEdges.sort((a,b) => a.from.localeCompare(b.from) || a.to.localeCompare(b.to));

  const cooccurrence = new Map();
  for (const post of posts) {
    const concepts = [...new Set(post.declared_concepts)].sort();
    for (let i=0;i<concepts.length;i+=1) for (let j=i+1;j<concepts.length;j+=1) {
      const key=pairKey(concepts[i],concepts[j]);
      if (!cooccurrence.has(key)) cooccurrence.set(key,{left:concepts[i],right:concepts[j],source_ids:new Set()});
      cooccurrence.get(key).source_ids.add(post.source_id);
    }
  }
  const cooccurrenceEdges=[...cooccurrence.values()].filter(row=>row.source_ids.size>=2).map(row=>({graph:'G_COOCCURRENCE',from:`concept:${row.left}`,relation:'CO_OCCURS_WITH',to:`concept:${row.right}`,weight:row.source_ids.size,source_ids:[...row.source_ids].sort(),evidence_class:'ARCHIVE_DERIVED_COOCCURRENCE_NOT_CAUSAL'})).sort((a,b)=>b.weight-a.weight||a.from.localeCompare(b.from)||a.to.localeCompare(b.to));

  const dates={}; for (const post of posts) dates[post.public_date]=(dates[post.public_date]||0)+1;
  const graphCounts={}; for (const edge of relationEdges) graphCounts[edge.graph]=(graphCounts[edge.graph]||0)+1;
  const conceptNodes=[...conceptSources.entries()].map(([concept,sourceIds])=>({id:`concept:${concept}`,kind:'CONCEPT',label:concept,source_count:sourceIds.size,source_ids:[...sourceIds].sort()})).sort((a,b)=>a.id.localeCompare(b.id));
  const postNodes=[...posts].sort((a,b)=>a.public_date.localeCompare(b.public_date)||a.source_id.localeCompare(b.source_id)).map(post=>({id:post.source_id,kind:'PUBLIC_POST',public_date:post.public_date,time_precision:post.time_precision,canonical_url:post.canonical_url,technical_header:post.technical_header,source_flags:[...post.source_flags].sort()}));
  const continuityCandidates=conceptNodes.filter(node=>node.source_count>=2).map(node=>({concept:node.label,source_count:node.source_count,source_ids:node.source_ids,classification:'RECURRENT_PUBLIC_CONCEPT_NOT_HIDDEN_STATE_PROOF'})).sort((a,b)=>b.source_count-a.source_count||a.concept.localeCompare(b.concept));
  const explicitSynthesisSources=posts.filter(post=>post.source_flags.includes('EXPLICIT_CAUSAL_TOPOLOGY_SYNTHESIS')).map(post=>post.source_id).sort();
  const correctionSources=posts.filter(post=>post.source_flags.includes('EXPLICIT_CORRECTION')).map(post=>post.source_id).sort();

  return {
    schema:'wendbine-public-topology/v0.1', snapshot_id:meta.snapshot_id,
    compiled_from:{surface:meta.scope.surface,community:meta.scope.community,source_count:posts.length,full_post_bodies_copied:meta.rights.full_post_bodies_copied,private_google_group_admitted:meta.scope.private_google_group_admitted},
    coverage:meta.coverage, authority:meta.authority,
    graph_semantics:{G_D:'dependency topology',G_A:'authority / permission / trust',G_F:'information and metadata flow',G_I:'identity / continuity / entity alignment',G_T:'temporal / program / version relations',G_P:'provenance / custody / ancestry',G_R:'reconstruction / estimation / recovery',G_O:'observation boundary / observability',G_X:'cross-relation interaction or source-declared synthesis',G_SOURCE:'source-to-normalized-concept binding',G_COOCCURRENCE:'archive-derived co-occurrence only; never causal'},
    non_equivalences:['G_D != G_A != G_F != G_I != G_T != G_P != G_R != G_O != G_X','PUBLIC_POST != AUTHOR_INTENT','PUBLIC_POST_TOPOLOGY != PRIVATE_STATE','SERIALIZED_CONTINUITY != SHARED_HIDDEN_MEMORY','EXPLICIT_CROSS_REFERENCE != MODEL_INFERRED_EDGE','SEMANTIC_RESEMBLANCE != STATE_PERSISTENCE','STATE_PERSISTENCE != EXTERNAL_ORCHESTRATION','SAME_TOKEN != SAME_OPERATOR','CONVENTIONAL_DOMAIN_LANGUAGE != WENDBINE_PROVENANCE','TD613_COMPARABLE != TD613_DERIVED','SOURCE_ASSERTION != ARCHIVE_OBSERVATION != ATELIER_INFERENCE'],
    publication_day_buckets:sortObject(dates),post_nodes:postNodes,concept_nodes:conceptNodes,declaration_edges:declarationEdges,typed_relation_edges:relationEdges,typed_relation_counts:sortObject(graphCounts),cooccurrence_overlay:cooccurrenceEdges,recurrent_public_concepts:continuityCandidates,explicit_synthesis_sources:explicitSynthesisSources,correction_sources:correctionSources,
    continuity_claim_ceiling:'The corpus may demonstrate serialized public continuity, recurrence, explicit cross-reference, or source-declared synthesis. It does not establish private hidden state, shared hidden memory, motive, or orchestration.'
  };
}

export function compileFiles({metaPath=DEFAULT_META,postsPath=DEFAULT_POSTS,relationsPath=DEFAULT_RELATIONS,outputPath=DEFAULT_OUTPUT}={}) {
  const meta=JSON.parse(fs.readFileSync(metaPath,'utf8'));
  const posts=readJsonl(postsPath);
  const relationRegistry=JSON.parse(fs.readFileSync(relationsPath,'utf8'));
  if (relationRegistry.schema!=='wendbine-typed-relation-registry/v0.1') throw new Error('unsupported typed relation registry');
  const relations=relationRegistry.relations.map(row=>Object.fromEntries(relationRegistry.fields.map((field,index)=>[field,row[index]])));
  const compiled=compilePublicCorpus(meta,posts,relations);
  fs.mkdirSync(path.dirname(outputPath),{recursive:true});
  fs.writeFileSync(outputPath,`${JSON.stringify(compiled,null,2)}\n`,'utf8');
  return compiled;
}

if (process.argv[1] && path.resolve(process.argv[1])===path.resolve(fileURLToPath(import.meta.url))) {
  const outputPath=process.argv[2]?path.resolve(process.argv[2]):DEFAULT_OUTPUT;
  const compiled=compileFiles({outputPath});
  console.log(JSON.stringify({snapshot_id:compiled.snapshot_id,source_count:compiled.compiled_from.source_count,concept_count:compiled.concept_nodes.length,typed_relation_count:compiled.typed_relation_edges.length,cooccurrence_edge_count:compiled.cooccurrence_overlay.length,coverage_state:compiled.coverage.state,output:outputPath},null,2));
}
