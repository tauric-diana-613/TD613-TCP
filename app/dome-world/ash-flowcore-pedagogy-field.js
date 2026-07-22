import { renderPedagogueScene, renderPedagogueStaticFrame } from './flowcore-pedagogue-visual.js';

export const ASH_FLOWCORE_FIELD_VERSION = 'td613.ash.flowcore-pedagogy-field/v0.2-consequence-topology-syntax-closed';

const host = globalThis.window;
const doc = globalThis.document;
const STYLE_URL = '/dome-world/ash-flowcore-pedagogy-field.css?v=20260721-flowcore-live-field-v2';
const POINTER_KEY = 'td613.ash-keep.current-case';

const PHASES = Object.freeze([
  Object.freeze({ id:'NOTICE', relation:'gathering-and-accumulated-obligation', glyph:'à', consequence:'Notice the local source before any custody claim.', technical:'Visible condition · source remains on this device.' }),
  Object.freeze({ id:'ACT', relation:'created-potential', glyph:'上', consequence:'The boundary blocks raw bytes; only a deliberate metadata posture may approach it.', technical:'Action boundary · raw bytes do not cross.' }),
  Object.freeze({ id:'WORLD_ANSWERS', relation:'release-and-transformation', glyph:'出', consequence:'A reference can form without becoming the artifact.', technical:'World answer · reference ≠ artifact.' }),
  Object.freeze({ id:'NAME', relation:'recurrence-and-authored-structure', glyph:'米', consequence:'Ash names only the preserved relations, seams, and missingness that the exact state supports.', technical:'Relation field · topology without authority inflation.' }),
  Object.freeze({ id:'REST', relation:'structural-rest', glyph:'𝄐', consequence:'Demand stops. The complete field remains inspectable and return stays available.', technical:'Structural rest · no new action, transport, or closure.' })
]);

let field = null;
let phase = 0;
let lastFrame = null;
let mounting = false;
let stageObserver = null;
let phaseObserver = null;

const reducedMotion = () => host?.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;

function ensureStyle() {
  if (!doc?.head || doc.querySelector('link[data-ash-flowcore-field-style]')) return;
  const link = doc.createElement('link');
  link.rel = 'stylesheet';
  link.href = STYLE_URL;
  link.dataset.ashFlowcoreFieldStyle = 'true';
  doc.head.append(link);
}

function lifecycleState() {
  const live = host?.__td613AshLiveAIA?.current?.()?.lifecycle_state;
  if (live) return live;
  try {
    return JSON.parse(doc?.getElementById('lifecycleReceipt')?.textContent || 'null')?.lifecycle?.state || 'ARRIVAL_UNPERSISTED';
  } catch {
    return 'ARRIVAL_UNPERSISTED';
  }
}

function caseOpen() {
  try { return Boolean(host?.localStorage?.getItem(POINTER_KEY)); }
  catch { return false; }
}

