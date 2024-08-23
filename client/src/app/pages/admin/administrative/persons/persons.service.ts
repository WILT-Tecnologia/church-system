import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { Person } from '../../../../model/Person';
import { FormatPipe } from '../../../../utils/pipe/pipe';

@Injectable({
  providedIn: 'root',
})
export class PersonsService {
  constructor(private http: HttpClient) {}

  private api = `${environment.apiUrl}/admin/persons`;
  private formatPipe = new FormatPipe();

  getPersons(): Observable<Person[]> {
    return this.http.get<Person[]>(this.api).pipe(
      map((persons: Person[]) => {
        return persons.map((person: Person) => {
          person.cpf = this.formatPipe.transform(person.cpf, 'cpf');
          person.birth_date = this.formatPipe.transform(
            person.birth_date,
            'birthDate'
          );
          person.sex = this.formatPipe.transform(person.sex, 'sex');
          return person;
        });
      })
    );
  }

  getPersonById(id: string): Observable<Person> {
    return this.http.get<Person>(`${this.api}/${id}`);
  }

  createPerson(person: Person): Observable<any> {
    return this.http.post(this.api, person).pipe(
      catchError((error) => {
        console.error('Erro ao criar a pessoa', error);
        return throwError(error);
      })
    );
  }

  updatePerson(
    personId: string,
    personData: Partial<Person>
  ): Observable<Person> {
    return this.http.put<Person>(`${this.api}/${personId}`, personData);
  }

  deletePerson(personId: string): Observable<any> {
    return this.http.delete(`${this.api}/${personId}`);
  }
}
