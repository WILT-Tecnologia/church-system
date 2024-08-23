import { Routes } from '@angular/router';
import { AdministrativeComponent } from './pages/admin/administrative/administrative.component';
import { PersonComponent } from './pages/admin/administrative/persons/person/person.component';
import { ChurchComponent } from './pages/admin/church/church.component';
import { LoginComponent } from './pages/login/login.component';
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component';

export const routes: Routes = [
  { path: '', redirectTo: '/administrative', pathMatch: 'full' },
  { path: 'login', component: LoginComponent /*canActivate: [AuthGuard]*/ },
  {
    path: 'administrative',
    component: AdministrativeComponent /*canActivate: [AuthGuard]*/,
  },
  {
    path: 'church',
    component: ChurchComponent /*canActivate: [AuthGuard]*/,
  },
  {
    path: 'administrative/persons/person',
    component: PersonComponent /*canActivate: [AuthGuard]*/,
  },
  { path: '**', component: PageNotFoundComponent },
];
