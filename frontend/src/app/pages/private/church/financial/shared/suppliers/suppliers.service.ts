import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from 'environments/environment';

import { Suppliers } from 'app/model/Suppliers';

@Injectable({
  providedIn: 'root',
})
export class SuppliersService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/church/suppliers`;

  findAllSuppliers(): Observable<Suppliers[]> {
    return this.http.get<Suppliers[]>(this.baseUrl);
  }

  getSuppliersById(id: string): Observable<Suppliers> {
    return this.http.get<Suppliers>(`${this.baseUrl}/${id}`);
  }

  createSuppliers(suppliers: Suppliers): Observable<Suppliers> {
    return this.http.post<Suppliers>(this.baseUrl, suppliers);
  }

  updateSuppliers(suppliers: Suppliers): Observable<Suppliers> {
    return this.http.put<Suppliers>(`${this.baseUrl}/${suppliers.id}`, suppliers);
  }

  updatedStatus(suppliers: Suppliers): Observable<Suppliers> {
    const statusData = { status: !suppliers.status };
    return this.http.put<Suppliers>(`${this.baseUrl}/${suppliers.id}`, statusData);
  }

  deleteSuppliers(suppliers: Suppliers): Observable<Suppliers> {
    return this.http.delete<Suppliers>(`${this.baseUrl}/${suppliers.id}`);
  }
}
