import { Component, inject, OnInit, signal } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';

import { ConfirmService } from 'app/components/confirm/confirm.service';
import { CrudComponent } from 'app/components/crud/crud.component';
import { ActionsProps, ColumnDefinitionsProps } from 'app/components/crud/types';
import { LoadingService } from 'app/components/loading/loading.service';
import { ModalService } from 'app/components/modal/modal.service';
import { MESSAGES } from 'app/components/toast/messages';
import { ToastService } from 'app/components/toast/toast.service';
import { Guest } from 'app/model/Guest';
import { AuthService } from 'app/services/auth/auth.service';
import { GuestsFormComponent } from './guests-form/guests-form.component';
import { GuestsService } from './guests.service';

@Component({
  selector: 'app-guests',
  templateUrl: './guests.component.html',
  styleUrl: './guests.component.scss',
  imports: [CrudComponent],
})
export class GuestsComponent implements OnInit {
  private toast = inject(ToastService);
  private loading = inject(LoadingService);
  private confirmService = inject(ConfirmService);
  private modal = inject(ModalService);
  private guestsService = inject(GuestsService);
  private authService = inject(AuthService);
  guest = signal<Guest[]>([]);
  dataSourceMat = new MatTableDataSource<Guest>([]);
  columnDefinitions: ColumnDefinitionsProps[] = [
    { key: 'name', header: 'Nome', type: 'string' },
    { key: 'phone_one', header: 'Celular', type: 'phone' },
    { key: 'phone_two', header: 'Telefone II', type: 'sex' },
  ];
  actions: ActionsProps[] = [
    {
      type: 'edit',
      icon: 'edit',
      label: 'Editar',
      color: 'inherit',
      action: (guest: Guest) => this.handleEdit(guest),
      visible: () => this.authService.hasPermission('write_church_convidados_e_visitantes'),
    },
    {
      type: 'delete',
      icon: 'delete',
      label: 'Excluir',
      color: 'warn',
      action: (guest: Guest) => this.handleDelete(guest),
      visible: () => this.authService.hasPermission('write_church_convidados_e_visitantes'),
    },
  ];

  ngOnInit() {
    this.loadGuests();
  }

  loadGuests = () => {
    this.guestsService.findAll().subscribe({
      next: (data) => {
        this.guest.set(data);
        this.dataSourceMat.data = data;
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

  private hideLoading = () => {
    this.loading.hide();
  };
}
