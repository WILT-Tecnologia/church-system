import { Component, inject, OnInit, signal } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';

import { ConfirmService } from 'app/components/confirm/confirm.service';
import { CrudComponent } from 'app/components/crud/crud.component';
import { ActionsProps, ColumnDefinitionsProps } from 'app/components/crud/types';
import { LoadingService } from 'app/components/loading/loading.service';
import { ModalAction } from 'app/components/modal/modal.component';
import { ModalService } from 'app/components/modal/modal.service';
import { MESSAGES } from 'app/components/toast/messages';
import { ToastService } from 'app/components/toast/toast.service';
import { EventTypes } from 'app/model/EventTypes';
import { AuthService } from 'app/services/auth/auth.service';
import { Subject } from 'rxjs';
import { EventTypeComponent } from './event-type/event-type.component';
import { EventTypesService } from './eventTypes.service';

@Component({
  selector: 'app-event-types',
  templateUrl: './event-types.component.html',
  styleUrls: ['./event-types.component.scss'],
  imports: [CrudComponent],
})
export class EventTypesComponent implements OnInit {
  private toastService = inject(ToastService);
  private loadingService = inject(LoadingService);
  private confirmService = inject(ConfirmService);
  private modalService = inject(ModalService);
  private eventTypesService = inject(EventTypesService);
  private authService = inject(AuthService);
  private writePermission = this.authService.hasPermission('write_administrative_tipos_de_eventos');
  private deletePermission = this.authService.hasPermission('delete_administrative_tipos_de_eventos');

  eventTypes = signal<EventTypes[]>([]);
  dataSourceMat = new MatTableDataSource<EventTypes>([]);
  columnDefinitions: ColumnDefinitionsProps[] = [
    { key: 'status', header: 'Status', type: 'boolean' },
    { key: 'name', header: 'Nome', type: 'string' },
    { key: 'color', header: 'Cor', type: 'color' },
    { key: 'description', header: 'Descrição', type: 'string' },
    { key: 'updated_at', header: 'Última Atualização', type: 'datetime' },
  ];
  actions: ActionsProps[] = [
    {
      type: 'toggle',
      activeLabel: 'Ativar',
      inactiveLabel: 'Desativar',
      action: (eventType: EventTypes) => this.onChangeStatus(eventType),
    },
    {
      type: 'edit',
      icon: 'edit',
      label: 'Editar',
      color: 'inherit',
      action: (eventType: EventTypes) => this.onEdit(eventType),
      visible: () => this.writePermission,
    },
    {
      type: 'delete',
      icon: 'delete',
      label: 'Excluir',
      color: 'warn',
      action: (eventType: EventTypes) => this.onDelete(eventType),
      visible: () => this.deletePermission,
    },
  ];

  ngOnInit() {
    this.loadEventTypes();
  }

  private loadEventTypes() {
    this.eventTypesService.findAll().subscribe({
      next: (eventTypesResp) => {
        this.eventTypes.set(eventTypesResp);
        this.dataSourceMat.data = eventTypesResp;
      },
      error: () => this.toastService.openError(MESSAGES.LOADING_ERROR),
      complete: () => this.loadingService.hide(),
    });
  }

  onCreate() {
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

    const modal = this.modalService.openModal(
      `modal-${Math.random()}`,
      EventTypeComponent,
      'Adicionando tipo de evento',
      true,
      true,
      { submitSubject },
      undefined,
      false,
      formAction,
    );

    modal.afterClosed().subscribe((newEventType) => {
      if (newEventType) {
        this.eventTypesService.create(newEventType).subscribe({
          next: () => this.toastService.openSuccess(MESSAGES.CREATE_SUCCESS),
          error: () => this.toastService.openError(MESSAGES.CREATE_ERROR),
          complete: () => this.loadEventTypes(),
        });
      }
    });
  }

  private onEdit(eventType: EventTypes) {
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
        label: 'Atualizar',
        type: 'flat',
        color: 'primary',
        icon: 'save',
        onClick: () => submitSubject.next(),
      },
    ];

    const modal = this.modalService.openModal(
      `modal-${Math.random()}`,
      EventTypeComponent,
      `Editando o tipo de evento: ${eventType.name}`,
      true,
      true,
      { eventType, submitSubject },
      undefined,
      false,
      formAction,
    );

    modal.afterClosed().subscribe((newEventType) => {
      if (newEventType) {
        this.eventTypesService.update(newEventType).subscribe({
          next: () => this.toastService.openSuccess(MESSAGES.UPDATE_SUCCESS),
          error: () => this.toastService.openError(MESSAGES.UPDATE_ERROR),
          complete: () => this.loadEventTypes(),
        });
      }
    });
  }

  private onDelete(eventType: EventTypes) {
    const modal = this.confirmService.openConfirm(
      'Atenção!',
      'Tem certeza que deseja excluir este tipo de evento?',
      'Confirmar',
      'Cancelar',
    );

    modal.afterClosed().subscribe((result) => {
      if (result) {
        this.eventTypesService.delete(eventType).subscribe({
          next: () => this.toastService.openSuccess(MESSAGES.DELETE_SUCCESS),
          error: () => this.toastService.openError(MESSAGES.DELETE_ERROR),
          complete: () => this.loadEventTypes(),
        });
      }
    });
  }

  onChangeStatus(eventType: EventTypes) {
    const updatedStatus = !eventType.status;
    eventType.status = updatedStatus;

    this.eventTypesService.updatedStatus(eventType).subscribe({
      next: () =>
        this.toastService.openSuccess(`Tipo de evento ${updatedStatus ? 'ativado' : 'desativado'} com sucesso!`),
      error: () => this.toastService.openError(MESSAGES.UPDATE_ERROR),
      complete: () => this.loadEventTypes(),
    });
  }
}
