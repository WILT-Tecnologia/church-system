import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { AsyncPipe, CommonModule, isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  inject,
  OnDestroy,
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
import { BehaviorSubject, forkJoin, Observable, of, Subject } from 'rxjs';
import { debounceTime, mergeWith, switchMap, takeUntil } from 'rxjs/operators';

import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, DateSelectArg, EventApi, EventClickArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

import { ColumnComponent } from 'app/components/column/column.component';
import { ConfirmService } from 'app/components/confirm/confirm.service';
import { FormatsPipe } from 'app/components/crud/pipes/formats.pipe';
import { ActionsProps, ColumnDefinitionsProps } from 'app/components/crud/types';
import { LoadingService } from 'app/components/loading/loading.service';
import { ModalService } from 'app/components/modal/modal.service';
import { NotFoundRegisterComponent } from 'app/components/not-found-register/not-found-register.component';
import { TabCrudComponent } from 'app/components/tab-crud/tab-crud.component';
import { CrudConfig, TabConfig } from 'app/components/tab-crud/types';
import { MESSAGES } from 'app/components/toast/messages';
import { ToastService } from 'app/components/toast/toast.service';
import { EventCall, Events } from 'app/model/Events';
import { EventTypes } from 'app/model/EventTypes';
import { AuthService } from 'app/services/auth/auth.service';
import { EventTypesService } from '../../administrative/event-types/eventTypes.service';
import { EventsService } from './events.service';
import { AddMembersGuestsComponent } from './shared/add-members-guests/add-members-guests.component';
import { EventCallComponent } from './shared/event-call/event-call.component';
import { EventsFormComponent } from './shared/events-form/events-form.component';
import { FrequenciesComponent } from './shared/frequencies/frequencies.component';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
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
    AsyncPipe,
    NotFoundRegisterComponent,
  ],
  providers: [FormatsPipe],
})
export class EventsComponent implements OnInit, AfterViewInit, OnDestroy {
  constructor(
    private toast: ToastService,
    private loading: LoadingService,
    private confirmService: ConfirmService,
    private modal: ModalService,
    private eventsService: EventsService,
    private format: FormatsPipe,
    private cdr: ChangeDetectorRef,
    private eventTypesService: EventTypesService,
    @Inject(PLATFORM_ID) private platformId: object,
  ) {
    this.findEventsByTabIdAdapter = this.findEventsByTabIdAdapter.bind(this);
  }

  private authService = inject(AuthService);

