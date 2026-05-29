import { readFileSync, writeFileSync } from 'node:fs';

const path = 'app/safe-harbor/td613-flight.html';
let html = readFileSync(path, 'utf8');

const cssMarker = '/* === TD613 Flight PR86 iOS thumb input guard === */';
const cssPatch = `${cssMarker}
html {
  -webkit-text-size-adjust: 100%;
  text-size-adjust: 100%;
}

@media (hover: none), (pointer: coarse), (max-width: 820px) {
  textarea,
  input[type="text"],
  input[type="number"],
  input[type="date"],
  input[type="search"],
  input[type="email"],
  input[type="url"],
  input[type="password"],
  select {
    font-size: 16px !important;
    line-height: 1.35 !important;
    -webkit-text-size-adjust: 100% !important;
    text-size-adjust: 100% !important;
    -webkit-user-select: text !important;
    user-select: text !important;
    touch-action: manipulation !important;
  }

  textarea:focus,
  input[type="text"]:focus,
  input[type="number"]:focus,
  input[type="date"]:focus,
  input[type="search"]:focus,
  input[type="email"]:focus,
  input[type="url"]:focus,
  input[type="password"]:focus,
  select:focus {
    font-size: 16px !important;
    scroll-margin-bottom: 42vh;
  }

  textarea {
    overflow: auto !important;
    -webkit-overflow-scrolling: touch;
  }

  #taskText,
  #outputText {
    font-size: 16px !important;
    line-height: 1.42 !important;
  }

  .seal-custom-label input[type="text"],
  #sealTargetWord,
  #sealVerbCustom,
  #sealVerbWithCustom {
    font-size: 16px !important;
    min-height: 2.35rem;
  }
}
`;

if (!html.includes(cssMarker)) {
  html = html.replace('</style>', `${cssPatch}\n</style>`);
}

const scriptMarker = '<!-- TD613 Flight PR86 iOS thumb input guard -->';
const scriptPatch = `${scriptMarker}
<script>
(function () {
  'use strict';
  var isTouch = window.matchMedia && (window.matchMedia('(hover: none)').matches || window.matchMedia('(pointer: coarse)').matches);
  if (!isTouch) return;
  document.documentElement.dataset.flightIosInputGuard = 'true';
  function armEditable(node) {
    if (!node || node.dataset.flightIosInputGuard === 'true') return;
    node.dataset.flightIosInputGuard = 'true';
    node.addEventListener('touchstart', function () {
      node.style.fontSize = '16px';
      node.style.webkitTextSizeAdjust = '100%';
    }, { passive: true });
    node.addEventListener('focus', function () {
      node.style.fontSize = '16px';
      node.style.webkitTextSizeAdjust = '100%';
      window.setTimeout(function () {
        try { node.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'smooth' }); } catch (error) {}
      }, 80);
    }, true);
  }
  function boot() {
    document.querySelectorAll('textarea,input[type="text"],input[type="number"],input[type="date"],input[type="search"],input[type="email"],input[type="url"],input[type="password"],select').forEach(armEditable);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
  window.setTimeout(boot, 500);
  window.TD613_FLIGHT_IOS_INPUT_GUARD = { version: 'pr86.1-ios-thumb-input-guard', boot: boot };
}());
</script>`;

if (!html.includes(scriptMarker)) {
  html = html.replace('</body>', `${scriptPatch}\n</body>`);
}

writeFileSync(path, html);
console.log('TD613 Flight iOS input guard applied');
