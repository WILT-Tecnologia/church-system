import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-column',
  templateUrl: './column.component.html',
  styleUrls: ['./column.component.scss'],
  imports: [CommonModule],
})
export class ColumnComponent {
  private _columns = 1;

  @Input()
  set columns(value: number) {
    this._columns = Math.max(1, Math.min(12, Math.floor(value)));
  }

  get columns(): number {
    return this._columns;
  }
}
