export const ASH_MOBILE_CONSTITUTIONAL_CLOSURE_VERSION = 'td613.ash-keep.mobile-constitutional-closure/v0.1';

const STYLE_ID = 'td613-ash-mobile-constitutional-closure';

export function installAshMobileConstitutionalClosure(doc = globalThis.document) {
  if (!doc?.head || doc.getElementById(STYLE_ID)) return false;

  const style = doc.createElement('style');
  style.id = STYLE_ID;
  style.dataset.td613Version = ASH_MOBILE_CONSTITUTIONAL_CLOSURE_VERSION;
  style.textContent = `
@media (max-width: 760px) {
  html,
  body,
  main,
  .workspace,
  .workspace-head,
  .workspace-rail,
  .ash-lifecycle-rail,
  .custody-grid,
  .custody-stack,
  .custody-card,
  .custody-card .field-grid,
  .custody-card .field,
  .lifecycle-state,
  .custody-index,
  .receipt {
    min-width: 0;
    max-width: 100%;
  }

  .workspace-rail {
    width: 100%;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    grid-auto-rows: 42px;
    overflow: visible;
  }

  .ash-lifecycle-rail {
    width: 100%;
    grid-template-columns: repeat(7, minmax(112px, 1fr));
    overflow-x: auto;
    overflow-y: hidden;
    overscroll-behavior-x: contain;
  }

  .custody-grid,
  .custody-stack {
    width: 100%;
  }

  .custody-card {
    overflow: hidden;
  }

  .custody-card input,
  .custody-card select,
  .custody-card textarea,
  .custody-card button,
  .custody-index button,
  .lifecycle-state > * {
    min-width: 0;
    max-width: 100%;
    overflow-wrap: anywhere;
  }

  .custody-card pre,
  .custody-card .receipt {
    white-space: pre-wrap;
    overflow-x: auto;
    overflow-wrap: anywhere;
  }
}

@media (max-width: 460px) {
  .workspace-rail {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
`;

  doc.head.append(style);
  doc.documentElement.dataset.ashMobileConstitutionalClosure = ASH_MOBILE_CONSTITUTIONAL_CLOSURE_VERSION;
  return true;
}

if (typeof document !== 'undefined') installAshMobileConstitutionalClosure(document);
