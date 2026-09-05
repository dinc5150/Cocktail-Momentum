import { Component, input, output, signal } from '@angular/core';
import { Pill } from '../../../shared/ui/pill/pill';
import { Button } from '../../../shared/ui/button/button';
import { PantryItem } from '../../../core/models';

/** STYLE_GUIDE §6.4 — three zones: status pill (fixed) · name (flex, truncating) · actions (fixed). */
@Component({
  selector: 'app-pantry-row',
  standalone: true,
  imports: [Pill, Button],
  templateUrl: './pantry-row.html',
  styleUrl: './pantry-row.scss',
})
export class PantryRow {
  item = input.required<PantryItem>();

  toggleStock = output<void>();
  toggleOrder = output<void>();
  rename = output<string>();
  remove = output<void>();

  readonly editing = signal(false);
  readonly draftName = signal('');

  startEdit(): void {
    this.draftName.set(this.item().name);
    this.editing.set(true);
  }

  confirmEdit(): void {
    const value = this.draftName().trim();
    if (value && value !== this.item().name) {
      this.rename.emit(value);
    }
    this.editing.set(false);
  }

  cancelEdit(): void {
    this.editing.set(false);
  }
}