function governedScene(nextPhase) {
  const exactState = lifecycleState();
  const selected = PHASES[nextPhase] || PHASES[0];
  const route = host?.__td613AshLiveAIA?.current?.()?.route || 'EXPERIENTIAL';
  const sceneId = `ash_flowcore_${exactState.toLowerCase()}`;
  const missingness = exactState === 'ARRIVAL_UNPERSISTED'
    ? ['No readiness receipt yet.','No custody reference yet.','No Case Map binding yet.']
    : [];
  const scene = {
    scene_id:sceneId,
    station_owner:'ASH_KEEP',
    visible_condition:{ plain_language:selected.consequence, source_status:'OBSERVED_PRESENTATION_STATE' },
    causal_structure:{ operator:'ASH_LIFECYCLE_PRESENTATION' },
    route_topology:{
      route,
      nodes:['local_source','raw_byte_boundary','reference','case_map_relation_field','rest'],
      edges:['source_to_boundary','metadata_to_reference','reference_to_relation_field'],
      raw_bytes_cross:false
    },
    contradictions:[],
    missingness,
    available_affordances:['Play explanation','Previous lesson','Next lesson','Rest','Return','Close Case'],
    claim_ceiling:{
      allowed_claims:['presentation of exact Ash lifecycle posture','reference remains distinct from artifact','human closure remains open'],
      forbidden_claims:['truth','identity','authorship','intent','automatic custody','automatic transport','automatic release']
    },
    authority:{ human_closure_required:true, automatic_ash_action:false },
    closure:{ status:'OPEN', closed_by:null }
  };
  const transition = {
    transition_id:`${sceneId}_${selected.id.toLowerCase()}`,
    scene_reference:sceneId,
    name:{ glyph_relation:selected.relation, plain_language:selected.consequence, technical_term:selected.technical },
    selected_action:{ action_id:'EXPLICIT_PLAY_EXPLANATION' },
    causal_trace:[
      { step:'NOTICE_LOCAL_SOURCE' },
      { step:'KEEP_RAW_BYTES_LOCAL' },
      { step:'DISTINGUISH_REFERENCE_FROM_ARTIFACT' },
      { step:'SHOW_RELATION_AND_MISSINGNESS' },
      { step:'REST_WITH_FIELD_INSPECTABLE' }
    ],
    contradictions:[],
    missingness,
    unresolved_relations:exactState === 'ARRIVAL_UNPERSISTED' ? ['future custody and Case Map relations remain unearned'] : [],
    authorized_actions:[],
    glyph_candidates:[selected.relation],
    static_equivalent:{ summary:selected.consequence, steps:PHASES.map(item => `${item.id}: ${item.consequence}`) },
    authority:{ human_closure_required:true, automatic_ash_action:false },
    closure:{ status:'OPEN', closed_by:null }
  };
  return { scene, transition };
}

function compileFrame(nextPhase) {
  const { scene, transition } = governedScene(nextPhase);
  const viewport = {
    width:Math.max(320, field?.clientWidth || host?.innerWidth || 1120),
    height:Math.max(320, field?.clientHeight || 420),
    devicePixelRatio:Math.min(host?.devicePixelRatio || 1, 2)
  };
  const preferences = { reducedMotion:reducedMotion(), activeViewId:'ash-live-field' };
  return reducedMotion()
    ? renderPedagogueStaticFrame('ash-live-field', scene, transition, viewport, preferences)
    : renderPedagogueScene('ash-live-field', scene, transition, viewport, nextPhase, preferences);
}

