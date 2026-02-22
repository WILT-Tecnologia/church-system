import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from 'environments/environment';

import { FinancialTransations } from 'app/model/FinancialTransations';

@Injectable({
  providedIn: 'root',
})
export class FinancialTransactionsService {
  private readonly baseUrl = `${environment.apiUrl}/church/financial-transactions`;
  private http = inject(HttpClient);

  findAllFinancialTransactions(): Observable<FinancialTransations[]> {
    return this.http.get<FinancialTransations[]>(this.baseUrl);
  }

  getFinancialTransactionsById(id: string): Observable<FinancialTransations> {
    return this.http.get<FinancialTransations>(`${this.baseUrl}/${id}`);
  }

  createFinancialTransactions(financialTransactions: FinancialTransations): Observable<FinancialTransations> {
    return this.http.post<FinancialTransations>(this.baseUrl, financialTransactions);
  }

  createWithFormData(formData: FormData): Observable<FinancialTransations> {
    return this.http.post<FinancialTransations>(this.baseUrl, formData);
  }

  updateFinancialTransactions(
    id: string,
    financialTransactions: Partial<FinancialTransations>,
  ): Observable<FinancialTransations> {
    return this.http.put<FinancialTransations>(`${this.baseUrl}/${id}`, financialTransactions);
  }

  updateWithFormData(id: string, formData: FormData): Observable<FinancialTransations> {
    return this.http.post<FinancialTransations>(`${this.baseUrl}/${id}`, formData);
  }

  deleteFinancialTransactions(financialTransactions: FinancialTransations): Observable<FinancialTransations> {
    return this.http.delete<FinancialTransations>(`${this.baseUrl}/${financialTransactions.id}`);
  }
}
