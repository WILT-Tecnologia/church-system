import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Events } from 'app/model/Events';
import { EventTypes } from 'app/model/EventTypes';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EventsService {
  constructor(private http: HttpClient) {}

  private apiUrl = `${environment.apiUrl}/church/eventos`;

  findByEventType(eventType: EventTypes): Observable<Events[]> {
    return this.http.get<Events[]>(`${this.apiUrl}/type/${eventType.id}`);
  }

  findAll(): Observable<Events[]> {
    return this.http.get<Events[]>(this.apiUrl);
  }

  findById(id: string): Observable<Events> {
    return this.http.get<Events>(`${this.apiUrl}/${id}`);
  }

  create(event: Partial<Events>): Observable<Events> {
    return this.http.post<Events>(this.apiUrl, event);
  }

  update(event: Partial<Events>): Observable<Events> {
    const route = event.id ? `${this.apiUrl}/${event.id}` : this.apiUrl;
    return this.http.put<Events>(route, event);
  }

  delete(event: Events): Observable<Events> {
    return this.http.delete<Events>(`${this.apiUrl}/${event.id}`);
  }
}
