import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';

import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ConfirmService } from 'app/components/confirm/confirm.service';
import {
  ActionsProps,
  ColumnDefinitionsProps,
  CrudComponent,
} from 'app/components/crud/crud.component';
import { LoadingService } from 'app/components/loading/loading.service';
import { ModalService } from 'app/components/modal/modal.service';
import { NotFoundRegisterComponent } from 'app/components/not-found-register/not-found-register.component';
import { MESSAGES } from 'app/components/toast/messages';
import { ToastService } from 'app/components/toast/toast.service';
import { EventTypes } from 'app/model/EventTypes';
import { EventTypeComponent } from './eventType/eventType.component';
import { EventTypesService } from './eventTypes.service';

@Component({
  selector: 'app-eventTypes',
  templateUrl: './eventTypes.component.html',
  styleUrls: ['./eventTypes.component.scss'],
  imports: [NotFoundRegisterComponent, CommonModule, CrudComponent],
})
export class EventTypesComponent implements OnInit {
  eventTypes: EventTypes[] = [];
  rendering: boolean = true;
  dataSourceMat = new MatTableDataSource<EventTypes>(this.eventTypes);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  actions: ActionsProps[] = [
    {
      type: 'toggle',
      tooltip: 'Ativar/Desativar',
      activeLabel: 'Ativar',
      inactiveLabel: 'Desativar',
      action: (eventType: EventTypes) => this.toggleStatus(eventType),
    },
    {
      type: 'edit',
      tooltip: 'Editar',
      icon: 'edit',
      label: 'Editar',
      action: (eventType: EventTypes) => this.handleEdit(eventType),
    },
    {
      type: 'delete',
      tooltip: 'Excluir',
      icon: 'delete',
      label: 'Excluir',
      color: 'warn',
      action: (eventType: EventTypes) => this.handleDelete(eventType),
    },
  ];

  columnDefinitions: ColumnDefinitionsProps[] = [
    { key: 'status', header: 'Status', type: 'boolean' },
    { key: 'name', header: 'Nome', type: 'string' },
    { key: 'color', header: 'Cor', type: 'color' },
    { key: 'description', header: 'Descrição', type: 'string' },
    { key: 'updated_at', header: 'Última Atualização', type: 'datetime' },
  ];

  constructor(
    private toast: ToastService,
    private loading: LoadingService,
    private confirmService: ConfirmService,
    private modalService: ModalService,
    private eventTypesService: EventTypesService,
  ) {}

  ngOnInit() {
    this.loadEventTypes();
  }

  loadEventTypes = () => {
    this.eventTypesService.getEventTypes().subscribe({
      next: (eventTypes) => {
        this.eventTypes = eventTypes;
        this.dataSourceMat.data = this.eventTypes;
        this.dataSourceMat.paginator = this.paginator;
        this.dataSourceMat.sort = this.sort;
        this.rendering = false;
      },
      error: () => this.toast.openError(MESSAGES.LOADING_ERROR),
      complete: () => this.loading.hide(),
    });
  };

  handleCreate = () => {
    const dialogRef = this.modalService.openModal(
      `modal-${Math.random()}`,
      EventTypeComponent,
      'Adicionando tipo de evento',
      true,
      true,
    );

    dialogRef.afterClosed().subscribe((newEventType) => {
      if (newEventType) {
        this.loadEventTypes();
      }
    });
  };

  handleEdit = (eventType: EventTypes) => {
    const dialogRef = this.modalService.openModal(
      `modal-${Math.random()}`,
      EventTypeComponent,
      `Editando o tipo de evento: ${eventType.name}`,
      true,
      true,
      { eventType },
    );

    dialogRef.afterClosed().subscribe((newEventType) => {
      if (newEventType) {
        this.loadEventTypes();
      }
    });
  };

  handleDelete = (eventType: EventTypes) => {
    this.confirmService
      .openConfirm(
        'Atenção!',
        'Tem certeza que deseja excluir este tipo de evento?',
        'Confirmar',
        'Cancelar',
      )
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          this.eventTypesService.deleteEventTypes(eventType.id).subscribe({
            next: () => {
              this.toast.openSuccess(MESSAGES.DELETE_SUCCESS);
            },
            error: () => {
              this.loading.hide();
              this.toast.openError(MESSAGES.DELETE_ERROR);
            },
            complete: () => {
              this.loadEventTypes();
              this.loading.hide();
            },
          });
        }
      });
  };

  toggleStatus = (eventType: EventTypes) => {
    const updatedStatus = !eventType.status;
    eventType.status = updatedStatus;

    this.eventTypesService
      .updatedStatus(eventType.id, updatedStatus)
      .subscribe({
        next: () => {
          this.toast.openSuccess(
            `Tipo de evento ${updatedStatus ? 'ativado' : 'desativado'} com sucesso!`,
          );
        },
        error: () => {
          this.loading.hide();
          this.toast.openError(MESSAGES.UPDATE_ERROR);
        },
        complete: () => {
          this.loadEventTypes();
          this.loading.hide();
        },
      });
  };
}
