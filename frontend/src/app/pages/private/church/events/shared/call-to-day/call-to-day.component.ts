import { ChangeDetectorRef, Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';

import { ConfirmService } from 'app/components/confirm/confirm.service';
import { ActionsProps, ColumnDefinitionsProps, CrudComponent } from 'app/components/crud/crud.component';
import { LoadingService } from 'app/components/loading/loading.service';
import { ModalService } from 'app/components/modal/modal.service';
import { NotFoundRegisterComponent } from 'app/components/not-found-register/not-found-register.component';
import { ToastService } from 'app/components/toast/toast.service';
import { CallToDay } from 'app/model/Events';

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
    @Inject(PLATFORM_ID) private platformId: object,
  ) {}

  callToDay: CallToDay[] = [];
  dataSourceMat = new MatTableDataSource<CallToDay>(this.callToDay);
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
  columnDefinitions: ColumnDefinitionsProps[] = [
    { key: 'event.name', header: 'Igreja', type: 'string' },
    { key: 'start_date', header: 'Data inicial', type: 'date' },
    { key: 'start_time', header: 'Hora inicial', type: 'hour' },
    { key: 'end_date', header: 'Data final', type: 'date' },
    { key: 'end_time', header: 'Hora final', type: 'hour' },
  ];

  ngOnInit() {
    this.loadCallToDay();
  }

  private loadCallToDay() {
    this.callToDayService.findAll().subscribe({
      next: (callToDay) => {
        this.callToDay = callToDay;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.loading.hide();
        this.toast.openError(error);
      },
      complete: () => this.loading.hide(),
    });
  }

  onCreate() {
    const modal = this.modal.openModal(
      `modal-${Math.random()}`,
      CreateCallToDayComponent,
      'Criar chamada do dia',
      true,
      true,
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
      {
        callToDay,
      },
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
          this.callToDayService.delete(callToDay.id).subscribe({
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
