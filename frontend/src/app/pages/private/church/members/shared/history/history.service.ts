import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../../../../environments/environment';
import { History, Members } from '../../../../../../model/Members';

@Injectable({
  providedIn: 'root',
})
export class HistoryService {
  private apiUrl = `${environment.apiUrl}/church/members`;

  constructor(private http: HttpClient) {}

  saveHistory(data: Partial<History>) {
    return this.http.post<History>(this.apiUrl, data).toPromise();
  }

  findAll(id: string): Observable<History[]> {
    return this.http
      .get<Members>(`${this.apiUrl}/${id}`)
      .pipe(map((member) => member.history_member));
  }

  getHistoryById(id: string): Observable<History[]> {
    return this.http.get<History[]>(`${this.apiUrl}/${id}`);
  }

  createHistory(history_member: History): Observable<History> {
    return this.http.post<History>(this.apiUrl, history_member);
  }

  updateHistory(history_member: History): Observable<History> {
    return this.http.put<History>(
      `${this.apiUrl}/${history_member.id}`,
      history_member,
    );
  }

  deleteHistory(id: string): Observable<History> {
    return this.http.delete<History>(`${this.apiUrl}/${id}`);
  }
}
