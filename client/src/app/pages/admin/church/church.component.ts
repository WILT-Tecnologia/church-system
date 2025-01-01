import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';
import { EventsComponent } from './events/events.component';

import { DashboardComponent } from './dashboard/dashboard.component';
import { MembersComponent } from './members/members.component';

@Component({
  selector: 'app-church',
  standalone: true,
  templateUrl: './church.component.html',
  styleUrls: ['./church.component.scss'],
  imports: [
    MatTabsModule,
    MatCardModule,
    MatDividerModule,
    MembersComponent,
    DashboardComponent,
    EventsComponent,
  ],
})
export class ChurchComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}
