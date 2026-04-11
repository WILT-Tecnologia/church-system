import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  signal,
  viewChild,
} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ColumnComponent } from '@app/components/column/column.component';
import { ConfirmService } from '@app/components/confirm/confirm.service';
import { FormatsPipe } from '@app/components/crud/pipes/formats.pipe';
import { ActionsProps, ColumnDefinitionsProps } from '@app/components/crud/types';
import { LoadingService } from '@app/components/loading/loading.service';
import { ModalAction } from '@app/components/modal/modal.component';
import { ModalService } from '@app/components/modal/modal.service';
import { CrudConfig, TabConfig } from '@app/components/tab-crud/types';
import { MESSAGES } from '@app/components/toast/messages';
import { ToastService } from '@app/components/toast/toast.service';
import { EventCall, Events } from '@app/model/Events';
import { EventTypes } from '@app/model/EventTypes';
import { AuthService } from '@app/services/auth/auth.service';
import { DateSelectArg, EventApi, EventClickArg } from '@fullcalendar/core';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { BehaviorSubject, forkJoin, map, Observable, Subject } from 'rxjs';
import { debounceTime, switchMap, takeUntil } from 'rxjs/operators';
import { EventTypesService } from '../../administrative/event-types/eventTypes.service';
import { EventsService } from './events.service';
import { AddMembersGuestsComponent } from './shared/add-members-guests/add-members-guests.component';
import { EventCalendarComponent } from './shared/event-calendar/event-calendar.component';
import { EventCallComponent } from './shared/event-call/event-call.component';
import { EventListComponent } from './shared/event-list/event-list.component';
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
    ColumnComponent,
    MatIconModule,
    MatButtonModule,
    EventCalendarComponent,
    EventListComponent,
  ],
  providers: [FormatsPipe],
})
export class EventsComponent implements OnInit, AfterViewInit, OnDestroy {
  private toast = inject(ToastService);
  private loading = inject(LoadingService);
  private confirmService = inject(ConfirmService);
  private modal = inject(ModalService);
  private eventsService = inject(EventsService);
  private format = inject(FormatsPipe);
  private cdr = inject(ChangeDetectorRef);
  private eventTypesService = inject(EventTypesService);
  private platformId = inject(PLATFORM_ID);
  private authService = inject(AuthService);
  private breakpointObserver = inject(BreakpointObserver);
  private destroy$ = new Subject<void>();
  private refreshSubject = new Subject<void>();
  private initialTabLoadSubject = new Subject<string>();

