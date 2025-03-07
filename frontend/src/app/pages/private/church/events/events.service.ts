import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Events } from 'app/model/Events';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EventsService {
  constructor(private http: HttpClient) {}

  private sendEventos = `${environment.apiUrl}/church/evento`;

  findAll(): Observable<Events[]> {
    return this.http.get<Events[]>(this.sendEventos);
  }

  findById(id: string): Observable<Events> {
    return this.http.get<Events>(`${this.sendEventos}/${id}`);
  }

  create(event: Partial<Events>): Observable<Events> {
    return this.http.post<Events>(this.sendEventos, event);
  }

  update(eventId: string, event: Partial<Events>): Observable<Events> {
    return this.http.put<Events>(`${this.sendEventos}/${eventId}`, event);
  }

  delete(event: Events): Observable<Events> {
    return this.http.delete<Events>(`${this.sendEventos}/${event.id}`);
  }
}
