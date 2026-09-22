#!/usr/bin/env node
/**
 * Private source-text query: ONLY authenticated/authorized originals already
 * present in an out-of-repo directory. Public summaries never become bodies.
 */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {sha256Utf8} from './wendbine-originals-intake.mjs';

export function loadPrivateOriginals(destination){
 const dir=path.resolve(destination);
 if(!fs.existsSync(dir))return [];
 const entries=fs.readdirSync(dir).filter(x=>/^(?:source-)?[a-z0-9]+\.json$/.test(x));
 const results=[];
 for(const file of entries){
  const item=JSON.parse(fs.readFileSync(path.join(dir,file),'utf8'));
  if(!/^reddit:t3_[a-z0-9]+$/.test(item.source_id||''))continue;
  if(typeof item.title!=='string'||typeof item.selftext!=='string')continue;
  if(!item.rights_basis||!item.source_capture_method)continue;
  results.push({source_id:item.source_id,canonical_url:item.canonical_url,title:item.title,selftext:item.selftext,source_capture_method:item.source_capture_method,publication_timestamp:item.publication_timestamp??null});
 }
 return results.sort((a,b)=>a.source_id.localeCompare(b.source_id));
}
export function queryPrivateOriginals(originals,query,{caseSensitive=false,limit=30}={}){
 if(typeof query!=='string'||!query.trim())throw new Error('NONEMPTY_SOURCE_QUERY_REQUIRED');
 const literalCaseInsensitive=caseSensitive?null:new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g,'\\ const needle=caseSensitive?query:query.toLocaleLowerCase();
 const hits=[];
 for(const source of originals){
  const fields=[['title',source.title],['selftext',source.selftext]];
  for(const [field,sourceText] of fields){
   const haystack=caseSensitive?sourceText:sourceText.toLocaleLowerCase();
   const offset=haystack.indexOf(needle);
   if(offset<0)continue;
   hits.push({source_id:source.source_id,canonical_url:source.canonical_url,field,
    character_offset:offset,exact_field_sha256_utf8:sha256Utf8(sourceText),
    snippet:sourceText.slice(Math.max(0,offset-55),Math.min(sourceText.length,offset+query.length+55)),'),'iu');
 const hits=[];
 for(const source of originals){
  const fields=[['title',source.title],['selftext',source.selftext]];
  for(const [field,sourceText] of fields){
   // Match in the original string, never in a transformed copy whose
   // Unicode case fold may change lengths and corrupt source locators.
   const offset=caseSensitive?sourceText.indexOf(query):(literalCaseInsensitive.exec(sourceText)?.index??-1);
   if(offset<0)continue;
   hits.push({source_id:source.source_id,canonical_url:source.canonical_url,field,
    character_offset:offset,offset_units:'UTF16_CODE_UNITS',
    utf8_byte_offset:Buffer.byteLength(sourceText.slice(0,offset),'utf8'),
    exact_field_sha256_utf8:sha256Utf8(sourceText),
    snippet:sourceText.slice(Math.max(0,offset-55),Math.min(sourceText.length,offset+query.length+55)),
    original_text_state:'PRIVATE_CUSTODIED_SOURCE_FIELD',
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
