import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { NavbarComponent } from '../../../components/navbar/navbar.component';
import { PersonsComponent } from './persons/persons.component';

@Component({
  selector: 'app-administrative',
  standalone: true,
  templateUrl: './administrative.component.html',
  styleUrls: ['./administrative.component.scss'],
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    NavbarComponent,
    MatTabsModule,
    MatCardModule,
    PersonsComponent,
  ],
})
export class AdministrativeComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}
