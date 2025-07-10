import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

import { ConfirmService } from 'app/components/confirm/confirm.service';
import { ActionsProps, CrudComponent } from 'app/components/crud/crud.component';
import { LoadingService } from 'app/components/loading/loading.service';
import { ModalService } from 'app/components/modal/modal.service';
import { NotFoundRegisterComponent } from 'app/components/not-found-register/not-found-register.component';
import { MESSAGES } from 'app/components/toast/messages';
import { ToastService } from 'app/components/toast/toast.service';
import { User } from 'app/model/User';

import { UserFormComponent } from './user-form/user-form.component';
import { UsersService } from './users.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
  imports: [NotFoundRegisterComponent, CommonModule, CrudComponent],
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  rendering: boolean = true;
  dataSourceMat = new MatTableDataSource<User>(this.users);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  actions: ActionsProps[] = [
    {
      type: 'toggle',
      activeLabel: 'Ativar',
      inactiveLabel: 'Desativar',
      action: (user: User) => this.toggleStatus(user),
    },
    {
      type: 'edit',
      icon: 'edit',
      label: 'Editar',
      action: (user: User) => this.handleEdit(user),
    },
    {
      type: 'delete',
      icon: 'delete',
      label: 'Excluir',
      color: 'warn',
      action: (user: User) => this.handleDelete(user),
    },
  ];

  columnDefinitions = [
    { key: 'status', header: 'Situação', type: 'boolean' },
    { key: 'name', header: 'Nome', type: 'string' },
    { key: 'email', header: 'Email', type: 'string' },
    { key: 'change_password', header: 'Alterar senha', type: 'boolean' },
    { key: 'updated_at', header: 'Última Atualização', type: 'datetime' },
  ];

  constructor(
    private toast: ToastService,
    private loading: LoadingService,
    private confirmService: ConfirmService,
    private modalService: ModalService,
    private userService: UsersService,
  ) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers = () => {
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.dataSourceMat.data = this.users;
        this.dataSourceMat.paginator = this.paginator;
        this.dataSourceMat.sort = this.sort;
        this.rendering = false;
      },
      error: () => {
        this.toast.openError(MESSAGES.LOADING_ERROR);
      },
      complete: () => this.loading.hide(),
    });
  };

  handleCreate = () => {
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
  };

  handleEdit = (user: User) => {
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
  };

  handleDelete = (user: User) => {
    const modal = this.confirmService.openConfirm(
      'Atenção',
      'Deseja realmente excluir o usuário?',
      'Confirmar',
      'Cancelar',
    );
    modal.afterClosed().subscribe((result) => {
      if (result) {
        this.loading.show();
        this.userService.deleteUser(user.id).subscribe({
          next: () => {
            this.toast.openSuccess(MESSAGES.DELETE_SUCCESS);
          },
          error: () => {
            this.toast.openError(MESSAGES.DELETE_ERROR);
          },
          complete: () => {
            this.loadUsers();
            this.loading.hide();
          },
        });
      }
    });
  };

  toggleStatus = (user: User) => {
    this.loading.show();
    const updatedStatus = !user.status;
    user.status = updatedStatus;

    this.userService.updatedStatus(user.id, updatedStatus).subscribe({
      next: () => {
        this.toast.openSuccess(`Usuário ${updatedStatus ? 'ativado' : 'desativado'} com sucesso!`);
      },
      error: () => {
        this.loading.hide();
        this.toast.openError(MESSAGES.UPDATE_ERROR);
      },
      complete: () => {
        this.loadUsers();
        this.loading.hide();
      },
    });
  };
}
