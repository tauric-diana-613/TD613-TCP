#!/usr/bin/env node
/**
 * Private source-text query: ONLY authenticated/authorized originals already
 * present in an out-of-repo directory. Public summaries never become bodies.
 */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {sha256Utf8} from './wendbine-originals-intake.mjs';

import { auditPrivateOriginals } from './wendbine-private-custody-audit.mjs';

export function loadPrivateOriginals(destination){
 const dir=path.resolve(destination);
 if(!fs.existsSync(dir))return [];
 // The report is part of the evidence, not optional decoration.
 // Every returned source must pass its matching receipt and exact field hash;
 // OAuth sources must also match the preserved raw Reddit payload.
 return auditPrivateOriginals(dir).records.sort((a,b)=>a.source_id.localeCompare(b.source_id));
}

export function queryPrivateOriginals(originals,query,{caseSensitive=false,limit=30}={}){
 if(typeof query!=='string'||!query.trim())throw new Error('NONEMPTY_SOURCE_QUERY_REQUIRED');
 const meta = new Set(['\\','^','$','.','|','?','*','+','(',')','[',']','{','}']);
 const escaped = [...query].map(ch => meta.has(ch) ? '\\'+ch : ch).join('');
 const pattern = caseSensitive ? null : new RegExp(escaped, 'iu');
 const hits=[];
 for(const source of originals){
  const fields=[['title',source.title],['selftext',source.selftext]];
  for(const [field,sourceText] of fields){
   // Matching occurs in the unmodified original, preserving source offsets.
   const offset=caseSensitive?sourceText.indexOf(query):(pattern.exec(sourceText)?.index??-1);
   if(offset<0)continue;
   hits.push({source_id:source.source_id,canonical_url:source.canonical_url,field,
    character_offset:offset,offset_units:'UTF16_CODE_UNITS',
    utf8_byte_offset:Buffer.byteLength(sourceText.slice(0,offset),'utf8'),
    exact_field_sha256_utf8:sha256Utf8(sourceText),
    snippet:sourceText.slice(Math.max(0,offset-55),Math.min(sourceText.length,offset+query.length+55)),
    original_text_state:source.original_text_state || 'SOURCE_FIELDS_PASSED_IN_MEMORY_NOT_CUSTODY_VERIFIED',
    publication_timestamp:source.publication_timestamp});
   if(hits.length>=limit)return hits;
  }
 }
 return hits;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const [directory,query]=process.argv.slice(2);
 if(!directory||!query)throw new Error('Usage: node wendbine-private-originals-query.mjs <private-originals-dir> <search-phrase>');
 const originals=loadPrivateOriginals(directory);
 const hits=queryPrivateOriginals(originals,query);
 process.stdout.write(JSON.stringify({indexed_originals:originals.length,search_basis:'PRIVATE_AUTHORIZED_SOURCE_TEXT_FIELDS',hits},null,2)+'\n');
}
