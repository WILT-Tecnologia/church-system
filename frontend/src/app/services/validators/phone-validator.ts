import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function phoneValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    // Obtém o valor do campo e remove todos os caracteres não numéricos
    const numero: string = control.value?.replace(/\D/g, '');

    // Se o campo estiver vazio, retorna null (sem erros)
    if (!numero) {
      return null;
    }

    // Valida a quantidade de dígitos
    if (numero.length < 10 || numero.length > 11) {
      return { invalidPhone: 'O número deve ter 10 ou 11 dígitos.' };
    }

    // Verifica se o número começa com o dígito 9 (caso tenha 11 dígitos)
    if (numero.length === 11 && numero.charAt(2) !== '9') {
      return { invalidPhone: 'O número com 11 dígitos deve começar com 9.' };
    }

    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{9,10}$/.test(numero)) {
      return { invalidPhone: 'O número não pode ter todos os dígitos iguais.' };
    }

    // Retorna null se o número for válido
    return null;
  };
}
