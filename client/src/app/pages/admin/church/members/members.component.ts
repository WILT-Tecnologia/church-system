import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ConfirmService } from 'app/components/confirm/confirm.service';
import {
  ActionsProps,
  CrudComponent,
} from 'app/components/crud/crud.component';
import { LoadingService } from 'app/components/loading/loading.service';
import { ModalService } from 'app/components/modal/modal.service';
import { NotFoundRegisterComponent } from 'app/components/not-found-register/not-found-register.component';
import { ToastService } from 'app/components/toast/toast.service';
import { Families } from 'app/model/Families';
import { Members } from 'app/model/Members';
import { MESSAGES } from 'app/utils/messages';
import { MemberComponent } from './member/member.component';
import { MembersService } from './members.service';
import { HistoryComponent } from './shared/history/history.component';
import { MemberService } from './shared/member.service';

@Component({
  selector: 'app-members',
  templateUrl: './members.component.html',
  styleUrls: ['./members.component.scss'],
  standalone: true,
  imports: [CommonModule, NotFoundRegisterComponent, CrudComponent],
})
export class MembersComponent implements OnInit {
  families!: Families[];
  member: Members[] = [];
  rendering: boolean = true;
  dataSourceMat = new MatTableDataSource<Members>(this.member);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  actions: ActionsProps[] = [
    {
      type: 'history',
      tooltip: 'Ver histórico',
      icon: 'history',
      label: 'Histórico de mudanças',
      action: (member: Members) => this.handleHistory(member),
    },
    {
      type: 'edit',
      tooltip: 'Editar',
      icon: 'edit',
      label: 'Editar',
      action: (member: Members) => this.editMembers(member),
    },
    {
      type: 'delete',
      tooltip: 'Excluir',
      icon: 'delete',
      label: 'Excluir',
      action: (member: Members) => this.deleteMembers(member),
    },
  ];

  columnDefinitions = [
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
    { key: 'baptism_date', header: 'Data do batismo', type: 'date' },
    { key: 'updated_at', header: 'Última atualização', type: 'datetime' },
  ];

  constructor(
    private confirmeService: ConfirmService,
    private loading: LoadingService,
    private toast: ToastService,
    private membersService: MembersService,
    private modalService: ModalService,
    private memberService: MemberService,
  ) {}

  ngOnInit() {
    this.loadMembers();
  }

  loadMembers = () => {
    this.loading.show();
    this.membersService.getMembers().subscribe({
      next: (members) => {
        this.member = members;
        this.dataSourceMat.data = this.member;
        this.dataSourceMat.paginator = this.paginator;
        this.dataSourceMat.sort = this.sort;
        this.rendering = false;
      },
      error: () => this.toast.openError(MESSAGES.LOADING_ERROR),
      complete: () => this.loading.hide(),
    });
  };

  addNewMembers = () => {
    const dialogRef = this.modalService.openModal(
      `modal-${Math.random()}`,
      MemberComponent,
      'Adicionando novo membro',
      true,
      true,
    );

    dialogRef.afterClosed().subscribe((result: Members) => {
      if (result) {
        this.loadMembers();
      }
    });
  };

  editMembers = (member: Members) => {
    this.memberService.setEditingMemberId(member.id);
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
        this.loadMembers();
      }
    });
  };

  handleHistory = (member: Members) => {
    const memberId = this.memberService.setEditingMemberId(member.id);

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
        this.loadMembers();
      }
    });
  };

  deleteMembers = (members: Members) => {
    const modal = this.confirmeService.openConfirm(
      'Atenção!',
      `Tem certeza que deseja excluir o membro ${members.person.name} ?`,
      'Confirmar',
      'Cancelar',
    );

    modal.afterClosed().subscribe((result: Members) => {
      if (result) {
        this.loading.show();
        this.membersService.deleteMember(members.id).subscribe({
          next: () => {
            this.toast.openSuccess(MESSAGES.DELETE_SUCCESS);
          },
          error: () => {
            this.loading.hide();
            this.toast.openError(MESSAGES.DELETE_ERROR);
          },
          complete: () => {
            this.loadMembers();
            this.loading.hide();
          },
        });
      }
    });
  };
}
