import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-column',
  standalone: true,
  templateUrl: './column.component.html',
  styleUrl: './column.component.scss',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColumnComponent {
  columns = input(1, {
    transform: (value: number | string) => {
      const parsed = typeof value === 'string' ? parseInt(value, 10) : value;
      return isNaN(parsed) ? 1 : Math.max(1, Math.min(parsed, 12));
    },
  });

  columnWidths = input<number[] | string>();

  gridClass = computed(() => ({
    grid: true,
    [`grid-cols-${this.columns()}`]: true,
  }));

  gridTemplateColumns = computed(() => {
    const rawWidths = this.columnWidths();
    let widths: number[] = [];

    if (typeof rawWidths === 'string') {
      widths = rawWidths
        .split(/[\s,]+/)
        .map((w) => parseInt(w.trim(), 10))
        .filter((w) => !isNaN(w));
    } else if (Array.isArray(rawWidths)) {
      widths = rawWidths;
    }

    if (widths.length > 0) {
      return widths.map((w) => `minmax(0, ${w}fr)`).join(' ');
    }

    return null;
  });
}
