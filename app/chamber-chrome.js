(function () {
  var CHAMBER_NAV = [
    { label: 'Gateway', href: './index.html' },
    { label: 'Aperture', href: './aperture/index.html?v=202604192040' }
  ];

  function paintNav() {
    var containers = document.querySelectorAll('.station-masthead-links');
    for (var i = 0; i < containers.length; i++) {
      var container = containers[i];
      if (container.dataset.chromeReady) continue;
      container.dataset.chromeReady = '1';
      for (var j = 0; j < CHAMBER_NAV.length; j++) {
        var a = document.createElement('a');
        a.className = 'gateway-link';
        a.href = CHAMBER_NAV[j].href;
        a.textContent = CHAMBER_NAV[j].label;
        container.appendChild(a);
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', paintNav);
  } else {
    paintNav();
  }
}());
