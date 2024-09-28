import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { LoadingService } from 'app/components/loading/loading.service';
import { NotFoundRegisterComponent } from 'app/components/not-found-register/not-found-register.component';
import { TableComponent } from 'app/components/table/table.component';
import { MemberOrigin } from 'app/model/MemberOrigins';
import { SnackbarService } from 'app/service/snackbar/snackbar.service';
import { MemberOriginService } from './member-origin.service';

@Component({
  selector: 'app-member-origin',
  templateUrl: './member-origin.component.html',
  styleUrls: ['./member-origin.component.scss'],
  standalone: true,
  imports: [
    TableComponent,
    NotFoundRegisterComponent,
    MatCardModule,
    MatIconModule,
    CommonModule,
  ],
})
export class MemberOriginComponent implements OnInit {
  constructor(
    private router: Router,
    private snackbarService: SnackbarService,
    private loading: LoadingService,
    private MemberOriginService: MemberOriginService,
  ) {}

  memberOrigins: MemberOrigin[] = [];
  displayedColumns: string[] = ['name', 'status', 'updated_at', 'actions'];
  columnDefinitions = {
    name: 'Nome',
    status: 'Situação',
    updated_at: 'Última Atualização',
    actions: 'Ações',
  };

  ngOnInit() {
    this.loadMemberOrigins();
  }

  loadMemberOrigins = () => {
    this.loading.show();
    this.MemberOriginService.getMemberOrigins().subscribe((memberOrigin) => {
      this.memberOrigins = memberOrigin;
    });
    this.loading.hide();
  };

  addNewMemberOrigin = (): void => {
    this.router.navigate([
      'administrative/member-origin/member-origin-form/new',
    ]);
  };

  editMemberOrigin = (memberOrigin: MemberOrigin): void => {
    this.router.navigate([
      'administrative/member-origin/member-origin-form/edit',
      memberOrigin.id,
    ]);
  };

  deleteMemberOrigin = (memberOrigin: MemberOrigin): void => {
    this.loading.show();
    this.MemberOriginService.deleteMemberOrigin(memberOrigin.id).subscribe({
      next: () => {
        this.snackbarService.openSuccess(
          'Origem de Membro excluído com sucesso!',
        );
        this.loadMemberOrigins();
      },

      error: () => {
        this.loading.hide();
        this.snackbarService.openError('Erro ao excluir Origem de Membros!');
      },
    });
    this.loading.hide();
  };
}
