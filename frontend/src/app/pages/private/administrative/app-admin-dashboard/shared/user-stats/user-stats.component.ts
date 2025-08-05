import { Component, EventEmitter, input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';

import { ColumnComponent } from 'app/components/column/column.component';

import { PercentageMessageComponent } from '../percentage-message/percentage-message.component';
import { DashboardStats } from '../types';

@Component({
  selector: 'app-user-stats',
  templateUrl: './user-stats.component.html',
  styleUrl: './user-stats.component.scss',
  imports: [
    MatCardModule,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    PercentageMessageComponent,
    ColumnComponent,
  ],
})
export class UserStatsComponent {
  stats = input.required<DashboardStats>();
  @Output() accessRoute = new EventEmitter<void>();
}
