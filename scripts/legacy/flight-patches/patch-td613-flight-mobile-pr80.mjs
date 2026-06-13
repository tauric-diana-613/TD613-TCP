import fs from 'fs';

const path = 'app/safe-harbor/td613-flight.html';
let html = fs.readFileSync(path, 'utf8');

const sentinel = 'PR80_SENTINEL TD613 Flight PR80 mobile chrome restoration';
html = html.replace(/\n\/\* PR80_SENTINEL TD613 Flight PR80 mobile chrome restoration \*\/[\s\S]*?(?=\n<\/style>)/m, '');
html = html.replace(/\n\/\* === TD613 Flight PR80 mobile chrome restoration === \*\/[\s\S]*?(?=\n<\/style>)/m, '');
html = html.replace(/\n?<script id="td613-flight-pr80-mobile-header-collapse-script">[\s\S]*?<\/script>/g, '');
html = html.replace(/\n?<script id="td613-flight-pr80-swipe-cue-script">[\s\S]*?<\/script>/g, '');

const css = `
/* PR80_SENTINEL TD613 Flight PR80 mobile chrome restoration */
@media (max-width: 820px) {
  html,
  body {
    -webkit-text-size-adjust: 100% !important;
    text-size-adjust: 100% !important;
  }

  html body .page-wrap {
    grid-template-rows: auto auto minmax(0, 1fr) !important;
  }

  html body .page-wrap header {
    position: relative !important;
    display: grid !important;
    grid-template-areas: "title" "nav" "text" "tags" "howto" !important;
    grid-template-columns: minmax(0, 1fr) !important;
    gap: 8px !important;
    padding: 14px 14px 12px !important;
    margin-bottom: 10px !important;
    overflow: hidden !important;
    max-height: none !important;
    opacity: 1 !important;
    pointer-events: auto !important;
    transform: none !important;
    transition: none !important;
  }

  html body .page-wrap header h1 {
    grid-area: title !important;
    font-size: clamp(26px, 7.2vw, 38px) !important;
    line-height: .98 !important;
    max-width: 100% !important;
    margin: 0 !important;
  }

  html body .page-wrap header h1::after {
    content: "SAFE HARBOR ISSUE" !important;
    display: block !important;
    font-size: 8px !important;
    line-height: 1.25 !important;
    letter-spacing: .18em !important;
    margin-top: 6px !important;
  }

  html body .page-wrap header .flight-quick-nav {
    grid-area: nav !important;
    position: static !important;
    inset: auto !important;
    display: flex !important;
    flex-wrap: nowrap !important;
    justify-content: flex-end !important;
    align-items: center !important;
    gap: 5px !important;
    width: 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;
    padding: 0 !important;
    margin: -2px 0 0 auto !important;
    overflow: visible !important;
    transform: none !important;
    z-index: 3 !important;
  }

  html body .page-wrap header .flight-quick-nav > a,
  html body .page-wrap header .flight-quick-nav > button {
    flex: 0 0 auto !important;
    width: auto !important;
    min-width: 0 !important;
    max-width: none !important;
    min-height: 18px !important;
    height: 18px !important;
    padding: 3px 8px !important;
    border: 1px solid rgba(137,255,240,.32) !important;
    border-radius: 4px !important;
    clip-path: polygon(0 4px, 4px 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px)) !important;
    background: linear-gradient(180deg, rgba(13,55,49,.82), rgba(3,17,16,.95)) !important;
    box-shadow: inset 0 1px 0 rgba(245,255,246,.10), 0 0 10px rgba(49,255,138,.08) !important;
    color: rgba(232,255,242,.90) !important;
    font-size: 7px !important;
    line-height: 1 !important;
    letter-spacing: .10em !important;
    white-space: nowrap !important;
    overflow-wrap: normal !important;
    text-align: center !important;
  }

  html body .page-wrap header .flight-quick-nav > .flight-nav-signout,
  html body .page-wrap header .flight-quick-nav > button.flight-nav-signout {
    min-height: 0 !important;
    height: auto !important;
    padding: 2px !important;
    border: 0 !important;
    border-radius: 0 !important;
    clip-path: none !important;
    background: transparent !important;
    box-shadow: none !important;
    color: rgba(49,255,138,.82) !important;
    font-size: 6px !important;
    letter-spacing: .13em !important;
  }

  html body .page-wrap header .subtitle {
    grid-area: text !important;
    padding-top: 0 !important;
    padding-left: 12px !important;
    font-size: 10px !important;
    line-height: 1.25 !important;
    max-width: 100% !important;
  }

  html body .page-wrap header .pill-row {
    grid-area: tags !important;
    display: flex !important;
    flex-wrap: wrap !important;
    align-items: center !important;
    justify-content: flex-start !important;
    gap: 3px 8px !important;
    width: 100% !important;
    min-width: 0 !important;
    overflow: visible !important;
    padding: 0 0 3px !important;
    white-space: normal !important;
  }

  html body .page-wrap header .pill-row > *,
  html body .page-wrap header .pill-row .pill {
    flex: 0 0 auto !important;
    width: auto !important;
    min-width: 0 !important;
    max-width: 100% !important;
    min-height: 0 !important;
    margin: 0 !important;
    padding: 0 8px 0 0 !important;
    border: 0 !important;
    border-right: 1px solid rgba(137,255,240,.25) !important;
    border-radius: 0 !important;
    clip-path: none !important;
    background: transparent !important;
    box-shadow: none !important;
    color: rgba(190,255,223,.78) !important;
    font-size: 6px !important;
    line-height: 1.1 !important;
    letter-spacing: .12em !important;
    white-space: nowrap !important;
    text-transform: uppercase !important;
  }

  html body .page-wrap header details.howto { grid-area: howto !important; }

  html body .mobile-flight-switcher {
    position: relative !important;
    top: auto !important;
    z-index: 20 !important;
    overflow: visible !important;
    margin-bottom: 8px !important;
  }

  html body .mobile-flight-switcher::after { content: none !important; }

  html body .grid > .flight-lane {
    transition: transform .34s cubic-bezier(.18,.82,.16,1) !important;
  }

  html body.flight-dragging .grid > .flight-lane {
    transition: none !important;
  }

  html body .mobile-flight-switcher .mobile-lane-tab {
    min-height: 24px !important;
    padding: 3px 8px !important;
    font-size: 8px !important;
  }

  html body .mobile-flight-switcher .mobile-lane-tab span { font-size: 8px !important; }
  html body .mobile-flight-switcher .mobile-lane-tab small { font-size: 5px !important; }

  html body .flight-lane .card,
  html body .flight-lane .dev-drawer,
  html body .flight-lane .output-card,
  html body .flight-lane .seal-card,
  html body .flight-lane .copy-bin-card {
    padding: 10px 10px 11px 16px !important;
    margin-bottom: 9px !important;
    overflow: hidden !important;
  }

  html body .flight-lane .card h2,
  html body .flight-lane .output-card h2,
  html body .flight-lane .seal-card h2 {
    font-size: 17px !important;
    line-height: 1.05 !important;
    letter-spacing: .12em !important;
  }

  html body .flight-lane p,
  html body .flight-lane .muted,
  html body .flight-lane .help,
  html body .flight-lane .note,
  html body .flight-lane .warning {
    font-size: 11px !important;
    line-height: 1.24 !important;
  }

  html body .flight-lane .checkbox-row,
  html body .flight-lane .radio-row,
  html body .flight-lane .copy-grid,
  html body .flight-lane .seal-lozenge-row,
  html body .flight-lane .row {
    display: flex !important;
    flex-direction: row !important;
    flex-wrap: wrap !important;
    align-items: flex-start !important;
    justify-content: flex-start !important;
    gap: 4px 5px !important;
    overflow: visible !important;
    width: 100% !important;
    grid-template-columns: none !important;
  }

  html body .flight-lane .checkbox-row > label,
  html body .flight-lane .radio-row > label,
  html body .flight-lane .copy-chip,
  html body .flight-lane .row > .btn,
  html body .flight-lane .row > button,
  html body .flight-lane button.btn,
  html body .flight-lane button.primary,
  html body .flight-lane button.secondary,
  html body .flight-lane button.ghost {
    display: inline-flex !important;
    flex: 0 1 auto !important;
    align-items: center !important;
    justify-content: flex-start !important;
    width: auto !important;
    min-width: 0 !important;
    max-width: 100% !important;
    min-height: 18px !important;
    max-height: none !important;
    padding: 3px 7px !important;
    border-radius: 999px !important;
    font-size: 7px !important;
    line-height: 1.06 !important;
    letter-spacing: .025em !important;
    white-space: normal !important;
    overflow: hidden !important;
    overflow-wrap: anywhere !important;
    text-align: left !important;
  }

  html body .flight-lane-prompt .checkbox-row > label,
  html body .flight-lane-prompt .radio-row > label {
    max-width: calc(50% - 5px) !important;
  }

  html body .flight-lane-output .checkbox-row > label,
  html body .flight-lane-output .radio-row > label,
  html body .flight-lane-output .copy-chip {
    max-width: 100% !important;
  }

  html body .flight-lane #btnGenerate,
  html body .flight-lane #btnRandomizer,
  html body .flight-lane #btnResetControls,
  html body .flight-lane #btnClearInput,
  html body .flight-lane #btnClear,
  html body .flight-lane .output-toolbar button,
  html body .flight-lane .payload-stepper button {
    flex: 0 0 auto !important;
    width: auto !important;
    max-width: none !important;
    min-height: 20px !important;
    max-height: 28px !important;
    padding: 3px 7px !important;
    font-size: 7px !important;
    text-align: center !important;
    justify-content: center !important;
    white-space: nowrap !important;
    overflow: hidden !important;
  }

  html body .flight-lane input[type="checkbox"],
  html body .flight-lane input[type="radio"] {
    flex: 0 0 8px !important;
    width: 8px !important;
    min-width: 8px !important;
    height: 8px !important;
    margin: 0 4px 0 0 !important;
  }

  html body .flight-lane textarea,
  html body .flight-lane .output,
  html body .flight-lane #taskText {
    font-size: 9px !important;
    line-height: 1.18 !important;
    letter-spacing: .005em !important;
    padding: 8px 9px !important;
  }

  html body .flight-lane #taskText,
  html body .flight-lane .output {
    min-height: 74px !important;
    height: clamp(74px, 9dvh, 102px) !important;
    max-height: 120px !important;
  }

  html body .flight-lane input[type="text"],
  html body .flight-lane input[type="number"],
  html body .flight-lane select {
    font-size: 9px !important;
    line-height: 1.12 !important;
    padding: 3px 6px !important;
  }

  html body .mobile-prompt-rail,
  html body .mobile-prompt-rail.mobile-prompt-rail-top,
  html body .mobile-prompt-rail.is-docked {
    min-height: 22px !important;
    padding: 4px 8px 4px 10px !important;
    gap: 6px !important;
    justify-content: flex-end !important;
  }

  html body .mobile-prompt-rail span:first-child { font-size: 7px !important; }
  html body .mobile-prompt-rail-pill { font-size: 6px !important; padding: 2px 5px !important; }

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
<script id="td613-flight-pr80-swipe-cue-script">
(function () {
  function mobile() { return window.matchMedia && window.matchMedia('(max-width: 820px)').matches; }
  function showCue() {
    if (!mobile() || document.querySelector('.td613-swipe-intro')) return;
    var cue = document.createElement('div');
    cue.className = 'td613-swipe-intro';
    cue.textContent = '← ← SWIPE';
    document.body.appendChild(cue);
    window.setTimeout(function () { cue.remove(); }, 2450);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', showCue, { once: true });
  else showCue();
})();
</script>`;

