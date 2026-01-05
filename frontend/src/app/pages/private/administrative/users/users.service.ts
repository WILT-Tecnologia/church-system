import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { User } from 'app/model/User';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  constructor(private http: HttpClient) {}

  private api = `${environment.apiUrl}/admin/users`;

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.api);
  }

  findById(id: string): Observable<User> {
    return this.http.get<User>(`${this.api}/${id}`);
  }

  createUser(user: User): Observable<any> {
    return this.http.post(this.api, user);
  }

  updateUser(userId: string, userData: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.api}/${userId}`, userData);
  }

  updatedStatus(id: string, status: boolean): Observable<User> {
    const statusData = { status };
    return this.http.put<User>(`${this.api}/${id}`, statusData);
  }

  deleteUser(userId: string): Observable<any> {
    return this.http.delete(`${this.api}/${userId}`);
  }
}
