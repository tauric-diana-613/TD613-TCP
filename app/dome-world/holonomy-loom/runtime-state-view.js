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
  statusNode.hidden = true;
  root.append(statusNode);
  let latestSnapshot = null, lastPacket = null, compiled = null, heldReason = null, generation = 0, disposed = false, status = 'WAITING', hasPublishedView = false;
  function setStatus(value) { status = value;root.dataset.projectionState = value; }
  function inspectionState(value) {
    if (!inspectionSummary) return;
    inspectionSummary.textContent = value === 'CURRENT' ? currentInspectionLabel
      : hasPublishedView ? `Prior observation · current projection ${value === 'HELD' ? 'held' : 'updating'}`
        : `Current projection ${value === 'HELD' ? 'held' : 'updating'} · no observation ready`;
  }
  function publish(snapshot) {
    if (disposed || doc.hidden) return;
    if (heldReason !== null) {
      root.removeAttribute('aria-busy');setStatus('HELD');
      delete root.dataset.clientPhase;delete root.dataset.activeRelation;
      if (section) section.hidden = true;
      inspectionState('HELD');
      statusNode.textContent = `Current route projection held · ${heldReason}. Inspect the request status before continuing.`;
      statusNode.hidden = false;
    } else if (compiled) {
      renderer.update(compiled, snapshot);
      hasPublishedView = true;inspectionState('CURRENT');
      if (section) section.hidden = false;
      statusNode.hidden = true;root.removeAttribute('aria-busy');setStatus('CURRENT');
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
    statusNode.hidden = true;
    if (mode) mode.textContent = 'Updating the current route observation…';
    // A prior projection is never presented as the new packet's current state.
    if (section) section.hidden = true;
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
      compiled = view;publish(latestSnapshot);
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
