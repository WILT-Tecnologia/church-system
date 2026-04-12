import { Component, inject, OnInit, signal } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ConfirmService } from '@app/components/confirm/confirm.service';
import { CrudComponent } from '@app/components/crud/crud.component';
import { ActionsProps, ColumnDefinitionsProps } from '@app/components/crud/types';
import { LoadingService } from '@app/components/loading/loading.service';
import { ModalService } from '@app/components/modal/modal.service';
import { MESSAGES } from '@app/components/toast/messages';
import { ToastService } from '@app/components/toast/toast.service';
import { Guest } from '@app/model/Guest';
import { AuthService } from '@app/services/auth/auth.service';
import { FormService } from '@app/services/form-service.service';
import { GuestsFormComponent } from './guests-form/guests-form.component';
import { GuestsService } from './guests.service';

@Component({
  selector: 'app-guests',
  templateUrl: './guests.component.html',
  styleUrl: './guests.component.scss',
  imports: [CrudComponent],
})
export class GuestsComponent implements OnInit {
  private readonly toastService = inject(ToastService);
  private readonly loadingService = inject(LoadingService);
  private readonly confirmService = inject(ConfirmService);
  private readonly modalService = inject(ModalService);
  private readonly formService = inject(FormService);
  private readonly guestsService = inject(GuestsService);
  private readonly authService = inject(AuthService);
  public readonly permissionWrite = 'write_church_convidados_e_visitantes';
  public readonly permissionDelete = 'delete_church_convidados_e_visitantes';
  private readonly permissionHasWrite = this.authService.hasPermission(this.permissionWrite);
  private readonly permissionHasDelete = this.authService.hasPermission(this.permissionDelete);

  guest = signal<Guest[]>([]);
  dataSourceMat = new MatTableDataSource<Guest>([]);
  columnDefinitions: ColumnDefinitionsProps[] = [
    { key: 'name', header: 'Nome', type: 'string' },
    { key: 'phone_one', header: 'Celular', type: 'phone' },
    { key: 'phone_two', header: 'Telefone II', type: 'phone' },
    { key: 'sex', header: 'Sexo', type: 'sex' },
    { key: 'cpf', header: 'CPF', type: 'cpf' },
    { key: 'email', header: 'E-mail', type: 'email' },
    { key: 'birth_date', header: 'Data de Nascimento', type: 'date' },
    { key: 'cep', header: 'CEP', type: 'string' },
    { key: 'street', header: 'Rua', type: 'string' },
    { key: 'number', header: 'Número', type: 'string' },
    { key: 'district', header: 'Bairro', type: 'string' },
    { key: 'city', header: 'Cidade', type: 'string' },
    { key: 'state', header: 'Estado', type: 'string' },
    { key: 'country', header: 'País', type: 'string' },
    { key: 'updated_at', header: 'Atualizado em', type: 'datetime' },
  ];
  actions: ActionsProps[] = [
    {
      type: 'edit',
      icon: 'edit',
      label: 'Editar',
      color: 'inherit',
      action: (guest: Guest) => this.handleEdit(guest),
      visible: () => this.permissionHasWrite,
    },
    {
      type: 'delete',
      icon: 'delete',
      label: 'Excluir',
      color: 'warn',
      action: (guest: Guest) => this.handleDelete(guest),
      visible: () => this.permissionHasDelete,
    },
  ];

  ngOnInit() {
    this.loadGuests();
  }

  loadGuests() {
    this.guestsService.getGuestsAll().subscribe({
      next: (data) => {
        this.guest.set(data);
        this.dataSourceMat.data = data;
      },
      error: () => this.toastService.openError(MESSAGES.LOADING_ERROR),
      complete: () => this.loadingService.hide(),
    });
  }

  onCreate() {
    const modal = this.formService.openFormModal(
      'Adicionar convidado',
      GuestsFormComponent,
      {},
      ['cancel', 'save'],
      false,
    );

    modal.subscribe((data: Guest) => {
      if (data) {
        this.guestsService.createGuest(data).subscribe({
          next: () => this.toastService.openSuccess(MESSAGES.CREATE_SUCCESS),
          error: () => this.toastService.openError(MESSAGES.CREATE_ERROR),
          complete: () => this.loadGuests(),
        });
      }
    });
  }

  handleEdit(guest: Guest) {
    const modal = this.formService.openFormModal(
      `Editando o convidado ${guest.name}`,
      GuestsFormComponent,
      { guest },
      ['cancel', 'save'],
      false,
    );

    modal.subscribe((data: Guest) => {
      if (data) {
        this.guestsService.updateGuest(data).subscribe({
          next: () => this.toastService.openSuccess(MESSAGES.UPDATE_SUCCESS),
          error: () => this.toastService.openError(MESSAGES.UPDATE_ERROR),
          complete: () => this.loadGuests(),
        });
      }
    });
  }

  handleDelete(guest: Guest) {
    const modal = this.confirmService.openConfirm(
      'Exclusão de convidado',
      `Tem certeza que deseja excluir o registro do convidado ${guest.name}?`,
      'Confirmar',
      'Cancelar',
    );

    modal.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.guestsService.deleteGuest(guest).subscribe({
          next: () => this.toastService.openSuccess(MESSAGES.DELETE_SUCCESS),
          error: () => this.toastService.openError(MESSAGES.DELETE_ERROR),
          complete: () => this.loadGuests(),
        });
      }
    });
  }
}