function fieldMarkup() {
  const staticSteps = PHASES.map((item,index) => `
    <li data-static-phase="${index}"><span>${index + 1}</span><div><strong>${item.id.replaceAll('_',' ')}</strong><p>${item.consequence}</p></div><b>${item.glyph}</b></li>`).join('');
  return `
    <section class="ash-flowcore-field" data-flowcore-phase="0" data-flowcore-playing="false" aria-labelledby="ashFlowcoreTitle">
      <header class="ash-flowcore-field__header">
        <div><p class="ash-flowcore-field__eyebrow">Flow-Core consequence field · motion encodes relation</p><h4 id="ashFlowcoreTitle">Local source → lawful boundary → reference → relation → rest</h4></div>
        <output class="ash-flowcore-field__phase" data-flowcore-phase-label>NOTICE · à</output>
      </header>
      <div class="ash-flowcore-field__canvas" data-flowcore-canvas>
        <svg viewBox="0 0 1000 400" role="img" aria-labelledby="ashFlowcoreSvgTitle ashFlowcoreSvgDesc" preserveAspectRatio="xMidYMid meet">
          <title id="ashFlowcoreSvgTitle">Flow-Core Ash consequence topology</title>
          <desc id="ashFlowcoreSvgDesc">A local source remains on this device. Raw bytes stop at a boundary. A separate reference may form after a deliberate lawful action. The reference is not the artifact. Preserved relations may appear in the Case Map while missingness and authority limits remain visible. The field then rests without closing the human.</desc>
          <defs>
            <pattern id="ashFlowGrid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" fill="none" stroke="currentColor" stroke-opacity=".055"/></pattern>
            <marker id="ashFlowArrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="currentColor"/></marker>
            <filter id="ashFlowGlow"><feGaussianBlur stdDeviation="4" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            <clipPath id="ashFlowRightClip"><rect x="612" y="28" width="360" height="320" rx="26"/></clipPath>
          </defs>
          <rect class="ash-flowcore-grid" x="0" y="0" width="1000" height="400" fill="url(#ashFlowGrid)"/>
          <g class="ash-flowcore-source" data-flowcore-organ="source">
            <rect class="ash-flowcore-chamber" x="38" y="52" width="264" height="270" rx="28"/><text class="ash-flowcore-kicker" x="70" y="92">THIS DEVICE</text>
            <rect class="ash-flowcore-file" x="96" y="132" width="112" height="102" rx="16"/><path class="ash-flowcore-file-line" d="M126 165H181M126 187H181M126 209H166"/>
            <text class="ash-flowcore-label" x="152" y="267" text-anchor="middle">local source</text><text class="ash-flowcore-glyph" x="252" y="290">à</text><circle class="ash-flowcore-source-pulse" cx="246" cy="284" r="26"/>
          </g>
          <g class="ash-flowcore-boundary" data-flowcore-organ="boundary">
            <line x1="346" y1="42" x2="346" y2="342"/><text class="ash-flowcore-kicker" x="364" y="74">RAW BYTES DO NOT CROSS</text>
            <path class="ash-flowcore-raw-route" d="M208 184C258 184 294 180 334 158"/><path class="ash-flowcore-stop" d="M330 144V174M322 151L338 167M338 151L322 167"/><text class="ash-flowcore-glyph" x="318" y="326">上</text>
          </g>
          <g class="ash-flowcore-reference" data-flowcore-organ="reference">
            <path class="ash-flowcore-metadata-route" d="M358 158C400 132 424 126 452 126" marker-end="url(#ashFlowArrow)"/><circle class="ash-flowcore-reference-ring" cx="512" cy="126" r="62"/><circle class="ash-flowcore-reference-core" cx="512" cy="126" r="47"/>
            <text class="ash-flowcore-kicker" x="512" y="119" text-anchor="middle">REFERENCE</text><text class="ash-flowcore-label" x="512" y="143" text-anchor="middle">≠ ARTIFACT</text><text class="ash-flowcore-glyph" x="556" y="188">出</text>
          </g>
          <g class="ash-flowcore-relation" data-flowcore-organ="relation">
            <path class="ash-flowcore-reference-route" d="M574 134C620 150 646 172 678 208" marker-end="url(#ashFlowArrow)"/><path class="ash-flowcore-topology-shell" d="M720 76L878 76L954 168L916 306L754 326L670 232Z"/>
            <g class="ash-flowcore-moire" clip-path="url(#ashFlowRightClip)"><ellipse cx="820" cy="202" rx="146" ry="86" transform="rotate(18 820 202)"/><ellipse cx="820" cy="202" rx="146" ry="86" transform="rotate(-18 820 202)"/><ellipse cx="820" cy="202" rx="106" ry="142"/></g>
            <path class="ash-flowcore-network-line" d="M756 126L822 202L900 122M822 202L746 276M822 202L908 278M756 126L900 122M746 276L908 278"/>
            <circle class="ash-flowcore-network-node" cx="756" cy="126" r="14"/><circle class="ash-flowcore-network-node" cx="900" cy="122" r="14"/><circle class="ash-flowcore-network-node" cx="746" cy="276" r="14"/><circle class="ash-flowcore-network-node" cx="908" cy="278" r="14"/><circle class="ash-flowcore-network-core" cx="822" cy="202" r="30"/>
            <path class="ash-flowcore-core-cross" d="M803 184L841 220M841 184L803 220"/><text class="ash-flowcore-glyph ash-flowcore-glyph--relation" x="934" y="330">米</text><text class="ash-flowcore-kicker" x="738" y="360">CASE MAP RELATION FIELD</text>
          </g>
          <g class="ash-flowcore-residual" data-flowcore-organ="residual"><path d="M590 286C642 310 680 314 716 300"/><text class="ash-flowcore-residual-label" x="568" y="316">missingness stays visible</text></g>
          <g class="ash-flowcore-rest" data-flowcore-organ="rest"><circle cx="822" cy="202" r="54"/><text class="ash-flowcore-glyph" x="822" y="218" text-anchor="middle">𝄐</text></g>
        </svg>
        <div class="ash-flowcore-field__caption" aria-live="polite"><strong data-flowcore-consequence>Notice the local source before any custody claim.</strong><span data-flowcore-technical>Visible condition · source remains on this device.</span></div>
      </div>
      <ol class="ash-flowcore-static" aria-label="Complete static equivalent">${staticSteps}</ol>
      <footer class="ash-flowcore-field__inspection"><span>glyph</span><span>motion</span><span>shape</span><span>language</span><span>inspection</span><strong data-flowcore-exact-state>ARRIVAL UNPERSISTED</strong><em>visual coherence ≠ Ash authority</em></footer>
    </section>`;
}

