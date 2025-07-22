import { AbstractControl, ValidationErrors } from '@angular/forms';

export function cnpjValidator(control: AbstractControl): ValidationErrors | null {
  const cnpj = control.value;

  if (!cnpj) {
    return null; // Campo vazio, validação não é necessária.
  }

  const cleanedCnpj = cnpj.replace(/[^\d]+/g, '');

  if (cleanedCnpj.length !== 14) {
    return { invalidCnpj: 'O CNPJ deve conter 14 dígitos.' };
  }

  if (/^(.)\1+$/.test(cleanedCnpj)) {
    return { invalidCnpj: 'O CNPJ não pode conter todos os dígitos iguais.' };
  }

  let tamanho = 12;
  let numeros = cleanedCnpj.substring(0, tamanho);
  const digitos = cleanedCnpj.substring(tamanho);
  let soma = 0;
  let pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) {
      pos = 9;
    }
  }

  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);

  if (resultado.toString() !== digitos.charAt(0)) {
    return { invalidCnpj: 'O CNPJ é inválido.' };
  }

  tamanho = 13;
  numeros = cleanedCnpj.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) {
      pos = 9;
    }
  }

  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);

  if (resultado.toString() !== digitos.charAt(1)) {
    return { invalidCnpj: 'O CNPJ é inválido.' };
  }

  return null; // CNPJ válido
}
