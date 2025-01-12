import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MemberSituations } from 'app/model/Auxiliaries';
import { Members, StatusMember } from 'app/model/Members';
import { environment } from 'environments/environment';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StatusMemberService {
  constructor(private http: HttpClient) {}

  private api = `${environment.apiUrl}/church/status-members`;
  private memberApi = `${environment.apiUrl}/church/members`;
  private apiAux = `${environment.apiUrl}/aux`;

  getMemberSituations(): Observable<MemberSituations[]> {
    return this.http.get<MemberSituations[]>(`${this.apiAux}/member-situation`);
  }

  getStatusMemberFromMembers(memberId: string): Observable<StatusMember[]> {
    return this.http.get<Members>(`${this.memberApi}/${memberId}`).pipe(
      map((member) =>
        member.statusMember.map((status) => ({
          ...status,
          member_situation_name: status.member_situation.name,
          name: status.member?.person?.name,
          initial_period: status.initial_period,
          final_period: status.final_period,
        })),
      ),
    );
  }

  findById(id: string): Observable<StatusMember> {
    return this.http.get<StatusMember>(`${this.api}/${id}`);
  }

  getStatusMembers(): Observable<StatusMember[]> {
    return this.http.get<StatusMember[]>(this.memberApi);
  }

  create(statusMember: StatusMember): Observable<StatusMember> {
    return this.http.post<StatusMember>(`${this.api}`, statusMember);
  }

  update(
    statusMemberId: string,
    statusMemberData: Partial<StatusMember>,
  ): Observable<StatusMember> {
    return this.http.put<StatusMember>(
      `${this.api}/${statusMemberId}`,
      statusMemberData,
    );
  }

  deleteStatusMember(statusMemberId: string): Observable<StatusMember> {
    return this.http.delete<StatusMember>(`${this.api}/${statusMemberId}`);
  }
}