  @ViewChild('calendar', { static: false }) calendarComponent!: FullCalendarComponent;
  @ViewChild('eventContent') eventContent!: TemplateRef<any>;
  breakpointObserver = inject(BreakpointObserver);
  events: Events[] = [];
  eventCall: EventCall[] = [];
  eventTypes = new BehaviorSubject<EventTypes[]>([]);
  tabs: TabConfig[] = [];
  columnDefinitions: ColumnDefinitionsProps[] = [
    { key: 'church.name', header: 'Igreja', type: 'string' },
    { key: 'eventType.name', header: 'Tipo do evento', type: 'string' },
    { key: 'name', header: 'Nome', type: 'string' },
    { key: 'obs', header: 'Observação', type: 'string' },
  ];
  actions: ActionsProps[] = [
    {
      type: 'edit',
      icon: 'edit',
      label: 'Editar',
      action: (events: Events) => this.onEditEvent(events),
      visible: () => this.authService.hasPermission('write_church_eventos'),
    },
    {
      type: 'person_add',
      icon: 'person_add',
      label: 'Adicionar participantes',
      action: (events: Events) => this.onAddMembersGuests(events),
      visible: () => this.authService.hasPermission('write_church_eventos'),
    },
    {
      type: 'add_circle',
      icon: 'add_circle',
      label: 'Chamadas do evento',
      action: (events: Events) => this.onCreateCall(events),
      visible: () => this.authService.hasPermission('write_church_eventos'),
    },
    {
      type: 'add_circle',
      icon: 'add_circle',
      label: 'Frequências',
      action: (events: Events) => this.onFrequency(events),
      visible: () => this.authService.hasPermission('write_church_eventos'),
    },
    {
      type: 'delete',
      icon: 'delete',
      label: 'Excluir',
      color: 'warn',
      action: (events: Events) => this.onDeleteEvent(events),
      visible: () => this.authService.hasPermission('write_church_eventos'),
    },
  ];
  rendering = signal(true);
  crudConfig!: CrudConfig;
  isMobile: boolean = false;
  private destroy$ = new Subject<void>();
  private refreshSubject = new Subject<void>();
  private calendarToggleSubject = new Subject<void>();
  currentEvents = signal<EventApi[]>([]);
  calendarVisible = signal(true);
  calendarVisibleValue = this.calendarVisible.asReadonly();
  hoveredEventId: string | null = null;
  private eventCache = new Map<string, any>();
  private initialTabLoadSubject = new Subject<string>();
  private mobileCalendarOptions: CalendarOptions = {
    initialView: 'listWeek',
    height: 'auto',
  };
  private desktopCalendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    height: '70dvh',
  };
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
    eventContent: this.eventContent,
    events: (fetchInfo, successCallback, failureCallback) => {
      this.eventsService
        .findAll()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (events: Events[]) => {
            const calendarEvents = this.mapEvents(events).filter((event) => {
              const eventCall = event.extendedProps.eventCall;
              if (!eventCall || !eventCall.start_date) return false;
              const start = dayjs(eventCall.start_date);
              const end = eventCall.end_date ? dayjs(eventCall.end_date) : start;
              const fetchStart = dayjs(fetchInfo.startStr);
              const fetchEnd = dayjs(fetchInfo.endStr);
              // Verifica se há sobreposição entre o evento e o período visível
              return start.isBefore(fetchEnd) && end.isAfter(fetchStart);
            });
            successCallback(calendarEvents);
          },
          error: (err: Error) => failureCallback(err),
        });
    },
  });

  ngOnInit() {
    this.loadEvents();

    this.breakpointObserver
      .observe([Breakpoints.Handset])
      .pipe(debounceTime(100), takeUntil(this.destroy$))
      .subscribe((result) => {
        this.isMobile = result.matches;
        this.updateCalendarOptions();
        this.cdr.detectChanges();
      });

    this.calendarToggleSubject.pipe(debounceTime(100), takeUntil(this.destroy$)).subscribe(() => {
      if (this.calendarVisible() && this.calendarComponent?.getApi()) {
        const calendarApi = this.calendarComponent.getApi();
        calendarApi.render();
        calendarApi.updateSize();
      }
      this.cdr.detectChanges();
    });

    this.refreshSubject.pipe(debounceTime(300), takeUntil(this.destroy$)).subscribe(() => this.loadEvents());

    this.initialTabLoadSubject
      .pipe(
        switchMap((tabId) => this.findEventsByTabIdAdapter(tabId)),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: () => {
          this.rendering.set(false);
          this.cdr.detectChanges();
        },
        error: () => {
          this.rendering.set(false);
          this.toast.openError(MESSAGES.LOADING_ERROR);
          this.cdr.detectChanges();
        },
      });

    this.crudConfig = {
      columnDefinitions: this.columnDefinitions,
      actions: this.actions,
      addFn: this.onCreateEvent.bind(this),
      editFn: this.onEditEvent.bind(this),
      deleteFn: this.onDeleteEvent.bind(this),
      enableToggleStatus: true,
    };
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId) && this.calendarComponent?.getApi()) {
      const calendarApi = this.calendarComponent.getApi();
      calendarApi.render();
      calendarApi.updateSize();
      this.cdr.detectChanges();
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  findEventsByTabIdAdapter = (tabId: string): Observable<Events[]> => {
    return this.eventTypes.pipe(
      switchMap((eventTypes) => {
        const eventType = eventTypes.find((et) => et.id === tabId);
        if (!eventType) {
          return of([]);
        }
        return this.eventsService
          .findByEventType(eventType)
          .pipe(
            mergeWith(this.refreshSubject.pipe(switchMap(() => this.eventsService.findByEventType(eventType)))),
            takeUntil(this.destroy$),
          );
      }),
    );
  };

  formatTooltip(data: { event: Events; eventCall: EventCall | null }): string {
    const { event, eventCall } = data;
    if (!event || !eventCall) {
      return 'Evento ou detalhes da chamada não encontrados';
    }
    if (!event.eventType) {
      return 'Tipo de evento não especificado';
    }
    if (!eventCall.start_date && !eventCall.end_date) {
      return 'Data de início e fim não especificadas';
    }
    const lines = [
      `Tipo: ${event.eventType.name}`,
      `Início: ${eventCall.start_date ? this.format.dateFormat(eventCall.start_date) : 'Não especificado'}${eventCall.start_time ? ' às ' + eventCall.start_time : ''}`,
      `Fim: ${eventCall.end_date ? this.format.dateFormat(eventCall.end_date) : 'Não especificado'}${eventCall.end_time ? ' às ' + eventCall.end_time : ''}`,
    ];
    if (eventCall.location) {
      lines.push(`Local: ${eventCall.location}`);
    }
    if (event.obs) {
      lines.push(`Observação: ${event.obs}`);
    }
    return lines.join('\n');
  }

  handleEnableCalendar() {
    this.calendarVisible.update((calendarVisible) => !calendarVisible);
    this.calendarToggleSubject.next();
    if (this.calendarVisible() && this.calendarComponent?.getApi()) {
      const calendarApi = this.calendarComponent.getApi();
      const existingEventIds = new Set(calendarApi.getEvents().map((e) => e.id));
      const newEvents = this.mapEvents(this.events).filter((e) => !existingEventIds.has(e.id));
      newEvents.forEach((event) => calendarApi.addEvent(event));
      calendarApi.render();
      calendarApi.updateSize();
      this.cdr.detectChanges();
    }
  }

  onCreateEvent() {
    const modal = this.modal.openModal(`modal-${Math.random()}`, EventsFormComponent, 'Adicionar evento', true, true);
    modal
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        if (result) {
          this.loadEvents();
          this.refreshData();
        }
      });
  }

  private updateCalendarOptions() {
    this.calendarOptions.update((options) => ({
      ...options,
      ...(this.isMobile ? this.mobileCalendarOptions : this.desktopCalendarOptions),
    }));
  }

  private refreshData() {
    this.refreshSubject.next();
  }

  private showLoading() {
    this.loading.show();
  }

  private hideLoading() {
    this.loading.hide();
  }

  private handleWeekendsToggle() {
    this.calendarOptions.update((options) => ({
      ...options,
      weekends: !options.weekends,
    }));
    if (this.calendarComponent?.getApi()) {
      const calendarApi = this.calendarComponent.getApi();
      calendarApi.render();
      this.cdr.detectChanges();
    }
  }

  private handleDateSelect(selectInfo: DateSelectArg) {
    const modal = this.modal.openModal(`modal-${Math.random()}`, EventsFormComponent, 'Adicionar evento', true, true, {
      event: {
        start_date: dayjs(selectInfo.startStr).format('DD/MM/YYYY'),
        end_date: dayjs(selectInfo.endStr).format('DD/MM/YYYY'),
      },
    });

    modal
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        if (result) {
          this.loadEvents();
        }
      });
  }

  private handleRemoveEventCalendar(clickInfo: EventClickArg) {
    const event = this.events.find((e) => e.id === clickInfo.event.id);
    if (event) {
      this.onDeleteEvent(event);
    }
  }

  private handleEvents(events: EventApi[]) {
    this.currentEvents.set(events);
    this.cdr.detectChanges();
  }

  private loadEvents() {
    this.showLoading();
    this.rendering.set(true);
    forkJoin({
      events: this.eventsService.findAll(),
      eventTypes: this.eventTypesService.findAll(),
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ events, eventTypes }) => {
          this.eventTypes.next(eventTypes.filter((et) => et.status));
          this.tabs = eventTypes
            .filter((et) => et.status)
            .map((et) => ({
              id: et.id,
              name: et.name,
              color: et.color,
            }));

          this.events = events;

          if (this.tabs.length > 0 && !this.calendarVisible()) {
            this.initialTabLoadSubject.next(this.tabs[0].id);
          } else {
            this.rendering.set(false);
            this.cdr.detectChanges();
          }

          if (this.calendarVisible() && this.calendarComponent?.getApi()) {
            const calendarApi = this.calendarComponent.getApi();
            const existingEventIds = new Set(calendarApi.getEvents().map((e) => e.id));
            const newEvents = this.mapEvents(events).filter((e) => !existingEventIds.has(e.id));
            newEvents.forEach((event) => calendarApi.addEvent(event));
            calendarApi.render();
            calendarApi.updateSize();
          }
          this.cdr.detectChanges();
        },
        error: () => {
          this.hideLoading();
          this.rendering.set(false);
          this.toast.openError(MESSAGES.LOADING_ERROR);
          this.cdr.detectChanges();
        },
        complete: () => {
          this.hideLoading();
        },
      });
  }

  private mapEvents(events: Events[]): any[] {
    return events.map((event) => {
      if (this.eventCache.has(event.id ?? '')) {
        return this.eventCache.get(event.id ?? '');
      }

      const eventCall = event.eventCall || null;
      const mapped = {
        id: event.id ?? '',
        title: event.name,
        start: eventCall?.start_date ? this.convertToISODate(eventCall.start_date, eventCall.start_time) : undefined,
        end: eventCall?.end_date ? this.convertToISODate(eventCall.end_date, eventCall.end_time) : undefined,
        extendedProps: {
          eventType: event.eventType,
          eventCall: eventCall || null,
          obs: event.obs,
          tooltip: this.formatTooltip({ event, eventCall: eventCall }),
        },
      };
      this.eventCache.set(event.id ?? '', mapped);
      return mapped;
    });
  }

  private onAddMembersGuests(event: Events) {
    this.modal.openModal(
      `modal-${Math.random()}`,
      AddMembersGuestsComponent,
      `Adicionar participantes no evento ${event?.name}`,
      true,
      true,
      { event },
      '',
      true,
    );
  }

  private onCreateCall(event: Events) {
    this.modal.openModal(
      `modal-${Math.random()}`,
      EventCallComponent,
      `Chamadas do evento`,
      true,
      true,
      { event },
      '',
      true,
    );
  }

  private onFrequency(event: Events) {
    this.modal.openModal(
      `modal-${Math.random()}`,
      FrequenciesComponent,
      `Frequências para o evento ${event.name}`,
      true,
      true,
      { event: event, call: event.eventCall },
      '',
      true,
    );
  }

  private onEditEvent(event: Events) {
    const modal = this.modal.openModal(
      `modal-${Math.random()}`,
      EventsFormComponent,
      `Editando o evento ${event.name}`,
      true,
      true,
      { event },
    );
    modal
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        if (result) {
          this.loadEvents();
          this.refreshData();
        }
      });
  }

  private onDeleteEvent(event: Events) {
    this.confirmService
      .openConfirm('Excluir evento', `Tem certeza que deseja excluir o evento ${event.name}?`, 'Confirmar', 'Cancelar')
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        if (result) {
          this.showLoading();
          this.eventsService
            .delete(event)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: () => this.toast.openSuccess(MESSAGES.DELETE_SUCCESS),
              error: () => this.toast.openError(MESSAGES.DELETE_ERROR),
              complete: () => {
                this.loadEvents();
                this.hideLoading();
              },
            });
        }
      });
  }

  private isHovered(eventId: string): boolean {
    return this.hoveredEventId === eventId;
  }

  private onEventHover(eventId: string) {
    this.hoveredEventId = eventId;
    this.cdr.detectChanges();
  }

  private onEventLeave() {
    this.hoveredEventId = null;
    this.cdr.detectChanges();
  }

  private convertToISODate(dateInput: string | Date, timeInput?: string): string {
    try {
      const parsedDate = dayjs(dateInput);
      if (!parsedDate.isValid()) {
        return dayjs().toISOString();
      }
      if (timeInput) {
        const timeFormatted = timeInput.includes(':') ? timeInput : `${timeInput}:00`;
        return parsedDate.format('YYYY-MM-DD') + `T${timeFormatted}:00Z`;
      }
      return parsedDate.toISOString();
    } catch (error: any) {
      this.toast.openError(error);
      return dayjs().toISOString();
    }
  }
}
