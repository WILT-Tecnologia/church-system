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
import { CallToDay, Events } from 'app/model/Events';

import { CallToDayService } from './call-to-day.service';
import { CreateCallToDayComponent } from './shared/create-call-to-day/create-call-to-day.component';

@Component({
  selector: 'app-call-to-day',
  templateUrl: './call-to-day.component.html',
  styleUrl: './call-to-day.component.scss',
  imports: [CrudComponent, NotFoundRegisterComponent],
})
export class CallToDayComponent implements OnInit {
  constructor(
    private toast: ToastService,
    private loading: LoadingService,
    private confirmService: ConfirmService,
    private modal: ModalService,
    private callToDayService: CallToDayService,
    private cdr: ChangeDetectorRef,
    private dialogRef: MatDialogRef<CallToDayComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { event: Events },
  ) {}

  callToDay: CallToDay[] = [];
  dataSourceMat = new MatTableDataSource<CallToDay>(this.callToDay);
  columnDefinitions: ColumnDefinitionsProps[] = [
    { key: 'event.name', header: 'Igreja', type: 'string' },
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
      action: (callToDay: CallToDay) => this.onEdit(callToDay),
    },
    {
      type: 'delete',
      icon: 'delete',
      label: 'Excluir',
      color: 'warn',
      action: (callToDay: CallToDay) => this.onDelete(callToDay),
    },
  ];

  ngOnInit() {
    this.loadCallToDay();
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

  private loadCallToDay() {
    this.callToDayService.findAll(this.data?.event?.id).subscribe({
      next: (callToDay) => {
        this.callToDay = callToDay;
        this.dataSourceMat = new MatTableDataSource<CallToDay>(this.callToDay);
      },
      error: () => {
        this.loading.hide();
        this.onError(MESSAGES.LOADING_ERROR);
      },
      complete: () => this.loading.hide(),
    });
  }

  createCallToDay() {
    const modal = this.modal.openModal(
      `modal-${Math.random()}`,
      CreateCallToDayComponent,
      'Criar chamada do dia',
      true,
      true,
      {},
    );

    modal.afterClosed().subscribe((result) => {
      if (result) {
        this.loadCallToDay();
      }
    });
  }

  private onEdit(callToDay: CallToDay) {
    const modal = this.modal.openModal(
      `modal-${Math.random()}`,
      CreateCallToDayComponent,
      'Editar chamada do dia',
      true,
      true,
      { callToDay },
    );

    modal.afterClosed().subscribe((result) => {
      if (result) {
        this.loadCallToDay();
      }
    });
  }

  private onDelete(callToDay: CallToDay) {
    this.confirmService
      .openConfirm('Excluir a chamada do dia', 'Tem certeza que deseja excluir?', 'Confirmar', 'Cancelar')
      .afterClosed()
      .subscribe({
        next: () => {
          this.loading.show();
          this.callToDayService.delete(this.data.event.id, callToDay.id).subscribe({
            next: () => {
              this.loading.hide();
              this.toast.openSuccess('Evento excluido com sucesso!');
              this.loadCallToDay();
            },
            error: (error) => {
              this.loading.hide();
              this.toast.openError(error);
            },
          });
        },
      });
  }
}
