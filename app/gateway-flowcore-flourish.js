import { FLOWCORE_GLYPH_REGISTRY } from './dome-world/data/flowcore-glyph-semantics-v01.js';
import { AnimationCoordinator } from './dome-world/holonomy-loom/animation-coordinator.js';

/**
 * Bounded landing-page Flow-Core grammar study.
 *
 * This is a local visual vignette, not a Loom request observation and not a
 * claim about provider/external state. Randomness chooses among canonical
 * semantic relations and compatible choreographic temperaments; it never
 * chooses a glyph independently of its relation.
 */
export const FLOWCORE_FLOURISH_VIGNETTES = Object.freeze({
  recurrence: Object.freeze({
    temperaments: Object.freeze(['kinetic','threnodic']),
    message: 'What repeats can return altered; recurrence keeps the divergence visible.'
  }),
  gathering: Object.freeze({
    temperaments: Object.freeze(['gossamer','kinetic']),
    message: 'Many strands may gather while the boundary and accumulated obligation remain visible.'
  }),
  release: Object.freeze({
    temperaments: Object.freeze(['fracture','kinetic']),
    message: 'A release keeps origin, destination, and residue legible instead of pretending the crossing erased them.'
  }),
  created_potential: Object.freeze({
    temperaments: Object.freeze(['ascendant','gossamer']),
    message: 'Readiness has a cost: visible input creates the rise; there is no free lift.'
  }),
  released_tendency: Object.freeze({
    temperaments: Object.freeze(['threnodic','falling']),
    message: 'Delivery has direction, resistance, and delay; return is not the same thing as admission.'
  }),
  protected_continuity: Object.freeze({
    temperaments: Object.freeze(['threnodic','gossamer']),
    message: 'Demand can fall while protected continuity stays inspectable and able to return.'
  }),
  bounded_emergence: Object.freeze({
    temperaments: Object.freeze(['chaotic','kinetic']),
    message: 'Emergence may widen and fly, but its source and capacity ceiling remain visible.'
  }),
  structural_rest: Object.freeze({
    temperaments: Object.freeze(['threnodic']),
    message: 'Rest stops new demand without erasing the field, its history, or the possibility of return.'
  })
});

function randomUint32(environment=globalThis){
  const out=new Uint32Array(1);
  if(environment.crypto?.getRandomValues){environment.crypto.getRandomValues(out);return out[0]>>>0;}
  return Math.floor(Math.random()*0x100000000)>>>0;
}
function choose(array,seed){return array[seed%array.length];}
function mulberry32(seed){
  let a=seed>>>0;
  return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};
}
function clamp(value,min,max){return Math.max(min,Math.min(max,value));}

export function chooseFlowcoreFlourish(environment=globalThis, previousKey=null){
  const entries=Object.keys(FLOWCORE_FLOURISH_VIGNETTES);
  let seed=randomUint32(environment);
  let key=choose(entries,seed);
  if(entries.length>1&&key===previousKey)key=entries[(entries.indexOf(key)+1+(seed%(entries.length-1)))%entries.length];
  const spec=FLOWCORE_FLOURISH_VIGNETTES[key];
  const temperament=choose(spec.temperaments,seed>>>8);
  const semantic=FLOWCORE_GLYPH_REGISTRY.entries[key];
  if(!semantic)throw new Error(`Unknown Flow-Core relation: ${key}`);
  return Object.freeze({key,seed,temperament,glyph:semantic.glyph,semantic_relation:semantic.semantic_relation,message:spec.message});
}

