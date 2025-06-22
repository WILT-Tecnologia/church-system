import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
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
import { Ordination } from 'app/model/Ordination';
import { MembersService } from '../../members.service';
import { OrdinationFormComponent } from './ordination-form/ordination-form.component';
import { OrdinationsService } from './ordinations.service';

@Component({
  selector: 'app-ordinations',
  templateUrl: './ordinations.component.html',
  styleUrls: ['./ordinations.component.scss'],
  imports: [CommonModule, NotFoundRegisterComponent, CrudComponent],
})
export class OrdinationsComponent implements OnInit {
  private _ordination: Ordination[] = [];
  @Input() set ordination(value: Ordination[]) {
    this._ordination = value || [];
    this.dataSourceMat.data = this._ordination;
  }
  @Output() ordinationUpdated = new EventEmitter<Ordination[]>();
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
    private membersService: MembersService,
  ) {}

  ngOnInit() {
    this.dataSourceMat.paginator = this.paginator;
    this.dataSourceMat.sort = this.sort;
    this.rendering = false;
  }

  private loadOrdinations = () => {
    this.loading.show();
    const memberId = this.membersService.getEditingMemberId();
    this.ordinationService.getOrdinationByMemberId(memberId!).subscribe({
      next: (ordination) => {
        this.ordination = ordination;
        this.dataSourceMat.data = this.ordination;
        this.dataSourceMat.paginator = this.paginator;
        this.dataSourceMat.sort = this.sort;
        this.rendering = false;
        this.ordinationUpdated.emit(this._ordination);
      },
      error: () => {
        this.loading.hide();
        this.toast.openError(MESSAGES.LOADING_ERROR);
      },
      complete: () => this.loading.hide(),
    });
  };

  handleCreate = () => {
    const defaultMemberId = this.membersService.getEditingMemberId();

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
        this._ordination = [...this._ordination, result];
        this.dataSourceMat.data = this._ordination;
        this.ordinationUpdated.emit(this._ordination);
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
        this._ordination = [...this._ordination, result];
        this.dataSourceMat.data = this._ordination;
        this.ordinationUpdated.emit(this._ordination);
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
          next: () => {
            this._ordination = [...this._ordination, result];
            this.dataSourceMat.data = this._ordination;
            this.ordinationUpdated.emit(this._ordination);
            this.toast.openSuccess(MESSAGES.DELETE_SUCCESS);
          },
          error: () => {
            this.loading.hide();
            this.toast.openError(MESSAGES.DELETE_ERROR);
          },
          complete: () => this.loading.hide(),
        });
      }
    });
  };
}
