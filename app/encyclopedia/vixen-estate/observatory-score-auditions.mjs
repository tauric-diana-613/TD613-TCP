/**
 * TD613 · Score-bound Observatory visual auditions / v1
 * Purpose: pre-authorization, executable-code-free HTML studies of EVERY
 * qualified proposed visual grammar. NOT the target renderer or a data assay.
 * Arbitrary forms can supply a declarative vector scene, with no JS/eval.
 * Unrecognized forms receive an explicitly schematic, distinctive storyboard,
 * never a false computed visualization. All HTML is offline and sandboxable.
 */
export const AUDITION_SCHEMA='td613.vixen.observatory.visual-audition/v1';
const is=o=>o!==null&&typeof o==='object'&&!Array.isArray(o);
const finite=x=>typeof x==='number'&&Number.isFinite(x);
const clamp=(x,min,max)=>Math.min(max,Math.max(min,x));
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const color=Object.freeze({rose:'#ff91af',champagne:'#fff2a9',pearl:'#f6f4f0',
 steel:'#9cabb9',cyan:'#79d8ec',ink:'#111721',none:'none'});
const paint=x=>color[x]||color.rose;
const value=(x,dim)=>Math.round(clamp(Number(x)||0,0,1)*dim*100)/100;
const str=(s,max=120)=>typeof s==='string'?s.trim().slice(0,max):'';
const hash=s=>{let h=2166136261;for(const x of String(s))h=Math.imul(h^x.charCodeAt(0),16777619)>>>0;return h>>>0};
const round=n=>Math.round(n*100)/100;
function shape(p){
 if(!is(p))return '';
 const type=str(p.kind,24);
 const stroke=paint(str(p.stroke,20)),fill=paint(str(p.fill||'none',20));
 const sw=clamp(Number(p.stroke_width)||1.7,.5,8);
 const style=' fill="'+fill+'" stroke="'+stroke+'" stroke-width="'+sw+'" stroke-linecap="round" stroke-linejoin="round"';
 if(type==='circle'&&finite(p.cx)&&finite(p.cy)&&finite(p.r))
  return '<circle cx="'+value(p.cx,640)+'" cy="'+value(p.cy,360)+'" r="'+value(p.r,360)+'"'+style+'/>';
 if(type==='ellipse'&&['cx','cy','rx','ry'].every(k=>finite(p[k])))
  return '<ellipse cx="'+value(p.cx,640)+'" cy="'+value(p.cy,360)+'" rx="'+value(p.rx,640)+'" ry="'+value(p.ry,360)+'"'+style+'/>';
 if(type==='rect'&&['x','y','w','h'].every(k=>finite(p[k])))
  return '<rect x="'+value(p.x,640)+'" y="'+value(p.y,360)+'" width="'+value(p.w,640)+'" height="'+value(p.h,360)+'" rx="5"'+style+'/>';
 if(type==='line'&&['x1','y1','x2','y2'].every(k=>finite(p[k])))
  return '<line x1="'+value(p.x1,640)+'" y1="'+value(p.y1,360)+'" x2="'+value(p.x2,640)+'" y2="'+value(p.y2,360)+'"'+style+'/>';
 if((type==='polyline'||type==='polygon')&&Array.isArray(p.points)&&p.points.length>=2&&p.points.length<=96&&
    p.points.every(q=>Array.isArray(q)&&q.length===2&&q.every(finite))){
  const points=p.points.map(q=>value(q[0],640)+','+value(q[1],360)).join(' ');
  return '<'+type+' points="'+points+'"'+style+'/>';
 }
 // SVG path is declarative geometric data only. Refuse CSS, URLs, markup,
 // event attributes, foreignObject, and javascript: in untrusted proposals.
 if(type==='path'&&typeof p.d==='string'&&p.d.length<=2500&&
   /^[MmLlHhVvCcSsQqTtAaZz0-9, .\-\+eE]+$/.test(p.d))
  return '<path d="'+esc(p.d)+'"'+style+'/>';
 if(type==='text'&&finite(p.x)&&finite(p.y)&&str(p.text,100))
  return '<text x="'+value(p.x,640)+'" y="'+value(p.y,360)+
    '" fill="'+stroke+'" font-size="'+clamp(Number(p.size)||16,8,28)+'"'+
    ' font-family="Georgia,serif">'+esc(str(p.text,100))+'</text>';
 return '';
}
function declaredScene(candidate){
 const primitives=candidate?.visual_grammar?.preview_scene?.layers;
 if(!Array.isArray(primitives)||primitives.length===0||primitives.length>128)return null;
 const pieces=primitives.map(shape);
 if(pieces.some(x=>!x))return null;
 return pieces.join('');
}
function storyboard(candidate){
 const seed=hash(candidate.id+'|'+candidate.family+'|'+
  (candidate.visual_grammar?.composition_rules||[]).join('|'));
 const words=(candidate.visual_grammar?.primitives||[]).slice(0,10).map(x=>String(x).toLowerCase());
 const tokens=words.join(' ');
 const out=[];
 const line=(x1,y1,x2,y2,c='steel',w=1.1)=>out.push('<line x1="'+round(x1)+'" y1="'+round(y1)+
  '" x2="'+round(x2)+'" y2="'+round(y2)+'" stroke="'+paint(c)+'" stroke-width="'+w+'"/>');
 // Shape-selection is an illustrative *grammar sketch*, never model data.
 // No named scientific family must match a predefined renderer class.
 if(/branch|tree|fork|ramif/i.test(tokens)){
  const branch=(x,y,angle,len,depth)=>{
   if(depth===0)return;
   const nx=x+Math.cos(angle)*len,ny=y+Math.sin(angle)*len;
   line(x,y,nx,ny,depth%2?'rose':'champagne',depth*.55);
   branch(nx,ny,angle-.47,len*.71,depth-1);
   branch(nx,ny,angle+.49,len*.70,depth-1);
  };
  branch(320,330,-Math.PI/2,97,6);
 }else if(/node|point|agent|scatter|particle|swarm|cluster/i.test(tokens)){
  const n=32+(seed%18);
  const nodes=Array.from({length:n},(_,i)=>{
   const t=i*2.39996+(seed%23)*.13;
   const r=20+3.3*i;
   return [320+Math.cos(t)*r,180+Math.sin(t)*r*.65];
  });
  nodes.forEach(([x,y],i)=>{
   if(i>0&&i%3===0)line(x,y,...nodes[(i*7+3)%n],'steel',.7);
   out.push('<circle cx="'+round(x)+'" cy="'+round(y)+
    '" r="'+(2+(i%5))+'" fill="'+paint(i%5===0?'champagne':'rose')+'"/>');
  });
 }else if(/field|wave|interference|flux|flow|phase|ripple/i.test(tokens)){
  for(let row=0;row<17;row++){
   let d='';
   for(let i=0;i<90;i++){
    const x=30+i*6.5;
    const y=55+row*15+Math.sin(i/5+row*.35+seed*.00001)*11+
     Math.cos(i/11-row*.24)*7;
    d+=(i?' L ':'M ')+round(x)+' '+round(y);
   }
   out.push('<path d="'+d+'" fill="none" stroke="'+paint(row%3?'steel':'rose')+
    '" stroke-opacity=".76" stroke-width="1.4"/>');
  }
 }else if(/loop|orbit|ring|torus|holonom|cycle|spiral/i.test(tokens)){
  for(let i=0;i<14;i++){
   const rx=65+i*10,ry=22+i*7;
   out.push('<ellipse cx="320" cy="180" rx="'+rx+'" ry="'+ry+
    '" fill="none" stroke="'+paint(i%3?'steel':'champagne')+
    '" stroke-opacity=".8" stroke-width="1.3" transform="rotate('+round((seed%29)+i*6)+' 320 180)"/>');
  }
 }else if(/grid|cell|lattice|til|mesh|topolog|facet/i.test(tokens)){
  for(let x=0;x<11;x++)for(let y=0;y<6;y++){
   const px=60+x*50+Math.sin((x+y)*.9+seed%17)*13;
   const py=50+y*51+Math.cos((x-y)*.8)*12;
   if(x>0)line(px,py,px-50,py-9,'steel',1);
   if(y>0)line(px,py,px+8,py-51,'rose',.9);
   out.push('<circle cx="'+round(px)+'" cy="'+round(py)+'" r="2.4" fill="'+paint('champagne')+'"/>');
  }
 }else{
  // Unclassified primitive: deterministic independent path family from the
  // proposal's own coordinates and rules. Never pretend computed physics.
  for(let k=0;k<13;k++){
   let d='';
   for(let j=0;j<85;j++){
    const x=40+j*6.65,theta=(j*.08)+(k*.33);
    const y=180+(k-6)*8+Math.sin(theta*(1+seed%5)*.3)*25+
     Math.sin(theta+(seed%17)*.16)*8;
    d+=(j?' L ':'M ')+round(x)+' '+round(y);
   }
   out.push('<path d="'+d+'" fill="none" stroke="'+paint(k%3?'rose':'cyan')+
    '" stroke-opacity=".68" stroke-width="'+(1+(k%3)*.55)+'"/>');
  }
 }
 return out.join('');
}
function renderStudy(candidate,position){
 const grammar=candidate.visual_grammar||{};
 const exact=declaredScene(candidate);
 const mode=exact?'DECLARED_VECTOR_SCENE_STUDY':'GENERATED_GRAMMAR_STORYBOARD';
 const title=str(candidate.title,220)||candidate.id;
 const sources=(candidate.source_refs||[]).map(x=>'<li>'+esc(x)+'</li>').join('');
 const channels=(candidate.data_mapping?.channels||[]).slice(0,24).map(x=>'<li>'+
   '<b>'+esc(str(x.observable,200))+'</b> → '+esc(str(x.visual_channel,200))+
   ' <small>('+esc(str(x.units,100))+')</small></li>').join('');
 const errors=(candidate.requirements||[]).map(x=>'<li>'+esc(x)+'</li>').join('');
 const frame=(exact||storyboard(candidate));
 return '<!doctype html><html lang="en"><head><meta charset="utf-8">'+
  '<meta name="viewport" content="width=device-width, initial-scale=1">'+
  '<meta http-equiv="Content-Security-Policy" content="default-src &#39;none&#39;; img-src data:; style-src &#39;unsafe-inline&#39;; form-action &#39;none&#39;; base-uri &#39;none&#39;">'+
  '<title>'+esc(title)+' · unratified Observatory audition</title>'+
  '<style>*{box-sizing:border-box}html{background:#090d12;color:#f6f4f0}body{margin:0;font:14px/1.55 system-ui,-apple-system,sans-serif}'+
  'main{max-width:820px;margin:auto;padding:18px}h1{font:400 clamp(22px,5vw,36px)/1.05 Georgia,serif;letter-spacing:-.025em}'+
  'h2{font:400 20px Georgia,serif}p,li{color:#d9dce3}small,.eyebrow{color:#fff2a9}'+
  'svg{display:block;width:100%;background:#101821;border:1px solid #34404c;border-radius:12px;aspect-ratio:16/9}'+
  'ul{padding-left:22px}section{border-top:1px solid #3b414a;margin-top:18px;padding-top:12px}.eyebrow{letter-spacing:.1em;font-size:10px;text-transform:uppercase}'+
  'b{color:#f6f4f0}</style></head><body><main>'+
  '<p class="eyebrow">OBSERVATORY AUDITION '+position+' · '+esc(mode)+' · NOT A COMPUTED EMPIRICAL RESULT</p>'+
  '<h1>'+esc(title)+'</h1><p>'+esc(str(grammar.description,800))+'</p>'+
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360" role="img" aria-label="'+esc(title)+' · unratified geometry study">'+
  '<rect width="640" height="360" fill="#101821"/>'+frame+'</svg>'+
  '<p><small>Illustrative candidate only · fitness '+esc(candidate.fitness)+
  ' · '+esc(candidate.status)+' · no installation, data admission, or source promotion.</small></p>'+
  '<section><h2>Data meaning and units</h2><ul>'+channels+'</ul></section>'+
  '<section><h2>Sources proposed for this form</h2><ul>'+sources+'</ul></section>'+
  '<section><h2>Displacement and reversibility</h2><p>Target lab: <b>'+
   esc(candidate.linked_lab_id)+'</b> · predecessor form: <b>'+
   esc(candidate.previous_form_id)+'</b></p><p>Actual renderer: <b>'+
   esc(candidate.renderer_installed?'Installed':'Not installed')+
   '</b>. A reviewed implementation and a human Score-specific Compose decision are required before any substitution.</p>'+
  (errors?'<ul>'+errors+'</ul>':'')+
  '</section><section><small>VIXEN · Khona‌lit-po · HUMAN CLOSURE RESERVED · ⟐</small></section>'+
  '</main></body></html>';
}
export function buildVisualScoreAuditions(plan){
 if(!is(plan)||!Array.isArray(plan.proposed)||plan.proposed.length>24)
  throw new TypeError('HELD_AUDITION_PROPOSAL_BOUNDS');
 const ready=plan.proposed.filter(x=>x.status==='CANDIDATE_READY_FOR_REVIEW');
 const held=plan.proposed.filter(x=>x.status!=='CANDIDATE_READY_FOR_REVIEW')
  .map(x=>({id:x.id,status:x.status,requirements:x.requirements}));
 const candidates=ready.map((x,i)=>({
  id:x.id,rank:i+1,fitness:x.fitness,status:x.status,
  preview_type:declaredScene(x)?'DECLARED_VECTOR_SCENE_STUDY':'GENERATED_GRAMMAR_STORYBOARD',
  actual_renderer_installed:false,
  source_refs:x.source_refs,
  target_lab_id:x.linked_lab_id,previous_form_id:x.previous_form_id,
  standalone_html:renderStudy(x,i+1)
 }));
 return {
  schema:AUDITION_SCHEMA,stage:'PRE_COMPOSE_EVALUATION_ONLY',
  candidates,held,
  eligible_count:candidates.length,held_count:held.length,
  visual_fitness_is_heuristic_not_empirical:true,
  preview_is_simulation_not_verified_renderer:true,
  gallery_html:buildVisualAuditionGallery(candidates,held),
  canonical_writes:0,deployments:0,release_authority:false
 };
}
export function buildVisualAuditionGallery(candidates=[],held=[]){
 if(!Array.isArray(candidates)||candidates.length>24)throw new TypeError('HELD_AUDITION_COUNT');
 const embeds=candidates.map(c=>
  '<article><header><span>'+esc(c.rank)+' / '+esc(candidates.length)+'</span><h2>'+
  esc(c.id)+'</h2><p>Heuristic fit '+esc(c.fitness)+' · '+esc(c.preview_type)+'</p></header>'+
  '<iframe loading="lazy" sandbox="" title="'+esc(c.id)+' visual audition" srcdoc="'+
  esc(c.standalone_html)+'"></iframe></article>').join('');
 const rejects=held.map(x=>'<li><b>'+esc(x.id)+'</b> — '+esc(x.status)+
  ': '+esc((x.requirements||[]).join('; '))+'</li>').join('');
 return '<!doctype html><html lang="en"><head><meta charset="utf-8">'+
  '<meta name="viewport" content="width=device-width,initial-scale=1">'+
  '<meta http-equiv="Content-Security-Policy" content="default-src &#39;none&#39;; frame-src &#39;self&#39;; style-src &#39;unsafe-inline&#39;; base-uri &#39;none&#39;">'+
  '<title>Podium Score · Observatory visual auditions</title>'+
  '<style>*{box-sizing:border-box}body{margin:0;background:#080c11;color:#f6f4f0;font:14px/1.5 system-ui,-apple-system,sans-serif}main{max-width:1440px;margin:auto;padding:clamp(18px,4vw,50px)}'+
  'h1{font:400 clamp(28px,5vw,52px)/1.04 Georgia,serif}h2{font:400 19px Georgia,serif}'+
  'section{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,400px),1fr));gap:18px;margin-top:24px}'+
  'article{border:1px solid #3a4753;border-radius:14px;overflow:hidden;background:#131923}article header{padding:12px 16px}'+
  'article p,p,li{color:#ced4dc}article span{color:#fff2a9}iframe{width:100%;height:640px;border:0;background:#0a0e14}'+
  'ul{padding-left:22px}</style></head><body><main>'+
  '<p>VIXEN / PODIUM · HUMAN COMPOSER SCORE · ⟐</p>'+
  '<h1>'+candidates.length+' unratified visual audition'+(candidates.length===1?'':'s')+'</h1>'+
  '<p>Review the independent studies. Every card is sandboxed, has zero external dependencies, and carries no authority to replace the live Observatory or modify the source corpus. An unfamiliar mathematical grammar is shown as a concept study until a reviewed renderer exists.</p>'+
  '<section>'+embeds+'</section>'+ (rejects?'<h2>Held proposals</h2><ul>'+rejects+'</ul>':'')+
  '<p>STOP BEFORE COMPOSE. Human authorization of the exact Score is required for any approved promotion.</p>'+
  '</main></body></html>';
}
