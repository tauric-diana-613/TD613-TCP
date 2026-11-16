/**
 * RGI22: synthetic browser witness of genuine renderer replacement + revert.
 * TEST-ONLY host grants mock approval to an isolated re-mounted Foundry.
 * It is NOT an enrolled human, not a release receipt or an experiment.
 * The normal page still mounts fail-closed without composerHost.
 */
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {mkdir} from 'node:fs/promises';
const out='artifacts/vixen-browser-witness';
await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true});
try{
 for(const viewport of [{width:1440,height:900,reducedMotion:'no-preference'},
                        {width:390,height:844,reducedMotion:'reduce'}]){
  const context=await browser.newContext({
   viewport:{width:viewport.width,height:viewport.height},
   deviceScaleFactor:1,reducedMotion:viewport.reducedMotion
  });
  const page=await context.newPage();
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const rsp=await page.goto('http://127.0.0.1:6130/encyclopedia/vix-cyb.html',
   {waitUntil:'domcontentloaded',timeout:30000});
  assert.equal(rsp.status(),200);
  await page.waitForFunction(()=>window.VIXEN_ELECTRIC_FOUNDRY?.mounted===true,
   null,{timeout:20000});
  // Actual webpage auto-mount always refuses forged unverified Compose.
  const source=await page.evaluate(()=>{
   const s=JSON.parse(document.getElementById('vixen-corpus-bundle').textContent);
   return {works:s.works.length,pending:s.batch_b_files.length};
  });
  assert.equal(source.works,32);
  assert.equal(source.pending,0);
  await page.locator('#vixenRoomRail button[data-view="observatory"]').click();
  await page.waitForFunction(()=>document.body.dataset.view==='observatory');
  const result=await page.evaluate(async()=>{
   const base=JSON.parse(document.getElementById('vixen-corpus-bundle').textContent);
   const [a,b]=base.works.slice(0,2).map(x=>x.work_id);
   window.VIXEN_ELECTRIC_FOUNDRY.dispose();
   const host=document.getElementById('vixenElectricFoundry');
   host.replaceChildren();
   const {mountVixenElectricFoundry}=await import('./vixen-estate/observatory-electric-foundry.mjs');
   let paintCalls=0;
   const reviewedRenderers=[{
    id:'SYNTHETIC_NEW_VISUAL_GRAMMAR',source_sha256:'d'.repeat(64),
    review_receipt_id:'SYNTHETIC_BROWSER_FIXTURE_NOT_REAL_REVIEW',
    async paintFrame(canvas,{time=0,sourceIds=[],host_clock_only}={}){
     if(!host_clock_only||sourceIds[0]!==a||sourceIds[1]!==b)
      throw Error('SYNTHETIC_CLOCK_OR_SOURCE_MISMATCH');
     canvas.width=440;canvas.height=280;
     const ctx=canvas.getContext('2d');
     ctx.fillStyle='#121a22';ctx.fillRect(0,0,440,280);
     const phase=Number(time)||0;
     // A distinct topology-like strand configuration, NOT a holonomy chart.
     // This shape is a synthetic witness, never an installed scientific form.
     for(let i=0;i<39;i++){
      const θ=i*Math.PI*2/39, rr=60+24*Math.sin(i*.41+phase);
      const x=220+Math.cos(θ)*rr,y=140+Math.sin(θ)*rr;
      ctx.strokeStyle=i%3?'#ffe6b0':'#ff91af';
      ctx.lineWidth=1.8;ctx.beginPath();
      ctx.moveTo(220,140);ctx.quadraticCurveTo(x,140,x,y);ctx.stroke();
      ctx.fillStyle='#fff2d8';ctx.beginPath();ctx.arc(x,y,2.6,0,Math.PI*2);ctx.fill();
     }
     paintCalls++;
     return {geometry:'SYNTHETIC_STRAND_FIELD',mapped_points:39,phase};
    }
   }];
   const stage=await mountVixenElectricFoundry({host,corpus:base,composerHost:{
    verifyHumanReceipt:async()=>true, // TEST ONLY, never production
    isScoreCurrent:async({score_digest,source_revision})=>
     score_digest==='a'.repeat(64)&&source_revision==='b'.repeat(40),
    reviewedRenderers
   }});
   if(!stage.mounted)throw Error('SYNTHETIC_FOUNDRY_MOUNT_REFUSED');
   const digest='a'.repeat(64),rev='b'.repeat(40),form='SYNTHETIC_NEW_VISUAL_GRAMMAR';
   const receipt={schema:'td613.vixen.podium.compose-gate/v1',
    status:'SUPPORTED',state:'COMPOSED_PREVIEW_ONLY',release_authority:false,
    approval:{authorization_kind:'HOST_VERIFIED_SEPARATE_HUMAN',
     score_digest:digest,source_revision:rev,independent_receipt_id:'SYNTHETIC_TEST_ONLY'},
    approved_visual_candidates:[{form_id:form,data_contract:'synthetic-test-data'}],
    composition:{score_digest:digest,source_revision:rev,
     computational_score:{
      visuals:{selected:{id:form,linked_lab_id:'LAB_TCC-01',
       previous_form_id:'CONTROL_PLANES',source_refs:[a,b]}},
      salon_optical_performance:{score_to_optics_controls:{mesh_intensity:.84,fold_gain:.32}}
     },
     changes:[{type:'VISUAL_FORM_CHANGE',source_ids:[a,b],visual:{
      form_id:form,replaces_lab_id:'LAB_TCC-01',previous_form_id:'CONTROL_PLANES'}}]}
   };
   const staged=await stage.stageComposerPreview({composeReceipt:receipt});
   const canvas=host.querySelector('#vixenComposerPreviewCanvas');
   const ctx=canvas.getContext('2d');
   const pixels=ctx.getImageData(0,0,canvas.width,canvas.height).data;
   let opaque=0;for(let i=3;i<pixels.length;i+=4)if(pixels[i]>0)opaque++;
   const changed=stage.approvedVisualField();
   return {status:staged.status,form:changed?.form_id,sourceIds:changed?.source_ids,
    sampleCount:staged.optical_assay?.four_operators?.measured_beat_geometry?.measured_samples,
    mesh:window.VixenLivingMesh?.status?.(),button:!host.querySelector('.ef-composer-restore')?.hidden,
    canvasVisible:!canvas.hidden,opaque,paintCalls,frameOwner:changed?.release_authority,
    corpusWasUnchanged:base.batch_b_files.length===0,
    afterStage:stage.composerPreviewStatus()?.status};
  });
  assert.equal(result.status,'SUPPORTED_PREVIEW_ONLY',JSON.stringify(result));
  assert.equal(result.form,'SYNTHETIC_NEW_VISUAL_GRAMMAR');
  assert.equal(result.button,true);
  assert.equal(result.canvasVisible,true);
  assert(result.opaque>25000,'Distinct renderer must paint real pixels, not merely issue a plan');
  assert(result.sampleCount>0);
  assert.equal(result.frameOwner,false);
  assert.equal(result.corpusWasUnchanged,true);
  assert.equal(result.mesh?.visual_form_id,result.form,
   'Host-frame synthesis must visibly condition page-wide optical mesh');
  await page.screenshot({path:out+'/rgi22-synthetic-novel-'+viewport.width+'.png',fullPage:false});
  await page.locator('#vixenElectricFoundry .ef-composer-restore').click();
  const restored=await page.evaluate(()=>{
   const f=window.VIXEN_ELECTRIC_FOUNDRY;
   return {active:f.composerPreviewStatus().current_form_id,
    canvasHidden:document.getElementById('vixenComposerPreviewCanvas').hidden,
    form:f.approvedVisualField(),mesh:window.VixenLivingMesh?.status?.()};
  });
  assert.equal(restored.active,null);
  assert.equal(restored.form,null);
  assert.equal(restored.canvasHidden,true);
  assert.equal(restored.mesh?.visual_form_id,null);
  assert.deepEqual(errors,[],JSON.stringify(errors));
  await context.close();
 }
}finally{await browser.close()}
console.log('Synthetic browser Compose replacement and revert passed; no human approval, release or corpus mutation.');
