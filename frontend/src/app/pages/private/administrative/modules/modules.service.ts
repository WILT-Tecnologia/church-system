import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Modules } from 'app/model/Modules';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ModuleService {
  private apiUrl = `${environment.apiUrl}/admin/modules`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Modules[]> {
    return this.http.get<Modules[]>(this.apiUrl);
  }

  getById(id: string): Observable<Modules> {
    return this.http.get<Modules>(`${this.apiUrl}/${id}`);
  }

  create(module: Partial<Modules>): Observable<any> {
    return this.http.post(this.apiUrl, module);
  }

  update(id: string, module: Partial<Modules>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, module);
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
