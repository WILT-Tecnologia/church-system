import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Kinships } from 'app/model/Auxiliaries';
import { Families } from 'app/model/Families';
import { Members } from 'app/model/Members';
import { Person } from 'app/model/Person';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FamiliesService {
  constructor(private http: HttpClient) {}

  private api = `${environment.apiUrl}/church/families`;

  getKinships(): Observable<Kinships[]> {
    return this.http.get<Kinships[]>(`${environment.apiUrl}/aux/kinships`);
  }

  getPersons(): Observable<Person[]> {
    return this.http.get<Person[]>(`${environment.apiUrl}/admin/persons`);
  }

  getMembers(): Observable<Members[]> {
    return this.http.get<Members[]>(`${environment.apiUrl}/church/members`);
  }

  getFamilies(): Observable<Families[]> {
    return this.http.get<Families[]>(this.api);
  }

  getFamily(id: string): Observable<Families> {
    return this.http.get<Families>(`${this.api}/${id}`);
  }

  getFamilyByMemberId(memberId: string): Observable<Families[]> {
    return this.http.get<Families[]>(
      `${environment.apiUrl}/church/member?member_id=${memberId}`,
    );
  }

  createFamily(family: Families): Observable<Families> {
    return this.http.post<Families>(this.api, family);
  }

  updateFamily(id: string, family: Partial<Families>): Observable<Families> {
    return this.http.patch<Families>(`${this.api}/${id}`, family);
  }

  deleteFamily(id: string): Observable<Families> {
    return this.http.delete<Families>(`${this.api}/${id}`);
  }
}
