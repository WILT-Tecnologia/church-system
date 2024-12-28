import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { catchError, map, Observable, of } from 'rxjs';
import { messages } from './message';

@Injectable({
  providedIn: 'root',
})
export class ValidationService {
  constructor(private http: HttpClient) {}

  getFieldValue(item: any, field: string): string | undefined {
    return field.split('.').reduce((acc, part) => acc?.[part], item);
  }

  getErrorMessage(control: AbstractControl): string | null {
    if (control && control.invalid && (control.dirty || control.touched)) {
      const errors = control.errors;
      if (errors) {
        for (const errorKey in errors) {
          if (messages[errorKey as keyof typeof messages]) {
            const message = messages[errorKey as keyof typeof messages];
            return message.replace(
              '{{ requiredLength }}',
              errors[errorKey].requiredLength || '',
            );
          }
        }
      }
    }
    return null;
  }

  validateEmail(control: AbstractControl): Observable<ValidationErrors | null> {
    const email = control.value;
    return this.http
      .post<{ email?: string[] }>('/admin/users/check-email', { email })
      .pipe(
        map((response) => {
          if (response.email && response.email.length > 0) {
            return { emailExists: response.email[0] };
          }
          return null;
        }),
        catchError(() => of(null)),
      );
  }

  passwordValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (!control.value) {
        return null;
      }
      const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      return passwordRegex.test(control.value)
        ? null
        : { invalidPassword: true };
    };
  }
}
