import { Routes } from '@angular/router';
import { AdministrativeComponent } from './pages/admin/administrative/administrative.component';
import { ChurchComponent } from './pages/admin/church/church.component';
import { SelectChurchComponent } from './pages/admin/shared/select-church/select-church.component';
import { LoginComponent } from './pages/login/login.component';
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component';
import { AuthGuard } from './services/auth/auth.guard';
import { selectChurchGuard } from './services/guards/select-church.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/church', pathMatch: 'full' },
  {
    path: 'select-church',
    component: SelectChurchComponent,
    pathMatch: 'full',
    canActivate: [selectChurchGuard],
  },
  {
    path: 'administrative',
    component: AdministrativeComponent,
    pathMatch: 'full',
    canActivate: [AuthGuard],
  },
  {
    path: 'church',
    component: ChurchComponent,
    pathMatch: 'full',
    canActivate: [AuthGuard],
  },
  {
    path: 'login',
    component: LoginComponent,
    pathMatch: 'full',
  },
  { path: '**', component: PageNotFoundComponent },
];
