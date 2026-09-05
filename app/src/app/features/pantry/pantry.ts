import { Component, OnInit, computed, signal } from '@angular/core';
import { Card } from '../../shared/ui/card/card';
import { Input } from '../../shared/ui/input/input';
import { Button } from '../../shared/ui/button/button';
import { Pill } from '../../shared/ui/pill/pill';
import { EmptyState } from '../../shared/ui/empty-state/empty-state';
import { Spinner } from '../../shared/ui/spinner/spinner';
import { PantryRow } from './pantry-row/pantry-row';
import { PantryStore } from '../../core/pantry.store';
import { PantryItem } from '../../core/models';
import { compareCategoryOrder } from '../../core/pantry-categories';

type Filter = 'all' | 'inStock' | 'outOfStock' | 'toOrder';

@Component({
  selector: 'app-pantry',
  standalone: true,
  imports: [Card, Input, Button, Pill, EmptyState, Spinner, PantryRow],
  templateUrl: './pantry.html',
  styleUrl: './pantry.scss',
})
export class Pantry implements OnInit {
  readonly loading = signal(true);
  readonly search = signal('');
  readonly filter = signal<Filter>('all');
  readonly newName = signal('');
  readonly adding = signal(false);
  readonly seeding = signal(false);
  readonly seedMessage = signal<string | null>(null);

  readonly filtered = computed<PantryItem[]>(() => {
    const query = this.search().trim().toLowerCase();
    const f = this.filter();
    return this.pantry
      .items()
      .filter((i) => {
        if (query && !i.name.toLowerCase().includes(query)) return false;
        if (f === 'inStock') return i.inStock;
        if (f === 'outOfStock') return !i.inStock;
        if (f === 'toOrder') return i.toOrder;
        return true;
      })
      .sort((a, b) => compareCategoryOrder(a.category, b.category) || a.name.localeCompare(b.name));
  });

  readonly emptyMessage = computed(() => {
    if (this.pantry.items().length === 0) {
      return 'Your pantry is empty. Add an ingredient above.';
    }
    if (this.search().trim()) {
      return `No ingredients match "${this.search().trim()}".`;
    }
    return 'Nothing matches this filter.';
  });

  constructor(protected readonly pantry: PantryStore) {}

  async ngOnInit(): Promise<void> {
    await this.pantry.load();
    this.loading.set(false);
  }

  async addItem(): Promise<void> {
    const name = this.newName().trim();
    if (!name || this.adding()) return;

    this.adding.set(true);
    try {
      await this.pantry.create(name);
      this.newName.set('');
    } catch {
      // A 409 (duplicate) is the most likely failure here — pantry.create() doesn't
      // return the existing item on conflict (unlike the API), so there's nothing more
      // specific to say yet. Revisit if this proves confusing in practice.
    } finally {
      this.adding.set(false);
    }
  }

  async addExamples(): Promise<void> {
    this.seeding.set(true);
    try {
      const added = await this.pantry.seed('examples');
      this.seedMessage.set(
        added > 0
          ? `Added ${added} item${added === 1 ? '' : 's'}.`
          : "Everything from the example list is already in your pantry.",
      );
    } finally {
      this.seeding.set(false);
    }
  }

  toggleStock(item: PantryItem): void {
    void this.pantry.update(item.id, { inStock: !item.inStock });
  }

  toggleOrder(item: PantryItem): void {
    void this.pantry.update(item.id, { toOrder: !item.toOrder });
  }

  rename(item: PantryItem, name: string): void {
    void this.pantry.update(item.id, { name });
  }

  remove(item: PantryItem): void {
    void this.pantry.remove(item.id);
  }
}
