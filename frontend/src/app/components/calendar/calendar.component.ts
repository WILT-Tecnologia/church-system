import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';

interface CalendarDay {
  date: Date;
  day: number;
  currentMonth: boolean;
  selected: boolean;
  isToday: boolean;
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss',
  imports: [MatButtonModule, MatIconModule, CommonModule, MatRippleModule],
})
export class CalendarComponent {
  currentDate: Date = new Date(); // Data para exibir o mês atual
  selectedDate: Date = new Date(); // Data selecionada
  weeks: CalendarDay[][] = [];
  readonly monthNames: string[] = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ];
  readonly dayNames: string[] = [
    'Dom',
    'Seg',
    'Ter',
    'Qua',
    'Qui',
    'Sex',
    'Sáb',
  ];

  ngOnInit(): void {
    this.generateCalendar();
  }

  generateCalendar(): void {
    this.weeks = [];

    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    // Primeiro e último dia do mês
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    // Define a data de início (primeiro dia exibido no calendário – início da semana do primeiro dia do mês)
    const startDate = new Date(firstDayOfMonth);
    startDate.setDate(firstDayOfMonth.getDate() - firstDayOfMonth.getDay());

    // Define a data de fim (último dia exibido no calendário – fim da semana do último dia do mês)
    const endDate = new Date(lastDayOfMonth);
    endDate.setDate(lastDayOfMonth.getDate() + (6 - lastDayOfMonth.getDay()));

    let date = new Date(startDate);
    while (date <= endDate) {
      const week: CalendarDay[] = [];
      for (let i = 0; i < 7; i++) {
        const day: CalendarDay = {
          date: new Date(date),
          day: date.getDate(),
          currentMonth: date.getMonth() === month,
          selected: this.isSameDate(date, this.selectedDate),
          isToday: this.isSameDate(date, new Date()),
        };
        week.push(day);
        date.setDate(date.getDate() + 1);
      }
      this.weeks.push(week);
    }
  }

  // Compara duas datas ignorando horas
  isSameDate(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  // Seleciona um dia do calendário
  selectDate(day: CalendarDay): void {
    this.selectedDate = new Date(day.date);
    this.generateCalendar();
  }

  // Navega para o mês anterior
  previousMonth(): void {
    this.currentDate = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth() - 1,
      1,
    );
    this.generateCalendar();
  }

  // Navega para o próximo mês
  nextMonth(): void {
    this.currentDate = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth() + 1,
      1,
    );
    this.generateCalendar();
  }

  // Volta para o mês/ano atuais e seleciona o dia atual
  goToToday(): void {
    this.currentDate = new Date();
    this.selectedDate = new Date();
    this.generateCalendar();
  }
}
