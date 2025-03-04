import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../../../../environments/environment';
import { Members } from '../../../../../../model/Members';
import { Occupation } from '../../../../../../model/Occupation';
import { Ordination } from '../../../../../../model/Ordination';

@Injectable({
  providedIn: 'root',
})
export class OrdinationsService {
  constructor(private http: HttpClient) {}

  private api = `${environment.apiUrl}/church/ordinations`;
  private occupationApi = `${environment.apiUrl}/admin/occupations`;
  private memberApi = `${environment.apiUrl}/church/members`;

  getOccupations(): Observable<Occupation[]> {
    return this.http.get<Occupation[]>(this.occupationApi);
  }

  getMembers(): Observable<Members[]> {
    return this.http.get<Members[]>(this.memberApi);
  }

  getOrdinations(): Observable<Ordination[]> {
    return this.http.get<Ordination[]>(this.api);
  }

  getOrdinationById(memberId: string): Observable<Ordination> {
    return this.http.get<Ordination>(`${this.api}/${memberId}`);
  }

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
    return this.http.put<Ordination>(
      `${this.api}/${ordinationId}`,
      ordinationData,
    );
  }

  deleteOrdination(ordinationId: string): Observable<Ordination> {
    return this.http.delete<Ordination>(`${this.api}/${ordinationId}`);
  }
}
