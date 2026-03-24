import { Component, inject, OnInit, signal } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';

import { ConfirmService } from 'app/components/confirm/confirm.service';
import { CrudComponent } from 'app/components/crud/crud.component';
import { ActionsProps, ColumnDefinitionsProps } from 'app/components/crud/types';
import { LoadingService } from 'app/components/loading/loading.service';
import { ModalService } from 'app/components/modal/modal.service';
import { MESSAGES } from 'app/components/toast/messages';
import { ToastService } from 'app/components/toast/toast.service';
import { EventTypes } from 'app/model/EventTypes';
import { AuthService } from 'app/services/auth/auth.service';
import { EventTypeComponent } from './event-type/event-type.component';
import { EventTypesService } from './eventTypes.service';

@Component({
  selector: 'app-event-types',
  templateUrl: './event-types.component.html',
  styleUrls: ['./event-types.component.scss'],
  imports: [CrudComponent],
})
export class EventTypesComponent implements OnInit {
  private toast = inject(ToastService);
  private loading = inject(LoadingService);
  private confirmService = inject(ConfirmService);
  private modalService = inject(ModalService);
  private eventTypesService = inject(EventTypesService);
  private authService = inject(AuthService);
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
      visible: () => this.authService.hasPermission('write_administrative_tipos_de_eventos'),
    },
    {
      type: 'delete',
      icon: 'delete',
      label: 'Excluir',
      color: 'warn',
      action: (eventType: EventTypes) => this.onDelete(eventType),
      visible: () => this.authService.hasPermission('delete_administrative_tipos_de_eventos'),
    },
  ];

  ngOnInit() {
    this.loadEventTypes();
  }

  private loadEventTypes() {
    this.loading.show();
    this.eventTypesService.findAll().subscribe({
      next: (eventTypesResp) => {
        this.eventTypes.set(eventTypesResp);
        this.dataSourceMat.data = eventTypesResp;
      },
      error: () => this.toast.openError(MESSAGES.LOADING_ERROR),
      complete: () => this.loading.hide(),
    });
  }

  onCreate() {
    const modal = this.modalService.openModal(
      `modal-${Math.random()}`,
      EventTypeComponent,
      'Adicionando tipo de evento',
      true,
      true,
    );

    modal.afterClosed().subscribe((newEventType) => {
      if (newEventType) {
        this.loadEventTypes();
      }
    });
  }

  private onEdit(eventType: EventTypes) {
    const modal = this.modalService.openModal(
      `modal-${Math.random()}`,
      EventTypeComponent,
      `Editando o tipo de evento: ${eventType.name}`,
      true,
      true,
      { eventType },
    );

    modal.afterClosed().subscribe((newEventType) => {
      if (newEventType) {
        this.loadEventTypes();
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
          next: () => this.toast.openSuccess(MESSAGES.DELETE_SUCCESS),
          error: () => this.toast.openError(MESSAGES.DELETE_ERROR),
          complete: () => this.loadEventTypes(),
        });
      }
    });
  }

  onChangeStatus(eventType: EventTypes) {
    const updatedStatus = !eventType.status;
    eventType.status = updatedStatus;

    this.eventTypesService.updatedStatus(eventType.id, updatedStatus).subscribe({
      next: () => this.toast.openSuccess(`Tipo de evento ${updatedStatus ? 'ativado' : 'desativado'} com sucesso!`),
      error: () => this.toast.openError(MESSAGES.UPDATE_ERROR),
      complete: () => this.loadEventTypes(),
    });
  }
}
