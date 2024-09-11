import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';
import { NotFoundRegisterComponent } from '../../../../components/not-found-register/not-found-register.component';
import { TableComponent } from '../../../../components/table/table.component';

import { LoadingService } from 'app/components/loading/loading.service';
import { Members } from '../../../../model/Members';
import { SnackbarService } from '../../../../service/snackbar/snackbar.service';
import { MembersService } from './members.service';

@Component({
  selector: 'app-members',
  templateUrl: './members.component.html',
  styleUrls: ['./members.component.scss'],
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    TableComponent,
    NotFoundRegisterComponent,
    CommonModule,
  ],
})
export class MembersComponent implements OnInit {
  members: Members[] = [];
  displayedColumns: string[] = ['name', 'email', 'actions'];
  columnDefinitions = {
    name: 'Nome',
    email: 'Email',
    actions: 'Ações',
  };
  constructor(
    private router: Router,
    private memberService: MembersService,
    private snackbarService: SnackbarService,
    private loading: LoadingService
  ) {}

  ngOnInit() {
    this.loadMembers();
  }

  loadMembers = () => {
    this.loading.show();
    this.memberService.getMembers().subscribe((members) => {
      this.members = members;
    });
    this.loading.hide();
  };

  addNewMembers = (): void => {
    this.router.navigate(['church/members/member/new']);
  };

  editMembers = (members: Members): void => {
    this.router.navigate(['church/members/member/edit', members.id]);
  };

  deleteMembers = (members: Members): void => {
    this.loading.show();
    this.memberService.deleteMember(members.id).subscribe({
      next: () => {
        this.snackbarService.openSuccess('Membro excluído com sucesso!');
        this.loadMembers();
      },
      error: () => {
        this.loading.hide();
        this.snackbarService.openError('Erro ao excluir membros');
      },
    });
    this.loading.hide();
  };
}
