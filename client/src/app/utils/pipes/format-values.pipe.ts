import { Pipe, PipeTransform } from '@angular/core';
import { FormatsPipe } from './formats.pipe';

@Pipe({
  name: 'formatValues',
  standalone: true,
})
export class FormatValuesPipe implements PipeTransform {
  formats = new FormatsPipe();

  transform(data: any, key: string, type: string): string {
    const value = this.formats.getNestedValue(data, key);

    switch (type) {
      case 'date':
        return this.formats.dateFormat(value);
      case 'datetime':
        return this.formats.dateTimeFormat(value);
      case 'cpf':
        return this.formats.cpfFormat(value);
      case 'cnpj':
        return this.formats.cnpjFormat(value);
      case 'phone':
        return this.formats.phoneFormat(value);
      case 'sex':
        return this.formats.SexTransform(value);
      case 'boolean':
        return value ? 'Ativado' : 'Desativado';
      case 'string':
        return value || '';
      case 'number':
        return value !== undefined && value !== null ? value.toString() : '';
      default:
        return value !== undefined && value !== null ? value.toString() : '';
    }
  }
}