function ensureField() {
  if (mounting || !doc?.body) return null;
  const stage = doc.querySelector('#ashAiaMembrane [data-aia-stage], .ash-aia__stage');
  if (!stage) return null;
  field = stage.querySelector('.ash-flowcore-field');
  if (field) return field;
  mounting = true;
  try {
    stage.classList.add('ash-flowcore-mounted');
    const wrapper = doc.createElement('div');
    wrapper.innerHTML = fieldMarkup().trim();
    field = wrapper.firstElementChild;
    stage.append(field);
    return field;
  } finally {
    mounting = false;
  }
}

function applyPhase(nextPhase, options = {}) {
  const bounded = Math.max(0, Math.min(PHASES.length - 1, Number(nextPhase) || 0));
  const source = options.source || 'EXPLICIT_FRAME';
  const playing = options.playing ?? bounded > 0;
  phase = bounded;
  const root = ensureField();
  if (!root) return false;
  const selected = PHASES[bounded];
  root.dataset.flowcorePhase = String(bounded);
  root.dataset.flowcorePhaseName = selected.id;
  root.dataset.flowcorePlaying = String(Boolean(playing) && bounded < PHASES.length - 1);
  root.dataset.flowcoreLifecycle = lifecycleState();
  root.dataset.flowcoreCaseOpen = String(caseOpen());
  root.querySelector('[data-flowcore-phase-label]').textContent = `${selected.id.replaceAll('_',' ')} · ${selected.glyph}`;
  root.querySelector('[data-flowcore-consequence]').textContent = selected.consequence;
  root.querySelector('[data-flowcore-technical]').textContent = selected.technical;
  root.querySelector('[data-flowcore-exact-state]').textContent = lifecycleState().replaceAll('_',' ');
  root.querySelectorAll('[data-static-phase]').forEach((item,index) => item.setAttribute('aria-current', index === bounded ? 'step' : 'false'));
  lastFrame = compileFrame(bounded);
  root.dataset.flowcoreVisualSchema = lastFrame.schema;
  root.dataset.flowcoreChannels = Object.keys(lastFrame.channels).join(' ');
  root.dataset.flowcoreReducedMotion = String(lastFrame.reduced_motion);
  root.dataset.flowcoreAuthority = 'PRESENTATION_ONLY';
  doc.documentElement.dataset.ashFlowcorePhase = selected.id;
  doc.documentElement.dataset.ashFlowcoreField = ASH_FLOWCORE_FIELD_VERSION;
  host.dispatchEvent(new CustomEvent('td613:ash:flowcore-field-phase', {
    detail:{ version:ASH_FLOWCORE_FIELD_VERSION, phase:bounded, phase_name:selected.id, source, visual_schema:lastFrame.schema, artifact_required:false }
  }));
  return true;
}

