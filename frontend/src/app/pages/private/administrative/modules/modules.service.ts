import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from 'environments/environment';

import { Modules } from 'app/model/Modules';

@Injectable({
  providedIn: 'root',
})
export class ModuleService {
  private apiUrl = `${environment.apiUrl}/admin/modules`;
  private http = inject(HttpClient);

  findAll(): Observable<Modules[]> {
    return this.http.get<Modules[]>(this.apiUrl);
  }

  findById(id: string): Observable<Modules> {
    return this.http.get<Modules>(`${this.apiUrl}/${id}`);
  }

  createModule(module: Partial<Modules>): Observable<any> {
    return this.http.post(this.apiUrl, module);
  }

  updateModule(id: string, module: Partial<Modules>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, module);
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
