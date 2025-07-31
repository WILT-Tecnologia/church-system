import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

import { ConfirmService } from 'app/components/confirm/confirm.service';
import { CrudComponent } from 'app/components/crud/crud.component';
import { ActionsProps, ColumnDefinitionsProps } from 'app/components/crud/types';
import { LoadingService } from 'app/components/loading/loading.service';
import { ModalService } from 'app/components/modal/modal.service';
import { NotFoundRegisterComponent } from 'app/components/not-found-register/not-found-register.component';
import { MESSAGES } from 'app/components/toast/messages';
import { ToastService } from 'app/components/toast/toast.service';
import { EventTypes } from 'app/model/EventTypes';

import { EventTypeComponent } from './event-type/event-type.component';
import { EventTypesService } from './eventTypes.service';

@Component({
  selector: 'app-event-types',
  templateUrl: './event-types.component.html',
  styleUrls: ['./event-types.component.scss'],
  standalone: true,
  imports: [NotFoundRegisterComponent, CommonModule, CrudComponent],
})
export class EventTypesComponent implements OnInit {
  constructor(
    private toast: ToastService,
    private loading: LoadingService,
    private confirmService: ConfirmService,
    private modalService: ModalService,
    private eventTypesService: EventTypesService,
  ) {}

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  eventTypes: EventTypes[] = [];
  rendering: boolean = true;
  dataSourceMat = new MatTableDataSource<EventTypes>(this.eventTypes);
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
      action: (eventType: EventTypes) => this.toggleStatus(eventType),
    },
    {
      type: 'edit',
      icon: 'edit',
      label: 'Editar',
      action: (eventType: EventTypes) => this.handleEdit(eventType),
    },
    {
      type: 'delete',
      icon: 'delete',
      label: 'Excluir',
      color: 'warn',
      action: (eventType: EventTypes) => this.handleDelete(eventType),
    },
  ];

  ngOnInit() {
    this.loadEventTypes();
  }

  private loadEventTypes = () => {
    this.eventTypesService.findAll().subscribe({
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

  onCreate = () => {
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
      .openConfirm('Atenção!', 'Tem certeza que deseja excluir este tipo de evento?', 'Confirmar', 'Cancelar')
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          this.eventTypesService.delete(eventType).subscribe({
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

  toggleStatus(eventType: EventTypes) {
    const updatedStatus = !eventType.status;
    eventType.status = updatedStatus;

    this.eventTypesService.updatedStatus(eventType.id, updatedStatus).subscribe({
      next: () => {
        this.toast.openSuccess(`Tipo de evento ${updatedStatus ? 'ativado' : 'desativado'} com sucesso!`);
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
  }
}
