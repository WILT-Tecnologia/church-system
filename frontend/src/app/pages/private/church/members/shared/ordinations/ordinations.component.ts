import { Component, EventEmitter, inject, OnInit, Output, signal } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ConfirmService } from 'app/components/confirm/confirm.service';
import { CrudComponent } from 'app/components/crud/crud.component';
import { ActionsProps, ColumnDefinitionsProps } from 'app/components/crud/types';
import { LoadingService } from 'app/components/loading/loading.service';
import { ModalService } from 'app/components/modal/modal.service';
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
  imports: [CrudComponent],
})
export class OrdinationsComponent implements OnInit {
  private confirmService = inject(ConfirmService);
  private loading = inject(LoadingService);
  private toast = inject(ToastService);
  private modal = inject(ModalService);
  private ordinationService = inject(OrdinationsService);
  private membersService = inject(MembersService);
  public data = inject<{ ordinations: Ordination[]; id: number }>(MAT_DIALOG_DATA);
  @Output() ordinationUpdated = new EventEmitter<Ordination[]>();
  ordination = signal<Ordination[]>([]);
  rendering = signal(true);
  dataSourceMat = new MatTableDataSource<Ordination>([]);
  columnDefinitions: ColumnDefinitionsProps[] = [
    { key: 'status', header: 'Status', type: 'boolean' },
    { key: 'occupation.name', header: 'Ocupação', type: 'string' },
    { key: 'initial_date', header: 'Data Inicial', type: 'date' },
    { key: 'end_date', header: 'Data Final', type: 'date' },
  ];
  actions: ActionsProps[] = [
    {
      type: 'edit',
      icon: 'edit',
      label: 'Editar',
      color: 'inherit',
      action: (ordination: Ordination) => this.handleEdit(ordination),
    },
    {
      type: 'delete',
      icon: 'delete',
      label: 'Excluir',
      action: (ordination: Ordination) => this.handleDelete(ordination),
    },
  ];

  ngOnInit() {
    this.rendering.set(false);
    this.loadOrdinations();
  }

  get ordinationData(): Ordination[] {
    return this.ordination();
  }

  private loadOrdinations = () => {
    this.loading.show();
    const memberId = this.membersService.getEditingMemberId();
    this.ordinationService.getOrdinationByMemberId(memberId!).subscribe({
      next: (ordinationResp) => {
        this.ordination.set(ordinationResp);
        this.dataSourceMat.data = ordinationResp;
        this.rendering.set(false);
        this.ordinationUpdated.emit(ordinationResp);
      },
      error: () => {
        this.loading.hide();
        this.toast.openError(MESSAGES.LOADING_ERROR);
      },
      complete: () => this.loading.hide(),
    });
  };

  onCreate = () => {
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
    const dialogRef = this.confirmService.openConfirm(
      'Excluir ordenação',
      `O que será excluído: ${ordination?.occupation?.name}`,
      'Confirmar',
      'Cancelar',
    );

    dialogRef.afterClosed().subscribe((result: Ordination) => {
      if (result) {
        this.loading.show();
        this.ordinationService.deleteOrdination(ordination.id).subscribe({
          next: () => {
            this.toast.openSuccess(MESSAGES.DELETE_SUCCESS);
          },
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
