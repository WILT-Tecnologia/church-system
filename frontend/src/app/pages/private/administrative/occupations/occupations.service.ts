import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Occupation } from '@app/model/Occupation';
import { environment } from '@environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OccupationsService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/admin/occupations`;

  getOccupations(): Observable<Occupation[]> {
    return this.http.get<Occupation[]>(this.api);
  }

  getOccupationById(id: string): Observable<Occupation> {
    return this.http.get<Occupation>(`${this.api}/${id}`);
  }

  createOccupation(occupation: Occupation): Observable<Occupation> {
    return this.http.post<Occupation>(this.api, occupation);
  }

  updateOccupation(occupationData: Partial<Occupation>): Observable<Occupation> {
    return this.http.put<Occupation>(`${this.api}/${occupationData.id}`, occupationData);
  }

  updateStatus(occupationData: Partial<Occupation>): Observable<Occupation> {
    return this.http.put<Occupation>(`${this.api}/${occupationData.id}`, occupationData);
  }

  deleteOccupation(occupationData: Partial<Occupation>): Observable<Occupation> {
    return this.http.delete<Occupation>(`${this.api}/${occupationData.id}`);
  }
}
