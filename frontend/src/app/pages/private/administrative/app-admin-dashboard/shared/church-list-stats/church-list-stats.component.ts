import { Component, EventEmitter, inject, OnInit, Output, signal } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';

import { ColumnComponent } from 'app/components/column/column.component';
import { Church } from 'app/model/Church';

import { ChurchsService } from '../../../churches/churches.service';

@Component({
  selector: 'app-church-list-stats',
  templateUrl: './church-list-stats.component.html',
  styleUrl: './church-list-stats.component.scss',
  imports: [MatCardModule, MatButton, MatDividerModule, MatIconModule, ColumnComponent],
})
export class ChurchListStatsComponent implements OnInit {
  @Output() accessRoute = new EventEmitter<void>();
  churchService = inject(ChurchsService).getChurch();

  churchs = signal<Church[]>([]);

  ngOnInit() {
    this.loadData();
  }

  private loadData() {
    this.churchService.subscribe({
      next: (churches) => {
        this.churchs.set(churches);
      },
      error: () => this.churchs.set([]),
    });
  }
}
