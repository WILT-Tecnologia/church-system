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
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  FullCalendarComponent,
  FullCalendarModule,
} from '@fullcalendar/angular';
import {
  CalendarOptions,
  DateSelectArg,
  EventApi,
  EventClickArg,
} from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import timeGridPlugin from '@fullcalendar/timegrid';
import { ColumnComponent } from 'app/components/column/column.component';
import { ConfirmService } from 'app/components/confirm/confirm.service';
import {
  ActionsProps,
  CrudComponent,
} from 'app/components/crud/crud.component';
import { LoadingService } from 'app/components/loading/loading.service';
import { ModalService } from 'app/components/modal/modal.service';
import { NotFoundRegisterComponent } from 'app/components/not-found-register/not-found-register.component';
import { MESSAGES } from 'app/components/toast/messages';
import { ToastService } from 'app/components/toast/toast.service';
import { createEventId } from 'app/mock/event-utils';
import { Events } from 'app/model/Events';
import { FormatsPipe } from 'app/pipes/formats.pipe';
import dayjs from 'dayjs';
import { EventsFormComponent } from './events-form/events-form.component';
import { EventsService } from './events.service';
import { GuestsComponent } from './shared/guests/guests.component';

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
    CrudComponent,
    NotFoundRegisterComponent,
    FullCalendarModule,
  ],
  providers: [FormatsPipe],
})
export class EventsComponent implements OnInit, AfterViewInit {
  breakpointObserver = inject(BreakpointObserver);
  events: Events[] = [];

