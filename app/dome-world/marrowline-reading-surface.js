/**
 * Presentation-only reading surface for Marrowline provider returns.
 *
 * The canonical .relay-stage-text node remains untouched and continues to own
 * custody, transcript, follow-up, morphology, receipt and witness semantics.
 * This module derives a sibling DOM reading view from its textContent.
 * No provider text is normalized, rewritten, or admitted by this renderer.
 */
export const MARROWLINE_READING_SURFACE_SCHEMA = 'td613.marrowline.reading-surface/v0.2';
export const MARROWLINE_LOOM_READING_WORK_UNIT_SCHEMA = 'td613.marrowline.loom-reading-work-unit/v0.1';
export const MARROWLINE_LOOM_HELD_READING_SCHEMA = 'td613.marrowline.loom-held-reading/v0.1';

function text(doc, value='') { return doc.createTextNode(String(value ?? '')); }

function appendInline(parent, value='') {
  const source=String(value ?? '');
  // Deliberately small safe subset. Links/HTML are never interpreted.
  const pattern=/(`([^`\n]+?)`|\*\*\*([^*\n]+?)\*\*\*|\*\*([^*\n]+?)\*\*|\*([^*\n]+?)\*)/gu;
  let cursor=0;
  for(const match of source.matchAll(pattern)){
    const index=Number(match.index||0);
    if(index>cursor) parent.append(text(parent.ownerDocument,source.slice(cursor,index)));
    if(match[2]!=null){
      const code=parent.ownerDocument.createElement('code');code.textContent=match[2];parent.append(code);
    }else if(match[3]!=null){
      const strong=parent.ownerDocument.createElement('strong'),em=parent.ownerDocument.createElement('em');
      em.textContent=match[3];strong.append(em);parent.append(strong);
    }else if(match[4]!=null){
      const strong=parent.ownerDocument.createElement('strong');strong.textContent=match[4];parent.append(strong);
    }else{
      const em=parent.ownerDocument.createElement('em');em.textContent=match[5];parent.append(em);
    }
    cursor=index+match[0].length;
  }
  if(cursor<source.length) parent.append(text(parent.ownerDocument,source.slice(cursor)));
}

function flushParagraph(doc,root,lines){
  if(!lines.length)return;
  const p=doc.createElement('p');
  lines.forEach((line,index)=>{if(index)p.append(doc.createElement('br'));appendInline(p,line);});
  root.append(p);lines.length=0;
}
function flushList(doc,root,state){
  if(!state.items.length)return;
  const list=doc.createElement(state.kind);
  state.items.forEach(item=>{const li=doc.createElement('li');appendInline(li,item);list.append(li);});
  root.append(list);state.items.length=0;state.kind=null;
}

export function renderMarrowlineReadingView(doc, raw='') {
  const root=doc.createElement('div');
  root.className='marrowline-reading-view';
  root.dataset.schema=MARROWLINE_READING_SURFACE_SCHEMA;
  root.setAttribute('role','document');
  root.setAttribute('aria-label','Reading view derived from exact provider return');

  const lines=String(raw ?? '').split(/\r\n|\r|\n/u);
  const paragraph=[];
  const list={kind:null,items:[]};
  let fence=null,math=null;

  const flushAll=()=>{flushParagraph(doc,root,paragraph);flushList(doc,root,list);};
  for(const line of lines){
    if(fence){
      if(/^\s*```\s*$/u.test(line)){
        const pre=doc.createElement('pre'),code=doc.createElement('code');
        code.textContent=fence.lines.join('\n');pre.append(code);root.append(pre);fence=null;
      }else fence.lines.push(line);
      continue;
    }
    if(math){
      if(/^\s*\$\$\s*$/u.test(line)){
        const block=doc.createElement('div');block.className='marrowline-reading-equation';
        const code=doc.createElement('code');code.textContent=math.join('\n');block.append(code);root.append(block);math=null;
      }else math.push(line);
      continue;
    }
    if(/^\s*```/u.test(line)){flushAll();fence={lines:[]};continue;}
    if(/^\s*\$\$\s*$/u.test(line)){flushAll();math=[];continue;}
    if(!line.trim()){flushAll();continue;}

    const heading=line.match(/^\s*(#{1,6})\s+(.+)$/u);
    if(heading){flushAll();const level=Math.min(6,Math.max(2,heading[1].length+1));const h=doc.createElement('h'+level);appendInline(h,heading[2]);root.append(h);continue;}

    const ordered=line.match(/^\s*\d+[.)]\s+(.+)$/u);
    const unordered=line.match(/^\s*[-+•]\s+(.+)$/u);
    if(ordered||unordered){
      flushParagraph(doc,root,paragraph);
      const kind=ordered?'ol':'ul';
      if(list.kind&&list.kind!==kind)flushList(doc,root,list);
      list.kind=kind;list.items.push((ordered||unordered)[1]);continue;
    }
    flushList(doc,root,list);

    const quote=line.match(/^\s*>\s?(.*)$/u);
    if(quote){flushParagraph(doc,root,paragraph);const q=doc.createElement('blockquote');appendInline(q,quote[1]);root.append(q);continue;}
    paragraph.push(line);
  }
  flushAll();
  if(fence){const pre=doc.createElement('pre'),code=doc.createElement('code');code.textContent=fence.lines.join('\n');pre.append(code);root.append(pre);}
  if(math){const block=doc.createElement('div');block.className='marrowline-reading-equation';const code=doc.createElement('code');code.textContent=math.join('\n');block.append(code);root.append(block);}
  return root;
}

export function resolveMarrowlineLoomReadingAuthority(card, environment=window) {
  // A held archive earns a presentation view only. It stays inspectable after
  // expiry and never enters the admitted-work-unit or native return coordinates.
  const heldRequest=String(card?.dataset?.loomHeldReadingRequestId || '');
  const heldPhase=String(card?.dataset?.loomHeldReadingPhase || '');
  if(card?.dataset?.loomHeldReadingSchema===MARROWLINE_LOOM_HELD_READING_SCHEMA && heldRequest && ['ACTIVATE','CONTINUE'].includes(heldPhase))
    return Object.freeze({schema:MARROWLINE_LOOM_HELD_READING_SCHEMA,request_id:heldRequest,phase:heldPhase,held:true,admission_authority:false});
  const requestId=String(card?.dataset?.loomReadingRequestId || '');
  const phase=String(card?.dataset?.loomReadingPhase || '');
  const expiresAt=Number(card?.dataset?.loomReadingExpiresAt || 0);
  const schema=String(card?.dataset?.loomReadingSchema || '');
  if(schema!==MARROWLINE_LOOM_READING_WORK_UNIT_SCHEMA || !requestId || !['ACTIVATE','CONTINUE'].includes(phase))return null;
  if(Number.isFinite(expiresAt) && expiresAt>0 && Date.now()>=expiresAt)return null;
  const controller=environment?.__TD613_LOOM_DEMO_CONTROLLER__;
  const state=controller?.snapshot?.();
  if(!state?.active || ['EXPIRED','LEFT'].includes(String(state.phase || '')))return null;
  const admittedIds=new Set([state.current_result_request_id,state.predecessor_request_id].filter(Boolean).map(String));
  if(!admittedIds.has(requestId))return null;
  return Object.freeze({schema:MARROWLINE_LOOM_READING_WORK_UNIT_SCHEMA,request_id:requestId,phase,expires_at:expiresAt||null});
}

export function removeMarrowlineReadingSurface(stage) {
  if(!stage)return false;
  const shell=stage.querySelector(':scope > .marrowline-reading-surface');
  const source=stage.querySelector(':scope > .relay-stage-text');
  if(!shell)return false;
  shell.remove();
  if(source){
    source.hidden=false;
    delete source.dataset.custodySurface;
    source.removeAttribute('aria-label');
  }
  delete stage.dataset.readingSurface;
  delete stage.dataset.readingSourceLength;
  return true;
}

export function installMarrowlineReadingSurface(stage, environment=window, authority=null) {
  if(!stage||stage.dataset.readingSurface==='true'||!authority?.request_id||!['ACTIVATE','CONTINUE'].includes(String(authority.phase||'')))return null;
  const source=stage.querySelector('.relay-stage-text');
  if(!source)return null;
  const doc=stage.ownerDocument,raw=String(source.textContent ?? '');
  const shell=doc.createElement('section');shell.className='marrowline-reading-surface';shell.dataset.schema=MARROWLINE_READING_SURFACE_SCHEMA;
  shell.dataset.loomRequestId=String(authority.request_id);shell.dataset.loomPhase=String(authority.phase);
  const tools=doc.createElement('div');tools.className='marrowline-reading-tools';tools.setAttribute('role','group');tools.setAttribute('aria-label','Reply presentation');
  const readingButton=doc.createElement('button');readingButton.type='button';readingButton.textContent='Reading';readingButton.setAttribute('aria-pressed','true');
  const exactButton=doc.createElement('button');exactButton.type='button';exactButton.textContent='Exact';exactButton.setAttribute('aria-pressed','false');
  const copyExact=doc.createElement('button');copyExact.type='button';copyExact.textContent='Copy exact';copyExact.className='marrowline-copy-exact';
  const claim=doc.createElement('small');claim.className='marrowline-reading-claim';claim.textContent=authority.held
    ? 'Held Loom reply · presentation only; admission remains held.'
    : 'Loom return · exact remains the custody source.';
  const status=doc.createElement('span');status.className='marrowline-reading-status';status.setAttribute('role','status');status.setAttribute('aria-live','polite');

  const reading=renderMarrowlineReadingView(doc,raw);
  source.hidden=true;
  source.dataset.custodySurface='exact-provider-return';
  source.setAttribute('aria-label','Exact provider return');
  shell.append(reading,tools,claim,status);
  tools.append(readingButton,exactButton,copyExact);
  source.before(shell);

  const select=(mode)=>{
    const exact=mode==='exact';
    reading.hidden=exact;source.hidden=!exact;
    readingButton.setAttribute('aria-pressed',String(!exact));
    exactButton.setAttribute('aria-pressed',String(exact));
    shell.dataset.view=exact?'exact':'reading';
  };
  readingButton.addEventListener('click',()=>select('reading'));
  exactButton.addEventListener('click',()=>select('exact'));
  copyExact.addEventListener('click',async()=>{
    try{await environment.navigator.clipboard.writeText(raw);status.textContent='Exact provider return copied.';}
    catch{status.textContent='Exact copy unavailable.';}
  });
  stage.dataset.readingSurface='true';
  stage.dataset.readingSourceLength=String(raw.length);
  return Object.freeze({schema:MARROWLINE_READING_SURFACE_SCHEMA,raw,reading,source,select});
}
