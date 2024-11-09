import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function phoneValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const numero: string = control.value?.replace(/\D/g, '');

    if (!numero) {
      return null; // Retorna null se o campo estiver vazio, ou seja, sem erros
    }

    // Verifica se o número possui a quantidade correta de dígitos
    if (numero.length < 10 || numero.length > 11) {
      return { invalidPhone: true };
    }

    // Verifica se o número começa com o dígito 9 (caso tenha 11 dígitos)
    if (numero.length === 11 && numero.charAt(2) !== '9') {
      return { invalidPhone: true };
    }

    // Verifica se todos os dígitos são iguais, o que indica um número inválido
    const allDigitsEqual = /^(\d)\1{9,10}$/.test(numero);
    if (allDigitsEqual) {
      return { invalidPhone: true };
    }

    // Se todas as validações passaram, o número é considerado válido
    return null;
  };
}
