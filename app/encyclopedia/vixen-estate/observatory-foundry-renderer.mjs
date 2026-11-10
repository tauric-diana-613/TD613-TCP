/**
 * 𝌋 VIXEN ELECTRIC FOUNDRY · optical instrument only.
 * Borrow from Aperture v3.2-alpha: host-owned single frame clock, source
 * conditioned field overlays, pixel-ratio-respecting canvases, and explicit
 * analytic visual dynamics. The scientific SUBJECT stays in Vixen's corpus.
 *
 * Shader is a local, separately inspectable GLSL resource; no CDN/API.
 */
import {fieldAt,CARRIERS} from './observatory-foundry-kernel.mjs';

export const RENDERER_CONTRACT=Object.freeze({
 schema:'emstd613.vixen.chrome-optics/v1',engine:'WEBGL2_COMPUTED_CAUSTICS',
 fallback:'CPU_2D_DETERMINISTIC_FIELD',clock:'ONE_HOST_RAF_NO_CHILD_CLOCK',
 declared_carriers:39,source_estate:'EMSTD613',
 physical_evidence:false,cross_estate_promotion:false
});
const OPTICS=Object.freeze([
 'CONTROL_PLANES','FIVE_CLOCKS','ALGEDONIC','COUTURE_111',
 'APERTURE_SVD','FOURIER','D3_MOIRE','PHI_QUASI','FOLD_SEAM',
 'GRADIENT_CAUSTIC','LOOM_39','HOLONOMY','GATE_256','TOROID',
 'TWIN_WORLD','WITNESS_EXT'
]);
const VERTEX=[
 '#version 300 es','precision highp float;',
 'void main(){',
 ' vec2 v=vec2(float((gl_VertexID<<1)&2),float(gl_VertexID&2));',
 ' gl_Position=vec4(v*2.-1.,0.,1.);','}'
].join('\n');
const bounded=(x,min,max)=>Math.max(min,Math.min(max,Number.isFinite(+x)?+x:min));
const component=(n)=>Number.isFinite(+n)?+n:0;
function compile(gl,type,source){
 const shader=gl.createShader(type);
 gl.shaderSource(shader,source);gl.compileShader(shader);
 if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){
  const reason=gl.getShaderInfoLog(shader)||'Unknown compile failure';
  gl.deleteShader(shader);throw new Error('GLSL_COMPILE:'+reason);
 }
 return shader;
}
function makeWebGL(canvas,fragment){
 const gl=canvas.getContext('webgl2',{
  alpha:false,antialias:true,depth:false,
  powerPreference:'high-performance',preserveDrawingBuffer:true
 });
 if(!gl||typeof gl.createShader!=='function')return null;
 let vertex,frag,program;
 try{
  vertex=compile(gl,gl.VERTEX_SHADER,VERTEX);
  frag=compile(gl,gl.FRAGMENT_SHADER,fragment);
  program=gl.createProgram();gl.attachShader(program,vertex);gl.attachShader(program,frag);
  gl.linkProgram(program);
  if(!gl.getProgramParameter(program,gl.LINK_STATUS))
   throw new Error('GLSL_LINK:'+gl.getProgramInfoLog(program));
 }catch(e){
  if(program)gl.deleteProgram(program);
  if(vertex)gl.deleteShader(vertex);if(frag)gl.deleteShader(frag);
  return {failure:String(e.message||e)};
 }
 const keys=['u_res','u_probe','u_model','u_time','u_optic'];
 const uniforms=Object.fromEntries(keys.map(name=>[name,gl.getUniformLocation(program,name)]));
 const vao=gl.createVertexArray();
 return {
  kind:'WEBGL2_COMPUTED_CAUSTICS',
  paint({width,height,optic='CONTROL_PLANES',model={},pointer={x:0,y:0},time=0}){
   gl.viewport(0,0,width,height);
   gl.useProgram(program);
   gl.bindVertexArray(vao);
   gl.uniform2f(uniforms.u_res,width,height);
   gl.uniform2f(uniforms.u_probe,bounded(pointer.x,-1,1),bounded(pointer.y,-1,1));
   gl.uniform4f(uniforms.u_model,
    bounded(model.gain,0,1),bounded(model.witness,0,1),
    bounded(model.voltage,0,1),bounded(model.twist,0,1));
   gl.uniform1f(uniforms.u_time,component(time));
   gl.uniform1i(uniforms.u_optic,Math.max(0,OPTICS.indexOf(optic)));
   gl.drawArrays(gl.TRIANGLES,0,3);
  },
  dispose(){
   gl.deleteVertexArray(vao);gl.deleteProgram(program);
   gl.deleteShader(vertex);gl.deleteShader(frag);
  }
 };
}
function makeCPU(canvas){
 const ctx=canvas.getContext('2d',{alpha:false});
 if(!ctx)return null;
 let small=null,cache='',fieldGrid=null;
 const palette={graphite:[36,40,42],nickel:[102,112,120],
  porcelain:[246,244,240],pink:[255,145,175],arc:[223,191,238],
  opal:[157,188,193]};
 const lerp=(a,b,t)=>a+(b-a)*t;
 const metalTone=(a,b,t)=>[
  lerp(a[0],b[0],t),lerp(a[1],b[1],t),lerp(a[2],b[2],t)
 ];
 const narrow=(v,power)=>Math.pow(Math.max(0,v),power);
 const defaultNum=(v,d)=>Number.isFinite(+v)?+v:d;
 return {
  kind:'CANVAS2D_DETERMINISTIC_FIELD',
  paint({width,height,optic='CONTROL_PLANES',model={},pointer={x:0,y:0},time=0}){
   // Layer I · source-driven spatial field. Independent of pixel dimensions,
   // resampling creates a brushed, refracted material instead of tile art.
   const step=Math.max(2,Math.ceil(Math.max(width,height)/360));
   const w=Math.ceil(width/step),h=Math.ceil(height/step);
   if(!small||cache!==w+'x'+h){
    small=(canvas.ownerDocument||document).createElement('canvas');
    small.width=w;small.height=h;cache=w+'x'+h;
    fieldGrid=new Float32Array(w*h);
   }
   const sctx=small.getContext('2d');
   if(!sctx)return;
   const img=sctx.createImageData(w,h),data=img.data,asp=width/height;
   const params={...model,time};
   const twist=bounded(defaultNum(model.twist,.45),0,1);
   const voltage=bounded(defaultNum(model.voltage,.8),0,1);
   const gain=bounded(defaultNum(model.gain,.72),0,1);
   for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    const px=((x+.5)/w*2-1)*asp,py=((y+.5)/h*2-1);
    const value=fieldAt(optic,px,py,params);
    fieldGrid[y*w+x]=Number.isFinite(value)?value:0;
   }
   for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    const k=y*w+x,o=k*4,f=fieldGrid[k];
    const dx=(fieldGrid[y*w+Math.min(w-1,x+1)]-fieldGrid[y*w+Math.max(0,x-1)])*.5;
    const dy=(fieldGrid[Math.min(h-1,y+1)*w+x]-fieldGrid[Math.max(0,y-1)*w+x])*.5;
    const norm=Math.min(1.0,Math.hypot(dx,dy)*9.5);
    // True normal shading from neighbor samples; narrow specular
    // highlights are the optical signature of cold forged metal.
    const light=.61*dx-.43*dy+.16,denom=Math.hypot(dx,dy,.42);
    const spec=narrow(Math.max(0,light/denom),12);
    const smooth=bounded((f+.9)/1.8,0,1);
    const shadow=.13+.45*smooth+.20*spec;
    const nickel=metalTone(palette.graphite,palette.nickel,shadow);
    const porcelain=narrow(Math.max(0,Math.sin(f*12.0+time*.05)),19)*norm;
    // Refractive Glinda pink and tiny electroluminescent opal
    // excursions follow field polarity, gain and local derivative.
    const rose=narrow(Math.max(0,Math.sin(f*9.5+twist*6)),9)*
      (.1+.32*norm);
    const opal=narrow(Math.max(0,Math.cos((dx-dy)*26+twist*5)),14)*
      norm*(.05+.22*gain);
    // The Arc Flash is a distinct energetic event: voltage + sampled
    // spatial gradient + field curvature. These colors represent the
    // synthetic instrument only—not physical discharge measurement.
    const discharge=narrow(Math.abs(Math.sin(f*28.0+time*.12)),25)*
      bounded((voltage-.24)/.66,0,1)*Math.min(1,norm*2.5);
    const base=nickel.map(v=>v*.55+6);
    const crystal=porcelain*165+spec*75;
    const r=base[0]+crystal+rose*palette.pink[0]+opal*palette.opal[0]+discharge*palette.arc[0]*1.3;
    const g=base[1]+crystal+rose*palette.pink[1]+opal*palette.opal[1]+discharge*palette.arc[1]*1.3;
    const b=base[2]+crystal+rose*palette.pink[2]+opal*palette.opal[2]+discharge*palette.arc[2]*1.1;
    const px=(x+.5)/w*2-1,py=(y+.5)/h*2-1;
    const vignette=Math.max(.30,1-.37*(px*px+py*py));
    data[o]=Math.round(bounded(r*vignette,0,255));
    data[o+1]=Math.round(bounded(g*vignette,0,255));
    data[o+2]=Math.round(bounded(b*vignette,0,255));
    data[o+3]=255;
   }
   sctx.putImageData(img,0,0);
   ctx.imageSmoothingEnabled=true;
   ctx.drawImage(small,0,0,width,height);
   // Layer II · cold physical-suggestive nickel light, a controlled
   // spotlight that never replaces the original Baker-Miller palette.
   const haloX=width*(bounded(pointer.x,-1,1)+1)*.5;
   const haloY=height*(1-bounded(pointer.y,-1,1))*.5;
   const outer=ctx.createRadialGradient(haloX,haloY,1,haloX,haloY,Math.min(width,height)*.48);
   outer.addColorStop(0,'rgba(223,191,238,.18)');
   outer.addColorStop(.25,'rgba(255,145,175,.08)');
   outer.addColorStop(.58,'rgba(157,188,193,.035)');
   outer.addColorStop(1,'rgba(36,40,42,0)');
   ctx.save();ctx.globalCompositeOperation='screen';
   ctx.fillStyle=outer;ctx.fillRect(0,0,width,height);
   const edge=ctx.createLinearGradient(0,0,width*.8,height*.6);
   edge.addColorStop(0,'rgba(246,244,240,.13)');
   edge.addColorStop(.18,'rgba(102,112,120,.02)');
   edge.addColorStop(.36,'rgba(255,145,175,.05)');
   edge.addColorStop(.5,'rgba(36,40,42,0)');
   edge.addColorStop(.75,'rgba(223,191,238,.04)');
   edge.addColorStop(1,'rgba(246,244,240,.08)');
   ctx.fillStyle=edge;ctx.fillRect(0,0,width,height);ctx.restore();
   // Optical caustics are now legible through dark negative space;
   // instrument-specific vector score is composited on its own canvas.
  },
  dispose(){small=null;fieldGrid=null}
 };
}
export async function createFoundryRenderer(canvas,{preferGPU=true}={}){
 if(!canvas||typeof canvas.getContext!=='function')
  throw new TypeError('FOUNDRY_CANVAS_REQUIRED');
 let impl=null,shaderFailure=null;
 if(preferGPU){
  try{
   const uri=new URL('./observatory-foundry.frag',import.meta.url);
   const res=await fetch(uri);
   if(!res.ok)throw new Error('Shader HTTP '+res.status);
   const fragment=await res.text();
   impl=makeWebGL(canvas,fragment);
   if(impl?.failure){shaderFailure=impl.failure;impl=null}
  }catch(e){shaderFailure=String(e.message||e);}
 }
 // Important: a failed WebGL2 context may not permit switching the same
 // canvas to Canvas2D. Mount logic supplies a fresh canvas for fallback.
 if(!impl){
  const fallbackCanvas=canvas;
  impl=makeCPU(fallbackCanvas);
 }
 if(!impl)throw new Error('FOUNDRY_RENDER_CONTEXT_UNAVAILABLE'+(shaderFailure?':'+shaderFailure:''));
 let alive=true,frames=0,width=0,height=0,dpr=1;
 const ratio=()=>bounded(globalThis.devicePixelRatio||1,1,2);
 const resize=()=>{
  if(!alive)return null;
  const box=canvas.getBoundingClientRect(),w=Math.max(320,box.width||640),
   h=Math.max(220,box.height||480);
  dpr=ratio();
  // Quality is maximized within finite device limits; the full CSS stage
  // remains sharp without delegating the scientific score to pixel count.
  const nw=Math.min(2200,Math.round(w*dpr)),
   nh=Math.min(1500,Math.round(h*dpr));
  if(width!==nw||height!==nh){
   width=nw;height=nh;canvas.width=nw;canvas.height=nh;
  }
  return {width,height,dpr};
 };
 return Object.freeze({
  resize,
  paint(params={}){
   if(!alive)return false;
   if(!width||!height)resize();
   impl.paint({width,height,...params});
   frames++;return true;
  },
  status:()=>Object.freeze({
   backend:impl.kind,frames,shader_failure:shaderFailure,
   empirical_evidence:false,source_estate:'EMSTD613'
  }),
  dispose(){if(!alive)return;alive=false;impl.dispose();}
 });
}
