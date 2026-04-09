import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from 'environments/environment';

import { Patrimonies } from 'app/model/Patrimonies';

@Injectable({
  providedIn: 'root',
})
export class PatrimoniesService {
  private readonly http = inject(HttpClient);
  private readonly api = `${environment.apiUrl}/church/patrimonies`;

  getAllPatrimonies(): Observable<Patrimonies[]> {
    return this.http.get<Patrimonies[]>(this.api);
  }

  getPatrimoniesById(id: string): Observable<Patrimonies> {
    return this.http.get<Patrimonies>(`${this.api}/${id}`);
  }

  createPatrimonies(data: FormData): Observable<Patrimonies> {
    return this.http.post<Patrimonies>(this.api, data);
  }

  updatePatrimonies(data: FormData | any): Observable<Patrimonies> {
    const id = data instanceof FormData ? data.get('id') : data.id;
    return this.http.post<Patrimonies>(`${this.api}/${id}`, data);
  }

  create(patrimonies: Patrimonies): Observable<Patrimonies> {
    return this.http.post<Patrimonies>(this.api, patrimonies);
  }

  update(patrimonies: Partial<Patrimonies>): Observable<Patrimonies> {
    return this.http.put<Patrimonies>(`${this.api}/${patrimonies.id}`, patrimonies);
  }

  deletePatrimonies(patrimonies: Patrimonies): Observable<Patrimonies> {
    return this.http.delete<Patrimonies>(`${this.api}/${patrimonies.id}`);
  }
}
