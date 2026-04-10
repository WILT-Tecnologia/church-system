import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Members } from '@app/model/Members';
import { Ordination } from '@app/model/Ordination';
import { environment } from '@environments/environment';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OrdinationsService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/church/ordinations`;
  private memberApi = `${environment.apiUrl}/church/members`;

  getOrdinationByMemberId(memberId: string): Observable<Ordination[]> {
    return this.http
      .get<Members>(`${this.memberApi}/${memberId}`)
      .pipe(map((member) => member.ordination));
  }

  createOrdination(ordination: Ordination): Observable<Ordination> {
    return this.http.post<Ordination>(this.api, ordination);
  }

  updateOrdination(
    ordinationId: string,
    ordinationData: Partial<Ordination>,
  ): Observable<Ordination> {
    return this.http.put<Ordination>(`${this.api}/${ordinationId}`, ordinationData);
  }

  deleteOrdination(ordinationId: string): Observable<Ordination> {
    return this.http.delete<Ordination>(`${this.api}/${ordinationId}`);
  }
}
