import { Component } from '@angular/core';
import { Card } from '../../shared/ui/card/card';

@Component({
  selector: 'app-check-email',
  standalone: true,
  imports: [Card],
  templateUrl: './check-email.html',
  styleUrl: './check-email.scss',
})
export class CheckEmail {}