function installObservers() {
  if (!stageObserver) {
    stageObserver = new MutationObserver(records => {
      if (!records.some(record => record.addedNodes.length || record.removedNodes.length)) return;
      queueMicrotask(() => {
        const mounted = ensureField();
        if (mounted) applyPhase(phase, { source:'STAGE_REMOUNT', playing:false });
      });
    });
    stageObserver.observe(doc.body, { childList:true, subtree:true });
  }
  if (!phaseObserver) {
    phaseObserver = new MutationObserver(records => {
      if (!records.some(record => ['data-ash-explanation-motion','data-ash-explanation-frame'].includes(record.attributeName))) return;
      const motion = doc.documentElement.dataset.ashExplanationMotion;
      if (motion === 'COMPLETE' || motion === 'STATIC_COMPLETE') applyPhase(4, { source:motion, playing:false });
    });
    phaseObserver.observe(doc.documentElement, { attributes:true, attributeFilter:['data-ash-explanation-motion','data-ash-explanation-frame'] });
  }
}

function installEvents() {
  host.addEventListener('td613:ash:explanation-frame', event => {
    applyPhase(Math.min(3, Number(event.detail?.step || 0)), { source:'EXPLICIT_PLAY_FRAME', playing:true });
  });
  doc.addEventListener('click', event => {
    if (event.target?.closest?.('[data-aia-play]')) applyPhase(0, { source:'EXPLICIT_PLAY_GESTURE', playing:true });
  }, true);
  for (const type of ['lifecycle-updated','case-opened','case-created','profile-demo-hydrated','case-closed','aia-ready']) {
    host.addEventListener(`td613:ash:${type}`, () => queueMicrotask(() => applyPhase(phase, { source:`STATE_${type.toUpperCase()}`, playing:false })));
  }
  host.matchMedia?.('(prefers-reduced-motion: reduce)').addEventListener?.('change', () => applyPhase(phase, { source:'MOTION_PREFERENCE_CHANGED', playing:false }));
}

export function installAshFlowcorePedagogyField() {
  if (!host || !doc?.body || host.__td613AshFlowcoreField) return false;
  ensureStyle();
  installObservers();
  installEvents();
  ensureField();
  applyPhase(0, { source:'INSTALL', playing:false });
  host.__td613AshFlowcoreField = Object.freeze({
    version:ASH_FLOWCORE_FIELD_VERSION,
    play:() => host.__td613AshLiveAIA?.replay?.(),
    setPhase:value => applyPhase(value, { source:'EXPLICIT_API', playing:true }),
    refresh:() => applyPhase(phase, { source:'EXPLICIT_REFRESH', playing:false }),
    current:() => Object.freeze({
      phase,
      phase_name:PHASES[phase].id,
      lifecycle_state:lifecycleState(),
      case_open:caseOpen(),
      artifact_required:false,
      visual_schema:lastFrame?.schema || null,
      channels:lastFrame ? Object.keys(lastFrame.channels) : [],
      authority:lastFrame?.authority || null,
      closure:lastFrame?.closure || null
    })
  });
  doc.documentElement.dataset.ashFlowcoreField = ASH_FLOWCORE_FIELD_VERSION;
  host.dispatchEvent(new CustomEvent('td613:ash:flowcore-field-mounted', {
    detail:{ version:ASH_FLOWCORE_FIELD_VERSION, artifact_required:false, phase:PHASES[phase].id }
  }));
  return true;
}

if (host && doc) installAshFlowcorePedagogyField();
