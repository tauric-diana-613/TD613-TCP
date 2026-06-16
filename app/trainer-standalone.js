(function () {
  function $(id) {
    return document.getElementById(id);
  }

  function setTrainerStatus(message, cue) {
    var base = $('trainerStatusBase');
    var cueNode = $('trainerStatusCue');
    if (base) base.textContent = message || '';
    if (cueNode) {
      cueNode.hidden = !cue;
      cueNode.textContent = cue || '';
      cueNode.dataset.cueKey = cue || '';
    }
  }

  function removeExpiredStationNav() {
    document.querySelectorAll('.station-nav, .top-tabs').forEach(function (node) {
      node.remove();
    });
  }

  function trainerSampleLibrary() {
    var data = window.TCP_DATA || {};
    var defaults = data.defaults || {};
    var corpus = data.diagnostic_corpus || {};
    return corpus.promotedSampleLibrary || corpus.samples || defaults.sample_library || [];
  }

  function fallbackApplyStaticGlyphs(root) {
    var glyphs = (root || document).querySelectorAll('[data-glyph-key]');
    glyphs.forEach(function (node) {
      node.dataset.glyphHydrated = node.dataset.glyphKey || 'static';
    });
  }

  function installStandaloneButtonSync(controller) {
    var nodes = {
      corpus: $('trainerCorpusInput'),
      candidate: $('trainerGeneratedOutput'),
      extract: $('trainerExtractBtn'),
      forge: $('trainerForgeDraftBtn'),
      validate: $('trainerValidateBtn'),
      release: $('trainerReleaseGateBtn'),
      exportButton: $('trainerExportBtn'),
      inject: $('trainerInjectBtn')
    };

    function snapshot() {
      if (controller && typeof controller.snapshot === 'function') {
        try { return controller.snapshot() || {}; } catch (error) { return {}; }
      }
      return {};
    }

    function sync() {
      var status = snapshot();
      var hasCorpus = Boolean(String(nodes.corpus && nodes.corpus.value || '').trim());
      var hasCandidate = Boolean(String(nodes.candidate && nodes.candidate.value || '').trim());
      var corpusReady = Boolean(status.corpusReady || status.sampleCount);
      var validationPass = Boolean(status.validationPass);
      var releaseGateArmed = Boolean(status.releaseGateArmed);
      var canInject = Boolean(status.canInject || validationPass);

      if (nodes.extract) nodes.extract.disabled = !hasCorpus;
      if (nodes.forge) nodes.forge.disabled = !hasCorpus && !corpusReady;
      if (nodes.validate) nodes.validate.disabled = !(hasCandidate && (hasCorpus || corpusReady));
      if (nodes.release) nodes.release.disabled = !validationPass;
      if (nodes.exportButton) nodes.exportButton.disabled = !(validationPass && releaseGateArmed);
      if (nodes.inject) nodes.inject.disabled = !canInject;

      document.body.dataset.trainerActionSync = 'ready';
      document.body.dataset.trainerCanExtract = String(Boolean(hasCorpus));
      document.body.dataset.trainerCanValidate = String(Boolean(hasCandidate && (hasCorpus || corpusReady)));
    }

    function deferSync() {
      window.requestAnimationFrame ? window.requestAnimationFrame(sync) : window.setTimeout(sync, 0);
      window.setTimeout(sync, 80);
    }

    [nodes.corpus, nodes.candidate].forEach(function (node) {
      if (!node) return;
      node.addEventListener('input', deferSync);
      node.addEventListener('change', deferSync);
      node.addEventListener('keyup', deferSync);
    });

    [nodes.extract, nodes.forge, nodes.validate, nodes.release, nodes.exportButton, nodes.inject].forEach(function (node) {
      if (!node) return;
      node.addEventListener('click', deferSync);
      node.addEventListener('pointerup', deferSync);
    });

    sync();
    window.setTimeout(sync, 250);
    window.setTimeout(sync, 900);
  }

  async function bootTrainerStandalone() {
    if (!document.body || document.body.getAttribute('data-page-kind') !== 'trainer') return;
    document.title = 'TCP / Trainer';
    document.body.dataset.trainerBoot = 'standalone-start';
    removeExpiredStationNav();

    var engine = window.TCP_ENGINE || null;
    if (!engine || typeof engine.extractCadenceProfile !== 'function') {
      document.body.dataset.trainerBoot = 'engine-missing';
      setTrainerStatus('Trainer startup fault // TCP engine did not load.');
      return;
    }

    try {
      var version = (window.TD613_ASSET_VERSIONS && (window.TD613_ASSET_VERSIONS.trainerStandalone || window.TD613_ASSET_VERSIONS.main)) || '202606162245';
      var trainerModule = await import('./toys/persona-trainer/browser.js?v=' + version);
      var sessionPersonas = window.TCP_TRAINER_SESSION_PERSONAS || [];
      window.TCP_TRAINER_SESSION_PERSONAS = sessionPersonas;

      var controller = await trainerModule.createTrainerController({
        root: document,
        engine: engine,
        sampleLibrary: trainerSampleLibrary(),
        applyStaticGlyphs: fallbackApplyStaticGlyphs,
        resolveDraftContext: function () {
          return {};
        },
        onStatus: function (message) {
          setTrainerStatus(message || 'Trainer ready.');
        },
        onInjectPersona: function (persona) {
          var next = Object.assign({}, persona || {}, {
            source: 'trainer',
            injectedAt: new Date().toISOString()
          });
          window.TCP_TRAINER_SESSION_PERSONAS.push(next);
          setTrainerStatus((next.name || 'Trainer Persona') + ' is live in this Trainer session.', 'injected');
          return next;
        }
      });

      window.TCP_TRAINER_LAB = controller;
      installStandaloneButtonSync(controller);
      document.body.dataset.trainerBoot = 'standalone-ready';
      document.body.dataset.bootStage = 'trainer-standalone-ready';
      setTrainerStatus('Paste a corpus, extract the field, forge a draft, then validate the passage.');
    } catch (error) {
      document.body.dataset.trainerBoot = 'standalone-error';
      document.body.dataset.bootError = String(error && error.message ? error.message : error || 'unknown').replace(/[^a-z0-9.\-_/ ]/gi, '').slice(0, 120);
      setTrainerStatus('Trainer startup fault // ' + (error && error.message ? error.message : error));
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootTrainerStandalone, { once: true });
  } else {
    bootTrainerStandalone();
  }
}());
