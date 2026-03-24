import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Occupation } from 'app/model/Occupation';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OccupationsService {
  private api = `${environment.apiUrl}/admin/occupations`;
  private http = inject(HttpClient);

  getOccupations(): Observable<Occupation[]> {
    return this.http.get<Occupation[]>(this.api);
  }

  findOccupationById(id: string): Observable<Occupation> {
    return this.http.get<Occupation>(`${this.api}/${id}`);
  }

  createOccupation(occupation: Occupation): Observable<Occupation> {
    return this.http.post<Occupation>(this.api, occupation);
  }

  updateOccupation(occupationId: string, occupationData: Partial<Occupation>): Observable<Occupation> {
    return this.http.put<Occupation>(`${this.api}/${occupationId}`, occupationData);
  }

  updatedStatus(id: string, status: boolean): Observable<Occupation> {
    const statusData = { status };
    return this.http.put<Occupation>(`${this.api}/${id}`, statusData);
  }

  deleteOccupation(occupationId: string): Observable<Occupation> {
    return this.http.delete<Occupation>(`${this.api}/${occupationId}`);
  }
}
