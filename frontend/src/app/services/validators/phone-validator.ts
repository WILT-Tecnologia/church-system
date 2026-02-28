import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function phoneValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const rawVal = control.value;
    if (!rawVal) {
      return null;
    }

    // Obtém o valor do campo e remove todos os caracteres não numéricos
    const numero = String(rawVal).replace(/\D/g, '');
    if (!numero) {
      return null;
    }

    // Valida a quantidade de dígitos
    if (numero.length < 10 || numero.length > 11) {
      return { invalidPhoneLength: true };
    }

    // Verifica se o número começa com o dígito 9 (caso tenha 11 dígitos)
    if (numero.length === 11 && numero.charAt(2) !== '9') {
      return { invalidPhoneStart: true };
    }

    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1+$/.test(numero)) {
      return { invalidPhoneSequence: true };
    }

    // Retorna null se o número for válido
    return null;
  };
}
