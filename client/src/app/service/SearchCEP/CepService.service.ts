import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of, throwError } from 'rxjs';
import { SnackbarService } from '../snackbar/snackbar.service';

@Injectable({
  providedIn: 'root',
})
export class CepService {
  private brasilApiV1Url = 'https://brasilapi.com.br/api/cep/v1';
  private brasilApiV2Url = 'https://brasilapi.com.br/api/cep/v2';
  private viaCepUrl = 'https://viacep.com.br/ws';

  constructor(
    private http: HttpClient,
    private snackbarService: SnackbarService
  ) {}

  searchCep(cep: string): Observable<any> {
    return this.http.get(`${this.brasilApiV1Url}/${cep}`).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 404) {
          return this.http.get(`${this.brasilApiV2Url}/${cep}`).pipe(
            catchError((error: HttpErrorResponse) => {
              if (error.status === 404) {
                return this.http.get(`${this.viaCepUrl}/${cep}/json`).pipe(
                  catchError(() => {
                    return throwError(() => new Error('CEP não encontrado!'));
                  })
                );
              }
              return throwError(() => error);
            })
          );
        }
        return throwError(() => error);
      }),
      catchError((error: Error) => {
        this.snackbarService.openError(error.message);
        return of(null);
      })
    );
  }
}
