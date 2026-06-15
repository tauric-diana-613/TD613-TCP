const VERSION='hush-edit-corpus-carousel/v1';
const KEY='td613:hush:phase31:logged-samples:v1';
const MODES=['explanatory','argumentative','narrative','procedural','reflective-affective','legal-forensic','casual-conversational','technical-operational','poetic-symbolic','corrective-repair','compressed-summary'];
const TRIGGERS=['baseline-voice','high-pressure','failure-recovery','correction-request','disagreement-pushback','implementation-handoff','evidence-framing','boundary-refusal','uncertainty-caveat','deep-explanation','compression-summary','affective-repair','ritual-symbolic','public-facing','private-diagnostic'];
let samples=[];
let index=0;
const first=(value,list)=>list.includes(String(value||'').trim())?String(value||'').trim():list[0];

function read(){
  try{
    const parsed=JSON.parse(localStorage.getItem(KEY)||'{}');
    return (Array.isArray(parsed.samples)?parsed.samples:[]).map((sample)=>{
      const text=String(typeof sample==='string'?sample:sample?.text||'').trim();
      if(!text)return null;
      const discourseMode=first(sample?.discourseMode||sample?.promptCategory,MODES);
      const retrievalTrigger=first(sample?.retrievalTrigger||sample?.contextLabel,TRIGGERS);
      return {text,promptCategory:discourseMode,discourseMode,contextLabel:retrievalTrigger,retrievalTrigger};
    }).filter(Boolean);
  }catch(error){return []}
}

function write(next=[]){
  const clean=next.map((sample)=>{
    const discourseMode=first(sample.discourseMode||sample.promptCategory,MODES);
    const retrievalTrigger=first(sample.retrievalTrigger||sample.contextLabel,TRIGGERS);
    return {text:String(sample.text||'').trim(),promptCategory:discourseMode,discourseMode,contextLabel:retrievalTrigger,retrievalTrigger};
  }).filter((sample)=>sample.text);
  if(clean.length)localStorage.setItem(KEY,JSON.stringify({version:'phase31-logged-samples/v2-ontology-fields',updatedAt:new Date().toISOString(),samples:clean}));
  else localStorage.removeItem(KEY);
  return clean;
}

function style(){
  if(document.getElementById('hushEditCorpusCarouselStyle'))return;
  const s=document.createElement('style');
  s.id='hushEditCorpusCarouselStyle';
  s.textContent=`
    #hushPhase31EditCorpusModal[hidden]{display:none!important}
    #hushPhase31EditCorpusModal .hush-phase31-edit-card{display:grid!important;grid-template-rows:auto auto auto minmax(0,1fr) auto auto!important;overflow:hidden!important;max-height:min(42rem,calc(100dvh - 2.4rem))!important}
    #hushPhase31EditCorpusModal .hush-phase31-edit-list{min-height:0!important;max-height:min(28rem,calc(100dvh - 15rem))!important;overflow:auto!important;overscroll-behavior:contain!important;-webkit-overflow-scrolling:touch!important}
    #hushPhase31EditCorpusModal .hush-phase31-carousel-bar{display:grid!important;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr)!important;align-items:center!important;gap:.48rem!important;margin:.2rem 0 .62rem!important}
    #hushPhase31EditCorpusModal .hush-phase31-carousel-count{color:rgba(202,255,223,.82)!important;font-family:var(--font-mono,ui-monospace,monospace)!important;font-size:.58rem!important;letter-spacing:.08em!important;text-align:center!important;text-transform:uppercase!important;white-space:nowrap!important}
    #hushPhase31EditCorpusModal .hush-phase31-carousel-nav{min-height:2.1rem!important;padding:.3rem .62rem!important;border-radius:999px!important;font-size:.58rem!important;letter-spacing:.1em!important}
    #hushPhase31EditCorpusModal .hush-phase31-edit-remove.hush-phase31-edit-remove{appearance:none!important;-webkit-appearance:none!important;position:absolute!important;display:inline-grid!important;place-items:center!important;min-width:0!important;min-height:0!important;width:1rem!important;height:1rem!important;padding:0!important;margin:0!important;border:0!important;border-radius:999px!important;background:transparent!important;box-shadow:none!important;top:.42rem!important;right:.48rem!important;color:rgba(255,118,104,.94)!important;font:700 .62rem/1 var(--font-mono,ui-monospace,monospace)!important;letter-spacing:0!important;text-transform:none!important;transform:none!important;cursor:pointer!important}
    #hushPhase31SaveCorpusEdits[data-save-state="saved"]{border-color:rgba(49,255,138,.72)!important;background:linear-gradient(135deg,rgba(202,255,223,.96),rgba(49,255,138,.82))!important;color:#031009!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.62),0 0 22px rgba(49,255,138,.28)!important}
    #hushPhase31SaveCorpusEdits[data-save-state="saving"]{opacity:.72!important}
    #hushPhase31SaveCorpusEdits[data-save-state="error"]{color:rgba(255,118,104,.98)!important}
  `;
  document.head.appendChild(s);
}

