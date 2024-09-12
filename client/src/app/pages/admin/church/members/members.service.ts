import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MemberOrigin } from 'app/model/MemberOrigins';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { Church } from '../../../../model/Church';
import { Members } from '../../../../model/Members';
import { Person } from '../../../../model/Person';

@Injectable({
  providedIn: 'root',
})
export class MembersService {
  constructor(private http: HttpClient) {}

  private api = `${environment.apiUrl}/church/members`;

  getPersons(): Observable<Person[]> {
    return this.http.get<Person[]>(`${environment.apiUrl}/admin/persons`);
  }

  getChurch(): Observable<Church[]> {
    return this.http.get<Church[]>(`${environment.apiUrl}/admin/churches`);
  }

  getMemberOrigins(): Observable<MemberOrigin[]> {
    return this.http.get<MemberOrigin[]>(
      `${environment.apiUrl}/admin/member-origins`
    );
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
      person
    );
  }

  createChurch(church: Church): Observable<Church> {
    return this.http.post<Church>(
      `${environment.apiUrl}/admin/churches`,
      church
    );
  }

  updateMember(
    memberId: string,
    memberData: Partial<Members>
  ): Observable<Members> {
    return this.http.put<Members>(`${this.api}/${memberId}`, memberData);
  }

  deleteMember(memberId: string): Observable<Members> {
    return this.http.delete<Members>(`${this.api}/${memberId}`);
  }
}
