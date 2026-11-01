import test from 'node:test';
import assert from 'node:assert/strict';
import {clientHelloServerName} from './tls-client-hello.mjs';
const u16=n=>{const b=Buffer.alloc(2);b.writeUInt16BE(n);return b;};
function hello(name,duplicate=false){
 const host=Buffer.from(name);const entry=Buffer.concat([Buffer.from([0]),u16(host.length),host]);
 const sni=Buffer.concat([u16(0),u16(entry.length+2),u16(entry.length),entry]);
 const extensions=duplicate?Buffer.concat([sni,sni]):sni;
 const body=Buffer.concat([Buffer.from([3,3]),Buffer.alloc(32),Buffer.from([0]),u16(2),Buffer.from([0x13,1]),Buffer.from([1,0]),u16(extensions.length),extensions]);
 const handshake=Buffer.alloc(4);handshake[0]=1;handshake.writeUIntBE(body.length,1,3);
 const record=Buffer.concat([handshake,body]);return Buffer.concat([Buffer.from([22,3,1]),u16(record.length),record]);
}
test('invented ClientHello binds the visible exact server name',()=>assert.equal(clientHelloServerName(hello('auth.openai.com')),'auth.openai.com'));
test('incomplete record waits instead of accepting a prefix',()=>assert.equal(clientHelloServerName(hello('auth.openai.com').subarray(0,20)),null));
test('duplicate server-name extensions and non-TLS traffic are refused',()=>{
 assert.throws(()=>clientHelloServerName(hello('auth.openai.com',true)),/AMBIGUOUS/);
 assert.throws(()=>clientHelloServerName(Buffer.from('GET / HTTP/1.1\r\n')),/HELLO_REQUIRED/);
});
test('oversized ClientHello is refused',()=>assert.throws(()=>clientHelloServerName(Buffer.alloc(65537)),/BOUND/));
