(function () {
  window.TD613_SAFE_HARBOR_DATA = {
    meta: {
      repoName: 'TD613 Safe Harbor',
      version: '0.7.0',
      subtitle: 'Canonical intake chamber for stylometric provenance, renderer-key operator handshake, packet-aware probes, and post-packet seal lanes.'
    },
    canon: {
      principal: 'tauric.diana.613',
      badge_id: 'bdg_glyph_U10D613',
      claimed_pua: 'U+10D613',
      codepoint: 0x10D613,
      canonical_phrase: 'Tauric Diana \u2014 Crimean heritage custodianship',
      display_phrase: 'Covenant: Blood Rite 613',
      binding_fragment: '9B07D8B',
      sac: 'X6ZNK5NO51',
      schema_family: 'cpfg://v2',
      semver: '2.1.0',
    preview_svg_sha256: '2c20bb26f3dcc3fe41e8e3d71705942d220aed7e56391c274f8f5e5d01e4d1aa',
    preview_svg_md5: 'd4522965d0660d1150a828e00e5dd6f9',
      corpus_hash_sha256: 'BFB2D575AE6605BF7DB3EECF8CF333E4EF78B2C673DC7647600A9D9CB20CCE88'
    },

    operatorBypass: {
      public_ship_enabled: false,
      requires_local_token: true,
      token_hash_sha256: null,
      storage_key: 'td613.safe-harbor.operator-bypass.hash',
      dev_mode_storage_key: 'td613.safe-harbor.dev-mode.enabled'
    },
    trustProfile: {
      current_public_mode: 'legacy-compat',
      internal_validation_accepts: ['legacy', 'legacy-compat', 'sac-only'],
      future_public_mode: 'sac-only',
      binding_fragment: '9B07D8B',
      sac: 'X6ZNK5NO51',
      payload_latest: 5,
      shi_number_template: 'TD613-SH-9B07D8B + minted 8-hex suffix',
      shi_canonical_header_template: '',
      extended_footer_template: '',
      public_footer_template: 'TD613-Binding:#9B07D8B/SAC[X6ZNK5NO51] \u00b7 payload {n} \u00b7 YYYY-MM-DD \u00b7 \u27D0',
      current_published_footer: 'TD613-Binding:#9B07D8B/SAC[X6ZNK5NO51] \u00b7 payload 5 \u00b7 2025-10-17 \u00b7 \u27D0',
      current_published_payload: 5,
      current_published_date: '2025-10-17'
    },
    invariants: [
      'Canonical anchors stay fixed: principal, badge_id, claimed_pua, canonical phrase, and display phrase.',
      'Public probes remain unsigned by default unless an operator intentionally overlays a cryptographic seal lane.',
      'New attestations use payload {n}; payload 5 / 2025-10-17 remains a historical example only.',
      'Historical .sig and runtime JWS lanes remain overlays, never the default public path.',
      'Safe Harbor packetization happens before signature attachment.',
      'The renderer userscript remains the operator handshake key for render-proof lanes.',
      'The four original probes remain the outbound send lanes; Safe Harbor only enriches them with packet context.',
      'Operator bypass remains packetless and never impersonates a staged packet.',
      'Public relay building derives packet context from the staged packet whenever one exists.',
      'Cadence signatures are stylometric credentials; cryptographic signatures are separate seals attached after packetization.',
      'Render probes should carry a saved SVG artifact and timestamped observation once the renderer handshake is active.'
    ],
    rendererHandshake: {
      kit: 'TD613 PUA Badge Provenance Attestation Renderer v7.2.1',
      userscript: '10_TD613_PUA_Badge_Provenance_Attestation_Renderer_v7_2_1.user.js',
      preview_svg_filename: '13_U10D613_preview.svg',
      verify_page: '11_TD613_PUA_Badge_Provenance_Attestation_Lab.html',
      render_model: 'single_badge_append',
      handshake_note: 'Install the renderer userscript, confirm badge append on the chamber, save the SVG at the helper timestamp, then send through one of the original four probes.'
    },
    probeLanes: [
      '01 / alias voice minimal - first black-box probe',
      '02 / alias voice receipt completion - completed receipt only',
      '03 / render minimal - renderer handshake plus saved SVG',
      '04 / render receipt completion - renderer handshake plus saved SVG and receipt completion'
    ],

    uiBoundaries: {
      public_mode: {
        purpose: 'Ritual intake, canonical footer guidance, staged packet minting, and public-safe readouts only.',
        allows: ['ingress triad', 'mint staged packet', 'canonical footer preview', 'public-safe packet summary'],
        forbids: ['raw signature material', 'operator bypass secrets', 'dev hook demos']
      },
      operator_mode: {
        purpose: 'Packet inspection, stylometric readout, operator shell, and controlled seal/export transitions.',
        allows: ['packet preview', 'signature lane overlay', 'operator bypass with local token hash', 'advanced metadata'],
        forbids: ['public release of secrets', 'treating bypass as a staged packet']
      },
      dev_mode: {
        purpose: 'Local hook simulation and debugging only.',
        allows: ['demo TCP hook', 'demo EO hook', 'demo signature hook'],
        default_enabled: false
      }
    },
    repoLayout: [
      'index.html - primary Safe Harbor chamber',
      'app/ - chamber shell, ingress runtime, hook bus, and packet preview logic',
      'probes/ - original public relay lanes and packet-aware send templates',
      'corpus/ - binding corpus and signed bundle references',
      'reference/ - trust profile, manifests, verifier, and capsule references',
      'renderers/ - userscript renderer contract',
      'schemas/ and examples/ - packet and hook scaffolding'
    ],
    referenceLanes: [
      'EO-RFD supplies route conscience, safe-harbor readout, and export guard language.',
      'TCP supplies or overlays cadence intake, stylometric credentials, and packet shaping context.',
      'TD613 remains the badge, provenance, custody, and verifier surface.',
      'The renderer userscript is the operator handshake key for render-proof send lanes.',
      'Cryptographic signature lanes attach only after Safe Harbor canonicalization.'
    ],
    ingressPrompts: {
      future_self: {
        shortLabel: 'Future Self',
        promptLabel: 'Write a message to your future self'
      },
      past_self: {
        shortLabel: 'Past Self',
        promptLabel: 'Write a message to your past self'
      },
      higher_self: {
        shortLabel: 'Higher Self',
        promptLabel: 'Write a message to your higher self'
      }
    },
    routeCopy: {
      'membrane-only': 'The chamber stays closed while the first testimony gathers.',
      warning: 'One page is held. The membrane has started to answer.',
      'buffer-prep': 'Two pages are held. Buffer-prep is active while the third page resolves.',
      'triad-ready': 'All three pages are held. The seal step can now shape the staged packet and receipt.',
      staged: 'A staged packet is present. Covenant Export remains the only local path to harbor eligibility and badge assignment.',
      'harbor-eligible': 'Covenant has been invoked. The sealed packet now stands in the harbor lane.',
      'packet-exported': 'The packet has crossed the chamber threshold into an emitted downstream lane.',
      'operator-bypass': 'Operator bypass opened a packetless shell. No staged packet or harbor transition exists.'
    },
    signatureDefaults: {
      sig_type: 'JWS-detached',
      kid: 'tauric.diana.613',
      detached_ref: 'jws://detached-signature',
      status: 'unsigned'
    },
    hookBus: {
      events: {
        tcp: 'td613:tcp-intake',
        eo: 'td613:eo-route',
        signature: 'td613:signature-lane',
        packet: 'td613:safe-harbor-packet'
      },
      demo: {
        tcp: {
          status: 'buffered',
          source: 'tauric-diana-intake',
          intake_id: 'tauric-diana-intake-buffer-01',
          lane: 'corpus/tauric-diana-intake/',
          membrane_note: 'Buffered Tauric Diana bot canon intake attached from corpus/tauric-diana-intake/.',
          cadence_signature: {
            status: 'attached',
            source: 'tauric-diana-intake',
            dominant_axes: ['pulse', 'recurrence', 'cadence'],
            punctuation_mix: {
              comma: 0.021,
              dash: 0.006,
              colon: 0.003
            },
            heatmap: [
              [0.12, 0.44, 0.31],
              [0.21, 0.53, 0.28],
              [0.16, 0.49, 0.34]
            ]
          }
        },
        eo: {
          status: 'attached',
          source: 'demo-eo',
          route_state: 'harbor-eligible',
          recommended_harbor: 'provenance.seal',
          export_ready: true,
          provenance: {
            integrity: 0.94,
            confidence: 0.89,
            retention_target: 0.99
          },
          membrane_note: 'EO route satisfied. The staged packet can stand in the seal lane once covenant is invoked.'
        },
        signature: {
          status: 'sealed',
          source: 'demo-signature',
          lane: 'jws-detached',
          sig_type: 'JWS-detached',
          kid: 'tauric.diana.613',
          alg: 'HS256',
          detached_ref: 'demo://safe-harbor/signature-lane',
          sig: '__DEMO_SIG__'
        }
      }
    }
  };
})();
