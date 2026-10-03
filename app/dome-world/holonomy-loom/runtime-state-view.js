import { compileLoomInstrumentStateView, mountLoomInstrumentStateView } from './instrument-state-view.js';

/** The primary request projection. The workspace owns the packet, history and
 * sole AnimationCoordinator; this adapter owns no clock or custody capability.
 */
export function mountLoomRuntimeStateView(root, {
  coordinator, environment = globalThis, observe = () => ({}),
  compatibilityHost = null, inspectionContent = null
} = {}) {
  if (!root?.ownerDocument || !coordinator?.registerPass) throw new TypeError('The runtime state view requires its existing workspace coordinator.');
  const doc = root.ownerDocument, renderer = mountLoomInstrumentStateView(root);
  const section = root.querySelector('.loom-instrument-state');
  const mode = root.querySelector('.loom-instrument-state-mode');
  const inspection = root.querySelector('.loom-instrument-state-inspection');
  const inspectionSummary = inspection?.querySelector('summary');
  const currentInspectionLabel = inspectionSummary?.textContent ?? '';
  if (inspectionContent && inspection) {
    inspection.id = 'aiInspector';
    inspection.append(...inspectionContent.childNodes);
    inspectionContent.remove();
  }
  // The exact record is persistent UI. Hiding a stale visual must not hide a
  // focused inspection control or replace its DOM while the compiler awaits.
  if (inspection) root.append(inspection);
  const statusNode = doc.createElement('p');
  statusNode.className = 'ai-runtime-state-status';
  statusNode.setAttribute('role', 'status');
  // Compilation status overlays the reserved field footprint. Inserting a
  // flow paragraph or display:none on the former field can move a button
  // between pointerdown and pointerup and lose the operator's gesture.
  Object.assign(statusNode.style, { position: 'absolute', inset: '0', margin: '0', alignContent: 'center', textAlign: 'center', pointerEvents: 'none' });
  statusNode.hidden = true;
  root.append(statusNode);
  let latestSnapshot = null, lastPacket = null, compiled = null, heldReason = null, generation = 0, disposed = false, status = 'WAITING', hasPublishedView = false;
  function setStatus(value) { status = value;if (root.dataset.projectionState !== value) root.dataset.projectionState = value; }
  function inspectionState(value) {
    if (!inspectionSummary) return;
    const label = value === 'CURRENT' ? currentInspectionLabel
      : hasPublishedView ? `Prior observation · current projection ${value === 'HELD' ? 'held' : 'updating'}`
        : `Current projection ${value === 'HELD' ? 'held' : 'updating'} · no observation ready`;
    if (inspectionSummary.textContent !== label) inspectionSummary.textContent = label;
  }
  function reserveVisualFootprint() {
    if (!section) return;
    // Retain layout without exposing a prior observation as current, through
    // pixels, accessibility, focus, or state metadata. The separately labelled
    // prior receipt stays inspectable in its persistent Session workspace.
    section.hidden = false;
    section.style.visibility = 'hidden';
    section.setAttribute('aria-hidden', 'true');
    section.setAttribute('inert', '');
    delete root.dataset.clientPhase; delete root.dataset.activeRelation;
    delete doc.documentElement.dataset.loomRelation;
  }
  function exposeCurrentVisual() {
    if (!section) return;
    section.style.removeProperty('visibility');
    section.removeAttribute('aria-hidden');
    section.removeAttribute('inert');
  }
  function publish(snapshot) {
    if (disposed || doc.hidden) return;
    if (heldReason !== null) {
      root.removeAttribute('aria-busy');setStatus('HELD');
      delete root.dataset.clientPhase;delete root.dataset.activeRelation;
      reserveVisualFootprint();
      inspectionState('HELD');
      statusNode.textContent = `Current route projection held · ${heldReason}. Inspect the request status before continuing.`;
      statusNode.hidden = false;
    } else if (compiled) {
      renderer.update(compiled, snapshot);
      hasPublishedView = true;inspectionState('CURRENT');
      exposeCurrentVisual();
      if (!statusNode.hidden) statusNode.hidden = true;
      root.removeAttribute('aria-busy');setStatus('CURRENT');
    }
  }
  function renderSnapshot(snapshot) {
    latestSnapshot = snapshot;
    // Preserve the former deterministic phase hook without retaining its scene.
    if (compatibilityHost) compatibilityHost.dataset.phase = snapshot.packet.phase;
    if (disposed) return;
    if (doc.hidden) {
      if (lastPacket && snapshot.packet !== lastPacket) { generation++;lastPacket = null;compiled = null;heldReason = null; }
      return;
    }
    if (snapshot.packet === lastPacket) {
      publish(snapshot);
      return;
    }
    lastPacket = snapshot.packet;compiled = null;heldReason = null;
    const token = ++generation;
    setStatus('COMPILING');root.setAttribute('aria-busy', 'true');
    inspectionState('COMPILING');
    statusNode.textContent = 'Updating the current route observation…';
    statusNode.hidden = false;
    if (mode) mode.textContent = 'Updating the current route observation…';
    // A prior projection is never presented as the new packet's current state.
    reserveVisualFootprint();
    (async () => {
      const observation = observe();
      return compileLoomInstrumentStateView(snapshot.packet, {
        sourceRevision: observation.source_revision || 'browser-unpinned',
        eventHistory: observation.events || [], replay: observation.replay?.index != null,
        cryptoImpl: environment.crypto ?? globalThis.crypto,
        TextEncoderImpl: environment.TextEncoder ?? globalThis.TextEncoder
      });
    })().then(view => {
      if (disposed || token !== generation || latestSnapshot.packet !== snapshot.packet) return;
      compiled = view;
      // The finite semantic clock can advance while the async projection is
      // compiling behind the reserved field. If that happens, replay the same
      // coordinator from zero once the current projection is actually visible;
      // otherwise Safari/iPhone can legitimately show only the final static
      // frame and make a working relation look like a dead animation.
      const shouldReplayVisibleProjection =
        latestSnapshot.progress > 0.02 &&
        latestSnapshot.reducedMotion !== true &&
        latestSnapshot.packet.geometry?.rest !== true;
      publish(latestSnapshot);
      root.dataset.projectionReplay = shouldReplayVisibleProjection ? '1' : '0';
      if (shouldReplayVisibleProjection) {
        coordinator.seek(0);
        coordinator.play();
      }
    }).catch(error => {
      if (disposed || token !== generation || latestSnapshot.packet !== snapshot.packet) return;
      compiled = null;heldReason = String(error.message).slice(0, 240);publish(latestSnapshot);
    });
  }
  const unregister = coordinator.registerPass('runtime-state-view', renderSnapshot);
  function measure() {
    if (disposed || doc.hidden) return;
    const rect = root.getBoundingClientRect();
    coordinator.setViewport({ width: Math.max(1, Math.min(32768, rect.width || environment.innerWidth || 640)),
      height: Math.max(1, Math.min(32768, rect.height || 320)), dpr: Math.max(.1, Math.min(8, environment.devicePixelRatio || 1)) });
  }
  function visibility() {
    if (doc.hidden) {
      setStatus('HIDDEN');
      return;
    }
    measure();if (latestSnapshot) renderSnapshot(latestSnapshot);
  }
  doc.addEventListener('visibilitychange', visibility);
  environment.addEventListener?.('resize', measure);
  const observer = typeof environment.ResizeObserver === 'function' ? new environment.ResizeObserver(measure) : null;
  observer?.observe(root);measure();
  return Object.freeze({
    inspect: () => ({ status, view: status === 'CURRENT' ? compiled : null,
      frame: status === 'CURRENT' ? renderer.inspect().frame : null,
      latest_phase: latestSnapshot?.packet.phase ?? null, owns_animation_loop: false, disposed }),
    dispose() {
      if (disposed) return;
      disposed = true;generation++;unregister();observer?.disconnect();
      doc.removeEventListener('visibilitychange', visibility);environment.removeEventListener?.('resize', measure);
      renderer.destroy();inspection?.remove();statusNode.remove();root.removeAttribute('aria-busy');
      latestSnapshot = null;lastPacket = null;compiled = null;heldReason = null;
    }
  });
}
