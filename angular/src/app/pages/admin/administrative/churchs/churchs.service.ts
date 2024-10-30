import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Church } from 'app/model/Church';
import { Person as Responsible } from 'app/model/Person';
import { CnpjFormatPipe } from 'app/utils/pipe/CnpjFormatPipe';
import { environment } from 'environments/environment';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChurchsService {
  constructor(private http: HttpClient) {}

  private api = `${environment.apiUrl}/admin/churches`;
  private formatCnpjPipe = new CnpjFormatPipe();

  getResponsables(): Observable<Responsible[]> {
    return this.http.get<Responsible[]>(`${environment.apiUrl}/admin/persons`);
  }

  getChurch(): Observable<Church[]> {
    return this.http.get<Church[]>(this.api).pipe(
      map((church: Church[]) => {
        return church.map((church) => {
          church.cnpj = this.formatCnpjPipe.transform(church.cnpj);
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

  deleteChurch(churchId: string): Observable<Church> {
    return this.http.delete<Church>(`${this.api}/${churchId}`);
  }
}
