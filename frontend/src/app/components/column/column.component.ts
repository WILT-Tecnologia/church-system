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
    if (value < 1) {
      this._columns = 1;
    } else if (value > 4) {
      this._columns = 4;
    } else {
      this._columns = value;
    }
  }

  get columns(): number {
    return this._columns;
  }
}
