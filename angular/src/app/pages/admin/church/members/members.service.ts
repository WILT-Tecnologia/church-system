import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  CivilStatus,
  ColorRace,
  Formations,
  Kinships,
  MemberSituations,
} from 'app/model/Auxiliaries';
import { MemberOrigin } from 'app/model/MemberOrigins';
import { CpfFormatPipe } from 'app/utils/pipe/CpfFormatPipe';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

import { Church } from 'app/model/Church';
import { Families } from 'app/model/Families';
import { Members } from 'app/model/Members';
import { Ordination } from 'app/model/Ordination';
import { Person } from 'app/model/Person';
import { DateFormatPipe } from 'app/utils/pipe/BirthDateFormatPipe';
import { SexFormatPipe } from 'app/utils/pipe/SexFormatPipe';
import { PhoneFormatPipe } from 'app/utils/pipe/phone-format.pipe';
import { FamiliesService } from './shared/families/families.service';

@Injectable({
  providedIn: 'root',
})
export class MembersService {
  constructor(
    private http: HttpClient,
    private familiesService: FamiliesService,
  ) {}

  private api = `${environment.apiUrl}/church/members`;

  private formatCpfPipe = new CpfFormatPipe();
  private formatDatePipe = new DateFormatPipe();
  private formatSexPipe = new SexFormatPipe();
  private formatPhonePipe = new PhoneFormatPipe();

  getFamilyOfMember(memberId: string): Observable<Families[]> {
    return this.familiesService.getFamilyByMemberId(memberId);
  }

  getOrdinationByMemberId(memberId: string): Observable<Ordination[]> {
    return this.http.get<Ordination[]>(
      `${environment.apiUrl}/church/ordination?member_id=${memberId}`,
    );
  }

  getCivilStatus(): Observable<CivilStatus[]> {
    return this.http.get<CivilStatus[]>(
      `${environment.apiUrl}/aux/civil-status`,
    );
  }

  getColorRace(): Observable<ColorRace[]> {
    return this.http.get<ColorRace[]>(`${environment.apiUrl}/aux/color-race`);
  }

  getFormations(): Observable<Formations[]> {
    return this.http.get<Formations[]>(`${environment.apiUrl}/aux/formations`);
  }

  getKinships(): Observable<Kinships[]> {
    return this.http.get<Kinships[]>(`${environment.apiUrl}/aux/kinships`);
  }

  getMemberSituations(): Observable<MemberSituations[]> {
    return this.http.get<MemberSituations[]>(
      `${environment.apiUrl}/aux/member-situations`,
    );
  }

  getPersons(): Observable<Person[]> {
    return this.http.get<Person[]>(`${environment.apiUrl}/admin/persons`);
  }

  getChurch(): Observable<Church[]> {
    return this.http.get<Church[]>(`${environment.apiUrl}/admin/churches`);
  }

  getMemberOrigins(): Observable<MemberOrigin[]> {
    return this.http.get<MemberOrigin[]>(
      `${environment.apiUrl}/admin/member-origins`,
    );
  }

  getMembers(): Observable<Members[]> {
    return this.http.get<Members[]>(this.api).pipe(
      map((members: Members[]) => {
        return members.map((member: Members) => {
          if (member.person) {
            member.person.cpf = this.formatCpfPipe.transform(member.person.cpf);
            member.person.birth_date = this.formatDatePipe.transform(
              member.person.birth_date,
            );
            member.person.sex = this.formatSexPipe.transform(member.person.sex);
            member.person.phone_one = this.formatPhonePipe.transform(
              member.person.phone_one,
            );
          }

          if (member.id) {
            this.getFamilyOfMember(member.id).subscribe((families) => {
              member.families = families;
            });
          } else {
            member.families = [];
          }
          return member;
        });
      }),
    );
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
      person,
    );
  }

  createChurch(church: Church): Observable<Church> {
    return this.http.post<Church>(
      `${environment.apiUrl}/admin/churches`,
      church,
    );
  }

  updateMember(
    memberId: string,
    memberData: Partial<Members>,
  ): Observable<Members> {
    return this.http.put<Members>(`${this.api}/${memberId}`, memberData);
  }

  deleteMember(memberId: string): Observable<Members> {
    return this.http.delete<Members>(`${this.api}/${memberId}`);
  }
}
