import { Routes } from '@angular/router';
import { AdministrativeComponent } from './pages/private/administrative/administrative.component';
import { ChurchComponent } from './pages/private/church/church.component';
import { ProfileComponent } from './pages/private/profile/profile.component';
import { LoginComponent } from './pages/public/login/login.component';
import { LoginGuard } from './pages/public/login/login.guard';
import { SelectChurchComponent } from './pages/public/login/shared/select-church/select-church.component';
import { PageNotFoundComponent } from './pages/public/page-not-found/page-not-found.component';
import { AuthGuard } from './services/auth/auth.guard';
import { selectChurchGuard } from './services/guards/select-church.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/church', pathMatch: 'full' },
  {
    path: 'login',
    component: LoginComponent,
    pathMatch: 'full',
    title: 'Acesso ao sistema - Wilt Church',
    canActivate: [LoginGuard],
  },
  {
    path: 'select-church',
    component: SelectChurchComponent,
    title: 'Selecione a igreja - Wilt Church',
    canActivate: [selectChurchGuard],
  },
  {
    path: 'church',
    component: ChurchComponent,
    pathMatch: 'full',
    title: 'Igreja - Wilt Church',
    canActivate: [AuthGuard],
  },
  {
    path: 'administrative',
    component: AdministrativeComponent,
    pathMatch: 'full',
    title: 'Administrativo - Wilt Church',
    data: { roles: ['ADMIN', 'CHURCH_ADMIN'] },
    canActivate: [AuthGuard],
  },
  {
    path: 'profile',
    component: ProfileComponent,
    pathMatch: 'full',
    title: 'Meu Perfil - Wilt Church',
    canActivate: [AuthGuard],
  },
  { path: '**', component: PageNotFoundComponent },
];
