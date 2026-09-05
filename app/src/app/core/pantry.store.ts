import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { PantryItem } from './models';

/**
 * Built here in Phase 10 rather than Phase 11 as first drafted — onboarding needs
 * seed() + the resulting list just as much as the Pantry page will. Phase 11 adds the UI
 * on top of what's already here rather than rebuilding it. See
 * docs/IMPLEMENTATION_PLAN.md Phase 5 (server contract) and Phase 11.
 */
@Injectable({ providedIn: 'root' })
export class PantryStore {
  private readonly itemsSignal = signal<PantryItem[]>([]);
  private readonly loadedSignal = signal(false);

  readonly items = this.itemsSignal.asReadonly();
  readonly loaded = this.loadedSignal.asReadonly();
  readonly inStockCount = computed(() => this.itemsSignal().filter((i) => i.inStock).length);

  constructor(private readonly http: HttpClient) {}

  async load(): Promise<void> {
    const items = await firstValueFrom(this.http.get<PantryItem[]>('/api/pantry'));
    this.itemsSignal.set(items);
    this.loadedSignal.set(true);
  }

  /** Returns how many new items were actually added — seeding never overwrites an existing row. */
  async seed(mode: 'onboarding' | 'examples'): Promise<number> {
    const result = await firstValueFrom(this.http.post<{ added: number }>('/api/pantry/seed', { mode }));
    await this.load();
    return result.added;
  }

  async create(name: string, category?: string): Promise<PantryItem> {
    const item = await firstValueFrom(this.http.post<PantryItem>('/api/pantry', { name, category }));
    this.itemsSignal.update((items) => [...items, item]);
    return item;
  }

  /** Optimistic — rolls back on failure. See CLAUDE.md "Front end (Angular)". */
  async update(id: string, changes: Partial<Pick<PantryItem, 'name' | 'inStock' | 'toOrder'>>): Promise<void> {
    const previous = this.itemsSignal();
    this.itemsSignal.update((items) => items.map((i) => (i.id === id ? { ...i, ...changes } : i)));
    try {
      const updated = await firstValueFrom(this.http.patch<PantryItem>(`/api/pantry/${id}`, changes));
      this.itemsSignal.update((items) => items.map((i) => (i.id === id ? updated : i)));
    } catch (err) {
      this.itemsSignal.set(previous);
      throw err;
    }
  }

  async remove(id: string): Promise<void> {
    const previous = this.itemsSignal();
    this.itemsSignal.update((items) => items.filter((i) => i.id !== id));
    try {
      await firstValueFrom(this.http.delete(`/api/pantry/${id}`));
    } catch (err) {
      this.itemsSignal.set(previous);
      throw err;
    }
  }
}
