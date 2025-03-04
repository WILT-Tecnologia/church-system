import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../../../environments/environment';
import { Kinships } from '../../../../../../model/Auxiliaries';
import { Families } from '../../../../../../model/Families';
import { Members } from '../../../../../../model/Members';
import { Person } from '../../../../../../model/Person';

@Injectable({
  providedIn: 'root',
})
export class FamiliesService {
  constructor(private http: HttpClient) {}

  private families = `${environment.apiUrl}/church/families`;
  private members = `${environment.apiUrl}/church/members`;
  private persons = `${environment.apiUrl}/admin/persons`;
  private kinships = `${environment.apiUrl}/aux/kinships`;

  getKinships(): Observable<Kinships[]> {
    return this.http.get<Kinships[]>(this.kinships);
  }

  getPersons(): Observable<Person[]> {
    return this.http.get<Person[]>(this.persons);
  }

  getMembers(): Observable<Members[]> {
    return this.http.get<Members[]>(this.members);
  }

  getFamilies(): Observable<Families[]> {
    return this.http.get<Families[]>(this.families);
  }

  getFamily(id: string): Observable<Families> {
    return this.http.get<Families>(`${this.families}/${id}`);
  }

  createFamily(family: Families): Observable<Families> {
    return this.http.post<Families>(this.families, family);
  }

  updateFamily(id: string, family: Partial<Families>): Observable<Families> {
    return this.http.patch<Families>(`${this.families}/${id}`, family);
  }

  deleteFamily(data: Families): Observable<Families> {
    return this.http.delete<Families>(`${this.families}/${data.id}`);
  }
}
