(function () {
  if (window.__TD613_HUSH_PHASE31_BIND_GUARD__) return;
  window.__TD613_HUSH_PHASE31_BIND_GUARD__ = 'v1';

  var targetIds = {
    hushCustomizeTabBtn: { click: true },
    hushBuiltInTabBtn: { click: true },
    hushPhase31LogSampleBtn: { click: true },
    hushPhase31Undo: { click: true },
    hushPhase31SaveMaskBtn: { click: true },
    hushPhase31CancelSave: { click: true },
    hushPhase31AddToStudio: { click: true },
    hushPhase31ResetCustomizer: { click: true },
    hushVoiceReferenceSamplesSaved: { input: true }
  };

  var originalAdd = EventTarget.prototype.addEventListener;
  EventTarget.prototype.addEventListener = function (type, listener, options) {
    try {
      var id = this && this.id;
      if (id && targetIds[id] && targetIds[id][type] && this.dataset) {
        var key = 'td613Phase31' + type.charAt(0).toUpperCase() + type.slice(1) + 'Bound';
        if (this.dataset[key] === 'true') return;
        this.dataset[key] = 'true';
      }
    } catch (error) {}
    return originalAdd.call(this, type, listener, options);
  };
}());
