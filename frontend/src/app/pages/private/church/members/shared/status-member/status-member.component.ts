import { ChangeDetectionStrategy, Component, inject, input, OnInit, output, signal } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ConfirmService } from '@app/components/confirm/confirm.service';
import { CrudComponent } from '@app/components/crud/crud.component';
import { ActionsProps, ColumnDefinitionsProps } from '@app/components/crud/types';
import { LoadingService } from '@app/components/loading/loading.service';
import { ModalService } from '@app/components/modal/modal.service';
import { MESSAGES } from '@app/components/toast/messages';
import { ToastService } from '@app/components/toast/toast.service';
import { StatusMember } from '@app/model/Members';
import { MembersService } from '../../members.service';
import { StatusMemberFormComponent } from './status-member-form/status-member-form.component';
import { StatusMemberService } from './status-member.service';

@Component({
  selector: 'app-status-member',
  templateUrl: './status-member.component.html',
  styleUrl: './status-member.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CrudComponent],
})
export class StatusMemberComponent implements OnInit {
  private readonly confirmeService = inject(ConfirmService);
  private readonly loadingService = inject(LoadingService);
  private readonly toast = inject(ToastService);
  private readonly modalService = inject(ModalService);
  private readonly statusMemberService = inject(StatusMemberService);
  private readonly membersService = inject(MembersService);
  public readonly data = inject<{ status_member: StatusMember[]; id: number }>(MAT_DIALOG_DATA);

  public readonly status_member_input = input<StatusMember | StatusMember[] | undefined>(undefined, {
    alias: 'status_member',
  });
  public readonly statusMemberUpdated = output<StatusMember[]>();

  public readonly status_member_list = signal<StatusMember[]>([]);
  public readonly rendering = signal(true);
  public readonly dataSourceMat = new MatTableDataSource<StatusMember>([]);

  public readonly columnDefinitions: ColumnDefinitionsProps[] = [
    {
      key: 'member_situation.name',
      header: 'Situação do membro',
      type: 'string',
    },
    { key: 'initial_period', header: 'Data Inicial', type: 'date' },
    { key: 'final_period', header: 'Data Final', type: 'date' },
  ];

  public readonly actions: ActionsProps[] = [
    {
      type: 'edit',
      icon: 'edit',
      label: 'Editar',
      color: 'inherit',
      action: (status_member: StatusMember) => this.handleEdit(status_member),
    },
    {
      type: 'delete',
      icon: 'delete',
      label: 'Excluir',
      color: 'warn',
      action: (status_member: StatusMember) => this.handleDelete(status_member),
    },
  ];

  ngOnInit() {
    this.rendering.set(false);
    this.loadStatusMember();
  }

  loadStatusMember() {
    this.loadingService.show();
    const memberId = this.membersService.getEditingMemberId();
    if (memberId) {
      this.statusMemberService.getStatusMemberByMemberId(memberId).subscribe({
        next: (status_member) => {
          const list = Array.isArray(status_member) ? status_member : [status_member];
          this.status_member_list.set(list);
          this.dataSourceMat.data = list;
          this.rendering.set(false);
        },
        error: () => {
          this.loadingService.hide();
          this.toast.openError(MESSAGES.LOADING_ERROR);
        },
        complete: () => this.loadingService.hide(),
      });
    } else {
      this.loadingService.hide();
    }
  }

  onCreate = () => {
    const defaultMemberId = this.membersService.getEditingMemberId();

    const dialogRef = this.modalService.openModal(
      `modal-${Math.random()}`,
      StatusMemberFormComponent,
      'Adicionando situação do membro',
      true,
      true,
      { status_member: { member: defaultMemberId } as StatusMember },
    );

    dialogRef.afterClosed().subscribe((result: StatusMember) => {
      if (result) {
        this.status_member_list.update((list) => [...list, result]);
        this.dataSourceMat.data = this.status_member_list();
        this.statusMemberUpdated.emit(this.status_member_list());
      }
    });
  };

  handleEdit = (status_member: StatusMember) => {
    const dialogRef = this.modalService.openModal(
      `modal-${Math.random()}`,
      StatusMemberFormComponent,
      `Editando situação do membro`,
      true,
      true,
      { status_member: status_member, id: status_member.id },
    );

    dialogRef.afterClosed().subscribe((result: StatusMember) => {
      if (result) {
        this.status_member_list.update((list) => {
          const index = list.findIndex((sm) => sm.id === result.id);
          if (index !== -1) {
            const newList = [...list];
            newList[index] = result;
            return newList;
          }
          return list;
        });
        this.dataSourceMat.data = this.status_member_list();
        this.statusMemberUpdated.emit(this.status_member_list());
      }
    });
  };

  handleDelete = (status_member: StatusMember) => {
    const dialogRef = this.confirmeService.openConfirm(
      'Excluir situação do membro',
      'Tem certeza que deseja excluir essa situação do membro?',
      'Confirmar',
      'Cancelar',
    );

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadingService.show();
        this.statusMemberService.delete(status_member.id).subscribe({
          next: () => {
            this.status_member_list.update((list) => list.filter((sm) => sm.id !== status_member.id));
            this.dataSourceMat.data = this.status_member_list();
            this.statusMemberUpdated.emit(this.status_member_list());
            this.toast.openSuccess(MESSAGES.DELETE_SUCCESS);
          },
          error: () => {
            this.loadingService.hide();
            this.toast.openError(MESSAGES.DELETE_ERROR);
          },
          complete: () => this.loadingService.hide(),
        });
      }
    });
  };
}