function drawVignette(ctx,width,height,study,snapshot){
  const dpr=snapshot.viewport.dpr||1;
  ctx.setTransform(dpr,0,0,dpr,0,0);
  ctx.clearRect(0,0,width,height);
  const p=clamp(snapshot.progress,0,1);
  const time=snapshot.motionTimeMs/1000;
  const rng=mulberry32(study.seed);
  const cx=width*.5,cy=height*.5;
  const short=Math.min(width,height);
  const palette=['rgba(150,238,235,.72)','rgba(205,188,236,.56)','rgba(239,189,131,.48)','rgba(151,168,231,.46)'];
  const count=study.temperament==='chaotic'?76:study.temperament==='kinetic'?54:38;

  ctx.save();
  ctx.globalCompositeOperation='lighter';
  ctx.lineCap='round';

  // A visible boundary is retained for every relation; choreography changes,
  // not the existence of the declared limit.
  ctx.strokeStyle='rgba(142,232,230,.12)';
  ctx.lineWidth=1;
  ctx.beginPath();ctx.ellipse(cx,cy,short*.34,short*.17,0,0,Math.PI*2);ctx.stroke();

  for(let i=0;i<count;i++){
    const r=rng();
    const angle=rng()*Math.PI*2+i*.17;
    const phase=(p+i/count)%1;
    let x=cx,y=cy,alpha=.12+.42*r,size=.7+2.2*r;
    const spread=short*(.20+.34*r);

    if(study.key==='gathering'){
      const radius=(1-phase)*spread+8;
      x=cx+Math.cos(angle+time*.12)*radius*1.7;
      y=cy+Math.sin(angle+time*.1)*radius*.7;
      alpha*=.45+.55*phase;
    }else if(study.key==='recurrence'){
      const orbit=short*(.12+.24*r);
      const a=angle+time*(study.temperament==='kinetic'?1.3:.42)+(i%2?phase:-phase)*Math.PI*2;
      x=cx+Math.cos(a)*orbit*1.7;
      y=cy+Math.sin(a)*orbit*.65;
      if(i%7===0){x+=short*.07;y-=short*.04;}
    }else if(study.key==='release'){
      const dir=i%2?1:-1;
      x=cx+dir*(phase*width*.58);
      y=cy+(r-.5)*short*.32+Math.sin(angle+time)*12;
      alpha*=.55+.45*phase;
    }else if(study.key==='created_potential'){
      x=cx+(r-.5)*short*.45+Math.sin(angle)*8;
      y=height*.88-phase*height*.78;
      alpha*=.4+.6*phase;
    }else if(study.key==='released_tendency'){
      x=cx+(r-.5)*short*.5;
      const friction=.55+.45*r;
      y=height*.1+phase*height*.78*friction;
      alpha*=.95-friction*.2;
    }else if(study.key==='protected_continuity'){
      const a=angle+time*(study.temperament==='gossamer'?.18:.08);
      const radius=short*(.13+.13*r);
      x=cx+Math.cos(a)*radius*1.5;
      y=cy+Math.sin(a)*radius*.58;
      alpha*=.58;
    }else if(study.key==='bounded_emergence'){
      const a=angle+time*.22;
      const max=short*(.12+.34*r);
      const radius=Math.min(max,8+phase*max);
      x=cx+Math.cos(a)*radius*1.65;
      y=cy+Math.sin(a)*radius*.7;
      alpha*=.45+.55*(1-phase*.35);
      size*=1+phase*.8;
    }else{
      const settle=1-Math.min(1,p*1.45);
      const radius=short*(.10+.22*r);
      x=cx+Math.cos(angle+time*.08*settle)*radius*1.5;
      y=cy+Math.sin(angle+time*.06*settle)*radius*.58;
      alpha*=.28+.42*settle;
    }

    if(study.temperament==='chaotic'){
      x+=Math.sin(time*4.2+i*1.7)*22*(1-p*.28);
      y+=Math.cos(time*3.8+i*.9)*17*(1-p*.22);
      size*=1.35;
    }else if(study.temperament==='threnodic'){
      y+=Math.sin(time*.5+i*.33)*9;
      alpha*=.72;
    }

    ctx.fillStyle=palette[i%palette.length].replace(/\.[0-9]+\)$/, `${clamp(alpha,0.04,.82).toFixed(2)})`);
    ctx.beginPath();ctx.arc(x,y,size,0,Math.PI*2);ctx.fill();

    if(i%3===0){
      ctx.strokeStyle=palette[(i+1)%palette.length].replace(/\.[0-9]+\)$/, `${clamp(alpha*.38,.03,.3).toFixed(2)})`);
      ctx.lineWidth=.55;
      ctx.beginPath();ctx.moveTo(cx,cy);ctx.quadraticCurveTo((cx+x)*.5+(i%2?18:-18),(cy+y)*.5,x,y);ctx.stroke();
    }
  }

  // Relation glyph is the label for the already-selected local grammar study,
  // never a claim about Gateway, Loom, or an external system.
  ctx.globalAlpha=.16+.18*Math.sin(Math.PI*p);
  ctx.fillStyle='rgba(235,244,239,.9)';
  ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.font=`${Math.max(42,short*.18)}px ui-sans-serif,system-ui,sans-serif`;
  ctx.fillText(study.glyph,cx,cy);
  ctx.restore();
}

