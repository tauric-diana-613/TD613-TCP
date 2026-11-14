/**
 * 𝌋 VIXEN · ELECTRIC FOUNDRY · open laboratory kernel, RGI09.
 * Converges exact Dome-Art D3/phi samplers, Loom 39/6-13-20 roster rules,
 * and source-attributed Aperture/Couture geometry. Implementations below are
 * independently testable reference projections; no external empirical data.
 *
 * The register is OPEN: LABS is an installed exhibition, NEVER a numerical
 * limit on subsequent instruments. Scientific truth cannot be obtained by
 * increasing scene or shader count. Each probe is explicitly simulated.
 */
export const FOUNDRY_SCHEMA='emstd613.vixen.observatory-foundry/v1';
export const PHI=(1+Math.sqrt(5))/2;
export const CLAIM_CEILING='MODEL_SIMULATION_NOT_EXTERNAL_EMPIRICAL_WITNESS';
export const LABS=Object.freeze([
 {id:'D3_MOIRE',title:'Triangular Möbius',sub:'Rotated D₃ lattice beating',family:'DOME_ART',formula:'T(x,y)=½[⅓Σcos(k dᵢ·r)+⅓Σcos(k Rθdᵢ·r)]',visual:'D3_INTERFERENCE'},
 {id:'PHI_QUASI',title:'The Golden Irrational',sub:'Tenfold φ-quasiperiodic interference',family:'DOME_ART',formula:'Q(x,y)=¹⁄₁₀Σₘ cos(kφ αₘ·r + π sin((m+1)φ+ϕ))',visual:'QUASIPERIODIC'},
 {id:'FOLD_SEAM',title:'The Fracture Cathedral',sub:'Non-identical surfaces, measured difference',family:'DOME_ART',formula:'F(r)=|T(r)−Q(r)|',visual:'FOLD_DENSITY'},
 {id:'GRADIENT_CAUSTIC',title:'Electric Caustic Engine',sub:'Differential gradient conflict',family:'DOME_ART',formula:'G(r)=||∇T(r)−∇Q(r)||₂',visual:'NORMAL_DIVERGENCE'},
 {id:'LOOM_39',title:'39-Skin Loom',sub:'Six near · thirteen mid · twenty far',family:'LOOM',formula:'Σ₀³⁸ aᵢ cos(kᵢ·r + ϕᵢ) · depth(i)',visual:'SEMANTIC_DEPTH_CARRIERS'},
 {id:'APERTURE_SVD',title:'The Witness Aperture',sub:'Rank, singular values, identifiability',family:'APERTURE',formula:'rank(MᵀM); σ_min(M) · conditioning',visual:'OBSERVABILITY_CONTOUR'},
 {id:'COUTURE_111',title:'[111] Mirror Nullspace',sub:'Projection, residue and masquerade',family:'REFRACTIVE_COUTURE',formula:'P⊥=I−nnᵀ; n=(1,1,1)/√3',visual:'VECTOR_PROJECTION'},
 {id:'HOLONOMY',title:'The Return That Remembers',sub:'Recorded winding ≠ final-state identity',family:'ATLAS',formula:'H(γ)=∮γ A · dℓ; path_A ≠ path_B',visual:'PATH_HOLONOMY'},
 {id:'FIVE_CLOCKS',title:'Five Clocks in Velvet',sub:'Non-interchangeable timing domains',family:'TEMPORAL',formula:'tₖ ≠ tₙ ≠ τ ≠ wall ≠ sample₄₈ₖ',visual:'MULTI_CLOCK_FIELD'},
 {id:'CONTROL_PLANES',title:'Constitutive Switchyard',sub:'Separate safety, witness, action and performance',family:'TCC',formula:'S ≠ W ≠ A + P',visual:'NON_COLLAPSING_PLANES'},
 {id:'ALGEDONIC',title:'Algedonic Lightning',sub:'Threshold crossing without causal promotion',family:'CYBERNETICS',formula:'trigger=[risk>θ]; latency≠truth',visual:'THRESHOLD_PREEMPTION'},
 {id:'FOURIER',title:'Spectral Corset',sub:'Recomposed frequency, not photographic noise',family:'SIGNAL',formula:'f(r)=Σ aⱼsin(kⱼ·r + ϕⱼ)',visual:'FOURIER_SYNTHESIS'},
 {id:'TOROID',title:'Chromatic Torus',sub:'Two periodic dimensions with twist',family:'TOPOLOGY',formula:'T²=S¹×S¹; χ(u,v)=(R+r cos v)(cos u,sin u), r sin v',visual:'TOROIDAL_FOLDS'},
 {id:'TWIN_WORLD',title:'Twin-World Tribunal',sub:'Same endpoint · different route memory',family:'EXPERIMENT_B',formula:'end(γA)=end(γB) ⇏ γA=γB',visual:'ROUTE_NON_EQUIVALENCE'},
 {id:'GATE_256',title:'The Eight Unclosed Doors',sub:'2⁸ possible assignments, zero automatic closure',family:'SOURCE_CUSTODY',formula:'|Ω_gates|=2⁸=256; actual=UNADJUDICATED',visual:'HYPOTHESIS_LATTICE'},
 {id:'WITNESS_EXT',title:'The Exterior Witness',sub:'Independent information cannot be manufactured internally',family:'EMPIRICAL_SHORE',formula:'I(Ω;X|A)>0 requires X∉f(A)',visual:'INFORMATION_BOUNDARY'}
].map((lab,index)=>Object.freeze({...lab,index,epistemic:'FORMAL_OR_SYNTHETIC_ONLY',source_estate:'VIXEN_OPERA'})));
const clamp=(n,lo=0,hi=1)=>Math.max(lo,Math.min(hi,Number.isFinite(+n)?+n:0));
const safe=(n,def=0)=>Number.isFinite(+n)?+n:def;
const r6=n=>Math.round(n*1e6)/1e6;
export function labById(id){return LABS.find(l=>l.id===id)||null}
export function classifyCarrier(index,count=39){
 if(!Number.isInteger(index)||index<0||index>=count)throw new RangeError('CARRIER_INDEX_OUT_OF_BOUND');
 const near=index%13===0||index%11===0;
 const mid=!near&&(index%4===0||index%7===0);
 return Object.freeze({index,plane:near?'flight-near':mid?'flight-mid':'flight-far',
  near,mid,far:!near&&!mid,
  depth_gain:near?1.35:mid?.82:.46,
  css_opacity:near?.38:mid?.24:.20,
  color:index%9===0?'#F9F36D':index%5===0?'#F6F4F0':'#FF91AF'});
}
export const CARRIERS=Object.freeze(Array.from({length:39},(_,i)=>classifyCarrier(i)));
if([CARRIERS.filter(x=>x.near).length,CARRIERS.filter(x=>x.mid).length,
 CARRIERS.filter(x=>x.far).length].join('/')!=='6/13/20')throw Error('LOOM_CARRIER_CENSUS_BREACH');
