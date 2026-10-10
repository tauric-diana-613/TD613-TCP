import fs from 'node:fs'; import crypto from 'node:crypto';
if(process.env.NODE_USE_ENV_PROXY!=='1')throw Error('Proxy required');
const release=process.env.TD613_VERIFIED_A17_RELEASE;
if(!/^[a-f0-9]{40}$/.test(release||''))throw Error('Verified release required');
const root='/workspace/scratch/26d2ceda3f9e/continuation-a17';
const token=fs.readFileSync('/workspace/scratch/9d69e9b2a01d/recovery-private/assay-relay-access.token','utf8').trim();
const expected='51efc3d87cdffc4fb2869519ff4fa12b10ce179ba79d3976f6094cf741681c39';
for(const [name,url,headers]of[
['source','https://td613.com/giving/history/release-source.json',{}],
['credential','https://td613.com/api/khonapolit?operation=loom-assay-credential',{authorization:`Bearer ${token}`,'x-td613-expected-source':release,'x-td613-expected-credential-sha256':expected}]
]){
 const started_at=new Date().toISOString(); const r=await fetch(url,{method:'GET',headers,redirect:'error',signal:AbortSignal.timeout(30000)});const b=Buffer.from(await r.arrayBuffer());
 if(b.includes(Buffer.from(token)))throw Error('Credential echo');
 fs.writeFileSync(`${root}/${name}.body.bin`,b,{flag:'wx'});
 const body=JSON.parse(b);const receipt={started_at,completed_at:new Date().toISOString(),url,http_status:r.status,response_sha256:crypto.createHash('sha256').update(b).digest('hex'),NODE_USE_ENV_PROXY:'1',provider_calls:0,ledger_operations:0};
 fs.writeFileSync(`${root}/${name}.receipt.json`,JSON.stringify(receipt,null,2)+'\n',{flag:'wx'});
 if(r.status!==200||(name==='credential'&&!(body.credential_sha256===expected&&body.expected_credential_matches===true&&body.source_commit===release)))throw Error('Read-only binding HOLD');
 console.log(JSON.stringify({name,...receipt,body}));
}

