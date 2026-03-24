import { Component, inject, OnInit, signal } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';

import { ConfirmService } from 'app/components/confirm/confirm.service';
import { CrudComponent } from 'app/components/crud/crud.component';
import { ActionsProps, ColumnDefinitionsProps } from 'app/components/crud/types';
import { LoadingService } from 'app/components/loading/loading.service';
import { ModalService } from 'app/components/modal/modal.service';
import { MESSAGES } from 'app/components/toast/messages';
import { ToastService } from 'app/components/toast/toast.service';
import { User } from 'app/model/User';
import { AuthService } from 'app/services/auth/auth.service';
import { UserFormComponent } from './user-form/user-form.component';
import { UsersService } from './users.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
  imports: [CrudComponent],
})
export class UsersComponent implements OnInit {
  private toast = inject(ToastService);
  private loading = inject(LoadingService);
  private confirmService = inject(ConfirmService);
  private modalService = inject(ModalService);
  private userService = inject(UsersService);
  private authService = inject(AuthService);
  private writePermission = this.authService.hasPermission('write_administrative_usuarios');
  private deletePermission = this.authService.hasPermission('delete_administrative_usuarios');
  users = signal<User[]>([]);
  dataSourceMat = new MatTableDataSource<User>([]);
  columnDefinitions: ColumnDefinitionsProps[] = [
    { key: 'status', header: 'Situação', type: 'boolean' },
    { key: 'name', header: 'Nome', type: 'string' },
    { key: 'email', header: 'Email', type: 'string' },
    { key: 'profile_name', header: 'Perfil', type: 'string' },
    { key: 'change_password', header: 'Alterar senha?', type: 'boolean' },
    { key: 'updated_at', header: 'Última Atualização', type: 'datetime' },
  ];
  actions: ActionsProps[] = [
    {
      type: 'toggle',
      activeLabel: 'Ativar',
      inactiveLabel: 'Desativar',
      action: (user: User) => this.onChangeStatus(user),
    },
    {
      type: 'edit',
      icon: 'edit',
      label: 'Editar',
      color: 'inherit',
      action: (user: User) => this.onEdit(user),
      visible: () => this.writePermission,
    },
    {
      type: 'delete',
      icon: 'delete',
      label: 'Excluir',
      color: 'warn',
      action: (user: User) => this.onDelete(user),
      visible: () => this.deletePermission,
    },
  ];

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading.show();
    this.userService.getUsers().subscribe({
      next: (usersResp) => {
        this.users.set(usersResp);
        this.dataSourceMat.data = usersResp;
      },
      error: () => this.toast.openError(MESSAGES.LOADING_ERROR),
      complete: () => this.loading.hide(),
    });
  }

  onCreate() {
    const modal = this.modalService.openModal(
      `modal-${Math.random()}`,
      UserFormComponent,
      'Adicionar Usuário',
      true,
      true,
    );

    modal.afterClosed().subscribe((user: User) => {
      if (user) {
        this.loadUsers();
      }
    });
  }

  onEdit(user: User) {
    const modal = this.modalService.openModal(
      `modal-${Math.random()}`,
      UserFormComponent,
      'Editar Usuário',
      true,
      true,
      { user },
    );

    modal.afterClosed().subscribe((user: User) => {
      if (user) {
        this.loadUsers();
      }
    });
  }

  onDelete(user: User) {
    const modal = this.confirmService.openConfirm(
      'Atenção',
      'Deseja realmente excluir o usuário?',
      'Confirmar',
      'Cancelar',
    );
    modal.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.userService.deleteUser(user.id).subscribe({
          next: () => this.toast.openSuccess(MESSAGES.DELETE_SUCCESS),
          error: () => this.toast.openError(MESSAGES.DELETE_ERROR),
          complete: () => this.loadUsers(),
        });
      }
    });
  }

  onChangeStatus(user: User) {
    const updatedStatus = !user.status;
    user.status = updatedStatus;

    this.userService.updatedStatus(user.id, updatedStatus).subscribe({
      next: () => this.toast.openSuccess(`Usuário ${updatedStatus ? 'ativado' : 'desativado'} com sucesso!`),
      error: () => this.toast.openError(MESSAGES.UPDATE_ERROR),
      complete: () => this.loadUsers(),
    });
  }
}
