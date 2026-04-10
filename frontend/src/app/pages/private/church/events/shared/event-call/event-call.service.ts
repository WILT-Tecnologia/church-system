import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { EventCall } from '@app/model/Events';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EventCallService {
  private http = inject(HttpClient);

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
