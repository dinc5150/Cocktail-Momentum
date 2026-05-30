import type { Ingredient } from '../types';

const STORAGE_KEY = 'cocktail-pantry';

export function loadIngredients(): Ingredient[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as Ingredient[];
  } catch {
    return [];
  }
}

export function saveIngredients(ingredients: Ingredient[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ingredients));
}
