import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { User } from 'app/model/User';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/admin/users`;

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.api);
  }

  findById(id: string): Observable<User> {
    return this.http.get<User>(`${this.api}/${id}`);
  }

  createUser(user: User): Observable<User> {
    return this.http.post<User>(this.api, user);
  }

  updateUser(user: User): Observable<User> {
    return this.http.put<User>(`${this.api}/${user.id}`, user);
  }

  updatedStatus(user: Partial<User>): Observable<User> {
    const statusData = { status: user.status };
    return this.http.patch<User>(`${this.api}/${user.id}`, statusData);
  }

  deleteUser(user: User): Observable<User> {
    return this.http.delete<User>(`${this.api}/${user.id}`);
  }
}
