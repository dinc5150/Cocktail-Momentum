// Shapes returned by the API — see docs/IMPLEMENTATION_PLAN.md §4.

export interface QuotaStatus {
  used: number;
  limit: number | null;
  unlimited: boolean;
  resetsUtc: string | null;
}

export interface Me {
  userId: string;
  email: string | null;
  onboarded: boolean;
  isGuest: boolean;
  ownerLabel: string | null;
  quota: QuotaStatus; // always populated as of Phase 12 — see MeFunctions.cs
}

export interface PantryItem {
  id: string;
  name: string;
  category: string;
  inStock: boolean;
  toOrder: boolean;
  createdUtc: string;
  updatedUtc: string;
}

export interface ApiErrorBody {
  error: { code: string; message: string };
}

export type Strictness = 'strict' | 'nearly' | 'any';

export interface CocktailIngredient {
  name: string;
  measure: string;
  inPantry: boolean;
  inStock: boolean;
}

export interface Cocktail {
  name: string;
  description: string;
  ingredients: CocktailIngredient[];
  steps: string[];
  missingCount: number;
}

export interface GenerateResponse {
  cocktails: Cocktail[];
  notice: string | null;
  quota: QuotaStatus;
}

export interface Favourite {
  id: string;
  name: string;
  description: string;
  ingredients: CocktailIngredient[];
  steps: string[];
  sourcePrompt: string | null;
  savedUtc: string;
}

export interface ShareLink {
  id: string;
  label: string | null;
  createdUtc: string;
  expiresUtc: string;
}

export interface CreatedShareLink {
  url: string;
  expiresUtc: string;
}
