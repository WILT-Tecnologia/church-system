import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  inject,
  Inject,
  OnInit,
  PLATFORM_ID,
  signal,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, DateSelectArg, EventApi, EventClickArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import timeGridPlugin from '@fullcalendar/timegrid';
import { ColumnComponent } from 'app/components/column/column.component';
import { ConfirmService } from 'app/components/confirm/confirm.service';
import { ActionsProps, ColumnDefinitionsProps } from 'app/components/crud/crud.component';
import { FormatsPipe } from 'app/components/crud/pipes/formats.pipe';
import { LoadingService } from 'app/components/loading/loading.service';
import { ModalService } from 'app/components/modal/modal.service';
import { CrudConfig, TabConfig, TabCrudComponent } from 'app/components/tab-crud/tab-crud.component';
import { MESSAGES } from 'app/components/toast/messages';
import { ToastService } from 'app/components/toast/toast.service';
import { EventCalls, Events } from 'app/model/Events';
import { EventTypes } from 'app/model/EventTypes';
import dayjs from 'dayjs';
import { Observable, of } from 'rxjs';
import { EventTypesService } from '../../administrative/eventTypes/eventTypes.service';
import { MembersComponent } from '../members/members.component';

import { EventsService } from './events.service';
import { EventsFormComponent } from './shared/events-form/events-form.component';

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss'],
  imports: [
    CommonModule,
    MatPaginatorModule,
    ColumnComponent,
    MatFormFieldModule,
    MatIconModule,
    MatTableModule,
    MatSortModule,
    MatButtonModule,
    MatInputModule,
    MatTooltipModule,
    MatDividerModule,
    MatRippleModule,
    MatMenuModule,
    FullCalendarModule,
    TabCrudComponent,
  ],
  providers: [FormatsPipe],
})
export class EventsComponent implements OnInit, AfterViewInit {
  breakpointObserver = inject(BreakpointObserver);
  events: Events[] = [];
  eventTypes: EventTypes[] = [];
  tabs: TabConfig[] = [];
  rendering: boolean = true;
  @ViewChild('calendar') calendarComponent!: FullCalendarComponent;
  @ViewChild('eventContent') eventContent!: TemplateRef<any>;
  actions: ActionsProps[] = [
    {
      type: 'person_add',
      tooltip: 'Adicionar membros',
      icon: 'person_add',
      label: 'Adicionar membros',
      action: (events: Events) => this.handleAddMembers(events),
    },
    {
      type: 'add_circle',
      tooltip: 'Nova chamada',
      icon: 'add_circle',
      label: 'Nova chamada',
      action: (events: Events) => this.handleAddMembers(events),
    },
    {
      type: 'edit',
      tooltip: 'Editar',
      icon: 'edit',
      label: 'Editar',
      action: (events: Events) => this.handleEdit(events),
    },
    {
      type: 'delete',
      tooltip: 'Excluir',
      icon: 'delete',
      label: 'Excluir',
      color: 'warn',
      action: (events: Events) => this.handleDelete(events),
    },
  ];
  columnDefinitions: ColumnDefinitionsProps[] = [
    { key: 'church.name', header: 'Igreja', type: 'string' },
    { key: 'event_type.name', header: 'Tipo do evento', type: 'string' },
    { key: 'name', header: 'Nome', type: 'string' },
    { key: 'obs', header: 'Observação', type: 'string' },
    /* { key: 'theme', header: 'Tema', type: 'string' },
    { key: 'start_date', header: 'Data início', type: 'date' },
    { key: 'start_time', header: 'Hora início', type: 'time' },
    { key: 'end_date', header: 'Data fim', type: 'date' },
    { key: 'end_time', header: 'Hora fim', type: 'time' }, */
    {
      key: 'combinedCreatedByAndCreatedAt',
      header: 'Criado em',
      type: 'string',
    },
    {
      key: 'combinedUpdatedByAndUpdatedAt',
      header: 'Atualizado em',
      type: 'string',
    },
  ];
  crudConfig!: CrudConfig;
  isMobile: boolean = false;
  currentEvents = signal<EventApi[]>([]);
  calendarVisible = signal(false);
  calendarOptions = signal<CalendarOptions>({
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
    initialDate: dayjs().format('YYYY-MM-DD'),
    locale: 'pt-br',
    initialView: 'dayGridMonth',
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
    select: this.handleDateSelect.bind(this),
    eventClick: this.handleRemoveEventCalendar.bind(this),
    eventsSet: this.handleEvents.bind(this),
    height: '70dvh',
    eventContent: this.eventContent,
  });

