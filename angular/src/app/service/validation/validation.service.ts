import { Injectable } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { messages } from './message';

@Injectable({
  providedIn: 'root',
})
export class ValidationService {
  constructor() {}

  getErrorMessage(control: AbstractControl): string | null {
    if (control && control.invalid && (control.dirty || control.touched)) {
      const errors = control.errors;
      if (errors) {
        for (const errorKey in errors) {
          if (messages[errorKey as keyof typeof messages]) {
            const message = messages[errorKey as keyof typeof messages];
            return message.replace(
              '{{ requiredLength }}',
              errors[errorKey].requiredLength || ''
            );
          }
        }
      }
    }
    return null;
  }
}
