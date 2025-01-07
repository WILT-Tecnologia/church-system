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
    return this.http
      .get<Members>(`${this.memberApi}/${memberId}`)
      .pipe(map((member) => member.status_member));
  }

  getStatusMemberById(id: string): Observable<StatusMember> {
    return this.http.get<StatusMember>(`${this.api}/${id}`);
  }

  getStatusMembers(): Observable<StatusMember[]> {
    return this.http.get<StatusMember[]>(this.memberApi);
  }

  createStatusMember(statusMember: StatusMember): Observable<StatusMember> {
    return this.http.post<StatusMember>(`${this.api}`, statusMember);
  }

  updateStatusMember(
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
