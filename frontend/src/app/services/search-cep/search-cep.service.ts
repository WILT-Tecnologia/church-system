import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, finalize, Observable, of, throwError, timeout } from 'rxjs';

import { LoadingService } from 'app/components/loading/loading.service';
import { ToastService } from 'app/components/toast/toast.service';

@Injectable({
  providedIn: 'root',
})
export class CepService {
  private readonly brasilApiV1Url = 'https://brasilapi.com.br/api/cep/v1';
  private readonly brasilApiV2Url = 'https://brasilapi.com.br/api/cep/v2';
  private readonly requestTimeout = 10000; // 10 segundos em milissegundos

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
        this.handleError(error);
        return throwError(() => error);
      }),
      finalize(() => this.loading.hide()),
    );
  }

  private fetchFromApi(baseUrl: string, cep: string): Observable<any> {
    return this.http.get(`${baseUrl}/${cep}`).pipe(
      timeout(this.requestTimeout), // Define o tempo limite de 10 segundos
      catchError((error: HttpErrorResponse | Error) => {
        if (error instanceof HttpErrorResponse && error.status === 404) {
          return throwError(() => error);
        }
        if (error.name === 'TimeoutError') {
          this.loading.hide();
          this.toast.openWarning('CEP não encontrado!');
          return of(null);
        }
        return this.handleGenericError();
      }),
    );
  }

  private handleError(error: HttpErrorResponse | Error): Observable<null> {
    this.loading.hide();
    if (error instanceof HttpErrorResponse && error.status === 404) {
      this.toast.openWarning('CEP não encontrado!');
    } else {
      this.toast.openError('Ocorreu um erro ao buscar o CEP.');
    }
    return of(null);
  }

  private handleGenericError(): Observable<null> {
    this.loading.hide();
    this.toast.openError('Ocorreu um erro ao buscar o CEP.');
    return of(null);
  }
}
