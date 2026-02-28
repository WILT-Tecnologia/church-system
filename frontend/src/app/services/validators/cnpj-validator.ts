import { AbstractControl, ValidationErrors } from '@angular/forms';

export function cnpjValidator(control: AbstractControl): ValidationErrors | null {
  const cnpj = control.value;

  if (!cnpj) {
    return null;
  }

  const cleanedCnpj = String(cnpj).replace(/[^\d]+/g, '');

  if (cleanedCnpj.length !== 14) {
    return { invalidCnpjLength: true };
  }

  if (/^(.)\1+$/.test(cleanedCnpj)) {
    return { invalidCnpjSequence: true };
  }

  const calcDigit = (tamanho: number): number => {
    let soma = 0;
    let pos = tamanho - 7;
    for (let i = tamanho; i >= 1; i--) {
      soma += parseInt(cleanedCnpj.charAt(tamanho - i), 10) * pos--;
      if (pos < 2) pos = 9;
    }
    return soma % 11 < 2 ? 0 : 11 - (soma % 11);
  };

  const resultado1 = calcDigit(12);
  if (resultado1.toString() !== cleanedCnpj.charAt(12)) {
    return { invalidCnpj: true };
  }

  const resultado2 = calcDigit(13);
  if (resultado2.toString() !== cleanedCnpj.charAt(13)) {
    return { invalidCnpj: true };
  }

  return null; // CNPJ válido
}
