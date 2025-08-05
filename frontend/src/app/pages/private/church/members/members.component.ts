import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
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
import { Families } from 'app/model/Families';
import { Members } from 'app/model/Members';

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
  imports: [CommonModule, NotFoundRegisterComponent, CrudComponent],
})
export class MembersComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  families!: Families[];
  member: Members[] = [];
  dataSourceMat = new MatTableDataSource<Members>(this.member);
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
      action: (member: Members) => this.handleUpdate(member),
    },
    {
      type: 'filiation',
      icon: 'family_restroom',
      label: 'Filiação',
      action: (member: Members) => this.handleFiliation(member),
    },
    {
      type: 'ordination',
      icon: 'church',
      label: 'Ordenação',
      action: (member: Members) => this.handleOrdination(member),
    },
    {
      type: 'status',
      icon: 'sensor_occupied',
      label: 'Situação',
      action: (member: Members) => this.handleStatusMember(member),
    },
    {
      type: 'history',
      icon: 'history',
      label: 'Log de mudanças',
      action: (member: Members) => this.handleHistory(member),
    },
    {
      type: 'delete',
      icon: 'delete',
      label: 'Excluir',
      color: 'warn',
      action: (member: Members) => this.handleDelete(member),
    },
  ];

  constructor(
    private confirmeService: ConfirmService,
    private loading: LoadingService,
    private toast: ToastService,
    private membersService: MembersService,
    private modalService: ModalService,
  ) {}

  ngOnInit() {
    this.findAll();
  }

  private findAll = () => {
    this.loading.show();
    this.membersService.findAll().subscribe({
      next: (members) => {
        this.member = members;
        this.dataSourceMat.data = this.member;
        this.dataSourceMat.paginator = this.paginator;
        this.dataSourceMat.sort = this.sort;
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
