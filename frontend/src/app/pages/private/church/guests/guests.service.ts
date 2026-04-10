import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Guest } from '@app/model/Guest';
import { environment } from '@environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GuestsService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/admin/persons`;

  getGuestsAll(): Observable<Guest[]> {
    return this.http.get<Guest[]>(this.api);
  }

  createGuest(guest: Guest): Observable<Guest> {
    return this.http.post<Guest>(this.api, guest);
  }

  updateGuest(guest: Partial<Guest>): Observable<Guest> {
    return this.http.put<Guest>(`${this.api}/${guest.id}`, guest);
  }

  deleteGuest(guest: Guest): Observable<Guest> {
    return this.http.delete<Guest>(`${this.api}/${guest.id}`);
  }
}
