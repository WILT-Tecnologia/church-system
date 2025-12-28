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
import { permissionGuard } from './services/guards/permission.guard';
import { selectChurchGuard } from './services/guards/select-church.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/church/dashboard-church', pathMatch: 'full' },
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
        path: 'dashboard-administrativo',
        component: AdminDashboardComponent,
        title: 'Dashboard',
        pathMatch: 'full',
        canActivate: [permissionGuard],
        data: { permissions: ['read_administrative_dashboard_administrativo'] },
      },
      {
        path: 'persons',
        component: PersonsComponent,
        title: 'Pessoas',
        canActivate: [permissionGuard],
        pathMatch: 'full',
        data: { permissions: ['read_administrative_pessoas'] },
      },
      {
        path: 'churches',
        component: ChurchesComponent,
        title: 'Igrejas',
        canActivate: [permissionGuard],
        pathMatch: 'full',
        data: { permissions: ['read_administrative_igrejas'] },
      },
      {
        path: 'event-types',
        component: EventTypesComponent,
        title: 'Tipos de eventos',
        canActivate: [permissionGuard],
        pathMatch: 'full',
        data: { permissions: ['read_administrative_tipos_de_eventos'] },
      },
      {
        path: 'occupations',
        component: OccupationsComponent,
        title: 'Cargos ministeriais',
        canActivate: [permissionGuard],
        pathMatch: 'full',
        data: { permissions: ['read_administrative_cargos_ministeriais'] },
      },
      {
        path: 'member-origins',
        component: MemberOriginComponent,
        title: 'Origem do membro',
        canActivate: [permissionGuard],
        pathMatch: 'full',
        data: { permissions: ['read_administrative_origem_do_membro'] },
      },
      {
        path: 'users',
        component: UsersComponent,
        title: 'Usuários',
        canActivate: [permissionGuard],
        pathMatch: 'full',
        data: { permissions: ['read_administrative_usuarios'] },
      },
      {
        path: 'profiles',
        component: ProfilesComponent,
        title: 'Perfis',
        canActivate: [permissionGuard],
        pathMatch: 'full',
        data: { permissions: ['read_administrative_perfis'] },
      },
      {
        path: 'modules',
        component: ModulesComponent,
        title: 'Módulos',
        canActivate: [permissionGuard],
        pathMatch: 'full',
        data: { permissions: ['read_administrative_modulos'] },
      },
      {
        path: 'settings-administrative',
        component: AdminSettingsComponent,
        title: 'Configurações',
        canActivate: [permissionGuard],
        data: { permissions: ['read_administrative_configuracoes_administrativas'] },
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
        path: 'dashboard-church',
        component: DashboardComponent,
        title: 'Dashboard',
        pathMatch: 'full',
        canActivate: [permissionGuard],
        data: { permissions: ['read_church_dashboard_igreja'] },
      },
      {
        path: 'members',
        component: MembersComponent,
        title: 'Membros',
        pathMatch: 'full',
        canActivate: [permissionGuard],
        data: { permissions: ['read_church_membros'] },
      },
      {
        path: 'guests',
        component: GuestsComponent,
        title: 'Convidados / Visitantes',
        pathMatch: 'full',
        canActivate: [permissionGuard],
        data: { permissions: ['read_church_convidados_e_visitantes'] },
      },
      {
        path: 'events',
        component: EventsComponent,
        title: 'Eventos',
        pathMatch: 'full',
        canActivate: [permissionGuard],
        data: { permissions: ['read_church_eventos'] },
      },
      {
        path: 'tasks',
        component: TasksComponent,
        title: 'Tasks',
        pathMatch: 'full',
        canActivate: [permissionGuard],
        data: { permissions: ['read_church_tasks'] },
      },
      {
        path: 'financial',
        component: FinancialComponent,
        title: 'Financeiro',
        pathMatch: 'full',
        canActivate: [permissionGuard],
        data: { permissions: ['read_church_financeiro'] },
      },
      {
        path: 'settings-church',
        component: SettingsComponent,
        title: 'Configurações',
        pathMatch: 'full',
        canActivate: [permissionGuard],
        data: { permissions: ['read_church_configuracoes_igreja'] },
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
