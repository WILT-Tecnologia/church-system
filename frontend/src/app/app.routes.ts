import { Routes } from '@angular/router';

import { CardComponent } from './components/card/card.component';
import { AdminSettingsComponent } from './pages/private/administrative/admin-settings/admin-settings.component';
import { AdminDashboardComponent } from './pages/private/administrative/app-admin-dashboard/app-admin-dashboard.component';
import { ChurchesComponent } from './pages/private/administrative/churches/churches.component';
import { EventTypesComponent } from './pages/private/administrative/event-types/event-types.component';
import { MemberOriginComponent } from './pages/private/administrative/member-origin/member-origin.component';
import { ModulesComponent } from './pages/private/administrative/modules/modules.component';
import { OccupationsComponent } from './pages/private/administrative/occupations/occupations.component';
import { PersonsComponent } from './pages/private/administrative/persons/persons.component';
import { ProfilesComponent } from './pages/private/administrative/profiles/profiles.component';
import { UsersComponent } from './pages/private/administrative/users/users.component';
import { DashboardComponent } from './pages/private/church/dashboard/dashboard.component';
import { EventsComponent } from './pages/private/church/events/events.component';
import { FinancialComponent } from './pages/private/church/financial/financial.component';
import { GuestsComponent } from './pages/private/church/guests/guests.component';
import { MembersComponent } from './pages/private/church/members/members.component';
import { SettingsComponent } from './pages/private/church/settings/settings.component';
import { TasksComponent } from './pages/private/church/tasks/tasks.component';
import { ProfileComponent } from './pages/private/profile/profile.component';
import { LoginComponent } from './pages/public/login/login.component';
import { LoginGuard } from './pages/public/login/login.guard';
import { SelectChurchComponent } from './pages/public/login/shared/select-church/select-church.component';
import { PageNotFoundComponent } from './pages/public/page-not-found/page-not-found.component';
import { AuthGuard } from './services/auth/auth.guard';
import { PermissionGuard } from './services/guards/permission.guard';
import { selectChurchGuard } from './services/guards/select-church.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/church/dashboard', pathMatch: 'full' },
  {
    path: 'login',
    component: LoginComponent,
    pathMatch: 'full',
    title: 'Acessar o sistema',
    canActivate: [LoginGuard],
  },
  {
    path: 'select-church',
    component: SelectChurchComponent,
    title: 'Selecione a sua igreja',
    canActivate: [selectChurchGuard],
  },
  {
    path: 'administrative',
    title: 'Administrativo',
    component: CardComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        component: AdminDashboardComponent,
        title: 'Dashboard',
        pathMatch: 'full',
        canActivate: [AuthGuard, PermissionGuard],
        data: { permissions: ['read_dashboard'] },
      },
      {
        path: 'persons',
        component: PersonsComponent,
        title: 'Pessoas',
        canActivate: [AuthGuard, PermissionGuard],
        pathMatch: 'full',
        data: { permissions: ['read_pessoas'] },
      },
      {
        path: 'churches',
        component: ChurchesComponent,
        title: 'Igrejas',
        canActivate: [AuthGuard, PermissionGuard],
        pathMatch: 'full',
        data: { permissions: ['read_igrejas'] },
      },
      {
        path: 'event-types',
        component: EventTypesComponent,
        title: 'Tipos de eventos',
        canActivate: [AuthGuard, PermissionGuard],
        pathMatch: 'full',
        data: { permissions: ['read_tipos_de_eventos'] },
      },
      {
        path: 'occupations',
        component: OccupationsComponent,
        title: 'Cargos ministeriais',
        canActivate: [AuthGuard, PermissionGuard],
        pathMatch: 'full',
        data: { permissions: ['read_cargos_ministeriais'] },
      },
      {
        path: 'member-origins',
        component: MemberOriginComponent,
        title: 'Origem do membro',
        canActivate: [AuthGuard, PermissionGuard],
        pathMatch: 'full',
        data: { permissions: ['read_origem_do_membro'] },
      },
      {
        path: 'users',
        component: UsersComponent,
        title: 'Usuários',
        canActivate: [AuthGuard, PermissionGuard],
        pathMatch: 'full',
        data: { permissions: ['read_usuarios'] },
      },
      {
        path: 'profiles',
        component: ProfilesComponent,
        title: 'Perfis',
        canActivate: [AuthGuard, PermissionGuard],
        pathMatch: 'full',
        data: { permissions: ['read_perfis'] },
      },
      {
        path: 'modules',
        component: ModulesComponent,
        title: 'Módulos',
        canActivate: [AuthGuard, PermissionGuard],
        pathMatch: 'full',
        data: { permissions: ['read_permissoes'] },
      },
      {
        path: 'settings',
        component: AdminSettingsComponent,
        title: 'Configurações',
        canActivate: [AuthGuard, PermissionGuard],
        data: { permissions: ['read_configuracoes'] },
      },
    ],
  },
  {
    path: 'church',
    title: 'Igreja',
    component: CardComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent,
        title: 'Dashboard',
        pathMatch: 'full',
        canActivate: [AuthGuard, PermissionGuard],
        data: { permissions: ['read_dashboard'] },
      },
      {
        path: 'members',
        component: MembersComponent,
        title: 'Membros',
        pathMatch: 'full',
        canActivate: [AuthGuard, PermissionGuard],
        data: { permissions: ['read_membros'] },
      },
      {
        path: 'guests',
        component: GuestsComponent,
        title: 'Convidados / Visitantes',
        pathMatch: 'full',
        canActivate: [AuthGuard, PermissionGuard],
        data: { permissions: ['read_convidados_e_visitantes'] },
      },
      {
        path: 'events',
        component: EventsComponent,
        title: 'Eventos',
        pathMatch: 'full',
        canActivate: [AuthGuard, PermissionGuard],
        data: { permissions: ['read_eventos'] },
      },
      {
        path: 'tasks',
        component: TasksComponent,
        title: 'Tasks',
        pathMatch: 'full',
        canActivate: [AuthGuard, PermissionGuard],
        data: { permissions: ['read_tasks'] },
      },
      {
        path: 'financial',
        component: FinancialComponent,
        title: 'Financeiro',
        pathMatch: 'full',
        canActivate: [AuthGuard, PermissionGuard],
        data: { permissions: ['read_financeiro'] },
      },
      {
        path: 'settings',
        component: SettingsComponent,
        title: 'Configurações',
        pathMatch: 'full',
        canActivate: [AuthGuard, PermissionGuard],
        data: { permissions: ['read_configuracoes'] },
      },
    ],
  },
  {
    path: 'profile',
    component: ProfileComponent,
    pathMatch: 'full',
    title: 'Meu Perfil',
    canActivate: [AuthGuard],
  },
  { path: '**', component: PageNotFoundComponent },
];
