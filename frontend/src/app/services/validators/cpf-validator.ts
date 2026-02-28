import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function cpfValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const rawVal = control.value;
    if (!rawVal) {
      return null;
    }

    const cpf = String(rawVal).replace(/\D/g, '');
    if (!cpf) {
      return null;
    }

    if (cpf.length !== 11) {
      return { invalidCpfLength: true };
    }

    if (/^(\d)\1+$/.test(cpf)) {
      return { invalidCpfSequence: true };
    }

    const calcDigit = (factorBase: number, limit: number): number => {
      let sum = 0;
      for (let i = 1; i <= limit; i++) {
        sum += parseInt(cpf.charAt(i - 1), 10) * (factorBase - i);
      }
      let remainder = (sum * 10) % 11;
      if (remainder === 10 || remainder === 11) remainder = 0;
      return remainder;
    };

    if (calcDigit(11, 9) !== parseInt(cpf.charAt(9), 10)) {
      return { invalidCpf: true };
    }

    if (calcDigit(12, 10) !== parseInt(cpf.charAt(10), 10)) {
      return { invalidCpf: true };
    }

    return null;
  };
}
