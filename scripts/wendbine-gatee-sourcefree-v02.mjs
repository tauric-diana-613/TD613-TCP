/**
 * TD613 Wendbine Gate E v0.2: pure source-free verification / query kernel.
 * SYNTHETIC FIXTURES ONLY. This module deliberately has NO decryption, IO writes,
 * private-source acquisition, public-source admission or Experiment B activation.
 * External host rights, ciphertext custody and atomic persistence remain HELD.
 */
import crypto from 'node:crypto';

const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const utf8 = s => Buffer.from(s, 'utf8');
const eq = (a,b) => a === b;
const err = code => { throw Error(code); };
const sid = s => /^reddit:t3_[a-z0-9]{5,12}$/.test(s);
const epoch = (s,h) => s+'\x1f'+h;
const stableCapture = c => 'wendbine:capture:' + sha([c.source_id,c.title_sha256_utf8,c.body_sha256_utf8,c.observed_at].join('\x1f')).slice(0,24);
const same = (a,b) => JSON.stringify(a) === JSON.stringify(b);
const check = (condition,code) => { if (!condition) err(code); };
const safeInt = n => Number.isSafeInteger(n) && n >= 0;

function decodeBatch(b) {
  check(typeof b.raw_b64 === 'string' && /^[A-Za-z0-9+/]*={0,2}$/.test(b.raw_b64) && b.raw_b64.length%4===0 && b.raw_b64.length<=11184816 && /^[0-9a-f]{64}$/.test(b.raw_sha256), 'RAW_BATCH_BASE64_INVALID');
  const raw = Buffer.from(b.raw_b64,'base64');
  check(raw.toString('base64') === b.raw_b64 && raw.length<=8*1024*1024 && raw.length===b.raw_byte_length && sha(raw)===b.raw_sha256, 'RAW_BATCH_INTEGRITY');
  let parsed;
  try { parsed=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(raw)); }
  catch { err('RAW_BATCH_UTF8_OR_JSON_INVALID'); }
  const objects=Array.isArray(parsed)?parsed:parsed?.data;
  check(Array.isArray(objects) && objects.length<=1000, 'RAW_BATCH_SHAPE_INVALID');
  return objects;
}

function rawStatus(raw) {
  check(typeof raw.title==='string' && typeof raw.selftext==='string' && Number.isFinite(Number(raw.created_utc)), 'RAW_FIELDS_INVALID');
  const media = raw.is_self === false || raw.is_video === true || (typeof raw.post_hint==='string' && raw.post_hint.includes('video'));
  const removed = raw.removed_by_category!=null || ['[removed]','[deleted]'].includes(raw.selftext.trim());
  const state= removed?'HELD_REMOVED_OR_DELETED':raw.selftext===''?(media?'VERIFIED_EMPTY_MEDIA_OR_LINK_BODY':'HELD_EMPTY_TEXT_BODY'):'ARCHIVED_TEXT_BODY_PRESENT';
  return {media,state};
}

/** Validate every current source against public exact capture + private raw batch.
 * sealAuthenticated must be provided by an independent pinned-commit/seal verifier;
 * this function MUST NOT authenticate a caller-supplied seal against itself.
 */
