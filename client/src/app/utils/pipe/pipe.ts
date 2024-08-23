import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'format',
})
export class FormatPipe implements PipeTransform {
  transform(value: any, format: string): string {
    switch (format) {
      case 'cpf':
        if (!value) return '';
        const cpf = value.replace(/\D+/g, '');
        return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
      case 'birthDate':
        if (!value) return '';
        // Desestrutura a data vinda no formato yyyy-mm-dd
        const [year, month, day] = value.split('-').map(Number);
        // Cria um novo objeto Date sem considerar o fuso horário
        const localDate = new Date(year, month - 1, day); // Mês é zero-indexado em JS
        return localDate.toLocaleDateString('pt-BR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        });
      case 'sex':
        if (!value) return '';
        return value === 'M'
          ? 'Masculino'
          : value === 'F'
          ? 'Feminino'
          : 'Outro';
      default:
        return value;
    }
  }
}