function option(value,selected){const o=document.createElement('option');o.value=value;o.textContent=value;o.selected=value===selected;return o}
function select(cls,list,selected){const sel=document.createElement('select');sel.className=cls;const current=first(selected,list);list.forEach((v)=>sel.appendChild(option(v,current)));return sel}
function label(text,control){const l=document.createElement('label');l.append(document.createTextNode(text));l.appendChild(control);return l}

function modal(){
  let m=document.getElementById('hushPhase31EditCorpusModal');
  if(m)return m;
  m=document.createElement('div');
  m.id='hushPhase31EditCorpusModal';
  m.className='hush-phase31-modal hush-phase31-edit-modal';
  m.hidden=true;
  m.setAttribute('role','dialog');
  m.setAttribute('aria-modal','true');
  m.innerHTML='<div class="hush-phase31-modal-card hush-phase31-edit-card"><h3 id="hushPhase31EditCorpusTitle">Edit Customizer Corpus</h3><p class="hush-phase31-edit-note">Samples appear in logged order. Carousel mode renders one sample at a time to keep mobile stable.</p><div class="hush-phase31-carousel-bar"><button id="hushPhase31PrevSample" type="button" class="ghost hush-phase31-carousel-nav">Previous</button><span id="hushPhase31CarouselCount" class="hush-phase31-carousel-count">Sample 0 of 0</span><button id="hushPhase31NextSample" type="button" class="ghost hush-phase31-carousel-nav">Next</button></div><div id="hushPhase31EditCorpusList" class="hush-phase31-edit-list"></div><div class="hush-phase31-modal-actions"><button id="hushPhase31SaveCorpusEdits" type="button" class="primary-cta">Save</button><button id="hushPhase31CloseCorpusEdit" type="button" class="ghost">Close</button></div><div id="hushPhase31EditCorpusStatus" class="hush-phase31-modal-status"></div></div>';
  document.body.appendChild(m);
  return m;
}

function pullCard(){
  const m=document.getElementById('hushPhase31EditCorpusModal');
  if(!m||!samples.length)return;
  const text=String(m.querySelector('.hush-phase31-edit-text')?.value||'').trim();
  if(!text)return;
  const discourseMode=first(m.querySelector('.hush-phase31-edit-category')?.value,MODES);
  const retrievalTrigger=first(m.querySelector('.hush-phase31-edit-context')?.value,TRIGGERS);
  samples[index]={text,promptCategory:discourseMode,discourseMode,contextLabel:retrievalTrigger,retrievalTrigger};
}

