import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';

import { ConfirmService } from 'app/components/confirm/confirm.service';
import { CrudComponent } from 'app/components/crud/crud.component';
import { ActionsProps, ColumnDefinitionsProps } from 'app/components/crud/types';
import { LoadingService } from 'app/components/loading/loading.service';
import { ModalService } from 'app/components/modal/modal.service';
import { NotFoundRegisterComponent } from 'app/components/not-found-register/not-found-register.component';
import { MESSAGES } from 'app/components/toast/messages';
import { ToastService } from 'app/components/toast/toast.service';
import { EventCall, Events } from 'app/model/Events';

import { EventCallService } from './event-call.service';
import { CreateEventCallComponent } from './shared/create-event-call/create-event-call.component';

@Component({
  selector: 'app-event-call',
  templateUrl: './event-call.component.html',
  styleUrl: './event-call.component.scss',
  imports: [CrudComponent, NotFoundRegisterComponent],
})
export class EventCallComponent implements OnInit {
  constructor(
    private toast: ToastService,
    private loading: LoadingService,
    private confirmService: ConfirmService,
    private modal: ModalService,
    private eventCallService: EventCallService,
    private cdr: ChangeDetectorRef,
    private dialogRef: MatDialogRef<EventCallComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { event: Events },
  ) {}

  eventCall: EventCall[] = [];
  dataSourceMat = new MatTableDataSource<EventCall>(this.eventCall);
  columnDefinitions: ColumnDefinitionsProps[] = [
    { key: 'event.name', header: 'Evento', type: 'string' },
    { key: 'church.name', header: 'Igreja', type: 'string' },
    { key: 'theme', header: 'Tema', type: 'string' },
    { key: 'start_date', header: 'Data inicial', type: 'date' },
    { key: 'start_time', header: 'Hora inicial', type: 'hour' },
    { key: 'end_date', header: 'Data final', type: 'date' },
    { key: 'end_time', header: 'Hora final', type: 'hour' },
  ];
  actions: ActionsProps[] = [
    {
      type: 'edit',
      icon: 'edit',
      label: 'Editar',
      action: (eventCall: EventCall) => this.onEdit(eventCall),
    },
    {
      type: 'delete',
      icon: 'delete',
      label: 'Excluir',
      color: 'warn',
      action: (eventCall: EventCall) => this.onDelete(eventCall),
    },
  ];

  ngOnInit() {
    this.loadEventCall();
  }

  private onError(message: string) {
    this.loading.hide();
    this.toast.openError(message);
    this.cdr.detectChanges();
  }

  private onSuccess(message: string) {
    this.loading.hide();
    this.toast.openSuccess(message);
    this.cdr.detectChanges();
  }

  private loadEventCall() {
    this.eventCallService.findAll(this.data?.event?.id).subscribe({
      next: (eventCall) => {
        this.eventCall = eventCall;
        this.dataSourceMat = new MatTableDataSource<EventCall>(this.eventCall);
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading.hide();
        this.onError(MESSAGES.LOADING_ERROR);
      },
      complete: () => this.loading.hide(),
    });
  }

  createEventCall() {
    const modal = this.modal.openModal(
      `modal-${Math.random()}`,
      CreateEventCallComponent,
      'Criar chamada do evento',
      true,
      true,
      { event: this.data.event },
    );

    modal.afterClosed().subscribe((result) => {
      if (result) {
        this.loadEventCall();
      }
    });
  }

  private onEdit(eventCall: EventCall) {
    const modal = this.modal.openModal(
      `modal-${Math.random()}`,
      CreateEventCallComponent,
      'Editar chamada do dia',
      true,
      true,
      { eventCall, event: this.data.event },
    );

    modal.afterClosed().subscribe((result) => {
      if (result) {
        this.loadEventCall();
      }
    });
  }

  private onDelete(eventCall: EventCall) {
    this.confirmService
      .openConfirm('Excluir a chamada do dia', 'Tem certeza que deseja excluir?', 'Confirmar', 'Cancelar')
      .afterClosed()
      .subscribe({
        next: (confirmed) => {
          if (confirmed) {
            const eventId = this.data?.event?.id;
            if (!eventId || !eventCall.id) {
              this.onError('Evento ou chamada não encontrada!');
              return;
            }
            this.loading.show();
            this.eventCallService.delete(eventId, eventCall.id).subscribe({
              next: () => {
                this.onSuccess('Chamada do dia excluída com sucesso!');
                this.loadEventCall();
              },
              error: (error) => {
                this.onError(error?.error?.error || MESSAGES.DELETE_ERROR);
              },
            });
          }
        },
      });
  }
}
