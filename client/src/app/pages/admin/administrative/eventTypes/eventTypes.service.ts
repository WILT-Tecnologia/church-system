import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { EventTypes } from '../../../../model/EventTypes';

@Injectable({
  providedIn: 'root',
})
export class EventTypesService {
  constructor(private http: HttpClient) {}

  private api = `${environment.apiUrl}/admin/event-types`;

  getEventTypes(): Observable<EventTypes[]> {
    return this.http.get<EventTypes[]>(this.api);
  }

  getEventTypesById(id: string): Observable<EventTypes> {
    return this.http.get<EventTypes>(`${this.api}/${id}`);
  }

  createEventTypes(eventType: EventTypes): Observable<any> {
    return this.http.post(this.api, eventType);
  }

  updateEventTypes(
    eventTypeId: string,
    eventTypeData: Partial<EventTypes>
  ): Observable<EventTypes> {
    return this.http.put<EventTypes>(
      `${this.api}/${eventTypeId}`,
      eventTypeData
    );
  }

  deleteEventTypes(eventTypeId: string): Observable<EventTypes> {
    return this.http.delete<EventTypes>(`${this.api}/${eventTypeId}`);
  }
}
