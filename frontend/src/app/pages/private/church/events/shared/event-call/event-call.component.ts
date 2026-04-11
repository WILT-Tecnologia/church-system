import { ChangeDetectorRef, Component, computed, inject, OnInit, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ConfirmService } from '@app/components/confirm/confirm.service';
import { CrudComponent } from '@app/components/crud/crud.component';
import { ActionsProps, ColumnDefinitionsProps } from '@app/components/crud/types';
import { LoadingService } from '@app/components/loading/loading.service';
import { ModalAction } from '@app/components/modal/modal.component';
import { ModalService } from '@app/components/modal/modal.service';
import { MESSAGES } from '@app/components/toast/messages';
import { ToastService } from '@app/components/toast/toast.service';
import { EventCall, Events } from '@app/model/Events';
import { AuthService } from '@app/services/auth/auth.service';
import { Observable, Subject } from 'rxjs';
import { EventCallService } from './event-call.service';
import { CreateEventCallComponent } from './shared/event-call-form/create-event-call.component';

@Component({
  selector: 'app-event-call',
  templateUrl: './event-call.component.html',
  styleUrl: './event-call.component.scss',
  imports: [CrudComponent],
})
export class EventCallComponent implements OnInit {
  private readonly toastService = inject(ToastService);
  private readonly authService = inject(AuthService);
  private readonly loadingService = inject(LoadingService);
  private readonly confirmService = inject(ConfirmService);
  private readonly modalService = inject(ModalService);
  private readonly eventCallService = inject(EventCallService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly dialogRef = inject(MatDialogRef<EventCallComponent>);
  private readonly data: { event: Events } = inject(MAT_DIALOG_DATA);
  private destroy$ = new Subject<void>();
  readonly writePermission = signal<string>('write_church_eventos');
  readonly deletePermission = signal<string>('delete_church_eventos');
  private readonly hasWritePermission = computed(() =>
    this.authService.hasPermission(this.writePermission()),
  );
  private readonly hasDeletePermission = computed(() =>
    this.authService.hasPermission(this.deletePermission()),
  );
  readonly eventCall = signal<EventCall[]>([]);
  dataSourceMat = new MatTableDataSource<EventCall>(this.eventCall());
  readonly columnDefinitions: ColumnDefinitionsProps[] = [
    { key: 'event.name', header: 'Evento', type: 'string' },
    { key: 'church.name', header: 'Igreja', type: 'string' },
    { key: 'theme', header: 'Tema', type: 'string' },
    { key: 'start_date', header: 'Data inicial', type: 'date' },
    { key: 'start_time', header: 'Hora inicial', type: 'time' },
    { key: 'end_date', header: 'Data final', type: 'date' },
    { key: 'end_time', header: 'Hora final', type: 'time' },
  ];
  actions: ActionsProps[] = [
    {
      type: 'edit',
      icon: 'edit',
      label: 'Editar',
      color: 'inherit',
      action: (eventCall: EventCall) => this.onEdit(eventCall),
      visible: () => this.hasWritePermission(),
    },
    {
      type: 'delete',
      icon: 'delete',
      label: 'Excluir',
      color: 'warn',
      action: (eventCall: EventCall) => this.onDelete(eventCall),
      visible: () => this.hasDeletePermission(),
    },
  ];

  ngOnInit() {
    this.loadEventCall();
  }

  private loadEventCall() {
    this.eventCallService.getAllEventCalls(this.data.event.id).subscribe({
      next: (eventCall) => {
        this.eventCall.set(eventCall);
        this.dataSourceMat.data = eventCall;
        this.cdr.detectChanges();
      },
      error: () => this.toastService.openError(MESSAGES.LOADING_ERROR),
      complete: () => this.loadingService.hide(),
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

    return this.modalService
      .openModal(
        `modal-${Math.random()}`,
        CreateEventCallComponent,
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

  onCreate() {
    this.openEventsFormModal('Criar chamada do evento', { event: this.data.event }).subscribe(
      (result) => {
        if (result) {
          this.eventCallService.createEventCall(this.data.event.id, result).subscribe({
            next: () => {
              this.toastService.openSuccess(MESSAGES.CREATE_SUCCESS);
              this.loadEventCall();
            },
            error: () => this.toastService.openError(MESSAGES.CREATE_ERROR),
            complete: () => this.loadingService.hide(),
          });
        }
      },
    );
  }

  private onEdit(eventCall: EventCall) {
    this.openEventsFormModal('Editar chamada do dia', {
      eventCall,
      event: this.data.event,
    }).subscribe((result) => {
      if (result) {
        this.eventCallService.updateEventCall(this.data.event.id, eventCall.id, result).subscribe({
          next: () => {
            this.toastService.openSuccess(MESSAGES.UPDATE_SUCCESS);
            this.loadEventCall();
          },
          error: () => this.toastService.openError(MESSAGES.UPDATE_ERROR),
          complete: () => this.loadingService.hide(),
        });
      }
    });
  }

  private onDelete(eventCall: EventCall) {
    const modal = this.confirmService.openConfirm(
      'Exclusão da chamada do dia',
      'Tem certeza que deseja excluir esta chamada?',
      'Confirmar',
      'Cancelar',
    );

    modal.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.eventCallService.deleteEventCall(this.data.event.id, eventCall.id).subscribe({
          next: () => {
            this.toastService.openSuccess(MESSAGES.DELETE_SUCCESS);
            this.loadEventCall();
          },
          error: () => this.toastService.openError(MESSAGES.DELETE_ERROR),
          complete: () => this.loadingService.hide(),
        });
      }
    });
  }
}
