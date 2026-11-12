/**
 * 𝌋 Vixen brand split: separate approved art slots + SVG eye integrity.
 * Tests both the current historical-fallback state and an isolated complete
 * three-file operator handoff (never commits generated fixture artwork).
 */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,mkdir,mkdtemp,writeFile,cp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {deflateSync} from 'node:zlib';
import {fileURLToPath} from 'node:url';
const root=resolve(fileURLToPath(new URL('../',import.meta.url)));
const paths={
 page:join(root,'app/encyclopedia/vix-cyb.html'),
 svg:join(root,'app/encyclopedia/assets/vixen/fox-arcflash.svg'),
 css:join(root,'app/encyclopedia/assets/vixen/brand-assets.css'),
 manifest:join(root,'app/encyclopedia/assets/vixen/asset-contract.json'),
 installer:join(root,'scripts/install-vixen-brand-assets.py'),
};
const sha=data=>createHash('sha256').update(data).digest('hex');
const slot=(html,role)=>[...html.matchAll(
 new RegExp(role==='mobile'
 ?'(<source\\b(?=[^>]*data-vixen-asset-role="mobile")[^>]*?\\bsrcset=")([^"]*)(")'
 :'(<img\\b(?=[^>]*data-vixen-asset-role="desktop")[^>]*?\\bsrc=")([^"]*)(")','g')
)].map(m=>m[2]);
const python=(args,cwd=root)=>spawnSync(process.env.VIXEN_PYTHON||'python3',[paths.installer,...args],{
 cwd,encoding:'utf8',timeout:25000
});

test('Standalone fox is the only masthead asset, with vivid SVG-native yellow cores',async()=>{
 const html=await readFile(paths.page,'utf8');
 const svg=await readFile(paths.svg);
 const contract=JSON.parse(await readFile(paths.manifest,'utf8'));
 const css=await readFile(paths.css,'utf8');
 assert.equal((html.match(/class="vixen-fox-emblem" data-vixen-asset-role="fox"/g)||[]).length,2);
 assert.equal((html.match(/src="\.\/assets\/vixen\/fox-arcflash\.svg"/g)||[]).length,2);
 assert(!html.includes('<svg class="vixen-fox-emblem"'));
 assert(!html.includes('fill="#dfbfee"'));
 assert.equal(contract.fox.sha256,sha(svg));
 assert(svg.toString('utf8').includes('data-arcflash-yellow="#F9F36D"'));
 assert(svg.toString('utf8').includes('vf-arcflash-bloom'));
 assert(!svg.toString('utf8').includes('<image'));
 assert.match(css,/filter:drop-shadow\(0 0 2px rgba\(249,243,109,.30\)\)!important/);
 assert.match(html,/href="\.\/assets\/vixen\/brand-assets\.css"/);
});

test('Desktop/mobile source identities remain independently replaceable and source-faithful',async()=>{
 const html=await readFile(paths.page,'utf8');
 const contract=JSON.parse(await readFile(paths.manifest,'utf8'));
 assert.equal(contract.schema,'td613.vixen.brand-assets/v1');
 assert(html.includes('data-vixen-brand-asset-contract="./assets/vixen/asset-contract.json"'));
 assert.equal(slot(html,'desktop').length,1);
 assert.equal(slot(html,'mobile').length,1);
 const state=contract.frontispiece.stage;
 assert(['EMBEDDED_HISTORICAL_FALLBACK','EXTERNAL_PNG_INSTALLED_REVIEW_PENDING'].includes(state));
 for(const role of ['desktop','mobile']){
   const [src]=slot(html,role);
   const filename='frontispiece-'+role+'.png';
   if(state==='EMBEDDED_HISTORICAL_FALLBACK'){
     assert(src.startsWith('data:image/webp;base64,'),'Historical art remains until selected files arrive');
     assert.equal(sha(Buffer.from(src.split(',')[1],'base64')),
      contract.frontispiece[role].legacy_webp_sha256);
     assert.equal(contract.frontispiece[role].status,'PENDING_OPERATOR_SELECTED_ART');
   }else{
     assert.equal(src,'./assets/vixen/'+filename);
     assert.equal(sha(await readFile(join(root,'app/encyclopedia/assets/vixen',filename))),
      contract.frontispiece[role].sha256);
     assert.equal(contract.frontispiece[role].status,'OPERATOR_SELECTED_PENDING_VISUAL_ADJUDICATION');
   }
 }
 assert(html.includes('data-vixen-frontispiece-source="'+
  (state==='EMBEDDED_HISTORICAL_FALLBACK'?'embedded-historical':'external-selected')+'"'));
 const css=await readFile(paths.css,'utf8');
 assert(css.includes('data-vixen-frontispiece-source="external-selected"'));
 assert(css.includes('filter:none!important'));
 assert(css.includes('mix-blend-mode:normal!important'));
 const checked=python(['--check']);
 assert.equal(checked.status,0,checked.stderr);
 assert.equal(JSON.parse(checked.stdout).stage,state);
});

