import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MemberOrigin } from 'app/model/MemberOrigins';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MemberOriginService {
  constructor(private http: HttpClient) {}

  private api = `${environment.apiUrl}/admin/member-origins`;

  getMemberOrigins(): Observable<MemberOrigin[]> {
    return this.http.get<MemberOrigin[]>(this.api);
  }

  getMemberOriginById(id: string): Observable<MemberOrigin> {
    return this.http.get<MemberOrigin>(`${this.api}/${id}`);
  }

  createMemberOrigin(memberOrigin: MemberOrigin): Observable<MemberOrigin> {
    return this.http.post<MemberOrigin>(this.api, memberOrigin);
  }

  updateMemberOrigin(
    memberOriginId: string,
    memberOriginData: Partial<MemberOrigin>
  ): Observable<MemberOrigin> {
    return this.http.put<MemberOrigin>(
      `${this.api}/${memberOriginId}`,
      memberOriginData
    );
  }

  deleteMemberOrigin(memberOriginId: string): Observable<MemberOrigin> {
    return this.http.delete<MemberOrigin>(`${this.api}/${memberOriginId}`);
  }
}