  constructor(
    private toast: ToastService,
    private loading: LoadingService,
    private confirmService: ConfirmService,
    private modal: ModalService,
    private eventsService: EventsService,
    private format: FormatsPipe,
    private cdr: ChangeDetectorRef,
    private eventTypesService: EventTypesService,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  ngOnInit() {
    this.loadEventTypes();
    this.loadEvents();
    this.breakpointObserver.observe([Breakpoints.Handset]).subscribe((result) => {
      this.isMobile = result.matches;
      this.updateCalendarOptions();
    });
    this.crudConfig = {
      columnDefinitions: this.columnDefinitions,
      actions: this.actions,
      addFn: this.handleCreate.bind(this),
      editFn: this.handleEdit.bind(this),
      deleteFn: this.handleDelete.bind(this),
      enableToggleStatus: true,
    };
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        if (this.calendarComponent && this.calendarComponent.getApi()) {
          const calendarApi = this.calendarComponent.getApi();
          calendarApi.render();
          calendarApi.updateSize();
        }
        const buttons = document.querySelectorAll('.fc-button');
        buttons.forEach((btn) => {
          btn.classList.add('mat-raised-button', 'mat-primary');
        });
        this.cdr.detectChanges();
      }, 0);
    }
  }

  loadEventTypes = () => {
    this.loading.show();
    this.eventTypesService.getEventTypes().subscribe({
      next: (eventTypes: EventTypes[]) => {
        this.eventTypes = eventTypes.filter((et) => et.status);
        this.tabs = this.eventTypes.map((et) => ({
          id: et.id,
          name: et.name,
          color: et.color,
        }));
        this.rendering = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.toast.openError(MESSAGES.LOADING_ERROR);
        this.loading.hide();
      },
      complete: () => this.loading.hide(),
    });
  };

  findEventsByTabIdAdapter = (tabId: string): Observable<Events[]> => {
    const eventType = this.eventTypes.find((et) => et.id === tabId);
    if (!eventType) {
      return of([]);
    }
    return this.eventsService.findByEventType(eventType);
  };

  updateCalendarOptions() {
    if (this.isMobile) {
      this.calendarOptions.update((options) => ({
        ...options,
        initialView: 'listWeek',
        height: 'auto',
      }));
    } else {
      this.calendarOptions.update((options) => ({
        ...options,
        initialView: 'dayGridMonth',
        height: '70dvh',
      }));
    }
  }

  showLoading = () => {
    this.loading.show();
  };

  hideLoading = () => {
    this.loading.hide();
  };

  handleEnableCalendar = () => {
    this.calendarVisible.update((calendarVisible) => !calendarVisible);
    setTimeout(() => {
      if (this.calendarVisible() && this.calendarComponent?.getApi()) {
        const calendarApi = this.calendarComponent.getApi();
        calendarApi.render();
        calendarApi.updateSize();
      }
      this.cdr.detectChanges();
    }, 0);
  };

  handleCalendarToggle = () => {
    this.calendarVisible.update((bool) => !bool);
    setTimeout(() => {
      if (this.calendarVisible() && this.calendarComponent?.getApi()) {
        this.calendarComponent.getApi().render();
      }
      this.cdr.detectChanges();
    }, 0);
  };

  handleWeekendsToggle = () => {
    this.calendarOptions.update((options) => ({
      ...options,
      weekends: !options.weekends,
    }));
    setTimeout(() => {
      if (this.calendarComponent?.getApi()) {
        this.calendarComponent.getApi().render();
      }
    }, 0);
  };

  handleDateSelect(selectInfo: DateSelectArg) {
    const modal = this.modal.openModal(`modal-${Math.random()}`, EventsFormComponent, 'Adicionar evento', true, true, {
      event: {
        start_date: dayjs(selectInfo.startStr).format('DD/MM/YYYY'),
        end_date: dayjs(selectInfo.endStr).format('DD/MM/YYYY'),
        allDay: selectInfo.allDay,
      },
    });

    modal.afterClosed().subscribe((result) => {
      if (result) {
        this.loadEvents();
      }
    });
  }

  handleRemoveEventCalendar(clickInfo: EventClickArg) {
    const event = this.events.find((e) => e.id === clickInfo.event.id);
    if (event) {
      this.handleDelete(event);
    }
  }

  handleEvents(events: EventApi[]) {
    this.currentEvents.set(events);
    this.cdr.detectChanges();
  }

  loadEvents = () => {
    this.showLoading();
    this.eventsService.findAll().subscribe({
      next: (events) => {
        this.events = events;

        const calendarEvents = this.events.map((event) => ({
          id: event.id ?? '',
          title: event.name,
          /* start: this.convertToISODate(event.start_date || dayjs().toDate(), event.start_time),
          end: this.convertToISODate(event.end_date || dayjs().toDate(), event.end_time),
          allDay: !(event.start_time || event.end_time),
          extendedProps: {
            event_type: event.event_type?.name || 'Não especificado',
            start_date: event.start_date || '',
            start_time: event.start_time || '',
            end_date: event.end_date || '',
            end_time: event.end_time || '',
            location: event.location || '',
            obs: event.obs || '',
          }, */
        }));

        this.calendarOptions.update((options) => ({
          ...options,
          events: calendarEvents,
        }));

        if (this.calendarComponent?.getApi()) {
          const calendarApi = this.calendarComponent.getApi();
          calendarApi.removeAllEvents();
          calendarApi.addEventSource(calendarEvents);
          if (this.calendarVisible()) {
            calendarApi.render();
            calendarApi.updateSize();
          }
        }

        this.rendering = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.hideLoading();
        this.toast.openError(MESSAGES.LOADING_ERROR);
      },
      complete: () => this.hideLoading(),
    });
  };

  handleCreate = () => {
    const modal = this.modal.openModal(`modal-${Math.random()}`, EventsFormComponent, 'Adicionar evento', true, true);

    modal.afterClosed().subscribe((result) => {
      if (result) {
        this.loadEvents();
      }
    });
  };

  handleAddMembers = (event: Events) => {
    this.modal.openModal(
      `modal-${Math.random()}`,
      MembersComponent,
      `Adicionar membros no evento ${event.name}`,
      true,
      true,
      { event },
      '',
      true,
    );
  };

  handleEdit = (event: Events) => {
    const modal = this.modal.openModal(
      `modal-${Math.random()}`,
      EventsFormComponent,
      `Editando o evento ${event.name}`,
      true,
      true,
      {
        event,
      },
    );

    modal.afterClosed().subscribe((result) => {
      if (result) {
        this.loadEvents();
      }
    });
  };

  handleDelete = (event: Events) => {
    this.confirmService
      .openConfirm('Excluir evento', `Tem certeza que deseja excluir o evento ${event.name}?`, 'Confirmar', 'Cancelar')
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          this.showLoading();
          this.eventsService.delete(event).subscribe({
            next: () => this.toast.openSuccess(MESSAGES.DELETE_SUCCESS),
            error: () => this.toast.openError(MESSAGES.DELETE_ERROR),
            complete: () => {
              this.loadEvents();
              this.hideLoading();
            },
          });
        }
      });
  };

  formatTooltip(event: any): string {
    const events: Events = event.extendedProps;
    const eventCalls: EventCalls = event.extendedProps;
    if (!events || !eventCalls) {
      this.toast.openError('Evento ou detalhes da chamada não encontrados');
      return 'Evento ou detalhes da chamada não encontrados';
    }

    if (!events.event_type) {
      this.toast.openError('Tipo de evento não encontrado');
      return 'Tipo de evento não especificado';
    }

    if (!eventCalls.start_date && !eventCalls.end_date) {
      this.toast.openError('Data de início e fim não especificadas');
      return 'Data de início e fim não especificadas';
    }
    const lines = [
      `Tipo: ${events.event_type}`,
      `Início: ${eventCalls.start_date ? this.format.dateFormat(eventCalls.start_date) : 'Não especificado'}${eventCalls.start_time ? ' às ' + eventCalls.start_time : ''}`,
      `Fim: ${eventCalls.end_date ? this.format.dateFormat(eventCalls.end_date) : 'Não especificado'}${eventCalls.end_time ? ' às ' + eventCalls.end_time : ''}`,
    ];
    if (eventCalls.location) {
      lines.push(`Local: ${eventCalls.location}`);
    }
    if (events.obs) {
      lines.push(`Observação: ${events.obs}`);
    }
    return lines.join('\n');
  }

  private convertToISODate = (dateInput: string | Date, timeInput?: string): string => {
    try {
      if (dateInput instanceof Date) {
        return timeInput ? dayjs(dateInput).format('YYYY-MM-DD') + `T${timeInput}:00Z` : dateInput.toISOString();
      }

      if (!dateInput) {
        console.warn('Data vazia, usando data atual');
        return dayjs().toISOString();
      }

      let parsedDate: dayjs.Dayjs;

      if (/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
        parsedDate = dayjs(dateInput, 'YYYY-MM-DD');
      } else if (/^\d{2}\/\d{2}\/\d{4}( \d{2}:\d{2})?$/.test(dateInput)) {
        parsedDate = dayjs(dateInput, ['DD/MM/YYYY', 'DD/MM/YYYY HH:mm']);
      } else {
        console.error('Formato de data não reconhecido:', dateInput);
        return dayjs().toISOString();
      }

      if (!parsedDate.isValid()) {
        console.error('Data inválida:', dateInput);
        return dayjs().toISOString();
      }

      if (timeInput) {
        const timeFormatted = timeInput.includes(':') ? timeInput : `${timeInput}:00`;
        return parsedDate.format('YYYY-MM-DD') + `T${timeFormatted}:00Z`;
      }

      return parsedDate.toISOString();
    } catch (error) {
      console.error('Erro ao converter data:', dateInput, error);
      return dayjs().toISOString();
    }
  };
}
