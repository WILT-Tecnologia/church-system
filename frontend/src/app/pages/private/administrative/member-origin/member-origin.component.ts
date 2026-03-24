import { Component, inject, OnInit, signal } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ConfirmService } from 'app/components/confirm/confirm.service';
import { CrudComponent } from 'app/components/crud/crud.component';
import { ActionsProps, ColumnDefinitionsProps } from 'app/components/crud/types';
import { LoadingService } from 'app/components/loading/loading.service';
import { ModalService } from 'app/components/modal/modal.service';
import { MESSAGES } from 'app/components/toast/messages';
import { ToastService } from 'app/components/toast/toast.service';
import { MemberOrigin } from 'app/model/MemberOrigins';
import { AuthService } from 'app/services/auth/auth.service';
import { MemberOriginFormComponent } from './member-origin-form/member-origin-form.component';
import { MemberOriginService } from './member-origin.service';

@Component({
  selector: 'app-member-origin',
  templateUrl: './member-origin.component.html',
  styleUrls: ['./member-origin.component.scss'],
  imports: [CrudComponent],
})
export class MemberOriginComponent implements OnInit {
  private toast = inject(ToastService);
  private loading = inject(LoadingService);
  private modal = inject(ModalService);
  private confirmService = inject(ConfirmService);
  private memberOriginService = inject(MemberOriginService);
  private authService = inject(AuthService);

  memberOrigins = signal<MemberOrigin[]>([]);
  dataSourceMat = new MatTableDataSource<MemberOrigin>([]);
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
      action: (memberOrigin: MemberOrigin) => this.onChangeStatus(memberOrigin),
    },
    {
      type: 'edit',
      icon: 'edit',
      label: 'Editar',
      color: 'inherit',
      action: (memberOrigin: MemberOrigin) => this.onEdit(memberOrigin),
      visible: () => this.authService.hasPermission('write_administrative_origem_do_membro'),
    },
    {
      type: 'delete',
      icon: 'delete',
      label: 'Excluir',
      color: 'warn',
      action: (memberOrigin: MemberOrigin) => this.onDelete(memberOrigin),
      visible: () => this.authService.hasPermission('delete_administrative_origem_do_membro'),
    },
  ];

  ngOnInit() {
    this.loadMemberOrigins();
  }

  private loadMemberOrigins() {
    this.loading.show();
    this.memberOriginService.findAll().subscribe({
      next: (memberOrigins) => {
        this.memberOrigins.set(memberOrigins);
        this.dataSourceMat.data = memberOrigins;
      },
      error: () => this.toast.openError(MESSAGES.LOADING_ERROR),
      complete: () => this.loading.hide(),
    });
  }

  onCreate() {
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
  }

  private onEdit(memberOrigin: MemberOrigin) {
    const modal = this.modal.openModal(
      `modal-${Math.random()}`,
      MemberOriginFormComponent,
      `Editar Origem de Membros: ${memberOrigin.name}`,
      true,
      true,
      { memberOrigin },
    );

    modal.afterClosed().subscribe((result: MemberOrigin) => {
      if (result) {
        this.loadMemberOrigins();
      }
    });
  }

  private onDelete(memberOrigin: MemberOrigin) {
    const modal = this.confirmService.openConfirm(
      'Atenção',
      `Tem certeza que deseja excluir a origem de membros ${memberOrigin.name}?`,
      'Confirmar ',
      'Cancelar',
    );

    modal.afterClosed().subscribe((result: MemberOrigin) => {
      if (result) {
        this.memberOriginService.delete(memberOrigin).subscribe({
          next: () => this.toast.openSuccess(MESSAGES.DELETE_SUCCESS),
          error: () => this.toast.openError(MESSAGES.DELETE_ERROR),
          complete: () => this.loadMemberOrigins(),
        });
      }
    });
  }

  onChangeStatus(memberOrigin: MemberOrigin) {
    const updatedStatus = !memberOrigin.status;
    memberOrigin.status = updatedStatus;

    this.memberOriginService.updatedStatus(memberOrigin.id, updatedStatus).subscribe({
      next: () => this.toast.openSuccess(`Origem do membro ${updatedStatus ? 'ativado' : 'desativado'} com sucesso!`),
      error: () => this.toast.openError(MESSAGES.UPDATE_ERROR),
      complete: () => this.loadMemberOrigins(),
    });
  }
}
