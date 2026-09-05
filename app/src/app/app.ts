import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Nav } from './shared/ui/nav/nav';
import { Button } from './shared/ui/button/button';
import { Notice } from './shared/ui/notice/notice';
import { InstallPromptStore } from './core/install-prompt.store';
import { OnlineStore } from './core/online.store';

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
}
