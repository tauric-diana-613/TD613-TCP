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
 let small=null,cache='';
 return {
  kind:'CANVAS2D_DETERMINISTIC_FIELD',
  paint({width,height,optic='CONTROL_PLANES',model={},pointer={x:0,y:0},time=0}){
   const step=Math.max(3,Math.ceil(Math.max(width,height)/280));
   const w=Math.ceil(width/step),h=Math.ceil(height/step);
   if(!small||cache!==w+'x'+h){
    small=(canvas.ownerDocument||document).createElement('canvas');
    small.width=w;small.height=h;cache=w+'x'+h;
   }
   const sctx=small.getContext('2d');
   if(!sctx)return;
   const img=sctx.createImageData(w,h),data=img.data,asp=width/height;
   for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    const px=((x+.5)/w*2-1)*asp,py=((y+.5)/h*2-1);
    const off=(y*w+x)*4;
    let f=fieldAt(optic,px,py,{...model,time});if(!Number.isFinite(f))f=0;
    const a=bounded((f+.85)/1.7,0,1),b=Math.abs(Math.sin(f*17))*a;
    data[off]=Math.round(9+118*a+35*b);
    data[off+1]=Math.round(17+157*a+38*b);
    data[off+2]=Math.round(27+206*a+27*b);
    data[off+3]=255;
   }
   sctx.putImageData(img,0,0);
   ctx.imageSmoothingEnabled=true;ctx.drawImage(small,0,0,width,height);
   const cx=width/2,cy=height/2;
   for(const fraction of [.25,.36,.46]){
    ctx.beginPath();ctx.arc(cx,cy,Math.min(width,height)*fraction,0,Math.PI*2);
    ctx.lineWidth=1.1;ctx.strokeStyle='rgba(185,221,251,.3)';ctx.stroke();
   }
   const bx=cx+pointer.x*cy*.65,by=cy-pointer.y*cy*.65;
   const halo=ctx.createRadialGradient(bx,by,0,bx,by,Math.min(width,height)*.22);
   halo.addColorStop(0,'rgba(105,210,255,.48)');
   halo.addColorStop(1,'rgba(0,0,0,0)');
   ctx.fillStyle=halo;ctx.fillRect(0,0,width,height);
  },
  dispose(){small=null}
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
