import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EventTypes } from 'app/model/EventTypes';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EventTypesService {
  constructor(private http: HttpClient) {}

  private api = `${environment.apiUrl}/admin/event-types`;

  findAll(): Observable<EventTypes[]> {
    return this.http.get<EventTypes[]>(this.api);
  }

  findById(id: string): Observable<EventTypes> {
    return this.http.get<EventTypes>(`${this.api}/${id}`);
  }

  create(eventType: EventTypes): Observable<any> {
    return this.http.post(this.api, eventType);
  }

  update(eventTypeId: string, eventTypeData: Partial<EventTypes>): Observable<EventTypes> {
    return this.http.put<EventTypes>(`${this.api}/${eventTypeId}`, eventTypeData);
  }

  updatedStatus(id: string, status: boolean): Observable<EventTypes> {
    const statusData = { status };
    return this.http.put<EventTypes>(`${this.api}/${id}`, statusData);
  }

  delete(eventType: EventTypes): Observable<EventTypes> {
    return this.http.delete<EventTypes>(`${this.api}/${eventType.id}`);
  }
}
