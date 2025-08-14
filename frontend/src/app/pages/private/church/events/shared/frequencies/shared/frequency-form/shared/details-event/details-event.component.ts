import { CommonModule, DatePipe } from '@angular/common';
import { Component, input, OnInit, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';

import { CallToDay } from 'app/model/Events';

@Component({
  selector: 'app-details-event',
  templateUrl: './details-event.component.html',
  styleUrl: './details-event.component.scss',
  imports: [MatCardModule, MatTableModule, MatSortModule, DatePipe, MatIconModule, MatDividerModule, CommonModule],
})
export class DetailsEventComponent implements OnInit {
  callToDay = input<CallToDay>();
  selectedCallToDay: CallToDay = {} as CallToDay;
  readonly panelOpenState = signal(false);
  displayedColumns: string[] = ['start_datetime', 'end_datetime', 'theme', 'eventTypeName'];

  ngOnInit() {
    if (this.callToDay()) {
      this.selectedCallToDay = this.callToDay() as CallToDay;
    }
  }
}
