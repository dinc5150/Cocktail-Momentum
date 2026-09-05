import { Component, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Card } from '../../shared/ui/card/card';
import { Input } from '../../shared/ui/input/input';
import { Button } from '../../shared/ui/button/button';
import { Notice } from '../../shared/ui/notice/notice';
import { AuthStore } from '../../core/auth.store';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [Card, Input, Button, Notice],
  templateUrl: './welcome.html',
  styleUrl: './welcome.scss',
})
export class Welcome {
  readonly email = signal('');
  readonly submitting = signal(false);
  readonly error = signal<string | null>(null);

  constructor(
    private readonly auth: AuthStore,
    private readonly router: Router,
    route: ActivatedRoute,
  ) {
    // AuthCallback redirects here with ?error=link_invalid for an expired, already-used,
    // or unrecognised token — see api/Functions/AuthFunctions.cs.
    if (route.snapshot.queryParamMap.get('error') === 'link_invalid') {
      this.error.set("That link has expired or was already used — request a new one below.");
    }
  }

  async submit(): Promise<void> {
    const value = this.email().trim();
    if (!value) {
      this.error.set('Enter your email address.');
      return;
    }

    this.error.set(null);
    this.submitting.set(true);
    try {
      await this.auth.requestLink(value);
      await this.router.navigate(['/check-email']);
    } catch {
      this.error.set('Something went wrong sending that link — try again in a moment.');
    } finally {
      this.submitting.set(false);
    }
  }
}
