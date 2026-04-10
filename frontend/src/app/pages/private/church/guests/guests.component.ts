import { Component, inject, OnInit, signal } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ConfirmService } from '@app/components/confirm/confirm.service';
import { CrudComponent } from '@app/components/crud/crud.component';
import { ActionsProps, ColumnDefinitionsProps } from '@app/components/crud/types';
import { LoadingService } from '@app/components/loading/loading.service';
import { ModalAction } from '@app/components/modal/modal.component';
import { ModalService } from '@app/components/modal/modal.service';
import { MESSAGES } from '@app/components/toast/messages';
import { ToastService } from '@app/components/toast/toast.service';
import { Guest } from '@app/model/Guest';
import { AuthService } from '@app/services/auth/auth.service';
import { Subject } from 'rxjs';
import { GuestsFormComponent } from './guests-form/guests-form.component';
import { GuestsService } from './guests.service';

@Component({
  selector: 'app-guests',
  templateUrl: './guests.component.html',
  styleUrl: './guests.component.scss',
  imports: [CrudComponent],
})
export class GuestsComponent implements OnInit {
  private readonly toast = inject(ToastService);
  private readonly loading = inject(LoadingService);
  private readonly confirmService = inject(ConfirmService);
  private readonly modal = inject(ModalService);
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
      error: () => this.toast.openError(MESSAGES.LOADING_ERROR),
      complete: () => this.loading.hide(),
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

    const modal = this.modal.openModal(
      `modal-${Math.random()}`,
      GuestsFormComponent,
      'Adicionar convidado',
      true,
      true,
      { submitSubject },
      undefined,
      false,
      formAction,
    );

    modal.afterClosed().subscribe((data: Guest) => {
      if (data) {
        this.guestsService.createGuest(data).subscribe({
          next: () => this.toast.openSuccess(MESSAGES.CREATE_SUCCESS),
          error: () => this.toast.openError(MESSAGES.CREATE_ERROR),
          complete: () => this.loadGuests(),
        });
      }
    });
  }

  handleEdit(guest: Guest) {
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

    const modal = this.modal.openModal(
      `modal-${Math.random()}`,
      GuestsFormComponent,
      `Editando o convidado`,
      true,
      true,
      { guest, submitSubject },
      undefined,
      false,
      formAction,
    );

    modal.afterClosed().subscribe((data: Guest) => {
      if (data) {
        this.guestsService.updateGuest(data).subscribe({
          next: () => this.toast.openSuccess(MESSAGES.UPDATE_SUCCESS),
          error: () => this.toast.openError(MESSAGES.UPDATE_ERROR),
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
          next: () => this.toast.openSuccess(MESSAGES.DELETE_SUCCESS),
          error: () => this.toast.openError(MESSAGES.DELETE_ERROR),
          complete: () => this.loadGuests(),
        });
      }
    });
  }
}
