import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CivilStatus, ColorRace, Formations } from 'app/model/Auxiliaries';

import { Church } from 'app/model/Church';
import { Families } from 'app/model/Families';
import { MemberOrigin } from 'app/model/MemberOrigins';
import { Members, StatusMember } from 'app/model/Members';
import { Ordination } from 'app/model/Ordination';
import { Person } from 'app/model/Person';
import { environment } from 'environments/environment';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MembersService {
  constructor(private http: HttpClient) {}

  private api = `${environment.apiUrl}/church/members`;
  private apiAdmin = `${environment.apiUrl}/admin`;
  private apiAux = `${environment.apiUrl}/aux`;
  private currentEditingMemberId: string | null = null;

  setEditingMemberId(memberId: string | null): string | null {
    return (this.currentEditingMemberId = memberId);
  }

  getEditingMemberId(): string | null {
    return this.currentEditingMemberId;
  }

  getFamilyOfMemberId(memberId: string): Observable<Families[]> {
    return this.http.get<Members>(`${this.api}/${memberId}`).pipe(map((member) => member.families));
  }

  getOrdinationsOfMemberId(memberId: string): Observable<Ordination[]> {
    return this.http.get<Members>(`${this.api}/${memberId}`).pipe(map((member) => member.ordination));
  }

  getStatusMemberId(memberId: string): Observable<StatusMember> {
    return this.http.get<Members>(`${this.api}/${memberId}`).pipe(map((member) => member.status_member));
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

  getPersons(): Observable<Person[]> {
    return this.http.get<Person[]>(`${this.apiAdmin}/persons`);
  }

  getChurch(): Observable<Church[]> {
    return this.http.get<Church[]>(`${this.apiAdmin}/churches`);
  }

  getMemberOrigins(): Observable<MemberOrigin[]> {
    return this.http.get<MemberOrigin[]>(`${this.apiAdmin}/member-origins`);
  }

  findAll(): Observable<Members[]> {
    return this.http.get<Members[]>(this.api);
  }

  getMemberById(id: string): Observable<Members> {
    return this.http.get<Members>(`${this.api}/${id}`);
  }

  createMember(member: Members): Observable<Members> {
    return this.http.post<Members>(this.api, member);
  }

  updateMember(memberId: string, memberData: Partial<Members>): Observable<Members> {
    return this.http.put<Members>(`${this.api}/${memberId}`, memberData);
  }

  delete(memberId: string): Observable<Members> {
    return this.http.delete<Members>(`${this.api}/${memberId}`);
  }
}
