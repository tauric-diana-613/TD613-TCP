// 𝌋 TD613 Stage III-B — source-free reciprocal receiver substrate v0.2 (public-rights guard).
// Explicitly NOT a protected archive admission, production accession, or universal parity claim.
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
const require = createRequire(import.meta.url);
const sha = value => createHash('sha256').update(value).digest('hex');
export const ROUTES = Object.freeze({
  TD613_ENCYCLOPEDIA_TO_UNIVERSAL_ATELIER: Object.freeze({
    source: 'TD613_ENCYCLOPEDIA', receiver: 'UNIVERSAL_ATELIER',
    sourcePin: '50cc9d161f8f72c2d4b6ea33ece17ace88f35eff',
    nativePaths: ['scripts/encyclopedia-intake.cjs','scripts/encyclopedia-intake-schema.json'],
    nativeSHA256: ['543e2c23aff74a6d55d66fae2231327f98374498e3637214ddaabf32d0438cc5', '52d09471ec442e6c26505fee9fa9f2c8b836f7b5e2777bac1dd30eeac315b934']
  }),
  WENDBINE_ATELIER_TO_UNIVERSAL_ENCYCLOPEDIA: Object.freeze({
    source: 'WENDBINE_PUBLIC_ATELIER', receiver: 'UNIVERSAL_ENCYCLOPEDIA',
    sourcePin: 'a8a619378f5a47137a8bd7d1765d47571f383e1e',
    nativePaths: ['packages/dome_world_exact/fixtures/a15-r0/WENDBINE/99-ADMIN/wendbine-compile.mjs'],
    nativeSHA256: ['1e87e611524fc25ccb33c7ce63d51a7edfc92ea926c28ed2347c44f99fb45bb0']
  })
});
const fail = code => { throw Object.assign(new Error(code), { code }); };
const secureDirectory = dir => {
  if (!path.isAbsolute(dir) || !fs.existsSync(dir) || fs.lstatSync(dir).isSymbolicLink()) fail('ABSOLUTE_EXISTING_NONSYMLINK_DIR_REQUIRED');
  const real = fs.realpathSync(dir);
  if (!fs.statSync(real).isDirectory()) fail('RECEIVER_DIRECTORY_REQUIRED');
  return real;
};
const safeFile = (root, name) => {
  const file = path.join(root, name);
  if (fs.existsSync(file) && (fs.lstatSync(file).isSymbolicLink() || !fs.lstatSync(file).isFile())) fail('RECEIVER_FILE_SUBSTITUTED');
  return file;
};
export async function nativeProbe(repoRoot, route, original) {
  const spec = ROUTES[route]; if (!spec) fail('UNKNOWN_RECIPROCAL_ROUTE');
  const repo = secureDirectory(repoRoot);
  const identities = [];
  for (const p of spec.nativePaths) {
    const file = path.join(repo, p);
    if (!fs.existsSync(file) || fs.lstatSync(file).isSymbolicLink() || fs.realpathSync(file)!==file) fail('PINNED_NATIVE_SOURCE_UNAVAILABLE');
    const sourceHash=sha(fs.readFileSync(file));
    if(sourceHash!==spec.nativeSHA256[identities.length]) fail('PINNED_NATIVE_CODE_DRIFT');
    identities.push({ path:p, sha256:sourceHash });
  }
  if (route === 'TD613_ENCYCLOPEDIA_TO_UNIVERSAL_ATELIER') {
    const intake = require(path.join(repo,spec.nativePaths[0]));
    const schema = JSON.parse(fs.readFileSync(path.join(repo,spec.nativePaths[1]),'utf8'));
    const inspected = intake.inspect(original,schema);
    if (!inspected.valid) fail('NATIVE_TD613_REFUSAL');
    if (inspected.record.visibility!=='public') fail('PRIVATE_SOURCE_NOT_AUTHORIZED');
    return { operation:'TD613_NATIVE_SCHEMA_INSPECTION', result:{ source_id:inspected.record.record_id,
      title:inspected.record.title, claim_ceiling:inspected.record.evidence.claim_ceiling,
      source_refs:inspected.record.sources.map(s=>s.source_id), disposition:inspected.disposition },
      native:identities };
  }
  let value; try { value=JSON.parse(original); } catch { fail('NATIVE_WENDBINE_REFUSAL'); }
  if (value?.meta?.schema!=='wendbine-public-corpus-snapshot/v0.1' || !Array.isArray(value.posts) || !Array.isArray(value.relations)) fail('NATIVE_WENDBINE_REFUSAL');
  // Local public-route guard: native topology compilation checks per-post source_text_stored,
  // but does not refuse contradictory archive-wide private flags or extra copied body fields.
  // This guard is intentionally narrower than a general private-data detector.
  if (value.meta?.rights?.full_post_bodies_copied !== false ||
      value.meta?.scope?.private_google_group_admitted !== false ||
      value.meta?.scope?.community !== 'r/Wendbine') fail('WENDBINE_PUBLIC_RIGHTS_REFUSED');
  const copiedBodyKeys=['body','body_text','content','full_text','post_body','private_text','raw_body','source_body','source_text','text'];
  if (value.posts.some(post=>!post || typeof post!=='object' ||
      copiedBodyKeys.some(key=>Object.hasOwn(post,key)))) fail('WENDBINE_SOURCE_BODY_FIELD_REFUSED');
  const compiler = await import(pathToFileURL(path.join(repo,spec.nativePaths[0])).href);
  let graph;try { graph=compiler.compilePublicCorpus(value.meta,value.posts,value.relations); } catch { fail('NATIVE_WENDBINE_REFUSAL'); }
  return { operation:'WENDBINE_NATIVE_PUBLIC_TOPOLOGY', result:{ snapshot_id:graph.snapshot_id,
    typed_edges:graph.typed_relation_edges, day_buckets:graph.publication_day_buckets,
    source_ids:graph.post_nodes.map(x=>x.id), non_equivalences:graph.non_equivalences },
    native:identities };
}
export function openSyntheticReceiver({ repoRoot, store, route }) {
  const spec=ROUTES[route];if(!spec)fail('UNKNOWN_RECIPROCAL_ROUTE');
  const repo=secureDirectory(repoRoot), dest=secureDirectory(store);
  if (dest===repo || dest.startsWith(repo+path.sep) || repo.startsWith(dest+path.sep)) fail('INDEPENDENT_RECEIVER_STORE_REQUIRED');
  const folder=path.join(dest,sha(route));
  if (!fs.existsSync(folder)) fs.mkdirSync(folder,{mode:0o700});
  secureDirectory(folder);
  const locate=id=>safeFile(folder,sha(id)+'.json');
  function get(id, expectedReceiptHash) {
    if(typeof expectedReceiptHash!=='string'||!/^[a-f0-9]{64}$/.test(expectedReceiptHash)) fail('INDEPENDENT_RECORD_RECEIPT_REQUIRED');
    const file=locate(id);if(!fs.existsSync(file)) fail('RECEIVER_SOURCE_ABSENT');
    const bytes=fs.readFileSync(file);
    if(sha(bytes)!==expectedReceiptHash) fail('RECEIVER_RECORD_RECEIPT_MISMATCH');
    const data=JSON.parse(bytes.toString('utf8'));
    if(data.schema!=='td613.reciprocal-sourcefree/v1'||data.route!==route||data.source_id!==id||
       typeof data.original!=='string'||sha(Buffer.from(data.original))!==data.original_sha256||
       data.source_pin!==spec.sourcePin)fail('RECEIVER_RECORD_DRIFT');
    return data;
  }
  return Object.freeze({
    route, receiver:spec.receiver, source:spec.source,
    async admit(envelope) {
      if (envelope?.evidence_class!=='SYNTHETIC_SOURCE_FREE_FIXTURE'||envelope.source_pin!==spec.sourcePin)fail('SOURCE_FREE_OR_SOURCE_PIN_REQUIRED');
      if(typeof envelope.source_id!=='string'||!envelope.source_id.startsWith('FIXTURE:')||
         typeof envelope.original!=='string'||!Buffer.isBuffer(envelope.bytes)||
         !envelope.bytes.equals(Buffer.from(envelope.original))||sha(envelope.bytes)!==envelope.sha256)fail('ORIGINAL_BYTES_OR_FIXTURE_ID_MISMATCH');
      if(envelope.rights!=='SYNTHETIC_LOCAL_ONLY')fail('SOURCE_RIGHTS_NOT_ADMITTED');
      const native=await nativeProbe(repo,route,envelope.original);
      const record={schema:'td613.reciprocal-sourcefree/v1',route,source_id:envelope.source_id,source_pin:spec.sourcePin,
        original:envelope.original,original_sha256:envelope.sha256,rights:envelope.rights,
        native_operation:native.operation,native_source_hashes:native.native, native_result_sha256:sha(JSON.stringify(native.result)),
        evidence_class:'SYNTHETIC_SOURCE_FREE_FIXTURE', claim_ceiling:'Source-free native-operation and receiver readback only; no external research or private archive admitted.'};
      const file=locate(envelope.source_id),bytes=Buffer.from(JSON.stringify(record)+'\n');
      if(fs.existsSync(file)) {
        const prior=fs.readFileSync(file);if(!prior.equals(bytes))fail('RECEIVER_REPLAY_CONFLICT');
        get(envelope.source_id,sha(prior));return { status:'EXACT_REPLAY',source_id:envelope.source_id,record_sha256:sha(prior) };
      }
      try{fs.writeFileSync(file,bytes,{flag:'wx',mode:0o600});}catch(e){if(e.code==='EEXIST')fail('RECEIVER_CONCURRENT_WRITE_CONFLICT');throw e;}
      const fd=fs.openSync(file,'r');try{fs.fsyncSync(fd);}finally{fs.closeSync(fd);}
      if(!fs.readFileSync(file).equals(bytes))fail('RECEIVER_READBACK_MISMATCH');
      return {status:'RECEIVER_SOURCE_ADMITTED_SYNTHETIC',source_id:envelope.source_id,record_sha256:sha(bytes)};
    },
    retrieve(id,expectedReceiptHash) {
      const r=get(id,expectedReceiptHash);return {source_id:id,original:r.original,original_sha256:r.original_sha256,
        source_pin:r.source_pin,native_operation:r.native_operation,evidence_class:r.evidence_class};
    },
    search(term) {
      if(typeof term!=='string'||!term.trim()||term.length>100)fail('BOUNDED_SEARCH_REQUIRED');
      const ids=[];
      for(const name of fs.readdirSync(folder).filter(x=>/^[a-f0-9]{64}\.json$/.test(x))) {
        const parsed=JSON.parse(fs.readFileSync(safeFile(folder,name),'utf8'));
        const record=get(parsed.source_id,sha(fs.readFileSync(safeFile(folder,name))));if(record.original.toLowerCase().includes(term.toLowerCase()))ids.push(record.source_id);
      }
      return {query:term,ids:ids.sort(),method:'UNATTESTED_ON_DISK_BOUNDED_SUBSTRING_SCAN_NOT_NATIVE_BM25',verification:'EXTERNAL_RECEIPT_REQUIRED_FOR_CITATION'};
    },
    async execute(id,expectedReceiptHash) {
      const record=get(id,expectedReceiptHash);const actual=await nativeProbe(repo,route,record.original);
      if(actual.operation!==record.native_operation ||sha(JSON.stringify(actual.result))!==record.native_result_sha256 ||
         JSON.stringify(actual.native)!==JSON.stringify(record.native_source_hashes))fail('NATIVE_EXECUTION_OR_SOURCE_DRIFT');
      return { source_id:id,source_pin:record.source_pin, operation:actual.operation,
        result:actual.result, claim_ceiling:record.claim_ceiling,evidence_class:record.evidence_class };
    }
  });
}