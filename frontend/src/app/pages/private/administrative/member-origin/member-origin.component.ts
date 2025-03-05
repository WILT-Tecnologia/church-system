import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ConfirmService } from '../../../../components/confirm/confirm.service';
import {
  ActionsProps,
  CrudComponent,
} from '../../../../components/crud/crud.component';
import { LoadingService } from '../../../../components/loading/loading.service';
import { ModalService } from '../../../../components/modal/modal.service';
import { NotFoundRegisterComponent } from '../../../../components/not-found-register/not-found-register.component';
import { MESSAGES } from '../../../../components/toast/messages';
import { ToastService } from '../../../../components/toast/toast.service';
import { MemberOrigin } from '../../../../model/MemberOrigins';
import { MemberOriginFormComponent } from './member-origin-form/member-origin-form.component';
import { MemberOriginService } from './member-origin.service';

@Component({
    selector: 'app-member-origin',
    templateUrl: './member-origin.component.html',
    styleUrls: ['./member-origin.component.scss'],
    imports: [
        NotFoundRegisterComponent,
        MatCardModule,
        MatIconModule,
        CommonModule,
        CrudComponent,
    ]
})
export class MemberOriginComponent implements OnInit {
  memberOrigins: MemberOrigin[] = [];
  rendering: boolean = true;
  dataSourceMat = new MatTableDataSource<MemberOrigin>(this.memberOrigins);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  actions: ActionsProps[] = [
    {
      type: 'edit',
      tooltip: 'Editar',
      icon: 'edit',
      label: 'Editar',
      action: (memberOrigin: MemberOrigin) => this.handleEdit(memberOrigin),
    },
    {
      type: 'delete',
      tooltip: 'Excluir',
      icon: 'delete',
      label: 'Excluir',
      action: (memberOrigin: MemberOrigin) => this.handleDelete(memberOrigin),
    },
  ];

  columnDefinitions = [
    { key: 'status', header: 'Situação', type: 'boolean' },
    { key: 'name', header: 'Origem', type: 'string' },
    { key: 'description', header: 'Descrição', type: 'string' },
    { key: 'updated_at', header: 'Última Atualização', type: 'datetime' },
  ];

  constructor(
    private toast: ToastService,
    private loading: LoadingService,
    private modal: ModalService,
    private confirmService: ConfirmService,
    private MemberOriginService: MemberOriginService,
  ) {}

  ngOnInit() {
    this.loadMemberOrigins();
  }

  loadMemberOrigins = () => {
    this.MemberOriginService.getMemberOrigins().subscribe({
      next: (memberOrigins) => {
        this.memberOrigins = memberOrigins;
        this.dataSourceMat.data = this.memberOrigins;
        this.dataSourceMat.paginator = this.paginator;
        this.dataSourceMat.sort = this.sort;
        this.rendering = false;
      },
      error: () => {
        this.loading.hide();
        this.toast.openError(MESSAGES.LOADING_ERROR);
      },
      complete: () => {
        this.loading.hide();
      },
    });
  };

  handleCreate = () => {
    const modal = this.modal.openModal(
      `modal-${Math.random()}`,
      MemberOriginFormComponent,
      'Adicionar uma origem de membro',
      true,
      true,
    );

    modal.afterClosed().subscribe((result: MemberOrigin) => {
      if (result) {
        this.loadMemberOrigins();
      }
    });
  };

  handleEdit = (memberOrigin: MemberOrigin) => {
    const dialogRef = this.modal.openModal(
      `modal-${Math.random()}`,
      MemberOriginFormComponent,
      `Editar Origem de Membros: ${memberOrigin.name}`,
      true,
      true,
      { memberOrigin },
    );

    dialogRef.afterClosed().subscribe((result: MemberOrigin) => {
      if (result) {
        this.loadMemberOrigins();
      }
    });
  };

  handleDelete = (memberOrigin: MemberOrigin) => {
    const modal = this.confirmService.openConfirm(
      'Atenção',
      `Tem certeza que deseja excluir a Origem de Membros ${memberOrigin.name}?`,
      'Confirmar ',
      'Cancelar',
    );

    modal.afterClosed().subscribe((result: MemberOrigin) => {
      if (result) {
        this.MemberOriginService.deleteMemberOrigin(memberOrigin.id).subscribe({
          next: () => {
            this.toast.openSuccess(MESSAGES.DELETE_SUCCESS);
          },
          error: () => {
            this.loading.hide();
            this.toast.openError(MESSAGES.DELETE_ERROR);
          },
          complete: () => {
            this.loadMemberOrigins();
            this.loading.hide();
          },
        });
      }
    });
  };

  toggleStatus = (memberOrigin: MemberOrigin) => {
    const updatedStatus = !memberOrigin.status;
    memberOrigin.status = updatedStatus;

    this.MemberOriginService.updatedStatus(
      memberOrigin.id,
      updatedStatus,
    ).subscribe({
      next: () => {
        this.toast.openSuccess(
          `Perfil ${updatedStatus ? 'ativado' : 'desativado'} com sucesso!`,
        );
      },
      error: () => {
        this.loading.hide();
        this.toast.openError(MESSAGES.UPDATE_ERROR);
      },
      complete: () => {
        this.loadMemberOrigins();
        this.loading.hide();
      },
    });
  };
}
