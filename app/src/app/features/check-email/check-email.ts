import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Card } from '../../shared/ui/card/card';
import { Input } from '../../shared/ui/input/input';
import { Button } from '../../shared/ui/button/button';
import { Notice } from '../../shared/ui/notice/notice';
import { AuthStore } from '../../core/auth.store';

@Component({
  selector: 'app-check-email',
  standalone: true,
  imports: [Card, Input, Button, Notice],
  templateUrl: './check-email.html',
  styleUrl: './check-email.scss',
})
export class CheckEmail {
  readonly pastedLink = signal('');
  readonly submitting = signal(false);
  readonly error = signal<string | null>(null);

  constructor(
    private readonly auth: AuthStore,
    private readonly router: Router,
  ) {}

  async submit(): Promise<void> {
    const value = this.pastedLink().trim();
    if (!value) {
      this.error.set('Paste the sign-in link from the email.');
      return;
    }

    this.error.set(null);
    this.submitting.set(true);
    try {
      const destination = await this.auth.consumeMagicLink(value);
      await this.router.navigateByUrl(destination);
    } catch {
      this.error.set('That link has expired or was already used — request a new one.');
    } finally {
      this.submitting.set(false);
    }
  }
}
