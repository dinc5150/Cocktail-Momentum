import { Component, OnInit, inject, signal } from '@angular/core';
import { Card } from '../../shared/ui/card/card';
import { Button } from '../../shared/ui/button/button';
import { EmptyState } from '../../shared/ui/empty-state/empty-state';
import { Spinner } from '../../shared/ui/spinner/spinner';
import { ShareStore } from '../../core/share.store';
import { formatTimeUntil } from '../../core/time-format';

@Component({
  selector: 'app-share',
  standalone: true,
  imports: [Card, Button, EmptyState, Spinner],
  templateUrl: './share.html',
  styleUrl: './share.scss',
})
export class Share implements OnInit {
  readonly loading = signal(true);
  readonly creating = signal(false);
  readonly newUrl = signal<string | null>(null);
  readonly copied = signal(false);

  protected readonly shares = inject(ShareStore);
  protected readonly timeUntil = formatTimeUntil;

  async ngOnInit(): Promise<void> {
    await this.shares.load();
    this.loading.set(false);
  }

  async createLink(): Promise<void> {
    this.creating.set(true);
    this.copied.set(false);
    try {
      const result = await this.shares.create();
      this.newUrl.set(result.url);
    } finally {
      this.creating.set(false);
    }
  }

  async copy(): Promise<void> {
    const url = this.newUrl();
    if (!url) return;

    try {
      await navigator.clipboard.writeText(url);
      this.copied.set(true);
    } catch {
      // Clipboard API unavailable or permission denied — fall back to selecting the text
      // so the user can still copy it manually. See docs/IMPLEMENTATION_PLAN.md Phase 13.
      const el = document.getElementById('share-url-text');
      if (el) {
        const range = document.createRange();
        range.selectNodeContents(el);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    }
  }

  async revoke(id: string): Promise<void> {
    await this.shares.revoke(id);
  }
}
