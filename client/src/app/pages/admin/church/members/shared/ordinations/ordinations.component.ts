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
import { Ordination } from 'app/model/Ordination';
import { MESSAGES } from 'app/utils/messages';
import {
  ActionsProps,
  CrudComponent,
} from '../../../../../../components/crud/crud.component';
import { MemberService } from '../member.service';
import { OrdinationFormComponent } from './ordination-form/ordination-form.component';
import { OrdinationsService } from './ordinations.service';

@Component({
  selector: 'app-ordinations',
  templateUrl: './ordinations.component.html',
  styleUrls: ['./ordinations.component.scss'],
  standalone: true,
  imports: [CommonModule, NotFoundRegisterComponent, CrudComponent],
})
export class OrdinationsComponent implements OnInit {
  @Input() ordination: Ordination[] = [];
  rendering: boolean = true;
  dataSourceMat = new MatTableDataSource<Ordination>(this.ordination);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  actions: ActionsProps[] = [
    {
      type: 'edit',
      tooltip: 'Editar ordinação',
      icon: 'edit',
      label: 'Editar',
      action: (ordination: Ordination) => this.handleEdit(ordination),
    },
    {
      type: 'delete',
      tooltip: 'Excluir ordinação',
      icon: 'delete',
      label: 'Excluir',
      action: (ordination: Ordination) => this.handleDelete(ordination),
    },
  ];

  columnDefinitions = [
    { key: 'status', header: 'Status', type: 'boolean' },
    { key: 'occupation.name', header: 'Ocupação', type: 'string' },
    { key: 'initial_date', header: 'Data Inicial', type: 'date' },
    { key: 'end_date', header: 'Data Final', type: 'date' },
  ];

  constructor(
    private confirmService: ConfirmService,
    private loading: LoadingService,
    private toast: ToastService,
    private modal: ModalService,
    private ordinationService: OrdinationsService,
    private memberService: MemberService,
  ) {}

  ngOnInit() {
    this.loadOrdinations();
  }

  loadOrdinations = () => {
    this.loading.show();
    const memberId = this.memberService.getEditingMemberId();
    this.ordinationService.getOrdinationByMemberId(memberId!).subscribe({
      next: (ordination) => {
        this.ordination = ordination;
        this.dataSourceMat.data = this.ordination;
        this.dataSourceMat.paginator = this.paginator;
        this.dataSourceMat.sort = this.sort;
        this.rendering = false;
      },
      error: () => {
        this.loading.hide();
        this.toast.openError(MESSAGES.LOADING_ERROR);
      },
      complete: () => this.loading.hide(),
    });
  };

  handleCreate = () => {
    const defaultMemberId = this.memberService.getEditingMemberId();

    const dialogRef = this.modal.openModal(
      `modal-${Math.random()}`,
      OrdinationFormComponent,
      'Adicionando ordenação',
      true,
      true,
      {
        ordination: { member: { id: defaultMemberId } } as Ordination,
      },
    );

    dialogRef.afterClosed().subscribe((result: Ordination) => {
      if (result) {
        this.loadOrdinations();
      }
    });
  };

  handleEdit = (ordination: Ordination) => {
    const dialogRef = this.modal.openModal(
      `modal-${Math.random()}`,
      OrdinationFormComponent,
      `Editando a ordenação: ${ordination.occupation?.name}`,
      true,
      true,
      {
        ordination: ordination,
        id: ordination.id,
      },
    );

    dialogRef.afterClosed().subscribe((result: Ordination) => {
      if (result) {
        this.loadOrdinations();
      }
    });
  };

  handleDelete = (ordination: Ordination) => {
    const nameOrdination = `${ordination?.member?.person?.name} | ${ordination?.occupation?.name}`;

    const dialogRef = this.confirmService.openConfirm(
      'Excluir ordenação',
      `Tem certeza que deseja excluir a ordenação: ${nameOrdination}? `,
      'Confirmar',
      'Cancelar',
    );

    dialogRef.afterClosed().subscribe((result: Ordination) => {
      if (result) {
        this.loading.show();
        this.ordinationService.deleteOrdination(ordination.id).subscribe({
          next: () => this.toast.openSuccess(MESSAGES.DELETE_SUCCESS),
          error: () => {
            this.loading.hide();
            this.toast.openError(MESSAGES.DELETE_ERROR);
          },
          complete: () => {
            this.loadOrdinations();
            this.loading.hide();
          },
        });
      }
    });
  };
}
