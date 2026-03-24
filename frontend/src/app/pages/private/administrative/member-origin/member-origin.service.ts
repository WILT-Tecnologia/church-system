import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { MemberOrigin } from 'app/model/MemberOrigins';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MemberOriginService {
  private api = `${environment.apiUrl}/admin/member-origins`;
  private http = inject(HttpClient);

  findAll(): Observable<MemberOrigin[]> {
    return this.http.get<MemberOrigin[]>(this.api);
  }

  findById(id: string): Observable<MemberOrigin> {
    return this.http.get<MemberOrigin>(`${this.api}/${id}`);
  }

  create(memberOrigin: MemberOrigin): Observable<MemberOrigin> {
    return this.http.post<MemberOrigin>(this.api, memberOrigin);
  }

  update(memberOriginId: string, memberOriginData: Partial<MemberOrigin>): Observable<MemberOrigin> {
    return this.http.put<MemberOrigin>(`${this.api}/${memberOriginId}`, memberOriginData);
  }

  updatedStatus(id: string, status: boolean): Observable<MemberOrigin> {
    const statusData = { status };
    return this.http.put<MemberOrigin>(`${this.api}/${id}`, statusData);
  }

  delete(memberOrigin: MemberOrigin): Observable<MemberOrigin> {
    return this.http.delete<MemberOrigin>(`${this.api}/${memberOrigin.id}`);
  }
}
