(function () {
  'use strict';
  var VERSION = 'pr129-flight-android-scroll-lite/v1';
  var isAndroid = /Android/i.test(navigator.userAgent || '');
  window.TD613_FLIGHT_ANDROID_SCROLL_FIX = { version: VERSION, active: isAndroid };
  if (!isAndroid) return;

  function installStyle() {
    if (document.getElementById('td613FlightAndroidScrollLiteStyle')) return;
    var style = document.createElement('style');
    style.id = 'td613FlightAndroidScrollLiteStyle';
    style.textContent = [
      'html, body { overflow-y:auto!important; overscroll-behavior-y:auto!important; -webkit-overflow-scrolling:touch!important; }',
      'body { touch-action:pan-y pan-x pinch-zoom!important; }',
      '.page-wrap { min-height:100vh!important; overflow:visible!important; }',
      '@media (max-width:820px) { .grid { touch-action:pan-x pan-y pinch-zoom!important; -webkit-overflow-scrolling:touch!important; } }',
      '@media (max-width:820px) { textarea, .output, .json-output, .code-output { touch-action:pan-y pinch-zoom!important; } }'
    ].join('\n');
    document.head.appendChild(style);
  }

  function boot() {
    document.body && (document.body.dataset.flightAndroidScrollFix = VERSION);
    installStyle();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
}());
