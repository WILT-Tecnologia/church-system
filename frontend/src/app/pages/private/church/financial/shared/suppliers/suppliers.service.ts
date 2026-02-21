import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from 'environments/environment';

import { Suppliers } from 'app/model/Suppliers';

@Injectable({
  providedIn: 'root',
})
export class SuppliersService {
  private readonly baseUrl = `${environment.apiUrl}/church/suppliers`;
  private http = inject(HttpClient);

  findAllSuppliers(): Observable<Suppliers[]> {
    return this.http.get<Suppliers[]>(this.baseUrl);
  }

  getSuppliersById(id: string): Observable<Suppliers> {
    return this.http.get<Suppliers>(`${this.baseUrl}/${id}`);
  }

  createSuppliers(suppliers: Suppliers): Observable<Suppliers> {
    return this.http.post<Suppliers>(this.baseUrl, suppliers);
  }

  updateSuppliers(id: string, suppliers: Partial<Suppliers>): Observable<Suppliers> {
    return this.http.put<Suppliers>(`${this.baseUrl}/${id}`, suppliers);
  }

  updatedStatus(id: string, status: boolean): Observable<Suppliers> {
    const statusData = { status };
    return this.http.put<Suppliers>(`${this.baseUrl}/${id}`, statusData);
  }

  deleteSuppliers(suppliers: Suppliers): Observable<Suppliers> {
    return this.http.delete<Suppliers>(`${this.baseUrl}/${suppliers.id}`);
  }
}
