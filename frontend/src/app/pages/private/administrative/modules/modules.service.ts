import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Modules } from '@app/model/Modules';
import { environment } from '@environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ModuleService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/admin/modules`;

  findAll(): Observable<Modules[]> {
    return this.http.get<Modules[]>(this.apiUrl);
  }

  findById(id: string): Observable<Modules> {
    return this.http.get<Modules>(`${this.apiUrl}/${id}`);
  }

  createModule(module: Partial<Modules>): Observable<Modules> {
    return this.http.post<Modules>(this.apiUrl, module);
  }

  updateModule(module: Modules): Observable<Modules> {
    return this.http.put<Modules>(`${this.apiUrl}/${module.id}`, module);
  }

  delete(id: string): Observable<Modules> {
    return this.http.delete<Modules>(`${this.apiUrl}/${id}`);
  }
}
