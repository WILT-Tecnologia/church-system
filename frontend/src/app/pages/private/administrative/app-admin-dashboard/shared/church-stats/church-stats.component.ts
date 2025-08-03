import { Component, EventEmitter, input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';

import { ColumnComponent } from 'app/components/column/column.component';

import { PercentageMessageComponent } from '../percentage-message/percentage-message.component';
import { ChurchStats } from '../types';

@Component({
  selector: 'app-church-stats',
  templateUrl: './church-stats.component.html',
  styleUrl: './church-stats.component.scss',
  imports: [
    MatCardModule,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    ColumnComponent,
    PercentageMessageComponent,
  ],
})
export class ChurchStatsComponent {
  stats = input.required<ChurchStats>();
  @Output() accessRoute = new EventEmitter<void>();
}
