(function () {
  window.TD613_SAFE_HARBOR_DATA = {
    meta: {
      repoName: 'TD613 Safe Harbor',
      version: '0.4.0',
      subtitle: 'Canonical intake engine for provenance attestation.'
    },
    canonicalizationSpec: {
      id: 'td613.safe-harbor.c14n/v1',
      encoding: 'utf-8',
      scope: 'canonical-packet-body-minus-self-hash-fields',
      rules: [
        'sorted-object-keys',
        'array-order-preserved',
        'no-extra-whitespace',
        'stable-escaping',
        'undefined-omitted',
        'no-comments'
      ]
    },
    packetContract: {
      schemaFile: 'safe_harbor/packet.schema.json',
      compatibilitySchemaFile: 'schemas/td613-safe-harbor.packet.schema.json',
      modules: {
        canonicalize: 'safe_harbor/canonicalize.js',
        hash: 'safe_harbor/hash.js',
        signature: 'safe_harbor/signature.js',
        lifecycle: 'safe_harbor/lifecycle.js'
      }
    },
    annex: {
      host: 'TCP',
      source: 'app/safe-harbor',
      returnLanes: [
        '../index.html#homebase',
        '../index.html#readout',
        '../index.html#deck'
      ]
    },
    canon: {
      principal: 'tauric.diana.613',
      badge_id: 'bdg_glyph_U10D613',
      claimed_pua: 'U+10D613',
      codepoint: 0x10D613,
      canonical_phrase: 'Tauric Diana \u2014 Crimean heritage custodianship',
      display_phrase: 'Covenant: Blood Rite 613',
      binding_fragment: '#9B07D8B',
      sac: 'SAC[X6ZNK5NO51]',
      schema_family: 'cpfg://v2',
      semver: '2.1.0',
      preview_svg_sha256: 'ba5eee59d2a0184c328c40c33e8ca4e2eeee8354fcbe41255abd70693c2f74ed',
      preview_svg_md5: '96c4129424443100aae47576e692cc97',
      corpus_hash_sha256: 'BFB2D575AE6605BF7DB3EECF8CF333E4EF78B2C673DC7647600A9D9CB20CCE88',
      current_public_default: 'LEGACY-COMPAT',
      public_footer_template: 'TD613-Binding:#9B07D8B/SAC[X6ZNK5NO51] \u00b7 payload {n} \u00b7 YYYY-MM-DD \u00b7 \u27D0',
      historical_example: {
        label: 'historical',
        payload_index: 5,
        attestation_date: '2025-10-17',
        public_footer: 'TD613-Binding:#9B07D8B/SAC[X6ZNK5NO51] \u00b7 payload 5 \u00b7 2025-10-17 \u00b7 \u27D0'
      }
    },
    trustProfile: {
      current_public_mode: 'LEGACY-COMPAT',
      internal_validation_accepts: ['LEGACY', 'LEGACY-COMPAT', 'SAC-ONLY'],
      future_public_mode: 'SAC-ONLY',
      binding_fragment: '#9B07D8B',
      sac: 'SAC[X6ZNK5NO51]',
      payload_latest: 5,
      signed_bundle_payload_count: 5,
      suggested_next_payload: 6,
      public_footer_template: 'TD613-Binding:#9B07D8B/SAC[X6ZNK5NO51] \u00b7 payload {n} \u00b7 YYYY-MM-DD \u00b7 \u27D0',
      current_published_footer: 'TD613-Binding:#9B07D8B/SAC[X6ZNK5NO51] \u00b7 payload 5 \u00b7 2025-10-17 \u00b7 \u27D0',
      current_published_payload: 5,
      current_published_date: '2025-10-17',
      live_template_rule: 'Suggest next payload from signed bundle if available; manual override only in operator mode.'
    },
    signatureModel: {
      cadence_signature: 'stylometric credential from TCP-style intake and Safe Harbor triad analysis',
      cryptographic_signature: 'detached seal over canonical JSON of the packet',
      rule: 'Safe Harbor mints the packet and packet hash first. Signature lanes wrap the packet after canonicalization and never define or mutate it.'
    },
    publicBoundary: {
      public_may_show: [
        'binding_fragment',
        'sac',
        'payload',
        'date',
        'receipt_state_summary',
        'packet_verified_status'
      ],
      operator_may_show: [
        'packet_json',
        'packet_hash_sha256',
        'sig',
        'sig_type',
        'kid',
        'route_state',
        'harbor_status',
        'cadence_credentials',
        'canonical_json_preview'
      ],
      public_must_hide: [
        'badge_id',
        'sig',
        'route_diagnostics',
        'packet_hash_sha256'
      ]
    },
    invariants: [
      'Canonical anchors stay fixed: tauric.diana.613, bdg_glyph_U10D613, U+10D613, #9B07D8B, and SAC[X6ZNK5NO51].',
      'Public default remains LEGACY-COMPAT with the compact footer canon.',
      'Historical payload 5 / 2025-10-17 stays labeled historical and never becomes the live template.',
      'Cadence signature is a stylometric credential. Cryptographic signature is a detached seal over canonical JSON.',
      'Safe Harbor packetization happens before signature attachment, and live sig attachment never mutates the packet body.'
    ],
    repoLayout: [
      'index.html - primary Safe Harbor chamber',
      '11_TD613_PUA_Badge_Provenance_Attestation_Lab.html - legacy bridge into the Safe Harbor lab',
      'app/ - ingress runtime, public/operator surfaces, packet preview logic',
      'safe_harbor/ - canonicalizer, hash, signature, lifecycle, and packet schema runtime',
      'probes/ - public sendable artifacts and command references',
      'corpus/ - binding corpus and signed bundle references',
      'reference/ - trust profile, manifest, verify, capsule, and registry surfaces',
      'renderers/ - badge renderer contract'
    ],
    referenceLanes: [
      'EO-RFD supplies route conscience, rupture detection, and export ethics.',
      'TCP supplies cadence credentials, route and harbor pressure, and intake shaping.',
      'TD613 owns the badge, provenance, custody, public footer, and verifier surface.',
      'Signature lanes attach after Safe Harbor canonicalization as detached wrappers.'
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
      'handoff-ready': 'The triad is complete. A staged packet is present, but Covenant Export is still required.',
      'harbor-eligible': 'Covenant has been invoked. The staged packet is now harbor-eligible.',
      'packet-exported': 'A detached signature wrapper has sealed the packet for export.',
      verified: 'The detached signature wrapper has been verified against the packet hash.'
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
          status: 'verified',
          source: 'demo-signature',
          sig_type: 'JWS-detached',
          lane: 'JWS-detached',
          kid: 'tauric.diana.613',
          sig: 'eyJhbGciOiJIUzI1NiIsImtpZCI6InRhdXJpYy5kaWFuYS42MTMiLCJ0eXAiOiJKT1NFIn0..demo_safe_harbor_sig',
          detached_ref: 'demo://safe-harbor/signature-lane',
          attached_at: '2026-04-03T00:00:00Z'
        }
      }
    }
  };
})();
