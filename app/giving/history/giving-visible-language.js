function applyMatchLanguage(root = document) {
  for (const button of root.querySelectorAll?.('[data-decision="CANDIDATE"]') || []) {
    if (button.textContent !== 'Match') button.textContent = 'Match';
  }
  for (const state of root.querySelectorAll?.('.identity-state[data-state="CANDIDATE"]') || []) {
    if (state.textContent !== 'Match') state.textContent = 'Match';
  }
  const cluster = document.getElementById('clusterNotice');
  if (cluster && /candidate cluster/i.test(cluster.textContent)) {
    const next = cluster.textContent.replace(/candidate cluster/ig, 'match cluster');
    if (next !== cluster.textContent) cluster.textContent = next;
  }
}

const list = document.getElementById('recordList');
if (list) new MutationObserver(() => applyMatchLanguage(list)).observe(list, { childList: true, subtree: true });
const cluster = document.getElementById('clusterNotice');
if (cluster) new MutationObserver(() => applyMatchLanguage()).observe(cluster, { childList: true, subtree: true, characterData: true });
applyMatchLanguage();
