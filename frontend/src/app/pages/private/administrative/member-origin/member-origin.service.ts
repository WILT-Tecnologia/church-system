import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { MemberOrigin } from '@app/model/MemberOrigins';
import { environment } from '@environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MemberOriginService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/admin/member-origins`;

  findAll(): Observable<MemberOrigin[]> {
    return this.http.get<MemberOrigin[]>(this.api);
  }

  findById(id: string): Observable<MemberOrigin> {
    return this.http.get<MemberOrigin>(`${this.api}/${id}`);
  }

  create(memberOrigin: MemberOrigin): Observable<MemberOrigin> {
    return this.http.post<MemberOrigin>(this.api, memberOrigin);
  }

  update(memberOrigin: MemberOrigin): Observable<MemberOrigin> {
    return this.http.put<MemberOrigin>(`${this.api}/${memberOrigin.id}`, memberOrigin);
  }

  updatedStatus(memberOrigin: MemberOrigin): Observable<MemberOrigin> {
    const statusData = { status: !memberOrigin.status };
    return this.http.patch<MemberOrigin>(`${this.api}/${memberOrigin.id}`, statusData);
  }

  delete(memberOrigin: MemberOrigin): Observable<MemberOrigin> {
    return this.http.delete<MemberOrigin>(`${this.api}/${memberOrigin.id}`);
  }
}
