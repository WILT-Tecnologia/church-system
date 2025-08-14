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

  private apiUrl = `${environment.apiUrl}/church/eventos`;

  findAll(eventId: string): Observable<CallToDay[]> {
    return this.http.get<CallToDay[]>(`${this.apiUrl}/${eventId}/calls`);
  }

  findById(eventId: string, callId: string): Observable<CallToDay[]> {
    return this.http.get<CallToDay[]>(`${this.apiUrl}/${eventId}/calls/${callId}`);
  }

  create(eventId: string, callToDay: Partial<CallToDay>): Observable<CallToDay> {
    return this.http.post<CallToDay>(`${this.apiUrl}/${eventId}/calls`, callToDay);
  }

  update(eventId: string, callId: string, callToDay: Partial<CallToDay>): Observable<CallToDay> {
    return this.http.put<CallToDay>(`${this.apiUrl}/${eventId}/calls/${callId}`, callToDay);
  }

  delete(eventId: string, callId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${eventId}/calls/${callId}`);
  }
}
