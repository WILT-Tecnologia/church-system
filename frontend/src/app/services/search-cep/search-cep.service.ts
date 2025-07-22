import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, finalize, Observable, of, throwError } from 'rxjs';

import { LoadingService } from 'app/components/loading/loading.service';
import { ToastService } from 'app/components/toast/toast.service';

@Injectable({
  providedIn: 'root',
})
export class CepService {
  private readonly brasilApiV1Url = 'https://brasilapi.com.br/api/cep/v1';
  private readonly brasilApiV2Url = 'https://brasilapi.com.br/api/cep/v2';

  constructor(
    private http: HttpClient,
    private toast: ToastService,
    private loading: LoadingService,
  ) {}

  searchCep(cep: string): Observable<any> {
    this.loading.show();

    return this.fetchFromApi(this.brasilApiV1Url, cep).pipe(
      catchError(() => this.fetchFromApi(this.brasilApiV2Url, cep)),
      catchError((error) => {
        this.handleError();
        return throwError(() => error);
      }),
      finalize(() => this.loading.hide()),
    );
  }

  private fetchFromApi(baseUrl: string, cep: string): Observable<any> {
    return this.http.get(`${baseUrl}/${cep}`).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 404) {
          return throwError(() => error);
        }
        return this.handleGenericError();
      }),
    );
  }

  private handleError(): Observable<null> {
    this.loading.hide();
    this.toast.openWarning('CEP não encontrado!');
    return of(null);
  }

  private handleGenericError(): Observable<null> {
    this.loading.hide();
    this.toast.openError('Ocorreu um erro ao buscar o CEP.');
    return of(null);
  }
}
