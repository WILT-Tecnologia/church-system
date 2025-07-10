import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Kinships } from 'app/model/Auxiliaries';
import { Families } from 'app/model/Families';
import { Person } from 'app/model/Person';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root',
})
export class FamiliesService {
  constructor(private http: HttpClient) {}

  private families = `${environment.apiUrl}/church/families`;
  private persons = `${environment.apiUrl}/admin/persons`;
  private kinships = `${environment.apiUrl}/aux/kinships`;

  getKinships(): Observable<Kinships[]> {
    return this.http.get<Kinships[]>(this.kinships);
  }

  getPersons(): Observable<Person[]> {
    return this.http.get<Person[]>(this.persons);
  }

  create(family: Families): Observable<Families> {
    return this.http.post<Families>(this.families, family);
  }

  update(id: string, family: Partial<Families>): Observable<Families> {
    return this.http.patch<Families>(`${this.families}/${id}`, family);
  }

  deleteFamily(data: Families): Observable<Families> {
    return this.http.delete<Families>(`${this.families}/${data.id}`);
  }
}
