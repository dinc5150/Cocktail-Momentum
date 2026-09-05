import { Component, OnInit, inject, signal } from '@angular/core';
import { Card } from '../../shared/ui/card/card';
import { Button } from '../../shared/ui/button/button';
import { EmptyState } from '../../shared/ui/empty-state/empty-state';
import { Spinner } from '../../shared/ui/spinner/spinner';
import { FavouriteStore } from '../../core/favourites.store';

@Component({
  selector: 'app-favourites',
  standalone: true,
  imports: [Card, Button, EmptyState, Spinner],
  templateUrl: './favourites.html',
  styleUrl: './favourites.scss',
})
export class Favourites implements OnInit {
  readonly loading = signal(true);
  readonly expandedId = signal<string | null>(null);

  protected readonly favourites = inject(FavouriteStore);

  async ngOnInit(): Promise<void> {
    await this.favourites.load();
    this.loading.set(false);
  }

  toggleExpand(id: string): void {
    this.expandedId.update((current) => (current === id ? null : id));
  }

  async remove(id: string): Promise<void> {
    await this.favourites.remove(id);
    if (this.expandedId() === id) {
      this.expandedId.set(null);
    }
  }
}
