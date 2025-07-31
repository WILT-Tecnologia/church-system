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
import { Guest } from 'app/model/Events';

import { GuestsFormComponent } from './guests-form/guests-form.component';
import { GuestsService } from './guests.service';

@Component({
  selector: 'app-guests',
  templateUrl: './guests.component.html',
  styleUrl: './guests.component.scss',
  imports: [NotFoundRegisterComponent, CommonModule, CrudComponent],
})
export class GuestsComponent implements OnInit {
  guest: Guest[] = [];
  dataSourceMat = new MatTableDataSource<Guest>(this.guest);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  columnDefinitions: ColumnDefinitionsProps[] = [
    { key: 'name', header: 'Nome', type: 'string' },
    { key: 'phone_one', header: 'Celular', type: 'phone' },
    { key: 'phone_two', header: 'Telefone II', type: 'sex' },
  ];
  actions: ActionsProps[] = [
    {
      type: 'edit',
      tooltip: 'Editar',
      icon: 'edit',
      label: 'Editar',
      action: (guest: Guest) => this.handleEdit(guest),
    },
    {
      type: 'delete',
      tooltip: 'Excluir',
      icon: 'delete',
      label: 'Excluir',
      color: 'warn',
      action: (guest: Guest) => this.handleDelete(guest),
    },
  ];

  constructor(
    private toast: ToastService,
    private loading: LoadingService,
    private confirmService: ConfirmService,
    private modal: ModalService,
    private guestsService: GuestsService,
  ) {}

  ngOnInit() {
    this.loadGuests();
  }

  loadGuests = () => {
    this.guestsService.findAll().subscribe({
      next: (data) => {
        this.guest = data;
        this.dataSourceMat.paginator = this.paginator;
        this.dataSourceMat.sort = this.sort;
      },
      error: () => this.toast.openError(MESSAGES.LOADING_ERROR),
      complete: () => this.loading.hide(),
    });
  };

  onCreate = () => {
    const modal = this.modal.openModal(
      `modal-${Math.random()}`,
      GuestsFormComponent,
      'Adicionar convidado',
      true,
      true,
    );

    modal.afterClosed().subscribe((data) => {
      if (data) {
        this.loadGuests();
      }
    });
  };

  handleEdit = (guest: Guest) => {
    const modal = this.modal.openModal(
      `modal-${Math.random()}`,
      GuestsFormComponent,
      `Editando o convidado`,
      true,
      true,
      { guest },
    );

    modal.afterClosed().subscribe((data) => {
      if (data) {
        this.loadGuests();
      }
    });
  };

  handleDelete = (guest: Guest) => {
    const modal = this.confirmService.openConfirm(
      'Atenção',
      'Tem certeza que deseja excluir este convidado?',
      'Confirmar',
      'Cancelar',
    );

    modal.afterClosed().subscribe((result) => {
      if (result) {
        this.guestsService.deleteGuest(guest).subscribe({
          next: () => this.toast.openSuccess(MESSAGES.DELETE_SUCCESS),
          error: () => this.toast.openError(MESSAGES.DELETE_ERROR),
          complete: () => {
            this.loadGuests();
            this.hideLoading();
          },
        });
      }
    });
  };

  private showLoading = () => {
    this.loading.show();
  };

  private hideLoading = () => {
    this.loading.hide();
  };
}
