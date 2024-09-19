import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Members } from 'app/model/Members';
import { Occupation } from 'app/model/Occupation';
import { Ordination } from 'app/model/Ordination';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

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

  getOrdinationById(id: string): Observable<Ordination> {
    return this.http.get<Ordination>(`${this.api}/${id}`);
  }

  createOrdination(ordination: Ordination): Observable<Ordination> {
    return this.http.post<Ordination>(this.api, ordination);
  }

  updateOrdination(
    ordination: Ordination,
    ordinationData: Partial<Ordination>
  ): Observable<Ordination> {
    return this.http.put<Ordination>(
      `${this.api}/${ordination.id}`,
      ordinationData
    );
  }

  deleteOrdination(ordinationId: string): Observable<Ordination> {
    return this.http.delete<Ordination>(`${this.api}/${ordinationId}`);
  }
}
