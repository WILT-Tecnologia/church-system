import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ConfirmService } from 'app/components/confirm/confirm.service';
import { LoadingService } from 'app/components/loading/loading.service';
import { NotFoundRegisterComponent } from 'app/components/not-found-register/not-found-register.component';
import { TableComponent } from 'app/components/table/table.component';
import { ToastService } from 'app/components/toast/toast.service';
import { MemberOrigin } from 'app/model/MemberOrigins';
import { MemberOriginFormComponent } from './member-origin-form/member-origin-form.component';
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
  memberOrigins: MemberOrigin[] = [];
  displayedColumns: string[] = ['name', 'status', 'updated_at', 'actions'];
  columnDefinitions = {
    name: 'Nome',
    status: 'Situação',
    updated_at: 'Última Atualização',
    actions: 'Ações',
  };

  constructor(
    private MemberOriginService: MemberOriginService,
    private toast: ToastService,
    private loading: LoadingService,
    private dialog: MatDialog,
    private confirmService: ConfirmService,
  ) {}

  ngOnInit() {
    this.loadMemberOrigins();
  }

  loadMemberOrigins = () => {
    this.MemberOriginService.getMemberOrigins().subscribe((memberOrigin) => {
      this.memberOrigins = memberOrigin;
    });
  };

  addNewMemberOrigin = (): void => {
    const dialogRef = this.dialog.open(MemberOriginFormComponent, {
      maxWidth: '100%',
      height: 'auto',
      maxHeight: '100dvh',
      role: 'dialog',
      panelClass: 'dialog',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loading.show();
        this.loadMemberOrigins();
        this.loading.hide();
      }
    });
  };

  editMemberOrigin = (memberOrigin: MemberOrigin): void => {
    const dialogRef = this.dialog.open(MemberOriginFormComponent, {
      id: memberOrigin.id,
      maxWidth: '100%',
      height: 'auto',
      maxHeight: '100dvh',
      role: 'dialog',
      panelClass: 'dialog',
      disableClose: true,
      data: { memberOrigin },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loading.show();
        this.loadMemberOrigins();
        this.loading.hide();
      }
    });
  };

  deleteMemberOrigin = (memberOrigin: MemberOrigin): void => {
    this.confirmService
      .openConfirm(
        'Atenção',
        `Tem certeza que deseja excluir a Origem de Membros ${memberOrigin.name}?`,
        'Sim, excluir',
        'Cancelar',
      )
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          this.MemberOriginService.deleteMemberOrigin(
            memberOrigin.id,
          ).subscribe({
            next: () => {
              this.toast.openSuccess('Origem de Membro excluído com sucesso!');
              this.loadMemberOrigins();
            },
            error: () => {
              this.loading.hide();
              this.toast.openError('Erro ao excluir Origem de Membros!');
            },
            complete: () => {
              this.loading.hide();
            },
          });
        }
      });
  };
}
