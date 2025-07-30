import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { CallToDay } from 'app/model/Events';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CallToDayService {
  constructor(private http: HttpClient) {}

  private apiUrl = `${environment.apiUrl}/eventos`;

  findAll(): Observable<CallToDay[]> {
    return this.http.get<CallToDay[]>(this.apiUrl);
  }

  findById(id: string): Observable<CallToDay> {
    return this.http.get<CallToDay>(`${this.apiUrl}/${id}`);
  }

  create(callToDay: Partial<CallToDay>): Observable<CallToDay> {
    return this.http.post<CallToDay>(this.apiUrl, callToDay);
  }

  update(id: string, callToDay: Partial<CallToDay>): Observable<CallToDay> {
    return this.http.put<CallToDay>(`${this.apiUrl}/${id}`, callToDay);
  }

  delete(id: string): Observable<CallToDay> {
    return this.http.delete<CallToDay>(`${this.apiUrl}/${id}`);
  }
}
