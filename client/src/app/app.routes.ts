import { Routes } from '@angular/router';
import { AdministrativeComponent } from './pages/admin/administrative/administrative.component';
import { ChurchComponent as Church } from './pages/admin/administrative/churchs/church/church.component';
import { ChurchsComponent } from './pages/admin/administrative/churchs/churchs.component';
import { EventTypeComponent } from './pages/admin/administrative/eventTypes/eventType/eventType.component';
import { EventTypesComponent } from './pages/admin/administrative/eventTypes/eventTypes.component';
import { MemberOriginFormComponent } from './pages/admin/administrative/member-origin/member-origin-form/member-origin-form.component';
import { MemberOriginComponent } from './pages/admin/administrative/member-origin/member-origin.component';
import { OccupationComponent } from './pages/admin/administrative/occupations/occupation/occupation.component';
import { OccupationsComponent } from './pages/admin/administrative/occupations/occupations.component';
import { PersonComponent } from './pages/admin/administrative/persons/person/person.component';
import { ProfileComponent } from './pages/admin/administrative/profiles/profile/profile.component';
import { ProfilesComponent } from './pages/admin/administrative/profiles/profiles.component';
import { ChurchComponent } from './pages/admin/church/church.component';
import { MemberComponent } from './pages/admin/church/members/member/member.component';
import { MembersComponent } from './pages/admin/church/members/members.component';
import { LoginComponent } from './pages/login/login.component';
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component';

export const routes: Routes = [
  { path: '', redirectTo: '/church', pathMatch: 'full' },
  { path: 'login', component: LoginComponent /*canActivate: [AuthGuard]*/ },
  {
    path: 'administrative',
    component: AdministrativeComponent /*canActivate: [AuthGuard]*/,
  },
  {
    path: 'administrative/persons',
    component: PersonComponent /*canActivate: [AuthGuard]*/,
  },
  {
    path: 'administrative/persons/person/new',
    component: PersonComponent,
  },
  {
    path: 'administrative/persons/person/edit/:id',
    component: PersonComponent,
  },
  {
    path: 'administrative/persons/person/delete/:id',
    component: PersonComponent,
  },
  {
    path: 'administrative/churchs',
    component: ChurchsComponent /*canActivate: [AuthGuard]*/,
  },
  {
    path: 'administrative/churchs/church/new',
    component: Church,
  },
  {
    path: 'administrative/churchs/church/edit/:id',
    component: Church,
  },
  {
    path: 'administrative/churchs/church/delete/:id',
    component: Church,
  },
  { path: 'administrative/eventTypes', component: EventTypesComponent },
  {
    path: 'administrative/eventTypes/eventType/new',
    component: EventTypeComponent,
  },
  {
    path: 'administrative/eventTypes/eventType/edit/:id',
    component: EventTypeComponent,
  },
  {
    path: 'administrative/eventTypes/eventType/delete/:id',
    component: EventTypeComponent,
  },
  {
    path: 'administrative/occupations',
    component: OccupationsComponent,
  },
  {
    path: 'administrative/occupations/occupation/new',
    component: OccupationComponent,
  },
  {
    path: 'administrative/occupations/occupation/edit/:id',
    component: OccupationComponent,
  },
  {
    path: 'administrative/occupations/occupation/delete/:id',
    component: OccupationComponent,
  },
  {
    path: 'administrative/profiles',
    component: ProfilesComponent,
  },
  {
    path: 'administrative/profiles/profile/new',
    component: ProfileComponent,
  },
  {
    path: 'administrative/profiles/profile/edit/:id',
    component: ProfileComponent,
  },
  {
    path: 'administrative/profiles/profile/delete/:id',
    component: ProfileComponent,
  },
  {
    path: 'administrative/member-origin',
    component: MemberOriginComponent,
  },
  {
    path: 'administrative/member-origin/member-origin-form/new',
    component: MemberOriginFormComponent,
  },
  {
    path: 'administrative/member-origin/member-origin-form/edit/:id',
    component: MemberOriginFormComponent,
  },
  {
    path: 'administrative/member-origin/member-origin-form/delete/:id',
    component: MemberOriginFormComponent,
  },
  {
    path: 'church',
    component: ChurchComponent /*canActivate: [AuthGuard]*/,
  },
  { path: 'church/members', component: MembersComponent },
  { path: 'church/members/member/new', component: MemberComponent },
  { path: 'church/members/member/edit/:id', component: MemberComponent },
  { path: 'church/members/member/delete/:id', component: MemberComponent },
  { path: '**', component: PageNotFoundComponent },
];
