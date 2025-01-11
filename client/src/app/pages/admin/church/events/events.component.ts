import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ConfirmService } from 'app/components/confirm/confirm.service';
import {
  ActionsProps,
  CrudComponent,
} from 'app/components/crud/crud.component';
import { LoadingService } from 'app/components/loading/loading.service';
import { ModalService } from 'app/components/modal/modal.service';
import { NotFoundRegisterComponent } from 'app/components/not-found-register/not-found-register.component';
import { ToastService } from 'app/components/toast/toast.service';
import { Events } from 'app/model/Events';
import { MESSAGES } from 'app/utils/messages';
import { UsersService } from '../../administrative/users/users.service';
import { EventsFormComponent } from './events-form/events-form.component';
import { EventsService } from './events.service';

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss'],
  standalone: true,
  imports: [NotFoundRegisterComponent, CommonModule, CrudComponent],
})
export class EventsComponent implements OnInit {
  userName: string | null = null;
  events: Events[] = [];
  rendering: boolean = true;
  dataSourceMat = new MatTableDataSource<Events>(this.events);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  actions: ActionsProps[] = [
    {
      type: 'edit',
      tooltip: 'Editar',
      icon: 'edit',
      label: 'Editar',
      action: (events: Events) => this.handleEdit(events),
    },
    {
      type: 'delete',
      tooltip: 'Excluir',
      icon: 'delete',
      label: 'Excluir',
      action: (events: Events) => this.handleDelete(events),
    },
  ];

  columnDefinitions = [
    { key: 'church.name', header: 'Igreja', type: 'string' },
    { key: 'event_type.name', header: 'Tipo do evento', type: 'string' },
    { key: 'name', header: 'Nome', type: 'string' },
    { key: 'updated_at', header: 'Última Atualização', type: 'datetime' },
  ];

  constructor(
    private toast: ToastService,
    private loading: LoadingService,
    private confirmService: ConfirmService,
    private modal: ModalService,
    private eventsService: EventsService,
    private usersService: UsersService,
  ) {}

  ngOnInit() {
    this.loadEvents();
  }

  showLoading() {
    this.loading.show();
  }

  hideLoading() {
    this.loading.hide();
  }

  loadEvents = () => {
    this.showLoading();
    this.eventsService.findAll().subscribe({
      next: (events) => {
        this.events = events;
        this.dataSourceMat = new MatTableDataSource<Events>(this.events);
        this.dataSourceMat.sort = this.sort;
        this.dataSourceMat.paginator = this.paginator;
        this.rendering = false;
      },
      error: () => {
        this.hideLoading();
        this.toast.openError(MESSAGES.LOADING_ERROR);
      },
      complete: () => this.hideLoading(),
    });
  };

  handleCreate = () => {
    const modal = this.modal.openModal(
      `modal-${Math.random()}`,
      EventsFormComponent,
      'Adicionar evento',
      true,
      true,
    );

    modal.afterClosed().subscribe((result) => {
      if (result) {
        this.loadEvents();
      }
    });
  };
  handleEdit = (event: Events) => {
    const modal = this.modal.openModal(
      `modal-${Math.random()}`,
      EventsFormComponent,
      'Editar evento',
      true,
      true,
      { event },
    );

    modal.afterClosed().subscribe((result) => {
      if (result) {
        this.loadEvents();
      }
    });
  };
  handleDelete = (event: Events) => {
    this.confirmService
      .openConfirm(
        'Excluir evento',
        `Tem certeza que deseja excluir o evento ${event.name}?`,
        'Confirmar',
        'Cancelar',
      )
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          this.showLoading();
          this.eventsService.delete(event).subscribe({
            next: () => this.toast.openSuccess(MESSAGES.DELETE_SUCCESS),
            error: () => this.toast.openError(MESSAGES.DELETE_ERROR),
            complete: () => {
              this.loadEvents();
              this.hideLoading();
            },
          });
        }
      });
  };
}
