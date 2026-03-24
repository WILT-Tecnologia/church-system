import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { FormatsPipe } from 'app/components/crud/pipes/formats.pipe';
import { Person } from 'app/model/Person';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PersonsService {
  private api = `${environment.apiUrl}/admin/persons`;
  private http = inject(HttpClient);
  private formats = new FormatsPipe();

  getPersons(): Observable<Person[]> {
    return this.http.get<Person[]>(this.api);
  }

  getPersonById(id: string): Observable<Person> {
    return this.http.get<Person>(`${this.api}/${id}`);
  }

  createPerson(person: Person): Observable<Person> {
    return this.http.post<Person>(this.api, person);
  }

  updatePerson(personId: string, personData: Partial<Person>): Observable<Person> {
    const sanitizedData = {
      ...personData,
      sex: this.formats.SexTransform(personData.sex ?? '', 'toModel'),
    };

    return this.http.put<Person>(`${this.api}/${personId}`, sanitizedData);
  }

  deletePerson(person: Person): Observable<Person> {
    return this.http.delete<Person>(`${this.api}/${person.id}`);
  }
}
