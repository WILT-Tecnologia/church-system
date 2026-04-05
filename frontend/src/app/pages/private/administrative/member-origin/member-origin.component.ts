import { Component, inject, OnInit, signal } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ConfirmService } from 'app/components/confirm/confirm.service';
import { CrudComponent } from 'app/components/crud/crud.component';
import { ActionsProps, ColumnDefinitionsProps } from 'app/components/crud/types';
import { LoadingService } from 'app/components/loading/loading.service';
import { ModalAction } from 'app/components/modal/modal.component';
import { ModalService } from 'app/components/modal/modal.service';
import { MESSAGES } from 'app/components/toast/messages';
import { ToastService } from 'app/components/toast/toast.service';
import { MemberOrigin } from 'app/model/MemberOrigins';
import { AuthService } from 'app/services/auth/auth.service';
import { Subject } from 'rxjs';
import { MemberOriginFormComponent } from './member-origin-form/member-origin-form.component';
import { MemberOriginService } from './member-origin.service';

@Component({
  selector: 'app-member-origin',
  templateUrl: './member-origin.component.html',
  styleUrls: ['./member-origin.component.scss'],
  imports: [CrudComponent],
})
export class MemberOriginComponent implements OnInit {
  private toastService = inject(ToastService);
  private loadingService = inject(LoadingService);
  private modalService = inject(ModalService);
  private confirmService = inject(ConfirmService);
  private memberOriginService = inject(MemberOriginService);
  private authService = inject(AuthService);
  private writePermission = this.authService.hasPermission('write_administrative_origem_do_membro');
  private deletePermission = this.authService.hasPermission('delete_administrative_origem_do_membro');

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
      visible: () => this.writePermission,
    },
    {
      type: 'delete',
      icon: 'delete',
      label: 'Excluir',
      color: 'warn',
      action: (memberOrigin: MemberOrigin) => this.onDelete(memberOrigin),
      visible: () => this.deletePermission,
    },
  ];

  ngOnInit() {
    this.loadMemberOrigins();
  }

  private loadMemberOrigins() {
    this.memberOriginService.findAll().subscribe({
      next: (memberOrigins) => {
        this.memberOrigins.set(memberOrigins);
        this.dataSourceMat.data = memberOrigins;
      },
      error: () => this.toastService.openError(MESSAGES.LOADING_ERROR),
      complete: () => this.loadingService.hide(),
    });
  }

  onCreate() {
    const submitSubject = new Subject<void>();
    const formAction: ModalAction[] = [
      {
        label: 'Cancelar',
        type: 'stroked',
        color: 'warn',
        icon: 'close',
        onClick: (ref) => ref.close(),
      },
      {
        label: 'Salvar',
        type: 'flat',
        color: 'primary',
        icon: 'save',
        onClick: () => submitSubject.next(),
      },
    ];

    const modal = this.modalService.openModal(
      `modal-${Math.random()}`,
      MemberOriginFormComponent,
      'Adicionar uma origem de membro',
      true,
      true,
      { submitSubject },
      undefined,
      false,
      formAction,
    );

    modal.afterClosed().subscribe((result: MemberOrigin) => {
      if (result) {
        this.memberOriginService.create(result).subscribe({
          next: () => this.toastService.openSuccess(MESSAGES.CREATE_SUCCESS),
          error: () => this.toastService.openError(MESSAGES.CREATE_ERROR),
          complete: () => this.loadMemberOrigins(),
        });
      }
    });
  }

  private onEdit(memberOrigin: MemberOrigin) {
    const submitSubject = new Subject<void>();
    const formAction: ModalAction[] = [
      {
        label: 'Cancelar',
        type: 'stroked',
        color: 'warn',
        icon: 'close',
        onClick: (ref) => ref.close(),
      },
      {
        label: 'Atualizar',
        type: 'flat',
        color: 'primary',
        icon: 'save',
        onClick: () => submitSubject.next(),
      },
    ];

    const modal = this.modalService.openModal(
      `modal-${Math.random()}`,
      MemberOriginFormComponent,
      `Editar Origem de Membros: ${memberOrigin.name}`,
      true,
      true,
      { memberOrigin, submitSubject },
      undefined,
      false,
      formAction,
    );

    modal.afterClosed().subscribe((result: MemberOrigin) => {
      if (result) {
        this.memberOriginService.update(result).subscribe({
          next: () => this.toastService.openSuccess(MESSAGES.UPDATE_SUCCESS),
          error: () => this.toastService.openError(MESSAGES.UPDATE_ERROR),
          complete: () => this.loadMemberOrigins(),
        });
      }
    });
  }

  private onDelete(memberOrigin: MemberOrigin) {
    const modal = this.confirmService.openConfirm(
      'Atenção',
      `Tem certeza que deseja excluir esta origem de membro ${memberOrigin.name}?`,
      'Confirmar',
      'Cancelar',
    );

    modal.afterClosed().subscribe((result: MemberOrigin) => {
      if (result) {
        this.memberOriginService.delete(memberOrigin).subscribe({
          next: () => this.toastService.openSuccess(MESSAGES.DELETE_SUCCESS),
          error: () => this.toastService.openError(MESSAGES.DELETE_ERROR),
          complete: () => this.loadMemberOrigins(),
        });
      }
    });
  }

  onChangeStatus(memberOrigin: MemberOrigin) {
    const updatedStatus = !memberOrigin.status;
    memberOrigin.status = updatedStatus;

    this.memberOriginService.updatedStatus(memberOrigin).subscribe({
      next: () =>
        this.toastService.openSuccess(`Origem do membro ${updatedStatus ? 'ativado' : 'desativado'} com sucesso!`),
      error: () => this.toastService.openError(MESSAGES.UPDATE_ERROR),
      complete: () => this.loadMemberOrigins(),
    });
  }
}
