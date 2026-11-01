import fs from 'node:fs';
import path from 'node:path';
const root='work/provider-egress/build';fs.mkdirSync(root,{recursive:true});
fs.copyFileSync('work/operational/build/codex',root+'/codex');
for(const name of ['egress-gateway.mjs','loopback-bridge.mjs','egress-probe.mjs','tls-client-hello.mjs']){fs.mkdirSync(root+'/egress',{recursive:true});fs.copyFileSync('work/provider-egress/'+name,root+'/egress/'+name);}
for(const name of ['scripts/experiment-b-operational/private-account-receipt.mjs','tests/experiment-b-private-account-receipt.test.mjs']){const dest=path.join(root,'fixture',name);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.copyFileSync(path.join('work/tcp-operational-1623',name),dest);}
fs.writeFileSync(root+'/Dockerfile','FROM node@sha256:3ab1d8a775153425c45ac8c6434c8717fae5866d9dc3e494dc7eb8550d71c75f\nCOPY --chmod=0555 codex /usr/local/bin/codex\nCOPY egress/ /tcp-repository/egress/\nCOPY fixture/ /tcp-repository/\nUSER 65534:65534\nENV HOME=/scratch\nWORKDIR /scratch\nENTRYPOINT ["node"]\n');
fs.writeFileSync(root+'/.dockerignore','*\n!Dockerfile\n!codex\n!egress/\n!egress/**\n!fixture/\n!fixture/**\n');
console.log('PUBLIC_BUILD_CONTEXT_PREPARED');
