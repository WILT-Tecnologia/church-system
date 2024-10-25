import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'cnpjFormat',
})
export class CnpjFormatPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';
    const cnpj = value.replace(/\D+/g, '');
    return cnpj.replace(
      /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
      '$1.$2.$3/$4-$5'
    );
  }
}
