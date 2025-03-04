import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { Church } from '../../../../model/Church';
import { FormatsPipe } from '../../../../pipes/formats.pipe';

@Injectable({
  providedIn: 'root',
})
export class ChurchsService {
  constructor(private http: HttpClient) {}

  private api = `${environment.apiUrl}/admin/churches`;
  private formats = new FormatsPipe();

  getChurch(): Observable<Church[]> {
    return this.http.get<Church[]>(this.api).pipe(
      map((church: Church[]) => {
        return church.map((church: Church) => {
          church.cnpj = this.formats.cnpjFormat(church.cnpj);
          return church;
        });
      }),
    );
  }

  getChurchById(id: string): Observable<Church> {
    return this.http.get<Church>(`${this.api}/${id}`);
  }

  createChurch(church: Church): Observable<Church> {
    return this.http.post<Church>(this.api, church);
  }

  updateChurch(
    churchId: string,
    churchData: Partial<Church>,
  ): Observable<Church> {
    return this.http.put<Church>(`${this.api}/${churchId}`, churchData);
  }

  deleteChurch(church: Church): Observable<Church> {
    return this.http.delete<Church>(`${this.api}/${church.id}`);
  }
}
