// Parse only the bounded ClientHello needed to bind CONNECT to visible TLS SNI.
export function clientHelloServerName(buffer) {
  if(buffer.length>65536)throw Error('TLS_HELLO_BOUND');
  let offset=0,handshake=Buffer.alloc(0);
  while(offset+5<=buffer.length){
    if(buffer[offset]!==22||buffer[offset+1]!==3)throw Error('TLS_CLIENT_HELLO_REQUIRED');
    const length=buffer.readUInt16BE(offset+3);if(length>18432)throw Error('TLS_RECORD_BOUND');
    if(offset+5+length>buffer.length)return null;
    handshake=Buffer.concat([handshake,buffer.subarray(offset+5,offset+5+length)]);offset+=5+length;
    if(handshake.length<4)continue;
    if(handshake[0]!==1)throw Error('TLS_CLIENT_HELLO_REQUIRED');
    const needed=4+handshake.readUIntBE(1,3);if(needed>65536)throw Error('TLS_HELLO_BOUND');if(handshake.length<needed)continue;
    const b=handshake.subarray(4,needed);let p=34;
    const skip=n=>{p+=n;if(p>b.length)throw Error('TLS_HELLO_MALFORMED');};
    if(p>=b.length)throw Error('TLS_HELLO_MALFORMED');const session=b[p];skip(1+session);
    if(p+2>b.length)throw Error('TLS_HELLO_MALFORMED');const ciphers=b.readUInt16BE(p);skip(2+ciphers);
    if(p>=b.length)throw Error('TLS_HELLO_MALFORMED');const compression=b[p];skip(1+compression);
    if(p+2>b.length)throw Error('TLS_SNI_REQUIRED');const extensions=b.readUInt16BE(p);skip(2);const end=p+extensions;if(end!==b.length)throw Error('TLS_HELLO_MALFORMED');
    let name=null;
    while(p+4<=end){const type=b.readUInt16BE(p),size=b.readUInt16BE(p+2);skip(4);const next=p+size;if(next>end)throw Error('TLS_HELLO_MALFORMED');
      if(type===0){if(name!==null||size<5||b.readUInt16BE(p)!==size-2||b[p+2]!==0)throw Error('TLS_SNI_AMBIGUOUS');const n=b.readUInt16BE(p+3);if(n!==size-5||n===0||n>253)throw Error('TLS_SNI_AMBIGUOUS');const raw=b.subarray(p+5,next);if([...raw].some(c=>c>127||c<33))throw Error('TLS_SNI_INVALID');name=raw.toString('ascii').toLowerCase();}
      p=next;
    }
    if(p!==end||name===null)throw Error('TLS_SNI_REQUIRED');return name;
  }
  return null;
}
