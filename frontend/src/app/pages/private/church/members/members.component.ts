import { Component, inject, OnInit, signal } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';

import { ConfirmService } from 'app/components/confirm/confirm.service';
import { CrudComponent } from 'app/components/crud/crud.component';
import { ActionsProps, ColumnDefinitionsProps } from 'app/components/crud/types';
import { LoadingService } from 'app/components/loading/loading.service';
import { ModalService } from 'app/components/modal/modal.service';
import { MESSAGES } from 'app/components/toast/messages';
import { ToastService } from 'app/components/toast/toast.service';
import { Families } from 'app/model/Families';
import { Members } from 'app/model/Members';
import { AuthService } from 'app/services/auth/auth.service';
import { MembersService } from './members.service';
import { FamiliesComponent } from './shared/families/families.component';
import { HistoryComponent } from './shared/history/history.component';
import { MemberComponent } from './shared/member/member.component';
import { OrdinationsComponent } from './shared/ordinations/ordinations.component';
import { StatusMemberComponent } from './shared/status-member/status-member.component';

@Component({
  selector: 'app-members',
  templateUrl: './members.component.html',
  styleUrls: ['./members.component.scss'],
  imports: [CrudComponent],
})
export class MembersComponent implements OnInit {
  private confirmeService = inject(ConfirmService);
  private loading = inject(LoadingService);
  private toast = inject(ToastService);
  private membersService = inject(MembersService);
  private modalService = inject(ModalService);
  private authService = inject(AuthService);
  families!: Families[];
  member = signal<Members[]>([]);
  dataSourceMat = new MatTableDataSource<Members>([]);
  columnDefinitions: ColumnDefinitionsProps[] = [
    { key: 'person.name', header: 'Nome', type: 'string' },
    { key: 'person.cpf', header: 'CPF', type: 'cpf' },
    { key: 'person.email', header: 'Email', type: 'string' },
    { key: 'person.birth_date', header: 'Data de Nascimento', type: 'date' },
    { key: 'person.sex', header: 'Sexo', type: 'sex' },
    { key: 'person.phone_one', header: 'Celular', type: 'phone' },
    { key: 'church.name', header: 'Igreja', type: 'string' },
    {
      key: 'church.responsible.name',
      header: 'Pastor presidente',
      type: 'string',
    },
    { key: 'updated_at', header: 'Última atualização', type: 'datetime' },
  ];
  actions: ActionsProps[] = [
    {
      type: 'edit',
      icon: 'edit',
      label: 'Editar',
      color: 'inherit',
      action: (member: Members) => this.handleUpdate(member),
      visible: () => this.authService.hasPermission('write_church_membros'),
    },
    {
      type: 'filiation',
      icon: 'family_restroom',
      label: 'Filiação',
      color: 'inherit',
      action: (member: Members) => this.handleFiliation(member),
      visible: () => this.authService.hasPermission('write_church_membros'),
    },
    {
      type: 'ordination',
      icon: 'church',
      label: 'Ordenação',
      color: 'inherit',
      action: (member: Members) => this.handleOrdination(member),
      visible: () => this.authService.hasPermission('write_church_membros'),
    },
    {
      type: 'status',
      icon: 'sensor_occupied',
      label: 'Situação',
      color: 'inherit',
      action: (member: Members) => this.handleStatusMember(member),
      visible: () => this.authService.hasPermission('write_church_membros'),
    },
    {
      type: 'history',
      icon: 'history',
      label: 'Log de mudanças',
      color: 'inherit',
      action: (member: Members) => this.handleHistory(member),
      visible: () => this.authService.hasPermission('write_church_membros'),
    },
    {
      type: 'delete',
      icon: 'delete',
      label: 'Excluir',
      color: 'warn',
      action: (member: Members) => this.handleDelete(member),
      visible: () => this.authService.hasPermission('write_church_membros'),
    },
  ];

  ngOnInit() {
    this.findAll();
  }

  private findAll = () => {
    this.loading.show();
    this.membersService.findAll().subscribe({
      next: (membersResp) => {
        this.member.set(membersResp);
        this.dataSourceMat.data = membersResp;
      },
      error: () => this.toast.openError(MESSAGES.LOADING_ERROR),
      complete: () => this.loading.hide(),
    });
  };

  onCreate = () => {
    const dialogRef = this.modalService.openModal(
      `modal-${Math.random()}`,
      MemberComponent,
      'Adicionando novo membro',
      true,
      true,
    );

    dialogRef.afterClosed().subscribe((result: Members) => {
      if (result) {
        this.findAll();
      }
    });
  };

  handleUpdate = (member: Members) => {
    this.membersService.setEditingMemberId(member.id);
    const dialogRef = this.modalService.openModal(
      `modal-${Math.random()}`,
      MemberComponent,
      `Editando o membro: ${member.person.name}`,
      true,
      true,
      { members: member, id: member.id },
    );

    dialogRef.afterClosed().subscribe((result: Members) => {
      if (result) {
        this.findAll();
      }
    });
  };

  handleDelete = (members: Members) => {
    const modal = this.confirmeService.openConfirm(
      'Atenção!',
      `Tem certeza que deseja excluir o membro ${members.person.name} ?`,
      'Confirmar',
      'Cancelar',
    );

    modal.afterClosed().subscribe((result: Members) => {
      if (result) {
        this.loading.show();
        this.membersService.delete(members.id).subscribe({
          next: () => {
            this.toast.openSuccess(MESSAGES.DELETE_SUCCESS);
          },
          error: () => {
            this.loading.hide();
            this.toast.openError(MESSAGES.DELETE_ERROR);
          },
          complete: () => {
            this.findAll();
            this.loading.hide();
          },
        });
      }
    });
  };

  handleHistory = (member: Members) => {
    const memberId = this.membersService.setEditingMemberId(member.id);

    const dialogRef = this.modalService.openModal(
      `modal-${Math.random()}`,
      HistoryComponent,
      `Histórico do membro: ${member.person.name}`,
      true,
      true,
      { history_member: member, id: memberId },
    );

    dialogRef.afterClosed().subscribe((result: Members) => {
      if (result) {
        this.findAll();
      }
    });
  };

  handleFiliation = (member: Members) => {
    this.membersService.setEditingMemberId(member.id);
    const dialogRef = this.modalService.openModal(
      `modal-${Math.random()}`,
      FamiliesComponent,
      `Adicionando filiação ao membro: ${member.person.name}`,
      true,
      true,
      { families: member.families, id: member.id },
    );

    dialogRef.afterClosed().subscribe((result: Members) => {
      if (result) {
        this.findAll();
      }
    });
  };

  handleOrdination = (member: Members) => {
    this.membersService.setEditingMemberId(member.id);
    const dialogRef = this.modalService.openModal(
      `modal-${Math.random()}`,
      OrdinationsComponent,
      `Adicionando ordenação ao membro: ${member.person.name}`,
      true,
      true,
      { ordinations: member.ordination, id: member.id },
    );

    dialogRef.afterClosed().subscribe((result: Members) => {
      if (result) {
        this.findAll();
      }
    });
  };

  handleStatusMember = (member: Members) => {
    this.membersService.setEditingMemberId(member.id);
    const dialogRef = this.modalService.openModal(
      `modal-${Math.random()}`,
      StatusMemberComponent,
      `Alterando status do membro: ${member.person.name}`,
      true,
      true,
      { status_member: member.status_member, id: member.id },
    );

    dialogRef.afterClosed().subscribe((result: Members) => {
      if (result) {
        this.findAll();
      }
    });
  };
}
