import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';
import { DashboardComponent } from './dashboard/dashboard.component';
import { EventsComponent } from './events/events.component';
import { MembersComponent } from './members/members.component';
import { OrdinationsComponent } from './ordinations/ordinations.component';

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
    OrdinationsComponent,
  ],
})
export class ChurchComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}