  rendering: boolean = true;
  dataSourceMat = new MatTableDataSource<Events>(this.events);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('calendar') calendarComponent!: FullCalendarComponent;
  @ViewChild('eventContent') eventContent!: TemplateRef<any>;
  actions: ActionsProps[] = [
    {
      type: 'person',
      tooltip: 'Convidados',
      icon: 'groups',
      label: 'Convidados',
      action: (events: Events) => this.handleGuest(events),
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
      action: (events: Events) => this.handleDelete(events),
    },
  ];
  columnDefinitions = [
    { key: 'church.name', header: 'Igreja', type: 'string' },
    { key: 'event_type.name', header: 'Tipo do evento', type: 'string' },
    { key: 'name', header: 'Nome', type: 'string' },
    { key: 'theme', header: 'Tema', type: 'string' },
    { key: 'start_date', header: 'Data inicio', type: 'date' },
    { key: 'start_time', header: 'Hora inicio', type: 'time' },
    { key: 'end_date', header: 'Data fim', type: 'date' },
    { key: 'end_time', header: 'Hora fim', type: 'time' },
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
      today: 'Ir paga hoje',
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
    //select: this.handleDateSelect.bind(this),
    //eventClick: this.handleRemoveEventCalendar.bind(this),
    //eventsSet: this.handleEvents.bind(this),
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
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.breakpointObserver
      .observe([Breakpoints.Handset])
      .subscribe((result) => {
        this.isMobile = result.matches;
        this.updateCalendarOptions();
      });
    this.loadEvents();
  }

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
          // Se desejar, adicione classes adicionais ou remova classes padrão
        });
        this.cdr.detectChanges();
      }, 0);
    }
  }

  showLoading() {
    this.loading.show();
  }

  hideLoading() {
    this.loading.hide();
  }

  handleEnableCalendar = () => {
    this.calendarVisible.update((calendarVisible) => !calendarVisible);
    setTimeout(() => {
      if (this.calendarComponent?.getApi()) {
        this.calendarComponent.getApi().render();
      }
      this.cdr.detectChanges();
    }, 0);
  };

  handleCalendarToggle = () => {
    this.calendarVisible.update((bool) => !bool);
    // Ensure calendar renders after toggling visibility
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
    // Force re-render after updating options
    setTimeout(() => {
      if (this.calendarComponent?.getApi()) {
        this.calendarComponent.getApi().render();
      }
    }, 0);
  };

  handleDateSelect(selectInfo: DateSelectArg) {
    const title = prompt('Please enter a new title for your event');
    const calendarApi = selectInfo.view.calendar;

    calendarApi.unselect();

    if (title) {
      calendarApi.addEvent({
        id: createEventId(),
        title,
        start: selectInfo.startStr,
        end: selectInfo.endStr,
        allDay: selectInfo.allDay,
      });
    }
  }

  handleRemoveEventCalendar(clickInfo: EventClickArg) {
    clickInfo.event.remove();
  }

  handleEvents(events: EventApi[]) {
    this.currentEvents.set(events);
    this.cdr.detectChanges();
  }

  applyFilter = (event: Event): void => {
    const filterValue = (event.target as HTMLInputElement).value
      .trim()
      .toLowerCase();

    this.filterPredicate();

    this.dataSourceMat.filter = filterValue;

    if (this.dataSourceMat.paginator) {
      this.dataSourceMat.paginator.firstPage();
    }
  };

  private filterPredicate() {
    this.dataSourceMat.filterPredicate = (data: any, filter: string) => {
      return this.normalizedFilter(filter, data);
    };
  }

  private normalizedFilter(filter: any, data: any): boolean {
    const normalizedFilter = this.normalizeString(filter);
    return this.columnDefinitions.some((column) => {
      const value = this.format.getNestedValue(data, column.key);
      if (value !== null && value !== undefined) {
        const normalizedValue = this.normalizeString(value);
        return normalizedValue.includes(normalizedFilter);
      }
      return false;
    });
  }

  private normalizeString(value: any): string {
    return String(value)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  private convertToISODate(dateInput: string | Date): string {
    if (dateInput instanceof Date) {
      return dateInput.toISOString();
    }

    const [datePart, timePart] = dateInput.split(' ');
    const [day, month, year] = datePart.split('/');

    const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

    return timePart ? `${isoDate}T${timePart}` : isoDate;
  }

  loadEvents = () => {
    this.showLoading();
    this.eventsService.findAll().subscribe({
      next: (events) => {
        this.events = events.map((event) => ({
          ...event,
          combinedCreatedByAndCreatedAt: event.created_by?.name
            ? `${this.format.dateFormat(event.created_at)} por ${event.created_by?.name}`
            : '--',
          combinedUpdatedByAndUpdatedAt: event.updated_by?.name
            ? `${this.format.dateFormat(event.updated_at)} por ${event.updated_by?.name}`
            : '--',
        }));

        const calendarEvents = events.map((event) => ({
          id: event.id ?? '',
          title: event.name,
          start: this.convertToISODate(event.start_date || dayjs().toDate()),
          end: this.convertToISODate(event.end_date || dayjs().toDate()),
          allDay: true,
        }));

        this.calendarOptions.update((options) => ({
          ...options,
          events: calendarEvents,
        }));

        if (this.calendarComponent?.getApi()) {
          const calendarApi = this.calendarComponent.getApi();
          calendarApi.removeAllEvents();
          calendarApi.addEventSource(calendarEvents);
          calendarApi.render();
          calendarApi.updateSize();
        }

        this.dataSourceMat.data = [...this.events];
        this.dataSourceMat.sort = this.sort;
        this.dataSourceMat.paginator = this.paginator;
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

  handleGuest = (event: Events) => {
    this.modal.openModal(
      `modal-${Math.random()}`,
      GuestsComponent,
      `Convidados do evento ${event.event_type?.name}`,
      true,
      true,
      { event },
    );
  };

  handleCreate = () => {
    const modal = this.modal.openModal(
      `modal-${Math.random()}`,
      EventsFormComponent,
      'Adicionar evento',
      true,
      true,
    );

    modal.afterClosed().subscribe((result) => {
      if (result) {
        this.loadEvents();
      }
    });
  };

  handleEdit = (event: Events) => {
    const modal = this.modal.openModal(
      `modal-${Math.random()}`,
      EventsFormComponent,
      'Editar evento',
      true,
      true,
      { event },
    );

    modal.afterClosed().subscribe((result) => {
      if (result) {
        this.loadEvents();
      }
    });
  };

  handleDelete = (event: Events) => {
    this.confirmService
      .openConfirm(
        'Excluir evento',
        `Tem certeza que deseja excluir o evento ${event.name}?`,
        'Confirmar',
        'Cancelar',
      )
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
}
