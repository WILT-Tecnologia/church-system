import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { FinancialCategories } from 'app/model/FinancialCategories';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FinancialCategoriesService {
  private readonly baseUrl = `${environment.apiUrl}/church/financial-categories`;
  private http = inject(HttpClient);

  findAllFinancialCategories(): Observable<FinancialCategories[]> {
    return this.http.get<FinancialCategories[]>(this.baseUrl);
  }

  getFinancialCategoriesById(id: string): Observable<FinancialCategories> {
    return this.http.get<FinancialCategories>(`${this.baseUrl}/${id}`);
  }

  createFinancialCategories(financialCategories: FinancialCategories): Observable<FinancialCategories> {
    return this.http.post<FinancialCategories>(this.baseUrl, financialCategories);
  }

  updateFinancialCategories(
    id: string,
    financialCategories: Partial<FinancialCategories>,
  ): Observable<FinancialCategories> {
    return this.http.put<FinancialCategories>(`${this.baseUrl}/${id}`, financialCategories);
  }

  updatedStatus(id: string, status: boolean): Observable<FinancialCategories> {
    const statusData = { status };
    return this.http.put<FinancialCategories>(`${this.baseUrl}/${id}`, statusData);
  }

  deleteFinancialCategories(financialCategories: FinancialCategories): Observable<FinancialCategories> {
    return this.http.delete<FinancialCategories>(`${this.baseUrl}/${financialCategories.id}`);
  }
}
