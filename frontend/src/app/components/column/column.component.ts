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
    transform: (value: number) => Math.max(1, Math.min(value, 12)),
  });

  gridClass = computed(() => ({
    grid: true,
    [`grid-cols-${this.columns()}`]: true,
  }));
}
