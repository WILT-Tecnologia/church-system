import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { Person } from '../../../../model/Person';
import { FormatsPipe } from '../../../../pipes/formats.pipe';

@Injectable({
  providedIn: 'root',
})
export class PersonsService {
  constructor(private http: HttpClient) {}

  private api = `${environment.apiUrl}/admin/persons`;
  private formats = new FormatsPipe();

  getPersons(): Observable<Person[]> {
    return this.http.get<Person[]>(this.api).pipe(
      map((person: Person[]) => {
        return person.map((person) => {
          person.cpf = this.formats.cpfFormat(person.cpf);
          person.birth_date = this.formats.dateFormat(person.birth_date);
          person.sex = this.formats.SexTransform(person.sex, 'toView');
          person.phone_one = this.formats.phoneFormat(person.phone_one);
          return person;
        });
      }),
    );
  }

  getPersonById(id: string): Observable<Person> {
    return this.http.get<Person>(`${this.api}/${id}`);
  }

  createPerson(person: Person): Observable<Person> {
    return this.http.post<Person>(this.api, person);
  }

  updatePerson(
    personId: string,
    personData: Partial<Person>,
  ): Observable<Person> {
    const sanitizedData = {
      ...personData,
      sex: this.formats.SexTransform(personData.sex || '', 'toModel'),
    };

    return this.http.put<Person>(`${this.api}/${personId}`, sanitizedData);
  }

  deletePerson(person: Person): Observable<Person> {
    return this.http.delete<Person>(`${this.api}/${person.id}`);
  }
}
