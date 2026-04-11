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

  getAllEventCalls(eventId: string): Observable<EventCall[]> {
    return this.http.get<EventCall[]>(`${this.apiUrl}/${eventId}/calls`);
  }

  createEventCall(eventId: string, eventCall: Partial<EventCall>): Observable<EventCall> {
    return this.http.post<EventCall>(`${this.apiUrl}/${eventId}/calls`, eventCall);
  }

  updateEventCall(
    eventId: string,
    callId: string,
    eventCall: Partial<EventCall>,
  ): Observable<EventCall> {
    return this.http.put<EventCall>(`${this.apiUrl}/${eventId}/calls/${callId}`, eventCall);
  }

  deleteEventCall(eventId: string, callId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${eventId}/calls/${callId}`);
  }
}
