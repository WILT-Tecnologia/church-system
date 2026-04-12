import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Frequency } from '@app/model/Events';
import { environment } from '@environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FrequenciesService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/church/eventos`;

  findAll(eventId: string, eventCallId: string): Observable<Frequency[]> {
    return this.http.get<Frequency[]>(`${this.apiUrl}/${eventId}/calls/${eventCallId}/frequencies`);
  }

  findById(eventId: string, eventCallId: string, frequencyId: string): Observable<Frequency> {
    return this.http.get<Frequency>(
      `${this.apiUrl}/${eventId}/calls/${eventCallId}/frequencies/${frequencyId}`,
    );
  }

  createFrequency(
    eventId: string,
    eventCallId: string,
    payload: Partial<Frequency>,
  ): Observable<Frequency> {
    return this.http.post<Frequency>(
      `${this.apiUrl}/${eventId}/calls/${eventCallId}/frequencies`,
      payload,
    );
  }

  update(
    eventId: string,
    eventCallId: string,
    frequencyId: string,
    payload: Partial<Frequency>,
  ): Observable<Frequency> {
    return this.http.put<Frequency>(
      `${this.apiUrl}/${eventId}/calls/${eventCallId}/frequencies/${frequencyId}`,
      payload,
    );
  }

  delete(eventId: string, eventCallId: string, frequencyId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${eventId}/calls/${eventCallId}/frequencies/${frequencyId}`,
    );
  }
}
