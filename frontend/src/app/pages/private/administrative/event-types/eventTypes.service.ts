import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { EventTypes } from 'app/model/EventTypes';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EventTypesService {
  private api = `${environment.apiUrl}/admin/event-types`;
  private http = inject(HttpClient);

  findAll(): Observable<EventTypes[]> {
    return this.http.get<EventTypes[]>(this.api);
  }

  findById(id: string): Observable<EventTypes> {
    return this.http.get<EventTypes>(`${this.api}/${id}`);
  }

  create(eventType: EventTypes): Observable<EventTypes> {
    return this.http.post<EventTypes>(this.api, eventType);
  }

  update(eventType: EventTypes): Observable<EventTypes> {
    return this.http.put<EventTypes>(`${this.api}/${eventType.id}`, eventType);
  }

  updatedStatus(eventType: Partial<EventTypes>): Observable<EventTypes> {
    const statusData = { status: eventType.status };
    return this.http.put<EventTypes>(`${this.api}/${eventType.id}`, statusData);
  }

  delete(eventType: EventTypes): Observable<EventTypes> {
    return this.http.delete<EventTypes>(`${this.api}/${eventType.id}`);
  }
}
