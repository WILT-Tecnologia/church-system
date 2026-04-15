import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ConfirmService } from '@app/components/confirm/confirm.service';
import { CrudComponent } from '@app/components/crud/crud.component';
import { ActionsProps, ColumnDefinitionsProps } from '@app/components/crud/types';
import { LoadingService } from '@app/components/loading/loading.service';
import { MESSAGES } from '@app/components/toast/messages';
import { ToastService } from '@app/components/toast/toast.service';
import { Members } from '@app/model/Members';
import { AuthService } from '@app/services/auth/auth.service';
import { FormService } from '@app/services/form-service.service';
import { MembersService } from './members.service';
import { FamiliesComponent } from './shared/families/families.component';
import { HistoryComponent } from './shared/history/history.component';
import { MemberFormComponent } from './shared/member-form/member-form.component';
import { OrdinationsComponent } from './shared/ordinations/ordinations.component';
import { StatusMemberComponent } from './shared/status-member/status-member.component';

@Component({
  selector: 'app-members',
  templateUrl: './members.component.html',
  styleUrls: ['./members.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CrudComponent],
})
export class MembersComponent implements OnInit {
  private readonly confirmeService = inject(ConfirmService);
  private readonly loadingService = inject(LoadingService);
  private readonly toastService = inject(ToastService);
  private readonly membersService = inject(MembersService);
  private readonly authService = inject(AuthService);
  private readonly formService = inject(FormService);

  readonly canWrite = signal<string>('write_church_membros');
  readonly canDelete = signal<string>('delete_church_membros');
  private readonly hasCanWrite = this.authService.hasPermission(this.canWrite());
  private readonly hasCanDelete = this.authService.hasPermission(this.canDelete());

  public readonly member = signal<Members[]>([]);
  public readonly dataSourceMat = new MatTableDataSource<Members>([]);
  public readonly columnDefinitions: ColumnDefinitionsProps[] = [
    { key: 'person.name', header: 'Nome', type: 'string' },
    { key: 'person.cpf', header: 'CPF', type: 'cpf' },
    { key: 'person.email', header: 'Email', type: 'email' },
    { key: 'person.birth_date', header: 'Data de Nascimento', type: 'date' },
    { key: 'person.sex', header: 'Sexo', type: 'sex' },
    { key: 'person.phone_one', header: 'Celular', type: 'phone' },
    { key: 'church.name', header: 'Igreja', type: 'string' },
    {
      key: 'church.responsible.name',
      header: 'Pastor presidente',
      type: 'string',
    },
  ];

  public readonly actions: ActionsProps[] = [
    {
      type: 'edit',
      icon: 'edit',
      label: 'Editar',
      color: 'inherit',
      action: (member: Members) => this.onEdit(member),
      visible: () => this.hasCanWrite,
    },
    {
      type: 'filiation',
      icon: 'family_restroom',
      label: 'Filiação',
      color: 'inherit',
      action: (member: Members) => this.onFiliation(member),
      visible: () => this.hasCanWrite,
    },
    {
      type: 'ordination',
      icon: 'church',
      label: 'Ordenação',
      color: 'inherit',
      action: (member: Members) => this.onOrdination(member),
      visible: () => this.hasCanWrite,
    },
    {
      type: 'status',
      icon: 'sensor_occupied',
      label: 'Situação',
      color: 'inherit',
      action: (member: Members) => this.onStatusMember(member),
      visible: () => this.hasCanWrite,
    },
    {
      type: 'history',
      icon: 'history',
      label: 'Log de mudanças',
      color: 'inherit',
      action: (member: Members) => this.onHistory(member),
      visible: () => this.hasCanWrite,
    },
    {
      type: 'delete',
      icon: 'delete',
      label: 'Excluir',
      color: 'warn',
      action: (member: Members) => this.onDelete(member),
      visible: () => this.hasCanDelete,
    },
  ];

  ngOnInit() {
    this.getMembersAll();
  }

  private getMembersAll() {
    this.membersService.getMembersAll().subscribe({
      next: (membersResp) => {
        this.member.set(membersResp);
        this.dataSourceMat.data = membersResp;
      },
      error: () => this.toastService.openError(MESSAGES.LOADING_ERROR),
      complete: () => this.loadingService.hide(),
    });
  }

  onCreate() {
    this.membersService.setEditingMemberId(null);
    const modal = this.formService.openFormModal(
      'Adicionando novo membro',
      MemberFormComponent,
      {},
      ['cancel', 'save'],
      true,
    );

    modal.subscribe((result: Members) => {
      if (result) {
        this.getMembersAll();
      }
    });
  }

  private onEdit(member: Members) {
    this.membersService.setEditingMemberId(member.id);
    const modal = this.formService.openFormModal(
      `Editando o membro: ${member.person.name}`,
      MemberFormComponent,
      { members: member, id: member.id },
      ['cancel', 'save'],
      true,
    );

    modal.subscribe((result: Members) => {
      if (result) {
        this.getMembersAll();
      }
    });
  }

  private onDelete(members: Members) {
    const modal = this.confirmeService.openConfirm(
      'Exclusão de membro',
      `Tem certeza que deseja excluir o membro ${members.person.name} ?`,
      'Confirmar',
      'Cancelar',
    );

    modal.afterClosed().subscribe((result: Members) => {
      if (result) {
        this.membersService.delete(members.id).subscribe({
          next: () => this.toastService.openSuccess(MESSAGES.DELETE_SUCCESS),
          error: () => this.toastService.openError(MESSAGES.DELETE_ERROR),
          complete: () => this.getMembersAll(),
        });
      }
    });
  }

  private onHistory(member: Members) {
    this.membersService.setEditingMemberId(member.id);
    this.formService.openFormModal(
      `Histórico do membro: ${member.person.name}`,
      HistoryComponent,
      { history_member: member, id: member.id },
      ['cancel'],
      true,
    );
  }

  private onFiliation(member: Members) {
    this.membersService.setEditingMemberId(member.id);
    this.formService.openFormModal(
      `Adicionando filiação ao membro: ${member.person.name}`,
      FamiliesComponent,
      { families: member.families, id: member.id },
      ['cancel'],
      true,
    );
  }

  private onOrdination(member: Members) {
    this.membersService.setEditingMemberId(member.id);
    this.formService.openFormModal(
      `Adicionando ordenação ao membro: ${member.person.name}`,
      OrdinationsComponent,
      { ordinations: member.ordination, id: member.id },
      ['cancel'],
      true,
    );
  }

  private onStatusMember(member: Members) {
    this.membersService.setEditingMemberId(member.id);
    this.formService.openFormModal(
      `Alterando status do membro: ${member?.person?.name}`,
      StatusMemberComponent,
      { status_member: member.status_member, id: member.id },
      ['cancel'],
      true,
    );
  }
}