// Tiny, fully valid compressed true-color PNG fixture, standard-library only.
function crc32(buf){
 let c=0xffffffff;
 for(const b of buf){c^=b;for(let i=0;i<8;i++)c=(c>>>1)^((c&1)?0xedb88320:0)}
 return (c^0xffffffff)>>>0;
}
function chunk(type,data){
 const t=Buffer.from(type,'ascii'),length=Buffer.alloc(4),crc=Buffer.alloc(4);
 length.writeUInt32BE(data.length);crc.writeUInt32BE(crc32(Buffer.concat([t,data])));
 return Buffer.concat([length,t,data,crc]);
}
function samplePng(width,height){
 const ihdr=Buffer.alloc(13);ihdr.writeUInt32BE(width,0);ihdr.writeUInt32BE(height,4);
 ihdr[8]=8;ihdr[9]=2; // 8-bit truecolor
 const row=Buffer.alloc(1+width*3,0);
 const scanlines=Buffer.concat(Array.from({length:height},()=>row));
 return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),
  chunk('IHDR',ihdr),chunk('IDAT',deflateSync(scanlines,{level:6})),chunk('IEND',Buffer.alloc(0))]);
}

test('Operator trio is preflighted in dry-run and installed transactionally into isolated checkout',async()=>{
 const temp=await mkdtemp(join(tmpdir(),'vixen-intake-test-'));
 try{
  const dest=join(temp,'app/encyclopedia/assets/vixen');
  await mkdir(dest,{recursive:true});
  await cp(paths.svg,join(dest,'fox-arcflash.svg'));
  await cp(paths.manifest,join(dest,'asset-contract.json'));
  const current=JSON.parse(await readFile(paths.manifest,'utf8'));
  if(current.frontispiece.stage==='EXTERNAL_PNG_INSTALLED_REVIEW_PENDING'){
    for(const role of ['desktop','mobile']){
      const name='frontispiece-'+role+'.png';
      await cp(join(root,'app/encyclopedia/assets/vixen',name),join(dest,name));
    }
  }
  await mkdir(join(temp,'app/encyclopedia'),{recursive:true});
  await cp(paths.page,join(temp,'app/encyclopedia/vix-cyb.html'));
  const desktop=join(temp,'operator-desktop.png'),mobile=join(temp,'operator-mobile.png');
  await writeFile(desktop,samplePng(1600,900));
  await writeFile(mobile,samplePng(900,1600));
  const args=['--root',temp,'--desktop',desktop,'--mobile',mobile,'--fox',paths.svg];
  const dry=python([...args,'--dry-run']);
  assert.equal(dry.status,0,dry.stderr);
  assert.equal(JSON.parse(dry.stdout).mode,'DRY_RUN');
  const historic=await readFile(join(temp,'app/encyclopedia/vix-cyb.html'),'utf8');
  assert.equal(slot(historic,'desktop')[0].startsWith('data:image/webp;base64,'),
    current.frontispiece.stage==='EMBEDDED_HISTORICAL_FALLBACK');
  const run=python(args);
  assert.equal(run.status,0,run.stderr);
  const checked=python(['--root',temp,'--check']);
  assert.equal(checked.status,0,checked.stderr);
  assert.equal(JSON.parse(checked.stdout).stage,'EXTERNAL_PNG_INSTALLED_REVIEW_PENDING');
  const updated=await readFile(join(temp,'app/encyclopedia/vix-cyb.html'),'utf8');
  assert.deepEqual(slot(updated,'desktop'),['./assets/vixen/frontispiece-desktop.png']);
  assert.deepEqual(slot(updated,'mobile'),['./assets/vixen/frontispiece-mobile.png']);
  assert(!updated.includes('data:image/webp;base64'));
  assert(updated.includes('data-vixen-frontispiece-source="external-selected"'));
  const m=JSON.parse(await readFile(join(dest,'asset-contract.json'),'utf8'));
  assert.equal(m.frontispiece.desktop.sha256,sha(await readFile(desktop)));
  assert.equal(m.frontispiece.mobile.sha256,sha(await readFile(mobile)));
  assert.equal(m.frontispiece.desktop.width,1600);
  assert.equal(m.frontispiece.mobile.height,1600);
  assert.equal(m.frontispiece.stage,'EXTERNAL_PNG_INSTALLED_REVIEW_PENDING');
  assert.equal(m.fox.sha256,sha(await readFile(paths.svg)));
 }finally{await rm(temp,{recursive:true,force:true})}
});

test('Wrong orientation and malformed fox are refused without modifying a checkout',async()=>{
 const tmp=await mkdtemp(join(tmpdir(),'vixen-refusal-test-'));
 try{
  const desktop=join(tmp,'desktop.png'),mobile=join(tmp,'mobile.png'),fake=join(tmp,'bad.svg');
  await writeFile(desktop,samplePng(900,1600));
  await writeFile(mobile,samplePng(1600,900));
  await writeFile(fake,'<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>');
  const args=['--desktop',desktop,'--mobile',mobile,'--fox',fake,'--dry-run'];
  const bad=python(args);
  assert.equal(bad.status,2);
  assert.match(bad.stderr,/DESKTOP_16_9_GEOMETRY_MISMATCH/);
  const before=await readFile(paths.page);
  assert.equal(sha(before),sha(await readFile(paths.page)),'Actual repo source cannot be mutated by invalid inputs');
 }finally{await rm(tmp,{recursive:true,force:true})}
});
