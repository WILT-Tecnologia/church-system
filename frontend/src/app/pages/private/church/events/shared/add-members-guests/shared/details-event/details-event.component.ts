import { DatePipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

import { ColumnComponent } from 'app/components/column/column.component';
import { EventData } from 'app/model/Events';

@Component({
  selector: 'app-details-event',
  templateUrl: './details-event.component.html',
  styleUrl: './details-event.component.scss',
  imports: [MatCardModule, ColumnComponent, DatePipe],
})
export class DetailsEventComponent {
  @Input() event: EventData | null = null;
}
