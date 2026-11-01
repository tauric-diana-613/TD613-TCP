import {inflateRawSync} from 'node:zlib';
import {need,refuse} from './errors.mjs';
const decode=new TextDecoder('utf-8',{fatal:true,ignoreBOM:true});
export function crc32(bytes){let crc=0xffffffff;for(const byte of bytes){crc^=byte;for(let k=0;k<8;k++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}return (crc^0xffffffff)>>>0;}
export function decodeUtf8(bytes){try{return decode.decode(bytes);}catch{refuse('SOURCE_ENCODING_UNSUPPORTED');}}
function safeName(name){
 need(name.length>0&&name.isWellFormed()&&!/[\x00-\x1f\\:]/.test(name)&&!name.startsWith('/')&&!name.split('/').some(p=>p==='.'||p==='..'),'ARCHIVE_MEMBER_REFUSED');
 need(!name.split('/').some(p=>/[. ]$/.test(p)||/^(?:con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(p)),'ARCHIVE_MEMBER_REFUSED');
}
// Classic single-disk ZIP, stored/deflate, UTF-8 text only; all files admitted or the entire input refuses.
export function parseTextZip(bytes,limits={}){
 const cap={archiveBytes:32*1024*1024,expandedBytes:16*1024*1024,memberBytes:2*1024*1024,members:96,ratio:200,...limits};
 need(Buffer.isBuffer(bytes)&&bytes.length>=22&&bytes.length<=cap.archiveBytes,'ARCHIVE_LIMIT');
 let end=-1;
 for(let p=bytes.length-22;p>=Math.max(0,bytes.length-65557);p--){if(bytes.readUInt32LE(p)===0x06054b50&&p+22+bytes.readUInt16LE(p+20)===bytes.length){end=p;break;}}
 need(end>=0,'ARCHIVE_FORMAT');
 need(bytes.readUInt16LE(end+4)===0&&bytes.readUInt16LE(end+6)===0,'ARCHIVE_FORMAT');
 const count=bytes.readUInt16LE(end+10),size=bytes.readUInt32LE(end+12),offset=bytes.readUInt32LE(end+16);
 need(count===bytes.readUInt16LE(end+8)&&count>0&&count<65535&&count<=cap.members&&offset+size===end,'ARCHIVE_FORMAT');
 let cursor=offset,total=0;const entries=[],names=new Set(),regions=[];
 for(let index=0;index<count;index++){
  need(cursor+46<=end&&bytes.readUInt32LE(cursor)===0x02014b50,'ARCHIVE_FORMAT');
  const flags=bytes.readUInt16LE(cursor+8),method=bytes.readUInt16LE(cursor+10),crc=bytes.readUInt32LE(cursor+16),compressed=bytes.readUInt32LE(cursor+20),expanded=bytes.readUInt32LE(cursor+24);
  const nameLength=bytes.readUInt16LE(cursor+28),extra=bytes.readUInt16LE(cursor+30),comment=bytes.readUInt16LE(cursor+32),disk=bytes.readUInt16LE(cursor+34),attr=bytes.readUInt32LE(cursor+38),local=bytes.readUInt32LE(cursor+42);
  need(cursor+46+nameLength+extra+comment<=end&&disk===0&&(flags&~0x0808)===0&&(method===0||method===8)&&compressed<0xffffffff&&expanded<0xffffffff,'ARCHIVE_FORMAT');
  const nameBytes=bytes.subarray(cursor+46,cursor+46+nameLength),name=decodeUtf8(nameBytes);safeName(name);
  need((flags&0x0800)||nameBytes.every(b=>b<128),'ARCHIVE_NAME_ENCODING_UNSUPPORTED');
  const key=name.normalize('NFC').toLowerCase();need(!names.has(key),'ARCHIVE_DUPLICATE_MEMBER');names.add(key);
  const type=(attr>>>16)&0xf000;need(type===0||type===0x8000||type===0x4000,'ARCHIVE_MEMBER_REFUSED');
  need(expanded<=cap.memberBytes&&expanded<=Math.max(1,compressed)*cap.ratio,'ARCHIVE_LIMIT');total+=expanded;need(total<=cap.expandedBytes,'ARCHIVE_LIMIT');
  need(local+30<=offset&&bytes.readUInt32LE(local)===0x04034b50,'ARCHIVE_FORMAT');
  const localName=bytes.readUInt16LE(local+26),localExtra=bytes.readUInt16LE(local+28),data=local+30+localName+localExtra;
  need(bytes.readUInt16LE(local+6)===flags&&bytes.readUInt16LE(local+8)===method&&data+compressed<=offset,'ARCHIVE_FORMAT');
  need(bytes.subarray(local+30,local+30+localName).equals(nameBytes),'ARCHIVE_FORMAT');
  if(!(flags&8))need(bytes.readUInt32LE(local+14)===crc&&bytes.readUInt32LE(local+18)===compressed&&bytes.readUInt32LE(local+22)===expanded,'ARCHIVE_FORMAT');
  let regionEnd=data+compressed;
  if(flags&8){let descriptor=regionEnd;need(descriptor+12<=offset,'ARCHIVE_FORMAT');if(bytes.readUInt32LE(descriptor)===0x08074b50)descriptor+=4;need(descriptor+12<=offset&&bytes.readUInt32LE(descriptor)===crc&&bytes.readUInt32LE(descriptor+4)===compressed&&bytes.readUInt32LE(descriptor+8)===expanded,'ARCHIVE_INTEGRITY');regionEnd=descriptor+12;}
  need(!regions.some(([a,b])=>local<b&&regionEnd>a),'ARCHIVE_OVERLAP');regions.push([local,regionEnd]);
  if(name.endsWith('/')){need(expanded===0,'ARCHIVE_MEMBER_REFUSED');}
  else{need(type!==0x4000&&/\.(?:txt|md|json)$/i.test(name),'ARCHIVE_MEMBER_REFUSED');entries.push({index,name,method,crc,expanded,start:data,end:data+compressed});}
  cursor+=46+nameLength+extra+comment;
 }
 need(cursor===offset+size&&entries.length>0,'ARCHIVE_FORMAT');
 regions.sort((a,b)=>a[0]-b[0]);need(regions[0][0]===0&&regions.at(-1)[1]===offset&&regions.every((region,i)=>i===0||region[0]===regions[i-1][1]),'ARCHIVE_UNREFERENCED_DATA');
 return entries.map(e=>{
  let content;try{content=e.method===0?Buffer.from(bytes.subarray(e.start,e.end)):inflateRawSync(bytes.subarray(e.start,e.end),{maxOutputLength:Math.min(cap.memberBytes,e.expanded+1)});}catch{refuse('ARCHIVE_DECOMPRESSION');}
  need(content.length===e.expanded&&crc32(content)===e.crc,'ARCHIVE_INTEGRITY');
  return {original_index:e.index,name:e.name,bytes:content,text:decodeUtf8(content)};
 });
}
