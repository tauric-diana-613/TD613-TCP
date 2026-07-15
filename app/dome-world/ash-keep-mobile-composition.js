export const ASH_KEEP_MOBILE_COMPOSITION_VERSION = 'td613.ash-keep.mobile-composition/v1.0';

const STYLE_ID = 'td613-ash-keep-mobile-composition';

export function installAshKeepMobileComposition(doc = globalThis.document) {
  if (!doc?.head || doc.getElementById(STYLE_ID)) return false;

  const style = doc.createElement('style');
  style.id = STYLE_ID;
  style.dataset.td613Version = ASH_KEEP_MOBILE_COMPOSITION_VERSION;
  style.textContent = `
@media (max-width: 760px) {
  body {
    overscroll-behavior-y: contain;
  }

  .mast {
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 8px;
    min-height: 58px;
    padding: 8px max(10px, env(safe-area-inset-right)) 8px max(10px, env(safe-area-inset-left));
  }

  .brand { gap: 8px; }
  .seal {
    flex: 0 0 auto;
    width: 34px;
    height: 34px;
    font-size: 1.05rem;
  }
  .eyebrow {
    overflow: hidden;
    font-size: .52rem;
    letter-spacing: .06em;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .brand h1 {
    font-size: 1.15rem;
    line-height: 1.05;
  }
  .brand h1 span { display: none; }

  .mast-state { gap: 6px; }
  .mast-state .status-chip { display: none; }
  .back {
    width: 36px;
    height: 36px;
    font-size: 1rem;
  }
  .case-entry {
    width: auto !important;
    min-width: 46px !important;
    padding: 0 8px !important;
    font-size: .56rem !important;
  }

  .workspace-rail {
    top: 58px;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    grid-auto-rows: 42px;
    overflow: visible;
    padding: 0;
  }
  .work-tab {
    min-height: 42px;
    padding: 0 18px 0 6px;
    font-size: .54rem;
    letter-spacing: .035em;
    clip-path: polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px);
  }
  .work-tab::before {
    right: 5px;
    top: 3px;
    font-size: 1.05rem;
  }

  main {
    padding: 14px 10px calc(28px + env(safe-area-inset-bottom));
  }
  .workspace-head {
    align-items: start;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 10px;
    padding-bottom: 10px;
  }
  .workspace-head h2 {
    font-size: clamp(1.55rem, 8vw, 2rem);
    line-height: 1;
  }
  .workspace-head p {
    font-size: .75rem;
    line-height: 1.5;
  }
  .workspace-mark { font-size: .58rem; }

  .map-layout {
    display: block;
    min-height: 0;
  }
  .map-stage {
    display: flex;
    min-height: 0;
    flex-direction: column;
    overflow: hidden;
    clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px);
  }
  .map-tools {
    position: static;
    inset: auto;
    display: grid;
    grid-template-columns: 1fr auto auto;
    gap: 6px;
    padding: 8px;
    background: #020806;
    border-bottom: 1px solid var(--line);
  }
  .map-tools::before {
    content: 'Map controls';
    align-self: center;
    color: var(--muted);
    font: 700 .56rem var(--mono);
    letter-spacing: .08em;
    text-transform: uppercase;
  }
  .map-tools > * { pointer-events: auto; }
  .segmented {
    grid-column: 1 / -1;
    order: 2;
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 1px;
    width: 100%;
    max-width: none;
    overflow: visible;
    border: 0;
    background: var(--line);
  }
  .segmented button {
    min-width: 0;
    min-height: 36px;
    padding: 5px 4px;
    border: 0;
    background: #04110e;
    font-size: .52rem;
    line-height: 1.15;
    white-space: normal;
  }
  .icon-btn {
    width: 38px;
    height: 38px;
  }
  .map-stage canvas {
    width: 100%;
    height: clamp(340px, 50svh, 480px);
    min-height: 0;
    touch-action: none;
  }
  .map-legend {
    position: static;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 4px 10px;
    width: auto;
    max-width: none;
    margin: 0;
    padding: 8px 10px;
    border-width: 1px 0 0;
    background: #03100c;
    font-size: .54rem;
  }
  .legend-row { min-width: 0; }

  .inspector {
    margin-top: 10px;
    padding: 12px;
    clip-path: polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px);
  }
  .inspector h3 { font-size: 1.05rem; }
  .readout { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .readout div {
    display: block;
    padding: 8px;
  }
  .readout dd {
    margin-top: 3px;
    text-align: left;
  }
  .vector-row {
    grid-template-columns: minmax(88px, .8fr) 1fr auto;
  }

  .tools-grid { display: block; }
  .tool-section {
    margin-bottom: 10px;
    padding: 14px;
    border: 1px solid rgba(118, 234, 212, .14);
    background: rgba(4, 19, 15, .72);
  }
  .field-grid { grid-template-columns: 1fr; }
  .field.full { grid-column: auto; }
  .field input,
  .field select,
  .field textarea { font-size: 16px; }
  .actions {
    display: grid;
    grid-template-columns: 1fr;
    gap: 7px;
  }
  .actions .btn { width: 100%; }
  .tradeoff { grid-template-columns: repeat(2, 1fr); }
  .room-list,
  .route-list,
  .save-list { grid-template-columns: 1fr; }
  .receipt {
    max-height: 210px;
    font-size: .62rem;
  }
  .accessible-table { overflow: auto; }

  .launch {
    align-items: end;
    padding: 0;
    background: rgba(1, 5, 4, .94);
  }
  .launch-panel {
    width: 100%;
    max-height: min(88svh, 760px);
    overflow: auto;
    padding: 20px 16px calc(18px + env(safe-area-inset-bottom));
    clip-path: polygon(14px 0, 100% 0, 100% 100%, 0 100%, 0 14px);
  }
  .launch h2 { font-size: 2.4rem; }
  .launch p { font-size: .82rem; }
  .launch .field-grid { grid-template-columns: 1fr; }
  .launch .actions { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .launch .actions .btn { min-width: 0; }
  .launch-top { align-items: flex-start; }
  .launch-glyphs {
    font-size: .56rem;
    overflow-wrap: anywhere;
  }
  .launch-close { flex: 0 0 auto; }
}

@media (max-width: 460px) {
  .eyebrow { display: none; }
  .segmented { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .launch .actions { grid-template-columns: 1fr; }
}
`;

  doc.head.append(style);
  doc.documentElement.dataset.ashMobileComposition = ASH_KEEP_MOBILE_COMPOSITION_VERSION;
  return true;
}

if (typeof document !== 'undefined') {
  installAshKeepMobileComposition(document);
}
