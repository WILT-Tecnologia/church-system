import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from 'environments/environment';

import { Patrimonies } from 'app/model/Patrimonies';

@Injectable({
  providedIn: 'root',
})
export class PatrimoniesService {
  constructor(private http: HttpClient) {}

  private api = `${environment.apiUrl}/church/patrimonies`;

  findAll(): Observable<Patrimonies[]> {
    return this.http.get<Patrimonies[]>(this.api);
  }

  getPatrimoniesById(id: string): Observable<Patrimonies> {
    return this.http.get<Patrimonies>(`${this.api}/${id}`);
  }

  createWithFormData(formData: FormData): Observable<Patrimonies> {
    return this.http.post<Patrimonies>(this.api, formData);
  }

  updateWithFormData(id: string, formData: FormData): Observable<Patrimonies> {
    return this.http.post<Patrimonies>(`${this.api}/${id}`, formData);
  }

  create(patrimonies: Patrimonies): Observable<Patrimonies> {
    return this.http.post<Patrimonies>(this.api, patrimonies);
  }

  update(id: string, patrimonies: Partial<Patrimonies>): Observable<Patrimonies> {
    return this.http.put<Patrimonies>(`${this.api}/${id}`, patrimonies);
  }

  deletePatrimonies(patrimonies: Patrimonies): Observable<Patrimonies> {
    return this.http.delete<Patrimonies>(`${this.api}/${patrimonies.id}`);
  }
}
