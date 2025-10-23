import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from 'environments/environment';

export interface Module {
  id: string;
  name: string;
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ModuleService {
  private apiUrl = `${environment.apiUrl}/admin/modules`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Module[]> {
    return this.http.get<Module[]>(this.apiUrl);
  }

  getById(id: string): Observable<Module> {
    return this.http.get<Module>(`${this.apiUrl}/${id}`);
  }

  create(module: Partial<Module>): Observable<any> {
    return this.http.post(this.apiUrl, module);
  }

  update(id: string, module: Partial<Module>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, module);
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
