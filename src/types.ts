export interface Ingredient {
  id: string;
  name: string;
  addedAt: number;
  inStock: boolean;
}

export type SortMode = 'alpha-asc' | 'alpha-desc' | 'newest' | 'oldest';
export type StockFilter = 'all' | 'in-stock' | 'out-of-stock';
