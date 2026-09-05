import { Component } from '@angular/core';
import { Card } from '../../shared/ui/card/card';
import { EmptyState } from '../../shared/ui/empty-state/empty-state';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [Card, EmptyState],
  template: `
    <cm-card>
      <cm-empty-state message="There's nothing here. Use the navigation below to find your way back." />
    </cm-card>
  `,
})
export class NotFound {}