export function mountGatewayFlowcoreFlourish(root=document, environment=window){
  const button=root.getElementById('ingressFlowcoreFlourish');
  const studyHost=root.getElementById('ingressFlowcoreStudy');
  const canvas=root.getElementById('ingressFlowcoreCanvas');
  const label=root.getElementById('ingressFlowcoreLabel');
  const copy=root.getElementById('ingressFlowcoreCopy');
  const scope=root.getElementById('ingressFlowcoreScope');
  if(!button||!studyHost||!canvas||!label||!copy||!scope)return null;
  const ctx=canvas.getContext('2d');
  if(!ctx)return null;
  const coordinator=new AnimationCoordinator({durationMs:6200,maxFps:45});
  let current=null,disposed=false;
  const resize=()=>{
    if(disposed)return;
    const rect=studyHost.getBoundingClientRect();
    const width=Math.max(1,rect.width||environment.innerWidth||1);
    const height=Math.max(1,rect.height||environment.innerHeight||1);
    const dpr=Math.max(.1,Math.min(3,environment.devicePixelRatio||1));
    canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
    canvas.style.width=`${width}px`;canvas.style.height=`${height}px`;
    coordinator.setViewport({width,height,dpr});
  };
  coordinator.registerPass('gateway-flowcore-grammar-study',snapshot=>{
    if(!current)return;
    const rect=studyHost.getBoundingClientRect();
    drawVignette(ctx,Math.max(1,rect.width||environment.innerWidth||1),Math.max(1,rect.height||environment.innerHeight||1),current,snapshot);
  });
  const reduced=environment.matchMedia?.('(prefers-reduced-motion: reduce)');
  coordinator.setReducedMotion(Boolean(reduced?.matches));
  const onReduced=event=>coordinator.setReducedMotion(Boolean(event.matches));
  reduced?.addEventListener?.('change',onReduced);
  const onResize=()=>resize();
  environment.addEventListener('resize',onResize);
  resize();

  const run=()=>{
    current=chooseFlowcoreFlourish(environment,current?.key??null);
    studyHost.hidden=false;
    button.setAttribute('aria-expanded','true');
    button.setAttribute('aria-label',`Run another Flow-Core grammar study. Current relation: ${current.semantic_relation}`);
    label.textContent=`${current.glyph} · ${current.semantic_relation.replaceAll('-',' ')} · ${current.temperament}`;
    copy.textContent=current.message;
    scope.textContent='Local Flow-Core grammar study · randomized choreography · no route state, provider activity, or custody claim.';
    coordinator.setPacket({scene:{id:`gateway-flowcore-${current.key}-${current.seed}`},geometry:{rest:false},replay:{seed:current.seed}});
  };
  button.addEventListener('click',run);
  const dispose=()=>{
    if(disposed)return;disposed=true;
    coordinator.destroy();
    environment.removeEventListener('resize',onResize);
    reduced?.removeEventListener?.('change',onReduced);
  };
  environment.addEventListener('pagehide',dispose,{once:true});
  return Object.freeze({run,dispose,inspect:()=>({current,clock:coordinator.inspect()})});
}

if(typeof document!=='undefined'&&typeof window!=='undefined'){
  const start=()=>mountGatewayFlowcoreFlourish(document,window);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
}
