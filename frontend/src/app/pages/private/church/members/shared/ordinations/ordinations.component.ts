import { ChangeDetectionStrategy, Component, inject, OnInit, output, signal } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ConfirmService } from '@app/components/confirm/confirm.service';
import { CrudComponent } from '@app/components/crud/crud.component';
import { ActionsProps, ColumnDefinitionsProps } from '@app/components/crud/types';
import { LoadingService } from '@app/components/loading/loading.service';
import { ModalService } from '@app/components/modal/modal.service';
import { MESSAGES } from '@app/components/toast/messages';
import { ToastService } from '@app/components/toast/toast.service';
import { Ordination } from '@app/model/Ordination';
import { MembersService } from '../../members.service';
import { OrdinationFormComponent } from './ordination-form/ordination-form.component';
import { OrdinationsService } from './ordinations.service';

@Component({
  selector: 'app-ordinations',
  templateUrl: './ordinations.component.html',
  styleUrls: ['./ordinations.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CrudComponent],
})
export class OrdinationsComponent implements OnInit {
  private readonly confirmService = inject(ConfirmService);
  private readonly loading = inject(LoadingService);
  private readonly toast = inject(ToastService);
  private readonly modal = inject(ModalService);
  private readonly ordinationService = inject(OrdinationsService);
  private readonly membersService = inject(MembersService);
  public readonly data = inject<{ ordinations: Ordination[]; id: number }>(MAT_DIALOG_DATA);

  public readonly ordinationUpdated = output<Ordination[]>();
  public readonly ordination = signal<Ordination[]>([]);
  public readonly rendering = signal(true);
  public readonly dataSourceMat = new MatTableDataSource<Ordination>([]);

  public readonly columnDefinitions: ColumnDefinitionsProps[] = [
    { key: 'status', header: 'Status', type: 'boolean' },
    { key: 'occupation.name', header: 'Ocupação', type: 'string' },
    { key: 'initial_date', header: 'Data Inicial', type: 'date' },
    { key: 'end_date', header: 'Data Final', type: 'date' },
  ];

  public readonly actions: ActionsProps[] = [
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
      color: 'warn',
      action: (ordination: Ordination) => this.handleDelete(ordination),
    },
  ];

  ngOnInit() {
    this.rendering.set(false);
    this.loadOrdinations();
  }

  private loadOrdinations = () => {
    this.loading.show();
    const memberId = this.membersService.getEditingMemberId();
    if (memberId) {
      this.ordinationService.getOrdinationByMemberId(memberId).subscribe({
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
    } else {
      this.loading.hide();
    }
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

    dialogRef.afterClosed().subscribe((result) => {
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
