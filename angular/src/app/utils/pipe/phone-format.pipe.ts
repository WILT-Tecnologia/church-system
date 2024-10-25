import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'phoneFormat',
  standalone: true,
})
export class PhoneFormatPipe implements PipeTransform {
  transform(value: string | number): string {
    let phone = value.toString().replace(/\D/g, '');

    // Telefone com DDD (Brasil)
    if (phone.length === 11) {
      return `(${phone.slice(0, 2)}) ${phone.slice(2, 7)}-${phone.slice(7)}`;
    }

    // Telefone fixo com DDD (Brasil)
    if (phone.length === 10) {
      return `(${phone.slice(0, 2)}) ${phone.slice(2, 6)}-${phone.slice(6)}`;
    }

    // Telefone sem DDD
    if (phone.length === 8) {
      return `${phone.slice(0, 4)}-${phone.slice(4)}`;
    }

    // Número inválido
    return value.toString();
  }
}
