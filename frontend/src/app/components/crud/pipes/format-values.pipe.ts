import { Pipe, PipeTransform } from '@angular/core';

import { FormatsPipe } from './formats.pipe';

@Pipe({
  name: 'formatValues',
  standalone: true,
})
export class FormatValuesPipe implements PipeTransform {
  constructor(private formats: FormatsPipe) {}

  transform(data: any, key: string, type: string): string {
    const value = this.formats.getNestedValue(data, key);

    switch (type) {
      case 'date':
        return this.formats.dateFormat(value);
      case 'datetime':
        return this.formats.dateTimeFormat(value);
      case 'time':
        return this.formats.formatTime(value) || '';
      case 'cpf':
        return this.formats.cpfFormat(value);
      case 'cnpj':
        return this.formats.cnpjFormat(value);
      case 'phone':
        return this.formats.phoneFormat(value);
      case 'color':
        if (value && /^#[0-9A-F]{6}$/i.test(value)) {
          return value; // Return valid hex color
        }
        return '';
      case 'sex':
        return this.formats.SexTransform(value, 'toView');
      case 'typeEntry':
        return this.formats.TypeEntryTransform(value, 'toView');
      case 'boolean':
        return value ? 'Ativado' : 'Desativado';
      case 'YesNo':
        return value ? 'Sim' : 'Não';
      case 'currency': {
        // Proteção contra valores inválidos
        if (value == null || value === '' || value === undefined) {
          return 'R$ 0,00';
        }

        // Converte para número com segurança
        const numericValue =
          typeof value === 'string' ? Number(value.replace(/\./g, '').replace(',', '.')) : Number(value);

        // Se ainda não for número válido → retorna traço ou zero
        if (isNaN(numericValue)) {
          return '--';
        }

        // Formata como moeda brasileira
        return numericValue.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
      }
      case 'string':
        return value || '';
      case 'number':
        return value !== undefined && value !== null ? value.toString() : '';
      default:
        return value !== undefined && value !== null ? value.toString() : '';
    }
  }
}
