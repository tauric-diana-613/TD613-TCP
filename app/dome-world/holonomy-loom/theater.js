import { AnimationCoordinator } from './animation-coordinator.js';
import { LOOM_DEMO_SCENES, compileLoomDemoScene, getLoomDemoInput, validateLoomSemanticField, createLoomPortablePacket } from './semantic-field.js';
import { HOLONOMY_LOOM_MOTION_DESCRIPTORS } from './flowcore-aia-motion.js';
import { projectLoomGeometry } from './theater-geometry.js';

const sceneLabels = ['Quiet', 'Change', 'Protect', 'Return', 'Warning', 'Missing', 'Recover', 'Rest'];
const xml = 'http://www.w3.org/2000/svg';
const pretty = value => JSON.stringify(value, null, 2);

/** An optional receiver for the existing engine, never a replacement release path. */
export function mountLoomTheater(root, environment = window) {
  const doc = root.ownerDocument;
  // Static authored markup only; packet/provider/user values use textContent.
  root.innerHTML = `
    <header class="lt-top"><div><p class="lt-eyebrow">The Loom / a practice theater</p><p>Fictional inputs. Real local rules. Nothing sent.</p></div>
      <div class="lt-view" role="group" aria-label="Receiver view"><button type="button" data-view="child" aria-pressed="true">CHILD VIEW</button><button type="button" data-view="auditor" aria-pressed="false">AUDITOR VIEW</button></div></header>
    <div class="lt-story" aria-live="polite" aria-atomic="true"><span class="lt-tag" id="ltTag">Practice waiting · nothing checked</span><h2 id="ltTitle">A message. A thread. A boundary.</h2><p id="ltConsequence">See what may travel with a note, what must stay, and what we still cannot know.</p></div>
    <div class="lt-stage"><svg viewBox="0 0 800 380" role="img" aria-labelledby="ltGraphicTitle ltGraphicDescription">
      <title id="ltGraphicTitle">The Loom’s bounded information field</title><desc id="ltGraphicDescription">Practice is waiting. Play to run the first fictional note through the local checker.</desc>
      <defs><radialGradient id="ltGlow"><stop offset="0" stop-color="#76ead4" stop-opacity=".11"/><stop offset="1" stop-color="#76ead4" stop-opacity="0"/></radialGradient></defs>
      <ellipse cx="400" cy="210" rx="310" ry="158" fill="url(#ltGlow)"/>
      <g data-pass="dome" aria-hidden="true"><ellipse class="lt-grid" cx="400" cy="222" rx="276" ry="134"/><ellipse class="lt-grid" cx="400" cy="222" rx="216" ry="134"/><ellipse class="lt-grid" cx="400" cy="222" rx="120" ry="134"/><ellipse class="lt-grid" cx="400" cy="222" rx="276" ry="46"/><ellipse class="lt-grid" cx="400" cy="222" rx="276" ry="88"/><path class="lt-grid" d="M124,222 H676 M400,88 V356"/></g>
      <g id="ltWeather" aria-hidden="true"></g>
      <path class="lt-horizon" d="M621,93 Q699,219 621,346"/>
      <text x="581" y="62">CLAIM CEILING</text><text class="lt-field-label" x="605" y="78">Beyond ≠ earned</text>
      <g id="ltStrands" aria-hidden="true"></g><path id="ltAlternative" class="lt-path" stroke-dasharray="3 5"/>
      <path id="ltRoute" class="lt-path" opacity=".7"/>
      <path id="ltGate" class="lt-horizon"/>
      <path id="ltSeam" class="lt-seam" d="M378,170 L369,185 L383,200 L373,215 L385,230 L375,245" hidden/>
      <circle class="lt-node" cx="160" cy="227" r="18"/><circle class="lt-node" cx="610" cy="227" r="18"/>
      <circle id="ltTraveller" class="lt-pulse" cx="160" cy="227" r="4" hidden/>
      <text id="ltPhaseGlyph" class="lt-glyph" x="160" y="227" text-anchor="middle" dominant-baseline="middle">à</text><text x="128" y="277">LOCAL INPUT</text><text x="557" y="277">CHECKED DOOR</text>
      <text id="ltGeometryNote" class="lt-field-label" x="160" y="319">Choose a scene to admit fictional state.</text>
    </svg></div>
    <div class="lt-caption"><span id="ltRelation">Geometry is an explanation, not a measurement.</span><span>No hidden-state access · L unearned</span></div>
    <p class="lt-static" id="ltStatic"><strong>What stays true without motion:</strong> no practice analysis exists until you choose a scene.</p>
    <div class="lt-controls"><button class="lt-primary" type="button" id="ltPlay">PLAY DEMO</button><button type="button" id="ltNext">NEXT SCENE</button><button type="button" id="ltReplay" disabled>REPLAY</button><button type="button" id="ltPause" disabled>PAUSE</button><button type="button" id="ltReset">RESET</button><button class="lt-rest" type="button" id="ltRest">𝄐 REST</button></div>
    <div class="lt-scrub"><label for="ltTime">Replay time</label><input id="ltTime" type="range" min="0" max="3600" step="100" value="0" disabled><output id="ltTimeLabel" for="ltTime">0.0 / 3.6 s</output></div>
    <nav class="lt-scenes" aria-label="Practice scenes"></nav>
    <div class="lt-settings"><label><input id="ltReduced" type="checkbox">Reduced motion</label><label><input id="ltPortable" type="checkbox">Portable receiver</label><span class="lt-runtime" id="ltRuntime" role="status">Clock idle · 0 pending frames</span></div>
    <details class="lt-details" id="ltWhy"><summary>WHY DID THAT MOVE?</summary><p id="ltWhyText">Nothing has moved yet. A scene will name its exact cause here.</p><ul id="ltMotionCauses"></ul></details>
    <section class="lt-details" id="ltAudit" aria-label="Auditor projection" hidden><p class="lt-eyebrow">Same state / exact limits</p><dl class="lt-facts" id="ltFacts"></dl><p class="lt-warning">V ≠ C ≠ P ≠ L. A supplied marker is not recovered custody; a modeled warning is not evidence of hidden-state reconstruction.</p><p id="ltCeilings"></p></section>
    <details class="lt-details" id="ltReceipt"><summary>SHOW RECEIPT</summary><p id="ltReceiptScope">No scene has been checked. Receipts describe local fictional analysis, not a provider observation or a release.</p><pre id="ltReceiptJson">No receipt yet.</pre><div class="lt-evidence"><button type="button" id="ltDownload" disabled>DOWNLOAD REPLAY PACKET</button><button type="button" id="ltLoad" disabled>LOAD CASE INTO CHECKER</button></div><p class="ceiling">Loading fills the real checker below; it does not press CHECK, copy a message, or send anything.</p></details>
    <p class="lt-ceiling"><strong>The horizon does not open.</strong> GREEN only means no enabled rule fired. Modeled weather is dashed; unknown links stay broken. This theater cannot earn origin, attribution, provider access, deployment authority, or human comprehension.</p>`;

  const $ = selector => root.querySelector(selector);
  const svgNode = (tag, attributes, parent) => {
    const node = doc.createElementNS(xml, tag);
    for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, value);
    parent.append(node); return node;
  };
  const weather = Array.from({ length: 10 }, () => svgNode('path', { class: 'lt-weather' }, $('#ltWeather')));
  const strands = Array.from({ length: 3 }, () => svgNode('path', { class: 'lt-custody' }, $('#ltStrands')));
  const sceneButtons = LOOM_DEMO_SCENES.map((scene, index) => {
    const button = doc.createElement('button');button.type = 'button';button.dataset.scene = index;
    button.setAttribute('aria-label', `Scene ${index + 1}: ${scene.title}`);
    const number = doc.createElement('span');number.textContent = String(index + 1).padStart(2, '0');
    const label = doc.createElement('span');label.textContent = sceneLabels[index];button.append(number, label);
    $('.lt-scenes').append(button);return button;
  });
  const motionQuery = environment.matchMedia('(prefers-reduced-motion: reduce)');
  let index = -1, packet = null, receiver = 'LOCAL', view = 'child', autoplay = false, tourTimer = null;
  let intersecting = true, destroyed = false, lastProjection = null;
  const visits = []; // Actual gestures in this session, separate from the declared scene sequence.
  const listeners = [];
  const listen = (target, name, fn) => {target.addEventListener(name, fn);listeners.push(() => target.removeEventListener(name, fn));};
  function clearTour(){if(tourTimer!==null)environment.clearTimeout(tourTimer);tourTimer=null;}
  function stopTour(){autoplay=false;clearTour();$('#ltPlay').textContent='PLAY DEMO';}
  const coordinator = new AnimationCoordinator({
    requestFrame: fn => environment.requestAnimationFrame(fn), cancelFrame: id => environment.cancelAnimationFrame(id),
    now: () => environment.performance.now(), durationMs: 3600, maxFps: 30,
    onState(state){
      root.dataset.pendingFrames=String(state.pendingFrames);root.dataset.clockPlaying=String(state.playing);
      root.dataset.reducedMotion=String(state.reducedMotion);
      $('#ltRuntime').textContent=`${state.playing?'Playing':packet?.geometry.rest?'Structural rest':'Clock settled'} · ${state.pendingFrames} pending frames${autoplay?' · guided tour':''}`;
      if(autoplay&&!state.playing&&state.timeMs===state.durationMs&&!state.reducedMotion&&!packet?.geometry.rest&&state.visible&&tourTimer===null){
        // A scene dwell timer is not an animation loop. No frames run while reading.
        tourTimer=environment.setTimeout(()=>{tourTimer=null;if(autoplay)loadScene(index+1,true);},9500);
      }
    }
  });

  coordinator.registerPass('information-geometry', snapshot => {
    const g = projectLoomGeometry(snapshot);lastProjection=g;root.style.setProperty('--field-accent',g.color);
    $('#ltRoute').setAttribute('d',g.route);$('#ltRoute').setAttribute('pathLength','1');
    $('#ltRoute').setAttribute('stroke-dasharray',`${g.progress} 1`);
    $('#ltAlternative').setAttribute('d',g.alternative);$('#ltAlternative').setAttribute('opacity',String(g.progress));
    strands.forEach((node,i)=>{node.setAttribute('d',g.strands[i]);node.setAttribute('opacity',String(.18+.5*g.progress));});
    weather.forEach((node,i)=>{node.setAttribute('d',g.weather[i]);node.setAttribute('opacity',String(g.pressure*.6*g.progress));node.setAttribute('stroke-dasharray',g.modeled?'4 7':'none');});
    $('#ltSeam').toggleAttribute('hidden',!g.missing);
    $('#ltGate').setAttribute('d',g.blocked?'M588,178 L588,256':`M588,154 V${227-g.gateGap} M588,${227+g.gateGap} V297`);
    $('#ltGate').setAttribute('stroke-dasharray',g.blocked?'none':'3 6');
    $('#ltTraveller').removeAttribute('hidden');$('#ltTraveller').setAttribute('cx',g.point.x);$('#ltTraveller').setAttribute('cy',g.point.y);
  });
  coordinator.registerPass('replay-cursor', snapshot => {
    $('#ltTime').value=String(snapshot.timeMs);$('#ltTimeLabel').textContent=`${(snapshot.timeMs/1000).toFixed(1)} / 3.6 s`;
    root.dataset.replayTime=String(snapshot.timeMs);
  });
  coordinator.registerPass('causal-inspection', snapshot => {
    root.dataset.scene=snapshot.packet.scene.id;root.dataset.ruleStatus=snapshot.packet.analysis.status;
    root.dataset.alertClass=snapshot.packet.alert.alert_class;root.dataset.snapshotSeed=String(snapshot.seed);
  });

  function receiptEnvelope(){return {
    schema:'td613.loom.theater-replay/v0.1', receiver,
    source_binding:'working-tree: exact implementation source must be bound by the separate PR/source receipt',
    replay:{time_ms:coordinator.inspect().timeMs,duration_ms:3600,seed:root.dataset.snapshotSeed,visits:visits.map(visit=>({...visit})),visits_are:'explicit local UI gestures, not external evidence'},
    ...(receiver==='PORTABLE'?{portable:createLoomPortablePacket(packet)}:{semantic_field:packet}),
    renderer_authority:false,release_performed:false,provider_calls:0
  };}
  function updateReceipt(){if(packet)$('#ltReceiptJson').textContent=pretty(receiptEnvelope());}
  function projectText(){
    if(!packet)return;
    const p=packet;
    $('#ltTitle').textContent=p.scene.title;$('#ltConsequence').textContent=p.scene.consequence;
    $('#ltTag').textContent=`${index+1} / 8 · ${p.alert.observed_vs_modeled==='MODELED_DEMO'?'MODELED WARNING':p.analysis.status+' RULE RESULT'} · ${receiver.toLowerCase()} practice`;
    $('#ltWhyText').textContent=p.scene.why;
    $('#ltStatic').textContent=`Without motion: ${p.scene.consequence} ${p.scene.next}`;
    $('#ltGraphicDescription').textContent=`${p.scene.consequence} ${p.scene.why} The claim ceiling is closed. Missingness remains a visible gap.`;
    $('#ltRelation').textContent=p.geometry.route==='return'?'Return curve ← exact, user-declared journey matches':p.geometry.route==='fork'?'Both rule outcomes retained · missing link not inferred':'Attached strands ← declared fictional context only';
    $('#ltGeometryNote').textContent=p.geometry.rest?'REST · no frames needed':p.alert.observed_vs_modeled==='MODELED_DEMO'?'DASHED WEATHER · teaching model, not measurement':p.geometry.missingness.length?'GAP = MISSING · alternate result retained':!p.analysis.release_boundary.raw_release_allowed?'CLOSED DOOR · enabled rule blocks original':'ENABLED RULES ONLY · no downstream promise';
    const descriptor=HOLONOMY_LOOM_MOTION_DESCRIPTORS[p.flow_core.phase];
    $('#ltPhaseGlyph').textContent=descriptor?.glyph||'à';
    $('#ltMotionCauses').replaceChildren();
    const causes=[
      ...p.flow_core.glyph_relations.map(key=>`${HOLONOMY_LOOM_MOTION_DESCRIPTORS[key].glyph} — ${HOLONOMY_LOOM_MOTION_DESCRIPTORS[key].semantic_relation}`),
      `Route geometry: ${p.geometry.route}; basis: ${p.analysis.receipt.route_memory_relation_count} declared relation(s). This is explanatory geometry, not geometric holonomy.`,
      `Weather: ${p.alert.alert_class}; ${p.alert.observed_vs_modeled}. Pressure width is a declared teaching scale, not a probability.`,
      'Horizon: fixed claim ceiling; no animation opens an empirical boundary.',
      ...p.geometry.missingness, ...p.geometry.contradictions
    ];
    for(const cause of causes){const item=doc.createElement('li');item.textContent=cause;$('#ltMotionCauses').append(item);}
    $('#ltFacts').replaceChildren();
    const facts={
      'Evidence class':p.alert.observed_vs_modeled,'Rule result / alert':`${p.analysis.status} / ${p.alert.alert_class} (${p.alert.severity})`,
      'Source ownership':p.source.ownership,'Source revision':p.source.revision,
      'Route / custody':`${p.geometry.route} / ${p.geometry.custody} (fictional context)`,
      'Release boundary':p.analysis.release_boundary.raw_release_allowed?'No rule blocked this fictional input; theater still has no release action':'Original blocked by the real checker',
      'V · C · P · L':Object.entries(p.distinctions).map(([k,v])=>`${k}: ${v}`).join(' · '),
      'Uncertainty':typeof p.alert.uncertainty==='string'?p.alert.uncertainty:pretty(p.alert.uncertainty)
    };
    for(const [key,value] of Object.entries(facts)){const row=doc.createElement('div'),dt=doc.createElement('dt'),dd=doc.createElement('dd');dt.textContent=key;dd.textContent=value;row.append(dt,dd);$('#ltFacts').append(row);}
    $('#ltCeilings').textContent=p.claim_ceiling.join(' · ');
    $('#ltReceiptScope').textContent=`${receiver} receiver · ${p.receipt.checksum}. Replay checksum detects accidental changes; it is not authentication. Exact source binding is still working-tree, not an earned commit claim.`;
    sceneButtons.forEach((button,i)=>{if(i===index)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current');});
    updateReceipt();
  }
  function loadScene(next, continuing=false){
    clearTour();if(!continuing)stopTour();
    index=Math.max(0,Math.min(7,next));
    const candidate=compileLoomDemoScene(index);
    const validation=validateLoomSemanticField(candidate);
    if(!validation.valid)throw new Error(`Loom semantic admission held: ${validation.errors.join('; ')}`);
    packet=candidate;visits.push({ordinal:visits.length,scene_id:packet.scene.id,action:continuing?'explicitly_started_tour':'scene_selection'});
    if(visits.length>128)visits.shift();
    if(packet.geometry.rest)stopTour();
    doc.dispatchEvent(new environment.CustomEvent('loom-theater-active'));
    for(const id of ['ltReplay','ltPause','ltDownload','ltLoad','ltTime'])$('#'+id).disabled=false;
    coordinator.setPacket(packet,{animate:true});projectText();
  }
  function setMotion(){const reduced=motionQuery.matches||$('#ltReduced').checked;if(reduced)stopTour();coordinator.setReducedMotion(reduced);}
  listen($('#ltPlay'),'click',()=>{stopTour();autoplay=!motionQuery.matches&&!$('#ltReduced').checked;$('#ltPlay').textContent=autoplay?'TOUR RUNNING':'PLAY DEMO';loadScene(0,autoplay);});
  listen($('#ltNext'),'click',()=>loadScene(index<7?index+1:0));
  sceneButtons.forEach((button,i)=>listen(button,'click',()=>loadScene(i)));
  listen($('#ltReplay'),'click',()=>{stopTour();if(packet){visits.push({ordinal:visits.length,scene_id:packet.scene.id,action:'replay'});coordinator.seek(0);coordinator.play();updateReceipt();}});
  listen($('#ltPause'),'click',()=>{stopTour();coordinator.pause();updateReceipt();});
  listen($('#ltRest'),'click',()=>loadScene(7));
  listen($('#ltTime'),'input',()=>{stopTour();coordinator.seek(Number($('#ltTime').value));updateReceipt();});
  listen($('#ltReduced'),'change',()=>{setMotion();updateReceipt();});
  listen(motionQuery,'change',setMotion);
  listen($('#ltPortable'),'change',()=>{receiver=$('#ltPortable').checked?'PORTABLE':'LOCAL';projectText();});
  root.querySelectorAll('[data-view]').forEach(button=>listen(button,'click',()=>{view=button.dataset.view;root.querySelectorAll('[data-view]').forEach(node=>node.setAttribute('aria-pressed',String(node.dataset.view===view)));$('#ltAudit').hidden=view!=='auditor';}));
  listen($('#ltReceipt'),'toggle',()=>{if($('#ltReceipt').open)updateReceipt();});
  listen($('#ltLoad'),'click',()=>{stopTour();coordinator.pause();doc.dispatchEvent(new environment.CustomEvent('loom-practice-load',{detail:getLoomDemoInput(index)}));});
  listen($('#ltDownload'),'click',()=>{
    if(!packet)return;updateReceipt();
    const blob=new environment.Blob([pretty(receiptEnvelope())+'\n'],{type:'application/json'}),url=environment.URL.createObjectURL(blob);
    const link=doc.createElement('a');link.href=url;link.download=`loom-practice-${packet.scene.id}-replay.json`;link.click();
    environment.setTimeout(()=>environment.URL.revokeObjectURL(url),0);
  });
  listen($('#ltReset'),'click',()=>{destroy();mountLoomTheater(root,environment);});
  const realCheck=doc.querySelector('#check');if(realCheck)listen(realCheck,'click',()=>{stopTour();coordinator.pause();});
  function visibility(){clearTour();coordinator.setVisible(!doc.hidden&&intersecting);}
  listen(doc,'visibilitychange',visibility);
  const observer=environment.IntersectionObserver?new environment.IntersectionObserver(entries=>{intersecting=entries[0].isIntersecting;visibility();},{threshold:0}):null;observer?.observe(root);
  const resize=()=>{const bounds=root.getBoundingClientRect();coordinator.setViewport({width:Math.max(1,bounds.width),height:Math.max(1,bounds.height),dpr:Math.min(3,environment.devicePixelRatio||1)});};
  const resizeObserver=environment.ResizeObserver?new environment.ResizeObserver(resize):null;resizeObserver?.observe(root);
  listen(environment,'pagehide',()=>{stopTour();coordinator.setVisible(false);});
  listen(environment,'pageshow',visibility);
  function destroy(){if(destroyed)return;destroyed=true;stopTour();observer?.disconnect();resizeObserver?.disconnect();listeners.forEach(remove=>remove());coordinator.destroy();}
  setMotion();resize();visibility();
  return Object.freeze({destroy,inspect:()=>({index,receiver,view,autoplay,packet,projection:lastProjection,clock:coordinator.inspect()})});
}

if(typeof document!=='undefined'){
  const root=document.querySelector('#loomTheater');
  if(root)try{mountLoomTheater(root);}catch(error){
    root.replaceChildren();const notice=document.createElement('p');notice.className='lt-theater-error';notice.textContent='Practice theater HELD: it could not initialize. The message checker below is still available. No practice receipt was earned.';root.append(notice);
    console.error('Loom theater initialization held',error);
  }
}
