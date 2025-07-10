import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { ChromePickerComponent, ColorPickerControl } from '@iplab/ngx-color-picker';

@Component({
  selector: 'app-color-picker',
  templateUrl: './color-picker.component.html',
  styleUrl: './color-picker.component.scss',
  imports: [CommonModule, MatButtonModule, ChromePickerComponent, MatDividerModule],
})
export class ColorPickerComponent {
  @Input() control: ColorPickerControl = new ColorPickerControl().hidePresets();
  @Input() isVisible: boolean = false;
  @Output() apply = new EventEmitter<string>();
  @Output() discard = new EventEmitter<void>();

  applyColor(event: MouseEvent) {
    event.stopPropagation();
    this.apply.emit(this.control.value.toHexString());
    this.isVisible = false;
  }

  discardColor(event: MouseEvent) {
    event.stopPropagation();
    this.discard.emit();
    this.isVisible = false;
  }
}
