import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Person } from 'app/model/Person';
import { FormatsPipe } from 'app/pipes/formats.pipe';
import { environment } from 'environments/environment';
import { map, Observable } from 'rxjs';

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
