/**
 * Canonical display order — matches data/pantry-seed.json exactly. GET /api/pantry has no
 * defined ordering (Table Storage returns rows by RowKey, a random GUID per item), so
 * without this, categories render in an arbitrary order that changes from one page load
 * to the next. Caught by actually looking at a rendered onboarding screen, not by reading
 * the code. Any category not in this list sorts after all of these, alphabetically.
 */
export const PANTRY_CATEGORY_ORDER = [
  'Spirits',
  'Liqueurs',
  'Fortified & Bitters',
  'Mixers',
  'Juices & Citrus',
  'Syrups & Sweeteners',
  'Garnishes',
  'Fresh & Dairy',
] as const;

export function compareCategoryOrder(a: string, b: string): number {
  const indexA = PANTRY_CATEGORY_ORDER.indexOf(a as (typeof PANTRY_CATEGORY_ORDER)[number]);
  const indexB = PANTRY_CATEGORY_ORDER.indexOf(b as (typeof PANTRY_CATEGORY_ORDER)[number]);
  if (indexA === -1 && indexB === -1) return a.localeCompare(b);
  if (indexA === -1) return 1;
  if (indexB === -1) return -1;
  return indexA - indexB;
}
