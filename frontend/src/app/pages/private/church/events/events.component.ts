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
import { ColumnComponent } from 'app/components/column/column.component';
import { ConfirmService } from 'app/components/confirm/confirm.service';
import { FormatsPipe } from 'app/components/crud/pipes/formats.pipe';
import { ActionsProps, ColumnDefinitionsProps } from 'app/components/crud/types';
import { LoadingService } from 'app/components/loading/loading.service';
import { ModalService } from 'app/components/modal/modal.service';
import { TabCrudComponent } from 'app/components/tab-crud/tab-crud.component';
import { CrudConfig, TabConfig } from 'app/components/tab-crud/types';
import { MESSAGES } from 'app/components/toast/messages';
import { ToastService } from 'app/components/toast/toast.service';
import { CallToDay, Events } from 'app/model/Events';
import { EventTypes } from 'app/model/EventTypes';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

import { EventTypesService } from '../../administrative/event-types/eventTypes.service';
import { EventsService } from './events.service';
import { AddMembersGuestsComponent } from './shared/add-members-guests/add-members-guests.component';
import { CallToDayComponent } from './shared/call-to-day/call-to-day.component';
import { EventsFormComponent } from './shared/events-form/events-form.component';
import { MakeCallComponent } from './shared/make-call/make-call.component';

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

  @ViewChild('calendar', { static: false }) calendarComponent!: FullCalendarComponent;
  @ViewChild('eventContent') eventContent!: TemplateRef<any>;
  breakpointObserver = inject(BreakpointObserver);
  events: Events[] = [];
  callToDays: CallToDay[] = [];
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
      type: 'person_add',
      icon: 'person_add',
      label: 'Adicionar participantes',
      action: (events: Events) => this.addMembersGuest(events),
    },
    {
      type: 'add_circle',
      icon: 'add_circle',
      label: 'Chamadas do dia',
      action: (events: Events) => this.handleCreateCall(events),
    },
    {
      type: 'add_circle',
      icon: 'add_circle',
      label: 'Realizar chamada',
      action: (events: Events) => this.handleMakeCall(events),
    },
    {
      type: 'edit',
      icon: 'edit',
      label: 'Editar',
      action: (events: Events) => this.handleEdit(events),
    },
    {
      type: 'delete',
      icon: 'delete',
      label: 'Excluir',
      color: 'warn',
      action: (events: Events) => this.handleDelete(events),
    },
  ];
  crudConfig!: CrudConfig;
  isMobile: boolean = false;
  private destroy$ = new Subject<void>();
  private refreshSubject = new Subject<void>();
  private calendarToggleSubject = new Subject<void>();
  currentEvents = signal<EventApi[]>([]);
  calendarVisible = signal(false);
  calendarVisibleValue = this.calendarVisible.asReadonly();
  hoveredEventId: string | null = null;
  private eventCache = new Map<string, any>();
  rendering = signal(true);
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
              const callToDay = event.extendedProps.callToDay;
              if (!callToDay || !callToDay.start_date) return false;
              const start = dayjs(callToDay.start_date);
              const end = callToDay.end_date ? dayjs(callToDay.end_date) : start;
              return start.isSameOrAfter(fetchInfo.startStr) && end.isSameOrBefore(fetchInfo.endStr);
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
      addFn: this.handleCreate.bind(this),
      editFn: this.handleEdit.bind(this),
      deleteFn: this.handleDelete.bind(this),
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
          console.warn('Event type not found for tabId:', tabId);
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

  updateCalendarOptions() {
    this.calendarOptions.update((options) => ({
      ...options,
      ...(this.isMobile ? this.mobileCalendarOptions : this.desktopCalendarOptions),
    }));
  }

  refreshData() {
    this.refreshSubject.next();
  }

  private showLoading() {
    this.loading.show();
  }

  private hideLoading() {
    this.loading.hide();
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
      this.handleDelete(event);
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

      const callToDay = event.callToDay || null;
      const mapped = {
        id: event.id ?? '',
        title: event.name,
        start: callToDay?.start_date ? this.convertToISODate(callToDay.start_date, callToDay.start_time) : undefined,
        end: callToDay?.end_date ? this.convertToISODate(callToDay.end_date, callToDay.end_time) : undefined,
        extendedProps: {
          eventType: event.eventType,
          callToDay: callToDay || null,
          obs: event.obs,
          tooltip: this.formatTooltip({ event, callToDay }),
        },
      };
      this.eventCache.set(event.id ?? '', mapped);
      return mapped;
    });
  }

  private addMembersGuest(event: Events) {
    this.modal.openModal(
      `modal-${Math.random()}`,
      AddMembersGuestsComponent,
      `Adicionar membros no evento ${event.name}`,
      true,
      true,
      { event },
      '',
      true,
    );
  }

  private handleCreateCall(event: Events) {
    this.modal.openModal(
      `modal-${Math.random()}`,
      CallToDayComponent,
      `Criando a chamada do dia para o evento ${event?.name}`,
      true,
      true,
      { event },
      '',
      true,
    );
  }

  private handleMakeCall(event: Events) {
    this.modal.openModal(
      `modal-${Math.random()}`,
      MakeCallComponent,
      `Fazendo a chamada para o evento ${event.name}`,
      true,
      true,
      { event },
      '',
      true,
    );
  }

  handleCreate() {
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

  handleEdit(event: Events) {
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

  handleDelete(event: Events) {
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

  formatTooltip(data: { event: Events; callToDay: CallToDay | null }): string {
    const { event, callToDay } = data;
    if (!event || !callToDay) {
      return 'Evento ou detalhes da chamada não encontrados';
    }
    if (!event.eventType) {
      return 'Tipo de evento não especificado';
    }
    if (!callToDay.start_date && !callToDay.end_date) {
      return 'Data de início e fim não especificadas';
    }
    const lines = [
      `Tipo: ${event.eventType.name}`,
      `Início: ${callToDay.start_date ? this.format.dateFormat(callToDay.start_date) : 'Não especificado'}${callToDay.start_time ? ' às ' + callToDay.start_time : ''}`,
      `Fim: ${callToDay.end_date ? this.format.dateFormat(callToDay.end_date) : 'Não especificado'}${callToDay.end_time ? ' às ' + callToDay.end_time : ''}`,
    ];
    if (callToDay.location) {
      lines.push(`Local: ${callToDay.location}`);
    }
    if (event.obs) {
      lines.push(`Observação: ${event.obs}`);
    }
    return lines.join('\n');
  }

  isHovered(eventId: string): boolean {
    return this.hoveredEventId === eventId;
  }

  onEventHover(eventId: string) {
    this.hoveredEventId = eventId;
    this.cdr.detectChanges();
  }

  onEventLeave() {
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
