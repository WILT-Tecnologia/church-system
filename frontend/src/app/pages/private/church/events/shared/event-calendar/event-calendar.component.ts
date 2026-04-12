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
import { MatIconModule } from '@angular/material/icon';
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
          <div
            class="event-card"
            [matTooltip]="arg.event.extendedProps['tooltip']"
            matTooltipClass="event-tooltip"
            matTooltipPosition="above"
            [style.borderLeftColor]="arg.event.extendedProps['eventType']?.color || '#3f51b5'"
          >
            <div class="event-header">
              <span class="event-title">{{ arg.event.title }}</span>
            </div>
            <div class="event-body">
              <div class="event-info" *ngIf="arg.event.extendedProps['theme']">
                <mat-icon>topic</mat-icon>
                <span>{{ arg.event.extendedProps['theme'] }}</span>
              </div>
              <div class="event-info" *ngIf="arg.event.extendedProps['location']">
                <mat-icon>place</mat-icon>
                <span>{{ arg.event.extendedProps['location'] }}</span>
              </div>
              <div class="event-info">
                <mat-icon>calendar_today</mat-icon>
                <span>
                  {{ arg.event.extendedProps['eventCall']?.start_date | date: 'dd/MM/yyyy' }} -
                  {{ arg.event.extendedProps['eventCall']?.end_date | date: 'dd/MM/yyyy' }}
                </span>
              </div>
              <div class="event-info time-info">
                <mat-icon>schedule</mat-icon>
                <span>
                  {{ arg.event.extendedProps['eventCall']?.start_time }} -
                  {{ arg.event.extendedProps['eventCall']?.end_time }}
                </span>
              </div>
            </div>
          </div>
        </ng-template>
      </full-calendar>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        --fc-border-color: #e0e0e0;
        --fc-button-bg-color: #ffffff;
        --fc-button-border-color: #e0e0e0;
        --fc-button-hover-bg-color: #f5f5f5;
        --fc-button-hover-border-color: #bdbdbd;
        --fc-button-active-bg-color: #eeeeee;
        --fc-button-active-border-color: #9e9e9e;
        --fc-today-bg-color: rgba(63, 81, 181, 0.04);
      }
      ::ng-deep {
        .fc .fc-button {
          text-transform: uppercase;
          font-size: 0.875rem;
          font-weight: 500;
          letter-spacing: 0.025em;
          border-radius: 4px;
          padding: 8px 16px;
          transition:
            background-color 0.2s,
            box-shadow 0.2s;
        }

        .fc .fc-button-primary:not(:disabled).fc-button-active,
        .fc .fc-button-primary:not(:disabled):active {
          background-color: #eeeeee;
          color: #3f51b5;
          border-color: #3f51b5;
        }

        .fc .fc-toolbar-title {
          font-size: 1.25rem;
          font-weight: 400;
          color: #212121;
        }

        .fc-theme-standard td,
        .fc-theme-standard th {
          border: 1px solid #f0f0f0;
        }

        .fc-col-header-cell {
          background-color: #fafafa;
          padding: 12px 0 !important;
        }

        .fc-col-header-cell-cushion {
          color: #757575;
          text-transform: uppercase;
          font-size: 0.75rem;
          font-weight: 600;
          text-decoration: none !important;
        }

        .fc-daygrid-day-number {
          color: #757575;
          font-size: 0.875rem;
          padding: 8px !important;
          text-decoration: none !important;
        }

        .fc-day-today {
          background-color: rgba(63, 81, 181, 0.05) !important;
        }

        .fc-day-today .fc-daygrid-day-number {
          color: #3f51b5;
          font-weight: bold;
        }

        /* Event Card Styles */
        .fc-event {
          background: transparent !important;
          border: none !important;
          padding: 0 !important;
          margin: 2px 4px !important;
        }

        .event-card {
          background: white;
          border-left: 4px solid var(--indigo-color);
          border-radius: 4px;
          padding: 6px 10px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
          color: #333;
          font-size: 0.75rem;
          overflow: hidden;
          transition:
            transform 0.2s,
            box-shadow 0.2s;
          cursor: pointer;
          width: 100%;
          border-right: 1px solid #f0f0f0;
          border-top: 1px solid #f0f0f0;
          border-bottom: 1px solid #f0f0f0;

          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 12px rgba(0, 0, 0, 0.12);
            z-index: 10;
          }
        }

        .event-title {
          display: block;
          white-space: normal;
          overflow: hidden;
          letter-spacing: 0.09em;
          text-transform: uppercase;
          font-weight: 600;
          line-height: 1.2;
        }

        .event-body {
          margin-top: 6px;
          border-top: 1px dashed #e0e0e0;
          padding-top: 6px;
          display: flex;
          flex-direction: column;
          gap: 4px;

          &:hover {
            color: var(--neutral-40);
          }
        }

        .event-info {
          display: flex;
          align-items: flex-start;
          gap: 6px;
          color: var(--neutral-50);
          font-size: 0.7rem;
          line-height: 1.2;

          &:hover {
            color: var(--text-color);
          }
        }

        .event-info span {
          white-space: normal;
          word-break: break-word;
        }

        .event-info mat-icon {
          font-size: 16px;
          width: 16px;
          height: 16px;
          color: var(--neutral-50);

          &:hover {
            color: var(--text-color);
          }
        }

        .time-info {
          font-weight: 600;
          color: var(--indigo-color);
          background-color: rgba(63, 81, 181, 0.08);
          padding: 0.4rem 0.6rem;
          border-radius: 0.4rem;
          margin-top: 0.4rem;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }

        .event-tooltip {
          text-align: justify !important;
          background-color: rgba(33, 33, 33, 0.9) !important;
          font-size: 12px !important;
          white-space: pre-line !important;
          padding: 0.2rem 0.2rem !important;
          border-radius: 0.4rem !important;
        }
      }
    `,
  ],
  imports: [CommonModule, FullCalendarModule, MatButtonModule, MatTooltipModule, MatIconModule],
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
    height: this.isMobile() ? 'auto' : '75dvh',
    locale: 'pt-br',
    weekends: true,
    editable: false,
    selectable: false,
    selectMirror: true,
    dayMaxEvents: 2,
    moreLinkText: 'Ver mais',
    moreLinkHint(num) {
      return `Ver mais ${num} eventos`;
    },
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
