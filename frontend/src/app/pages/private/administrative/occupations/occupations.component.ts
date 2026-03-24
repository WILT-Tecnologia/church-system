import { Component, inject, OnInit, signal } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';

import { ConfirmService } from 'app/components/confirm/confirm.service';
import { CrudComponent } from 'app/components/crud/crud.component';
import { ActionsProps, ColumnDefinitionsProps } from 'app/components/crud/types';
import { LoadingService } from 'app/components/loading/loading.service';
import { ModalService } from 'app/components/modal/modal.service';
import { MESSAGES } from 'app/components/toast/messages';
import { ToastService } from 'app/components/toast/toast.service';
import { Occupation } from 'app/model/Occupation';
import { AuthService } from 'app/services/auth/auth.service';
import { OccupationComponent } from './occupation/occupation.component';
import { OccupationsService } from './occupations.service';

@Component({
  selector: 'app-occupations',
  templateUrl: './occupations.component.html',
  styleUrls: ['./occupations.component.scss'],
  imports: [CrudComponent],
})
export class OccupationsComponent implements OnInit {
  private toast = inject(ToastService);
  private loading = inject(LoadingService);
  private confirmeService = inject(ConfirmService);
  private modal = inject(ModalService);
  private occupationsService = inject(OccupationsService);
  private authService = inject(AuthService);
  occupations = signal<Occupation[]>([]);
  dataSourceMat = new MatTableDataSource<Occupation>([]);
  writePermission = 'write_administrative_cargos_ministeriais';
  deletePermission = 'delete_administrative_cargos_ministeriais';
  columnDefinitions: ColumnDefinitionsProps[] = [
    { key: 'status', header: 'Situação', type: 'boolean' },
    { key: 'name', header: 'Cargo', type: 'string' },
    { key: 'description', header: 'Descrição', type: 'string' },
    { key: 'updated_at', header: 'Última Atualização', type: 'datetime' },
  ];
  actions: ActionsProps[] = [
    {
      type: 'toggle',
      activeLabel: 'Ativar',
      inactiveLabel: 'Desativar',
      action: (occupation: Occupation) => this.onChangeStatus(occupation),
    },
    {
      type: 'edit',
      icon: 'edit',
      label: 'Editar',
      color: 'inherit',
      action: (occupation: Occupation) => this.onEdit(occupation),
      visible: () => this.authService.hasPermission(this.writePermission),
    },
    {
      type: 'delete',
      icon: 'delete',
      label: 'Excluir',
      color: 'warn',
      action: (occupation: Occupation) => this.onDelete(occupation),
      visible: () => this.authService.hasPermission(this.deletePermission),
    },
  ];

  ngOnInit() {
    this.loadOccupations();
  }

  loadOccupations() {
    this.occupationsService.getOccupations().subscribe({
      next: (occupationsResp) => {
        this.occupations.set(occupationsResp);
        this.dataSourceMat.data = occupationsResp;
      },
      error: () => this.toast.openError(MESSAGES.LOADING_ERROR),
      complete: () => this.loading.hide(),
    });
  }

  onCreate() {
    const modal = this.modal.openModal(
      `modal-${Math.random()}`,
      OccupationComponent,
      'Adicionando um cargo ministerial',
      true,
      true,
    );

    modal.afterClosed().subscribe((newOccupation: Occupation) => {
      if (newOccupation) {
        this.loadOccupations();
      }
    });
  }

  onEdit(occupation: Occupation) {
    const modal = this.modal.openModal(
      `modal-${Math.random()}`,
      OccupationComponent,
      `Editando o cargo ministerial: ${occupation.name}`,
      true,
      true,
      { occupation },
    );

    modal.afterClosed().subscribe((updatedOccupation: Occupation) => {
      if (updatedOccupation) {
        this.loadOccupations();
      }
    });
  }

  onDelete(occupation: Occupation) {
    const modal = this.confirmeService.openConfirm(
      'Atenção',
      `Tem certeza que deseja excluir este cargo ministerial: ${occupation.name}?`,
      'Confirmar',
      'Cancelar',
    );

    modal.afterClosed().subscribe((result) => {
      if (result) {
        this.occupationsService.deleteOccupation(occupation.id).subscribe({
          next: () => this.toast.openSuccess(MESSAGES.DELETE_SUCCESS),
          error: () => this.toast.openError(MESSAGES.DELETE_ERROR),
          complete: () => this.loadOccupations(),
        });
      }
    });
  }
  onChangeStatus(occupation: Occupation) {
    const updatedStatus = !occupation.status;
    occupation.status = updatedStatus;

    this.occupationsService.updatedStatus(occupation.id, updatedStatus).subscribe({
      next: () => {
        this.toast.openSuccess(
          `Cargo ministerial '${occupation.name.toUpperCase()}' ${updatedStatus ? 'ativado' : 'desativado'} com sucesso!`,
        );
      },
      error: () => this.toast.openError(MESSAGES.UPDATE_ERROR),
      complete: () => this.loadOccupations(),
    });
  }
}
