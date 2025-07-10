import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Inject, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

import { ConfirmService } from 'app/components/confirm/confirm.service';
import { ActionsProps, CrudComponent } from 'app/components/crud/crud.component';
import { LoadingService } from 'app/components/loading/loading.service';
import { ModalService } from 'app/components/modal/modal.service';
import { NotFoundRegisterComponent } from 'app/components/not-found-register/not-found-register.component';
import { MESSAGES } from 'app/components/toast/messages';
import { ToastService } from 'app/components/toast/toast.service';
import { StatusMember } from 'app/model/Members';

import { MembersService } from '../../members.service';
import { StatusMemberFormComponent } from './status-member-form/status-member-form.component';
import { StatusMemberService } from './status-member.service';

@Component({
  selector: 'app-status-member',
  templateUrl: './status-member.component.html',
  styleUrl: './status-member.component.scss',
  imports: [CommonModule, NotFoundRegisterComponent, CrudComponent],
})
export class StatusMemberComponent implements OnInit {
  private _status_member: StatusMember[] = [];
  @Input() set status_member(value: StatusMember | StatusMember[]) {
    if (value) {
      this._status_member = Array.isArray(value) ? value : [value];
      this.dataSourceMat.data = this._status_member;
    } else {
      this._status_member = [];
      this.dataSourceMat.data = [];
    }
  }
  @Output() statusMemberUpdated = new EventEmitter<StatusMember[]>();
  rendering: boolean = true;
  dataSourceMat = new MatTableDataSource<StatusMember>(this._status_member);
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
      color: 'warn',
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
    private membersService: MembersService,
    @Inject(MAT_DIALOG_DATA) public data: { status_member: StatusMember[]; id: number },
  ) {}

  ngOnInit() {
    this.dataSourceMat.paginator = this.paginator;
    this.dataSourceMat.sort = this.sort;
    this.rendering = false;
    this.loadStatusMember();
  }

  isValidStatusMember(): boolean {
    return this._status_member.length > 0;
  }

  get statusMemberFields(): StatusMember[] {
    return this._status_member;
  }

  loadStatusMember() {
    this.loadingService.show();
    const memberId = this.membersService.getEditingMemberId();
    this.statusMemberService.getStatusMemberByMemberId(memberId!).subscribe({
      next: (status_member) => {
        this.status_member = status_member;
        this.rendering = false;
      },
      error: () => {
        this.loadingService.hide();
        this.toast.openError(MESSAGES.LOADING_ERROR);
      },
      complete: () => this.loadingService.hide(),
    });
  }

  handleCreate = () => {
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
        this._status_member = [...this._status_member, result];
        this.dataSourceMat.data = this._status_member;
        this.statusMemberUpdated.emit(this._status_member);
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
        // Atualizar o status_member editado no array
        const index = this._status_member.findIndex((sm) => sm.id === result.id);
        if (index !== -1) {
          this._status_member[index] = result;
          this.dataSourceMat.data = [...this._status_member];
          this.statusMemberUpdated.emit(this._status_member);
        }
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
            this._status_member = this._status_member.filter((sm) => sm.id !== status_member.id);
            this.dataSourceMat.data = this._status_member;
            this.statusMemberUpdated.emit(this._status_member);
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
