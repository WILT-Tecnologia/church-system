import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';
import { NotFoundRegisterComponent } from '../../../../components/not-found-register/not-found-register.component';
import { TableComponent } from '../../../../components/table/table.component';
import { User } from '../../../../model/User';
import { SnackbarService } from '../../../../service/snackbar/snackbar.service';
import { UsersService } from './users.service';

@Component({
  selector: 'app-users',
  standalone: true,
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
  imports: [
    MatCardModule,
    MatButtonModule,
    TableComponent,
    NotFoundRegisterComponent,
    CommonModule,
  ],
})
export class UsersComponent implements OnInit {
  constructor(
    private router: Router,
    private snackbarService: SnackbarService,
    private userService: UsersService
  ) {}

  ngOnInit() {
    this.loadUsers();
  }

  users: User[] = [];
  displayedColumns: string[] = ['name', 'email', 'actions'];

  columnDefinitions = {
    name: 'Nome',
    email: 'Email',
    actions: 'Ações',
  };

  loadUsers = () => {
    this.userService.getUsers().subscribe((users) => {
      this.users = users;
    });
  };

  addNewUser = (): void => {
    this.router.navigate(['administrative/users/user/new']);
  };

  editUser = (user: User): void => {
    this.router.navigate(['administrative/users/user/edit', user.id]);
  };

  deleteUser = (user: User): void => {
    this.userService.deleteUser(user.id).subscribe({
      next: () => {
        this.snackbarService.openSuccess('Usuário excluído com sucesso!');
        this.loadUsers();
      },
      error: () => {
        this.snackbarService.openError('Erro ao excluir o usuário!');
      },
    });
  };
}
