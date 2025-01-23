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
import { StatusMember } from 'app/model/Members';
import { MESSAGES } from 'app/utils/messages';
import {
  ActionsProps,
  CrudComponent,
} from '../../../../../../components/crud/crud.component';
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
  @Input() status_member: StatusMember[] = [];
  rendering: boolean = true;
  dataSourceMat = new MatTableDataSource<StatusMember>(this.status_member);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  actions: ActionsProps[] = [
    {
      type: 'edit',
      tooltip: 'Editar situação do membro',
      icon: 'edit',
      label: 'Editar',
      action: (status_member: StatusMember) => this.handleEdit(status_member),
    },
    {
      type: 'delete',
      tooltip: 'Excluir situação do membro',
      icon: 'delete',
      label: 'Excluir',
      action: (status_member: StatusMember) => this.handleDelete(status_member),
    },
  ];

  columnDefinitions = [
    {
      key: 'member_situation.name',
      header: 'Situação do membro',
      type: 'string',
    },
    { key: 'initial_period', header: 'Data Inicial', type: 'date' },
    { key: 'final_period', header: 'Data Final', type: 'date' },
  ];

  constructor(
    private confirmeService: ConfirmService,
    private loadingService: LoadingService,
    private toast: ToastService,
    private modalService: ModalService,
    private statusMemberService: StatusMemberService,
    private memberService: MemberService,
  ) {}

  ngOnInit() {
    this.loadStatusMember();
  }

  loadStatusMember = () => {
    this.loadingService.show();
    const memberId = this.memberService.getEditingMemberId();
    this.statusMemberService.getStatusMemberFromMembers(memberId!).subscribe({
      next: (status_member) => {
        this.status_member = [status_member];
        this.dataSourceMat.data = this.status_member;
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
      'Adicionando situação do membro',
      true,
      true,
      { status_member: { member: defaultMemberId } as StatusMember },
    );

    dialogRef.afterClosed().subscribe((result: StatusMember) => {
      if (result) {
        this.loadStatusMember();
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
        this.loadStatusMember();
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
        this.statusMemberService
          .deleteStatusMember(status_member.id)
          .subscribe({
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
