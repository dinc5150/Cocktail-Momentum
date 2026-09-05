import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Cocktail, Favourite } from './models';

/**
 * save() was built in Phase 12 for the Generate page's ♡ action; list()/remove() are
 * added here in Phase 13 for the actual Favourites page. See
 * docs/IMPLEMENTATION_PLAN.md Phase 13.
 */
@Injectable({ providedIn: 'root' })
export class FavouriteStore {
  private readonly itemsSignal = signal<Favourite[]>([]);
  private readonly loadedSignal = signal(false);

  readonly items = this.itemsSignal.asReadonly();
  readonly loaded = this.loadedSignal.asReadonly();

  constructor(private readonly http: HttpClient) {}

  async load(): Promise<void> {
    const items = await firstValueFrom(this.http.get<Favourite[]>('/api/favourites'));
    this.itemsSignal.set(items);
    this.loadedSignal.set(true);
  }

  async save(cocktail: Cocktail, sourcePrompt?: string): Promise<void> {
    await firstValueFrom(
      this.http.post('/api/favourites', {
        name: cocktail.name,
        description: cocktail.description,
        ingredients: cocktail.ingredients,
        steps: cocktail.steps,
        sourcePrompt,
      }),
    );
  }

  /** Optimistic — rolls back on failure. See CLAUDE.md "Front end (Angular)". */
  async remove(id: string): Promise<void> {
    const previous = this.itemsSignal();
    this.itemsSignal.update((items) => items.filter((i) => i.id !== id));
    try {
      await firstValueFrom(this.http.delete(`/api/favourites/${id}`));
    } catch (err) {
      this.itemsSignal.set(previous);
      throw err;
    }
  }
}
