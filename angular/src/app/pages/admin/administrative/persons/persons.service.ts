import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DateFormatPipe } from 'app/utils/pipe/BirthDateFormatPipe';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { Person } from '../../../../model/Person';
import { CpfFormatPipe } from '../../../../utils/pipe/CpfFormatPipe';
import { SexFormatPipe } from '../../../../utils/pipe/SexFormatPipe';

@Injectable({
  providedIn: 'root',
})
export class PersonsService {
  constructor(private http: HttpClient) {}

  private api = `${environment.apiUrl}/admin/persons`;
  private formatCPFPipe = new CpfFormatPipe();
  private formatBirthDatePipe = new DateFormatPipe();
  private formatSexPipe = new SexFormatPipe();

  getPersons(): Observable<Person[]> {
    return this.http.get<Person[]>(this.api).pipe(
      map((person: Person[]) => {
        return person.map((person) => {
          person.cpf = this.formatCPFPipe.transform(person.cpf);
          person.birth_date = this.formatBirthDatePipe.transform(
            person.birth_date,
          );
          person.sex = this.formatSexPipe.transform(person.sex);
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
    return this.http.put<Person>(`${this.api}/${personId}`, personData);
  }

  deletePerson(personId: string): Observable<Person> {
    return this.http.delete<Person>(`${this.api}/${personId}`);
  }
}
