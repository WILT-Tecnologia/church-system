import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import {
  CivilStatus,
  ColorRace,
  Formations,
  Kinships,
} from '../../../../model/Auxiliaries';

import { Church } from '../../../../model/Church';
import { Families } from '../../../../model/Families';
import { MemberOrigin } from '../../../../model/MemberOrigins';
import { Members } from '../../../../model/Members';
import { Ordination } from '../../../../model/Ordination';
import { Person } from '../../../../model/Person';

@Injectable({
  providedIn: 'root',
})
export class MembersService {
  constructor(private http: HttpClient) {}

  private api = `${environment.apiUrl}/church/members`;
  private apiAdmin = `${environment.apiUrl}/admin`;
  private apiAux = `${environment.apiUrl}/aux`;

  getOrdinationByMemberId(memberId: string): Observable<Ordination[]> {
    return this.http
      .get<Members>(`${this.api}/${memberId}`)
      .pipe(map((member) => member.ordination));
  }

  getFamilyOfMemberId(memberId: string): Observable<Families[]> {
    return this.http
      .get<Members>(`${this.api}/${memberId}`)
      .pipe(map((member) => member.families));
  }

  getCivilStatus(): Observable<CivilStatus[]> {
    return this.http.get<CivilStatus[]>(`${this.apiAux}/civil-status`);
  }

  getColorRace(): Observable<ColorRace[]> {
    return this.http.get<ColorRace[]>(`${this.apiAux}/color-race`);
  }

  getFormations(): Observable<Formations[]> {
    return this.http.get<Formations[]>(`${this.apiAux}/formations`);
  }

  getKinships(): Observable<Kinships[]> {
    return this.http.get<Kinships[]>(`${this.apiAux}/kinships`);
  }

  getPersons(): Observable<Person[]> {
    return this.http.get<Person[]>(`${this.apiAdmin}/persons`);
  }

  getChurch(): Observable<Church[]> {
    return this.http.get<Church[]>(`${this.apiAdmin}/churches`);
  }

  getMemberOrigins(): Observable<MemberOrigin[]> {
    return this.http.get<MemberOrigin[]>(`${this.apiAdmin}/member-origins`);
  }

  getMembers(): Observable<Members[]> {
    return this.http.get<Members[]>(this.api);
  }

  getMemberById(id: string): Observable<Members> {
    return this.http.get<Members>(`${this.api}/${id}`);
  }

  createMember(member: Members): Observable<Members> {
    return this.http.post<Members>(this.api, member);
  }

  createPerson(person: Person): Observable<Person> {
    return this.http.post<Person>(
      `${environment.apiUrl}/admin/persons`,
      person,
    );
  }

  createChurch(church: Church): Observable<Church> {
    return this.http.post<Church>(
      `${environment.apiUrl}/admin/churches`,
      church,
    );
  }

  updateMember(
    memberId: string,
    memberData: Partial<Members>,
  ): Observable<Members> {
    return this.http.put<Members>(`${this.api}/${memberId}`, memberData);
  }

  deleteMember(memberId: string): Observable<Members> {
    return this.http.delete<Members>(`${this.api}/${memberId}`);
  }
}
