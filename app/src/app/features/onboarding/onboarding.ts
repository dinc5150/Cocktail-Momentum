import { Component, OnInit, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Card } from '../../shared/ui/card/card';
import { Button } from '../../shared/ui/button/button';
import { Pill } from '../../shared/ui/pill/pill';
import { Spinner } from '../../shared/ui/spinner/spinner';
import { PantryStore } from '../../core/pantry.store';
import { AuthStore } from '../../core/auth.store';
import { PantryItem } from '../../core/models';
import { compareCategoryOrder } from '../../core/pantry-categories';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [Card, Button, Pill, Spinner],
  templateUrl: './onboarding.html',
  styleUrl: './onboarding.scss',
})
export class Onboarding implements OnInit {
  readonly loading = signal(true);
  readonly saving = signal(false);

  readonly grouped = computed<[string, PantryItem[]][]>(() => {
    const byCategory = new Map<string, PantryItem[]>();
    for (const item of this.pantry.items()) {
      const list = byCategory.get(item.category) ?? [];
      list.push(item);
      byCategory.set(item.category, list);
    }
    return [...byCategory.entries()].sort(([a], [b]) => compareCategoryOrder(a, b));
  });

  constructor(
    protected readonly pantry: PantryStore,
    private readonly auth: AuthStore,
    private readonly router: Router,
  ) {}

  async ngOnInit(): Promise<void> {
    // Idempotent — never overwrites an existing row or its flags, so this is safe to call
    // every time this page loads, not just the first time. See PantryService.SeedAsync.
    await this.pantry.seed('onboarding');
    this.loading.set(false);
  }

  toggle(item: PantryItem): void {
    void this.pantry.update(item.id, { inStock: !item.inStock });
  }

  async finish(): Promise<void> {
    this.saving.set(true);
    try {
      await this.auth.markOnboarded();
      await this.router.navigate(['/generate']);
    } finally {
      this.saving.set(false);
    }
  }
}
