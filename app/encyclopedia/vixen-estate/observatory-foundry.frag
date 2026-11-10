#version 300 es
precision highp float;
precision highp int;
uniform vec2 u_res;
uniform vec2 u_probe;
uniform vec4 u_model;
uniform float u_time;
uniform int u_optic;
out vec4 color;
#define PI 3.14159265358979323846264
float tri(vec2 p,float angle){
 float r=0.;
 for(int i=0;i<3;i++){
  float a=float(i)*PI/3.;
  r+=cos(.036*dot(vec2(cos(a),sin(a)),p));
  r+=cos(.036*dot(vec2(cos(a+angle),sin(a+angle)),p));
 }
 return r/6.;
}
float quasi(vec2 p,float phase){
 float r=0.,phi=1.61803398875;
 for(int i=0;i<10;i++){
  float a=float(i)*PI/5.,m=float(i);
  r+=cos(.026*(mod(m,2.)>.5?1.:phi*.5)*
   dot(vec2(cos(a),sin(a)),p)+sin((m+1.)*phi+phase)*PI);
 }
 return r/10.;
}
float loom(vec2 p,float t){
 float s=0.,a=atan(p.y,p.x),r=length(p);
 for(int i=0;i<39;i++){
  float q=float(i);
  bool nr=(i%13==0)||(i%11==0);
  bool mid=(!nr)&&((i%4==0)||(i%7==0));
  float depth=nr?1.35:(mid?.82:.46);
  float rate=nr?1.2:(mid?.67:.22);
  s+=sin(a*(mod(q,9.)+1.)+r*(mod(q,7.)+2.)*.034+
    t*rate+q*1.61803398875)*depth;
 }
 return s/39.;
}
float field(vec2 p, int mode,float t){
 float k=1.+u_model.x,tw=u_model.w,volt=u_model.z;
 float T=tri(p,.015+.3*tw);
 float Q=quasi(p,t*.11+tw*6.);
 float a=atan(p.y,p.x),r=length(p);
 if(mode==0)return max(-1.,min(1.,sin(p.x*.075*k)*cos(p.y*.065*(1.-.55*tw))
                 +.27*sin((p.x+p.y)*.046+tw*4.)));
 if(mode==1)return .4*sin(p.x*.11+t*.26)+.3*sin(p.y*.19+t*.5)+
                  .3*sin((p.x+p.y)*.06+t*.12);
 if(mode==2)return tanh(6.*(sin(a*7.+r*.032+t*.9)-(.16+.55*tw)));
 if(mode==3)return sin((p.x+p.y)*.082*k)-sin((p.x-p.y)*.065*k);
 if(mode==4)return sin(p.x*.11*k)*cos(p.y*.10*(1.-tw))*(.2+.8*volt);
 if(mode==5)return .65*sin(p.x*.075+p.y*.043)+.35*sin(p.x*.1-p.y*.08);
 if(mode==6)return T;
 if(mode==7)return Q;
 if(mode==8)return abs(T-Q);
 if(mode==9){
  float e=2.5;
  vec2 gt=vec2(tri(p+vec2(e,0.),.015+.3*tw)-tri(p-vec2(e,0.),.015+.3*tw),
                tri(p+vec2(0.,e),.015+.3*tw)-tri(p-vec2(0.,e),.015+.3*tw))/(e*2.);
  vec2 gq=vec2(quasi(p+vec2(e,0.),t*.11+tw*6.)-quasi(p-vec2(e,0.),t*.11+tw*6.),
                quasi(p+vec2(0.,e),t*.11+tw*6.)-quasi(p-vec2(0.,e),t*.11+tw*6.))/(e*2.);
  return min(1.,length(gt-gq)*16.);
 }
 if(mode==10)return loom(p,t);
 if(mode==11)return cos(6.*a+4.*r*.012+tw*sin(13.*r*.012)-t*.3);
 if(mode==12)return max(sin(p.x*.07),max(cos(p.y*.065),sin((p.x+p.y)*.04)))*.55;
 if(mode==13)return sin(a*7.+tw*sin(r*.13))*.55+cos(r*.17-t*.4)*.45;
 if(mode==14)return sin((p.x+p.y)*.05+t*.25)-sin((p.x-p.y)*.05-t*.25);
 return abs(sin(p.x*.075)*cos(p.y*.12))*(1.-volt);
}
// Canonical Vixen theme: Baker-Miller #FF91AF, Arc Flash #F9F36D,
// Graphite #24282A, Nickel #667078, Porcelain #F6F4F0.
// Optical machinery is derived from Vixen's computed field, never blue ink.
vec3 palette(float t){
 vec3 graphite=vec3(.1412,.1569,.1647);
 vec3 nickel=vec3(.4,.4392,.4706);
 vec3 porcelain=vec3(.9647,.9569,.9412);
 vec3 glinda=vec3(1.,.5686,.6863);
 vec3 arcFlash=vec3(.9765,.9529,.4275);
 float silver=smoothstep(-.82,.88,t);
 vec3 albedo=mix(graphite,nickel,smoothstep(-.9,.15,t));
 albedo=mix(albedo,porcelain,silver*.74);
 float spectral=smoothstep(.12,.82,sin(t*8.+u_model.w*3.)*.5+.5);
 albedo=mix(albedo,glinda,spectral*.34);
 // The electrical yellow phase depends on the same computed field.
 float voltagePhase=smoothstep(.43,.92,sin(t*22.+u_model.z*6.)*.5+.5);
 albedo=mix(albedo,arcFlash,voltagePhase*.26);
 return albedo;
}
void main(){
 vec2 uv=(gl_FragCoord.xy/u_res)*2.-1.;
 uv.x*=u_res.x/max(u_res.y,1.);
 vec2 pointer=u_probe*vec2(u_res.x/max(u_res.y,1.),1.);
 float t=u_time;
 vec2 p=uv*205.;
 float f=field(p,u_optic,t);
 vec2 grad=vec2(field(p+vec2(1.8,0.),u_optic,t)-field(p-vec2(1.8,0.),u_optic,t),
                field(p+vec2(0.,1.8),u_optic,t)-field(p-vec2(0.,1.8),u_optic,t))*.27778;
 float slope=length(grad);
 vec2 bend=grad*(6.5+u_model.w*16.);
 float r=field(p+bend*.88,u_optic,t)*.5+.5;
 float g=f*.5+.5;
 float b=field(p-bend*1.05,u_optic,t)*.5+.5;
 float light=pow(clamp(g+.08,0.,1.),1.4);
 float edges=pow(clamp(slope*8.,0.,1.),2.0);
 float chrome=pow(abs(sin(f*13.+length(p)*.055)),18.);
 vec3 base=palette(f);
 base+=vec3(.67,.68,.67)*(edges*.65+chrome*.38);
 base+=vec3(1.,.5686,.6863)*max(0.,b-r)*.4;
 base+=vec3(.9765,.9529,.4275)*max(0.,r-b)*.38;
 float bands=pow(abs(sin(f*24.+t*.035)),25.)*pow(clamp(light,0.,1.),2.);
 base+=vec3(.9765,.9529,.4275)*bands*.40;
 float potential=length(uv-pointer);
 float arcSwitch=smoothstep(.26,.86,u_model.z);
 float arcRibbon=pow(1.-abs(sin(f*34.+slope*37.+t*1.15)),24.);
 float arc=arcSwitch*arcRibbon*smoothstep(.08,.63,slope*22.)*
           (.5+.5*pow(max(0.,1.-potential*.3),2.));
 // Yellow is the authorized high-voltage Arc Flash. Pink marks the
 // refracting fringe; porcelain supplies the core of a computed discharge.
 vec3 bright=vec3(.9765,.9529,.4275)*arc*2.12;
 bright+=vec3(1.,.5686,.6863)*arc*.40;
 bright+=vec3(.9647,.9569,.9412)*pow(arc,2.6)*2.0;
 float caustic=pow(max(0.,sin(f*31.+t*.06)),19.)*clamp(slope*19.,0.,1.);
 bright+=vec3(.9765,.9529,.4275)*caustic*.49;
 float radial=length(uv);
 float ring=exp(-pow((radial-.66)*250.,2.))+
            exp(-pow((radial-.82)*200.,2.))*.36;
 float ringMarkers=pow(max(0.,sin(atan(uv.y,uv.x)*48.)),34.);
 base+=ring*(vec3(.72,.72,.71)+vec3(.9765,.9529,.4275)*ringMarkers*.60)*.54;
 float wires=0.;
 for(int i=0;i<39;i++){
  float q=float(i);
  bool near=(i%13==0)||(i%11==0);
  bool mid=!near&&((i%4==0)||(i%7==0));
  float depth=near?.75:(mid?.43:.20);
  float phase=q*2.3999632;
  vec2 d=vec2(cos(phase),sin(phase));
  float distance=abs(dot(uv,d)-(.12*sin(q*.83+t*.018)));
  float width=near?.0015:(mid?.0011:.0008);
  float stroke=1.-smoothstep(width,width*4.,distance);
  wires+=stroke*depth*(.24+.76*smoothstep(.03,.62,slope*30.));
 }
 base+=vec3(.9765,.9529,.4275)*min(1.,wires)*.18;
 float vignette=clamp(1.-.21*dot(uv,uv),.25,1.);
 vec3 outRGB=(base+bright)*vignette;
 outRGB=pow(max(outRGB,vec3(0.)),vec3(.83));
 color=vec4(outRGB,1.);
}