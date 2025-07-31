import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

import { ConfirmService } from 'app/components/confirm/confirm.service';
import { CrudComponent } from 'app/components/crud/crud.component';
import { ActionsProps, ColumnDefinitionsProps } from 'app/components/crud/types';
import { LoadingService } from 'app/components/loading/loading.service';
import { ModalService } from 'app/components/modal/modal.service';
import { NotFoundRegisterComponent } from 'app/components/not-found-register/not-found-register.component';
import { MESSAGES } from 'app/components/toast/messages';
import { ToastService } from 'app/components/toast/toast.service';
import { MemberOrigin } from 'app/model/MemberOrigins';

import { MemberOriginFormComponent } from './member-origin-form/member-origin-form.component';
import { MemberOriginService } from './member-origin.service';

@Component({
  selector: 'app-member-origin',
  templateUrl: './member-origin.component.html',
  styleUrls: ['./member-origin.component.scss'],
  imports: [NotFoundRegisterComponent, MatCardModule, MatIconModule, CommonModule, CrudComponent],
})
export class MemberOriginComponent implements OnInit {
  constructor(
    private toast: ToastService,
    private loading: LoadingService,
    private modal: ModalService,
    private confirmService: ConfirmService,
    private MemberOriginService: MemberOriginService,
  ) {}

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  memberOrigins: MemberOrigin[] = [];
  rendering: boolean = true;
  dataSourceMat = new MatTableDataSource<MemberOrigin>(this.memberOrigins);
  columnDefinitions: ColumnDefinitionsProps[] = [
    { key: 'status', header: 'Situação', type: 'boolean' },
    { key: 'name', header: 'Origem', type: 'string' },
    { key: 'description', header: 'Descrição', type: 'string' },
    { key: 'updated_at', header: 'Última Atualização', type: 'datetime' },
  ];
  actions: ActionsProps[] = [
    {
      type: 'toggle',
      activeLabel: 'Ativar',
      inactiveLabel: 'Desativar',
      action: (memberOrigin: MemberOrigin) => this.toggleStatus(memberOrigin),
    },
    {
      type: 'edit',
      icon: 'edit',
      label: 'Editar',
      action: (memberOrigin: MemberOrigin) => this.handleEdit(memberOrigin),
    },
    {
      type: 'delete',
      icon: 'delete',
      label: 'Excluir',
      color: 'warn',
      action: (memberOrigin: MemberOrigin) => this.handleDelete(memberOrigin),
    },
  ];

  ngOnInit() {
    this.loadMemberOrigins();
  }

  private loadMemberOrigins = () => {
    this.MemberOriginService.findAll().subscribe({
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

  onCreate = () => {
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
      `Tem certeza que deseja excluir a origem de membros ${memberOrigin.name}?`,
      'Confirmar ',
      'Cancelar',
    );

    modal.afterClosed().subscribe((result: MemberOrigin) => {
      if (result) {
        this.MemberOriginService.delete(memberOrigin).subscribe({
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

  toggleStatus(memberOrigin: MemberOrigin) {
    const updatedStatus = !memberOrigin.status;
    memberOrigin.status = updatedStatus;

    this.MemberOriginService.updatedStatus(memberOrigin.id, updatedStatus).subscribe({
      next: () => {
        this.toast.openSuccess(`Origem do membro ${updatedStatus ? 'ativado' : 'desativado'} com sucesso!`);
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
  }
}
