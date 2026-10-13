const BADGES = ['badge.holds', 'badge.branch', 'badge.buffer'];
export function nextBadge(current) {
  const idx = BADGES.indexOf(current);
  return BADGES[(idx + 1) % BADGES.length];
}
export function badgeMeaning(badge) {
  switch (badge) {
    case 'badge.holds': return 'compact custody token active';
    case 'badge.branch': return 'awkward branch preserved';
    case 'badge.buffer': return 'stabilization before interpretation';
    default: return 'unknown badge';
  }
}
