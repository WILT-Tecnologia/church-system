import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { forkJoin } from 'rxjs';

import { ConfirmService } from 'app/components/confirm/confirm.service';
import { CrudComponent } from 'app/components/crud/crud.component';
import { ActionsProps, ColumnDefinitionsProps } from 'app/components/crud/types';
import { LoadingService } from 'app/components/loading/loading.service';
import { ModalService } from 'app/components/modal/modal.service';
import { NotFoundRegisterComponent } from 'app/components/not-found-register/not-found-register.component';
import { MESSAGES } from 'app/components/toast/messages';
import { ToastService } from 'app/components/toast/toast.service';
import { CallToDay, Events, MakeCall } from 'app/model/Events';

import { EventsService } from '../../events.service';
import { CallToDayService } from '../call-to-day/call-to-day.service';
import { MakeCallFormComponent } from './shared/make-call-form/make-call-form.component';

@Component({
  selector: 'app-make-call',
  templateUrl: './make-call.component.html',
  styleUrl: './make-call.component.scss',
  imports: [CrudComponent, NotFoundRegisterComponent],
})
export class MakeCallComponent implements OnInit {
  constructor(
    private toast: ToastService,
    private loading: LoadingService,
    private confirmService: ConfirmService,
    private eventsService: EventsService,
    private callToDayService: CallToDayService,
    private modal: ModalService,
    private cdr: ChangeDetectorRef,
    private dialogRef: MatDialogRef<MakeCallComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { event: Events },
  ) {}

  makeCall: MakeCall[] = [];
  event!: Events;
  callToDays!: CallToDay;
  dataSourceMat = new MatTableDataSource<MakeCall>(this.makeCall);
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
      action: (makeCall: MakeCall) => this.onEdit(makeCall),
    },
    {
      type: 'delete',
      icon: 'delete',
      label: 'Excluir',
      color: 'warn',
      action: (makeCall: MakeCall) => this.onDelete(makeCall),
    },
  ];

  ngOnInit() {
    this.loadData();
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

  private loadData() {
    forkJoin({
      event: this.eventsService.findById(this.data.event.id),
      callToDays: this.callToDayService.findById(this.data.event.id, ''),
    }).subscribe({
      next: ({ event, callToDays }) => {
        this.event = event;
        this.callToDays = callToDays;
        this.dataSourceMat = new MatTableDataSource<MakeCall>(this.makeCall);
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading.hide();
        this.toast.openError(MESSAGES.LOADING_ERROR);
      },
      complete: () => this.loading.hide(),
    });
  }

  createMakeCall() {
    const modal = this.modal.openModal(
      `modal-${Math.random()}`,
      MakeCallFormComponent,
      'Criar chamada do dia',
      true,
      true,
      { event: this.data.event },
    );

    modal.afterClosed().subscribe((result) => {
      if (result) {
        this.loadData();
      }
    });
  }

  private onEdit(makeCall: MakeCall) {
    const modal = this.modal.openModal(
      `modal-${Math.random()}`,
      MakeCallFormComponent,
      'Editar chamada do dia',
      true,
      true,
      { makeCall, event: this.data.event },
    );

    modal.afterClosed().subscribe((result) => {
      if (result) {
        this.loadData();
      }
    });
  }

  private onDelete(makeCall: MakeCall) {
    this.confirmService
      .openConfirm('Excluir a chamada do dia', 'Tem certeza que deseja excluir?', 'Confirmar', 'Cancelar')
      .afterClosed()
      .subscribe({
        next: (confirmed) => {
          if (confirmed) {
            const eventId = this.data?.event?.id;
            if (!eventId || !makeCall.id) {
              this.onError('Evento ou chamada não encontrada!');
              return;
            }
            this.loading.show();
            this.callToDayService.delete(eventId, makeCall.id).subscribe({
              next: () => {
                this.onSuccess('Chamada do dia excluída com sucesso!');
                this.loadData();
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
