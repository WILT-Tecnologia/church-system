import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from 'environments/environment';

import { Guest } from 'app/model/Guest';

@Injectable({
  providedIn: 'root',
})
export class GuestsService {
  constructor(private http: HttpClient) {}

  private api = `${environment.apiUrl}/admin/persons`;

  findAll(): Observable<Guest[]> {
    return this.http.get<Guest[]>(this.api);
  }

  // getGuestById(id: string): Observable<Guest> {
  //   return this.http.get<Guest>(`${this.api}/${id}`);
  // }

  create(guest: Guest): Observable<Guest> {
    return this.http.post<Guest>(this.api, guest);
  }

  update(id: string, guest: Partial<Guest>): Observable<Guest> {
    return this.http.put<Guest>(`${this.api}/${id}`, guest);
  }

  deleteGuest(guest: Guest): Observable<Guest> {
    return this.http.delete<Guest>(`${this.api}/${guest.id}`);
  }
}
