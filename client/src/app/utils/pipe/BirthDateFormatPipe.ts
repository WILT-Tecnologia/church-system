import { Pipe, PipeTransform } from '@angular/core';
import dayjs from 'dayjs';

@Pipe({
  name: 'dateFormat',
})
export class DateFormatPipe implements PipeTransform {
  transform(value: string): string {
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
}
