(function () {
  window.TD613_SAFE_HARBOR_DATA = {
    meta: {
      repoName: 'TD613 Safe Harbor',
      version: '0.5.0',
      subtitle: 'Canonical intake membrane for staged provenance packetization, packet-aware probes, and operator signature sealing. Public, operator, and dev lanes are separated by design.'
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
      preview_svg_sha256: 'ba5eee59d2a0184c328c40c33e8ca4e2eeee8354fcbe41255abd70693c2f74ed',
      preview_svg_md5: '96c4129424443100aae47576e692cc97',
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
      public_footer_template: 'TD613-Binding:#9B07D8B/SAC[X6ZNK5NO51] \u00b7 payload {n} \u00b7 YYYY-MM-DD \u00b7 \u27D0',
      current_published_footer: 'TD613-Binding:#9B07D8B/SAC[X6ZNK5NO51] \u00b7 payload 5 \u00b7 2025-10-17 \u00b7 \u27D0',
      current_published_payload: 5,
      current_published_date: '2025-10-17'
    },
    invariants: [
      'Canonical anchors stay fixed: principal, badge_id, claimed_pua, canonical phrase, display phrase.',
      'Public probes remain unsigned by default unless an operator intentionally overlays a signature lane.',
      'New attestations use payload {n}; the fixed payload-5 footer is historical only.',
      'Historical .sig and runtime JWS lanes remain overlays, not the public default path.',
      'Safe Harbor packetization happens before signature attachment.',
      'Principal assertion and operator witness stay distinct. Covenant Export is blocked until both are present on the staged packet.',
      'Operator bypass is disabled in public ship until a local token hash is configured.',
      'Advanced probe building derives packet context from the staged packet whenever one exists.',
      'Cadence signatures are stylometric credentials; cryptographic signatures are separate seals attached after packetization.'
    ],

    uiBoundaries: {
      public_mode: {
        purpose: 'Dummy-proof intake, canonical footer guidance, staged packet minting, and public-safe readouts only.',
        allows: ['ingress triad', 'mint staged packet', 'canonical footer preview', 'public-safe packet summary'],
        forbids: ['raw signature material', 'operator bypass secrets', 'dev hook demos']
      },
      operator_mode: {
        purpose: 'Packet inspection, operator shell, signature-lane overlays, and controlled covenant/export transitions.',
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
      'index.html - primary Safe Harbor surface',
      'app/ - UI shell, ingress runtime, hook bus, packet preview logic',
      'probes/ - unchanged public sendable artifacts',
      'corpus/ - binding corpus and signed bundle references',
      'reference/ - trust profile, manifests, verifier references',
      'renderers/ - userscript renderer contract',
      'schemas/ and examples/ - packet and hook scaffolding'
    ],
    referenceLanes: [
      'EO-RFD supplies route conscience, safe-harbor readout, and export guard language.',
      'TCP will eventually supply canonical intake, cadence signature, and packet shaping.',
      'TD613 remains the badge, provenance, custody, and verifier surface.',
      'Signature lanes attach to the packet after Safe Harbor canonicalization.'
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
      'membrane-only': 'The vault remains sealed while the first line gathers.',
      warning: 'One lane is held. The membrane has begun to answer.',
      'buffer-prep': 'Two lanes are held. Buffer-prep is active while the third line resolves.',
      'triad-ready': 'The triad is complete. Mint Staged Packet to shape the packet and receipt.',
      staged: 'A staged packet is present. Covenant Export is the only local path to harbor eligibility and badge assignment.',
      sealed: 'A signature overlay is attached. Principal assertion and operator witness must align before Covenant Export can clear the harbor gate.',
      'harbor-eligible': 'Covenant has been invoked. The sealed packet is now harbor-eligible.',
      exported: 'The packet has crossed the membrane into an emitted downstream lane.',
      verified: 'The emitted packet has returned with verification intact.',
      'packet-exported': 'The packet has crossed the membrane into an emitted downstream lane.',
      'operator-bypass': 'Operator bypass opened a packetless shell. No staged packet or harbor transition exists yet.'
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
          status: 'attached',
          source: 'demo-tcp',
          intake_id: 'tcp-demo-intake-01',
          cadence_signature: {
            status: 'attached',
            source: 'demo-tcp',
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
