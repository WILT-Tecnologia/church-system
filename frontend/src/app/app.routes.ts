import { Routes } from '@angular/router';
import { AdministrativeComponent } from './pages/private/administrative/administrative.component';
import { ChurchComponent } from './pages/private/church/church.component';
import { LoginComponent } from './pages/public/login/login.component';
import { SelectChurchComponent } from './pages/public/login/shared/select-church/select-church.component';
import { PageNotFoundComponent } from './pages/public/page-not-found/page-not-found.component';
import { AuthGuard } from './services/auth/auth.guard';
import { selectChurchGuard } from './services/guards/select-church.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/church', pathMatch: 'full' },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'select-church',
    component: SelectChurchComponent,
    canActivate: [selectChurchGuard],
  },
  {
    path: 'church',
    component: ChurchComponent,
    pathMatch: 'full',
    canActivate: [AuthGuard],
  },
  {
    path: 'administrative',
    component: AdministrativeComponent,
    pathMatch: 'full',
    canActivate: [AuthGuard],
  },
  { path: '**', component: PageNotFoundComponent },
];
