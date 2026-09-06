import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Nav } from './shared/ui/nav/nav';
import { Button } from './shared/ui/button/button';
import { Notice } from './shared/ui/notice/notice';
import { InstallPromptStore } from './core/install-prompt.store';
import { OnlineStore } from './core/online.store';
import { AuthStore } from './core/auth.store';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Nav, Button, Notice],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly installPrompt = inject(InstallPromptStore);
  protected readonly onlineStore = inject(OnlineStore);
  protected readonly auth = inject(AuthStore);
  private readonly router = inject(Router);

  protected async logout(): Promise<void> {
    await this.auth.logout();
    await this.router.navigateByUrl('/welcome');
  }
}
