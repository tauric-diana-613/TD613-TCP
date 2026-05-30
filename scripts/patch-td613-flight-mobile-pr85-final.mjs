import fs from 'fs';

const path = 'app/safe-harbor/td613-flight.html';
let html = fs.readFileSync(path, 'utf8');

const marker = 'PR85_FINAL_SENTINEL TD613 Flight mobile repair';

const viewport = '<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />';
const viewportMeta = /\n?<meta\b(?=[^>]*\bname=["']viewport["'])[^>]*>/gi;
html = html.replace(viewportMeta, '');
html = html.replace(/<head>/i, `<head>\n${viewport}`);

const cssMarkers = [
  'PR80_SENTINEL TD613 Flight PR80 mobile chrome restoration',
  'PR81_SENTINEL TD613 Flight mobile zoom and gesture repair',
  'PR82_SENTINEL TD613 Flight unsticky page and textarea zoom repair',
  'PR83_SENTINEL TD613 Flight compact chips and mobile field scale repair',
  'PR84_FINAL_CHIP_REPAIR',
  marker
];
for (const cssMarker of cssMarkers) {
  const escaped = cssMarker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  html = html.replace(new RegExp('\\n?\\/\\* ' + escaped + ' \\*\\/[\\s\\S]*?(?=\\n<\\/style>|\\n\\/\\*)', 'g'), '');
}

const oldScriptIds = [
  'td613-flight-pr78-absolute-mobile-lane-script',
  'td613-flight-pr80-mobile-header-collapse-script',
  'td613-flight-pr80-swipe-cue-script',
  'td613-flight-pr81-gesture-repair-script',
  'td613-flight-pr82-unsticky-zoom-script',
  'td613-flight-pr84-clean-script',
  'td613-flight-pr85-final-script'
];
for (const id of oldScriptIds) {
  html = html.replace(new RegExp('\\n?<script id="' + id + '">[\\s\\S]*?<\\/script>', 'g'), '');
}

const css = `

/* PR101_SENTINEL TD613 Flight mobile state lanes no horizontal trap */
@media (max-width: 820px) {
  .grid {
    display: block !important;
    width: 100% !important;
    min-width: 0 !important;
    height: 100% !important;
    overflow-x: hidden !important;
    overflow-y: hidden !important;
    scroll-snap-type: none !important;
    scroll-behavior: auto !important;
    touch-action: pan-y pinch-zoom !important;
    -webkit-overflow-scrolling: auto !important;
  }

  .grid > div:first-child,
  .grid > div:last-child {
    width: 100% !important;
    min-width: 0 !important;
    max-width: 100% !important;
    height: 100% !important;
    min-height: 0 !important;
    overflow-x: hidden !important;
    overflow-y: auto !important;
    scroll-snap-align: none !important;
    scroll-snap-stop: normal !important;
    touch-action: pan-y pinch-zoom !important;
    -webkit-overflow-scrolling: touch !important;
  }

  html[data-td613-lane="prompt"] .grid > div:first-child,
  html:not([data-td613-lane]) .grid > div:first-child {
    display: block !important;
  }

  html[data-td613-lane="prompt"] .grid > div:last-child,
  html:not([data-td613-lane]) .grid > div:last-child {
    display: none !important;
  }

  html[data-td613-lane="output"] .grid > div:first-child {
    display: none !important;
  }

  html[data-td613-lane="output"] .grid > div:last-child {
    display: block !important;
  }

  html[data-td613-lane="prompt"] [data-flight-lane-target="prompt"],
  html:not([data-td613-lane]) [data-flight-lane-target="prompt"],
  html[data-td613-lane="output"] [data-flight-lane-target="output"] {
    border-color: rgba(49,255,138,0.55) !important;
    color: var(--lux-cream) !important;
    background:
      linear-gradient(180deg, rgba(24,77,54,0.58), rgba(2,13,10,0.92)),
      radial-gradient(circle at 50% 0%, rgba(49,255,138,0.22), transparent 66%) !important;
    box-shadow: 0 0 24px rgba(49,255,138,0.15), inset 0 1px 0 rgba(245,255,246,0.08) !important;
  }

  html[data-td613-lane="prompt"] [data-flight-lane-target="output"],
  html:not([data-td613-lane]) [data-flight-lane-target="output"],
  html[data-td613-lane="output"] [data-flight-lane-target="prompt"] {
    border-color: rgba(137,255,240,0.16) !important;
    color: rgba(245,255,246,0.74) !important;
    background: rgba(2,13,14,0.68) !important;
    box-shadow: none !important;
  }
}


/* PR100_SENTINEL TD613 Flight native lane touch repair */
@media (max-width: 820px) {
  html,
  body,
  html[data-flight-shi-cached="true"] body.flight-locked,
  body.flight-locked {
    touch-action: pan-x pan-y pinch-zoom !important;
    overscroll-behavior-x: contain !important;
  }

  .grid {
    overflow-x: auto !important;
    overflow-y: hidden !important;
    scroll-snap-type: x proximity !important;
    scroll-behavior: auto !important;
    touch-action: pan-x pan-y pinch-zoom !important;
    overscroll-behavior-x: contain !important;
    -webkit-overflow-scrolling: touch !important;
  }

  .grid > div:first-child,
  .grid > div:last-child {
    scroll-snap-align: start !important;
    scroll-snap-stop: normal !important;
    touch-action: pan-x pan-y pinch-zoom !important;
  }
}


/* PR99_SENTINEL TD613 Flight rollback PR98 swipe lock to native lanes */
@media (max-width: 820px) {
  .grid {
    overflow-x: auto !important;
    overflow-y: hidden !important;
    overscroll-behavior-x: auto !important;
    overscroll-behavior-y: contain !important;
    scroll-snap-type: x proximity !important;
    scroll-behavior: auto !important;
    touch-action: pan-x pan-y pinch-zoom !important;
    -webkit-overflow-scrolling: touch !important;
    contain: none !important;
  }

  .grid > div:first-child,
  .grid > div:last-child {
    scroll-snap-align: start !important;
    scroll-snap-stop: normal !important;
  }

  body.td613-lane-snapping .grid {
    scroll-snap-type: x proximity !important;
  }
}


/* PR97_SENTINEL TD613 Flight dev title shrink + Header control centering */
@media (max-width: 920px) {
  .dev-drawer .card:has(#rotationSeed) > h2,
  .dev-drawer .card:has(#authFragment) > h2 {
    font-size: clamp(9.5px, 2.35vw, 12px) !important;
    line-height: .94 !important;
    letter-spacing: .025em !important;
    word-spacing: 0 !important;
    max-width: 100% !important;
    margin-bottom: 7px !important;
  }

  .flight-lane-prompt > .card:nth-of-type(3) .checkbox-row,
  .flight-lane-prompt > .card:nth-of-type(3) .radio-row {
    justify-content: center !important;
    align-content: center !important;
    width: calc(100% - 10px) !important;
    max-width: calc(100% - 10px) !important;
    margin-left: auto !important;
    margin-right: auto !important;
    padding-left: 0 !important;
    padding-right: 0 !important;
  }

  .flight-lane-prompt > .card:nth-of-type(3) .checkbox-row > label,
  .flight-lane-prompt > .card:nth-of-type(3) .radio-row > label {
    max-width: min(10.2rem, 43vw) !important;
  }

  .flight-lane-prompt > .card:nth-of-type(3) .danger-note {
    width: calc(100% - 12px) !important;
    max-width: calc(100% - 12px) !important;
    margin-left: auto !important;
    margin-right: auto !important;
  }
}

@media (max-width: 420px) {
  .dev-drawer .card:has(#rotationSeed) > h2,
  .dev-drawer .card:has(#authFragment) > h2 {
    font-size: clamp(9px, 2.15vw, 11px) !important;
    letter-spacing: .02em !important;
  }
}


/* PR96_SENTINEL TD613 Flight mobile H1 + dev field density fix */
@media (max-width: 920px) {
  header h1,
  .app-shell h1,
  .flight-lane h1,
  .flight-lane .card > h2,
  .flight-lane-prompt .card > h2,
  .flight-lane-output .card > h2,
  .dev-drawer .card > h2,
  .card > h2,
  .flightplan-card > h2 {
    font-size: clamp(10px, 2.65vw, 13px) !important;
    line-height: .94 !important;
    letter-spacing: .035em !important;
    word-spacing: 0 !important;
    transform: none !important;
    -webkit-transform: none !important;
  }

  .flight-lane .card > h2::first-letter,
  .flight-lane-prompt .card > h2::first-letter,
  .flight-lane-output .card > h2::first-letter,
  .dev-drawer .card > h2::first-letter {
    font-size: inherit !important;
  }

  .flight-lane-prompt > .card:nth-of-type(3) {
    width: calc(100% - 22px) !important;
    max-width: calc(100% - 22px) !important;
    margin-left: auto !important;
    margin-right: auto !important;
    transform: translateX(0) translateY(6px) !important;
    -webkit-transform: translateX(0) translateY(6px) !important;
  }

  .dev-drawer .flightplan-card input[type="text"],
  .dev-drawer .flightplan-card textarea,
  .dev-drawer .flightplan-card select {
    width: 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;
    box-sizing: border-box !important;
    font-size: 8px !important;
    line-height: 1.12 !important;
  }

  .dev-drawer .flightplan-card input[type="text"],
  .dev-drawer .flightplan-card select {
    height: 25px !important;
    min-height: 25px !important;
    padding: 4px 8px !important;
  }

  .dev-drawer .flightplan-card #routeJurisdiction,
  .dev-drawer .flightplan-card #routeCitationStandard,
  .dev-drawer .flightplan-card #routeUnit {
    display: block !important;
    width: 100% !important;
    max-width: none !important;
  }

  .dev-drawer .flightplan-card #routeMetrics {
    display: block !important;
    width: 100% !important;
    max-width: none !important;
    min-height: 72px !important;
    height: 72px !important;
    padding: 6px 8px !important;
    overflow: auto !important;
    resize: vertical !important;
  }

  .dev-drawer .flightplan-card .small-label {
    display: block !important;
    margin-top: 7px !important;
    margin-bottom: 3px !important;
    font-size: 7px !important;
    line-height: 1.05 !important;
  }

  .dev-drawer .flightplan-card .diagnostic-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    gap: 7px !important;
  }

  .dev-drawer .flightplan-card .diagnostic-grid .metric-chip {
    min-width: 0 !important;
    width: 100% !important;
  }

  .dev-drawer .card:has(#rotationSeed) .radio-row,
  .dev-drawer .card:has(#rotationSeed) .checkbox-row {
    display: grid !important;
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    gap: 5px 7px !important;
    align-items: stretch !important;
  }

  .dev-drawer .card:has(#rotationSeed) .radio-row > label,
  .dev-drawer .card:has(#rotationSeed) .checkbox-row > label {
    width: 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;
    justify-content: flex-start !important;
    padding: 3px 7px !important;
    font-size: 7px !important;
    line-height: 1.06 !important;
    min-height: 20px !important;
  }
}

@media (max-width: 420px) {
  header h1,
  .app-shell h1,
  .flight-lane h1,
  .flight-lane .card > h2,
  .flight-lane-prompt .card > h2,
  .flight-lane-output .card > h2,
  .dev-drawer .card > h2,
  .card > h2,
  .flightplan-card > h2 {
    font-size: clamp(9.5px, 2.45vw, 12px) !important;
    letter-spacing: .03em !important;
  }
}


/* PR95_SENTINEL TD613 Flight final mobile centering/heading/path fix */
@media (max-width: 920px) {
  header h1,
  .flight-lane .card > h2,
  .flight-lane-prompt .card > h2,
  .flight-lane-output .card > h2,
  .dev-drawer .card > h2,
  .card > h2 {
    font-size: clamp(12px, 3.6vw, 15.5px) !important;
    line-height: .95 !important;
    letter-spacing: .045em !important;
    word-spacing: .015em !important;
    overflow-wrap: anywhere !important;
  }

  .flight-lane-output .output-card > h2,
  .flight-lane-output .seal-card h2,
  .flight-lane-output .copy-bin-card h2,
  .dev-drawer .card > h2,
  .dev-drawer .card > h2:has(+ .section-note) {
    font-size: clamp(12px, 3.5vw, 15px) !important;
    line-height: .95 !important;
    letter-spacing: .04em !important;
  }

  .flight-lane-prompt > .card:nth-of-type(3) {
    width: calc(100% - 18px) !important;
    max-width: calc(100% - 18px) !important;
    margin-left: auto !important;
    margin-right: auto !important;
    transform: translate(0, 6px) !important;
    -webkit-transform: translate(0, 6px) !important;
  }

  .flight-lane-prompt > .card:nth-of-type(4) {
    width: calc(100% - 18px) !important;
    max-width: calc(100% - 18px) !important;
    margin-left: auto !important;
    margin-right: auto !important;
    transform: translate(0, 7px) !important;
    -webkit-transform: translate(0, 7px) !important;
  }

  #authRoutePath {
    color: rgba(244, 255, 248, .98) !important;
    -webkit-text-fill-color: rgba(244, 255, 248, .98) !important;
    opacity: 1 !important;
    font-weight: 650 !important;
    text-shadow: 0 0 7px rgba(139, 255, 213, .12) !important;
  }

  #authRoutePath::placeholder {
    color: rgba(157, 178, 172, .38) !important;
    -webkit-text-fill-color: rgba(157, 178, 172, .38) !important;
    opacity: .38 !important;
  }
}

@media (max-width: 420px) {
  header h1,
  .flight-lane .card > h2,
  .flight-lane-prompt .card > h2,
  .flight-lane-output .card > h2,
  .dev-drawer .card > h2,
  .card > h2 {
    font-size: clamp(11px, 3.3vw, 14px) !important;
    line-height: .94 !important;
    letter-spacing: .04em !important;
  }
}


/* PR92_SENTINEL TD613 Flight dashboard polish: shelves, rail, payload */
/* PR93_SENTINEL TD613 Flight mobile heading/rail/footer correction */
/* PR94_SENTINEL TD613 Flight mobile correction replay */
@media (hover: none) and (max-width: 820px), (pointer: coarse) and (max-width: 820px) {
  header h1,
  .flight-lane .card > h2,
  .flight-lane-prompt .card > h2,
  .flight-lane-output .card > h2,
  .dev-drawer .card > h2 {
    font-size: clamp(15px, 4.8vw, 20px) !important;
    line-height: .94 !important;
    letter-spacing: .065em !important;
    overflow-wrap: anywhere !important;
  }

  .flight-lane-output .output-card > h2,
  .flight-lane-output .seal-card h2,
  .flight-lane-output .copy-bin-card h2 {
    font-size: clamp(15px, 4.7vw, 19px) !important;
  }

  .dev-drawer .card > h2 {
    font-size: clamp(14px, 4.5vw, 18px) !important;
    letter-spacing: .055em !important;
  }

  .dev-drawer .card > h2:has(+ .section-note) {
    font-size: clamp(14px, 4.4vw, 18px) !important;
  }

  .flight-lane-prompt > .card:nth-of-type(3),
  .flight-lane-prompt > .card:nth-of-type(4) {
    transform: translate(8px, 8px) !important;
    -webkit-transform: translate(8px, 8px) !important;
    max-width: calc(100% - 10px) !important;
    margin-bottom: 11px !important;
  }

  .flight-lane-prompt .card .checkbox-row,
  .flight-lane-prompt .card .radio-row {
    display: flex !important;
    flex-flow: row wrap !important;
    align-items: flex-start !important;
    align-content: flex-start !important;
    justify-content: flex-start !important;
    gap: 4px 5px !important;
    width: 100% !important;
    max-width: 100% !important;
    overflow: visible !important;
    grid-template-columns: none !important;
  }

  .flight-lane-prompt .card .checkbox-row > label,
  .flight-lane-prompt .card .radio-row > label {
    display: inline-flex !important;
    flex: 0 1 auto !important;
    align-items: center !important;
    justify-content: flex-start !important;
    gap: 4px !important;
    width: fit-content !important;
    min-width: 0 !important;
    max-width: min(10.4rem, 44vw) !important;
    min-height: 18px !important;
    height: auto !important;
    padding: 2px 6px !important;
    border-radius: 999px !important;
    font-size: 6.5px !important;
    line-height: 1.06 !important;
    letter-spacing: .002em !important;
    white-space: normal !important;
    overflow: visible !important;
    overflow-wrap: anywhere !important;
    text-overflow: clip !important;
    text-align: left !important;
  }

  .flight-lane-prompt .card .checkbox-row > label:nth-child(3n+1),
  .flight-lane-prompt .card .radio-row > label:nth-child(3n+1) {
    max-width: min(8.8rem, 39vw) !important;
  }

  .flight-lane-prompt .card .checkbox-row > label:nth-child(3n+2),
  .flight-lane-prompt .card .radio-row > label:nth-child(3n+2) {
    max-width: min(11.2rem, 47vw) !important;
  }

  .flight-lane-prompt .card .checkbox-row > label > input[type="checkbox"],
  .flight-lane-prompt .card .radio-row > label > input[type="radio"] {
    flex: 0 0 auto !important;
    width: 8px !important;
    min-width: 8px !important;
    height: 8px !important;
    min-height: 8px !important;
    margin: 0 !important;
  }

  .flight-lane-prompt .card .checkbox-row > label:has(input[type="text"]),
  .flight-lane-prompt .card .radio-row > label:has(input[type="text"]) {
    flex: 0 1 auto !important;
    width: fit-content !important;
    min-width: 0 !important;
    max-width: min(10.8rem, 45vw) !important;
    border-radius: 14px !important;
  }

  .flight-lane-prompt .card .checkbox-row > label input[type="text"],
  .flight-lane-prompt .card .radio-row > label input[type="text"] {
    width: clamp(3.8rem, 18vw, 5.8rem) !important;
    min-width: 0 !important;
    max-width: 100% !important;
    height: 13px !important;
    min-height: 13px !important;
    padding: 1px 4px !important;
    font-size: 6.5px !important;
    line-height: 1 !important;
  }

  .flight-lane-output .seal-card .section-note,
  .flight-lane-output .copy-bin-card .section-note {
    font-size: 8px !important;
    line-height: 1.15 !important;
    margin: 4px 0 7px !important;
  }

  .mobile-prompt-rail.mobile-prompt-rail-top {
    position: static !important;
    display: flex !important;
    float: none !important;
    inset: auto !important;
    right: auto !important;
    bottom: auto !important;
    left: auto !important;
    z-index: auto !important;
    width: fit-content !important;
    min-width: 0 !important;
    max-width: min(60vw, 14rem) !important;
    min-height: 18px !important;
    margin: 7px 0 10px auto !important;
    padding: 2px 6px !important;
    gap: 4px !important;
    justify-content: flex-end !important;
    align-items: center !important;
    border-color: rgba(255, 210, 98, .66) !important;
    background:
      linear-gradient(180deg, rgba(118, 69, 18, .96), rgba(34, 16, 5, .96)) !important;
    box-shadow: 0 0 14px rgba(255, 177, 59, .18), inset 0 1px 0 rgba(255, 239, 196, .14) !important;
  }

  .mobile-prompt-rail.mobile-prompt-rail-top span:first-child {
    font-size: 4.5px !important;
    line-height: 1 !important;
    letter-spacing: .12em !important;
    color: rgba(255, 239, 196, .92) !important;
    white-space: nowrap !important;
  }

  .mobile-prompt-rail.mobile-prompt-rail-top .mobile-prompt-rail-pill {
    min-width: 11px !important;
    padding: 1px 4px !important;
    font-size: 6px !important;
    line-height: 1 !important;
    color: rgba(255, 229, 133, .96) !important;
    border-color: rgba(255, 210, 98, .5) !important;
    background: rgba(72, 38, 10, .78) !important;
  }

  .dev-drawer .section-split-row {
    display: grid !important;
    grid-template-columns: minmax(0, .96fr) minmax(0, 1.04fr) !important;
    gap: 7px !important;
    align-items: start !important;
  }

  .dev-drawer .section-split-row > div {
    min-width: 0 !important;
    width: 100% !important;
    max-width: 100% !important;
    overflow: visible !important;
    padding: 7px !important;
    box-sizing: border-box !important;
  }

  .dev-drawer .section-split-row h3 {
    font-size: 9px !important;
    line-height: 1.02 !important;
  }

  .dev-drawer .section-split-row .small-label {
    font-size: 6px !important;
    line-height: 1.05 !important;
    letter-spacing: .07em !important;
  }

  .dev-drawer .section-split-row input,
  .dev-drawer .section-split-row .date-field {
    width: 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;
    box-sizing: border-box !important;
    font-size: 7px !important;
    min-height: 18px !important;
    height: 18px !important;
    padding: 2px 6px !important;
  }

  .dev-drawer .section-split-row .date-field {
    display: grid !important;
    grid-template-columns: minmax(0, 1fr) auto !important;
    gap: 3px !important;
    height: auto !important;
    padding: 0 !important;
  }

  .dev-drawer .section-split-row .date-field .icon-btn {
    width: 18px !important;
    height: 18px !important;
    min-width: 18px !important;
    min-height: 18px !important;
    padding: 2px !important;
  }

  .dev-drawer .section-split-row .row {
    gap: 4px !important;
    align-items: start !important;
  }

  .dev-drawer .section-split-row .checkbox-row > label {
    max-width: min(7.4rem, 43vw) !important;
    font-size: 5.7px !important;
    line-height: 1.04 !important;
    padding: 2px 5px !important;
  }

  .output-card .status-bar {
    display: grid !important;
    grid-template-columns: minmax(0, 1fr) auto !important;
    grid-template-areas: "counts auth" ". payload" !important;
    gap: 4px 8px !important;
    align-items: center !important;
  }

  .output-card #statusCounts {
    grid-area: counts !important;
  }

  .output-card .output-auth-toggle {
    grid-area: auth !important;
    justify-self: end !important;
    margin-left: 0 !important;
  }

  .output-card .status-bar .payload-stepper {
    grid-area: payload !important;
    justify-self: end !important;
    align-self: start !important;
    width: auto !important;
    min-width: 76px !important;
    max-width: 96px !important;
    height: 18px !important;
    min-height: 18px !important;
    margin: -1px 0 0 !important;
    padding: 1px 4px !important;
    gap: 3px !important;
    transform: none !important;
    -webkit-transform: none !important;
  }

  .output-card .status-bar .payload-stepper-label {
    font-size: 5px !important;
    line-height: 1 !important;
    max-width: 34px !important;
  }

  .output-card .status-bar .payload-stepper-value {
    font-size: 7px !important;
    line-height: 1 !important;
  }

  .output-card .status-bar .payload-stepper-btn,
  .output-card .status-bar .payload-stepper .icon-btn {
    width: 14px !important;
    min-width: 14px !important;
    height: 14px !important;
    min-height: 14px !important;
    padding: 0 !important;
    font-size: 8px !important;
    line-height: 1 !important;
  }

  .output-card .output-toolbar {
    margin-top: 6px !important;
    gap: 6px !important;
  }
}


/* PR91_SENTINEL TD613 Flight mobile tile controls restoration */
@media (hover: none) and (max-width: 820px), (pointer: coarse) and (max-width: 820px) {
  .flight-lane-prompt .card .section-note {
    font-size: 8px !important;
    line-height: 1.16 !important;
    margin: 4px 0 7px !important;
    max-width: 100% !important;
  }

  .flight-lane-prompt .card h3 {
    margin-top: 10px !important;
    margin-bottom: 5px !important;
    font-size: 9px !important;
    line-height: 1.05 !important;
  }

  .flight-lane-prompt .card .checkbox-row,
  .flight-lane-prompt .card .radio-row {
    display: grid !important;
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    gap: 4px 6px !important;
    align-items: stretch !important;
    align-content: stretch !important;
    justify-content: stretch !important;
    width: 100% !important;
    max-width: 100% !important;
    overflow: visible !important;
  }

  .flight-lane-prompt .card .checkbox-row > label,
  .flight-lane-prompt .card .radio-row > label {
    display: grid !important;
    grid-template-columns: auto minmax(0, 1fr) !important;
    align-items: center !important;
    justify-content: start !important;
    column-gap: 5px !important;
    width: 100% !important;
    min-width: 0 !important;
    max-width: 100% !important;
    min-height: 21px !important;
    height: auto !important;
    padding: 3px 6px !important;
    border-radius: 999px !important;
    font-size: 7px !important;
    line-height: 1.06 !important;
    letter-spacing: .005em !important;
    white-space: normal !important;
    overflow: visible !important;
    overflow-wrap: anywhere !important;
    text-overflow: clip !important;
    text-align: left !important;
  }

  .flight-lane-prompt .card .checkbox-row > label > input[type="checkbox"],
  .flight-lane-prompt .card .radio-row > label > input[type="radio"] {
    grid-column: 1 !important;
    flex: 0 0 auto !important;
    width: 9px !important;
    min-width: 9px !important;
    height: 9px !important;
    min-height: 9px !important;
    margin: 0 !important;
  }

  .flight-lane-prompt .card .checkbox-row > label:has(input[type="text"]),
  .flight-lane-prompt .card .radio-row > label:has(input[type="text"]) {
    grid-column: auto !important;
    grid-template-columns: auto minmax(0, 1fr) !important;
    border-radius: 14px !important;
  }

  .flight-lane-prompt .card .checkbox-row > label input[type="text"],
  .flight-lane-prompt .card .radio-row > label input[type="text"] {
    width: 100% !important;
    min-width: 0 !important;
    max-width: 100% !important;
    height: 15px !important;
    min-height: 15px !important;
    padding: 1px 5px !important;
    font-size: 7px !important;
    line-height: 1 !important;
  }

  .flight-lane-prompt .card .checkbox-row > label:has(input:only-child),
  .flight-lane-prompt .card .radio-row > label:has(input:only-child) {
    grid-template-columns: auto minmax(0, 1fr) !important;
  }

  .flight-lane-prompt .card .mobile-prompt-rail,
  .mobile-prompt-rail.mobile-prompt-rail-top {
    margin: 6px auto 12px !important;
    padding: 5px 9px !important;
    min-height: 26px !important;
    gap: 8px !important;
    border-radius: 999px !important;
    width: auto !important;
    max-width: min(92vw, 25rem) !important;
  }

  .mobile-prompt-rail span:first-child {
    font-size: 7px !important;
    line-height: 1 !important;
    white-space: nowrap !important;
  }

  .mobile-prompt-rail-pill {
    padding: 3px 7px !important;
    font-size: 6px !important;
    line-height: 1 !important;
  }
}

@media (hover: none) and (max-width: 460px), (pointer: coarse) and (max-width: 460px) {
  .flight-lane-prompt .card .checkbox-row,
  .flight-lane-prompt .card .radio-row {
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    gap: 3px 5px !important;
  }

  .flight-lane-prompt .card .checkbox-row > label,
  .flight-lane-prompt .card .radio-row > label {
    min-height: 19px !important;
    padding: 2px 5px !important;
    font-size: 6px !important;
  }

  .flight-lane-prompt .card .section-note {
    font-size: 7px !important;
    line-height: 1.14 !important;
  }
}


/* PR90_SENTINEL TD613 Flight seal side-by-side target/zwnj repair */
@media (hover: none), (pointer: coarse), (max-width: 820px) {
  .flight-lane .seal-card .section-split-row {
    display: grid !important;
    grid-template-columns: minmax(0, .92fr) minmax(0, 1.08fr) !important;
    grid-template-areas: "target zwnj" !important;
    gap: 7px !important;
    align-items: stretch !important;
  }

  .flight-lane .seal-card .section-split-row > div:first-child {
    grid-area: zwnj !important;
    align-self: stretch !important;
    margin-top: 0 !important;
    transform: none !important;
    -webkit-transform: none !important;
  }

  .flight-lane .seal-card .section-split-row > div:nth-child(2) {
    grid-area: target !important;
    align-self: stretch !important;
    min-height: 100% !important;
    transform: none !important;
    -webkit-transform: none !important;
  }

  .flight-lane .seal-card .section-split-row > div {
    min-width: 0 !important;
    padding: 7px 8px !important;
  }

  .flight-lane .seal-card .section-split-row .small-label {
    font-size: 6px !important;
    line-height: 1.1 !important;
    letter-spacing: .09em !important;
  }

  .flight-lane .seal-card #sealTargetWord {
    width: 100% !important;
    max-width: 100% !important;
  }

  .flight-lane .seal-card .section-split-row .radio-row {
    display: flex !important;
    flex-wrap: wrap !important;
    gap: 4px 5px !important;
    align-content: flex-start !important;
  }

  .flight-lane .seal-card .section-split-row .radio-row label {
    flex: 0 1 auto !important;
    min-width: 0 !important;
    max-width: 100% !important;
    min-height: 15px !important;
    padding: 2px 5px !important;
    font-size: 5px !important;
    line-height: 1.08 !important;
    white-space: normal !important;
  }
}

@media (hover: none) and (pointer: coarse) and (max-width: 520px) {
  .flight-lane .seal-card .section-split-row {
    grid-template-columns: minmax(0, .92fr) minmax(0, 1.08fr) !important;
    grid-template-areas: "target zwnj" !important;
  }

  .flight-lane .seal-card .section-split-row > div:first-child,
  .flight-lane .seal-card .section-split-row > div:nth-child(2) {
    transform: none !important;
    -webkit-transform: none !important;
  }
}



/* PR93_SENTINEL TD613 Flight mobile heading/rail/footer correction */
/* PR94_SENTINEL TD613 Flight mobile correction replay */
@media (hover: none) and (max-width: 820px), (pointer: coarse) and (max-width: 820px) {
  header h1,
  .flight-lane .card > h2,
  .flight-lane-prompt .card > h2,
  .flight-lane-output .card > h2,
  .dev-drawer .card > h2 {
    font-size: clamp(15px, 4.8vw, 20px) !important;
    line-height: .94 !important;
    letter-spacing: .065em !important;
    overflow-wrap: anywhere !important;
  }

  .flight-lane-output .output-card > h2,
  .flight-lane-output .seal-card h2,
  .flight-lane-output .copy-bin-card h2 {
    font-size: clamp(15px, 4.7vw, 19px) !important;
  }

  .dev-drawer .card > h2 {
    font-size: clamp(14px, 4.5vw, 18px) !important;
    letter-spacing: .055em !important;
  }

  .dev-drawer .card > h2:has(+ .section-note) {
    font-size: clamp(14px, 4.4vw, 18px) !important;
  }

  .flight-lane-prompt > .card:nth-of-type(3),
  .flight-lane-prompt > .card:nth-of-type(4) {
    transform: translate(8px, 8px) !important;
    -webkit-transform: translate(8px, 8px) !important;
    max-width: calc(100% - 10px) !important;
    margin-bottom: 11px !important;
  }

  .flight-lane-prompt .card .checkbox-row,
  .flight-lane-prompt .card .radio-row {
    display: flex !important;
    flex-flow: row wrap !important;
    align-items: flex-start !important;
    align-content: flex-start !important;
    justify-content: flex-start !important;
    gap: 4px 5px !important;
    width: 100% !important;
    max-width: 100% !important;
    overflow: visible !important;
    grid-template-columns: none !important;
  }

  .flight-lane-prompt .card .checkbox-row > label,
  .flight-lane-prompt .card .radio-row > label {
    display: inline-flex !important;
    flex: 0 1 auto !important;
    align-items: center !important;
    justify-content: flex-start !important;
    gap: 4px !important;
    width: fit-content !important;
    min-width: 0 !important;
    max-width: min(10.4rem, 44vw) !important;
    min-height: 18px !important;
    height: auto !important;
    padding: 2px 6px !important;
    border-radius: 999px !important;
    font-size: 6.5px !important;
    line-height: 1.06 !important;
    letter-spacing: .002em !important;
    white-space: normal !important;
    overflow: visible !important;
    overflow-wrap: anywhere !important;
    text-overflow: clip !important;
    text-align: left !important;
  }

  .flight-lane-prompt .card .checkbox-row > label:nth-child(3n+1),
  .flight-lane-prompt .card .radio-row > label:nth-child(3n+1) {
    max-width: min(8.8rem, 39vw) !important;
  }

  .flight-lane-prompt .card .checkbox-row > label:nth-child(3n+2),
  .flight-lane-prompt .card .radio-row > label:nth-child(3n+2) {
    max-width: min(11.2rem, 47vw) !important;
  }

  .flight-lane-prompt .card .checkbox-row > label > input[type="checkbox"],
  .flight-lane-prompt .card .radio-row > label > input[type="radio"] {
    flex: 0 0 auto !important;
    width: 8px !important;
    min-width: 8px !important;
    height: 8px !important;
    min-height: 8px !important;
    margin: 0 !important;
  }

  .flight-lane-prompt .card .checkbox-row > label:has(input[type="text"]),
  .flight-lane-prompt .card .radio-row > label:has(input[type="text"]) {
    flex: 0 1 auto !important;
    width: fit-content !important;
    min-width: 0 !important;
    max-width: min(10.8rem, 45vw) !important;
    border-radius: 14px !important;
  }

  .flight-lane-prompt .card .checkbox-row > label input[type="text"],
  .flight-lane-prompt .card .radio-row > label input[type="text"] {
    width: clamp(3.8rem, 18vw, 5.8rem) !important;
    min-width: 0 !important;
    max-width: 100% !important;
    height: 13px !important;
    min-height: 13px !important;
    padding: 1px 4px !important;
    font-size: 6.5px !important;
    line-height: 1 !important;
  }

  .flight-lane-output .seal-card .section-note,
  .flight-lane-output .copy-bin-card .section-note {
    font-size: 8px !important;
    line-height: 1.15 !important;
    margin: 4px 0 7px !important;
  }

  .mobile-prompt-rail.mobile-prompt-rail-top {
    position: static !important;
    display: flex !important;
    float: none !important;
    inset: auto !important;
    right: auto !important;
    bottom: auto !important;
    left: auto !important;
    z-index: auto !important;
    width: fit-content !important;
    min-width: 0 !important;
    max-width: min(60vw, 14rem) !important;
    min-height: 18px !important;
    margin: 7px 0 10px auto !important;
    padding: 2px 6px !important;
    gap: 4px !important;
    justify-content: flex-end !important;
    align-items: center !important;
    border-color: rgba(255, 210, 98, .66) !important;
    background:
      linear-gradient(180deg, rgba(118, 69, 18, .96), rgba(34, 16, 5, .96)) !important;
    box-shadow: 0 0 14px rgba(255, 177, 59, .18), inset 0 1px 0 rgba(255, 239, 196, .14) !important;
  }

  .mobile-prompt-rail.mobile-prompt-rail-top span:first-child {
    font-size: 4.5px !important;
    line-height: 1 !important;
    letter-spacing: .12em !important;
    color: rgba(255, 239, 196, .92) !important;
    white-space: nowrap !important;
  }

  .mobile-prompt-rail.mobile-prompt-rail-top .mobile-prompt-rail-pill {
    min-width: 11px !important;
    padding: 1px 4px !important;
    font-size: 6px !important;
    line-height: 1 !important;
    color: rgba(255, 229, 133, .96) !important;
    border-color: rgba(255, 210, 98, .5) !important;
    background: rgba(72, 38, 10, .78) !important;
  }

  .dev-drawer .section-split-row {
    display: grid !important;
    grid-template-columns: minmax(0, .96fr) minmax(0, 1.04fr) !important;
    gap: 7px !important;
    align-items: start !important;
  }

  .dev-drawer .section-split-row > div {
    min-width: 0 !important;
    width: 100% !important;
    max-width: 100% !important;
    overflow: visible !important;
    padding: 7px !important;
    box-sizing: border-box !important;
  }

  .dev-drawer .section-split-row h3 {
    font-size: 9px !important;
    line-height: 1.02 !important;
  }

  .dev-drawer .section-split-row .small-label {
    font-size: 6px !important;
    line-height: 1.05 !important;
    letter-spacing: .07em !important;
  }

  .dev-drawer .section-split-row input,
  .dev-drawer .section-split-row .date-field {
    width: 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;
    box-sizing: border-box !important;
    font-size: 7px !important;
    min-height: 18px !important;
    height: 18px !important;
    padding: 2px 6px !important;
  }

  .dev-drawer .section-split-row .date-field {
    display: grid !important;
    grid-template-columns: minmax(0, 1fr) auto !important;
    gap: 3px !important;
    height: auto !important;
    padding: 0 !important;
  }

  .dev-drawer .section-split-row .date-field .icon-btn {
    width: 18px !important;
    height: 18px !important;
    min-width: 18px !important;
    min-height: 18px !important;
    padding: 2px !important;
  }

  .dev-drawer .section-split-row .row {
    gap: 4px !important;
    align-items: start !important;
  }

  .dev-drawer .section-split-row .checkbox-row > label {
    max-width: min(7.4rem, 43vw) !important;
    font-size: 5.7px !important;
    line-height: 1.04 !important;
    padding: 2px 5px !important;
  }

  .output-card .status-bar {
    display: grid !important;
    grid-template-columns: minmax(0, 1fr) auto !important;
    grid-template-areas: "counts auth" ". payload" !important;
    gap: 4px 8px !important;
    align-items: center !important;
  }

  .output-card #statusCounts {
    grid-area: counts !important;
  }

  .output-card .output-auth-toggle {
    grid-area: auth !important;
    justify-self: end !important;
    margin-left: 0 !important;
  }

  .output-card .status-bar .payload-stepper {
    grid-area: payload !important;
    justify-self: end !important;
    align-self: start !important;
    width: auto !important;
    min-width: 76px !important;
    max-width: 96px !important;
    height: 18px !important;
    min-height: 18px !important;
    margin: -1px 0 0 !important;
    padding: 1px 4px !important;
    gap: 3px !important;
    transform: none !important;
    -webkit-transform: none !important;
  }

  .output-card .status-bar .payload-stepper-label {
    font-size: 5px !important;
    line-height: 1 !important;
    max-width: 34px !important;
  }

  .output-card .status-bar .payload-stepper-value {
    font-size: 7px !important;
    line-height: 1 !important;
  }

  .output-card .status-bar .payload-stepper-btn,
  .output-card .status-bar .payload-stepper .icon-btn {
    width: 14px !important;
    min-width: 14px !important;
    height: 14px !important;
    min-height: 14px !important;
    padding: 0 !important;
    font-size: 8px !important;
    line-height: 1 !important;
  }

  .output-card .output-toolbar {
    margin-top: 6px !important;
    gap: 6px !important;
  }
}



/* PR93_SENTINEL TD613 Flight mobile heading/rail/footer correction */
/* PR94_SENTINEL TD613 Flight mobile correction replay */
@media (hover: none) and (max-width: 820px), (pointer: coarse) and (max-width: 820px) {
  header h1,
  .flight-lane .card > h2,
  .flight-lane-prompt .card > h2,
  .flight-lane-output .card > h2,
  .dev-drawer .card > h2 {
    font-size: clamp(15px, 4.8vw, 20px) !important;
    line-height: .94 !important;
    letter-spacing: .065em !important;
    overflow-wrap: anywhere !important;
  }

  .flight-lane-output .output-card > h2,
  .flight-lane-output .seal-card h2,
  .flight-lane-output .copy-bin-card h2 {
    font-size: clamp(15px, 4.7vw, 19px) !important;
  }

  .dev-drawer .card > h2 {
    font-size: clamp(14px, 4.5vw, 18px) !important;
    letter-spacing: .055em !important;
  }

  .dev-drawer .card > h2:has(+ .section-note) {
    font-size: clamp(14px, 4.4vw, 18px) !important;
  }

  .flight-lane-prompt > .card:nth-of-type(3),
  .flight-lane-prompt > .card:nth-of-type(4) {
    transform: translate(8px, 8px) !important;
    -webkit-transform: translate(8px, 8px) !important;
    max-width: calc(100% - 10px) !important;
    margin-bottom: 11px !important;
  }

  .flight-lane-prompt .card .checkbox-row,
  .flight-lane-prompt .card .radio-row {
    display: flex !important;
    flex-flow: row wrap !important;
    align-items: flex-start !important;
    align-content: flex-start !important;
    justify-content: flex-start !important;
    gap: 4px 5px !important;
    width: 100% !important;
    max-width: 100% !important;
    overflow: visible !important;
    grid-template-columns: none !important;
  }

  .flight-lane-prompt .card .checkbox-row > label,
  .flight-lane-prompt .card .radio-row > label {
    display: inline-flex !important;
    flex: 0 1 auto !important;
    align-items: center !important;
    justify-content: flex-start !important;
    gap: 4px !important;
    width: fit-content !important;
    min-width: 0 !important;
    max-width: min(10.4rem, 44vw) !important;
    min-height: 18px !important;
    height: auto !important;
    padding: 2px 6px !important;
    border-radius: 999px !important;
    font-size: 6.5px !important;
    line-height: 1.06 !important;
    letter-spacing: .002em !important;
    white-space: normal !important;
    overflow: visible !important;
    overflow-wrap: anywhere !important;
    text-overflow: clip !important;
    text-align: left !important;
  }

  .flight-lane-prompt .card .checkbox-row > label:nth-child(3n+1),
  .flight-lane-prompt .card .radio-row > label:nth-child(3n+1) {
    max-width: min(8.8rem, 39vw) !important;
  }

  .flight-lane-prompt .card .checkbox-row > label:nth-child(3n+2),
  .flight-lane-prompt .card .radio-row > label:nth-child(3n+2) {
    max-width: min(11.2rem, 47vw) !important;
  }

  .flight-lane-prompt .card .checkbox-row > label > input[type="checkbox"],
  .flight-lane-prompt .card .radio-row > label > input[type="radio"] {
    flex: 0 0 auto !important;
    width: 8px !important;
    min-width: 8px !important;
    height: 8px !important;
    min-height: 8px !important;
    margin: 0 !important;
  }

  .flight-lane-prompt .card .checkbox-row > label:has(input[type="text"]),
  .flight-lane-prompt .card .radio-row > label:has(input[type="text"]) {
    flex: 0 1 auto !important;
    width: fit-content !important;
    min-width: 0 !important;
    max-width: min(10.8rem, 45vw) !important;
    border-radius: 14px !important;
  }

  .flight-lane-prompt .card .checkbox-row > label input[type="text"],
  .flight-lane-prompt .card .radio-row > label input[type="text"] {
    width: clamp(3.8rem, 18vw, 5.8rem) !important;
    min-width: 0 !important;
    max-width: 100% !important;
    height: 13px !important;
    min-height: 13px !important;
    padding: 1px 4px !important;
    font-size: 6.5px !important;
    line-height: 1 !important;
  }

  .flight-lane-output .seal-card .section-note,
  .flight-lane-output .copy-bin-card .section-note {
    font-size: 8px !important;
    line-height: 1.15 !important;
    margin: 4px 0 7px !important;
  }

  .mobile-prompt-rail.mobile-prompt-rail-top {
    position: static !important;
    display: flex !important;
    float: none !important;
    inset: auto !important;
    right: auto !important;
    bottom: auto !important;
    left: auto !important;
    z-index: auto !important;
    width: fit-content !important;
    min-width: 0 !important;
    max-width: min(60vw, 14rem) !important;
    min-height: 18px !important;
    margin: 7px 0 10px auto !important;
    padding: 2px 6px !important;
    gap: 4px !important;
    justify-content: flex-end !important;
    align-items: center !important;
    border-color: rgba(255, 210, 98, .66) !important;
    background:
      linear-gradient(180deg, rgba(118, 69, 18, .96), rgba(34, 16, 5, .96)) !important;
    box-shadow: 0 0 14px rgba(255, 177, 59, .18), inset 0 1px 0 rgba(255, 239, 196, .14) !important;
  }

  .mobile-prompt-rail.mobile-prompt-rail-top span:first-child {
    font-size: 4.5px !important;
    line-height: 1 !important;
    letter-spacing: .12em !important;
    color: rgba(255, 239, 196, .92) !important;
    white-space: nowrap !important;
  }

  .mobile-prompt-rail.mobile-prompt-rail-top .mobile-prompt-rail-pill {
    min-width: 11px !important;
    padding: 1px 4px !important;
    font-size: 6px !important;
    line-height: 1 !important;
    color: rgba(255, 229, 133, .96) !important;
    border-color: rgba(255, 210, 98, .5) !important;
    background: rgba(72, 38, 10, .78) !important;
  }

  .dev-drawer .section-split-row {
    display: grid !important;
    grid-template-columns: minmax(0, .96fr) minmax(0, 1.04fr) !important;
    gap: 7px !important;
    align-items: start !important;
  }

  .dev-drawer .section-split-row > div {
    min-width: 0 !important;
    width: 100% !important;
    max-width: 100% !important;
    overflow: visible !important;
    padding: 7px !important;
    box-sizing: border-box !important;
  }

  .dev-drawer .section-split-row h3 {
    font-size: 9px !important;
    line-height: 1.02 !important;
  }

  .dev-drawer .section-split-row .small-label {
    font-size: 6px !important;
    line-height: 1.05 !important;
    letter-spacing: .07em !important;
  }

  .dev-drawer .section-split-row input,
  .dev-drawer .section-split-row .date-field {
    width: 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;
    box-sizing: border-box !important;
    font-size: 7px !important;
    min-height: 18px !important;
    height: 18px !important;
    padding: 2px 6px !important;
  }

  .dev-drawer .section-split-row .date-field {
    display: grid !important;
    grid-template-columns: minmax(0, 1fr) auto !important;
    gap: 3px !important;
    height: auto !important;
    padding: 0 !important;
  }

  .dev-drawer .section-split-row .date-field .icon-btn {
    width: 18px !important;
    height: 18px !important;
    min-width: 18px !important;
    min-height: 18px !important;
    padding: 2px !important;
  }

  .dev-drawer .section-split-row .row {
    gap: 4px !important;
    align-items: start !important;
  }

  .dev-drawer .section-split-row .checkbox-row > label {
    max-width: min(7.4rem, 43vw) !important;
    font-size: 5.7px !important;
    line-height: 1.04 !important;
    padding: 2px 5px !important;
  }

  .output-card .status-bar {
    display: grid !important;
    grid-template-columns: minmax(0, 1fr) auto !important;
    grid-template-areas: "counts auth" ". payload" !important;
    gap: 4px 8px !important;
    align-items: center !important;
  }

  .output-card #statusCounts {
    grid-area: counts !important;
  }

  .output-card .output-auth-toggle {
    grid-area: auth !important;
    justify-self: end !important;
    margin-left: 0 !important;
  }

  .output-card .status-bar .payload-stepper {
    grid-area: payload !important;
    justify-self: end !important;
    align-self: start !important;
    width: auto !important;
    min-width: 76px !important;
    max-width: 96px !important;
    height: 18px !important;
    min-height: 18px !important;
    margin: -1px 0 0 !important;
    padding: 1px 4px !important;
    gap: 3px !important;
    transform: none !important;
    -webkit-transform: none !important;
  }

  .output-card .status-bar .payload-stepper-label {
    font-size: 5px !important;
    line-height: 1 !important;
    max-width: 34px !important;
  }

  .output-card .status-bar .payload-stepper-value {
    font-size: 7px !important;
    line-height: 1 !important;
  }

  .output-card .status-bar .payload-stepper-btn,
  .output-card .status-bar .payload-stepper .icon-btn {
    width: 14px !important;
    min-width: 14px !important;
    height: 14px !important;
    min-height: 14px !important;
    padding: 0 !important;
    font-size: 8px !important;
    line-height: 1 !important;
  }

  .output-card .output-toolbar {
    margin-top: 6px !important;
    gap: 6px !important;
  }
}



/* PR93_SENTINEL TD613 Flight mobile heading/rail/footer correction */
/* PR94_SENTINEL TD613 Flight mobile correction replay */
@media (hover: none) and (max-width: 820px), (pointer: coarse) and (max-width: 820px) {
  header h1,
  .flight-lane .card > h2,
  .flight-lane-prompt .card > h2,
  .flight-lane-output .card > h2,
  .dev-drawer .card > h2 {
    font-size: clamp(15px, 4.8vw, 20px) !important;
    line-height: .94 !important;
    letter-spacing: .065em !important;
    overflow-wrap: anywhere !important;
  }

  .flight-lane-output .output-card > h2,
  .flight-lane-output .seal-card h2,
  .flight-lane-output .copy-bin-card h2 {
    font-size: clamp(15px, 4.7vw, 19px) !important;
  }

  .dev-drawer .card > h2 {
    font-size: clamp(14px, 4.5vw, 18px) !important;
    letter-spacing: .055em !important;
  }

  .dev-drawer .card > h2:has(+ .section-note) {
    font-size: clamp(14px, 4.4vw, 18px) !important;
  }

  .flight-lane-prompt > .card:nth-of-type(3),
  .flight-lane-prompt > .card:nth-of-type(4) {
    transform: translate(8px, 8px) !important;
    -webkit-transform: translate(8px, 8px) !important;
    max-width: calc(100% - 10px) !important;
    margin-bottom: 11px !important;
  }

  .flight-lane-prompt .card .checkbox-row,
  .flight-lane-prompt .card .radio-row {
    display: flex !important;
    flex-flow: row wrap !important;
    align-items: flex-start !important;
    align-content: flex-start !important;
    justify-content: flex-start !important;
    gap: 4px 5px !important;
    width: 100% !important;
    max-width: 100% !important;
    overflow: visible !important;
    grid-template-columns: none !important;
  }

  .flight-lane-prompt .card .checkbox-row > label,
  .flight-lane-prompt .card .radio-row > label {
    display: inline-flex !important;
    flex: 0 1 auto !important;
    align-items: center !important;
    justify-content: flex-start !important;
    gap: 4px !important;
    width: fit-content !important;
    min-width: 0 !important;
    max-width: min(10.4rem, 44vw) !important;
    min-height: 18px !important;
    height: auto !important;
    padding: 2px 6px !important;
    border-radius: 999px !important;
    font-size: 6.5px !important;
    line-height: 1.06 !important;
    letter-spacing: .002em !important;
    white-space: normal !important;
    overflow: visible !important;
    overflow-wrap: anywhere !important;
    text-overflow: clip !important;
    text-align: left !important;
  }

  .flight-lane-prompt .card .checkbox-row > label:nth-child(3n+1),
  .flight-lane-prompt .card .radio-row > label:nth-child(3n+1) {
    max-width: min(8.8rem, 39vw) !important;
  }

  .flight-lane-prompt .card .checkbox-row > label:nth-child(3n+2),
  .flight-lane-prompt .card .radio-row > label:nth-child(3n+2) {
    max-width: min(11.2rem, 47vw) !important;
  }

  .flight-lane-prompt .card .checkbox-row > label > input[type="checkbox"],
  .flight-lane-prompt .card .radio-row > label > input[type="radio"] {
    flex: 0 0 auto !important;
    width: 8px !important;
    min-width: 8px !important;
    height: 8px !important;
    min-height: 8px !important;
    margin: 0 !important;
  }

  .flight-lane-prompt .card .checkbox-row > label:has(input[type="text"]),
  .flight-lane-prompt .card .radio-row > label:has(input[type="text"]) {
    flex: 0 1 auto !important;
    width: fit-content !important;
    min-width: 0 !important;
    max-width: min(10.8rem, 45vw) !important;
    border-radius: 14px !important;
  }

  .flight-lane-prompt .card .checkbox-row > label input[type="text"],
  .flight-lane-prompt .card .radio-row > label input[type="text"] {
    width: clamp(3.8rem, 18vw, 5.8rem) !important;
    min-width: 0 !important;
    max-width: 100% !important;
    height: 13px !important;
    min-height: 13px !important;
    padding: 1px 4px !important;
    font-size: 6.5px !important;
    line-height: 1 !important;
  }

  .flight-lane-output .seal-card .section-note,
  .flight-lane-output .copy-bin-card .section-note {
    font-size: 8px !important;
    line-height: 1.15 !important;
    margin: 4px 0 7px !important;
  }

  .mobile-prompt-rail.mobile-prompt-rail-top {
    position: static !important;
    display: flex !important;
    float: none !important;
    inset: auto !important;
    right: auto !important;
    bottom: auto !important;
    left: auto !important;
    z-index: auto !important;
    width: fit-content !important;
    min-width: 0 !important;
    max-width: min(60vw, 14rem) !important;
    min-height: 18px !important;
    margin: 7px 0 10px auto !important;
    padding: 2px 6px !important;
    gap: 4px !important;
    justify-content: flex-end !important;
    align-items: center !important;
    border-color: rgba(255, 210, 98, .66) !important;
    background:
      linear-gradient(180deg, rgba(118, 69, 18, .96), rgba(34, 16, 5, .96)) !important;
    box-shadow: 0 0 14px rgba(255, 177, 59, .18), inset 0 1px 0 rgba(255, 239, 196, .14) !important;
  }

  .mobile-prompt-rail.mobile-prompt-rail-top span:first-child {
    font-size: 4.5px !important;
    line-height: 1 !important;
    letter-spacing: .12em !important;
    color: rgba(255, 239, 196, .92) !important;
    white-space: nowrap !important;
  }

  .mobile-prompt-rail.mobile-prompt-rail-top .mobile-prompt-rail-pill {
    min-width: 11px !important;
    padding: 1px 4px !important;
    font-size: 6px !important;
    line-height: 1 !important;
    color: rgba(255, 229, 133, .96) !important;
    border-color: rgba(255, 210, 98, .5) !important;
    background: rgba(72, 38, 10, .78) !important;
  }

  .dev-drawer .section-split-row {
    display: grid !important;
    grid-template-columns: minmax(0, .96fr) minmax(0, 1.04fr) !important;
    gap: 7px !important;
    align-items: start !important;
  }

  .dev-drawer .section-split-row > div {
    min-width: 0 !important;
    width: 100% !important;
    max-width: 100% !important;
    overflow: visible !important;
    padding: 7px !important;
    box-sizing: border-box !important;
  }

  .dev-drawer .section-split-row h3 {
    font-size: 9px !important;
    line-height: 1.02 !important;
  }

  .dev-drawer .section-split-row .small-label {
    font-size: 6px !important;
    line-height: 1.05 !important;
    letter-spacing: .07em !important;
  }

  .dev-drawer .section-split-row input,
  .dev-drawer .section-split-row .date-field {
    width: 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;
    box-sizing: border-box !important;
    font-size: 7px !important;
    min-height: 18px !important;
    height: 18px !important;
    padding: 2px 6px !important;
  }

  .dev-drawer .section-split-row .date-field {
    display: grid !important;
    grid-template-columns: minmax(0, 1fr) auto !important;
    gap: 3px !important;
    height: auto !important;
    padding: 0 !important;
  }

  .dev-drawer .section-split-row .date-field .icon-btn {
    width: 18px !important;
    height: 18px !important;
    min-width: 18px !important;
    min-height: 18px !important;
    padding: 2px !important;
  }

  .dev-drawer .section-split-row .row {
    gap: 4px !important;
    align-items: start !important;
  }

  .dev-drawer .section-split-row .checkbox-row > label {
    max-width: min(7.4rem, 43vw) !important;
    font-size: 5.7px !important;
    line-height: 1.04 !important;
    padding: 2px 5px !important;
  }

  .output-card .status-bar {
    display: grid !important;
    grid-template-columns: minmax(0, 1fr) auto !important;
    grid-template-areas: "counts auth" ". payload" !important;
    gap: 4px 8px !important;
    align-items: center !important;
  }

  .output-card #statusCounts {
    grid-area: counts !important;
  }

  .output-card .output-auth-toggle {
    grid-area: auth !important;
    justify-self: end !important;
    margin-left: 0 !important;
  }

  .output-card .status-bar .payload-stepper {
    grid-area: payload !important;
    justify-self: end !important;
    align-self: start !important;
    width: auto !important;
    min-width: 76px !important;
    max-width: 96px !important;
    height: 18px !important;
    min-height: 18px !important;
    margin: -1px 0 0 !important;
    padding: 1px 4px !important;
    gap: 3px !important;
    transform: none !important;
    -webkit-transform: none !important;
  }

  .output-card .status-bar .payload-stepper-label {
    font-size: 5px !important;
    line-height: 1 !important;
    max-width: 34px !important;
  }

  .output-card .status-bar .payload-stepper-value {
    font-size: 7px !important;
    line-height: 1 !important;
  }

  .output-card .status-bar .payload-stepper-btn,
  .output-card .status-bar .payload-stepper .icon-btn {
    width: 14px !important;
    min-width: 14px !important;
    height: 14px !important;
    min-height: 14px !important;
    padding: 0 !important;
    font-size: 8px !important;
    line-height: 1 !important;
  }

  .output-card .output-toolbar {
    margin-top: 6px !important;
    gap: 6px !important;
  }
}



/* PR93_SENTINEL TD613 Flight mobile heading/rail/footer correction */
/* PR94_SENTINEL TD613 Flight mobile correction replay */
@media (hover: none) and (max-width: 820px), (pointer: coarse) and (max-width: 820px) {
  header h1,
  .flight-lane .card > h2,
  .flight-lane-prompt .card > h2,
  .flight-lane-output .card > h2,
  .dev-drawer .card > h2 {
    font-size: clamp(15px, 4.8vw, 20px) !important;
    line-height: .94 !important;
    letter-spacing: .065em !important;
    overflow-wrap: anywhere !important;
  }

  .flight-lane-output .output-card > h2,
  .flight-lane-output .seal-card h2,
  .flight-lane-output .copy-bin-card h2 {
    font-size: clamp(15px, 4.7vw, 19px) !important;
  }

  .dev-drawer .card > h2 {
    font-size: clamp(14px, 4.5vw, 18px) !important;
    letter-spacing: .055em !important;
  }

  .dev-drawer .card > h2:has(+ .section-note) {
    font-size: clamp(14px, 4.4vw, 18px) !important;
  }

  .flight-lane-prompt > .card:nth-of-type(3),
  .flight-lane-prompt > .card:nth-of-type(4) {
    transform: translate(8px, 8px) !important;
    -webkit-transform: translate(8px, 8px) !important;
    max-width: calc(100% - 10px) !important;
    margin-bottom: 11px !important;
  }

  .flight-lane-prompt .card .checkbox-row,
  .flight-lane-prompt .card .radio-row {
    display: flex !important;
    flex-flow: row wrap !important;
    align-items: flex-start !important;
    align-content: flex-start !important;
    justify-content: flex-start !important;
    gap: 4px 5px !important;
    width: 100% !important;
    max-width: 100% !important;
    overflow: visible !important;
    grid-template-columns: none !important;
  }

  .flight-lane-prompt .card .checkbox-row > label,
  .flight-lane-prompt .card .radio-row > label {
    display: inline-flex !important;
    flex: 0 1 auto !important;
    align-items: center !important;
    justify-content: flex-start !important;
    gap: 4px !important;
    width: fit-content !important;
    min-width: 0 !important;
    max-width: min(10.4rem, 44vw) !important;
    min-height: 18px !important;
    height: auto !important;
    padding: 2px 6px !important;
    border-radius: 999px !important;
    font-size: 6.5px !important;
    line-height: 1.06 !important;
    letter-spacing: .002em !important;
    white-space: normal !important;
    overflow: visible !important;
    overflow-wrap: anywhere !important;
    text-overflow: clip !important;
    text-align: left !important;
  }

  .flight-lane-prompt .card .checkbox-row > label:nth-child(3n+1),
  .flight-lane-prompt .card .radio-row > label:nth-child(3n+1) {
    max-width: min(8.8rem, 39vw) !important;
  }

  .flight-lane-prompt .card .checkbox-row > label:nth-child(3n+2),
  .flight-lane-prompt .card .radio-row > label:nth-child(3n+2) {
    max-width: min(11.2rem, 47vw) !important;
  }

  .flight-lane-prompt .card .checkbox-row > label > input[type="checkbox"],
  .flight-lane-prompt .card .radio-row > label > input[type="radio"] {
    flex: 0 0 auto !important;
    width: 8px !important;
    min-width: 8px !important;
    height: 8px !important;
    min-height: 8px !important;
    margin: 0 !important;
  }

  .flight-lane-prompt .card .checkbox-row > label:has(input[type="text"]),
  .flight-lane-prompt .card .radio-row > label:has(input[type="text"]) {
    flex: 0 1 auto !important;
    width: fit-content !important;
    min-width: 0 !important;
    max-width: min(10.8rem, 45vw) !important;
    border-radius: 14px !important;
  }

  .flight-lane-prompt .card .checkbox-row > label input[type="text"],
  .flight-lane-prompt .card .radio-row > label input[type="text"] {
    width: clamp(3.8rem, 18vw, 5.8rem) !important;
    min-width: 0 !important;
    max-width: 100% !important;
    height: 13px !important;
    min-height: 13px !important;
    padding: 1px 4px !important;
    font-size: 6.5px !important;
    line-height: 1 !important;
  }

  .flight-lane-output .seal-card .section-note,
  .flight-lane-output .copy-bin-card .section-note {
    font-size: 8px !important;
    line-height: 1.15 !important;
    margin: 4px 0 7px !important;
  }

  .mobile-prompt-rail.mobile-prompt-rail-top {
    position: static !important;
    display: flex !important;
    float: none !important;
    inset: auto !important;
    right: auto !important;
    bottom: auto !important;
    left: auto !important;
    z-index: auto !important;
    width: fit-content !important;
    min-width: 0 !important;
    max-width: min(60vw, 14rem) !important;
    min-height: 18px !important;
    margin: 7px 0 10px auto !important;
    padding: 2px 6px !important;
    gap: 4px !important;
    justify-content: flex-end !important;
    align-items: center !important;
    border-color: rgba(255, 210, 98, .66) !important;
    background:
      linear-gradient(180deg, rgba(118, 69, 18, .96), rgba(34, 16, 5, .96)) !important;
    box-shadow: 0 0 14px rgba(255, 177, 59, .18), inset 0 1px 0 rgba(255, 239, 196, .14) !important;
  }

  .mobile-prompt-rail.mobile-prompt-rail-top span:first-child {
    font-size: 4.5px !important;
    line-height: 1 !important;
    letter-spacing: .12em !important;
    color: rgba(255, 239, 196, .92) !important;
    white-space: nowrap !important;
  }

  .mobile-prompt-rail.mobile-prompt-rail-top .mobile-prompt-rail-pill {
    min-width: 11px !important;
    padding: 1px 4px !important;
    font-size: 6px !important;
    line-height: 1 !important;
    color: rgba(255, 229, 133, .96) !important;
    border-color: rgba(255, 210, 98, .5) !important;
    background: rgba(72, 38, 10, .78) !important;
  }

  .dev-drawer .section-split-row {
    display: grid !important;
    grid-template-columns: minmax(0, .96fr) minmax(0, 1.04fr) !important;
    gap: 7px !important;
    align-items: start !important;
  }

  .dev-drawer .section-split-row > div {
    min-width: 0 !important;
    width: 100% !important;
    max-width: 100% !important;
    overflow: visible !important;
    padding: 7px !important;
    box-sizing: border-box !important;
  }

  .dev-drawer .section-split-row h3 {
    font-size: 9px !important;
    line-height: 1.02 !important;
  }

  .dev-drawer .section-split-row .small-label {
    font-size: 6px !important;
    line-height: 1.05 !important;
    letter-spacing: .07em !important;
  }

  .dev-drawer .section-split-row input,
  .dev-drawer .section-split-row .date-field {
    width: 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;
    box-sizing: border-box !important;
    font-size: 7px !important;
    min-height: 18px !important;
    height: 18px !important;
    padding: 2px 6px !important;
  }

  .dev-drawer .section-split-row .date-field {
    display: grid !important;
    grid-template-columns: minmax(0, 1fr) auto !important;
    gap: 3px !important;
    height: auto !important;
    padding: 0 !important;
  }

  .dev-drawer .section-split-row .date-field .icon-btn {
    width: 18px !important;
    height: 18px !important;
    min-width: 18px !important;
    min-height: 18px !important;
    padding: 2px !important;
  }

  .dev-drawer .section-split-row .row {
    gap: 4px !important;
    align-items: start !important;
  }

  .dev-drawer .section-split-row .checkbox-row > label {
    max-width: min(7.4rem, 43vw) !important;
    font-size: 5.7px !important;
    line-height: 1.04 !important;
    padding: 2px 5px !important;
  }

  .output-card .status-bar {
    display: grid !important;
    grid-template-columns: minmax(0, 1fr) auto !important;
    grid-template-areas: "counts auth" ". payload" !important;
    gap: 4px 8px !important;
    align-items: center !important;
  }

  .output-card #statusCounts {
    grid-area: counts !important;
  }

  .output-card .output-auth-toggle {
    grid-area: auth !important;
    justify-self: end !important;
    margin-left: 0 !important;
  }

  .output-card .status-bar .payload-stepper {
    grid-area: payload !important;
    justify-self: end !important;
    align-self: start !important;
    width: auto !important;
    min-width: 76px !important;
    max-width: 96px !important;
    height: 18px !important;
    min-height: 18px !important;
    margin: -1px 0 0 !important;
    padding: 1px 4px !important;
    gap: 3px !important;
    transform: none !important;
    -webkit-transform: none !important;
  }

  .output-card .status-bar .payload-stepper-label {
    font-size: 5px !important;
    line-height: 1 !important;
    max-width: 34px !important;
  }

  .output-card .status-bar .payload-stepper-value {
    font-size: 7px !important;
    line-height: 1 !important;
  }

  .output-card .status-bar .payload-stepper-btn,
  .output-card .status-bar .payload-stepper .icon-btn {
    width: 14px !important;
    min-width: 14px !important;
    height: 14px !important;
    min-height: 14px !important;
    padding: 0 !important;
    font-size: 8px !important;
    line-height: 1 !important;
  }

  .output-card .output-toolbar {
    margin-top: 6px !important;
    gap: 6px !important;
  }
}



/* PR93_SENTINEL TD613 Flight mobile heading/rail/footer correction */
/* PR94_SENTINEL TD613 Flight mobile correction replay */
@media (hover: none) and (max-width: 820px), (pointer: coarse) and (max-width: 820px) {
  header h1,
  .flight-lane .card > h2,
  .flight-lane-prompt .card > h2,
  .flight-lane-output .card > h2,
  .dev-drawer .card > h2 {
    font-size: clamp(15px, 4.8vw, 20px) !important;
    line-height: .94 !important;
    letter-spacing: .065em !important;
    overflow-wrap: anywhere !important;
  }

  .flight-lane-output .output-card > h2,
  .flight-lane-output .seal-card h2,
  .flight-lane-output .copy-bin-card h2 {
    font-size: clamp(15px, 4.7vw, 19px) !important;
  }

  .dev-drawer .card > h2 {
    font-size: clamp(14px, 4.5vw, 18px) !important;
    letter-spacing: .055em !important;
  }

  .dev-drawer .card > h2:has(+ .section-note) {
    font-size: clamp(14px, 4.4vw, 18px) !important;
  }

  .flight-lane-prompt > .card:nth-of-type(3),
  .flight-lane-prompt > .card:nth-of-type(4) {
    transform: translate(8px, 8px) !important;
    -webkit-transform: translate(8px, 8px) !important;
    max-width: calc(100% - 10px) !important;
    margin-bottom: 11px !important;
  }

  .flight-lane-prompt .card .checkbox-row,
  .flight-lane-prompt .card .radio-row {
    display: flex !important;
    flex-flow: row wrap !important;
    align-items: flex-start !important;
    align-content: flex-start !important;
    justify-content: flex-start !important;
    gap: 4px 5px !important;
    width: 100% !important;
    max-width: 100% !important;
    overflow: visible !important;
    grid-template-columns: none !important;
  }

  .flight-lane-prompt .card .checkbox-row > label,
  .flight-lane-prompt .card .radio-row > label {
    display: inline-flex !important;
    flex: 0 1 auto !important;
    align-items: center !important;
    justify-content: flex-start !important;
    gap: 4px !important;
    width: fit-content !important;
    min-width: 0 !important;
    max-width: min(10.4rem, 44vw) !important;
    min-height: 18px !important;
    height: auto !important;
    padding: 2px 6px !important;
    border-radius: 999px !important;
    font-size: 6.5px !important;
    line-height: 1.06 !important;
    letter-spacing: .002em !important;
    white-space: normal !important;
    overflow: visible !important;
    overflow-wrap: anywhere !important;
    text-overflow: clip !important;
    text-align: left !important;
  }

  .flight-lane-prompt .card .checkbox-row > label:nth-child(3n+1),
  .flight-lane-prompt .card .radio-row > label:nth-child(3n+1) {
    max-width: min(8.8rem, 39vw) !important;
  }

  .flight-lane-prompt .card .checkbox-row > label:nth-child(3n+2),
  .flight-lane-prompt .card .radio-row > label:nth-child(3n+2) {
    max-width: min(11.2rem, 47vw) !important;
  }

  .flight-lane-prompt .card .checkbox-row > label > input[type="checkbox"],
  .flight-lane-prompt .card .radio-row > label > input[type="radio"] {
    flex: 0 0 auto !important;
    width: 8px !important;
    min-width: 8px !important;
    height: 8px !important;
    min-height: 8px !important;
    margin: 0 !important;
  }

  .flight-lane-prompt .card .checkbox-row > label:has(input[type="text"]),
  .flight-lane-prompt .card .radio-row > label:has(input[type="text"]) {
    flex: 0 1 auto !important;
    width: fit-content !important;
    min-width: 0 !important;
    max-width: min(10.8rem, 45vw) !important;
    border-radius: 14px !important;
  }

  .flight-lane-prompt .card .checkbox-row > label input[type="text"],
  .flight-lane-prompt .card .radio-row > label input[type="text"] {
    width: clamp(3.8rem, 18vw, 5.8rem) !important;
    min-width: 0 !important;
    max-width: 100% !important;
    height: 13px !important;
    min-height: 13px !important;
    padding: 1px 4px !important;
    font-size: 6.5px !important;
    line-height: 1 !important;
  }

  .flight-lane-output .seal-card .section-note,
  .flight-lane-output .copy-bin-card .section-note {
    font-size: 8px !important;
    line-height: 1.15 !important;
    margin: 4px 0 7px !important;
  }

  .mobile-prompt-rail.mobile-prompt-rail-top {
    position: static !important;
    display: flex !important;
    float: none !important;
    inset: auto !important;
    right: auto !important;
    bottom: auto !important;
    left: auto !important;
    z-index: auto !important;
    width: fit-content !important;
    min-width: 0 !important;
    max-width: min(60vw, 14rem) !important;
    min-height: 18px !important;
    margin: 7px 0 10px auto !important;
    padding: 2px 6px !important;
    gap: 4px !important;
    justify-content: flex-end !important;
    align-items: center !important;
    border-color: rgba(255, 210, 98, .66) !important;
    background:
      linear-gradient(180deg, rgba(118, 69, 18, .96), rgba(34, 16, 5, .96)) !important;
    box-shadow: 0 0 14px rgba(255, 177, 59, .18), inset 0 1px 0 rgba(255, 239, 196, .14) !important;
  }

  .mobile-prompt-rail.mobile-prompt-rail-top span:first-child {
    font-size: 4.5px !important;
    line-height: 1 !important;
    letter-spacing: .12em !important;
    color: rgba(255, 239, 196, .92) !important;
    white-space: nowrap !important;
  }

  .mobile-prompt-rail.mobile-prompt-rail-top .mobile-prompt-rail-pill {
    min-width: 11px !important;
    padding: 1px 4px !important;
    font-size: 6px !important;
    line-height: 1 !important;
    color: rgba(255, 229, 133, .96) !important;
    border-color: rgba(255, 210, 98, .5) !important;
    background: rgba(72, 38, 10, .78) !important;
  }

  .dev-drawer .section-split-row {
    display: grid !important;
    grid-template-columns: minmax(0, .96fr) minmax(0, 1.04fr) !important;
    gap: 7px !important;
    align-items: start !important;
  }

  .dev-drawer .section-split-row > div {
    min-width: 0 !important;
    width: 100% !important;
    max-width: 100% !important;
    overflow: visible !important;
    padding: 7px !important;
    box-sizing: border-box !important;
  }

  .dev-drawer .section-split-row h3 {
    font-size: 9px !important;
    line-height: 1.02 !important;
  }

  .dev-drawer .section-split-row .small-label {
    font-size: 6px !important;
    line-height: 1.05 !important;
    letter-spacing: .07em !important;
  }

  .dev-drawer .section-split-row input,
  .dev-drawer .section-split-row .date-field {
    width: 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;
    box-sizing: border-box !important;
    font-size: 7px !important;
    min-height: 18px !important;
    height: 18px !important;
    padding: 2px 6px !important;
  }

  .dev-drawer .section-split-row .date-field {
    display: grid !important;
    grid-template-columns: minmax(0, 1fr) auto !important;
    gap: 3px !important;
    height: auto !important;
    padding: 0 !important;
  }

  .dev-drawer .section-split-row .date-field .icon-btn {
    width: 18px !important;
    height: 18px !important;
    min-width: 18px !important;
    min-height: 18px !important;
    padding: 2px !important;
  }

  .dev-drawer .section-split-row .row {
    gap: 4px !important;
    align-items: start !important;
  }

  .dev-drawer .section-split-row .checkbox-row > label {
    max-width: min(7.4rem, 43vw) !important;
    font-size: 5.7px !important;
    line-height: 1.04 !important;
    padding: 2px 5px !important;
  }

  .output-card .status-bar {
    display: grid !important;
    grid-template-columns: minmax(0, 1fr) auto !important;
    grid-template-areas: "counts auth" ". payload" !important;
    gap: 4px 8px !important;
    align-items: center !important;
  }

  .output-card #statusCounts {
    grid-area: counts !important;
  }

  .output-card .output-auth-toggle {
    grid-area: auth !important;
    justify-self: end !important;
    margin-left: 0 !important;
  }

  .output-card .status-bar .payload-stepper {
    grid-area: payload !important;
    justify-self: end !important;
    align-self: start !important;
    width: auto !important;
    min-width: 76px !important;
    max-width: 96px !important;
    height: 18px !important;
    min-height: 18px !important;
    margin: -1px 0 0 !important;
    padding: 1px 4px !important;
    gap: 3px !important;
    transform: none !important;
    -webkit-transform: none !important;
  }

  .output-card .status-bar .payload-stepper-label {
    font-size: 5px !important;
    line-height: 1 !important;
    max-width: 34px !important;
  }

  .output-card .status-bar .payload-stepper-value {
    font-size: 7px !important;
    line-height: 1 !important;
  }

  .output-card .status-bar .payload-stepper-btn,
  .output-card .status-bar .payload-stepper .icon-btn {
    width: 14px !important;
    min-width: 14px !important;
    height: 14px !important;
    min-height: 14px !important;
    padding: 0 !important;
    font-size: 8px !important;
    line-height: 1 !important;
  }

  .output-card .output-toolbar {
    margin-top: 6px !important;
    gap: 6px !important;
  }
}



/* PR93_SENTINEL TD613 Flight mobile heading/rail/footer correction */
/* PR94_SENTINEL TD613 Flight mobile correction replay */
@media (hover: none) and (max-width: 820px), (pointer: coarse) and (max-width: 820px) {
  header h1,
  .flight-lane .card > h2,
  .flight-lane-prompt .card > h2,
  .flight-lane-output .card > h2,
  .dev-drawer .card > h2 {
    font-size: clamp(15px, 4.8vw, 20px) !important;
    line-height: .94 !important;
    letter-spacing: .065em !important;
    overflow-wrap: anywhere !important;
  }

  .flight-lane-output .output-card > h2,
  .flight-lane-output .seal-card h2,
  .flight-lane-output .copy-bin-card h2 {
    font-size: clamp(15px, 4.7vw, 19px) !important;
  }

  .dev-drawer .card > h2 {
    font-size: clamp(14px, 4.5vw, 18px) !important;
    letter-spacing: .055em !important;
  }

  .dev-drawer .card > h2:has(+ .section-note) {
    font-size: clamp(14px, 4.4vw, 18px) !important;
  }

  .flight-lane-prompt > .card:nth-of-type(3),
  .flight-lane-prompt > .card:nth-of-type(4) {
    transform: translate(8px, 8px) !important;
    -webkit-transform: translate(8px, 8px) !important;
    max-width: calc(100% - 10px) !important;
    margin-bottom: 11px !important;
  }

  .flight-lane-prompt .card .checkbox-row,
  .flight-lane-prompt .card .radio-row {
    display: flex !important;
    flex-flow: row wrap !important;
    align-items: flex-start !important;
    align-content: flex-start !important;
    justify-content: flex-start !important;
    gap: 4px 5px !important;
    width: 100% !important;
    max-width: 100% !important;
    overflow: visible !important;
    grid-template-columns: none !important;
  }

  .flight-lane-prompt .card .checkbox-row > label,
  .flight-lane-prompt .card .radio-row > label {
    display: inline-flex !important;
    flex: 0 1 auto !important;
    align-items: center !important;
    justify-content: flex-start !important;
    gap: 4px !important;
    width: fit-content !important;
    min-width: 0 !important;
    max-width: min(10.4rem, 44vw) !important;
    min-height: 18px !important;
    height: auto !important;
    padding: 2px 6px !important;
    border-radius: 999px !important;
    font-size: 6.5px !important;
    line-height: 1.06 !important;
    letter-spacing: .002em !important;
    white-space: normal !important;
    overflow: visible !important;
    overflow-wrap: anywhere !important;
    text-overflow: clip !important;
    text-align: left !important;
  }

  .flight-lane-prompt .card .checkbox-row > label:nth-child(3n+1),
  .flight-lane-prompt .card .radio-row > label:nth-child(3n+1) {
    max-width: min(8.8rem, 39vw) !important;
  }

  .flight-lane-prompt .card .checkbox-row > label:nth-child(3n+2),
  .flight-lane-prompt .card .radio-row > label:nth-child(3n+2) {
    max-width: min(11.2rem, 47vw) !important;
  }

  .flight-lane-prompt .card .checkbox-row > label > input[type="checkbox"],
  .flight-lane-prompt .card .radio-row > label > input[type="radio"] {
    flex: 0 0 auto !important;
    width: 8px !important;
    min-width: 8px !important;
    height: 8px !important;
    min-height: 8px !important;
    margin: 0 !important;
  }

  .flight-lane-prompt .card .checkbox-row > label:has(input[type="text"]),
  .flight-lane-prompt .card .radio-row > label:has(input[type="text"]) {
    flex: 0 1 auto !important;
    width: fit-content !important;
    min-width: 0 !important;
    max-width: min(10.8rem, 45vw) !important;
    border-radius: 14px !important;
  }

  .flight-lane-prompt .card .checkbox-row > label input[type="text"],
  .flight-lane-prompt .card .radio-row > label input[type="text"] {
    width: clamp(3.8rem, 18vw, 5.8rem) !important;
    min-width: 0 !important;
    max-width: 100% !important;
    height: 13px !important;
    min-height: 13px !important;
    padding: 1px 4px !important;
    font-size: 6.5px !important;
    line-height: 1 !important;
  }

  .flight-lane-output .seal-card .section-note,
  .flight-lane-output .copy-bin-card .section-note {
    font-size: 8px !important;
    line-height: 1.15 !important;
    margin: 4px 0 7px !important;
  }

  .mobile-prompt-rail.mobile-prompt-rail-top {
    position: static !important;
    display: flex !important;
    float: none !important;
    inset: auto !important;
    right: auto !important;
    bottom: auto !important;
    left: auto !important;
    z-index: auto !important;
    width: fit-content !important;
    min-width: 0 !important;
    max-width: min(60vw, 14rem) !important;
    min-height: 18px !important;
    margin: 7px 0 10px auto !important;
    padding: 2px 6px !important;
    gap: 4px !important;
    justify-content: flex-end !important;
    align-items: center !important;
    border-color: rgba(255, 210, 98, .66) !important;
    background:
      linear-gradient(180deg, rgba(118, 69, 18, .96), rgba(34, 16, 5, .96)) !important;
    box-shadow: 0 0 14px rgba(255, 177, 59, .18), inset 0 1px 0 rgba(255, 239, 196, .14) !important;
  }

  .mobile-prompt-rail.mobile-prompt-rail-top span:first-child {
    font-size: 4.5px !important;
    line-height: 1 !important;
    letter-spacing: .12em !important;
    color: rgba(255, 239, 196, .92) !important;
    white-space: nowrap !important;
  }

  .mobile-prompt-rail.mobile-prompt-rail-top .mobile-prompt-rail-pill {
    min-width: 11px !important;
    padding: 1px 4px !important;
    font-size: 6px !important;
    line-height: 1 !important;
    color: rgba(255, 229, 133, .96) !important;
    border-color: rgba(255, 210, 98, .5) !important;
    background: rgba(72, 38, 10, .78) !important;
  }

  .dev-drawer .section-split-row {
    display: grid !important;
    grid-template-columns: minmax(0, .96fr) minmax(0, 1.04fr) !important;
    gap: 7px !important;
    align-items: start !important;
  }

  .dev-drawer .section-split-row > div {
    min-width: 0 !important;
    width: 100% !important;
    max-width: 100% !important;
    overflow: visible !important;
    padding: 7px !important;
    box-sizing: border-box !important;
  }

  .dev-drawer .section-split-row h3 {
    font-size: 9px !important;
    line-height: 1.02 !important;
  }

  .dev-drawer .section-split-row .small-label {
    font-size: 6px !important;
    line-height: 1.05 !important;
    letter-spacing: .07em !important;
  }

  .dev-drawer .section-split-row input,
  .dev-drawer .section-split-row .date-field {
    width: 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;
    box-sizing: border-box !important;
    font-size: 7px !important;
    min-height: 18px !important;
    height: 18px !important;
    padding: 2px 6px !important;
  }

  .dev-drawer .section-split-row .date-field {
    display: grid !important;
    grid-template-columns: minmax(0, 1fr) auto !important;
    gap: 3px !important;
    height: auto !important;
    padding: 0 !important;
  }

  .dev-drawer .section-split-row .date-field .icon-btn {
    width: 18px !important;
    height: 18px !important;
    min-width: 18px !important;
    min-height: 18px !important;
    padding: 2px !important;
  }

  .dev-drawer .section-split-row .row {
    gap: 4px !important;
    align-items: start !important;
  }

  .dev-drawer .section-split-row .checkbox-row > label {
    max-width: min(7.4rem, 43vw) !important;
    font-size: 5.7px !important;
    line-height: 1.04 !important;
    padding: 2px 5px !important;
  }

  .output-card .status-bar {
    display: grid !important;
    grid-template-columns: minmax(0, 1fr) auto !important;
    grid-template-areas: "counts auth" ". payload" !important;
    gap: 4px 8px !important;
    align-items: center !important;
  }

  .output-card #statusCounts {
    grid-area: counts !important;
  }

  .output-card .output-auth-toggle {
    grid-area: auth !important;
    justify-self: end !important;
    margin-left: 0 !important;
  }

  .output-card .status-bar .payload-stepper {
    grid-area: payload !important;
    justify-self: end !important;
    align-self: start !important;
    width: auto !important;
    min-width: 76px !important;
    max-width: 96px !important;
    height: 18px !important;
    min-height: 18px !important;
    margin: -1px 0 0 !important;
    padding: 1px 4px !important;
    gap: 3px !important;
    transform: none !important;
    -webkit-transform: none !important;
  }

  .output-card .status-bar .payload-stepper-label {
    font-size: 5px !important;
    line-height: 1 !important;
    max-width: 34px !important;
  }

  .output-card .status-bar .payload-stepper-value {
    font-size: 7px !important;
    line-height: 1 !important;
  }

  .output-card .status-bar .payload-stepper-btn,
  .output-card .status-bar .payload-stepper .icon-btn {
    width: 14px !important;
    min-width: 14px !important;
    height: 14px !important;
    min-height: 14px !important;
    padding: 0 !important;
    font-size: 8px !important;
    line-height: 1 !important;
  }

  .output-card .output-toolbar {
    margin-top: 6px !important;
    gap: 6px !important;
  }
}



/* PR93_SENTINEL TD613 Flight mobile heading/rail/footer correction */
/* PR94_SENTINEL TD613 Flight mobile correction replay */
@media (hover: none) and (max-width: 820px), (pointer: coarse) and (max-width: 820px) {
  header h1,
  .flight-lane .card > h2,
  .flight-lane-prompt .card > h2,
  .flight-lane-output .card > h2,
  .dev-drawer .card > h2 {
    font-size: clamp(15px, 4.8vw, 20px) !important;
    line-height: .94 !important;
    letter-spacing: .065em !important;
    overflow-wrap: anywhere !important;
  }

  .flight-lane-output .output-card > h2,
  .flight-lane-output .seal-card h2,
  .flight-lane-output .copy-bin-card h2 {
    font-size: clamp(15px, 4.7vw, 19px) !important;
  }

  .dev-drawer .card > h2 {
    font-size: clamp(14px, 4.5vw, 18px) !important;
    letter-spacing: .055em !important;
  }

  .dev-drawer .card > h2:has(+ .section-note) {
    font-size: clamp(14px, 4.4vw, 18px) !important;
  }

  .flight-lane-prompt > .card:nth-of-type(3),
  .flight-lane-prompt > .card:nth-of-type(4) {
    transform: translate(8px, 8px) !important;
    -webkit-transform: translate(8px, 8px) !important;
    max-width: calc(100% - 10px) !important;
    margin-bottom: 11px !important;
  }

  .flight-lane-prompt .card .checkbox-row,
  .flight-lane-prompt .card .radio-row {
    display: flex !important;
    flex-flow: row wrap !important;
    align-items: flex-start !important;
    align-content: flex-start !important;
    justify-content: flex-start !important;
    gap: 4px 5px !important;
    width: 100% !important;
    max-width: 100% !important;
    overflow: visible !important;
    grid-template-columns: none !important;
  }

  .flight-lane-prompt .card .checkbox-row > label,
  .flight-lane-prompt .card .radio-row > label {
    display: inline-flex !important;
    flex: 0 1 auto !important;
    align-items: center !important;
    justify-content: flex-start !important;
    gap: 4px !important;
    width: fit-content !important;
    min-width: 0 !important;
    max-width: min(10.4rem, 44vw) !important;
    min-height: 18px !important;
    height: auto !important;
    padding: 2px 6px !important;
    border-radius: 999px !important;
    font-size: 6.5px !important;
    line-height: 1.06 !important;
    letter-spacing: .002em !important;
    white-space: normal !important;
    overflow: visible !important;
    overflow-wrap: anywhere !important;
    text-overflow: clip !important;
    text-align: left !important;
  }

  .flight-lane-prompt .card .checkbox-row > label:nth-child(3n+1),
  .flight-lane-prompt .card .radio-row > label:nth-child(3n+1) {
    max-width: min(8.8rem, 39vw) !important;
  }

  .flight-lane-prompt .card .checkbox-row > label:nth-child(3n+2),
  .flight-lane-prompt .card .radio-row > label:nth-child(3n+2) {
    max-width: min(11.2rem, 47vw) !important;
  }

  .flight-lane-prompt .card .checkbox-row > label > input[type="checkbox"],
  .flight-lane-prompt .card .radio-row > label > input[type="radio"] {
    flex: 0 0 auto !important;
    width: 8px !important;
    min-width: 8px !important;
    height: 8px !important;
    min-height: 8px !important;
    margin: 0 !important;
  }

  .flight-lane-prompt .card .checkbox-row > label:has(input[type="text"]),
  .flight-lane-prompt .card .radio-row > label:has(input[type="text"]) {
    flex: 0 1 auto !important;
    width: fit-content !important;
    min-width: 0 !important;
    max-width: min(10.8rem, 45vw) !important;
    border-radius: 14px !important;
  }

  .flight-lane-prompt .card .checkbox-row > label input[type="text"],
  .flight-lane-prompt .card .radio-row > label input[type="text"] {
    width: clamp(3.8rem, 18vw, 5.8rem) !important;
    min-width: 0 !important;
    max-width: 100% !important;
    height: 13px !important;
    min-height: 13px !important;
    padding: 1px 4px !important;
    font-size: 6.5px !important;
    line-height: 1 !important;
  }

  .flight-lane-output .seal-card .section-note,
  .flight-lane-output .copy-bin-card .section-note {
    font-size: 8px !important;
    line-height: 1.15 !important;
    margin: 4px 0 7px !important;
  }

  .mobile-prompt-rail.mobile-prompt-rail-top {
    position: static !important;
    display: flex !important;
    float: none !important;
    inset: auto !important;
    right: auto !important;
    bottom: auto !important;
    left: auto !important;
    z-index: auto !important;
    width: fit-content !important;
    min-width: 0 !important;
    max-width: min(60vw, 14rem) !important;
    min-height: 18px !important;
    margin: 7px 0 10px auto !important;
    padding: 2px 6px !important;
    gap: 4px !important;
    justify-content: flex-end !important;
    align-items: center !important;
    border-color: rgba(255, 210, 98, .66) !important;
    background:
      linear-gradient(180deg, rgba(118, 69, 18, .96), rgba(34, 16, 5, .96)) !important;
    box-shadow: 0 0 14px rgba(255, 177, 59, .18), inset 0 1px 0 rgba(255, 239, 196, .14) !important;
  }

  .mobile-prompt-rail.mobile-prompt-rail-top span:first-child {
    font-size: 4.5px !important;
    line-height: 1 !important;
    letter-spacing: .12em !important;
    color: rgba(255, 239, 196, .92) !important;
    white-space: nowrap !important;
  }

  .mobile-prompt-rail.mobile-prompt-rail-top .mobile-prompt-rail-pill {
    min-width: 11px !important;
    padding: 1px 4px !important;
    font-size: 6px !important;
    line-height: 1 !important;
    color: rgba(255, 229, 133, .96) !important;
    border-color: rgba(255, 210, 98, .5) !important;
    background: rgba(72, 38, 10, .78) !important;
  }

  .dev-drawer .section-split-row {
    display: grid !important;
    grid-template-columns: minmax(0, .96fr) minmax(0, 1.04fr) !important;
    gap: 7px !important;
    align-items: start !important;
  }

  .dev-drawer .section-split-row > div {
    min-width: 0 !important;
    width: 100% !important;
    max-width: 100% !important;
    overflow: visible !important;
    padding: 7px !important;
    box-sizing: border-box !important;
  }

  .dev-drawer .section-split-row h3 {
    font-size: 9px !important;
    line-height: 1.02 !important;
  }

  .dev-drawer .section-split-row .small-label {
    font-size: 6px !important;
    line-height: 1.05 !important;
    letter-spacing: .07em !important;
  }

  .dev-drawer .section-split-row input,
  .dev-drawer .section-split-row .date-field {
    width: 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;
    box-sizing: border-box !important;
    font-size: 7px !important;
    min-height: 18px !important;
    height: 18px !important;
    padding: 2px 6px !important;
  }

  .dev-drawer .section-split-row .date-field {
    display: grid !important;
    grid-template-columns: minmax(0, 1fr) auto !important;
    gap: 3px !important;
    height: auto !important;
    padding: 0 !important;
  }

  .dev-drawer .section-split-row .date-field .icon-btn {
    width: 18px !important;
    height: 18px !important;
    min-width: 18px !important;
    min-height: 18px !important;
    padding: 2px !important;
  }

  .dev-drawer .section-split-row .row {
    gap: 4px !important;
    align-items: start !important;
  }

  .dev-drawer .section-split-row .checkbox-row > label {
    max-width: min(7.4rem, 43vw) !important;
    font-size: 5.7px !important;
    line-height: 1.04 !important;
    padding: 2px 5px !important;
  }

  .output-card .status-bar {
    display: grid !important;
    grid-template-columns: minmax(0, 1fr) auto !important;
    grid-template-areas: "counts auth" ". payload" !important;
    gap: 4px 8px !important;
    align-items: center !important;
  }

  .output-card #statusCounts {
    grid-area: counts !important;
  }

  .output-card .output-auth-toggle {
    grid-area: auth !important;
    justify-self: end !important;
    margin-left: 0 !important;
  }

  .output-card .status-bar .payload-stepper {
    grid-area: payload !important;
    justify-self: end !important;
    align-self: start !important;
    width: auto !important;
    min-width: 76px !important;
    max-width: 96px !important;
    height: 18px !important;
    min-height: 18px !important;
    margin: -1px 0 0 !important;
    padding: 1px 4px !important;
    gap: 3px !important;
    transform: none !important;
    -webkit-transform: none !important;
  }

  .output-card .status-bar .payload-stepper-label {
    font-size: 5px !important;
    line-height: 1 !important;
    max-width: 34px !important;
  }

  .output-card .status-bar .payload-stepper-value {
    font-size: 7px !important;
    line-height: 1 !important;
  }

  .output-card .status-bar .payload-stepper-btn,
  .output-card .status-bar .payload-stepper .icon-btn {
    width: 14px !important;
    min-width: 14px !important;
    height: 14px !important;
    min-height: 14px !important;
    padding: 0 !important;
    font-size: 8px !important;
    line-height: 1 !important;
  }

  .output-card .output-toolbar {
    margin-top: 6px !important;
    gap: 6px !important;
  }
}



/* PR93_SENTINEL TD613 Flight mobile heading/rail/footer correction */
@media (hover: none) and (max-width: 820px), (pointer: coarse) and (max-width: 820px) {
  .flight-lane .card h2,
  .flight-lane-prompt .card h2,
  .flight-lane-output .card h2,
  .dev-drawer .card h2 {
    font-size: clamp(18px, 6vw, 24px) !important;
    line-height: .92 !important;
    letter-spacing: .075em !important;
    overflow-wrap: anywhere !important;
  }

  .flight-lane-output .output-card h2,
  .flight-lane-output .seal-card h2,
  .flight-lane-output .copy-bin-card h2 {
    font-size: clamp(18px, 5.8vw, 23px) !important;
  }

  .dev-drawer .card h2 {
    font-size: clamp(17px, 5.4vw, 22px) !important;
  }

  .flight-lane-prompt > .card:nth-of-type(3),
  .flight-lane-prompt > .card:nth-of-type(4) {
    transform: translate(5px, 6px) !important;
    -webkit-transform: translate(5px, 6px) !important;
    max-width: calc(100% - 7px) !important;
    margin-bottom: 9px !important;
  }

  .flight-lane-prompt .card .checkbox-row,
  .flight-lane-prompt .card .radio-row {
    display: flex !important;
    flex-flow: row wrap !important;
    align-items: flex-start !important;
    align-content: flex-start !important;
    justify-content: flex-start !important;
    gap: 4px 5px !important;
    width: 100% !important;
    max-width: 100% !important;
    overflow: visible !important;
    grid-template-columns: none !important;
  }

  .flight-lane-prompt .card .checkbox-row > label,
  .flight-lane-prompt .card .radio-row > label {
    display: inline-flex !important;
    flex: 0 1 auto !important;
    align-items: center !important;
    justify-content: flex-start !important;
    gap: 4px !important;
    width: fit-content !important;
    min-width: 0 !important;
    max-width: min(10.4rem, 44vw) !important;
    min-height: 18px !important;
    height: auto !important;
    padding: 2px 6px !important;
    border-radius: 999px !important;
    font-size: 6.5px !important;
    line-height: 1.06 !important;
    letter-spacing: .002em !important;
    white-space: normal !important;
    overflow: visible !important;
    overflow-wrap: anywhere !important;
    text-overflow: clip !important;
    text-align: left !important;
  }

  .flight-lane-prompt .card .checkbox-row > label:nth-child(3n+1),
  .flight-lane-prompt .card .radio-row > label:nth-child(3n+1) {
    max-width: min(8.8rem, 39vw) !important;
  }

  .flight-lane-prompt .card .checkbox-row > label:nth-child(3n+2),
  .flight-lane-prompt .card .radio-row > label:nth-child(3n+2) {
    max-width: min(11.2rem, 47vw) !important;
  }

  .flight-lane-prompt .card .checkbox-row > label > input[type="checkbox"],
  .flight-lane-prompt .card .radio-row > label > input[type="radio"] {
    flex: 0 0 auto !important;
    width: 8px !important;
    min-width: 8px !important;
    height: 8px !important;
    min-height: 8px !important;
    margin: 0 !important;
  }

  .flight-lane-prompt .card .checkbox-row > label:has(input[type="text"]),
  .flight-lane-prompt .card .radio-row > label:has(input[type="text"]) {
    flex: 0 1 auto !important;
    width: fit-content !important;
    min-width: 0 !important;
    max-width: min(10.8rem, 45vw) !important;
    border-radius: 14px !important;
  }

  .flight-lane-prompt .card .checkbox-row > label input[type="text"],
  .flight-lane-prompt .card .radio-row > label input[type="text"] {
    width: clamp(3.8rem, 18vw, 5.8rem) !important;
    min-width: 0 !important;
    max-width: 100% !important;
    height: 13px !important;
    min-height: 13px !important;
    padding: 1px 4px !important;
    font-size: 6.5px !important;
    line-height: 1 !important;
  }

  .flight-lane-output .seal-card .section-note,
  .flight-lane-output .copy-bin-card .section-note {
    font-size: 8px !important;
    line-height: 1.15 !important;
    margin: 4px 0 7px !important;
  }

  .mobile-prompt-rail.mobile-prompt-rail-top {
    position: static !important;
    display: inline-flex !important;
    float: none !important;
    inset: auto !important;
    right: auto !important;
    bottom: auto !important;
    left: auto !important;
    z-index: auto !important;
    width: fit-content !important;
    min-width: 0 !important;
    max-width: min(66vw, 15.5rem) !important;
    min-height: 20px !important;
    margin: 7px 0 10px auto !important;
    padding: 3px 7px !important;
    gap: 5px !important;
    justify-content: flex-end !important;
    align-items: center !important;
    border-color: rgba(255, 210, 98, .66) !important;
    background:
      linear-gradient(180deg, rgba(118, 69, 18, .96), rgba(34, 16, 5, .96)) !important;
    box-shadow: 0 0 16px rgba(255, 177, 59, .18), inset 0 1px 0 rgba(255, 239, 196, .14) !important;
  }

  .mobile-prompt-rail.mobile-prompt-rail-top span:first-child {
    font-size: 5px !important;
    line-height: 1 !important;
    letter-spacing: .12em !important;
    color: rgba(255, 239, 196, .92) !important;
    white-space: nowrap !important;
  }

  .mobile-prompt-rail.mobile-prompt-rail-top .mobile-prompt-rail-pill {
    min-width: 13px !important;
    padding: 1px 5px !important;
    font-size: 7px !important;
    line-height: 1 !important;
    color: rgba(255, 229, 133, .96) !important;
    border-color: rgba(255, 210, 98, .5) !important;
    background: rgba(72, 38, 10, .78) !important;
  }

  .dev-drawer .section-split-row {
    display: grid !important;
    grid-template-columns: minmax(0, 1fr) !important;
    gap: 10px !important;
  }

  .dev-drawer .section-split-row > div {
    min-width: 0 !important;
    width: 100% !important;
    max-width: 100% !important;
    overflow: visible !important;
  }

  .dev-drawer .section-split-row input,
  .dev-drawer .section-split-row .date-field {
    width: 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;
    box-sizing: border-box !important;
  }

  .output-card .status-bar {
    display: grid !important;
    grid-template-columns: minmax(0, 1fr) auto !important;
    grid-template-areas: "counts auth" ". payload" !important;
    gap: 4px 8px !important;
    align-items: center !important;
  }

  .output-card #statusCounts {
    grid-area: counts !important;
  }

  .output-card .output-auth-toggle {
    grid-area: auth !important;
    justify-self: end !important;
    margin-left: 0 !important;
  }

  .output-card .status-bar .payload-stepper {
    grid-area: payload !important;
    justify-self: end !important;
    align-self: start !important;
    width: auto !important;
    min-width: 76px !important;
    max-width: 96px !important;
    height: 18px !important;
    min-height: 18px !important;
    margin: -1px 0 0 !important;
    padding: 1px 4px !important;
    gap: 3px !important;
    transform: none !important;
    -webkit-transform: none !important;
  }

  .output-card .status-bar .payload-stepper-label {
    font-size: 5px !important;
    line-height: 1 !important;
    max-width: 34px !important;
  }

  .output-card .status-bar .payload-stepper-value {
    font-size: 7px !important;
    line-height: 1 !important;
  }

  .output-card .status-bar .payload-stepper-btn,
  .output-card .status-bar .payload-stepper .icon-btn {
    width: 14px !important;
    min-width: 14px !important;
    height: 14px !important;
    min-height: 14px !important;
    padding: 0 !important;
    font-size: 8px !important;
    line-height: 1 !important;
  }

  .output-card .output-toolbar {
    margin-top: 6px !important;
    gap: 6px !important;
  }
}



/* PR88_SENTINEL TD613 Flight focus stability micro patch */
@media (hover: none), (pointer: coarse), (max-width: 820px) {
  .flight-lane textarea,
  .flight-lane #taskText,
  .flight-lane #outputText {
    width: 100% !important;
    max-width: 100% !important;
    min-height: 74px !important;
    height: 86px !important;
    max-height: 150px !important;
    margin: 0 !important;
    font-size: 9px !important;
    line-height: 1.18 !important;
    transform: none !important;
    -webkit-transform: none !important;
    transform-origin: initial !important;
    -webkit-transform-origin: initial !important;
    -webkit-text-size-adjust: 100% !important;
    text-size-adjust: 100% !important;
  }

  .flight-lane textarea:focus,
  .flight-lane #taskText:focus,
  .flight-lane #outputText:focus {
    font-size: 9px !important;
    transform: none !important;
    -webkit-transform: none !important;
  }
}


/* PR89_SENTINEL TD613 Flight seal layout + payload micro patch */
@media (hover: none), (pointer: coarse) {
  .flight-lane .output-toolbar {
    align-items: center !important;
    gap: 6px !important;
  }

  .flight-lane .payload-stepper {
    flex: 0 0 auto !important;
    width: auto !important;
    min-width: 88px !important;
    max-width: 118px !important;
    min-height: 20px !important;
    height: 20px !important;
    padding: 1px 4px !important;
    gap: 3px !important;
    margin-left: auto !important;
    transform: none !important;
    -webkit-transform: none !important;
    clip-path: polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px)) !important;
  }

  .flight-lane .payload-stepper-label {
    font-size: 5px !important;
    line-height: 1 !important;
    letter-spacing: .08em !important;
    max-width: 42px !important;
    white-space: normal !important;
  }

  .flight-lane .payload-stepper-value {
    font-size: 7px !important;
    line-height: 1 !important;
    min-width: .65rem !important;
  }

  .flight-lane .payload-stepper-btn,
  .flight-lane .payload-stepper .icon-btn {
    width: 14px !important;
    min-width: 14px !important;
    height: 14px !important;
    min-height: 14px !important;
    padding: 0 !important;
    font-size: 8px !important;
    line-height: 1 !important;
    clip-path: polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px)) !important;
  }

  .flight-lane .seal-card .section-split-row {
    display: grid !important;
    grid-template-columns: minmax(0, 1fr) minmax(210px, .88fr) !important;
    grid-template-areas: "zwnj target" !important;
    gap: 7px !important;
    align-items: end !important;
  }

  .flight-lane .seal-card .section-split-row > div:first-child {
    grid-area: zwnj !important;
    align-self: end !important;
    margin-top: 12px !important;
    transform: translateX(-2px) translateY(6px) !important;
    -webkit-transform: translateX(-2px) translateY(6px) !important;
  }

  .flight-lane .seal-card .section-split-row > div:nth-child(2) {
    grid-area: target !important;
    align-self: stretch !important;
    min-height: 100% !important;
    transform: translateX(8px) !important;
    -webkit-transform: translateX(8px) !important;
  }

  .flight-lane .seal-card .section-split-row > div {
    padding: 7px 8px !important;
    min-width: 0 !important;
  }

  .flight-lane .seal-card .section-split-row .radio-row {
    gap: 4px 5px !important;
  }

  .flight-lane .seal-card #sealTargetWord {
    width: min(100%, 14rem) !important;
    max-width: 100% !important;
  }
}

@media (hover: none) and (pointer: coarse) and (max-width: 520px) {
  .flight-lane .seal-card .section-split-row {
    grid-template-columns: 1fr !important;
    grid-template-areas: "target" "zwnj" !important;
  }

  .flight-lane .seal-card .section-split-row > div:first-child,
  .flight-lane .seal-card .section-split-row > div:nth-child(2) {
    transform: none !important;
    -webkit-transform: none !important;
  }
}



/* PR85_FINAL_SENTINEL TD613 Flight mobile repair */
@media (max-width: 820px) {
  html,
  body {
    width: 100% !important;
    max-width: 100% !important;
    height: auto !important;
    min-height: 100dvh !important;
    max-height: none !important;
    overflow-x: hidden !important;
    overflow-y: auto !important;
    -webkit-overflow-scrolling: touch !important;
    -webkit-text-size-adjust: 100% !important;
    text-size-adjust: 100% !important;
    touch-action: pan-y !important;
  }

  body { touch-action: pan-y !important; }

  .page-wrap {
    display: block !important;
    width: 100vw !important;
    max-width: 100vw !important;
    height: auto !important;
    min-height: 100dvh !important;
    max-height: none !important;
    overflow: visible !important;
    padding: .42rem !important;
  }

  header,
  .mobile-flight-switcher {
    position: relative !important;
    top: auto !important;
    inset: auto !important;
    z-index: auto !important;
    transform: none !important;
    transition: none !important;
  }

  header {
    display: grid !important;
    grid-template-areas: "title" "nav" "text" "tags" "howto" !important;
    grid-template-columns: minmax(0, 1fr) !important;
    gap: 8px !important;
    padding: 14px 14px 12px !important;
    margin-bottom: 10px !important;
    height: auto !important;
    max-height: none !important;
    overflow: hidden !important;
  }

  header h1 {
    grid-area: title !important;
    font-size: clamp(26px, 7.2vw, 38px) !important;
    line-height: .98 !important;
    margin: 0 !important;
  }

  header h1::after {
    content: "SAFE HARBOR ISSUE" !important;
    display: block !important;
    font-size: 8px !important;
    line-height: 1.25 !important;
    letter-spacing: .18em !important;
    margin-top: 6px !important;
  }

  header .flight-quick-nav {
    grid-area: nav !important;
    position: static !important;
    display: flex !important;
    flex-wrap: nowrap !important;
    justify-content: flex-end !important;
    align-items: center !important;
    gap: 5px !important;
    width: 100% !important;
    max-width: 100% !important;
    overflow: visible !important;
    margin: -2px 0 0 auto !important;
    padding: 0 !important;
  }

  header .flight-quick-nav > a,
  header .flight-quick-nav > button {
    flex: 0 0 auto !important;
    width: auto !important;
    min-height: 18px !important;
    height: 18px !important;
    padding: 3px 8px !important;
    font-size: 7px !important;
    line-height: 1 !important;
    white-space: nowrap !important;
  }

  header .flight-quick-nav > .flight-nav-signout,
  header .flight-quick-nav > button.flight-nav-signout {
    height: auto !important;
    min-height: 0 !important;
    padding: 2px !important;
    border: 0 !important;
    background: transparent !important;
    box-shadow: none !important;
    font-size: 6px !important;
  }

  header .subtitle {
    grid-area: text !important;
    padding-top: 0 !important;
    padding-left: 12px !important;
    font-size: 10px !important;
    line-height: 1.25 !important;
  }

  header .pill-row {
    grid-area: tags !important;
    display: flex !important;
    flex-wrap: wrap !important;
    gap: 3px 8px !important;
    overflow: visible !important;
    padding: 0 0 3px !important;
  }

  header .pill-row > *,
  header .pill-row .pill {
    width: auto !important;
    min-width: 0 !important;
    min-height: 0 !important;
    padding: 0 8px 0 0 !important;
    border: 0 !important;
    border-right: 1px solid rgba(137,255,240,.25) !important;
    border-radius: 0 !important;
    background: transparent !important;
    box-shadow: none !important;
    font-size: 6px !important;
    line-height: 1.1 !important;
    white-space: nowrap !important;
  }

  header details.howto { grid-area: howto !important; }

  .mobile-flight-switcher {
    display: grid !important;
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    gap: .28rem !important;
    margin: 0 0 8px !important;
    overflow: visible !important;
  }

  .mobile-flight-switcher::after { content: none !important; }

  .mobile-lane-tab {
    min-width: 0 !important;
    min-height: 24px !important;
    padding: 3px 8px !important;
    font-size: 8px !important;
  }
  .mobile-lane-tab span { font-size: 8px !important; }
  .mobile-lane-tab small { font-size: 5px !important; }

  .grid {
    position: relative !important;
    display: block !important;
    width: 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;
    min-height: 0 !important;
    overflow: hidden !important;
    transform: none !important;
    transition: height .18s ease !important;
    touch-action: pan-y !important;
  }

  .grid > .flight-lane {
    position: absolute !important;
    top: 0 !important;
    left: 0 !important;
    right: auto !important;
    bottom: auto !important;
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
    width: 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;
    height: auto !important;
    min-height: 0 !important;
    max-height: none !important;
    padding: .14rem .46rem 4.2rem !important;
    box-sizing: border-box !important;
    overflow: visible !important;
    -webkit-overflow-scrolling: auto !important;
    transition: transform .34s cubic-bezier(.18,.82,.16,1) !important;
    will-change: transform !important;
  }

  .grid > .flight-lane-prompt { transform: translate3d(0, 0, 0) !important; }
  .grid > .flight-lane-output { transform: translate3d(100%, 0, 0) !important; }
  html[data-flight-mobile-lane="output"] .grid > .flight-lane-prompt,
  body.flight-output-active .grid > .flight-lane-prompt { transform: translate3d(-100%, 0, 0) !important; }
  html[data-flight-mobile-lane="output"] .grid > .flight-lane-output,
  body.flight-output-active .grid > .flight-lane-output { transform: translate3d(0, 0, 0) !important; }
  body.flight-dragging .grid > .flight-lane { transition: none !important; }
  .grid > :not(.flight-lane-prompt):not(.flight-lane-output) { display: none !important; }

  .card,
  .dev-drawer,
  .output-card,
  .seal-card,
  .copy-bin-card {
    overflow: hidden !important;
    padding: 10px 10px 11px 16px !important;
    margin-bottom: 9px !important;
    border-radius: 16px !important;
  }

  .card h2,
  .output-card h2,
  .seal-card h2,
  .dev-drawer h2 {
    font-size: 17px !important;
    line-height: 1.05 !important;
    letter-spacing: .12em !important;
  }

  .flight-lane p,
  .flight-lane .muted,
  .flight-lane .help,
  .flight-lane .note,
  .flight-lane .warning,
  .section-note {
    font-size: 11px !important;
    line-height: 1.24 !important;
  }

  .flight-lane .checkbox-row,
  .flight-lane .radio-row,
  .flight-lane .copy-grid,
  .flight-lane .row,
  .flight-lane .seal-lozenge-row {
    display: flex !important;
    flex-flow: row wrap !important;
    align-items: flex-start !important;
    align-content: flex-start !important;
    justify-content: flex-start !important;
    gap: 4px 5px !important;
    width: 100% !important;
    max-width: 100% !important;
    overflow: visible !important;
    grid-template-columns: none !important;
  }

  .flight-lane .checkbox-row > label,
  .flight-lane .radio-row > label,
  .flight-lane .copy-chip,
  .flight-lane .row > button,
  .flight-lane .row > .btn,
  .flight-lane button.btn,
  .flight-lane button.primary,
  .flight-lane button.secondary,
  .flight-lane button.ghost {
    display: inline-flex !important;
    flex: 0 1 auto !important;
    align-items: center !important;
    justify-content: flex-start !important;
    width: auto !important;
    min-width: 0 !important;
    max-width: calc(100% - 8px) !important;
    min-height: 15px !important;
    height: auto !important;
    max-height: none !important;
    padding: 2px 6px !important;
    border-radius: 999px !important;
    font-size: 6px !important;
    line-height: 1.08 !important;
    white-space: normal !important;
    overflow: visible !important;
    overflow-wrap: anywhere !important;
    text-overflow: clip !important;
    text-align: left !important;
  }

  .flight-lane input[type="checkbox"],
  .flight-lane input[type="radio"] {
    flex: 0 0 8px !important;
    width: 8px !important;
    min-width: 8px !important;
    height: 8px !important;
    margin: 0 4px 0 0 !important;
  }

  .flight-lane label input[type="text"],
  .flight-lane label input[type="number"],
  .flight-lane label input[type="date"] {
    width: clamp(4rem, 16vw, 6.2rem) !important;
    min-width: 0 !important;
    max-width: clamp(4rem, 16vw, 6.2rem) !important;
    height: 14px !important;
    min-height: 14px !important;
    padding: 1px 5px !important;
    font-size: 7px !important;
    line-height: 1 !important;
  }

  .flight-lane textarea,
  .flight-lane .output,
  .flight-lane #taskText,
  .flight-lane .code-output,
  .flight-lane .json-output {
    display: block !important;
    box-sizing: border-box !important;
    width: 100% !important;
    min-width: 0 !important;
    max-width: 100% !important;
    min-height: 74px !important;
    height: 86px !important;
    max-height: 150px !important;
    margin: 0 !important;
    padding: 8px 9px !important;
    font-size: 9px !important;
    line-height: 1.18 !important;
    letter-spacing: .004em !important;
    overflow-y: auto !important;
    overflow-x: hidden !important;
    overscroll-behavior: contain !important;
    touch-action: pan-y !important;
    resize: vertical !important;
    -webkit-overflow-scrolling: touch !important;
  }

  .flight-lane .dev-drawer textarea,
  .flight-lane .dev-drawer .code-output,
  .flight-lane .dev-drawer .json-output {
    min-height: 54px !important;
    height: 62px !important;
    max-height: 112px !important;
    font-size: 8px !important;
    line-height: 1.12 !important;
  }

  .flight-lane input[type="text"],
  .flight-lane input[type="number"],
  .flight-lane input[type="date"],
  .flight-lane select {
    box-sizing: border-box !important;
    width: clamp(8rem, 42vw, 18rem) !important;
    min-width: 0 !important;
    max-width: clamp(8rem, 42vw, 18rem) !important;
    height: 18px !important;
    min-height: 18px !important;
    padding: 3px 6px !important;
    font-size: 9px !important;
    line-height: 1.05 !important;
  }

  .flight-lane .danger-note {
    font-size: 5px !important;
    line-height: 1.15 !important;
    padding: 5px 7px !important;
    min-height: 0 !important;
  }

  .output-auth-toggle,
  .payload-stepper,
  .payload-stepper-label,
  .payload-stepper-value,
  .payload-stepper-btn {
    font-size: 7px !important;
    line-height: 1.05 !important;
    letter-spacing: .08em !important;
  }

  .td613-swipe-intro {
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    color: rgba(49,255,138,.92);
    font-size: clamp(24px, 10vw, 48px);
    line-height: 1;
    letter-spacing: .16em;
    text-shadow: 0 0 10px rgba(49,255,138,.72), 0 0 26px rgba(49,255,138,.35);
    animation: td613SwipeIntro 2.35s ease-out forwards;
  }

  @keyframes td613SwipeIntro {
    0% { opacity: 0; transform: translateX(18px); }
    12% { opacity: 1; transform: translateX(0); }
    28% { opacity: .28; transform: translateX(-14px); }
    44% { opacity: 1; transform: translateX(0); }
    60% { opacity: .28; transform: translateX(-14px); }
    76% { opacity: 1; transform: translateX(0); }
    100% { opacity: 0; transform: translateX(-28px); }
  }
}
`;

const js = `
<script id="td613-flight-pr85-final-script">
(function () {
  function mobile() { return window.matchMedia && window.matchMedia('(max-width: 820px)').matches; }
  function q(sel) { return document.querySelector(sel); }
  function laneName() { return document.documentElement.dataset.flightMobileLane === 'output' ? 'output' : 'prompt'; }
  function activeLane() { return q(laneName() === 'output' ? '.flight-lane-output' : '.flight-lane-prompt'); }
  function gridWidth() { var grid = q('.grid'); return grid ? grid.clientWidth : window.innerWidth; }

  function syncTabs(target) {
    target = target === 'output' ? 'output' : 'prompt';
    document.documentElement.dataset.flightMobileLane = target;
    document.body.classList.toggle('flight-output-active', target === 'output');
    document.querySelectorAll('[data-flight-lane-target]').forEach(function (el) {
      var on = el.getAttribute('data-flight-lane-target') === target;
      el.classList.toggle('is-active', on);
      if (el.classList.contains('mobile-lane-tab')) el.setAttribute('aria-selected', on ? 'true' : 'false');
    });
  }

  function syncGridHeight() {
    if (!mobile()) return;
    var grid = q('.grid');
    var lane = activeLane();
    if (!grid || !lane) return;
    var height = Math.max(lane.scrollHeight, lane.offsetHeight, window.innerHeight * 0.55);
    grid.style.setProperty('height', Math.ceil(height) + 'px', 'important');
  }

  function clearTransforms() {
    var p = q('.flight-lane-prompt');
    var o = q('.flight-lane-output');
    if (p) p.style.removeProperty('transform');
    if (o) o.style.removeProperty('transform');
  }

  function setTransforms(promptX, outputX) {
    var p = q('.flight-lane-prompt');
    var o = q('.flight-lane-output');
    if (p) p.style.setProperty('transform', 'translate3d(' + promptX + 'px,0,0)', 'important');
    if (o) o.style.setProperty('transform', 'translate3d(' + outputX + 'px,0,0)', 'important');
  }

  function setLane(target, dx) {
    target = target === 'output' ? 'output' : 'prompt';
    document.body.classList.remove('flight-dragging');
    if (Number.isFinite(dx)) {
      var w = gridWidth();
      var baseP = laneName() === 'output' ? -w : 0;
      var baseO = laneName() === 'output' ? 0 : w;
      setTransforms(baseP + dx, baseO + dx);
      requestAnimationFrame(function () {
        syncTabs(target);
        clearTransforms();
        syncGridHeight();
      });
    } else {
      syncTabs(target);
      clearTransforms();
      syncGridHeight();
    }
  }

  function textScrollTarget(target) {
    return target && target.closest && target.closest('textarea, .output, #taskText, .code-output, .json-output');
  }

  function blocksSwipe(target) {
    return Boolean(target && target.closest && target.closest('textarea, input[type="text"], input[type="number"], input[type="date"], select, [contenteditable="true"]'));
  }


  function showIntro() {
    if (!mobile() || document.querySelector('.td613-swipe-intro')) return;
    var cue = document.createElement('div');
    cue.className = 'td613-swipe-intro';
    cue.textContent = '← ← SWIPE';
    document.body.appendChild(cue);
    window.setTimeout(function () { cue.remove(); }, 2450);
  }

  var swipe = { tracking: false, active: false, sx: 0, sy: 0 };
  var text = { el: null, sx: 0, sy: 0, top: 0 };

  function init() {
    syncTabs(laneName());
    clearTransforms();
    syncGridHeight();
    showIntro();
    var observer = new MutationObserver(syncGridHeight);
    var grid = q('.grid');
    if (grid) observer.observe(grid, { childList: true, subtree: true, attributes: true, characterData: true });
    document.addEventListener('input', syncGridHeight, true);
    window.addEventListener('resize', syncGridHeight, { passive: true });
    window.addEventListener('orientationchange', syncGridHeight, { passive: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();



  document.addEventListener('click', function (event) {
    var trigger = event.target && event.target.closest && event.target.closest('[data-flight-lane-target]');
    if (!trigger) return;
    var target = trigger.getAttribute('data-flight-lane-target');
    if (target !== 'prompt' && target !== 'output') return;
    event.preventDefault();
    event.stopImmediatePropagation();
    setLane(target);
  }, true);

  document.addEventListener('touchstart', function (event) {
    if (!mobile() || !event.touches || event.touches.length !== 1) return;
    var t = event.touches[0];
    var scrollEl = textScrollTarget(event.target);
    if (scrollEl) {
      text.el = scrollEl;
      text.sx = t.clientX;
      text.sy = t.clientY;
      text.top = scrollEl.scrollTop || 0;
      swipe.tracking = false;
      return;
    }
    if (blocksSwipe(event.target)) return;
    swipe.tracking = true;
    swipe.active = false;
    swipe.sx = t.clientX;
    swipe.sy = t.clientY;
  }, { capture: true, passive: true });

  document.addEventListener('touchmove', function (event) {
    if (!mobile()) return;
    var touch = event.touches && event.touches[0];
    if (!touch) return;

    if (text.el) {
      var tx = touch.clientX - text.sx;
      var ty = touch.clientY - text.sy;
      if (Math.abs(ty) > 4 && Math.abs(ty) >= Math.abs(tx)) {
        text.el.scrollTop = text.top - ty;
        if (event.cancelable) event.preventDefault();
        event.stopImmediatePropagation();
      }
      return;
    }

    if (!swipe.tracking) return;
    var dx = touch.clientX - swipe.sx;
    var dy = touch.clientY - swipe.sy;
    if (Math.abs(dx) < 12 || Math.abs(dx) < Math.abs(dy) * 1.08) return;
    swipe.active = true;
    if (event.cancelable) event.preventDefault();
    event.stopImmediatePropagation();
    document.body.classList.add('flight-dragging');
    var w = gridWidth();
    dx = Math.max(-w, Math.min(w, dx));
    var baseP = laneName() === 'output' ? -w : 0;
    var baseO = laneName() === 'output' ? 0 : w;
    setTransforms(baseP + dx, baseO + dx);
  }, { capture: true, passive: false });

  document.addEventListener('touchend', function (event) {
    if (!mobile()) return;
    if (text.el) {
      text.el = null;
      return;
    }
    if (!swipe.tracking) return;
    var touch = event.changedTouches && event.changedTouches[0];
    document.body.classList.remove('flight-dragging');
    swipe.tracking = false;
    if (!touch) return;
    var dx = touch.clientX - swipe.sx;
    var dy = touch.clientY - swipe.sy;
    if (!swipe.active || Math.abs(dx) < 44 || Math.abs(dx) < Math.abs(dy) * 1.15) {
      swipe.active = false;
      setLane(laneName(), dx);
      return;
    }
    event.stopImmediatePropagation();
    setLane(dx < 0 ? 'output' : 'prompt', dx);
    swipe.active = false;
  }, { capture: true, passive: true });

  window.TD613FlightSetLane = setLane;
  window.snapFlightLane = setLane;
  window.syncMobileFlightLane = function () { setLane(laneName()); };
})();
</script>`;

html = html.replace('</style>', `${css}\n</style>`);
html = html.replace('</body>', `${js}\n</body>`);

if (!html.includes(marker)) throw new Error('PR85 CSS missing');
if (!html.includes('td613-flight-pr85-final-script')) throw new Error('PR85 script missing');
if (html.includes('td613-flight-pr78-absolute-mobile-lane-script')) throw new Error('old PR78 script remained');
if (html.includes('td613-flight-pr82-unsticky-zoom-script')) throw new Error('old PR82 script remained');
if (!html.includes("cue.textContent = '← ← SWIPE'")) throw new Error('PR85 swipe cue missing');
if (!html.includes('prepNoZoom')) throw new Error('PR85 no-zoom focus guard missing');
if (!html.includes('font-size: 9px !important')) throw new Error('PR85 compact textarea size missing');

fs.writeFileSync(path, html);
console.log('patched TD613 Flight PR85 final mobile repair');
