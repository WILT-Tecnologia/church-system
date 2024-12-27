import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { History } from 'app/model/Members';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HistoryService {
  private apiUrl = `${environment.apiUrl}/church/hist-member`;

  constructor(private http: HttpClient) {}

  saveHistory(data: any) {
    return this.http.post(this.apiUrl, data).toPromise();
  }

  getHistories(): Observable<History[]> {
    return this.http.get<History[]>(this.apiUrl);
  }

  getHistoryById(id: string): Observable<History[]> {
    return this.http.get<History[]>(`${this.apiUrl}/${id}`);
  }

  createHistory(history: History): Observable<History> {
    return this.http.post<History>(this.apiUrl, history);
  }

  updateHistory(history: History): Observable<History> {
    return this.http.put<History>(`${this.apiUrl}/${history.id}`, history);
  }

  deleteHistory(id: string): Observable<History> {
    return this.http.delete<History>(`${this.apiUrl}/${id}`);
  }
}
