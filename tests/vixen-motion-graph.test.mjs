import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {MOTION_OWNERS,MOTION_CONTRACT,globalMotionHeld,motionGraphStatus}
 from '../app/encyclopedia/vixen-estate/vixen-motion-governor.mjs';
const path=p=>readFileSync(new URL('../app/encyclopedia/'+p,import.meta.url),'utf8');
function mock({still=false,hidden=false,reduced=false,view='observatory'}={}){
 return {hidden,body:{dataset:{view,vixenMotion:still?'still':'live'}},
  getElementById:()=>({getAttribute:()=>still?'true':'false'}),
  defaultView:{matchMedia:()=>({matches:reduced})}};
}
test('one global Still authority across rooms',()=>{
 assert.equal(globalMotionHeld(mock()),false);
 for(const c of [{still:true},{hidden:true},{reduced:true}])assert(globalMotionHeld(mock(c)));
 assert.equal(motionGraphStatus(mock()).owner,'ELECTRIC_FOUNDRY');
 assert.equal(MOTION_OWNERS.collection,'FOLDED_CUIRASS_WITH_SAME_FRAME_LATTICE');
 assert.equal(MOTION_CONTRACT.active_primary_clock_count_per_view,1);
});
test('global Still reaches Foundry and pointer field, and halts CSS animation',()=>{
 const html=path('vix-cyb.html'),foundry=path('vixen-estate/observatory-electric-foundry.mjs');
 const foyer=path('vixen-estate/vixen-foyer.mjs');
 assert(html.includes("document.body.dataset.vixenMotion=state.motionPaused"));
 assert(html.includes("broadcastVixenMotion();"));
 assert(foundry.includes('return !globalMotionHeld(document)&&'));
 assert(foundry.includes("window.addEventListener('vixen:motionchange',syncGlobalMotion)"));
 assert(foyer.includes("if(frame||globalMotionHeld(document))return"));
 assert(path('vixen-estate/vixen-motion.css').includes('animation-play-state: paused !important;'));
});