html = html.replace('</style>', `${css}\n</style>`);
html = html.replace('</body>', `${js}\n</body>`);

if (!html.includes(sentinel)) throw new Error('PR80 sentinel missing');
if (!html.includes('td613-flight-pr80-swipe-cue-script')) throw new Error('PR80 one-shot swipe cue script missing');
if (!html.includes("cue.textContent = '← ← SWIPE'")) throw new Error('PR80 centered swipe cue text missing');
if (html.includes('SWIPE → →')) throw new Error('PR80 reverse swipe cue remained');
if (!html.includes('td613SwipeIntro')) throw new Error('PR80 swipe cue animation missing');
if (html.includes('td613-flight-pr80-mobile-header-collapse-script')) throw new Error('PR80 collapse script remained');
if (!html.includes('display: inline-flex !important')) throw new Error('PR80 compact chip controls missing');
if (!html.includes('transition: transform .34s cubic-bezier(.18,.82,.16,1) !important')) throw new Error('PR80 swipe animation reinforcement missing');
if (html.includes('Loading TD613 Flight') || html.includes('td613-flight-legacy.html') || html.includes('<iframe')) throw new Error('wrapper regression detected');

fs.writeFileSync(path, html);
console.log('patched TD613 Flight PR80 centered swipe cue and unfrozen tabs');
