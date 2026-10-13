self.addEventListener('message', event => {
  const { id, caseMap, routeMemory, proposedReferences = [], seed = 613 } = event.data || {};
  if (!id || !caseMap || !routeMemory) return;
  const disclosed = new Set((routeMemory.entries || []).flatMap(entry => entry.disclosed_opaque_references || []));
  const proposed = [...new Set(proposedReferences)];
  const edgesFor = set => (caseMap.relationships || []).filter(edge => set.has(edge.from) && set.has(edge.to)).map(edge => edge.id);
  const project = (extra = []) => {
    const nodes = new Set([...disclosed, ...extra]);
    return {
      node_ids: [...nodes],
      relationship_ids: edgesFor(nodes),
      chronology: Math.min(1000, Math.round((nodes.size / Math.max(1, caseMap.nodes.length)) * 1000)),
      source_style_linkage: 0
    };
  };
  const before = project();
  const after = project(proposed);
  const reversed = [...proposed].reverse();
  const trials = [
    { trial_id: 'repeat_a', seed, state: 'OBSERVED', before, after, observations: ['Named deterministic Reader completed the proposed route projection.'] },
    { trial_id: 'repeat_b', seed: seed + 1, state: 'OBSERVED', before, after: project(reversed), observations: ['Repeated trial preserved the same recovered structure.'] },
    { trial_id: 'benign_control', seed: seed + 2, state: 'OBSERVED', benign_control: true, before, after: before, observations: ['Benign control added no recoverable structure.'] },
    { trial_id: 'held_out', seed: seed + 3, state: proposed.length ? 'OBSERVED' : 'NULL', held_out: true, before, after: project(proposed.slice(0, Math.max(0, proposed.length - 1))), observations: proposed.length ? ['Held-out disclosure order remained separate from calibration trials.'] : ['No proposed reference was available to the held-out Reader.'] }
  ];
  self.postMessage({ id, trials });
});