export function triangular(x,y,{k=.036,theta=.055}={}){
 const d=[0,Math.PI/3,2*Math.PI/3],part=off=>d.reduce((s,a)=>s+
  Math.cos(k*(Math.cos(a+off)*x+Math.sin(a+off)*y)),0)/3;
 return r6((part(0)+part(theta))/2);
}
export function quasiperiodic(x,y,{kPhi=.026,phase=0}={}){
 let total=0;
 for(let m=0;m<10;m++){
  const a=m*Math.PI/5,pm=Math.sin((m+1)*PHI+phase)*Math.PI;
  total+=Math.cos(kPhi*(Math.cos(a)*x+Math.sin(a)*y)*(m%2?1:PHI/2)+pm);
 }
 return r6(total/10);
}
export function gradientMisfit(x,y,opts={}){
 const eps=2.5,T=(a,b)=>triangular(a,b,opts),Q=(a,b)=>quasiperiodic(a,b,opts);
 const dx=F=>(F(x+eps,y)-F(x-eps,y))/(2*eps);
 const dy=F=>(F(x,y+eps)-F(x,y-eps))/(2*eps);
 return r6(clamp(16*Math.hypot(dx(T)-dx(Q),dy(T)-dy(Q))));
}
export function singularValues2(M){
 if(!Array.isArray(M)||M.length!==2||M.some(row=>!Array.isArray(row)||row.length!==2||row.some(v=>!Number.isFinite(v))))
  throw new TypeError('APERTURE_NEEDS_DECLARED_FINITE_2X2_OPERATOR');
 const [[a,b],[c,d]]=M;
 const tr=a*a+b*b+c*c+d*d, det=(a*d-b*c)**2;
 const discriminant=Math.sqrt(Math.max(0,tr*tr-4*det));
 const upper=Math.sqrt(Math.max(0,(tr+discriminant)/2));
 const lower=Math.sqrt(Math.max(0,(tr-discriminant)/2));
 const tol=1e-8*Math.max(1,upper);
 return Object.freeze({sigma_max:r6(upper),sigma_min:r6(lower),
  rank:Number(upper>tol)+Number(lower>tol),
  condition:lower>tol?r6(upper/lower):'INFINITE',
  classification:lower>tol?'FULL_RANK_2D_OPERATOR':'RANK_DEFICIT',
  empirical_identifiability:'NOT_DERIVED_FROM_SYNTHETIC_MATRIX'});
}
export function project111(vector){
 if(!Array.isArray(vector)||vector.length!==3||vector.some(x=>!Number.isFinite(x)))
  throw new TypeError('COUTURE_NEEDS_REAL_3_VECTOR');
 const mean=(vector[0]+vector[1]+vector[2])/3;
 const projected=vector.map(x=>r6(x-mean));
 return Object.freeze({
  input:vector.slice(),projection:projected,
  nullspace_component:[r6(mean),r6(mean),r6(mean)],
  nullspace_energy:r6(3*mean*mean),
  projection_orthogonal_to_111:Math.abs(projected.reduce((a,b)=>a+b,0))<.00001,
  epistemic:'FORMAL_OPERATOR_ONLY'});
}
export function fiveClockTicks(lag=0){
 const t=clamp(safe(lag),0,120);
 return Object.freeze([
  {id:'LAYER_k',tick:Math.round(8+.30*t),unit:'DISCRETE_LAYER'},
  {id:'TOKEN_n',tick:Math.round(15+.80*t),unit:'DISCRETE_TOKEN'},
  {id:'SURROGATE_tau',tick:Math.round(27+.42*t),unit:'ODE_TIME'},
  {id:'WALL',tick:Math.round(35+1.05*t),unit:'SCHEDULER'},
  {id:'PLANT_48KHZ',tick:Math.round(5+.12*t),unit:'AUDIO_SAMPLE_DOMAIN'}
 ].map(x=>Object.freeze({...x,metric_type:'DIMENSIONLESS_DEMONSTRATION_NOT_EQUAL_UNITS'})));
}
export function fieldAt(id,x,y,params={}){
 const gain=clamp(safe(params.gain,.72),0,1),twist=clamp(safe(params.twist,.45),0,1);
 const voltage=clamp(safe(params.voltage,.78),0,1),t=safe(params.time,0);
 const p=x*210,q=y*210, a=Math.atan2(y,x),r=Math.hypot(x,y),k=1+gain;
 const T=()=>triangular(p,q,{theta:.015+.3*twist});
 const Q=()=>quasiperiodic(p,q,{phase:t*.11+twist*6});
 switch(id){
  case 'D3_MOIRE':return T();
  case 'PHI_QUASI':return Q();
  case 'FOLD_SEAM':return Math.abs(T()-Q());
  case 'GRADIENT_CAUSTIC':return gradientMisfit(p,q,{phase:t*.1});
  case 'LOOM_39':return CARRIERS.reduce((sum,c)=>sum+
   Math.sin(a*(c.index%9+1)+r*(c.index%7+2)*k*3+t*(c.near?1.2:c.mid?.67:.22)+c.index*PHI)*
   c.depth_gain/39,0);
  case 'APERTURE_SVD':return Math.sin(x*10*k)*Math.cos(y*10*(1-twist))*(.2+.8*voltage);
  case 'COUTURE_111':return Math.sin((x+y)*9*k)-Math.sin((x-y)*7*k);
  case 'HOLONOMY':return Math.cos(6*a+4*r+twist*Math.sin(13*r)-t*.3);
  case 'FIVE_CLOCKS':return (Math.sin(x*13*k+t*.4)+Math.sin(y*24+t*.8)+Math.sin((x+y)*15+t*.25))/3;
  case 'CONTROL_PLANES':return Math.max(Math.sin(x*15),Math.max(Math.cos(y*13),Math.sin((x+y)*9)))*.55;
  case 'ALGEDONIC':return Math.tanh((Math.sin(a*6+r*23+t*.8)-(.2+.55*twist))*8);
  case 'FOURIER':return [1,2,3,5,8].reduce((z,n)=>z+Math.sin((x*n+y*(n+1))*4*k+t*.18*n+PHI*n)/n,0);
  case 'TOROID':return Math.sin(a*7+twist*Math.sin(r*17))*.55+Math.cos(r*26-t*.4)*.45;
  case 'TWIN_WORLD':return Math.sin((x+y)*8+t*.25)-Math.sin((x-y)*8-t*.25);
  case 'GATE_256':return (Math.sin(x*32)+Math.cos(y*32))*.35+(Math.sin((x+y)*45)*twist*.3);
  case 'WITNESS_EXT':return Math.abs(Math.sin(x*13)*Math.cos(y*19))*(1-voltage);
  default:throw new RangeError('UNREGISTERED_INSTRUMENT');
 }
}
export function sceneProbe(id,params={},probe={x:0,y:0}){
 const lab=labById(id);
 if(!lab)throw new RangeError('UNREGISTERED_INSTRUMENT');
 const x=clamp(probe.x,-1,1),y=clamp(probe.y,-1,1);
 const val=fieldAt(id,x,y,params);
 const eps=.001,dx=(fieldAt(id,x+eps,y,params)-fieldAt(id,x-eps,y,params))/(2*eps);
 const dy=(fieldAt(id,x,y+eps,params)-fieldAt(id,x,y-eps,params))/(2*eps);
 let diagnostic={field_value:r6(val),local_gradient:[r6(dx),r6(dy)],local_gradient_norm:r6(Math.hypot(dx,dy))};
 if(id==='APERTURE_SVD')diagnostic={...diagnostic,...singularValues2([[params.gain??.72,params.twist??.45],[params.twist??.45,params.voltage??.78]])};
 if(id==='COUTURE_111')diagnostic={...diagnostic,...project111([x,y,val])};
 if(id==='LOOM_39')diagnostic={...diagnostic,depth_counts:{near:6,mid:13,far:20}};
 if(id==='FIVE_CLOCKS')diagnostic={...diagnostic,clocks:fiveClockTicks((params.gain??.72)*120)};
 if(id==='GATE_256')diagnostic={...diagnostic,hypotheses:256,adjudicated:0};
 if(id==='TWIN_WORLD')diagnostic={...diagnostic,endpoint_parity:'MATCHED_BY_CONSTRUCTION',route_equivalence:'UNESTABLISHED'};
 if(id==='WITNESS_EXT')diagnostic={...diagnostic,external_witness:'MISSING',independent_information_credit:0};
 return Object.freeze({schema:FOUNDRY_SCHEMA,lab_id:id,lab_family:lab.family,
  observation_class:'SYNTHETIC_OPERATOR_MODEL_SAMPLE',
  probe:{x:r6(x),y:r6(y)},params:{
   gain:clamp(params.gain??.72),twist:clamp(params.twist??.45),voltage:clamp(params.voltage??.78)},
  diagnostic,claim_ceiling:CLAIM_CEILING,empirical_credit:0});
}
export function experimentRouteReport(history=[]){
 const paths=Array.isArray(history)?history:[];
 return Object.freeze({routes:paths.slice(-50),same_endpoint_does_not_prove_same_path:true,
  source_provenance:'SESSION_LOCAL_ONLY',experiment_b_flight:'HELD',
  external_verification:'NOT_OBSERVED'});
}
