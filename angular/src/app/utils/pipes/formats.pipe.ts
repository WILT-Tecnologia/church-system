import { Pipe, PipeTransform } from '@angular/core';
import dayjs from 'dayjs';

@Pipe({
  name: 'formats',
  standalone: true,
})
export class FormatsPipe implements PipeTransform {
  transform(value: string): string {
    return value;
  }

  getNestedValue(data: any, key: string): any {
    return key.split('.').reduce((o, k) => (o ? o[k] : null), data);
  }

  cnpjFormat(value: string): string {
    if (!value) return '';
    const cnpj = value.replace(/\D+/g, '');
    return cnpj.replace(
      /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
      '$1.$2.$3/$4-$5',
    );
  }

  cpfFormat(value: string): string {
    if (!value) return '';
    const cpf = value.replace(/\D+/g, '');
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  dateTimeFormat(value: string): string {
    if (!value) return 'Não informado';

    const dateFormated = dayjs(value).format('DD/MM/YYYY [às] HH:mm:ss');

    return dayjs(value).isValid() ? dateFormated : 'Data inválida';
  }

  dateFormat(value: string): string {
    if (!value) return 'Não informado';

    let dateFormated = dayjs(value).format('DD/MM/YYYY');

    if (dayjs(value).isValid()) {
      return dateFormated;
    }

    const parts = value.split(/[-\/]/);
    if (parts.length === 3) {
      const [day, month, year] = parts;
      const reformattedValue = `${year}-${month}-${day}`;
      dateFormated = dayjs(reformattedValue).format('DD/MM/YYYY');

      if (dayjs(reformattedValue).isValid()) {
        return dateFormated;
      }
    }

    return 'Data inválida';
  }

  phoneFormat(value: string | number): string {
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

  SexTransform(value: string): string {
    if (!value) return '';
    if (value.toUpperCase() === 'M') return 'Masculino';
    if (value.toUpperCase() === 'F') return 'Feminino';
    return value;
  }
}
