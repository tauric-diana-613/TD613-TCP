/** Genuine served-byte fixture replay. No external-origin or human witness credit. */
import {readFile} from 'node:fs/promises';
import {webcrypto} from 'node:crypto';
import {createVixenReferenceMembrane} from '../../../app/encyclopedia/reference/vixen-read-gateway.mjs';
const root=new URL('../../../app/encyclopedia/',import.meta.url);
export async function sourceWitness(id='G-101'){
 const reader=createVixenReferenceMembrane({baseURL:'https://fixture.example/encyclopedia/reference/',cryptoProvider:webcrypto,
  fetcher:async url=>{
   const u=new URL(url),path=u.pathname.replace(/^\/encyclopedia\//,'');
   if(u.origin!=='https://fixture.example'||!path.startsWith('reference/')||path.includes('..'))throw Error('FIXTURE_PATH');
   const bytes=await readFile(new URL(path,root));
   return {ok:true,status:200,url:u.href,headers:{get:k=>k==='content-length'?String(bytes.length):null},arrayBuffer:async()=>bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.length)};
  }});
 await reader.open();return reader.getRecord(id);
}
