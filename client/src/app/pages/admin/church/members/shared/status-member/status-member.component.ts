import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ConfirmService } from 'app/components/confirm/confirm.service';
import { LoadingService } from 'app/components/loading/loading.service';
import { ModalService } from 'app/components/modal/modal.service';
import { NotFoundRegisterComponent } from 'app/components/not-found-register/not-found-register.component';
import { ToastService } from 'app/components/toast/toast.service';
import { Members, StatusMember } from 'app/model/Members';
import { MESSAGES } from 'app/utils/messages';
import {
  ActionsProps,
  CrudComponent,
} from '../../../../../../components/crud/crud.component';
import { MembersService } from '../../members.service';
import { MemberService } from '../member.service';
import { StatusMemberFormComponent } from './status-member-form/status-member-form.component';
import { StatusMemberService } from './status-member.service';

@Component({
  selector: 'app-status-member',
  standalone: true,
  templateUrl: './status-member.component.html',
  styleUrl: './status-member.component.scss',
  imports: [CommonModule, NotFoundRegisterComponent, CrudComponent],
})
export class StatusMemberComponent implements OnInit {
  @Input() statusMember: StatusMember[] = [];
  members: Members[] = [];
  rendering: boolean = true;
  dataSourceMat = new MatTableDataSource<StatusMember>(this.statusMember);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  actions: ActionsProps[] = [
    {
      type: 'edit',
      tooltip: 'Editar situação do membro',
      icon: 'edit',
      label: 'Editar',
      action: (statusMember: StatusMember) => this.handleEdit(statusMember),
    },
    {
      type: 'delete',
      tooltip: 'Excluir situação do membro',
      icon: 'delete',
      label: 'Excluir',
      action: (statusMember: StatusMember) => this.handleDelete(statusMember),
    },
  ];

  columnDefinitions = [
    {
      key: 'statusMember.member_situation.name',
      header: 'Situação do membro',
      type: 'string',
    },
    {
      key: 'statusMember.initial_period',
      header: 'Data Inicial',
      type: 'date',
    },
    { key: 'statusMember.final_period', header: 'Data Final', type: 'date' },
  ];

  constructor(
    private confirmeService: ConfirmService,
    private loadingService: LoadingService,
    private toast: ToastService,
    private modalService: ModalService,
    private statusMemberService: StatusMemberService,
    private memberService: MemberService,
    private membersService: MembersService,
  ) {}

  ngOnInit() {
    this.loadStatusMember();
  }

  loadStatusMember = () => {
    this.loadingService.show();
    this.statusMemberService.getStatusMembers().subscribe({
      next: (statusMember) => {
        this.statusMember = statusMember;
        this.dataSourceMat.data = this.statusMember;
        this.dataSourceMat.paginator = this.paginator;
        this.dataSourceMat.sort = this.sort;
        this.rendering = false;
      },
      error: () => this.toast.openError(MESSAGES.LOADING_ERROR),
      complete: () => this.loadingService.hide(),
    });
  };

  handleCreate = () => {
    const defaultMemberId = this.memberService.getEditingMemberId();

    const dialogRef = this.modalService.openModal(
      `modal-${Math.random()}`,
      StatusMemberFormComponent,
      'Adicionar situação no membro',
      true,
      true,
      { statusMember: { member: { id: defaultMemberId } } as StatusMember },
    );

    dialogRef.afterClosed().subscribe((result: StatusMember) => {
      if (result) {
        this.loadStatusMember();
      }
    });
  };

  handleEdit = (statusMember: StatusMember) => {
    const dialogRef = this.modalService.openModal(
      `modal-${Math.random()}`,
      StatusMemberFormComponent,
      'Editando situação no membro',
      true,
      true,
      { statusMember: statusMember, id: statusMember.id },
    );

    dialogRef.afterClosed().subscribe((result: StatusMember) => {
      if (result) {
        this.loadStatusMember();
      }
    });
  };

  handleDelete = (statusMember: StatusMember) => {
    const dialogRef = this.confirmeService.openConfirm(
      'Excluir situação do membro',
      'Tem certeza que deseja excluir essa situação do membro?',
      'Confirmar',
      'Cancelar',
    );

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadingService.show();
        this.statusMemberService.deleteStatusMember(statusMember.id).subscribe({
          next: () => this.toast.openSuccess(MESSAGES.DELETE_SUCCESS),
          error: () => {
            this.loadingService.hide();
            this.toast.openError(MESSAGES.DELETE_ERROR);
          },
          complete: () => {
            this.loadStatusMember();
            this.loadingService.hide();
          },
        });
      }
    });
  };
}
