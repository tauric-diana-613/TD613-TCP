(function () {
  'use strict';
  const VERSION = 'safe-harbor-forensic-authorship/v1';
  const SCHEMA = 'td613.safe-harbor.forensic-authorship/v1';
  const $ = (id) => document.getElementById(id);
  let busy = false;

  function clone(v) { return v == null ? v : JSON.parse(JSON.stringify(v)); }
  function round(v, d = 4) { const n = Number(v); if (!Number.isFinite(n)) return null; const s = Math.pow(10, d); return Math.round(n * s) / s; }
  function pairBounds(items) {
    const arr = Array.isArray(items) ? items.map((x) => ({ pair: x.pair || null, similarity: Number(x.similarity) })).filter((x) => Number.isFinite(x.similarity)) : [];
    if (!arr.length) return { strongest: null, widest: null };
    return {
      strongest: arr.reduce((a, b) => a.similarity >= b.similarity ? a : b),
      widest: arr.reduce((a, b) => a.similarity <= b.similarity ? a : b)
    };
  }

  function laneSummary(packet) {
    const signatures = packet?.issuance?.stylometric_provenance?.per_lane_signatures || packet?.analysis?.segment_cadence_signatures || {};
    const out = {};
    ['future_self', 'past_self', 'higher_self'].forEach((lane) => {
      const s = signatures[lane];
      if (!s) return;
      out[lane] = {
        word_count: Number(s.word_count || 0),
        avg_sentence_length: round(s.avg_sentence_length, 3),
        punctuation_density: round(s.punctuation_density, 4),
        unique_ratio: round(s.unique_ratio, 4),
        temporal_posture: s.temporal_posture || null,
        dominant_operator: s.dominant_operator || null,
        closure_class: s.closure_class || null,
        frame_alignment: s.frame_alignment || null
      };
    });
    return out;
  }

  function build(packet) {
    const prov = packet?.issuance?.stylometric_provenance || {};
    const analysis = packet?.analysis || {};
    const fs = packet?.forensic_schema || {};
    const bounds = pairBounds(prov.pairwise_similarity);
    const metrics = {
      triad_resonance: round(prov.triad_resonance ?? analysis.triad_resonance, 4),
      cross_lane_stability: round(prov.cross_lane_stability ?? analysis.cross_lane_stability, 4),
      cross_lane_spread: round(prov.cross_lane_spread ?? analysis.cross_lane_spread, 4),
      strongest_pair: bounds.strongest ? { pair: bounds.strongest.pair, similarity: round(bounds.strongest.similarity, 4) } : null,
      widest_pair: bounds.widest ? { pair: bounds.widest.pair, similarity: round(bounds.widest.similarity, 4) } : null,
      provenance_integrity: round(fs.provenanceIntegrity ?? analysis.route?.provenance?.integrity, 4),
      governed_exposure_gap: round(fs.Gap, 4),
      observability_deficit: round(fs.delta_obs, 4),
      route_state: { analysis: analysis.route?.state || null, forensic: fs.routeState || null, recommended_harbor: analysis.route?.recommended_harbor || null },
      triad_word_counts: clone(prov.triad_word_counts || packet?.issuance?.triad_word_counts || null),
      triad_shortfalls: clone(prov.triad_shortfalls || packet?.issuance?.triad_shortfalls || null),
      lane_summary: laneSummary(packet),
      divergence_signature: clone(prov.divergence_signature || null),
      frame_alignment_flags: clone(prov.frame_alignment_flags || packet?.issuance?.frame_alignment_flags || [])
    };
    const principal = packet?.canon?.principal || null;
    const shi = packet?.issuance?.badge_number || null;
    const receiptSummary = [principal || 'principal', shi || 'SHI pending', 'triad stylometric witness', metrics.triad_resonance != null ? 'TR=' + metrics.triad_resonance : null, metrics.cross_lane_stability != null ? 'CLS=' + metrics.cross_lane_stability : null, metrics.provenance_integrity != null ? 'PI=' + metrics.provenance_integrity : null].filter(Boolean).join(' · ');
    return {
      schema_version: SCHEMA,
      created_by: VERSION,
      authorship_witness: {
        version: 'v1',
        principal,
        shi,
        binding_fragment: packet?.canon?.binding_fragment || null,
        sac: packet?.canon?.sac || null,
        stylometric_witness_present: Boolean(packet?.issuance?.stylometric_fingerprint || prov.stylometric_fingerprint),
        witness_basis: ['future_self', 'past_self', 'higher_self', 'stylometric_fingerprint', 'semantic_posture_axes', 'triad_metrics', 'divergence_signature', 'SHI_derivation_seed'],
        witness_semantics: 'forensic authorship custody; not identity adjudication',
        forensic_priority: 'high',
        shi_binding_rule: prov.interpretation_note || null
      },
      authorship_metrics: metrics,
      authorship_receipt: { receipt_version: 'v1', principal, shi, binding_fragment: packet?.canon?.binding_fragment || null, stylometric_witness_present: Boolean(packet?.issuance?.stylometric_fingerprint || prov.stylometric_fingerprint), summary: receiptSummary.slice(0, 400), max_characters: 400 },
      notice_requirements: { include_forensic_authorship_summary: true, required_notice_section: 'Forensic Authorship Summary', max_words: 250, style: ['forensic', 'provenance-oriented', 'technically grounded', 'jurisdictionally neutral', 'packet-derived'], directive: 'Feature packet-gleaned stylometric and authorship metrics in the Notice without identity adjudication or biographical inference.' }
    };
  }

  async function augment(packet) {
    if (!packet || packet.schema_version !== 'td613.safe-harbor.packet/v1') return packet;
    const next = clone(packet);
    next.forensic_authorship = build(next);
    next.forensic_authorship.hash_posture = 'supplemental receipt; excluded from the native packet hash';
    return next;
  }

  async function refresh() { return false; }
  function filename(packet) {
    const shi = packet?.issuance?.badge_number ? '-' + packet.issuance.badge_number : '';
    const stage = packet?.bridge?.export_gate?.ready ? 'sealed' : (packet?.issuance?.badge_number ? 'minted' : 'staged');
    const ts = packet?.intake?.helper_filename_safe || new Date().toISOString().replace(/[:.]/g, '-');
    return 'td613-packet-' + stage + shi + '-' + ts + '.json';
  }
  function download(name, text) {
    const blob = new Blob([text], { type: 'application/json;charset=utf-8' });
    const href = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = href; a.download = name; document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(href), 0);
  }
  function boot() {}
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true }); else boot();
  window.TD613_SAFE_HARBOR_FORENSIC_AUTHORSHIP = { version: VERSION, schema: SCHEMA, augmentPacket: augment, buildForensicAuthorship: build, refreshPreview: refresh };
}());
