import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
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
          if (typeof errors[errorKey] === 'string') {
            return errors[errorKey];
          }

          if (messages[errorKey as keyof typeof messages]) {
            const message = messages[errorKey as keyof typeof messages];
            return message.replace('{{ length }}', errors[errorKey]?.requiredLength || '');
          }

          return errorKey;
        }
      }
    }
    return null;
  }

  handleLaravelErrors(form: FormGroup, errors: Record<string, string[]>) {
    Object.keys(errors).forEach((key) => {
      const control = form.get(key);
      if (control) {
        const errorKey = errors[key][0];

        control.setErrors({ [errorKey]: true });

        control.markAsTouched();
      }
    });
  }

  validateEmail(control: AbstractControl): Observable<ValidationErrors | null> {
    const email = control.value;
    return this.http.post<{ email?: string[] }>('/admin/users/check-email', { email }).pipe(
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
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      return passwordRegex.test(control.value) ? null : { invalidPassword: true };
    };
  }

  dateValidator(control: FormControl) {
    const value = control.value;
    if (!value) return null;

    // Verifica o formato dd/mm/yyyy
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
      return { invalidDate: true };
    }

    const [day, month, year] = value.split('/').map(Number);
    const date = new Date(year, month - 1, day);

    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
      ? null
      : { invalidDate: true };
  }

  timeValidator(control: FormControl) {
    const value = control.value;
    if (!value) return null;

    return /^([01]\d|2[0-3]):([0-5]\d)$/.test(value) ? null : { invalidTime: true };
  }

  parseDate(dateString: string | null | undefined): Date | null {
    if (!dateString) return null;

    if (dateString.includes('/')) {
      const [day, month, year] = dateString.split('/').map(Number);
      return new Date(year, month - 1, day);
    }

    return new Date(dateString);
  }
}
