/** The Loom room is a projection of client route events, never provider thoughts.
 * One retained SVG, no clocks, no network and no reads of document bodies.
 */
import { projectLivingRoomState } from './living-room-state.js';
let roomSequence = 0;

export function mountLivingRoom(host) {
  if (!host?.ownerDocument) throw new TypeError('A living room needs a DOM host');
  const prefix = `loom-room-${++roomSequence}`;
  host.classList.add('loom-living-room');
  host.innerHTML = `<div class="lr-scene-heading"><p class="lr-eyebrow">YOUR TASK HAS A ROUTE</p><h3 data-room="title">Your AI workspace</h3></div>
  <svg class="lr-world" viewBox="0 0 760 430" role="img" aria-labelledby="${prefix}-title ${prefix}-description">
    <title id="${prefix}-title">Your documents, their rule gate, and the AI receiver</title><desc id="${prefix}-description" data-room="description"></desc>
    <defs>
      <linearGradient id="${prefix}-floor" x2="0" y2="1"><stop stop-color="#3e267d"/><stop offset="1" stop-color="#151338"/></linearGradient>
      <linearGradient id="${prefix}-glass" x2="1" y2="1"><stop stop-color="#795bea" stop-opacity=".6"/><stop offset="1" stop-color="#221741" stop-opacity=".9"/></linearGradient>
      <linearGradient id="${prefix}-paper" x2="0" y2="1"><stop stop-color="#fff0bf"/><stop offset="1" stop-color="#e9b46b"/></linearGradient>
      <linearGradient id="${prefix}-ribbon"><stop stop-color="#e4ad68"/><stop offset=".5" stop-color="#e978ce"/><stop offset="1" stop-color="#b0a2ff"/></linearGradient>
      <pattern id="${prefix}-tiles" width="44" height="28" patternUnits="userSpaceOnUse"><path d="M0 14 22 0 44 14 22 28Z" fill="none" stroke="#c6b6fa" stroke-opacity=".09"/></pattern>
    </defs>
    <path d="M25 283Q30 359 126 385L622 385Q730 366 738 281L639 221 124 224Z" fill="url(#${prefix}-floor)" stroke="#a98ae3" stroke-opacity=".35"/>
    <path d="M25 283Q30 359 126 385L622 385Q730 366 738 281L639 221 124 224Z" fill="url(#${prefix}-tiles)"/>
    <path d="M28 263Q36 35 179 40Q275 23 338 92M422 92Q486 22 598 39Q730 32 735 263" fill="none" stroke="#9573de" stroke-opacity=".2" stroke-width="2"/>
    <path d="M47 263Q79 62 183 66M713 263Q682 61 592 65" fill="none" stroke="#db79ce" stroke-opacity=".15"/>
    <g class="lr-source">
      <ellipse cx="134" cy="249" rx="99" ry="29" fill="#0a0b23" opacity=".65"/>
      <path d="M49 220 136 190 224 220 135 252Z" fill="#574781" stroke="#c4acf8"/>
      <path d="M49 220v21l86 32v-21M224 220v21l-89 32" fill="#24213e" stroke="#8275ac"/>
      <g data-room="papers"></g>
      <g data-room="gather" transform="translate(193 124)"><circle r="23" fill="#311e50" stroke="#eabe7c"/><text class="lr-glyph" y="8">à</text></g>
      <text class="lr-world-label" x="133" y="287">YOUR POCKET</text>
    </g>
    <g class="lr-private-pocket">
      <path d="M53 324Q133 311 213 324L203 367Q133 387 63 367Z" fill="#332042" stroke="#f1ca83" stroke-width="2"/>
      <path d="M59 323Q133 355 207 323" fill="none" stroke="#e9bc76" stroke-width="2"/>
      <path d="M95 325v-19q0-18 16-18h40q16 0 16 18v19" fill="none" stroke="#a697c5" stroke-width="4"/>
      <rect x="116" y="338" width="34" height="28" rx="8" fill="#eed69a"/><path d="M128 349h10m-5-4v10" stroke="#53334e" stroke-width="2"/>
      <text class="lr-private-glyph" x="183" y="359">cōl</text>
      <text class="lr-small-label" x="133" y="406" data-room="local-count">0 stay in this tab</text>
    </g>
    <g class="lr-route">
      <path d="M205 177C277 98 459 98 549 177" fill="none" stroke="#392556" stroke-width="21"/>
      <path data-room="outgoing" d="M205 177C277 98 459 98 549 177" fill="none" stroke="url(#${prefix}-ribbon)" stroke-width="4" stroke-dasharray="4 9"/>
      <path d="m526 155 22 22-29-4" fill="none" stroke="#b7a0ff" stroke-width="3" opacity=".5"/>
      <text class="lr-small-label" x="378" y="72" data-room="route-label">Waiting for your click</text>
    </g>
    <g class="lr-gate">
      <ellipse cx="378" cy="226" rx="60" ry="18" fill="#0b0925" opacity=".6"/>
      <path d="M338 222V124q0-48 40-48t40 48v98" fill="none" stroke="#28213d" stroke-width="20"/>
      <path d="M338 222V124q0-48 40-48t40 48v98" fill="none" stroke="#d5b47a" stroke-width="6"/>
      <path d="M346 222V126q0-38 32-38t32 38v96" fill="url(#${prefix}-glass)" stroke="#a488e7" stroke-opacity=".65"/>
      <path data-room="gate-bars" d="M346 147h64M346 163h64M346 179h64" fill="none" stroke="#f0ca80" stroke-width="5" stroke-linecap="round"/>
      <circle cx="378" cy="94" r="15" fill="#eacb8d"/><path d="m371 94 5 5 9-11" fill="none" stroke="#453255" stroke-width="3"/>
      <text class="lr-world-label" x="378" y="258">RULE GATE</text>
      <text class="lr-small-label" x="378" y="280" data-room="rule-count">Rules travel with the task</text>
    </g>
    <g data-room="courier" class="lr-courier" transform="translate(205 177)">
      <path d="m-25-15 10-10h35v41h-45Z" fill="url(#${prefix}-paper)" stroke="#e5b476" stroke-width="2"/>
      <path d="m-25-15 24 17 21-17" fill="none" stroke="#985583" stroke-width="2"/>
      <path d="M-3-24v42" stroke="#b544a6" stroke-width="5"/><circle cy="1" r="8" fill="#42215c" stroke="#d990ca"/>
      <path d="m-22 18-7 7m44-7 7 7" stroke="#edd4a2" stroke-width="3" stroke-linecap="round"/>
      <circle cx="-13" cy="-6" r="2" fill="#332042"/><circle cx="13" cy="-6" r="2" fill="#332042"/>
    </g>
    <g class="lr-receiver">
      <ellipse cx="621" cy="256" rx="97" ry="29" fill="#090b23" opacity=".7"/>
      <path d="M545 215v-64q0-67 75-67t75 67v64q-75 35-150 0Z" fill="url(#${prefix}-glass)" stroke="#b5a1f0" stroke-width="2"/>
      <path d="M553 210q67 25 134 0M570 133q50-77 100 0M584 210V123m72 87v-87" fill="none" stroke="#9e82d1" stroke-opacity=".32"/>
      <path d="M540 218 622 193 707 219 622 249Z" fill="#79618e" stroke="#c8a6d9"/>
      <path d="M540 218v14l82 29v-12m85-30v14l-85 28" fill="#332241" stroke="#a483b3"/>
      <g data-room="lantern" transform="translate(620 161)"><path d="M-31 18v-28q0-27 31-27t31 27v28Z" fill="#271e40" stroke="#e4ba89" stroke-width="2"/><ellipse cy="18" rx="31" ry="10" fill="#a169ac"/><circle data-room="lantern-light" cy="-7" r="16" fill="#d0b4fa" opacity=".25"/><text class="lr-glyph" y="0" data-room="receiver-glyph">?</text></g>
      <circle data-room="waiting-ring" cx="620" cy="154" r="42" fill="none" stroke="#edb3df" stroke-width="2" stroke-dasharray="5 13" opacity="0"/>
      <text class="lr-world-label" x="621" y="286">AI RECEIVER</text>
      <text class="lr-small-label" x="621" y="309" data-room="receiver-label">Nothing sent yet</text>
    </g>
    <g data-room="reply" class="lr-reply">
      <path data-room="return-path" pathLength="1" d="M596 329Q489 390 299 329" fill="none" stroke="#e4b9d9" stroke-width="4"/>
      <g data-room="return-gaps"></g>
      <g data-room="answer-tray" transform="translate(378 353)"><ellipse rx="62" ry="15" fill="#2b1c3d" stroke="#baa0d2"/><path d="M-38-13h76v19q-38 14-76 0Z" fill="#56374f" stroke="#deb48b"/><path d="M-28-38h56v36h-56Z" fill="url(#${prefix}-paper)" stroke="#e9cb99"/><path d="M-18-28h32m-32 9h25m-25 9h34" stroke="#8c5678" stroke-width="3" stroke-linecap="round"/></g>
      <text class="lr-small-label" x="378" y="406" data-room="reply-label">Answer ready for you</text>
    </g>
    <g data-room="held-mark" transform="translate(378 170)"><circle r="30" fill="#4b183d" stroke="#ffaaa0" stroke-width="3"/><path d="M-12-12 12 12m0-24-24 24" stroke="#ffd3b6" stroke-width="5" stroke-linecap="round"/></g>
  </svg>
  <div class="lr-station-captions"><p><strong>Your pocket</strong><span data-room="source-caption"></span></p><p><strong>The rule gate</strong><span data-room="gate-caption"></span></p><p><strong>The AI desk</strong><span data-room="receiver-caption"></span></p></div>
  <p class="lr-now" data-room="now" aria-live="polite"></p><p class="lr-why" data-room="why"></p>
  <details class="lr-cause"><summary>Why did the room move?<span aria-hidden="true">+</span></summary><p data-room="audit"></p><p class="lr-legend">à gathers selected material · cōl keeps the local pocket intact · 出 marks an actual route crossing · 𝄐 settles the relation.</p></details>`;
  const nodes = Object.fromEntries([...host.querySelectorAll('[data-room]')].map(node => [node.dataset.room, node]));
  let disposed = false, lastPacket = null, lastAuditor = null;
  const setText = (key, value) => { if (nodes[key].textContent !== value) nodes[key].textContent = value; };
  const visible = (key, value) => { attr(key,'visibility',value ? 'visible' : 'hidden'); };
  const attr = (key, name, value) => { const next=String(value); if(nodes[key].getAttribute(name)!==next) nodes[key].setAttribute(name,next); };
  function render(snapshot) {
    if (disposed) return;
    const state = projectLivingRoomState(snapshot.packet, snapshot);
    renderState(state, snapshot);
  }
  function renderState(state, snapshot) {
    // The projector owns every authority-bearing predicate; the renderer owns pixels only.
    const packet = snapshot.packet;
    if(host.dataset.phase !== state.phase) host.dataset.phase = state.phase;
    if (packet !== lastPacket || lastAuditor !== snapshot.auditor) {
      lastPacket = packet; lastAuditor = snapshot.auditor;
      const copy = snapshot.auditor ? state.copy.auditor : state.copy.plain;
      setText('title', Array.from(typeof packet.scene?.project_title === 'string' ? packet.scene.project_title : 'Your AI workspace').slice(0, 90).join(''));
      setText('description', `${copy.now} ${copy.why} ${copy.next}`);
      setText('local-count', `${state.localCount} stay in this tab`);
      setText('rule-count', `${state.rulesCount} rules travel with the task`);
      setText('source-caption', `${state.selectedCount} selected · ${state.localCount} ${state.localCount === 1 ? 'stays' : 'stay'} here`);
      setText('gate-caption', state.gate.label);
      setText('receiver-caption', state.provider.label);
      setText('now', copy.now); setText('why', `${copy.why} ${copy.next}`);
      setText('audit', `${state.copy.auditor.why} ${state.copy.auditor.next}`);
      setText('route-label', state.held ? 'This route stopped' : state.outgoingSubmitted ? 'Selected packet submitted' : 'Waiting for your click');
      setText('receiver-label', state.providerFailure ? 'Provider failure · no answer' : state.responseObserved ? 'AI answer observed' : state.phase==='pending' ? 'Waiting · activity unknown' : 'Nothing received yet');
      setText('reply-label', state.held ? 'Return held' : state.phase==='received' ? 'Checking the returned work' : state.missingCount ? `${state.missingCount} open questions remain` : 'Ready for your review');
      nodes.papers.replaceChildren();
      const documents = state.documents;
      const count = Math.min(4, documents.length);
      for (let index=0;index<count;index++) {
        const group = host.ownerDocument.createElementNS('http://www.w3.org/2000/svg','g');
        group.setAttribute('transform', `translate(${82+index*20} ${134+Math.abs(index-(count-1)/2)*7}) rotate(${(index-(count-1)/2)*7} 27 42)`);
        group.innerHTML='<rect width="55" height="78" rx="7" fill="#f5dba0" stroke="#a47789" stroke-width="2"/><path d="M10 14h35M10 22h26M10 30h31" stroke="#ab758c" stroke-width="3"/><circle cx="20" cy="51" r="2" fill="#442645"/><circle cx="35" cy="51" r="2" fill="#442645"/><path d="M23 60q5 4 9 0" fill="none" stroke="#7f4164" stroke-width="2"/>';
        const title=host.ownerDocument.createElementNS('http://www.w3.org/2000/svg','title'); title.textContent=documents[index].name; group.append(title); nodes.papers.append(group);
      }
      if(!count){ const empty=host.ownerDocument.createElementNS('http://www.w3.org/2000/svg','text'); empty.setAttribute('x','133');empty.setAttribute('y','203');empty.setAttribute('class','lr-small-label');empty.textContent='Your task';nodes.papers.append(empty); }
      // Cut the returning strand itself: missingness remains an actual gap.
      const gapCount=Math.min(5,state.missingCount ?? 0), intervals=[];
      let start=0;
      for(let index=0;index<gapCount;index++){const mid=.12+.76*(index+1)/(gapCount+1);intervals.push([start,mid-.023]);start=mid+.023;}
      intervals.push([start,1]);
      const point=t=>[596*(1-t)**2+2*489*t*(1-t)+299*t*t,329*(1-t)**2+2*390*t*(1-t)+329*t*t];
      const path=intervals.map(([a,b])=>Array.from({length:12},(_,index)=>{const [x,y]=point(a+(b-a)*index/11);return `${index?'L':'M'}${x.toFixed(2)} ${y.toFixed(2)}`;}).join(' ')).join(' ');
      attr('return-path','d',path);

    }
    const moving=state.motion.enabled;
    const t=state.motion.courierProgress;
    const x=(1-t)**2*205+2*(1-t)*t*330+t*t*466;
    const y=(1-t)**2*177+2*(1-t)*t*69+t*t*144;
    attr('courier','transform',`translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${moving?((t-.5)*16).toFixed(2):0})`);
    visible('courier',state.outgoingSubmitted && !state.responseObserved);
    attr('answer-tray','transform',`translate(${378+(1-state.motion.returnProgress)*216} ${353-(1-state.motion.returnProgress)*23})`);
    visible('reply',state.responseObserved);
    visible('held-mark',state.held);
    visible('gate-bars',!(state.outgoingSubmitted && !state.held));
    attr('outgoing','stroke-dasharray',state.outgoingSubmitted?'none':'4 9');
    attr('outgoing','opacity',state.held?'.25':'.8');
    attr('waiting-ring','opacity',(state.phase==='pending')?'.75':'0');
    attr('waiting-ring','transform',`rotate(${state.motion.waitingPhase*360} 620 154)`);
    attr('lantern-light','opacity',(state.phase==='pending')?(.45+.15*Math.sin(state.motion.waitingPhase*Math.PI*2)).toFixed(3):state.responseObserved?'.75':'.2');
    setText('receiver-glyph',state.settled && !moving ? '𝄐' : state.responseObserved ? '出' : '?');
    attr('return-path','stroke-dasharray','1');
    attr('return-path','stroke-dashoffset',(1-state.motion.returnProgress).toFixed(3));
    attr('gather','transform',`translate(193 ${124+(moving&&state.phase==='checking'?Math.sin(snapshot.progress*Math.PI)*-8:0)})`);
    if(host.dataset.roomReady !== 'true') host.dataset.roomReady='true';
  }
  return {render,dispose(){disposed=true;host.replaceChildren();host.classList.remove('loom-living-room');delete host.dataset.roomReady;}};
}
