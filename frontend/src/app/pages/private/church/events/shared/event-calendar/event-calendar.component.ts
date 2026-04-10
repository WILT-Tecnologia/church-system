import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  EventEmitter,
  input,
  Output,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, DateSelectArg, EventApi, EventClickArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import timeGridPlugin from '@fullcalendar/timegrid';

@Component({
  selector: 'app-event-calendar',
  template: `
    <div class="full-calendar-container mat-elevation-z3">
      <full-calendar #calendar [options]="calendarOptions()">
        <ng-template #eventContent let-arg>
          <button
            class="full-calendar-event"
            mat-flat-button
            type="button"
            color="primary"
            matTooltipClass="event-tooltip"
            matTooltipPosition="above"
            [matTooltip]="arg.event.extendedProps['tooltip']"
          >
            {{ arg.event.title }}
          </button>
        </ng-template>
      </full-calendar>
    </div>
  `,
  styles: [
    `
      .full-calendar-container {
        background: white;
        padding: 1rem;
        border-radius: 8px;
      }
      .full-calendar-event {
        width: 100%;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
        font-size: 0.8rem;
        padding: 0 4px !important;
        min-height: 24px !important;
        line-height: 24px !important;
      }
    `,
  ],
  imports: [CommonModule, FullCalendarModule, MatButtonModule, MatTooltipModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventCalendarComponent {
  @ViewChild('calendar') calendarComponent!: FullCalendarComponent;
  @ViewChild('eventContent', { static: true }) eventContentTemplate!: TemplateRef<any>;

  events = input<any[]>([]);
  isMobile = input<boolean>(false);

  @Output() dateSelect = new EventEmitter<DateSelectArg>();
  @Output() eventClick = new EventEmitter<EventClickArg>();
  @Output() eventsSet = new EventEmitter<EventApi[]>();

  calendarOptions = computed<CalendarOptions>(() => ({
    plugins: [interactionPlugin, dayGridPlugin, timeGridPlugin, listPlugin],
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
    },
    buttonText: {
      today: 'Ir para hoje',
      month: 'Mês',
      week: 'Semana',
      day: 'Dia',
      list: 'Lista',
    },
    buttonHints: {
      next: 'Próximo',
      prev: 'Anterior',
      month: 'Mês',
      day: 'Dia',
      week: 'Semana',
      today: 'Hoje',
      prevYear: 'Ano Anterior',
      nextYear: 'Próximo Ano',
    },
    initialView: this.isMobile() ? 'listWeek' : 'dayGridMonth',
    height: this.isMobile() ? 'auto' : '70dvh',
    locale: 'pt-br',
    weekends: true,
    editable: false,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    eventTimeFormat: {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    },
    events: this.events(),
    select: (info) => this.dateSelect.emit(info),
    eventClick: (info) => this.eventClick.emit(info),
    eventsSet: (events) => this.eventsSet.emit(events),
    eventContent: this.eventContentTemplate,
  }));

  getApi() {
    return this.calendarComponent?.getApi();
  }
}
