import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { ChurchsComponent } from './churchs/churchs.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { EventTypesComponent } from './event-types/event-types.component';
import { MemberOriginComponent } from './member-origin/member-origin.component';
import { OccupationsComponent } from './occupations/occupations.component';
import { PersonsComponent } from './persons/persons.component';
import { ProfilesComponent } from './profiles/profiles.component';
import { UsersComponent } from './users/users.component';

@Component({
  selector: 'app-administrative',
  templateUrl: './administrative.component.html',
  styleUrls: ['./administrative.component.scss'],
  imports: [
    MatTabsModule,
    MatCardModule,
    PersonsComponent,
    UsersComponent,
    ChurchsComponent,
    EventTypesComponent,
    OccupationsComponent,
    ProfilesComponent,
    MemberOriginComponent,
    DashboardComponent,
  ],
})
export class AdministrativeComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}
