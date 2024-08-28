import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';
import { ChurchsComponent } from './churchs/churchs.component';
import { EventTypesComponent } from './eventTypes/eventTypes.component';
import { OccupationsComponent } from './occupations/occupations.component';
import { PersonsComponent } from './persons/persons.component';
import { ProfilesComponent } from './profiles/profiles.component';
import { UsersComponent } from './users/users.component';

@Component({
  selector: 'app-administrative',
  standalone: true,
  templateUrl: './administrative.component.html',
  styleUrls: ['./administrative.component.scss'],
  imports: [
    MatTabsModule,
    MatCardModule,
    MatDividerModule,
    PersonsComponent,
    UsersComponent,
    ChurchsComponent,
    EventTypesComponent,
    OccupationsComponent,
    ProfilesComponent,
  ],
})
export class AdministrativeComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}
