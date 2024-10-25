import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sexFormat',
})
export class SexFormatPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';
    if (value.toUpperCase() === 'M') return 'Masculino';
    if (value.toUpperCase() === 'F') return 'Feminino';
    return value;
  }
}