export function validateSourceFree({payload,manifests,captures,rights,versions=[],snapshotId,sealId,sealAuthenticated=false}) {
  check(sealAuthenticated===true && typeof snapshotId==='string' && typeof sealId==='string','EXTERNAL_EPOCH_TRUST_ROOT_REQUIRED');
  check(payload?.schema==='wendbine-src-autosync/v0.1' && payload?.provider==='ARCTIC_SHIFT' &&
    Array.isArray(payload.posts) && Array.isArray(payload.raw_batches) &&
    Array.isArray(manifests) && Array.isArray(captures) && Array.isArray(rights) && Array.isArray(versions), 'INVALID_EPOCH_INPUT');
  check(manifests.length>0 && manifests.length<=100000 && payload.posts.length===manifests.length && rights.length===manifests.length && versions.length===captures.length,'INCOMPLETE_EPOCH_CARDINALITY');
  const byId=new Map(),byManifestId=new Map(),rightsByManifest=new Map(),capturesById=new Map(),versionByCapture=new Map();
  for(const m of manifests){
    check(sid(m.source_id) && !byId.has(m.source_id) && m.platform_account==='Upset-Ratio502' && m.subreddit==='Wendbine' &&
      m.manifestation_id==='reddit:manifestation:'+m.source_id.slice('reddit:t3_'.length), 'INVALID_MANIFEST_IDENTITY');
    check(typeof m.canonical_url==='string' && /^https:\/\/www\.reddit\.com\/r\/Wendbine\/comments\/[a-z0-9]+\//.test(m.canonical_url) && typeof m.published_at==='string','INVALID_MANIFEST_FIELDS');
    check(m.platform_title_status==='EXACT_ARCHIVE_OBSERVED_TITLE'||m.platform_title_status==='TITLE_HASH_ONLY_PUBLIC_RESEARCH_PROJECTION','INVALID_PUBLIC_TITLE_STATE');
    if(m.platform_title_status==='TITLE_HASH_ONLY_PUBLIC_RESEARCH_PROJECTION')check(m.platform_title===null,'HASH_ONLY_TITLE_MUST_STAY_HIDDEN');
    else check(typeof m.platform_title==='string','EXACT_PUBLIC_TITLE_REQUIRED');
    byId.set(m.source_id,m);byManifestId.set(m.manifestation_id,m);
  }
  for(const r of rights){
    check(byManifestId.has(r.manifestation_id) && !rightsByManifest.has(r.manifestation_id) && r.decision==='PRIVATE_ONLY','INVALID_OR_UNAUTHORIZED_RIGHTS');
    rightsByManifest.set(r.manifestation_id,r);
  }
  for(const v of versions) {
    check(typeof v.capture_id==='string' && !versionByCapture.has(v.capture_id), 'DUPLICATE_VERSION_EVENT');
    versionByCapture.set(v.capture_id,v);
  }
  for(const c of captures){
    check(byId.has(c.source_id) && c.manifestation_id===byId.get(c.source_id).manifestation_id &&
      typeof c.observed_at==='string' && !Number.isNaN(Date.parse(c.observed_at)) && c.capture_id===stableCapture(c),'INVALID_CAPTURE_ID_OR_CLOCK');
    if(versionByCapture.size){
      const v=versionByCapture.get(c.capture_id);
      check(v && v.observed_at===c.observed_at && v.title_sha256_utf8===c.title_sha256_utf8 && v.body_sha256_utf8===c.body_sha256_utf8 &&
       v.manifestation_id===c.manifestation_id,'CAPTURE_VERSION_CLOCK_OR_HASH_CONFLICT');
    }
    if(!capturesById.has(c.source_id))capturesById.set(c.source_id,[]);
    capturesById.get(c.source_id).push(c);
  }
  check(capturesById.size===byId.size,'MISSING_PUBLIC_CAPTURES');
  const latest=new Map();
  for(const [id,cs] of capturesById){
    cs.sort((a,b)=>a.observed_at.localeCompare(b.observed_at));
    const last=cs[cs.length-1],ties=cs.filter(x=>x.observed_at===last.observed_at);
    check(ties.every(x=>same(x,last)),'AMBIGUOUS_LATEST_CAPTURE_TIE');
    latest.set(id,last);
  }
  const batches=new Map();
  for(const b of payload.raw_batches) {
    check(!batches.has(b.raw_sha256),'DUPLICATE_RAW_BATCH');
    batches.set(b.raw_sha256,{b,objects:decodeBatch(b),uses:0});
  }
  const records=[],seen=new Set();
  for(const p of payload.posts){
    check(sid(p.source_id) && !seen.has(p.source_id),'INVALID_OR_DUPLICATE_PRIVATE_SOURCE');
    seen.add(p.source_id);
    const m=byId.get(p.source_id),c=latest.get(p.source_id);
    check(m && c && typeof p.title==='string' && typeof p.selftext==='string','PRIVATE_SOURCE_FIELDS_MISSING');
    check(typeof c.archive_response_sha256==='string' && safeInt(c.archive_response_bytes) && safeInt(c.source_object_index) &&
      c.bootstrap_receipt==null,'LATEST_CAPTURE_MISSING_RAW_POINTER');
    check(c.archive_response_sha256===p.archive_response_sha256 && c.archive_response_bytes===p.archive_response_bytes &&
      c.source_object_index===p.source_object_index,'RAW_BATCH_SEALED_POINTER_MISMATCH');
    const pair=batches.get(c.archive_response_sha256);
    check(pair && pair.b.raw_byte_length===c.archive_response_bytes,'RAW_BATCH_SEALED_DIGEST_OR_LENGTH_MISMATCH');
    const raw=pair.objects[c.source_object_index];
    check(raw && 'reddit:t3_'+String(raw.id).replace(/^t3_/,'')===p.source_id && typeof raw.title==='string' && typeof raw.selftext==='string', 'RAW_OBJECT_POSITION_OR_ID_MISMATCH');
    pair.uses++;
    check(String(raw.author).toLowerCase()==='upset-ratio502' && String(raw.subreddit).toLowerCase()==='wendbine' &&
      raw.title===p.title && raw.selftext===p.selftext,'RAW_SOURCE_IDENTITY_OR_FIELDS_MISMATCH');
    const derived=rawStatus(raw);
    check(derived.state!=='HELD_EMPTY_TEXT_BODY' && derived.state!=='HELD_REMOVED_OR_DELETED' &&
      derived.state===p.body_state && derived.media===p.media_or_link_post && c.body_state===derived.state,'BODY_OR_MEDIA_STATE_CONFLICT');
    check(c.source_created_utc===Number(raw.created_utc) && p.source_created_utc===c.source_created_utc &&
      eq(c.source_edited??null,raw.edited??null) && eq(p.source_edited??null,c.source_edited??null) &&
      eq(c.archive_retrieved_on??null,raw.retrieved_on??null) && eq(p.archive_retrieved_on??null,c.archive_retrieved_on??null) &&
      c.provider==='ARCTIC_SHIFT','CAPTURE_CLOCK_OR_EDIT_STATE_MISMATCH');
    check(c.title_sha256_utf8===sha(utf8(p.title)) && c.body_sha256_utf8===sha(utf8(p.selftext)) &&
      c.body_utf8_bytes===utf8(p.selftext).length &&
      (m.platform_title_status==='TITLE_HASH_ONLY_PUBLIC_RESEARCH_PROJECTION' || m.platform_title===p.title) &&
      m.canonical_url===p.canonical_url && m.published_at===new Date(p.source_created_utc*1000).toISOString(),
      'SOURCE_HASH_OR_PUBLIC_FIELDS_MISMATCH');
    records.push({source_id:p.source_id,canonical_url:p.canonical_url,published_at:m.published_at,
      title:p.title,selftext:p.selftext,body_state:derived.state,media_or_link_post:derived.media,
      body_sha256_utf8:c.body_sha256_utf8,title_sha256_utf8:c.title_sha256_utf8,
      capture_id:c.capture_id,observed_at:c.observed_at,source_edited:c.source_edited,
      rights:'PRIVATE_ONLY',snapshotId,sealId});
  }
  check(seen.size===byId.size && [...batches.values()].every(x=>x.uses>0),'INCOMPLETE_POSTS_OR_ORPHAN_RAW_BATCH');
  records.sort((a,b)=>a.published_at.localeCompare(b.published_at)||a.source_id.localeCompare(b.source_id));
  return records;
}

const digestRecords = rows => sha(utf8(JSON.stringify(rows.map(x=>[x.source_id,x.capture_id,x.body_sha256_utf8,x.title_sha256_utf8,x.snapshotId,x.sealId]))));
const encCursor = (data,key) => {
  const body=Buffer.from(JSON.stringify(data)).toString('base64url');
  const signature=crypto.createHmac('sha256',key).update(body).digest('base64url');
  return body+'.'+signature;
};
const decCursor = (cursor,key) => {
  const [body,signature,...extra]=String(cursor).split('.');
  check(!extra.length && body && signature && encCursor(JSON.parse(Buffer.from(body,'base64url').toString('utf8')),key)===cursor,'STALE_OR_TAMPERED_CURSOR');
  return JSON.parse(Buffer.from(body,'base64url').toString('utf8'));
};
/** Exact-byte search deliberately case-sensitive; no case-folding without an offset map. */
export function queryLocalPage({records,kind='search',term,limit=50,cursor=null,cursorKey,allowSource}) {
  check(Array.isArray(records) && (kind==='search'||kind==='date') && typeof term==='string' &&
    Number.isInteger(limit)&&limit>=1&&limit<=100 && Buffer.isBuffer(cursorKey)&&cursorKey.length>=16 &&
    typeof allowSource==='function','INVALID_QUERY_OR_LOCAL_AUTHORITY');
  if(kind==='date')check(/^\d{4}-\d{2}-\d{2}$/.test(term)&&!Number.isNaN(Date.parse(term+'T00:00:00Z'))&&new Date(term+'T00:00:00Z').toISOString().startsWith(term),'INVALID_UTC_DATE');
  else check(utf8(term).length>=2&&utf8(term).length<=500,'INVALID_EXACT_PHRASE');
  check(records.every(r=>r.rights==='PRIVATE_ONLY' && r.snapshotId===records[0]?.snapshotId && r.sealId===records[0]?.sealId &&
    sha(utf8(r.selftext))===r.body_sha256_utf8 && sha(utf8(r.title))===r.title_sha256_utf8),'RESTORED_RECORD_TAMPER_OR_EPOCH_MIX');
  const dataset=digestRecords(records);
  // Bind cursors to a single evaluated authorization snapshot, not only the index.
  const eligibility=records.map(r=>Boolean(allowSource(r)));
  const eligibilityDigest=sha(utf8(JSON.stringify(records.filter((_,i)=>eligibility[i]).map(r=>r.source_id))));
  const qid=sha(utf8(JSON.stringify([epoch(records[0]?.snapshotId,records[0]?.sealId),dataset,eligibilityDigest,kind,term])));
  const state=cursor?decCursor(cursor,cursorKey):{qid,dataset,offset:0};
  check(state.qid===qid && state.dataset===dataset && safeInt(state.offset),'STALE_OR_CROSS_QUERY_CURSOR');
  const list=[];let excluded=0;
  for(const [i,r] of records.entries()){
    if(!eligibility[i]){excluded++;continue;}
    if(kind==='date'){
      if(r.published_at.slice(0,10)===term)list.push({source_id:r.source_id,published_at:r.published_at,body_state:r.body_state,capture_id:r.capture_id});
    } else {
      const body=utf8(r.selftext),needle=utf8(term);let from=0;
      while(from<=body.length-needle.length){
        const idx=body.indexOf(needle,from);if(idx<0)break;
        list.push({source_id:r.source_id,capture_id:r.capture_id,field:'selftext',start_utf8:idx,end_utf8:idx+needle.length,
          exact_slice:new TextDecoder('utf-8',{fatal:true}).decode(body.subarray(idx,idx+needle.length)),body_sha256_utf8:r.body_sha256_utf8});
        from=idx+Math.max(1,needle.length);
      }
    }
  }
  const returned=list.slice(state.offset,state.offset+limit),end=state.offset+returned.length;
  const next=end<list.length?encCursor({qid,dataset,offset:end},cursorKey):null;
  return {status:excluded?'EXECUTED_WITH_RIGHTS_GAPS':list.length?'EXECUTED_MATCHES':'EXECUTED_ZERO',
    query_id:qid,snapshotId:records[0]?.snapshotId,sealId:records[0]?.sealId,eligible:records.length-excluded,
    rights_excluded:excluded,total_matches:list.length,returned_count:returned.length,results:returned,next_cursor:next,
    exhausted:!next,offset_convention:'EXACT_ORIGINAL_UTF8_BYTE_HALF_OPEN'};
}

export function verifyReopenedJsonl({bytes,expectedSha256,expectedLength,expectedCount,snapshotId,sealId}) {
  check(Buffer.isBuffer(bytes) && bytes.length===expectedLength && sha(bytes)===expectedSha256,'INDEPENDENT_LOCAL_INDEX_ANCHOR_MISMATCH');
  let rows;
  try {const str=new TextDecoder('utf-8',{fatal:true}).decode(bytes);check(str.endsWith('\n'),'UNCOMMITTED_OR_TRUNCATED_INDEX');
    rows=str.trimEnd().split('\n').map(JSON.parse);} catch {err('MALFORMED_REOPENED_INDEX');}
  check(rows.length===expectedCount && rows.every(r=>r.snapshotId===snapshotId && r.sealId===sealId &&
    sha(utf8(r.selftext))===r.body_sha256_utf8 && sha(utf8(r.title))===r.title_sha256_utf8),'REOPENED_INDEX_CONTENT_MISMATCH');
  return rows;
}
