function applyMatchLanguage(root = document) {
  for (const button of root.querySelectorAll?.('[data-decision="CANDIDATE"]') || []) button.textContent = 'Match';
  for (const state of root.querySelectorAll?.('.identity-state[data-state="CANDIDATE"]') || []) state.textContent = 'Match';
  const cluster = document.getElementById('clusterNotice');
  if (cluster && /candidate cluster/i.test(cluster.textContent)) {
    cluster.textContent = cluster.textContent.replace(/candidate cluster/ig, 'match cluster');
  }
}

const list = document.getElementById('recordList');
if (list) new MutationObserver(() => applyMatchLanguage(list)).observe(list, { childList: true, subtree: true });
const cluster = document.getElementById('clusterNotice');
if (cluster) new MutationObserver(() => applyMatchLanguage()).observe(cluster, { childList: true, subtree: true, characterData: true });
applyMatchLanguage();
