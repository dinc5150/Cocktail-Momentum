/** A static "expires in Xh Ym" snapshot, not a live-ticking countdown — recomputed on each render/reload, which is precise enough for a share-link list. */
export function formatTimeUntil(isoDate: string): string {
  const diffMs = new Date(isoDate).getTime() - Date.now();
  if (diffMs <= 0) return 'expired';

  const hours = Math.floor(diffMs / 3_600_000);
  const minutes = Math.floor((diffMs % 3_600_000) / 60_000);
  return hours > 0 ? `expires in ${hours}h ${minutes}m` : `expires in ${minutes}m`;
}
