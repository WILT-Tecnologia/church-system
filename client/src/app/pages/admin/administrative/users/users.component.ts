import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ConfirmService } from 'app/components/confirm/confirm.service';
import { LoadingService } from 'app/components/loading/loading.service';
import { ModalService } from 'app/components/modal/modal.service';
import { NotFoundRegisterComponent } from 'app/components/not-found-register/not-found-register.component';
import { ToastService } from 'app/components/toast/toast.service';
import { User } from 'app/model/User';
import { MESSAGES } from 'app/utils/messages';
import { CrudComponent } from '../../../../components/crud/crud.component';
import { UserFormComponent } from './user-form/user-form.component';
import { UsersService } from './users.service';

@Component({
  selector: 'app-users',
  standalone: true,
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

  columnDefinitions = [
    { key: 'status', header: 'Situação', type: 'boolean' },
    { key: 'name', header: 'Nome', type: 'string' },
    { key: 'email', header: 'Email', type: 'string' },
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

  addNewUser = () => {
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

  editUser = (user: User) => {
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

  deleteUser = (user: User) => {
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
}
