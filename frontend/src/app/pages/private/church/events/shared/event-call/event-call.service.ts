import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { EventCall } from 'app/model/Events';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root',
})
export class EventCallService {
  constructor(private http: HttpClient) {}

  private apiUrl = `${environment.apiUrl}/church/eventos`;

  findAll(eventId: string): Observable<EventCall[]> {
    return this.http.get<EventCall[]>(`${this.apiUrl}/${eventId}/calls`);
  }

  findById(eventId: string, callId: string): Observable<EventCall[]> {
    return this.http.get<EventCall[]>(`${this.apiUrl}/${eventId}/calls/${callId}`);
  }

  create(eventId: string, eventCall: Partial<EventCall>): Observable<EventCall> {
    return this.http.post<EventCall>(`${this.apiUrl}/${eventId}/calls`, eventCall);
  }

  update(eventId: string, callId: string, eventCall: Partial<EventCall>): Observable<EventCall> {
    return this.http.put<EventCall>(`${this.apiUrl}/${eventId}/calls/${callId}`, eventCall);
  }

  delete(eventId: string, callId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${eventId}/calls/${callId}`);
  }
}
