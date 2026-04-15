import { inject, Injectable, Pipe, PipeTransform } from '@angular/core';
import { AbstractControl, ValidationErrors } from '@angular/forms';
import { ValidationService } from '@app/services/validation/validation.service';

@Injectable({
  providedIn: 'root',
})
@Pipe({
  name: 'errorMessage',
})
export class ErrorMessagePipe implements PipeTransform {
  private readonly validationService = inject(ValidationService);

  transform(value: AbstractControl | ValidationErrors | null | undefined): string {
    if (!value) {
      return '';
    }

    if ('status' in value && 'valueChanges' in value) {
      const control = value as AbstractControl;
      return this.validationService.getErrorMessage(control?.errors);
    }

    return this.validationService.getErrorMessage(value as ValidationErrors);
  }
}