  events = signal<Events[]>([]);
  private events$ = toObservable(this.events);
  eventTypes = new BehaviorSubject<EventTypes[]>([]);
  tabs = signal<TabConfig[]>([]);
  calendarVisible = signal(true);
  isMobile = signal(false);
  rendering = signal(true);
  currentEvents = signal<EventApi[]>([]);
  mappedEvents = computed(() => this.mapEventsToCalendar(this.events()));
  calendarComponent = viewChild(EventCalendarComponent);
  public readonly writePermission = signal<string>('write_church_eventos');
  public readonly readPermission = signal<string>('read_church_eventos');
  public readonly deletePermission = signal<string>('delete_church_eventos');
  public readonly permissionAddMembersGuests = signal<string>('write_church_eventos');
  public readonly permissionCreateCall = signal<string>('write_church_eventos');
  public readonly permissionFrequency = signal<string>('write_church_eventos');
  public readonly hasWritePermission = computed(() =>
    this.authService.hasPermission(this.writePermission()),
  );
  public readonly hasReadPermission = computed(() =>
    this.authService.hasPermission(this.readPermission()),
  );
  public readonly hasDeletePermission = computed(() =>
    this.authService.hasPermission(this.deletePermission()),
  );
  public readonly hasPermissionAddMembersGuests = computed(() =>
    this.authService.hasPermission(this.permissionAddMembersGuests()),
  );
  public readonly hasPermissionCreateCall = computed(() =>
    this.authService.hasPermission(this.permissionCreateCall()),
  );
  public readonly hasPermissionFrequency = computed(() =>
    this.authService.hasPermission(this.permissionFrequency()),
  );

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
      color: 'inherit',
      action: (events: Events) => this.onEditEvent(events),
      visible: () => this.hasWritePermission(),
    },
    {
      type: 'person_add',
      icon: 'person_add',
      label: 'Adicionar participantes',
      color: 'inherit',
      action: (events: Events) => this.onAddMembersGuests(events),
      visible: () => this.hasPermissionAddMembersGuests(),
    },
    {
      type: 'add_circle',
      icon: 'add_circle',
      label: 'Chamadas do evento',
      color: 'inherit',
      action: (events: Events) => this.onCreateCall(events),
      visible: () => this.hasPermissionCreateCall(),
    },
    {
      type: 'add_circle',
      icon: 'add_circle',
      label: 'Frequências',
      color: 'inherit',
      action: (events: Events) => this.onFrequency(events),
      visible: () => this.hasPermissionFrequency(),
    },
    {
      type: 'delete',
      icon: 'delete',
      label: 'Excluir',
      color: 'warn',
      action: (events: Events) => this.onDeleteEvent(events),
      visible: () => this.hasDeletePermission(),
    },
  ];

  crudConfig: CrudConfig = {
    columnDefinitions: this.columnDefinitions,
    actions: this.actions,
    addFn: this.onCreateEvent.bind(this),
    editFn: this.onEditEvent.bind(this),
    deleteFn: this.onDeleteEvent.bind(this),
    enableToggleStatus: true,
    readPermission: 'read_church_eventos',
    writePermission: 'write_church_eventos',
    deletePermission: 'write_church_eventos',
  };

  constructor() {
    this.findEventsByTabIdAdapter = this.findEventsByTabIdAdapter.bind(this);
  }

  ngOnInit() {
    this.setupResponsiveness();
    this.loadEvents();

    this.refreshSubject
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.loadEvents());

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
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.refreshCalendarSize();
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupResponsiveness() {
    this.breakpointObserver
      .observe([Breakpoints.Handset])
      .pipe(debounceTime(100), takeUntil(this.destroy$))
      .subscribe((result) => {
        this.isMobile.set(result.matches);
        this.cdr.detectChanges();
      });
  }

  handleToggleView() {
    this.calendarVisible.update((v) => !v);
    if (this.calendarVisible()) {
      setTimeout(() => this.refreshCalendarSize(), 100);
    }
  }

  private refreshCalendarSize() {
    this.calendarComponent()?.getApi()?.updateSize();
  }

  loadEvents() {
    this.loading.show();
    this.rendering.set(true);
    forkJoin({
      events: this.eventsService.findAll(),
      eventTypes: this.eventTypesService.findAll(),
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ events, eventTypes }) => {
          const activeEventTypes = eventTypes.filter((et) => et.status);
          this.eventTypes.next(activeEventTypes);
          this.tabs.set(
            activeEventTypes.map((et) => ({
              id: et.id,
              name: et.name,
              color: et.color,
            })),
          );

          this.events.set(events);

          if (this.tabs().length > 0 && !this.calendarVisible()) {
            this.initialTabLoadSubject.next(this.tabs()[0].id);
          } else {
            this.rendering.set(false);
          }

          this.loading.hide();
          this.cdr.detectChanges();
        },
        error: () => {
          this.loading.hide();
          this.rendering.set(false);
          this.toast.openError(MESSAGES.LOADING_ERROR);
          this.cdr.detectChanges();
        },
      });
  }

  findEventsByTabIdAdapter(tabId: string): Observable<Events[]> {
    return this.events$.pipe(map((events) => events.filter((e) => e.eventType?.id === tabId)));
  }

  handleDateSelect(selectInfo: DateSelectArg) {
    this.openEventsFormModal('Adicionar evento', {
      event: {
        start_date: dayjs(selectInfo.startStr).format('DD/MM/YYYY'),
        end_date: dayjs(selectInfo.endStr).format('DD/MM/YYYY'),
      },
    }).subscribe((result: Events) => {
      if (result) {
        this.eventsService.createEvent(result).subscribe({
          next: (newEvent) => {
            this.toast.openSuccess(MESSAGES.CREATE_SUCCESS);
            this.events.update((current) => [newEvent, ...current]);
          },
          error: () => this.toast.openError(MESSAGES.CREATE_ERROR),
        });
      }
    });
  }

  handleEventClick(clickInfo: EventClickArg) {
    const event = this.events().find((e) => e.id === clickInfo.event.id);
    if (event) this.onEditEvent(event);
  }

  handleEventsSet(events: EventApi[]) {
    this.currentEvents.set(events);
  }

  onCreateEvent(eventTypeID?: string) {
    this.openEventsFormModal('Adicionar evento', { eventTypeID }).subscribe((result: Events) => {
      if (result) {
        this.eventsService.createEvent(result).subscribe({
          next: (newEvent) => {
            this.toast.openSuccess(MESSAGES.CREATE_SUCCESS);
            this.events.update((current) => [newEvent, ...current]);
          },
          error: () => this.toast.openError(MESSAGES.CREATE_ERROR),
        });
      }
    });
  }

  onEditEvent(event: Events) {
    this.openEventsFormModal(`Editando o evento ${event.name}`, { event }).subscribe(
      (data: Events) => {
        if (data) {
          this.eventsService.updateEvent(data).subscribe({
            next: (updatedEvent) => {
              this.toast.openSuccess(MESSAGES.UPDATE_SUCCESS);
              this.events.update((current) =>
                current.map((e) => (e.id === updatedEvent.id ? updatedEvent : e)),
              );
            },
            error: () => this.toast.openError(MESSAGES.UPDATE_ERROR),
          });
        }
      },
    );
  }

  onDeleteEvent(event: Events) {
    const modal = this.confirmService.openConfirm(
      'Exclusão de evento',
      `Tem certeza que deseja excluir o evento ${event.name}?`,
      'Confirmar',
      'Cancelar',
    );

    modal.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.eventsService.delete(event).subscribe({
          next: () => {
            this.toast.openSuccess(MESSAGES.DELETE_SUCCESS);
            this.events.update((current) => current.filter((e) => e.id !== event.id));
          },
          error: () => this.toast.openError(MESSAGES.DELETE_ERROR),
        });
      }
    });
  }

  onAddMembersGuests(event: Events) {
    const modal = this.modal.openModal(
      `modal-${Math.random()}`,
      AddMembersGuestsComponent,
      `Adicionar participantes no evento ${event?.name}`,
      true,
      true,
      { event },
      undefined,
      true,
      [],
    );

    modal.afterClosed().subscribe((data: Events) => {
      if (data) {
        this.eventsService.updateEvent(data).subscribe({
          next: (updatedEvent) => {
            this.toast.openSuccess(MESSAGES.UPDATE_SUCCESS);
            this.events.update((current) =>
              current.map((e) => (e.id === updatedEvent.id ? updatedEvent : e)),
            );
          },
          error: () => this.toast.openError(MESSAGES.UPDATE_ERROR),
        });
      }
    });
  }

  onCreateCall(event: Events) {
    const modal = this.modal.openModal(
      `modal-${Math.random()}`,
      EventCallComponent,
      `Chamadas do evento`,
      true,
      true,
      { event },
      undefined,
      true,
      [],
    );

    modal.afterClosed().subscribe((data: EventCall) => {
      if (data) {
        this.eventsService.updateEvent(data).subscribe({
          next: (updatedEvent) => {
            this.toast.openSuccess(MESSAGES.UPDATE_SUCCESS);
            this.events.update((current) =>
              current.map((e) => (e.id === updatedEvent.id ? updatedEvent : e)),
            );
          },
          error: () => this.toast.openError(MESSAGES.UPDATE_ERROR),
        });
      }
    });
  }

  onFrequency(event: Events) {
    const modal = this.modal.openModal(
      `modal-${Math.random()}`,
      FrequenciesComponent,
      `Frequências para o evento ${event.name}`,
      true,
      true,
      { event: event, call: event.eventCall },
      undefined,
      true,
      [],
    );

    modal.afterClosed().subscribe((data: Events) => {
      if (data) {
        this.eventsService.updateEvent(data).subscribe({
          next: (updatedEvent) => {
            this.toast.openSuccess(MESSAGES.UPDATE_SUCCESS);
            this.events.update((current) =>
              current.map((e) => (e.id === updatedEvent.id ? updatedEvent : e)),
            );
          },
          error: () => this.toast.openError(MESSAGES.UPDATE_ERROR),
        });
      }
    });
  }

  private openEventsFormModal(title: string, data?: any): Observable<Events> {
    const submitSubject = new Subject<void>();
    const formAction: ModalAction[] = [
      {
        label: 'Cancelar',
        type: 'stroked',
        color: 'warn',
        icon: 'close',
        onClick: (ref) => ref.close(),
      },
      {
        label: 'Salvar',
        type: 'flat',
        color: 'primary',
        icon: 'save',
        onClick: () => submitSubject.next(),
      },
    ];

    return this.modal
      .openModal(
        `modal-${Math.random()}`,
        EventsFormComponent,
        title,
        true,
        true,
        { ...data, submitSubject },
        undefined,
        false,
        formAction,
      )
      .afterClosed();
  }

  private mapEventsToCalendar(events: Events[]): any[] {
    return events.map((event) => {
      const eventCall = event.eventCall || null;
      return {
        id: event.id ?? '',
        title: event.name,
        start: eventCall?.start_date
          ? this.convertToISODate(eventCall.start_date, eventCall.start_time)
          : undefined,
        end: eventCall?.end_date
          ? this.convertToISODate(eventCall.end_date, eventCall.end_time)
          : undefined,
        extendedProps: {
          eventType: event.eventType,
          eventCall: eventCall || null,
          obs: event.obs,
          tooltip: this.formatTooltip({ event, eventCall }),
        },
      };
    });
  }

  private formatTooltip(data: { event: Events; eventCall: EventCall | null }): string {
    const { event, eventCall } = data;
    if (!event || !eventCall) return 'Evento não encontrado';

    const lines = [
      `Tipo: ${event.eventType?.name ?? 'Não especificado'}`,
      `Início: ${eventCall.start_date ? this.format.dateFormat(eventCall.start_date) : 'Não especificado'}${eventCall.start_time ? ' às ' + eventCall.start_time : ''}`,
      `Fim: ${eventCall.end_date ? this.format.dateFormat(eventCall.end_date) : 'Não especificado'}${eventCall.end_time ? ' às ' + eventCall.end_time : ''}`,
    ];
    if (eventCall.location) lines.push(`Local: ${eventCall.location}`);
    if (event.obs) lines.push(`Observação: ${event.obs}`);
    return lines.join('\n');
  }

  private convertToISODate(dateInput: string | Date, timeInput?: string): string {
    const parsedDate = dayjs(dateInput);
    if (!parsedDate.isValid()) return dayjs().toISOString();
    if (timeInput) {
      const timeFormatted = timeInput.includes(':') ? timeInput : `${timeInput}:00`;
      return parsedDate.format('YYYY-MM-DD') + `T${timeFormatted}:00Z`;
    }
    return parsedDate.toISOString();
  }
}
