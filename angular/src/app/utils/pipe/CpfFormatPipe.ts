import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'cpfFormat',
})
export class CpfFormatPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';
    const cpf = value.replace(/\D+/g, '');
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
}
