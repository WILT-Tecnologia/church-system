import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { Person } from '../../../../model/Person';
import { BirthDateFormatPipe } from '../../../../utils/pipe/BirthDateFormatPipe';
import { CpfFormatPipe } from '../../../../utils/pipe/CpfFormatPipe';
import { SexFormatPipe } from '../../../../utils/pipe/SexFormatPipe';

@Injectable({
  providedIn: 'root',
})
export class PersonsService {
  constructor(private http: HttpClient) {}

  private api = `${environment.apiUrl}/admin/persons`;
  private formatCPFPipe = new CpfFormatPipe();
  private formatBirthDatePipe = new BirthDateFormatPipe();
  private formatSexPipe = new SexFormatPipe();

  getPersons(): Observable<Person[]> {
    return this.http.get<Person[]>(this.api).pipe(
      map((person: Person[]) => {
        return person.map((person) => {
          person.cpf = this.formatCPFPipe.transform(person.cpf);
          person.birth_date = this.formatBirthDatePipe.transform(
            person.birth_date
          );
          person.sex = this.formatSexPipe.transform(person.sex);
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
