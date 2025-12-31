import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { environment } from 'environments/environment';

import { History, Members } from 'app/model/Members';

@Injectable({
  providedIn: 'root',
})
export class HistoryService {
  private apiUrl = `${environment.apiUrl}/church/hist-member`;

  constructor(private http: HttpClient) {}

  saveHistory(data: Partial<History>) {
    return this.http.post<History>(this.apiUrl, data);
  }

  findAll(id: string): Observable<History[]> {
    return this.http.get<Members>(`${this.apiUrl}/${id}`).pipe(map((member) => member.history_member || []));
  }
}
