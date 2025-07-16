import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-chip',
  templateUrl: './chip.component.html',
  styleUrl: './chip.component.scss',
  imports: [MatChipsModule, MatIconModule, MatFormFieldModule],
})
export class ChipComponent {
  @Input() chip: { id: string; name: string; selected: boolean } = { id: '', name: '', selected: false };
  @Input() highlighted: boolean = false;
  @Input() disabled: boolean = false;
  @Output() selectionChange = new EventEmitter<{ id: string; name: string; selected: boolean }>();
  @Output() remove = new EventEmitter<string>();

  toggleSelection() {
    if (!this.disabled) {
      this.chip.selected = !this.chip.selected;
      this.selectionChange.emit({ id: this.chip.id, name: this.chip.name, selected: this.chip.selected });
    }
  }

  removeChip() {
    if (!this.disabled) {
      this.remove.emit(this.chip.id);
    }
  }
}
