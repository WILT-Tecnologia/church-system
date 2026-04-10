import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { History, Members } from '@app/model/Members';
import { environment } from '@environments/environment';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HistoryService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/church/hist-member`;

  saveHistory(data: Partial<History>) {
    return this.http.post<History>(this.apiUrl, data);
  }

  findAll(id: string): Observable<History[]> {
    return this.http
      .get<Members>(`${this.apiUrl}/${id}`)
      .pipe(map((member) => member.history_member || []));
  }
}