function render(){
  const m=modal();
  const list=m.querySelector('#hushPhase31EditCorpusList');
  const count=m.querySelector('#hushPhase31CarouselCount');
  const prev=m.querySelector('#hushPhase31PrevSample');
  const next=m.querySelector('#hushPhase31NextSample');
  const status=m.querySelector('#hushPhase31EditCorpusStatus');
  list.textContent='';
  if(!samples.length){
    index=0;
    const p=document.createElement('p');
    p.className='hush-phase31-edit-empty';
    p.textContent='No logged customizer samples yet.';
    list.appendChild(p);
    count.textContent='Sample 0 of 0';
    prev.disabled=true;next.disabled=true;
    status.textContent='';
    return;
  }
  index=Math.max(0,Math.min(index,samples.length-1));
  const sample=samples[index];
  const row=document.createElement('section');
  row.className='hush-phase31-edit-sample';
  const remove=document.createElement('button');
  remove.type='button';remove.className='hush-phase31-edit-remove';remove.textContent='×';remove.setAttribute('aria-label',`Remove sample ${index+1}`);
  const text=document.createElement('textarea');text.className='hush-phase31-edit-text';text.value=sample.text||'';
  row.appendChild(remove);
  row.appendChild(label('Writing sample',text));
  row.appendChild(label('Discourse Mode',select('hush-phase31-edit-category',MODES,sample.discourseMode||sample.promptCategory)));
  row.appendChild(label('Retrieval Trigger',select('hush-phase31-edit-context',TRIGGERS,sample.retrievalTrigger||sample.contextLabel)));
  list.appendChild(row);
  count.textContent=`Sample ${index+1} of ${samples.length}`;
  prev.disabled=index<=0;next.disabled=index>=samples.length-1;
  status.textContent=`Editing sample ${index+1} of ${samples.length}.`;
}

function open(){style();samples=read();index=0;const m=modal();m.hidden=false;requestAnimationFrame(render)}
function close(){const m=document.getElementById('hushPhase31EditCorpusModal');if(m)m.hidden=true}
function move(step){if(!samples.length)return;pullCard();index=Math.max(0,Math.min(index+step,samples.length-1));render()}
function removeCurrent(){if(!samples.length)return;samples.splice(index,1);if(index>=samples.length)index=Math.max(0,samples.length-1);render()}
function verify(expected){const stored=read();return stored.length===expected.length&&expected.every((s,i)=>stored[i]?.text===s.text&&stored[i]?.promptCategory===s.promptCategory&&stored[i]?.contextLabel===s.contextLabel)}
function save(){const btn=document.getElementById('hushPhase31SaveCorpusEdits');const status=document.getElementById('hushPhase31EditCorpusStatus');pullCard();const expected=samples.slice();if(btn)btn.dataset.saveState='saving';write(expected);if(!verify(expected)){if(btn)btn.dataset.saveState='error';if(status)status.textContent='Save did not verify. Corpus was not changed.';return}if(status)status.textContent=`Saved ${expected.length} corpus samples.`;if(btn){btn.dataset.saveState='saved';btn.textContent='Saved'}setTimeout(()=>{close();if(btn){btn.dataset.saveState='';btn.textContent='Save'}location.reload()},520)}

function boot(){
  style();
  if(document.documentElement.dataset.td613EditCorpusAssertiveBound==='true')return;
  document.documentElement.dataset.td613EditCorpusAssertiveBound='true';
  document.addEventListener('click',(event)=>{
    if(event.target?.closest?.('#hushPhase31EditCorpus')){event.preventDefault();event.stopImmediatePropagation();open();return}
    if(event.target?.closest?.('#hushPhase31PrevSample')){event.preventDefault();event.stopImmediatePropagation();move(-1);return}
    if(event.target?.closest?.('#hushPhase31NextSample')){event.preventDefault();event.stopImmediatePropagation();move(1);return}
    if(event.target?.closest?.('.hush-phase31-edit-remove')){event.preventDefault();event.stopImmediatePropagation();removeCurrent();return}
    if(event.target?.closest?.('#hushPhase31CloseCorpusEdit')){event.preventDefault();event.stopImmediatePropagation();close();return}
    if(event.target?.closest?.('#hushPhase31SaveCorpusEdits')){event.preventDefault();event.stopImmediatePropagation();save()}
  },true);
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
window.__TD613_HUSH_EDIT_CORPUS_CAROUSEL__={version:VERSION,open,read,write,save,move};
