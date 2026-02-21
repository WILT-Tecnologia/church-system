import { Pipe, PipeTransform } from '@angular/core';

import dayjs from 'dayjs';

@Pipe({
  name: 'formats',
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
    return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }

  cpfFormat(value: string): string {
    if (!value) return '';
    const cpf = value.replace(/\D+/g, '');
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  formatTime(time: any): string | null {
    if (!time) return null;

    if (typeof time === 'string' && time.includes('T')) {
      const [, timePart] = time.split('T');
      return timePart.slice(0, 5);
    }

    if (time instanceof Date) {
      const hours = String(time.getHours()).padStart(2, '0');
      const minutes = String(time.getMinutes()).padStart(2, '0');
      return `${hours}:${minutes}`;
    }

    if (typeof time === 'string') {
      return time.length === 5 ? time : null;
    }

    return null;
  }

  dateTimeFormat(value: string): string {
    if (!value) return '';

    const dateFormatted = dayjs(value).format('DD/MM/YYYY [às] HH:mm:ss');

    return dateFormatted && dayjs(value).isValid() ? dateFormatted : 'Data inválida';
  }

  dateFormat(value: string): string {
    if (!value) return '';

    const rawValue = value.endsWith('Z') ? value.slice(0, -1) : value;

    let dateFormated = dayjs(rawValue).format('DD/MM/YYYY');

    if (dayjs(rawValue).isValid()) {
      return dateFormated;
    }

    const parts = value.split(/[-/]/);

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
    if (!value) return '';
    const phone = value.toString().replace(/\D/g, '');

    if (phone.length === 11) {
      return `(${phone.slice(0, 2)}) ${phone.slice(2, 7)}-${phone.slice(7)}`;
    }

    if (phone.length === 10) {
      return `(${phone.slice(0, 2)}) ${phone.slice(2, 6)}-${phone.slice(6)}`;
    }

    if (phone.length === 8) {
      return `${phone.slice(0, 4)}-${phone.slice(4)}`;
    }

    return value ? value.toString() : '';
  }

  SexTransform(sex: string, direction: 'toView' | 'toModel'): string {
    if (direction === 'toView') {
      return sex === 'M' ? 'Masculino' : sex === 'F' ? 'Feminino' : sex;
    } else if (direction === 'toModel') {
      return sex === 'Masculino' ? 'M' : sex === 'Feminino' ? 'F' : sex;
    }
    return sex;
  }

  typeSupplierFormat(value: string): string {
    return value === 'PF' ? 'Pessoa Física' : value === 'PJ' ? 'Pessoa Jurídica' : value;
  }

  cpfCnpjFormat(value: string): string {
    if (!value) return '';
    const cleanValue = value.replace(/\D/g, '');
    if (cleanValue.length === 11) {
      return this.cpfFormat(cleanValue);
    } else if (cleanValue.length === 14) {
      return this.cnpjFormat(cleanValue);
    }
    return value;
  }
}
